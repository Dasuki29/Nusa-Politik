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
   v13.32 (Fasa 2, mockup dipersetujui): Restu Majlis Syura Ulamak (0-100), Ceramah / Ceramah Perdana, Dewan Ulamak (bidang Pengajian Islam),
     Dewan As-Sabiqun (60 tahun ke atas, tanpa jawatan lain, Fasal 59(5)), Ahli Bersekutu & Dewan Himpunan Pendukung (Fasal 11(2), 16(2), 60),
     lantikan Ahli Majlis Syura (Fasal 8(4)-(5)), rayuan tatatertib ke Majlis Syura (Fasal 77) dan peringatan Fasal 15A.
   State: p.pas = { pusat:{kod:sokongan}, jelajahBulan, restu, ceramahBulan, dewan:{ ulamak|sabiqun|pendukung:{ ahli, jawatan, calon, sejak } },
                    syura:{ sehingga }|null, rayuanKunci, siasatanKunci }
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
    TANGGUH: { peluang: 0.05, bulan: 1 },                                   // v13.61: Fasal 18(3), ANDAIAN peluang
    TAHUN_MULA: 2027, KITARAN_TAHUN: 2, BULAN_PUSAT: 9,                    // Fasal 38(2): setiap 2 tahun; ANDAIAN tahun mula dan bulan Muktamar
    PERWAKILAN: { asas: 4, ambang: 2000, setiap: 1000, maks: 15 },         // Fasal 18(5)
    WAKIL_DEWAN: 40, WAKIL_PUSAT: 40,
    /* v13.32 (Fasa 2) ANDAIAN: angka permainan. */
    RESTU: { awal: 50, susut: 1, integritiTinggi: 80, naikIntegriti: 0.5, integritiRendah: 50, turunIntegriti: 1, ketuaUlamak: 0.5, siasatan: -5,
      presiden: 60, rayuan: 75, rayuanPeluang: 0.7, rayuanAP: 1, rayuanGagal: -3, calonSkala: 0.004, syura: 80, syuraPeluang: 0.5, syuraBulan: 60, syuraIP: 10, syuraReputasi: 2 },
    CERAMAH: { ap: 1, myr: 300, akarUmbi: 2, ip: 4, restu: 1 }, PERDANA: { ap: 2, myr: 1500, akarUmbi: 3, ip: 8, restu: 2, reputasi: 1, pangkat: 7 },
    DEWAN: {
      ulamak: { nama: 'Dewan Ulamak', ketua: 'Ketua Dewan Ulamak', ip: { kawasan: 120, negeri: 300, pusat: 700 }, bonus: { kawasan: 2, negeri: 4, pusat: 8 } },
      sabiqun: { nama: 'Dewan As-Sabiqun', ketua: 'Ketua As-Sabiqun', ip: { kawasan: 120, negeri: 300, pusat: 700 }, bonus: { kawasan: 2, negeri: 4, pusat: 8 }, umur: 60, ahliIP: 3, ahliStress: -1 },
      pendukung: { nama: 'Dewan Himpunan Pendukung', ketua: 'Ketua Dewan Himpunan Pendukung', ip: { kawasan: 120, negeri: 300, pusat: 700 }, bonus: { kawasan: 2, negeri: 4, pusat: 8 } }
    },
    PERINGKAT: ['kawasan', 'negeri', 'pusat'], BULAN_DEWAN: { kawasan: 5, negeri: 7, pusat: 9 },
    BUMI_BERSEKUTU: 60,                                      // Fasal 18(4)(b)-(h): 20 wakil Dewan Pemuda + 20 Dewan Muslimat (Fasa 1); JK Pusat, Majlis Syura dan Pesuruhjaya (anggaran)
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
  function bersekutu(p) { return adalah(p) && p.keahlianJenis === 'bersekutu'; }
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
  /* v13.61: Fasal 18(3): pemilihan boleh ditangguh ke Muktamar tahun berikutnya (2/3 JK Pusat). p.pas.tangguh = [tahun ...]; kitaran beranjak 1 tahun selepas setiap penangguhan. */
  function anjak(p, t) { var tg = p && p.pas && Array.isArray(p.pas.tangguh) ? p.pas.tangguh : []; return tg.filter(function (y) { return y <= t; }).length; }
  function adalahTahunPemilihan(p, tahun) { var t = parseInt(tahun, 10), a = anjak(p, t); return t >= CONFIG.TAHUN_MULA + (a ? 1 : 0) && (t - CONFIG.TAHUN_MULA - a) % CONFIG.KITARAN_TAHUN === 0; }
  function tahunSeterusnya(p, tahun) { var t = parseInt(tahun, 10); if (t < CONFIG.TAHUN_MULA) { return CONFIG.TAHUN_MULA; } for (var y = t; y < t + 6; y++) { if (adalahTahunPemilihan(p, y)) { return y; } } return t; }
  function tahunLepas(p, tahun) { var t = parseInt(tahun, 10); if (t < CONFIG.TAHUN_MULA) { return null; } for (var y = t; y >= CONFIG.TAHUN_MULA; y--) { if (adalahTahunPemilihan(p, y)) { return y; } } return null; }

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

  /* ---------- v13.32: Restu Majlis Syura Ulamak ---------- */
  function restu(p) { var m = st(p); return typeof m.restu === 'number' ? m.restu : CONFIG.RESTU.awal; }
  function larasRestu(m, n) { m.restu = Math.round(clamp((typeof m.restu === 'number' ? m.restu : CONFIG.RESTU.awal) + n, 0, 100) * 10) / 10; return m.restu; }
  /** Pelarasan peluang dicalonkan PRU (js/pru.js): ±0.4% bagi setiap mata dari 50. */
  function adjCalon(p) { return adalah(p) ? (restu(p) - 50) * CONFIG.RESTU.calonSkala : 0; }
  /** Sekatan jawatan (js/jawatan.js): Presiden / Timbalan Presiden perlu Restu >= 60; Ahli Bersekutu hanya Dewan Himpunan Pendukung. */
  function sekatanJawatan(p, d) {
    if (!adalah(p) || !d) { return null; }
    if (bersekutu(p)) { return 'Ahli Bersekutu hanya boleh memegang jawatan dalam Dewan Himpunan Pendukung (Fasal 16(2)).'; }
    if ((d.kod === 'presiden' || d.kod === 'timbalan_presiden') && restu(p) < CONFIG.RESTU.presiden) { return 'Perlu Restu Majlis Syura sekurang-kurangnya ' + CONFIG.RESTU.presiden + ' untuk bertanding jawatan ini (anda ' + Math.round(restu(p)) + ').'; }
    return null;
  }
  /** Sekatan calon PRU Ahli Bersekutu: kerusi dengan pengundi Bumiputera < 60% sahaja (ANDAIAN). */
  function sekatanCalon(p, jenis) {
    if (!bersekutu(p)) { return null; }
    var k = kawasan(p), x = jenis === 'DUN' ? k.dun : k.parlimen;
    return x && x.m >= CONFIG.BUMI_BERSEKUTU ? 'Ahli Bersekutu hanya dicalonkan di kerusi dengan pengundi Bumiputera bawah ' + CONFIG.BUMI_BERSEKUTU + '% (kerusi ini ' + x.m + '%)' : null;
  }

  /* ---------- v13.32: Ceramah ---------- */
  function pangkat(p) { var J0 = J(); return J0 && J0.pangkatTertinggi ? J0.pangkatTertinggi(p) : 0; }
  function statusCeramah(p, perdana) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk PAS.' }; }
    var C = perdana ? CONFIG.PERDANA : CONFIG.CERAMAH, m = st(p);
    if (perdana && pangkat(p) < CONFIG.PERDANA.pangkat) { return { boleh: false, sebab: 'Perlu Yang Dipertua Kawasan atau lebih.' }; }
    if (m.ceramahBulan === idx(p.tahun, p.bulan)) { return { boleh: false, sebab: 'Ceramah sudah diadakan bulan ini.' }; }
    if ((Number(p.ap) || 0) < C.ap) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < C.myr) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function ceramah(perdana) {
    var p = S().loadPlayer(), s0 = statusCeramah(p, perdana); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var C = perdana ? CONFIG.PERDANA : CONFIG.CERAMAH, m = st(p), a = restu(p), b = larasRestu(m, C.restu); m.ceramahBulan = idx(p.tahun, p.bulan);
    var kes = { ap: -C.ap, myr: -C.myr, ip: C.ip, kesetiaan: { akarUmbi: C.akarUmbi } }; if (C.reputasi) { kes.reputasi = C.reputasi; }
    var r = simpan(p, m, kes, { kira: true, tindakan: perdana ? 'pas_ceramah_perdana' : 'pas_ceramah', nama: perdana ? 'Ceramah Perdana' : 'Ceramah' });
    return r.ok ? { ok: true, mesej: (perdana ? 'Ceramah Perdana' : 'Ceramah') + ' diadakan: sokongan akar umbi +' + C.akarUmbi + ', IP +' + C.ip + (C.reputasi ? ', Reputasi +' + C.reputasi : '') + ', Restu Majlis Syura ' + Math.round(a) + ' → ' + Math.round(b) + '.' } : { ok: false, ralat: r.ralat };
  }

  /* ---------- v13.32: Dewan Ulamak, As-Sabiqun, Himpunan Pendukung ---------- */
  function umur(p) { var H = modul('MyPolitikHayat', 'hayat.js'); return H && H.umurSemasa ? H.umurSemasa(p) : 0; }
  function adaJawatanLain(p) { var J0 = J(); return !!(J0 && J0.getJawatan && J0.getJawatan(p).filter(function (j) { return j && j.kod !== 'lama'; }).length); }
  function dewanPemain(p, kod) { var m = st(p), d = (m.dewan || {})[kod]; return d && typeof d === 'object' ? d : { ahli: false, jawatan: null, calon: null }; }
  function islamLulusan(p) { var pd = p && p.pendidikan; return !!(pd && pd.bidang === 'islam' && pd.tahap && pd.tahap !== 'spm'); }
  /** Kelayakan menyertai Dewan: { boleh, sebab }. */
  function layakDewan(p, kod) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk PAS.' }; }
    if (kod === 'pendukung') { return bersekutu(p) ? { boleh: true, sebab: '' } : { boleh: false, sebab: 'Untuk Ahli Bersekutu (bukan Islam) sahaja (Fasal 60).' }; }
    if (bersekutu(p)) { return { boleh: false, sebab: 'Ahli Bersekutu hanya dalam Dewan Himpunan Pendukung.' }; }
    if (kod === 'ulamak') { return islamLulusan(p) ? { boleh: true, sebab: '' } : { boleh: false, sebab: 'Dewan Ulamak: perlu lulusan Pengajian Islam (Diploma ke atas, Fasal 56(2)).' }; }
    if (kod === 'sabiqun') {
      if (umur(p) < CONFIG.DEWAN.sabiqun.umur) { return { boleh: false, sebab: 'Dewan As-Sabiqun untuk ahli berumur 60 tahun ke atas (Fasal 59(2)).' }; }
      return { boleh: true, sebab: '' };
    }
    return { boleh: false, sebab: 'Dewan tidak sah.' };
  }
  function sertaiDewan(kod) {
    var p = S().loadPlayer(), l = layakDewan(p, kod); if (!l.boleh) { return { ok: false, ralat: l.sebab }; }
    var m = st(p); m.dewan = m.dewan || {}; if (m.dewan[kod] && m.dewan[kod].ahli) { return { ok: false, ralat: 'Anda sudah ahli ' + CONFIG.DEWAN[kod].nama + '.' }; }
    m.dewan[kod] = { ahli: true, jawatan: null, calon: null, sejak: idx(p.tahun, p.bulan) };
    var r = simpan(p, m, {}, { tindakan: 'pas_dewan', nama: 'Menyertai ' + CONFIG.DEWAN[kod].nama });
    return r.ok ? { ok: true, mesej: 'Anda kini ahli ' + CONFIG.DEWAN[kod].nama + '.' } : { ok: false, ralat: r.ralat };
  }
  function peringkatSeterusnya(d) { var i = d.jawatan ? CONFIG.PERINGKAT.indexOf(d.jawatan) : -1; return i < CONFIG.PERINGKAT.length - 1 ? CONFIG.PERINGKAT[i + 1] : null; }
  function statusBertandingDewan(p, kod) {
    var d = dewanPemain(p, kod), D0 = CONFIG.DEWAN[kod]; if (!D0 || !d.ahli) { return { boleh: false, sebab: 'Sertai ' + (D0 ? D0.nama : 'Dewan') + ' dahulu.' }; }
    var ke = peringkatSeterusnya(d); if (!ke) { return { boleh: false, sebab: 'Anda sudah ' + D0.ketua + ' Pusat.' }; }
    if (kod === 'sabiqun' && adaJawatanLain(p)) { return { boleh: false, sebab: 'Pemegang jawatan parti lain tidak layak memegang jawatan As-Sabiqun (Fasal 59(5)).' }; }
    if (!adalahTahunPemilihan(p, p.tahun) || p.bulan > CONFIG.BULAN_DEWAN[ke]) { return { boleh: false, sebab: 'Pemilihan Dewan dalam tahun pemilihan, sebelum bulan ' + CONFIG.BULAN_DEWAN[ke] + ' (seterusnya ' + tahunSeterusnya(p, p.tahun + (adalahTahunPemilihan(p, p.tahun) ? 1 : 0)) + ').' }; }
    if (d.calon) { return { boleh: false, sebab: 'Anda sudah mendaftar sebagai calon ' + D0.ketua + ' ' + label(d.calon) + '.' }; }
    if ((Number(p.ip) || 0) < D0.ip[ke]) { return { boleh: false, sebab: 'Perlukan ' + D0.ip[ke] + ' IP (anda ada ' + Math.round(Number(p.ip) || 0) + ').' }; }
    return { boleh: true, sebab: '', ke: ke };
  }
  function label(pr) { return pr === 'kawasan' ? 'Kawasan' : pr === 'negeri' ? 'Negeri' : 'Pusat'; }
  function bertandingDewan(kod) {
    var p = S().loadPlayer(), s0 = statusBertandingDewan(p, kod); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p); m.dewan[kod].calon = s0.ke;
    var r = simpan(p, m, {}, { kira: true, tindakan: 'pas_dewan_calon', nama: 'Calon ' + CONFIG.DEWAN[kod].ketua + ' ' + label(s0.ke) });
    return r.ok ? { ok: true, mesej: 'Anda mendaftar sebagai calon ' + CONFIG.DEWAN[kod].ketua + ' ' + label(s0.ke) + '. Keputusan pada bulan ' + CONFIG.BULAN_DEWAN[s0.ke] + '.' } : { ok: false, ralat: r.ralat };
  }
  function peluangDewan(p, kod, ke) { var ipM = CONFIG.DEWAN[kod].ip[ke]; return clamp(0.3 + ((Number(p.ip) || 0) - ipM) / ipM * 0.3 + (restu(p) - 50) * 0.01, 0.1, 0.9); }

  /** Simpanan lama / tukar bidang: daftar sebagai lulusan Pengajian Islam sekali sahaja (Diploma ke atas). */
  function statusBidang(p) {
    if (!adalah(p) || bersekutu(p)) { return { boleh: false, sebab: '' }; }
    if (islamLulusan(p)) { return { boleh: false, sebab: '', sudah: true }; }
    var pd = p.pendidikan || {}; if (!pd.tahap || pd.tahap === 'spm') { return { boleh: false, sebab: 'Perlu Diploma ke atas.' }; }
    if (st(p).bidangTukar) { return { boleh: false, sebab: 'Bidang pengajian sudah ditukar sekali.' }; }
    return { boleh: true, sebab: '' };
  }
  function tukarBidang() {
    var p = S().loadPlayer(), s0 = statusBidang(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab || 'Tidak boleh.' }; }
    var m = st(p), pd = JSON.parse(JSON.stringify(p.pendidikan || {})); pd.bidang = 'islam'; m.bidangTukar = true;
    var r = S().applyEffects({}, { kiraTindakan: false, patch: { pas: m, pendidikan: pd }, log: { tindakan: 'pas_bidang', nama: 'Bidang pengajian: Pengajian Islam', peringkat: 'ahli' } });
    return r.ok ? { ok: true, mesej: 'Bidang pengajian anda kini Pengajian Islam. Anda boleh menyertai Dewan Ulamak.' } : { ok: false, ralat: r.ralat };
  }

  /* ---------- v13.32: rayuan tatatertib ke Majlis Syura (Fasal 77) ---------- */
  function kunciHukuman(p) { var e = p && p.etika, h = e && e.hukuman; return e && /^(digantung|dilarang|dipecat)$/.test(e.status) ? e.status + '|' + (h ? (h.tahun || h.mulaTahun || '') + '-' + (h.bulan || h.mulaBulan || '') : '') : null; }
  function statusRayuan(p) {
    if (!adalah(p)) { return { boleh: false, sebab: '' }; }
    var kk = kunciHukuman(p); if (!kk) { return { boleh: false, sebab: 'Tiada tindakan tatatertib.' }; }
    if (st(p).rayuanKunci === kk) { return { boleh: false, sebab: 'Rayuan ke Majlis Syura sudah dibuat untuk tindakan ini.' }; }
    if (restu(p) < CONFIG.RESTU.rayuan) { return { boleh: false, sebab: 'Perlu Restu Majlis Syura sekurang-kurangnya ' + CONFIG.RESTU.rayuan + '.' }; }
    if ((Number(p.ap) || 0) < CONFIG.RESTU.rayuanAP) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function rayuan(o) {
    var p = S().loadPlayer(), s0 = statusRayuan(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var r = (o && o.rng) || S().rngBerbenih(String(p.id) + '|pas|rayuan|' + idx(p.tahun, p.bulan)), m = st(p), jaya = r() < CONFIG.RESTU.rayuanPeluang, patch = { pas: m };
    m.rayuanKunci = kunciHukuman(p);
    if (jaya) { var e = JSON.parse(JSON.stringify(p.etika)); e.status = 'baik'; e.hukuman = null; e.notisRayu = false; patch.etika = e; }
    else { larasRestu(m, CONFIG.RESTU.rayuanGagal); }
    var res = S().applyEffects({ ap: -CONFIG.RESTU.rayuanAP }, { kiraTindakan: true, patch: patch, log: { tindakan: 'pas_rayuan', nama: 'Rayuan tatatertib ke Majlis Syura Ulamak' + (jaya ? ' (diterima)' : ' (ditolak)'), peringkat: 'disiplin' } });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    return { ok: true, jaya: jaya, mesej: jaya ? 'Majlis Syura Ulamak menerima rayuan anda (Fasal 77). Tindakan tatatertib dibatalkan.' : 'Majlis Syura Ulamak menolak rayuan anda. Restu Majlis Syura ' + CONFIG.RESTU.rayuanGagal + '.' };
  }
  function tb(i) { var B = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'], t = Math.floor((i - 1) / 12), b = ((i - 1) % 12) + 1; return B[b - 1] + ' ' + t; }

  /* ---------- Bulanan ---------- */
  function prosesBulan(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat || !adalah(p)) { return { peristiwa: ev }; }
    var m = st(p), own = kodPL(p), R0 = CONFIG.RESTU, kes = {}, now = idx(p.tahun, p.bulan), rng = (o && o.rng) || S().rngBerbenih(String(p.id) + '|pas|bulan|' + now);
    Object.keys(m.pusat).forEach(function (k) { var asal = k === own ? CONFIG.PUSAT.sendiri : 40; m.pusat[k] = Math.round((m.pusat[k] + (asal - m.pusat[k]) * 0.02) * 10) / 10; });
    // v13.32: Restu Majlis Syura: susut ke arah 50, Integriti, Ketua Dewan Ulamak, siasatan etika
    var rs = restu(p), skor = p.integriti && typeof p.integriti.skor === 'number' ? p.integriti.skor : 60;
    if (rs > R0.awal) { larasRestu(m, -Math.min(R0.susut, rs - R0.awal)); } else if (rs < R0.awal) { larasRestu(m, Math.min(R0.susut, R0.awal - rs)); }
    if (skor >= R0.integritiTinggi) { larasRestu(m, R0.naikIntegriti); } else if (skor < R0.integritiRendah) { larasRestu(m, -R0.turunIntegriti); }
    var ul = dewanPemain(p, 'ulamak'); if (ul.jawatan) { larasRestu(m, R0.ketuaUlamak); }
    // v13.61: Fasal 18(3): penangguhan pemilihan (bulan 1 tahun pemilihan, sekali setahun)
    if (p.bulan === CONFIG.TANGGUH.bulan && m.tangguhSemak !== p.tahun && adalahTahunPemilihan(p, p.tahun)) {
      m.tangguhSemak = p.tahun;
      if (rng() < CONFIG.TANGGUH.peluang) { m.tangguh = (Array.isArray(m.tangguh) ? m.tangguh : []).concat([p.tahun]); ev.push({ jenis: 'pas', mesej: 'Majlis Kerja Tertinggi bersetuju (2/3 ahli) menangguhkan agenda pemilihan ke Perhimpunan Agung UMNO (PAU) tahun ' + (p.tahun + 1) + ' (Fasal 18(3)). Pemegang jawatan sedia ada kekal.' }); }
    }
    var sk = p.etika && p.etika.siasatan ? 'siasatan|' + (p.etika.siasatan.tahun || '') + '-' + (p.etika.siasatan.bulan || '') : null;
    if (sk && m.siasatanKunci !== sk) { m.siasatanKunci = sk; larasRestu(m, R0.siasatan); ev.push({ jenis: 'pas', mesej: 'Siasatan etika terhadap anda: Restu Majlis Syura Ulamak ' + R0.siasatan + '.' }); }
    // v13.32: Dewan: keputusan pemilihan, bonus IP jawatan, As-Sabiqun
    Object.keys(CONFIG.DEWAN).forEach(function (kod) {
      var d = (m.dewan || {})[kod]; if (!d || !d.ahli) { return; }
      var D0 = CONFIG.DEWAN[kod];
      if (d.calon && p.bulan >= CONFIG.BULAN_DEWAN[d.calon]) {
        var ke = d.calon, menang = rng() < peluangDewan(p, kod, ke); d.calon = null;
        if (menang) { d.jawatan = ke; ev.push({ jenis: 'pas', mesej: 'Anda menang jawatan ' + D0.ketua + ' ' + label(ke) + '.' }); }
        else { ev.push({ jenis: 'pas', mesej: 'Anda kalah dalam pemilihan ' + D0.ketua + ' ' + label(ke) + '.' }); }
      }
      if (d.jawatan) { kes.ip = (kes.ip || 0) + D0.bonus[d.jawatan]; }
      if (kod === 'sabiqun') {
        kes.ip = (kes.ip || 0) + D0.ahliIP;
        var STm = modul('MyPolitikStres', 'stress.js'); if (STm && STm.laras) { try { STm.laras({ stress: D0.ahliStress }); } catch (eS) { /* abaikan */ } }
      }
    });
    // v13.32: Ahli Majlis Syura Ulamak (Fasal 8(4)-(5)): Ketua Dewan Ulamak Pusat dengan Restu >= 80, selepas Muktamar tahun pemilihan
    if (m.syura && now > m.syura.sehingga) { m.syura = null; ev.push({ jenis: 'pas', mesej: 'Penggal anda sebagai Ahli Majlis Syura Ulamak tamat.' }); }
    if (m.syura) { kes.ip = (kes.ip || 0) + R0.syuraIP; }
    else if (ul.jawatan === 'pusat' && restu(Object.assign({}, p, { pas: m })) >= R0.syura && adalahTahunPemilihan(p, p.tahun) && p.bulan === CONFIG.BULAN_PUSAT + 1 && rng() < R0.syuraPeluang) {
      m.syura = { sehingga: now + R0.syuraBulan }; kes.reputasi = (kes.reputasi || 0) + R0.syuraReputasi; kes.ip = (kes.ip || 0) + R0.syuraIP;
      ev.push({ jenis: 'pas', mesej: 'Anda dilantik Ahli Majlis Syura Ulamak untuk penggal 5 tahun (Fasal 8): IP +' + R0.syuraIP + ' sebulan, Reputasi +' + R0.syuraReputasi + '.' });
    }
    simpan(p, m, kes);
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, adalah: adalah, kawasan: kawasan, sebabKuota: sebabKuota, ofset: ofset, lawan: lawan, kerajaanNegeriAwal: kerajaanNegeriAwal,
    adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya,
    sokonganBahagian: sokonganBahagian, perwakilan: perwakilan, ringkasPusat: ringkasPusat, bonusPusat: bonusPusat, statusJelajah: statusJelajah, jelajah: jelajah,
    lantikanSemasa: function () { return null; }, kerusiParlimen: kerusiParlimen, kadarDUN: kadarDUN, prosesBulan: prosesBulan,
    bersekutu: bersekutu, restu: restu, adjCalon: adjCalon, sekatanJawatan: sekatanJawatan, sekatanCalon: sekatanCalon, statusCeramah: statusCeramah, ceramah: ceramah,
    islamLulusan: islamLulusan, layakDewan: layakDewan, sertaiDewan: sertaiDewan, dewanPemain: dewanPemain, statusBertandingDewan: statusBertandingDewan, bertandingDewan: bertandingDewan,
    peluangDewan: peluangDewan, statusBidang: statusBidang, tukarBidang: tukarBidang, statusRayuan: statusRayuan, rayuan: rayuan, label: label, tb: tb };
});
