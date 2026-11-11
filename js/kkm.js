/* ==========================================================================
   Nusa Politik — js/kkm.js   (v13.78)
   Modul Kementerian Kesihatan (takrif untuk enjin generik js/kementerian.js), mockup dipersetujui.
   p.kkm: kapasiti hospital awam, kepuasan petugas kesihatan, indeks kesihatan awam, dana kesihatan (RM 60 juta sebulan, had RM 300 juta).
   Tindakan: lantik tetap doktor kontrak, tambah katil & klinik (4 bulan), naik taraf peralatan, kempen kesihatan awam.
   Dasar: caj hospital awam (kekal RM1 / caj bersasar / insurans kesihatan nasional), cukai minuman bergula (tiada / ada).
   Isu: wabak denggi, penyakit pernafasan (peluang kawalan ikut kapasiti), kesesakan zon kecemasan.
   Akibat: petugas < 30 = mogok doktor kontrak (KPI −4); kesihatan awam < 40 = populariti −2.
   ANDAIAN: semua nilai ialah anggaran permainan; isu dan wabak ialah label simulasi.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var KM = root.MyPolitikKementerian || (typeof require === 'function' ? require('./kementerian.js') : null);
  var api = factory(KM);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikKKM = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (KM) {
  'use strict';
  return KM.cipta({
    kunci: 'kkm', tab: '🏥 Pejabat KKM', pejabat: 'Pejabat KKM', portfolio: /^Menteri Kesihatan$/, ralat: 'Hanya Menteri Kesihatan.',
    meter: {
      kapasiti: { nama: 'Kapasiti hospital awam', awal: 52, min: 0, maks: 100, asas: 48, alir: 0.15, bahaya: function (v) { return v < 30; } },
      petugas: { nama: 'Kepuasan petugas kesihatan', awal: 38, min: 0, maks: 100, asas: 40, alir: 0.2, bahaya: function (v) { return v < 30; } },
      kesihatan: { nama: 'Indeks kesihatan awam', awal: 61, min: 0, maks: 100, asas: 58, alir: 0.15, bahaya: function (v) { return v < 40; } }
    },
    sasaran: function (k, m) { return k === 'kesihatan' ? Math.round((m.kapasiti - 50) * 0.15) : 0; },   // hospital yang lapang = rawatan lebih baik
    dana: { awal: 140, bulan: 60, had: 300 },
    tindakan: [
      { id: 'doktor', ikon: '👨‍⚕️', nama: 'Lantik tetap doktor kontrak', kos: 40, kesan: { petugas: 8 } },
      { id: 'katil', ikon: '🏥', nama: 'Tambah katil & klinik', kos: 50, siap: 4, kesan: { kapasiti: 10 } },
      { id: 'peralatan', ikon: '🔬', nama: 'Naik taraf peralatan', kos: 30, kesan: { kapasiti: 4 } },
      { id: 'kempen', ikon: '📣', nama: 'Kempen kesihatan awam', kos: 15, kesan: { kesihatan: 4 } }
    ],
    dasar: {
      caj: { nama: 'Caj hospital awam', ikon: '💳', lalai: 'rm1', pilihan: [
        { id: 'rm1', label: 'Kekal RM1' },
        { id: 'sasar', label: 'Caj bersasar', dana: 15, kejut: { pop: -3 } },
        { id: 'insurans', label: 'Insurans kesihatan nasional', dana: 25, sas: { kapasiti: 8 }, kejut: { pop: -5 } }] },
      gula: { nama: 'Cukai minuman bergula', ikon: '🥤', lalai: 'tiada', pilihan: [
        { id: 'tiada', label: 'Tiada' },
        { id: 'ada', label: 'Ada', dana: 5, sas: { kesihatan: 5 }, kejut: { pop: -2 } }] }
    },
    isuPeluang: 0.25,
    isu: {
      denggi: { ikon: '🦟', nama: 'Kes denggi meningkat mendadak di beberapa negeri', abai: { kesihatan: -4 }, pilihan: [
        { id: 'operasi', ikon: '🧪', label: 'Operasi kawalan wabak', kos: 30, peluang: 'kapasiti', kekalJikaGagal: true, kesan: { ip: 15, kesihatan: 2 }, gagal: {}, mesej: 'Operasi kawalan berjaya: wabak denggi terkawal.', mesejGagal: 'Operasi kawalan belum berjaya: wabak masih merebak.' },
        { id: 'nasihat', ikon: '📢', label: 'Nasihat awam sahaja', peluang: 0.3, kekalJikaGagal: true, kesan: {}, gagal: { pop: -1 }, mesej: 'Wabak reda dengan sendirinya.', mesejGagal: 'Nasihat awam tidak cukup: wabak masih merebak.' }] },
      pernafasan: { ikon: '😷', nama: 'Penularan penyakit pernafasan di sekolah dan pejabat', abai: { kesihatan: -3, kapasiti: -2 }, pilihan: [
        { id: 'operasi', ikon: '💉', label: 'Kempen vaksinasi segera', kos: 35, peluang: 'kapasiti', kekalJikaGagal: true, kesan: { ip: 15, kesihatan: 3 }, gagal: {}, mesej: 'Kempen vaksinasi berjaya mengawal penularan.', mesejGagal: 'Kempen vaksinasi belum mencapai sasaran.' },
        { id: 'nasihat', ikon: '📢', label: 'Nasihat pakai pelitup', peluang: 0.35, kekalJikaGagal: true, kesan: {}, gagal: { pop: -1 }, mesej: 'Penularan reda.', mesejGagal: 'Penularan berterusan.' }] },
      sesak: { ikon: '🚑', nama: 'Video kesesakan zon kecemasan hospital tular', abai: { petugas: -2 }, pilihan: [
        { id: 'tambah', ikon: '🛏️', label: 'Buka wad sementara', kos: 20, kesan: { kapasiti: 3, petugas: 2 }, mesej: 'Wad sementara dibuka untuk mengurangkan kesesakan.' },
        { id: 'syif', ikon: '⏱️', label: 'Tambah syif petugas', kesan: { kapasiti: 2, petugas: -4 }, mesej: 'Syif tambahan diarahkan; petugas keletihan.' }] }
    },
    akibat: [
      { meter: 'petugas', bawah: 30, kesan: { rating: -4 }, mesej: 'Doktor kontrak mengadakan mogok (KPI −4).' },
      { meter: 'kesihatan', bawah: 40, kesan: { pop: -2 }, mesej: 'Rakyat bimbang tentang tahap kesihatan awam (populariti −2).' }
    ]
  });
});
