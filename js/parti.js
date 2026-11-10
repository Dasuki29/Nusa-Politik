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
    istilah: [[/\bNaib Ketua (Pemuda|Wanita|Putera|Puteri) Cawangan\b/g, 'Timbalan Ketua $1 Cawangan'], [/Majlis Kerja Tertinggi \(MKT\)/g, 'Jawatankuasa Kerja Pusat (CWC)'], [/Majlis Kerja Tertinggi/g, 'Jawatankuasa Kerja Pusat'], [/\bMKT\b/g, 'CWC'],
      [/Perhimpunan Agung MIC \(PAU\)/g, 'Perhimpunan Agung MIC'], [/Perhimpunan Agung \(PAU\)/g, 'Perhimpunan Agung MIC'], [/MIC General Assembly \(PAU\)/g, 'MIC General Assembly'], [/General Assembly \(PAU\)/g, 'MIC General Assembly'], [/\bPAU\b/g, 'PA'],
      [/ di WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' di Menara Manickavasagam, Kuala Lumpur'], [/ at WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' at Menara Manickavasagam, Kuala Lumpur'],
      [/Persidangan Tahunan Sayap Cawangan/g, 'Mesyuarat Agung Sayap Cawangan'], [/Persidangan Tahunan Cawangan/g, 'Mesyuarat Agung Tahunan Cawangan'], [/Mesyuarat Perwakilan Sayap Bahagian/g, 'Persidangan Perwakilan Sayap Bahagian'], [/Mesyuarat Perwakilan Bahagian/g, 'Persidangan Perwakilan Bahagian'],
      [/Branch Wing Annual Conference/g, 'Branch Wing General Meeting'], [/Branch Annual Conference/g, 'Branch Annual General Meeting'], [/Division Wing Delegates' Meeting/g, 'Divisional Wing Delegates Conference'], [/Division Delegates' Meeting/g, 'Divisional Delegates Conference'],
      [/\bTimbalan Ketua (Cawangan|Bahagian)\b/g, 'Timbalan Pengerusi $1'], [/\bNaib Ketua (Cawangan|Bahagian)\b/g, 'Naib Pengerusi $1'], [/\bKetua (Cawangan|Bahagian)\b/g, 'Pengerusi $1'], [/\bketua (cawangan|bahagian)\b/g, 'pengerusi $1'], [/Ketua-Ketua (Cawangan|Bahagian)/g, 'Pengerusi-Pengerusi $1'],
      [/\b(Branch|Division) Chiefs?\b/g, function (m, a) { return a + ' Chairm' + (/s$/.test(m) ? 'en' : 'an'); }],
      [/Badan Perhubungan Negeri/g, 'Kongres Negeri'], [/Badan Perhubungan/g, 'Kongres Negeri'], [/State Liaison Body/g, 'State Congress'], [/Liaison Body/g, 'State Congress'],
      [/\b([Bb])ulan 4[-–]5\b/g, '$1ulan 3'], [/\b([Mm])onths? 4[-–]5\b/g, '$1onth 3'], [/\b([Bb])ulan 6\b(?![-–\d])(?! \(Jun\))/g, '$1ulan 5'], [/\b([Mm])onths? 6\b(?![-–\d])(?! \(June\))/g, '$1onth 5'], [/\b([Bb])ulan 1-3\b/g, '$1ulan 1-2'], [/pada bulan 4\./g, 'pada bulan 3.'], [/sehingga bulan 3\b/g, 'sehingga bulan 2'],
      [/\b([Mm])onths 1-3\b/g, '$1onths 1-2'], [/in month 4\./g, 'in month 3.'], [/through month 3\b/g, 'through month 2'], [/until month 3\b/g, 'until month 2']],
    istilahSongsang: [[/\bTimbalan Ketua (Pemuda|Wanita|Putera|Puteri) Cawangan\b/g, 'Naib Ketua $1 Cawangan'], [/Jawatankuasa Kerja Pusat \(CWC\)/g, 'Majlis Kerja Tertinggi (MKT)'], [/Jawatankuasa Kerja Pusat/g, 'Majlis Kerja Tertinggi'], [/\bCWC\b/g, 'MKT'],
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
      [/\bTimbalan Ketua (Cawangan|Bahagian)\b/g, 'Timbalan Pengerusi $1'], [/\bNaib Ketua (Cawangan|Bahagian)\b/g, 'Naib Pengerusi $1'], [/\bKetua (Cawangan|Bahagian)\b/g, 'Pengerusi $1'], [/\bketua (cawangan|bahagian)\b/g, 'pengerusi $1'], [/Ketua-Ketua (Cawangan|Bahagian)/g, 'Pengerusi-Pengerusi $1'],
      [/Deputy Branch Chief/g, 'Deputy Branch Chairman'], [/Branch Chief/g, 'Branch Chairman'], [/Deputy Division Chief/g, 'Deputy Division Chairman'], [/Vice Division Chief/g, 'Vice Division Chairman'], [/Division Chief/g, 'Division Chairman'],   // v13.57: PPP Pengerusi (andaian)
      [/Perhimpunan Agung PPP \(PAU\)/g, 'Perhimpunan Agung PPP'], [/Perhimpunan Agung UMNO \(PAU\)/g, 'Perhimpunan Agung PPP'], [/Perhimpunan Agung \(PAU\)/g, 'Perhimpunan Agung PPP'], [/PPP General Assembly \(PAU\)/g, 'PPP General Assembly'], [/General Assembly \(PAU\)/g, 'PPP General Assembly'], [/\bPAU\b/g, 'PA'],
      [/ di WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' di Wisma PPP, Kuala Lumpur'], [/ at WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' at Wisma PPP, Kuala Lumpur'],
      [/\b([Bb])ulan 4[-–]5\b/g, '$1ulan 3'], [/\b([Mm])onths? 4[-–]5\b/g, '$1onth 3'], [/\b([Bb])ulan 6\b(?![-–\d])(?! \(Jun\))/g, '$1ulan 5'], [/\b([Mm])onths? 6\b(?![-–\d])(?! \(June\))/g, '$1onth 5'], [/\b([Bb])ulan 1-3\b/g, '$1ulan 1-2'], [/pada bulan 4\./g, 'pada bulan 3.'], [/sehingga bulan 3\b/g, 'sehingga bulan 2'],
      [/\b([Mm])onths 1-3\b/g, '$1onths 1-2'], [/in month 4\./g, 'in month 3.'], [/through month 3\b/g, 'through month 2'], [/until month 3\b/g, 'until month 2']],
    istilahSongsang: [[/Majlis Tertinggi \(MT\)/g, 'Majlis Kerja Tertinggi (MKT)'], [/Majlis Tertinggi/g, 'Majlis Kerja Tertinggi'], [/\bMT\b/g, 'MKT'],
      [/\bTimbalan Pengerusi (Cawangan|Bahagian)\b/g, 'Timbalan Ketua $1'], [/\bNaib Pengerusi (Cawangan|Bahagian)\b/g, 'Naib Ketua $1'], [/\bPengerusi (Cawangan|Bahagian)\b/g, 'Ketua $1'], [/\bpengerusi (cawangan|bahagian)\b/g, 'ketua $1'], [/Pengerusi-Pengerusi (Cawangan|Bahagian)/g, 'Ketua-Ketua $1'], [/\b(Deputy |Vice |)Branch Chairman/g, '$1Branch Chief'], [/\b(Deputy |Vice |)Division Chairman/g, '$1Division Chief'],
      [/Perhimpunan Agung PPP(?! \()/g, 'Perhimpunan Agung PPP (PAU)'], [/\bPA\b/g, 'PAU'],
      [/ di Wisma PPP, Kuala Lumpur/g, " di WTC Kuala Lumpur (Menara Dato' Onn)"],
      [/\b([Bb])ulan 3\b(?![-–\d])/g, '$1ulan 4-5'], [/\b([Bb])ulan 5\b(?![-–\d])/g, '$1ulan 6'], [/\b([Bb])ulan 1-2\b/g, '$1ulan 1-3'], [/sehingga bulan 2\b/g, 'sehingga bulan 3']] };
  /* v13.9: PBRS = parti komponen BN di Sabah, MOD RINGAN (enjin yang sama seperti MIC/PPP, tanpa perlembagaan khas; perlembagaan PBRS tidak tersedia).
     Istilah: Majlis Tertinggi (MT), Perhimpunan Agung PBRS, Kota Kinabalu. Sayap Pemuda dan Wanita. DUN dipilih dalam PRN Sabah (js/sabah.js).
     ANDAIAN: kawasan operasi = 7 kawasan Parlimen pedalaman Sabah (data/pbrs-sabah.csv, tools/build-pbrs.js); takwim bulan 3/5/9. Logo daripada pengguna. */
  SENARAI.PBRS = { kod: 'PBRS', nama: 'PBRS', penuh: 'Parti Bersatu Rakyat Sabah', logo: 'assets/images/logo-pbrs.jpg', sayap: ['pemuda', 'wanita'], negeriTetap: 'Sabah', data: 'data/pbrs-sabah.csv', bahagianJenis: 'Parlimen', pbrs: true,
    istilah: SENARAI.PPP.istilah.map(function (x) { var src = x[0].source.replace(/PPP/g, 'PBRS').replace("Wisma PBRS, Kuala Lumpur", 'Kota Kinabalu'); return [new RegExp(src, x[0].flags), typeof x[1] === 'string' ? x[1].replace(/PPP/g, 'PBRS').replace('Wisma PBRS, Kuala Lumpur', 'Kota Kinabalu') : x[1]]; }),
    istilahSongsang: SENARAI.PPP.istilahSongsang.map(function (x) { var src = x[0].source.replace(/PPP/g, 'PBRS').replace('Wisma PBRS, Kuala Lumpur', 'Kota Kinabalu'); return [new RegExp(src, x[0].flags), typeof x[1] === 'string' ? x[1].replace(/PPP/g, 'PBRS') : x[1]]; }) };
  /* v13.31: PAS = parti komponen Perikatan Nasional (PN) di Semenanjung, MOD PENUH (enjin UMNO seperti MCA; js/pas.js). Istilah ikut
     Perlembagaan PAS (Pindaan 2025): Kawasan dan Yang Dipertua Kawasan (Fasal 41), Perhubungan PAS Negeri dan Pesuruhjaya (Fasal 53),
     Jawatankuasa Kerja PAS Pusat (Fasal 38), Muktamar Tahunan (Fasal 18), Dewan Muslimat (Fasal 58). Sayap Pemuda dan Muslimat (tiada Puteri).
     ANDAIAN: kawasan operasi = 165 kawasan Parlimen Semenanjung (data/pas-semenanjung.csv, tools/build-pas.js); takwim bulan 3/5/9. Logo daripada pengguna. */
  var BULAN_PPP = SENARAI.PPP.istilah.filter(function (x) { return /ulan|onth/.test(x[0].source); }), BULAN_PPP_S = SENARAI.PPP.istilahSongsang.filter(function (x) { return /ulan|onth/.test(x[0].source); });
  SENARAI.PAS = { kod: 'PAS', nama: 'PAS', penuh: 'Parti Islam Se-Malaysia', logo: 'assets/images/logo-pas.svg', sayap: ['pemuda', 'wanita'], negeriTetap: null, data: 'data/pas-semenanjung.csv', bahagianJenis: 'Parlimen', pas: true, gabungan: 'PN',
    istilah: [[/Majlis Kerja Tertinggi \(MKT\)/g, 'Jawatankuasa Kerja PAS Pusat (JK Pusat)'], [/Majlis Kerja Tertinggi/g, 'Jawatankuasa Kerja PAS Pusat'], [/\bMKT\b/g, 'JK Pusat'],
      [/Perhimpunan Agung PAS \(PAU\)/g, 'Muktamar Tahunan PAS'], [/Perhimpunan Agung UMNO \(PAU\)/g, 'Muktamar Tahunan PAS'], [/Perhimpunan Agung \(PAU\)/g, 'Muktamar Tahunan PAS'], [/Perhimpunan Agung PAS/g, 'Muktamar Tahunan PAS'],
      [/PAS General Assembly \(PAU\)/g, 'PAS Annual Muktamar'], [/General Assembly \(PAU\)/g, 'PAS Annual Muktamar'], [/\bPAU\b/g, 'Muktamar'],
      [/ di WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' di negeri tuan rumah Muktamar'], [/ at WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' in the Muktamar host state'],
      [/\bTimbalan Ketua Cawangan\b/g, 'Naib Ketua Cawangan'],   // v13.57: Fasal 44(1)(b)
      [/\bTimbalan Ketua Bahagian\b/g, 'Timbalan Yang Dipertua Kawasan'], [/\bNaib Ketua Bahagian\b/g, 'Naib Yang Dipertua Kawasan'], [/\bKetua Bahagian\b/g, 'Yang Dipertua Kawasan'], [/\bketua bahagian\b/g, 'yang dipertua kawasan'],
      [/Bahagian/g, 'Kawasan'], [/(peringkat|Peringkat) bahagian/g, '$1 kawasan'], [/\bDivisions\b/g, 'Areas'], [/\bDivision\b/g, 'Area'], [/\bdivisions\b/g, 'areas'], [/\bdivision\b/g, 'area'],
      [/Pengerusi Badan Perhubungan Negeri/g, 'Pesuruhjaya PAS Negeri'], [/Pengerusi Badan Perhubungan/g, 'Pesuruhjaya PAS'], [/Badan Perhubungan Negeri/g, 'Perhubungan PAS Negeri'], [/Badan Perhubungan/g, 'Perhubungan PAS'],
      [/State Liaison Body Chairman/g, 'State PAS Commissioner'], [/Liaison Body Chairman/g, 'PAS Commissioner'], [/State Liaison Body/g, 'State PAS Liaison'], [/Liaison Body/g, 'PAS Liaison'],
      [/\bWanita\b/g, 'Muslimat'], [/\bWomen\b/g, 'Muslimat']].concat(BULAN_PPP),
    istilahSongsang: [[/Jawatankuasa Kerja PAS Pusat \(JK Pusat\)/g, 'Majlis Kerja Tertinggi (MKT)'], [/Jawatankuasa Kerja PAS Pusat/g, 'Majlis Kerja Tertinggi'], [/\bJK Pusat\b/g, 'MKT'],
      [/Muktamar Tahunan PAS/g, 'Perhimpunan Agung PAS (PAU)'], [/PAS Annual Muktamar/g, 'PAS General Assembly (PAU)'], [/\bMuktamar\b/g, 'PAU'],
      [/ di negeri tuan rumah PAU/g, " di WTC Kuala Lumpur (Menara Dato' Onn)"], [/ in the PAU host state/g, " at WTC Kuala Lumpur (Menara Dato' Onn)"],
      [/\bNaib Ketua Cawangan\b/g, 'Timbalan Ketua Cawangan'],
      [/Timbalan Yang Dipertua Kawasan/g, 'Timbalan Ketua Bahagian'], [/Naib Yang Dipertua Kawasan/g, 'Naib Ketua Bahagian'], [/Yang Dipertua Kawasan/g, 'Ketua Bahagian'], [/yang dipertua kawasan/g, 'ketua bahagian'],
      [/(peringkat|Peringkat) kawasan/g, '$1 bahagian'], [/(?<!Peruntukan |Zon |Kaum |Lobi |Butiran |di )Kawasan(?! (campuran|operasi|anda|Pemain))/g, 'Bahagian'], [/\bAreas\b/g, 'Divisions'], [/\bArea\b/g, 'Division'],
      [/Pesuruhjaya PAS Negeri/g, 'Pengerusi Badan Perhubungan Negeri'], [/Pesuruhjaya PAS/g, 'Pengerusi Badan Perhubungan'], [/Perhubungan PAS Negeri/g, 'Badan Perhubungan Negeri'], [/Perhubungan PAS/g, 'Badan Perhubungan'],
      [/State PAS Commissioner/g, 'State Liaison Body Chairman'], [/PAS Commissioner/g, 'Liaison Body Chairman'], [/State PAS Liaison/g, 'State Liaison Body'], [/PAS Liaison/g, 'Liaison Body'],
      [/\bMuslimat\b/g, 'Wanita']].concat(BULAN_PPP_S) };
  /* v13.34: PKR (KEADILAN) = parti komponen Pakatan Harapan (PH), MOD PENUH (enjin UMNO seperti PAS; js/pkr.js). Istilah ikut Perlembagaan PKR
     (pindaan hingga 11 Mac 2025): Ranting (Fasal 39.1(g)) dan Cabang (Fasal 32), Majlis Pimpinan Negeri (Fasal 27), Majlis Pimpinan Pusat (Fasal 21),
     Kongres Nasional (Fasal 17, 18), Angkatan Muda (AMK, Fasal 25) dan Wanita (Fasal 26). Tiada Puteri. Dalam BI: Ranting = branch, Cabang = division.
     ANDAIAN: kawasan operasi = semua 222 kawasan Parlimen (data/pkr-malaysia.csv, tools/build-pkr.js); takwim Ranting 3, Cabang 4, Kongres 5. Logo daripada pengguna. */
  /* v13.36: rujukan disiplin Perlembagaan UMNO -> Perlembagaan PKR (Fasal 41 Lembaga Disiplin, 42 Rayuan, 43.2 sogokan, 44.1 mahkamah). */
  var FASAL_PKR = [[/Fasal 20\.13/g, 'Perlembagaan PKR, Fasal 43.2'], [/Fasal 20\.12/g, 'Perlembagaan PKR, Fasal 42.1'], [/Fasal 20\.10[a-d]?/g, 'Perlembagaan PKR, Fasal 41.7'], [/Fasal 20\.7\b/g, 'Perlembagaan PKR, Fasal 44.1'], [/Fasal 20\.5\b/g, 'Perlembagaan PKR, Fasal 41.2'],
    [/Clause 20\.13/g, 'PKR Constitution, Clause 43.2'], [/Clause 20\.12/g, 'PKR Constitution, Clause 42.1'], [/Clause 20\.10[a-d]?(\([a-d]\))?/g, 'PKR Constitution, Clause 41.7'], [/Clause 20\.7\b/g, 'PKR Constitution, Clause 44.1'], [/Clause 20\.5\b/g, 'PKR Constitution, Clause 41.2']];
  var BULAN_PKR = [[/\b([Bb])ulan 4[-–]5\b/g, '$1ulan 3'], [/\b([Mm])onths? 4[-–]5\b/g, '$1onth 3'], [/pada bulan 4\./g, 'pada bulan 3.'], [/in month 4\./g, 'in month 3.'],
    [/sehingga bulan 3\b/g, 'sehingga bulan 2'], [/through month 3\b/g, 'through month 2'], [/until month 3\b/g, 'until month 2'], [/\b([Bb])ulan 1-3\b/g, '$1ulan 1-2'], [/\b([Mm])onths 1-3\b/g, '$1onths 1-2'],
    [/\b([Bb])ulan 6\b(?![-–\d])(?! \(Jun\))/g, '$1ulan 4'], [/\b([Mm])onths? 6\b(?![-–\d])(?! \(June\))/g, '$1onth 4'], [/\b([Bb])ulan 9\b(?![-–\d])(?! \(September\))/g, '$1ulan 5'], [/\b([Mm])onths? 9\b(?![-–\d])(?! \(September\))/g, '$1onth 5'],
    [/\b([Bb])ulan 10[-–]12\b/g, '$1ulan 6-12'], [/\b([Bb])ulan 10 hingga 12\b/g, '$1ulan 6 hingga 12'], [/\b([Mm])onths 10[-–]12\b/g, '$1onths 6-12'], [/\b([Mm])onths 10 to 12\b/g, '$1onths 6 to 12']];
  var BULAN_PKR_S = [[/\b([Bb])ulan 6-12\b/g, '$1ulan 10-12'], [/\b([Bb])ulan 6 hingga 12\b/g, '$1ulan 10 hingga 12'], [/\b([Bb])ulan 4\b(?![-–\d])/g, '$1ulan 6'], [/\b([Bb])ulan 5\b(?![-–\d])/g, '$1ulan 9'],
    [/\b([Bb])ulan 3\b(?![-–\d])/g, '$1ulan 4-5'], [/\b([Bb])ulan 1-2\b/g, '$1ulan 1-3'], [/sehingga bulan 2\b/g, 'sehingga bulan 3']];
  SENARAI.PKR = { kod: 'PKR', nama: 'PKR', penuh: 'Parti Keadilan Rakyat', logo: 'assets/images/logo-pkr.png', sayap: ['pemuda', 'wanita'], negeriTetap: null, data: 'data/pkr-malaysia.csv', bahagianJenis: 'Parlimen', pkr: true, gabungan: 'PH',
    istilah: [[/Majlis Kerja Tertinggi \(MKT\)/g, 'Majlis Pimpinan Pusat (MPP)'], [/Majlis Kerja Tertinggi/g, 'Majlis Pimpinan Pusat'], [/\bMKT\b/g, 'MPP'], [/Supreme Council \(MKT\)/g, 'Central Leadership Council (MPP)'],
      [/Perhimpunan Agung PKR \(PAU\)/g, 'Kongres Nasional KEADILAN'], [/Perhimpunan Agung UMNO \(PAU\)/g, 'Kongres Nasional KEADILAN'], [/Perhimpunan Agung \(PAU\)/g, 'Kongres Nasional KEADILAN'], [/Perhimpunan Agung PKR/g, 'Kongres Nasional KEADILAN'],
      [/PKR General Assembly \(PAU\)/g, 'KEADILAN National Congress'], [/General Assembly \(PAU\)/g, 'KEADILAN National Congress'], [/PKR General Assembly/g, 'KEADILAN National Congress'], [/\bPAU\b/g, 'Kongres'],
      [/ di WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' di lokasi Kongres Nasional'], [/ at WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' at the National Congress venue'], [/\b3 Naib Presiden\b/g, '4 Naib Presiden'], [/\b3 Vice Presidents\b/g, '4 Vice Presidents'],
      [/Cawangan/g, 'Ranting'], [/cawangan/g, 'ranting'], [/CAWANGAN/g, 'RANTING'],
      [/Bahagian/g, 'Cabang'], [/(peringkat|Peringkat|ketua|Ketua) bahagian/g, '$1 cabang'],
      [/Pengerusi Badan Perhubungan Negeri/g, 'Pengerusi Majlis Pimpinan Negeri'], [/Badan Perhubungan Negeri/g, 'Majlis Pimpinan Negeri'], [/Pengerusi Badan Perhubungan/g, 'Pengerusi MPN'], [/Badan Perhubungan/g, 'MPN'],
      [/State Liaison Body Chairman/g, 'State Leadership Council Chairman'], [/Liaison Body Chairman/g, 'MPN Chairman'], [/State Liaison Body/g, 'State Leadership Council'], [/Liaison Body/g, 'MPN'],
      [/\bPemuda\b/g, 'Angkatan Muda']].concat(BULAN_PKR),
    istilahSongsang: [[/Majlis Pimpinan Pusat \(MPP\)/g, 'Majlis Kerja Tertinggi (MKT)'], [/Majlis Pimpinan Pusat/g, 'Majlis Kerja Tertinggi'], [/\bMPP\b/g, 'MKT'], [/Central Leadership Council/g, 'Supreme Council'],
      [/Kongres Nasional KEADILAN/g, 'Perhimpunan Agung PKR (PAU)'], [/KEADILAN National Congress/g, 'PKR General Assembly (PAU)'], [/\bKongres\b/g, 'PAU'],
      [/ di lokasi PAU Nasional/g, " di WTC Kuala Lumpur (Menara Dato' Onn)"], [/ at the National Congress venue/g, " at WTC Kuala Lumpur (Menara Dato' Onn)"], [/\b4 Naib Presiden\b/g, '3 Naib Presiden'],
      [/Cabang/g, 'Bahagian'], [/(peringkat|Peringkat|ketua|Ketua) cabang/g, '$1 bahagian'], [/Ranting/g, 'Cawangan'], [/ranting/g, 'cawangan'], [/RANTING/g, 'CAWANGAN'],
      [/Pengerusi Majlis Pimpinan Negeri/g, 'Pengerusi Badan Perhubungan Negeri'], [/Majlis Pimpinan Negeri/g, 'Badan Perhubungan Negeri'], [/Pengerusi MPN/g, 'Pengerusi Badan Perhubungan'], [/\bMPN\b/g, 'Badan Perhubungan'],
      [/State Leadership Council Chairman/g, 'State Liaison Body Chairman'], [/State Leadership Council/g, 'State Liaison Body'],
      [/\bAngkatan Muda\b/g, 'Pemuda'], [/Perlembagaan PKR, Fasal 43\.2/g, 'Fasal 20.13'], [/Perlembagaan PKR, Fasal 42\.1/g, 'Fasal 20.12'], [/Perlembagaan PKR, Fasal 41\.7/g, 'Fasal 20.10'], [/Perlembagaan PKR, Fasal 44\.1/g, 'Fasal 20.7'], [/Perlembagaan PKR, Fasal 41\.2/g, 'Fasal 20.5']].concat(BULAN_PKR_S) };
  /* v13.37: DAP = parti komponen Pakatan Harapan (PH), MOD PENUH (enjin UMNO seperti PAS / PKR; js/dap.js). Istilah ikut Perlembagaan DAP
     (seperti pada 22.10.2019): Cawangan (Pengerusi Cawangan, Fasal XXI), Jawatankuasa Perhubungan Kawasan Parlimen (JPKP, Fasal XIX: Penyelaras =
     Ahli Parlimen; tanpa kerusi Parlimen jawatan tertinggi pemain ialah Setiausaha JPKP), Jawatankuasa Negeri (Fasal XIV), Jawatankuasa Tertinggi
     Pusat (JTP, Fasal X) dengan Setiausaha Agung (kuasa eksekutif), Pengerusi Kebangsaan dan Naib Pengerusi Kebangsaan, Kongres Kebangsaan
     (Fasal VIII), DAPSY dan Wanita DAP. ANDAIAN takwim: Cawangan 1, JPKP 2, Kongres 3. */
  /* v13.38: rujukan disiplin Perlembagaan UMNO -> Perlembagaan DAP (Fasal VII Tatatertib: VII.1 Jawatankuasa Tatatertib, VII.2 tindakan
     tatatertib (denda, gantung, pecat), VII.3 rayuan kepada JTP dalam 14 hari; Fasal IV.13(c): tiada tindakan mahkamah). */
  var FASAL_DAP = [[/Fasal 20\.13/g, 'Perlembagaan DAP, Fasal VII.2'], [/Fasal 20\.12(\.\d)?/g, 'Perlembagaan DAP, Fasal VII.3'], [/Fasal 20\.10[a-d]?/g, 'Perlembagaan DAP, Fasal VII.2'], [/Fasal 20\.7\b/g, 'Perlembagaan DAP, Fasal IV.13(c)'], [/Fasal 20\.5\b/g, 'Perlembagaan DAP, Fasal VII.1'],
    [/Clause 20\.13/g, 'DAP Constitution, Clause VII.2'], [/Clause 20\.12(\.\d)?/g, 'DAP Constitution, Clause VII.3'], [/Clause 20\.10[a-d]?(\([a-d]\))?/g, 'DAP Constitution, Clause VII.2'], [/Clause 20\.7\b/g, 'DAP Constitution, Clause IV.13(c)'], [/Clause 20\.5\b/g, 'DAP Constitution, Clause VII.1']];
  var BULAN_DAP = [[/\b([Bb])ulan 4[-–]5\b/g, '$1ulan 1'], [/\b([Mm])onths? 4[-–]5\b/g, '$1onth 1'], [/pada bulan 4\./g, 'pada bulan 1.'], [/in month 4\./g, 'in month 1.'],
    [/\b([Bb])ulan 6\b(?![-–\d])(?! \(Jun\))/g, '$1ulan 2'], [/\b([Mm])onths? 6\b(?![-–\d])(?! \(June\))/g, '$1onth 2'], [/\b([Bb])ulan 9\b(?![-–\d])(?! \(September\))/g, '$1ulan 3'], [/\b([Mm])onths? 9\b(?![-–\d])(?! \(September\))/g, '$1onth 3'],
    [/\b([Bb])ulan 10[-–]12\b/g, '$1ulan 4-12'], [/\b([Bb])ulan 10 hingga 12\b/g, '$1ulan 4 hingga 12'], [/\b([Mm])onths 10[-–]12\b/g, '$1onths 4-12'], [/\b([Mm])onths 10 to 12\b/g, '$1onths 4 to 12']];
  var BULAN_DAP_S = [[/\b([Bb])ulan 4-12\b/g, '$1ulan 10-12'], [/\b([Bb])ulan 4 hingga 12\b/g, '$1ulan 10 hingga 12'], [/\b([Bb])ulan 3\b(?![-–\d])/g, '$1ulan 9'], [/\b([Bb])ulan 2\b(?![-–\d])/g, '$1ulan 6'], [/\b([Bb])ulan 1\b(?![-–\d])/g, '$1ulan 4-5']];
  SENARAI.DAP = { kod: 'DAP', nama: 'DAP', penuh: 'Parti Tindakan Demokratik', logo: 'assets/images/logo-dap.svg', sayap: ['pemuda', 'wanita'], negeriTetap: null, data: 'data/dap-malaysia.csv', bahagianJenis: 'Parlimen', dap: true, gabungan: 'PH',
    istilah: [[/Majlis Kerja Tertinggi \(MKT\)/g, 'Jawatankuasa Tertinggi Pusat (JTP)'], [/Majlis Kerja Tertinggi/g, 'Jawatankuasa Tertinggi Pusat'], [/\bMKT\b/g, 'JTP'], [/Supreme Council \(MKT\)/g, 'Central Executive Committee (JTP)'], [/Supreme Council/g, 'Central Executive Committee'],
      [/Perhimpunan Agung DAP \(PAU\)/g, 'Kongres Kebangsaan DAP'], [/Perhimpunan Agung UMNO \(PAU\)/g, 'Kongres Kebangsaan DAP'], [/Perhimpunan Agung \(PAU\)/g, 'Kongres Kebangsaan DAP'], [/Perhimpunan Agung DAP/g, 'Kongres Kebangsaan DAP'],
      [/DAP General Assembly \(PAU\)/g, 'DAP National Congress'], [/General Assembly \(PAU\)/g, 'DAP National Congress'], [/DAP General Assembly/g, 'DAP National Congress'], [/\bPAU\b/g, 'Kongres'],
      [/ di WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' di lokasi Kongres Kebangsaan'], [/ at WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' at the National Congress venue'],
      [/\b3 Naib Presiden\b/g, '5 Naib Pengerusi Kebangsaan'], [/\b3 Vice Presidents\b/g, '5 National Vice Chairmen'],
      [/Timbalan Presiden/g, 'Pengerusi Kebangsaan'], [/Naib Presiden/g, 'Naib Pengerusi Kebangsaan'], [/\bPresiden\b/g, 'Setiausaha Agung'],
      [/Deputy President/g, 'National Chairman'], [/Vice Presidents/g, 'National Vice Chairmen'], [/Vice President/g, 'National Vice Chairman'], [/\bPresident\b/g, 'Secretary-General'],
      [/Timbalan Ketua Cawangan/g, 'Naib Pengerusi Cawangan'], [/Ketua Cawangan/g, 'Pengerusi Cawangan'], [/Deputy Branch Chief/g, 'Branch Vice Chairman'], [/Branch Chief/g, 'Branch Chairman'],
      [/Timbalan Ketua Bahagian/g, 'Bendahari JPKP'], [/Naib Ketua Bahagian/g, 'Setiausaha Organisasi JPKP'], [/Ketua Bahagian/g, 'Setiausaha JPKP'], [/AJK Bahagian/g, 'Ahli JPKP'], [/Mesyuarat Perwakilan Bahagian/g, 'MB JPKP'],
      [/Deputy Division Chief/g, 'JPKP Treasurer'], [/Division Vice Chief/g, 'JPKP Organising Secretary'], [/Vice Division Chief/g, 'JPKP Organising Secretary'], [/Division Chief/g, 'JPKP Secretary'],
      [/Bahagian/g, 'JPKP'], [/(peringkat|Peringkat) bahagian/g, '$1 JPKP'],
      [/Pengerusi Badan Perhubungan Negeri/g, 'Pengerusi Negeri'], [/Badan Perhubungan Negeri/g, 'Jawatankuasa Negeri'], [/Pengerusi Badan Perhubungan/g, 'Pengerusi Negeri'], [/Badan Perhubungan/g, 'Jawatankuasa Negeri'],
      [/State Liaison Body Chairman/g, 'State Chairman'], [/Liaison Body Chairman/g, 'State Chairman'], [/State Liaison Body/g, 'State Committee'], [/Liaison Body/g, 'State Committee'],
      [/\bPemuda\b/g, 'DAPSY']].concat(BULAN_DAP),
    istilahSongsang: [[/Jawatankuasa Tertinggi Pusat \(JTP\)/g, 'Majlis Kerja Tertinggi (MKT)'], [/Jawatankuasa Tertinggi Pusat/g, 'Majlis Kerja Tertinggi'], [/\bJTP\b/g, 'MKT'], [/Central Executive Committee/g, 'Supreme Council'],
      [/Kongres Kebangsaan DAP/g, 'Perhimpunan Agung DAP (PAU)'], [/DAP National Congress/g, 'DAP General Assembly (PAU)'], [/\bKongres\b/g, 'PAU'],
      [/ di lokasi PAU Kebangsaan/g, " di WTC Kuala Lumpur (Menara Dato' Onn)"], [/ at the National Congress venue/g, " at WTC Kuala Lumpur (Menara Dato' Onn)"],
      [/\b5 Naib Pengerusi Kebangsaan\b/g, '3 Naib Presiden'], [/Naib Pengerusi Kebangsaan/g, 'Naib Presiden'], [/Pengerusi Kebangsaan/g, 'Timbalan Presiden'], [/Setiausaha Agung/g, 'Presiden'],
      [/Naib Pengerusi Cawangan/g, 'Timbalan Ketua Cawangan'], [/Pengerusi Cawangan/g, 'Ketua Cawangan'],
      [/Penyelaras JPKP/g, 'Ketua Bahagian'], [/Bendahari JPKP/g, 'Timbalan Ketua Bahagian'], [/Setiausaha Organisasi JPKP/g, 'Naib Ketua Bahagian'], [/Setiausaha JPKP/g, 'Ketua Bahagian'], [/Ahli JPKP/g, 'AJK Bahagian'], [/MB JPKP/g, 'Mesyuarat Perwakilan Bahagian'],
      [/(peringkat|Peringkat) JPKP/g, '$1 bahagian'], [/JPKP/g, 'Bahagian'],
      [/Pengerusi Negeri/g, 'Pengerusi Badan Perhubungan Negeri'], [/Jawatankuasa Negeri/g, 'Badan Perhubungan Negeri'],
      [/\bDAPSY\b/g, 'Pemuda'], [/Perlembagaan DAP, Fasal VII\.3/g, 'Fasal 20.12'], [/Perlembagaan DAP, Fasal VII\.2/g, 'Fasal 20.10'], [/Perlembagaan DAP, Fasal VII\.1/g, 'Fasal 20.5'], [/Perlembagaan DAP, Fasal IV\.13\(c\)/g, 'Fasal 20.7']].concat(BULAN_DAP_S) };
  /* v13.56: Amanah (Parti Amanah Negara), komponen PH, MOD PENUH (js/amanah.js). Perlembagaan Parti Amanah Negara 2022: Kawasan (Fasal 16.3),
     Jawatankuasa Pimpinan Nasional (JPN, Fasal 16.1, 17.1), Konvensyen Nasional (Fasal 11, 12), Jawatankuasa Pimpinan Negeri (Fasal 16.2),
     sayap AWAN, Pemuda Amanah dan WARDA (Fasal 21). Disiplin: Lembaga Tatatertib (Fasal 22). ANDAIAN takwim: Cawangan 6, Kawasan 8, Konvensyen Nasional 11. */
  var FASAL_AMANAH = [[/Fasal 20\.13/g, 'Perlembagaan Amanah, Fasal 22.8'], [/Fasal 20\.12(\.\d)?/g, 'Perlembagaan Amanah, Fasal 22.11'], [/Fasal 20\.10[a-d]?/g, 'Perlembagaan Amanah, Fasal 22.8'], [/Fasal 20\.7\b/g, 'Perlembagaan Amanah, Fasal 22.12'], [/Fasal 20\.5\b/g, 'Perlembagaan Amanah, Fasal 22.5'],
    [/Clause 20\.13/g, 'Amanah Constitution, Clause 22.8'], [/Clause 20\.12(\.\d)?/g, 'Amanah Constitution, Clause 22.11'], [/Clause 20\.10[a-d]?(\([a-d]\))?/g, 'Amanah Constitution, Clause 22.8'], [/Clause 20\.7\b/g, 'Amanah Constitution, Clause 22.12'], [/Clause 20\.5\b/g, 'Amanah Constitution, Clause 22.5']];
  var BULAN_AMANAH = [[/\b([Bb])ulan 9\b(?![-–\d])(?! \(September\))/g, '$1ulan 11'], [/\b([Mm])onths? 9\b(?![-–\d])(?! \(September\))/g, '$1onth 11'],
    [/\b([Bb])ulan 6\b(?![-–\d])(?! \(Jun\))/g, '$1ulan 8'], [/\b([Mm])onths? 6\b(?![-–\d])(?! \(June\))/g, '$1onth 8'],
    [/\b([Bb])ulan 4[-–]5\b/g, '$1ulan 6'], [/\b([Mm])onths? 4[-–]5\b/g, '$1onth 6'], [/pada bulan 4\./g, 'pada bulan 6.'], [/in month 4\./g, 'in month 6.'],
    [/\b([Bb])ulan 10[-–]12\b/g, '$1ulan 12'], [/\b([Bb])ulan 10 hingga 12\b/g, '$1ulan 12'], [/\b([Mm])onths 10[-–]12\b/g, '$1onth 12'], [/\b([Mm])onths 10 to 12\b/g, '$1onth 12']];
  var BULAN_AMANAH_S = [[/\b([Bb])ulan 6\b(?![-–\d])(?! \(Jun\))/g, '$1ulan 4-5'], [/\b([Bb])ulan 8\b(?![-–\d])(?! \(Ogos\))/g, '$1ulan 6'], [/\b([Bb])ulan 11\b(?![-–\d])(?! \(November\))/g, '$1ulan 9'], [/\b([Bb])ulan 12\b(?![-–\d])(?! \(Disember\))/g, '$1ulan 10-12']];
  SENARAI.AMANAH = { kod: 'AMANAH', nama: 'AMANAH', penuh: 'Parti Amanah Negara', logo: 'assets/images/logo-amanah.png', sayap: ['pemuda', 'puteri', 'wanita'], negeriTetap: null, data: 'data/amanah-malaysia.csv', bahagianJenis: 'Parlimen', amanah: true, gabungan: 'PH',
    istilah: [[/Majlis Kerja Tertinggi \(MKT\)/g, 'Jawatankuasa Pimpinan Nasional (JPN)'], [/Majlis Kerja Tertinggi/g, 'Jawatankuasa Pimpinan Nasional'], [/\bMKT\b/g, 'JPN'], [/Supreme Council \(MKT\)/g, 'National Leadership Committee (JPN)'], [/Supreme Council/g, 'National Leadership Committee'],
      [/Perhimpunan Agung AMANAH \(PAU\)/g, 'Konvensyen Nasional Amanah'], [/Perhimpunan Agung UMNO \(PAU\)/g, 'Konvensyen Nasional Amanah'], [/Perhimpunan Agung \(PAU\)/g, 'Konvensyen Nasional Amanah'], [/Perhimpunan Agung AMANAH/g, 'Konvensyen Nasional Amanah'],
      [/AMANAH General Assembly \(PAU\)/g, 'Amanah National Convention'], [/General Assembly \(PAU\)/g, 'Amanah National Convention'], [/AMANAH General Assembly/g, 'Amanah National Convention'], [/Pre-PAU/g, 'Pre-Convention'], [/\bPAU\b/g, 'Konvensyen'],
      [/ di WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' di lokasi Konvensyen Nasional'], [/ at WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' at the National Convention venue'],
      [/\bTimbalan Ketua Bahagian\b/g, 'Timbalan Ketua Kawasan'], [/\bNaib Ketua Bahagian\b/g, 'Naib Ketua Kawasan'], [/\bKetua Bahagian\b/g, 'Ketua Kawasan'], [/\bketua bahagian\b/g, 'ketua kawasan'], [/Mesyuarat Perwakilan Bahagian/g, 'Mesyuarat Tahunan Kawasan'],
      [/Bahagian/g, 'Kawasan'], [/(peringkat|Peringkat) bahagian/g, '$1 kawasan'], [/\bDivisions\b/g, 'Areas'], [/\bDivision\b/g, 'Area'], [/\bdivisions\b/g, 'areas'], [/\bdivision\b/g, 'area'],
      [/Pengerusi Badan Perhubungan Negeri/g, 'Pengerusi Negeri'], [/Badan Perhubungan Negeri/g, 'Jawatankuasa Pimpinan Negeri'], [/Pengerusi Badan Perhubungan/g, 'Pengerusi Negeri'], [/Badan Perhubungan/g, 'Jawatankuasa Pimpinan Negeri'],
      [/State Liaison Body Chairman/g, 'State Chairman'], [/Liaison Body Chairman/g, 'State Chairman'], [/State Liaison Body/g, 'State Leadership Committee'], [/Liaison Body/g, 'State Leadership Committee'],
      [/\bPuteri\b/g, 'WARDA'], [/\bWanita\b/g, 'AWAN']].concat(BULAN_AMANAH),
    istilahSongsang: [[/Jawatankuasa Pimpinan Nasional \(JPN\)/g, 'Majlis Kerja Tertinggi (MKT)'], [/Jawatankuasa Pimpinan Nasional/g, 'Majlis Kerja Tertinggi'], [/\bJPN\b/g, 'MKT'], [/National Leadership Committee/g, 'Supreme Council'],
      [/Konvensyen Nasional Amanah/g, 'Perhimpunan Agung AMANAH (PAU)'], [/Amanah National Convention/g, 'AMANAH General Assembly (PAU)'], [/Pre-Convention/g, 'Pre-PAU'], [/\bKonvensyen\b(?! (Nasional|Negeri))/g, 'PAU'],
      [/ di lokasi Konvensyen Nasional/g, " di WTC Kuala Lumpur (Menara Dato' Onn)"], [/ at the National Convention venue/g, " at WTC Kuala Lumpur (Menara Dato' Onn)"],
      [/Timbalan Ketua Kawasan/g, 'Timbalan Ketua Bahagian'], [/Naib Ketua Kawasan/g, 'Naib Ketua Bahagian'], [/Ketua Kawasan/g, 'Ketua Bahagian'], [/ketua kawasan/g, 'ketua bahagian'], [/Mesyuarat Tahunan Kawasan/g, 'Mesyuarat Perwakilan Bahagian'],
      [/(peringkat|Peringkat) kawasan/g, '$1 bahagian'], [/(?<!Peruntukan |Zon |Kaum |Lobi |Butiran |di )Kawasan(?! (campuran|operasi|anda|Pemain|Melayu))/g, 'Bahagian'], [/\bAreas\b/g, 'Divisions'], [/\bArea\b/g, 'Division'],
      [/Pengerusi Negeri/g, 'Pengerusi Badan Perhubungan Negeri'], [/Jawatankuasa Pimpinan Negeri/g, 'Badan Perhubungan Negeri'],
      [/\bWARDA\b/g, 'Puteri'], [/\bAWAN\b/g, 'Wanita'],
      [/Perlembagaan Amanah, Fasal 22\.11/g, 'Fasal 20.12'], [/Perlembagaan Amanah, Fasal 22\.8/g, 'Fasal 20.10'], [/Perlembagaan Amanah, Fasal 22\.5/g, 'Fasal 20.5'], [/Perlembagaan Amanah, Fasal 22\.12/g, 'Fasal 20.7']].concat(BULAN_AMANAH_S) };
  /* v13.53: BERJASA (Barisan Jemaah Islamiah Se-Malaysia) = parti tanpa gabungan (kumpulan "Lain-lain"), MOD RINGAN (enjin yang sama seperti PPP; js/berjasa.js).
     Tiada perlembagaan BERJASA: struktur diandaikan seperti PAS (parti asal BERJASA). Istilah: Kawasan dan Ketua Kawasan, Jawatankuasa Pusat (AJK Pusat),
     Muktamar BERJASA, sayap Wanita BERJASA dan ANGKASA (Angkatan Pemuda-Pemudi, had umur 40). ANDAIAN: kawasan operasi = kawasan Parlimen Semenanjung
     dengan Bumiputera 50% ke atas (data/berjasa-semenanjung.csv, tools/build-berjasa.js); takwim Cawangan 3, Kawasan 5, Muktamar 6. Logo daripada pengguna. */
  var BULAN_BERJASA = BULAN_PPP.concat([[/\b([Bb])ulan 9\b(?![-–\d])(?! \(September\))/g, '$1ulan 6'], [/\b([Mm])onths? 9\b(?![-–\d])(?! \(September\))/g, '$1onth 6'],
    [/\b([Bb])ulan 10[-–]12\b/g, '$1ulan 7-12'], [/\b([Bb])ulan 10 hingga 12\b/g, '$1ulan 7 hingga 12'], [/\b([Mm])onths 10[-–]12\b/g, '$1onths 7-12'], [/\b([Mm])onths 10 to 12\b/g, '$1onths 7 to 12']]);
  var BULAN_BERJASA_S = [[/\b([Bb])ulan 7-12\b/g, '$1ulan 10-12'], [/\b([Bb])ulan 7 hingga 12\b/g, '$1ulan 10 hingga 12'], [/\b([Bb])ulan 6\b(?![-–\d])(?! \(Jun\))/g, '$1ulan 9']].concat(BULAN_PPP_S);
  SENARAI.BERJASA = { kod: 'BERJASA', nama: 'BERJASA', penuh: 'Barisan Jemaah Islamiah Se-Malaysia', logo: 'assets/images/logo-berjasa.png', sayap: ['pemuda', 'wanita'], negeriTetap: null, data: 'data/berjasa-semenanjung.csv', bahagianJenis: 'Parlimen', berjasa: true, gabungan: null,
    istilah: [[/Majlis Kerja Tertinggi \(MKT\)/g, 'Jawatankuasa Pusat (AJK Pusat)'], [/Majlis Kerja Tertinggi/g, 'Jawatankuasa Pusat'], [/\bMKT\b/g, 'AJK Pusat'], [/Supreme Council \(MKT\)/g, 'Central Committee (AJK Pusat)'], [/Supreme Council/g, 'Central Committee'],
      [/Perhimpunan Agung BERJASA \(PAU\)/g, 'Muktamar BERJASA'], [/Perhimpunan Agung UMNO \(PAU\)/g, 'Muktamar BERJASA'], [/Perhimpunan Agung \(PAU\)/g, 'Muktamar BERJASA'], [/Perhimpunan Agung BERJASA/g, 'Muktamar BERJASA'],
      [/BERJASA General Assembly \(PAU\)/g, 'BERJASA Muktamar'], [/General Assembly \(PAU\)/g, 'BERJASA Muktamar'], [/BERJASA General Assembly/g, 'BERJASA Muktamar'], [/\bPAU\b/g, 'Muktamar'],
      [/ di WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' di Kota Bharu'], [/ at WTC Kuala Lumpur \(Menara Dato' Onn\)/g, ' in Kota Bharu'],
      [/\bTimbalan Ketua Bahagian\b/g, 'Timbalan Ketua Kawasan'], [/\bNaib Ketua Bahagian\b/g, 'Naib Ketua Kawasan'], [/\bKetua Bahagian\b/g, 'Ketua Kawasan'], [/\bketua bahagian\b/g, 'ketua kawasan'],
      [/Bahagian/g, 'Kawasan'], [/(peringkat|Peringkat) bahagian/g, '$1 kawasan'], [/\bDivisions\b/g, 'Areas'], [/\bDivision\b/g, 'Area'], [/\bdivisions\b/g, 'areas'], [/\bdivision\b/g, 'area'],
      [/\bPemuda\b/g, 'ANGKASA'], [/\bYouth\b/g, 'ANGKASA']].concat(BULAN_BERJASA),
    istilahSongsang: [[/Jawatankuasa Pusat \(AJK Pusat\)/g, 'Majlis Kerja Tertinggi (MKT)'], [/Jawatankuasa Pusat/g, 'Majlis Kerja Tertinggi'], [/\bAJK Pusat\b/g, 'MKT'], [/Central Committee/g, 'Supreme Council'],
      [/Muktamar BERJASA/g, 'Perhimpunan Agung BERJASA (PAU)'], [/BERJASA Muktamar/g, 'BERJASA General Assembly (PAU)'], [/\bMuktamar\b/g, 'PAU'],
      [/ di Kota Bharu/g, " di WTC Kuala Lumpur (Menara Dato' Onn)"], [/ in Kota Bharu/g, " at WTC Kuala Lumpur (Menara Dato' Onn)"],
      [/Timbalan Ketua Kawasan/g, 'Timbalan Ketua Bahagian'], [/Naib Ketua Kawasan/g, 'Naib Ketua Bahagian'], [/Ketua Kawasan/g, 'Ketua Bahagian'], [/ketua kawasan/g, 'ketua bahagian'],
      [/(peringkat|Peringkat) kawasan/g, '$1 bahagian'], [/(?<!Peruntukan |Zon |Kaum |Lobi |Butiran |di )Kawasan(?! (campuran|operasi|anda|Pemain))/g, 'Bahagian'], [/\bAreas\b/g, 'Divisions'], [/\bArea\b/g, 'Division'],
      [/\bANGKASA\b/g, 'Pemuda']].concat(BULAN_BERJASA_S) };
  /* v13.54: GRS (Gabungan Rakyat Sabah), enam parti MOD RINGAN (enjin yang sama seperti PBRS; js/grs.js). Istilah seperti PBRS: Majlis Tertinggi (MT),
     Perhimpunan Agung <parti>, Kota Kinabalu. Gagasan Rakyat: sayap Pemuda, Wanita dan Beliawanis (Puteri); Bahagian ikut 25 kawasan Parlimen Sabah + Labuan
     (pindaan perlembagaan 17 Mei 2026). ANDAIAN: kawasan operasi parti lain, kuota kerusi GRS dan takwim 3/5/9 (data/grs-*.csv, tools/build-grs.js). Logo daripada pengguna. */
  function istilahGRS(kod, songsang) {
    var asal = songsang ? SENARAI.PPP.istilahSongsang : SENARAI.PPP.istilah;
    var x = asal.map(function (r) { var src = r[0].source.replace(/PPP/g, kod).replace('Wisma ' + kod + ', Kuala Lumpur', 'Kota Kinabalu'); return [new RegExp(src, r[0].flags), typeof r[1] === 'string' ? r[1].replace(/PPP/g, kod).replace('Wisma ' + kod + ', Kuala Lumpur', 'Kota Kinabalu') : r[1]]; });
    if (kod === 'GAGASAN') { x = (songsang ? [[/\bBeliawanis\b/g, 'Puteri']] : [[/\bPuteri\b/g, 'Beliawanis']]).concat(x); }
    return x;
  }
  [['GAGASAN', 'Parti Gagasan Rakyat Sabah', 'logo-gagasan.png', ['pemuda', 'puteri', 'wanita'], null], ['PBS', 'Parti Bersatu Sabah', 'logo-pbs.png', ['pemuda', 'wanita'], 'Sabah'],
    ['UPKO', 'Pertubuhan Kinabalu Progresif Bersatu', 'logo-upko.png', ['pemuda', 'wanita'], 'Sabah'], ['LDP', 'Parti Liberal Demokratik', 'logo-ldp.png', ['pemuda', 'wanita'], 'Sabah'],
    ['PHRS', 'Parti Harapan Rakyat Sabah', 'logo-phrs.png', ['pemuda', 'wanita'], 'Sabah'], ['PCS', 'Parti Cinta Sabah', 'logo-pcs.png', ['pemuda', 'wanita'], 'Sabah']].forEach(function (x) {
    SENARAI[x[0]] = { kod: x[0], nama: x[0], penuh: x[1], logo: 'assets/images/' + x[2], sayap: x[3], negeriTetap: x[4], data: 'data/grs-' + x[0].toLowerCase() + '.csv', bahagianJenis: 'Parlimen', grs: true, gabungan: 'GRS',
      istilah: istilahGRS(x[0], false), istilahSongsang: istilahGRS(x[0], true) };
  });
  /* v13.55: Parti Warisan (WARISAN) = parti tanpa gabungan (Lain-lain), MOD RINGAN (js/warisan.js). Istilah seperti PBRS (Majlis Tertinggi, Perhimpunan Agung WARISAN,
     Kota Kinabalu); sayap Wira Warisan (Pemuda), Wanita Warisan dan Wirawati Warisan (Puteri). ANDAIAN: kawasan operasi Sabah, Labuan dan Semenanjung
     (data/warisan-malaysia.csv, tools/build-warisan.js); takwim 3/5/9. Logo daripada pengguna. */
  SENARAI.WARISAN = { kod: 'WARISAN', nama: 'WARISAN', penuh: 'Parti Warisan', logo: 'assets/images/logo-warisan.png', sayap: ['pemuda', 'puteri', 'wanita'], negeriTetap: null, data: 'data/warisan-malaysia.csv', bahagianJenis: 'Parlimen', warisan: true, gabungan: null,
    istilah: [[/\bPemuda\b/g, 'Wira'], [/\bYouth\b/g, 'Wira'], [/\bPuteri\b/g, 'Wirawati']].concat(istilahGRS('WARISAN', false)), istilahSongsang: [[/\bWirawati\b/g, 'Puteri'], [/\bWira\b/g, 'Pemuda']].concat(istilahGRS('WARISAN', true)) };
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
    if (p && p.lompatTertunda && sah(p.lompatTertunda.ke) && W.document && W.document.getElementById && W.document.getElementById('reg-form')) { return p.lompatTertunda.ke; }   // v13.51: borang lompat parti
    return p ? kod(p) : (pilihan() || 'UMNO');
  }

  /* ---------- Penukaran teks ---------- */
  var RE_UMNO = /\bUMNO\b/g, PENUH_UMNO = /Pertubuhan Kebangsaan Melayu Bersatu/g;
  function terap(s, senarai) { if (!senarai) { return s; } for (var j = 0; j < senarai.length; j++) { s = s.replace(senarai[j][0], senarai[j][1]); } return s; }
  function ke(s) {
    var k = kini(); if (k === 'UMNO' || s == null) { return s; }
    if (k === 'PKR' && /(Fasal|Clause) 20\.(5|7|10|12|13)/.test(s)) { s = terap(String(s), FASAL_PKR); }
    if (k === 'DAP' && /(Fasal|Clause) 20\.(5|7|10|12|13)/.test(s)) { s = terap(String(s), FASAL_DAP); }
    if (k === 'AMANAH' && /(Fasal|Clause) 20\.(5|7|10|12|13)/.test(s)) { s = terap(String(s), FASAL_AMANAH); }   // v13.56: Lembaga Tatatertib (Fasal 22)      // v13.38: rujukan disiplin UMNO -> Perlembagaan DAP (Fasal VII)      // v13.36: rujukan disiplin UMNO -> Perlembagaan PKR
    var TU = W.MyPolitikTranslations && W.MyPolitikTranslations.UMUM, sendiri = ((k === 'MCA' || k === 'MIC') && /(Perkara|Article) \d/.test(s) && !/(Fasal|Clause) \d/.test(s)) || (k === 'PKR' && /Perlembagaan PKR|PKR Constitution/.test(s)) || (k === 'DAP' && /Perlembagaan DAP|DAP Constitution/.test(s)) || (k === 'AMANAH' && /Perlembagaan Amanah|Amanah Constitution/.test(s)) || (k === 'PAS' && (/Perlembagaan PAS|PAS Constitution/.test(s) || (/(Fasal|Clause) \d/.test(s) && /\bPAS\b|Majlis Syura|Dewan Ulamak|As-Sabiqun|Himpunan Pendukung|Ahli Bersekutu|Muktamar|Kawasan|\bArea\b|Associate Member|Shura|Ulama/.test(s))));   // v13.32: Fasal PAS sendiri   // v13.31: rujukan Fasal Perlembagaan PAS sendiri      // v13.3: rujukan Perkara Perlembagaan MCA/MIC sendiri dikekalkan
    if (TU && !sendiri) { s = TU.en(TU.bm(s)); }        // v10.6: tiada rujukan Perlembagaan/Fasal UMNO untuk parti lain
    var i = info(k), r = terap(String(s).replace(PENUH_UMNO, i.penuh).replace(RE_UMNO, i.nama), i.istilah);
    if (k === 'DAP' && W.__dapPenyelaras) { r = r.replace(/Setiausaha JPKP/g, 'Penyelaras JPKP').replace(/JPKP Secretary/g, 'JPKP Coordinator'); }   // v13.37: pilihan (b): Penyelaras = Ahli Parlimen
    if (i.ringan) { r = r.split(SENARAI.PBB.penuh).join(i.penuh).replace(/\bPBB\b/g, i.nama); }          // v10.0: teks Sarawak yang menyebut PBB dijenamakan semula untuk parti mod ringan
    return r;
  }
  /** v11.1: calon songsangan alternatif (PAU / Perhimpunan Agung UMNO / (PAU) tidak boleh dibezakan; bulan mungkin asli). */
  function dariAlt(s) {
    var k = kini(); if ((k !== 'PBB' && k !== 'MCA' && k !== 'MIC' && k !== 'PPP' && k !== 'PBRS' && k !== 'PAS' && k !== 'PKR' && k !== 'DAP' && k !== 'AMANAH' && k !== 'BERJASA' && !/^(GAGASAN|PBS|UPKO|LDP|PHRS|PCS|WARISAN)$/.test(k)) || s == null) { return []; }
    var i = info(k), a = String(s), out = [], d = dari(a);
    var tanpaBulan = terap(a, i.istilahSongsang.filter(function (x) { return !/ulan/.test(x[0].source); })).split(i.penuh).join(SENARAI.UMNO.penuh).replace(new RegExp('\\b' + i.nama + '\\b', 'g'), 'UMNO');
    var calon = [d, tanpaBulan];
    if (k === 'BERJASA' || k === 'AMANAH') { calon.push(a); }
    if (k === 'PPP') { calon.push(terap(a, i.istilahSongsang)); }   // v13.57: istilah Pengerusi PPP disongsang, nama parti kekal (kunci kamus lama "perlembagaan PPP ...")   // v13.53: teks khas BERJASA (kunci kamus asal, cth "Kawasan ...", "Muktamar BERJASA")
    if (k === 'PAS' || k === 'BERJASA' || k === 'AMANAH') { calon.push(terap(a, i.istilahSongsang.filter(function (x) { return !/Kawasan\(|\(\?<!/.test(x[0].source); })).split(i.penuh).join(SENARAI.UMNO.penuh).replace(new RegExp('\\b' + k + '\\b', 'g'), 'UMNO')); }   // v13.31: "Kawasan" asal (Peruntukan Kawasan dll.)
    if (k === 'DAP' || k === 'PKR' || k === 'AMANAH') { [d, tanpaBulan].forEach(function (x) { ['20.13', '20.10a', '20.10b', '20.10c', '20.10d', '20.12.2'].forEach(function (f0) { var y = x.replace(/Fasal 20\.(10|12|5)\b/, 'Fasal ' + f0); if (y !== x) { calon.push(y); } }); }); }   // v13.38: rujukan disiplin dipetakan banyak-ke-satu
    calon.forEach(function (x) {
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
  var RE_PERLU = /JPKP|JTP|DAPSY|Setiausaha Agung|Pengerusi|Presiden|President|Ranting|Cabang|Kongres|KEADILAN|\bMPP\b|\bMPN\b|Majlis Pimpinan|Angkatan Muda|Leadership Council|National Congress|Pemuda|Cawangan|cawangan|Bahagian|Branch|Division|bulan 4|Bulan 4|bulan 7|Bulan 7|[Mm]onths? (4|7)|General Assembly|UMNO|Liaison|Perhubungan|Naib Presiden|Vice Presidents|WTC|Fasal \d|Perkara \d|Perlembagaan|Clause|Article \d|\bPBB\b|Parti Pesaka|Pertubuhan Kebangsaan|\bMKT\b|\bPAU\b|Wanita|Women|Muktamar|Kawasan|Pesuruhjaya|JK Pusat|Muslimat|Area|Puteri|Beliawanis|Wira|Wanita|AWAN|WARDA|Majlis Kerja Tertinggi|bulan 8|Bulan 8|[Mm]onth 8|[Bb]ulan (6|9|10)|[Mm]onths? (6|9|10)|bulan 1-3|Bulan 1-3|bulan 3|[Mm]onths 1-3|month 3/;
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
