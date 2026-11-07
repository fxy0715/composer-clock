// Render pet artwork variants to HTML for a headless-browser visual check.
const fs = require('fs');

const asar = 'D:/software/DeepSeek Harness/resources/app.asar';
const buf = fs.readFileSync(asar);
const HEAD = 'M22.9168 1.43018';
const headAt = buf.indexOf(HEAD);
let quoteAt = -1;
for (let i = headAt - 1; i >= 0; i--) {
  if (buf[i] === 0x22) { quoteAt = i; break; }
}
const endAt = buf.indexOf(0x22, headAt);
const whale = buf.slice(quoteAt + 1, endAt).toString('utf8');

const DEFS = `<defs><linearGradient id="g" x1="11.58" y1="0.5" x2="11.58" y2="16.5" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="#5B7CFF"/><stop offset="1" stop-color="#3D5AFE"/>
</linearGradient></defs>`;

function pure() {
  return `<svg width="168" height="124" viewBox="0 0 23.16 17.04" xmlns="http://www.w3.org/2000/svg">${DEFS}
    <path d="${whale}" fill="url(#g)"/></svg>`;
}

function rim() {
  return `<svg width="168" height="124" viewBox="0 0 23.16 17.04" xmlns="http://www.w3.org/2000/svg">${DEFS}
    <path d="${whale}" fill="url(#g)" stroke="rgba(255,255,255,.85)" stroke-width="0.45" stroke-linejoin="round"/></svg>`;
}

const cell = (bg, label, art) =>
  `<div class="cell ${bg}"><div class="art">${art}</div><div class="label">${label}</div></div>`;

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body{margin:0;font-family:system-ui;display:grid;grid-template-columns:1fr 1fr}
  .cell{height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;position:relative}
  .light{background:#ffffff;color:#333}.dark{background:#1b1f26;color:#bbb}
  .art{filter:drop-shadow(0 5px 10px rgba(20,40,120,.20))}
  .label{font-size:11px;opacity:.65}
</style></head><body>
${cell('light', 'pure / light', pure())}
${cell('dark', 'pure / dark', pure())}
${cell('light', 'rim / light', rim())}
${cell('dark', 'rim / dark', rim())}
</body></html>`;

const out = process.argv[2];
fs.writeFileSync(out, html, 'utf8');
console.log('wrote', out, fs.statSync(out).size, 'bytes');
