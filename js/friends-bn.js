/* ==========================================================================
   Nusa Politik — js/friends-bn.js   (v13.15)
   Friends of BN sebagai NPC (mockup "Friends of BN", dipersetujui): KIMMA, Makkal Sakti, IPF dan MIUP.
   Parti rakan BN yang belum menjadi komponen penuh (berita Jan-Apr 2026). Tidak boleh dimainkan; tiada nama pemimpin sebenar.
     - Kuota PRU: 3 kerusi Parlimen (5 jika diterima sebagai komponen). Diambil daripada kerusi tradisi BN yang kalah; tidak pernah kerusi pemain.
     - Kempen: "Jemput Friends of BN berkempen" (calon BN, kerusi dengan pengundi India >= 10%): 1 AP, sokongan +2%, sekali setiap kempen.
     - Keputusan PRU: kerusi yang dimenangi Friends of BN dikira dalam kerusi BN (paparan).
     - Majlis Tertinggi BN (bulan 1 setiap tahun): Presiden parti komponen BN mengundi Sokong / Tolak / Berkecuali.
       Peluang diterima 25% asas, +20% jika pemain menyokong, −15% jika menolak. Sokong: hubungan gabungan +3 dan sokongan pengundi India +1%
       pada PRU seterusnya; Tolak: hubungan gabungan −3. Pemain bukan Presiden: berita sahaja.
     - MIC: kuota kerusi tidak berubah; jika Friends of BN diterima, hubungan MIC dalam BN −5 sekali.
   ANDAIAN: semua angka ialah angka permainan.
   State: p.fbn = { komponen, tahunMT, menunggu, bonusIndia, sejarah:[] }.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikFBN = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function MICD() { return modul('MyPolitikMICData', 'mic-data.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function hash(t) { var h = 7; t = String(t || ''); for (var i = 0; i < t.length; i++) { h = (h * 31 + t.charCodeAt(i)) >>> 0; } return h; }
  var rngLalai = Math.random;
  function rng(o) { return (o && o.rng) || rngLalai; }

  var PARTI = [
    { kod: 'KIMMA', nama: 'KIMMA', penuh: 'Kongres India Muslim Malaysia' },
    { kod: 'MS', nama: 'Makkal Sakti', penuh: 'Parti Makkal Sakti Malaysia' },
    { kod: 'IPF', nama: 'IPF', penuh: 'Barisan Kemajuan India SeMalaysia' },
    { kod: 'MIUP', nama: 'MIUP', penuh: 'Parti Bersatu India Malaysia' }
  ];
  var CONFIG = {
    BN: ['UMNO', 'MCA', 'MIC', 'PPP', 'PBRS'], KUOTA: 3, KUOTA_KOMPONEN: 5,
    JEMPUT: { ap: 1, sokongan: 2, india: 10 },
    MT: { bulan: 1, asas: 0.25, sokong: 0.2, tolak: -0.15, hubungan: 3, bonusIndia: 1, micHubungan: -5 }
  };

  function dasar() { return { komponen: false, tahunMT: 0, menunggu: 0, bonusIndia: 0, sejarah: [] }; }
  function getFBN(p) {
    var b = dasar(), x = p && p.fbn && typeof p.fbn === 'object' ? p.fbn : {};
    for (var k in b) { if (x[k] === undefined) { x[k] = b[k]; } }
    if (!Array.isArray(x.sejarah)) { x.sejarah = []; }
    return x;
  }
  function rekod(f, p, teks) { f.sejarah = f.sejarah.concat([{ tahun: p.tahun, bulan: p.bulan, teks: teks }]).slice(-10); }
  /** Pemain parti komponen BN (bukan GPS). */
  function adalahBN(p) { return !!p && CONFIG.BN.indexOf(p.parti || 'UMNO') >= 0; }
  function kuota(p) { return getFBN(p).komponen ? CONFIG.KUOTA_KOMPONEN : CONFIG.KUOTA; }
  /** Parti yang diberi kerusi (urutan tetap). */
  function penerima(p) { var n = kuota(p), urut = ['KIMMA', 'Makkal Sakti', 'IPF', 'MIUP', 'KIMMA']; return urut.slice(0, n); }
  function ringkasKuota(p) {
    var s = penerima(p), u = s.filter(function (x, i) { return s.indexOf(x) === i; });
    return { kuota: s.length, parti: u, komponen: getFBN(p).komponen };
  }
  /** Peratus pengundi India kerusi Parlimen pemain (data MIC; Semenanjung sahaja). null = tiada data. */
  function peratusIndia(p) {
    var D = MICD(), k = p && p.kod && p.kod.parlimen, kp = k ? 'P.' + String(parseInt(k, 10)).padStart(3, '0') : null, pl = D && kp ? D.parlimen[kp] : null;
    return pl && typeof pl.i === 'number' ? pl.i : null;
  }
  /** Kerusi dimenangi Friends of BN dalam PRU terakhir (paparan; benih tetap). Dikira dalam kerusi BN. */
  function kerusiMenang(p) {
    var k = p && p.kerusiNasional; if (!adalahBN(p) || !k || typeof k.parti !== 'number') { return 0; }
    var bn = (Number(k.parti) || 0) + (Number(k.rakan) || 0), peluang = clamp(bn / 222 * 0.9, 0.05, 0.8), h = hash(String(p.id || p.nama) + '|fbn|' + k.tahun), n = 0;
    for (var i = 0; i < kuota(p); i++) { if (((h >>> (i * 5)) % 100) / 100 < peluang) { n += 1; } }
    return Math.min(n, Number(k.rakan) || 0);
  }

  /* ---------- Kempen ---------- */
  function statusJemput(p) {
    var R = PRU(), a = R && R.getPRU ? R.getPRU(p).aktif : null, ind = peratusIndia(p);
    if (!adalahBN(p)) { return { tunjuk: false }; }
    if (!a || a.fasa !== 'kempen') { return { tunjuk: false }; }
    if (ind == null || ind < CONFIG.JEMPUT.india) { return { tunjuk: false }; }
    if (a.fbnJemput) { return { tunjuk: true, boleh: false, sebab: 'Sudah dijemput dalam kempen ini.', india: ind }; }
    if ((Number(p.ap) || 0) < CONFIG.JEMPUT.ap) { return { tunjuk: true, boleh: false, sebab: 'AP tidak mencukupi.', india: ind }; }
    return { tunjuk: true, boleh: true, sebab: '', india: ind };
  }
  function jemput() {
    var p = S().loadPlayer(), st = statusJemput(p);
    if (!st.tunjuk || !st.boleh) { return { ok: false, ralat: st.sebab || 'Tidak tersedia.' }; }
    var pru = PRU().getPRU(p), a = pru.aktif, J = CONFIG.JEMPUT;
    a.voterSupport = clamp(Math.round((Number(a.voterSupport) + J.sokongan) * 10) / 10, 0, 100); a.fbnJemput = true;
    a.log = [{ hari: a.hari, teks: 'Friends of BN berkempen bersama anda: sokongan +' + J.sokongan + '%.' }].concat(a.log || []).slice(0, 20);
    var r = S().applyEffects({ ap: -J.ap }, { kiraTindakan: false, patch: { pru: pru }, log: { tindakan: 'fbn_jemput', nama: 'Jemput Friends of BN berkempen', peringkat: 'ahli' } });
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    return { ok: true, mesej: 'Friends of BN turun berkempen di kawasan anda. Sokongan +' + J.sokongan + '%.' };
  }

  /* ---------- Majlis Tertinggi BN ---------- */
  function presiden(p) { var R = PRU(); return !!(R && R.adalahPresiden && R.adalahPresiden(p)); }
  function selesai(p, f, pilihan, o) {
    var M = CONFIG.MT, peluang = clamp(M.asas + (pilihan === 'sokong' ? M.sokong : pilihan === 'tolak' ? M.tolak : 0), 0, 1), terima = rng(o)() < peluang, ev = [], R = PRU(), pru = R && R.getPRU ? R.getPRU(p) : null, ubahPRU = false;
    f.tahunMT = parseInt(p.tahun, 10); f.menunggu = 0;
    if (pru && pilihan === 'sokong') { pru.hubunganGabungan = clamp((Number(pru.hubunganGabungan) || 50) + M.hubungan, 0, 100); f.bonusIndia = M.bonusIndia; ubahPRU = true; }
    if (pru && pilihan === 'tolak') { pru.hubunganGabungan = clamp((Number(pru.hubunganGabungan) || 50) - M.hubungan, 0, 100); ubahPRU = true; }
    if (terima) {
      f.komponen = true; rekod(f, p, 'Diterima sebagai komponen BN');
      ev.push({ jenis: 'fbn_terima', mesej: 'Majlis Tertinggi BN menerima KIMMA, Makkal Sakti, IPF dan MIUP sebagai parti komponen penuh. Kuota mereka naik kepada ' + CONFIG.KUOTA_KOMPONEN + ' kerusi Parlimen.' });
      if (pru && p.parti === 'MIC') { pru.hubunganGabungan = clamp((Number(pru.hubunganGabungan) || 50) + M.micHubungan, 0, 100); ubahPRU = true; ev.push({ jenis: 'fbn_mic', mesej: 'MIC kini bersaing dengan komponen baharu dalam Majlis Tertinggi BN. Hubungan gabungan ' + M.micHubungan + '.' }); }
    } else {
      rekod(f, p, 'Permohonan ditangguh');
      ev.push({ jenis: 'fbn_tolak', mesej: 'Majlis Tertinggi BN menangguhkan permohonan Friends of BN menjadi komponen penuh. Mereka kekal sebagai rakan BN.' });
    }
    var patch = { fbn: f }; if (ubahPRU) { patch.pru = pru; }
    S().applyEffects({}, { kiraTindakan: false, patch: patch, log: { tindakan: 'fbn_mt', nama: ev[0].mesej, peringkat: 'ahli' } });
    return { terima: terima, peristiwa: ev };
  }
  /** Undi pemain (Presiden). pilihan: 'sokong' | 'tolak' | 'berkecuali'. */
  function undi(pilihan, o) {
    var p = S().loadPlayer(), f = getFBN(p);
    if (!f.menunggu) { return { ok: false, ralat: 'Tiada usul Friends of BN.' }; }
    if (['sokong', 'tolak', 'berkecuali'].indexOf(pilihan) < 0) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    var r = selesai(p, f, pilihan, o);
    return { ok: true, terima: r.terima, mesej: r.peristiwa.map(function (e) { return e.mesej; }).join(' ') };
  }
  function prosesBulan(o) {
    var p = S() && S().loadPlayer(), ev = [];
    if (!p || p.tamat || !adalahBN(p)) { return { peristiwa: ev }; }
    var f = getFBN(p), t = parseInt(p.tahun, 10), b = parseInt(p.bulan, 10), simpan = false;
    // usul tidak dijawab sebelum bulan berikut: dikira berkecuali
    if (f.menunggu && (f.menunggu !== t || b !== CONFIG.MT.bulan)) { ev = ev.concat(selesai(p, f, 'berkecuali', o).peristiwa); p = S().loadPlayer(); f = getFBN(p); }
    if (!f.komponen && b === CONFIG.MT.bulan && f.tahunMT !== t && !f.menunggu) {
      if (presiden(p)) {
        f.menunggu = t; simpan = true;
        ev.push({ jenis: 'fbn_usul', mesej: 'Majlis Tertinggi BN: Friends of BN memohon menjadi komponen penuh. Tentukan pendirian parti anda di tab Tindakan bulan ini.' });
      } else { ev = ev.concat(selesai(p, f, 'berkecuali', o).peristiwa); p = S().loadPlayer(); f = getFBN(p); }
    }
    if (simpan) { S().applyEffects({}, { kiraTindakan: false, patch: { fbn: f } }); }
    return { peristiwa: ev };
  }
  /** Dipanggil oleh pru.js semasa kempen bermula: bonus sokongan India sekali selepas pemain menyokong usul (a diubah terus; pru.js menyimpan). */
  function bonusKempen(p, a) {
    var f = getFBN(p), ind = peratusIndia(p);
    if (!f.bonusIndia || !a) { return 0; }
    var n = ind != null && ind >= CONFIG.JEMPUT.india ? f.bonusIndia : 0;
    if (n) { a.voterSupport = clamp(Number(a.voterSupport) + n, 0, 100); }
    f.bonusIndia = 0; p.fbn = f;
    return n;
  }
  return { CONFIG: CONFIG, bonusKempen: bonusKempen, PARTI: PARTI, setRng: function (f) { rngLalai = f || Math.random; }, getFBN: getFBN, adalahBN: adalahBN, kuota: kuota, ringkasKuota: ringkasKuota,
    peratusIndia: peratusIndia, kerusiMenang: kerusiMenang, statusJemput: statusJemput, jemput: jemput, undi: undi, prosesBulan: prosesBulan };
});
