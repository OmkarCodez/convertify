# ⚡ Convertify — Full-Stack File Conversion Utility

All-in-one file converter with a **Python FastAPI backend** and a **vanilla JS frontend**.
Everything is processed server-side — no browser limitations.

---

## 📁 Project Structure

```
convertify-full/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt         # Python dependencies
│   ├── routers/
│   │   ├── documents.py         # PDF, Word, Excel, PPT conversions
│   │   ├── images.py            # Image resize, compress, filter, etc.
│   │   └── data_code.py         # JSON, XML, YAML, CSS, Base64 tools
│   ├── utils/
│   │   └── helpers.py           # Shared file utilities
│   ├── uploads/                 # Temp upload storage (auto-cleared)
│   └── outputs/                 # Processed files (auto-deleted after download)
└── frontend/
    ├── index.html               # Main UI
    ├── css/style.css            # Dark industrial theme
    └── js/
        ├── api.js               # All backend API calls
        ├── ui.js                # Dropzone, progress, toast, modal helpers
        ├── tools.js             # HTML templates for all tool modals
        └── main.js              # Full tool logic wired to API
```

---

## 🚀 Quick Start

### 1. Install Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install system dependencies (for full functionality)

**Ubuntu / Debian:**
```bash
sudo apt install libreoffice poppler-utils default-jre
```

**macOS (Homebrew):**
```bash
brew install libreoffice poppler openjdk
```

**Windows:**
- Install [LibreOffice](https://www.libreoffice.org/download/download/)
- Install [Poppler for Windows](https://github.com/oschwartz10612/poppler-windows/releases)
- Install [Java JRE](https://www.java.com/en/download/)

### 3. Start the backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Open the frontend

Open `frontend/index.html` in your browser, **or** serve it:

```bash
cd frontend
python -m http.server 3000
# Visit http://localhost:3000
```

The frontend auto-detects the API at `localhost:8000`.

---

## 🌐 API Docs

Once running, visit: **http://localhost:8000/docs** for the interactive Swagger UI.

---

## 📦 All Supported Conversions

### 📄 Documents
| Conversion | Endpoint | Library |
|---|---|---|
| PDF → Text | `/api/documents/pdf-to-text` | pypdf |
| PDF → HTML | `/api/documents/pdf-to-html` | pypdf |
| PDF → Word | `/api/documents/pdf-to-word` | pdf2docx |
| PDF → Excel | `/api/documents/pdf-to-excel` | tabula-py |
| PDF → Images (ZIP) | `/api/documents/pdf-to-images` | pdf2image + poppler |
| HTML → PDF | `/api/documents/html-to-pdf` | WeasyPrint |
| Word → PDF | `/api/documents/word-to-pdf` | LibreOffice |
| Word → HTML | `/api/documents/word-to-html` | mammoth |
| Word → Text | `/api/documents/word-to-text` | python-docx |
| Excel → CSV | `/api/documents/excel-to-csv` | openpyxl |
| Excel → JSON | `/api/documents/excel-to-json` | openpyxl |
| Excel → PDF | `/api/documents/excel-to-pdf` | LibreOffice |
| CSV → Excel | `/api/documents/csv-to-excel` | openpyxl |
| PPT → Text | `/api/documents/ppt-to-text` | python-pptx |
| PPT → PDF | `/api/documents/ppt-to-pdf` | LibreOffice |
| Markdown → HTML | `/api/documents/markdown-to-html` | markdown2 |
| CSV → JSON | `/api/documents/csv-to-json` | built-in |
| JSON → CSV | `/api/documents/json-to-csv` | built-in |
| JSON → XML | `/api/documents/json-to-xml` | built-in |
| XML → JSON | `/api/documents/xml-to-json` | built-in |

### 🖼️ Images
| Tool | Endpoint | Notes |
|---|---|---|
| Resize | `/api/images/resize` | Pixels or %, aspect lock |
| Compress | `/api/images/compress` | Quality + max dimensions |
| Format Convert | `/api/images/convert-format` | PNG/JPG/WEBP/BMP/GIF/TIFF |
| Crop | `/api/images/crop` | Exact coords or preset ratios |
| Rotate & Flip | `/api/images/rotate` | Any angle, H/V flip |
| Watermark | `/api/images/watermark` | Text, opacity, 5 positions |
| Filters | `/api/images/filter` | 9 filters with intensity |
| Bulk Convert | `/api/images/bulk-convert` | Multi-file → ZIP |
| Metadata + EXIF | `/api/images/metadata` | Full EXIF extraction |
| Image → Base64 | `/api/images/to-base64` | Returns data URL |

### 💻 Data & Code
| Tool | Endpoints |
|---|---|
| JSON | beautify / minify / validate / download |
| XML | beautify / minify / validate / download |
| HTML | beautify / minify / download |
| CSS | beautify / minify / download |
| YAML ↔ JSON | to-json / from-json / download |
| Base64 | encode-text / decode-text / encode-file / decode-file |
| CSV | beautify (aligned table view) |

---

## ☁️ Deployment Options

### Option A: Railway (Recommended — Free Tier)

1. Push the `backend/` folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Update `API_BASE` in `frontend/js/api.js` to your Railway URL

### Option B: Render (Free Tier)

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo (backend folder)
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port 10000`

### Option C: VPS / Self-hosted

```bash
# Install with gunicorn for production
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

Use **Nginx** as a reverse proxy in front of it.

---

## ⚠️ Dependency Notes

| Feature | Requires |
|---|---|
| Word/Excel/PPT → PDF | LibreOffice (`soffice` in PATH) |
| PDF → Images | poppler-utils (`pdftoppm` in PATH) |
| PDF table extraction | Java JRE (for tabula-py) |
| HTML → PDF | WeasyPrint + system libs (cairo, pango) |

Most conversions (JSON, XML, image processing, Base64, etc.) work with **pip packages only**.

---

## 🔧 Environment Variables (Optional)

```env
# .env in backend/
MAX_FILE_SIZE_MB=50          # Max upload size (default: no limit)
UPLOAD_DIR=/tmp/convertify   # Custom temp directory
```
