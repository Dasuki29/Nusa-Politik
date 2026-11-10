/* ==========================================================================
   Nusa Politik — js/meeting.js
   Simulasi Mesyuarat Tahunan dan Usul.

   Peringkat dalam satu tahun, mengikut urutan:
     1. Persidangan Tahunan Cawangan   Usul Lokaliti. Pada tahun pemilihan: undi 5 perwakilan ke Bahagian.
     1b. Mesyuarat Sayap     (v6.0) Bulan 5-6, sebelum Bahagian. Hanya laluan sayap (Pemuda / Puteri / Wanita).
                             Usul isu golongan sayap itu. v7.27: pada tahun pemilihan, kepimpinan sayap (Ketua Sayap Cawangan / Bahagian / Pusat) juga dipilih di sini, bersama wakil sayap.
     2. Mesyuarat Perwakilan Bahagian   Usul Kerusi PRU / Politik. Pada tahun pemilihan: undi 10 perwakilan ke PAU.
     3. PAU                  Usul Dasar Nasional dan Ucapan Dasar.

   Bagi setiap usul pemain memilih satu peranan:
     Pembawa Usul   membawa usul (kos 2 AP). Kredit penuh dan risiko terbesar.
     Pembahas       berbahas menyokong atau membantah (kos 1 AP).
     Mengundi       mengundi sokong, bantah atau berkecuali (percuma).
   Peranan, pendirian, pengaruh (IP) dan sokongan menentukan sama ada usul lulus
   serta perubahan IP dan Reputasi Parti pemain.

   Hanya perwakilan yang dipilih (atau pemegang jawatan yang berkaitan) menghadiri
   mesyuarat Bahagian dan PAU. Usul Lokaliti mengambil isu daripada Sembang Warung.

   Disimpan dalam profil.mesyuarat (localStorage) melalui MyPolitikSave.applyEffects().
   Perlu dimuatkan selepas js/save.js. js/election.js adalah pilihan tetapi diperlukan
   untuk pemilihan perwakilan dan penentuan kelayakan hadir.

   Cara guna dalam dashboard.html:
     var M = MyPolitikMeeting;
     M.getKeadaanMesyuarat();                       // status tiga peringkat
     M.mulaMesyuarat('cawangan');                   // jana agenda
     M.pilihPeranan('cawangan', usulId, 'pembawa'); // 'pembahas' + 'sokong', 'undi' + 'bantah'
     M.tutupMesyuarat('cawangan');                  // selesaikan baki dan pemilihan perwakilan
   ========================================================================== */
