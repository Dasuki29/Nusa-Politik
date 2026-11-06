/* ==========================================================================
   Nusa Politik — js/kerusi-semasa.js   (v13.26)
   Perubahan kerusi semasa penggal dan sejarah PRU untuk carta hemisikal (mockup Fasa 2, dipersetujui).
     - geser(): satu kerusi berpindah antara blok (PARTI, RAKAN, LAIN, PH, PN) dalam p.kerusiNasional (Parlimen) atau .dun.
       Pecahan PH / PN disimpan sebagai pelarasan (ubah) di atas pecahan asal paparan.js.
     - PRK pemain (prk.js) dan PRK selepas letak jawatan (letak.js) memanggil geser() apabila kerusi bertukar tangan.
     - prosesBulan(): PRK di kawasan lain (NPC), peluang 15% sebulan; tiada PRK dalam 12 bulan terakhir penggal
       atau semasa PRU. Penyandang kekal 70%; jika bertukar, pemenang ikut Reputasi pemain (proksi sentimen nasional).
       PRK NPC tidak boleh menukar kerajaan (kerusi kekal jika pertukaran merentas ambang majoriti).
     - Sejarah: setiap keputusan PRU baharu diarkibkan (pecahan penuh) dalam p.kerusiSejarah (5 terakhir).
   Lompat parti tidak dimodelkan (Akta Anti Lompat Parti: kerusi dikosongkan, jadi muncul sebagai PRK).
   ANDAIAN: semua peluang ialah angka permainan, bukan ramalan.
   State: p.kerusiNasional.ubah {PH,PN}, .dun.ubah {PH,PN}, .perubahan [{ tahun, bulan, dun, dari, ke, kerusi, sebab }];
          p.kerusiSejarah [{ tahun, bulan, jumlah, ambang, PARTI, RAKAN, LAIN, PH, PN, kerajaan, dun }].
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikKerusiSemasa = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function PAP() { return modul('NusaPaparan', 'paparan.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function LTK() { return modul('MyPolitikLetak', 'letak.js'); }
  function SW(k) { return k === 'PBB' || k === 'PRS' || k === 'SUPP' || k === 'PDP' || k === 'PSB'; }

  var CONFIG = { PELUANG: 0.15, DUN: 0.3, KEKAL: 0.7, MAKS_LOG: 10, MAKS_SEJARAH: 5, JUMLAH: 222, MAJORITI: 112,
    LAWAN: { PAS: 'PN', Bersatu: 'PN', DAP: 'PH', PKR: 'PH', Amanah: 'PH' },
    LAWAN_PAS: { UMNO: 'PN', MCA: 'PN', MIC: 'PN', DAP: 'PH', PKR: 'PH', Amanah: 'PH' },   // v13.31: pemain PAS: slot 'PN' dalaman = BN
    LAWAN_PKR: { UMNO: 'PH', MCA: 'PH', MIC: 'PH', PAS: 'PN', Bersatu: 'PN', Gerakan: 'PN' } };   // v13.34: pemain PKR: slot 'PH' dalaman = BN   // v13.31: pemain PAS: slot 'PN' dalaman = BN
  var rngLalai = Math.random;
  function salin(o) { return JSON.parse(JSON.stringify(o)); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }

  /** Kiraan blok semasa (dengan pelarasan) bagi Parlimen atau DUN: { jumlah, ambang, PARTI, RAKAN, LAIN, PH, PN } atau null. */
  function blok(p, dun) {
    var A = PAP(), g = A && A.kerusiGabungan ? A.kerusiGabungan(p) : null; if (!g) { return null; }
    if (dun) { var d = g.dun; return d ? { jumlah: d.jumlah, ambang: d.ambang, PARTI: d.BN, RAKAN: 0, LAIN: d.LAIN, PH: d.PH, PN: d.PN } : null; }
    return { jumlah: g.jumlah, ambang: g.ambang, PARTI: g.BN - (g.rakan || 0), RAKAN: g.rakan || 0, LAIN: g.LAIN, PH: g.PH, PN: g.PN };
  }
  /** Pindah satu kerusi dari blok `dari` ke blok `ke`. Pulang { ok, k } (k = kerusiNasional baharu, belum disimpan). */
  function geserObjek(p, o) {
    var k0 = p && p.kerusiNasional; if (!k0 || typeof k0.parti !== 'number') { return { ok: false, ralat: 'Tiada data kerusi.' }; }
    var b = blok(p, o.dun); if (!b || o.dari === o.ke || !(b[o.dari] > 0) || !(o.ke in b)) { return { ok: false, ralat: 'Pindahan kerusi tidak sah.' }; }
    var k = salin(k0), t = o.dun ? k.dun : k; if (!t) { return { ok: false, ralat: 'Tiada data DUN.' }; }
    t.ubah = t.ubah || { PH: 0, PN: 0 };
    function laras(kod, n) {
      if (kod === 'PARTI') { if (o.dun) { t.kerajaan += n; } else { t.parti += n; } }
      else if (kod === 'RAKAN') { t.rakan += n; }
      else if (kod === 'LAIN') { t.bebas += n; }
      else { t.pembangkang += n; t.ubah[kod] = (Number(t.ubah[kod]) || 0) + n; }
    }
    laras(o.dari, -1); laras(o.ke, 1);
    k.perubahan = (Array.isArray(k0.perubahan) ? k0.perubahan : []).concat([{ tahun: p.tahun, bulan: p.bulan, dun: !!o.dun, dari: o.dari, ke: o.ke, kerusi: o.kerusi || '', sebab: o.sebab || 'prk' }]).slice(-CONFIG.MAKS_LOG);
    return { ok: true, k: k };
  }
  /** Pindah dan simpan. */
  function geser(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(); if (!p) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var r = geserObjek(p, o); if (!r.ok) { return r; }
    var h = Sv.applyEffects({}, { kiraTindakan: false, patch: { kerusiNasional: r.k } });
    return h && h.ok ? { ok: true } : { ok: false, ralat: (h && h.ralat) || 'Gagal.' };
  }
  /** Blok lawan daripada nama parti lawan PRK (PAS / Bersatu = PN; DAP / PKR / Amanah = PH). */
  function blokLawan(nama, r, p) { var M = p && p.parti === 'PAS' ? CONFIG.LAWAN_PAS : p && p.parti === 'PKR' ? CONFIG.LAWAN_PKR : CONFIG.LAWAN; return M[nama] || ((r || rngLalai)() < 0.5 ? 'PH' : 'PN'); }
  /** Dipanggil oleh prk.js selepas keputusan PRK pemain. */
  function selepasPRKPemain(a, menang) {
    if (!a) { return null; }
    var dun = a.jenis === 'DUN', o = { dun: dun, kerusi: a.nama, sebab: 'prk_pemain' };
    var pS = S() && S().loadPlayer ? S().loadPlayer() : null;
    if (a.pertahan && !menang) { o.dari = 'PARTI'; o.ke = blokLawan(a.lawan, null, pS); }
    else if (!a.pertahan && menang) { o.dari = blokLawan(a.lawan, null, pS); o.ke = 'PARTI'; }
    else { return null; }
    return geser(o);
  }
  /** Dipanggil oleh letak.js apabila calon parti kalah PRK selepas pemain meletak jawatan. */
  function selepasPRKLetak(x, menang, r) {
    if (!x || menang) { return null; }
    return geser({ dun: x.jenis === 'DUN', dari: 'PARTI', ke: (r || rngLalai)() < 0.5 ? 'PH' : 'PN', kerusi: x.nama, sebab: 'prk_letak' });
  }

  /* ---------- Sejarah PRU ---------- */
  function arkibkan(p) {
    var k = p && p.kerusiNasional; if (!k || typeof k.parti !== 'number') { return null; }
    var sj = Array.isArray(p.kerusiSejarah) ? p.kerusiSejarah : [];
    if (sj.some(function (x) { return x.tahun === k.tahun && x.bulan === k.bulan; })) { return null; }
    var b = blok(p, false); if (!b) { return null; }
    var e = { tahun: k.tahun, bulan: k.bulan, jumlah: b.jumlah, ambang: b.ambang, PARTI: b.PARTI, RAKAN: b.RAKAN, LAIN: b.LAIN, PH: b.PH, PN: b.PN, kerajaan: (b.PARTI + b.RAKAN) >= b.ambang };
    var d = blok(p, true); if (d) { e.dun = { jumlah: d.jumlah, ambang: d.ambang, PARTI: d.PARTI, LAIN: d.LAIN, PH: d.PH, PN: d.PN, negeri: k.dun && k.dun.negeri }; }
    return sj.concat([e]).slice(-CONFIG.MAKS_SEJARAH);
  }
  /** Senarai PRU lepas (lama ke baharu): arkib penuh, ditambah PRU lama daripada pru.sejarahNasional (tanpa pecahan pembangkang). */
  function sejarah(p) {
    var arkib = Array.isArray(p && p.kerusiSejarah) ? p.kerusiSejarah.slice() : [];
    var Pr = PRU(), pr = Pr && Pr.getPRU ? Pr.getPRU(p) : null, lama = pr && Array.isArray(pr.sejarahNasional) ? pr.sejarahNasional : [];
    lama.forEach(function (n) {
      if (!n || typeof n.parti !== 'number' || arkib.some(function (x) { return x.tahun === n.tahun && x.bulan === n.bulan; })) { return; }
      var rk = Number(n.rakan) || 0, lawan = Math.max(0, CONFIG.JUMLAH - n.parti - rk);
      arkib.push({ tahun: n.tahun, bulan: n.bulan, jumlah: CONFIG.JUMLAH, ambang: CONFIG.MAJORITI, PARTI: n.parti, RAKAN: rk, LAWAN: lawan, kerajaan: (n.parti + rk) >= CONFIG.MAJORITI, ringkas: true });
    });
    return arkib.sort(function (a, b) { return (a.tahun * 12 + a.bulan) - (b.tahun * 12 + b.bulan); }).slice(-CONFIG.MAKS_SEJARAH);
  }

  /* ---------- PRK NPC ---------- */
  function bolehPRK(p, dun) {
    var Pr = PRU(), pr = Pr && Pr.getPRU ? Pr.getPRU(p) : null; if (pr && pr.aktif) { return false; }
    var L = LTK(); return !(L && L.adaPRK) || L.adaPRK(p, dun ? 'ADUN' : 'MP');
  }
  function pilihBerat(b, r) {
    var kod = ['PARTI', 'RAKAN', 'LAIN', 'PH', 'PN'].filter(function (x) { return b[x] > 0; }), jum = kod.reduce(function (a, x) { return a + b[x]; }, 0), t = r() * jum;
    for (var i = 0; i < kod.length; i++) { t -= b[kod[i]]; if (t < 0) { return kod[i]; } }
    return kod[kod.length - 1];
  }
  function namaKerusi(dun, r) { var n = dun ? 1 + Math.floor(r() * 45) : 1 + Math.floor(r() * 222); return (dun ? 'N.' : 'P.') + (n < 10 ? '00' : n < 100 ? '0' : '') + n; }
  function prosesBulan(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = []; o = o || {};
    if (!p || p.tamat || !p.kerusiNasional || typeof p.kerusiNasional.parti !== 'number') { return { peristiwa: ev }; }
    var r = o.rng || rngLalai, ark = arkibkan(p);
    if (ark) { Sv.applyEffects({}, { kiraTindakan: false, patch: { kerusiSejarah: ark } }); p = Sv.loadPlayer(); }
    if (r() >= CONFIG.PELUANG) { return { peristiwa: ev }; }
    var dun = !!(p.kerusiNasional.dun && !SW(p.parti) && r() < CONFIG.DUN);
    if (!bolehPRK(p, dun)) { return { peristiwa: ev }; }
    var b = blok(p, dun); if (!b) { return { peristiwa: ev }; }
    var dari = pilihBerat(b, r), kerusi = namaKerusi(dun, r), ke = dari;
    if (r() >= CONFIG.KEKAL) {
      var pK = clamp(0.5 + ((Number(p.reputasi) || 50) - 50) / 100, 0.25, 0.75);
      ke = r() < pK ? (dun || r() < 0.6 || !b.RAKAN ? 'PARTI' : 'RAKAN') : (r() < 0.5 ? 'PH' : 'PN');
      if (ke === dari) { ke = dari === 'PH' ? 'PN' : dari === 'PN' ? 'PH' : 'PH'; }
      var kj0 = (b.PARTI + b.RAKAN) >= b.ambang, d1 = (ke === 'PARTI' || ke === 'RAKAN' ? 1 : 0) - (dari === 'PARTI' || dari === 'RAKAN' ? 1 : 0);
      if (((b.PARTI + b.RAKAN + d1) >= b.ambang) !== kj0) { ke = dari; }      // PRK NPC tidak menukar kerajaan
    }
    var dw = dun ? 'DUN' : 'Parlimen';
    if (ke === dari) { ev.push({ jenis: 'prk_npc', mesej: 'PRK ' + dw + ' ' + kerusi + ' (kekosongan kerusi): ' + label(p, dari) + ' mengekalkan kerusi.' }); return { peristiwa: ev }; }
    var g = geser({ dun: dun, dari: dari, ke: ke, kerusi: kerusi, sebab: 'prk_npc' });
    if (g.ok) { ev.push({ jenis: 'prk_npc', mesej: 'PRK ' + dw + ' ' + kerusi + ' (kekosongan kerusi): ' + label(p, ke) + ' merampas kerusi daripada ' + label(p, dari) + '.' }); }
    return { peristiwa: ev };
  }
  /** Label blok untuk mesej. */
  function label(p, kod) {
    if (kod === 'PARTI') { return (p && p.parti) || 'BN'; }
    if (kod === 'RAKAN') { return 'Rakan gabungan'; }
    if (kod === 'LAIN') { return 'Calon bebas'; }
    if (kod === 'PN' && p && p.parti === 'PAS') { return 'BN'; }
    if (kod === 'PH' && p && p.parti === 'PKR') { return 'BN'; }
    return kod;
  }
  /** Perubahan terkini (dalam `bulan` bulan): senarai log. */
  function terkini(p, bulan) {
    var k = p && p.kerusiNasional, l = k && Array.isArray(k.perubahan) ? k.perubahan : [], kini = idx(p);
    return l.filter(function (x) { return kini - ((x.tahun || 0) * 12 + (x.bulan || 1)) <= (bulan == null ? 3 : bulan); });
  }
  return { CONFIG: CONFIG, setRng: function (f) { rngLalai = f || Math.random; }, blok: blok, geser: geser, geserObjek: geserObjek, blokLawan: blokLawan,
    selepasPRKPemain: selepasPRKPemain, selepasPRKLetak: selepasPRKLetak, arkibkan: arkibkan, sejarah: sejarah, prosesBulan: prosesBulan, label: label, terkini: terkini };
});
