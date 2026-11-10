#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/build-warisan.js   (v13.55)
   Jana data Warisan daripada data peta sedia ada (data/demografi.json + data/dm-*.json + data/dun.json):
     data/warisan-malaysia.csv : Bahagian = kawasan Parlimen, DUN, Cawangan = Daerah Mengundi (nama sebenar DM)
     js/warisan-data.js        : jadual kawasan (peratus Bumiputera dan Cina, bilangan Cawangan, anggaran ahli) untuk js/warisan.js
   Fakta: keahlian 548,200 (2025, Wikipedia); Pengerusi Warisan Negeri di 9 negeri Semenanjung dan Labuan.
   ANDAIAN (mockup Warisan, dipersetujui): kawasan operasi = 25 kawasan Parlimen Sabah, Labuan dan semua kawasan Parlimen Semenanjung;
   90% ahli di Sabah dan Labuan (ikut pemilih DM), 10% di Semenanjung; minimum 5 ahli setiap Cawangan.
   Guna: node tools/build-warisan.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), rd = (f) => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const demo = rd('data/demografi.json'), dun = rd('data/dun.json');
const D = require(path.join(R, 'js', 'data.js'));
const SEMENANJUNG = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '14', '16'], JUMLAH = 548200, SABAH = 0.9, MIN = 5;
const pl = Object.values(demo.parlimen).filter((x) => String(x.negeri) === '12' || x.kod === 'P.166' || SEMENANJUNG.indexOf(String(x.negeri)) >= 0).sort((a, b) => a.kod.localeCompare(b.kod));
const kawasan = { parlimen: {}, dun: {} };
pl.forEach((x) => { kawasan.parlimen[x.kod] = { n: x.nama, m: x.bumi, c: x.cina, ng: String(x.negeri), b: 0, a: 0 }; });
const namaDun = {}; dun.fitur.forEach((f) => { namaDun[f.id] = f.nama; });
Object.values(demo.dun).filter((d) => kawasan.parlimen[d.parlimen]).forEach((d) => { kawasan.dun[d.kod] = { n: d.nama, m: d.bumi, c: d.cina, p: d.parlimen }; });
const dmCache = {};
function dmNegeri(ng) { if (!dmCache[ng]) { dmCache[ng] = rd('data/dm-' + ng + '.json'); } return dmCache[ng]; }
const senarai = []; const berat = { s: 0, m: 0 };
pl.forEach((x) => {
  const j = dmNegeri(String(x.negeri)), dmd = j.demografi || {}, kumpulan = {}, sb = String(x.negeri) === '12' || x.kod === 'P.166';
  j.fitur.filter((f) => f.parlimen === x.kod).forEach((f) => { const k = f.dun || '_'; (kumpulan[k] = kumpulan[k] || []).push(f); });
  Object.keys(kumpulan).sort().forEach((kd) => { kumpulan[kd].sort((a, b) => a.id.localeCompare(b.id)).forEach((f, i) => { const w = (dmd[f.id] && dmd[f.id].pemilih) || 1500; berat[sb ? 's' : 'm'] += w; senarai.push({ x, kd, f, i, w, sb }); }); });
});
const q = (s) => '"' + String(s || '').replace(/"/g, '""') + '"', baris = ['ID,Nama Negeri,Nama Parlimen,Nama DUN,Nama Lokaliti,Jumlah Ahli,Lelaki,Perempuan,Bawah 40,Atas 40'];
let jum = 0;
senarai.forEach((s) => {
  const no = parseInt(s.x.kod.replace('P.', ''), 10), noD = s.kd === '_' ? 0 : parseInt(s.kd.split('_N.')[1], 10);
  const ahli = Math.max(MIN, Math.round(s.w * (s.sb ? JUMLAH * SABAH / berat.s : JUMLAH * (1 - SABAH) / berat.m))), lk = Math.round(ahli * 0.52), b40 = Math.round(ahli * 0.4);
  const k = kawasan.parlimen[s.x.kod]; k.a += ahli; k.b++; jum += ahli;
  baris.push([String(no).padStart(3, '0') + '/' + String(noD).padStart(3, '0') + '/' + String(s.i + 1).padStart(3, '0'), D.negeriDariKod(no), q(s.x.nama), q(s.kd === '_' ? '' : (namaDun[s.kd] || '')), q(s.f.nama), ahli, lk, ahli - lk, b40, ahli - b40].join(','));
});
fs.writeFileSync(path.join(R, 'data', 'warisan-malaysia.csv'), baris.join('\n') + '\n');
fs.writeFileSync(path.join(R, 'js', 'warisan-data.js'), '/* Dijana oleh tools/build-warisan.js. Jangan sunting dengan tangan. Kawasan operasi Warisan (andaian permainan): Sabah, Labuan dan Semenanjung; m = peratus Bumiputera, c = Cina, a = anggaran ahli Bahagian, b = bilangan Cawangan. */\n' +
  '(function (r) { var d = ' + JSON.stringify(kawasan) + '; if (typeof module === \'object\' && module.exports) { module.exports = d; } r.MyPolitikWarisanData = d; })(typeof globalThis !== \'undefined\' ? globalThis : this);\n');
console.log('Parlimen', pl.length, '· DUN', Object.keys(kawasan.dun).length, '· Cawangan (DM)', senarai.length, '· ahli', jum);
