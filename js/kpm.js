/* ==========================================================================
   Nusa Politik — js/kpm.js   (v13.77)
   Modul Kementerian Pendidikan (takrif untuk enjin generik js/kementerian.js), mockup dipersetujui.
   p.kpm: kualiti pendidikan, kepuasan guru, kepuasan ibu bapa, dana pembangunan (RM 50 juta sebulan, had RM 250 juta).
   Tindakan: sekolah daif (3 bulan), rekrut guru, pembelajaran digital, kurangkan beban tugas guru.
   Dasar: pentaksiran (bilik darjah / peperiksaan awam), bahasa pengantar Sains & Matematik (BM / dwibahasa / Inggeris).
   Isu: sekolah daif tular, buli di asrama, kebocoran soalan. Akibat: guru < 30 = protes kesatuan (KPI −3); ibu bapa < 30 = populariti −2.
   ANDAIAN: semua nilai ialah anggaran permainan; dasar dipermudahkan untuk permainan dan tidak menyatakan pendirian.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var KM = root.MyPolitikKementerian || (typeof require === 'function' ? require('./kementerian.js') : null);
  var api = factory(KM);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikKPM = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (KM) {
  'use strict';
  return KM.cipta({
    kunci: 'kpm', tab: '📚 Pejabat KPM', pejabat: 'Pejabat KPM', portfolio: /^Menteri Pendidikan$/, ralat: 'Hanya Menteri Pendidikan.',
    meter: {
      kualiti: { nama: 'Kualiti pendidikan', awal: 58, min: 0, maks: 100, asas: 55, alir: 0.15, bahaya: function (v) { return v < 35; } },
      guru: { nama: 'Kepuasan guru', awal: 47, min: 0, maks: 100, asas: 48, alir: 0.2, bahaya: function (v) { return v < 30; } },
      ibubapa: { nama: 'Kepuasan ibu bapa', awal: 55, min: 0, maks: 100, asas: 52, alir: 0.2, bahaya: function (v) { return v < 30; } }
    },
    sasaran: function (k, m) { return k === 'kualiti' ? Math.round((m.guru - 50) * 0.2) : 0; },   // guru yang gembira mengajar lebih baik
    dana: { awal: 120, bulan: 50, had: 250 },
    tindakan: [
      { id: 'sekolah', ikon: '🏚️', nama: 'Baik pulih sekolah daif', kos: 40, siap: 3, kesan: { ibubapa: 6, kualiti: 2 } },
      { id: 'guru', ikon: '👩‍🏫', nama: 'Rekrut guru baharu', kos: 35, kesan: { guru: 6, kualiti: 3 } },
      { id: 'digital', ikon: '💻', nama: 'Pembelajaran digital', kos: 30, kesan: { kualiti: 4, ibubapa: 2 } },
      { id: 'beban', ikon: '📋', nama: 'Kurangkan beban tugas guru', kos: 10, kesan: { guru: 5 } }
    ],
    dasar: {
      pentaksiran: { nama: 'Pentaksiran', ikon: '📝', lalai: 'pbd', pilihan: [
        { id: 'pbd', label: 'Pentaksiran bilik darjah' },
        { id: 'awam', label: 'Peperiksaan awam', sas: { ibubapa: 6, guru: -4, kualiti: 1 } }] },
      bahasa: { nama: 'Bahasa pengantar Sains & Matematik', ikon: '🔤', lalai: 'dwi', pilihan: [
        { id: 'bm', label: 'Bahasa Melayu', sas: { guru: 2, kualiti: -1 } },
        { id: 'dwi', label: 'Dwibahasa' },
        { id: 'bi', label: 'Bahasa Inggeris', sas: { kualiti: 2, guru: -4 }, kejut: { akar: -2 } }] }
    },
    isuPeluang: 0.25,
    isu: {
      daif: { ikon: '🗞️', nama: 'Video sekolah daif tular di media sosial', abai: { ibubapa: -3 }, pilihan: [
        { id: 'kecemasan', ikon: '🔨', label: 'Peruntukan kecemasan', kos: 15, kesan: { ibubapa: 4 }, mesej: 'Peruntukan kecemasan diluluskan: sekolah dibaiki segera.' },
        { id: 'siasat', ikon: '🔍', label: 'Siasatan dan laporan', peluang: 0.6, kesan: {}, gagal: { pop: -2 }, mesej: 'Siasatan diarahkan; isu reda.', mesejGagal: 'Siasatan diarahkan, tetapi media terus mengkritik.' },
        { id: 'abai', ikon: '🙈', label: 'Abaikan', kesan: { ibubapa: -5, pop: -2 }, mesej: 'Isu diabaikan: ibu bapa kecewa.' }] },
      buli: { ikon: '😢', nama: 'Kes buli di asrama sekolah mencetuskan kemarahan', abai: { ibubapa: -3 }, pilihan: [
        { id: 'tegas', ikon: '⚖️', label: 'Tindakan tegas dan garis panduan baharu', kos: 10, kesan: { ibubapa: 5, guru: -2 }, mesej: 'Garis panduan anti-buli baharu diumumkan.' },
        { id: 'kaunselor', ikon: '🧑‍⚕️', label: 'Tambah kaunselor sekolah', kos: 20, kesan: { ibubapa: 3, kualiti: 1 }, mesej: 'Kaunselor tambahan ditempatkan di asrama.' },
        { id: 'abai', ikon: '🙈', label: 'Serahkan kepada sekolah', kesan: { ibubapa: -5, pop: -2 }, mesej: 'Ibu bapa kecewa dengan respons kementerian.' }] },
      bocor: { ikon: '📄', nama: 'Kebocoran soalan peperiksaan', abai: { ibubapa: -2, kualiti: -1 }, pilihan: [
        { id: 'ulang', ikon: '🔁', label: 'Peperiksaan semula', kos: 25, kesan: { kualiti: 2 }, gagal: {}, mesej: 'Peperiksaan semula diadakan.' },
        { id: 'polis', ikon: '👮', label: 'Laporan polis dan siasatan', peluang: 0.5, kesan: { ibubapa: 3 }, gagal: { ibubapa: -3, pop: -1 }, mesej: 'Dalang kebocoran ditangkap.', mesejGagal: 'Siasatan buntu: ibu bapa marah.' }] }
    },
    akibat: [
      { meter: 'guru', bawah: 30, kesan: { rating: -3 }, mesej: 'Kesatuan guru mengadakan protes (KPI −3).' },
      { meter: 'ibubapa', bawah: 30, kesan: { pop: -2 }, mesej: 'Ibu bapa tidak puas hati dengan sistem pendidikan (populariti −2).' }
    ]
  });
});
