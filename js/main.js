/* ── MAIN APP LOGIC ──────────────────────────────────────────────────────────
   Wires every tool's UI to the backend API. Each initToolLogic() call
   sets up dropzones, buttons, and response handling for a specific tool.
   ─────────────────────────────────────────────────────────────────────────── */

// ── NAV TAB SWITCHING ─────────────────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

// ── API HEALTH CHECK ──────────────────────────────────────────────────────────
(async () => {
  const ok = await apiHealth();
  const dot = document.querySelector('.dot');
  const lbl = document.querySelector('.api-label');
  if (ok) {
    dot.classList.add('online');
    lbl.textContent = 'API Online';
  } else {
    dot.classList.add('offline');
    lbl.textContent = 'API Offline';
    toast('Backend not reachable. Start with: uvicorn main:app --reload', 'err', 8000);
  }
})();

// ── TOOL LOGIC DISPATCHER ─────────────────────────────────────────────────────
function initToolLogic(id) {
  setupInnerTabs();
  const fns = {
    // Documents
    'pdf-to-text':       initPdfToText,
    'pdf-to-html':       () => initSimpleDocTool('pdf-to-html', API.documents.pdfToHtml, '.pdf'),
    'pdf-to-word':       () => initSimpleDocTool('pdf-to-word', API.documents.pdfToWord, '.pdf'),
    'pdf-to-excel':      () => initSimpleDocTool('pdf-to-excel', API.documents.pdfToExcel, '.pdf'),
    'pdf-to-images':     initPdfToImages,
    'html-to-pdf':       () => initSimpleDocTool('html-to-pdf', API.documents.htmlToPdf, '.html,.htm'),
    'word-to-pdf':       () => initSimpleDocTool('word-to-pdf', API.documents.wordToPdf, '.docx,.doc'),
    'word-to-html':      () => initSimpleDocTool('word-to-html', API.documents.wordToHtml, '.docx'),
    'word-to-text':      initWordToText,
    'excel-to-csv':      initExcelToCsv,
    'excel-to-json':     initExcelToJson,
    'csv-to-excel':      () => initSimpleDocTool('csv-to-excel', API.documents.csvToExcel, '.csv,.txt'),
    'excel-to-pdf':      () => initSimpleDocTool('excel-to-pdf', API.documents.excelToPdf, '.xlsx,.xls'),
    'ppt-to-text':       initPptToText,
    'ppt-to-pdf':        () => initSimpleDocTool('ppt-to-pdf', API.documents.pptToPdf, '.pptx,.ppt'),
    'markdown-to-html':  () => initSimpleDocTool('markdown-to-html', API.documents.markdownToHtml, '.md,.markdown,.txt'),
    'csv-to-json':       initCsvToJson,
    'json-to-csv':       () => initSimpleDocTool('json-to-csv', API.documents.jsonToCsv, '.json'),
    // Images
    'img-resize':    initImgResize,
    'img-compress':  initImgCompress,
    'img-convert':   initImgConvert,
    'img-crop':      initImgCrop,
    'img-rotate':    initImgRotate,
    'img-watermark': initImgWatermark,
    'img-filter':    initImgFilter,
    'img-bulk':      initImgBulk,
    'img-metadata':  initImgMetadata,
    'img-base64':    initImgBase64,
    // Data
    'json-tool':     initJsonTool,
    'xml-tool':      initXmlTool,
    'html-tool':     initHtmlTool,
    'css-tool':      initCssTool,
    'yaml-tool':     initYamlTool,
    'base64-tool':   initBase64Tool,
    'csv-tool':      initCsvTool,
    'json-xml-tool': initJsonXmlTool,
  };
  if (fns[id]) fns[id]();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  GENERIC HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

let _selectedFile = null;

function initDropAndRun(dzId, fiId, accept, runBtnId, onRun) {
  _selectedFile = null;
  new DropZone(dzId, fiId, accept, f => { _selectedFile = f; });
  const btn = document.getElementById(runBtnId);
  if (btn) btn.onclick = () => {
    if (!_selectedFile) { toast('Please select a file first', 'err'); return; }
    onRun(_selectedFile);
  };
}

// Simple doc tool: upload file → backend → download
function initSimpleDocTool(toolId, apiFn, accept) {
  initDropAndRun('dz1','fi1', accept, 'run-btn', async file => {
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiFn(fd, pct);
      if (res.url) showDownload('dl-result', res.filename, res.filename);
      else if (res.text) showOutput('out-box', res.text, 'prose');
      toast('✓ Conversion complete!', 'ok');
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DOCUMENT TOOLS
// ═══════════════════════════════════════════════════════════════════════════════

function initPdfToText() {
  initDropAndRun('dz1','fi1','.pdf','run-btn', async file => {
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const fd = new FormData(); fd.append('file', file);
      const res = await API.documents.pdfToText(fd, pct);
      const box = document.getElementById('out-box');
      box.textContent = res.text;
      box.closest('.output-area').style.display = 'block';
      const copyBtn_ = document.getElementById('copy-out-btn');
      if (copyBtn_) copyBtn_.onclick = () => copyBtn(copyBtn_, res.text);
      toast(`✓ Extracted ${res.pages} page(s)`, 'ok');
    });
  });
}

function initWordToText() {
  initDropAndRun('dz1','fi1','.docx','run-btn', async file => {
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const fd = new FormData(); fd.append('file', file);
      const res = await API.documents.wordToText(fd, pct);
      const box = document.getElementById('out-box');
      box.textContent = res.text;
      box.closest('.output-area').style.display = 'block';
      const cb = document.getElementById('copy-out-btn');
      if (cb) cb.onclick = () => copyBtn(cb, res.text);
      toast('✓ Text extracted!', 'ok');
    });
  });
}

