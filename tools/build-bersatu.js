#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/build-bersatu.js   (v13.89)
   Jana data BERSATU daripada data peta sedia ada (data/demografi.json + data/dm-*.json + data/dun.json):
     data/bersatu-malaysia.csv : Bahagian = kawasan Parlimen (Fasal 18.1), DUN, Cawangan = Daerah Mengundi (nama sebenar DM)
     js/bersatu-data.js       : jadual Bahagian (peratus Bumiputera, kedudukan kuota PN, anggaran ahli, wakil Perhimpunan Agung, negeri) untuk js/bersatu.js
   Fakta: ~700,000 ahli (2024). Perlembagaan BERSATU Fasal 12.4.3: seorang wakil Persidangan Bahagian bagi setiap 300 ahli, maksimum 7 dari satu Bahagian.
   ANDAIAN (mockup BERSATU, dipersetujui): Bahagian = kawasan Parlimen Bumiputera 30% ke atas di Semenanjung, Sabah dan WP (bukan Sarawak);
   kedudukan kuota BERSATU dalam PN ikut kawasan Melayu bercampur / separa bandar dahulu (Bumiputera paling hampir 65%; PAS di kawasan luar bandar);
   ahli setiap Cawangan = pemilih DM x peratus Bumiputera, diskala supaya jumlah ~700,000, minimum 5.
   Guna: node tools/build-bersatu.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), rd = (f) => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const demo = rd('data/demografi.json'), dun = rd('data/dun.json');
const D = require(path.join(R, 'js', 'data.js'));
const JUMLAH = 700000, MIN = 5, HAD = 30, SARAWAK = '13';
const skor = (b) => Math.abs(b - 65);
const pl = Object.values(demo.parlimen).filter((x) => String(x.negeri) !== SARAWAK && x.bumi >= HAD).sort((a, b) => skor(a.bumi) - skor(b.bumi) || a.kod.localeCompare(b.kod));
const kawasan = { parlimen: {}, dun: {} };
pl.forEach((x, i) => { kawasan.parlimen[x.kod] = { n: x.nama, m: x.bumi, r: i + 1, ng: String(x.negeri), neg: x.kod === 'P.166' ? 'WP Labuan' : D.negeriDariKod(parseInt(x.kod.replace('P.', ''), 10)), a: 0, w: 0, c: 0 }; });
const namaDun = {}; dun.fitur.forEach((f) => { namaDun[f.id] = f.nama; });
const duns = Object.values(demo.dun).filter((d) => kawasan.parlimen[d.parlimen]).sort((a, b) => skor(a.bumi) - skor(b.bumi) || a.kod.localeCompare(b.kod));
duns.forEach((d, i) => { kawasan.dun[d.kod] = { n: d.nama, m: d.bumi, r: i + 1, p: d.parlimen }; });
const dmCache = {};
function dmNegeri(ng) { if (!dmCache[ng]) { dmCache[ng] = rd('data/dm-' + ng + '.json'); } return dmCache[ng]; }
const senarai = []; let jumW = 0;
pl.slice().sort((a, b) => a.kod.localeCompare(b.kod)).forEach((x) => {
  const j = dmNegeri(String(x.negeri)), dmd = j.demografi || {}, kumpulan = {};
  j.fitur.filter((f) => f.parlimen === x.kod).forEach((f) => { const k = f.dun || '_'; (kumpulan[k] = kumpulan[k] || []).push(f); });
  Object.keys(kumpulan).sort().forEach((kd) => { kumpulan[kd].sort((a, b) => a.id.localeCompare(b.id)).forEach((f, i) => { const w = ((dmd[f.id] && dmd[f.id].pemilih) || 2000) * x.bumi / 100; jumW += w; senarai.push({ x, kd, f, i, w }); }); });
});
let skala = JUMLAH / jumW;
for (let n = 0; n < 40; n++) { const t = senarai.reduce((a, s) => a + Math.max(MIN, Math.round(s.w * skala)), 0); if (t <= JUMLAH) { break; } skala *= 1 - (t - JUMLAH) / t; }
const baris = ['ID,Nama Negeri,Nama Parlimen,Nama DUN,Nama Lokaliti,Jumlah Ahli,Lelaki,Perempuan,Bawah 40,Atas 40'], q = (s) => '"' + String(s || '').replace(/"/g, '""') + '"';
let jum = 0;
senarai.forEach((s) => {
  const no = parseInt(s.x.kod.replace('P.', ''), 10), noD = s.kd === '_' ? 0 : parseInt(s.kd.split('_N.')[1], 10);
  const ahli = Math.max(MIN, Math.round(s.w * skala)), lk = Math.round(ahli * 0.55), b40 = Math.round(ahli * 0.4), k = kawasan.parlimen[s.x.kod];
  k.a += ahli; k.c++; jum += ahli;
  baris.push([String(no).padStart(3, '0') + '/' + String(noD).padStart(3, '0') + '/' + String(s.i + 1).padStart(3, '0'), k.neg, q(s.x.nama), q(s.kd === '_' ? '' : (namaDun[s.kd] || '')), q(s.f.nama), ahli, lk, ahli - lk, b40, ahli - b40].join(','));
});
Object.values(kawasan.parlimen).forEach((k) => { k.w = Math.min(7, Math.max(1, Math.ceil(k.a / 300))); });   // Fasal 12.4.3
fs.writeFileSync(path.join(R, 'data', 'bersatu-malaysia.csv'), baris.join('\n') + '\n');
fs.writeFileSync(path.join(R, 'js', 'bersatu-data.js'), '/* Dijana oleh tools/build-bersatu.js. Jangan sunting dengan tangan. Bahagian BERSATU (andaian permainan): kawasan Parlimen Bumiputera 30% ke atas (bukan Sarawak); m = peratus Bumiputera, r = kedudukan kuota BERSATU dalam PN, a = anggaran ahli, w = wakil Perhimpunan Agung (Fasal 12.4.3), c = Cawangan, neg = negeri. */\n' +
  '(function (r) { var d = ' + JSON.stringify(kawasan) + '; if (typeof module === \'object\' && module.exports) { module.exports = d; } r.MyPolitikBersatuData = d; })(typeof globalThis !== \'undefined\' ? globalThis : this);\n');
console.log('Kawasan', pl.length, '· DUN', duns.length, '· Cawangan (DM)', senarai.length, '· ahli', jum);
