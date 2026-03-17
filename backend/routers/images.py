"""
Images Router
Handles: Resize, Compress, Format Convert, Crop, Rotate/Flip,
         Watermark, Grayscale/Filters, Bulk convert (ZIP),
         Image → Base64, EXIF metadata
"""

import io
import json
import zipfile
import base64
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from utils.helpers import save_upload, output_path, cleanup, file_download_url

router = APIRouter()

ALLOWED_IMG = [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif", ".tiff", ".tif"]


def _open_image(path):
    """Open image with Pillow."""
    try:
        from PIL import Image
        return Image.open(str(path))
    except ImportError:
        raise HTTPException(500, "Pillow not installed. Run: pip install Pillow")


def _check_img(filename):
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_IMG:
        raise HTTPException(400, f"Unsupported image format: {ext}")
    return ext


# ═══════════════════════════════════════════════════════════════════════════════
#  RESIZE
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: int  = Form(None),
    height: int = Form(None),
    scale: float = Form(None),          # e.g. 0.5 = 50%
    keep_aspect: bool = Form(True),
    output_format: str = Form("original")  # png | jpeg | webp | original
):
    _check_img(file.filename)
    tmp = await save_upload(file)
    try:
        from PIL import Image
        img = _open_image(tmp)
        orig_w, orig_h = img.size

        if scale:
            new_w = int(orig_w * scale)
            new_h = int(orig_h * scale)
        elif width and height:
            if keep_aspect:
                ratio = min(width / orig_w, height / orig_h)
                new_w = int(orig_w * ratio)
                new_h = int(orig_h * ratio)
            else:
                new_w, new_h = width, height
        elif width:
            new_w = width
            new_h = int(orig_h * width / orig_w) if keep_aspect else orig_h
        elif height:
            new_h = height
            new_w = int(orig_w * height / orig_h) if keep_aspect else orig_w
        else:
            raise HTTPException(400, "Provide width, height, or scale")

        resized = img.resize((new_w, new_h), Image.LANCZOS)

        fmt, ext = _resolve_format(output_format, file.filename)
        out = output_path(ext)
        _save_image(resized, out, fmt)
        return {
            "url": file_download_url(out.name),
            "filename": out.name,
            "original": {"width": orig_w, "height": orig_h},
            "result": {"width": new_w, "height": new_h}
        }
    finally:
        cleanup(tmp)


# ═══════════════════════════════════════════════════════════════════════════════
#  COMPRESS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/compress")
async def compress_image(
    file: UploadFile = File(...),
    quality: int = Form(82),           # 1–100
    output_format: str = Form("jpeg"), # jpeg | webp | png
    max_width: int = Form(None),       # optional downscale cap
    max_height: int = Form(None)
):
    _check_img(file.filename)
    tmp = await save_upload(file)
    orig_size = tmp.stat().st_size
    try:
        from PIL import Image
        img = _open_image(tmp)

        # Optional max-dimension cap
        if max_width or max_height:
            w, h = img.size
            if max_width and w > max_width:
                h = int(h * max_width / w); w = max_width
            if max_height and h > max_height:
                w = int(w * max_height / h); h = max_height
            img = img.resize((w, h), Image.LANCZOS)

        fmt, ext = _resolve_format(output_format, file.filename)
        out = output_path(ext)
        _save_image(img, out, fmt, quality=quality)
        new_size = out.stat().st_size
        reduction = round((1 - new_size / orig_size) * 100, 1) if orig_size else 0
        return {
            "url": file_download_url(out.name),
            "filename": out.name,
            "original_bytes": orig_size,
            "compressed_bytes": new_size,
            "reduction_pct": reduction
        }
    finally:
        cleanup(tmp)


# ═══════════════════════════════════════════════════════════════════════════════
#  FORMAT CONVERT
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/convert-format")
async def convert_format(
    file: UploadFile = File(...),
    output_format: str = Form(...),   # png | jpeg | webp | bmp | gif | tiff
    quality: int = Form(92)
):
    _check_img(file.filename)
    tmp = await save_upload(file)
    try:
        from PIL import Image
        img = _open_image(tmp)
        fmt, ext = _resolve_format(output_format, None)
        out = output_path(ext)
        _save_image(img, out, fmt, quality=quality)
        return {"url": file_download_url(out.name), "filename": out.name}
    finally:
        cleanup(tmp)


# ═══════════════════════════════════════════════════════════════════════════════
#  CROP
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/crop")
async def crop_image(
    file: UploadFile = File(...),
    x: int = Form(0),
    y: int = Form(0),
    width: int = Form(...),
    height: int = Form(...),
    output_format: str = Form("original")
):
    _check_img(file.filename)
    tmp = await save_upload(file)
    try:
        from PIL import Image
        img = _open_image(tmp)
        box = (x, y, x + width, y + height)
        cropped = img.crop(box)
        fmt, ext = _resolve_format(output_format, file.filename)
        out = output_path(ext)
        _save_image(cropped, out, fmt)
        return {
            "url": file_download_url(out.name),
            "filename": out.name,
            "result": {"width": cropped.width, "height": cropped.height}
        }
    finally:
        cleanup(tmp)


