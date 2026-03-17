/* ── TOOL HTML TEMPLATES ─────────────────────────────────────────────────────
   Each tool's modal HTML. Keep markup minimal — logic is in tools.js
   ─────────────────────────────────────────────────────────────────────────── */

function getToolHTML(id) {
  const T = TOOLS[id];
  return T ? T.html : null;
}

const TOOLS = {

  // ═══════════════════════════════════════════════════════════════════════════
  //  DOCUMENT TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  'pdf-to-text': { html: `
    <div class="mh"><h2>📄 PDF → Text</h2><p>Extract all text content from any PDF file.</p></div>
    ${dz('dz1','fi1','.pdf','📄','Drop PDF here or click to browse','Supports any .pdf')}
    <div class="row"><button class="btn btn-p" id="run-btn">Extract Text</button></div>
    ${prog()} ${status()}
    <div class="output-area" style="display:none">
      ${outHeader('EXTRACTED TEXT', true)}
      <div class="out-box prose" id="out-box" style="max-height:400px"></div>
    </div>
    ${dlArea()}`
  },

  'pdf-to-html': { html: `
    <div class="mh"><h2>🌐 PDF → HTML</h2><p>Convert PDF pages to a styled HTML document.</p></div>
    ${dz('dz1','fi1','.pdf','🌐','Drop PDF here','Supports any .pdf')}
    <div class="row"><button class="btn btn-p" id="run-btn">Convert to HTML</button></div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'pdf-to-word': { html: `
    <div class="mh"><h2>📝 PDF → Word</h2><p>Convert PDF to editable DOCX using pdf2docx library.</p></div>
    ${dz('dz1','fi1','.pdf','📝','Drop PDF here','Converts to .docx')}
    <div class="row"><button class="btn btn-p" id="run-btn">Convert to DOCX</button></div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'pdf-to-excel': { html: `
    <div class="mh"><h2>📊 PDF → Excel</h2><p>Extract tables from PDF into an Excel spreadsheet.</p></div>
    ${dz('dz1','fi1','.pdf','📊','Drop PDF here','Requires Java + tabula-py')}
    <div class="row"><button class="btn btn-p" id="run-btn">Extract Tables</button></div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'pdf-to-images': { html: `
    <div class="mh"><h2>🖼️ PDF → Images</h2><p>Render each PDF page as an image, downloaded as ZIP.</p></div>
    ${dz('dz1','fi1','.pdf','🖼️','Drop PDF here','Returns ZIP of images')}
    <div class="row">
      <div class="fg"><label>DPI</label>
        <select id="opt-dpi"><option value="72">72 (Screen)</option><option value="150" selected>150 (Standard)</option><option value="300">300 (High Quality)</option></select>
      </div>
      <div class="fg"><label>FORMAT</label>
        <select id="opt-fmt"><option value="png">PNG</option><option value="jpeg">JPEG</option></select>
      </div>
      <button class="btn btn-p" id="run-btn">Convert Pages</button>
    </div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'html-to-pdf': { html: `
    <div class="mh"><h2>📑 HTML → PDF</h2><p>Render an HTML file as a PDF using WeasyPrint.</p></div>
    ${dz('dz1','fi1','.html,.htm','📑','Drop HTML file here','Supports CSS styling')}
    <div class="row"><button class="btn btn-p" id="run-btn">Generate PDF</button></div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'word-to-pdf': { html: `
    <div class="mh"><h2>📝 Word → PDF</h2><p>Convert DOCX to PDF using LibreOffice (must be installed).</p></div>
    ${dz('dz1','fi1','.docx,.doc','📝','Drop Word document here','.docx or .doc')}
    <div class="row"><button class="btn btn-p" id="run-btn">Convert to PDF</button></div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'word-to-html': { html: `
    <div class="mh"><h2>🌐 Word → HTML</h2><p>Convert DOCX to styled HTML using mammoth.js.</p></div>
    ${dz('dz1','fi1','.docx','🌐','Drop Word document here','Converts .docx → HTML')}
    <div class="row"><button class="btn btn-p" id="run-btn">Convert to HTML</button></div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'word-to-text': { html: `
    <div class="mh"><h2>📋 Word → Text</h2><p>Extract plain text from DOCX paragraphs.</p></div>
    ${dz('dz1','fi1','.docx','📋','Drop Word document here','Extracts plain text')}
    <div class="row"><button class="btn btn-p" id="run-btn">Extract Text</button></div>
    ${prog()} ${status()}
    <div class="output-area" style="display:none">
      ${outHeader('EXTRACTED TEXT', true)}
      <div class="out-box prose" id="out-box" style="max-height:400px"></div>
    </div>`
  },

  'excel-to-csv': { html: `
    <div class="mh"><h2>📊 Excel → CSV</h2><p>Export a spreadsheet sheet as CSV text.</p></div>
    ${dz('dz1','fi1','.xlsx,.xls','📊','Drop Excel file here','.xlsx or .xls')}
    <div class="row">
      <div class="fg"><label>SHEET INDEX (0-based)</label><input type="number" id="opt-sheet" value="0" min="0" max="99"></div>
      <button class="btn btn-p" id="run-btn">Export CSV</button>
    </div>
    ${prog()} ${status()}
    <div class="output-area" style="display:none">
      ${outHeader('CSV OUTPUT', true)}
      <div class="out-box" id="out-box" style="max-height:360px"></div>
    </div>
    ${dlArea('Download CSV', false)}`
  },

  'excel-to-json': { html: `
    <div class="mh"><h2>{} Excel → JSON</h2><p>Convert spreadsheet rows to a JSON array (first row = headers).</p></div>
    ${dz('dz1','fi1','.xlsx,.xls','{}',' Drop Excel file here','.xlsx or .xls')}
    <div class="row">
      <div class="fg"><label>SHEET INDEX</label><input type="number" id="opt-sheet" value="0" min="0"></div>
      <button class="btn btn-p" id="run-btn">Convert to JSON</button>
    </div>
    ${prog()} ${status()}
    <div class="output-area" style="display:none">
      ${outHeader('JSON OUTPUT', true)}
      <div class="out-box json" id="out-box" style="max-height:360px"></div>
    </div>`
  },

  'csv-to-excel': { html: `
    <div class="mh"><h2>📈 CSV → Excel</h2><p>Convert CSV to a formatted Excel workbook with styled headers.</p></div>
    ${dz('dz1','fi1','.csv,.txt','📈','Drop CSV file here','.csv or .txt')}
    <div class="row"><button class="btn btn-p" id="run-btn">Build Excel</button></div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'excel-to-pdf': { html: `
    <div class="mh"><h2>📑 Excel → PDF</h2><p>Convert Excel spreadsheet to PDF via LibreOffice.</p></div>
    ${dz('dz1','fi1','.xlsx,.xls','📑','Drop Excel file here','Requires LibreOffice')}
    <div class="row"><button class="btn btn-p" id="run-btn">Convert to PDF</button></div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'ppt-to-text': { html: `
    <div class="mh"><h2>🎤 PPT → Text</h2><p>Extract all text content from PowerPoint slides.</p></div>
    ${dz('dz1','fi1','.pptx,.ppt','🎤','Drop PowerPoint here','.pptx or .ppt')}
    <div class="row"><button class="btn btn-p" id="run-btn">Extract Text</button></div>
    ${prog()} ${status()}
    <div class="output-area" style="display:none">
      ${outHeader('SLIDE TEXT', true)}
      <div class="out-box prose" id="out-box" style="max-height:400px"></div>
    </div>`
  },

  'ppt-to-pdf': { html: `
    <div class="mh"><h2>📑 PPT → PDF</h2><p>Convert PowerPoint presentation to PDF via LibreOffice.</p></div>
    ${dz('dz1','fi1','.pptx,.ppt','📑','Drop PowerPoint here','Requires LibreOffice')}
    <div class="row"><button class="btn btn-p" id="run-btn">Convert to PDF</button></div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'markdown-to-html': { html: `
    <div class="mh"><h2>✍️ Markdown → HTML</h2><p>Convert .md file to a beautifully styled HTML page.</p></div>
    ${dz('dz1','fi1','.md,.markdown,.txt','✍️','Drop Markdown file here','.md or .markdown')}
    <div class="row"><button class="btn btn-p" id="run-btn">Convert to HTML</button></div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'csv-to-json': { html: `
    <div class="mh"><h2>🔄 CSV → JSON</h2><p>Convert CSV rows to a JSON array using first row as keys.</p></div>
    ${dz('dz1','fi1','.csv,.txt','🔄','Drop CSV file here','.csv file')}
    <div class="row"><button class="btn btn-p" id="run-btn">Convert</button></div>
    ${prog()} ${status()}
    <div class="output-area" style="display:none">
      ${outHeader('JSON OUTPUT', true)}
      <div class="out-box json" id="out-box" style="max-height:360px"></div>
    </div>`
  },

  'json-to-csv': { html: `
    <div class="mh"><h2>🔄 JSON → CSV</h2><p>Flatten a JSON array to CSV format.</p></div>
    ${dz('dz1','fi1','.json','{}',' Drop JSON file here','.json array file')}
    <div class="row"><button class="btn btn-p" id="run-btn">Convert</button></div>
    ${prog()} ${status()} ${dlArea()}`
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  IMAGE TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  'img-resize': { html: `
    <div class="mh"><h2>📐 Image Resize</h2><p>Resize by pixel dimensions or percentage. Optional aspect ratio lock.</p></div>
    ${dz('dz1','fi1','image/*','📐','Drop image here or click','PNG, JPG, WEBP, BMP, GIF')}
    <div class="img-wrap" id="preview-wrap" style="display:none"><img id="preview-img"><div class="img-meta" id="preview-meta"></div></div>
    <div class="itabs">
      <button class="itab active" data-group="mode" data-panel="px">Pixels</button>
      <button class="itab" data-group="mode" data-panel="pct">Percentage</button>
    </div>
    <div class="itab-panel" data-group="mode" data-panel="px">
      <div class="row">
        <div class="fg"><label>WIDTH (px)</label><input type="number" id="opt-w" min="1" placeholder="auto"></div>
        <div class="fg" style="align-self:flex-end">
          <label class="check-row"><input type="checkbox" id="opt-lock" checked><span>Lock ratio</span></label>
        </div>
        <div class="fg"><label>HEIGHT (px)</label><input type="number" id="opt-h" min="1" placeholder="auto"></div>
      </div>
    </div>
    <div class="itab-panel" data-group="mode" data-panel="pct" style="display:none">
      <div class="row">
        <div class="fg" style="flex:1"><label>SCALE: <span class="val-display" id="scale-val">100</span>%</label>
          <input type="range" id="opt-scale" min="1" max="300" value="100" oninput="document.getElementById('scale-val').textContent=this.value">
        </div>
      </div>
    </div>
    <div class="row">
      <div class="fg"><label>OUTPUT FORMAT</label>
        <select id="opt-fmt"><option value="original">Same as input</option><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WEBP</option></select>
      </div>
      <button class="btn btn-p" id="run-btn">Resize Image</button>
    </div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'img-compress': { html: `
    <div class="mh"><h2>🗜️ Image Compress</h2><p>Reduce file size with real server-side compression. See actual byte savings.</p></div>
    ${dz('dz1','fi1','image/*','🗜️','Drop image here','PNG, JPG, WEBP')}
    <div class="img-wrap" id="preview-wrap" style="display:none"><img id="preview-img"><div class="img-meta" id="preview-meta"></div></div>
    <div class="row">
      <div class="fg" style="flex:1"><label>QUALITY: <span class="val-display" id="q-val">82</span>%</label>
        <input type="range" id="opt-q" min="1" max="100" value="82" oninput="document.getElementById('q-val').textContent=this.value">
      </div>
      <div class="fg"><label>OUTPUT FORMAT</label>
        <select id="opt-fmt"><option value="jpeg">JPEG</option><option value="webp">WEBP</option><option value="png">PNG</option></select>
      </div>
    </div>
    <div class="row">
      <div class="fg"><label>MAX WIDTH CAP (optional)</label><input type="number" id="opt-mw" min="0" placeholder="none"></div>
      <div class="fg"><label>MAX HEIGHT CAP (optional)</label><input type="number" id="opt-mh" min="0" placeholder="none"></div>
      <button class="btn btn-p" id="run-btn">Compress</button>
    </div>
    ${prog()} <div class="status show info" id="compress-stats" style="display:none"></div>
    ${status()} ${dlArea()}`
  },

  'img-convert': { html: `
    <div class="mh"><h2>🔄 Image Format Convert</h2><p>Convert between PNG, JPEG, WEBP, BMP, GIF, TIFF.</p></div>
    ${dz('dz1','fi1','image/*','🔄','Drop image here','All common formats')}
    <div class="img-wrap" id="preview-wrap" style="display:none"><img id="preview-img"><div class="img-meta" id="preview-meta"></div></div>
    <div class="row">
      <div class="fg"><label>CONVERT TO</label>
        <select id="opt-fmt">
          <option value="png">PNG</option><option value="jpeg">JPEG</option>
          <option value="webp">WEBP</option><option value="bmp">BMP</option>
          <option value="gif">GIF</option><option value="tiff">TIFF</option>
        </select>
      </div>
      <div class="fg"><label>QUALITY (JPEG/WEBP)</label><input type="number" id="opt-q" value="92" min="1" max="100"></div>
      <button class="btn btn-p" id="run-btn">Convert</button>
    </div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'img-crop': { html: `
    <div class="mh"><h2>✂️ Image Crop</h2><p>Crop by exact pixel coordinates or choose a preset aspect ratio.</p></div>
    ${dz('dz1','fi1','image/*','✂️','Drop image here','All common formats')}
    <div class="img-wrap" id="preview-wrap" style="display:none"><img id="preview-img"><div class="img-meta" id="preview-meta"></div></div>
    <div class="row">
      <div class="fg"><label>PRESET RATIO</label>
        <select id="opt-ratio" onchange="applyCropPreset()">
          <option value="free">Free</option><option value="1:1">1:1 Square</option>
          <option value="16:9">16:9 Wide</option><option value="4:3">4:3 Classic</option>
          <option value="3:2">3:2 Photo</option><option value="9:16">9:16 Portrait</option>
        </select>
      </div>
    </div>
    <div class="row">
      <div class="fg"><label>X</label><input type="number" id="opt-x" value="0" min="0"></div>
      <div class="fg"><label>Y</label><input type="number" id="opt-y" value="0" min="0"></div>
      <div class="fg"><label>WIDTH</label><input type="number" id="opt-cw" min="1"></div>
      <div class="fg"><label>HEIGHT</label><input type="number" id="opt-ch" min="1"></div>
      <div class="fg"><label>FORMAT</label>
        <select id="opt-fmt"><option value="original">Same</option><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WEBP</option></select>
      </div>
    </div>
    <div class="row"><button class="btn btn-p" id="run-btn">Crop Image</button></div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'img-rotate': { html: `
    <div class="mh"><h2>🔃 Rotate & Flip</h2><p>Rotate to any angle, flip horizontally or vertically.</p></div>
    ${dz('dz1','fi1','image/*','🔃','Drop image here','All common formats')}
    <div class="img-wrap" id="preview-wrap" style="display:none"><img id="preview-img"><div class="img-meta" id="preview-meta"></div></div>
    <div class="row">
      <div class="fg"><label>ROTATE (degrees CCW)</label>
        <select id="opt-angle">
          <option value="0">0° (none)</option><option value="90">90° CCW</option>
          <option value="180">180°</option><option value="270">270° CCW</option>
          <option value="custom">Custom…</option>
        </select>
      </div>
      <div class="fg" id="custom-angle-wrap" style="display:none"><label>CUSTOM ANGLE</label><input type="number" id="opt-custom-angle" value="45" min="-360" max="360"></div>
    </div>
    <div class="row">
      <label class="check-row"><input type="checkbox" id="opt-fliph"> Flip Horizontal</label>
      <label class="check-row"><input type="checkbox" id="opt-flipv"> Flip Vertical</label>
      <div class="fg"><label>FORMAT</label>
        <select id="opt-fmt"><option value="original">Same</option><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WEBP</option></select>
      </div>
      <button class="btn btn-p" id="run-btn">Apply</button>
    </div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'img-watermark': { html: `
    <div class="mh"><h2>💧 Watermark</h2><p>Add a text watermark with custom opacity and position.</p></div>
    ${dz('dz1','fi1','image/*','💧','Drop image here','All common formats')}
    <div class="img-wrap" id="preview-wrap" style="display:none"><img id="preview-img"><div class="img-meta" id="preview-meta"></div></div>
    <div class="row">
      <div class="fg" style="flex:1"><label>WATERMARK TEXT</label><input type="text" id="opt-text" value="© Copyright" style="width:100%"></div>
    </div>
    <div class="row">
      <div class="fg" style="flex:1"><label>OPACITY: <span class="val-display" id="op-val">40</span>%</label>
        <input type="range" id="opt-opacity" min="5" max="100" value="40" oninput="document.getElementById('op-val').textContent=this.value">
      </div>
      <div class="fg"><label>POSITION</label>
        <select id="opt-pos"><option value="center">Center</option><option value="bottomright">Bottom Right</option><option value="bottomleft">Bottom Left</option><option value="topleft">Top Left</option><option value="topright">Top Right</option></select>
      </div>
      <div class="fg"><label>FORMAT</label>
        <select id="opt-fmt"><option value="original">Same</option><option value="png">PNG</option><option value="jpeg">JPEG</option></select>
      </div>
    </div>
    <div class="row"><button class="btn btn-p" id="run-btn">Add Watermark</button></div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'img-filter': { html: `
    <div class="mh"><h2>🎨 Filters & Effects</h2><p>Apply image filters — all processed server-side by Pillow.</p></div>
    ${dz('dz1','fi1','image/*','🎨','Drop image here','All common formats')}
    <div class="img-wrap" id="preview-wrap" style="display:none"><img id="preview-img"><div class="img-meta" id="preview-meta"></div></div>
    <div class="filter-grid" id="filter-grid">
      ${['grayscale','sepia','blur','sharpen','brightness','contrast','invert','emboss','edge'].map(f =>
        `<button class="filter-btn" data-filter="${f}" onclick="selectFilter(this,'${f}')"><span class="fbi">${filterIcon(f)}</span>${f}</button>`
      ).join('')}
    </div>
    <div class="row" id="intensity-row" style="display:none">
      <div class="fg" style="flex:1"><label>INTENSITY: <span class="val-display" id="int-val">1.0</span></label>
        <input type="range" id="opt-intensity" min="0.1" max="5" step="0.1" value="1" oninput="document.getElementById('int-val').textContent=parseFloat(this.value).toFixed(1)">
      </div>
    </div>
    <div class="row">
      <div class="fg"><label>FORMAT</label>
        <select id="opt-fmt"><option value="original">Same</option><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WEBP</option></select>
      </div>
      <button class="btn btn-p" id="run-btn">Apply Filter</button>
    </div>
    ${prog()} ${status()} ${dlArea()}`
  },

  'img-bulk': { html: `
    <div class="mh"><h2>📦 Bulk Image Convert</h2><p>Convert multiple images at once. All returned as a ZIP archive.</p></div>
    <div class="dropzone" id="dz1" style="padding:32px">
      <div class="dz-icon">📦</div>
      <div class="dz-label">Drop multiple images here or click</div>
      <div class="dz-sub">Select as many files as needed</div>
      <div class="dz-filename" id="bulk-filenames"></div>
      <input type="file" id="fi1" accept="image/*" multiple>
    </div>
    <div class="row">
      <div class="fg"><label>CONVERT ALL TO</label>
        <select id="opt-fmt"><option value="webp">WEBP (recommended)</option><option value="jpeg">JPEG</option><option value="png">PNG</option></select>
      </div>
      <div class="fg"><label>QUALITY</label><input type="number" id="opt-q" value="85" min="1" max="100"></div>
      <button class="btn btn-p" id="run-btn">Convert All → ZIP</button>
    </div>
    ${prog()} ${status()} ${dlArea('Download ZIP')}`
  },

  'img-metadata': { html: `
    <div class="mh"><h2>🔍 Image Metadata & EXIF</h2><p>Inspect file info, dimensions, aspect ratio, and EXIF data.</p></div>
    ${dz('dz1','fi1','image/*','🔍','Drop any image to inspect','All formats')}
    <div class="img-wrap" id="preview-wrap" style="display:none"><img id="preview-img" style="max-height:180px"></div>
    ${prog()} ${status()}
    <div class="meta-grid" id="meta-grid" style="display:none"></div>`
  },

  'img-base64': { html: `
    <div class="mh"><h2>🔐 Image ↔ Base64</h2><p>Encode images to Base64 data URLs, or decode them back.</p></div>
    <div class="itabs">
      <button class="itab active" data-group="b64" data-panel="enc">Image → Base64</button>
      <button class="itab" data-group="b64" data-panel="dec">Base64 → Image</button>
    </div>
    <div class="itab-panel" data-group="b64" data-panel="enc">
      ${dz('dz-enc','fi-enc','image/*','🖼️','Drop image to encode','All formats')}
      <div class="row"><button class="btn btn-p" id="run-enc-btn">Encode to Base64</button></div>
      ${prog('prog-enc')} ${status('status-enc')}
      <div class="out-header" style="display:none" id="b64-out-header">
        <span>BASE64 DATA URL</span>
        <div class="out-actions"><button class="btn btn-s" id="copy-b64-btn" style="font-size:10px;padding:4px 10px">Copy</button></div>
      </div>
      <div class="out-box" id="b64-enc-out" style="display:none;word-break:break-all;max-height:200px"></div>
    </div>
    <div class="itab-panel" data-group="b64" data-panel="dec" style="display:none">
      <div class="fg" style="margin-bottom:14px"><label>PASTE BASE64 DATA URL</label>
        <textarea id="b64-dec-input" placeholder="data:image/png;base64,..." style="min-height:120px"></textarea>
      </div>
      <div class="row"><button class="btn btn-p" id="run-dec-btn">Decode to Image</button></div>
      ${status('status-dec')}
      <div class="img-wrap" id="dec-preview" style="display:none"><img id="dec-img"></div>
    </div>`
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  DATA & CODE TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  'json-tool': { html: `
    <div class="mh"><h2>{} JSON Tools</h2><p>Beautify, minify, validate, and sort JSON — from file or paste.</p></div>
    <div class="itabs">
      <button class="itab active" data-group="jinput" data-panel="paste">Paste Text</button>
      <button class="itab" data-group="jinput" data-panel="file">Upload File</button>
    </div>
    <div class="itab-panel" data-group="jinput" data-panel="paste">
      <textarea id="json-input" placeholder='{"name":"Alice","age":30,"city":"NYC"}' style="min-height:200px"></textarea>
    </div>
    <div class="itab-panel" data-group="jinput" data-panel="file" style="display:none">
      ${dz('dz-json','fi-json','.json,.txt','{}',' Drop JSON file here','.json file')}
    </div>
    <div class="row">
      <div class="fg"><label>INDENT</label>
        <select id="json-indent"><option value="2">2 Spaces</option><option value="4">4 Spaces</option><option value="1">1 Space</option></select>
      </div>
      <label class="check-row"><input type="checkbox" id="json-sort"> Sort Keys</label>
      <button class="btn btn-p" id="json-beautify-btn">Beautify</button>
      <button class="btn btn-s" id="json-minify-btn">Minify</button>
      <button class="btn btn-s" id="json-validate-btn">Validate</button>
      <button class="btn btn-s" id="json-dl-btn">Download</button>
    </div>
    ${prog('prog-json')} ${status('status-json')}
    <div class="out-header"><span>OUTPUT</span><div class="out-actions"><button class="btn btn-s" id="json-copy-btn" style="font-size:10px;padding:4px 10px">Copy</button></div></div>
    <div class="out-box json" id="json-out" style="min-height:200px"></div>`
  },

  'xml-tool': { html: `
    <div class="mh"><h2>&lt;/&gt; XML Tools</h2><p>Beautify, minify, and validate XML documents.</p></div>
    <div class="itabs">
      <button class="itab active" data-group="xinput" data-panel="paste">Paste Text</button>
      <button class="itab" data-group="xinput" data-panel="file">Upload File</button>
    </div>
    <div class="itab-panel" data-group="xinput" data-panel="paste">
      <textarea id="xml-input" placeholder="<root><item>value</item></root>" style="min-height:200px"></textarea>
    </div>
    <div class="itab-panel" data-group="xinput" data-panel="file" style="display:none">
      ${dz('dz-xml','fi-xml','.xml,.txt','</>',' Drop XML file here','.xml file')}
    </div>
    <div class="row">
      <div class="fg"><label>INDENT</label>
        <select id="xml-indent"><option value="  ">2 Spaces</option><option value="    ">4 Spaces</option><option value="&#9;">Tab</option></select>
      </div>
      <button class="btn btn-p" id="xml-beautify-btn">Beautify</button>
      <button class="btn btn-s" id="xml-minify-btn">Minify</button>
      <button class="btn btn-s" id="xml-validate-btn">Validate</button>
      <button class="btn btn-s" id="xml-dl-btn">Download</button>
    </div>
    ${prog('prog-xml')} ${status('status-xml')}
    <div class="out-header"><span>OUTPUT</span><div class="out-actions"><button class="btn btn-s" id="xml-copy-btn" style="font-size:10px;padding:4px 10px">Copy</button></div></div>
    <div class="out-box xml" id="xml-out" style="min-height:200px"></div>`
  },

  'html-tool': { html: `
    <div class="mh"><h2>🌐 HTML Tools</h2><p>Beautify and minify HTML markup.</p></div>
    <div class="split">
      <div><div class="out-header"><span>INPUT HTML</span></div><textarea id="html-input" style="min-height:280px;width:100%" placeholder="<div><p>Hello World</p></div>"></textarea></div>
      <div><div class="out-header"><span>OUTPUT</span><div class="out-actions"><button class="btn btn-s" id="html-copy-btn" style="font-size:10px;padding:4px 10px">Copy</button></div></div><div class="out-box html-code" id="html-out" style="min-height:280px"></div></div>
    </div>
    <div class="row" style="margin-top:12px">
      <button class="btn btn-p" id="html-beautify-btn">Beautify</button>
      <button class="btn btn-s" id="html-minify-btn">Minify</button>
      <button class="btn btn-s" id="html-dl-btn">Download</button>
    </div>
    ${prog('prog-html')} ${status('status-html')}`
  },

  'css-tool': { html: `
    <div class="mh"><h2>🎨 CSS Tools</h2><p>Format or compress CSS stylesheets.</p></div>
    <div class="split">
      <div><div class="out-header"><span>INPUT CSS</span></div><textarea id="css-input" style="min-height:280px;width:100%" placeholder="body{margin:0;color:red}"></textarea></div>
      <div><div class="out-header"><span>OUTPUT</span><div class="out-actions"><button class="btn btn-s" id="css-copy-btn" style="font-size:10px;padding:4px 10px">Copy</button></div></div><div class="out-box" id="css-out" style="min-height:280px;color:#fbbf24"></div></div>
    </div>
    <div class="row" style="margin-top:12px">
      <button class="btn btn-p" id="css-beautify-btn">Beautify</button>
      <button class="btn btn-s" id="css-minify-btn">Minify</button>
      <button class="btn btn-s" id="css-dl-btn">Download</button>
    </div>
    ${prog('prog-css')} ${status('status-css')}`
  },

  'yaml-tool': { html: `
    <div class="mh"><h2>📋 YAML ↔ JSON</h2><p>Convert between YAML and JSON formats with full nesting support.</p></div>
    <div class="split">
      <div><div class="out-header"><span>INPUT</span></div><textarea id="yaml-input" style="min-height:280px;width:100%" placeholder="Paste YAML or JSON here..."></textarea></div>
      <div><div class="out-header"><span>OUTPUT</span><div class="out-actions"><button class="btn btn-s" id="yaml-copy-btn" style="font-size:10px;padding:4px 10px">Copy</button></div></div><div class="out-box json" id="yaml-out" style="min-height:280px"></div></div>
    </div>
    <div class="row" style="margin-top:12px">
      <button class="btn btn-p" id="yaml-to-json-btn">YAML → JSON</button>
      <button class="btn btn-s" id="json-to-yaml-btn">JSON → YAML</button>
      <button class="btn btn-s" id="yaml-dl-btn">Download</button>
    </div>
    ${prog('prog-yaml')} ${status('status-yaml')}`
  },

  'base64-tool': { html: `
    <div class="mh"><h2>🔐 Base64 Encode / Decode</h2><p>Encode or decode text and files to/from Base64 on the server.</p></div>
    <div class="itabs">
      <button class="itab active" data-group="b64mode" data-panel="text">Text Mode</button>
      <button class="itab" data-group="b64mode" data-panel="file">File Mode</button>
    </div>
    <div class="itab-panel" data-group="b64mode" data-panel="text">
      <textarea id="b64-text-in" style="min-height:120px" placeholder="Enter text to encode, or Base64 to decode…"></textarea>
      <div class="row" style="margin-top:10px">
        <button class="btn btn-p" id="b64-enc-btn">Encode →</button>
        <button class="btn btn-s" id="b64-dec-btn">← Decode</button>
        <button class="btn btn-s" id="b64-copy-btn">Copy Output</button>
      </div>
      <div class="out-box" id="b64-text-out" style="margin-top:12px;min-height:80px;word-break:break-all"></div>
      ${status('status-b64text')}
    </div>
    <div class="itab-panel" data-group="b64mode" data-panel="file" style="display:none">
      ${dz('dz-b64f','fi-b64f','*','📁','Drop any file to encode','Any file type')}
      <div class="row"><button class="btn btn-p" id="b64f-enc-btn">Encode File</button></div>
      ${status('status-b64file')}
      <div class="out-box" id="b64-file-out" style="margin-top:12px;word-break:break-all;min-height:60px;display:none"></div>
      <div class="row" style="margin-top:10px;display:none" id="b64-file-actions">
        <button class="btn btn-s" id="b64f-copy-btn">Copy Base64</button>
      </div>
    </div>`
  },

  'csv-tool': { html: `
    <div class="mh"><h2>📊 CSV Beautify</h2><p>View raw CSV as an aligned ASCII table with row count.</p></div>
    <div class="itabs">
      <button class="itab active" data-group="csvinput" data-panel="paste">Paste CSV</button>
      <button class="itab" data-group="csvinput" data-panel="file">Upload File</button>
    </div>
    <div class="itab-panel" data-group="csvinput" data-panel="paste">
      <textarea id="csv-input" style="min-height:160px" placeholder="name,age,city&#10;Alice,30,NYC&#10;Bob,25,LA"></textarea>
    </div>
    <div class="itab-panel" data-group="csvinput" data-panel="file" style="display:none">
      ${dz('dz-csv','fi-csv','.csv,.txt','📊','Drop CSV file here','.csv file')}
    </div>
    <div class="row"><button class="btn btn-p" id="csv-view-btn">View as Table</button></div>
    ${prog('prog-csv')} ${status('status-csv')}
    <div class="out-box" id="csv-out" style="min-height:120px;margin-top:12px"></div>`
  },

  'json-xml-tool': { html: `
    <div class="mh"><h2>⇄ JSON ↔ XML</h2><p>Bidirectional conversion between JSON and XML formats.</p></div>
    <div class="split">
      <div><div class="out-header"><span>INPUT (JSON or XML)</span></div><textarea id="jx-input" style="min-height:280px;width:100%" placeholder="Paste JSON or XML here…"></textarea></div>
      <div><div class="out-header"><span>OUTPUT</span><div class="out-actions"><button class="btn btn-s" id="jx-copy-btn" style="font-size:10px;padding:4px 10px">Copy</button></div></div><div class="out-box json" id="jx-out" style="min-height:280px"></div></div>
    </div>
    <div class="row" style="margin-top:12px">
      <button class="btn btn-p" id="jx-tojson-btn">XML → JSON</button>
      <button class="btn btn-s" id="jx-toxml-btn">JSON → XML</button>
      <button class="btn btn-s" id="jx-dl-btn">Download</button>
    </div>
    ${prog('prog-jx')} ${status('status-jx')}`
  },
};

// ── HTML FRAGMENT HELPERS ──────────────────────────────────────────────────────
function dz(zid, fid, accept, icon, label, sub) {
  return `<div class="dropzone" id="${zid}">
    <div class="dz-icon">${icon}</div>
    <div class="dz-label">${label}</div>
    <div class="dz-sub">${sub}</div>
    <div class="dz-filename"></div>
    <input type="file" id="${fid}" accept="${accept}">
  </div>`;
}

function prog(id = 'prog-main') {
  return `<div class="progress" id="${id}"><div class="progress-track"><div class="progress-fill"></div></div></div>`;
}

function status(id = 'status-main') {
  return `<div class="status" id="${id}"></div>`;
}

function outHeader(label, copyBtn = false) {
  return `<div class="out-header"><span>${label}</span>${copyBtn ? '<div class="out-actions"><button class="btn btn-s" id="copy-out-btn" style="font-size:10px;padding:4px 10px">Copy</button></div>' : ''}</div>`;
}

function dlArea(label = 'Download File', showStatus = true) {
  return `<div class="dl-result" id="dl-result">
    <div class="dl-info">Conversion complete!</div>
    <button class="btn btn-g dl-btn">⬇ ${label}</button>
  </div>`;
}

function filterIcon(f) {
  const m = {grayscale:'⬜',sepia:'🟫',blur:'🌫️',sharpen:'✨',brightness:'☀️',contrast:'◑',invert:'🔄',emboss:'🗿',edge:'🔲'};
  return m[f] || '🎨';
}
