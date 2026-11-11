/* ==========================================================================
   Nusa Politik — js/kementerian.js   (v13.77)
   Enjin kementerian generik (dipacu takrif) untuk modul Pendidikan (kpm.js), Kesihatan (kkm.js) dan Ekonomi (ke.js).
   Setiap takrif memberi: meter (awal, julat, sasaran asas, kadar alir), dana (RM juta), tindakan bulanan (satu sebulan,
   boleh bertangguh), dasar (satu perubahan sebulan; mengubah sasaran meter, kejutan sekali, dana bulanan), isu rawak
   (pilihan dengan kos/peluang/kesan) dan akibat bulanan (KPI/populariti bila meter melepasi ambang).
   State p[kunci] = { meter..., dana, bonus {meter}, dasar {kod: id}, projek [ {id, siapIdx} ], isu { id, bulan } | null,
                      tindakanBulan, dasarBulan, lalu }
   Kesan khas: ip, pop, rating, reputasi, akar (kesetiaan.akarUmbi), rizab (MOF, RM bilion).
   ANDAIAN: semua nilai dalam takrif ialah anggaran permainan.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikKementerian = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  var DAFTAR = [];

  function cipta(def) {
    var rngLalai = Math.random;
    function rng(o) { return (o && o.rng) || rngLalai; }
    function bulat(k, v) { var d = def.meter[k].desimal || 0, f = Math.pow(10, d); return Math.round(v * f) / f; }
    function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
    function bt(i) { return (((i - 1) % 12) + 1) + '/' + Math.floor((i - 1) / 12); }
    function dasarAwal() {
      var m = { dana: def.dana.awal, bonus: {}, dasar: {}, projek: [], isu: null, tindakanBulan: 0, dasarBulan: 0, lalu: null }, k;
      for (k in def.meter) { m[k] = def.meter[k].awal; m.bonus[k] = 0; }
      for (k in def.dasar) { m.dasar[k] = def.dasar[k].lalai; }
      return m;
    }
    function get(p) {
      var b = dasarAwal(), m = p && p[def.kunci] && typeof p[def.kunci] === 'object' ? p[def.kunci] : {}, f;
      for (f in b) { if (m[f] === undefined) { m[f] = b[f]; } }
      for (f in def.meter) { if (m.bonus[f] === undefined) { m.bonus[f] = 0; } }
      for (f in def.dasar) { if (m.dasar[f] === undefined) { m.dasar[f] = def.dasar[f].lalai; } }
      if (def.mula && !m.mula) { def.mula(m, p || {}); m.mula = 1; }                  // v13.84: nilai awal ikut keadaan pemain
      return m;
    }
    function aktif(p) {
      var K = KB(); if (!p || !K) { return false; }
      var k = K.getKabinet(p);
      if (def.aktif) { return !!def.aktif(p, k); }                                     // v13.81: syarat khas (cth. Ketua Menteri Sabah)
      return !!(k.hasGovernmentRole && k.roleLevel === 'MENTERI_PENUH' && def.portfolio.test(String(k.portfolioName || '')));
    }
    function pilihanDasar(kod, id) { var t = def.dasar[kod]; for (var i = 0; i < t.pilihan.length; i++) { if (t.pilihan[i].id === id) { return t.pilihan[i]; } } return t.pilihan[0]; }
    /** Gunakan kesan: meter (dan separuh kekal ke bonus jika kekal), kesan khas dikumpul ke kes/patch/d. */
    function guna(p, m, x, ctx, kekal) {
      Object.keys(x || {}).forEach(function (k) {
        var v = x[k];
        if (def.meter[k]) { var M = def.meter[k]; m[k] = clamp(bulat(k, m[k] + v), M.min, M.maks); if (kekal && !def.tanpaBonus) { m.bonus[k] = bulat(k, m.bonus[k] + v * 0.5); } }
        else if (k === 'ip' || k === 'reputasi') { ctx.kes[k] = (ctx.kes[k] || 0) + v; }
        else if (k === 'akar') { ctx.kes.kesetiaan = { akarUmbi: ((ctx.kes.kesetiaan && ctx.kes.kesetiaan.akarUmbi) || 0) + v }; }
        else if (k === 'pop' || k === 'rating') { ctx.d[k] = (ctx.d[k] || 0) + v; }
        else if (k === 'dana') { m.dana = clamp(m.dana + v, 0, def.dana.had); }          // v13.84: tindakan menambah dana
        else if (k === 'rizab' && p.mof && typeof p.mof === 'object') { var mf = ctx.patch.mof || p.mof; mf.nationalTreasury = Math.round(((Number(mf.nationalTreasury) || 0) - v) * 10) / 10; ctx.patch.mof = mf; }
      });
    }
    function ctxBaru() { return { kes: {}, patch: {}, d: { pop: 0, rating: 0 }, selepas: [] }; }
    function simpan(p, m, ctx, log) {
      var pt = ctx.patch; pt[def.kunci] = m;
      var r = S().applyEffects(ctx.kes, { kiraTindakan: false, patch: pt, log: log });
      if (r && r.ok) { var K = KB(); if (K && K.laras && (ctx.d.pop || ctx.d.rating || ctx.d.rombak)) { K.laras({ pop: ctx.d.pop || 0, rating: ctx.d.rating || 0, rombak: ctx.d.rombak || 0 }); } }
      return r;
    }
    function ralatAm(p) { return aktif(p) ? '' : def.ralat; }
    function cariTindakan(id) { return def.tindakan.filter(function (t) { return t.id === id; })[0] || null; }

    /** v13.81: sebab tindakan tidak boleh (had sebulan ikut kumpulan, selang, AP, dana, projek berjalan). */
    function sebabTindakan(p, m, t, ini) {
      var g = t.kumpulan, kump = m.kump || {}, sl = m.selangIdx || {};
      if (g ? kump[g] === ini : m.tindakanBulan === ini) { return g ? 'Satu tindakan ' + def.kumpulan[g] + ' sebulan.' : 'Satu tindakan utama sebulan.'; }
      if (t.selang && ini - (sl[t.id] == null ? -999 : sl[t.id]) < t.selang) { return 'Tindakan ini hanya sekali setiap ' + t.selang + ' bulan.'; }
      if (t.ap && (Number(p.ap) || 0) < t.ap) { return 'AP tidak mencukupi.'; }
      if (m.dana < t.kos) { return 'Dana tidak cukup.'; }
      if (t.siap && m.projek.some(function (x) { return x.id === t.id; })) { return 'Projek ini sedang berjalan.'; }
      if (def.sebabTambahan) { return def.sebabTambahan(t, m, p) || ''; }               // v13.82: syarat khas takrif
      return '';
    }
    function laksana(id, o) {
      var p = S().loadPlayer(), m = get(p), e = ralatAm(p), t = cariTindakan(id), ini = idx(p), ctx = ctxBaru();
      if (e) { return { ok: false, ralat: e }; }
      if (!t) { return { ok: false, ralat: 'Tindakan tidak sah.' }; }
      var sb = sebabTindakan(p, m, t, ini); if (sb) { return { ok: false, ralat: sb }; }
      m.dana -= t.kos;
      if (t.kumpulan) { m.kump = m.kump || {}; m.kump[t.kumpulan] = ini; } else { m.tindakanBulan = ini; }
      if (t.selang) { m.selangIdx = m.selangIdx || {}; m.selangIdx[t.id] = ini; }
      if (t.ap) { ctx.kes.ap = -t.ap; }
      var pl = def.ubahPeluang ? def.ubahPeluang(t, m, p) : t.peluang;              // v13.84: peluang ikut keadaan
      var jaya = pl == null ? null : rng(o)() < pl, kesan = def.ubahKesan ? def.ubahKesan(t, m, p) : t.kesan;
      if (t.siap) { m.projek.push({ id: id, siapIdx: ini + t.siap }); } else { guna(p, m, jaya === false ? (t.gagal || {}) : kesan, ctx, true); }
      var r = simpan(p, m, ctx, { tindakan: def.kunci + '_tindakan', nama: t.nama, peringkat: 'ahli' });
      if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
      if (jaya === false) { return { ok: true, jaya: false, mesej: t.mesejGagal || ('Tidak berjaya: ' + t.nama + '.') }; }
      return { ok: true, jaya: jaya, mesej: t.siap ? 'Diluluskan: ' + t.nama + '. Siap bulan ' + bt(ini + t.siap) + '.' : (t.mesej || 'Dilaksanakan: ' + t.nama + '.') };
    }
    function ubahDasar(kod, id) {
      var p = S().loadPlayer(), m = get(p), e = ralatAm(p), T = def.dasar[kod], ctx = ctxBaru();
      if (e) { return { ok: false, ralat: e }; }
      if (!T || !T.pilihan.some(function (x) { return x.id === id; })) { return { ok: false, ralat: 'Dasar tidak sah.' }; }
      if (m.dasar[kod] === id) { return { ok: false, ralat: 'Dasar itu sedang berkuat kuasa.' }; }
      if (m.dasarBulan === idx(p)) { return { ok: false, ralat: 'Satu perubahan dasar sebulan.' }; }
      if (def.sahDasar) { var sd = def.sahDasar(kod, id, m, p); if (sd) { return { ok: false, ralat: sd }; } }   // v13.82
      var c = pilihanDasar(kod, id); m.dasar[kod] = id; m.dasarBulan = idx(p); guna(p, m, c.kejut, ctx, false);
      var r = simpan(p, m, ctx, { tindakan: def.kunci + '_dasar', nama: T.nama + ': ' + c.label, peringkat: 'ahli' });
      return r && r.ok ? { ok: true, mesej: T.nama + ' ditukar kepada ' + c.label + '.' } : { ok: false, ralat: r && r.ralat };
    }
    function peluang(m, c) { return typeof c.peluang === 'string' ? clamp(m[c.peluang] / 100, 0.15, 0.9) : (c.peluang == null ? 1 : c.peluang); }
    function jawabIsu(id, o) {
      var p = S().loadPlayer(), m = get(p), e = ralatAm(p), ctx = ctxBaru();
      if (e) { return { ok: false, ralat: e }; }
      if (!m.isu) { return { ok: false, ralat: 'Tiada isu semasa.' }; }
      var I = def.isu[m.isu.id], c = I.pilihan.filter(function (x) { return x.id === id; })[0];
      if (!c) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
      if (m.isuBulan === idx(p)) { return { ok: false, ralat: 'Satu keputusan isu sebulan.' }; }
      if (m.dana < (c.kos || 0)) { return { ok: false, ralat: 'Dana tidak cukup.' }; }
      m.dana -= c.kos || 0; m.isuBulan = idx(p);
      var jaya = rng(o)() < peluang(m, c);
      guna(p, m, jaya ? c.kesan : (c.gagal || {}), ctx, false);
      if (jaya || !c.kekalJikaGagal) { m.isu = null; }
      var r = simpan(p, m, ctx, { tindakan: def.kunci + '_isu', nama: c.label, peringkat: 'ahli' });
      if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
      return { ok: true, jaya: c.peluang == null ? null : jaya, mesej: (jaya ? c.mesej : (c.mesejGagal || c.mesej)) || ('Keputusan dibuat: ' + c.label + '.') };
    }

    function prosesBulan(o) {
      var p = S() && S().loadPlayer(), ev = [];
      if (!p || p.tamat || (!p[def.kunci] && !aktif(p))) { return { peristiwa: ev }; }
      var m = get(p), r = rng(o), on = aktif(p), ini = idx(p), ctx = ctxBaru(), k, kod;
      m.lalu = {}; for (k in def.meter) { m.lalu[k] = m[k]; }
      var tambah = def.dana.bulan + (m.danaTambah || 0); for (kod in def.dasar) { tambah += pilihanDasar(kod, m.dasar[kod]).dana || 0; }
      if (def.ubahDana) { tambah = def.ubahDana(tambah, m, p); }
      m.dana = Math.min(def.dana.had, m.dana + tambah);
      m.projek = m.projek.filter(function (x) {
        if (x.siapIdx > ini) { return true; }
        var t = cariTindakan(x.id); if (t) { guna(p, m, t.kesan, ctx, true); if (on) { ev.push({ jenis: 'kabinet', mesej: 'Projek siap: ' + t.nama + '.' }); } }
        return false;
      });
      for (k in def.meter) {
        var M = def.meter[k], sas = M.asas + m.bonus[k];
        for (kod in def.dasar) { var sp = pilihanDasar(kod, m.dasar[kod]).sas; if (sp && sp[k]) { sas += sp[k]; } }
        if (def.sasaran) { sas += def.sasaran(k, m, p) || 0; }
        m[k] = clamp(bulat(k, m[k] + (clamp(sas, M.min, M.maks) - m[k]) * (M.alir == null ? 0.2 : M.alir)), M.min, M.maks);
        if (M.desimal === 0 || !M.desimal) { m[k] = Math.round(m[k]); }
      }
      if (m.isu) {
        var I = def.isu[m.isu.id]; m.isu.bulan += 1; guna(p, m, I.abai, ctx, false);
        if (I.tamat && m.isu.bulan >= I.tamat) { if (on) { ev.push({ jenis: 'kabinet', mesej: 'Isu berlalu: ' + I.nama + '.' }); } m.isu = null; }
        else if (on) { ev.push({ jenis: 'kabinet', mesej: 'Isu belum diselesaikan: ' + I.nama + '.' }); }
      } else if (on && r() < (typeof def.isuPeluang === 'function' ? def.isuPeluang(m, p) : def.isuPeluang)) {
        var ks = Object.keys(def.isu), id = ks[Math.floor(r() * ks.length)]; m.isu = { id: id, bulan: 0 };
        ev.push({ jenis: 'kabinet', mesej: 'Isu baharu: ' + def.isu[id].nama + '. Buat keputusan di ' + def.pejabat + '.' });
      }
      if (on) {
        (def.akibat || []).forEach(function (a) {
          var v = m[a.meter], kena = a.bawah != null ? v < a.bawah : v > a.atas;
          if (kena) { guna(p, m, a.kesan, ctx, false); if (a.mesej) { ev.push({ jenis: 'kabinet', mesej: a.mesej }); } }
        });
        if (def.bulanan) { def.bulanan(m, p, ctx, ev); }
      }
      simpan(p, m, ctx);
      ctx.selepas.forEach(function (fn) { var x = fn(); if (x && x.mesej) { ev.push(x); } });   // v13.81: cth. hilang jawatan
      return { peristiwa: ev };
    }

    function ringkasan(p) {
      var m = get(p), ini = idx(p), l = m.lalu || {};
      var meter = Object.keys(def.meter).map(function (k) { var M = def.meter[k]; return { kod: k, nama: M.nama, nilai: m[k], unit: M.unit || '', isi: M.isi ? M.isi(m[k]) : m[k], arah: l[k] == null ? 0 : bulat(k, m[k] - l[k]), bahaya: !!(M.bahaya && M.bahaya(m[k])), nota: M.nota || '' }; });
      var tambah = def.dana.bulan + (m.danaTambah || 0); for (var kod in def.dasar) { tambah += pilihanDasar(kod, m.dasar[kod]).dana || 0; }
      if (def.ubahDana) { tambah = def.ubahDana(tambah, m, p); }
      var I = m.isu ? def.isu[m.isu.id] : null;
      return { aktif: aktif(p), meter: meter, dana: m.dana, danaBulan: tambah, danaHad: def.dana.had, tindakanSudah: m.tindakanBulan === ini, dasarBoleh: m.dasarBulan !== ini,
        tindakan: def.tindakan.map(function (t) { var sebab = sebabTindakan(p, m, t, ini), kes = def.ubahKesan ? def.ubahKesan(t, m, p) : t.kesan;
          return { id: t.id, ikon: t.ikon, nama: t.nama, kos: t.kos, siap: t.siap || 0, kesan: kes, ap: t.ap || 0, selang: t.selang || 0, peluang: (function (pl) { return pl == null ? null : Math.round(pl * 100); })(def.ubahPeluang ? def.ubahPeluang(t, m, p) : t.peluang), gagal: t.gagal || null, kumpulan: t.kumpulan || '', boleh: !sebab, sebab: sebab }; }),
        kumpulan: Object.keys(def.kumpulan || {}).map(function (g) { return { kod: g, nama: def.kumpulan[g], sudah: !!(m.kump && m.kump[g] === ini) }; }),
        projek: m.projek.map(function (x) { var t = cariTindakan(x.id); return { nama: t ? t.nama : x.id, siap: bt(x.siapIdx) }; }),
        dasar: Object.keys(def.dasar).map(function (kod) { var T = def.dasar[kod]; return { kod: kod, nama: T.nama, ikon: T.ikon, nota: T.nota || '', semasa: m.dasar[kod], pilihan: T.pilihan.map(function (c) { return { id: c.id, label: c.label, tutup: !!(def.sahDasar && def.sahDasar(kod, c.id, m, p)) }; }) }; }),
        isu: I ? { nama: I.nama, ikon: I.ikon, abai: I.abai, bulan: m.isu.bulan, sudah: m.isuBulan === ini, pilihan: I.pilihan.map(function (c) { return { id: c.id, ikon: c.ikon, label: c.label, kos: c.kos || 0, peluang: c.peluang == null ? null : Math.round(peluang(m, c) * 100), kesan: c.kesan, gagal: c.gagal || null, boleh: m.dana >= (c.kos || 0) && m.isuBulan !== ini }; }) } : null };
    }

    var api = { def: def, setRng: function (f) { rngLalai = f || Math.random; }, get: get, aktif: aktif, laksana: laksana, ubahDasar: ubahDasar, jawabIsu: jawabIsu, prosesBulan: prosesBulan, ringkasan: ringkasan };
    DAFTAR.push(api);
    return api;
  }

  return { cipta: cipta, senarai: function () { return DAFTAR.slice(); } };
});