function initPdfToImages() {
  initDropAndRun('dz1','fi1','.pdf','run-btn', async file => {
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('dpi', document.getElementById('opt-dpi').value);
      fd.append('fmt', document.getElementById('opt-fmt').value);
      const res = await API.documents.pdfToImages(fd, pct);
      showDownload('dl-result', res.filename, res.filename);
      toast(`✓ ${res.pages} pages converted!`, 'ok');
    });
  });
}

function initExcelToCsv() {
  initDropAndRun('dz1','fi1','.xlsx,.xls','run-btn', async file => {
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('sheet', document.getElementById('opt-sheet').value);
      const res = await API.documents.excelToCsv(fd, pct);
      const box = document.getElementById('out-box');
      box.textContent = res.csv;
      box.closest('.output-area').style.display = 'block';
      const cb = document.getElementById('copy-out-btn');
      if (cb) cb.onclick = () => copyBtn(cb, res.csv);
      // Create downloadable CSV
      const blob = new Blob([res.csv], {type:'text/csv'});
      const url = URL.createObjectURL(blob);
      const dlArea = document.getElementById('dl-result');
      if (dlArea) {
        dlArea.classList.add('show');
        dlArea.querySelector('.dl-btn').onclick = () => {
          const a = document.createElement('a'); a.href = url; a.download = 'export.csv'; a.click();
        };
      }
      toast(`✓ Exported! Sheets: ${res.sheets?.join(', ')}`, 'ok');
    });
  });
}

function initExcelToJson() {
  initDropAndRun('dz1','fi1','.xlsx,.xls','run-btn', async file => {
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('sheet', document.getElementById('opt-sheet').value);
      const res = await API.documents.excelToJson(fd, pct);
      const out = JSON.stringify(res.data, null, 2);
      const box = document.getElementById('out-box');
      box.textContent = out;
      box.closest('.output-area').style.display = 'block';
      toast(`✓ ${res.data.length} rows converted!`, 'ok');
    });
  });
}

function initPptToText() {
  initDropAndRun('dz1','fi1','.pptx,.ppt','run-btn', async file => {
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const fd = new FormData(); fd.append('file', file);
      const res = await API.documents.pptToText(fd, pct);
      const lines = res.slides.map(s => `── Slide ${s.slide} ──\n${s.text}`).join('\n\n');
      const box = document.getElementById('out-box');
      box.textContent = lines;
      box.closest('.output-area').style.display = 'block';
      toast(`✓ ${res.count} slides extracted!`, 'ok');
    });
  });
}

