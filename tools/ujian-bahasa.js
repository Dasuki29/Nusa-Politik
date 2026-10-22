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
['translations-acara', 'translations-data', 'translations-ui', 'translations-baharu', 'translations-perlembagaan', 'translations-pindah', 'translations-parti', 'i18n']
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
ujian('Pencapaian: nama dan huraian ada EN', () => tiadaEN(kumpul(g.MyPolitikPencapaian.SENARAI, [])).map((s) => s.slice(0, 90)));

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
  ['Pencapaian Dibuka: Wira PRU (Giant Killer)!', 'Achievement Unlocked: GE Hero (Giant Killer)!'],
  ['12 / 72 bulan', '12 / 72 months'],
  ['Mengundi (sokong): usul LULUS dengan 58 sokong dan 34 bantah.', 'Voting (support): motion PASSED with 58 for and 34 against.'],
  ['Isu tempatan diselesaikan: Longkang tersumbat (Akar Umbi +3).', 'Local issue resolved: Blocked drains (Grassroots +3).'],
  ['Persidangan Tahunan Cawangan 2026 ditutup', 'Branch Annual Conference 2026 closed'],
  ['Agihan Bakul Makanan: +1 IP, -MYR 450, -3 AP, +6 Sokongan Akar Umbi, +4 Sokongan Perwakilan PAU.', 'Agihan Bakul Makanan: +1 IP, -MYR 450, -3 AP, +6 Grassroots Support, +4 PAU Delegate Support.'],
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

