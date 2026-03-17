"""
Shared utilities — temp file management, helpers
"""

import uuid
import os
import asyncio
from pathlib import Path
from fastapi import UploadFile
import aiofiles

BASE_DIR   = Path(__file__).parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"


async def save_upload(file: UploadFile) -> Path:
    """Save uploaded file to temp uploads dir, return path."""
    UPLOAD_DIR.mkdir(exist_ok=True)
    suffix = Path(file.filename).suffix.lower() if file.filename else ""
    tmp_path = UPLOAD_DIR / f"{uuid.uuid4()}{suffix}"
    async with aiofiles.open(tmp_path, "wb") as f:
        while chunk := await file.read(1024 * 1024):  # 1MB chunks
            await f.write(chunk)
    return tmp_path


def output_path(suffix: str) -> Path:
    """Generate a unique output file path."""
    OUTPUT_DIR.mkdir(exist_ok=True)
    return OUTPUT_DIR / f"{uuid.uuid4()}{suffix}"


def cleanup(*paths):
    """Delete temp files silently."""
    for p in paths:
        try:
            if p and Path(p).exists():
                Path(p).unlink()
        except Exception:
            pass


def file_download_url(filename: str) -> str:
    return f"/api/download/{filename}"
