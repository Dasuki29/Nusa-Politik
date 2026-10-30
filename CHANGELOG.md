# Catatan Perubahan

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
