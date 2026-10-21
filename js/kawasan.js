/* ==========================================================================
   Nusa Politik — js/kawasan.js   (v8.18)
   Peruntukan Kawasan: dana khas bulanan untuk ADUN, Ahli Parlimen dan Menteri.
     - Berasingan daripada Dana peribadi (p.myr). Hanya boleh dibelanjakan untuk projek kawasan.
     - Kerusi pembangkang menerima 40% sahaja (selaras soalan Dewan tentang peruntukan kawasan pembangkang).
     - Menteri / Timbalan Menteri / TPM / PM: tambahan dana projek kementerian (tidak dipengaruhi faktor pembangkang).
     - Baki yang tidak dibelanjakan hangus setiap Januari.
   State: p.kawasan = { baki, akhir, tahun, sejarah }
   ANDAIAN: semua angka ialah penyeimbang simulasi, bukan peruntukan sebenar. Projek ialah tiga pilihan tetap.
   API: CONFIG, PROJEK, jumlahBulanan(p), ringkasan(p), projek(id), prosesBulan(o)
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
  var PROJEK = [
    { id: 'jalan', ikon: '🛣️', nama: 'Baik pulih jalan kampung', kos: 800, ip: 25, akarUmbi: 3 },
    { id: 'banjir', ikon: '🌊', nama: 'Bantuan mangsa banjir', kos: 500, ip: 15, akarUmbi: 2 },
    { id: 'surau', ikon: '🕌', nama: 'Naik taraf surau / balai raya', kos: 1000, ip: 30, akarUmbi: 4 }
  ];

  function dasar() { return { baki: 0, akhir: '', tahun: 0, sejarah: [] }; }
  function getKawasan(p) {
    var k = p && p.kawasan && typeof p.kawasan === 'object' ? p.kawasan : {}, o = dasar();
    o.baki = Math.max(0, Math.round(Number(k.baki) || 0)); o.akhir = String(k.akhir || ''); o.tahun = Number(k.tahun) || 0;
    o.sejarah = Array.isArray(k.sejarah) ? k.sejarah.slice(-10) : [];
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

  function ringkasan(p) {
    var k = getKawasan(p), j = jumlahBulanan(p), ap = Number(p && p.ap) || 0;
    return { aktif: j.jumlah > 0, bulanan: j.jumlah, butiran: j.butiran, baki: k.baki, ap: CONFIG.AP,
      projek: PROJEK.map(function (x) {
        var sebab = k.baki < x.kos ? 'Baki peruntukan tidak mencukupi (perlu ' + rm(x.kos) + ').' : ap < CONFIG.AP ? 'AP tidak mencukupi.' : '';
        return Object.assign({}, x, { boleh: !sebab, sebab: sebab });
      }) };
  }

  function projek(id) {
    var Sv = S(), p = Sv && Sv.loadPlayer(); if (!p || p.tamat) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var x = PROJEK.filter(function (y) { return y.id === id; })[0]; if (!x) { return { ok: false, ralat: 'Projek tidak sah.' }; }
    if (!aktif(p)) { return { ok: false, ralat: 'Anda tidak mempunyai peruntukan kawasan.' }; }
    var k = getKawasan(p);
    if (k.baki < x.kos) { return { ok: false, ralat: 'Baki peruntukan tidak mencukupi (perlu ' + rm(x.kos) + ').' }; }
    if ((Number(p.ap) || 0) < CONFIG.AP) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
    k.baki -= x.kos;
    var m = x.nama + ': -' + rm(x.kos) + ' peruntukan, +' + x.ip + ' IP, +' + x.akarUmbi + ' sokongan akar umbi.';
    k.sejarah = k.sejarah.concat([{ id: x.id, tahun: p.tahun, bulan: p.bulan }]).slice(-10);
    var r = Sv.applyEffects({ ap: -CONFIG.AP, ip: x.ip, kesetiaan: { akarUmbi: x.akarUmbi } }, { kiraTindakan: false, patch: { kawasan: k }, log: { tindakan: 'kawasan_projek', nama: 'Projek kawasan: ' + x.nama, peringkat: 'ahli' } });
    return r.ok ? { ok: true, mesej: m } : { ok: false, ralat: r.ralat || 'Gagal.' };
  }

  /** Bulanan: tambah peruntukan; baki hangus setiap Januari. Sekali sebulan. */
  function prosesBulan() {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat) { return { peristiwa: ev }; }
    var k = getKawasan(p), kunci = p.tahun + '-' + p.bulan;
    if (k.akhir === kunci) { return { peristiwa: ev }; }
    var j = jumlahBulanan(p);
    if (Number(p.bulan) === 1 && k.tahun !== p.tahun) { k.baki = 0; }
    k.tahun = p.tahun; k.akhir = kunci; k.baki += j.jumlah;
    var r = Sv.applyEffects({}, { kiraTindakan: false, tanpaKesukaran: true, patch: { kawasan: k } });
    if (r.ok && j.jumlah) { ev.push({ jenis: 'kawasan_bulanan', mesej: 'Peruntukan Kawasan bulan ini: +' + rm(j.jumlah) + ' (baki ' + rm(k.baki) + ').' }); }
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, PROJEK: PROJEK, getKawasan: getKawasan, jumlahBulanan: jumlahBulanan, ringkasan: ringkasan, projek: projek, prosesBulan: prosesBulan };
});