ujian('disiplin: semua "perkara" etika diterjemah dalam mesej hukuman, panggilan dan sejarah (v9.5)', () => {
  const fs = require('fs'), per = new Set(), r = [];
  fs.readdirSync(JS).filter((f) => f.endsWith('.js') && !/^translations/.test(f)).forEach((f) => { const tt = fs.readFileSync(path.join(JS, f), 'utf8'); for (const m of tt.matchAll(/perkara:\s*'((?:[^'\\]|\\.)*)'/g)) { if (!/ $/.test(m[1])) { per.add(m[1]); } } });
  const BM = /\b(dan|untuk|yang|dengan|kepada|atau|daripada|bagi|dalam|anda|tidak|boleh|Semua|jawatan|Lembaga|Disiplin|telah|sehingga)\b/;
  const T = [(p) => 'Jawatankuasa Disiplin memanggil anda untuk pendengaran berhubung: ' + p + '. Kemukakan pembelaan anda (Fasal 20.5).',
    (p) => 'Lembaga Disiplin MENGGANTUNG hak keahlian anda selama 12 bulan (Fasal 20.10b) atas: ' + p + '. Semua jawatan anda dilucutkan serta-merta. Anda tidak boleh mencalon, mengundi, bertanding atau berkempen, dan tidak boleh menggunakan AP untuk tugas rasmi jawatan sehingga bulan 7/2027.',
    (p) => 'Anda DILARANG BERTANDING mana-mana jawatan selama 2 tahun (Fasal 20.10c) atas: ' + p + '. Anda masih boleh berkhidmat dan menjadi perwakilan.',
    (p) => 'Lembaga Disiplin mengesyorkan PEMECATAN dan MKT telah MENGESAHKANNYA (Fasal 20.10d) atas: ' + p + '. Semua jawatan anda hilang. Rayuan boleh dibuat selepas 3 tahun (Fasal 20.12.2).',
    (p) => 'Lembaga Disiplin memberi AMARAN kepada anda (Fasal 20.10a) atas: ' + p + '. Rekod disiplin anda dicatat; kesalahan seterusnya lebih berat.',
    (p) => '7/2026: Gantung hak keahlian: ' + p, (p) => '5/2026: ' + p, (p) => '5/2026: Amaran: ' + p];
  per.forEach((p) => T.forEach((f, i) => { const s = f(p), x = I.terjemah(s); if (x === null || x === s || BM.test(x)) { r.push('T' + i + ' ' + s.slice(0, 90) + ' => ' + (x && x.slice(0, 90))); } }));
  ['⛔ Keahlian anda DIGANTUNG', 'Sehingga bulan 7/2027 (Fasal 20.10b). Semua jawatan anda telah dilucutkan. Anda tidak boleh mencalon, mengundi atau bertanding dalam pemilihan parti, dan tidak boleh menggunakan AP untuk tugas rasmi jawatan.',
    'Sehingga bulan 7/2027 (Fasal 20.10b). Semua jawatan anda telah dilucutkan (Ketua Cawangan). Anda tidak boleh mencalon, mengundi atau bertanding dalam pemilihan parti, dan tidak boleh menggunakan AP untuk tugas rasmi jawatan.'].forEach((s) => { const x = I.terjemah(s); if (x === null || BM.test(x)) { r.push(s.slice(0, 60) + ' => ' + x); } });
  return r;
});

ujian('PBB v9.6: istilah MKT -> Majlis Tertinggi (MT), PAU -> Perhimpunan Agung PBB (PA) boleh diterjemah balik ke EN', () => {
  const PT = g.MyPolitikParti, r = [], simpan = g.sessionStorage.getItem('nusa_parti_pilihan');
  g.sessionStorage.setItem('nusa_parti_pilihan', 'PBB');
  try {
    const sama2 = (a, b, n) => { if (a !== b) { r.push(n + ': ' + a + ' != ' + b); } };
    sama2(PT.kini(), 'PBB', 'parti PBB');
    sama2(PT.ke('Ahli MKT dan Perwakilan PAU'), 'Ahli MT dan Perwakilan PA', 'ke ringkas');
    sama2(PT.ke('Majlis Kerja Tertinggi (MKT) dan Perhimpunan Agung UMNO (PAU)'), 'Majlis Tertinggi (MT) dan Perhimpunan Agung PBB (PA)', 'ke penuh');
    sama2(PT.dari('Majlis Tertinggi (MT) dan Perhimpunan Agung PBB (PA)'), 'Majlis Kerja Tertinggi (MKT) dan Perhimpunan Agung UMNO (PAU)', 'dari penuh');
    sama2(PT.ke('Pemilihan Pusat (PAU)'), 'Pemilihan Pusat (PA)', 'ke pemilihan');
    sama2(PT.ke('Majlis Tertinggi memilih calon lain'), 'Majlis Tertinggi memilih calon lain', 'bare Majlis Tertinggi kekal');
    /* pariti: setiap baris kamus yang menyebut MKT / PAU / Majlis Kerja Tertinggi diterjemah sama dalam mod PBB */
    let n = 0;
    baris.forEach((b) => {
      if (!/\bMKT\b|\bPAU\b|Majlis Kerja Tertinggi/.test(b[0]) || /\{\w+\}/.test(b[0])) { return; }
      n++; const k0 = T.INDEKS[b[0]], bm = PT.ke(b[0]), jangka = PT.ke(k0 !== undefined ? T.EN[k0] : b[1]), x = I.terjemah(bm);   // BM berulang: yang pertama dipakai
      if (x !== jangka) { r.push('pariti: ' + bm + ' => ' + x + ' (jangka ' + jangka + ')'); }
    });
    if (n < 20) { r.push('terlalu sedikit baris diuji: ' + n); }
    sama2(I.terjemah('Majlis Tertinggi memilih calon lain untuk PRK Uji.'), I.terjemah('Majlis Tertinggi memilih calon lain untuk PRK Uji.'), 'stabil');
  } finally { if (simpan === null) { g.sessionStorage.removeItem('nusa_parti_pilihan'); } else { g.sessionStorage.setItem('nusa_parti_pilihan', simpan); } }
  return r;
});

/* ---- v10.0: teks mod ringan (PRS) dalam bentuk dijenamakan (PRS) mesti ada terjemahan ---- */
ujian('PRS v10.0: teks kad Pengaruh GPS, rundingan dan mesej mempunyai terjemahan EN', () => {
  const asalSS = g.sessionStorage; g.sessionStorage = { getItem: () => 'PRS', setItem() {} };
  try {
    const sampel = ['🤝 Pengaruh dalam GPS', 'Mod ringan: PRS ialah parti rakan GPS. Tiada Premier atau imbangan blok; kerusi DUN anda bergantung pada kuota kerusi GPS.', 'Pengaruh GPS', 'Kuota kerusi DUN PRS', '11 / 82 (asas 11)',
      '✅ dalam kuota (kedudukan 3)', '⛔ di luar kuota (kedudukan 30)', 'Lobi Majlis GPS (3 AP, RM 1,500)', 'Rundingan kuota dibuka. Tuntut lebih berjaya dengan peluang 45%.', 'Tuntut lebih (+3)', 'Beralah (-2)', 'Terima tawaran',
      'Kos 3 AP, sekali setiap PRN. Angka ialah andaian permainan.', 'Rundingan kuota dibuka 12 bulan sebelum PRN (5 bulan lagi).', 'Anda melobi Majlis GPS. Pengaruh GPS 48/100 (-3 AP, -RM 1,500).',
      'Tuntutan berjaya: PRS bertanding 14 kerusi dalam GPS (hubungan gabungan -5).', 'Tuntutan ditolak: PRS bertanding 10 kerusi dalam GPS (hubungan gabungan -10).', 'Anda beralah: PRS bertanding 9 kerusi dalam GPS (hubungan gabungan +10).',
      'Anda menerima tawaran: PRS bertanding 11 kerusi dalam GPS.', 'DUN anda di luar kuota PRS dalam GPS (kuota 11 kerusi)', 'Parti rakan GPS tidak menuntut jawatan Premier.', 'Hanya untuk parti rakan GPS (mod ringan).',
      'PRS tiada cawangan di luar Sarawak.', 'Sokongan Bandar', '56/100 (kesan kerusi +1)', 'Program Bandar (2 AP, RM 1,000)', 'Program Bandar dilaksanakan. Sokongan Bandar 56/100 (-2 AP, -RM 1,000).', 'Hanya untuk pemain SUPP.', 'PRS bertanding kerusi DUN dalam PRN Sarawak (bukan PRU)'];
    return sampel.filter((s) => I.terjemah(s) === null);
  } finally { g.sessionStorage = asalSS; }
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
