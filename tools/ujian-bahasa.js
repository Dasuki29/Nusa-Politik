#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-bahasa.js   (v8.2)
   Ujian regresi dwibahasa (BM <-> EN) tanpa pelayar. Tiada pakej perlu dipasang.
   Menyemak:
     1. Kamus: setiap baris ada EN tidak kosong; pemegang tempat {x} sama dalam BM dan EN; tiada "Wing Wing" / perkataan berganda.
     2. Teks data permainan (acara, latihan Amir, PRU, Kabinet, Perlembagaan) semuanya ada terjemahan EN.
     3. Contoh emas: ayat penting diterjemah tepat seperti dijangka.
   Guna:  node tools/ujian-bahasa.js            (kod keluar 1 jika ada kegagalan)
          node tools/ujian-bahasa.js -v         (senarai teks yang tiada terjemahan)
   Pengecualian yang disengajakan (nama misi kekal BM, tajuk sumber luar) ada dalam KECUALI di bawah.
   ========================================================================== */
'use strict';
const path = require('path');
const P = require('./persekitaran');
const g = P.muat();
const JS = P.JS;
const panjang = process.argv.indexOf('-v') > 0;

/* ---- Persekitaran pelayar minimum untuk js/i18n.js (tanpa DOM sebenar) ---- */
g.window = g;
g.CustomEvent = function () {};
g.MutationObserver = class { observe() {} disconnect() {} };
g.document = { readyState: 'complete', documentElement: { setAttribute() {} }, body: null, addEventListener() {}, querySelectorAll() { return []; }, dispatchEvent() {} };

/* Muat kamus dan rakam setiap baris yang didaftar melalui tambah(). */
require(path.join(JS, 'translations.js'));
const T = g.MyPolitikTranslations, baris = [];
const asalTambah = T.tambah;
T.tambah = function (b, i) { (b || []).forEach((r) => baris.push(r)); return asalTambah.apply(T, arguments); };
['translations-acara', 'translations-data', 'translations-ui', 'translations-baharu', 'translations-perlembagaan', 'translations-pindah', 'i18n']
  .forEach((f) => require(path.join(JS, f + '.js')));
const I = g.MyPolitikI18n;
if (!I || !I.terjemah) { console.error('MyPolitikI18n tidak dimuat'); process.exit(1); }

/* Teks yang sengaja kekal BM (nama misi atas arahan pemilik projek; tajuk sumber luar). */
const KECUALI = [/^(Wikipedia|mStar|Laman rasmi UMNO)\b/, /^(URBAN|RURAL)$/];
const dikecualikan = (s) => KECUALI.some((r) => r.test(s));

const hasil = [];
function ujian(nama, fn) {
  try { const r = fn(); hasil.push({ nama, ok: !(r && r.length), ralat: r && r.length ? r : null }); }
  catch (e) { hasil.push({ nama, ok: false, ralat: [String(e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e)] }); }
}
const ringkas = (s) => String(s).replace(/\s+/g, ' ').trim();

/* ---- 1. Kamus ---- */
ujian('kamus: setiap baris ada EN tidak kosong', () => baris.filter((r) => !r || typeof r[0] !== 'string' || typeof r[1] !== 'string' || !r[1].trim()).map((r) => JSON.stringify(r).slice(0, 100)));
ujian('kamus: pemegang tempat {x} sama dalam BM dan EN', () => baris.filter((r) => {
  const a = (r[0].match(/\{\w+\}/g) || []).sort().join(), b = (r[1].match(/\{\w+\}/g) || []).sort().join();
  return a !== b;
}).map((r) => r[0].slice(0, 80) + ' => ' + r[1].slice(0, 80)));
ujian('kamus: tiada "Wing Wing" atau perkataan EN berganda', () => baris.filter((r) => /\bWing Wing\b/.test(r[1]) || /\b(\w{3,}) \1\b/i.test(r[1].replace(/<[^>]*>/g, ' ').replace(/\{\w+\}/g, ''))).map((r) => r[1].slice(0, 100)));
const BERBEZA = [];
/* Maklumat sahaja: jika BM yang sama didaftar dua kali dengan EN berbeza, yang pertama dipakai dan yang kedua diabaikan. */
(() => {
  const peta = new Map();
  baris.forEach((b) => { const k = ringkas(b[0]); if (peta.has(k) && peta.get(k) !== b[1]) { BERBEZA.push(k.slice(0, 60) + '  [dipakai: ' + peta.get(k).slice(0, 50) + ' | diabaikan: ' + b[1].slice(0, 50) + ']'); } else { peta.set(k, b[1]); } });
})();

