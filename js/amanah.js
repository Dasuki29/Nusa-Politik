/* ==========================================================================
   Nusa Politik — js/amanah.js   (v13.56)
   Parti Amanah Negara (AMANAH), komponen Pakatan Harapan (PH), MOD PENUH menggunakan enjin UMNO (seperti PKR / DAP), mockup Amanah (dipersetujui).
   Struktur ikut Perlembagaan Parti Amanah Negara 2022:
     - Fasal 10: Cawangan -> Kawasan -> Negeri -> Nasional. Fasal 16.3: Jawatankuasa Pimpinan Kawasan (Ketua, Timbalan Ketua, Naib Ketua ...);
       Fasal 16.4: Jawatankuasa Pimpinan Cawangan (Ketua, Timbalan Ketua ...). Kunci dalaman enjin Bahagian = Kawasan (istilah dalam js/parti.js).
     - Fasal 11.2(e), 14.1(e): pemilihan setiap 3 tahun. Pemilihan 2026 ditangguh (Februari 2026) -> ANDAIAN kitaran bermula 2028.
     - Fasal 12.1(d): Ketua Kawasan + 4 perwakilan setiap Kawasan ke Konvensyen Nasional (5 wakil setiap Kawasan).
     - Fasal 17.1: Konvensyen Nasional memilih 27 ahli Jawatankuasa Pimpinan Nasional (JPN); mesyuarat 27 + 3 ketua sayap + 14 Pengerusi Negeri
       (44 orang) memilih Presiden, Timbalan Presiden dan tidak lebih 3 Naib Presiden dari kalangan 27 itu. Presiden maksimum 3 penggal berturut-turut.
     - Fasal 14.1, 17.2: Konvensyen Negeri (dipertandingkan; mockup jawapan 2): Pengerusi, Timbalan Pengerusi, Naib Pengerusi Negeri.
     - Fasal 21: AWAN (wanita), Pemuda Amanah (40 tahun ke bawah), WARDA (wanita muda 35 tahun ke bawah). Fasal 4.2(a): umur minimum 18.
     - Fasal 23.7: JPN boleh mengarahkan Ahli Parlimen / ADUN mencarum daripada elaun (ANDAIAN kadar 10%).
   ANDAIAN takwim: Cawangan bulan 6, Kawasan bulan 8, Konvensyen Negeri bulan 10, Konvensyen Nasional bulan 11, Mesyuarat JPN bulan 12 (keputusan bulan 1).
   ANDAIAN: kuota Amanah dalam PH 32 Parlimen (sasaran PRU16) dan 60 DUN; meter Naratif Rahmah (Islam progresif menentang PAS di kerusi Melayu).
   State: p.amanah = { pusat:{kod:sokongan}, jelajahBulan, jpn:{tahun,sasaran,sokong,belum,lawan,lobiBulan,lobiBil,hasil}, hubJPN, hubTahunJPN, penggalPresiden,
     naratif, ceramahBulan, negeri:{tahun,sasaran,hasil,jawatan,nama}, hukumKunci }
   SEMUA ANGKA BERTANDA ANDAIAN IALAH ANDAIAN PERMAINAN. Permainan simulasi; bukan laman rasmi parti.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikAmanah = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function J() { return modul('MyPolitikJawatan', 'jawatan.js'); }
  function DATA() { return modul('MyPolitikAmanahData', 'amanah-data.js') || { parlimen: {}, dun: {} }; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(t, b) { return (parseInt(t, 10) || 0) * 12 + (parseInt(b, 10) || 1); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  var CONFIG = {
    KUOTA_PARLIMEN: 32, KUOTA_DUN: 60,                                     // ANDAIAN: sasaran PRU16 32 kerusi Parlimen (BH, Nov 2026)
    TAHUN_MULA: 2028, KITARAN_TAHUN: 3, BULAN_PUSAT: 11,                   // Fasal 11.2(e); ANDAIAN 2028 (pemilihan 2026 ditangguh)
    WAKIL_PUSAT: 210,                                                       // Fasal 12.1(a)(b)(c)(e)(f)(g): Speaker, JPN, 7 x 14 Negeri, 60 wakil sayap (ANDAIAN anggaran)
    PUSAT: { sendiri: 60, lain: [30, 45], bonusSkala: 0.3, jelajahAP: 2, jelajahMYR: 1500, jelajahNaik: 8 },
    JPN: { kerusi: 27, naib: 3 },                                           // Fasal 17.1(a), 17.1(b)
    MESYUARAT: { bulan: 12, ahli: 44, majoriti: 23, naibMin: 8, lobiAP: 2, lobiMYR: 500, lobiMaks: 3, lobiPeluang: 0.6, belumSokong: 0.4, pengerusiNegeri: 2 },
    SASARAN: { presiden: 'Presiden', timbalan_presiden: 'Timbalan Presiden', naib_presiden: 'Naib Presiden' },
    PRESIDEN_PENGGAL: 3,                                                    // Fasal 17.1(b)
    HUB: { asas: 50, ahliJPN: 10, caruman: 0.5, lobi: 1, hukum: -10, integritiRendah: -1, calon: 0.15, negeri: 5 },
    CARUMAN: { kadar: 0.1, MP: 2500, ADUN: 1500 },                          // Fasal 23.7 (ANDAIAN kadar)
    NEGERI: { bulan: [9, 10], keputusan: 11, ambang: { pengerusi: 50, timbalan: 42, naib: 35 }, ip: { pengerusi: 60, timbalan: 40, naib: 25 }, bonusPusat: { pengerusi: 3, timbalan: 2, naib: 1 } },
    NAMA_NEGERI: { pengerusi: 'Pengerusi Negeri', timbalan: 'Timbalan Pengerusi Negeri', naib: 'Naib Pengerusi Negeri' },
    NARATIF: { awal: 50, ap: 2, myr: 1500, naik: 4, susut: 1, ofset: 3 },
    /* ANDAIAN: peratus kerusi DUN blok kerajaan (PH + rakan Kerajaan Perpaduan) asas setiap negeri, sama seperti js/dap.js. */
    DUN_ASAS: { '10': 0.64, '7': 0.72, '5': 0.86, '8': 0.56, '4': 0.93, '1': 0.93, '6': 0.6, '12': 0.45, '2': 0.08, '3': 0.04, '11': 0.02, '9': 0.07, '13': 0.05 },
    KERAJAAN_NEGERI: ['Selangor', 'Pulau Pinang', 'Negeri Sembilan'],
    RAKAN: [
      { kod: 'PKR', nama: 'PKR', penuh: 'Parti Keadilan Rakyat', logo: 'assets/images/logo-pkr.png' },
      { kod: 'DAP', nama: 'DAP', penuh: 'Parti Tindakan Demokratik', logo: 'assets/images/logo-dap.svg' }
    ]
  };

  function adalah(p) { return !!(p && p.parti === 'AMANAH'); }
  function st(p) {
    var m = p && p.amanah && typeof p.amanah === 'object' ? p.amanah : {};
    if (!m.pusat || typeof m.pusat !== 'object') { m.pusat = {}; }
    if (typeof m.naratif !== 'number') { m.naratif = CONFIG.NARATIF.awal; }
    return m;
  }
  function simpan(p, m, kesan, log) { return S().applyEffects(kesan || {}, { kiraTindakan: !!(log && log.kira), patch: { amanah: m }, log: log && log.nama ? { tindakan: log.tindakan || 'amanah', nama: log.nama, peringkat: log.peringkat || 'ahli' } : undefined }); }
  function kodPL(p) { var k = p && p.kod && p.kod.parlimen; return k ? 'P.' + String(parseInt(k, 10)).padStart(3, '0') : null; }
  function idxP(p) { return idx(p.tahun, p.bulan); }

  /* ---------- Kawasan & kuota PH (antara muka sama seperti MCA / PAS / PKR / DAP untuk js/pru.js) ---------- */
  function kawasan(p) {
    var d = DATA(), kp = kodPL(p), pl = kp ? d.parlimen[kp] : null, dn = null;
    if (pl && p.kod && p.kod.dun && parseInt(p.kod.dun, 10) > 0) { var kd = pl.ng + '_N.' + String(parseInt(p.kod.dun, 10)).padStart(2, '0'); dn = d.dun[kd] ? Object.assign({ kod: kd }, d.dun[kd]) : null; }
    return { parlimen: pl ? Object.assign({ kod: kp }, pl) : null, dun: dn,
      kuotaPL: !!(pl && pl.r <= CONFIG.KUOTA_PARLIMEN), kuotaDUN: !!(dn && dn.r <= CONFIG.KUOTA_DUN), bilBahagian: Object.keys(d.parlimen).length };
  }
  function sebabKuota(p, jenis) {
    return jenis === 'PARLIMEN' ? 'Kerusi Parlimen anda di luar kuota AMANAH dalam PH (kuota ' + CONFIG.KUOTA_PARLIMEN + ' kerusi; kerusi ini untuk rakan PH)'
      : 'Kerusi DUN anda di luar kuota AMANAH dalam PH (kuota ' + CONFIG.KUOTA_DUN + ' kerusi; kerusi ini untuk rakan PH)';
  }
  /** Ofset kekuatan kerusi PRU (ANDAIAN): Amanah kuat di kawasan campuran; di kerusi Melayu (Bumiputera 50%+) Naratif Rahmah menentukan saingan dengan PAS. */
  function ofset(p, jenis) {
    var k = kawasan(p), m = jenis === 'DUN' ? (k.dun && k.dun.m) : (k.parlimen && k.parlimen.m); if (!m) { return 0; }
    var asas = m < 45 ? -1 : m < 70 ? 2 : -3, n = st(p).naratif;
    return Math.round((asas + (m >= 50 ? (n - 50) / 50 * CONFIG.NARATIF.ofset : 0)) * 10) / 10;
  }
  function lawan(p, jenis) { var k = kawasan(p), m = jenis === 'DUN' ? (k.dun && k.dun.m) : (k.parlimen && k.parlimen.m); return m >= 50 ? ['PAS', 'Bersatu'] : ['Bersatu', 'Gerakan']; }
  function kerajaanNegeriAwal(nama) { return CONFIG.KERAJAAN_NEGERI.some(function (n) { return n.toLowerCase() === String(nama || '').toLowerCase(); }); }

  /* ---------- Kitaran 3 tahun (Fasal 11.2(e)) ---------- */
  function adalahTahunPemilihan(p, tahun) { var t = parseInt(tahun, 10); return t >= CONFIG.TAHUN_MULA && (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN === 0; }
  function tahunSeterusnya(p, tahun) { var t = parseInt(tahun, 10); if (t <= CONFIG.TAHUN_MULA) { return CONFIG.TAHUN_MULA; } var b = (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN; return b === 0 ? t : t + CONFIG.KITARAN_TAHUN - b; }
  function tahunLepas(p, tahun) { var t = parseInt(tahun, 10); return t < CONFIG.TAHUN_MULA ? null : t - ((t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN); }

  /* ---------- Konvensyen Nasional: Wakil Kawasan (Fasal 12.1(d)) ---------- */
  function sokonganBahagian(p) {
    var d = DATA(), m = st(p), own = kodPL(p), out = {};
    Object.keys(d.parlimen).forEach(function (k) {
      var v = m.pusat[k];
      if (typeof v !== 'number') { var c = CONFIG.PUSAT.lain; v = k === own ? CONFIG.PUSAT.sendiri : c[0] + (hash(String(p.id) + '|amanah|' + k) % (c[1] - c[0] + 1)); }
      out[k] = v;
    });
    return out;
  }
  function perwakilan(kod) { var x = DATA().parlimen[kod]; return x && x.w ? x.w : 0; }
  function ringkasPusat(p) {
    var sb = sokonganBahagian(p), d = DATA(), ks = Object.keys(sb), jum = 0, condong = 0, pengundi = 0;
    ks.forEach(function (k) { var w = perwakilan(k); pengundi += w; jum += sb[k] * w; if (sb[k] >= 50) { condong++; } });
    var purata = pengundi ? jum / pengundi : 0;
    return { purata: Math.round(purata * 10) / 10, condong: condong, bilBahagian: ks.length, wakilKawasan: pengundi, pengundi: pengundi + CONFIG.WAKIL_PUSAT,
      sokongUndi: Math.round((pengundi + CONFIG.WAKIL_PUSAT) * purata / 100),
      senarai: ks.map(function (k) { return { kod: k, nama: d.parlimen[k].n, neg: d.parlimen[k].neg, sokongan: Math.round(sb[k]), wakil: perwakilan(k) }; }).sort(function (a, b) { return a.sokongan - b.sokongan || a.nama.localeCompare(b.nama); }) };
  }
  function jawatanNegeri(p) { var n = st(p).negeri; return n && n.jawatan ? n : null; }
  function bonusPusat(p) {
    if (!adalah(p)) { return 0; }
    var jn = jawatanNegeri(p), b = jn ? CONFIG.NEGERI.bonusPusat[jn.jawatan] || 0 : 0;
    return Math.round(((ringkasPusat(p).purata - 40) * CONFIG.PUSAT.bonusSkala + b) * 10) / 10;
  }
  function statusJelajah(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk AMANAH.' }; }
    var J0 = J(); if (!J0 || J0.pangkatTertinggi(p) < 6) { return { boleh: false, sebab: 'Perlu Naib Ketua Kawasan atau lebih untuk berkempen di peringkat Negeri dan Nasional.' }; }
    var m = st(p); if (m.jelajahBulan === idxP(p)) { return { boleh: false, sebab: 'Jelajah Kawasan sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < CONFIG.PUSAT.jelajahAP) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < CONFIG.PUSAT.jelajahMYR) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function jelajah(kod) {
    var p = S().loadPlayer(), s0 = statusJelajah(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var d = DATA(); if (!d.parlimen[kod]) { return { ok: false, ralat: 'Kawasan tidak sah.' }; }
    var m = st(p), sb = sokonganBahagian(p), baru = clamp(sb[kod] + CONFIG.PUSAT.jelajahNaik, 0, 100);
    m.pusat[kod] = baru; m.jelajahBulan = idxP(p);
    var r = simpan(p, m, { ap: -CONFIG.PUSAT.jelajahAP, myr: -CONFIG.PUSAT.jelajahMYR }, { kira: true, tindakan: 'amanah_jelajah', nama: 'Jelajah Kawasan ' + d.parlimen[kod].n });
    return r.ok ? { ok: true, mesej: 'Jelajah Kawasan ' + d.parlimen[kod].n + ': sokongan perwakilan ' + Math.round(sb[kod]) + '% → ' + Math.round(baru) + '%.' } : { ok: false, ralat: r.ralat };
  }
  /** Bilangan kerusi enjin bagi jawatan pusat Amanah: Ahli JPN 27 (Fasal 17.1(a)), Naib Presiden 3 (Fasal 17.1(b)). */
  function kerusiJawatan(p, d) { if (!adalah(p) || !d) { return null; } return d.kod === 'ahli_mkt' ? CONFIG.JPN.kerusi : d.kod === 'naib_presiden' ? CONFIG.JPN.naib : null; }

  /* ---------- Hubungan JPN & calon PRU ---------- */
  function tahunKeahlian(p) { var k = p && p.keahlian; if (!k) { return 99; } return ((parseInt(p.tahun, 10) * 12 + (parseInt(p.bulan, 10) || 1)) - ((parseInt(k.sejakTahun, 10) || p.tahun) * 12 + (parseInt(k.sejakBulan, 10) || 1))) / 12; }
  function hubJPN(p) { var m = st(p); return typeof m.hubJPN === 'number' ? m.hubJPN : CONFIG.HUB.asas; }
  function adjCalon(p) { return adalah(p) ? Math.round((hubJPN(p) - 50) / 50 * CONFIG.HUB.calon * 1000) / 1000 : 0; }
  function pegangKod(p, kod) { var J0 = J(); return !!(J0 && J0.getJawatan && J0.getJawatan(p).some(function (j) { return j.kod === kod; })); }
  function penggalPresiden(p) { return Number(st(p).penggalPresiden) || 0; }
  /** Sekatan jawatan (js/jawatan.js): Presiden, Timbalan Presiden dan Naib Presiden dipilih dalam Mesyuarat JPN, bukan di Konvensyen (Fasal 17.1(b)). */
  function sekatanJawatan(p, d) {
    if (!adalah(p) || !d) { return null; }
    if (CONFIG.SASARAN[d.kod]) { return CONFIG.SASARAN[d.kod] + ' dipilih oleh mesyuarat 44 orang (27 ahli JPN dipilih, 3 ketua sayap dan 14 Pengerusi Negeri) dari kalangan 27 ahli JPN, bukan di Konvensyen Nasional (Perlembagaan Amanah, Fasal 17.1(b)). Menangi kerusi Ahli JPN dahulu.'; }
    return null;
  }

  /* ---------- Mesyuarat JPN (Fasal 17.1(b)): bulan 12 tahun pemilihan, keputusan bulan 1 ---------- */
  function mesyuarat(p) { var m = st(p), Y = parseInt(p.tahun, 10); return m.jpn && (m.jpn.tahun === Y || (m.jpn.tahun === Y - 1 && (parseInt(p.bulan, 10) || 1) === 1)) ? m.jpn : null; }
  function bukaMesyuarat(p, m, ev) {
    var Y = parseInt(p.tahun, 10); if (m.jpn && m.jpn.tahun === Y) { return; }
    var J0 = J(), aj = J0 && J0.getJawatan ? J0.getJawatan(p).filter(function (j) { return j.kod === 'ahli_mkt' && j.tahun === Y; })[0] : null; if (!aj) { return; }
    if (m.hubTahunJPN !== Y) { m.hubJPN = clamp(hubJPN(p) + CONFIG.HUB.ahliJPN, 0, 100); m.hubTahunJPN = Y; }
    var M0 = CONFIG.MESYUARAT, lain = M0.ahli - 1, h = hubJPN({ amanah: m }), jn = m.negeri && m.negeri.jawatan === 'pengerusi' && m.negeri.tahun === Y ? M0.pengerusiNegeri : 0;
    var sok = clamp(Math.round(lain * (0.25 + (h - 50) / 150 + ((Number(p.reputasi) || 50) - 50) / 300)) + jn, 4, 30), law = Math.round((lain - sok) * 0.5);
    m.jpn = { tahun: Y, sasaran: null, sokong: sok, lawan: law, belum: lain - sok - law, lobiBulan: null, lobiBil: 0, hasil: null };
    ev.push({ jenis: 'amanah', mesej: 'Mesyuarat JPN dibuka: pilih jawatan sasaran dan lobi ahli mesyuarat bulan ini (' + sok + ' menyokong, ' + m.jpn.belum + ' belum memutuskan).' });
  }
  function statusMesyuarat(p) {
    var mt = mesyuarat(p); if (!adalah(p) || !mt) { return { boleh: false, sebab: 'Mesyuarat JPN dibuka pada bulan ' + CONFIG.MESYUARAT.bulan + ' selepas anda menang kerusi Ahli JPN di Konvensyen Nasional.' }; }
    if (mt.hasil) { return { boleh: false, sebab: 'Mesyuarat JPN sudah selesai.' }; }
    if ((parseInt(p.bulan, 10) || 1) !== CONFIG.MESYUARAT.bulan) { return { boleh: false, sebab: 'Mesyuarat JPN diadakan pada bulan ' + CONFIG.MESYUARAT.bulan + '.' }; }
    return { boleh: true, sebab: '' };
  }
  function pilihSasaran(kod) {
    var p = S().loadPlayer(), s0 = statusMesyuarat(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    if (kod && !CONFIG.SASARAN[kod]) { return { ok: false, ralat: 'Jawatan tidak sah.' }; }
    if (kod === 'presiden' && penggalPresiden(p) >= CONFIG.PRESIDEN_PENGGAL) { return { ok: false, ralat: 'Presiden tidak boleh memegang jawatan melebihi 3 penggal berturut-turut (Perlembagaan Amanah, Fasal 17.1(b)).' }; }
    var m = st(p); m.jpn.sasaran = kod || null;
    var x = simpan(p, m, {}); return x.ok ? { ok: true, mesej: kod ? 'Sasaran anda dalam Mesyuarat JPN: ' + CONFIG.SASARAN[kod] + '.' : 'Anda tidak bertanding jawatan pimpinan dalam Mesyuarat JPN.' } : { ok: false, ralat: x.ralat };
  }
  function statusLobi(p) {
    var s0 = statusMesyuarat(p); if (!s0.boleh) { return s0; }
    var mt = mesyuarat(p), M0 = CONFIG.MESYUARAT; if (!mt.sasaran) { return { boleh: false, sebab: 'Pilih jawatan sasaran dahulu.' }; }
    if (mt.belum <= 0) { return { boleh: false, sebab: 'Semua ahli mesyuarat sudah membuat keputusan.' }; }
    if (mt.lobiBulan === idxP(p) && mt.lobiBil >= M0.lobiMaks) { return { boleh: false, sebab: 'Lobi maksimum 3 kali sebulan.' }; }
    if ((Number(p.ap) || 0) < M0.lobiAP) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < M0.lobiMYR) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function lobi(o) {
    var p = S().loadPlayer(), s0 = statusLobi(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), mt = m.jpn, M0 = CONFIG.MESYUARAT, r = (o && o.rng) || Math.random;
    if (mt.lobiBulan !== idxP(p)) { mt.lobiBulan = idxP(p); mt.lobiBil = 0; } mt.lobiBil++;
    var n = 0; for (var i = 0; i < 3 && mt.belum > 0; i++) { if (r() < M0.lobiPeluang) { mt.belum--; mt.sokong++; n++; } }
    m.hubJPN = clamp(hubJPN(p) + CONFIG.HUB.lobi, 0, 100);
    var x = simpan(p, m, { ap: -M0.lobiAP, myr: -M0.lobiMYR }, { kira: true, tindakan: 'amanah_lobi', nama: 'Lobi ahli Mesyuarat JPN' });
    return x.ok ? { ok: true, jadi: n > 0, mesej: n ? n + ' ahli mesyuarat bersetuju menyokong anda (' + mt.sokong + ' menyokong).' : 'Ahli mesyuarat yang dilobi belum membuat keputusan.' } : { ok: false, ralat: x.ralat };
  }
  function selesaiMesyuarat(p, m, ev) {
    var mt = m.jpn; if (!mt || mt.hasil) { return null; }
    var M0 = CONFIG.MESYUARAT, r = S().rngBerbenih(hash(String(p.id) + '|jpn|' + mt.tahun)), undi = 1 + mt.sokong;
    if (!mt.sasaran) { mt.hasil = { bertanding: false }; return null; }
    for (var i = 0; i < mt.belum; i++) { if (r() < M0.belumSokong) { undi++; } }
    var perlu = mt.sasaran === 'naib_presiden' ? M0.naibMin : M0.majoriti, menang = undi >= perlu;
    mt.hasil = { bertanding: true, undi: undi, perlu: perlu, menang: menang };
    ev.push({ jenis: 'amanah', mesej: 'Mesyuarat JPN: anda memperoleh ' + undi + ' / ' + M0.ahli + ' undi untuk ' + CONFIG.SASARAN[mt.sasaran] + (menang ? '. Anda dipilih.' : ' (perlu ' + perlu + '). Anda kekal Ahli JPN.') });
    if (menang && mt.sasaran === 'presiden') { m.penggalPresiden = penggalPresiden({ amanah: m }) + 1; }
    return menang ? mt.sasaran : null;
  }

  /* ---------- Konvensyen Negeri (Fasal 14.1, 17.2): dipertandingkan oleh pemegang jawatan Kawasan ---------- */
  function negeriPemain(p) { var x = DATA().parlimen[kodPL(p)]; return x ? x.neg : null; }
  function ringkasNegeri(p) {
    var d = DATA(), neg = negeriPemain(p), sb = sokonganBahagian(p), ks = Object.keys(d.parlimen).filter(function (k) { return d.parlimen[k].neg === neg; });
    var jum = ks.reduce(function (t, k) { return t + sb[k]; }, 0);
    return { negeri: neg, kawasan: ks.length, perwakilan: ks.length * 10, purata: ks.length ? Math.round(jum / ks.length * 10) / 10 : 0 };
  }
  function layakNegeri(p) { var J0 = J(); return !!(J0 && J0.pangkatTertinggi(p) >= 6); }
  function statusNegeri(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk AMANAH.' }; }
    var Y = parseInt(p.tahun, 10), B = parseInt(p.bulan, 10) || 1, N = CONFIG.NEGERI;
    if (!adalahTahunPemilihan(p, Y)) { return { boleh: false, sebab: 'Konvensyen Negeri memilih Jawatankuasa Pimpinan Negeri setiap 3 tahun (seterusnya ' + tahunSeterusnya(p, Y + 1) + ').' }; }
    if (B < N.bulan[0] || B > N.bulan[1]) { return { boleh: false, sebab: 'Pencalonan Konvensyen Negeri dibuka pada bulan ' + N.bulan[0] + ' hingga ' + N.bulan[1] + '; keputusan awal bulan ' + N.keputusan + '.' }; }
    if (!layakNegeri(p)) { return { boleh: false, sebab: 'Perlu memegang jawatan Kawasan (Naib Ketua Kawasan atau lebih) untuk bertanding di Konvensyen Negeri.' }; }
    var n = st(p).negeri; if (n && n.tahun === Y && n.hasil) { return { boleh: false, sebab: 'Konvensyen Negeri tahun ini sudah selesai.' }; }
    return { boleh: true, sebab: '' };
  }
  function pilihNegeri(kod) {
    var p = S().loadPlayer(), s0 = statusNegeri(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    if (kod && !CONFIG.NAMA_NEGERI[kod]) { return { ok: false, ralat: 'Jawatan tidak sah.' }; }
    var m = st(p), Y = parseInt(p.tahun, 10), lama = m.negeri && m.negeri.tahun !== Y ? m.negeri : null;
    m.negeri = { tahun: Y, sasaran: kod || null, hasil: null, jawatan: lama ? null : (m.negeri && m.negeri.jawatan) || null, nama: negeriPemain(p) };
    var x = simpan(p, m, {}); return x.ok ? { ok: true, mesej: kod ? 'Anda bertanding ' + CONFIG.NAMA_NEGERI[kod] + ' ' + m.negeri.nama + ' di Konvensyen Negeri.' : 'Anda tidak bertanding di Konvensyen Negeri.' } : { ok: false, ralat: x.ralat };
  }
  function selesaiNegeri(p, m, ev) {
    var n = m.negeri, Y = parseInt(p.tahun, 10); if (!n || n.tahun !== Y || n.hasil) { return null; }
    if (!n.sasaran) { n.hasil = { bertanding: false }; n.jawatan = null; return null; }
    var rn = ringkasNegeri(p), r = S().rngBerbenih(hash(String(p.id) + '|negeri|' + Y)), skor = Math.round((rn.purata + ((Number(p.reputasi) || 50) - 50) / 5 + (r() * 12 - 6)) * 10) / 10;
    var amb = CONFIG.NEGERI.ambang[n.sasaran], menang = skor >= amb;
    n.hasil = { bertanding: true, skor: clamp(skor, 0, 100), perlu: amb, menang: menang }; n.jawatan = menang ? n.sasaran : null;
    ev.push({ jenis: 'amanah', mesej: 'Konvensyen Negeri ' + n.nama + ': anda memperoleh ' + Math.round(clamp(skor, 0, 100)) + '% undi perwakilan untuk ' + CONFIG.NAMA_NEGERI[n.sasaran] + (menang ? '. Anda dipilih.' : ' (perlu ' + amb + '%).') });
    if (menang) { m.hubJPN = clamp(hubJPN({ amanah: m }) + CONFIG.HUB.negeri, 0, 100); return n.sasaran; }
    return null;
  }

  /* ---------- Naratif Rahmah (ANDAIAN) ---------- */
  function statusCeramah(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk AMANAH.' }; }
    var m = st(p); if (m.ceramahBulan === idxP(p)) { return { boleh: false, sebab: 'Sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < CONFIG.NARATIF.ap) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < CONFIG.NARATIF.myr) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function ceramah() {
    var p = S().loadPlayer(), s0 = statusCeramah(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), a = m.naratif, C = CONFIG.NARATIF; m.naratif = clamp(a + C.naik, 0, 100); m.ceramahBulan = idxP(p);
    var r = simpan(p, m, { ap: -C.ap, myr: -C.myr }, { kira: true, tindakan: 'amanah_ceramah', nama: 'Ceramah Rahmah' });
    return r.ok ? { ok: true, mesej: 'Ceramah Rahmah tentang Islam yang inklusif dan progresif mendapat sambutan. Naratif Rahmah ' + Math.round(a) + ' → ' + Math.round(m.naratif) + '.' } : { ok: false, ralat: r.ralat };
  }

  /* ---------- Anggaran kerusi PH (js/paparan.js anggarKerusi, js/pru.js janaNasional): sama seperti js/dap.js ---------- */
  function kerusiParlimen(pop, rng) {
    var J0 = 222, parti = clamp(Math.round(J0 * (0.24 + (pop - 30) / 40 * 0.3) + (rng() * 16 - 8)), 30, 150);
    return { parti: parti, rakan: Math.min(J0 - parti, Math.round(J0 * (0.12 + rng() * 0.04))) };
  }
  function kadarDUN(kodNegeri, pop, rng) {
    var a = CONFIG.DUN_ASAS[String(kodNegeri)]; if (a == null) { a = 0.3; }
    return clamp(a + ((Number(pop) || 45) - 45) / 100 + (rng() * 0.1 - 0.05), 0.02, 0.98);
  }

  /* ---------- Bulanan ---------- */
  function prosesBulan() {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat || !adalah(p)) { return { peristiwa: ev }; }
    var m = st(p), own = kodPL(p), Y = parseInt(p.tahun, 10), B = parseInt(p.bulan, 10) || 1, H = CONFIG.HUB, kesan = {}, menangJPN = null, menangNegeri = null;
    Object.keys(m.pusat).forEach(function (k) { var asal = k === own ? CONFIG.PUSAT.sendiri : 40; m.pusat[k] = Math.round((m.pusat[k] + (asal - m.pusat[k]) * 0.02) * 10) / 10; });
    if (m.naratif > CONFIG.NARATIF.awal) { m.naratif = Math.max(CONFIG.NARATIF.awal, m.naratif - CONFIG.NARATIF.susut); } else if (m.naratif < CONFIG.NARATIF.awal) { m.naratif = Math.min(CONFIG.NARATIF.awal, m.naratif + CONFIG.NARATIF.susut); }
    // Konvensyen Negeri: keputusan awal bulan 11
    if (adalahTahunPemilihan(p, Y) && B === CONFIG.NEGERI.keputusan) { menangNegeri = selesaiNegeri(p, m, ev); }
    // Mesyuarat JPN: dibuka bulan 12, keputusan bulan 1 tahun berikutnya
    if (adalahTahunPemilihan(p, Y) && B === CONFIG.MESYUARAT.bulan) { bukaMesyuarat(p, m, ev); }
    if (B === 1 && m.jpn && m.jpn.tahun === Y - 1) { menangJPN = selesaiMesyuarat(p, m, ev); }
    // Hubungan JPN: caruman elaun (Fasal 23.7), Integriti, hukuman Lembaga Tatatertib (Fasal 22)
    var pru = p.pru || {}, hb = hubJPN({ amanah: m }), sts = [pru.status, pru.statusKedua].filter(function (x) { return x && (x.jenis === 'MP' || x.jenis === 'ADUN'); });
    var car = sts.reduce(function (t, x) { return t + Math.round((CONFIG.CARUMAN[x.jenis] || 0) * CONFIG.CARUMAN.kadar); }, 0);
    if (car > 0) { kesan.myr = -car; hb += H.caruman; }
    var ig = p.integriti && typeof p.integriti.skor === 'number' ? p.integriti.skor : 50; if (ig < 40) { hb += H.integritiRendah; }
    var hk = p.etika && p.etika.hukuman, kunci = hk ? hk.jenis + '|' + hk.tahun + '|' + hk.bulan : null;
    if (kunci && kunci !== m.hukumKunci) { m.hukumKunci = kunci; if (hk.jenis !== 'amaran') { hb += H.hukum; ev.push({ jenis: 'amanah', mesej: 'Tindakan Lembaga Tatatertib menjejaskan Hubungan JPN anda (' + H.hukum + ').' }); } }
    m.hubJPN = Math.round(clamp(hb, 0, 100) * 10) / 10;
    var patch = { amanah: m };
    if (menangJPN) { var J0 = J(), d = J0 && J0.cariDef ? J0.cariDef(menangJPN) : null; if (d) { Object.assign(patch, J0.terapkan(p, Object.assign({}, d, { jawatan: d.jawatan }), true)); } }
    if (menangNegeri) { kesan.ip = (kesan.ip || 0) + (CONFIG.NEGERI.ip[menangNegeri] || 0); kesan.reputasi = (kesan.reputasi || 0) + 2; }
    S().applyEffects(kesan, { kiraTindakan: false, patch: patch });
    if (car > 0) { ev.push({ jenis: 'amanah', mesej: 'Caruman elaun wakil rakyat kepada dana parti: RM ' + car + ' (Perlembagaan Amanah, Fasal 23.7).' }); }
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, adalah: adalah, kawasan: kawasan, sebabKuota: sebabKuota, ofset: ofset, lawan: lawan, kerajaanNegeriAwal: kerajaanNegeriAwal,
    adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya,
    sokonganBahagian: sokonganBahagian, perwakilan: perwakilan, ringkasPusat: ringkasPusat, bonusPusat: bonusPusat, statusJelajah: statusJelajah, jelajah: jelajah,
    lantikanSemasa: function () { return null; }, kerusiParlimen: kerusiParlimen, kadarDUN: kadarDUN, prosesBulan: prosesBulan, kerusiJawatan: kerusiJawatan,
    tahunKeahlian: tahunKeahlian, hubJPN: hubJPN, adjCalon: adjCalon, sekatanJawatan: sekatanJawatan, penggalPresiden: penggalPresiden,
    mesyuarat: mesyuarat, statusMesyuarat: statusMesyuarat, pilihSasaran: pilihSasaran, statusLobi: statusLobi, lobi: lobi,
    negeriPemain: negeriPemain, ringkasNegeri: ringkasNegeri, jawatanNegeri: jawatanNegeri, statusNegeri: statusNegeri, pilihNegeri: pilihNegeri,
    naratif: function (p) { return st(p).naratif; }, statusCeramah: statusCeramah, ceramah: ceramah };
});
