#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/build-pkr.js   (v13.34)
   Jana data PKR daripada data peta sedia ada (data/demografi.json + data/dm-*.json + data/dun.json):
     data/pkr-malaysia.csv : Cabang = kawasan Parlimen, DUN, Ranting = Daerah Mengundi (nama sebenar DM)
     js/pkr-data.js        : jadual Cabang (peratus Bumiputera, kedudukan kuota, anggaran anggota Cabang) untuk js/pkr.js
   Perlembagaan PKR (pindaan hingga 11 Mac 2025): Cabang di setiap kawasan Pilihanraya Dewan Rakyat (Fasal 1.6, 32.1), Ranting ialah unit
   operasi dalam Cabang (Fasal 23.1(e), 39.1(g)). Kawasan operasi = semua 222 kawasan Parlimen.
   ANDAIAN (mockup skop PH, dipersetujui): kedudukan kuota kerusi PKR dalam PH ikut kawasan bercampur dahulu (|Bumiputera - 60| terkecil = 1).
   Bilangan anggota setiap Ranting ialah anggaran permainan: pemilih DM x 5%, minimum 25, maksimum 900. Saiz anggota Cabang (medan a)
   menentukan Perwakilan Tambahan ke Kongres Nasional (Fasal 17.2A(c)(iii)).
   Guna: node tools/build-pkr.js   (kemudian node tools/bina-data-lokal.js untuk salinan data/js)
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), rd = (f) => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const demo = rd('data/demografi.json'), dun = rd('data/dun.json');
const SEMUA = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];
const KADAR = 0.05, MIN = 25, MAKS = 900, PUSAT = 60;
const skor = (b) => Math.abs(b - PUSAT);
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
      const ahli = Math.max(MIN, Math.min(MAKS, Math.round(pemilih * KADAR)));
      const lk = Math.round(ahli * 0.5), b40 = Math.round(ahli * 0.35);
      kawasan.parlimen[x.kod].a = (kawasan.parlimen[x.kod].a || 0) + ahli;
      baris.push([kodP + '/' + kodD + '/' + String(i + 1).padStart(3, '0'), D.negeriDariKod(no), q(x.nama), q(kd === '_' ? '' : (namaDun[kd] || '')), q(f.nama), ahli, lk, ahli - lk, b40, ahli - b40].join(','));
      bil++;
    });
  });
});
fs.writeFileSync(path.join(R, 'data', 'pkr-malaysia.csv'), baris.join('\n') + '\n');
fs.writeFileSync(path.join(R, 'js', 'pkr-data.js'), '/* Dijana oleh tools/build-pkr.js. Jangan sunting dengan tangan. Cabang PKR (andaian permainan): semua 222 kawasan Parlimen; m = peratus Bumiputera, r = kedudukan kuota PKR dalam PH, a = anggaran anggota Cabang. */\n' +
  '(function (r) { var d = ' + JSON.stringify(kawasan) + '; if (typeof module === \'object\' && module.exports) { module.exports = d; } r.MyPolitikPKRData = d; })(typeof globalThis !== \'undefined\' ? globalThis : this);\n');
console.log('Cabang', pl.length, '· DUN', duns.length, '· Ranting (DM)', bil);
