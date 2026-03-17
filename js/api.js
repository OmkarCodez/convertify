/* ── API CLIENT ──────────────────────────────────────────────────────────────
   Handles all communication with the FastAPI backend.
   BASE_URL auto-detects: same-origin in production, localhost in dev.
   ─────────────────────────────────────────────────────────────────────────── */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000'
  : 'https://YOUR-RENDER-URL.onrender.com';  // REPLACE WITH YOUR RENDER URL

// ── Health check ──────────────────────────────────────────────────────────────
async function apiHealth() {
  try {
    const r = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
    return r.ok;
  } catch { return false; }
}

// ── Core request with upload progress ────────────────────────────────────────
function apiRequest(endpoint, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}${endpoint}`);

    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round(e.loaded / e.total * 100));
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 400) reject(data.detail || 'Server error');
        else resolve(data);
      } catch {
        reject('Invalid server response');
      }
    });

    xhr.addEventListener('error', () => reject('Network error — is the backend running?'));
    xhr.addEventListener('timeout', () => reject('Request timed out'));
    xhr.timeout = 120000; // 2 minute timeout for large files
    xhr.send(formData);
  });
}

// ── Build download URL ────────────────────────────────────────────────────────
function downloadUrl(filename) {
  return `${API_BASE}/api/download/${filename}`;
}

// ── Trigger browser download ──────────────────────────────────────────────────
function triggerDownload(filename, displayName) {
  const a = document.createElement('a');
  a.href = downloadUrl(filename);
  a.download = displayName || filename;
  a.click();
}

// ── API ENDPOINTS ─────────────────────────────────────────────────────────────

const API = {

  // ── Documents ──
  documents: {
    pdfToText:       (fd, p) => apiRequest('/api/documents/pdf-to-text',       fd, p),
    pdfToHtml:       (fd, p) => apiRequest('/api/documents/pdf-to-html',       fd, p),
    pdfToWord:       (fd, p) => apiRequest('/api/documents/pdf-to-word',       fd, p),
    pdfToExcel:      (fd, p) => apiRequest('/api/documents/pdf-to-excel',      fd, p),
    pdfToImages:     (fd, p) => apiRequest('/api/documents/pdf-to-images',     fd, p),
    htmlToPdf:       (fd, p) => apiRequest('/api/documents/html-to-pdf',       fd, p),
    wordToPdf:       (fd, p) => apiRequest('/api/documents/word-to-pdf',       fd, p),
    wordToHtml:      (fd, p) => apiRequest('/api/documents/word-to-html',      fd, p),
    wordToText:      (fd, p) => apiRequest('/api/documents/word-to-text',      fd, p),
    excelToCsv:      (fd, p) => apiRequest('/api/documents/excel-to-csv',      fd, p),
    excelToJson:     (fd, p) => apiRequest('/api/documents/excel-to-json',     fd, p),
    csvToExcel:      (fd, p) => apiRequest('/api/documents/csv-to-excel',      fd, p),
    excelToPdf:      (fd, p) => apiRequest('/api/documents/excel-to-pdf',      fd, p),
    pptToText:       (fd, p) => apiRequest('/api/documents/ppt-to-text',       fd, p),
    pptToPdf:        (fd, p) => apiRequest('/api/documents/ppt-to-pdf',        fd, p),
    markdownToHtml:  (fd, p) => apiRequest('/api/documents/markdown-to-html',  fd, p),
    csvToJson:       (fd, p) => apiRequest('/api/documents/csv-to-json',       fd, p),
    jsonToCsv:       (fd, p) => apiRequest('/api/documents/json-to-csv',       fd, p),
    jsonToXml:       (fd, p) => apiRequest('/api/documents/json-to-xml',       fd, p),
    xmlToJson:       (fd, p) => apiRequest('/api/documents/xml-to-json',       fd, p),
  },

  // ── Images ──
  images: {
    resize:        (fd, p) => apiRequest('/api/images/resize',         fd, p),
    compress:      (fd, p) => apiRequest('/api/images/compress',       fd, p),
    convertFormat: (fd, p) => apiRequest('/api/images/convert-format', fd, p),
    crop:          (fd, p) => apiRequest('/api/images/crop',           fd, p),
    rotate:        (fd, p) => apiRequest('/api/images/rotate',         fd, p),
    filter:        (fd, p) => apiRequest('/api/images/filter',         fd, p),
    watermark:     (fd, p) => apiRequest('/api/images/watermark',      fd, p),
    bulkConvert:   (fd, p) => apiRequest('/api/images/bulk-convert',   fd, p),
    toBase64:      (fd, p) => apiRequest('/api/images/to-base64',      fd, p),
    metadata:      (fd, p) => apiRequest('/api/images/metadata',       fd, p),
  },

  // ── Data & Code ──
  data: {
    jsonBeautify:      (fd, p) => apiRequest('/api/data/json/beautify',          fd, p),
    jsonMinify:        (fd, p) => apiRequest('/api/data/json/minify',            fd, p),
    jsonValidate:      (fd, p) => apiRequest('/api/data/json/validate',          fd, p),
    jsonDownload:      (fd, p) => apiRequest('/api/data/json/download',          fd, p),
    xmlBeautify:       (fd, p) => apiRequest('/api/data/xml/beautify',           fd, p),
    xmlMinify:         (fd, p) => apiRequest('/api/data/xml/minify',             fd, p),
    xmlValidate:       (fd, p) => apiRequest('/api/data/xml/validate',           fd, p),
    xmlDownload:       (fd, p) => apiRequest('/api/data/xml/download',           fd, p),
    htmlBeautify:      (fd, p) => apiRequest('/api/data/html/beautify',          fd, p),
    htmlMinify:        (fd, p) => apiRequest('/api/data/html/minify',            fd, p),
    htmlDownload:      (fd, p) => apiRequest('/api/data/html/download',          fd, p),
    cssBeautify:       (fd, p) => apiRequest('/api/data/css/beautify',           fd, p),
    cssMinify:         (fd, p) => apiRequest('/api/data/css/minify',             fd, p),
    cssDownload:       (fd, p) => apiRequest('/api/data/css/download',           fd, p),
    yamlToJson:        (fd, p) => apiRequest('/api/data/yaml/to-json',           fd, p),
    jsonToYaml:        (fd, p) => apiRequest('/api/data/yaml/from-json',         fd, p),
    yamlDownload:      (fd, p) => apiRequest('/api/data/yaml/download',          fd, p),
    b64EncodeText:     (fd, p) => apiRequest('/api/data/base64/encode-text',     fd, p),
    b64DecodeText:     (fd, p) => apiRequest('/api/data/base64/decode-text',     fd, p),
    b64EncodeFile:     (fd, p) => apiRequest('/api/data/base64/encode-file',     fd, p),
    b64DecodeFile:     (fd, p) => apiRequest('/api/data/base64/decode-file',     fd, p),
    csvBeautify:       (fd, p) => apiRequest('/api/data/csv/beautify',           fd, p),
  },
};
