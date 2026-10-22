/* v10.5.1: jana js/data-sarawak.js (CSV + pbb-dun.json terbenam) supaya data parti Sarawak boleh dimuat tanpa fetch (cth. buka index.html terus dari folder). Jalankan: node tools/bina-data-sarawak.js */
'use strict';
const fs = require('fs'), path = require('path'), d = path.join(__dirname, '..', 'data');
const o = { csv: {}, dun: JSON.parse(fs.readFileSync(path.join(d, 'pbb-dun.json'), 'utf8')) };
['pbb', 'prs', 'supp', 'pdp', 'psb'].forEach((k) => { o.csv[k] = fs.readFileSync(path.join(d, k + '-sarawak.csv'), 'utf8'); });
fs.writeFileSync(path.join(__dirname, '..', 'js', 'data-sarawak.js'), '/* Dijana oleh tools/bina-data-sarawak.js. Jangan edit. */\nwindow.MyPolitikDataSarawak = ' + JSON.stringify(o) + ';\n');
console.log('js/data-sarawak.js dijana');
