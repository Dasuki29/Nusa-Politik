#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/build-dap.js   (v13.37)
   Jana data DAP daripada data peta sedia ada (data/demografi.json + data/dm-*.json + data/dun.json):
     data/dap-malaysia.csv : Kawasan = kawasan Parlimen (JPKP), DUN, Cawangan = Daerah Mengundi (nama sebenar DM)
     js/dap-data.js        : jadual kawasan Parlimen (peratus Bumiputera, kedudukan kuota, anggaran ahli, bilangan Wakil Kongres) untuk js/dap.js
   Perlembagaan DAP (seperti pada 22.10.2019): Jawatankuasa Perhubungan Kawasan Parlimen (JPKP, Fasal XVII-XIX) bagi setiap kawasan Parlimen;
   Wakil Cawangan ke Kongres (Fasal VIII.3): 25-50 ahli berbayar = 2 wakil; 51-100 = tambahan 1; setiap 100 ahli seterusnya = tambahan 1.
   ANDAIAN (mockup skop DAP, dipersetujui): kawasan operasi = semua 222 kawasan Parlimen; kedudukan kuota DAP dalam PH ikut peratus Bumiputera
   terendah dahulu (= 1). Ahli setiap Cawangan = pemilih DM x peratus bukan Bumiputera x 2%, minimum 5, maksimum 900 (~1,700 Cawangan layak,
   ~4,200 Wakil Kongres).
   Guna: node tools/build-dap.js   (kemudian node tools/bina-data-lokal.js untuk salinan data/js)
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), rd = (f) => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const demo = rd('data/demografi.json'), dun = rd('data/dun.json');
const SEMUA = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];
const KADAR = 0.02, MIN = 5, MAKS = 900;
const skor = (b) => b;
const wakil = (a) => (a < 25 ? 0 : 2 + (a > 50 ? 1 : 0) + (a > 100 ? Math.ceil((a - 100) / 100) : 0));   // Fasal VIII.3
const D = require(path.join(R, 'js', 'data.js'));

const pl = Object.values(demo.parlimen).filter((x) => SEMUA.indexOf(String(x.negeri)) >= 0).sort((a, b) => skor(a.bumi) - skor(b.bumi) || a.kod.localeCompare(b.kod));
const kawasan = { parlimen: {}, dun: {} };
pl.forEach((x, i) => { kawasan.parlimen[x.kod] = { n: x.nama, m: x.bumi, r: i + 1, ng: String(x.negeri) }; });
const namaDun = {}; dun.fitur.forEach((f) => { namaDun[f.id] = f.nama; });
const duns = Object.values(demo.dun).filter((d) => kawasan.parlimen[d.parlimen]).sort((a, b) => skor(a.bumi) - skor(b.bumi) || a.kod.localeCompare(b.kod));
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
      const ahli = Math.max(MIN, Math.min(MAKS, Math.round(pemilih * (100 - x.bumi) / 100 * KADAR)));
      const lk = Math.round(ahli * 0.5), b40 = Math.round(ahli * 0.35);
      kawasan.parlimen[x.kod].a = (kawasan.parlimen[x.kod].a || 0) + ahli; kawasan.parlimen[x.kod].w = (kawasan.parlimen[x.kod].w || 0) + wakil(ahli); kawasan.parlimen[x.kod].c = (kawasan.parlimen[x.kod].c || 0) + (ahli >= 25 ? 1 : 0);
      baris.push([kodP + '/' + kodD + '/' + String(i + 1).padStart(3, '0'), D.negeriDariKod(no), q(x.nama), q(kd === '_' ? '' : (namaDun[kd] || '')), q(f.nama), ahli, lk, ahli - lk, b40, ahli - b40].join(','));
      bil++;
    });
  });
});
fs.writeFileSync(path.join(R, 'data', 'dap-malaysia.csv'), baris.join('\n') + '\n');
fs.writeFileSync(path.join(R, 'js', 'dap-data.js'), '/* Dijana oleh tools/build-dap.js. Jangan sunting dengan tangan. Kawasan DAP (andaian permainan): semua 222 kawasan Parlimen; m = peratus Bumiputera, r = kedudukan kuota DAP dalam PH, a = anggaran ahli, w = Wakil Kongres (Fasal VIII.3), c = Cawangan layak menghantar wakil. */\n' +
  '(function (r) { var d = ' + JSON.stringify(kawasan) + '; if (typeof module === \'object\' && module.exports) { module.exports = d; } r.MyPolitikDAPData = d; })(typeof globalThis !== \'undefined\' ? globalThis : this);\n');
console.log('Kawasan', pl.length, '· DUN', duns.length, '· Cawangan (DM)', bil, '· Wakil Kongres', Object.values(kawasan.parlimen).reduce((t, x) => t + (x.w || 0), 0));
