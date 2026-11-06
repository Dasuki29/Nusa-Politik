/* ==========================================================================
   Nusa Politik — js/pas.js   (v13.31)
   PAS (Parti Islam Se-Malaysia), komponen Perikatan Nasional (PN), MOD PENUH menggunakan enjin UMNO (seperti MCA), Fasa 1 mockup skop PAS
   (dipersetujui). Struktur ikut Perlembagaan PAS (Pindaan 2025):
     - Cawangan (Fasal 44), Kawasan = kawasan Parlimen Semenanjung (Fasal 36, 41: Yang Dipertua), Perhubungan PAS Negeri (Fasal 53: Pesuruhjaya),
       Jawatankuasa Kerja PAS Pusat (Fasal 38: Presiden, Timbalan Presiden, 3 Naib Presiden) dan Muktamar Tahunan (Fasal 18).
       Istilah ditukar dalam js/parti.js (kunci dalaman Bahagian / PAU dikekalkan).
     - Pemilihan setiap 2 tahun (Fasal 38(2), 41(2), 44(2)); ANDAIAN: kitaran bermula 2027, Muktamar bulan 9, takwim Cawangan 3 / Kawasan 5.
     - Perwakilan Kawasan ke Muktamar (Fasal 18(5)): 4 wakil, +1 bagi setiap 1,000 ahli melebihi 2,000, maksimum 15; Jelajah Kawasan.
     - Dewan Pemuda (ahli 40 tahun ke bawah, Fasal 57) dan Dewan Muslimat (Fasal 58) guna sayap Pemuda / Wanita sedia ada.
     - Gabungan PN: rakan Bersatu, Gerakan, MIPP dan Wawasan sebagai NPC. ANDAIAN: kuota PAS 70 Parlimen dan 200 DUN dalam PN, ikut peratus Bumiputera.
     - Kerajaan: PN bermula sebagai pembangkang persekutuan; kerajaan negeri PN pada permulaan ialah Kelantan, Terengganu, Kedah dan Perlis
       (ANDAIAN: kekuatan DUN asas setiap negeri ikut PRN 2023 / PRU 2022, dipermudahkan). Anggaran kerusi dalam js/paparan.js.
   State: p.pas = { pusat:{kod:sokongan}, jelajahBulan }
   SEMUA ANGKA BERTANDA ANDAIAN IALAH ANDAIAN PERMAINAN. Permainan simulasi; bukan laman rasmi parti.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikPAS = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function J() { return modul('MyPolitikJawatan', 'jawatan.js'); }
  function DATA() { return modul('MyPolitikPASData', 'pas-data.js') || { parlimen: {}, dun: {} }; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(t, b) { return (parseInt(t, 10) || 0) * 12 + (parseInt(b, 10) || 1); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  var CONFIG = {
    KUOTA_PARLIMEN: 70, KUOTA_DUN: 200,                                   // ANDAIAN: kuota PAS dalam PN
    TAHUN_MULA: 2027, KITARAN_TAHUN: 2, BULAN_PUSAT: 9,                    // Fasal 38(2): setiap 2 tahun; ANDAIAN tahun mula dan bulan Muktamar
    PERWAKILAN: { asas: 4, ambang: 2000, setiap: 1000, maks: 15 },         // Fasal 18(5)
    WAKIL_DEWAN: 40, WAKIL_PUSAT: 40,                                      // Fasal 18(4)(b)-(h): 20 wakil Dewan Pemuda + 20 Dewan Muslimat (Fasa 1); JK Pusat, Majlis Syura dan Pesuruhjaya (anggaran)
    PUSAT: { sendiri: 60, lain: [30, 45], bonusSkala: 0.3, jelajahAP: 2, jelajahMYR: 2000, jelajahNaik: 8 },
    /* ANDAIAN: peratus kerusi DUN PN asas setiap negeri (kod negeri data peta), dipermudahkan daripada PRN 2023 / PRU 2022. */
    DUN_ASAS: { '9': 0.93, '2': 0.92, '3': 0.95, '11': 0.99, '7': 0.28, '8': 0.44, '6': 0.4, '10': 0.39, '5': 0.14, '4': 0.07, '1': 0.05 },
    KERAJAAN_NEGERI: ['Perlis', 'Kedah', 'Kelantan', 'Terengganu'],
    RAKAN: [
      { kod: 'BERSATU', nama: 'Bersatu', penuh: 'Parti Pribumi Bersatu Malaysia', logo: 'assets/images/logo-bersatu.png' },
      { kod: 'GERAKAN', nama: 'Gerakan', penuh: 'Parti Gerakan Rakyat Malaysia', logo: 'assets/images/logo-gerakan.png' },
      { kod: 'MIPP', nama: 'MIPP', penuh: 'Parti Rakyat India Malaysia', logo: 'assets/images/logo-mipp.jpg' },
      { kod: 'WAWASAN', nama: 'Wawasan', penuh: 'Parti Wawasan', logo: 'assets/images/logo-wawasan.jpg' }
    ]
  };

  function adalah(p) { return !!(p && p.parti === 'PAS'); }
  function st(p) {
    var m = p && p.pas && typeof p.pas === 'object' ? p.pas : {};
    if (!m.pusat || typeof m.pusat !== 'object') { m.pusat = {}; }
    return m;
  }
  function simpan(p, m, kesan, log) { return S().applyEffects(kesan || {}, { kiraTindakan: !!(log && log.kira), patch: { pas: m }, log: log && log.nama ? { tindakan: log.tindakan || 'pas', nama: log.nama, peringkat: log.peringkat || 'ahli' } : undefined }); }
  function kodPL(p) { var k = p && p.kod && p.kod.parlimen; return k ? 'P.' + String(parseInt(k, 10)).padStart(3, '0') : null; }

  /* ---------- Kawasan & kuota PN (antara muka sama seperti MCA untuk js/pru.js) ---------- */
  function kawasan(p) {
    var d = DATA(), kp = kodPL(p), pl = kp ? d.parlimen[kp] : null, dn = null;
    if (pl && p.kod && p.kod.dun && parseInt(p.kod.dun, 10) > 0) { var kd = pl.ng + '_N.' + String(parseInt(p.kod.dun, 10)).padStart(2, '0'); dn = d.dun[kd] ? Object.assign({ kod: kd }, d.dun[kd]) : null; }
    return { parlimen: pl ? Object.assign({ kod: kp }, pl) : null, dun: dn,
      kuotaPL: !!(pl && pl.r <= CONFIG.KUOTA_PARLIMEN), kuotaDUN: !!(dn && dn.r <= CONFIG.KUOTA_DUN), bilBahagian: Object.keys(d.parlimen).length };
  }
  function sebabKuota(p, jenis) {
    return jenis === 'PARLIMEN' ? 'Kawasan Parlimen anda di luar kuota PAS dalam PN (kuota ' + CONFIG.KUOTA_PARLIMEN + ' kerusi; kerusi ini untuk rakan PN)'
      : 'DUN anda di luar kuota PAS dalam PN (kuota ' + CONFIG.KUOTA_DUN + ' kerusi; kerusi ini untuk rakan PN)';
  }
  /** Ofset kekuatan kerusi PRU (ANDAIAN): PAS lebih kuat di kerusi majoriti Melayu. */
  function ofset(p, jenis) {
    var k = kawasan(p), m = jenis === 'DUN' ? (k.dun && k.dun.m) : (k.parlimen && k.parlimen.m);
    if (!m) { return 0; }
    return m >= 85 ? 3 : m >= 70 ? 1 : m >= 55 ? -2 : -6;
  }
  function lawan(p, jenis) { var k = kawasan(p), m = jenis === 'DUN' ? (k.dun && k.dun.m) : (k.parlimen && k.parlimen.m); return m >= 60 ? ['UMNO', 'Amanah'] : ['PKR', 'UMNO']; }
  /** Negeri yang diperintah PN pada permulaan permainan (ANDAIAN). */
  function kerajaanNegeriAwal(nama) { return CONFIG.KERAJAAN_NEGERI.some(function (n) { return n.toLowerCase() === String(nama || '').toLowerCase(); }); }

  /* ---------- Kitaran pemilihan 2 tahun (Fasal 38(2)) ---------- */
  function adalahTahunPemilihan(p, tahun) { var t = parseInt(tahun, 10); return t >= CONFIG.TAHUN_MULA && (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN === 0; }
  function tahunSeterusnya(p, tahun) { var t = parseInt(tahun, 10); if (t <= CONFIG.TAHUN_MULA) { return CONFIG.TAHUN_MULA; } var b = (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN; return b === 0 ? t : t + CONFIG.KITARAN_TAHUN - b; }
  function tahunLepas(p, tahun) { var t = parseInt(tahun, 10); return t < CONFIG.TAHUN_MULA ? null : t - ((t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN); }

  /* ---------- Pemilihan Pusat oleh perwakilan Kawasan ke Muktamar (Fasal 18) ---------- */
  function sokonganBahagian(p) {
    var d = DATA(), m = st(p), own = kodPL(p), out = {};
    Object.keys(d.parlimen).forEach(function (k) {
      var v = m.pusat[k];
      if (typeof v !== 'number') { var c = CONFIG.PUSAT.lain; v = k === own ? CONFIG.PUSAT.sendiri : c[0] + (hash(String(p.id) + '|pas|' + k) % (c[1] - c[0] + 1)); }
      out[k] = v;
    });
    return out;
  }
  /** Fasal 18(5): bilangan perwakilan Kawasan ikut ahli berdaftar. */
  function perwakilan(kod) {
    var x = DATA().parlimen[kod], W0 = CONFIG.PERWAKILAN; if (!x || !x.a) { return W0.asas; }
    return Math.min(W0.maks, W0.asas + Math.max(0, Math.floor((x.a - W0.ambang) / W0.setiap)));
  }
  function ringkasPusat(p) {
    var sb = sokonganBahagian(p), d = DATA(), ks = Object.keys(sb), jum = 0, condong = 0, pengundi = 0;
    ks.forEach(function (k) { var w = perwakilan(k); pengundi += w; jum += sb[k] * w; if (sb[k] >= 50) { condong++; } });
    var purata = pengundi ? jum / pengundi : 0;
    return { purata: Math.round(purata * 10) / 10, condong: condong, bilBahagian: ks.length, wakilKawasan: pengundi, pengundi: pengundi + CONFIG.WAKIL_DEWAN + CONFIG.WAKIL_PUSAT,
      sokongUndi: Math.round((pengundi + CONFIG.WAKIL_DEWAN + CONFIG.WAKIL_PUSAT) * purata / 100),
      senarai: ks.map(function (k) { return { kod: k, nama: d.parlimen[k].n, sokongan: Math.round(sb[k]), wakil: perwakilan(k) }; }).sort(function (a, b) { return a.sokongan - b.sokongan || a.nama.localeCompare(b.nama); }) };
  }
  function bonusPusat(p) { if (!adalah(p)) { return 0; } return Math.round((ringkasPusat(p).purata - 40) * CONFIG.PUSAT.bonusSkala * 10) / 10; }
  function statusJelajah(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk PAS.' }; }
    var J0 = J(); if (!J0 || J0.pangkatTertinggi(p) < 7) { return { boleh: false, sebab: 'Perlu Yang Dipertua Kawasan atau lebih untuk berkempen di peringkat Pusat.' }; }
    var m = st(p); if (m.jelajahBulan === idx(p.tahun, p.bulan)) { return { boleh: false, sebab: 'Jelajah Kawasan sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < CONFIG.PUSAT.jelajahAP) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < CONFIG.PUSAT.jelajahMYR) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function jelajah(kod) {
    var p = S().loadPlayer(), s0 = statusJelajah(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var d = DATA(); if (!d.parlimen[kod]) { return { ok: false, ralat: 'Kawasan tidak sah.' }; }
    var m = st(p), sb = sokonganBahagian(p), baru = clamp(sb[kod] + CONFIG.PUSAT.jelajahNaik, 0, 100);
    m.pusat[kod] = baru; m.jelajahBulan = idx(p.tahun, p.bulan);
    var r = simpan(p, m, { ap: -CONFIG.PUSAT.jelajahAP, myr: -CONFIG.PUSAT.jelajahMYR }, { kira: true, tindakan: 'pas_jelajah', nama: 'Jelajah Kawasan ' + d.parlimen[kod].n });
    return r.ok ? { ok: true, mesej: 'Jelajah Kawasan ' + d.parlimen[kod].n + ': sokongan perwakilan ' + Math.round(sb[kod]) + '% → ' + Math.round(baru) + '%.' } : { ok: false, ralat: r.ralat };
  }

  /* ---------- Anggaran kerusi PN (dipanggil oleh js/paparan.js anggarKerusi) ---------- */
  /** pop = populariti parti (30..70); pulang { parti, rakan } bagi Dewan Rakyat (222). ANDAIAN: PAS ~40-80 kerusi, rakan PN ~20-40. */
  function kerusiParlimen(pop, rng) {
    var J0 = 222, parti = clamp(Math.round(J0 * (0.14 + (pop - 30) / 40 * 0.28) + (rng() * 12 - 6)), 20, 120);
    return { parti: parti, rakan: Math.min(J0 - parti, Math.round(J0 * (0.1 + rng() * 0.08))) };
  }
  /** Bahagian kerusi DUN PN bagi negeri (kod negeri data peta atau nama). */
  function kadarDUN(kodNegeri, pop, rng) {
    var a = CONFIG.DUN_ASAS[String(kodNegeri)]; if (a == null) { a = 0.2; }
    return clamp(a + ((Number(pop) || 45) - 45) / 100 + (rng() * 0.1 - 0.05), 0.02, 0.98);
  }

  /* ---------- Bulanan ---------- */
  function prosesBulan() {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat || !adalah(p)) { return { peristiwa: ev }; }
    var m = st(p), own = kodPL(p);
    Object.keys(m.pusat).forEach(function (k) { var asal = k === own ? CONFIG.PUSAT.sendiri : 40; m.pusat[k] = Math.round((m.pusat[k] + (asal - m.pusat[k]) * 0.02) * 10) / 10; });
    simpan(p, m, {});
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, adalah: adalah, kawasan: kawasan, sebabKuota: sebabKuota, ofset: ofset, lawan: lawan, kerajaanNegeriAwal: kerajaanNegeriAwal,
    adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya,
    sokonganBahagian: sokonganBahagian, perwakilan: perwakilan, ringkasPusat: ringkasPusat, bonusPusat: bonusPusat, statusJelajah: statusJelajah, jelajah: jelajah,
    lantikanSemasa: function () { return null; }, kerusiParlimen: kerusiParlimen, kadarDUN: kadarDUN, prosesBulan: prosesBulan };
});
