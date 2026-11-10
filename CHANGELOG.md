# Catatan Perubahan

## v13.54 (2026-11-10)

- **Maklum balas baris 34 (dan sebahagian baris 31): GRS (Gabungan Rakyat Sabah)** (ikut mockup v2 yang dipersetujui; sumber: PDF Wikipedia daripada pengguna; semua nombor mekanik ⚠️ andaian).
  - **Menu utama:** BN, PH, PN, GPS, **GRS**, Lain-lain. Panel GRS dengan enam parti boleh dimain (mod ringan): **Gagasan Rakyat**, **PBS**, **UPKO**, **LDP**, **PHRS**, **PCS** (logo daripada pengguna).
  - **Gagasan Rakyat:** Bahagian ikut 25 kawasan Parlimen Sabah + Labuan (pindaan perlembagaan 17 Mei 2026), keahlian ~579,980, sayap Pemuda, Wanita dan **Beliawanis** (Puteri). PBS (~580,000 ahli, 10 kawasan KDM), UPKO (10 kawasan KDM, sertai GRS Jun 2026), LDP (5 kawasan bandar), PHRS (4 kawasan pantai timur), PCS (4 kawasan pantai barat selatan) ⚠️.
  - **Kuota kerusi dalam GRS** ⚠️ ikut PRN 2025: Gagasan 37 DUN + 8 Parlimen, PBS 11 + 2, UPKO 8 + 1. Parti kecil (LDP, PHRS, PCS): Kekuatan Parti, Gerak kerja & rekrut ahli, dan **Rundingan kuota GRS** 12 bulan sebelum pilihan raya.
  - **Mekanik Kerajaan Negeri Sabah** (kad 🏝️ tab Profil): Kestabilan Gabungan (mula 62, susut ke 50); Jamuan rakan gabungan (+6), Tuntut hak MA63 (akar umbi +5, hubungan Putrajaya −3), Sabah untuk Sabahan (kerusi GRS +1 dalam PRN, maks +5). Kestabilan bawah 40: **Krisis ADUN lompat** (pujuk, terima atau bubar DUN untuk PRN mengejut).
  - PRN Sabah: pemain GRS melihat UPKO dalam GRS; kerajaan negeri GRS jika GRS + UPKO + BN + separuh kerusi lain ≥ 37. Persekutuan: GRS rakan Kerajaan Perpaduan (5–8 kerusi Parlimen). Kad kerusi: Gabungan Rakyat Sabah, Warisan, PN.
  - Lompat Parti: enam parti GRS tersedia di Sabah.
- Fail baharu: `js/grs.js`, `js/grs-ui.js`, `js/grs-data.js`, `data/grs-*.csv` (6 fail), `tools/build-grs.js`, `tools/ujian-grs.js`, logo `assets/images/logo-{grs,gagasan,pbs,upko,ldp,phrs,pcs}.png`. Ujian baharu (186 ujian).

## v13.53 (2026-11-10)

- **Maklum balas baris 27: BERJASA dan kumpulan "Lain-lain"** (ikut mockup yang dipersetujui; tiada perlembagaan BERJASA, jadi struktur, takwim dan semua nombor ⚠️ andaian).
  - **Menu utama disusun semula:** BN, PH, PN, GPS dan kumpulan baharu **Lain-lain** (parti tanpa gabungan). BERJASA ialah parti pertama dalam Lain-lain.
  - **BERJASA (Barisan Jemaah Islamiah Se-Malaysia), mod ringan:** Cawangan → Kawasan (kawasan Parlimen Semenanjung, ⚠️ Bumiputera 50% ke atas, 139 kawasan) → Pusat. Keahlian ~56,790 dibahagi ikut anggaran pengundi Melayu-Islam. Istilah: Ketua Kawasan, Jawatankuasa Pusat (AJK Pusat), Muktamar BERJASA, sayap Wanita BERJASA dan ANGKASA (⚠️ had umur 40). Pemilihan setiap 3 tahun dari 2027: Cawangan bulan 3, Kawasan bulan 5, Muktamar bulan 6.
  - **Mekanik Parti Kecil** (kad 🌙 dalam tab Profil): Kekuatan Parti 0–100 (mula 8; undi parti 1% hingga 15%). 📣 Dakwah & rekrut ahli (2 AP + RM 2,000: Kekuatan +1, akar umbi +2). 🤝 Pakatan pilihan raya 6 bulan sebelum PRU dengan PN atau BN (1–3 kerusi tanpa pertembungan; gagal = solo). 🗳️ PRU solo di mana-mana kawasan operasi (ofset undi negatif; pakatan mengurangkannya). ⚖️ Penentu kerajaan: Ahli Parlimen BERJASA boleh menawarkan sokongan kepada BN, PN atau PH dalam 3 bulan selepas PRU untuk jawatan Timbalan Menteri.
  - Kad kerusi: BERJASA (★ parti anda), Kerajaan Perpaduan (PH + BN) dan Perikatan Nasional. BERJASA juga tersedia dalam Lompat Parti (Semenanjung).
- Fail baharu: `js/berjasa.js`, `js/berjasa-ui.js`, `js/berjasa-data.js`, `data/berjasa-semenanjung.csv`, `tools/build-berjasa.js`, `tools/ujian-berjasa.js`, `assets/images/logo-berjasa.png` (logo daripada pengguna). Ujian baharu (185 ujian).

## v13.52 (2026-11-10)

- **Maklum balas Threads no. 5: Yang di-Pertua Negeri (TYT)** bagi Sarawak, Sabah, Melaka dan Pulau Pinang (ikut mockup yang dipersetujui; semua nombor ⚠️ andaian).
  - **Laluan:** kad 👑 dalam tab Profil bagi bekas Premier / Ketua Menteri negeri itu. Syarat: umur ≥ 55, status disiplin baik, bukan Ketua Menteri sekarang. Kekosongan setiap 4 tahun (⚠️ tahun pertama: Sarawak 2027, Sabah 2028, Melaka 2029, Pulau Pinang 2030), bulan 1. Peluang tawaran 40–80% (Reputasi, gelaran, akar umbi).
  - **Terima:** semua jawatan parti dan kerajaan dilepaskan, kerusi dikosongkan (PRK calon parti), keahlian parti digantung (tidak boleh bertanding / lompat parti), gelaran Tun.
  - **Tab baharu 🏰 Istana:** elaun RM 25,000 sebulan; Kewibawaan Istana dan Hubungan dengan Premier / Ketua Menteri. Tugas: Menghadap bulanan (Sokong / Tegur / Dengar), Majlis rasmi (2 AP), Mesyuarat Majlis Raja-Raja (setahun sekali), Kurnia darjah (pilih 3 daripada 6 calon; senarai seimbang +5, terlalu ramai ahli politik −5), Perkenan pembubaran DUN (Perkenan / Tangguh).
  - **Tamat penggal (4 tahun):** Kewibawaan ≥ 60 = penggal kedua ditawarkan (sekali); selain itu kerjaya tamat dengan legasi "Tamat Perkhidmatan Yang di-Pertua Negeri".
- Fail baharu: `js/tyt.js`, `js/tyt-ui.js`, `tools/ujian-tyt.js`. Ujian baharu (184 ujian).

## v13.51 (2026-11-10)

- **Maklum balas Threads no. 4: Lompat Parti** (ikut mockup yang dipersetujui; semua nombor ⚠️ andaian).
  - Kad baharu **🔀 Lompat Parti** dalam tab Profil (sebelah Pindah Cawangan). Pilih parti yang bergerak di negeri anda: ⚠️ Sarawak = parti Sarawak, PKR, DAP; Sabah / Labuan = UMNO, MCA, MIC, PBRS, PKR, DAP; Semenanjung = UMNO, MCA, MIC, PPP, PAS, PKR, DAP.
  - Sekali setiap 5 tahun; tidak semasa PRU / PRK. Parti menolak jika Reputasi < 20 atau pemain sudah lompat 2 kali.
  - Selepas pengesahan, borang pendaftaran dibuka dalam mod lompat: parti baharu dipilih, nama / jantina / umur / pendidikan dikunci, negeri dan bahagian lama dipilih automatik; pemain memilih cawangan baharu.
  - **Kekal:** nama, umur, Dana, AP, harta, gelaran, pendidikan, rekod pilihan raya dan kerajaan, jawatan tertinggi kerjaya, trofi. **Bermula semula:** jawatan parti (Ahli Biasa), tempoh keahlian dan keadaan parti. IP −50%, Reputasi −10, Sokongan akar umbi 30%, label "Katak Politik" 24 bulan.
  - **Perkara 49A:** wakil rakyat yang lompat parti hilang kerusi; PRK diadakan bulan depan dan pemain dijamin dicalonkan atas tiket parti baharu (kerusi kedua: PRK calon parti). Ahli Politik Bebas (dipecat) kekal kerusi tanpa penalti Reputasi.
  - Trofi baharu 🐸 Katak Politik.
- Fail baharu: `js/lompat.js`, `js/lompat-ui.js`, `tools/ujian-lompat.js` (ujian hujung ke hujung: dashboard → borang → dashboard). Ujian baharu (183 ujian).

## v13.50 (2026-11-10)

- **Maklum balas Threads no. 1: Ketua Pembangkang** (ikut mockup yang dipersetujui; semua nombor ⚠️ andaian).
  - **Ketua Pembangkang:** Presiden parti yang menjadi Ahli Parlimen, parti di pihak pembangkang dan blok pembangkang terbesar. Elaun RM 6,000 + 20 IP sebulan. ⚠️ Kerajaan = blok PH/PN terbesar (+ kerusi lain) jika cukup majoriti; jika tidak, PH + PN bergabung.
  - **Naratif Pembangkang** (0–100, mula 50, susut 1 sebulan ke arah 50): PRU seterusnya +1 kerusi Parlimen parti bagi setiap 5 mata melebihi 50.
  - **Tindakan semua MP pembangkang** (kad baharu dalam tab Dewan): Soalan Lisan (1 AP, sekali sebulan) dan Bahas RUU Kerajaan (bulan sidang 3, 7, 10: Sokong / Bantah / Pinda).
  - **Ketua Pembangkang sahaja:** Bajet Alternatif (bulan 10, sekali setahun), Usul Undi Tidak Percaya (3 AP + RM 20,000, sekali setahun; pujuk MP kerajaan goyah sehingga 3 kali; berjaya = kerajaan tumbang dan PRU mengejut; gagal = Reputasi -4, Naratif -10), Kabinet Bayangan (8 portfolio daripada struktur parti; Kecekapan menambah kesan Naratif ×1.0–×1.3).
- Fail baharu: `js/pembangkang.js`, `js/pembangkang-ui.js`, `tools/ujian-pembangkang.js`. Ujian baharu (182 ujian).

## v13.49 (2026-11-09)

- **Pembetulan: mesej aduan Jawatankuasa Disiplin kadang-kadang tidak diterjemah ke EN.**
  - Punca: log aktiviti disiplin memotong mesej pada 80 aksara ("…Jawatankuasa Disiplin Neger"), jadi teks itu tiada dalam kamus terjemahan. Ia muncul dalam log aktiviti tab Profil apabila acara aduan berlaku (rawak, sebab itu ujian pelayar hanya gagal sekali-sekala).
  - Log disiplin dan log hukuman kini menyimpan mesej penuh.
  - Log lama yang sudah dipotong turut diterjemah; templat EN ditambah untuk log "Gantung hak keahlian: …" dan "Dilarang bertanding: …".
- Ujian baharu (181 ujian); ujian pelayar EN 12 bulan lulus 3 kali berturut-turut.

## v13.48 (2026-11-09)

- **Pembetulan maklum balas borang baris 26: pemain PAS tidak boleh bertanding / mempertahankan jawatan pada musim pemilihan berikutnya.**
  - Punca: id kitaran pemilihan bagi parti selain UMNO dikira dengan formula UMNO (3 tahun dari 2026). Pemilihan PAS setiap 2 tahun (2027, 2029, 2031, ...), jadi 2029 dan 2031 berkongsi kitaran yang sama. Keputusan 2029 kekal "Pertandingan ini sudah selesai" pada 2031, dan tab Pemilihan serta Mesyuarat terus memaparkan "menang jawatan".
  - Kini id kitaran bagi PAS, PKR, DAP, MCA, MIC, PPP dan PBRS ialah tahun pemilihan terakhir parti itu, jadi setiap musim bermula semula.
  - Simpanan sedia ada: pendaftaran dan keputusan musim semasa dikekalkan; hanya keputusan musim lalu yang dibuang.
- Ujian baharu (180 ujian).

## v13.47 (2026-11-09)

- **Maklum balas borang baris 28: PRK luar kawasan dengan bantuan kempen** (ikut mockup yang dipersetujui; semua nombor ⚠️ andaian).
  - PRK di kawasan lain (dahulu diselesaikan serta-merta) kini **dibuka selama sebulan**; keputusan diumumkan pada peralihan bulan berikutnya. Peluang kekal 15% sebulan (± 2 setahun).
  - Kerusi Parlimen bernama (cth P.105 Petaling Jaya, Selangor); kerusi DUN bernombor.
  - Calon parti anda atau rakan gabungan, sama ada mempertahankan atau merampas kerusi. Undi asas: 52% (pertahan) / 45% (rampas), dilaras Reputasi dan sentimen nasional.
  - **Bantu kempen** (sekali setiap PRK): Hantar jentera (1 AP + RM 2,000, +2%), Ceramah sokongan (2 AP + RM 3,000, +3%, Stress +5), Ziarah (2 AP, +2%, Stress +3), Kempen digital (1 AP + RM 1,500, +1.5%), Sumbang dana (RM 5,000 = +1%, maks 4 kali). Ketua Bahagian ×1.25, jawatan Pusat ×1.5.
  - **Keputusan:** menang (jika menyumbang): Reputasi Parti +1 hingga +4, IP +60, Sokongan AJK +2; calon rakan menang: Hubungan Gabungan +3. Kalah (jika menyumbang): Reputasi -1. PRK tidak boleh menukar kerajaan (peraturan sedia ada).
  - Kad baharu **🗳️ PRK Luar Kawasan** dalam tab Pemilihan (bukan tab baharu, supaya bar tab tidak sesak di telefon), dengan senarai keputusan PRK terkini.
- Fail baharu: `js/prk-luar.js`, `js/prk-luar-ui.js`, `tools/ujian-prk-luar.js`. Ujian baharu (179 ujian).

## v13.46 (2026-11-09)

- **Maklum balas borang baris 25: Presiden-PM membentuk Kabinet penuh dan memilih TPM daripada struktur parti** (ikut mockup yang dipersetujui; semua nombor ⚠️ andaian).
  - **① Pilih Timbalan Perdana Menteri** (wajib):
    - Timbalan Presiden (tradisi): Kesetiaan +10.
    - Naib Presiden paling cekap: Timbalan Presiden dilangkau (Kesetiaan -15, kuasa pencabar +10%).
    - Presiden parti rakan: Hubungan Gabungan +8; Timbalan Presiden dilangkau.
    - Ketua rakan Sabah/Sarawak: Hubungan Gabungan +5, dikira wakil Borneo; Timbalan Presiden dilangkau.
  - **② Semua 29 portfolio boleh diisi:** 8 portfolio utama wajib; 21 portfolio lain pilihan (dibiar = automatik).
  - **Calon parti sendiri daripada struktur Pusat dalam permainan:** Timbalan Presiden, Naib Presiden 1–3, ketua sayap, pegawai Pusat dan Ahli MKT 1–25 (2 daripadanya pencabar). Calon rakan dan Borneo kekal.
  - **Seorang satu jawatan:** pilihan berganda ditolak.
  - **③ Semakan:** Timbalan Presiden diberi jawatan, Naib Presiden dalam Kabinet, portfolio lain dipilih, pemimpin parti tanpa jawatan (Kesetiaan -3 setiap Naib Presiden / ketua sayap), pencabar belum dilantik.
  - Senarai penuh Jemaah Menteri memaparkan jawatan parti menteri yang dilantik daripada struktur parti.
- Ujian baharu (178 ujian); ujian pelayar Jemaah Menteri dikemas kini (TPM, dropdown, amaran pilihan berganda).

## v13.45 (2026-11-09)

- **Maklum balas borang baris 30: pencapaian kini milik setiap watak.**
  - Sebelum ini trofi dikongsi oleh semua watak pada peranti yang sama, jadi watak baharu mewarisi trofi watak lama.
  - Kini setiap watak mempunyai trofi dan kemajuan sendiri. Watak baharu bermula tanpa trofi; trofi watak lama kekal jika watak itu dimainkan semula (slot simpanan lain).
  - Kunci watak ialah tarikh profil dicipta, kerana id pemain ialah id cawangan dan boleh dikongsi oleh watak lain di cawangan yang sama.
  - Simpanan lama: trofi sedia ada dipindahkan kepada watak yang sedang aktif sahaja.
  - Tab Pencapaian memaparkan nota "Trofi watak ini sahaja; watak baharu bermula semula."
- Ujian baharu (177 ujian).

## v13.44 (2026-11-09)

- **Maklum balas borang baris 29: PM penyandang hilang jawatan selepas menang PRU.**
  - Punca: peluang kekal PM selepas PRU hanya ikut bahagian kerusi parti dalam gabungan. Status penyandang tidak dikira, jadi undian rawak boleh menjatuhkan PM yang memerintah.
  - Status PM penyandang kini direkod apabila Parlimen dibubarkan.
  - **Parti terbesar dalam gabungan:** PM penyandang kekal PM (peluang 100%), termasuk selepas membentuk gabungan baharu dalam Parlimen tergantung.
  - **Parti lebih kecil dalam gabungan:** peluang +20% ⚠️ (maksimum 97%).
  - Dialog keputusan PRU memaparkan "PM penyandang".
- Ujian baharu (176 ujian).

## v13.43 (2026-11-09)

- **Maklum balas borang baris 33: IP dalam ringkasan mesyuarat tidak sama dengan IP yang diterima.**
  - Punca: redaman IP (makin tinggi IP, makin kecil tambahan). Ringkasan mesyuarat mencatat nilai asas (cth +12) sedangkan pemain menerima nilai selepas redaman (cth +4).
  - Usul dan Ucapan Dasar Presiden kini mencatat IP sebenar yang diterima. Jumlah "Perubahan Sumber" dalam ringkasan kini sama dengan perubahan IP sebenar.
  - Jika ada redaman, baris usul memaparkan nilai asas, cth "+4 IP (asas +12)", dan nota ℹ️ Redaman IP dipaparkan.
- Ujian baharu (175 ujian).

## v13.42 (2026-11-09)

- **Maklum balas borang baris 32: wakil Cina dan India dalam Jemaah Menteri.**
  - Calon menteri rakan gabungan kini bernama Melayu, Cina atau India (⚠️ andaian 40% / 40% / 20%), mewakili parti seperti MCA, MIC dan DAP.
  - Calon parti sendiri ikut kaum parti pemain (contoh: pemain DAP mendapat calon kebanyakannya Cina, pemain MIC calon India).
  - Nama NPC parti DAP dan PKR kini ikut campuran kaum (⚠️ andaian DAP 75% Cina, 15% India, 10% Melayu; PKR 60% Melayu, 20% Cina, 20% India). Sebelum ini semua nama NPC kedua-dua parti bernama Melayu.
- Ujian baharu (174 ujian).

## v13.41 (2026-11-09)

- **Maklum balas thread: avatar PAS khas** (ikut mockup yang dipersetujui). Set umum (kemeja, tali leher, blazer, rambut terdedah) tidak lagi digunakan untuk PAS.
  - Pemuda: baju Melayu putih, kopiah putih.
  - Biasa: jubah hijau tua, kopiah putih, berjanggut.
  - Veteran: jubah putih, serban putih, janggut beruban.
  - Wanita: Muslimat, jubah hitam, tudung labuh hijau. Veteran perempuan: tudung labuh hijau gelap, jubah putih.
  - Parti lain kekal; UMNO tidak berubah.
- **Maklum balas thread: AP tidak lagi menyekat angkat sumpah** (pilihan b).
  - Tuntut / angkat sumpah Menteri Besar, Ketua Menteri atau Premier tidak lagi memerlukan AP (sebelum ini 2 AP).
  - Lobi Timbalan Perdana Menteri tidak lagi memerlukan AP (sebelum ini 3 AP); kos RM 20,000 + 400 IP kekal.
  - Pelantikan PM / TPM melalui rundingan kerajaan memang tanpa AP.
  - Amaran baharu di bawah kiraan AP pada papan pemuka apabila AP tinggal 1 atau habis.
- Ujian: avatar PAS, tuntut MB dengan 0 AP, lobi TPM dengan 0 AP (173 ujian).

## v13.40 (2026-11-07)

- **Maklum balas borang baris 23: Pilih Laluan Kerajaan dan Lobi Timbalan Perdana Menteri**, ikut mockup yang dipersetujui.
  - **🏛️ Pilih Laluan Kerajaan:**
    - Berlaku apabila pemain menang kerusi Parlimen dan DUN, memegang Pengerusi Badan Perhubungan Negeri, dan parti membentuk kerajaan persekutuan dan negeri.
    - Dialog selepas PRU kini menawarkan dua laluan dengan jelas: **Menteri Besar / Ketua Menteri** (peluang dipaparkan) atau **Menteri / Timbalan Menteri Persekutuan** (lobi portfolio Parlimen), serta EXCO Kanan dan Tangguh.
    - Jika semua percubaan lobi persekutuan gagal, **MB masih boleh dituntut sekali** ⚠️. Kad Kabinet memaparkan butang Tuntut MB.
  - **🤝 Lobi Timbalan Perdana Menteri:**
    - Untuk Timbalan Presiden parti (DAP: Pengerusi Kebangsaan) yang menjadi Ahli Parlimen, apabila lobi kerajaan persekutuan dibuka dan belum memegang jawatan kerajaan.
    - ⚠️ Kos 3 AP + RM 20,000 + 400 IP.
    - ⚠️ Peluang asas 60% jika PM dari parti sendiri, 30% jika PM dari rakan gabungan. Pelarasan: Reputasi ±10%, hubungan gabungan ±10%, IP melebihi 400 sehingga +10%.
    - Gagal: separuh kos hilang (sekali bagi setiap pembentukan kerajaan); lobi portfolio Menteri biasa masih terbuka.
- Ujian: 2 ujian unit baharu, `tools/ujian-laluan.js` (pelayar). Cache `nusa-v13.40`.

## v13.39 (2026-11-07)

- Pembetulan (maklum balas borang baris 24): Ketua Cawangan atau Timbalan Ketua Cawangan yang menang Ketua Sayap Cawangan tidak dapat memegang kedua-duanya (satu jawatan setiap peringkat). Sebelum ini, Ketua Sayap Bahagian kekal dikunci walaupun pemain menang. Kini jawatan Cawangan yang lebih tinggi itu memenuhi syarat Ketua Sayap Bahagian. Mesej keputusan juga menerangkan bahawa jawatan Cawangan lebih tinggi dikekalkan. Ujian unit baharu. Cache `nusa-v13.39`.

## v13.38 (2026-11-06)

