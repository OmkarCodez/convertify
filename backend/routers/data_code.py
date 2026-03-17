"""
Data & Code Router
Handles: JSON beautify/minify/validate, XML beautify/minify/validate,
         YAML ↔ JSON, HTML beautify/minify, CSS beautify/minify,
         CSV beautify, Base64 encode/decode (text & file)
"""

import io
import json
import base64
import csv
import re
import xml.dom.minidom as minidom
import xml.etree.ElementTree as ET
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from fastapi.responses import JSONResponse

from utils.helpers import save_upload, output_path, cleanup, file_download_url

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════════
#  JSON TOOLS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/json/beautify")
async def json_beautify(
    file: UploadFile = File(None),
    text: str = Form(None),
    indent: int = Form(2),
    sort_keys: bool = Form(False)
):
    """Beautify / format JSON from file or raw text."""
    raw = await _get_text(file, text, [".json", ".txt"])
    try:
        obj = json.loads(raw)
        result = json.dumps(obj, indent=indent, sort_keys=sort_keys, ensure_ascii=False)
        return {"result": result, "valid": True}
    except json.JSONDecodeError as e:
        raise HTTPException(400, f"Invalid JSON: {e}")


@router.post("/json/minify")
async def json_minify(
    file: UploadFile = File(None),
    text: str = Form(None)
):
    raw = await _get_text(file, text, [".json", ".txt"])
    try:
        obj = json.loads(raw)
        return {"result": json.dumps(obj, separators=(",", ":"), ensure_ascii=False)}
    except json.JSONDecodeError as e:
        raise HTTPException(400, f"Invalid JSON: {e}")


@router.post("/json/validate")
async def json_validate(
    file: UploadFile = File(None),
    text: str = Form(None)
):
    raw = await _get_text(file, text, [".json", ".txt"])
    try:
        obj = json.loads(raw)
        return {
            "valid": True,
            "type": type(obj).__name__,
            "keys": len(obj) if isinstance(obj, dict) else None,
            "items": len(obj) if isinstance(obj, list) else None
        }
    except json.JSONDecodeError as e:
        return {"valid": False, "error": str(e), "line": e.lineno, "col": e.colno}


