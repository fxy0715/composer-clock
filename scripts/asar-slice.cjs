// Print a byte range of a file with hard line wrapping so the read tool can show it all.
const fs = require('fs');
const file = process.argv[2];
const start = Number(process.argv[3]);
const length = Number(process.argv[4]);
const width = Number(process.argv[5] || 400);
const out = process.argv[6];

const buf = fs.readFileSync(file);
const slice = buf.slice(start, start + length).toString('utf8');
const lines = [];
for (let i = 0; i < slice.length; i += width) lines.push(slice.slice(i, i + width));
fs.writeFileSync(out, lines.join('\n'), 'utf8');
console.log('wrote', lines.length, 'lines ->', out);
