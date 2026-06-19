"""
Shared utilities for all scrapers.
- Loads credentials from backend/.env
- Provides MongoDB connection helper
- Provides ImageKit upload helper
- Provides deduplication helper
- Provides quality validation (is_valid_job)
"""

import os
import hashlib
import requests
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne

# Resolve backend/.env from any subdirectory depth
_scripts_dir = os.path.dirname(os.path.abspath(__file__))
_backend_dir = os.path.dirname(_scripts_dir)
_env_path = os.path.join(_backend_dir, ".env")
load_dotenv(_env_path)

_MONGO_URI = os.getenv("MONGO_URI")
_IMAGEKIT_PRIVATE_KEY = os.getenv("IMAGEKIT_PRIVATE_KEY")
_IMAGEKIT_URL_ENDPOINT = os.getenv("IMAGEKIT_URL_ENDPOINT")
_IMAGEKIT_UPLOAD_FOLDER = os.getenv("IMAGEKIT_UPLOAD_FOLDER", "scraped")

if not _MONGO_URI:
    raise EnvironmentError("MONGO_URI is not set in backend/.env")
if not _IMAGEKIT_PRIVATE_KEY:
    raise EnvironmentError("IMAGEKIT_PRIVATE_KEY is not set in backend/.env")


def get_collection(collection_name: str, db_name: str = "test"):
    """Return a MongoDB collection using credentials from .env."""
    client = MongoClient(_MONGO_URI)
    return client[db_name][collection_name]


def upload_image_to_imagekit(file_bytes: bytes, filename: str, folder: str = None) -> str | None:
    """
    Upload raw image bytes to ImageKit and return the public CDN URL.
    Returns None on failure — caller should fall back to a placeholder or skip.
    """
    if not file_bytes:
        return None

    upload_folder = folder or _IMAGEKIT_UPLOAD_FOLDER
    try:
        response = requests.post(
            "https://upload.imagekit.io/api/v1/files/upload",
            auth=(_IMAGEKIT_PRIVATE_KEY, ""),
            files={"file": (filename, file_bytes, "image/jpeg")},
            data={"fileName": filename, "folder": f"/{upload_folder}"},
            timeout=30,
        )
        if response.status_code == 200:
            return response.json().get("url")
        print(f"    ⚠ ImageKit upload failed ({response.status_code}): {response.text[:200]}")
    except Exception as e:
        print(f"    ⚠ ImageKit upload error: {e}")
    return None


