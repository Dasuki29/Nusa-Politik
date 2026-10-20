/* ==========================================================================
   Nusa Politik — js/kawasan.js   (v8.18)
   Peruntukan Kawasan: dana khas bulanan untuk ADUN, Ahli Parlimen dan Menteri.
     - Berasingan daripada Dana peribadi (p.myr). Hanya boleh dibelanjakan untuk projek kawasan.
     - Kerusi pembangkang menerima 40% sahaja (selaras soalan Dewan tentang peruntukan kawasan pembangkang).
     - Menteri / Timbalan Menteri / TPM / PM: tambahan dana projek kementerian (tidak dipengaruhi faktor pembangkang).
     - Baki yang tidak dibelanjakan hangus setiap Januari.
   v8.20: Keluhan Rakyat (1-2 sebulan, maks 4 tertunggak; ADUN / MP sahaja) dan Aktiviti Rakyat (sebulan sekali, 2 AP).
     Keluhan: selesaikan dengan peruntukan, bawa sebagai usul (papan Isu Tempatan / Usul Lokaliti) atau abaikan.
     Tidak dijawab 3 bulan = diabaikan automatik dengan penalti. Menggantikan 3 projek tetap v8.18.
   State: p.kawasan = { baki, akhir, tahun, sejarah, keluhan:[{id,kod,idx}], aktivitiAkhir, kurang }
   ANDAIAN: semua angka ialah penyeimbang simulasi, bukan peruntukan sebenar.
   API: CONFIG, KELUHAN, AKTIVITI, jumlahBulanan(p), ringkasan(p), selesaikan(id), usul(id), abai(id), aktiviti(id), prosesBulan(o)
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikKawasan = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function PR() { return modul('MyPolitikPRU', 'pru.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('ms-MY'); }

  var CONFIG = {
    ADUN: 1500, MP: 3000, MENTERI: 5000, PEMBANGKANG: 0.4, AP: 1,
    TAHAP_MENTERI: ['TIMBALAN_MENTERI', 'MENTERI_PENUH', 'TIMBALAN_PM', 'PERDANA_MENTERI']
  };
  var KELUHAN = [
    { kod: 'jalan_berlubang', ikon: '🛣️', tajuk: 'Jalan kampung berlubang', penerangan: 'Penduduk mengadu jalan masuk ke kawasan perumahan berlubang dan bahaya waktu malam.', kos: 800, tahap: 2 },
    { kod: 'air_terputus', ikon: '🚰', tajuk: 'Bekalan air kerap terputus', penerangan: 'Beberapa lorong tidak mendapat air selama dua hari berturut-turut.', kos: 1500, tahap: 3 },
    { kod: 'longkang_tersumbat', ikon: '🌊', tajuk: 'Longkang tersumbat', penerangan: 'Hujan lebat menyebabkan air bertakung di hadapan rumah penduduk.', kos: 500, tahap: 2 },
    { kod: 'lampu_jalan', ikon: '💡', tajuk: 'Lampu jalan rosak', penerangan: 'Lampu jalan di taman perumahan tidak menyala dan kes kecurian mula meningkat.', kos: 500, tahap: 1 },
    { kod: 'dewan_usang', ikon: '🏛️', tajuk: 'Dewan serbaguna usang', penerangan: 'Bumbung dewan komuniti bocor dan tidak selamat untuk majlis kenduri.', kos: 1000, tahap: 1 },
    { kod: 'kerja_belia', ikon: '🧑‍💼', tajuk: 'Belia sukar mendapat pekerjaan', penerangan: 'Ramai anak muda menganggur sejak kilang berhampiran mengurangkan pekerja.', kos: 1200, tahap: 3 }
  ];
  var KELUHAN_CFG = { SELESAI: { ip: 20, akarUmbi: 3 }, ABAI: { akarUmbi: -2 }, LUPUT: { bulan: 3, akarUmbi: -4, reputasi: -1 }, MAKS: 4, AP: 1 };
  var AKTIVITI = [
    { id: 'gotong', ikon: '🤝', nama: 'Gotong-royong kampung', kos: 400, ip: 10, akarUmbi: 4 },
    { id: 'kesihatan', ikon: '🩺', nama: 'Program kesihatan percuma', kos: 700, ip: 18, akarUmbi: 3, reputasi: 1 },
    { id: 'kenduri', ikon: '🍛', nama: 'Jamuan / kenduri', kos: 600, ip: 12, akarUmbi: 5, penentang: 2 },
    { id: 'tuisyen', ikon: '📚', nama: 'Kelas tuisyen percuma', kos: 500, ip: 10, akarUmbi: 4 },
    { id: 'dialog', ikon: '🗣️', nama: 'Dialog bersama rakyat', kos: 300, ip: 6, akarUmbi: 0, kurang: 1 }
  ];
  var AKTIVITI_AP = 2;
  function cariKeluhan(kod) { return KELUHAN.filter(function (x) { return x.kod === kod; })[0] || null; }

  function dasar() { return { baki: 0, akhir: '', tahun: 0, sejarah: [], keluhan: [], aktivitiAkhir: '', kurang: 0 }; }
  function getKawasan(p) {
    var k = p && p.kawasan && typeof p.kawasan === 'object' ? p.kawasan : {}, o = dasar();
    o.baki = Math.max(0, Math.round(Number(k.baki) || 0)); o.akhir = String(k.akhir || ''); o.tahun = Number(k.tahun) || 0;
    o.sejarah = Array.isArray(k.sejarah) ? k.sejarah.slice(-10) : [];
    o.keluhan = Array.isArray(k.keluhan) ? k.keluhan.filter(function (x) { return x && cariKeluhan(x.kod); }).map(function (x) { return { id: String(x.id), kod: x.kod, idx: Number(x.idx) || 0 }; }) : [];
    o.aktivitiAkhir = String(k.aktivitiAkhir || ''); o.kurang = Math.max(0, Math.round(Number(k.kurang) || 0));
    return o;
  }

  /** Jumlah bulanan + butiran. Kerusi pembangkang x0.4 (ikut status.kerajaan). */
  function jumlahBulanan(p) {
    var Pr = PR(), butiran = [], jumlah = 0, K = KB(), kb = K && K.getKabinet ? K.getKabinet(p) : null;
    var st = Pr && Pr.semuaStatus ? Pr.semuaStatus(p) : [];
    [['ADUN', 'Peruntukan Kawasan ADUN', CONFIG.ADUN], ['MP', 'Peruntukan Kawasan Ahli Parlimen', CONFIG.MP]].forEach(function (x) {
      var s = st.filter(function (y) { return y.jenis === x[0]; })[0]; if (!s) { return; }
      var f = s.kerajaan === false ? CONFIG.PEMBANGKANG : 1, n = Math.round(x[2] * f);
      butiran.push({ nama: x[1] + (f < 1 ? ' (pembangkang)' : ''), jumlah: n }); jumlah += n;
    });
    if (kb && kb.hasGovernmentRole && CONFIG.TAHAP_MENTERI.indexOf(kb.roleLevel) >= 0) { butiran.push({ nama: 'Dana projek kementerian', jumlah: CONFIG.MENTERI }); jumlah += CONFIG.MENTERI; }
    return { jumlah: jumlah, butiran: butiran };
  }
  function aktif(p) { return jumlahBulanan(p).jumlah > 0; }

  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function adaKerusi(p) { var Pr = PR(); return !!(Pr && Pr.semuaStatus && Pr.semuaStatus(p).length); }
  function kunciBulan(p) { return p.tahun + '-' + p.bulan; }

  function ringkasan(p) {
    var k = getKawasan(p), j = jumlahBulanan(p), ap = Number(p && p.ap) || 0, kini = idx(p), kerusi = adaKerusi(p);
    return { aktif: j.jumlah > 0, kerusi: kerusi, bulanan: j.jumlah, butiran: j.butiran, baki: k.baki,
      keluhan: k.keluhan.map(function (x) {
        var d = cariKeluhan(x.kod), umur = Math.max(0, kini - x.idx), sebabP = k.baki < d.kos ? 'Baki peruntukan tidak mencukupi (perlu ' + rm(d.kos) + ').' : ap < KELUHAN_CFG.AP ? 'AP tidak mencukupi.' : '';
        return { id: x.id, kod: d.kod, ikon: d.ikon, tajuk: d.tajuk, penerangan: d.penerangan, kos: d.kos, umur: umur, baki: Math.max(0, KELUHAN_CFG.LUPUT.bulan - umur), bolehSelesai: !sebabP, sebabSelesai: sebabP, bolehUsul: ap >= KELUHAN_CFG.AP };
      }),
      aktiviti: AKTIVITI.map(function (x) {
        var sebab = k.aktivitiAkhir === kunciBulan(p) ? 'Aktiviti rakyat sudah dibuat bulan ini.' : k.baki < x.kos ? 'Baki peruntukan tidak mencukupi (perlu ' + rm(x.kos) + ').' : ap < AKTIVITI_AP ? 'AP tidak mencukupi.' : '';
        return Object.assign({}, x, { boleh: !sebab, sebab: sebab });
      }), apAktiviti: AKTIVITI_AP, apKeluhan: KELUHAN_CFG.AP };
  }

  function sedia() {
    var Sv = S(), p = Sv && Sv.loadPlayer(); if (!p || p.tamat) { return { ralat: 'Tiada profil pemain.' }; }
    if (!aktif(p)) { return { ralat: 'Anda tidak mempunyai peruntukan kawasan.' }; }
    return { Sv: Sv, p: p, k: getKawasan(p) };
  }
  function cariK(k, id) { return k.keluhan.filter(function (x) { return x.id === id; })[0] || null; }
  function buang(k, id) { k.keluhan = k.keluhan.filter(function (x) { return x.id !== id; }); }
  function catat(k, p, jenis, kod) { k.sejarah = k.sejarah.concat([{ jenis: jenis, kod: kod, tahun: p.tahun, bulan: p.bulan }]).slice(-10); }

  /** Selesaikan keluhan dengan Peruntukan Kawasan. */
  function selesaikan(id) {
    var c = sedia(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var x = cariK(c.k, id), d = x && cariKeluhan(x.kod); if (!d) { return { ok: false, ralat: 'Keluhan tidak ditemui.' }; }
    if (c.k.baki < d.kos) { return { ok: false, ralat: 'Baki peruntukan tidak mencukupi (perlu ' + rm(d.kos) + ').' }; }
    if ((Number(c.p.ap) || 0) < KELUHAN_CFG.AP) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
    c.k.baki -= d.kos; buang(c.k, id); catat(c.k, c.p, 'selesai', d.kod);
    var r = c.Sv.applyEffects({ ap: -KELUHAN_CFG.AP, ip: KELUHAN_CFG.SELESAI.ip, kesetiaan: { akarUmbi: KELUHAN_CFG.SELESAI.akarUmbi } }, { kiraTindakan: false, patch: { kawasan: c.k }, log: { tindakan: 'kawasan_selesai', nama: 'Keluhan diselesaikan: ' + d.tajuk, peringkat: 'ahli' } });
    return r.ok ? { ok: true, mesej: d.tajuk + ' diselesaikan: -' + rm(d.kos) + ' peruntukan, +' + KELUHAN_CFG.SELESAI.ip + ' IP, +' + KELUHAN_CFG.SELESAI.akarUmbi + ' sokongan akar umbi.' } : { ok: false, ralat: r.ralat || 'Gagal.' };
  }
  /** Bawa sebagai usul: isu dicatat di papan Isu Tempatan (agenda Usul Lokaliti). */
  function usul(id) {
    var c = sedia(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var x = cariK(c.k, id), d = x && cariKeluhan(x.kod); if (!d) { return { ok: false, ralat: 'Keluhan tidak ditemui.' }; }
    if ((Number(c.p.ap) || 0) < KELUHAN_CFG.AP) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
    var isu = Array.isArray(c.p.isu) ? c.p.isu.slice() : [], ada = isu.some(function (i) { return i && i.kod === d.kod && !i.selesai; });
    if (!ada) { isu.push({ id: d.kod + '-' + c.p.tahun + '-' + c.p.bulan, kod: d.kod, tajuk: d.tajuk, penerangan: d.penerangan, tahap: d.tahap, lokasi: c.p.cawangan, dicatat: new Date().toISOString(), selesai: false, sumber: 'keluhan' }); }
    buang(c.k, id); catat(c.k, c.p, 'usul', d.kod);
    var r = c.Sv.applyEffects({ ap: -KELUHAN_CFG.AP }, { kiraTindakan: false, patch: { kawasan: c.k, isu: isu }, log: { tindakan: 'kawasan_usul', nama: 'Keluhan dibawa sebagai usul: ' + d.tajuk, peringkat: 'ahli' } });
    return r.ok ? { ok: true, mesej: d.tajuk + ' dicatat di papan Isu Tempatan dan akan dibawa sebagai usul di mesyuarat.' } : { ok: false, ralat: r.ralat || 'Gagal.' };
  }
  function abai(id) {
    var c = sedia(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var x = cariK(c.k, id), d = x && cariKeluhan(x.kod); if (!d) { return { ok: false, ralat: 'Keluhan tidak ditemui.' }; }
    buang(c.k, id); catat(c.k, c.p, 'abai', d.kod);
    var r = c.Sv.applyEffects({ kesetiaan: { akarUmbi: KELUHAN_CFG.ABAI.akarUmbi } }, { kiraTindakan: false, patch: { kawasan: c.k }, log: { tindakan: 'kawasan_abai', nama: 'Keluhan diabaikan: ' + d.tajuk, peringkat: 'ahli' } });
    return r.ok ? { ok: true, mesej: d.tajuk + ' diabaikan. Sokongan akar umbi ' + KELUHAN_CFG.ABAI.akarUmbi + '.' } : { ok: false, ralat: r.ralat || 'Gagal.' };
  }
  /** Aktiviti rakyat: sekali sebulan. */
  function aktivitiRakyat(id) {
    var c = sedia(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var a = AKTIVITI.filter(function (y) { return y.id === id; })[0]; if (!a) { return { ok: false, ralat: 'Aktiviti tidak sah.' }; }
    if (c.k.aktivitiAkhir === kunciBulan(c.p)) { return { ok: false, ralat: 'Aktiviti rakyat sudah dibuat bulan ini.' }; }
    if (c.k.baki < a.kos) { return { ok: false, ralat: 'Baki peruntukan tidak mencukupi (perlu ' + rm(a.kos) + ').' }; }
    if ((Number(c.p.ap) || 0) < AKTIVITI_AP) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
    c.k.baki -= a.kos; c.k.aktivitiAkhir = kunciBulan(c.p); if (a.kurang) { c.k.kurang += a.kurang; } catat(c.k, c.p, 'aktiviti', a.id);
    var ks = { ap: -AKTIVITI_AP, ip: a.ip, kesetiaan: {} }; if (a.akarUmbi) { ks.kesetiaan.akarUmbi = a.akarUmbi; } if (a.penentang) { ks.kesetiaan.penentang = a.penentang; } if (a.reputasi) { ks.reputasi = a.reputasi; }
    var r = c.Sv.applyEffects(ks, { kiraTindakan: false, patch: { kawasan: c.k }, log: { tindakan: 'kawasan_aktiviti', nama: 'Aktiviti rakyat: ' + a.nama, peringkat: 'ahli' } });
    return r.ok ? { ok: true, mesej: a.nama + ': -' + rm(a.kos) + ' peruntukan, +' + a.ip + ' IP' + (a.akarUmbi ? ', +' + a.akarUmbi + ' sokongan akar umbi.' : '.') } : { ok: false, ralat: r.ralat || 'Gagal.' };
  }

  /** Bulanan: tambah peruntukan (hangus Januari), keluhan baharu, keluhan luput. Sekali sebulan. */
  function prosesBulan(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat) { return { peristiwa: ev }; }
    var k = getKawasan(p), kunci = kunciBulan(p);
    if (k.akhir === kunci) { return { peristiwa: ev }; }
    var j = jumlahBulanan(p), kes = {}, kini = idx(p);
    if (Number(p.bulan) === 1 && k.tahun !== p.tahun) { k.baki = 0; }
    k.tahun = p.tahun; k.akhir = kunci; k.baki += j.jumlah;
    if (!adaKerusi(p)) { k.keluhan = []; }
    else {
      var luput = k.keluhan.filter(function (x) { return kini - x.idx >= KELUHAN_CFG.LUPUT.bulan; });
      if (luput.length) {
        k.keluhan = k.keluhan.filter(function (x) { return luput.indexOf(x) < 0; });
        kes.kesetiaan = { akarUmbi: KELUHAN_CFG.LUPUT.akarUmbi * luput.length }; kes.reputasi = KELUHAN_CFG.LUPUT.reputasi * luput.length;
        ev.push({ jenis: 'kawasan_luput', mesej: luput.length + ' keluhan rakyat tidak dijawab 3 bulan dan diabaikan. Sokongan akar umbi ' + (KELUHAN_CFG.LUPUT.akarUmbi * luput.length) + ', Reputasi ' + (KELUHAN_CFG.LUPUT.reputasi * luput.length) + '.' });
      }
      var rg = (o && o.rng) || Sv.rngBerbenih(String(p.id) + '|keluhan|' + kunci), n = Math.max(0, (rg() < 0.5 ? 1 : 2) - k.kurang);
      k.kurang = 0; n = Math.min(n, KELUHAN_CFG.MAKS - k.keluhan.length);
      var ada = {}; k.keluhan.forEach(function (x) { ada[x.kod] = true; });
      for (var i = 0; i < n; i++) {
        var kolam = KELUHAN.filter(function (d) { return !ada[d.kod]; }); if (!kolam.length) { break; }
        var d = kolam[Math.floor(rg() * kolam.length)]; ada[d.kod] = true;
        k.keluhan.push({ id: d.kod + '-' + kunci, kod: d.kod, idx: kini });
      }
      if (n > 0) { ev.push({ jenis: 'kawasan_keluhan', mesej: 'Rakyat membawa keluhan baharu. Semak kad Keluhan Rakyat di tab Tindakan.' }); }
    }
    var r = Sv.applyEffects(kes, { kiraTindakan: false, tanpaKesukaran: true, patch: { kawasan: k } });
    if (r.ok && j.jumlah) { ev.push({ jenis: 'kawasan_bulanan', mesej: 'Peruntukan Kawasan bulan ini: +' + rm(j.jumlah) + ' (baki ' + rm(k.baki) + ').' }); }
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, KELUHAN: KELUHAN, KELUHAN_CFG: KELUHAN_CFG, AKTIVITI: AKTIVITI, getKawasan: getKawasan, jumlahBulanan: jumlahBulanan, ringkasan: ringkasan, selesaikan: selesaikan, usul: usul, abai: abai, aktiviti: aktivitiRakyat, prosesBulan: prosesBulan };
});