- **DAP Fasa 2: keunikan DAP**, ikut mockup yang dipersetujui dan Perlembagaan DAP. Semua bahagian berada dalam kad DAP di tab Profil.
  - **🗳️ Mesyuarat Pertama JTP (Fasal X.1):**
    - Setiausaha Agung, Pengerusi Kebangsaan dan Naib Pengerusi Kebangsaan tidak lagi dipertandingkan di Kongres.
    - Pemain yang menang kerusi Ahli JTP (bulan 3) memilih jawatan sasaran dan melobi rakan JTP pada bulan 4 ⚠️ (1 AP + RM 500, 60% peluang, maks. 3 kali sebulan). Keputusan pada awal bulan 5.
    - Perlu 16 / 30 undi untuk Setiausaha Agung atau Pengerusi; Naib Pengerusi ≥ 6 undi ⚠️.
  - **📋 Syarat calon JTP (Fasal XXX):**
    - Dicalonkan oleh ≥ 2 Cawangan dan menjadi ahli ≥ 2 tahun.
    - Butang **Kumpul Pencalonan Cawangan** (bulan 1–2 tahun Kongres; peluang ikut sokongan Wakil kawasan ⚠️). Pengerusi Cawangan mendapat 1 pencalonan automatik.
  - **🎯 Calon PRU ialah prerogatif JTP (Fasal XII):**
    - Meter baharu **Hubungan JTP** ⚠️ memberi ±15 mata peluang dicalonkan PRU.
    - Naik apabila menjadi Ahli JTP (+10), mencarum elaun (+0.5 sebulan) atau melobi (+1). Turun apabila dihukum (−10) atau Integriti < 40 (−1 sebulan).
    - Calon PRU mesti ahli ≥ 2 tahun.
  - **⏳ Peraturan masa:**
    - Setiausaha Agung maksimum 3 penggal (Fasal X.2(b)).
    - **Kongres ditangguh automatik** jika jadualnya jatuh dalam 24 bulan sebelum PRU, dan diadakan pada tahun selepas PRU ⚠️ (Fasal VIII.1(c)).
  - **💰 Caruman elaun** 10% ⚠️ (MP RM 250, ADUN RM 150 sebulan) kepada dana parti (Fasal IV.12(a)).
  - **🛡️ Tatatertib:** rujukan disiplin ditukar kepada Perlembagaan DAP Fasal VII (VII.1, VII.2, VII.3 rayuan) dan IV.13(c). Pemain yang **dipecat semasa menjadi wakil rakyat kehilangan kerusinya** (Fasal IV.12(c)) ⚠️.
- Ujian: 3 ujian unit baharu; `tools/ujian-dap.js` diperluas (Mesyuarat Pertama JTP, lobi, peta Fasal VII, EN). Cache `nusa-v13.38`.

## v13.37 (2026-11-06)

- **Parti baharu: DAP (Pakatan Harapan), Fasa 1**, ikut mockup skop DAP yang dipersetujui dan Perlembagaan DAP (seperti pada 22.10.2019, PDF pengguna; dibaca melalui OCR).
  - **Menu utama:** chip DAP dalam panel PH (boleh dimain). Bagi pemain DAP, rakan PH ialah PKR dan Amanah, dimainkan sebagai NPC.
  - **Istilah DAP** atas enjin UMNO:
    - Peringkat bawah: **Pengerusi Cawangan** (Fasal XXI), **JPKP** (Jawatankuasa Perhubungan Kawasan Parlimen, Fasal XIX) dan **Jawatankuasa Negeri** (Fasal XIV).
    - Peringkat pusat: **Jawatankuasa Tertinggi Pusat (JTP)** dan **Kongres Kebangsaan** (Fasal VIII).
    - Jawatan puncak: **Setiausaha Agung** (kuasa eksekutif), **Pengerusi Kebangsaan** dan **Naib Pengerusi Kebangsaan** (maks. 5).
    - Sayap: **DAPSY** dan Wanita; tiada Puteri.
  - **Pilihan (b): Penyelaras JPKP** ialah Ahli Parlimen DAP kawasan itu. Tanpa kerusi Parlimen, jawatan tertinggi pemain di kawasan ialah **Setiausaha JPKP**; selepas menang kerusi Parlimen, jawatan itu dipaparkan sebagai Penyelaras JPKP.
  - **Ahli JTP 30 kerusi** (Fasal VIII.14). 30% dikhaskan untuk wanita (Fasal VIII.16): ⚠️ calon wanita mendapat bonus kekuatan +6.
  - **Wakil Cawangan ke Kongres (Fasal VIII.3):**
    - Cawangan 25–50 ahli berbayar menghantar 2 wakil, 51–100 ahli tambah 1, dan setiap 100 ahli seterusnya tambah 1. Cawangan bawah 25 ahli tiada wakil.
    - Data (`tools/build-dap.js`) ⚠️: ~1,700 Cawangan layak dan ~4,200 Wakil Kongres. Kad DAP ada butang **Jelajah Kawasan**.
  - **Kongres Kebangsaan** setiap 3 tahun (2025, 2028 dan seterusnya). ⚠️ Takwim: Cawangan bulan 1, JPKP bulan 2, Kongres bulan 3.
  - **Umur minimum ahli 17 tahun** (Fasal III.2). ⚠️ DAPSY untuk ahli 35 tahun ke bawah (tiada dalam Perlembagaan).
  - **⚠️ Kuota DAP dalam PH:** 55 Parlimen dan 120 DUN, kawasan majoriti Cina dahulu (Tanjong, Bukit Bendera, Kepong, Bagan, Bukit Gelugor). Kerajaan dan rundingan sama seperti PKR.
  - **PRK:** pemain PH (PKR, DAP) tidak lagi berdepan calon rakan PH sendiri.
- Ujian: 2 ujian unit baharu, `tools/ujian-dap.js` (pelayar), simulasi `PARTI=DAP`. Ujian indeks kini mengira 12 pilihan parti. Cache `nusa-v13.37`.

## v13.36 (2026-11-06)

- **PKR Fasa 2: keunikan KEADILAN**, ikut mockup yang dipersetujui dan Perlembagaan PKR. Semua bahagian baharu berada dalam kad PKR di tab Profil.
  - **🗳️ Pasukan Perwakilan Cabang (Fasal 17.2B):**
    - Dalam tahun pemilihan (bulan 1–4), Ketua Cabang ke atas menyusun pasukan calon Perwakilan Biasa dan Tambahan, dalam gandaan 10 calon (2 AP + RM 500 setiap 10) ⚠️.
    - Kuota wanita ≥ 30% dan kuota etnik minoriti ikut demografi kawasan ⚠️. Jika kuota tidak dipenuhi, pasukan didenda −5% undi.
    - Keputusan diumumkan pada awal bulan Kongres dan menentukan sokongan perwakilan Cabang anda.
  - **🔥 Semangat Reformasi** (meter 0–100) ⚠️:
    - Naik apabila skor Integriti ≥ 70 atau melalui Forum Reformasi (1 AP, RM 300, +4, sekali sebulan).
    - Turun apabila Integriti < 40, dihukum Lembaga Disiplin (−10) atau menangguhkan pemilihan (−10).
    - Kesan: ±5 kekuatan undi pemilihan Cabang dan Pusat, ±10 mata peluang dicalonkan PRU.
  - **⚖️ Kem Dalaman** ⚠️:
    - Dua kem NPC (kekuatan MPP 50–60%). Pilih kem atau berkecuali, sekali setiap penggal.
    - Kem pilihan memberi +8 sokongan perwakilan di Cabang kem itu, tetapi menaikkan risiko aduan disiplin dalam tahun pemilihan.
    - Jika kem lawan menguasai MPP selepas Kongres, peluang lantikan kerajaan −20 mata.
  - **🛡️ Lembaga Disiplin:** rujukan Fasal UMNO dipetakan ke Perlembagaan PKR (Fasal 41.2, 41.7, 42.1, 43.2, 44.1). Gantung keanggotaan tetap melucutkan semua jawatan (Fasal 45.2).
  - **👑 Presiden:**
    - Maksimum 3 penggal (Fasal 21.11).
    - Presiden boleh menangguhkan pemilihan 12 bulan (Fasal 47.3: had 18 bulan) ⚠️, sebelum musim Ranting. Kitaran 3 tahun bermula semula dari tahun baharu. Semangat Reformasi −10.
- Ujian: 2 ujian unit baharu, `tools/ujian-pkr.js` diperluas (Pasukan, Forum, Kem, tangguh, peta Fasal, EN). Cache `nusa-v13.36`.

## v13.35 (2026-11-06)

- Pembetulan (maklum balas pengguna): **UPKO dibuang daripada senarai rakan PH**. UPKO keluar Pakatan Harapan pada 10 November 2025. Rakan PH kini hanya DAP dan Amanah, di menu utama dan kad PKR. Cache `nusa-v13.35`.

## v13.34 (2026-11-06)

- **Parti baharu: PKR (Pakatan Harapan), Fasa 1** (maklum balas di borang, baris 11 hingga 13), ikut mockup skop PH yang dipersetujui dan Perlembagaan PKR (pindaan diluluskan hingga 11 Mac 2025).
  - Menu utama: gabungan **PH** dengan chip PKR. Rakan PH (DAP, Amanah) dimainkan sebagai NPC. Logo daripada pengguna. (UPKO disenaraikan pada asalnya; dibuang dalam v13.35.)
  - Mod penuh menggunakan enjin UMNO dengan istilah PKR:
    - **Ranting** (Fasal 39.1(g)) dan **Cabang** di setiap kawasan Parlimen, minimum 100 anggota (Fasal 32).
    - **Majlis Pimpinan Negeri** (Fasal 27), **Majlis Pimpinan Pusat** (Fasal 21) dan **Kongres Nasional KEADILAN** (Fasal 17, 18).
    - **Angkatan Muda (AMK)** untuk ahli 35 tahun ke bawah (Fasal 25). Sayap **Wanita**; tiada Puteri.
  - Pemilihan parti **setiap 3 tahun** (Fasal 47.3): 2025, 2028 dan seterusnya. ⚠️ Takwim: Ranting bulan 3, Cabang bulan 4, Kongres bulan 5.
  - Perwakilan Cabang ke Kongres (Fasal 17.2A): 46 Perwakilan Jawatankuasa Cabang + 40 Perwakilan Biasa, ditambah 10 bagi setiap 1,000 anggota melebihi 3,000, maksimum 156. Kad PKR dengan **Jelajah Cabang**.
  - Kawasan operasi: semua **222 kawasan Parlimen**, termasuk Sabah dan Sarawak (`tools/build-pkr.js`). ⚠️ Kuota PKR dalam PH: 70 Parlimen dan 150 DUN, kawasan bercampur dahulu.
  - ⚠️ Kerajaan:
    - PH memimpin Kerajaan Perpaduan. Selepas PRU, PH biasanya perlu BN untuk majoriti; rundingan gabungan v13.33 digunakan versi PH (BN 70%, PN 10%, Bebas 70%).
    - Lawan tradisi: PH + BN (akar umbi −4), PH + PN (−8).
    - Kekuatan DUN ikut negeri: PH memimpin Selangor, Pulau Pinang dan Negeri Sembilan; rakan kerajaan di Perak, Melaka, Johor dan Pahang.
  - Kad kerusi, carta hemisikal dan PRK memaparkan PH sebagai gabungan anda, BN dan PN sebagai blok lain.
- Ujian: 2 ujian unit baharu, `tools/ujian-pkr.js` (pelayar), simulasi `PARTI=PKR`. Ujian indeks (11 pilihan parti) dan ujian pelayar dikemas kini. Cache `nusa-v13.34`.

## v13.33 (2026-11-06)

- **PAS Fasa 3 / maklum balas borang (baris 13): Pilih Rakan Gabungan**, ikut mockup yang dipersetujui.
  - **Presiden parti**: jika gabungan sendiri kurang 112 kerusi selepas PRU, dialog **🤝 Rundingan Gabungan** dibuka. Pilih rakan (PH, PN atau BN, GPS, GRS, Bebas) sehingga 112; setiap rakan bersetuju ikut **Kesediaan** (hubungan gabungan, reputasi, saiz gabungan) ⚠️. Jika baki yang bersetuju masih ≥ 112, kerajaan gabungan dibentuk; jika tidak, parti menjadi pembangkang dan hubungan gabungan −5.
  - Rakan yang lebih besar memegang jawatan Perdana Menteri (anda boleh menerima Timbalan PM atau portfolio kabinet).
  - **Lawan tradisi** ⚠️: BN + PH (akar umbi −6), BN + PN (−3), PN + PH (−6).
  - **PAS**: rakan baharu perlu Restu Majlis Syura ≥ 50; PH perlu ≥ 70 (Fasal 39(9)(k)).
  - **Pemain bukan Presiden**: NPC Presiden parti memilih rakan paling bersedia secara automatik; kad kerusi, carta hemisikal dan status kerajaan mengikut gabungan baharu.
  - GPS 23–28 dan GRS 5–8 kerusi diasingkan daripada blok lawan kedua ⚠️.
- Ujian: 3 ujian unit baharu, `tools/ujian-rundingan.js` (pelayar). Cache `nusa-v13.33`.

## v13.32 (2026-11-06)

- **PAS Fasa 2: keunikan PAS**, ikut mockup yang dipersetujui dan Perlembagaan PAS (Pindaan 2025). Semua dalam kad PAS (tab Profil).
  - **📿 Restu Majlis Syura Ulamak** (0–100, mula 50, susut 1 sebulan ke arah 50) ⚠️: naik melalui Ceramah, Integriti ≥ 80 (+0.5 sebulan) dan jawatan Ketua Dewan Ulamak (+0.5 sebulan); turun apabila disiasat (−5) atau Integriti < 50 (−1 sebulan). Kesan: peluang dicalonkan PRU ±0.4% bagi setiap mata dari 50 (Fasal 39(9)(f)); bertanding Presiden / Timbalan Presiden perlu Restu ≥ 60; rayuan tatatertib ke Majlis Syura (Fasal 77) perlu Restu ≥ 75, peluang 70%.
  - **🗣️ Ceramah** (1 AP, RM 300: akar umbi +2, IP +4, Restu +1) dan **📣 Ceramah Perdana** untuk Yang Dipertua Kawasan ke atas (2 AP, RM 1,500: akar umbi +3, IP +8, Reputasi +1, Restu +2), sekali sebulan.
  - **📖 Dewan Ulamak**: medan baharu *Bidang pengajian* semasa mendaftar (Umum / Pengajian Islam); simpanan lama boleh menukar sekali. Jawatan Ketua Dewan Ulamak Kawasan → Negeri → Pusat dipilih dalam tahun pemilihan (keputusan bulan 5 / 7 / 9) ⚠️. Ketua Dewan Ulamak Pusat dengan Restu ≥ 80 berpeluang 50% dilantik **Ahli Majlis Syura Ulamak** (5 tahun, IP +10 sebulan, Reputasi +2; Fasal 8).
  - **🧓 Dewan As-Sabiqun** (60 tahun ke atas): IP +3 dan stress −1 sebulan; jawatan hanya jika tiada jawatan parti lain (Fasal 59(5)).
  - **🤝 Ahli Bersekutu** (bukan Islam): pilihan *Jenis keahlian PAS* semasa mendaftar. Hanya boleh memegang jawatan dalam **Dewan Himpunan Pendukung** (Fasal 16(2), 60); tiada sayap; calon PRU hanya di kerusi dengan pengundi Bumiputera bawah 60% ⚠️.
  - Peringatan **Fasal 15A** (paparan sahaja).
  - Ketua Dewan: IP bulanan +2 / +4 / +8 (Kawasan / Negeri / Pusat) ⚠️.
- Ujian unit baharu; `tools/ujian-pas.js` diperluas. Cache `nusa-v13.32`.

## v13.31 (2026-11-06)

- **Parti baharu: PAS (Perikatan Nasional), Fasa 1** (maklum balas di borang, baris 8 dan 11–13), ikut mockup skop PAS yang dipersetujui dan Perlembagaan PAS (Pindaan 2025).
  - Menu utama: gabungan **PN** dengan chip PAS; rakan PN (Bersatu, Gerakan, MIPP, Wawasan) sebagai NPC. Logo daripada pengguna.
  - Mod penuh menggunakan enjin UMNO dengan istilah PAS: **Kawasan** dan **Yang Dipertua Kawasan** (Fasal 41), **Perhubungan PAS Negeri** dan **Pesuruhjaya** (Fasal 53), **Jawatankuasa Kerja PAS Pusat** (Fasal 38), **Muktamar Tahunan** (Fasal 18), **Dewan Muslimat** (Fasal 58). Dewan Pemuda 40 tahun ke bawah; tiada Puteri.
  - Pemilihan parti **setiap 2 tahun** (dari 2027 ⚠️). Perwakilan Kawasan ke Muktamar: 4 wakil, +1 bagi setiap 1,000 ahli melebihi 2,000, maksimum 15. Kad PAS dengan **Jelajah Kawasan**.
  - Kawasan operasi: 165 kawasan Parlimen Semenanjung (`tools/build-pas.js`). Kuota PAS dalam PN ⚠️: 70 Parlimen dan 200 DUN, ikut peratus Bumiputera.
  - Kerajaan ⚠️: PN bermula lebih lemah di peringkat persekutuan (boleh menang jika populariti tinggi); kekuatan DUN ikut negeri, jadi PN memerintah Kelantan, Terengganu, Kedah dan Perlis. Kad kerusi, carta hemisikal dan PRK memaparkan PN sebagai gabungan anda dan BN sebagai lawan.
- Ujian: 2 ujian unit baharu, `tools/ujian-pas.js` (pelayar), simulasi `PARTI=PAS`. Ujian pelayar dan indeks dikemas kini (16 trofi, 10 pilihan parti). Cache `nusa-v13.31`.

## v13.30 (2026-11-05)

- **Gelaran negeri lain (maklum balas di borang)**, ikut mockup yang dipersetujui. Negeri selain negeri cawangan kini boleh mengurniakan gelaran tahap 1 (fiksyen permainan) ⚠️:
  - Khidmat persekutuan: Menteri Penuh / Timbalan PM / PM setiap 24 bulan; pimpinan parti pusat: Naib Presiden ke atas 36 bulan; Integriti ≥ 65.
  - Maksimum 3 negeri lain, Reputasi +1 setiap satu. Negeri dipilih rawak; negeri yang dijelajah ≥ 6 kali (Jelajah Bahagian / Majlis Penerangan UMNO) berpeluang 3 kali ganda.
  - Nama ikut negeri (dipermudahkan): Dato' / Datuk. Awalan nama tidak berubah. Kad Anugerah & Gelaran menunjukkan 🌏 Gelaran Negeri Lain dan kemajuan.
- **10 pencapaian kerjaya baharu** (jumlah 15): Ketua Kerajaan Negeri, Perdana Menteri, Hatrik PRU, Raja PRK, Nakhoda Parti, Tokoh Seluruh Negara, Tun, Suara Rakyat (20 keluhan / isu), Penggubal Undang-undang (5 RUU lulus), Doktor Falsafah dan Jutawan Politik (RM 1 juta tanpa kes SPRM / siasatan aktif). Trofi berkunci menunjukkan bar kemajuan.
- Ujian unit baharu; `tools/ujian-gelaran.js` diperluas. Cache `nusa-v13.30`.

## v13.29 (2026-11-04)

- **Baiki besar (maklum balas di borang): ADUN ditanda "parti tidak membentuk kerajaan" walaupun kad kerusi menunjukkan parti memerintah** (contoh pemain: DUN Melaka BN 19/28, tetapi Ketua Menteri dan Lobi Portfolio dikunci).
  - Punca 1: menang **PRK** menyalin status kerajaan daripada kerusi lain pemain (atau "bukan kerajaan" jika tiada kerusi lain), bukan daripada kad kerusi. Kini status kerusi PRK ikut kad kerusi (Parlimen: kerajaan persekutuan; DUN: kerajaan negeri), termasuk kerusi yang dirampas.
  - Punca 2: simpanan yang melalui PRU sebelum v13.21 (status rawak).
  - **Pembaikan automatik** semasa dashboard dibuka: status ADUN (dan MP bukan Presiden) yang bercanggah dengan kad kerusi dibetulkan, dan Lobi Portfolio dibuka jika belum memegang jawatan kerajaan. PRN Sabah (BN ≥ 3 kerusi), Sarawak, kerusi negeri lain dan Presiden yang memilih pembangkang tidak diubah.
- Ujian unit baharu. Cache `nusa-v13.29`.

## v13.28 (2026-11-04)

- **Baiki (maklum balas di borang): elaun jawatan komuniti dan gaji GLC tidak dipapar dalam pratonton tukar bulan.** Wang memang dibayar setiap bulan, tetapi senarai "Pendapatan bulanan" hanya menunjukkan kerjaya, elaun YB, elaun kerajaan dan hartanah. Kini turut dipapar: **Elaun jawatan komuniti** (termasuk Lembaga Agensi Pendapatan Tinggi RM 6,000) dan **Gaji jawatan GLC**.
- Cache `nusa-v13.28`.

## v13.27 (2026-11-04)

- **Muzik latar UMNO**: cover orkestra lagu UMNO (`assets/audio/lagu-umno.mp3`, digunakan dengan kebenaran) menggantikan mars asli untuk pemain UMNO. Parti lain kekal dengan gubahan mars asli yang dijana pelayar.
- Service worker tidak lagi cuba menyimpan permintaan strim audio (Range / 206) dalam cache.
- Ujian pelayar baharu `tools/ujian-audio.js`. Cache `nusa-v13.27`.

## v13.26 (2026-11-04)

- **Carta hemisikal Fasa 2**, ikut mockup yang dipersetujui.
  - **Mod undian:** kad 🗳️ Undian (RUU / Bajet, Dewan Rakyat dan DUN) memaparkan carta Sokong / Atas pagar / Bantah dengan garis ambang; setiap lobi mengemas kini titik. Keputusan undian dipapar dengan carta Sokong / Bantah beranimasi. Undi Tidak Percaya: Setia / Goyah / Pembangkang.
  - **Perubahan kerusi semasa penggal** (modul baharu `js/kerusi-semasa.js`): PRK pemain dan PRK selepas letak jawatan kini menukar kiraan kerusi apabila kerusi bertukar tangan. PRK di kawasan lain (NPC) ⚠️: peluang 15% sebulan, penyandang kekal 70%, pemenang ikut Reputasi; tiada PRK dalam 12 bulan terakhir penggal atau semasa PRU, dan PRK NPC tidak boleh menukar kerajaan. Lencana "UMNO +1 · PH −1", titik berubah berkelip sekali, dan senarai 🔄 Perubahan kerusi semasa penggal.
  - **Sejarah PRU:** butang PRU lepas (sehingga 5) dengan perbandingan kerusi. PRU baharu diarkib dengan pecahan penuh; PRU lama dipapar dengan pembangkang satu blok.
  - Lompat parti tidak dimodelkan (Akta Anti Lompat Parti: kerusi dikosongkan dan muncul sebagai PRK).
- Ujian unit baharu; `tools/ujian-hemisikal.js` diperluas. Cache `nusa-v13.26`.

## v13.25 (2026-11-04)

- **Carta hemisikal Dewan (Fasa 1)**, ikut mockup yang dipersetujui. Di tab Dewan, bar kerusi mendatar diganti dengan separuh bulatan, satu titik untuk setiap kerusi (Dewan Rakyat 222 dan DUN negeri).
  - Warna: parti anda, rakan gabungan, bebas/lain, PH, PN. Pihak kerajaan di kiri, pembangkang di kanan, garis putus untuk majoriti mudah.
  - Kerusi anda ditonjolkan (titik bertepi kuning); ketik untuk melihat nama kerusi. Nama kerusi dan majoriti PRU dipapar di bawah carta.
  - Animasi isian sekali bagi setiap keputusan PRU (sekitar 2 saat), boleh dilangkau; dimatikan jika peranti meminta kurang gerakan.
  - Paparan sahaja: angka kerusi tidak berubah. Warna PN di carta ditukar kepada hijau tua supaya tidak sama dengan biru BN.
- Ujian pelayar baharu `tools/ujian-hemisikal.js`. Cache `nusa-v13.25`.

## v13.24 (2026-11-04)

- **Penjelasan kempen Pemilihan Pusat (maklum balas di borang: "Apakah fungsi ini?")**. Kad UMNO: Pemilihan & Lantikan kini ada nota ringkas: Jelajah +8% di satu Bahagian pilihan, Majlis Penerangan +3% di semua Bahagian dalam satu negeri, setiap satu sekali sebulan. Nota serupa di kad MCA (Jelajah sahaja). Angka tidak berubah. Cache `nusa-v13.24`.

