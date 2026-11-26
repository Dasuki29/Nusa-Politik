/* ==========================================================================
   Nusa Politik — js/gerakan.js   (v14.10, maklum balas baris 49, mockup dipersetujui)
   Gerakan Parti Negeri: naikkan Kekuatan Parti di negeri yang lemah.
     - Akses: jawatan Pusat (Presiden dsb.) = semua negeri operasi parti; Ketua Bahagian = negeri sendiri sahaja.
     - Program: Jelajah Negeri (3 AP, RM 10,000, +3, bulanan), Buka Cawangan Baharu (RM 20,000, +2 tidak susut,
       Ahli +150, sekali setahun setiap negeri), Program Komuniti & Media Tempatan (2 AP, RM 5,000, +2, bulanan).
     - Negeri Lemah (< 40) naik x1.5. Had Gerakan +15 setiap negeri. Bonus biasa susut 1 setiap 3 bulan.
     - Kesan: peta (Kekuatan Parti dan Sokongan), PRU (+1 kerusi Parlimen setiap 5 mata di negeri Lemah/Swing, maks +10),
       PRN / kerajaan negeri dan undi kerusi pemain dalam negeri itu (+1 setiap 5 mata).
   ANDAIAN: semua angka ialah angka permainan.
   State: p.gerakan = { n: { kod: { b, t, ahli, jl, pk, cw } }, susut: idx }
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikGerakan = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function MP() { return modul('MyPolitikMap', 'map.js'); }
  function J() { return modul('MyPolitikJawatan', 'jawatan.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function salin(o) { return o === undefined || o === null ? o : JSON.parse(JSON.stringify(o)); }

  var CONFIG = {
    HAD: 15, LEMAH: 40, KUBU: 60, GANDA_LEMAH: 1.5, SUSUT_BULAN: 3, PER_KERUSI: 5, MAKS_KERUSI: 10,
    PROGRAM: {
      jelajah: { nama: '🚌 Jelajah Negeri', ap: 3, myr: 10000, mata: 3, kekerapan: 'bulanan' },
      cawangan: { nama: '🏠 Buka Cawangan Baharu', ap: 0, myr: 20000, mata: 2, tetap: true, ahli: 150, kekerapan: 'tahunan' },
      komuniti: { nama: '🤝 Program Komuniti & Media Tempatan', ap: 2, myr: 5000, mata: 2, kekerapan: 'bulanan' }
    }
  };
  var SABAH = /^(PBRS|PBS|UPKO|LDP|PHRS|PCS|GAGASAN)$/, SARAWAK = /^(PBB|PRS|SUPP|PDP)$/;

  function getG(p) { var g = p && p.gerakan && typeof p.gerakan === 'object' ? salin(p.gerakan) : {}; g.n = g.n || {}; return g; }
  function rekod(g, kod) { var x = g.n[kod] || {}; x.b = Number(x.b) || 0; x.t = Number(x.t) || 0; x.ahli = Number(x.ahli) || 0; g.n[kod] = x; return x; }
  /** Jumlah mata Gerakan bagi negeri (kod peta). */
  function mata(p, kod) { var x = p && p.gerakan && p.gerakan.n && p.gerakan.n[kod]; return x ? clamp((Number(x.b) || 0) + (Number(x.t) || 0), 0, CONFIG.HAD) : 0; }
  function ahliTambah(p, kod) { var x = p && p.gerakan && p.gerakan.n && p.gerakan.n[kod]; return x ? Number(x.ahli) || 0 : 0; }
  function kodNegeri(nama) { var m = MP(); var d = m && m.padanNegeri ? m.padanNegeri(nama) : null; return d ? d.kod : null; }
  function negeriOperasi(p) {
    var m = MP(), semua = m && m.NEGERI14 ? m.NEGERI14 : [];
    if (SARAWAK.test(p.parti || '')) { return semua.filter(function (n) { return n.kod === 'sarawak'; }); }
    if (SABAH.test(p.parti || '')) { return semua.filter(function (n) { return n.kod === 'sabah'; }); }
    if (p.parti === 'BERJASA') { return semua.filter(function (n) { return n.kod !== 'sabah' && n.kod !== 'sarawak'; }); }
    return semua;
  }
  function asas(p, kod) { var m = MP(); return m && m.asasNegeri ? Math.round(m.asasNegeri(p.parti || null, kod, 'peta|' + p.id)) : 50; }
  function status(n) { return n < CONFIG.LEMAH ? 'Lemah' : n < CONFIG.KUBU ? 'Swing' : 'Kubu'; }
  /** Akses: 'semua' (jawatan Pusat), 'negeri' (Ketua Bahagian: negeri sendiri), atau null. */
  function akses(p) {
    var j = J(), list = j && j.getJawatan ? j.getJawatan(p) : (p.jawatanList || []);
    if (list.some(function (x) { return x && (x.peringkat === 'pusat' || x.peringkat === 'pau' || (Number(x.pangkat) || 0) >= 8); })) { return 'semua'; }
    if (list.some(function (x) { return x && x.peringkat === 'bahagian' && (Number(x.pangkat) || 0) >= 7; })) { return 'negeri'; }
    return null;
  }
  function luar(p) { var SL = modul('MyPolitikSelepas', 'selepas.js'); return !!(SL && SL.luarPolitik && SL.luarPolitik(p)); }

  /** Senarai negeri untuk kad: { kod, nama, asas, gerakan, jumlah, status, boleh } */
  function senarai(p) {
    if (!p || p.tamat) { return { akses: null, negeri: [] }; }
    var ak = luar(p) ? null : akses(p), rumah = kodNegeri(p.negeri);
    return { akses: ak, rumah: rumah, negeri: negeriOperasi(p).map(function (n) {
      var a = asas(p, n.kod), g = mata(p, n.kod), j = clamp(a + g, 0, 100);
      return { kod: n.kod, nama: n.nama, asas: a, gerakan: g, jumlah: j, status: status(j), lemah: a < CONFIG.LEMAH, boleh: ak === 'semua' || (ak === 'negeri' && n.kod === rumah) };
    }) };
  }
  function semakProgram(p, kod, jenis) {
    var d = CONFIG.PROGRAM[jenis]; if (!d) { return { boleh: false, sebab: 'Program tidak sah.' }; }
    var sn = senarai(p), n = sn.negeri.filter(function (x) { return x.kod === kod; })[0];
    if (!sn.akses) { return { boleh: false, sebab: 'Perlu jawatan Ketua Bahagian atau jawatan Pusat.' }; }
    if (!n || !n.boleh) { return { boleh: false, sebab: 'Ketua Bahagian hanya boleh menggerakkan negeri sendiri.' }; }
    var x = (p.gerakan && p.gerakan.n && p.gerakan.n[kod]) || {}, kini = idx(p);
    if (jenis === 'jelajah' && x.jl === kini) { return { boleh: false, sebab: 'Sudah dibuat bulan ini.' }; }
    if (jenis === 'komuniti' && x.pk === kini) { return { boleh: false, sebab: 'Sudah dibuat bulan ini.' }; }
    if (jenis === 'cawangan' && x.cw === p.tahun) { return { boleh: false, sebab: 'Sekali setahun bagi setiap negeri.' }; }
    if (n.gerakan >= CONFIG.HAD) { return { boleh: false, sebab: 'Had Gerakan +' + CONFIG.HAD + ' dicapai.' }; }
    if ((Number(p.ap) || 0) < d.ap) { return { boleh: false, sebab: 'AP tidak mencukupi.' }; }
    var kos = S().kosSebenar ? S().kosSebenar(p, d.myr) : d.myr;
    if ((Number(p.myr) || 0) < kos) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, kos: kos, n: n };
  }
  function jalankan(kod, jenis) {
    var Sv = S(), p = Sv.loadPlayer(); if (!p || p.tamat) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var s = semakProgram(p, kod, jenis); if (!s.boleh) { return { ok: false, ralat: s.sebab }; }
    var d = CONFIG.PROGRAM[jenis], g = getG(p), x = rekod(g, kod), kini = idx(p);
    var naik = Math.round(d.mata * (s.n.lemah ? CONFIG.GANDA_LEMAH : 1)); naik = Math.min(naik, CONFIG.HAD - s.n.gerakan);
    if (d.tetap) { x.t += naik; } else { x.b += naik; }
    if (d.ahli) { x.ahli += d.ahli; }
    if (jenis === 'jelajah') { x.jl = kini; } else if (jenis === 'komuniti') { x.pk = kini; } else { x.cw = p.tahun; }
    if (g.susut == null) { g.susut = kini; }
    var h = Sv.applyEffects({ ap: -d.ap, myr: -s.kos }, { kiraTindakan: true, patch: { gerakan: g }, log: { tindakan: 'gerakan_' + jenis, nama: d.nama.replace(/^\S+ /, '') + ': ' + s.n.nama, peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: d.nama.replace(/^\S+ /, '') + ' di ' + s.n.nama + ': Kekuatan Parti +' + naik + (d.ahli ? ', Ahli +' + d.ahli : '') + '.' } : { ok: false, ralat: h.ralat };
  }
  /** Bulanan (calendar.js): bonus biasa susut 1 setiap 3 bulan. */
  function prosesBulan() {
    var Sv = S(), p = Sv && Sv.loadPlayer(); if (!p || p.tamat || !p.gerakan) { return { peristiwa: [] }; }
    var g = getG(p), kini = idx(p); if (g.susut == null) { g.susut = kini; }
    if (kini - g.susut < CONFIG.SUSUT_BULAN) { return { peristiwa: [] }; }
    var ubah = false; Object.keys(g.n).forEach(function (k) { var x = rekod(g, k); if (x.b > 0) { x.b -= 1; ubah = true; } }); g.susut = kini;
    Sv.applyEffects({}, { kiraTindakan: false, patch: { gerakan: g } });
    return { peristiwa: [] };
  }
  /** Bonus kerusi Parlimen parti dalam PRU: +1 setiap 5 mata di negeri Lemah/Swing, maks +10. */
  function bonusKerusi(p) {
    if (!p || !p.gerakan) { return 0; }
    var t = 0; negeriOperasi(p).forEach(function (n) { if (asas(p, n.kod) < CONFIG.KUBU) { t += Math.floor(mata(p, n.kod) / CONFIG.PER_KERUSI); } });
    return Math.min(CONFIG.MAKS_KERUSI, t);
  }
  /** Bonus negeri pemain (undi kerusi sendiri +1% dan peluang kerajaan negeri +1% setiap 5 mata). */
  function bonusNegeriPemain(p) { var k = p ? kodNegeri(p.negeri) : null; return k ? Math.floor(mata(p, k) / CONFIG.PER_KERUSI) : 0; }

  return { CONFIG: CONFIG, getG: getG, mata: mata, ahliTambah: ahliTambah, akses: akses, senarai: senarai, semakProgram: semakProgram, jalankan: jalankan,
    prosesBulan: prosesBulan, bonusKerusi: bonusKerusi, bonusNegeriPemain: bonusNegeriPemain, status: status, kodNegeri: kodNegeri };
});
