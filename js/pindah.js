/* ==========================================================================
   Nusa Politik — js/pindah.js   (v8.28)
   Pindah Cawangan: menukar keahlian ke cawangan lain (negeri / Parlimen / DUN / cawangan baharu).
   Beza daripada "Bertanding Kerusi Lain" (v8.17): itu kekal ahli cawangan asal dan menjadi calon luar;
   ini menukar keahlian sebenar, tanpa penalti calon luar, tetapi dengan kos terus dan jawatan setempat hilang.

   Syarat: ahli >= 12 bulan di cawangan semasa; bukan Menteri / EXCO / ADUN / MP; tiada hukuman disiplin;
           tiada pilihan raya berjalan; belum pindah dalam 36 bulan lepas; bukan ke Sarawak (UMNO).
   v9.5: PBB boleh pindah antara Bahagian (DUN) dan Daerah Mengundi di Sarawak sahaja (peraturan lain sama). dunInfo dikemas kini ikut DUN baharu.
   Kos:    RM 2,000, 3 AP, IP -30%.
   Kesan:  jawatan Cawangan & Bahagian (termasuk sayap) hilang; jawatan Pusat kekal. Sokongan mula semula
           (akar umbi 25, AJK 25, ketua cawangan 25, perwakilan 0). Tidak boleh bertanding jawatan parti
           Cawangan / Bahagian selama 12 bulan di kawasan baharu. Tempoh keahlian parti TIDAK mula semula.
           Organisasi NPC, isu tempatan, pencabar dan aduan kawasan dijana semula (benih = id cawangan baharu).
   State:  p.pindah = { terakhir:{tahun,bulan}|null, sejakCawangan:{tahun,bulan}|null, menunggu:{tahun,bulan}|null, bil, sejarah:[...] }
   ANDAIAN: semua angka ialah penyeimbang simulasi; tahap kerusi ialah anggaran deterministik, bukan data sebenar.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikPindah = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  /** v10.0: parti Sarawak (PBB mod penuh; PRS dan lain-lain mod ringan) guna enjin Sarawak yang sama. */
  function SW(k) { return k === 'PBB' || k === 'PRS' || k === 'SUPP'; }

  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function ET() { return modul('MyPolitikEtika', 'etika.js'); }
  function KJ() { return modul('MyPolitikKerjaya', 'kerjaya.js'); }
  function PR() { return modul('MyPolitikPRU', 'pru.js'); }

  var CONFIG = {
    BULAN_MIN: 12,                 // tempoh minimum di cawangan semasa
    JARAK: 36,                     // sekali setiap penggal (36 bulan)
    MENUNGGU: 12,                  // tempoh menunggu sebelum boleh bertanding jawatan Cawangan / Bahagian di kawasan baharu
    KOS_MYR: 2000, KOS_AP: 3, IP_POTONG: 0.3,
    SOKONGAN: { akarUmbi: 25, ajk: 25, ketuaCawangan: 25, perwakilan: 0 },
    NEGERI_TERLARANG: ['sarawak']  // UMNO tiada cawangan di Sarawak
  };

  function mutlak(t, b) { return (Number(t) || 0) * 12 + (Number(b) || 1); }
  function nm(x) { return String(x || '').toLowerCase().replace(/[^a-z]/g, ''); }
  function salin(o) { return JSON.parse(JSON.stringify(o)); }

  function getPindah(p) {
    var x = p && p.pindah && typeof p.pindah === 'object' ? p.pindah : {};
    return {
      terakhir: x.terakhir || null, sejakCawangan: x.sejakCawangan || null, menunggu: x.menunggu || null,
      bil: Number(x.bil) || 0, sejarah: Array.isArray(x.sejarah) ? x.sejarah : []
    };
  }

  /** Bulan di cawangan semasa (dikira daripada pindahan terakhir, jika tiada daripada tarikh menjadi ahli). */
  function bulanDiCawangan(p) {
    var g = getPindah(p), mula = g.sejakCawangan || (p && p.keahlian ? { tahun: p.keahlian.sejakTahun, bulan: p.keahlian.sejakBulan } : null);
    if (!mula) { return 9999; }
    return Math.max(0, mutlak(p.tahun, p.bulan) - mutlak(mula.tahun, mula.bulan));
  }

  /** Bulan menunggu yang tinggal sebelum boleh bertanding jawatan Cawangan / Bahagian (0 = tiada sekatan). */
  function bakiMenunggu(p) {
    var g = getPindah(p); if (!g.menunggu) { return 0; }
    return Math.max(0, mutlak(g.menunggu.tahun, g.menunggu.bulan) - mutlak(p.tahun, p.bulan));
  }

  function pilihanRayaBerjalan(p) {
    var Pr = PR(); if (!Pr || !Pr.getPRU) { return false; }
    try { var pru = Pr.getPRU(p); return !!(pru && pru.aktif); } catch (e) { return false; }
  }
  function pegangKerusi(p) {
    var Pr = PR(); if (!Pr || !Pr.pegang) { return false; }
    try { return !!(Pr.pegang(p, 'ADUN') || Pr.pegang(p, 'MP')); } catch (e) { return false; }
  }
  function faktor(p) { var K = KJ(); try { return K && K.faktorKerjaya ? K.faktorKerjaya(p) : 1; } catch (e) { return 1; } }

  /**
   * Semak syarat. Pulang { boleh, syarat:[{id,teks,lulus,nota}], sebab:[...] }.
   */
  function semak(p) {
    var syarat = [], Et = ET(), g = getPindah(p);
    var bulan = bulanDiCawangan(p);
    syarat.push({ id: 'tempoh', teks: 'Ahli sekurang-kurangnya ' + CONFIG.BULAN_MIN + ' bulan di cawangan semasa', lulus: bulan >= CONFIG.BULAN_MIN, nota: bulan >= 9999 ? '' : Math.floor(bulan / 12) + ' tahun ' + (bulan % 12) + ' bulan' });
    var f = faktor(p), kerusi = pegangKerusi(p);
    syarat.push({ id: 'jawatan', teks: p && SW(p.parti) ? 'Bukan Menteri / Menteri Negeri dan tiada kerusi ADUN / MP' : 'Bukan Menteri / EXCO dan tiada kerusi ADUN / MP', lulus: f >= 1 && !kerusi, nota: '' });
    var e = Et && Et.getEtika ? Et.getEtika(p) : null;
    var hukum = !!(e && (e.status === 'digantung' || e.status === 'dilarang' || e.status === 'dipecat' || e.hukuman));
    syarat.push({ id: 'disiplin', teks: 'Tiada hukuman disiplin', lulus: !hukum, nota: '' });
    syarat.push({ id: 'pilihan', teks: 'Tiada pilihan raya sedang berjalan', lulus: !pilihanRayaBerjalan(p), nota: '' });
    var jarak = g.terakhir ? mutlak(p.tahun, p.bulan) - mutlak(g.terakhir.tahun, g.terakhir.bulan) : 9999;
    syarat.push({ id: 'had', teks: 'Sekali setiap penggal (3 tahun)', lulus: jarak >= CONFIG.JARAK, nota: g.terakhir ? (jarak >= CONFIG.JARAK ? '' : 'Boleh lagi dalam ' + (CONFIG.JARAK - jarak) + ' bulan') : '' });
    var kos = { myr: CONFIG.KOS_MYR, ap: CONFIG.KOS_AP };
    syarat.push({ id: 'kos', teks: 'Dana RM ' + kos.myr.toLocaleString('ms-MY') + ' dan ' + kos.ap + ' AP', lulus: Number(p.myr) >= kos.myr && Number(p.ap) >= kos.ap, nota: '' });
    var sebab = syarat.filter(function (x) { return !x.lulus; }).map(function (x) { return x.teks; });
    return { boleh: sebab.length === 0, syarat: syarat, sebab: sebab };
  }

  /** UMNO: Sarawak terlarang. PBB (v9.5): hanya Sarawak dibenarkan. */
  function negeriTerlarang(nama, parti) { var sarawak = CONFIG.NEGERI_TERLARANG.indexOf(nm(nama)) >= 0; return SW(parti) ? !sarawak : sarawak; }

  function ringkasJawatan(p) {
    var J = modul('MyPolitikJawatan', 'jawatan.js'), senarai = J && J.getJawatan ? J.getJawatan(p) : (Array.isArray(p.jawatanList) ? p.jawatanList : []);
    var hilang = [], kekal = [];
    senarai.forEach(function (j) { if (j.peringkat === 'cawangan' || j.peringkat === 'bahagian') { hilang.push(j); } else { kekal.push(j); } });
    return { hilang: hilang, kekal: kekal };
  }

  /** v9.5: PBB: tahap kerusi DUN ikut komposisi etnik (js/sarawak.js); null jika bukan PBB. */
  function tahapPBB(p) { var W9 = p && SW(p.parti) ? modul('MyPolitikSarawak', 'sarawak.js') : null, m = W9 && W9.maklumat ? W9.maklumat(p) : null; return m ? m.tahapNama : null; }
  function tahapAnggaran(bahagianNama) {
    var Pr = PR(); if (!Pr || !Pr.tahapKerusi) { return null; }
    var t = Pr.tahapKerusi({ kod: '', nama: String(bahagianNama || '') });
    return t === 'selamat' ? 'Selamat' : t === 'marginal' ? 'Marginal' : 'Sukar';
  }

  /** Perbandingan sebelum / selepas untuk paparan semakan. c = objek cawangan data.js. */
  function pratonton(p, c, extra) {
    var S_ = S(), ik = S_.identitiKawasan(c), j = ringkasJawatan(p), k = p.kesetiaan || {};
    var ip1 = Math.max(0, Math.round((Number(p.ip) || 0) * (1 - CONFIG.IP_POTONG)));
    return {
      sebelum: { cawangan: p.cawangan, bahagian: p.bahagian, dun: p.dun, negeri: p.negeri, tahap: tahapPBB(p) || tahapAnggaran(p.bahagian), jawatan: j.hilang.map(function (x) { return x.jawatan; }), akarUmbi: Math.round(k.akarUmbi || 0), ajk: Math.round(k.ajk || 0), ip: Math.round(p.ip), myr: Math.round(p.myr), ap: p.ap },
      selepas: { cawangan: ik.cawangan, bahagian: ik.bahagian, dun: ik.dun, negeri: ik.negeri, tahap: (extra && extra.dunInfo && tahapPBB({ parti: 'PBB', dunInfo: extra.dunInfo })) || tahapAnggaran(ik.bahagian), jawatan: [], akarUmbi: CONFIG.SOKONGAN.akarUmbi, ajk: CONFIG.SOKONGAN.ajk, ip: ip1, myr: Math.round(p.myr) - CONFIG.KOS_MYR, ap: p.ap - CONFIG.KOS_AP },
      jawatanKekal: j.kekal.map(function (x) { return x.jawatan; }),
      menunggu: CONFIG.MENUNGGU, sama: ik.id === p.id, terlarang: negeriTerlarang(ik.negeri, p.parti)
    };
  }

  /**
   * Laksanakan pindahan. c = objek cawangan data.js. Pulang { ok, mesej, ralat }.
   * Menulis satu kali melalui applyEffects (kos + patch identiti + reset setempat).
   */
  function pindah(c, extra) {
    var Sv = S(), p = Sv && Sv.loadPlayer();
    if (!p) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var sm = semak(p);
    if (!sm.boleh) { return { ok: false, ralat: 'Syarat belum dipenuhi: ' + sm.sebab.join('; ') + '.' }; }
    var ik = Sv.identitiKawasan(c);
    if (ik.id === p.id) { return { ok: false, ralat: 'Anda sudah menjadi ahli cawangan ini.' }; }
    if (negeriTerlarang(ik.negeri, p.parti)) { return { ok: false, ralat: SW(p.parti) ? 'PBB tiada cawangan di luar Sarawak.' : 'UMNO tiada cawangan di Sarawak.' }; }
    var j = ringkasJawatan(p), g = getPindah(p), tahun = p.tahun, bulan = p.bulan;
    var menunggu = mutlak(tahun, bulan) + CONFIG.MENUNGGU, mt = Math.floor((menunggu - 1) / 12), mb = ((menunggu - 1) % 12) + 1;
    var dari = { cawangan: p.cawangan, bahagian: p.bahagian, negeri: p.negeri };
    var sejarah = g.sejarah.concat([{ tahun: tahun, bulan: bulan, dari: dari.cawangan + ', ' + dari.bahagian, ke: ik.cawangan + ', ' + ik.bahagian }]).slice(-5);
    var perwakilan = Object.assign({}, p.perwakilan || {}, { cawangan: 0, bahagian: 0, sayapCawangan: 0 });
    var kes = Object.assign({}, p.kesetiaan || {}, CONFIG.SOKONGAN);
    var patch = {
      negeri: ik.negeri, bahagian: ik.bahagian, dun: ik.dun, cawangan: ik.cawangan, id: ik.id, kod: ik.kod, cawanganInfo: ik.cawanganInfo,
      dunInfo: SW(p.parti) && extra && extra.dunInfo ? extra.dunInfo : p.dunInfo,
      jawatanList: j.kekal, jawatan: j.kekal.length ? j.kekal.slice().sort(function (a, b) { return (b.pangkat || 0) - (a.pangkat || 0); })[0].jawatan : 'Ahli Biasa',
      perwakilan: perwakilan, kesetiaan: kes,
      ip: Math.max(0, Math.round((Number(p.ip) || 0) * (1 - CONFIG.IP_POTONG))),
      isu: [], kawasan: null, cabaran: null, amaranAktif: false,
      rival: Object.assign({}, p.rival || {}, { senaraiPencabar: {}, amaran: [] }),
      pindah: { terakhir: { tahun: tahun, bulan: bulan }, sejakCawangan: { tahun: tahun, bulan: bulan }, menunggu: { tahun: mt, bulan: mb }, bil: g.bil + 1, sejarah: sejarah }
    };
    var r = Sv.applyEffects({ myr: -CONFIG.KOS_MYR, ap: -CONFIG.KOS_AP }, {
      kiraTindakan: false, pindahan: true, patch: patch,
      log: { tindakan: 'pindah_cawangan', nama: 'Pindah Cawangan: ' + dari.cawangan + ' → ' + ik.cawangan, peringkat: 'keahlian' }
    });
    if (!r || !r.ok) { return { ok: false, ralat: (r && r.ralat) || 'Pindahan gagal disimpan.' }; }
    return { ok: true, mesej: 'Anda kini ahli ' + ik.cawangan + ', ' + ik.bahagian + '.', hilang: j.hilang.length, profil: r.profil };
  }

  /** Sekatan bertanding jawatan parti Cawangan / Bahagian semasa tempoh menunggu. Pulang { terbuka:false, sebab } atau null. */
  function sekatBertanding(p, peringkat) {
    if (peringkat !== 'cawangan' && peringkat !== 'bahagian') { return null; }
    var b = bakiMenunggu(p);
    return b > 0 ? { terbuka: false, sebab: 'Anda baru berpindah cawangan. Tunggu ' + b + ' bulan lagi sebelum boleh bertanding jawatan parti Cawangan atau Bahagian.' } : null;
  }

  function ringkasan(p) {
    var g = getPindah(p);
    return { semak: semak(p), bulanDiCawangan: bulanDiCawangan(p), bakiMenunggu: bakiMenunggu(p), bil: g.bil, sejarah: g.sejarah, terakhir: g.terakhir };
  }

  return {
    CONFIG: CONFIG, getPindah: getPindah, semak: semak, pratonton: pratonton, pindah: pindah, bulanDiCawangan: bulanDiCawangan,
    bakiMenunggu: bakiMenunggu, sekatBertanding: sekatBertanding, ringkasan: ringkasan, negeriTerlarang: negeriTerlarang
  };
});
