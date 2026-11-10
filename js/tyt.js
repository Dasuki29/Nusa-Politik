/* ==========================================================================
   Nusa Politik — js/tyt.js   (v13.52)
   Yang di-Pertua Negeri (TYT) bagi Sarawak, Sabah, Melaka dan Pulau Pinang (maklum balas Threads no. 5, mockup dipersetujui).
     - Syarat tawaran: pernah Premier / Ketua Menteri negeri itu (dikesan setiap bulan atau daripada sejarah kabinet), umur >= 55,
       status disiplin baik, tidak memegang jawatan Ketua Menteri sekarang, dan jawatan TYT negeri itu kosong.
     - Kekosongan: penggal TYT 4 tahun; tahun kekosongan pertama berbeza bagi setiap negeri (ANDAIAN), bulan 1.
       Peluang tawaran 40% hingga 80% (Reputasi, gelaran, Sokongan akar umbi). Tolak / tiada tawaran: tunggu kekosongan seterusnya.
     - Terima: semua jawatan parti dan kerajaan dilepaskan; kerusi dikosongkan (PRK calon parti melalui js/letak.js);
       keahlian parti digantung (tidak boleh bertanding / lompat); gelaran Tun; tab 🏰 Istana dibuka.
     - Istana: elaun RM 25,000 sebulan; Kewibawaan Istana (mula 60, susut 1 sebulan) dan Hubungan dengan Ketua Kerajaan Negeri (mula 60).
       Menghadap (bulanan), Kurnia darjah (sekali setahun, pilih 3 daripada 6 calon), Majlis rasmi (2 AP, bulanan),
       Mesyuarat Majlis Raja-Raja (sekali setahun), Perkenan pembubaran DUN (acara rawak 4% sebulan).
     - Tamat penggal (48 bulan): Kewibawaan >= 60 dan penggal 1 = penggal kedua ditawarkan; selain itu kerjaya tamat (legasi 'tyt').
   ANDAIAN: semua angka ialah angka permainan.
   State: p.tyt = { bekas:{ negeri:{dari,hingga} }, tolak:{ negeri: tahun }, tawaran, aktif, sejarah }.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikTYT = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function HY() { return modul('MyPolitikHayat', 'hayat.js'); }
  function D() { return modul('MyPolitikData', 'data.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function salin(o) { return o === undefined || o === null ? o : JSON.parse(JSON.stringify(o)); }
  var rngLalai = Math.random;
  function rng(o) { return (o && o.rng) || rngLalai; }
  function umur(p) { var u = parseInt(p && p.demografik && p.demografik.umur, 10); return isFinite(u) ? u + Math.max(0, (parseInt(p.tahun, 10) || 2026) - 2026) : 0; }

  var NEGERI = { 'sarawak': { nama: 'Sarawak', ketua: 'Premier', mula: 2027 }, 'sabah': { nama: 'Sabah', ketua: 'Ketua Menteri', mula: 2028 }, 'melaka': { nama: 'Melaka', ketua: 'Ketua Menteri', mula: 2029 }, 'pulau pinang': { nama: 'Pulau Pinang', ketua: 'Ketua Menteri', mula: 2030 } };
  var CONFIG = {
    UMUR: 55, PENGGAL: 48, PELUANG: { min: 0.4, maks: 0.8 }, ELAUN: 25000,
    MULA: { kewibawaan: 60, hubungan: 60 }, SUSUT: 1, LANJUT: 60, GAGAL: 30,
    MENGHADAP: { sokong: { hubungan: 3 }, tegur: { kewibawaan: 3, hubungan: -2 }, dengar: {} },
    KURNIA: { seimbang: 5, politik: -5, calon: 6, pilih: 3 },
    MAJLIS: { ap: 2, kewibawaan: 2, reputasi: 1 }, RAJA: { kewibawaan: 3 },
    BUBAR: { peluang: 0.04, perkenan: { hubungan: 5 }, tangguhStabil: { kewibawaan: 8, hubungan: -15 }, tangguhKrisis: { kewibawaan: -10 }, stabil: 0.75 }
  };
  var KATEGORI = [{ kod: 'politik', nama: 'Ahli politik' }, { kod: 'usahawan', nama: 'Usahawan' }, { kod: 'awam', nama: 'Penjawat awam' }, { kod: 'ngo', nama: 'Pemimpin NGO' }];

  function kunciNegeri(n) { var k = String(n || '').toLowerCase().trim(); return NEGERI[k] ? k : null; }
  function getT(p) { var t = p && p.tyt && typeof p.tyt === 'object' ? salin(p.tyt) : {}; t.bekas = t.bekas || {}; t.tolak = t.tolak || {}; t.sejarah = Array.isArray(t.sejarah) ? t.sejarah : []; t.tawaran = t.tawaran || null; t.aktif = t.aktif || null; return t; }
  function aktif(p) { return !!(p && p.tyt && p.tyt.aktif && !p.tamat); }
  function simpan(t, kesan, opts) { opts = opts || {}; var patch = Object.assign({ tyt: t }, opts.patch || {}); return S().applyEffects(kesan || {}, { kiraTindakan: !!opts.log, pindahan: !!opts.pindahan, patch: patch, log: opts.log }); }
  /** Tahun kekosongan TYT seterusnya (>= tahun) bagi negeri. */
  function kosongSeterusnya(k, tahun) { var m = NEGERI[k].mula; if (tahun <= m) { return m; } return m + Math.ceil((tahun - m) / 4) * 4; }
  /** Jawatan Ketua Kerajaan Negeri semasa / pernah (negeri yang layak). */
  function ketuaSemasa(p) { var K = KB(), k = K && K.getKabinet ? K.getKabinet(p) : null; if (!k || !k.hasGovernmentRole || k.roleLevel !== 'MENTERI_BESAR') { return null; } var m = /^(Premier|Ketua Menteri) (.+)$/.exec(k.portfolioName || ''); return m && kunciNegeri(m[2]) ? kunciNegeri(m[2]) : null; }
  function bekasDariSejarah(p) {
    var K = KB(), k = K && K.getKabinet ? K.getKabinet(p) : null, o = {};
    ((k && k.sejarah) || []).forEach(function (r) { var m = /^(Premier|Ketua Menteri) (.+)$/.exec(r.nama || ''); var n = m && kunciNegeri(m[2]); if (n && r.hasil === 'dilantik' && !o[n]) { o[n] = { dari: r.tahun, hingga: r.tahun }; } });
    return o;
  }
  function bekas(p) { var t = getT(p), o = Object.assign(bekasDariSejarah(p), t.bekas), s = ketuaSemasa(p); if (s) { delete o[s]; } return o; }
  /** Syarat tawaran bagi negeri k. */
  function syarat(p, k) {
    var b = bekas(p)[k], u = umur(p), bersih = !(p.etika && p.etika.status && p.etika.status !== 'baik'), t = getT(p);
    var kosong = kosongSeterusnya(k, parseInt(p.tahun, 10) || 2026);
    var item = [
      { ok: !!b, teks: 'Pernah ' + NEGERI[k].ketua + ' ' + NEGERI[k].nama + (b ? ' (' + b.dari + (b.hingga && b.hingga !== b.dari ? '–' + b.hingga : '') + ')' : '') },
      { ok: u >= CONFIG.UMUR, teks: 'Umur sekurang-kurangnya ' + CONFIG.UMUR + ' (anda ' + u + ')' },
      { ok: bersih, teks: 'Status disiplin baik' },
      { ok: !ketuaSemasa(p), teks: 'Bukan ' + NEGERI[k].ketua + ' sekarang' }
    ];
    return { negeri: k, nama: NEGERI[k].nama, ketua: NEGERI[k].ketua, item: item, layak: item.every(function (x) { return x.ok; }), kosong: kosong, ditolak: t.tolak[k] === kosong };
  }
  function peluang(p) {
    var g = p.gelaran || {}, gel = g.tun ? 0.1 : g.tansri ? 0.07 : g.dato ? 0.04 : 0;
    var au = p.kesetiaan && isFinite(Number(p.kesetiaan.akarUmbi)) ? Number(p.kesetiaan.akarUmbi) : 50;
    return clamp(CONFIG.PELUANG.min + ((Number(p.reputasi) || 50) - 50) / 125 + gel + (au - 50) / 500, CONFIG.PELUANG.min, CONFIG.PELUANG.maks);
  }
  function namaNPC(r, jantina) { var Dd = D(); try { return Dd && Dd.janaNama ? Dd.janaNama(r, jantina || 'L', 'dato') : 'Dato\' Ahmad'; } catch (e) { return 'Dato\' Ahmad'; } }

  /** Terima tawaran: lepaskan jawatan dan kerusi, mula penggal TYT. */
  function terima() {
    var Sv = S(), p = Sv.loadPlayer(), t = getT(p), w = t.tawaran; if (!w) { return { ok: false, ralat: 'Tiada tawaran.' }; }
    var K = KB(); if (K && K.getKabinet && K.getKabinet(p).hasGovernmentRole && K.lucutJawatan) { K.lucutJawatan('Dilantik Yang di-Pertua Negeri.'); p = Sv.loadPlayer(); t = getT(p); }
    var patch = {}, R = PRU(), pr = R && R.getPRU ? salin(R.getPRU(p)) : null, kos = [];
    if (pr) { [pr.status, pr.statusKedua].forEach(function (s) { if (s && (s.jenis === 'MP' || s.jenis === 'ADUN')) { kos.push({ jenis: s.jenis === 'ADUN' ? 'DUN' : 'PARLIMEN', nama: s.kerusi || '', i: idx(p) + 1 }); } }); pr.status = null; pr.statusKedua = null; patch.pru = pr; }
    if (kos.length) { var l = p.letak && typeof p.letak === 'object' ? salin(p.letak) : { kabinetSehingga: 0, prk: [], sejarah: [] }; l.prk = (l.prk || []).concat(kos); patch.letak = l; }
    patch.jawatanList = []; patch.jawatan = 'Ahli Biasa';
    var g = salin(p.gelaran) || {}; if (!g.tun) { g.tun = true; g.bulanTun = idx(p); } patch.gelaran = g;
    var r = rng();
    t.aktif = { negeri: w.negeri, penggal: 1, mula: idx(p), tamat: idx(p) + CONFIG.PENGGAL, tahunMula: p.tahun, kewibawaan: CONFIG.MULA.kewibawaan, hubungan: CONFIG.MULA.hubungan,
      ketua: namaNPC(r, 'L'), hadap: 0, majlis: 0, rajaTahun: 0, kurniaTahun: 0, calon: null, bubar: null, lanjut: false };
    calonKurnia(p, t.aktif, r);
    t.tawaran = null;
    var kb = K && K.getKabinet ? salin(K.getKabinet(Sv.loadPlayer())) : null;
    if (kb) { kb.sejarah = (kb.sejarah || []).concat([{ tahun: p.tahun, bulan: p.bulan, nama: 'Yang di-Pertua Negeri ' + NEGERI[w.negeri].nama, hasil: 'dilantik' }]).slice(-10); patch.kabinet = kb; }
    var h = simpan(t, {}, { patch: patch, log: { tindakan: 'tyt_lantik', nama: 'Dilantik Yang di-Pertua Negeri ' + NEGERI[w.negeri].nama, peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: 'Anda mengangkat sumpah sebagai Tuan Yang Terutama Yang di-Pertua Negeri ' + NEGERI[w.negeri].nama + '. Semua jawatan parti dan kerusi dilepaskan' + (kos.length ? '; PRK diadakan bulan depan' : '') + '. Tab Istana dibuka.' } : { ok: false, ralat: h.ralat };
  }
  function tolak() {
    var Sv = S(), p = Sv.loadPlayer(), t = getT(p), w = t.tawaran; if (!w) { return { ok: false, ralat: 'Tiada tawaran.' }; }
    t.tolak[w.negeri] = w.tahun; t.tawaran = null;
    var h = simpan(t, {}, { log: { tindakan: 'tyt_tolak', nama: 'Menolak tawaran TYT ' + NEGERI[w.negeri].nama, peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: 'Anda menolak tawaran dengan hormat. Tawaran mungkin datang semula pada kekosongan seterusnya.' } : { ok: false, ralat: h.ralat };
  }

  function laras(a, d) { if (d.kewibawaan) { a.kewibawaan = clamp(a.kewibawaan + d.kewibawaan, 0, 100); } if (d.hubungan) { a.hubungan = clamp(a.hubungan + d.hubungan, 0, 100); } }
  function tanda(n) { return (n > 0 ? '+' : '') + n; }
  function ringkasD(d) { var x = []; if (d.kewibawaan) { x.push('Kewibawaan ' + tanda(d.kewibawaan)); } if (d.hubungan) { x.push('Hubungan ' + tanda(d.hubungan)); } return x.join(', '); }
  function mesti() { var p = S().loadPlayer(); if (!aktif(p)) { return { ralat: 'Hanya Yang di-Pertua Negeri.' }; } return { p: p, t: getT(p) }; }
  /** Menghadap bulanan: nada = sokong | tegur | dengar */
  function menghadap(nada) {
    var c = mesti(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var a = c.t.aktif; if (a.hadap === idx(c.p)) { return { ok: false, ralat: 'Ketua kerajaan negeri sudah menghadap bulan ini.' }; }
    var d = CONFIG.MENGHADAP[nada]; if (!d) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    a.hadap = idx(c.p); laras(a, d);
    var h = simpan(c.t, {}, { log: { tindakan: 'tyt_hadap', nama: 'Menghadap: ' + nada, peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: (nada === 'sokong' ? 'Anda menyokong dasar kerajaan negeri.' : nada === 'tegur' ? 'Anda memberi teguran secara tertutup.' : 'Anda mendengar taklimat kerajaan negeri.') + (ringkasD(d) ? ' ' + ringkasD(d) + '.' : '') } : { ok: false, ralat: h.ralat };
  }
  function majlis() {
    var c = mesti(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var a = c.t.aktif; if (a.majlis === idx(c.p)) { return { ok: false, ralat: 'Anda sudah menghadiri majlis rasmi bulan ini.' }; }
    if ((Number(c.p.ap) || 0) < CONFIG.MAJLIS.ap) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
    a.majlis = idx(c.p); laras(a, { kewibawaan: CONFIG.MAJLIS.kewibawaan });
    var h = simpan(c.t, { ap: -CONFIG.MAJLIS.ap, reputasi: CONFIG.MAJLIS.reputasi }, { log: { tindakan: 'tyt_majlis', nama: 'Majlis rasmi dan lawatan rakyat', peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: 'Anda merasmikan majlis dan bertemu rakyat. Kewibawaan +' + CONFIG.MAJLIS.kewibawaan + ', Reputasi +' + CONFIG.MAJLIS.reputasi + '.' } : { ok: false, ralat: h.ralat };
  }
  function majlisRaja() {
    var c = mesti(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var a = c.t.aktif; if (a.rajaTahun === c.p.tahun) { return { ok: false, ralat: 'Mesyuarat Majlis Raja-Raja tahun ini sudah dihadiri.' }; }
    a.rajaTahun = c.p.tahun; laras(a, { kewibawaan: CONFIG.RAJA.kewibawaan });
    var h = simpan(c.t, {}, { log: { tindakan: 'tyt_raja', nama: 'Mesyuarat Majlis Raja-Raja', peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: 'Anda menghadiri Mesyuarat Majlis Raja-Raja. Kewibawaan +' + CONFIG.RAJA.kewibawaan + '.' } : { ok: false, ralat: h.ralat };
  }
  /** Senarai calon kurnia tahun ini (6 calon, sekurang-kurangnya 2 ahli politik). */
  function calonKurnia(p, a, r) {
    if (a.calon && a.calon.tahun === p.tahun) { return a.calon.senarai; }
    var s = []; for (var i = 0; i < CONFIG.KURNIA.calon; i++) { var kt = i < 2 ? KATEGORI[0] : KATEGORI[Math.floor(r() * KATEGORI.length)]; s.push({ id: 'c' + i, nama: namaNPC(r, r() < 0.3 ? 'P' : 'L').replace(/^Dato'? ?|^Datuk ?/, ''), kategori: kt.kod, label: kt.nama }); }
    a.calon = { tahun: p.tahun, senarai: s }; return s;
  }
  function kurnia(ids) {
    var c = mesti(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var a = c.t.aktif; if (a.kurniaTahun === c.p.tahun) { return { ok: false, ralat: 'Senarai kurnia tahun ini sudah diperkenan.' }; }
    if (!a.calon || a.calon.tahun !== c.p.tahun) { return { ok: false, ralat: 'Senarai calon belum disediakan (bulan depan).' }; }
    var s = a.calon.senarai; ids = (ids || []).filter(function (x, i, arr) { return arr.indexOf(x) === i; });
    if (ids.length !== CONFIG.KURNIA.pilih) { return { ok: false, ralat: 'Pilih ' + CONFIG.KURNIA.pilih + ' penerima.' }; }
    var dip = s.filter(function (x) { return ids.indexOf(x.id) >= 0; }); if (dip.length !== CONFIG.KURNIA.pilih) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    var pol = dip.filter(function (x) { return x.kategori === 'politik'; }).length, jenis = {}; dip.forEach(function (x) { jenis[x.kategori] = 1; });
    var d = pol >= 2 ? CONFIG.KURNIA.politik : Object.keys(jenis).length >= 3 ? CONFIG.KURNIA.seimbang : 0;
    a.kurniaTahun = c.p.tahun; laras(a, { kewibawaan: d });
    var h = simpan(c.t, {}, { log: { tindakan: 'tyt_kurnia', nama: 'Kurnia darjah: ' + dip.map(function (x) { return x.nama; }).join(', '), peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: 'Darjah kebesaran dikurniakan kepada ' + dip.map(function (x) { return x.nama; }).join(', ') + '. ' + (d > 0 ? 'Senarai seimbang: Kewibawaan +' + d + '.' : d < 0 ? 'Terlalu ramai ahli politik: Kewibawaan ' + d + '.' : 'Kewibawaan tidak berubah.') } : { ok: false, ralat: h.ralat };
  }
  /** Perkenan pembubaran DUN: keputusan = perkenan | tangguh */
  function bubar(keputusan) {
    var c = mesti(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var a = c.t.aktif, b = a.bubar; if (!b) { return { ok: false, ralat: 'Tiada permohonan pembubaran.' }; }
    var d = keputusan === 'perkenan' ? CONFIG.BUBAR.perkenan : b.stabil ? CONFIG.BUBAR.tangguhStabil : CONFIG.BUBAR.tangguhKrisis;
    if (keputusan !== 'perkenan' && keputusan !== 'tangguh') { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    laras(a, d); a.bubar = null; if (keputusan === 'perkenan') { a.ketua = b.ketuaBaru || a.ketua; }
    var h = simpan(c.t, {}, { log: { tindakan: 'tyt_bubar', nama: 'Pembubaran DUN: ' + keputusan, peringkat: 'ahli' } });
    var m = keputusan === 'perkenan' ? 'Anda memperkenan pembubaran DUN. PRN diadakan dan kerajaan negeri baharu dibentuk.' : b.stabil ? 'Anda menangguhkan perkenan; kerajaan negeri kekal.' : 'Anda menangguhkan perkenan ketika kerajaan hilang majoriti: krisis perlembagaan negeri.';
    return h.ok ? { ok: true, mesej: m + ' ' + ringkasD(d) + '.' } : { ok: false, ralat: h.ralat };
  }
  function terimaLanjut(ya) {
    var c = mesti(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var a = c.t.aktif; if (!a.lanjut) { return { ok: false, ralat: 'Tiada tawaran penggal kedua.' }; }
    if (!ya) { return tamatPenggal(c.p, c.t, 'Anda memilih bersara selepas penggal pertama.'); }
    a.penggal = 2; a.tamat = idx(c.p) + CONFIG.PENGGAL; a.lanjut = false;
    var h = simpan(c.t, {}, { log: { tindakan: 'tyt_lanjut', nama: 'Penggal kedua Yang di-Pertua Negeri', peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: 'Penggal anda dilanjutkan empat tahun lagi.' } : { ok: false, ralat: h.ralat };
  }
  function tamatPenggal(p, t, sebab) {
    var a = t.aktif; t.sejarah = t.sejarah.concat([{ negeri: a.negeri, dari: a.tahunMula, hingga: p.tahun, penggal: a.penggal, kewibawaan: a.kewibawaan }]); t.tamatSebab = sebab;
    simpan(t, {}, { log: { tindakan: 'tyt_tamat', nama: 'Tamat perkhidmatan Yang di-Pertua Negeri ' + NEGERI[a.negeri].nama, peringkat: 'ahli' } });
    var H = HY(), r = H && H.tamatkan ? H.tamatkan('tyt') : { ok: false };
    return { ok: true, tamat: true, mesej: sebab + ' Perkhidmatan anda sebagai Yang di-Pertua Negeri ' + NEGERI[a.negeri].nama + ' (' + a.tahunMula + '–' + p.tahun + ') tamat dengan penuh kehormatan.', hayat: r };
  }

  /** Bulanan (calendar.js). */
  function prosesBulan(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [], r = rng(o);
    if (!p || p.tamat) { return { peristiwa: ev }; }
    var t = getT(p), ubah = false, s = ketuaSemasa(p);
    if (s) { var bk = t.bekas[s] || { dari: p.tahun }; bk.hingga = p.tahun; t.bekas[s] = bk; ubah = true; }   // rekod jawatan Ketua Kerajaan Negeri
    if (t.aktif) {
      var a = t.aktif;
      if (idx(p) >= a.tamat) {
        if (a.penggal === 1 && a.kewibawaan >= CONFIG.LANJUT && !a.lanjut) { a.lanjut = true; a.tamat = idx(p) + 1; Sv.applyEffects({}, { kiraTindakan: false, patch: { tyt: t } }); ev.push({ jenis: 'tyt', mesej: 'Penggal pertama anda tamat. Atas nasihat Perdana Menteri, Yang di-Pertuan Agong menawarkan penggal kedua: terima atau bersara di tab Istana bulan ini.' }); return { peristiwa: ev }; }
        var x = tamatPenggal(p, t, a.lanjut ? 'Anda tidak menjawab tawaran penggal kedua.' : a.kewibawaan < CONFIG.GAGAL ? 'Penggal anda tidak dilanjutkan kerana Kewibawaan Istana rendah.' : 'Penggal anda tamat.');
        ev.push({ jenis: 'tyt', mesej: x.mesej }); return { peristiwa: ev };
      }
      laras(a, { kewibawaan: -CONFIG.SUSUT }); calonKurnia(p, a, r);
      if (!a.bubar && r() < CONFIG.BUBAR.peluang) { a.bubar = { stabil: r() < CONFIG.BUBAR.stabil, ketuaBaru: namaNPC(r, 'L') }; ev.push({ jenis: 'tyt', mesej: 'Ketua kerajaan negeri memohon perkenan untuk membubarkan DUN ' + NEGERI[a.negeri].nama + '. Buat keputusan di tab Istana.' }); }
      Sv.applyEffects({ myr: CONFIG.ELAUN }, { kiraTindakan: false, pindahan: true, patch: { tyt: t }, log: { tindakan: 'elaun_tyt', nama: 'Elaun Yang di-Pertua Negeri: +RM ' + CONFIG.ELAUN, peringkat: 'bulan' } });
      return { peristiwa: ev };
    }
    // tawaran pada bulan 1 tahun kekosongan
    if (!t.tawaran && parseInt(p.bulan, 10) === 1) {
      Object.keys(NEGERI).forEach(function (k) {
        if (t.tawaran) { return; }
        var sy = syarat(p, k); if (!sy.layak || sy.kosong !== parseInt(p.tahun, 10) || sy.ditolak) { return; }
        if (r() < peluang(p)) { t.tawaran = { negeri: k, tahun: p.tahun }; ubah = true; ev.push({ jenis: 'tyt', mesej: 'Tawaran Istana: atas nasihat Perdana Menteri, Yang di-Pertuan Agong berkenan melantik anda sebagai Yang di-Pertua Negeri ' + NEGERI[k].nama + '. Terima atau tolak di tab Profil.' }); }
        else { t.tolak[k] = sy.kosong; ubah = true; ev.push({ jenis: 'tyt', mesej: 'Jawatan Yang di-Pertua Negeri ' + NEGERI[k].nama + ' diisi oleh tokoh lain. Kekosongan seterusnya: ' + (sy.kosong + 4) + '.' }); }
      });
    }
    if (ubah) { Sv.applyEffects({}, { kiraTindakan: false, patch: { tyt: t } }); }
    return { peristiwa: ev };
  }
  /** Ringkasan untuk UI. */
  function keadaan(p) {
    var t = getT(p), a = t.aktif;
    if (a) { return { aktif: true, a: a, negeri: NEGERI[a.negeri], calon: a.kurniaTahun === p.tahun ? null : (a.calon && a.calon.tahun === p.tahun ? a.calon.senarai : null), boleh: { hadap: a.hadap !== idx(p), majlis: a.majlis !== idx(p) && (Number(p.ap) || 0) >= CONFIG.MAJLIS.ap, raja: a.rajaTahun !== p.tahun, kurnia: a.kurniaTahun !== p.tahun } }; }
    var b = bekas(p); return { aktif: false, tawaran: t.tawaran ? { negeri: NEGERI[t.tawaran.negeri], kod: t.tawaran.negeri, peluang: peluang(p) } : null, laluan: Object.keys(b).map(function (k) { return syarat(p, k); }), peluang: peluang(p), sejarah: t.sejarah };
  }

  return { CONFIG: CONFIG, NEGERI: NEGERI, setRng: function (f) { rngLalai = f || Math.random; }, getT: getT, aktif: aktif, syarat: syarat, peluang: peluang, bekas: bekas, kosongSeterusnya: kosongSeterusnya,
    terima: terima, tolak: tolak, menghadap: menghadap, majlis: majlis, majlisRaja: majlisRaja, kurnia: kurnia, bubar: bubar, terimaLanjut: terimaLanjut, prosesBulan: prosesBulan, keadaan: keadaan };
});
