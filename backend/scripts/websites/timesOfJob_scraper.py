import sys
import os
import time
import urllib.parse
from datetime import datetime, timezone
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

sys.stdout.reconfigure(encoding="utf-8")

# Add scripts/ to path so scraper_utils is importable from any working directory
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from scraper_utils import get_collection, generate_job_hash, bulk_upsert_jobs, filter_jobs

JOB_ROLES = [
    "Software Engineer",
    "Full Stack Engineer",
    "Frontend Engineer",
    "Backend Engineer",
]

# ── Chrome setup ──────────────────────────────────────────────────────────────
options = webdriver.ChromeOptions()
options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--ignore-certificate-errors")
options.add_argument("--window-size=1920,1080")
options.add_argument(
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

collection = get_collection("timesjob")
all_jobs_data = []

# ── Helpers ───────────────────────────────────────────────────────────────────

def safe_extract(element, by, selector, attribute=None):
    try:
        found = element.find_element(by, selector)
        return (found.get_attribute(attribute) if attribute else found.text.strip()) or "N/A"
    except (NoSuchElementException, Exception):
        return "N/A"


def safe_extract_multiple(element, by, selector):
    try:
        elements = element.find_elements(by, selector)
        skills = [el.text.strip() for el in elements if el.text.strip() and not el.text.strip().startswith("+")]
        return ", ".join(skills) if skills else "N/A"
    except Exception:
        return "N/A"


def validate_selectors(page_source: str) -> bool:
    """Warn if expected TimesJobs markers are absent — signals a site redesign."""
    markers = ["srp-card", "skill-tag"]
    missing = [m for m in markers if m not in page_source]
    if missing:
        print(f"  ⚠ WARNING: Expected CSS markers not found in page: {missing}")
        print("    TimesJobs may have updated their layout. Selectors need review.")
        return False
    return True


# ── Main scrape loop ──────────────────────────────────────────────────────────
print("\n" + "=" * 80)
print(f"Starting TimesJobs Scraper for {len(JOB_ROLES)} job roles")
print("=" * 80 + "\n")

for role_index, job_role in enumerate(JOB_ROLES, 1):
    print(f"\n[{role_index}/{len(JOB_ROLES)}] Searching for: {job_role}")
    print("-" * 80)

    keyword_encoded = urllib.parse.quote(job_role)
    url = (
        f"https://www.timesjobs.com/job-search?searchType=Home_Search&from=submit"
        f"&asKey=OFF&txtKeywords={keyword_encoded}&cboPresFuncArea="
        f"&cboWorkExp1=0&clusterName=CLUSTER_EXP&refreshed=true"
    )

    driver.get(url)
    time.sleep(5)
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
    time.sleep(1)

    # Validate selectors before proceeding
    if not validate_selectors(driver.page_source):
        print(f"  Skipping '{job_role}' — page structure unrecognised.")
        continue

    try:
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.srp-card"))
        )
        print(f"  Job listings loaded for '{job_role}'")
    except TimeoutException:
        print(f"  Timeout waiting for job listings for '{job_role}' — skipping.")
        continue

    jobs_container = driver.find_elements(By.CSS_SELECTOR, "div.srp-card")
    if not jobs_container:
        print(f"  No jobs found for '{job_role}' — skipping.")
        continue

    print(f"  Found {len(jobs_container)} job cards\n")

    for i, job in enumerate(jobs_container, 1):
        try:
            job_title = safe_extract(job, By.TAG_NAME, "h2")
            company_name = safe_extract(job, By.CSS_SELECTOR, ".text-gray-400 span")

            try:
                date_section = job.find_element(By.CSS_SELECTOR, ".text-gray-400")
                full_text = date_section.text
                post_time = full_text.split("Posted on:")[-1].strip() if "Posted on:" in full_text else "N/A"
            except Exception:
                post_time = "N/A"

            try:
                loc_icons = job.find_elements(By.CSS_SELECTOR, ".locations-icon")
                job_location = loc_icons[0].find_element(By.XPATH, "./..").text.strip() if loc_icons else "N/A"
            except Exception:
                job_location = "N/A"

            try:
                yr_icons = job.find_elements(By.CSS_SELECTOR, ".years-icon")
                experience = yr_icons[0].find_element(By.XPATH, "./..").text.strip() if yr_icons else "N/A"
            except Exception:
                experience = "N/A"

            try:
                sal_icons = job.find_elements(By.CSS_SELECTOR, ".salary-icon")
                salary = sal_icons[0].find_element(By.XPATH, "./../..").text.strip() if sal_icons else "Not disclosed"
            except Exception:
                salary = "Not disclosed"

            skills = safe_extract_multiple(job, By.CSS_SELECTOR, ".skill-tag")
            apply_link = safe_extract(job, By.CSS_SELECTOR, "a[target='_blank']", "href")
            if apply_link != "N/A" and not apply_link.startswith("http"):
                apply_link = "https://www.timesjobs.com" + apply_link

            if not job_title or job_title == "N/A":
                print(f"  {i}. [SKIPPED] No title found")
                continue

            job_hash = generate_job_hash(job_title, company_name, job_location)

            job_data = {
                "title": job_title,
                "company": company_name,
                "postingTime": post_time,
                "location": job_location,
                "experience": experience,
                "salary": salary,
                "keySkills": skills,
                "apply_link": apply_link,
                "source": "TimesJobs",
                "searchedRole": job_role,
                "jobHash": job_hash,
                "createdAt": datetime.now(timezone.utc),
            }
            all_jobs_data.append(job_data)

            print(f"  {i}. {job_title} @ {company_name} | {job_location} | {experience}")

        except Exception as e:
            print(f"  {i}. Error: {e}")

    print(f"\n  Collected {sum(1 for j in all_jobs_data if j.get('searchedRole') == job_role)} jobs for '{job_role}'")

driver.quit()

# ── Save to MongoDB ───────────────────────────────────────────────────────────
print("\n" + "=" * 80)
print("SCRAPING COMPLETE")
print("=" * 80)
print(f"Total collected: {len(all_jobs_data)}")

if all_jobs_data:
    print(f"\n🔍  Running quality filter on {len(all_jobs_data)} collected jobs…")
    valid_jobs, rejected = filter_jobs(all_jobs_data, source="web")
    print(f"   ✓ Passed: {len(valid_jobs)}  |  ✗ Rejected: {rejected}")
    if valid_jobs:
        inserted, dupes = bulk_upsert_jobs(collection, valid_jobs)
        print(f"   ✓ Inserted: {inserted} new  |  Duplicates skipped: {dupes}")
else:
    print("⚠ No jobs collected.")

print("=" * 80 + "\n")
