/* ==========================================================================
   Nusa Politik — js/pkr.js   (v13.34)
   PKR (Parti Keadilan Rakyat, KEADILAN), komponen Pakatan Harapan (PH), MOD PENUH menggunakan enjin UMNO (seperti PAS), Fasa 1 mockup
   skop PH (dipersetujui). Struktur ikut Perlembagaan PKR (pindaan diluluskan Pendaftar Pertubuhan hingga 11 Mac 2025):
     - Ranting (unit operasi dalam Cabang, Fasal 23.1(e), 39.1(g)), Cabang = kawasan Parlimen (Fasal 1.6, 32.1: minimum 100 anggota),
       Majlis Pimpinan Negeri (Fasal 27: Pengerusi dilantik Presiden, Fasal 21.8), Majlis Pimpinan Pusat (Fasal 21: Presiden, Timbalan Presiden,
       4 Naib Presiden dan 20 Ahli MPP dipilih) dan Kongres Nasional (Fasal 17, 18: sebelum akhir Jun).
       Istilah ditukar dalam js/parti.js (kunci dalaman Cawangan / Bahagian / PAU dikekalkan).
     - Pemilihan parti setiap 3 tahun (Fasal 21.10, 37.8, 47.3): 2025, 2028 ... ANDAIAN takwim: Ranting bulan 3, Cabang bulan 4, Kongres bulan 5.
     - Perwakilan Cabang ke Kongres tahun pemilihan (Fasal 17.2A(c)): 46 Perwakilan Jawatankuasa Cabang + 40 Perwakilan Biasa Cabang,
       +10 Perwakilan Tambahan bagi setiap 1,000 anggota melebihi 3,000, maksimum 156; Jelajah Cabang.
     - Angkatan Muda (AMK, had umur 35 tahun, Fasal 25) dan Wanita (Fasal 26) guna sayap Pemuda / Wanita sedia ada; tiada Puteri.
     - Gabungan PH: rakan DAP dan Amanah sebagai NPC (UPKO keluar PH pada 10 November 2025). ANDAIAN: kuota PKR 70 Parlimen dan 150 DUN dalam PH, kawasan bercampur dahulu.
     - Kerajaan (ANDAIAN): PH memimpin Kerajaan Perpaduan; selepas PRU, PH perlu rakan (BN) untuk majoriti (js/rundingan.js).
       Kekuatan DUN blok kerajaan (PH + rakan Kerajaan Perpaduan) ikut negeri, dipermudahkan daripada PRN 2023 / PRU 2022.
   State: p.pkr = { pusat:{kod:sokongan}, jelajahBulan }
   SEMUA ANGKA BERTANDA ANDAIAN IALAH ANDAIAN PERMAINAN. Permainan simulasi; bukan laman rasmi parti.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikPKR = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function J() { return modul('MyPolitikJawatan', 'jawatan.js'); }
  function DATA() { return modul('MyPolitikPKRData', 'pkr-data.js') || { parlimen: {}, dun: {} }; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(t, b) { return (parseInt(t, 10) || 0) * 12 + (parseInt(b, 10) || 1); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  var CONFIG = {
    KUOTA_PARLIMEN: 70, KUOTA_DUN: 150,                                    // ANDAIAN: kuota PKR dalam PH
    TAHUN_MULA: 2025, KITARAN_TAHUN: 3, BULAN_PUSAT: 5,                    // Fasal 47.3: setiap 3 tahun; Fasal 18.1: Kongres sebelum akhir Jun (ANDAIAN bulan 5)
    PERWAKILAN: { jk: 46, biasa: 40, ambang: 3000, setiap: 1000, tambah: 10, maks: 156 },   // Fasal 17.2A(c)
    WAKIL_PUSAT: 150,                                                       // Fasal 17.2A(b), (d): Ahli MPP, Ahli Parlimen dan ADUN (ANDAIAN anggaran)
    PUSAT: { sendiri: 60, lain: [30, 45], bonusSkala: 0.3, jelajahAP: 2, jelajahMYR: 2000, jelajahNaik: 8 },
    AMK_UMUR: 35,                                                           // Fasal 25.1
    /* ANDAIAN: peratus kerusi DUN blok kerajaan (PH + rakan Kerajaan Perpaduan) asas setiap negeri (kod negeri data peta), dipermudahkan. */
    DUN_ASAS: { '10': 0.64, '7': 0.72, '5': 0.86, '8': 0.56, '4': 0.93, '1': 0.93, '6': 0.6, '12': 0.45, '2': 0.08, '3': 0.04, '11': 0.02, '9': 0.07, '13': 0.05 },
    KERAJAAN_NEGERI: ['Selangor', 'Pulau Pinang', 'Negeri Sembilan'],
    RAKAN: [
      { kod: 'DAP', nama: 'DAP', penuh: 'Parti Tindakan Demokratik', logo: 'assets/images/logo-dap.svg' },
      { kod: 'AMANAH', nama: 'Amanah', penuh: 'Parti Amanah Negara', logo: 'assets/images/logo-amanah.png' }
    ]                                                                       // v13.35: UPKO keluar PH (10 November 2025)
  };

  function adalah(p) { return !!(p && p.parti === 'PKR'); }
  function st(p) {
    var m = p && p.pkr && typeof p.pkr === 'object' ? p.pkr : {};
    if (!m.pusat || typeof m.pusat !== 'object') { m.pusat = {}; }
    return m;
  }
  function simpan(p, m, kesan, log) { return S().applyEffects(kesan || {}, { kiraTindakan: !!(log && log.kira), patch: { pkr: m }, log: log && log.nama ? { tindakan: log.tindakan || 'pkr', nama: log.nama, peringkat: log.peringkat || 'ahli' } : undefined }); }
  function kodPL(p) { var k = p && p.kod && p.kod.parlimen; return k ? 'P.' + String(parseInt(k, 10)).padStart(3, '0') : null; }

  /* ---------- Cabang & kuota PH (antara muka sama seperti MCA / PAS untuk js/pru.js) ---------- */
  function kawasan(p) {
    var d = DATA(), kp = kodPL(p), pl = kp ? d.parlimen[kp] : null, dn = null;
    if (pl && p.kod && p.kod.dun && parseInt(p.kod.dun, 10) > 0) { var kd = pl.ng + '_N.' + String(parseInt(p.kod.dun, 10)).padStart(2, '0'); dn = d.dun[kd] ? Object.assign({ kod: kd }, d.dun[kd]) : null; }
    return { parlimen: pl ? Object.assign({ kod: kp }, pl) : null, dun: dn,
      kuotaPL: !!(pl && pl.r <= CONFIG.KUOTA_PARLIMEN), kuotaDUN: !!(dn && dn.r <= CONFIG.KUOTA_DUN), bilBahagian: Object.keys(d.parlimen).length };
  }
  function sebabKuota(p, jenis) {
    return jenis === 'PARLIMEN' ? 'Kawasan Parlimen anda di luar kuota PKR dalam PH (kuota ' + CONFIG.KUOTA_PARLIMEN + ' kerusi; kerusi ini untuk rakan PH)'
      : 'DUN anda di luar kuota PKR dalam PH (kuota ' + CONFIG.KUOTA_DUN + ' kerusi; kerusi ini untuk rakan PH)';
  }
  /** Ofset kekuatan kerusi PRU (ANDAIAN): PKR lebih kuat di kawasan bercampur. */
  function ofset(p, jenis) {
    var k = kawasan(p), m = jenis === 'DUN' ? (k.dun && k.dun.m) : (k.parlimen && k.parlimen.m);
    if (!m) { return 0; }
    var j = Math.abs(m - 60); return j <= 10 ? 3 : j <= 20 ? 1 : j <= 30 ? -2 : -5;
  }
  function lawan(p, jenis) { var k = kawasan(p), m = jenis === 'DUN' ? (k.dun && k.dun.m) : (k.parlimen && k.parlimen.m); return m >= 60 ? ['PAS', 'Bersatu'] : ['Bersatu', 'Gerakan']; }
  /** Negeri yang dipimpin PH pada permulaan permainan (ANDAIAN). */
  function kerajaanNegeriAwal(nama) { return CONFIG.KERAJAAN_NEGERI.some(function (n) { return n.toLowerCase() === String(nama || '').toLowerCase(); }); }

  /* ---------- Kitaran pemilihan 3 tahun (Fasal 47.3) ---------- */
  function adalahTahunPemilihan(p, tahun) { var t = parseInt(tahun, 10); return t >= CONFIG.TAHUN_MULA && (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN === 0; }
  function tahunSeterusnya(p, tahun) { var t = parseInt(tahun, 10); if (t <= CONFIG.TAHUN_MULA) { return CONFIG.TAHUN_MULA; } var b = (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN; return b === 0 ? t : t + CONFIG.KITARAN_TAHUN - b; }
  function tahunLepas(p, tahun) { var t = parseInt(tahun, 10); return t < CONFIG.TAHUN_MULA ? null : t - ((t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN); }

  /* ---------- Pemilihan Pusat oleh perwakilan Cabang ke Kongres Nasional (Fasal 17.2A, 21.4) ---------- */
  function sokonganBahagian(p) {
    var d = DATA(), m = st(p), own = kodPL(p), out = {};
    Object.keys(d.parlimen).forEach(function (k) {
      var v = m.pusat[k];
      if (typeof v !== 'number') { var c = CONFIG.PUSAT.lain; v = k === own ? CONFIG.PUSAT.sendiri : c[0] + (hash(String(p.id) + '|pkr|' + k) % (c[1] - c[0] + 1)); }
      out[k] = v;
    });
    return out;
  }
  /** Fasal 17.2A(c): 46 + 40 perwakilan, +10 bagi setiap 1,000 anggota (atau sebahagiannya) melebihi 3,000, maksimum 156. */
  function perwakilan(kod) {
    var x = DATA().parlimen[kod], W0 = CONFIG.PERWAKILAN, asas = W0.jk + W0.biasa; if (!x || !x.a) { return asas; }
    return Math.min(W0.maks, asas + (x.a > W0.ambang ? Math.ceil((x.a - W0.ambang) / W0.setiap) * W0.tambah : 0));
  }
  function ringkasPusat(p) {
    var sb = sokonganBahagian(p), d = DATA(), ks = Object.keys(sb), jum = 0, condong = 0, pengundi = 0;
    ks.forEach(function (k) { var w = perwakilan(k); pengundi += w; jum += sb[k] * w; if (sb[k] >= 50) { condong++; } });
    var purata = pengundi ? jum / pengundi : 0;
    return { purata: Math.round(purata * 10) / 10, condong: condong, bilBahagian: ks.length, wakilKawasan: pengundi, pengundi: pengundi + CONFIG.WAKIL_PUSAT,
      sokongUndi: Math.round((pengundi + CONFIG.WAKIL_PUSAT) * purata / 100),
      senarai: ks.map(function (k) { return { kod: k, nama: d.parlimen[k].n, sokongan: Math.round(sb[k]), wakil: perwakilan(k) }; }).sort(function (a, b) { return a.sokongan - b.sokongan || a.nama.localeCompare(b.nama); }) };
  }
  function bonusPusat(p) { if (!adalah(p)) { return 0; } return Math.round((ringkasPusat(p).purata - 40) * CONFIG.PUSAT.bonusSkala * 10) / 10; }
  function statusJelajah(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk PKR.' }; }
    var J0 = J(); if (!J0 || J0.pangkatTertinggi(p) < 7) { return { boleh: false, sebab: 'Perlu Ketua Cabang atau lebih untuk berkempen di peringkat Pusat.' }; }
    var m = st(p); if (m.jelajahBulan === idx(p.tahun, p.bulan)) { return { boleh: false, sebab: 'Jelajah Cabang sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < CONFIG.PUSAT.jelajahAP) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < CONFIG.PUSAT.jelajahMYR) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function jelajah(kod) {
    var p = S().loadPlayer(), s0 = statusJelajah(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var d = DATA(); if (!d.parlimen[kod]) { return { ok: false, ralat: 'Cabang tidak sah.' }; }
    var m = st(p), sb = sokonganBahagian(p), baru = clamp(sb[kod] + CONFIG.PUSAT.jelajahNaik, 0, 100);
    m.pusat[kod] = baru; m.jelajahBulan = idx(p.tahun, p.bulan);
    var r = simpan(p, m, { ap: -CONFIG.PUSAT.jelajahAP, myr: -CONFIG.PUSAT.jelajahMYR }, { kira: true, tindakan: 'pkr_jelajah', nama: 'Jelajah Cabang ' + d.parlimen[kod].n });
    return r.ok ? { ok: true, mesej: 'Jelajah Cabang ' + d.parlimen[kod].n + ': sokongan perwakilan ' + Math.round(sb[kod]) + '% → ' + Math.round(baru) + '%.' } : { ok: false, ralat: r.ralat };
  }

  /* ---------- Anggaran kerusi PH (dipanggil oleh js/paparan.js anggarKerusi dan js/pru.js janaNasional) ---------- */
  /** pop = populariti parti (30..70); pulang { parti: kerusi PH, rakan: rakan Sabah / Sarawak (GPS, GRS) } bagi Dewan Rakyat (222).
      ANDAIAN: PH ~55-120 kerusi; rakan ~27-35. BN berada dalam slot lawan kedua dan boleh diajak melalui rundingan gabungan. */
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
    simpan(p, m, {});
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, adalah: adalah, kawasan: kawasan, sebabKuota: sebabKuota, ofset: ofset, lawan: lawan, kerajaanNegeriAwal: kerajaanNegeriAwal,
    adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya,
    sokonganBahagian: sokonganBahagian, perwakilan: perwakilan, ringkasPusat: ringkasPusat, bonusPusat: bonusPusat, statusJelajah: statusJelajah, jelajah: jelajah,
    lantikanSemasa: function () { return null; }, kerusiParlimen: kerusiParlimen, kadarDUN: kadarDUN, prosesBulan: prosesBulan };
});
