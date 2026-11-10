/* ==========================================================================
   Nusa Politik — js/grs.js   (v13.54)
   GRS (Gabungan Rakyat Sabah): enam parti boleh dimain, MOD RINGAN (enjin yang sama seperti PBRS: Cawangan, Bahagian = kawasan Parlimen, Pusat;
   DUN dipilih dalam PRN Sabah, js/sabah.js). Parti: Gagasan Rakyat (GAGASAN), PBS, UPKO, LDP, PHRS dan PCS.
   Mekanik khas "Kerajaan Negeri Sabah" (mockup GRS, dipersetujui):
     1. Kestabilan Gabungan (0-100, mula 62): susut ke arah 50; bawah 40 = risiko krisis ADUN lompat (pujuk, terima atau tuntut pembubaran DUN).
     2. Jamuan rakan gabungan (Kestabilan +6), Tuntut hak MA63 (akar umbi +5, hubungan Putrajaya -3), Sabah untuk Sabahan (kerusi GRS +1 dalam PRN, maks +5).
     3. Parti besar (Gagasan, PBS, UPKO): kuota kerusi tetap dalam GRS. Parti kecil (LDP, PHRS, PCS): Kekuatan Parti dan rundingan kuota GRS sebelum pilihan raya.
   State: p.grs = { kestabilan, kekuatan, jamuanBulan, ma63Bulan, sabahan, sabahanBulan, sabahanPRN, gerakBulan, kuota:{i, PL, DUN, peluang}, krisis:{i, sehingga}, pusat:{} }
   SEMUA ANGKA BERTANDA ANDAIAN IALAH ANDAIAN PERMAINAN. Permainan simulasi; bukan laman rasmi parti.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikGRS = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function J() { return modul('MyPolitikJawatan', 'jawatan.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function DATA() { return modul('MyPolitikGRSData', 'grs-data.js') || { parlimen: {}, dun: {}, parti: {} }; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(t, b) { return (parseInt(t, 10) || 0) * 12 + (parseInt(b, 10) || 1); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  var KOD = ['GAGASAN', 'PBS', 'UPKO', 'LDP', 'PHRS', 'PCS'], KECIL = ['LDP', 'PHRS', 'PCS'];
  var NAMA = { GAGASAN: 'Gagasan Rakyat', PBS: 'PBS', UPKO: 'UPKO', LDP: 'LDP', PHRS: 'PHRS', PCS: 'PCS' };
  var CONFIG = {
    TAHUN_MULA: 2027, KITARAN_TAHUN: 3, BULAN_PUSAT: 9,                 // ANDAIAN: takwim bulan 3/5/9; pemilihan setiap 3 tahun dari 2027
    KUOTA_PARLIMEN: 0, KUOTA_DUN: 0,
    KESTABILAN: { awal: 62, tengah: 50, susut: 1, krisis: 40, peluangKrisis: 0.25, tempoh: 2, rendah: 30 },
    JAMUAN: { ap: 2, myr: 3000, naik: 6 },
    MA63: { ap: 1, akarUmbi: 5, putrajaya: -3 },
    SABAHAN: { ap: 2, myr: 1500, maks: 5 },
    KRISIS: { pujukAP: 2, pujukMyr: 10000, pujuk: 10, terima: -5, terimaReputasi: -2, bubar: 60, bubarAkarUmbi: -5 },
    KECIL: { awal: { LDP: 10, PHRS: 8, PCS: 12 }, gerakAP: 2, gerakMyr: 2000, gerak: 1, akarUmbi: 2, bulanSebelum: 12, asas: 15, skala: 0.8, maks: 65, gagal: -2, pangkatPL: 7, pangkatDUN: 3 },
    PUSAT: { sendiri: 60, lain: [30, 45], bonusSkala: 0.3, wakilBahagian: 10, mt: 30 }
  };

  function adalahKod(k) { return KOD.indexOf(k) >= 0; }
  function adalah(p) { return !!(p && adalahKod(p.parti)); }
  function kecil(p) { return !!(p && KECIL.indexOf(p.parti) >= 0); }
  function st(p) {
    var m = p && p.grs && typeof p.grs === 'object' ? p.grs : {};
    if (typeof m.kestabilan !== 'number') { m.kestabilan = CONFIG.KESTABILAN.awal; }
    if (typeof m.sabahan !== 'number') { m.sabahan = 0; }
    if (kecil(p) && typeof m.kekuatan !== 'number') { m.kekuatan = CONFIG.KECIL.awal[p.parti] || 10; }
    if (!m.pusat || typeof m.pusat !== 'object') { m.pusat = {}; }
    return m;
  }
  function simpan(p, m, kesan, log, patchTambah) {
    var patch = { grs: m }; if (patchTambah) { for (var k in patchTambah) { patch[k] = patchTambah[k]; } }
    return S().applyEffects(kesan || {}, { kiraTindakan: !!(log && log.kira), patch: patch, log: log && log.nama ? { tindakan: log.tindakan || 'grs', nama: log.nama, peringkat: 'ahli' } : undefined });
  }
  function pangkat(p) { var J0 = J(); return J0 ? Math.max(J0.pangkatTertinggi(p, 'utama'), Number(p.pangkatUtamaLalu) || 0) : 0; }
  function sekarang(p) { return idx(p.tahun, p.bulan); }
  function kodPL(p) { var k = p && p.kod && p.kod.parlimen; return k ? 'P.' + String(parseInt(k, 10)).padStart(3, '0') : null; }
  function info(p) { return DATA().parti[p && p.parti] || { ops: [], kaw: {}, qPL: [], qDUN: [] }; }

  /* ---------- Pilihan raya: jadual dan riwayat ---------- */
  function getPRU(p) { var P0 = PRU(); try { return P0 && P0.getPRU ? P0.getPRU(p) : (p && p.pru) || {}; } catch (e) { return (p && p.pru) || {}; } }
  function jadual(p) { var pr = getPRU(p); return pr && pr.tahunPRU ? idx(pr.tahunPRU, pr.bulanPRU || 11) : idx(2030, 11); }
  function pruAktif(p) { var pr = getPRU(p); return !!(pr && pr.aktif); }
  function pruTerakhir(p) { var r = getPRU(p).riwayat || []; var l = r[r.length - 1]; return l ? idx(l.tahun, l.bulan) : 0; }
  function prnTerakhir(p) { var r = (getPRU(p).riwayat || []).filter(function (x) { return x && x.jenis === 'PRN'; }); var l = r[r.length - 1]; return l ? idx(l.tahun, l.bulan) : 0; }
  /** Kerajaan negeri Sabah dipimpin GRS (anggaran PRN terakhir; lalai PRN 2025 = ya). */
  function kerajaanGRS(p) { var sb = getPRU(p).sabahPRN; return sb && typeof sb.kerajaanGRS === 'boolean' ? sb.kerajaanGRS : true; }

  /* ---------- Kawasan (antara muka sama seperti MCA/MIC/PPP/PBRS untuk js/pru.js) ---------- */
  function kuotaSah(p) { var m = st(p); return m.kuota && pruTerakhir(p) < m.kuota.i ? m.kuota : null; }
  function kawasan(p) {
    var d = DATA(), I = info(p), kp = kodPL(p), pl = kp && I.ops.indexOf(kp) >= 0 ? d.parlimen[kp] : null, dn = null, kd = null;
    if (pl && p.kod && p.kod.dun && parseInt(p.kod.dun, 10) > 0) { kd = pl.ng + '_N.' + String(parseInt(p.kod.dun, 10)).padStart(2, '0'); dn = d.dun[kd] ? Object.assign({ kod: kd }, d.dun[kd]) : null; }
    var k = kecil(p) ? kuotaSah(p) : null, kw = kp && I.kaw ? I.kaw[kp] : null;
    return { parlimen: pl ? Object.assign({ kod: kp }, pl, kw || {}) : null, dun: dn, kuotaPL: !!(pl && (I.qPL.indexOf(kp) >= 0 || (k && k.PL))), kuotaDUN: !!(dn && (I.qDUN.indexOf(kd) >= 0 || (k && k.DUN))), bilBahagian: I.ops.length };
  }
  function sebabKuota(p, jenis) {
    return kecil(p) ? NAMA[p.parti] + ' belum mendapat kerusi ' + (jenis === 'DUN' ? 'DUN' : 'Parlimen') + ' ini daripada GRS (Runding kuota GRS di kad GRS, tab Profil)'
      : 'Kerusi ' + (jenis === 'DUN' ? 'DUN' : 'Parlimen') + ' anda di luar kuota ' + NAMA[p.parti] + ' dalam GRS';
  }
  /** Ofset undi kerusi: Sabah untuk Sabahan menambah kekuatan calon DUN (+0.5 setiap mata); Kestabilan rendah menjejas. */
  function ofset(p, jenis) { var m = st(p); return Math.round(((jenis === 'DUN' ? m.sabahan * 0.5 : 0) + (m.kestabilan < CONFIG.KESTABILAN.rendah ? -3 : 0)) * 10) / 10; }
  function lawan(p, jenis) { return jenis === 'DUN' ? ['Warisan', 'BN'] : ['Warisan', 'PN']; }
  /** Pelarasan kerusi GRS dalam anggaran PRN Sabah (js/sabah.js): Sabah untuk Sabahan +1 setiap mata (maks +5); Kestabilan rendah -2. */
  function bonusPRN(p) { if (!adalah(p)) { return 0; } var m = st(p); return Math.min(CONFIG.SABAHAN.maks, m.sabahan) - (m.kestabilan < CONFIG.KESTABILAN.rendah ? 2 : 0); }

  /* ---------- Kitaran pemilihan 3 tahun dari 2027 (ANDAIAN) ---------- */
  function adalahTahunPemilihan(p, tahun) { var t = parseInt(tahun, 10); return t >= CONFIG.TAHUN_MULA && (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN === 0; }
  function tahunSeterusnya(p, tahun) { var t = parseInt(tahun, 10); if (t <= CONFIG.TAHUN_MULA) { return CONFIG.TAHUN_MULA; } var b = (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN; return b === 0 ? t : t + CONFIG.KITARAN_TAHUN - b; }
  function tahunLepas(p, tahun) { var t = parseInt(tahun, 10); return t < CONFIG.TAHUN_MULA ? null : t - ((t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN); }

  /* ---------- Pemilihan Pusat (ANDAIAN 10 perwakilan setiap Bahagian + Majlis Tertinggi) ---------- */
  function ringkasPusat(p) {
    var I = info(p), m = st(p), own = kodPL(p), ks = I.ops, jum = 0;
    ks.forEach(function (k) { var v = m.pusat[k]; if (typeof v !== 'number') { var c = CONFIG.PUSAT.lain; v = k === own ? CONFIG.PUSAT.sendiri : c[0] + (hash(String(p.id) + '|grs|' + k) % (c[1] - c[0] + 1)); } jum += v; });
    var purata = ks.length ? jum / ks.length : 0, pengundi = ks.length * CONFIG.PUSAT.wakilBahagian + CONFIG.PUSAT.mt;
    return { purata: Math.round(purata * 10) / 10, pengundi: pengundi, bilBahagian: ks.length, sokongUndi: Math.round(pengundi * purata / 100) };
  }
  function bonusPusat(p) { return adalah(p) ? Math.round((ringkasPusat(p).purata - 40) * CONFIG.PUSAT.bonusSkala * 10) / 10 : 0; }

  /* ---------- Tindakan ---------- */
  function semakAsas(p, ap, myr, kunci) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk parti GRS.' }; }
    var m = st(p); if (kunci && m[kunci] === sekarang(p)) { return { boleh: false, sebab: 'Sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < ap) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if (myr && (Number(p.myr) || 0) < myr) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function statusJamuan(p) { return semakAsas(p, CONFIG.JAMUAN.ap, CONFIG.JAMUAN.myr, 'jamuanBulan'); }
  function statusMA63(p) { return semakAsas(p, CONFIG.MA63.ap, 0, 'ma63Bulan'); }
  function statusSabahan(p) { var s0 = semakAsas(p, CONFIG.SABAHAN.ap, CONFIG.SABAHAN.myr, 'sabahanBulan'); if (s0.boleh && st(p).sabahan >= CONFIG.SABAHAN.maks) { return { boleh: false, sebab: 'Bonus maksimum +' + CONFIG.SABAHAN.maks + ' untuk PRN ini.' }; } return s0; }
  function jamuan() {
    var p = S().loadPlayer(), s0 = statusJamuan(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), a = m.kestabilan; m.kestabilan = clamp(a + CONFIG.JAMUAN.naik, 0, 100); m.jamuanBulan = sekarang(p);
    var r = simpan(p, m, { ap: -CONFIG.JAMUAN.ap, myr: -CONFIG.JAMUAN.myr }, { kira: true, tindakan: 'grs_jamuan', nama: 'Jamuan rakan gabungan GRS' });
    return r.ok ? { ok: true, mesej: 'Jamuan bersama pemimpin rakan gabungan dan ADUN penyokong kerajaan. Kestabilan Gabungan ' + Math.round(a) + ' → ' + Math.round(m.kestabilan) + '.' } : { ok: false, ralat: r.ralat };
  }
  function ma63() {
    var p = S().loadPlayer(), s0 = statusMA63(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), C = CONFIG.MA63, pr = getPRU(p); m.ma63Bulan = sekarang(p);
    pr.hubunganGabungan = clamp((Number(pr.hubunganGabungan) || 50) + C.putrajaya, 0, 100);
    var r = simpan(p, m, { ap: -C.ap, kesetiaan: { akarUmbi: C.akarUmbi } }, { kira: true, tindakan: 'grs_ma63', nama: 'Tuntut hak MA63' }, { pru: pr });
    return r.ok ? { ok: true, mesej: 'Anda menuntut hak Sabah di bawah Perjanjian Malaysia 1963 (40% hasil). Sokongan akar umbi +' + C.akarUmbi + ', hubungan dengan Putrajaya ' + C.putrajaya + '.' } : { ok: false, ralat: r.ralat };
  }
  function sabahan() {
    var p = S().loadPlayer(), s0 = statusSabahan(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p); m.sabahan = Math.min(CONFIG.SABAHAN.maks, m.sabahan + 1); m.sabahanBulan = sekarang(p);
    var r = simpan(p, m, { ap: -CONFIG.SABAHAN.ap, myr: -CONFIG.SABAHAN.myr }, { kira: true, tindakan: 'grs_sabahan', nama: 'Ceramah Sabah untuk Sabahan' });
    return r.ok ? { ok: true, mesej: 'Ceramah "Sabah untuk Sabahan" mendapat sambutan. Bonus kerusi GRS dalam PRN Sabah: +' + m.sabahan + '.' } : { ok: false, ralat: r.ralat };
  }
  /* Krisis ADUN lompat */
  function statusKrisis(p) { var m = st(p); return m.krisis && !m.krisis.selesai ? m.krisis : null; }
  function jawabKrisis(pilihan) {
    var p = S().loadPlayer(); if (!adalah(p)) { return { ok: false, ralat: 'Hanya untuk parti GRS.' }; }
    var m = st(p), k = statusKrisis(p), C = CONFIG.KRISIS; if (!k) { return { ok: false, ralat: 'Tiada krisis ADUN lompat.' }; }
    var kes = {}, patch = null, msj;
    if (pilihan === 'pujuk') {
      if ((Number(p.ap) || 0) < C.pujukAP) { return { ok: false, ralat: 'Mata Tindakan (AP) tidak mencukupi.' }; }
      if ((Number(p.myr) || 0) < C.pujukMyr) { return { ok: false, ralat: 'Dana tidak mencukupi.' }; }
      kes = { ap: -C.pujukAP, myr: -C.pujukMyr }; m.kestabilan = clamp(m.kestabilan + C.pujuk, 0, 100);
      msj = 'ADUN yang goyah berjaya dipujuk kekal bersama kerajaan GRS. Kestabilan Gabungan +' + C.pujuk + '.';
    } else if (pilihan === 'terima') {
      m.kestabilan = clamp(m.kestabilan + C.terima, 0, 100); kes = { reputasi: C.terimaReputasi };
      msj = 'Dua ADUN melompat ke pembangkang. Kerajaan GRS kekal dengan majoriti tipis. Kestabilan ' + C.terima + ', Reputasi ' + C.terimaReputasi + '.';
    } else if (pilihan === 'bubar') {
      var pr = getPRU(p); if (pr.jenisPBB !== 'PRN' || pruAktif(p)) { return { ok: false, ralat: 'Pembubaran DUN hanya sebelum PRN Sabah seterusnya.' }; }
      var t = sekarang(p) + 2; pr.tahunPRU = Math.floor((t - 1) / 12); pr.bulanPRU = ((t - 1) % 12) + 1; patch = { pru: pr };
      m.kestabilan = C.bubar; kes = { kesetiaan: { akarUmbi: C.bubarAkarUmbi } };
      msj = 'Ketua Menteri menasihati Yang di-Pertua Negeri membubarkan DUN. PRN Sabah mengejut dalam 2 bulan; Kestabilan ditetapkan semula ke ' + C.bubar + ', sokongan akar umbi ' + C.bubarAkarUmbi + '.';
    } else { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    k.selesai = true; k.pilihan = pilihan;
    var r = simpan(p, m, kes, { kira: true, tindakan: 'grs_krisis', nama: 'Krisis ADUN lompat: ' + { pujuk: 'pujuk', terima: 'terima', bubar: 'bubar DUN' }[pilihan] }, patch);
    return r.ok ? { ok: true, mesej: msj } : { ok: false, ralat: r.ralat };
  }
  /* Parti kecil: Gerak kerja dan rundingan kuota GRS */
  function kekuatan(p) { return kecil(p) ? st(p).kekuatan : null; }
  function statusGerak(p) { if (!kecil(p)) { return { boleh: false, sebab: 'Hanya untuk LDP, PHRS dan PCS.' }; } return semakAsas(p, CONFIG.KECIL.gerakAP, CONFIG.KECIL.gerakMyr, 'gerakBulan'); }
  function gerak() {
    var p = S().loadPlayer(), s0 = statusGerak(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), a = m.kekuatan, K = CONFIG.KECIL; m.kekuatan = clamp(a + K.gerak, 0, 100); m.gerakBulan = sekarang(p);
    var r = simpan(p, m, { ap: -K.gerakAP, myr: -K.gerakMyr, kesetiaan: { akarUmbi: K.akarUmbi } }, { kira: true, tindakan: 'grs_gerak', nama: 'Gerak kerja ' + NAMA[p.parti] });
    return r.ok ? { ok: true, mesej: 'Gerak kerja dan pendaftaran ahli baharu ' + NAMA[p.parti] + '. Kekuatan Parti ' + a + ' → ' + m.kekuatan + ', sokongan akar umbi +' + K.akarUmbi + '.' } : { ok: false, ralat: r.ralat };
  }
  function peluangKuota(p) { var K = CONFIG.KECIL; return Math.round(clamp(K.asas + (kekuatan(p) || 0) * K.skala, 0, K.maks)); }
  function statusKuota(p) {
    if (!kecil(p)) { return { boleh: false, sebab: 'Hanya untuk LDP, PHRS dan PCS.' }; }
    if (kuotaSah(p)) { return { boleh: false, sebab: 'Rundingan kuota untuk pilihan raya ini sudah dibuat.', sudah: true }; }
    var j = jadual(p), now = sekarang(p);
    if (!(pruAktif(p) || (now >= j - CONFIG.KECIL.bulanSebelum && now <= j))) { return { boleh: false, sebab: 'Hanya ' + CONFIG.KECIL.bulanSebelum + ' bulan sebelum pilihan raya.' }; }
    return { boleh: true, sebab: '' };
  }
  function rundingKuota(o) {
    var p = S().loadPlayer(), s0 = statusKuota(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), r = (o && o.rng) || S().rngBerbenih(String(p.id) + '|grs|kuota|' + sekarang(p)), pel = peluangKuota(p), K = CONFIG.KECIL, pk = pangkat(p), kw = kawasan(p);
    var jaya = r() * 100 < pel, PL = jaya && pk >= K.pangkatPL && !!kw.parlimen && kw.parlimen.ng === '12', DUN = jaya && pk >= K.pangkatDUN && !!kw.dun;
    m.kuota = { i: sekarang(p), PL: PL, DUN: DUN, jaya: jaya, peluang: pel };
    if (!jaya) { m.kekuatan = clamp(m.kekuatan + K.gagal, 0, 100); }
    var res = simpan(p, m, {}, { kira: true, tindakan: 'grs_kuota', nama: 'Rundingan kuota GRS' + (jaya ? ' (berjaya)' : ' (gagal)') });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    if (!jaya) { return { ok: true, jaya: false, mesej: 'Majlis Presiden GRS tidak memberi ' + NAMA[p.parti] + ' kerusi untuk pilihan raya ini (peluang ' + pel + '%). Kekuatan Parti ' + K.gagal + '.' }; }
    var anda = [PL ? 'Parlimen' : null, DUN ? 'DUN' : null].filter(Boolean).join(' dan ');
    return { ok: true, jaya: true, mesej: 'Majlis Presiden GRS memberi ' + NAMA[p.parti] + ' kerusi untuk pilihan raya ini. ' + (anda ? 'Kerusi ' + anda + ' di kawasan anda: anda boleh bertanding.' : 'Kerusi itu diberi kepada calon lain kerana anda belum memegang jawatan yang cukup tinggi (Ketua Bahagian untuk Parlimen, Ketua Cawangan untuk DUN).') };
  }

  /* ---------- Bulanan (rantaian kalendar) ---------- */
  function prosesBulan(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat || !adalah(p)) { return { peristiwa: ev }; }
    var r = (o && o.rng) || Sv.rngBerbenih(String(p.id) + '|grs|bulan|' + sekarang(p)), m = st(p), K = CONFIG.KESTABILAN, now = sekarang(p), msj = [];
    // 1. Sabah untuk Sabahan: bonus luput selepas PRN Sabah
    var tPRN = prnTerakhir(p); if (m.sabahan && tPRN && (m.sabahanPRN || 0) < tPRN) { m.sabahan = 0; m.sabahanPRN = tPRN; }
    else if (!m.sabahanPRN) { m.sabahanPRN = tPRN; }
    // 2. krisis: tamat tempoh tanpa jawapan = terima
    var k = statusKrisis(p);
    if (k && now >= k.sehingga) { k.selesai = true; k.pilihan = 'terima'; m.kestabilan = clamp(m.kestabilan + CONFIG.KRISIS.terima, 0, 100); msj.push('Tiada tindakan diambil: dua ADUN melompat ke pembangkang. Kestabilan Gabungan ' + CONFIG.KRISIS.terima + '.'); }
    else if (!k && kerajaanGRS(p) && m.kestabilan < K.krisis && r() < K.peluangKrisis) {
      m.krisis = { i: now, sehingga: now + K.tempoh };
      msj.push('Krisis ADUN lompat: beberapa ADUN penyokong kerajaan GRS dilaporkan berunding dengan pembangkang. Pilih tindakan dalam kad GRS (tab Profil) dalam ' + K.tempoh + ' bulan: pujuk, terima, atau tuntut pembubaran DUN.');
    }
    // 3. Kestabilan bergerak perlahan ke arah 50
    if (m.kestabilan > K.tengah) { m.kestabilan = Math.max(K.tengah, m.kestabilan - K.susut); } else if (m.kestabilan < K.tengah && !statusKrisis(p)) { m.kestabilan = Math.min(K.tengah, m.kestabilan + 0.5); }
    // 4. parti kecil: peringatan rundingan kuota
    if (kecil(p) && !kuotaSah(p) && now === jadual(p) - CONFIG.KECIL.bulanSebelum) { msj.push('Pilihan raya dijangka dalam ' + CONFIG.KECIL.bulanSebelum + ' bulan. Runding kuota GRS dalam kad GRS (tab Profil) supaya ' + NAMA[p.parti] + ' mendapat kerusi.'); }
    simpan(p, m, {}, null);
    msj.forEach(function (t) { ev.push({ jenis: 'grs', mesej: t }); });
    return { peristiwa: ev };
  }

  /** Ringkasan untuk kad UI. */
  function keadaan(p) {
    var m = st(p), sb = getPRU(p).sabahPRN, B = modul('MyPolitikSabah', 'sabah.js'), P25 = B && B.CONFIG ? B.CONFIG.PRN_2025 : { tahun: 2025, GRS: 29, Warisan: 25, BN: 6, UPKO: 3, lain: 10 };
    var dun = sb && typeof sb.GRS === 'number' ? sb : P25;
    return { nama: NAMA[p.parti], kecil: kecil(p), kestabilan: Math.round(m.kestabilan), sabahan: m.sabahan, kerajaan: kerajaanGRS(p), dun: dun, kawasan: kawasan(p),
      kekuatan: kekuatan(p), kuota: kuotaSah(p), peluangKuota: kecil(p) ? peluangKuota(p) : null, krisis: statusKrisis(p),
      jamuan: statusJamuan(p), ma63: statusMA63(p), sabahanS: statusSabahan(p), gerak: statusGerak(p), statusKuota: statusKuota(p) };
  }

  return { CONFIG: CONFIG, KOD: KOD, KECIL: KECIL, NAMA: NAMA, adalahKod: adalahKod, adalah: adalah, kecil: kecil, kawasan: kawasan, sebabKuota: sebabKuota, ofset: ofset, lawan: lawan, bonusPRN: bonusPRN, kerajaanGRS: kerajaanGRS,
    adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya, ringkasPusat: ringkasPusat, bonusPusat: bonusPusat,
    kestabilan: function (p) { return st(p).kestabilan; }, kekuatan: kekuatan, kuotaSah: kuotaSah, peluangKuota: peluangKuota, keadaan: keadaan,
    statusJamuan: statusJamuan, jamuan: jamuan, statusMA63: statusMA63, ma63: ma63, statusSabahan: statusSabahan, sabahan: sabahan,
    statusKrisis: statusKrisis, jawabKrisis: jawabKrisis, statusGerak: statusGerak, gerak: gerak, statusKuota: statusKuota, rundingKuota: rundingKuota, prosesBulan: prosesBulan };
});
