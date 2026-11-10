#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/build-grs.js   (v13.54)
   Jana data enam parti GRS (Gabungan Rakyat Sabah) daripada data peta sedia ada (data/demografi.json + data/dm-12.json + data/dm-15.json + data/dun.json):
     data/grs-<kod>.csv : Bahagian = kawasan Parlimen, DUN, Cawangan = Daerah Mengundi (nama sebenar DM), satu fail bagi setiap parti
     js/grs-data.js     : kawasan Parlimen / DUN Sabah (+ Labuan) dan, bagi setiap parti, kawasan operasi serta kuota kerusi dalam GRS
   Fakta: Gagasan Rakyat menyusun semula Bahagian ikut 25 kawasan Parlimen Sabah + Labuan (pindaan perlembagaan 17 Mei 2026); keahlian Gagasan
   579,980 (2025) dan PBS 580,000 (2022) ikut Wikipedia. PRN 2025: Gagasan 22/37, PBS 7/11, UPKO 3/25 (sebelum sertai GRS), PHRS 0/1, PCS 0/1, LDP 0/0.
   ANDAIAN (mockup GRS, dipersetujui): kawasan operasi parti selain Gagasan, kuota kerusi dalam GRS, dan keahlian UPKO / LDP / PHRS / PCS.
   Guna: node tools/build-grs.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), rd = (f) => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const demo = rd('data/demografi.json'), dun = rd('data/dun.json');
const D = require(path.join(R, 'js', 'data.js'));
const SABAH = Object.values(demo.parlimen).filter((x) => String(x.negeri) === '12').map((x) => x.kod).sort();
// kod: [kawasan operasi Parlimen, keahlian, kuota Parlimen, bilangan kuota DUN (dipilih dalam kawasan operasi)]
const PARTI = {
  GAGASAN: { ops: SABAH.concat(['P.166']), ahli: 579980, qPL: ['P.169', 'P.171', 'P.173', 'P.176', 'P.178', 'P.183', 'P.184', 'P.188'], nDUN: 37 },
  PBS: { ops: ['P.167', 'P.168', 'P.170', 'P.174', 'P.175', 'P.179', 'P.180', 'P.181', 'P.182', 'P.183'], ahli: 580000, qPL: ['P.170', 'P.179'], nDUN: 11 },
  UPKO: { ops: ['P.168', 'P.170', 'P.173', 'P.174', 'P.179', 'P.180', 'P.181', 'P.182', 'P.183', 'P.187'], ahli: 100000, qPL: ['P.174'], nDUN: 8 },
  LDP: { ops: ['P.172', 'P.174', 'P.185', 'P.186', 'P.190'], ahli: 20000, qPL: [], nDUN: 0 },
  PHRS: { ops: ['P.188', 'P.189', 'P.190', 'P.191'], ahli: 64000, qPL: [], nDUN: 0 },
  PCS: { ops: ['P.175', 'P.176', 'P.177', 'P.178'], ahli: 15000, qPL: [], nDUN: 0 }
};
function hash(t) { let h = 2166136261; t = String(t); for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const out = { parlimen: {}, dun: {}, parti: {} };
Object.values(demo.parlimen).filter((x) => String(x.negeri) === '12' || x.kod === 'P.166').forEach((x) => { out.parlimen[x.kod] = { n: x.nama, m: x.bumi, c: x.cina, ng: String(x.negeri) }; });
Object.values(demo.dun).filter((d) => out.parlimen[d.parlimen]).forEach((d) => { out.dun[d.kod] = { n: d.nama, m: d.bumi, c: d.cina, p: d.parlimen }; });
const namaDun = {}; dun.fitur.forEach((f) => { namaDun[f.id] = f.nama; });
const dmCache = {};
function dmNegeri(ng) { if (!dmCache[ng]) { dmCache[ng] = rd('data/dm-' + ng + '.json'); } return dmCache[ng]; }
const q = (s) => '"' + String(s || '').replace(/"/g, '""') + '"';
Object.keys(PARTI).forEach((kod) => {
  const P = PARTI[kod], ops = P.ops.slice().sort(), senarai = []; let jumP = 0;
  ops.forEach((pk) => {
    const x = demo.parlimen[pk], j = dmNegeri(String(x.negeri)), dmd = j.demografi || {}, kumpulan = {};
    j.fitur.filter((f) => f.parlimen === pk).forEach((f) => { const k = f.dun || '_'; (kumpulan[k] = kumpulan[k] || []).push(f); });
    Object.keys(kumpulan).sort().forEach((kd) => { kumpulan[kd].sort((a, b) => a.id.localeCompare(b.id)).forEach((f, i) => { const w = (dmd[f.id] && dmd[f.id].pemilih) || 1500; jumP += w; senarai.push({ x, kd, f, i, w }); }); });
  });
  const skala = P.ahli / jumP, baris = ['ID,Nama Negeri,Nama Parlimen,Nama DUN,Nama Lokaliti,Jumlah Ahli,Lelaki,Perempuan,Bawah 40,Atas 40'], kaw = {};
  let jum = 0;
  senarai.forEach((s) => {
    const no = parseInt(s.x.kod.replace('P.', ''), 10), noD = s.kd === '_' ? 0 : parseInt(s.kd.split('_N.')[1], 10);
    const ahli = Math.max(15, Math.min(3000, Math.round(s.w * skala))), lk = Math.round(ahli * 0.52), b40 = Math.round(ahli * 0.4);
    const k = kaw[s.x.kod] = kaw[s.x.kod] || { a: 0, b: 0 }; k.a += ahli; k.b++; jum += ahli;
    baris.push([String(no).padStart(3, '0') + '/' + String(noD).padStart(3, '0') + '/' + String(s.i + 1).padStart(3, '0'), s.x.kod === 'P.166' ? 'WP Labuan' : D.negeriDariKod(no), q(s.x.nama), q(s.kd === '_' ? '' : (namaDun[s.kd] || '')), q(s.f.nama), ahli, lk, ahli - lk, b40, ahli - b40].join(','));
  });
  // kuota DUN: nDUN kerusi dalam kawasan operasi (benih tetap ikut kod parti)
  const duns = Object.keys(out.dun).filter((d) => ops.indexOf(out.dun[d].p) >= 0).sort((a, b) => hash(kod + a) - hash(kod + b)).slice(0, P.nDUN).sort();
  out.parti[kod] = { ops: ops, kaw: kaw, qPL: P.qPL, qDUN: duns, ahli: jum };
  fs.writeFileSync(path.join(R, 'data', 'grs-' + kod.toLowerCase() + '.csv'), baris.join('\n') + '\n');
  console.log(kod, 'Bahagian', ops.length, '· Cawangan', senarai.length, '· ahli', jum, '· kuota PL', P.qPL.length, 'DUN', duns.length);
});
fs.writeFileSync(path.join(R, 'js', 'grs-data.js'), '/* Dijana oleh tools/build-grs.js. Jangan sunting dengan tangan. Kerusi Sabah (+ Labuan) dan, bagi setiap parti GRS, kawasan operasi (ops), anggaran ahli / Cawangan setiap Bahagian (kaw), kuota Parlimen (qPL) dan kuota DUN (qDUN) dalam GRS (andaian permainan). */\n' +
  '(function (r) { var d = ' + JSON.stringify(out) + '; if (typeof module === \'object\' && module.exports) { module.exports = d; } r.MyPolitikGRSData = d; })(typeof globalThis !== \'undefined\' ? globalThis : this);\n');
