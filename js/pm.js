/* ==========================================================================
   Nusa Politik — js/pm.js   (v13.75)
   Modul Pejabat Perdana Menteri, mockup dipersetujui. Menyambung sistem sedia ada:
     - jawatan PM (kabinet.js roleLevel 'PERDANA_MENTERI'), Jemaah Menteri dan rombakan (jemaah.js),
     - kerusi kerajaan dan Usul Undi Tidak Percaya (dewan.js, ambang 112).
   State p.pm = { cabinetStability (0-100), nationalCrisisLevel (0-100), blok { rakan|borneo: { kepuasan, tarik } }, goyah,
                  tuntutan { blok, jenis, bulan } | null, agihIdx, dasarTahun, tegasBulan, daruratHingga, daruratPenggal, jemaahRujuk, lalu }
   Dikira: isPrimeMinister, parliamentaryMajority = kerusi kerajaan − blok yang menarik sokongan − MP goyah.
   Bulanan: krisis nasional bergerak ke sasaran (KDN/MOF jika ada) + acara rawak; blok tidak puas hati menuntut; kepuasan < 25 = tarik
   sokongan (pulih >= 45); kestabilan < 30 = MP goyah +3; krisis >= 60 = populariti dan kestabilan jatuh.
   dewan.js: majoriti < 112 mencetuskan Usul Undi Tidak Percaya; darurat menyekat usul 6 bulan.
   ANDAIAN: semua nilai ialah anggaran permainan; pecahan rakan 60% Semenanjung / 40% Sabah & Sarawak (data kerusi hanya ada jumlah rakan).
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikPM = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function DW() { return modul('MyPolitikDewan', 'dewan.js'); }
  function JM() { return modul('MyPolitikJemaah', 'jemaah.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  var rngLalai = Math.random;
  function rng(o) { return (o && o.rng) || rngLalai; }

  var CONFIG = {
    AMBANG: 112, JUMLAH: 222, STABIL_AWAL: 60, KRISIS_AWAL: 25, BLOK_AWAL: 55, PECAH_RAKAN: 0.6,
    TARIK: 25, PULIH: 45, BLOK_SUSUT: 1, TUNTUTAN_PELUANG: 0.3, TUNTUTAN_MAKS_PUAS: 60, TUNTUTAN_ABAI: -5,
    STABIL_RENDAH: 30, GOYAH_TAMBAH: 3, KRISIS_TINGGI: 60, KRISIS_POP: -2, KRISIS_STABIL: -2, ACARA_PELUANG: 0.15, ACARA_KRISIS: 15,
    JAWAB: { terima: { blok: 20, stabil: -5, rizab: 1.0 }, runding: { ap: 1, peluang: 0.55, jaya: 10, gagal: -5 }, tolak: { blok: -15, stabil: 3 } },
    AGIH: { blok: 15, stabil: -6, selang: 3 },
    TEGAS: { krisis: -15, pop: -3, bebas: -8 },
    DARURAT: { minKrisis: 60, krisis: -35, bulan: 6, pop: -8, reputasi: -5, bebas: -20, stabil: -10 },
    TP_JEDA_MAJORITI: 3
  };
  var BLOK = [
    { kod: 'rakan', nama: 'Rakan gabungan (Semenanjung)' },
    { kod: 'borneo', nama: 'Blok Sabah & Sarawak' }
  ];
  var TUNTUTAN = {
    jawatan: 'mahu 2 jawatan menteri penuh tambahan',
    peruntukan: 'mahu peruntukan pembangunan RM 1 bilion untuk kawasan mereka'
  };
  var DASAR = [
    { id: 'rmk', ikon: '📘', nama: 'Rancangan Malaysia', huraian: 'Pelan pembangunan lima tahun', kesan: { pop: 5, krisis: -5 } },
    { id: 'gaji', ikon: '💵', nama: 'Gaji minimum baharu', huraian: 'Naikkan gaji minimum nasional', kesan: { pop: 6, rakan: -5 } },
    { id: 'reformasi', ikon: '⚖️', nama: 'Reformasi institusi', huraian: 'Pisah kuasa dan perkukuh badan pengawas', kesan: { stabil: -5, reputasi: 5 } },
    { id: 'mega', ikon: '🚄', nama: 'Projek infrastruktur mega', huraian: 'Rel laju dan lebuh raya baharu', kesan: { pop: 4, ip: 40, rizab: 3.0 } }
  ];
  var ACARA = ['Harga minyak dunia melonjak', 'Bantahan jalanan besar-besaran di ibu kota', 'Banjir besar melanda beberapa negeri', 'Nilai ringgit jatuh mendadak'];

  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function kab(p) { var K = KB(); return K ? K.getKabinet(p) : (p.kabinet || {}); }
  function isPrimeMinister(p) { var k = p ? kab(p) : null; return !!(k && k.hasGovernmentRole && k.roleLevel === 'PERDANA_MENTERI'); }
  function penggal(p) { var sj = (kab(p).sejarah || []).filter(function (x) { return x && x.hasil === 'dilantik'; }), x = sj[sj.length - 1]; return x ? x.tahun + '-' + x.bulan : ''; }
  function dasar() {
    return { cabinetStability: CONFIG.STABIL_AWAL, nationalCrisisLevel: CONFIG.KRISIS_AWAL, blok: { rakan: { kepuasan: CONFIG.BLOK_AWAL, tarik: false }, borneo: { kepuasan: CONFIG.BLOK_AWAL, tarik: false } },
      goyah: 0, tuntutan: null, agihIdx: -99, dasarTahun: 0, tegasBulan: 0, daruratHingga: 0, daruratPenggal: '', jemaahRujuk: '', lalu: null };
  }
  function getPM(p) {
    var b = dasar(), m = p && p.pm && typeof p.pm === 'object' ? p.pm : {};
    for (var f in b) { if (m[f] === undefined) { m[f] = b[f]; } }
    BLOK.forEach(function (x) { if (!m.blok[x.kod]) { m.blok[x.kod] = { kepuasan: CONFIG.BLOK_AWAL, tarik: false }; } });
    var j = p && p.jemaah;                                                          // Jemaah baharu / selepas rombakan: kestabilan ikut Kesetiaan
    if (j && j.umum && typeof j.kesetiaan === 'number') { var kunci = (j.kunci || '') + '|' + (j.tahunRombak || 0); if (m.jemaahRujuk !== kunci) { m.jemaahRujuk = kunci; m.cabinetStability = clamp(Math.round(j.kesetiaan), 0, 100); } }
    return m;
  }
  function simpan(m, kesan, log, patch) { var pt = { pm: m }; if (patch) { for (var f in patch) { pt[f] = patch[f]; } } return S().applyEffects(kesan || {}, { kiraTindakan: false, patch: pt, log: log }); }
  /** Kerusi blok: parti sendiri = kerajaan − rakan; rakan dipecah 60/40 (ANDAIAN). */
  function kerusiBlok(p) {
    var D = DW(), k = D && D.kerusi ? D.kerusi(p) : null; if (!k) { return null; }
    var rakan = Math.max(0, Number(k.rakan) || 0), rs = Math.round(rakan * CONFIG.PECAH_RAKAN);
    return { kerajaan: k.BN, sendiri: Math.max(0, k.BN - rakan), rakan: rs, borneo: rakan - rs, jumlah: k.jumlah || CONFIG.JUMLAH };
  }
  function majoriti(p) {
    var kb = kerusiBlok(p); if (!kb) { return null; }
    var m = getPM(p), n = kb.kerajaan;
    BLOK.forEach(function (x) { if (m.blok[x.kod].tarik) { n -= kb[x.kod]; } });
    return Math.max(0, n - m.goyah);
  }
  function majoritiKurang(p) { if (!isPrimeMinister(p) || !p.pm) { return false; } var n = majoriti(p); return n !== null && n < CONFIG.AMBANG; }
  function daruratAktif(p) { return !!(p && p.pm && Number(p.pm.daruratHingga) > idx(p)); }
  function ralatAm(p) { return isPrimeMinister(p) ? '' : 'Hanya Perdana Menteri.'; }
  function blokNama(kod) { var b = BLOK.filter(function (x) { return x.kod === kod; })[0]; return b ? b.nama : kod; }
  function rizab(p, patch, jumlah) { if (p.mof && typeof p.mof === 'object') { var mf = p.mof; mf.nationalTreasury = Math.round(((Number(mf.nationalTreasury) || 0) - jumlah) * 10) / 10; patch.mof = mf; } }
  function bebas(p, patch, n) { if (p.kdn && typeof p.kdn === 'object') { var kd = p.kdn; kd.civilLiberties = clamp(Math.round((Number(kd.civilLiberties) || 0) + n), 0, 100); patch.kdn = kd; } }
  function lpop(d) { var K = KB(); if (K && K.laras && (d.pop || d.rating || d.rombak)) { K.laras({ pop: d.pop || 0, rating: d.rating || 0, rombak: d.rombak || 0 }); } }

  /* ---------- Tuntutan blok ---------- */
  function jawabTuntutan(cara, o) {
    var p = S().loadPlayer(), m = getPM(p), e = ralatAm(p), C = CONFIG.JAWAB, patch = {}, kes = {}, mesej;
    if (e) { return { ok: false, ralat: e }; }
    if (!m.tuntutan) { return { ok: false, ralat: 'Tiada tuntutan blok.' }; }
    var b = m.blok[m.tuntutan.blok], nm = blokNama(m.tuntutan.blok);
    if (cara === 'terima') { b.kepuasan = clamp(b.kepuasan + C.terima.blok, 0, 100); m.cabinetStability = clamp(m.cabinetStability + C.terima.stabil, 0, 100); rizab(p, patch, C.terima.rizab); mesej = 'Tuntutan ' + nm + ' diterima. Kepuasan blok +' + C.terima.blok + ', kestabilan kabinet ' + C.terima.stabil + '.'; }
    else if (cara === 'runding') {
      if ((Number(p.ap) || 0) < C.runding.ap) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
      kes.ap = -C.runding.ap; var jaya = rng(o)() < C.runding.peluang; b.kepuasan = clamp(b.kepuasan + (jaya ? C.runding.jaya : C.runding.gagal), 0, 100);
      mesej = jaya ? 'Rundingan dengan ' + nm + ' berjaya: kompromi dicapai. Kepuasan blok +' + C.runding.jaya + '.' : 'Rundingan dengan ' + nm + ' gagal. Kepuasan blok ' + C.runding.gagal + '.';
    } else if (cara === 'tolak') { b.kepuasan = clamp(b.kepuasan + C.tolak.blok, 0, 100); m.cabinetStability = clamp(m.cabinetStability + C.tolak.stabil, 0, 100); mesej = 'Tuntutan ' + nm + ' ditolak. Kepuasan blok ' + C.tolak.blok + ', kestabilan kabinet +' + C.tolak.stabil + '.'; }
    else { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    m.tuntutan = null;
    var r = simpan(m, kes, { tindakan: 'pm_tuntutan', nama: 'Tuntutan ' + nm + ': ' + cara, peringkat: 'ahli' }, patch);
    return r && r.ok ? { ok: true, mesej: mesej } : { ok: false, ralat: r && r.ralat };
  }
  /* ---------- Kuasa eksekutif ---------- */
  function agihPortfolio(kod) {
    var p = S().loadPlayer(), m = getPM(p), e = ralatAm(p), A = CONFIG.AGIH, kb = kerusiBlok(p);
    if (e) { return { ok: false, ralat: e }; }
    if (!m.blok[kod] || !kb || !kb[kod]) { return { ok: false, ralat: 'Blok tidak sah.' }; }
    if (idx(p) - m.agihIdx < A.selang) { return { ok: false, ralat: 'Agihan portfolio hanya sekali setiap ' + A.selang + ' bulan.' }; }
    m.blok[kod].kepuasan = clamp(m.blok[kod].kepuasan + A.blok, 0, 100); m.cabinetStability = clamp(m.cabinetStability + A.stabil, 0, 100); m.agihIdx = idx(p);
    var r = simpan(m, {}, { tindakan: 'pm_agih', nama: 'Portfolio tambahan untuk ' + blokNama(kod), peringkat: 'ahli' });
    return r && r.ok ? { ok: true, mesej: 'Portfolio tambahan diberi kepada ' + blokNama(kod) + '. Kepuasan blok +' + A.blok + ', kestabilan kabinet ' + A.stabil + '.' } : { ok: false, ralat: r && r.ralat };
  }
  function rombakKabinet() {
    var p = S().loadPlayer(), e = ralatAm(p), J = JM();
    if (e) { return { ok: false, ralat: e }; }
    if (!J || !J.rombak) { return { ok: false, ralat: 'Jemaah Menteri tidak tersedia.' }; }
    return J.rombak();
  }
  function umumDasar(id) {
    var p = S().loadPlayer(), m = getPM(p), e = ralatAm(p), d = DASAR.filter(function (x) { return x.id === id; })[0], patch = {}, kes = {};
    if (e) { return { ok: false, ralat: e }; }
    if (!d) { return { ok: false, ralat: 'Dasar tidak sah.' }; }
    if (m.dasarTahun === (parseInt(p.tahun, 10) || 0)) { return { ok: false, ralat: 'Dasar mega nasional hanya sekali setahun.' }; }
    var x = d.kesan; m.dasarTahun = parseInt(p.tahun, 10) || 0;
    if (x.krisis) { m.nationalCrisisLevel = clamp(m.nationalCrisisLevel + x.krisis, 0, 100); }
    if (x.stabil) { m.cabinetStability = clamp(m.cabinetStability + x.stabil, 0, 100); }
    if (x.rakan) { BLOK.forEach(function (b) { m.blok[b.kod].kepuasan = clamp(m.blok[b.kod].kepuasan + x.rakan, 0, 100); }); }
    if (x.reputasi) { kes.reputasi = x.reputasi; } if (x.ip) { kes.ip = x.ip; } if (x.rizab) { rizab(p, patch, x.rizab); }
    var r = simpan(m, kes, { tindakan: 'pm_dasar', nama: 'Dasar mega: ' + d.nama, peringkat: 'ahli' }, patch);
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    lpop({ pop: x.pop || 0 });
    return { ok: true, mesej: 'Dasar mega nasional diumumkan: ' + d.nama + '.' };
  }
  /* ---------- Krisis ---------- */
  function langkahTegas() {
    var p = S().loadPlayer(), m = getPM(p), e = ralatAm(p), T = CONFIG.TEGAS, patch = {};
    if (e) { return { ok: false, ralat: e }; }
    if (m.tegasBulan === idx(p)) { return { ok: false, ralat: 'Langkah tegas hanya sekali sebulan.' }; }
    m.nationalCrisisLevel = clamp(m.nationalCrisisLevel + T.krisis, 0, 100); m.tegasBulan = idx(p); bebas(p, patch, T.bebas);
    var r = simpan(m, {}, { tindakan: 'pm_tegas', nama: 'Langkah tegas krisis nasional', peringkat: 'ahli' }, patch);
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    lpop({ pop: T.pop });
    return { ok: true, mesej: 'Langkah tegas diambil: krisis ' + T.krisis + ', populariti ' + T.pop + '.' };
  }
  function bolehDarurat(p, m) {
    if (m.nationalCrisisLevel < CONFIG.DARURAT.minKrisis) { return 'Darurat hanya boleh diisytihar jika krisis nasional ' + CONFIG.DARURAT.minKrisis + ' atau lebih.'; }
    if (m.daruratPenggal && m.daruratPenggal === penggal(p)) { return 'Darurat hanya sekali sepenggal.'; }
    if (daruratAktif(p)) { return 'Darurat sedang berkuat kuasa.'; }
    return '';
  }
  function isytiharDarurat() {
    var p = S().loadPlayer(), m = getPM(p), e = ralatAm(p), D = CONFIG.DARURAT, patch = {};
    if (e) { return { ok: false, ralat: e }; }
    var sb = bolehDarurat(p, m); if (sb) { return { ok: false, ralat: sb }; }
    m.nationalCrisisLevel = clamp(m.nationalCrisisLevel + D.krisis, 0, 100); m.cabinetStability = clamp(m.cabinetStability + D.stabil, 0, 100);
    m.daruratHingga = idx(p) + D.bulan; m.daruratPenggal = penggal(p); bebas(p, patch, D.bebas);
    var r = simpan(m, { reputasi: D.reputasi }, { tindakan: 'pm_darurat', nama: 'Darurat diisytihar', peringkat: 'ahli' }, patch);
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    lpop({ pop: D.pop });
    return { ok: true, mesej: 'Darurat diisytihar selama ' + D.bulan + ' bulan. Usul Undi Tidak Percaya tidak boleh dikemukakan; populariti ' + D.pop + ', Reputasi ' + D.reputasi + '.' };
  }

  /* ---------- Bulanan (calendar.js, sebelum dewan.js) ---------- */
  function prosesBulan(o) {
    var p = S() && S().loadPlayer(), ev = [];
    if (!p || p.tamat || !isPrimeMinister(p)) { return { peristiwa: ev }; }
    var m = getPM(p), r = rng(o), C = CONFIG, kb = kerusiBlok(p), d = { pop: 0 };
    m.lalu = { majoriti: majoriti(p), stabil: m.cabinetStability, krisis: m.nationalCrisisLevel };
    if (daruratAktif(p) === false && m.daruratHingga && m.daruratHingga === idx(p)) { ev.push({ jenis: 'kabinet', mesej: 'Tempoh darurat tamat. Parlimen bersidang semula.' }); }
    var sas = 20;                                                                       // sasaran krisis
    if (p.kdn && typeof p.kdn.publicOrderMeter === 'number' && p.kdn.publicOrderMeter < 50) { sas += 50 - p.kdn.publicOrderMeter; }
    if (p.mof && typeof p.mof.inflationRate === 'number' && p.mof.inflationRate > 3) { sas += Math.round((p.mof.inflationRate - 3) * 8); }
    m.nationalCrisisLevel = clamp(Math.round(m.nationalCrisisLevel + (sas - m.nationalCrisisLevel) * 0.2), 0, 100);
    if (r() < C.ACARA_PELUANG) { var a = ACARA[Math.floor(r() * ACARA.length)]; m.nationalCrisisLevel = clamp(m.nationalCrisisLevel + C.ACARA_KRISIS, 0, 100); ev.push({ jenis: 'kabinet', mesej: 'Krisis nasional: ' + a + ' (krisis +' + C.ACARA_KRISIS + ').' }); }
    if (m.nationalCrisisLevel >= C.KRISIS_TINGGI) { d.pop += C.KRISIS_POP; m.cabinetStability = clamp(m.cabinetStability + C.KRISIS_STABIL, 0, 100); }
    if (m.cabinetStability < C.STABIL_RENDAH) { m.goyah += C.GOYAH_TAMBAH; ev.push({ jenis: 'kabinet', mesej: 'Puak dalam kerajaan mula berpaling: ' + C.GOYAH_TAMBAH + ' lagi MP goyah.' }); }
    else if (m.goyah > 0 && m.cabinetStability >= 50) { m.goyah = Math.max(0, m.goyah - 1); }
    BLOK.forEach(function (x) {
      if (!kb || !kb[x.kod]) { return; }
      var b = m.blok[x.kod]; b.kepuasan = clamp(b.kepuasan - C.BLOK_SUSUT, 0, 100);
      if (m.tuntutan && m.tuntutan.blok === x.kod) { b.kepuasan = clamp(b.kepuasan + C.TUNTUTAN_ABAI, 0, 100); }
      if (!b.tarik && b.kepuasan < C.TARIK) { b.tarik = true; ev.push({ jenis: 'kabinet', mesej: x.nama + ' menarik sokongan terhadap kerajaan (' + kb[x.kod] + ' kerusi)!' }); }
      else if (b.tarik && b.kepuasan >= C.PULIH) { b.tarik = false; ev.push({ jenis: 'kabinet', mesej: x.nama + ' kembali menyokong kerajaan.' }); }
    });
    if (m.tuntutan) { m.tuntutan.bulan += 1; }
    else if (kb && r() < C.TUNTUTAN_PELUANG) {
      var calon = BLOK.filter(function (x) { return kb[x.kod] && !m.blok[x.kod].tarik && m.blok[x.kod].kepuasan < C.TUNTUTAN_MAKS_PUAS; }).sort(function (a, b) { return m.blok[a.kod].kepuasan - m.blok[b.kod].kepuasan; })[0];
      if (calon) { var j = r() < 0.5 ? 'jawatan' : 'peruntukan'; m.tuntutan = { blok: calon.kod, jenis: j, bulan: 0 }; ev.push({ jenis: 'kabinet', mesej: 'Tuntutan baharu: ' + calon.nama + ' ' + TUNTUTAN[j] + '. Jawab di Pejabat PM.' }); }
    }
    simpan(m, {});
    lpop(d);
    var n = majoriti(S().loadPlayer());
    if (n !== null && n < C.AMBANG) { ev.push({ jenis: 'kabinet', mesej: 'Kerajaan kehilangan majoriti: ' + n + ' kerusi (ambang ' + C.AMBANG + ').' + (daruratAktif(p) ? ' Darurat menangguhkan usul tidak percaya.' : '') }); }
    return { peristiwa: ev };
  }

  function ringkasan(p) {
    var m = getPM(p), kb = kerusiBlok(p), l = m.lalu || {}, n = majoriti(p), ini = idx(p), C = CONFIG, sbD = bolehDarurat(p, m), J = JM(), rb = J && J.bolehRombak ? J.bolehRombak(p) : { boleh: false, sebab: '' };
    return { isPrimeMinister: isPrimeMinister(p), parliamentaryMajority: n, ambang: C.AMBANG, jumlah: kb ? kb.jumlah : C.JUMLAH, cabinetStability: m.cabinetStability, nationalCrisisLevel: m.nationalCrisisLevel,
      arah: { majoriti: l.majoriti == null || n == null ? 0 : n - l.majoriti, stabil: l.stabil == null ? 0 : m.cabinetStability - l.stabil, krisis: l.krisis == null ? 0 : m.nationalCrisisLevel - l.krisis },
      blok: [{ kod: 'sendiri', nama: 'Parti anda', kerusi: kb ? kb.sendiri : 0, kepuasan: null, tarik: false }].concat(BLOK.filter(function (x) { return kb && kb[x.kod]; }).map(function (x) {
        var b = m.blok[x.kod]; return { kod: x.kod, nama: x.nama, kerusi: kb[x.kod], kepuasan: b.kepuasan, tarik: b.tarik, status: b.tarik ? 'tarik' : b.kepuasan < 35 ? 'ugut' : b.kepuasan < 55 ? 'resah' : 'setia' }; })),
      goyah: m.goyah,
      tuntutan: m.tuntutan ? { blok: m.tuntutan.blok, nama: blokNama(m.tuntutan.blok), teks: TUNTUTAN[m.tuntutan.jenis], bulan: m.tuntutan.bulan, kepuasan: m.blok[m.tuntutan.blok].kepuasan, kerusi: kb ? kb[m.tuntutan.blok] : 0 } : null,
      agih: { boleh: ini - m.agihIdx >= C.AGIH.selang, selang: C.AGIH.selang },
      rombak: rb,
      dasar: DASAR.map(function (d) { return { id: d.id, ikon: d.ikon, nama: d.nama, huraian: d.huraian, kesan: d.kesan }; }), dasarBoleh: m.dasarTahun !== (parseInt(p.tahun, 10) || 0),
      tegasBoleh: m.tegasBulan !== ini, darurat: { aktif: daruratAktif(p), hingga: m.daruratHingga, boleh: !sbD, sebab: sbD } };
  }

  return { CONFIG: CONFIG, BLOK: BLOK, DASAR: DASAR, setRng: function (f) { rngLalai = f || Math.random; },
    getPM: getPM, isPrimeMinister: isPrimeMinister, kerusiBlok: kerusiBlok, majoriti: majoriti, majoritiKurang: majoritiKurang, daruratAktif: daruratAktif,
    jawabTuntutan: jawabTuntutan, agihPortfolio: agihPortfolio, rombakKabinet: rombakKabinet, umumDasar: umumDasar, langkahTegas: langkahTegas, isytiharDarurat: isytiharDarurat,
    prosesBulan: prosesBulan, ringkasan: ringkasan };
});
