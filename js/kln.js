/* ==========================================================================
   Nusa Politik — js/kln.js   (v13.76)
   Modul Kementerian Luar Negeri (Wisma Putra), mockup dipersetujui.
     State p.kln = { diplomaticStanding (0-100), tradeIndex (0-100), dana (RM juta), hubungan { asean, oic, barat, timur } (0-100),
                     isu { id, bulan } | null, konsular { id, fasa, siapIdx } | null, lawatanBulan, sidangTahun, fta { blok, siapIdx } | null,
                     bonusDagang, lalu }
     1. Tab "Pejabat Wisma Putra" hanya untuk pemegang portfolio Menteri Luar Negeri (js/kln-ui.js).
     2. Lawatan rasmi (satu sebulan), isu antarabangsa (pilih pendirian), krisis konsular (pemindahan / saluran diplomatik),
        sidang kemuncak (sekali setahun), perjanjian perdagangan bebas (3 bulan).
     3. Bulanan: hubungan beransur ke 50; kedudukan dan dagangan bergerak ke sasaran; blok < 25 = hubungan dibekukan;
        kedudukan < 30 = KPI jatuh; >= 70 = populariti naik.
     Sambungan: MOF (dagangan menambah hasil), MINDEF (kedudukan tinggi = jalan diplomatik lebih murah), Pejabat PM (FTA: rakan gabungan −3).
   ANDAIAN: semua nilai ialah anggaran permainan; blok dan isu ialah label simulasi, tiada negara atau konflik sebenar dinamakan.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikKLN = api;
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
  var rngLalai = Math.random;
  function rng(o) { return (o && o.rng) || rngLalai; }

  var CONFIG = {
    KEDUDUKAN_AWAL: 55, DAGANG_AWAL: 50, HUB_AWAL: 50, DANA_AWAL: 70, DANA_BULAN: 30, DANA_HAD: 150,
    LAWATAN: { kos: 20, hubungan: 8, ip: 10 }, SIDANG: { kos: 60, kedudukan: 10, asean: 10, ip: 30 },
    FTA: { bulan: 3, dagang: 8, rakanPM: -3 }, ISU_PELUANG: 0.3, ISU_ABAI: -2, ISU_TAMAT: 2, KONSULAR_PELUANG: 0.15, KONSULAR_ABAI: -2,
    PINDAH: { kos: 30, peluang: 0.8, pop: 4, ip: 15, gagalPop: -4 }, SALURAN: { bulan: 2, peluang: 0.6, pop: 2, gagalPop: -5 },
    BEKU: 25, BEKU_DAGANG: -3, BEKU_RATING: -2, RENDAH: 30, RENDAH_RATING: -3, TINGGI: 70, TINGGI_POP: 1, MINDEF_DIPLOMATIK: 70
  };
  var BLOK = [
    { kod: 'asean', ikon: '🌏', nama: 'ASEAN' },
    { kod: 'oic', ikon: '🕌', nama: 'Dunia Islam (OIC)' },
    { kod: 'barat', ikon: '🏛️', nama: 'Rakan dagang Barat' },
    { kod: 'timur', ikon: '🏯', nama: 'Rakan dagang Asia Timur' }
  ];
  var ISU = {
    konflik: { ikon: '🗞️', nama: 'Konflik bersenjata di Asia Barat; rakyat Malaysia mendesak kerajaan bersuara', pilihan: [
      { id: 'kecam', ikon: '📢', label: 'Kecam keras', kesan: { oic: 10, barat: -8, pop: 3 } },
      { id: 'pbb', ikon: '⚖️', label: 'Desak gencatan senjata melalui PBB', kesan: { kedudukan: 5, semua: 2 } },
      { id: 'senyap', ikon: '🤐', label: 'Berkecuali senyap', kesan: { barat: 3, oic: -8, pop: -3 } }] },
    perairan: { ikon: '🌊', nama: 'Ketegangan tuntutan bertindih di perairan serantau', pilihan: [
      { id: 'tegas', ikon: '📢', label: 'Bantahan rasmi yang tegas', kesan: { kedudukan: 3, timur: -8, asean: 3, pop: 2 } },
      { id: 'asean', ikon: '🤝', label: 'Bawa ke rundingan ASEAN', kesan: { asean: 8, kedudukan: 3 } },
      { id: 'diam', ikon: '🤐', label: 'Diplomasi senyap', kesan: { timur: 4, pop: -3 } }] },
    tarif: { ikon: '📦', nama: 'Rakan dagang Barat mengenakan tarif ke atas eksport elektronik negara', pilihan: [
      { id: 'balas', ikon: '⚔️', label: 'Balas dengan tarif', kesan: { barat: -8, dagang: -3, pop: 3 } },
      { id: 'runding', ikon: '🤝', label: 'Runding pengecualian tarif', kesan: { barat: 4, dagang: 2 } },
      { id: 'alih', ikon: '🔀', label: 'Alih pasaran ke Asia Timur', kesan: { timur: 6, barat: -4 } }] }
  };
  var KONSULAR = {
    terkandas: { ikon: '✈️', nama: '120 rakyat Malaysia terkandas di zon konflik' },
    sindiket: { ikon: '🕸️', nama: '60 rakyat Malaysia menjadi mangsa sindiket penipuan kerja di luar negara' }
  };
  var LABEL = { kedudukan: 'Kedudukan diplomatik', dagang: 'Dagangan', pop: 'Populariti', semua: 'Semua blok', asean: 'ASEAN', oic: 'Dunia Islam', barat: 'Rakan Barat', timur: 'Asia Timur' };

  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function dasar() {
    return { diplomaticStanding: CONFIG.KEDUDUKAN_AWAL, tradeIndex: CONFIG.DAGANG_AWAL, dana: CONFIG.DANA_AWAL, hubungan: { asean: 60, oic: 55, barat: CONFIG.HUB_AWAL, timur: CONFIG.HUB_AWAL },
      isu: null, konsular: null, lawatanBulan: 0, sidangTahun: 0, fta: null, bonusDagang: 0, lalu: null };
  }
  function getKLN(p) {
    var b = dasar(), m = p && p.kln && typeof p.kln === 'object' ? p.kln : {};
    for (var f in b) { if (m[f] === undefined) { m[f] = b[f]; } }
    BLOK.forEach(function (x) { if (m.hubungan[x.kod] === undefined) { m.hubungan[x.kod] = CONFIG.HUB_AWAL; } });
    return m;
  }
  function simpan(m, kesan, log, patch) { var pt = { kln: m }; if (patch) { for (var f in patch) { pt[f] = patch[f]; } } return S().applyEffects(kesan || {}, { kiraTindakan: false, patch: pt, log: log }); }
  /** Pemain memegang portfolio Menteri Luar Negeri (Menteri Penuh). */
  function aktif(p) {
    var K = KB(); if (!p || !K) { return false; }
    var k = K.getKabinet(p);
    return !!(k.hasGovernmentRole && k.roleLevel === 'MENTERI_PENUH' && /^Menteri Luar Negeri$/.test(String(k.portfolioName || '')));
  }
  function ralatAm(p) { return aktif(p) ? '' : 'Hanya Menteri Luar Negeri.'; }
  function laras(m, x) {
    var c;
    if (x.kedudukan) { m.diplomaticStanding = clamp(Math.round(m.diplomaticStanding + x.kedudukan), 0, 100); }
    if (x.dagang) { m.tradeIndex = clamp(Math.round(m.tradeIndex + x.dagang), 0, 100); }
    if (x.semua) { for (c in m.hubungan) { m.hubungan[c] = clamp(m.hubungan[c] + x.semua, 0, 100); } }
    BLOK.forEach(function (b) { if (x[b.kod]) { m.hubungan[b.kod] = clamp(Math.round(m.hubungan[b.kod] + x[b.kod]), 0, 100); } });
  }
  function lpop(d) { var K = KB(); if (K && K.laras && (d.pop || d.rating)) { K.laras({ pop: d.pop || 0, rating: d.rating || 0 }); } }
  function blokNama(kod) { var b = BLOK.filter(function (x) { return x.kod === kod; })[0]; return b ? b.nama : kod; }
  function bulanTahun(i) { return (((i - 1) % 12) + 1) + '/' + Math.floor((i - 1) / 12); }

  /* ---------- Tindakan ---------- */
  function lawatan(kod) {
    var p = S().loadPlayer(), m = getKLN(p), e = ralatAm(p), L = CONFIG.LAWATAN;
    if (e) { return { ok: false, ralat: e }; }
    if (m.hubungan[kod] === undefined) { return { ok: false, ralat: 'Blok tidak sah.' }; }
    if (m.lawatanBulan === idx(p)) { return { ok: false, ralat: 'Satu lawatan rasmi sebulan.' }; }
    if (m.dana < L.kos) { return { ok: false, ralat: 'Bajet diplomatik tidak cukup.' }; }
    m.dana -= L.kos; m.lawatanBulan = idx(p); m.hubungan[kod] = clamp(m.hubungan[kod] + L.hubungan, 0, 100);
    var r = simpan(m, { ip: L.ip }, { tindakan: 'kln_lawatan', nama: 'Lawatan rasmi: ' + blokNama(kod), peringkat: 'ahli' });
    return r && r.ok ? { ok: true, mesej: 'Lawatan rasmi ke ' + blokNama(kod) + '. Hubungan +' + L.hubungan + ', IP +' + L.ip + '.' } : { ok: false, ralat: r && r.ralat };
  }
  function pendirian(id) {
    var p = S().loadPlayer(), m = getKLN(p), e = ralatAm(p);
    if (e) { return { ok: false, ralat: e }; }
    if (!m.isu) { return { ok: false, ralat: 'Tiada isu antarabangsa.' }; }
    var I = ISU[m.isu.id], c = I.pilihan.filter(function (x) { return x.id === id; })[0];
    if (!c) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    laras(m, c.kesan); m.isu = null;
    var r = simpan(m, {}, { tindakan: 'kln_isu', nama: 'Pendirian: ' + c.label, peringkat: 'ahli' });
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    lpop({ pop: c.kesan.pop || 0 });
    return { ok: true, mesej: 'Pendirian kerajaan diumumkan: ' + c.label + '.' };
  }
  function tanganiKonsular(cara, o) {
    var p = S().loadPlayer(), m = getKLN(p), e = ralatAm(p), P = CONFIG.PINDAH, Q = CONFIG.SALURAN;
    if (e) { return { ok: false, ralat: e }; }
    if (!m.konsular || m.konsular.fasa !== 'baru') { return { ok: false, ralat: 'Tiada krisis konsular untuk ditangani.' }; }
    var nm = KONSULAR[m.konsular.id].nama;
    if (cara === 'pindah') {
      if (m.dana < P.kos) { return { ok: false, ralat: 'Bajet diplomatik tidak cukup.' }; }
      m.dana -= P.kos; var jaya = rng(o)() < P.peluang; m.konsular = null;
      var r = simpan(m, jaya ? { ip: P.ip } : {}, { tindakan: 'kln_konsular', nama: 'Operasi pemindahan: ' + (jaya ? 'berjaya' : 'gagal'), peringkat: 'ahli' });
      if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
      lpop({ pop: jaya ? P.pop : P.gagalPop });
      return { ok: true, jaya: jaya, mesej: jaya ? 'Operasi pemindahan berjaya: semua rakyat dibawa pulang. Populariti +' + P.pop + ', IP +' + P.ip + '.' : 'Operasi pemindahan menghadapi masalah. Populariti ' + P.gagalPop + '.' };
    }
    if (cara === 'saluran') {
      m.konsular.fasa = 'saluran'; m.konsular.siapIdx = idx(p) + Q.bulan;
      var r2 = simpan(m, {}, { tindakan: 'kln_konsular', nama: 'Saluran diplomatik: ' + nm, peringkat: 'ahli' });
      return r2 && r2.ok ? { ok: true, mesej: 'Saluran diplomatik dibuka. Keputusan dijangka bulan ' + bulanTahun(m.konsular.siapIdx) + '.' } : { ok: false, ralat: r2 && r2.ralat };
    }
    return { ok: false, ralat: 'Pilihan tidak sah.' };
  }
  function sidangKemuncak() {
    var p = S().loadPlayer(), m = getKLN(p), e = ralatAm(p), K = CONFIG.SIDANG, t = parseInt(p.tahun, 10) || 0;
    if (e) { return { ok: false, ralat: e }; }
    if (m.sidangTahun === t) { return { ok: false, ralat: 'Sidang kemuncak hanya sekali setahun.' }; }
    if (m.dana < K.kos) { return { ok: false, ralat: 'Bajet diplomatik tidak cukup.' }; }
    m.dana -= K.kos; m.sidangTahun = t; laras(m, { kedudukan: K.kedudukan, asean: K.asean });
    var r = simpan(m, { ip: K.ip }, { tindakan: 'kln_sidang', nama: 'Hos sidang kemuncak serantau', peringkat: 'ahli' });
    return r && r.ok ? { ok: true, mesej: 'Sidang kemuncak serantau berjaya dianjurkan. Kedudukan diplomatik +' + K.kedudukan + ', IP +' + K.ip + '.' } : { ok: false, ralat: r && r.ralat };
  }
  function mulaFTA(kod) {
    var p = S().loadPlayer(), m = getKLN(p), e = ralatAm(p), F = CONFIG.FTA, patch = {};
    if (e) { return { ok: false, ralat: e }; }
    if (m.hubungan[kod] === undefined) { return { ok: false, ralat: 'Blok tidak sah.' }; }
    if (m.fta) { return { ok: false, ralat: 'Satu rundingan perdagangan bebas pada satu masa.' }; }
    m.fta = { blok: kod, siapIdx: idx(p) + F.bulan };
    if (p.pm && p.pm.blok && p.pm.blok.rakan) { var pm = p.pm; pm.blok.rakan.kepuasan = clamp(pm.blok.rakan.kepuasan + F.rakanPM, 0, 100); patch.pm = pm; }   // v13.75: peniaga tempatan bimbang
    var r = simpan(m, {}, { tindakan: 'kln_fta', nama: 'Rundingan perdagangan bebas: ' + blokNama(kod), peringkat: 'ahli' }, patch);
    return r && r.ok ? { ok: true, mesej: 'Rundingan perdagangan bebas dengan ' + blokNama(kod) + ' dimulakan. Dijangka siap bulan ' + bulanTahun(m.fta.siapIdx) + '.' } : { ok: false, ralat: r && r.ralat };
  }
  /** Laras untuk MINDEF: kedudukan diplomatik tinggi menjadikan jalan diplomatik lebih murah (dipanggil oleh mindef.js). */
  function bonusDiplomatik(p) { return !!(p && p.kln && Number(p.kln.diplomaticStanding) >= CONFIG.MINDEF_DIPLOMATIK); }
  /** Tambahan hasil MOF (RM bilion sebulan) daripada indeks dagangan (dipanggil oleh mof.js). */
  function hasilDagang(p) { return p && p.kln && typeof p.kln.tradeIndex === 'number' ? Math.round((p.kln.tradeIndex - 50) * 0.2) / 10 : 0; }

  /* ---------- Bulanan (calendar.js) ---------- */
  function prosesBulan(o) {
    var p = S() && S().loadPlayer(), ev = [];
    if (!p || p.tamat || (!p.kln && !aktif(p))) { return { peristiwa: ev }; }
    var m = getKLN(p), r = rng(o), on = aktif(p), ini = idx(p), C = CONFIG, d = { pop: 0, rating: 0 }, kes = {};
    m.lalu = { kedudukan: m.diplomaticStanding, dagang: m.tradeIndex };
    m.dana = Math.min(C.DANA_HAD, m.dana + C.DANA_BULAN);
    BLOK.forEach(function (b) { var h = m.hubungan[b.kod]; m.hubungan[b.kod] = h + Math.sign(C.HUB_AWAL - h); });
    if (m.fta && m.fta.siapIdx <= ini) { m.bonusDagang += C.FTA.dagang; m.tradeIndex = clamp(m.tradeIndex + C.FTA.dagang, 0, 100); if (on) { ev.push({ jenis: 'kabinet', mesej: 'Perjanjian perdagangan bebas dengan ' + blokNama(m.fta.blok) + ' dimeterai: dagangan +' + C.FTA.dagang + '.' }); } m.fta = null; }
    var purata = 0, beku = 0; BLOK.forEach(function (b) { purata += m.hubungan[b.kod]; if (m.hubungan[b.kod] < C.BEKU) { beku += 1; } }); purata /= BLOK.length;
    m.diplomaticStanding = clamp(Math.round(m.diplomaticStanding + (purata * 0.6 + 20 - m.diplomaticStanding) * 0.2), 0, 100);
    var sasD = 50 + (m.hubungan.barat - 50) * 0.3 + (m.hubungan.timur - 50) * 0.3 + (m.hubungan.asean - 50) * 0.2 + m.bonusDagang;
    m.tradeIndex = clamp(Math.round(m.tradeIndex + (sasD - m.tradeIndex) * 0.2), 0, 100);
    if (beku) { m.tradeIndex = clamp(m.tradeIndex + C.BEKU_DAGANG * beku, 0, 100); if (on) { d.rating += C.BEKU_RATING * beku; ev.push({ jenis: 'kabinet', mesej: beku + ' blok antarabangsa membekukan hubungan: dagangan ' + C.BEKU_DAGANG * beku + ', KPI ' + C.BEKU_RATING * beku + '.' }); } }
    if (m.isu) { m.isu.bulan += 1; laras(m, { kedudukan: C.ISU_ABAI }); if (m.isu.bulan >= C.ISU_TAMAT) { if (on) { ev.push({ jenis: 'kabinet', mesej: 'Isu antarabangsa berlalu tanpa pendirian kerajaan.' }); } m.isu = null; } }
    else if (on && r() < C.ISU_PELUANG) { var ki = Object.keys(ISU), id = ki[Math.floor(r() * ki.length)]; m.isu = { id: id, bulan: 0 }; ev.push({ jenis: 'kabinet', mesej: 'Isu antarabangsa: ' + ISU[id].nama + '. Pilih pendirian di Pejabat Wisma Putra.' }); }
    if (m.konsular) {
      if (m.konsular.fasa === 'saluran' && m.konsular.siapIdx <= ini) {
        var jaya = r() < C.SALURAN.peluang; d.pop += jaya ? C.SALURAN.pop : C.SALURAN.gagalPop;
        if (on) { ev.push({ jenis: 'kabinet', mesej: jaya ? 'Saluran diplomatik berjaya: rakyat Malaysia dibebaskan dan pulang.' : 'Saluran diplomatik gagal: keluarga mangsa marah.' }); }
        m.konsular = null;
      } else if (m.konsular.fasa === 'baru') { d.pop += C.KONSULAR_ABAI; if (on) { ev.push({ jenis: 'kabinet', mesej: 'Krisis konsular belum ditangani: ' + KONSULAR[m.konsular.id].nama + '.' }); } }
    } else if (on && r() < C.KONSULAR_PELUANG) { var kk = Object.keys(KONSULAR), kid = kk[Math.floor(r() * kk.length)]; m.konsular = { id: kid, fasa: 'baru', siapIdx: 0 }; ev.push({ jenis: 'kabinet', mesej: 'Krisis konsular: ' + KONSULAR[kid].nama + '.' }); }
    if (on && m.diplomaticStanding < C.RENDAH) { d.rating += C.RENDAH_RATING; }
    if (on && m.diplomaticStanding >= C.TINGGI) { d.pop += C.TINGGI_POP; }
    simpan(m, kes);
    if (on) { lpop(d); }
    return { peristiwa: ev };
  }

  function ringkasan(p) {
    var m = getKLN(p), ini = idx(p), l = m.lalu || {}, C = CONFIG, I = m.isu ? ISU[m.isu.id] : null, K = m.konsular ? KONSULAR[m.konsular.id] : null;
    return { aktif: aktif(p), kedudukan: m.diplomaticStanding, dagang: m.tradeIndex, dana: m.dana, danaBulan: C.DANA_BULAN, danaHad: C.DANA_HAD,
      arah: { kedudukan: l.kedudukan == null ? 0 : m.diplomaticStanding - l.kedudukan, dagang: l.dagang == null ? 0 : m.tradeIndex - l.dagang },
      blok: BLOK.map(function (b) { var h = m.hubungan[b.kod]; return { kod: b.kod, ikon: b.ikon, nama: b.nama, hubungan: h, status: h < C.BEKU ? 'beku' : h < 45 ? 'dingin' : h < 65 ? 'baik' : 'erat' }; }),
      lawatan: { boleh: m.lawatanBulan !== ini && m.dana >= C.LAWATAN.kos, sebab: m.lawatanBulan === ini ? 'Satu lawatan rasmi sebulan.' : m.dana < C.LAWATAN.kos ? 'Bajet diplomatik tidak cukup.' : '' },
      isu: I ? { nama: I.nama, ikon: I.ikon, bulan: m.isu.bulan, pilihan: I.pilihan.map(function (c) { return { id: c.id, ikon: c.ikon, label: c.label, kesan: c.kesan }; }) } : null,
      konsular: K ? { nama: K.nama, ikon: K.ikon, fasa: m.konsular.fasa, siap: m.konsular.siapIdx ? bulanTahun(m.konsular.siapIdx) : '', bolehPindah: m.dana >= C.PINDAH.kos } : null,
      sidang: { boleh: m.sidangTahun !== (parseInt(p.tahun, 10) || 0) && m.dana >= C.SIDANG.kos },
      fta: m.fta ? { blok: blokNama(m.fta.blok), siap: bulanTahun(m.fta.siapIdx) } : null, label: LABEL };
  }

  return { CONFIG: CONFIG, BLOK: BLOK, ISU: ISU, KONSULAR: KONSULAR, setRng: function (f) { rngLalai = f || Math.random; },
    getKLN: getKLN, aktif: aktif, lawatan: lawatan, pendirian: pendirian, tanganiKonsular: tanganiKonsular, sidangKemuncak: sidangKemuncak, mulaFTA: mulaFTA,
    bonusDiplomatik: bonusDiplomatik, hasilDagang: hasilDagang, prosesBulan: prosesBulan, ringkasan: ringkasan };
});
