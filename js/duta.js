/* ==========================================================================
   Nusa Politik — js/duta.js   (v14.6, maklum balas baris 47, mockup dipersetujui)
   Duta Malaysia ke luar negara: lantikan politik selepas bersara (pilihan dalam js/selepas.js).
     - Syarat: umur >= 45, pernah Ahli Parlimen / anggota Kabinet atau jawatan Pusat parti, Integriti >= 50.
     - Wisma Putra menawarkan 3 daripada 8 pos (pos besar perlu Reputasi lebih tinggi).
     - Penggal 36 bulan; elaun RM 18,000 sebulan; keahlian parti digantung.
     - Meter: Hubungan Dua Hala, Kepercayaan Wisma Putra, Kebajikan Rakyat Malaysia (susut 1 sebulan).
     - Tindakan bulanan: Kunjungan hormat, Misi perdagangan, Bantuan konsular, Majlis Hari Kebangsaan (Ogos).
     - Acara: krisis konsular (rundingan senyap / kenyataan media), lawatan rasmi Perdana Menteri.
     - Tamat penggal: Hubungan dan Kepercayaan >= 60 = penggal kedua ditawarkan (sekali); selain itu tamat
       (pilih TYT jika layak, atau bersara: legasi 'duta').
   ANDAIAN: semua angka ialah angka permainan.
   State: p.duta = { aktif:{pos,penggal,mula,tamat,tahunMula,hubungan,kepercayaan,kebajikan,kunjungan,dagang,konsular,hariTahun,krisis,lawatan,lanjut}, sejarah:[] }
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikDuta = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function HY() { return modul('MyPolitikHayat', 'hayat.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function salin(o) { return o === undefined || o === null ? o : JSON.parse(JSON.stringify(o)); }
  var rngLalai = Math.random;
  function rng(o) { return (o && o.rng) || rngLalai; }

  var POS = [
    { kod: 'jakarta', bandar: 'Jakarta', negara: 'Indonesia', bendera: '🇮🇩', isu: 'Pekerja migran, sempadan', tahap: 'Sukar', rep: 0, krisis: 0.12 },
    { kod: 'singapura', bandar: 'Singapura', negara: 'Singapura', bendera: '🇸🇬', isu: 'Air, pekerja ulang-alik', tahap: 'Sederhana', rep: 0, krisis: 0.08 },
    { kod: 'riyadh', bandar: 'Riyadh', negara: 'Arab Saudi', bendera: '🇸🇦', isu: 'Haji dan umrah, pelaburan', tahap: 'Sederhana', rep: 0, krisis: 0.08 },
    { kod: 'tokyo', bandar: 'Tokyo', negara: 'Jepun', bendera: '🇯🇵', isu: 'Pelaburan, Dasar Pandang ke Timur', tahap: 'Mudah', rep: 0, krisis: 0.04 },
    { kod: 'canberra', bandar: 'Canberra', negara: 'Australia', bendera: '🇦🇺', isu: 'Pelajar, pendidikan', tahap: 'Mudah', rep: 40, krisis: 0.05 },
    { kod: 'beijing', bandar: 'Beijing', negara: 'China', bendera: '🇨🇳', isu: 'Perdagangan, Laut China Selatan', tahap: 'Sukar', rep: 55, krisis: 0.07 },
    { kod: 'london', bandar: 'London', negara: 'United Kingdom', bendera: '🇬🇧', isu: 'Pelajar, Komanwel', tahap: 'Sederhana', rep: 60, krisis: 0.06 },
    { kod: 'washington', bandar: 'Washington', negara: 'Amerika Syarikat', bendera: '🇺🇸', isu: 'Tarif, keselamatan serantau', tahap: 'Sukar', rep: 70, krisis: 0.06 }
  ];
  var TAHAP = { Mudah: 55, Sederhana: 50, Sukar: 45 };
  var CONFIG = {
    UMUR: 45, INTEGRITI: 50, TAWAR: 3, PENGGAL: 36, ELAUN: 18000, SUSUT: 1, LANJUT: 60,
    KUNJUNGAN: { ap: 2, hubungan: 4 }, DAGANG: { ap: 3, myr: 5000, hubungan: 2, kepercayaan: 4 }, KONSULAR: { ap: 2, kebajikan: 5 },
    HARI: { bulan: 8, ap: 2, semua: 3 },
    KRISIS: { senyap: { hubungan: 4, kebajikan: -3 }, media: { kebajikan: 6, hubungan: -6 }, abai: { kebajikan: -8, kepercayaan: -4 } },
    LAWATAN: { peluang: 0.05, kepercayaan: 5, hubungan: 3 }
  };
  function cari(kod) { return POS.filter(function (x) { return x.kod === kod; })[0] || null; }
  function getD(p) { var d = p && p.duta && typeof p.duta === 'object' ? salin(p.duta) : {}; d.aktif = d.aktif || null; d.sejarah = Array.isArray(d.sejarah) ? d.sejarah : []; return d; }
  function aktif(p) { return !!(p && p.duta && p.duta.aktif && !p.tamat); }
  function simpan(d, kesan, opts) { opts = opts || {}; return S().applyEffects(kesan || {}, { kiraTindakan: !!opts.log, pindahan: !!opts.pindahan, patch: Object.assign({ duta: d }, opts.patch || {}), log: opts.log }); }

  /** Pos yang ditawarkan (3 daripada pos yang layak mengikut Reputasi); deterministik bagi bulan semasa. */
  function tawaran(p) {
    var rep = Number(p.reputasi) || 50, ok = POS.filter(function (x) { return rep >= x.rep; });
    var benih = idx(p) * 31 + (String(p.nama || '').length * 7), s = ok.slice();
    s.sort(function (a, b) { return ((a.kod.charCodeAt(0) * 13 + benih) % 17) - ((b.kod.charCodeAt(0) * 13 + benih) % 17) || (a.kod < b.kod ? -1 : 1); });
    return s.slice(0, CONFIG.TAWAR);
  }
  /** Mula perkhidmatan (dipanggil oleh js/selepas.js selepas semua jawatan dilepaskan). */
  function mula(kod) {
    var Sv = S(), p = Sv.loadPlayer(), d = getD(p), pos = cari(kod);
    if (!pos) { return { ok: false, ralat: 'Pos tidak sah.' }; }
    if (!tawaran(p).some(function (x) { return x.kod === kod; })) { return { ok: false, ralat: 'Pos ini tidak ditawarkan.' }; }
    var m = TAHAP[pos.tahap] || 50;
    d.aktif = { pos: kod, penggal: 1, mula: idx(p), tamat: idx(p) + CONFIG.PENGGAL, tahunMula: p.tahun, hubungan: m, kepercayaan: 50, kebajikan: m,
      kunjungan: 0, dagang: 0, konsular: 0, hariTahun: 0, krisis: null, lawatan: null, lanjut: false };
    var h = simpan(d, {}, { log: { tindakan: 'duta_lantik', nama: 'Dilantik Duta Malaysia ke ' + pos.negara, peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: 'Anda menyerahkan Surat Tauliah di ' + pos.bandar + ' sebagai Duta Malaysia ke ' + pos.negara + '. Gelaran: Tuan Yang Terutama. Tab Kedutaan dibuka.' } : { ok: false, ralat: h.ralat };
  }

  function laras(a, x) { ['hubungan', 'kepercayaan', 'kebajikan'].forEach(function (k) { if (x[k]) { a[k] = clamp(a[k] + x[k], 0, 100); } }); }
  function tanda(n) { return (n > 0 ? '+' : '') + n; }
  var LABEL = { hubungan: 'Hubungan', kepercayaan: 'Kepercayaan', kebajikan: 'Kebajikan' };
  function ringkas(x) { return ['hubungan', 'kepercayaan', 'kebajikan'].filter(function (k) { return x[k]; }).map(function (k) { return LABEL[k] + ' ' + tanda(x[k]); }).join(', '); }
  function mesti() { var p = S().loadPlayer(); if (!aktif(p)) { return { ralat: 'Hanya Duta Malaysia.' }; } return { p: p, d: getD(p) }; }
  function bolehAP(p, n) { return (Number(p.ap) || 0) >= n; }

  function tindak(jenis) {
    var c = mesti(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var a = c.d.aktif, p = c.p, kini = idx(p), x, kes = {}, mesej, pos = cari(a.pos);
    if (jenis === 'kunjungan') {
      if (a.kunjungan === kini) { return { ok: false, ralat: 'Kunjungan hormat bulan ini sudah dibuat.' }; }
      if (!bolehAP(p, CONFIG.KUNJUNGAN.ap)) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
      a.kunjungan = kini; x = { hubungan: CONFIG.KUNJUNGAN.hubungan }; kes.ap = -CONFIG.KUNJUNGAN.ap; mesej = 'Anda membuat kunjungan hormat kepada pemimpin ' + pos.negara + '.';
    } else if (jenis === 'dagang') {
      if (a.dagang === kini) { return { ok: false, ralat: 'Misi perdagangan bulan ini sudah dibuat.' }; }
      if (!bolehAP(p, CONFIG.DAGANG.ap)) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
      if ((Number(p.myr) || 0) < CONFIG.DAGANG.myr) { return { ok: false, ralat: 'Dana tidak mencukupi.' }; }
      a.dagang = kini; x = { hubungan: CONFIG.DAGANG.hubungan, kepercayaan: CONFIG.DAGANG.kepercayaan }; kes.ap = -CONFIG.DAGANG.ap; kes.myr = -CONFIG.DAGANG.myr; mesej = 'Misi perdagangan ke ' + pos.negara + ' membawa minat pelaburan baharu.';
    } else if (jenis === 'konsular') {
      if (a.konsular === kini) { return { ok: false, ralat: 'Bantuan konsular bulan ini sudah dibuat.' }; }
      if (!bolehAP(p, CONFIG.KONSULAR.ap)) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
      a.konsular = kini; x = { kebajikan: CONFIG.KONSULAR.kebajikan }; kes.ap = -CONFIG.KONSULAR.ap; mesej = 'Anda membantu rakyat Malaysia di ' + pos.negara + ' (dokumen, tahanan, pelajar).';
    } else if (jenis === 'hari') {
      if (parseInt(p.bulan, 10) !== CONFIG.HARI.bulan) { return { ok: false, ralat: 'Majlis Hari Kebangsaan hanya pada bulan Ogos.' }; }
      if (a.hariTahun === p.tahun) { return { ok: false, ralat: 'Majlis Hari Kebangsaan tahun ini sudah diadakan.' }; }
      if (!bolehAP(p, CONFIG.HARI.ap)) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
      a.hariTahun = p.tahun; x = { hubungan: CONFIG.HARI.semua, kepercayaan: CONFIG.HARI.semua, kebajikan: CONFIG.HARI.semua }; kes.ap = -CONFIG.HARI.ap; mesej = 'Majlis sambutan Hari Kebangsaan di kedutaan meriah.';
    } else { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    laras(a, x);
    var h = simpan(c.d, kes, { log: { tindakan: 'duta_' + jenis, nama: mesej, peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: mesej + ' ' + ringkas(x) + '.' } : { ok: false, ralat: h.ralat };
  }
  /** Krisis konsular: pilihan = senyap | media */
  function krisis(pilihan) {
    var c = mesti(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var a = c.d.aktif; if (!a.krisis) { return { ok: false, ralat: 'Tiada krisis konsular.' }; }
    var x = CONFIG.KRISIS[pilihan]; if (!x || pilihan === 'abai') { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    laras(a, x); a.krisis = null;
    var h = simpan(c.d, {}, { log: { tindakan: 'duta_krisis', nama: 'Krisis konsular: ' + pilihan, peringkat: 'ahli' } });
    var m = pilihan === 'senyap' ? 'Rundingan senyap dengan pihak berkuasa tempatan berjalan lancar.' : 'Kenyataan media anda mendapat sokongan rakyat di tanah air.';
    return h.ok ? { ok: true, mesej: m + ' ' + ringkas(x) + '.' } : { ok: false, ralat: h.ralat };
  }
  function terimaLanjut(ya) {
    var c = mesti(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var a = c.d.aktif; if (!a.lanjut) { return { ok: false, ralat: 'Tiada tawaran penggal kedua.' }; }
    if (!ya) { return tamatPenggal(c.p, c.d, 'Anda memilih untuk tidak menyambung perkhidmatan.'); }
    a.penggal = 2; a.tamat = idx(c.p) + CONFIG.PENGGAL; a.lanjut = false;
    var h = simpan(c.d, {}, { log: { tindakan: 'duta_lanjut', nama: 'Penggal kedua Duta Malaysia', peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: 'Wisma Putra melanjutkan perkhidmatan anda tiga tahun lagi.' } : { ok: false, ralat: h.ralat };
  }
  /** Tamat perkhidmatan: jika layak TYT, pemain memilih (js/selepas.js); jika tidak, kerjaya tamat (legasi 'duta'). */
  function tamatPenggal(p, d, sebab) {
    var a = d.aktif, pos = cari(a.pos);
    d.sejarah = d.sejarah.concat([{ pos: a.pos, dari: a.tahunMula, hingga: p.tahun, penggal: a.penggal, hubungan: a.hubungan }]); d.aktif = null;
    var SL = modul('MyPolitikSelepas', 'selepas.js'), teks = sebab + ' Perkhidmatan anda sebagai Duta Malaysia ke ' + pos.negara + ' (' + a.tahunMula + '–' + p.tahun + ') tamat.';
    var bolehTYT = SL && SL.pilihan ? SL.pilihan(Object.assign({}, p, { duta: d })).tyt.boleh : false;
    var patch = { selepas: Object.assign({}, p.selepas || {}, { jalur: null, limbo: bolehTYT, dutaSelesai: true }) };
    simpan(d, {}, { patch: patch, log: { tindakan: 'duta_tamat', nama: 'Tamat perkhidmatan Duta Malaysia ke ' + pos.negara, peringkat: 'ahli' } });
    if (bolehTYT) { return { ok: true, mesej: teks + ' Anda layak ditimbang sebagai Yang di-Pertua Negeri: pilih di kad Selepas Politik (tab Profil).' }; }
    var H = HY(), r = H && H.tamatkan ? H.tamatkan('duta') : { ok: false };
    return { ok: true, tamat: true, mesej: teks, hayat: r };
  }

  /** Bulanan (calendar.js). */
  function prosesBulan(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [], r = rng(o);
    if (!aktif(p)) { return { peristiwa: ev }; }
    var d = getD(p), a = d.aktif, pos = cari(a.pos);
    if (idx(p) >= a.tamat) {
      if (a.penggal === 1 && a.hubungan >= CONFIG.LANJUT && a.kepercayaan >= CONFIG.LANJUT && !a.lanjut) {
        a.lanjut = true; a.tamat = idx(p) + 1; simpan(d, {});
        ev.push({ jenis: 'duta', mesej: 'Penggal pertama anda tamat. Wisma Putra menawarkan penggal kedua di ' + pos.bandar + ': jawab di tab Kedutaan.' }); return { peristiwa: ev };
      }
      var x = tamatPenggal(p, d, a.lanjut ? 'Anda tidak menjawab tawaran penggal kedua.' : 'Penggal anda tamat.');
      ev.push({ jenis: 'duta', mesej: x.mesej }); return { peristiwa: ev };
    }
    if (a.krisis) { laras(a, CONFIG.KRISIS.abai); a.krisis = null; ev.push({ jenis: 'duta', mesej: 'Krisis konsular dibiarkan tanpa tindakan. ' + ringkas(CONFIG.KRISIS.abai) + '.' }); }
    laras(a, { hubungan: -CONFIG.SUSUT, kepercayaan: -CONFIG.SUSUT, kebajikan: -CONFIG.SUSUT });
    if (r() < pos.krisis) {
      var n = 3 + Math.floor(r() * 18); a.krisis = { bil: n, tahun: p.tahun, bulan: p.bulan };
      ev.push({ jenis: 'duta', mesej: 'Krisis konsular: ' + n + ' rakyat Malaysia ditahan di ' + pos.negara + '. Pilih tindakan di tab Kedutaan.' });
    } else if (r() < CONFIG.LAWATAN.peluang) {
      laras(a, { kepercayaan: CONFIG.LAWATAN.kepercayaan, hubungan: CONFIG.LAWATAN.hubungan });
      ev.push({ jenis: 'duta', mesej: 'Lawatan rasmi Perdana Menteri ke ' + pos.negara + ' berjalan lancar. Kepercayaan +' + CONFIG.LAWATAN.kepercayaan + ', Hubungan +' + CONFIG.LAWATAN.hubungan + '.' });
    }
    Sv.applyEffects({ myr: CONFIG.ELAUN }, { kiraTindakan: false, pindahan: true, patch: { duta: d }, log: { tindakan: 'elaun_duta', nama: 'Elaun Duta Malaysia: +RM ' + CONFIG.ELAUN, peringkat: 'bulan' } });
    return { peristiwa: ev };
  }
  function keadaan(p) {
    var d = getD(p), a = d.aktif; if (!a) { return { aktif: false, sejarah: d.sejarah }; }
    var kini = idx(p);
    return { aktif: true, a: a, pos: cari(a.pos), bulanKe: Math.min(CONFIG.PENGGAL, kini - a.mula + 1), boleh: {
      kunjungan: a.kunjungan !== kini && bolehAP(p, CONFIG.KUNJUNGAN.ap), dagang: a.dagang !== kini && bolehAP(p, CONFIG.DAGANG.ap) && (Number(p.myr) || 0) >= CONFIG.DAGANG.myr,
      konsular: a.konsular !== kini && bolehAP(p, CONFIG.KONSULAR.ap), hari: parseInt(p.bulan, 10) === CONFIG.HARI.bulan && a.hariTahun !== p.tahun && bolehAP(p, CONFIG.HARI.ap) } };
  }

  return { CONFIG: CONFIG, POS: POS, setRng: function (f) { rngLalai = f || Math.random; }, getD: getD, aktif: aktif, cari: cari, tawaran: tawaran, mula: mula,
    tindak: tindak, krisis: krisis, terimaLanjut: terimaLanjut, prosesBulan: prosesBulan, keadaan: keadaan };
});
