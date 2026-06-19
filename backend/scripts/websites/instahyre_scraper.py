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
from scraper_utils import get_collection, generate_job_hash, bulk_upsert_jobs, filter_jobs
from job_roles import JOB_ROLES

# DEBUG_MODE: set True only for local development to see the browser window
DEBUG_MODE = False

# ── Chrome setup ──────────────────────────────────────────────────────────────
options = webdriver.ChromeOptions()
if not DEBUG_MODE:
    options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option("useAutomationExtension", False)
options.add_argument("--window-size=1920,1080")
options.add_argument(
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

collection = get_collection("instahyre")
all_jobs_data = []

# Ordered from most to least specific — Instahyre's selectors change; update here if needed
JOB_CARD_SELECTORS = [
    "div[class*='opportunity-card']",
    "div[class*='job-card']",
    "div[class*='job-listing']",
    "div[class*='opportunity']",
    "[data-testid*='job']",
    "article",
]

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
        values = [el.text.strip() for el in elements if el.text.strip()]
        return ", ".join(values) if values else "N/A"
    except Exception:
        return "N/A"


def find_job_cards():
    """Try each known selector and return the first non-empty result."""
    for sel in JOB_CARD_SELECTORS:
        cards = driver.find_elements(By.CSS_SELECTOR, sel)
        if cards:
            print(f"  Found {len(cards)} cards using selector: {sel}")
            return cards
    return []


# ── Main scrape loop ──────────────────────────────────────────────────────────
print("\n" + "=" * 80)
print(f"Starting Instahyre Scraper for {len(JOB_ROLES)} job roles")
print("=" * 80 + "\n")

for role_index, job_role in enumerate(JOB_ROLES, 1):
    print(f"\n[{role_index}/{len(JOB_ROLES)}] Searching for: {job_role}")
    print("-" * 80)

    keyword_encoded = urllib.parse.quote(job_role)
    url = f"https://www.instahyre.com/search-jobs/?q={keyword_encoded}"

    try:
        driver.get(url)
        time.sleep(5)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
        time.sleep(2)

        # Wait for any known card selector
        loaded = False
        for sel in JOB_CARD_SELECTORS:
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, sel))
                )
                loaded = True
                break
            except TimeoutException:
                continue

        if not loaded:
            print(f"  No job listings detected for '{job_role}' (Instahyre may require login or block bots).")
            print(f"  Page title: {driver.title}  |  URL: {driver.current_url}")
            continue

        jobs_container = find_job_cards()
        if not jobs_container:
            print(f"  No cards found for '{job_role}' — skipping.")
            continue

        for i, job in enumerate(jobs_container[:20], 1):
            try:
                job_title = "N/A"
                for sel in ["h2", "h3", "[class*='title']", "a[class*='title']"]:
                    job_title = safe_extract(job, By.CSS_SELECTOR, sel)
                    if job_title != "N/A":
                        break

                company_name = "N/A"
                for sel in ["[class*='company-name']", "[class*='company']", "span.company"]:
                    company_name = safe_extract(job, By.CSS_SELECTOR, sel)
                    if company_name != "N/A":
                        break

                job_location = "N/A"
                for sel in ["[class*='location']", "span[class*='location']", "div[class*='location']"]:
                    job_location = safe_extract(job, By.CSS_SELECTOR, sel)
                    if job_location != "N/A" and len(job_location) > 2:
                        break

                description = "N/A"
                for sel in ["[class*='description']", "div[class*='description']", "p[class*='desc']"]:
                    description = safe_extract(job, By.CSS_SELECTOR, sel)
                    if description != "N/A" and len(description) > 20:
                        break

                skills = "N/A"
                for sel in ["span[class*='skill']", "div[class*='skill']", "[class*='tag']"]:
                    skills = safe_extract_multiple(job, By.CSS_SELECTOR, sel)
                    if skills != "N/A":
                        break

                apply_link = safe_extract(job, By.CSS_SELECTOR, "a", "href")
                if apply_link != "N/A" and not apply_link.startswith("http"):
                    apply_link = "https://www.instahyre.com" + apply_link

                if not job_title or job_title == "N/A" or len(job_title) <= 3:
                    print(f"  {i}. [SKIPPED] No valid title")
                    continue

                job_hash = generate_job_hash(job_title, company_name, job_location)

                job_data = {
                    "title": job_title,
                    "company": company_name,
                    "location": job_location,
                    "description": description[:500] if description != "N/A" else "N/A",
                    "keySkills": skills,
                    "apply_link": apply_link,
                    "source": "Instahyre",
                    "searchedRole": job_role,
                    "jobHash": job_hash,
                    "createdAt": datetime.now(timezone.utc),
                }
                all_jobs_data.append(job_data)
                print(f"  {i}. {job_title} @ {company_name} | {job_location}")

            except Exception as e:
                print(f"  {i}. Error: {e}")

        role_count = sum(1 for j in all_jobs_data if j.get("searchedRole") == job_role)
        print(f"\n  Collected {role_count} jobs for '{job_role}'")

    except Exception as e:
        print(f"  Fatal error for '{job_role}': {e}")
        continue

    time.sleep(3)

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
    print("⚠ No jobs collected — Instahyre may be blocking automated access.")

print("=" * 80 + "\n")
