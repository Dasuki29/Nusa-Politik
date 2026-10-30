/* ==========================================================================
   Nusa Politik — js/pbrs.js   (v13.9)
   PBRS (Parti Bersatu Rakyat Sabah), komponen BN di Sabah, MOD RINGAN: enjin yang sama seperti MIC/PPP
   (Cawangan, Bahagian = kawasan Parlimen, Pusat) tanpa peraturan perlembagaan khas (perlembagaan PBRS tidak tersedia).
   DUN dipilih dalam PRN Sabah (js/sabah.js). Ciri teras (mockup PRN Sabah + PBRS, dipersetujui): Dua Gabungan: BN & GRS.
     - Kuota asas BN: Parlimen P.182 Pensiangan; DUN N.45 Sook dan N.40 Bingkor (seperti PRN 2025).
     - Kesetiaan BN (mula 60) dan Muhibah GRS (mula 45), susut perlahan ke arah 50 setiap bulan.
     - Rundingan 12 bulan sebelum PRN: Kesetiaan BN >= 70 -> kuota DUN +1 (N.46 Nabawan), < 35 -> kuota DUN -1 (Sook sahaja).
     - Muhibah GRS >= 50: GRS tidak meletak calon di kerusi PBRS; < 50: pertandingan 3 penjuru, kekuatan kerusi -8.
   State: p.pbrs = { setiaBN, muhibahGRS, lobiBulan, muhibahBulan, ma63Bulan, kuota:{prn, dun:[]}, pusat:{} }
   SEMUA ANGKA BERTANDA ANDAIAN IALAH ANDAIAN PERMAINAN. Permainan simulasi; bukan laman rasmi parti.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikPBRS = api;
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
  function DATA() { return modul('MyPolitikPBRSData', 'pbrs-data.js') || { parlimen: {}, dun: {} }; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(t, b) { return (parseInt(t, 10) || 0) * 12 + (parseInt(b, 10) || 1); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  var CONFIG = {
    TAHUN_MULA: 2026, KITARAN_TAHUN: 3, BULAN_PUSAT: 9,                 // ANDAIAN: takwim bulan 3/5/9; pemilihan setiap 3 tahun dari 2026
    KUOTA_PARLIMEN: 1, KUOTA_DUN: 2, DUN_TAMBAH: '12_N.46', DUN_KEKAL: '12_N.45',
    METER: { setiaAwal: 60, muhibahAwal: 45, tengah: 50, susut: 1 },
    LOBI: { ap: 2, myr: 1500, naik: 6, pangkatMin: 7 },
    MUHIBAH: { ap: 1, myr: 800, naik: 6, tolakBN: 2 },
    MA63: { ap: 1, akarUmbi: 5 },
    RUNDING: { bulanSebelum: 12, tinggi: 70, rendah: 35 },
    GRS: { ambang: 50, ofset: -8 },
    PUSAT: { sendiri: 60, lain: [30, 45], bonusSkala: 0.3, wakilBahagian: 10, mt: 30 }
  };

  function adalah(p) { return !!(p && p.parti === 'PBRS'); }
  function st(p) {
    var m = p && p.pbrs && typeof p.pbrs === 'object' ? p.pbrs : {};
    if (typeof m.setiaBN !== 'number') { m.setiaBN = CONFIG.METER.setiaAwal; }
    if (typeof m.muhibahGRS !== 'number') { m.muhibahGRS = CONFIG.METER.muhibahAwal; }
    if (!m.pusat || typeof m.pusat !== 'object') { m.pusat = {}; }
    return m;
  }
  function simpan(p, m, kesan, log) {
    return S().applyEffects(kesan || {}, { kiraTindakan: !!(log && log.kira), patch: { pbrs: m }, log: log && log.nama ? { tindakan: log.tindakan || 'pbrs', nama: log.nama, peringkat: 'ahli' } : undefined });
  }
  function pangkat(p) { var J0 = J(); return J0 ? Math.max(J0.pangkatTertinggi(p, 'utama'), Number(p.pangkatUtamaLalu) || 0) : 0; }
  function sekarang(p) { return idx(p.tahun, p.bulan); }
  function kodPL(p) { var k = p && p.kod && p.kod.parlimen; return k ? 'P.' + String(parseInt(k, 10)).padStart(3, '0') : null; }
  function kodDUN(p, pl) { return pl && p.kod && p.kod.dun && parseInt(p.kod.dun, 10) > 0 ? pl.ng + '_N.' + String(parseInt(p.kod.dun, 10)).padStart(2, '0') : null; }

  /* ---------- PRN Sabah: jadual dan kuota DUN ---------- */
  function getPRU(p) { var P0 = PRU(); try { return P0 && P0.getPRU ? P0.getPRU(p) : (p && p.pru) || {}; } catch (e) { return (p && p.pru) || {}; } }
  /** Indeks bulan PRN Sabah akan datang (atau yang sedang berlangsung). */
  function prnIdx(p) { var pr = getPRU(p); if (pr.jenisPBB === 'PRN') { return idx(pr.tahunPRU, pr.bulanPRU); } var t = (parseInt(pr.tahunPRU, 10) || 2031) - 1 + 5; return idx(t, 11); }
  function senaraiKuotaDUN(setia) {
    var asas = Object.keys(DATA().dun).filter(function (k) { return DATA().dun[k].q; });
    if (setia >= CONFIG.RUNDING.tinggi) { return asas.concat([CONFIG.DUN_TAMBAH]); }
    if (setia < CONFIG.RUNDING.rendah) { return [CONFIG.DUN_KEKAL]; }
    return asas;
  }
  /** Kuota DUN semasa: hasil rundingan PRN ini jika sudah, jika tidak unjuran ikut Kesetiaan BN sekarang. */
  function kuotaDUN(p) { var m = st(p), j = prnIdx(p); return m.kuota && m.kuota.prn === j ? m.kuota.dun : senaraiKuotaDUN(m.setiaBN); }
  function grsBertembung(p) { return st(p).muhibahGRS < CONFIG.GRS.ambang; }

  /* ---------- Kawasan (antara muka sama seperti MCA/MIC/PPP untuk js/pru.js) ---------- */
  function kawasan(p) {
    var d = DATA(), kp = kodPL(p), pl = kp ? d.parlimen[kp] : null, kd = kodDUN(p, pl), dn = kd && d.dun[kd] ? Object.assign({ kod: kd }, d.dun[kd]) : null;
    return { parlimen: pl ? Object.assign({ kod: kp }, pl) : null, dun: dn, kuotaPL: !!(pl && pl.q), kuotaDUN: !!(dn && kuotaDUN(p).indexOf(kd) >= 0), bilBahagian: Object.keys(d.parlimen).length };
  }
  function sebabKuota(p, jenis) {
    return jenis === 'DUN' ? 'DUN anda di luar kuota PBRS dalam BN (' + kuotaDUN(p).map(function (k) { return (DATA().dun[k] || {}).n; }).join(', ') + ')' : 'Kawasan Parlimen anda di luar kuota PBRS dalam BN (Pensiangan sahaja)';
  }
  function ofset(p) { return grsBertembung(p) ? CONFIG.GRS.ofset : 0; }
  function lawan(p, jenis) { return grsBertembung(p) ? ['Warisan', 'GRS'] : (jenis === 'DUN' ? ['Warisan', 'UPKO'] : ['Warisan', 'PKR']); }

  /* ---------- Kitaran pemilihan 3 tahun dari 2026 (ANDAIAN) ---------- */
  function adalahTahunPemilihan(p, tahun) { var t = parseInt(tahun, 10); return t >= CONFIG.TAHUN_MULA && (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN === 0; }
  function tahunSeterusnya(p, tahun) { var t = parseInt(tahun, 10); if (t <= CONFIG.TAHUN_MULA) { return CONFIG.TAHUN_MULA; } var b = (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN; return b === 0 ? t : t + CONFIG.KITARAN_TAHUN - b; }
  function tahunLepas(p, tahun) { var t = parseInt(tahun, 10); return t < CONFIG.TAHUN_MULA ? null : t - ((t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN); }

  /* ---------- Pemilihan Pusat (ANDAIAN 10 perwakilan setiap Bahagian + Majlis Tertinggi) ---------- */
  function ringkasPusat(p) {
    var d = DATA(), m = st(p), own = kodPL(p), ks = Object.keys(d.parlimen), jum = 0;
    ks.forEach(function (k) { var v = m.pusat[k]; if (typeof v !== 'number') { var c = CONFIG.PUSAT.lain; v = k === own ? CONFIG.PUSAT.sendiri : c[0] + (hash(String(p.id) + '|pbrs|' + k) % (c[1] - c[0] + 1)); } jum += v; });
    var purata = ks.length ? jum / ks.length : 0, pengundi = ks.length * CONFIG.PUSAT.wakilBahagian + CONFIG.PUSAT.mt;
    return { purata: Math.round(purata * 10) / 10, pengundi: pengundi, bilBahagian: ks.length, sokongUndi: Math.round(pengundi * purata / 100) };
  }
  function bonusPusat(p) { return adalah(p) ? Math.round((ringkasPusat(p).purata - 40) * CONFIG.PUSAT.bonusSkala * 10) / 10 : 0; }

  /* ---------- Tindakan: Lobi BN Sabah, Majlis Muhibah GRS, Kempen Hak Orang Asal & MA63 ---------- */
  function semakAsas(p, ap, myr, kunci) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk PBRS.' }; }
    var m = st(p); if (m[kunci] === sekarang(p)) { return { boleh: false, sebab: 'Sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < ap) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if (myr && (Number(p.myr) || 0) < myr) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function statusLobi(p) { if (adalah(p) && pangkat(p) < CONFIG.LOBI.pangkatMin) { return { boleh: false, sebab: 'Perlu Ketua Bahagian atau lebih.' }; } return semakAsas(p, CONFIG.LOBI.ap, CONFIG.LOBI.myr, 'lobiBulan'); }
  function statusMuhibah(p) { return semakAsas(p, CONFIG.MUHIBAH.ap, CONFIG.MUHIBAH.myr, 'muhibahBulan'); }
  function statusMA63(p) { return semakAsas(p, CONFIG.MA63.ap, 0, 'ma63Bulan'); }
  function lobi() {
    var p = S().loadPlayer(), s0 = statusLobi(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), a = m.setiaBN; m.setiaBN = clamp(a + CONFIG.LOBI.naik, 0, 100); m.lobiBulan = sekarang(p);
    var r = simpan(p, m, { ap: -CONFIG.LOBI.ap, myr: -CONFIG.LOBI.myr }, { kira: true, tindakan: 'pbrs_lobi', nama: 'Lobi BN Sabah' });
    return r.ok ? { ok: true, mesej: 'Anda melobi pimpinan BN Sabah. Kesetiaan BN ' + Math.round(a) + ' → ' + Math.round(m.setiaBN) + '.' } : { ok: false, ralat: r.ralat };
  }
  function muhibah() {
    var p = S().loadPlayer(), s0 = statusMuhibah(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), g0 = m.muhibahGRS, b0 = m.setiaBN; m.muhibahGRS = clamp(g0 + CONFIG.MUHIBAH.naik, 0, 100); m.setiaBN = clamp(b0 - CONFIG.MUHIBAH.tolakBN, 0, 100); m.muhibahBulan = sekarang(p);
    var r = simpan(p, m, { ap: -CONFIG.MUHIBAH.ap, myr: -CONFIG.MUHIBAH.myr }, { kira: true, tindakan: 'pbrs_muhibah', nama: 'Majlis Muhibah GRS' });
    return r.ok ? { ok: true, mesej: 'Majlis Muhibah bersama pemimpin GRS. Muhibah GRS ' + Math.round(g0) + ' → ' + Math.round(m.muhibahGRS) + ', tetapi BN curiga: Kesetiaan BN ' + Math.round(b0) + ' → ' + Math.round(m.setiaBN) + '.' } : { ok: false, ralat: r.ralat };
  }
  function ma63() {
    var p = S().loadPlayer(), s0 = statusMA63(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p); m.ma63Bulan = sekarang(p);
    var r = simpan(p, m, { ap: -CONFIG.MA63.ap, kesetiaan: { akarUmbi: CONFIG.MA63.akarUmbi } }, { kira: true, tindakan: 'pbrs_ma63', nama: 'Kempen Hak Orang Asal & MA63' });
    return r.ok ? { ok: true, mesej: 'Anda berkempen untuk hak orang asal dan Perjanjian Malaysia 1963 di kawasan pedalaman. Sokongan akar umbi +' + CONFIG.MA63.akarUmbi + '.' } : { ok: false, ralat: r.ralat };
  }

  /* ---------- Bulanan (rantaian kalendar) ---------- */
  function prosesBulan() {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat || !adalah(p)) { return { peristiwa: ev }; }
    var m = st(p), now = sekarang(p), j = prnIdx(p), C = CONFIG;
    // 1. rundingan kuota DUN 12 bulan sebelum PRN Sabah
    if ((!m.kuota || m.kuota.prn !== j) && now >= j - C.RUNDING.bulanSebelum && now <= j) {
      var dun = senaraiKuotaDUN(m.setiaBN), nama = dun.map(function (k) { return (DATA().dun[k] || {}).n; }).join(', ');
      m.kuota = { prn: j, dun: dun };
      ev.push('Rundingan kerusi BN untuk PRN Sabah: PBRS diberi ' + dun.length + ' kerusi DUN (' + nama + ') dan kerusi Parlimen Pensiangan. ' +
        (m.setiaBN >= C.RUNDING.tinggi ? 'Kesetiaan BN yang tinggi memberi satu kerusi tambahan.' : m.setiaBN < C.RUNDING.rendah ? 'Kesetiaan BN yang rendah menyebabkan PBRS hilang satu kerusi.' : 'Kuota asas dikekalkan.') +
        (grsBertembung(p) ? ' Muhibah GRS rendah: GRS dijangka meletak calon di kerusi PBRS (pertandingan 3 penjuru).' : ' GRS bersetuju tidak meletak calon di kerusi PBRS.'));
    }
    // 2. meter susut perlahan ke arah 50
    ['setiaBN', 'muhibahGRS'].forEach(function (k) { var v = m[k]; if (v > C.METER.tengah) { m[k] = Math.max(C.METER.tengah, v - C.METER.susut); } else if (v < C.METER.tengah) { m[k] = Math.min(C.METER.tengah, v + C.METER.susut); } });
    simpan(p, m, {}, null);
    return { peristiwa: ev.map(function (t) { return { jenis: 'pbrs', mesej: t }; }) };
  }

  return { CONFIG: CONFIG, adalah: adalah, kawasan: kawasan, sebabKuota: sebabKuota, ofset: ofset, lawan: lawan, kuotaDUN: kuotaDUN, grsBertembung: grsBertembung, prnIdx: prnIdx,
    adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya, ringkasPusat: ringkasPusat, bonusPusat: bonusPusat,
    meter: function (p) { var m = st(p); return { setiaBN: m.setiaBN, muhibahGRS: m.muhibahGRS }; },
    statusLobi: statusLobi, lobi: lobi, statusMuhibah: statusMuhibah, muhibah: muhibah, statusMA63: statusMA63, ma63: ma63, prosesBulan: prosesBulan };
});
