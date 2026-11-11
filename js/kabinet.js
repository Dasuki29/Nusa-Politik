/* ==========================================================================
   Nusa Politik — js/kabinet.js   (v7.5)
   Sistem Pembentukan Kabinet & EXCO Negeri:
     1. State p.kabinet: hasGovernmentRole, roleLevel ('NONE'|'EXCO_NEGERI'|'TIMBALAN_MENTERI'|'MENTERI_PENUH'),
        portfolioName, governanceRating (0-100) dan tekananPolitik.
     2. Lobi Portfolio selepas menang kerusi (DUN -> EXCO; Parlimen -> Timbalan Menteri / Menteri Penuh),
        menggunakan Pengaruh (IP) dan Dana. Hanya dibuka jika parti membentuk kerajaan (diputuskan oleh pru.js).
     3. v2.0: KPI Portfolio (label & arah), Dilema Menteri/EXCO (Tindakan Tegas vs Jalan Pintas Politik) yang menjejaskan
        populariti nasional dan risiko rombakan, serta Peruntukan Projek Pembangunan (CDF) ke kawasan sendiri -> IP.
     4. Acara pentadbiran bulanan: elaun (Dana & IP), isu kementerian, penarafan tadbir urus dan tekanan politik.
        Penarafan di bawah 30% dua bulan berturut-turut = rombakan kabinet (jawatan hilang).
   Andaian (laras dalam CONFIG): semua nilai ialah anggaran permainan. Tiada sistem kerajaan sebenar;
   jawatan kerajaan hanya memberi elaun dan acara pentadbiran.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikKabinet = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  /** v10.0: parti Sarawak (PBB mod penuh; PRS dan lain-lain mod ringan) guna enjin Sarawak yang sama. */
  function SW(k) { return k === 'PBB' || k === 'PRS' || k === 'SUPP' || k === 'PDP' || k === 'PSB'; }

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function DATA() { return modul('MyPolitikKabinetData', 'kabinet-data.js'); }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function ST() { return modul('MyPolitikStres', 'stress.js'); }
  function ET() { return modul('MyPolitikEtika', 'etika.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  var rngLalai = Math.random;
  function rng(o) { return (o && o.rng) || rngLalai; }
  function antara(r, a, b) { return a + r() * (b - a); }

  var CONFIG = {
    LOBI_PERCUBAAN: 3, LOBI_GAGAL_PULANG: 0.5, HAD_PILIHAN: 5,                          // v7.42: had pilihan portfolio Parlimen dipaparkan
    RATING_AWAL: 50, TEKANAN_AWAL: 20,
    RATING_RENDAH: 30, BULAN_RENDAH_ROMBAK: 2,
    TEKANAN_TINGGI: 80, TEKANAN_SUSUT: 2,
    PELUANG_ACARA: 0.7,
    ROMBAK: { reputasi: -5 },
    POP_AWAL: 50, POP_RENDAH: 30, POP_IP_BAGI: 10, POP_IP_MIN: -3, POP_IP_MAKS: 5,       // populariti nasional -> bonus IP bulanan
    ROMBAK_AMBANG: 60, ROMBAK_SUSUT: 3, ROMBAK_POP_RENDAH: 4, ROMBAK_PELUANG_MIN: 0.1, ROMBAK_PELUANG_MAKS: 0.6,
    DILEMA_PELUANG: 0.5,                                                                  // sebahagian acara bulanan ialah dilema
    CDF: { BULANAN: { EXCO_NEGERI: 3000, MENTERI_BESAR: 6000, TIMBALAN_MENTERI: 5000, MENTERI_PENUH: 8000, TIMBALAN_PM: 9000, PERDANA_MENTERI: 12000 }, TOPI_BULAN: 2, HAD_KALI: 2, RM_SEIP: 200,
           PILIHAN: [2000, 5000, 10000], KECIL: 2000, RATING_BESAR: -2, TEKANAN_BESAR: 3, ROMBAK_BESAR: 4, TERSADAI_RATING: -2 }
  };

  var TAHAP = {
    EXCO_NEGERI: { nama: 'EXCO Negeri', elaun: { myr: 1500, ip: 8 } },
    MENTERI_BESAR: { nama: 'Menteri Besar', elaun: { myr: 6000, ip: 18 } },                           // v7.63: kerajaan negeri (label 'Ketua Menteri' ikut negeri)
    TIMBALAN_MENTERI: { nama: 'Timbalan Menteri', elaun: { myr: 2500, ip: 12 } },
    MENTERI_PENUH: { nama: 'Menteri Penuh', elaun: { myr: 4000, ip: 20 } },
    TIMBALAN_PM: { nama: 'Timbalan Perdana Menteri', elaun: { myr: 6000, ip: 25 } },        // v7.22: hanya melalui rundingan kerajaan (Presiden)
    PERDANA_MENTERI: { nama: 'Perdana Menteri', elaun: { myr: 8000, ip: 30 } }
  };
  var PORTFOLIO = {
    DUN: [
      /* v13.69: 9 portfolio EXCO yang boleh dilobi (portfolio 1, Tanah & Kewangan, dipegang MB/KM: PORTFOLIO_MB). ANDAIAN: IP, kos dan peluang ialah nilai permainan. */
      { id: 'exco_luarbandar', tahap: 'EXCO_NEGERI', nama: 'EXCO Pembangunan Luar Bandar, Pertanian & Keterjaminan Makanan', ip: 100, myr: 1500, asas: 0.75, risiko: 'rendah', kategori: 'ekonomi', ikon: '🌾' },
      { id: 'exco_kebajikan', tahap: 'EXCO_NEGERI', nama: 'EXCO Kebajikan, Pembangunan Wanita & Keluarga', ip: 100, myr: 1500, asas: 0.75, risiko: 'rendah', kategori: 'kesihatan', ikon: '🤝' },
      { id: 'exco_belia',     tahap: 'EXCO_NEGERI', nama: 'EXCO Pembangunan Belia, Sukan & NGO', ip: 100, myr: 1500, asas: 0.75, risiko: 'rendah', kategori: 'pendidikan', ikon: '⚽' },
      { id: 'exco_kerjaraya', tahap: 'EXCO_NEGERI', nama: 'EXCO Kerja Raya, Infrastruktur & Kemudahan Awam', ip: 120, myr: 2000, asas: 0.65, risiko: 'sederhana', kategori: 'infra', ikon: '🏗️' },
      { id: 'exco_pelancongan', tahap: 'EXCO_NEGERI', nama: 'EXCO Pelancongan, Kebudayaan & Warisan', ip: 120, myr: 2000, asas: 0.65, risiko: 'sederhana', kategori: 'infra', ikon: '🎭' },
      { id: 'exco_pendidikan', tahap: 'EXCO_NEGERI', nama: 'EXCO Pendidikan, Pengajian Tinggi & Sumber Manusia', ip: 130, myr: 2200, asas: 0.62, risiko: 'sederhana', kategori: 'pendidikan', ikon: '🎓' },
      { id: 'exco_agama',     tahap: 'EXCO_NEGERI', nama: 'EXCO Hal Ehwal Agama Islam & Adat Istiadat Melayu', ip: 140, myr: 2400, asas: 0.6, risiko: 'sederhana', kategori: 'kesihatan', ikon: '🕌', islam: true },
      { id: 'exco_ktp',       tahap: 'EXCO_NEGERI', nama: 'EXCO Kerajaan Tempatan, Perumahan & Pengangkutan', ip: 150, myr: 2500, asas: 0.58, risiko: 'sederhana', kategori: 'infra', ikon: '🏙️' },
      { id: 'exco_pelaburan', tahap: 'EXCO_NEGERI', nama: 'EXCO Pelaburan, Perdagangan, Perindustrian & PKS', ip: 200, myr: 3500, asas: 0.5, risiko: 'sederhana', kategori: 'ekonomi', ikon: '🏭' }
    ],
    /* v9.2: portfolio kabinet negeri Sarawak (untuk pemain PBB). Nama kementerian ialah label simulasi; IP/kos/peluang ialah andaian permainan. */
    SARAWAK: [
      { id: 'sw_kesihatan',  tahap: 'EXCO_NEGERI', nama: 'Menteri Kesihatan Awam, Perumahan & Kerajaan Tempatan Sarawak', ip: 100, myr: 1500, asas: 0.75, risiko: 'rendah' },
      { id: 'sw_pembangunan_sosial', tahap: 'EXCO_NEGERI', nama: 'Menteri Pembangunan Sosial & Perbandaran Sarawak', ip: 100, myr: 1500, asas: 0.75, risiko: 'rendah' },
      { id: 'sw_pendidikan', tahap: 'EXCO_NEGERI', nama: 'Menteri Pendidikan, Inovasi & Pembangunan Bakat Sarawak', ip: 110, myr: 1800, asas: 0.70, risiko: 'rendah' },
      { id: 'sw_pengangkutan', tahap: 'EXCO_NEGERI', nama: 'Menteri Pengangkutan Sarawak', ip: 120, myr: 2000, asas: 0.65, risiko: 'sederhana' },
      { id: 'sw_utiliti',    tahap: 'EXCO_NEGERI', nama: 'Menteri Utiliti & Telekomunikasi Sarawak', ip: 120, myr: 2000, asas: 0.65, risiko: 'sederhana' },
      { id: 'sw_pelancongan', tahap: 'EXCO_NEGERI', nama: 'Menteri Pelancongan, Industri Kreatif & Seni Persembahan Sarawak', ip: 120, myr: 2000, asas: 0.65, risiko: 'sederhana' },
      { id: 'sw_sumber_asli', tahap: 'EXCO_NEGERI', nama: 'Menteri Sumber Asli & Pembangunan Bandar Sarawak', ip: 160, myr: 3000, asas: 0.50, risiko: 'sederhana' },
      { id: 'sw_kewangan',   tahap: 'EXCO_NEGERI', nama: 'Menteri Kewangan Sarawak', ip: 250, myr: 5000, asas: 0.35, risiko: 'tinggi' }
    ],
    /* v13.81: Kabinet Negeri Sabah (anggota bergelar Menteri), ikut susunan kabinet 2 Dis 2025. ANDAIAN: IP, kos dan peluang ialah nilai permainan.
       'tindakan' = set tindakan Pejabat EXCO yang dikongsi (TINDAKAN_EXCO). */
    SABAH: [
      { id: 'sb_kerjaraya', tahap: 'EXCO_NEGERI', nama: 'Timbalan Ketua Menteri I & Menteri Kerja Raya dan Utiliti Sabah', ip: 200, myr: 3500, asas: 0.5, risiko: 'sederhana', kategori: 'infra', ikon: '🏗️', tindakan: 'exco_kerjaraya' },
      { id: 'sb_kewangan', tahap: 'EXCO_NEGERI', nama: 'Timbalan Ketua Menteri II & Menteri Kewangan Sabah', ip: 250, myr: 5000, asas: 0.35, risiko: 'tinggi', kategori: 'ekonomi', ikon: '💰', tindakan: 'exco_tanah' },
      { id: 'sb_industri', tahap: 'EXCO_NEGERI', nama: 'Timbalan Ketua Menteri III & Menteri Perindustrian, Keusahawanan dan Pengangkutan Sabah', ip: 200, myr: 3500, asas: 0.5, risiko: 'sederhana', kategori: 'ekonomi', ikon: '🏭', tindakan: 'exco_pelaburan' },
      { id: 'sb_ktp', tahap: 'EXCO_NEGERI', nama: 'Menteri Kerajaan Tempatan dan Perumahan Sabah', ip: 150, myr: 2500, asas: 0.58, risiko: 'sederhana', kategori: 'infra', ikon: '🏙️', tindakan: 'exco_ktp' },
      { id: 'sb_luarbandar', tahap: 'EXCO_NEGERI', nama: 'Menteri Pembangunan Luar Bandar Sabah', ip: 100, myr: 1500, asas: 0.75, risiko: 'rendah', kategori: 'ekonomi', ikon: '🌾', tindakan: 'exco_luarbandar' },
      { id: 'sb_pertanian', tahap: 'EXCO_NEGERI', nama: 'Menteri Pertanian, Perikanan dan Industri Makanan Sabah', ip: 100, myr: 1500, asas: 0.75, risiko: 'rendah', kategori: 'ekonomi', ikon: '🐟', tindakan: 'exco_luarbandar' },
      { id: 'sb_pendidikan', tahap: 'EXCO_NEGERI', nama: 'Menteri Pendidikan, Sains, Teknologi dan Inovasi Sabah', ip: 130, myr: 2200, asas: 0.62, risiko: 'sederhana', kategori: 'pendidikan', ikon: '🎓', tindakan: 'exco_pendidikan' },
      { id: 'sb_pelancongan', tahap: 'EXCO_NEGERI', nama: 'Menteri Pelancongan, Kebudayaan dan Alam Sekitar Sabah', ip: 120, myr: 2000, asas: 0.65, risiko: 'sederhana', kategori: 'infra', ikon: '🎭', tindakan: 'exco_pelancongan' },
      { id: 'sb_wanita', tahap: 'EXCO_NEGERI', nama: 'Menteri Wanita, Kesihatan dan Kesejahteraan Rakyat Sabah', ip: 100, myr: 1500, asas: 0.75, risiko: 'rendah', kategori: 'kesihatan', ikon: '🤝', tindakan: 'exco_kebajikan' },
      { id: 'sb_belia', tahap: 'EXCO_NEGERI', nama: 'Menteri Pembangunan Belia, Kemajuan Sukan dan Ekonomi Kreatif Sabah', ip: 100, myr: 1500, asas: 0.75, risiko: 'rendah', kategori: 'pendidikan', ikon: '⚽', tindakan: 'exco_belia' }
    ],
    PARLIMEN: [
      { id: 'tm_pendidikan', tahap: 'TIMBALAN_MENTERI', nama: 'Timbalan Menteri Pendidikan', ip: 250, myr: 4000, asas: 0.80, risiko: 'rendah' },
      { id: 'tm_kesihatan',  tahap: 'TIMBALAN_MENTERI', nama: 'Timbalan Menteri Kesihatan', ip: 280, myr: 4500, asas: 0.70, risiko: 'sederhana' },
      { id: 'tm_kewangan',   tahap: 'TIMBALAN_MENTERI', nama: 'Timbalan Menteri Kewangan', ip: 350, myr: 6000, asas: 0.60, risiko: 'tinggi' },
      { id: 'm_luarbandar',  tahap: 'MENTERI_PENUH', nama: 'Menteri Pembangunan Luar Bandar', ip: 550, myr: 9000, asas: 0.40, risiko: 'sederhana' },
      { id: 'm_pertanian',   tahap: 'MENTERI_PENUH', nama: 'Menteri Pertanian', ip: 600, myr: 10000, asas: 0.35, risiko: 'sederhana' }
    ]
  };
  /** v7.42: senarai portfolio Parlimen daripada data/kabinet-persekutuan.csv (IP perlu = lajur IP).
      Menteri Penuh = nilai CSV. Timbalan Menteri dijana daripada setiap Menteri (andaian: IP perlu = IP Menteri - 250, minimum 250).
      Kos IP = IP perlu; Dana, peluang asas dan risiko ditentukan oleh IP (andaian, laras di sini). */
  function jenisDariIP(ip) { return { myr: Math.round(ip * 16 / 500) * 500, asas: clamp(1.05 - ip * 0.0011, 0.3, 0.85), risiko: ip <= 350 ? 'rendah' : ip <= 550 ? 'sederhana' : 'tinggi' }; }
  function binaParlimen() {
    var D = DATA(); if (!D || !D.menteri || !D.menteri.length) { return null; }
    var out = [];
    D.menteri.forEach(function (m, i) {
      var tm = Math.max(250, m.ip - 250), a = jenisDariIP(m.ip), b = jenisDariIP(tm);
      out.push({ id: 'm_' + i, tahap: 'MENTERI_PENUH', nama: m.nama, ip: m.ip, myr: a.myr, asas: a.asas, risiko: a.risiko });
      out.push({ id: 'tm_' + i, tahap: 'TIMBALAN_MENTERI', nama: m.nama.replace(/^Menteri /, 'Timbalan Menteri '), ip: tm, myr: b.myr, asas: b.asas, risiko: b.risiko });
    });
    return out;
  }
  var DARI_CSV = binaParlimen(); if (DARI_CSV) { PORTFOLIO.PARLIMEN = DARI_CSV; }
  /* v13.69: portfolio 1 dipegang terus oleh Menteri Besar / Ketua Menteri (bukan Sarawak); tidak boleh dilobi EXCO biasa. */
  var PORTFOLIO_MB = { id: 'exco_tanah', tahap: 'MENTERI_BESAR', nama: 'Tanah, Mineral, Perhutanan & Kewangan', kategori: 'ekonomi', ikon: '🏞️' };
  /* v13.69: portfolio Agama Islam tidak dibuka untuk parti berasaskan bukan Islam (ANDAIAN). PBS: hanya komuniti Bumiputera Islam. */
  var TANPA_AGAMA = { MCA: 1, MIC: 1, DAP: 1, PPP: 1, LDP: 1, UPKO: 1, PBRS: 1, PCS: 1, PHRS: 1 };
  function bolehAgama(p) { if (!p) { return true; } if (p.parti === 'PBS') { return p.komunitiPBS === 'bi'; } return !TANPA_AGAMA[p.parti]; }
  /** v13.81: pemain di Sabah (bukan parti Sarawak) menggunakan Kabinet Negeri Sabah. */
  function SB(p) { return !!(p && !SW(p.parti) && String(p.negeri || '').toLowerCase() === 'sabah'); }
  function cariPortfolio(id) {
    if (id === PORTFOLIO_MB.id) { return PORTFOLIO_MB; }
    var s = PORTFOLIO.DUN.concat(PORTFOLIO.SARAWAK, PORTFOLIO.SABAH, PORTFOLIO.PARLIMEN);
    for (var i = 0; i < s.length; i++) { if (s[i].id === id) { return s[i]; } }
    return null;
  }

  /* acara pentadbiran: kesan = { rating, tekanan, myr, ip, stress, rep } ; rawak = { p, jaya, gagal } */
  var ACARA = [
    { id: 'tender', ikon: '📑', tajuk: 'Isu Tender Projek', huraian: 'Sebuah syarikat berkaitan rakan parti menawarkan "terima kasih" jika projek pembinaan sekolah diberikan tanpa tender terbuka.',
      pilihan: [
        { id: 'beri', label: 'Beri tanpa tender', kesan: { myr: 8000, rating: -12, tekanan: 6 }, etika: { risiko: 12, lapor: { peluang: 35, berat: 2, perkara: 'Pemberian projek tanpa tender terbuka', fasal: 'Fasal 20.13' } } },
        { id: 'terbuka', label: 'Tender terbuka', kesan: { rating: 8, tekanan: 5 } },
        { id: 'sprm', label: 'Rujuk SPRM', kesan: { rating: 5, tekanan: 3, rep: 2 } }] },
    { id: 'krisis', ikon: '🚨', tajuk: 'Krisis Kementerian', huraian: 'Isu besar di bawah portfolio anda tular di media sosial. Rakyat menuntut jawapan.',
      pilihan: [
        { id: 'sidang', label: 'Tampil sidang media', kesan: { myr: -500, rating: 6, stress: 6 } },
        { id: 'salah', label: 'Salahkan pegawai bawahan', kesan: { rating: -10, rep: -3 } },
        { id: 'diam', label: 'Berdiam diri', kesan: { rating: -6, tekanan: 10 } }] },
    { id: 'lawatan', ikon: '✈️', tajuk: 'Lawatan Rasmi', huraian: 'Anda dijemput mewakili kerajaan dalam lawatan rasmi bagi memperkukuh kerjasama.',
      pilihan: [
        { id: 'pergi', label: 'Sertai rombongan penuh', kesan: { myr: -3000, ip: 25, rating: 3 } },
        { id: 'ringkas', label: 'Wakil ringkas', kesan: { myr: -1000, ip: 10, rating: 1 } },
        { id: 'tolak', label: 'Tolak, fokus kerja dalam negara', kesan: { rating: 2, stress: -2 } }] },
    { id: 'projek', ikon: '🏗️', tajuk: 'Merasmikan Projek', huraian: 'Satu projek komuniti di bawah kementerian anda siap dan menunggu perasmian.',
      pilihan: [
        { id: 'besar', label: 'Majlis besar-besaran', kesan: { myr: -2500, rating: 6, ip: 15 } },
        { id: 'sederhana', label: 'Majlis ringkas bersama penduduk', kesan: { myr: -600, rating: 4 } },
        { id: 'wakil', label: 'Serah kepada pegawai', kesan: { rating: 0, tekanan: 3 } }] },
    { id: 'audit', ikon: '🔎', tajuk: 'Laporan Ketua Audit Negara', huraian: 'Laporan audit mendedahkan kelemahan tadbir urus dalam beberapa projek kementerian.',
      pilihan: [
        { id: 'baiki', label: 'Umum pelan pemulihan', kesan: { myr: -1500, rating: 5, tekanan: 2 } },
        { id: 'jawab', label: 'Pertahankan keputusan', rawak: { p: 0.5, jaya: { rating: 3 }, gagal: { rating: -10, tekanan: 8 } } },
        { id: 'abai', label: 'Abaikan laporan', kesan: { rating: -8, tekanan: 8 } }] },
    { id: 'banjir', ikon: '🌊', tajuk: 'Bantuan Banjir', huraian: 'Banjir melanda sebahagian kawasan. Rakyat menunggu bantuan segera.',
      pilihan: [
        { id: 'turun', label: 'Turun padang & kerah bantuan', kesan: { myr: -2000, rating: 7, stress: 5 } },
        { id: 'arah', label: 'Arahkan jabatan dari pejabat', kesan: { rating: 1 } },
        { id: 'lewat', label: 'Lewat bertindak', kesan: { rating: -9, tekanan: 9 } }] },
    { id: 'media', ikon: '📰', tajuk: 'Tekanan Media', huraian: 'Media memetik dakwaan pembangkang bahawa prestasi anda mengecewakan.',
      pilihan: [
        { id: 'temuramah', label: 'Beri temu ramah terbuka', rawak: { p: 0.6, jaya: { rating: 5, tekanan: -4 }, gagal: { rating: -5, tekanan: 5 } } },
        { id: 'kenyataan', label: 'Keluarkan kenyataan bertulis', kesan: { rating: 2 } },
        { id: 'abai', label: 'Abaikan', kesan: { tekanan: 5 } }] },
    { id: 'ngo', ikon: '🤝', tajuk: 'Kerjasama NGO', huraian: 'Sebuah NGO menawarkan kerjasama untuk program kebajikan dalam kawasan anda.',
      pilihan: [
        { id: 'sokong', label: 'Terima & sumbang peruntukan', kesan: { myr: -1500, rating: 5, rep: 1 } },
        { id: 'terima', label: 'Terima tanpa peruntukan', kesan: { rating: 2 } },
        { id: 'tolak', label: 'Tolak kerjasama', kesan: { rating: -2 } }] },
    /* --- DILEMA v2.0: pop = populariti nasional, rombak = risiko rombakan kabinet --- */
    { id: 'dilema_subsidi', dilema: true, ikon: '⚖️', tajuk: 'Dilema: Subsidi Tidak Tepat Sasaran', huraian: 'Kajian dalaman mendapati sebahagian subsidi kementerian dinikmati golongan berkemampuan. Menyusunnya semula pasti mengundang rungutan.',
      pilihan: [
        { id: 'tegas', label: 'Tindakan Tegas: sasarkan semula subsidi', kesan: { myr: 3000, rating: 7, pop: -6, rombak: 6, tekanan: 4 } },
        { id: 'pintas', label: 'Jalan Pintas Politik: kekalkan subsidi demi undi', kesan: { myr: -3000, rating: -5, pop: 5, rombak: -3 } }] },
    { id: 'dilema_kontraktor', dilema: true, ikon: '⚖️', tajuk: 'Dilema: Projek Terbengkalai', huraian: 'Sebuah projek kementerian lewat berbulan-bulan. Kontraktornya mempunyai hubungan rapat dengan pemimpin kanan parti.',
      pilihan: [
        { id: 'tegas', label: 'Tindakan Tegas: saman & ambil alih projek', kesan: { rating: 9, pop: 3, rombak: 10, tekanan: 5, stress: 4 } },
        { id: 'pintas', label: 'Jalan Pintas Politik: beri lanjutan tanpa denda', kesan: { rating: -6, pop: -2, rombak: -3 } }] },
    { id: 'dilema_kroni', dilema: true, ikon: '⚖️', tajuk: 'Dilema: Arahan Pelantikan', huraian: 'Seorang pemimpin kanan "mencadangkan" seorang rakan rapat dilantik mengetuai agensi di bawah anda, walaupun calon lain lebih layak.',
      pilihan: [
        { id: 'tegas', label: 'Tindakan Tegas: lantik mengikut merit', kesan: { rating: 6, pop: 5, rombak: 12, tekanan: 6 } },
        { id: 'pintas', label: 'Jalan Pintas Politik: lantik rakan pemimpin itu', rawak: { p: 0.6, jaya: { rating: -2, rombak: -8 }, gagal: { rating: -10, pop: -10, rombak: 15, tekanan: 6 } } }] },
    { id: 'dilema_keselamatan', dilema: true, ikon: '⚖️', tajuk: 'Dilema: Insiden Keselamatan Awam', huraian: 'Satu kes keselamatan awam di bawah selia kementerian mula dihidu media. Mendedahkannya segera boleh memalukan kerajaan.',
      pilihan: [
        { id: 'tegas', label: 'Tindakan Tegas: umum terbuka & ambil tindakan', kesan: { myr: -1000, rating: 6, pop: 4, rombak: 5, stress: 4 } },
        { id: 'pintas', label: 'Jalan Pintas Politik: tutup cerita senyap-senyap', rawak: { p: 0.5, jaya: { rating: -2, rombak: -3 }, gagal: { rating: -12, pop: -12, rombak: 18, tekanan: 8 } } }] },
    { id: 'dilema_lebihan', dilema: true, ikon: '⚖️', tajuk: 'Dilema: Peruntukan Lebihan', huraian: 'Terdapat lebihan peruntukan hujung tahun. Perbendaharaan mahu ia dipulangkan; penyokong anda mahu ia disalurkan ke kawasan sendiri.',
      pilihan: [
        { id: 'tegas', label: 'Tindakan Tegas: pulangkan ke Perbendaharaan', kesan: { rating: 5, pop: 2, rombak: -2 } },
        { id: 'pintas', label: 'Jalan Pintas Politik: salur ke kawasan sendiri', kesan: { ip: 30, rating: -5, pop: -3, rombak: 6, tekanan: 3 } }] }
  ];
  function acaraId(id) { for (var i = 0; i < ACARA.length; i++) { if (ACARA[i].id === id) { return ACARA[i]; } } return null; }

  function dasar() {
    return { hasGovernmentRole: false, roleLevel: 'NONE', portfolioName: '', portfolioId: '', governanceRating: CONFIG.RATING_AWAL, tekananPolitik: CONFIG.TEKANAN_AWAL,
      bulanBerjawatan: 0, ratingRendah: 0, lobi: null, acara: null, sejarah: [],
      popularitiNasional: CONFIG.POP_AWAL, risikoRombak: 0, ratingLalu: CONFIG.RATING_AWAL, cdfBaki: 0, cdfBulan: 0, cdfJumlah: 0 };
  }
  function getKabinet(p) {
    var b = dasar(), k = p && p.kabinet && typeof p.kabinet === 'object' ? p.kabinet : {};
    for (var f in b) { if (k[f] === undefined) { k[f] = b[f]; } }
    return k;
  }
  function simpan(k, kesan, opts) {
    opts = opts || {};
    var patch = { kabinet: k };
    if (opts.patch) { for (var f in opts.patch) { patch[f] = opts.patch[f]; } }
    return S().applyEffects(kesan || {}, { kiraTindakan: false, patch: patch, log: opts.log });
  }

  /* ---------- Lobi ---------- */
  function bukaLobi(sumber) {
    var p = S().loadPlayer(), k = getKabinet(p);
    if (k.hasGovernmentRole) { return { ok: false, ralat: 'Sudah memegang jawatan kerajaan.' }; }
    var LT = modul('MyPolitikLetak', 'letak.js'), bt = LT && LT.bertenang ? LT.bertenang(p) : 0;          // v13.12: tempoh bertenang selepas letak jawatan
    if (bt) { return { ok: false, ralat: 'Tempoh bertenang selepas letak jawatan (sehingga ' + LT.tb(bt) + ').' }; }
    k.lobi = { sumber: sumber === 'DUN' ? 'DUN' : 'PARLIMEN', baki: CONFIG.LOBI_PERCUBAAN }; k.mbTertunda = false; k.tpmCuba = false;   // v13.40
    var r = simpan(k, {}, { log: { tindakan: 'lobi_buka', nama: 'Lobi Portfolio Kerajaan dibuka', peringkat: 'ahli' } });
    return { ok: !!(r && r.ok) };
  }
  function peluang(p, def) {
    var PD = modul('MyPolitikPendidikan', 'pendidikan.js'), bp = PD && PD.bonusLobi ? PD.bonusLobi(p) : 0;          // v13.13: pendidikan (Ijazah +2%, Sarjana +4%, PhD +6%)
    var PK = p && p.parti === 'PKR' ? modul('MyPolitikPKR', 'pkr.js') : null, kem = PK && PK.adjLantikan ? PK.adjLantikan(p) : 0;   // v13.36: kem lawan menguasai MPP
    return clamp(def.asas + ((Number(p.ip) || 0) - def.ip) / (def.ip * 8) + ((Number(p.reputasi) || 50) - 50) * 0.003 + bp + kem, 0.1, 0.95);
  }
  /** v7.42: Parlimen: hanya portfolio dengan IP perlu <= IP pemain; paling HAMPIR dengan IP pemain dahulu, maks HAD_PILIHAN (rawak tetap bagi IP sama). */
  /** v9.2: kolam portfolio mengikut sumber; pemain PBB melobi portfolio Sarawak untuk kerusi DUN. */
  function kolamSumber(p, sumber) {
    if (sumber === 'DUN' && p && SW(p.parti)) { return PORTFOLIO.SARAWAK; }
    if (sumber === 'DUN' && SB(p)) { return PORTFOLIO.SABAH; }                     // v13.81
    if (sumber === 'DUN') { return PORTFOLIO.DUN.filter(function (d) { return !d.islam || bolehAgama(p); }); }   // v13.69
    return PORTFOLIO[sumber];
  }
  function kolamPaparan(p, sumber) {
    var semua = kolamSumber(p, sumber);
    if (sumber !== 'PARLIMEN' || !DARI_CSV) { return semua; }
    var ip = Number(p.ip) || 0, rg = S().rngBerbenih(String(p.id) + '|kabinet|' + p.tahun), kunci = {};
    semua.forEach(function (d) { kunci[d.id] = rg(); });
    return semua.filter(function (d) { return d.ip <= ip; })
      .sort(function (x, y) { return (y.ip - x.ip) || (kunci[x.id] - kunci[y.id]); })
      .slice(0, CONFIG.HAD_PILIHAN);
  }
  function senaraiPortfolio(p) {
    var k = getKabinet(p);
    if (!k.lobi) { return []; }
    return kolamPaparan(p, k.lobi.sumber).map(function (d) {
      var sebab = [], kosMyr = S().kosSebenar ? S().kosSebenar(p, d.myr) : d.myr;     // v8.0: kos ikut tahap kesukaran
      if ((Number(p.ip) || 0) < d.ip) { sebab.push('IP tidak cukup (perlu ' + d.ip + ')'); }
      if ((Number(p.myr) || 0) < kosMyr) { sebab.push('Dana tidak cukup (perlu RM ' + kosMyr.toLocaleString('ms-MY') + ')'); }
      return { id: d.id, nama: d.nama, tahap: d.tahap, tahapNama: namaTahap(p, d.tahap), ip: d.ip, myr: kosMyr, peluang: Math.round(peluang(p, d) * 100),
        elaun: TAHAP[d.tahap].elaun, risiko: d.risiko, boleh: !sebab.length, sebab: sebab.join('; '), ikon: d.ikon || '', kurangIP: Math.max(0, d.ip - (Number(p.ip) || 0)) };   // v13.69: bar IP
    });
  }
  function lobiPortfolio(id, o) {
    var p = S().loadPlayer(), k = getKabinet(p), d = cariPortfolio(id), r = rng(o);
    if (!k.lobi || k.lobi.baki <= 0) { return { ok: false, ralat: 'Lobi tidak tersedia.' }; }
    if (!d || kolamSumber(p, k.lobi.sumber).indexOf(d) < 0) { return { ok: false, ralat: 'Portfolio tidak tersedia.' }; }
    var s = senaraiPortfolio(p).filter(function (x) { return x.id === id; })[0];
    if (!s) { return { ok: false, ralat: 'Portfolio tidak tersedia pada IP anda sekarang.' }; }
    if (!s.boleh) { return { ok: false, ralat: s.sebab }; }
    var lulus = r() < peluang(p, d), kes;
    k.lobi.baki -= 1;
    if (lulus) {
      kes = { ip: -d.ip, myr: -d.myr };
      k.hasGovernmentRole = true; k.roleLevel = d.tahap; k.portfolioName = d.nama; k.portfolioId = d.id; k.governanceRating = CONFIG.RATING_AWAL; k.tekananPolitik = CONFIG.TEKANAN_AWAL;
      k.bulanBerjawatan = 0; k.ratingRendah = 0; k.lobi = null; k.acara = null;
      k.popularitiNasional = CONFIG.POP_AWAL; k.risikoRombak = 0; k.ratingLalu = CONFIG.RATING_AWAL; k.cdfBaki = CONFIG.CDF.BULANAN[d.tahap]; k.cdfBulan = 0; k.cdfJumlah = 0;
      k.sejarah = (k.sejarah || []).concat([{ tahun: p.tahun, bulan: p.bulan, nama: d.nama, hasil: 'dilantik' }]).slice(-10);
      var res = simpan(k, kes, { log: { tindakan: 'lobi_jaya', nama: 'Dilantik: ' + d.nama, peringkat: 'ahli' } });
      if (!res.ok) { return { ok: false, ralat: res.ralat }; }
      return { ok: true, dilantik: true, mesej: 'Dilantik sebagai ' + d.nama + '. Elaun bulanan bermula.', portfolio: d.nama };
    }
    var h = CONFIG.LOBI_GAGAL_PULANG;
    kes = { ip: -Math.round(d.ip * (1 - h)), myr: -Math.round(d.myr * (1 - h)) };
    var tutup = k.lobi.baki <= 0;
    if (tutup) { var mbSah = k.lobi.sumber === 'PARLIMEN' && syaratMB(p).boleh; k.lobi = null; if (mbSah) { k.mbTertunda = true; } }   // v13.40
    var rs = simpan(k, kes, { log: { tindakan: 'lobi_gagal', nama: 'Lobi gagal: ' + d.nama, peringkat: 'ahli' } });
    if (!rs.ok) { return { ok: false, ralat: rs.ralat }; }
    return { ok: true, dilantik: false, tutup: tutup, mbTertunda: !!k.mbTertunda, mesej: 'Lobi ' + d.nama + ' gagal. Separuh kos hilang.' + (tutup ? (k.mbTertunda ? ' Peluang lobi Menteri Persekutuan habis, tetapi anda masih boleh menuntut jawatan Menteri Besar sekali.' : ' Peluang lobi penggal ini habis.') : ' Baki percubaan: ' + k.lobi.baki + '.') };
  }
  /** v7.22: Presiden parti dilantik terus ke jawatan tertinggi kerajaan (tanpa lobi/kos). tahap: 'PERDANA_MENTERI' | 'TIMBALAN_PM'. */
  function lantikKanan(tahap) {
    var t = TAHAP[tahap];
    if (tahap !== 'PERDANA_MENTERI' && tahap !== 'TIMBALAN_PM') { return { ok: false, ralat: 'Jawatan tidak sah.' }; }
    var p = S().loadPlayer(), k = getKabinet(p);
    k.hasGovernmentRole = true; k.roleLevel = tahap; k.portfolioName = t.nama; k.portfolioId = ''; k.governanceRating = CONFIG.RATING_AWAL; k.tekananPolitik = CONFIG.TEKANAN_AWAL;
    k.bulanBerjawatan = 0; k.ratingRendah = 0; k.lobi = null; k.acara = null;
    k.popularitiNasional = CONFIG.POP_AWAL; k.risikoRombak = 0; k.ratingLalu = CONFIG.RATING_AWAL; k.cdfBaki = CONFIG.CDF.BULANAN[tahap]; k.cdfBulan = 0; k.cdfJumlah = 0;
    k.sejarah = (k.sejarah || []).concat([{ tahun: p.tahun, bulan: p.bulan, nama: t.nama, hasil: 'dilantik' }]).slice(-10);
    var res = simpan(k, {}, { log: { tindakan: 'lantik_kanan', nama: 'Dilantik: ' + t.nama, peringkat: 'ahli' } });
    return { ok: !!(res && res.ok), ralat: res && res.ralat, mesej: 'Dilantik sebagai ' + t.nama + '. Elaun bulanan bermula.' };
  }
  /* ---------- v7.63: Menteri Besar / Ketua Menteri ---------- */
  var KETUA_MENTERI = ['melaka', 'pulau pinang', 'sabah', 'sarawak'];
  /** v9.3: di Sarawak anggota kabinet negeri dipanggil Menteri (bukan EXCO). Tahap dalaman kekal EXCO_NEGERI; hanya label berubah. */
  function namaTahap(p, tahap) {
    var t = TAHAP[tahap]; if (!t) { return ''; }
    if (tahap === 'MENTERI_BESAR' && p) { return labelKetua(p); }                     // v13.81: Ketua Menteri / Premier ikut negeri
    return p && (SW(p.parti) || SB(p)) && tahap === 'EXCO_NEGERI' ? 'Menteri Negeri' : t.nama;   // v13.81: Sabah juga Menteri Negeri
  }
  function SWk() { return modul('MyPolitikSarawak', 'sarawak.js'); }
  function labelKetua(p) { if (p && SW(p.parti)) { return 'Premier'; } var n = String((p && p.negeri) || '').toLowerCase(); return KETUA_MENTERI.indexOf(n) >= 0 ? 'Ketua Menteri' : 'Menteri Besar'; }
  /** Syarat: lobi DUN dibuka (parti membentuk kerajaan negeri), pemain ADUN, Pengerusi Badan Perhubungan Negeri (induk), bukan Sarawak. */
  /** v13.17: status ADUN pemain (atau null). */
  function statusADUN(p) { var PR = modul('MyPolitikPRU', 'pru.js'); if (!PR || !PR.getPRU) { return null; } var pr = PR.getPRU(p); return [pr.status, pr.statusKedua].filter(function (x) { return x && x.jenis === 'ADUN'; })[0] || null; }
  /** v13.17 (maklum balas pemain): tetingkap tuntutan = mana-mana lobi selepas pilihan raya (bukan hanya lobi DUN). Pemain yang menang
      Parlimen + DUN serentak sebelum ini mendapat lobi Parlimen sahaja, jadi MB tidak pernah dibuka walaupun parti menang besar di DUN. */
  function syaratMB(p) {
    var k = getKabinet(p), PR = modul('MyPolitikPRU', 'pru.js'), NG = modul('MyPolitikNegeri', 'negeri.js'), sebab = '', sa = statusADUN(p);
    if (p && SW(p.parti)) {                                                // v9.1: Premier Sarawak: ADUN dan Presiden PBB
      var W9 = SWk();
      if (k.hasGovernmentRole) { sebab = 'Sudah memegang jawatan kerajaan.'; }
      else if (!k.lobi) { sebab = 'Tiada pembentukan kerajaan negeri.'; }
      else if (!sa) { sebab = 'Anda mesti ADUN.'; }
      else if (sa.kerajaan === false) { sebab = 'Parti anda tidak membentuk kerajaan negeri.'; }
      else if (W9 && W9.sebabPremier) { sebab = W9.sebabPremier(p); }
      return { boleh: !sebab, sebab: sebab };
    }
    if (k.hasGovernmentRole) { sebab = 'Sudah memegang jawatan kerajaan.'; }
    else if (!k.lobi && !k.mbTertunda) { sebab = 'Tiada pembentukan kerajaan negeri.'; }   // v13.40: MB masih boleh dituntut sekali selepas lobi Menteri Persekutuan gagal
    else if (String(p.negeri || '').toLowerCase() === 'sarawak') { sebab = 'UMNO tiada cawangan di Sarawak.'; }
    else if (!sa) { sebab = 'Anda mesti ADUN.'; }
    else if (sa.kerajaan === false) { sebab = 'Parti anda tidak membentuk kerajaan negeri.'; }
    else if (PR.getPRU && [PR.getPRU(p).status, PR.getPRU(p).statusKedua].some(function (x) { return x && x.jenis === 'ADUN' && x.lain && !x.negeriSama; })) { sebab = 'Kerusi DUN anda bukan di negeri ini.'; }   // v8.17: calon kerusi negeri lain
    else {
      var ada = false; try { var st = NG && NG.status ? NG.status(p) : null; ada = !!(st && st.bp && st.bp.pengerusi && st.bp.pengerusi.pemain); } catch (e) { ada = false; }
      if (!ada) { sebab = 'Anda mesti Pengerusi Badan Perhubungan Negeri.'; }
    }
    return { boleh: !sebab, sebab: sebab };
  }
  /** Anggaran kerusi parti sendiri dalam DUN: bahagian rakan dalam BN ditentukan benih tetap (andaian 10%-30% kerusi BN). */
  function kerusiMB(p) {
    if (p && p.parti === 'PBB') { var W9 = SWk(); return W9 && W9.kerusiPremier ? W9.kerusiPremier(p) : null; }   // v9.1
    var A = modul('NusaPaparan', 'paparan.js'), g = A && A.kerusiGabungan ? A.kerusiGabungan(p) : null, d = g && g.dun;
    if (!d && A && A.kemaskiniKerusi) { try { A.kemaskiniKerusi(p); g = A.kerusiGabungan(S().loadPlayer()); d = g && g.dun; } catch (e) { d = null; } }
    if (!d) { return null; }
    var r = S().rngBerbenih ? S().rngBerbenih(String(p.id) + '|mb|' + p.tahun) : Math.random, kongsiRakan = 0.1 + r() * 0.2;
    var rakan = Math.round(d.BN * kongsiRakan), parti = d.BN - rakan;
    return { jumlah: d.jumlah, ambang: d.ambang, parti: parti, rakan: rakan, gabungan: d.BN, sendiri: parti >= d.ambang, kongsi: d.BN > 0 ? parti / d.BN : 1 };
  }
  function peluangMB(p) {
    var k = kerusiMB(p), PR = modul('MyPolitikPRU', 'pru.js'), hub = Number(PR && PR.getPRU ? PR.getPRU(p).hubunganGabungan : 50) || 50;
    if (!k) { return 0.5; }
    if (k.sendiri) { return 1; }
    var W9 = p && p.parti === 'PBB' ? SWk() : null, adj = W9 && W9.pelarasPremier ? W9.pelarasPremier(p) : 0;       // v9.1: imbangan blok PBB
    return clamp(0.4 + (k.kongsi - 0.5) * 1.2 + (hub - 50) * 0.004 + ((Number(p.reputasi) || 50) - 50) * 0.002 + adj, 0.1, 0.9);
  }
  function maklumatMB(p) {
    var sy = syaratMB(p), k = kerusiMB(p);
    return { boleh: sy.boleh, sebab: sy.sebab, label: labelKetua(p), negeri: p.negeri || '', sendiri: !!(k && k.sendiri), parti: k ? k.parti : 0, rakan: k ? k.rakan : 0, gabungan: k ? k.gabungan : 0, jumlah: k ? k.jumlah : 0, ambang: k ? k.ambang : 0,
      kongsi: k ? Math.round(k.kongsi * 100) : 100, peluang: Math.round(peluangMB(p) * 100) };
  }
  /** v13.12: senarai semak syarat MB / Ketua Menteri / Premier untuk ADUN (dipaparkan dalam kad Kabinet). null = bukan ADUN atau sudah MB. */
  function semakMB(p) {
    var PR = modul('MyPolitikPRU', 'pru.js'), NG = modul('MyPolitikNegeri', 'negeri.js'), k = getKabinet(p);
    if (!p || !PR || !PR.getPRU || k.roleLevel === 'MENTERI_BESAR') { return null; }
    var pru = PR.getPRU(p), st = [pru.status, pru.statusKedua].filter(function (x) { return x && x.jenis === 'ADUN'; })[0];
    var bp = false; try { var sB = NG && NG.status ? NG.status(p) : null; bp = !!(sB && sB.bp && sB.bp.pengerusi && sB.bp.pengerusi.pemain); } catch (eB) { bp = false; }
    if (!st && !bp) { return null; }                                                                 // v13.17: Pengerusi Badan Perhubungan tanpa kerusi DUN juga melihat senarai semak
    var sw = SW(p.parti), label = labelKetua(p), item = [];
    item.push({ ok: !!st && !(st.lain && !st.negeriSama) && !(!sw && String(p.negeri || '').toLowerCase() === 'sarawak'), teks: st ? 'Anda ADUN di negeri ini' : 'Anda mesti ADUN: bertanding kerusi DUN (atau Parlimen + DUN serentak) dalam PRU' });
    item.push({ ok: !!(st && st.kerajaan), teks: 'Parti / gabungan anda membentuk kerajaan negeri selepas PRU atau PRN' });
    if (sw) {
      var W9 = SWk(), sb = W9 && W9.sebabPremier ? W9.sebabPremier(p) : '';
      item.push({ ok: !sb, teks: sb ? sb : 'Anda Presiden PBB' });
    } else {
      var ada = false; try { var s0 = NG && NG.status ? NG.status(p) : null; ada = !!(s0 && s0.bp && s0.bp.pengerusi && s0.bp.pengerusi.pemain); } catch (e) { ada = false; }
      item.push({ ok: ada, teks: ada ? 'Anda Pengerusi Badan Perhubungan Negeri' : 'Anda Pengerusi Badan Perhubungan Negeri: lobi di kad Negeri (tab Profil) selepas pemilihan Pusat' });
    }
    var semua = item.every(function (x) { return x.ok; }), mb = (k.lobi || k.mbTertunda) && !k.hasGovernmentRole ? maklumatMB(p) : null;
    return { label: label, negeri: p.negeri || '', item: item, semua: semua, sedia: !!(mb && mb.boleh), peluang: mb ? mb.peluang : null, sendiri: !!(mb && mb.sendiri) };
  }
  function lantikDi(p, k, tahap, nama, log) {
    k.mbTertunda = false; k.hasGovernmentRole = true; k.roleLevel = tahap; k.portfolioName = nama; k.portfolioId = tahap === 'MENTERI_BESAR' && !SW(p.parti) && !SB(p) ? PORTFOLIO_MB.id : '';   // v13.81: KM Sabah mendapat Pejabat Ketua Menteri   // v13.69: MB/KM pegang portfolio 1 k.governanceRating = CONFIG.RATING_AWAL; k.tekananPolitik = CONFIG.TEKANAN_AWAL;
    k.bulanBerjawatan = 0; k.ratingRendah = 0; k.lobi = null; k.acara = null;
    k.popularitiNasional = CONFIG.POP_AWAL; k.risikoRombak = 0; k.ratingLalu = CONFIG.RATING_AWAL; k.cdfBaki = CONFIG.CDF.BULANAN[tahap]; k.cdfBulan = 0; k.cdfJumlah = 0;
    k.sejarah = (k.sejarah || []).concat([{ tahun: p.tahun, bulan: p.bulan, nama: nama, hasil: 'dilantik' }]).slice(-10);
    return simpan(k, {}, { log: { tindakan: log, nama: 'Dilantik: ' + nama, peringkat: 'ahli' } });
  }
  /** v13.53: lantikan terus Timbalan Menteri (BERJASA: tawaran sokongan Penentu kerajaan diterima). */
  function lantikTM(nama) { var p = S().loadPlayer(), k = getKabinet(p); if (k.hasGovernmentRole) { return { ok: false, ralat: 'Sudah memegang jawatan kerajaan.' }; } var r = lantikDi(p, k, 'TIMBALAN_MENTERI', nama || TAHAP.TIMBALAN_MENTERI.nama, 'lantik_tm'); return { ok: !!(r && r.ok), ralat: r && r.ralat }; }
  /** Tuntut Menteri Besar (v13.41: tiada kos AP atau Dana; angkat sumpah tidak boleh tersekat kerana AP habis). Majoriti sendiri = terus; gabungan = peluang. Gagal: hubungan gabungan -10 dan EXCO Kanan. */
  function tuntutMB(o) {
    var p = S().loadPlayer(), k = getKabinet(p), sy = syaratMB(p), r = rng(o);
    if (!sy.boleh) { return { ok: false, ralat: sy.sebab }; }
    var m = maklumatMB(p), lulus = m.sendiri || r() < peluangMB(p), PR = modul('MyPolitikPRU', 'pru.js');
    if (lulus) {
      var res = lantikDi(p, k, 'MENTERI_BESAR', m.label + ' ' + (p.negeri || ''), 'lantik_mb');
      return { ok: !!(res && res.ok), dilantik: true, mesej: 'Dilantik sebagai ' + m.label + (p.negeri ? ' ' + p.negeri : '') + '. Elaun bulanan bermula.' };
    }
    if (PR && PR.getPRU) { var pru = PR.getPRU(p); pru.hubunganGabungan = clamp((Number(pru.hubunganGabungan) || 50) - 10, 0, 100); S().applyEffects({}, { kiraTindakan: false, patch: { pru: pru } }); }
    p = S().loadPlayer(); k = getKabinet(p);
    var kn = SW(p.parti) ? 'Menteri Kanan' : 'EXCO Kanan', rs = lantikDi(p, k, 'EXCO_NEGERI', kn, 'lantik_exco_kanan');
    return { ok: !!(rs && rs.ok), dilantik: false, mesej: 'Rakan gabungan menolak tuntutan ' + m.label + '. Hubungan gabungan -10 dan anda ditawarkan ' + kn + '.' };
  }
  /** Terima terus EXCO Kanan tanpa menuntut (tiada risiko). */
  function terimaExcoKanan() {
    var p = S().loadPlayer(), k = getKabinet(p), sy = syaratMB(p);
    if (!sy.boleh) { return { ok: false, ralat: sy.sebab }; }
    var kn = SW(p.parti) ? 'Menteri Kanan' : 'EXCO Kanan', res = lantikDi(p, k, 'EXCO_NEGERI', kn, 'lantik_exco_kanan');
    return { ok: !!(res && res.ok), mesej: 'Dilantik sebagai ' + kn + '. Elaun bulanan bermula.' };
  }
  function lepaskanLobi() {
    var p = S().loadPlayer(), k = getKabinet(p);
    if (!k.lobi) { return { ok: false }; }
    k.lobi = null;
    return { ok: !!simpan(k, {}, { log: { tindakan: 'lobi_lepas', nama: 'Tidak melobi portfolio', peringkat: 'ahli' } }).ok };
  }

  /* ---------- Tadbir urus bulanan ---------- */
  function laras(d) {
    var p = S() && S().loadPlayer();
    if (!p) { return { ok: false }; }
    var k = getKabinet(p);
    if (!k.hasGovernmentRole) { return { ok: false }; }
    k.governanceRating = clamp(k.governanceRating + (d.rating || 0), 0, 100);
    k.tekananPolitik = clamp(k.tekananPolitik + (d.tekanan || 0), 0, 100);
    if (d.pop) { k.popularitiNasional = clamp(k.popularitiNasional + d.pop, 0, 100); }          // v7.55: Dewan Rakyat
    if (d.rombak) { k.risikoRombak = clamp(k.risikoRombak + d.rombak, 0, 100); }
    simpan(k, {});
    return { ok: true };
  }
  function tamatPenggal() {
    var p = S() && S().loadPlayer();
    if (!p) { return null; }
    var k = getKabinet(p);
    if (!k.hasGovernmentRole && !k.lobi) { return null; }
    var nama = k.portfolioName;
    k.hasGovernmentRole = false; k.roleLevel = 'NONE'; k.portfolioName = ''; k.portfolioId = ''; k.acara = null; k.lobi = null; k.bulanBerjawatan = 0; k.ratingRendah = 0;
    simpan(k, {}, { log: { tindakan: 'kabinet_tamat', nama: 'Penggal tamat' + (nama ? ': ' + nama : ''), peringkat: 'ahli' } });
    return { mesej: nama ? 'Parlimen/Dewan dibubarkan. Jawatan ' + nama + ' tamat bersama penggal.' : '' };
  }
  function jana(k, o) {
    var r = rng(o);
    if (r() > CONFIG.PELUANG_ACARA) { return null; }
    var dilema = ACARA.filter(function (a) { return a.dilema; }), biasa = ACARA.filter(function (a) { return !a.dilema; });
    var kolam = r() < CONFIG.DILEMA_PELUANG ? dilema : biasa;
    return { id: kolam[Math.floor(r() * kolam.length)].id };
  }
  /* ---------- KPI ---------- */
  function labelKPI(n) { return n >= 80 ? 'Cemerlang' : n >= 60 ? 'Baik' : n >= 40 ? 'Sederhana' : n >= CONFIG.RATING_RENDAH ? 'Lemah' : 'Kritikal'; }
  function gugurkan(p, k, sebab) {
    var nama = k.portfolioName;
    k.sejarah = (k.sejarah || []).concat([{ tahun: p.tahun, bulan: p.bulan, nama: nama, hasil: 'digugurkan' }]).slice(-10);
    k.hasGovernmentRole = false; k.roleLevel = 'NONE'; k.portfolioName = ''; k.portfolioId = ''; k.bulanBerjawatan = 0; k.ratingRendah = 0; k.acara = null; k.risikoRombak = 0; k.cdfBaki = 0; k.cdfBulan = 0;
    simpan(k, { reputasi: CONFIG.ROMBAK.reputasi }, { log: { tindakan: 'rombakan', nama: 'Rombakan kabinet: digugurkan daripada ' + nama, peringkat: 'ahli' } });
    return { jenis: 'kabinet_rombak', mesej: 'Rombakan kabinet! ' + sebab + ' Anda digugurkan daripada ' + nama + '. Elaun dihentikan dan Reputasi -5.' };
  }
  /** v8.0: tamatkan jawatan kerajaan tanpa penalti tambahan (cth. dipecat daripada parti). Pulang { mesej } atau null. */
  function lucutJawatan(sebab) {
    var p = S() && S().loadPlayer();
    if (!p) { return null; }
    var k = getKabinet(p);
    if (!k.hasGovernmentRole && !k.lobi) { return null; }
    var adaJawatan = k.hasGovernmentRole, nama = k.portfolioName;
    if (nama) { k.sejarah = (k.sejarah || []).concat([{ tahun: p.tahun, bulan: p.bulan, nama: nama, hasil: 'dilucut' }]).slice(-10); }
    k.hasGovernmentRole = false; k.roleLevel = 'NONE'; k.portfolioName = ''; k.portfolioId = ''; k.acara = null; k.lobi = null; k.bulanBerjawatan = 0; k.ratingRendah = 0; k.risikoRombak = 0; k.cdfBaki = 0; k.cdfBulan = 0;
    simpan(k, {}, { log: { tindakan: 'kabinet_lucut', nama: adaJawatan ? 'Jawatan kerajaan dilucutkan' + (nama ? ': ' + nama : '') : 'Lobi portfolio ditutup', peringkat: 'ahli' } });
    if (!adaJawatan) { return null; }                                          // hanya lobi terbuka: ditutup tanpa makluman
    return { jenis: 'kabinet_rombak', mesej: (sebab || 'Jawatan kerajaan anda ditamatkan.') + (nama ? ' Anda tidak lagi memegang jawatan ' + nama + '.' : '') };
  }
  function prosesBulan(o) {
    var p = S() && S().loadPlayer(), ev = [];
    if (!p || p.tamat) { return { peristiwa: ev }; }
    var k = getKabinet(p);
    if (!k.hasGovernmentRole) { return { peristiwa: ev }; }
    var tahap = TAHAP[k.roleLevel], kes = { myr: tahap.elaun.myr, ip: tahap.elaun.ip };
    var cdf = CONFIG.CDF, cdfHad = cdf.BULANAN[k.roleLevel] * cdf.TOPI_BULAN;
    k.bulanBerjawatan += 1; k.ratingLalu = k.governanceRating; k.cdfBulan = 0;
    if (k.cdfBaki >= cdfHad) { k.governanceRating = clamp(k.governanceRating + cdf.TERSADAI_RATING, 0, 100); ev.push({ jenis: 'kabinet', mesej: 'Peruntukan projek (CDF) tersadai tanpa digunakan (Tadbir Urus ' + cdf.TERSADAI_RATING + '%).' }); }
    else { k.cdfBaki = Math.min(cdfHad, k.cdfBaki + cdf.BULANAN[k.roleLevel]); }
    k.popularitiNasional = k.popularitiNasional + Math.sign(CONFIG.POP_AWAL - k.popularitiNasional);          // populariti beransur pulih ke 50
    k.risikoRombak = clamp(k.risikoRombak - CONFIG.ROMBAK_SUSUT + (k.popularitiNasional < CONFIG.POP_RENDAH ? CONFIG.ROMBAK_POP_RENDAH : 0), 0, 100);
    kes.ip += clamp(Math.round((k.popularitiNasional - CONFIG.POP_AWAL) / CONFIG.POP_IP_BAGI), CONFIG.POP_IP_MIN, CONFIG.POP_IP_MAKS);
    if (k.acara) {                                                   // acara bulan lepas tidak dijawab: dianggap berdiam diri
      k.governanceRating = clamp(k.governanceRating - 6, 0, 100); k.tekananPolitik = clamp(k.tekananPolitik + 10, 0, 100);
      ev.push({ jenis: 'kabinet', mesej: 'Isu kementerian tidak dijawab: dianggap berdiam diri (Tadbir Urus -6%, Tekanan +10).' });
      k.acara = null;
    }
    k.tekananPolitik = clamp(k.tekananPolitik - CONFIG.TEKANAN_SUSUT, 0, 100);
    if (k.tekananPolitik >= CONFIG.TEKANAN_TINGGI) { k.governanceRating = clamp(k.governanceRating - 3, 0, 100); ev.push({ jenis: 'kabinet', mesej: 'Tekanan politik tinggi menjejas penarafan anda (-3%).' }); }
    if (k.governanceRating < CONFIG.RATING_RENDAH) { k.ratingRendah += 1; } else { k.ratingRendah = 0; }
    if (k.ratingRendah >= CONFIG.BULAN_RENDAH_ROMBAK) {
      ev.push(gugurkan(p, k, 'Penarafan tadbir urus terlalu rendah.'));
      return { peristiwa: ev };
    }
    if (k.risikoRombak >= CONFIG.ROMBAK_AMBANG && rng(o)() < clamp((k.risikoRombak - 50) / 100, CONFIG.ROMBAK_PELUANG_MIN, CONFIG.ROMBAK_PELUANG_MAKS)) {
      ev.push(gugurkan(p, k, 'Risiko rombakan memuncak akibat keputusan politik anda.'));
      return { peristiwa: ev };
    }
    else if (k.risikoRombak >= CONFIG.ROMBAK_AMBANG) { ev.push({ jenis: 'kabinet', mesej: 'Desas-desus rombakan kabinet semakin kuat (risiko ' + Math.round(k.risikoRombak) + '%).' }); }
    k.acara = jana(k, o);
    var ipE = kes.ip; delete kes.ip;
    var res = simpan(k, kes, { patch: { ip: Math.max(0, (Number(p.ip) || 0) + ipE) }, log: { tindakan: 'elaun_kerajaan', nama: 'Elaun ' + tahap.nama + ': +RM ' + tahap.elaun.myr + ', +' + tahap.elaun.ip + ' IP', peringkat: 'bulan' } });
    if (k.acara) { ev.push({ jenis: 'kabinet_acara', mesej: 'Isu kementerian baharu menunggu keputusan anda.' }); }
    return { peristiwa: ev };
  }
  function acaraSemasa(p) {
    var k = getKabinet(p);
    if (!k.hasGovernmentRole || !k.acara) { return null; }
    var d = acaraId(k.acara.id);
    if (!d) { return null; }
    var Sv = S(), papar = function (k) { return k && Sv.kesanPapar ? Sv.kesanPapar(p, k) : (k || null); };     // v8.0: kos ikut tahap kesukaran
    return { id: d.id, ikon: d.ikon, tajuk: d.tajuk, huraian: d.huraian, pilihan: d.pilihan.map(function (c) {
      var kos = kosMaksAcara(c), boleh = !kos || (Sv.cukupDana ? Sv.cukupDana(p, kos) : (Number(p.myr) || 0) >= kos);
      return { id: c.id, label: c.label, kesan: papar(c.kesan), rawak: c.rawak ? { p: c.rawak.p, jaya: papar(c.rawak.jaya), gagal: papar(c.rawak.gagal) } : null, boleh: boleh, sebab: boleh ? '' : (Sv.ralatDana ? Sv.ralatDana(p, kos) : 'Dana tidak cukup.') };
    }) };
  }
  /** v8.0: kos MYR terbesar yang mungkin bagi satu pilihan acara (termasuk kedua-dua hasil rawak). */
  function kosMaksAcara(c) {
    var k = [c.kesan, c.rawak && c.rawak.jaya, c.rawak && c.rawak.gagal].reduce(function (m, x) { return x && x.myr < 0 ? Math.max(m, -x.myr) : m; }, 0);
    return k;
  }
  function jawabAcara(pilihanId, o) {
    var p = S().loadPlayer(), k = getKabinet(p), r = rng(o);
    if (!k.hasGovernmentRole || !k.acara) { return { ok: false, ralat: 'Tiada isu menunggu.' }; }
    var d = acaraId(k.acara.id), c = d && d.pilihan.filter(function (x) { return x.id === pilihanId; })[0];
    if (!c) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    var kosMaks = kosMaksAcara(c);
    if (kosMaks && S().cukupDana && !S().cukupDana(p, kosMaks)) { return { ok: false, ralat: S().ralatDana(p, kosMaks) }; }   // v8.0: semak sebelum lambungan rawak
    var kes = {}, patch = {}, mesej = c.label + '.', jaya = null, x;
    if (c.rawak) { jaya = r() < c.rawak.p; x = jaya ? c.rawak.jaya : c.rawak.gagal; mesej += jaya ? ' Berjaya!' : ' Gagal.'; } else { x = c.kesan || {}; }
    if (x.myr) { kes.myr = x.myr; }
    var ipX = x.ip || 0;
    if (x.rep) { kes.reputasi = x.rep; }
    k.governanceRating = clamp(k.governanceRating + (x.rating || 0), 0, 100);
    k.tekananPolitik = clamp(k.tekananPolitik + (x.tekanan || 0), 0, 100);
    k.popularitiNasional = clamp(k.popularitiNasional + (x.pop || 0), 0, 100);
    k.risikoRombak = clamp(k.risikoRombak + (x.rombak || 0), 0, 100);
    if (c.etika) { var Et = ET(); if (Et && Et.selepasAcara) { var eo = Et.selepasAcara(p, c.etika, { rng: r }); patch.etika = eo.etika; if (eo.mesej) { mesej += eo.mesej; } } }
    k.acara = null;
    if (ipX) { patch.ip = Math.max(0, (Number(p.ip) || 0) + ipX); }
    var res = simpan(k, kes, { patch: patch, log: { tindakan: 'acara_kabinet', nama: d.tajuk + ': ' + c.label, peringkat: 'ahli' } });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    var rIg = (c.id === 'pintas' ? 12 : 0) + (c.etika && c.etika.risiko > 0 ? Math.round(c.etika.risiko * 1.5) : 0);
    if (rIg > 0 && root.MyPolitikIntegriti) { root.MyPolitikIntegriti.tambahRisiko(rIg, c.label); }     // v7.58: jalan pintas menaikkan governanceRisk
    if (x.stress) { var s = ST(); if (s && s.laras) { s.laras({ stress: x.stress }); } }
    return { ok: true, mesej: mesej, rating: x.rating || 0, tekanan: x.tekanan || 0, pop: x.pop || 0, rombak: x.rombak || 0, jaya: jaya };
  }

  /* ---------- Peruntukan Projek Pembangunan (CDF) ---------- */
  function pilihanCDF(p) {
    var k = getKabinet(p), c = CONFIG.CDF;
    return c.PILIHAN.map(function (n) {
      var sebab = !k.hasGovernmentRole ? 'Tiada jawatan kerajaan.' : k.cdfBulan >= c.HAD_KALI ? 'Had ' + c.HAD_KALI + ' kali sebulan dicapai.' : n > k.cdfBaki ? 'Baki peruntukan tidak cukup.' : '';
      return { jumlah: n, ip: Math.round(n / c.RM_SEIP), besar: n > c.KECIL, boleh: !sebab, sebab: sebab };
    });
  }
  function salurCDF(jumlah, o) {
    var p = S().loadPlayer(), k = getKabinet(p), c = CONFIG.CDF, pil = pilihanCDF(p).filter(function (x) { return x.jumlah === Number(jumlah); })[0];
    if (!pil) { return { ok: false, ralat: 'Jumlah tidak sah.' }; }
    if (!pil.boleh) { return { ok: false, ralat: pil.sebab }; }
    k.cdfBaki -= pil.jumlah; k.cdfBulan += 1; k.cdfJumlah = (k.cdfJumlah || 0) + pil.jumlah;
    var kes = {}, mesej = 'RM ' + pil.jumlah.toLocaleString('ms-MY') + ' disalurkan ke kawasan anda: IP +' + pil.ip + '.';
    if (pil.besar) {
      k.governanceRating = clamp(k.governanceRating + c.RATING_BESAR, 0, 100); k.tekananPolitik = clamp(k.tekananPolitik + c.TEKANAN_BESAR, 0, 100); k.risikoRombak = clamp(k.risikoRombak + c.ROMBAK_BESAR, 0, 100);
      mesej += ' Peruntukan besar menjolok mata (Tadbir Urus ' + c.RATING_BESAR + '%, risiko rombakan +' + c.ROMBAK_BESAR + ').';
    }
    var res = simpan(k, kes, { patch: { ip: Math.max(0, (Number(p.ip) || 0) + pil.ip) }, log: { tindakan: 'cdf_salur', nama: 'Peruntukan CDF RM ' + pil.jumlah + ' ke kawasan: +' + pil.ip + ' IP', peringkat: 'ahli' } });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    if (pil.besar && root.MyPolitikIntegriti) { root.MyPolitikIntegriti.tambahRisiko(5, 'peruntukan CDF besar tanpa tatacara ketat'); }          // v7.58
    return { ok: true, mesej: mesej, ip: pil.ip, jumlah: pil.jumlah };
  }

  /* ---------- v13.40: Lobi Timbalan Perdana Menteri (maklum balas borang baris 23, mockup dipersetujui) ----------
     Timbalan Presiden parti (DAP: Pengerusi Kebangsaan), Ahli Parlimen, lobi kerajaan persekutuan dibuka, tiada jawatan kerajaan.
     ANDAIAN: kos 3 AP + RM 20,000 + 400 IP; peluang asas 60% jika PM dari parti sendiri, 30% jika PM dari rakan gabungan;
     Reputasi +/-10%, hubungan gabungan +/-10%, IP melebihi 400: +1% setiap 50 IP (maks. +10%). Gagal: separuh kos hilang; sekali bagi setiap lobi. */
  var TPM = { ap: 0, myr: 20000, ip: 400, asasSendiri: 0.6, asasRakan: 0.3, min: 0.05, maks: 0.9 };
  function statusMP(p) { var PR = modul('MyPolitikPRU', 'pru.js'); if (!PR || !PR.getPRU) { return null; } var pr = PR.getPRU(p); return [pr.status, pr.statusKedua].filter(function (x) { return x && x.jenis === 'MP'; })[0] || null; }
  /** PM dari parti sendiri? Hanya parti teraju gabungan; rakan gabungan yang lebih besar memegang PM (ANDAIAN). */
  function pmPartiSendiri(p) {
    var teraju = { UMNO: 1, PKR: 1, PAS: 1, PBB: 1 }; if (!p || !teraju[p.parti]) { return false; }
    var kn = p.kerusiNasional || {}, PR = modul('MyPolitikPRU', 'pru.js'), n = PR && PR.getPRU ? PR.getPRU(p).nasional : null;
    if (n && n.rakanPM) { return false; }
    var u = kn.ubah || {}, tambah = Math.max(-(Number(u.PH) || 0), -(Number(u.PN) || 0), 0);
    return !(kn.gabungan && kn.gabungan.length && tambah > (Number(kn.parti) || 0));
  }
  function syaratTPM(p) {
    var k = getKabinet(p), J = modul('MyPolitikJawatan', 'jawatan.js'), sebab = '';
    if (k.hasGovernmentRole) { sebab = 'Sudah memegang jawatan kerajaan.'; }
    else if (!k.lobi || k.lobi.sumber !== 'PARLIMEN') { sebab = 'Lobi kerajaan persekutuan tidak dibuka.'; }
    else if (!J || !J.pegang(p, 'timbalan_presiden')) { sebab = 'Hanya Timbalan Presiden parti.'; }
    else if (!statusMP(p)) { sebab = 'Anda mesti Ahli Parlimen.'; }
    else if (k.tpmCuba) { sebab = 'Lobi Timbalan Perdana Menteri sudah dicuba bagi pembentukan kerajaan ini.'; }
    return { boleh: !sebab, sebab: sebab };
  }
  function peluangTPM(p) {
    var PR = modul('MyPolitikPRU', 'pru.js'), hub = Number(PR && PR.getPRU ? PR.getPRU(p).hubunganGabungan : 50) || 50, ip = Number(p.ip) || 0;
    return clamp((pmPartiSendiri(p) ? TPM.asasSendiri : TPM.asasRakan) + ((Number(p.reputasi) || 50) - 50) * 0.002 + (hub - 50) * 0.002 + Math.min(0.1, Math.max(0, Math.floor((ip - TPM.ip) / 50) * 0.01)), TPM.min, TPM.maks);
  }
  function maklumatTPM(p) {
    var sy = syaratTPM(p), kosMyr = S().kosSebenar ? S().kosSebenar(p, TPM.myr) : TPM.myr, kurang = [];
    if (TPM.ap && (Number(p.ap) || 0) < TPM.ap) { kurang.push('AP tidak mencukupi (perlu ' + TPM.ap + ')'); }
    if ((Number(p.myr) || 0) < kosMyr) { kurang.push('Dana tidak cukup (perlu RM ' + kosMyr.toLocaleString('ms-MY') + ')'); }
    if ((Number(p.ip) || 0) < TPM.ip) { kurang.push('IP tidak cukup (perlu ' + TPM.ip + ')'); }
    return { layak: sy.boleh, boleh: sy.boleh && !kurang.length, sebab: sy.sebab || kurang.join('; '), peluang: Math.round(peluangTPM(p) * 100), pmSendiri: pmPartiSendiri(p), ap: TPM.ap, myr: kosMyr, ip: TPM.ip };
  }
  function lobiTPM(o) {
    var p = S().loadPlayer(), m = maklumatTPM(p), r = rng(o); if (!m.boleh) { return { ok: false, ralat: m.sebab }; }
    var lulus = r() < peluangTPM(p), k = getKabinet(p);
    if (lulus) {
      S().applyEffects({ ap: -TPM.ap, myr: -m.myr, ip: -TPM.ip }, { kiraTindakan: false }); p = S().loadPlayer(); k = getKabinet(p);
      var res = lantikDi(p, k, 'TIMBALAN_PM', TAHAP.TIMBALAN_PM.nama, 'lantik_tpm');
      return { ok: !!(res && res.ok), dilantik: true, mesej: 'Dilantik sebagai Timbalan Perdana Menteri. Elaun bulanan bermula.' };
    }
    k.tpmCuba = true;
    var rs = simpan(k, { ap: -TPM.ap, myr: -Math.round(m.myr / 2), ip: -Math.round(TPM.ip / 2) }, { log: { tindakan: 'lobi_tpm_gagal', nama: 'Lobi Timbalan Perdana Menteri gagal', peringkat: 'ahli' } });
    if (!rs.ok) { return { ok: false, ralat: rs.ralat }; }
    return { ok: true, dilantik: false, mesej: 'Lobi Timbalan Perdana Menteri gagal. Separuh kos hilang. Anda masih boleh melobi portfolio Menteri.' };
  }
  /* ---------- v13.69: Pejabat EXCO / Portfolio Saya (mockup dipersetujui) ----------
     Satu tindakan khas sebulan bagi pemegang portfolio negeri: kos 1 AP + dana; kesan pada IP, sokongan akar umbi dan KPI portfolio.
     kesan: ip, akar (kesetiaan.akarUmbi), rating, tekanan, pop, rombak, dana (pendapatan); rawak: { p, jaya, gagal }; ig = risiko integriti. ANDAIAN: semua nilai permainan. */
  var TINDAKAN_EXCO = {
    exco_tanah: [
      { id: 'geran', ikon: '📜', nama: 'Luluskan geran tanah kampung', huraian: 'Selesaikan permohonan tanah rakyat yang tertangguh bertahun-tahun.', myr: 2000, kesan: { rating: 6, akar: 4, ip: 10 } },
      { id: 'lesen', ikon: '🌲', nama: 'Semak semula lesen balak dan lombong', huraian: 'Tarik balik lesen yang melanggar syarat alam sekitar. Syarikat yang terjejas ada kawan dalam parti.', myr: 0, kesan: { rating: 8, tekanan: 6, rombak: 5 } },
      { id: 'konsesi', ikon: '💰', nama: 'Luluskan konsesi untuk tambah hasil negeri', huraian: 'Hasil negeri naik, tetapi ada pihak mendakwa konsesi diberi kepada kroni.', myr: 0, kesan: { dana: 4000, pop: -4 }, rawak: { p: 0.5, jaya: { rating: 4 }, gagal: { rating: -8, ig: 10 } } }],
    exco_ktp: [
      { id: 'rumah', ikon: '🏠', nama: 'Luluskan projek rumah mampu milik', huraian: 'Projek perumahan rakyat untuk keluarga muda di kawasan anda.', myr: 3000, kesan: { rating: 5, akar: 5, ip: 12 } },
      { id: 'bas', ikon: '🚌', nama: 'Bas awam percuma', huraian: 'Laluan bas percuma menghubungkan kampung ke bandar.', myr: 2500, kesan: { rating: 4, akar: 3, pop: 3 } },
      { id: 'bersih', ikon: '🧹', nama: 'Kempen kebersihan PBT', huraian: 'Gerakkan majlis tempatan membersihkan longkang dan tapak sampah haram.', myr: 1000, kesan: { rating: 3, akar: 2, ip: 5 } }],
    exco_luarbandar: [
      { id: 'jalanair', ikon: '🚰', nama: 'Jalan dan bekalan air kampung', huraian: 'Turap jalan tanah dan sambung paip air ke rumah penduduk.', myr: 2500, kesan: { rating: 5, akar: 5, ip: 10 } },
      { id: 'baja', ikon: '🌱', nama: 'Agihan subsidi baja dan benih', huraian: 'Bantuan input pertanian untuk pesawah dan pekebun kecil.', myr: 2000, kesan: { rating: 3, akar: 6, ip: 8 } },
      { id: 'pasar', ikon: '🧺', nama: 'Pasar tani dan stok makanan negeri', huraian: 'Pastikan bekalan makanan asas cukup dan harga terkawal.', myr: 1500, kesan: { rating: 5, pop: 2, ip: 5 } }],
    exco_kerjaraya: [
      { id: 'jalan', ikon: '🛣️', nama: 'Peruntukan jalan raya DUN', huraian: 'Baiki jalan berlubang di kawasan DUN anda.', myr: 2500, kesan: { rating: 4, akar: 5, ip: 12 } },
      { id: 'terbengkalai', ikon: '🏚️', nama: 'Selamatkan projek terbengkalai', huraian: 'Ambil alih projek yang lewat dan lantik kontraktor baharu.', myr: 3000, kesan: { rating: 8, tekanan: 4, rombak: 3 } },
      { id: 'rundingterus', ikon: '📑', nama: 'Tender projek secara rundingan terus', huraian: 'Projek siap lebih cepat, tetapi tanpa tender terbuka.', myr: 0, kesan: { ip: 15, akar: 2 }, rawak: { p: 0.5, jaya: { rating: 2 }, gagal: { rating: -10, pop: -4, ig: 12 } } }],
    exco_agama: [
      { id: 'surau', ikon: '🕌', nama: 'Baik pulih surau dan masjid', huraian: 'Peruntukan membaiki surau dan masjid usang di kawasan anda.', myr: 2000, kesan: { rating: 4, akar: 6, ip: 8 } },
      { id: 'kafa', ikon: '📖', nama: 'Elaun imam dan guru KAFA', huraian: 'Naikkan elaun imam, bilal dan guru KAFA negeri.', myr: 2500, kesan: { rating: 5, akar: 4, pop: 2 } },
      { id: 'adat', ikon: '🎖️', nama: 'Majlis adat dan istiadat negeri', huraian: 'Anjurkan majlis adat bersama istana dan pembesar negeri.', myr: 1500, kesan: { rating: 2, ip: 15 } }],
    exco_pelaburan: [
      { id: 'misi', ikon: '✈️', nama: 'Misi pelaburan luar negara', huraian: 'Bawa pelabur asing melihat tapak industri negeri.', myr: 3000, kesan: { rating: 5, ip: 15, pop: 2 } },
      { id: 'pks', ikon: '🏪', nama: 'Geran PKS tempatan', huraian: 'Geran kecil untuk peniaga dan usahawan tempatan.', myr: 2000, kesan: { rating: 3, akar: 5, ip: 8 } },
      { id: 'taman', ikon: '🏭', nama: 'Buka taman perindustrian baharu', huraian: 'Kawasan industri membuka peluang kerja, tetapi ada bantahan penduduk.', myr: 2500, kesan: { rating: 6, akar: -2, ip: 12, tekanan: 3 } }],
    exco_pelancongan: [
      { id: 'festival', ikon: '🎪', nama: 'Festival budaya negeri', huraian: 'Pesta budaya yang menarik pelancong dan peniaga kecil.', myr: 2500, kesan: { rating: 4, akar: 3, ip: 10 } },
      { id: 'warisan', ikon: '🏛️', nama: 'Baik pulih tapak warisan', huraian: 'Pulihara bangunan dan tapak bersejarah negeri.', myr: 2000, kesan: { rating: 5, pop: 2, ip: 5 } },
      { id: 'promosi', ikon: '📣', nama: 'Kempen promosi pelancongan', huraian: 'Promosi di media sosial dan pameran pelancongan.', myr: 1500, kesan: { rating: 3, ip: 8 } }],
    exco_belia: [
      { id: 'sukan', ikon: '🏆', nama: 'Kejohanan sukan belia', huraian: 'Kejohanan antara kampung yang menghimpun anak muda.', myr: 2000, kesan: { rating: 3, akar: 5, ip: 8 } },
      { id: 'ngo', ikon: '🤝', nama: 'Geran NGO', huraian: 'Geran kecil untuk NGO kebajikan dan alam sekitar.', myr: 1500, kesan: { rating: 4, akar: 3, ip: 6 } },
      { id: 'usahawan', ikon: '💡', nama: 'Program keusahawanan belia', huraian: 'Latihan dan modal permulaan untuk usahawan muda.', myr: 2500, kesan: { rating: 5, akar: 3, pop: 2 } }],
    exco_kebajikan: [
      { id: 'warga', ikon: '👵', nama: 'Bantuan bulanan warga emas', huraian: 'Bantuan tunai bulanan untuk warga emas berpendapatan rendah.', myr: 2500, kesan: { rating: 4, akar: 6, ip: 8 } },
      { id: 'taska', ikon: '🧸', nama: 'Taska komuniti', huraian: 'Taska murah untuk ibu bekerja di kawasan anda.', myr: 2000, kesan: { rating: 5, akar: 3, pop: 2 } },
      { id: 'wanita', ikon: '👩‍💼', nama: 'Geran usahawan wanita', huraian: 'Geran untuk ibu tunggal dan suri rumah memulakan perniagaan.', myr: 1500, kesan: { rating: 3, akar: 4, ip: 6 } }],
    exco_pendidikan: [
      { id: 'biasiswa', ikon: '🎓', nama: 'Biasiswa negeri', huraian: 'Biasiswa untuk pelajar cemerlang dari keluarga miskin.', myr: 2500, kesan: { rating: 5, akar: 4, ip: 8 } },
      { id: 'tuisyen', ikon: '📚', nama: 'Pusat tuisyen rakyat', huraian: 'Kelas tuisyen percuma untuk calon peperiksaan.', myr: 1500, kesan: { rating: 3, akar: 5, ip: 6 } },
      { id: 'tvet', ikon: '🛠️', nama: 'Latihan kemahiran (TVET)', huraian: 'Latihan kemahiran untuk belia yang tercicir sekolah.', myr: 2000, kesan: { rating: 5, pop: 2, ip: 6 } }]
  };
  var EXCO_TINDAKAN_AP = 1;
  function idxBulan(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  /** Status kepimpinan negeri (dikira daripada p.kabinet supaya tidak bercanggah). */
  function kepimpinanNegeri(p) {
    var k = getKabinet(p), d = k.portfolioId ? cariPortfolio(k.portfolioId) : null, ldr = !!(k.hasGovernmentRole && k.roleLevel === 'MENTERI_BESAR');
    var negeri = !!(d && (d === PORTFOLIO_MB || PORTFOLIO.DUN.indexOf(d) >= 0 || PORTFOLIO.SARAWAK.indexOf(d) >= 0 || PORTFOLIO.SABAH.indexOf(d) >= 0));
    return { isStateLeader: ldr, stateExcoPortfolio: k.hasGovernmentRole && negeri ? String(d.nama).replace(/^EXCO /, '') : '', portfolioId: negeri ? d.id : '' };
  }
  function pejabatEXCO(p) {
    var k = getKabinet(p), kn = kepimpinanNegeri(p), dk = kn.portfolioId ? cariPortfolio(kn.portfolioId) : null, senarai = TINDAKAN_EXCO[(dk && dk.tindakan) || kn.portfolioId];   // v13.81: Sabah kongsi set tindakan
    if (!k.hasGovernmentRole || !senarai) { return null; }
    var sudah = k.excoTindakan === idxBulan(p), d = cariPortfolio(kn.portfolioId);
    return { portfolioId: kn.portfolioId, nama: kn.stateExcoPortfolio, ikon: d.ikon || '🏛️', sudah: sudah, ap: EXCO_TINDAKAN_AP,
      tindakan: senarai.map(function (t) {
        var kos = t.myr && S().kosSebenar ? S().kosSebenar(p, t.myr) : (t.myr || 0), sebab = sudah ? 'Tindakan khas bulan ini sudah dibuat.' : (Number(p.ap) || 0) < EXCO_TINDAKAN_AP ? 'AP tidak mencukupi.' : (Number(p.myr) || 0) < kos ? 'Dana tidak cukup.' : '';
        return { id: t.id, ikon: t.ikon, nama: t.nama, huraian: t.huraian, myr: kos, kesan: t.kesan, rawak: t.rawak || null, boleh: !sebab, sebab: sebab };
      }) };
  }
  function tindakanEXCO(id, o) {
    var p = S().loadPlayer(), k = getKabinet(p), pj = pejabatEXCO(p), r = rng(o);
    if (!pj) { return { ok: false, ralat: 'Anda tidak memegang portfolio negeri.' }; }
    var t = pj.tindakan.filter(function (x) { return x.id === id; })[0];
    if (!t) { return { ok: false, ralat: 'Tindakan tidak sah.' }; }
    if (!t.boleh) { return { ok: false, ralat: t.sebab }; }
    var x = {}, f, jaya = null;
    for (f in t.kesan) { x[f] = t.kesan[f]; }
    if (t.rawak) { jaya = r() < t.rawak.p; var tb = jaya ? t.rawak.jaya : t.rawak.gagal; for (f in tb) { x[f] = (x[f] || 0) + tb[f]; } }
    k.governanceRating = clamp(k.governanceRating + (x.rating || 0), 0, 100); k.tekananPolitik = clamp(k.tekananPolitik + (x.tekanan || 0), 0, 100);
    k.popularitiNasional = clamp(k.popularitiNasional + (x.pop || 0), 0, 100); k.risikoRombak = clamp(k.risikoRombak + (x.rombak || 0), 0, 100);
    k.excoTindakan = idxBulan(p);
    var kes = { ap: -EXCO_TINDAKAN_AP, myr: (x.dana || 0) - (t.myr || 0) };
    if (x.ip) { kes.ip = x.ip; }
    if (x.akar) { kes.kesetiaan = { akarUmbi: x.akar }; }
    var res = simpan(k, kes, { log: { tindakan: 'exco_tindakan', nama: t.nama, peringkat: 'ahli' } });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    if (x.ig && root.MyPolitikIntegriti) { root.MyPolitikIntegriti.tambahRisiko(x.ig, t.nama); }
    var bh = [];
    if (x.rating) { bh.push('KPI ' + (x.rating > 0 ? '+' : '') + x.rating); } if (x.ip) { bh.push('IP ' + (x.ip > 0 ? '+' : '') + x.ip); } if (x.akar) { bh.push('Akar umbi ' + (x.akar > 0 ? '+' : '') + x.akar); }
    if (x.dana) { bh.push('Dana +RM ' + x.dana.toLocaleString('ms-MY')); } if (x.pop) { bh.push('Populariti ' + (x.pop > 0 ? '+' : '') + x.pop); }
    if (x.tekanan) { bh.push('Tekanan politik +' + x.tekanan); } if (x.rombak) { bh.push('Risiko rombakan +' + x.rombak); } if (x.ig) { bh.push('Risiko integriti +' + x.ig); }
    return { ok: true, jaya: jaya, mesej: (jaya === false ? 'Timbul dakwaan salah guna kuasa: ' : 'Dilaksanakan: ') + t.nama + '. ' + bh.join(' · ') + '.' };
  }

  function ringkasan(p) {
    var k = getKabinet(p), t = TAHAP[k.roleLevel] || null;
    return { hasGovernmentRole: k.hasGovernmentRole, roleLevel: k.roleLevel, tahapNama: t ? namaTahap(p, k.roleLevel) : '', portfolioName: k.portfolioName, governanceRating: k.governanceRating,
      tekananPolitik: k.tekananPolitik, elaun: t ? t.elaun : null, bulanBerjawatan: k.bulanBerjawatan, ratingRendah: k.ratingRendah, lobi: k.lobi, acara: acaraSemasa(p),
      sejarah: k.sejarah, portfolio: senaraiPortfolio(p),
      kpiLabel: labelKPI(k.governanceRating), ratingLalu: k.ratingLalu, arah: k.governanceRating - k.ratingLalu, popularitiNasional: k.popularitiNasional, risikoRombak: k.risikoRombak,
      cdfBaki: k.cdfBaki, cdfBulan: k.cdfBulan, cdfHad: CONFIG.CDF.HAD_KALI, cdfPilihan: pilihanCDF(p), mb: k.lobi || k.mbTertunda ? maklumatMB(p) : null, tpm: k.lobi ? maklumatTPM(p) : null, mbTertunda: !!k.mbTertunda,
      isStateLeader: kepimpinanNegeri(p).isStateLeader, stateExcoPortfolio: kepimpinanNegeri(p).stateExcoPortfolio, pejabat: pejabatEXCO(p) };   // v13.69
  }

  return {
    CONFIG: CONFIG, TAHAP: TAHAP, PORTFOLIO: PORTFOLIO, ACARA: ACARA, SB: SB, SW: SW, PORTFOLIO_MB: PORTFOLIO_MB, TINDAKAN_EXCO: TINDAKAN_EXCO, cariPortfolio: cariPortfolio, bolehAgama: bolehAgama,
    kepimpinanNegeri: kepimpinanNegeri, pejabatEXCO: pejabatEXCO, tindakanEXCO: tindakanEXCO,
    setRng: function (f) { rngLalai = f || Math.random; },
    getKabinet: getKabinet, lantikKanan: lantikKanan, lantikTM: lantikTM, syaratMB: syaratMB, syaratTPM: syaratTPM, peluangTPM: peluangTPM, maklumatTPM: maklumatTPM, lobiTPM: lobiTPM, pmPartiSendiri: pmPartiSendiri, TPM: TPM, bukaLobi: bukaLobi, senaraiPortfolio: senaraiPortfolio, lobiPortfolio: lobiPortfolio, lepaskanLobi: lepaskanLobi, maklumatMB: maklumatMB, semakMB: semakMB, tuntutMB: tuntutMB, terimaExcoKanan: terimaExcoKanan, salurCDF: salurCDF, pilihanCDF: pilihanCDF, labelKPI: labelKPI,
    laras: laras, tamatPenggal: tamatPenggal, lucutJawatan: lucutJawatan, prosesBulan: prosesBulan, acaraSemasa: acaraSemasa, jawabAcara: jawabAcara, ringkasan: ringkasan
  };
});
