"""
Telegram scraper — jobs_and_internships_updates channel (Krishan Kumar).
Images uploaded to ImageKit; CDN URLs stored in MongoDB.
"""
import sys
import os
import re
import datetime
import configparser
import tempfile

script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(script_dir, ".."))
from scraper_utils import get_collection, generate_job_hash, bulk_upsert_jobs, upload_image_to_imagekit

from telethon.sync import TelegramClient

# ── Config ────────────────────────────────────────────────────────────────────
config_path = os.path.join(script_dir, "telethon.config")
if not os.path.exists(config_path):
    print(f"❌ Config file not found: {config_path}")
    sys.exit(1)

config = configparser.ConfigParser()
config.read(config_path)
api_id = config["telethon_credentials"]["api_id"]
api_hash = config["telethon_credentials"]["api_hash"]

CHATS = ["jobs_and_internships_updates"]
MESSAGE_LIMIT = 200
SESSION_PATH = os.path.join(script_dir, "krishan_session")

JOB_INDICATORS = [
    "job", "hiring", "position", "role", "salary", "apply",
    "qualification", "experience", "freshers", "intern", "trainee",
    "batch eligible", "graduate", "opening",
]


# ── Parser ────────────────────────────────────────────────────────────────────
def parse_job_details(text: str) -> dict:
    job = {
        "title": None, "company": None, "position": None, "role": None,
        "qualifications": None, "salary": None, "batch": None, "experience": None,
        "location": None, "apply_link": None, "whatsapp_link": None,
        "telegram_link": None, "posted_by": None,
    }
    if not text:
        return job

    lines = text.strip().split("\n")

    # Detect poster name from header format
    for pattern in [
        r"(.*?)\s*-\s*Jobs\s*&\s*Internships",
        r"Jobs\s*[\|\&]\s*Internships\s*[\|\&]\s*Placement",
    ]:
        m = re.search(pattern, text, re.IGNORECASE)
        if m and m.lastindex:
            job["posted_by"] = m.group(1).strip()
            break

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
        ll = line.lower()

        if ":" in line:
            label, _, value = line.partition(":")
            label_l = label.strip().lower()
            value = value.strip()
            if "company" in label_l:
                job["company"] = value
            elif "position" in label_l:
                job["position"] = value
            elif "role" in label_l:
                job["role"] = value
            elif "qualification" in label_l:
                job["qualifications"] = value
            elif "salary" in label_l:
                job["salary"] = value
            elif "batch" in label_l:
                job["batch"] = value
            elif "experience" in label_l:
                job["experience"] = value
            elif "location" in label_l:
                job["location"] = value
            elif any(k in label_l for k in ["apply link", "apply now", "application link"]):
                job["apply_link"] = value
        elif re.search(r"is\s+hiring", line, re.IGNORECASE):
            parts = re.split(r"is\s+hiring", line, flags=re.IGNORECASE)
            job["company"] = parts[0].strip()
            if len(parts) > 1 and parts[1].strip():
                job["title"] = parts[1].strip().rstrip("!")
        elif re.search(r"whatsapp", line, re.IGNORECASE):
            m = re.search(r"(https?://\S+)", line)
            if m:
                job["whatsapp_link"] = m.group(1)
        elif re.search(r"^apply\s+now", ll):
            m = re.search(r"(https?://\S+)", line)
            if m:
                job["apply_link"] = m.group(1)
            elif i + 1 < len(lines):
                m = re.search(r"(https?://\S+)", lines[i + 1])
                if m:
                    job["apply_link"] = m.group(1)
        elif re.search(r"https?://bit\.ly/\S+", line) and not job["apply_link"]:
            m = re.search(r"(https?://bit\.ly/\S+)", line)
            if m:
                job["apply_link"] = m.group(1)

    # Fallback: grab any URL as apply link
    if not job["apply_link"]:
        for line in lines:
            m = re.search(r"(https?://\S+)", line)
            if m:
                job["apply_link"] = m.group(1)
                break

    if not job["role"] and re.search(r"intern", text, re.IGNORECASE):
        job["role"] = "Intern"

    if not job["title"] and job["company"] and job["role"]:
        job["title"] = f"{job['company']} {job['role']}"

    return job


def is_job_post(text: str) -> bool:
    if not text:
        return False
    tl = text.lower()
    return any(ind in tl for ind in JOB_INDICATORS) or bool(
        re.search(r"Jobs\s*[\|\&]\s*Internships", text, re.IGNORECASE)
    )


# ── Main ──────────────────────────────────────────────────────────────────────
collection = get_collection("telegram")
job_posts = []

print("🔄 Connecting to Telegram (Krishan Kumar)...")

try:
    with TelegramClient(SESSION_PATH, api_id, api_hash) as client:
        print("✅ Connected")

        for chat in CHATS:
            print(f"🔍 Scraping: {chat} (limit={MESSAGE_LIMIT})")
            processed = 0
            skipped = 0

            try:
                entity = client.get_entity(chat)
                print(f"   Found: {getattr(entity, 'title', chat)}")

                for message in client.iter_messages(chat, limit=MESSAGE_LIMIT):
                    if not is_job_post(message.text):
                        skipped += 1
                        continue

                    # Upload image to ImageKit
                    image_url = None
                    if message.photo:
                        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                            tmp_path = tmp.name
                        try:
                            client.download_media(message, file=tmp_path)
                            with open(tmp_path, "rb") as f:
                                img_bytes = f.read()
                            image_url = upload_image_to_imagekit(
                                img_bytes,
                                f"telegram_{message.id}.jpg",
                                folder="telegram-jobs"
                            )
                        finally:
                            if os.path.exists(tmp_path):
                                os.remove(tmp_path)

                    details = parse_job_details(message.text or "")
                    processed += 1

                    job_hash = generate_job_hash(
                        details["title"] or "",
                        details["company"] or "",
                        str(message.date.date())
                    )

                    job_posts.append({
                        "title": details["title"] or "",
                        "company": details["company"] or "",
                        "position": details["position"] or "",
                        "role": details["role"] or "",
                        "qualifications": details["qualifications"] or "",
                        "salary": details["salary"] or "",
                        "batch": details["batch"] or "",
                        "experience": details["experience"] or "",
                        "location": details["location"] or "",
                        "apply_link": details["apply_link"] or "",
                        "whatsapp_link": details["whatsapp_link"] or "",
                        "telegram_link": details["telegram_link"] or "",
                        "posted_by": details["posted_by"] or "",
                        "text": message.text or "",
                        "date": message.date,
                        "group": chat,
                        "sender": str(message.sender_id),
                        "image_url": image_url,  # CDN URL or None
                        "source": "Telegram",
                        "jobHash": job_hash,
                        "createdAt": datetime.datetime.now(datetime.timezone.utc),
                    })

                print(f"   Processed: {processed}  |  Skipped: {skipped}")

            except Exception as e:
                print(f"❌ Error scraping {chat}: {e}")

except Exception as e:
    print(f"❌ Telegram connection error: {e}")

# ── Save ──────────────────────────────────────────────────────────────────────
print(f"\nTotal collected: {len(job_posts)}")
if job_posts:
    inserted, dupes = bulk_upsert_jobs(collection, job_posts)
    print(f"✓ Inserted: {inserted} new  |  Duplicates skipped: {dupes}")
else:
    print("⚠ No job posts found.")
