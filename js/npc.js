/* ==========================================================================
   Nusa Politik — js/npc.js   (v13.20)
   Lantikan selepas menang Ketua (Cawangan / Bahagian) atau Presiden: Kekalkan atau Ubah pegawai dilantik
   (Setiausaha, Bendahari, Ketua Penerangan) dalam Struktur Organisasi (mockup "Satu Senarai Nama NPC", dipersetujui).
     Kekalkan: sokongan AJK +2. Ubah: pilih daripada 3 penyokong (AJK dalam Struktur); sokongan AJK −2, kesetiaan Ketua Cawangan +1.
     Dibuka hingga akhir bulan keputusan; yang belum dipilih dikekalkan secara automatik.
   ANDAIAN: kesan ialah angka permainan.
   State: p.npc = { nama:{ kunci: nama }, lantikan:{ peringkat, tahun, bulan, keputusan:{ indeks: 'kekal'|'ubah' } }|null }.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikNPC = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function OG() { return modul('MyPolitikOrganisasi', 'organisasi.js'); }
  var CONFIG = { KEKAL: { ajk: 2 }, UBAH: { ajk: -2, ketuaCawangan: 1 }, PILIHAN: 3 };

  function getNPC(p) { var x = p && p.npc && typeof p.npc === 'object' ? JSON.parse(JSON.stringify(p.npc)) : {}; x.nama = x.nama || {}; return x; }
  /** Lantikan aktif (bulan keputusan sahaja) atau null. */
  function lantikanAktif(p) {
    var l = getNPC(p).lantikan; if (!l) { return null; }
    if (parseInt(l.tahun, 10) !== parseInt(p.tahun, 10) || parseInt(l.bulan, 10) !== parseInt(p.bulan, 10)) { return null; }
    return l;
  }
  /** Senarai pegawai dilantik bagi lantikan aktif: [{ i, jawatan, nama, kunci, keputusan, pilihan:[nama] }]. */
  function senarai(p) {
    var l = getNPC(p).lantikan, O = OG(); if (!l || !O || !O.blok) { return []; }
    var b = O.blok(p, l.peringkat, null), peg = b.tambahan.filter(function (x) { return x.dilantik; });
    var semasa = peg.map(function (x) { return x.nama; }), kolam = b.ajk.filter(function (x) { return !x.pemain && semasa.indexOf(x.nama) < 0; }).map(function (x) { return x.nama; });
    return peg.map(function (x, i) {
      var mula = (i * CONFIG.PILIHAN) % Math.max(1, kolam.length), pil = [];
      for (var k = 0; k < kolam.length && pil.length < CONFIG.PILIHAN; k++) { var n = kolam[(mula + k) % kolam.length]; if (pil.indexOf(n) < 0) { pil.push(n); } }
      return { i: i, jawatan: x.jawatan.replace(/ \(dilantik\)$/, ''), nama: x.nama, kunci: x.kunci, keputusan: (l.keputusan || {})[i] || null, pilihan: pil };
    });
  }
  function simpan(npc, kes, log) { return S().applyEffects(kes || {}, { kiraTindakan: false, patch: { npc: npc }, log: log }); }
  function kekal(i) {
    var p = S().loadPlayer(), l = lantikanAktif(p); if (!l) { return { ok: false, ralat: 'Tiada lantikan dibuka.' }; }
    var x = senarai(p).filter(function (y) { return y.i === i; })[0]; if (!x || x.keputusan) { return { ok: false, ralat: 'Sudah diputuskan.' }; }
    var npc = getNPC(p); npc.lantikan.keputusan = npc.lantikan.keputusan || {}; npc.lantikan.keputusan[i] = 'kekal';
    var r = simpan(npc, { kesetiaan: { ajk: CONFIG.KEKAL.ajk } }, { tindakan: 'lantikan_kekal', nama: 'Kekalkan ' + x.jawatan + ': ' + x.nama, peringkat: 'ahli' });
    return { ok: !!(r && r.ok), mesej: x.nama + ' dikekalkan sebagai ' + x.jawatan + '. Sokongan AJK +' + CONFIG.KEKAL.ajk + '.' };
  }
  function ubah(i, nama) {
    var p = S().loadPlayer(), l = lantikanAktif(p); if (!l) { return { ok: false, ralat: 'Tiada lantikan dibuka.' }; }
    var x = senarai(p).filter(function (y) { return y.i === i; })[0]; if (!x || x.keputusan) { return { ok: false, ralat: 'Sudah diputuskan.' }; }
    if (x.pilihan.indexOf(nama) < 0) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    var npc = getNPC(p); npc.lantikan.keputusan = npc.lantikan.keputusan || {}; npc.lantikan.keputusan[i] = 'ubah'; npc.nama[x.kunci] = nama;
    var r = simpan(npc, { kesetiaan: { ajk: CONFIG.UBAH.ajk, ketuaCawangan: CONFIG.UBAH.ketuaCawangan } }, { tindakan: 'lantikan_ubah', nama: 'Lantik ' + nama + ' sebagai ' + x.jawatan, peringkat: 'ahli' });
    return { ok: !!(r && r.ok), mesej: nama + ' dilantik sebagai ' + x.jawatan + '. Sokongan AJK ' + CONFIG.UBAH.ajk + ', kesetiaan Ketua Cawangan +' + CONFIG.UBAH.ketuaCawangan + '.' };
  }
  /** Kekalkan semua yang belum diputuskan dan tutup lantikan. */
  function kekalSemua(p0, auto) {
    var p = p0 || S().loadPlayer(), npc = getNPC(p); if (!npc.lantikan) { return { ok: false, ralat: 'Tiada lantikan dibuka.' }; }
    var baki = senarai(p).filter(function (x) { return !x.keputusan; }), naik = baki.length * CONFIG.KEKAL.ajk;
    npc.lantikan = null;
    var r = simpan(npc, naik ? { kesetiaan: { ajk: naik } } : {}, { tindakan: 'lantikan_tutup', nama: (auto ? 'Lantikan dikekalkan secara automatik' : 'Lantikan selesai') + (baki.length ? ' (' + baki.length + ' dikekalkan)' : ''), peringkat: 'ahli' });
    return { ok: !!(r && r.ok), mesej: baki.length ? baki.length + ' pegawai dikekalkan. Sokongan AJK +' + naik + '.' : 'Lantikan selesai.' };
  }
  function prosesBulan() {
    var p = S() && S().loadPlayer(), ev = [];
    if (!p || p.tamat || !p.npc || !p.npc.lantikan) { return { peristiwa: ev }; }
    if (!lantikanAktif(p)) {
      var ada = senarai(p).filter(function (x) { return !x.keputusan; }).length;
      kekalSemua(p, true);
      if (ada) { ev.push({ jenis: 'lantikan_auto', mesej: 'Pegawai dilantik yang belum diputuskan dikekalkan secara automatik (' + ada + ').' }); }
    }
    return { peristiwa: ev };
  }
  return { CONFIG: CONFIG, getNPC: getNPC, lantikanAktif: lantikanAktif, senarai: senarai, kekal: kekal, ubah: ubah, kekalSemua: kekalSemua, prosesBulan: prosesBulan };
});