# ═══════════════════════════════════════════════════════════════════════════════
#  ROTATE / FLIP
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/rotate")
async def rotate_image(
    file: UploadFile = File(...),
    angle: float = Form(90),         # degrees CCW
    flip_h: bool = Form(False),
    flip_v: bool = Form(False),
    output_format: str = Form("original")
):
    _check_img(file.filename)
    tmp = await save_upload(file)
    try:
        from PIL import Image
        img = _open_image(tmp)
        if flip_h:
            img = img.transpose(Image.FLIP_LEFT_RIGHT)
        if flip_v:
            img = img.transpose(Image.FLIP_TOP_BOTTOM)
        if angle:
            img = img.rotate(angle, expand=True)
        fmt, ext = _resolve_format(output_format, file.filename)
        out = output_path(ext)
        _save_image(img, out, fmt)
        return {"url": file_download_url(out.name), "filename": out.name}
    finally:
        cleanup(tmp)


# ═══════════════════════════════════════════════════════════════════════════════
#  FILTERS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/filter")
async def apply_filter(
    file: UploadFile = File(...),
    filter_name: str = Form(...),    # grayscale|sepia|blur|sharpen|brightness|contrast|invert
    intensity: float = Form(1.0),   # for brightness/contrast
    output_format: str = Form("original")
):
    _check_img(file.filename)
    tmp = await save_upload(file)
    try:
        from PIL import Image, ImageFilter, ImageOps, ImageEnhance
        img = _open_image(tmp).convert("RGBA")

        if filter_name == "grayscale":
            img = ImageOps.grayscale(img).convert("RGBA")
        elif filter_name == "sepia":
            gray = ImageOps.grayscale(img)
            sepia = Image.merge("RGB", [
                gray.point(lambda x: min(255, x * 1.1)),
                gray.point(lambda x: min(255, x * 0.9)),
                gray.point(lambda x: min(255, x * 0.7)),
            ])
            img = sepia.convert("RGBA")
        elif filter_name == "blur":
            img = img.filter(ImageFilter.GaussianBlur(radius=max(1, int(intensity * 3))))
        elif filter_name == "sharpen":
            for _ in range(max(1, int(intensity))):
                img = img.filter(ImageFilter.SHARPEN)
        elif filter_name == "brightness":
            img = ImageEnhance.Brightness(img).enhance(intensity)
        elif filter_name == "contrast":
            img = ImageEnhance.Contrast(img).enhance(intensity)
        elif filter_name == "invert":
            r, g, b, a = img.split()
            rgb = Image.merge("RGB", (r, g, b))
            inverted = ImageOps.invert(rgb)
            img = Image.merge("RGBA", (*inverted.split(), a))
        elif filter_name == "emboss":
            img = img.filter(ImageFilter.EMBOSS)
        elif filter_name == "edge":
            img = img.filter(ImageFilter.FIND_EDGES)

        fmt, ext = _resolve_format(output_format, file.filename)
        out = output_path(ext)
        _save_image(img, out, fmt)
        return {"url": file_download_url(out.name), "filename": out.name}
    finally:
        cleanup(tmp)


