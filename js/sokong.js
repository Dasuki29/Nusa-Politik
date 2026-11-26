/* ==========================================================================
   Nusa Politik — js/sokong.js   (v14.8, maklum balas baris 50, mockup dipersetujui)
   Sokong Calon Pertandingan Lain: semasa tahun pemilihan, pemain melihat calon jawatan yang tidak
   dipertandingkannya (Presiden, Timbalan Presiden, Ketua Sayap Pusat, Ketua Bahagian, Ketua Cawangan)
   dan boleh menyokong seorang calon bagi setiap jawatan.
     - Kos 2 AP setiap sokongan; had 3 sokongan setahun; Pesaing utama tidak boleh disokong.
     - Sokongan menambah kekuatan calon +3 hingga +8 (ikut pangkat jawatan tertinggi pemain).
     - Keputusan apabila musim peringkat itu tamat (atau Disember): calon disokong menang = IP +20,
       Reputasi +2, Hubungan +15 (sekutu: +1 kekuatan pemain dalam pemilihan sendiri, maks +3);
       kalah = Hubungan dengan pemenang −10. Pemenang mengisi jawatan dalam Struktur parti.
   ANDAIAN: semua angka ialah angka permainan. Calon diambil daripada Struktur parti (NPC sedia ada).
   State: p.sokong = { tahun, pilih:{kod:nama}, bil, keputusan:{kod:{pemenang,disokong,menang}}, hubungan:{nama:n} }
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikSokong = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function E() { return modul('MyPolitikElection', 'election.js'); }
  function OG() { return modul('MyPolitikOrganisasi', 'organisasi.js'); }
  function J() { return modul('MyPolitikJawatan', 'jawatan.js'); }
  function K() { return modul('MyPolitikCalendar', 'calendar.js'); }
  function D() { return modul('MyPolitikData', 'data.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function salin(o) { return o === undefined || o === null ? o : JSON.parse(JSON.stringify(o)); }
  var CONFIG = { AP: 2, HAD: 3, BONUS: { min: 3, maks: 8 }, MENANG: { ip: 20, reputasi: 2, hubungan: 15 }, KALAH: { hubungan: -10 }, SEKUTU: { ambang: 60, maks: 3 },
    KOD: ['presiden', 'timbalan_presiden', 'ketua_bahagian', 'ketua_cawangan'] };

  function benih(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; }
  function getSk(p) { var s = p && p.sokong && typeof p.sokong === 'object' ? salin(p.sokong) : {}; s.hubungan = s.hubungan || {};
    if (s.tahun !== (p && p.tahun)) { s.tahun = p ? p.tahun : null; s.pilih = {}; s.bil = 0; s.keputusan = {}; } s.pilih = s.pilih || {}; s.keputusan = s.keputusan || {}; s.bil = Number(s.bil) || 0; return s; }
  function hubungan(s, nama) { var h = s.hubungan[nama]; return isFinite(Number(h)) ? Number(h) : 50; }
  function namaPesaing(p) { var r = p.rival && p.rival.senaraiPencabar ? p.rival.senaraiPencabar : {}; return Object.keys(r).map(function (k) { return r[k] && r[k].nama; }).filter(Boolean); }
  function bonus(p) { var J0 = J(), pg = J0 && J0.pangkatTertinggi ? Number(J0.pangkatTertinggi(p)) || 0 : 0; return clamp(CONFIG.BONUS.min + Math.round(pg / 2.4), CONFIG.BONUS.min, CONFIG.BONUS.maks); }
  function tahunPemilihan(p) { var e = E(); try { return !!(e && e.getFokusTahun && e.getFokusTahun(p.tahun).fasa === 'pemilihan'); } catch (x) { return false; } }
  function luar(p) { var SL = modul('MyPolitikSelepas', 'selepas.js'); return !!(SL && SL.luarPolitik && SL.luarPolitik(p)); }
  function kodSasar(p) { var sy = p.sayap && p.sayap !== 'utama' ? ['sayap_pusat_' + p.sayap] : []; return CONFIG.KOD.concat(sy); }
  function tetingkap(p, peringkat) { var k = K(); if (!k || !k.getTetingkap) { return null; } var lv = peringkat === 'pusat' ? 'pau' : peringkat; try { return k.getTetingkap(lv, p.bulan); } catch (x) { return null; } }

  /** Senarai pertandingan lain (deterministik bagi tahun dan pemain). */
  function senarai(p) {
    if (!p || p.tamat || !tahunPemilihan(p) || luar(p)) { return []; }
    var e0 = E(), og = OG(), s = getSk(p), pes = namaPesaing(p), b = bonus(p), out = [];
    var semua = e0 && e0.senaraiPertandingan ? e0.senaraiPertandingan(p) : [];
    var CS = {}, pny = [], pakai = []; kodSasar(p).forEach(function (kod) { CS[kod] = og && og.calonStruktur ? og.calonStruktur(p, kod) : null; if (CS[kod] && CS[kod].penyandang) { pny.push(CS[kod].penyandang); } });
    kodSasar(p).forEach(function (kod) {
      var e = semua.filter(function (x) { return x.kod === kod && x.jenis === 'jawatan'; })[0]; if (!e || e.didaftar) { return; }
      var cs = CS[kod], rg = benih(String(p.id || p.nama) + '|sokong|' + p.tahun + '|' + kod), nama = [];
      if (cs && cs.penyandang) { nama.push({ nama: cs.penyandang, penyandang: true }); }
      ((cs && cs.lain) || []).forEach(function (n) { if (nama.length < 3 && n !== p.nama && pny.indexOf(n) < 0 && pakai.indexOf(n) < 0 && !nama.some(function (x) { return x.nama === n; })) { nama.push({ nama: n }); } });
      var Dd = D(); while (nama.length < 2) { var nn = Dd && Dd.janaNama ? Dd.janaNama(rg, rg() < 0.3 ? 'P' : 'L', '') : 'Calon ' + (nama.length + 1); if (!nama.some(function (x) { return x.nama === nn; })) { nama.push({ nama: nn }); } }
      nama.forEach(function (c) { if (!c.penyandang) { pakai.push(c.nama); } });   // pencabar tidak berulang antara jawatan
      var calon = nama.slice(0, 3).map(function (c) {
        var k = Math.round(30 + rg() * 40) + (c.penyandang ? 8 : 0), h = hubungan(s, c.nama);
        return { nama: c.nama, penyandang: !!c.penyandang, pesaing: pes.indexOf(c.nama) >= 0, hubungan: h, sekutu: h >= CONFIG.SEKUTU.ambang, kekuatan: k + (s.pilih[kod] === c.nama ? b : 0), disokong: s.pilih[kod] === c.nama };
      });
      var jum = calon.reduce(function (t, c) { return t + c.kekuatan; }, 0) || 1;
      calon.forEach(function (c) { c.peluang = Math.round(c.kekuatan / jum * 100); });
      var w = tetingkap(p, e.peringkat), kp = s.keputusan[kod] || null;
      out.push({ kod: kod, jawatan: e.jawatan, peringkat: e.peringkat, calon: calon, pilih: s.pilih[kod] || null, keputusan: kp, tamat: !!(w && w.status === 'tamat'), tetingkap: w });
    });
    return out;
  }
  function ringkas(p) { var s = getSk(p); return { bil: s.bil, had: CONFIG.HAD, ap: CONFIG.AP, bonus: bonus(p), sekutu: Object.keys(s.hubungan).filter(function (n) { return s.hubungan[n] >= CONFIG.SEKUTU.ambang; }).length }; }

  function sokong(kod, nama) {
    var Sv = S(), p = Sv.loadPlayer(); if (!p || p.tamat) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var pt = senarai(p).filter(function (x) { return x.kod === kod; })[0]; if (!pt) { return { ok: false, ralat: 'Pertandingan tidak ditemui.' }; }
    var c = pt.calon.filter(function (x) { return x.nama === nama; })[0]; if (!c) { return { ok: false, ralat: 'Calon tidak ditemui.' }; }
    var s = getSk(p);
    if (pt.keputusan || pt.tamat) { return { ok: false, ralat: 'Pertandingan ini sudah selesai.' }; }
    if (s.pilih[kod]) { return { ok: false, ralat: 'Anda sudah menyokong calon bagi jawatan ini.' }; }
    if (c.pesaing) { return { ok: false, ralat: 'Anda tidak boleh menyokong Pesaing utama anda.' }; }
    if (s.bil >= CONFIG.HAD) { return { ok: false, ralat: 'Had ' + CONFIG.HAD + ' sokongan setahun dicapai.' }; }
    if ((Number(p.ap) || 0) < CONFIG.AP) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
    s.pilih[kod] = nama; s.bil += 1;
    var h = Sv.applyEffects({ ap: -CONFIG.AP }, { kiraTindakan: true, patch: { sokong: s }, log: { tindakan: 'sokong_calon', nama: 'Menyokong ' + nama + ' (' + pt.jawatan + ')', peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: 'Anda menyokong ' + nama + ' bagi jawatan ' + pt.jawatan + '. Kekuatan calon +' + bonus(p) + '.' } : { ok: false, ralat: h.ralat };
  }
  /** Bulanan (calendar.js): putuskan pertandingan yang disokong apabila musimnya tamat (atau Disember). */
  function prosesBulan() {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = []; if (!p || p.tamat || !p.sokong || p.sokong.tahun !== p.tahun) { return { peristiwa: ev }; }
    var s = getSk(p), kes = { ip: 0, reputasi: 0 }, ubah = false, npc = null, og = OG(), Dis = Number(p.bulan) === 12;
    senarai(p).forEach(function (pt) {
      if (!pt.pilih || pt.keputusan || !(pt.tamat || Dis)) { return; }
      var rg = benih(String(p.id || p.nama) + '|keputusan|' + p.tahun + '|' + pt.kod), jum = pt.calon.reduce(function (t, c) { return t + c.kekuatan; }, 0), x = rg() * jum, men = pt.calon[0];
      for (var i = 0; i < pt.calon.length; i++) { x -= pt.calon[i].kekuatan; if (x <= 0) { men = pt.calon[i]; break; } }
      var menang = men.nama === pt.pilih; s.keputusan[pt.kod] = { pemenang: men.nama, disokong: pt.pilih, menang: menang }; ubah = true;
      if (menang) {
        kes.ip += CONFIG.MENANG.ip; kes.reputasi += CONFIG.MENANG.reputasi; s.hubungan[men.nama] = clamp(hubungan(s, men.nama) + CONFIG.MENANG.hubungan, 0, 100);
        ev.push({ jenis: 'sokong', mesej: pt.jawatan + ': ' + men.nama + ' MENANG (calon anda). IP +' + CONFIG.MENANG.ip + ', Reputasi +' + CONFIG.MENANG.reputasi + '. ' + men.nama + ' kini sekutu anda.' });
      } else {
        s.hubungan[men.nama] = clamp(hubungan(s, men.nama) + CONFIG.KALAH.hubungan, 0, 100);
        ev.push({ jenis: 'sokong', mesej: pt.jawatan + ': ' + men.nama + ' menang. Anda menyokong ' + pt.pilih + ': Hubungan dengan ' + pt.jawatan + ' ' + CONFIG.KALAH.hubungan + '.' });
      }
      if (og && og.kemasKeputusan) { var pp = npc ? Object.assign({}, p, { npc: npc }) : p; npc = og.kemasKeputusan(pp, pt.kod, pt.calon.map(function (c) { return { nama: c.nama, menang: c.nama === men.nama }; })) || npc; }
    });
    if (ubah) { var patch = { sokong: s }; if (npc) { patch.npc = npc; } Sv.applyEffects(kes, { kiraTindakan: false, patch: patch }); }
    return { peristiwa: ev };
  }
  /** Bonus kekuatan pemain dalam pemilihan sendiri daripada sekutu (dipanggil oleh election.js). */
  function bonusSekutu(p) { var h = p && p.sokong && p.sokong.hubungan ? p.sokong.hubungan : {}; return Math.min(CONFIG.SEKUTU.maks, Object.keys(h).filter(function (n) { return h[n] >= CONFIG.SEKUTU.ambang; }).length); }

  return { CONFIG: CONFIG, getSk: getSk, senarai: senarai, ringkas: ringkas, sokong: sokong, prosesBulan: prosesBulan, bonusSekutu: bonusSekutu };
});
