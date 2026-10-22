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
/* v9.4: ringkasan Parlimen (31 kerusi) disalin ke setiap DUN sebagai `pl` (disimpan dalam profil bersama dunInfo): pemilih, bilangan DUN dan etnik wajaran pemilih. */
const pl = {};
Object.keys(dun).forEach(no => { const o = dun[no], z = pl[o.kodParlimen] = pl[o.kodParlimen] || { nama: o.parlimen, kod: o.kodParlimen, pemilih: 0, bilDUN: 0, e: { melayu: 0, cina: 0, india: 0, iban: 0, bidayuh: 0, orangUlu: 0, lain: 0 } };
  z.pemilih += o.pemilih; z.bilDUN++; Object.keys(z.e).forEach(x => { z.e[x] += (o.e[x] || 0) * o.pemilih; }); });
Object.keys(pl).forEach(k => { const z = pl[k]; Object.keys(z.e).forEach(x => { z.e[x] = Math.round(z.e[x] / (z.pemilih || 1) * 10) / 10; }); });
Object.keys(dun).forEach(no => { dun[no].pl = pl[dun[no].kodParlimen]; });
/* v10.0: PRS (mod ringan). ANDAIAN: kawasan operasi PRS = DUN dengan peratus Dayak (Iban+Bidayuh+Orang Ulu) 60% ke atas; `rkPRS` = kedudukan (1 = paling Dayak) untuk kuota kerusi GPS. */
const DAYAK_PRS = 60, dyk = o => o.e.iban + o.e.bidayuh + o.e.orangUlu;
Object.keys(dun).filter(no => dyk(dun[no]) >= DAYAK_PRS).sort((a, b) => dyk(dun[b]) - dyk(dun[a]) || a - b).forEach((no, i) => { dun[no].rkPRS = i + 1; });
/* v10.1: SUPP (mod ringan). ANDAIAN: kawasan operasi SUPP = DUN dengan peratus Cina 25% ke atas; `rkSUPP` = kedudukan (1 = paling Cina). */
const CINA_SUPP = 25;
Object.keys(dun).filter(no => dun[no].e.cina >= CINA_SUPP).sort((a, c) => dun[c].e.cina - dun[a].e.cina || a - c).forEach((no, i) => { dun[no].rkSUPP = i + 1; });
/* v10.2: PDP (mod ringan). ANDAIAN: kawasan operasi PDP = DUN campuran (kumpulan terbesar antara Melayu/Melanau, Cina, Dayak kurang 55%); `rkPDP` = kedudukan (1 = paling campuran). */
const MAKS_PDP = 55, maksKaum = o => Math.max(o.e.melayu, o.e.cina, o.e.iban + o.e.bidayuh + o.e.orangUlu);
Object.keys(dun).filter(no => maksKaum(dun[no]) < MAKS_PDP).sort((a, c) => maksKaum(dun[a]) - maksKaum(dun[c]) || a - c).forEach((no, i) => { dun[no].rkPDP = i + 1; });
/* v10.3: PSB (pembangkang, mod ringan). ANDAIAN: kawasan operasi PSB = DUN dengan Melayu/Melanau kurang 40% (Cina + Dayak + lain-lain 60% ke atas). Tiada kuota; `rkPSB` = 1 bagi semua DUN dalam kawasan. */
Object.keys(dun).filter(no => dun[no].e.melayu < 40).forEach(no => { dun[no].rkPSB = 1; });
console.log('Parlimen:', Object.keys(pl).length);
fs.writeFileSync(path.join(__dirname, '..', 'data', 'pbb-dun.json'), JSON.stringify(dun));
console.log('data/pbb-dun.json', Object.keys(dun).length, 'DUN');
fs.writeFileSync(path.join(__dirname, '..', 'data', 'pbb-sarawak.csv'), baris.map(r => r.join(',')).join('\n') + '\n');
console.log('data/pbb-sarawak.csv', baris.length - 1, 'cawangan');
/* v10.0: CSV PRS: hanya cawangan dalam DUN kawasan operasi PRS. */
const prsBaris = [baris[0]].concat(baris.slice(1).filter(r => { const no = parseInt(String(r[0]).split('/')[1], 10); return dun[no] && dun[no].rkPRS; }));
fs.writeFileSync(path.join(__dirname, '..', 'data', 'prs-sarawak.csv'), prsBaris.map(r => r.join(',')).join('\n') + '\n');
console.log('data/prs-sarawak.csv', prsBaris.length - 1, 'cawangan');
/* v10.1: CSV SUPP: hanya cawangan dalam DUN kawasan operasi SUPP. */
const suppBaris = [baris[0]].concat(baris.slice(1).filter(r => { const no = parseInt(String(r[0]).split('/')[1], 10); return dun[no] && dun[no].rkSUPP; }));
fs.writeFileSync(path.join(__dirname, '..', 'data', 'supp-sarawak.csv'), suppBaris.map(r => r.join(',')).join('\n') + '\n');
console.log('data/supp-sarawak.csv', suppBaris.length - 1, 'cawangan');
/* v10.2: CSV PDP: hanya cawangan dalam DUN kawasan operasi PDP. */
const pdpBaris = [baris[0]].concat(baris.slice(1).filter(r => { const no = parseInt(String(r[0]).split('/')[1], 10); return dun[no] && dun[no].rkPDP; }));
fs.writeFileSync(path.join(__dirname, '..', 'data', 'pdp-sarawak.csv'), pdpBaris.map(r => r.join(',')).join('\n') + '\n');
console.log('data/pdp-sarawak.csv', pdpBaris.length - 1, 'cawangan');
/* v10.3: CSV PSB. */
const psbBaris = [baris[0]].concat(baris.slice(1).filter(r => { const no = parseInt(String(r[0]).split('/')[1], 10); return dun[no] && dun[no].rkPSB; }));
fs.writeFileSync(path.join(__dirname, '..', 'data', 'psb-sarawak.csv'), psbBaris.map(r => r.join(',')).join('\n') + '\n');
console.log('data/psb-sarawak.csv', psbBaris.length - 1, 'cawangan,', Object.keys(dun).filter(no => dun[no].rkPSB).length, 'DUN');
