/* ==========================================================================
   Nusa Politik — js/berjasa.js   (v13.53)
   BERJASA (Barisan Jemaah Islamiah Se-Malaysia), parti tanpa gabungan (kumpulan "Lain-lain"), MOD RINGAN: enjin yang sama seperti PPP
   (Cawangan, Kawasan = kawasan Parlimen, Pusat) tanpa peraturan perlembagaan khas (perlembagaan BERJASA tidak tersedia).
   Mekanik khas "Parti Kecil" (mockup BERJASA, dipersetujui):
     1. Kekuatan Parti (0-100, mula 8): undi parti 1% hingga 15%; naik melalui Dakwah & rekrut ahli dan kemenangan kerusi.
     2. Pakatan pilihan raya: 6 bulan sebelum PRU, runding dengan PN atau BN untuk 1-3 kerusi tanpa pertembungan. Gagal: bertanding solo.
     3. PRU solo: BERJASA boleh bertanding di mana-mana kawasan operasinya, tetapi kerusi sukar dimenangi (ofset undi negatif).
     4. Penentu kerajaan: Ahli Parlimen BERJASA boleh menawarkan sokongan kepada BN / PN / PH untuk jawatan Timbalan Menteri.
   State: p.berjasa = { kekuatan, dakwahBulan, pakatan:{pru, i, gab, jaya, kerusi}, penentu:{pru, gab, jaya}, pusat:{} }
   SEMUA ANGKA BERTANDA ANDAIAN IALAH ANDAIAN PERMAINAN. Permainan simulasi; bukan laman rasmi parti.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikBERJASA = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function DATA() { return modul('MyPolitikBERJASAData', 'berjasa-data.js') || { parlimen: {}, dun: {} }; }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(t, b) { return (parseInt(t, 10) || 0) * 12 + (parseInt(b, 10) || 1); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  var CONFIG = {
    TAHUN_MULA: 2027, KITARAN_TAHUN: 3, BULAN_PUSAT: 6,                 // ANDAIAN: Cawangan bulan 3, Kawasan bulan 5, Muktamar bulan 6; pemilihan setiap 3 tahun dari 2027
    KUOTA_PARLIMEN: 0, KUOTA_DUN: 0,                                    // tiada kuota gabungan: boleh bertanding solo di kawasan operasi
    KEKUATAN: { awal: 8, undiMin: 1, undiMaks: 15, menangMP: 6, menangADUN: 3 },
    DAKWAH: { ap: 2, myr: 2000, kekuatan: 1, akarUmbi: 2 },
    PAKATAN: { bulanSebelum: 6, asas: 20, skala: 0.8, maks: 70, gagal: -2, gab: ['PN', 'BN'] },
    OFSET: { solo: -14, soloSkala: 0.12, pakatan: -6, pakatanSkala: 0.06 },
    PENENTU: { bulan: 3, asas: 35, skala: 0.4, maks: 75, gagal: -3, gab: ['BN', 'PN', 'PH'] },
    UMUR_ANGKASA: 40,
    PUSAT: { sendiri: 60, lain: [30, 45], bonusSkala: 0.3, wakilBahagian: 5, mt: 19 }
  };
  var NAMA_GAB = { BN: 'Barisan Nasional', PN: 'Perikatan Nasional', PH: 'Pakatan Harapan' };

  function adalah(p) { return !!(p && p.parti === 'BERJASA'); }
  function st(p) {
    var m = p && p.berjasa && typeof p.berjasa === 'object' ? p.berjasa : {};
    if (typeof m.kekuatan !== 'number') { m.kekuatan = CONFIG.KEKUATAN.awal; }
    if (!m.pusat || typeof m.pusat !== 'object') { m.pusat = {}; }
    return m;
  }
  function simpan(p, m, kesan, log, patchTambah) {
    var patch = { berjasa: m }; if (patchTambah) { for (var k in patchTambah) { patch[k] = patchTambah[k]; } }
    return S().applyEffects(kesan || {}, { kiraTindakan: !!(log && log.kira), patch: patch, log: log && log.nama ? { tindakan: log.tindakan || 'berjasa', nama: log.nama, peringkat: 'ahli' } : undefined });
  }
  function sekarang(p) { return idx(p.tahun, p.bulan); }
  function kodPL(p) { var k = p && p.kod && p.kod.parlimen; return k ? 'P.' + String(parseInt(k, 10)).padStart(3, '0') : null; }
  function kekuatan(p) { return st(p).kekuatan; }
  /** Undi parti (peratus) ikut Kekuatan: 1% hingga 15%. */
  function undiParti(p) { var K = CONFIG.KEKUATAN; return Math.round((K.undiMin + kekuatan(p) / 100 * (K.undiMaks - K.undiMin)) * 10) / 10; }

  /* ---------- PRU: jadual dan riwayat ---------- */
  function getPRU(p) { var P0 = PRU(); try { return P0 && P0.getPRU ? P0.getPRU(p) : (p && p.pru) || {}; } catch (e) { return (p && p.pru) || {}; } }
  function jadualPRU(p) { var pr = getPRU(p); return pr && pr.tahunPRU ? idx(pr.tahunPRU, pr.bulanPRU || 3) : idx(2031, 3); }
  function pruAktif(p) { var pr = getPRU(p); return !!(pr && pr.aktif); }
  function pruTerakhir(p) { var r = (getPRU(p).riwayat || []).filter(function (x) { return x && x.jenis !== 'PRN'; }); var l = r[r.length - 1]; return l ? idx(l.tahun, l.bulan) : 0; }
  /** Pakatan yang sah untuk PRU akan datang (dirunding selepas PRU terakhir). */
  function pakatanSah(p) { var m = st(p); return m.pakatan && pruTerakhir(p) < m.pakatan.i ? m.pakatan : null; }

  /* ---------- Kawasan (antara muka sama seperti MCA/MIC/PPP untuk js/pru.js) ---------- */
  function kawasan(p) {
    var d = DATA(), kp = kodPL(p), pl = kp ? d.parlimen[kp] : null, dn = null;
    if (pl && p.kod && p.kod.dun && parseInt(p.kod.dun, 10) > 0) { var kd = pl.ng + '_N.' + String(parseInt(p.kod.dun, 10)).padStart(2, '0'); dn = d.dun[kd] ? Object.assign({ kod: kd }, d.dun[kd]) : null; }
    return { parlimen: pl ? Object.assign({ kod: kp }, pl) : null, dun: dn, kuotaPL: !!pl, kuotaDUN: !!dn, bilBahagian: Object.keys(d.parlimen).length };
  }
  function sebabKuota(p, jenis) { return 'Kerusi ' + (jenis === 'DUN' ? 'DUN' : 'Parlimen') + ' ini di luar kawasan operasi BERJASA'; }
  /** Ofset undi kerusi: solo jauh lebih sukar; pakatan mengelak pertembungan dengan rakan. */
  function ofset(p) {
    var O = CONFIG.OFSET, k = kekuatan(p), pk = pakatanSah(p);
    return Math.round((pk && pk.jaya ? O.pakatan + k * O.pakatanSkala : O.solo + k * O.soloSkala) * 10) / 10;
  }
  function lawan(p) {
    var pk = pakatanSah(p);
    if (pk && pk.jaya) { return pk.gab === 'PN' ? ['BN', 'PH'] : ['PN', 'PH']; }
    return ['PN', 'BN'];
  }
  /** Anggaran kerusi Parlimen nasional (js/pru.js janaNasional, js/paparan.js): parti kecil, tiada rakan gabungan. */
  function kerusiParlimen(pop, rng) {
    var Sv = S(), p = Sv && Sv.loadPlayer ? Sv.loadPlayer() : null, k = p ? kekuatan(p) : CONFIG.KEKUATAN.awal, pk = p ? pakatanSah(p) : null;
    var n = Math.floor(k / 25 + rng() * 1.6 + (pk && pk.jaya ? pk.kerusi * 0.5 : 0));
    return { parti: clamp(n, 0, 12), rakan: 0 };
  }
  /** Bahagian kerusi DUN negeri: kecil, sedikit lebih tinggi di Kelantan dan Terengganu. */
  function kadarDUN(kodNegeri, pop, rng) {
    var Sv = S(), p = Sv && Sv.loadPlayer ? Sv.loadPlayer() : null, k = p ? kekuatan(p) : CONFIG.KEKUATAN.awal, pantai = String(kodNegeri) === '3' || String(kodNegeri) === '11';
    return clamp(k / 100 * (pantai ? 0.12 : 0.06) + rng() * 0.03, 0, 0.3);
  }

  /* ---------- Kitaran pemilihan 3 tahun dari 2027 (ANDAIAN) ---------- */
  function adalahTahunPemilihan(p, tahun) { var t = parseInt(tahun, 10); return t >= CONFIG.TAHUN_MULA && (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN === 0; }
  function tahunSeterusnya(p, tahun) { var t = parseInt(tahun, 10); if (t <= CONFIG.TAHUN_MULA) { return CONFIG.TAHUN_MULA; } var b = (t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN; return b === 0 ? t : t + CONFIG.KITARAN_TAHUN - b; }
  function tahunLepas(p, tahun) { var t = parseInt(tahun, 10); return t < CONFIG.TAHUN_MULA ? null : t - ((t - CONFIG.TAHUN_MULA) % CONFIG.KITARAN_TAHUN); }

  /* ---------- Muktamar: pemilihan Pusat (ANDAIAN 5 perwakilan setiap Kawasan + 19 AJK Pusat) ---------- */
  function ringkasPusat(p) {
    var d = DATA(), m = st(p), own = kodPL(p), ks = Object.keys(d.parlimen), jum = 0;
    ks.forEach(function (k) { var v = m.pusat[k]; if (typeof v !== 'number') { var c = CONFIG.PUSAT.lain; v = k === own ? CONFIG.PUSAT.sendiri : c[0] + (hash(String(p.id) + '|berjasa|' + k) % (c[1] - c[0] + 1)); } jum += v; });
    var purata = ks.length ? jum / ks.length : 0, pengundi = ks.length * CONFIG.PUSAT.wakilBahagian + CONFIG.PUSAT.mt;
    return { purata: Math.round(purata * 10) / 10, pengundi: pengundi, bilBahagian: ks.length, sokongUndi: Math.round(pengundi * purata / 100) };
  }
  function bonusPusat(p) { return adalah(p) ? Math.round((ringkasPusat(p).purata - 40) * CONFIG.PUSAT.bonusSkala * 10) / 10 : 0; }

  /* ---------- Tindakan 1: Dakwah & rekrut ahli ---------- */
  function statusDakwah(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk BERJASA.' }; }
    var m = st(p); if (m.dakwahBulan === sekarang(p)) { return { boleh: false, sebab: 'Sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < CONFIG.DAKWAH.ap) { return { boleh: false, sebab: 'Mata Tindakan (AP) tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < CONFIG.DAKWAH.myr) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, sebab: '' };
  }
  function dakwah() {
    var p = S().loadPlayer(), s0 = statusDakwah(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    var m = st(p), a = m.kekuatan, D = CONFIG.DAKWAH; m.kekuatan = clamp(a + D.kekuatan, 0, 100); m.dakwahBulan = sekarang(p);
    var r = simpan(p, m, { ap: -D.ap, myr: -D.myr, kesetiaan: { akarUmbi: D.akarUmbi } }, { kira: true, tindakan: 'berjasa_dakwah', nama: 'Dakwah & rekrut ahli BERJASA' });
    return r.ok ? { ok: true, mesej: 'Program dakwah dan pendaftaran ahli baharu di kawasan anda. Kekuatan Parti ' + a + ' → ' + m.kekuatan + ', sokongan akar umbi +' + D.akarUmbi + '.' } : { ok: false, ralat: r.ralat };
  }

  /* ---------- Tindakan 2: Pakatan pilihan raya (6 bulan sebelum PRU) ---------- */
  function peluangPakatan(p) { var P = CONFIG.PAKATAN; return Math.round(clamp(P.asas + kekuatan(p) * P.skala, 0, P.maks)); }
  function statusPakatan(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk BERJASA.' }; }
    if (pakatanSah(p)) { return { boleh: false, sebab: 'Rundingan pakatan untuk PRU ini sudah dibuat.', sudah: true }; }
    var j = jadualPRU(p), now = sekarang(p);
    if (!(pruAktif(p) || (now >= j - CONFIG.PAKATAN.bulanSebelum && now <= j))) { return { boleh: false, sebab: 'Hanya ' + CONFIG.PAKATAN.bulanSebelum + ' bulan sebelum PRU.' }; }
    if (pruTerakhir(p) >= now) { return { boleh: false, sebab: 'PRU baru selesai.' }; }
    return { boleh: true, sebab: '' };
  }
  function runding(gab, o) {
    var p = S().loadPlayer(), s0 = statusPakatan(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    if (CONFIG.PAKATAN.gab.indexOf(gab) < 0) { return { ok: false, ralat: 'Pilih PN atau BN.' }; }
    var m = st(p), r = (o && o.rng) || S().rngBerbenih(String(p.id) + '|berjasa|pakatan|' + sekarang(p)), pel = peluangPakatan(p), jaya = r() * 100 < pel;
    var kerusi = jaya ? clamp(1 + Math.floor(m.kekuatan / 30), 1, 3) : 0;
    m.pakatan = { pru: jadualPRU(p), i: sekarang(p), gab: gab, jaya: jaya, kerusi: kerusi, peluang: pel };
    if (!jaya) { m.kekuatan = clamp(m.kekuatan + CONFIG.PAKATAN.gagal, 0, 100); }
    var res = simpan(p, m, {}, { kira: true, tindakan: 'berjasa_pakatan', nama: 'Pakatan pilihan raya dengan ' + gab + (jaya ? ' (berjaya)' : ' (gagal)') });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    return { ok: true, jaya: jaya, mesej: jaya ? NAMA_GAB[gab] + ' bersetuju tidak meletak calon di ' + kerusi + ' kerusi BERJASA. Kerusi anda termasuk dalam pakatan: tiada pertembungan dengan ' + gab + '.'
      : NAMA_GAB[gab] + ' menolak pakatan (peluang ' + pel + '%). BERJASA bertanding solo; Kekuatan Parti ' + CONFIG.PAKATAN.gagal + '.' };
  }

  /* ---------- Tindakan 3: Penentu kerajaan (Ahli Parlimen BERJASA selepas PRU) ---------- */
  function statusMP(p) { var pr = getPRU(p); return [pr.status, pr.statusKedua].filter(function (x) { return x && x.jenis === 'MP'; })[0] || null; }
  function peluangPenentu(p) { var P = CONFIG.PENENTU; return Math.round(clamp(P.asas + kekuatan(p) * P.skala, 0, P.maks)); }
  function statusPenentu(p) {
    if (!adalah(p)) { return { boleh: false, sebab: 'Hanya untuk BERJASA.' }; }
    var mp = statusMP(p); if (!mp) { return { boleh: false, sebab: 'Hanya Ahli Parlimen BERJASA selepas PRU.' }; }
    if (mp.kerajaan) { return { boleh: false, sebab: 'Anda sudah menyokong kerajaan.', sudah: true }; }
    var m = st(p), t = pruTerakhir(p); if (m.penentu && m.penentu.pru === t) { return { boleh: false, sebab: 'Tawaran sokongan sudah dibuat selepas PRU ini.', sudah: true }; }
    if (sekarang(p) > t + CONFIG.PENENTU.bulan) { return { boleh: false, sebab: 'Hanya dalam ' + CONFIG.PENENTU.bulan + ' bulan selepas PRU.' }; }
    var K = KB(), k = K && K.getKabinet ? K.getKabinet(p) : null; if (k && k.hasGovernmentRole) { return { boleh: false, sebab: 'Sudah memegang jawatan kerajaan.' }; }
    return { boleh: true, sebab: '' };
  }
  function sokong(gab, o) {
    var p = S().loadPlayer(), s0 = statusPenentu(p); if (!s0.boleh) { return { ok: false, ralat: s0.sebab }; }
    if (CONFIG.PENENTU.gab.indexOf(gab) < 0) { return { ok: false, ralat: 'Pilih BN, PN atau PH.' }; }
    var m = st(p), r = (o && o.rng) || S().rngBerbenih(String(p.id) + '|berjasa|penentu|' + sekarang(p)), pel = peluangPenentu(p), jaya = r() * 100 < pel;
    m.penentu = { pru: pruTerakhir(p), gab: gab, jaya: jaya };
    if (!jaya) { m.kekuatan = clamp(m.kekuatan + CONFIG.PENENTU.gagal, 0, 100); }
    var res = simpan(p, m, {}, { kira: true, tindakan: 'berjasa_penentu', nama: 'Tawaran sokongan kepada ' + gab + (jaya ? ' (diterima)' : ' (ditolak)') });
    if (!res.ok) { return { ok: false, ralat: res.ralat }; }
    if (!jaya) { return { ok: true, jaya: false, mesej: NAMA_GAB[gab] + ' tidak memerlukan sokongan BERJASA (peluang ' + pel + '%). Kekuatan Parti ' + CONFIG.PENENTU.gagal + '.' }; }
    // diterima: status MP kerajaan dan jawatan Timbalan Menteri
    var p2 = S().loadPlayer(), pr = getPRU(p2);
    ['status', 'statusKedua'].forEach(function (k) { if (pr[k] && pr[k].jenis === 'MP') { pr[k].kerajaan = true; } });
    S().applyEffects({}, { kiraTindakan: false, patch: { pru: pr } });
    var K = KB(), nama = 'Timbalan Menteri Hal Ehwal Agama'; if (K && K.lantikTM) { K.lantikTM(nama); }
    return { ok: true, jaya: true, mesej: NAMA_GAB[gab] + ' menerima sokongan BERJASA. Anda dilantik sebagai ' + nama + '.' };
  }

  /* ---------- Bulanan (rantaian kalendar) ---------- */
  function prosesBulan() {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat || !adalah(p)) { return { peristiwa: ev }; }
    var m = st(p), patch = null, msj = [], now = sekarang(p);
    // ANGKASA: had umur 40 (ANDAIAN) -> laluan sayap bertukar ke parti induk
    var H = modul('MyPolitikHayat', 'hayat.js'), umur = H && H.umurSemasa ? H.umurSemasa(p) : 0;
    if (p.sayap === 'pemuda' && umur > CONFIG.UMUR_ANGKASA) { patch = { sayap: 'utama' }; msj.push('Anda kini berumur ' + umur + ' tahun. Had umur ANGKASA ialah ' + CONFIG.UMUR_ANGKASA + ' tahun ke bawah (andaian permainan), jadi laluan sayap anda bertukar ke parti induk.'); }
    // kemenangan kerusi selepas PRU menaikkan Kekuatan Parti (sekali bagi setiap PRU)
    var t = pruTerakhir(p), pr = getPRU(p);
    if (t && m.menangPRU !== t && t < now) {
      m.menangPRU = t; var naik = 0;
      [pr.status, pr.statusKedua].forEach(function (x) { if (x && x.sejakTahun && idx(x.sejakTahun, x.sejakBulan) === t) { naik += x.jenis === 'MP' ? CONFIG.KEKUATAN.menangMP : CONFIG.KEKUATAN.menangADUN; } });
      if (naik) { m.kekuatan = clamp(m.kekuatan + naik, 0, 100); msj.push('Kemenangan kerusi BERJASA dalam PRU menarik ahli baharu: Kekuatan Parti +' + naik + '.'); }
    }
    // peringatan pakatan
    var j = jadualPRU(p);
    if (!pakatanSah(p) && now === j - CONFIG.PAKATAN.bulanSebelum) { msj.push('PRU dijangka dalam ' + CONFIG.PAKATAN.bulanSebelum + ' bulan. Runding pakatan pilihan raya dengan PN atau BN dalam kad BERJASA (tab Profil); jika tidak, BERJASA bertanding solo.'); }
    simpan(p, m, {}, null, patch);
    msj.forEach(function (x) { ev.push({ jenis: 'berjasa', mesej: x }); });
    return { peristiwa: ev };
  }

  /** Ringkasan untuk kad UI. */
  function keadaan(p) {
    var m = st(p), pk = pakatanSah(p);
    return { kekuatan: m.kekuatan, undi: undiParti(p), pakatan: pk, peluangPakatan: peluangPakatan(p), peluangPenentu: peluangPenentu(p), ofset: ofset(p),
      dakwah: statusDakwah(p), statusPakatan: statusPakatan(p), statusPenentu: statusPenentu(p), penentu: m.penentu || null, jadualPRU: jadualPRU(p) };
  }

  return { CONFIG: CONFIG, adalah: adalah, kawasan: kawasan, sebabKuota: sebabKuota, ofset: ofset, lawan: lawan, kerusiParlimen: kerusiParlimen, kadarDUN: kadarDUN,
    adalahTahunPemilihan: adalahTahunPemilihan, tahunLepas: tahunLepas, tahunSeterusnya: tahunSeterusnya, ringkasPusat: ringkasPusat, bonusPusat: bonusPusat,
    kekuatan: kekuatan, undiParti: undiParti, pakatanSah: pakatanSah, keadaan: keadaan,
    statusDakwah: statusDakwah, dakwah: dakwah, statusPakatan: statusPakatan, runding: runding, statusPenentu: statusPenentu, sokong: sokong, prosesBulan: prosesBulan };
});
