/* ==========================================================================
   Nusa Politik — js/umno.js   (v13.5)
   Mekanik pemilihan UMNO mengikut Perlembagaan UMNO 2025 (Fasa B, dipersetujui dalam mockup):
     - pimpinan Pusat (Presiden, Timbalan Presiden, 3 Naib Presiden, 25 MKT) diundi oleh perwakilan Mesyuarat Perwakilan Bahagian
       di 191 Bahagian (Fasal 9.3, 14.5.4); Ketua sayap Malaysia diundi oleh Mesyuarat Perwakilan sayap Bahagian (Fasal 9.4)
     - takwim: Cawangan bulan 4-5, Bahagian + Pusat bulan 6, PAU bulan 9 (Fasal 14.3, 17.3; js/calendar.js)
     - MKT menangguhkan pemilihan selepas PRU (Fasal 10.16): automatik jika PRU dijangka dalam 12 bulan selepas musim biasa
       dan pemilihan sudah diadakan dalam penggal Parlimen semasa; musim khas dalam 6 bulan selepas PRU; kitaran 3 tahun bermula semula
     - kuasa lantikan Ketua Cawangan / Ketua Bahagian (Fasal 18.1.8, 15.1.8) dan Presiden (Fasal 9.8.1); mohon lantikan Presiden
     - Perhimpunan Agung Khas (Fasal 8.5, 9.12); Tempoh Pemilihan Tataetika (Perkara 2.1.2, 5.5, 5.6)
   State: p.umno = { kit:{ biasa, tangguh, khas, lepas:[{tahun,i,khas}], putus:{} }, pusat:{kod:sokongan}, jelajahBulan, penerangan:{bulan,negeri},
                     lantikKetua:{cawangan,bahagian}, belia, lantikPresiden, lantikPresidenPilihan, lantikan, lantikanIdx, mohonBulan, notis }
   SEMUA ANGKA BERTANDA ANDAIAN IALAH ANDAIAN PERMAINAN (dipersetujui dalam mockup Fasa B).
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikUMNO = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function J() { return modul('MyPolitikJawatan', 'jawatan.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function DATA() { return modul('MyPolitikUMNOData', 'umno-data.js') || { bahagian: {} }; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(t, b) { return (parseInt(t, 10) || 0) * 12 + (parseInt(b, 10) || 1); }
  function dariIdx(i) { return { tahun: Math.floor((i - 1) / 12), bulan: ((i - 1) % 12) + 1 }; }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function salin(o) { return JSON.parse(JSON.stringify(o)); }

  var CONFIG = {
    TAHUN_MULA: 2026, KITARAN_TAHUN: 3,
    BIASA: { c1: 4, c2: 5, b: 6, a: 9 },                     // takwim biasa (Fasal 14.3, 17.3)
    PRU_LALU: idx(2022, 11),                                 // PRU-15 (permulaan penggal Parlimen semasa)
    TANGGUH: { jangkaBulan: 12, selamat: 6 },                // ANDAIAN: PRU dijangka dalam 12 bulan selepas musim biasa; jika PRU belum berlaku menjelang bulan 6 tahun berikutnya, musim biasa diadakan
    TEMPOH: 6,                                               // Tempoh Pemilihan: 6 bulan sebelum musim Cawangan hingga 6 bulan selepas undi Pusat (Tataetika 2.1.2)
    PUSAT: { sendiri: 60, lain: [30, 45], bonusSkala: 0.3, jelajahAP: 2, jelajahMYR: 2000, jelajahNaik: 8, penerangAP: 1, penerangMYR: 500, penerangNaik: 3, pangkatMin: 7 },
    KETUA: { setia: { ajk: 5, akarUmbi: -1 }, puak: { akarUmbi: 4, ajk: -1 }, muda: { belia: 5, ajk: 2 } },
    LANTIKAN: [
      { kod: 'ahli_mkt_lantikan', jawatan: 'Ahli MKT (Lantikan Presiden)', ip: 6, pusat: 4 },
      { kod: 'setiausaha_agung', jawatan: 'Setiausaha Agung', ip: 10, pusat: 6 },
      { kod: 'bendahari_agung', jawatan: 'Bendahari Agung', ip: 8, pusat: 5 },
      { kod: 'ketua_penerangan', jawatan: 'Ketua Penerangan', ip: 8, pusat: 5 }
    ],
    MOHON: { ap: 2, faktor: 0.8, dekatLalai: 30, pangkatMin: 7 },
    PAK: { sokongan: 25, peluang: 0.10, kadar: 0.03, maks: 0.6 },               // Perhimpunan Agung Khas (Fasal 8.5, 9.12)
    ETIKA: { jamuan: 1.5, lobi: { tahap: 'kelabu', modal: -1, risiko: 6, tambahRisiko: 4, berat: 1, perkara: 'Melobi Ketua Bahagian sebagai ejen calon dalam Tempoh Pemilihan (Tataetika Perkara 5.5)', fasal: 'Tataetika 5.5' } }
  };

  function adalah(p) { return !!p && (!p.parti || p.parti === 'UMNO'); }
  /** Simpanan lama (sebelum v13.5) yang berada di tengah musim pemilihan: takwim dan peraturan lama sehingga tahun berikutnya. */
  function lama(p) { return !!(p && p.umno && p.umno.lama && p.umno.lama === parseInt(p.tahun, 10)); }
  /** Peraturan Fasa B (Pusat diundi di Bahagian, PAU tanpa undi) berkuat kuasa untuk profil ini. */
  function baharu(p) { return adalah(p) && !lama(p); }
  function st(p) {
    var m = p && p.umno && typeof p.umno === 'object' ? p.umno : {};
    if (!m.pusat || typeof m.pusat !== 'object') { m.pusat = {}; }
    if (!m.lantikKetua || typeof m.lantikKetua !== 'object') { m.lantikKetua = {}; }
    return m;
  }
  function pegang(p, kod) { var J0 = J(); return !!(J0 && J0.pegang && J0.pegang(p, kod)); }
  function pangkat(p) { var J0 = J(); return J0 ? Math.max(J0.pangkatTertinggi(p, 'utama'), Number(p.pangkatUtamaLalu) || 0) : 0; }
  function kodPL(p) { var k = p && p.kod && p.kod.parlimen; return k ? 'P.' + String(parseInt(k, 10)).padStart(3, '0') : null; }
  function sekarang(p) { return idx(p.tahun, p.bulan); }

  /* ======================================================================
     1. KITARAN PEMILIHAN, TANGGUH DAN MUSIM KHAS (Fasal 10.16)
     ====================================================================== */
  function pruRiwayat(p) {
    return (p && p.pru && Array.isArray(p.pru.riwayat) ? p.pru.riwayat : []).filter(function (r) { return r && r.jenis !== 'PRN'; })
      .map(function (r) { return idx(r.tahun, r.bulan); }).sort(function (a, b) { return a - b; });
  }
  function pruJangka(p) {
    var P0 = PRU(), pr = null;
    try { pr = P0 && P0.getPRU ? P0.getPRU(p) : (p && p.pru); } catch (e) { pr = p && p.pru; }
    return pr && pr.tahunPRU ? idx(pr.tahunPRU, pr.bulanPRU || 3) : idx(2031, 3);
  }
  /** Musim khas selepas PRU bulan m (jadual dipersetujui; semua dalam lingkungan 6 bulan). */
  function khasDari(i) {
    var d = dariIdx(i), m = d.bulan, T = d.tahun;
    if (m <= 6) { return { tahun: T, c: m + 2, b: m + 4, a: m + 6 }; }
    if (m === 7) { return { tahun: T, c: 9, b: 11, a: 12 }; }
    if (m === 8) { return { tahun: T + 1, c: 1, b: 2, a: 4 }; }
    if (m <= 11) { return { tahun: T + 1, c: 1, b: 3, a: 5 }; }
    return { tahun: T + 1, c: 2, b: 4, a: 6 };
  }
  function kitAsal(p) {
    var m = p && p.umno && p.umno.kit, k = m && typeof m === 'object' ? salin(m) : {};
    if (!Array.isArray(k.lepas)) { k.lepas = []; }
    if (!k.putus || typeof k.putus !== 'object') { k.putus = {}; }
    if (typeof k.biasa !== 'number' && typeof k.tangguh !== 'number' && !k.khas) {
      var t = parseInt(p && p.tahun, 10) || CONFIG.TAHUN_MULA, Y = CONFIG.TAHUN_MULA;        // simpanan lama: kitaran 3 tahun asal
      while (Y + CONFIG.KITARAN_TAHUN <= t) { k.lepas.push({ tahun: Y, i: idx(Y, CONFIG.BIASA.b), khas: false }); Y += CONFIG.KITARAN_TAHUN; }
      k.biasa = Y;
    }
    return k;
  }
  function pemilihanDalamPenggal(k, mulaPenggal) { return k.lepas.some(function (x) { return x.i > mulaPenggal; }); }
  /** Majukan kitaran sehingga bulan semasa (fungsi tulen; prosesBulan menyimpan hasilnya). */
  function maju(p, k0) {
    var k = k0 || kitAsal(p), now = sekarang(p), B = CONFIG.BIASA, riw = pruRiwayat(p), guard = 0, ev = [];
    while (guard++ < 40) {
      if (k.khas) {
        if (now > idx(k.khas.tahun, k.khas.a)) {
          if (!k.lepas.some(function (x) { return x.tahun === k.khas.tahun && x.khas; })) { k.lepas.push({ tahun: k.khas.tahun, i: idx(k.khas.tahun, k.khas.b), khas: true, c: k.khas.c, b: k.khas.b, a: k.khas.a }); }
          k.biasa = k.khas.tahun + CONFIG.KITARAN_TAHUN; k.khas = null; continue;
        }
        break;
      }
      if (typeof k.tangguh === 'number') {
        var Y0 = k.tangguh, pruSelepas = riw.filter(function (i) { return i >= idx(Y0, 1); })[0];
        if (pruSelepas !== undefined && pruSelepas <= now) {
          k.khas = khasDari(pruSelepas); k.khas.pru = pruSelepas; k.tangguh = null;
          ev.push({ jenis: 'umno_khas', khas: salin(k.khas) }); continue;
        }
        if (now >= idx(Y0 + 1, 1) && pruJangka(p) > idx(Y0 + 1, CONFIG.TANGGUH.selamat)) {                // pengaman: PRU tidak berlaku, musim biasa diadakan
          k.tangguh = null; k.biasa = Y0 + 1; ev.push({ jenis: 'umno_batal_tangguh', tahun: Y0 + 1 }); continue;
        }
        break;
      }
      var Y = k.biasa;
      if (typeof Y !== 'number' || now < idx(Y, 1)) { break; }
      if (k.putus[Y] === undefined) {
        var mulaPenggal = Math.max(CONFIG.PRU_LALU, riw.filter(function (i) { return i <= idx(Y, 1); }).pop() || 0);
        var j = pruJangka(p), tangguh = Y !== CONFIG.TAHUN_MULA && j > idx(Y, B.b) && j <= idx(Y, B.b) + CONFIG.TANGGUH.jangkaBulan && pemilihanDalamPenggal(k, mulaPenggal);
        k.putus[Y] = tangguh;
        if (tangguh) { ev.push({ jenis: 'umno_tangguh', tahun: Y, pru: j }); }
      }
      if (k.putus[Y]) { k.tangguh = Y; k.biasa = null; continue; }
      if (now > idx(Y, B.a)) {
        if (!k.lepas.some(function (x) { return x.tahun === Y && !x.khas; })) { k.lepas.push({ tahun: Y, i: idx(Y, B.b), khas: false }); }
        k.biasa = Y + CONFIG.KITARAN_TAHUN; continue;
      }
      break;
    }
    return { kit: k, peristiwa: ev };
  }
  function kit(p) { return maju(p).kit; }
  /** Musim pemilihan semasa atau akan datang: { tahun, c1, c2, b, a, khas } atau null jika ditangguh (menunggu PRU). */
  function musim(p, k0) {
    var k = k0 || kit(p), B = CONFIG.BIASA;
    if (k.khas) { var c2 = Math.max(k.khas.c, Math.min(k.khas.b - 1, k.khas.c + 1)); return { tahun: k.khas.tahun, c1: k.khas.c, c2: c2, b: k.khas.b, a: k.khas.a, khas: true, pru: k.khas.pru }; }
    if (typeof k.tangguh === 'number') { return null; }
    return { tahun: k.biasa, c1: B.c1, c2: B.c2, b: B.b, a: B.a, khas: false };
  }
  /** Senarai tahun pemilihan (lepas, semasa dan unjuran 3 tahun sekali). */
  function senaraiTahun(p, hingga) {
    var k = kit(p), out = k.lepas.map(function (x) { return x.tahun; }), m = musim(p, k), mula;
    if (m) { out.push(m.tahun); mula = m.tahun; }
    else { var kh = khasDari(pruJangka(p)); out.push(kh.tahun); mula = kh.tahun; }
    for (var y = mula + CONFIG.KITARAN_TAHUN; y <= (hingga || mula + 30); y += CONFIG.KITARAN_TAHUN) { out.push(y); }
    return out.filter(function (y, i, a) { return a.indexOf(y) === i; }).sort(function (a, b) { return a - b; });
  }
  /** Tahun t ialah tahun pemilihan yang sudah pasti (unjuran tahun yang mungkin ditangguh dikira, kecuali sedang ditangguh). */
  function adalahTahunPemilihan(p, tahun) {
    var t = parseInt(tahun, 10); if (t < CONFIG.TAHUN_MULA) { return false; }
    var k = kit(p), m = musim(p, k);
    if (typeof k.tangguh === 'number' && t === k.tangguh) { return false; }
    if (!m && t >= parseInt(p.tahun, 10)) { return false; }                           // ditangguh: menunggu PRU, tahun khas belum pasti
    return senaraiTahun(p, t).indexOf(t) >= 0;
  }
  function tahunLepas(p, tahun) {
    var t = parseInt(tahun, 10), k = kit(p), ls = k.lepas.map(function (x) { return x.tahun; }), m = musim(p, k);
    if (m && m.tahun <= t) { ls.push(m.tahun); }
    if (t > parseInt(p.tahun, 10)) { ls = senaraiTahun(p, t); }
    ls = ls.filter(function (y) { return y <= t; }).sort(function (a, b) { return a - b; });
    return ls.length ? ls[ls.length - 1] : (t >= CONFIG.TAHUN_MULA ? CONFIG.TAHUN_MULA : null);
  }
  function tahunSeterusnya(p, tahun) {
    var t = parseInt(tahun, 10), ls = senaraiTahun(p, t + 30).filter(function (y) { return y >= t; }), k = kit(p);
    ls = ls.filter(function (y) { return !(typeof k.tangguh === 'number' && y === k.tangguh); });
    return ls.length ? ls[0] : t;
  }
  /** Indeks kitaran (sama seperti kitaran 3 tahun asal jika tiada penangguhan). */
  function kitaranId(p, tahun) {
    var t = parseInt(tahun, 10), L = tahunLepas(p, t); if (!L) { return 0; }
    return senaraiTahun(p, t).indexOf(L);
  }
  /** Takwim UMNO untuk js/calendar.js: 'lama' (simpanan lama), { c, b, a } (musim khas tahun semasa) atau null. Dicache ikut rentetan simpanan. */
  var cache = { raw: null, val: null };
  function takwimKini(p0) {
    var Sv = S(), raw = null, p = p0 || null;
    if (!p) {
      try { raw = root.localStorage && Sv && Sv.KEY ? root.localStorage.getItem(Sv.KEY) : null; } catch (e) { raw = null; }
      if (raw !== null && raw === cache.raw) { return cache.val; }
      try { p = Sv && Sv.loadPlayer ? Sv.loadPlayer() : null; } catch (e2) { p = null; }
    }
    var v = null;
    if (adalah(p)) {
      if (lama(p)) { v = 'lama'; }
      else {
        var k = kit(p), m = musim(p, k), t = parseInt(p.tahun, 10), sl = k.lepas.filter(function (x) { return x.khas && x.tahun === t && x.c; })[0];
        if (m && m.khas && m.tahun === t) { v = { c: m.c1, b: m.b, a: m.a }; } else if (sl) { v = { c: sl.c, b: sl.b, a: sl.a }; }      // takwim khas kekal hingga hujung tahun
      }
    }
    if (raw !== null) { cache.raw = raw; cache.val = v; }
    return v;
  }
  function musimKhasKini(p0) { var v = takwimKini(p0); return v && v !== 'lama' ? v : null; }
  /** Kunci mesyuarat tahunan (musim khas mendapat set mesyuarat baharu dalam tahun yang sama). */
  function kunciMesyuarat(p) { return adalah(p) && musimKhasKini(p) ? p.tahun + '-khas' : p.tahun; }
  /** Tempoh Pemilihan (Tataetika 2.1.2): 6 bulan sebelum musim Cawangan hingga 6 bulan selepas undi Pusat. */
  function tempohPemilihan(p) {
    if (!adalah(p)) { return { aktif: false }; }
    var k = kit(p), now = sekarang(p), m = musim(p, k), T = CONFIG.TEMPOH, out = { aktif: false };
    var lp = k.lepas.length ? k.lepas[k.lepas.length - 1] : null;
    if (lp && now <= lp.i + T && now >= lp.i - 8) { out = { aktif: true, mula: dariIdx(lp.i - 8), tamat: dariIdx(lp.i + T) }; }
    if (m) { var a = idx(m.tahun, m.c1) - T, b = idx(m.tahun, m.b) + T; if (now >= a && now <= b) { out = { aktif: true, mula: dariIdx(a), tamat: dariIdx(b) }; } else if (!out.aktif) { out.akanDatang = { mula: dariIdx(a), tamat: dariIdx(b) }; } }
    return out;
  }
  /** Ringkasan untuk kad Pemilihan / kad UMNO. */
  function statusKitaran(p) {
    var k = kit(p), m = musim(p, k), j = pruJangka(p), tp = tempohPemilihan(p);
    return { musim: m, tangguh: typeof k.tangguh === 'number' ? k.tangguh : null, pruJangka: dariIdx(j), unjuranKhas: m ? null : khasDari(j), lepas: k.lepas.slice(-3), tempoh: tp, tahunPemilihan: adalahTahunPemilihan(p, p.tahun) };
  }

  /* ======================================================================
     2. PEMILIHAN PUSAT DI MESYUARAT PERWAKILAN BAHAGIAN (Fasal 9.3, 14.5.4)
     ====================================================================== */
  function sokonganBahagian(p) {
    var d = DATA(), m = st(p), own = kodPL(p), out = {};
    Object.keys(d.bahagian).forEach(function (k) {
      var v = m.pusat[k];
      if (typeof v !== 'number') { var c = CONFIG.PUSAT.lain; v = k === own ? CONFIG.PUSAT.sendiri : c[0] + (hash(String(p.id) + '|umno|' + k) % (c[1] - c[0] + 1)); }
      out[k] = v;
    });
    return out;
  }
  function perwakilan(kod) { var x = DATA().bahagian[kod]; return x ? x.w : 190; }
  function ringkasPusat(p) {
    var sb = sokonganBahagian(p), d = DATA(), ks = Object.keys(sb), jum = 0, condong = 0, pengundi = 0;
    ks.forEach(function (k) { var w = perwakilan(k); pengundi += w; jum += sb[k] * w; if (sb[k] >= 50) { condong++; } });
    var purata = pengundi ? jum / pengundi : 0;
    return { purata: Math.round(purata * 10) / 10, condong: condong, bilBahagian: ks.length, pengundi: pengundi, sokongUndi: Math.round(pengundi * purata / 100),
      senarai: ks.map(function (k) { return { kod: k, nama: d.bahagian[k].n, negeri: d.bahagian[k].ng, sokongan: Math.round(sb[k]), wakil: perwakilan(k) }; }).sort(function (a, b) { return a.sokongan - b.sokongan || a.nama.localeCompare(b.nama); }) };
  }
  function bonusPusat(p) {
    if (!adalah(p)) { return 0; }
    var l = lantikanSemasa(p), b = (ringkasPusat(p).purata - 40) * CONFIG.PUSAT.bonusSkala + (l ? l.pusat : 0);
    return Math.round(b * 10) / 10;
  }
  /** ANDAIAN: Pelapis muda (lantikan Ketua Bahagian) menambah kekuatan dalam pertandingan sayap (Sokongan Belia +5) sepanjang penggal. */
  function bonusSayap(p, d) {
    if (!adalah(p) || !d || d.kumpulan !== 'sayap') { return 0; }
    var m = st(p); return m.belia && m.belia === (tahunLepas(p, p.tahun) || p.tahun) ? CONFIG.KETUA.muda.belia : 0;
  }
  function statusJelajah(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk UMNO.' }; }
    if (pangkat(p) < CONFIG.PUSAT.pangkatMin) { return { boleh: false, sebab: 'Perlu Ketua Bahagian atau lebih untuk berkempen di peringkat Pusat.' }; }
    var m = st(p); if (m.jelajahBulan === sekarang(p)) { return { boleh: false, sebab: 'Jelajah Bahagian sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < CONFIG.PUSAT.jelajahAP) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < CONFIG.PUSAT.jelajahMYR) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function simpan(p, m, kesan, log, patchTambah) {
    var patch = { umno: m }; if (patchTambah) { for (var k in patchTambah) { patch[k] = patchTambah[k]; } }
    return S().applyEffects(kesan || {}, { kiraTindakan: !!(log && log.kira), patch: patch, log: log && log.nama ? { tindakan: log.tindakan || 'umno', nama: log.nama, peringkat: log.peringkat || 'ahli' } : undefined });
  }
  function jelajah(kod) {
    var p = S().loadPlayer(), s0 = statusJelajah(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var d = DATA(); if (!d.bahagian[kod]) { return { ok: false, ralat: 'Bahagian tidak sah.' }; }
    var m = st(p), sb = sokonganBahagian(p), baru = clamp(sb[kod] + CONFIG.PUSAT.jelajahNaik, 0, 100);
    m.pusat[kod] = baru; m.jelajahBulan = sekarang(p);
    var r = simpan(p, m, { ap: -CONFIG.PUSAT.jelajahAP, myr: -CONFIG.PUSAT.jelajahMYR }, { kira: true, tindakan: 'umno_jelajah', nama: 'Jelajah Bahagian ' + d.bahagian[kod].n });
    if (!r.ok) { return { ok: false, ralat: r.ralat }; }
    return { ok: true, mesej: 'Jelajah Bahagian ' + d.bahagian[kod].n + ': sokongan perwakilan ' + Math.round(sb[kod]) + '% → ' + Math.round(baru) + '%.' };
  }
  function statusPenerangan(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk UMNO.' }; }
    if (pangkat(p) < CONFIG.PUSAT.pangkatMin) { return { boleh: false, sebab: 'Perlu Ketua Bahagian atau lebih untuk berkempen di peringkat Pusat.' }; }
    var m = st(p); if (m.penerangan && m.penerangan.bulan === sekarang(p)) { return { boleh: false, sebab: 'Majlis Penerangan sudah diadakan bulan ini.' }; }
    if ((Number(p.ap) || 0) < CONFIG.PUSAT.penerangAP) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < CONFIG.PUSAT.penerangMYR) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  /** Senarai negeri dengan Bahagian UMNO: [{ kod, nama, bil }]. */
  function senaraiNegeri() {
    var d = DATA(), D0 = modul('MyPolitikData', 'data.js'), o = {};
    Object.keys(d.bahagian).forEach(function (k) { var ng = d.bahagian[k].ng; o[ng] = (o[ng] || 0) + 1; });
    return Object.keys(o).map(function (ng) { var nm = D0 && D0.namaNegeriKod ? D0.namaNegeriKod(ng) : null; return { kod: ng, nama: nm || NEGERI[ng] || ng, bil: o[ng] }; }).sort(function (a, b) { return a.nama.localeCompare(b.nama); });
  }
  var NEGERI = { '1': 'Johor', '2': 'Kedah', '3': 'Kelantan', '4': 'Melaka', '5': 'Negeri Sembilan', '6': 'Pahang', '7': 'Pulau Pinang', '8': 'Perak', '9': 'Perlis', '10': 'Selangor', '11': 'Terengganu', '12': 'Sabah', '13': 'Sarawak', '14': 'W.P. Kuala Lumpur', '15': 'W.P. Labuan', '16': 'W.P. Putrajaya' };
  function penerangan(negeri) {
    var p = S().loadPlayer(), s0 = statusPenerangan(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var d = DATA(), ks = Object.keys(d.bahagian).filter(function (k) { return d.bahagian[k].ng === String(negeri); });
    if (!ks.length) { return { ok: false, ralat: 'Negeri tidak sah.' }; }
    var m = st(p), sb = sokonganBahagian(p), r0 = ringkasPusat(p).purata;
    ks.forEach(function (k) { m.pusat[k] = clamp(sb[k] + CONFIG.PUSAT.penerangNaik, 0, 100); });
    m.penerangan = { bulan: sekarang(p), negeri: String(negeri) };
    var nm = NEGERI[String(negeri)] || String(negeri);
    var r = simpan(p, m, { ap: -CONFIG.PUSAT.penerangAP, myr: -CONFIG.PUSAT.penerangMYR }, { kira: true, tindakan: 'umno_penerangan', nama: 'Majlis Penerangan Badan Perhubungan ' + nm });
    if (!r.ok) { return { ok: false, ralat: r.ralat }; }
    var r1 = ringkasPusat(S().loadPlayer()).purata;
    return { ok: true, mesej: 'Majlis Penerangan Badan Perhubungan ' + nm + ' (kempen dibenarkan Tataetika 5.5): sokongan perwakilan +' + CONFIG.PUSAT.penerangNaik + '% di ' + ks.length + ' Bahagian. Purata kebangsaan ' + r0 + '% → ' + r1 + '%.' };
  }

  /* ======================================================================
     3. KUASA LANTIKAN (Fasal 18.1.8, 15.1.8, 9.8.1)
     ====================================================================== */
  function penggal(p) { return tahunLepas(p, p.tahun) || p.tahun; }
  function statusLantikKetua(p, peringkat) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk UMNO.' }; }
    if (!pegang(p, 'ketua_' + peringkat)) { return { boleh: false, sebab: 'Hanya Ketua ' + (peringkat === 'cawangan' ? 'Cawangan' : 'Bahagian') + '.' }; }
    var m = st(p); if (m.lantikKetua[peringkat] && m.lantikKetua[peringkat].tahun === penggal(p)) { return { boleh: false, sebab: 'Lantikan penggal ini sudah dibuat.', sudah: m.lantikKetua[peringkat].pilihan }; }
    return { boleh: true, sebab: '' };
  }
  function lantikKetua(peringkat, pilihan) {
    var p = S().loadPlayer(), s0 = statusLantikKetua(p, peringkat); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    if (['setia', 'puak', 'muda'].indexOf(pilihan) < 0 || (pilihan === 'muda' && peringkat !== 'bahagian')) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    var m = st(p), C = CONFIG.KETUA, kes, msj, L = penggal(p), N = peringkat === 'cawangan' ? 'Cawangan' : 'Bahagian', bil = peringkat === 'cawangan' ? 6 : 12;
    m.lantikKetua[peringkat] = { tahun: L, pilihan: pilihan };
    if (pilihan === 'setia') { kes = { kesetiaan: { ajk: C.setia.ajk, akarUmbi: C.setia.akarUmbi } }; msj = 'Anda melantik penyokong setia sebagai Setiausaha, Bendahari, Ketua Penerangan dan ' + bil + ' AJK lantikan ' + N + '. Sokongan AJK +' + C.setia.ajk + ', akar umbi ' + C.setia.akarUmbi + '.'; }
    else if (pilihan === 'puak') { kes = { kesetiaan: { akarUmbi: C.puak.akarUmbi, ajk: C.puak.ajk } }; msj = 'Anda melantik wakil semua puak ke jawatan lantikan ' + N + '. Sokongan akar umbi +' + C.puak.akarUmbi + ', AJK ' + C.puak.ajk + '.'; }
    else { m.belia = L; kes = { kesetiaan: { ajk: C.muda.ajk } }; msj = 'Anda melantik 4 AJK bawah 30 tahun sebagai pelapis muda (Fasal 15.1.8). Sokongan Belia +' + C.muda.belia + ' dalam pertandingan sayap penggal ini, sokongan AJK +' + C.muda.ajk + '.'; }
    var r = simpan(p, m, kes, { kira: true, tindakan: 'umno_lantik_ketua', nama: 'Lantikan Ketua ' + N + ' (' + ({ setia: 'penyokong setia', puak: 'wakil semua puak', muda: 'pelapis muda' })[pilihan] + ')' });
    return r.ok ? { ok: true, mesej: msj } : { ok: false, ralat: r.ralat };
  }
  function adalahPresiden(p) { return pegang(p, 'presiden'); }
  function statusLantikPresiden(p) {
    if (!adalah(p) || !adalahPresiden(p)) { return { boleh: false, sebab: '' }; }
    var m = st(p); if (m.lantikPresiden === penggal(p)) { return { boleh: false, sebab: 'Lantikan penggal ini sudah dibuat.', sudah: m.lantikPresidenPilihan }; }
    return { boleh: true, sebab: '' };
  }
  function lantikPresiden(pilihan) {
    var p = S().loadPlayer(), s0 = statusLantikPresiden(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab || 'Hanya Presiden UMNO.' }; }
    if (pilihan !== 'setia' && pilihan !== 'pencabar') { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    var m = st(p); m.lantikPresiden = penggal(p); m.lantikPresidenPilihan = pilihan;
    var kes = pilihan === 'setia' ? { kesetiaan: { ajk: 4 } } : { kesetiaan: { perwakilan: 4, ajk: -2 } };
    var r = simpan(p, m, kes, { tindakan: 'umno_lantik', nama: 'Lantik Setiausaha Agung, Bendahari, Ketua Penerangan dan 13 ahli MKT (' + (pilihan === 'setia' ? 'penyokong setia' : 'pencabar dalaman') + ')' });
    return r.ok ? { ok: true, mesej: pilihan === 'setia' ? 'Anda melantik penyokong setia sebagai Setiausaha Agung, Bendahari, Ketua Penerangan dan 13 ahli MKT (termasuk 2 Wanita, 1 Pemuda dan 1 Puteri). Sokongan AJK +4.' : 'Anda melantik pencabar dalaman ke jawatan lantikan MKT untuk menyatukan parti. Sokongan perwakilan +4, sokongan AJK -2.' } : { ok: false, ralat: r.ralat };
  }
  function lantikanSemasa(p) {
    var m = st(p); if (!m.lantikan) { return null; }
    var def = CONFIG.LANTIKAN.filter(function (x) { return x.kod === m.lantikan; })[0];
    return def ? Object.assign({ idx: m.lantikanIdx }, def) : null;
  }
  function dekat(p) { var bp = p && p.negeriBP; return bp && typeof bp.dekat === 'number' ? bp.dekat : CONFIG.MOHON.dekatLalai; }
  function statusMohon(p, kod) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk UMNO.' }; }
    if (adalahPresiden(p)) { return { boleh: false, sebab: 'Anda Presiden: anda yang melantik.' }; }
    var def = CONFIG.LANTIKAN.filter(function (x) { return x.kod === kod; })[0]; if (!def) { return { boleh: false, sebab: 'Jawatan tidak sah.' }; }
    var m = st(p); if (m.lantikan) { return { boleh: false, sebab: 'Anda sudah memegang lantikan ' + lantikanSemasa(p).jawatan + '.' }; }
    if (pangkat(p) < CONFIG.MOHON.pangkatMin) { return { boleh: false, sebab: 'Perlu Ketua Bahagian atau lebih.' }; }
    if (m.mohonBulan === sekarang(p)) { return { boleh: false, sebab: 'Satu permohonan sebulan.' }; }
    if ((Number(p.ap) || 0) < CONFIG.MOHON.ap) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    return { boleh: true, sebab: '', peluang: Math.round(clamp(dekat(p) * CONFIG.MOHON.faktor, 5, 90)) };
  }
  function mohon(kod, o) {
    var p = S().loadPlayer(), s0 = statusMohon(p, kod); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var r = (o && o.rng) || S().rngBerbenih(String(p.id) + '|umno|mohon|' + sekarang(p)), m = st(p), def = CONFIG.LANTIKAN.filter(function (x) { return x.kod === kod; })[0];
    var jaya = r() < s0.peluang / 100; m.mohonBulan = sekarang(p);
    if (jaya) { m.lantikan = kod; m.lantikanIdx = sekarang(p); }
    var res = simpan(p, m, { ap: -CONFIG.MOHON.ap }, { kira: true, tindakan: 'umno_mohon', nama: 'Mohon lantikan ' + def.jawatan + (jaya ? ' (dilantik)' : ' (tidak dilantik)') });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    return { ok: true, jaya: jaya, mesej: jaya ? 'Presiden melantik anda sebagai ' + def.jawatan + '. IP +' + def.ip + ' sebulan dan sokongan dalam pemilihan Pusat bertambah.' : 'Presiden belum bersedia melantik anda sebagai ' + def.jawatan + '. Tingkatkan kedekatan dengan Presiden dan cuba lagi bulan depan.' };
  }

  /* ======================================================================
     4. TATAETIKA: TEMPOH PEMILIHAN (Perkara 5.5, 5.6)
     ====================================================================== */
  /** Laraskan takrif etika aktiviti kempen dalam Tempoh Pemilihan. */
  function etikaKempen(p, id, e) {
    if (!adalah(p) || !tempohPemilihan(p).aktif) { return e; }
    if (id === 'jamuan_mesyuarat' && e) { var x = salin(e); x.risiko = Math.round(x.risiko * CONFIG.ETIKA.jamuan); x.tambahRisiko = Math.round((x.tambahRisiko || 0) * CONFIG.ETIKA.jamuan); return x; }
    if (id === 'lobi_ketua_bahagian') { return salin(CONFIG.ETIKA.lobi); }
    return e;
  }

  /* ======================================================================
     5. BULANAN (rantaian kalendar)
     ====================================================================== */
  function nb(b) { return ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'][b - 1]; }
  function lucut(p, kod, kes, nama) {
    var J0 = J(), d = J0 && J0.cariDef(kod); if (!d) { return null; }
    var patch = J0.terapkan(p, d, false); patch.umno = st(p);
    return S().applyEffects(kes || {}, { kiraTindakan: false, patch: patch, log: { tindakan: 'umno_lucut', nama: nama, peringkat: 'ahli' } });
  }
  function prosesBulan(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat || !adalah(p)) { return { peristiwa: ev }; }
    var r = (o && o.rng) || Sv.rngBerbenih(String(p.id) + '|umno|bulan|' + sekarang(p)), m = st(p), kes = {}, C = CONFIG;
    // 1. kitaran pemilihan (tangguh / musim khas)
    var mj = maju(p); m.kit = mj.kit;
    mj.peristiwa.forEach(function (e) {
      if (e.jenis === 'umno_tangguh') { var dj = dariIdx(e.pru); ev.push({ jenis: 'umno', mesej: 'MKT menangguhkan pemilihan parti ' + e.tahun + ' kerana PRU dijangka pada ' + nb(dj.bulan) + ' ' + dj.tahun + ' (Fasal 10.16). Penggal semua pemegang jawatan dilanjutkan; pemilihan diadakan dalam tempoh 6 bulan selepas PRU.' }); }
      else if (e.jenis === 'umno_khas') { var k = e.khas; ev.push({ jenis: 'umno', mesej: 'PRU selesai. Musim Pemilihan Khas UMNO ' + k.tahun + ' (Fasal 10.16): Cawangan ' + nb(k.c) + ', Mesyuarat Perwakilan Bahagian dan undi Pusat ' + nb(k.b) + ', PAU ' + nb(k.a) + '. Kitaran 3 tahun bermula semula daripada pemilihan ini.' }); }
      else if (e.jenis === 'umno_batal_tangguh') { ev.push({ jenis: 'umno', mesej: 'PRU belum diadakan. MKT memutuskan pemilihan parti diadakan mengikut takwim biasa tahun ' + e.tahun + '.' }); }
    });
    // 2. lantikan Presiden: IP bulanan; tamat apabila Presiden baharu dipilih (undi Pusat selepas lantikan)
    var l = lantikanSemasa(p);
    if (l) {
      var baru = m.kit.lepas.some(function (x) { return x.i >= (l.idx || 0) && x.i < sekarang(p); }) || (function () { var ms = musim(p, m.kit); return ms && sekarang(p) === idx(ms.tahun, ms.b) + 1 && idx(ms.tahun, ms.b) > (l.idx || 0); })();
      if (baru) { m.lantikan = null; ev.push({ jenis: 'umno', mesej: 'Pemilihan Pusat selesai. Lantikan ' + l.jawatan + ' anda tamat; Presiden membuat lantikan baharu.' }); }
      else { kes.ip = (kes.ip || 0) + l.ip; }
    }
    // 3. Perhimpunan Agung Khas (Fasal 8.5, 9.12): separuh Bahagian menuntut apabila sokongan perwakilan Bahagian Presiden rendah
    if (adalahPresiden(p) && ringkasPusat(p).purata < C.PAK.sokongan && r() < C.PAK.peluang) {
      var pl = clamp((C.PAK.sokongan - ringkasPusat(p).purata) * C.PAK.kadar, 0, C.PAK.maks);
      if (r() < pl) { var re = lucut(p, 'presiden', { reputasi: -5 }, 'Dilucutkan dalam Perhimpunan Agung Khas'); if (re && re.ok) { ev.push({ jenis: 'umno', mesej: 'Separuh Bahagian menuntut Perhimpunan Agung Khas (Fasal 8.5) dan usul melucutkan Presiden diluluskan dengan dua pertiga undi (Fasal 9.12). Anda tidak lagi Presiden. Reputasi -5.' }); } p = Sv.loadPlayer(); m.lantikPresiden = null; }
      else { kes.reputasi = (kes.reputasi || 0) - 1; ev.push({ jenis: 'umno', mesej: 'Separuh Bahagian menuntut Perhimpunan Agung Khas (Fasal 8.5), tetapi usul melucutkan Presiden gagal mendapat dua pertiga undi (Fasal 9.12). Reputasi -1. Pulihkan sokongan perwakilan Bahagian.' }); }
    }
    // 4. sokongan perwakilan Bahagian susut perlahan ke arah asal
    Object.keys(m.pusat).forEach(function (k) { var asal = k === kodPL(p) ? C.PUSAT.sendiri : 40; m.pusat[k] = Math.round((m.pusat[k] + (asal - m.pusat[k]) * 0.02) * 10) / 10; });
    simpan(p, m, kes, null);
    cache.raw = null;
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, adalah: adalah, khasDari: khasDari, kit: kit, musim: musim, senaraiTahun: senaraiTahun, adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya,
    lama: lama, baharu: baharu, kitaranId: kitaranId, takwimKini: takwimKini, musimKhasKini: musimKhasKini, kunciMesyuarat: kunciMesyuarat, tempohPemilihan: tempohPemilihan, statusKitaran: statusKitaran,
    sokonganBahagian: sokonganBahagian, perwakilan: perwakilan, ringkasPusat: ringkasPusat, bonusPusat: bonusPusat, bonusSayap: bonusSayap,
    statusJelajah: statusJelajah, jelajah: jelajah, statusPenerangan: statusPenerangan, penerangan: penerangan, senaraiNegeri: senaraiNegeri,
    statusLantikKetua: statusLantikKetua, lantikKetua: lantikKetua, adalahPresiden: adalahPresiden, statusLantikPresiden: statusLantikPresiden, lantikPresiden: lantikPresiden,
    lantikanSemasa: lantikanSemasa, dekat: dekat, statusMohon: statusMohon, mohon: mohon, etikaKempen: etikaKempen, prosesBulan: prosesBulan };
});
