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
   State: p.jemaah = { kunci, umum, rombak, tahunRombak, pilih:[8], senarai:[{portfolio, menteri, timbalan, jenis, jenisT}], kecekapan, kesetiaan, rakan, borneo, pencabar }
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
    PENCABAR_KURANG: 0.15, ROMBAK_AP: 3, BIL_PENCABAR: 2
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
  function nama(rng, jenis, gelar) {
    var d = D(), j = rng() < 0.75 ? 'L' : 'P';
    if (!d || !d.janaNama) { return 'Pemimpin NPC'; }
    var n = d.janaNama(rng, j, gelar ? 'dato' : null, { etnik: jenis === 'borneo' && rng() < 0.6 ? 'dayak' : 'melayu' });
    return n.replace(/^Datin( Paduka)? /, "Dato' ");                // menteri wanita memegang gelaran sendiri (bukan gelaran isteri)
  }
  function bulat(n) { return Math.round(n); }

  /** 8 slot portfolio utama, setiap satu 3 calon (satu daripada setiap jenis). Deterministik bagi setiap penggal / rombakan. */
  function calon(p) {
    var j = p.jemaah || {}, rng = rngUntuk(p, kunciPenggal(p) + '|' + (j.tahunRombak || 0)), pencabarSlot = [];
    while (pencabarSlot.length < CONFIG.BIL_PENCABAR) { var s = Math.floor(rng() * CONFIG.UTAMA.length); if (pencabarSlot.indexOf(s) < 0) { pencabarSlot.push(s); } }
    return CONFIG.UTAMA.map(function (portfolio, i) {
      var c = ['anda', 'rakan', 'borneo'].map(function (jenis) {
        var pc = jenis === 'anda' && pencabarSlot.indexOf(i) >= 0;
        return { nama: nama(rng, jenis, true), jenis: jenis, kecekapan: bulat(pc ? 60 + rng() * 15 : 52 + rng() * 38), kesetiaan: bulat(pc ? 22 + rng() * 14 : jenis === 'anda' ? 58 + rng() * 30 : 38 + rng() * 32), pencabar: pc };
      });
      for (var k = c.length - 1; k > 0; k--) { var t = Math.floor(rng() * (k + 1)), x = c[k]; c[k] = c[t]; c[t] = x; }   // susunan rawak tetap
      return { portfolio: portfolio, calon: c };
    });
  }

  function perluBentuk(p) {
    if (!adalahPM(p)) { return false; }
    var j = p.jemaah;
    return !j || j.kunci !== kunciPenggal(p) || !j.umum;
  }

  /** Ringkasan pilihan (untuk meter pratonton dan umumkan). pilih: [indeks calon bagi setiap slot | null]. */
  function nilai(p, pilih) {
    var sl = calon(p), dipilih = [];
    sl.forEach(function (s, i) { var n = pilih ? pilih[i] : null; if (n != null && s.calon[n]) { dipilih.push(s.calon[n]); } });
    var n = dipilih.length || 1;
    var cek = bulat(dipilih.reduce(function (a, c) { return a + c.kecekapan; }, 0) / n), set = bulat(dipilih.reduce(function (a, c) { return a + c.kesetiaan; }, 0) / n);
    var rakan = dipilih.filter(function (c) { return c.jenis !== 'anda'; }).length, borneo = dipilih.filter(function (c) { return c.jenis === 'borneo'; }).length;
    var tekanan = set >= CONFIG.SETIA_TINGGI ? CONFIG.TEKANAN.tinggi : set >= CONFIG.SETIA_SEDERHANA ? CONFIG.TEKANAN.sederhana : CONFIG.TEKANAN.rendah;
    var penaltiHub = Math.max(0, CONFIG.KUOTA_RAKAN - rakan) * CONFIG.PENALTI_RAKAN + (borneo < CONFIG.KUOTA_BORNEO ? CONFIG.PENALTI_BORNEO : 0);
    return { lengkap: dipilih.length === sl.length, bil: dipilih.length, kecekapan: dipilih.length ? cek : 0, kesetiaan: dipilih.length ? set : 0, rakan: rakan, borneo: borneo,
      tadbir: bulat(CONFIG.TADBIR_ASAS + (dipilih.length ? cek : 0) * CONFIG.TADBIR_FAKTOR), tekananBulanan: tekanan, penaltiHubungan: penaltiHub,
      pencabar: dipilih.filter(function (c) { return c.pencabar; }).length };
  }

  /** Senarai penuh Jemaah Menteri (29 portfolio + PM/TPM). utama: pilihan PM bagi 8 slot (jika ada). */
  function binaSenarai(p, garam, utama) {
    var rng = rngUntuk(p, 'senarai|' + garam), k = kab(p), port = senaraiPortfolio(), out = [];
    function jenisRawak() { var r = rng(); return r < 0.6 ? 'anda' : r < 0.85 ? 'rakan' : 'borneo'; }
    var pm = k.roleLevel === 'PERDANA_MENTERI', tpm = k.roleLevel === 'TIMBALAN_PM';
    out.push({ portfolio: 'Perdana Menteri', menteri: pm ? null : nama(rng, 'anda', true), jenis: 'anda', anda: pm });
    var jt = rng() < 0.5 ? 'borneo' : 'rakan';
    out.push({ portfolio: 'Timbalan Perdana Menteri', menteri: tpm ? null : nama(rng, jt, true), jenis: tpm ? 'anda' : jt, anda: tpm });
    port.forEach(function (nm) {
      var iU = CONFIG.UTAMA.indexOf(nm), u = utama && iU >= 0 ? utama[iU] : null;
      var jm = u ? u.jenis : (/Sabah dan Sarawak/.test(nm) ? 'borneo' : jenisRawak()), jtm = jenisRawak();
      var r = { portfolio: nm, menteri: u ? u.nama : nama(rng, jm, true), jenis: jm, timbalan: nama(rng, jtm, false), jenisT: jtm };
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
    if (!n.lengkap) { return { ok: false, ralat: 'Pilih menteri bagi semua ' + CONFIG.UTAMA.length + ' portfolio utama.' }; }
    var sl = calon(p), utama = sl.map(function (s, i) { return s.calon[pilih[i]]; }), lama = p.jemaah || {};
    var kunci = kunciPenggal(p), j = { kunci: kunci, umum: true, rombak: false, tahunRombak: lama.tahunRombak || 0, pilih: pilih.slice(),
      senarai: binaSenarai(p, kunci + '|' + (lama.tahunRombak || 0), utama), kecekapan: n.kecekapan, kesetiaan: n.kesetiaan, rakan: n.rakan, borneo: n.borneo, pencabar: n.pencabar, tekananBulanan: n.tekananBulanan };
    var k = kab(p); k.governanceRating = clamp(n.tadbir, 0, 100);
    var patch = { jemaah: j, kabinet: k };
    var PRm = modul('MyPolitikPRU', 'pru.js');
    if (n.penaltiHubungan && PRm && PRm.getPRU) { var pr = JSON.parse(JSON.stringify(PRm.getPRU(p))); pr.hubunganGabungan = clamp((Number(pr.hubunganGabungan) || 50) - n.penaltiHubungan, 0, 100); patch.pru = pr; }
    if (n.pencabar && p.rival && p.rival.senaraiPencabar) {
      var rv = JSON.parse(JSON.stringify(p.rival));
      Object.keys(rv.senaraiPencabar).forEach(function (lv) { var x = rv.senaraiPencabar[lv]; if (x && typeof x.kuasa === 'number') { x.kuasa = Math.round(x.kuasa * (1 - CONFIG.PENCABAR_KURANG) * 10) / 10; } });
      patch.rival = rv;
    }
    var r = Sv.applyEffects({}, { kiraTindakan: false, patch: patch, log: { tindakan: 'jemaah_umum', nama: 'Jemaah Menteri diumumkan', peringkat: 'ahli' } });
    if (!r.ok) { return { ok: false, ralat: r.ralat || 'Gagal menyimpan.' }; }
    var m = 'Jemaah Menteri diumumkan. Penarafan Tadbir Urus ' + n.tadbir + '.';
    if (n.penaltiHubungan) { m += ' Hubungan Gabungan -' + n.penaltiHubungan + '.'; }
    if (n.pencabar) { m += ' Pencabar dalam parti dilantik: kuasa pencabar -15%.'; }
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

  return { CONFIG: CONFIG, JENIS_LABEL: JENIS_LABEL, adalahPM: adalahPM, dalamKerajaan: dalamKerajaan, perluBentuk: perluBentuk, calon: calon, nilai: nilai,
    senarai: senarai, umumkan: umumkan, bolehRombak: bolehRombak, rombak: rombak, prosesBulan: prosesBulan };
});
