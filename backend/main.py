"""
Convertify Backend — FastAPI
All-in-one file conversion API
"""

import os
import uuid
import asyncio
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import aiofiles

from routers import documents, images, data_code

# ── Directories ──────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Convertify API",
    description="All-in-one file conversion backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(images.router,    prefix="/api/images",    tags=["Images"])
app.include_router(data_code.router, prefix="/api/data",      tags=["Data & Code"])

# ── Static frontend ───────────────────────────────────────────────────────────
FRONTEND_DIR = BASE_DIR.parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

# ── Download endpoint ─────────────────────────────────────────────────────────
@app.get("/api/download/{filename}")
async def download_file(filename: str, background_tasks: BackgroundTasks):
    filepath = OUTPUT_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found or expired")
    # Auto-delete after serving
    background_tasks.add_task(lambda: filepath.unlink(missing_ok=True))
    return FileResponse(
        path=str(filepath),
        filename=filename,
        media_type="application/octet-stream"
    )

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}

# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    index = FRONTEND_DIR / "index.html"
    if index.exists():
        return FileResponse(str(index))
    return {"message": "Convertify API running. Frontend not mounted."}
