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
   v13.38 (Fasa 2, mockup "DAP Fasa 2" dipersetujui):
     - Mesyuarat Pertama JTP (Fasal X.1(a)): Setiausaha Agung, Pengerusi Kebangsaan dan Naib Pengerusi Kebangsaan dipilih oleh 30 ahli JTP,
       bukan di Kongres. Pemain yang menang Ahli JTP di Kongres (bulan 3) memilih jawatan sasaran dan melobi rakan JTP pada bulan 4;
       keputusan pada awal bulan 5. Perlu 16 / 30 (Setiausaha Agung, Pengerusi); Naib Pengerusi >= 6 undi (ANDAIAN).
     - Syarat calon JTP (Fasal XXX): pencalonan >= 2 Cawangan dan ahli >= 2 tahun; Kumpul Pencalonan Cawangan (bulan 1-2 tahun Kongres).
     - Calon PRU = prerogatif JTP (Fasal XII): meter Hubungan JTP (0-100, ANDAIAN) +/-15 mata peluang dicalonkan; ahli >= 2 tahun.
     - Setiausaha Agung maksimum 3 penggal (Fasal X.2(b)); Kongres ditangguh automatik jika dalam 24 bulan sebelum PRU (Fasal VIII.1(c)),
       diadakan pada bulan 3 tahun selepas PRU (ANDAIAN; Perlembagaan: dalam 6 bulan).
     - Caruman elaun wakil rakyat 10% (Fasal IV.12(a), ANDAIAN kadar); rujukan disiplin -> Fasal VII (js/parti.js);
       pemain dipecat semasa wakil rakyat: kerusi dikosongkan (Fasal IV.12(c), ANDAIAN tafsiran).
   State: p.dap = { pusat:{kod:sokongan}, jelajahBulan, jtp:{tahun,sasaran,sokong,belum,lawan,lobiBulan,lobiBil,hasil}, pencalonan:{tahun,n,bulan},
     hubJTP, hubTahunJTP, hukumKunci, penggalSA, tangguhDari, asas, kosongKunci }
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
    /* v13.38: Fasa 2 (ANDAIAN angka permainan) */
    MESYUARAT: { bulan: 4, ahli: 30, majoriti: 16, naibMin: 6, lobiAP: 1, lobiMYR: 500, lobiMaks: 3, lobiPeluang: 0.6, belumSokong: 0.4 },
    SASARAN: { presiden: 'Setiausaha Agung', timbalan_presiden: 'Pengerusi Kebangsaan', naib_presiden: 'Naib Pengerusi Kebangsaan' },
    PENCALONAN: { perlu: 2, ap: 1, bulanAkhir: 2, tahunAhli: 2 },
    HUB: { asas: 50, ahliJTP: 10, caruman: 0.5, lobi: 1, hukum: -10, integritiRendah: -1, calon: 0.15 },
    CARUMAN: { kadar: 0.1, MP: 2500, ADUN: 1500 }, SA_PENGGAL: 3, TANGGUH_BULAN: 24,
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
  /** v13.38: tangguh (Fasal VIII.1(c)): tahun tangguhDari hingga asas-1 bukan tahun Kongres; kitaran baharu bermula pada asas. */
  function adalahTahunPemilihan(p, tahun) {
    var t = parseInt(tahun, 10), m = p && p.dap && typeof p.dap === 'object' ? p.dap : {}, K = CONFIG.KITARAN_TAHUN;
    if (typeof m.asas === 'number' && t >= m.asas) { return (t - m.asas) % K === 0; }
    if (typeof m.tangguhDari === 'number' && t >= m.tangguhDari) { return false; }
    return t >= CONFIG.TAHUN_MULA && (t - CONFIG.TAHUN_MULA) % K === 0;
  }
  function tahunSeterusnya(p, tahun) { var t = Math.max(parseInt(tahun, 10), CONFIG.TAHUN_MULA); for (var y = t; y < t + 10; y++) { if (adalahTahunPemilihan(p, y)) { return y; } } return t; }
  function tahunLepas(p, tahun) { for (var y = parseInt(tahun, 10); y >= CONFIG.TAHUN_MULA; y--) { if (adalahTahunPemilihan(p, y)) { return y; } } return null; }

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

  /* ---------- v13.38: Fasa 2 ---------- */
  function idxP(p) { return idx(p.tahun, p.bulan); }
  function tahunKeahlian(p) { var k = p && p.keahlian; if (!k) { return 99; } return ((parseInt(p.tahun, 10) * 12 + (parseInt(p.bulan, 10) || 1)) - ((parseInt(k.sejakTahun, 10) || p.tahun) * 12 + (parseInt(k.sejakBulan, 10) || 1))) / 12; }
  function hubJTP(p) { var m = st(p); return typeof m.hubJTP === 'number' ? m.hubJTP : CONFIG.HUB.asas; }
  /** Pelarasan peluang dicalonkan PRU (js/pru.js): -0.15 .. +0.15. */
  function adjCalon(p) { return adalah(p) ? Math.round((hubJTP(p) - 50) / 50 * CONFIG.HUB.calon * 1000) / 1000 : 0; }
  /** Fasal XXX: calon PRU mesti ahli >= 2 tahun (kecuali kelulusan JTP). */
  function sekatanCalon(p) { return adalah(p) && tahunKeahlian(p) < CONFIG.PENCALONAN.tahunAhli ? 'Ahli DAP kurang daripada 2 tahun tidak layak menjadi calon pilihan raya (Perlembagaan DAP, Fasal XXX).' : null; }
  function pegangKod(p, kod) { var J0 = J(); return !!(J0 && J0.getJawatan && J0.getJawatan(p).some(function (j) { return j.kod === kod; })); }
  function penggalSA(p) { return Number(st(p).penggalSA) || 0; }
  function pencalonan(p) { var m = st(p), c = m.pencalonan && m.pencalonan.tahun === parseInt(p.tahun, 10) ? m.pencalonan.n : 0; return c + (pegangKod(p, 'ketua_cawangan') ? 1 : 0); }
  /** Sekatan jawatan (js/jawatan.js): jawatan pegawai JTP tidak dipertandingkan di Kongres; syarat calon Ahli JTP (Fasal XXX). */
  function sekatanJawatan(p, d) {
    if (!adalah(p) || !d) { return null; }
    if (CONFIG.SASARAN[d.kod]) { return CONFIG.SASARAN[d.kod] + ' dipilih oleh 30 ahli Jawatankuasa Tertinggi Pusat dalam Mesyuarat Pertama JTP, bukan di Kongres (Perlembagaan DAP, Fasal X.1). Menangi kerusi Ahli JTP dahulu.'; }
    if (d.kod === 'ahli_mkt') {
      if (tahunKeahlian(p) < CONFIG.PENCALONAN.tahunAhli) { return 'Calon JTP mesti menjadi ahli sekurang-kurangnya 2 tahun (Perlembagaan DAP, Fasal XXX).'; }
      if (pencalonan(p) < CONFIG.PENCALONAN.perlu) { return 'Calon JTP perlu dicalonkan oleh sekurang-kurangnya 2 Cawangan (Perlembagaan DAP, Fasal XXX). Pencalonan semasa: ' + pencalonan(p) + ' / 2.'; }
    }
    return null;
  }
  function statusPencalonan(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk DAP.' }; }
    if (!adalahTahunPemilihan(p, p.tahun) || (parseInt(p.bulan, 10) || 1) > CONFIG.PENCALONAN.bulanAkhir) { return { boleh: false, sebab: 'Pencalonan Cawangan dikumpul pada bulan 1 hingga 2 tahun Kongres (seterusnya ' + tahunSeterusnya(p, (parseInt(p.bulan, 10) || 1) > CONFIG.PENCALONAN.bulanAkhir ? p.tahun + 1 : p.tahun) + ').' }; }
    if (pencalonan(p) >= CONFIG.PENCALONAN.perlu) { return { boleh: false, sebab: 'Pencalonan sudah mencukupi.' }; }
    var m = st(p); if (m.pencalonan && m.pencalonan.bulan === idxP(p)) { return { boleh: false, sebab: 'Pencalonan sudah dicuba bulan ini.' }; }
    if ((Number(p.ap) || 0) < CONFIG.PENCALONAN.ap) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function kumpulPencalonan(o) {
    var p = S().loadPlayer(), s0 = statusPencalonan(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), Y = parseInt(p.tahun, 10), sb = sokonganBahagian(p)[kodPL(p)] || CONFIG.PUSAT.sendiri, r = (o && o.rng) || S().rngBerbenih(hash(String(p.id) + '|calon|' + idxP(p)));
    if (!m.pencalonan || m.pencalonan.tahun !== Y) { m.pencalonan = { tahun: Y, n: 0 }; }
    var dapat = r() * 100 < sb; if (dapat) { m.pencalonan.n++; } m.pencalonan.bulan = idxP(p);
    var x = simpan(p, m, { ap: -CONFIG.PENCALONAN.ap }, { kira: true, tindakan: 'dap_calon', nama: 'Kumpul pencalonan Cawangan untuk JTP' });
    return x.ok ? { ok: true, dapat: dapat, mesej: dapat ? 'Satu Cawangan mencalonkan anda ke JTP. Pencalonan: ' + pencalonan(S().loadPlayer()) + ' / 2.' : 'Cawangan yang didekati belum bersedia mencalonkan anda. Cuba lagi bulan depan.' } : { ok: false, ralat: x.ralat };
  }
  /** Mesyuarat Pertama JTP: dibuka bulan 4 tahun Kongres bagi pemain yang memegang Ahli JTP dimenangi tahun itu. */
  function mesyuarat(p) { var m = st(p); return m.jtp && m.jtp.tahun === parseInt(p.tahun, 10) ? m.jtp : null; }
  function bukaMesyuarat(p, m, ev) {
    var Y = parseInt(p.tahun, 10); if (m.jtp && m.jtp.tahun === Y) { return; }
    var J0 = J(), aj = J0 && J0.getJawatan ? J0.getJawatan(p).filter(function (j) { return j.kod === 'ahli_mkt' && j.tahun === Y; })[0] : null; if (!aj) { return; }
    if (m.hubTahunJTP !== Y) { m.hubJTP = clamp(hubJTP(p) + CONFIG.HUB.ahliJTP, 0, 100); m.hubTahunJTP = Y; }
    var M0 = CONFIG.MESYUARAT, lain = M0.ahli - 1, h = hubJTP({ dap: m }), sok = clamp(Math.round(lain * (0.25 + (h - 50) / 150 + ((Number(p.reputasi) || 50) - 50) / 300)), 3, 20), law = Math.round((lain - sok) * 0.5);
    m.jtp = { tahun: Y, sasaran: null, sokong: sok, lawan: law, belum: lain - sok - law, lobiBulan: null, lobiBil: 0, hasil: null };
    ev.push({ jenis: 'dap', mesej: 'Mesyuarat Pertama JTP dibuka: pilih jawatan sasaran dan lobi rakan JTP bulan ini (' + sok + ' menyokong, ' + m.jtp.belum + ' belum memutuskan).' });
  }
  function statusMesyuarat(p) {
    var mt = mesyuarat(p); if (!adalah(p) || !mt) { return { boleh: false, sebab: 'Mesyuarat Pertama JTP dibuka selepas anda menang kerusi Ahli JTP di Kongres.' }; }
    if (mt.hasil) { return { boleh: false, sebab: 'Mesyuarat Pertama JTP tahun ini sudah selesai.' }; }
    if ((parseInt(p.bulan, 10) || 1) !== CONFIG.MESYUARAT.bulan) { return { boleh: false, sebab: 'Mesyuarat Pertama JTP diadakan pada bulan ' + CONFIG.MESYUARAT.bulan + '.' }; }
    return { boleh: true, sebab: '' };
  }
  function pilihSasaran(kod) {
    var p = S().loadPlayer(), s0 = statusMesyuarat(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    if (kod && !CONFIG.SASARAN[kod]) { return { ok: false, ralat: 'Jawatan tidak sah.' }; }
    if (kod === 'presiden' && penggalSA(p) >= CONFIG.SA_PENGGAL) { return { ok: false, ralat: 'Setiausaha Agung tidak boleh memegang jawatan melebihi 3 penggal (Perlembagaan DAP, Fasal X.2(b)).' }; }
    var m = st(p); m.jtp.sasaran = kod || null;
    var x = simpan(p, m, {}); return x.ok ? { ok: true, mesej: kod ? 'Sasaran anda dalam Mesyuarat Pertama JTP: ' + CONFIG.SASARAN[kod] + '.' : 'Anda tidak bertanding jawatan pegawai JTP.' } : { ok: false, ralat: x.ralat };
  }
  function statusLobi(p) {
    var s0 = statusMesyuarat(p); if (!s0.boleh) { return s0; }
    var mt = mesyuarat(p), M0 = CONFIG.MESYUARAT; if (!mt.sasaran) { return { boleh: false, sebab: 'Pilih jawatan sasaran dahulu.' }; }
    if (mt.belum <= 0) { return { boleh: false, sebab: 'Semua ahli JTP sudah membuat keputusan.' }; }
    if (mt.lobiBulan === idxP(p) && mt.lobiBil >= M0.lobiMaks) { return { boleh: false, sebab: 'Lobi maksimum 3 kali sebulan.' }; }
    if ((Number(p.ap) || 0) < M0.lobiAP) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < M0.lobiMYR) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function lobi(o) {
    var p = S().loadPlayer(), s0 = statusLobi(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), mt = m.jtp, M0 = CONFIG.MESYUARAT, r = (o && o.rng) || Math.random;
    if (mt.lobiBulan !== idxP(p)) { mt.lobiBulan = idxP(p); mt.lobiBil = 0; } mt.lobiBil++;
    var jadi = r() < M0.lobiPeluang; if (jadi) { mt.belum--; mt.sokong++; } m.hubJTP = clamp(hubJTP(p) + CONFIG.HUB.lobi, 0, 100);
    var x = simpan(p, m, { ap: -M0.lobiAP, myr: -M0.lobiMYR }, { kira: true, tindakan: 'dap_lobi', nama: 'Lobi rakan JTP' });
    return x.ok ? { ok: true, jadi: jadi, mesej: jadi ? 'Seorang ahli JTP bersetuju menyokong anda (' + mt.sokong + ' menyokong).' : 'Ahli JTP yang dilobi belum membuat keputusan.' } : { ok: false, ralat: x.ralat };
  }
  function selesaiMesyuarat(p, m, ev) {
    var mt = m.jtp; if (!mt || mt.hasil || mt.tahun !== parseInt(p.tahun, 10)) { return null; }
    var M0 = CONFIG.MESYUARAT, r = S().rngBerbenih(hash(String(p.id) + '|jtp|' + mt.tahun)), undi = 1 + mt.sokong;
    if (!mt.sasaran) { mt.hasil = { bertanding: false }; return null; }
    for (var i = 0; i < mt.belum; i++) { if (r() < M0.belumSokong) { undi++; } }
    var perlu = mt.sasaran === 'naib_presiden' ? M0.naibMin : M0.majoriti, menang = undi >= perlu;
    mt.hasil = { bertanding: true, undi: undi, perlu: perlu, menang: menang };
    ev.push({ jenis: 'dap', mesej: 'Mesyuarat Pertama JTP: anda memperoleh ' + undi + ' / ' + M0.ahli + ' undi untuk ' + CONFIG.SASARAN[mt.sasaran] + (menang ? '. Anda dipilih.' : ' (perlu ' + perlu + '). Anda kekal Ahli JTP.') });
    if (menang && mt.sasaran === 'presiden') { m.penggalSA = penggalSA({ dap: m }) + 1; }
    return menang ? mt.sasaran : null;
  }

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
    var m = st(p), own = kodPL(p), Y = parseInt(p.tahun, 10), B = parseInt(p.bulan, 10) || 1, H = CONFIG.HUB, kesan = {}, menangJTP = null;
    Object.keys(m.pusat).forEach(function (k) { var asal = k === own ? CONFIG.PUSAT.sendiri : 40; m.pusat[k] = Math.round((m.pusat[k] + (asal - m.pusat[k]) * 0.02) * 10) / 10; });
    // v13.38: Kongres ditangguh automatik jika dalam 24 bulan sebelum PRU (Fasal VIII.1(c))
    var pru = p.pru || {}, pruIdx = (parseInt(pru.tahunPRU, 10) || 0) * 12 + (parseInt(pru.bulanPRU, 10) || 1), kIdx = Y * 12 + CONFIG.BULAN_PUSAT;
    if (B === 1 && adalahTahunPemilihan(p, Y) && pruIdx > kIdx && pruIdx - kIdx <= CONFIG.TANGGUH_BULAN && m.tangguhDari !== Y) {
      m.tangguhDari = Y; m.asas = (parseInt(pru.tahunPRU, 10) || Y) + 1;
      ev.push({ jenis: 'dap', mesej: 'JTP menangguhkan Kongres Kebangsaan ' + Y + ' kerana PRU dijangka dalam 24 bulan; Kongres diadakan pada ' + m.asas + ' (Perlembagaan DAP, Fasal VIII.1(c)).' });
    }
    // v13.38: Mesyuarat Pertama JTP (bulan 4) dan keputusan (bulan 5)
    if (adalahTahunPemilihan({ dap: m }, Y) && B === CONFIG.MESYUARAT.bulan) { bukaMesyuarat(p, m, ev); }
    if (B === CONFIG.MESYUARAT.bulan + 1) { menangJTP = selesaiMesyuarat(p, m, ev); }
    // v13.38: Hubungan JTP: caruman elaun (Fasal IV.12(a)), Integriti, hukuman Jawatankuasa Tatatertib
    var hb = hubJTP({ dap: m }), sts = [pru.status, pru.statusKedua].filter(function (x) { return x && (x.jenis === 'MP' || x.jenis === 'ADUN'); });
    var car = sts.reduce(function (t, x) { return t + Math.round((CONFIG.CARUMAN[x.jenis] || 0) * CONFIG.CARUMAN.kadar); }, 0);
    if (car > 0) { kesan.myr = -car; hb += H.caruman; }
    var ig = p.integriti && typeof p.integriti.skor === 'number' ? p.integriti.skor : 50; if (ig < 40) { hb += H.integritiRendah; }
    var hk = p.etika && p.etika.hukuman, kunci = hk ? hk.jenis + '|' + hk.tahun + '|' + hk.bulan : null;
    if (kunci && kunci !== m.hukumKunci) { m.hukumKunci = kunci; if (hk.jenis !== 'amaran') { hb += H.hukum; ev.push({ jenis: 'dap', mesej: 'Hukuman Jawatankuasa Tatatertib menjejaskan Hubungan JTP anda (' + H.hukum + ').' }); } }
    m.hubJTP = Math.round(clamp(hb, 0, 100) * 10) / 10;
    var patch = { dap: m };
    if (menangJTP) { var J0 = J(), d = J0 && J0.cariDef ? J0.cariDef(menangJTP) : null; if (d) { Object.assign(patch, J0.terapkan(p, Object.assign({}, d, { jawatan: d.jawatan }), true)); } }
    S().applyEffects(kesan, { kiraTindakan: false, patch: patch });
    if (car > 0) { ev.push({ jenis: 'dap', mesej: 'Caruman elaun wakil rakyat kepada dana parti: RM ' + car + ' (Perlembagaan DAP, Fasal IV.12(a)).' }); }
    // v13.38: dipecat semasa wakil rakyat: kerusi dikosongkan (Fasal IV.12(c), ANDAIAN tafsiran)
    var pk = S().loadPlayer(), e = pk.etika || {}, s2 = pk.pru && [pk.pru.status, pk.pru.statusKedua].filter(function (x) { return x && (x.jenis === 'MP' || x.jenis === 'ADUN'); });
    if (e.status === 'dipecat' && s2 && s2.length) {
      var L = modul('MyPolitikLetak', 'letak.js');
      s2.forEach(function (x) {
        var hasil = L && L.letakKerusi ? L.letakKerusi(x.jenis) : null;
        if (!hasil || !hasil.ok) { var q = S().loadPlayer(), pr = Object.assign({}, q.pru); if (pr.status && pr.status.jenis === x.jenis) { pr.status = pr.statusKedua || null; pr.statusKedua = null; } else if (pr.statusKedua && pr.statusKedua.jenis === x.jenis) { pr.statusKedua = null; } S().applyEffects({}, { kiraTindakan: false, patch: { pru: pr } }); }
        ev.push({ jenis: 'dap', mesej: 'Anda dipecat daripada DAP: kerusi ' + (x.jenis === 'MP' ? 'Parlimen' : 'DUN') + ' ' + (x.kerusi || '') + ' dikosongkan (Perlembagaan DAP, Fasal IV.12(c)).' });
      });
    }
    segarPenyelaras();
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, adalah: adalah, kawasan: kawasan, sebabKuota: sebabKuota, ofset: ofset, lawan: lawan, kerajaanNegeriAwal: kerajaanNegeriAwal,
    adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya,
    sokonganBahagian: sokonganBahagian, perwakilan: perwakilan, ringkasPusat: ringkasPusat, bonusPusat: bonusPusat, statusJelajah: statusJelajah, jelajah: jelajah,
    lantikanSemasa: function () { return null; }, kerusiParlimen: kerusiParlimen, kadarDUN: kadarDUN, prosesBulan: prosesBulan,
    wakilCawangan: wakilCawangan, ahliParlimen: ahliParlimen, penyelaras: penyelaras, segarPenyelaras: segarPenyelaras, kerusiJawatan: kerusiJawatan, bonusJTP: bonusJTP,
    tahunKeahlian: tahunKeahlian, hubJTP: hubJTP, adjCalon: adjCalon, sekatanCalon: sekatanCalon, sekatanJawatan: sekatanJawatan, pencalonan: pencalonan, statusPencalonan: statusPencalonan, kumpulPencalonan: kumpulPencalonan,
    mesyuarat: mesyuarat, statusMesyuarat: statusMesyuarat, pilihSasaran: pilihSasaran, statusLobi: statusLobi, lobi: lobi, penggalSA: penggalSA };
});
