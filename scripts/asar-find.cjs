// One-off helper: parse the Electron asar header and locate the primitives
// package / FishLogo artwork. Read-only against the installed app bundle.
const fs = require('fs');

const asarPath = process.argv[2];
const needle = process.argv[3] || 'FishLogo';
const buf = fs.readFileSync(asarPath);

// --- asar header: {"files": {...}} JSON follows a small pickle prefix. ---
const jsonStart = buf.indexOf(Buffer.from('{"files":'));
if (jsonStart < 0) {
  console.log('header not found');
  process.exit(1);
}
// Find the matching close brace by brace counting (strings may contain braces).
let depth = 0;
let inStr = false;
let esc = false;
let end = -1;
for (let i = jsonStart; i < Math.min(buf.length, jsonStart + 200 * 1024 * 1024); i++) {
  const c = buf[i];
  if (inStr) {
    if (esc) esc = false;
    else if (c === 92) esc = true;
    else if (c === 34) inStr = false;
    continue;
  }
  if (c === 34) { inStr = true; continue; }
  if (c === 123) depth++;
  else if (c === 125) { depth--; if (depth === 0) { end = i + 1; break; } }
}
if (end < 0) { console.log('header end not found'); process.exit(1); }
const header = JSON.parse(buf.slice(jsonStart, end).toString('utf8'));

// Data area starts right after the header, padded to 4 bytes.
const dataBase = end + ((4 - (end % 4)) % 4);

const matches = [];
(function walk(node, prefix) {
  for (const name of Object.keys(node.files || {})) {
    const entry = node.files[name];
    const full = prefix ? prefix + '/' + name : name;
    if (entry.files) walk(entry, full);
    else if (/primitives|FishLogo/i.test(full)) matches.push({ path: full, entry });
  }
})(header, '');

console.log('primitives-ish entries:', matches.length);
for (const m of matches.slice(0, 40)) {
  console.log(' ', m.path, '| size', m.entry.size, '| offset', m.entry.offset);
}

// Also scan raw bytes for the identifier to see whether any inlined copy exists.
const positions = [];
let from = 0;
const needleBuf = Buffer.from(needle);
while (true) {
  const idx = buf.indexOf(needleBuf, from);
  if (idx < 0) break;
  positions.push(idx);
  from = idx + 1;
  if (positions.length > 200) break;
}
console.log('raw occurrences of', needle + ':', positions.length);

// Dump a readable window around the first few occurrences that sit inside
// plausible JS text (heuristic: printable ASCII ratio high).
let shown = 0;
for (const pos of positions) {
  const start = Math.max(0, pos - 1200);
  const slice = buf.slice(start, Math.min(buf.length, pos + 2600));
  const text = slice.toString('utf8');
  const printable = text.replace(/[^\x20-\x7E\n\r\t]/g, '');
  if (printable.length / text.length < 0.9) continue;
  console.log('\n===== occurrence at', pos, '=====');
  console.log(text);
  shown++;
  if (shown >= 3) break;
}
