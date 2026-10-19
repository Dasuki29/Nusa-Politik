/* ==========================================================================
   Nusa Politik — js/sampingan.js   (v7.64)
   Aktiviti Sampingan: pemain melabur modal dalam Syarikat Kecil atau NGO Komuniti untuk pendapatan sampingan.
     - Syarikat Kecil : pulangan bulanan lebih tinggi (selepas tempoh matang), tetapi menaikkan Risiko Konflik Kepentingan
                        (lebih tinggi jika memegang jawatan kerajaan) dan boleh rugi pada bulan tertentu.
     - NGO Komuniti   : pulangan kecil, tetapi membina Reputasi Komuniti, Modal Sosial dan sokongan akar umbi.
   Satu pelaburan sebulan (2 AP). Jumlah modal aktif dihadkan (HAD_MODAL). Kos pelaburan ditolak daripada Dana (p.myr).
   State: p.sampingan = { pelaburan:[{ jenis, modal, idx }], pendapatan, konflik, komuniti, terakhir, jumlah, sejarah }
   Disambung ke: Integriti (skor, risiko tadbir urus), Etika (modal sosial), Kabinet (jawatan kerajaan).
   ANDAIAN: semua angka (modal, hasil, tempoh matang, risiko) ialah penyeimbang simulasi, bukan data perniagaan sebenar.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikSampingan = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function ET() { return modul('MyPolitikEtika', 'etika.js'); }
  function IG() { return modul('MyPolitikIntegriti', 'integriti.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  var rngLalai = null;
  function rng(o, p) { return (o && o.rng) || rngLalai || S().rngBerbenih(String(p && p.id) + '|' + (p && p.tahun) + '|' + (p && p.bulan) + '|sampingan'); }

  var CONFIG = {
    AP: 2, HAD_MODAL: 20000, MATANG: 3,                                   // bulan sebelum pulangan bermula
    JENIS: {
      syarikat: { nama: 'Syarikat Kecil (perniagaan)', ikon: '🏪', hasil: 0.035, ketidaktentuan: 0.4, peluangRugi: 0.08, konflik: 1.5, konflikKerajaan: 2.5,
                  huraian: 'Dana masuk setiap bulan selepas modal matang. Risiko Integriti jika memegang jawatan kerajaan.',
                  peringkat: { asas: { nama: 'Modal Asas', modal: 5000 }, sederhana: { nama: 'Modal Sederhana', modal: 15000 } } },
      ngo:      { nama: 'NGO Komuniti', ikon: '🤝', hasil: 0.015, ketidaktentuan: 0, peluangRugi: 0, komuniti: 4, akarUmbi: 1,
                  huraian: 'Kurang untung, tetapi membina Reputasi Komuniti dan Modal Sosial serta sokongan akar umbi.',
                  peringkat: { asas: { nama: 'Asas', modal: 2000 }, besar: { nama: 'Besar', modal: 6000 } } }
    },
    KONFLIK: { awal: 10, susut: 1, ambang: 70, selepasKes: 40, kesanSkor: -4, kesanRisiko: 8, kesanReputasi: -2 },
    KOMUNITI: { awal: 20, susut: 1, tinggi: 60, bonusReputasi: 1 },
    RUGI: 0.10                                                              // pecahan modal syarikat yang hilang pada bulan rugi
  };

  function dasar0() { return { pelaburan: [], pendapatan: 0, konflik: CONFIG.KONFLIK.awal, komuniti: CONFIG.KOMUNITI.awal, terakhir: -999, jumlah: 0, sejarah: [] }; }
  function getSampingan(p) {
    var b = dasar0(), d = p && p.sampingan && typeof p.sampingan === 'object' ? p.sampingan : {};
    for (var f in b) { if (d[f] === undefined) { d[f] = b[f]; } }
    if (!Array.isArray(d.pelaburan)) { d.pelaburan = []; }
    return d;
  }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function rekod(d, p, mesej) { d.sejarah = (d.sejarah || []).concat([{ mesej: mesej, tahun: p.tahun, bulan: p.bulan }]).slice(-10); }
  function simpan(d, kesan, opts) {
    opts = opts || {};
    var patch = { sampingan: d };
    if (opts.patch) { for (var f in opts.patch) { patch[f] = opts.patch[f]; } }
    return S().applyEffects(kesan || {}, { kiraTindakan: false, patch: patch, log: opts.log });
  }
  function pegangKerajaan(p) { var K = KB(); return !!(K && K.getKabinet(p).hasGovernmentRole); }
  function aktif(p) {
    if (!p || p.tamat) { return false; }
    var E = ET(); if (E && E.getEtika(p).status === 'dipecat') { return false; }
    return true;
  }
  function modalAktif(d) { return d.pelaburan.reduce(function (s, x) { return s + x.modal; }, 0); }
  function pendapatanBulanan(d, p) {
    var now = idx(p);
    return Math.round(d.pelaburan.reduce(function (s, x) { return s + (now - x.idx >= CONFIG.MATANG ? x.modal * CONFIG.JENIS[x.jenis].hasil : 0); }, 0));
  }

  function boleh(p, jenis, aras) {
    var j = CONFIG.JENIS[jenis], a = j && j.peringkat[aras], d = getSampingan(p);
    if (!j || !a) { return { boleh: false, sebab: 'Aktiviti tidak sah.' }; }
    if (!aktif(p)) { return { boleh: false, sebab: 'Tidak tersedia.' }; }
    if (d.terakhir === idx(p)) { return { boleh: false, sebab: 'Satu aktiviti sebulan sudah digunakan.' }; }
    if (modalAktif(d) + a.modal > CONFIG.HAD_MODAL) { return { boleh: false, sebab: 'Melebihi had modal RM ' + CONFIG.HAD_MODAL.toLocaleString('ms-MY') + '.' }; }
    if ((Number(p.ap) || 0) < CONFIG.AP) { return { boleh: false, sebab: 'AP tidak mencukupi (perlu ' + CONFIG.AP + ').' }; }
    if ((Number(p.myr) || 0) < a.modal) { return { boleh: false, sebab: 'Dana tidak mencukupi (RM ' + a.modal.toLocaleString('ms-MY') + ').' }; }
    return { boleh: true, sebab: '' };
  }
  function laburkan(jenis, aras) {
    var p = S().loadPlayer(), b = boleh(p, jenis, aras);
    if (!b.boleh) { return { ok: false, ralat: b.sebab }; }
    var j = CONFIG.JENIS[jenis], a = j.peringkat[aras], d = getSampingan(p);
    d.pelaburan.push({ jenis: jenis, modal: a.modal, idx: idx(p) }); d.terakhir = idx(p);
    rekod(d, p, j.nama + ': ' + a.nama);
    var res = simpan(d, { myr: -a.modal, ap: -CONFIG.AP }, { log: { tindakan: 'sampingan_labur', nama: 'Aktiviti Sampingan: ' + j.nama + ' (' + a.nama + ')', peringkat: 'ahli' } });
    return res.ok ? { ok: true, mesej: j.nama + ': modal RM ' + a.modal.toLocaleString('ms-MY') + ' dilaburkan. Pulangan bermula selepas ' + CONFIG.MATANG + ' bulan.' } : { ok: false, ralat: res.ralat };
  }

  function prosesBulan(o) {
    var ev = [], p = S() && S().loadPlayer();
    if (!p || p.tamat || !aktif(p)) { return { peristiwa: ev }; }
    var d = getSampingan(p);
    if (!d.pelaburan.length && d.konflik <= CONFIG.KONFLIK.awal && d.komuniti <= CONFIG.KOMUNITI.awal) { return { peristiwa: ev }; }
    var r = rng(o, p), now = idx(p), kes = { myr: 0 }, patch = null, kerajaan = pegangKerajaan(p), kc = CONFIG.KONFLIK, ngoAda = false, akarUmbi = 0, untung = 0, rugiMsg = '';
    d.pelaburan.forEach(function (x) {
      var j = CONFIG.JENIS[x.jenis], matang = now - x.idx >= CONFIG.MATANG;
      if (x.jenis === 'syarikat') {
        d.konflik = clamp(d.konflik + (x.modal / 5000) * (kerajaan ? j.konflikKerajaan : j.konflik) * 0.5, 0, 100);
        if (matang) {
          if (r() < j.peluangRugi) { var rugi = Math.round(x.modal * CONFIG.RUGI); kes.myr -= rugi; rugiMsg = 'Syarikat sampingan anda rugi RM ' + rugi.toLocaleString('ms-MY') + ' bulan ini.'; }
          else { untung += x.modal * j.hasil * (1 - j.ketidaktentuan / 2 + r() * j.ketidaktentuan); }
        }
      } else if (matang) { untung += x.modal * j.hasil; }
      if (x.jenis === 'ngo') { ngoAda = true; akarUmbi += j.akarUmbi * (x.modal / 2000) * 0.5; d.komuniti = clamp(d.komuniti + j.komuniti * (x.modal / 2000) * 0.5, 0, 100); }
    });
    untung = Math.round(untung); kes.myr += untung; d.pendapatan = untung;
    if (ngoAda) { akarUmbi = clamp(Math.round(akarUmbi), 1, 2); kes.kesetiaan = { akarUmbi: akarUmbi }; var E = ET(); if (E) { var e = E.getEtika(p); e.modal = clamp(e.modal + 1, 0, E.CONFIG.KEMASAN_MODAL_MAKS); patch = { etika: e }; } if (d.komuniti >= CONFIG.KOMUNITI.tinggi) { kes.reputasi = CONFIG.KOMUNITI.bonusReputasi; } }
    d.konflik = clamp(d.konflik - CONFIG.KONFLIK.susut, 0, 100); d.komuniti = clamp(d.komuniti - CONFIG.KOMUNITI.susut, 0, 100);
    if (rugiMsg) { ev.push({ jenis: 'sampingan', mesej: rugiMsg }); }
    var I = IG();
    if (d.konflik >= kc.ambang) {
      d.konflik = kc.selepasKes; rekod(d, p, 'Konflik kepentingan dibangkitkan');
      if (I) { I.ubahSkor(kc.kesanSkor, 'Konflik kepentingan (syarikat sampingan)'); if (kerajaan && I.tambahRisiko) { I.tambahRisiko(kc.kesanRisiko, 'syarikat sampingan berurusan dengan pihak berkaitan'); } }
      kes.reputasi = (kes.reputasi || 0) + kc.kesanReputasi;
      ev.push({ jenis: 'sampingan', mesej: 'Syarikat sampingan anda dipersoalkan kerana konflik kepentingan (Integriti Parti ' + kc.kesanSkor + ', Reputasi ' + kc.kesanReputasi + ').' });
    }
    if (untung > 0 && !rugiMsg) { ev.push({ jenis: 'sampingan', mesej: 'Pendapatan sampingan bulan ini: +RM ' + untung.toLocaleString('ms-MY') + '.' }); }
    simpan(d, kes, { patch: patch });
    return { peristiwa: ev };
  }

  function ringkasan(p) {
    var d = getSampingan(p), now = idx(p);
    return { aktif: aktif(p), pendapatan: pendapatanBulanan(d, p), pendapatanTerakhir: d.pendapatan, konflik: Math.round(d.konflik), komuniti: Math.round(d.komuniti), modalAktif: modalAktif(d), hadModal: CONFIG.HAD_MODAL,
      sudahBulanIni: d.terakhir === now, kerajaan: pegangKerajaan(p), pelaburan: d.pelaburan.map(function (x) { return { jenis: x.jenis, modal: x.modal, baki: Math.max(0, CONFIG.MATANG - (now - x.idx)) }; }),
      jenis: Object.keys(CONFIG.JENIS).map(function (id) {
        var j = CONFIG.JENIS[id];
        return { id: id, nama: j.nama, ikon: j.ikon, huraian: j.huraian, peringkat: Object.keys(j.peringkat).map(function (a) { var b = boleh(p, id, a); return { aras: a, nama: j.peringkat[a].nama, modal: j.peringkat[a].modal, boleh: b.boleh, sebab: b.sebab }; }) };
      }), sejarah: d.sejarah || [] };
  }

  return { CONFIG: CONFIG, setRng: function (f) { rngLalai = f || null; }, getSampingan: getSampingan, aktif: aktif, boleh: boleh, laburkan: laburkan, prosesBulan: prosesBulan, ringkasan: ringkasan };
});
