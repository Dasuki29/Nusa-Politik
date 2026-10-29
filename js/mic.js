/* ==========================================================================
   Nusa Politik — js/mic.js   (v13.3)
   Peraturan khas MIC (Perlembagaan MIC, diterima Perhimpunan Agung ke-71 pada 24-9-2017, diluluskan ROS 2-1-2018).
   MIC dimainkan dalam mod penuh menggunakan enjin UMNO; modul ini hanya menambah perbezaan:
     - kawasan & kuota kerusi BN (js/mic-data.js): 10 Parlimen dan 20 DUN, disusun ikut peratus pengundi India
     - pemilihan parti setiap 3 tahun, bermula 2027 (Perkara 4.9, 4.20A)
     - semua jawatan tinggi mensyaratkan calon SEDANG menjadi Pengerusi Cawangan, dengan tempoh keahlian dan penggal (Perkara 34.3, 42A, 58.5, 59)
     - Pengerusi Bahagian maksimum 3 penggal berturut-turut, kemudian rehat 1 penggal (Perkara 34.4); Presiden maksimum 3 penggal (58.2A)
     - pemilihan Pusat oleh pegawai Cawangan seluruh negara (Perkara 58.2, 59A); Presiden perlu 250 penamaan (58.8)
     - Pengerusi Cawangan melantik pegawai Cawangan (Perkara 20.2.2a); Kongres Negeri dipilih (42.3A), Pengerusi Negeri dilantik Presiden (42.3)
     - lantikan Presiden (Perkara 46.15, 49); gantung oleh Presiden (61); Perhimpunan Agung Luar Biasa (73.1)
     - tidak hadir 3 mesyuarat (37.4, 85); yuran RM 4 setahun (12, 15.5); Cawangan mati (18); sumbangan wakil rakyat (94)
     - Putera (lelaki bawah 30): pada umur 30 bertukar ke Pemuda
   State: p.mic = { pusat:{kod:sokongan}, lantikan, lantikanTahun, mohonBulan, jelajahBulan, presidenSejak, tindakanLepas, absen, rayuan,
                    lantikPresiden, pegawai, negeri, negeriCuba, gantung, bulanKC, bulanAJK, bulanCWC, bulanKB, rehatKB, aktif, yuran }
   SEMUA ANGKA BERTANDA ANDAIAN IALAH ANDAIAN PERMAINAN (dipersetujui dalam mockup MIC v13).
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikMIC = api;
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
  function DATA() { return modul('MyPolitikMICData', 'mic-data.js') || { parlimen: {}, dun: {} }; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(t, b) { return (parseInt(t, 10) || 0) * 12 + (parseInt(b, 10) || 1); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  var CONFIG = {
    KUOTA_PARLIMEN: 10, KUOTA_DUN: 20,                       // ANDAIAN: kuota MIC dalam BN
    TAHUN_MULA: 2027, KITARAN_TAHUN: 3, BULAN_NEGERI: 7, BULAN_PUSAT: 9,   // ANDAIAN: tahun mula dan bulan Kongres Negeri / Perhimpunan Agung
    KEAHLIAN: { bahagian: 60, pusat: 60, timbalan: 120, presiden: 120, ajkCawangan: 36 },   // bulan (Perkara 34.3, 59, 58.5)
    PRESIDEN: { penggalKC: 108, penggalCWC: 72, penamaan: 250, faktorPenamaan: 0.1 },      // 3 penggal Pengerusi Cawangan, 2 penggal CWC (bulan); 250 penamaan
    HAD_PRESIDEN_BULAN: 108,                                 // Perkara 58.2A (3 penggal)
    HAD_KB: { bulan: 100, rehat: 36 },                       // Perkara 34.4: 3 penggal berturut-turut, rehat 1 penggal
    PUSAT: { sendiri: 60, lain: [30, 45], bonusSkala: 0.3, jelajahAP: 2, jelajahMYR: 1500, jelajahNaik: 8, pengundiCawangan: 10, cwc: 60 },
    PEGAWAI: { setia: { pusat: 5, ajk: -1 }, pencabar: { ajk: 5 } },
    LANTIKAN: [
      { kod: 'setiausaha_agung', jawatan: 'Setiausaha Agung', ip: 10, pusat: 6, pangkatMin: 8 },
      { kod: 'bendahari_agung', jawatan: 'Bendahari Agung', ip: 8, pusat: 5, pangkatMin: 8 },
      { kod: 'ketua_penerangan', jawatan: 'Ketua Penerangan', ip: 8, pusat: 5, pangkatMin: 8 },
      { kod: 'ahli_cwc_lantikan', jawatan: 'Ahli CWC (Lantikan Presiden)', ip: 6, pusat: 4, pangkatMin: 7, cwc: true },
      { kod: 'pengerusi_negeri', jawatan: 'Pengerusi Kongres Negeri', ip: 10, pusat: 6, perluNegeri: true, cwc: true }
    ],
    MOHON: { ap: 2, faktor: 0.8, dekatLalai: 30 },
    NEGERI: { ap: 1, faktor: 1.3, min: 10, maks: 90 },
    ABSEN: { had: 3, rayuanAP: 1, rayuanPeluang: 0.7 },      // Perkara 37.4, 85
    GANTUNG: { dekat: 20, peluang: 0.3, bulan: 6, rayuanAP: 1, rayuanPeluang: 0.7 },   // Perkara 61, 14.2.1
    EGM: { sokongan: 25, peluang: 0.10, kadar: 0.03, maks: 0.6 },                       // Perkara 73.1
    YURAN: { rm: 4, bulan: 11 },                             // Perkara 12, 15.5
    MATI: { aktifMin: 3, reputasi: -3, akarUmbi: -5 },       // Perkara 18
    SUMBANGAN: 500                                           // Perkara 94 (RM sebulan)
  };

  function adalah(p) { return !!(p && p.parti === 'MIC'); }
  function st(p) {
    var m = p && p.mic && typeof p.mic === 'object' ? p.mic : {};
    if (!m.pusat || typeof m.pusat !== 'object') { m.pusat = {}; }
    return m;
  }
  function simpan(p, m, kesan, log, patchTambah) {
    var patch = { mic: m }; if (patchTambah) { for (var k in patchTambah) { patch[k] = patchTambah[k]; } }
    return S().applyEffects(kesan || {}, { kiraTindakan: !!(log && log.kira), patch: patch, log: log && log.nama ? { tindakan: log.tindakan || 'mic', nama: log.nama, peringkat: log.peringkat || 'ahli' } : undefined });
  }
  function pegang(p, kod) { var J0 = J(); return !!(J0 && J0.pegang && J0.pegang(p, kod)); }
  function pangkat(p) { var J0 = J(); return J0 ? Math.max(J0.pangkatTertinggi(p, 'utama'), Number(p.pangkatUtamaLalu) || 0) : 0; }

  /* ---------- Kawasan & kuota ---------- */
  function kodPL(p) { var k = p && p.kod && p.kod.parlimen; return k ? 'P.' + String(parseInt(k, 10)).padStart(3, '0') : null; }
  function kawasan(p) {
    var d = DATA(), kp = kodPL(p), pl = kp ? d.parlimen[kp] : null, dn = null;
    if (pl && p.kod && p.kod.dun && parseInt(p.kod.dun, 10) > 0) { var kd = pl.ng + '_N.' + String(parseInt(p.kod.dun, 10)).padStart(2, '0'); dn = d.dun[kd] ? Object.assign({ kod: kd }, d.dun[kd]) : null; }
    return { parlimen: pl ? Object.assign({ kod: kp }, pl) : null, dun: dn,
      kuotaPL: !!(pl && pl.r <= CONFIG.KUOTA_PARLIMEN), kuotaDUN: !!(dn && dn.r <= CONFIG.KUOTA_DUN), bilBahagian: Object.keys(d.parlimen).length };
  }
  /** Ofset kekuatan kerusi PRU (ANDAIAN): kerusi MIC sentiasa campuran; semakin rendah peratus India, semakin bergantung pada undi BN kaum lain. */
  function ofset(p, jenis) {
    var k = kawasan(p), x = jenis === 'DUN' ? k.dun : k.parlimen;
    if (!x) { return 0; }
    return x.i >= 20 ? 0 : x.i >= 15 ? -1 : x.i >= 10 ? -2 : -4;
  }
  function lawan(p, jenis) { var k = kawasan(p), x = jenis === 'DUN' ? k.dun : k.parlimen; return x && x.c >= 40 ? ['DAP', 'PKR'] : ['PKR', 'DAP']; }

  /* ---------- Kitaran pemilihan 3 tahun (Perkara 4.9, 4.20A) ---------- */
  function adalahTahunPemilihan(p, tahun) { var t = parseInt(tahun, 10); return t >= CONFIG.TAHUN_MULA && (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN === 0; }
  function tahunSeterusnya(p, tahun) { var t = parseInt(tahun, 10); if (t <= CONFIG.TAHUN_MULA) { return CONFIG.TAHUN_MULA; } var b = (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN; return b === 0 ? t : t + CONFIG.KITARAN_TAHUN - b; }
  function tahunLepas(p, tahun) { var t = parseInt(tahun, 10); return t < CONFIG.TAHUN_MULA ? null : t - ((t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN); }

  function bulanKeahlian(p) { var k = p && p.keahlian; if (!k) { return 999; } return Math.max(0, idx(p.tahun, p.bulan) - idx(k.sejakTahun, k.sejakBulan)); }
  function thn(b) { return Math.round(b / 12); }

  /* ---------- Syarat bertanding (dipanggil jawatan.semakKelayakan) ---------- */
  var BAHAGIAN_UTAMA = ['ketua_bahagian', 'timbalan_ketua_bahagian', 'naib_ketua_bahagian'];
  function gantungAktif(p) { var m = st(p); return typeof m.gantung === 'number' && m.gantung >= idx(p.tahun, p.bulan); }
  /** Pulang { terbuka:false, sebab } jika syarat MIC gagal, atau null jika lulus (semakan enjin diteruskan). */
  function semakSyarat(p, d, pertahan) {
    if (!adalah(p) || !d) { return null; }
    var m = st(p), bk = bulanKeahlian(p), C = CONFIG, tutup = function (s) { return { terbuka: false, sebab: s }; };
    if (gantungAktif(p)) { return tutup('Keahlian anda digantung oleh Presiden (Perkara 61) sehingga ' + Math.floor((m.gantung - 1) / 12) + ' bulan ' + (((m.gantung - 1) % 12) + 1) + '. Anda tidak boleh bertanding.'); }
    if (d.kumpulan !== 'utama') { return null; }
    var kc = pegang(p, 'ketua_cawangan'), perluKC = 'Perlu sedang menjadi Pengerusi Cawangan';
    if (BAHAGIAN_UTAMA.indexOf(d.kod) >= 0) {
      if (!kc) { return tutup(perluKC + ' dalam Bahagian ini (Perkara 34.3).'); }
      if (bk < C.KEAHLIAN.bahagian) { return tutup('Perlu ahli sekurang-kurangnya ' + thn(C.KEAHLIAN.bahagian) + ' tahun (Perkara 34.3). Anda ahli ' + bk + ' bulan.'); }
      if ((m.bulanAJK || 0) < C.KEAHLIAN.ajkCawangan) { return tutup('Perlu sekurang-kurangnya 3 tahun sebagai AJK Cawangan (Perkara 34.3). Anda ' + (m.bulanAJK || 0) + ' bulan.'); }
      if (d.kod === 'ketua_bahagian' && (m.bulanKB || 0) >= C.HAD_KB.bulan) { return tutup('Anda sudah 3 penggal berturut-turut sebagai Pengerusi Bahagian. Rehat 1 penggal sebelum bertanding semula (Perkara 34.4).'); }
      return null;
    }
    if (d.peringkat === 'pusat') {
      if (!kc) { return tutup(perluKC + ' untuk bertanding jawatan Pusat (Perkara 58.5, 59).'); }
      var perlu = d.kod === 'presiden' ? C.KEAHLIAN.presiden : d.kod === 'timbalan_presiden' ? C.KEAHLIAN.timbalan : C.KEAHLIAN.pusat;
      if (bk < perlu) { return tutup('Perlu ahli sekurang-kurangnya ' + thn(perlu) + ' tahun (Perkara ' + (d.kod === 'presiden' ? '58.5' : '59') + '). Anda ahli ' + bk + ' bulan.'); }
      if (d.kod === 'presiden' && !pertahan) {
        if ((m.bulanKC || 0) < C.PRESIDEN.penggalKC) { return tutup('Perlu 3 penggal sebagai Pengerusi Cawangan (Perkara 58.5). Anda ' + Math.floor((m.bulanKC || 0) / 12) + ' tahun.'); }
        if ((m.bulanCWC || 0) < C.PRESIDEN.penggalCWC) { return tutup('Perlu 2 penggal penuh sebagai ahli CWC (Perkara 58.5). Anda ' + Math.floor((m.bulanCWC || 0) / 12) + ' tahun.'); }
        var pn = penamaan(p); if (pn < C.PRESIDEN.penamaan) { return tutup('Perlu ' + C.PRESIDEN.penamaan + ' penamaan daripada Pengerusi Cawangan atau ahli CWC (Perkara 58.8). Anda ada ' + pn + '.'); }
      }
      return null;
    }
    return null;
  }

  /* ---------- Pemilihan Pusat oleh pegawai Cawangan (Perkara 58.2, 59A) ---------- */
  function sokonganBahagian(p) {
    var d = DATA(), m = st(p), own = kodPL(p), out = {};
    Object.keys(d.parlimen).forEach(function (k) {
      var v = m.pusat[k];
      if (typeof v !== 'number') { var c = CONFIG.PUSAT.lain; v = k === own ? CONFIG.PUSAT.sendiri : c[0] + (hash(String(p.id) + '|mic|' + k) % (c[1] - c[0] + 1)); }
      out[k] = v;
    });
    return out;
  }
  /** Bilangan pengundi daripada sesebuah Bahagian: 6 pegawai + 4 ketua sayap bagi setiap Cawangan. */
  function perwakilan(kod) { var x = DATA().parlimen[kod]; return (x && x.b ? x.b : 5) * CONFIG.PUSAT.pengundiCawangan; }
  function ringkasPusat(p) {
    var sb = sokonganBahagian(p), d = DATA(), ks = Object.keys(sb), jum = 0, condong = 0, pengundi = 0;
    ks.forEach(function (k) { var w = perwakilan(k); pengundi += w; jum += sb[k] * w; if (sb[k] >= 50) { condong++; } });
    var purata = pengundi ? jum / pengundi : 0; pengundi += CONFIG.PUSAT.cwc;
    return { purata: Math.round(purata * 10) / 10, condong: condong, bilBahagian: ks.length, pengundi: pengundi, sokongUndi: Math.round(pengundi * purata / 100),
      senarai: ks.map(function (k) { return { kod: k, nama: d.parlimen[k].n, sokongan: Math.round(sb[k]), wakil: perwakilan(k), cawangan: d.parlimen[k].b }; }).sort(function (a, b) { return a.sokongan - b.sokongan || a.nama.localeCompare(b.nama); }) };
  }
  /** Penamaan Presiden: Pengerusi Cawangan yang menyokong anda (Perkara 58.7, 58.8). */
  function penamaan(p) {
    var sb = sokonganBahagian(p), d = DATA(), n = 0;
    Object.keys(sb).forEach(function (k) { n += (d.parlimen[k].b || 0) * sb[k] / 100 * CONFIG.PRESIDEN.faktorPenamaan; });
    return Math.round(n);
  }
  function bonusPusat(p) {
    if (!adalah(p)) { return 0; }
    var l = lantikanSemasa(p), b = (ringkasPusat(p).purata - 40) * CONFIG.PUSAT.bonusSkala + (l ? l.pusat : 0);
    return Math.round(b * 10) / 10;
  }
  function statusJelajah(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk MIC.' }; }
    if (!pegang(p, 'ketua_cawangan')) { return { boleh: false, sebab: 'Perlu menjadi Pengerusi Cawangan untuk membina rangkaian Pengerusi Cawangan.' }; }
    var m = st(p); if (m.jelajahBulan === idx(p.tahun, p.bulan)) { return { boleh: false, sebab: 'Rangkaian sudah dibina bulan ini.' }; }
    if ((Number(p.ap) || 0) < CONFIG.PUSAT.jelajahAP) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < CONFIG.PUSAT.jelajahMYR) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function jelajah(kod) {
    var p = S().loadPlayer(), s0 = statusJelajah(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var d = DATA(); if (!d.parlimen[kod]) { return { ok: false, ralat: 'Bahagian tidak sah.' }; }
    var m = st(p), sb = sokonganBahagian(p), baru = clamp(sb[kod] + CONFIG.PUSAT.jelajahNaik, 0, 100), pn0 = penamaan(p);
    m.pusat[kod] = baru; m.jelajahBulan = idx(p.tahun, p.bulan);
    var r = simpan(p, m, { ap: -CONFIG.PUSAT.jelajahAP, myr: -CONFIG.PUSAT.jelajahMYR }, { kira: true, tindakan: 'mic_rangkaian', nama: 'Rangkaian Pengerusi Cawangan ' + d.parlimen[kod].n });
    if (!r.ok) { return { ok: false, ralat: r.ralat }; }
    var pn1 = penamaan(S().loadPlayer());
    return { ok: true, mesej: 'Rangkaian Pengerusi Cawangan di ' + d.parlimen[kod].n + ': sokongan pegawai Cawangan ' + Math.round(sb[kod]) + '% → ' + Math.round(baru) + '%. Penamaan Presiden ' + pn0 + ' → ' + pn1 + '.' };
  }

  /* ---------- Lantik pegawai Cawangan (Perkara 20.2.2a) ---------- */
  function statusPegawai(p) {
    if (!adalah(p) || !pegang(p, 'ketua_cawangan')) { return { boleh: false, sebab: 'Hanya Pengerusi Cawangan.' }; }
    var m = st(p), L = tahunLepas(p, p.tahun) || p.tahun;
    if (m.pegawai && m.pegawai.tahun === L) { return { boleh: false, sebab: 'Pegawai Cawangan penggal ini sudah dilantik.', sudah: m.pegawai.pilihan }; }
    return { boleh: true, sebab: '' };
  }
  function lantikPegawai(pilihan) {
    var p = S().loadPlayer(), s0 = statusPegawai(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    if (pilihan !== 'setia' && pilihan !== 'pencabar') { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    var m = st(p), C = CONFIG.PEGAWAI, own = kodPL(p), kes;
    m.pegawai = { tahun: tahunLepas(p, p.tahun) || p.tahun, pilihan: pilihan };
    if (pilihan === 'setia') { if (own) { m.pusat[own] = clamp(sokonganBahagian(p)[own] + C.setia.pusat, 0, 100); } kes = { kesetiaan: { ajk: C.setia.ajk } }; }
    else { kes = { kesetiaan: { ajk: C.pencabar.ajk } }; }
    var r = simpan(p, m, kes, { kira: true, tindakan: 'mic_pegawai', nama: 'Lantik pegawai Cawangan (' + (pilihan === 'setia' ? 'penyokong setia' : 'pencabar') + ')' });
    return r.ok ? { ok: true, mesej: pilihan === 'setia' ? 'Anda melantik penyokong setia sebagai Setiausaha, Penolong Setiausaha, Bendahari dan Pegawai Penerangan. Undi pegawai Cawangan anda dalam pemilihan Presiden terjamin; sokongan Bahagian sendiri +' + C.setia.pusat + '%, sokongan AJK ' + C.setia.ajk + '.' : 'Anda melantik pencabar dalaman sebagai pegawai Cawangan. AJK lebih bersatu: sokongan AJK +' + C.pencabar.ajk + '.' } : { ok: false, ralat: r.ralat };
  }

  /* ---------- Kongres Negeri (Perkara 42.3A, 42A) ---------- */
  function sokonganNegeri(p) {
    var sb = sokonganBahagian(p), d = DATA(), own = kodPL(p), ng = own && d.parlimen[own] ? d.parlimen[own].ng : null, jum = 0, w = 0;
    Object.keys(sb).forEach(function (k) { if (d.parlimen[k].ng === ng) { var b = d.parlimen[k].b || 1; jum += sb[k] * b; w += b; } });
    return w ? jum / w : 0;
  }
  /** Ahli Kongres Negeri sehingga pemilihan Kongres Negeri berikutnya (bulan 7 tahun pemilihan seterusnya). */
  function ahliNegeri(p) {
    var m = st(p), L = tahunLepas(p, p.tahun); if (!m.negeri || !m.negeri.tahun || !L) { return false; }
    if (m.negeri.tahun === L) { return L < p.tahun || p.bulan >= CONFIG.BULAN_NEGERI; }
    return m.negeri.tahun === L - CONFIG.KITARAN_TAHUN && L === p.tahun && p.bulan < CONFIG.BULAN_NEGERI;
  }
  function statusNegeri(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk MIC.' }; }
    var m = st(p);
    if (ahliNegeri(p)) { return { boleh: false, sebab: 'Anda ahli Kongres Negeri penggal ini.', ahli: true }; }
    if (!adalahTahunPemilihan(p, p.tahun) || p.bulan !== CONFIG.BULAN_NEGERI) { return { boleh: false, sebab: 'Pemilihan Kongres Negeri pada bulan ' + CONFIG.BULAN_NEGERI + ' (Julai) tahun pemilihan (' + tahunSeterusnya(p, p.tahun + (adalahTahunPemilihan(p, p.tahun) && p.bulan > CONFIG.BULAN_NEGERI ? 1 : 0)) + ').' }; }
    if (m.negeriCuba === p.tahun) { return { boleh: false, sebab: 'Anda sudah bertanding Kongres Negeri tahun ini.' }; }
    if (gantungAktif(p)) { return { boleh: false, sebab: 'Keahlian anda digantung (Perkara 61).' }; }
    if (!pegang(p, 'ketua_cawangan')) { return { boleh: false, sebab: 'Perlu sedang menjadi Pengerusi Cawangan (Perkara 42A).' }; }
    if (bulanKeahlian(p) < 60) { return { boleh: false, sebab: 'Perlu ahli sekurang-kurangnya 5 tahun (Perkara 42A).' }; }
    if (pangkat(p) < 4 && !(m.bulanCWC > 0)) { return { boleh: false, sebab: 'Perlu sekurang-kurangnya 1 penggal dalam Jawatankuasa Bahagian atau CWC (Perkara 42A).' }; }
    if ((Number(p.ap) || 0) < CONFIG.NEGERI.ap) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    return { boleh: true, sebab: '', peluang: Math.round(clamp(sokonganNegeri(p) * CONFIG.NEGERI.faktor, CONFIG.NEGERI.min, CONFIG.NEGERI.maks)) };
  }
  function bertandingNegeri(o) {
    var p = S().loadPlayer(), s0 = statusNegeri(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var r = (o && o.rng) || S().rngBerbenih(String(p.id) + '|mic|negeri|' + p.tahun), m = st(p), jaya = r() < s0.peluang / 100;
    m.negeriCuba = p.tahun; if (jaya) { m.negeri = { tahun: p.tahun }; }
    var res = simpan(p, m, jaya ? { ap: -CONFIG.NEGERI.ap, ip: 15, reputasi: 1 } : { ap: -CONFIG.NEGERI.ap }, { kira: true, tindakan: 'mic_negeri', nama: 'Pemilihan Kongres Negeri' + (jaya ? ' (menang)' : ' (kalah)') });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    return { ok: true, jaya: jaya, mesej: jaya ? 'Anda dipilih sebagai salah seorang daripada 10 ahli Kongres Negeri oleh pegawai Cawangan negeri anda. IP +15. Kini anda boleh memohon lantikan Pengerusi Negeri daripada Presiden.' : 'Anda tidak terpilih ke Kongres Negeri. Bina sokongan pegawai Cawangan di negeri anda untuk penggal akan datang.' };
  }

  /* ---------- Lantikan Presiden (Perkara 42.3, 46.15, 49) ---------- */
  function adalahPresiden(p) { return pegang(p, 'presiden'); }
  function lantikanSemasa(p) {
    var m = st(p); if (!m.lantikan) { return null; }
    var def = CONFIG.LANTIKAN.filter(function (x) { return x.kod === m.lantikan; })[0];
    return def ? Object.assign({ tahun: m.lantikanTahun }, def) : null;
  }
  function dekat(p) { var bp = p && p.negeriBP; return bp && typeof bp.dekat === 'number' ? bp.dekat : CONFIG.MOHON.dekatLalai; }
  function statusMohon(p, kod) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk MIC.' }; }
    if (adalahPresiden(p)) { return { boleh: false, sebab: 'Anda Presiden: anda yang melantik.' }; }
    var def = CONFIG.LANTIKAN.filter(function (x) { return x.kod === kod; })[0]; if (!def) { return { boleh: false, sebab: 'Jawatan tidak sah.' }; }
    var m = st(p); if (m.lantikan) { return { boleh: false, sebab: 'Anda sudah memegang lantikan ' + lantikanSemasa(p).jawatan + '.' }; }
    if (def.perluNegeri && !ahliNegeri(p)) { return { boleh: false, sebab: 'Perlu dipilih ke Kongres Negeri dahulu (Perkara 42.3).' }; }
    if (def.pangkatMin && pangkat(p) < def.pangkatMin) { return { boleh: false, sebab: def.pangkatMin >= 8 ? 'Dilantik daripada ahli CWC (Perkara 49).' : 'Perlu Pengerusi Bahagian atau lebih.' }; }
    if (gantungAktif(p)) { return { boleh: false, sebab: 'Keahlian anda digantung (Perkara 61).' }; }
    if (m.mohonBulan === idx(p.tahun, p.bulan)) { return { boleh: false, sebab: 'Satu permohonan sebulan.' }; }
    if ((Number(p.ap) || 0) < CONFIG.MOHON.ap) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    return { boleh: true, sebab: '', peluang: Math.round(clamp(dekat(p) * CONFIG.MOHON.faktor, 5, 90)) };
  }
  function mohon(kod, o) {
    var p = S().loadPlayer(), s0 = statusMohon(p, kod); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var r = (o && o.rng) || S().rngBerbenih(String(p.id) + '|mic|mohon|' + idx(p.tahun, p.bulan)), m = st(p), def = CONFIG.LANTIKAN.filter(function (x) { return x.kod === kod; })[0];
    var jaya = r() < s0.peluang / 100; m.mohonBulan = idx(p.tahun, p.bulan);
    if (jaya) { m.lantikan = kod; m.lantikanTahun = p.tahun; }
    var res = simpan(p, m, { ap: -CONFIG.MOHON.ap }, { kira: true, tindakan: 'mic_mohon', nama: 'Mohon lantikan ' + def.jawatan + (jaya ? ' (dilantik)' : ' (tidak dilantik)') });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    return { ok: true, jaya: jaya, mesej: jaya ? 'Presiden melantik anda sebagai ' + def.jawatan + '. IP +' + def.ip + ' sebulan dan sokongan dalam pemilihan Pusat bertambah.' + (def.cwc ? ' Anda kini ahli CWC.' : '') : 'Presiden belum bersedia melantik anda sebagai ' + def.jawatan + '. Tingkatkan kedekatan dengan Presiden dan cuba lagi bulan depan.' };
  }
  function statusLantikPresiden(p) {
    if (!adalah(p) || !adalahPresiden(p)) { return { boleh: false, sebab: '' }; }
    var m = st(p), L = tahunLepas(p, p.tahun) || p.tahun;
    if (m.lantikPresiden === L) { return { boleh: false, sebab: 'Lantikan penggal ini sudah dibuat.', sudah: m.lantikPresidenPilihan }; }
    return { boleh: true, sebab: '' };
  }
  function lantikPresiden(pilihan) {
    var p = S().loadPlayer(), s0 = statusLantikPresiden(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab || 'Hanya Presiden MIC.' }; }
    if (pilihan !== 'setia' && pilihan !== 'pencabar') { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    var m = st(p); m.lantikPresiden = tahunLepas(p, p.tahun) || p.tahun; m.lantikPresidenPilihan = pilihan;
    var kes = pilihan === 'setia' ? { kesetiaan: { ajk: 4 } } : { kesetiaan: { perwakilan: 4, ajk: -2 } };
    var r = simpan(p, m, kes, { tindakan: 'mic_lantik', nama: 'Lantik Setiausaha Agung dan Pengerusi Negeri (' + (pilihan === 'setia' ? 'penyokong setia' : 'pencabar dalaman') + ')' });
    return r.ok ? { ok: true, mesej: pilihan === 'setia' ? 'Anda melantik penyokong setia sebagai Setiausaha Agung dan Pengerusi Negeri. Sokongan AJK +4.' : 'Anda melantik pencabar dalaman sebagai Setiausaha Agung dan sebahagian Pengerusi Negeri untuk menyatukan parti. Sokongan perwakilan +4, sokongan AJK -2.' } : { ok: false, ralat: r.ralat };
  }

  /* ---------- Rayuan (tidak hadir: Perkara 37.4, 85; gantung: Perkara 61.3) ---------- */
  function rayuan(o) {
    var p = S().loadPlayer(); if (!adalah(p)) { return { ok: false, ralat: 'Hanya untuk MIC.' }; }
    var m = st(p); if (!m.rayuan) { return { ok: false, ralat: 'Tiada notis ketidakhadiran.' }; }
    if ((Number(p.ap) || 0) < CONFIG.ABSEN.rayuanAP) { return { ok: false, ralat: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    var r = (o && o.rng) || S().rngBerbenih(String(p.id) + '|mic|rayuan|' + idx(p.tahun, p.bulan)), jaya = r() < CONFIG.ABSEN.rayuanPeluang, kod = m.rayuan.kod, nama = m.rayuan.jawatan, fasal = m.rayuan.fasal || '85';
    m.rayuan = null; m.absen = 0;
    if (jaya) { var r1 = simpan(p, m, { ap: -CONFIG.ABSEN.rayuanAP }, { kira: true, tindakan: 'mic_rayuan', nama: 'Rayuan ketidakhadiran diterima' }); return r1.ok ? { ok: true, jaya: true, mesej: 'Penjelasan anda diterima. Anda kekal sebagai ' + nama + '.' } : { ok: false, ralat: r1.ralat }; }
    var J0 = J(), d = J0 && J0.cariDef(kod), patch = d ? J0.terapkan(p, d, false) : {}; patch.mic = m;
    var r2 = S().applyEffects({ ap: -CONFIG.ABSEN.rayuanAP }, { kiraTindakan: true, patch: patch, log: { tindakan: 'mic_rayuan', nama: 'Rayuan ketidakhadiran ditolak: ' + nama, peringkat: 'ahli' } });
    return r2.ok ? { ok: true, jaya: false, mesej: 'Penjelasan anda ditolak. Anda dianggap meletak jawatan ' + nama + ' kerana tidak hadir 3 mesyuarat berturut-turut (Perkara ' + fasal + ').' } : { ok: false, ralat: r2.ralat };
  }
  function rayuanGantung(o) {
    var p = S().loadPlayer(); if (!adalah(p) || !gantungAktif(p)) { return { ok: false, ralat: 'Tiada penggantungan.' }; }
    var m = st(p); if (m.gantungRayu) { return { ok: false, ralat: 'Rayuan sudah dibuat.' }; }
    if ((Number(p.ap) || 0) < CONFIG.GANTUNG.rayuanAP) { return { ok: false, ralat: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    var r = (o && o.rng) || S().rngBerbenih(String(p.id) + '|mic|rayuanGantung|' + idx(p.tahun, p.bulan)), jaya = r() < CONFIG.GANTUNG.rayuanPeluang;
    m.gantungRayu = true; if (jaya) { m.gantung = null; }
    var res = simpan(p, m, { ap: -CONFIG.GANTUNG.rayuanAP }, { kira: true, tindakan: 'mic_rayuan_gantung', nama: 'Rayuan penggantungan ke CWC' + (jaya ? ' (diterima)' : ' (ditolak)') });
    return res.ok ? { ok: true, jaya: jaya, mesej: jaya ? 'CWC menerima rayuan anda (Perkara 61.4). Penggantungan dibatalkan.' : 'CWC menolak rayuan anda. Penggantungan kekal.' } : { ok: false, ralat: res.ralat };
  }

  function jawatanTertinggi(p, peringkat) {
    var J0 = J(), l = J0 ? J0.getJawatan(p) : [];
    return l.filter(function (j) { return !peringkat || peringkat.indexOf(j.peringkat) >= 0; }).sort(function (a, b) { return (b.pangkat || 0) - (a.pangkat || 0); })[0] || null;
  }
  function lucut(p, j, kes, nama) {
    var J0 = J(), d = J0 && J0.cariDef(j.kod); if (!d) { return null; }
    var patch = J0.terapkan(p, d, false); patch.mic = st(p);
    return S().applyEffects(kes || {}, { kiraTindakan: false, patch: patch, log: { tindakan: 'mic_lucut', nama: nama, peringkat: 'ahli' } });
  }
  function umur(p) { var H = modul('MyPolitikHayat', 'hayat.js'); if (H && H.umurSemasa) { return H.umurSemasa(p); } return p && p.demografik ? (parseInt(p.demografik.umur, 10) || 0) + Math.max(0, (parseInt(p.tahun, 10) || 2026) - 2026) : 0; }

  /* ---------- Bulanan (rantaian kalendar) ---------- */
  function prosesBulan(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat || !adalah(p)) { return { peristiwa: ev }; }
    var r = (o && o.rng) || Sv.rngBerbenih(String(p.id) + '|mic|bulan|' + idx(p.tahun, p.bulan)), m = st(p), kes = {}, sekarang = idx(p.tahun, p.bulan), patchT = null, C = CONFIG;
    // 0. Putera: umur 30 ke atas bertukar ke Pemuda (Perkara 4.18.5)
    if (p.sayap === 'putera' && umur(p) >= 30) { patchT = { sayap: 'pemuda' }; ev.push({ jenis: 'mic', mesej: 'Anda kini berumur ' + umur(p) + ' tahun. Had umur Putera ialah bawah 30 tahun (Perkara 4.18.5), jadi laluan sayap anda bertukar ke Pemuda. Jawatan Putera dilepaskan pada semakan penggal seterusnya.' }); }
    // 1. kiraan penggal (bulan memegang jawatan)
    var J0 = J(), kc = pegang(p, 'ketua_cawangan'), ajkC = J0 ? J0.getJawatan(p).some(function (j) { return j.peringkat === 'cawangan' && j.kumpulan === 'utama'; }) : false, l0 = lantikanSemasa(p);
    if (kc) { m.bulanKC = (m.bulanKC || 0) + 1; }
    if (ajkC) { m.bulanAJK = (m.bulanAJK || 0) + 1; }
    if ((J0 && J0.pangkatTertinggi(p, 'utama') >= 8) || (l0 && l0.cwc)) { m.bulanCWC = (m.bulanCWC || 0) + 1; }
    if (pegang(p, 'ketua_bahagian')) { m.bulanKB = (m.bulanKB || 0) + 1; m.rehatKB = 0; } else { m.rehatKB = (m.rehatKB || 0) + 1; if (m.rehatKB >= C.HAD_KB.rehat) { m.bulanKB = 0; } }
    var aktifBulan = (p.bilTindakan || 0) > (typeof m.tindakanLepas === 'number' ? m.tindakanLepas : 1e9);
    if (!m.aktif || m.aktif.tahun !== p.tahun) { m.aktif = { tahun: p.tahun, bil: 0 }; }
    if (aktifBulan) { m.aktif.bil++; }
    // 2. rayuan tidak dibuat dalam tempoh: kerusi hilang
    if (m.rayuan && m.rayuan.sehingga < sekarang) {
      var jr = { kod: m.rayuan.kod, jawatan: m.rayuan.jawatan }, fs = m.rayuan.fasal; m.rayuan = null; m.absen = 0;
      var rl = lucut(p, jr, {}, 'Dianggap meletak jawatan (tidak hadir 3 mesyuarat): ' + jr.jawatan);
      if (rl && rl.ok) { ev.push({ jenis: 'mic', mesej: 'Anda tidak memberi penjelasan dalam tempoh. Anda dianggap meletak jawatan ' + jr.jawatan + ' kerana tidak hadir 3 mesyuarat berturut-turut (Perkara ' + fs + ').' + (jr.kod === 'ketua_cawangan' ? ' Timbalan Pengerusi mengambil alih, dan anda hilang kelayakan untuk jawatan tinggi.' : '') }); }
      p = Sv.loadPlayer(); m = st(p);
    }
    // 3. kehadiran: bulan tanpa sebarang tindakan = tidak hadir mesyuarat (Pengerusi Cawangan: mesyuarat Bahagian, Perkara 37.4)
    var adaJawatan = !!jawatanTertinggi(p, ['cawangan', 'bahagian', 'pusat']);
    if (typeof m.tindakanLepas === 'number' && adaJawatan) { m.absen = aktifBulan ? 0 : (m.absen || 0) + 1; } else { m.absen = 0; }
    m.tindakanLepas = p.bilTindakan || 0;
    if (m.absen >= C.ABSEN.had && !m.rayuan && adaJawatan) {
      var ja = pegang(p, 'ketua_cawangan') ? { kod: 'ketua_cawangan', jawatan: 'Ketua Cawangan' } : jawatanTertinggi(p, ['cawangan', 'bahagian', 'pusat']), fasal = ja.kod === 'ketua_cawangan' ? '37.4' : '85';
      m.rayuan = { kod: ja.kod, jawatan: ja.jawatan, sehingga: sekarang, fasal: fasal };
      ev.push({ jenis: 'mic', mesej: 'Anda tidak hadir 3 mesyuarat berturut-turut (tiada tindakan selama 3 bulan). Anda akan dianggap meletak jawatan ' + ja.jawatan + ' kecuali memberi penjelasan bulan ini (Perkara ' + fasal + ').' });
    }
    // 4. gantung oleh Presiden (Perkara 61, 14.2.1): kenyataan media yang memudaratkan + kedekatan rendah
    if (typeof m.gantung === 'number' && m.gantung < sekarang) { m.gantung = null; m.gantungRayu = false; ev.push({ jenis: 'mic', mesej: 'Tempoh penggantungan keahlian anda tamat. Hak keahlian anda dipulihkan.' }); }
    var mudarat = (p.log || []).some(function (e) { return e && e.tahun === p.tahun && e.bulan === p.bulan && ((e.tindakan === 'tular_sidang' && /silap cakap/.test(e.nama || '')) || (e.tindakan === 'tular_kontra' && /gagal/.test(e.nama || ''))); });
    if (mudarat && !adalahPresiden(p) && !gantungAktif(p) && dekat(p) < C.GANTUNG.dekat && r() < C.GANTUNG.peluang) {
      m.gantung = sekarang + C.GANTUNG.bulan; m.gantungRayu = false;
      ev.push({ jenis: 'mic', mesej: 'Presiden menggantung keahlian anda selama ' + C.GANTUNG.bulan + ' bulan kerana kenyataan media yang memudaratkan parti (Perkara 14.2.1, 61.1). Anda tidak boleh bertanding atau memohon lantikan. Rayuan ke CWC boleh dibuat dalam kad MIC (Perkara 61.3).' });
    }
    // 5. had Presiden 3 penggal (Perkara 58.2A)
    if (adalahPresiden(p)) {
      if (typeof m.presidenSejak !== 'number') { m.presidenSejak = sekarang; }
      if (sekarang - m.presidenSejak >= C.HAD_PRESIDEN_BULAN) {
        m.presidenSejak = null; m.lantikan = null;
        var rh = lucut(p, { kod: 'presiden' }, { reputasi: 3 }, 'Had 3 penggal Presiden');
        if (rh && rh.ok) { ev.push({ jenis: 'mic', mesej: 'Anda telah menjadi Presiden selama 3 penggal, had maksimum Perkara 58.2A. Timbalan Presiden mengambil alih sehingga pemilihan seterusnya. Reputasi +3 kerana peralihan yang teratur.' }); }
        p = Sv.loadPlayer(); m = st(p);
      }
    } else { m.presidenSejak = null; }
    // 6. Perhimpunan Agung Luar Biasa (Perkara 73.1): 1/4 Bahagian menuntut apabila sokongan Bahagian Presiden rendah
    if (adalahPresiden(p) && ringkasPusat(p).purata < C.EGM.sokongan && r() < C.EGM.peluang) {
      var pl = clamp((C.EGM.sokongan - ringkasPusat(p).purata) * C.EGM.kadar, 0, C.EGM.maks);
      if (r() < pl) { m.presidenSejak = null; var re = lucut(p, { kod: 'presiden' }, { reputasi: -5 }, 'Tumbang dalam Perhimpunan Agung Luar Biasa'); if (re && re.ok) { ev.push({ jenis: 'mic', mesej: 'Satu perempat Bahagian menuntut Perhimpunan Agung Luar Biasa (Perkara 73.1) dan usul terhadap anda diluluskan. Anda tidak lagi Presiden. Reputasi -5.' }); } p = Sv.loadPlayer(); m = st(p); }
      else { kes.reputasi = (kes.reputasi || 0) - 1; ev.push({ jenis: 'mic', mesej: 'Satu perempat Bahagian menuntut Perhimpunan Agung Luar Biasa (Perkara 73.1), tetapi usul terhadap anda gagal. Reputasi -1. Pulihkan sokongan pegawai Cawangan.' }); }
    }
    // 7. sumbangan bulanan wakil rakyat (Perkara 94)
    var P0 = PRU(), wakil = P0 && P0.semuaStatus ? P0.semuaStatus(p).length > 0 : false;
    if (wakil) {
      if ((Number(p.myr) || 0) >= C.SUMBANGAN) { kes.myr = (kes.myr || 0) - C.SUMBANGAN; }
      else { kes.reputasi = (kes.reputasi || 0) - 1; ev.push({ jenis: 'mic', mesej: 'Anda gagal membayar sumbangan bulanan wakil rakyat RM ' + C.SUMBANGAN + ' (Perkara 94). CWC memberi amaran: Reputasi -1.' }); }
    }
    // 8. lantikan: IP bulanan; tamat selepas Perhimpunan Agung tahun pemilihan; Pengerusi Negeri tamat bersama penggal Kongres Negeri
    var l = lantikanSemasa(p);
    if (l) {
      if (p.bulan === C.BULAN_PUSAT + 1 && adalahTahunPemilihan(p, p.tahun) && l.tahun < p.tahun) { m.lantikan = null; ev.push({ jenis: 'mic', mesej: 'Pemilihan Pusat selesai. Lantikan ' + l.jawatan + ' anda tamat; Presiden membuat lantikan baharu.' }); }
      else if (l.perluNegeri && !ahliNegeri(p)) { m.lantikan = null; ev.push({ jenis: 'mic', mesej: 'Penggal Kongres Negeri anda tamat, jadi lantikan Pengerusi Kongres Negeri juga tamat.' }); }
      else { kes.ip = (kes.ip || 0) + l.ip; }
    }
    // 9. yuran tahunan RM 4 (Perkara 12, 15.5)
    if (p.bulan === C.YURAN.bulan && m.yuran !== p.tahun) {
      if ((Number(p.myr) || 0) + (kes.myr || 0) >= C.YURAN.rm) { kes.myr = (kes.myr || 0) - C.YURAN.rm; m.yuran = p.tahun; }
      else { ev.push({ jenis: 'mic', mesej: 'Anda tidak mampu membayar yuran keahlian RM ' + C.YURAN.rm + ' sebelum 30 November. Keahlian anda luput (Perkara 15.5); anda didaftar semula sebagai ahli baharu dan hilang semua jawatan parti.' }); m.yuran = p.tahun; patchT = Object.assign(patchT || {}, { jawatanList: [], jawatan: 'Ahli Biasa', keahlian: { sejakTahun: p.tahun, sejakBulan: p.bulan } }); m.bulanKC = 0; m.bulanAJK = 0; }
    }
    // 10. Cawangan mati (Perkara 18): Pengerusi Cawangan yang kurang aktif sepanjang tahun
    if (p.bulan === 12 && pegang(p, 'ketua_cawangan') && m.aktif.bil < C.MATI.aktifMin) {
      kes.reputasi = (kes.reputasi || 0) + C.MATI.reputasi; kes.kesetiaan = { akarUmbi: C.MATI.akarUmbi };
      ev.push({ jenis: 'mic', mesej: 'Cawangan anda mengadakan kurang daripada 3 mesyuarat jawatankuasa tahun ini dan hampir dianggap mati (Perkara 18). Kongres Negeri campur tangan untuk menghidupkannya semula. Reputasi ' + C.MATI.reputasi + ', sokongan akar umbi ' + C.MATI.akarUmbi + '.' });
    }
    // 11. sokongan pegawai Cawangan susut perlahan ke arah asal
    Object.keys(m.pusat).forEach(function (k) { var asal = k === kodPL(p) ? C.PUSAT.sendiri : 40; m.pusat[k] = Math.round((m.pusat[k] + (asal - m.pusat[k]) * 0.02) * 10) / 10; });
    simpan(p, m, kes, null, patchT);
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, adalah: adalah, kawasan: kawasan, ofset: ofset, lawan: lawan, adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya,
    bulanKeahlian: bulanKeahlian, semakSyarat: semakSyarat, gantungAktif: gantungAktif, sokonganBahagian: sokonganBahagian, perwakilan: perwakilan, ringkasPusat: ringkasPusat, penamaan: penamaan, bonusPusat: bonusPusat,
    statusJelajah: statusJelajah, jelajah: jelajah, statusPegawai: statusPegawai, lantikPegawai: lantikPegawai, sokonganNegeri: sokonganNegeri, ahliNegeri: ahliNegeri, statusNegeri: statusNegeri, bertandingNegeri: bertandingNegeri,
    adalahPresiden: adalahPresiden, lantikanSemasa: lantikanSemasa, dekat: dekat, statusMohon: statusMohon, mohon: mohon, statusLantikPresiden: statusLantikPresiden, lantikPresiden: lantikPresiden,
    rayuan: rayuan, rayuanGantung: rayuanGantung, prosesBulan: prosesBulan };
});
