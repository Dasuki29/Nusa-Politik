/* ==========================================================================
   Nusa Politik — js/jemaah.js   (v12.1)
   Jemaah Menteri: Perdana Menteri memilih menteri bagi 8 portfolio utama (3 calon setiap satu); 21 portfolio lain
   diisi automatik. Semua pemain dalam kerajaan boleh melihat senarai Jemaah Menteri (watak rekaan).

   Kesan (mockup v12 dipersetujui pengguna; nombor andaian permainan):
     - purata Kecekapan  -> Penarafan Tadbir Urus awal = 40 + Kecekapan x 0.3
     - purata Kesetiaan  -> Tekanan Politik setiap bulan: >= 60: -2, 45-59: 0, < 45: +2
     - kuota rakan gabungan (bukan parti anda) sekurang-kurangnya 3/8; setiap kekurangan: Hubungan Gabungan -10
     - wakil Sabah/Sarawak sekurang-kurangnya 2/8; jika kurang: Hubungan Gabungan -5
       (ANDAIAN: tiada statistik sokongan wilayah dalam permainan, jadi dipetakan kepada hubungan dengan rakan Borneo)
     - melantik pencabar dalam parti: kuasa semua pencabar (js/rival.js) -15%
     - rombakan kabinet: sekali setahun, 3 AP
   v13.46 (maklum balas baris 25, mockup dipersetujui):
     - PM memilih TPM: Timbalan Presiden (tradisi, Kesetiaan +10), Naib Presiden, ketua parti rakan (Hubungan Gabungan +8)
       atau ketua rakan Sabah/Sarawak (Hubungan +5, dikira wakil Borneo). Timbalan Presiden bukan TPM: Kesetiaan -15, kuasa pencabar +10%.
     - PM boleh mengisi semua 29 portfolio (8 utama wajib, 21 lain pilihan; dibiar = automatik).
     - calon parti sendiri daripada struktur parti (js/organisasi.js): Timbalan Presiden, Naib Presiden, ketua sayap,
       pegawai Pusat dan Ahli MKT. Seorang satu jawatan. Naib Presiden / ketua sayap tidak dilantik: Kesetiaan -3 setiap seorang.
     - pilih: { tpm: id, m: { portfolio: id } } (tatasusunan indeks lama bagi 8 slot masih diterima).
   State: p.jemaah = { kunci, umum, rombak, tahunRombak, pilih:{tpm, m:{portfolio: id}} (lama: [8]), senarai:[{portfolio, menteri, timbalan, jenis, jenisT}], kecekapan, kesetiaan, rakan, borneo, pencabar }
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikJemaah = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function D() { return modul('MyPolitikData', 'data.js'); }
  function KD() { return modul('MyPolitikKabinetData', 'kabinet-data.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  var CONFIG = {
    UTAMA: ['Menteri Kewangan', 'Menteri Dalam Negeri', 'Menteri Pertahanan', 'Menteri Pendidikan', 'Menteri Kesihatan', 'Menteri Luar Negeri', 'Menteri Ekonomi', 'Menteri Kerja Raya'],
    KUOTA_RAKAN: 3, KUOTA_BORNEO: 2, PENALTI_RAKAN: 10, PENALTI_BORNEO: 5,
    TADBIR_ASAS: 40, TADBIR_FAKTOR: 0.3,
    TEKANAN: { tinggi: -2, sederhana: 0, rendah: 2 }, SETIA_TINGGI: 60, SETIA_SEDERHANA: 45,
    PENCABAR_KURANG: 0.15, ROMBAK_AP: 3, BIL_PENCABAR: 2,
    ETNIK_RAKAN: { melayu: 0.4, cina: 0.4, india: 0.2 },
    TPM_TRADISI: 10, TPM_LANGKAU: 15, TPM_PENCABAR: 0.10, TPM_HUB_RAKAN: 8, TPM_HUB_BORNEO: 5, PEMIMPIN_TERTINGGAL: 3   // v13.46: andaian (mockup baris 25)
  };
  var JENIS_LABEL = { anda: 'Parti anda', rakan: 'Rakan gabungan', borneo: 'Sabah/Sarawak' };

  function kab(p) { var K = KB(); return K && K.getKabinet ? K.getKabinet(p) : (p.kabinet || {}); }
  function adalahPM(p) { return !!p && kab(p).roleLevel === 'PERDANA_MENTERI'; }
  function dalamKerajaan(p) { var k = p ? kab(p) : null; return !!(k && k.hasGovernmentRole && ['TIMBALAN_MENTERI', 'MENTERI_PENUH', 'TIMBALAN_PM', 'PERDANA_MENTERI'].indexOf(k.roleLevel) >= 0); }
  /** Kunci penggal: lantikan kerajaan persekutuan terakhir (tahun-bulan). */
  function kunciPenggal(p) {
    var sj = (kab(p).sejarah || []).filter(function (x) { return x && x.hasil === 'dilantik'; }), x = sj[sj.length - 1];
    return x ? x.tahun + '-' + x.bulan : String(p.tahun || '');
  }
  function rngUntuk(p, garam) { var Sv = S(); return Sv.rngBerbenih(String(p.id || p.nama || 'nusa') + '|jemaah|' + garam); }
  function senaraiPortfolio() { var d = KD(); return d && d.menteri && d.menteri.length ? d.menteri.map(function (m) { return m.nama; }) : CONFIG.UTAMA.slice(); }
  /** v13.42 (maklum balas baris 32): menteri rakan gabungan termasuk wakil Cina dan India (cth MCA, MIC, DAP). ANDAIAN: Melayu 40%, Cina 40%, India 20%. */
  function etnikRakan(x) { return x < CONFIG.ETNIK_RAKAN.melayu ? 'melayu' : x < CONFIG.ETNIK_RAKAN.melayu + CONFIG.ETNIK_RAKAN.cina ? 'cina' : 'india'; }
  function nama(rng, jenis, gelar) {
    var d = D(), j = rng() < 0.75 ? 'L' : 'P';
    if (!d || !d.janaNama) { return 'Pemimpin NPC'; }
    var n = d.janaNama(rng, j, gelar ? 'dato' : null, { etnik: jenis === 'borneo' ? (rng() < 0.6 ? 'dayak' : 'melayu') : jenis === 'rakan' ? etnikRakan(rng()) : undefined });   // 'anda': ikut kaum parti pemain (cth DAP / MCA)
    return n.replace(/^Datin( Paduka)? /, "Dato' ");                // menteri wanita memegang gelaran sendiri (bukan gelaran isteri)
  }
  function bulat(n) { return Math.round(n); }

  function ORG() { return modul('MyPolitikOrganisasi', 'organisasi.js'); }
  function antara(r, a, b) { return bulat(a + r() * (b - a)); }
  /** v13.46: kolam calon parti sendiri daripada struktur Pusat (deterministik bagi setiap penggal / rombakan). */
  function kolamParti(p, rng) {
    var O = ORG(), out = [], dilihat = {};
    var st = null; try { st = O && O.getStruktur ? O.getStruktur(p) : null; } catch (e) { st = null; }
    var b = st && st.induk && st.induk.pusat;
    function tambah(x, kat, kec, kes) {
      if (!x || x.pemain || !x.nama || dilihat[x.nama]) { return; }
      dilihat[x.nama] = 1;
      out.push({ id: 's:' + out.length, nama: x.nama, jawatan: x.jawatan, jenis: 'anda', kat: kat, kecekapan: antara(rng, kec[0], kec[1]), kesetiaan: antara(rng, kes[0], kes[1]), pencabar: false });
    }
    if (b) {
      tambah(b.naib && b.naib.kod === 'timbalan_presiden' ? b.naib : b.timbalan, 'tp', [60, 85], [50, 75]);
      (b.tambahan || []).forEach(function (x) {
        var j = String(x.jawatan || ''), kat = /^Naib Presiden/.test(j) ? 'np' : /^Ketua (Wanita|Pemuda|Puteri|Putera)/.test(j) ? 'sayap' : 'peg';
        tambah(x, kat, kat === 'peg' ? [50, 82] : [55, 88], kat === 'peg' ? [60, 88] : [50, 85]);
      });
      // UMNO: ketua sayap sudah dalam senarai pegawai Pusat; parti lain: ambil ketua sayap Pusat
      var PT = modul('MyPolitikParti', 'parti.js'), sayapParti = PT && PT.SENARAI && PT.SENARAI[p.parti] && PT.SENARAI[p.parti].sayap;
      if (!out.some(function (x) { return x.kat === 'sayap'; })) Object.keys((st && st.sayap) || {}).filter(function (w) { return !sayapParti || sayapParti.indexOf(w) >= 0; }).forEach(function (w) { var k = st.sayap[w] && st.sayap[w].peringkat && st.sayap[w].peringkat.pusat && st.sayap[w].peringkat.pusat.ketua; if (k) { tambah(k, 'sayap', [55, 85], [50, 85]); } });
      (b.ajk || []).forEach(function (x) { tambah(x, 'mkt', [45, 85], [40, 85]); });
    }
    if (!out.length) {                                                        // tiada struktur: nama rawak (sama seperti sebelum v13.46)
      for (var i = 0; i < 12; i++) { out.push({ id: 's:' + i, nama: nama(rng, 'anda', true), jawatan: 'Pemimpin parti', jenis: 'anda', kat: 'mkt', kecekapan: antara(rng, 52, 90), kesetiaan: antara(rng, 58, 88), pencabar: false }); }
    }
    var calonP = out.filter(function (x) { return x.kat === 'np' || x.kat === 'mkt'; }), n = 0;
    while (n < Math.min(CONFIG.BIL_PENCABAR, calonP.length)) { var c = calonP[Math.floor(rng() * calonP.length)]; if (!c.pencabar) { c.pencabar = true; c.kecekapan = antara(rng, 60, 75); c.kesetiaan = antara(rng, 22, 36); n++; } }
    return out;
  }
  function garamCalon(p) { var j = p.jemaah || {}; return kunciPenggal(p) + '|' + (j.tahunRombak || 0); }
  /** v13.46: semua calon: parti (struktur), rakan (8), Borneo (8), dan ketua rakan / Borneo untuk TPM. */
  function kolam(p) {
    var rng = rngUntuk(p, 'kolam|' + garamCalon(p)), parti = kolamParti(p, rng), rakan = [], borneo = [];
    for (var i = 0; i < CONFIG.UTAMA.length; i++) {
      rakan.push({ id: 'r:' + i, nama: nama(rng, 'rakan', true), jawatan: 'Rakan gabungan', jenis: 'rakan', kat: 'rakan', kecekapan: antara(rng, 52, 90), kesetiaan: antara(rng, 38, 70), pencabar: false });
      borneo.push({ id: 'b:' + i, nama: nama(rng, 'borneo', true), jawatan: 'Sabah/Sarawak', jenis: 'borneo', kat: 'borneo', kecekapan: antara(rng, 52, 90), kesetiaan: antara(rng, 38, 70), pencabar: false });
    }
    var tpmR = { id: 't:r', nama: nama(rng, 'rakan', true).replace(/^Dato' /, "Dato' Sri "), jawatan: 'Presiden parti rakan', jenis: 'rakan', kat: 'ketua_rakan', kecekapan: antara(rng, 65, 85), kesetiaan: antara(rng, 45, 65), pencabar: false };
    var tpmB = { id: 't:b', nama: nama(rng, 'borneo', true), jawatan: 'Ketua rakan Sabah/Sarawak', jenis: 'borneo', kat: 'ketua_borneo', kecekapan: antara(rng, 60, 80), kesetiaan: antara(rng, 45, 65), pencabar: false };
    return { parti: parti, rakan: rakan, borneo: borneo, tpm: [tpmR, tpmB] };
  }
  function semuaCalon(k) { return k.parti.concat(k.rakan, k.borneo, k.tpm); }
  function cariCalon(k, id) { return semuaCalon(k).filter(function (x) { return x.id === id; })[0] || null; }
  /** Calon TPM: Timbalan Presiden, Naib Presiden paling cekap, ketua parti rakan, ketua rakan Borneo. */
  function calonTPM(p, k) {
    k = k || kolam(p);
    var tp = k.parti.filter(function (x) { return x.kat === 'tp'; })[0], np = k.parti.filter(function (x) { return x.kat === 'np'; }).sort(function (a, b) { return b.kecekapan - a.kecekapan; })[0];
    return [tp, np, k.tpm[0], k.tpm[1]].filter(Boolean);
  }

  /** 8 slot portfolio utama, setiap satu 3 calon (parti, rakan, Borneo). Deterministik bagi setiap penggal / rombakan. */
  function calon(p) {
    var k = kolam(p), rng = rngUntuk(p, 'slot|' + garamCalon(p));
    var parti = k.parti.filter(function (x) { return x.kat !== 'tp'; });
    return CONFIG.UTAMA.map(function (portfolio, i) {
      var c = [parti[i % Math.max(1, parti.length)] || k.parti[0], k.rakan[i], k.borneo[i]];
      for (var m = c.length - 1; m > 0; m--) { var t = Math.floor(rng() * (m + 1)), x = c[m]; c[m] = c[t]; c[t] = x; }   // susunan rawak tetap
      return { portfolio: portfolio, calon: c };
    });
  }
  /** Tukar pilihan (tatasusunan indeks lama atau objek baharu) kepada { tpm, m }. */
  function normal(p, pilih, k) {
    if (Array.isArray(pilih)) {
      var sl = calon(p), m = {}, tp = calonTPM(p, k)[0];
      sl.forEach(function (s, i) { var n = pilih[i]; if (n != null && s.calon[n]) { m[s.portfolio] = s.calon[n].id; } });
      return { tpm: tp ? tp.id : null, m: m, lama: true };
    }
    pilih = pilih || {};
    return { tpm: pilih.tpm || null, m: Object.assign({}, pilih.m || {}) };
  }
  function perluBentuk(p) {
    if (!adalahPM(p)) { return false; }
    var j = p.jemaah;
    return !j || j.kunci !== kunciPenggal(p) || !j.umum;
  }

  /** Ringkasan pilihan (untuk meter pratonton dan umumkan). */
  function nilai(p, pilihIn) {
    var k = kolam(p), pl = normal(p, pilihIn, k), ids = [], dup = [];
    function ambil(id) { if (!id) { return null; } if (ids.indexOf(id) >= 0) { if (dup.indexOf(id) < 0) { dup.push(id); } } else { ids.push(id); } return cariCalon(k, id); }
    var tpm = ambil(pl.tpm), utama = CONFIG.UTAMA.map(function (nm) { return ambil(pl.m[nm]); }), dipilih = utama.filter(Boolean);
    var lain = Object.keys(pl.m).filter(function (nm) { return CONFIG.UTAMA.indexOf(nm) < 0; }).map(function (nm) { return ambil(pl.m[nm]); }).filter(Boolean);
    var semua = dipilih.concat(lain, tpm ? [tpm] : []), n = semua.length || 1;
    var cek = bulat(semua.reduce(function (a, c) { return a + c.kecekapan; }, 0) / n), set = bulat(semua.reduce(function (a, c) { return a + c.kesetiaan; }, 0) / n);
    var tp = k.parti.filter(function (x) { return x.kat === 'tp'; })[0] || null, tpTPM = !!(tp && tpm && tpm.id === tp.id);
    var tpLangkau = !!(tp && tpm && !tpTPM && !pl.lama);
    var pemimpin = k.parti.filter(function (x) { return x.kat === 'np' || x.kat === 'sayap'; }), tertinggal = pemimpin.filter(function (x) { return ids.indexOf(x.id) < 0; });
    var npDalam = k.parti.filter(function (x) { return x.kat === 'np' && ids.indexOf(x.id) >= 0; }).length, npJumlah = k.parti.filter(function (x) { return x.kat === 'np'; }).length;
    var adjSetia = pl.lama ? 0 : (tpTPM ? CONFIG.TPM_TRADISI : tpLangkau ? -CONFIG.TPM_LANGKAU : 0) - tertinggal.length * CONFIG.PEMIMPIN_TERTINGGAL;
    if (semua.length) { set = clamp(set + adjSetia, 0, 100); }
    var rakan = dipilih.filter(function (c) { return c.jenis !== 'anda'; }).length, borneo = dipilih.filter(function (c) { return c.jenis === 'borneo'; }).length + (tpm && tpm.jenis === 'borneo' ? 1 : 0);
    var tekanan = set >= CONFIG.SETIA_TINGGI ? CONFIG.TEKANAN.tinggi : set >= CONFIG.SETIA_SEDERHANA ? CONFIG.TEKANAN.sederhana : CONFIG.TEKANAN.rendah;
    var penaltiHub = Math.max(0, CONFIG.KUOTA_RAKAN - rakan) * CONFIG.PENALTI_RAKAN + (borneo < CONFIG.KUOTA_BORNEO ? CONFIG.PENALTI_BORNEO : 0);
    var bonusHub = tpm && tpm.kat === 'ketua_rakan' ? CONFIG.TPM_HUB_RAKAN : tpm && tpm.kat === 'ketua_borneo' ? CONFIG.TPM_HUB_BORNEO : 0;
    var pencabarTiada = k.parti.filter(function (x) { return x.pencabar && ids.indexOf(x.id) < 0; });
    return { lengkap: dipilih.length === CONFIG.UTAMA.length && !!tpm && !dup.length, bil: dipilih.length, bilLain: lain.length, kecekapan: semua.length ? cek : 0, kesetiaan: semua.length ? set : 0, rakan: rakan, borneo: borneo,
      tadbir: bulat(CONFIG.TADBIR_ASAS + (semua.length ? cek : 0) * CONFIG.TADBIR_FAKTOR), tekananBulanan: tekanan, penaltiHubungan: penaltiHub, bonusHubungan: bonusHub,
      pencabar: semua.filter(function (c) { return c.pencabar; }).length, tpm: tpm, tp: tp, tpTPM: tpTPM, tpLangkau: tpLangkau, npDalam: npDalam, npJumlah: npJumlah,
      tertinggal: tertinggal.map(function (x) { return x.jawatan; }), pencabarTiada: pencabarTiada.map(function (x) { return x.jawatan; }),
      duplikat: dup.map(function (id) { var c = cariCalon(k, id); return c ? c.nama : id; }), pilih: pl };
  }

  /** Senarai penuh Jemaah Menteri (29 portfolio + PM/TPM). pilihan: { 'Timbalan Perdana Menteri': calon, portfolio: calon } (jika ada). */
  function binaSenarai(p, garam, pilihan) {
    var rng = rngUntuk(p, 'senarai|' + garam), k = kab(p), port = senaraiPortfolio(), out = [];
    pilihan = pilihan || {};
    function jenisRawak() { var r = rng(); return r < 0.6 ? 'anda' : r < 0.85 ? 'rakan' : 'borneo'; }
    var pm = k.roleLevel === 'PERDANA_MENTERI', tpm = k.roleLevel === 'TIMBALAN_PM';
    out.push({ portfolio: 'Perdana Menteri', menteri: pm ? null : nama(rng, 'anda', true), jenis: 'anda', anda: pm });
    var jt = rng() < 0.5 ? 'borneo' : 'rakan', ct = pilihan['Timbalan Perdana Menteri'], nt = nama(rng, jt, true);
    out.push({ portfolio: 'Timbalan Perdana Menteri', menteri: tpm ? null : ct ? ct.nama : nt, jenis: tpm ? 'anda' : ct ? ct.jenis : jt, jawatanParti: ct && ct.jenis === 'anda' ? ct.jawatan : undefined, anda: tpm });
    port.forEach(function (nm) {
      var u = pilihan[nm] || null;
      var jm = u ? u.jenis : (/Sabah dan Sarawak/.test(nm) ? 'borneo' : jenisRawak()), jtm = jenisRawak(), na = nama(rng, jm, true);
      var r = { portfolio: nm, menteri: u ? u.nama : na, jenis: jm, timbalan: nama(rng, jtm, false), jenisT: jtm };
      if (u && u.jenis === 'anda') { r.jawatanParti = u.jawatan; }
      if (k.roleLevel === 'MENTERI_PENUH' && k.portfolioName === nm) { r.menteri = null; r.jenis = 'anda'; r.anda = true; }
      if (k.roleLevel === 'TIMBALAN_MENTERI' && k.portfolioName === nm.replace(/^Menteri /, 'Timbalan Menteri ')) { r.timbalan = null; r.jenisT = 'anda'; r.andaT = true; }
      out.push(r);
    });
    return out;
  }
  function senarai(p) {
    if (!dalamKerajaan(p)) { return null; }
    var j = p.jemaah;
    if (adalahPM(p) && j && j.umum && j.kunci === kunciPenggal(p) && j.senarai) { return j.senarai; }
    return binaSenarai(p, kunciPenggal(p), null);
  }

  function umumkan(pilih) {
    var Sv = S(), p = Sv && Sv.loadPlayer();
    if (!p) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    if (!adalahPM(p)) { return { ok: false, ralat: 'Hanya Perdana Menteri boleh membentuk Jemaah Menteri.' }; }
    if (!perluBentuk(p)) { return { ok: false, ralat: 'Jemaah Menteri penggal ini sudah diumumkan.' }; }
    var n = nilai(p, pilih);
    if (n.duplikat.length) { return { ok: false, ralat: 'Seorang hanya boleh memegang satu jawatan: ' + n.duplikat.join(', ') + '.' }; }
    if (!n.tpm) { return { ok: false, ralat: 'Pilih Timbalan Perdana Menteri.' }; }
    if (!n.lengkap) { return { ok: false, ralat: 'Pilih menteri bagi semua ' + CONFIG.UTAMA.length + ' portfolio utama.' }; }
    var kl = kolam(p), pilihan = { 'Timbalan Perdana Menteri': n.tpm }, lama = p.jemaah || {};
    Object.keys(n.pilih.m).forEach(function (nm) { var c = cariCalon(kl, n.pilih.m[nm]); if (c) { pilihan[nm] = c; } });
    var kunci = kunciPenggal(p), j = { kunci: kunci, umum: true, rombak: false, tahunRombak: lama.tahunRombak || 0, pilih: { tpm: n.pilih.tpm, m: n.pilih.m },
      senarai: binaSenarai(p, kunci + '|' + (lama.tahunRombak || 0), pilihan), kecekapan: n.kecekapan, kesetiaan: n.kesetiaan, rakan: n.rakan, borneo: n.borneo, pencabar: n.pencabar, tekananBulanan: n.tekananBulanan };
    var k = kab(p); k.governanceRating = clamp(n.tadbir, 0, 100);
    var patch = { jemaah: j, kabinet: k }, ubahHub = n.bonusHubungan - n.penaltiHubungan;
    var PRm = modul('MyPolitikPRU', 'pru.js');
    if (ubahHub && PRm && PRm.getPRU) { var pr = JSON.parse(JSON.stringify(PRm.getPRU(p))); pr.hubunganGabungan = clamp((Number(pr.hubunganGabungan) || 50) + ubahHub, 0, 100); patch.pru = pr; }
    var faktor = (n.pencabar ? 1 - CONFIG.PENCABAR_KURANG : 1) * (n.tpLangkau ? 1 + CONFIG.TPM_PENCABAR : 1);
    if (faktor !== 1 && p.rival && p.rival.senaraiPencabar) {
      var rv = JSON.parse(JSON.stringify(p.rival));
      Object.keys(rv.senaraiPencabar).forEach(function (lv) { var x = rv.senaraiPencabar[lv]; if (x && typeof x.kuasa === 'number') { x.kuasa = Math.round(x.kuasa * faktor * 10) / 10; } });
      patch.rival = rv;
    }
    var r = Sv.applyEffects({}, { kiraTindakan: false, patch: patch, log: { tindakan: 'jemaah_umum', nama: 'Jemaah Menteri diumumkan (TPM: ' + n.tpm.nama + ')', peringkat: 'ahli' } });
    if (!r.ok) { return { ok: false, ralat: r.ralat || 'Gagal menyimpan.' }; }
    var m = 'Jemaah Menteri diumumkan. Timbalan Perdana Menteri: ' + n.tpm.nama + '. Penarafan Tadbir Urus ' + n.tadbir + '.';
    if (n.bonusHubungan) { m += ' TPM daripada rakan gabungan: Hubungan Gabungan +' + n.bonusHubungan + '.'; }
    if (n.penaltiHubungan) { m += ' Hubungan Gabungan -' + n.penaltiHubungan + '.'; }
    if (n.pencabar) { m += ' Pencabar dalam parti dilantik: kuasa pencabar -15%.'; }
    if (n.tpLangkau) { m += ' Timbalan Presiden dilangkau: kuasa pencabar +10%.'; }
    return { ok: true, mesej: m, nilai: n };
  }

  function bolehRombak(p) {
    if (!adalahPM(p) || !p.jemaah || !p.jemaah.umum) { return { boleh: false, sebab: 'Bentuk Jemaah Menteri dahulu.' }; }
    if (p.jemaah.tahunRombak === p.tahun) { return { boleh: false, sebab: 'Rombakan kabinet hanya sekali setahun.' }; }
    if ((Number(p.ap) || 0) < CONFIG.ROMBAK_AP) { return { boleh: false, sebab: 'AP tidak mencukupi (perlu ' + CONFIG.ROMBAK_AP + ').' }; }
    return { boleh: true, sebab: '' };
  }
  function rombak() {
    var Sv = S(), p = Sv && Sv.loadPlayer(); if (!p) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var b = bolehRombak(p); if (!b.boleh) { return { ok: false, ralat: b.sebab }; }
    var j = JSON.parse(JSON.stringify(p.jemaah)); j.umum = false; j.rombak = true; j.tahunRombak = p.tahun;
    var r = Sv.applyEffects({ ap: -CONFIG.ROMBAK_AP }, { kiraTindakan: false, patch: { jemaah: j }, log: { tindakan: 'jemaah_rombak', nama: 'Rombakan kabinet dimulakan', peringkat: 'ahli' } });
    return r.ok ? { ok: true, mesej: 'Rombakan kabinet: pilih semula menteri bagi portfolio utama.' } : { ok: false, ralat: r.ralat };
  }

  /** Setiap bulan (calendar.js): kesetiaan kabinet melaras Tekanan Politik PM. */
  function prosesBulan() {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || !adalahPM(p) || !p.jemaah || !p.jemaah.umum || !p.jemaah.tekananBulanan) { return { peristiwa: ev }; }
    var k = kab(p); k.tekananPolitik = clamp((Number(k.tekananPolitik) || 0) + p.jemaah.tekananBulanan, 0, 100);
    Sv.applyEffects({}, { kiraTindakan: false, patch: { kabinet: k } });
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, JENIS_LABEL: JENIS_LABEL, adalahPM: adalahPM, dalamKerajaan: dalamKerajaan, perluBentuk: perluBentuk, calon: calon, nilai: nilai, kolam: kolam, calonTPM: calonTPM, senaraiPortfolio: senaraiPortfolio,
    senarai: senarai, umumkan: umumkan, bolehRombak: bolehRombak, rombak: rombak, prosesBulan: prosesBulan };
});
