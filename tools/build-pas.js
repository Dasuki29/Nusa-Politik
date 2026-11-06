#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/build-pas.js   (v13.31)
   Jana data PAS daripada data peta sedia ada (data/demografi.json + data/dm-*.json + data/dun.json):
     data/pas-semenanjung.csv : Kawasan = kawasan Parlimen, DUN, Cawangan = Daerah Mengundi (nama sebenar DM)
     js/pas-data.js           : jadual kawasan (peratus Bumiputera, kedudukan kuota, anggaran ahli Kawasan) untuk js/pas.js
   ANDAIAN (mockup skop PAS, dipersetujui): kawasan operasi = semua 165 kawasan Parlimen Semenanjung (Fasal 36: satu Kawasan bagi setiap
   daerah atau kawasan Parlimen). Kedudukan kuota kerusi PN ikut peratus Bumiputera (tertinggi = 1). Bilangan ahli setiap Cawangan ialah
   anggaran permainan: pemilih DM x peratus Bumiputera x 6%, minimum 25 (Fasal 37: Cawangan minimum 25 ahli), maksimum 900.
   Saiz keahlian Kawasan (medan a) menentukan bilangan perwakilan ke Muktamar (Fasal 18(5): 4 wakil, +1 bagi setiap 1,000 ahli melebihi 2,000, maks. 15).
   Guna: node tools/build-pas.js   (kemudian node tools/bina-data-lokal.js untuk salinan data/js)
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), rd = (f) => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const demo = rd('data/demografi.json'), dun = rd('data/dun.json');
const SEMENANJUNG = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '14', '16'];
const KADAR = 0.06, MIN = 25, MAKS = 900;
const D = require(path.join(R, 'js', 'data.js'));

const pl = Object.values(demo.parlimen).filter((x) => SEMENANJUNG.indexOf(String(x.negeri)) >= 0).sort((a, b) => b.bumi - a.bumi || a.kod.localeCompare(b.kod));
const kawasan = { parlimen: {}, dun: {} };
pl.forEach((x, i) => { kawasan.parlimen[x.kod] = { n: x.nama, m: x.bumi, r: i + 1, ng: String(x.negeri) }; });
const namaDun = {}; dun.fitur.forEach((f) => { namaDun[f.id] = f.nama; });
const duns = Object.values(demo.dun).filter((d) => kawasan.parlimen[d.parlimen]).sort((a, b) => b.bumi - a.bumi || a.kod.localeCompare(b.kod));
duns.forEach((d, i) => { kawasan.dun[d.kod] = { n: d.nama, m: d.bumi, r: i + 1, p: d.parlimen }; });

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
      const ahli = Math.max(MIN, Math.min(MAKS, Math.round(pemilih * x.bumi / 100 * KADAR)));
      const lk = Math.round(ahli * 0.5), b40 = Math.round(ahli * 0.35);
      kawasan.parlimen[x.kod].a = (kawasan.parlimen[x.kod].a || 0) + ahli;
      baris.push([kodP + '/' + kodD + '/' + String(i + 1).padStart(3, '0'), D.negeriDariKod(no), q(x.nama), q(kd === '_' ? '' : (namaDun[kd] || '')), q(f.nama), ahli, lk, ahli - lk, b40, ahli - b40].join(','));
      bil++;
    });
  });
});
fs.writeFileSync(path.join(R, 'data', 'pas-semenanjung.csv'), baris.join('\n') + '\n');
fs.writeFileSync(path.join(R, 'js', 'pas-data.js'), '/* Dijana oleh tools/build-pas.js. Jangan sunting dengan tangan. Kawasan operasi PAS (andaian permainan): semua kawasan Parlimen Semenanjung; m = peratus Bumiputera, r = kedudukan kuota PN, a = anggaran ahli Kawasan. */\n' +
  '(function (r) { var d = ' + JSON.stringify(kawasan) + '; if (typeof module === \'object\' && module.exports) { module.exports = d; } r.MyPolitikPASData = d; })(typeof globalThis !== \'undefined\' ? globalThis : this);\n');
console.log('Parlimen', pl.length, '· DUN', duns.length, '· Cawangan (DM)', bil);
