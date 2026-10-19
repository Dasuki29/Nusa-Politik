/* ==========================================================================
   Nusa Politik — js/integriti.js   (v7.58)
   Sistem Integriti, Tata Kelola Baik & Disiplin Parti. Menyambung ke Tataetika (js/etika.js) dan Kabinet (js/kabinet.js).
     1. partyDisciplineSystem: partyIntegrityScore (skor) dan whipCompliance (whip). Acara Whip pada bulan sidang Dewan (3, 7, 10):
        Patuh = skor/whip/akar umbi naik; Tentang = amaran rasmi Lembaga Disiplin, kemudian
        'Patuh & Terima Teguran' atau 'Ingkar Arahan Parti' (berisiko digantung / dipecat -> Ahli Politik Bebas, kerusi kekal).
     2. integrityAndGovernanceEngine: governanceRisk (risiko) 0-100 bagi pemegang jawatan kerajaan. Naik melalui jalan pintas
        (pilihan acara kabinet berisiko, peruntukan CDF besar). Risiko >= 60: maccAuditEvent (Audit Ketelusan SPRM):
        Kerjasama Penuh & Pasukan Guaman (kos Dana) atau Pembersihan Pentadbiran (lepas separuh CDF).
   State: p.integriti = { skor, whip, risiko, whipAcara, amaran, audit, auditTerakhir, sejarah }.
   ANDAIAN: semua angka ialah penyeimbang simulasi, bukan data sebenar. Mengikut Perkara 49A Perlembagaan Persekutuan, kerusi
   wakil rakyat yang dipecat parti kekal sehingga PRU; jawatan Kabinet/EXCO hilang.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikIntegriti = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function ET() { return modul('MyPolitikEtika', 'etika.js'); }
  function ST() { return modul('MyPolitikStres', 'stress.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  var rngLalai = null;
  function rng(o, p) { return (o && o.rng) || rngLalai || S().rngBerbenih(String(p && p.id) + '|' + (p && p.tahun) + '|' + (p && p.bulan) + '|integriti'); }

  var CONFIG = {
    SKOR_AWAL: 70, WHIP_AWAL: 80, SESI: [3, 7, 10],
    RISIKO_AUDIT: 60, JEDA_AUDIT: 12, RISIKO_SUSUT: 4, RISIKO_RATING_RENDAH: 2,
    WHIP_PULIH: 3,
    PATUH: { skor: 5, skorRakyat: 3, whip: 8, akarUmbi: 3, ip: 10 },
    TENTANG: { skor: -12, whip: -25 },
    TEGURAN: { skor: 10, whip: 10, ajk: 5, reputasi: 3 },
    INGKAR: { skor: -10, whip: -15, asas: 0.30, peluangPecat: 0.4, stress: 6, akarUmbi: -3 },
    AUDIT_KOS: { EXCO_NEGERI: 8000, TIMBALAN_MENTERI: 12000, MENTERI_PENUH: 15000, TIMBALAN_PM: 20000, PERDANA_MENTERI: 25000 },
    KERJASAMA: { risiko: -35, skor: 12, rating: 4, temuanRisiko: 85, temuanPeluang: 0.25, temuanSkor: -4, temuanRating: -6 },
    PEMBERSIHAN: { risiko: -50, skor: 6, cdf: 0.5, pop: -3, rombak: 8 },
    TIDAK_JAWAB: { risiko: 10, skor: -10, rating: -8 },
    SKOR_RENDAH: 30, SKOR_TINGGI: 80
  };

  /* dasar yang diarahkan parti: rakyat = memakmurkan rakyat; false = dasar kontroversi */
  var DASAR = [
    { id: 'kesihatan', tajuk: 'Skim Perlindungan Kesihatan Warga Emas', rakyat: true },
    { id: 'belia', tajuk: 'Skim Pinjaman Belia', rakyat: true },
    { id: 'jalan', tajuk: 'Projek Jalan Luar Bandar', rakyat: true },
    { id: 'tenaga', tajuk: 'Insentif Tenaga Boleh Baharu', rakyat: true },
    { id: 'cukai', tajuk: 'Pindaan Cukai Barang dan Perkhidmatan', rakyat: false },
    { id: 'subsidi', tajuk: 'Rasionalisasi Subsidi', rakyat: false },
    { id: 'tol', tajuk: 'Kenaikan Kadar Tol Lebuhraya', rakyat: false }
  ];

  function dasar0() { return { skor: CONFIG.SKOR_AWAL, whip: CONFIG.WHIP_AWAL, risiko: 0, whipAcara: null, amaran: null, audit: null, auditTerakhir: -999, sejarah: [] }; }
  function getIntegriti(p) {
    var b = dasar0(), d = p && p.integriti && typeof p.integriti === 'object' ? p.integriti : {};
    for (var f in b) { if (d[f] === undefined) { d[f] = b[f]; } }
    return d;
  }
  function simpan(d, kesan, opts) {
    opts = opts || {};
    return S().applyEffects(kesan || {}, { kiraTindakan: false, patch: { integriti: d }, log: opts.log });
  }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function rekod(d, p, jenis, mesej) { d.sejarah = (d.sejarah || []).concat([{ jenis: jenis, mesej: mesej, tahun: p.tahun, bulan: p.bulan }]).slice(-10); }
  function labelRisiko(n) { return n < 30 ? 'Rendah' : n < CONFIG.RISIKO_AUDIT ? 'Sederhana' : 'Tinggi'; }

  /* ---------- Status ---------- */
  function kab(p) { var K = KB(); return K ? K.getKabinet(p) : { hasGovernmentRole: false, roleLevel: 'NONE' }; }
  function wakil(p) { var P = PRU(); return !!(P && P.semuaStatus && P.semuaStatus(p).length); }
  function dipecat(p) { var E = ET(); return !!(E && E.getEtika(p).status === 'dipecat'); }
  function bebas(p) { return dipecat(p) && wakil(p); }
  function bolehDisiplin(p) { var E = ET(), st = E ? E.getEtika(p).status : 'baik'; return !p.tamat && st === 'baik' && (wakil(p) || kab(p).hasGovernmentRole); }
  function pegangKerajaan(p) { return !!kab(p).hasGovernmentRole; }
  /** Kad Integriti dipapar untuk wakil rakyat / pemegang jawatan kerajaan. */
  function aktif(p) { return !!p && !p.tamat && (wakil(p) || pegangKerajaan(p)); }

  /* ---------- Governance Risk ---------- */
  /** Naikkan (atau turunkan) governanceRisk; hanya bagi pemegang jawatan kerajaan. Pulang nilai baharu atau null. */
  function tambahRisiko(n, sebab) {
    var p = S().loadPlayer(); if (!p || !pegangKerajaan(p)) { return null; }
    var d = getIntegriti(p); d.risiko = clamp(Math.round(d.risiko + n), 0, 100);
    if (sebab && n > 0) { rekod(d, p, 'risiko', 'Risiko tadbir urus +' + Math.round(n) + ': ' + sebab); }
    simpan(d, {}); return d.risiko;
  }

  /* ---------- Whip & Disiplin ---------- */
  function whipSemasa(p) {
    var d = getIntegriti(p), w = d.whipAcara; if (!w) { return null; }
    return { tajuk: w.tajuk, rakyat: w.rakyat, huraian: 'Parti mengarahkan semua wakil rakyat menyokong: ' + w.tajuk + (w.rakyat ? ' (dasar yang memakmurkan rakyat).' : ' (dasar yang kontroversi di akar umbi).'),
      pilihan: [
        { id: 'patuh', nama: '🤝 Patuh & Sokong Arahan Parti', huraian: 'Whip +' + CONFIG.PATUH.whip + ' · Integriti +' + (CONFIG.PATUH.skor + (w.rakyat ? CONFIG.PATUH.skorRakyat : -3)) + ' · Akar umbi ' + (w.rakyat ? '+' + CONFIG.PATUH.akarUmbi : '-2') + ' · IP +' + CONFIG.PATUH.ip },
        { id: 'tentang', nama: '🔥 Tentang Arahan Parti', huraian: 'Whip ' + CONFIG.TENTANG.whip + ' · Integriti ' + CONFIG.TENTANG.skor + ' · Amaran rasmi Lembaga Disiplin · Akar umbi ' + (w.rakyat ? '-3' : '+2') }
      ] };
  }
  function jawabWhip(id, o) {
    var p = S().loadPlayer(), d = getIntegriti(p), w = d.whipAcara;
    if (!w) { return { ok: false, ralat: 'Tiada arahan parti menunggu.' }; }
    if (id !== 'patuh' && id !== 'tentang') { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    var kes = {}, mesej;
    if (id === 'patuh') {
      d.whip = clamp(d.whip + CONFIG.PATUH.whip, 0, 100); d.skor = clamp(d.skor + CONFIG.PATUH.skor + (w.rakyat ? CONFIG.PATUH.skorRakyat : -3), 0, 100);
      kes.ip = CONFIG.PATUH.ip; kes.kesetiaan = { akarUmbi: w.rakyat ? CONFIG.PATUH.akarUmbi : -2 };
      mesej = 'Anda mematuhi arahan parti dan menyokong ' + w.tajuk + '. Integriti Parti dan Kepatuhan Whip meningkat.';
      d.whipAcara = null; rekod(d, p, 'whip', 'Patuh: ' + w.tajuk);
      var r = simpan(d, kes, { log: { tindakan: 'integriti_whip', nama: 'Patuh arahan parti: ' + w.tajuk, peringkat: 'ahli' } });
      return r.ok ? { ok: true, mesej: mesej, amaran: false } : { ok: false, ralat: r.ralat };
    }
    d.whip = clamp(d.whip + CONFIG.TENTANG.whip, 0, 100); d.skor = clamp(d.skor + CONFIG.TENTANG.skor, 0, 100);
    kes.kesetiaan = { akarUmbi: w.rakyat ? -3 : 2 };
    d.whipAcara = null; d.amaran = { perkara: 'Melanggar arahan parti (Whip) berhubung ' + w.tajuk, tahun: p.tahun, bulan: p.bulan };
    rekod(d, p, 'whip', 'Menentang arahan parti: ' + w.tajuk);
    var res = simpan(d, kes, { log: { tindakan: 'integriti_whip', nama: 'Menentang arahan parti: ' + w.tajuk, peringkat: 'ahli' } });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    var E = ET(); if (E && E.hukum) { E.hukum('amaran', d.amaran.perkara, 'Fasal 20.10(a)'); }            // amaran rasmi dicatat dalam rekod disiplin
    return { ok: true, amaran: true, mesej: 'Lembaga Disiplin Parti mengeluarkan amaran rasmi: ' + d.amaran.perkara + '.' };
  }

  function amaranSemasa(p) {
    var d = getIntegriti(p); if (!d.amaran) { return null; }
    return { perkara: d.amaran.perkara, pilihan: [
      { id: 'patuh', nama: '🤝 Patuh & Terima Teguran', huraian: 'Integriti +' + CONFIG.TEGURAN.skor + ' · Whip +' + CONFIG.TEGURAN.whip + ' · Sokongan pimpinan +' + CONFIG.TEGURAN.ajk + ' · Reputasi +' + CONFIG.TEGURAN.reputasi },
      { id: 'ingkar', nama: '🔥 Ingkar Arahan Parti', huraian: 'Berisiko digantung atau dipecat (kira-kira ' + Math.round(peluangHukuman(p) * 100) + '%). Jika dipecat: Ahli Politik Bebas, kerusi kekal sehingga PRU.' }
    ] };
  }
  function peluangHukuman(p) {
    var d = getIntegriti(p);
    return clamp(CONFIG.INGKAR.asas + (50 - (d.skor + CONFIG.INGKAR.skor)) * 0.004 + (100 - (d.whip + CONFIG.INGKAR.whip)) * 0.002, 0.2, 0.7);
  }
  function jawabAmaran(id, o) {
    var p = S().loadPlayer(), d = getIntegriti(p), a = d.amaran, r = rng(o, p);
    if (!a) { return { ok: false, ralat: 'Tiada amaran menunggu.' }; }
    if (id !== 'patuh' && id !== 'ingkar') { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    if (id === 'patuh') {
      d.skor = clamp(d.skor + CONFIG.TEGURAN.skor, 0, 100); d.whip = clamp(d.whip + CONFIG.TEGURAN.whip, 0, 100); d.amaran = null;
      rekod(d, p, 'disiplin', 'Menerima teguran Lembaga Disiplin');
      var res = simpan(d, { reputasi: CONFIG.TEGURAN.reputasi, kesetiaan: { ajk: CONFIG.TEGURAN.ajk } }, { log: { tindakan: 'integriti_teguran', nama: 'Menerima teguran Lembaga Disiplin', peringkat: 'ahli' } });
      return res.ok ? { ok: true, hukuman: null, mesej: 'Anda menerima teguran dengan hormat. Sokongan pimpinan meningkat dan reputasi parti pulih.' } : { ok: false, ralat: res.ralat };
    }
    var peluang = peluangHukuman(p);
    d.skor = clamp(d.skor + CONFIG.INGKAR.skor, 0, 100); d.whip = clamp(d.whip + CONFIG.INGKAR.whip, 0, 100); d.amaran = null;
    if (r() >= peluang) {
      rekod(d, p, 'disiplin', 'Mengingkari arahan parti; tiada hukuman kali ini');
      var s2 = simpan(d, { kesetiaan: { akarUmbi: CONFIG.INGKAR.akarUmbi } }, { log: { tindakan: 'integriti_ingkar', nama: 'Mengingkari arahan parti', peringkat: 'ahli' } });
      if (!s2.ok) { return { ok: false, ralat: s2.ralat }; }
      var st = ST(); if (st && st.laras) { st.laras({ stress: CONFIG.INGKAR.stress }); }
      return { ok: true, hukuman: null, mesej: 'Anda mengingkari arahan parti tetapi Lembaga Disiplin belum bertindak. Hubungan dengan pimpinan renggang.' };
    }
    var jenis = r() < CONFIG.INGKAR.peluangPecat ? 'dipecat' : 'digantung', perkara = a.perkara, wk = wakil(p);
    d.skor = Math.min(d.skor, CONFIG.SKOR_RENDAH);
    rekod(d, p, 'disiplin', (jenis === 'dipecat' ? 'Dipecat parti' : 'Digantung keahlian') + ': ' + perkara);
    simpan(d, {}, {});
    var E = ET(), hk = E && E.hukum ? E.hukum(jenis, perkara, jenis === 'dipecat' ? 'Fasal 20.10(d)' : 'Fasal 20.10(b)') : null;
    var K = KB(); if (K && K.tamatPenggal) { K.tamatPenggal(); }                                     // jawatan Kabinet/EXCO hilang
    var mesej = jenis === 'dipecat'
      ? 'Anda DIPECAT daripada parti (disahkan MKT).' + (wk ? ' Anda kini Ahli Politik Bebas; kerusi wakil rakyat kekal sehingga PRU (Perkara 49A), tetapi jawatan Kabinet/EXCO hilang.' : '')
      : 'Keahlian anda DIGANTUNG. Semua jawatan parti dan jawatan Kabinet/EXCO dilucutkan.';
    return { ok: true, hukuman: jenis, bebas: jenis === 'dipecat' && wk, mesej: mesej, hukumanMesej: hk && hk.mesej };
  }

  /* ---------- Audit Ketelusan SPRM (maccAuditEvent) ---------- */
  function kosAudit(p) { return CONFIG.AUDIT_KOS[kab(p).roleLevel] || 8000; }
  function auditSemasa(p) {
    var d = getIntegriti(p); if (!d.audit) { return null; }
    var kos = kosAudit(p), kb = kab(p);
    return { risiko: d.risiko, kos: kos, portfolio: kb.portfolioName, cdfBaki: kb.cdfBaki || 0, pilihan: [
      { id: 'kerjasama', nama: '⚖️ Kerjasama Penuh & Lantik Pasukan Guaman', huraian: '−RM ' + kos.toLocaleString('ms-MY') + ' · Risiko ' + CONFIG.KERJASAMA.risiko + ' · Integriti +' + CONFIG.KERJASAMA.skor + ' · Tadbir Urus +' + CONFIG.KERJASAMA.rating + '% · kekal portfolio', boleh: (Number(p.myr) || 0) >= kos, sebab: 'Dana tidak mencukupi.' },
      { id: 'pembersihan', nama: '🧹 Menjalankan Pembersihan Pentadbiran', huraian: 'Akui kesilapan prosedur · lepas separuh peruntukan CDF · Risiko ' + CONFIG.PEMBERSIHAN.risiko + ' · Integriti +' + CONFIG.PEMBERSIHAN.skor + ' · risiko rombakan +' + CONFIG.PEMBERSIHAN.rombak, boleh: true, sebab: '' }
    ] };
  }
  function jawabAudit(id, o) {
    var p = S().loadPlayer(), d = getIntegriti(p), r = rng(o, p), K = KB();
    if (!d.audit) { return { ok: false, ralat: 'Tiada audit menunggu.' }; }
    var a = auditSemasa(p).pilihan.filter(function (x) { return x.id === id; })[0];
    if (!a) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    if (!a.boleh) { return { ok: false, ralat: a.sebab }; }
    var kes = {}, mesej, ratingX = 0, kbPatch = null, risikoAsal = d.risiko;
    if (id === 'kerjasama') {
      var c = CONFIG.KERJASAMA; kes.myr = -kosAudit(p);
      d.risiko = clamp(d.risiko + c.risiko, 0, 100); d.skor = clamp(d.skor + c.skor, 0, 100); ratingX = c.rating;
      mesej = 'Anda bekerjasama sepenuhnya dan melantik pasukan guaman. Audit membuktikan ketelusan pentadbiran anda. Integriti Parti meningkat.';
      if (risikoAsal >= c.temuanRisiko && r() < c.temuanPeluang) { d.skor = clamp(d.skor + c.temuanSkor, 0, 100); ratingX += c.temuanRating; mesej += ' Namun, audit menemui beberapa kesilapan prosedur kecil (Integriti ' + c.temuanSkor + ', Tadbir Urus ' + c.temuanRating + '%).'; }
    } else {
      var q = CONFIG.PEMBERSIHAN; d.risiko = clamp(d.risiko + q.risiko, 0, 100); d.skor = clamp(d.skor + q.skor, 0, 100);
      var kb = K ? K.getKabinet(p) : null;
      if (kb) { kb.cdfBaki = Math.round((kb.cdfBaki || 0) * q.cdf); kbPatch = kb; }
      mesej = 'Anda mengakui kesilapan prosedur dan melepaskan separuh peruntukan projek (CDF). Imej parti dipelihara.';
    }
    d.audit = null; d.auditTerakhir = idx(p); rekod(d, p, 'audit', (id === 'kerjasama' ? 'Audit SPRM: kerjasama penuh' : 'Audit SPRM: pembersihan pentadbiran'));
    var res = S().applyEffects(kes, { kiraTindakan: false, patch: kbPatch ? { integriti: d, kabinet: kbPatch } : { integriti: d }, log: { tindakan: 'integriti_audit', nama: 'Audit Ketelusan SPRM: ' + (id === 'kerjasama' ? 'kerjasama penuh' : 'pembersihan'), peringkat: 'ahli' } });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    if (K && K.laras) { K.laras({ rating: ratingX, tekanan: 0, pop: id === 'pembersihan' ? CONFIG.PEMBERSIHAN.pop : 0, rombak: id === 'pembersihan' ? CONFIG.PEMBERSIHAN.rombak : 0 }); }
    return { ok: true, mesej: mesej, risiko: d.risiko, skor: d.skor };
  }

  /* ---------- Denyut bulanan ---------- */
  function prosesBulan(o) {
    var ev = [], p = S() && S().loadPlayer();
    if (!p || p.tamat || !aktif(p)) { return { peristiwa: ev }; }
    var d = getIntegriti(p), r = rng(o, p), kes = {}, kb = kab(p), now = idx(p);
    // 1. pemulihan & kesan skor
    if (d.whip < CONFIG.WHIP_AWAL) { d.whip = Math.min(CONFIG.WHIP_AWAL, d.whip + CONFIG.WHIP_PULIH); }
    if (d.skor >= CONFIG.SKOR_TINGGI) { kes.kesetiaan = { akarUmbi: 1 }; } else if (d.skor < CONFIG.SKOR_RENDAH) { kes.kesetiaan = { akarUmbi: -1 }; }
    if (kb.hasGovernmentRole) { d.risiko = clamp(d.risiko - CONFIG.RISIKO_SUSUT + (Number(kb.governanceRating) < 40 ? CONFIG.RISIKO_RATING_RENDAH + CONFIG.RISIKO_SUSUT : 0), 0, 100); }
    else { d.risiko = 0; d.audit = null; }
    // 2. acara tidak dijawab
    if (d.whipAcara) { d.whip = clamp(d.whip - 10, 0, 100); d.skor = clamp(d.skor - 5, 0, 100); ev.push({ jenis: 'integriti', mesej: 'Anda tidak memberi respons kepada arahan parti (Whip). Kepatuhan Whip -10, Integriti Parti -5.' }); d.whipAcara = null; }
    if (d.amaran) { d.skor = clamp(d.skor - 8, 0, 100); ev.push({ jenis: 'integriti', mesej: 'Anda tidak menjawab amaran Lembaga Disiplin. Integriti Parti -8.' }); d.amaran = null; }
    var ratingX = 0;
    if (d.audit) { var t = CONFIG.TIDAK_JAWAB; d.risiko = clamp(d.risiko + t.risiko, 0, 100); d.skor = clamp(d.skor + t.skor, 0, 100); ratingX = t.rating; d.auditTerakhir = now; d.audit = null; ev.push({ jenis: 'integriti', mesej: 'Anda mengelak audit SPRM. Imej ketelusan tercalar (Risiko +' + t.risiko + ', Integriti ' + t.skor + ', Tadbir Urus ' + t.rating + '%).' }); }
    // 3. acara baharu
    var sesi = CONFIG.SESI.indexOf(parseInt(p.bulan, 10)) >= 0;
    if (sesi && bolehDisiplin(p)) {
      var dsr = DASAR[Math.floor(r() * DASAR.length)];
      d.whipAcara = { id: dsr.id, tajuk: dsr.tajuk, rakyat: dsr.rakyat, tahun: p.tahun, bulan: p.bulan };
      ev.push({ jenis: 'integriti_whip', mesej: 'Setiausaha Agung mengeluarkan arahan Whip: sokong ' + dsr.tajuk + '.' });
    }
    if (kb.hasGovernmentRole && !d.audit && !d.whipAcara && d.risiko >= CONFIG.RISIKO_AUDIT && now - d.auditTerakhir >= CONFIG.JEDA_AUDIT) {
      d.audit = { mulaIdx: now }; ev.push({ jenis: 'integriti_audit', mesej: 'SPRM membuka Audit Ketelusan ke atas projek di bawah ' + (kb.portfolioName || 'jawatan anda') + ' (Risiko Tadbir Urus ' + d.risiko + '%).' });
    }
    simpan(d, kes);
    if (ratingX) { var K = KB(); if (K && K.laras) { K.laras({ rating: ratingX, tekanan: 0, pop: 0, rombak: 0 }); } }
    return { peristiwa: ev };
  }

  function ringkasan(p) {
    var d = getIntegriti(p), kb = kab(p);
    return { aktif: aktif(p), skor: d.skor, whip: d.whip, risiko: d.risiko, labelRisiko: labelRisiko(d.risiko), tunjukRisiko: !!kb.hasGovernmentRole, bebas: bebas(p), dipecat: dipecat(p),
      whipAcara: whipSemasa(p), amaran: amaranSemasa(p), audit: auditSemasa(p), sejarah: d.sejarah || [] };
  }

  return {
    CONFIG: CONFIG, DASAR: DASAR, setRng: function (f) { rngLalai = f || null; },
    getIntegriti: getIntegriti, aktif: aktif, bebas: bebas, tambahRisiko: tambahRisiko, labelRisiko: labelRisiko,
    whipSemasa: whipSemasa, jawabWhip: jawabWhip, amaranSemasa: amaranSemasa, jawabAmaran: jawabAmaran, peluangHukuman: peluangHukuman,
    auditSemasa: auditSemasa, jawabAudit: jawabAudit, prosesBulan: prosesBulan, ringkasan: ringkasan
  };
});
