/* ==========================================================================
   Nusa Politik — js/glc.js   (v8.19)
   Jawatan GLC: lobi jawatan syarikat berkaitan kerajaan (nama REKAAN, bukan syarikat sebenar).
     - Lobi dibuka selepas pilihan raya: parti membentuk kerajaan (semua jawatan) atau pemain kalah (tawaran lebih rendah sahaja).
     - Kos lobi: IP + Dana. Gagal: separuh kos hilang. 2 percubaan sehingga pilihan raya berikutnya.
     - Ganjaran bulanan (Dana + IP). Risiko Konflik Kepentingan +2 dan risiko Audit SPRM +1 sebulan.
     - Tempoh 36 bulan; boleh diperbaharui dalam 6 bulan terakhir (separuh kos Dana).
     - Boleh bersama jawatan parti dan kerusi ADUN/MP; tidak bersama jawatan Menteri/EXCO (jawatan GLC tamat).
     - Risiko Audit tinggi atau Integriti Parti rendah boleh menyebabkan pemecatan dan denda.
   State: p.glc = { lobi:{jenis,baki}|null, jawatan:{id,nama,tahap,mula,tamat,gaji,ip}|null, konflik, audit, akhir, sejarah }
   ANDAIAN: semua angka ialah penyeimbang simulasi. Nama GLC ialah rekaan.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikGLC = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function IG() { return modul('MyPolitikIntegriti', 'integriti.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('ms-MY'); }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }

  var CONFIG = { PERCUBAAN: 2, GAGAL_PULANG: 0.5, TEMPOH: 36, BAHARUI_DALAM: 6, KONFLIK: 2, AUDIT: 1, DENDA: 5000, SKOR_RENDAH: 30, AUDIT_MULA: 30 };
  var TAHAP = {
    pengerusi: { nama: 'Pengerusi', ip: 220, myr: 15000, gaji: 2500, ipBulan: 4, asas: 0.55, kerajaanSahaja: true },
    ahli: { nama: 'Ahli Lembaga', ip: 120, myr: 8000, gaji: 1500, ipBulan: 3, asas: 0.65 },
    pengarah: { nama: 'Pengarah', ip: 80, myr: 5000, gaji: 1000, ipBulan: 2, asas: 0.75 }
  };
  var SYARIKAT = [
    { id: 'spn', nama: 'Syarikat Pelaburan Nusa' },
    { id: 'lpm', nama: 'Lembaga Pelabuhan Maritim' },
    { id: 'apn', nama: 'Agensi Pembangunan Negeri' }
  ];
  var JAWATAN = [];
  SYARIKAT.forEach(function (s) { Object.keys(TAHAP).forEach(function (t) { JAWATAN.push({ id: s.id + '_' + t, syarikat: s.nama, tahap: t, nama: TAHAP[t].nama + ', ' + s.nama }); }); });
  function cari(id) { return JAWATAN.filter(function (x) { return x.id === id; })[0] || null; }

  function dasar() { return { lobi: null, jawatan: null, konflik: 0, audit: 0, akhir: '', sejarah: [] }; }
  function getGLC(p) {
    var g = p && p.glc && typeof p.glc === 'object' ? p.glc : {}, o = dasar();
    o.lobi = g.lobi && typeof g.lobi === 'object' ? { jenis: g.lobi.jenis === 'kalah' ? 'kalah' : 'kerajaan', baki: Math.max(0, Number(g.lobi.baki) || 0) } : null;
    o.jawatan = g.jawatan && typeof g.jawatan === 'object' && cari(g.jawatan.id) ? Object.assign({}, g.jawatan) : null;
    o.konflik = clamp(Math.round(Number(g.konflik) || 0), 0, 100); o.audit = clamp(Math.round(Number(g.audit) || 0), 0, 100);
    o.akhir = String(g.akhir || ''); o.sejarah = Array.isArray(g.sejarah) ? g.sejarah.slice(-10) : [];
    return o;
  }
  function simpan(g, kesan, opts) {
    opts = opts || {};
    return S().applyEffects(kesan || {}, { kiraTindakan: false, pindahan: !!opts.pindahan, tanpaKesukaran: !!opts.tanpaKesukaran, patch: { glc: g }, log: opts.log });
  }
  function kerajaan(p) { var K = KB(); return !!(K && K.getKabinet && K.getKabinet(p).hasGovernmentRole); }
  function rngBulan(p, o, k) { return (o && o.rng) || S().rngBerbenih(String(p.id) + '|glc|' + k + '|' + p.tahun + '|' + p.bulan); }

  /** Dipanggil selepas keputusan pilihan raya: 'kerajaan' | 'kalah' | null (tutup lobi lapuk). */
  function bukaLobi(jenis) {
    var p = S().loadPlayer(); if (!p) { return { ok: false }; }
    var g = getGLC(p);
    if (!jenis) { if (!g.lobi) { return { ok: true }; } g.lobi = null; }
    else { if (g.jawatan && jenis !== 'kerajaan') { return { ok: true }; } g.lobi = { jenis: jenis, baki: CONFIG.PERCUBAAN }; }
    return { ok: !!simpan(g, {}, { log: jenis ? { tindakan: 'glc_lobi_buka', nama: 'Lobi jawatan GLC dibuka', peringkat: 'ahli' } : undefined }).ok };
  }
  function peluang(p, d) {
    var t = TAHAP[d.tahap];
    return clamp(t.asas + ((Number(p.ip) || 0) - t.ip) / (t.ip * 8) + ((Number(p.reputasi) || 50) - 50) * 0.003, 0.1, 0.95);
  }
  function senarai(p) {
    var g = getGLC(p); if (!g.lobi) { return []; }
    return JAWATAN.filter(function (d) { return !(g.lobi.jenis === 'kalah' && TAHAP[d.tahap].kerajaanSahaja); }).map(function (d) {
      var t = TAHAP[d.tahap], kos = S().kosSebenar ? S().kosSebenar(p, t.myr) : t.myr, sebab = [];
      if ((Number(p.ip) || 0) < t.ip) { sebab.push('IP tidak cukup (perlu ' + t.ip + ')'); }
      if ((Number(p.myr) || 0) < kos) { sebab.push('Dana tidak cukup (perlu ' + rm(kos) + ')'); }
      return { id: d.id, nama: d.nama, tahapNama: t.nama, ip: t.ip, myr: kos, gaji: t.gaji, ipBulan: t.ipBulan, peluang: Math.round(peluang(p, d) * 100), boleh: !sebab.length, sebab: sebab.join('; ') };
    });
  }
  function lobi(id, o) {
    var p = S().loadPlayer(), g = getGLC(p), d = cari(id);
    if (!p || p.tamat) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    if (!g.lobi || g.lobi.baki <= 0) { return { ok: false, ralat: 'Lobi GLC tidak tersedia.' }; }
    if (g.jawatan) { return { ok: false, ralat: 'Anda sudah memegang jawatan GLC.' }; }
    if (kerajaan(p)) { return { ok: false, ralat: 'Jawatan Menteri atau EXCO tidak boleh bersama jawatan GLC.' }; }
    var KMg = modul('MyPolitikKomuniti', 'komuniti.js');   // v8.23: jawatan komuniti bergaji tinggi tidak bersama GLC
    if (KMg && KMg.getKomuniti(p).jawatan.some(function (j) { var d = KMg.JAWATAN.filter(function (x) { return x.id === j.id; })[0]; return d && d.gajiTinggi; })) { return { ok: false, ralat: 'Jawatan komuniti bergaji tinggi tidak boleh bersama jawatan GLC.' }; }
    var s = senarai(p).filter(function (x) { return x.id === id; })[0];
    if (!d || !s) { return { ok: false, ralat: 'Jawatan tidak tersedia.' }; }
    if (!s.boleh) { return { ok: false, ralat: s.sebab }; }
    var t = TAHAP[d.tahap], lulus = rngBulan(p, o, id)() < peluang(p, d), kes;
    g.lobi.baki -= 1;
    if (lulus) {
      kes = { ip: -t.ip, myr: -s.myr };
      g.jawatan = { id: d.id, nama: d.nama, tahap: d.tahap, mula: idx(p), tamat: idx(p) + CONFIG.TEMPOH, gaji: t.gaji, ip: t.ipBulan };
      g.lobi = null; g.konflik = 0; g.audit = 0;
      g.sejarah = g.sejarah.concat([{ tahun: p.tahun, bulan: p.bulan, nama: d.nama, hasil: 'dilantik' }]).slice(-10);
      var r = simpan(g, kes, { pindahan: true, log: { tindakan: 'glc_jaya', nama: 'Dilantik GLC: ' + d.nama, peringkat: 'ahli' } });
      return r.ok ? { ok: true, dilantik: true, mesej: 'Dilantik sebagai ' + d.nama + '. Ganjaran bulanan bermula.' } : { ok: false, ralat: r.ralat };
    }
    var h = CONFIG.GAGAL_PULANG; kes = { ip: -Math.round(t.ip * (1 - h)), myr: -Math.round(s.myr * (1 - h)) };
    var tutup = g.lobi.baki <= 0; if (tutup) { g.lobi = null; }
    var r2 = simpan(g, kes, { pindahan: true, log: { tindakan: 'glc_gagal', nama: 'Lobi GLC gagal: ' + d.nama, peringkat: 'ahli' } });
    if (!r2.ok) { return { ok: false, ralat: r2.ralat }; }
    return { ok: true, dilantik: false, tutup: tutup, mesej: 'Lobi ' + d.nama + ' gagal. Separuh kos hilang.' + (tutup ? ' Peluang lobi GLC habis.' : ' Baki percubaan: ' + g.lobi.baki + '.') };
  }

  function bulanBaki(p, g) { return g.jawatan ? g.jawatan.tamat - idx(p) : 0; }
  function kosBaharui(p, g) { var t = g.jawatan && TAHAP[g.jawatan.tahap]; return t ? Math.round(t.myr * 0.5) : 0; }
  function baharui() {
    var p = S().loadPlayer(), g = getGLC(p); if (!g.jawatan) { return { ok: false, ralat: 'Tiada jawatan GLC.' }; }
    if (bulanBaki(p, g) > CONFIG.BAHARUI_DALAM) { return { ok: false, ralat: 'Pembaharuan hanya dalam ' + CONFIG.BAHARUI_DALAM + ' bulan terakhir tempoh.' }; }
    var kos = S().kosSebenar ? S().kosSebenar(p, kosBaharui(p, g)) : kosBaharui(p, g);
    if ((Number(p.myr) || 0) < kos) { return { ok: false, ralat: 'Dana tidak cukup (perlu ' + rm(kos) + ').' }; }
    g.jawatan.tamat += CONFIG.TEMPOH;
    var r = simpan(g, { myr: -kos }, { pindahan: true, log: { tindakan: 'glc_baharui', nama: 'Pembaharuan GLC: ' + g.jawatan.nama, peringkat: 'ahli' } });
    return r.ok ? { ok: true, mesej: 'Jawatan ' + g.jawatan.nama + ' diperbaharui 3 tahun (kos ' + rm(kos) + ').' } : { ok: false, ralat: r.ralat };
  }

  function ringkasan(p) {
    var g = getGLC(p), j = g.jawatan;
    return { lobi: g.lobi, jawatan: j, konflik: g.konflik, audit: g.audit, senarai: g.lobi && !j ? senarai(p) : [],
      bulanBaki: bulanBaki(p, g), bolehBaharui: !!j && bulanBaki(p, g) <= CONFIG.BAHARUI_DALAM, kosBaharui: kosBaharui(p, g), sejarah: g.sejarah, terhalang: kerajaan(p) };
  }

  function tamatkan(g, p, sebab, kes, log) {
    var nama = g.jawatan.nama; g.sejarah = g.sejarah.concat([{ tahun: p.tahun, bulan: p.bulan, nama: nama, hasil: sebab }]).slice(-10);
    g.jawatan = null; g.konflik = 0; g.audit = 0;
    return simpan(g, kes || {}, { tanpaKesukaran: true, pindahan: true, log: { tindakan: log, nama: 'Jawatan GLC tamat: ' + nama, peringkat: 'ahli' } });
  }

  /** Bulanan: ganjaran, risiko, pemecatan, tamat tempoh. Sekali sebulan. */
  function prosesBulan(o) {
    var p = S().loadPlayer(), ev = []; if (!p || p.tamat) { return { peristiwa: ev }; }
    var g = getGLC(p), kunci = p.tahun + '-' + p.bulan; if (g.akhir === kunci || !g.jawatan) { return { peristiwa: ev }; }
    g.akhir = kunci;
    if (kerajaan(p)) { tamatkan(g, p, 'menteri', {}, 'glc_tamat'); ev.push({ jenis: 'glc_tamat', mesej: 'Jawatan GLC tamat kerana anda dilantik ke jawatan kerajaan.' }); return { peristiwa: ev }; }
    var j = g.jawatan;
    g.konflik = clamp(g.konflik + CONFIG.KONFLIK, 0, 100); g.audit = clamp(g.audit + CONFIG.AUDIT, 0, 100);
    var ig = IG(), skor = ig && ig.getIntegriti ? Number(ig.getIntegriti(p).skor) : 50;
    var kes = { myr: j.gaji, ip: j.ip };
    if (g.konflik >= 60) { kes.reputasi = -1; }
    var risiko = g.audit >= CONFIG.AUDIT_MULA || skor < CONFIG.SKOR_RENDAH;
    var kemungkinan = risiko ? clamp((g.audit - CONFIG.AUDIT_MULA) / 200 + (skor < CONFIG.SKOR_RENDAH ? 0.1 : 0), 0.02, 0.6) : 0;
    if (risiko && rngBulan(p, o, 'pecat')() < kemungkinan) {
      var denda = Math.min(CONFIG.DENDA, Math.max(0, Number(p.myr) || 0));
      tamatkan(g, p, 'dipecat', { myr: -denda, reputasi: -5 }, 'glc_pecat');
      if (ig && ig.ubahSkor) { ig.ubahSkor(-10, 'Dipecat daripada jawatan GLC'); }
      ev.push({ jenis: 'glc_pecat', mesej: 'SPRM menyiasat dan anda dipecat daripada ' + j.nama + '. Denda ' + rm(denda) + ', Reputasi -5, Integriti Parti -10.' });
      return { peristiwa: ev };
    }
    if (idx(p) >= j.tamat) { tamatkan(g, p, 'tamat', kes, 'glc_tamat'); ev.push({ jenis: 'glc_tamat', mesej: 'Tempoh jawatan ' + j.nama + ' tamat.' }); return { peristiwa: ev }; }
    simpan(g, kes, { tanpaKesukaran: true, pindahan: true, log: { tindakan: 'glc_bulanan', nama: 'GLC ' + j.nama + ': +' + rm(j.gaji) + ', +' + j.ip + ' IP', peringkat: 'bulan' } });
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, TAHAP: TAHAP, SYARIKAT: SYARIKAT, JAWATAN: JAWATAN, getGLC: getGLC, bukaLobi: bukaLobi, senarai: senarai, lobi: lobi, baharui: baharui, ringkasan: ringkasan, prosesBulan: prosesBulan };
});