@router.post("/json/download")
async def json_download(
    file: UploadFile = File(None),
    text: str = Form(None),
    indent: int = Form(2),
    sort_keys: bool = Form(False)
):
    raw = await _get_text(file, text, [".json", ".txt"])
    try:
        obj = json.loads(raw)
        result = json.dumps(obj, indent=indent, sort_keys=sort_keys, ensure_ascii=False)
        out = output_path(".json")
        out.write_text(result, encoding="utf-8")
        return {"url": file_download_url(out.name), "filename": out.name}
    except json.JSONDecodeError as e:
        raise HTTPException(400, f"Invalid JSON: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
#  XML TOOLS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/xml/beautify")
async def xml_beautify(
    file: UploadFile = File(None),
    text: str = Form(None),
    indent: str = Form("  ")
):
    raw = await _get_text(file, text, [".xml", ".txt"])
    try:
        dom = minidom.parseString(raw.encode("utf-8"))
        pretty = dom.toprettyxml(indent=indent)
        # Remove extra blank lines minidom adds
        lines = [l for l in pretty.splitlines() if l.strip()]
        return {"result": "\n".join(lines)}
    except Exception as e:
        raise HTTPException(400, f"Invalid XML: {e}")


@router.post("/xml/minify")
async def xml_minify(
    file: UploadFile = File(None),
    text: str = Form(None)
):
    raw = await _get_text(file, text, [".xml", ".txt"])
    try:
        ET.fromstring(raw)  # validate
        result = re.sub(r">\s+<", "><", raw).strip()
        return {"result": result}
    except ET.ParseError as e:
        raise HTTPException(400, f"Invalid XML: {e}")


@router.post("/xml/validate")
async def xml_validate(
    file: UploadFile = File(None),
    text: str = Form(None)
):
    raw = await _get_text(file, text, [".xml", ".txt"])
    try:
        root = ET.fromstring(raw)
        return {"valid": True, "root_tag": root.tag, "children": len(list(root))}
    except ET.ParseError as e:
        return {"valid": False, "error": str(e)}


@router.post("/xml/download")
async def xml_download(
    file: UploadFile = File(None),
    text: str = Form(None),
    indent: str = Form("  ")
):
    raw = await _get_text(file, text, [".xml", ".txt"])
    try:
        dom = minidom.parseString(raw.encode("utf-8"))
        pretty = dom.toprettyxml(indent=indent)
        lines = [l for l in pretty.splitlines() if l.strip()]
        out = output_path(".xml")
        out.write_text("\n".join(lines), encoding="utf-8")
        return {"url": file_download_url(out.name), "filename": out.name}
    except Exception as e:
        raise HTTPException(400, f"Invalid XML: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
#  HTML TOOLS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/html/beautify")
async def html_beautify(
    file: UploadFile = File(None),
    text: str = Form(None)
):
    raw = await _get_text(file, text, [".html", ".htm", ".txt"])
    result = _format_html(raw)
    return {"result": result}


@router.post("/html/minify")
async def html_minify(
    file: UploadFile = File(None),
    text: str = Form(None)
):
    raw = await _get_text(file, text, [".html", ".htm", ".txt"])
    result = re.sub(r"\s{2,}", " ", raw)
    result = re.sub(r">\s+<", "><", result)
    result = re.sub(r"<!--.*?-->", "", result, flags=re.DOTALL)
    return {"result": result.strip()}


@router.post("/html/download")
async def html_download(
    file: UploadFile = File(None),
    text: str = Form(None),
    mode: str = Form("beautify")
):
    raw = await _get_text(file, text, [".html", ".htm", ".txt"])
    result = _format_html(raw) if mode == "beautify" else re.sub(r"\s{2,}", " ", raw).strip()
    out = output_path(".html")
    out.write_text(result, encoding="utf-8")
    return {"url": file_download_url(out.name), "filename": out.name}


# ═══════════════════════════════════════════════════════════════════════════════
#  CSS TOOLS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/css/beautify")
async def css_beautify(
    file: UploadFile = File(None),
    text: str = Form(None)
):
    raw = await _get_text(file, text, [".css", ".txt"])
    result = _format_css(raw)
    return {"result": result}


@router.post("/css/minify")
async def css_minify(
    file: UploadFile = File(None),
    text: str = Form(None)
):
    raw = await _get_text(file, text, [".css", ".txt"])
    result = _minify_css(raw)
    return {"result": result}


@router.post("/css/download")
async def css_download(
    file: UploadFile = File(None),
    text: str = Form(None),
    mode: str = Form("beautify")
):
    raw = await _get_text(file, text, [".css", ".txt"])
    result = _format_css(raw) if mode == "beautify" else _minify_css(raw)
    out = output_path(".css")
    out.write_text(result, encoding="utf-8")
    return {"url": file_download_url(out.name), "filename": out.name}


# ═══════════════════════════════════════════════════════════════════════════════
#  YAML ↔ JSON
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/yaml/to-json")
async def yaml_to_json(
    file: UploadFile = File(None),
    text: str = Form(None),
    indent: int = Form(2)
):
    raw = await _get_text(file, text, [".yaml", ".yml", ".txt"])
    try:
        import yaml
        obj = yaml.safe_load(raw)
        result = json.dumps(obj, indent=indent, ensure_ascii=False)
        return {"result": result}
    except ImportError:
        raise HTTPException(500, "PyYAML not installed. Run: pip install pyyaml")
    except Exception as e:
        raise HTTPException(400, f"Invalid YAML: {e}")


@router.post("/yaml/from-json")
async def json_to_yaml(
    file: UploadFile = File(None),
    text: str = Form(None)
):
    raw = await _get_text(file, text, [".json", ".txt"])
    try:
        import yaml
        obj = json.loads(raw)
        result = yaml.dump(obj, default_flow_style=False, allow_unicode=True, sort_keys=False)
        return {"result": result}
    except ImportError:
        raise HTTPException(500, "PyYAML not installed.")
    except json.JSONDecodeError as e:
        raise HTTPException(400, f"Invalid JSON: {e}")


@router.post("/yaml/download")
async def yaml_download(
    file: UploadFile = File(None),
    text: str = Form(None),
    direction: str = Form("yaml-to-json")  # yaml-to-json | json-to-yaml
):
    raw = await _get_text(file, text, [".yaml", ".yml", ".json", ".txt"])
    try:
        import yaml
        if direction == "yaml-to-json":
            obj = yaml.safe_load(raw)
            result = json.dumps(obj, indent=2, ensure_ascii=False)
            out = output_path(".json")
        else:
            obj = json.loads(raw)
            result = yaml.dump(obj, default_flow_style=False, allow_unicode=True)
            out = output_path(".yaml")
        out.write_text(result, encoding="utf-8")
        return {"url": file_download_url(out.name), "filename": out.name}
    except ImportError:
        raise HTTPException(500, "PyYAML not installed.")
    except Exception as e:
        raise HTTPException(400, str(e))


# ═══════════════════════════════════════════════════════════════════════════════
#  BASE64 ENCODE/DECODE
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/base64/encode-text")
async def base64_encode_text(text: str = Form(...)):
    encoded = base64.b64encode(text.encode("utf-8")).decode("ascii")
    return {"result": encoded}


@router.post("/base64/decode-text")
async def base64_decode_text(text: str = Form(...)):
    try:
        decoded = base64.b64decode(text.strip()).decode("utf-8")
        return {"result": decoded}
    except Exception as e:
        raise HTTPException(400, f"Invalid Base64: {e}")


@router.post("/base64/encode-file")
async def base64_encode_file(file: UploadFile = File(...)):
    tmp = await save_upload(file)
    try:
        data = tmp.read_bytes()
        encoded = base64.b64encode(data).decode("ascii")
        mime = _guess_mime(file.filename)
        data_url = f"data:{mime};base64,{encoded}"
        return {"result": encoded, "data_url": data_url, "size_bytes": len(data)}
    finally:
        cleanup(tmp)


@router.post("/base64/decode-file")
async def base64_decode_file(
    text: str = Form(...),
    output_filename: str = Form("decoded_file")
):
    try:
        # Strip data URL prefix if present
        if "base64," in text:
            text = text.split("base64,", 1)[1]
        data = base64.b64decode(text.strip())
        out = output_path(Path(output_filename).suffix or ".bin")
        out.write_bytes(data)
        return {"url": file_download_url(out.name), "filename": out.name, "size_bytes": len(data)}
    except Exception as e:
        raise HTTPException(400, f"Invalid Base64: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
#  CSV BEAUTIFY
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/csv/beautify")
async def csv_beautify(
    file: UploadFile = File(None),
    text: str = Form(None)
):
    """Return CSV as an aligned table string and parsed data."""
    raw = await _get_text(file, text, [".csv", ".txt"])
    try:
        reader = csv.reader(io.StringIO(raw))
        rows = list(reader)
        if not rows:
            return {"result": "", "data": []}
        # Compute column widths
        widths = [max(len(str(r[i])) for r in rows if i < len(r)) for i in range(len(rows[0]))]
        lines = []
        sep = "+" + "+".join("-" * (w + 2) for w in widths) + "+"
        for i, row in enumerate(rows):
            cells = "| " + " | ".join(str(row[j]).ljust(widths[j]) if j < len(row) else " " * widths[j] for j in range(len(widths))) + " |"
            lines.append(sep)
            lines.append(cells)
            if i == 0:
                lines.append(sep.replace("-", "="))
        lines.append(sep)
        # Also return structured data
        headers = rows[0]
        data = [dict(zip(headers, row)) for row in rows[1:]]
        return {"result": "\n".join(lines), "data": data, "rows": len(data), "columns": len(headers)}
    except Exception as e:
        raise HTTPException(400, f"CSV parse error: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
#  PRIVATE HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

async def _get_text(file, text, allowed_exts):
    """Get raw text from uploaded file OR form text field."""
    if file and file.filename:
        ext = Path(file.filename).suffix.lower()
        if allowed_exts and ext not in allowed_exts:
            raise HTTPException(400, f"Expected {allowed_exts}, got '{ext}'")
        tmp = await save_upload(file)
        try:
            return tmp.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            return tmp.read_text(encoding="latin-1")
        finally:
            cleanup(tmp)
    elif text:
        return text
    else:
        raise HTTPException(400, "Provide either a file or text input")


def _format_html(html: str) -> str:
    SELF_CLOSING = {"area","base","br","col","embed","hr","img","input",
                    "link","meta","param","source","track","wbr"}
    lines, indent = [], 0
    tokens = re.split(r"(<[^>]+>)", html)
    for token in tokens:
        token = token.strip()
        if not token:
            continue
        if re.match(r"^</", token):
            indent = max(0, indent - 1)
            lines.append("  " * indent + token)
        elif re.match(r"^<[^/!]", token):
            lines.append("  " * indent + token)
            tag = re.match(r"^<(\w+)", token)
            if tag and tag.group(1).lower() not in SELF_CLOSING and not token.endswith("/>"):
                indent += 1
        else:
            if token:
                lines.append("  " * indent + token)
    return "\n".join(lines)


def _format_css(css: str) -> str:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)
    css = re.sub(r"\s*{\s*", " {\n", css)
    css = re.sub(r"\s*}\s*", "\n}\n", css)
    css = re.sub(r";\s*", ";\n  ", css)
    css = re.sub(r"\n\s*\n", "\n", css)
    lines = []
    for line in css.splitlines():
        stripped = line.strip()
        if stripped.endswith("{"):
            lines.append(stripped)
        elif stripped == "}":
            lines.append("}")
        elif stripped:
            lines.append("  " + stripped)
    return "\n".join(lines).strip()


def _minify_css(css: str) -> str:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*{\s*", "{", css)
    css = re.sub(r"\s*}\s*", "}", css)
    css = re.sub(r"\s*;\s*", ";", css)
    css = re.sub(r"\s*:\s*", ":", css)
    return css.strip()


def _guess_mime(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    mapping = {
        ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".gif": "image/gif", ".webp": "image/webp", ".bmp": "image/bmp",
        ".pdf": "application/pdf", ".txt": "text/plain", ".html": "text/html",
        ".json": "application/json", ".xml": "application/xml",
        ".csv": "text/csv", ".zip": "application/zip",
    }
    return mapping.get(ext, "application/octet-stream")
