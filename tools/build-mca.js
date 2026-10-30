#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/build-mca.js   (v13.1)
   Jana data MCA daripada data peta sedia ada (data/demografi.json + data/dm-*.json + data/dun.json):
     data/mca-semenanjung.csv : Bahagian = kawasan Parlimen, DUN, Cawangan = Daerah Mengundi (nama sebenar DM)
     js/mca-data.js           : jadual kawasan (peratus Cina, kedudukan kuota) untuk js/mca.js (segerak, tanpa fetch)
   ANDAIAN (v13.2, dipersetujui): kawasan operasi = semua 165 kawasan Parlimen Semenanjung (MCA ada Bahagian di seluruh Semenanjung).
   Peratus Cina menentukan kesukaran, bukan kelayakan: kedudukan kuota kerusi BN mengikut peratus Cina (tertinggi = 1),
   dan saiz keahlian Bahagian (medan a) menentukan bilangan perwakilan Bahagian dalam Pemilihan Pusat (js/mca.js). Bilangan ahli setiap Cawangan ialah anggaran permainan:
   pemilih DM x peratus Cina kawasan x 7%, minimum 50 (Perkara 92: Cawangan minimum 50 ahli), maksimum 900.
   v13.16 (mockup MCA & MIC Sabah, dipersetujui): tambah 7 kawasan Parlimen Sabah (Bahagian MCA Sabah yang diketahui: Kota Kinabalu, Sepanggar, Batu Sapi; selebihnya mengandungi 6 DUN sasaran MCA Sabah)
   (Kapayan, Likas, Karamunting, Elopura, Segama, Tanjong Kapor). Sabah: sb = 1, r = 900+ (di luar kedudukan kuota Semenanjung),
   s = 1 bagi DUN sasaran. Kuota Sabah ditentukan oleh js/sabah-bn.js (Pemulihan Sabah).
   Guna: node tools/build-mca.js   (kemudian node tools/bina-data-lokal.js untuk salinan data/js)
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), rd = (f) => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const demo = rd('data/demografi.json'), dun = rd('data/dun.json');
const SEMENANJUNG = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '14', '16'];
const AMBANG = 0, KADAR = 0.07, MIN = 50, MAKS = 900;
const D = require(path.join(R, 'js', 'data.js'));

const pl = Object.values(demo.parlimen).filter((x) => SEMENANJUNG.indexOf(String(x.negeri)) >= 0 && x.cina >= AMBANG).sort((a, b) => b.cina - a.cina || a.kod.localeCompare(b.kod));
const kawasan = { parlimen: {}, dun: {} };
pl.forEach((x, i) => { kawasan.parlimen[x.kod] = { n: x.nama, c: x.cina, r: i + 1, ng: String(x.negeri) }; });
const namaDun = {}; dun.fitur.forEach((f) => { namaDun[f.id] = f.nama; });
const duns = Object.values(demo.dun).filter((d) => kawasan.parlimen[d.parlimen]).sort((a, b) => b.cina - a.cina || a.kod.localeCompare(b.kod));
duns.forEach((d, i) => { kawasan.dun[d.kod] = { n: d.nama, c: d.cina, r: i + 1, p: d.parlimen }; });
const SABAH_PL = ['P.167', 'P.171', 'P.172', 'P.174', 'P.185', 'P.186', 'P.188'], SASARAN = ['12_N.19', '12_N.25', '12_N.55', '12_N.54', '12_N.04', '12_N.61'];
const plSabah = SABAH_PL.map((k) => demo.parlimen[k] || Object.values(demo.parlimen).find((x) => x.kod === k)).filter(Boolean);
plSabah.forEach((x, i) => { kawasan.parlimen[x.kod] = { n: x.nama, c: x.cina, r: 900 + i, ng: String(x.negeri), sb: 1 }; });
Object.values(demo.dun).filter((d) => SABAH_PL.indexOf(d.parlimen) >= 0).sort((a, b) => a.kod.localeCompare(b.kod)).forEach((d, i) => {
  kawasan.dun[d.kod] = { n: d.nama, c: d.cina, r: 900 + i, p: d.parlimen, sb: 1, s: SASARAN.indexOf(d.kod) >= 0 ? 1 : 0 };
});
kawasan.sasaranSabah = SASARAN;

const dmCache = {};
function dmNegeri(ng) { if (!dmCache[ng]) { dmCache[ng] = rd('data/dm-' + ng + '.json'); } return dmCache[ng]; }
const baris = ['ID,Nama Negeri,Nama Parlimen,Nama DUN,Nama Lokaliti,Jumlah Ahli,Lelaki,Perempuan,Bawah 40,Atas 40'];
const q = (s) => '"' + String(s || '').replace(/"/g, '""') + '"';
let bil = 0;
pl.concat(plSabah).sort((a, b) => a.kod.localeCompare(b.kod)).forEach((x) => {
  const no = parseInt(x.kod.replace('P.', ''), 10), kodP = String(no).padStart(3, '0'), j = dmNegeri(String(x.negeri)), dmd = j.demografi || {};
  const dms = j.fitur.filter((f) => f.parlimen === x.kod), kumpulan = {};
  dms.forEach((f) => { const k = f.dun || '_'; (kumpulan[k] = kumpulan[k] || []).push(f); });
  Object.keys(kumpulan).sort().forEach((kd) => {
    const noD = kd === '_' ? 0 : parseInt(kd.split('_N.')[1], 10), kodD = String(noD).padStart(3, '0');
    kumpulan[kd].sort((a, b) => a.id.localeCompare(b.id)).forEach((f, i) => {
      const pemilih = (dmd[f.id] && dmd[f.id].pemilih) || 2000;
      const ahli = Math.max(MIN, Math.min(MAKS, Math.round(pemilih * x.cina / 100 * KADAR)));
      const lk = Math.round(ahli * 0.51), b40 = Math.round(ahli * 0.3);
      kawasan.parlimen[x.kod].a = (kawasan.parlimen[x.kod].a || 0) + ahli;
      baris.push([kodP + '/' + kodD + '/' + String(i + 1).padStart(3, '0'), D.negeriDariKod(no), q(x.nama), q(kd === '_' ? '' : (namaDun[kd] || '')), q(f.nama), ahli, lk, ahli - lk, b40, ahli - b40].join(','));
      bil++;
    });
  });
});
fs.writeFileSync(path.join(R, 'data', 'mca-semenanjung.csv'), baris.join('\n') + '\n');
fs.writeFileSync(path.join(R, 'js', 'mca-data.js'), '/* Dijana oleh tools/build-mca.js. Jangan sunting dengan tangan. Kawasan operasi MCA (andaian permainan): semua kawasan Parlimen Semenanjung; c = peratus Cina, r = kedudukan kuota, a = anggaran ahli Bahagian. */\n' +
  '(function (r) { var d = ' + JSON.stringify(kawasan) + '; if (typeof module === \'object\' && module.exports) { module.exports = d; } r.MyPolitikMCAData = d; })(typeof globalThis !== \'undefined\' ? globalThis : this);\n');
console.log('Parlimen', pl.length, '· DUN', duns.length, '· Cawangan (DM)', bil);
