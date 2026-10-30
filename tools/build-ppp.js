#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/build-ppp.js   (v13.8)
   Jana data PPP daripada data peta sedia ada (data/demografi.json + data/dm-*.json + data/dun.json):
     data/ppp-semenanjung.csv : Bahagian = kawasan Parlimen, DUN, Cawangan = Daerah Mengundi (nama sebenar DM)
     js/ppp-data.js           : jadual kawasan (peratus Bumiputera, Cina dan India, bilangan Cawangan) untuk js/ppp.js
   ANDAIAN (mockup PPP, dipersetujui): kawasan operasi = 39 kawasan Parlimen Semenanjung yang campuran (tiada kaum melebihi 60%).
   PPP tiada kuota kerusi BN tetap (kerusi melalui Tuntut Kerusi BN). Bilangan ahli setiap Cawangan ialah anggaran permainan:
   pemilih DM x 3%, minimum 27 (saiz minimum Cawangan PPP, 1995) dan maksimum 120.
   Guna: node tools/build-ppp.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), rd = (f) => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const demo = rd('data/demografi.json'), dun = rd('data/dun.json');
const SEMENANJUNG = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '14', '16'];
const HAD_KAUM = 60, KADAR = 0.03, MIN = 27, MAKS = 120;
const D = require(path.join(R, 'js', 'data.js'));

const pl = Object.values(demo.parlimen).filter((x) => SEMENANJUNG.indexOf(String(x.negeri)) >= 0 && Math.max(x.bumi, x.cina, x.india) < HAD_KAUM).sort((a, b) => a.kod.localeCompare(b.kod));
const kawasan = { parlimen: {}, dun: {} };
pl.forEach((x) => { kawasan.parlimen[x.kod] = { n: x.nama, m: x.bumi, c: x.cina, i: x.india, ng: String(x.negeri), b: 0 }; });
const namaDun = {}; dun.fitur.forEach((f) => { namaDun[f.id] = f.nama; });
const duns = Object.values(demo.dun).filter((d) => kawasan.parlimen[d.parlimen]).sort((a, b) => a.kod.localeCompare(b.kod));
duns.forEach((d) => { kawasan.dun[d.kod] = { n: d.nama, m: d.bumi, c: d.cina, i: d.india, p: d.parlimen }; });

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
      const ahli = Math.max(MIN, Math.min(MAKS, Math.round(pemilih * KADAR)));
      const lk = Math.round(ahli * 0.51), b40 = Math.round(ahli * 0.3);
      kawasan.parlimen[x.kod].a = (kawasan.parlimen[x.kod].a || 0) + ahli; kawasan.parlimen[x.kod].b++;
      baris.push([kodP + '/' + kodD + '/' + String(i + 1).padStart(3, '0'), D.negeriDariKod(no), q(x.nama), q(kd === '_' ? '' : (namaDun[kd] || '')), q(f.nama), ahli, lk, ahli - lk, b40, ahli - b40].join(','));
      bil++;
    });
  });
});
fs.writeFileSync(path.join(R, 'data', 'ppp-semenanjung.csv'), baris.join('\n') + '\n');
fs.writeFileSync(path.join(R, 'js', 'ppp-data.js'), '/* Dijana oleh tools/build-ppp.js. Jangan sunting dengan tangan. Kawasan operasi PPP (andaian permainan): kawasan Parlimen Semenanjung campuran (tiada kaum melebihi 60%); m = peratus Bumiputera, c = Cina, i = India, a = anggaran ahli Bahagian, b = bilangan Cawangan. */\n' +
  '(function (r) { var d = ' + JSON.stringify(kawasan) + '; if (typeof module === \'object\' && module.exports) { module.exports = d; } r.MyPolitikPPPData = d; })(typeof globalThis !== \'undefined\' ? globalThis : this);\n');
console.log('Parlimen', pl.length, '· DUN', duns.length, '· Cawangan (DM)', bil);