function initCsvToJson() {
  initDropAndRun('dz1','fi1','.csv,.txt','run-btn', async file => {
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const fd = new FormData(); fd.append('file', file);
      const res = await API.documents.csvToJson(fd, pct);
      const out = JSON.stringify(res.data, null, 2);
      const box = document.getElementById('out-box');
      box.textContent = out;
      box.closest('.output-area').style.display = 'block';
      toast(`✓ ${res.count} rows converted!`, 'ok');
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  IMAGE TOOLS
// ═══════════════════════════════════════════════════════════════════════════════

function initImgTool(onFile) {
  _selectedFile = null;
  new DropZone('dz1','fi1','image/*', f => {
    _selectedFile = f;
    previewImage(f, 'preview-img', 'preview-meta');
    document.getElementById('preview-wrap').style.display = 'block';
    onFile && onFile(f);
  });
}

function initImgResize() {
  let origW = 0, origH = 0;
  initImgTool(f => {
    const img = document.getElementById('preview-img');
    img.onload = () => {
      origW = img.naturalWidth; origH = img.naturalHeight;
      document.getElementById('opt-w').value = origW;
      document.getElementById('opt-h').value = origH;
    };
  });
  document.getElementById('opt-w').addEventListener('input', e => {
    if (document.getElementById('opt-lock').checked && origH)
      document.getElementById('opt-h').value = Math.round(e.target.value * origH / origW);
  });
  document.getElementById('opt-h').addEventListener('input', e => {
    if (document.getElementById('opt-lock').checked && origW)
      document.getElementById('opt-w').value = Math.round(e.target.value * origW / origH);
  });
  document.getElementById('opt-angle')?.addEventListener('change', e => {
    document.getElementById('custom-angle-wrap').style.display = e.target.value === 'custom' ? 'flex' : 'none';
  });
  document.getElementById('run-btn').onclick = async () => {
    if (!_selectedFile) { toast('Select an image first', 'err'); return; }
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const activeTab = document.querySelector('.itab.active')?.dataset.panel;
      const fd = new FormData();
      fd.append('file', _selectedFile);
      if (activeTab === 'px') {
        const w = document.getElementById('opt-w').value;
        const h = document.getElementById('opt-h').value;
        if (w) fd.append('width', w);
        if (h) fd.append('height', h);
        fd.append('keep_aspect', document.getElementById('opt-lock').checked);
      } else {
        fd.append('scale', parseFloat(document.getElementById('opt-scale').value) / 100);
      }
      fd.append('output_format', document.getElementById('opt-fmt').value);
      const res = await API.images.resize(fd, pct);
      showDownload('dl-result', res.filename, res.filename);
      toast(`✓ Resized to ${res.result.width}×${res.result.height}px`, 'ok');
    });
  };
}

function initImgCompress() {
  initImgTool();
  document.getElementById('run-btn').onclick = async () => {
    if (!_selectedFile) { toast('Select an image first', 'err'); return; }
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const fd = new FormData();
      fd.append('file', _selectedFile);
      fd.append('quality', document.getElementById('opt-q').value);
      fd.append('output_format', document.getElementById('opt-fmt').value);
      const mw = document.getElementById('opt-mw').value;
      const mh = document.getElementById('opt-mh').value;
      if (mw) fd.append('max_width', mw);
      if (mh) fd.append('max_height', mh);
      const res = await API.images.compress(fd, pct);
      showDownload('dl-result', res.filename, res.filename);
      const stats = document.getElementById('compress-stats');
      if (stats) {
        stats.style.display = 'block';
        stats.textContent = `Original: ${formatBytes(res.original_bytes)} → Compressed: ${formatBytes(res.compressed_bytes)} (${res.reduction_pct}% smaller)`;
      }
      toast(`✓ Compressed! Saved ${res.reduction_pct}%`, 'ok');
    });
  };
}

function initImgConvert() {
  initImgTool();
  document.getElementById('run-btn').onclick = async () => {
    if (!_selectedFile) { toast('Select an image first', 'err'); return; }
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const fd = new FormData();
      fd.append('file', _selectedFile);
      fd.append('output_format', document.getElementById('opt-fmt').value);
      fd.append('quality', document.getElementById('opt-q').value);
      const res = await API.images.convertFormat(fd, pct);
      showDownload('dl-result', res.filename, res.filename);
      toast('✓ Format converted!', 'ok');
    });
  };
}

function initImgCrop() {
  let imgW = 0, imgH = 0;
  initImgTool(f => {
    const img = document.getElementById('preview-img');
    img.onload = () => {
      imgW = img.naturalWidth; imgH = img.naturalHeight;
      document.getElementById('opt-cw').value = imgW;
      document.getElementById('opt-ch').value = imgH;
    };
  });
  document.getElementById('run-btn').onclick = async () => {
    if (!_selectedFile) { toast('Select an image first', 'err'); return; }
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const fd = new FormData();
      fd.append('file', _selectedFile);
      fd.append('x', document.getElementById('opt-x').value);
      fd.append('y', document.getElementById('opt-y').value);
      fd.append('width', document.getElementById('opt-cw').value);
      fd.append('height', document.getElementById('opt-ch').value);
      fd.append('output_format', document.getElementById('opt-fmt').value);
      const res = await API.images.crop(fd, pct);
      showDownload('dl-result', res.filename, res.filename);
      toast(`✓ Cropped to ${res.result.width}×${res.result.height}!`, 'ok');
    });
  };
  window.applyCropPreset = () => {
    const ratio = document.getElementById('opt-ratio').value;
    if (ratio === 'free' || !imgW) return;
    const [rw, rh] = ratio.split(':').map(Number);
    let w = imgW, h = Math.round(w * rh / rw);
    if (h > imgH) { h = imgH; w = Math.round(h * rw / rh); }
    document.getElementById('opt-cw').value = w;
    document.getElementById('opt-ch').value = h;
    document.getElementById('opt-x').value = Math.round((imgW - w) / 2);
    document.getElementById('opt-y').value = Math.round((imgH - h) / 2);
  };
}

