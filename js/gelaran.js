/* ==========================================================================
   Nusa Politik — js/gelaran.js   (v7.64)
   Anugerah & Gelaran Kebesaran (fiksyen permainan; kosmetik dengan kesan kecil, TIDAK boleh dibeli).
     1. Anugerah (3 tahap, atas prestasi): Pingat Khidmat Cemerlang, Darjah Setia Nusa, Darjah Kebesaran Nusa.
     2. Gelaran Kurniaan (awalan nama): "Dato'" dan "Tan Sri", dikurniakan secara fiksyen oleh pihak istana selepas
        tempoh berkhidmat pada tahap yang layak dengan rekod bersih.
          Dato'    : jawatan parti pangkat >= 9 (cth. Ketua Sayap Pusat) ATAU Menteri / Menteri Besar / Timbalan PM / PM; 36 bulan layak.
          Tan Sri  : sudah Dato', jawatan parti pangkat >= 10 (Naib Presiden dan ke atas) ATAU Perdana Menteri / Timbalan PM; 36 bulan layak; Integriti >= 70.
     Digantung = gelaran ditahan (tidak dipaparkan) sehingga status pulih; dipecat = gelaran ditarik balik (kekal).
   State: p.gelaran = { bulanDato, bulanTan, dato, tansri, anugerah:{kod:{tahun,bulan}}, ditarik, sejarah }
   ANDAIAN: nama, syarat dan tempoh ialah rekaan permainan; gelaran sebenar dikurniakan oleh Sultan/Yang di-Pertua Negeri, bukan parti atau kerajaan.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikGelaran = api;
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
  function HY() { return modul('MyPolitikHayat', 'hayat.js'); }

  var CONFIG = {
    TAHUN_MULA: 2026, BULAN_LAYAK: 36, REPUTASI: 2,
    PANGKAT_DATO: 9, PANGKAT_TAN: 10, INTEGRITI_TAN: 70,
    KERAJAAN_DATO: ['MENTERI_PENUH', 'MENTERI_BESAR', 'TIMBALAN_PM', 'PERDANA_MENTERI'],
    KERAJAAN_TAN: ['TIMBALAN_PM', 'PERDANA_MENTERI'],
    ANUGERAH: [
      { kod: 'pingat', ikon: '🥉', nama: 'Pingat Khidmat Cemerlang', tahun: 3, integriti: 60, pangkat: 0, bersih: false, syarat: '3 tahun berkhidmat, Integriti ≥ 60' },
      { kod: 'setia',  ikon: '🥈', nama: 'Darjah Setia Nusa',         tahun: 6, integriti: 70, pangkat: 7, bersih: false, syarat: '6 tahun berkhidmat, jawatan Bahagian ke atas, Integriti ≥ 70' },
      { kod: 'kebesaran', ikon: '🥇', nama: 'Darjah Kebesaran Nusa',  tahun: 10, integriti: 80, pangkat: 8, bersih: true, syarat: '10 tahun berkhidmat, jawatan Pusat, Integriti ≥ 80, tiada hukuman disiplin' }
    ]
  };

  function dasar0() { return { bulanDato: 0, bulanTan: 0, dato: null, tansri: null, anugerah: {}, ditarik: false, sejarah: [] }; }
  function getGelaran(p) {
    var b = dasar0(), d = p && p.gelaran && typeof p.gelaran === 'object' ? p.gelaran : {};
    for (var f in b) { if (d[f] === undefined) { d[f] = b[f]; } }
    if (!d.anugerah || typeof d.anugerah !== 'object') { d.anugerah = {}; }
    return d;
  }
  function simpan(d, kesan, opts) {
    opts = opts || {};
    return S().applyEffects(kesan || {}, { kiraTindakan: false, patch: { gelaran: d }, log: opts.log });
  }
  function rekod(d, p, mesej) { d.sejarah = (d.sejarah || []).concat([{ mesej: mesej, tahun: p.tahun, bulan: p.bulan }]).slice(-10); }
  function pangkatSemasa(p) { var H = HY(), t = H && H.jawatanTertinggiSemasa ? H.jawatanTertinggiSemasa(p) : null; return t ? t.pangkat : 0; }
  function tahapKerajaan(p) { var K = KB(), k = K ? K.getKabinet(p) : null; return k && k.hasGovernmentRole ? k.roleLevel : 'NONE'; }
  function statusEtika(p) { var E = ET(); return E ? E.getEtika(p).status : 'baik'; }
  function skorIntegriti(p) { var I = IG(); return I ? I.getIntegriti(p).skor : 70; }
  function tahunBerkhidmat(p) { return Math.max(0, (parseInt(p.tahun, 10) || CONFIG.TAHUN_MULA) - CONFIG.TAHUN_MULA); }
  function bersihRekod(p) { var E = ET(); return !E || (E.getEtika(p).salah || 0) === 0; }

  function layakDato(p) { return pangkatSemasa(p) >= CONFIG.PANGKAT_DATO || CONFIG.KERAJAAN_DATO.indexOf(tahapKerajaan(p)) >= 0; }
  function layakTan(p) { return pangkatSemasa(p) >= CONFIG.PANGKAT_TAN || CONFIG.KERAJAAN_TAN.indexOf(tahapKerajaan(p)) >= 0; }

  /** Awalan nama: "Dato' ", "Tan Sri " atau '' (kosong jika ditahan atau ditarik). */
  function awalan(p) {
    var d = getGelaran(p);
    if (d.ditarik || statusEtika(p) === 'digantung' || statusEtika(p) === 'dipecat') { return ''; }
    return d.tansri ? 'Tan Sri ' : d.dato ? "Dato' " : '';
  }
  function ringkasan(p) {
    var d = getGelaran(p), tahun = tahunBerkhidmat(p), skor = skorIntegriti(p), pangkat = pangkatSemasa(p);
    return { awalan: awalan(p), dato: d.dato, tansri: d.tansri, ditarik: d.ditarik, ditahan: !d.ditarik && !!(d.dato || d.tansri) && !awalan(p), bulanDato: d.bulanDato, bulanTan: d.bulanTan, bulanLayak: CONFIG.BULAN_LAYAK,
      anugerah: CONFIG.ANUGERAH.map(function (a) { return { kod: a.kod, ikon: a.ikon, nama: a.nama, syarat: a.syarat, diperoleh: d.anugerah[a.kod] || null }; }),
      sejarah: d.sejarah || [], tahun: tahun, skor: skor, pangkat: pangkat };
  }

  function prosesBulan() {
    var ev = [], p = S() && S().loadPlayer();
    if (!p || p.tamat) { return { peristiwa: ev }; }
    var d = getGelaran(p), st = statusEtika(p), kes = {}, ubah = false, skor = skorIntegriti(p);
    if (st === 'dipecat') {
      if (!d.ditarik && (d.dato || d.tansri || Object.keys(d.anugerah).length)) { d.ditarik = true; rekod(d, p, 'Gelaran ditarik balik (dipecat)'); ev.push({ jenis: 'gelaran_kurniaan', mesej: 'Gelaran kurniaan anda ditarik balik kerana keahlian dipecat.' }); ubah = true; }
      if (ubah) { simpan(d, kes); }
      return { peristiwa: ev };
    }
    var sah = st !== 'digantung';
    if (sah) {
      if (layakDato(p)) { d.bulanDato += 1; ubah = true; }
      if (d.dato && layakTan(p) && skor >= CONFIG.INTEGRITI_TAN) { d.bulanTan += 1; ubah = true; }
      if (!d.dato && d.bulanDato >= CONFIG.BULAN_LAYAK) {
        d.dato = { tahun: p.tahun, bulan: p.bulan }; kes.reputasi = (kes.reputasi || 0) + CONFIG.REPUTASI; rekod(d, p, "Dikurniakan Dato'");
        ev.push({ jenis: 'gelaran_kurniaan', mesej: "Anda dikurniakan gelaran Dato' (fiksyen permainan) atas khidmat cemerlang. Reputasi +" + CONFIG.REPUTASI + '.' });
      }
      if (d.dato && !d.tansri && d.bulanTan >= CONFIG.BULAN_LAYAK) {
        d.tansri = { tahun: p.tahun, bulan: p.bulan }; kes.reputasi = (kes.reputasi || 0) + CONFIG.REPUTASI; rekod(d, p, 'Dikurniakan Tan Sri');
        ev.push({ jenis: 'gelaran_kurniaan', mesej: 'Anda dikurniakan gelaran Tan Sri (fiksyen permainan). Reputasi +' + CONFIG.REPUTASI + '.' });
      }
      var tahun = tahunBerkhidmat(p), pangkat = pangkatSemasa(p), bersih = bersihRekod(p);
      CONFIG.ANUGERAH.forEach(function (a) {
        if (d.anugerah[a.kod] || tahun < a.tahun || skor < a.integriti || pangkat < a.pangkat || (a.bersih && !bersih)) { return; }
        d.anugerah[a.kod] = { tahun: p.tahun, bulan: p.bulan }; kes.reputasi = (kes.reputasi || 0) + CONFIG.REPUTASI; rekod(d, p, a.nama); ubah = true;
        ev.push({ jenis: 'gelaran_kurniaan', mesej: 'Anugerah diterima: ' + a.ikon + ' ' + a.nama + '. Reputasi +' + CONFIG.REPUTASI + '.' });
      });
    }
    if (ubah || ev.length) { simpan(d, kes, ev.length ? { log: { tindakan: 'gelaran', nama: ev[0].mesej, peringkat: 'ahli' } } : {}); }
    return { peristiwa: ev };
  }

  /* ---------- Gelaran NPC (v8.24) ----------
     Peraturan sama dengan pemain: pangkat 9+ / Menteri = Dato'; pangkat 10+ / TPM / PM = Tan Sri; Bahagian = sebahagian sahaja.
     Perempuan: gelaran sendiri (Dato' / Tan Sri) atau gelaran isteri penerima (Datin, Datin Paduka, Puan Sri). */
  var NPC = { BAHAGIAN: 0.4, ISTERI: 0.35, DATIN_PADUKA: 0.4 };
  /** tahap: 'dato' | 'tan' | 'bahagian' | lain (tiada). jantina: 'L' | 'P'. Sentiasa menggunakan 3 nombor rng supaya urutan stabil. Pulang awalan + ruang atau ''. */
  /* v11.3: gelaran negeri Sarawak untuk NPC parti Sarawak (maklumat pengguna): Datuk -> Datuk Amar -> Datuk Patinggi -> Pehin Sri.
     Pemegang wanita juga bergelar sama (bukan Datin). tahap tambahan: 'amar' | 'patinggi' | 'pehin'. */
  function sarawak() {
    var k = null; try { k = root.MyPolitikParti && root.MyPolitikParti.kini ? root.MyPolitikParti.kini() : null; } catch (e) { k = null; }
    if (!k) { try { var p = S() && S().loadPlayer(); k = p && p.parti; } catch (e2) { k = null; } }
    return /^(PBB|PRS|SUPP|PDP|PSB)$/.test(k || '');
  }
  function awalanNPC(rng, tahap, jantina) {
    var r1 = rng(), r2 = rng(), r3 = rng();
    if (tahap === 'pehin') { return 'Pehin Sri '; }
    if (tahap === 'patinggi') { return 'Datuk Patinggi '; }
    if (tahap === 'amar') { return 'Datuk Amar '; }
    var t = tahap === 'tan' ? 'tan' : tahap === 'dato' ? 'dato' : (tahap === 'bahagian' && r1 < NPC.BAHAGIAN ? 'dato' : null);
    if (!t) { return ''; }
    if (sarawak()) { return t === 'tan' ? 'Datuk Amar ' : 'Datuk '; }
    if (jantina === 'P' && r2 < NPC.ISTERI) { return t === 'tan' ? 'Puan Sri ' : (r3 < NPC.DATIN_PADUKA ? 'Datin Paduka ' : 'Datin '); }
    return t === 'tan' ? 'Tan Sri ' : "Dato' ";
  }

  return { CONFIG: CONFIG, NPC: NPC, awalanNPC: awalanNPC, getGelaran: getGelaran, awalan: awalan, ringkasan: ringkasan, prosesBulan: prosesBulan };
});
