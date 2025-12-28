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
from pymongo import MongoClient
from datetime import datetime, timezone
import urllib.parse
import hashlib

# Debug mode - set to False for production
DEBUG_MODE = False

# Job roles to scrape
JOB_ROLES = [
    "Software Engineer",
    "Full Stack Engineer",
    "Frontend Engineer",
    "Backend Engineer"
]

# Setup Chrome options
options = webdriver.ChromeOptions()
if not DEBUG_MODE:
    options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--window-size=1920,1080")
options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

# Initialize WebDriver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# Connect to MongoDB
client = MongoClient("mongodb+srv://bkbajpay0609:uv52KtpB09m1maFN@cluster0.xflo7xo.mongodb.net/")
db = client["test"]
collection = db["hirejobs"]

# Initialize list for storing all job details
all_jobs_data = []

print("\n" + "="*80)
print(f"Starting HireJobs Scraper for {len(JOB_ROLES)} job roles")
print("="*80 + "\n")

# Helper functions
def safe_extract(element, by, selector, attribute=None):
    """Safely extract text or attribute from an element"""
    try:
        found_element = element.find_element(by, selector)
        if attribute:
            return found_element.get_attribute(attribute) or "N/A"
        return found_element.text.strip() or "N/A"
    except (NoSuchElementException, Exception):
        return "N/A"

def safe_extract_by_class(element, class_substring):
    """Extract text from div containing specific class"""
    try:
        divs = element.find_elements(By.TAG_NAME, "div")
        for div in divs:
            classes = div.get_attribute("class") or ""
            if class_substring in classes:
                text = div.text.strip()
                if text:
                    return text
        return "N/A"
    except Exception:
        return "N/A"

def generate_job_hash(title, company, location):
    """Generate unique hash for job to detect duplicates"""
    job_string = f"{title.lower()}_{company.lower()}_{location.lower()}"
    return hashlib.md5(job_string.encode()).hexdigest()

def is_duplicate(job_hash):
    """Check if job already exists in database"""
    return collection.find_one({"jobHash": job_hash}) is not None

def extract_job_details(detail_url):
    """Navigate to job detail page and extract full information"""
    try:
        driver.get(detail_url)
        time.sleep(3)

        details = {}

        # Extract full job description - Try multiple approaches
        try:
            # First try: Look for Job Description heading and get all text after it
            description_elem = driver.find_element(By.XPATH, "//h2[contains(text(), 'Job Description')]/following-sibling::div")
            full_desc = description_elem.text.strip()
            details['fullDescription'] = full_desc if full_desc else "N/A"
        except:
            try:
                # Fallback: Get all paragraph text in the description section
                desc_paragraphs = driver.find_elements(By.XPATH, "//h2[contains(text(), 'Job Description')]/parent::div//p")
                full_desc = "\n\n".join([p.text.strip() for p in desc_paragraphs if p.text.strip()])
                details['fullDescription'] = full_desc if full_desc else "N/A"
            except:
                details['fullDescription'] = "N/A"

        # Extract required skills
        try:
            skills_section = driver.find_element(By.XPATH, "//h2[contains(text(), 'Required Skills')]")
            skills_container = skills_section.find_element(By.XPATH, "./following-sibling::div")
            skill_tags = skills_container.find_elements(By.TAG_NAME, "span")
            skills = [skill.text.strip() for skill in skill_tags if skill.text.strip()]
            details['keySkills'] = ", ".join(skills) if skills else "N/A"
        except:
            details['keySkills'] = "N/A"

        # Extract domain if available
        try:
            domain_section = driver.find_element(By.XPATH, "//h2[contains(text(), 'Domain')]")
            domain_container = domain_section.find_element(By.XPATH, "./following-sibling::div")
            domain_tags = domain_container.find_elements(By.TAG_NAME, "span")
            domains = [d.text.strip() for d in domain_tags if d.text.strip()]
            details['domain'] = ", ".join(domains) if domains else "N/A"
        except:
            details['domain'] = "N/A"

        # Extract company logo
        logo_url = "N/A"
        try:
            # Try to find logo in the header section
            logo_elem = driver.find_element(By.CSS_SELECTOR, "img[alt*='logo'], img[src*='logo']")
            logo_url = logo_elem.get_attribute('src')
        except:
            # Try alternative selector for company image
            try:
                company_img = driver.find_element(By.CSS_SELECTOR, "div[class*='rounded'] img")
                logo_url = company_img.get_attribute('src')
            except:
                pass

        # Extract ACTUAL Apply Now link (company career page)
        actual_apply_link = "N/A"
        try:
            # Look for "Apply Now" button - it should have an external link
            apply_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Apply Now')]")
            if apply_buttons:
                # Check parent anchor tag
                for btn in apply_buttons:
                    try:
                        parent_link = btn.find_element(By.XPATH, "./ancestor::a")
                        href = parent_link.get_attribute('href')
                        if href and 'hirejobs.in' not in href:
                            actual_apply_link = href
                            break
                    except:
                        pass

            # If not found, try finding any external link near "Apply Now"
            if actual_apply_link == "N/A":
                try:
                    # Look for links that are NOT hirejobs.in
                    all_links = driver.find_elements(By.TAG_NAME, "a")
                    for link in all_links:
                        link_text = link.text.strip().lower()
                        href = link.get_attribute('href')
                        if href and ('apply' in link_text or 'career' in link_text) and 'hirejobs.in' not in href:
                            actual_apply_link = href
                            break
                except:
                    pass
        except:
            pass

        # Store logo URL directly (ImageKit upload removed)
        details['companyLogo'] = logo_url
        details['actualApplyLink'] = actual_apply_link

        return details
    except Exception as e:
        print(f"    Error extracting detail page: {str(e)}")
        return {
            'fullDescription': "N/A",
            'keySkills': "N/A",
            'domain': "N/A",
            'companyLogo': "N/A",
            'actualApplyLink': "N/A"
        }

