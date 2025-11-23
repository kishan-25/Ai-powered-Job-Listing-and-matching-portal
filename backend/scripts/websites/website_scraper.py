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

# Debug mode - set to True to save HTML and see browser
DEBUG_MODE = False

# Job roles to scrape - Add or remove roles as needed
JOB_ROLES = [
    "Software Engineer",
    "Full Stack Engineer",
    "Frontend Engineer",
    "Backend Engineer"
]

# Setup Chrome options
options = webdriver.ChromeOptions()
if not DEBUG_MODE:
    options.add_argument("--headless")  # Run in background
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--ignore-certificate-errors")
options.add_argument("--window-size=1920,1080")  # Set window size
options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")  

# Initialize WebDriver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# Connect to MongoDB
client = MongoClient("mongodb+srv://bkbajpay0609:uv52KtpB09m1maFN@cluster0.xflo7xo.mongodb.net/")
db = client["test"]  # Database name
collection = db["timesjob"]  # Changed to match Mongoose model's default collection

# Initialize list for storing all job details
all_jobs_data = []

print("\n" + "="*80)
print(f"Starting TimesJobs Scraper for {len(JOB_ROLES)} job roles")
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
            # Filter out the "+N more" skill tags
            skills_list = [el.text.strip() for el in elements if el.text.strip() and not el.text.strip().startswith('+')]
            return ", ".join(skills_list) if skills_list else "N/A"
        return "N/A"
    except Exception:
        return "N/A"

# Loop through each job role
for role_index, job_role in enumerate(JOB_ROLES, 1):
    print(f"\n[{role_index}/{len(JOB_ROLES)}] Searching for: {job_role}")
    print("-" * 80)

    # Build URL with keyword parameter
    keyword_encoded = urllib.parse.quote(job_role)
    url = f"https://www.timesjobs.com/job-search?searchType=Home_Search&from=submit&asKey=OFF&txtKeywords={keyword_encoded}&cboPresFuncArea=&cboWorkExp1=0&clusterName=CLUSTER_EXP&refreshed=true"

    driver.get(url)

    # Allow time for page to load and JavaScript to execute
    time.sleep(5)

    # Scroll down to load more jobs (if page uses lazy loading)
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
    time.sleep(1)

    # Wait for job listings to load (new Tailwind CSS structure)
    try:
        wait = WebDriverWait(driver, 15)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "div.srp-card")))
        print(f"Job listings loaded successfully for '{job_role}'")
    except TimeoutException:
        print(f"Timeout waiting for job listings for '{job_role}'")
        print("Trying alternative selectors...")

    # If DEBUG_MODE, save the page source for inspection
    if DEBUG_MODE:
        debug_file = os.path.join(os.path.dirname(__file__), f"timesjobs_debug_{job_role.replace(' ', '_')}.html")
        with open(debug_file, "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print(f"Page source saved to {debug_file} for inspection\n")

    # Locate job listings - Modern Tailwind CSS structure
    jobs_container = driver.find_elements(By.CSS_SELECTOR, 'div.srp-card')

    if len(jobs_container) == 0:
        print(f"No jobs found for '{job_role}', skipping...\n")
        continue

    print(f"Found {len(jobs_container)} jobs for '{job_role}'\n")

    # Extract jobs for this role
    for i, job in enumerate(jobs_container, 1):
        try:
            # Extract Job Title (Tailwind CSS structure: h2 inside srp-card)
            job_title = safe_extract(job, By.TAG_NAME, "h2")

            # Extract Company Name (first span in .text-gray-400 section)
            company_name = safe_extract(job, By.CSS_SELECTOR, ".text-gray-400 span")

            # Extract Posting Time/Date (text after "Posted on:" in .text-gray-400)
            try:
                date_section = job.find_element(By.CSS_SELECTOR, ".text-gray-400")
                full_text = date_section.text
                if "Posted on:" in full_text:
                    post_time = full_text.split("Posted on:")[-1].strip()
                else:
                    post_time = "N/A"
            except:
                post_time = "N/A"

            # Extract Location (text near .locations-icon)
            try:
                location_spans = job.find_elements(By.CSS_SELECTOR, ".locations-icon")
                if location_spans:
                    # Get parent span that contains location text
                    location_parent = location_spans[0].find_element(By.XPATH, "./..")
                    job_location = location_parent.text.strip()
                else:
                    job_location = "N/A"
            except:
                job_location = "N/A"

            # Extract Experience (text near .years-icon)
            try:
                years_icons = job.find_elements(By.CSS_SELECTOR, ".years-icon")
                if years_icons:
                    years_parent = years_icons[0].find_element(By.XPATH, "./..")
                    experience = years_parent.text.strip()
                else:
                    experience = "N/A"
            except:
                experience = "N/A"

            # Extract Salary (text near .salary-icon)
            try:
                salary_icons = job.find_elements(By.CSS_SELECTOR, ".salary-icon")
                if salary_icons:
                    salary_parent = salary_icons[0].find_element(By.XPATH, "./../..")
                    salary = salary_parent.text.strip()
                else:
                    salary = "Not disclosed"
            except:
                salary = "Not disclosed"

            # Extract Key Skills (.skill-tag spans)
            skills = safe_extract_multiple(job, By.CSS_SELECTOR, ".skill-tag")

            # Extract Apply Link (full-card overlay link)
            apply_link = safe_extract(job, By.CSS_SELECTOR, "a[target='_blank']", "href")

            # Make sure apply_link is a full URL
            if apply_link != "N/A" and not apply_link.startswith("http"):
                apply_link = "https://www.timesjobs.com" + apply_link

            # Only add job if we have at least a title
            if job_title and job_title != "N/A":
                # Store extracted job data
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
                    "searchedRole": job_role,  # Track which role this was searched for
                    "createdAt": datetime.now(timezone.utc)
                }
                all_jobs_data.append(job_data)

                # Print job details
                print(f"  {i}. {job_title} at {company_name}")
                print(f"     {job_location} | {experience} experience | {salary}")
                print(f"     Skills: {skills[:60]}..." if len(skills) > 60 else f"     Skills: {skills}")
                print(f"     Apply: {apply_link}")
            else:
                print(f"  Skipping job {i}: No title found")

        except Exception as e:
            print(f"  Error extracting job {i}: {str(e)}")

    print(f"\nCompleted scraping '{job_role}' - Collected {sum(1 for job in all_jobs_data if job.get('searchedRole') == job_role)} jobs")

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
    result = collection.insert_many(all_jobs_data)
    print(f"\n✓ {len(result.inserted_ids)} job records saved to MongoDB successfully!")
else:
    print("\n⚠ No jobs found, nothing inserted into MongoDB.")

print("="*80 + "\n")