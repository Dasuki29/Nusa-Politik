#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/build-mca.js   (v13.1)
   Jana data MCA daripada data peta sedia ada (data/demografi.json + data/dm-*.json + data/dun.json):
     data/mca-semenanjung.csv : Bahagian = kawasan Parlimen, DUN, Cawangan = Daerah Mengundi (nama sebenar DM)
     js/mca-data.js           : jadual kawasan (peratus Cina, kedudukan kuota) untuk js/mca.js (segerak, tanpa fetch)
   ANDAIAN (dipersetujui dalam mockup v13): kawasan operasi = 61 kawasan Parlimen Semenanjung dengan pengundi Cina 25% ke atas.
   Kedudukan kuota mengikut peratus Cina (tertinggi = 1). Bilangan ahli setiap Cawangan ialah anggaran permainan:
   pemilih DM x peratus Cina kawasan x 7%, minimum 50 (Perkara 92: Cawangan minimum 50 ahli), maksimum 900.
   Guna: node tools/build-mca.js   (kemudian node tools/bina-data-lokal.js untuk salinan data/js)
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), rd = (f) => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const demo = rd('data/demografi.json'), dun = rd('data/dun.json');
const SEMENANJUNG = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '14', '16'];
const AMBANG = 25, KADAR = 0.07, MIN = 50, MAKS = 900;
const D = require(path.join(R, 'js', 'data.js'));

const pl = Object.values(demo.parlimen).filter((x) => SEMENANJUNG.indexOf(String(x.negeri)) >= 0 && x.cina >= AMBANG).sort((a, b) => b.cina - a.cina || a.kod.localeCompare(b.kod));
const kawasan = { parlimen: {}, dun: {} };
pl.forEach((x, i) => { kawasan.parlimen[x.kod] = { n: x.nama, c: x.cina, r: i + 1, ng: String(x.negeri) }; });
const namaDun = {}; dun.fitur.forEach((f) => { namaDun[f.id] = f.nama; });
const duns = Object.values(demo.dun).filter((d) => kawasan.parlimen[d.parlimen]).sort((a, b) => b.cina - a.cina || a.kod.localeCompare(b.kod));
duns.forEach((d, i) => { kawasan.dun[d.kod] = { n: d.nama, c: d.cina, r: i + 1, p: d.parlimen }; });

const dmCache = {};
function dmNegeri(ng) { if (!dmCache[ng]) { dmCache[ng] = rd('data/dm-' + ng + '.json'); } return dmCache[ng]; }
const baris = ['ID,Nama Negeri,Nama Parlimen,Nama DUN,Nama Lokaliti,Jumlah Ahli,Lelaki,Perempuan,Bawah 40,Atas 40'];
const q = (s) => '"' + String(s || '').replace(/"/g, '""') + '"';
let bil = 0;
pl.slice().sort((a, b) => a.kod.localeCompare(b.kod)).forEach((x) => {
  const no = parseInt(x.kod.replace('P.', ''), 10), kodP = String(no).padStart(3, '0'), j = dmNegeri(String(x.negeri)), dmd = j.demografi || {};
  const dms = j.fitur.filter((f) => f.parlimen === x.kod), kumpulan = {};
  dms.forEach((f) => { const k = f.dun || '_'; (kumpulan[k] = kumpulan[k] || []).push(f); });
  Object.keys(kumpulan).sort().forEach((kd) => {
    const noD = kd === '_' ? 0 : parseInt(kd.split('_N.')[1], 10), kodD = String(noD).padStart(3, '0');
    kumpulan[kd].sort((a, b) => a.id.localeCompare(b.id)).forEach((f, i) => {
      const pemilih = (dmd[f.id] && dmd[f.id].pemilih) || 2000;
      const ahli = Math.max(MIN, Math.min(MAKS, Math.round(pemilih * x.cina / 100 * KADAR)));
      const lk = Math.round(ahli * 0.51), b40 = Math.round(ahli * 0.3);
      baris.push([kodP + '/' + kodD + '/' + String(i + 1).padStart(3, '0'), D.negeriDariKod(no), q(x.nama), q(kd === '_' ? '' : (namaDun[kd] || '')), q(f.nama), ahli, lk, ahli - lk, b40, ahli - b40].join(','));
      bil++;
    });
  });
});
fs.writeFileSync(path.join(R, 'data', 'mca-semenanjung.csv'), baris.join('\n') + '\n');
fs.writeFileSync(path.join(R, 'js', 'mca-data.js'), '/* Dijana oleh tools/build-mca.js. Jangan sunting dengan tangan. Kawasan operasi MCA (andaian permainan): Parlimen Semenanjung, pengundi Cina ' + AMBANG + '% ke atas. */\n' +
  '(function (r) { var d = ' + JSON.stringify(kawasan) + '; if (typeof module === \'object\' && module.exports) { module.exports = d; } r.MyPolitikMCAData = d; })(typeof globalThis !== \'undefined\' ? globalThis : this);\n');
console.log('Parlimen', pl.length, '· DUN', duns.length, '· Cawangan (DM)', bil);