function initImgRotate() {
  initImgTool();
  document.getElementById('opt-angle').addEventListener('change', e => {
    document.getElementById('custom-angle-wrap').style.display = e.target.value === 'custom' ? 'flex' : 'none';
  });
  document.getElementById('run-btn').onclick = async () => {
    if (!_selectedFile) { toast('Select an image first', 'err'); return; }
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const angleEl = document.getElementById('opt-angle');
      const angle = angleEl.value === 'custom'
        ? parseFloat(document.getElementById('opt-custom-angle').value)
        : parseFloat(angleEl.value);
      const fd = new FormData();
      fd.append('file', _selectedFile);
      fd.append('angle', angle);
      fd.append('flip_h', document.getElementById('opt-fliph').checked);
      fd.append('flip_v', document.getElementById('opt-flipv').checked);
      fd.append('output_format', document.getElementById('opt-fmt').value);
      const res = await API.images.rotate(fd, pct);
      showDownload('dl-result', res.filename, res.filename);
      toast('✓ Applied!', 'ok');
    });
  };
}

function initImgWatermark() {
  initImgTool();
  document.getElementById('run-btn').onclick = async () => {
    if (!_selectedFile) { toast('Select an image first', 'err'); return; }
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const fd = new FormData();
      fd.append('file', _selectedFile);
      fd.append('text', document.getElementById('opt-text').value);
      fd.append('opacity', document.getElementById('opt-opacity').value);
      fd.append('position', document.getElementById('opt-pos').value);
      fd.append('output_format', document.getElementById('opt-fmt').value);
      const res = await API.images.watermark(fd, pct);
      showDownload('dl-result', res.filename, res.filename);
      toast('✓ Watermark applied!', 'ok');
    });
  };
}

let _selectedFilter = null;
window.selectFilter = (btn, filterName) => {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  _selectedFilter = filterName;
  const hasIntensity = ['blur','sharpen','brightness','contrast'].includes(filterName);
  document.getElementById('intensity-row').style.display = hasIntensity ? 'flex' : 'none';
};

function initImgFilter() {
  initImgTool();
  document.getElementById('run-btn').onclick = async () => {
    if (!_selectedFile) { toast('Select an image first', 'err'); return; }
    if (!_selectedFilter) { toast('Select a filter first', 'err'); return; }
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const fd = new FormData();
      fd.append('file', _selectedFile);
      fd.append('filter_name', _selectedFilter);
      fd.append('intensity', document.getElementById('opt-intensity').value);
      fd.append('output_format', document.getElementById('opt-fmt').value);
      const res = await API.images.filter(fd, pct);
      showDownload('dl-result', res.filename, res.filename);
      toast(`✓ ${_selectedFilter} applied!`, 'ok');
    });
  };
}

function initImgBulk() {
  let _bulkFiles = [];
  const zone = document.getElementById('dz1');
  const input = document.getElementById('fi1');
  if (zone && input) {
    zone.addEventListener('click', () => input.click());
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('over'));
    zone.addEventListener('drop', e => {
      e.preventDefault(); zone.classList.remove('over');
      _bulkFiles = Array.from(e.dataTransfer.files);
      document.getElementById('bulk-filenames').textContent = `${_bulkFiles.length} files selected`;
      zone.classList.add('has-file');
    });
    input.addEventListener('change', () => {
      _bulkFiles = Array.from(input.files);
      document.getElementById('bulk-filenames').textContent = `${_bulkFiles.length} files selected`;
      zone.classList.add('has-file');
    });
  }
  document.getElementById('run-btn').onclick = async () => {
    if (!_bulkFiles.length) { toast('Select images first', 'err'); return; }
    await withLoading('run-btn','prog-main','status-main', async pct => {
      const fd = new FormData();
      _bulkFiles.forEach(f => fd.append('files', f));
      fd.append('output_format', document.getElementById('opt-fmt').value);
      fd.append('quality', document.getElementById('opt-q').value);
      const res = await API.images.bulkConvert(fd, pct);
      showDownload('dl-result', res.filename, `converted_${res.count}_images.zip`);
      toast(`✓ ${res.count} images converted!`, 'ok');
    });
  };
}

