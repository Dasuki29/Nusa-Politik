#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/build-pbb.js   (v8.32)
   Bina data/pbb-sarawak.csv (format Google Sheet permainan) daripada data/dm-13.json.
     Bahagian PBB = DUN (82), Cawangan PBB = Daerah Mengundi (887).
     ID: 013/<no DUN>/001/<no DM dalam DUN>.  Kod geo DM sebenar diterbitkan semula oleh js/geo.js.
   ANDAIAN (ubah di bawah): bilangan ahli ialah NISBAH_AHLI x pemilih (nombor rekaan, bukan data PBB sebenar).
   Guna: node tools/build-pbb.js   (jalankan dari akar projek)
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const NISBAH_AHLI = 0.12, MIN_AHLI = 50, MAKS_AHLI = 500;
const dm = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'dm-13.json'), 'utf8')).demografi;
const baris = [['ID', 'Nama Negeri', 'Nama Parlimen', 'Nama DUN', 'Nama Lokaliti', 'Jumlah Ahli', 'Lelaki', 'Perempuan', 'Bawah 40', 'Atas 40']];
const lok = x => '"' + String(x).replace(/"/g, '""') + '"';
Object.keys(dm).sort().forEach(k => {
  const d = dm[k], noDun = String(d.dun).split('N.')[1], seq = k.split('/')[2];
  const jumlah = Math.max(MIN_AHLI, Math.min(MAKS_AHLI, Math.round(d.pemilih * NISBAH_AHLI)));
  const jk = (d.lelaki || 0) + (d.perempuan || 0) || 1, pL = (d.lelaki || 0) / jk;
  const um = d.umur || [0, 0, 0, 0, 0], tot = um.reduce((a, b) => a + b, 0) || 1, pU = (um[0] + um[1] + um[2] * 0.67) / tot;
  const lelaki = Math.round(jumlah * pL), bawah = Math.round(jumlah * pU);
  baris.push(['013/' + noDun.padStart(3, '0') + '/001/' + seq, 'Sarawak', lok(d.namaDun), lok(d.namaDun), lok(d.nama), jumlah, lelaki, jumlah - lelaki, bawah, jumlah - bawah]);
});
/* v8.33: ringkasan setiap DUN (kerusi PBB): pemilih dan komposisi etnik, untuk kekuatan kerusi dalam PRN. */
const dun = {};
Object.keys(dm).forEach(k => {
  const d = dm[k], no = parseInt(String(d.dun).split('N.')[1], 10), e = d.etnik || {};
  const o = dun[no] = dun[no] || { nama: d.namaDun, parlimen: d.namaParlimen, kodParlimen: d.parlimen, pemilih: 0, bil: 0, e: { melayu: 0, cina: 0, india: 0, iban: 0, bidayuh: 0, orangUlu: 0, lain: 0 } };
  o.pemilih += d.pemilih || 0; o.bil++; Object.keys(o.e).forEach(x => { o.e[x] += e[x] || 0; });
});
Object.keys(dun).forEach(no => { const o = dun[no], t = Object.values(o.e).reduce((a, b) => a + b, 0) || 1; Object.keys(o.e).forEach(x => { o.e[x] = Math.round(o.e[x] / t * 1000) / 10; }); });
fs.writeFileSync(path.join(__dirname, '..', 'data', 'pbb-dun.json'), JSON.stringify(dun));
console.log('data/pbb-dun.json', Object.keys(dun).length, 'DUN');
fs.writeFileSync(path.join(__dirname, '..', 'data', 'pbb-sarawak.csv'), baris.map(r => r.join(',')).join('\n') + '\n');
console.log('data/pbb-sarawak.csv', baris.length - 1, 'cawangan');
