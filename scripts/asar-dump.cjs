// Dump readable windows around each occurrence of a needle inside app.asar.
const fs = require('fs');
const asarPath = process.argv[2];
const needle = process.argv[3] || 'FishLogo';
const outPath = process.argv[4] || 'asar-dump.txt';
const before = Number(process.argv[5] || 3000);
const after = Number(process.argv[6] || 6000);

const buf = fs.readFileSync(asarPath);
const needleBuf = Buffer.from(needle);
const positions = [];
let from = 0;
while (true) {
  const idx = buf.indexOf(needleBuf, from);
  if (idx < 0) break;
  positions.push(idx);
  from = idx + 1;
}

const chunks = [];
positions.forEach((pos, i) => {
  const start = Math.max(0, pos - before);
  const slice = buf.slice(start, Math.min(buf.length, pos + after));
  const text = slice.toString('utf8');
  chunks.push('===== #' + (i + 1) + ' at ' + pos + ' =====\n' + text);
});
fs.writeFileSync(outPath, chunks.join('\n\n'), 'utf8');
console.log('occurrences:', positions.length, '->', outPath, fs.statSync(outPath).size, 'bytes');
