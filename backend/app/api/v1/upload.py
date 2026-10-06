"""File Upload API — Al Rehman Solar"""
import os
import uuid
import aiofiles
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.core.security import get_current_user

router = APIRouter(prefix="/upload", tags=["upload"])

# Where uploaded files are stored
UPLOAD_DIR = Path(__file__).resolve().parents[3] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    current: dict = Depends(get_current_user),
):
    """Upload an image file. Returns the URL path to use in content."""

    # Validate extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' is not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Validate content type
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed.")

    # Read with size limit
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds {MAX_FILE_SIZE // 1024 // 1024}MB limit.",
        )

    # Save with UUID filename
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    filepath = UPLOAD_DIR / safe_filename

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    # Return URL path relative to backend
    url = f"/uploads/{safe_filename}"
    return {
        "url": url,
        "filename": safe_filename,
        "original_name": file.filename,
        "size": len(content),
        "content_type": file.content_type,
    }
