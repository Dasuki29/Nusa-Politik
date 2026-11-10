/* ==========================================================================
   Nusa Politik — js/warisan.js   (v13.55)
   Parti Warisan (WARISAN), parti tanpa gabungan (kumpulan "Lain-lain"), MOD RINGAN: enjin yang sama seperti PPP/PBRS
   (Cawangan, Bahagian = kawasan Parlimen, Pusat). Kawasan operasi: Sabah, Labuan dan Semenanjung. DUN Sabah dipilih dalam PRN Sabah (js/sabah.js).
   Mekanik khas "Pembangkang Utama Sabah" (mockup Warisan, dipersetujui):
     1. Gelombang Warisan (0-100, mula 40, susut 1 sebulan ke arah 40): setiap 10 mata melebihi 40 = kerusi Warisan +2 dalam PRN Sabah (maks +12).
     2. Jelajah Sabah, Serang isu kerajaan GRS, Pikat ADUN goyah (kerusi +1, sekali setahun).
     3. Warisan + separuh kerusi lain >= 37 selepas PRN: Warisan membentuk kerajaan Sabah (laluan Ketua Menteri melalui aliran MB sedia ada).
     4. Tiada kuota gabungan: bertanding di semua kerusi kawasan operasi; di Semenanjung sangat sukar (ofset undi negatif).
   State: p.warisan = { gelombang, jelajahBulan, serangBulan, pikatTahun, pikat, pikatPRN, pusat:{} }
   SEMUA ANGKA BERTANDA ANDAIAN IALAH ANDAIAN PERMAINAN. Permainan simulasi; bukan laman rasmi parti.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikWarisan = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function DATA() { return modul('MyPolitikWarisanData', 'warisan-data.js') || { parlimen: {}, dun: {} }; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(t, b) { return (parseInt(t, 10) || 0) * 12 + (parseInt(b, 10) || 1); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  var CONFIG = {
    TAHUN_MULA: 2027, KITARAN_TAHUN: 3, BULAN_PUSAT: 9,                 // ANDAIAN: takwim bulan 3/5/9; pemilihan setiap 3 tahun dari 2027
    KUOTA_PARLIMEN: 0, KUOTA_DUN: 0,
    GELOMBANG: { awal: 40, susut: 1, langkah: 10, kerusi: 2, maks: 12 },
    JELAJAH: { ap: 2, myr: 2500, naik: 4, akarUmbi: 2 },
    SERANG: { ap: 1, naik: 3, gagal: 0.3, reputasi: -1 },
    PIKAT: { ap: 3, myr: 15000, peluang: 0.25 },
    OFSET: { semenanjung: -14 },
    PUSAT: { sendiri: 60, lain: [30, 45], bonusSkala: 0.3, wakilBahagian: 6, mt: 30 }
  };

  function adalah(p) { return !!(p && p.parti === 'WARISAN'); }
  function st(p) {
    var m = p && p.warisan && typeof p.warisan === 'object' ? p.warisan : {};
    if (typeof m.gelombang !== 'number') { m.gelombang = CONFIG.GELOMBANG.awal; }
    if (typeof m.pikat !== 'number') { m.pikat = 0; }
    if (!m.pusat || typeof m.pusat !== 'object') { m.pusat = {}; }
    return m;
  }
  function simpan(p, m, kesan, log) {
    return S().applyEffects(kesan || {}, { kiraTindakan: !!(log && log.kira), patch: { warisan: m }, log: log && log.nama ? { tindakan: log.tindakan || 'warisan', nama: log.nama, peringkat: 'ahli' } : undefined });
  }
  function sekarang(p) { return idx(p.tahun, p.bulan); }
  function kodPL(p) { var k = p && p.kod && p.kod.parlimen; return k ? 'P.' + String(parseInt(k, 10)).padStart(3, '0') : null; }
  function getPRU(p) { var P0 = PRU(); try { return P0 && P0.getPRU ? P0.getPRU(p) : (p && p.pru) || {}; } catch (e) { return (p && p.pru) || {}; } }
  function prnTerakhir(p) { var r = (getPRU(p).riwayat || []).filter(function (x) { return x && x.jenis === 'PRN'; }); var l = r[r.length - 1]; return l ? idx(l.tahun, l.bulan) : 0; }
  /** Kawasan Sabah / Labuan (bukan Semenanjung). */
  function diSabah(p) { var d = DATA(), kp = kodPL(p), x = kp ? d.parlimen[kp] : null; return !!x && (x.ng === '12' || kp === 'P.166'); }

  /* ---------- Kawasan (antara muka sama seperti MCA/MIC/PPP untuk js/pru.js) ---------- */
  function kawasan(p) {
    var d = DATA(), kp = kodPL(p), pl = kp ? d.parlimen[kp] : null, dn = null;
    if (pl && p.kod && p.kod.dun && parseInt(p.kod.dun, 10) > 0) { var kd = pl.ng + '_N.' + String(parseInt(p.kod.dun, 10)).padStart(2, '0'); dn = d.dun[kd] ? Object.assign({ kod: kd }, d.dun[kd]) : null; }
    return { parlimen: pl ? Object.assign({ kod: kp }, pl) : null, dun: dn, kuotaPL: !!pl, kuotaDUN: !!dn, bilBahagian: Object.keys(d.parlimen).length };
  }
  function sebabKuota(p, jenis) { return 'Kerusi ' + (jenis === 'DUN' ? 'DUN' : 'Parlimen') + ' ini di luar kawasan operasi WARISAN'; }
  /** Ofset undi kerusi: kubu Sabah ikut Gelombang; Semenanjung sangat sukar. */
  function ofset(p) { return diSabah(p) ? Math.round((st(p).gelombang - CONFIG.GELOMBANG.awal) * 0.1 * 10) / 10 : CONFIG.OFSET.semenanjung; }
  function lawan(p, jenis) { return diSabah(p) ? (jenis === 'DUN' ? ['GRS', 'BN'] : ['GRS', 'PH']) : ['PH', 'PN']; }
  /** Kerusi tambahan Warisan dalam anggaran PRN Sabah (js/sabah.js). */
  function bonusPRN(p) { if (!adalah(p)) { return 0; } var m = st(p), G = CONFIG.GELOMBANG; return Math.min(G.maks, Math.floor(Math.max(0, m.gelombang - G.awal) / G.langkah) * G.kerusi) + m.pikat; }
  /** Anggaran kerusi Parlimen nasional (js/pru.js janaNasional, js/paparan.js): 2-8 kerusi, tiada rakan. */
  function kerusiParlimen(pop, rng) { var Sv = S(), p = Sv && Sv.loadPlayer ? Sv.loadPlayer() : null, g = p ? st(p).gelombang : CONFIG.GELOMBANG.awal; return { parti: clamp(Math.round(2 + (g - 40) / 15 + rng() * 4), 1, 10), rakan: 0 }; }
  /** Bahagian kerusi DUN negeri: Sabah ikut anggaran PRN (js/paparan.js mengatasi); negeri lain hampir tiada. */
  function kadarDUN(kodNegeri, pop, rng) { return String(kodNegeri) === '12' ? 0.34 : clamp(rng() * 0.02, 0, 0.02); }

  /* ---------- Kitaran pemilihan 3 tahun dari 2027 (ANDAIAN) ---------- */
  function adalahTahunPemilihan(p, tahun) { var t = parseInt(tahun, 10); return t >= CONFIG.TAHUN_MULA && (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN === 0; }
  function tahunSeterusnya(p, tahun) { var t = parseInt(tahun, 10); if (t <= CONFIG.TAHUN_MULA) { return CONFIG.TAHUN_MULA; } var b = (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN; return b === 0 ? t : t + CONFIG.KITARAN_TAHUN - b; }
  function tahunLepas(p, tahun) { var t = parseInt(tahun, 10); return t < CONFIG.TAHUN_MULA ? null : t - ((t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN); }

  /* ---------- Pemilihan Pusat (ANDAIAN 6 perwakilan setiap Bahagian + Majlis Tertinggi) ---------- */
  function ringkasPusat(p) {
    var d = DATA(), m = st(p), own = kodPL(p), ks = Object.keys(d.parlimen), jum = 0;
    ks.forEach(function (k) { var v = m.pusat[k]; if (typeof v !== 'number') { var c = CONFIG.PUSAT.lain; v = k === own ? CONFIG.PUSAT.sendiri : c[0] + (hash(String(p.id) + '|warisan|' + k) % (c[1] - c[0] + 1)); } jum += v; });
    var purata = ks.length ? jum / ks.length : 0, pengundi = ks.length * CONFIG.PUSAT.wakilBahagian + CONFIG.PUSAT.mt;
    return { purata: Math.round(purata * 10) / 10, pengundi: pengundi, bilBahagian: ks.length, sokongUndi: Math.round(pengundi * purata / 100) };
  }
  function bonusPusat(p) { return adalah(p) ? Math.round((ringkasPusat(p).purata - 40) * CONFIG.PUSAT.bonusSkala * 10) / 10 : 0; }

  /* ---------- Tindakan ---------- */
  function semakAsas(p, ap, myr, kunci, nilai) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk WARISAN.' }; }
    var m = st(p); if (kunci && m[kunci] === nilai) { return { boleh: false, sebab: kunci === 'pikatTahun' ? 'Sudah dibuat tahun ini.' : 'Sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < ap) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if (myr && (Number(p.myr) || 0) < myr) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function statusJelajah(p) { return semakAsas(p, CONFIG.JELAJAH.ap, CONFIG.JELAJAH.myr, 'jelajahBulan', sekarang(p)); }
  function statusSerang(p) { return semakAsas(p, CONFIG.SERANG.ap, 0, 'serangBulan', sekarang(p)); }
  function statusPikat(p) { return semakAsas(p, CONFIG.PIKAT.ap, CONFIG.PIKAT.myr, 'pikatTahun', parseInt(p.tahun, 10)); }
  function jelajah() {
    var p = S().loadPlayer(), s0 = statusJelajah(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), a = m.gelombang, C = CONFIG.JELAJAH; m.gelombang = clamp(a + C.naik, 0, 100); m.jelajahBulan = sekarang(p);
    var r = simpan(p, m, { ap: -C.ap, myr: -C.myr, kesetiaan: { akarUmbi: C.akarUmbi } }, { kira: true, tindakan: 'warisan_jelajah', nama: 'Jelajah Sabah' });
    return r.ok ? { ok: true, mesej: 'Jelajah Warisan ke pekan dan kampung Sabah mendapat sambutan. Gelombang Warisan ' + Math.round(a) + ' → ' + Math.round(m.gelombang) + ', sokongan akar umbi +' + C.akarUmbi + '.' } : { ok: false, ralat: r.ralat };
  }
  function serang(o) {
    var p = S().loadPlayer(), s0 = statusSerang(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), C = CONFIG.SERANG, r = (o && o.rng) || S().rngBerbenih(String(p.id) + '|warisan|serang|' + sekarang(p)), gagal = r() < C.gagal, a = m.gelombang;
    m.serangBulan = sekarang(p); if (!gagal) { m.gelombang = clamp(a + C.naik, 0, 100); }
    var res = simpan(p, m, gagal ? { ap: -C.ap, reputasi: C.reputasi } : { ap: -C.ap }, { kira: true, tindakan: 'warisan_serang', nama: 'Serang isu kerajaan GRS' + (gagal ? ' (gagal)' : '') });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    return { ok: true, jaya: !gagal, mesej: gagal ? 'Kerajaan GRS membalas dengan fakta dan angka; serangan anda dilihat tidak tepat. Reputasi ' + C.reputasi + '.'
      : 'Isu bekalan air, elektrik dan jalan rosak yang anda bangkitkan menjadi perbualan rakyat. Gelombang Warisan ' + Math.round(a) + ' → ' + Math.round(m.gelombang) + '.' };
  }
  function pikat(o) {
    var p = S().loadPlayer(), s0 = statusPikat(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), C = CONFIG.PIKAT, r = (o && o.rng) || S().rngBerbenih(String(p.id) + '|warisan|pikat|' + sekarang(p)), jaya = r() < C.peluang;
    m.pikatTahun = parseInt(p.tahun, 10); if (jaya) { m.pikat += 1; }
    var res = simpan(p, m, { ap: -C.ap, myr: -C.myr }, { kira: true, tindakan: 'warisan_pikat', nama: 'Pikat ADUN goyah' + (jaya ? ' (berjaya)' : ' (gagal)') });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    return { ok: true, jaya: jaya, mesej: jaya ? 'Seorang ADUN penyokong kerajaan melompat ke Warisan. Kerusi Warisan dalam PRN Sabah +1 (jumlah +' + m.pikat + ').' : 'ADUN yang didekati memilih kekal bersama kerajaan GRS (peluang ' + Math.round(C.peluang * 100) + '%).' };
  }

  /* ---------- Bulanan (rantaian kalendar) ---------- */
  function prosesBulan() {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat || !adalah(p)) { return { peristiwa: ev }; }
    var m = st(p), G = CONFIG.GELOMBANG, tPRN = prnTerakhir(p);
    if (m.pikat && tPRN && (m.pikatPRN || 0) < tPRN) { m.pikat = 0; m.pikatPRN = tPRN; } else if (!m.pikatPRN) { m.pikatPRN = tPRN; }
    if (m.gelombang > G.awal) { m.gelombang = Math.max(G.awal, m.gelombang - G.susut); } else if (m.gelombang < G.awal) { m.gelombang = Math.min(G.awal, m.gelombang + G.susut); }
    simpan(p, m, {}, null);
    return { peristiwa: ev };
  }

  /** Ringkasan untuk kad UI. */
  function keadaan(p) {
    var m = st(p), sb = getPRU(p).sabahPRN, B = modul('MyPolitikSabah', 'sabah.js'), P25 = B && B.CONFIG ? B.CONFIG.PRN_2025 : { tahun: 2025, GRS: 29, Warisan: 25, BN: 6, UPKO: 3, lain: 10 };
    return { gelombang: Math.round(m.gelombang), bonus: bonusPRN(p), pikat: m.pikat, sabah: diSabah(p), dun: sb && typeof sb.Warisan === 'number' ? sb : P25, kawasan: kawasan(p),
      jelajah: statusJelajah(p), serang: statusSerang(p), pikatS: statusPikat(p) };
  }

  return { CONFIG: CONFIG, adalah: adalah, diSabah: diSabah, kawasan: kawasan, sebabKuota: sebabKuota, ofset: ofset, lawan: lawan, bonusPRN: bonusPRN, kerusiParlimen: kerusiParlimen, kadarDUN: kadarDUN,
    adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya, ringkasPusat: ringkasPusat, bonusPusat: bonusPusat,
    gelombang: function (p) { return st(p).gelombang; }, keadaan: keadaan,
    statusJelajah: statusJelajah, jelajah: jelajah, statusSerang: statusSerang, serang: serang, statusPikat: statusPikat, pikat: pikat, prosesBulan: prosesBulan };
});
