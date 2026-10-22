# Catatan Perubahan

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
