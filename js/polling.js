/* ==========================================================================
   Nusa Politik — js/polling.js   (v12.7)
   Enjin Kaji Selidik & Unjuran Pilihan Raya semasa kempen PRU/PRN (14 hari).
   Keadaan disimpan dalam kempen aktif: pru.aktif.polling = { atasPagar, kira, sejarah, amaranHari }.
   Unjuran diambil daripada formula keputusan sebenar (pru.js hitungKeputusan) tanpa unsur rawak, jadi
   kaji selidik "jujur": Selamat / Marginal / Ketinggalan ikut margin ralat. Pengundi atas pagar TIDAK
   mengubah keputusan, tetapi menentukan margin ralat (lebih ramai atas pagar = unjuran kurang pasti).
   SEMUA ANGKA DI BAWAH IALAH ANDAIAN PERMAINAN, bukan data tinjauan sebenar. Badan tinjauan ialah rekaan.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikPolling = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  var CONFIG = {
    PENINJAU: 'Pusat Kajian Pendapat Nusa',                 // rekaan
    ATAS_PAGAR_MULA: { URBAN: 30, MIXED: 26, RURAL: 22 },  // % pengundi atas pagar pada hari 1
    ATAS_PAGAR_MIN: 4,
    MANIFESTO_TEPAT: -4,                                    // manifesto kena isu tempatan
    BAJET_RENDAH: 4,                                        // peruntukan di bawah minimum
    JENTERA_PER: 5, JENTERA_MAKS: 6,                        // setiap 5% jentera melebihi 55 = -1% atas pagar (maks -6)
    HARIAN: 0.5,                                            // pengundi membuat keputusan sendiri setiap hari
    KURANG: { ceramah: 1, ziarah: 1.2, digital: 0.8, rehat: 0, derma: 0.3, jelajah: 1.5, bantuan: 1.5, media: 1.2 },   // x pengganda kawasan
    MOE_ASAS: 2, MOE_PAGAR: 0.15,                           // margin ralat = 2 + 0.15 x atas pagar
    DEMO_HAD: 10,
    DEMO: {
      bandar: { nama: 'Pengundi Bandar', ikon: '🏙️', asas: 0, profil: { URBAN: 1, MIXED: 0, RURAL: -2 }, tindakan: { digital: 1.2, media: 1.5, ceramah: 0.3 } },
      luar:   { nama: 'Luar Bandar / Pedalaman', ikon: '🌾', asas: 0, profil: { URBAN: -2, MIXED: 0, RURAL: 1 }, tindakan: { ziarah: 1.2, ceramah: 0.8, bantuan: 1.5, jelajah: 1 } },
      belia:  { nama: 'Belia (18-30)', ikon: '🧑‍🎓', asas: -2, profil: {}, tindakan: { digital: 1.5, media: 1, jelajah: 0.5 } }
    }
  };
  var STATUS = { SELAMAT: 'Selamat', MARGINAL: 'Marginal/Sengit', KETINGGALAN: 'Ketinggalan' };

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function r1(n) { return Math.round(n * 10) / 10; }
  function isuTepat(a) { return (a.manifestoChoice || []).indexOf(a.isuTempatan) >= 0; }

  /** Mulakan keadaan polling apabila kempen bermula (selepas manifesto dan peruntukan dana ditetapkan). */
  function mula(a) {
    if (!a) { return null; }
    var u = CONFIG.ATAS_PAGAR_MULA[a.constituencyType] || CONFIG.ATAS_PAGAR_MULA.MIXED;
    if (isuTepat(a)) { u += CONFIG.MANIFESTO_TEPAT; }
    if (a.bajetRendah) { u += CONFIG.BAJET_RENDAH; }
    u -= clamp(Math.floor(((Number(a.jentera) || 55) - 55) / CONFIG.JENTERA_PER), 0, CONFIG.JENTERA_MAKS);
    a.polling = { atasPagar: clamp(u, CONFIG.ATAS_PAGAR_MIN, 40), kira: {}, sejarah: [], amaranHari: null };
    a.polling.sejarah.push({ hari: a.hari || 0, anda: unjuran(a).anda });
    return a.polling;
  }
  /** Simpanan lama (kempen bermula sebelum v12.7): bina keadaan polling secara malas. */
  function pastikan(a) {
    if (!a.polling) { mula(a); a.polling.atasPagar = clamp(a.polling.atasPagar - (a.hari || 0) * CONFIG.HARIAN, CONFIG.ATAS_PAGAR_MIN, 40); }
    return a.polling;
  }

  /** Selepas tindakan kempen: kurangkan atas pagar (x pengganda kawasan) dan kira tindakan untuk demografi. */
  function selepasTindakan(a, id, pengganda) {
    var pl = pastikan(a), k = CONFIG.KURANG[id] || 0;
    pl.atasPagar = r1(clamp(pl.atasPagar - k * (pengganda || 1), CONFIG.ATAS_PAGAR_MIN, 40));
    pl.kira[id] = (pl.kira[id] || 0) + 1;
  }
  /** Setiap hari kempen berlalu: sebahagian pengundi membuat keputusan sendiri; rekod unjuran harian. */
  function selepasHari(a) {
    var pl = pastikan(a);
    pl.atasPagar = r1(clamp(pl.atasPagar - CONFIG.HARIAN, CONFIG.ATAS_PAGAR_MIN, 40));
    pl.sejarah.push({ hari: a.hari, anda: unjuran(a).anda });
    if (pl.sejarah.length > 16) { pl.sejarah = pl.sejarah.slice(-16); }
  }

  /** Unjuran akhir tanpa rawak, sama dengan pru.js hitungKeputusan (purata rawak = 0, purata isu = +2/-1 x 0.5). */
  function unjuran(a) {
    var s1 = clamp(30 + (Number(a.voterSupport) || 0) * 0.4 + (isuTepat(a) ? 1 : -0.5) + (a.ofsetKerusi || 0), 5, 95);
    var PECAH_3 = 0.8;
    try { var PR = root.MyPolitikPRU; if (PR && PR.CONFIG && PR.CONFIG.PECAH_3) { PECAH_3 = PR.CONFIG.PECAH_3; } } catch (e) { /* lalai */ }
    if (a.isThreeCorneredFight) { var an = s1 * PECAH_3; return { anda: r1(an), rakan: r1(s1 - an), lawan: r1(100 - s1) }; }
    return { anda: r1(s1), rakan: 0, lawan: r1(100 - s1) };
  }

  /** Hasil kaji selidik penuh untuk paparan. */
  function kira(a) {
    if (!a || a.fasa !== 'kempen') { return null; }
    var pl = pastikan(a), u = pl.atasPagar, pj = unjuran(a), saing = Math.max(pj.lawan, pj.rakan);
    var moe = r1(CONFIG.MOE_ASAS + u * CONFIG.MOE_PAGAR), lead = r1(pj.anda - saing);
    var status = lead > moe ? STATUS.SELAMAT : lead >= -moe ? STATUS.MARGINAL : STATUS.KETINGGALAN;
    var f = 1 - u / 100, h2h = pj.anda + saing > 0 ? pj.anda / (pj.anda + saing) * 100 : 50;
    var awal = pl.sejarah.length ? pl.sejarah[0].anda : pj.anda;
    var demo = Object.keys(CONFIG.DEMO).map(function (k) {
      var d = CONFIG.DEMO[k], off = d.asas + (d.profil[a.constituencyType] || 0);
      Object.keys(d.tindakan).forEach(function (t) { off += (pl.kira[t] || 0) * d.tindakan[t]; });
      var v = r1(clamp(h2h + clamp(off, -CONFIG.DEMO_HAD, CONFIG.DEMO_HAD), 5, 95));
      return { kod: k, nama: d.nama, ikon: d.ikon, anda: v, cenderung: cenderung(v) };
    });
    demo.push({ kod: 'pagar', nama: 'Atas Pagar', ikon: '🤔', anda: r1(h2h), atasPagar: u, cenderung: u <= 8 ? 'Kebanyakan sudah membuat keputusan' : cenderung(h2h) });
    return {
      peninjau: CONFIG.PENINJAU, hari: a.hari || 0,
      projectedVoteShare: pj,                                                        // unjuran akhir (atas pagar diagih)
      semasa: { anda: r1(pj.anda * f), rakan: r1(pj.rakan * f), lawan: r1(pj.lawan * f), atasPagar: u },   // bar tinjauan hari ini
      undecidedVoters: u, moe: moe, lead: lead, seatStatus: status,
      swing: r1(pj.anda - awal), sejarah: pl.sejarah.slice(), demografi: demo
    };
  }
  function cenderung(v) { return v >= 52 ? 'Condong kepada anda' : v >= 48 ? 'Berbelah bahagi' : 'Condong kepada lawan'; }

  /** Amaran Marginal sekali sehari (dipanggil dalam pru.js sebelum simpan, supaya bendera tersimpan). */
  function amaran(a) {
    var k = kira(a); if (!k || k.seatStatus !== STATUS.MARGINAL || a.campaignDaysLeft <= 0) { return null; }
    if (a.polling.amaranHari === a.hari) { return null; }
    a.polling.amaranHari = a.hari;
    return 'Kaji selidik: kerusi anda Marginal/Sengit (beza ' + (k.lead >= 0 ? '+' : '') + k.lead + ' mata, margin ralat ±' + k.moe + '). ' + a.campaignDaysLeft + ' hari lagi sebelum Hari Mengundi. Tumpukan sumber kempen di sini.';
  }

  return { CONFIG: CONFIG, STATUS: STATUS, mula: mula, selepasTindakan: selepasTindakan, selepasHari: selepasHari, unjuran: unjuran, kira: kira, amaran: amaran };
});
