"""
Telegram scraper — TechUprise_Updates channel.
Images are uploaded to ImageKit immediately; CDN URLs stored in MongoDB.
"""
import sys
import os
import re
import datetime
import configparser
import tempfile
from pymongo import MongoClient

script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(script_dir, ".."))
from scraper_utils import get_collection, generate_job_hash, bulk_upsert_jobs, upload_image_to_imagekit, filter_jobs

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

CHATS = ["TechUprise_Updates"]
MESSAGE_LIMIT = 200  # fetch up to 200 recent messages per channel

# Session stored in scripts/telegram/ directory (gitignored via *.session)
SESSION_PATH = os.path.join(script_dir, "techuprise_session")


# ── Parser ────────────────────────────────────────────────────────────────────
def parse_job_details(text: str) -> dict:
    job = {"title": None, "company": None, "role": None, "batch": None, "apply_link": None}
    if not text:
        return job

    lines = text.strip().split("\n")
    if lines and not lines[0].strip().startswith("http"):
        job["title"] = lines[0].strip()

    for line in lines:
        line = line.strip()
        ll = line.lower()

        if "company:" in ll:
            job["company"] = line.split(":", 1)[1].strip()
        elif " is hiring" in ll:
            job["company"] = re.split(r"is hiring", line, flags=re.IGNORECASE)[0].strip()
        elif "at " in ll and not ll.startswith("http"):
            parts = line.split("at ", 1)
            if len(parts) > 1:
                job["company"] = job["company"] or parts[1].strip()

        if "role:" in ll:
            job["role"] = line.split(":", 1)[1].strip()
        elif "hiring for " in ll:
            job["role"] = re.split(r"hiring for ", line, flags=re.IGNORECASE)[1].strip()
        elif " for " in ll and "intern" in ll:
            job["role"] = "Intern"

        if "batch:" in ll:
            job["batch"] = line.split(":", 1)[1].strip()
        else:
            years = re.findall(r"20\d\d", line)
            if years:
                job["batch"] = job["batch"] or "/".join(years)

        if "graduate" in ll or " grad" in ll:
            job["batch"] = job["batch"] or line

        if "apply:" in ll:
            job["apply_link"] = line.split(":", 1)[1].strip()
        elif ll.startswith("http"):
            m = re.search(r"https?://\S+", line)
            if m:
                job["apply_link"] = job["apply_link"] or m.group(0)

    # Infer company/role from title if still missing
    if not job["company"] and job["title"] and "hiring" in job["title"].lower():
        idx = job["title"].lower().find("hiring")
        job["company"] = job["title"][:idx].strip() if idx > 0 else None

    if not job["role"] and job["title"]:
        for kw in ["engineer", "developer", "sde", "swe", "qa", "tester", "intern"]:
            if kw in job["title"].lower():
                job["role"] = kw.capitalize()
                break

    return job


# ── Main ──────────────────────────────────────────────────────────────────────
collection = get_collection("telegram")
job_posts = []

print(f"🔄 Connecting to Telegram (TechUprise)...")

try:
    with TelegramClient(SESSION_PATH, api_id, api_hash) as client:
        print("✅ Connected to Telegram")

        for chat in CHATS:
            print(f"🔍 Scraping: {chat} (limit={MESSAGE_LIMIT})")
            processed = 0
            skipped = 0

            try:
                entity = client.get_entity(chat)
                print(f"   Found: {getattr(entity, 'title', chat)}")

                for message in client.iter_messages(chat, limit=MESSAGE_LIMIT):
                    # Upload image to ImageKit if present
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
                    has_info = any([details["company"], details["role"], details["batch"], details["apply_link"]])

                    if not has_info:
                        skipped += 1
                        continue

                    processed += 1
                    job_hash = generate_job_hash(
                        details["title"] or "",
                        details["company"] or "",
                        str(message.date.date())
                    )

                    job_posts.append({
                        "title": details["title"] or f"Job from {chat}",
                        "company": details["company"] or "",
                        "role": details["role"] or "",
                        "batch": details["batch"] or "",
                        "apply_link": details["apply_link"] or "",
                        "text": message.text or "",
                        "date": message.date,
                        "group": chat,
                        "sender": str(message.sender_id),
                        "image_url": image_url,   # CDN URL or None (never a local path)
                        "source": "Telegram",
                        "jobHash": job_hash,
                        "createdAt": datetime.datetime.now(datetime.timezone.utc),
                    })

                print(f"   Processed: {processed}  |  Skipped (non-job): {skipped}")

            except Exception as e:
                print(f"❌ Error scraping {chat}: {e}")

except Exception as e:
    print(f"❌ Telegram connection error: {e}")

# ── Quality filter + save ─────────────────────────────────────────────────────
print(f"\nTotal collected: {len(job_posts)}")
if job_posts:
    print("🔍  Running quality filter…")
    valid_jobs, rejected = filter_jobs(job_posts, source="telegram")
    print(f"   ✓ Passed: {len(valid_jobs)}  |  ✗ Rejected: {rejected}")
    if valid_jobs:
        inserted, dupes = bulk_upsert_jobs(collection, valid_jobs)
        print(f"   ✓ Inserted: {inserted} new  |  Duplicates skipped: {dupes}")
else:
    print("⚠ No job posts found.")
