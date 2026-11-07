// Extract the official FISH_LOGO_PATH from the installed app.asar.
const fs = require('fs');
const crypto = require('crypto');

const asar = 'D:/software/DeepSeek Harness/resources/app.asar';
const out = process.argv[2];
const buf = fs.readFileSync(asar);

const key = 'I_="';
const start = buf.indexOf(key, 105495400);
if (start < 0) {
  console.log('not found');
  process.exit(1);
}
const from = start + key.length;
const end = buf.indexOf(0x22, from); // closing double quote
const path = buf.slice(from, end).toString('utf8');
fs.writeFileSync(out, path, 'utf8');
console.log('length:', path.length);
console.log('sha256:', crypto.createHash('sha256').update(path).digest('hex'));
console.log('head:', path.slice(0, 80));
console.log('tail:', path.slice(-80));
