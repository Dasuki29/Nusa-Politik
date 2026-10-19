# Nusa Politik

Permainan simulasi politik berasaskan struktur parti UMNO. Pemain bermula sebagai **Ahli Biasa** di sebuah Cawangan dan cuba naik ke jawatan Cawangan, Bahagian dan Pusat melalui kitaran pemilihan 3 tahun.

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

`tools/simulasi.js` melaporkan ralat JavaScript, **langgaran invarian** (contohnya nombor tidak sah, butang aktif yang gagal apabila ditekan, pemain tersekat atau cabaran jawatan yang tidak pernah selesai) dan **liputan** ciri yang sempat dimainkan. Kedua-dua alat keluar dengan kod 1 jika ada masalah, jadi sesuai dijalankan sebelum setiap kemas kini. `tools/persekitaran.js` ialah pemuat bersama yang menyediakan `localStorage` tiruan dan memuatkan modul `js/` mengikut susunan `dashboard.html`.

## Rujukan

Peraturan pemilihan dirujuk kepada Perlembagaan UMNO (contoh Fasal 8.4.3 kuota perwakilan PAU, Fasal 14.4.4 kuota Cawangan, Fasal 15.5 tempoh keahlian, Fasal 20 disiplin) dan Tataetika Ahli. Teks dibaca daripada salinan imbasan dan mungkin mengandungi kesilapan kecil. Beberapa nilai seperti tempoh gantung 12 bulan dan larangan 36 bulan ialah andaian permainan.