function initImgMetadata() {
  initDropAndRun('dz1','fi1','image/*','run-btn', async file => {
    await withLoading('run-btn','prog-main','status-main', async pct => {
      // Also show local preview
      const img = document.getElementById('preview-img');
      img.src = URL.createObjectURL(file);
      document.getElementById('preview-wrap').style.display = 'block';
      const fd = new FormData(); fd.append('file', file);
      const res = await API.images.metadata(fd, pct);
      const grid = document.getElementById('meta-grid');
      grid.style.display = 'grid';
      const fields = [
        ['Format', res.format || '—'],
        ['Mode', res.mode || '—'],
        ['Width', `${res.width}px`],
        ['Height', `${res.height}px`],
        ['Megapixels', `${res.megapixels} MP`],
        ['Aspect Ratio', res.aspect_ratio || '—'],
        ['File Size', formatBytes(res.file_size_bytes)],
        ['Filename', res.filename],
      ];
      grid.innerHTML = fields.map(([k,v]) =>
        `<div class="meta-item"><div class="meta-key">${k}</div><div class="meta-val">${v}</div></div>`
      ).join('');
      if (res.exif) {
        const exifKeys = Object.keys(res.exif).slice(0, 8);
        grid.innerHTML += exifKeys.map(k =>
          `<div class="meta-item"><div class="meta-key">${k}</div><div class="meta-val" style="font-size:11px">${res.exif[k]}</div></div>`
        ).join('');
      }
      toast('✓ Metadata loaded!', 'ok');
    });
  });
  // Remove auto-trigger: need button click
  const btn = document.getElementById('run-btn');
  if (btn) btn.textContent = 'Inspect Image';
}

