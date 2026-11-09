/* ==========================================================================
   Nusa Politik — js/pembangkang.js   (v13.50)
   Ketua Pembangkang dan MP pembangkang (maklum balas Threads no. 1, mockup dipersetujui).
     - Ketua Pembangkang: Presiden parti, Ahli Parlimen, parti di pihak pembangkang dan blok pembangkang terbesar
       (blok anda >= blok pembangkang lain; ANDAIAN: kerajaan = blok PH/PN yang lebih besar + kerusi lain jika cukup majoriti,
       jika tidak PH + PN bergabung dan tiada blok pembangkang lain).
       Elaun RM 6,000 + 20 IP sebulan (setaraf Menteri Penuh).
     - Naratif Pembangkang (0-100, mula 50): naik melalui tindakan Dewan, susut 1 sebulan ke arah 50.
       PRU seterusnya: +1 kerusi Parlimen parti bagi setiap 5 mata melebihi 50 (js/pru.js janaNasional).
     - Tindakan semua MP pembangkang: Soalan Lisan (1 AP, sekali sebulan), Bahas RUU Kerajaan (bulan sidang Dewan, sekali setiap sesi).
       Ketua Pembangkang sahaja: Bajet Alternatif (bulan Bajet, sekali setahun), Usul Undi Tidak Percaya (sekali setahun),
       Kabinet Bayangan (8 portfolio, calon daripada struktur parti melalui js/jemaah.js kolam(); sekali setiap penggal).
     - Kecekapan Kabinet Bayangan: pengganda kesan Naratif 1 + (Kecekapan - 50) / 100 (1.0 hingga 1.3).
   ANDAIAN: semua angka ialah angka permainan (mockup Threads no. 1). Parti Sarawak (GPS) tidak terlibat.
   State: p.pembangkang = { naratif, kp, penggal, soalanIdx, ruuSesi, bajetTahun, tpTahun, tp, bayangan }.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikPembangkang = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function DW() { return modul('MyPolitikDewan', 'dewan.js'); }
  function JM() { return modul('MyPolitikJemaah', 'jemaah.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function salin(o) { return JSON.parse(JSON.stringify(o)); }
  function SW(k) { return k === 'PBB' || k === 'PRS' || k === 'SUPP' || k === 'PDP' || k === 'PSB'; }
  var rngLalai = Math.random;
  function rng(o) { return (o && o.rng) || rngLalai; }
  function antara(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }

  var CONFIG = {
    ELAUN: { myr: 6000, ip: 20 },
    NARATIF: { asas: 50, susut: 1, kerusiSetiap: 5, tpSetiap: 10 },
    SOALAN: { ap: 1, peluang: 0.45, naratif: 3, naratifGagal: 1, ip: 15 },
    RUU: { sokong: { reputasi: 1, naratif: -2 }, bantah: { naratif: 4 }, pinda: { ap: 2, peluang: 0.4, naratif: 6, ip: 40, naratifGagal: 1 } },
    BAJET: { ap: 2, naratif: 8, reputasi: 2 },
    TP: { ap: 3, myr: 20000, pujukAP: 1, pujukMyr: 5000, pujukMaks: 3, pujuk: [2, 5], ambang: 112, gagal: { reputasi: -4, naratif: -10 }, berjaya: { reputasi: 3, naratif: 10 } },
    BAYANGAN: { ajk: 2, min: 1, maks: 1.3 }
  };

  function dasar() { return { naratif: CONFIG.NARATIF.asas, kp: false, penggal: '', soalanIdx: 0, ruuSesi: 0, bajetTahun: 0, tpTahun: 0, tp: null, bayangan: null }; }
  function getPB(p) { var x = p && p.pembangkang && typeof p.pembangkang === 'object' ? salin(p.pembangkang) : dasar(); var d = dasar(); Object.keys(d).forEach(function (k) { if (x[k] === undefined) { x[k] = d[k]; } }); return x; }
  function simpan(pb, kesan, log) { return S().applyEffects(kesan || {}, { kiraTindakan: !!log, patch: { pembangkang: pb }, log: log || undefined }); }
  function presiden(p) {
    var l = Array.isArray(p && p.jawatanList) ? p.jawatanList : [];
    return /^Presiden$/i.test(String((p && p.jawatan) || '')) || l.some(function (j) { return j && (j.kod === 'presiden' || /^Presiden$/i.test(String(j.jawatan || ''))); });
  }
  function penggalKunci(p) { var k = p && p.kerusiNasional; return k ? k.tahun + '-' + k.bulan : ''; }

  /** Status pembangkang pemain: { mp, kp, kami, lain, kerajaan, majoriti }. */
  function status(p) {
    var o = { mp: false, kp: false, kami: 0, lain: 0, kerajaan: 0, majoriti: 0, presiden: presiden(p) };
    if (!p || p.tamat || SW(p.parti)) { return o; }
    var P = PRU(), D = DW(); if (!P || !D || !P.pegang || !P.pegang(p, 'MP')) { return o; }
    var k = D.kerusi(p); if (!k || k.kerajaanBN !== false) { return o; }
    // kerajaan = blok PH/PN terbesar (+ kerusi lain) jika cukup majoriti; jika tidak, PH + PN bergabung (tiada blok pembangkang lain)
    var besar = Math.max(k.PH, k.PN), kecil = Math.min(k.PH, k.PN), sendiri = besar + (k.LAIN || 0) >= k.ambang;
    o.mp = true; o.kami = k.BN; o.lain = sendiri ? kecil : 0; o.kerajaan = k.jumlah - o.kami - o.lain; o.majoriti = o.kerajaan - (k.jumlah - o.kerajaan);
    o.kp = o.presiden && o.kami >= o.lain;
    return o;
  }
  function pengganda(pb) { var b = pb && pb.bayangan; return b && b.umum ? b.pengganda : 1; }
  function naikNaratif(pb, n) { pb.naratif = clamp(Math.round((pb.naratif + (n > 0 ? n * pengganda(pb) : n)) * 10) / 10, 0, 100); return pb.naratif; }
  function sesiRUU(p) { var D = DW(); if (!D) { return null; } var b = parseInt(p.bulan, 10); if (D.CONFIG.SESI.indexOf(b) < 0) { return null; } var kunci = (parseInt(p.tahun, 10) || 0) * 100 + b, R = D.RUU; return { kunci: kunci, ruu: R[(kunci * 7) % R.length] }; }
  function bonusKerusi(p) { var pb = p && p.pembangkang; if (!pb || typeof pb.naratif !== 'number') { return 0; } return pb.naratif > CONFIG.NARATIF.asas ? Math.floor((pb.naratif - CONFIG.NARATIF.asas) / CONFIG.NARATIF.kerusiSetiap) : 0; }

  /** Keadaan untuk UI. */
  function keadaan(p) {
    var st = status(p); if (!st.mp) { return null; }
    var pb = getPB(p), ap = Number(p.ap) || 0, S0 = S(), cukup = function (n) { return !S0.cukupDana || S0.cukupDana(p, n); };
    var sr = sesiRUU(p), D = DW(), bulanBajet = D ? D.CONFIG.BULAN_BAJET : 10;
    function t(boleh, sebab) { return { boleh: !sebab && boleh, sebab: sebab || '' }; }
    return {
      status: st, naratif: pb.naratif, bonusKerusi: bonusKerusi({ pembangkang: pb }), pengganda: pengganda(pb), elaun: st.kp ? CONFIG.ELAUN : null,
      soalan: t(true, pb.soalanIdx === idx(p) ? 'Soalan Lisan sudah dikemukakan bulan ini.' : ap < CONFIG.SOALAN.ap ? 'AP tidak mencukupi.' : ''),
      ruu: sr ? Object.assign({ tajuk: sr.ruu.tajuk, huraian: sr.ruu.huraian }, t(true, pb.ruuSesi === sr.kunci ? 'Anda sudah membahas RUU sesi ini.' : '')) : { boleh: false, sebab: 'RUU kerajaan dibentang pada bulan sidang Dewan (' + (D ? D.CONFIG.SESI.join(', ') : '3, 7, 10') + ').' },
      pindaBoleh: ap >= CONFIG.RUU.pinda.ap,
      bajet: st.kp ? t(true, parseInt(p.bulan, 10) !== bulanBajet ? 'Bajet Alternatif hanya pada bulan ' + bulanBajet + '.' : pb.bajetTahun === p.tahun ? 'Bajet Alternatif tahun ini sudah dibentang.' : ap < CONFIG.BAJET.ap ? 'AP tidak mencukupi.' : '') : null,
      tp: st.kp ? (pb.tp ? { aktif: pb.tp, pujuk: t(true, pb.tp.pujuk >= CONFIG.TP.pujukMaks ? 'Had pujukan dicapai.' : ap < CONFIG.TP.pujukAP ? 'AP tidak mencukupi.' : !cukup(CONFIG.TP.pujukMyr) ? 'Dana tidak mencukupi.' : '') }
        : t(true, pb.tpTahun === p.tahun ? 'Usul Undi Tidak Percaya hanya sekali setahun.' : ap < CONFIG.TP.ap ? 'AP tidak mencukupi.' : !cukup(CONFIG.TP.myr) ? 'Dana tidak mencukupi.' : '')) : null,
      bayangan: st.kp ? pb.bayangan : null
    };
  }

  function semak(p, kp) { var st = status(p); if (!st.mp) { return { ralat: 'Hanya Ahli Parlimen pembangkang.' }; } if (kp && !st.kp) { return { ralat: 'Hanya Ketua Pembangkang.' }; } return { st: st }; }
  function soalanLisan(o) {
    var p = S().loadPlayer(), c = semak(p, false); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var k = keadaan(p); if (!k.soalan.boleh) { return { ok: false, ralat: k.soalan.sebab }; }
    var pb = getPB(p), r = rng(o), jaya = r() < clamp(CONFIG.SOALAN.peluang + ((Number(p.reputasi) || 50) - 50) / 100 + (pengganda(pb) - 1), 0.1, 0.9);
    pb.soalanIdx = idx(p); naikNaratif(pb, jaya ? CONFIG.SOALAN.naratif : CONFIG.SOALAN.naratifGagal);
    var h = simpan(pb, jaya ? { ap: -CONFIG.SOALAN.ap, ip: CONFIG.SOALAN.ip } : { ap: -CONFIG.SOALAN.ap }, { tindakan: 'pembangkang_soalan', nama: 'Soalan Lisan kepada Menteri', peringkat: 'ahli' });
    if (!h.ok) { return { ok: false, ralat: h.ralat }; }
    return { ok: true, jaya: jaya, mesej: jaya ? 'Soalan Lisan anda menekan Menteri dan menjadi tajuk berita. Naratif Pembangkang ' + pb.naratif + '.' : 'Menteri menjawab dengan baik; soalan anda kurang mendapat perhatian. Naratif Pembangkang ' + pb.naratif + '.' };
  }
  /** pilihan: sokong | bantah | pinda */
  function bahasRUU(pilihan, o) {
    var p = S().loadPlayer(), c = semak(p, false); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var k = keadaan(p); if (!k.ruu.boleh) { return { ok: false, ralat: k.ruu.sebab }; }
    var pb = getPB(p), sr = sesiRUU(p), kes = {}, m = '', C = CONFIG.RUU;
    if (pilihan === 'sokong') { naikNaratif(pb, C.sokong.naratif); kes.reputasi = C.sokong.reputasi; m = 'Anda menyokong ' + sr.ruu.tajuk + ' demi kepentingan rakyat. Reputasi +1.'; }
    else if (pilihan === 'bantah') { naikNaratif(pb, C.bantah.naratif); m = 'Anda membantah ' + sr.ruu.tajuk + ' dengan keras.'; }
    else if (pilihan === 'pinda') {
      if (!k.pindaBoleh) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
      kes.ap = -C.pinda.ap;
      if (rng(o)() < C.pinda.peluang) { naikNaratif(pb, C.pinda.naratif); kes.ip = C.pinda.ip; m = 'Pindaan anda kepada ' + sr.ruu.tajuk + ' diterima kerajaan.'; }
      else { naikNaratif(pb, C.pinda.naratifGagal); m = 'Pindaan anda kepada ' + sr.ruu.tajuk + ' ditolak.'; }
    } else { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    pb.ruuSesi = sr.kunci;
    var h = simpan(pb, kes, { tindakan: 'pembangkang_ruu', nama: 'Bahas ' + sr.ruu.tajuk + ' (' + pilihan + ')', peringkat: 'ahli' });
    return h.ok ? { ok: true, mesej: m + ' Naratif Pembangkang ' + pb.naratif + '.' } : { ok: false, ralat: h.ralat };
  }
  function bajetAlternatif() {
    var p = S().loadPlayer(), c = semak(p, true); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var k = keadaan(p); if (!k.bajet.boleh) { return { ok: false, ralat: k.bajet.sebab }; }
    var pb = getPB(p); pb.bajetTahun = p.tahun; naikNaratif(pb, CONFIG.BAJET.naratif);
    var h = simpan(pb, { ap: -CONFIG.BAJET.ap, reputasi: CONFIG.BAJET.reputasi }, { tindakan: 'pembangkang_bajet', nama: 'Bajet Alternatif ' + (p.tahun + 1), peringkat: 'ahli' });
    return h.ok ? { ok: true, mesej: 'Bajet Alternatif dibentang dan mendapat liputan meluas. Naratif Pembangkang ' + pb.naratif + '.' } : { ok: false, ralat: h.ralat };
  }
  function mulaTP() {
    var p = S().loadPlayer(), c = semak(p, true); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var k = keadaan(p); if (k.tp.aktif) { return { ok: false, ralat: 'Usul sedang berjalan.' }; } if (!k.tp.boleh) { return { ok: false, ralat: k.tp.sebab }; }
    var pb = getPB(p), st = c.st, bonus = pb.naratif > CONFIG.NARATIF.asas ? Math.floor((pb.naratif - CONFIG.NARATIF.asas) / CONFIG.NARATIF.tpSetiap) : 0;
    pb.tpTahun = p.tahun; pb.tp = { sokong: st.kami + st.lain + bonus, asas: st.kami + st.lain, bonus: bonus, perlu: CONFIG.TP.ambang, pujuk: 0, idx: idx(p) };
    var h = simpan(pb, { ap: -CONFIG.TP.ap, myr: -CONFIG.TP.myr }, { tindakan: 'pembangkang_tp', nama: 'Usul Undi Tidak Percaya dikemukakan', peringkat: 'ahli' });
    return h.ok ? { ok: true, mesej: 'Usul Undi Tidak Percaya dikemukakan: ' + pb.tp.sokong + ' undi sokong, perlu ' + pb.tp.perlu + '. Pujuk MP kerajaan yang goyah sebelum undian.' } : { ok: false, ralat: h.ralat };
  }
  function pujukTP(o) {
    var p = S().loadPlayer(), c = semak(p, true); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var k = keadaan(p); if (!k.tp.aktif) { return { ok: false, ralat: 'Tiada usul.' }; } if (!k.tp.pujuk.boleh) { return { ok: false, ralat: k.tp.pujuk.sebab }; }
    var pb = getPB(p), n = Math.round(antara(rng(o), CONFIG.TP.pujuk[0], CONFIG.TP.pujuk[1]) * pengganda(pb)); pb.tp.sokong += n; pb.tp.pujuk += 1;
    var h = simpan(pb, { ap: -CONFIG.TP.pujukAP, myr: -CONFIG.TP.pujukMyr }, { tindakan: 'pembangkang_tp_pujuk', nama: 'Pujuk MP kerajaan (+' + n + ')', peringkat: 'ahli' });
    return h.ok ? { ok: true, mesej: n + ' MP kerajaan bersetuju menyokong usul. Sokongan kini ' + pb.tp.sokong + ' / ' + pb.tp.perlu + '.' } : { ok: false, ralat: h.ralat };
  }
  function undiTP(o) {
    var p = S().loadPlayer(), pb = getPB(p); if (!pb.tp) { return { ok: false, ralat: 'Tiada usul.' }; }
    var tp = pb.tp, jaya = tp.sokong >= tp.perlu, C = CONFIG.TP, ev = [];
    pb.tp = null; naikNaratif(pb, jaya ? C.berjaya.naratif : C.gagal.naratif);
    var h = simpan(pb, { reputasi: jaya ? C.berjaya.reputasi : C.gagal.reputasi }, { tindakan: 'pembangkang_tp_undi', nama: 'Undi Tidak Percaya: ' + (jaya ? 'kerajaan tumbang' : 'gagal') + ' (' + tp.sokong + ')', peringkat: 'ahli' });
    if (!h.ok) { return { ok: false, ralat: h.ralat }; }
    var m = jaya ? 'Usul Undi Tidak Percaya LULUS dengan ' + tp.sokong + ' undi (perlu ' + tp.perlu + '). Kerajaan tumbang; Parlimen dibubarkan dan Pilihan Raya Mengejut diisytiharkan.'
      : 'Usul Undi Tidak Percaya GAGAL: hanya ' + tp.sokong + ' undi (perlu ' + tp.perlu + '). Reputasi ' + C.gagal.reputasi + ', Naratif Pembangkang ' + C.gagal.naratif + '.';
    ev.push({ jenis: 'pembangkang', mesej: m });
    if (jaya) { var P = PRU(); var snap = P && P.isytihar ? P.isytihar('krisis', o) : null; if (snap && snap.peristiwa) { ev = ev.concat(snap.peristiwa); } }
    return { ok: true, jaya: jaya, mesej: m, peristiwa: ev };
  }
  /** Kabinet Bayangan: m = { portfolio: id calon parti } bagi 8 portfolio utama Jemaah Menteri. */
  function calonBayangan(p) { var J = JM(); return J && J.kolam ? J.kolam(p).parti : []; }
  function nilaiBayangan(p, m) {
    var J = JM(), port = J ? J.CONFIG.UTAMA : [], kol = calonBayangan(p), ids = [], dup = [], dip = [];
    port.forEach(function (nm) { var id = m && m[nm]; if (!id) { return; } if (ids.indexOf(id) >= 0) { dup.push(id); return; } ids.push(id); var c = kol.filter(function (x) { return x.id === id; })[0]; if (c) { dip.push(c); } });
    var kec = dip.length ? Math.round(dip.reduce(function (a, c) { return a + c.kecekapan; }, 0) / dip.length) : 0;
    return { lengkap: dip.length === port.length && !dup.length, bil: dip.length, jumlah: port.length, kecekapan: kec, pengganda: Math.round(clamp(1 + (kec - 50) / 100, CONFIG.BAYANGAN.min, CONFIG.BAYANGAN.maks) * 100) / 100,
      duplikat: dup.map(function (id) { var c = kol.filter(function (x) { return x.id === id; })[0]; return c ? c.nama : id; }) };
  }
  function umumBayangan(m) {
    var p = S().loadPlayer(), c = semak(p, true); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var pb = getPB(p); if (pb.bayangan && pb.bayangan.umum) { return { ok: false, ralat: 'Kabinet Bayangan penggal ini sudah diumumkan.' }; }
    var n = nilaiBayangan(p, m); if (n.duplikat.length) { return { ok: false, ralat: 'Seorang hanya boleh memegang satu jawatan: ' + n.duplikat.join(', ') + '.' }; }
    if (!n.lengkap) { return { ok: false, ralat: 'Pilih Menteri Bayangan bagi semua ' + n.jumlah + ' portfolio.' }; }
    var kol = calonBayangan(p), senarai = Object.keys(m).map(function (nm) { var x = kol.filter(function (y) { return y.id === m[nm]; })[0]; return { portfolio: nm, nama: x ? x.nama : '', jawatan: x ? x.jawatan : '' }; });
    pb.bayangan = { umum: true, kecekapan: n.kecekapan, pengganda: n.pengganda, senarai: senarai };
    var h = simpan(pb, { kesetiaan: { ajk: CONFIG.BAYANGAN.ajk } }, { tindakan: 'pembangkang_bayangan', nama: 'Kabinet Bayangan diumumkan', peringkat: 'ahli' });
    return h.ok ? { ok: true, mesej: 'Kabinet Bayangan diumumkan. Kecekapan ' + n.kecekapan + ': kesan Naratif ×' + n.pengganda + '.' } : { ok: false, ralat: h.ralat };
  }

  /** Setiap bulan (calendar.js): status Ketua Pembangkang, elaun, susutan Naratif, undian usul tertangguh. */
  function prosesBulan(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat) { return { peristiwa: ev }; }
    var pb = getPB(p), st = status(p), ubah = false, kes = {};
    if (pb.tp) { var u = undiTP(o); ev = ev.concat(u.peristiwa || []); p = Sv.loadPlayer(); pb = getPB(p); st = status(p); }
    var pg = penggalKunci(p);
    if (pg && pb.penggal !== pg) { if (pb.penggal) { pb.naratif = CONFIG.NARATIF.asas; pb.bayangan = null; } pb.penggal = pg; ubah = true; }
    if (st.kp !== !!pb.kp) {
      ev.push({ jenis: 'pembangkang', mesej: st.kp ? 'Anda kini Ketua Pembangkang Dewan Rakyat. Elaun RM 6,000 + 20 IP sebulan; tindakan pembangkang dibuka di tab Dewan.' : 'Anda bukan lagi Ketua Pembangkang.' });
      pb.kp = st.kp; ubah = true;
    }
    if (st.kp) { kes = { myr: CONFIG.ELAUN.myr, ip: CONFIG.ELAUN.ip }; ubah = true; }
    if (st.mp && pb.naratif !== CONFIG.NARATIF.asas) { pb.naratif = pb.naratif > CONFIG.NARATIF.asas ? Math.max(CONFIG.NARATIF.asas, pb.naratif - CONFIG.NARATIF.susut) : Math.min(CONFIG.NARATIF.asas, pb.naratif + CONFIG.NARATIF.susut); ubah = true; }
    if (ubah) { Sv.applyEffects(kes, { kiraTindakan: false, pindahan: true, patch: { pembangkang: pb }, log: st.kp ? { tindakan: 'elaun_pembangkang', nama: 'Elaun Ketua Pembangkang: +RM ' + CONFIG.ELAUN.myr, peringkat: 'bulan' } : undefined }); }
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, setRng: function (f) { rngLalai = f || Math.random; }, getPB: getPB, status: status, keadaan: keadaan, bonusKerusi: bonusKerusi,
    soalanLisan: soalanLisan, bahasRUU: bahasRUU, bajetAlternatif: bajetAlternatif, mulaTP: mulaTP, pujukTP: pujukTP, undiTP: undiTP,
    calonBayangan: calonBayangan, nilaiBayangan: nilaiBayangan, umumBayangan: umumBayangan, prosesBulan: prosesBulan };
});