# ═══════════════════════════════════════════════════════════════════════════════
#  WATERMARK
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/watermark")
async def watermark_image(
    file: UploadFile = File(...),
    text: str = Form("Watermark"),
    opacity: int = Form(40),         # 0–100
    position: str = Form("center"),  # center|topleft|topright|bottomleft|bottomright
    output_format: str = Form("original")
):
    _check_img(file.filename)
    tmp = await save_upload(file)
    try:
        from PIL import Image, ImageDraw, ImageFont
        img = _open_image(tmp).convert("RGBA")
        w, h = img.size
        overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        font_size = max(20, w // 20)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except Exception:
            font = ImageFont.load_default()

        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

        positions = {
            "center": ((w - tw) // 2, (h - th) // 2),
            "topleft": (20, 20),
            "topright": (w - tw - 20, 20),
            "bottomleft": (20, h - th - 20),
            "bottomright": (w - tw - 20, h - th - 20),
        }
        pos = positions.get(position, positions["center"])
        alpha = int(255 * opacity / 100)
        draw.text(pos, text, fill=(255, 255, 255, alpha), font=font)
        draw.text((pos[0]+2, pos[1]+2), text, fill=(0, 0, 0, alpha // 2), font=font)
        result = Image.alpha_composite(img, overlay)

        fmt, ext = _resolve_format(output_format, file.filename)
        out = output_path(ext)
        _save_image(result, out, fmt)
        return {"url": file_download_url(out.name), "filename": out.name}
    finally:
        cleanup(tmp)


# ═══════════════════════════════════════════════════════════════════════════════
#  BULK CONVERT (ZIP)
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/bulk-convert")
async def bulk_convert(
    files: list[UploadFile] = File(...),
    output_format: str = Form("webp"),
    quality: int = Form(85)
):
    """Accept multiple images, convert all, return as ZIP."""
    if not files:
        raise HTTPException(400, "No files provided")
    out_zip = output_path(".zip")
    tmps = []
    try:
        from PIL import Image
        fmt, ext = _resolve_format(output_format, None)
        with zipfile.ZipFile(str(out_zip), "w", zipfile.ZIP_DEFLATED) as zf:
            for upload in files:
                _check_img(upload.filename)
                tmp = await save_upload(upload)
                tmps.append(tmp)
                img = Image.open(str(tmp))
                buf = io.BytesIO()
                _save_pil(img, buf, fmt, quality)
                stem = Path(upload.filename).stem
                zf.writestr(f"{stem}{ext}", buf.getvalue())
        return {
            "url": file_download_url(out_zip.name),
            "filename": out_zip.name,
            "count": len(files)
        }
    finally:
        for t in tmps:
            cleanup(t)


# ═══════════════════════════════════════════════════════════════════════════════
#  IMAGE → BASE64
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/to-base64")
async def image_to_base64(file: UploadFile = File(...)):
    _check_img(file.filename)
    tmp = await save_upload(file)
    try:
        data = tmp.read_bytes()
        mime = _mime(file.filename)
        b64 = base64.b64encode(data).decode()
        data_url = f"data:{mime};base64,{b64}"
        return {"data_url": data_url, "mime": mime, "size_bytes": len(data)}
    finally:
        cleanup(tmp)


# ═══════════════════════════════════════════════════════════════════════════════
#  METADATA
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/metadata")
async def image_metadata(file: UploadFile = File(...)):
    _check_img(file.filename)
    tmp = await save_upload(file)
    try:
        from PIL import Image
        from PIL.ExifTags import TAGS
        img = Image.open(str(tmp))
        info = {
            "filename": file.filename,
            "format": img.format,
            "mode": img.mode,
            "width": img.width,
            "height": img.height,
            "megapixels": round(img.width * img.height / 1_000_000, 2),
            "file_size_bytes": tmp.stat().st_size,
            "aspect_ratio": _aspect(img.width, img.height),
        }
        # EXIF
        try:
            exif_data = img._getexif()
            if exif_data:
                exif = {TAGS.get(k, k): str(v) for k, v in exif_data.items() if k in TAGS}
                info["exif"] = exif
        except Exception:
            pass
        return info
    finally:
        cleanup(tmp)


# ═══════════════════════════════════════════════════════════════════════════════
#  PRIVATE HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def _resolve_format(fmt: str, original_filename):
    fmt = fmt.lower().strip()
    if fmt == "original" and original_filename:
        ext = Path(original_filename).suffix.lower()
        mapping = {".jpg": "JPEG", ".jpeg": "JPEG", ".png": "PNG",
                   ".webp": "WEBP", ".bmp": "BMP", ".gif": "GIF", ".tiff": "TIFF"}
        pil_fmt = mapping.get(ext, "PNG")
        return pil_fmt, ext
    mapping = {
        "jpeg": ("JPEG", ".jpg"), "jpg": ("JPEG", ".jpg"),
        "png":  ("PNG",  ".png"), "webp": ("WEBP", ".webp"),
        "bmp":  ("BMP",  ".bmp"), "gif":  ("GIF",  ".gif"),
        "tiff": ("TIFF", ".tiff"),
    }
    return mapping.get(fmt, ("PNG", ".png"))


def _save_image(img, path, fmt, quality=92):
    from PIL import Image
    if fmt == "JPEG" and img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    if fmt == "BMP" and img.mode == "RGBA":
        img = img.convert("RGB")
    _save_pil(img, str(path), fmt, quality)


def _save_pil(img, dest, fmt, quality=92):
    kwargs = {}
    if fmt in ("JPEG",):
        kwargs["quality"] = quality
        kwargs["optimize"] = True
    elif fmt == "WEBP":
        kwargs["quality"] = quality
        kwargs["method"] = 6
    elif fmt == "PNG":
        kwargs["optimize"] = True
    img.save(dest, format=fmt, **kwargs)


def _mime(filename):
    ext = Path(filename).suffix.lower()
    return {
        ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".webp": "image/webp", ".bmp": "image/bmp", ".gif": "image/gif",
        ".tiff": "image/tiff"
    }.get(ext, "image/png")


def _aspect(w, h):
    from math import gcd
    g = gcd(w, h)
    return f"{w//g}:{h//g}"
