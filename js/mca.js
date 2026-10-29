/* ==========================================================================
   Nusa Politik — js/mca.js   (v13.1)
   Peraturan khas MCA (Perlembagaan MCA, pindaan sehingga 1-12-2019). MCA dimainkan dalam mod penuh menggunakan enjin UMNO;
   modul ini hanya menambah perbezaan:
     - kawasan & kuota kerusi BN (js/mca-data.js): 40 Parlimen dan 90 DUN, disusun ikut peratus pengundi Cina
     - kitaran pemilihan parti selepas setiap PRU (Perkara 167): paling lewat 6 bulan selepas PRU atau 36 bulan selepas pemilihan lalu
     - pemilihan Pusat oleh perwakilan Bahagian di seluruh negara (Perkara 21): Jelajah Bahagian
     - lantikan Presiden (Perkara 22, 22A, 38.11): Setiausaha Agung, Bendahari Agung, Setiausaha Organisasi Kebangsaan, Ahli JKP lantikan
     - had Presiden 9 tahun (Perkara 21A); 3 tahun keahlian untuk bertanding (Perkara 120)
     - gagal hadir 3 mesyuarat berturut-turut (Perkara 157), usul pecat 2/3 (Perkara 75, 101), Mesyuarat Agung Luar Biasa (Perkara 30)
     - sumbangan bulanan wakil rakyat (Perkara 142)
   State: p.mca = { pusat:{kod:sokongan}, lantikan, lantikanTahun, mohonBulan, jelajahBulan, presidenSejak, tindakanLepas, absen, rayuan, lantikPresiden }
   SEMUA ANGKA BERTANDA ANDAIAN IALAH ANDAIAN PERMAINAN (dipersetujui dalam mockup v13).
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikMCA = api;
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
  function DATA() { return modul('MyPolitikMCAData', 'mca-data.js') || { parlimen: {}, dun: {} }; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(t, b) { return (parseInt(t, 10) || 0) * 12 + (parseInt(b, 10) || 1); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  var CONFIG = {
    KUOTA_PARLIMEN: 40, KUOTA_DUN: 90,                       // ANDAIAN: kuota MCA dalam BN
    TAHUN_MULA: 2026, BULAN_PUSAT: 8, SELEPAS_PRU: 6, KITARAN_BULAN: 36,   // Perkara 167
    KEAHLIAN_BULAN: 36,                                      // Perkara 120 (3 tahun)
    PERWAKILAN_BAHAGIAN: 30,                                 // had Perkara 94 / 67
    PUSAT: { sendiri: 60, lain: [30, 45], bonusSkala: 0.3, jelajahAP: 2, jelajahMYR: 2000, jelajahNaik: 8, susut: 0.5 },
    LANTIKAN: [
      { kod: 'setiausaha_agung', jawatan: 'Setiausaha Agung', ip: 10, pusat: 6 },
      { kod: 'bendahari_agung', jawatan: 'Bendahari Agung', ip: 8, pusat: 5 },
      { kod: 'son', jawatan: 'Setiausaha Organisasi Kebangsaan', ip: 8, pusat: 5 },
      { kod: 'ahli_jkp_lantikan', jawatan: 'Ahli JKP (Lantikan Presiden)', ip: 6, pusat: 4 }
    ],
    MOHON: { ap: 2, pangkatMin: 7, faktor: 0.8, dekatLalai: 30 },
    HAD_PRESIDEN_BULAN: 108,                                 // Perkara 21A (9 tahun)
    ABSEN: { had: 3, rayuanAP: 1, rayuanPeluang: 0.7 },      // Perkara 157
    PECAT: { akarUmbi: 30, peluangUsul: 0.15, kadar: 0.03, maks: 0.6 },     // Perkara 75 / 101
    EGM: { ajk: 35, peluang: 0.10, kadar: 0.03, maks: 0.6 },                // Perkara 30
    SUMBANGAN: 500                                           // Perkara 142 (RM sebulan)
  };

  function adalah(p) { return !!(p && p.parti === 'MCA'); }
  function st(p) {
    var m = p && p.mca && typeof p.mca === 'object' ? p.mca : {};
    if (!m.pusat || typeof m.pusat !== 'object') { m.pusat = {}; }
    return m;
  }
  function simpan(p, m, kesan, log) { return S().applyEffects(kesan || {}, { kiraTindakan: !!(log && log.kira), patch: { mca: m }, log: log && log.nama ? { tindakan: log.tindakan || 'mca', nama: log.nama, peringkat: log.peringkat || 'ahli' } : undefined }); }

  /* ---------- Kawasan & kuota ---------- */
  function kodPL(p) { var k = p && p.kod && p.kod.parlimen; return k ? 'P.' + String(parseInt(k, 10)).padStart(3, '0') : null; }
  function kawasan(p) {
    var d = DATA(), kp = kodPL(p), pl = kp ? d.parlimen[kp] : null, dn = null;
    if (pl && p.kod && p.kod.dun && parseInt(p.kod.dun, 10) > 0) { var kd = pl.ng + '_N.' + String(parseInt(p.kod.dun, 10)).padStart(2, '0'); dn = d.dun[kd] ? Object.assign({ kod: kd }, d.dun[kd]) : null; }
    return { parlimen: pl ? Object.assign({ kod: kp }, pl) : null, dun: dn,
      kuotaPL: !!(pl && pl.r <= CONFIG.KUOTA_PARLIMEN), kuotaDUN: !!(dn && dn.r <= CONFIG.KUOTA_DUN), bilBahagian: Object.keys(d.parlimen).length };
  }
  /** Ofset kekuatan kerusi PRU (ANDAIAN): kerusi Cina sangat tinggi lebih sukar (lawan kuat), kerusi campuran lebih seimbang. */
  function ofset(p, jenis) {
    var k = kawasan(p), c = jenis === 'DUN' ? (k.dun && k.dun.c) : (k.parlimen && k.parlimen.c);
    if (!c) { return 0; }
    return c >= 60 ? -6 : c >= 45 ? -3 : c >= 35 ? 0 : 2;
  }
  function lawan(p, jenis) { var k = kawasan(p), c = jenis === 'DUN' ? (k.dun && k.dun.c) : (k.parlimen && k.parlimen.c); return c >= 40 ? ['DAP', 'PKR'] : ['PKR', 'DAP']; }

  /* ---------- Kitaran pemilihan (Perkara 167) ---------- */
  /** Senarai tahun pemilihan parti (tahun pertama 2026), dikira daripada tarikh PRU yang telah berlaku (p.pru.riwayat). */
  function senaraiTahun(p) {
    var riw = (p && p.pru && Array.isArray(p.pru.riwayat) ? p.pru.riwayat : []).filter(function (r) { return r && r.jenis !== 'PRN'; })
      .map(function (r) { return idx(r.tahun, r.bulan); }).sort(function (a, b) { return a - b; });
    var out = [CONFIG.TAHUN_MULA], L = CONFIG.TAHUN_MULA, guard = 0;
    while (guard++ < 30) {
      var pusatL = idx(L, CONFIG.BULAN_PUSAT), pru = riw.filter(function (i) { return i > pusatL; })[0];
      if (pru === undefined) { break; }
      var had = Math.max(pru + CONFIG.SELEPAS_PRU, pusatL + CONFIG.KITARAN_BULAN), Y = Math.ceil((had - CONFIG.BULAN_PUSAT) / 12);
      out.push(Y); L = Y;
    }
    return out;
  }
  function adalahTahunPemilihan(p, tahun) { return senaraiTahun(p).indexOf(parseInt(tahun, 10)) >= 0; }
  function tahunLepas(p, tahun) { var t = parseInt(tahun, 10); return senaraiTahun(p).filter(function (y) { return y <= t; }).pop() || null; }
  /** Tahun pemilihan seterusnya (anggaran jika PRU belum berlaku: ikut jadual PRU semasa). */
  function tahunSeterusnya(p, tahun) {
    var t = parseInt(tahun, 10), ls = senaraiTahun(p), a = ls.filter(function (y) { return y >= t; })[0];
    if (a) { return a; }
    var L = ls[ls.length - 1], P0 = PRU(), pr = P0 && P0.getPRU && p ? P0.getPRU(p) : (p && p.pru), pruI = pr && pr.tahunPRU ? idx(pr.tahunPRU, pr.bulanPRU || 3) : idx(t + 1, 3);
    var had = Math.max(pruI + CONFIG.SELEPAS_PRU, idx(L, CONFIG.BULAN_PUSAT) + CONFIG.KITARAN_BULAN);
    return Math.max(t + (idx(t, 12) >= had ? 1 : 0), Math.ceil((had - CONFIG.BULAN_PUSAT) / 12));
  }

  /* ---------- 3 tahun keahlian (Perkara 120) ---------- */
  function bulanKeahlian(p) { var k = p && p.keahlian; if (!k) { return 999; } return Math.max(0, idx(p.tahun, p.bulan) - idx(k.sejakTahun, k.sejakBulan)); }
  function cukupKeahlian(p) { return bulanKeahlian(p) >= CONFIG.KEAHLIAN_BULAN; }

  /* ---------- Pemilihan Pusat oleh perwakilan Bahagian (Perkara 21) ---------- */
  function sokonganBahagian(p) {
    var d = DATA(), m = st(p), own = kodPL(p), out = {};
    Object.keys(d.parlimen).forEach(function (k) {
      var v = m.pusat[k];
      if (typeof v !== 'number') { var c = CONFIG.PUSAT.lain; v = k === own ? CONFIG.PUSAT.sendiri : c[0] + (hash(String(p.id) + '|' + k) % (c[1] - c[0] + 1)); }
      out[k] = v;
    });
    return out;
  }
  function ringkasPusat(p) {
    var sb = sokonganBahagian(p), d = DATA(), ks = Object.keys(sb), jum = 0, condong = 0;
    ks.forEach(function (k) { jum += sb[k]; if (sb[k] >= 50) { condong++; } });
    var purata = ks.length ? jum / ks.length : 0, pengundi = ks.length * CONFIG.PERWAKILAN_BAHAGIAN;
    return { purata: Math.round(purata * 10) / 10, condong: condong, bilBahagian: ks.length, pengundi: pengundi, sokongUndi: Math.round(pengundi * purata / 100),
      senarai: ks.map(function (k) { return { kod: k, nama: d.parlimen[k].n, sokongan: Math.round(sb[k]) }; }).sort(function (a, b) { return a.sokongan - b.sokongan || a.nama.localeCompare(b.nama); }) };
  }
  /** Bonus kekuatan pemain dalam pemilihan Pusat (election.js). */
  function bonusPusat(p) {
    if (!adalah(p)) { return 0; }
    var l = lantikanSemasa(p), b = (ringkasPusat(p).purata - 40) * CONFIG.PUSAT.bonusSkala + (l ? l.pusat : 0);
    return Math.round(b * 10) / 10;
  }
  function statusJelajah(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk MCA.' }; }
    var J0 = J(); if (!J0 || J0.pangkatTertinggi(p) < 7) { return { boleh: false, sebab: 'Perlu Pengerusi Bahagian atau lebih untuk berkempen di peringkat Pusat.' }; }
    var m = st(p); if (m.jelajahBulan === idx(p.tahun, p.bulan)) { return { boleh: false, sebab: 'Jelajah Bahagian sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < CONFIG.PUSAT.jelajahAP) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < CONFIG.PUSAT.jelajahMYR) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function jelajah(kod) {
    var p = S().loadPlayer(), s0 = statusJelajah(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var d = DATA(); if (!d.parlimen[kod]) { return { ok: false, ralat: 'Bahagian tidak sah.' }; }
    var m = st(p), sb = sokonganBahagian(p), baru = clamp(sb[kod] + CONFIG.PUSAT.jelajahNaik, 0, 100);
    m.pusat[kod] = baru; m.jelajahBulan = idx(p.tahun, p.bulan);
    var r = simpan(p, m, { ap: -CONFIG.PUSAT.jelajahAP, myr: -CONFIG.PUSAT.jelajahMYR }, { kira: true, tindakan: 'mca_jelajah', nama: 'Jelajah Bahagian ' + d.parlimen[kod].n });
    return r.ok ? { ok: true, mesej: 'Jelajah Bahagian ' + d.parlimen[kod].n + ': sokongan perwakilan ' + Math.round(sb[kod]) + '% → ' + Math.round(baru) + '%.' } : { ok: false, ralat: r.ralat };
  }

  /* ---------- Lantikan Presiden (Perkara 22, 22A, 38.11) ---------- */
  function adalahPresiden(p) { var J0 = J(); return !!(J0 && J0.pegang && J0.pegang(p, 'presiden')); }
  function lantikanSemasa(p) {
    var m = st(p); if (!m.lantikan) { return null; }
    var def = CONFIG.LANTIKAN.filter(function (x) { return x.kod === m.lantikan; })[0];
    return def ? Object.assign({ tahun: m.lantikanTahun }, def) : null;
  }
  function dekat(p) { var bp = p && p.negeriBP; return bp && typeof bp.dekat === 'number' ? bp.dekat : CONFIG.MOHON.dekatLalai; }
  function statusMohon(p, kod) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk MCA.' }; }
    if (adalahPresiden(p)) { return { boleh: false, sebab: 'Anda Presiden: anda yang melantik.' }; }
    var J0 = J(); if (!J0 || J0.pangkatTertinggi(p) < CONFIG.MOHON.pangkatMin) { return { boleh: false, sebab: 'Perlu Pengerusi Bahagian atau lebih.' }; }
    var m = st(p); if (m.lantikan) { return { boleh: false, sebab: 'Anda sudah memegang lantikan ' + lantikanSemasa(p).jawatan + '.' }; }
    if (m.mohonBulan === idx(p.tahun, p.bulan)) { return { boleh: false, sebab: 'Satu permohonan sebulan.' }; }
    if ((Number(p.ap) || 0) < CONFIG.MOHON.ap) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if (!CONFIG.LANTIKAN.some(function (x) { return x.kod === kod; })) { return { boleh: false, sebab: 'Jawatan tidak sah.' }; }
    return { boleh: true, sebab: '', peluang: Math.round(clamp(dekat(p) * CONFIG.MOHON.faktor, 5, 90)) };
  }
  function mohon(kod, o) {
    var p = S().loadPlayer(), s0 = statusMohon(p, kod); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var r = (o && o.rng) || S().rngBerbenih(String(p.id) + '|mca|mohon|' + idx(p.tahun, p.bulan)), m = st(p), def = CONFIG.LANTIKAN.filter(function (x) { return x.kod === kod; })[0];
    var jaya = r() < s0.peluang / 100; m.mohonBulan = idx(p.tahun, p.bulan);
    if (jaya) { m.lantikan = kod; m.lantikanTahun = p.tahun; }
    var res = simpan(p, m, { ap: -CONFIG.MOHON.ap }, { kira: true, tindakan: 'mca_mohon', nama: 'Mohon lantikan ' + def.jawatan + (jaya ? ' (dilantik)' : ' (tidak dilantik)') });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    return { ok: true, jaya: jaya, mesej: jaya ? 'Presiden melantik anda sebagai ' + def.jawatan + '. IP +' + def.ip + ' sebulan dan sokongan dalam pemilihan Pusat bertambah.' : 'Presiden belum bersedia melantik anda sebagai ' + def.jawatan + '. Tingkatkan kedekatan dengan Presiden dan cuba lagi bulan depan.' };
  }
  /** Pemain Presiden: lantik Setiausaha Agung (penyokong setia atau pencabar dalaman), sekali bagi setiap tahun pemilihan. */
  function statusLantikPresiden(p) {
    if (!adalah(p) || !adalahPresiden(p)) { return { boleh: false, sebab: '' }; }
    var m = st(p), L = tahunLepas(p, p.tahun) || p.tahun;
    if (m.lantikPresiden === L) { return { boleh: false, sebab: 'Lantikan penggal ini sudah dibuat.', sudah: m.lantikPresidenPilihan }; }
    return { boleh: true, sebab: '' };
  }
  function lantikPresiden(pilihan) {
    var p = S().loadPlayer(), s0 = statusLantikPresiden(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab || 'Hanya Presiden MCA.' }; }
    if (pilihan !== 'setia' && pilihan !== 'pencabar') { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    var m = st(p); m.lantikPresiden = tahunLepas(p, p.tahun) || p.tahun; m.lantikPresidenPilihan = pilihan;
    var kes = pilihan === 'setia' ? { kesetiaan: { ajk: 4 } } : { kesetiaan: { perwakilan: 4, ajk: -2 } };
    var r = simpan(p, m, kes, { tindakan: 'mca_lantik', nama: 'Lantik Setiausaha Agung (' + (pilihan === 'setia' ? 'penyokong setia' : 'pencabar dalaman') + ')' });
    return r.ok ? { ok: true, mesej: pilihan === 'setia' ? 'Anda melantik penyokong setia sebagai Setiausaha Agung. Sokongan AJK +4.' : 'Anda melantik pencabar dalaman sebagai Setiausaha Agung untuk menyatukan parti. Sokongan perwakilan +4, sokongan AJK -2.' } : { ok: false, ralat: r.ralat };
  }

  /* ---------- Rayuan tidak hadir (Perkara 157) ---------- */
  function rayuan(o) {
    var p = S().loadPlayer(); if (!adalah(p)) { return { ok: false, ralat: 'Hanya untuk MCA.' }; }
    var m = st(p); if (!m.rayuan) { return { ok: false, ralat: 'Tiada notis ketidakhadiran.' }; }
    if ((Number(p.ap) || 0) < CONFIG.ABSEN.rayuanAP) { return { ok: false, ralat: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    var r = (o && o.rng) || S().rngBerbenih(String(p.id) + '|mca|rayuan|' + idx(p.tahun, p.bulan)), jaya = r() < CONFIG.ABSEN.rayuanPeluang, kod = m.rayuan.kod, nama = m.rayuan.jawatan;
    m.rayuan = null; m.absen = 0;
    if (jaya) { var r1 = simpan(p, m, { ap: -CONFIG.ABSEN.rayuanAP }, { kira: true, tindakan: 'mca_rayuan', nama: 'Rayuan ketidakhadiran diterima' }); return r1.ok ? { ok: true, jaya: true, mesej: 'Rayuan diterima. Anda kekal sebagai ' + nama + '.' } : { ok: false, ralat: r1.ralat }; }
    var J0 = J(), d = J0 && J0.cariDef(kod), patch = d ? J0.terapkan(p, d, false) : {}; patch.mca = m;
    var r2 = S().applyEffects({ ap: -CONFIG.ABSEN.rayuanAP }, { kiraTindakan: true, patch: patch, log: { tindakan: 'mca_rayuan', nama: 'Rayuan ketidakhadiran ditolak: ' + nama, peringkat: 'ahli' } });
    return r2.ok ? { ok: true, jaya: false, mesej: 'Rayuan ditolak. Anda hilang kerusi ' + nama + ' kerana tidak hadir 3 mesyuarat berturut-turut (Perkara 157).' } : { ok: false, ralat: r2.ralat };
  }

  /** Jawatan tertinggi (utama) pada peringkat tertentu. */
  function jawatanTertinggi(p, peringkat) {
    var J0 = J(), l = J0 ? J0.getJawatan(p) : [];
    return l.filter(function (j) { return !peringkat || peringkat.indexOf(j.peringkat) >= 0; }).sort(function (a, b) { return (b.pangkat || 0) - (a.pangkat || 0); })[0] || null;
  }
  function lucut(p, j, kes, nama) {
    var J0 = J(), d = J0 && J0.cariDef(j.kod); if (!d) { return null; }
    var patch = J0.terapkan(p, d, false); patch.mca = st(p);
    return S().applyEffects(kes || {}, { kiraTindakan: false, patch: patch, log: { tindakan: 'mca_lucut', nama: nama, peringkat: 'ahli' } });
  }

  /* ---------- Bulanan (rantaian kalendar) ---------- */
  function prosesBulan(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat || !adalah(p)) { return { peristiwa: ev }; }
    var r = (o && o.rng) || Sv.rngBerbenih(String(p.id) + '|mca|bulan|' + idx(p.tahun, p.bulan)), m = st(p), kes = {}, sekarang = idx(p.tahun, p.bulan);
    // 1. rayuan tidak dibuat dalam tempoh: kerusi hilang
    if (m.rayuan && m.rayuan.sehingga < sekarang) {
      var jr = { kod: m.rayuan.kod, jawatan: m.rayuan.jawatan }; m.rayuan = null; m.absen = 0;
      var rl = lucut(p, jr, {}, 'Hilang kerusi (tidak hadir 3 mesyuarat): ' + jr.jawatan);
      if (rl && rl.ok) { ev.push({ jenis: 'mca', mesej: 'Anda tidak merayu dalam tempoh. Anda hilang kerusi ' + jr.jawatan + ' kerana tidak hadir 3 mesyuarat berturut-turut (Perkara 157).' }); }
      p = Sv.loadPlayer(); m = st(p);
    }
    // 2. kehadiran: bulan tanpa sebarang tindakan = tidak hadir mesyuarat jawatankuasa
    var J0 = J(), adaJawatan = !!jawatanTertinggi(p, ['cawangan', 'bahagian', 'pusat']);
    if (typeof m.tindakanLepas === 'number' && adaJawatan) { m.absen = (p.bilTindakan || 0) > m.tindakanLepas ? 0 : (m.absen || 0) + 1; } else { m.absen = 0; }
    m.tindakanLepas = p.bilTindakan || 0;
    if (m.absen >= CONFIG.ABSEN.had && !m.rayuan && adaJawatan) {
      var ja = jawatanTertinggi(p, ['cawangan', 'bahagian', 'pusat']);
      m.rayuan = { kod: ja.kod, jawatan: ja.jawatan, sehingga: sekarang };
      ev.push({ jenis: 'mca', mesej: 'Anda tidak hadir 3 mesyuarat jawatankuasa berturut-turut (tiada tindakan selama 3 bulan). Anda akan hilang kerusi ' + ja.jawatan + ' kecuali merayu bulan ini (Perkara 157).' });
    }
    // 3. had Presiden 9 tahun (Perkara 21A)
    if (adalahPresiden(p)) {
      if (typeof m.presidenSejak !== 'number') { m.presidenSejak = sekarang; }
      if (sekarang - m.presidenSejak >= CONFIG.HAD_PRESIDEN_BULAN) {
        m.presidenSejak = null; m.lantikan = null;
        var rh = lucut(p, { kod: 'presiden' }, { reputasi: 3 }, 'Had 9 tahun Presiden');
        if (rh && rh.ok) { ev.push({ jenis: 'mca', mesej: 'Anda telah menjadi Presiden selama 9 tahun, had maksimum Perkara 21A. Timbalan Presiden mengambil alih sehingga pemilihan seterusnya. Reputasi +3 kerana peralihan yang teratur.' }); }
        p = Sv.loadPlayer(); m = st(p);
      }
    } else { m.presidenSejak = null; }
    // 4. Mesyuarat Agung Luar Biasa (Perkara 30): Presiden dengan sokongan AJK rendah
    if (adalahPresiden(p) && (p.kesetiaan && p.kesetiaan.ajk) < CONFIG.EGM.ajk && r() < CONFIG.EGM.peluang) {
      var pl = clamp((CONFIG.EGM.ajk - p.kesetiaan.ajk) * CONFIG.EGM.kadar, 0, CONFIG.EGM.maks);
      if (r() < pl) { m.presidenSejak = null; var re = lucut(p, { kod: 'presiden' }, { reputasi: -5 }, 'Tumbang dalam Mesyuarat Agung Luar Biasa'); if (re && re.ok) { ev.push({ jenis: 'mca', mesej: 'Satu pertiga ahli JKP memanggil Mesyuarat Agung Luar Biasa (Perkara 30) dan usul tidak percaya terhadap anda diluluskan. Anda tidak lagi Presiden. Reputasi -5.' }); } p = Sv.loadPlayer(); m = st(p); }
      else { kes.reputasi = (kes.reputasi || 0) - 1; ev.push({ jenis: 'mca', mesej: 'Satu pertiga ahli JKP memanggil Mesyuarat Agung Luar Biasa (Perkara 30), tetapi usul tidak percaya terhadap anda gagal. Reputasi -1. Pulihkan sokongan AJK.' }); }
    }
    // 5. usul pecat oleh perhimpunan (Perkara 75, 101): perlu 2/3 undi
    var jp = jawatanTertinggi(p, ['cawangan', 'bahagian']);
    if (jp && (p.kesetiaan && p.kesetiaan.akarUmbi) < CONFIG.PECAT.akarUmbi && r() < CONFIG.PECAT.peluangUsul) {
      var pp = clamp((CONFIG.PECAT.akarUmbi - p.kesetiaan.akarUmbi) * CONFIG.PECAT.kadar, 0, CONFIG.PECAT.maks);
      if (r() < pp) { var rp = lucut(p, jp, { reputasi: -3 }, 'Dipecat oleh perhimpunan: ' + jp.jawatan); if (rp && rp.ok) { ev.push({ jenis: 'mca', mesej: 'Usul memecat anda sebagai ' + jp.jawatan + ' diluluskan dengan majoriti dua pertiga perhimpunan (Perkara ' + (jp.peringkat === 'bahagian' ? '75' : '101') + '). Reputasi -3.' }); } p = Sv.loadPlayer(); m = st(p); }
      else { ev.push({ jenis: 'mca', mesej: 'Usul memecat anda sebagai ' + jp.jawatan + ' dibentang tetapi gagal mendapat dua pertiga undi. Sokongan akar umbi anda perlu dipulihkan.' }); }
    }
    // 6. sumbangan bulanan wakil rakyat (Perkara 142)
    var P0 = PRU(), wakil = P0 && P0.semuaStatus ? P0.semuaStatus(p).length > 0 : false;
    if (wakil) {
      if ((Number(p.myr) || 0) >= CONFIG.SUMBANGAN) { kes.myr = (kes.myr || 0) - CONFIG.SUMBANGAN; }
      else { kes.reputasi = (kes.reputasi || 0) - 1; ev.push({ jenis: 'mca', mesej: 'Anda gagal membayar sumbangan bulanan wakil rakyat RM ' + CONFIG.SUMBANGAN + ' (Perkara 142). JKP memberi amaran: Reputasi -1.' }); }
    }
    // 7. lantikan: IP bulanan; luput apabila pemilihan Pusat tahun pemilihan selesai (Presiden baharu melantik semula)
    var l = lantikanSemasa(p);
    if (l) {
      if (p.bulan === CONFIG.BULAN_PUSAT + 1 && adalahTahunPemilihan(p, p.tahun) && l.tahun < p.tahun) { m.lantikan = null; ev.push({ jenis: 'mca', mesej: 'Pemilihan Pusat selesai. Lantikan ' + l.jawatan + ' anda tamat; Presiden membuat lantikan baharu.' }); }
      else { kes.ip = (kes.ip || 0) + l.ip; }
    }
    // 8. sokongan perwakilan Bahagian susut perlahan ke arah asal
    Object.keys(m.pusat).forEach(function (k) { var asal = k === kodPL(p) ? CONFIG.PUSAT.sendiri : 40; m.pusat[k] = Math.round((m.pusat[k] + (asal - m.pusat[k]) * 0.02) * 10) / 10; });
    simpan(p, m, kes);
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, adalah: adalah, kawasan: kawasan, ofset: ofset, lawan: lawan, senaraiTahun: senaraiTahun, adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya,
    bulanKeahlian: bulanKeahlian, cukupKeahlian: cukupKeahlian, sokonganBahagian: sokonganBahagian, ringkasPusat: ringkasPusat, bonusPusat: bonusPusat, statusJelajah: statusJelajah, jelajah: jelajah,
    adalahPresiden: adalahPresiden, lantikanSemasa: lantikanSemasa, dekat: dekat, statusMohon: statusMohon, mohon: mohon, statusLantikPresiden: statusLantikPresiden, lantikPresiden: lantikPresiden, rayuan: rayuan, prosesBulan: prosesBulan };
});