## v13.23 (2026-11-04)

- **Selesaikan keluhan rakyat dengan dana peribadi (maklum balas di borang)**, ikut mockup yang dipersetujui. Pemain pembangkang yang hanya mendapat 40% peruntukan kini boleh menyelesaikan keluhan tanpa membawa usul ke mesyuarat.
  - 📮 Keluhan Rakyat (ADUN / Ahli Parlimen): butang **💰 Dana peribadi**, kos keluhan × 1.2, 1 AP, IP +15, akar umbi +3, Reputasi +1 ⚠️.
  - 📌 Isu Tempatan (semua pemain, termasuk Ahli Biasa): butang **💰 Selesai sendiri**, RM 600 / RM 1,000 / RM 1,800 ikut tahap isu, 1 AP, IP +10, akar umbi +2, Reputasi +1 ⚠️. Isu ditanda selesai "melalui dana peribadi".
  - Pemain pembangkang: akar umbi +1 tambahan. Had 2 kali sebulan (gabungan kedua-dua kad). Kos ikut tahap kesukaran seperti perbelanjaan lain.
- Ujian unit baharu dan `tools/ujian-dana.js` (pelayar). Cache `nusa-v13.23`.

## v13.22 (2026-11-04)

- **Ucapan Dasar Presiden (maklum balas di borang, 3 pemain)**, ikut mockup yang dipersetujui. Jika pemain ialah Presiden, usul Ucapan Dasar di Perhimpunan Agung (semua parti) kini menjadi **🎤 pilihan tema ucapan** (2 AP ⚠️), bukan sokong / bantah:
  - Perpaduan dan Pembangunan (Reputasi +3, hubungan gabungan +3); Ekonomi Rakyat (Reputasi +2, akar umbi +4, sentimen nasional +1); Kesinambungan dan Pembaharuan (Reputasi +2, sokongan perwakilan +5); Parti Dekat dengan Akar Umbi (Reputasi +1, akar umbi +6, Ketua Cawangan +3).
  - Berisiko: Serang Pembangkang (60% Reputasi +5; 40% Reputasi −3 dan krisis tular); Reformasi Dalaman (Reputasi +5, penentang +8, AJK −3) ⚠️.
  - Perwakilan mengundi sokongan: ≥ 50% diterima (kesan penuh, IP +20); < 50% kurang sambutan (Reputasi separuh, penentang +5) ⚠️.
  - Pemain bukan Presiden kekal sokong / bantah / berkecuali.
- Ujian unit baharu dan `tools/ujian-ucapan.js` (pelayar). Cache `nusa-v13.22`.

## v13.21 (2026-11-04)

- **Baiki besar (maklum balas di borang, beberapa pemain): status kerajaan/pembangkang tidak sama dengan kerusi yang dipaparkan.** Punca: dalam pelayar, `pru.js` memanggil modul anggaran kerusi dengan nama global yang salah (`MyPolitikPaparan`, sepatutnya `NusaPaparan`), jadi pembaikan v11.4 tidak pernah berjalan dalam permainan sebenar: status kerajaan kerusi pemain dilambung secara rawak, berasingan daripada kad Kerusi Parlimen / DUN. Kini status ikut anggaran kerusi yang sama dengan kad (ujian unit memastikan nama modul betul).
- **Presiden:** selepas rundingan kerajaan (PM / TPM / Kabinet / Pembangkang), status kerusi MP ikut keputusan rundingan dan kad kerusi dijana daripada keputusan itu. Sebelum ini Presiden boleh menjadi PM tetapi dengan peruntukan pembangkang. Jika layak menjadi MB, tetingkap Menteri Besar dibuka dahulu selepas memilih Kabinet (pilihan lobi portfolio biasa kekal).
- **Parti Sarawak (GPS)**: kerusi Parlimen kini dikira sebagai blok GPS (23 hingga 28 kerusi) dalam Kerajaan Perpaduan, jadi ahli parlimen GPS tidak lagi menjadi pembangkang secara rawak ⚠️ (andaian: GPS sentiasa dalam kerajaan persekutuan; PSB kekal pembangkang).
- Baiki: label kad Pencabar Utama ("Cawangan: …") dalam EN selepas nama NPC baharu v13.20.
- Ujian unit baharu. Cache `nusa-v13.21`.

## v13.20 (2026-10-31)

- **Satu senarai nama NPC (maklum balas di borang, baris 5)**, ikut mockup yang dipersetujui. Sebelum ini nama NPC dijana oleh 5 modul berasingan, jadi Ketua Bahagian dalam Struktur bukan orang yang dilawan dalam pemilihan, dan Struktur tidak berubah selepas pemilihan.
  - Daftar pemegang jawatan (`p.npc.nama`) dibaca oleh Struktur Organisasi, calon pemilihan, Pencabar Utama dan pencabar jawatan. Simpanan lama mengekalkan nama Struktur sedia ada.
  - Pemilihan parti: penyandang NPC dalam Struktur sentiasa bertanding (+5 kekuatan ⚠️); calon lain diambil daripada Naib, Timbalan dan AJK dalam Struktur. Pemenang (pemain atau NPC) terus dikemas kini dalam Struktur.
  - Kad baharu **📋 Lantikan: Kekalkan atau Ubah** (tab Tindakan) selepas menang Ketua Cawangan / Ketua Bahagian / Presiden (UMNO): Setiausaha, Bendahari dan Ketua Penerangan. Kekalkan: sokongan AJK +2 ⚠️; Ubah (pilih daripada 3 AJK): sokongan AJK −2, kesetiaan Ketua Cawangan +1 ⚠️. Yang belum dipilih dikekalkan pada akhir bulan (`js/npc.js`, `js/npc-ui.js`).
- **Nama NPC ikut kaum majoriti parti (maklum balas pengguna)**: sebelum ini semua parti selain parti Sarawak memakai nama Melayu. Kini MCA = nama Cina, MIC = nama India (a/l, a/p), PPP = kebanyakan India dengan sebahagian Cina dan Melayu ⚠️, PBRS = nama Kadazan-Dusun-Murut dengan sebahagian Cina ⚠️, SUPP = kebanyakan Cina dengan sebahagian Dayak ⚠️. UMNO kekal Melayu; PBB, PRS dan PDP kekal Melayu/Dayak. Terpakai pada Struktur, calon pemilihan, pencabar, Badan Perhubungan dan blok. Nama ialah gabungan rekaan.
- Ujian unit baharu dan `tools/ujian-npc.js` (pelayar). Cache `nusa-v13.20`.

## v13.19 (2026-10-30)

- **Letak jawatan parti (maklum balas pemain di borang, 2 kali: "Presiden, Ketua Bahagian, ADUN dan EXCO Kanan, stress melampau")**, ikut mockup yang dipersetujui.
  - Kad di tab Profil dinamakan semula **🏛️ Jawatan & Letak Jawatan**: jumlah beban Stress sebulan, bahagian **Jawatan parti** (setiap jawatan dengan beban Stress dan butang Letak Jawatan) dan bahagian Wakil rakyat & kerajaan (v13.12).
  - Kesan ⚠️: Stress −2 × beban jawatan serta-merta, beban bulanan hilang; Reputasi 0 (Cawangan), −1 (Bahagian), −2 (Pusat), −3 (Presiden). Pengganti NPC; boleh bertanding semula pada pemilihan seterusnya; tangga kerjaya kekal.
  - Presiden: Timbalan Presiden (NPC) menjadi Presiden. Jika pemain PM, PM kekal hingga PRU seterusnya dengan tekanan politik +10 ⚠️.
  - Dikunci semasa musim pemilihan parti (tahun pemilihan, bulan tetingkap dibuka) dan semasa PRU / PRK.
- Terjemahan EN, ujian unit dan ujian pelayar `tools/ujian-letak.js` dikemas kini. Cache `nusa-v13.19`.

## v13.18 (2026-10-30)

- **Baiki (maklum balas pemain, borang): tidak dapat mengimport watak dari fon ke laptop.** Import kod simpanan hanya ada dalam Menu di dalam permainan, jadi peranti baharu yang belum ada watak tidak boleh mengimport. Kini menu utama → **Simpanan permainan** ada bahagian **📲 Import watak dari peranti lain** (tampal kod NUSA1 atau pilih fail JSON, pratonton watak, kemudian terus ke dashboard).
- Baiki: maklum balas pemain sentiasa melaporkan versi "v13.7". Versi kini v13.18 dan ujian unit memastikan ia sama dengan versi cache.
- `tools/ujian-import.js` (pelayar). Cache `nusa-v13.18`.

## v13.17 (2026-10-30)

- **Baiki (maklum balas pemain): tidak boleh menjadi Menteri Besar walaupun BN menang besar di DUN (cth. Selangor 41/56) dan pemain Pengerusi Badan Perhubungan.** Punca: pemain yang bertanding Parlimen + DUN serentak dan menang kedua-duanya hanya mendapat lobi portfolio Parlimen, sedangkan tuntutan MB memerlukan lobi DUN. Kini MB / Ketua Menteri / Premier boleh dituntut dalam mana-mana tetingkap lobi selepas pilihan raya, asalkan pemain ADUN, partinya membentuk kerajaan negeri dan syarat lain dipenuhi.
- Presiden parti yang menjadi pembangkang di Parlimen tetapi partinya membentuk kerajaan negeri kini mendapat lobi kerajaan negeri (MB / EXCO).
- Senarai semak MB juga dipaparkan kepada Pengerusi Badan Perhubungan yang belum ADUN, dengan nota supaya bertanding kerusi DUN. Sebab penolakan lebih jelas ("Sudah memegang jawatan kerajaan", "Parti anda tidak membentuk kerajaan negeri").
- Ujian unit baharu. Cache `nusa-v13.17`.

## v13.16 (2026-10-30)

- **MCA & MIC Sabah**, ikut mockup yang dipersetujui (`js/sabah-bn.js`, `js/sabah-bn-ui.js`). Kedudukan kedua-dua parti di Sabah lemah selepas 2018: MCA kalah 4 kerusi DUN pada PRN 2020 dan 2 kerusi pada PRN 2025; MIC Sabah ada 25 cawangan dan tidak bertanding.
  - Pendaftaran: MCA dan MIC boleh memilih Sabah. MCA Sabah: 7 Bahagian ⚠️ (Kota Kinabalu, Sepanggar, Batu Sapi dan Parlimen yang mengandungi 6 DUN sasaran: Kudat, Penampang, Sandakan, Lahad Datu). MIC Sabah: 4 Bahagian (Kota Kinabalu, Sandakan, Lahad Datu/Silam, Tawau; Labuan ialah Wilayah Persekutuan), 25 Cawangan ⚠️. Ikut jadual PRN Sabah. Nota borang khas Sabah.
  - **Pemulihan Sabah** ⚠️: mula 20, susut 1 sebulan ke arah 20. Khidmat Masyarakat Bandar (1 AP, RM 1,000, +5), Jentera untuk calon BN Sabah (musim PRN; 2 AP, +6, hubungan gabungan +2). Selepas PRN: kalah −10, menang +15.
  - MCA Sabah ⚠️: kuota DUN 2 / 3 / 4 dan Parlimen 0 / 0 / 1 ikut Pemulihan (<50 / 50-69 / ≥70) daripada 6 DUN sasaran (Likas, Kapayan, Elopura, Karamunting, Tanjong Kapor, Segama). Kekuatan kerusi −12, berkurang 1 bagi setiap 10 Pemulihan melebihi 20. Lawan: Warisan, DAP, GRS.
  - MIC Sabah: tiada kuota kerusi. **Senator** ⚠️: selepas PRN Sabah, Ketua Bahagian ke atas dengan Pemulihan ≥ 60, peluang 30%; 36 bulan, IP +10 dan RM 2,000 sebulan, lencana "Senator".
  - Kad **MCA Sabah / MIC Sabah: Membina Semula** di tab Profil. Kad MCA/MIC menunjukkan kuota Sabah.
- Data MCA dan MIC dijana semula (`node tools/build-mca.js`, `node tools/build-mic.js`); salinan data tempatan PPP dan PBRS turut dijana (sebelum ini tertinggal).
- Baiki: teks "BN termasuk Friends of BN" dalam kad Kerusi Parlimen kini ada terjemahan EN.
- Terjemahan EN, ujian unit dan `tools/ujian-sabah-bn.js` (pelayar). Cache `nusa-v13.16`.

## v13.15 (2026-10-30)

- **Friends of BN sebagai NPC** (KIMMA, Makkal Sakti, IPF, MIUP), ikut mockup yang dipersetujui (`js/friends-bn.js`, `js/friends-bn-ui.js`). Parti rakan BN yang belum menjadi komponen penuh (berita Jan-Apr 2026); tidak boleh dimainkan dan tiada nama pemimpin sebenar. Logo daripada pengguna.
  - Panel BN di menu utama: baris cip "Friends of BN (rakan, bukan komponen)" yang tidak boleh diklik.
  - Rundingan kerusi PRU ⚠️: 3 kerusi Parlimen (5 jika diterima sebagai komponen), tidak pernah kerusi pemain; dipaparkan di tab Pemilihan. Kerusi yang dimenangi dikira dalam kerusi BN (kad Kerusi Parlimen).
  - Kempen ⚠️: "Jemput Friends of BN berkempen" (calon BN, kerusi dengan pengundi India 10% ke atas): 1 AP, sokongan +2%, sekali setiap kempen.
  - Majlis Tertinggi BN ⚠️: setiap Januari, Presiden parti komponen BN mengundi Sokong / Tolak / Berkecuali. Peluang diterima 25% asas, +20% jika menyokong, −15% jika menolak. Sokong: hubungan gabungan +3 dan sokongan pengundi India +1% pada PRU seterusnya; Tolak: hubungan gabungan −3. Tidak dijawab = berkecuali. Pemain bukan Presiden: berita sahaja.
  - MIC: kuota kerusi tidak berubah; jika Friends of BN diterima, hubungan gabungan MIC −5 sekali ⚠️.
- Terjemahan EN, ujian unit dan `tools/ujian-fbn.js` (pelayar). Cache `nusa-v13.15`.

## v13.14 (2026-10-30)

- **Baiki (maklum balas pemain): kad Laluan Kerjaya (Sayap) di borang pendaftaran tidak bergaya.** Gaya kad sayap terpadam secara tidak sengaja dalam v13.0, jadi pilihan sayap kelihatan seperti senarai radio mentah yang bercampur. Gaya kad dipulihkan (grid 2 lajur di telefon, 4 di desktop), termasuk peraturan `[hidden]` untuk medan borang. Senarai sayap ikut parti tidak berubah (cth. PBB, MCA, PBRS: Utama, Pemuda, Wanita sahaja).
- **Baiki (maklum balas pemain): bar kerusi di tab DUN / Dewan berlabel "BN" untuk pemain Sarawak.** Kini berlabel GPS (DUN Sarawak) atau Perpaduan (Dewan Rakyat, parti Sarawak), sama dengan kad Kerusi DUN di tab Mesyuarat. Jika gabungan pemain kalah, ringkasan menulis "GPS (pembangkang)", bukan "Kerajaan (GPS)".
- Ujian pelayar PBB menyemak kedua-dua pembaikan. Cache `nusa-v13.14`.

## v13.13 (2026-10-30)

