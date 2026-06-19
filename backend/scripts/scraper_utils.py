"""
Shared utilities for all scrapers.
- Loads credentials from backend/.env
- Provides MongoDB connection helper
- Provides ImageKit upload helper
- Provides deduplication helper
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