/* ---- 2. Teks data permainan ---- */
function kumpul(o, out, d) {
  d = d || 0;
  if (o === null || o === undefined || d > 7) { return out; }
  if (typeof o === 'string') { out.push(o); return out; }
  if (typeof o === 'function') { return out; }
  if (Array.isArray(o)) { o.forEach((x) => kumpul(x, out, d + 1)); return out; }
  if (typeof o === 'object') { Object.keys(o).forEach((k) => kumpul(o[k], out, d + 1)); }
  return out;
}
const layak = (t) => /[A-Za-z]{3}/.test(t) && t.length > 3 && !/^[a-z0-9_\-:.#\/]+$/.test(t);
function tiadaEN(teks) {
  const set = [...new Set(teks.map(ringkas))].filter((t) => layak(t) && !dikecualikan(t));
  return set.filter((t) => !I.terjemah(t));
}
function serpihan(html) { return String(html).split(/<[^>]+>/).map(ringkas).filter((t) => layak(t)); }

ujian('acara: tajuk, huraian dan pilihan semua ada EN', () => {
  const A = g.MyPolitikEventDB.buat({ etika: {}, sayapIni: () => null, ketuaSayap: () => false, bilJ: () => 0, CONFIG: {} });
  const t = [];
  A.forEach((a) => { t.push(a.tajuk, a.huraian); (a.pilihan || []).forEach((p) => t.push(p.label, p.huraian, p.mesej)); });
  const k = tiadaEN(t.filter(Boolean));
  if (panjang) { k.forEach((s) => console.log('   [acara] ' + s)); }
  return k.map((s) => s.slice(0, 90));
});
ujian('latihan Amir: setiap langkah ada EN', () => {
  const t = [];
  g.MyPolitikLatihan.LANGKAH.forEach((l) => { t.push(...serpihan(l.tajuk)); t.push(...serpihan(l.teks)); });
  return tiadaEN(t.filter((x) => x !== 'Amir')).map((s) => s.slice(0, 90));
});
ujian('PRU: kejutan, tindakan dan janji ada EN', () => {
  const PRU = g.MyPolitikPRU;
  return tiadaEN(kumpul({ k: PRU.KEJUTAN, t: PRU.TINDAKAN, j: PRU.JANJI }, [])).map((s) => s.slice(0, 90));
});
ujian('Kabinet: data portfolio ada EN', () => tiadaEN(kumpul(g.MyPolitikKabinetData, [])).map((s) => s.slice(0, 90)));
ujian('Perlembagaan: teks ada EN', () => tiadaEN(kumpul(g.MyPolitikPerlembagaan, [])).map((s) => s.slice(0, 90)));

/* ---- 3. Contoh emas ---- */
const EMAS = [
  ['Keluar latihan', 'Exit training'],
  ['Seterusnya ›', 'Next ›'],
  ['Pemuda', 'Pemuda Wing'],
  ['Misi Bulanan Sayap Pemuda', 'Pemuda Wing Monthly Mission'],
  ['Tindakan Khas Sayap Wanita', 'Wanita Wing Special Action'],
  ['Blok Undi Sayap Puteri Bahagian', 'Puteri Wing Division Vote Bloc'],
  ['2 AP · MYR 1,500 · Wang tidak mencukupi (perlu MYR 1,500).', '2 AP · MYR 1,500 · Not enough funds (need MYR 1,500).'],
  ['Lihat Bahagian di Pahang', 'View Divisions in Pahang'],
  ['6,860 cawangan', '6,860 branches'],
  ['Berdaftar', 'Registered'],
  ['Anggar Peluang', 'Estimate Chances'],
  ['Tarik Balik', 'Withdraw'],
  ['Bawa Usul (-2 AP)', 'Bring Motion (-2 AP)'],
  ['Bahas: Sokong (-1 AP)', 'Debate: Support (-1 AP)'],
  ['Ringkasan Persidangan Tahunan Pemuda Cawangan 2026', 'Summary of Pemuda Wing Branch Annual Conference 2026'],
  ['Status Usul (1 lulus, 2 ditolak, 3 anda sertai)', 'Motion Status (1 passed, 2 rejected, 3 you joined)'],
  ['Kedudukan 1 daripada 7 calon (3 kerusi, 31 undi) · +7 IP', 'Rank 1 of 7 candidates (3 seats, 31 votes) · +7 IP'],
  ['Menang: kedudukan 1 daripada 9 calon, 29 undi.', 'Won: rank 1 of 9 candidates, 29 votes.'],
  ['Ringkasan: 1 lulus, 2 ditolak, 3 anda sertai. Menang perwakilan (kedudukan 1); Kalah perwakilan (kedudukan 4).', 'Summary: 1 passed, 2 rejected, 3 you joined. Won delegate seat (rank 1); Lost delegate seat (rank 4).'],
  ['Atasi isu: Dewan serbaguna usang', 'Address the issue: Dilapidated multipurpose hall'],
  ['Lantikan Pimpinan Negeri', 'State Leadership Appointment'],
  ["Presiden Ali melantik Dato' Ahmad (Kuala Kangsar) sebagai Pengerusi Badan Perhubungan UMNO Perak. Anda tidak layak kerana bukan Ketua Bahagian.", "President Ali appoints Dato' Ahmad (Kuala Kangsar) as Chairman of the UMNO Perak Liaison Body. You are not eligible because you are not a Division Chief."],
  ['Bulan 3 (Mac) 2026: AP +5 (had 15 dicapai), elaun +MYR 150. Sokongan susut jika tidak dijaga.', 'Month 3 (Mar) 2026: AP +5 (cap 15 reached), allowance +MYR 150. Support decays if neglected.']
];
ujian('contoh emas: terjemahan tepat', () => {
  const r = [];
  EMAS.forEach((e) => { const x = I.terjemah(e[0]); if (x !== e[1]) { r.push(e[0] + ' => ' + x + ' (jangka ' + e[1] + ')'); } });
  return r;
});

let gagal = 0;
hasil.forEach((h) => {
  if (h.ok) { console.log('  ✓ ' + h.nama); return; }
  gagal++;
  console.log('  ✗ ' + h.nama + ' (' + h.ralat.length + ')');
  h.ralat.slice(0, panjang ? 200 : 6).forEach((e) => console.log('      - ' + e));
});
if (BERBEZA.length) { console.log('  i ' + BERBEZA.length + ' BM berulang dengan EN berbeza (yang pertama dipakai)' + (panjang ? ':' : ' — guna -v untuk senarai')); if (panjang) { BERBEZA.forEach((x) => console.log('      - ' + x)); } }
console.log('\n' + (hasil.length - gagal) + ' lulus, ' + gagal + ' gagal, ' + hasil.length + ' ujian.');
process.exit(gagal ? 1 : 0);