# Loop through each job role
for role_index, job_role in enumerate(JOB_ROLES, 1):
    print(f"\n[{role_index}/{len(JOB_ROLES)}] Searching for: {job_role}")
    print("-" * 80)

    # Build URL with search parameter
    keyword_encoded = urllib.parse.quote(job_role)
    url = f"https://www.hirejobs.in/jobs?q={keyword_encoded}"

    driver.get(url)

    # Allow time for page to load and JavaScript to execute
    time.sleep(5)

    # Scroll to load more jobs
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
    time.sleep(1)

    # Wait for job cards to load - HireJobs uses bg-card class
    try:
        wait = WebDriverWait(driver, 15)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "div.bg-card")))
        print(f"Job listings loaded successfully for '{job_role}'")
    except TimeoutException:
        print(f"Timeout waiting for job listings for '{job_role}'")

    # Locate job cards - HireJobs structure
    jobs_container = driver.find_elements(By.CSS_SELECTOR, 'div.bg-card')

    if len(jobs_container) == 0:
        print(f"No jobs found for '{job_role}', skipping...\n")
        continue

    print(f"Found {len(jobs_container)} jobs for '{job_role}'\n")

    # Extract jobs for this role
    for i, job in enumerate(jobs_container[:20], 1):  # Limit to 20 jobs per role
        try:
            # Extract Job Title (h3 tag)
            job_title = safe_extract(job, By.TAG_NAME, "h3")

            # Extract Company Name (div with class "text-sm font-medium")
            company_name = safe_extract_by_class(job, "text-sm font-medium")

            # Extract Location (div with class "text-sm text-gray-600")
            job_location = safe_extract_by_class(job, "text-sm text-gray-600")

            # Generate hash for duplicate detection
            job_hash = generate_job_hash(job_title, company_name, job_location)

            # Check for duplicates
            if is_duplicate(job_hash):
                print(f"  {i}. [DUPLICATE SKIPPED] {job_title} at {company_name}")
                continue

            # Extract Salary (div with class "font-bold")
            salary = safe_extract_by_class(job, "font-bold sm:text-base")
            if salary == "N/A":
                salary = safe_extract_by_class(job, "font-bold")

            # Extract Experience from inline-flex divs
            experience = "N/A"
            try:
                inline_divs = job.find_elements(By.CSS_SELECTOR, "div.inline-flex.items-center")
                if len(inline_divs) >= 3:
                    experience = inline_divs[2].text.strip()
                elif len(inline_divs) > 0:
                    for div in inline_divs:
                        text = div.text.strip()
                        if "year" in text.lower() or "level" in text.lower():
                            experience = text
                            break
            except Exception:
                pass

            # Extract Job Type and Work Mode
            job_type = "N/A"
            work_mode = "N/A"
            try:
                inline_divs = job.find_elements(By.CSS_SELECTOR, "div.inline-flex.items-center")
                if len(inline_divs) >= 1:
                    job_type = inline_divs[0].text.strip()
                if len(inline_divs) >= 2:
                    work_mode = inline_divs[1].text.strip()
            except Exception:
                pass

            # Extract Posted Date
            posted_date = safe_extract_by_class(job, "bg-white/80")

            # Extract Apply Link
            apply_link = safe_extract(job, By.TAG_NAME, "a", "href")
            if apply_link != "N/A" and not apply_link.startswith("http"):
                detail_url = "https://www.hirejobs.in" + apply_link
            else:
                detail_url = apply_link

            # Skip job if we don't have valid data
            if not job_title or job_title == "N/A" or not detail_url or detail_url == "N/A":
                print(f"  {i}. [SKIPPED] Missing title or link - Title: {job_title}, Company: {company_name}")
                continue

            # Navigate to detail page to get full description and skills
            print(f"  {i}. Extracting: {job_title} at {company_name}")
            job_details = extract_job_details(detail_url)

            # Go back to main listing page
            driver.back()
            time.sleep(2)

            # Only add job if we have at least a title
            if job_title and job_title != "N/A":
                # Store extracted job data
                job_data = {
                    "title": job_title,
                    "company": company_name,
                    "companyLogo": job_details.get('companyLogo', 'N/A'),
                    "location": job_location,
                    "experience": experience,
                    "salary": salary,
                    "jobType": job_type,
                    "workMode": work_mode,
                    "postedDate": posted_date,
                    "description": job_details.get('fullDescription', 'N/A'),
                    "keySkills": job_details.get('keySkills', 'N/A'),
                    "domain": job_details.get('domain', 'N/A'),
                    "apply_link": detail_url,
                    "actualApplyLink": job_details.get('actualApplyLink', 'N/A'),
                    "source": "HireJobs",
                    "searchedRole": job_role,
                    "jobHash": job_hash,
                    "createdAt": datetime.now(timezone.utc)
                }
                all_jobs_data.append(job_data)

                print(f"     ✓ {job_location} | {experience} | {salary}")
                print(f"     Skills: {job_details.get('keySkills', 'N/A')[:60]}...")
            else:
                print(f"  Skipping job {i}: No title found")

        except Exception as e:
            print(f"  Error extracting job {i}: {str(e)}")
            # Go back to main page if error occurred during detail extraction
            try:
                driver.get(url)
                time.sleep(2)
            except:
                pass

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