def upload_image_from_url(image_url: str, filename: str, folder: str = None) -> str | None:
    """
    Fetch an image from a URL and upload it to ImageKit.
    Returns the CDN URL, or None on failure.
    """
    if not image_url or image_url == "N/A":
        return None
    try:
        resp = requests.get(image_url, timeout=15, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        if resp.status_code == 200:
            return upload_image_to_imagekit(resp.content, filename, folder)
    except Exception as e:
        print(f"    ⚠ Failed to fetch image from {image_url}: {e}")
    return None


def generate_job_hash(*fields) -> str:
    """Generate a stable MD5 hash from any combination of fields for deduplication."""
    combined = "_".join(str(f).lower().strip() for f in fields if f)
    return hashlib.md5(combined.encode()).hexdigest()


def upsert_job(collection, job_hash: str, doc: dict) -> bool:
    """
    Insert the job document if it doesn't exist (keyed by jobHash).
    Returns True if inserted, False if it was a duplicate.
    """
    result = collection.update_one(
        {"jobHash": job_hash},
        {"$setOnInsert": doc},
        upsert=True
    )
    return result.upserted_id is not None



# ── Quality validation ─────────────────────────────────────────────────────
_JUNK_VALUES  = {"n/a", "na", "none", "null", "undefined", "", "-", "--", "not disclosed"}
_JUNK_DOMAINS = {"timesjobs.com", "hirejobs.in", "naukri.com", "linkedin.com",
                 "indeed.com", "glassdoor.com", "shine.com", "monster.com"}
_SPAM_PATTERNS = ["forward this", "join our group", "t.me/", "whatsapp.com/invite",
                  "click here to apply", "apply now click", "limited seats"]

def _clean(val) -> str:
    """Normalise a value to a lowercase stripped string for comparison."""
    return str(val or "").strip().lower()

def _is_junk(val) -> bool:
    return _clean(val) in _JUNK_VALUES or len(_clean(val)) < 3

def _has_real_url(url) -> bool:
    """Return True if the URL is a real external link (not a job-board redirect)."""
    if not url or not isinstance(url, str):
        return False
    url = url.strip()
    if not url.startswith("http"):
        return False
    try:
        from urllib.parse import urlparse
        host = urlparse(url).netloc.lower().replace("www.", "")
        return host not in _JUNK_DOMAINS and len(host) > 3
    except Exception:
        return False

def _is_spam_text(text: str) -> bool:
    t = text.lower()
    return any(p in t for p in _SPAM_PATTERNS)


def is_valid_job(job: dict, source: str = "web") -> tuple[bool, str]:
    """
    Validate a job dict before inserting into MongoDB.
    Returns (is_valid: bool, rejection_reason: str).

    Rules applied per source:
      web (TimesJobs, HireJobs, Instahyre):
        - title       : required, not junk, length 5–150 chars
        - company     : required, not junk, not an email address
        - location    : required, not junk
        - description : required if present, min 30 chars (or keySkills must exist)
        - keySkills   : required, at least 1 real skill token

      telegram:
        - title OR company : at least one must be real
        - apply_link       : must be a valid external URL
        - text             : min 30 chars, not spam
    """
    title       = _clean(job.get("title", ""))
    company     = _clean(job.get("company", ""))
    location    = _clean(job.get("location", ""))
    description = str(job.get("description", "") or job.get("text", "") or "").strip()
    skills_raw  = job.get("keySkills", "") or ""
    apply_link  = job.get("apply_link", "") or ""

    if source == "telegram":
        # Telegram jobs: need a real title or company AND a valid apply link
        if _is_junk(title) and _is_junk(company):
            return False, "no title or company"
        if not _has_real_url(apply_link):
            return False, "missing or invalid apply link"
        if len(description) < 30:
            return False, f"text too short ({len(description)} chars)"
        if _is_spam_text(description):
            return False, "spam content detected"
        # Title must not just be an emoji dump or very short
        real_title = "".join(c for c in title if c.isalnum() or c.isspace()).strip()
        if len(real_title) < 5:
            return False, "title has no real words"
        return True, ""

    # ── Web sources (TimesJobs, HireJobs, Instahyre) ──────────────────────
    # 1. Title
    if _is_junk(title):
        return False, "missing title"
    if len(title) < 5 or len(title) > 200:
        return False, f"title length out of range ({len(title)})"
    if "@" in title or title.startswith("http"):
        return False, "title looks like email or URL"

    # 2. Company
    if _is_junk(company):
        return False, "missing company"
    if "@" in company:
        return False, "company field contains email address"
    if company.startswith("http"):
        return False, "company field contains URL"

    # 3. Location
    if _is_junk(location):
        return False, "missing location"

    # 4. Skills — must have at least one real skill token
    if isinstance(skills_raw, list):
        real_skills = [s for s in skills_raw if s and not _is_junk(s)]
    else:
        real_skills = [s.strip() for s in str(skills_raw).split(",") if s.strip() and not _is_junk(s.strip())]
    if not real_skills:
        return False, "no skills listed"

    # 5. Description (if present must be meaningful)
    if description and len(description) < 30:
        return False, f"description too short ({len(description)} chars)"

    return True, ""


def filter_jobs(jobs: list[dict], source: str = "web") -> tuple[list[dict], int]:
    """
    Filter a list of job dicts through is_valid_job().
    Returns (valid_jobs, rejected_count).
    """
    valid, rejected = [], 0
    for job in jobs:
        ok, reason = is_valid_job(job, source=source)
        if ok:
            valid.append(job)
        else:
            rejected += 1
            title = job.get("title", "?")[:40]
            print(f"  ✗ Rejected [{reason}]: {title}")
    return valid, rejected


def bulk_upsert_jobs(collection, jobs: list[dict]) -> tuple[int, int]:
    """
    Bulk upsert a list of job dicts (each must have 'jobHash').
    Returns (inserted_count, duplicate_count).
    """
    if not jobs:
        return 0, 0

    operations = [
        UpdateOne(
            {"jobHash": job["jobHash"]},
            {"$setOnInsert": job},
            upsert=True
        )
        for job in jobs
    ]
    result = collection.bulk_write(operations, ordered=False)
    inserted = result.upserted_count
    duplicates = len(jobs) - inserted
    return inserted, duplicates
