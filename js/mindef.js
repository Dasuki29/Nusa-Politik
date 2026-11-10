/* ==========================================================================
   Nusa Politik — js/mindef.js   (v13.73)
   Modul Kementerian Pertahanan (MINDEF Engine), mockup dipersetujui.
     State p.mindef = { nationalSecurityScore (0-100), militaryReadiness (purata cabang), cabang { darat, laut, udara } (0-100),
                        procurementScandalRisk (0-100), sokonganJeneral (0-100), dana (RM juta), perolehan (RM bilion),
                        insiden { jenis, bulan } | null, kontrak [ { aset, laluan, siapIdx } ], kontrakBulan, arahanBulan, auditBulan,
                        latihan { darat, laut, udara } (idx bulan terakhir), perolehanTahun, lalu }
     1. Tab "Pejabat MINDEF" hanya untuk pemegang portfolio Menteri Pertahanan (js/mindef-ui.js).
     2. Insiden sempadan rawak (laut paling kerap): tegas (peluang ikut kesiapsiagaan cabang) atau diplomatik (pasti tamat, jeneral kecewa).
     3. Perolehan aset strategik: tender terbuka (lambat, tiada risiko) atau rundingan terus (cepat, jeneral gembira, risiko skandal naik).
        Risiko > 50%: skandal boleh terbongkar (KPI, Reputasi, populariti jatuh; risiko integriti SPRM naik).
     4. Arahan bulanan: latihan bersama, penyelenggaraan aset atau kebajikan anggota (satu sebulan).
   ANDAIAN: semua nilai ialah anggaran permainan; aset dan insiden ialah label simulasi, tiada negara asing dinamakan.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikMINDEF = api;
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
  var rngLalai = Math.random;
  function rng(o) { return (o && o.rng) || rngLalai; }

  var CONFIG = {
    KESELAMATAN_AWAL: 60, SIAP_AWAL: 55, RISIKO_AWAL: 20, JENERAL_AWAL: 55,
    DANA_AWAL: 120, DANA_BULAN: 50, DANA_HAD: 250, PEROLEHAN_TAHUN: 3.0, PEROLEHAN_HAD: 6.0,
    SUSUT_SIAP: 1, RISIKO_SUSUT: 2, INSIDEN_ASAS: 0.25, INSIDEN_MIN: 0.1, INSIDEN_MAKS: 0.5,
    TEGAS: { kos: 40, keselamatan: 8, jeneral: 5, pop: 3, gagalKeselamatan: -5, gagalPop: -4 },
    DIPLOMATIK: { keselamatan: -2, jeneral: -6, pop: -1 },
    ASET_SIAP: { cabang: 15, keselamatan: 6 },
    SKANDAL: { ambang: 50, rating: -10, reputasi: -5, integriti: 15, pop: -5, kembali: 30 },
    AUDIT: { kos: 20, risiko: -15, jeneral: -5 },
    RENDAH: 40, RENDAH_RATING: -4, RENDAH_POP: -2, JENERAL_RENDAH: 30, JENERAL_ROMBAK: 3
  };
  var CABANG = [
    { kod: 'darat', nama: 'Darat', ikon: '🪖', kawasan: 'sempadan darat' },
    { kod: 'laut', nama: 'Laut', ikon: '⚓', kawasan: 'perairan & ZEE' },
    { kod: 'udara', nama: 'Udara', ikon: '✈️', kawasan: 'ruang udara' }
  ];
  var INSIDEN = {
    laut: { cabang: 'laut', ikon: '🚢', nama: 'Kapal pengawal pantai asing menceroboh perairan ZEE', berat: 2, keselamatan: -4, tegas: 'Kerah TLDM & APMM' },
    udara: { cabang: 'udara', ikon: '🛩️', nama: 'Pesawat tentera asing melanggar ruang udara negara', berat: 1, keselamatan: -3, tegas: 'Pintas dengan jet TUDM' },
    darat: { cabang: 'darat', ikon: '🏕️', nama: 'Kumpulan bersenjata menyusup di sempadan darat', berat: 1, keselamatan: -4, tegas: 'Kerah Tentera Darat' }
  };
  var ASET = [
    { id: 'kapal', cabang: 'laut', ikon: '⚓', nama: 'Kapal tempur pesisir', kos: 2.0, terbuka: 6, terus: 2, jeneral: 8, risiko: 20 },
    { id: 'jet', cabang: 'udara', ikon: '✈️', nama: 'Jet pejuang ringan', kos: 3.5, terbuka: 8, terus: 3, jeneral: 10, risiko: 25 },
    { id: 'perisai', cabang: 'darat', ikon: '🪖', nama: 'Kenderaan perisai', kos: 1.2, terbuka: 4, terus: 1, jeneral: 6, risiko: 15 }
  ];
  var ARAHAN = [
    { id: 'latihan', ikon: '🏋️', nama: 'Latihan bersama', huraian: 'Latihan cabang terpilih', kos: 30, cabang: 6 },
    { id: 'selenggara', ikon: '🔧', nama: 'Penyelenggaraan aset', huraian: 'Baiki dan siagakan aset semua cabang', kos: 40, semua: 3 },
    { id: 'kebajikan', ikon: '🎖️', nama: 'Kebajikan anggota tentera', huraian: 'Rumah, elaun dan kemudahan anggota', kos: 20, jeneral: 6 }
  ];

  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function dasar() {
    return { nationalSecurityScore: CONFIG.KESELAMATAN_AWAL, militaryReadiness: CONFIG.SIAP_AWAL, cabang: { darat: CONFIG.SIAP_AWAL, laut: CONFIG.SIAP_AWAL, udara: CONFIG.SIAP_AWAL },
      procurementScandalRisk: CONFIG.RISIKO_AWAL, sokonganJeneral: CONFIG.JENERAL_AWAL, dana: CONFIG.DANA_AWAL, perolehan: CONFIG.PEROLEHAN_TAHUN,
      insiden: null, kontrak: [], kontrakBulan: 0, arahanBulan: 0, auditBulan: 0, insidenBulan: 0, latihan: { darat: 0, laut: 0, udara: 0 }, perolehanTahun: 0, lalu: null };
  }
  function purata(m) { return Math.round((m.cabang.darat + m.cabang.laut + m.cabang.udara) / 3); }
  function getMINDEF(p) {
    var b = dasar(), m = p && p.mindef && typeof p.mindef === 'object' ? p.mindef : {};
    for (var f in b) { if (m[f] === undefined) { m[f] = b[f]; } }
    m.militaryReadiness = purata(m);
    return m;
  }
  function simpan(m, kesan, log) { m.militaryReadiness = purata(m); return S().applyEffects(kesan || {}, { kiraTindakan: false, patch: { mindef: m }, log: log }); }
  /** Pemain memegang portfolio Menteri Pertahanan (Menteri Penuh). */
  function aktif(p) {
    var K = KB(); if (!p || !K) { return false; }
    var k = K.getKabinet(p);
    return !!(k.hasGovernmentRole && k.roleLevel === 'MENTERI_PENUH' && /^Menteri Pertahanan$/.test(String(k.portfolioName || '')));
  }
  function laras(m, x) {
    if (x.keselamatan) { m.nationalSecurityScore = clamp(Math.round(m.nationalSecurityScore + x.keselamatan), 0, 100); }
    if (x.jeneral) { m.sokonganJeneral = clamp(Math.round(m.sokonganJeneral + x.jeneral), 0, 100); }
    if (x.risiko) { m.procurementScandalRisk = clamp(Math.round(m.procurementScandalRisk + x.risiko), 0, 100); }
    if (x.cabang) { for (var c in x.cabang) { m.cabang[c] = clamp(Math.round(m.cabang[c] + x.cabang[c]), 0, 100); } }
  }
  function cariAset(id) { return ASET.filter(function (a) { return a.id === id; })[0] || null; }
  function ralatAm(p) { return aktif(p) ? '' : 'Hanya Menteri Pertahanan.'; }

  /* ---------- Insiden sempadan ---------- */
  function peluangTegas(m) { var I = m.insiden ? INSIDEN[m.insiden.jenis] : null; return I ? clamp(m.cabang[I.cabang] / 100, 0.2, 0.9) : 0; }
  function tanganiInsiden(cara, o) {
    var p = S().loadPlayer(), m = getMINDEF(p), K = KB(), e = ralatAm(p), C = CONFIG;
    if (e) { return { ok: false, ralat: e }; }
    if (!m.insiden) { return { ok: false, ralat: 'Tiada insiden sempadan.' }; }
    if (m.insidenBulan === idx(p)) { return { ok: false, ralat: 'Satu keputusan insiden sebulan.' }; }
    var I = INSIDEN[m.insiden.jenis], pop = 0, jaya = null, mesej;
    if (cara === 'tegas') {
      if (m.dana < C.TEGAS.kos) { return { ok: false, ralat: 'Peruntukan operasi tidak cukup.' }; }
      m.dana -= C.TEGAS.kos; jaya = rng(o)() < peluangTegas(m);
      if (jaya) { laras(m, { keselamatan: C.TEGAS.keselamatan, jeneral: C.TEGAS.jeneral }); pop = C.TEGAS.pop; m.insiden = null; mesej = I.tegas + ': pencerobohan berjaya diusir. Keselamatan +' + C.TEGAS.keselamatan + ', sokongan jeneral +' + C.TEGAS.jeneral + '.'; }
      else { laras(m, { keselamatan: C.TEGAS.gagalKeselamatan }); pop = C.TEGAS.gagalPop; mesej = I.tegas + ' tidak berjaya: insiden masih berlarutan. Keselamatan ' + C.TEGAS.gagalKeselamatan + '.'; }
    } else if (cara === 'diplomatik') {
      laras(m, { keselamatan: C.DIPLOMATIK.keselamatan, jeneral: C.DIPLOMATIK.jeneral }); pop = C.DIPLOMATIK.pop; m.insiden = null;
      mesej = 'Nota bantahan dihantar dan rundingan diadakan: insiden tamat. Sokongan jeneral ' + C.DIPLOMATIK.jeneral + '.';
    } else { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    m.insidenBulan = idx(p);
    var r = simpan(m, {}, { tindakan: 'mindef_insiden', nama: I.nama + ': ' + (cara === 'tegas' ? 'tegas' : 'diplomatik'), peringkat: 'ahli' });
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    if (pop && K && K.laras) { K.laras({ pop: pop }); }
    return { ok: true, jaya: jaya, mesej: mesej };
  }

  /* ---------- Perolehan aset strategik ---------- */
  function lulusKontrak(id, laluan) {
    var p = S().loadPlayer(), m = getMINDEF(p), a = cariAset(id), e = ralatAm(p), I = modul('MyPolitikIntegriti', 'integriti.js');
    if (e) { return { ok: false, ralat: e }; }
    if (!a || (laluan !== 'terbuka' && laluan !== 'terus')) { return { ok: false, ralat: 'Kontrak tidak sah.' }; }
    if (m.kontrakBulan === idx(p)) { return { ok: false, ralat: 'Satu kontrak baharu sebulan.' }; }
    if (m.kontrak.some(function (k) { return k.aset === id; })) { return { ok: false, ralat: 'Kontrak aset ini sedang berjalan.' }; }
    if (m.perolehan < a.kos) { return { ok: false, ralat: 'Peruntukan perolehan tidak cukup.' }; }
    var terus = laluan === 'terus', siap = idx(p) + (terus ? a.terus : a.terbuka);
    m.perolehan = r1(m.perolehan - a.kos); m.kontrakBulan = idx(p);
    m.kontrak.push({ aset: id, laluan: laluan, siapIdx: siap });
    if (terus) { laras(m, { jeneral: a.jeneral, risiko: a.risiko }); }
    var r = simpan(m, {}, { tindakan: 'mindef_kontrak', nama: 'Kontrak ' + a.nama + ' (' + (terus ? 'rundingan terus' : 'tender terbuka') + ')', peringkat: 'ahli' });
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    if (terus && I && I.tambahRisiko) { I.tambahRisiko(Math.round(a.risiko / 2), 'perolehan ' + a.nama + ' secara rundingan terus'); }
    var b = ((siap - 1) % 12) + 1, t = Math.floor((siap - 1) / 12);
    return { ok: true, mesej: 'Kontrak ' + a.nama + ' diluluskan (' + (terus ? 'rundingan terus' : 'tender terbuka') + '). Siap bulan ' + b + '/' + t + '.' + (terus ? ' Sokongan jeneral +' + a.jeneral + ', risiko skandal +' + a.risiko + '.' : '') };
  }
  function auditPerolehan() {
    var p = S().loadPlayer(), m = getMINDEF(p), e = ralatAm(p), A = CONFIG.AUDIT;
    if (e) { return { ok: false, ralat: e }; }
    if (m.auditBulan === idx(p)) { return { ok: false, ralat: 'Satu audit sebulan.' }; }
    if (m.dana < A.kos) { return { ok: false, ralat: 'Peruntukan operasi tidak cukup.' }; }
    m.dana -= A.kos; m.auditBulan = idx(p); laras(m, { risiko: A.risiko, jeneral: A.jeneral });
    var r = simpan(m, {}, { tindakan: 'mindef_audit', nama: 'Audit dalaman perolehan', peringkat: 'ahli' });
    return r && r.ok ? { ok: true, mesej: 'Audit dalaman perolehan diarahkan. Risiko skandal ' + A.risiko + ', sokongan jeneral ' + A.jeneral + '.' } : { ok: false, ralat: r && r.ralat };
  }

  /* ---------- Arahan bulanan ---------- */
  function arahan(id, cabang) {
    var p = S().loadPlayer(), m = getMINDEF(p), a = ARAHAN.filter(function (x) { return x.id === id; })[0], e = ralatAm(p), ini = idx(p);
    if (e) { return { ok: false, ralat: e }; }
    if (!a) { return { ok: false, ralat: 'Arahan tidak sah.' }; }
    if (m.arahanBulan === ini) { return { ok: false, ralat: 'Satu arahan sebulan.' }; }
    if (id === 'latihan' && !m.cabang.hasOwnProperty(cabang)) { return { ok: false, ralat: 'Pilih cabang.' }; }
    if (m.dana < a.kos) { return { ok: false, ralat: 'Peruntukan operasi tidak cukup.' }; }
    m.dana -= a.kos; m.arahanBulan = ini;
    if (id === 'latihan') { var x = {}; x[cabang] = a.cabang; laras(m, { cabang: x }); m.latihan[cabang] = ini; }
    else if (id === 'selenggara') { laras(m, { cabang: { darat: a.semua, laut: a.semua, udara: a.semua } }); m.latihan = { darat: ini, laut: ini, udara: ini }; }
    else { laras(m, { jeneral: a.jeneral }); }
    var r = simpan(m, {}, { tindakan: 'mindef_arahan', nama: a.nama + (cabang && id === 'latihan' ? ' (' + cabang + ')' : ''), peringkat: 'ahli' });
    return r && r.ok ? { ok: true, mesej: 'Arahan dikeluarkan: ' + a.nama + '.' } : { ok: false, ralat: r && r.ralat };
  }

  /* ---------- Bulanan (calendar.js) ---------- */
  function peluangInsiden(m) { return clamp(CONFIG.INSIDEN_ASAS + (60 - purata(m)) / 200, CONFIG.INSIDEN_MIN, CONFIG.INSIDEN_MAKS); }
  function pilihInsiden(m, r) {
    var berat = {}, jumlah = 0, k;
    for (k in INSIDEN) { berat[k] = INSIDEN[k].berat * (m.cabang[INSIDEN[k].cabang] < 45 ? 2 : 1); jumlah += berat[k]; }
    var x = r() * jumlah; for (k in berat) { x -= berat[k]; if (x < 0) { return k; } }
    return 'laut';
  }
  function prosesBulan(o) {
    var p = S() && S().loadPlayer(), ev = [];
    if (!p || p.tamat || (!p.mindef && !aktif(p))) { return { peristiwa: ev }; }
    var m = getMINDEF(p), K = KB(), on = aktif(p), r = rng(o), ini = idx(p), dahulu = ini - 1, C = CONFIG, kes = {};
    m.lalu = { keselamatan: m.nationalSecurityScore, siap: purata(m), risiko: m.procurementScandalRisk, jeneral: m.sokonganJeneral };
    m.dana = Math.min(C.DANA_HAD, m.dana + C.DANA_BULAN);
    var tahun = parseInt(p.tahun, 10) || 0;
    if (m.perolehanTahun !== tahun && parseInt(p.bulan, 10) === 1) { m.perolehan = Math.min(C.PEROLEHAN_HAD, r1(m.perolehan + C.PEROLEHAN_TAHUN)); m.perolehanTahun = tahun; }
    CABANG.forEach(function (c) { if (m.latihan[c.kod] !== dahulu) { m.cabang[c.kod] = clamp(m.cabang[c.kod] - C.SUSUT_SIAP, 0, 100); } });
    m.kontrak = m.kontrak.filter(function (k) {                                       // aset siap
      if (k.siapIdx > ini) { return true; }
      var a = cariAset(k.aset); if (!a) { return false; }
      var x = {}; x[a.cabang] = C.ASET_SIAP.cabang; laras(m, { cabang: x, keselamatan: C.ASET_SIAP.keselamatan });
      if (on) { ev.push({ jenis: 'kabinet', mesej: a.nama + ' diserahkan kepada angkatan tentera: kesiapsiagaan ' + CABANG.filter(function (c) { return c.kod === a.cabang; })[0].nama + ' +' + C.ASET_SIAP.cabang + ', keselamatan +' + C.ASET_SIAP.keselamatan + '.' }); }
      return false;
    });
    var sasaran = clamp(Math.round(purata(m) * 0.7 + 22), 0, 100);
    m.nationalSecurityScore = Math.round(m.nationalSecurityScore + (sasaran - m.nationalSecurityScore) * 0.2);
    m.procurementScandalRisk = clamp(m.procurementScandalRisk - C.RISIKO_SUSUT, 0, 100);
    if (m.insiden) {
      var I = INSIDEN[m.insiden.jenis]; m.insiden.bulan += 1; laras(m, { keselamatan: I.keselamatan });
      if (on) { ev.push({ jenis: 'kabinet', mesej: I.nama + ' masih belum diputuskan (' + m.insiden.bulan + ' bulan): keselamatan ' + I.keselamatan + '.' }); }
    } else if (on && r() < peluangInsiden(m)) {
      var j = pilihInsiden(m, r); m.insiden = { jenis: j, bulan: 0 };
      ev.push({ jenis: 'kabinet', mesej: 'Insiden sempadan: ' + INSIDEN[j].nama + '. Buat keputusan di Pejabat MINDEF.' });
    }
    var d = { rating: 0, pop: 0, rombak: 0 }, skandal = false;
    if (on && m.procurementScandalRisk > C.SKANDAL.ambang && r() < (m.procurementScandalRisk - C.SKANDAL.ambang) / 100) {
      skandal = true; m.procurementScandalRisk = C.SKANDAL.kembali; d.rating += C.SKANDAL.rating; d.pop += C.SKANDAL.pop; kes.reputasi = C.SKANDAL.reputasi;
      ev.push({ jenis: 'kabinet', mesej: 'Skandal perolehan pertahanan terbongkar: KPI ' + C.SKANDAL.rating + ', Reputasi ' + C.SKANDAL.reputasi + ', SPRM menyiasat.' });
    }
    if (on && m.nationalSecurityScore < C.RENDAH) { d.rating += C.RENDAH_RATING; d.pop += C.RENDAH_POP; ev.push({ jenis: 'kabinet', mesej: 'Skor keselamatan negara rendah (' + m.nationalSecurityScore + '): KPI portfolio ' + C.RENDAH_RATING + '.' }); }
    if (on && m.sokonganJeneral < C.JENERAL_RENDAH) { d.rombak += C.JENERAL_ROMBAK; ev.push({ jenis: 'kabinet', mesej: 'Jeneral tentera mengadu kepada Perdana Menteri (risiko rombakan +' + C.JENERAL_ROMBAK + ').' }); }
    simpan(m, kes);
    if (skandal) { var IG = modul('MyPolitikIntegriti', 'integriti.js'); if (IG && IG.tambahRisiko) { IG.tambahRisiko(C.SKANDAL.integriti, 'skandal perolehan pertahanan'); } }
    if (on && K && K.laras && (d.rating || d.pop || d.rombak)) { K.laras(d); }
    return { peristiwa: ev };
  }

  function ringkasan(p) {
    var m = getMINDEF(p), ini = idx(p), I = m.insiden ? INSIDEN[m.insiden.jenis] : null, l = m.lalu || {}, C = CONFIG;
    function arah(nilai, lama) { return lama === undefined ? 0 : nilai - lama; }
    return { aktif: aktif(p), keselamatan: m.nationalSecurityScore, siap: purata(m), risiko: m.procurementScandalRisk, jeneral: m.sokonganJeneral,
      arah: { keselamatan: arah(m.nationalSecurityScore, l.keselamatan), siap: arah(purata(m), l.siap), risiko: arah(m.procurementScandalRisk, l.risiko), jeneral: arah(m.sokonganJeneral, l.jeneral) },
      dana: m.dana, danaBulan: C.DANA_BULAN, perolehan: m.perolehan, perolehanTahun: C.PEROLEHAN_TAHUN,
      cabang: CABANG.map(function (c) { return { kod: c.kod, nama: c.nama, ikon: c.ikon, kawasan: c.kawasan, siap: m.cabang[c.kod], ceroboh: !!(I && I.cabang === c.kod) }; }),
      insiden: I ? { jenis: m.insiden.jenis, nama: I.nama, ikon: I.ikon, keselamatan: I.keselamatan, bulan: m.insiden.bulan, tegas: I.tegas, cabang: I.cabang, peluang: Math.round(peluangTegas(m) * 100),
        kos: C.TEGAS.kos, sudah: m.insidenBulan === ini, bolehTegas: m.insidenBulan !== ini && m.dana >= C.TEGAS.kos } : null,
      aset: ASET.map(function (a) {
        var jalan = m.kontrak.some(function (k) { return k.aset === a.id; }), sebab = m.kontrakBulan === ini ? 'Satu kontrak baharu sebulan.' : jalan ? 'Kontrak aset ini sedang berjalan.' : m.perolehan < a.kos ? 'Peruntukan perolehan tidak cukup.' : '';
        return { id: a.id, ikon: a.ikon, nama: a.nama, cabang: a.cabang, kos: a.kos, terbuka: a.terbuka, terus: a.terus, jeneral: a.jeneral, risiko: a.risiko, boleh: !sebab, sebab: sebab };
      }),
      kontrak: m.kontrak.map(function (k) { var a = cariAset(k.aset); return { nama: a ? a.nama : k.aset, laluan: k.laluan, bulan: ((k.siapIdx - 1) % 12) + 1, tahun: Math.floor((k.siapIdx - 1) / 12) }; }),
      audit: { kos: C.AUDIT.kos, risiko: C.AUDIT.risiko, jeneral: C.AUDIT.jeneral, boleh: m.auditBulan !== ini && m.dana >= C.AUDIT.kos },
      arahan: ARAHAN.map(function (a) { var sebab = m.arahanBulan === ini ? 'Satu arahan sebulan.' : m.dana < a.kos ? 'Peruntukan operasi tidak cukup.' : ''; return { id: a.id, ikon: a.ikon, nama: a.nama, huraian: a.huraian, kos: a.kos, cabang: a.cabang || 0, semua: a.semua || 0, jeneral: a.jeneral || 0, boleh: !sebab, sebab: sebab }; }),
      arahanSudah: m.arahanBulan === ini, skandalAmbang: C.SKANDAL.ambang };
  }

  return { CONFIG: CONFIG, CABANG: CABANG, INSIDEN: INSIDEN, ASET: ASET, ARAHAN: ARAHAN, setRng: function (f) { rngLalai = f || Math.random; },
    getMINDEF: getMINDEF, aktif: aktif, peluangTegas: peluangTegas, peluangInsiden: peluangInsiden,
    tanganiInsiden: tanganiInsiden, lulusKontrak: lulusKontrak, auditPerolehan: auditPerolehan, arahan: arahan, prosesBulan: prosesBulan, ringkasan: ringkasan };
});
