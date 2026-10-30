/* ==========================================================================
   Nusa Politik — js/parti.js   (v8.32)
   Parti pemain dan penjenamaan. Lalai ialah UMNO (simpanan lama tanpa medan `parti` kekal UMNO).
   PBB (Parti Pesaka Bumiputera Bersatu) = parti regional Sarawak:
     Pusat/Negeri -> Bahagian (= DUN) -> Cawangan (= Daerah Mengundi); sayap Pemuda dan Wanita sahaja (tiada Puteri).
   Penjenamaan: logo, nama parti dan perkataan "UMNO" dalam paparan ditukar mengikut parti (kod/ke/dari + pemerhati DOM).
   ANDAIAN: sayap PBB mengikut kelayakan umur/jantina sedia ada; perempuan 18 hingga 35 tahun masuk sayap Wanita.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikParti = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (W) {
  'use strict';
  var KUNCI_PILIHAN = 'nusa_parti_pilihan';
  var SENARAI = {
    UMNO: { kod: 'UMNO', nama: 'UMNO', penuh: 'Pertubuhan Kebangsaan Melayu Bersatu', logo: 'assets/images/logo.png', sayap: ['pemuda', 'puteri', 'wanita'], negeriTetap: null, data: null, bahagianJenis: 'Parlimen' },
    PBB:  { kod: 'PBB', nama: 'PBB', penuh: 'Parti Pesaka Bumiputera Bersatu', logo: 'assets/images/logo-pbb.png', sayap: ['pemuda', 'wanita'], negeriTetap: 'Sarawak', data: 'data/pbb-sarawak.csv', bahagianJenis: 'DUN',
      /* v9.6: istilah badan parti. Bentuk BM -> PBB (ke) dan songsang (dari); songsang digunakan untuk carian kamus terjemahan. MKT -> Majlis Tertinggi (MT).
         v11.2: PAU -> Perhimpunan Agung PBB (PA) (v11.1 tersilap guna 'Konvensyen', iaitu istilah GPS); peringkat PBB ialah Ranting (lokaliti, = Cawangan UMNO), Cawangan (DUN, = Bahagian UMNO) dan Pusat; bulan mesyuarat mengikut kalendar PBB (js/calendar.js).
         Susunan penting: Cawangan -> Ranting dahulu, kemudian Bahagian -> Cawangan (tidak boleh diulang pada teks yang sudah ditukar; lihat pengawal dalam nod/attr). */
      istilah: [[/Majlis Kerja Tertinggi \(MKT\)/g, 'Majlis Tertinggi (MT)'], [/Majlis Kerja Tertinggi/g, 'Majlis Tertinggi'], [/\bMKT\b/g, 'MT'],
        [/Perhimpunan Agung PBB \(PAU\)/g, 'Perhimpunan Agung PBB'], [/Perhimpunan Agung \(PAU\)/g, 'Perhimpunan Agung PBB'], [/PBB General Assembly \(PAU\)/g, 'PBB General Assembly'], [/General Assembly \(PAU\)/g, 'PBB General Assembly'], [/\bPAU\b/g, 'PA'],
        [/\b([Bb])ulan 4[-–]5\b/g, '$1ulan 3'], [/\b([Mm])onths? 4[-–]5\b/g, '$1onth 3'], [/\b([Bb])ulan 6\b(?![-–\d])(?! \(Jun\))/g, '$1ulan 5'], [/\b([Mm])onths? 6\b(?![-–\d])(?! \(June\))/g, '$1onth 5'], [/\b([Bb])ulan 9\b(?![-–\d])(?! \(September\))/g, '$1ulan 8'], [/\b([Mm])onths? 9\b(?![-–\d])(?! \(September\))/g, '$1onth 8'], [/\b([Bb])ulan 10[-–]12\b/g, '$1ulan 9-12'], [/\b([Bb])ulan 10 hingga 12\b/g, '$1ulan 9 hingga 12'], [/\b([Mm])onths 10[-–]12\b/g, '$1onths 9-12'], [/\b([Mm])onths 10 to 12\b/g, '$1onths 9 to 12'],
        [/\b([Bb])ulan 1-3\b/g, '$1ulan 1-2'], [/pada bulan 4\./g, 'pada bulan 3.'], [/sehingga bulan 3\b/g, 'sehingga bulan 2'], [/through month 3\b/g, 'through month 2'], [/until month 3\b/g, 'until month 2'], [/\b([Mm])onths 1-3\b/g, '$1onths 1-2'], [/in month 4\./g, 'in month 3.'],
        [/Cawangan/g, 'Ranting'], [/cawangan/g, 'ranting'], [/CAWANGAN/g, 'RANTING'], [/\bBranch(es)?\b/g, 'Ranting'], [/\bbranch(es)?\b/g, 'ranting'],
        [/Bahagian/g, 'Cawangan'], [/(peringkat|Peringkat|ketua|Ketua) bahagian/g, '$1 cawangan'], [/\bDivisions?\b/g, 'Cawangan'], [/\bdivisions?\b/g, 'cawangan']],
      istilahSongsang: [[/Majlis Tertinggi \(MT\)/g, 'Majlis Kerja Tertinggi (MKT)'], [/Majlis Tertinggi/g, 'Majlis Kerja Tertinggi'], [/\bMT\b/g, 'MKT'],
        [/Perhimpunan Agung PBB(?! \()/g, 'Perhimpunan Agung PBB (PAU)'], [/\bPA\b/g, 'PAU'],
        [/\b([Bb])ulan 9-12\b/g, '$1ulan 10-12'], [/\b([Bb])ulan 9 hingga 12\b/g, '$1ulan 10 hingga 12'], [/\b([Bb])ulan 3\b(?![-–\d])/g, '$1ulan 4-5'], [/\b([Bb])ulan 5\b(?![-–\d])/g, '$1ulan 6'], [/\b([Bb])ulan 8\b(?![-–\d])/g, '$1ulan 9'], [/\b([Bb])ulan 1-2\b/g, '$1ulan 1-3'], [/sehingga bulan 2\b/g, 'sehingga bulan 3'],
        [/Cawangan/g, 'Bahagian'], [/(peringkat|Peringkat|ketua|Ketua) cawangan/g, '$1 bahagian'], [/Ranting/g, 'Cawangan'], [/ranting/g, 'cawangan'], [/RANTING/g, 'CAWANGAN']] }
  };
  /* v10.0: PRS = parti rakan GPS dalam MOD RINGAN (struktur Bahagian = DUN dan Cawangan = DM seperti PBB; tiada blok, Premier atau Majlis Tertinggi penuh).
     ANDAIAN: kawasan operasi PRS = DUN Dayak 60% ke atas (data/prs-sarawak.csv). Logo daripada pengguna. */
  SENARAI.PRS = { kod: 'PRS', nama: 'PRS', penuh: 'Parti Rakyat Sarawak', logo: 'assets/images/logo-prs.jpg', sayap: ['pemuda', 'wanita'], negeriTetap: 'Sarawak', data: 'data/prs-sarawak.csv', bahagianJenis: 'DUN', ringan: true };
  /* v10.1: SUPP = parti rakan GPS, mod ringan, ciri teras Sokongan Bandar. ANDAIAN: kawasan operasi = DUN Cina 25% ke atas (data/supp-sarawak.csv). Logo daripada pengguna. */
  SENARAI.SUPP = { kod: 'SUPP', nama: 'SUPP', penuh: 'Parti Rakyat Bersatu Sarawak', logo: 'assets/images/logo-supp.svg', sayap: ['pemuda', 'wanita'], negeriTetap: 'Sarawak', data: 'data/supp-sarawak.csv', bahagianJenis: 'DUN', ringan: true };
  /* v10.2: PDP = parti rakan GPS, mod ringan, ciri teras Imbangan Kaum Kawasan. ANDAIAN: kawasan operasi = DUN campuran (kumpulan terbesar kurang 55%) (data/pdp-sarawak.csv). */
  SENARAI.PDP = { kod: 'PDP', nama: 'PDP', penuh: 'Parti Demokratik Progresif', logo: 'assets/images/logo-pdp.jpg', sayap: ['pemuda', 'wanita'], negeriTetap: 'Sarawak', data: 'data/pdp-sarawak.csv', bahagianJenis: 'DUN', ringan: true };
  /* v10.3: PSB = parti PEMBANGKANG Sarawak (di luar GPS), mod ringan, ciri teras Naratif Pembangkang. ANDAIAN: kawasan operasi = DUN bukan Melayu/Melanau 60% ke atas (Cina + Dayak) (data/psb-sarawak.csv). Tiada kuota GPS, Premier atau Menteri. */
  SENARAI.PSB = { kod: 'PSB', nama: 'PSB', penuh: 'Parti Sarawak Bersatu', logo: 'assets/images/logo-psb.png', sayap: ['pemuda', 'wanita'], negeriTetap: 'Sarawak', data: 'data/psb-sarawak.csv', bahagianJenis: 'DUN', ringan: true, pembangkang: true };
  /* v13.1: MCA = parti komponen BN di Semenanjung, MOD PENUH (enjin UMNO: Cawangan, Bahagian = kawasan Parlimen, Pusat).
     Istilah daripada Perlembagaan MCA: Pengerusi (bukan Ketua) Cawangan/Bahagian, Jawatankuasa Pusat (JKP), Perhimpunan Agung MCA,
     Jawatankuasa Perhubungan Negeri, Perhimpunan Cawangan (April) dan Bahagian (Jun). Sayap Pemuda dan Wanita sahaja.
     ANDAIAN: kawasan operasi = 61 Parlimen Semenanjung dengan pengundi Cina 25% ke atas (data/mca-semenanjung.csv, tools/build-mca.js). Logo daripada pengguna. */
  SENARAI.MCA = { kod: 'MCA', nama: 'MCA', penuh: 'Persatuan Cina Malaysia', logo: 'assets/images/logo-mca.jpg', sayap: ['pemuda', 'wanita'], negeriTetap: null, data: 'data/mca-semenanjung.csv', bahagianJenis: 'Parlimen', mca: true,
    istilah: [[/Majlis Kerja Tertinggi \(MKT\)/g, 'Jawatankuasa Pusat (JKP)'], [/Majlis Kerja Tertinggi/g, 'Jawatankuasa Pusat'], [/\bMKT\b/g, 'JKP'],
      [/Perhimpunan Agung MCA \(PAU\)/g, 'Perhimpunan Agung MCA'], [/Perhimpunan Agung \(PAU\)/g, 'Perhimpunan Agung MCA'], [/MCA General Assembly \(PAU\)/g, 'MCA General Assembly'], [/General Assembly \(PAU\)/g, 'MCA General Assembly'], [/\bPAU\b/g, 'PA'],
      [/ di WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' di Wisma MCA, Kuala Lumpur'], [/ at WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' at Wisma MCA, Kuala Lumpur'], [/\b3 Naib Presiden\b/g, '4 Naib Presiden'], [/\b3 Vice Presidents\b/g, '4 Vice Presidents'],
      [/Persidangan Tahunan Sayap Cawangan/g, 'Perhimpunan Sayap Cawangan'], [/Persidangan Tahunan Cawangan/g, 'Perhimpunan Cawangan'], [/Mesyuarat Perwakilan Sayap Bahagian/g, 'Perhimpunan Sayap Bahagian'], [/Mesyuarat Perwakilan Bahagian/g, 'Perhimpunan Bahagian'],
      [/Branch Wing Annual Conference/g, 'Branch Wing Assembly'], [/Branch Annual Conference/g, 'Branch Assembly'], [/Division Wing Delegates' Meeting/g, 'Division Wing Assembly'], [/Division Delegates' Meeting/g, 'Division Assembly'],
      [/\bTimbalan Ketua (Cawangan|Bahagian)\b/g, 'Timbalan Pengerusi $1'], [/\bNaib Ketua (Cawangan|Bahagian)\b/g, 'Naib Pengerusi $1'], [/\bKetua (Cawangan|Bahagian)\b/g, 'Pengerusi $1'], [/\bketua (cawangan|bahagian)\b/g, 'pengerusi $1'], [/Ketua-Ketua (Cawangan|Bahagian)/g, 'Pengerusi-Pengerusi $1'],
      [/\b(Branch|Division) Chiefs?\b/g, function (m, a) { return a + ' Chairm' + (/s$/.test(m) ? 'en' : 'an'); }],
      [/Badan Perhubungan/g, 'Jawatankuasa Perhubungan'], [/State Liaison Body/g, 'State Liaison Committee'], [/Liaison Body/g, 'Liaison Committee'],
      [/\b([Bb])ulan 4[-–]5\b/g, '$1ulan 4'], [/\b([Mm])onths? 4[-–]5\b/g, '$1onth 4'], [/\b([Bb])ulan 9\b(?![-–\d])(?! \(September\))/g, '$1ulan 8'], [/\b([Mm])onths? 9\b(?![-–\d])(?! \(September\))/g, '$1onth 8'], [/\b([Bb])ulan 10[-–]12\b/g, '$1ulan 9-12'], [/\b([Bb])ulan 10 hingga 12\b/g, '$1ulan 9 hingga 12'], [/\b([Mm])onths 10[-–]12\b/g, '$1onths 9-12'], [/\b([Mm])onths 10 to 12\b/g, '$1onths 9 to 12']],
    istilahSongsang: [[/Jawatankuasa Pusat \(JKP\)/g, 'Majlis Kerja Tertinggi (MKT)'], [/Jawatankuasa Pusat/g, 'Majlis Kerja Tertinggi'], [/\bJKP\b/g, 'MKT'],
      [/Perhimpunan Agung MCA(?! \()/g, 'Perhimpunan Agung MCA (PAU)'], [/\bPA\b/g, 'PAU'],
      [/ di Wisma MCA, Kuala Lumpur/g, " di WTC Kuala Lumpur (Menara Dato' Onn)"], [/\b4 Naib Presiden\b/g, '3 Naib Presiden'],
      [/Perhimpunan Sayap Cawangan/g, 'Persidangan Tahunan Sayap Cawangan'], [/Perhimpunan Cawangan/g, 'Persidangan Tahunan Cawangan'], [/Perhimpunan Sayap Bahagian/g, 'Mesyuarat Perwakilan Sayap Bahagian'], [/Perhimpunan Bahagian/g, 'Mesyuarat Perwakilan Bahagian'],
      [/\bTimbalan Pengerusi (Cawangan|Bahagian)\b/g, 'Timbalan Ketua $1'], [/\bNaib Pengerusi (Cawangan|Bahagian)\b/g, 'Naib Ketua $1'], [/\bPengerusi (Cawangan|Bahagian)\b/g, 'Ketua $1'], [/\bpengerusi (cawangan|bahagian)\b/g, 'ketua $1'], [/Pengerusi-Pengerusi (Cawangan|Bahagian)/g, 'Ketua-Ketua $1'],
      [/Jawatankuasa Perhubungan/g, 'Badan Perhubungan'],
      [/\b([Bb])ulan 9-12\b/g, '$1ulan 10-12'], [/\b([Bb])ulan 9 hingga 12\b/g, '$1ulan 10 hingga 12'], [/\b([Bb])ulan 4\b(?![-–\d])/g, '$1ulan 4-5'], [/\b([Bb])ulan 8\b(?![-–\d])/g, '$1ulan 9']] };
  /* v13.3: MIC = parti komponen BN di Semenanjung, MOD PENUH (enjin UMNO). Istilah daripada Perlembagaan MIC (2017, berkuat kuasa 18-4-2018):
     Pengerusi Cawangan/Bahagian, Jawatankuasa Kerja Pusat (CWC), Perhimpunan Agung MIC, Kongres Negeri, Mesyuarat Agung Tahunan Cawangan (bulan 3)
     dan Persidangan Perwakilan Bahagian (bulan 5); Perhimpunan Agung bulan 9 (ANDAIAN). Sayap Pemuda, Wanita, Puteri dan Putera.
     ANDAIAN: kawasan operasi = semua 165 kawasan Parlimen Semenanjung (data/mic-semenanjung.csv, tools/build-mic.js). Logo daripada pengguna. */
  SENARAI.MIC = { kod: 'MIC', nama: 'MIC', penuh: 'Kongres India Se-Malaysia', logo: 'assets/images/logo-mic.png', sayap: ['pemuda', 'puteri', 'wanita', 'putera'], negeriTetap: null, data: 'data/mic-semenanjung.csv', bahagianJenis: 'Parlimen', mic: true,
    istilah: [[/Majlis Kerja Tertinggi \(MKT\)/g, 'Jawatankuasa Kerja Pusat (CWC)'], [/Majlis Kerja Tertinggi/g, 'Jawatankuasa Kerja Pusat'], [/\bMKT\b/g, 'CWC'],
      [/Perhimpunan Agung MIC \(PAU\)/g, 'Perhimpunan Agung MIC'], [/Perhimpunan Agung \(PAU\)/g, 'Perhimpunan Agung MIC'], [/MIC General Assembly \(PAU\)/g, 'MIC General Assembly'], [/General Assembly \(PAU\)/g, 'MIC General Assembly'], [/\bPAU\b/g, 'PA'],
      [/ di WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' di Menara Manickavasagam, Kuala Lumpur'], [/ at WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' at Menara Manickavasagam, Kuala Lumpur'],
      [/Persidangan Tahunan Sayap Cawangan/g, 'Mesyuarat Agung Sayap Cawangan'], [/Persidangan Tahunan Cawangan/g, 'Mesyuarat Agung Tahunan Cawangan'], [/Mesyuarat Perwakilan Sayap Bahagian/g, 'Persidangan Perwakilan Sayap Bahagian'], [/Mesyuarat Perwakilan Bahagian/g, 'Persidangan Perwakilan Bahagian'],
      [/Branch Wing Annual Conference/g, 'Branch Wing General Meeting'], [/Branch Annual Conference/g, 'Branch Annual General Meeting'], [/Division Wing Delegates' Meeting/g, 'Divisional Wing Delegates Conference'], [/Division Delegates' Meeting/g, 'Divisional Delegates Conference'],
      [/\bTimbalan Ketua (Cawangan|Bahagian)\b/g, 'Timbalan Pengerusi $1'], [/\bNaib Ketua (Cawangan|Bahagian)\b/g, 'Naib Pengerusi $1'], [/\bKetua (Cawangan|Bahagian)\b/g, 'Pengerusi $1'], [/\bketua (cawangan|bahagian)\b/g, 'pengerusi $1'], [/Ketua-Ketua (Cawangan|Bahagian)/g, 'Pengerusi-Pengerusi $1'],
      [/\b(Branch|Division) Chiefs?\b/g, function (m, a) { return a + ' Chairm' + (/s$/.test(m) ? 'en' : 'an'); }],
      [/Badan Perhubungan Negeri/g, 'Kongres Negeri'], [/Badan Perhubungan/g, 'Kongres Negeri'], [/State Liaison Body/g, 'State Congress'], [/Liaison Body/g, 'State Congress'],
      [/\b([Bb])ulan 4[-–]5\b/g, '$1ulan 3'], [/\b([Mm])onths? 4[-–]5\b/g, '$1onth 3'], [/\b([Bb])ulan 6\b(?![-–\d])(?! \(Jun\))/g, '$1ulan 5'], [/\b([Mm])onths? 6\b(?![-–\d])(?! \(June\))/g, '$1onth 5'], [/\b([Bb])ulan 1-3\b/g, '$1ulan 1-2'], [/pada bulan 4\./g, 'pada bulan 3.'], [/sehingga bulan 3\b/g, 'sehingga bulan 2'],
      [/\b([Mm])onths 1-3\b/g, '$1onths 1-2'], [/in month 4\./g, 'in month 3.'], [/through month 3\b/g, 'through month 2'], [/until month 3\b/g, 'until month 2']],
    istilahSongsang: [[/Jawatankuasa Kerja Pusat \(CWC\)/g, 'Majlis Kerja Tertinggi (MKT)'], [/Jawatankuasa Kerja Pusat/g, 'Majlis Kerja Tertinggi'], [/\bCWC\b/g, 'MKT'],
      [/Perhimpunan Agung MIC(?! \()/g, 'Perhimpunan Agung MIC (PAU)'], [/\bPA\b/g, 'PAU'],
      [/ di Menara Manickavasagam, Kuala Lumpur/g, " di WTC Kuala Lumpur (Menara Dato' Onn)"],
      [/Mesyuarat Agung Sayap Cawangan/g, 'Persidangan Tahunan Sayap Cawangan'], [/Mesyuarat Agung Tahunan Cawangan/g, 'Persidangan Tahunan Cawangan'], [/Persidangan Perwakilan Sayap Bahagian/g, 'Mesyuarat Perwakilan Sayap Bahagian'], [/Persidangan Perwakilan Bahagian/g, 'Mesyuarat Perwakilan Bahagian'],
      [/\bTimbalan Pengerusi (Cawangan|Bahagian)\b/g, 'Timbalan Ketua $1'], [/\bNaib Pengerusi (Cawangan|Bahagian)\b/g, 'Naib Ketua $1'], [/\bPengerusi (Cawangan|Bahagian)\b/g, 'Ketua $1'], [/\bpengerusi (cawangan|bahagian)\b/g, 'ketua $1'], [/Pengerusi-Pengerusi (Cawangan|Bahagian)/g, 'Ketua-Ketua $1'],
      [/Kongres Negeri/g, 'Badan Perhubungan Negeri'],
      [/\b([Bb])ulan 3\b(?![-–\d])/g, '$1ulan 4-5'], [/\b([Bb])ulan 5\b(?![-–\d])/g, '$1ulan 6'], [/\b([Bb])ulan 1-2\b/g, '$1ulan 1-3'], [/sehingga bulan 2\b/g, 'sehingga bulan 3']] };
  /* v13.8: PPP (myPPP) = parti komponen BN di Semenanjung, MOD RINGAN (enjin yang sama seperti MIC, tanpa perlembagaan khas; perlembagaan PPP tidak tersedia).
     Istilah: Majlis Tertinggi (MT), Perhimpunan Agung Tahunan PPP, Wisma PPP, Kuala Lumpur. Sayap Pemuda, Wanita, Putera dan Puteri.
     ANDAIAN: kawasan operasi = 39 kawasan Parlimen Semenanjung campuran (data/ppp-semenanjung.csv, tools/build-ppp.js); takwim bulan 3/5/9. Logo daripada pengguna. */
  SENARAI.PPP = { kod: 'PPP', nama: 'PPP', penuh: 'Parti Progresif Penduduk', logo: 'assets/images/logo-ppp.jpg', sayap: ['pemuda', 'puteri', 'wanita', 'putera'], negeriTetap: null, data: 'data/ppp-semenanjung.csv', bahagianJenis: 'Parlimen', ppp: true,
    istilah: [[/Majlis Kerja Tertinggi \(MKT\)/g, 'Majlis Tertinggi (MT)'], [/Majlis Kerja Tertinggi/g, 'Majlis Tertinggi'], [/\bMKT\b/g, 'MT'],
      [/Perhimpunan Agung PPP \(PAU\)/g, 'Perhimpunan Agung PPP'], [/Perhimpunan Agung UMNO \(PAU\)/g, 'Perhimpunan Agung PPP'], [/Perhimpunan Agung \(PAU\)/g, 'Perhimpunan Agung PPP'], [/PPP General Assembly \(PAU\)/g, 'PPP General Assembly'], [/General Assembly \(PAU\)/g, 'PPP General Assembly'], [/\bPAU\b/g, 'PA'],
      [/ di WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' di Wisma PPP, Kuala Lumpur'], [/ at WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' at Wisma PPP, Kuala Lumpur'],
      [/\b([Bb])ulan 4[-–]5\b/g, '$1ulan 3'], [/\b([Mm])onths? 4[-–]5\b/g, '$1onth 3'], [/\b([Bb])ulan 6\b(?![-–\d])(?! \(Jun\))/g, '$1ulan 5'], [/\b([Mm])onths? 6\b(?![-–\d])(?! \(June\))/g, '$1onth 5'], [/\b([Bb])ulan 1-3\b/g, '$1ulan 1-2'], [/pada bulan 4\./g, 'pada bulan 3.'], [/sehingga bulan 3\b/g, 'sehingga bulan 2'],
      [/\b([Mm])onths 1-3\b/g, '$1onths 1-2'], [/in month 4\./g, 'in month 3.'], [/through month 3\b/g, 'through month 2'], [/until month 3\b/g, 'until month 2']],
    istilahSongsang: [[/Majlis Tertinggi \(MT\)/g, 'Majlis Kerja Tertinggi (MKT)'], [/Majlis Tertinggi/g, 'Majlis Kerja Tertinggi'], [/\bMT\b/g, 'MKT'],
      [/Perhimpunan Agung PPP(?! \()/g, 'Perhimpunan Agung PPP (PAU)'], [/\bPA\b/g, 'PAU'],
      [/ di Wisma PPP, Kuala Lumpur/g, " di WTC Kuala Lumpur (Menara Dato' Onn)"],
      [/\b([Bb])ulan 3\b(?![-–\d])/g, '$1ulan 4-5'], [/\b([Bb])ulan 5\b(?![-–\d])/g, '$1ulan 6'], [/\b([Bb])ulan 1-2\b/g, '$1ulan 1-3'], [/sehingga bulan 2\b/g, 'sehingga bulan 3']] };
  /* v13.9: PBRS = parti komponen BN di Sabah, MOD RINGAN (enjin yang sama seperti MIC/PPP, tanpa perlembagaan khas; perlembagaan PBRS tidak tersedia).
     Istilah: Majlis Tertinggi (MT), Perhimpunan Agung PBRS, Kota Kinabalu. Sayap Pemuda dan Wanita. DUN dipilih dalam PRN Sabah (js/sabah.js).
     ANDAIAN: kawasan operasi = 7 kawasan Parlimen pedalaman Sabah (data/pbrs-sabah.csv, tools/build-pbrs.js); takwim bulan 3/5/9. Logo daripada pengguna. */
  SENARAI.PBRS = { kod: 'PBRS', nama: 'PBRS', penuh: 'Parti Bersatu Rakyat Sabah', logo: 'assets/images/logo-pbrs.jpg', sayap: ['pemuda', 'wanita'], negeriTetap: 'Sabah', data: 'data/pbrs-sabah.csv', bahagianJenis: 'Parlimen', pbrs: true,
    istilah: SENARAI.PPP.istilah.map(function (x) { var src = x[0].source.replace(/PPP/g, 'PBRS').replace("Wisma PBRS, Kuala Lumpur", 'Kota Kinabalu'); return [new RegExp(src, x[0].flags), typeof x[1] === 'string' ? x[1].replace(/PPP/g, 'PBRS').replace('Wisma PBRS, Kuala Lumpur', 'Kota Kinabalu') : x[1]]; }),
    istilahSongsang: SENARAI.PPP.istilahSongsang.map(function (x) { var src = x[0].source.replace(/PPP/g, 'PBRS').replace('Wisma PBRS, Kuala Lumpur', 'Kota Kinabalu'); return [new RegExp(src, x[0].flags), typeof x[1] === 'string' ? x[1].replace(/PPP/g, 'PBRS') : x[1]]; }) };
  var SENARAI_KOD = Object.keys(SENARAI);

  function sah(k) { return SENARAI_KOD.indexOf(k) >= 0; }
  /** Kod parti sesebuah profil (tiada medan = UMNO). */
  function kod(p) { return p && sah(p.parti) ? p.parti : 'UMNO'; }
  function info(k) { return SENARAI[sah(k) ? k : 'UMNO']; }
  function pilihan() { try { var v = W.sessionStorage.getItem(KUNCI_PILIHAN); return sah(v) ? v : null; } catch (e) { return null; } }
  function tetapPilihan(k) { try { W.sessionStorage.setItem(KUNCI_PILIHAN, sah(k) ? k : 'UMNO'); } catch (e) { /* mod peribadi */ } terapkan(); }
  /** Parti semasa: pemain sedia ada, jika tidak pilihan pada skrin mula, jika tidak UMNO. */
  function kini() {
    var S = W.MyPolitikSave, p = null;
    try { p = S && S.loadPlayer ? S.loadPlayer() : null; } catch (e) { p = null; }
    return p ? kod(p) : (pilihan() || 'UMNO');
  }

  /* ---------- Penukaran teks ---------- */
  var RE_UMNO = /\bUMNO\b/g, PENUH_UMNO = /Pertubuhan Kebangsaan Melayu Bersatu/g;
  function terap(s, senarai) { if (!senarai) { return s; } for (var j = 0; j < senarai.length; j++) { s = s.replace(senarai[j][0], senarai[j][1]); } return s; }
  function ke(s) {
    var k = kini(); if (k === 'UMNO' || s == null) { return s; }
    var TU = W.MyPolitikTranslations && W.MyPolitikTranslations.UMUM, sendiri = (k === 'MCA' || k === 'MIC') && /(Perkara|Article) \d/.test(s) && !/(Fasal|Clause) \d/.test(s);      // v13.3: rujukan Perkara Perlembagaan MCA/MIC sendiri dikekalkan
    if (TU && !sendiri) { s = TU.en(TU.bm(s)); }        // v10.6: tiada rujukan Perlembagaan/Fasal UMNO untuk parti lain
    var i = info(k), r = terap(String(s).replace(PENUH_UMNO, i.penuh).replace(RE_UMNO, i.nama), i.istilah);
    if (i.ringan) { r = r.split(SENARAI.PBB.penuh).join(i.penuh).replace(/\bPBB\b/g, i.nama); }          // v10.0: teks Sarawak yang menyebut PBB dijenamakan semula untuk parti mod ringan
    return r;
  }
  /** v11.1: calon songsangan alternatif (PAU / Perhimpunan Agung UMNO / (PAU) tidak boleh dibezakan; bulan mungkin asli). */
  function dariAlt(s) {
    var k = kini(); if ((k !== 'PBB' && k !== 'MCA' && k !== 'MIC' && k !== 'PPP' && k !== 'PBRS') || s == null) { return []; }
    var i = info(k), a = String(s), out = [], d = dari(a);
    var tanpaBulan = terap(a, i.istilahSongsang.filter(function (x) { return !/ulan/.test(x[0].source); })).split(i.penuh).join(SENARAI.UMNO.penuh).replace(new RegExp('\\b' + i.nama + '\\b', 'g'), 'UMNO');
    [d, tanpaBulan].forEach(function (x) {
      [x, x.replace('Perhimpunan Agung UMNO (PAU)', 'Perhimpunan Agung UMNO'), x.replace('Perhimpunan Agung UMNO (PAU)', 'PAU'), x.replace('Perhimpunan Agung UMNO (PAU)', 'Perhimpunan Agung (PAU)')].forEach(function (y) { if (out.indexOf(y) < 0) { out.push(y); } });
    });
    return out;
  }
  /** Songsang: teks yang sudah dijenamakan -> UMNO (untuk carian kamus terjemahan). */
  function dari(s) {
    var k = kini(); if (k === 'UMNO' || s == null) { return s; }
    var i = info(k); return terap(String(s), i.istilahSongsang).split(i.penuh).join(SENARAI.UMNO.penuh).replace(new RegExp('\\b' + i.nama + '\\b', 'g'), 'UMNO');
  }

  /* ---------- Penjenamaan DOM ---------- */
  var D = W.document, pemerhati = null, ATTR = ['title', 'aria-label', 'placeholder', 'alt', 'content'];
  var RE_PERLU = /Cawangan|cawangan|Bahagian|Branch|Division|bulan 4|Bulan 4|bulan 7|Bulan 7|[Mm]onths? (4|7)|General Assembly|UMNO|Liaison|Perhubungan|Naib Presiden|Vice Presidents|WTC|Fasal \d|Perkara \d|Perlembagaan|Clause|Article \d|\bPBB\b|Parti Pesaka|Pertubuhan Kebangsaan|\bMKT\b|\bPAU\b|Majlis Kerja Tertinggi|bulan 8|Bulan 8|[Mm]onth 8|[Bb]ulan (6|9|10)|[Mm]onths? (6|9|10)|bulan 1-3|Bulan 1-3|bulan 3|[Mm]onths 1-3|month 3/;
  function nod(n) {
    var v = n.nodeValue; if (!v || !RE_PERLU.test(v)) { return; }
    var p = n.parentElement; if (p && (/^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName) || (p.closest && p.closest('[data-jenama-skip]')))) { return; }
    if (n.__npKe === v) { return; }      // v11.1: elak tukar dua kali (Cawangan -> Ranting, Bahagian -> Cawangan)
    var b = ke(v); n.__npKe = b; if (b !== v) { n.__npAsal = v; n.nodeValue = b; }      // v13.1: simpan teks asal untuk dipulihkan apabila parti ditukar
  }
  function attr(el) {
    for (var j = 0; j < ATTR.length; j++) {
      var a = ATTR[j]; if (!el.hasAttribute || !el.hasAttribute(a)) { continue; }
      if (a === 'content' && el.tagName !== 'META') { continue; }
      var v = el.getAttribute(a); el.__npKa = el.__npKa || {}; if (v && el.__npKa[a] !== v && RE_PERLU.test(v)) { var kb = ke(v); el.__npKa[a] = kb; if (kb !== v) { el.__npKaAsal = el.__npKaAsal || {}; el.__npKaAsal[a] = v; } el.setAttribute(a, kb); }
    }
  }
  function imbas(akar) {
    if (!akar) { return; }
    if (akar.nodeType === 3) { nod(akar); return; }
    if (akar.nodeType !== 1) { return; }
    var w = D.createTreeWalker(akar, 4), n; while ((n = w.nextNode())) { nod(n); }
    attr(akar); var s = akar.querySelectorAll ? akar.querySelectorAll('[title],[aria-label],[placeholder],[alt],meta[name="description"]') : [];
    for (var i = 0; i < s.length; i++) { attr(s[i]); }
  }
  function gaya() {
    if (D.getElementById('gaya-parti')) { return; }
    var st = D.createElement('style'); st.id = 'gaya-parti';
    st.textContent = 'img.logo-parti{object-fit:contain;width:auto;max-width:72px;height:34px;border-radius:3px;background:#fff}img.kertas__logo.logo-parti{height:56px;max-width:84px}';
    D.head.appendChild(st);
  }
  function logo() {
    var i = info(kini()); if (i.kod === 'UMNO') { return; }
    var im = D.querySelectorAll('img.brand__img, img.kertas__logo, img[src$="assets/images/logo.png"]');
    for (var k = 0; k < im.length; k++) { if (im[k].hasAttribute('data-netral') || (im[k].closest && im[k].closest('[data-jenama-skip]'))) { continue; } if (im[k].getAttribute('src') !== i.logo) { im[k].onerror = null; im[k].setAttribute('src', i.logo); im[k].classList.add('logo-parti'); } }
    gaya();
  }
  var pernahTukar = false, partiAktif = 'UMNO';
  /** Pulihkan paparan UMNO (cth. pemain menukar semula pilihan parti di skrin pendaftaran). */
  function pulihUMNO() {
    var w = D.createTreeWalker(D.body, 4), n, v;
    while ((n = w.nextNode())) {
      if (n.__npAsal !== undefined) { if (n.nodeValue === n.__npKe) { n.nodeValue = n.__npAsal; } n.__npAsal = undefined; n.__npKe = undefined; continue; }   // v13.1: pulih tepat daripada teks asal
      v = n.nodeValue; if (!v || (!/\b(PBB|PRS|SUPP|PDP|PSB)\b/.test(v) && v.indexOf(SENARAI.PBB.penuh) < 0 && v.indexOf(SENARAI.PRS.penuh) < 0 && v.indexOf(SENARAI.SUPP.penuh) < 0 && v.indexOf(SENARAI.PDP.penuh) < 0 && v.indexOf(SENARAI.PSB.penuh) < 0 && !/\bMT\b|\bPA\b|\bRanting\b|Perhimpunan Agung PBB/.test(v))) { continue; }
      if (n.parentElement && (/^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentElement.tagName) || (n.parentElement.closest && n.parentElement.closest('[data-jenama-skip]')))) { continue; }
      n.nodeValue = terap(v, SENARAI.PBB.istilahSongsang).split(SENARAI.PBB.penuh).join(SENARAI.UMNO.penuh).split(SENARAI.PRS.penuh).join(SENARAI.UMNO.penuh).split(SENARAI.SUPP.penuh).join(SENARAI.UMNO.penuh).split(SENARAI.PDP.penuh).join(SENARAI.UMNO.penuh).split(SENARAI.PSB.penuh).join(SENARAI.UMNO.penuh).replace(/\b(PBB|PRS|SUPP|PDP|PSB)\b/g, 'UMNO');
    }
    var ea = D.querySelectorAll('[title],[aria-label],[placeholder],[alt],meta[name="description"]');
    for (var e = 0; e < ea.length; e++) { var x = ea[e]; if (x.__npKaAsal) { Object.keys(x.__npKaAsal).forEach(function (a) { if (x.getAttribute(a) === x.__npKa[a]) { x.setAttribute(a, x.__npKaAsal[a]); } }); x.__npKaAsal = null; x.__npKa = {}; } }
    var im = D.querySelectorAll('img.logo-parti'); for (var i = 0; i < im.length; i++) { im[i].setAttribute('src', SENARAI.UMNO.logo); im[i].classList.remove('logo-parti'); }
    if (D.title) { D.title = D.title.replace(/\b(PBB|PRS|SUPP|PDP|PSB|MCA|MIC)\b/g, 'UMNO'); }
    var md = D.querySelector('meta[name="description"]'); if (md) { md.setAttribute('content', (md.getAttribute('content') || '').replace(/\b(PBB|PRS|SUPP|PDP|PSB|MCA|MIC)\b/g, 'UMNO')); }
  }
  function terapkan() {
    if (!D || !D.body) { return; }
    var k = kini(); D.documentElement.setAttribute('data-parti', k);
    var pb = D.querySelectorAll('[data-perlembagaan]'); for (var q = 0; q < pb.length; q++) { pb[q].style.display = k === 'UMNO' || k === 'MCA' || k === 'MIC' ? '' : 'none'; }      // v13.1: MCA ada Perlembagaan MCA sendiri      // v10.6: Perlembagaan yang dipaparkan ialah Perlembagaan UMNO; disembunyi untuk parti lain
    if (k === 'UMNO') { if (pernahTukar) { if (pemerhati) { pemerhati.disconnect(); } try { pulihUMNO(); } finally { pernahTukar = false; partiAktif = 'UMNO'; sambung(); } } return; }
    if (pernahTukar && partiAktif !== k) { if (pemerhati) { pemerhati.disconnect(); } try { pulihUMNO(); } finally { sambung(); } }      // v13.1: tukar terus antara dua parti bukan UMNO: pulih dahulu, kemudian jenamakan semula
    pernahTukar = true; partiAktif = k;
    if (pemerhati) { pemerhati.disconnect(); }
    try { imbas(D.body); imbas(D.head); if (D.title) { D.title = ke(D.title); } logo(); } finally { sambung(); }
  }
  function sambung() { if (pemerhati && D.body) { pemerhati.observe(D.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR }); } }
  function mula() {
    if (!D) { return; }
    D.documentElement.setAttribute('data-parti', kini());
    if (typeof MutationObserver === 'function' && !pemerhati) {
      pemerhati = new MutationObserver(function (muts) {
        if (kini() === 'UMNO') { return; }
        pemerhati.disconnect();
        try {
          muts.forEach(function (m) {
            if (m.type === 'childList') { for (var i = 0; i < m.addedNodes.length; i++) { imbas(m.addedNodes[i]); } logo(); }
            else if (m.type === 'characterData') { nod(m.target); }
            else if (m.type === 'attributes') { attr(m.target); }
          });
        } finally { sambung(); }
      });
    }
    terapkan();
  }
  if (D) { if (D.readyState === 'loading') { D.addEventListener('DOMContentLoaded', mula); } else { mula(); } }

  return { SENARAI: SENARAI, SENARAI_KOD: SENARAI_KOD, sah: sah, kod: kod, sarawak: function (k) { return k === 'PBB' || k === 'PRS' || k === 'SUPP' || k === 'PDP' || k === 'PSB'; }, ringan: function (k) { return !!(SENARAI[k] && SENARAI[k].ringan); }, info: info, dariAlt: dariAlt, kini: kini, pilihan: pilihan, tetapPilihan: tetapPilihan, ke: ke, dari: dari, terapkan: terapkan };
});
