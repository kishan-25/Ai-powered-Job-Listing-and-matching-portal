import sys
sys.stdout.reconfigure(encoding='utf-8')  # Ensure UTF-8 encoding

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
import time
import pandas as pd
from pymongo import MongoClient
from datetime import datetime, timezone
import urllib.parse
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

# Debug mode - set to True to save HTML and see browser
DEBUG_MODE = True

# Job roles to scrape - Add or remove roles as needed
JOB_ROLES = [
    "Software Engineer",
    # "Full Stack Developer",
    # "Frontend Developer",
    # "Backend Developer",
    # "Data Analyst"
]  # Only testing with 1 role for now - uncomment others once it works

# Setup Chrome options with anti-detection measures
options = webdriver.ChromeOptions()
if not DEBUG_MODE:
    options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)
options.add_argument("--window-size=1920,1080")
options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

# Initialize WebDriver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# Execute script to remove webdriver property
driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

# Connect to MongoDB
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
if not os.getenv('MONGO_URI'):
    print("WARNING: MONGO_URI environment variable not set. Using default local connection.")
    print("To use your MongoDB Atlas cluster, set MONGO_URI in your .env file\n")

client = MongoClient(MONGO_URI)
db = client["test"]
collection = db["instahyre"]  # New collection for Instahyre jobs

# Initialize list for storing all job details
all_jobs_data = []

print("\n" + "="*80)
print(f"Starting Instahyre Scraper for {len(JOB_ROLES)} job roles")
if DEBUG_MODE:
    print("DEBUG MODE: ON - Browser window will be visible")
    print("IMPORTANT: DO NOT close the browser window manually!")
print("="*80 + "\n")

# Helper functions
def safe_extract(element, by, selector, attribute=None):
    """Safely extract text or attribute from an element"""
    try:
        found_element = element.find_element(by, selector)
        if attribute:
            return found_element.get_attribute(attribute) or "N/A"
        return found_element.text.strip() or "N/A"
    except NoSuchElementException:
        return "N/A"
    except Exception as e:
        return "N/A"

def safe_extract_multiple(element, by, selector):
    """Safely extract text from multiple elements"""
    try:
        elements = element.find_elements(by, selector)
        if elements:
            skills_list = [el.text.strip() for el in elements if el.text.strip()]
            return ", ".join(skills_list) if skills_list else "N/A"
        return "N/A"
    except Exception:
        return "N/A"

def extract_company_info(element):
    """Extract company founding year and employee count"""
    try:
        info_elements = element.find_elements(By.CSS_SELECTOR, "[class*='company-info'], [class*='founded'], [class*='employee']")
        info_text = " ".join([el.text.strip() for el in info_elements if el.text.strip()])
        return info_text if info_text else "N/A"
    except:
        return "N/A"

