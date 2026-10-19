/* ==========================================================================
   Nusa Politik — js/kerjaya.js   (v8.12)
   Latar Belakang Profesional (careerBackground) dan pendapatan bulanan.

   - Elaun parti bulanan DIHAPUSKAN. Jawatan parti kini menuntut kos operasi bulanan (RM), bukan gaji.
   - Pemain mempunyai pendapatan kerjaya tetap (dipilih semasa Permainan Baharu, dikunci).
   - Pendapatan rasmi hanya apabila pemain ADUN, Ahli Parlimen (MP), atau EXCO / Menteri (elaun kabinet di js/kabinet.js).
   - Wakil rakyat (MP, ADUN) dan EXCO: pendapatan kerjaya 50%. Menteri Besar, Timbalan Menteri, Menteri, TPM, PM: 0%.
   - Peniaga / Kontraktor yang memegang jawatan kerajaan menambah Risiko Konflik Kepentingan (js/sampingan.js).

   ANDAIAN: semua angka ialah penyeimbang simulasi, bukan data gaji sebenar.

   API (window.MyPolitikKerjaya):
     KERJAYA, CONFIG
     latarBelakang(p)       kod kerjaya yang sah (simpanan lama = 'korporat')
     faktorKerjaya(p)       1, 0.5 atau 0
     pendapatan(p)          { jumlah, butiran:[{ nama, jumlah }] }  (jumlah boleh negatif; peminta menghadkan kepada dana)
     konflikBulanan(p)      tambahan Risiko Konflik Kepentingan sebulan (Peniaga + jawatan kerajaan), selain itu 0
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikKerjaya = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  function PR() { return modul('MyPolitikPRU', 'pru.js'); }

  var KERJAYA = {
    korporat: { nama: 'Profesional / Korporat', ikon: '💼', gaji: 900, huraian: 'Gaji tetap dan stabil. Tiada risiko konflik kepentingan.' },
    peniaga:  { nama: 'Peniaga / Kontraktor', ikon: '🏗️', gaji: 750, huraian: 'Pendapatan lebih rendah. Kontrak kerajaan menaikkan Risiko Konflik Kepentingan jika anda memegang jawatan kerajaan.' },
    peguam:   { nama: 'Pengamal Undang-undang', ikon: '⚖️', gaji: 850, huraian: 'Pendapatan baik. Dihentikan apabila anda menjadi Menteri.' }
  };
  var CONFIG = {
    LALAI: 'korporat',
    KOS_OPERASI: { cawangan: 100, bahagian: 250, pusat: 600 },      // sebulan; peringkat tertinggi yang dipegang
    GAJI_RASMI: { ADUN: 1000, MP: 1800 },                           // elaun wakil rakyat sebulan (EXCO / Menteri: elaun kabinet di kabinet.js)
    FAKTOR_WAKIL: 0.5,                                              // MP, ADUN, EXCO Negeri
    TAHAP_PENUH_MASA: ['MENTERI_BESAR', 'TIMBALAN_MENTERI', 'MENTERI_PENUH', 'TIMBALAN_PM', 'PERDANA_MENTERI'],
    KONFLIK_KONTRAKTOR: 3                                           // tambahan Risiko Konflik Kepentingan sebulan (susut asas 1 sebulan)
  };

  function latarBelakang(p) { var k = p && p.careerBackground; return KERJAYA[k] ? k : CONFIG.LALAI; }

  function peranan(p) {
    var K = KB(), kb = K && K.getKabinet ? K.getKabinet(p) : null, Pr = PR();
    return {
      kerajaan: !!(kb && kb.hasGovernmentRole), tahap: kb ? kb.roleLevel : 'NONE',
      adun: !!(Pr && Pr.pegang && Pr.pegang(p, 'ADUN')), mp: !!(Pr && Pr.pegang && Pr.pegang(p, 'MP'))
    };
  }

  function faktorKerjaya(p) {
    var r = peranan(p);
    if (r.kerajaan && CONFIG.TAHAP_PENUH_MASA.indexOf(r.tahap) >= 0) { return 0; }
    if (r.mp || r.adun || (r.kerajaan && r.tahap === 'EXCO_NEGERI')) { return CONFIG.FAKTOR_WAKIL; }
    return 1;
  }

  /** Peringkat tertinggi jawatan parti yang dipegang ('cawangan' | 'bahagian' | 'pusat' | null). */
  function peringkatTertinggi(p) {
    var K = root.MyPolitikCalendar || modul('MyPolitikCalendar', 'calendar.js'), senarai = K && K.peringkatDipegang ? K.peringkatDipegang(p) : [];
    return ['pusat', 'bahagian', 'cawangan'].filter(function (x) { return senarai.indexOf(x) >= 0; })[0] || null;
  }

  function pendapatan(p) {
    var kj = KERJAYA[latarBelakang(p)], f = faktorKerjaya(p), butiran = [], r = peranan(p), per = peringkatTertinggi(p);
    var gaji = Math.round(kj.gaji * f);
    butiran.push({ nama: 'Pendapatan kerjaya (' + kj.nama + (f === 0 ? ', dihentikan' : f < 1 ? ', 50%' : '') + ')', jumlah: gaji });
    if (r.adun) { butiran.push({ nama: 'Elaun ADUN', jumlah: CONFIG.GAJI_RASMI.ADUN }); }
    if (r.mp) { butiran.push({ nama: 'Elaun Ahli Parlimen', jumlah: CONFIG.GAJI_RASMI.MP }); }
    if (per) { butiran.push({ nama: 'Kos operasi jawatan ' + per, jumlah: -CONFIG.KOS_OPERASI[per] }); }
    return { jumlah: butiran.reduce(function (a, b) { return a + b.jumlah; }, 0), butiran: butiran };
  }

  function konflikBulanan(p) {
    return latarBelakang(p) === 'peniaga' && peranan(p).kerajaan ? CONFIG.KONFLIK_KONTRAKTOR : 0;
  }

  return { KERJAYA: KERJAYA, CONFIG: CONFIG, latarBelakang: latarBelakang, faktorKerjaya: faktorKerjaya, pendapatan: pendapatan, konflikBulanan: konflikBulanan };
});
