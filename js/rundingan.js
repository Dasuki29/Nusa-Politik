/* ==========================================================================
   Nusa Politik — js/rundingan.js   (v13.33)
   Rundingan Gabungan selepas Parlimen tergantung (mockup "Pilih Rakan Gabungan", Fasa 3, dipersetujui; maklum balas pemain):
     - Pemain Presiden: jika gabungan sendiri kurang 112 kerusi, pilih rakan (PH, PN atau BN, GPS, GRS, Bebas) sehingga 112.
       Setiap rakan bersetuju ikut Kesediaan; jika baki yang bersetuju masih >= 112, kerajaan dibentuk.
     - Pemain bukan Presiden: NPC Presiden parti memilih rakan paling bersedia secara automatik (js/paparan.js anggarKerusi).
     - PAS: perlu Restu Majlis Syura >= 50 untuk sebarang rakan baharu dan >= 70 untuk PH (Fasal 39(9)(k)).
     - Lawan tradisi (BN-PH, BN-PN, PAS-PH): sokongan akar umbi berkurang apabila menyertai kerajaan bersama.
   Kerusi rakan diambil daripada anggaran PRU (kad kerusi): PH dan blok lawan kedua ikut pecahan js/paparan.js; GPS 23-28 dan GRS 5-8
   diasingkan daripada blok lawan kedua (ANDAIAN); Bebas ikut kad kerusi. Rakan yang bersetuju dikira sebagai rakan kerajaan
   (p.kerusiNasional.rakan; pelarasan pecahan PH / PN dalam ubah).
   ANDAIAN: semua angka kesediaan dan penalti ialah angka permainan.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikRundingan = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function PAP() { return modul('NusaPaparan', 'paparan.js'); }
  function PASm() { return modul('MyPolitikPAS', 'pas.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function SW(k) { return k === 'PBB' || k === 'PRS' || k === 'SUPP' || k === 'PDP' || k === 'PSB'; }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  var CONFIG = {
    MAJORITI: 112,
    KESEDIAAN: { BN: { PH: 60, PN: 45, GPS: 90, GRS: 80, BEBAS: 70 }, PN: { BN: 55, PH: 15, GPS: 60, GRS: 60, BEBAS: 70 } },
    TRADISI: { BN: { PH: -6, PN: -3 }, PN: { PH: -6 } },
    GPS: [23, 28], GRS: [5, 8],
    ADJ: { hubungan: 0.3, reputasi: 0.2, saiz: 0.2, saizAsas: 90 },
    PAS: { restu: 50, restuPH: 70 }, GAGAL_HUBUNGAN: -5,
    NAMA: { PH: 'Pakatan Harapan', PN: 'Perikatan Nasional', BN: 'Barisan Nasional', GPS: 'Gabungan Parti Sarawak', GRS: 'Gabungan Rakyat Sabah', BEBAS: 'Calon bebas' }
  };
  /** Gabungan pemain: 'BN' (UMNO dan komponen), 'PN' (PAS), atau null (parti Sarawak: tiada rundingan). */
  function gabPemain(p) { if (!p || SW(p.parti)) { return null; } return p.parti === 'PAS' ? 'PN' : 'BN'; }
  function antara(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }

  /** Senarai calon rakan bagi keputusan kerusi { parti, rakan, bebas, pembangkang, tahun, bulan }. */
  function calonDari(p, ka, hub) {
    var g = gabPemain(p), A = PAP(); if (!g || !ka || !A || !A.pecahPembangkang) { return []; }
    var r = S().rngBerbenih(hash((p.id || '') + '|rundingan|' + ka.tahun + '|' + ka.bulan));
    var pp = A.pecahPembangkang(p, ka, ka.pembangkang, false, 'parlimen'), gps = antara(r, CONFIG.GPS[0], CONFIG.GPS[1]), grs = antara(r, CONFIG.GRS[0], CONFIG.GRS[1]);
    var lain = Math.max(0, pp.PN - gps - grs); if (pp.PN < gps + grs) { gps = Math.min(gps, pp.PN); grs = Math.max(0, pp.PN - gps); }
    var kedua = g === 'PN' ? 'BN' : 'PN', K = CONFIG.KESEDIAAN[g], gabung = ka.parti + ka.rakan;
    var adj = ((Number(hub) || 50) - 50) * CONFIG.ADJ.hubungan + ((Number(p.reputasi) || 50) - 50) * CONFIG.ADJ.reputasi + (gabung - CONFIG.ADJ.saizAsas) * CONFIG.ADJ.saiz;
    var restu = g === 'PN' && PASm() && PASm().restu ? PASm().restu(p) : null;
    return [{ kod: 'PH', slot: 'PH', n: pp.PH }, { kod: kedua, slot: 'PN', n: lain }, { kod: 'GPS', slot: 'PN', n: gps }, { kod: 'GRS', slot: 'PN', n: grs }, { kod: 'BEBAS', slot: 'BEBAS', n: ka.bebas || 0 }]
      .filter(function (x) { return x.n > 0; }).map(function (x) {
        var k = clamp(Math.round(K[x.kod] + adj), 5, 95), sebab = '';
        if (restu !== null && restu < CONFIG.PAS.restu) { k = 0; sebab = 'Perlu Restu Majlis Syura sekurang-kurangnya ' + CONFIG.PAS.restu + ' (Perlembagaan PAS, Fasal 39(9)(k)).'; }
        else if (restu !== null && x.kod === 'PH' && restu < CONFIG.PAS.restuPH) { k = 0; sebab = 'Kerjasama dengan PH perlu Restu Majlis Syura sekurang-kurangnya ' + CONFIG.PAS.restuPH + '.'; }
        return { kod: x.kod, slot: x.slot, nama: CONFIG.NAMA[x.kod], n: x.n, kesediaan: k, akarUmbi: (CONFIG.TRADISI[g] || {})[x.kod] || 0, sebab: sebab };
      });
  }
  /** Calon rakan bagi pemain Presiden (keputusan nasional menunggu). */
  function calon(p) {
    var PR = modul('MyPolitikPRU', 'pru.js'), n = PR && PR.nasionalTertunggak ? PR.nasionalTertunggak(p) : null, A = PAP();
    if (!n || n.status !== 'PEMBANGKANG' || !A || !gabPemain(p)) { return []; }
    var ka = A.anggarKerusi(p, { tahun: n.tahun, bulan: n.bulan }, {});
    return calonDari(p, ka, n.hubungan);
  }
  /** Peluang semua rakan dipilih bersetuju (0..1). */
  function peluangSemua(senarai) { return senarai.reduce(function (a, x) { return a * x.kesediaan / 100; }, 1); }
  /** Uji rundingan: { berjaya, setuju:[...], tolak:[...], jumlah, akarUmbi, ubah:{PH,PN}, ambilBebas, gab }. */
  function nilai(p, ka, pilihan, r) {
    var gabung = ka.parti + ka.rakan, setuju = [], tolak = [], j = gabung, au = 0, u = { PH: 0, PN: 0 }, bb = 0;
    pilihan.forEach(function (x) {
      if (x.kesediaan > 0 && r() * 100 < x.kesediaan) { setuju.push(x); j += x.n; au += x.akarUmbi; if (x.slot === 'BEBAS') { bb += x.n; } else { u[x.slot] -= x.n; } }
      else { tolak.push(x); }
    });
    return { berjaya: j >= CONFIG.MAJORITI && setuju.length > 0, setuju: setuju, tolak: tolak, jumlah: j, akarUmbi: au, ubah: u, ambilBebas: bb, tambah: j - gabung };
  }
  /** Pilihan automatik NPC (pemain bukan Presiden): rakan paling bersedia sehingga >= 112. Pulang hasil nilai() atau null. */
  function npc(p, ka) {
    if (!gabPemain(p) || !ka || ka.kerajaan) { return null; }
    var senarai = calonDari(p, ka, p.pru && p.pru.hubunganGabungan).filter(function (x) { return x.kesediaan > 0; }).sort(function (a, b) { return b.kesediaan - a.kesediaan || b.n - a.n; });
    var pilih = [], j = ka.parti + ka.rakan;
    senarai.forEach(function (x) { if (j < CONFIG.MAJORITI) { pilih.push(x); j += x.n; } });
    if (j < CONFIG.MAJORITI) { return null; }
    var r = S().rngBerbenih(hash((p.id || '') + '|npc-gabungan|' + ka.tahun + '|' + ka.bulan)), h = nilai(p, ka, pilih, r);
    return h.berjaya ? h : null;
  }
  return { CONFIG: CONFIG, gabPemain: gabPemain, calonDari: calonDari, calon: calon, peluangSemua: peluangSemua, nilai: nilai, npc: npc };
});
