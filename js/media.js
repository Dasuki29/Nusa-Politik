/* ==========================================================================
   Nusa Politik — js/media.js   (v7.59)
   Jentera Media Digital & Komunikasi Awam (Digital Communications Engine).
     1. digitalFleetManagement: Skuad Penerangan Digital. Pemain memperuntukkan Dana (MYR) pada tiga peringkat
        (Asas / Sederhana / Besar) bagi tiga tugas:
          - naratif    : Persetujuan Naratif / Penjelasan Isu   -> kurangkan Persepsi Negatif secara berfakta
          - infografik : Kempen Infografik & Pencapaian Parti   -> naikkan Sokongan Belia
          - komuniti   : Gelombang Komuniti Digital (musim PRU) -> kesedaran manifesto + sokongan pengundi semasa kempen
     2. pressConferenceMiniGame: Sidang Media Rasmi / Temu Bual TV / Siaran Langsung Dalam Talian muncul secara rawak.
        3 soalan wartawan; setiap soalan dijawab dengan
          - 'berfakta' : Berfakta & Diplomatis -> +IP, +Integriti Parti (lebih berkesan untuk soalan teknikal)
          - 'populis'  : Populis & Lantang     -> +IP besar, akar umbi naik drastik, +Stress; berisiko serang balas / perdebatan terbuka
   State: p.media = { persepsi, belia, kesedaran, terakhir:{tugas:idx}, sidang, sidangTerakhir, sejarah }.
   Disambung ke: Integriti (MyPolitikIntegriti.ubahSkor), Stress (MyPolitikStres.laras), PRU (a.voterSupport semasa kempen), Etika.
   ANDAIAN: 'Dana' ialah p.myr (Dana pemain). Semua angka ialah penyeimbang simulasi, bukan data sebenar.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikMedia = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function ET() { return modul('MyPolitikEtika', 'etika.js'); }
  function ST() { return modul('MyPolitikStres', 'stress.js'); }
  function IG() { return modul('MyPolitikIntegriti', 'integriti.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  var rngLalai = null;
  function rng(o, p) { return (o && o.rng) || rngLalai || S().rngBerbenih(String(p && p.id) + '|' + (p && p.tahun) + '|' + (p && p.bulan) + '|media'); }

  var CONFIG = {
    PERSEPSI_AWAL: 35, BELIA_AWAL: 40, KESEDARAN_AWAL: 20,
    PERUNTUKAN: {
      asas:      { nama: 'Asas',      kos: 1000, k: 0.6 },
      sederhana: { nama: 'Sederhana', kos: 2500, k: 1.0 },
      besar:     { nama: 'Besar',     kos: 5000, k: 1.6 }
    },
    TUGAS: {
      naratif:    { nama: 'Persetujuan Naratif / Penjelasan Isu', ikon: '📰', jeda: 2, persepsi: -18, reputasi: 2, ip: 2,
                    huraian: 'Atur kenyataan media rasmi untuk menangkis persepsi negatif secara berfakta.' },
      infografik: { nama: 'Kempen Infografik & Pencapaian Parti', ikon: '📊', jeda: 2, belia: 12, akarUmbi: 2, ip: 3,
                    huraian: 'Sebarkan kejayaan dasar parti untuk menambah sokongan pengundi muda.' },
      komuniti:   { nama: 'Gelombang Komuniti Digital', ikon: '🌐', jeda: 1, kesedaran: 15, belia: 4, undi: 5, akarUmbi: 1, musim: true,
                    huraian: 'Tingkatkan kesedaran awam tentang manifesto parti semasa musim pilihan raya.' }
    },
    KREDIBILITI: { min: 0.6, maks: 1.2 },                         // pengganda kesan mengikut Integriti Parti (skor 0 hingga 100)
    PERSEPSI: { lantai: 20, susut: 2, etikaBuruk: 3, skorRendah: 2, auditTinggi: 2, tinggi: 70, kesanTinggi: { akarUmbi: -1, reputasi: -1 } },
    BELIA: { lantai: 30, susut: 1, tinggi: 70, kesanTinggi: { ip: 1 } },
    SIDANG: { peluangSarawak: 0.5, peluang: 0.18, peluangPersepsi: 0.002, peluangPRU: 0.08, jeda: 3, bilSoalan: 3, jenis: ['SIDANG', 'TV', 'ONLINE'],
              tidakJawab: { persepsi: 8, skor: -3 } },
    BERFAKTA: { ip: 4, skor: 3, reputasi: 1, padan: 1.5, tidakPadan: 0.7 },
    DIAM: { persepsi: 3 },                                                    // v12.2: Tiada komen
    SERANG: { akarUmbi: 6, reputasi: -1, lapor: 15, risiko: 5 },              // v12.2: Serang balik pembangkang (aduan Tataetika ~15%)
    POPULIS: { ip: 6, akarUmbi: 4, stress: 4, padan: 1.5, tidakPadan: 0.7,
               serangBalas: { asas: 0.30, persepsi: 0.002, tidakPadan: 0.10 }, rugi: { persepsi: 12, skor: -4, reputasi: -2 } }
  };

  var JENIS_SIDANG = {
    SIDANG: { nama: 'Sidang Media Rasmi', ikon: '🎤' },
    TV:     { nama: 'Temu Bual Eksklusif TV', ikon: '📺' },
    ONLINE: { nama: 'Siaran Langsung Dalam Talian', ikon: '💻' }
  };

  /* soalan wartawan; jenis 'fakta' = soalan teknikal/dasar, 'emosi' = soalan emosi/kontroversi */
  var SOALAN = [
    { id: 'kos_sara', jenis: 'fakta', isu: 'kos sara hidup', soal: 'Harga barang terus naik. Apa langkah konkrit parti anda untuk meringankan beban kos sara hidup rakyat?' },
    { id: 'subsidi', jenis: 'fakta', isu: 'rasionalisasi subsidi', soal: 'Ada cadangan rasionalisasi subsidi. Adakah ini beban baharu kepada golongan B40?' },
    { id: 'belanjawan', jenis: 'fakta', isu: 'peruntukan pembangunan', soal: 'Bagaimana peruntukan pembangunan di kawasan anda dibelanjakan, dan apakah ukuran kejayaannya?' },
    { id: 'pengangguran', jenis: 'fakta', isu: 'pengangguran belia', soal: 'Kadar pengangguran siswazah masih tinggi. Apa pelan parti anda untuk belia?' },
    { id: 'lompat', jenis: 'emosi', isu: 'politik lompat parti', soal: 'Ada khabar wakil rakyat bakal melompat parti. Adakah parti anda risau kerajaan tidak stabil?' },
    { id: 'tuduhan', jenis: 'emosi', isu: 'tuduhan rasuah', soal: 'Pembangkang menuduh pemimpin parti anda terlibat penyelewengan. Apa jawapan anda?' },
    { id: 'kepimpinan', jenis: 'emosi', isu: 'perpecahan dalaman', soal: 'Dikatakan wujud perpecahan dalam parti mengenai kepimpinan. Benarkah?' },
    { id: 'tular', jenis: 'emosi', isu: 'isu tular media sosial', soal: 'Satu video tular mempersoalkan sikap pemimpin parti terhadap rakyat. Apa respons anda?' },
    { id: 'gabungan', jenis: 'fakta', isu: 'rundingan gabungan', soal: 'Bagaimana parti anda menyeimbangkan kepentingan rakan gabungan dengan suara akar umbi?' },
    /* v12.2: soalan ikut konteks pemain (kump bukan 'umum'; syarat(c) dengan c = konteks(p)). {kunci} diisi daripada konteks. Semua rekaan. */
    { id: 'port_lewat', kump: 'portfolio', jenis: 'fakta', isu: 'projek kementerian', syarat: function (c) { return !!c.portfolio; }, soal: 'Beberapa projek di bawah {portfolio} lewat siap. Siapa yang bertanggungjawab?' },
    { id: 'port_bajet', kump: 'portfolio', jenis: 'fakta', isu: 'peruntukan kementerian', syarat: function (c) { return !!c.portfolio; }, soal: 'Peruntukan {portfolio} dikatakan tidak sampai kepada rakyat bawahan. Apa jawapan anda?' },
    { id: 'port_kpi', kump: 'portfolio', jenis: 'fakta', isu: 'prestasi kementerian', syarat: function (c) { return !!c.portfolio; }, soal: 'Apakah tiga pencapaian utama anda sebagai {portfolio} setakat ini?' },
    { id: 'port_rombak', kump: 'portfolio', jenis: 'emosi', isu: 'khabar rombakan kabinet', syarat: function (c) { return !!c.portfolio && !c.pm; }, soal: 'Ada khabar anda akan digugurkan dalam rombakan kabinet. Adakah anda risau?' },
    { id: 'port_kontrak', kump: 'portfolio', jenis: 'emosi', isu: 'kontrak kerajaan', syarat: function (c) { return !!c.portfolio; }, soal: 'Syarikat yang dikaitkan dengan ahli parti anda mendapat kontrak {portfolio}. Adakah ini konflik kepentingan?' },
    { id: 'kaw_jalan', kump: 'kawasan', jenis: 'fakta', isu: 'infrastruktur kawasan', syarat: function (c) { return !!c.kerusi; }, soal: 'Penduduk {kerusi} mengadu jalan rosak sejak pilihan raya lalu. Bila akan dibaiki?' },
    { id: 'kaw_janji', kump: 'kawasan', jenis: 'emosi', isu: 'janji pilihan raya', syarat: function (c) { return !!c.kerusi; }, soal: 'Pengundi {kerusi} berkata janji manifesto anda belum ditunaikan. Apa komen anda?' },
    { id: 'kaw_jarang', kump: 'kawasan', jenis: 'emosi', isu: 'kehadiran wakil rakyat', syarat: function (c) { return !!c.kerusi; }, soal: 'Ada dakwaan anda jarang turun ke {kerusi}. Benarkah?' },
    { id: 'kaw_peruntukan', kump: 'kawasan', jenis: 'fakta', isu: 'peruntukan wakil rakyat', syarat: function (c) { return !!c.kerusi; }, soal: 'Bagaimana peruntukan wakil rakyat untuk {kerusi} dibelanjakan tahun ini?' },
    { id: 'sw_ma63', kump: 'sarawak', jenis: 'fakta', isu: 'MA63', syarat: function (c) { return c.sw; }, soal: 'Sejauh mana tuntutan hak Sarawak di bawah MA63 telah dipenuhi oleh kerajaan persekutuan?' },
    { id: 'sw_royalti', kump: 'sarawak', jenis: 'emosi', isu: 'royalti minyak', syarat: function (c) { return c.sw; }, soal: 'Adakah {parti} akan terus mendesak royalti minyak 20% walaupun ditolak kerajaan pusat?' },
    { id: 'sw_inggeris', kump: 'sarawak', jenis: 'fakta', isu: 'bahasa Inggeris di sekolah', syarat: function (c) { return c.sw; }, soal: 'Apakah pendirian {parti} tentang penggunaan bahasa Inggeris untuk Sains dan Matematik di sekolah Sarawak?' },
    { id: 'sw_elektrik', kump: 'sarawak', jenis: 'fakta', isu: 'bekalan elektrik luar bandar', syarat: function (c) { return c.sw; }, soal: 'Masih ada rumah panjang tanpa bekalan elektrik 24 jam. Bila masalah ini akan selesai?' },
    { id: 'sw_jalan', kump: 'sarawak', jenis: 'fakta', isu: 'jalan Pan Borneo', syarat: function (c) { return c.sw; }, soal: 'Sebahagian jalan Pan Borneo masih belum siap dan kerap berlaku kemalangan. Apa tindakan anda?' },
    { id: 'sw_tempatan', kump: 'sarawak', jenis: 'emosi', isu: 'parti tempatan', syarat: function (c) { return c.sw; }, soal: 'Ramai pengundi Sarawak memilih parti tempatan. Adakah parti dari Semenanjung masih relevan di sini?' },
    { id: 'pem_cabar', kump: 'pemilihan', jenis: 'emosi', isu: 'pemilihan parti', syarat: function (c) { return c.pemilihan || c.rival; }, soal: 'Benarkah anda akan dicabar dalam pemilihan parti tahun ini?' },
    { id: 'pem_wang', kump: 'pemilihan', jenis: 'emosi', isu: 'politik wang', syarat: function (c) { return c.pemilihan; }, soal: 'Ada dakwaan politik wang dalam pemilihan parti. Adakah kem anda bersih?' },
    { id: 'pem_pelan', kump: 'pemilihan', jenis: 'fakta', isu: 'hala tuju parti', syarat: function (c) { return c.pemilihan; }, soal: 'Jika menang pemilihan, apakah pelan anda untuk memperkukuh parti?' },
    { id: 'ev_kalah', kump: 'peristiwa', jenis: 'emosi', isu: 'kekalahan pilihan raya', syarat: function (c) { return c.kalah; }, soal: 'Anda kalah dalam pilihan raya lalu. Adakah anda akan bertanding lagi?' },
    { id: 'ev_gantung', kump: 'peristiwa', jenis: 'emosi', isu: 'tindakan disiplin', syarat: function (c) { return c.gantung; }, soal: 'Keahlian anda sedang digantung. Adakah anda akan membuat rayuan atau keluar parti?' },
    { id: 'ev_siasat', kump: 'peristiwa', jenis: 'emosi', isu: 'siasatan disiplin', syarat: function (c) { return c.siasatan; }, soal: 'Jawatankuasa Disiplin sedang menyiasat anda. Apa sebenarnya yang berlaku?' },
    { id: 'ev_lain', kump: 'peristiwa', jenis: 'emosi', isu: 'calon dari luar', syarat: function (c) { return c.lain; }, soal: 'Pengundi tempatan mempersoalkan kenapa calon dari luar bertanding di kawasan mereka. Apa jawapan anda?' },
    { id: 'ev_jemaah', kump: 'peristiwa', jenis: 'emosi', isu: 'lantikan kabinet', syarat: function (c) { return c.jemaahPencabar; }, soal: 'Kenapa anda melantik pencabar dalaman sendiri ke dalam Jemaah Menteri? Adakah ini untuk menutup mulutnya?' },
    { id: 'ev_rombak', kump: 'peristiwa', jenis: 'emosi', isu: 'rombakan kabinet', syarat: function (c) { return c.rombak; }, soal: 'Menteri yang digugurkan dalam rombakan kabinet berkata dia dianiaya. Apa respons anda?' },
    { id: 'ev_krisis', kump: 'peristiwa', jenis: 'emosi', isu: 'krisis tempatan', syarat: function (c) { return c.krisis; }, soal: 'Penduduk kecewa krisis di kawasan mereka dibiarkan terlalu lama. Kenapa anda lambat bertindak?' },
    { id: 'int_kontraktor', kump: 'integriti', jenis: 'emosi', isu: 'sumbangan kontraktor', syarat: function (c) { return c.risiko; }, soal: 'Ada laporan anda menerima sumbangan daripada kontraktor. Apa komen anda?' },
    { id: 'int_harta', kump: 'integriti', jenis: 'fakta', isu: 'pengisytiharan harta', syarat: function (c) { return c.risiko || !!c.portfolio; }, soal: 'Adakah anda bersedia mendedahkan pengisytiharan harta anda kepada umum?' },
    { id: 'susulan', kump: 'susulan', jenis: 'emosi', isu: 'konsistensi pendirian', syarat: function (c) { return !!c.pendirian; }, soal: 'Anda pernah {pendirian} dalam isu {isuTajuk}. Adakah pendirian itu masih sama?' },
    { id: 'kj_stabil', kump: 'kerajaan', jenis: 'fakta', isu: 'kestabilan kerajaan', syarat: function (c) { return c.kerajaan && (!!c.kerusi || !!c.portfolio); }, soal: 'Bagaimana kerajaan memastikan kestabilan sehingga penggal tamat?' },
    { id: 'pb_alternatif', kump: 'kerajaan', jenis: 'fakta', isu: 'dasar alternatif', syarat: function (c) { return !c.kerajaan && !!c.kerusi; }, soal: 'Apakah dasar alternatif parti anda jika diberi peluang memerintah?' }
  ];
  var PENDIRIAN = { pertahan: 'mempertahankan dasar kerajaan', kritik: 'mengkritik dasar itu', neutral: 'memilih untuk berkecuali' };
  /** v12.2: konteks pemain untuk soalan wartawan. */
  function konteks(p) {
    var K = KB(), k = K ? K.getKabinet(p) : null, P = PRU(), st = P && P.semuaStatus ? P.semuaStatus(p) : [], E = ET(), et = E ? E.getEtika(p) : {};
    var sj = (p.pru && p.pru.sejarah) || [], akhir = sj[sj.length - 1], IS = modul('MyPolitikIsu', 'isu.js'), pa = IS && IS.pendirianAkhir ? IS.pendirianAkhir(p) : null;
    var EL = modul('MyPolitikElection', 'election.js'), j = p.jemaah || {};
    return { portfolio: k && k.hasGovernmentRole ? (k.portfolioName || '') : '', pm: !!(k && k.roleLevel === 'PERDANA_MENTERI'), kerusi: st[0] ? st[0].kerusi || '' : '',
      parti: p.parti || 'UMNO', sw: /^(PBB|PRS|SUPP|PDP|PSB)$/.test(p.parti || ''), kerajaan: IS && IS.kerajaan ? IS.kerajaan(p) : st.some(function (s) { return s.kerajaan; }),
      pemilihan: !!(EL && EL.adalahTahunPemilihan && EL.adalahTahunPemilihan(p.tahun)), rival: !!(p.rival && p.rival.senaraiPencabar && Object.keys(p.rival.senaraiPencabar).length),
      kalah: !!(akhir && akhir.hasil === 'kalah' && idx(p) - ((parseInt(akhir.tahun, 10) || 0) * 12 + (parseInt(akhir.bulan, 10) || 1)) <= 12),
      gantung: et.status === 'digantung' || et.status === 'dilarang', siasatan: !!et.siasatan, lain: st.some(function (s) { return s.lain; }),
      jemaahPencabar: !!(j.umum && j.pencabar), rombak: !!(j.umum && j.tahunRombak && j.tahunRombak === p.tahun), krisis: !!(p.krisisPeta && p.krisisPeta.terabai > 0),
      risiko: (Number(et.risiko) || 0) >= 25, pendirian: pa ? PENDIRIAN[pa.pilihan] : '', isuTajuk: pa ? pa.isu.tajuk : '' };
  }
  function isiSoal(q, c) { return String(q.soal).replace(/\{(\w+)\}/g, function (m, k) { return c[k] != null && c[k] !== '' ? c[k] : m; }); }

  function dasar0() { return { persepsi: CONFIG.PERSEPSI_AWAL, belia: CONFIG.BELIA_AWAL, kesedaran: CONFIG.KESEDARAN_AWAL, terakhir: {}, sidang: null, sidangTerakhir: -999, sejarah: [] }; }
  function getMedia(p) {
    var b = dasar0(), d = p && p.media && typeof p.media === 'object' ? p.media : {};
    for (var f in b) { if (d[f] === undefined) { d[f] = b[f]; } }
    if (!d.terakhir || typeof d.terakhir !== 'object') { d.terakhir = {}; }
    return d;
  }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function rekod(d, p, jenis, mesej) { d.sejarah = (d.sejarah || []).concat([{ jenis: jenis, mesej: mesej, tahun: p.tahun, bulan: p.bulan }]).slice(-10); }
  function simpan(d, kesan, opts) {
    opts = opts || {};
    var patch = { media: d };
    if (opts.patch) { for (var f in opts.patch) { patch[f] = opts.patch[f]; } }
    return S().applyEffects(kesan || {}, { kiraTindakan: false, patch: patch, log: opts.log });
  }
  function skorIntegriti(p) { var I = IG(); return I ? I.getIntegriti(p).skor : 70; }
  function ubahSkor(n, sebab) { var I = IG(); if (I && I.ubahSkor && n) { I.ubahSkor(n, sebab); } }
  function stres(n) { var s = ST(); if (s && s.laras && n) { s.laras({ stress: n }); } }

  /* ---------- Status ---------- */
  function wakil(p) { var P = PRU(); return !!(P && P.semuaStatus && P.semuaStatus(p).length); }
  function pegangKerajaan(p) { var K = KB(); return !!(K && K.getKabinet(p).hasGovernmentRole); }
  /** Jentera Media dipapar untuk pemegang jawatan parti / wakil rakyat / pemegang jawatan kerajaan. */
  function aktif(p) {
    if (!p || p.tamat) { return false; }
    var E = ET(); if (E && E.getEtika(p).status === 'dipecat' && !wakil(p)) { return false; }
    return (p.jawatan && p.jawatan !== 'Ahli Biasa') || wakil(p) || pegangKerajaan(p);
  }
  function kredibiliti(p) { return clamp(CONFIG.KREDIBILITI.min + (skorIntegriti(p) / 100) * (CONFIG.KREDIBILITI.maks - CONFIG.KREDIBILITI.min), CONFIG.KREDIBILITI.min, CONFIG.KREDIBILITI.maks); }
  function kempenPRU(p) {
    var pru = p && p.pru, a = pru && pru.aktif;
    return a ? { aktif: true, kempen: a.fasa === 'kempen' && a.candidateType !== 'NONE' } : { aktif: false, kempen: false };
  }

  /* ---------- digitalFleetManagement ---------- */
  function tugasBoleh(p, id, aras) {
    var t = CONFIG.TUGAS[id], a = CONFIG.PERUNTUKAN[aras], d = getMedia(p);
    if (!t || !a) { return { boleh: false, sebab: 'Tugas tidak sah.' }; }
    if (!aktif(p)) { return { boleh: false, sebab: 'Skuad Penerangan hanya untuk pemegang jawatan atau wakil rakyat.' }; }
    if (t.musim && !kempenPRU(p).aktif) { return { boleh: false, sebab: 'Hanya semasa musim pilihan raya.' }; }
    var baki = (d.terakhir[id] !== undefined) ? t.jeda - (idx(p) - d.terakhir[id]) : 0;
    if (baki > 0) { return { boleh: false, sebab: 'Skuad sedang berehat (' + baki + ' bulan lagi).' }; }
    if ((Number(p.myr) || 0) < a.kos) { return { boleh: false, sebab: 'Dana tidak mencukupi (RM ' + a.kos.toLocaleString('ms-MY') + ').' }; }
    if (id === 'naratif' && d.persepsi <= CONFIG.PERSEPSI.lantai) { return { boleh: false, sebab: 'Tiada persepsi negatif yang ketara untuk ditangkis.' }; }
    return { boleh: true, sebab: '' };
  }
  /** Senarai tugas Skuad Penerangan bersama kos dan kesan dijangka bagi setiap peringkat peruntukan. */
  function senaraiTugas(p) {
    var kr = kredibiliti(p);
    return Object.keys(CONFIG.TUGAS).map(function (id) {
      var t = CONFIG.TUGAS[id];
      return { id: id, nama: t.nama, ikon: t.ikon, huraian: t.huraian, musim: !!t.musim, peringkat: Object.keys(CONFIG.PERUNTUKAN).map(function (aras) {
        var a = CONFIG.PERUNTUKAN[aras], b = tugasBoleh(p, id, aras), f = a.k * kr, jangka;
        if (id === 'naratif') { jangka = 'Persepsi negatif ' + Math.round(t.persepsi * f) + '%'; }
        else if (id === 'infografik') { jangka = 'Sokongan belia +' + Math.round(t.belia * f) + '%'; }
        else { jangka = 'Kesedaran manifesto +' + Math.round(t.kesedaran * f) + '%' + (kempenPRU(p).kempen ? ' · Sokongan pengundi +' + Math.max(1, Math.round(t.undi * f)) + '%' : ''); }
        return { aras: aras, nama: a.nama, kos: a.kos, jangka: jangka, boleh: b.boleh, sebab: b.sebab };
      }) };
    });
  }
  function gerakkanSkuad(id, aras, o) {
    var p = S().loadPlayer(), t = CONFIG.TUGAS[id], a = CONFIG.PERUNTUKAN[aras || 'sederhana'];
    var b = tugasBoleh(p, id, aras || 'sederhana');
    if (!b.boleh) { return { ok: false, ralat: b.sebab }; }
    var d = getMedia(p), f = a.k * kredibiliti(p), kes = { myr: -a.kos }, kb = {}, mesej, patch = null;
    if (id === 'naratif') {
      d.persepsi = clamp(d.persepsi + Math.round(t.persepsi * f), 0, 100); kes.reputasi = t.reputasi; kes.ip = t.ip;
      mesej = 'Skuad Penerangan menerbitkan kenyataan media berfakta. Persepsi negatif susut kepada ' + d.persepsi + '%.';
    } else if (id === 'infografik') {
      d.belia = clamp(d.belia + Math.round(t.belia * f), 0, 100); kes.ip = t.ip; kes.kesetiaan = { akarUmbi: t.akarUmbi };
      mesej = 'Infografik pencapaian parti tersebar luas. Sokongan belia meningkat kepada ' + d.belia + '%.';
    } else {
      d.kesedaran = clamp(d.kesedaran + Math.round(t.kesedaran * f), 0, 100); d.belia = clamp(d.belia + Math.round(t.belia * f), 0, 100); kes.kesetiaan = { akarUmbi: t.akarUmbi };
      var kp = kempenPRU(p); mesej = 'Gelombang komuniti digital menyebarkan manifesto anda. Kesedaran manifesto ' + d.kesedaran + '%.';
      if (kp.kempen && p.pru && p.pru.aktif) {
        var u = Math.max(1, Math.round(t.undi * f)), pru = p.pru; pru.aktif.voterSupport = clamp(Number(pru.aktif.voterSupport || 0) + u, 0, 70);
        patch = { pru: pru }; mesej += ' Sokongan pengundi kempen +' + u + '%.';
      }
    }
    d.terakhir[id] = idx(p); rekod(d, p, 'skuad', t.nama + ' (' + a.nama + ')');
    var res = simpan(d, kes, { patch: patch, log: { tindakan: 'media_skuad', nama: 'Skuad Penerangan Digital: ' + t.nama + ' (' + a.nama + ')', peringkat: 'ahli' } });
    return res.ok ? { ok: true, mesej: mesej, kos: a.kos, persepsi: d.persepsi, belia: d.belia, kesedaran: d.kesedaran } : { ok: false, ralat: res.ralat };
  }

  /* ---------- pressConferenceMiniGame ---------- */
  function mulaSidang(o) {
    var p = S().loadPlayer(), d = getMedia(p), r = rng(o, p);
    if (!aktif(p)) { return { ok: false, ralat: 'Tidak layak.' }; }
    if (d.sidang) { return { ok: false, ralat: 'Sidang media sedang menunggu.' }; }
    var jenis = (o && o.jenis) || CONFIG.SIDANG.jenis[Math.floor(r() * CONFIG.SIDANG.jenis.length)];
    var c = konteks(p), sesuai = SOALAN.filter(function (q) { return !q.syarat || q.syarat(c); }), khas = sesuai.filter(function (q) { return q.kump && q.kump !== 'umum'; }), ids = [];
    var khasSW = khas.filter(function (q) { return q.kump === 'sarawak'; }), khasLain = khas.filter(function (q) { return q.kump !== 'sarawak'; });
    if (khasSW.length) {                                                                         // v12.3: soalan Sarawak dalam kira-kira separuh sidang sahaja, maksimum satu
      var calonK = r() < CONFIG.SIDANG.peluangSarawak ? khasSW : khasLain;
      if (calonK.length) { ids.push(calonK[Math.floor(r() * calonK.length)].id); }
    } else if (khas.length) { ids.push(khas[Math.floor(r() * khas.length)].id); }                // v12.2: sekurang-kurangnya satu soalan ikut konteks pemain
    var pool = sesuai.filter(function (q) { return ids.indexOf(q.id) < 0 && q.kump !== 'sarawak'; });
    while (ids.length < CONFIG.SIDANG.bilSoalan && pool.length) { ids.push(pool.splice(Math.floor(r() * pool.length), 1)[0].id); }
    var teks = ids.map(function (id) { return isiSoal(soalanById(id), c); });
    d.sidang = { jenis: jenis, soalan: ids, teks: teks, i: 0, jawab: [], tahun: p.tahun, bulan: p.bulan };
    var res = simpan(d, {});
    return res.ok ? { ok: true, sidang: d.sidang } : { ok: false, ralat: res.ralat };
  }
  function soalanById(id) { return SOALAN.filter(function (x) { return x.id === id; })[0]; }
  function sidangSemasa(p) {
    var d = getMedia(p), s = d.sidang; if (!s) { return null; }
    var q0 = soalanById(s.soalan[s.i]); if (!q0) { return null; }
    var q = { id: q0.id, jenis: q0.jenis, isu: q0.isu, kump: q0.kump || 'umum', soal: (s.teks && s.teks[s.i]) || isiSoal(q0, konteks(p)) };
    var j = JENIS_SIDANG[s.jenis] || JENIS_SIDANG.SIDANG, B = CONFIG.BERFAKTA, P = CONFIG.POPULIS, Dm = CONFIG.DIAM, Sg = CONFIG.SERANG;
    return { jenis: s.jenis, nama: j.nama, ikon: j.ikon, nombor: s.i + 1, jumlah: s.soalan.length, soalan: q,
      pilihan: [
        { id: 'berfakta', nama: '📘 Pendekatan Berfakta & Diplomatis', huraian: 'Imej matang & berwibawa · IP +' + B.ip + ' · Integriti Parti +' + B.skor + (q.jenis === 'fakta' ? ' (padan dengan soalan teknikal)' : '') },
        { id: 'populis', nama: '🔥 Pendekatan Populis & Lantang', huraian: 'Akar umbi +' + P.akarUmbi + ' · IP +' + P.ip + ' · Stress +' + P.stress + ' · risiko perdebatan terbuka ' + Math.round(peluangSerang(p, q) * 100) + '%' + (q.jenis === 'emosi' ? ' (padan dengan soalan emosi)' : '') },
        { id: 'diam', nama: '🤐 Tiada komen', huraian: 'Tiada IP · tiada risiko · Persepsi negatif +' + Dm.persepsi },
        { id: 'serang', nama: '🎯 Serang balik pembangkang', huraian: 'Akar umbi +' + Sg.akarUmbi + ' · Reputasi ' + Sg.reputasi + ' · risiko aduan Tataetika kira-kira ' + Sg.lapor + '%' }
      ] };
  }
  function peluangSerang(p, q) {
    var c = CONFIG.POPULIS.serangBalas, d = getMedia(p);
    return clamp(c.asas + d.persepsi * c.persepsi + (q.jenis === 'fakta' ? c.tidakPadan : 0), 0.1, 0.85);
  }
  function gred(jumlah, skorBersih) {
    if (skorBersih >= 2) { return 'Cemerlang'; }
    if (skorBersih >= 0) { return 'Memuaskan'; }
    return 'Lemah';
  }
  function jawabSidang(id, o) {
    var p = S().loadPlayer(), d = getMedia(p), s = d.sidang, r = rng(o, p);
    if (!s) { return { ok: false, ralat: 'Tiada sidang media menunggu.' }; }
    if (['berfakta', 'populis', 'diam', 'serang'].indexOf(id) < 0) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    var q = soalanById(s.soalan[s.i]), kes = {}, dSkor = 0, dStres = 0, mesej, serang = false, nilai = 1, patchEt = null;
    if (id === 'diam') {
      d.persepsi = clamp(d.persepsi + CONFIG.DIAM.persepsi, 0, 100); nilai = 0;
      mesej = 'Anda enggan mengulas tentang ' + q.isu + '. Wartawan menulis bahawa anda mengelak (persepsi negatif +' + CONFIG.DIAM.persepsi + '%).';
    } else if (id === 'serang') {
      var Sg = CONFIG.SERANG, Et = ET();
      kes.kesetiaan = { akarUmbi: Sg.akarUmbi }; kes.reputasi = Sg.reputasi; nilai = q.jenis === 'emosi' ? 1 : 0;
      mesej = 'Anda menyerang balik pembangkang tentang ' + q.isu + '. Ahli akar umbi bersorak (akar umbi +' + Sg.akarUmbi + ', reputasi ' + Sg.reputasi + ').';
      if (Et && Et.selepasAcara) {
        var hs = Et.selepasAcara(p, { risiko: Sg.risiko, lapor: { peluang: Sg.lapor, perkara: 'Kenyataan berunsur fitnah terhadap pembangkang dalam sidang media (Tataetika)', fasal: 'Fasal 20.13', berat: 1 } }, { rng: r });
        if (hs && hs.etika) { patchEt = hs.etika; if (hs.mesej) { mesej += hs.mesej; serang = true; nilai = -1; } }
      }
    } else if (id === 'berfakta') {
      var B = CONFIG.BERFAKTA, m = q.jenis === 'fakta' ? B.padan : B.tidakPadan;
      kes.ip = Math.round(B.ip * m); dSkor = Math.round(B.skor * m); kes.reputasi = B.reputasi;
      mesej = 'Anda menjawab dengan tenang dan berfakta tentang ' + q.isu + '. Imej parti kelihatan matang dan berwibawa (IP +' + kes.ip + ', Integriti Parti +' + dSkor + ').';
      nilai = q.jenis === 'fakta' ? 2 : 1;
    } else {
      var P = CONFIG.POPULIS, m2 = q.jenis === 'emosi' ? P.padan : P.tidakPadan;
      kes.ip = Math.round(P.ip * m2); kes.kesetiaan = { akarUmbi: Math.round(P.akarUmbi * m2) }; dStres = P.stress;
      mesej = 'Jawapan lantang anda tentang ' + q.isu + ' disambut hangat oleh ahli akar umbi (IP +' + kes.ip + ', akar umbi +' + kes.kesetiaan.akarUmbi + ', Stress +' + dStres + ').';
      nilai = q.jenis === 'emosi' ? 2 : 1;
      if (r() < peluangSerang(p, q)) {
        serang = true; d.persepsi = clamp(d.persepsi + P.rugi.persepsi, 0, 100); dSkor += P.rugi.skor; kes.reputasi = P.rugi.reputasi;
        mesej += ' Namun, kenyataan itu dipotong dan dijadikan perdebatan terbuka di media sosial (persepsi negatif +' + P.rugi.persepsi + '%, Integriti Parti ' + P.rugi.skor + ', reputasi ' + P.rugi.reputasi + ').';
        nilai = -1;
      }
    }
    s.jawab.push({ soalan: q.id, pilihan: id, serang: serang }); s.skorBersih = (s.skorBersih || 0) + nilai; s.i += 1;
    var tamat = s.i >= s.soalan.length, ringkas = null;
    if (tamat) {
      var g = gred(s.soalan.length, s.skorBersih), nBerfakta = s.jawab.filter(function (x) { return x.pilihan === 'berfakta'; }).length;
      ringkas = { gred: g, berfakta: nBerfakta, populis: s.jawab.filter(function (x) { return x.pilihan === 'populis'; }).length, serang: s.jawab.filter(function (x) { return x.serang; }).length };
      d.sidangTerakhir = idx(p); d.sidang = null; rekod(d, p, 'sidang', (JENIS_SIDANG[s.jenis] || JENIS_SIDANG.SIDANG).nama + ': prestasi ' + g);
      if (g === 'Cemerlang') { kes.reputasi = (kes.reputasi || 0) + 2; }
    }
    var res = simpan(d, kes, { patch: patchEt ? { etika: patchEt } : null, log: { tindakan: 'media_sidang', nama: (JENIS_SIDANG[s.jenis] || JENIS_SIDANG.SIDANG).nama + ': ' + q.isu + ' (' + ({ berfakta: 'berfakta', populis: 'populis', diam: 'tiada komen', serang: 'serang balik' })[id] + ')', peringkat: 'ahli' } });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    ubahSkor(dSkor, 'Sidang media: ' + q.isu); stres(dStres);
    return { ok: true, mesej: mesej, serang: serang, tamat: tamat, ringkasan: ringkas };
  }

  /* ---------- Denyut bulanan ---------- */
  function prosesBulan(o) {
    var ev = [], p = S() && S().loadPlayer();
    if (!p || p.tamat || !aktif(p)) { return { peristiwa: ev }; }
    var d = getMedia(p), r = rng(o, p), kes = {}, c = CONFIG.PERSEPSI, now = idx(p), E = ET(), st = E ? E.getEtika(p).status : 'baik';
    // 1. sidang tidak dijawab
    if (d.sidang) { var t = CONFIG.SIDANG.tidakJawab; d.persepsi = clamp(d.persepsi + t.persepsi, 0, 100); ubahSkor(t.skor, 'Sidang media diabaikan'); d.sidang = null; d.sidangTerakhir = now; ev.push({ jenis: 'media', mesej: 'Anda tidak hadir sidang media. Wartawan menulis dahulu: persepsi negatif +' + t.persepsi + '%, Integriti Parti ' + t.skor + '.' }); }
    // 2. denyut persepsi
    var pers = -c.susut;
    if (st !== 'baik') { pers += c.etikaBuruk; }
    if (skorIntegriti(p) < 40) { pers += c.skorRendah; }
    var I = IG(); if (I && I.getIntegriti(p).risiko >= I.CONFIG.RISIKO_AUDIT) { pers += c.auditTinggi; }
    d.persepsi = pers < 0 ? Math.max(c.lantai, d.persepsi + pers) : clamp(d.persepsi + pers, 0, 100);
    if (d.persepsi >= c.tinggi) { kes.kesetiaan = { akarUmbi: c.kesanTinggi.akarUmbi }; kes.reputasi = c.kesanTinggi.reputasi; ev.push({ jenis: 'media', mesej: 'Persepsi negatif terhadap anda tinggi (' + d.persepsi + '%). Akar umbi mula goyah; gerakkan Skuad Penerangan.' }); }
    if (d.belia > CONFIG.BELIA.lantai) { d.belia = Math.max(CONFIG.BELIA.lantai, d.belia - CONFIG.BELIA.susut); }
    if (d.belia >= CONFIG.BELIA.tinggi) { kes.ip = CONFIG.BELIA.kesanTinggi.ip; }
    // 3. sidang media rawak
    var kp = kempenPRU(p), peluang = CONFIG.SIDANG.peluang + d.persepsi * CONFIG.SIDANG.peluangPersepsi + (kp.aktif ? CONFIG.SIDANG.peluangPRU : 0);
    if (!kp.kempen && now - d.sidangTerakhir >= CONFIG.SIDANG.jeda && r() < peluang) {
      simpan(d, kes); kes = {}; var m = mulaSidang({ rng: r }); d = getMedia(S().loadPlayer());
      if (m.ok) { ev.push({ jenis: 'media_sidang', mesej: 'Wartawan menjemput anda ke ' + (JENIS_SIDANG[d.sidang.jenis] || JENIS_SIDANG.SIDANG).nama + '.' }); }
      return { peristiwa: ev };
    }
    simpan(d, kes);
    return { peristiwa: ev };
  }

  function ringkasan(p) {
    var d = getMedia(p);
    return { aktif: aktif(p), persepsi: d.persepsi, belia: d.belia, kesedaran: d.kesedaran, kredibiliti: Math.round(kredibiliti(p) * 100) / 100,
      musimPRU: kempenPRU(p).aktif, tugas: aktif(p) ? senaraiTugas(p) : [], sidang: sidangSemasa(p), sejarah: d.sejarah || [] };
  }

  return {
    CONFIG: CONFIG, SOALAN: SOALAN, JENIS_SIDANG: JENIS_SIDANG, setRng: function (f) { rngLalai = f || null; },
    getMedia: getMedia, aktif: aktif, konteks: konteks, senaraiTugas: senaraiTugas, tugasBoleh: tugasBoleh, gerakkanSkuad: gerakkanSkuad,
    mulaSidang: mulaSidang, sidangSemasa: sidangSemasa, jawabSidang: jawabSidang, prosesBulan: prosesBulan, ringkasan: ringkasan
  };
});
