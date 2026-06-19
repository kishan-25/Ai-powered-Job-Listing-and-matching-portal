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

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from scraper_utils import get_collection, generate_job_hash, bulk_upsert_jobs, upload_image_from_url, filter_jobs

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
options.add_argument("--window-size=1920,1080")
options.add_argument(
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

collection = get_collection("hirejobs")
all_jobs_data = []

# ── Helpers ───────────────────────────────────────────────────────────────────

def safe_extract(element, by, selector, attribute=None):
    try:
        found = element.find_element(by, selector)
        return (found.get_attribute(attribute) if attribute else found.text.strip()) or "N/A"
    except (NoSuchElementException, Exception):
        return "N/A"


def safe_extract_by_class(element, class_substring):
    try:
        for div in element.find_elements(By.TAG_NAME, "div"):
            classes = div.get_attribute("class") or ""
            if class_substring in classes:
                text = div.text.strip()
                if text:
                    return text
        return "N/A"
    except Exception:
        return "N/A"


def scrape_logo_url(detail_driver) -> str | None:
    """
    Try multiple selectors to find a company logo on the detail page.
    Returns the raw src URL (to be uploaded to ImageKit), or None.
    """
    logo_selectors = [
        "img[class*='logo']",
        "img[alt*='logo']",
        "img[alt*='Logo']",
        "header img",
        "div[class*='company'] img",
        "div[class*='header'] img",
    ]
    for sel in logo_selectors:
        try:
            imgs = detail_driver.find_elements(By.CSS_SELECTOR, sel)
            for img in imgs:
                src = img.get_attribute("src") or ""
                # Skip tiny icons, data URIs, and SVGs
                if src.startswith("http") and not src.endswith(".svg"):
                    width = img.get_attribute("width") or "0"
                    height = img.get_attribute("height") or "0"
                    # Prefer images that look like logos (reasonable size)
                    if int(width or 0) >= 30 or int(height or 0) >= 30:
                        return src
        except Exception:
            continue
    return None


def extract_job_details(detail_url: str) -> dict:
    try:
        driver.get(detail_url)
        time.sleep(3)
        details = {}

        # Full job description
        try:
            desc_elem = driver.find_element(
                By.XPATH, "//h2[contains(text(), 'Job Description')]/following-sibling::div"
            )
            details["fullDescription"] = desc_elem.text.strip() or "N/A"
        except Exception:
            try:
                paras = driver.find_elements(
                    By.XPATH, "//h2[contains(text(), 'Job Description')]/parent::div//p"
                )
                details["fullDescription"] = "\n\n".join(p.text.strip() for p in paras if p.text.strip()) or "N/A"
            except Exception:
                details["fullDescription"] = "N/A"

        # Required skills
        try:
            skills_sec = driver.find_element(By.XPATH, "//h2[contains(text(), 'Required Skills')]")
            container = skills_sec.find_element(By.XPATH, "./following-sibling::div")
            skills = [s.text.strip() for s in container.find_elements(By.TAG_NAME, "span") if s.text.strip()]
            details["keySkills"] = ", ".join(skills) if skills else "N/A"
        except Exception:
            details["keySkills"] = "N/A"

        # Domain
        try:
            domain_sec = driver.find_element(By.XPATH, "//h2[contains(text(), 'Domain')]")
            container = domain_sec.find_element(By.XPATH, "./following-sibling::div")
            domains = [d.text.strip() for d in container.find_elements(By.TAG_NAME, "span") if d.text.strip()]
            details["domain"] = ", ".join(domains) if domains else "N/A"
        except Exception:
            details["domain"] = "N/A"

        # Company logo — scrape then upload to ImageKit for a permanent CDN URL
        raw_logo_url = scrape_logo_url(driver)
        if raw_logo_url:
            company_slug = detail_url.split("/")[-1][:30]
            cdn_url = upload_image_from_url(raw_logo_url, f"hirejobs_{company_slug}.jpg", folder="company-logos")
            details["companyLogo"] = cdn_url or raw_logo_url  # fall back to scraped URL if upload fails
        else:
            details["companyLogo"] = None

        # Actual apply link (external company career page)
        actual_apply_link = "N/A"
        try:
            all_links = driver.find_elements(By.TAG_NAME, "a")
            for link in all_links:
                href = link.get_attribute("href") or ""
                text = link.text.strip().lower()
                if href and "hirejobs.in" not in href and ("apply" in text or "career" in text):
                    actual_apply_link = href
                    break
        except Exception:
            pass
        details["actualApplyLink"] = actual_apply_link

        return details

    except Exception as e:
        print(f"    Error on detail page: {e}")
        return {
            "fullDescription": "N/A",
            "keySkills": "N/A",
            "domain": "N/A",
            "companyLogo": None,
            "actualApplyLink": "N/A",
        }


# ── Main scrape loop ──────────────────────────────────────────────────────────
print("\n" + "=" * 80)
print(f"Starting HireJobs Scraper for {len(JOB_ROLES)} job roles")
print("=" * 80 + "\n")

for role_index, job_role in enumerate(JOB_ROLES, 1):
    print(f"\n[{role_index}/{len(JOB_ROLES)}] Searching for: {job_role}")
    print("-" * 80)

    keyword_encoded = urllib.parse.quote(job_role)
    url = f"https://www.hirejobs.in/jobs?q={keyword_encoded}"
    driver.get(url)
    time.sleep(5)
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
    time.sleep(1)

    try:
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.bg-card"))
        )
        print(f"  Job listings loaded for '{job_role}'")
    except TimeoutException:
        print(f"  Timeout for '{job_role}' — skipping.")
        continue

    jobs_container = driver.find_elements(By.CSS_SELECTOR, "div.bg-card")
    if not jobs_container:
        print(f"  No jobs found for '{job_role}'")
        continue

    print(f"  Found {len(jobs_container)} cards\n")

    for i, job in enumerate(jobs_container[:20], 1):
        try:
            job_title = safe_extract(job, By.TAG_NAME, "h3")
            company_name = safe_extract_by_class(job, "text-sm font-medium")
            job_location = safe_extract_by_class(job, "text-sm text-gray-600")
            salary = safe_extract_by_class(job, "font-bold sm:text-base") or safe_extract_by_class(job, "font-bold")
            posted_date = safe_extract_by_class(job, "bg-white/80")

            experience = "N/A"
            job_type = "N/A"
            work_mode = "N/A"
            try:
                inline_divs = job.find_elements(By.CSS_SELECTOR, "div.inline-flex.items-center")
                if inline_divs:
                    job_type = inline_divs[0].text.strip() if len(inline_divs) >= 1 else "N/A"
                    work_mode = inline_divs[1].text.strip() if len(inline_divs) >= 2 else "N/A"
                    experience = inline_divs[2].text.strip() if len(inline_divs) >= 3 else "N/A"
            except Exception:
                pass

            apply_link = safe_extract(job, By.TAG_NAME, "a", "href")
            if apply_link != "N/A" and not apply_link.startswith("http"):
                detail_url = "https://www.hirejobs.in" + apply_link
            else:
                detail_url = apply_link

            if not job_title or job_title == "N/A" or detail_url == "N/A":
                print(f"  {i}. [SKIPPED] Missing title or link")
                continue

            job_hash = generate_job_hash(job_title, company_name, job_location)

            print(f"  {i}. {job_title} @ {company_name}")
            job_details = extract_job_details(detail_url)

            driver.back()
            time.sleep(2)

            job_data = {
                "title": job_title,
                "company": company_name,
                "companyLogo": job_details.get("companyLogo"),
                "location": job_location,
                "experience": experience,
                "salary": salary,
                "jobType": job_type,
                "workMode": work_mode,
                "postedDate": posted_date,
                "description": job_details.get("fullDescription", "N/A"),
                "keySkills": job_details.get("keySkills", "N/A"),
                "domain": job_details.get("domain", "N/A"),
                "apply_link": detail_url,
                "actualApplyLink": job_details.get("actualApplyLink", "N/A"),
                "source": "HireJobs",
                "searchedRole": job_role,
                "jobHash": job_hash,
                "createdAt": datetime.now(timezone.utc),
            }
            all_jobs_data.append(job_data)
            print(f"     ✓ Logo: {'✅ CDN' if job_data['companyLogo'] else '❌ None'} | {job_location} | {experience}")

        except Exception as e:
            print(f"  {i}. Error: {e}")
            try:
                driver.get(url)
                time.sleep(2)
            except Exception:
                pass

    role_count = sum(1 for j in all_jobs_data if j.get("searchedRole") == job_role)
    print(f"\n  Collected {role_count} jobs for '{job_role}'")

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
