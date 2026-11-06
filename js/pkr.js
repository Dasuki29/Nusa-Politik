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
   v13.36 (Fasa 2, mockup "PKR Fasa 2" dipersetujui):
     - Pasukan Perwakilan (Fasal 17.2B): dalam tahun pemilihan (bulan 1-4), Ketua Cabang ke atas menyusun pasukan calon Perwakilan Biasa dan
       Tambahan Cabangnya; kuota wanita >= 30% dan kuota etnik minoriti ikut demografi kawasan (ANDAIAN); kuota tidak dipenuhi: -5% undi.
       Keputusan pada awal bulan Kongres: sokongan perwakilan Cabang sendiri = bahagian perwakilan yang menyokong pemain.
     - Semangat Reformasi (meter 0-100, ANDAIAN): ikut skor Integriti, hukuman disiplin, Forum Reformasi, tangguh pemilihan.
       Kesan: +/-5 kekuatan undi pemilihan Cabang dan Pusat, +/-10 mata peluang dicalonkan PRU.
     - Kem Dalaman (ANDAIAN): dua kem NPC dalam MPP; pilih sekali setiap penggal atau berkecuali. Kem pilihan: +8 sokongan perwakilan di
       Cabang kem itu. Kem lawan menang Kongres: peluang lantikan kerajaan -20 mata sehingga Kongres seterusnya.
     - Lembaga Disiplin (Fasal 41, 42, 43.2, 44.1, 45.2): rujukan Fasal UMNO dipetakan dalam js/parti.js; kem lawan menaikkan risiko aduan.
     - Presiden maksimum 3 penggal (Fasal 21.11); MPP boleh menangguhkan pemilihan sehingga 18 bulan (Fasal 47.3): Presiden boleh
       menangguhkan 12 bulan (ANDAIAN) dengan Semangat Reformasi -10.
   State: p.pkr = { pusat:{kod:sokongan}, jelajahBulan, pasukan:{tahun,calon,wanita,minoriti,hasil}, reformasi, forumBulan,
     kem, kemKitaran, kemMenang:{tahun,kem}, hukumKunci, penggal, penggalTahun, tangguhDari, asas }
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
    PASUKAN: { setiap: 10, ap: 2, myr: 500, kuotaWanita: 0.3, denda: -5, asasLain: 40, rng: 8 },          // v13.36: Fasal 17.2B (ANDAIAN angka)
    REFORMASI: { asas: 50, integritiTinggi: 70, integritiRendah: 40, naik: 1, turun: -2, hukum: -10, tangguh: -10, forum: 4, forumAP: 1, forumMYR: 300, undi: 5, calon: 0.1 },
    KEM: { asasA: 55, ubah: 5, bonus: 8, lantikan: -0.2, risiko: 3, NAMA: { A: 'Kem A', B: 'Kem B' } },
    PRESIDEN_PENGGAL: 3, TANGGUH_BULAN: 2,                                  // Fasal 21.11; tangguh hanya sebelum musim Ranting (bulan 3)
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
  /** v13.36: tangguh (Fasal 47.3): tahun tangguhDari bukan tahun pemilihan; kitaran baharu bermula pada asas (tangguhDari + 1). */
  function adalahTahunPemilihan(p, tahun) {
    var t = parseInt(tahun, 10), m = p && p.pkr && typeof p.pkr === 'object' ? p.pkr : {}, K = CONFIG.KITARAN_TAHUN;
    if (typeof m.asas === 'number' && t >= m.asas) { return (t - m.asas) % K === 0; }
    if (typeof m.tangguhDari === 'number' && t === m.tangguhDari) { return false; }
    return t >= CONFIG.TAHUN_MULA && (t - CONFIG.TAHUN_MULA) % K === 0;
  }
  function tahunSeterusnya(p, tahun) { var t = Math.max(parseInt(tahun, 10), CONFIG.TAHUN_MULA); for (var y = t; y < t + 8; y++) { if (adalahTahunPemilihan(p, y)) { return y; } } return t; }
  function tahunLepas(p, tahun) { for (var y = parseInt(tahun, 10); y >= CONFIG.TAHUN_MULA; y--) { if (adalahTahunPemilihan(p, y)) { return y; } } return null; }

  /* ---------- Pemilihan Pusat oleh perwakilan Cabang ke Kongres Nasional (Fasal 17.2A, 21.4) ---------- */
  function sokonganBahagian(p) {
    var d = DATA(), m = st(p), own = kodPL(p), out = {};
    Object.keys(d.parlimen).forEach(function (k) {
      var v = m.pusat[k];
      if (typeof v !== 'number') { var c = CONFIG.PUSAT.lain; v = k === own ? CONFIG.PUSAT.sendiri : c[0] + (hash(String(p.id) + '|pkr|' + k) % (c[1] - c[0] + 1)); }
      if (m.kem && k !== own && kemCabang(p, k) === m.kem) { v = Math.min(100, v + CONFIG.KEM.bonus); }      // v13.36: Kem Dalaman
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

  /* ---------- v13.36: Semangat Reformasi ---------- */
  function reformasi(p) { var m = st(p); return typeof m.reformasi === 'number' ? m.reformasi : CONFIG.REFORMASI.asas; }
  /** Kekuatan undi tambahan (pemilihan Cabang / Pusat): -5 .. +5. */
  function bonusUndi(p, peringkat) { if (!adalah(p) || peringkat === 'cawangan') { return 0; } return Math.round((reformasi(p) - 50) / 50 * CONFIG.REFORMASI.undi * 10) / 10; }
  /** Pelarasan peluang dicalonkan PRU: -0.1 .. +0.1 (js/pru.js). */
  function adjCalon(p) { return adalah(p) ? Math.round((reformasi(p) - 50) / 50 * CONFIG.REFORMASI.calon * 1000) / 1000 : 0; }
  function statusForum(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk PKR.' }; }
    var m = st(p), R = CONFIG.REFORMASI; if (m.forumBulan === idx(p.tahun, p.bulan)) { return { boleh: false, sebab: 'Forum Reformasi sudah dianjurkan bulan ini.' }; }
    if ((Number(p.ap) || 0) < R.forumAP) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < R.forumMYR) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function forum() {
    var p = S().loadPlayer(), s0 = statusForum(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), R = CONFIG.REFORMASI, a = reformasi(p); m.reformasi = clamp(a + R.forum, 0, 100); m.forumBulan = idx(p.tahun, p.bulan);
    var r = simpan(p, m, { ap: -R.forumAP, myr: -R.forumMYR, reputasi: 1 }, { kira: true, tindakan: 'pkr_forum', nama: 'Forum Reformasi (integriti dan tadbir urus)' });
    return r.ok ? { ok: true, mesej: 'Forum Reformasi: Semangat Reformasi ' + Math.round(a) + ' → ' + Math.round(m.reformasi) + '.' } : { ok: false, ralat: r.ralat };
  }

  /* ---------- v13.36: Kem Dalaman ---------- */
  function kitaran(p) { return tahunSeterusnya(p, p.tahun); }
  function kekuatanKem(p) { var K = CONFIG.KEM, a = K.asasA - K.ubah + (hash('pkr-kem|' + kitaran(p)) % (2 * K.ubah + 1)); return { A: a, B: 100 - a }; }
  function kemCabang(p, kod) { return (hash(String(kod) + '|kem|' + kitaran(p)) % 100) < kekuatanKem(p).A ? 'A' : 'B'; }
  function statusKem(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk PKR.' }; }
    var m = st(p); if (m.kemKitaran === kitaran(p)) { return { boleh: false, sebab: 'Kem sudah dipilih untuk penggal ini (pilihan sekali setiap penggal).' }; }
    return { boleh: true, sebab: '' };
  }
  function pilihKem(kem) {
    var p = S().loadPlayer(), s0 = statusKem(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    if (kem !== 'A' && kem !== 'B' && kem !== null) { return { ok: false, ralat: 'Kem tidak sah.' }; }
    var m = st(p); m.kem = kem; m.kemKitaran = kitaran(p);
    var r = simpan(p, m, {}, { kira: false, tindakan: 'pkr_kem', nama: kem ? 'Menyertai ' + CONFIG.KEM.NAMA[kem] : 'Berkecuali dalam pertandingan kem' });
    return r.ok ? { ok: true, mesej: kem ? 'Anda menyertai ' + CONFIG.KEM.NAMA[kem] + ': +' + CONFIG.KEM.bonus + ' sokongan perwakilan di Cabang kem itu.' : 'Anda berkecuali: tiada bonus, tiada risiko.' } : { ok: false, ralat: r.ralat };
  }
  /** Pelarasan peluang lantikan kerajaan (js/kabinet.js): -0.2 jika kem lawan menang Kongres terakhir. */
  function adjLantikan(p) { if (!adalah(p)) { return 0; } var m = st(p); return m.kem && m.kemMenang && m.kemMenang.kem !== m.kem ? CONFIG.KEM.lantikan : 0; }

  /* ---------- v13.36: Pasukan Perwakilan (Fasal 17.2B) ---------- */
  /** Kerusi dipilih anggota di Cabang sendiri (Perwakilan Biasa + Tambahan). */
  function kerusiPasukan(kod) { return perwakilan(kod) - CONFIG.PERWAKILAN.jk; }
  function kuotaPasukan(p, calon) { var k = kawasan(p), b = k.parlimen ? k.parlimen.m : 60, pm = Math.min(b, 100 - b); return { wanita: Math.ceil(calon * CONFIG.PASUKAN.kuotaWanita), minoriti: Math.round(calon * pm / 100), peratusMinoriti: Math.round(pm), majoritiBumi: b >= 50 }; }
  function statusPasukan(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk PKR.' }; }
    var J0 = J(); if (!J0 || J0.pangkatTertinggi(p) < 7) { return { boleh: false, sebab: 'Perlu Ketua Cabang atau lebih untuk menyusun Pasukan Perwakilan.' }; }
    if (!adalahTahunPemilihan(p, p.tahun) || (parseInt(p.bulan, 10) || 1) > 4) { return { boleh: false, sebab: 'Pasukan Perwakilan disusun pada bulan 1 hingga 4 tahun pemilihan (seterusnya ' + tahunSeterusnya(p, (parseInt(p.bulan, 10) || 1) > 4 ? p.tahun + 1 : p.tahun) + ').' }; }
    var m = st(p); if (m.pasukan && m.pasukan.tahun === p.tahun) { return { boleh: false, sebab: 'Pasukan Perwakilan tahun ini sudah didaftarkan.' }; }
    return { boleh: true, sebab: '' };
  }
  function kosPasukan(calon) { var n = Math.ceil(calon / CONFIG.PASUKAN.setiap); return { ap: n * CONFIG.PASUKAN.ap, myr: n * CONFIG.PASUKAN.myr }; }
  function susunPasukan(calon, wanita, minoriti) {
    var p = S().loadPlayer(), s0 = statusPasukan(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var own = kodPL(p), maks = kerusiPasukan(own); calon = Math.round(Number(calon) || 0); wanita = Math.round(Number(wanita) || 0); minoriti = Math.round(Number(minoriti) || 0);
    if (calon < CONFIG.PASUKAN.setiap || calon > maks || calon % CONFIG.PASUKAN.setiap) { return { ok: false, ralat: 'Bilangan calon mesti gandaan ' + CONFIG.PASUKAN.setiap + ', antara ' + CONFIG.PASUKAN.setiap + ' dan ' + maks + '.' }; }
    if (wanita < 0 || minoriti < 0 || wanita > calon || minoriti > calon) { return { ok: false, ralat: 'Bilangan calon wanita atau minoriti tidak sah.' }; }
    var c = kosPasukan(calon); if ((Number(p.ap) || 0) < c.ap) { return { ok: false, ralat: 'Mata Tindakan (AP) tidak mencukupi.' }; } if ((Number(p.myr) || 0) < c.myr) { return { ok: false, ralat: 'Dana tidak mencukupi.' }; }
    var m = st(p), q = kuotaPasukan(p, calon); m.pasukan = { tahun: p.tahun, calon: calon, wanita: wanita, minoriti: minoriti, patuh: wanita >= q.wanita && minoriti >= q.minoriti };
    var r = simpan(p, m, { ap: -c.ap, myr: -c.myr }, { kira: true, tindakan: 'pkr_pasukan', nama: 'Pasukan Perwakilan Cabang (' + calon + ' calon)' });
    return r.ok ? { ok: true, mesej: 'Pasukan Perwakilan didaftarkan: ' + calon + ' calon' + (m.pasukan.patuh ? ' (kuota dipenuhi).' : ' (kuota tidak dipenuhi: ' + CONFIG.PASUKAN.denda + '% undi).') } : { ok: false, ralat: r.ralat };
  }
  /** Anggaran peratus undi anggota bagi pasukan (0..100) sebelum unsur rawak. */
  function anggaranPasukan(p, pk) {
    var k = p.kesetiaan || {}, au = Number(k.akarUmbi) || 50;
    return clamp(45 + (au - 50) * 0.3 + ((Number(p.reputasi) || 50) - 50) * 0.2 + bonusUndi(p, 'bahagian') + (pk && !pk.patuh ? CONFIG.PASUKAN.denda : 0), 5, 95);
  }
  function selesaiPasukan(p, m, ev) {
    var pk = m.pasukan, own = kodPL(p); if (!pk || pk.tahun !== p.tahun || pk.hasil || !own) { return; }
    var r = S().rngBerbenih(hash(String(p.id) + '|pasukan|' + p.tahun)), P0 = CONFIG.PASUKAN, peratus = clamp(anggaranPasukan(p, pk) + (r() * 2 - 1) * P0.rng, 5, 95);
    var tot = perwakilan(own), menang = Math.round(pk.calon * peratus / 100), lain = Math.round((tot - menang) * P0.asasLain / 100), sok = Math.round((menang + lain) / tot * 100);
    pk.hasil = { peratus: Math.round(peratus), menang: menang, jumlah: tot, sokongan: sok }; m.pusat[own] = sok;
    ev.push({ jenis: 'pkr', mesej: 'Pemilihan Cabang: pasukan anda memperoleh ' + Math.round(peratus) + '% undi anggota; ' + menang + ' daripada ' + pk.calon + ' calon menang. Sokongan perwakilan Cabang anda di Kongres: ' + sok + '%.' });
  }

  /* ---------- v13.36: Presiden (Fasal 21.11) & tangguh pemilihan (Fasal 47.3) ---------- */
  function penggalPresiden(p) { return Number(st(p).penggal) || 0; }
  function sekatanJawatan(p, d) {
    if (!adalah(p) || !d || d.kod !== 'presiden') { return null; }
    return penggalPresiden(p) >= CONFIG.PRESIDEN_PENGGAL ? 'Presiden tidak boleh memegang jawatan melebihi ' + CONFIG.PRESIDEN_PENGGAL + ' penggal (Perlembagaan PKR, Fasal 21.11).' : null;
  }
  function pegangPresiden(p) { var J0 = J(); return !!(J0 && J0.getJawatan && J0.getJawatan(p).some(function (j) { return j.kod === 'presiden'; })); }
  function statusTangguh(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk PKR.' }; }
    if (!pegangPresiden(p)) { return { boleh: false, sebab: 'Hanya Presiden boleh mencadangkan penangguhan kepada Majlis Pimpinan Pusat.' }; }
    var m = st(p);
    if (!adalahTahunPemilihan(p, p.tahun) || (parseInt(p.bulan, 10) || 1) > CONFIG.TANGGUH_BULAN) { return { boleh: false, sebab: 'Penangguhan hanya sebelum musim pemilihan Ranting (bulan 1 hingga ' + CONFIG.TANGGUH_BULAN + ' tahun pemilihan).' }; }
    if (typeof m.asas === 'number' && m.asas === p.tahun) { return { boleh: false, sebab: 'Pemilihan ini sudah ditangguhkan sekali (had 18 bulan).' }; }
    return { boleh: true, sebab: '' };
  }
  function tangguh() {
    var p = S().loadPlayer(), s0 = statusTangguh(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), Y = parseInt(p.tahun, 10); m.tangguhDari = Y; m.asas = Y + 1; m.reformasi = clamp(reformasi(p) + CONFIG.REFORMASI.tangguh, 0, 100);
    var r = simpan(p, m, {}, { kira: true, tindakan: 'pkr_tangguh', nama: 'MPP menangguhkan pemilihan parti ' + Y + ' ke ' + (Y + 1) });
    return r.ok ? { ok: true, mesej: 'Majlis Pimpinan Pusat menangguhkan pemilihan parti ' + Y + ' ke ' + (Y + 1) + '. Semangat Reformasi ' + CONFIG.REFORMASI.tangguh + '.' } : { ok: false, ralat: r.ralat };
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
    var m = st(p), own = kodPL(p), R = CONFIG.REFORMASI, Y = parseInt(p.tahun, 10), B = parseInt(p.bulan, 10) || 1, thn = adalahTahunPemilihan(p, Y);
    Object.keys(m.pusat).forEach(function (k) { var asal = k === own ? CONFIG.PUSAT.sendiri : 40; m.pusat[k] = Math.round((m.pusat[k] + (asal - m.pusat[k]) * 0.02) * 10) / 10; });
    // v13.36: Semangat Reformasi ikut Integriti dan hukuman disiplin
    var ig = p.integriti && typeof p.integriti.skor === 'number' ? p.integriti.skor : 50, a = reformasi(p);
    a += ig >= R.integritiTinggi ? R.naik : ig < R.integritiRendah ? R.turun : (R.asas - a) * 0.03;
    var hk = p.etika && p.etika.hukuman, kunci = hk ? hk.jenis + '|' + hk.tahun + '|' + hk.bulan : null;
    if (kunci && kunci !== m.hukumKunci) { m.hukumKunci = kunci; if (hk.jenis !== 'amaran') { a += R.hukum; ev.push({ jenis: 'pkr', mesej: 'Hukuman disiplin menjejaskan Semangat Reformasi anda (' + R.hukum + ').' }); } }
    m.reformasi = Math.round(clamp(a, 0, 100) * 10) / 10;
    // v13.36: Pasukan Perwakilan diputuskan pada awal bulan Kongres; kem lawan menaikkan risiko aduan dalam tahun pemilihan
    if (thn && B === CONFIG.BULAN_PUSAT) { selesaiPasukan(p, m, ev); }
    var etk = null;
    if (thn && B <= CONFIG.BULAN_PUSAT && m.kem && p.etika && typeof p.etika.risiko === 'number') { etk = Object.assign({}, p.etika, { risiko: Math.min(100, p.etika.risiko + CONFIG.KEM.risiko) }); }
    // v13.36: keputusan kem dan penggal Presiden selepas Kongres
    if (thn && B === CONFIG.BULAN_PUSAT + 1) {
      if (!m.kemMenang || m.kemMenang.tahun !== Y) { var kk = kekuatanKem(p), rr = S().rngBerbenih(hash('pkr-kem-menang|' + Y)); m.kemMenang = { tahun: Y, kem: rr() * 100 < kk.A ? 'A' : 'B' };
        ev.push({ jenis: 'pkr', mesej: 'Kongres Nasional: ' + CONFIG.KEM.NAMA[m.kemMenang.kem] + ' menguasai Majlis Pimpinan Pusat.' + (m.kem ? (m.kem === m.kemMenang.kem ? ' Kem anda menang.' : ' Kem anda kalah: peluang lantikan berkurang.') : '') }); }
      if (pegangPresiden(p) && m.penggalTahun !== Y) { m.penggal = penggalPresiden(p) + 1; m.penggalTahun = Y; }
    }
    var pt = { pkr: m }; if (etk) { pt.etika = etk; }
    S().applyEffects({}, { kiraTindakan: false, patch: pt });
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, adalah: adalah, kawasan: kawasan, sebabKuota: sebabKuota, ofset: ofset, lawan: lawan, kerajaanNegeriAwal: kerajaanNegeriAwal,
    adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya,
    sokonganBahagian: sokonganBahagian, perwakilan: perwakilan, ringkasPusat: ringkasPusat, bonusPusat: bonusPusat, statusJelajah: statusJelajah, jelajah: jelajah,
    lantikanSemasa: function () { return null; }, kerusiParlimen: kerusiParlimen, kadarDUN: kadarDUN, prosesBulan: prosesBulan,
    reformasi: reformasi, bonusUndi: bonusUndi, adjCalon: adjCalon, statusForum: statusForum, forum: forum,
    kekuatanKem: kekuatanKem, kemCabang: kemCabang, statusKem: statusKem, pilihKem: pilihKem, adjLantikan: adjLantikan,
    kerusiPasukan: kerusiPasukan, kuotaPasukan: kuotaPasukan, kosPasukan: kosPasukan, statusPasukan: statusPasukan, susunPasukan: susunPasukan, anggaranPasukan: anggaranPasukan,
    penggalPresiden: penggalPresiden, sekatanJawatan: sekatanJawatan, statusTangguh: statusTangguh, tangguh: tangguh };
});
