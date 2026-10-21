/* ==========================================================================
   Nusa Politik — js/komuniti.js   (v8.23)
   Lobi Jawatan Komuniti: AJK Masjid / PIBG, Persatuan Sukan, Majlis PBT, Persatuan Belia dan Agensi Berpendapatan Tinggi.
   Diasingkan daripada GLC (js/glc.js): had dan kad sendiri. Nama persatuan dan agensi ialah REKAAN generik.
     - Lobi pada bila-bila masa. Syarat: peringkat jawatan parti, umur, kerusi / kerajaan. Kos: IP + Dana.
     - Gagal: separuh kos hilang dan jawatan itu tidak boleh dilobi semula selama 6 bulan.
     - Maksimum 3 jawatan serentak. Tempoh 36 bulan; boleh diperbaharui dalam 6 bulan terakhir (separuh kos Dana).
     - Ganjaran bulanan (akar umbi, reputasi, IP, Dana). Jawatan berisiko menambah Konflik Kepentingan / Audit SPRM.
     - Jawatan bergaji tinggi (Sukan Kebangsaan, PBT, Agensi) tidak boleh bersama jawatan Menteri/EXCO atau jawatan GLC.
     - Jawatan tamat jika syarat umur tidak lagi dipenuhi (contoh: Belia selepas 40 tahun).
   State: p.komuniti = { jawatan:[{id,mula,tamat,konflik,audit}], cuba:{id:idxBulan}, akhir, sejarah }
   ANDAIAN: semua angka ialah penyeimbang simulasi, bukan gambaran organisasi sebenar.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikKomuniti = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function IG() { return modul('MyPolitikIntegriti', 'integriti.js'); }
  function HY() { return modul('MyPolitikHayat', 'hayat.js'); }
  function CA() { return modul('MyPolitikCalendar', 'calendar.js'); }
  function PR() { return modul('MyPolitikPRU', 'pru.js'); }
  function GL() { return modul('MyPolitikGLC', 'glc.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('ms-MY'); }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }

  var CONFIG = { MAKS: 3, TEMPOH: 36, BAHARUI_DALAM: 6, BAHARUI_KOS: 0.5, GAGAL_PULANG: 0.5, TUNGGU_SEMULA: 6, AUDIT_MULA: 30, SKOR_RENDAH: 30, DENDA: 5000 };
  var PERINGKAT = { cawangan: 1, bahagian: 2, pusat: 3 };
  var PERINGKAT_NAMA = { cawangan: 'Cawangan', bahagian: 'Bahagian', pusat: 'Pusat' };

  var JENIS = [
    { id: 'masjid', ikon: '🕌', nama: 'Masjid & PIBG' },
    { id: 'sukan', ikon: '⚽', nama: 'Persatuan Sukan' },
    { id: 'pbt', ikon: '🏘️', nama: 'Majlis PBT' },
    { id: 'belia', ikon: '🧑‍🤝‍🧑', nama: 'Persatuan Belia' },
    { id: 'agensi', ikon: '💰', nama: 'Agensi Berpendapatan Tinggi' }
  ];
  /* syarat: per = peringkat parti minimum; umurMin/umurMaks; kerusi = ADUN atau MP; mp = MP sahaja; atau = alternatif per/mp (Sukan Kebangsaan);
             kerajaan = pegang kerusi daripada pihak kerajaan; menang = pernah menang DUN/Parlimen; ipMin = IP minimum;
     kos: { ip, myr }; ganjaran bulanan: { akarUmbi, reputasi, ip, myr }; risiko: { konflik, audit }; gajiTinggi = tidak bersama Menteri/EXCO atau GLC. */
  var JAWATAN = [
    { id: 'ajk_masjid', jenis: 'masjid', ikon: '🕌', nama: 'AJK Masjid', syarat: { per: 'cawangan', umurMin: 30 }, ip: 40, myr: 500, asas: 0.75, ganjaran: { akarUmbi: 2, reputasi: 1 }, risiko: { konflik: 0, audit: 0 } },
    { id: 'ajk_pibg', jenis: 'masjid', ikon: '🏫', nama: 'AJK PIBG', syarat: { per: 'cawangan', umurMin: 25 }, ip: 30, myr: 300, asas: 0.8, ganjaran: { akarUmbi: 2, ip: 1 }, risiko: { konflik: 0, audit: 0 } },
    { id: 'sukan_negeri', jenis: 'sukan', ikon: '⚽', nama: 'Persatuan Sukan Negeri', syarat: { per: 'bahagian' }, ip: 100, myr: 3000, asas: 0.65, ganjaran: { ip: 3, reputasi: 1, myr: 300 }, risiko: { konflik: 1, audit: 0 } },
    { id: 'sukan_nasional', jenis: 'sukan', ikon: '🏅', nama: 'Persatuan Sukan Kebangsaan', syarat: { per: 'pusat', atauMP: true }, ip: 200, myr: 8000, asas: 0.55, ganjaran: { ip: 5, reputasi: 2, myr: 600 }, risiko: { konflik: 1, audit: 1 }, gajiTinggi: true },
    { id: 'pbt', jenis: 'pbt', ikon: '🏘️', nama: 'Ahli Majlis PBT', syarat: { per: 'bahagian', kerajaan: true }, ip: 120, myr: 2000, asas: 0.6, ganjaran: { akarUmbi: 3, ip: 2, myr: 800 }, risiko: { konflik: 1, audit: 0 }, gajiTinggi: true },
    { id: 'belia_kampung', jenis: 'belia', ikon: '🧑‍🤝‍🧑', nama: 'Persatuan Belia Kampung/Taman', syarat: { per: 'cawangan', umurMin: 18, umurMaks: 40 }, ip: 30, myr: 300, asas: 0.8, ganjaran: { ip: 2, akarUmbi: 2 }, risiko: { konflik: 0, audit: 0 } },
    { id: 'belia_negeri', jenis: 'belia', ikon: '🏛️', nama: 'Majlis Belia Negeri', syarat: { per: 'bahagian', umurMin: 18, umurMaks: 40 }, ip: 80, myr: 1500, asas: 0.7, ganjaran: { ip: 3, akarUmbi: 2, reputasi: 1 }, risiko: { konflik: 0, audit: 0 } },
    { id: 'agensi_tinggi', jenis: 'agensi', ikon: '💰', nama: 'Lembaga Agensi Pendapatan Tinggi', syarat: { menang: true, ipMin: 400 }, ip: 350, myr: 30000, asas: 0.45, ganjaran: { ip: 6, myr: 6000 }, risiko: { konflik: 3, audit: 3 }, gajiTinggi: true }
  ];
  function cari(id) { return JAWATAN.filter(function (x) { return x.id === id; })[0] || null; }

  function dasar() { return { jawatan: [], cuba: {}, akhir: '', sejarah: [] }; }
  function getKomuniti(p) {
    var k = p && p.komuniti && typeof p.komuniti === 'object' ? p.komuniti : {}, o = dasar();
    o.jawatan = (Array.isArray(k.jawatan) ? k.jawatan : []).filter(function (j) { return j && cari(j.id); }).map(function (j) {
      return { id: j.id, mula: Number(j.mula) || 0, tamat: Number(j.tamat) || 0, konflik: clamp(Math.round(Number(j.konflik) || 0), 0, 100), audit: clamp(Math.round(Number(j.audit) || 0), 0, 100) };
    }).slice(0, CONFIG.MAKS);
    if (k.cuba && typeof k.cuba === 'object') { Object.keys(k.cuba).forEach(function (id) { if (cari(id)) { o.cuba[id] = Number(k.cuba[id]) || 0; } }); }
    o.akhir = String(k.akhir || ''); o.sejarah = Array.isArray(k.sejarah) ? k.sejarah.slice(-10) : [];
    return o;
  }
  function simpan(k, kesan, opts) {
    opts = opts || {};
    return S().applyEffects(kesan || {}, { kiraTindakan: false, pindahan: opts.pindahan !== false, tanpaKesukaran: !!opts.tanpaKesukaran, patch: { komuniti: k }, log: opts.log });
  }
  function rngBulan(p, o, k) { return (o && o.rng) || S().rngBerbenih(String(p.id) + '|komuniti|' + k + '|' + p.tahun + '|' + p.bulan); }

  /* ---------- Fakta pemain ---------- */
  function umur(p) { var h = HY(); return h && h.umurSemasa ? h.umurSemasa(p) : null; }
  function peringkatTertinggi(p) {
    var C = CA(), l = C && C.peringkatDipegang ? C.peringkatDipegang(p) : [], t = 0;
    l.forEach(function (x) { t = Math.max(t, PERINGKAT[x] || 0); });
    return t;
  }
  function pegangKerusi(p, jenis) { var Pr = PR(); return !!(Pr && Pr.pegang && Pr.pegang(p, jenis)); }
  function kerusiKerajaan(p) { var Pr = PR(); return !!(Pr && Pr.semuaStatus && Pr.semuaStatus(p).some(function (s) { return s && s.kerajaan === true; })); }
  function pernahMenang(p) {
    var Pr = PR(); if (!Pr) { return false; }
    if (pegangKerusi(p, 'ADUN') || pegangKerusi(p, 'MP')) { return true; }
    var pru = Pr.getPRU ? Pr.getPRU(p) : null;
    return !!(pru && (pru.sejarah || []).some(function (x) { return x && x.hasil === 'menang'; }));
  }
  function menteri(p) { var K = KB(); return !!(K && K.getKabinet && K.getKabinet(p).hasGovernmentRole); }
  function pegangGLC(p) { var G = GL(); return !!(G && G.getGLC && G.getGLC(p).jawatan); }

  /** Senarai sebab tidak layak (kosong = layak untuk memohon, tanpa menyemak IP/Dana). */
  function halangan(p, d, k) {
    var s = d.syarat, o = [], u = umur(p), per = peringkatTertinggi(p);
    if (s.per && per < PERINGKAT[s.per] && !(s.atauMP && pegangKerusi(p, 'MP'))) {
      o.push(s.atauMP ? 'Perlu jawatan ' + PERINGKAT_NAMA[s.per] + ' atau kerusi Parlimen parti' : 'Perlu jawatan ' + PERINGKAT_NAMA[s.per] + ' parti');
    }
    if (s.umurMin && (u === null || u < s.umurMin)) { o.push('Perlu umur ' + s.umurMin + '+ (umur anda ' + (u === null ? '?' : u) + ')'); }
    if (s.umurMaks && u !== null && u > s.umurMaks) { o.push('Had umur ' + s.umurMaks + ' tahun (umur anda ' + u + ')'); }
    if (s.kerajaan && !kerusiKerajaan(p)) { o.push('Parti anda perlu dalam kerajaan'); }
    if (s.menang && !pernahMenang(p)) { o.push('Perlu pernah menang kerusi DUN atau Parlimen'); }
    if (s.ipMin && (Number(p.ip) || 0) < s.ipMin) { o.push('Perlu IP ' + s.ipMin + '+'); }
    if (d.gajiTinggi && menteri(p)) { o.push('Tidak boleh bersama jawatan Menteri atau EXCO'); }
    if (d.gajiTinggi && pegangGLC(p)) { o.push('Tidak boleh bersama jawatan GLC'); }
    return o;
  }
  function peluang(p, d) {
    return clamp(d.asas + ((Number(p.ip) || 0) - d.ip) / (d.ip * 8) + ((Number(p.reputasi) || 50) - 50) * 0.003, 0.1, 0.95);
  }
  function pegang(k, id) { return k.jawatan.filter(function (j) { return j.id === id; })[0] || null; }
  function bolehBerjawatanTinggi(p) { return !menteri(p) && !pegangGLC(p); }

  function senarai(p) {
    var k = getKomuniti(p), kini = idx(p);
    return JAWATAN.map(function (d) {
      var kos = S().kosSebenar ? S().kosSebenar(p, d.myr) : d.myr, sebab = halangan(p, d, k), milik = !!pegang(k, d.id);
      if (milik) { sebab = []; }
      else {
        if (k.jawatan.length >= CONFIG.MAKS) { sebab.push('Sudah memegang ' + CONFIG.MAKS + ' jawatan komuniti'); }
        if ((Number(p.ip) || 0) < d.ip) { sebab.push('IP tidak cukup (perlu ' + d.ip + ')'); }
        if ((Number(p.myr) || 0) < kos) { sebab.push('Dana tidak cukup (perlu ' + rm(kos) + ')'); }
        var tunggu = k.cuba[d.id] ? CONFIG.TUNGGU_SEMULA - (kini - k.cuba[d.id]) : 0;
        if (tunggu > 0) { sebab.push('Lobi gagal baru-baru ini (tunggu ' + tunggu + ' bulan)'); }
      }
      return { id: d.id, jenis: d.jenis, ikon: d.ikon, nama: d.nama, ip: d.ip, myr: kos, ganjaran: d.ganjaran, risiko: d.risiko, gajiTinggi: !!d.gajiTinggi,
        peluang: Math.round(peluang(p, d) * 100), milik: milik, boleh: !milik && !sebab.length, sebab: sebab.join('; '), sebabList: sebab };
    });
  }

  function lobi(id, o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), d = cari(id);
    if (!p || p.tamat) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var k = getKomuniti(p), s = senarai(p).filter(function (x) { return x.id === id; })[0];
    if (!d || !s) { return { ok: false, ralat: 'Jawatan tidak dikenali.' }; }
    if (s.milik) { return { ok: false, ralat: 'Anda sudah memegang jawatan ini.' }; }
    if (!s.boleh) { return { ok: false, ralat: s.sebab }; }
    var lulus = rngBulan(p, o, id)() < peluang(p, d), kini = idx(p), kes, r;
    if (lulus) {
      k.jawatan.push({ id: d.id, mula: kini, tamat: kini + CONFIG.TEMPOH, konflik: 0, audit: 0 }); delete k.cuba[id];
      k.sejarah = k.sejarah.concat([{ tahun: p.tahun, bulan: p.bulan, nama: d.nama, hasil: 'dilantik' }]).slice(-10);
      r = simpan(k, { ip: -d.ip, myr: -s.myr }, { log: { tindakan: 'komuniti_jaya', nama: 'Dilantik: ' + d.nama, peringkat: 'ahli' } });
      return r.ok ? { ok: true, dilantik: true, mesej: 'Dilantik sebagai ' + d.nama + '. Ganjaran bulanan bermula.' } : { ok: false, ralat: r.ralat };
    }
    k.cuba[id] = kini; kes = { ip: -Math.round(d.ip * (1 - CONFIG.GAGAL_PULANG)), myr: -Math.round(s.myr * (1 - CONFIG.GAGAL_PULANG)) };
    r = simpan(k, kes, { log: { tindakan: 'komuniti_gagal', nama: 'Lobi gagal: ' + d.nama, peringkat: 'ahli' } });
    return r.ok ? { ok: true, dilantik: false, mesej: 'Lobi ' + d.nama + ' gagal. Separuh kos hilang. Boleh cuba semula selepas ' + CONFIG.TUNGGU_SEMULA + ' bulan.' } : { ok: false, ralat: r.ralat };
  }

  function bulanBaki(p, j) { return j.tamat - idx(p); }
  function kosBaharui(p, d) { var kos = Math.round(d.myr * CONFIG.BAHARUI_KOS); return S().kosSebenar ? S().kosSebenar(p, kos) : kos; }
  function baharui(id) {
    var p = S().loadPlayer(), k = getKomuniti(p), j = pegang(k, id), d = cari(id);
    if (!j || !d) { return { ok: false, ralat: 'Anda tidak memegang jawatan ini.' }; }
    if (bulanBaki(p, j) > CONFIG.BAHARUI_DALAM) { return { ok: false, ralat: 'Pembaharuan hanya dalam ' + CONFIG.BAHARUI_DALAM + ' bulan terakhir tempoh.' }; }
    var kos = kosBaharui(p, d);
    if ((Number(p.myr) || 0) < kos) { return { ok: false, ralat: 'Dana tidak cukup (perlu ' + rm(kos) + ').' }; }
    j.tamat += CONFIG.TEMPOH;
    var r = simpan(k, { myr: -kos }, { log: { tindakan: 'komuniti_baharui', nama: 'Pembaharuan: ' + d.nama, peringkat: 'ahli' } });
    return r.ok ? { ok: true, mesej: 'Jawatan ' + d.nama + ' diperbaharui 3 tahun (kos ' + rm(kos) + ').' } : { ok: false, ralat: r.ralat };
  }
  function letak(id) {
    var p = S().loadPlayer(), k = getKomuniti(p), j = pegang(k, id), d = cari(id);
    if (!j || !d) { return { ok: false, ralat: 'Anda tidak memegang jawatan ini.' }; }
    return tamat(k, p, j, d, 'letak', {}, 'komuniti_letak').ok ? { ok: true, mesej: 'Anda meletak jawatan ' + d.nama + '.' } : { ok: false, ralat: 'Gagal menyimpan.' };
  }
  function tamat(k, p, j, d, sebab, kes, log) {
    k.jawatan = k.jawatan.filter(function (x) { return x.id !== j.id; });
    k.sejarah = k.sejarah.concat([{ tahun: p.tahun, bulan: p.bulan, nama: d.nama, hasil: sebab }]).slice(-10);
    return simpan(k, kes || {}, { tanpaKesukaran: true, log: { tindakan: log, nama: 'Jawatan komuniti tamat: ' + d.nama, peringkat: 'ahli' } });
  }

  function ringkasan(p) {
    var k = getKomuniti(p), kini = idx(p);
    var pegangan = k.jawatan.map(function (j) {
      var d = cari(j.id), baki = bulanBaki(p, j);
      return { id: j.id, nama: d.nama, ikon: d.ikon, ganjaran: d.ganjaran, risiko: d.risiko, konflik: j.konflik, audit: j.audit, bulanBaki: baki,
        bolehBaharui: baki <= CONFIG.BAHARUI_DALAM, kosBaharui: kosBaharui(p, d) };
    });
    return { jawatan: pegangan, penuh: k.jawatan.length >= CONFIG.MAKS, bil: k.jawatan.length, senarai: senarai(p), jenis: JENIS, sejarah: k.sejarah, umur: umur(p) };
  }

  /** Bulanan: ganjaran, risiko, pemecatan, tamat. Sekali sebulan. */
  function prosesBulan(o) {
    var p = S().loadPlayer(), ev = []; if (!p || p.tamat) { return { peristiwa: ev }; }
    var k = getKomuniti(p), kunci = p.tahun + '-' + p.bulan; if (k.akhir === kunci || !k.jawatan.length) { return { peristiwa: ev }; }
    k.akhir = kunci;
    var ig = IG(), skor = ig && ig.getIntegriti ? Number(ig.getIntegriti(p).skor) : 50, u = umur(p), kini = idx(p);
    var jum = { ip: 0, myr: 0, reputasi: 0, akarUmbi: 0 }, denda = 0, repLain = 0, skorIg = 0;
    k.jawatan.slice().forEach(function (j) {
      var d = cari(j.id), s = d.syarat;
      if (d.gajiTinggi && !bolehBerjawatanTinggi(p)) { tamat(k, p, j, d, 'bertembung', {}, 'komuniti_tamat'); ev.push({ jenis: 'komuniti_tamat', mesej: 'Jawatan ' + d.nama + ' tamat kerana anda memegang jawatan Menteri, EXCO atau GLC.' }); return; }
      if (s.umurMaks && u !== null && u > s.umurMaks) { tamat(k, p, j, d, 'umur', {}, 'komuniti_tamat'); ev.push({ jenis: 'komuniti_tamat', mesej: 'Jawatan ' + d.nama + ' tamat kerana anda melebihi had umur ' + s.umurMaks + ' tahun.' }); return; }
      j.konflik = clamp(j.konflik + d.risiko.konflik, 0, 100); j.audit = clamp(j.audit + d.risiko.audit, 0, 100);
      var risiko = j.audit >= CONFIG.AUDIT_MULA || (d.risiko.audit > 0 && skor < CONFIG.SKOR_RENDAH);
      var kemungkinan = risiko ? clamp((j.audit - CONFIG.AUDIT_MULA) / 200 + (skor < CONFIG.SKOR_RENDAH ? 0.1 : 0), 0.02, 0.6) : 0;
      if (risiko && rngBulan(p, o, 'pecat' + j.id)() < kemungkinan) {
        var dn = Math.min(CONFIG.DENDA, Math.max(0, (Number(p.myr) || 0) + jum.myr - denda));
        denda += dn; repLain -= 5; skorIg -= 10; tamat(k, p, j, d, 'dipecat', {}, 'komuniti_pecat');
        ev.push({ jenis: 'komuniti_pecat', mesej: 'SPRM menyiasat dan anda dipecat daripada ' + d.nama + '. Denda ' + rm(dn) + ', Reputasi -5, Integriti Parti -10.' });
        return;
      }
      var g = d.ganjaran; jum.ip += g.ip || 0; jum.myr += g.myr || 0; jum.reputasi += g.reputasi || 0; jum.akarUmbi += g.akarUmbi || 0;
      if (j.konflik >= 60) { repLain -= 1; }
      if (kini >= j.tamat) { tamat(k, p, j, d, 'tamat', {}, 'komuniti_tamat'); ev.push({ jenis: 'komuniti_tamat', mesej: 'Tempoh jawatan ' + d.nama + ' tamat.' }); }
    });
    var kes = { ip: jum.ip, myr: jum.myr - denda, reputasi: jum.reputasi + repLain };
    if (jum.akarUmbi) { kes.kesetiaan = { akarUmbi: jum.akarUmbi }; }
    var ada = k.jawatan.length || ev.length;
    simpan(k, kes, { tanpaKesukaran: true, log: ada ? { tindakan: 'komuniti_bulanan', nama: 'Jawatan komuniti: ganjaran bulanan', peringkat: 'bulan' } : undefined });
    if (skorIg && ig && ig.ubahSkor) { ig.ubahSkor(skorIg, 'Dipecat daripada jawatan komuniti'); }
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, JENIS: JENIS, JAWATAN: JAWATAN, getKomuniti: getKomuniti, senarai: senarai, lobi: lobi, baharui: baharui, letak: letak, ringkasan: ringkasan, prosesBulan: prosesBulan };
});
