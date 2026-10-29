# Nusa Politik

Permainan simulasi politik Malaysia. Pemain bermula sebagai **Ahli Biasa** di sebuah Cawangan dan cuba naik ke jawatan Cawangan, Bahagian dan Pusat melalui kitaran pemilihan 3 tahun, kemudian bertanding PRU/PRN dan memegang jawatan kerajaan.

Parti yang boleh dimainkan:

| Parti | Mod | Ciri khas |
|---|---|---|
| UMNO | Penuh | Struktur asal permainan (Cawangan, Bahagian, Pusat; sayap Pemuda, Puteri, Wanita) |
| MCA | Penuh | Komponen BN di Semenanjung: semua 165 kawasan Parlimen (kuota kerusi 40 Parlimen / 90 DUN ikut peratus Cina), Cawangan = Daerah Mengundi; pemilihan parti selepas setiap PRU, Pusat dipilih oleh perwakilan Bahagian, lantikan Presiden, had Presiden 9 tahun, 3 tahun keahlian untuk bertanding (Perlembagaan MCA) |
| MIC | Penuh | Komponen BN di Semenanjung: semua 165 kawasan Parlimen (kuota kerusi 10 Parlimen / 20 DUN ikut peratus India), Cawangan = Daerah Mengundi (60 hingga 200 ahli); pemilihan setiap 3 tahun dari 2027; semua jawatan tinggi perlu sedang Pengerusi Cawangan; Presiden dipilih oleh pegawai Cawangan (250 penamaan); Kongres Negeri; sayap Putera; had 3 penggal Pengerusi Bahagian dan Presiden (Perlembagaan MIC) |
| PBB (Sarawak) | Penuh | Ranting, Cawangan (= DUN) dan Pusat; Majlis Tertinggi, Perhimpunan Agung PBB, imbangan blok Bumiputera & Pesaka, tuntutan Premier |
| PRS, SUPP, PDP (Sarawak) | Ringan | Parti rakan GPS dengan kuota kerusi; ciri teras masing-masing (Pengaruh GPS, Sokongan Bandar, Imbangan Kaum) |

PRN Sarawak dan PRU Parlimen berjalan berasingan untuk parti Sarawak. Tab Peta memaparkan 82 DUN dan Daerah Mengundi Sarawak.

> **Penafian:** Ini permainan simulasi, bukan laman rasmi parti. Nombor, kebarangkalian dan nama pesaing ialah rekaan permainan. Kad "Laluan Karier Sebenar" ialah ringkasan fakta awam bersumber dan tidak menilai mana-mana tokoh.

## Bahasa dan simpanan

- **BM / EN:** tukar bahasa dengan butang BM | EN di pengepala. Pilihan disimpan bersama watak.
- **Pindah career:** Menu > Simpanan > Eksport/Import. Salin kod `NUSA1.` atau muat turun fail JSON, kemudian import di peranti lain. Tiada akaun diperlukan.

## Cara main

1. Buka `index.html`, isi nama, jantina, umur, tahun menjadi ahli, pilih Cawangan dan watak.
2. Di dashboard, guna **Mata Tindakan (AP)** untuk ziarah, gotong-royong, khidmat masyarakat dan kerja kepimpinan. Ini menambah **Pengaruh (IP)** dan **Kesetiaan**. AP bertambah 5 setiap bulan dan baki dibawa sehingga had 15.
3. Ikut takwim:

