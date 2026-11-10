#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/build-berjasa.js   (v13.53)
   Jana data BERJASA daripada data peta sedia ada (data/demografi.json + data/dm-*.json + data/dun.json):
     data/berjasa-semenanjung.csv : Kawasan = kawasan Parlimen, DUN, Cawangan = Daerah Mengundi (nama sebenar DM)
     js/berjasa-data.js           : jadual kawasan (peratus Bumiputera, bilangan Cawangan, anggaran ahli) untuk js/berjasa.js
   ANDAIAN (mockup BERJASA, dipersetujui): kawasan operasi = kawasan Parlimen Semenanjung dengan Bumiputera 50% ke atas.
   Keahlian 56,790 (Mac 2024, Wikipedia) dibahagi ikut anggaran pengundi Melayu-Islam: pemilih DM x peratus Bumiputera Parlimen,
   diskala supaya jumlah hampir 56,790; minimum 5 ahli setiap Cawangan.
   Guna: node tools/build-berjasa.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), rd = (f) => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const demo = rd('data/demografi.json'), dun = rd('data/dun.json');
const SEMENANJUNG = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '14', '16'];
const HAD_BUMI = 50, JUMLAH = 56790, MIN = 5;
const D = require(path.join(R, 'js', 'data.js'));

const pl = Object.values(demo.parlimen).filter((x) => SEMENANJUNG.indexOf(String(x.negeri)) >= 0 && x.bumi >= HAD_BUMI).sort((a, b) => a.kod.localeCompare(b.kod));
const kawasan = { parlimen: {}, dun: {} };
pl.forEach((x) => { kawasan.parlimen[x.kod] = { n: x.nama, m: x.bumi, ng: String(x.negeri), b: 0, a: 0 }; });
const namaDun = {}; dun.fitur.forEach((f) => { namaDun[f.id] = f.nama; });
Object.values(demo.dun).filter((d) => kawasan.parlimen[d.parlimen]).sort((a, b) => a.kod.localeCompare(b.kod)).forEach((d) => { kawasan.dun[d.kod] = { n: d.nama, m: d.bumi, p: d.parlimen }; });

const dmCache = {};
function dmNegeri(ng) { if (!dmCache[ng]) { dmCache[ng] = rd('data/dm-' + ng + '.json'); } return dmCache[ng]; }
// laluan 1: senarai DM dan berat (pemilih x peratus Bumiputera)
const senarai = []; let jumBerat = 0;
pl.forEach((x) => {
  const j = dmNegeri(String(x.negeri)), dmd = j.demografi || {}, kumpulan = {};
  j.fitur.filter((f) => f.parlimen === x.kod).forEach((f) => { const k = f.dun || '_'; (kumpulan[k] = kumpulan[k] || []).push(f); });
  Object.keys(kumpulan).sort().forEach((kd) => {
    kumpulan[kd].sort((a, b) => a.id.localeCompare(b.id)).forEach((f, i) => {
      const w = ((dmd[f.id] && dmd[f.id].pemilih) || 2000) * x.bumi / 100; jumBerat += w;
      senarai.push({ x, kd, f, i, w });
    });
  });
});
// laluan 2: ahli = berat x skala (jumlah hampir 56,790)
let skala = JUMLAH / jumBerat;
for (let n = 0; n < 40; n++) { const t = senarai.reduce((a, s) => a + Math.max(MIN, Math.round(s.w * skala)), 0); if (t <= JUMLAH) { break; } skala *= 1 - (t - JUMLAH) / t; }   // minimum 5 menambah jumlah: laras skala
const baris = ['ID,Nama Negeri,Nama Parlimen,Nama DUN,Nama Lokaliti,Jumlah Ahli,Lelaki,Perempuan,Bawah 40,Atas 40'];
const q = (s) => '"' + String(s || '').replace(/"/g, '""') + '"';
let jum = 0;
senarai.forEach((s) => {
  const no = parseInt(s.x.kod.replace('P.', ''), 10), noD = s.kd === '_' ? 0 : parseInt(s.kd.split('_N.')[1], 10);
  const ahli = Math.max(MIN, Math.round(s.w * skala)), lk = Math.round(ahli * 0.55), b40 = Math.round(ahli * 0.35);
  const k = kawasan.parlimen[s.x.kod]; k.a += ahli; k.b++; jum += ahli;
  baris.push([String(no).padStart(3, '0') + '/' + String(noD).padStart(3, '0') + '/' + String(s.i + 1).padStart(3, '0'), D.negeriDariKod(no), q(s.x.nama), q(s.kd === '_' ? '' : (namaDun[s.kd] || '')), q(s.f.nama), ahli, lk, ahli - lk, b40, ahli - b40].join(','));
});
fs.writeFileSync(path.join(R, 'data', 'berjasa-semenanjung.csv'), baris.join('\n') + '\n');
fs.writeFileSync(path.join(R, 'js', 'berjasa-data.js'), '/* Dijana oleh tools/build-berjasa.js. Jangan sunting dengan tangan. Kawasan operasi BERJASA (andaian permainan): kawasan Parlimen Semenanjung dengan Bumiputera 50% ke atas; m = peratus Bumiputera, a = anggaran ahli Kawasan, b = bilangan Cawangan. */\n' +
  '(function (r) { var d = ' + JSON.stringify(kawasan) + '; if (typeof module === \'object\' && module.exports) { module.exports = d; } r.MyPolitikBERJASAData = d; })(typeof globalThis !== \'undefined\' ? globalThis : this);\n');
console.log('Parlimen', pl.length, '· DUN', Object.keys(kawasan.dun).length, '· Cawangan (DM)', senarai.length, '· ahli', jum);
