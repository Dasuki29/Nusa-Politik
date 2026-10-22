/* ==========================================================================
   Nusa Politik — tools/persekitaran.js   (v8.0)
   Persekitaran Node untuk memuat modul logik permainan TANPA pelayar, untuk
   tools/ujian.js (ujian peraturan) dan tools/simulasi.js (main automatik).

   - localStorage / sessionStorage tiruan dalam memori (globalThis)
   - modul js/ dimuat mengikut susunan dashboard.html (modul UI yang perlukan DOM dilangkau)
   - Math.random boleh dibenihkan supaya keputusan boleh diulang

   Guna:
     const P = require('./persekitaran');
     const g = P.muat();              // pulang globalThis dengan MyPolitikSave, MyPolitikElection, ...
     P.benih(42);                     // Math.random berbenih
     const p = P.daftar({ sayap: 'utama', kesukaran: 'HARDCORE' });
     P.kosongkan();                   // padam semua storan (pemain baharu)
   ========================================================================== */
'use strict';
const path = require('path');

const JS = path.join(__dirname, '..', 'js');

/* Susunan sama seperti dashboard.html, tanpa modul yang bergantung pada DOM (app, pru-ui, dewan-ui, lagu, pwa, menu, slotpanel, tema, map). */
const SUSUNAN = ['data', 'parti', 'sayap', 'blok', 'misi', 'save', 'pencapaian', 'sfx', 'krisis-peta', 'kerjaya', 'harta', 'kawasan', 'glc', 'komuniti', 'pindah', 'undo', 'infra', 'calendar', 'avatar', 'ordinaryMember', 'incumbent', 'jawatan', 'etika',
  'election', 'rival', 'negeri', 'meeting', 'EventDatabase', 'events', 'geo', 'slot', 'latihan', 'tutorial', 'watak', 'perlembagaan',
  'organisasi', 'stress', 'hayat', 'pru', 'kabinet-data', 'kabinet', 'prk', 'ElectionEngine', 'CabinetEngine', 'WingEngine', 'dewan', 'dun', 'paparan'];

function storanBaharu() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    clear: () => { m.clear(); },
    key: (i) => Array.from(m.keys())[i] || null,
    get length() { return m.size; },
    _peta: m
  };
}

let dimuat = false;
function muat() {
  if (dimuat) { return globalThis; }
  globalThis.localStorage = storanBaharu();
  globalThis.sessionStorage = storanBaharu();
  SUSUNAN.forEach((n) => { require(path.join(JS, n + '.js')); });
  dimuat = true;
  return globalThis;
}

const asalRandom = Math.random;
/** Math.random berbenih (mulberry32). benih(null) memulihkan Math.random asal. */
function benih(n) {
  if (n === null || n === undefined) { Math.random = asalRandom; return; }
  let a = (Number(n) * 9973) | 0;
  Math.random = function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function kosongkan() { globalThis.localStorage.clear(); globalThis.sessionStorage.clear(); }

/**
 * Daftar pemain baharu menggunakan data contoh (data.js) dan simpan sebagai pemain aktif.
 * o: { nama, jantina:'L'|'P', umur, sayap, kesukaran:'EASY'|'NORMAL'|'HARDCORE', tahunAhli, pilih:(senarai)=>item }
 */
function daftar(o) {
  o = o || {};
  const g = muat(), D = g.MyPolitikData, S = g.MyPolitikSave;
  kosongkan();
  const pilih = o.pilih || ((a) => a[0]);
  const data = D.getFallbackData();
  const negeri = pilih(data.negeri), bahagian = pilih(negeri.bahagian), dun = pilih(bahagian.dun), caw = pilih(dun.cawangan);
  const jantina = o.jantina || 'L', umur = o.umur || 30;
  const dem = D.tentukanDemografi(jantina, umur);
  const prof = S.buildPlayerProfile({
    nama: o.nama || 'Pemain Ujian', demografik: dem, cawangan: caw, avatar: dem.kod, sayap: o.sayap || 'utama',
    difficultyLevel: o.kesukaran || 'NORMAL', careerBackground: o.careerBackground, tahunAhli: o.tahunAhli === undefined ? 5 : o.tahunAhli
  });
  const r = S.savePlayer(prof);
  if (!r.ok) { throw new Error('Pendaftaran gagal: ' + r.ralat); }
  return S.loadPlayer();
}

/** Gabung medan ke dalam profil aktif (terus ke storan, tanpa kesan sampingan). */
function tetap(patch) {
  const S = muat().MyPolitikSave, p = S.loadPlayer();
  Object.keys(patch).forEach((k) => { p[k] = patch[k]; });
  const r = S.savePlayer(p);
  if (!r.ok) { throw new Error('Gagal menetapkan profil: ' + r.ralat); }
  return S.loadPlayer();
}

module.exports = { JS, SUSUNAN, muat, benih, kosongkan, daftar, tetap, storanBaharu };