- **Gelaran (maklum balas pemain):** ikut mockup "Gelaran & Pendidikan" yang dipersetujui (`js/gelaran.js`).
  - Gelaran persekutuan pemain kini dieja **Datuk** (bukan Dato'), seperti dipinta pengguna.
  - **Tun** ⚠️: sudah Tan Sri, pernah Perdana Menteri sekurang-kurangnya 36 bulan (jumlah), Integriti ≥ 75, tiada hukuman disiplin. Reputasi +3.
  - **Gelaran negeri** ⚠️ daripada negeri cawangan: tahap 1 (ADUN / EXCO 36 bulan, Integriti ≥ 60) dan tahap 2 (MB / KM 36 bulan, Integriti ≥ 70). Dato' / Dato' Seri; Pahang Dato' Sri; Melaka dan Pulau Pinang Datuk / Datuk Seri; Sabah Datuk / Datuk Seri Panglima. Sarawak 4 tahap: Datuk → Datuk Amar (Menteri Kanan / Premier 36 bulan) → **Datuk Patinggi** (Premier 24 bulan) → Pehin Sri (Premier 60 bulan). Reputasi +2 setiap satu.
  - Awalan nama: persekutuan → negeri → Dr. (cth. "Tan Sri Dato' Seri Dr.", "Tun Dr."). Datuk persekutuan tidak diulang jika ada gelaran negeri; di Sarawak Datuk Patinggi / Pehin Sri didahulukan.
- **Pendidikan (baharu, `js/pendidikan.js`):**
  - Medan **Pendidikan tertinggi** semasa mendaftar (SPM, Diploma, Ijazah Sarjana Muda, Sarjana, PhD); simpanan lama = Ijazah Sarjana Muda ⚠️.
  - Kad **🎓 Pendidikan** di tab Profil: sambung belajar separuh masa ⚠️ (Diploma RM 8,000 / 18 bulan; Ijazah RM 20,000 / 36 bulan; Sarjana RM 25,000 / 24 bulan; PhD RM 40,000 / 36 bulan). AP bulanan −1 dan Stress +2 sebulan; boleh ditangguh (yuran tidak dipulangkan).
  - Kesan bila tamat: Reputasi +1 / +1 / +2 / +3; peluang lobi portfolio +2% (Ijazah), +4% (Sarjana), +6% (PhD). PhD sahaja memberi awalan **"Dr."**.
  - **Doktor Kehormat** selepas 24 bulan sebagai Menteri / MB / TPM / PM: Reputasi +1, tanpa awalan "Dr.".
- Kad Anugerah & Gelaran (tab Tindakan) dan Rumusan Kerjaya menyenaraikan gelaran negeri, Tun dan pendidikan. Terjemahan EN, 3 ujian unit dan `tools/ujian-gelaran.js` (pelayar). Cache `nusa-v13.13`.

## v13.12 (2026-10-30)

- **Letak Jawatan (maklum balas pemain):** pemain kini boleh melepaskan kerusi atau jawatan kerajaan tanpa bersara, contohnya untuk Pindah Cawangan. Ikut mockup yang dipersetujui (`js/letak.js`, `js/letak-ui.js`).
  - Kad baharu **🏛️ Wakil Rakyat & Kerajaan** di tab Profil: setiap kerusi MP / ADUN dan jawatan kerajaan, masing-masing dengan butang Letak Jawatan dan skrin pengesahan. Dikunci semasa PRU / PRN atau PRK.
  - Letak jawatan kerajaan (Menteri / EXCO / MB / TPM / PM): kerusi kekal, elaun dan CDF tamat, Reputasi −2, tidak boleh dilobi untuk jawatan kerajaan selama 6 bulan ⚠️. Jika PM, TPM (NPC) mengambil alih.
  - Letak kerusi MP / ADUN: Reputasi −3, akar umbi −5 ⚠️. Jawatan yang bergantung pada kerusi itu turut tamat (MP → jawatan persekutuan; ADUN → EXCO / MB / Menteri Negeri). PRK bulan depan dengan calon parti (NPC); jika parti kalah, Reputasi −3 lagi ⚠️. Tiada PRK jika 12 bulan atau kurang sebelum PRU / PRN yang mempertandingkan kerusi itu.
  - Peluang calon parti dalam PRK ⚠️: 55% + (Reputasi − 50) × 0.8% + sentimen nasional × 1.2%, antara 20% dan 85%.
  - Selepas tiada kerusi dan jawatan kerajaan, syarat Pindah Cawangan "tiada kerusi / jawatan" dipenuhi (syarat lain kekal).
- **Syarat Menteri Besar dipaparkan (maklum balas pemain "tak boleh jadi MB"):** kad **👑 Menteri Besar / Ketua Menteri / Premier** dalam tab Tindakan untuk setiap ADUN, dengan senarai semak ✅/⛔ (ADUN di negeri ini, parti / gabungan membentuk kerajaan negeri, Pengerusi Badan Perhubungan Negeri atau Presiden PBB) dan cara peluang dikira.
- Terjemahan EN, 2 ujian unit dan `tools/ujian-letak.js` (pelayar). Cache `nusa-v13.12`.

## v13.11 (2026-10-30)

- **Rundingan PM selepas PRU (maklum balas pemain):** parti yang menang banyak kerusi tetapi memerlukan rakan gabungan kerap hanya mendapat TPM, kerana peluang PM sekitar 63% walaupun parti itu jauh lebih besar daripada rakan. Kini, jika parti pemain ialah parti terbesar dalam gabungan, peluang PM = 65% + (bahagian kerusi dalam gabungan − 50%) × 1.5, campur hubungan gabungan dan reputasi, maksimum 97% (cth. 60% → 80%, 70% → 95%). Parti yang lebih kecil daripada rakan kekal dengan formula asal. Mesej kegagalan kini menyebut peluang yang tidak dicapai.

## v13.10 (2026-10-30)

- **Baiki (maklum balas pemain): halaman tidak boleh digesel kembali ke kanan di telefon.** Lencana jawatan yang panjang (cth. "Menteri Pembangunan Sosial & Perbandaran Sarawak") tidak dibalut, jadi seluruh halaman melebar melebihi skrin. Lencana kini dibalut ke baris seterusnya, dan halaman tidak lagi boleh tergelincir ke sisi.

## v13.9 (2026-10-30)

- **PRN Sabah**: kerusi DUN Sabah dipertandingkan dalam PRN berasingan daripada PRU, untuk semua pemain di Sabah (UMNO Sabah dan PBRS), mengikut mockup yang dipersetujui (`js/sabah.js`).
  - Jadual ⚠️: PRN Sabah November 2030 (PRN terakhir 29 November 2025), PRU Mac 2031, kemudian setiap 5 tahun. DUN dalam PRN sahaja, Parlimen dalam PRU sahaja; status ADUN kekal semasa PRU dan status MP kekal semasa PRN. Simpanan lama yang sudah melepasi PRU meneruskan PRU sedia ada dahulu.
  - Keputusan PRN memaparkan anggaran 73 DUN (GRS, Warisan, BN, UPKO, lain-lain); kerajaan negeri diketuai GRS, dan BN menyertainya jika menang sekurang-kurangnya 3 kerusi ⚠️. Tiada keputusan nasional dalam PRN.
- **PBRS (Parti Bersatu Rakyat Sabah) boleh dimainkan dalam mod ringan.** Logo daripada pengguna.
  - Kawasan ⚠️: 7 kawasan Parlimen pedalaman Sabah (Kota Marudu, Tuaran, Penampang, Ranau, Keningau, Tenom, Pensiangan; 20 DUN). Cawangan = Daerah Mengundi, 30 hingga 150 ahli (`node tools/build-pbrs.js`). Sayap Pemuda dan Wanita. Takwim ⚠️ bulan 3/5/9; pemilihan setiap 3 tahun dari 2026.
  - Kuota BN ⚠️: Parlimen Pensiangan; DUN Sook dan Bingkor.
  - **Dua Gabungan: BN & GRS**: Kesetiaan BN (mula 60) dan Muhibah GRS (mula 45). Lobi BN Sabah (2 AP, RM 1,500, +6), Majlis Muhibah GRS (1 AP, RM 800, +6, BN −2), Kempen Hak Orang Asal & MA63 (1 AP, akar umbi +5). Rundingan 12 bulan sebelum PRN: Kesetiaan BN ≥ 70 → kuota DUN +1 (Nabawan), < 35 → −1 (Sook sahaja). Muhibah GRS < 50 → GRS bertanding juga (3 penjuru, kekuatan kerusi −8).
  - Kad **🌾 PBRS: Dua Gabungan BN & GRS** di tab Profil, PBRS dalam panel BN menu utama (5 parti), langkah tutorial, terjemahan EN, 2 ujian unit dan `tools/ujian-pbrs.js` (pelayar). `PARTI=PBRS node tools/simulasi.js` disokong.

## v13.8 (2026-10-30)

- **PPP (Parti Progresif Penduduk / myPPP) boleh dimainkan dalam mod ringan**, mengikut mockup yang dipersetujui. Perlembagaan PPP tidak tersedia, jadi PPP menggunakan enjin yang sama seperti MIC (Cawangan, Bahagian = kawasan Parlimen, Pusat) tanpa peraturan perlembagaan khas. Logo daripada pengguna.
  - Kawasan ⚠️: 39 kawasan Parlimen Semenanjung yang campuran (tiada kaum melebihi 60%; Perak 10, Johor 10, Selangor 7, KL 6, P. Pinang 3, N. Sembilan 2, Melaka 1). Cawangan = Daerah Mengundi, 27 hingga 120 ahli (`node tools/build-ppp.js`).
  - Istilah: Majlis Tertinggi (MT), Perhimpunan Agung PPP, Wisma PPP. Sayap Pemuda, Wanita, Puteri dan Putera (bawah 30 ⚠️). Takwim ⚠️ bulan 3/5/9; pemilihan setiap 3 tahun dari 2027.
  - **Tuntut Kerusi BN**: tiada kerusi tetap; Pengaruh dalam BN (awal 20) melalui Lobi pimpinan BN (2 AP, RM 2,000, +6; Ketua Bahagian ke atas) dan Jentera untuk calon BN (musim PRU; +10 jika calon BN menang, +3 jika kalah). Rundingan 12 bulan sebelum PRU: Parlimen = Pengaruh − 30 (maks 60%), DUN = Pengaruh − 15 (maks 75%).
  - **Krisis Kepimpinan & ROS**: peluang 15% dalam tahun pemilihan; sokong Presiden, sokong pencabar atau berkecuali; 20% berlarutan menjadi pembekuan ROS 6 bulan (tiada mesyuarat, pemilihan atau Tuntut Kerusi BN), rayuan ke Kementerian Dalam Negeri (1 AP, 60%).
  - Kad **⭐ PPP: Tuntut Kerusi BN** di tab Profil, PPP dalam panel BN menu utama (4 parti), langkah tutorial, terjemahan EN, 2 ujian unit dan `tools/ujian-ppp.js` (pelayar). `PARTI=PPP node tools/simulasi.js` disokong.
  - Logo PBRS disimpan untuk fasa seterusnya (perlu PRN Sabah).

## v13.7 (2026-10-30)

- **Butang Maklum balas tanpa nama** ke Google Form: baris ke-4 pada kertas undi di menu utama dan butang "💬 Hantar Maklum Balas (tanpa nama)" dalam Menu dashboard. Skrin pengesahan menerangkan bahawa borang dibuka dalam tab baharu, tanpa akaun dan tanpa emel. Soalan "Maklumat permainan" diisi automatik (versi, parti, tahun dan bulan, jawatan, bahasa, jenis peranti); nama watak dan simpanan tidak dihantar. Pautan dalam `js/maklumbalas.js` (CONFIG.URL, CONFIG.ENTRY); butang disembunyikan jika pautan kosong. Terjemahan EN dan ujian pelayar `tools/ujian-maklumbalas.js`.

## v13.6 (2026-10-29)

- **Menu utama: parti disusun ikut gabungan.** Tujuh butang parti diganti dengan dua butang gabungan, **BN** (Barisan Nasional · 3 parti) dan **GPS** (Gabungan Parti Sarawak · 4 parti), dengan logo gabungan daripada pengguna (`assets/images/logo-bn.png`, `logo-gps.png`). Tekan gabungan untuk membuka panel partinya (BN: UMNO, MCA, MIC; GPS: PBB, PRS, SUPP, PDP); satu panel pada satu masa, tekan semula untuk menutup. Cip parti terus ke pendaftaran seperti dahulu. Terjemahan EN dan ujian pelayar baharu `tools/ujian-gabungan.js`.

## v13.5 (2026-10-29)

- **Fasa B: mekanik pemilihan UMNO ikut Perlembagaan UMNO 2025**, mengikut mockup yang dipersetujui. Berkuat kuasa untuk UMNO sahaja; MCA, MIC dan parti Sarawak mengekalkan peraturan sendiri.
  - **Takwim baharu** (Fasal 14.3, 17.3): Cawangan dan sayap Cawangan bulan 4-5, Mesyuarat Perwakilan Bahagian dan sayap bulan 6, antara musim bulan 7-8, PAU bulan 9, Pasca-PAU bulan 10-12. Teks permainan, tutorial, legenda takwim dan peta penukaran bulan MCA, MIC dan PBB (js/parti.js) dikemas kini.
  - **Pemilihan Pusat di 191 Bahagian** (Fasal 9.3, 9.4, 14.5.4): Presiden, Timbalan Presiden, 3 Naib Presiden dan MKT diundi dalam Mesyuarat Perwakilan Bahagian bulan 6; Ketua, Naib Ketua dan AJK sayap Pusat diundi dalam Mesyuarat Perwakilan sayap Bahagian. PAU tiada undi jawatan. Calon tidak perlu lagi menjadi wakil ke PAU (syarat Fasal 9.5 kekal). ⚠️ Pengundi = 70 + 6 bagi setiap Daerah Mengundi setiap Bahagian, jumlah 54,536 (`node tools/build-umno.js`).
  - **Jelajah Bahagian** (2 AP, RM 2,000, +8% satu Bahagian) dan **Majlis Penerangan Badan Perhubungan** (1 AP, RM 500, +3% semua Bahagian satu negeri), perlu Ketua Bahagian atau lebih.
  - **Tangguh pemilihan** (Fasal 10.16), automatik: jika PRU dijangka dalam 12 bulan selepas musim biasa dan pemilihan sudah diadakan dalam penggal Parlimen semasa. Musim khas selepas PRU (Cawangan PRU + 2, Bahagian dan Pusat PRU + 4, PAU PRU + 6), kitaran 3 tahun bermula semula; penggal pemegang jawatan dilanjutkan. Pengaman: jika PRU tidak berlaku, musim biasa diadakan tahun berikutnya.
  - **Kuasa lantikan** sekali setiap penggal: Ketua Cawangan / Ketua Bahagian (penyokong setia, wakil semua puak, pelapis muda bagi Bahagian) dan Presiden (penyokong setia atau pencabar dalaman); **mohon lantikan** Presiden (Ahli MKT, Setiausaha Agung, Bendahari Agung, Ketua Penerangan) dengan peluang kedekatan × 0.8.
  - **Perhimpunan Agung Khas** (Fasal 8.5, 9.12) apabila sokongan perwakilan Bahagian Presiden di bawah 25%.
  - **Tempoh Pemilihan** Tataetika (Perkara 2.1.2): 6 bulan sebelum musim Cawangan hingga 6 bulan selepas undi Pusat; Jamuan Mesyuarat risiko ×1.5 dan Lobi Ketua Bahagian menjadi zon kelabu (Perkara 5.5, 5.6).
  - Kad baharu **🗳️ UMNO: Pemilihan & Lantikan** di tab Profil dan banner kitaran pemilihan di tab Pemilihan, dengan terjemahan EN.
  - **Simpanan lama** yang berada di tengah musim (bulan 4-9) semasa kemas kini meneruskan takwim lama sehingga hujung tahun.
  - Ujian baharu: 3 ujian unit (tools/ujian.js) dan `tools/ujian-umno.js` (pelayar).

## v13.4 (2026-10-29)

- **Fasa A: struktur UMNO ikut Perlembagaan UMNO 2025** (buku Perlembagaan, Peraturan Persidangan, Peraturan Wanita, Pemuda, Puteri dan Tataetika), mengikut mockup yang dipersetujui.
  - Cawangan: "Naib Ketua Cawangan" menjadi **Timbalan Ketua Cawangan** (Fasal 18.1.2; simpanan lama ditukar automatik); AJK Cawangan dipilih 7 → **15** (18.1.7).
  - Bahagian: AJK Bahagian dipilih 15 → **20** (15.1.7); Ketua Wanita, Pemuda dan Puteri Bahagian dipaparkan sebagai Naib Ketua Bahagian ex-officio (15.1.3).
  - AJK sayap dipilih: Cawangan 5 → **7**, Bahagian 10 → **15**, Pusat 15 → **20** (Peraturan sayap 17.1.7, 12.3.7, 5.1.7).
  - Calon pesaing ditambah bagi jawatan AJK supaya peluang menang kekal (cth. AJK Cawangan 15 kerusi / 24 calon).
  - **Ketua Wanita Pusat bertaraf Timbalan Presiden** (pangkat 11) dan **Ketua Pemuda/Puteri Pusat ialah Naib Presiden** (pangkat 10) (Fasal 9.2.2.2, 9.2.3, 9.4).
  - Struktur Organisasi: pegawai lantikan (Setiausaha, Bendahari, Ketua Penerangan) dan bilangan AJK lantikan (Cawangan 6, Bahagian 12, MKT 13; sayap 3/3/5) sebagai NPC.
  - Had umur sayap: jawatan sayap kekal sehingga tamat penggal selepas melepasi had umur; **Ketua Puteri Malaysia boleh mempertahankan jawatan sehingga umur 40** (Peraturan Puteri 4.2.1).
  - Menu Perlembagaan: 16 Fasal (tambah 4, 5, 7, 9, 10, 12, 15, 18, 21, 25) dan **tab baharu** Peraturan Persidangan, Wanita UMNO, Pemuda UMNO, Puteri UMNO dan Tataetika Ahli, dengan terjemahan EN.
  - Bilangan kerusi baharu terpakai kepada semua parti yang menggunakan enjin yang sama (MCA, MIC dan parti Sarawak).

## v13.3 (2026-10-29)

- **MIC boleh dimainkan (mod penuh)**, berdasarkan Perlembagaan MIC (diterima Perhimpunan Agung ke-71 pada 24-9-2017, berkuat kuasa 18-4-2018) dan mockup MIC yang dipersetujui. Logo daripada pengguna.
  - Kawasan: semua 165 kawasan Parlimen Semenanjung (data/mic-semenanjung.csv: 165 Bahagian, 445 DUN, 6,103 Cawangan; jana semula dengan `node tools/build-mic.js`). Ahli Cawangan = pemilih × India% × 8%, antara 60 dan 200 (Perkara 17.12).
  - Kuota BN: 10 Parlimen dan 20 DUN ikut peratus India (andaian); notis dalam/luar kuota pada skrin pendaftaran.
  - Istilah: Pengerusi Cawangan/Bahagian, Jawatankuasa Kerja Pusat (CWC), Mesyuarat Agung Tahunan Cawangan, Persidangan Perwakilan Bahagian, Kongres Negeri, Perhimpunan Agung MIC, Menara Manickavasagam.
  - Takwim: Cawangan bulan 3, Bahagian bulan 5, Kongres Negeri bulan 7, Perhimpunan Agung bulan 9 (andaian); pemilihan setiap 3 tahun bermula 2027.
  - **Sayap Putera baharu** (lelaki bawah 30; MIC sahaja), bertukar ke Pemuda pada umur 30. MIC juga ada Puteri.
  - Syarat: semua jawatan Bahagian dan Pusat perlu **sedang Pengerusi Cawangan**; 5 tahun keahlian (Bahagian, CWC, Naib Presiden), 10 tahun (Timbalan Presiden, Presiden); Pengerusi Bahagian perlu 3 tahun AJK Cawangan dan dihadkan 3 penggal berturut-turut; Presiden perlu 3 penggal Pengerusi Cawangan, 2 penggal CWC dan 250 penamaan, had 3 penggal.
  - Pemilihan Pusat oleh pegawai Cawangan (10 setiap Cawangan + CWC, sekitar 61,090 pengundi); **Rangkaian Pengerusi Cawangan** (2 AP, RM 1,500, +8%); **lantik pegawai Cawangan** (setia atau pencabar).
  - **Kongres Negeri** (bulan 7 tahun pemilihan) dan lantikan Presiden (Setiausaha Agung, Bendahari Agung, Ketua Penerangan, Ahli CWC, Pengerusi Kongres Negeri).
  - Peraturan: tidak hadir 3 mesyuarat (Perkara 37.4, 85); gantung 6 bulan oleh Presiden selepas sidang media silap cakap jika kedekatan rendah, rayuan ke CWC (Perkara 61); Perhimpunan Agung Luar Biasa (73.1); yuran RM 4 pada bulan 11 (12, 15.5); amaran Cawangan mati (18); sumbangan wakil rakyat RM 500 (94); tiada Pindah Cawangan dalam tahun pemilihan (10.5).
  - Perlembagaan MIC dalam menu (13 Perkara, ringkasan), langkah tutorial, terjemahan EN.

## v13.2 (2026-10-29)

- **MCA dibuka di semua 165 kawasan Parlimen Semenanjung** (sebelum ini 61 kawasan dengan pengundi Cina 25% ke atas), lebih dekat dengan struktur sebenar MCA. Peratus Cina kini menentukan kesukaran, bukan kelayakan mendaftar.
  - data/mca-semenanjung.csv: 165 Bahagian, 445 DUN, 6,103 Cawangan (Daerah Mengundi). Formula ahli kekal (pemilih × Cina% × 7%, minimum 50).
  - Kuota kerusi BN kekal 40 Parlimen dan 90 DUN ikut peratus Cina. Kawasan lain ditanda di luar kuota, dan skrin pendaftaran memberi notis sebaik Bahagian dipilih.
  - Pemilihan Pusat: perwakilan setiap Bahagian ikut saiz keahlian (ahli / 150, antara 5 dan 30; andaian), jumlah sekitar 2,834. Bahagian kecil kurang berpengaruh; senarai Jelajah Bahagian memaparkan bilangan wakil.
  - Sabah dan Sarawak masih tidak termasuk.

## v13.1 (2026-10-29)

- **MCA boleh dimainkan (mod penuh)**, berdasarkan Perlembagaan MCA (pindaan sehingga 1-12-2019) dan mockup v13 yang dipersetujui. Logo daripada pengguna.
  - Kawasan operasi: 61 kawasan Parlimen Semenanjung dengan pengundi Cina 25% ke atas; Bahagian = kawasan Parlimen, Cawangan = Daerah Mengundi sebenar (data/mca-semenanjung.csv, 2,163 Cawangan; jana semula dengan `node tools/build-mca.js`). Bilangan ahli ialah anggaran (minimum 50, Perkara 92).
  - Istilah MCA: Pengerusi Cawangan/Bahagian, Jawatankuasa Pusat (JKP), Perhimpunan Cawangan/Bahagian, Perhimpunan Agung MCA, Jawatankuasa Perhubungan Negeri; sayap Pemuda dan Wanita sahaja.
  - Takwim: Perhimpunan Cawangan bulan 4, Bahagian bulan 6, Perhimpunan Agung bulan 8. **Pemilihan parti selepas setiap PRU** (paling lewat 6 bulan selepas PRU atau 36 bulan selepas pemilihan lalu; Perkara 167).
  - Pemilihan Pusat oleh perwakilan Bahagian seluruh negara (61 × 30 = 1,830 pengundi; Perkara 21) dengan tindakan **Jelajah Bahagian** (2 AP, RM 2,000, +8%); 4 Naib Presiden dipilih.
  - **Lantikan Presiden**: Setiausaha Agung, Bendahari Agung, Setiausaha Organisasi Kebangsaan, Ahli JKP lantikan (peluang ikut kedekatan dengan Presiden); pemain Presiden memilih Setiausaha Agung (penyokong setia atau pencabar dalaman).
  - Peraturan: had Presiden 9 tahun (Perkara 21A); 3 tahun keahlian untuk semua pertandingan dan PRU/PRN (Perkara 120); tidak hadir 3 mesyuarat (3 bulan tanpa tindakan) = hilang kerusi kecuali rayuan 1 AP, 70% (Perkara 157); usul pecat 2/3 apabila akar umbi bawah 30% (Perkara 75, 101); Mesyuarat Agung Luar Biasa apabila sokongan AJK Presiden bawah 35 (Perkara 30); sumbangan bulanan wakil rakyat RM 500 (Perkara 142).
  - PRU/PRN: kuota MCA dalam BN 40 Parlimen dan 90 DUN (disusun ikut peratus Cina); kerusi Cina sangat tinggi lebih sukar.
  - Perlembagaan MCA (ringkasan 12 Perkara, BM dan EN) dalam menu; peta, Pindah Cawangan dan tutorial menggunakan data MCA.
- Penjenamaan parti kini memulihkan teks asal dengan tepat apabila parti ditukar (termasuk tukar terus antara dua parti bukan UMNO).

## v13.0 (2026-10-29)

Penambahbaikan daripada analisis penuh repo.

- **Skrin kempen lebih ringkas di telefon:** butang tindakan kempen kini terus di bawah meter kempen. Panel Kaji Selidik dan Bilik Gerakan dipindah ke bawah dan tertutup secara lalai, dengan ringkasan satu baris (status kerusi, undi anda, atas pagar; tenaga, keletihan, zon dikuasai lawan). Pilihan buka/tutup diingati sepanjang sesi. Butang tindakan pertama naik dari kira-kira 2,930 px ke 1,480 px pada skrin 375 px.
- **Tutorial:** tiga langkah baharu (Kaji Selidik & Bilik Gerakan, Krisis Tular & Pertahanan Digital, Jemaah Menteri & Isu Semasa) dan topik Codex "Kempen, Krisis Tular & Kabinet", dalam BM dan EN. Ayat lapuk tentang peluang kerajaan negeri bagi parti GPS dibetulkan (kini ikut kerusi GPS, v12.6).
- **README:** parti Sarawak, takwim PBB, senarai modul baharu dan semua fail ujian.
- **Fon seragam:** index dan dashboard kini guna fon tempatan Plus Jakarta Sans (assets/fonts). Pautan Google Fonts dibuang, jadi tiada lagi permintaan ke pelayan luar untuk fon dan dashboard tidak lagi jatuh ke fon sistem.
- **Kamus terjemahan:** 109 entri berganda yang tidak pernah dipakai dibuang (entri pertama sentiasa diutamakan; terjemahan yang dipaparkan tidak berubah, disahkan pada 3,629 kunci).
- Fail sisa dibuang: k_daftar.png, k_modal.png, geo-demo.html.

## v12.9 (2026-10-29)

- **Krisis Tular & Pertahanan Digital** (js/tular.js, js/tular-ui.js, baharu). 6 senario fitnah rekaan (video disunting, dokumen palsu, petikan separuh, akaun palsu, gambar lama, fitnah keluarga), keterukan 1 hingga 3.
- Krisis muncul bulanan bagi pemegang jawatan atau wakil rakyat (peluang 10%, naik dengan persepsi negatif dan etika buruk, turun dengan pertahanan digital; jeda 3 bulan), atau sekali semasa kempen PRU/PRN (6% sehari). Popup muncul serta-merta; kad di tab Tindakan.
- Tindak balas: Kontra-Naratif (RM 3,000 × keterukan, atau dana kempen RM 1,500 × keterukan; berjaya 65% + pertahanan × 0.3%), Sidang Media Terbuka (1 AP; berjaya 45% + Integriti × 0.4%; silap cakap memburukkan), Diam (persepsi negatif +8 × keterukan, Sokongan Belia −6 × keterukan, sokongan pengundi −2 × keterukan semasa kempen). Tidak dijawab sebelum bulan depan = Diam. Krisis kempen yang belum dijawab menjejas sokongan pengundi setiap hari.
- Pertahanan digital (`cyberDefenseScore`, mula 20, susut 2 sebulan) mengurangkan kerosakan sehingga separuh; dilatih dengan RM 3,000 (+10, jeda 2 bulan) atau naik +5 bila kontra-naratif berjaya.
- Disambung kepada meter sedia ada: `publicPerception` = 100 − Persepsi Negatif, pengundi muda = Sokongan Belia (js/media.js).

## v12.8 (2026-10-29)

- **Bilik Gerakan (War Room)** (js/warroom.js, baharu): panel dalam kad kempen. Tenaga jentera (`partyMachineryPoints` = Tenaga jentera sedia ada) dan dana operasi (`campaignBudget` = Dana kempen) digunakan untuk menghantar jentera ke 5 zon kawasan bertanding: DM terbesar bagi kerusi DUN, DUN bagi kerusi Parlimen (nama sebenar daripada data peta atau data parti Sarawak; nama generik jika data tidak dapat dimuat).
- Setiap zon ada kehadiran jentera kita berbanding lawan (`machineryPresence`), tahap tentangan (`hotspotLevel`: Rendah, Sederhana, Tinggi) dan sokongan tempatan (`localSupport`). Hantar jentera: −12 tenaga, −RM 1,200, kehadiran +20, maks 2 kali sehari.
- Pertempuran jentera setiap hari: sokongan zon berubah (kehadiran − paras asal zon) × 0.05; zon Sederhana/Tinggi diserang lawan (sokongan zon −0.1 × tahap) kecuali kehadiran 60% ke atas (serangan ditangkis). Kesan berwajaran zon masuk ke sokongan pengundi keseluruhan, jadi War Room mengubah keputusan.
- Keletihan kempen (burnout): +20 jika jentera dihantar ketika tenaga tidak cukup, +6 sehari jika tenaga bawah 20, −4 sehari jika tenaga 50 ke atas, −15 dengan Rehat. Keberkesanan kempen = 1 − keletihan × 0.5.

## v12.7 (2026-10-29)

- **Kaji Selidik Pilihan Raya** (js/polling.js, baharu): panel dalam kad kempen PRU/PRN. Menunjukkan unjuran undi (`projectedVoteShare`), status kerusi (`seatStatus`: Selamat, Marginal/Sengit, Ketinggalan), pengundi atas pagar (`undecidedVoters`), bar tinjauan hari ini, Swing sejak hari pertama, graf harian dan kecenderungan mengikut demografi (Bandar, Luar Bandar/Pedalaman, Belia, Atas Pagar).
- Unjuran diambil daripada formula keputusan sebenar tanpa unsur rawak; status ikut margin ralat (2 + 0.15 × atas pagar). Atas pagar bermula 22-30% ikut profil kawasan, berkurang dengan manifesto yang kena isu tempatan, jentera tinggi, setiap tindakan kempen (× pengganda kawasan) dan 0.5% sehari.
- Amaran khas (toast) apabila kerusi Marginal/Sengit, sekali sehari, supaya pemain menumpukan sumber sebelum Hari Mengundi.
- Badan tinjauan ialah rekaan (Pusat Kajian Pendapat Nusa). Semua angka ialah andaian permainan.

## v12.6 (2026-10-29)

- **Pepijat: parti rakan GPS (SUPP, PRS, PDP) dan PBB menang DUN tetapi ditanda "bukan kerajaan".** Status kerajaan negeri bagi DUN Sarawak dahulu ditentukan oleh lambungan rawak berasingan (peluang 60-90%), jadi 10-40% pemain yang menang menjadi pembangkang dan Lobi Portfolio tidak dibuka, walaupun GPS memegang 70+ daripada 82 kerusi. Kini status ikut kerusi GPS yang dipaparkan (sama seperti pembetulan v11.4 untuk UMNO). PSB kekal pembangkang.
- Simpanan lama yang tersekat dibaiki automatik semasa dashboard dibuka: status ADUN ditukar kepada kerajaan dan Lobi Portfolio DUN dibuka semula (jika belum memegang jawatan kerajaan).
- Kad keputusan pilihan raya: semua parti Sarawak kini disebut "Menteri Negeri Sarawak" (dahulu SUPP/PRS/PDP tertulis "EXCO Negeri").

## v12.5 (2026-10-28)

- **Garis sempadan DUN dalam Peta PDM / Lokaliti kini mengikut sempadan Daerah Mengundi dengan tepat** (semua negeri, UMNO dan parti Sarawak). Dahulu garis DUN dilukis daripada poligon data/dun.json yang dipermudah secara berasingan (dan bagi Sarawak teranjak kira-kira 7 unit), jadi garis "lari" daripada peta. Kini garis diterbitkan daripada tepi poligon DM sendiri (tepi yang bersempadan dengan DUN lain atau laut), serpihan kecil dibuang, dan hasil dicache bagi setiap Bahagian.

## v12.4 (2026-10-28)

- Peta Pengaruh: sempadan "Kawasan anda" kini garis kuning penuh (bukan putus-putus) dan kawasan anda / dipilih dilukis paling atas. Garis putus-putus nampak bersepah dan seolah-olah tidak selari dengan sempadan pada skala kecil (maklum balas pengguna).

## v12.3 (2026-10-28)

- Sidang Media pemain parti Sarawak: soalan berkaitan Sarawak kini muncul dalam kira-kira separuh sidang sahaja, dan maksimum satu soalan setiap sidang (sebelum ini hampir setiap sidang). Separuh lagi diberi kepada soalan portfolio, kawasan, pemilihan dan peristiwa. Pemain UMNO Semenanjung tetap tidak mendapat soalan Sarawak (diuji).

## v12.2 (2026-10-28)

- **Isu Semasa** (baharu; js/isu.js, js/isu-ui.js): 12 senario politik rekaan (harga beras, banjir, tarif elektrik, subsidi minyak, anti lompat parti, mogok doktor kontrak, pusat data, yuran universiti, video tular, had umur calon; khas Sabah/Sarawak: MA63 dan royalti minyak 20%). Muncul dengan peluang 1/3 setiap bulan (jeda 2 bulan, tiada semasa kempen) kepada pemegang jawatan / wakil rakyat. Tiga pendirian (pertahan / kritik / berkecuali) dengan kesan berbeza untuk kerajaan dan pembangkang; tidak dijawab: Reputasi -1. Pendirian diingati.
- **Sidang Media diperkaya** (js/media.js): bank soalan 9 -> 39, termasuk soalan ikut portfolio, kawasan, isu Sarawak, pemilihan parti, peristiwa anda (kalah PRU, digantung, siasatan, calon luar, kabinet, krisis terabai), integriti, dan **soalan susulan pendirian Isu Semasa**. Sekurang-kurangnya satu soalan ikut konteks pada setiap sidang.
- Dua cara menjawab baharu: **Tiada komen** (persepsi negatif +3) dan **Serang balik pembangkang** (akar umbi +6, reputasi -1, risiko aduan Tataetika kira-kira 15%).
- i18n: ayat dalam tanda petik diterjemah (soalan wartawan). Semua teks baharu ada EN. Ujian unit dan ujian pelayar baharu tools/ujian-isu.js.

### Nota
- Bank soalan 39 (mockup menyebut kira-kira 45).
- Semua senario ialah rekaan berasaskan tema politik Malaysia; tiada individu sebenar.

## v12.1 (2026-10-28)

- **Jemaah Menteri** (mockup dipersetujui; js/jemaah.js, js/jemaah-ui.js):
  - **Perdana Menteri membentuk kabinet:** kad "Bentuk Jemaah Menteri" di tab Tindakan. Pilih menteri bagi 8 portfolio utama (Kewangan, Dalam Negeri, Pertahanan, Pendidikan, Kesihatan, Luar Negeri, Ekonomi, Kerja Raya); setiap portfolio 3 calon (Parti anda / Rakan gabungan / Sabah-Sarawak) dengan Kecekapan, Kesetiaan dan tanda Pencabar. 21 portfolio lain diisi automatik.
  - **Kesan:** Penarafan Tadbir Urus awal = 40 + Kecekapan x 0.3; Tekanan Politik setiap bulan -2 / 0 / +2 ikut Kesetiaan (>= 60 / 45-59 / < 45); kuota rakan gabungan 3/8 (setiap kurang: Hubungan Gabungan -10); wakil Sabah/Sarawak 2/8 (jika kurang: Hubungan Gabungan -5); melantik pencabar dalam parti: kuasa pencabar -15%.
  - **Rombakan kabinet:** sekali setahun, 3 AP.
  - **Senarai Jemaah Menteri** (31 jawatan) untuk semua pemain dalam kerajaan persekutuan (Timbalan Menteri, Menteri, TPM, PM); jawatan anda diserlahkan. Nama ialah watak rekaan; menteri wanita bergelar Dato' (bukan Datin).
  - BM/EN; ujian unit baharu dan ujian pelayar tools/ujian-jemaah.js.

### Andaian dan had
- ⚠️ Tiada statistik "sokongan Sabah/Sarawak" dalam permainan, jadi penalti wakil Borneo dipetakan kepada Hubungan Gabungan -5.
- ⚠️ "Risiko dicabar -15%" dilaksanakan sebagai kuasa semua pencabar (js/rival.js) dikurangkan 15% sekali sahaja.
- ⚠️ Menteri digugurkan menjadi pengkritik (acara baharu) belum dibuat. Versi negeri (MB/Premier pilih EXCO) belum dibuat.

## v12.0 (2026-10-28)

- **Hero halaman utama baharu** (mockup v12 dipersetujui): desktop dua lajur, iaitu poster tajuk besar "Dari ahli biasa ke kerusi Presiden." di kiri dan kertas pilihan di kanan; mudah alih bertindan. Tali bendera kempen di atas menu. Pangkah pada petak kini dakwat ungu (dakwat kekal). Nombor pilihan 1, 2, 3 (dahulu 1, S, 2); arahan "Pangkah satu petak untuk bermula."
- **Cip parti** (logo UMNO, PBB, PRS, SUPP, PDP) pada poster: tekan untuk terus mendaftar dengan parti itu dipilih.
- Fon baharu untuk halaman utama: **Anton** (tajuk) dan **Plus Jakarta Sans** (teks), disimpan dalam assets/fonts (lesen OFL) dan dicache untuk luar talian. Skema Cerah dan Gelap disokong; BM/EN diterjemah.

### Nota
- ⚠️ "Simpanan permainan" dikekalkan (mockup menulis "Sambung permainan", tetapi menu sudah ada baris Sambung berasingan apabila ada simpanan).
- Kad "3. Menuju PAU" yang kelihatan bertindih dalam tangkapan skrin mockup ialah artifak tangkapan halaman penuh (menu ialah lapisan tetap), bukan bug sebenar.

## v11.4 (2026-10-28)

Pembetulan daripada maklum balas pemain:
- **"Kenapa saya pembangkang sedangkan parti majoriti?"** Status kerajaan pemain selepas menang dahulu ditentukan dengan lambungan rawak berasingan daripada kad Kerusi Parlimen/DUN, jadi kedua-duanya boleh bercanggah. Kini anggaran kerusi dijana sekali semasa keputusan (ikut populariti parti semasa PRU) dan status kerajaan/pembangkang mengikut kad itu. (DUN Sarawak kekal ikut peluang GPS seperti sebelum ini; Presiden UMNO kekal ikut rundingan nasional.)
- **"null" / "Tindakan tidak dikenali" apabila tekan Turun Padang (Ziarah) di Peta.** Butang peta turut dicetuskan oleh pengendali tindakan dashboard (dan memakan satu Undo). Kini hanya peta yang mengendalikannya.
- **Bertanding DUN negeri lain (cth. Balakong, Selangor) tetapi Dewan/kerusi DUN masih Melaka.** Negeri kerusi kini disimpan pada status ADUN; Dewan Undangan Negeri dan kad Kerusi DUN ikut negeri kerusi itu. (Simpanan lama: berkuat kuasa selepas pilihan raya seterusnya.)
- **Rayuan pemecatan sukar dicari:** notis sekali apabila tempoh 3 tahun tamat, menunjukkan butang "Hantar Rayuan Pemecatan" di tab Tindakan Pemain.

## v11.3 (2026-10-28)

- **Peta Pengaruh penuh untuk parti Sarawak** (sama seperti UMNO): lapisan Sokongan/Kekuatan Parti/Saiz Pemilih, Sentimen Undi, Kawasan Sayap, Kawasan Pemain, panel kawasan (Lobi, Anjur Jelajah), isu dan krisis tempatan (ikon ⚠️ dan bar). Struktur Sarawak: tab **Peta Bahagian = 82 DUN** (dipaparkan "Peta Cawangan" untuk PBB) dan **Peta PDM / Lokaliti = Daerah Mengundi** (Ranting untuk PBB), poligon DOSM sebenar. Kod kawasan N.xx. Peta ringkas lama kekal sebagai sandaran jika gagal.
- **Nama Dayak** untuk NPC parti Sarawak: format "nama anak nama bapa" (gabungan rekaan). Jawatan blok Pesaka sentiasa Dayak; blok Bumiputera Melayu/Melanau; peringkat Ranting/Cawangan dan pencabar ikut komposisi Dayak DUN pemain (PRS ~85%, PDP separa).
- **Gelaran Sarawak** untuk NPC (maklumat pengguna): Yang Dipertua = **Pehin Sri**; Timbalan / Naib Yang Dipertua Kanan = **Datuk Patinggi**; Naib Yang Dipertua, Pengerusi Tetap, Setiausaha Agung, Bendahari Agung = **Datuk Amar**; Ketua sayap dan sebahagian pemimpin Cawangan = **Datuk**. Tiada Tan Sri/Dato'/Datin untuk parti Sarawak. UMNO tidak berubah.
- i18n: teks yang sudah dijenamakan tidak ditukar dua kali apabila bahasa ditukar (pembetulan "Ranting Map").

### Andaian dan had
- ⚠️ Pemegang gelaran wanita guna gelaran sama (Datuk/Datuk Amar), bukan Datin. Gelaran pemain sendiri (js/gelaran.js) belum ditukar kepada gelaran Sarawak.
- ⚠️ SUPP masih guna nama Melayu (patut nama Cina); belum dibuat.
- ⚠️ Tab Peta Negeri dan Peta DUN disembunyikan untuk parti Sarawak (Bahagian = DUN).

## v11.2 (2026-10-28)

Pembetulan daripada ujian pemain PBB:
- **Krisis tempatan kini kelihatan untuk parti Sarawak.** Peta Sarawak (js/geo.js) tiada ikon krisis seperti Peta Pengaruh UMNO, jadi krisis tidak boleh diselesaikan dan "terabai" secara automatik. Bar "⚠️ Krisis tempatan" kini dipaparkan di atas peta Sarawak dengan dialog penyelesaian yang sama.
- **Tiada lagi "Lantikan Pimpinan Negeri" / Badan Perhubungan** untuk PBB, PRS, SUPP dan PDP (induk dan sayap).
- **Nama PAU untuk PBB = "Perhimpunan Agung PBB"** (singkatan PA). v11.1 tersilap guna "Konvensyen", iaitu istilah GPS.
- **Latihan Amir** (skrip UMNO) tidak lagi ditawarkan kepada parti Sarawak; latihan lama yang sedang berjalan daripada simpanan parti Sarawak ditamatkan dan simpanan asal dipulihkan. Tutorial biasa kekal.

## v11.1 (2026-10-24)

- **Kalendar PBB** (maklumat daripada pengguna: PBB tiada bulan kalendar rasmi tetap seperti UMNO, tetapi tidak terlalu rawak; proses Ranting (lokaliti) -> Cawangan (DUN) -> Pusat; kitaran tetap 3 tahun): **Ranting bulan 3, Cawangan (DUN) bulan 5, Konvensyen PBB bulan 8**; bulan 1-2 akar umbi (bonus), bulan 4 dan 6-7 "Antara Musim", bulan 9-12 pasca-Konvensyen. Kitaran pemilihan 3 tahun sedia ada dikekalkan. UMNO tidak berubah (ujian baharu).
- **Label PBB** (js/parti.js): PAU -> **Konvensyen PBB**; "Cawangan" -> **Ranting**; "Bahagian" -> **Cawangan** (DUN); bulan dalam teks tetap (4-6 -> 3, 7 -> 5, 1-3 -> 1-2). Teks EN turut ditukar (Branch -> Ranting, Division -> Cawangan, General Assembly -> Convention). Pengawal dalam DOM supaya penukaran tidak berulang. Jawatan kekal seperti sedia ada (permintaan pengguna).
- Carian terjemahan EN untuk teks PBB mencuba beberapa bentuk asal (PAU / Perhimpunan Agung UMNO / (PAU)); `PT.dariAlt` dalam parti.js.

### Andaian dan had
- ⚠️ Bulan 3, 5 dan 8 ialah pilihan simulasi (bukan tarikh rasmi PBB). Bulan Konvensyen belum digerakkan ikut ID pemain.
- ⚠️ Kunci dalaman kekal (cawangan = Ranting, bahagian = Cawangan/DUN, pau = Konvensyen) supaya simpanan lama tidak rosak.
- ⚠️ Jadual bulan dalam teks tutorial (lajur nombor bulan 4-6, 7) dan perlembagaan UMNO tidak ditukar; hanya frasa "bulan X" dalam ayat. Pemilihan pada peringkat Ranting masih guna kaedah/jawatan sedia ada.
- Parti Sarawak lain (PRS, SUPP, PDP) kekal kalendar dan istilah umum.

## v11.0 (2026-10-24)

- **PSB dibuang sebagai parti pilihan** (dibubarkan; ahli menyertai PDP). Simpanan lama PSB dipindah automatik ke PDP dengan notis sekali sahaja; bekas PSB tidak disekat kuota kerusi GPS.
- **Pencabar sebenar menggantikan PSB** (label sahaja, kesukaran tidak berubah): kawasan Cina >=40% = DAP/PKR; Dayak >=50% = PBDS Baru/PKR; Melayu >=50% = PKR/PAS; lain-lain = PKR/PBDS Baru.
- **Peristiwa baharu "Arahan Pusat"** untuk wakil rakyat Parlimen PBB tanpa jawatan Pusat: Terima / Minta tangguh / Tolak.
- Tutorial BM/EN dikemas kini; ujian ditambah.

### Andaian dan had
- ⚠️ Tarikh pembubaran PSB (~2024) tidak disahkan.
- ⚠️ "Terima" Arahan Pusat tidak memberi jawatan Ketua Cawangan dan tiada kesan -10% pencalonan semula; "Sokongan Pusat" dipetakan kepada kesetiaan.ajk.
- ⚠️ Pencabar hanya label. Kod enjin PSB dibiarkan dorman.
- Belum dibina (menunggu pengesahan): struktur Cawangan/Ranting, pemilihan trimester, sayap Belia, susunan gelaran, laluan Putrajaya/TYT, pemilihan calon oleh Jawatankuasa Pusat.

## v10.7.1 (2026-10-22)

- Butang **Perlembagaan** dalam Menu dashboard dan langkah tutorialnya dikekalkan untuk UMNO; hanya disembunyi untuk parti lain (seperti v10.6).

## v10.7 (2026-10-22)

- **Rujukan Perlembagaan/Fasal/Tataetika UMNO dijadikan umum untuk parti selain UMNO** (UMNO tidak berubah): "(Fasal 20.10b)" dibuang, "Fasal 20.13" menjadi "peraturan parti", "Tataetika Ahli UMNO 2025" menjadi "Tataetika parti", "Perlembagaan UMNO" menjadi "perlembagaan parti". Dilaksanakan di `js/translations.js` (`UMUM`) dan `js/parti.js`; setiap baris kamus EN didaftar juga dalam bentuk umum, jadi terjemahan EN kekal berfungsi (ujian bahasa baharu).
- **Struktur Organisasi PBB mengikut gambar rujukan:** Peringkat Pusat induk = Majlis Tertinggi (Yang Dipertua/Presiden, Pengerusi Tetap, Timbalan dan Naib Yang Dipertua, Setiausaha Agung dan penolong, Bendahari Agung, Ketua Penerangan, Penasihat Undang-Undang, Ahli MT terpilih dan dilantik, wakil Wanita/Pemuda); Pergerakan Wanita dan Pemuda Pusat dengan jawatan masing-masing. Nama pemimpin kekal watak simulasi (bukan individu sebenar). Parti Sarawak lain kekal struktur umum.

### Andaian dan had
- Bilangan Ahli MT Dilantik (Pesaka) 3, Ahli MT Wanita Dipilih (Pesaka) 5 dan Ahli JK Pemuda 11 dianggar kerana gambar terpotong.
- Senarai jawatan dalam tab Pemilihan (Ahli MT, Naib Presiden, Timbalan Presiden, Presiden) tidak diubah; hanya paparan Struktur Organisasi mengikut gambar.

## v10.6 (2026-10-22)

Pembetulan dashboard berdasarkan ujian pemain PBB.

### Berubah
- **Peta "Failed to fetch":** apabila permainan dibuka terus dari folder (file://), `js/fetch-lokal.js` memuatkan data daripada `data/js/*.js` (dijana oleh `tools/bina-data-lokal.js`). Peta, data Sarawak dan data lain kini berfungsi tanpa pelayan. Jalankan semula skrip itu selepas mengubah fail dalam `data/`.
- **Laluan Karier Sebenar** dibuang daripada permainan (semua parti, termasuk UMNO), bersama rujukannya dalam tutorial.
- **Parti selain UMNO tiada Puteri:** kategori ahli perempuan bawah 36 tahun kini Wanita (`data.js`, `hayat.js`); jawatan "Ketua Puteri Cawangan" tidak lagi muncul; acara rawak "Konvensyen Puteri" hanya untuk UMNO, parti lain mendapat "Konvensyen Wanita"; kad Mesyuarat & Usul dan Struktur Organisasi tanpa Puteri.
- **Tiada rujukan Perlembagaan UMNO untuk parti lain:** syarat "Fasal 9.5" (calon MT mesti pernah memegang jawatan MT atau AJK Bahagian satu penggal) digugurkan; sebab keahlian dan baris tempoh keahlian tanpa "Fasal 15.5"; butang Perlembagaan dan langkah tutorial Perlembagaan disembunyi.
- **Struktur Organisasi** parti Sarawak tanpa Badan Perhubungan negeri (parti regional).
- Ujian: unit (demografi, Fasal, acara), `ujian-pbb.js` (semakan dashboard), ujian bahasa.

### Andaian dan had
- Rujukan Fasal 20 (disiplin/Tataetika) pada mesej disiplin masih dipaparkan untuk semua parti kerana ia mekanik disiplin permainan; boleh dibuang jika dikehendaki.
- Struktur jawatan Pusat (Ahli MT, Naib Presiden, Timbalan Presiden, Presiden) tidak diubah.

## v10.5.1 (2026-10-22)

- **Pembetulan "Failed to fetch" pada Cawangan anda (parti Sarawak):** apabila `fetch` data gagal (cth. `index.html` dibuka terus dari folder, atau fail `data/` belum dipasang di pelayan), data PBB/PRS/SUPP/PDP/PSB kini dimuat daripada `js/data-sarawak.js` (data terbenam, dijana oleh `tools/bina-data-sarawak.js`). Jalankan semula skrip itu selepas menukar mana-mana `data/*-sarawak.csv` atau `data/pbb-dun.json`.
- Nota: data UMNO (Google Sheets) masih perlukan internet/pelayan.

## v10.5 (2026-10-22)

Halaman indeks neutral (tidak lagi berjenama UMNO) dan borang pendaftaran ikut parti.

### Berubah
- Pengepala, kertas menu dan hero guna logo Nusa Politik (`assets/images/logo-nusa.svg`, atribut `data-netral` supaya tidak ditukar logo parti). Tulisan kuning "UMNO" dan chip "PAU di WTC KL" dibuang.
- Kad Lagu Rasmi dibuang dari indeks; di papan pemuka lagu hanya untuk pemain UMNO.
- Pilihan parti (senarai juntai: UMNO, PBB, PRS, SUPP, PDP, PSB) dipindah ke "Maklumat anda". Sayap dalaman (Bumiputera/Pesaka) hanya untuk PBB, terus di bawahnya.
- Label "Menjadi ahli {parti} sejak" ikut parti; nota Fasal 15.5 hanya untuk UMNO.
- Parti bukan-UMNO: tiada Puteri (watak dan laluan sayap); set avatar umum baharu (kemeja/blazer/blaus, tanpa songkok) dalam `js/avatar.js`.
- Nota senarai cawangan: "bukan data cawangan rasmi mana-mana parti politik".
- Pembetulan: hasil muat data lambat tidak lagi menimpa data apabila parti ditukar pantas.
- Ujian: `tools/ujian-indeks.js` (baharu), unit avatar, terjemahan EN.

## v10.4 (2026-10-22)

Kejutan kempen khusus parti untuk parti Sarawak mod ringan.

### Baharu
- **8 kejutan kempen baharu** (2 setiap parti, `KEJUTAN_PARTI` dalam `js/pru.js`): PRS (jalan pedalaman terputus, jemputan perayaan rumah panjang), SUPP (banjir kilat bandar, rungutan peniaga kecil), PDP (isu sensitif antara komuniti, dialog tiga komuniti), PSB (ceramah dihalang, dakwaan bantuan tidak sampai). Setiap kejutan ada 3 pilihan (kos dana, peluang rawak, kesan sokongan) seperti kejutan biasa; kejutan kawasan sensitif (bandar / luar bandar) mendapat penalti 1.3 kali seperti biasa.
- **Penjadualan:** setiap slot kejutan dalam kempen 14 hari mempunyai peluang 40% (`KEJUTAN_PARTI_PELUANG`) untuk mengambil kejutan parti pemain; selebihnya kejutan umum. UMNO dan PBB tidak terjejas.
- Terjemahan EN penuh dan tutorial BM/EN. Ujian: unit (struktur, pemilihan, semua 24 pilihan boleh dijawab) dan ujian bahasa (semua teks kejutan diterjemah).

### Andaian dan had
- Peristiwa ialah rekaan permainan, bukan kejadian sebenar; peluang 40% dan semua angka kesan ialah andaian. Kejutan tidak mengubah meter ciri teras (Sokongan Bandar, Imbangan Kaum, Naratif); hanya sokongan kempen.

## v10.3.1 (2026-10-22)

PSB: baris "Rakan Gabungan" dibuang. Sebagai pembangkang tanpa rakan gabungan, PSB tidak lagi melalui fasa rundingan kerusi (`perluRunding` = false), jadi tiada pertandingan 3-penjuru dan tiada baris "Rakan Gabungan" dalam pecahan undi atau keputusan (`js/pru.js`). Ujian PSB menyemak ketiga-tiganya.

## v10.3 (2026-10-22)

PSB (mod ringan, pembangkang) dengan ciri teras Naratif Pembangkang.

### Baharu
- **PSB:** boleh dipilih di skrin pendaftaran sebagai parti **pembangkang** di luar GPS. Struktur, PRN/PRU dan sayap sama seperti parti mod ringan lain. Tiada kuota kerusi, Pengaruh GPS, Lobi Majlis GPS atau rundingan GPS.
- **Kawasan operasi PSB:** 53 DUN dengan Melayu/Melanau kurang 40% (593 cawangan, `data/psb-sarawak.csv`).
- **Tidak membentuk kerajaan:** walaupun menang kerusi, PSB tidak pernah membentuk kerajaan negeri atau persekutuan, jadi tiada Premier, Menteri atau lobi portfolio. Dewan Undangan Negeri Sarawak dipaparkan dengan GPS memerintah dan pemain di luar kerajaan.
- **Lawan PSB:** parti GPS (SUPP, PRS, PDP; label simulasi mengikut komposisi DUN).
- **Naratif Pembangkang** (40 hingga 100, mula 40, susut 1 sebulan hingga 40): Kempen Naratif (2 AP, RM 800) +7. Kesan kekuatan kerusi DUN: (Naratif - 40) / 8 mata; marginal atau sukar 1.5 kali.
- Logo PSB daripada pengguna (`assets/images/logo-psb.png`), tutorial BM/EN, terjemahan EN. Ujian: unit PSB (termasuk menang DUN tanpa kerajaan/lobi), `PARTI=PSB node tools/ujian-prs.js`, `PARTI=PSB tools/simulasi.js`.

### Andaian dan had
- Kawasan operasi (Melayu/Melanau kurang 40%) dan angka Naratif ialah andaian permainan, bukan senarai kerusi PSB sebenar.
- Kerusi Parlimen PSB memaparkan label "Parti Sarawak Bersatu" untuk gabungan sendiri (di luar Kerajaan Perpaduan).

### Belum
- Parti kebangsaan di Sarawak (DAP, PKR, PAS) ditangguhkan; ciri teras tambahan dan acara kempen khusus parti.

## v10.2 (2026-10-22)

PDP (mod ringan) dengan ciri teras Imbangan Kaum Kawasan.

### Baharu
- **PDP:** boleh dipilih di skrin pendaftaran. Struktur, PRN/PRU, Pengaruh GPS, Lobi Majlis GPS dan rundingan kuota sama seperti PRS dan SUPP. Kuota asas 5 daripada 82 (jadual PRN 2021 daripada pengguna).
- **Kawasan operasi PDP:** 15 DUN campuran (kumpulan terbesar antara Melayu/Melanau, Cina dan Dayak kurang 55%; 136 cawangan, `data/pdp-sarawak.csv`); `rkPDP` = kedudukan (1 = paling campuran).
- **Imbangan Kaum Kawasan:** sokongan Melayu/Melanau, Dayak dan Cina (20 hingga 100, mula 50, menghampiri 50 sebanyak 1 sebulan). "Janji kepada" satu kumpulan (2 AP, RM 800): kumpulan itu +10, dua lagi -4. Kekuatan kerusi DUN: (purata sokongan diwajarkan saiz kumpulan dalam DUN - 50) / 8 mata; marginal atau sukar 1.5 kali. Meter Imbangan = 100 - (sokongan tertinggi - terendah).
- Logo PDP daripada pengguna (`assets/images/logo-pdp.jpg`), tutorial BM/EN, terjemahan EN. Ujian: unit PDP, `PARTI=PDP node tools/ujian-prs.js`, `PARTI=PDP tools/simulasi.js`.

### Andaian dan had
- Kawasan operasi (kurang 55%) dan semua angka Imbangan Kaum ialah andaian permainan. Kumpulan Orang Ulu digabungkan dalam Dayak; India dan lain-lain tidak dikira.

### Belum
- PSB / pembangkang (v10.3).

## v10.1 (2026-10-22)

SUPP (mod ringan) dengan ciri teras Sokongan Bandar.

### Baharu
- **SUPP:** boleh dipilih di skrin pendaftaran. Struktur, PRN/PRU, Pengaruh GPS, Lobi Majlis GPS dan rundingan kuota sama seperti PRS (v10.0). Kuota asas 18 daripada 82 (jadual PRN 2021 daripada pengguna).
- **Kawasan operasi SUPP:** 20 DUN dengan peratus Cina 25% ke atas (192 cawangan, `data/supp-sarawak.csv`); `rkSUPP` dalam `data/pbb-dun.json`. Kedudukan kuota digeneralisasi (`rk<PARTI>`).
- **Sokongan Bandar** (30 hingga 100, mula 50, susut 1 sebulan): butang Program Bandar (2 AP, RM 1,000) menaikkan 6. Kesan kekuatan kerusi DUN: (Sokongan - 50) / 8 mata; kerusi marginal atau sukar 1.5 kali lebih sensitif. Dipaparkan pada kad Pengaruh dalam GPS.
- Logo SUPP daripada pengguna (`assets/images/logo-supp.svg`), tutorial BM/EN, terjemahan EN. Ujian: unit SUPP, `PARTI=SUPP node tools/ujian-prs.js`, `PARTI=SUPP tools/simulasi.js`.

### Andaian dan had
- Kawasan operasi (Cina 25%+) dan semua angka Sokongan Bandar ialah andaian permainan, bukan senarai kerusi SUPP sebenar.
- Isu bandar dalam acara kempen (dalam mockup) belum dibuat; kepekaan kerusi marginal dikenakan melalui Sokongan Bandar sahaja.

### Belum
- PDP (v10.2), PSB / pembangkang (v10.3).

## v10.0 (2026-10-22)

Mod ringan untuk parti Sarawak lain: PRS dahulu (PBB kekal mod penuh).

### Baharu
- **PRS (mod ringan):** boleh dipilih di skrin pendaftaran (Sarawak, dalam GPS). Struktur Bahagian = DUN dan Cawangan = Daerah Mengundi, sayap Pemuda dan Wanita, PRN (kerusi DUN) dan PRU (kerusi Parlimen) menggunakan enjin Sarawak yang sama dengan PBB. Tiada Premier, imbangan blok atau Majlis Tertinggi penuh.
- **Kawasan operasi PRS:** 34 DUN dengan peratus Dayak (Iban, Bidayuh, Orang Ulu) 60% ke atas (`data/prs-sarawak.csv`, 437 cawangan). Setiap DUN diberi `rkPRS` (kedudukan, 1 = paling Dayak) dalam `data/pbb-dun.json`.
- **Kuota kerusi GPS:** jadual PRN 2021 daripada pengguna (PBB 48, SUPP 18, PRS 11, PDP 5; jumlah 82). Kuota asas PRS = 11. Hanya DUN dalam kuota (kedudukan 1 hingga kuota) boleh dicalonkan dalam PRN.
- **Pengaruh GPS (0 hingga 100, mula 40):** Lobi Majlis GPS (3 AP, RM 1,500) menaikkan 8.
- **Rundingan kuota** (12 bulan sebelum PRN, sekali setiap kitaran, 3 AP): terima (kuota asas), tuntut lebih (+3 dengan peluang 25% + Pengaruh/200, had 25% hingga 85%; berjaya hubungan -5, gagal kuota -1 dan hubungan -10), beralah (-2, hubungan +10, Pengaruh +5).
- Kad **🤝 Pengaruh dalam GPS** (tab Profil), tutorial BM/EN, terjemahan EN dan penjenamaan (teks yang menyebut PBB dijenamakan semula PRS untuk parti mod ringan; logo `assets/images/logo-prs.jpg`).
- Pelaksanaan: pemeriksaan `parti === 'PBB'` yang bersifat umum Sarawak digantikan `SW(parti)` (PBB atau PRS); logik khusus PBB (blok, rundingan Presiden, Premier) kekal PBB sahaja. `tools/build-pbb.js` turut menjana data PRS. Ujian baharu: `tools/ujian.js` (PRS), `tools/ujian-bahasa.js`, `tools/ujian-prs.js` (pelayar), `PARTI=PRS tools/simulasi.js`.

### Andaian dan had
- Kawasan operasi (Dayak 60%+) dan semua nombor rundingan/pengaruh ialah andaian permainan, bukan senarai kerusi PRS sebenar. Jadual kuota 2021 diambil daripada jadual yang diberi pengguna.
- Logo PRS (logo-prs.jpg) daripada pengguna.
- PRS tiada Premier; portfolio Menteri Negeri guna kolam portfolio Sarawak yang sama dengan PBB.

### Belum
- SUPP (v10.1), PDP (v10.2), PSB / pembangkang (v10.3); meter ciri teras khusus parti selain Pengaruh GPS.

## v9.6 (2026-10-22)

Penamaan badan parti PBB.

### Baharu
- **Majlis Tertinggi (MT) dan Perhimpunan Agung PBB (PA):** untuk pemain PBB, "Majlis Kerja Tertinggi (MKT)" dipaparkan sebagai "Majlis Tertinggi (MT)" dan "PAU" sebagai "PA" ("Perhimpunan Agung UMNO (PAU)" menjadi "Perhimpunan Agung PBB (PA)"), dalam semua paparan BM dan EN (jawatan, pemilihan, mesyuarat, perwakilan, tutorial). Nama "Majlis Tertinggi (MT)" dan "Perhimpunan Agung PBB" ialah nama badan yang disebut dalam laporan akhbar Sarawak tentang PBB; singkatan "PA" ialah label permainan. UMNO tidak berubah.
- Pelaksanaan: lapisan penjenamaan `js/parti.js` (istilah ke / songsang) ditambah kepada penukaran UMNO ke PBB; `js/i18n.js` menterjemah semula teks yang telah dijenamakan dan mencuba teks asal jika songsangan istilah tiada dalam kamus (cth "Majlis Tertinggi" asli dalam mesej pencalonan). Tiada perubahan kepada data permainan.
- Ujian bahasa baharu: semua baris kamus yang menyebut MKT / PAU diterjemah sama dalam mod PBB. Ujian PBB menyemak tiada "MKT" / "PAU" dalam tab Tindakan, Profil, Pemilihan dan Mesyuarat.

### Andaian dan had
- Struktur jawatan Pusat (Presiden, Timbalan Presiden, 3 Naib Presiden, ahli MT) kekal mengikut model umum permainan; bukan susunan rasmi PBB. "Konvensyen PBB" (perhimpunan tiga tahun) belum dinamakan berasingan.

### Belum
- Parti lain (PRS, SUPP, DAP dan lain-lain).

## v9.5 (2026-10-22)

Pindah Cawangan PBB, label gabungan dan pembetulan terjemahan peristiwa disiplin.

### Baharu
- **Pindah Cawangan PBB:** kad 🏠 Pindah Cawangan (tab Profil) kini dibuka untuk PBB. Pilih Bahagian (DUN) dan Cawangan (Daerah Mengundi) di Sarawak sahaja (PBB tiada cawangan di luar Sarawak; UMNO tetap tidak boleh ke Sarawak). Syarat dan kos sama (12 bulan ahli, bukan Menteri / ADUN / MP, tiada hukuman disiplin, tiada pilihan raya, sekali setiap 3 tahun; RM 2,000, 3 AP, IP -30%). `dunInfo` dikemas kini ikut DUN baharu, maka tahap kerusi, lawan dan Parlimen dikira semula. Blok Bumiputera / Pesaka kekal.
- **Label gabungan:** untuk PBB, "BN" digantikan "GPS" (DUN: kad kerusi, legenda, tab DUN) dan "Kerajaan Perpaduan" (persekutuan: kad kerusi, Dewan Rakyat). Kad kerusi DUN PBB kini guna 82 kerusi Sarawak yang sama dengan sidang DUN. UMNO tidak berubah. Nama gabungan persekutuan ialah label simulasi.
- Jika PBB tidak membentuk kerajaan negeri, GPS dipaparkan di bawah ambang (pembangkang) dalam Dewan.

### Pembetulan
- **Teks BM bocor dalam EN selepas peristiwa disiplin rawak:** sejarah etika ("bulan/tahun: hukuman: perkara"), banner keahlian digantung ("⛔ Keahlian anda DIGANTUNG" dan tempoh), mesej gantung / dilarang / pecat / amaran, dan perkara "Menganjurkan jamuan sambil berkempen" kini diterjemah. Ujian bahasa baharu menyemak semua `perkara` etika dalam setiap templat mesej disiplin dan sejarah.

### Belum
- Parti lain, penamaan MKT/PAU.

## v9.4 (2026-10-22)

Kerusi Parlimen dan PRU untuk PBB.

### Baharu
- **PRU berasingan daripada PRN:** pemain PBB bertanding kerusi DUN dalam PRN dan kerusi Parlimen dalam PRU. Jadual (andaian): PRN 2027, PRU 2028, PRN 2032, PRU 2033, dan seterusnya (setiap satu kitaran 5 tahun; bulan PRU ikut ID pemain). Kelayakan: kerusi DUN hanya semasa PRN, kerusi Parlimen hanya semasa PRU (juga perlu Ketua Bahagian ke atas dan IP).
- **Kerusi Parlimen:** Parlimen yang mengandungi DUN pemain (31 Parlimen Sarawak). Kad **🏛️ Kerusi Parlimen Anda** di tab Profil. Komposisi etnik wajaran pemilih (`pl` dalam `data/pbb-dun.json`, dijana semula oleh `tools/build-pbb.js`); kekuatan kerusi sama peraturan DUN (Sukar/Marginal/Sederhana/Selamat). Simpanan lama tanpa `pl` guna etnik DUN sebagai anggaran.
- **Status kerusi kekal:** semasa PRU, status ADUN kekal; semasa PRN, status MP kekal. Jawatan Premier/Menteri negeri tidak tamat apabila Parlimen dibubarkan, dan jawatan persekutuan tidak tamat apabila DUN dibubarkan.
- Banner jadual menunjukkan "PRN Sarawak" atau "PRU". Terjemahan EN, tutorial dan ujian unit dikemas kini.

### Pembetulan
- **Presiden PBB dan PRN:** sebelum ini keputusan nasional (peringkat persekutuan) dijana untuk Presiden PBB selepas PRN, menutup lobi kerajaan negeri dan menghalang tuntutan Premier. PBB (parti regional) kini tidak mendapat keputusan nasional; lobi kerajaan negeri dibuka mengikut peluang kerajaan GPS.

### Andaian dan had
- Jawatan kerajaan hanya satu pada satu masa (Premier atau Menteri persekutuan, bukan kedua-duanya); label "BN" dalam Dewan Rakyat belum ditukar untuk PBB.
- Kerajaan persekutuan selepas PRU ikut peluang umum (25% hingga 80%), tiada rundingan kerajaan nasional untuk PBB.

### Belum
- Pindah Cawangan PBB, parti lain, penamaan MKT/PAU, label gabungan persekutuan dalam Dewan Rakyat.

## v9.3 (2026-10-22)

Rundingan kerusi GPS dan istilah Menteri Sarawak.

### Baharu
- **Istilah Menteri:** untuk pemain PBB, "EXCO Negeri" dipaparkan sebagai "Menteri Negeri" dan "EXCO Kanan" sebagai "Menteri Kanan" (lobi, kad Pentadbiran, tab DUN, mesej). Nota ringkas menerangkan bahawa di Sarawak anggota kabinet negeri dipanggil Menteri; elaun dan peraturan sama dengan EXCO Negeri. UMNO tidak berubah.
- **🤝 Rundingan Kerusi GPS** (tab Profil, Presiden PBB): dalam masa 12 bulan sebelum PRN, pilih Seimbang (44 kerusi, hubungan gabungan 0), Tegas (50 kerusi, hubungan -10) atau Beralah (38 kerusi, hubungan +10). Kos 3 AP, sekali setiap PRN. Bilangan kerusi PBB menentukan bahagian PBB dalam GPS (kerusi / 82) dan peluang menuntut Premier. Tanpa rundingan, bahagian kekal 50% hingga 60% (v9.1).
- Angka ialah andaian permainan, bukan pembahagian kerusi sebenar. Terjemahan EN, tutorial dan ujian unit dikemas kini.

### Belum
- Kerusi Parlimen, Pindah Cawangan PBB, parti lain, penamaan MKT/PAU.

## v9.2 (2026-10-22)

Portfolio menteri Sarawak untuk PBB.

### Baharu
- **8 portfolio Sarawak** menggantikan senarai EXCO umum apabila pemain PBB melobi selepas menang kerusi DUN: Kesihatan Awam/Perumahan/Kerajaan Tempatan, Pembangunan Sosial/Perbandaran, Pendidikan/Inovasi/Bakat, Pengangkutan, Utiliti/Telekomunikasi, Pelancongan/Industri Kreatif, Sumber Asli/Pembangunan Bandar, Kewangan.
- IP, kos dan peluang mengikut tahap EXCO Negeri sedia ada (andaian; nama kementerian ialah label simulasi). Tahap jawatan kekal "EXCO Negeri" dalaman. UMNO kekal 5 portfolio EXCO umum.
- Terjemahan EN, tutorial dan ujian unit dikemas kini.

### Belum
- Rundingan kerusi GPS, kerusi Parlimen, Pindah Cawangan PBB, parti lain, penamaan MKT/PAU, label tahap "Menteri Sarawak" dalam UI.

## v9.1 (2026-10-22)

Kerajaan negeri Sarawak: Premier dan Exco untuk PBB.

### Baharu
- **Peluang kerajaan negeri:** selepas menang kerusi DUN, peluang kerajaan negeri dibentuk 60% hingga 90% (GPS dominan; andaian). UMNO tidak berubah.
- **Premier:** Presiden PBB yang menjadi ADUN boleh menuntut Premier (2 AP). Kerusi GPS dianggar 70 hingga 78 daripada 82 (benih tetap), PBB memegang 50% hingga 60% kerusi GPS, ambang 42. Peluang dilaraskan: blok dalam giliran +5%, bukan giliran -5%, sokongan antara blok melebihi 30 menambah 0.2% setiap mata. Gagal: hubungan gabungan -10 dan ditawarkan EXCO Kanan.
- **Exco negeri:** pemain PBB lain boleh melobi portfolio Exco seperti biasa (senarai portfolio masih umum, belum nama sebenar Sarawak).
- **Tab DUN:** memaparkan Dewan Undangan Negeri Sarawak (82 kerusi, label GPS dan Premier). Pembangkang ialah anggaran: PH separuh, selebihnya Lain.
- Terjemahan EN, tutorial dan ujian unit (termasuk ujian hujung ke hujung tuntut Premier) dikemas kini.

### Belum
- Kerusi Parlimen, rundingan kerusi GPS, Pindah Cawangan PBB, parti lain, nama portfolio Sarawak, penamaan MKT/PAU.

## v9.0 (2026-10-22)

Modul politik Sarawak bermula siri v9.x. Imbangan Bumiputera dan Pesaka dalam PBB.

### Baharu
- **Blok dalaman PBB:** pemain PBB memilih blok Bumiputera (Melayu/Melanau) atau Pesaka (Dayak) semasa pendaftaran. Cadangan lalai mengikut majoriti etnik DUN.
- **Giliran Presiden:** bergilir setiap 5 tahun (andaian; Bumiputera 2026 hingga 2030, Pesaka 2031 hingga 2035). Pemilihan Presiden dan Timbalan Presiden Pusat/PAU dikenakan penalti jika bukan blok giliran.
- **Sokongan antara blok** (permulaan 30, susut 1 sebulan, lantai 30): mengurangkan penalti dan memberi bonus kecil. Tindakan **Dekati blok** (3 AP, RM 1,500, sekali sebulan) menambah 12.
- Kad **⚖️ Imbangan Bumiputera & Pesaka** di tab Profil. Ujian unit, simulasi, terjemahan EN dan tutorial dikemas kini.
- Semua angka ialah andaian permainan, bukan data rasmi.

### Belum
- Exco negeri / Premier, kerusi Parlimen, rundingan kerusi GPS, Pindah Cawangan PBB, parti lain, penamaan MKT/PAU.

## v8.33 (2026-10-22)

PRN Sarawak dan kerusi DUN untuk PBB.

### Baharu
- **Jadual PRN:** PRN Sarawak pertama pada tahun 2027 (bulan tetap mengikut pemain), kemudian setiap 5 tahun (`js/sarawak.js`, `js/pru.js`).
- **Kekuatan kerusi ikut etnik:** `data/pbb-dun.json` (82 DUN: pemilih dan peratus etnik) disimpan dalam profil (`dunInfo`). Kerusi majoriti Cina 50% ke atas: Sukar (-12), 30 hingga 50%: Marginal (-5), Bumiputera 85% ke atas: Selamat (+5).
- **Parti lawan ikut kawasan** (label simulasi): Cina 40% ke atas = DAP, PSB; Dayak 50% ke atas = PSB, PKR; Melayu/Melanau 50% ke atas = PKR, PAS; lain-lain = PKR, PSB.
- Kad **🗳️ Kerusi DUN Anda** di tab Profil (PBB). Tutorial, terjemahan EN, ujian unit dan ujian PBB dikemas kini.

### Andaian (sila semak)
- Semua nombor ialah penyeimbang simulasi, bukan ramalan atau data keputusan sebenar.
- Belum: imbangan sayap Bumiputera/Pesaka, jawatan Exco negeri/Premier, kerusi Parlimen PBB, rundingan kerusi GPS, Pindah Cawangan PBB, parti lain.

## v8.32 (2026-10-22)

Fasa 1 modul Sarawak: parti PBB boleh dimainkan.

### Baharu
- **Data Sarawak:** `data/dm-13.json` (887 Daerah Mengundi, 2,037,648 pemilih, dengan jantina, umur dan etnik setiap DM) dibina daripada fail `lukis-sarawak` oleh `tools/build-geo.js` (mod `DM_SAHAJA=13`). `tools/build-pbb.js` menjana `data/pbb-sarawak.csv`.
- **Pilihan parti** di skrin pendaftaran: UMNO (lalai, simpanan lama kekal UMNO) atau PBB.
- **PBB:** Bahagian = DUN (82), Cawangan = Daerah Mengundi (887), sayap Pemuda dan Wanita sahaja (perempuan 18 hingga 35 tahun masuk Wanita). Bilangan ahli ialah anggaran permainan (12% pemilih, 50 hingga 500).
- **Penjenamaan** (`js/parti.js`): logo PBB (`assets/images/logo-pbb.png`, daripada pengguna) dan perkataan UMNO ditukar kepada PBB dalam paparan BM dan EN.
- Tab Peta PBB memaparkan peta DUN dan Daerah Mengundi Sarawak.
- Tutorial topik "Parti PBB (Sarawak)", terjemahan EN (`js/translations-parti.js`), ujian unit dan `PARTI=PBB node tools/simulasi.js`.

### Belum (fasa seterusnya)
- Imbangan sayap Bumiputera/Pesaka, PRN Sarawak penuh, DUN Sarawak dan kerusi Parlimen PBB (PBB bertanding kerusi DUN sahaja buat masa ini), Pindah Cawangan PBB, parti lain (PRS, SUPP, DAP dan lain-lain).
- Istilah MKT dan PAU kekal (belum ditukar kepada Majlis Tertinggi dan Perhimpunan Agung).

## v8.31 (2026-10-22)

Tab Tindakan dikumpulkan (kira-kira 5,200px menjadi kira-kira 2,000px pada telefon).

### Berubah
- Tindakan Pemegang Jawatan, Misi dan Tindakan Khas Sayap sentiasa dibuka.
- Tiga kumpulan boleh dilipat: **🏛️ Kawasan & Rakyat** (dibuka automatik jika ada keluhan, lencana bilangan keluhan), **💼 Jawatan & Aset Luar** (Komuniti, GLC, Sampingan, Anugerah) dan **📡 Media & Integriti**.
- Keadaan lipat diingat dalam pelayar sahaja. Tutorial BM/EN dan terjemahan dikemas kini.

## v8.30 (2026-10-22)

Susun semula tab supaya tidak terlalu panjang (audit kosmetik).

### Berubah
- **Header dipadatkan:** bar sumber 3 lajur, Status Tahun disembunyikan, butang Bersara/Reset jadi ikon di telefon, petunjuk warna takwim boleh dilipat.
- **Tab 👤 Profil baharu:** Pencapaian dan Harta digabung ke sini bersama Jawatan, Tataetika, Pindah Cawangan, Gaya dan Laluan. Tab Pencapaian dan Harta dibuang (pautan lama dialih ke Profil).
- **Pemilihan:** hanya peringkat aktif/didaftar dibuka; yang lain dilipat.
- **Mesyuarat:** hanya mesyuarat boleh mula/sedang berlangsung dipapar; selebihnya dalam "Jadual tahunan" (dilipat).
- Bahagian boleh dilipat; keadaan diingat dalam pelayar sahaja (setiap pemain). Tutorial BM/EN, terjemahan dan ujian pelayar dikemas kini.

## v8.29 (2026-10-22)

Nama jawatan komuniti, pilihan sukan dan sektor GLC (maklum balas pemain).

### Berubah
- **Nama jawatan:** Yang Dipertua PIBG, Pengerusi Masjid, Pengerusi Persatuan Belia, Pengerusi Majlis Belia Negeri. Jenis "Persatuan Belia" menjadi "Belia & Mahasiswa".
- **Baharu:** Pengerusi Persatuan Mahasiswa (Cawangan, umur 18 hingga 30, kos rendah) dan **Ketua Whip PBT** (perlu memegang Ahli Majlis PBT, menggantikannya, IP 160, RM 3,000, ganjaran lebih tinggi, Konflik 2).
- **Pilihan sukan:** Persatuan Sukan Negeri/Kebangsaan ada 5 sukan (Bola Sepak, Badminton, Sepak Takraw, Hoki, Rugbi) dengan kos Dana, ganjaran dan risiko berbeza. Boleh pegang sukan berlainan serentak (had 3 jawatan kekal). ID lama dipetakan ke Badminton.
- **Sektor GLC:** 6 sektor (Pembiayaan/Kewangan, Pendidikan, Teknologi, Sumber Manusia, Pertanian/Ladang, Pengangkutan) menggantikan 3 syarikat lama; pelarasan gaji, IP, reputasi, akar umbi, Konflik dan Audit. Jawatan GLC lama dipetakan (Pelaburan jadi Kewangan, Pelabuhan jadi Pengangkutan, Agensi Negeri jadi Pertanian) dan ganjaran lama dihormati.
- Tutorial BM/EN, terjemahan, 3 ujian unit baharu dan ujian pelayar EN dikemas kini.

### Andaian
- Semua angka ialah penyeimbang simulasi, belum diuji dengan data main pemain. Had umur Mahasiswa (30) ialah andaian.

## v8.28 (2026-10-22)

Pindah Cawangan (maklum balas pemain: mahu menukar kawasan, cth Kuala Selangor ke Setiawangsa).

### Baharu
- **Kad 🏠 Pindah Cawangan** (tab Pemilihan, bawah Tataetika): pilih negeri, Parlimen, DUN dan cawangan seperti pendaftaran, kemudian semak jadual sebelum dan selepas (cawangan, bahagian, tahap kerusi anggaran, jawatan, sokongan, IP, Dana, AP) sebelum mengesahkan.
- **Syarat:** ahli 12 bulan di cawangan semasa; bukan Menteri/EXCO; tiada kerusi ADUN/MP; tiada hukuman disiplin; tiada pilihan raya berjalan; sekali setiap 36 bulan; bukan ke Sarawak.
- **Kos:** RM 2,000, 3 AP, IP -30%. Jawatan Cawangan dan Bahagian (termasuk sayap) hilang, jawatan Pusat kekal. Sokongan akar umbi/AJK/ketua cawangan mula 25, perwakilan 0.
- **Tempoh menunggu 12 bulan** sebelum boleh bertanding jawatan parti Cawangan/Bahagian di kawasan baharu (PRU/PRN tidak terjejas). Tempoh keahlian parti tidak mula semula.
- Isu tempatan, pencabar, aduan kawasan dan organisasi NPC dijana semula (benih = id cawangan baharu).
- `MyPolitikSave.identitiKawasan()` dikongsi dengan pendaftaran; `MyPolitikPRU.tahapKerusi` didedahkan. Tutorial BM/EN (panduan + Soalan Lazim), 3 ujian unit dan ujian pelayar EN.

### Andaian
- Semua angka ialah penyeimbang simulasi; tahap kerusi ialah anggaran deterministik. Sokongan ketua cawangan turut dimula 25 (tidak dinyatakan secara jelas).

## v8.27 (2026-10-22)

Lebih Mata Tindakan (AP) (maklum balas pemain: 5 AP sebulan dan had 15 terasa sedikit).

### Berubah
- **AP sebulan ikut kesukaran:** Mudah 7, Biasa 6 (dahulu 5), Hardcore 5 (kekal).
- **Bonus pemegang kerusi:** ADUN, MP dan EXCO Negeri +1; Menteri, Timbalan Menteri, Menteri Besar, TPM dan PM +2. Pratonton Bulan Seterusnya memaparkan "AP sebulan: asas + bonus".
- **Had simpanan:** 20 (dahulu 15); Hardcore kekal 15.
- Tutorial BM/EN (tur, panduan, Soalan Lazim), Latihan Amir dan halaman utama dikemas kini; jadual "Diset semula kepada 5" yang lapuk dibetulkan. Dua ujian unit baharu.

### Andaian
- Angka ialah penyeimbang simulasi, belum diuji dengan data main pemain. Jika pertumbuhan IP terlalu laju, boleh diturunkan (cadangan seterusnya: pilihan konservatif tanpa kenaikan asas Biasa).
- AP semasa pemain tidak berubah; had baharu terpakai serta-merta.

## v8.26 (2026-10-21)

Pembetulan tutorial berdasarkan tangkapan skrin pemain.

### Dibetulkan
- **Latihan Bersama Amir (langkah 2):** tulis AP "tidak dibawa ke bulan depan", bercanggah dengan langkah 5 dan peraturan sebenar (baki dibawa sehingga had 15). Langkah 5 juga ditukar daripada "Elaun masuk" kepada "Pendapatan masuk" (tiada elaun parti sejak v8.12).
- **Tur Badan Perhubungan Negeri:** kad tur terlalu panjang (kira-kira 2,000 aksara). Kini ringkas (4 ayat); butiran penuh dipindah ke topik panduan baharu **Badan Perhubungan Negeri** (dipecah kepada tajuk dan perenggan pendek), BM dan EN.

## v8.25 (2026-10-21)

Kemas kini tutorial (BM dan EN) selepas v8.17 hingga v8.24.

### Dibetulkan (tidak lagi tepat)
- Topik Mekanik Bulanan: Dana kini ikut pendapatan kerjaya, elaun, sewa dan ganjaran (bukan "RM 150 asas + peringkat"); susutan Akar Umbi -2 (pemegang jawatan -1 tambahan).
- Langkah Undo: turut meliputi naik taraf aset, keluhan dan aktiviti rakyat.

- Glos berganda dalam tutorial EN: "Ziarah Kasih (Compassion Visit) (Compassion Visit)" (glos sedia ada dikenakan dua kali) kini hanya sekali.

### Ditambah
- Topik panduan baharu **Aset, Peruntukan & Jawatan Luar Parti** (sewa dan naik taraf, Peruntukan Kawasan, GLC, Jawatan Komuniti).
- Peta: butang WP (Kuala Lumpur / Putrajaya / Labuan); Kerjaya & Pendapatan: sumber sewa, GLC, komuniti; Gelaran: peraturan gelaran NPC (Dato', Tan Sri, Datin, Datin Paduka, Puan Sri); senarai tab Tindakan; 3 Soalan Lazim baharu.

## v8.24 (2026-10-21)

Nama dan gelaran NPC konsisten dengan sistem gelaran pemain (maklum balas pemain: calon negeri semua Dato', tetapi Presiden tiada gelaran).

### Berubah
- **Satu peraturan gelaran NPC** (`awalanNPC` dalam `gelaran.js`) dipakai oleh calon negeri, pesaing Bahagian, organisasi (Induk dan sayap) dan calon blok.
- **Tahap:** Cawangan dan AJK tiada gelaran; Bahagian kira-kira 40% Dato'; Ketua/Naib Ketua sayap Pusat Dato'; Presiden, Timbalan Presiden dan Naib Presiden Tan Sri; tokoh negeri (Bekas Exco, Tokoh Parti) Dato'.
- **Perempuan:** gelaran sendiri (Dato' / Tan Sri) atau gelaran isteri penerima: 35% Datin / Datin Paduka (60:40) bagi tahap Dato', Puan Sri bagi tahap Tan Sri.
- Perempuan Bahagian kini boleh bergelar (dahulu tiada gelaran langsung).

### Andaian
- Peratus (40%, 35%, 40%) ialah penyeimbang simulasi. Gelaran ialah rekaan permainan.
- Nama NPC yang sudah disimpan dalam simpanan lama (Pengerusi dan AJK negeri) kekal; senarai calon dijana semula daripada benih jadi berubah. Simpanan baharu terus guna peraturan baharu.

## v8.23 (2026-10-21)

Lobi Jawatan Komuniti (maklum balas pemain), diasingkan daripada GLC.

### Ditambah
- **Kad "🧭 Jawatan Komuniti"** (tab Tindakan, dua kad seperti GLC): pilih jenis, kemudian jawatan. Jenis: Masjid & PIBG, Persatuan Sukan, Majlis PBT, Persatuan Belia, Agensi Berpendapatan Tinggi.
- **Syarat:** peringkat jawatan parti (Cawangan/Bahagian/Pusat), umur (AJK Masjid 30+, PIBG 25+, Belia 18 hingga 40), parti dalam kerajaan (PBT), pernah menang kerusi dan IP 400+ (Agensi).
- **Kos dan ganjaran:** kos IP + Dana; gagal = separuh kos hilang dan tunggu 6 bulan. Ganjaran bulanan (akar umbi, reputasi, IP, Dana). Maksimum 3 jawatan, tempoh 3 tahun, pembaharuan 6 bulan terakhir (separuh kos), boleh letak jawatan.
- **Risiko:** Agensi (Konflik +3, Audit +3 sebulan) dan Sukan Kebangsaan boleh menyebabkan pemecatan SPRM dan denda. Belia tamat selepas umur 40.
- **Bergaji tinggi** (Sukan Kebangsaan, PBT, Agensi) tidak boleh bersama Menteri/EXCO atau GLC (GLC turut menyekat lobi jika jawatan komuniti bergaji tinggi dipegang).
- Tutorial BM/EN, terjemahan, 4 ujian unit, blok ujian pelayar EN.

### Andaian
- Had 3 jawatan tidak dikongsi dengan GLC. Angka ialah penyeimbang simulasi; nama ialah rekaan generik.
- "Pernah menang kerusi" dikira daripada sejarah PRU/PRN atau kerusi semasa; "parti dalam kerajaan" dikira daripada status kerusi pemain.

## v8.22 (2026-10-21)

Aset: sewa hartanah dan laluan naik taraf (maklum balas pemain).

### Berubah
- **Sewa:** hartanah memberi sewa 0.9% daripada harga sebulan, masuk Dana peribadi (Rumah teres RM360, Wisma Pejabat RM1,080). Sewa dikira dalam kekayaan bersih (kena cukai kurungan) dan dipaparkan dalam pratonton pendapatan bersama baris penyelenggaraan. Media dan kenderaan tidak berubah.
- **Naik taraf:** Rumah teres (RM40,000) > Rumah banglo (RM100,000, sewa RM900, +4 IP) > Kompleks perniagaan (RM250,000, sewa RM2,250, +8 IP). Banglo dan kompleks hanya melalui naik taraf; bayar beza harga dan aset lama diganti (tiada jualan 80%). Boleh dibatalkan (Undo).
- Wisma Pejabat kekal berasingan (di luar rantai naik taraf).

### Andaian
- Angka ialah penyeimbang simulasi. Tiada tempoh kosong rawak.
- Pendapatan sewa bersih tidak menerima bonus dana sayap (diperlakukan sebagai pindahan, sama seperti penyelenggaraan).

## v8.21 (2026-10-21)

Peta Wilayah Persekutuan dan akar umbi lebih kuat (maklum balas pemain: kawasan WP terlalu kecil untuk ditekan; undi akar umbi sering tidak membantu).

### Berubah
- **Peta WP:** butang besar "WP (semua) / Kuala Lumpur / Putrajaya / Labuan" pada bar Peta Negeri dan Peta Bahagian. Memilih satu wilayah menapis dan zum ke Bahagian wilayah itu. Susun atur 14 petak dan kod `wp` tidak berubah.
- **Akar umbi, susut bulanan:** -3 kepada -2; tambahan bagi pemegang jawatan -2 kepada -1 (jumlah pemegang jawatan -5 kepada -3).
- **Pemilihan Cawangan:** berat akar umbi 0.25 kepada 0.30 (IP 0.30 kepada 0.25).
- **Pemilihan Bahagian:** berat akar umbi 0 kepada 0.10 (perwakilan 0.35 kepada 0.25).
- **PRU:** setiap mata akar umbi di atas 50 menambah 0.25 asas peluang (dahulu 0.12); jentera kempen 55 + 35% akar umbi (dahulu 60 + 25%).
- Jadual "Apa yang mempengaruhi undi" dalam tutorial dikemas kini. 2 ujian unit baharu, ujian pelayar EN.

### Andaian
- Semua angka ialah cadangan imbangan. Kesan dua hala: akar umbi rendah kini lebih berbahaya.
- Panel WP tidak mengubah logik permainan; hanya paparan peta.

## v8.20 (2026-10-20)

Keluhan Rakyat dan Aktiviti Rakyat (maklum balas pemain: lebih banyak aktiviti untuk rakyat dan keluhan rakyat dibawa sebagai usul), mengikut mockup yang diluluskan.

### Baharu
- **📮 Keluhan Rakyat** (ADUN dan Ahli Parlimen): 1 hingga 2 keluhan sebulan, maksimum 4 tertunggak, 6 jenis isu. Tiga pilihan:
  - **Selesaikan** dengan Peruntukan Kawasan (RM 500 hingga RM 1,500, 1 AP): +20 IP, +3 sokongan akar umbi.
  - **Bawa sebagai usul** (1 AP): dicatat di papan Isu Tempatan dan menjadi agenda Usul Lokaliti di mesyuarat; usul yang lulus menyelesaikan isu (sistem sedia ada).
  - **Abaikan**: sokongan akar umbi -2.
  - Tidak dijawab 3 bulan: diabaikan automatik (akar umbi -4, Reputasi -1 setiap keluhan).
- **🎪 Aktiviti Rakyat** (sekali sebulan, 2 AP, guna Peruntukan Kawasan): gotong-royong (RM 400), program kesihatan (RM 700), kenduri (RM 600), tuisyen (RM 500), dialog bersama rakyat (RM 300; kurangkan keluhan baharu bulan depan sebanyak 1).

### Berubah
- 3 projek tetap v8.18 (jalan, banjir, surau) digantikan dengan sistem keluhan dan aktiviti.
- Tutorial BM/EN, terjemahan, 3 ujian unit (menggantikan 2), ujian pelayar EN. Semua tindakan boleh di-undo.

### Andaian
- Semua angka ialah cadangan imbangan. Keluhan hanya untuk pemegang kerusi (ADUN/MP); Menteri tanpa kerusi tidak mendapat keluhan.
- Abaikan keluhan membuangnya serta-merta dengan penalti kecil (-2); penalti berat hanya jika luput 3 bulan.
- Tuisyen memberi akar umbi +4 (bukan "sokongan belia" seperti mockup, kerana tiada dalam sistem). Kenduri memberi kesetiaan Penentang +2 seperti mockup.
- Papan Isu Tempatan bergantung pada mesyuarat Usul Lokaliti sedia ada; pemain tanpa jawatan parti mungkin tidak menghadirinya.

## v8.19 (2026-10-20)

Jawatan GLC (undian survey pemain, pilihan 2), mengikut mockup yang diluluskan dengan ganjaran diturunkan selepas v8.18.

### Baharu
- **Dua kad:** kad pertama memilih syarikat, kad kedua memaparkan tiga jawatan syarikat itu (butang Kembali). Baki percubaan dikongsi merentas syarikat; kesan setiap peringkat sama bagi semua syarikat (paparan sahaja).
- **Lobi jawatan GLC:** dibuka selepas pilihan raya jika parti membentuk kerajaan (semua jawatan), atau tawaran lebih rendah (Ahli Lembaga / Pengarah) jika kalah. 9 jawatan rekaan: Pengerusi, Ahli Lembaga, Pengarah bagi tiga syarikat.
- **Kos dan ganjaran:** Pengerusi IP 220 + RM 15,000 (RM 2,500 + 4 IP sebulan); Ahli Lembaga IP 120 + RM 8,000 (RM 1,500 + 3 IP); Pengarah IP 80 + RM 5,000 (RM 1,000 + 2 IP). Gagal: separuh kos hilang, 2 percubaan.
- **Tempoh 36 bulan,** boleh diperbaharui dalam 6 bulan terakhir (separuh kos Dana).
- **Risiko:** Konflik Kepentingan +2 dan Audit SPRM +1 sebulan. Risiko Audit tinggi atau Integriti Parti rendah boleh menyebabkan pemecatan (denda RM 5,000, Integriti -10, Reputasi -5).
- Boleh bersama jawatan parti dan kerusi ADUN/MP; tamat jika dilantik Menteri atau EXCO.
- Tutorial BM/EN, terjemahan, 4 ujian unit, ujian pelayar EN.

### Andaian
- Semua angka ialah cadangan imbangan; ganjaran diturunkan daripada mockup (Pengerusi 3,500 kepada 2,500).
- Nama syarikat rekaan. Lobi dibuka selepas pilihan raya sahaja; menang sebagai pembangkang tiada lobi GLC.
- Tidak termasuk: GLC dalam pengisytiharan harta tahunan, pendapatan GLC dalam pratonton pendapatan.

## v8.18 (2026-10-20)

Peruntukan Kawasan (maklum balas survey pemain: wakil rakyat dan menteri perlukan lebih peruntukan), mengikut mockup B yang diluluskan.

### Baharu
- **Peruntukan Kawasan:** dana khas bulanan: ADUN RM 1,500, Ahli Parlimen RM 3,000, Menteri/Timbalan Menteri/TPM/PM tambahan RM 5,000 untuk projek kementerian. Kerusi pembangkang menerima 40%.
- **Projek kawasan** (kad di tab Tindakan, 1 AP): jalan kampung (RM 800), bantuan banjir (RM 500), surau (RM 1,000). Memberi IP dan sokongan akar umbi.
- Dana ini berasingan daripada Dana peribadi: tidak boleh digunakan untuk kempen atau aset. Baki hangus setiap Januari.

### Berubah
- Elaun ADUN RM 1,000 kepada RM 1,500; Ahli Parlimen RM 1,800 kepada RM 2,500.
- Tutorial BM/EN (langkah baharu dan angka elaun), terjemahan, 3 ujian unit, ujian pelayar EN. Projek kawasan boleh di-undo.

### Andaian
- Semua angka ialah cadangan imbangan, bukan peruntukan sebenar.
- Kesan projek ialah IP dan sokongan akar umbi (bukan populariti kawasan PRU).
- Elaun EXCO/MB tiada dana kawasan. Aktiviti rakyat lanjut dan usul/keluhan rakyat ialah kerja berasingan.

## v8.17 (2026-10-20)

Bertanding kerusi Parlimen/DUN lain (calon dari luar), mengikut mockup yang diluluskan.

### Baharu
- **Kerusi Lain:** pilihan di fasa Calon untuk memohon kerusi di mana-mana Parlimen atau DUN (negeri lain dibenarkan, Sarawak dikecualikan).
- **Kos calon luar:** peluang diluluskan -15 (negeri sama) / -30 (negeri lain); sokongan awal -10 (tiada jika pernah menang kerusi itu); minimum peruntukan kempen +20%.
- **Tahap kerusi:** Selamat / Marginal / Sukar. Kerusi sukar memberi bonus IP lebih tinggi jika menang.
- Calon dari luar tidak boleh ditukar ganti; MB hanya untuk DUN di negeri sendiri.
- Tutorial BM/EN, terjemahan, 4 ujian unit, ujian pelayar EN.

### Andaian
- Tahap kerusi ialah anggaran simulasi (hash tetap), bukan data pilihan raya sebenar.
- Semua angka ialah cadangan imbangan.
- Penolakan menandakan jenis kerusi itu ditolak untuk penggal.
- Di luar skop: kerusi ditinggalkan diberi kepada NPC, isu "calon dari luar", MB negeri lain, kerusi serentak KEDUA (kerusi sendiri sahaja).

## v8.16 (2026-10-20)

Lobi portfolio kerajaan yang lebih mesra pemain (maklum balas: tetingkap lobi tidak muncul selepas "terpaksa lupakan").

### Berubah
- **Tangguh:** pilihan "Tidak melobi" diganti "Tangguh". Lobi kekal terbuka sehingga pilihan raya akan datang dan boleh dibuka semula dari kad di tab Pemilihan.
- **Lobi lapuk:** jika pilihan raya baharu tidak membuka kerajaan (kalah atau parti pembangkang), lobi yang ditangguh ditutup supaya tidak terbawa ke penggal lain. Presiden (aliran rundingan nasional) tidak terjejas.
- **Penerangan:** tab Pemilihan kini menerangkan sebab tiada lobi: "parti anda tidak membentuk kerajaan pada pilihan raya terakhir" atau "peluang lobi penggal ini telah digunakan".
- **Amaran Dana:** tetingkap lobi menyatakan kekurangan Dana untuk portfolio termurah yang IP anda layak dan mencadangkan Tangguh.
- Tutorial BM/EN, terjemahan, 2 ujian unit, ujian pelayar EN.

### Andaian
- Peluang parti membentuk kerajaan tidak diubah (rawak, 25% hingga 80% ikut populariti parti).
- Lobi yang ditangguh hanya luput apabila keputusan pilihan raya seterusnya tidak membuka kerajaan; jika membuka, lobi baharu (3 percubaan) menggantikannya.

## v8.15 (2026-10-20)

Butang Undo dan penambahbaikan tema gelap/cerah.

### Baharu
- **Undo (`js/undo.js`):** butang ↩️ di sebelah Bulan Seterusnya membatalkan SATU tindakan terakhir (aktiviti, tindakan sayap/negeri, misi sayap, dekati Presiden, beli/jual aset) dan memulangkan IP, Dana, AP. Percuma, 3 kali setahun dalam permainan, dimatikan dalam mod Hardcore. Pengesahan memaparkan apa yang dipulangkan.
- **Dikunci** apabila keadaan berubah selepas tindakan (Bulan Seterusnya, acara, PRU, audit/pengisytiharan SPRM, tindakan lain) dan untuk tindakan yang menghasilkan keputusan rawak (aduan disiplin, isu rawak, acara selepas aktiviti).
- **Butang 🌙/☀️** di header untuk tukar gelap/cerah satu ketukan (Auto kekal dalam menu 🎨).
- **Kontras:** kad status berjalur warna kiri, bar lebih tinggi bersempadan dengan corak serong dan nilai % di dalam bar (jika bar ada `aria-valuenow`), lencana jawatan segi empat bersempadan.

### Andaian
- Gambar undo ialah salinan mentah storan watak, acara dan pencapaian; halaman dimuat semula selepas undo.
- Bar yang tiada `aria-valuenow` (contohnya Pengaruh ke jawatan seterusnya) tidak menunjukkan % di dalam bar; nilai tetap ada pada label.
- Tindakan peta (`data-v`) dan kempen/PRU tidak boleh di-undo.

## v8.14 (2026-10-20)

Pembetulan berdasarkan maklum balas pemain: pendapatan bulanan dan simpanan.

### Berubah
- **Pratonton Bulan Seterusnya** kini memasukkan elaun jawatan kerajaan (kabinet.js) dalam jumlah pendapatan bulanan, dengan nota "kerjaya dihentikan kerana jawatan kerajaan sepenuh masa" dan IP elaun. Sebelum ini Menteri + jawatan Pusat dipaparkan -RM 600 walaupun elaun menteri dibayar berasingan. Pengiraan dana sebenar tidak berubah (`KJ.elaunKabinet` hanya untuk paparan, tidak dikira dua kali).
- **Kos operasi jawatan parti dilaras:** Cawangan RM 100 (kekal), Bahagian RM 250 jadi RM 150, Pusat RM 600 jadi RM 300.
- **Sandaran simpanan:** amaran sekali setiap sesi jika dibuka dalam pelayar dalam-aplikasi (Instagram, Threads, dll.) atau tiada eksport sandaran dalam 14 hari (masa direkod apabila Salin Kod / Muat Turun digunakan); nota tambahan di Menu, Pindah Career.

### Andaian
- Angka kos operasi baharu ialah cadangan penyeimbang; pantau maklum balas pemain.
- Pengesanan pelayar dalam-aplikasi berdasarkan User-Agent (tidak 100% tepat).

## v8.13 (2026-10-19)

Sistem Harta, Cukai & Pengisytiharan Harta SPRM (modul baharu `js/harta.js`, `js/harta-ui.js`).

### Baharu

- **Tab 💰 Harta:** beli/jual aset. Hartanah (Rumah teres +2 IP, Wisma Pejabat +6 IP sebulan), Agensi Penerangan (-25% peluang krisis politik), Syarikat Media (-45%), Kenderaan mewah (Stress -2) dan Jet (Stress -5). Kos penyelenggaraan 0.5% sebulan; jual pada 80%.
- **Cukai:** kurungan atas kekayaan bersih (tunai + aset): 0% hingga RM 50k, 1% hingga RM 200k, 2% hingga RM 500k, 3% selepas itu. Dikumpul 1/12 sebulan.
- **Pengisytiharan Harta SPRM (wajib):** setiap 12 bulan atau apabila dilantik ke jawatan kerajaan. Bulan tidak boleh dimajukan sehingga dijawab. Telus: bayar cukai, Integriti Parti +15. Sembunyi Aset: cukai dielak, Risiko Audit +25 (dan risiko tadbir urus +15 bagi pemegang jawatan kerajaan); audit boleh mengenakan cukai dan denda 100%.
- Tutorial BM/EN, terjemahan, 8 ujian unit baharu, ujian pelayar Harta.

### Andaian
- Pengisytiharan terpakai kepada semua pemain (cukai 0% di bawah RM 50k); IP pasif tertakluk kepada pulangan berkurangan IP; kebarangkalian audit = risiko/2 %; faktor media tidak bertindan (yang terbaik digunakan).

## v8.12 (2026-10-19)

Rombakan Sistem Kewangan & Pendapatan: elaun parti dimansuhkan, kerjaya profesional diperkenalkan, pendapatan rasmi hanya untuk YB.

### Berubah

- **Elaun parti dihapuskan:** elaun asas RM 150 dan elaun jawatan parti (Cawangan 200, Bahagian 500, Pusat 1,200) dibuang. `CONFIG.DANA_ASAS` dan `DANA_JAWATAN` diganti `PERINGKAT_PARTI`.
- **Kerjaya (`careerBackground`, modul baharu `js/kerjaya.js`):** dipilih di skrin Permainan Baharu dan dikunci. Profesional/Korporat RM 900, Pengamal Undang-undang RM 850, Peniaga/Kontraktor RM 750 sebulan. Simpanan lama diberi Profesional/Korporat secara automatik (`normalisasi`).
- **Kos operasi jawatan parti:** Cawangan RM 100, Bahagian RM 250, Pusat RM 600 sebulan (peringkat tertinggi yang dipegang sahaja).
- **Pendapatan rasmi:** ADUN RM 1,000 dan Ahli Parlimen RM 1,800 sebulan. Elaun kabinet EXCO/Menteri (kabinet.js) kekal dan ditambah ke atasnya.
- **Pendapatan kerjaya semasa berjawatan:** MP, ADUN dan EXCO Negeri 50%; Menteri Besar, Timbalan Menteri, Menteri, TPM dan PM 0%.
- **Konflik kepentingan:** Peniaga/Kontraktor yang memegang jawatan kerajaan menambah +3 Risiko Konflik Kepentingan sebulan (susut asas 1) melalui `sampingan.js`; mesej: "Kontrak perniagaan anda dipersoalkan..." apabila tiada syarikat sampingan.
- Paparan: pratonton "Bulan Seterusnya" kini "Pendapatan bulanan" dengan senarai item bertanda +/-.
- Tutorial: langkah baharu `kerjaya`; baris "Terkumpul; pendapatan bulanan masuk".

### Andaian (sila semak)

- Semua angka ialah penyeimbang simulasi. Pendapatan bersih bulanan lebih tinggi daripada dahulu untuk Ahli Biasa (RM 900 berbanding RM 150) kerana tiada lagi elaun jawatan; kos operasi menggantikan elaun jawatan. Pantau keseimbangan.
- Pendapatan bulanan tidak didarab pengali kesukaran (hanya perbelanjaan tindakan didarab), dan dihadkan supaya dana tidak jatuh bawah 0.
- Timbalan Menteri dan Menteri Besar diperlakukan sebagai penuh masa (kerjaya 0%), bersama Menteri, TPM dan PM.
- Pilihan raya: ujian `PRU: baki dana kempen dipulangkan...` pernah gagal sekali secara rawak semasa pembangunan dan lulus berulang kali selepas itu (tidak berkaitan; belum disiasat).
- 5 ujian baharu, semakan pelayar (skrin Permainan Baharu) dan terjemahan EN.

## v8.11 (2026-10-19)

Peruntukan kempen tidak lagi ditanda lalai (maklum balas pemain: terlepas menetapkan bajet pilihan raya).

### Diperbaiki

- **Punca:** dalam skrin "Manifesto & Peruntukan Kempen" (PRU) dan "Peruntukan Kempen Kilat" (PRK), pilihan pertama (jumlah paling kecil: minimum RM 2,000 atau RM 5,000) sudah ditanda. Pemain yang memilih 3 janji lalu terus menekan "Mula Kempen" mendapat bajet minimum tanpa sedar.
- **Pembetulan:** tiada pilihan lalai (kecuali hanya satu pilihan ada); butang "Mula Kempen" tidak aktif sehingga peruntukan dipilih; satu baris ringkasan menunjukkan "Anda melabur RM X daripada Dana RM Y (baki di tangan RM Z)".
- Tutorial langkah Manifesto dikemas kini (BM dan EN).

### Andaian (sila semak)

- Saya memilih "tiada lalai" dan bukan "lalai jumlah terbesar", supaya pemain sentiasa membuat keputusan sedar dan dana tidak terkeluar tanpa sengaja.
- Butang Undo belum dibuat (menunggu arahan).
- Semakan pelayar baharu: tiada pilihan ditanda, butang mula tidak aktif sebelum dipilih, aktif selepas dipilih, ringkasan dalam EN.

## v8.10 (2026-10-19)

Paparan IP sebenar pada setiap tindakan (maklum balas pemain: "+10 IP" tetapi dapat +1).

### Diperbaiki

- **Punca:** tambahan IP diredam mengikut IP semasa (gandaan 1 - IP/300, lantai 0.10, sekurang-kurangnya +1), tetapi penerangan tindakan memaparkan nilai asas. Contoh: +10 menjadi +5 pada IP 150 dan +1 pada IP 270 ke atas.
- **Pembetulan:** `MyPolitikSave.kesanPapar` kini memaparkan IP sebenar (redaman IP + kelebihan sayap) dengan fungsi `ipSebenar` yang sama dengan yang dipakai `applyEffects`. Semua modul yang memaparkan kesan tindakan (Ahli Biasa, Pemegang Jawatan, Misi, Sayap, Peristiwa, Kabinet, Pilihan Raya) terkesan serentak. Nilai asas tersedia sebagai `ipAsas`.
- **Tutorial:** langkah baharu `ip-sebenar` menerangkan redaman IP.

### Andaian (sila semak)

- Angka tidak termasuk bonus Musim Akar Umbi (bulan 1 hingga 3) yang dikenakan oleh tindakan jawatan semasa dijalankan, jadi pada bulan itu IP sebenar boleh lebih tinggi sedikit daripada angka dipaparkan. Ini dinyatakan dalam tutorial.
- Hanya nilai IP positif dilaraskan; kehilangan IP dipaparkan seperti biasa.
- 1 ujian baharu menyemak paparan sama dengan IP yang diterima pada IP 0, 60, 150, 240, 270 dan 400.

## v8.9 (2026-10-19)

Meter Sokongan Atas Pagar kini boleh dinaikkan dan mempengaruhi risiko dicabar.

### Baharu

- **Tindakan:** ☕ Kopi O dengan Golongan Atas Pagar (-1 AP, -MYR 300, +8) dan 🎤 Dengar Aduan Terbuka (-1 AP, Stress +2, Atas Pagar +6, Akar Umbi +2).
- **Krisis di peta:** Turun Padang +4, Bantu +3, dibiarkan 3 bulan -3 (Abaikan tidak mengubah meter).
- **Zon pada sidebar:** Memusuhi (di bawah 20), Goyah, Condong sokong (50 ke atas).
- **Kesan:** apabila Sokongan Akar Umbi di bawah 40%, Atas Pagar rendah menambah 10 mata peratus pada peluang dicabar, Atas Pagar tinggi menolak 10 (had 5% hingga 85%).
- **Reput:** 2 mata sebulan ke arah 30 (`MyPolitikIncumbent.prosesBulan`, dipanggil oleh `calendar.js`).

### Andaian (sila semak)

- Terbit Kenyataan Media kekal -10 (tidak dipecah kepada bersih/berbaur politik seperti dicadangkan awal; boleh ditambah kemudian).
- Tindakan Kopi O dan Aduan Terbuka tertakluk kepada bonus Musim Akar Umbi (bulan 1 hingga 3) seperti tindakan jawatan lain, jadi kesannya lebih besar di bulan itu.
- 4 ujian baharu (zon, tindakan, reput, krisis), semakan pelayar EN dan langkah tutorial `atas-pagar`.

## v8.8 (2026-10-19)

Peta interaktif: panel kawasan yang lebih kaya, tiga lapisan peta dan krisis tempatan.

### Baharu

- **Panel kawasan:** klik kawasan untuk demografi (penduduk, Bumiputera, kesukaran), isu tempatan belum selesai, sokongan parti, krisis tempatan, serta butang **Turun Padang (Ziarah)** (nama baharu bagi Jelajah) dan **Salur Peruntukan Projek**.
- **Lapisan peta:** 🗳️ Sentimen Undi (kubu/swing, diterbitkan daripada Kekuatan Parti), 🧩 Kawasan Sayap, ⭐ Kawasan Pemain.
- **Krisis tempatan (`js/krisis-peta.js`):** ikon ⚠️ berkedip di peta, ditekan untuk Turun Padang, Bantu atau Abaikan. Bar "Krisis tempatan" di atas peta ialah laluan alternatif (papan kekunci/pembaca skrin).

### Andaian (sila semak)

- Kebarangkalian krisis baharu 22% sebulan, maksimum 2 aktif, hanya jika anda memegang jawatan. Dibiarkan 3 bulan = diabaikan sendiri (-4 Sokongan Akar Umbi, -6 sokongan kawasan). **Bulan Seterusnya tidak disekat.**
- Turun Padang: -2 AP, Stress -2, +6 Akar Umbi, +6 sokongan kawasan, +1 IP. Bantu: RM 800 (ikut kesukaran), +10 Akar Umbi, +10 sokongan kawasan, +2 IP. Abai: -4 / -4.
- Lapisan Sentimen mengikut nilai asas kawasan (tidak berubah dengan usaha anda). Lapisan Sayap hanya meliputi sayap anda sendiri.
- Salur Peruntukan Projek guna semula CDF Kabinet (hanya jawatan kerajaan, kawasan sendiri); tambahan sokongan cawangan anda = min(8, ceil(IP/2)), minimum 2.
- Keadaan krisis disimpan dalam `krisisPeta` (bukan `peta`) kerana `peta` hanya menyalin bonus dan kiraan.
- 4 ujian logik krisis baharu, semakan pelayar (ikon, klik, selesai, EN) dan langkah tutorial `peta-krisis`.

## v8.7 (2026-10-19)

Kesan bunyi (SoundManager). Bahagian tema visual menunggu kelulusan mockup.

### Baharu

- **`js/sfx.js` (SoundManager):** bunyi dijana oleh Web Audio, tiada fail audio. Ketukan tukul Pengerusi (keputusan mesyuarat, usul, undi Dewan/DUN), sorakan perwakilan (menang pemilihan jawatan atau PRU) dan denyar kamera (setiap soalan sidang media). Dicetus automatik daripada log simpanan profil; sidang media memanggil terus.
- **Kawalan:** butang 🔔/🔕 dan kelantangan dalam bar muzik sedia ada (kelihatan apabila bar dibuka dengan ⋯).
- Andaian: tetapan SFX ({ on, vol }) disimpan di peranti (`myPolitik_sfx`), sama seperti muzik latar, bukan dalam simpanan watak (`settings`), supaya kekal apabila menukar watak.
- 3 ujian SFX baharu (AudioContext tiruan) dan semakan pelayar.

## v8.6 (2026-10-19)

Modul baharu: Sistem Pencapaian & Trofi, serta dua langkah tutorial baharu.

### Baharu

- **Tab 🏆 Pencapaian** (`js/pencapaian.js`, `js/pencapaian-ui.js`): 5 trofi, bar kemajuan, lencana "Baharu" dan toast "Pencapaian Dibuka: ...!". Dibuka secara automatik apabila profil disimpan. Mod Latihan Amir tidak melayakkan trofi.
- **Tutorial:** langkah "Meter Stress" dan "Matlamat Politikus" (Cawangan → Bahagian → Calon PRU → MP/ADUN/EXCO → Menteri), BM dan EN. Tutorial interaktif dan butang Skip sedia ada dikekalkan.

### Andaian syarat trofi (sila semak)

- **Akar Umbi Teguh:** menang pemilihan Ketua Cawangan tanpa pernah kalah mana-mana pemilihan jawatan sebelum itu. Kekalahan pemilihan perwakilan tidak dikira.
- **Ikon Sayap:** memegang jawatan Ketua sayap Bahagian terkumpul 72 bulan (2 penggal x 3 tahun).
- **Wira PRU (Giant Killer):** menang kerusi PRU di kawasan berprofil Bandar atau Campuran.
- **Bapa Reformasi:** pemegang kerusi wakil rakyat dengan Integriti Parti melebihi 90 pada setiap semakan bulanan selama 60 bulan berturut-turut dalam mandat yang sama. Skor 90 atau kurang menetapkan semula pembilang.
- **Negarawan Utama:** jawatan kerajaan Menteri Penuh, Timbalan Perdana Menteri atau Perdana Menteri.
- Trofi disimpan berasingan (`myPolitik_pencapaian`), kekal merentas watak dan tidak dipadam oleh Reset Permainan. Pembilang kemajuan dikunci mengikut id watak.

### Ujian

- 7 ujian pencapaian baharu dalam `tools/ujian.js`; ujian pelayar mencetus trofi, memeriksa toast dan panel dalam EN; dua kebocoran BM lama ditutup (teks pemuat peta, baris Dato').

## v8.5 (2026-10-19)

- Modal acara krisis: tajuk "KRISIS:", label "Krisis Politik · …" dan tajuk keputusan kini diterjemah dalam mod EN.

## v8.4 (2026-10-19)

Sambungan pembetulan teks BM yang bocor dalam mod EN, kali ini hasil imbasan simulasi (bot bermain kerjaya penuh).

### Pembetulan

- Mesej keputusan undian usul, isu tempatan, penutupan mesyuarat, pencalonan serentak, undi tidak percaya, hukuman Lembaga Disiplin dan kesan misi bulanan.
- Enjin terjemahan: rentetan berbilang ayat kini diterjemah ayat demi ayat, dan ayat yang berakhir titik boleh dipadankan tanpa titik.
- Ujian automatik: contoh emas baharu untuk keluarga mesej di atas.

## v8.3 (2026-10-19)

Pembetulan teks BM yang bocor dalam mod EN (laporan pemain melalui tangkapan skrin).

### Pembetulan

- **Tab Peta:** butang mod dan metrik, legenda, tooltip, panel butiran (Tahap, Ahli UMNO, Jumlah Perwakilan, Pemilih), "Lihat Bahagian di ...", bilangan cawangan dan mesej kos tindakan ("Wang tidak mencukupi (perlu MYR ...)").
- **Persidangan Tahunan dan Pemilihan:** butang (Mulakan, Bawa Usul, Bahas, Anggar Peluang, Tarik Balik), chip status (Sedia, Berdaftar, Pertahan), ringkasan mesyuarat (status usul, keputusan pemilihan), tajuk pemilihan sayap, mesej keputusan, isu tempatan dan usul sayap.
- **Modal Teruskan ke Bulan Seterusnya:** "Fasa takwim" dan "AP (terkumpul, had)".

### Ujian

- `tools/ujian-pelayar.js` kini membuka tab Peta (setiap mod, hover, klik, butang tindakan) dan mengesan nod teks yang sama dengan literal BM dalam kod sumber tetapi tiada terjemahan. Klik tab kini menggunakan klik DOM supaya tidak dihalang modal.
- `tools/ujian-bahasa.js` menambah 15 contoh emas daripada laporan ini.

## v8.2 (2026-10-19)

Dwibahasa Fasa 8 dan ujian automatik dwibahasa.

### Ciri baharu

- **Latihan Amir dan PRU/PRK/Kabinet/Dewan/DUN dalam EN.** Semua 14 langkah latihan dan aliran pilihan raya diterjemah.
- **Ujian automatik dwibahasa.** `node tools/ujian-bahasa.js` (tanpa pelayar) menyemak kamus dan teks data permainan; `node tools/ujian-pelayar.js` (Playwright, pilihan) memainkan beberapa bulan dan latihan Amir dalam EN serta melaporkan teks BM yang bocor.

### Pembetulan

- 14 pilihan acara yang tertinggal tanpa EN, mesej bulan baharu (AP/elaun), amaran pencabar dan syarat hadir PAU kini diterjemah.

## v8.1 (2026-10-19)

Fokus pada dwibahasa (BM/EN), perpindahan simpanan dan imbangan ekonomi sampingan. Format simpanan tidak berubah.

### Ciri baharu

- **Dwibahasa Fasa 3-7.** Terjemahan EN untuk Perlembagaan Parti dan kad Peranan Sayap, Rumusan Kerjaya, dialog bersara, notifikasi dan log, Bantuan, peta, tab sayap, takwim, acara (tajuk, pilihan A/B/C, kos dan risiko), disiplin, lantikan negeri, PRK, integriti dan media. Istilah UMNO (PAU, MKT, Bahagian/Cawangan, Pemuda/Wanita/Puteri) dikekalkan.
- **Pindah career antara peranti.** Eksport simpanan sebagai kod `NUSA1.` atau fail JSON, kemudian import di peranti lain tanpa akaun. Watak yang diganti disandarkan dahulu.
- **Ganti watak dalam permainan.** Pengesahan ganti slot kini modal dalam permainan (dwibahasa), bukan dialog pelayar.

### Imbangan

- **Aktiviti Sampingan.** Hasil syarikat diturunkan kepada 3.5% sebulan dan bonus akar umbi NGO kini mengikut saiz modal (had 1-2).

### Teknikal

- Service worker (`nusa-v8.1`) kini memasang 16 fail JS yang sebelum ini tertinggal (terjemahan, `i18n.js`, `tutorial-en.js`, integriti, media, sampingan, gelaran) supaya lawatan pertama luar talian lengkap.
- 49 baris terjemahan berganda dibuang daripada fail kamus lama; versi terkini dalam `translations-baharu.js` dikekalkan.

## v8.0 (2026-10-19)

Kemas kini besar yang memfokuskan ketepatan peraturan, kestabilan dan ujian automatik. Tiada perubahan pada format simpanan: simpanan lama dimuat seperti biasa.

### Pembetulan pepijat

- **Kos ikut tahap kesukaran.** Perbelanjaan didarab pengali kesukaran (Mudah ×0.8, Hardcore ×1.2), tetapi butang menyemak dan memaparkan kos asas. Akibatnya, butang kelihatan aktif tetapi gagal dengan ralat dana dalam mod Hardcore. Kini semua semakan dan paparan kos menggunakan kos sebenar melalui `MyPolitikSave.kosSebenar()` dan `cukupDana()`. Ini meliputi tindakan ahli dan pemegang jawatan, kempen pemilihan, misi dan tindakan sayap, acara rawak, kabinet, Badan Perhubungan Negeri, Dewan Rakyat, DUN, peta dan janji manifesto.
- **Kempen PRU/PRK dalam mod Hardcore.** Memperuntukkan semua dana, atau bertanding di bawah minimum, sentiasa gagal kerana peruntukan didarab 1.2. Peruntukan kini dianggap pindahan dana (`applyEffects(..., { pindahan: true })`).
- **Baki kempen mendapat bonus dana sayap.** Laluan Utama menerima +10% pada baki kempen PRU/PRK yang dipulangkan, iaitu wang percuma. Baki kini dipulangkan tepat.
- **Cabaran jawatan tidak pernah selesai.** Sebaik cabaran muncul, sepanduk kekal selama-lamanya dan cabaran baharu tidak boleh berlaku. Cabaran kini tamat dalam empat keadaan:
  - menang mempertahankan jawatan (ditangkis);
  - kalah (diterima);
  - jawatan itu luput atau dilepaskan;
  - Sokongan Akar Umbi pulih ke 55%, jadi pencabar berundur.

  Pencabar juga menguatkan calon lawan dalam pemilihan pertahanan (+5, atau +8 jika kritikal), dan pertandingan itu ditanda **Dicabar**.
- **Pendaftaran pada peringkat yang sama.** Selepas mendaftar satu jawatan, jawatan lain pada peringkat dan kumpulan yang sama masih kelihatan terbuka, tetapi gagal apabila ditekan. Kini butang dikunci dengan sebab "Tarik balik pencalonan itu dahulu".
- **Mesyuarat semasa digantung.** Mesyuarat tertera "Sedia" tetapi gagal dimulakan. Kini statusnya "Tidak Layak" dengan sebab penggantungan.
- **Pemecatan dan jawatan kerajaan.** Ahli yang dipecat kekal sebagai Menteri atau Perdana Menteri. Jawatan kerajaan kini dilucutkan.
- **Lobi Presiden.** Pilihan yang tidak mampu dibayar (AP atau dana) kini dinyahaktifkan dengan sebabnya.
- **Acara kabinet berisiko.** Dana disemak sebelum hasil rawak ditentukan, supaya pemain tidak boleh mencuba semula untuk hasil lain.
- **Rundingan kerusi di Wilayah Persekutuan.** Pilihan "Tawar kerusi DUN sebagai ganti" tidak lagi dipaparkan di kawasan tanpa DUN.
- **Mesej bulan baharu** kini menunjukkan tambahan AP sebenar, contohnya "AP +2 (had 15 dicapai)", bukan sentiasa "+5".
- **Teks bantuan yang lapuk.** Soalan Lazim, langkah tutorial dan menu "Cara bermain" masih menyatakan AP diset semula setiap bulan. Sejak v7.23, AP terkumpul sehingga 15.

### Kestabilan dan prestasi

- `save.js` tidak lagi menulis ujian storan pada setiap bacaan profil. Ujian itu berjalan sekali sahaja, bukan berpuluh kali setiap paparan.
- Rekod kiraan acara aktiviti bulanan (`myPolitik_events`) dihadkan kepada 3 bulan terakhir. Sebelum ini ia membesar tanpa had.
- Nama negeri daripada data luar dilepaskan sebelum dimasukkan ke HTML tawaran lobi.
- `hayat.js` dan `perlembagaan.js` kini didaftar secara global dalam semua persekitaran, seperti modul lain.
- Service worker v8.0 mencache kerangka aplikasi (halaman, CSS, JS, ikon dan data peta utama) semasa pemasangan. Permainan boleh dibuka luar talian sejak lawatan pertama, dan satu fail yang gagal tidak lagi menggagalkan pemasangan.

### Alat pembangun baharu

- `tools/ujian.js` mengandungi 21 ujian peraturan, termasuk ujian sifat rawak (300 keadaan) yang memastikan setiap butang aktif berjaya dijalankan.
- `tools/simulasi.js` ialah bot yang memainkan kerjaya penuh dan melaporkan ralat, langgaran invarian dan liputan ciri.
- `tools/persekitaran.js` ialah pemuat Node bersama dengan `localStorage` tiruan.

Lihat bahagian **Ujian automatik** dalam `README.md`.
