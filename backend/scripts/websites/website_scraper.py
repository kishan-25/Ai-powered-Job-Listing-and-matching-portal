import sys
sys.stdout.reconfigure(encoding='utf-8')  # Ensure UTF-8 encoding

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import pandas as pd
from pymongo import MongoClient
import datetime

# Setup Chrome options
options = webdriver.ChromeOptions()
options.add_argument("--headless")  # Run in background
options.add_argument("--disable-gpu")  
options.add_argument("--no-sandbox")  
options.add_argument("--disable-dev-shm-usage")  
options.add_argument("--ignore-certificate-errors")  

# Initialize WebDriver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# Connect to MongoDB
client = MongoClient("mongodb+srv://bkbajpay0609:uv52KtpB09m1maFN@cluster0.xflo7xo.mongodb.net/")
db = client["test"]  # Database name
collection = db["timesjob"]  # Changed to match Mongoose model's default collection

# Open TimesJobs search results page
url = "https://m.timesjobs.com/mobile/jobs-search-result.html?txtKeywords=Front+End+Developer%2C&cboWorkExp1=-1&txtLocation="
driver.get(url)

# Allow time for page to load
time.sleep(5)

# Locate job listings
jobs_container = driver.find_elements(By.XPATH, '//ul[@class="ui-content search-result"]/li')

# Initialize list for storing job details
jobs_data = []

print("\n **Extracted Job Listings**:\n")

for i, job in enumerate(jobs_container, 1):
    try:
        # Extract Job Title
        title_element = job.find_element(By.CLASS_NAME, "srp-job-heading")
        job_title = title_element.text.strip()

        # Extract Company Name
        company_element = job.find_element(By.CLASS_NAME, "srp-comp-name")
        company_name = company_element.text.strip() if company_element else "N/A"

        # Extract Posting Time
        post_time_element = job.find_element(By.CLASS_NAME, "posting-time")
        post_time = post_time_element.text.strip() if post_time_element else "N/A"

        # Extract Location
        location_element = job.find_element(By.CLASS_NAME, "srp-loc")
        job_location = location_element.text.strip() if location_element else "N/A"

        # Extract Experience
        experience_element = job.find_element(By.CLASS_NAME, "srp-exp")
        experience = experience_element.text.strip() if experience_element else "N/A"

        # Extract Salary
        salary_element = job.find_element(By.CLASS_NAME, "srp-sal")
        salary = salary_element.text.strip() if salary_element else "N/A"

        # Extract Key Skills
        skills_elements = job.find_elements(By.CLASS_NAME, "srphglt")
        skills = ", ".join([skill.text.strip() for skill in skills_elements]) if skills_elements else "N/A"

        # Extract Apply Link
        apply_element = job.find_element(By.CLASS_NAME, "ui-link")
        apply_link = apply_element.get_attribute("href") if apply_element else "N/A"

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
            "createdAt": datetime.datetime.utcnow()
        }
        jobs_data.append(job_data)

        # Print job details
        print(f"{i}. {job_title} at {company_name}")
        print(f"   {job_location} | {experience} experience | {salary}")
        print(f"   Key Skills: {skills}")
        print(f"   Apply Here: {apply_link}")
        print(f"   Posted: {post_time}\n")

    except Exception as e:
        print(f"Error extracting job {i}: {str(e)}\n")

# Save job postings to MongoDB
if jobs_data:
    result = collection.insert_many(jobs_data)
    print(f"\n {len(result.inserted_ids)} job records saved to MongoDB (scrapjobs collection)\n")
else:
    print("\n⚠ No jobs found, nothing inserted into MongoDB.\n")

# Close WebDriver
driver.quit()