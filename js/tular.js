/* ==========================================================================
   Nusa Politik — js/tular.js   (v12.9)
   Krisis Media Sosial & Pertahanan Digital (Cybertrooper & Viral Crisis Engine).
   State: p.tular = { pertahanan (cyberDefenseScore 0-100), krisis (null | { id, k, konteks, tahun, bulan, hari, dipapar }),
                      akhir (indeks bulan krisis terakhir), kempenKunci, latihAkhir, sejarah }.
   Disambung kepada meter sedia ada (js/media.js), bukan meter baharu:
     publicPerception = 100 - p.media.persepsi (Persepsi Negatif), pengundi muda = p.media.belia (Sokongan Belia).
   mediaCrisisActive = !!p.tular.krisis.
   Krisis muncul (a) bulanan bagi pemegang jawatan / wakil rakyat, atau (b) semasa kempen PRU/PRN (sekali sekempen).
   Semua senario ialah rekaan. SEMUA ANGKA IALAH ANDAIAN PERMAINAN.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikTular = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function MD() { return modul('MyPolitikMedia', 'media.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function ET() { return modul('MyPolitikEtika', 'etika.js'); }
  function IG() { return modul('MyPolitikIntegriti', 'integriti.js'); }
  function ST() { return modul('MyPolitikStres', 'stress.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }

  var CONFIG = {
    PERTAHANAN_AWAL: 20, PERTAHANAN_SUSUT: 2,
    BULANAN: { asas: 0.10, persepsi: 0.002, etikaBuruk: 0.05, pertahanan: 0.0008, min: 0.03, maks: 0.30, jeda: 3 },
    KEMPEN: { asas: 0.06, pertahanan: 0.0004, min: 0.02, harian: { undi: 1, persepsi: 2 } },
    LINDUNG: 200,                                                   // kerosakan x (1 - pertahanan / 200): pertahanan 100 = separuh
    KONTRA: { dana: 3000, danaKempen: 1500, asas: 0.65, pertahanan: 0.003, maks: 0.95, persepsi: -6, pertahananNaik: 5,
              gagal: { persepsi: 3, etika: 8 } },
    SIDANG: { ap: 1, asas: 0.45, integriti: 0.004, maks: 0.85, persepsi: -4, skor: 4, reputasi: 2,
              gagal: { persepsi: 6, skor: -3, reputasi: -2, stress: 5 } },
    DIAM: { persepsi: 8, belia: -6, undi: -2 },
    LATIH: { dana: 3000, pertahanan: 10, jeda: 2 }
  };
  var KRISIS = [
    { id: 'video', ikon: '🎬', tajuk: 'Video ucapan anda disunting dan tular', huraian: 'Klip pendek ucapan anda dipotong dan diberi sari kata yang memutar belit maksud. Ia dikongsi beribu kali dalam sehari.' },
    { id: 'dokumen', ikon: '🧾', tajuk: 'Dokumen palsu: dakwaan salah guna dana program', huraian: 'Tangkap layar dokumen yang kononnya menunjukkan dana program kebajikan disalurkan kepada syarikat kenalan anda. Dokumen itu tidak sahih, tetapi sudah tular.' },
    { id: 'petikan', ikon: '💬', tajuk: 'Kenyataan anda dipetik separuh', huraian: 'Sebahagian kenyataan anda dalam forum dipetik tanpa konteks sehingga kedengaran seperti menghina golongan petani.' },
    { id: 'akaun', ikon: '👤', tajuk: 'Akaun palsu menyamar sebagai anda', huraian: 'Satu akaun media sosial menggunakan nama dan gambar anda untuk menyiarkan kenyataan yang menyinggung masyarakat setempat.' },
    { id: 'gambar', ikon: '📷', tajuk: 'Gambar lama disalah konteks', huraian: 'Gambar anda di sebuah majlis bertahun lalu dikaitkan dengan individu yang kini disiasat. Kapsyen tular mendakwa anda rakan niaganya.' },
    { id: 'keluarga', ikon: '🏠', tajuk: 'Fitnah tentang ahli keluarga', huraian: 'Hantaran tular mendakwa ahli keluarga anda mendapat kontrak kerajaan tanpa tender. Tiada bukti dikemukakan.' }
  ];
  var KETERUKAN = { 1: 'Sederhana', 2: 'Serius', 3: 'Sangat serius' };

  function dasar() { return { pertahanan: CONFIG.PERTAHANAN_AWAL, krisis: null, akhir: -999, kempenKunci: null, latihAkhir: -999, sejarah: [] }; }
  function ambil(p) {
    var b = dasar(), d = p && p.tular && typeof p.tular === 'object' ? p.tular : {};
    for (var f in b) { if (d[f] === undefined) { d[f] = b[f]; } }
    return d;
  }
  function cari(id) { return KRISIS.filter(function (x) { return x.id === id; })[0] || null; }
  function layak(p) { var M = MD(); return !!(p && !p.tamat && M && M.aktif && M.aktif(p)); }
  function kempenAktif(p) { var P = PRU(), a = P && P.getPRU ? P.getPRU(p).aktif : null; return a && a.fasa === 'kempen' ? a : null; }
  function media(p) { var M = MD(); return M && M.getMedia ? M.getMedia(p) : { persepsi: 35, belia: 40 }; }
  function lindung(t) { return 1 - clamp(t.pertahanan, 0, 100) / CONFIG.LINDUNG; }
  function skorIntegriti(p) { var I = IG(); return I && I.getIntegriti ? I.getIntegriti(p).skor : 70; }
  function rng(o, p, tag) { return (o && o.rng) || S().rngBerbenih(String(p.id) + '|tular|' + tag + '|' + idx(p)); }

  /** Ringkasan untuk paparan. */
  function keadaan(p) {
    var t = ambil(p), m = media(p), k = t.krisis, def = k ? cari(k.id) : null;
    return { cyberDefenseScore: Math.round(t.pertahanan), publicPerception: 100 - Math.round(m.persepsi), belia: Math.round(m.belia), mediaCrisisActive: !!k,
      krisis: k && def ? { id: k.id, ikon: def.ikon, tajuk: def.tajuk, huraian: def.huraian, keterukan: k.k, keterukanNama: KETERUKAN[k.k], konteks: k.konteks, dipapar: !!k.dipapar, pilihan: pilihan(p, t, k) } : null,
      latih: statusLatih(p, t) };
  }
  /** Pilihan tindak balas dengan kos, peluang dan kesan (untuk popup). */
  function pilihan(p, t, k) {
    var a = k.konteks === 'kempen' ? kempenAktif(p) : null, L = lindung(t), C = CONFIG;
    var kos = a ? C.KONTRA.danaKempen * k.k : C.KONTRA.dana * k.k, dana = a ? Number(a.campaignFunds) || 0 : Number(p.myr) || 0;
    var pk = Math.round(clamp(C.KONTRA.asas + t.pertahanan * C.KONTRA.pertahanan, 0, C.KONTRA.maks) * 100);
    var ps = Math.round(clamp(C.SIDANG.asas + skorIntegriti(p) * C.SIDANG.integriti, 0, C.SIDANG.maks) * 100);
    return [
      { id: 'kontra', nama: '📣 Lancar Kontra-Naratif (agensi PR & pasukan digital)', kos: kos, sumber: a ? 'dana kempen' : 'Dana', peluang: pk,
        teks: 'Kos RM ' + kos.toLocaleString('ms-MY') + ' (' + (a ? 'dana kempen' : 'Dana') + ') · berjaya ' + pk + '%: persepsi negatif ' + C.KONTRA.persepsi * k.k + '%, pertahanan digital +' + C.KONTRA.pertahananNaik + ' · gagal: dikesan sebagai kempen berbayar, persepsi negatif +' + Math.round(C.KONTRA.gagal.persepsi * k.k * L) + '% dan risiko Tataetika',
        boleh: dana >= kos, sebab: dana >= kos ? '' : (a ? 'Dana kempen tidak cukup.' : 'Dana tidak cukup.') },
      { id: 'sidang', nama: '🎤 Adakan Sidang Media Terbuka', peluang: ps,
        teks: (a ? 'Tiada kos' : 'Kos ' + C.SIDANG.ap + ' AP') + ' · berjaya ' + ps + '% (ikut Integriti Parti): persepsi negatif ' + C.SIDANG.persepsi * k.k + '%, Integriti +' + C.SIDANG.skor + ', Reputasi +' + C.SIDANG.reputasi + ' · silap cakap: persepsi negatif +' + Math.round(C.SIDANG.gagal.persepsi * k.k * L) + '%, Integriti ' + C.SIDANG.gagal.skor + ', Reputasi ' + C.SIDANG.gagal.reputasi,
        boleh: a || (Number(p.ap) || 0) >= C.SIDANG.ap, sebab: 'AP tidak cukup.' },
      { id: 'diam', nama: '🤐 Diam, biarkan berlalu',
        teks: 'Tiada kos · persepsi negatif +' + Math.round(C.DIAM.persepsi * k.k * L) + '%, Sokongan Belia ' + Math.round(C.DIAM.belia * k.k * L) + (a ? ', sokongan pengundi ' + Math.round(C.DIAM.undi * k.k * L * 10) / 10 + '%' : ''),
        boleh: true, sebab: '' }
    ];
  }
  function statusLatih(p, t) {
    var C = CONFIG.LATIH, baki = C.jeda - (idx(p) - t.latihAkhir);
    if (!layak(p)) { return { boleh: false, sebab: 'Perlu memegang jawatan atau menjadi wakil rakyat.' }; }
    if (baki > 0) { return { boleh: false, sebab: 'Boleh dilatih semula dalam ' + baki + ' bulan.' }; }
    if (t.pertahanan >= 100) { return { boleh: false, sebab: 'Pertahanan digital sudah maksimum.' }; }
    if ((Number(p.myr) || 0) < C.dana) { return { boleh: false, sebab: 'Dana tidak cukup.' }; }
    return { boleh: true, sebab: '', dana: C.dana, naik: C.pertahanan };
  }

  /** Cipta krisis (dalaman). */
  function cipta(p, t, r, konteks) {
    var baru = t.sejarah.slice(-3).map(function (h) { return h.id; }), calon = KRISIS.filter(function (x) { return baru.indexOf(x.id) < 0; });
    var def = calon[Math.floor(r() * calon.length)] || KRISIS[0], k = 1 + Math.floor(r() * 3);
    var a = konteks === 'kempen' ? kempenAktif(p) : null;
    t.krisis = { id: def.id, k: k, konteks: konteks, tahun: p.tahun, bulan: p.bulan, hari: a ? a.hari : null, dipapar: false };
    t.akhir = idx(p);
    return def;
  }

  /** Kesan pilihan. Pulang { ok, mesej, jaya }. */
  function jawab(id, o) {
    var Sv = S(), p = Sv.loadPlayer(), t = ambil(p), k = t.krisis;
    if (!k) { return { ok: false, ralat: 'Tiada krisis tular.' }; }
    var op = pilihan(p, t, k).filter(function (x) { return x.id === id; })[0];
    if (!op) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    if (!op.boleh) { return { ok: false, ralat: op.sebab }; }
    var r = rng(o, p, 'jawab'), C = CONFIG, L = lindung(t), m = media(p), a = k.konteks === 'kempen' ? kempenAktif(p) : null;
    var kes = {}, patch = {}, mesej, jaya = null, skor = 0, etika = 0, stress = 0, undi = 0, def = cari(k.id);
    if (id === 'kontra') {
      jaya = r() < op.peluang / 100;
      if (a) { a.campaignFunds -= op.kos; } else { kes.myr = -op.kos; }
      if (jaya) { m.persepsi = clamp(m.persepsi + C.KONTRA.persepsi * k.k, 0, 100); t.pertahanan = clamp(t.pertahanan + C.KONTRA.pertahananNaik, 0, 100); mesej = 'Kontra-naratif berjaya: fakta sebenar tersebar lebih luas daripada fitnah. Persepsi negatif kini ' + m.persepsi + '%.'; }
      else { m.persepsi = clamp(m.persepsi + Math.round(C.KONTRA.gagal.persepsi * k.k * L), 0, 100); etika = C.KONTRA.gagal.etika; mesej = 'Kontra-naratif gagal: netizen mendedahkan ia kempen berbayar. Persepsi negatif kini ' + m.persepsi + '%.'; }
    } else if (id === 'sidang') {
      jaya = r() < op.peluang / 100;
      if (!a) { kes.ap = -C.SIDANG.ap; }
      if (jaya) { m.persepsi = clamp(m.persepsi + C.SIDANG.persepsi * k.k, 0, 100); skor = C.SIDANG.skor; kes.reputasi = C.SIDANG.reputasi; mesej = 'Sidang media meyakinkan: anda menjawab setiap dakwaan dengan bukti. Persepsi negatif kini ' + m.persepsi + '%.'; }
      else { var g = C.SIDANG.gagal; m.persepsi = clamp(m.persepsi + Math.round(g.persepsi * k.k * L), 0, 100); skor = g.skor; kes.reputasi = g.reputasi; stress = g.stress; mesej = 'Silap cakap dalam sidang media: satu jawapan anda pula menjadi klip tular baharu. Persepsi negatif kini ' + m.persepsi + '%.'; }
    } else {
      m.persepsi = clamp(m.persepsi + Math.round(C.DIAM.persepsi * k.k * L), 0, 100); m.belia = clamp(m.belia + Math.round(C.DIAM.belia * k.k * L), 0, 100);
      if (a) { undi = Math.round(C.DIAM.undi * k.k * L * 10) / 10; }
      mesej = 'Anda memilih untuk diam. Fitnah terus beredar tanpa jawapan: persepsi negatif kini ' + m.persepsi + '%, Sokongan Belia ' + m.belia + '%.';
    }
    if (a && undi) { a.voterSupport = clamp(Math.round((a.voterSupport + undi) * 10) / 10, 0, 100); }
    t.sejarah.push({ id: k.id, k: k.k, pilihan: id, jaya: jaya, tahun: p.tahun, bulan: p.bulan }); t.sejarah = t.sejarah.slice(-12); t.krisis = null;
    patch.tular = t; patch.media = m;
    if (a) { var pru = PRU().getPRU(p); pru.aktif = a; patch.pru = pru; }
    var res = Sv.applyEffects(kes, { kiraTindakan: false, patch: patch, log: { tindakan: 'tular_' + id, nama: 'Krisis tular: ' + (id === 'kontra' ? (jaya ? 'Kontra-naratif berjaya' : 'Kontra-naratif gagal') : id === 'sidang' ? (jaya ? 'Sidang media berjaya' : 'Sidang media, silap cakap') : 'Diam'), peringkat: 'ahli' } });
    if (!res || !res.ok) { return { ok: false, ralat: res ? res.ralat : 'Gagal disimpan.' }; }
    var I = IG(); if (I && I.ubahSkor && skor) { I.ubahSkor(skor, 'Krisis tular: sidang media'); }
    var St = ST(); if (St && St.laras && stress) { St.laras({ stress: stress }); }
    var E = ET(); if (E && E.selepasAcara && etika) { try { var eo = E.selepasAcara(Sv.loadPlayer(), { risiko: etika }, { rng: r }); if (eo && eo.etika) { Sv.applyEffects({}, { kiraTindakan: false, patch: { etika: eo.etika } }); } } catch (eE) { /* abaikan */ } }
    return { ok: true, jaya: jaya, mesej: mesej };
  }

  /** Tandakan popup sudah dipapar (supaya tidak muncul berulang). */
  function tandaDipapar() {
    var Sv = S(), p = Sv.loadPlayer(), t = ambil(p); if (!t.krisis || t.krisis.dipapar) { return false; }
    t.krisis.dipapar = true; return !!Sv.applyEffects({}, { kiraTindakan: false, patch: { tular: t } }).ok;
  }

  /** Latih pasukan pertahanan digital: Dana -> pertahanan. */
  function latih() {
    var Sv = S(), p = Sv.loadPlayer(), t = ambil(p), st = statusLatih(p, t);
    if (!st.boleh) { return { ok: false, ralat: st.sebab }; }
    t.pertahanan = clamp(t.pertahanan + CONFIG.LATIH.pertahanan, 0, 100); t.latihAkhir = idx(p);
    var res = Sv.applyEffects({ myr: -CONFIG.LATIH.dana }, { kiraTindakan: false, patch: { tular: t }, log: { tindakan: 'tular_latih', nama: 'Latih pasukan pertahanan digital', peringkat: 'ahli' } });
    return res.ok ? { ok: true, mesej: 'Pasukan pertahanan digital dilatih: semak fakta pantas, pemantauan akaun palsu dan saluran rasmi. Pertahanan digital kini ' + t.pertahanan + '.' } : { ok: false, ralat: res.ralat };
  }

  /** Bulanan (rantaian kalendar): krisis tidak dijawab = diam; susut pertahanan; peluang krisis baharu (bukan semasa kempen). */
  function prosesBulan(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || !layak(p)) { return { peristiwa: ev }; }
    if (ambil(p).krisis && (ambil(p).krisis.tahun !== p.tahun || ambil(p).krisis.bulan !== p.bulan) && !kempenAktif(p)) {
      var lama = cari(ambil(p).krisis.id), rj = jawab('diam', o);
      if (rj.ok) { ev.push({ jenis: 'tular', mesej: 'Krisis tular "' + (lama ? lama.tajuk : '') + '" tidak dijawab. ' + rj.mesej }); }
      p = Sv.loadPlayer();
    }
    var t = ambil(p), r = rng(o, p, 'bulan'), C = CONFIG.BULANAN, m = media(p), E = ET(), buruk = E && E.getEtika(p).status !== 'baik';
    t.pertahanan = clamp(t.pertahanan - CONFIG.PERTAHANAN_SUSUT, 0, 100);
    if (!t.krisis && !kempenAktif(p) && idx(p) - t.akhir >= C.jeda) {
      var peluang = clamp(C.asas + (m.persepsi - 35) * C.persepsi + (buruk ? C.etikaBuruk : 0) - t.pertahanan * C.pertahanan, C.min, C.maks);
      if (r() < peluang) { var d = cipta(p, t, r, 'bulanan'); ev.push({ jenis: 'tular', mesej: d.ikon + ' Krisis tular: ' + d.tajuk + '. Pilih tindak balas anda sebelum bulan depan.' }); }
    }
    Sv.applyEffects({}, { kiraTindakan: false, patch: { tular: t } });
    return { peristiwa: ev };
  }

  /** Setiap hari kempen (dipanggil oleh pru.js selepas tindakan kempen disimpan): kerosakan krisis kempen yang belum dijawab, atau peluang krisis baharu (sekali sekempen). */
  function hariKempen(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(); if (!p || p.tamat) { return null; }
    var a = kempenAktif(p); if (!a || a.campaignDaysLeft <= 0) { return null; }
    var t = ambil(p), C = CONFIG.KEMPEN, L = lindung(t), pru = PRU().getPRU(p), kunci = (a.kerusi ? a.kerusi.nama : '') + '|' + pru.tahunPRU + '|' + pru.bulanPRU;
    if (t.krisis && t.krisis.konteks === 'kempen') {
      var m = media(p), u = Math.round(C.harian.undi * t.krisis.k * L * 10) / 10;
      m.persepsi = clamp(m.persepsi + Math.round(C.harian.persepsi * L), 0, 100); a.voterSupport = clamp(Math.round((a.voterSupport - u) * 10) / 10, 0, 100); pru.aktif = a;
      Sv.applyEffects({}, { kiraTindakan: false, patch: { media: m, pru: pru } });
      return { baru: false, mesej: 'Fitnah tular belum dijawab: sokongan pengundi −' + u + '% hari ini.' };
    }
    if (t.krisis || t.kempenKunci === kunci) { return null; }
    var r = (o && o.rng) || Sv.rngBerbenih(String(p.id) + '|tular|kempen|' + kunci + '|' + a.hari);
    if (r() >= clamp(C.asas - t.pertahanan * C.pertahanan, C.min, 1)) { return null; }
    var d = cipta(p, t, r, 'kempen'); t.kempenKunci = kunci;
    Sv.applyEffects({}, { kiraTindakan: false, patch: { tular: t } });
    return { baru: true, mesej: d.ikon + ' Krisis tular semasa kempen: ' + d.tajuk + '.' };
  }

  return { CONFIG: CONFIG, KRISIS: KRISIS, ambil: ambil, keadaan: keadaan, jawab: jawab, latih: latih, tandaDipapar: tandaDipapar, prosesBulan: prosesBulan, hariKempen: hariKempen,
    _cipta: function (konteks, o) { var Sv = S(), p = Sv.loadPlayer(), t = ambil(p); var d = cipta(p, t, (o && o.rng) || Math.random, konteks || 'bulanan'); Sv.applyEffects({}, { kiraTindakan: false, patch: { tular: t } }); return d; } };
});
