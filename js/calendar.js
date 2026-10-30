/* ==========================================================================
   Nusa Politik — js/calendar.js
   Sistem masa BULANAN (Bulan 1 hingga 12) dan Takwim Aktiviti UMNO.

   Takwim (v3.0):
     Bulan 1-3   Akar umbi         Aktiviti akar umbi dan membina pengaruh
                                    (bonus +25% IP dan sokongan positif bagi tindakan)
     Bulan 4-5   Musim Cawangan    Mesyuarat dan Pemilihan Cawangan (Cawangan dan Sayap)
     Bulan 6     Musim Bahagian    Mesyuarat dan Pemilihan Bahagian, termasuk undi jawatan Pusat (v13.5, Fasal 9.3)
     Bulan 7-8   Antara musim
     Bulan 9     PAU               Perhimpunan Agung UMNO (dasar dan usul; tiada undi jawatan)
     Bulan 10-12 Pasca-PAU         Aktiviti akar umbi dan pasca-PAU
   v13.5: Perwakilan Bahagian sekurang-kurangnya 60 hari sebelum PAU (Fasal 14.3) dan Persidangan Cawangan 14 hari sebelum Bahagian (17.3).
   Musim pemilihan khas selepas PRU (Fasal 10.16) diatur oleh js/umno.js (takwimKhas).
   Semua angka boleh diubah dalam CONFIG.

   Regenerasi pada setiap permulaan bulan:
     AP   : bertambah CONFIG.AP_BULANAN setiap bulan; baki dibawa ke bulan berikutnya sehingga had CONFIG.AP_MAKS (v7.23)
     MYR  : ditambah elaun bulanan (asas + tambahan mengikut peringkat jawatan)

   Pergantian bulan 12 -> bulan 1 menaikkan tahun dan mengemas kini kitaran
   pemilihan 3 tahun melalui MyPolitikElection.majuTahun().

   Cara guna (dashboard):
     var K = MyPolitikCalendar;
     K.getTakwim();                  // bulan, fasa, tetingkap mesyuarat, 12 bulan
     K.pratonton();                  // apa yang berlaku jika terus ke bulan seterusnya
     var h = K.majuBulan();          // { ok, bulan, tahun, tahunBaharu, regenerasi, peristiwa:[], ... }
     K.statusTetingkap('cawangan');  // 'belum_tiba' | 'dibuka' | 'tamat'

   Pemain disimpan dalam profil.bulan (1-12) dan profil.tahun (localStorage).
   Perlu dimuatkan selepas js/save.js. election.js dan meeting.js adalah pilihan
   dan dikesan semasa dijalankan.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikCalendar = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  function muat(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  var S = muat('MyPolitikSave', 'save.js');

  /* ------------------------------------------------------------------------
     1. TETAPAN
     ------------------------------------------------------------------------ */
  var CONFIG = {
    BULAN_NAMA: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'],
    AP_BULANAN: 6,                       // AP asas sebulan bagi Biasa (v8.27: lihat AP_IKUT_KESUKARAN; v7.23: baki dibawa)
    AP_MAKS: 20,                         // had AP terkumpul bagi Biasa (v8.27: lihat AP_IKUT_KESUKARAN)
    AP_IKUT_KESUKARAN: { EASY: { bulanan: 7, maks: 20 }, NORMAL: { bulanan: 6, maks: 20 }, HARDCORE: { bulanan: 5, maks: 15 } },   // v8.27
    AP_BONUS: { wakil: 1, menteri: 2 },  // v8.27: bonus AP sebulan bagi ADUN / MP / EXCO Negeri (+1) dan Menteri ke atas (+2)
    PERINGKAT_PARTI: ['cawangan', 'bahagian', 'pusat'],   // v8.12: elaun asas dan elaun jawatan parti DIHAPUSKAN; lihat js/kerjaya.js (pendapatan kerjaya, kos operasi, elaun rasmi YB)
    // v3.8: sokongan susut setiap bulan jika tidak dijaga. Pemegang jawatan menanggung susutan Akar Umbi tambahan.
    SUSUT_BULANAN: { akarUmbi: 2, ajk: 2, perwakilan: 3 },       // v8.21: akarUmbi 3 kepada 2       // ketuaCawangan tidak disusutkan: pemegang jawatan tiada tindakan untuk memulihkannya
    SUSUT_PEMEGANG_JAWATAN: 1,           // v8.21: 2 kepada 1; tambahan susutan Akar Umbi bagi pemegang jawatan
    BONUS_AKAR_UMBI: 0.25,               // bulan 1-3: tambahan pada IP dan sokongan positif

    /* Fasa takwim (bulan mula-tamat, termasuk). */
    FASA: [
      { kod: 'akar_umbi', mula: 1, tamat: 3, tajuk: 'Awal Tahun', ringkas: 'Khidmat Akar Umbi & Pendaftaran Ahli',
        fokus: ['Ziarah dan gotong-royong', 'Bina pengaruh dan sokongan akar umbi', 'Kumpul isu tempatan'] },
      { kod: 'cawangan', mula: 4, tamat: 6, tajuk: 'Musim Cawangan', ringkas: 'Musim Mesyuarat & Pemilihan Cawangan (Cawangan & Sayap)',
        fokus: ['Persidangan Tahunan Cawangan dan usul lokaliti', 'Mesyuarat Sayap (bulan 5-6) sebelum Bahagian', 'Pemilihan jawatan Cawangan dan Sayap Cawangan', 'Pemilihan Perwakilan ke Bahagian'] },
      { kod: 'bahagian', mula: 7, tamat: 7, tajuk: 'Musim Bahagian', ringkas: 'Musim Mesyuarat & Pemilihan Bahagian (Bahagian & Sayap)',
        fokus: ['Mesyuarat Perwakilan Bahagian', 'Pemilihan jawatan Bahagian dan Sayap Bahagian', 'Pemilihan Perwakilan ke PAU'] },
      { kod: 'pau', mula: 8, tamat: 8, tajuk: 'Perhimpunan Agung', ringkas: 'Perhimpunan Agung UMNO (PAU) & Pemilihan Pusat',
        fokus: ['Perhimpunan Agung UMNO', 'Pemilihan Presiden, Timbalan Presiden, 3 Naib Presiden, MKT dan Ketua Sayap (tahun pemilihan)'] },
      { kod: 'pasca_pau', mula: 9, tamat: 12, tajuk: 'Akhir Tahun', ringkas: 'Pasca-PAU & Khidmat Masyarakat',
        fokus: ['Pulih dan bina semula sokongan', 'Laksana tanggungjawab jawatan', 'Bersedia untuk kitaran seterusnya'] }
    ],

    /* Tetingkap setiap mesyuarat / pengundian. 'pusat' dalam election.js dipetakan kepada 'pau'. */
    TETINGKAP: {
      sayap_cawangan: { mula: 4, tamat: 6, nama: 'Persidangan Tahunan Sayap Cawangan' },     // v6.1: laluan sayap sahaja; mesti selesai sebelum mesyuarat utama
      cawangan: { mula: 4, tamat: 6, nama: 'Persidangan Tahunan Cawangan' },
      sayap_bahagian: { mula: 7, tamat: 7, nama: 'Mesyuarat Perwakilan Sayap Bahagian' },
      bahagian: { mula: 7, tamat: 7, nama: 'Mesyuarat Perwakilan Bahagian' },
      sayap_pau: { mula: 8, tamat: 8, nama: 'Perhimpunan Sayap (Pra-PAU)' },
      pau:      { mula: 8, tamat: 8, nama: 'Perhimpunan Agung UMNO (PAU)' }
    }
  };
  /* v11.1: kalendar PBB. Proses sama (Ranting -> Cawangan -> Pusat), kitaran tetap 3 tahun, tetapi tiada bulan tetap rasmi seperti UMNO.
     ANDAIAN (⚠️): bulan 3 (Ranting), 5 (Cawangan/DUN) dan 8 (Perhimpunan Agung PBB) dipilih oleh simulasi. Kunci dalaman (cawangan/bahagian/pau) dikekalkan:
     'cawangan' = peringkat Ranting (lokaliti), 'bahagian' = peringkat Cawangan (DUN), 'pau' = Perhimpunan Agung PBB. */
  /* Teks ditulis dalam bentuk dalaman (UMNO); js/parti.js menukar 'Cawangan' -> 'Ranting', 'Bahagian' -> 'Cawangan (DUN)' dan PAU -> Perhimpunan Agung PBB untuk pemain PBB. */
  function bulanPBB(f, mula, tamat) { var x = JSON.parse(JSON.stringify(f)); x.mula = mula; x.tamat = tamat; return x; }
  var F0 = CONFIG.FASA, T0 = CONFIG.TETINGKAP;
  function tt(k, mula, tamat) { var x = {}; for (var q in T0[k]) { x[q] = T0[k][q]; } x.mula = mula; x.tamat = tamat; return x; }
  var antara = { kod: 'antara', tajuk: 'Antara Musim', ringkas: 'Khidmat Masyarakat antara musim mesyuarat', fokus: ['Laksana keputusan mesyuarat', 'Bersedia untuk mesyuarat seterusnya'] };
  function antaraBulan(m, t) { var x = JSON.parse(JSON.stringify(antara)); x.mula = m; x.tamat = t; return x; }
  CONFIG.PBB = {
    FASA: [bulanPBB(F0[0], 1, 2), bulanPBB(F0[1], 3, 3), antaraBulan(4, 4), bulanPBB(F0[2], 5, 5), antaraBulan(6, 7), bulanPBB(F0[3], 8, 8), bulanPBB(F0[4], 9, 12)],
    TETINGKAP: { sayap_cawangan: tt('sayap_cawangan', 3, 3), cawangan: tt('cawangan', 3, 3), sayap_bahagian: tt('sayap_bahagian', 5, 5), bahagian: tt('bahagian', 5, 5), sayap_pau: tt('sayap_pau', 8, 8), pau: tt('pau', 8, 8) }
  };
  /* v13.1: kalendar MCA (Perlembagaan MCA): Perhimpunan Cawangan April (Perkara 96), Perhimpunan Bahagian Jun (Perkara 69),
     Perhimpunan Agung paling lewat 31 Ogos (Perkara 29). Kunci dalaman (cawangan/bahagian/pau) dikekalkan; js/parti.js menukar istilah. */
  CONFIG.MCA = {
    FASA: [bulanPBB(F0[0], 1, 3), bulanPBB(F0[1], 4, 4), antaraBulan(5, 5), bulanPBB(F0[2], 6, 6), antaraBulan(7, 7), bulanPBB(F0[3], 8, 8), bulanPBB(F0[4], 9, 12)],
    TETINGKAP: { sayap_cawangan: tt('sayap_cawangan', 4, 4), cawangan: tt('cawangan', 4, 4), sayap_bahagian: tt('sayap_bahagian', 6, 6), bahagian: tt('bahagian', 6, 6), sayap_pau: tt('sayap_pau', 8, 8), pau: tt('pau', 8, 8) }
  };
  /* v13.3: kalendar MIC (Perlembagaan MIC): Mesyuarat Agung Tahunan Cawangan paling lewat 31 Mac (Perkara 19.1), Persidangan Perwakilan Bahagian
     paling lewat 31 Mei (Perkara 32.2), Kongres Negeri bulan 7 (ANDAIAN, js/mic.js) dan Perhimpunan Agung bulan 9 (ANDAIAN; tarikh ditetapkan CWC, Perkara 68.1). */
  CONFIG.MIC = {
    FASA: [bulanPBB(F0[0], 1, 2), bulanPBB(F0[1], 3, 3), antaraBulan(4, 4), bulanPBB(F0[2], 5, 5), antaraBulan(6, 8), bulanPBB(F0[3], 9, 9), bulanPBB(F0[4], 10, 12)],
    TETINGKAP: { sayap_cawangan: tt('sayap_cawangan', 3, 3), cawangan: tt('cawangan', 3, 3), sayap_bahagian: tt('sayap_bahagian', 5, 5), bahagian: tt('bahagian', 5, 5), sayap_pau: tt('sayap_pau', 9, 9), pau: tt('pau', 9, 9) }
  };
  /* v13.8: kalendar PPP (ANDAIAN): Cawangan bulan 3, Bahagian bulan 5, Perhimpunan Agung Tahunan bulan 9 (pemilihan Presiden 1-9-2024). */
  CONFIG.PPP = { FASA: CONFIG.MIC.FASA, TETINGKAP: CONFIG.MIC.TETINGKAP, ppp: true };
  CONFIG.PBRS = { FASA: CONFIG.MIC.FASA, TETINGKAP: CONFIG.MIC.TETINGKAP, ppp: true };             // v13.9: PBRS (ANDAIAN takwim 3/5/9)
  /* v13.5: takwim UMNO ikut Perlembagaan UMNO 2025. F0/T0 (asal) dikekalkan untuk parti lain di atas. */
  function fasaUMNO(c1, c2, b, a) {
    var x = [bulanPBB(F0[0], 1, Math.max(1, c1 - 1)), bulanPBB(F0[1], c1, c2), bulanPBB(F0[2], b, b), bulanPBB(F0[3], a, a)];
    if (c1 <= 1) { x[0].mula = 0; x[0].tamat = 0; }                                       // musim khas bermula Januari: tiada fasa akar umbi
    if (b > c2 + 1) { x.push(antaraBulan(c2 + 1, b - 1)); }
    if (a > b + 1) { x.push(antaraBulan(b + 1, a - 1)); }
    if (a < 12) { x.push(bulanPBB(F0[4], a + 1, 12)); }
    x[1].fokus = ['Persidangan Tahunan Cawangan dan usul lokaliti', 'Mesyuarat Sayap Cawangan sebelum Persidangan Tahunan Cawangan', 'Pemilihan jawatan Cawangan dan Sayap Cawangan', 'Pemilihan Perwakilan ke Bahagian'];
    x[2].ringkas = 'Musim Mesyuarat & Pemilihan Bahagian dan Pusat'; x[2].fokus = ['Mesyuarat Perwakilan Bahagian', 'Pemilihan jawatan Bahagian dan Sayap Bahagian', 'Undi jawatan Pusat: Presiden, Timbalan Presiden, 3 Naib Presiden dan MKT (tahun pemilihan, Fasal 9.3)', 'Ketua Sayap Malaysia dipilih dalam Mesyuarat Perwakilan Sayap Bahagian (Fasal 9.4)'];
    x[3].ringkas = 'Perhimpunan Agung UMNO (PAU)'; x[3].fokus = ['Ucapan Dasar Presiden', 'Membahaskan usul', 'Perhimpunan Agung Sayap'];
    return x.sort(function (p, q) { return p.mula - q.mula; });
  }
  function tetingkapUMNO(c1, c2, b, a) {
    return { sayap_cawangan: tt('sayap_cawangan', c1, c2), cawangan: tt('cawangan', c1, c2), sayap_bahagian: tt('sayap_bahagian', b, b), bahagian: tt('bahagian', b, b), sayap_pau: tt('sayap_pau', a, a), pau: tt('pau', a, a) };
  }
  CONFIG.LAMA = { FASA: F0, TETINGKAP: T0, lama: true };                                // v13.5: takwim sebelum Fasa B (simpanan lama yang di tengah musim, sehingga tahun berikutnya)
  CONFIG.FASA = fasaUMNO(4, 5, 6, 9); CONFIG.TETINGKAP = tetingkapUMNO(4, 5, 6, 9);
  /** v13.5: musim pemilihan khas UMNO selepas PRU (Fasal 10.16). k = { c, b, a } (bulan Cawangan, Bahagian, PAU). */
  function takwimKhas(k) { var c2 = Math.max(k.c, Math.min(k.b - 1, k.c + 1)); return { FASA: fasaUMNO(k.c, c2, k.b, k.a), TETINGKAP: tetingkapUMNO(k.c, c2, k.b, k.a), khas: true }; }
  /** Set takwim aktif mengikut parti pemain (PBB atau lalai UMNO). */
  function takwimSet() {
    var k = null;
    try { k = root.MyPolitikParti && root.MyPolitikParti.kini ? root.MyPolitikParti.kini() : null; } catch (e) { k = null; }
    if (!k) { try { var pp = S && S.loadPlayer ? S.loadPlayer() : null; k = pp && pp.parti; } catch (e2) { k = null; } }
    if (k === 'PBB') { return CONFIG.PBB; } if (k === 'MCA') { return CONFIG.MCA; } if (k === 'MIC') { return CONFIG.MIC; } if (k === 'PPP') { return CONFIG.PPP; } if (k === 'PBRS') { return CONFIG.PBRS; }
    if (!k || k === 'UMNO') { var U = root.MyPolitikUMNO, kh = U && U.takwimKini ? U.takwimKini() : null; if (kh === 'lama') { return CONFIG.LAMA; } if (kh) { return takwimKhas(kh); } }      // v13.5: simpanan lama di tengah musim / musim pemilihan khas (dicache)
    return CONFIG;
  }

  /* ------------------------------------------------------------------------
     2. PEMBANTU
     ------------------------------------------------------------------------ */
  function gagal(kod, ralat) { return { ok: false, kod: kod, ralat: ralat }; }
  function sah(n) { n = parseInt(n, 10); return isFinite(n) ? Math.max(1, Math.min(12, n)) : 1; }
  function namaBulan(b) { return CONFIG.BULAN_NAMA[sah(b) - 1]; }
  function normPeringkat(p) { return p === 'pusat' ? 'pau' : p; }
  function getBulan(profil) { var p = profil || (S && S.loadPlayer()); return p ? sah(p.bulan) : 1; }

  function getFasa(bulan) {
    bulan = sah(bulan);
    var F = takwimSet().FASA;
    for (var i = 0; i < F.length; i++) {
      if (bulan >= F[i].mula && bulan <= F[i].tamat) { return F[i]; }
    }
    return F[0];
  }

  /* ------------------------------------------------------------------------
     3. TETINGKAP MESYUARAT / PENGUNDIAN
     ------------------------------------------------------------------------ */
  /** { mula, tamat, nama, status:'belum_tiba'|'dibuka'|'tamat', label:'Bulan 4-6' } */
  function getTetingkap(peringkat, bulan) {
    var t = takwimSet().TETINGKAP[normPeringkat(peringkat)];
    if (!t) { return null; }
    bulan = sah(bulan === undefined ? getBulan() : bulan);
    return {
      mula: t.mula, tamat: t.tamat, nama: t.nama, label: 'Bulan ' + t.mula + '-' + t.tamat,
      status: bulan < t.mula ? 'belum_tiba' : (bulan > t.tamat ? 'tamat' : 'dibuka')
    };
  }
  function statusTetingkap(peringkat, bulan) { var t = getTetingkap(peringkat, bulan); return t ? t.status : 'dibuka'; }

  /* ------------------------------------------------------------------------
     4. SUMBER BULANAN
     ------------------------------------------------------------------------ */
  function peringkatJawatan(j) {
    j = String(j || '');
    if (!j || j === 'Ahli Biasa') { return null; }
    if (/Bahagian/i.test(j)) { return 'bahagian'; }
    if (/Cawangan/i.test(j)) { return 'cawangan'; }
    return 'pusat';
  }

  /** Peringkat unik yang dipegang (jawatanList v3.0, atau jawatan tunggal sebagai sandaran). */
  function peringkatDipegang(p) {
    var out = [];
    (Array.isArray(p && p.jawatanList) ? p.jawatanList : []).forEach(function (j) {
      var k = j.peringkat === 'pusat' ? 'pusat' : j.peringkat;
      if (CONFIG.PERINGKAT_PARTI.indexOf(k) >= 0 && out.indexOf(k) < 0) { out.push(k); }
    });
    if (!out.length && p) { var per = peringkatJawatan(p.jawatan); if (per) { out.push(per); } }
    return out;
  }

  /**
   * Pendapatan bulanan: { jumlah, butiran:[{nama, jumlah}] }.
   * v8.12: tiada lagi elaun parti. Pendapatan kerjaya + elaun ADUN/MP, tolak kos operasi jawatan parti (js/kerjaya.js).
   * Jumlah dihadkan supaya dana tidak jatuh bawah 0.
   */
  function pendapatanBulanan(profil) {
    var p = profil || S.loadPlayer(), KJ = muat('MyPolitikKerjaya', 'kerjaya.js');
    var d = KJ && KJ.pendapatan ? KJ.pendapatan(p) : { jumlah: 0, butiran: [] };
    var jumlah = Math.max(d.jumlah, -(Number(p && p.myr) || 0));
    return { jumlah: jumlah, butiran: d.butiran };
  }

  /** v8.27: AP sebulan = asas (ikut kesukaran) + bonus jawatan (wakil rakyat/EXCO +1, Menteri ke atas +2); had simpanan ikut kesukaran. */
  function apTetapan(profil) {
    var p = profil || S.loadPlayer(), lvl = p && p.settings && p.settings.difficultyLevel, t = CONFIG.AP_IKUT_KESUKARAN[lvl] || CONFIG.AP_IKUT_KESUKARAN.NORMAL;
    var KJ = muat('MyPolitikKerjaya', 'kerjaya.js'), f = KJ && KJ.faktorKerjaya ? KJ.faktorKerjaya(p) : 1;
    var bonus = f === 0 ? CONFIG.AP_BONUS.menteri : (f < 1 ? CONFIG.AP_BONUS.wakil : 0);
    return { asas: t.bulanan, bonus: bonus, bulanan: t.bulanan + bonus, maks: t.maks };
  }

  /** Perubahan AP dan MYR pada permulaan bulan baharu. */
  function regenerasi(profil) {
    var p = profil || S.loadPlayer(), d = pendapatanBulanan(p);
    var susut = {};                                                    // v3.8: susutan sokongan bulanan
    Object.keys(CONFIG.SUSUT_BULANAN).forEach(function (k) { susut[k] = -CONFIG.SUSUT_BULANAN[k]; });
    if (peringkatDipegang(p).length) {
      var syKurang = (root.MyPolitikSayap && root.MyPolitikSayap.kurangSusutAkarUmbi) ? root.MyPolitikSayap.kurangSusutAkarUmbi(p) : 0;   // v5.9: Wanita
      susut.akarUmbi -= Math.max(0, CONFIG.SUSUT_PEMEGANG_JAWATAN - syKurang);
    }
    if (root.MyPolitikSayap && root.MyPolitikSayap.sokonganDilindungi && root.MyPolitikSayap.sokonganDilindungi(p)) { susut.akarUmbi = 0; susut.ajk = 0; }   // v6.5: Skuad Sayang melindungi sokongan Cawangan
    var at = apTetapan(p), apBaharu = Math.max(Number(p.ap) || 0, Math.min(at.maks, (Number(p.ap) || 0) + at.bulanan));   // v7.23: kumpul; tidak pernah mengurangkan baki sedia ada
    return { ap: apBaharu - p.ap, apBaharu: apBaharu, apTetapan: at, myr: d.jumlah, butiran: d.butiran, kesetiaan: susut };
  }

  /**
   * Bulan 1-3 (akar umbi): tambah IP dan sokongan positif. Pulang salinan `kesan`.
   * Dipanggil oleh ordinaryMember.js dan incumbent.js sebelum applyEffects().
   */
  function skalaKesan(profil, kesan) {
    var k = JSON.parse(JSON.stringify(kesan || {}));
    if (!profil || getFasa(getBulan(profil)).kod !== 'akar_umbi') { return k; }
    var f = 1 + CONFIG.BONUS_AKAR_UMBI;
    if (k.ip > 0) { k.ip = Math.round(k.ip * f); }
    if (k.kesetiaan) { Object.keys(k.kesetiaan).forEach(function (n) { if (k.kesetiaan[n] > 0) { k.kesetiaan[n] = Math.round(k.kesetiaan[n] * f); } }); }
    return k;
  }

  /* ------------------------------------------------------------------------
     5. TAKWIM
     ------------------------------------------------------------------------ */
  function getTakwim(profil) {
    var p = profil || (S && S.loadPlayer());
    if (!p) { return null; }
    var bulan = sah(p.bulan), fasa = getFasa(bulan), E = muat('MyPolitikElection', 'election.js');
    var pemilihan = E ? E.adalahTahunPemilihan(p.tahun) : ((p.tahun - 2026) % 3 === 0);
    var tahunBaharu = bulan >= 12;
    var jadual = CONFIG.BULAN_NAMA.map(function (nama, i) {
      var b = i + 1, f = getFasa(b), acara = [];
      var TT = takwimSet().TETINGKAP; Object.keys(TT).forEach(function (k) { if (b >= TT[k].mula && b <= TT[k].tamat) { acara.push(TT[k].nama); } });
      return { bulan: b, nama: nama, pendek: nama.slice(0, 3), fasa: f.kod, semasa: b === bulan, lepas: b < bulan, acara: acara };
    });
    return {
      tahun: p.tahun, bulan: bulan, namaBulan: namaBulan(bulan), pemilihan: pemilihan,
      fasa: fasa, bonusAkarUmbi: fasa.kod === 'akar_umbi' ? CONFIG.BONUS_AKAR_UMBI : 0,
      bulanSeterusnya: tahunBaharu ? 1 : bulan + 1, tahunSeterusnya: tahunBaharu ? p.tahun + 1 : p.tahun,
      tahunBaharuSeterusnya: tahunBaharu,
      tetingkap: { cawangan: getTetingkap('cawangan', bulan), sayap_cawangan: getTetingkap('sayap_cawangan', bulan), bahagian: getTetingkap('bahagian', bulan), sayap_bahagian: getTetingkap('sayap_bahagian', bulan), pau: getTetingkap('pau', bulan), sayap_pau: getTetingkap('sayap_pau', bulan) },
      jadual: jadual
    };
  }

  /* ------------------------------------------------------------------------
     6. MAJU BULAN
     ------------------------------------------------------------------------ */
  function mesejMasuk(bulan, tahun, tahunBaharu) {
    var f = getFasa(bulan), nb = namaBulan(bulan), out = [];
    var pbb = takwimSet() === CONFIG.PBB, mca = takwimSet() === CONFIG.MCA, mic = takwimSet() === CONFIG.MIC;
    if (takwimSet() === CONFIG.PPP || takwimSet() === CONFIG.PBRS) {                                            // v13.8: PPP (bulan sudah dalam bulan PPP; Ogos/Jun dilindungi daripada penukaran js/parti.js)
      if (bulan === 1) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 1 (' + nb + ' ' + tahun + '): ' + f.tajuk + '. ' + f.ringkas + '. Bonus +' + Math.round(CONFIG.BONUS_AKAR_UMBI * 100) + '% IP dan sokongan bagi tindakan sehingga bulan 2. Mandat perwakilan tahun lalu telah tamat; bertanding semula di Cawangan (bulan 3).' }); }
      else if (bulan === 3) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 3 (' + nb + '): Musim Mesyuarat & Pemilihan Cawangan dan Sayap dibuka. Hanya bulan ini.' }); }
      else if (bulan === 5) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 5 (' + nb + '): Mesyuarat & Pemilihan Bahagian dan Sayap dibuka. Hanya bulan ini.' }); }
      else if (bulan === 9) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 9 (' + nb + '): Perhimpunan Agung UMNO (PAU) dan Pemilihan Pusat. Hanya bulan ini.' }); }
      else if (bulan === 10) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 10 (' + nb + '): Pasca-PAU. Kembali ke akar umbi dan laksana tanggungjawab jawatan anda.' }); }
    } else if (mic) {                                                                   // v13.3: teks bulan sudah dalam bulan MIC; (Julai)/(Ogos) dilindungi daripada penukaran bulan js/parti.js
      if (bulan === 1) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 1 (' + nb + ' ' + tahun + '): ' + f.tajuk + '. ' + f.ringkas + '. Bonus +' + Math.round(CONFIG.BONUS_AKAR_UMBI * 100) + '% IP dan sokongan bagi tindakan sehingga bulan 2. Mandat perwakilan tahun lalu telah tamat; bertanding semula di Cawangan (bulan 3).' }); }
      else if (bulan === 3) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 3 (' + nb + '): Musim Mesyuarat & Pemilihan Cawangan dan Sayap dibuka. Hanya bulan ini.' }); }
      else if (bulan === 5) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 5 (' + nb + '): Mesyuarat & Pemilihan Bahagian dan Sayap dibuka. Hanya bulan ini.' }); }
      else if (bulan === 7) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 7 (Julai): Pemilihan Kongres Negeri dalam tahun pemilihan (kad MIC di tab Profil). Hanya bulan ini.' }); }
      else if (bulan === 9) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 9 (' + nb + '): Perhimpunan Agung UMNO (PAU) dan Pemilihan Pusat. Hanya bulan ini.' }); }
      else if (bulan === 10) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 10 (' + nb + '): Pasca-PAU. Kembali ke akar umbi dan laksana tanggungjawab jawatan anda.' }); }
      else if (bulan === 11) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 11 (' + nb + '): Yuran keahlian MIC RM 4 setahun mesti dibayar sebelum 30 November (Perkara 12.2).' }); }
    } else if (mca) {                                                                   // v13.1
      if (bulan === 1) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 1 (' + nb + ' ' + tahun + '): ' + f.tajuk + '. ' + f.ringkas + '. Bonus +' + Math.round(CONFIG.BONUS_AKAR_UMBI * 100) + '% IP dan sokongan bagi tindakan sehingga bulan 3. Mandat perwakilan tahun lalu telah tamat; bertanding semula di Cawangan (bulan 4).' }); }
      else if (bulan === 4) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 4 (' + nb + '): Musim Mesyuarat & Pemilihan Cawangan dan Sayap dibuka. Hanya bulan ini.' }); }
      else if (bulan === 6) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 6 (' + nb + '): Mesyuarat & Pemilihan Bahagian dan Sayap dibuka. Hanya bulan ini.' }); }
      else if (bulan === 8) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 8 (' + nb + '): Perhimpunan Agung UMNO (PAU) dan Pemilihan Pusat. Hanya bulan ini.' }); }
      else if (bulan === 9) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 9 (' + nb + '): Pasca-PAU. Kembali ke akar umbi dan laksana tanggungjawab jawatan anda.' }); }
    } else if (pbb) {
      if (bulan === 1) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 1 (' + nb + ' ' + tahun + '): ' + f.tajuk + '. ' + f.ringkas + '. Bonus +' + Math.round(CONFIG.BONUS_AKAR_UMBI * 100) + '% IP dan sokongan bagi tindakan sehingga bulan 2. Mandat perwakilan tahun lalu telah tamat; bertanding semula di Cawangan (bulan 3).' }); }
      else if (bulan === 3) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 3 (' + nb + '): Musim Mesyuarat & Pemilihan Cawangan dan Sayap dibuka. Hanya bulan ini.' }); }
      else if (bulan === 5) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 5 (' + nb + '): Mesyuarat & Pemilihan Bahagian dan Sayap dibuka. Hanya bulan ini.' }); }
      else if (bulan === 8) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 8 (' + nb + '): Perhimpunan Agung UMNO (PAU) dan Pemilihan Pusat. Hanya bulan ini.' }); }
      else if (bulan === 9) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 9 (' + nb + '): Pasca-PAU. Kembali ke akar umbi dan laksana tanggungjawab jawatan anda.' }); }
    } else if (takwimSet().lama) {                                               // v13.5: simpanan lama: tiada mesej bulan (takwim lama hingga hujung tahun)
    } else if (takwimSet().khas) {                                               // v13.5: musim pemilihan khas UMNO (Fasal 10.16)
      var TK = takwimSet().TETINGKAP;
      if (bulan === TK.cawangan.mula) { out.push({ jenis: 'fasa_bulan', mesej: 'Musim Pemilihan Khas selepas PRU (Fasal 10.16): Mesyuarat & Pemilihan Cawangan dan Sayap dibuka bulan ini (' + nb + ').' }); }
      else if (bulan === TK.bahagian.mula) { out.push({ jenis: 'fasa_bulan', mesej: 'Musim Pemilihan Khas: Mesyuarat Perwakilan Bahagian dan undi jawatan Pusat bulan ini (' + nb + ').' }); }
      else if (bulan === TK.pau.mula) { out.push({ jenis: 'fasa_bulan', mesej: 'Musim Pemilihan Khas: Perhimpunan Agung UMNO (PAU) bulan ini (' + nb + ').' }); }
    } else {
      if (bulan === 1) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 1 (' + nb + ' ' + tahun + '): ' + f.tajuk + '. ' + f.ringkas + '. Bonus +' + Math.round(CONFIG.BONUS_AKAR_UMBI * 100) + '% IP dan sokongan bagi tindakan sehingga bulan 3. Mandat perwakilan tahun lalu telah tamat; bertanding semula di Cawangan (bulan 4-5).' }); }
      else if (bulan === 4) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 4 (' + nb + '): Musim Mesyuarat & Pemilihan Cawangan dan Sayap dibuka (bulan 4-5).' }); }
      else if (bulan === 6) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 6 (' + nb + '): Mesyuarat Perwakilan Bahagian dan Sayap, termasuk undi jawatan Pusat dalam tahun pemilihan (Fasal 9.3). Hanya bulan ini.' }); }
      else if (bulan === 9) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 9 (' + nb + '): Perhimpunan Agung UMNO (PAU) di WTC Kuala Lumpur (Menara Dato\' Onn): Ucapan Dasar Presiden dan usul. Hanya bulan ini.' }); }
      else if (bulan === 10) { out.push({ jenis: 'fasa_bulan', mesej: 'Bulan 10 (' + nb + '): Pasca-PAU. Kembali ke akar umbi dan laksana tanggungjawab jawatan anda.' }); }
    }
    var TS = takwimSet().TETINGKAP; Object.keys(TS).forEach(function (k) {
      var t = TS[k];
      if (bulan === t.tamat && bulan !== t.mula) { out.push({ jenis: 'tetingkap_akhir', mesej: 'Bulan ' + bulan + ' ialah bulan terakhir untuk ' + t.nama + '.' }); }
    });
    return out;
  }

  /**
   * Selesaikan musim yang tamat pada bulan ini sebelum bulan bertukar:
   *  - mesyuarat yang sedang berjalan ditutup secara automatik
   *  - mesyuarat yang tidak dimulakan dianggap terlepas; pengundian yang sudah didaftarkan
   *    tetap diselesaikan oleh urus setia (tahun pemilihan)
   */
  function tutupMusim(p) {
    var M = muat('MyPolitikMeeting', 'meeting.js'), E = muat('MyPolitikElection', 'election.js'), out = [];
    if (!M) { return out; }
    var TS = takwimSet().TETINGKAP; Object.keys(TS).forEach(function (k) {
      var t = TS[k];
      if (sah(p.bulan) !== t.tamat) { return; }
      var lv = M.getKeadaanMesyuarat(S.loadPlayer()).peringkat.filter(function (x) { return x.kod === k; })[0];
      if (!lv) { return; }
      if (lv.status === 'sedang') {
        var r = M.tutupMesyuarat(k);
        if (r.ok) { out.push({ jenis: 'mesyuarat_ditutup_auto', mesej: t.nama + ' ditutup secara automatik kerana musim tamat. ' + r.mesej }); (r.peristiwa || []).forEach(function (e) { out.push(e); }); }
      } else if (lv.status === 'boleh_mula' || lv.status === 'terkunci') {     // terkunci = mesyuarat sayap tidak diselesaikan (v6.1): terlepas juga
        out.push({ jenis: 'mesyuarat_terlepas', mesej: t.nama + ' tahun ' + p.tahun + ' terlepas kerana tidak dihadiri.' });
        if (E) {
          (E.jalankanPemilihanPeringkat(k === 'pau' ? 'pusat' : k) || []).forEach(function (x) {
            if (x.ok) { out.push({ jenis: 'pemilihan_auto', mesej: 'Pengundian dijalankan oleh urus setia. ' + x.mesej }); (x.peristiwa || []).forEach(function (e) { out.push(e); }); }
          });
        }
      }
    });
    return out;
  }

  function snapshot(p) { return { ip: p.ip, myr: p.myr, ap: p.ap, reputasi: p.reputasi }; }

  /** Apa yang akan berlaku pada bulan seterusnya, untuk dialog pengesahan. */
  function pratonton(profil) {
    var p = profil || S.loadPlayer();
    if (!p) { return null; }
    var tk = getTakwim(p), amaran = [], pRg = p;
    if (tk.tahunBaharuSeterusnya) {                                   // v6.8: pratonton elaun selepas jawatan tamat penggal dibuang
      var JWp = muat('MyPolitikJawatan', 'jawatan.js');
      try {
        var klon = JSON.parse(JSON.stringify(p)); klon.tahun = p.tahun + 1;
        var sp = JWp && JWp.semakPenggalTamat ? JWp.semakPenggalTamat(klon) : null;
        if (sp) { klon.jawatanList = sp.patch.jawatanList; pRg = klon; amaran.push('Jawatan tamat penggal akan luput: ' + sp.dibuang.map(function (x) { return x.jawatan; }).join(', ') + '.'); }
      } catch (e) { pRg = p; }
    }
    var rg = regenerasi(pRg);
    var M = muat('MyPolitikMeeting', 'meeting.js');
    if (M) {
      var ms = M.getKeadaanMesyuarat(p);
      var TS = takwimSet().TETINGKAP; Object.keys(TS).forEach(function (k) {
        var t = TS[k];
        if (tk.bulan !== t.tamat) { return; }
        var lv = ms.peringkat.filter(function (x) { return x.kod === k; })[0];
        if (lv && lv.status === 'sedang') { amaran.push(t.nama + ' sedang berjalan dan akan ditutup secara automatik.'); }
        else if (lv && (lv.status === 'boleh_mula' || lv.status === 'terkunci')) { amaran.push(t.nama + ' belum dimulakan dan akan terlepas.'); }
      });
    }
    var fasaBaharu = getFasa(tk.bulanSeterusnya);
    return {
      dari: { bulan: tk.bulan, tahun: tk.tahun }, ke: { bulan: tk.bulanSeterusnya, tahun: tk.tahunSeterusnya },
      tahunBaharu: tk.tahunBaharuSeterusnya, fasaBaharu: fasaBaharu, regenerasi: rg, amaran: amaran
    };
  }

  /**
   * Maju ke bulan seterusnya. Bulan 12 -> bulan 1 tahun berikutnya.
   * Pulangan: { ok, bulanLama, tahunLama, bulan, tahun, tahunBaharu, fasa, regenerasi, perubahan,
   *             peristiwa:[{jenis,mesej}], mesej, profil } atau { ok:false, kod, ralat }
   */
  function majuBulan() {
    var p = S && S.loadPlayer();
    if (!p) { return gagal('tiada_profil', 'Tiada profil pemain.'); }
    if (p.tamat) { return gagal('kerjaya_tamat', 'Kerjaya anda telah tamat. Mulakan permainan baharu.'); }     // v5.0
    if (p.harta && p.harta.menunggu) { return gagal('harta_menunggu', 'Jawab Pengisytiharan Harta SPRM yang wajib dahulu (tab Harta).'); }   // v8.13
    if ((p.pru && p.pru.aktif) || (p.prk && p.prk.aktif)) { return gagal('pru_aktif', 'Pilihan raya sedang berlangsung. Selesaikan pencalonan, kempen dan keputusan dahulu.'); }     // v7.3
    var asal = snapshot(p), bulanLama = sah(p.bulan), tahunLama = p.tahun, peristiwa = [];

    peristiwa = peristiwa.concat(tutupMusim(p));
    p = S.loadPlayer();
    var tahunBaharu = bulanLama >= 12, bulan = tahunBaharu ? 1 : bulanLama + 1, tahun = tahunBaharu ? tahunLama + 1 : tahunLama;
    var rg = regenerasi(p), E = muat('MyPolitikElection', 'election.js'), r;

    if (tahunBaharu && E && E.majuTahun) {
      r = E.majuTahun({ pulihAP: false });                // tahun + 1, bulan = 1, kitaran dikemas kini; v7.23: AP dikumpul melalui regenerasi (bukan ditetapkan semula)
      if (!r.ok) { return r; }
      peristiwa = peristiwa.concat(r.peristiwa || []);
      var JW0 = muat('MyPolitikJawatan', 'jawatan.js');                                      // v6.8: jawatan yang tidak dipertahankan luput SEBELUM elaun dikira
      if (JW0 && JW0.kemaskiniPenggal) { peristiwa = peristiwa.concat(JW0.kemaskiniPenggal().peristiwa || []); rg = regenerasi(S.loadPlayer()); }
      r = S.applyEffects({ ap: rg.ap, myr: rg.myr, kesetiaan: rg.kesetiaan }, { kiraTindakan: false, tanpaKesukaran: true, log: { tindakan: 'regenerasi', nama: 'Pendapatan bulan ' + bulan + ' ' + tahun, peringkat: 'bulan' } });
    } else {
      r = S.applyEffects({ ap: rg.ap, myr: rg.myr, kesetiaan: rg.kesetiaan }, {
        kiraTindakan: false, tanpaKesukaran: true, patch: tahunBaharu ? { bulan: bulan, tahun: tahun } : { bulan: bulan },
        log: { tindakan: 'bulan_baharu', nama: 'Bulan ' + bulan + ' (' + namaBulan(bulan) + ') ' + tahun, peringkat: 'bulan' }
      });
    }
    if (!r.ok) { return r; }

    var STR = muat('MyPolitikStres', 'stress.js');                                              // v5.6: stress dan kesihatan bulanan
    if (STR) { peristiwa = peristiwa.concat(STR.prosesBulan().peristiwa || []); }

    var JW = muat('MyPolitikJawatan', 'jawatan.js');                                           // v6.8: penggal tamat (jawatan tidak dipertahankan luput)
    if (JW && JW.kemaskiniPenggal) { peristiwa = peristiwa.concat(JW.kemaskiniPenggal().peristiwa || []); }
    var MIS = muat('MyPolitikMisi', 'misi.js');                                                 // v6.7: Undi Tidak Percaya sayap
    if (MIS && MIS.prosesBulan) { peristiwa = peristiwa.concat(MIS.prosesBulan().peristiwa || []); }

    var RVL = muat('MyPolitikRival', 'rival.js');                                               // v7.28: AI pencabar bergerak pada akhir setiap bulan
    if (RVL && RVL.tick) { peristiwa = peristiwa.concat(RVL.tick().peristiwa || []); }

    var PBRSm = muat('MyPolitikPBRS', 'pbrs.js');                                              // v13.9: PBRS (Dua Gabungan: BN & GRS, kuota PRN Sabah)
    if (PBRSm && PBRSm.prosesBulan) { peristiwa = peristiwa.concat(PBRSm.prosesBulan().peristiwa || []); }
    var PPPm = muat('MyPolitikPPP', 'ppp.js');                                                 // v13.8: PPP (Tuntut Kerusi BN, krisis kepimpinan & ROS)
    if (PPPm && PPPm.prosesBulan) { peristiwa = peristiwa.concat(PPPm.prosesBulan().peristiwa || []); }
    var MICm = muat('MyPolitikMIC', 'mic.js');                                                 // v13.3: peraturan khas MIC
    if (MICm && MICm.prosesBulan) { peristiwa = peristiwa.concat(MICm.prosesBulan().peristiwa || []); }
    var UMm = muat('MyPolitikUMNO', 'umno.js');                                                // v13.5: Perlembagaan UMNO 2025 (tangguh pemilihan, lantikan, Perhimpunan Agung Khas)
    if (UMm && UMm.prosesBulan) { peristiwa = peristiwa.concat(UMm.prosesBulan().peristiwa || []); }
    var MCAm = muat('MyPolitikMCA', 'mca.js');                                                 // v13.1: peraturan khas MCA (kehadiran, had Presiden, sumbangan, lantikan)
    if (MCAm && MCAm.prosesBulan) { peristiwa = peristiwa.concat(MCAm.prosesBulan().peristiwa || []); }

    var ISU = muat('MyPolitikIsu', 'isu.js');                                                  // v12.2: Isu Semasa
    if (ISU && ISU.prosesBulan) { peristiwa = peristiwa.concat(ISU.prosesBulan().peristiwa || []); }

    var TUL = muat('MyPolitikTular', 'tular.js');                                              // v12.9: krisis tular media sosial
    if (TUL && TUL.prosesBulan) { peristiwa = peristiwa.concat(TUL.prosesBulan().peristiwa || []); }

    var JMH = muat('MyPolitikJemaah', 'jemaah.js');                                            // v12.1: kesetiaan Jemaah Menteri melaras Tekanan Politik PM
    if (JMH && JMH.prosesBulan) { peristiwa = peristiwa.concat(JMH.prosesBulan().peristiwa || []); }

    var NGR = muat('MyPolitikNegeri', 'negeri.js');                                            // v7.34: lantikan Badan Perhubungan Negeri (bulan 9 tahun pemilihan)
    if (NGR && NGR.prosesBulan) { peristiwa = peristiwa.concat(NGR.prosesBulan().peristiwa || []); }

    var HY = tahunBaharu ? muat('MyPolitikHayat', 'hayat.js') : null;                       // v5.0: umur +1 dan semakan kesihatan
    if (HY) {
      var ht = HY.prosesTahunBaharu();
      peristiwa = peristiwa.concat(ht.peristiwa || []);
      if (!ht.tamat && HY.prosesPeralihanKategori) { peristiwa = peristiwa.concat(HY.prosesPeralihanKategori().peristiwa || []); }   // v5.1: kategori bertukar mengikut umur pada tahun baharu
    }

    var MIS2 = tahunBaharu ? muat('MyPolitikMisi', 'misi.js') : null;                        // v6.7: notis rasmi transisi umur
    if (MIS2 && MIS2.prosesTahunBaharu) { peristiwa = peristiwa.concat(MIS2.prosesTahunBaharu().peristiwa || []); }
    var BLK = tahunBaharu ? muat('MyPolitikBlok', 'blok.js') : null;                        // v6.6: Penetapan Calon, janji kuota sayap
    if (BLK && BLK.prosesTahunBaharu) { peristiwa = peristiwa.concat(BLK.prosesTahunBaharu().peristiwa || []); }

    var KAB = muat('MyPolitikKabinet', 'kabinet.js');                                           // v7.4: elaun & acara pentadbiran bulanan
    if (KAB && KAB.prosesBulan) { peristiwa = peristiwa.concat(KAB.prosesBulan().peristiwa || []); }
    var IGT = muat('MyPolitikIntegriti', 'integriti.js');                                       // v7.58: Whip, Disiplin Parti & Audit SPRM
    if (IGT && IGT.prosesBulan) { peristiwa = peristiwa.concat(IGT.prosesBulan().peristiwa || []); }
    var MDA = muat('MyPolitikMedia', 'media.js');                                                // v7.59: Jentera Media Digital (sidang media rawak, persepsi)
    if (MDA && MDA.prosesBulan) { peristiwa = peristiwa.concat(MDA.prosesBulan().peristiwa || []); }
    var SMP = muat('MyPolitikSampingan', 'sampingan.js');                                       // v7.64: Aktiviti Sampingan (syarikat / NGO)
    if (SMP && SMP.prosesBulan) { peristiwa = peristiwa.concat(SMP.prosesBulan().peristiwa || []); }
    var HRT = muat('MyPolitikHarta', 'harta.js');                                               // v8.13: aset, cukai terkumpul, pengisytiharan harta SPRM
    if (HRT && HRT.prosesBulan) { peristiwa = peristiwa.concat(HRT.prosesBulan().peristiwa || []); }
    var KWS = muat('MyPolitikKawasan', 'kawasan.js');                                           // v8.18: Peruntukan Kawasan bulanan
    if (KWS && KWS.prosesBulan) { peristiwa = peristiwa.concat(KWS.prosesBulan().peristiwa || []); }
    var KOM = muat('MyPolitikKomuniti', 'komuniti.js');                                         // v8.23: ganjaran, risiko dan tamat jawatan komuniti
    if (KOM && KOM.prosesBulan) { peristiwa = peristiwa.concat(KOM.prosesBulan().peristiwa || []); }
    var GLC = muat('MyPolitikGLC', 'glc.js');                                                   // v8.19: ganjaran, risiko dan tamat jawatan GLC
    if (GLC && GLC.prosesBulan) { peristiwa = peristiwa.concat(GLC.prosesBulan().peristiwa || []); }
    var INC = muat('MyPolitikIncumbent', 'incumbent.js');                                        // v8.9: meter Atas Pagar reput ke arah 30%
    if (INC && INC.prosesBulan) { peristiwa = peristiwa.concat(INC.prosesBulan().peristiwa || []); }
    var KRP = muat('MyPolitikKrisisPeta', 'krisis-peta.js');                                     // v8.8: krisis tempatan berlokasi di peta
    if (KRP && KRP.prosesBulan) { peristiwa = peristiwa.concat(KRP.prosesBulan().peristiwa || []); }
    var DWN = muat('MyPolitikDewan', 'dewan.js');                                               // v7.55: Dewan Rakyat (undi tidak percaya, soalan lisan)
    if (DWN && DWN.prosesBulan) { peristiwa = peristiwa.concat(DWN.prosesBulan().peristiwa || []); }
    var DUNS = muat('MyPolitikDUN', 'dun.js');                                                  // v7.56: sidang DUN (ADUN / EXCO)
    if (DUNS && DUNS.prosesBulan) { peristiwa = peristiwa.concat(DUNS.prosesBulan().peristiwa || []); }
    var PRU = muat('MyPolitikPRU', 'pru.js');                                                   // v7.3: pengisytiharan PRU/PRN & penilaian manifesto
    if (PRU && PRU.prosesBulan) { peristiwa = peristiwa.concat(PRU.prosesBulan().peristiwa || []); }
    var GLN = muat('MyPolitikGelaran', 'gelaran.js');                                           // v7.64: Anugerah & Gelaran Kurniaan
    if (GLN && GLN.prosesBulan) { peristiwa = peristiwa.concat(GLN.prosesBulan().peristiwa || []); }
    var PRK = muat('MyPolitikPRK', 'prk.js');                                                   // v7.6: sentimen nasional & PRK pertengahan penggal
    if (PRK && PRK.prosesBulan) { peristiwa = peristiwa.concat(PRK.prosesBulan().peristiwa || []); }

    peristiwa = peristiwa.concat(mesejMasuk(bulan, tahun, tahunBaharu));
    var akhir = S.loadPlayer();
    return {
      ok: true, bulanLama: bulanLama, tahunLama: tahunLama, bulan: bulan, tahun: tahun, tahunBaharu: tahunBaharu,
      fasa: getFasa(bulan), regenerasi: rg,
      perubahan: { ip: akhir.ip - asal.ip, myr: akhir.myr - asal.myr, ap: akhir.ap - asal.ap, reputasi: akhir.reputasi - asal.reputasi },
      peristiwa: peristiwa,
      mesej: 'Bulan ' + bulan + ' (' + namaBulan(bulan) + ') ' + tahun + ': AP +' + Math.max(0, akhir.ap - asal.ap) + (akhir.ap >= rg.apTetapan.maks ? ' (had ' + rg.apTetapan.maks + ' dicapai)' : ' (had ' + rg.apTetapan.maks + ')') + ', elaun +MYR ' + rg.myr.toLocaleString('ms-MY') + '. Sokongan susut jika tidak dijaga.',   // v8.0: tambahan AP sebenar
      profil: akhir
    };
  }

  return {
    CONFIG: CONFIG,
    namaBulan: namaBulan,
    apTetapan: apTetapan,
    getBulan: getBulan,
    getFasa: getFasa,
    getTetingkap: getTetingkap,
    statusTetingkap: statusTetingkap,
    peringkatDipegang: peringkatDipegang,
    pendapatanBulanan: pendapatanBulanan,
    regenerasi: regenerasi,
    skalaKesan: skalaKesan,
    getTakwim: getTakwim,
    takwimSet: takwimSet,
    takwimKhas: takwimKhas,
    pratonton: pratonton,
    majuBulan: majuBulan
  };
});