function initImgBase64() {
  // Encode panel
  new DropZone('dz-enc','fi-enc','image/*', async file => {
    await withLoading('run-enc-btn','prog-enc','status-enc', async pct => {
      const fd = new FormData(); fd.append('file', file);
      const res = await API.images.toBase64(fd, pct);
      const out = document.getElementById('b64-enc-out');
      out.style.display = 'block';
      out.textContent = res.data_url;
      document.getElementById('b64-out-header').style.display = 'flex';
      const cb = document.getElementById('copy-b64-btn');
      if (cb) cb.onclick = () => copyBtn(cb, res.data_url);
      toast(`✓ Encoded (${formatBytes(res.size_bytes)})`, 'ok');
    });
  });
  document.getElementById('run-enc-btn').onclick = () => toast('Drop an image to encode it', 'info');

  // Decode panel
  document.getElementById('run-dec-btn').onclick = async () => {
    const val = document.getElementById('b64-dec-input').value.trim();
    if (!val) { setStatus('status-dec', 'Paste a Base64 data URL first', 'err'); return; }
    const img = document.getElementById('dec-img');
    img.src = val;
    document.getElementById('dec-preview').style.display = 'block';
    toast('✓ Decoded!', 'ok');
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DATA & CODE TOOLS
// ═══════════════════════════════════════════════════════════════════════════════

function getDataInput(textId, fileClass) {
  const t = document.getElementById(textId)?.value?.trim();
  return t || null;
}

async function runDataTool(apiFn, textId, fileInputId, extraFields, outId, outClass, statusId, progId) {
  const text = document.getElementById(textId)?.value?.trim();
  const fileInput = document.getElementById(fileInputId);
  const file = fileInput?.files?.[0];
  if (!text && !file) { setStatus(statusId, 'Enter text or upload a file', 'err'); return; }
  const fd = new FormData();
  if (file) fd.append('file', file);
  else fd.append('text', text);
  if (extraFields) extraFields(fd);
  setProgress(progId, 20);
  try {
    const res = await apiFn(fd);
    setProgress(progId, 100);
    const out = document.getElementById(outId);
    if (out) { out.textContent = res.result; if (outClass) out.className = `out-box ${outClass}`; }
    setStatus(statusId, '✓ Done!', 'ok');
    return res;
  } catch(e) {
    setStatus(statusId, '✗ ' + (typeof e === 'string' ? e : e.message), 'err');
  } finally {
    setTimeout(() => setProgress(progId, null), 600);
  }
}

function initJsonTool() {
  const getInput = () => {
    const t = document.getElementById('json-input')?.value?.trim();
    const f = document.getElementById('fi-json')?.files?.[0];
    return { text: t, file: f };
  };

  document.getElementById('json-beautify-btn').onclick = async () => {
    const { text, file } = getInput();
    if (!text && !file) { setStatus('status-json','Provide JSON text or file','err'); return; }
    const fd = new FormData();
    if (file) fd.append('file', file); else fd.append('text', text);
    fd.append('indent', document.getElementById('json-indent').value);
    fd.append('sort_keys', document.getElementById('json-sort').checked);
    setProgress('prog-json', 30);
    try {
      const res = await API.data.jsonBeautify(fd);
      document.getElementById('json-out').textContent = res.result;
      setStatus('status-json','✓ Valid JSON — formatted!','ok');
    } catch(e) { setStatus('status-json','✗ ' + e, 'err'); }
    setProgress('prog-json', null);
  };

  document.getElementById('json-minify-btn').onclick = async () => {
    const { text, file } = getInput();
    if (!text && !file) return;
    const fd = new FormData();
    if (file) fd.append('file', file); else fd.append('text', text);
    try { const res = await API.data.jsonMinify(fd); document.getElementById('json-out').textContent = res.result; setStatus('status-json','✓ Minified!','ok'); }
    catch(e) { setStatus('status-json','✗ ' + e, 'err'); }
  };

  document.getElementById('json-validate-btn').onclick = async () => {
    const { text, file } = getInput();
    if (!text && !file) return;
    const fd = new FormData();
    if (file) fd.append('file', file); else fd.append('text', text);
    try {
      const res = await API.data.jsonValidate(fd);
      if (res.valid) setStatus('status-json', `✓ Valid JSON! Type: ${res.type}${res.keys != null ? `, Keys: ${res.keys}` : ''}${res.items != null ? `, Items: ${res.items}` : ''}`, 'ok');
      else setStatus('status-json', `✗ Invalid: ${res.error} (line ${res.line})`, 'err');
    } catch(e) { setStatus('status-json','✗ ' + e,'err'); }
  };

  document.getElementById('json-dl-btn').onclick = async () => {
    const { text, file } = getInput();
    if (!text && !file) return;
    const fd = new FormData();
    if (file) fd.append('file', file); else fd.append('text', text);
    fd.append('indent', document.getElementById('json-indent').value);
    fd.append('sort_keys', document.getElementById('json-sort').checked);
    try { const res = await API.data.jsonDownload(fd); triggerDownload(res.filename,'formatted.json'); toast('✓ Downloaded!','ok'); }
    catch(e) { setStatus('status-json','✗ ' + e,'err'); }
  };

  const copyBtn_ = document.getElementById('json-copy-btn');
  if (copyBtn_) copyBtn_.onclick = () => copyBtn(copyBtn_, document.getElementById('json-out').textContent);
  new DropZone('dz-json','fi-json','.json,.txt', () => {});
}

function initXmlTool() {
  const getInput = () => ({ text: document.getElementById('xml-input')?.value?.trim(), file: document.getElementById('fi-xml')?.files?.[0] });

  document.getElementById('xml-beautify-btn').onclick = async () => {
    const { text, file } = getInput();
    if (!text && !file) return;
    const fd = new FormData();
    if (file) fd.append('file', file); else fd.append('text', text);
    fd.append('indent', document.getElementById('xml-indent').value);
    try { const res = await API.data.xmlBeautify(fd); document.getElementById('xml-out').textContent = res.result; setStatus('status-xml','✓ XML formatted!','ok'); }
    catch(e) { setStatus('status-xml','✗ ' + e,'err'); }
  };
  document.getElementById('xml-minify-btn').onclick = async () => {
    const { text, file } = getInput();
    const fd = new FormData();
    if (file) fd.append('file', file); else fd.append('text', text || '');
    try { const res = await API.data.xmlMinify(fd); document.getElementById('xml-out').textContent = res.result; setStatus('status-xml','✓ Minified!','ok'); }
    catch(e) { setStatus('status-xml','✗ ' + e,'err'); }
  };
  document.getElementById('xml-validate-btn').onclick = async () => {
    const { text, file } = getInput();
    const fd = new FormData();
    if (file) fd.append('file', file); else fd.append('text', text || '');
    try {
      const res = await API.data.xmlValidate(fd);
      if (res.valid) setStatus('status-xml', `✓ Valid XML! Root: <${res.root_tag}>, Children: ${res.children}`, 'ok');
      else setStatus('status-xml', `✗ Invalid XML: ${res.error}`, 'err');
    } catch(e) { setStatus('status-xml','✗ ' + e,'err'); }
  };
  document.getElementById('xml-dl-btn').onclick = async () => {
    const { text, file } = getInput();
    const fd = new FormData();
    if (file) fd.append('file', file); else fd.append('text', text || '');
    try { const res = await API.data.xmlDownload(fd); triggerDownload(res.filename,'formatted.xml'); toast('✓ Downloaded!','ok'); }
    catch(e) { setStatus('status-xml','✗ ' + e,'err'); }
  };
  const cb = document.getElementById('xml-copy-btn');
  if (cb) cb.onclick = () => copyBtn(cb, document.getElementById('xml-out').textContent);
  new DropZone('dz-xml','fi-xml','.xml,.txt', () => {});
}

function initHtmlTool() {
  const getInput = () => document.getElementById('html-input')?.value?.trim();
  document.getElementById('html-beautify-btn').onclick = async () => {
    const t = getInput(); if (!t) return;
    const fd = new FormData(); fd.append('text', t);
    try { const res = await API.data.htmlBeautify(fd); document.getElementById('html-out').textContent = res.result; setStatus('status-html','✓ Formatted!','ok'); }
    catch(e) { setStatus('status-html','✗ ' + e,'err'); }
  };
  document.getElementById('html-minify-btn').onclick = async () => {
    const t = getInput(); if (!t) return;
    const fd = new FormData(); fd.append('text', t);
    try { const res = await API.data.htmlMinify(fd); document.getElementById('html-out').textContent = res.result; setStatus('status-html','✓ Minified!','ok'); }
    catch(e) { setStatus('status-html','✗ ' + e,'err'); }
  };
  document.getElementById('html-dl-btn').onclick = async () => {
    const t = getInput(); if (!t) return;
    const fd = new FormData(); fd.append('text', t); fd.append('mode','beautify');
    try { const res = await API.data.htmlDownload(fd); triggerDownload(res.filename,'formatted.html'); }
    catch(e) { setStatus('status-html','✗ ' + e,'err'); }
  };
  const cb = document.getElementById('html-copy-btn');
  if (cb) cb.onclick = () => copyBtn(cb, document.getElementById('html-out').textContent);
}

function initCssTool() {
  const getInput = () => document.getElementById('css-input')?.value?.trim();
  document.getElementById('css-beautify-btn').onclick = async () => {
    const t = getInput(); if (!t) return;
    const fd = new FormData(); fd.append('text', t);
    try { const res = await API.data.cssBeautify(fd); document.getElementById('css-out').textContent = res.result; setStatus('status-css','✓ Formatted!','ok'); }
    catch(e) { setStatus('status-css','✗ ' + e,'err'); }
  };
  document.getElementById('css-minify-btn').onclick = async () => {
    const t = getInput(); if (!t) return;
    const fd = new FormData(); fd.append('text', t);
    try { const res = await API.data.cssMinify(fd); document.getElementById('css-out').textContent = res.result; setStatus('status-css','✓ Minified!','ok'); }
    catch(e) { setStatus('status-css','✗ ' + e,'err'); }
  };
  document.getElementById('css-dl-btn').onclick = async () => {
    const t = getInput(); if (!t) return;
    const fd = new FormData(); fd.append('text', t); fd.append('mode','beautify');
    try { const res = await API.data.cssDownload(fd); triggerDownload(res.filename,'formatted.css'); }
    catch(e) { setStatus('status-css','✗ ' + e,'err'); }
  };
  const cb = document.getElementById('css-copy-btn');
  if (cb) cb.onclick = () => copyBtn(cb, document.getElementById('css-out').textContent);
}

function initYamlTool() {
  const getInput = () => document.getElementById('yaml-input')?.value?.trim();
  document.getElementById('yaml-to-json-btn').onclick = async () => {
    const t = getInput(); if (!t) return;
    const fd = new FormData(); fd.append('text', t);
    try { const res = await API.data.yamlToJson(fd); document.getElementById('yaml-out').textContent = res.result; setStatus('status-yaml','✓ YAML → JSON!','ok'); }
    catch(e) { setStatus('status-yaml','✗ ' + e,'err'); }
  };
  document.getElementById('json-to-yaml-btn').onclick = async () => {
    const t = getInput(); if (!t) return;
    const fd = new FormData(); fd.append('text', t);
    try { const res = await API.data.jsonToYaml(fd); document.getElementById('yaml-out').textContent = res.result; setStatus('status-yaml','✓ JSON → YAML!','ok'); }
    catch(e) { setStatus('status-yaml','✗ ' + e,'err'); }
  };
  document.getElementById('yaml-dl-btn').onclick = async () => {
    const t = getInput(); if (!t) return;
    const active = document.querySelector('.itab.active')?.dataset.panel;
    const fd = new FormData(); fd.append('text', t);
    fd.append('direction', active === 'yaml' ? 'yaml-to-json' : 'json-to-yaml');
    try { const res = await API.data.yamlDownload(fd); triggerDownload(res.filename, res.filename); }
    catch(e) { setStatus('status-yaml','✗ ' + e,'err'); }
  };
  const cb = document.getElementById('yaml-copy-btn');
  if (cb) cb.onclick = () => copyBtn(cb, document.getElementById('yaml-out').textContent);
}

function initBase64Tool() {
  document.getElementById('b64-enc-btn').onclick = async () => {
    const t = document.getElementById('b64-text-in').value;
    if (!t) return;
    const fd = new FormData(); fd.append('text', t);
    try { const res = await API.data.b64EncodeText(fd); document.getElementById('b64-text-out').textContent = res.result; }
    catch(e) { setStatus('status-b64text','✗ ' + e,'err'); }
  };
  document.getElementById('b64-dec-btn').onclick = async () => {
    const t = document.getElementById('b64-text-in').value;
    if (!t) return;
    const fd = new FormData(); fd.append('text', t);
    try { const res = await API.data.b64DecodeText(fd); document.getElementById('b64-text-out').textContent = res.result; }
    catch(e) { setStatus('status-b64text','✗ ' + e,'err'); }
  };
  const cb = document.getElementById('b64-copy-btn');
  if (cb) cb.onclick = () => copyBtn(cb, document.getElementById('b64-text-out').textContent);
  // File encode
  let b64FileResult = '';
  new DropZone('dz-b64f','fi-b64f','*', async file => {
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await API.data.b64EncodeFile(fd);
      b64FileResult = res.result;
      const out = document.getElementById('b64-file-out');
      out.style.display = 'block'; out.textContent = res.data_url.substring(0, 200) + '…';
      document.getElementById('b64-file-actions').style.display = 'flex';
      setStatus('status-b64file', `✓ File encoded (${formatBytes(res.size_bytes)})`, 'ok');
    } catch(e) { setStatus('status-b64file','✗ ' + e,'err'); }
  });
  const enc = document.getElementById('b64f-enc-btn');
  if (enc) enc.onclick = () => toast('Drop a file above to encode it', 'info');
  const fcb = document.getElementById('b64f-copy-btn');
  if (fcb) fcb.onclick = () => copyBtn(fcb, b64FileResult);
}

function initCsvTool() {
  new DropZone('dz-csv','fi-csv','.csv,.txt', async file => {
    const fd = new FormData(); fd.append('file', file);
    try { const res = await API.data.csvBeautify(fd); document.getElementById('csv-out').textContent = res.result; setStatus('status-csv',`✓ ${res.rows} rows, ${res.columns} columns`,'ok'); }
    catch(e) { setStatus('status-csv','✗ ' + e,'err'); }
  });
  document.getElementById('csv-view-btn').onclick = async () => {
    const t = document.getElementById('csv-input')?.value?.trim();
    const f = document.getElementById('fi-csv')?.files?.[0];
    if (!t && !f) { setStatus('status-csv','Provide CSV text or file','err'); return; }
    const fd = new FormData();
    if (f) fd.append('file', f); else fd.append('text', t);
    try { const res = await API.data.csvBeautify(fd); document.getElementById('csv-out').textContent = res.result; setStatus('status-csv',`✓ ${res.rows} rows, ${res.columns} columns`,'ok'); }
    catch(e) { setStatus('status-csv','✗ ' + e,'err'); }
  };
}

function initJsonXmlTool() {
  let lastResult = '', lastExt = 'json';
  const getInput = () => document.getElementById('jx-input')?.value?.trim();

  document.getElementById('jx-tojson-btn').onclick = async () => {
    const t = getInput(); if (!t) return;
    const fd = new FormData(); fd.append('file', new Blob([t], {type:'text/xml'}), 'input.xml');
    try {
      const res = await API.documents.xmlToJson(fd);
      // Download & re-read is complex; use text endpoint instead
      const fd2 = new FormData();
      fd2.append('text', t);
      // We'll call xml-beautify as a proxy to validate, then local convert
      toast('Converting…','info');
    } catch {}
    // Use backend file download approach
    const fd3 = new FormData();
    fd3.append('file', new Blob([t],{type:'text/xml'}), 'data.xml');
    setProgress('prog-jx', 30);
    try {
      const res = await API.documents.xmlToJson(fd3);
      lastExt = 'json';
      // fetch the result back
      const r = await fetch(downloadUrl(res.filename));
      lastResult = await r.text();
      document.getElementById('jx-out').textContent = lastResult;
      document.getElementById('jx-out').className = 'out-box json';
      setStatus('status-jx','✓ XML → JSON!','ok');
    } catch(e) { setStatus('status-jx','✗ ' + e,'err'); }
    setProgress('prog-jx', null);
  };

  document.getElementById('jx-toxml-btn').onclick = async () => {
    const t = getInput(); if (!t) return;
    const fd = new FormData();
    fd.append('file', new Blob([t],{type:'application/json'}), 'data.json');
    setProgress('prog-jx', 30);
    try {
      const res = await API.documents.jsonToXml(fd);
      lastExt = 'xml';
      const r = await fetch(downloadUrl(res.filename));
      lastResult = await r.text();
      document.getElementById('jx-out').textContent = lastResult;
      document.getElementById('jx-out').className = 'out-box xml';
      setStatus('status-jx','✓ JSON → XML!','ok');
    } catch(e) { setStatus('status-jx','✗ ' + e,'err'); }
    setProgress('prog-jx', null);
  };

  document.getElementById('jx-dl-btn').onclick = () => {
    if (!lastResult) return;
    const blob = new Blob([lastResult], {type:'text/plain'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `converted.${lastExt}`; a.click();
  };
  const cb = document.getElementById('jx-copy-btn');
  if (cb) cb.onclick = () => copyBtn(cb, lastResult);
}
