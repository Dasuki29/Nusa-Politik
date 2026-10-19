/* ==========================================================================
   Nusa Politik — js/harta.js   (v8.13)
   Harta & Aset Peribadi (assetPortfolio), Cukai Terkumpul (taxEngine) dan Pengisytiharan Harta SPRM (assetDeclarationEvent).

   1. Aset: Hartanah (IP pasif sebulan), Agensi / Syarikat Media (kurangkan peluang krisis politik bulanan), Kenderaan Mewah / Jet
      (kurangkan Stress sebulan). Setiap aset dimiliki sekali, nilai tetap, kos penyelenggaraan 0.5% sebulan, jual pada 80%.
   2. Cukai: kekayaan bersih = tunai + nilai aset. Cukai tahunan ikut kurungan marginal; 1/12 dikumpul setiap bulan (tidak ditolak
      serta-merta) dan dilunaskan semasa pengisytiharan.
   3. Pengisytiharan Harta SPRM: wajib setiap 12 bulan atau apabila baru dilantik ke jawatan kerajaan. Bulan tidak boleh dimajukan
      sehingga dijawab.
        Telus  : bayar cukai terkumpul, Integriti Parti +15, Risiko Audit -15.
        Sembunyi (offshore): tunai dikekalkan, cukai dihapuskan; Risiko Audit +25 dan risiko tadbir urus +15 (pemegang jawatan kerajaan).
                 Setiap bulan peluang diaudit = Risiko Audit / 2 (%). Audit: bayar cukai dielak + denda 100%, Integriti -15, Reputasi -8.
   State: p.harta = { aset:{id:true}, cukaiTerkumpul, cukaiElak, tertunggak, risikoAudit, terakhir, akhir, menunggu, kerajaanDilihat, sejarah }.
   ANDAIAN: semua angka ialah penyeimbang simulasi, bukan peraturan cukai atau SPRM sebenar.

   API (window.MyPolitikHarta):
     ASET, CONFIG, KURUNGAN
     getHarta(p)              state yang disahkan
     katalog(p)               aset + status milik / boleh beli
     cukaiTahunan(bersih)     cukai tahunan ikut kurungan
     ringkasan(p)             tunai, nilaiAset, bersih, kadar, cukaiTerkumpul, kesan pasif, risikoAudit, menunggu
     faktorKrisis(p)          pengganda peluang krisis politik (1 = tiada kesan)
     beli(id) / jual(id)      pulang { ok, mesej } atau { ok:false, ralat }
     pilihanDeklarasi(p)      pilihan Telus / Sembunyi
     isytihar(pilihId, o)     jawab pengisytiharan yang menunggu
     menunggu(p)              acara menunggu atau null
     prosesBulan(o)           dipanggil oleh calendar.js; pulang { peristiwa }
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikHarta = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function ST() { return modul('MyPolitikStres', 'stress.js'); }
  function IG() { return modul('MyPolitikIntegriti', 'integriti.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('ms-MY'); }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }

  var ASET = [
    { id: 'rumah',  jenis: 'hartanah', ikon: '🏠', nama: 'Hartanah: Rumah teres', harga: 40000,  ip: 2, huraian: 'Sewa dan nilai hartanah menyumbang +2 IP sebulan.' },
    { id: 'wisma',  jenis: 'hartanah', ikon: '🏢', nama: 'Hartanah: Wisma Pejabat', harga: 120000, ip: 6, huraian: 'Bangunan pejabat untuk gerak kerja anda, +6 IP sebulan.' },
    { id: 'agensi', jenis: 'media',    ikon: '📰', nama: 'Agensi Penerangan', harga: 30000,  imej: 0.25, huraian: 'Mengurangkan peluang krisis politik bulanan sebanyak 25%.' },
    { id: 'media',  jenis: 'media',    ikon: '📺', nama: 'Syarikat Media', harga: 90000,  imej: 0.45, huraian: 'Mengurangkan peluang krisis politik bulanan sebanyak 45%.' },
    { id: 'kereta', jenis: 'kenderaan', ikon: '🚗', nama: 'Kenderaan mewah', harga: 25000, stress: 2, huraian: 'Mengurangkan Stress 2 mata sebulan.' },
    { id: 'jet',    jenis: 'kenderaan', ikon: '🛩️', nama: 'Jet persendirian', harga: 150000, stress: 5, huraian: 'Mengurangkan Stress 5 mata sebulan.' }
  ];
  var KURUNGAN = [{ dari: 0, hingga: 50000, kadar: 0 }, { dari: 50000, hingga: 200000, kadar: 0.01 }, { dari: 200000, hingga: 500000, kadar: 0.02 }, { dari: 500000, hingga: 1e15, kadar: 0.03 }];
  var CONFIG = {
    JUAL: 0.8, PENYELENGGARAAN: 0.005, KITARAN: 12,
    TELUS: { skor: 15, risikoAudit: -15 },
    SEMBUNYI: { risikoAudit: 25, risikoTadbir: 15 },
    AUDIT: { bahagi: 2, denda: 1, skor: -15, reputasi: -8, selepas: 10 }
  };

  function dasar() { return { aset: {}, cukaiTerkumpul: 0, cukaiElak: 0, tertunggak: 0, risikoAudit: 0, terakhir: 0, akhir: '', menunggu: null, kerajaanDilihat: false, sejarah: [] }; }
  function getHarta(p) {
    var h = p && p.harta && typeof p.harta === 'object' ? p.harta : {}, o = dasar();
    ASET.forEach(function (a) { if (h.aset && h.aset[a.id]) { o.aset[a.id] = true; } });
    ['cukaiTerkumpul', 'cukaiElak', 'tertunggak', 'terakhir'].forEach(function (k) { o[k] = Math.max(0, Math.round(Number(h[k]) || 0)); });
    o.risikoAudit = clamp(Math.round(Number(h.risikoAudit) || 0), 0, 100);
    o.akhir = String(h.akhir || ''); o.kerajaanDilihat = !!h.kerajaanDilihat;
    o.menunggu = h.menunggu && typeof h.menunggu === 'object' ? { sebab: String(h.menunggu.sebab || 'kitaran'), tahun: h.menunggu.tahun, bulan: h.menunggu.bulan } : null;
    o.sejarah = Array.isArray(h.sejarah) ? h.sejarah.slice(-10) : [];
    return o;
  }
  function simpan(h, kesan, opts) {
    opts = opts || {}; var patch = Object.assign({ harta: h }, opts.patch || {});
    return S().applyEffects(kesan || {}, { kiraTindakan: false, pindahan: !!opts.pindahan, tanpaKesukaran: !!opts.tanpaKesukaran, patch: patch, log: opts.log });
  }
  function rekod(h, p, jenis, mesej) { h.sejarah = h.sejarah.concat([{ jenis: jenis, mesej: mesej, tahun: p.tahun, bulan: p.bulan }]).slice(-10); }

  function nilaiAset(h) { return ASET.reduce(function (a, x) { return a + (h.aset[x.id] ? x.harga : 0); }, 0); }
  function cukaiTahunan(bersih) {
    bersih = Math.max(0, Number(bersih) || 0);
    return Math.round(KURUNGAN.reduce(function (t, k) { return t + Math.max(0, Math.min(bersih, k.hingga) - k.dari) * k.kadar; }, 0));
  }
  function kadarMarginal(bersih) { var k = KURUNGAN.filter(function (x) { return bersih > x.dari && bersih <= x.hingga; })[0]; return k ? k.kadar : (bersih > KURUNGAN[0].hingga ? KURUNGAN[KURUNGAN.length - 1].kadar : 0); }
  function kesanPasif(h) {
    var o = { ip: 0, stress: 0, imej: 0, kos: 0 };
    ASET.forEach(function (a) {
      if (!h.aset[a.id]) { return; }
      o.ip += a.ip || 0; o.stress += a.stress || 0; o.imej = Math.max(o.imej, a.imej || 0); o.kos += Math.round(a.harga * CONFIG.PENYELENGGARAAN);
    });
    return o;
  }
  function faktorKrisis(p) { return 1 - kesanPasif(getHarta(p)).imej; }
  function pegangKerajaan(p) { var K = KB(); return !!(K && K.getKabinet && K.getKabinet(p).hasGovernmentRole); }
  function menunggu(p) { return getHarta(p).menunggu; }

  function ringkasan(p) {
    var h = getHarta(p), nilai = nilaiAset(h), tunai = Number(p && p.myr) || 0, bersih = tunai + nilai, ps = kesanPasif(h), kini = idx(p);
    var baki = h.terakhir ? Math.max(0, CONFIG.KITARAN - (kini - h.terakhir)) : CONFIG.KITARAN;
    return { tunai: tunai, nilaiAset: nilai, bersih: bersih, kadar: kadarMarginal(bersih), cukaiTahunan: cukaiTahunan(bersih), cukaiTerkumpul: h.cukaiTerkumpul, tertunggak: h.tertunggak,
      pasif: ps, risikoAudit: h.risikoAudit, cukaiElak: h.cukaiElak, bulanBaki: baki, menunggu: h.menunggu, kerajaan: pegangKerajaan(p) };
  }

  function katalog(p) {
    var h = getHarta(p), tunai = Number(p && p.myr) || 0;
    return ASET.map(function (a) {
      var milik = !!h.aset[a.id], boleh = !milik && tunai >= a.harga && !h.menunggu;
      return Object.assign({}, a, { milik: milik, boleh: boleh, sebab: milik ? '' : h.menunggu ? 'Jawab Pengisytiharan Harta dahulu.' : tunai < a.harga ? 'Dana tidak mencukupi (perlu ' + rm(a.harga) + ').' : '',
        jual: Math.round(a.harga * CONFIG.JUAL), kos: Math.round(a.harga * CONFIG.PENYELENGGARAAN) });
    });
  }
  function cariAset(id) { return ASET.filter(function (a) { return a.id === id; })[0] || null; }

  function beli(id) {
    var Sv = S(), p = Sv && Sv.loadPlayer(); if (!p) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var a = cariAset(id), h = getHarta(p); if (!a) { return { ok: false, ralat: 'Aset tidak dikenali.' }; }
    if (h.menunggu) { return { ok: false, ralat: 'Jawab Pengisytiharan Harta SPRM dahulu.' }; }
    if (h.aset[id]) { return { ok: false, ralat: 'Anda sudah memiliki aset ini.' }; }
    if ((Number(p.myr) || 0) < a.harga) { return { ok: false, ralat: 'Dana tidak mencukupi (perlu ' + rm(a.harga) + ').' }; }
    h.aset[id] = true; rekod(h, p, 'beli', 'Membeli ' + a.nama);
    var r = simpan(h, { myr: -a.harga }, { pindahan: true, log: { tindakan: 'harta_beli', nama: 'Membeli ' + a.nama, peringkat: 'ahli' } });
    return r.ok ? { ok: true, mesej: 'Membeli ' + a.nama + ' (' + rm(a.harga) + '). Kos penyelenggaraan ' + rm(Math.round(a.harga * CONFIG.PENYELENGGARAAN)) + ' sebulan.' } : { ok: false, ralat: r.ralat };
  }
  function jual(id) {
    var Sv = S(), p = Sv && Sv.loadPlayer(); if (!p) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var a = cariAset(id), h = getHarta(p); if (!a) { return { ok: false, ralat: 'Aset tidak dikenali.' }; }
    if (!h.aset[id]) { return { ok: false, ralat: 'Anda tidak memiliki aset ini.' }; }
    var hasil = Math.round(a.harga * CONFIG.JUAL);
    delete h.aset[id]; rekod(h, p, 'jual', 'Menjual ' + a.nama);
    var r = simpan(h, { myr: hasil }, { pindahan: true, log: { tindakan: 'harta_jual', nama: 'Menjual ' + a.nama, peringkat: 'ahli' } });
    return r.ok ? { ok: true, mesej: 'Menjual ' + a.nama + ' pada ' + rm(hasil) + ' (80% harga beli).' } : { ok: false, ralat: r.ralat };
  }

  /* ---------- Pengisytiharan Harta SPRM ---------- */
  function pilihanDeklarasi(p) {
    var h = getHarta(p), t = h.cukaiTerkumpul + h.tertunggak, bayar = Math.min(Number(p.myr) || 0, t), kerajaan = pegangKerajaan(p);
    return [
      { id: 'telus', label: '🤝 Pengisytiharan 100% Telus', boleh: true,
        ringkas: 'Bayar ' + rm(bayar) + (t > bayar ? ' (baki ' + rm(t - bayar) + ' ditangguh)' : '') + ', Integriti Parti +' + CONFIG.TELUS.skor + ', Risiko Audit ' + CONFIG.TELUS.risikoAudit },
      { id: 'sembunyi', label: '🏝️ Sembunyi Aset (Offshore)', boleh: true,
        ringkas: 'Tunai dikekalkan, cukai ' + rm(t) + ' dielak, Risiko Audit +' + CONFIG.SEMBUNYI.risikoAudit + (kerajaan ? ', risiko tadbir urus +' + CONFIG.SEMBUNYI.risikoTadbir : '') }
    ];
  }

  function isytihar(pilihId) {
    var Sv = S(), p = Sv && Sv.loadPlayer(); if (!p) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var h = getHarta(p); if (!h.menunggu) { return { ok: false, ralat: 'Tiada pengisytiharan menunggu.' }; }
    var jumlah = h.cukaiTerkumpul + h.tertunggak, I = IG(), mesej, r;
    if (pilihId === 'telus') {
      var bayar = Math.min(Number(p.myr) || 0, jumlah);
      h.tertunggak = jumlah - bayar; h.cukaiTerkumpul = 0; h.cukaiElak = 0; h.risikoAudit = clamp(h.risikoAudit + CONFIG.TELUS.risikoAudit, 0, 100);
      h.terakhir = idx(p); h.menunggu = null; mesej = 'Pengisytiharan telus: cukai ' + rm(bayar) + ' dibayar, Integriti Parti +' + CONFIG.TELUS.skor + (h.tertunggak ? '. Baki ' + rm(h.tertunggak) + ' ditangguh.' : '.');
      rekod(h, p, 'telus', mesej);
      r = simpan(h, bayar ? { myr: -bayar } : {}, { pindahan: true, log: { tindakan: 'harta_isytihar', nama: 'Pengisytiharan Harta SPRM (telus)', peringkat: 'ahli' } });
      if (!r.ok) { return { ok: false, ralat: r.ralat }; }
      if (I && I.ubahSkor) { I.ubahSkor(CONFIG.TELUS.skor, 'Pengisytiharan harta telus'); }
      return { ok: true, pilihan: 'telus', mesej: mesej };
    }
    if (pilihId === 'sembunyi') {
      h.cukaiElak += jumlah; h.cukaiTerkumpul = 0; h.tertunggak = 0; h.risikoAudit = clamp(h.risikoAudit + CONFIG.SEMBUNYI.risikoAudit, 0, 100);
      h.terakhir = idx(p); h.menunggu = null; mesej = 'Aset disembunyikan di luar negara. Cukai ' + rm(jumlah) + ' dielak. Risiko Audit SPRM kini ' + h.risikoAudit + '.';
      rekod(h, p, 'sembunyi', mesej);
      r = simpan(h, {}, { log: { tindakan: 'harta_isytihar', nama: 'Pengisytiharan Harta SPRM (sembunyi aset)', peringkat: 'ahli' } });
      if (!r.ok) { return { ok: false, ralat: r.ralat }; }
      if (I && I.tambahRisiko && pegangKerajaan(p)) { I.tambahRisiko(CONFIG.SEMBUNYI.risikoTadbir, 'aset disembunyikan semasa pengisytiharan harta'); }
      return { ok: true, pilihan: 'sembunyi', mesej: mesej };
    }
    return { ok: false, ralat: 'Pilihan tidak sah.' };
  }

  /* ---------- Proses bulanan ---------- */
  function prosesBulan(o) {
    o = o || {};
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat) { return { peristiwa: ev }; }
    var h = getHarta(p), kunciBulan = p.tahun + '-' + p.bulan, kini = idx(p);
    if (h.akhir === kunciBulan) { return { peristiwa: ev }; }
    var ps = kesanPasif(h), kesan = {}, rng = o.rng || Sv.rngBerbenih(String(p.id) + '|harta|' + kunciBulan), kerajaan = pegangKerajaan(p);
    if (!h.terakhir) { h.terakhir = kini; }
    /* 1. kesan pasif aset */
    var kos = Math.min(ps.kos, Math.max(0, Number(p.myr) || 0));
    if (ps.ip) { kesan.ip = ps.ip; }
    if (kos) { kesan.myr = -kos; }
    /* 2. cukai terkumpul: 1/12 cukai tahunan atas kekayaan bersih (selepas penyelenggaraan) */
    var bersih = (Number(p.myr) || 0) - kos + nilaiAset(h);
    h.cukaiTerkumpul += Math.round(cukaiTahunan(bersih) / CONFIG.KITARAN);
    /* 3. audit SPRM bagi aset yang disembunyikan */
    var auditDenda = null, kesanAudit = null;
    if (h.cukaiElak > 0 && rng() < h.risikoAudit / CONFIG.AUDIT.bahagi / 100) {
      var jumlahAudit = Math.round(h.cukaiElak * (1 + CONFIG.AUDIT.denda)), bayar = Math.min(Math.max(0, (Number(p.myr) || 0) - kos), jumlahAudit);
      auditDenda = jumlahAudit; kesan.myr = (kesan.myr || 0) - bayar; h.tertunggak += jumlahAudit - bayar; h.cukaiElak = 0; h.risikoAudit = CONFIG.AUDIT.selepas;
      kesan.reputasi = CONFIG.AUDIT.reputasi; kesanAudit = jumlahAudit;
      var m = 'Audit SPRM menemui aset yang disembunyikan! Cukai dan denda ' + rm(jumlahAudit) + ' (Integriti Parti ' + CONFIG.AUDIT.skor + ', Reputasi ' + CONFIG.AUDIT.reputasi + ').';
      rekod(h, p, 'audit', m); ev.push({ jenis: 'harta_audit', mesej: m });
    }
    /* 4. pengisytiharan wajib: setiap 12 bulan atau baru dilantik ke jawatan kerajaan */
    if (!h.menunggu) {
      var sebab = null;
      if (kerajaan && !h.kerajaanDilihat) { sebab = 'kerajaan'; }
      else if (kini - h.terakhir >= CONFIG.KITARAN) { sebab = 'kitaran'; }
      if (sebab) {
        h.menunggu = { sebab: sebab, tahun: p.tahun, bulan: p.bulan };
        ev.push({ jenis: 'harta_isytihar', mesej: sebab === 'kerajaan' ? 'Anda dilantik ke jawatan kerajaan. Pengisytiharan Harta SPRM diwajibkan.' : 'Tiba masa Pengisytiharan Harta SPRM tahunan.' });
      }
    }
    h.kerajaanDilihat = kerajaan; h.akhir = kunciBulan;
    var r = simpan(h, kesan, { tanpaKesukaran: true, log: kos || ps.ip ? { tindakan: 'harta_bulanan', nama: 'Aset: ' + (ps.ip ? '+' + ps.ip + ' IP, ' : '') + 'penyelenggaraan ' + rm(kos), peringkat: 'bulan' } : undefined });
    if (!r.ok) { return { peristiwa: [] }; }
    if (ps.stress && ST() && ST().laras) { ST().laras({ stress: -ps.stress }); }
    if (kesanAudit && IG() && IG().ubahSkor) { IG().ubahSkor(CONFIG.AUDIT.skor, 'Audit SPRM: aset disembunyikan'); }
    return { peristiwa: ev };
  }

  return { ASET: ASET, CONFIG: CONFIG, KURUNGAN: KURUNGAN, getHarta: getHarta, katalog: katalog, cukaiTahunan: cukaiTahunan, ringkasan: ringkasan, faktorKrisis: faktorKrisis,
    beli: beli, jual: jual, pilihanDeklarasi: pilihanDeklarasi, isytihar: isytihar, menunggu: menunggu, prosesBulan: prosesBulan };
});
