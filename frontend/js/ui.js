/* ── UI HELPERS ──────────────────────────────────────────────────────────────
   Reusable UI components: dropzone, progress, toast, modal, output display
   ─────────────────────────────────────────────────────────────────────────── */

// ── TOAST ─────────────────────────────────────────────────────────────────────
function toast(msg, type = 'info', duration = 3500) {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.style.opacity = '0', duration);
  setTimeout(() => t.remove(), duration + 300);
}

// ── PROGRESS ──────────────────────────────────────────────────────────────────
function setProgress(wrapId, pct) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;
  const fill = wrap.querySelector('.progress-fill');
  if (pct === null) { wrap.classList.remove('show'); if (fill) fill.style.width = '0%'; return; }
  wrap.classList.add('show');
  if (fill) fill.style.width = pct + '%';
}

// ── STATUS ────────────────────────────────────────────────────────────────────
function setStatus(id, msg, type = 'info') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `status show ${type}`;
  if (type !== 'err') setTimeout(() => el.classList.remove('show'), 5000);
}

// ── OUTPUT BOX ────────────────────────────────────────────────────────────────
function showOutput(boxId, text, cls = '') {
  const el = document.getElementById(boxId);
  if (!el) return;
  el.textContent = text;
  if (cls) el.className = `out-box ${cls}`;
  el.closest('.output-area')?.style.setProperty('display', 'block');
}

function showOutputHtml(boxId, html) {
  const el = document.getElementById(boxId);
  if (!el) return;
  el.innerHTML = html;
  el.className = 'out-box prose';
  el.closest('.output-area')?.style.setProperty('display', 'block');
}

// ── DOWNLOAD BUTTON ───────────────────────────────────────────────────────────
function showDownload(areaId, filename, label) {
  const area = document.getElementById(areaId);
  if (!area) return;
  area.classList.add('show');
  const btn = area.querySelector('.dl-btn');
  const info = area.querySelector('.dl-info');
  if (info) info.innerHTML = `✓ Ready to download<div class="dl-name">${filename}</div>`;
  if (btn) {
    btn.onclick = () => {
      triggerDownload(filename, label || filename);
      toast(`Downloading ${label || filename}`, 'ok');
    };
  }
}

// ── COPY BUTTON ───────────────────────────────────────────────────────────────
function copyBtn(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Copied';
    btn.classList.add('btn-g');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('btn-g'); }, 2000);
  });
}

// ── DROPZONE SETUP ────────────────────────────────────────────────────────────
class DropZone {
  constructor(zoneId, inputId, accept, onFile) {
    this.zone = document.getElementById(zoneId);
    this.input = document.getElementById(inputId);
    this.onFile = onFile;
    this.file = null;

    if (!this.zone || !this.input) return;
    if (accept) this.input.accept = accept;

    this.zone.addEventListener('click', () => this.input.click());
    this.zone.addEventListener('dragover', e => { e.preventDefault(); this.zone.classList.add('over'); });
    this.zone.addEventListener('dragleave', () => this.zone.classList.remove('over'));
    this.zone.addEventListener('drop', e => {
      e.preventDefault(); this.zone.classList.remove('over');
      const f = e.dataTransfer.files[0];
      if (f) this._setFile(f);
    });
    this.input.addEventListener('change', () => {
      if (this.input.files[0]) this._setFile(this.input.files[0]);
    });
  }

  _setFile(f) {
    this.file = f;
    this.zone.classList.add('has-file');
    const lbl = this.zone.querySelector('.dz-label');
    const fn = this.zone.querySelector('.dz-filename');
    if (lbl) lbl.textContent = '✓ File selected';
    if (fn) fn.textContent = `${f.name} (${formatBytes(f.size)})`;
    this.onFile(f);
  }
}

// ── MULTI-FILE DROPZONE ───────────────────────────────────────────────────────
class MultiDropZone {
  constructor(zoneId, inputId, accept, onFiles) {
    this.zone = document.getElementById(zoneId);
    this.input = document.getElementById(inputId);
    this.onFiles = onFiles;
    this.files = [];

    if (!this.zone || !this.input) return;
    if (accept) this.input.accept = accept;
    this.input.multiple = true;

    this.zone.addEventListener('click', () => this.input.click());
    this.zone.addEventListener('dragover', e => { e.preventDefault(); this.zone.classList.add('over'); });
    this.zone.addEventListener('dragleave', () => this.zone.classList.remove('over'));
    this.zone.addEventListener('drop', e => {
      e.preventDefault(); this.zone.classList.remove('over');
      const files = Array.from(e.dataTransfer.files);
      if (files.length) this._setFiles(files);
    });
    this.input.addEventListener('change', () => {
      if (this.input.files.length) this._setFiles(Array.from(this.input.files));
    });
  }

  _setFiles(files) {
    this.files = files;
    this.zone.classList.add('has-file');
    const lbl = this.zone.querySelector('.dz-label');
    const fn = this.zone.querySelector('.dz-filename');
    if (lbl) lbl.textContent = `✓ ${files.length} file${files.length > 1 ? 's' : ''} selected`;
    if (fn) fn.textContent = files.map(f => f.name).join(', ');
    this.onFiles(files);
  }
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function openModal(toolId) {
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  const html = getToolHTML(toolId);
  if (!html) return;
  body.innerHTML = html;
  overlay.classList.add('open');
  initToolLogic(toolId);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('modal-body').innerHTML = '';
}

document.getElementById('modal-close-btn').onclick = closeModal;
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// ── INNER TABS ────────────────────────────────────────────────────────────────
function setupInnerTabs() {
  document.querySelectorAll('.itab').forEach(tab => {
    tab.addEventListener('click', () => {
      const group = tab.dataset.group;
      document.querySelectorAll(`.itab[data-group="${group}"]`).forEach(t => t.classList.remove('active'));
      document.querySelectorAll(`.itab-panel[data-group="${group}"]`).forEach(p => p.style.display = 'none');
      tab.classList.add('active');
      const panel = document.querySelector(`.itab-panel[data-group="${group}"][data-panel="${tab.dataset.panel}"]`);
      if (panel) panel.style.display = 'block';
    });
  });
}

// ── IMAGE PREVIEW ─────────────────────────────────────────────────────────────
function previewImage(file, imgId, metaId) {
  const img = document.getElementById(imgId);
  if (!img) return;
  const url = URL.createObjectURL(file);
  img.onload = () => {
    if (metaId) {
      const m = document.getElementById(metaId);
      if (m) m.textContent = `${img.naturalWidth} × ${img.naturalHeight}px — ${formatBytes(file.size)}`;
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

// ── UTILITIES ─────────────────────────────────────────────────────────────────
function formatBytes(b) {
  if (!b) return '0 B';
  const k = 1024, s = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return (b / Math.pow(k, i)).toFixed(2) + ' ' + s[i];
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── WRAP ASYNC WITH LOADING ───────────────────────────────────────────────────
async function withLoading(btnId, progressId, statusId, fn) {
  const btn = document.getElementById(btnId);
  if (btn) btn.disabled = true;
  setProgress(progressId, 10);
  try {
    await fn(pct => setProgress(progressId, pct));
  } catch(e) {
    const msg = typeof e === 'string' ? e : (e.message || 'Unknown error');
    setStatus(statusId, '✗ ' + msg, 'err');
    toast(msg, 'err');
  } finally {
    if (btn) btn.disabled = false;
    setTimeout(() => setProgress(progressId, null), 800);
  }
}
