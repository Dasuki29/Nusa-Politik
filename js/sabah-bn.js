/* ==========================================================================
   Nusa Politik — js/sabah-bn.js   (v13.16)
   MCA & MIC di Sabah (mockup "MCA & MIC Sabah", dipersetujui). Kedudukan kedua-dua parti lemah selepas 2018:
     - MCA Sabah kalah 4 kerusi DUN pada PRN 2020 (Kapayan, Likas, Karamunting, Elopura) dan 2 kerusi pada PRN 2025 (Tanjong Kapor, Karamunting).
     - MIC Sabah: 25 cawangan, tidak bertanding (pengundi India kecil).
   Meter Pemulihan Sabah (andaian): mula 20, susut 1 sebulan ke arah 20.
     Khidmat Masyarakat Bandar: 1 AP, RM 1,000, +5 (sekali sebulan).
     Jentera untuk calon BN Sabah (musim PRN: 6 bulan sebelum PRN Sabah atau semasa PRN): 2 AP, +6, hubungan gabungan +2 (sekali sebulan).
     Selepas PRN: kalah kerusi −10, menang kerusi +15.
   MCA Sabah (andaian): kuota DUN 2 / 3 / 4 dan Parlimen 0 / 0 / 1 ikut Pemulihan (<50 / 50-69 / >=70), dipilih daripada 6 DUN sasaran
     (DUN pemain didahulukan). Kekuatan kerusi: ofset −12, berkurang 1 bagi setiap 10 Pemulihan melebihi 20. Lawan: Warisan, DAP, GRS.
   MIC Sabah: tiada kuota kerusi. Senator (andaian): selepas PRN Sabah, Ketua Bahagian ke atas di Sabah dengan Pemulihan >= 60,
     peluang 30%; penggal 36 bulan, IP +10 dan RM 2,000 sebulan.
   State: p.sbn = { pemulihan, khidmat, jentera, semakPRN, senator:{mula,sehingga}|null, sejarah:[] }.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikSabahBN = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function HY() { return modul('MyPolitikHayat', 'hayat.js'); }
  function DATA(p) { return p && p.parti === 'MIC' ? modul('MyPolitikMICData', 'mic-data.js') : modul('MyPolitikMCAData', 'mca-data.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  var rngLalai = Math.random;
  function rng(o) { return (o && o.rng) || rngLalai; }
  var BULAN = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  function tb(i) { return BULAN[(i - 1) % 12] + ' ' + Math.floor((i - 1) / 12); }

  var CONFIG = {
    MULA: 20, SUSUT: 1,
    KHIDMAT: { ap: 1, myr: 1000, naik: 5 },
    JENTERA: { ap: 2, naik: 6, hubungan: 2, bulanSebelum: 6 },
    PRN: { kalah: -10, menang: 15 },
    KUOTA: [{ min: 70, dun: 4, pl: 1 }, { min: 50, dun: 3, pl: 0 }, { min: 0, dun: 2, pl: 0 }],
    OFSET: { asas: -12, setiap: 10 },
    SENATOR: { pemulihan: 60, peluang: 0.3, bulan: 36, ip: 10, myr: 2000, pangkat: 7 }
  };

  /** Pemain MCA atau MIC yang berpangkalan di Sabah. */
  function adalah(p) { return !!p && (p.parti === 'MCA' || p.parti === 'MIC') && /sabah/i.test(String(p.negeri || '')); }
  function dasar() { return { pemulihan: CONFIG.MULA, khidmat: 0, jentera: 0, semakPRN: 0, senator: null, sejarah: [] }; }
  function getSBN(p) {
    var b = dasar(), x = p && p.sbn && typeof p.sbn === 'object' ? p.sbn : {};
    for (var k in b) { if (x[k] === undefined) { x[k] = b[k]; } }
    if (!Array.isArray(x.sejarah)) { x.sejarah = []; }
    return x;
  }
  function rekod(s, p, teks) { s.sejarah = s.sejarah.concat([{ tahun: p.tahun, bulan: p.bulan, teks: teks }]).slice(-10); }
  function simpan(s, kesan, log, patch) { var pt = patch || {}; pt.sbn = s; return S().applyEffects(kesan || {}, { kiraTindakan: false, patch: pt, log: log }); }

  /* ---------- Kuota & kekuatan kerusi (MCA Sabah) ---------- */
  function tahapKuota(p) { var n = getSBN(p).pemulihan; for (var i = 0; i < CONFIG.KUOTA.length; i++) { if (n >= CONFIG.KUOTA[i].min) { return CONFIG.KUOTA[i]; } } return CONFIG.KUOTA[CONFIG.KUOTA.length - 1]; }
  function kodDUN(p, d) { var k = p && p.kod; if (!k || !k.dun || !(parseInt(k.dun, 10) > 0)) { return null; } return '12_N.' + String(parseInt(k.dun, 10)).padStart(2, '0'); }
  /** Senarai DUN kuota MCA Sabah (DUN pemain didahulukan jika sasaran). */
  function senaraiKuota(p) {
    var d = DATA(p), sas = (d && d.sasaranSabah) || [], kd = kodDUN(p), t = tahapKuota(p);
    if (p.parti !== 'MCA') { return []; }
    var urut = sas.indexOf(kd) >= 0 ? [kd].concat(sas.filter(function (x) { return x !== kd; })) : sas.slice();
    return urut.slice(0, t.dun);
  }
  function kuota(p) {
    var t = tahapKuota(p), kd = kodDUN(p), d = DATA(p);
    if (p.parti !== 'MCA') { return { pl: false, dun: false, bilDUN: 0, bilPL: 0, senarai: [] }; }
    var sen = senaraiKuota(p);
    return { pl: t.pl > 0, dun: !!kd && sen.indexOf(kd) >= 0, bilDUN: t.dun, bilPL: t.pl,
      senarai: sen.map(function (k) { return (d && d.dun[k] && d.dun[k].n) || k; }) };
  }
  function sebabKuota(p, jenis) {
    if (p.parti === 'MIC') { return 'MIC Sabah tidak diberi kerusi oleh BN (pengundi India kecil).'; }
    var t = tahapKuota(p);
    return jenis === 'PARLIMEN' ? 'BN tidak memberi MCA Sabah kerusi Parlimen sehingga Pemulihan Sabah mencapai 70.' : 'DUN anda bukan antara ' + t.dun + ' kerusi kuota MCA Sabah.';
  }
  function ofset(p) { var n = getSBN(p).pemulihan, C = CONFIG.OFSET; return Math.min(0, C.asas + Math.max(0, Math.floor((n - CONFIG.MULA) / C.setiap))); }
  function lawan() { return ['Warisan', 'DAP', 'GRS']; }

  /* ---------- Tindakan ---------- */
  function musimPRN(p) {
    var R = PRU(); if (!R || !R.getPRU) { return false; }
    var pru = R.getPRU(p), a = pru.aktif;
    if (a) { return pru.jenisPBB !== 'PRU'; }
    if (pru.jenisPBB === 'PRU') { return false; }
    var baki = (Number(pru.tahunPRU) || 0) * 12 + (Number(pru.bulanPRU) || 0) - idx(p);
    return baki >= 0 && baki <= CONFIG.JENTERA.bulanSebelum;
  }
  function statusKhidmat(p) {
    var s = getSBN(p), C = CONFIG.KHIDMAT, kos = S().kosSebenar ? S().kosSebenar(p, C.myr) : C.myr;
    if (s.khidmat === idx(p)) { return { boleh: false, sebab: 'Sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < C.ap) { return { boleh: false, sebab: 'AP tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < kos) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function statusJentera(p) {
    var s = getSBN(p);
    if (!musimPRN(p)) { return { boleh: false, sebab: 'Hanya pada musim PRN Sabah (6 bulan sebelum PRN).' }; }
    if (s.jentera === idx(p)) { return { boleh: false, sebab: 'Sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < CONFIG.JENTERA.ap) { return { boleh: false, sebab: 'AP tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function khidmat() {
    var p = S().loadPlayer(); if (!adalah(p)) { return { ok: false, ralat: 'Bukan pemain MCA/MIC Sabah.' }; }
    var st = statusKhidmat(p); if (!st.boleh) { return { ok: false, ralat: st.sebab }; }
    var s = getSBN(p), C = CONFIG.KHIDMAT; s.khidmat = idx(p); s.pemulihan = clamp(s.pemulihan + C.naik, 0, 100);
    var r = simpan(s, { ap: -C.ap, myr: -C.myr }, { tindakan: 'sbn_khidmat', nama: 'Khidmat Masyarakat Bandar (Sabah)', peringkat: 'ahli' });
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    return { ok: true, mesej: 'Khidmat Masyarakat Bandar selesai. Pemulihan Sabah +' + C.naik + '.' };
  }
  function jentera() {
    var p = S().loadPlayer(); if (!adalah(p)) { return { ok: false, ralat: 'Bukan pemain MCA/MIC Sabah.' }; }
    var st = statusJentera(p); if (!st.boleh) { return { ok: false, ralat: st.sebab }; }
    var s = getSBN(p), C = CONFIG.JENTERA, R = PRU(), pru = R.getPRU(p);
    s.jentera = idx(p); s.pemulihan = clamp(s.pemulihan + C.naik, 0, 100);
    pru.hubunganGabungan = clamp((Number(pru.hubunganGabungan) || 50) + C.hubungan, 0, 100);
    var r = simpan(s, { ap: -C.ap }, { tindakan: 'sbn_jentera', nama: 'Jentera untuk calon BN Sabah', peringkat: 'ahli' }, { pru: pru });
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    return { ok: true, mesej: 'Jentera anda membantu calon BN Sabah. Pemulihan Sabah +' + C.naik + ', hubungan gabungan +' + C.hubungan + '.' };
  }

  /* ---------- Bulanan ---------- */
  function pangkat(p) { var H = HY(), t = H && H.jawatanTertinggiSemasa ? H.jawatanTertinggiSemasa(p) : null; return t ? (t.pangkat || 0) : 0; }
  function senatorAktif(p) { var s = getSBN(p); return !!(s.senator && idx(p) < s.senator.sehingga); }
  function prosesBulan(o) {
    var p = S() && S().loadPlayer(), ev = [];
    if (!p || p.tamat || !adalah(p)) { return { peristiwa: ev }; }
    var s = getSBN(p), kes = {}, kini = idx(p), R = PRU(), pru = R && R.getPRU ? R.getPRU(p) : null, C = CONFIG;
    if (s.pemulihan > C.MULA) { s.pemulihan = Math.max(C.MULA, s.pemulihan - C.SUSUT); }
    // keputusan PRN Sabah baharu (riwayat pilihan raya)
    var rw = pru && Array.isArray(pru.riwayat) ? pru.riwayat : [], akhir = rw.length ? rw[rw.length - 1] : null, ia = akhir ? akhir.tahun * 12 + akhir.bulan : 0;
    if (akhir && akhir.jenis === 'PRN' && ia > (Number(s.semakPRN) || 0)) {
      s.semakPRN = ia;
      var sj = (pru.sejarah || []).filter(function (x) { return x && (x.tahun * 12 + (x.bulan || 0)) >= ia - 1 && (x.hasil === 'menang' || x.hasil === 'kalah'); });
      if (sj.length) {
        var menang = sj.some(function (x) { return x.hasil === 'menang'; }), d = menang ? C.PRN.menang : C.PRN.kalah;
        s.pemulihan = clamp(s.pemulihan + d, 0, 100); rekod(s, p, 'PRN Sabah: ' + (menang ? 'menang' : 'kalah'));
        ev.push({ jenis: 'sbn_prn', mesej: 'PRN Sabah: ' + (menang ? 'anda menang. Pemulihan Sabah +' + d + '.' : 'anda kalah. Pemulihan Sabah ' + d + '.') });
      }
      if (p.parti === 'MIC' && !senatorAktif(p) && pangkat(p) >= C.SENATOR.pangkat && s.pemulihan >= C.SENATOR.pemulihan) {
        if (rng(o)() < C.SENATOR.peluang) {
          s.senator = { mula: kini, sehingga: kini + C.SENATOR.bulan }; rekod(s, p, 'Dilantik Senator');
          ev.push({ jenis: 'sbn_senator', mesej: 'Anda dilantik sebagai Senator (Dewan Negara) mewakili MIC Sabah sehingga ' + tb(s.senator.sehingga) + '. IP +' + C.SENATOR.ip + ' dan RM ' + C.SENATOR.myr.toLocaleString('en') + ' sebulan.' });
        } else { ev.push({ jenis: 'sbn_senator_tiada', mesej: 'Kerajaan tidak melantik wakil MIC Sabah sebagai Senator kali ini.' }); }
      }
    }
    if (s.senator) {
      if (kini < s.senator.sehingga) { kes.ip = C.SENATOR.ip; kes.myr = C.SENATOR.myr; }
      else if (kini === s.senator.sehingga) { ev.push({ jenis: 'sbn_senator_tamat', mesej: 'Penggal anda sebagai Senator tamat.' }); s.senator = null; }
    }
    S().applyEffects(kes, { kiraTindakan: false, tanpaKesukaran: true, pindahan: true, patch: { sbn: s }, log: ev.length ? { tindakan: 'sbn', nama: ev[0].mesej, peringkat: 'ahli' } : undefined });
    return { peristiwa: ev };
  }
  function ringkasan(p) {
    var s = getSBN(p);
    return { pemulihan: s.pemulihan, kuota: kuota(p), ofset: ofset(p), khidmat: statusKhidmat(p), jentera: statusJentera(p), musimPRN: musimPRN(p),
      senator: senatorAktif(p) ? s.senator : null };
  }
  return { CONFIG: CONFIG, setRng: function (f) { rngLalai = f || Math.random; }, adalah: adalah, getSBN: getSBN, kuota: kuota, sebabKuota: sebabKuota, ofset: ofset, lawan: lawan,
    tahapKuota: tahapKuota, musimPRN: musimPRN, statusKhidmat: statusKhidmat, statusJentera: statusJentera, khidmat: khidmat, jentera: jentera,
    senatorAktif: senatorAktif, prosesBulan: prosesBulan, ringkasan: ringkasan, tb: tb };
});
