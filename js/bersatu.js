/* ==========================================================================
   Nusa Politik — js/bersatu.js   (v13.89)
   Parti Pribumi Bersatu Malaysia (BERSATU), komponen Perikatan Nasional (PN), MOD PENUH menggunakan enjin UMNO (seperti PAS / Amanah),
   mockup BERSATU (dipersetujui: tanpa Pengerusi, Srikandi Muda dimasukkan). Struktur ikut Perlembagaan BERSATU (fail pengguna):
     - Fasal 7: Ahli Biasa (Pribumi) dan Ahli Bersekutu (bukan Pribumi); Fasal 7.5: hanya Ahli Biasa boleh mengundi dan bertanding.
     - Fasal 10.2: keahlian terhenti serta-merta jika menyertai parti lain atau bertanding sebagai calon Bebas (js/lompat.js, js/pru.js).
     - Fasal 11: Pusat (Perhimpunan Agung / MPT) -> Badan Pimpinan Negeri -> Bahagian (kawasan Parlimen) -> Cawangan (daerah mengundi).
     - Fasal 13.2-13.3: MPT: Presiden, Timbalan Presiden, 5 Naib Presiden (3 dipilih + Ketua Srikandi + Ketua Armada), 20 Ahli MPT dipilih,
       6 wakil sayap, <= 7 dilantik Presiden. Dipilih di Persidangan Bahagian setiap 3 tahun (Fasal 18.5.1). Fasal 13.8: Presiden maksimum 3 penggal.
     - Fasal 13.6: calon Presiden / Timbalan Presiden: ahli >= 3 tahun dan pernah Ahli MPT atau Ketua Bahagian.
     - Fasal 17.4: Ketua dan Timbalan Ketua Badan Pimpinan Negeri dilantik Presiden (enjin: lantikan Pengerusi Badan Perhubungan).
     - Fasal 19.2, 20.5.2: Ketua, Timbalan, Naib Ketua dan 10 AJK Bahagian dipilih oleh ahli di Persidangan Cawangan (js/struktur.js: pemilih 'ahli').
     - Fasal 22: Armada (lelaki 35 tahun ke bawah), Srikandi (semua ahli wanita); Srikandi Muda (pindaan 2021; ANDAIAN wanita 35 tahun ke bawah).
     - Fasal 23: Lembaga Disiplin dan Lembaga Rayuan (rujukan disiplin dipetakan dalam js/parti.js).
   ANDAIAN: takwim Cawangan 6, Bahagian 8, Perhimpunan Agung 11; kitaran 3 tahun bermula 2027 (pemilihan terakhir 2024); Jawatankuasa
   Cawangan (2 tahun, Fasal 21.2) dipermudahkan kepada kitaran yang sama. Kuota BERSATU dalam PN 60 Parlimen dan 150 DUN; meter Kesepaduan PN.
   State: p.bersatu = { pusat:{kod:sokongan}, jelajahBulan, kesepaduan, rundingBulan, penggalPresiden, presidenTahun }
   SEMUA ANGKA BERTANDA ANDAIAN IALAH ANDAIAN PERMAINAN. Permainan simulasi; bukan laman rasmi parti.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikBersatu = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function J() { return modul('MyPolitikJawatan', 'jawatan.js'); }
  function DATA() { return modul('MyPolitikBersatuData', 'bersatu-data.js') || { parlimen: {}, dun: {} }; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(t, b) { return (parseInt(t, 10) || 0) * 12 + (parseInt(b, 10) || 1); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  var CONFIG = {
    KUOTA_PARLIMEN: 60, KUOTA_DUN: 150,                                     // ANDAIAN: kuota BERSATU dalam PN
    TAHUN_MULA: 2027, KITARAN_TAHUN: 3, BULAN_PUSAT: 11,                   // Fasal 13.3, 19.2; ANDAIAN tahun mula dan bulan
    WAKIL_PUSAT: 80,                                                        // ANDAIAN: MPT, Pengerusi Tetap dan 20 wakil sayap (Fasal 12.4.1, 12.4.2, 12.4.5)
    PUSAT: { sendiri: 60, lain: [30, 45], bonusSkala: 0.3, jelajahAP: 2, jelajahMYR: 1500, jelajahNaik: 8 },
    MPT: { kerusi: 20, naib: 3 },                                           // Fasal 13.3
    PRESIDEN_PENGGAL: 3,                                                    // Fasal 13.8
    SYARAT_PRESIDEN: { tahun: 3, jawatan: ['ahli_mkt', 'naib_presiden', 'timbalan_presiden', 'presiden', 'ketua_bahagian'] },   // Fasal 13.6
    PN: { awal: 55, susut: 1, ap: 2, myr: 1000, naik: 6, ofset: 3, rendah: 30, tigaPenjuru: -4, calon: 0.1 },   // ANDAIAN: Kesepaduan PN
    /* ANDAIAN: peratus kerusi DUN PN asas setiap negeri (sama seperti js/pas.js). */
    DUN_ASAS: { '9': 0.93, '2': 0.92, '3': 0.95, '11': 0.99, '7': 0.28, '8': 0.44, '6': 0.4, '10': 0.39, '5': 0.14, '4': 0.07, '1': 0.05, '12': 0.05 },
    KERAJAAN_NEGERI: ['Perlis', 'Kedah', 'Kelantan', 'Terengganu'],
    RAKAN: [
      { kod: 'PAS', nama: 'PAS', penuh: 'Parti Islam Se-Malaysia', logo: 'assets/images/logo-pas.svg' },
      { kod: 'GERAKAN', nama: 'Gerakan', penuh: 'Parti Gerakan Rakyat Malaysia', logo: 'assets/images/logo-gerakan.png' },
      { kod: 'MIPP', nama: 'MIPP', penuh: 'Parti Rakyat India Malaysia', logo: 'assets/images/logo-mipp.jpg' },
      { kod: 'WAWASAN', nama: 'Wawasan', penuh: 'Parti Wawasan', logo: 'assets/images/logo-wawasan.jpg' }
    ]
  };

  function adalah(p) { return !!(p && p.parti === 'BERSATU'); }
  function bersekutu(p) { return adalah(p) && p.keahlianJenis === 'bersekutu'; }
  function st(p) {
    var m = p && p.bersatu && typeof p.bersatu === 'object' ? p.bersatu : {};
    if (!m.pusat || typeof m.pusat !== 'object') { m.pusat = {}; }
    if (typeof m.kesepaduan !== 'number') { m.kesepaduan = CONFIG.PN.awal; }
    return m;
  }
  function simpan(p, m, kesan, log) { return S().applyEffects(kesan || {}, { kiraTindakan: !!(log && log.kira), patch: { bersatu: m }, log: log && log.nama ? { tindakan: log.tindakan || 'bersatu', nama: log.nama, peringkat: log.peringkat || 'ahli' } : undefined }); }
  function kodPL(p) { var k = p && p.kod && p.kod.parlimen; return k ? 'P.' + String(parseInt(k, 10)).padStart(3, '0') : null; }
  function idxP(p) { return idx(p.tahun, p.bulan); }

  /* ---------- Bahagian & kuota PN (antara muka sama seperti PAS / Amanah untuk js/pru.js) ---------- */
  function kawasan(p) {
    var d = DATA(), kp = kodPL(p), pl = kp ? d.parlimen[kp] : null, dn = null;
    if (pl && p.kod && p.kod.dun && parseInt(p.kod.dun, 10) > 0) { var kd = pl.ng + '_N.' + String(parseInt(p.kod.dun, 10)).padStart(2, '0'); dn = d.dun[kd] ? Object.assign({ kod: kd }, d.dun[kd]) : null; }
    return { parlimen: pl ? Object.assign({ kod: kp }, pl) : null, dun: dn,
      kuotaPL: !!(pl && pl.r <= CONFIG.KUOTA_PARLIMEN), kuotaDUN: !!(dn && dn.r <= CONFIG.KUOTA_DUN), bilBahagian: Object.keys(d.parlimen).length };
  }
  function sebabKuota(p, jenis) {
    return jenis === 'PARLIMEN' ? 'Kerusi Parlimen anda di luar kuota BERSATU dalam PN (kuota ' + CONFIG.KUOTA_PARLIMEN + ' kerusi; kerusi ini untuk rakan PN)'
      : 'Kerusi DUN anda di luar kuota BERSATU dalam PN (kuota ' + CONFIG.KUOTA_DUN + ' kerusi; kerusi ini untuk rakan PN)';
  }
  function kesepaduan(p) { return st(p).kesepaduan; }
  /** Ofset kekuatan kerusi PRU (ANDAIAN): BERSATU kuat di kawasan Melayu bercampur; Kesepaduan PN menentukan sokongan pengundi PAS; bawah 30 = pertembungan 3 penjuru dengan PAS. */
  function ofset(p, jenis) {
    var k = kawasan(p), m = jenis === 'DUN' ? (k.dun && k.dun.m) : (k.parlimen && k.parlimen.m); if (!m) { return 0; }
    var asas = m < 45 ? -3 : m < 80 ? 1 : -2, n = kesepaduan(p), C = CONFIG.PN;
    return Math.round((asas + (n - 50) / 50 * C.ofset + (n < C.rendah ? C.tigaPenjuru : 0)) * 10) / 10;
  }
  function lawan(p, jenis) { var k = kawasan(p), m = jenis === 'DUN' ? (k.dun && k.dun.m) : (k.parlimen && k.parlimen.m); return kesepaduan(p) < CONFIG.PN.rendah ? ['UMNO', 'PAS'] : m >= 60 ? ['UMNO', 'Amanah'] : ['PKR', 'UMNO']; }
  function kerajaanNegeriAwal(nama) { return CONFIG.KERAJAAN_NEGERI.some(function (n) { return n.toLowerCase() === String(nama || '').toLowerCase(); }); }

  /* ---------- Kitaran 3 tahun (Fasal 13.3, 19.2) ---------- */
  function adalahTahunPemilihan(p, tahun) { var t = parseInt(tahun, 10); return t >= CONFIG.TAHUN_MULA && (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN === 0; }
  function tahunSeterusnya(p, tahun) { var t = parseInt(tahun, 10); if (t <= CONFIG.TAHUN_MULA) { return CONFIG.TAHUN_MULA; } var b = (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN; return b === 0 ? t : t + CONFIG.KITARAN_TAHUN - b; }
  function tahunLepas(p, tahun) { var t = parseInt(tahun, 10); return t < CONFIG.TAHUN_MULA ? null : t - ((t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN); }

  /* ---------- Persidangan Bahagian memilih MPT (Fasal 18.5.1); wakil Perhimpunan Agung (Fasal 12.4.3) ---------- */
  function sokonganBahagian(p) {
    var d = DATA(), m = st(p), own = kodPL(p), out = {};
    Object.keys(d.parlimen).forEach(function (k) {
      var v = m.pusat[k];
      if (typeof v !== 'number') { var c = CONFIG.PUSAT.lain; v = k === own ? CONFIG.PUSAT.sendiri : c[0] + (hash(String(p.id) + '|bersatu|' + k) % (c[1] - c[0] + 1)); }
      out[k] = v;
    });
    return out;
  }
  function perwakilan(kod) { var x = DATA().parlimen[kod]; return x && x.w ? x.w : 0; }
  function ringkasPusat(p) {
    var sb = sokonganBahagian(p), d = DATA(), ks = Object.keys(sb), jum = 0, condong = 0, pengundi = 0;
    ks.forEach(function (k) { var w = perwakilan(k); pengundi += w; jum += sb[k] * w; if (sb[k] >= 50) { condong++; } });
    var purata = pengundi ? jum / pengundi : 0;
    return { purata: Math.round(purata * 10) / 10, condong: condong, bilBahagian: ks.length, wakilBahagian: pengundi, pengundi: pengundi + CONFIG.WAKIL_PUSAT,
      sokongUndi: Math.round((pengundi + CONFIG.WAKIL_PUSAT) * purata / 100),
      senarai: ks.map(function (k) { return { kod: k, nama: d.parlimen[k].n, neg: d.parlimen[k].neg, sokongan: Math.round(sb[k]), wakil: perwakilan(k) }; }).sort(function (a, b) { return a.sokongan - b.sokongan || a.nama.localeCompare(b.nama); }) };
  }
  function bonusPusat(p) { if (!adalah(p)) { return 0; } return Math.round((ringkasPusat(p).purata - 40) * CONFIG.PUSAT.bonusSkala * 10) / 10; }
  function statusJelajah(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk BERSATU.' }; }
    if (bersekutu(p)) { return { boleh: false, sebab: 'Ahli Bersekutu tidak boleh bertanding jawatan parti (Perlembagaan BERSATU, Fasal 7.5).' }; }
    var J0 = J(); if (!J0 || J0.pangkatTertinggi(p) < 6) { return { boleh: false, sebab: 'Perlu Naib Ketua Bahagian atau lebih untuk berkempen di peringkat Pusat.' }; }
    var m = st(p); if (m.jelajahBulan === idxP(p)) { return { boleh: false, sebab: 'Jelajah Bahagian sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < CONFIG.PUSAT.jelajahAP) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < CONFIG.PUSAT.jelajahMYR) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function jelajah(kod) {
    var p = S().loadPlayer(), s0 = statusJelajah(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var d = DATA(); if (!d.parlimen[kod]) { return { ok: false, ralat: 'Bahagian tidak sah.' }; }
    var m = st(p), sb = sokonganBahagian(p), baru = clamp(sb[kod] + CONFIG.PUSAT.jelajahNaik, 0, 100);
    m.pusat[kod] = baru; m.jelajahBulan = idxP(p);
    var r = simpan(p, m, { ap: -CONFIG.PUSAT.jelajahAP, myr: -CONFIG.PUSAT.jelajahMYR }, { kira: true, tindakan: 'bersatu_jelajah', nama: 'Jelajah Bahagian ' + d.parlimen[kod].n });
    return r.ok ? { ok: true, mesej: 'Jelajah Bahagian ' + d.parlimen[kod].n + ': sokongan Persidangan Bahagian ' + Math.round(sb[kod]) + '% → ' + Math.round(baru) + '%.' } : { ok: false, ralat: r.ralat };
  }
  /** Bilangan kerusi enjin bagi jawatan pusat BERSATU: Ahli MPT 20, Naib Presiden 3 (Fasal 13.3). */
  function kerusiJawatan(p, d) { if (!adalah(p) || !d) { return null; } return d.kod === 'ahli_mkt' ? CONFIG.MPT.kerusi : d.kod === 'naib_presiden' ? CONFIG.MPT.naib : null; }

  /* ---------- Syarat calon (Fasal 7.5, 13.6, 13.8) ---------- */
  function tahunKeahlian(p) { var k = p && p.keahlian; if (!k) { return 99; } return ((parseInt(p.tahun, 10) * 12 + (parseInt(p.bulan, 10) || 1)) - ((parseInt(k.sejakTahun, 10) || p.tahun) * 12 + (parseInt(k.sejakBulan, 10) || 1))) / 12; }
  function pegangKod(p, kod) { var J0 = J(); return !!(J0 && J0.getJawatan && J0.getJawatan(p).some(function (j) { return j.kod === kod; })); }
  function pernahLayakPresiden(p) { var m = st(p); return !!m.pernahMPT || CONFIG.SYARAT_PRESIDEN.jawatan.some(function (k) { return pegangKod(p, k); }); }
  function penggalPresiden(p) { return Number(st(p).penggalPresiden) || 0; }
  function sekatanJawatan(p, d) {
    if (!adalah(p) || !d) { return null; }
    if (bersekutu(p)) { return 'Ahli Bersekutu tidak boleh bertanding jawatan parti; hanya Ahli Biasa (Pribumi) berhak mengundi dan bertanding (Perlembagaan BERSATU, Fasal 7.5).'; }
    if (d.kod === 'presiden' || d.kod === 'timbalan_presiden') {
      if (tahunKeahlian(p) < CONFIG.SYARAT_PRESIDEN.tahun) { return 'Calon Presiden / Timbalan Presiden mesti menjadi ahli sekurang-kurangnya ' + CONFIG.SYARAT_PRESIDEN.tahun + ' tahun.'; }   // Fasal 13.6
      if (!pernahLayakPresiden(p)) { return 'Calon Presiden / Timbalan Presiden mesti pernah memegang jawatan Ahli MPT atau Ketua Bahagian selama satu penggal.'; }
      if (d.kod === 'presiden' && penggalPresiden(p) >= CONFIG.PRESIDEN_PENGGAL) { return 'Presiden tidak boleh memegang jawatan melebihi 3 penggal.'; }
    }
    return null;
  }
  /** Pelarasan peluang dicalonkan PRU (js/pru.js): Kesepaduan PN. */
  function adjCalon(p) { return adalah(p) ? Math.round((kesepaduan(p) - 50) / 50 * CONFIG.PN.calon * 1000) / 1000 : 0; }

  /* ---------- Kesepaduan PN (ANDAIAN) ---------- */
  function statusRunding(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk BERSATU.' }; }
    var m = st(p); if (m.rundingBulan === idxP(p)) { return { boleh: false, sebab: 'Sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < CONFIG.PN.ap) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < CONFIG.PN.myr) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function runding() {
    var p = S().loadPlayer(), s0 = statusRunding(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), a = m.kesepaduan, C = CONFIG.PN; m.kesepaduan = clamp(a + C.naik, 0, 100); m.rundingBulan = idxP(p);
    var r = simpan(p, m, { ap: -C.ap, myr: -C.myr }, { kira: true, tindakan: 'bersatu_pn', nama: 'Rundingan kerusi bersama PAS' });
    return r.ok ? { ok: true, mesej: 'Rundingan agihan kerusi bersama PAS berjalan lancar. Kesepaduan PN ' + Math.round(a) + ' → ' + Math.round(m.kesepaduan) + '.' } : { ok: false, ralat: r.ralat };
  }

  /* ---------- Anggaran kerusi PN (js/paparan.js anggarKerusi, js/pru.js janaNasional) ---------- */
  function kerusiParlimen(pop, rng) {
    var J0 = 222, parti = clamp(Math.round(J0 * (0.09 + (pop - 30) / 40 * 0.2) + (rng() * 10 - 5)), 10, 90);
    return { parti: parti, rakan: Math.min(J0 - parti, Math.round(J0 * (0.12 + rng() * 0.06))) };
  }
  function kadarDUN(kodNegeri, pop, rng) {
    var a = CONFIG.DUN_ASAS[String(kodNegeri)]; if (a == null) { a = 0.2; }
    return clamp(a + ((Number(pop) || 45) - 45) / 100 + (rng() * 0.1 - 0.05), 0.02, 0.98);
  }

  /* ---------- Bulanan ---------- */
  function prosesBulan() {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat || !adalah(p)) { return { peristiwa: ev }; }
    var m = st(p), own = kodPL(p), C = CONFIG.PN, Y = parseInt(p.tahun, 10);
    Object.keys(m.pusat).forEach(function (k) { var asal = k === own ? CONFIG.PUSAT.sendiri : 40; m.pusat[k] = Math.round((m.pusat[k] + (asal - m.pusat[k]) * 0.02) * 10) / 10; });
    var a = m.kesepaduan;
    if (a > C.awal) { m.kesepaduan = Math.max(C.awal, a - C.susut); } else if (a < C.awal) { m.kesepaduan = Math.min(C.awal, a + C.susut); }
    if (a >= C.rendah && m.kesepaduan < C.rendah) { ev.push({ jenis: 'bersatu', mesej: 'Kesepaduan PN merosot: PAS mungkin bertanding menentang BERSATU (3 penjuru) di kerusi anda.' }); }
    if (pegangKod(p, 'ahli_mkt') || pegangKod(p, 'ketua_bahagian') || pegangKod(p, 'naib_presiden') || pegangKod(p, 'timbalan_presiden')) { m.pernahMPT = true; }
    var tl = tahunLepas(p, Y);
    if (pegangKod(p, 'presiden') && tl && m.presidenTahun !== tl) { m.presidenTahun = tl; m.penggalPresiden = penggalPresiden({ bersatu: m }) + 1; }   // Fasal 13.8
    simpan(p, m, {});
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, adalah: adalah, bersekutu: bersekutu, kawasan: kawasan, sebabKuota: sebabKuota, ofset: ofset, lawan: lawan, kerajaanNegeriAwal: kerajaanNegeriAwal,
    adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya,
    sokonganBahagian: sokonganBahagian, perwakilan: perwakilan, ringkasPusat: ringkasPusat, bonusPusat: bonusPusat, statusJelajah: statusJelajah, jelajah: jelajah,
    lantikanSemasa: function () { return null; }, kerusiParlimen: kerusiParlimen, kadarDUN: kadarDUN, prosesBulan: prosesBulan, kerusiJawatan: kerusiJawatan,
    tahunKeahlian: tahunKeahlian, adjCalon: adjCalon, sekatanJawatan: sekatanJawatan, penggalPresiden: penggalPresiden, pernahLayakPresiden: pernahLayakPresiden,
    kesepaduan: kesepaduan, statusRunding: statusRunding, runding: runding };
});
