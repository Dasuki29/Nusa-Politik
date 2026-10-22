/* ==========================================================================
   Nusa Politik — js/sarawak.js   (v8.33)
   PRN Sarawak untuk pemain PBB: jadual pilihan raya, kekuatan kerusi DUN mengikut komposisi etnik dan parti lawan mengikut kawasan.
   Data DUN (pemilih, peratus etnik) daripada data/pbb-dun.json (dibina oleh tools/build-pbb.js) disimpan dalam profil (p.dunInfo) semasa pendaftaran.
   ANDAIAN (semua nombor ialah penyeimbang simulasi, bukan ramalan atau data keputusan sebenar):
     - PRN pertama tahun 2027, bulan ditentukan secara tetap daripada ID pemain; kitaran 5 tahun (pru.js).
     - Kerusi majoriti Cina: -12 (Sukar) atau -5 (Marginal) pada sokongan asas; kerusi Bumiputera tinggi (85% ke atas): +5 (Selamat).
     - Label parti lawan ikut komposisi kawasan; label simulasi sahaja.
   ========================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikSarawak = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function () {
  'use strict';
  var CONFIG = {
    TAHUN_PRN: 2027,
    CINA: { sukar: 50, marginal: 30 }, OFSET: { sukar: -12, marginal: -5, biasa: 0, selamat: 5 }, BUMI_SELAMAT: 85, BANDAR_CINA: 40
  };
  var TAHAP = { sukar: 'Sukar', marginal: 'Marginal', biasa: 'Sederhana', selamat: 'Selamat' };
  function hash(t) { var h = 7; t = String(t || ''); for (var i = 0; i < t.length; i++) { h = (h * 31 + t.charCodeAt(i)) >>> 0; } return h; }

  /** Jadual PRN: { tahun, bulan }. */
  function jadual(p) { return { tahun: CONFIG.TAHUN_PRN, bulan: 1 + hash((p && (p.id || p.nama)) || 'pbb') % 12 }; }

  /** Ringkasan kerusi DUN pemain PBB, atau null jika bukan PBB / tiada data. */
  function maklumat(p) {
    var d = p && p.parti === 'PBB' && p.dunInfo ? p.dunInfo : null; if (!d || !d.e) { return null; }
    var e = d.e, dayak = Math.round((e.iban + e.bidayuh + e.orangUlu) * 10) / 10, bumi = Math.round((100 - e.cina - e.india - e.lain) * 10) / 10;
    var tahap = e.cina >= CONFIG.CINA.sukar ? 'sukar' : e.cina >= CONFIG.CINA.marginal ? 'marginal' : bumi >= CONFIG.BUMI_SELAMAT ? 'selamat' : 'biasa';
    var profil = e.cina >= CONFIG.BANDAR_CINA ? 'URBAN' : bumi >= 80 ? 'RURAL' : 'MIXED';
    var lawan = e.cina >= CONFIG.BANDAR_CINA ? ['DAP', 'PSB'] : dayak >= 50 ? ['PSB', 'PKR'] : e.melayu >= 50 ? ['PKR', 'PAS'] : ['PKR', 'PSB'];
    return { nama: d.nama, parlimen: d.parlimen, pemilih: d.pemilih, bil: d.bil, melayu: e.melayu, cina: e.cina, india: e.india, dayak: dayak, bumi: bumi, lain: e.lain,
      tahap: tahap, tahapNama: TAHAP[tahap], ofset: CONFIG.OFSET[tahap], profil: profil, lawan: lawan };
  }
  function ofset(p) { var m = maklumat(p); return m ? m.ofset : 0; }
  return { CONFIG: CONFIG, TAHAP: TAHAP, jadual: jadual, maklumat: maklumat, ofset: ofset };
});
