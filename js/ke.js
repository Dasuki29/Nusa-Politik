/* ==========================================================================
   Nusa Politik — js/ke.js   (v13.79)
   Modul Kementerian Ekonomi (takrif untuk enjin generik js/kementerian.js), mockup dipersetujui.
   p.ke: pertumbuhan KDNK (%), kadar pengangguran (%), keyakinan pelabur, jurang pendapatan (lebih rendah lebih baik),
   dana inisiatif (RM 40 juta sebulan, had RM 200 juta).
   Fokus ekonomi: pertumbuhan / seimbang / agihan saksama. Inisiatif: zon ekonomi khas (6 bulan), subsidi upah graduan,
   pelan peralihan tenaga, program usahawan B40. Isu: kemelesetan global (pakej rangsangan / disiplin fiskal), pemberhentian
   pekerja, penarafan kredit diturunkan.
   Akibat: pengangguran > 5% = KPI −3, populariti −2; jurang > 60 = populariti −1; KDNK mengalir ke populariti (KDNK − 3).
   Sambungan: KDNK menambah hasil MOF (hasilKDNK); pakej rangsangan menolak rizab MOF.
   ANDAIAN: semua nilai ialah anggaran permainan; krisis ialah label simulasi.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var KM = root.MyPolitikKementerian || (typeof require === 'function' ? require('./kementerian.js') : null);
  var api = factory(KM);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikKE = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (KM) {
  'use strict';
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  var api = KM.cipta({
    kunci: 'ke', tab: '📈 Pejabat Ekonomi', pejabat: 'Pejabat Ekonomi', portfolio: /^Menteri Ekonomi$/, ralat: 'Hanya Menteri Ekonomi.',
    meter: {
      kdnk: { nama: 'Pertumbuhan KDNK', awal: 4.2, min: -5, maks: 10, desimal: 1, unit: '%', asas: 4.0, alir: 0.25, isi: function (v) { return (v + 2) * 10; }, bahaya: function (v) { return v < 2; }, nota: 'sasaran 4–5%' },
      pengangguran: { nama: 'Kadar pengangguran', awal: 3.6, min: 1, maks: 15, desimal: 1, unit: '%', asas: 3.6, alir: 0.25, isi: function (v) { return v * 10; }, bahaya: function (v) { return v > 5; } },
      pelabur: { nama: 'Keyakinan pelabur', awal: 57, min: 0, maks: 100, asas: 55, alir: 0.2, bahaya: function (v) { return v < 35; } },
      jurang: { nama: 'Jurang pendapatan', awal: 48, min: 0, maks: 100, asas: 48, alir: 0.15, bahaya: function (v) { return v > 60; }, nota: 'lebih rendah lebih baik' }
    },
    sasaran: function (k, m) {
      if (k === 'pengangguran') { return -(m.kdnk - 4) * 0.3; }                       // ekonomi berkembang = lebih banyak kerja
      if (k === 'pelabur') { return Math.round((m.kdnk - 4) * 3); }
      return 0;
    },
    dana: { awal: 80, bulan: 40, had: 200 },
    tindakan: [
      { id: 'zon', ikon: '🏭', nama: 'Zon ekonomi khas', kos: 60, siap: 6, kesan: { kdnk: 0.4, pengangguran: -0.4, pelabur: 6 } },
      { id: 'upah', ikon: '💼', nama: 'Subsidi upah graduan', kos: 30, kesan: { pengangguran: -0.3 } },
      { id: 'tenaga', ikon: '⚡', nama: 'Pelan peralihan tenaga', kos: 40, kesan: { pelabur: 8, kdnk: -0.1 } },
      { id: 'b40', ikon: '🤝', nama: 'Program usahawan B40', kos: 25, kesan: { jurang: -4, akar: 2 } }
    ],
    dasar: {
      fokus: { nama: 'Fokus ekonomi', ikon: '🧭', lalai: 'seimbang', pilihan: [
        { id: 'tumbuh', label: 'Pertumbuhan', sas: { kdnk: 0.3, pelabur: 5, jurang: 6 } },
        { id: 'seimbang', label: 'Pendekatan seimbang' },
        { id: 'agihan', label: 'Agihan saksama', sas: { jurang: -6, kdnk: -0.2, pelabur: -3 }, kejut: { akar: 2 } }] }
    },
    isuPeluang: 0.2,
    isu: {
      meleset: { ikon: '🌍', nama: 'Kemelesetan ekonomi global', tamat: 3, abai: { kdnk: -0.5 }, pilihan: [
        { id: 'rangsangan', ikon: '💰', label: 'Pakej rangsangan', kesan: { kdnk: 0.8, pengangguran: -0.3, pelabur: -3, rizab: 2.0 }, mesej: 'Pakej rangsangan diumumkan untuk menahan kemelesetan.' },
        { id: 'disiplin', ikon: '📉', label: 'Disiplin fiskal', kesan: { pelabur: 6, pengangguran: 0.4, pop: -3 }, mesej: 'Kerajaan memilih disiplin fiskal; pelabur yakin, rakyat terkesan.' }] },
      buang: { ikon: '🏢', nama: 'Syarikat besar mengumumkan pemberhentian ribuan pekerja', tamat: 3, abai: { pengangguran: 0.2 }, pilihan: [
        { id: 'latih', ikon: '🎓', label: 'Geran latihan semula', kos: 20, kesan: { pengangguran: -0.3 }, mesej: 'Geran latihan semula disediakan untuk pekerja terjejas.' },
        { id: 'insentif', ikon: '🤝', label: 'Insentif kekalkan pekerja', kos: 30, kesan: { pengangguran: -0.2, pelabur: 2 }, mesej: 'Insentif diberi supaya syarikat mengekalkan pekerja.' }] },
      kredit: { ikon: '📊', nama: 'Agensi penarafan menurunkan prospek kredit negara', tamat: 3, abai: { pelabur: -3 }, pilihan: [
        { id: 'pelan', ikon: '📑', label: 'Umumkan pelan fiskal sederhana', kesan: { pelabur: 5, pop: -1 }, mesej: 'Pelan fiskal jangka sederhana diumumkan.' },
        { id: 'jelajah', ikon: '✈️', label: 'Jelajah pelabur antarabangsa', kos: 20, kesan: { pelabur: 4 }, mesej: 'Jelajah pelabur meyakinkan pasaran.' }] }
    },
    akibat: [
      { meter: 'pengangguran', atas: 5, kesan: { rating: -3, pop: -2 }, mesej: 'Pengangguran melebihi 5%: rakyat resah (KPI −3, populariti −2).' },
      { meter: 'jurang', atas: 60, kesan: { pop: -1 }, mesej: 'Jurang pendapatan melebar (populariti −1).' }
    ],
    bulanan: function (m, p, ctx) { ctx.d.pop = (ctx.d.pop || 0) + clamp(Math.round(m.kdnk - 3), -2, 2); }   // KDNK mengalir ke populariti
  });
  /** Tambahan hasil MOF (RM bilion sebulan) daripada pertumbuhan KDNK (dipanggil oleh mof.js). */
  api.hasilKDNK = function (p) { return p && p.ke && typeof p.ke.kdnk === 'number' ? Math.round((p.ke.kdnk - 4) * 1) / 10 : 0; };
  return api;
});
