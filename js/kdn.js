/* ==========================================================================
   Nusa Politik — js/kdn.js   (v13.72)
   Modul Kementerian Dalam Negeri (KDN Engine), mockup dipersetujui.
     State p.kdn = { publicOrderMeter (0-100), civilLiberties (0-100), policeReadiness (0-100), sokonganAktivis (0-100),
                     dana (RM juta), dasar { permit, pertubuhan }, ancaman { jenis, bulan } | null,
                     agensiBulan, dasarBulan, kecemasanIdx, sempadanHingga, lalu {...} }
     1. Tab "Pejabat KDN" hanya untuk pemegang portfolio Menteri Dalam Negeri (js/kdn-ui.js).
     2. Ancaman rawak (PATI, himpunan, jenayah terancang) menurunkan ketenteraman setiap bulan sehingga Operasi Khas berjaya.
     3. Arahan agensi (Imigresen, sempadan, PDRM, integriti): satu sebulan. Dasar kebebasan sivil (permit himpunan,
        pendaftaran pertubuhan): satu perubahan sebulan. Peruntukan kecemasan daripada Perbendaharaan: sekali 6 bulan.
     4. Bulanan: meter bergerak ke arah sasaran dasar; ketenteraman < 40 = KPI dan populariti jatuh; kebebasan sivil < 30 =
        Reputasi jatuh dan risiko rombakan naik.
   ANDAIAN: semua nilai ialah anggaran permainan; agensi dan operasi ialah label simulasi.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikKDN = api;
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
    TENTERAM_AWAL: 65, BEBAS_AWAL: 55, SIAP_AWAL: 55, AKTIVIS_AWAL: 45,
    DANA_AWAL: 80, DANA_BULAN: 40, DANA_HAD: 160, SUSUT_SIAP: 2,
    ANCAMAN_ASAS: 0.25, ANCAMAN_MIN: 0.1, ANCAMAN_MAKS: 0.5,
    OPS_IP: 15, OPS_TENTERAM: 8, OPS_RATING: 4, OPS_GAGAL_RATING: -2,
    KECEMASAN: { dana: 80, rombak: 4, rizab: 0.08, selang: 6 },
    TENTERAM_RENDAH: 40, RENDAH_RATING: -4, RENDAH_POP: -2,
    BEBAS_RENDAH: 30, BEBAS_REP: -1, BEBAS_ROMBAK: 2, AKTIVIS_RENDAH: 25
  };
  var ANCAMAN = {
    pati: { nama: 'Gelombang PATI di sempadan', ikon: '🚤', tenteram: -3, ops: 'Ops Sempadan Bersepadu (APMM, Imigresen, PDRM)', opsIkon: '⚓', kos: 60 },
    himpunan: { nama: 'Himpunan jalanan besar di ibu kota', ikon: '📢', tenteram: -4, ops: 'Ops Kawalan Himpunan', opsIkon: '🛡️', kos: 40, bebas: -3, aktivis: -5 },
    jenayah: { nama: 'Sindiket jenayah terancang', ikon: '🕵️', tenteram: -3, ops: 'Ops Basmi Sindiket', opsIkon: '🚔', kos: 50 }
  };
  var AGENSI = [
    { id: 'imigresen', ikon: '🛂', nama: 'Imigresen', huraian: 'Ops PATI dan pemutihan pekerja asing', kos: 25, kesan: { tenteram: 4, siap: 2, bebas: -1 } },
    { id: 'sempadan', ikon: '⚓', nama: 'Kawalan sempadan', huraian: 'Rondaan APMM dan pos sempadan; risiko gelombang PATI berkurang 3 bulan', kos: 30, kesan: { siap: 5 } },
    { id: 'pdrm', ikon: '👮', nama: 'PDRM', huraian: 'Latihan, peralatan dan polis peronda', kos: 35, kesan: { siap: 7, tenteram: 2 } },
    { id: 'integriti', ikon: '⚖️', nama: 'Siasatan integriti agensi', huraian: 'Bersihkan salah laku dalam agensi', kos: 10, kesan: { bebas: 3, aktivis: 4, siap: -2 } }
  ];
  var DASAR = {
    permit: { nama: 'Permit himpunan', ikon: '📣', pilihan: [
      { id: 'longgar', label: 'Longgar', bebas: 12, aktivis: 10, tenteram: -6 }, { id: 'sederhana', label: 'Sederhana', bebas: 0, aktivis: 0, tenteram: 0 }, { id: 'ketat', label: 'Ketat', bebas: -12, aktivis: -12, tenteram: 6 }] },
    pertubuhan: { nama: 'Pendaftaran pertubuhan', ikon: '🏛️', pilihan: [
      { id: 'mudah', label: 'Mudah', bebas: 8, aktivis: 6, tenteram: -2 }, { id: 'biasa', label: 'Biasa', bebas: 0, aktivis: 0, tenteram: 0 }, { id: 'ketat', label: 'Ketat', bebas: -8, aktivis: -8, tenteram: 3 }] }
  };
  var URUTAN_DASAR = ['permit', 'pertubuhan'];

  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function dasar() {
    return { publicOrderMeter: CONFIG.TENTERAM_AWAL, civilLiberties: CONFIG.BEBAS_AWAL, policeReadiness: CONFIG.SIAP_AWAL, sokonganAktivis: CONFIG.AKTIVIS_AWAL,
      dana: CONFIG.DANA_AWAL, dasar: { permit: 'sederhana', pertubuhan: 'biasa' }, ancaman: null, agensiBulan: 0, dasarBulan: 0, kecemasanIdx: -99, sempadanHingga: 0, siapBulan: 0, opsBulan: 0, lalu: null };
  }
  function getKDN(p) {
    var b = dasar(), m = p && p.kdn && typeof p.kdn === 'object' ? p.kdn : {};
    for (var f in b) { if (m[f] === undefined) { m[f] = b[f]; } }
    return m;
  }
  function simpan(m, kesan, log) { return S().applyEffects(kesan || {}, { kiraTindakan: false, patch: { kdn: m }, log: log }); }
  /** Pemain memegang portfolio Menteri Dalam Negeri (Menteri Penuh). */
  function aktif(p) {
    var K = KB(); if (!p || !K) { return false; }
    var k = K.getKabinet(p);
    return !!(k.hasGovernmentRole && k.roleLevel === 'MENTERI_PENUH' && /^Menteri Dalam Negeri$/.test(String(k.portfolioName || '')));
  }
  function pilihan(d, id) { var t = DASAR[d]; for (var i = 0; i < t.pilihan.length; i++) { if (t.pilihan[i].id === id) { return t.pilihan[i]; } } return t.pilihan[1]; }
  function laras(m, x) {
    if (x.tenteram) { m.publicOrderMeter = clamp(Math.round(m.publicOrderMeter + x.tenteram), 0, 100); }
    if (x.bebas) { m.civilLiberties = clamp(Math.round(m.civilLiberties + x.bebas), 0, 100); }
    if (x.siap) { m.policeReadiness = clamp(Math.round(m.policeReadiness + x.siap), 0, 100); }
    if (x.aktivis) { m.sokonganAktivis = clamp(Math.round(m.sokonganAktivis + x.aktivis), 0, 100); }
  }
  function sasaran(m) {
    var a = pilihan('permit', m.dasar.permit), b = pilihan('pertubuhan', m.dasar.pertubuhan);
    var bebas = CONFIG.BEBAS_AWAL + a.bebas + b.bebas;
    return { bebas: clamp(bebas, 0, 100), aktivis: clamp(Math.round(CONFIG.AKTIVIS_AWAL + a.aktivis + b.aktivis + (m.civilLiberties - CONFIG.BEBAS_AWAL) * 0.3), 0, 100),
      tenteram: clamp(Math.round(70 + a.tenteram + b.tenteram + (m.policeReadiness - CONFIG.SIAP_AWAL) * 0.3), 0, 100) };
  }
  function peluangOps(m) { return clamp(m.policeReadiness / 100, 0.2, 0.9); }
  function peluangAncaman(m) { return clamp(CONFIG.ANCAMAN_ASAS + (60 - m.policeReadiness) / 200, CONFIG.ANCAMAN_MIN, CONFIG.ANCAMAN_MAKS); }

  /* ---------- Arahan agensi ---------- */
  function arahAgensi(id) {
    var p = S().loadPlayer(), m = getKDN(p), a = AGENSI.filter(function (x) { return x.id === id; })[0];
    if (!aktif(p)) { return { ok: false, ralat: 'Hanya Menteri Dalam Negeri.' }; }
    if (!a) { return { ok: false, ralat: 'Arahan tidak sah.' }; }
    if (m.agensiBulan === idx(p)) { return { ok: false, ralat: 'Satu arahan agensi sebulan.' }; }
    if (m.dana < a.kos) { return { ok: false, ralat: 'Peruntukan operasi tidak cukup.' }; }
    m.dana -= a.kos; m.agensiBulan = idx(p); laras(m, a.kesan);
    if (a.id === 'sempadan') { m.sempadanHingga = idx(p) + 3; }
    if (a.id === 'sempadan' || a.id === 'pdrm') { m.siapBulan = idx(p); }
    var r = simpan(m, {}, { tindakan: 'kdn_agensi', nama: a.nama + ': ' + a.huraian, peringkat: 'ahli' });
    return r && r.ok ? { ok: true, mesej: 'Arahan dikeluarkan: ' + a.nama + '.' } : { ok: false, ralat: r && r.ralat };
  }
  /* ---------- Dasar kebebasan sivil ---------- */
  function ubahDasar(d, id) {
    var p = S().loadPlayer(), m = getKDN(p), t = DASAR[d];
    if (!aktif(p)) { return { ok: false, ralat: 'Hanya Menteri Dalam Negeri.' }; }
    if (!t || !t.pilihan.some(function (x) { return x.id === id; })) { return { ok: false, ralat: 'Dasar tidak sah.' }; }
    if (m.dasar[d] === id) { return { ok: false, ralat: 'Dasar itu sedang berkuat kuasa.' }; }
    if (m.dasarBulan === idx(p)) { return { ok: false, ralat: 'Satu perubahan dasar sebulan.' }; }
    var lama = pilihan(d, m.dasar[d]), baru = pilihan(d, id);
    m.dasar[d] = id; m.dasarBulan = idx(p);
    laras(m, { bebas: (baru.bebas - lama.bebas) / 2, aktivis: (baru.aktivis - lama.aktivis) / 2, tenteram: (baru.tenteram - lama.tenteram) / 2 });   // kesan pengumuman serta-merta
    var r = simpan(m, {}, { tindakan: 'kdn_dasar', nama: t.nama + ': ' + baru.label, peringkat: 'ahli' });
    return r && r.ok ? { ok: true, mesej: t.nama + ' ditukar kepada ' + baru.label + '.' } : { ok: false, ralat: r && r.ralat };
  }
  /* ---------- Operasi Khas & peruntukan kecemasan ---------- */
  function lancarOps(o) {
    var p = S().loadPlayer(), m = getKDN(p), K = KB();
    if (!aktif(p)) { return { ok: false, ralat: 'Hanya Menteri Dalam Negeri.' }; }
    if (!m.ancaman) { return { ok: false, ralat: 'Tiada ancaman semasa.' }; }
    if (m.opsBulan === idx(p)) { return { ok: false, ralat: 'Satu Operasi Khas sebulan.' }; }
    var A = ANCAMAN[m.ancaman.jenis];
    if (m.dana < A.kos) { return { ok: false, ralat: 'Peruntukan operasi tidak cukup. Mohon peruntukan kecemasan.' }; }
    var jaya = rng(o)() < peluangOps(m);
    m.dana -= A.kos; m.opsBulan = idx(p);
    if (A.bebas || A.aktivis) { laras(m, { bebas: A.bebas || 0, aktivis: A.aktivis || 0 }); }
    if (jaya) { laras(m, { tenteram: CONFIG.OPS_TENTERAM }); m.ancaman = null; }
    else { laras(m, { tenteram: Math.round(CONFIG.OPS_TENTERAM / 2) }); }
    var r = simpan(m, jaya ? { ip: CONFIG.OPS_IP } : {}, { tindakan: 'kdn_ops', nama: A.ops + (jaya ? ' berjaya' : ' tidak berjaya'), peringkat: 'ahli' });
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    if (K && K.laras) { K.laras({ rating: jaya ? CONFIG.OPS_RATING : CONFIG.OPS_GAGAL_RATING }); }
    return { ok: true, jaya: jaya, mesej: jaya ? A.ops + ' berjaya: ancaman ditangani. Ketenteraman +' + CONFIG.OPS_TENTERAM + ', IP +' + CONFIG.OPS_IP + '.' : A.ops + ' tidak berjaya sepenuhnya: ancaman masih berlarutan.' };
  }
  function bolehKecemasan(p, m) { return idx(p) - m.kecemasanIdx >= CONFIG.KECEMASAN.selang; }
  function mohonKecemasan() {
    var p = S().loadPlayer(), m = getKDN(p), K = KB(), C = CONFIG.KECEMASAN;
    if (!aktif(p)) { return { ok: false, ralat: 'Hanya Menteri Dalam Negeri.' }; }
    if (!bolehKecemasan(p, m)) { return { ok: false, ralat: 'Peruntukan kecemasan hanya sekali setiap ' + C.selang + ' bulan.' }; }
    m.dana = Math.min(CONFIG.DANA_HAD + C.dana, m.dana + C.dana); m.kecemasanIdx = idx(p);
    var patch = { kdn: m };
    if (p.mof && typeof p.mof === 'object') { var mf = p.mof; mf.nationalTreasury = Math.round(((Number(mf.nationalTreasury) || 0) - C.rizab) * 100) / 100; patch.mof = mf; }   // v13.70: rizab negara MOF
    var r = S().applyEffects({}, { kiraTindakan: false, patch: patch, log: { tindakan: 'kdn_kecemasan', nama: 'Peruntukan kecemasan KDN RM ' + C.dana + ' juta', peringkat: 'ahli' } });
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    if (K && K.laras) { K.laras({ rombak: C.rombak }); }
    return { ok: true, mesej: 'Perbendaharaan meluluskan peruntukan kecemasan RM ' + C.dana + ' juta. Risiko rombakan +' + C.rombak + '.' };
  }

  /* ---------- Bulanan (calendar.js) ---------- */
  function pilihAncaman(m, p, r) {
    var berat = { pati: idx(p) <= m.sempadanHingga ? 0.5 : 2, himpunan: m.sokonganAktivis < CONFIG.AKTIVIS_RENDAH ? 3 : 1, jenayah: 1 }, jumlah = 0, k;
    for (k in berat) { jumlah += berat[k]; }
    var x = r() * jumlah;
    for (k in berat) { x -= berat[k]; if (x < 0) { return k; } }
    return 'jenayah';
  }
  function prosesBulan(o) {
    var p = S() && S().loadPlayer(), ev = [];
    if (!p || p.tamat || (!p.kdn && !aktif(p))) { return { peristiwa: ev }; }
    var m = getKDN(p), K = KB(), on = aktif(p), r = rng(o), dahulu = idx(p) - 1;
    m.lalu = { tenteram: m.publicOrderMeter, bebas: m.civilLiberties, siap: m.policeReadiness, aktivis: m.sokonganAktivis };
    m.dana = Math.min(CONFIG.DANA_HAD, m.dana + CONFIG.DANA_BULAN);
    var s = sasaran(m);
    m.civilLiberties = Math.round(m.civilLiberties + (s.bebas - m.civilLiberties) * 0.25);
    m.sokonganAktivis = Math.round(m.sokonganAktivis + (s.aktivis - m.sokonganAktivis) * 0.25);
    m.publicOrderMeter = Math.round(m.publicOrderMeter + (s.tenteram - m.publicOrderMeter) * 0.25);
    if (m.siapBulan !== dahulu) { m.policeReadiness = clamp(m.policeReadiness - CONFIG.SUSUT_SIAP, 0, 100); }   // tiada arahan PDRM / sempadan bulan lalu
    if (m.ancaman) {
      var A = ANCAMAN[m.ancaman.jenis]; m.ancaman.bulan += 1; laras(m, { tenteram: A.tenteram });
      if (on) { ev.push({ jenis: 'kabinet', mesej: A.nama + ' masih berlarutan (' + m.ancaman.bulan + ' bulan): ketenteraman awam ' + A.tenteram + '.' }); }
    } else if (on && r() < peluangAncaman(m)) {
      var j = pilihAncaman(m, p, r); m.ancaman = { jenis: j, bulan: 0 };
      ev.push({ jenis: 'kabinet', mesej: 'Ancaman keselamatan baharu: ' + ANCAMAN[j].nama + '. Lancarkan Operasi Khas di Pejabat KDN.' });
    }
    var kes = {};
    var d = { rating: 0, pop: 0, rombak: 0 };
    if (on && m.publicOrderMeter < CONFIG.TENTERAM_RENDAH) { d.rating += CONFIG.RENDAH_RATING; d.pop += CONFIG.RENDAH_POP; ev.push({ jenis: 'kabinet', mesej: 'Ketenteraman awam rendah (' + m.publicOrderMeter + '%): KPI portfolio ' + CONFIG.RENDAH_RATING + '.' }); }
    if (on && m.civilLiberties < CONFIG.BEBAS_RENDAH) { kes.reputasi = CONFIG.BEBAS_REP; d.rombak += CONFIG.BEBAS_ROMBAK; ev.push({ jenis: 'kabinet', mesej: 'Media dan NGO mengkritik sekatan kebebasan sivil: Reputasi ' + CONFIG.BEBAS_REP + '.' }); }
    simpan(m, kes);
    if (on && K && K.laras && (d.rating || d.pop || d.rombak)) { K.laras(d); }
    return { peristiwa: ev };
  }

  function ringkasan(p) {
    var m = getKDN(p), ini = idx(p), A = m.ancaman ? ANCAMAN[m.ancaman.jenis] : null, l = m.lalu || {};
    return { aktif: aktif(p), tenteram: m.publicOrderMeter, bebas: m.civilLiberties, siap: m.policeReadiness, aktivis: m.sokonganAktivis,
      arah: { tenteram: m.publicOrderMeter - (l.tenteram === undefined ? m.publicOrderMeter : l.tenteram), bebas: m.civilLiberties - (l.bebas === undefined ? m.civilLiberties : l.bebas),
        siap: m.policeReadiness - (l.siap === undefined ? m.policeReadiness : l.siap), aktivis: m.sokonganAktivis - (l.aktivis === undefined ? m.sokonganAktivis : l.aktivis) },
      dana: m.dana, danaBulan: CONFIG.DANA_BULAN, danaHad: CONFIG.DANA_HAD,
      ancaman: A ? { jenis: m.ancaman.jenis, nama: A.nama, ikon: A.ikon, tenteram: A.tenteram, bulan: m.ancaman.bulan, ops: A.ops, opsIkon: A.opsIkon, kos: A.kos, peluang: Math.round(peluangOps(m) * 100),
        boleh: m.dana >= A.kos && m.opsBulan !== ini, sebab: m.opsBulan === ini ? 'Satu Operasi Khas sebulan.' : m.dana < A.kos ? 'Peruntukan operasi tidak cukup.' : '' } : null,
      kecemasan: { dana: CONFIG.KECEMASAN.dana, rombak: CONFIG.KECEMASAN.rombak, boleh: bolehKecemasan(p, m), selang: CONFIG.KECEMASAN.selang },
      agensi: AGENSI.map(function (a) { var sebab = m.agensiBulan === ini ? 'Satu arahan agensi sebulan.' : m.dana < a.kos ? 'Peruntukan operasi tidak cukup.' : ''; return { id: a.id, ikon: a.ikon, nama: a.nama, huraian: a.huraian, kos: a.kos, kesan: a.kesan, boleh: !sebab, sebab: sebab }; }),
      agensiSudah: m.agensiBulan === ini,
      dasar: URUTAN_DASAR.map(function (d) { var T = DASAR[d]; return { kod: d, nama: T.nama, ikon: T.ikon, semasa: m.dasar[d], pilihan: T.pilihan.map(function (x) { return { id: x.id, label: x.label }; }) }; }),
      dasarBoleh: m.dasarBulan !== ini, sasaran: sasaran(m) };
  }

  return { CONFIG: CONFIG, ANCAMAN: ANCAMAN, AGENSI: AGENSI, DASAR: DASAR, setRng: function (f) { rngLalai = f || Math.random; },
    getKDN: getKDN, aktif: aktif, sasaran: sasaran, peluangOps: peluangOps, peluangAncaman: peluangAncaman,
    arahAgensi: arahAgensi, ubahDasar: ubahDasar, lancarOps: lancarOps, mohonKecemasan: mohonKecemasan, prosesBulan: prosesBulan, ringkasan: ringkasan };
});
