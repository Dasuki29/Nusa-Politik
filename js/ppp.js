/* ==========================================================================
   Nusa Politik — js/ppp.js   (v13.8)
   PPP / myPPP (Parti Progresif Penduduk), komponen BN di Semenanjung, MOD RINGAN: enjin yang sama seperti MIC
   (Cawangan, Bahagian = kawasan Parlimen, Pusat) tanpa peraturan perlembagaan khas (perlembagaan PPP tidak tersedia).
   Ciri teras (mockup PPP, dipersetujui):
     1. Tuntut Kerusi BN: Pengaruh dalam BN (0-100) dibina melalui Lobi pimpinan BN dan Jentera untuk calon BN;
        rundingan 12 bulan sebelum PRU menentukan sama ada BN memberi PPP 1 kerusi Parlimen dan/atau 1 kerusi DUN.
     2. Krisis Kepimpinan & ROS: pertikaian presiden dalam tahun pemilihan; pemain memilih pihak; ROS boleh membekukan parti 6 bulan.
   State: p.ppp = { pengaruh, lobiBulan, jentera:{pru, i}, kerusi:{pru, i, PL, DUN, pemainPL, pemainDUN}, krisis:{tahun, i, sehingga, pilihan},
                    krisisTahun, beku, bekuRayu, gantung, lantikan:{jawatan, ip, tahun}, pusat:{} }
   SEMUA ANGKA BERTANDA ANDAIAN IALAH ANDAIAN PERMAINAN. Permainan simulasi; bukan laman rasmi parti.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikPPP = api;
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
  function DATA() { return modul('MyPolitikPPPData', 'ppp-data.js') || { parlimen: {}, dun: {} }; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(t, b) { return (parseInt(t, 10) || 0) * 12 + (parseInt(b, 10) || 1); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  var CONFIG = {
    TAHUN_MULA: 2027, KITARAN_TAHUN: 3, BULAN_PUSAT: 9,                   // ANDAIAN: Perhimpunan Agung Tahunan bulan 9 (pemilihan Presiden 1-9-2024); pemilihan setiap 3 tahun dari 2027
    KUOTA_PARLIMEN: 0, KUOTA_DUN: 0,                                    // tiada kerusi tetap dalam BN
    PENGARUH: { awal: 20, lobiAP: 2, lobiMYR: 2000, lobiNaik: 6, pangkatMin: 7, jenteraAP: 2, jenteraMenang: 10, jenteraKalah: 3, peluangBNMenang: 0.55, susut: 0.5 },
    RUNDING: { bulanSebelum: 12, tolakPL: 30, maksPL: 60, tolakDUN: 15, maksDUN: 75, pangkatDUN: 3 },
    KRISIS: { peluang: 0.15, tempoh: 2, presidenMenang: 0.6, beku: 0.2, bekuBulan: 6, gantungBulan: 6, rayuanAP: 1, rayuanPeluang: 0.6,
      presiden: { ajk: 6, pengaruh: 3, kalahReputasi: -3 }, berkecuali: { pengaruh: -2 }, lantikan: { jawatan: 'Ahli Majlis Tertinggi (Lantikan)', ip: 6 } },
    PUSAT: { sendiri: 60, lain: [30, 45], bonusSkala: 0.3, wakilBahagian: 10, mt: 40 }
  };

  function adalah(p) { return !!(p && p.parti === 'PPP'); }
  function st(p) {
    var m = p && p.ppp && typeof p.ppp === 'object' ? p.ppp : {};
    if (typeof m.pengaruh !== 'number') { m.pengaruh = CONFIG.PENGARUH.awal; }
    if (!m.pusat || typeof m.pusat !== 'object') { m.pusat = {}; }
    return m;
  }
  function simpan(p, m, kesan, log, patchTambah) {
    var patch = { ppp: m }; if (patchTambah) { for (var k in patchTambah) { patch[k] = patchTambah[k]; } }
    return S().applyEffects(kesan || {}, { kiraTindakan: !!(log && log.kira), patch: patch, log: log && log.nama ? { tindakan: log.tindakan || 'ppp', nama: log.nama, peringkat: log.peringkat || 'ahli' } : undefined });
  }
  function pegang(p, kod) { var J0 = J(); return !!(J0 && J0.pegang && J0.pegang(p, kod)); }
  function pangkat(p) { var J0 = J(); return J0 ? Math.max(J0.pangkatTertinggi(p, 'utama'), Number(p.pangkatUtamaLalu) || 0) : 0; }
  function sekarang(p) { return idx(p.tahun, p.bulan); }
  function kodPL(p) { var k = p && p.kod && p.kod.parlimen; return k ? 'P.' + String(parseInt(k, 10)).padStart(3, '0') : null; }

  /* ---------- PRU: jadual dan riwayat ---------- */
  function getPRU(p) { var P0 = PRU(); try { return P0 && P0.getPRU ? P0.getPRU(p) : (p && p.pru) || {}; } catch (e) { return (p && p.pru) || {}; } }
  function jadualPRU(p) { var pr = getPRU(p); return pr && pr.tahunPRU ? idx(pr.tahunPRU, pr.bulanPRU || 3) : idx(2031, 3); }
  function pruAktif(p) { var pr = getPRU(p); return !!(pr && pr.aktif); }
  function pruTerakhir(p) { var r = (getPRU(p).riwayat || []).filter(function (x) { return x && x.jenis !== 'PRN'; }); var l = r[r.length - 1]; return l ? idx(l.tahun, l.bulan) : 0; }

  /* ---------- Kawasan (antara muka sama seperti MCA/MIC untuk js/pru.js) ---------- */
  function kerusiSah(p) { var m = st(p); return m.kerusi && pruTerakhir(p) < m.kerusi.i ? m.kerusi : null; }
  function kawasan(p) {
    var d = DATA(), kp = kodPL(p), pl = kp ? d.parlimen[kp] : null, dn = null, k = kerusiSah(p);
    if (pl && p.kod && p.kod.dun && parseInt(p.kod.dun, 10) > 0) { var kd = pl.ng + '_N.' + String(parseInt(p.kod.dun, 10)).padStart(2, '0'); dn = d.dun[kd] ? Object.assign({ kod: kd }, d.dun[kd]) : null; }
    return { parlimen: pl ? Object.assign({ kod: kp }, pl) : null, dun: dn, kuotaPL: !!(k && k.pemainPL), kuotaDUN: !!(k && k.pemainDUN), bilBahagian: Object.keys(d.parlimen).length };
  }
  function sebabKuota(p, jenis) { return 'PPP belum mendapat kerusi ' + (jenis === 'DUN' ? 'DUN' : 'Parlimen') + ' ini daripada BN (Tuntut Kerusi BN di kad PPP, tab Profil)'; }
  function ofset() { return 0; }
  function lawan(p, jenis) { var k = kawasan(p), x = jenis === 'DUN' ? k.dun : k.parlimen; return x && x.c >= 40 ? ['DAP', 'PKR'] : ['PKR', 'DAP']; }

  /* ---------- Kitaran pemilihan 3 tahun dari 2027 (ANDAIAN) ---------- */
  function adalahTahunPemilihan(p, tahun) { var t = parseInt(tahun, 10); return t >= CONFIG.TAHUN_MULA && (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN === 0; }
  function tahunSeterusnya(p, tahun) { var t = parseInt(tahun, 10); if (t <= CONFIG.TAHUN_MULA) { return CONFIG.TAHUN_MULA; } var b = (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN; return b === 0 ? t : t + CONFIG.KITARAN_TAHUN - b; }
  function tahunLepas(p, tahun) { var t = parseInt(tahun, 10); return t < CONFIG.TAHUN_MULA ? null : t - ((t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN); }

  /* ---------- Pemilihan Pusat (perwakilan Bahagian; ANDAIAN 10 setiap Bahagian + Majlis Tertinggi) ---------- */
  function sokonganBahagian(p) {
    var d = DATA(), m = st(p), own = kodPL(p), out = {};
    Object.keys(d.parlimen).forEach(function (k) {
      var v = m.pusat[k];
      if (typeof v !== 'number') { var c = CONFIG.PUSAT.lain; v = k === own ? CONFIG.PUSAT.sendiri : c[0] + (hash(String(p.id) + '|ppp|' + k) % (c[1] - c[0] + 1)); }
      out[k] = v;
    });
    return out;
  }
  function ringkasPusat(p) {
    var sb = sokonganBahagian(p), ks = Object.keys(sb), jum = 0, w = CONFIG.PUSAT.wakilBahagian;
    ks.forEach(function (k) { jum += sb[k]; });
    var purata = ks.length ? jum / ks.length : 0, pengundi = ks.length * w + CONFIG.PUSAT.mt;
    return { purata: Math.round(purata * 10) / 10, pengundi: pengundi, bilBahagian: ks.length, sokongUndi: Math.round(pengundi * purata / 100) };
  }
  function lantikanSemasa(p) { var m = st(p); return m.lantikan && m.lantikan.tahun >= (tahunLepas(p, p.tahun) || 0) ? m.lantikan : null; }
  function bonusPusat(p) { if (!adalah(p)) { return 0; } var l = lantikanSemasa(p); return Math.round(((ringkasPusat(p).purata - 40) * CONFIG.PUSAT.bonusSkala + (l ? 4 : 0)) * 10) / 10; }

  /* ---------- Status pembekuan / gantung ---------- */
  function beku(p) { var m = st(p); return typeof m.beku === 'number' && m.beku >= sekarang(p); }
  function gantungAktif(p) { var m = st(p); return typeof m.gantung === 'number' && m.gantung >= sekarang(p); }
  /** Disemak oleh js/jawatan.js dan js/meeting.js: parti dibekukan ROS atau keahlian digantung. */
  function halangan(p) {
    if (!adalah(p)) { return null; }
    if (beku(p)) { return 'PPP dibekukan oleh ROS sehingga ' + tb(st(p).beku) + ': tiada mesyuarat atau pemilihan.'; }
    if (gantungAktif(p)) { return 'Keahlian anda digantung sehingga ' + tb(st(p).gantung) + ' selepas krisis kepimpinan.'; }
    return null;
  }
  var BULAN = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  function tb(i) { var t = Math.floor((i - 1) / 12), b = ((i - 1) % 12) + 1; return BULAN[b - 1] + ' ' + t; }

  /* ---------- Tuntut Kerusi BN ---------- */
  function statusLobi(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk PPP.' }; }
    if (beku(p)) { return { boleh: false, sebab: 'PPP dibekukan oleh ROS.' }; }
    if (gantungAktif(p)) { return { boleh: false, sebab: 'Keahlian anda digantung.' }; }
    if (pangkat(p) < CONFIG.PENGARUH.pangkatMin) { return { boleh: false, sebab: 'Perlu Ketua Bahagian atau lebih.' }; }
    var m = st(p); if (m.lobiBulan === sekarang(p)) { return { boleh: false, sebab: 'Lobi sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < CONFIG.PENGARUH.lobiAP) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < CONFIG.PENGARUH.lobiMYR) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function lobi() {
    var p = S().loadPlayer(), s0 = statusLobi(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), a = m.pengaruh; m.pengaruh = clamp(a + CONFIG.PENGARUH.lobiNaik, 0, 100); m.lobiBulan = sekarang(p);
    var r = simpan(p, m, { ap: -CONFIG.PENGARUH.lobiAP, myr: -CONFIG.PENGARUH.lobiMYR }, { kira: true, tindakan: 'ppp_lobi', nama: 'Lobi pimpinan BN' });
    return r.ok ? { ok: true, mesej: 'Anda melobi pimpinan BN supaya PPP diberi kerusi. Pengaruh dalam BN ' + a + ' → ' + m.pengaruh + '.' } : { ok: false, ralat: r.ralat };
  }
  /** Musim jentera: 3 bulan sebelum PRU dijadualkan hingga PRU selesai. */
  function statusJentera(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk PPP.' }; }
    var m = st(p), j = jadualPRU(p), now = sekarang(p);
    if (!(pruAktif(p) || (now >= j - 3 && now <= j))) { return { boleh: false, sebab: 'Hanya semasa musim PRU (3 bulan sebelum PRU).' }; }
    if (m.jentera && m.jentera.pru === j) { return { boleh: false, sebab: 'Jentera sudah digerakkan untuk PRU ini.', sudah: true }; }
    if (beku(p)) { return { boleh: false, sebab: 'PPP dibekukan oleh ROS.' }; }
    if ((Number(p.ap) || 0) < CONFIG.PENGARUH.jenteraAP) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function jentera() {
    var p = S().loadPlayer(), s0 = statusJentera(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p); m.jentera = { pru: jadualPRU(p), i: sekarang(p), selesai: false };
    var r = simpan(p, m, { ap: -CONFIG.PENGARUH.jenteraAP }, { kira: true, tindakan: 'ppp_jentera', nama: 'Jentera PPP untuk calon BN' });
    return r.ok ? { ok: true, mesej: 'Jentera PPP digerakkan untuk calon BN di kawasan anda. Pengaruh dalam BN bertambah selepas PRU (+' + CONFIG.PENGARUH.jenteraMenang + ' jika calon BN menang, +' + CONFIG.PENGARUH.jenteraKalah + ' jika kalah).' } : { ok: false, ralat: r.ralat };
  }
  function peluangKerusi(p) { var P = st(p).pengaruh, R = CONFIG.RUNDING; return { PL: clamp(P - R.tolakPL, 0, R.maksPL), DUN: clamp(P - R.tolakDUN, 0, R.maksDUN) }; }
  /** Rundingan kerusi: 12 bulan sebelum PRU dijadualkan, atau serta-merta apabila PRU diisytiharkan lebih awal. */
  function runding(p, m, r) {
    var pel = beku(p) ? { PL: 0, DUN: 0 } : peluangKerusi(p), PL = r() * 100 < pel.PL, DN = r() * 100 < pel.DUN, pk = pangkat(p);
    var dPL = PL && pk >= CONFIG.PENGARUH.pangkatMin, dDN = DN && pk >= CONFIG.RUNDING.pangkatDUN && !!kawasan(p).dun;
    m.kerusi = { pru: jadualPRU(p), i: sekarang(p), PL: PL, DUN: DN, pemainPL: dPL, pemainDUN: dDN, peluang: pel };
    var t = 'Rundingan kerusi BN untuk PRU: ';
    if (!PL && !DN) { return t + 'BN tidak memberi PPP sebarang kerusi (peluang Parlimen ' + pel.PL + '%, DUN ' + pel.DUN + '%). Anda tidak boleh bertanding PRU ini atas tiket BN.' + (beku(p) ? ' PPP sedang dibekukan oleh ROS.' : ''); }
    var dapat = [PL ? '1 kerusi Parlimen' : null, DN ? '1 kerusi DUN' : null].filter(Boolean).join(' dan ');
    var anda = [dPL ? 'Parlimen' : null, dDN ? 'DUN' : null].filter(Boolean).join(' dan ');
    return t + 'BN memberi PPP ' + dapat + '. ' + (anda ? 'Kerusi ' + anda + ' itu di kawasan anda: anda boleh bertanding.' : 'Kerusi itu diberi kepada calon PPP lain kerana anda belum memegang jawatan yang cukup tinggi (Ketua Bahagian untuk Parlimen, Ketua Cawangan untuk DUN).');
  }

  /* ---------- Krisis Kepimpinan & ROS ---------- */
  function statusKrisis(p) { var m = st(p); return m.krisis && !m.krisis.selesai ? m.krisis : null; }
  function pilihKrisis(pilihan) {
    var p = S().loadPlayer(); if (!adalah(p)) { return { ok: false, ralat: 'Hanya untuk PPP.' }; }
    var m = st(p); if (!statusKrisis(p)) { return { ok: false, ralat: 'Tiada krisis kepimpinan.' }; }
    if (['presiden', 'pencabar', 'berkecuali'].indexOf(pilihan) < 0) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    m.krisis.pilihan = pilihan;
    var nm = { presiden: 'Sokong Presiden', pencabar: 'Sokong pencabar', berkecuali: 'Berkecuali' }[pilihan];
    var r = simpan(p, m, {}, { kira: true, tindakan: 'ppp_krisis', nama: 'Krisis kepimpinan PPP: ' + nm });
    return r.ok ? { ok: true, mesej: 'Pendirian anda direkodkan: ' + nm + '. Keputusan pertikaian diketahui pada ' + tb(m.krisis.sehingga) + '.' } : { ok: false, ralat: r.ralat };
  }
  function rayuanBeku(o) {
    var p = S().loadPlayer(); if (!adalah(p) || !beku(p)) { return { ok: false, ralat: 'PPP tidak dibekukan.' }; }
    var m = st(p); if (m.bekuRayu) { return { ok: false, ralat: 'Rayuan sudah dibuat.' }; }
    if ((Number(p.ap) || 0) < CONFIG.KRISIS.rayuanAP) { return { ok: false, ralat: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    var r = (o && o.rng) || S().rngBerbenih(String(p.id) + '|ppp|rayuan|' + sekarang(p)), jaya = r() < CONFIG.KRISIS.rayuanPeluang;
    m.bekuRayu = true; if (jaya) { m.beku = null; }
    var res = simpan(p, m, { ap: -CONFIG.KRISIS.rayuanAP }, { kira: true, tindakan: 'ppp_rayuan', nama: 'Rayuan pembekuan PPP ke Kementerian Dalam Negeri' + (jaya ? ' (diterima)' : ' (ditolak)') });
    return res.ok ? { ok: true, jaya: jaya, mesej: jaya ? 'Kementerian Dalam Negeri menerima rayuan PPP. Pembekuan dibatalkan dan aktiviti parti boleh diteruskan.' : 'Kementerian Dalam Negeri menolak rayuan PPP. Pembekuan kekal sehingga tempohnya tamat.' } : { ok: false, ralat: res.ralat };
  }
  function lucutPusat(p, m) {
    var J0 = J(); if (!J0) { return null; }
    var pusat = J0.getJawatan(p).filter(function (j) { return j.peringkat === 'pusat'; }); if (!pusat.length) { return null; }
    var patch = null; pusat.forEach(function (j) { var d = J0.cariDef(j.kod); if (d) { var pt = J0.terapkan(patch ? Object.assign({}, p, patch) : p, d, false); patch = Object.assign(patch || {}, pt); } });
    return patch;
  }
  function selesaiKrisis(p, m, r, ev, kes) {
    var k = m.krisis, C = CONFIG.KRISIS, pres = r() < C.presidenMenang, pil = k.pilihan || 'berkecuali', patch = null;
    k.selesai = true; k.presidenMenang = pres;
    if (pil === 'presiden') {
      if (pres) { kes.kesetiaan = { ajk: C.presiden.ajk }; m.pengaruh = clamp(m.pengaruh + C.presiden.pengaruh, 0, 100); ev.push('Presiden PPP mengekalkan jawatannya. Anda di pihak yang menang: sokongan AJK +' + C.presiden.ajk + ', Pengaruh dalam BN +' + C.presiden.pengaruh + '.'); }
      else { kes.reputasi = (kes.reputasi || 0) + C.presiden.kalahReputasi; patch = lucutPusat(p, m); ev.push('Pencabar menang dan menjadi Presiden PPP. Anda di pihak yang kalah: Reputasi ' + C.presiden.kalahReputasi + (patch ? ' dan jawatan Pusat anda dilucutkan.' : '.')); }
    } else if (pil === 'pencabar') {
      if (!pres) { m.lantikan = { jawatan: C.lantikan.jawatan, ip: C.lantikan.ip, tahun: p.tahun }; ev.push('Pencabar menang dan menjadi Presiden PPP. Sebagai penyokong awal, anda dilantik ' + C.lantikan.jawatan + ': IP +' + C.lantikan.ip + ' sebulan sehingga pemilihan seterusnya.'); }
      else { m.gantung = sekarang(p) + C.gantungBulan; ev.push('Presiden PPP mengekalkan jawatannya. Anda menyokong pencabar dan keahlian anda digantung ' + C.gantungBulan + ' bulan: tidak boleh bertanding atau melobi.'); }
    } else { m.pengaruh = clamp(m.pengaruh + C.berkecuali.pengaruh, 0, 100); ev.push((pres ? 'Presiden PPP mengekalkan jawatannya.' : 'Pencabar menang dan menjadi Presiden PPP.') + ' Anda berkecuali dan selamat, tetapi BN melihat PPP berpecah: Pengaruh dalam BN ' + C.berkecuali.pengaruh + '.'); }
    if (r() < C.beku) { m.beku = sekarang(p) + C.bekuBulan; m.bekuRayu = false; ev.push('Pertikaian berlarutan ke mahkamah dan ROS. ROS membekukan PPP selama ' + C.bekuBulan + ' bulan: tiada mesyuarat, pemilihan atau Tuntut Kerusi BN. Rayuan boleh dibuat ke Kementerian Dalam Negeri (kad PPP).'); }
    return patch;
  }

  /* ---------- Bulanan (rantaian kalendar) ---------- */
  function prosesBulan(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat || !adalah(p)) { return { peristiwa: ev }; }
    var r = (o && o.rng) || Sv.rngBerbenih(String(p.id) + '|ppp|bulan|' + sekarang(p)), m = st(p), kes = {}, now = sekarang(p), C = CONFIG, patch = null, msj = [];
    // 0. Putera: umur 30 ke atas bertukar ke Pemuda (ANDAIAN, seperti MIC)
    var H = modul('MyPolitikHayat', 'hayat.js'), umur = H && H.umurSemasa ? H.umurSemasa(p) : 0;
    if (p.sayap === 'putera' && umur >= 30) { patch = { sayap: 'pemuda' }; msj.push('Anda kini berumur ' + umur + ' tahun. Had umur Putera PPP ialah bawah 30 tahun (andaian permainan), jadi laluan sayap anda bertukar ke Pemuda.'); }
    // 1. jentera: keputusan selepas PRU berlangsung
    if (m.jentera && !m.jentera.selesai && pruTerakhir(p) >= m.jentera.i) {
      var bn = r() < C.PENGARUH.peluangBNMenang, naik = bn ? C.PENGARUH.jenteraMenang : C.PENGARUH.jenteraKalah; m.jentera.selesai = true;
      m.pengaruh = clamp(m.pengaruh + naik, 0, 100);
      msj.push('Keputusan PRU: calon BN di kawasan anda ' + (bn ? 'menang' : 'kalah') + '. Jentera PPP dihargai: Pengaruh dalam BN +' + naik + '.');
    }
    // 2. rundingan kerusi (12 bulan sebelum PRU, atau apabila PRU diisytiharkan lebih awal)
    var j = jadualPRU(p), sudah = kerusiSah(p);
    if (!sudah && (now >= j - C.RUNDING.bulanSebelum || pruAktif(p)) && pruTerakhir(p) < now) { msj.push(runding(p, m, r)); }
    // 3. krisis kepimpinan dalam tahun pemilihan
    var k = statusKrisis(p);
    if (k && now >= k.sehingga) { var pk0 = selesaiKrisis(p, m, r, msj, kes); if (pk0) { patch = Object.assign(patch || {}, pk0); } }
    else if (!k && adalahTahunPemilihan(p, p.tahun) && m.krisisTahun !== p.tahun && p.bulan <= 6) {
      m.krisisTahun = p.tahun;
      if (r() < C.KRISIS.peluang) { m.krisis = { tahun: p.tahun, i: now, sehingga: now + C.KRISIS.tempoh, pilihan: null }; msj.push('Krisis kepimpinan PPP: seorang pencabar mempertikaikan kedudukan Presiden dan kedua-dua pihak membawa kes ke ROS. Pilih pendirian anda dalam kad PPP sebelum ' + tb(m.krisis.sehingga) + '; jika tidak, anda dianggap berkecuali.'); }
    }
    // 4. pembekuan tamat
    if (typeof m.beku === 'number' && m.beku < now) { m.beku = null; m.bekuRayu = false; msj.push('Tempoh pembekuan PPP oleh ROS tamat. Mesyuarat, pemilihan dan Tuntut Kerusi BN boleh diteruskan.'); }
    if (typeof m.gantung === 'number' && m.gantung < now) { m.gantung = null; msj.push('Tempoh penggantungan keahlian anda tamat.'); }
    // 5. lantikan: IP bulanan
    var l = lantikanSemasa(p); if (l) { kes.ip = (kes.ip || 0) + l.ip; } else if (m.lantikan) { m.lantikan = null; }
    // 6. Pengaruh dalam BN susut perlahan ke arah nilai awal
    if (m.pengaruh > C.PENGARUH.awal) { m.pengaruh = Math.round(Math.max(C.PENGARUH.awal, m.pengaruh - C.PENGARUH.susut) * 10) / 10; }
    simpan(p, m, kes, null, patch);
    msj.forEach(function (t) { ev.push({ jenis: 'ppp', mesej: t }); });
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, adalah: adalah, kawasan: kawasan, sebabKuota: sebabKuota, ofset: ofset, lawan: lawan,
    adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya,
    sokonganBahagian: sokonganBahagian, ringkasPusat: ringkasPusat, bonusPusat: bonusPusat, lantikanSemasa: lantikanSemasa,
    beku: beku, gantungAktif: gantungAktif, halangan: halangan, pengaruh: function (p) { return st(p).pengaruh; }, kerusiSah: kerusiSah, peluangKerusi: peluangKerusi, jadualPRU: jadualPRU,
    statusLobi: statusLobi, lobi: lobi, statusJentera: statusJentera, jentera: jentera, statusKrisis: statusKrisis, pilihKrisis: pilihKrisis, rayuanBeku: rayuanBeku, prosesBulan: prosesBulan, tb: tb };
});
