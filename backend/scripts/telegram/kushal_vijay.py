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
chats = ["vijaykushal"]  # Changed from kushalvijay to vijaykushal based on successful output

# Output directories
save_dir = os.path.join(script_dir, "images")
os.makedirs(save_dir, exist_ok=True)

def parse_job_details(text):
    # Initialize job details with default values
    job_details = {
        "title": None,
        "company": None,
        "role": None,
        "batch": None,
        "applyLink": None
    }
    
    if not text:
        return job_details
    
    # Try to extract information using patterns
    lines = text.strip().split('\n')
    
    # First line is usually the title if it's not a URL
    if lines and not lines[0].strip().startswith('http'):
        job_details["title"] = lines[0].strip()
    
    # Look for patterns in each line
    for line in lines:
        line = line.strip()
        
        # Extract company information
        if "company:" in line.lower() or "at " in line.lower() or " is hiring" in line.lower():
            if "company:" in line.lower():
                job_details["company"] = line.split(":", 1)[1].strip()
            elif " is hiring" in line.lower():
                parts = line.lower().split(" is hiring")
                job_details["company"] = parts[0].strip()
            elif "at " in line.lower() and not line.lower().startswith("http"):
                parts = line.split("at ", 1)
                if len(parts) > 1:
                    job_details["company"] = parts[1].strip()
        
        # Extract role information
        if "role:" in line.lower() or "for " in line.lower():
            if "role:" in line.lower():
                job_details["role"] = line.split(":", 1)[1].strip()
            elif "hiring for " in line.lower():
                parts = line.lower().split("hiring for ", 1)
                if len(parts) > 1:
                    job_details["role"] = parts[1].strip()
            elif " for " in line.lower() and not line.lower().startswith("http"):
                if "intern" in line.lower():
                    job_details["role"] = "Intern"
                    
        # Look for batch information
        if "batch:" in line.lower() or any(year in line for year in ["2017", "2018", "2019", "2020", "2021", "2022", "2023","2024", "2025", "2026"]):
            if "batch:" in line.lower():
                job_details["batch"] = line.split(":", 1)[1].strip()
            else:
                # Try to extract years
                years = re.findall(r'20\d\d', line)
                if years:
                    job_details["batch"] = "/".join(years)
                    
        # If line contains "graduate" or similar terms
        if "graduate" in line.lower() or "grad" in line.lower():
            job_details["batch"] = line
        
        # Look for application link
        if "apply:" in line.lower():
            job_details["applyLink"] = line.split(":", 1)[1].strip()
        elif line.lower().startswith("http"):
            # Extract URL from the line
            url_match = re.search(r'https?://\S+', line)
            if url_match:
                job_details["applyLink"] = url_match.group(0)
    
    # Extract company name from title if not found elsewhere
    if not job_details["company"] and job_details["title"]:
        words = job_details["title"].split()
        if len(words) >= 2 and "hiring" in job_details["title"].lower():
            company_index = job_details["title"].lower().find("hiring")
            if company_index > 0:
                job_details["company"] = job_details["title"][:company_index].strip()
    
    # Extract role from title if not found elsewhere
    if not job_details["role"] and job_details["title"]:
        title_lower = job_details["title"].lower()
        role_keywords = ["engineer", "developer", "sde", "swe", "qa", "tester", "intern"]
        for keyword in role_keywords:
            if keyword in title_lower:
                # Try to extract the full role
                if "for " + keyword in title_lower:
                    parts = job_details["title"].split("for " + keyword, 1)
                    job_details["role"] = keyword.capitalize()
                else:
                    # Find the position of the keyword
                    pos = title_lower.find(keyword)
                    if pos > 0:
                        # Look for words before the keyword
                        start = max(0, title_lower.rfind(" ", 0, pos))
                        job_details["role"] = job_details["title"][start:pos+len(keyword)].strip()
                    else:
                        job_details["role"] = keyword.capitalize()
                break
    
    return job_details

try:
    # Connect to MongoDB
    mongo_client = MongoClient("mongodb+srv://bkbajpay0609:uv52KtpB09m1maFN@cluster0.xflo7xo.mongodb.net/")
    db = mongo_client["test"]
    collection = db["telegram"]
    print(f" Successfully connected to MongoDB")
except Exception as e:
    print(f" Error connecting to MongoDB: {str(e)}")
    sys.exit(1)

# Job posts to insert into MongoDB
job_posts = []
processed_count = 0
skipped_count = 0

try:
    # Connect to Telegram Client
    print(f" Connecting to Telegram with API ID: {api_id[:3]}...{api_id[-3:] if len(api_id) > 6 else api_id}")
    
    with TelegramClient('test', api_id, api_hash) as client:
        print(f" Successfully connected to Telegram client")
        
        for chat in chats:
            print(f" Searching for chat: {chat}")
            try:
                # Check if the chat exists
                entity = client.get_entity(chat)
                print(f" Found chat: {entity.title if hasattr(entity, 'title') else chat}")
                
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
                    job_details = parse_job_details(message.text)
                    
                    # Check if at least one of company, role, batch, or applyLink is available
                    has_job_info = (
                        job_details["company"] is not None or 
                        job_details["role"] is not None or 
                        job_details["batch"] is not None or 
                        job_details["applyLink"] is not None
                    )
                    
                    # Skip messages that don't have any job-related information
                    if not has_job_info:
                        skipped_count += 1
                        continue
                    
                    processed_count += 1
                    
                    # Create MongoDB document
                    data = {
                        "title": job_details["title"] or f"Message from {chat}",
                        "company": job_details["company"] or "",
                        "role": job_details["role"] or "",
                        "batch": job_details["batch"] or "",
                        "apply_link": job_details["applyLink"] or "",
                        "text": message.text if message.text else "",
                        "date": message.date,
                        "group": chat,
                        "sender": str(message.sender_id),
                        "image_path": image_path,
                        "source": "Telegram",
                        "createdAt": datetime.datetime.now(datetime.timezone.utc)
                    }
                    
                    # Print job details in the console in the format from the image
                    print("\n" + "=" * 60)
                    print(f"{job_details['title'] or 'Job Post'}")
                    if job_details['company']:
                        print(f"Company: {job_details['company']}")
                    if job_details['role']:
                        print(f"Role: {job_details['role']}")
                    if job_details['batch']:
                        print(f"Batch: {job_details['batch']}")
                    if job_details['applyLink']:
                        print(f"Apply: {job_details['applyLink']}")
                    print(f"Message Date: {message.date}")
                    print("=" * 60)
                    
                    job_posts.append(data)
                
                print(f" Found {message_count} messages in chat {chat}")
                print(f" Processed {processed_count} job posts, skipped {skipped_count} messages")
                
            except Exception as e:
                print(f" Error processing chat {chat}: {str(e)}")
                
except Exception as e:
    print(f" Error connecting to Telegram: {str(e)}")

# Insert into MongoDB
if job_posts:
    try:
        result = collection.insert_many(job_posts)
        print(f"\n {len(result.inserted_ids)} Telegram job records saved to MongoDB (telegram collection)\n")
    except Exception as e:
        print(f"\n Error inserting data into MongoDB: {str(e)}\n")
else:
    print("\n⚠ No Telegram job posts found, nothing inserted into MongoDB.\n")