# Loop through each job role
for role_index, job_role in enumerate(JOB_ROLES, 1):
    print(f"\n[{role_index}/{len(JOB_ROLES)}] Searching for: {job_role}")
    print("-" * 80)

    # Build URL with search parameter
    keyword_encoded = urllib.parse.quote(job_role)
    url = f"https://www.instahyre.com/search-jobs/?q={keyword_encoded}"

    try:
        driver.get(url)

        # Wait for page to load
        time.sleep(5)

        # Check if we're still on a valid page
        try:
            current_title = driver.title
            if not current_title or len(current_title) == 0:
                print(f"Warning: Page may not have loaded correctly")
        except:
            print(f"Error: Browser window may have closed")
            continue

        # Scroll to load more content
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
        time.sleep(2)

        # Wait for job listings to load - Try multiple selectors
        try:
            wait = WebDriverWait(driver, 15)
            # Try common Instahyre selectors
            possible_selectors = [
                "div[class*='opportunity-card']",
                "div[class*='job-card']",
                "div[class*='job-listing']",
                "[data-testid*='job']",
                "div.opportunity",
                "article"
            ]

            jobs_loaded = False
            for selector in possible_selectors:
                try:
                    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                    print(f"Job listings loaded successfully using selector: {selector}")
                    jobs_loaded = True
                    break
                except TimeoutException:
                    continue

            if not jobs_loaded:
                print(f"Could not find jobs with standard selectors")

        except TimeoutException:
            print(f"Timeout waiting for job listings for '{job_role}'")

        # If DEBUG_MODE, save the page source
        if DEBUG_MODE:
            debug_file = os.path.join(os.path.dirname(__file__), f"instahyre_debug_{job_role.replace(' ', '_')}.html")
            with open(debug_file, "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            print(f"Page source saved to {debug_file} for inspection\n")

            # Also print page title and URL for debugging
            print(f"Current URL: {driver.current_url}")
            print(f"Page Title: {driver.title}")
            print(f"Page Length: {len(driver.page_source)} characters\n")

            # Pause to let user inspect the browser
            print("=" * 80)
            print("DEBUG MODE: Browser window is open.")
            print("Please inspect the page in the browser window.")
            print("Check if:")
            print("  - The page loaded correctly")
            print("  - You see job listings")
            print("  - You need to login/solve CAPTCHA")
            print("=" * 80)
            input("Press ENTER to continue scraping (DO NOT close the browser window)...")

        # Try multiple selectors to find job listings
        jobs_container = []
        for selector in possible_selectors:
            jobs_container = driver.find_elements(By.CSS_SELECTOR, selector)
            if len(jobs_container) > 0:
                print(f"Found {len(jobs_container)} jobs using selector: {selector}")
                break

        if len(jobs_container) == 0:
            if DEBUG_MODE:
                # Try to find ANY containers that might be job listings
                print("Trying to find any potential job containers...")
                all_divs = driver.find_elements(By.TAG_NAME, "div")
                all_articles = driver.find_elements(By.TAG_NAME, "article")
                all_sections = driver.find_elements(By.TAG_NAME, "section")

                print(f"Total divs: {len(all_divs)}")
                print(f"Total articles: {len(all_articles)}")
                print(f"Total sections: {len(all_sections)}")

                # Look for specific keywords in class names
                keywords = ["job", "opportunity", "card", "listing", "post"]
                for keyword in keywords:
                    elements = driver.find_elements(By.CSS_SELECTOR, f"[class*='{keyword}']")
                    if elements:
                        print(f"Found {len(elements)} elements with class containing '{keyword}'")

            print(f"No jobs found for '{job_role}', skipping...\n")
            continue

        # Extract jobs for this role
        for i, job in enumerate(jobs_container[:20], 1):  # Limit to first 20 jobs
            try:
                # Extract Job Title (try multiple selectors)
                job_title = "N/A"
                title_selectors = ["h2", "h3", "[class*='title']", "[class*='job-title']", "a[class*='title']"]
                for selector in title_selectors:
                    job_title = safe_extract(job, By.CSS_SELECTOR, selector)
                    if job_title != "N/A":
                        break

                # Extract Company Name
                company_name = "N/A"
                company_selectors = [
                    "[class*='company-name']",
                    "[class*='company']",
                    "span.company",
                    "div.company",
                    "p[class*='company']"
                ]
                for selector in company_selectors:
                    company_name = safe_extract(job, By.CSS_SELECTOR, selector)
                    if company_name != "N/A":
                        break

                # Extract Location
                job_location = "N/A"
                location_selectors = [
                    "[class*='location']",
                    "span[class*='location']",
                    "div[class*='location']",
                    "[data-testid*='location']"
                ]
                for selector in location_selectors:
                    job_location = safe_extract(job, By.CSS_SELECTOR, selector)
                    if job_location != "N/A" and "location" in job_location.lower() or len(job_location) > 3:
                        break

                # Extract Company Info (founded year, employee count)
                company_info = extract_company_info(job)

                # Extract Description
                description = "N/A"
                desc_selectors = [
                    "[class*='description']",
                    "p[class*='desc']",
                    "div[class*='description']"
                ]
                for selector in desc_selectors:
                    description = safe_extract(job, By.CSS_SELECTOR, selector)
                    if description != "N/A" and len(description) > 20:
                        break

                # Extract Skills
                skills = "N/A"
                skill_selectors = [
                    "span[class*='skill']",
                    "div[class*='skill']",
                    "[class*='tag']",
                    "span[class*='tag']"
                ]
                for selector in skill_selectors:
                    skills = safe_extract_multiple(job, By.CSS_SELECTOR, selector)
                    if skills != "N/A":
                        break

                # Extract Apply Link
                apply_link = safe_extract(job, By.CSS_SELECTOR, "a", "href")
                if apply_link != "N/A" and not apply_link.startswith("http"):
                    apply_link = "https://www.instahyre.com" + apply_link

                # Only add job if we have at least a title
                if job_title and job_title != "N/A" and len(job_title) > 3:
                    # Store extracted job data
                    job_data = {
                        "title": job_title,
                        "company": company_name,
                        "location": job_location,
                        "companyInfo": company_info,
                        "description": description[:500] if description != "N/A" else "N/A",  # Limit description length
                        "keySkills": skills,
                        "apply_link": apply_link,
                        "source": "Instahyre",
                        "searchedRole": job_role,
                        "createdAt": datetime.now(timezone.utc)
                    }
                    all_jobs_data.append(job_data)

                    # Print job details
                    print(f"  {i}. {job_title} at {company_name}")
                    print(f"     {job_location}")
                    print(f"     Skills: {skills[:60]}..." if len(skills) > 60 else f"     Skills: {skills}")
                else:
                    print(f"  Skipping job {i}: Invalid or missing title")

            except Exception as e:
                print(f"  Error extracting job {i}: {str(e)}")

        print(f"\nCompleted scraping '{job_role}' - Collected {sum(1 for job in all_jobs_data if job.get('searchedRole') == job_role)} jobs")

    except Exception as e:
        print(f"Error scraping {job_role}: {str(e)}")
        continue

    # Add delay between roles to avoid rate limiting
    time.sleep(3)

# Close WebDriver
driver.quit()

# Summary and save to MongoDB
print("\n" + "="*80)
print("SCRAPING SUMMARY")
print("="*80)
print(f"Total Jobs Scraped: {len(all_jobs_data)}")
print("\nBreakdown by Role:")
for role in JOB_ROLES:
    count = sum(1 for job in all_jobs_data if job.get('searchedRole') == role)
    print(f"  - {role}: {count} jobs")

# Save job postings to MongoDB
if all_jobs_data:
    try:
        result = collection.insert_many(all_jobs_data)
        print(f"\n✓ {len(result.inserted_ids)} job records saved to MongoDB successfully!")
    except Exception as e:
        print(f"\n✗ Error saving to MongoDB: {str(e)}")
else:
    print("\n⚠ No jobs found, nothing inserted into MongoDB.")

print("="*80 + "\n")
