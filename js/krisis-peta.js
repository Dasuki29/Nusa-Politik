/* ==========================================================================
   Nusa Politik — js/krisis-peta.js   (v8.8)
   Krisis tempatan berlokasi (banjir kilat, kes jenayah, kilang tutup, ...). Setiap krisis ada satu
   cawangan; peta (js/map.js) memaparkan ikon ⚠️ berkedip di atas kawasan itu dan pemain
   menyelesaikannya dengan menekan ikon (atau butang dalam bar "Krisis tempatan" / panel kawasan).

   Peraturan:
   - Hanya pemain yang memegang sekurang-kurangnya satu jawatan (AJK ke atas) mengalami krisis.
   - Setiap bulan: peluang PELUANG (22%) krisis baharu, maksimum MAKS_AKTIF (2) serentak.
   - Tiga pilihan: turun padang (AP), salur bantuan (MYR) atau abaikan (tiada kos, sokongan susut).
   - Krisis yang dibiarkan LEWAT_BULAN (3) bulan dianggap diabaikan secara automatik.
   - Kesan pada sokongan peta ialah mata bonus kawasan (p.peta.bonus['C:<cawangan>']), jadi
     warna dan peratus di peta berubah selepas krisis diselesaikan.
   - State: p.krisisPeta = { aktif:[{ id, jenis, cid, tempat, tahun, bulan }], selesai, terabai, akhir }.
     Disimpan di medan berasingan kerana js/map.js menyalin p.peta semula pada setiap tindakan peta.

   API (window.MyPolitikKrisisPeta):
     JENIS, CONFIG
     sediakanLokasi(fn)          fn(profil) -> [{ id, nama }] cawangan calon (lalai: cawangan pemain sahaja)
     ambil(p)                    state yang disahkan
     senarai(p)                  krisis aktif (dengan maklumat jenis)
     pilihan(p, id)              pilihan penyelesaian + boleh/sebab
     selesai(id, pilihId)        laksanakan; pulang { ok, mesej } atau { ok:false, ralat }
     prosesBulan(o)              dipanggil oleh calendar.js; pulang { peristiwa }
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikKrisisPeta = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function ST() { return modul('MyPolitikStres', 'stress.js'); }

  var CONFIG = {
    PELUANG: 0.22, MAKS_AKTIF: 2, LEWAT_BULAN: 3, HAD_BONUS: 30,
    LEWAT: { akarUmbi: -4, bonus: -6, penentang: -3 },
    TURUN: { ap: 2, stress: -2, akarUmbi: 6, bonus: 6, ip: 1, penentang: 4 },
    BANTU: { myr: 800, akarUmbi: 10, bonus: 10, ip: 2, penentang: 3 },
    ABAI: { akarUmbi: -4, bonus: -4, penentang: 0 }
  };

  /* Setiap jenis: cerita dan label tiga pilihan (kesan sama; teks berbeza supaya terasa berlainan). */
  var JENIS = [
    { id: 'banjir', ikon: '🌊', nama: 'Banjir Kilat', cerita: 'Air naik dengan pantas dan beberapa rumah dinaiki air. Penduduk menunggu wakil parti.',
      turun: 'Turun padang bantu mangsa', bantu: 'Salur bantuan banjir segera' },
    { id: 'jenayah', ikon: '🚨', nama: 'Kes Jenayah Meresahkan', cerita: 'Siri kes ragut dan pecah rumah menakutkan penduduk. Mereka mahu parti mengambil tindakan.',
      turun: 'Hadir ke perjumpaan penduduk', bantu: 'Biayai rondaan komuniti dan lampu jalan' },
    { id: 'kilang', ikon: '🏭', nama: 'Kilang Tutup', cerita: 'Sebuah kilang utama menutup operasi dan ratusan pekerja hilang punca pendapatan.',
      turun: 'Temui pekerja dan bantu mohon pekerjaan baharu', bantu: 'Salur bantuan sementara kepada keluarga terjejas' },
    { id: 'air', ikon: '🚰', nama: 'Bekalan Air Terputus', cerita: 'Bekalan air terputus beberapa hari dan penduduk mula marah.',
      turun: 'Turun padang dan desak pihak berkuasa air', bantu: 'Sewa lori tangki air untuk kawasan' },
    { id: 'harga', ikon: '🛒', nama: 'Kenaikan Harga Barang', cerita: 'Harga barang keperluan naik mendadak. Peniaga dan pelanggan di pasar mengadu.',
      turun: 'Ziarah peniaga dan dengar rungutan', bantu: 'Anjur jualan murah' },
    { id: 'tragedi', ikon: '🕯️', nama: 'Tragedi Kematian Ahli', cerita: 'Seorang ahli setia meninggal dunia secara tiba-tiba. Keluarganya berharap kehadiran parti.',
      turun: 'Hadir menziarah dan membaca tahlil', bantu: 'Sampaikan sumbangan kepada waris' }
  ];
  var PENYEDIA = null;

  function sediakanLokasi(fn) { PENYEDIA = typeof fn === 'function' ? fn : null; }
  function dasar() { return { aktif: [], selesai: 0, terabai: 0, akhir: '' }; }
  function ambil(p) {
    var k = p && p.krisisPeta && typeof p.krisisPeta === 'object' ? p.krisisPeta : {}, o = dasar();
    o.aktif = Array.isArray(k.aktif) ? k.aktif.filter(function (x) { return x && x.id && x.jenis && x.cid; }) : [];
    o.selesai = Math.max(0, parseInt(k.selesai, 10) || 0); o.terabai = Math.max(0, parseInt(k.terabai, 10) || 0); o.akhir = String(k.akhir || '');
    return o;
  }
  function jenisDari(id) { return JENIS.filter(function (j) { return j.id === id; })[0] || null; }
  function senarai(p) {
    return ambil(p).aktif.map(function (k) { var j = jenisDari(k.jenis) || {}; return Object.assign({}, k, { ikon: j.ikon, nama: j.nama }); });
  }

  /** Pilihan penyelesaian satu krisis, dengan semakan kemampuan. */
  function pilihan(p, id) {
    var k = ambil(p).aktif.filter(function (x) { return x.id === id; })[0], j = k && jenisDari(k.jenis);
    if (!k || !j || !p) { return []; }
    var Sv = S(), myr = function (n) { return Sv && Sv.kosSebenar ? Sv.kosSebenar(p, n) : n; };
    var t = CONFIG.TURUN, b = CONFIG.BANTU, a = CONFIG.ABAI, bMyr = myr(b.myr);
    var senaraiP = [
      { id: 'turun', label: '🚶 ' + j.turun, ap: t.ap, myr: 0, stress: t.stress, akarUmbi: t.akarUmbi, bonus: t.bonus, ip: t.ip, penentang: t.penentang,
        ringkas: '-' + t.ap + ' AP, +' + t.akarUmbi + ' Sokongan Akar Umbi, Stress ' + t.stress + ', +' + t.bonus + ' sokongan kawasan, +' + t.penentang + ' Atas Pagar' },
      { id: 'bantu', label: '💸 ' + j.bantu, ap: 0, myr: bMyr, stress: 0, akarUmbi: b.akarUmbi, bonus: b.bonus, ip: b.ip, penentang: b.penentang,
        ringkas: '-MYR ' + bMyr + ', +' + b.akarUmbi + ' Sokongan Akar Umbi, +' + b.bonus + ' sokongan kawasan, +' + b.penentang + ' Atas Pagar' },
      { id: 'abai', label: '🙈 Abaikan', ap: 0, myr: 0, stress: 0, akarUmbi: a.akarUmbi, bonus: a.bonus, ip: 0,
        ringkas: 'Tiada kos, ' + a.akarUmbi + ' Sokongan Akar Umbi, ' + a.bonus + ' sokongan kawasan' }
    ];
    senaraiP.forEach(function (o) {
      o.boleh = true; o.sebab = '';
      if ((Number(p.ap) || 0) < o.ap) { o.boleh = false; o.sebab = 'AP tidak mencukupi (perlu ' + o.ap + ').'; }
      else if ((Number(p.myr) || 0) < o.myr) { o.boleh = false; o.sebab = 'Wang tidak mencukupi (perlu MYR ' + o.myr + ').'; }
    });
    return senaraiP;
  }

  function bonusBaharu(p, cid, delta) {
    var a = p.peta && typeof p.peta === 'object' ? p.peta : {}, peta = JSON.parse(JSON.stringify(a)), kunci = 'C:' + cid, H = CONFIG.HAD_BONUS;
    if (!peta.bonus || typeof peta.bonus !== 'object') { peta.bonus = {}; }
    peta.bonus[kunci] = Math.max(-H, Math.min(H, (Number(peta.bonus[kunci]) || 0) + delta));
    return peta;
  }
  function simpanState(p, state, kesan, log, delta, cid) {
    var Sv = S(), patch = { krisisPeta: state };
    if (delta) { patch.peta = bonusBaharu(p, cid, delta); }
    return Sv.applyEffects(kesan || {}, { kiraTindakan: false, patch: patch, log: log });
  }

  function selesai(id, pilihId) {
    var Sv = S(), p = Sv && Sv.loadPlayer();
    if (!p) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var state = ambil(p), k = state.aktif.filter(function (x) { return x.id === id; })[0];
    if (!k) { return { ok: false, ralat: 'Krisis ini sudah diselesaikan.' }; }
    var o = pilihan(p, id).filter(function (x) { return x.id === pilihId; })[0];
    if (!o) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    if (!o.boleh) { return { ok: false, ralat: o.sebab }; }
    var j = jenisDari(k.jenis);
    state.aktif = state.aktif.filter(function (x) { return x.id !== id; });
    if (pilihId === 'abai') { state.terabai += 1; } else { state.selesai += 1; }
    var kesan = { ip: o.ip || 0, kesetiaan: { akarUmbi: o.akarUmbi, penentang: o.penentang || 0 } };
    if (o.ap) { kesan.ap = -o.ap; }
    if (o.myr) { kesan.myr = -o.myr; }
    var r = simpanState(p, state, kesan, { tindakan: 'krisis_peta', nama: (pilihId === 'abai' ? 'Mengabaikan ' : 'Menyelesaikan ') + j.nama + ' di ' + k.tempat, peringkat: 'ahli' }, o.bonus, k.cid);
    if (!r.ok) { return { ok: false, ralat: r.ralat || 'Gagal menyimpan.' }; }
    if (o.stress && ST() && ST().laras) { ST().laras({ stress: o.stress }); }
    return { ok: true, pilihan: pilihId, krisis: k, mesej: j.nama + ' di ' + k.tempat + ' ' + (pilihId === 'abai' ? 'diabaikan' : 'diselesaikan') + ': ' + o.ringkas + '.' };
  }

  function prosesBulan(o) {
    o = o || {};
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat || !(p.jawatanList || []).length) { return { peristiwa: ev }; }
    var state = ambil(p), kunciBulan = p.tahun + '-' + p.bulan, kini = (Number(p.tahun) || 0) * 12 + (Number(p.bulan) || 0);
    if (state.akhir === kunciBulan) { return { peristiwa: ev }; }
    var rng = o.rng || Sv.rngBerbenih(String(p.id) + '|krisispeta|' + kunciBulan), kesan = { kesetiaan: { akarUmbi: 0, penentang: 0 } }, delta = {};
    /* 1. krisis yang dibiarkan terlalu lama dianggap diabaikan */
    var kekal = [];
    state.aktif.forEach(function (k) {
      if (kini - ((Number(k.tahun) || 0) * 12 + (Number(k.bulan) || 0)) >= CONFIG.LEWAT_BULAN) {
        kesan.kesetiaan.akarUmbi += CONFIG.LEWAT.akarUmbi; kesan.kesetiaan.penentang += CONFIG.LEWAT.penentang; delta[k.cid] = (delta[k.cid] || 0) + CONFIG.LEWAT.bonus; state.terabai += 1;
        ev.push({ jenis: 'krisis_peta_lewat', mesej: (jenisDari(k.jenis) || {}).nama + ' di ' + k.tempat + ' dibiarkan terlalu lama. Penduduk kecewa (' + CONFIG.LEWAT.akarUmbi + ' Sokongan Akar Umbi, ' + CONFIG.LEWAT.penentang + ' Atas Pagar).' });
      } else { kekal.push(k); }
    });
    state.aktif = kekal;
    /* 2. krisis baharu */
    if (state.aktif.length < CONFIG.MAKS_AKTIF && rng() < CONFIG.PELUANG) {
      var calon = [];
      try { calon = PENYEDIA ? (PENYEDIA(p) || []) : []; } catch (e) { calon = []; }
      if (!calon.length && p.id) { calon = [{ id: p.id, nama: p.cawangan || 'Cawangan anda' }]; }
      calon = calon.filter(function (c) { return c && c.id && !state.aktif.some(function (k) { return k.cid === c.id; }); });
      if (calon.length) {
        var c = calon[Math.floor(rng() * calon.length)], j = JENIS[Math.floor(rng() * JENIS.length)];
        state.aktif.push({ id: 'kp' + p.tahun + '-' + p.bulan + '-' + (state.selesai + state.terabai + state.aktif.length), jenis: j.id, cid: c.id, tempat: c.nama, tahun: p.tahun, bulan: p.bulan });
        ev.push({ jenis: 'krisis_peta', mesej: j.ikon + ' ' + j.nama + ' di ' + c.nama + '. Buka tab Peta dan tekan ikon ⚠️ untuk menyelesaikannya.' });
      }
    }
    state.akhir = kunciBulan;
    var tukar = Object.keys(delta);
    var r = Sv.applyEffects(kesan.kesetiaan.akarUmbi || kesan.kesetiaan.penentang ? { kesetiaan: kesan.kesetiaan } : {}, { kiraTindakan: false, patch: { krisisPeta: state } });
    if (r.ok && tukar.length) {
      var p2 = Sv.loadPlayer(), peta = p2.peta && typeof p2.peta === 'object' ? JSON.parse(JSON.stringify(p2.peta)) : {};
      peta.bonus = peta.bonus || {};
      tukar.forEach(function (cid) { var H = CONFIG.HAD_BONUS; peta.bonus['C:' + cid] = Math.max(-H, Math.min(H, (Number(peta.bonus['C:' + cid]) || 0) + delta[cid])); });
      Sv.applyEffects({}, { kiraTindakan: false, patch: { peta: peta } });
    }
    return { peristiwa: r.ok ? ev : [] };
  }

  return { JENIS: JENIS, CONFIG: CONFIG, sediakanLokasi: sediakanLokasi, ambil: ambil, senarai: senarai, pilihan: pilihan, selesai: selesai, prosesBulan: prosesBulan };
});