| Bulan | Apa berlaku |
|---|---|
| 1-3 | Kerja akar umbi (bonus +25% IP dan kesetiaan) |
| 4-6 | Mesyuarat dan pemilihan Cawangan serta sayap |
| 7 | Mesyuarat dan pemilihan Bahagian |
| 8 | PAU dan pemilihan Pusat (WTC KL, Menara Dato' Onn) |
| 9-12 | Pasca-PAU, bina semula sokongan |

Takwim di atas ialah untuk UMNO. Bagi MCA: Perhimpunan Cawangan bulan 4, Perhimpunan Bahagian bulan 6 dan Perhimpunan Agung bulan 8, dengan pemilihan jawatan hanya pada tahun selepas PRU. Bagi PBB: mesyuarat dan pemilihan Ranting pada bulan 3, Cawangan pada bulan 5 dan Perhimpunan Agung PBB (PA) pada bulan 8.

4. Pemilihan jawatan hanya pada **tahun pemilihan** (2026, 2029, 2032...). Tahun lain ialah tahun pentadbiran, tetapi mandat perwakilan perlu dimenangi semula setiap tahun.
5. Jaga **Tataetika**. Kempen bersih membina Modal Sosial. Politik wang dan fitnah memberi kelebihan pantas tetapi boleh membawa amaran, gantung, larangan bertanding atau pemecatan.

Kesetiaan susut setiap bulan jika tidak dijaga, dan jawatan makin tinggi makin sukar dimenangi. Jika Sokongan Akar Umbi pemegang jawatan jatuh di bawah 40%, seorang **pencabar** boleh muncul. Pencabar bertanding menentang anda apabila jawatan itu dipertahankan, dan berundur jika sokongan pulih ke 55%.

Kos wang yang tertera pada butang sudah termasuk pelarasan **tahap kesukaran** (Mudah -20%, Hardcore +20%). Peruntukan dana kempen pilihan raya ialah pindahan dana, jadi tidak dilaraskan, dan bakinya dipulangkan sepenuhnya.

## Fail dalam repo

| Fail / folder | Fungsi |
|---|---|
| `index.html` | Halaman pendaftaran pemain |
| `dashboard.html` | Papan permainan |
| `js/` | Logik permainan (lihat di bawah) |
| `css/` | Gaya paparan. `index.html` memuatkan salinan CSS di dalamnya |
| `data/` | Data peta dan demografi (JSON) |
| `assets/images/` | Logo |
| `apps-script/Code.gs` | Pilihan: Google Apps Script untuk membaca data Cawangan |
| `tools/` | Alat bantuan untuk pembangun, termasuk ujian automatik (lihat di bawah) |
| `CHANGELOG.md` | Catatan perubahan setiap versi |

Modul utama dalam `js/`:

| Fail | Tugas |
|---|---|
| `save.js` | Simpan dan baca profil pemain (localStorage), pintu tunggal untuk ubah nilai |
| `calendar.js` | Takwim bulanan, AP dan elaun, susutan kesetiaan |
| `jawatan.js` | Senarai jawatan dan syarat kelayakan |
| `election.js` | Pemilihan, kempen, kuota perwakilan |
| `meeting.js` | Persidangan Tahunan Cawangan dan Bahagian |
| `etika.js` | Tataetika, siasatan dan hukuman disiplin |
| `events.js` | Peristiwa rawak |
| `watak.js` | Gaya Kepimpinan dan kad Laluan Karier Sebenar |
| `map.js`, `geo.js` | Peta SVG negeri, parlimen dan DUN |
| `menu.js` | Menu utama pada `index.html` (Sambung, Permainan Baharu, Cara Bermain) |
| `perlembagaan.js` | Modal rujukan Perlembagaan Parti (fasal boleh lipat) |
| `slot.js`, `slotpanel.js` | Slot simpanan berbilang (5 watak) dan panel Simpanan Permainan pada menu |
| `stress.js` | Stress, Kesihatan, tindakan Rehat dan kesan kepada risiko tamat kerjaya |
| `hayat.js` | Umur pemain, risiko kesihatan, Legacy Summary (kerjaya tamat) dan peralihan kategori mengikut umur pada AGM |
| `parti.js`, `sarawak.js` | Penjenamaan parti (nama, logo, istilah) dan peraturan khas parti Sarawak (GPS, kuota, Premier) |
| `pru.js`, `pru-ui.js` | PRU/PRN: pencalonan, manifesto, kempen 14 hari, kejutan kempen, keputusan dan status kerajaan |
| `polling.js` | Kaji Selidik Pilihan Raya: unjuran undi, status kerusi, pengundi atas pagar, demografi |
| `warroom.js` | Bilik Gerakan (War Room): zon kawasan, penghantaran jentera, pertempuran jentera, keletihan kempen |
| `kabinet.js`, `jemaah.js` | Lobi portfolio, jawatan kerajaan dan pembentukan Jemaah Menteri oleh Perdana Menteri |
| `isu.js`, `media.js` | Isu Semasa (pendirian pemain) dan Jentera Media Digital (persepsi, Sokongan Belia, sidang media) |
| `tular.js` | Krisis tular media sosial dan pertahanan digital |
| `mca.js`, `mca-ui.js`, `mca-data.js` | Peraturan khas MCA (kuota BN, kitaran pemilihan, Pusat, lantikan) dan data kawasan (`node tools/build-mca.js`) |
| `dewan.js`, `dun.js` | Sidang Dewan Rakyat dan Dewan Undangan Negeri |
| `i18n.js`, `translations*.js`, `tutorial-en.js` | Dwibahasa BM / EN |
| `app.js` | Menggabungkan semua modul ke dalam dashboard |

Data permainan disimpan dalam pelayar (localStorage). Tiada pelayan atau akaun diperlukan.

## Latar belakang menu

Menu utama menggunakan ilustrasi asal `assets/images/menara-dato-onn.svg`. Untuk guna foto sebenar, simpan foto anda sebagai `assets/images/menara-dato-onn.jpg` (disyorkan menegak, lebar sekitar 1200 px atau lebih). Foto itu akan dipaparkan menggantikan ilustrasi secara automatik. Pastikan anda berhak menggunakan foto tersebut.

## Jalankan di komputer

Buka `index.html` terus dalam pelayar, atau jalankan pelayan ringkas supaya peta dimuat dengan betul:

```
python3 -m http.server 8000
```

Kemudian buka `http://localhost:8000`.

## Kemas kini kod

- Jika anda ubah fail dalam `css/`, jalankan `node tools/inline-css.js` supaya `index.html` dikemas kini.
- Jika anda ubah senarai fail JS, CSS atau imej, kemas kini senarai `ASAS` dan naikkan `VERSI` dalam `sw.js` supaya pemain menerima cache baharu.
- Untuk melaras kesukaran, ubah nilai ini:
  - `election.js`: `GANDA_KESUKARAN`, `ARAS_PESAING`, `IP_SKALA`
  - `jawatan.js`: `ipMin`, `pangkatMin` dan `kesukaran` pada setiap jawatan
  - `calendar.js`: `SUSUT_BULANAN`, `AP_BULANAN`, `DANA_ASAS`
  - `save.js`: `REDAMAN_IP`

## Ujian automatik

Logik permainan boleh diuji tanpa pelayar menggunakan Node.js (versi 16 atau lebih baharu). Tiada pakej perlu dipasang.

```
node tools/ujian.js          # ujian peraturan permainan (kos, pemilihan, cabaran, disiplin, PRU, simpanan)
node tools/ujian.js cabaran  # jalankan ujian yang namanya mengandungi "cabaran" sahaja
node tools/simulasi.js       # bot memainkan 12 kerjaya penuh (sehingga 40 tahun permainan setiap satu)
node tools/simulasi.js 30 600 1000   # 30 kerjaya, maksimum 600 bulan, benih rawak bermula 1000
```

```
node tools/ujian-bahasa.js       # ujian dwibahasa tanpa pelayar: kamus dan teks data permainan ada EN (-v untuk senarai penuh)
node tools/ujian-pelayar.js      # asap pelayar dalam EN (perlu Playwright; dilangkau jika tiada). BULAN=12 untuk lebih lama
node tools/ujian-pbb.js          # pelayar: daftar sebagai ahli PBB (penjenamaan, peta Sarawak, istilah)
PARTI=SUPP node tools/ujian-prs.js   # pelayar: parti mod ringan (PRS lalai; SUPP atau PDP)
node tools/ujian-indeks.js       # pelayar: halaman utama dan pendaftaran
node tools/ujian-jemaah.js       # pelayar: Jemaah Menteri
node tools/ujian-isu.js          # pelayar: Isu Semasa dan Sidang Media
node tools/ujian-mca.js          # pelayar: daftar sebagai ahli MCA (istilah, kad MCA, Perlembagaan MCA, peta)
node tools/ujian-mic.js          # pelayar: daftar sebagai ahli MIC (sayap Putera, kad MIC, Perlembagaan MIC, EN)
node tools/ujian-perlembagaan.js # pelayar: menu Perlembagaan UMNO bertab (6 dokumen), Struktur Organisasi Fasa A, EN
```

Ujian pelayar memerlukan Playwright dan Chromium; ia dilangkau (kod keluar 0) jika tiada. `tools/simulasi.js` mengambil kira-kira setengah saat bagi setiap bulan permainan, jadi untuk semakan pantas guna bilangan kecil, contohnya `node tools/simulasi.js 3 120`. `PARTI=PBB` atau `PARTI=PRS` memainkan bot sebagai parti Sarawak, `PARTI=MCA` sebagai ahli MCA dan `PARTI=MIC` sebagai ahli MIC.

`tools/ujian-bahasa.js` gagal jika ada baris kamus tanpa EN, pemegang tempat `{x}` tidak sepadan, "Wing Wing", atau teks acara, latihan Amir, PRU, Kabinet dan Perlembagaan yang tiada terjemahan. `tools/ujian-pelayar.js` melaporkan ralat JavaScript dan teks BM yang bocor dalam mod EN. Nama misi dan tajuk sumber luar dikecualikan dengan sengaja.

`tools/simulasi.js` melaporkan ralat JavaScript, **langgaran invarian** (contohnya nombor tidak sah, butang aktif yang gagal apabila ditekan, pemain tersekat atau cabaran jawatan yang tidak pernah selesai) dan **liputan** ciri yang sempat dimainkan. Kedua-dua alat keluar dengan kod 1 jika ada masalah, jadi sesuai dijalankan sebelum setiap kemas kini. `tools/persekitaran.js` ialah pemuat bersama yang menyediakan `localStorage` tiruan dan memuatkan modul `js/` mengikut susunan `dashboard.html`.

## Rujukan

Peraturan pemilihan dirujuk kepada Perlembagaan UMNO (contoh Fasal 8.4.3 kuota perwakilan PAU, Fasal 14.4.4 kuota Cawangan, Fasal 15.5 tempoh keahlian, Fasal 20 disiplin) dan Tataetika Ahli. Teks dibaca daripada salinan imbasan dan mungkin mengandungi kesilapan kecil. Beberapa nilai seperti tempoh gantung 12 bulan dan larangan 36 bulan ialah andaian permainan.
