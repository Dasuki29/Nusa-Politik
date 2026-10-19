# Catatan Perubahan

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
