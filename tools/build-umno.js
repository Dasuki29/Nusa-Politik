#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/build-umno.js   (v13.5)
   Jana jadual Bahagian UMNO untuk pemilihan Pusat di Mesyuarat Perwakilan Bahagian (Perlembagaan UMNO 2025, Fasal 9.3, 14.5.4).
     js/umno-data.js : n = nama, ng = kod negeri, d = bilangan Daerah Mengundi (anggaran Cawangan), w = perwakilan Bahagian
   ANDAIAN (mockup Fasa B, dipersetujui): 191 Bahagian = semua kawasan Parlimen kecuali Sarawak (UMNO tiada di Sarawak).
   Perwakilan setiap Bahagian = 70 (AJK, Pengerusi Tetap, wakil sayap) + 6 bagi setiap Daerah Mengundi.
   Guna: node tools/build-umno.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), rd = (f) => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const demo = rd('data/demografi.json');
const ASAS = 70, SETIAP_DM = 6, SARAWAK = '13';
const pl = Object.values(demo.parlimen).filter((x) => String(x.negeri) !== SARAWAK).sort((a, b) => a.kod.localeCompare(b.kod));
const dmCache = {};
function dmNegeri(ng) { if (!dmCache[ng]) { try { dmCache[ng] = rd('data/dm-' + ng + '.json'); } catch (e) { dmCache[ng] = { fitur: [] }; } } return dmCache[ng]; }
const out = { bahagian: {} };
let jum = 0;
pl.forEach((x) => {
  const d = dmNegeri(String(x.negeri)).fitur.filter((f) => f.parlimen === x.kod).length || 20;
  const w = ASAS + SETIAP_DM * d; jum += w;
  out.bahagian[x.kod] = { n: x.nama, ng: String(x.negeri), d: d, w: w };
});
fs.writeFileSync(path.join(R, 'js', 'umno-data.js'), '/* Dijana oleh tools/build-umno.js. Jangan sunting dengan tangan. Bahagian UMNO (andaian permainan): semua kawasan Parlimen kecuali Sarawak; d = bilangan Daerah Mengundi, w = perwakilan Mesyuarat Perwakilan Bahagian (70 + 6 x d). */\n' +
  '(function (r) { var d = ' + JSON.stringify(out) + '; if (typeof module === \'object\' && module.exports) { module.exports = d; } r.MyPolitikUMNOData = d; })(typeof globalThis !== \'undefined\' ? globalThis : this);\n');
console.log('Bahagian', pl.length, '· perwakilan', jum, '· min', Math.min(...Object.values(out.bahagian).map((x) => x.w)), '· maks', Math.max(...Object.values(out.bahagian).map((x) => x.w)));
