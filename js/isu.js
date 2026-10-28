/* ==========================================================================
   Nusa Politik — js/isu.js   (v12.2)
   Isu Semasa: senario politik rekaan (tema biasa politik Malaysia, tanpa individu sebenar) muncul kira-kira setiap 3 bulan.
   Pemain yang memegang jawatan / wakil rakyat perlu mengambil pendirian: pertahan dasar, kritik, atau berkecuali.
   Kesan berbeza jika parti pemain dalam kerajaan atau pembangkang; dua isu khas Sabah/Sarawak (MA63, royalti minyak).

   Peraturan (mockup v12 dipersetujui; nombor andaian permainan):
     - peluang 1/3 setiap bulan, sekurang-kurangnya 2 bulan sejak isu terakhir; tiada semasa kempen PRU/PRN
     - tidak dijawab sebelum bulan seterusnya: Reputasi -1 (dicatat 'abai')
     - pendirian diingati (p.isuSemasa.sejarah) dan boleh ditanya semula oleh wartawan (js/media.js)
   State: p.isuSemasa = { aktif:{ id, tahun, bulan } | null, akhir: idx, sejarah:[{ id, pilihan, tahun, bulan }] }
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikIsu = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function MD() { return modul('MyPolitikMedia', 'media.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function SW(k) { return /^(PBB|PRS|SUPP|PDP|PSB)$/.test(k || ''); }

  var CONFIG = { PELUANG: 1 / 3, JEDA: 2, ABAI_REPUTASI: -1, ELAK_ULANG: 4 };

  /* marah: 1-3, betapa tidak popular dasar/keadaan itu kepada rakyat (menskala kesan akar umbi) */
  var ISU = [
    { id: 'beras', ikon: '🌾', marah: 3, tajuk: 'Harga beras tempatan naik mendadak',
      huraian: 'Beras tempatan hilang dari rak kedai dan harga beras import melonjak. Peniaga kecil dan suri rumah mengadu.',
      label: { pertahan: 'Pertahan langkah kerajaan', kritik: 'Desak harga siling segera', neutral: 'Minta data bekalan didedahkan' } },
    { id: 'banjir', ikon: '🌊', marah: 2, tajuk: 'Banjir besar, bantuan lambat sampai',
      huraian: 'Mangsa banjir di beberapa daerah menunggu bantuan lebih seminggu. Pusat pemindahan sesak.',
      label: { pertahan: 'Pertahan agensi bantuan', kritik: 'Kritik kelewatan bantuan', neutral: 'Turun padang tanpa kenyataan politik' } },
    { id: 'tarif', ikon: '💡', marah: 2, tajuk: 'Tarif elektrik dinaikkan untuk pengguna besar',
      huraian: 'Kerajaan menaikkan tarif elektrik bagi pengguna komersial. Peniaga bimbang kos dipindahkan kepada pengguna.',
      label: { pertahan: 'Sokong kenaikan bersasar', kritik: 'Bantah kenaikan tarif', neutral: 'Cadang pemantauan harga barang' } },
    { id: 'subsidi', ikon: '⛽', marah: 3, tajuk: 'Rasionalisasi subsidi minyak',
      huraian: 'Subsidi minyak akan disasarkan. Golongan pertengahan bimbang tidak layak menerima bantuan.',
      label: { pertahan: 'Pertahan subsidi bersasar', kritik: 'Desak subsidi pukal dikekalkan', neutral: 'Minta tempoh peralihan lebih panjang' } },
    { id: 'lompat', ikon: '🦘', marah: 1, tajuk: 'Undang-undang anti lompat parti dipinda',
      huraian: 'Pindaan dicadangkan untuk menutup kelompongan undang-undang anti lompat parti. Ada wakil rakyat menentang.',
      label: { pertahan: 'Sokong pindaan', kritik: 'Bantah pindaan tergesa-gesa', neutral: 'Minta jawatankuasa pilihan khas' } },
    { id: 'doktor', ikon: '🩺', marah: 2, tajuk: 'Mogok doktor kontrak',
      huraian: 'Doktor kontrak merancang mogok kerana tiada laluan jawatan tetap. Hospital kerajaan semakin sesak.',
      label: { pertahan: 'Pertahan pelan kerajaan', kritik: 'Sokong tuntutan doktor', neutral: 'Cadang dialog tiga pihak' } },
    { id: 'pusatdata', ikon: '🖥️', marah: 1, tajuk: 'Pusat data baharu dan isu bekalan air',
      huraian: 'Pelaburan pusat data dialu-alukan, tetapi penduduk bimbang bekalan air dan elektrik terjejas.',
      label: { pertahan: 'Sokong pelaburan', kritik: 'Desak kajian kesan alam sekitar', neutral: 'Minta jaminan bekalan untuk penduduk' } },
    { id: 'yuran', ikon: '🎓', marah: 2, tajuk: 'Kenaikan yuran pengajian tinggi',
      huraian: 'Universiti awam mencadangkan kenaikan yuran. Pelajar dan ibu bapa membantah di media sosial.',
      label: { pertahan: 'Pertahan autonomi universiti', kritik: 'Bantah kenaikan yuran', neutral: 'Cadang biasiswa tambahan' } },
    { id: 'tular', ikon: '📱', marah: 2, tajuk: 'Video tular pegawai kerajaan kasar dengan rakyat',
      huraian: 'Sebuah video menunjukkan pegawai kaunter memarahi warga emas. Netizen menuntut tindakan tegas.',
      label: { pertahan: 'Minta orang ramai tunggu siasatan', kritik: 'Desak pegawai digantung', neutral: 'Ziarah warga emas itu' } },
    { id: 'umurcalon', ikon: '🗳️', marah: 1, tajuk: 'Cadangan had umur calon pilihan raya',
      huraian: 'Satu cadangan menetapkan had umur maksimum calon pilihan raya. Pemimpin veteran tidak bersetuju.',
      label: { pertahan: 'Sokong pembaharuan', kritik: 'Bantah had umur', neutral: 'Serah kepada parti masing-masing' } },
    { id: 'ma63', ikon: '📜', marah: 2, sw: true, tajuk: 'MA63 dan pengembalian hak Sabah/Sarawak',
      huraian: 'NGO dan ahli politik Borneo mendesak hak di bawah Perjanjian Malaysia 1963 dikembalikan sepenuhnya.',
      label: { pertahan: 'Pertahan proses rundingan pusat', kritik: 'Sokong tuntutan hak MA63', neutral: 'Cadang jawatankuasa bersama' } },
    { id: 'royalti', ikon: '🛢️', marah: 2, sw: true, tajuk: 'Tuntutan royalti minyak 20%',
      huraian: 'Persatuan peniaga dan NGO mendesak royalti minyak dinaikkan daripada 5% kepada 20%. Kerajaan persekutuan berkata kewangan negara terhad.',
      label: { pertahan: 'Pertahan pendirian kerajaan persekutuan', kritik: 'Sokong tuntutan royalti', neutral: 'Cadang jawatankuasa bersama' } }
  ];
  function cari(id) { for (var i = 0; i < ISU.length; i++) { if (ISU[i].id === id) { return ISU[i]; } } return null; }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function ambil(p) {
    var x = p && p.isuSemasa && typeof p.isuSemasa === 'object' ? p.isuSemasa : {};
    return { aktif: x.aktif || null, akhir: typeof x.akhir === 'number' ? x.akhir : -999, sejarah: Array.isArray(x.sejarah) ? x.sejarah.slice(-12) : [] };
  }
  function borneo(p) { var n = String((p && p.negeri) || '').toLowerCase(); return SW(p && p.parti) || n === 'sabah' || n === 'sarawak' || n === 'labuan'; }
  /** Parti pemain dalam kerajaan (jawatan kerajaan, kerusi dengan status kerajaan, atau anggaran kerusi). Parti Sarawak (GPS) dalam Kerajaan Perpaduan. */
  function kerajaan(p) {
    if (!p) { return false; }
    var K = KB(); if (K && K.getKabinet(p).hasGovernmentRole) { return true; }
    var P = PRU(), st = P && P.semuaStatus ? P.semuaStatus(p) : []; if (st.length) { return st.some(function (s) { return s.kerajaan; }); }
    if (SW(p.parti)) { return p.parti !== 'PSB'; }
    return !!(p.kerusiNasional && p.kerusiNasional.kerajaan);
  }
  function layak(p) { var M = MD(); return !!(p && !p.tamat && M && M.aktif && M.aktif(p)); }
  function kempen(p) { var P = PRU(), a = P && P.getPRU ? P.getPRU(p).aktif : null; return !!a; }

  /** Kesan setiap pilihan: { ip, reputasi, akarUmbi, hubungan, persepsi }. */
  function kesan(p, isu, pilihan) {
    var kj = kerajaan(p), m = isu.marah;
    if (isu.sw && SW(p.parti)) {
      if (pilihan === 'kritik') { return { akarUmbi: 6, hubungan: kj ? -6 : 0, ip: 3 }; }
      if (pilihan === 'pertahan') { return { reputasi: 2, akarUmbi: -5 }; }
      return { ip: 5 };
    }
    if (kj) {
      if (pilihan === 'pertahan') { return { reputasi: 2, akarUmbi: -(1 + m), hubungan: 2, ip: 3 }; }
      if (pilihan === 'kritik') { return { akarUmbi: 2 + m, ip: 4, hubungan: -6, reputasi: -1 }; }
      return { ip: 5 };
    }
    if (pilihan === 'pertahan') { return { reputasi: 1, akarUmbi: -m, ip: 2 }; }
    if (pilihan === 'kritik') { return { akarUmbi: 2 + m, ip: 5, persepsi: -3 }; }
    return { ip: 3 };
  }
  function ringkasKesan(k) {
    var b = [];
    if (k.ip) { b.push('IP ' + (k.ip > 0 ? '+' : '') + k.ip); }
    if (k.akarUmbi) { b.push('Akar umbi ' + (k.akarUmbi > 0 ? '+' : '') + k.akarUmbi); }
    if (k.reputasi) { b.push('Reputasi ' + (k.reputasi > 0 ? '+' : '') + k.reputasi); }
    if (k.hubungan) { b.push('Hubungan Gabungan ' + (k.hubungan > 0 ? '+' : '') + k.hubungan); }
    if (k.persepsi) { b.push('Persepsi negatif ' + (k.persepsi > 0 ? '+' : '') + k.persepsi); }
    return b.length ? b.join(' · ') : 'Tiada kesan besar';
  }

  /** Isu aktif untuk paparan: { isu, kerajaan, pilihan:[{ id, label, kesan, ringkas }] } atau null. */
  function semasa(p) {
    var st = ambil(p), a = st.aktif, isu = a && cari(a.id);
    if (!isu) { return null; }
    return { isu: isu, kerajaan: kerajaan(p), pilihan: ['pertahan', 'kritik', 'neutral'].map(function (id) { var k = kesan(p, isu, id); return { id: id, label: isu.label[id], kesan: k, ringkas: ringkasKesan(k) }; }) };
  }

  function jawab(pilihan) {
    var Sv = S(), p = Sv && Sv.loadPlayer();
    if (!p) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var s = semasa(p); if (!s) { return { ok: false, ralat: 'Tiada isu semasa.' }; }
    if (['pertahan', 'kritik', 'neutral'].indexOf(pilihan) < 0) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    var k = kesan(p, s.isu, pilihan), st = ambil(p), patch = {}, kes = {};
    if (k.ip) { kes.ip = k.ip; } if (k.reputasi) { kes.reputasi = k.reputasi; } if (k.akarUmbi) { kes.kesetiaan = { akarUmbi: k.akarUmbi }; }
    if (k.hubungan) { var P = PRU(); if (P && P.getPRU) { var pr = JSON.parse(JSON.stringify(P.getPRU(p))); pr.hubunganGabungan = clamp((Number(pr.hubunganGabungan) || 50) + k.hubungan, 0, 100); patch.pru = pr; } }
    if (k.persepsi) { var M = MD(); if (M && M.getMedia) { var d = JSON.parse(JSON.stringify(M.getMedia(p))); d.persepsi = clamp((Number(d.persepsi) || 0) + k.persepsi, 0, 100); patch.media = d; } }
    st.sejarah.push({ id: s.isu.id, pilihan: pilihan, tahun: p.tahun, bulan: p.bulan }); st.sejarah = st.sejarah.slice(-12); st.aktif = null;
    patch.isuSemasa = st;
    var r = Sv.applyEffects(kes, { kiraTindakan: false, patch: patch, log: { tindakan: 'isu_semasa', nama: 'Isu Semasa: ' + s.isu.tajuk + ' (' + s.isu.label[pilihan] + ')', peringkat: 'ahli' } });
    if (!r.ok) { return { ok: false, ralat: r.ralat || 'Gagal menyimpan.' }; }
    return { ok: true, mesej: 'Pendirian anda: ' + s.isu.label[pilihan] + '. ' + ringkasKesan(k) + '.' };
  }

  /** Pendirian terakhir (dalam 6 bulan) untuk soalan susulan wartawan: { isu, pilihan } atau null. */
  function pendirianAkhir(p) {
    var st = ambil(p), x = st.sejarah.filter(function (h) { return h.pilihan !== 'abai'; }).slice(-1)[0];
    if (!x || idx(p) - ((parseInt(x.tahun, 10) || 0) * 12 + (parseInt(x.bulan, 10) || 1)) > 6) { return null; }
    var isu = cari(x.id); return isu ? { isu: isu, pilihan: x.pilihan } : null;
  }

  /** Setiap bulan (calendar.js). o.rng untuk ujian. */
  function prosesBulan(o) {
    o = o || {};
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || !layak(p)) { return { peristiwa: ev }; }
    var st = ambil(p), kes = {}, now = idx(p), r = o.rng || Sv.rngBerbenih(String(p.id) + '|isu|' + now), ubah = false;
    if (st.aktif && (st.aktif.tahun !== p.tahun || st.aktif.bulan !== p.bulan)) {
      var lama = cari(st.aktif.id);
      st.sejarah.push({ id: st.aktif.id, pilihan: 'abai', tahun: st.aktif.tahun, bulan: st.aktif.bulan }); st.aktif = null; kes.reputasi = CONFIG.ABAI_REPUTASI; ubah = true;
      ev.push({ jenis: 'isu_semasa', mesej: 'Anda tidak menyatakan pendirian tentang "' + (lama ? lama.tajuk : 'isu semasa') + '". Media menganggap anda mengelak (Reputasi ' + CONFIG.ABAI_REPUTASI + ').' });
    }
    if (!st.aktif && !kempen(p) && now - st.akhir >= CONFIG.JEDA && r() < CONFIG.PELUANG) {
      var baru = st.sejarah.slice(-CONFIG.ELAK_ULANG).map(function (h) { return h.id; });
      var calon = ISU.filter(function (i) { return (!i.sw || borneo(p)) && baru.indexOf(i.id) < 0; });
      if (calon.length) {
        var pilih = calon[Math.floor(r() * calon.length)];
        st.aktif = { id: pilih.id, tahun: p.tahun, bulan: p.bulan }; st.akhir = now; ubah = true;
        ev.push({ jenis: 'isu_semasa', mesej: pilih.ikon + ' Isu Semasa: ' + pilih.tajuk + '. Nyatakan pendirian anda di tab Tindakan sebelum bulan depan.' });
      }
    }
    if (ubah) { Sv.applyEffects(kes, { kiraTindakan: false, patch: { isuSemasa: st } }); }
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, ISU: ISU, cari: cari, kerajaan: kerajaan, kesan: kesan, semasa: semasa, jawab: jawab, pendirianAkhir: pendirianAkhir, prosesBulan: prosesBulan };
});
