/* ==========================================================================
   Nusa Politik — js/letak.js   (v13.12)
   Letak Jawatan: wakil rakyat (MP / ADUN) dan jawatan kerajaan (Menteri / EXCO / MB / TPM / PM).
   Mockup "Letak Jawatan & Syarat MB" (dipersetujui). Maklum balas pemain: lepaskan kerusi tanpa bersara supaya boleh Pindah Cawangan.
     - Letak jawatan kerajaan: kerusi kekal; jawatan tamat; Reputasi −2; tidak boleh dilobi semula selama 6 bulan.
     - Letak kerusi MP / ADUN: Reputasi −3, akar umbi −5; jawatan kerajaan yang bergantung pada kerusi itu turut tamat
       (MP → Timbalan Menteri, Menteri, TPM, PM; ADUN → EXCO, MB / Ketua Menteri / Premier, Menteri Negeri).
     - PRK bulan depan dengan calon parti (NPC); jika parti kalah, Reputasi −3 lagi.
       Tiada PRK jika 12 bulan atau kurang sebelum PRU / PRN yang mempertandingkan kerusi itu.
     - Dikunci semasa PRU / PRN atau PRK sedang berjalan.
   v13.19 (mockup "Letak Jawatan Parti", dipersetujui; maklum balas pemain di borang):
     - Letak jawatan parti: Stress −2 × beban jawatan serta-merta dan beban bulanan hilang; Reputasi 0 (Cawangan), −1 (Bahagian),
       −2 (Pusat), −3 (Presiden). Pengganti NPC; boleh bertanding semula pada pemilihan seterusnya. Tangga kerjaya kekal.
     - Presiden: Timbalan Presiden (NPC) menjadi Presiden; jika pemain PM, PM kekal hingga PRU dengan tekanan politik +10.
     - Dikunci semasa musim pemilihan parti (tahun pemilihan, bulan tetingkap dibuka) dan semasa PRU / PRK.
   ANDAIAN: peluang calon parti dalam PRK ikut Reputasi dan sentimen nasional (formula permainan, bukan ramalan).
   State: p.letak = { kabinetSehingga, prk:[{ jenis, nama, i }], sejarah:[] }.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikLetak = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function SW(k) { return k === 'PBB' || k === 'PRS' || k === 'SUPP' || k === 'PDP' || k === 'PSB'; }
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function PRK() { return modul('MyPolitikPRK', 'prk.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function ST() { return modul('MyPolitikStres', 'stress.js'); }
  function E() { return modul('MyPolitikElection', 'election.js'); }
  function CAL() { return modul('MyPolitikCalendar', 'calendar.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  var rngLalai = Math.random;
  function rng(o) { return (o && o.rng) || rngLalai; }
  var BULAN = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  function neg(n) { return n < 0 ? '−' + Math.abs(n) : '+' + n; }
  function tb(i) { return BULAN[(i - 1) % 12] + ' ' + Math.floor((i - 1) / 12); }

  var CONFIG = {
    KERAJAAN: { reputasi: -2, bertenang: 6 },
    KERUSI: { reputasi: -3, akarUmbi: -5 },
    PARTI: { stressKali: 2, presiden: -3, pusat: -2, bahagian: -1, cawangan: 0, pmTekanan: 10 },
    PRK: { bulanDepan: 1, tanpaPRK: 12, kalahReputasi: -3, asas: 0.55, rep: 0.008, sentimen: 0.012, min: 0.2, maks: 0.85 }
  };
  var PERSEKUTUAN = ['TIMBALAN_MENTERI', 'MENTERI_PENUH', 'TIMBALAN_PM', 'PERDANA_MENTERI'];
  var NEGERI = ['EXCO_NEGERI', 'MENTERI_BESAR'];

  function dasar() { return { kabinetSehingga: 0, prk: [], sejarah: [] }; }
  function getLetak(p) {
    var b = dasar(), x = p && p.letak && typeof p.letak === 'object' ? p.letak : {};
    for (var k in b) { if (x[k] === undefined) { x[k] = b[k]; } }
    if (!Array.isArray(x.prk)) { x.prk = []; }
    if (!Array.isArray(x.sejarah)) { x.sejarah = []; }
    return x;
  }
  function simpan(l, kesan, log) { return S().applyEffects(kesan || {}, { kiraTindakan: false, patch: { letak: l }, log: log }); }

  /** Jenis status → jenis kerusi PRK. */
  function jenisKerusi(st) { return st.jenis === 'ADUN' ? 'DUN' : 'PARLIMEN'; }
  /** Tahap kerajaan bergantung pada kerusi: 'MP' → persekutuan, 'ADUN' → negeri. */
  function bergantung(jenis, tahap) { return (jenis === 'MP' ? PERSEKUTUAN : NEGERI).indexOf(tahap) >= 0; }

  /** Dikunci semasa pilihan raya (PRU/PRN atau PRK) sedang berjalan. */
  function kunci(p) {
    var R = PRU(), K = PRK();
    if (R && R.getPRU && R.getPRU(p).aktif) { return 'Pilihan raya sedang berjalan.'; }
    if (K && K.getPRK && K.getPRK(p).aktif) { return 'PRK sedang berjalan.'; }
    if (p && p.tamat) { return 'Kerjaya sudah tamat.'; }
    return '';
  }
  /** Bulan lagi ke pilihan raya yang mempertandingkan kerusi ini (PRU, atau PRN bagi pemain Sarawak/Sabah). null = tidak diketahui. */
  function bulanKePilihanRaya(p, jenis) {
    var R = PRU(); if (!R || !R.getPRU) { return null; }
    var pru = R.getPRU(p), baki = (Number(pru.tahunPRU) || 0) * 12 + (Number(pru.bulanPRU) || 0) - idx(p);
    if (pru.jadualPBB) {                                                        // Sarawak / Sabah: DUN dalam PRN, Parlimen dalam PRU
      var musim = pru.jenisPBB === 'PRU' ? 'PRU' : 'PRN', perlu = jenis === 'ADUN' ? 'PRN' : 'PRU';
      if (musim !== perlu) { return baki + 12; }                                // pilihan raya kerusi ini selepas musim seterusnya (sekurang-kurangnya setahun lagi)
    }
    return baki;
  }
  function adaPRK(p, jenis) { var b = bulanKePilihanRaya(p, jenis); return b == null || b > CONFIG.PRK.tanpaPRK; }

  /** Senarai yang boleh dilepaskan: [{ id:'MP'|'ADUN'|'KERAJAAN', label, kerusi, sejak, kerajaan, ikut, prk }]. */
  function senarai(p) {
    var R = PRU(), K = KB(), h = [];
    var kb = K && K.getKabinet ? K.getKabinet(p) : null;
    (R && R.semuaStatus ? R.semuaStatus(p) : []).forEach(function (st) {
      var ikut = kb && kb.hasGovernmentRole && bergantung(st.jenis, kb.roleLevel) ? kb.portfolioName : '';
      h.push({ id: st.jenis, label: st.jenis === 'ADUN' ? 'ADUN' : 'Ahli Parlimen', kerusi: st.kerusi || '', sejak: st.sejakTahun ? tb(Number(st.sejakTahun) * 12 + (Number(st.sejakBulan) || 1)) : '',
        kerajaan: !!st.kerajaan, ikut: ikut, prk: adaPRK(p, st.jenis) });
    });
    if (kb && kb.hasGovernmentRole) {
      var fed = PERSEKUTUAN.indexOf(kb.roleLevel) >= 0;
      h.push({ id: 'KERAJAAN', label: kb.portfolioName, tahap: kb.roleLevel, persekutuan: fed, pm: kb.roleLevel === 'PERDANA_MENTERI' });
    }
    return h;
  }
  function status(p) { var s = kunci(p); return { boleh: !s, sebab: s }; }

  /* ---------- v13.19: jawatan parti ---------- */
  /** Musim pemilihan parti: tahun pemilihan dan bulan semasa dalam mana-mana tetingkap pencalonan / undi. */
  function musimPemilihan(p) {
    var Ee = E(), C = CAL();
    if (!Ee || !Ee.adalahTahunPemilihan || !Ee.adalahTahunPemilihan(p.tahun) || !C || !C.getTetingkap) { return false; }
    return ['cawangan', 'sayap_cawangan', 'bahagian', 'sayap_bahagian', 'pau'].some(function (k) { var w = null; try { w = C.getTetingkap(k, parseInt(p.bulan, 10)); } catch (e) { w = null; } return !!(w && w.status === 'dibuka'); });
  }
  function kunciParti(p) { var s = kunci(p); if (s) { return s; } return musimPemilihan(p) ? 'Musim pemilihan parti sedang berjalan.' : ''; }
  function statusParti(p) { var s = kunciParti(p); return { boleh: !s, sebab: s }; }
  function presidenJ(x) { return /^Presiden$/i.test(String(x && x.jawatan || '')); }
  function reputasiParti(x) { var C = CONFIG.PARTI, pg = Number(x.pangkat) || 0; return presidenJ(x) ? C.presiden : pg >= 8 ? C.pusat : pg >= 4 ? C.bahagian : C.cawangan; }
  function peringkatNama(x) { var pg = Number(x.pangkat) || 0; return presidenJ(x) || pg >= 8 ? 'Pusat' : pg >= 4 ? 'Bahagian' : 'Cawangan'; }
  /** Jawatan parti: [{ kod, jawatan, peringkat, pangkat, beban, reputasi, presiden }]. */
  function senaraiParti(p) {
    var Sx = ST(); if (!Sx || !Sx.pecahanBeban) { return []; }
    return Sx.pecahanBeban(p).map(function (x) { return { kod: x.kod, jawatan: x.jawatan, peringkat: peringkatNama(x), pangkat: x.pangkat, beban: x.beban, reputasi: reputasiParti(x), presiden: presidenJ(x) }; });
  }
  function bebanSebulan(p) { var Sx = ST(); return Sx && Sx.bebanEfektif ? Sx.bebanEfektif(p) : 0; }
  /** Letak jawatan parti mengikut kod. */
  function letakParti(kod) {
    var p = S().loadPlayer(), Sx = ST(); if (!p || !Sx) { return { ok: false, ralat: 'Tiada profil.' }; }
    var s = kunciParti(p); if (s) { return { ok: false, ralat: s }; }
    var x = senaraiParti(p).filter(function (y) { return y.kod === kod; })[0];
    if (!x) { return { ok: false, ralat: 'Anda tidak memegang jawatan ini.' }; }
    var r = Sx.lepasJawatan(kod); if (!r || !r.ok) { return { ok: false, ralat: 'Gagal meletak jawatan.' }; }
    var turun = CONFIG.PARTI.stressKali * x.beban, mesej = ['Anda meletak jawatan ' + x.jawatan + '.'];
    if (turun && Sx.laras) { Sx.laras({ stress: -turun }); mesej.push('Stress −' + turun + ', beban bulanan −' + x.beban + '.'); }
    p = S().loadPlayer();
    var l = getLetak(p); rekod(l, p, 'Letak jawatan parti: ' + x.jawatan);
    var K = KB(), kb = K && K.getKabinet ? K.getKabinet(p) : null;
    if (x.presiden) {
      mesej.push('Timbalan Presiden mengambil alih sebagai Presiden.');
      if (kb && kb.hasGovernmentRole && kb.roleLevel === 'PERDANA_MENTERI' && K.laras) { K.laras({ tekanan: CONFIG.PARTI.pmTekanan }); mesej.push('Anda kekal Perdana Menteri hingga PRU, tetapi tekanan politik +' + CONFIG.PARTI.pmTekanan + '.'); }
    }
    if (x.reputasi) { mesej.push('Reputasi ' + neg(x.reputasi) + '.'); }
    simpan(l, x.reputasi ? { reputasi: x.reputasi } : {}, { tindakan: 'letak_parti', nama: 'Letak jawatan parti: ' + x.jawatan, peringkat: 'ahli' });
    return { ok: true, mesej: mesej.join(' ') };
  }
  /** Tempoh bertenang lobi jawatan kerajaan selepas letak jawatan. */
  function bertenang(p) { var l = getLetak(p); return l.kabinetSehingga && idx(p) < l.kabinetSehingga ? l.kabinetSehingga : 0; }

  function rekod(l, p, teks) { l.sejarah = l.sejarah.concat([{ tahun: p.tahun, bulan: p.bulan, teks: teks }]).slice(-10); }

  /** Letak jawatan kerajaan (kerusi kekal). */
  function letakKerajaan() {
    var p = S().loadPlayer(), K = KB(); if (!p || !K) { return { ok: false, ralat: 'Tiada profil.' }; }
    var s = kunci(p); if (s) { return { ok: false, ralat: s }; }
    var kb = K.getKabinet(p); if (!kb.hasGovernmentRole) { return { ok: false, ralat: 'Anda tidak memegang jawatan kerajaan.' }; }
    var nama = kb.portfolioName, pm = kb.roleLevel === 'PERDANA_MENTERI';
    K.lucutJawatan('Anda meletak jawatan.');
    p = S().loadPlayer();
    var l = getLetak(p); l.kabinetSehingga = idx(p) + CONFIG.KERAJAAN.bertenang;
    rekod(l, p, 'Letak jawatan: ' + nama);
    var r = simpan(l, { reputasi: CONFIG.KERAJAAN.reputasi }, { tindakan: 'letak_kerajaan', nama: 'Letak jawatan: ' + nama, peringkat: 'ahli' });
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    return { ok: true, mesej: 'Anda meletak jawatan ' + nama + '. Reputasi ' + neg(CONFIG.KERAJAAN.reputasi) + '.' + (pm ? ' Timbalan Perdana Menteri mengambil alih sebagai Perdana Menteri.' : '') +
      ' Anda tidak boleh dilobi untuk jawatan kerajaan sehingga ' + tb(l.kabinetSehingga) + '.' };
  }

  /** Letak kerusi wakil rakyat. jenis: 'MP' | 'ADUN'. */
  function letakKerusi(jenis) {
    var p = S().loadPlayer(), R = PRU(), K = KB(); if (!p || !R) { return { ok: false, ralat: 'Tiada profil.' }; }
    var s = kunci(p); if (s) { return { ok: false, ralat: s }; }
    var pru = R.getPRU(p), st = [pru.status, pru.statusKedua].filter(function (x) { return x && x.jenis === jenis; })[0];
    if (!st) { return { ok: false, ralat: 'Anda tidak memegang kerusi ini.' }; }
    var label = jenis === 'ADUN' ? 'ADUN' : 'Ahli Parlimen', kerusi = st.kerusi || '', prk = adaPRK(p, jenis), mesej = [];
    var kb = K && K.getKabinet ? K.getKabinet(p) : null, ikut = kb && kb.hasGovernmentRole && bergantung(jenis, kb.roleLevel) ? kb.portfolioName : '';
    // 1. jawatan kerajaan bergantung
    if (ikut) { K.lucutJawatan('Kerusi dilepaskan.'); mesej.push('Jawatan ' + ikut + ' turut tamat.'); }
    // 2. buang status kerusi
    p = S().loadPlayer(); pru = R.getPRU(p);
    if (pru.status && pru.status.jenis === jenis) { pru.status = pru.statusKedua || null; pru.statusKedua = null; }
    else if (pru.statusKedua && pru.statusKedua.jenis === jenis) { pru.statusKedua = null; }
    // 3. PRK
    var l = getLetak(p);
    if (ikut) { l.kabinetSehingga = Math.max(Number(l.kabinetSehingga) || 0, idx(p) + CONFIG.KERAJAAN.bertenang); }
    if (prk) { l.prk = l.prk.concat([{ jenis: jenisKerusi(st), nama: kerusi, i: idx(p) + CONFIG.PRK.bulanDepan }]); mesej.push('PRK ' + (jenis === 'ADUN' ? 'DUN ' : 'Parlimen ') + kerusi + ' diadakan ' + tb(idx(p) + CONFIG.PRK.bulanDepan) + ' dengan calon parti.'); }
    else { mesej.push('Tiada PRK: kerusi kosong sehingga pilihan raya akan datang.'); }
    rekod(l, p, 'Letak kerusi ' + label + ' ' + kerusi);
    var r = S().applyEffects({ reputasi: CONFIG.KERUSI.reputasi, kesetiaan: { akarUmbi: CONFIG.KERUSI.akarUmbi } }, { kiraTindakan: false, patch: { pru: pru, letak: l },
      log: { tindakan: 'letak_kerusi', nama: 'Letak jawatan ' + label + ' ' + kerusi, peringkat: 'ahli' } });
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    return { ok: true, prk: prk, mesej: 'Anda meletak jawatan ' + label + ' ' + kerusi + '. Reputasi ' + neg(CONFIG.KERUSI.reputasi) + ', akar umbi ' + neg(CONFIG.KERUSI.akarUmbi) + '. ' + mesej.join(' ') };
  }

  /** Peluang calon parti menang PRK (ANDAIAN: ikut Reputasi dan sentimen nasional). */
  function peluangPRK(p) {
    var K = PRK(), sen = K && K.sentimenNasional ? Number(K.sentimenNasional(p)) || 0 : 0, C = CONFIG.PRK;
    return clamp(C.asas + ((Number(p.reputasi) || 50) - 50) * C.rep + sen * C.sentimen, C.min, C.maks);
  }
  /** Bulanan: selesaikan PRK calon parti yang sudah tiba. */
  function prosesBulan(o) {
    var p = S() && S().loadPlayer(), ev = [];
    if (!p || p.tamat || !p.letak) { return { peristiwa: ev }; }
    var l = getLetak(p), kini = idx(p), tiba = l.prk.filter(function (x) { return x.i <= kini; });
    if (!tiba.length) { return { peristiwa: ev }; }
    var r = rng(o), rep = 0;
    l.prk = l.prk.filter(function (x) { return x.i > kini; });
    tiba.forEach(function (x) {
      var pel = peluangPRK(p), menang = r() < pel, n = (x.jenis === 'DUN' ? 'DUN ' : 'Parlimen ') + x.nama;
      if (!menang) { rep += CONFIG.PRK.kalahReputasi; }
      rekod(l, p, 'PRK ' + n + ': calon parti ' + (menang ? 'menang' : 'kalah'));
      ev.push({ jenis: menang ? 'letak_prk_menang' : 'letak_prk_kalah', mesej: 'PRK ' + n + ' (selepas anda meletak jawatan): calon parti ' + (menang ? 'MENANG. Kerusi kekal milik parti.' : 'KALAH. Reputasi ' + neg(CONFIG.PRK.kalahReputasi) + '.') });
    });
    simpan(l, rep ? { reputasi: rep } : {}, { tindakan: 'letak_prk', nama: 'Keputusan PRK selepas letak jawatan', peringkat: 'ahli' });
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, setRng: function (f) { rngLalai = f || Math.random; }, getLetak: getLetak, senarai: senarai, status: status, kunci: kunci, adaPRK: adaPRK, bulanKePilihanRaya: bulanKePilihanRaya,
    bertenang: bertenang, senaraiParti: senaraiParti, statusParti: statusParti, musimPemilihan: musimPemilihan, bebanSebulan: bebanSebulan, letakParti: letakParti, letakKerajaan: letakKerajaan, letakKerusi: letakKerusi, peluangPRK: peluangPRK, prosesBulan: prosesBulan, tb: tb, neg: neg };
});
