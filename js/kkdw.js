/* ==========================================================================
   Nusa Politik — js/kkdw.js   (v13.74)
   Modul Kementerian Kemajuan Desa dan Wilayah (KKDW), mockup dipersetujui (pilihan 1: ikut struktur sebenar).
     State p.kkdw = { ruralSupportScore (0-100), ruralHousingSatisfaction (0-100, PPRS), infrastructureFund (RM juta),
                      fokus ('infra'|'seimbang'|'pprs'), fokusBulan, lulusBulan, lulusBil, projek [ { jenis, siapIdx, lewat } ],
                      aduan { jenis, bulan } | null, aduanBulan, baikPulihIdx, lalu }
     1. Tab "Pejabat KKDW" untuk Menteri Kemajuan Desa dan Wilayah (dan "Menteri Pembangunan Luar Bandar" dalam senarai sandaran).
     2. Fokus agihan bulanan: infrastruktur (sokongan luar bandar naik, perumahan turun, projek infra 20% lebih murah) atau PPRS (sebaliknya).
     3. Luluskan projek (2 kelulusan sebulan): jalan kampung, air bersih, dewan komuniti, PPRS bina rumah baharu (risiko kontraktor lewat),
        PPRS baik pulih rumah. Kesan diberi bila projek siap.
     4. Aduan rakyat rawak: baiki segera, senarai hitam kontraktor atau abaikan.
     5. Bulanan: skor -> populariti nasional; skor < 30 -> KPI jatuh; dana melebihi had tersadai -> KPI jatuh.
   Nota: PPR bandar di bawah KPKT (bukan modul ini). PPRS = Program Perumahan Rakyat Sejahtera (pengganti PPRT sejak 1 Okt 2024).
   ANDAIAN: semua nilai ialah anggaran permainan; nama projek ialah label simulasi.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikKKDW = api;
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
    LUAR_AWAL: 50, RUMAH_AWAL: 45, DANA_AWAL: 120, DANA_BULAN: 60, DANA_HAD: 300, TERSADAI_RATING: -2,
    LULUS_SEBULAN: 2, DISKAUN_FOKUS: 0.2, FOKUS_ALIR: 2,
    LEWAT_PELUANG: 0.15, LEWAT_BULAN: 2, LEWAT_RUMAH: -3,
    ADUAN_ASAS: 0.2, ADUAN_MAKS: 0.5, ADUAN_RUMAH_LAMA: 12,
    RENDAH: 30, RENDAH_RATING: -3
  };
  var PROJEK = [
    { id: 'jalan', ikon: '🛣️', nama: 'Jalan kampung', jenis: 'infra', kos: 30, bulan: 2, kesan: { luar: 6, akar: 2 } },
    { id: 'air', ikon: '🚰', nama: 'Bekalan air bersih', jenis: 'infra', kos: 25, bulan: 2, kesan: { luar: 5, akar: 2 } },
    { id: 'dewan', ikon: '🏛️', nama: 'Dewan komuniti', jenis: 'infra', kos: 15, bulan: 1, kesan: { luar: 3, ip: 8 } },
    { id: 'pprs_bina', ikon: '🏠', nama: 'PPRS: bina rumah baharu', jenis: 'pprs', kos: 40, bulan: 4, kesan: { rumah: 10, luar: 3 }, lewat: true },
    { id: 'pprs_baiki', ikon: '🔨', nama: 'PPRS: baik pulih rumah', jenis: 'pprs', kos: 15, bulan: 1, kesan: { rumah: 4 } }
  ];
  var FOKUS = [
    { id: 'infra', label: 'Infrastruktur', luar: 2, rumah: -2 },
    { id: 'seimbang', label: 'Seimbang', luar: 0, rumah: 0 },
    { id: 'pprs', label: 'Perumahan PPRS', luar: -2, rumah: 2 }
  ];
  var ADUAN = {
    bocor: { nama: 'Rumah PPRS baharu bocor setiap kali hujan', ikon: '🏚️', sasaran: 'rumah' },
    lubang: { nama: 'Jalan kampung baharu sudah berlubang', ikon: '🕳️', sasaran: 'luar' },
    air: { nama: 'Bekalan air kampung terputus seminggu', ikon: '🚱', sasaran: 'luar' }
  };
  var JAWAB = {
    baiki: { label: 'Baiki segera', ikon: '🔧', kos: 12, skor: 4 },
    hitam: { label: 'Senarai hitam kontraktor', ikon: '📝', kos: 0, rating: 3, saman: 0.3, samanRating: -5 },
    abai: { label: 'Abaikan', ikon: '🙈', kos: 0, skor: -5, pop: -2 }
  };
  var ADUAN_BULANAN = -3;

  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function dasar() {
    return { ruralSupportScore: CONFIG.LUAR_AWAL, ruralHousingSatisfaction: CONFIG.RUMAH_AWAL, infrastructureFund: CONFIG.DANA_AWAL,
      fokus: 'seimbang', fokusBulan: 0, lulusBulan: 0, lulusBil: 0, projek: [], aduan: null, aduanBulan: 0, baikPulihIdx: 0, lalu: null };
  }
  function getKKDW(p) {
    var b = dasar(), m = p && p.kkdw && typeof p.kkdw === 'object' ? p.kkdw : {};
    for (var f in b) { if (m[f] === undefined) { m[f] = b[f]; } }
    return m;
  }
  function simpan(m, kesan, log) { return S().applyEffects(kesan || {}, { kiraTindakan: false, patch: { kkdw: m }, log: log }); }
  /** Pemain memegang portfolio Menteri Kemajuan Desa dan Wilayah (atau Menteri Pembangunan Luar Bandar, senarai sandaran). */
  function aktif(p) {
    var K = KB(); if (!p || !K) { return false; }
    var k = K.getKabinet(p);
    return !!(k.hasGovernmentRole && k.roleLevel === 'MENTERI_PENUH' && /^Menteri (Kemajuan Desa dan Wilayah|Pembangunan Luar Bandar)$/.test(String(k.portfolioName || '')));
  }
  function cari(id) { return PROJEK.filter(function (x) { return x.id === id; })[0] || null; }
  function fokus(m) { return FOKUS.filter(function (x) { return x.id === m.fokus; })[0] || FOKUS[1]; }
  function kos(m, d) { return Math.round(d.kos * (fokus(m).id === d.jenis ? 1 - CONFIG.DISKAUN_FOKUS : 1)); }
  function laras(m, x) {
    if (x.luar) { m.ruralSupportScore = clamp(Math.round(m.ruralSupportScore + x.luar), 0, 100); }
    if (x.rumah) { m.ruralHousingSatisfaction = clamp(Math.round(m.ruralHousingSatisfaction + x.rumah), 0, 100); }
  }
  function ralatAm(p) { return aktif(p) ? '' : 'Hanya Menteri Kemajuan Desa dan Wilayah.'; }

  function tukarFokus(id) {
    var p = S().loadPlayer(), m = getKKDW(p), e = ralatAm(p);
    if (e) { return { ok: false, ralat: e }; }
    var f = FOKUS.filter(function (x) { return x.id === id; })[0];
    if (!f) { return { ok: false, ralat: 'Fokus tidak sah.' }; }
    if (m.fokus === id) { return { ok: false, ralat: 'Fokus itu sedang berkuat kuasa.' }; }
    if (m.fokusBulan === idx(p)) { return { ok: false, ralat: 'Satu perubahan fokus sebulan.' }; }
    m.fokus = id; m.fokusBulan = idx(p);
    var r = simpan(m, {}, { tindakan: 'kkdw_fokus', nama: 'Fokus agihan: ' + f.label, peringkat: 'ahli' });
    return r && r.ok ? { ok: true, mesej: 'Fokus agihan ditukar kepada ' + f.label + '.' } : { ok: false, ralat: r && r.ralat };
  }
  function lulusProjek(id) {
    var p = S().loadPlayer(), m = getKKDW(p), e = ralatAm(p), d = cari(id), ini = idx(p);
    if (e) { return { ok: false, ralat: e }; }
    if (!d) { return { ok: false, ralat: 'Projek tidak sah.' }; }
    if (m.lulusBulan !== ini) { m.lulusBulan = ini; m.lulusBil = 0; }
    if (m.lulusBil >= CONFIG.LULUS_SEBULAN) { return { ok: false, ralat: 'Had ' + CONFIG.LULUS_SEBULAN + ' kelulusan projek sebulan.' }; }
    var k = kos(m, d);
    if (m.infrastructureFund < k) { return { ok: false, ralat: 'Dana infrastruktur tidak cukup.' }; }
    m.infrastructureFund -= k; m.lulusBil += 1;
    m.projek.push({ jenis: id, siapIdx: ini + d.bulan, lewat: false });
    if (id === 'pprs_baiki') { m.baikPulihIdx = ini; }
    var r = simpan(m, {}, { tindakan: 'kkdw_projek', nama: 'Projek diluluskan: ' + d.nama, peringkat: 'ahli' });
    var s = ini + d.bulan, b = ((s - 1) % 12) + 1, t = Math.floor((s - 1) / 12);
    return r && r.ok ? { ok: true, mesej: 'Projek diluluskan: ' + d.nama + ' (RM ' + k + ' juta). Siap bulan ' + b + '/' + t + '.' } : { ok: false, ralat: r && r.ralat };
  }
  function jawabAduan(id, o) {
    var p = S().loadPlayer(), m = getKKDW(p), e = ralatAm(p), j = JAWAB[id], K = KB();
    if (e) { return { ok: false, ralat: e }; }
    if (!m.aduan) { return { ok: false, ralat: 'Tiada aduan rakyat.' }; }
    if (!j) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    if (m.infrastructureFund < j.kos) { return { ok: false, ralat: 'Dana infrastruktur tidak cukup.' }; }
    var A = ADUAN[m.aduan.jenis], x = {}, d = { rating: 0, pop: 0 }, mesej;
    m.infrastructureFund -= j.kos;
    if (id === 'baiki') { x[A.sasaran] = j.skor; mesej = 'Aduan diselesaikan: kerja baik pulih segera dijalankan.'; }
    else if (id === 'hitam') {
      d.rating += j.rating; mesej = 'Kontraktor disenarai hitam.';
      if (rng(o)() < j.saman) { d.rating += j.samanRating; mesej += ' Kontraktor menyaman kementerian (KPI ' + j.samanRating + ').'; }
    } else { x[A.sasaran] = j.skor; d.pop += j.pop; mesej = 'Aduan diabaikan: rakyat kecewa.'; }
    laras(m, x); m.aduan = null; m.aduanBulan = idx(p);
    var r = simpan(m, {}, { tindakan: 'kkdw_aduan', nama: A.nama + ': ' + j.label, peringkat: 'ahli' });
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    if (K && K.laras && (d.rating || d.pop)) { K.laras(d); }
    return { ok: true, mesej: mesej };
  }

  /* ---------- Bulanan (calendar.js) ---------- */
  function prosesBulan(o) {
    var p = S() && S().loadPlayer(), ev = [];
    if (!p || p.tamat || (!p.kkdw && !aktif(p))) { return { peristiwa: ev }; }
    var m = getKKDW(p), K = KB(), on = aktif(p), r = rng(o), ini = idx(p), C = CONFIG, kes = {}, d = { rating: 0, pop: 0 };
    m.lalu = { luar: m.ruralSupportScore, rumah: m.ruralHousingSatisfaction };
    if (m.infrastructureFund + C.DANA_BULAN > C.DANA_HAD) {
      if (on) { d.rating += C.TERSADAI_RATING; ev.push({ jenis: 'kabinet', mesej: 'Dana infrastruktur rakyat tersadai tanpa digunakan (KPI ' + C.TERSADAI_RATING + ').' }); }
    }
    m.infrastructureFund = Math.min(C.DANA_HAD, m.infrastructureFund + C.DANA_BULAN);
    var f = fokus(m); laras(m, { luar: f.luar, rumah: f.rumah });
    var lewatAda = false;
    m.projek = m.projek.filter(function (pr) {
      var D = cari(pr.jenis); if (!D) { return false; }
      if (pr.siapIdx > ini) {
        if (D.lewat && !pr.lewat && r() < C.LEWAT_PELUANG) { pr.lewat = true; pr.siapIdx += C.LEWAT_BULAN; laras(m, { rumah: C.LEWAT_RUMAH }); if (on) { ev.push({ jenis: 'kabinet', mesej: D.nama + ': kontraktor lewat ' + C.LEWAT_BULAN + ' bulan (kepuasan perumahan ' + C.LEWAT_RUMAH + ').' }); } }
        if (pr.lewat) { lewatAda = true; }
        return true;
      }
      laras(m, D.kesan);
      if (D.kesan.akar) { kes.kesetiaan = { akarUmbi: ((kes.kesetiaan && kes.kesetiaan.akarUmbi) || 0) + D.kesan.akar }; }
      if (D.kesan.ip) { kes.ip = (kes.ip || 0) + D.kesan.ip; }
      if (on) { ev.push({ jenis: 'kabinet', mesej: 'Projek siap: ' + D.nama + '.' }); }
      return false;
    });
    if (m.aduan) {
      var A = ADUAN[m.aduan.jenis], x = {}; m.aduan.bulan += 1; x[A.sasaran] = ADUAN_BULANAN; laras(m, x);
      if (on) { ev.push({ jenis: 'kabinet', mesej: 'Aduan rakyat belum dijawab: ' + A.nama + '.' }); }
    } else if (on) {
      var lama = ini - m.baikPulihIdx > C.ADUAN_RUMAH_LAMA, pel = clamp(C.ADUAN_ASAS + (lewatAda ? 0.1 : 0) + (lama ? 0.1 : 0), 0, C.ADUAN_MAKS);
      if (r() < pel) {
        var jenis = lama || lewatAda ? (r() < 0.6 ? 'bocor' : (r() < 0.5 ? 'lubang' : 'air')) : ['bocor', 'lubang', 'air'][Math.floor(r() * 3)];
        m.aduan = { jenis: jenis, bulan: 0 }; ev.push({ jenis: 'kabinet', mesej: 'Aduan rakyat baharu: ' + ADUAN[jenis].nama + '. Jawab di Pejabat KKDW.' });
      }
    }
    if (on) {
      d.pop += clamp(Math.round((m.ruralSupportScore + m.ruralHousingSatisfaction - 100) / 20), -3, 3);
      if (m.ruralSupportScore < C.RENDAH || m.ruralHousingSatisfaction < C.RENDAH) { d.rating += C.RENDAH_RATING; ev.push({ jenis: 'kabinet', mesej: 'Sokongan luar bandar atau kepuasan perumahan rendah: KPI portfolio ' + C.RENDAH_RATING + '.' }); }
    }
    simpan(m, kes);
    if (on && K && K.laras && (d.rating || d.pop)) { K.laras(d); }
    return { peristiwa: ev };
  }

  function ringkasan(p) {
    var m = getKKDW(p), ini = idx(p), l = m.lalu || {}, bil = m.lulusBulan === ini ? m.lulusBil : 0, A = m.aduan ? ADUAN[m.aduan.jenis] : null;
    return { aktif: aktif(p), luar: m.ruralSupportScore, rumah: m.ruralHousingSatisfaction, dana: m.infrastructureFund, danaBulan: CONFIG.DANA_BULAN, danaHad: CONFIG.DANA_HAD,
      arah: { luar: l.luar === undefined ? 0 : m.ruralSupportScore - l.luar, rumah: l.rumah === undefined ? 0 : m.ruralHousingSatisfaction - l.rumah },
      fokus: m.fokus, fokusBoleh: m.fokusBulan !== ini, fokusPilihan: FOKUS.map(function (f) { return { id: f.id, label: f.label }; }),
      lulusBaki: CONFIG.LULUS_SEBULAN - bil,
      projek: PROJEK.map(function (d) { var k = kos(m, d), sebab = bil >= CONFIG.LULUS_SEBULAN ? 'Had ' + CONFIG.LULUS_SEBULAN + ' kelulusan projek sebulan.' : m.infrastructureFund < k ? 'Dana infrastruktur tidak cukup.' : ''; return { id: d.id, ikon: d.ikon, nama: d.nama, jenis: d.jenis, kos: k, kosAsal: d.kos, bulan: d.bulan, kesan: d.kesan, lewat: !!d.lewat, boleh: !sebab, sebab: sebab }; }),
      binaan: m.projek.map(function (pr) { var D = cari(pr.jenis); return { nama: D ? D.nama : pr.jenis, bulan: ((pr.siapIdx - 1) % 12) + 1, tahun: Math.floor((pr.siapIdx - 1) / 12), lewat: pr.lewat }; }),
      aduan: A ? { nama: A.nama, ikon: A.ikon, sasaran: A.sasaran, bulan: m.aduan.bulan, pilihan: Object.keys(JAWAB).map(function (k) { var j = JAWAB[k]; return { id: k, label: j.label, ikon: j.ikon, kos: j.kos, boleh: m.infrastructureFund >= j.kos }; }) } : null };
  }

  return { CONFIG: CONFIG, PROJEK: PROJEK, FOKUS: FOKUS, ADUAN: ADUAN, JAWAB: JAWAB, setRng: function (f) { rngLalai = f || Math.random; },
    getKKDW: getKKDW, aktif: aktif, kos: kos, tukarFokus: tukarFokus, lulusProjek: lulusProjek, jawabAduan: jawabAduan, prosesBulan: prosesBulan, ringkasan: ringkasan };
});
