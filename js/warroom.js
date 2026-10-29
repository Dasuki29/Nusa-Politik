/* ==========================================================================
   Nusa Politik — js/warroom.js   (v12.8)
   Bilik Gerakan (War Room) & Pengagihan Jentera Lapangan semasa kempen PRU/PRN.
   Keadaan disimpan dalam kempen aktif: pru.aktif.warRoom = { zon:[...], burnout, hantarHari, log, perluNama }.
   partyMachineryPoints = a.jentera (Tenaga jentera sedia ada, 0-100); campaignBudget = a.campaignFunds (Dana kempen).
   Setiap zon: { nama, berat, kehadiran (machineryPresence: 0-100, 50 = seimbang dengan lawan), hotspot (1-3), ofset }.
   localSupport zon = a.voterSupport + ofset. Kesan harian zon dijumlah (ikut berat) dan ditambah kepada a.voterSupport,
   jadi War Room memang mengubah keputusan pilihan raya.
   SEMUA ANGKA DI BAWAH IALAH ANDAIAN PERMAINAN.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikWarRoom = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  var CONFIG = {
    ZON: 5,                                   // bilangan zon (DM terbesar bagi DUN; DUN bagi Parlimen)
    HOTSPOT_TINGGI: [1, 2],                   // bilangan zon tentangan tinggi
    HANTAR: { jentera: 12, dana: 1200, kehadiran: 20 },
    HANTAR_SEHARI: 2,
    PENGARUH: 0.05,                           // sokongan zon sehari = (kehadiran - paras asal zon) x 0.05
    PULANG: 0.1,                              // kehadiran kembali 10% sehari ke arah paras asal zon apabila jentera ditarik balik
    ASAS: { 1: 50, 2: 45, 3: 38 },            // paras asal kehadiran ikut tahap tentangan (lawan lebih kuat di zon Tinggi)
    TANGKIS: 60,                              // kehadiran >= 60 menangkis serangan
    RUGI_SERANG: 0.1,                          // sokongan zon hilang sehari = hotspot x 0.3 jika tidak ditangkis
    BURNOUT: { KOSONG: 20, RENDAH_JENTERA: 20, RENDAH_SEHARI: 6, PULIH_JENTERA: 50, PULIH_SEHARI: 4, REHAT: 15, KESAN_MAKS: 0.5 }
  };
  var HOTSPOT = { 1: 'Rendah', 2: 'Sederhana', 3: 'Tinggi' };
  var GENERIK = {
    URBAN: ['Pusat Bandar', 'Taman Perumahan', 'Kawasan Perindustrian', 'Pinggir Bandar', 'Kampung Bandar'],
    RURAL: ['Pekan Kecil', 'Kampung Tradisional', 'Tanah Rancangan', 'Kawasan Ladang', 'Kampung Pedalaman'],
    MIXED: ['Pekan Utama', 'Taman Perumahan', 'Kampung Tradisional', 'Tanah Rancangan', 'Pinggir Pekan']
  };

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function r1(n) { return Math.round(n * 10) / 10; }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rngDari(benih) { var a = benih | 0; return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /** Mulakan Bilik Gerakan apabila kempen bermula. Zon bernama generik dahulu; nama sebenar (DM / DUN) diisi oleh namakan(). */
  function mula(a, p) {
    if (!a) { return null; }
    var rng = rngDari(hash(((p && p.id) || '') + '|' + ((a.kerusi && a.kerusi.nama) || '') + '|' + (a.candidateType || ''))), n = CONFIG.ZON;
    var nama = GENERIK[a.constituencyType] || GENERIK.MIXED, tinggi = CONFIG.HOTSPOT_TINGGI[0] + Math.floor(rng() * (CONFIG.HOTSPOT_TINGGI[1] - CONFIG.HOTSPOT_TINGGI[0] + 1));
    var zon = [];
    for (var i = 0; i < n; i++) {
      zon.push({ nama: 'Zon ' + nama[i % nama.length], berat: 1 / n, hotspot: 1 + Math.floor(rng() * 2), ofset: 0, kehadiran: 0 });
    }
    for (var t = 0; t < tinggi; t++) { zon[Math.floor(rng() * n)].hotspot = 3; }
    zon.forEach(function (z) { z.kehadiran = CONFIG.ASAS[z.hotspot] + Math.round(rng() * 4 - 2); });
    zon.forEach(function (z) { z.ofset = z.hotspot === 3 ? -5 : z.hotspot === 1 ? 3 : 0; });
    seimbangOfset(zon);
    a.warRoom = { zon: zon, burnout: 0, hantarHari: { hari: a.hari || 0, n: 0 }, log: [], perluNama: true };
    return a.warRoom;
  }
  function pastikan(a) { if (!a.warRoom) { mula(a); } return a.warRoom; }
  /** Purata berwajaran ofset = 0, supaya a.voterSupport kekal purata kawasan. */
  function seimbangOfset(zon) { var m = zon.reduce(function (s, z) { return s + z.berat * z.ofset; }, 0); zon.forEach(function (z) { z.ofset = r1(z.ofset - m); }); }

  /** Isi nama sebenar zon: [{ nama, berat }]. Hanya bila belum ada penghantaran jentera (supaya zon tidak bertukar di tengah kempen). */
  function namakan(a, senarai) {
    var w = pastikan(a); if (!w.perluNama) { return false; }
    w.perluNama = false;
    if (!Array.isArray(senarai) || senarai.length < 2) { return true; }
    var ls = senarai.slice(0, CONFIG.ZON), jum = ls.reduce(function (s, x) { return s + (Number(x.berat) || 1); }, 0);
    if (ls.length !== w.zon.length) {
      var lama = w.zon; w.zon = ls.map(function (x, i) { var z = lama[i % lama.length]; return { nama: x.nama, berat: 0, hotspot: z.hotspot, ofset: z.ofset, kehadiran: z.kehadiran }; });
    }
    ls.forEach(function (x, i) { w.zon[i].nama = x.nama; w.zon[i].berat = (Number(x.berat) || 1) / jum; });
    seimbangOfset(w.zon);
    return true;
  }

  function kosHantar(a) { return { jentera: CONFIG.HANTAR.jentera, dana: CONFIG.HANTAR.dana }; }
  /** Boleh hantar jentera ke zon i? */
  function statusHantar(a, i) {
    var w = pastikan(a), z = w.zon[i];
    if (!a || a.fasa !== 'kempen' || a.campaignDaysLeft <= 0) { return { boleh: false, sebab: 'Kempen telah tamat.' }; }
    if (a.kejutanAktif) { return { boleh: false, sebab: 'Selesaikan kejutan kempen dahulu.' }; }
    if (!z) { return { boleh: false, sebab: 'Zon tidak sah.' }; }
    if (w.hantarHari.hari === a.hari && w.hantarHari.n >= CONFIG.HANTAR_SEHARI) { return { boleh: false, sebab: 'Had ' + CONFIG.HANTAR_SEHARI + ' penghantaran sehari.' }; }
    if ((Number(a.campaignFunds) || 0) < CONFIG.HANTAR.dana) { return { boleh: false, sebab: 'Dana kempen tidak cukup.' }; }
    if (z.kehadiran >= 95) { return { boleh: false, sebab: 'Jentera sudah menguasai zon ini.' }; }
    return { boleh: true, sebab: '' };
  }
  /** Hantar jentera ke zon i. Jika tenaga jentera tidak cukup, jentera habis (0) dan keletihan kempen naik. */
  function hantar(a, i) {
    var st = statusHantar(a, i); if (!st.boleh) { return { ok: false, ralat: st.sebab }; }
    var w = a.warRoom, z = w.zon[i], k = CONFIG.HANTAR, habis = (Number(a.jentera) || 0) < k.jentera;
    if (w.hantarHari.hari !== a.hari) { w.hantarHari = { hari: a.hari, n: 0 }; }
    w.hantarHari.n += 1;
    a.campaignFunds -= k.dana; a.jentera = clamp((Number(a.jentera) || 0) - k.jentera, 0, 100);
    var tambah = Math.round(k.kehadiran * faktor(a));
    z.kehadiran = clamp(z.kehadiran + tambah, 0, 95);
    if (habis) { w.burnout = clamp(w.burnout + CONFIG.BURNOUT.KOSONG, 0, 100); }
    var mesej = 'Jentera dihantar ke ' + z.nama + ': kehadiran +' + tambah + ' (kini ' + z.kehadiran + ').' + (habis ? ' Tenaga jentera habis: keletihan kempen +' + CONFIG.BURNOUT.KOSONG + '.' : '');
    catat(w, a.hari, mesej);
    return { ok: true, mesej: mesej, habis: habis };
  }
  function catat(w, hari, teks) { w.log.unshift({ hari: hari, teks: teks }); w.log = w.log.slice(0, 12); }

  /** Pengganda keberkesanan kempen akibat keletihan (1 = penuh, 0.5 = separuh). */
  function faktor(a) { var b = a && a.warRoom ? Number(a.warRoom.burnout) || 0 : 0; return Math.round((1 - clamp(b, 0, 100) / 100 * CONFIG.BURNOUT.KESAN_MAKS) * 100) / 100; }

  /** Selepas tindakan kempen biasa: Rehat menurunkan keletihan. */
  function selepasTindakan(a, id) {
    var w = pastikan(a);
    if (id === 'rehat') { w.burnout = clamp(w.burnout - CONFIG.BURNOUT.REHAT, 0, 100); }
  }

  /** Setiap hari: pengaruh jentera pada sokongan zon, serangan lawan (Machinery Clash), susut kehadiran, keletihan. Mengubah a.voterSupport. */
  function selepasHari(a, rng) {
    var w = pastikan(a), f = faktor(a), B = CONFIG.BURNOUT, D = 0, tangkis = [], kalah = [];
    rng = rng || Math.random;
    w.zon.forEach(function (z) {
      var d = (z.kehadiran - CONFIG.ASAS[z.hotspot]) * CONFIG.PENGARUH * f;
      if (z.hotspot >= 2) {
        if (z.kehadiran >= CONFIG.TANGKIS) { tangkis.push(z.nama); } else { d -= z.hotspot * CONFIG.RUGI_SERANG; kalah.push(z.nama); }
      }
      z.kehadiran = clamp(Math.round(z.kehadiran + (CONFIG.ASAS[z.hotspot] - z.kehadiran) * CONFIG.PULANG), 20, 95);
      z.d = d; D += z.berat * d;
    });
    w.zon.forEach(function (z) { z.ofset = r1(z.ofset + z.d - D); delete z.d; });
    a.voterSupport = clamp(Math.round(((Number(a.voterSupport) || 0) + D) * 10) / 10, 0, 100);
    if ((Number(a.jentera) || 0) < B.RENDAH_JENTERA) { w.burnout = clamp(w.burnout + B.RENDAH_SEHARI, 0, 100); }
    else if ((Number(a.jentera) || 0) >= B.PULIH_JENTERA) { w.burnout = clamp(w.burnout - B.PULIH_SEHARI, 0, 100); }
    if (tangkis.length) { catat(w, a.hari, 'Serangan lawan ditangkis di ' + tangkis.join(', ') + '.'); }
    if (kalah.length) { catat(w, a.hari, 'Lawan mara di ' + kalah.join(', ') + ' (jentera kita lemah).'); }
    return r1(D);
  }

  function statusZon(z) { return z.kehadiran >= 60 ? 'Dikuasai kita' : z.kehadiran >= 45 ? 'Seimbang' : 'Dikuasai lawan'; }
  /** Keadaan penuh untuk paparan. */
  function kira(a) {
    if (!a || a.fasa !== 'kempen') { return null; }
    var w = pastikan(a), vs = Number(a.voterSupport) || 0;
    return {
      partyMachineryPoints: Math.round(Number(a.jentera) || 0), campaignBudget: Math.round(Number(a.campaignFunds) || 0),
      burnout: Math.round(w.burnout), faktor: faktor(a), kos: kosHantar(a), perluNama: !!w.perluNama,
      hantarBaki: CONFIG.HANTAR_SEHARI - (w.hantarHari.hari === a.hari ? w.hantarHari.n : 0),
      zon: w.zon.map(function (z, i) {
        var st = statusHantar(a, i);
        return { i: i, zoneName: z.nama, berat: Math.round(z.berat * 100), machineryPresence: z.kehadiran, hotspotLevel: z.hotspot, hotspotNama: HOTSPOT[z.hotspot],
          localSupport: r1(clamp(vs + z.ofset, 0, 100)), status: statusZon(z), boleh: st.boleh, sebab: st.sebab };
      }),
      log: w.log.slice(0, 4)
    };
  }

  /* ---------- Nama zon sebenar (pelayar sahaja, tak segerak) ---------- */
  function nz(x) { return String(x || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  /** Pulang Promise<[{nama, berat}]> daripada data peta (UMNO: DM / DUN sebenar) atau data parti Sarawak. Gagal = []. */
  function cariNama(p, a) {
    var G = root.MyPolitikGeo, SWp = p && /^(PBB|PRS|SUPP|PDP|PSB)$/.test(p.parti), nama = a && a.kerusi ? a.kerusi.nama : '';
    try {
      if (SWp) { return cariNamaSW(p, a); }
      if (!G || !G.muat) { return Promise.resolve([]); }
      return G.muat(['parlimen', 'dun']).then(function () {
        if (a.candidateType === 'PARLIMEN') {
          var pl = G.getFitur('parlimen').filter(function (f) { return nz(f.nama) === nz(nama); })[0]; if (!pl) { return []; }
          var duns = G.getFitur('dun').filter(function (f) { return f.parlimen === pl.id; });
          if (duns.length >= 2) { return duns.map(function (f) { return { nama: f.nama, berat: 1 }; }); }
          return G.muatDM(pl.negeri).then(function () { return dmTerbesar(G, function (f) { return f.parlimen === pl.id; }); });
        }
        var dn = G.getFitur('dun').filter(function (f) { return nz(f.nama) === nz(nama); })[0]; if (!dn) { return []; }
        return G.muatDM(dn.negeri).then(function () { return dmTerbesar(G, function (f) { return f.dun === dn.id; }); });
      }).catch(function () { return []; });
    } catch (e) { return Promise.resolve([]); }
  }
  function dmTerbesar(G, tapis) {
    return G.getFitur('dm').filter(tapis).map(function (f) { var d = G.getDemografi ? G.getDemografi('dm', f.id) : null; return { nama: f.nama, berat: d && d.JUMLAH_PEMILIH ? d.JUMLAH_PEMILIH : 1 }; })
      .sort(function (x, y) { return y.berat - x.berat; }).slice(0, CONFIG.ZON);
  }
  function cariNamaSW(p, a) {
    var P = root.MyPolitikParti, D = root.MyPolitikData, nama = a.kerusi ? a.kerusi.nama : '';
    if (a.candidateType === 'PARLIMEN') {
      return fetch('data/pbb-dun.json').then(function (r) { return r.json(); }).then(function (j) {
        return Object.keys(j).map(function (k) { return j[k]; }).filter(function (d) { return nz(d.parlimen) === nz(nama) || (d.pl && nz(d.pl.nama) === nz(nama)); })
          .map(function (d) { return { nama: d.nama, berat: d.pemilih || 1 }; });
      }).catch(function () { return []; });
    }
    if (!P || !P.info || !D || typeof fetch !== 'function') { return Promise.resolve([]); }
    return fetch(P.info(p.parti).data).then(function (r) { return r.text(); }).then(function (t) {
      var h = D.rowsToHierarchy(D.teksKeBaris(t)), dun = null;
      h.bahagian.forEach(function (b) { (b.dun || []).forEach(function (d) { if (nz(d.nama) === nz(nama)) { dun = d; } }); });
      if (!dun) { return []; }
      return (dun.cawangan || []).map(function (c) { return { nama: c.nama, berat: Number(c.jumlah) || 1 }; }).sort(function (x, y) { return y.berat - x.berat; }).slice(0, CONFIG.ZON);
    }).catch(function () { return []; });
  }

  return { CONFIG: CONFIG, HOTSPOT: HOTSPOT, mula: mula, namakan: namakan, statusHantar: statusHantar, hantar: hantar, faktor: faktor,
    selepasTindakan: selepasTindakan, selepasHari: selepasHari, kira: kira, cariNama: cariNama };
});
