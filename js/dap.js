/* ==========================================================================
   Nusa Politik — js/dap.js   (v13.37)
   DAP (Parti Tindakan Demokratik), komponen Pakatan Harapan (PH), MOD PENUH menggunakan enjin UMNO (seperti PAS / PKR), Fasa 1 mockup
   skop DAP (dipersetujui). Struktur ikut Perlembagaan DAP (seperti pada 22.10.2019):
     - Cawangan (Fasal XX-XXIV: Pengerusi, Naib Pengerusi, Setiausaha ...), Jawatankuasa Perhubungan Kawasan Parlimen (JPKP, Fasal XVII-XIX),
       Jawatankuasa Negeri (Fasal XIV: 15 dipilih di Konvensyen Biasa Negeri), Jawatankuasa Tertinggi Pusat (JTP, Fasal X: 30 ahli dipilih Kongres;
       30% dikhaskan untuk wanita, Fasal VIII.16) dan Kongres Kebangsaan setiap 3 tahun (Fasal VIII.1(b)).
       Istilah ditukar dalam js/parti.js (kunci dalaman Cawangan / Bahagian / PAU dikekalkan).
     - Pilihan (b) mockup: Penyelaras JPKP ialah Ahli Parlimen DAP kawasan itu (Fasal XIX.2). Tanpa kerusi Parlimen, jawatan tertinggi pemain
       di kawasan ialah Setiausaha JPKP; selepas menang kerusi Parlimen, jawatan itu dipaparkan sebagai Penyelaras JPKP.
     - Wakil Cawangan ke Kongres (Fasal VIII.3): 25-50 ahli berbayar = 2 wakil, 51-100 = +1, +1 bagi setiap 100 ahli seterusnya; Ahli Parlimen,
       ADUN dan ahli JTP = wakil tambahan (Fasal VIII.3(b)). Jelajah Kawasan menaikkan sokongan wakil sesuatu kawasan.
     - DAPSY (ANDAIAN had umur 35 tahun; tiada dalam Perlembagaan) dan Wanita DAP; tiada Puteri. Umur minimum ahli 17 tahun (Fasal III.2).
     - Gabungan PH: rakan PKR dan Amanah sebagai NPC. ANDAIAN: kuota DAP 55 Parlimen dan 120 DUN dalam PH, kawasan majoriti Cina dahulu.
     - Kerajaan (ANDAIAN): sama seperti PKR: PH memimpin Kerajaan Perpaduan; kekuatan DUN blok kerajaan ikut negeri.
   ANDAIAN takwim: Mesyuarat Agung Cawangan bulan 1, MB JPKP bulan 2, Kongres Kebangsaan bulan 3 (Kongres 2025: 16 Mac 2025).
   State: p.dap = { pusat:{kod:sokongan}, jelajahBulan }
   SEMUA ANGKA BERTANDA ANDAIAN IALAH ANDAIAN PERMAINAN. Permainan simulasi; bukan laman rasmi parti.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikDAP = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function J() { return modul('MyPolitikJawatan', 'jawatan.js'); }
  function DATA() { return modul('MyPolitikDAPData', 'dap-data.js') || { parlimen: {}, dun: {} }; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(t, b) { return (parseInt(t, 10) || 0) * 12 + (parseInt(b, 10) || 1); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  var CONFIG = {
    KUOTA_PARLIMEN: 55, KUOTA_DUN: 120,                                    // ANDAIAN: kuota DAP dalam PH (PRU15: bertanding 55 kerusi Parlimen)
    TAHUN_MULA: 2025, KITARAN_TAHUN: 3, BULAN_PUSAT: 3,                    // Fasal VIII.1(b): Kongres sekali setiap tiga tahun (36 bulan); ANDAIAN bulan 3
    WAKIL_PUSAT: 160,                                                       // Fasal VIII.3(b): Ahli Parlimen, ADUN dan ahli JTP (ANDAIAN anggaran)
    PUSAT: { sendiri: 60, lain: [30, 45], bonusSkala: 0.3, jelajahAP: 2, jelajahMYR: 1500, jelajahNaik: 8 },
    JTP: { kerusi: 30, wanita: 9, bonusWanita: 6, naib: 5 },              // Fasal VIII.14, VIII.16, X.1(a); bonus calon wanita (ANDAIAN)
    DAPSY_UMUR: 35, UMUR_MIN: 17,                                           // ANDAIAN; Fasal III.2
    /* ANDAIAN: peratus kerusi DUN blok kerajaan (PH + rakan Kerajaan Perpaduan) asas setiap negeri (kod negeri data peta), dipermudahkan. */
    DUN_ASAS: { '10': 0.64, '7': 0.72, '5': 0.86, '8': 0.56, '4': 0.93, '1': 0.93, '6': 0.6, '12': 0.45, '2': 0.08, '3': 0.04, '11': 0.02, '9': 0.07, '13': 0.05 },
    KERAJAAN_NEGERI: ['Selangor', 'Pulau Pinang', 'Negeri Sembilan'],
    RAKAN: [
      { kod: 'PKR', nama: 'PKR', penuh: 'Parti Keadilan Rakyat', logo: 'assets/images/logo-pkr.png' },
      { kod: 'AMANAH', nama: 'Amanah', penuh: 'Parti Amanah Negara', logo: 'assets/images/logo-amanah.png' }
    ]                                                                       // v13.35: UPKO keluar PH (10 November 2025)
  };

  function adalah(p) { return !!(p && p.parti === 'DAP'); }
  function st(p) {
    var m = p && p.dap && typeof p.dap === 'object' ? p.dap : {};
    if (!m.pusat || typeof m.pusat !== 'object') { m.pusat = {}; }
    return m;
  }
  function simpan(p, m, kesan, log) { return S().applyEffects(kesan || {}, { kiraTindakan: !!(log && log.kira), patch: { dap: m }, log: log && log.nama ? { tindakan: log.tindakan || 'dap', nama: log.nama, peringkat: log.peringkat || 'ahli' } : undefined }); }
  function kodPL(p) { var k = p && p.kod && p.kod.parlimen; return k ? 'P.' + String(parseInt(k, 10)).padStart(3, '0') : null; }

  /* ---------- Kawasan (JPKP) & kuota PH (antara muka sama seperti MCA / PAS / PKR untuk js/pru.js) ---------- */
  function kawasan(p) {
    var d = DATA(), kp = kodPL(p), pl = kp ? d.parlimen[kp] : null, dn = null;
    if (pl && p.kod && p.kod.dun && parseInt(p.kod.dun, 10) > 0) { var kd = pl.ng + '_N.' + String(parseInt(p.kod.dun, 10)).padStart(2, '0'); dn = d.dun[kd] ? Object.assign({ kod: kd }, d.dun[kd]) : null; }
    return { parlimen: pl ? Object.assign({ kod: kp }, pl) : null, dun: dn,
      kuotaPL: !!(pl && pl.r <= CONFIG.KUOTA_PARLIMEN), kuotaDUN: !!(dn && dn.r <= CONFIG.KUOTA_DUN), bilBahagian: Object.keys(d.parlimen).length };
  }
  function sebabKuota(p, jenis) {
    return jenis === 'PARLIMEN' ? 'Kawasan Parlimen anda di luar kuota DAP dalam PH (kuota ' + CONFIG.KUOTA_PARLIMEN + ' kerusi; kerusi ini untuk rakan PH)'
      : 'DUN anda di luar kuota DAP dalam PH (kuota ' + CONFIG.KUOTA_DUN + ' kerusi; kerusi ini untuk rakan PH)';
  }
  /** Ofset kekuatan kerusi PRU (ANDAIAN): DAP lebih kuat di kawasan majoriti bukan Bumiputera. */
  function ofset(p, jenis) {
    var k = kawasan(p), m = jenis === 'DUN' ? (k.dun && k.dun.m) : (k.parlimen && k.parlimen.m);
    if (!m) { return 0; }
    return m < 35 ? 5 : m < 50 ? 2 : m < 65 ? -2 : -6;
  }
  function lawan(p, jenis) { var k = kawasan(p), m = jenis === 'DUN' ? (k.dun && k.dun.m) : (k.parlimen && k.parlimen.m); return m < 50 ? ['Gerakan', 'MCA'] : ['Bersatu', 'PAS']; }
  /** Negeri yang dipimpin PH pada permulaan permainan (ANDAIAN). */
  function kerajaanNegeriAwal(nama) { return CONFIG.KERAJAAN_NEGERI.some(function (n) { return n.toLowerCase() === String(nama || '').toLowerCase(); }); }

  /* ---------- Kongres Kebangsaan setiap 3 tahun (Fasal VIII.1(b)) ---------- */
  function adalahTahunPemilihan(p, tahun) { var t = parseInt(tahun, 10); return t >= CONFIG.TAHUN_MULA && (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN === 0; }
  function tahunSeterusnya(p, tahun) { var t = parseInt(tahun, 10); if (t <= CONFIG.TAHUN_MULA) { return CONFIG.TAHUN_MULA; } var b = (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN; return b === 0 ? t : t + CONFIG.KITARAN_TAHUN - b; }
  function tahunLepas(p, tahun) { var t = parseInt(tahun, 10); return t < CONFIG.TAHUN_MULA ? null : t - ((t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN); }

  /* ---------- Pemilihan JTP oleh Wakil Cawangan di Kongres Kebangsaan (Fasal VIII.3, VIII.14) ---------- */
  function sokonganBahagian(p) {
    var d = DATA(), m = st(p), own = kodPL(p), out = {};
    Object.keys(d.parlimen).forEach(function (k) {
      var v = m.pusat[k];
      if (typeof v !== 'number') { var c = CONFIG.PUSAT.lain; v = k === own ? CONFIG.PUSAT.sendiri : c[0] + (hash(String(p.id) + '|dap|' + k) % (c[1] - c[0] + 1)); }
      out[k] = v;
    });
    return out;
  }
  /** Fasal VIII.3(a): wakil sesuatu Cawangan ikut ahli berbayar (25-50 = 2, 51-100 = 3, +1 bagi setiap 100 ahli seterusnya). */
  function wakilCawangan(ahli) { var a = Number(ahli) || 0; return a < 25 ? 0 : 2 + (a > 50 ? 1 : 0) + (a > 100 ? Math.ceil((a - 100) / 100) : 0); }
  /** Jumlah Wakil Kongres daripada Cawangan dalam sesuatu kawasan Parlimen (dijana oleh tools/build-dap.js). */
  function perwakilan(kod) { var x = DATA().parlimen[kod]; return x && x.w ? x.w : 0; }
  function ringkasPusat(p) {
    var sb = sokonganBahagian(p), d = DATA(), ks = Object.keys(sb), jum = 0, condong = 0, pengundi = 0;
    ks.forEach(function (k) { var w = perwakilan(k); if (!w) { return; } pengundi += w; jum += sb[k] * w; if (sb[k] >= 50) { condong++; } });
    var purata = pengundi ? jum / pengundi : 0;
    ks = ks.filter(function (k) { return perwakilan(k) > 0; });
    return { purata: Math.round(purata * 10) / 10, condong: condong, bilBahagian: ks.length, wakilKawasan: pengundi, pengundi: pengundi + CONFIG.WAKIL_PUSAT,
      sokongUndi: Math.round((pengundi + CONFIG.WAKIL_PUSAT) * purata / 100),
      senarai: ks.map(function (k) { return { kod: k, nama: d.parlimen[k].n, sokongan: Math.round(sb[k]), wakil: perwakilan(k) }; }).sort(function (a, b) { return a.sokongan - b.sokongan || a.nama.localeCompare(b.nama); }) };
  }
  function bonusPusat(p) { if (!adalah(p)) { return 0; } return Math.round((ringkasPusat(p).purata - 40) * CONFIG.PUSAT.bonusSkala * 10) / 10; }
  function statusJelajah(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk DAP.' }; }
    var J0 = J(); if (!J0 || J0.pangkatTertinggi(p) < 7) { return { boleh: false, sebab: 'Perlu Setiausaha JPKP atau lebih untuk berkempen di peringkat Pusat.' }; }
    var m = st(p); if (m.jelajahBulan === idx(p.tahun, p.bulan)) { return { boleh: false, sebab: 'Jelajah Kawasan sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < CONFIG.PUSAT.jelajahAP) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < CONFIG.PUSAT.jelajahMYR) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function jelajah(kod) {
    var p = S().loadPlayer(), s0 = statusJelajah(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var d = DATA(); if (!d.parlimen[kod] || !perwakilan(kod)) { return { ok: false, ralat: 'Kawasan tidak sah atau tiada Wakil Kongres.' }; }
    var m = st(p), sb = sokonganBahagian(p), baru = clamp(sb[kod] + CONFIG.PUSAT.jelajahNaik, 0, 100);
    m.pusat[kod] = baru; m.jelajahBulan = idx(p.tahun, p.bulan);
    var r = simpan(p, m, { ap: -CONFIG.PUSAT.jelajahAP, myr: -CONFIG.PUSAT.jelajahMYR }, { kira: true, tindakan: 'dap_jelajah', nama: 'Jelajah Kawasan ' + d.parlimen[kod].n });
    return r.ok ? { ok: true, mesej: 'Jelajah Kawasan ' + d.parlimen[kod].n + ': sokongan Wakil Kongres ' + Math.round(sb[kod]) + '% → ' + Math.round(baru) + '%.' } : { ok: false, ralat: r.ralat };
  }

  /* ---------- Pilihan (b): Penyelaras JPKP = Ahli Parlimen DAP kawasan itu (Fasal XIX.2) ---------- */
  function ahliParlimen(p) { var s0 = p && p.pru && p.pru.status; return !!(s0 && s0.jenis === 'MP'); }
  function pegangKetuaBahagian(p) { var J0 = J(); return !!(J0 && J0.getJawatan && J0.getJawatan(p).some(function (j) { return j.kod === 'ketua_bahagian'; })); }
  /** true jika pemain Setiausaha JPKP (ketua_bahagian) yang juga Ahli Parlimen: jawatan dipaparkan sebagai Penyelaras JPKP. */
  function penyelaras(p) { return adalah(p) && ahliParlimen(p) && pegangKetuaBahagian(p); }
  /** Bendera untuk js/parti.js (istilah dinamik); dikemas kini setiap kali kad DAP / bulan diproses. */
  function segarPenyelaras(p) { try { root.__dapPenyelaras = penyelaras(p || S().loadPlayer()); } catch (e) { root.__dapPenyelaras = false; } return root.__dapPenyelaras; }
  /** Bilangan kerusi enjin bagi jawatan pusat DAP: Ahli JTP 30 (Fasal VIII.14), Naib Pengerusi maks. 5 (Fasal X.1(a)). */
  function kerusiJawatan(p, d) { if (!adalah(p) || !d) { return null; } return d.kod === 'ahli_mkt' ? CONFIG.JTP.kerusi : d.kod === 'naib_presiden' ? CONFIG.JTP.naib : null; }
  /** Kuota wanita JTP (Fasal VIII.16): 9 kerusi dikhaskan; calon wanita bersaing untuk kerusi khas (ANDAIAN bonus kekuatan). */
  function bonusJTP(p, d) { if (!adalah(p) || !d || d.kod !== 'ahli_mkt') { return 0; } var j = p.demografik && p.demografik.jantina; return j === 'P' ? CONFIG.JTP.bonusWanita : 0; }

  /* ---------- Anggaran kerusi PH (dipanggil oleh js/paparan.js anggarKerusi dan js/pru.js janaNasional) ---------- */
  /** Sama seperti js/pkr.js: pulang { parti: kerusi PH, rakan: rakan Sabah / Sarawak (GPS, GRS) } bagi Dewan Rakyat (222). */
  function kerusiParlimen(pop, rng) {
    var J0 = 222, parti = clamp(Math.round(J0 * (0.24 + (pop - 30) / 40 * 0.3) + (rng() * 16 - 8)), 30, 150);
    return { parti: parti, rakan: Math.min(J0 - parti, Math.round(J0 * (0.12 + rng() * 0.04))) };
  }
  /** Bahagian kerusi DUN blok kerajaan bagi negeri (kod negeri data peta). */
  function kadarDUN(kodNegeri, pop, rng) {
    var a = CONFIG.DUN_ASAS[String(kodNegeri)]; if (a == null) { a = 0.3; }
    return clamp(a + ((Number(pop) || 45) - 45) / 100 + (rng() * 0.1 - 0.05), 0.02, 0.98);
  }

  /* ---------- Bulanan ---------- */
  function prosesBulan() {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat || !adalah(p)) { return { peristiwa: ev }; }
    var m = st(p), own = kodPL(p);
    Object.keys(m.pusat).forEach(function (k) { var asal = k === own ? CONFIG.PUSAT.sendiri : 40; m.pusat[k] = Math.round((m.pusat[k] + (asal - m.pusat[k]) * 0.02) * 10) / 10; });
    simpan(p, m, {}); segarPenyelaras();
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, adalah: adalah, kawasan: kawasan, sebabKuota: sebabKuota, ofset: ofset, lawan: lawan, kerajaanNegeriAwal: kerajaanNegeriAwal,
    adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya,
    sokonganBahagian: sokonganBahagian, perwakilan: perwakilan, ringkasPusat: ringkasPusat, bonusPusat: bonusPusat, statusJelajah: statusJelajah, jelajah: jelajah,
    lantikanSemasa: function () { return null; }, kerusiParlimen: kerusiParlimen, kadarDUN: kadarDUN, prosesBulan: prosesBulan,
    wakilCawangan: wakilCawangan, ahliParlimen: ahliParlimen, penyelaras: penyelaras, segarPenyelaras: segarPenyelaras, kerusiJawatan: kerusiJawatan, bonusJTP: bonusJTP };
});
