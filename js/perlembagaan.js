/* ==========================================================================
   Nusa Politik — js/perlembagaan.js   (v4.7)
   Rujukan Perlembagaan UMNO: modal dengan fasal boleh lipat (accordion).
   Dibuka oleh sebarang elemen berkaitan [data-perlembagaan] (menu utama dan dashboard).
   Berdiri sendiri: CSS dan modal disuntik oleh fail ini; tiada kebergantungan.

   Sumber: "Perlembagaan UMNO 2025" (PDF yang dirujuk dalam projek ini). Teks di bawah ialah
   RINGKASAN untuk rujukan permainan, bukan teks undang-undang penuh. Nombor fasal/sub-fasal
   mengikut dokumen. Nota "Dalam permainan" menerangkan bagaimana permainan menggunakannya
   (termasuk bila permainan memudahkan sesuatu).

   Tambah fasal lain dengan menokok satu objek ke dalam FASAL.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);                                     // v8.0: sentiasa didaftar secara global (pelayar & Node), seperti modul lain
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikPerlembagaan = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function (W) {
  'use strict';

  var SUMBER = 'Perlembagaan UMNO 2025';

  /* kod = rujukan sub-fasal; t = ringkasan. */
  var FASAL = [
    {
      no: 3, tajuk: 'Asas dan Tujuan',
      ringkas: 'UMNO ialah parti politik yang berjuang mendukung cita-cita Agama Islam, Kebangsaan Melayu, Bumiputera, Anak Negeri Sabah dan Orang Asli serta perpaduan Malaysia demi kemakmuran dan kestabilan negara.',
      poin: [
        ['3.1', 'Menegak, mempertahan dan mengembangkan Islam sebagai Agama Persekutuan, serta menghormati kebebasan beragama seperti dalam Perlembagaan Persekutuan.'],
        ['3.2', 'Mempertahankan kemerdekaan dan kedaulatan negara.'],
        ['3.3', 'Mendukung asas-asas Perlembagaan Persekutuan selagi ia membela kepentingan Raja-raja Melayu, Bangsa Melayu, Bumiputera, Anak Negeri Sabah dan Orang Asli (termasuk Perkara 153), prinsip Kontrak Sosial dan Undang-Undang Tubuh Negeri.'],
        ['3.4', 'Membela nasib rakyat Malaysia tanpa mengira latar belakang kaum.'],
        ['3.5', 'Mempertahankan kedaulatan rakyat dan keadilan sosial melalui Demokrasi Berparlimen, serta memajukan ekonomi Melayu, Bumiputera, Anak Negeri Sabah dan Orang Asli khasnya dan rakyat Malaysia amnya.'],
        ['3.6', 'Menjamin Bahasa Melayu sebagai Bahasa Rasmi tunggal negara dan Kebudayaan Kebangsaan yang berteraskan Kebudayaan Melayu.'],
        ['3.7', 'Mewujudkan kerjasama antara kaum bagi melahirkan rakyat Malaysia yang kuat dan bersatu, berasaskan prinsip hak asasi manusia dan hak keistimewaan yang terkandung.']
      ],
      permainan: 'Fasal ini ialah latar nilai parti. Ia tidak mempengaruhi pengiraan permainan secara langsung.'
    },
    {
      no: 6, tajuk: 'Tanggungjawab dan Hak Ahli',
      ringkas: 'Menetapkan tanggungjawab, hak dan perkara yang ahli biasa tidak berhak lakukan. Ahli Bergabung dan Ahli Bersekutu mempunyai tanggungjawab hampir sama sebagai pemerhati (6.4, 6.5).',
      poin: [
        ['6.1', 'Tanggungjawab ahli biasa: memegang teguh dasar parti; mendaftar dan mengundi dalam pilihan raya (kecuali sebab yang diterima MKT); menghadiri mesyuarat dan kegiatan parti; mematuhi tataetika, perintah dan disiplin; menyokong calon parti; berkhidmat kepada orang ramai; bersedia menentang musuh negara.'],
        ['6.2.1–6.2.3', 'Hak ahli biasa: bercakap, mengemukakan pendapat dan mengundi dalam mesyuarat parti; memilih, dipilih dan dilantik ke sebarang jawatan; mengambil bahagian dalam pilihan raya dan menerima lantikan sebagai calon.'],
        ['6.2.4', 'Ahli yang sedang dalam cadangan untuk digantung atau dipecat tidak hilang hak keahliannya (hak hanya terjejas selepas hukuman dikenakan).'],
        ['6.2.5–6.2.6', 'Ahli yang bukan wakil ke Perwakilan Bahagian atau Perhimpunan Agung boleh dicalonkan dan bertanding jika memenuhi syarat Fasal 9.5 dan 15.5. Ahli yang tidak hadir Persidangan Cawangan boleh dicalonkan dengan persetujuan bertulis.'],
        ['6.3.1–6.3.2', 'Ahli tidak berhak menjadi ahli lebih daripada satu Cawangan dan tidak boleh mewakilkan hak mengundinya kepada sesiapa.'],
        ['6.3.3', 'Ahli tidak boleh menggunakan hak di bawah Fasal 6.2 jika tidak menjelaskan yuran mengikut Perlembagaan.'],
        ['6.3.4', 'Ahli tidak boleh menggunakan hak di bawah Fasal 6.2 jika dilarang di bawah Akta Pertubuhan 1966, atau setakat mana ia dikenakan hukuman disiplin di bawah Fasal 20.10 dan 20.11.'],
        ['6.3.5–6.3.6', 'Tidak boleh memegang jawatan Pengerusi Tetap, Timbalan Pengerusi Tetap, Pemeriksa Kira-kira atau AJK di lebih satu Cawangan/Bahagian tanpa kebenaran bertulis MKT; dan tidak boleh menjadi AJK di peringkat yang sama dengan jawatan-jawatan tersebut.'],
        ['6.3.7–6.3.8', 'Tidak boleh bercakap, mengundi, memilih dan dipilih dalam Persidangan Cawangan dan Perwakilan Bahagian selain Cawangan dan Bahagian di mana ia menjadi ahli; dan tidak boleh menggunakan hak yang sama di Cawangan/Bahagian baharu jika sudah menggunakannya di tempat asal pada tahun itu.']
      ],
      permainan: 'Ahli yang dikenakan hukuman gantung hilang hak mencalon, mengundi dan bertanding, dan dilucutkan jawatan, selaras dengan 6.3.4 dan 20.10(b). Ahli yang hanya dalam siasatan masih mempunyai hak penuh (6.2.4).'
    },
    {
      no: 8, tajuk: 'Perhimpunan Agung',
      ringkas: 'Perhimpunan Agung ialah kuasa tertinggi parti. Perjalanan parti berasaskan kuasa dan perintahnya, tertakluk kepada Perlembagaan dan Peraturan UMNO.',
      poin: [
        ['8.1', 'Perhimpunan Agung ialah kuasa tertinggi parti.'],
        ['8.2', 'Perhimpunan Agung Tahunan diadakan sekali setahun pada masa yang ditetapkan MKT, dengan syarat tidak lewat 18 bulan daripada tarikh Perhimpunan Agung yang lalu.'],
        ['8.3', 'Tugas: menentukan dasar parti, mengkaji kerja MKT dan melantik Juruaudit untuk tempoh MKT.'],
        ['8.4.1–8.4.2', 'Anggota: Pengerusi Tetap dan Timbalan Pengerusi Tetap, serta ahli-ahli MKT.'],
        ['8.4.3', 'Wakil yang dipilih oleh Perwakilan Tahunan Bahagian: seorang wakil bagi setiap 500 ahli, tidak lebih tujuh (7) orang dari satu Bahagian.'],
        ['8.4.4', 'Ketua, Timbalan Ketua, Naib Ketua, Ketua Wanita, Ketua Pemuda, Ketua Puteri, Setiausaha dan Ketua Penerangan Bahagian yang telah mengadakan Perwakilan Bahagiannya.'],
        ['8.4.5', 'Tidak lebih sepuluh (10) wakil masing-masing daripada Wanita UMNO, Pergerakan Pemuda dan Pergerakan Puteri, dipilih oleh Perhimpunan Agung sayap berkenaan.']
      ],
      permainan: 'Perhimpunan Agung diadakan pada bulan 8 setiap tahun. Kuota perwakilan Bahagian ke PAU dikira 1 bagi setiap 500 ahli, minimum 1 dan maksimum 7 (diringkaskan oleh permainan).'
    },
    {
      no: 14, tajuk: 'Bahagian',
      ringkas: 'Bahagian ditubuhkan oleh MKT di setiap kawasan Parlimen. Perjalanan Bahagian berasaskan kuasa dan perintah Perwakilan Bahagian.',
      poin: [
        ['14.1', 'MKT berkuasa menubuhkan sebuah Bahagian di setiap kawasan Pilihanraya Dewan Rakyat.'],
        ['14.2', 'Perjalanan Bahagian berasaskan kuasa dan perintah Perwakilan Bahagian, tertakluk kepada Perlembagaan dan Peraturan Persidangan.'],
        ['14.3', 'Perwakilan Bahagian diadakan sekali setahun, tidak kurang enam puluh (60) hari sebelum Perhimpunan Agung. MKT boleh memberi kelonggaran.'],
        ['14.4', 'Anggota Perwakilan Bahagian: Pengerusi Tetap dan Timbalannya; AJK Bahagian; Ketua Cawangan yang Cawangannya telah bersidang pada tahun itu; wakil Cawangan; wakil dan Ketua sayap Cawangan.'],
        ['14.4.4', 'Wakil Cawangan dilantik oleh Persidangan Cawangan: seorang bagi setiap lima puluh (50) ahli, tidak lebih lima (5) orang dari satu Cawangan.'],
        ['14.4.5', 'Tidak lebih sepuluh (10) wakil Wanita UMNO, sepuluh (10) wakil Pemuda dan sepuluh (10) wakil Puteri yang dipilih oleh Perwakilan Bahagian masing-masing.'],
        ['14.5', 'Tugas Perwakilan Bahagian: memilih AJK Bahagian, memilih tujuh (7) wakil Bahagian ke Perhimpunan Agung daripada penama yang telah mendaftar, dan membincangkan dasar untuk dikemukakan di Perhimpunan Agung. Wakil yang tidak dipilih atau diubah kemudian tidak sah.']
      ],
      permainan: 'Perwakilan Bahagian diadakan pada bulan 7. Kuota wakil Cawangan dalam permainan: 1 bagi setiap 50 ahli, minimum 1, maksimum 5 (14.4.4). Pemain mesti memenangi mandat perwakilan untuk bertanding di peringkat Bahagian.'
    },
    {
      no: 17, tajuk: 'Cawangan',
      ringkas: 'Cawangan ditubuhkan, digantung atau dibubarkan oleh MKT selepas berunding dengan Jawatankuasa Bahagian. Perjalanan Cawangan berasaskan kuasa dan perintah Persidangan Cawangan.',
      poin: [
        ['17.1', 'MKT berkuasa menubuhkan, menggantung dan membubarkan Cawangan selepas berunding dan merujuk kepada Jawatankuasa Bahagian berkenaan.'],
        ['17.3', 'Persidangan Cawangan diadakan setahun sekali, tidak lewat empat belas (14) hari sebelum tarikh Perwakilan Bahagian.'],
        ['17.4', 'Persidangan Cawangan terdiri daripada Pengerusi Tetap dan Timbalannya, AJK Cawangan, dan ahli UMNO yang telah menjelaskan yuran mengikut Fasal 25.1.'],
        ['17.5', 'Tugas: membincangkan dasar untuk Perwakilan Bahagian; mengkaji kerja Jawatankuasa Cawangan; mengadakan rancangan kerja untuk faedah rakyat; memilih AJK (tertakluk Fasal 18.2); memilih Pengerusi Tetap, Timbalan Pengerusi Tetap dan dua Pemeriksa Kira-kira; dan memilih wakil ke Perwakilan Bahagian.'],
        ['17.5.6', 'Wakil yang tidak dipilih dalam Persidangan Cawangan, atau sebarang pertukaran selepas itu, tidak sah.'],
        ['17.6', 'Persidangan Khas Cawangan diadakan atas permintaan bertulis satu perdua jumlah ahli. Jika Setiausaha tidak memanggilnya dalam 14 hari, Jawatankuasa Bahagian memanggilnya.']
      ],
      permainan: 'Persidangan Cawangan diadakan antara bulan 4 hingga 6. Setiap Cawangan dalam permainan diwakili oleh satu Daerah Mengundi (Lokaliti), dengan bilangan ahli rekaan permainan.'
    },
    {
      no: 20, tajuk: 'Disiplin',
      ringkas: 'Menubuhkan Lembaga Disiplin (Pusat) dan Jawatankuasa Disiplin (Negeri), menetapkan hukuman, rayuan dan kes keahlian gugur.',
      poin: [
        ['20.1–20.3', 'MKT menubuhkan Lembaga Disiplin di Pusat dan Jawatankuasa Disiplin di peringkat negeri serta menetapkan peraturan dan bidang kuasanya. Ahli Jawatankuasa Disiplin Negeri terdiri daripada ahli yang tidak berjawatan dalam parti dan tidak mempunyai kepentingan dalam pemilihan (20.2).'],
        ['20.4', 'Selepas mendengar dan berpuas hati terhadap pelanggaran Perlembagaan atau Tataetika Ahli, hukuman boleh dikenakan mengikut kuasa Perlembagaan.'],
        ['20.5', 'Setiap peringkat parti melaporkan kepada Jawatankuasa Disiplin dahulu sebelum dibawa ke Lembaga Disiplin.'],
        ['20.6', 'Ahli yang tidak berpuas hati merayu kepada Lembaga Disiplin dahulu; rayuan terakhir ke MKT untuk keputusan muktamad.'],
        ['20.7', 'Ahli yang membawa perkara parti atau hak keahliannya ke mahkamah sebelum mematuhi sepenuhnya peraturan parti, keahliannya gugur dengan sendirinya.'],
        ['20.8', 'Ahli yang menjadi ahli berdaftar parti politik lain, keahliannya gugur setelah disahkan MKT.'],
        ['20.9', 'Kewajipan ahli: patuh Perlembagaan dan Tataetika, ikut perintah parti, jalankan dasar, hormati keputusan, jaga rahsia, pelihara nama baik dan maruah parti, dan sentiasa bertatalaku sopan.'],
        ['20.10', 'Hukuman: (a) amaran; (b) gantung hak dalam parti; (c) dilarang bertanding jawatan parti atau sebagai calon pilihan raya, bagi tempoh yang ditentukan MKT; (d) dipecat setelah disahkan MKT; (e) tindakan lain yang wajar.'],
        ['20.11', 'Keahlian gugur automatik jika ahli yang dipilih sebagai Ahli Dewan Rakyat/DUN menyertai pakatan politik yang tidak dianggotai UMNO atau menjadi wakil bebas, atau bertanding sebagai calon bebas atau calon pakatan politik yang tidak dianggotai UMNO.'],
        ['20.12', 'Rayuan: penggantungan boleh dirayu selepas dua (2) tahun daripada tarikh dihukum; pemecatan selepas tiga (3) tahun; pengguguran dari tarikh keahlian gugur.'],
        ['20.13', 'MKT berkuasa membuat kaedah Tataetika Ahli, termasuk melarang penyalahgunaan kuasa dan wang untuk mendapat undi atau sokongan atau mempengaruhi pemilihan.']
      ],
      permainan: 'Kempen kotor (politik wang dan sebagainya) boleh mencetuskan aduan, pendengaran dan hukuman 20.10(a)–(d). Tempoh gantung 12 bulan dan larangan bertanding 36 bulan ialah angka permainan (Perlembagaan menyerahkan tempoh kepada MKT). Rayuan hanya dimodelkan bagi pemecatan (3 tahun, 20.12.2).'
    }
  ];

  /* v13.4: Fasal tambahan daripada Perlembagaan UMNO 2025 (Fasal A) dan dokumen lain dalam buku yang sama (tab). */
  FASAL = FASAL.concat([{"no": 4, "tajuk": "Jenis Ahli", "ringkas": "Ahli UMNO terdiri daripada tiga jenis: Ahli Biasa, Ahli Bergabung dan Ahli Bersekutu.", "poin": [["4.2", "Ahli Biasa ialah warganegara Malaysia berbangsa Melayu, Bumiputera, Anak Negeri Sabah dan Orang Asli yang berusia 18 tahun ke atas."], ["4.3", "Ahli Bergabung ialah pertubuhan politik yang bersetuju bekerjasama dengan UMNO dan menerima syarat MKT."], ["4.4", "Ahli Bersekutu ialah NGO, atau individu yang menjadi ahli tanpa berdaftar dengan Cawangan dan Bahagian (keahlian secara langsung)."]], "permainan": "Pemain sentiasa Ahli Biasa yang berdaftar di sebuah Cawangan."}, {"no": 5, "tajuk": "Pendaftaran Keahlian", "ringkas": "Setiap orang Melayu, Bumiputera, Anak Negeri Sabah dan Orang Asli berhak mendaftar sebagai ahli. MKT menetapkan tatacara, borang dan yuran pendaftaran.", "poin": [["5.2", "MKT berkuasa membuat peraturan atau arahan tentang tatacara pendaftaran keahlian."], ["5.3", "MKT boleh memutuskan sebarang permohonan atau taraf pendaftaran, termasuk menarik balik pendaftaran; keputusannya muktamad."]], "permainan": "Tempoh keahlian dikira daripada tahun keahlian yang dipilih semasa mendaftar."}, {"no": 7, "tajuk": "Susunan dan Pentadbiran UMNO", "ringkas": "UMNO disusun dalam empat peringkat, masing-masing dengan badan berkuasa dan jawatankuasa yang mentadbir semasa ketiadaannya.", "poin": [["7.1.1", "Pusat: Perhimpunan Agung, atau Majlis Kerja Tertinggi semasa ketiadaannya."], ["7.1.2", "Perhubungan: Badan Perhubungan Negeri dan Wilayah Persekutuan."], ["7.1.3", "Bahagian: Perwakilan Bahagian, atau Jawatankuasa Bahagian semasa ketiadaannya."], ["7.1.4", "Cawangan: Persidangan Cawangan, atau Jawatankuasa Cawangan semasa ketiadaannya."]], "permainan": "Keempat-empat peringkat ada dalam permainan: Cawangan, Bahagian, Badan Perhubungan Negeri dan Pusat."}, {"no": 9, "tajuk": "Majlis Kerja Tertinggi", "ringkas": "MKT mentadbir hal ehwal UMNO di bawah kuasa Perhimpunan Agung dan bertindak bagi pihaknya semasa ketiadaannya.", "poin": [["9.2", "Anggota: Presiden; Timbalan Presiden yang dipilih; Ketua Wanita UMNO bertaraf Timbalan Presiden (ex-officio); 5 Naib Presiden termasuk Ketua Pemuda dan Ketua Puteri; Setiausaha Agung; Bendahari; Ketua Penerangan; sehingga 25 ahli dipilih; dan sehingga 13 ahli dilantik Presiden (sekurang-kurangnya 2 Wanita, 1 Pemuda dan 1 Puteri)."], ["9.3", "Pengerusi Tetap, Timbalannya, Presiden, Timbalan Presiden yang dipilih, 3 Naib Presiden dan 25 ahli MKT dipilih dalam Mesyuarat Perwakilan Bahagian setiap 3 tahun."], ["9.4", "Ketua dan Naib Ketua Wanita, Pemuda dan Puteri Malaysia dipilih dalam Mesyuarat Perwakilan sayap Bahagian setiap 3 tahun; Ketua sayap mempunyai hak dan kuasa Naib Presiden."], ["9.5", "Calon MKT mesti pernah memegang jawatan ahli MKT atau AJK Bahagian selama satu penggal."], ["9.8.1", "Presiden melantik Setiausaha Agung, Bendahari, Ketua Penerangan, Pengerusi dan Timbalan Pengerusi Perhubungan Negeri, 13 ahli MKT dan Majlis Penasihat, serta boleh merunding semula calon PRU dan PRN."], ["9.9", "Jika Presiden berhenti, Timbalan Presiden yang dipilih memangku sehingga pemilihan Presiden baharu."], ["9.12", "Perhimpunan Agung Khas boleh melucutkan ahli MKT, termasuk Presiden dan Timbalan Presiden, atau membubarkan MKT dengan undi sekurang-kurangnya 2/3."]], "permainan": "Ketua Wanita Pusat berpangkat 11 (setaraf Timbalan Presiden); Ketua Pemuda dan Ketua Puteri Pusat berpangkat 10 (setaraf Naib Presiden). 3 kerusi Naib Presiden dipertandingkan. Dalam permainan, jawatan Pusat masih dipilih semasa Perhimpunan Agung bulan 8; pemilihan oleh Perwakilan Bahagian dirancang untuk Fasa B."}, {"no": 10, "tajuk": "Tanggungjawab Majlis Kerja Tertinggi", "ringkas": "Menetapkan tugas MKT, termasuk calon pilihan raya, disiplin, penubuhan badan parti dan pemilihan.", "poin": [["10.2", "Mengesahkan nama calon PRU dan PRN selepas proses pemilihan calon dipatuhi."], ["10.6", "Menentukan taraf pendaftaran ahli, serta menggantung atau melucutkan keahlian."], ["10.7", "Menubuh, menggantung atau membubarkan Badan Perhubungan, Bahagian dan Cawangan serta jawatankuasanya."], ["10.14", "Menubuhkan Jawatankuasa Pemilihan UMNO dan peraturan untuk menyelia pemilihan di semua peringkat."], ["10.16", "Boleh menangguhkan pemilihan MKT, Bahagian dan Cawangan, tetapi tidak lebih 6 bulan selepas PRU dan sekurang-kurangnya satu pemilihan dalam setiap penggal Parlimen."]], "permainan": "Penangguhan pemilihan belum dimainkan; dirancang untuk Fasa B."}, {"no": 12, "tajuk": "Badan Perhubungan", "ringkas": "Badan Perhubungan ditubuhkan di setiap Negeri dan Wilayah Persekutuan untuk menyelaras Bahagian-bahagian di negeri itu.", "poin": [["12.2", "Anggota: Pengerusi, Timbalan Pengerusi, Setiausaha, Bendahari, Ketua Penerangan, Ketua-Ketua Bahagian, dan 2 wakil setiap sayap."], ["12.5", "Pengerusi dan Timbalan Pengerusi dilantik Presiden untuk tempoh MKT dan boleh diberhentikan pada bila-bila masa."], ["12.10", "Konvensyen negeri diadakan sekurang-kurangnya sekali setahun."], ["12.12.1.4", "Pengerusi menerima dan menimbang senarai calon PRU dan PRN negeri."]], "permainan": "Jawatan Pengerusi Badan Perhubungan dilobi dan dilantik melalui kad Negeri di tab Profil."}, {"no": 15, "tajuk": "Jawatankuasa Bahagian", "ringkas": "Jawatankuasa Bahagian mentadbir Bahagian dan dipilih oleh Perwakilan Bahagian setiap 3 tahun.", "poin": [["15.1", "Anggota: Ketua; Timbalan Ketua; 4 Naib Ketua termasuk Ketua Wanita, Pemuda dan Puteri Bahagian; Setiausaha; Bendahari; Ketua Penerangan; sehingga 20 AJK dipilih; dan sehingga 12 dilantik Ketua (termasuk 2 Wanita, 1 Pemuda, 1 Puteri dan 4 orang bawah 30 tahun)."], ["15.3", "Ketua, Timbalan, Naib Ketua, ketua dan naib ketua sayap, dan 20 AJK dipilih setiap 3 tahun; MKT boleh menangguhkan mengikut Fasal 10.16."], ["15.5", "Calon jawatan Jawatankuasa Bahagian mesti menjadi ahli sekurang-kurangnya 3 tahun."], ["15.7", "Jika Ketua berhenti, Timbalan Ketua memangku."], ["15.13.1", "Jawatankuasa Bahagian mencadangkan calon PRU, PRN dan wakil parti ke pihak berkuasa tempatan."]], "permainan": "20 kerusi AJK Bahagian dipertandingkan. Ketua Sayap Bahagian dipaparkan juga sebagai Naib Ketua Bahagian; jawatan lantikan dipaparkan sebagai NPC dalam Struktur Organisasi."}, {"no": 18, "tajuk": "Jawatankuasa Cawangan", "ringkas": "Jawatankuasa Cawangan mentadbir Cawangan dan dipilih oleh Persidangan Cawangan setiap 3 tahun.", "poin": [["18.1", "Anggota: Ketua; Timbalan Ketua; Ketua Wanita, Pemuda dan Puteri Cawangan; Setiausaha; Bendahari; Ketua Penerangan; sehingga 15 AJK dipilih; dan sehingga 6 dilantik Ketua (termasuk 2 Wanita, 1 Pemuda dan 1 Puteri)."], ["18.2", "Ketua, Timbalan Ketua dan 15 AJK dipilih setiap 3 tahun; ketua sayap dipilih oleh persidangan sayap masing-masing."], ["18.5", "Jawatankuasa Cawangan bersidang sekurang-kurangnya sekali setiap 2 bulan."], ["18.8", "AJK dipilih yang berhenti tidak diganti."], ["18.9", "Jika Ketua berhenti, Timbalan Ketua memangku."]], "permainan": "15 kerusi AJK Cawangan dipertandingkan. Orang kedua ialah Timbalan Ketua Cawangan (dahulu Naib Ketua Cawangan dalam permainan); simpanan lama ditukar automatik."}, {"no": 21, "tajuk": "Wanita UMNO, Pergerakan Pemuda dan Pergerakan Puteri", "ringkas": "Sayap Wanita, Pemuda dan Puteri boleh diwujudkan di semua peringkat; MKT membuat peraturannya.", "poin": [["21.1", "Wanita UMNO, Pergerakan Pemuda dan Pergerakan Puteri dalam semua peringkat UMNO boleh diwujudkan dan MKT berkuasa membuat peraturan untuknya."]], "permainan": "Lihat tab Wanita UMNO, Pemuda UMNO dan Puteri UMNO."}, {"no": 25, "tajuk": "Yuran UMNO", "ringkas": "Setiap Ahli Biasa membayar yuran pendaftaran atau yuran lain yang ditetapkan MKT.", "poin": [["25.1", "Yuran ditetapkan oleh MKT dari semasa ke semasa."], ["6.3.3", "Ahli yang tidak menjelaskan yuran tidak boleh menggunakan hak keahliannya."]], "permainan": "Yuran UMNO tidak dimodelkan dalam permainan."}]).sort(function (a, b) { return a.no - b.no; });
  var DOK_UMNO = [
    { id: 'perlembagaan', tajuk: 'Perlembagaan UMNO', sumber: 'Perlembagaan UMNO 2025' },
    { id: 'persidangan', tajuk: "Peraturan Persidangan", sumber: "Peraturan Persidangan UMNO 2025", senarai: [{"no": "3", "tajuk": "Pemilihan Pengerusi", "ringkas": "Pengerusi Tetap dan Timbalan Pengerusi Tetap dipilih setiap 3 tahun dan mengendalikan persidangan.", "poin": [["3.1", "Pengerusi Tetap PAU dan Bahagian dipilih dalam Mesyuarat Perwakilan Bahagian; Pengerusi Tetap Cawangan dalam Persidangan Cawangan."], ["3.2", "PAU boleh memberhentikan Pengerusi atau Timbalannya dengan persetujuan 2/3 ahli yang hadir."]], "label": "Peraturan"}, {"no": "5–6", "tajuk": "Tempat, Masa dan Notis", "ringkas": "MKT menetapkan tarikh PAU dan Perwakilan Bahagian; Bahagian menetapkan tarikh Persidangan Cawangan selepas berunding.", "poin": [["6.1", "Notis PAU sekurang-kurangnya 30 hari, atau 14 hari jika mustahak."], ["6.2", "Notis Mesyuarat Perwakilan Bahagian sekurang-kurangnya 14 hari."], ["6.4", "Notis Persidangan Cawangan sekurang-kurangnya 7 hari."]], "permainan": "Tarikh mesyuarat dalam permainan mengikut takwim: Cawangan bulan 4-6, Bahagian bulan 7, PAU bulan 8.", "label": "Peraturan"}, {"no": "7", "tajuk": "Persidangan Semula", "ringkas": "Peringkat yang gagal bersidang boleh bersidang semula, tetapi kegagalan dalam tahun pemilihan membubarkan jawatankuasa.", "poin": [["7.1", "Cawangan yang tidak aktif setahun diambil alih Jawatankuasa Bahagian melalui Persidangan Khas."], ["7.2", "Bahagian atau Cawangan yang gagal bersidang dalam tahun pemilihan, jawatankuasanya bubar dan jawatankuasa baharu dipilih dalam mesyuarat khas."]], "label": "Peraturan"}, {"no": "8", "tajuk": "Hak Menghadiri Persidangan", "ringkas": "Hanya ahli yang telah menjelaskan yuran berhak hadir dan mengambil bahagian.", "poin": [["8.2", "Cawangan baharu yang menerima sijil pendaftaran sebelum 31 Disember boleh bersidang dan menghantar wakil pada tahun berikutnya."], ["8.4", "Ahli yang muflis boleh hadir dan mengundi tetapi tidak boleh dicalonkan atau memegang jawatan."]], "label": "Peraturan"}, {"no": "11", "tajuk": "Cukup Bilang", "ringkas": "Korum PAU dan Mesyuarat Perwakilan Bahagian ialah 1/4 perwakilan; Persidangan Cawangan 1/4 dan sekurang-kurangnya 25 orang.", "poin": [["11.2", "Jika korum tidak cukup selepas setengah jam, persidangan ditangguhkan."], ["11.3", "Korum Persidangan Cawangan sayap ialah 9 orang."]], "label": "Peraturan"}, {"no": "14", "tajuk": "Agenda Persidangan", "ringkas": "Menetapkan susunan agenda setiap persidangan, termasuk pemilihan.", "poin": [["14.3.8", "Mesyuarat Perwakilan Bahagian memilih Pengerusi Tetap, Timbalannya dan Ahli-ahli MKT."], ["14.4.9–14.4.10", "Mesyuarat Perwakilan sayap Bahagian memilih 10 wakil ke Mesyuarat Perwakilan Bahagian dan 2 wakil ke Perhimpunan Agung sayap."], ["14.6.8", "Persidangan sayap Cawangan memilih 2 wakil ke Mesyuarat Perwakilan sayap Bahagian."]], "permainan": "Wakil sayap G2 dan G10 dalam permainan mengikut peraturan ini.", "label": "Peraturan"}, {"no": "24", "tajuk": "Perkara yang Ditegah", "ringkas": "Ahli tidak boleh menyentuh perkara tertentu dalam ucapan persidangan.", "poin": [["24.1–24.5", "Perkara tidak berkaitan, kes mahkamah, bahasa kasar dan sangkaan jahat terhadap ahli lain."], ["24.6–24.9", "Menggunakan nama atau menyentuh keperibadian Yang di-Pertuan Agong dan Raja-Raja, serta kata-kata yang menimbulkan permusuhan kaum."], ["24.10", "Mempersoalkan keputusan Lembaga Disiplin atau Jawatankuasa Disiplin."]], "label": "Peraturan"}, {"no": "27", "tajuk": "Memutuskan Pengundian", "ringkas": "Keputusan mengikut undi terbanyak; Pengerusi ada undi pemutus jika sama banyak.", "poin": [["27.2", "Undi sama banyak dalam pemilihan jawatan (kecuali Presiden dan Timbalan Presiden): undi kali kedua, dan jika masih sama, cabutan undi."], ["27.3", "Hanya ahli yang hadir boleh mengundi; setiap ahli satu undi."]], "label": "Peraturan"}, {"no": "28", "tajuk": "Pencalonan dan Pengundian", "ringkas": "Pemilihan diselia oleh Jawatankuasa Pemilihan yang bebas.", "poin": [["28.3", "Calon mendaftar di Ibu Pejabat UMNO dan mesti memenuhi kriteria Perlembagaan."], ["28.4", "Pemilihan MKT, Jawatankuasa Bahagian dan wakil ke PAU secara undi sulit; Jawatankuasa Cawangan secara sulit atau angkat tangan."], ["28.5", "Pengundi mesti menanda tepat bilangan jawatan; undi kurang atau lebih tidak sah."], ["28.8", "Ahli yang muflis, dikenakan tindakan Akta Pertubuhan atau dihukum disiplin tidak boleh bertanding."]], "permainan": "Pemain yang dihukum disiplin tidak boleh bertanding (Tataetika dan Fasal 20.10).", "label": "Peraturan"}] },
    { id: 'wanita', tajuk: "Wanita UMNO", sumber: "Peraturan Wanita UMNO 2025", senarai: [{"no": "4", "tajuk": "Keahlian", "ringkas": "Wanita UMNO terbuka kepada wanita berumur 36 tahun ke atas, dikira pada 1 Januari tahun berkenaan.", "poin": [["4.2", "Ahli sayap menjadi ahli di Cawangan UMNO tempat ia berdaftar sebagai Ahli Biasa, dan tidak boleh menjadi ahli lebih daripada satu Cawangan."]], "permainan": "Umur dikira pada 1 Januari setiap tahun dalam permainan.", "label": "Fasal"}, {"no": "5", "tajuk": "Jawatankuasa Wanita Malaysia", "ringkas": "Ketua Wanita dipilih oleh Mesyuarat Perwakilan Wanita Bahagian setiap 3 tahun dan bertaraf Timbalan Presiden UMNO (ex-officio).", "poin": [["5.1", "Anggota: Ketua, Naib Ketua, Setiausaha Agung, Setiausaha, Bendahari, Ketua Penerangan, sehingga 20 AJK dipilih dan sehingga 5 dilantik Ketua."], ["5.3", "Naib Ketua dan 20 AJK dipilih oleh Mesyuarat Perwakilan sayap Bahagian setiap 3 tahun."], ["5.6", "Calon mesti menjadi ahli UMNO sekurang-kurangnya 3 tahun."]], "permainan": "20 kerusi AJK sayap Pusat dipertandingkan.", "label": "Fasal"}, {"no": "9", "tajuk": "Perhimpunan Agung Wanita", "ringkas": "Diadakan setahun sekali sebelum Perhimpunan Agung UMNO.", "poin": [["9.2", "Anggota termasuk pegawai sayap Bahagian dan 2 wakil dari setiap Bahagian."], ["9.4", "Memilih 10 wakil ke Perhimpunan Agung UMNO."]], "label": "Fasal"}, {"no": "12", "tajuk": "Jawatankuasa Wanita Bahagian", "ringkas": "Ketua, Naib Ketua, pegawai sayap, sehingga 15 AJK dipilih dan sehingga 3 dilantik Ketua; dipilih setiap 3 tahun.", "poin": [["12.3", "Ketua sayap Bahagian juga Naib Ketua Bahagian UMNO (Perlembagaan Fasal 15.1.3)."]], "permainan": "15 kerusi AJK sayap Bahagian dipertandingkan.", "label": "Fasal"}, {"no": "17", "tajuk": "Jawatankuasa Wanita Cawangan", "ringkas": "Ketua, Naib Ketua, pegawai sayap, sehingga 7 AJK dipilih dan sehingga 3 dilantik Ketua; dipilih setiap 3 tahun.", "poin": [["17.1", "Ketua sayap Cawangan juga ahli Jawatankuasa Cawangan UMNO (Perlembagaan Fasal 18.1.3)."]], "permainan": "7 kerusi AJK sayap Cawangan dipertandingkan.", "label": "Fasal"}] },
    { id: 'pemuda', tajuk: "Pemuda UMNO", sumber: "Peraturan Pergerakan Pemuda UMNO 2025", senarai: [{"no": "4", "tajuk": "Keahlian", "ringkas": "Setiap ahli UMNO lelaki berumur tidak lebih 40 tahun, dikira pada 1 Januari, secara automatik menjadi ahli Pemuda.", "poin": [["4.2", "Ahli sayap menjadi ahli di Cawangan UMNO tempat ia berdaftar sebagai Ahli Biasa, dan tidak boleh menjadi ahli lebih daripada satu Cawangan."], ["5.3", "Naib Ketua dan AJK Pemuda Malaysia boleh meneruskan khidmat hingga tamat penggal walaupun sudah berumur 40 tahun."]], "permainan": "Umur dikira pada 1 Januari setiap tahun dalam permainan.", "label": "Fasal"}, {"no": "5", "tajuk": "Jawatankuasa Pemuda Malaysia", "ringkas": "Ketua Pemuda dipilih oleh Mesyuarat Perwakilan Pemuda Bahagian setiap 3 tahun dan menjadi Naib Presiden UMNO.", "poin": [["5.1", "Anggota: Ketua, Naib Ketua, Setiausaha Agung, Setiausaha, Bendahari, Ketua Penerangan, sehingga 20 AJK dipilih dan sehingga 5 dilantik Ketua."], ["5.3", "Naib Ketua dan 20 AJK dipilih oleh Mesyuarat Perwakilan sayap Bahagian setiap 3 tahun."], ["5.6", "Calon mesti menjadi ahli UMNO sekurang-kurangnya 3 tahun."]], "permainan": "20 kerusi AJK sayap Pusat dipertandingkan.", "label": "Fasal"}, {"no": "9", "tajuk": "Perhimpunan Agung Pemuda", "ringkas": "Diadakan setahun sekali sebelum Perhimpunan Agung UMNO.", "poin": [["9.2", "Anggota termasuk pegawai sayap Bahagian dan 2 wakil dari setiap Bahagian."], ["9.4", "Memilih 10 wakil ke Perhimpunan Agung UMNO."]], "label": "Fasal"}, {"no": "12", "tajuk": "Jawatankuasa Pemuda Bahagian", "ringkas": "Ketua, Naib Ketua, pegawai sayap, sehingga 15 AJK dipilih dan sehingga 3 dilantik Ketua; dipilih setiap 3 tahun.", "poin": [["12.3", "Ketua sayap Bahagian juga Naib Ketua Bahagian UMNO (Perlembagaan Fasal 15.1.3)."]], "permainan": "15 kerusi AJK sayap Bahagian dipertandingkan.", "label": "Fasal"}, {"no": "17", "tajuk": "Jawatankuasa Pemuda Cawangan", "ringkas": "Ketua, Naib Ketua, pegawai sayap, sehingga 7 AJK dipilih dan sehingga 3 dilantik Ketua; dipilih setiap 3 tahun.", "poin": [["17.1", "Ketua sayap Cawangan juga ahli Jawatankuasa Cawangan UMNO (Perlembagaan Fasal 18.1.3)."]], "permainan": "7 kerusi AJK sayap Cawangan dipertandingkan.", "label": "Fasal"}] },
    { id: 'puteri', tajuk: "Puteri UMNO", sumber: "Peraturan Pergerakan Puteri UMNO 2025", senarai: [{"no": "4", "tajuk": "Keahlian", "ringkas": "Puteri UMNO terbuka kepada wanita berumur 35 tahun ke bawah, dikira pada 1 Januari tahun berkenaan.", "poin": [["4.2", "Ahli sayap menjadi ahli di Cawangan UMNO tempat ia berdaftar sebagai Ahli Biasa, dan tidak boleh menjadi ahli lebih daripada satu Cawangan."], ["4.2.1", "Had umur jawatan Ketua Puteri Malaysia ialah 40 tahun; boleh menghabiskan penggal jika melepasinya."], ["4.2.2–4.2.3", "Had umur jawatan Puteri lain (Negeri, Bahagian, Cawangan) ialah 35 tahun; boleh menghabiskan penggal."]], "permainan": "Umur dikira pada 1 Januari setiap tahun dalam permainan.", "label": "Fasal"}, {"no": "5", "tajuk": "Jawatankuasa Puteri Malaysia", "ringkas": "Ketua Puteri dipilih oleh Mesyuarat Perwakilan Puteri Bahagian setiap 3 tahun dan bertaraf Naib Presiden UMNO.", "poin": [["5.1", "Anggota: Ketua, Naib Ketua, Setiausaha Agung, Setiausaha, Bendahari, Ketua Penerangan, sehingga 20 AJK dipilih dan sehingga 5 dilantik Ketua."], ["5.3", "Naib Ketua dan 20 AJK dipilih oleh Mesyuarat Perwakilan sayap Bahagian setiap 3 tahun."], ["5.6", "Calon mesti menjadi ahli UMNO sekurang-kurangnya 3 tahun."]], "permainan": "20 kerusi AJK sayap Pusat dipertandingkan.", "label": "Fasal"}, {"no": "9", "tajuk": "Perhimpunan Agung Puteri", "ringkas": "Diadakan setahun sekali sebelum Perhimpunan Agung UMNO.", "poin": [["9.2", "Anggota termasuk pegawai sayap Bahagian dan 2 wakil dari setiap Bahagian."], ["9.4", "Memilih 10 wakil ke Perhimpunan Agung UMNO."]], "label": "Fasal"}, {"no": "12", "tajuk": "Jawatankuasa Puteri Bahagian", "ringkas": "Ketua, Naib Ketua, pegawai sayap, sehingga 15 AJK dipilih dan sehingga 3 dilantik Ketua; dipilih setiap 3 tahun.", "poin": [["12.3", "Ketua sayap Bahagian juga Naib Ketua Bahagian UMNO (Perlembagaan Fasal 15.1.3)."]], "permainan": "15 kerusi AJK sayap Bahagian dipertandingkan.", "label": "Fasal"}, {"no": "17", "tajuk": "Jawatankuasa Puteri Cawangan", "ringkas": "Ketua, Naib Ketua, pegawai sayap, sehingga 7 AJK dipilih dan sehingga 3 dilantik Ketua; dipilih setiap 3 tahun.", "poin": [["17.1", "Ketua sayap Cawangan juga ahli Jawatankuasa Cawangan UMNO (Perlembagaan Fasal 18.1.3)."]], "permainan": "7 kerusi AJK sayap Cawangan dipertandingkan.", "label": "Fasal"}] },
    { id: 'tataetika', tajuk: "Tataetika Ahli", sumber: "Tataetika Ahli UMNO 2025", senarai: [{"no": "2", "tajuk": "Tafsiran", "ringkas": "Menerangkan istilah Tataetika.", "poin": [["2.1.2", "Tempoh Pemilihan bermula 6 bulan sebelum proses pemilihan hingga 6 bulan selepas pemilihan tamat."], ["2.1.3", "Balasan termasuk wang, saham, konsesi, hadiah, pakej percutian, jamuan, tambang dan gelaran."]], "permainan": "Tempoh Pemilihan belum dimodelkan secara khusus dalam permainan.", "label": "Perkara"}, {"no": "3", "tajuk": "Kesetiaan", "ringkas": "Ahli mesti mematuhi Perlembagaan, perintah dan keputusan parti, menjaga rahsia dan maruah parti.", "poin": [["Contoh", "Mengkritik keputusan Lembaga Disiplin secara terbuka, menyokong parti lawan, membawa hal parti ke mahkamah, atau mengkritik pemimpin di media tanpa saluran parti."]], "label": "Perkara"}, {"no": "4", "tajuk": "Pengaruh Tidak Wajar", "ringkas": "Ahli dilarang memaksa, mengancam atau menghalang ahli lain menjalankan hak dalam parti.", "poin": [["Contoh", "Mengugut tiada bantuan atau tiada lantikan jika seseorang tidak mengundi pihak tertentu."]], "label": "Perkara"}, {"no": "5", "tajuk": "Salahlaku", "ringkas": "Senarai salahlaku dalam pemilihan parti.", "poin": [["5.1", "Rasuah politik: menyalahgunakan kuasa, atau memberi wang, hadiah atau faedah untuk mendapatkan undi."], ["5.2", "Kekerasan dan ugutan, termasuk mengugut menarik balik peruntukan, projek atau lantikan."], ["5.3–5.4", "Menyiarkan fitnah, celaan atau kenyataan palsu tentang ahli lain di media atau internet."], ["5.5", "Ejen, pelobi, pengurus kempen atau perayu undi dilarang, kecuali majlis anjuran Ibu Pejabat atau Badan Perhubungan."], ["5.6", "Semasa Tempoh Pemilihan, dilarang menganjurkan perhimpunan, jamuan atau majlis (termasuk kenduri, tahlil dan majlis kesyukuran) untuk meraih undi."]], "permainan": "Politik wang dan kempen kotor dalam permainan boleh mencetuskan aduan dan hukuman Fasal 20.10.", "label": "Perkara"}, {"no": "6", "tajuk": "Derma kepada Parti", "ringkas": "Derma atau bantuan peribadi untuk mendapat undi dilarang; semua derma mesti disalurkan melalui MKT atau Badan Perhubungan.", "poin": [["6.3", "Pemberian yang tidak melalui saluran itu dianggap melanggar Perkara 6.1."]], "label": "Perkara"}, {"no": "7", "tajuk": "Pernyataan Akhbar atau Awam", "ringkas": "Ahli dilarang membuat kenyataan yang merosakkan imej parti tentang dasar atau keputusan parti, termasuk keputusan disiplin.", "poin": [["7.2", "Pelanggaran boleh dihukum di bawah Fasal 20.10 kerana menghina parti."]], "label": "Perkara"}, {"no": "8", "tajuk": "Tingkah Laku Pemegang Jawatan", "ringkas": "Pemegang jawatan dilarang menyalahgunakan kuasa dalam pentadbiran dan mesyuarat parti.", "poin": [["8.1", "Contoh: enggan menerima ahli baharu atau yuran, projek pilih kasih, wang parti bercampur wang peribadi."], ["8.2", "Contoh: mesyuarat tanpa notis atau korum, undian rakit, minit palsu dan cawangan hantu."]], "label": "Perkara"}, {"no": "10–11", "tajuk": "Pihak Ketiga dan Hukuman", "ringkas": "Prinsipal boleh dihukum bersama ejennya; hukuman mengikut Fasal 20.10 Perlembagaan.", "poin": [["10.2", "Pengadu atau saksi yang menarik balik keterangan tanpa sebab munasabah boleh dianggap menerima imbuhan."]], "label": "Perkara"}] }
  ];

  /* ------------------------------------------------------------------ */
  /* v13.1: Perlembagaan MCA (pindaan sehingga 1-12-2019, diterima Pendaftar Pertubuhan 9-2-2021). RINGKASAN untuk rujukan permainan; label 'Perkara'. */
  var SUMBER_MCA = 'Perlembagaan MCA (pindaan sehingga 1-12-2019)';
  var FASAL_MCA = [
 {
  "no": "6",
  "tajuk": "Tujuan Parti",
  "ringkas": "MCA berjuang mempertahankan kemerdekaan negara, Perlembagaan Persekutuan dan demokrasi berparlimen berbilang kaum, serta membela kepentingan sah rakyat Malaysia keturunan Cina dan semua kaum.",
  "poin": [
   [
    "6.5",
    "Mengiktiraf dan melindungi hak dan kepentingan sah rakyat Malaysia keturunan Cina dan kaum lain seperti dalam Perlembagaan Persekutuan."
   ],
   [
    "6.14",
    "Bekerjasama dengan parti politik lain yang sehaluan untuk perkembangan politik kepartian yang sihat."
   ],
   [
    "6.15",
    "Memelihara penggunaan dan pembelajaran bahasa Cina dalam rangka Perkara 152 Perlembagaan Persekutuan."
   ]
  ],
  "permainan": "Latar nilai parti. Ia tidak mempengaruhi pengiraan permainan secara langsung."
 },
 {
  "no": "9",
  "tajuk": "Keahlian",
  "ringkas": "Keahlian terbuka kepada warganegara Malaysia keturunan Cina berumur 18 tahun ke atas yang bukan ahli parti politik lain. Bukan Cina boleh menjadi Ahli Bersekutu tanpa hak mengundi.",
  "poin": [
   [
    "7",
    "Empat kategori: ahli biasa, ahli seumur hidup, ahli kehormat dan ahli bersekutu."
   ],
   [
    "13, 16",
    "Yuran ahli biasa RM2 setahun. Ahli yang tertunggak yuran hilang hak hadir, mengundi dan memegang jawatan."
   ]
  ],
  "permainan": "Pemain dianggap ahli biasa. Bilangan ahli setiap Cawangan ialah anggaran permainan."
 },
 {
  "no": "20",
  "tajuk": "Pegawai Parti",
  "ringkas": "Presiden, Timbalan Presiden, 4 Naib Presiden dan 25 ahli JKP dipilih oleh perwakilan ke Perhimpunan Bahagian. Ketua Pemuda dan Ketua Wanita kebangsaan secara automatik menjadi Naib Presiden.",
  "poin": [
   [
    "21A",
    "Tiada sesiapa boleh menjadi Presiden lebih daripada 9 tahun."
   ],
   [
    "22, 22A",
    "Setiausaha Agung, Bendahari Agung, Setiausaha Organisasi Kebangsaan dan timbalan mereka dilantik oleh Presiden."
   ],
   [
    "40",
    "Jika Presiden berhenti, Timbalan Presiden memangku sehingga pemilihan seterusnya."
   ]
  ],
  "permainan": "Pemilihan Pusat menggunakan sokongan perwakilan Bahagian (Jelajah Bahagian). Had 9 tahun dan kuasa lantikan Presiden dilaksanakan dalam kad MCA di tab Profil."
 },
 {
  "no": "27",
  "tajuk": "Perhimpunan Agung",
  "ringkas": "Kuasa tertinggi parti. Bermesyuarat sekurang-kurangnya sekali setahun, paling lewat 31 Ogos.",
  "poin": [
   [
    "30",
    "Mesyuarat Agung Luar Biasa boleh dipanggil oleh Presiden, satu pertiga ahli JKP atau satu pertiga perwakilan."
   ],
   [
    "35",
    "Perhimpunan Agung boleh memecat mana-mana pegawai parti dengan dua pertiga undi."
   ]
  ],
  "permainan": "Perhimpunan Agung berlaku pada bulan 8. Jika sokongan AJK anda sebagai Presiden rendah, Mesyuarat Agung Luar Biasa boleh menjatuhkan anda."
 },
 {
  "no": "38",
  "tajuk": "Jawatankuasa Pusat dan Majlis Presiden",
  "ringkas": "JKP menjalankan kuasa eksekutif parti. Majlis Presiden (Presiden, Timbalan, Naib Presiden, Setiausaha Agung, Bendahari Agung, Setiausaha Organisasi dan sehingga 10 lantikan) mentadbir urusan harian.",
  "poin": [
   [
    "38.11",
    "Sehingga 8 ahli JKP dilantik oleh Presiden."
   ],
   [
    "45.12",
    "JKP memilih calon PRU dan PRN serta membahagikan kawasan."
   ]
  ],
  "permainan": "Kuota kerusi MCA dalam BN (40 Parlimen, 90 DUN) ialah andaian permainan."
 },
 {
  "no": "52",
  "tajuk": "Jawatankuasa Perhubungan Negeri",
  "ringkas": "Ditubuhkan oleh JKP di setiap negeri untuk menyelia Bahagian dan Cawangan. Pengerusi Negeri dilantik oleh Presiden.",
  "poin": [
   [
    "54, 55",
    "Pengerusi Negeri dilantik Presiden; Timbalan, Setiausaha dan Bendahari Negeri dilantik Pengerusi Negeri."
   ]
  ],
  "permainan": "Menggunakan sistem Jawatankuasa Perhubungan Negeri sedia ada (dekati Presiden)."
 },
 {
  "no": "65",
  "tajuk": "Bahagian dan Perhimpunan Bahagian",
  "ringkas": "Satu Bahagian bagi setiap kawasan Parlimen, dengan sekurang-kurangnya 100 ahli. Perhimpunan Bahagian diadakan pada bulan Jun.",
  "poin": [
   [
    "67",
    "Setiap Bahagian memilih sehingga 30 perwakilan ke Perhimpunan Agung, termasuk satu kerusi untuk Wanita berumur 40 tahun ke bawah."
   ],
   [
    "75",
    "Perhimpunan Bahagian boleh memecat ahli Jawatankuasa Bahagian dengan dua pertiga undi."
   ]
  ],
  "permainan": "Kawasan operasi permainan ialah semua 165 kawasan Parlimen Semenanjung; peratus pengundi Cina menentukan kuota kerusi dan saiz Bahagian (andaian)."
 },
 {
  "no": "92",
  "tajuk": "Cawangan dan Perhimpunan Cawangan",
  "ringkas": "Cawangan boleh ditubuhkan dengan sekurang-kurangnya 50 ahli. Perhimpunan Cawangan diadakan setiap April.",
  "poin": [
   [
    "94",
    "Setiap Cawangan memilih sehingga 30 perwakilan ke Perhimpunan Bahagian, termasuk satu kerusi Wanita."
   ],
   [
    "101",
    "Perhimpunan Cawangan boleh memecat ahli Jawatankuasa Cawangan dengan dua pertiga undi."
   ]
  ],
  "permainan": "Cawangan dalam permainan ialah Daerah Mengundi sebenar. Jika sokongan akar umbi bawah 30%, usul pecat boleh dibawa terhadap anda."
 },
 {
  "no": "120",
  "tajuk": "Calon dan Perwakilan",
  "ringkas": "Ahli mesti menjadi ahli sekurang-kurangnya 3 tahun untuk bertanding pemilihan parti, PRU atau PRN. Presiden boleh mengecualikan dengan sebab.",
  "poin": [
   [
    "117",
    "Perwakilan ke Perhimpunan Agung mesti berumur 21 tahun ke atas dan ahli sekurang-kurangnya 3 tahun."
   ],
   [
    "122",
    "Calon PRU dan PRN perlu sijil pencalonan yang ditandatangani Presiden."
   ]
  ],
  "permainan": "Syarat 3 tahun keahlian dikenakan pada semua pertandingan jawatan dan PRU/PRN."
 },
 {
  "no": "123",
  "tajuk": "Disiplin Parti",
  "ringkas": "Lembaga Disiplin (5 ahli) menyiasat dan menasihati Majlis Presiden, yang memutuskan hukuman. Rayuan kepada JKP dalam 14 hari; keputusan JKP muktamad.",
  "poin": [
   [
    "45.24",
    "Pegawai parti yang dipilih hanya boleh digantung atau dipecat dengan sokongan dua pertiga JKP."
   ],
   [
    "175",
    "Ahli yang menyaman parti tanpa menggunakan semua saluran dalaman terlebih dahulu terus hilang keahlian."
   ]
  ],
  "permainan": "Menggunakan sistem Tataetika dan disiplin sedia ada."
 },
 {
  "no": "167",
  "tajuk": "Kitaran Pemilihan dan Peruntukan Am",
  "ringkas": "Pemilihan parti diadakan sekali bagi setiap PRU, bermula paling lewat 6 bulan selepas PRU atau 36 bulan selepas pemilihan lalu, mengikut mana yang lebih lewat.",
  "poin": [
   [
    "157",
    "Ahli jawatankuasa yang tidak hadir 3 mesyuarat berturut-turut hilang kerusi, kecuali rayuannya diterima dalam 7 hari."
   ],
   [
    "142",
    "Ahli Parlimen dan ADUN membayar sumbangan bulanan kepada parti."
   ],
   [
    "168",
    "Pindaan perlembagaan memerlukan dua pertiga undi Perhimpunan Agung."
   ]
  ],
  "permainan": "Tahun pemilihan MCA dalam permainan dikira daripada tarikh PRU. Tiga bulan tanpa sebarang tindakan dikira tidak hadir 3 mesyuarat. Sumbangan wakil rakyat RM 500 sebulan (andaian)."
 },
 {
  "no": "176",
  "tajuk": "Sayap dan Sekolah Parti",
  "ringkas": "MCA mempunyai sayap Pemuda dan Wanita yang ditadbir mengikut peraturan JKP, serta sebuah Sekolah Parti untuk melatih ahli.",
  "poin": [
   [
    "176",
    "Sayap Pemuda dan Wanita ditubuhkan di bawah peraturan tetap JKP."
   ],
   [
    "178",
    "Sekolah Parti menyediakan latihan untuk ahli."
   ]
  ],
  "permainan": "Tiada sayap Puteri dalam MCA."
 }
];
  /* v13.3: Perlembagaan MIC (diterima Perhimpunan Agung ke-71, 24-9-2017; diluluskan ROS 2-1-2018). RINGKASAN untuk rujukan permainan; label 'Perkara'. */
  var SUMBER_MIC = 'Perlembagaan MIC (pindaan sehingga 24-9-2017)';
  var FASAL_MIC = [
 {
  "no": "6",
  "tajuk": "Tujuan Parti",
  "ringkas": "MIC mempertahankan kemerdekaan dan kedaulatan Malaysia, Perlembagaan Persekutuan dan Rukun Negara, serta membela kepentingan politik, ekonomi, pendidikan, budaya dan sosial rakyat Malaysia keturunan India.",
  "poin": [
   [
    "6.3",
    "Menjaga dan memajukan kepentingan politik, ekonomi, pendidikan, budaya dan sosial kaum India di Malaysia."
   ],
   [
    "6.5",
    "Memupuk dan mengekalkan keharmonian antara kaum."
   ],
   [
    "6.7",
    "Bekerjasama dengan pertubuhan lain yang sehaluan."
   ]
  ]
 },
 {
  "no": "7",
  "tajuk": "Keahlian",
  "ringkas": "Keahlian terbuka kepada warganegara Malaysia keturunan India berumur lebih 18 tahun yang menerima tujuan parti dan mematuhi perlembagaan.",
  "poin": [
   [
    "7.1",
    "Warganegara Malaysia keturunan India, berumur lebih 18 tahun."
   ],
   [
    "8B",
    "Keahlian terus melalui Setiausaha Agung, diluluskan CWC dan dipindahkan ke Cawangan tempat bermastautin atau mengundi."
   ],
   [
    "9.4",
    "Ahli parti politik lain tidak boleh diterima."
   ],
   [
    "10.5",
    "Ahli yang hadir atau bertanding dalam Mesyuarat Agung Cawangan tahun pemilihan tidak boleh berpindah Cawangan sehingga Perhimpunan Agung tahun itu."
   ]
  ],
  "permainan": "Pindah Cawangan dikunci sepanjang Tahun Pemilihan."
 },
 {
  "no": "12",
  "tajuk": "Yuran Keahlian",
  "ringkas": "Yuran tahunan RM 4 dan yuran masuk RM 3. Yuran mesti dibayar sebelum 30 November setiap tahun; jika tidak, keahlian luput.",
  "poin": [
   [
    "12.1",
    "Yuran tahunan RM 4; yuran masuk RM 3."
   ],
   [
    "12.4",
    "Ahli seumur hidup: sekurang-kurangnya RM 500."
   ],
   [
    "15.5",
    "Gagal membayar yuran dalam tempoh = keahlian tamat."
   ],
   [
    "77.4",
    "Cawangan yang tidak menghantar yuran sebelum 15 Disember tidak boleh menyertai mesyuarat parti."
   ]
  ],
  "permainan": "Yuran RM 4 dipotong automatik pada bulan 11."
 },
 {
  "no": "17",
  "tajuk": "Penubuhan Cawangan",
  "ringkas": "Cawangan ditubuhkan di sesuatu lokaliti dengan sekurang-kurangnya 60 ahli; keahlian Cawangan antara 60 dan 200 orang, dengan minimum Wanita, Puteri, Pemuda dan Putera.",
  "poin": [
   [
    "17.1",
    "Permohonan ditandatangani sekurang-kurangnya 60 penduduk lokaliti."
   ],
   [
    "17.1B",
    "Minimum 5 Wanita dan 2 Puteri, serta 5 Pemuda dan 2 Putera dalam setiap Cawangan."
   ],
   [
    "17.10",
    "Tiada Cawangan baharu dari 1 Januari tahun pemilihan sehingga Perhimpunan Agung."
   ],
   [
    "17.12",
    "Keahlian Cawangan tidak kurang 60 dan tidak lebih 200 orang."
   ]
  ],
  "permainan": "Cawangan ialah Daerah Mengundi sebenar; bilangan ahli ialah anggaran permainan (60 hingga 200)."
 },
 {
  "no": "18",
  "tajuk": "Cawangan Mati",
  "ringkas": "Cawangan dianggap mati jika tidak mengadakan Mesyuarat Agung Tahunan, kurang 3 mesyuarat jawatankuasa, tidak diwakili 3 mesyuarat Bahagian berturut-turut, atau Pengerusi dan Timbalan kosong serentak.",
  "poin": [
   [
    "18.1",
    "Syarat Cawangan dianggap mati."
   ],
   [
    "18.2",
    "CWC boleh mengarahkan Kongres Negeri menghidupkan semula Cawangan mati."
   ],
   [
    "18.4",
    "Cawangan mati tidak boleh menjalankan sebarang aktiviti."
   ]
  ],
  "permainan": "Pengerusi Cawangan yang kurang 3 bulan aktif setahun menerima amaran Cawangan mati (Reputasi -3, akar umbi -5)."
 },
 {
  "no": "20",
  "tajuk": "Mesyuarat Agung Tahunan Cawangan",
  "ringkas": "Diadakan paling lewat 31 Mac. Setiap 3 tahun memilih Pengerusi, Timbalan Pengerusi, 7 AJK, ketua dan timbalan ketua sayap, juruaudit dan perwakilan ke Bahagian.",
  "poin": [
   [
    "19.1",
    "Mesyuarat Agung Tahunan Cawangan paling lewat 31 Mac."
   ],
   [
    "20.2.2(a)",
    "Pengerusi Cawangan melantik Setiausaha, Penolong Setiausaha, Bendahari dan Pegawai Penerangan daripada 7 AJK."
   ],
   [
    "21.2",
    "Calon Pengerusi Cawangan mesti ahli berterusan Cawangan itu sekurang-kurangnya 3 tahun."
   ],
   [
    "75.1",
    "Satu perwakilan ke Bahagian bagi setiap 60 ahli; Pengerusi Cawangan perwakilan secara automatik."
   ]
  ],
  "permainan": "Pemilihan Cawangan pada bulan 3. Pengerusi Cawangan memilih pegawai Cawangan dalam kad MIC."
 },
 {
  "no": "34",
  "tajuk": "Bahagian",
  "ringkas": "Bahagian ditubuhkan di setiap kawasan Parlimen. Persidangan Perwakilan Bahagian diadakan paling lewat 31 Mei; Pengerusi dan Timbalan Pengerusi Bahagian dipilih setiap 3 tahun.",
  "poin": [
   [
    "31.1",
    "Satu Bahagian bagi setiap kawasan Parlimen, minimum 5 Cawangan."
   ],
   [
    "32.2",
    "Persidangan Perwakilan Bahagian paling lewat 31 Mei."
   ],
   [
    "34.3",
    "Calon Pengerusi atau Timbalan Pengerusi Bahagian mesti sedang menjadi Pengerusi Cawangan, ahli 5 tahun dan 3 tahun AJK Cawangan."
   ],
   [
    "34.4",
    "Pengerusi Bahagian maksimum 3 penggal berturut-turut; boleh bertanding semula selepas rehat 1 penggal."
   ],
   [
    "37.4",
    "Pengerusi Cawangan yang tidak hadir 3 mesyuarat Bahagian berturut-turut dianggap meletak jawatan."
   ]
  ],
  "permainan": "Pemilihan Bahagian pada bulan 5. Tiga bulan tanpa sebarang tindakan dikira tidak hadir 3 mesyuarat."
 },
 {
  "no": "42",
  "tajuk": "Kongres Negeri",
  "ringkas": "10 ahli Kongres Negeri dipilih setiap 3 tahun oleh 6 pegawai semua Cawangan dan ketua sayap Bahagian di negeri itu. Presiden melantik Pengerusi dan Timbalan Pengerusi Negeri daripada 10 ahli itu.",
  "poin": [
   [
    "42.3",
    "Pengerusi dan Timbalan Pengerusi Negeri dilantik Presiden daripada 10 ahli yang dipilih."
   ],
   [
    "42.3(B)",
    "Pengerusi Negeri ialah ahli CWC secara automatik."
   ],
   [
    "42A",
    "Calon mesti sedang Pengerusi Cawangan, ahli 5 tahun, dan pernah 1 penggal dalam Jawatankuasa Bahagian atau CWC."
   ]
  ],
  "permainan": "Pemilihan Kongres Negeri pada bulan 7 (Julai) tahun pemilihan (andaian)."
 },
 {
  "no": "46",
  "tajuk": "Jawatankuasa Kerja Pusat (CWC)",
  "ringkas": "CWC terdiri daripada Presiden, Timbalan Presiden, 3 Naib Presiden, 13 Pengerusi Negeri, 21 ahli dipilih, ketua dan timbalan ketua 4 sayap, 4 wakil sayap dan sehingga 9 ahli lantikan Presiden.",
  "poin": [
   [
    "46.15",
    "Presiden boleh melantik sehingga 9 ahli CWC."
   ],
   [
    "47",
    "Timbalan Presiden, 3 Naib Presiden dan 21 ahli CWC dipilih setiap 3 tahun."
   ],
   [
    "49",
    "Presiden melantik Setiausaha Agung, Bendahari Agung dan Ketua Penerangan daripada ahli CWC."
   ],
   [
    "56.1",
    "CWC bermesyuarat sekurang-kurangnya sekali setiap 3 bulan."
   ]
  ]
 },
 {
  "no": "58",
  "tajuk": "Pemilihan Presiden",
  "ringkas": "Presiden dipilih secara undi sulit oleh 6 pegawai semua Cawangan, ketua 4 sayap semua Cawangan dan ahli CWC. Penggal 3 tahun, maksimum 3 penggal berturut-turut.",
  "poin": [
   [
    "58.2",
    "Pengundi: 6 pegawai Cawangan, ketua Pemuda, Wanita, Putera dan Puteri Cawangan, serta ahli CWC."
   ],
   [
    "58.2.A",
    "Maksimum 3 penggal berturut-turut."
   ],
   [
    "58.5",
    "Calon: ahli 10 tahun, sedang Pengerusi Cawangan, 3 penggal Pengerusi Cawangan dan 2 penggal penuh ahli CWC."
   ],
   [
    "58.8",
    "Calon perlu sekurang-kurangnya 250 penamaan daripada Pengerusi Cawangan atau ahli CWC."
   ]
  ],
  "permainan": "Presiden dipilih bersama jawatan Pusat lain pada Perhimpunan Agung bulan 9 (andaian). Bina penamaan melalui Rangkaian Pengerusi Cawangan."
 },
 {
  "no": "59",
  "tajuk": "Timbalan Presiden, Naib Presiden dan CWC",
  "ringkas": "Semua calon mesti sedang menjadi Pengerusi Cawangan. Timbalan Presiden perlu 10 tahun keahlian; Naib Presiden dan ahli CWC perlu 5 tahun. Calon hanya boleh bertanding satu jawatan Pusat.",
  "poin": [
   [
    "59.1",
    "Timbalan Presiden: ahli 10 tahun, sedang Pengerusi Cawangan dan 2 penggal dalam Jawatankuasa Bahagian atau CWC."
   ],
   [
    "59.1A",
    "Naib Presiden: ahli 5 tahun, sedang Pengerusi Cawangan dan 1 penggal."
   ],
   [
    "59.3",
    "Hanya satu jawatan Pusat boleh dipertandingkan."
   ],
   [
    "59A",
    "Pengundi: 6 pegawai Cawangan, ketua sayap Bahagian dan ahli CWC."
   ]
  ]
 },
 {
  "no": "61",
  "tajuk": "Tindakan Disiplin oleh Presiden",
  "ringkas": "Presiden boleh menggantung keahlian sehingga 12 bulan, atau memecat ahli selepas berunding dengan Timbalan Presiden. Rayuan ke CWC dalam 14 hari.",
  "poin": [
   [
    "14.2.1",
    "Ahli tidak boleh membuat kenyataan media yang memudaratkan parti."
   ],
   [
    "61.1",
    "Gantung keahlian sehingga 12 bulan."
   ],
   [
    "61.3",
    "Rayuan bertulis ke CWC dalam 14 hari."
   ],
   [
    "73.1",
    "Perhimpunan Agung Luar Biasa jika diminta oleh sekurang-kurangnya satu perempat Bahagian."
   ],
   [
    "85",
    "Tidak hadir 3 mesyuarat jawatankuasa berturut-turut tanpa penjelasan dianggap meletak jawatan."
   ],
   [
    "94",
    "Wakil rakyat dan pemegang jawatan melalui parti membuat sumbangan bulanan."
   ]
  ],
  "permainan": "Gantung 6 bulan jika sidang media silap cakap atau kontra-naratif gagal semasa kedekatan dengan Presiden bawah 20 (andaian). Sumbangan wakil rakyat RM 500 sebulan (andaian)."
 },
 {
  "no": "62",
  "tajuk": "Sayap",
  "ringkas": "MIC mempunyai 4 sayap: Pemuda (lelaki bawah 40), Wanita (semua ahli perempuan), Puteri (perempuan bawah 35) dan Putera (lelaki bawah 30). Ketua sayap ialah ahli CWC.",
  "poin": [
   [
    "4.18",
    "Takrif sayap Pemuda, Wanita, Puteri dan Putera."
   ],
   [
    "70.3",
    "100 perwakilan setiap satu daripada Pemuda dan Wanita, dan 30 setiap satu daripada Puteri dan Putera, ke Perhimpunan Agung."
   ],
   [
    "86(A)",
    "Calon yang mendaftar sebelum melepasi had umur boleh menghabiskan penggal."
   ]
  ],
  "permainan": "Pemain Putera bertukar ke Pemuda pada umur 30."
 }
];
  function mcaKini() { try { var P = W && W.MyPolitikParti, k = P && P.kini ? P.kini() : null; return k === 'MCA' || k === 'MIC' ? k : false; } catch (e) { return false; } }      // v13.3: 'MCA' | 'MIC' | false
  var doc = W && W.document, kandungan = null, kandunganMCA = null, terbuka = false, pemicu = null;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var CSS = [
    '.plb{position:fixed;inset:0;z-index:350;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(5,6,9,.78)}',
    '.plb.is-buka{display:flex}',
    '.plb__kotak{width:min(720px,100%);max-height:min(88vh,860px);display:flex;flex-direction:column;background:var(--bg-elev-2,#1D2028);color:var(--text,#F4F5F7);border:1px solid var(--gold-dark,#C99700);border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.6);overflow:hidden;font-family:inherit}',
    '.plb__kepala{display:flex;align-items:flex-start;gap:12px;padding:16px 18px 12px;border-bottom:1px solid var(--border,#2E333F)}',
    '.plb__kepala h2{margin:0;font-size:1.15rem;line-height:1.25}',
    '.plb__kepala p{margin:4px 0 0;font-size:.8rem;color:var(--text-muted,#A3A9B8)}',
    '.plb__tutup{margin-left:auto;flex:none;width:36px;height:36px;border-radius:50%;border:1px solid var(--border,#2E333F);background:transparent;color:inherit;font:700 1.1rem/1 inherit;cursor:pointer}',
    '.plb__tutup:hover{border-color:var(--gold,#F2B705)}',
    '.plb__alat{display:flex;gap:8px;padding:10px 18px;border-bottom:1px solid var(--border,#2E333F)}',
    '.plb__alat button{font:inherit;font-size:.78rem;padding:6px 12px;border-radius:999px;border:1px solid var(--border,#2E333F);background:transparent;color:var(--text-muted,#A3A9B8);cursor:pointer}',
    '.plb__alat button:hover{color:var(--gold,#F2B705);border-color:var(--gold,#F2B705)}',
    '.plb__isi{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 18px 8px;display:grid;gap:8px}',
    '.plb-fasal{border:1px solid var(--border,#2E333F);border-radius:12px;background:rgba(255,255,255,.02)}',
    '.plb-fasal.is-buka{border-color:rgba(242,183,5,.45)}',
    '.plb-fasal__btn{width:100%;display:flex;align-items:center;gap:12px;text-align:left;padding:12px 14px;background:transparent;border:0;color:inherit;font:inherit;cursor:pointer;border-radius:12px}',
    '.plb-fasal__no{flex:none;min-width:64px;font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gold,#F2B705)}',
    '.plb-fasal__tajuk{font-weight:600;font-size:.98rem}',
    '.plb-fasal__ikon{margin-left:auto;flex:none;transition:transform .2s;color:var(--text-muted,#A3A9B8)}',
    '.plb-fasal.is-buka .plb-fasal__ikon{transform:rotate(180deg)}',
    '.plb-fasal__btn:focus-visible,.plb__tutup:focus-visible,.plb__alat button:focus-visible{outline:2px solid var(--gold,#F2B705);outline-offset:2px}',
    '.plb-fasal__badan{padding:0 14px 14px;font-size:.9rem;line-height:1.55}',
    '.plb-fasal__badan[hidden]{display:none}',
    '.plb-fasal__ringkas{margin:0 0 10px;color:var(--text-muted,#A3A9B8)}',
    '.plb-fasal__senarai{margin:0;padding:0;list-style:none;display:grid;gap:8px}',
    '.plb-fasal__senarai li{display:grid;grid-template-columns:72px 1fr;gap:10px}',
    '.plb-fasal__senarai b{font-size:.78rem;color:var(--gold,#F2B705);font-variant-numeric:tabular-nums;padding-top:1px}',
    '.plb-fasal__main{margin:12px 0 0;padding:10px 12px;border-radius:10px;background:rgba(242,183,5,.07);border:1px solid rgba(242,183,5,.3);font-size:.84rem}',
    '.plb-fasal__main b{display:block;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--gold,#F2B705);margin-bottom:2px}',
    '.plb__tab{display:flex;flex:none;gap:6px;overflow-x:auto;overflow-y:hidden;padding:10px 18px 0;border-bottom:1px solid var(--border,#2E333F);scrollbar-width:thin}',
    '.plb__tab button{flex:none;white-space:nowrap;line-height:1.3;font:inherit;font-size:.78rem;font-weight:600;padding:7px 12px;border:1px solid var(--border,#2E333F);border-bottom:0;border-radius:10px 10px 0 0;background:transparent;color:var(--text-muted,#A3A9B8);cursor:pointer}',
    '.plb__tab button[aria-selected="true"]{color:var(--gold,#F2B705);border-color:var(--gold,#F2B705);background:rgba(242,183,5,.08)}',
    '.plb__isi[hidden]{display:none}',
    '.plb__kaki{padding:10px 18px 14px;border-top:1px solid var(--border,#2E333F);font-size:.74rem;color:var(--text-muted,#A3A9B8)}',
    '.plb-btn-teks{display:none}',
    '@media(min-width:620px){.plb-btn-teks{display:inline}}',
    '@media(max-width:520px){.plb-fasal__senarai li{grid-template-columns:1fr;gap:0}.plb-fasal__no{min-width:52px}}',
    '@media(prefers-reduced-motion:reduce){.plb-fasal__ikon{transition:none}}',
    'body.plb-kunci{overflow:hidden}'
  ].join('\n');

  function binaFasal(f, i, pfx) {
    var id = 'plb-' + (pfx || '') + 'f' + String(f.no).replace(/[^0-9a-z]/gi, '_');
    return '<section class="plb-fasal"' + (pfx ? '' : ' data-fasal="' + f.no + '"') + '>' +
      '<h3 style="margin:0"><button type="button" class="plb-fasal__btn" aria-expanded="false" aria-controls="' + id + '" id="' + id + '-btn">' +
        '<span class="plb-fasal__no">' + (f.label || 'Fasal') + ' ' + f.no + '</span><span class="plb-fasal__tajuk">' + esc(f.tajuk) + '</span>' +
        '<svg class="plb-fasal__ikon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
      '</button></h3>' +
      '<div class="plb-fasal__badan" id="' + id + '" role="region" aria-labelledby="' + id + '-btn" hidden>' +
        '<p class="plb-fasal__ringkas">' + esc(f.ringkas) + '</p>' +
        '<ul class="plb-fasal__senarai">' + f.poin.map(function (x) { return '<li><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></li>'; }).join('') + '</ul>' +
        (f.permainan ? '<p class="plb-fasal__main"><b>Dalam permainan</b>' + esc(f.permainan) + '</p>' : '') +
      '</div></section>';
  }

  function sediakan() {
    var mca = mcaKini();                                                         // v13.1: MCA guna Perlembagaan MCA
    if (kandungan && kandunganMCA !== mca) { if (kandungan.parentNode) { kandungan.parentNode.removeChild(kandungan); } kandungan = null; }
    if (kandungan || !doc) { return kandungan; }
    kandunganMCA = mca;
    var SENARAI_F = mca ? (mca === 'MIC' ? FASAL_MIC : FASAL_MCA).map(function (f) { var x = {}; for (var k in f) { x[k] = f[k]; } x.label = 'Perkara'; return x; }) : FASAL, SMB = mca ? (mca === 'MIC' ? SUMBER_MIC : SUMBER_MCA) : SUMBER;
    kandungan = doc.createElement('div');
    kandungan.className = 'plb'; kandungan.setAttribute('role', 'dialog'); kandungan.setAttribute('aria-modal', 'true'); kandungan.setAttribute('aria-labelledby', 'plb-tajuk');
    kandungan.innerHTML =
      '<div class="plb__kotak">' +
        '<div class="plb__kepala"><div><h2 id="plb-tajuk">📜 Perlembagaan Parti</h2><p>' + (mca ? 'Ringkasan perkara utama daripada ' + esc(SMB) + '. Tekan satu perkara untuk membuka atau menutupnya.' : 'Ringkasan daripada ' + esc(SMB) + '. Tekan satu bahagian untuk membuka atau menutupnya.') + '</p></div>' +
        '<button type="button" class="plb__tutup" data-plb="tutup" aria-label="Tutup">&times;</button></div>' +
        (mca ? '' : '<div class="plb__tab" role="tablist" aria-label="Dokumen">' + DOK_UMNO.map(function (d, i) { return '<button type="button" role="tab" data-plb-tab="' + d.id + '" aria-selected="' + (i === 0) + '">' + esc(d.tajuk) + '</button>'; }).join('') + '</div>') +      // v13.4: tab dokumen buku UMNO 2025
        '<div class="plb__alat"><button type="button" data-plb="buka-semua">Buka semua</button><button type="button" data-plb="tutup-semua">Tutup semua</button></div>' +
        '<div class="plb__isi" data-plb-panel="perlembagaan">' + SENARAI_F.map(function (f, i) { return binaFasal(f, i); }).join('') + '</div>' +
        (mca ? '' : DOK_UMNO.slice(1).map(function (d) { return '<div class="plb__isi" data-plb-panel="' + d.id + '" hidden>' + d.senarai.map(function (f, i) { return binaFasal(f, i, d.id + '-'); }).join('') + '</div>'; }).join('')) +
        '<div class="plb__kaki">Ini ringkasan untuk rujukan dalam permainan, bukan teks undang-undang penuh. Rujuk dokumen Perlembagaan ' + (mca || 'UMNO') + ' yang sah untuk teks lengkap. Permainan ini simulasi dan bukan laman rasmi parti.</div>' +
      '</div>';
    if (mca) { kandungan.setAttribute('data-jenama-skip', ''); }               // teks sudah dalam istilah MCA / MIC
    doc.body.appendChild(kandungan);

    kandungan.addEventListener('click', function (e) {
      var t = e.target;
      if (t === kandungan) { tutup(); return; }                                   // klik latar
      var a = t.closest ? t.closest('[data-plb]') : null;
      if (a) {
        var v = a.getAttribute('data-plb');
        if (v === 'tutup') { tutup(); } else if (v === 'buka-semua') { semua(true); } else if (v === 'tutup-semua') { semua(false); }
        return;
      }
      var tb = t.closest ? t.closest('[data-plb-tab]') : null;
      if (tb) { pilihTab(tb.getAttribute('data-plb-tab')); return; }
      var b = t.closest ? t.closest('.plb-fasal__btn') : null;
      if (b) { togol(b.parentNode.parentNode, null); }
    });
    return kandungan;
  }

  function togol(seksyen, paksa) {
    var btn = seksyen.querySelector('.plb-fasal__btn'), badan = seksyen.querySelector('.plb-fasal__badan');
    var buka = paksa === null ? btn.getAttribute('aria-expanded') !== 'true' : !!paksa;
    btn.setAttribute('aria-expanded', String(buka)); badan.hidden = !buka; seksyen.classList.toggle('is-buka', buka);
  }
  function semua(buka) { Array.prototype.forEach.call(kandungan.querySelectorAll('.plb-fasal'), function (s) { togol(s, buka); }); }
  /** v13.4: tukar tab dokumen (UMNO). */
  function pilihTab(id) {
    if (!kandungan) { return; }
    Array.prototype.forEach.call(kandungan.querySelectorAll('[data-plb-tab]'), function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-plb-tab') === id)); });
    Array.prototype.forEach.call(kandungan.querySelectorAll('[data-plb-panel]'), function (pn) { pn.hidden = pn.getAttribute('data-plb-panel') !== id; });
    var d = DOK_UMNO.filter(function (x) { return x.id === id; })[0], ps = kandungan.querySelector('.plb__kepala p');
    if (d && ps && !mcaKini()) { ps.textContent = 'Ringkasan daripada ' + d.sumber + '. Tekan satu bahagian untuk membuka atau menutupnya.'; }
  }

  function kekunci(e) {
    if (e.key === 'Escape') { e.stopPropagation(); tutup(); return; }
    if (e.key !== 'Tab') { return; }
    var f = kandungan.querySelectorAll('button:not([hidden])'), a = Array.prototype.filter.call(f, function (x) { return x.offsetParent !== null; });
    if (!a.length) { return; }
    var p = a[0], q = a[a.length - 1];
    if (e.shiftKey && doc.activeElement === p) { e.preventDefault(); q.focus(); }
    else if (!e.shiftKey && doc.activeElement === q) { e.preventDefault(); p.focus(); }
  }

  /** Buka modal. fasal (pilihan): nombor fasal yang dibuka terus. */
  function buka(fasal) {
    if (!sediakan()) { return; }
    pemicu = doc.activeElement;
    kandungan.classList.add('is-buka'); doc.body.classList.add('plb-kunci'); terbuka = true;
    semua(false); if (!mcaKini()) { pilihTab('perlembagaan'); }
    if (fasal) { var s = kandungan.querySelector('[data-fasal="' + fasal + '"]'); if (s) { togol(s, true); s.scrollIntoView({ block: 'nearest' }); } }
    doc.addEventListener('keydown', kekunci, true);
    var x = kandungan.querySelector('.plb__tutup'); if (x) { x.focus(); }
  }
  function tutup() {
    if (!kandungan || !terbuka) { return; }
    kandungan.classList.remove('is-buka'); doc.body.classList.remove('plb-kunci'); terbuka = false;
    doc.removeEventListener('keydown', kekunci, true);
    if (pemicu && pemicu.focus) { try { pemicu.focus(); } catch (e) { /* abaikan */ } }
  }

  if (doc) {
    var st = doc.createElement('style'); st.setAttribute('data-plb', ''); st.textContent = CSS; doc.head.appendChild(st);   // awal, supaya .plb-btn-teks berfungsi
    doc.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-perlembagaan]') : null;
      if (!b) { return; }
      e.preventDefault();
      var f = parseInt(b.getAttribute('data-perlembagaan'), 10);
      buka(isNaN(f) ? null : f);
    });
  }

  return { FASAL: FASAL, SUMBER: SUMBER, DOK_UMNO: DOK_UMNO, buka: buka, tutup: tutup, pilihTab: pilihTab };
});
