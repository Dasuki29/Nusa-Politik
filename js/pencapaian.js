/* ==========================================================================
   Nusa Politik — js/pencapaian.js   (v8.6, v13.30: 10 pencapaian kerjaya tambahan)
   Sistem Pencapaian & Trofi (achievementsSystem).

   Reka bentuk:
   - Simpanan BERASINGAN (kunci 'myPolitik_pencapaian'), bukan dalam profil pemain, supaya
     modul lain yang menyimpan profil lama tidak memadam trofi. Trofi kekal merentas watak;
     pembilang kemajuan (jejak) dikunci mengikut id pemain.
   - semak(p, meta, st) ialah fungsi tulen: tidak menyimpan apa-apa, pulang { st, baru }.
     proses(meta) memuat profil, memanggil semak() dan menyimpan. Dipanggil oleh
     js/pencapaian-ui.js setiap kali profil disimpan (MyPolitikSave.subscribe).
   - Mod Latihan Amir tidak melayakkan trofi.

   Syarat (andaian dilaporkan dalam CHANGELOG):
   - akar_umbi_teguh : menang pemilihan Ketua Cawangan tanpa pernah kalah mana-mana pemilihan
                       jawatan sebelum itu (kekalahan perwakilan tidak dikira).
   - ikon_sayap      : memegang Ketua sayap Bahagian terkumpul 72 bulan (2 penggal x 3 tahun).
   - wira_pru        : menang kerusi PRU di kawasan berprofil URBAN atau MIXED.
   - bapa_reformasi  : memegang kerusi wakil rakyat dan Integriti Parti > 90 pada setiap
                       semakan bulanan selama 60 bulan berturut-turut (satu penggal Parlimen).
   - negarawan_utama : jawatan kerajaan Menteri Penuh, Timbalan Perdana Menteri atau Perdana Menteri.

   API (window.MyPolitikPencapaian):
     SENARAI                  pangkalan data pencapaian
     muat() / simpan(st)      baca / tulis simpanan
     semak(p, meta, st)       -> { st, baru:[id] }  (tulen)
     proses(meta)             semak + simpan; pulang senarai id baharu
     kemajuan(p, st, id)      teks kemajuan untuk pencapaian berkunci
     bilBaru(st)              bilangan trofi belum dilihat
     tandaDilihat()           tandakan semua sudah dilihat
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikPencapaian = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  var KUNCI = 'myPolitik_pencapaian';
  var BULAN_SAYAP = 72, BULAN_INTEGRITI = 60, SKOR_INTEGRITI = 90;
  var TAHAP_NEGARAWAN = ['MENTERI_PENUH', 'TIMBALAN_PM', 'PERDANA_MENTERI'];

  var SENARAI = [
    { id: 'akar_umbi_teguh', ikon: '🏆', nama: 'Akar Umbi Teguh', huraian: 'Menang jawatan Ketua Cawangan tanpa kekalahan pemilihan.' },
    { id: 'ikon_sayap', ikon: '🏆', nama: 'Ikon Sayap', huraian: 'Pimpin sayap di peringkat Bahagian selama 2 penggal.' },
    { id: 'wira_pru', ikon: '🏆', nama: 'Wira PRU (Giant Killer)', huraian: 'Menang kerusi di kawasan Bandar/Campuran yang mencabar.' },
    { id: 'bapa_reformasi', ikon: '🏆', nama: 'Bapa Reformasi', huraian: 'Skor integriti melebihi 90 sepanjang satu penggal Parlimen.' },
    { id: 'negarawan_utama', ikon: '🏆', nama: 'Negarawan Utama', huraian: 'Dilantik Menteri Penuh atau Perdana Menteri.' },
    // v13.30 (maklum balas pemain, mockup dipersetujui)
    { id: 'ketua_negeri', ikon: '🏛️', nama: 'Ketua Kerajaan Negeri', huraian: 'Dilantik Menteri Besar / Ketua Menteri / Premier.' },
    { id: 'perdana_menteri', ikon: '⭐', nama: 'Perdana Menteri', huraian: 'Dilantik Perdana Menteri.' },
    { id: 'hatrik_pru', ikon: '🎯', nama: 'Hatrik PRU', huraian: 'Menang kerusi dalam 3 PRU berturut-turut.' },
    { id: 'raja_prk', ikon: '🔄', nama: 'Raja PRK', huraian: 'Menang satu Pilihan Raya Kecil.' },
    { id: 'nakhoda_parti', ikon: '👔', nama: 'Nakhoda Parti', huraian: 'Menang jawatan Presiden parti.' },
    { id: 'tokoh_negara', ikon: '🌏', nama: 'Tokoh Seluruh Negara', huraian: 'Gelaran daripada 3 negeri lain.' },
    { id: 'tun', ikon: '🎖️', nama: 'Tun', huraian: 'Dikurniakan gelaran Tun.' },
    { id: 'suara_rakyat', ikon: '📢', nama: 'Suara Rakyat', huraian: 'Selesaikan 20 keluhan / isu tempatan.' },
    { id: 'penggubal', ikon: '📜', nama: 'Penggubal Undang-undang', huraian: 'Bentang 5 RUU yang lulus di Dewan.' },
    { id: 'doktor_falsafah', ikon: '🎓', nama: 'Doktor Falsafah', huraian: 'Tamatkan PhD (gelaran Dr.).' },
    { id: 'jutawan_politik', ikon: '💰', nama: 'Jutawan Politik', huraian: 'Dana peribadi mencecah RM 1 juta tanpa kes SPRM.' }
  ];
  var KELUHAN_SASAR = 20, RUU_SASAR = 5, NEGERI_SASAR = 3, JUTA = 1000000;

  function storan() { try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; } }
  function kosong() { return { dibuka: {}, jejak: {}, dilihat: {} }; }

  function muat() {
    var s = storan(), st = kosong();
    try {
      var r = s ? JSON.parse(s.getItem(KUNCI) || 'null') : null;
      if (r && typeof r === 'object') {
        st.dibuka = r.dibuka && typeof r.dibuka === 'object' ? r.dibuka : {};
        st.jejak = r.jejak && typeof r.jejak === 'object' ? r.jejak : {};
        st.dilihat = r.dilihat && typeof r.dilihat === 'object' ? r.dilihat : {};
      }
    } catch (e) { /* simpanan rosak: mula semula */ }
    return st;
  }
  function simpan(st) {
    var s = storan();
    try { if (s) { s.setItem(KUNCI, JSON.stringify(st)); return true; } } catch (e) { /* abaikan */ }
    return false;
  }

  function jawatanSayapBahagian(p) {
    return (p.jawatanList || []).some(function (j) { return j && typeof j.kod === 'string' && j.kod.indexOf('sayap_bahagian_') === 0; });
  }
  function profilKawasanPRU(p) {
    var pru = p.pru && typeof p.pru === 'object' ? p.pru : null;
    if (pru && pru.profil) { return pru.profil; }
    var M = root.MyPolitikPRU;
    try { return M && M.profilKawasan ? M.profilKawasan(p) : null; } catch (e) { return null; }
  }

  /** Semak semua syarat. Tulen: salinan st dipulangkan; p dan simpanan tidak diubah. */
  function semak(p, meta, stAsal) {
    var st = JSON.parse(JSON.stringify(stAsal || kosong())), baru = [];
    if (!p || typeof p !== 'object' || !p.id) { return { st: st, baru: baru }; }
    var jej = st.jejak[p.id] = Object.assign({ kalah: 0, bulanSayap: 0, bulanIntegriti: 0, kunci: 0, mandat: '', keluhan: 0, ruu: 0 }, st.jejak[p.id] || {});
    var tindakan = meta && meta.tindakan ? String(meta.tindakan) : '';
    function buka(id) {
      if (st.dibuka[id]) { return; }
      st.dibuka[id] = { tahun: p.tahun, bulan: p.bulan, watak: p.nama || '' };
      baru.push(id);
    }

    /* 1. Pemilihan jawatan (log terkini ialah keputusan yang baru disimpan) */
    var l0 = Array.isArray(p.log) ? p.log[0] : null;
    if (/^pemilihan_/.test(tindakan) && !/perwakilan/.test(tindakan) && l0 && l0.tindakan === tindakan) {
      if (/^Kalah/.test(l0.nama || '')) { jej.kalah += 1; }
      else if (/^Menang/.test(l0.nama || '') && tindakan === 'pemilihan_ketua_cawangan' && jej.kalah === 0) { buka('akar_umbi_teguh'); }
    }

    /* 2. Keputusan PRU */
    if (tindakan === 'pru_keputusan') {
      var sej = (p.pru && p.pru.sejarah) || [], menang = sej.slice(-2).some(function (r) { return r && r.hasil === 'menang'; });
      var prof = profilKawasanPRU(p);
      if (menang && (prof === 'URBAN' || prof === 'MIXED')) { buka('wira_pru'); }
    }

    /* 3. Pembilang bulanan (sekali setiap bulan permainan) */
    var kunci = (Number(p.tahun) || 0) * 12 + (Number(p.bulan) || 0);
    if (kunci > jej.kunci) {
      if (jej.kunci > 0) {
        if (jawatanSayapBahagian(p)) { jej.bulanSayap += 1; }
        var st0 = p.pru && p.pru.status, sk = p.integriti && Number(p.integriti.skor);
        var mandat = st0 ? (st0.jenis + '|' + st0.kerusi + '|' + st0.sejakTahun + '|' + st0.sejakBulan) : '';
        if (!mandat || mandat !== jej.mandat || !(sk > SKOR_INTEGRITI)) { jej.bulanIntegriti = 0; }
        jej.mandat = mandat;
        if (mandat && sk > SKOR_INTEGRITI) { jej.bulanIntegriti += 1; }
      }
      jej.kunci = kunci;
    }
    if (jej.bulanSayap >= BULAN_SAYAP) { buka('ikon_sayap'); }
    if (jej.bulanIntegriti >= BULAN_INTEGRITI) { buka('bapa_reformasi'); }

    /* 4. Jawatan kerajaan */
    var k = p.kabinet;
    if (k && k.hasGovernmentRole && TAHAP_NEGARAWAN.indexOf(k.roleLevel) >= 0) { buka('negarawan_utama'); }

    /* 5. v13.30: pencapaian kerjaya tambahan */
    if (k && k.hasGovernmentRole && k.roleLevel === 'MENTERI_BESAR') { buka('ketua_negeri'); }
    if (k && k.hasGovernmentRole && k.roleLevel === 'PERDANA_MENTERI') { buka('perdana_menteri'); }
    if (hatrik(p)) { buka('hatrik_pru'); }
    var prk = p.prk && Array.isArray(p.prk.sejarah) ? p.prk.sejarah : [];
    if (prk.some(function (r) { return r && r.hasil === 'menang'; }) || [p.pru && p.pru.status, p.pru && p.pru.statusKedua].some(function (x) { return x && x.prk; })) { buka('raja_prk'); }
    if ((p.jawatanList || []).some(function (j) { return j && j.kod === 'presiden'; })) { buka('nakhoda_parti'); }
    var gl = p.gelaran || {};
    if (Array.isArray(gl.luar) && gl.luar.length >= NEGERI_SASAR) { buka('tokoh_negara'); }
    if (gl.tun) { buka('tun'); }
    if (/^(kawasan_selesai|kawasan_dana|isu_dana)$/.test(tindakan) && l0 && l0.tindakan === tindakan) { jej.keluhan += 1; }
    if (bilKeluhan(p, jej) >= KELUHAN_SASAR) { buka('suara_rakyat'); }
    if (tindakan === 'dewan_undi' && l0 && l0.tindakan === tindakan && /^Lulus: /.test(l0.nama || '')) {
      var sj = p.dewan && Array.isArray(p.dewan.sejarah) ? p.dewan.sejarah : [], akhir = sj[sj.length - 1];
      if (akhir && akhir.jenis === 'ruu' && akhir.lulus) { jej.ruu += 1; }
    }
    if (jej.ruu >= RUU_SASAR) { buka('penggubal'); }
    if (p.pendidikan && p.pendidikan.tahap === 'phd') { buka('doktor_falsafah'); }
    if ((Number(p.myr) || 0) >= JUTA && !(p.integriti && p.integriti.audit) && !(p.etika && p.etika.siasatan)) { buka('jutawan_politik'); }

    baru.forEach(function (id) { delete st.dilihat[id]; });
    return { st: st, baru: baru };
  }

  /** v13.30: menang kerusi dalam 3 PRU berturut-turut (rekod p.pru.sejarah dikumpul ikut tarikh PRU). */
  function hatrik(p) {
    var sej = (p.pru && Array.isArray(p.pru.sejarah)) ? p.pru.sejarah : [], ikut = {};
    sej.forEach(function (r) { if (!r) { return; } var kk = (r.tahun || 0) * 12 + (r.bulan || 0); ikut[kk] = ikut[kk] || (r.hasil === 'menang'); });
    var kunci = Object.keys(ikut).map(Number).sort(function (a, b) { return a - b; }), siri = 0, maks = 0;
    kunci.forEach(function (kk) { siri = ikut[kk] ? siri + 1 : 0; maks = Math.max(maks, siri); });
    return maks >= 3;
  }
  function bilKeluhan(p, jej) {
    var isu = Array.isArray(p.isu) ? p.isu : [];
    return (jej.keluhan || 0) + isu.filter(function (x) { return x && x.selesai && x.cara !== 'dana_peribadi'; }).length;
  }
  function latihanAktif() { var L = root.MyPolitikLatihan; try { return !!(L && L.aktif && L.aktif()); } catch (e) { return false; } }

  /** Muat profil, semak, simpan jika ada perubahan. Pulang senarai id baharu. */
  function proses(meta) {
    var S = root.MyPolitikSave;
    if (!S || latihanAktif()) { return []; }
    var p = S.loadPlayer();
    if (!p) { return []; }
    var lama = muat(), h = semak(p, meta, lama);
    if (JSON.stringify(h.st) !== JSON.stringify(lama)) { simpan(h.st); }
    return h.baru;
  }

  function kemajuan(p, st, id) {
    var j = (st && st.jejak && p && st.jejak[p.id]) || {};
    if (id === 'ikon_sayap') { return (j.bulanSayap || 0) + ' / ' + BULAN_SAYAP + ' bulan'; }
    if (id === 'bapa_reformasi') { return (j.bulanIntegriti || 0) + ' / ' + BULAN_INTEGRITI + ' bulan berturut-turut'; }
    if (id === 'suara_rakyat') { return Math.min(bilKeluhan(p, j), KELUHAN_SASAR) + ' / ' + KELUHAN_SASAR; }
    if (id === 'penggubal') { return Math.min(j.ruu || 0, RUU_SASAR) + ' / ' + RUU_SASAR + ' RUU'; }
    if (id === 'tokoh_negara') { var lu = p.gelaran && Array.isArray(p.gelaran.luar) ? p.gelaran.luar.length : 0; return Math.min(lu, NEGERI_SASAR) + ' / ' + NEGERI_SASAR + ' negeri'; }
    if (id === 'jutawan_politik') { return 'RM ' + Math.round(Number(p.myr) || 0).toLocaleString('en') + ' / RM 1,000,000'; }
    if (id === 'akar_umbi_teguh') { return j.kalah ? 'Kalah pemilihan jawatan: ' + j.kalah + ' (syarat gagal untuk watak ini)' : ''; }
    return '';
  }

  function bilBaru(st) {
    st = st || muat();
    return Object.keys(st.dibuka).filter(function (id) { return !st.dilihat[id]; }).length;
  }
  function tandaDilihat() {
    var st = muat(), ubah = false;
    Object.keys(st.dibuka).forEach(function (id) { if (!st.dilihat[id]) { st.dilihat[id] = 1; ubah = true; } });
    if (ubah) { simpan(st); }
  }

  return {
    KUNCI: KUNCI, SENARAI: SENARAI, BULAN_SAYAP: BULAN_SAYAP, BULAN_INTEGRITI: BULAN_INTEGRITI,
    muat: muat, simpan: simpan, semak: semak, proses: proses, kemajuan: kemajuan, bilBaru: bilBaru, tandaDilihat: tandaDilihat
  };
});
