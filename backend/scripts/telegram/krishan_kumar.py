from telethon.sync import TelegramClient
import datetime
import configparser
import os
import re
from pymongo import MongoClient
import sys

# Get absolute paths
script_dir = os.path.dirname(os.path.abspath(__file__))
config_path = os.path.join(script_dir, "telethon.config")

# Check if config file exists
if not os.path.exists(config_path):
    print(f" Config file not found at: {config_path}")
    sys.exit(1)

try:
    # Load API credentials from config file
    config = configparser.ConfigParser()
    config.read(config_path)

    api_id = config["telethon_credentials"]["api_id"]
    api_hash = config["telethon_credentials"]["api_hash"]
    
    print(f" Successfully loaded API credentials")
except Exception as e:
    print(f" Error loading config: {str(e)}")
    sys.exit(1)

# Define chat/group name
chats = ["jobs_and_internships_updates"]  # List of channels/groups to scrape

# Output directories
save_dir = os.path.join(script_dir, "images")
os.makedirs(save_dir, exist_ok=True)

def parse_job_details(text):
    """Parse job details from message text with improved pattern matching for various formats"""
    # Initialize job details with default values
    job_details = {
        "title": None,
        "company": None,
        "position": None,
        "role": None,
        "qualifications": None,
        "salary": None,
        "batch": None,
        "experience": None,
        "location": None,
        "apply_link": None,
        "whatsapp_link": None,
        "telegram_link": None,
        "posted_by": None
    }
    
    if not text:
        return job_details
    
    # Split text into lines for easier processing
    lines = text.strip().split('\n')
    
    # Check for different header formats - using case insensitive pattern matching
    header_patterns = [
        r'Jobs\s*\|\s*Internships\s*\|\s*Placement\s*\|\s*Interviews',
        r'.*\s*-\s*Jobs\s*&\s*Internships\s*Updates'
    ]
    
    # Check for headers and extract poster name
    for pattern in header_patterns:
        header_match = re.search(pattern, text, re.IGNORECASE)
        if header_match:
            header_line = header_match.group(0).strip()
            # Check if there's a name in the header (like "Krishan Kumar - Jobs & Internships Updates")
            name_match = re.search(r'^(.*?)\s*-\s*Jobs', header_line, re.IGNORECASE)
            if name_match:
                job_details["posted_by"] = name_match.group(1).strip()
            break
    
    # Process each line to extract labeled fields
    for i, line in enumerate(lines):
        line = line.strip()
        
        # Skip empty lines
        if not line:
            continue
        
        # Extract labeled fields with colon format - case insensitive
        if ":" in line:
            parts = line.split(":", 1)
            if len(parts) == 2:
                label = parts[0].strip().lower()  # Convert to lowercase for case-insensitive matching
                value = parts[1].strip()
                
                # Case-insensitive matching for all field labels
                if any(keyword in label for keyword in ["company", "Company name"]):
                    job_details["company"] = value
                elif "position" in label:
                    job_details["position"] = value
                elif "role" in label:
                    job_details["role"] = value
                elif any(keyword in label for keyword in ["qualifications", "qualification"]):
                    job_details["qualifications"] = value
                elif "salary" in label:
                    job_details["salary"] = value
                elif any(keyword in label for keyword in ["batch", "batch eligible"]):
                    job_details["batch"] = value
                elif "experience" in label:
                    job_details["experience"] = value
                elif "location" in label:
                    job_details["location"] = value
                elif any(keyword in label.lower() for keyword in ["apply link", "apply now", "application link"]):
                    job_details["apply_link"] = value
        
        # Case-insensitive pattern matching for "is hiring"
        elif re.search(r'is\s+hiring', line, re.IGNORECASE):
            company_parts = re.split(r'is\s+hiring', line, flags=re.IGNORECASE)
            job_details["company"] = company_parts[0].strip()
            if len(company_parts) > 1 and company_parts[1].strip():
                job_details["title"] = company_parts[1].strip().rstrip('!')
        
        # Case-insensitive pattern matching for apply links
        elif re.search(r'apply', line, re.IGNORECASE) and re.search(r'link', line, re.IGNORECASE):
            # Look for URL in this line or the next line
            url_match = re.search(r'(https?://\S+)', line)
            if url_match:
                job_details["apply_link"] = url_match.group(1)
            elif i+1 < len(lines) and re.search(r'(https?://\S+)', lines[i+1]):
                job_details["apply_link"] = re.search(r'(https?://\S+)', lines[i+1]).group(1)
        elif re.search(r'^apply\s+now', line, re.IGNORECASE):
            url_match = re.search(r'(https?://\S+)', line)
            if url_match:
                job_details["apply_link"] = url_match.group(1)
            elif i+1 < len(lines) and re.search(r'(https?://\S+)', lines[i+1]):
                job_details["apply_link"] = re.search(r'(https?://\S+)', lines[i+1]).group(1)
        
        # Case-insensitive pattern matching for WhatsApp and Telegram links
        elif re.search(r'whatsapp', line, re.IGNORECASE):
            url_match = re.search(r'(https?://\S+)', line)
            if url_match:
                job_details["whatsapp_link"] = url_match.group(1)
        elif re.search(r'telegram', line, re.IGNORECASE):
            url_match = re.search(r'(https?://\S+)', line)
            if url_match:
                job_details["telegram_link"] = url_match.group(1)
                
        # Check for shortlinks that might be apply links
        elif re.search(r'https?://bit\.ly/\S+', line):
            if not job_details["apply_link"]:  # Only set if not already found
                job_details["apply_link"] = re.search(r'(https?://bit\.ly/\S+)', line).group(1)
    
    # Extract any URLs that might have been missed
    for line in lines:
        # If we haven't found an apply link yet, look for URLs
        if not job_details["apply_link"]:
            url_match = re.search(r'(https?://\S+)', line)
            if url_match:
                job_details["apply_link"] = url_match.group(1)
    
    # Attempt to infer job type from text if not explicitly stated - case insensitive
    if not job_details["role"] and re.search(r'intern', text, re.IGNORECASE):
        job_details["role"] = "Intern"
    
    # Set the title if not already set
    if not job_details["title"] and job_details["company"] and job_details["role"]:
        job_details["title"] = f"{job_details['company']} {job_details['role']}"
    
    return job_details

