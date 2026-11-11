/* ==========================================================================
   Nusa Politik — js/kpkt.js   (v13.80)
   Modul Kementerian Perumahan dan Kerajaan Tempatan (takrif untuk enjin generik js/kementerian.js), mockup dipersetujui.
   Nama rasmi sejak keputusan Kabinet 13 Disember 2023 (dahulu "Pembangunan Kerajaan Tempatan"; nama lama masih diterima
   untuk simpanan lama). PPR bandar diuruskan di sini (bukan KKDW).
   p.kpkt: kepuasan perumahan bandar (urbanHousingSatisfaction), perkhidmatan PBT, kesiapsiagaan bomba,
   dana (RM 60 juta sebulan, had RM 300 juta).
   Tindakan: bina PPR baharu (6 bulan), penyelenggaraan PPR, kebersihan & kutipan sampah PBT, balai bomba baharu (4 bulan).
   Dasar: sewa PPR (rendah / sewa-beli / bersasar), ahli majlis PBT (dilantik / pilihan raya kerajaan tempatan: suis dasar sahaja).
   Isu: lif PPR rosak, banjir kilat, kebakaran kawasan perindustrian, kontraktor PPR lari.
   Akibat: perumahan bandar < 30 = populariti −2; PBT < 30 = KPI −3; bomba < 35 = KPI −2.
   ANDAIAN: semua nilai ialah anggaran permainan; isu ialah label simulasi; dasar PBT dipermudahkan dan tidak menyatakan pendirian.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var KM = root.MyPolitikKementerian || (typeof require === 'function' ? require('./kementerian.js') : null);
  var api = factory(KM);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikKPKT = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (KM) {
  'use strict';
  return KM.cipta({
    kunci: 'kpkt', tab: '🏙️ Pejabat KPKT', pejabat: 'Pejabat KPKT', portfolio: /^Menteri (Perumahan dan Kerajaan Tempatan|Pembangunan Kerajaan Tempatan)$/, ralat: 'Hanya Menteri Perumahan dan Kerajaan Tempatan.',
    meter: {
      urbanHousingSatisfaction: { nama: 'Kepuasan perumahan bandar (PPR)', awal: 44, min: 0, maks: 100, asas: 45, alir: 0.2, bahaya: function (v) { return v < 30; } },
      pbt: { nama: 'Perkhidmatan PBT', awal: 51, min: 0, maks: 100, asas: 50, alir: 0.2, bahaya: function (v) { return v < 30; } },
      bomba: { nama: 'Kesiapsiagaan bomba', awal: 57, min: 0, maks: 100, asas: 55, alir: 0.15, bahaya: function (v) { return v < 35; } }
    },
    dana: { awal: 150, bulan: 60, had: 300 },
    tindakan: [
      { id: 'ppr', ikon: '🏢', nama: 'Bina PPR baharu', kos: 80, siap: 6, kesan: { urbanHousingSatisfaction: 12, pop: 2 } },
      { id: 'selenggara', ikon: '🔧', nama: 'Penyelenggaraan PPR', kos: 15, kesan: { urbanHousingSatisfaction: 4 } },
      { id: 'bersih', ikon: '🧹', nama: 'Kebersihan & kutipan sampah PBT', kos: 20, kesan: { pbt: 5 } },
      { id: 'balai', ikon: '🚒', nama: 'Balai bomba baharu', kos: 40, siap: 4, kesan: { bomba: 10 } }
    ],
    dasar: {
      sewa: { nama: 'Sewa PPR', ikon: '🏠', lalai: 'rendah', pilihan: [
        { id: 'rendah', label: 'Sewa rendah' },
        { id: 'sewabeli', label: 'Sewa-beli', dana: -10, sas: { urbanHousingSatisfaction: 6 } },
        { id: 'sasar', label: 'Sewa bersasar', dana: 10, sas: { urbanHousingSatisfaction: -6 }, kejut: { pop: -2 } }] },
      majlis: { nama: 'Ahli majlis PBT', ikon: '🗳️', lalai: 'lantik', pilihan: [
        { id: 'lantik', label: 'Dilantik' },
        { id: 'undi', label: 'Pilihan raya kerajaan tempatan', sas: { pbt: 4 }, kejut: { pop: 2, akar: -2 } }] }
    },
    isuPeluang: 0.25,
    isu: {
      lif: { ikon: '🛗', nama: 'Lif PPR rosak tiga bulan, warga emas terpaksa naik tangga', abai: { urbanHousingSatisfaction: -3 }, pilihan: [
        { id: 'baiki', ikon: '🔧', label: 'Baiki segera', kos: 12, kesan: { urbanHousingSatisfaction: 4 }, mesej: 'Lif PPR dibaiki segera.' },
        { id: 'hitam', ikon: '📝', label: 'Senarai hitam kontraktor', peluang: 0.7, kesan: { rating: 2 }, gagal: { rating: -2 }, mesej: 'Kontraktor penyelenggaraan disenarai hitam.', mesejGagal: 'Kontraktor disenarai hitam, tetapi menyaman kementerian.' },
        { id: 'serah', ikon: '🙈', label: 'Serah kepada pengurusan bangunan', kesan: { urbanHousingSatisfaction: -4, pop: -2 }, mesej: 'Penduduk PPR kecewa dengan respons kementerian.' }] },
      banjir: { ikon: '🌧️', nama: 'Banjir kilat melanda pusat bandar selepas hujan lebat', abai: { pbt: -3 }, pilihan: [
        { id: 'longkang', ikon: '🚧', label: 'Naik taraf sistem longkang', kos: 25, kesan: { pbt: 5 }, mesej: 'Projek naik taraf longkang dimulakan.' },
        { id: 'pam', ikon: '💧', label: 'Pam air sementara', kos: 8, kesan: { pbt: 2 }, mesej: 'Pam sementara dipasang di kawasan rendah.' }] },
      kebakaran: { ikon: '🔥', nama: 'Kebakaran besar di kawasan perindustrian', abai: { bomba: -2 }, pilihan: [
        { id: 'siasat', ikon: '🔍', label: 'Siasatan dan penguatkuasaan', kos: 10, kesan: { bomba: 4, rating: 1 }, mesej: 'Siasatan punca kebakaran dan penguatkuasaan premis dijalankan.' },
        { id: 'aset', ikon: '🚒', label: 'Tambah jentera bomba', kos: 30, kesan: { bomba: 7 }, mesej: 'Jentera bomba tambahan dibeli.' }] },
      lari: { ikon: '🏗️', nama: 'Kontraktor PPR melarikan diri, projek terbengkalai', abai: { urbanHousingSatisfaction: -3 }, pilihan: [
        { id: 'ambil', ikon: '🏗️', label: 'Lantik kontraktor penyelamat', kos: 30, kesan: { urbanHousingSatisfaction: 5 }, mesej: 'Kontraktor penyelamat dilantik untuk menyiapkan projek.' },
        { id: 'saman', ikon: '⚖️', label: 'Saman kontraktor asal', peluang: 0.5, kesan: { rating: 2 }, gagal: { urbanHousingSatisfaction: -3 }, mesej: 'Mahkamah memihak kepada kementerian.', mesejGagal: 'Kes berlarutan; pembeli rumah terus menunggu.' }] }
    },
    akibat: [
      { meter: 'urbanHousingSatisfaction', bawah: 30, kesan: { pop: -2 }, mesej: 'Penduduk bandar tidak puas hati dengan perumahan awam (populariti −2).' },
      { meter: 'pbt', bawah: 30, kesan: { rating: -3 }, mesej: 'Aduan terhadap PBT melimpah (KPI −3).' },
      { meter: 'bomba', bawah: 35, kesan: { rating: -2 }, mesej: 'Kesiapsiagaan bomba rendah dipersoalkan (KPI −2).' }
    ]
  });
});
