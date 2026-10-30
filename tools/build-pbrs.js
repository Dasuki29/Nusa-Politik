#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/build-pbrs.js   (v13.9)
   Jana data PBRS daripada data peta sedia ada (data/demografi.json + data/dm-12.json + data/dun.json):
     data/pbrs-sabah.csv : Bahagian = kawasan Parlimen, DUN, Cawangan = Daerah Mengundi (nama sebenar DM)
     js/pbrs-data.js     : jadual kawasan (peratus Bumiputera dan Cina, bilangan Cawangan) dan kuota kerusi BN untuk js/pbrs.js
   ANDAIAN (mockup PRN Sabah + PBRS, dipersetujui): kawasan operasi = 7 kawasan Parlimen pedalaman Sabah (dipilih secara manual kerana data
   hanya memisahkan "Bumiputera", tanpa pecahan Kadazan-Dusun-Murut). Kuota asas BN: Parlimen P.182 Pensiangan; DUN N.45 Sook dan N.40 Bingkor.
   Bilangan ahli setiap Cawangan ialah anggaran permainan: pemilih DM x 4%, minimum 30 dan maksimum 150.
   Guna: node tools/build-pbrs.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), rd = (f) => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const demo = rd('data/demografi.json'), dun = rd('data/dun.json');
const SABAH = '12', PILIH = ['P.168', 'P.170', 'P.174', 'P.179', 'P.180', 'P.181', 'P.182'], KUOTA_PL = ['P.182'], KUOTA_DUN = ['12_N.45', '12_N.40'];
const KADAR = 0.04, MIN = 30, MAKS = 150;
const D = require(path.join(R, 'js', 'data.js'));

const pl = Object.values(demo.parlimen).filter((x) => String(x.negeri) === SABAH && PILIH.indexOf(x.kod) >= 0).sort((a, b) => a.kod.localeCompare(b.kod));
const kawasan = { parlimen: {}, dun: {} };
pl.forEach((x) => { kawasan.parlimen[x.kod] = { n: x.nama, m: x.bumi, c: x.cina, ng: String(x.negeri), b: 0, q: KUOTA_PL.indexOf(x.kod) >= 0 ? 1 : 0 }; });
const namaDun = {}; dun.fitur.forEach((f) => { namaDun[f.id] = f.nama; });
const duns = Object.values(demo.dun).filter((d) => kawasan.parlimen[d.parlimen]).sort((a, b) => a.kod.localeCompare(b.kod));
duns.forEach((d) => { kawasan.dun[d.kod] = { n: d.nama, m: d.bumi, c: d.cina, p: d.parlimen, q: KUOTA_DUN.indexOf(d.kod) >= 0 ? 1 : 0 }; });

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
fs.writeFileSync(path.join(R, 'data', 'pbrs-sabah.csv'), baris.join('\n') + '\n');
fs.writeFileSync(path.join(R, 'js', 'pbrs-data.js'), '/* Dijana oleh tools/build-pbrs.js. Jangan sunting dengan tangan. Kawasan operasi PBRS (andaian permainan): 7 kawasan Parlimen pedalaman Sabah; m = peratus Bumiputera, c = Cina, a = anggaran ahli Bahagian, b = bilangan Cawangan, q = 1 jika dalam kuota asas BN. */\n' +
  '(function (r) { var d = ' + JSON.stringify(kawasan) + '; if (typeof module === \'object\' && module.exports) { module.exports = d; } r.MyPolitikPBRSData = d; })(typeof globalThis !== \'undefined\' ? globalThis : this);\n');
console.log('Parlimen', pl.length, '· DUN', duns.length, '· Cawangan (DM)', bil);