try:
    # Connect to MongoDB
    mongo_client = MongoClient("mongodb+srv://bkbajpay0609:uv52KtpB09m1maFN@cluster0.xflo7xo.mongodb.net/")
    db = mongo_client["test"]
    collection = db["telegram"]
    print(f"✅ Successfully connected to MongoDB")
except Exception as e:
    print(f"❌ Error connecting to MongoDB: {str(e)}")
    sys.exit(1)

# Job posts to insert into MongoDB
job_posts = []
processed_count = 0
skipped_count = 0

try:
    # Connect to Telegram Client
    print(f"🔄 Connecting to Telegram with API ID: {api_id[:3]}...{api_id[-3:] if len(api_id) > 6 else api_id}")
    
    with TelegramClient('test', api_id, api_hash) as client:
        print(f"✅ Successfully connected to Telegram client")
        
        for chat in chats:
            print(f"🔍 Searching for chat: {chat}")
            try:
                # Check if the chat exists
                entity = client.get_entity(chat)
                print(f"✅ Found chat: {entity.title if hasattr(entity, 'title') else chat}")
                
                # Get messages
                message_count = 0
                for message in client.iter_messages(chat, limit=20, reverse=True):
                    message_count += 1
                    # Initialize image path as None
                    image_path = None

                    # Check if message has a photo and download it
                    if message.photo:
                        image_path = os.path.join(save_dir, f"{message.id}.jpg")
                        client.download_media(message, file=image_path)

                    # Parse job details from the message text
                    job_details = parse_job_details(message.text if message.text else "")
                    
                    # Check if this appears to be a job post - case insensitive
                    job_indicators = [
                        "job", "hiring", "position", "role", "salary", "apply", "qualification", 
                        "experience", "freshers", "intern", "trainee", 
                        "batch eligible", "graduate", "opening"
                    ]
                    
                    is_job_post = False
                    if message.text:
                        text_lower = message.text.lower()
                        if any(indicator in text_lower for indicator in job_indicators):
                            is_job_post = True
                        if re.search(r'Jobs\s*[\|\&]\s*Internships', message.text, re.IGNORECASE):
                            is_job_post = True
                    
                    # Skip messages that don't look like job posts
                    if not is_job_post:
                        skipped_count += 1
                        continue
                    
                    processed_count += 1
                    
                    # Create MongoDB document
                    data = {
                        "title": job_details["title"] or "",
                        "company": job_details["company"] or "",
                        "position": job_details["position"] or "",
                        "role": job_details["role"] or "",
                        "qualifications": job_details["qualifications"] or "",
                        "salary": job_details["salary"] or "",
                        "batch": job_details["batch"] or "",
                        "experience": job_details["experience"] or "",
                        "location": job_details["location"] or "",
                        "apply_link": job_details["apply_link"] or "",
                        "whatsapp_link": job_details["whatsapp_link"] or "",
                        "telegram_link": job_details["telegram_link"] or "",
                        "posted_by": job_details["posted_by"] or "",
                        "raw_text": message.text if message.text else "",
                        "date": message.date,
                        "group": chat,
                        "sender": str(message.sender_id),
                        "image_path": image_path,
                        "source": "Telegram",
                        "createdAt": datetime.datetime.now(datetime.timezone.utc)
                    }
                    
                    # Print job details in the console in a formatted way
                    print("\n" + "=" * 60)
                    if job_details['posted_by']:
                        print(f"Posted by: {job_details['posted_by']}")
                    if job_details['company']:
                        print(f"Company: {job_details['company']}")
                    if job_details['title']:
                        print(f"Title: {job_details['title']}")
                    if job_details['position']:
                        print(f"Position: {job_details['position']}")
                    if job_details['role']:
                        print(f"Role: {job_details['role']}")
                    if job_details['qualifications']:
                        print(f"Qualifications: {job_details['qualifications']}")
                    if job_details['salary']:
                        print(f"Salary: {job_details['salary']}")
                    if job_details['batch']:
                        print(f"Batch: {job_details['batch']}")
                    if job_details['experience']:
                        print(f"Experience: {job_details['experience']}")
                    if job_details['location']:
                        print(f"Location: {job_details['location']}")
                    if job_details['apply_link']:
                        print(f"Apply Link: {job_details['apply_link']}")
                    if job_details['whatsapp_link']:
                        print(f"WhatsApp Channel: {job_details['whatsapp_link']}")
                    if job_details['telegram_link']:
                        print(f"Telegram Link: {job_details['telegram_link']}")
                    print(f"Message Date: {message.date}")
                    print("=" * 60)
                    
                    job_posts.append(data)
                
                print(f"📊 Found {message_count} messages in chat {chat}")
                print(f"📊 Processed {processed_count} job posts, skipped {skipped_count} messages")
                
            except Exception as e:
                print(f"❌ Error processing chat {chat}: {str(e)}")
                
except Exception as e:
    print(f"❌ Error connecting to Telegram: {str(e)}")

# Insert into MongoDB
if job_posts:
    try:
        result = collection.insert_many(job_posts)
        print(f"\n {len(result.inserted_ids)} Telegram job records saved to MongoDB (telegram collection)\n")
    except Exception as e:
        print(f"\n Error inserting data into MongoDB: {str(e)}\n")
else:
    print("\n⚠ No Telegram job posts found, nothing inserted into MongoDB.\n")