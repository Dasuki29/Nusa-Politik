/* ==========================================================================
   Nusa Politik — js/selepas.js   (v14.6, maklum balas baris 47, mockup dipersetujui)
   Pilihan Selepas Politik (butang Bersara): Bersara sepenuhnya, Yang di-Pertua Negeri, atau Duta Malaysia.
     - TYT (laluan tokoh): umur >= 55, tokoh nasional (pernah Menteri / Presiden / Timbalan Presiden parti) atau
       bekas Ketua Kerajaan Negeri, disiplin baik; kekosongan TYT terdekat mesti dalam 12 bulan.
       Semua jawatan dilepaskan, pemain menunggu (boleh langkau bulan) hingga Januari tahun kekosongan; tawaran
       mengikut peluang js/tyt.js. Tiada tawaran / ditolak = pilih semula Duta atau bersara.
     - Duta (js/duta.js): umur >= 45, pernah Ahli Parlimen / anggota Kabinet atau jawatan Pusat parti, Integriti >= 50.
     - Selepas Duta, laluan TYT masih dibuka jika layak.
   State: p.selepas = { jalur:'tyt'|null, negeri, kosong, limbo, dutaSelesai }
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikSelepas = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function T() { return modul('MyPolitikTYT', 'tyt.js'); }
  function DT() { return modul('MyPolitikDuta', 'duta.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function HY() { return modul('MyPolitikHayat', 'hayat.js'); }
  function IG() { return modul('MyPolitikIntegriti', 'integriti.js'); }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function salin(o) { return o === undefined || o === null ? o : JSON.parse(JSON.stringify(o)); }
  function umur(p) { var u = parseInt(p && p.demografik && p.demografik.umur, 10); return isFinite(u) ? u + Math.max(0, (parseInt(p.tahun, 10) || 2026) - 2026) : 0; }
  var CONFIG = { HAD_TUNGGU: 12 };
  var RE_KABINET = /^(Perdana Menteri|Timbalan Perdana Menteri|Menteri|Menteri Besar|Ketua Menteri|Premier)\b/;

  function getSL(p) { var s = p && p.selepas && typeof p.selepas === 'object' ? salin(p.selepas) : {}; return s; }
  function kabinet(p) { var K = KB(); try { return K && K.getKabinet ? K.getKabinet(p) : null; } catch (e) { return null; } }
  /** Tokoh nasional: pernah Menteri / Ketua Kerajaan Negeri, atau Presiden / Timbalan Presiden parti. */
  function tokohNasional(p) {
    var jt = p.jawatanTertinggi || {}, k = kabinet(p);
    if ((Number(jt.pangkat) || 0) >= 11) { return true; }
    if ((p.jawatanList || []).some(function (j) { return (Number(j.pangkat) || 0) >= 11; })) { return true; }
    if (k && k.hasGovernmentRole && RE_KABINET.test(k.portfolioName || '') ) { return true; }
    return !!(k && (k.sejarah || []).some(function (r) { return r.hasil === 'dilantik' && RE_KABINET.test(r.nama || ''); }));
  }
  function pernahMP(p) {
    var pr = PRU() && PRU().getPRU ? PRU().getPRU(p) : (p.pru || {}), k = kabinet(p);
    if (p.selepas && p.selepas.pernahMP) { return true; }
    if ([pr.status, pr.statusKedua].some(function (s) { return s && s.jenis === 'MP'; })) { return true; }
    if ((pr.sejarah || []).some(function (r) { return r && r.jenis === 'MP' && r.hasil === 'menang'; })) { return true; }
    return !!(k && (k.hasGovernmentRole || (k.sejarah || []).length));
  }
  function integriti(p) { var ig = IG(); try { return ig && ig.getIntegriti ? Number(ig.getIntegriti(p).skor) : 50; } catch (e) { return 50; } }
  function bersih(p) { return !(p.etika && p.etika.status && p.etika.status !== 'baik'); }

  /** Kekosongan TYT terdekat (selepas bulan ini) yang belum ditolak. */
  function kosongTerdekat(p) {
    var TY = T(); if (!TY) { return null; }
    var t = TY.getT(p), kini = idx(p), best = null;
    Object.keys(TY.NEGERI).forEach(function (k) {
      var y = TY.kosongSeterusnya(k, parseInt(p.tahun, 10) || 2026);
      while (y * 12 + 1 <= kini || t.tolak[k] === y) { y += 4; }
      var b = y * 12 + 1 - kini;
      if (!best || b < best.bulan) { best = { negeri: k, nama: TY.NEGERI[k].nama, kosong: y, bulan: b }; }
    });
    return best;
  }
  function pilihan(p) {
    var TY = T(), D = DT(), u = umur(p), tk = tokohNasional(p), bk = TY ? Object.keys(TY.bekas(p)).length > 0 : false, kos = kosongTerdekat(p), sl = getSL(p);
    var sedangTYT = !!(p.tyt && p.tyt.aktif), sedangDuta = !!(D && D.aktif(p));
    var iT = [
      { ok: u >= (TY ? TY.CONFIG.UMUR : 55), teks: 'Umur ' + (TY ? TY.CONFIG.UMUR : 55) + ' tahun ke atas (anda ' + u + ')' },
      { ok: tk || bk, teks: 'Tokoh nasional (bekas Menteri / Presiden / Timbalan Presiden) atau bekas Ketua Menteri' },
      { ok: bersih(p), teks: 'Status disiplin baik' },
      { ok: !!kos && kos.bulan <= CONFIG.HAD_TUNGGU, teks: kos ? 'Kekosongan terdekat: ' + kos.nama + ', Januari ' + kos.kosong + ' (' + kos.bulan + ' bulan lagi; had ' + CONFIG.HAD_TUNGGU + ' bulan)' : 'Tiada kekosongan' }
    ];
    var iD = [
      { ok: u >= (D ? D.CONFIG.UMUR : 45), teks: 'Umur ' + (D ? D.CONFIG.UMUR : 45) + ' tahun ke atas (anda ' + u + ')' },
      { ok: pernahMP(p) || (p.jawatanTertinggi && p.jawatanTertinggi.peringkat === 'pusat'), teks: 'Pernah Ahli Parlimen / anggota Kabinet atau jawatan Pusat parti' },
      { ok: integriti(p) >= (D ? D.CONFIG.INTEGRITI : 50), teks: 'Integriti ' + (D ? D.CONFIG.INTEGRITI : 50) + ' ke atas (anda ' + Math.round(integriti(p)) + ')' },
      { ok: !sl.dutaSelesai, teks: 'Belum pernah berkhidmat sebagai Duta' }
    ];
    var bolehT = !sedangTYT && sl.jalur !== 'tyt' && iT.every(function (x) { return x.ok; });
    return { tyt: { item: iT, boleh: bolehT, kosong: kos, peluang: TY ? TY.peluang(p) : 0 }, duta: { item: iD, boleh: !sedangDuta && !sedangTYT && sl.jalur !== 'tyt' && iD.every(function (x) { return x.ok; }), pos: D ? D.tawaran(p) : [] }, limbo: !!sl.limbo };
  }
  /** Lepaskan semua jawatan parti dan kerajaan serta kerusi (PRK calon parti melalui js/letak.js). */
  function lepasSemua(sebab) {
    var H = HY(); if (H && H.kemaskiniJawatanTertinggi) { H.kemaskiniJawatanTertinggi(); }   // simpan jawatan tertinggi sebelum dilepaskan
    var Sv = S(), p = Sv.loadPlayer(), K = KB(), mp = pernahMP(p);
    if (K && K.getKabinet && K.getKabinet(p).hasGovernmentRole && K.lucutJawatan) { K.lucutJawatan(sebab); p = Sv.loadPlayer(); }
    var patch = { jawatanList: [], jawatan: 'Ahli Biasa' }, R = PRU(), pr = R && R.getPRU ? salin(R.getPRU(p)) : null, kos = [];
    if (pr) { [pr.status, pr.statusKedua].forEach(function (s) { if (s && (s.jenis === 'MP' || s.jenis === 'ADUN')) { kos.push({ jenis: s.jenis === 'ADUN' ? 'DUN' : 'PARLIMEN', nama: s.kerusi || '', i: idx(p) + 1 }); } }); pr.status = null; pr.statusKedua = null; patch.pru = pr; }
    if (kos.length) { var l = p.letak && typeof p.letak === 'object' ? salin(p.letak) : { kabinetSehingga: 0, prk: [], sejarah: [] }; l.prk = (l.prk || []).concat(kos); patch.letak = l; }
    return { patch: patch, prk: kos.length > 0, mp: mp };
  }
  function simpan(sl, patch, log) { return S().applyEffects({}, { kiraTindakan: !!log, patch: Object.assign({ selepas: sl }, patch || {}), log: log }); }

  function pilihTYT() {
    var p = S().loadPlayer(); if (!p || p.tamat) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var pl = pilihan(p); if (!pl.tyt.boleh) { return { ok: false, ralat: 'Anda belum layak untuk laluan Yang di-Pertua Negeri.' }; }
    var k = pl.tyt.kosong, l = lepasSemua('Bersara untuk ditimbang sebagai Yang di-Pertua Negeri.'), sl = getSL(S().loadPlayer());
    sl.pernahMP = sl.pernahMP || l.mp; sl.jalur = 'tyt'; sl.negeri = k.negeri; sl.kosong = k.kosong; sl.limbo = false;
    var h = simpan(sl, l.patch, { tindakan: 'selepas_tyt', nama: 'Bersara: menunggu kekosongan TYT ' + k.nama, peringkat: 'ahli' });
    return h.ok ? { ok: true, mesej: 'Anda bersara daripada politik dan menunggu kekosongan Yang di-Pertua Negeri ' + k.nama + ' (Januari ' + k.kosong + '). Semua jawatan dilepaskan' + (l.prk ? '; PRK diadakan bulan depan' : '') + '.' } : { ok: false, ralat: h.ralat };
  }
  function pilihDuta(kod) {
    var p = S().loadPlayer(); if (!p || p.tamat) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var pl = pilihan(p); if (!pl.duta.boleh) { return { ok: false, ralat: 'Anda belum layak dilantik Duta.' }; }
    if (!pl.duta.pos.some(function (x) { return x.kod === kod; })) { return { ok: false, ralat: 'Pos ini tidak ditawarkan.' }; }
    var l = lepasSemua('Dilantik Duta Malaysia.'), sl = getSL(S().loadPlayer()); sl.jalur = null; sl.limbo = false; sl.pernahMP = sl.pernahMP || l.mp;
    var h = simpan(sl, l.patch); if (!h.ok) { return { ok: false, ralat: h.ralat }; }
    var r = DT().mula(kod); if (r.ok && l.prk) { r.mesej += ' PRK diadakan bulan depan.'; }
    return r;
  }
  function bersara() { var H = HY(); return H && H.bersaraAwal ? H.bersaraAwal() : { ok: false, ralat: 'Modul hayat tiada.' }; }
  /** Pemain di luar politik (menunggu TYT, limbo, Duta atau TYT aktif): tidak boleh bertanding dalam pemilihan parti. */
  function luarPolitik(p) { var sl = (p && p.selepas) || {}; return !!(p && (sl.jalur === 'tyt' || sl.limbo || (p.duta && p.duta.aktif) || (p.tyt && p.tyt.aktif))); }

  /** Bulanan (calendar.js), selepas js/tyt.js: tamatkan penantian bila TYT dilantik atau tawaran tiada / ditolak. */
  function prosesBulan() {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat) { return { peristiwa: ev }; }
    var sl = getSL(p); if (sl.jalur !== 'tyt') { return { peristiwa: ev }; }
    var t = T() ? T().getT(p) : {};
    if (t.aktif) { sl.jalur = null; simpan(sl); return { peristiwa: ev }; }
    if (t.tawaran) { return { peristiwa: ev }; }
    if (t.tolak && t.tolak[sl.negeri] === sl.kosong) {
      sl.jalur = null; sl.limbo = true; simpan(sl);
      ev.push({ jenis: 'selepas', mesej: 'Laluan Yang di-Pertua Negeri tidak berjaya. Pilih Duta Malaysia (jika layak) atau bersara sepenuhnya di kad Selepas Politik (tab Profil).' });
    }
    return { peristiwa: ev };
  }
  /** Bulan sasaran langkau (Januari tahun kekosongan) semasa menunggu TYT. */
  function sasaranLangkau(p) { var sl = getSL(p); return sl.jalur === 'tyt' && sl.kosong ? sl.kosong * 12 + 1 : null; }

  return { CONFIG: CONFIG, getSL: getSL, tokohNasional: tokohNasional, pilihan: pilihan, kosongTerdekat: kosongTerdekat, pilihTYT: pilihTYT, pilihDuta: pilihDuta, bersara: bersara,
    luarPolitik: luarPolitik, prosesBulan: prosesBulan, sasaranLangkau: sasaranLangkau, idx: idx };
});
