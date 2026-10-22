/* v10.6: jana data/js/<fail>.js daripada setiap data/*.json dan data/*.csv supaya permainan berfungsi apabila dibuka terus dari folder (file://).
   Lihat js/fetch-lokal.js. Jalankan semula selepas mengubah mana-mana fail dalam data/. */
'use strict';
const fs = require('fs'), path = require('path');
const d = path.join(__dirname, '..', 'data'), o = path.join(d, 'js');
fs.mkdirSync(o, { recursive: true });
let n = 0;
fs.readdirSync(d).filter((f) => /\.(json|csv)$/.test(f)).forEach((f) => {
  const teks = fs.readFileSync(path.join(d, f), 'utf8');
  fs.writeFileSync(path.join(o, f + '.js'), 'window.__NP_FAIL=window.__NP_FAIL||{};window.__NP_FAIL[' + JSON.stringify('data/' + f) + ']=' + JSON.stringify(teks) + ';\n'); n++;
});
console.log(n + ' fail dijana dalam data/js/');
