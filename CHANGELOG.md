# Catatan Perubahan

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