(function (root, factory) {
  function muat(fail, nama) {
    if (root[nama]) { return root[nama]; }
    if (typeof module === 'object' && typeof require === 'function') {
      try { return require('./' + fail); } catch (e) { return null; }
    }
    return null;
  }
  var S = muat('save.js', 'MyPolitikSave');
  if (!S) { throw new Error('meeting.js memerlukan js/save.js dimuatkan dahulu.'); }
  var E = muat('election.js', 'MyPolitikElection');   // pilihan
  var J = muat('jawatan.js', 'MyPolitikJawatan');     // pilihan (v3.0: pegangan berbilang, perwakilan tahunan)
  var api = factory(S, E, J);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikMeeting = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (S, E, J) {
  'use strict';

  var CONFIG = {
    BIL_USUL: 3,
    ASAS_LULUS: 50,                                   // sokongan (0 hingga 100) untuk lulus
    SISIHAN_RAWAK: 8,
    KOS_AP: { pembawa: 2, pembahas: 1, undi: 0 },
    KREDIT: { pembawa: 1, pembahas: 0.5, undi: 0.25 }, // bahagian kredit Reputasi Parti
    GANJARAN_IP: {
      pembawa: { lulus: 12, ditolak: -4 },
      pembahas: { padan: 6, tidakPadan: 2 },
      undi: { padan: 2, tidakPadan: 0 }
    },
    HADIR: { cawangan: null, sayap_cawangan: null, sayap_bahagian: 60, sayap_pau: 300, bahagian: 125, pau: 1500 },
    TAHAP_HADIR_SAYAP: 0.2,                           // kehadiran sayap = 20% ahli cawangan, minimum 20 // pengundi simulasi (cawangan = 35% ahli, min 30)
    TAHAP_HADIR_CAWANGAN: 0.35
  };

  // v6.1: setiap peringkat utama didahului mesyuarat sayap yang membawa SATU usul ke mesyuarat utama (laluan sayap sahaja).
  var URUTAN = ['sayap_cawangan', 'cawangan', 'sayap_bahagian', 'bahagian', 'sayap_pau', 'pau'];
  var INDUK = { sayap_cawangan: 'cawangan', sayap_bahagian: 'bahagian', sayap_pau: 'pau' };      // sayap -> mesyuarat utama
  var SAYAP_UNTUK = { cawangan: 'sayap_cawangan', bahagian: 'sayap_bahagian', pau: 'sayap_pau' };
  function adalahSayap(k) { return !!INDUK[k]; }

  var PERINGKAT = {
    cawangan: { kod: 'cawangan', nama: 'Persidangan Tahunan Cawangan', jenisUsul: 'Usul Lokaliti', kesetiaan: ['akarUmbi', 'ketuaCawangan'], perwakilan: { kerusi: 5, ke: 'Bahagian', kod: 'perwakilan_cawangan' } },
    sayap_cawangan: { kod: 'sayap_cawangan', nama: 'Persidangan Tahunan Sayap Cawangan', jenisUsul: 'Usul Isu Golongan Sayap', kesetiaan: ['akarUmbi', 'ajk'], perwakilan: null, sayapSahaja: true },
    sayap_bahagian: { kod: 'sayap_bahagian', nama: 'Mesyuarat Perwakilan Sayap Bahagian', jenisUsul: 'Usul Isu Golongan Sayap', kesetiaan: ['perwakilan'], perwakilan: null, sayapSahaja: true },
    sayap_pau: { kod: 'sayap_pau', nama: 'Perhimpunan Sayap (Pra-PAU)', jenisUsul: 'Usul Isu Golongan Sayap', kesetiaan: ['perwakilan'], perwakilan: null, sayapSahaja: true },
    bahagian: { kod: 'bahagian', nama: 'Mesyuarat Perwakilan Bahagian', jenisUsul: 'Usul Kerusi PRU dan Politik', kesetiaan: ['perwakilan'], perwakilan: { kerusi: 10, ke: 'PAU', kod: 'perwakilan_bahagian' } },
    pau: { kod: 'pau', nama: 'Perhimpunan Agung UMNO (PAU)', jenisUsul: 'Usul Dasar Nasional', kesetiaan: ['perwakilan'], perwakilan: null, pusat: true }
  };

  /* ------------------------------------------------------------------------
     1. KOLAM USUL
     populariti: sokongan asas (0 hingga 100). nilai: kesan pada Reputasi Parti jika diluluskan.
     ------------------------------------------------------------------------ */
  var KOLAM = {
    cawangan: [
      { kod: 'jalan_longkang',  tajuk: 'Baik pulih jalan dan longkang kawasan lokaliti', penerangan: 'Memohon peruntukan segera bagi jalan berlubang dan longkang tersumbat.', populariti: 70, nilai: 3 },
      { kod: 'dewan_surau',     tajuk: 'Naik taraf dewan komuniti dan surau', penerangan: 'Membaiki bumbung dan kemudahan asas untuk kegunaan majlis dan kenduri.', populariti: 65, nilai: 2 },
      { kod: 'latihan_belia',   tajuk: 'Program latihan kemahiran untuk belia lokaliti', penerangan: 'Bekerjasama dengan institusi latihan bagi belia yang menganggur.', populariti: 60, nilai: 4 },
      { kod: 'bantuan_warga',   tajuk: 'Bantuan bulanan tambahan untuk warga emas', penerangan: 'Menyalurkan bantuan kepada warga emas yang tinggal bersendirian.', populariti: 62, nilai: 3 },
      { kod: 'lampu_cctv',      tajuk: 'Pasang lampu jalan dan CCTV di taman perumahan', penerangan: 'Mengurangkan kes kecurian dan meningkatkan keselamatan.', populariti: 66, nilai: 3 },
      { kod: 'naik_yuran',      tajuk: 'Naikkan yuran keahlian cawangan', penerangan: 'Menaikkan yuran bagi menampung kos aktiviti cawangan.', populariti: 30, nilai: -3 },
      { kod: 'sumbangan_wajib', tajuk: 'Wajibkan sumbangan dana tahunan setiap ahli', penerangan: 'Setiap ahli diwajibkan menyumbang kepada dana kempen cawangan.', populariti: 28, nilai: -4 },
      { kod: 'had_gerai',       tajuk: 'Hadkan waktu operasi gerai malam', penerangan: 'Gerai ditutup awal bagi mengurangkan aduan kebisingan.', populariti: 35, nilai: -2 }
    ],
    bahagian: [
      { kod: 'calon_muda',      tajuk: 'Tampilkan calon muda untuk kerusi PRU bahagian', penerangan: 'Memberi ruang kepada pemimpin muda yang aktif di peringkat cawangan.', populariti: 55, nilai: 4 },
      { kod: 'kerusi_adil',     tajuk: 'Tuntut rundingan agihan kerusi PRU yang adil dalam gabungan', penerangan: 'Bahagian mahu pendirian jelas mengenai agihan kerusi sebelum PRU.', populariti: 60, nilai: 2 },
      { kod: 'pusat_khidmat',   tajuk: 'Wujudkan pusat khidmat penduduk di setiap DUN', penerangan: 'Pusat khidmat tetap untuk aduan dan bantuan penduduk.', populariti: 68, nilai: 4 },
      { kod: 'jentera_cawangan', tajuk: 'Mantapkan jentera pilihan raya peringkat cawangan', penerangan: 'Latihan dan pemetaan pengundi dibuat lebih awal.', populariti: 64, nilai: 3 },
      { kod: 'calon_luar',      tajuk: 'Terima calon luar bahagian untuk kerusi DUN', penerangan: 'Calon dibawa dari luar walaupun ada pemimpin setempat.', populariti: 32, nilai: -3 },
      { kod: 'kempen_awal',     tajuk: 'Mulakan kempen PRU 18 bulan lebih awal', penerangan: 'Kempen awal berisiko meletihkan jentera dan membazir dana.', populariti: 40, nilai: -1 }
    ],
    pau: [
      { kod: 'sara_hidup',      tajuk: 'Bantuan sara hidup bersasar untuk isi rumah berpendapatan rendah', penerangan: 'Bantuan diberi kepada kumpulan yang paling terkesan oleh kos sara hidup.', populariti: 70, nilai: 4 },
      { kod: 'latihan_teknikal', tajuk: 'Perluas biasiswa dan latihan teknikal untuk anak muda', penerangan: 'Menambah tempat latihan teknikal dan biasiswa di luar bandar.', populariti: 66, nilai: 4 },
      { kod: 'rumah_belia',     tajuk: 'Skim pemilikan rumah mampu milik untuk belia', penerangan: 'Skim pembiayaan dengan bayaran awal rendah untuk pembeli pertama.', populariti: 64, nilai: 3 },
      { kod: 'digital_luar',    tajuk: 'Pendigitalan perkhidmatan kerajaan di luar bandar', penerangan: 'Menambah akses internet dan kaunter digital di kawasan luar bandar.', populariti: 62, nilai: 3 },
      { kod: 'had_tempoh',      tajuk: 'Had tempoh memegang jawatan utama parti', penerangan: 'Pemegang jawatan utama dihadkan kepada dua penggal berturut-turut.', populariti: 45, nilai: 2 },
      { kod: 'cukai_baharu',    tajuk: 'Perkenalkan cukai baharu bagi menampung subsidi', penerangan: 'Cukai baharu dicadang untuk membiayai bantuan, dengan risiko bantahan awam.', populariti: 30, nilai: -3 }
    ],
    /* v6.0: usul isu golongan bagi Mesyuarat Sayap. Setiap sayap membincangkan isu kumpulannya sendiri. */
    sayap_cawangan_pemuda: [
      { kod: 'kerja_siswazah',  tajuk: 'Skim penempatan kerja dan gaji permulaan siswazah', penerangan: 'Siswazah muda sukar mendapat pekerjaan setimpal. Sayap mahu skim penempatan dengan gaji permulaan yang adil.', populariti: 70, nilai: 4 },
      { kod: 'rumah_pertama',   tajuk: 'Pembiayaan rumah pertama dengan bayaran muka rendah', penerangan: 'Belia berpendapatan sederhana gagal memiliki rumah pertama akibat harga dan syarat pembiayaan.', populariti: 66, nilai: 3 },
      { kod: 'kemahiran_gig',   tajuk: 'Latihan kemahiran digital dan perlindungan pekerja gig', penerangan: 'Ramai belia bergantung kepada kerja gig tanpa caruman dan perlindungan.', populariti: 64, nilai: 3 },
      { kod: 'dana_usahawan_belia', tajuk: 'Dana pemula untuk usahawan belia', penerangan: 'Modal kecil dan bimbingan untuk belia yang mahu memulakan perniagaan.', populariti: 62, nilai: 3 },
      { kod: 'had_umur_pemuda', tajuk: 'Turunkan had umur keahlian Pemuda kepada 35 tahun', penerangan: 'Cadangan yang mengasingkan ramai ahli yang kini berusia 36 hingga 40 tahun.', populariti: 28, nilai: -3 },
      { kod: 'yuran_program',   tajuk: 'Kenakan yuran lebih tinggi untuk program Pemuda', penerangan: 'Yuran dinaikkan bagi menampung kos, walaupun ramai ahli belum bekerja tetap.', populariti: 33, nilai: -2 }
    ],
    sayap_cawangan_puteri: [
      { kod: 'keselamatan_muda', tajuk: 'Keselamatan dan pencegahan gangguan di tempat kerja dan kampus', penerangan: 'Ahli Puteri mahu saluran aduan yang selamat dan tindakan tegas terhadap gangguan.', populariti: 70, nilai: 4 },
      { kod: 'gaji_setara',     tajuk: 'Perjuangkan gaji dan peluang kerjaya yang setara', penerangan: 'Perempuan muda sering terlepas kenaikan pangkat dan gaji yang sama dengan rakan lelaki.', populariti: 66, nilai: 3 },
      { kod: 'geran_usahawan_puteri', tajuk: 'Geran perniagaan kecil untuk usahawan muda perempuan', penerangan: 'Menyediakan modal permulaan dan latihan untuk usahawan perempuan muda.', populariti: 64, nilai: 3 },
      { kod: 'kesihatan_mental', tajuk: 'Program kesihatan mental dan sokongan rakan sebaya', penerangan: 'Tekanan kerja dan buli siber menjejaskan ramai perempuan muda.', populariti: 60, nilai: 3 },
      { kod: 'kurang_rangkaian', tajuk: 'Kurangkan peruntukan program rangkaian Puteri', penerangan: 'Peruntukan dikurangkan walaupun program rangkaian menjadi nadi sayap.', populariti: 30, nilai: -2 },
      { kod: 'wajib_hadir',     tajuk: 'Wajibkan kehadiran semua aktiviti sayap', penerangan: 'Ahli yang bekerja dan belajar merungut tidak mampu hadir semua program.', populariti: 32, nilai: -2 }
    ],
    sayap_cawangan_wanita: [
      { kod: 'jagaan_warga',    tajuk: 'Pusat jagaan harian dan elaun penjaga warga emas', penerangan: 'Ramai wanita menjaga ibu bapa dan mentua tanpa sokongan kewangan atau kemudahan jagaan.', populariti: 70, nilai: 4 },
      { kod: 'harga_dapur',     tajuk: 'Kawalan harga barang keperluan dapur', penerangan: 'Kos makanan isi rumah naik dan ibu rumah tangga menanggung bebannya.', populariti: 68, nilai: 4 },
      { kod: 'saringan_wanita', tajuk: 'Saringan kesihatan wanita percuma (payudara dan serviks)', penerangan: 'Saringan awal menyelamatkan nyawa tetapi kosnya membebankan golongan berpendapatan rendah.', populariti: 66, nilai: 3 },
      { kod: 'ibu_tunggal',     tajuk: 'Bantuan modal dan latihan untuk ibu tunggal', penerangan: 'Ibu tunggal memerlukan modal kecil dan kemahiran untuk menjana pendapatan sendiri.', populariti: 64, nilai: 3 },
      { kod: 'kurang_taska',    tajuk: 'Kurangkan subsidi tadika dan taska komuniti', penerangan: 'Subsidi dikurangkan bagi menjimatkan peruntukan, walaupun ibu bekerja bergantung kepadanya.', populariti: 28, nilai: -3 },
      { kod: 'caj_klinik',      tajuk: 'Naikkan caj klinik komuniti', penerangan: 'Caj dinaikkan bagi menampung kos, tetapi warga emas dan isi rumah miskin terkesan.', populariti: 30, nilai: -3 }
    ],
    sayap_bahagian_pemuda: [
      { kod: 'bhg_pemuda_latihan', tajuk: 'Pusat latihan kemahiran belia di setiap DUN', penerangan: 'Bahagian diminta menaja pusat latihan kemahiran untuk belia menganggur di kawasan DUN.', populariti: 68, nilai: 3 },
      { kod: 'bhg_pemuda_calon', tajuk: 'Beri kuota calon muda dalam senarai calon PRU', penerangan: 'Pemuda mahu sekurang-kurangnya satu pertiga calon bahagian terdiri daripada belia.', populariti: 64, nilai: 4 },
      { kod: 'bhg_pemuda_sukan', tajuk: 'Dana tetap sukan dan kerja sukarela belia', penerangan: 'Peruntukan tahunan bahagian bagi program sukan dan khidmat komuniti belia.', populariti: 60, nilai: 2 },
      { kod: 'bhg_pemuda_skim_rumah', tajuk: 'Skim sewa-beli rumah belia di kawasan bahagian', penerangan: 'Bahagian mendesak kerajaan negeri menyediakan rumah mampu milik untuk belia.', populariti: 66, nilai: 3 },
      { kod: 'bhg_pemuda_potong', tajuk: 'Potong peruntukan aktiviti Pemuda bahagian', penerangan: 'Peruntukan dikurangkan bagi menampung kos jentera pilihan raya.', populariti: 27, nilai: -3 }
    ],
    sayap_bahagian_puteri: [
      { kod: 'bhg_puteri_selamat', tajuk: 'Pusat aduan dan bantuan guaman percuma untuk perempuan muda', penerangan: 'Bahagian menyediakan kaunter aduan gangguan dan bantuan guaman asas.', populariti: 68, nilai: 3 },
      { kod: 'bhg_puteri_calon', tajuk: 'Kuota calon perempuan muda dalam pilihan raya', penerangan: 'Puteri mahu wakil perempuan muda dalam senarai calon bahagian.', populariti: 63, nilai: 4 },
      { kod: 'bhg_puteri_biasiswa', tajuk: 'Dana latihan kerjaya dan mentor untuk Puteri', penerangan: 'Program mentor dengan pemimpin wanita untuk perempuan muda bekerjaya.', populariti: 61, nilai: 3 },
      { kod: 'bhg_puteri_ruang', tajuk: 'Ruang kerja bersama dan taska di pejabat bahagian', penerangan: 'Menyediakan ruang yang mesra keluarga untuk ahli yang bekerja.', populariti: 58, nilai: 2 },
      { kod: 'bhg_puteri_hapus', tajuk: 'Hapuskan jawatankuasa kebajikan Puteri bahagian', penerangan: 'Jawatankuasa dibubarkan bagi menjimatkan kos pentadbiran.', populariti: 26, nilai: -3 }
    ],
    sayap_bahagian_wanita: [
      { kod: 'bhg_wanita_klinik', tajuk: 'Klinik bergerak untuk warga emas dan ibu mengandung', penerangan: 'Bahagian menaja klinik bergerak ke kampung dan taman perumahan.', populariti: 69, nilai: 3 },
      { kod: 'bhg_wanita_bantuan', tajuk: 'Dana kecemasan isi rumah untuk ibu tunggal', penerangan: 'Tabung bantuan segera bagi ibu tunggal dan isi rumah berpendapatan rendah.', populariti: 66, nilai: 3 },
      { kod: 'bhg_wanita_calon', tajuk: 'Kuota calon wanita dalam senarai calon bahagian', penerangan: 'Wanita mahu lebih ramai calon wanita bagi kerusi DUN dan Parlimen.', populariti: 62, nilai: 4 },
      { kod: 'bhg_wanita_koperasi', tajuk: 'Koperasi dan pasar mini usahawan wanita', penerangan: 'Menyediakan tapak niaga dan koperasi untuk usahawan mikro wanita.', populariti: 60, nilai: 2 },
      { kod: 'bhg_wanita_yuran', tajuk: 'Naikkan yuran keahlian Wanita bahagian', penerangan: 'Yuran dinaikkan walaupun ramai ahli warga emas berpendapatan tetap.', populariti: 25, nilai: -3 }
    ],
    sayap_pau_pemuda: [
      { kod: 'pau_pemuda_gaji', tajuk: 'Gaji minimum belia dan skim latihan industri kebangsaan', penerangan: 'Pemuda membawa usul dasar gaji permulaan dan latihan industri ke peringkat nasional.', populariti: 70, nilai: 4 },
      { kod: 'pau_pemuda_umur', tajuk: 'Turunkan umur layak mengundi dan bertanding', penerangan: 'Belia mahu penyertaan politik yang lebih awal.', populariti: 55, nilai: 3 },
      { kod: 'pau_pemuda_digital', tajuk: 'Dasar ekonomi digital dan perlindungan pekerja gig', penerangan: 'Dasar nasional bagi caruman dan perlindungan sosial pekerja gig.', populariti: 66, nilai: 3 },
      { kod: 'pau_pemuda_perumahan', tajuk: 'Dasar perumahan belia kebangsaan', penerangan: 'Pembiayaan dan bayaran muka rendah bagi pembeli rumah pertama.', populariti: 65, nilai: 3 },
      { kod: 'pau_pemuda_hadkan', tajuk: 'Hadkan jawatan Pemuda kepada mereka di bawah 30 tahun', penerangan: 'Usul yang menyingkirkan ramai pemimpin Pemuda yang sedia ada.', populariti: 24, nilai: -4 }
    ],
    sayap_pau_puteri: [
      { kod: 'pau_puteri_undang', tajuk: 'Akta anti-gangguan yang lebih tegas', penerangan: 'Puteri membawa usul pindaan undang-undang gangguan ke peringkat nasional.', populariti: 70, nilai: 4 },
      { kod: 'pau_puteri_gaji', tajuk: 'Dasar gaji setara dan cuti keluarga', penerangan: 'Dasar nasional bagi pembayaran setara dan cuti keluarga yang adil.', populariti: 66, nilai: 3 },
      { kod: 'pau_puteri_usahawan', tajuk: 'Dana usahawan perempuan muda kebangsaan', penerangan: 'Dana pembiayaan mudah untuk usahawan perempuan muda.', populariti: 63, nilai: 3 },
      { kod: 'pau_puteri_mental', tajuk: 'Perkhidmatan kesihatan mental dalam sistem awam', penerangan: 'Kaunseling dan sokongan kesihatan mental di klinik kerajaan.', populariti: 64, nilai: 3 },
      { kod: 'pau_puteri_kuota', tajuk: 'Kurangkan kuota sayap Puteri dalam MKT', penerangan: 'Usul yang melemahkan perwakilan sayap Puteri dalam Majlis Kerja Tertinggi.', populariti: 22, nilai: -4 }
    ],
    sayap_pau_wanita: [
      { kod: 'pau_wanita_penjaga', tajuk: 'Elaun penjaga dan skim jagaan warga emas nasional', penerangan: 'Wanita membawa usul bantuan penjaga keluarga ke peringkat nasional.', populariti: 70, nilai: 4 },
      { kod: 'pau_wanita_harga', tajuk: 'Kawalan harga barang asas dan subsidi dapur', penerangan: 'Dasar nasional bagi mengawal kos sara hidup isi rumah.', populariti: 67, nilai: 3 },
      { kod: 'pau_wanita_saringan', tajuk: 'Saringan kesihatan wanita percuma peringkat nasional', penerangan: 'Saringan kanser payudara dan serviks percuma untuk semua wanita.', populariti: 65, nilai: 3 },
      { kod: 'pau_wanita_taska', tajuk: 'Subsidi taska dan tadika komuniti nasional', penerangan: 'Mengurangkan beban penjagaan anak bagi ibu bekerja.', populariti: 62, nilai: 3 },
      { kod: 'pau_wanita_cukai', tajuk: 'Kenakan cukai tambahan ke atas barang keperluan wanita', penerangan: 'Cukai dikenakan bagi menambah hasil negara, tetapi membebankan isi rumah.', populariti: 20, nilai: -4 }
    ]
  };

  var TEMA_UCAPAN = ['Perpaduan dan Pembangunan', 'Ekonomi Rakyat', 'Kesinambungan dan Pembaharuan', 'Parti Dekat dengan Akar Umbi'];
  /* v13.60 (audit enjin mesyuarat Fasa 1, mockup dipersetujui): usul dan tema Ucapan Dasar ikut komuniti parti. Usul parti diutamakan (maks 2), baki daripada kolam umum. */
  var KOLAM_PARTI = {
    MCA: {
      cawangan: [
        { kod: 'mca_sjkc', tajuk: 'Peruntukan baik pulih sekolah jenis kebangsaan Cina di kawasan ini', penerangan: 'Bangunan SJK(C) setempat usang dan memerlukan peruntukan segera.', populariti: 72, nilai: 4 },
        { kod: 'mca_penjaja', tajuk: 'Tapak niaga dan lesen penjaja yang lebih mudah', penerangan: 'Penjaja dan peniaga kecil mahu proses lesen pihak berkuasa tempatan dipermudah.', populariti: 66, nilai: 3 },
        { kod: 'mca_rukun', tajuk: 'Rondaan rukun tetangga di taman perumahan', penerangan: 'Kes pecah rumah meningkat; penduduk mahu rondaan bersama polis.', populariti: 63, nilai: 3 }
      ],
      bahagian: [
        { kod: 'mca_uec', tajuk: 'Desak pengiktirafan Sijil UEC secara berperingkat', penerangan: 'Bahagian mahu MCA membawa isu pengiktirafan UEC ke peringkat kerajaan.', populariti: 68, nilai: 3 },
        { kod: 'mca_pks', tajuk: 'Geran digital dan pinjaman mudah untuk PKS', penerangan: 'Perniagaan kecil keluarga terjejas oleh kos operasi dan persaingan dalam talian.', populariti: 65, nilai: 3 },
        { kod: 'mca_kerusi_bn', tajuk: 'Tuntut kerusi tradisional MCA dikembalikan dalam BN', penerangan: 'Bahagian mahu kerusi majoriti campuran diserahkan semula kepada calon MCA.', populariti: 60, nilai: 2 }
      ],
      pau: [
        { kod: 'mca_pendidikan', tajuk: 'Dasar pendidikan yang adil untuk sekolah vernakular', penerangan: 'Peruntukan tetap tahunan untuk SJK(C) dan sekolah menengah persendirian Cina.', populariti: 70, nilai: 4 },
        { kod: 'mca_ekonomi', tajuk: 'Pelan pemulihan ekonomi PKS dan peniaga Cina', penerangan: 'Insentif cukai dan pembiayaan bagi perniagaan kecil dan sederhana.', populariti: 66, nilai: 3 },
        { kod: 'mca_suara', tajuk: 'Kukuhkan suara MCA dalam kerajaan dan BN', penerangan: 'MCA mahu jawatan kabinet dan kerusi yang setimpal dengan sokongannya.', populariti: 62, nilai: 2 }
      ]
    },
    MIC: {
      cawangan: [
        { kod: 'mic_sjkt', tajuk: 'Bantuan peralatan dan pengangkutan murid sekolah Tamil', penerangan: 'Murid SJK(T) setempat kekurangan peralatan dan bas sekolah.', populariti: 72, nilai: 4 },
        { kod: 'mic_dokumen', tajuk: 'Klinik bantuan dokumen kerakyatan dan MyKad', penerangan: 'Ramai keluarga masih tidak mempunyai dokumen pengenalan yang lengkap.', populariti: 68, nilai: 4 },
        { kod: 'mic_kuil', tajuk: 'Tanah tetap untuk kuil dan tanah perkuburan', penerangan: 'Kuil kecil di kawasan ini berdepan notis pindah tanpa tapak ganti.', populariti: 64, nilai: 3 }
      ],
      bahagian: [
        { kod: 'mic_tvet', tajuk: 'Kuota latihan TVET untuk belia India', penerangan: 'Bahagian mahu tempat latihan teknikal dikhaskan untuk belia India B40.', populariti: 67, nilai: 3 },
        { kod: 'mic_usahawan', tajuk: 'Dana usahawan India melalui agensi kerajaan', penerangan: 'Usahawan kecil sukar mendapat pembiayaan tanpa cagaran.', populariti: 63, nilai: 3 },
        { kod: 'mic_kerusi_bn', tajuk: 'Kembalikan kerusi tradisional MIC dalam BN', penerangan: 'Bahagian mahu MIC bertanding semula di kerusi bercampur yang pernah dimenanginya.', populariti: 60, nilai: 2 }
      ],
      pau: [
        { kod: 'mic_pelan', tajuk: 'Pelan tindakan ekonomi masyarakat India', penerangan: 'Sasaran pemilikan ekuiti, pekerjaan dan pendidikan yang boleh diukur.', populariti: 70, nilai: 4 },
        { kod: 'mic_tamil', tajuk: 'Naik taraf semua sekolah Tamil separa bantuan', penerangan: 'Sekolah Tamil separa bantuan memerlukan status bantuan penuh.', populariti: 67, nilai: 3 },
        { kod: 'mic_kerakyatan', tajuk: 'Selesaikan isu kerakyatan tertunggak', penerangan: 'MIC mahu pasukan khas menyelesaikan permohonan kerakyatan yang lama tertangguh.', populariti: 64, nilai: 3 }
      ]
    },
    PPP: {
      cawangan: [
        { kod: 'ppp_ppr', tajuk: 'Penyelenggaraan rumah PPR dan flat kos rendah', penerangan: 'Lif rosak dan sampah tidak dikutip di blok kediaman kos rendah.', populariti: 68, nilai: 3 },
        { kod: 'ppp_sara', tajuk: 'Bantuan sara hidup tanpa mengira kaum untuk B40', penerangan: 'Keluarga B40 bandar daripada semua kaum memerlukan bantuan bersasar.', populariti: 66, nilai: 3 }
      ],
      bahagian: [
        { kod: 'ppp_graduan', tajuk: 'Program penempatan kerja graduan bandar', penerangan: 'Graduan muda berbilang kaum sukar mendapat pekerjaan setimpal.', populariti: 64, nilai: 3 },
        { kod: 'ppp_kerusi', tajuk: 'Tuntut satu kerusi untuk PPP dalam rundingan BN', penerangan: 'Bahagian mahu PPP diberi peluang bertanding di kawasan bercampur.', populariti: 58, nilai: 2 }
      ],
      pau: [
        { kod: 'ppp_majmuk', tajuk: 'Politik berbilang kaum sebagai teras BN', penerangan: 'PPP mahu BN kembali kepada perkongsian kuasa berbilang kaum yang sebenar.', populariti: 66, nilai: 3 },
        { kod: 'ppp_rumah', tajuk: 'Rumah mampu milik bandar untuk semua kaum', penerangan: 'Skim perumahan bandar yang terbuka kepada semua isi rumah berpendapatan rendah.', populariti: 64, nilai: 3 }
      ]
    },
    PKR: {
      cawangan: [
        { kod: 'pkr_aduan', tajuk: 'Pusat aduan rakyat di setiap Ranting', penerangan: 'Penduduk mahu saluran aduan tetap untuk masalah jalan, sampah dan bantuan.', populariti: 66, nilai: 3 },
        { kod: 'pkr_gaji', tajuk: 'Desak gaji wajar untuk pekerja tempatan', penerangan: 'Pekerja kilang dan perkhidmatan di kawasan ini bergaji rendah.', populariti: 64, nilai: 3 }
      ],
      bahagian: [
        { kod: 'pkr_rasuah', tajuk: 'Perangi rasuah dan salah guna kuasa di peringkat negeri', penerangan: 'Cabang mahu siasatan telus terhadap projek yang dipertikaikan.', populariti: 68, nilai: 4 },
        { kod: 'pkr_anak_muda', tajuk: 'Beri ruang anak muda dalam senarai calon', penerangan: 'AMK mahu lebih ramai calon muda dalam pilihan raya akan datang.', populariti: 62, nilai: 3 }
      ],
      pau: [
        { kod: 'pkr_reformasi', tajuk: 'Teruskan reformasi institusi: had tempoh Perdana Menteri', penerangan: 'Kongres mendesak had dua penggal bagi jawatan Perdana Menteri.', populariti: 66, nilai: 3 },
        { kod: 'pkr_sara', tajuk: 'Tangani kos sara hidup dan subsidi bersasar', penerangan: 'Subsidi diberi kepada yang memerlukan, tanpa membebankan rakyat.', populariti: 64, nilai: 3 },
        { kod: 'pkr_kehakiman', tajuk: 'Pemisahan kuasa Peguam Negara dan Pendakwa Raya', penerangan: 'Kongres mahu peranan pendakwaan diasingkan daripada penasihat kerajaan.', populariti: 60, nilai: 3 }
      ]
    },
    DAP: {
      cawangan: [
        { kod: 'dap_bas', tajuk: 'Laluan bas awam ke taman perumahan', penerangan: 'Penduduk bergantung kepada kereta kerana tiada bas awam yang kerap.', populariti: 66, nilai: 3 },
        { kod: 'dap_banjir_kilat', tajuk: 'Atasi banjir kilat di kawasan bandar', penerangan: 'Longkang tersumbat menyebabkan banjir kilat setiap kali hujan lebat.', populariti: 68, nilai: 3 }
      ],
      bahagian: [
        { kod: 'dap_telus', tajuk: 'Ketelusan perolehan kerajaan tempatan', penerangan: 'JPKP mahu tender majlis tempatan diumumkan secara terbuka.', populariti: 66, nilai: 4 },
        { kod: 'dap_pbt', tajuk: 'Pilihan raya kerajaan tempatan', penerangan: 'Ahli majlis tempatan dipilih rakyat, bukan dilantik.', populariti: 58, nilai: 3 }
      ],
      pau: [
        { kod: 'dap_peluang', tajuk: 'Pendidikan dan peluang sama rata untuk semua', penerangan: 'Kemasukan universiti dan biasiswa berasaskan merit dan keperluan.', populariti: 66, nilai: 3 },
        { kod: 'dap_integriti', tajuk: 'Integriti dan kecekapan dalam kerajaan', penerangan: 'Akta pembiayaan politik dan pengisytiharan harta wakil rakyat.', populariti: 64, nilai: 4 },
        { kod: 'dap_transit', tajuk: 'Pengangkutan awam bandar yang bersepadu', penerangan: 'Sistem rel dan bas bersepadu untuk bandar-bandar utama.', populariti: 62, nilai: 3 }
      ]
    },
    AMANAH: {
      cawangan: [
        { kod: 'amanah_masjid', tajuk: 'Tadbir urus masjid dan surau yang inklusif', penerangan: 'Ahli kariah mahu masjid terbuka untuk program masyarakat dan anak muda.', populariti: 66, nilai: 3 },
        { kod: 'amanah_kebajikan', tajuk: 'Tabung kebajikan untuk keluarga miskin bandar', penerangan: 'Keluarga B40 memerlukan bantuan makanan dan yuran sekolah.', populariti: 68, nilai: 3 }
      ],
      bahagian: [
        { kod: 'amanah_dakwah', tajuk: 'Dakwah rahmah kepada masyarakat berbilang kaum', penerangan: 'Kawasan mahu program dialog dan kebajikan bersama masyarakat bukan Islam.', populariti: 60, nilai: 3 },
        { kod: 'amanah_ph', tajuk: 'Kukuhkan jentera bersama PH di kerusi Melayu', penerangan: 'Amanah perlu menawan pengundi Melayu bersama PKR dan DAP.', populariti: 62, nilai: 3 }
      ],
      pau: [
        { kod: 'amanah_rahmah', tajuk: 'Islam rahmah dan progresif sebagai dasar negara', penerangan: 'Konvensyen mendukung pendekatan Islam yang adil, inklusif dan sederhana.', populariti: 64, nilai: 3 },
        { kod: 'amanah_keadilan', tajuk: 'Keadilan sosial: gaji wajar dan perumahan rakyat', penerangan: 'Konvensyen mendesak dasar gaji wajar dan rumah mampu milik.', populariti: 66, nilai: 3 }
      ]
    },
    BERJASA: {
      cawangan: [{ kod: 'bj_fardu', tajuk: 'Kelas fardu ain dan tahfiz untuk anak-anak', penerangan: 'Ibu bapa mahu kelas agama yang tetap di kawasan ini.', populariti: 70, nilai: 3 }],
      bahagian: [{ kod: 'bj_ekonomi', tajuk: 'Ekonomi Islam untuk peniaga kecil', penerangan: 'Pembiayaan patuh syariah dan koperasi untuk peniaga kecil Melayu.', populariti: 64, nilai: 3 }],
      pau: [{ kod: 'bj_dasar', tajuk: 'Islam sebagai teras dasar negara', penerangan: 'Muktamar mendesak nilai Islam diterapkan dalam dasar awam.', populariti: 66, nilai: 3 }, { kod: 'bj_ummah', tajuk: 'Kerjasama ummah dalam PN dan GTA', penerangan: 'BERJASA mahu kerjasama parti Islam dan Melayu diperkukuh.', populariti: 62, nilai: 3 }]
    },
    WARISAN: {
      cawangan: [{ kod: 'wr_air', tajuk: 'Air dan jalan untuk kampung luar bandar', penerangan: 'Penduduk masih bergantung kepada air tangki dan jalan tanah.', populariti: 68, nilai: 3 }],
      bahagian: [{ kod: 'wr_kerja', tajuk: 'Peluang kerja untuk anak muda Sabah', penerangan: 'Bahagian mahu pelaburan yang membuka peluang kerja tempatan.', populariti: 66, nilai: 3 }, { kod: 'wr_semenanjung', tajuk: 'Kembangkan Warisan di Semenanjung', penerangan: 'Bahagian mahu Warisan membuka lebih banyak cawangan di Semenanjung.', populariti: 58, nilai: 2 }],
      pau: [{ kod: 'wr_perpaduan', tajuk: 'Parti milik semua kaum', penerangan: 'Warisan memperjuangkan perpaduan tanpa mengira kaum dan agama.', populariti: 66, nilai: 3 }]
    },
    GAGASAN: {
      cawangan: [{ kod: 'gag_air', tajuk: 'Bekalan air dan elektrik yang stabil di Sabah', penerangan: 'Gangguan air dan elektrik masih kerap di kawasan ini.', populariti: 70, nilai: 4 }],
      bahagian: [{ kod: 'gag_kerja', tajuk: 'Utamakan anak Sabah dalam peluang pekerjaan', penerangan: 'Belia Sabah terpaksa berhijrah ke Semenanjung untuk bekerja.', populariti: 66, nilai: 3 }],
      pau: [{ kod: 'gag_40', tajuk: 'Tuntut 40% hasil persekutuan dari Sabah (MA63)', penerangan: 'Perhimpunan mendesak hak 40% hasil dibayar kepada Sabah.', populariti: 72, nilai: 4 }]
    },
    PBS: {
      cawangan: [{ kod: 'pbs_bahasa', tajuk: 'Bahasa Kadazandusun di sekolah', penerangan: 'Ibu bapa mahu lebih banyak kelas Bahasa Kadazandusun.', populariti: 68, nilai: 3 }],
      bahagian: [{ kod: 'pbs_ncr', tajuk: 'Selesaikan tuntutan tanah adat (NCR)', penerangan: 'Ramai penduduk kampung belum mendapat geran tanah adat.', populariti: 70, nilai: 4 }],
      pau: [{ kod: 'pbs_ma63', tajuk: 'Pertahankan hak Sabah di bawah MA63', penerangan: 'PBS mahu autonomi Sabah dipulihkan sepenuhnya.', populariti: 70, nilai: 4 }]
    },
    UPKO: {
      cawangan: [{ kod: 'upko_mahkamah', tajuk: 'Kukuhkan Mahkamah Anak Negeri', penerangan: 'Kes adat kampung memerlukan Mahkamah Anak Negeri yang lebih berkesan.', populariti: 64, nilai: 3 }],
      bahagian: [{ kod: 'upko_geran', tajuk: 'Percepat geran tanah adat', penerangan: 'Bahagian mahu ukur dan geran tanah adat diselesaikan.', populariti: 68, nilai: 4 }],
      pau: [{ kod: 'upko_pedalaman', tajuk: 'Pembangunan pedalaman Kadazandusun Murut', penerangan: 'Jalan, air dan sekolah untuk kawasan pedalaman.', populariti: 68, nilai: 3 }]
    },
    LDP: {
      cawangan: [{ kod: 'ldp_keselamatan', tajuk: 'Keselamatan kawasan bandar', penerangan: 'Penduduk mahu rondaan polis yang lebih kerap.', populariti: 64, nilai: 3 }],
      bahagian: [{ kod: 'ldp_sekolah', tajuk: 'Bantuan untuk sekolah Cina di Sabah', penerangan: 'Sekolah Cina memerlukan peruntukan baik pulih.', populariti: 66, nilai: 3 }],
      pau: [{ kod: 'ldp_pelancongan', tajuk: 'PKS dan pelancongan Kota Kinabalu dan Sandakan', penerangan: 'LDP mahu insentif untuk peniaga kecil dan sektor pelancongan.', populariti: 66, nilai: 3 }]
    },
    PHRS: {
      cawangan: [{ kod: 'phrs_nelayan', tajuk: 'Bantuan untuk nelayan Tawau', penerangan: 'Nelayan pantai timur memerlukan subsidi minyak dan peralatan.', populariti: 66, nilai: 3 }],
      bahagian: [{ kod: 'phrs_pati', tajuk: 'Tangani isu PATI di pantai timur', penerangan: 'Penduduk mahu penguatkuasaan yang lebih tegas.', populariti: 66, nilai: 3 }],
      pau: [{ kod: 'phrs_esszone', tajuk: 'Kukuhkan keselamatan pantai timur (ESSZONE)', penerangan: 'Kawalan keselamatan perairan Sabah perlu ditambah.', populariti: 66, nilai: 3 }]
    },
    PCS: {
      cawangan: [{ kod: 'pcs_belia', tajuk: 'Program belia luar bandar', penerangan: 'Belia kampung memerlukan latihan kemahiran dan peluang kerja.', populariti: 64, nilai: 3 }],
      bahagian: [{ kod: 'pcs_anak_negeri', tajuk: 'Lindungi identiti Anak Negeri Sabah', penerangan: 'Status Anak Negeri perlu dilindungi dalam dasar negeri.', populariti: 66, nilai: 3 }],
      pau: [{ kod: 'pcs_autonomi', tajuk: 'Autonomi dan kedaulatan Sabah', penerangan: 'Mesyuarat mendesak lebih banyak kuasa dikembalikan kepada Sabah.', populariti: 68, nilai: 3 }]
    },
    PBB: {
      cawangan: [
        { kod: 'pbb_elektrik', tajuk: 'Bekalan elektrik dan air ke kampung luar bandar', penerangan: 'Beberapa kampung masih menggunakan janakuasa sendiri dan air hujan.', populariti: 70, nilai: 4 },
        { kod: 'pbb_jalan', tajuk: 'Jalan penghubung kampung ke bandar', penerangan: 'Penduduk mengambil masa berjam-jam ke klinik dan sekolah.', populariti: 66, nilai: 3 }
      ],
      bahagian: [
        { kod: 'pbb_ncr', tajuk: 'Percepat ukur dan geran tanah adat (NCR)', penerangan: 'Cawangan mahu tanah adat penduduk diukur di bawah Seksyen 6 Kanun Tanah.', populariti: 68, nilai: 4 },
        { kod: 'pbb_belia', tajuk: 'Peluang kerja belia dalam ekonomi hijau Sarawak', penerangan: 'Belia mahu latihan dalam projek tenaga hidrogen dan hidro.', populariti: 62, nilai: 3 }
      ],
      pau: [
        { kod: 'pbb_ma63', tajuk: 'Tuntutan hak Sarawak di bawah MA63', penerangan: 'Perhimpunan menuntut hak hasil minyak dan gas serta autonomi Sarawak.', populariti: 72, nilai: 4 },
        { kod: 'pbb_pcds', tajuk: 'Strategi Pembangunan Pasca-COVID 2030 (PCDS)', penerangan: 'Sarawak maju berpendapatan tinggi menjelang 2030.', populariti: 64, nilai: 3 }
      ]
    },
    PRS: {
      cawangan: [
        { kod: 'prs_rumah_panjang', tajuk: 'Baik pulih rumah panjang dan bekalan air graviti', penerangan: 'Rumah panjang usang memerlukan bantuan dan bekalan air bersih.', populariti: 70, nilai: 4 },
        { kod: 'prs_jalan', tajuk: 'Jalan ke rumah panjang di hulu sungai', penerangan: 'Penduduk masih bergantung kepada bot dan jalan balak.', populariti: 66, nilai: 3 }
      ],
      bahagian: [{ kod: 'prs_ncr', tajuk: 'Lindungi tanah adat (NCR) masyarakat Dayak', penerangan: 'Bahagian mahu pertikaian tanah adat diselesaikan dengan adil.', populariti: 68, nilai: 4 }],
      pau: [{ kod: 'prs_dayak', tajuk: 'Penyatuan politik masyarakat Dayak dalam GPS', penerangan: 'PRS mahu suara Dayak lebih kuat dalam kerajaan Sarawak.', populariti: 64, nilai: 3 }]
    },
    SUPP: {
      cawangan: [
        { kod: 'supp_sekolah', tajuk: 'Peruntukan negeri untuk sekolah Cina di Sarawak', penerangan: 'Sekolah Cina bantuan dan persendirian memerlukan geran tahunan negeri.', populariti: 70, nilai: 4 },
        { kod: 'supp_pasar', tajuk: 'Naik taraf pasar dan tapak penjaja bandar', penerangan: 'Peniaga kecil mahu kemudahan pasar yang bersih dan selamat.', populariti: 64, nilai: 3 }
      ],
      bahagian: [{ kod: 'supp_uec', tajuk: 'Kekalkan pengiktirafan UEC oleh kerajaan Sarawak', penerangan: 'Lepasan UEC boleh berkhidmat dalam perkhidmatan awam negeri.', populariti: 68, nilai: 3 }],
      pau: [{ kod: 'supp_pks', tajuk: 'Insentif PKS dan pelaburan di bandar Sarawak', penerangan: 'SUPP mahu peniaga kecil mendapat manfaat daripada pertumbuhan ekonomi negeri.', populariti: 64, nilai: 3 }]
    },
    PDP: {
      cawangan: [{ kod: 'pdp_rumah', tajuk: 'Rumah mampu milik di Miri dan Bintulu', penerangan: 'Harga rumah di bandar industri terlalu tinggi bagi pekerja tempatan.', populariti: 66, nilai: 3 }],
      bahagian: [{ kod: 'pdp_kerja', tajuk: 'Utamakan pekerja tempatan dalam projek industri', penerangan: 'Projek petrokimia dan tenaga perlu mengambil anak Sarawak.', populariti: 66, nilai: 3 }],
      pau: [{ kod: 'pdp_bandar', tajuk: 'Pembangunan seimbang bandar dan luar bandar utara Sarawak', penerangan: 'Kemudahan di Miri, Bintulu dan pedalaman Baram perlu ditambah.', populariti: 64, nilai: 3 }]
    },
    PAS: {
      cawangan: [
        { kod: 'pas_tahfiz', tajuk: 'Kelas pengajian dan tahfiz di surau kawasan', penerangan: 'Ibu bapa mahu kelas al-Quran dan fardu ain yang tetap untuk anak-anak.', populariti: 72, nilai: 4 },
        { kod: 'pas_banjir', tajuk: 'Tabung dan pasukan bantuan mangsa banjir', penerangan: 'Banjir tahunan memerlukan pasukan sukarela dan bekalan kecemasan yang tersusun.', populariti: 68, nilai: 3 },
        { kod: 'pas_air', tajuk: 'Desak bekalan air bersih yang konsisten', penerangan: 'Penduduk masih berdepan air keruh dan gangguan bekalan.', populariti: 66, nilai: 3 }
      ],
      bahagian: [
        { kod: 'pas_jentera_pn', tajuk: 'Jentera bersama PN dengan BERSATU di kerusi campuran', penerangan: 'Kawasan mahu jentera PAS dan BERSATU digabungkan sebelum pilihan raya.', populariti: 62, nilai: 3 },
        { kod: 'pas_pondok', tajuk: 'Dana pendidikan pondok dan maahad tahfiz', penerangan: 'Institusi pondok dan tahfiz memerlukan sumbangan tetap dan kemudahan asrama.', populariti: 67, nilai: 3 },
        { kod: 'pas_tarbiyah', tajuk: 'Program tarbiyah untuk ahli baharu', penerangan: 'Ahli baharu perlu usrah dan kefahaman perjuangan sebelum diberi tugas.', populariti: 64, nilai: 2 }
      ],
      pau: [
        { kod: 'pas_rang355', tajuk: 'Pindaan Akta 355: perluas bidang kuasa Mahkamah Syariah', penerangan: 'Muktamar mendesak hukuman Mahkamah Syariah dipertingkat melalui pindaan akta.', populariti: 70, nilai: 3 },
        { kod: 'pas_ekonomi_islam', tajuk: 'Kewangan dan ekonomi Islam untuk rakyat', penerangan: 'Pembiayaan patuh syariah dan zakat produktif bagi golongan miskin.', populariti: 66, nilai: 3 },
        { kod: 'pas_royalti', tajuk: 'Hak royalti minyak Kelantan dan Terengganu', penerangan: 'PAS menuntut bayaran royalti minyak kepada kerajaan negeri secara terus.', populariti: 68, nilai: 3 }
      ]
    },
    PBRS: {
      cawangan: [
        { kod: 'pbrs_air', tajuk: 'Bekalan air bersih untuk kampung pedalaman', penerangan: 'Kampung di pedalaman Pensiangan masih bergantung kepada air sungai.', populariti: 72, nilai: 4 },
        { kod: 'pbrs_jalan', tajuk: 'Naik taraf jalan balak ke jalan berturap', penerangan: 'Jalan kampung sukar dilalui pada musim hujan.', populariti: 68, nilai: 3 },
        { kod: 'pbrs_ketua_kampung', tajuk: 'Naikkan elaun ketua kampung dan JKKK', penerangan: 'Ketua kampung menanggung kos sendiri untuk urusan penduduk.', populariti: 62, nilai: 2 }
      ],
      bahagian: [
        { kod: 'pbrs_ncr', tajuk: 'Percepat pengukuran dan geran tanah adat (NCR)', penerangan: 'Ramai penduduk asal masih menunggu geran tanah adat mereka.', populariti: 70, nilai: 4 },
        { kod: 'pbrs_internet', tajuk: 'Menara telekomunikasi di kawasan pedalaman', penerangan: 'Pelajar dan peniaga kecil tidak mendapat liputan internet.', populariti: 64, nilai: 3 }
      ],
      pau: [
        { kod: 'pbrs_ma63', tajuk: 'Tuntutan hak Sabah di bawah MA63', penerangan: 'PBRS mahu hak hasil dan autonomi Sabah dipulihkan sepenuhnya.', populariti: 70, nilai: 4 },
        { kod: 'pbrs_orang_asal', tajuk: 'Dasar pembangunan masyarakat Orang Asal Sabah', penerangan: 'Pendidikan, kesihatan dan ekonomi luar bandar untuk masyarakat Kadazandusun dan Murut.', populariti: 67, nilai: 3 }
      ]
    }
  };
  var TEMA_PARTI = {
    MCA: ['Suara Masyarakat Cina dalam Kerajaan', 'Ekonomi dan Pendidikan untuk Semua', 'MCA Bangkit Semula'],
    MIC: ['Memperkasa Masyarakat India', 'Pendidikan dan Peluang untuk Generasi Baharu', 'MIC Bersama Rakyat'],
    PPP: ['Politik Berbilang Kaum', 'Keadilan Sosial untuk Rakyat Bandar'],
    PBRS: ['Hak Orang Asal Sabah', 'Pembangunan Pedalaman dan MA63'],
    PAS: ['Islam Memimpin', 'Kepimpinan Ulamak', 'Malaysia Sejahtera'],
    BERJASA: ['Malaysia Bermaruah dan Berhikmat', 'Gandingan Profesional, Ulama dan Orang Muda'], WARISAN: ['Bangsa Kita, Warisan Kita, Masa Depan Kita'],
    GAGASAN: ['Sabah Maju Jaya', 'Parti Tempatan untuk Sabah'], PBS: ['Hak Anak Negeri Sabah', 'Perpaduan Masyarakat Sabah'], UPKO: ['Suara Kadazandusun Murut', 'Sabah Berautonomi'],
    LDP: ['Ekonomi Terbuka Sabah', 'Liberal dan Demokratik'], PHRS: ['Sabah untuk Rakyat Sabah'], PCS: ['Demi Autonomi dan Kedaulatan Sabah'],
    PBB: ['Sarawak Maju dan Sejahtera', 'Hak Sarawak di bawah MA63'],
    PRS: ['Dayak Bersatu', 'Pembangunan Luar Bandar'],
    SUPP: ['Sarawak untuk Semua', 'Masyarakat Majmuk Sarawak'],
    PDP: ['Perjuangan Rakyat, Sarawak Diutamakan'],
    PKR: ['Reformasi', 'Malaysia MADANI'],
    DAP: ['Malaysian Malaysia', 'Integriti dan Kecekapan'],
    AMANAH: ['Rahmatan lil Alamin', 'Negara Rahmah']
  };
  var TIADA_UMUM = { PBS: ['dewan_surau'], UPKO: ['dewan_surau'], LDP: ['dewan_surau'], MCA: ['dewan_surau'], MIC: ['dewan_surau'], PPP: ['dewan_surau'], PBRS: ['dewan_surau'], PRS: ['dewan_surau'], SUPP: ['dewan_surau'], PDP: ['dewan_surau'] };   // usul umum yang tidak sesuai dengan komuniti parti
  /* v13.22 (mockup "Ucapan Dasar Presiden", dipersetujui; maklum balas 3 pemain): pemain Presiden menyampaikan Ucapan Dasar sendiri.
     Kos 2 AP; perwakilan mengundi sokongan (>= 50% diterima: kesan penuh + IP 20; < 50%: Reputasi separuh, penentang +5). Angka ialah andaian. */
  var TEMA_PRESIDEN = [
    { kod: 'perpaduan', ikon: '🤝', nama: 'Perpaduan dan Pembangunan', ringkas: 'Reputasi +3 · hubungan gabungan +3', reputasi: 3, hubungan: 3, mod: 5 },
    { kod: 'ekonomi', ikon: '💰', nama: 'Ekonomi Rakyat', ringkas: 'Reputasi +2 · akar umbi +4 · sentimen nasional +1', reputasi: 2, kesetiaan: { akarUmbi: 4 }, sentimen: 1, mod: 5 },
    { kod: 'kesinambungan', ikon: '🔄', nama: 'Kesinambungan dan Pembaharuan', ringkas: 'Reputasi +2 · sokongan perwakilan +5', reputasi: 2, kesetiaan: { perwakilan: 5 }, mod: 5 },
    { kod: 'akar_umbi', ikon: '🌾', nama: 'Parti Dekat dengan Akar Umbi', ringkas: 'Reputasi +1 · akar umbi +6 · kesetiaan Ketua Cawangan +3', reputasi: 1, kesetiaan: { akarUmbi: 6, ketuaCawangan: 3 }, mod: 5 },
    { kod: 'serang', ikon: '⚔️', nama: 'Serang Pembangkang', ringkas: 'Berisiko: 60% Reputasi +5; 40% Reputasi −3 dan tular negatif', reputasi: 5, gagal: { peluang: 0.4, reputasi: -3, tular: true }, mod: -5 },
    { kod: 'reformasi', ikon: '🧹', nama: 'Reformasi Dalaman', ringkas: 'Reputasi +5 · penentang dalam parti +8 · sokongan AJK −3', reputasi: 5, kesetiaan: { penentang: 8, ajk: -3 }, mod: -5 }
  ];
  var UCAPAN = { ap: 2, ip: 20, ambang: 50, penentangKurang: 5 };

  /* ------------------------------------------------------------------------
     2. PEMBANTU
     ------------------------------------------------------------------------ */
  function salin(o) { return JSON.parse(JSON.stringify(o)); }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function gagal(kod, ralat) { return { ok: false, kod: kod, ralat: ralat }; }

  function normal(rng, min, sd) {
    var u = 1 - rng(), v = rng();
    return min + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function peringkatJawatan(jawatan) {
    var j = String(jawatan || '');
    if (/Bahagian/i.test(j)) { return 'bahagian'; }
    if (/Cawangan/i.test(j)) { return 'cawangan'; }
    return 'pusat';
  }

  /** v6.0: sayap pemain (pemuda | puteri | wanita) atau null (laluan Utama). */
  function sayapPemain(p) {
    var Sy = typeof globalThis !== 'undefined' ? globalThis.MyPolitikSayap : null;
    if (Sy && Sy.sayapJawatan) { return Sy.sayapJawatan(p); }
    return J && J.sayapPemain ? J.sayapPemain(p) : null;
  }
  var NAMA_SAYAP = { pemuda: 'Pemuda', puteri: 'Puteri', wanita: 'Wanita', putera: 'Putera' };
  /** Namakan Mesyuarat Sayap mengikut sayap pemain. */
  function labelSayap(p) {
    var s = sayapPemain(p), N = s ? NAMA_SAYAP[s] : 'Sayap', u = 'Usul Isu Golongan ' + N;
    PERINGKAT.sayap_cawangan.nama = 'Persidangan Tahunan ' + N + ' Cawangan';
    PERINGKAT.sayap_bahagian.nama = 'Mesyuarat Perwakilan ' + N + ' Bahagian';
    PERINGKAT.sayap_pau.nama = 'Perhimpunan ' + N + ' (Pra-PAU)';
    PERINGKAT.pau.nama = jenisPusat(p) === 'persidangan' ? 'Persidangan Parti DAP' : 'Perhimpunan Agung UMNO (PAU)';   // v13.62: DAP Persidangan Parti (Fasal IX.1)
    ['sayap_cawangan', 'sayap_bahagian', 'sayap_pau'].forEach(function (k) { PERINGKAT[k].jenisUsul = u; });
  }

  function keadaanMesyuarat(p) {
    var m = p.mesyuarat;
    if (!m || m.tahun !== kunci(p)) { return { tahun: kunci(p), cawangan: null, bahagian: null, pau: null }; }   // peringkat sayap_* dicipta apabila dimulakan
    return salin(m);
  }

  /* v13.5: UMNO (js/umno.js): kunci mesyuarat tahunan (musim pemilihan khas mendapat set mesyuarat baharu) dan Pusat diundi di Bahagian. */
  function umnoM() { var g = typeof globalThis !== 'undefined' ? globalThis : null; if (g && g.MyPolitikUMNO) { return g.MyPolitikUMNO; } try { return typeof require === 'function' ? require('./umno.js') : null; } catch (e) { return null; } }
  function kunci(p) { var U = umnoM(); return U && U.kunciMesyuarat ? U.kunciMesyuarat(p) : p.tahun; }
  /** v13.61: tetapan mesyuarat parti (js/struktur.js): gabungMesyuarat, g10, tanpaG2, wakilDewanPA. */
  function mz(p, k) { var St = typeof globalThis !== 'undefined' ? globalThis.MyPolitikStruktur : null; return St && St.mesyuarat ? St.mesyuarat(p, k) : null; }
  /** v13.62: DAP Fasal VIII.1(b), IX.1: 'kongres' (tahun pemilihan), 'persidangan' (tahun berikutnya, ANDAIAN) atau null. Parti lain: 'kongres'. */
  function jenisPusat(p) {
    var pb = mz(p, 'pusatBerkala'); if (!pb) { return 'kongres'; }
    if (E && E.adalahTahunPemilihan(p.tahun)) { return 'kongres'; }
    if (pb === 'pemilihan') { return null; }                                       // v13.64: PBB: Perhimpunan Agung setiap 3 tahun (tahun pemilihan sahaja)
    return E && E.adalahTahunPemilihan(p.tahun - 1) ? 'persidangan' : null;
  }
  function pusatDiBahagian(p) { var U = umnoM(); return !!(U && U.baharu && U.baharu(p)); }
  function pemilihanAktif(p) { return !!(E && E.adalahTahunPemilihan(p.tahun)); }

  /** Adakah mesyuarat peringkat ini mengadakan pengundian? Perwakilan: setiap tahun. Pusat (PAU): tahun pemilihan sahaja. */
  function adaPemilihan(p, peringkat) { if (peringkat === 'sayap_pau' && E && mz(p, 'wakilDewanPA') && sayapPemain(p)) { return true; } return !!E && ((peringkat === 'pau' || peringkat === 'sayap_pau') ? pemilihanAktif(p) && !pusatDiBahagian(p) : true); }   // v13.61: PAS: Muktamar Dewan memilih wakil ke Muktamar setiap tahun   // v13.5: PAU UMNO tiada undi jawatan   // v6.2: sayap Cawangan dan Bahagian memilih wakil

  function pegangan(p) {
    if (J) { return { per: J.peringkatTertinggi(p), pw: J.perwakilanSah(p, 'cawangan'), pp: J.perwakilanSah(p, 'bahagian'), exB: J.exOfficio(p, 'bahagian'), exP: J.exOfficio(p, 'pau') }; }
    var per = p.jawatan === 'Ahli Biasa' ? null : peringkatJawatan(p.jawatan), perw = E ? E.getKeadaanPemilihan(p).perwakilan : { cawangan: false, bahagian: false };
    return { per: per, pw: { sah: perw.cawangan }, pp: { sah: perw.bahagian },
             exB: { sah: per === 'bahagian' || per === 'pusat', sumber: p.jawatan }, exP: { sah: per === 'pusat' || p.jawatan === 'Ketua Bahagian', sumber: p.jawatan } };
  }

  /** Siapa boleh hadir. Bahagian dan PAU: perwakilan TAHUN INI atau pemegang jawatan ex-officio. */
  function bolehHadir(p, peringkat) {
    if (peringkat === 'cawangan') { return { ok: true }; }
    if (adalahSayap(peringkat)) {                                         // v6.1: mesyuarat sayap
      if (!sayapPemain(p)) { return { ok: false, sebab: 'Mesyuarat sayap hanya untuk laluan sayap (Pemuda, Puteri atau Wanita). Laluan anda ialah Utama / Induk.' }; }
      if (peringkat === 'sayap_cawangan') {                                   // mesyuarat peringkat Cawangan: semua ahli sayap boleh hadir
        var gmH = mz(p, 'gabungMesyuarat'); if (gmH && gmH.cawangan === 'sayap_cawangan') { return { ok: false, sebab: 'Tiada mesyuarat sayap Cawangan berasingan: Ketua Jawatankuasa ' + NAMA_SAYAP[sayapPemain(p)] + ' Cawangan dipilih dalam Persidangan Tahunan Cawangan.' }; }   // v13.61: PAS Fasal 44(2)
        return { ok: true };
      }
      var gs = pegangan(p), pws = p.perwakilan || {}, N = NAMA_SAYAP[sayapPemain(p)];
      if (peringkat === 'sayap_bahagian') {                                  // hanya wakil sayap Cawangan tahun ini atau pemegang jawatan Bahagian/Pusat
        return (pws.sayapCawangan === p.tahun || gs.exB.sah || (J && J.pegang && J.pegang(p, 'sayap_cawangan_' + sayapPemain(p)))) ? { ok: true }
          : { ok: false, sebab: 'Hanya wakil ' + N + ' Cawangan tahun ' + p.tahun + ' yang terpilih, Ketua ' + N + ' Cawangan dan pemegang jawatan Bahagian/Pusat boleh hadir Mesyuarat Perwakilan ' + N + ' Bahagian.' };
      }
      return (pws.g2 === p.tahun || gs.exP.sah || (J && J.pegang && J.pegang(p, 'sayap_bahagian_' + sayapPemain(p)))) ? { ok: true }               // sayap_pau: G2 tahun ini atau pemegang jawatan ex-officio
        : { ok: false, sebab: 'Hanya G2 ' + N + ' (2 wakil Bahagian) tahun ' + p.tahun + ', Ketua ' + N + ' Bahagian, Ketua Bahagian dan pemegang jawatan Pusat boleh hadir Perhimpunan ' + N + ' Pusat.' };
    }
    var g = pegangan(p);
    if (peringkat === 'bahagian' && mz(p, 'hadirSemuaBahagian')) { return { ok: true }; }                 // v13.62: PKR Fasal 33.2: semua anggota Cabang
    if (peringkat === 'bahagian' && mz(p, 'jpkpSahaja')) {                                                  // v13.62: DAP Fasal XIX.1: ahli JPKP sahaja
      return g.exB.sah ? { ok: true } : { ok: false, sebab: 'Hanya ahli JPKP (Ahli Parlimen, ADUN, Ketua Pemuda / Wanita dan Pengerusi Cawangan) boleh hadir MB JPKP.' };
    }
    if ((peringkat === 'pau' || peringkat === 'sayap_pau') && mz(p, 'pusatBerkala') && !jenisPusat(p)) {
      return { ok: false, sebab: mz(p, 'pusatBerkala') === 'pemilihan' ? 'Tiada Perhimpunan Agung UMNO (PAU) tahun ini: Perhimpunan Agung diadakan setiap ' + ((mz(p, 'kitaran') || {}).tahun || 3) + ' tahun, pada tahun pemilihan parti.' : 'Tiada Kongres Kebangsaan atau Persidangan Parti tahun ini: Kongres diadakan setiap 3 tahun dan Persidangan Parti 18 bulan selepasnya.' };
    }
    if (peringkat === 'bahagian') {
      return (g.pw.sah || g.exB.sah || (p.perwakilan && p.perwakilan.g10 === p.tahun)) ? { ok: true }
        : { ok: false, sebab: 'Hanya Perwakilan Cawangan atau G10 sayap tahun ' + p.tahun + ' yang terpilih, Ketua Cawangan dan pemegang jawatan Bahagian/Pusat boleh hadir. Mandat tahun lepas sudah luput.' };
    }
    return (g.pp.sah || g.exP.sah || (p.perwakilan && p.perwakilan.dewanMuktamar === p.tahun)) ? { ok: true }
      : { ok: false, sebab: 'Hanya Perwakilan Bahagian tahun ' + p.tahun + ' yang terpilih, Ketua Bahagian dan pemegang jawatan Pusat boleh hadir PAU.' };
  }

  /* ---- Takwim bulanan (js/calendar.js, pilihan) ---- */
  function kalendar() { var g = typeof globalThis !== 'undefined' ? globalThis : null; return g && g.MyPolitikCalendar ? g.MyPolitikCalendar : null; }
  function tetingkap(p, peringkat) { var K = kalendar(); return K ? K.getTetingkap(peringkat, p.bulan) : null; }

  function statusPeringkat(p, ms, peringkat) {
    var s = ms[peringkat];
    if (s && s.status === 'selesai') { return { status: 'selesai', sebab: '' }; }
    if (s && s.status === 'sedang') { return { status: 'sedang', sebab: '' }; }
    var w = tetingkap(p, peringkat);
    var EtH = typeof globalThis !== 'undefined' ? globalThis.MyPolitikEtika : null;   // v8.0: hak keahlian (gantung/pecat) disemak dahulu, sama seperti mulaMesyuarat()
    if (EtH) { var hk = EtH.semakHak(p, 'perwakilan'); if (!hk.boleh) { return { status: 'tidak_layak', sebab: hk.sebab }; } }
    var h = bolehHadir(p, peringkat);
    if (!h.ok) { return { status: 'tidak_layak', sebab: h.sebab }; }          // kelayakan disemak dahulu supaya sebab sebenar dipaparkan
    if (w && w.status === 'belum_tiba') {
      return { status: 'belum_tiba', sebab: PERINGKAT[peringkat].nama + ' dibuka pada ' + w.label.toLowerCase() + '. Sekarang bulan ' + p.bulan + '.' +
        (peringkat !== 'cawangan' ? ' Anda layak hadir.' : '') };
    }
    if (w && w.status === 'tamat') {
      return { status: 'terlepas', sebab: 'Musim ' + PERINGKAT[peringkat].nama + ' (' + w.label.toLowerCase() + ') tahun ' + p.tahun + ' sudah tamat.' };
    }
    var sy = SAYAP_UNTUK[peringkat];                                            // v6.1: mesyuarat utama terkunci sehingga mesyuarat sayap selesai
    if (sy && sayapPemain(p) && bolehHadir(p, sy).ok && !(ms[sy] && ms[sy].status === 'selesai')) {
      return { status: 'terkunci', sebab: 'Mulakan dan selesaikan ' + PERINGKAT[sy].nama + ' dahulu. Sayap anda membawa satu usul ke ' + PERINGKAT[peringkat].nama + '.' };
    }
    for (var i = 0; !w && i < URUTAN.indexOf(peringkat); i++) {            // tanpa takwim: urutan peringkat dikuatkuasakan
      var sebelum = URUTAN[i], ss = ms[sebelum];
      if (bolehHadir(p, sebelum).ok && !(ss && ss.status === 'selesai')) {
        return { status: 'terkunci', sebab: 'Selesaikan ' + PERINGKAT[sebelum].nama + ' dahulu.' };
      }
    }
    return { status: 'boleh_mula', sebab: '' };
  }

  /** v13.60: senarai jawatan Pusat utama parti untuk tajuk agenda (UMNO: "Presiden, Timbalan Presiden, 3 Naib Presiden, MKT"). dan=true: "... dan MKT". */
  function senaraiPusat(p, dan) {
    var Eg = typeof globalThis !== 'undefined' ? globalThis.MyPolitikElection : null;
    var x = J ? J.katalogUntuk(p).filter(function (d) { return d.peringkat === 'pusat' && d.kumpulan === 'utama'; }).sort(function (a, b) { return b.pangkat - a.pangkat; }).map(function (d) {
      if (d.kod === 'ahli_mkt') { return 'MKT'; }
      var n = Eg && Eg.kerusiParti ? Eg.kerusiParti(p, d) : d.kerusi || 1; return n > 1 ? n + ' ' + d.jawatan : d.jawatan;
    }) : ['Presiden', 'Timbalan Presiden', '3 Naib Presiden', 'MKT'];
    return dan && x.length > 1 ? x.slice(0, -1).join(', ') + ' dan ' + x[x.length - 1] : x.join(', ');
  }
  /** v13.60: peranan jawatan sayap yang dipertandingkan pada aras itu (UMNO: "Ketua, Naib Ketua, AJK"). dan=true: "Ketua, Naib Ketua dan AJK". */
  function peranSayap(p, aras, dan) {
    var w = sayapPemain(p), PR = [['sayap_' + aras + '_', 'Ketua'], ['sayap_timbalan_' + aras + '_', 'Timbalan Ketua'], ['sayap_naib_' + aras + '_', 'Naib Ketua'], ['sayap_ajk_' + aras + '_', 'AJK']];
    var ada = J ? J.katalogUntuk(p).map(function (d) { return d.kod; }) : null;
    var x = PR.filter(function (r) { return !ada || ada.indexOf(r[0] + w) >= 0; }).map(function (r) { return r[1]; });
    if (!x.length) { x = ['Ketua']; }
    return dan && x.length > 1 ? x.slice(0, -1).join(', ') + ' dan ' + x[x.length - 1] : x.join(', ');
  }
  /** v13.60: bilangan hadir Mesyuarat Bahagian / Perhimpunan Agung dikira daripada kuota wakil sebenar parti (bukan 125 / 1,500 tetap). */
  function hadirKira(p, peringkat) {
    var Eg = typeof globalThis !== 'undefined' ? globalThis.MyPolitikElection : null; if (!Eg || !Eg.kuotaBahagian) { return null; }
    var kodM = /^(GAGASAN|PBS|UPKO|LDP|PHRS|PCS)$/.test(p.parti || '') ? 'MyPolitikGRS' : { BERJASA: 'MyPolitikBERJASA', WARISAN: 'MyPolitikWarisan', MCA: 'MyPolitikMCA', MIC: 'MyPolitikMIC', PPP: 'MyPolitikPPP', PBRS: 'MyPolitikPBRS', UMNO: 'MyPolitikUMNO', PAS: 'MyPolitikPAS', PKR: 'MyPolitikPKR', DAP: 'MyPolitikDAP', AMANAH: 'MyPolitikAmanah' }[p.parti || 'UMNO'];
    var pas = p.parti === 'PAS';                                                   // v13.61: PAS Fasal 18(4): + Yang Dipertua Kawasan, 100 wakil Dewan, JK Pusat dan Majlis Syura; 19(4)(e): 45 wakil Dewan di Kawasan
    var M = kodM && typeof globalThis !== 'undefined' ? globalThis[kodM] : null, rp = null;
    if (M && M.ringkasPusat) { try { rp = M.ringkasPusat(p); } catch (e) { rp = null; } }
    if (!rp && mz(p, 'bilBahagian')) { rp = { bilBahagian: mz(p, 'bilBahagian') }; }   // v13.64: parti Sarawak tanpa modul Pusat (PBB 82, PRS 34, SUPP 20, PDP 15 DUN)
    var nB = rp && rp.bilBahagian; if (!nB) { return null; }
    var St = globalThis.MyPolitikStruktur, had = St && St.hadPA ? St.hadPA(p) : null;
    if ((kodM === 'MyPolitikBERJASA' || kodM === 'MyPolitikWarisan') && rp && rp.pengundi && (peringkat === 'pau' || peringkat === 'sayap_pau')) { return peringkat === 'pau' ? rp.pengundi : Math.max(30, Math.round(rp.pengundi / 4)); }   // v13.68: BERJASA / Warisan: perwakilan modul parti
    if (kodM === 'MyPolitikGRS' && rp && rp.pengundi && (peringkat === 'pau' || peringkat === 'sayap_pau')) { return peringkat === 'pau' ? rp.pengundi : Math.max(30, Math.round(rp.pengundi / 4)); }   // v13.66: GRS: perwakilan modul GRS
    if (p.parti === 'PKR' || p.parti === 'DAP' || p.parti === 'AMANAH') {      // v13.62: PH: PKR semua anggota Cabang (≈10% hadir, ANDAIAN); DAP ahli JPKP; Amanah 14.3; Pusat = perwakilan modul parti
      var nCw = (Eg.bilPemilih ? Eg.bilPemilih(p, 'bahagian') / Math.max(1, Eg.kuotaCawangan(p)) : 10);
      if (peringkat === 'bahagian') { return p.parti === 'PKR' ? Math.max(100, Math.round((Eg.ahliBahagian ? Eg.ahliBahagian(p) : 2000) * 0.1)) : p.parti === 'DAP' ? Math.max(10, Math.round(nCw) + 4) : Math.max(30, Math.round(nCw * 5) + 23 + 60); }
      if (peringkat === 'pau') { return p.parti === 'PKR' && !(E && E.adalahTahunPemilihan(p.tahun)) ? nB * 10 + 150 : (rp.pengundi || nB * 5); }
      if (peringkat === 'sayap_pau') { return Math.max(40, Math.round((rp.pengundi || nB * 5) / 5)); }
    }
    if (peringkat === 'bahagian') { return Eg.bilPemilih ? Math.max(30, Math.round(Eg.bilPemilih(p, 'bahagian')) + 20 + (pas ? 45 : 0)) : null; }
    if (peringkat === 'pau') { var n = Eg.kuotaBahagian(p) * nB + (pas ? nB + 150 : 40); return had ? Math.min(had, n) : n; }
    if (peringkat === 'sayap_pau') { return Math.max(40, Math.round((Eg.kuotaBahagian(p) * nB + 40) / 4)); }
    return null;
  }
  function bilHadir(p, peringkat) {
    var hk = (peringkat === 'bahagian' || peringkat === 'pau' || peringkat === 'sayap_pau') ? hadirKira(p, peringkat) : null; if (hk) { return hk; }
    if (peringkat === 'sayap_cawangan') {
      var Eh = typeof globalThis !== 'undefined' ? globalThis.MyPolitikElection : null;     // v6.3: hadir = 35% ahli sayap dalam Cawangan
      if (Eh && Eh.ahliSayap) { return Math.max(10, Math.round(Eh.ahliSayap(p) * CONFIG.TAHAP_HADIR_CAWANGAN)); }
      var j2 = p.cawanganInfo && p.cawanganInfo.jumlahAhli ? p.cawanganInfo.jumlahAhli : 100;
      return Math.max(20, Math.round(j2 * CONFIG.TAHAP_HADIR_SAYAP));
    }
    if (peringkat === 'cawangan') {
      var jumlah = p.cawanganInfo && p.cawanganInfo.jumlahAhli ? p.cawanganInfo.jumlahAhli : 100;
      return Math.max(30, Math.round(jumlah * CONFIG.TAHAP_HADIR_CAWANGAN));
    }
    return CONFIG.HADIR[peringkat];
  }

  /** v6.1: usul yang dibawa oleh sayap ke mesyuarat utama (daripada ringkasan mesyuarat sayap yang selesai), atau null. */
  function usulDibawa(p, peringkat) {
    var sk = SAYAP_UNTUK[peringkat], m = p.mesyuarat && p.mesyuarat.tahun === kunci(p) ? p.mesyuarat[sk] : null;
    return m && m.status === 'selesai' && m.ringkasan && m.ringkasan.usulDibawa ? m.ringkasan.usulDibawa : null;
  }

  /* ------------------------------------------------------------------------
     3. AGENDA
     ------------------------------------------------------------------------ */
  function janaAgenda(p, peringkat) {
    var rng = S.rngBerbenih(p.id + '|' + p.tahun + '|mesyuarat|' + peringkat);
    var agenda = [], pool = (adalahSayap(peringkat) ? (KOLAM[peringkat + '_' + sayapPemain(p)] || KOLAM[peringkat + '_pemuda']) : KOLAM[peringkat]).slice(), dipakai = {};
    var kp = !adalahSayap(peringkat) && KOLAM_PARTI[p.parti] ? (KOLAM_PARTI[p.parti][peringkat] || []).slice() : [], buang = TIADA_UMUM[p.parti] || [];   // v13.60: usul ikut komuniti parti
    if (buang.length) { pool = pool.filter(function (u) { return buang.indexOf(u.kod) < 0; }); }

    // Usul Lokaliti bermula daripada isu tempatan yang dicatat melalui Sembang Warung.
    if (peringkat === 'cawangan') {
      (p.isu || []).filter(function (i) { return !i.selesai; }).slice(0, 2).forEach(function (i) {
        agenda.push({
          id: 'cawangan-' + p.tahun + '-isu-' + i.kod, jenis: 'usul', kod: 'isu_' + i.kod, sumber: 'sembang_warung',
          tajuk: 'Atasi isu: ' + i.tajuk, penerangan: i.penerangan,
          populariti: clamp(55 + i.tahap * 5, 0, 100), nilai: i.tahap, status: 'terbuka', pilihan: null, keputusan: null
        });
        dipakai['isu_' + i.kod] = true;
      });
    }

    // v6.1: usul yang dibawa oleh sayap (lulus dalam mesyuarat sayap) ialah usul pertama dalam mesyuarat utama.
    var bawa = usulDibawa(p, peringkat);
    if (bawa) {
      agenda.push({
        id: peringkat + '-' + p.tahun + '-sayap-' + bawa.kod, jenis: 'usul', kod: bawa.kod, sumber: 'sayap', sayap: bawa.sayap,
        tajuk: 'Usul ' + NAMA_SAYAP[bawa.sayap] + ': ' + bawa.tajuk, penerangan: bawa.penerangan + ' (Dibawa oleh sayap ' + NAMA_SAYAP[bawa.sayap] + ' selepas diluluskan dalam mesyuarat sayap.)',
        populariti: clamp(bawa.populariti + 6, 5, 95), nilai: bawa.nilai, status: 'terbuka', pilihan: null, keputusan: null
      });
    }

    // Isi baki daripada kolam, susunan berbenih supaya tetap sepanjang tahun.
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    if (kp.length) {
      for (var i2 = kp.length - 1; i2 > 0; i2--) { var j2 = Math.floor(rng() * (i2 + 1)), t2 = kp[i2]; kp[i2] = kp[j2]; kp[j2] = t2; }
      pool = kp.slice(0, 2).concat(pool, kp.slice(2));
    }
    for (var k = 0; k < pool.length && agenda.length < CONFIG.BIL_USUL; k++) {
      var u = pool[k];
      agenda.push({
        id: peringkat + '-' + p.tahun + '-' + u.kod, jenis: 'usul', kod: u.kod, sumber: 'kolam',
        tajuk: u.tajuk, penerangan: u.penerangan,
        populariti: clamp(Math.round(u.populariti + (rng() * 16 - 8)), 5, 95), nilai: u.nilai,
        status: 'terbuka', pilihan: null, keputusan: null
      });
    }

    if (peringkat === 'pau') {
      agenda.push({
        id: 'pau-' + p.tahun + '-ucapan', jenis: 'ucapan_dasar', kod: 'ucapan_dasar', sumber: 'presiden',
        tajuk: 'Ucapan Dasar Presiden: ' + (function (t) { return t[Math.floor(rng() * t.length)]; })(TEMA_PARTI[p.parti] || TEMA_UCAPAN),
        penerangan: 'Presiden menyampaikan hala tuju parti. Perwakilan berbahas dan mengundi sokongan terhadap ucapan.' + (p.parti === 'LDP' ? ' Perhimpunan dipengerusikan oleh Speaker LDP.' : ''),   // v13.66: LDP ada Speaker dan Timbalan Speaker (Wikipedia)
        populariti: 72, nilai: 3, status: 'terbuka', pilihan: null, keputusan: null
      });
    }

    if (adaPemilihan(p, peringkat) && adalahSayap(peringkat)) {            // v6.2: pemilihan wakil sayap
      var Ns = NAMA_SAYAP[sayapPemain(p)], Es = typeof globalThis !== 'undefined' ? globalThis.MyPolitikElection : null;
      agenda.push({
        id: peringkat + '-' + p.tahun + '-pemilihan', jenis: 'pemilihan', kod: 'pemilihan_' + peringkat, sumber: 'pemilihan',
        tajuk: peringkat === 'sayap_cawangan' ? 'Pemilihan ' + (pemilihanAktif(p) ? peranSayap(p, 'cawangan') + ' ' + Ns + ' Cawangan dan ' : '') + 'wakil ' + Ns + ' Cawangan ke Mesyuarat Perwakilan ' + Ns + ' Bahagian (' + (Es && Es.kuotaSayapCawangan ? Es.kuotaSayapCawangan(p) : 3) + ' kerusi)'
                                              : peringkat === 'sayap_pau' ? (mz(p, 'wakilDewanPA') ? 'Pemilihan ' + (pemilihanAktif(p) ? peranSayap(p, 'pusat') + ' ' + Ns + ' (Pusat) dan ' : '') + mz(p, 'wakilDewanPA') + ' wakil ' + Ns + ' ke Perhimpunan Agung UMNO (PAU)' : 'Pemilihan ' + peranSayap(p, 'pusat', true) + ' ' + Ns + ' (Pusat)')
                                              : 'Pemilihan ' + (pemilihanAktif(p) ? peranSayap(p, 'bahagian') + ' ' + Ns + ' Bahagian, ' + (pusatDiBahagian(p) ? 'undi ' + peranSayap(p, 'pusat', true) + ' ' + Ns + ' Pusat, ' : '') : '') + (mz(p, 'tanpaG2') ? 'G' + mz(p, 'g10') + ' (' + mz(p, 'g10') + ' wakil ke Mesyuarat Perwakilan Bahagian)' : 'G10 (10 wakil ke Mesyuarat Perwakilan Bahagian) dan G2 (2 wakil ke Perhimpunan ' + Ns + ' Pusat)'),
        penerangan: 'Pengundian dijalankan apabila mesyuarat ditutup. Daftar pencalonan anda melalui tab Pemilihan sebelum itu.',
        kerusi: null, status: 'menunggu', keputusan: null
      });
    }
    else if (adaPemilihan(p, peringkat)) {
      var buka = pemilihanAktif(p), tajuk, perw = PERINGKAT[peringkat].perwakilan;
      var Eg = typeof globalThis !== 'undefined' ? globalThis.MyPolitikElection : null;      // kuota sebenar (Fasal 14.4.4 / 8.4.3)
      if (perw && Eg && Eg.kuotaCawangan) { perw = { kerusi: peringkat === 'cawangan' ? Eg.kuotaCawangan(p) : Eg.kuotaBahagian(p) }; }
      if (peringkat === 'cawangan') { tajuk = 'Pemilihan Cawangan: ' + (buka ? 'jawatan Cawangan, serta ' : '') + 'perwakilan ke Bahagian (' + perw.kerusi + ' kerusi)'; }
      else if (peringkat === 'bahagian') { tajuk = 'Pemilihan Bahagian: ' + (buka ? 'jawatan Bahagian, ' + (pusatDiBahagian(p) ? 'undi jawatan Pusat (' + senaraiPusat(p, true) + '), ' : '') + 'serta ' : '') + 'perwakilan ke PAU (' + perw.kerusi + ' kerusi)'; }
      else { tajuk = 'Pemilihan Pusat: ' + senaraiPusat(p) + ' dan Ketua Sayap'; }
      agenda.push({
        id: peringkat + '-' + p.tahun + '-pemilihan', jenis: 'pemilihan', kod: 'pemilihan_' + peringkat, sumber: 'pemilihan', tajuk: tajuk,
        penerangan: 'Pengundian dijalankan apabila mesyuarat ditutup. Daftar pencalonan anda melalui tab Pemilihan sebelum itu.',
        kerusi: perw ? perw.kerusi : null, status: 'menunggu', keputusan: null
      });
    }
    return agenda;
  }

  /* ------------------------------------------------------------------------
     4. MODEL KEPUTUSAN USUL
     ------------------------------------------------------------------------ */
  function pengaruhPemain(p, peringkat, peranan, pendirian) {
    if (pendirian !== 'sokong' && pendirian !== 'bantah') { return 0; }
    var tanda = pendirian === 'sokong' ? 1 : -1, ipN = Math.min(100, p.ip) / 100;
    var kes = PERINGKAT[peringkat].kesetiaan.map(function (k) { return p.kesetiaan[k]; });
    var lyl = kes.reduce(function (a, b) { return a + b; }, 0) / kes.length / 100;   // 0 hingga 1
    var asas = peranan === 'pembawa' ? 6 + 24 * ipN : (peranan === 'pembahas' ? 3 + 14 * ipN : 2);
    return tanda * asas * (0.6 + 0.8 * lyl);
  }

  function selesaikanUsul(usul, pengaruh, hadir, rng) {
    var sokongan = clamp(Math.round(usul.populariti + pengaruh + normal(rng, 0, CONFIG.SISIHAN_RAWAK)), 0, 100);
    var sokong = Math.round(hadir * clamp(sokongan / 100, 0.02, 0.98));
    return { lulus: sokong > hadir - sokong, sokongan: sokongan, hadir: hadir, undiSokong: sokong, undiBantah: hadir - sokong };
  }

  function kesanPeranan(peranan, pendirian, lulus, usul) {
    var padan = pendirian === 'sokong' || pendirian === 'bantah' ? ((pendirian === 'sokong') === lulus) : false;
    var ip = 0, reputasi = 0, g = CONFIG.GANJARAN_IP[peranan];
    if (peranan === 'pembawa') { ip = lulus ? g.lulus : g.ditolak; }
    else if (pendirian === 'berkecuali') { ip = 0; }
    else { ip = padan ? g.padan : g.tidakPadan; }
    if (padan) { reputasi = Math.round((pendirian === 'sokong' ? 1 : -1) * usul.nilai * CONFIG.KREDIT[peranan]); }
    return { ip: ip, reputasi: reputasi, padan: padan };
  }


  /* ------------------------------------------------------------------------
     4b. STATUS PERWAKILAN DAN LANGKAH SETERUSNYA
     ------------------------------------------------------------------------ */
  function bulanKe(p, peringkat) {
    var w = tetingkap(p, peringkat);
    return w ? { label: w.label, mula: w.mula, tamat: w.tamat, status: w.status, jarak: w.status === 'belum_tiba' ? w.mula - p.bulan : 0 } : null;
  }

  /**
   * Status kelayakan hadir ke Mesyuarat Perwakilan Bahagian dan PAU.
   * Pulang { bahagian:{layak,lencana,sumber,sebab,tetingkap}, pau:{...} }
   * lencana = "Perwakilan Bahagian" / "Perwakilan PAU" (null jika bukan perwakilan, cth. pemegang jawatan Bahagian).
   */
  function getStatusPerwakilan(profil) {
    var p = profil || S.loadPlayer();
    if (!p) { return null; }
    var g = pegangan(p);
    var b = { layak: false, lencana: null, sumber: '', sebab: '', tetingkap: bulanKe(p, 'bahagian') };
    if (g.pw.sah) { b.layak = true; b.lencana = 'Perwakilan Bahagian ' + p.tahun; b.sumber = 'Menang kerusi Perwakilan Cawangan ke Bahagian (sah tahun ' + p.tahun + ' sahaja)'; }
    else if (p.perwakilan && p.perwakilan.g10 === p.tahun) { b.layak = true; b.lencana = 'G10 ' + (NAMA_SAYAP[sayapPemain(p)] || 'Sayap') + ' ' + p.tahun; b.sumber = 'Terpilih dalam G10 (10 wakil sayap) di Mesyuarat Perwakilan Sayap Bahagian (sah tahun ' + p.tahun + ' sahaja)'; }
    else if (g.exB.sah) { b.layak = true; b.sumber = 'Ex-officio sebagai ' + g.exB.sumber; }
    else { b.sebab = (g.pw.luput ? 'Mandat perwakilan tahun lepas sudah luput. ' : '') + 'Menangi kerusi Perwakilan Cawangan semasa Persidangan Tahunan Cawangan (bulan 4-5) tahun ' + p.tahun + '.'; }

    var u = { layak: false, lencana: null, sumber: '', sebab: '', tetingkap: bulanKe(p, 'pau') };
    if (g.pp.sah) { u.layak = true; u.lencana = 'Perwakilan PAU ' + p.tahun; u.sumber = 'Menang kerusi Perwakilan Bahagian ke PAU (sah tahun ' + p.tahun + ' sahaja)'; }
    else if (g.exP.sah) { u.layak = true; u.sumber = 'Ex-officio sebagai ' + g.exP.sumber; }
    else { u.sebab = 'Menangi kerusi Perwakilan Bahagian semasa Mesyuarat Perwakilan Bahagian (bulan 6) tahun ' + p.tahun + ', atau pegang jawatan Ketua Bahagian / Pusat.'; }
    return { tahun: p.tahun, bulan: p.bulan, bahagian: b, pau: u };
  }

  /** Senarai langkah yang disyorkan selepas satu mesyuarat ditutup. */
  function langkahSeterusnya(p, peringkat) {
    var langkah = [], sp = getStatusPerwakilan(p), K = kalendar();
    function buka(sasaran, nama, st) {
      var w = st.tetingkap;
      if (st.layak) {
        langkah.push('Anda layak hadir ' + nama + (st.lencana ? ' sebagai ' + st.lencana : '') + '. ' +
          (w ? (w.status === 'dibuka' ? 'Dibuka sekarang (' + w.label.toLowerCase() + ').' : w.status === 'belum_tiba' ? 'Dibuka pada ' + w.label.toLowerCase() + ', ' + w.jarak + ' bulan lagi.' : 'Musim tahun ini sudah tamat.') : ''));
      } else { langkah.push('Anda belum layak hadir ' + nama + '. ' + st.sebab); }
    }
    if (adalahSayap(peringkat)) {                                          // v6.1: selepas mesyuarat sayap, mesyuarat utama dibuka
      var ut = INDUK[peringkat], db = usulDibawa(p, ut), wu = tetingkap(p, ut);
      langkah.push(db ? 'Usul "' + db.tajuk + '" diluluskan dan akan dibawa oleh sayap anda ke ' + PERINGKAT[ut].nama + '.' : 'Tiada usul sayap yang diluluskan, jadi tiada usul sayap dibawa ke ' + PERINGKAT[ut].nama + '.');
      var pw = p.perwakilan || {}, Nn = NAMA_SAYAP[sayapPemain(p)] || 'Sayap';
      if (peringkat === 'sayap_cawangan') { langkah.push(pw.sayapCawangan === p.tahun ? 'Anda terpilih sebagai wakil ' + Nn + ' Cawangan ke Mesyuarat Perwakilan ' + Nn + ' Bahagian (bulan 6).' : 'Anda bukan wakil ' + Nn + ' Cawangan tahun ini, jadi tidak boleh hadir Mesyuarat Perwakilan ' + Nn + ' Bahagian kecuali memegang jawatan Bahagian/Pusat.'); }
      if (peringkat === 'sayap_bahagian') {
        langkah.push(pw.g10 === p.tahun ? 'Anda terpilih dalam G10 ' + Nn + ' dan layak hadir Mesyuarat Perwakilan Bahagian.' : 'Anda tidak termasuk dalam G10 ' + Nn + ' tahun ini.');
        langkah.push(pw.g2 === p.tahun ? 'Anda terpilih dalam G2 ' + Nn + ' dan layak hadir Perhimpunan ' + Nn + ' Pusat (bulan 9).' : 'Anda tidak termasuk dalam G2 ' + Nn + ' tahun ini.');
      }
      if (bolehHadir(p, ut).ok) { langkah.push('Anda kini boleh memulakan ' + PERINGKAT[ut].nama + (wu && wu.status === 'belum_tiba' ? ' (dibuka pada ' + wu.label.toLowerCase() + ').' : '.')); }
      else { langkah.push('Anda belum layak hadir ' + PERINGKAT[ut].nama + ' melalui laluan sayap. ' + bolehHadir(p, ut).sebab); }
    }
    else if (peringkat === 'cawangan') { buka('bahagian', 'Mesyuarat Perwakilan Bahagian', sp.bahagian); }
    else if (peringkat === 'bahagian') { buka('pau', 'Perhimpunan Agung (PAU)', sp.pau); }
    else { langkah.push('Perhimpunan Agung tahun ' + p.tahun + ' selesai. Bulan 10 hingga 12 ialah fasa pasca-PAU. Mandat perwakilan anda tamat pada hujung tahun; bertanding semula di Cawangan tahun depan.'); }
    if (K) {
      var tk = K.getTakwim(p);
      langkah.push('Tekan "Teruskan ke Bulan ' + tk.bulanSeterusnya + '" untuk menyambung permainan; AP dan Dana akan diperbaharui.');
    }
    return langkah;
  }

  function nilaiSumber(p) { return { ip: p.ip, myr: p.myr, ap: p.ap, reputasi: p.reputasi }; }
  function beza(a, b) { return { ip: b.ip - a.ip, myr: b.myr - a.myr, ap: b.ap - a.ap, reputasi: b.reputasi - a.reputasi }; }

  /** Ringkasan tersimpan bagi peringkat yang sudah selesai (dengan langkah dikira semula). */
  function getRingkasan(peringkat, profil) {
    var p = profil || S.loadPlayer();
    if (!p || !PERINGKAT[peringkat]) { return null; }
    labelSayap(p);
    var m = keadaanMesyuarat(p)[peringkat];
    if (!m || m.status !== 'selesai' || !m.ringkasan) { return null; }
    var r = salin(m.ringkasan);
    r.peringkat = peringkat; r.nama = PERINGKAT[peringkat].nama; r.tahun = p.tahun;
    r.perwakilanStatus = getStatusPerwakilan(p);
    r.langkah = langkahSeterusnya(p, peringkat);
    r.baki = nilaiSumber(p);
    return r;
  }

  /* ------------------------------------------------------------------------
     5. API
     ------------------------------------------------------------------------ */

  /** Senarai peranan dan kos untuk melukis butang. */
  function senaraiPeranan() {
    return [
      { id: 'pembawa', nama: 'Pembawa Usul', kosAP: CONFIG.KOS_AP.pembawa, pendirian: ['sokong'], penerangan: 'Membawa usul. Kredit penuh jika lulus, IP berkurang jika ditolak.' },
      { id: 'pembahas', nama: 'Pembahas', kosAP: CONFIG.KOS_AP.pembahas, pendirian: ['sokong', 'bantah'], penerangan: 'Berbahas menyokong atau membantah. Kredit separuh.' },
      { id: 'undi', nama: 'Mengundi', kosAP: CONFIG.KOS_AP.undi, pendirian: ['sokong', 'bantah', 'berkecuali'], penerangan: 'Mengundi sahaja. Kesan kecil dan percuma.' }
    ];
  }

  /** Status ketiga-tiga peringkat. Untuk lukisan dashboard. */
  function getKeadaanMesyuarat(profil) {
    var p = profil || S.loadPlayer();
    if (!p) { return null; }
    var ms = keadaanMesyuarat(p); labelSayap(p);
    var sy = sayapPemain(p);
    return {
      tahun: p.tahun, pemilihan: pemilihanAktif(p),
      peringkat: URUTAN.filter(function (k) { return !adalahSayap(k) || !!sy; }).map(function (k) {
        var st = statusPeringkat(p, ms, k), m = ms[k], agenda = m ? m.agenda : null;
        return {
          kod: k, nama: PERINGKAT[k].nama, jenisUsul: PERINGKAT[k].jenisUsul,
          status: st.status, sebab: st.sebab, tetingkap: tetingkap(p, k),
          bilUsul: agenda ? agenda.filter(function (a) { return a.jenis !== 'pemilihan'; }).length : null,
          bilSelesai: agenda ? agenda.filter(function (a) { return a.jenis !== 'pemilihan' && a.status === 'selesai'; }).length : null,
          agenda: agenda, ringkasan: m && m.ringkasan ? m.ringkasan : null, sayap: adalahSayap(k), induk: INDUK[k] || null
        };
      })
    };
  }

  function mulaMesyuarat(peringkat) {
    if (!PERINGKAT[peringkat]) { return gagal('tidak_dikenali', 'Peringkat tidak dikenali: ' + peringkat); }
    var p = S.loadPlayer();
    if (!p) { return gagal('tiada_profil', 'Tiada profil pemain.'); }
    labelSayap(p);
    var Et = typeof globalThis !== 'undefined' ? globalThis.MyPolitikEtika : null;     // hak keahlian (Fasal 20.10)
    if (Et) { var hak = Et.semakHak(p, 'perwakilan'); if (!hak.boleh) { return gagal('hak_dicabut', hak.sebab); } }
    var PPm = typeof globalThis !== 'undefined' ? globalThis.MyPolitikPPP : null, hP = PPm && PPm.halangan ? PPm.halangan(p) : null;      // v13.8: PPP dibekukan ROS
    if (hP) { return gagal('dibekukan', hP); }
    var ms = keadaanMesyuarat(p), st = statusPeringkat(p, ms, peringkat);
    if (st.status === 'selesai') { return gagal('selesai', PERINGKAT[peringkat].nama + ' tahun ' + p.tahun + ' sudah selesai.'); }
    if (st.status === 'sedang') { return gagal('sedang', PERINGKAT[peringkat].nama + ' sedang berjalan.'); }
    if (st.status !== 'boleh_mula') { return gagal(st.status, st.sebab); }

    ms[peringkat] = { status: 'sedang', mula: new Date().toISOString(), bulanMula: p.bulan, asas: nilaiSumber(p), agenda: janaAgenda(p, peringkat), ringkasan: null };
    var r = S.applyEffects({}, {
      kiraTindakan: false, patch: { mesyuarat: ms },
      log: { tindakan: 'mula_mesyuarat', nama: PERINGKAT[peringkat].nama + ' ' + p.tahun, peringkat: peringkat }
    });
    if (!r.ok) { return r; }
    return { ok: true, mesej: PERINGKAT[peringkat].nama + ' dimulakan. ' + ms[peringkat].agenda.length + ' perkara dalam agenda.', mesyuarat: ms[peringkat], profil: r.profil };
  }

  /**
   * Pilih peranan bagi satu usul dan selesaikan usul itu serta-merta.
   * peranan: 'pembawa' | 'pembahas' | 'undi'
   * pendirian: 'sokong' | 'bantah' | 'berkecuali' (berkecuali hanya untuk peranan 'undi').
   * Pembawa sentiasa menyokong. Pembawa tidak boleh dipilih untuk Ucapan Dasar.
   * opts: { rng } untuk ujian.
   */
  function pilihPeranan(peringkat, usulId, peranan, pendirian, opts) {
    opts = opts || {};
    if (!PERINGKAT[peringkat]) { return gagal('tidak_dikenali', 'Peringkat tidak dikenali: ' + peringkat); }
    if (!CONFIG.KOS_AP.hasOwnProperty(peranan)) { return gagal('peranan', 'Peranan tidak sah: ' + peranan); }
    var p = S.loadPlayer();
    if (!p) { return gagal('tiada_profil', 'Tiada profil pemain.'); }
    labelSayap(p);
    var ms = keadaanMesyuarat(p), m = ms[peringkat];
    if (!m || m.status !== 'sedang') { return gagal('belum_mula', 'Mulakan ' + PERINGKAT[peringkat].nama + ' dahulu.'); }

    var usul = null;
    m.agenda.forEach(function (a) { if (a.id === usulId) { usul = a; } });
    if (!usul || usul.jenis === 'pemilihan') { return gagal('tiada_usul', 'Usul tidak ditemui: ' + usulId); }
    if (usul.status === 'selesai') { return gagal('sudah_selesai', 'Usul ini sudah diputuskan.'); }
    if (peranan === 'pembawa' && usul.jenis === 'ucapan_dasar') { return gagal('peranan', 'Ucapan Dasar disampaikan oleh Presiden. Pilih Pembahas atau Mengundi.'); }

    if (peranan === 'pembawa') { pendirian = 'sokong'; }
    var sah = peranan === 'pembahas' ? ['sokong', 'bantah'] : ['sokong', 'bantah', 'berkecuali'];
    if (sah.indexOf(pendirian) < 0) { return gagal('pendirian', 'Pendirian tidak sah untuk ' + peranan + ': ' + pendirian); }
    if (p.ap < CONFIG.KOS_AP[peranan]) { return gagal('ap', 'AP tidak mencukupi (perlu ' + CONFIG.KOS_AP[peranan] + ').'); }

    var rng = opts.rng || Math.random;
    var hasil = selesaikanUsul(usul, pengaruhPemain(p, peringkat, peranan, pendirian), bilHadir(p, peringkat), rng);
    var kesan = kesanPeranan(peranan, pendirian, hasil.lulus, usul);
    var ipTerima = kesan.ip > 0 && S.ipSebenar ? S.ipSebenar(p, kesan.ip) : kesan.ip;   // v13.43 (baris 33): simpan IP sebenar selepas redaman, bukan nilai asas

    usul.status = 'selesai';
    usul.pilihan = { peranan: peranan, pendirian: pendirian };
    usul.keputusan = { lulus: hasil.lulus, sokongan: hasil.sokongan, hadir: hasil.hadir, undiSokong: hasil.undiSokong, undiBantah: hasil.undiBantah, padan: kesan.padan, ip: ipTerima, ipAsas: kesan.ip, reputasi: kesan.reputasi };

    // v7.54: usul isu tempatan (Sembang Warung) yang LULUS menyelesaikan isu itu pada papan Isu Tempatan; akar umbi +3.
    var patchUsul = { mesyuarat: ms }, kesetiaanUsul = null, isuSelesai = null;
    if (hasil.lulus && usul.sumber === 'sembang_warung' && Array.isArray(p.isu)) {
      var kodIsu = String(usul.kod || '').replace(/^isu_/, '');
      var senaraiIsu = p.isu.map(function (x) { return x; }), ix = -1;
      senaraiIsu.forEach(function (x, n) { if (ix < 0 && x && x.kod === kodIsu && !x.selesai) { ix = n; } });
      if (ix >= 0) {
        isuSelesai = senaraiIsu[ix];
        senaraiIsu[ix] = Object.assign({}, isuSelesai, { selesai: true, cara: 'usul', selesaiTahun: p.tahun, selesaiBulan: p.bulan });
        patchUsul.isu = senaraiIsu; kesetiaanUsul = { akarUmbi: 3 };
      }
    }
    var kesanUsul = { ap: -CONFIG.KOS_AP[peranan], ip: kesan.ip, reputasi: kesan.reputasi };
    if (kesetiaanUsul) { kesanUsul.kesetiaan = kesetiaanUsul; }
    var r = S.applyEffects(kesanUsul, {
      patch: patchUsul,
      log: { tindakan: 'usul_' + peranan, nama: usul.tajuk + ' (' + peranan + ', ' + pendirian + ')', peringkat: peringkat }
    });
    if (!r.ok) { return r; }

    var nama = { pembawa: 'Pembawa', pembahas: 'Pembahas', undi: 'Mengundi' }[peranan];
    var mesej = nama + ' (' + pendirian + '): usul ' + (hasil.lulus ? 'LULUS' : 'DITOLAK') + ' dengan ' + hasil.undiSokong + ' sokong dan ' +
                hasil.undiBantah + ' bantah. ' + S.ringkasPerubahan(r.perubahan) + '.' + (isuSelesai ? ' Isu tempatan diselesaikan: ' + isuSelesai.tajuk + ' (Akar Umbi +3).' : '');
    return { ok: true, mesej: mesej, keputusan: usul.keputusan, usul: usul, perubahan: r.perubahan, profil: r.profil };
  }

  function presidenPemain(p) { var l = Array.isArray(p && p.jawatanList) ? p.jawatanList : []; return /^Presiden$/i.test(String((p && p.jawatan) || '')) || l.some(function (j) { return /^Presiden$/i.test(String(j && j.jawatan || '')); }); }
  /** v13.22: Presiden menyampaikan Ucapan Dasar dengan tema pilihan. */
  function ucapanPresiden(peringkat, usulId, kodTema, opts) {
    opts = opts || {};
    var p = S.loadPlayer(); if (!p) { return gagal('tiada_profil', 'Tiada profil pemain.'); }
    if (!presidenPemain(p)) { return gagal('bukan_presiden', 'Hanya Presiden menyampaikan Ucapan Dasar.'); }
    labelSayap(p);
    var ms = keadaanMesyuarat(p), m = ms[peringkat];
    if (!m || m.status !== 'sedang') { return gagal('belum_mula', 'Mulakan mesyuarat dahulu.'); }
    var usul = null; m.agenda.forEach(function (a) { if (a.id === usulId) { usul = a; } });
    if (!usul || usul.jenis !== 'ucapan_dasar') { return gagal('tiada_usul', 'Ucapan Dasar tidak ditemui.'); }
    if (usul.status === 'selesai') { return gagal('sudah_selesai', 'Ucapan Dasar sudah disampaikan.'); }
    var tm = TEMA_PRESIDEN.filter(function (x) { return x.kod === kodTema; })[0]; if (!tm) { return gagal('tema', 'Tema tidak sah.'); }
    if ((Number(p.ap) || 0) < UCAPAN.ap) { return gagal('ap', 'AP tidak mencukupi (perlu ' + UCAPAN.ap + ').'); }
    var rng = opts.rng || Math.random, kes = p.kesetiaan || {};
    var sok = clamp(Math.round(55 + ((Number(p.reputasi) || 50) - 50) * 0.6 + ((Number(kes.perwakilan) || 40) - 40) * 0.3 + tm.mod + (rng() * 20 - 10)), 5, 95);
    var terima = sok >= UCAPAN.ambang, rep = tm.reputasi, gagalRisiko = false, kset = {}, k;
    if (tm.gagal && rng() < tm.gagal.peluang) { gagalRisiko = true; rep = tm.gagal.reputasi; }
    if (!terima && rep > 0) { rep = Math.round(rep / 2); }
    if (tm.kesetiaan && !gagalRisiko) { for (k in tm.kesetiaan) { kset[k] = tm.kesetiaan[k]; } }
    if (!terima) { kset.penentang = (kset.penentang || 0) + UCAPAN.penentangKurang; }
    var patch = { mesyuarat: ms }, R = typeof globalThis !== 'undefined' ? globalThis.MyPolitikPRU : null, PK = typeof globalThis !== 'undefined' ? globalThis.MyPolitikPRK : null;
    if (tm.hubungan && R && R.getPRU) { var pru = R.getPRU(p); pru.hubunganGabungan = clamp((Number(pru.hubunganGabungan) || 50) + tm.hubungan, 0, 100); patch.pru = pru; }
    if (tm.sentimen && PK && PK.getPRK) { var prk = PK.getPRK(p); prk.sentimen = clamp((Number(prk.sentimen) || 0) + tm.sentimen, -20, 20); patch.prk = prk; }
    usul.status = 'selesai'; usul.pilihan = { peranan: 'presiden', pendirian: tm.kod };
    usul.keputusan = { lulus: terima, sokongan: sok, tema: tm.nama, reputasi: rep, ip: terima ? (S.ipSebenar ? S.ipSebenar(p, UCAPAN.ip) : UCAPAN.ip) : 0, ipAsas: terima ? UCAPAN.ip : 0, gagalRisiko: gagalRisiko };
    usul.tajuk = 'Ucapan Dasar Presiden: ' + tm.nama;
    var kesan = { ap: -UCAPAN.ap, reputasi: rep, ip: terima ? UCAPAN.ip : 0 }; if (Object.keys(kset).length) { kesan.kesetiaan = kset; }
    var r = S.applyEffects(kesan, { patch: patch, log: { tindakan: 'ucapan_presiden', nama: 'Ucapan Dasar Presiden: ' + tm.nama + ' (' + sok + '% sokongan)', peringkat: peringkat } });
    if (!r.ok) { return r; }
    if (gagalRisiko && tm.gagal.tular) { try { var TL = globalThis.MyPolitikTular; if (TL && TL._cipta) { TL._cipta('bulanan', { rng: rng }); } } catch (eT) { /* abaikan */ } }
    var mesej = 'Ucapan Dasar "' + tm.nama + '": ' + sok + '% perwakilan menyokong (' + (terima ? 'diterima' : 'kurang sambutan') + ').' + (gagalRisiko ? ' Serangan anda dikritik dan menjadi tular.' : '') + ' ' + S.ringkasPerubahan(r.perubahan) + '.';
    return { ok: true, mesej: mesej, keputusan: usul.keputusan, usul: usul, perubahan: r.perubahan, profil: r.profil };
  }

  /**
   * Tutup mesyuarat: usul yang tidak disertai diputuskan tanpa kesan pada pemain,
   * kemudian pemilihan perwakilan peringkat itu dijalankan (tahun pemilihan sahaja).
   * opts: { rng }
   */
  function tutupMesyuarat(peringkat, opts) {
    opts = opts || {};
    if (!PERINGKAT[peringkat]) { return gagal('tidak_dikenali', 'Peringkat tidak dikenali: ' + peringkat); }
    var p = S.loadPlayer();
    if (!p) { return gagal('tiada_profil', 'Tiada profil pemain.'); }
    labelSayap(p);
    var ms = keadaanMesyuarat(p), m = ms[peringkat];
    if (!m || m.status !== 'sedang') { return gagal('belum_mula', PERINGKAT[peringkat].nama + ' tidak sedang berjalan.'); }

    // 1. Pemilihan dijalankan dahulu kerana ia mengubah profil (jawatan, perwakilan).
    var pemilihan = [], sebelumPemilihan = nilaiSumber(p);
    if (adaPemilihan(p, peringkat)) {
      pemilihan = E.jalankanPemilihanPeringkat(peringkat, { rng: opts.rng });
    }

    // 2. Muat semula profil dan putuskan baki usul.
    p = S.loadPlayer();
    var kesanPemilihan = beza(sebelumPemilihan, nilaiSumber(p));
    ms = keadaanMesyuarat(p); m = ms[peringkat];
    var rng = opts.rng || Math.random, hadir = bilHadir(p, peringkat), tanpaPenyertaan = [];
    m.agenda.forEach(function (a) {
      if (a.jenis === 'pemilihan') {
        var hs = pemilihan.filter(function (x) { return x.ok; });
        a.status = 'selesai';
        a.keputusan = hs.length ? { dijalankan: true, bil: hs.length, menang: hs.filter(function (x) { return x.keputusan.menang; }).length } : { dijalankan: false, bil: 0, menang: 0 };
      } else if (a.status !== 'selesai') {
        var k = selesaikanUsul(a, 0, hadir, rng);
        a.status = 'selesai'; a.pilihan = null;
        a.keputusan = { lulus: k.lulus, sokongan: k.sokongan, hadir: k.hadir, undiSokong: k.undiSokong, undiBantah: k.undiBantah, padan: false, ip: 0, reputasi: 0 };
        tanpaPenyertaan.push(a.tajuk);
      }
    });

    var usulList = m.agenda.filter(function (a) { return a.jenis !== 'pemilihan'; });
    var ringkasan = {
      lulus: usulList.filter(function (a) { return a.keputusan.lulus; }).length,
      ditolak: usulList.filter(function (a) { return !a.keputusan.lulus; }).length,
      disertai: usulList.filter(function (a) { return a.pilihan; }).length,
      tanpaPenyertaan: tanpaPenyertaan.length,
      pemilihan: pemilihan.filter(function (x) { return x.ok; }).map(function (x) {
        var k = x.keputusan;
        return { kod: k.kod, jawatan: k.jawatan, menang: k.menang, kedudukan: k.kedudukan, jumlahCalon: k.jumlahCalon, kerusi: k.kerusi, undi: k.undi, ip: x.perubahan ? x.perubahan.ip : 0 };
      }),
      bulanTutup: p.bulan,
      usul: usulList.map(function (a) {
        var k = a.keputusan, pl = a.pilihan;
        return { tajuk: a.tajuk, lulus: k.lulus, undiSokong: k.undiSokong, undiBantah: k.undiBantah, hadir: k.hadir,
                 pilihan: pl ? { peranan: pl.peranan, pendirian: pl.pendirian } : null, padan: !!k.padan, ip: k.ip || 0, ipAsas: k.ipAsas != null ? k.ipAsas : (k.ip || 0), reputasi: k.reputasi || 0 };
      }),
      tidakDidaftar: (E && adaPemilihan(p, peringkat) ? E.senaraiPertandingan(p) : []).filter(function (c) {
        return c.peringkat === (peringkat === 'pau' ? 'pusat' : peringkat) && c.terbuka && !c.didaftar && !c.selesai && !c.pertahan;
      }).map(function (c) { return c.jawatan; }),
      peristiwa: []
    };
    ringkasan.usulDibawa = null;                                              // v6.1: satu usul sayap dibawa ke mesyuarat utama
    if (adalahSayap(peringkat)) {
      var calon = m.agenda.filter(function (a) { return a.jenis === 'usul' && a.keputusan && a.keputusan.lulus && a.nilai > 0; });
      calon.sort(function (a, b) {
        var pa = a.pilihan && a.pilihan.peranan === 'pembawa' ? 1 : 0, pb = b.pilihan && b.pilihan.peranan === 'pembawa' ? 1 : 0;
        return pb - pa || b.keputusan.sokongan - a.keputusan.sokongan;
      });
      if (calon.length) {
        var c = calon[0];
        ringkasan.usulDibawa = { kod: c.kod, tajuk: c.tajuk, penerangan: c.penerangan, populariti: c.populariti, nilai: c.nilai, sayap: sayapPemain(p), ke: PERINGKAT[INDUK[peringkat]].nama };
      }
    }
    var apUsul = 0;
    usulList.forEach(function (a) { if (a.pilihan) { apUsul += CONFIG.KOS_AP[a.pilihan.peranan] || 0; } });
    ringkasan.perubahan = {
      ip: ringkasan.usul.reduce(function (n, u) { return n + u.ip; }, 0) + kesanPemilihan.ip,
      reputasi: ringkasan.usul.reduce(function (n, u) { return n + u.reputasi; }, 0) + kesanPemilihan.reputasi,
      ap: -apUsul + kesanPemilihan.ap,
      myr: kesanPemilihan.myr
    };
    ringkasan.perubahanUsulIP = ringkasan.usul.reduce(function (n, u) { return n + u.ip; }, 0);
    ringkasan.perubahanPemilihanIP = kesanPemilihan.ip;
    pemilihan.forEach(function (x) { if (x.ok) { x.peristiwa.forEach(function (e) { ringkasan.peristiwa.push(e.mesej); }); } });
    m.status = 'selesai'; m.tamat = new Date().toISOString(); m.ringkasan = ringkasan;

    var r = S.applyEffects({}, {
      kiraTindakan: false, patch: { mesyuarat: ms },
      log: { tindakan: 'tutup_mesyuarat', nama: PERINGKAT[peringkat].nama + ' ' + p.tahun + ' ditutup', peringkat: peringkat }
    });
    if (!r.ok) { return r; }

    var peristiwa = [];
    pemilihan.forEach(function (x) { if (x.ok) { x.peristiwa.forEach(function (e) { peristiwa.push(e); }); } });
    var mesej = PERINGKAT[peringkat].nama + ' ditutup. ' + ringkasan.lulus + ' usul lulus, ' + ringkasan.ditolak + ' ditolak.' +
      (adalahSayap(peringkat) ? (ringkasan.usulDibawa ? ' Usul dibawa ke ' + ringkasan.usulDibawa.ke + ': ' + ringkasan.usulDibawa.tajuk + '.' : ' Tiada usul dibawa ke mesyuarat utama.') : '');
    pemilihan.forEach(function (x) { if (x.ok) { mesej += ' ' + x.mesej; } else { mesej += ' ' + x.ralat; } });
    var penuh = getRingkasan(peringkat, r.profil);
    return { ok: true, mesej: mesej, ringkasan: penuh || ringkasan, pemilihan: pemilihan, peristiwa: peristiwa, profil: r.profil };
  }

  return {
    CONFIG: CONFIG,
    TEMA_PRESIDEN: TEMA_PRESIDEN, UCAPAN: UCAPAN, presidenPemain: presidenPemain, ucapanPresiden: ucapanPresiden,
    PERINGKAT: PERINGKAT,
    KOLAM: KOLAM, KOLAM_PARTI: KOLAM_PARTI, TEMA_PARTI: TEMA_PARTI, senaraiPusat: senaraiPusat, peranSayap: peranSayap, bilHadir: bilHadir, janaAgendaUji: janaAgenda,
    senaraiPeranan: senaraiPeranan,
    getKeadaanMesyuarat: getKeadaanMesyuarat,
    getStatusPerwakilan: getStatusPerwakilan,
    getRingkasan: getRingkasan,
    mulaMesyuarat: mulaMesyuarat,
    pilihPeranan: pilihPeranan,
    tutupMesyuarat: tutupMesyuarat
  };
});
