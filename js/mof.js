/* ==========================================================================
   Nusa Politik — js/mof.js   (v13.70)
   Modul Kementerian Kewangan (MOF Engine), mockup dipersetujui.
     State p.mof = { nationalTreasury (RM bilion), inflationRate (%), publicSatisfaction (0-100),
                     ministryBudgets { kod: RM bilion setahun }, hubungan { kod: 0-100 }, dasar { sst, pendapatan, minyak, barang },
                     draf { kod: langkah }, bajetTahun, dasarBulan, larasDewan, aliranLalu, kepuasanLalu }
     1. Tab "Pejabat MOF" hanya untuk pemegang portfolio Menteri Kewangan (js/mof-ui.js).
     2. Bajet Tahunan (bulan 9-10): laras peruntukan 6 kementerian, langkah 5%, had ±15%; dimuktamadkan sekali setahun.
     3. Cukai & Subsidi: satu perubahan dasar sebulan (SST, cukai pendapatan, subsidi bahan api, subsidi barangan asas).
     4. Bulanan: rizab += hasil cukai − subsidi − belanja kementerian; inflasi dan kepuasan bergerak ke arah sasaran dasar;
        kepuasan -> populariti nasional (kabinet.js); rizab < RM 10 bilion = krisis fiskal; menteri marah -> risiko rombakan.
   ANDAIAN: semua angka ialah anggaran permainan, bukan data rasmi.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikMOF = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function r1(n) { return Math.round(n * 10) / 10; }

  var CONFIG = {
    RIZAB_AWAL: 50, INFLASI_AWAL: 2.5, KEPUASAN_AWAL: 50, HASIL_ASAS: 6.0,             // RM bilion sebulan (petroleum, dividen, lain-lain)
    BULAN_BAJET: [9, 10], LANGKAH: 0.05, HAD_LANGKAH: 3,
    HUB_NAIK: 8, HUB_POTONG: 10, HUB_AWAL: 55, HUB_MARAH: 30,
    RIZAB_KRISIS: 10, KRISIS_RATING: -5, KRISIS_ROMBAK: 3, MARAH_ROMBAK: 3,
    LARAS_DEWAN: 0.01, LARAS_DEWAN_HAD: 0.05
  };
  var KEMENTERIAN = [
    { kod: 'pendidikan', nama: 'Pendidikan', bajet: 64.0, rakyat: true },
    { kod: 'kesihatan', nama: 'Kesihatan', bajet: 45.0, rakyat: true },
    { kod: 'pertahanan', nama: 'Pertahanan', bajet: 21.0 },
    { kod: 'dalamnegeri', nama: 'Dalam Negeri', bajet: 20.0 },
    { kod: 'kerjaraya', nama: 'Kerja Raya', bajet: 14.5 },
    { kod: 'luarbandar', nama: 'Luar Bandar', bajet: 11.0, rakyat: true }
  ];
  /* Tuil dasar: hasil/kos = RM bilion sebulan; inf = sumbangan kepada inflasi sasaran (mata %); puas = sumbangan kepada kepuasan sasaran. */
  var TUIL = {
    sst: { nama: 'SST', ikon: '🧾', jenis: 'cukai', pilihan: [
      { id: '6', label: '6%', hasil: 3.0, inf: -0.3, puas: 6 }, { id: '8', label: '8%', hasil: 4.0, inf: 0, puas: 0 }, { id: '10', label: '10%', hasil: 5.0, inf: 0.3, puas: -7 }] },
    pendapatan: { nama: 'Cukai pendapatan', ikon: '💼', jenis: 'cukai', pilihan: [
      { id: 'rendah', label: 'Rendah', hasil: 7.0, inf: 0, puas: 5 }, { id: 'sederhana', label: 'Sederhana', hasil: 8.5, inf: 0, puas: 0 }, { id: 'tinggi', label: 'Tinggi', hasil: 10.0, inf: 0, puas: -6 }] },
    minyak: { nama: 'Subsidi bahan api', ikon: '⛽', jenis: 'subsidi', pilihan: [
      { id: 'penuh', label: 'Penuh', kos: 3.0, inf: 0, puas: 8 }, { id: 'bersasar', label: 'Bersasar', kos: 1.5, inf: 0.8, puas: 0 }, { id: 'apung', label: 'Harga apung', kos: 0.3, inf: 1.8, puas: -10 }] },
    barang: { nama: 'Subsidi barangan asas', ikon: '🍚', jenis: 'subsidi', pilihan: [
      { id: 'penuh', label: 'Penuh', kos: 1.2, inf: -0.2, puas: 4 }, { id: 'bersasar', label: 'Bersasar', kos: 0.6, inf: 0, puas: 0 }, { id: 'tiada', label: 'Tiada', kos: 0, inf: 0.6, puas: -6 }] }
  };
  var URUTAN_TUIL = ['sst', 'pendapatan', 'minyak', 'barang'];

  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function dasar() {
    var b = {}, h = {};
    KEMENTERIAN.forEach(function (m) { b[m.kod] = m.bajet; h[m.kod] = CONFIG.HUB_AWAL; });
    return { nationalTreasury: CONFIG.RIZAB_AWAL, inflationRate: CONFIG.INFLASI_AWAL, publicSatisfaction: CONFIG.KEPUASAN_AWAL, ministryBudgets: b, hubungan: h,
      dasar: { sst: '8', pendapatan: 'sederhana', minyak: 'penuh', barang: 'bersasar' }, draf: {}, bajetTahun: 0, dasarBulan: 0, larasDewan: 0, aliranLalu: 0, kepuasanLalu: CONFIG.KEPUASAN_AWAL };
  }
  function getMOF(p) {
    var b = dasar(), m = p && p.mof && typeof p.mof === 'object' ? p.mof : {};
    for (var f in b) { if (m[f] === undefined) { m[f] = b[f]; } }
    KEMENTERIAN.forEach(function (k) { if (m.ministryBudgets[k.kod] === undefined) { m.ministryBudgets[k.kod] = k.bajet; } if (m.hubungan[k.kod] === undefined) { m.hubungan[k.kod] = CONFIG.HUB_AWAL; } });
    return m;
  }
  function simpan(m, kesan, log) { return S().applyEffects(kesan || {}, { kiraTindakan: false, patch: { mof: m }, log: log }); }
  /** Pemain memegang portfolio Menteri Kewangan (Menteri Penuh). */
  function aktif(p) {
    var K = KB(); if (!p || !K) { return false; }
    var k = K.getKabinet(p);
    return !!(k.hasGovernmentRole && k.roleLevel === 'MENTERI_PENUH' && /^Menteri Kewangan$/.test(String(k.portfolioName || '')));
  }
  function pilihan(tuil, id) { var t = TUIL[tuil]; for (var i = 0; i < t.pilihan.length; i++) { if (t.pilihan[i].id === id) { return t.pilihan[i]; } } return t.pilihan[1]; }

  /* ---------- Pengiraan ---------- */
  function aliran(m) {
    var hasil = CONFIG.HASIL_ASAS + pilihan('sst', m.dasar.sst).hasil + pilihan('pendapatan', m.dasar.pendapatan).hasil;
    var subsidi = pilihan('minyak', m.dasar.minyak).kos + pilihan('barang', m.dasar.barang).kos, belanja = 0;
    KEMENTERIAN.forEach(function (k) { belanja += Number(m.ministryBudgets[k.kod]) || 0; });
    belanja = belanja / 12;
    return { hasil: r1(hasil), subsidi: r1(subsidi), belanja: r1(belanja), bersih: r1(hasil - subsidi - belanja) };
  }
  function sasaran(m) {
    var inf = CONFIG.INFLASI_AWAL, puas = 50;
    URUTAN_TUIL.forEach(function (t) { var x = pilihan(t, m.dasar[t]); inf += x.inf; puas += x.puas; });
    puas -= Math.max(0, m.inflationRate - 3) * 6;
    return { inflasi: r1(clamp(inf, 0, 12)), kepuasan: Math.round(clamp(puas, 0, 100)) };
  }

  /* ---------- Bajet Tahunan ---------- */
  function bajetBuka(p) { var m = getMOF(p); return CONFIG.BULAN_BAJET.indexOf(parseInt(p.bulan, 10)) >= 0 && m.bajetTahun !== (parseInt(p.tahun, 10) || 0); }
  function ubahBajet(kod, arah) {
    var p = S().loadPlayer(), m = getMOF(p), d = arah > 0 ? 1 : -1;
    if (!aktif(p)) { return { ok: false, ralat: 'Hanya Menteri Kewangan.' }; }
    if (!bajetBuka(p)) { return { ok: false, ralat: 'Bajet Tahunan dibuka bulan ' + CONFIG.BULAN_BAJET.join(' dan ') + ', sekali setahun.' }; }
    if (!KEMENTERIAN.some(function (k) { return k.kod === kod; })) { return { ok: false, ralat: 'Kementerian tidak sah.' }; }
    var baru = (m.draf[kod] || 0) + d;
    if (Math.abs(baru) > CONFIG.HAD_LANGKAH) { return { ok: false, ralat: 'Had perubahan ±' + Math.round(CONFIG.HAD_LANGKAH * CONFIG.LANGKAH * 100) + '%.' }; }
    m.draf[kod] = baru;
    var r = simpan(m, {});
    return { ok: !!(r && r.ok), ralat: r && r.ralat };
  }
  function muktamadBajet() {
    var p = S().loadPlayer(), m = getMOF(p);
    if (!aktif(p)) { return { ok: false, ralat: 'Hanya Menteri Kewangan.' }; }
    if (!bajetBuka(p)) { return { ok: false, ralat: 'Bajet Tahunan dibuka bulan ' + CONFIG.BULAN_BAJET.join(' dan ') + ', sekali setahun.' }; }
    var laras = 0, naik = 0, potong = 0;
    KEMENTERIAN.forEach(function (k) {
      var l = m.draf[k.kod] || 0; if (!l) { return; }
      m.ministryBudgets[k.kod] = r1(m.ministryBudgets[k.kod] * (1 + CONFIG.LANGKAH * l));
      m.hubungan[k.kod] = clamp(m.hubungan[k.kod] + (l > 0 ? CONFIG.HUB_NAIK * l : CONFIG.HUB_POTONG * l), 0, 100);
      if (l > 0) { naik += 1; if (k.rakyat) { laras += CONFIG.LARAS_DEWAN * l; } } else { potong += 1; laras += CONFIG.LARAS_DEWAN * l; }
    });
    m.larasDewan = r1(clamp(laras, -CONFIG.LARAS_DEWAN_HAD, CONFIG.LARAS_DEWAN_HAD) * 100) / 100;
    m.bajetTahun = parseInt(p.tahun, 10) || 0; m.draf = {};
    var r = simpan(m, {}, { tindakan: 'mof_bajet', nama: 'Bajet ' + (m.bajetTahun + 1) + ' dimuktamadkan', peringkat: 'ahli' });
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    return { ok: true, mesej: 'Bajet ' + (m.bajetTahun + 1) + ' dimuktamadkan: ' + naik + ' kementerian dinaikkan, ' + potong + ' dipotong. Bentang di Dewan Rakyat bulan 10.' };
  }
  /** Laras peluang lulus Bajet Negara di Dewan Rakyat (dewan.js): bajet tahun semasa yang dimuktamadkan sahaja. */
  function larasDewan(p) { var m = p && p.mof ? getMOF(p) : null; return m && m.bajetTahun === (parseInt(p.tahun, 10) || 0) ? (Number(m.larasDewan) || 0) : 0; }

  /* ---------- Cukai & Subsidi ---------- */
  function ubahDasar(tuil, id) {
    var p = S().loadPlayer(), m = getMOF(p), t = TUIL[tuil];
    if (!aktif(p)) { return { ok: false, ralat: 'Hanya Menteri Kewangan.' }; }
    if (!t || !t.pilihan.some(function (x) { return x.id === id; })) { return { ok: false, ralat: 'Dasar tidak sah.' }; }
    if (m.dasar[tuil] === id) { return { ok: false, ralat: 'Dasar itu sedang berkuat kuasa.' }; }
    if (m.dasarBulan === idx(p)) { return { ok: false, ralat: 'Satu perubahan dasar fiskal sebulan.' }; }
    var lama = pilihan(tuil, m.dasar[tuil]), baru = pilihan(tuil, id), kejut = Math.round((baru.puas - lama.puas) / 2);
    m.dasar[tuil] = id; m.dasarBulan = idx(p);
    m.publicSatisfaction = clamp(m.publicSatisfaction + kejut, 0, 100);                // kesan pengumuman serta-merta
    var r = simpan(m, {}, { tindakan: 'mof_dasar', nama: t.nama + ': ' + baru.label, peringkat: 'ahli' });
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    return { ok: true, mesej: t.nama + ' ditukar kepada ' + baru.label + '. Kepuasan rakyat ' + (kejut >= 0 ? '+' : '') + kejut + '.' };
  }

  /* ---------- Bulanan (calendar.js) ---------- */
  function prosesBulan() {
    var p = S() && S().loadPlayer(), ev = [];
    if (!p || p.tamat || (!p.mof && !aktif(p))) { return { peristiwa: ev }; }
    var m = getMOF(p), a = aliran(m), K = KB(), on = aktif(p);
    m.nationalTreasury = r1(m.nationalTreasury + a.bersih); m.aliranLalu = a.bersih;
    var s = sasaran(m);
    m.inflationRate = r1(m.inflationRate + (s.inflasi - m.inflationRate) * 0.3);
    m.kepuasanLalu = m.publicSatisfaction;
    m.publicSatisfaction = Math.round(clamp(m.publicSatisfaction + (s.kepuasan - m.publicSatisfaction) * 0.25, 0, 100));
    var marah = 0;
    KEMENTERIAN.forEach(function (k) { var h = m.hubungan[k.kod]; if (h < CONFIG.HUB_MARAH) { marah += 1; } m.hubungan[k.kod] = h + Math.sign(CONFIG.HUB_AWAL - h); });   // hubungan beransur pulih
    if (m.bajetTahun !== (parseInt(p.tahun, 10) || 0) && parseInt(p.bulan, 10) > CONFIG.BULAN_BAJET[CONFIG.BULAN_BAJET.length - 1]) { m.bajetTahun = parseInt(p.tahun, 10) || 0; m.draf = {}; m.larasDewan = 0; }   // tidak dimuktamadkan: bajet lama diguna semula
    simpan(m, {});
    if (!on || !K || !K.laras) { return { peristiwa: ev }; }
    var d = { pop: clamp(Math.round((m.publicSatisfaction - 50) / 10), -3, 3), rating: 0, rombak: marah * CONFIG.MARAH_ROMBAK };
    if (m.nationalTreasury < CONFIG.RIZAB_KRISIS) { d.rating += CONFIG.KRISIS_RATING; d.rombak += CONFIG.KRISIS_ROMBAK; ev.push({ jenis: 'kabinet', mesej: 'Krisis fiskal: rizab perbendaharaan tinggal RM ' + m.nationalTreasury + ' bilion (KPI portfolio ' + CONFIG.KRISIS_RATING + ').' }); }
    if (marah) { ev.push({ jenis: 'kabinet', mesej: marah + ' menteri tidak puas hati dengan peruntukan bajet dan merungut kepada Perdana Menteri (risiko rombakan +' + marah * CONFIG.MARAH_ROMBAK + ').' }); }
    if (m.inflationRate > 4) { ev.push({ jenis: 'kabinet', mesej: 'Inflasi ' + m.inflationRate + '%: rakyat mengeluh tentang kos sara hidup.' }); }
    K.laras(d);
    return { peristiwa: ev };
  }

  function ringkasan(p) {
    var m = getMOF(p), a = aliran(m), s = sasaran(m), buka = bajetBuka(p), jumlah = 0, jumlahBaru = 0;
    var kem = KEMENTERIAN.map(function (k) {
      var l = m.draf[k.kod] || 0, sek = m.ministryBudgets[k.kod], baru = r1(sek * (1 + CONFIG.LANGKAH * l)); jumlah += sek; jumlahBaru += baru;
      return { kod: k.kod, nama: k.nama, bajet: sek, baru: baru, langkah: l, peratus: Math.round(l * CONFIG.LANGKAH * 100), hubungan: m.hubungan[k.kod], marah: m.hubungan[k.kod] < CONFIG.HUB_MARAH, rakyat: !!k.rakyat };
    });
    return { aktif: aktif(p), rizab: m.nationalTreasury, inflasi: m.inflationRate, kepuasan: m.publicSatisfaction, kepuasanArah: m.publicSatisfaction - m.kepuasanLalu,
      aliran: a, aliranLalu: m.aliranLalu, sasaran: s, krisis: m.nationalTreasury < CONFIG.RIZAB_KRISIS,
      bajet: { buka: buka, tahun: (parseInt(p.tahun, 10) || 0) + 1, sudah: m.bajetTahun === (parseInt(p.tahun, 10) || 0), kementerian: kem, jumlah: r1(jumlah), jumlahBaru: r1(jumlahBaru), beza: r1(jumlahBaru - jumlah) },
      dasar: URUTAN_TUIL.map(function (t) { var T = TUIL[t]; return { kod: t, nama: T.nama, ikon: T.ikon, jenis: T.jenis, semasa: m.dasar[t], pilihan: T.pilihan.map(function (x) { return { id: x.id, label: x.label }; }) }; }),
      dasarBoleh: m.dasarBulan !== idx(p) };
  }
  /** Mulakan rekod MOF (dipanggil oleh UI apabila pemain Menteri Kewangan membuka tab). */
  function pastikan() { var p = S().loadPlayer(); if (!p || p.mof || !aktif(p)) { return false; } simpan(getMOF(p), {}); return true; }

  return { CONFIG: CONFIG, KEMENTERIAN: KEMENTERIAN, TUIL: TUIL, getMOF: getMOF, aktif: aktif, aliran: aliran, sasaran: sasaran, bajetBuka: bajetBuka,
    ubahBajet: ubahBajet, muktamadBajet: muktamadBajet, larasDewan: larasDewan, ubahDasar: ubahDasar, prosesBulan: prosesBulan, ringkasan: ringkasan, pastikan: pastikan };
});
