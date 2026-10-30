/* ==========================================================================
   Nusa Politik — js/sabah.js   (v13.9)
   PRN Sabah: pilihan raya DUN Sabah berasingan daripada PRU (mockup PRN Sabah + PBRS, dipersetujui).
   Terpakai kepada semua pemain di Sabah (UMNO Sabah dan PBRS); parti Sarawak kekal dengan js/sarawak.js.
     - PRN terakhir 29 November 2025 (DUN ke-17): GRS 29, Warisan 25, BN 6 (UMNO 5, PBRS 1), UPKO 3, lain-lain 10.
     - ANDAIAN: PRN Sabah seterusnya November 2030, kemudian setiap 5 tahun; PRU Mac 2031 (seperti sekarang), kemudian setiap 5 tahun.
     - DUN dipertandingkan dalam PRN sahaja, Parlimen dalam PRU sahaja; status ADUN kekal semasa PRU dan status MP kekal semasa PRN.
     - Kerajaan negeri selepas PRN: diketuai GRS (andaian); BN masuk kerajaan jika menang sekurang-kurangnya 3 kerusi.
   Kerusi parti lain ialah anggaran permainan, bukan ramalan.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikSabah = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';
  function SW(k) { return k === 'PBB' || k === 'PRS' || k === 'SUPP' || k === 'PDP' || k === 'PSB'; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function hash(t) { var h = 7; t = String(t || ''); for (var i = 0; i < t.length; i++) { h = (h * 31 + t.charCodeAt(i)) >>> 0; } return h; }

  var CONFIG = {
    PRN: { tahun: 2030, bulan: 11 }, PRU_SELEPAS_PRN: { tahun: 1, bulan: 3 }, PRN_SELEPAS_PRU: { tahun: 4, bulan: 11 },
    JUMLAH: 73, BN_AMBANG: 3,
    PRN_2025: { tahun: 2025, GRS: 29, Warisan: 25, BN: 6, UPKO: 3, lain: 10 },
    ANGGARAN: { GRS: [24, 34], Warisan: [18, 28], BN: [3, 9], UPKO: [1, 4] }
  };
  /** Pemain di Sabah (bukan parti Sarawak): UMNO Sabah atau PBRS. */
  function adalah(p) { return !!p && !SW(p.parti) && (p.parti === 'PBRS' || /sabah/i.test(String(p.negeri || ''))); }
  function jadual() { return { tahun: CONFIG.PRN.tahun, bulan: CONFIG.PRN.bulan }; }
  /** Jadual musim seterusnya selepas 'PRN' atau 'PRU' tamat: { jenis, tahun, bulan }. */
  function jadualBerikut(p, jenisTamat) {
    var t = parseInt(p.tahun, 10) || CONFIG.PRN.tahun;
    return jenisTamat === 'PRN' ? { jenis: 'PRU', tahun: t + CONFIG.PRU_SELEPAS_PRN.tahun, bulan: CONFIG.PRU_SELEPAS_PRN.bulan }
      : { jenis: 'PRN', tahun: t + CONFIG.PRN_SELEPAS_PRU.tahun, bulan: CONFIG.PRN_SELEPAS_PRU.bulan };
  }
  /** Jadual awal bagi simpanan yang belum ada jadual Sabah. sekarang = indeks bulan pemain. */
  function jadualAwal(p, pru) {
    var now = (parseInt(p.tahun, 10) || 2026) * 12 + (parseInt(p.bulan, 10) || 1), j = jadual();
    if (!(pru.sejarah && pru.sejarah.length) && !pru.aktif && now <= j.tahun * 12 + j.bulan) { return { jenis: 'PRN', tahun: j.tahun, bulan: j.bulan }; }
    return { jenis: 'PRU', tahun: pru.tahunPRU, bulan: pru.bulanPRU };          // simpanan lama: PRU sedia ada diteruskan, PRN Sabah selepasnya
  }
  /** Lawan utama (label simulasi). */
  function lawan(p, jenis) { return jenis === 'DUN' ? ['Warisan', 'GRS'] : ['Warisan', 'PKR']; }
  /** Anggaran kerusi PRN Sabah (73 DUN). Benih tetap ikut pemain dan tahun; populariti parti menggeser kerusi BN. */
  function kerusiPRN(p, pop) {
    var h = hash(String(p.id || p.nama) + '|prnSabah|' + p.tahun), A = CONFIG.ANGGARAN;
    function ambil(r, n) { return r[0] + ((h >>> n) % (r[1] - r[0] + 1)); }
    var bn = clamp(ambil(A.BN, 0) + Math.round(((Number(pop) || 45) - 45) / 5), 1, 14), grs = ambil(A.GRS, 5), war = ambil(A.Warisan, 10), upko = ambil(A.UPKO, 15);
    var lain = Math.max(0, CONFIG.JUMLAH - bn - grs - war - upko);
    return { tahun: parseInt(p.tahun, 10), GRS: grs, Warisan: war, BN: bn, UPKO: upko, lain: lain, kerajaanBN: bn >= CONFIG.BN_AMBANG };
  }
  return { CONFIG: CONFIG, adalah: adalah, jadual: jadual, jadualBerikut: jadualBerikut, jadualAwal: jadualAwal, lawan: lawan, kerusiPRN: kerusiPRN };
});
