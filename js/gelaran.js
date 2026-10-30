/* ==========================================================================
   Nusa Politik — js/gelaran.js   (v7.64)
   Anugerah & Gelaran Kebesaran (fiksyen permainan; kosmetik dengan kesan kecil, TIDAK boleh dibeli).
     1. Anugerah (3 tahap, atas prestasi): Pingat Khidmat Cemerlang, Darjah Setia Nusa, Darjah Kebesaran Nusa.
     2. Gelaran Kurniaan (awalan nama): "Dato'" dan "Tan Sri", dikurniakan secara fiksyen oleh pihak istana selepas
        tempoh berkhidmat pada tahap yang layak dengan rekod bersih.
          Dato'    : jawatan parti pangkat >= 9 (cth. Ketua Sayap Pusat) ATAU Menteri / Menteri Besar / Timbalan PM / PM; 36 bulan layak.
          Tan Sri  : sudah Dato', jawatan parti pangkat >= 10 (Naib Presiden dan ke atas) ATAU Perdana Menteri / Timbalan PM; 36 bulan layak; Integriti >= 70.
     Digantung = gelaran ditahan (tidak dipaparkan) sehingga status pulih; dipecat = gelaran ditarik balik (kekal).
   v13.13 (mockup "Gelaran & Pendidikan", dipersetujui):
     - Gelaran persekutuan dieja "Datuk" (bukan "Dato'"), seperti dipinta pengguna.
     - Tun: sudah Tan Sri, pernah Perdana Menteri sekurang-kurangnya 36 bulan (jumlah), Integriti >= 75, tiada hukuman disiplin; Reputasi +3.
     - Gelaran negeri (negeri cawangan): tahap 1 ADUN / EXCO 36 bulan, Integriti >= 60; tahap 2 MB / KM 36 bulan, Integriti >= 70.
       Sarawak 4 tahap: Datuk -> Datuk Amar (Menteri Kanan / Premier 36 bulan) -> Datuk Patinggi (Premier 24 bulan) -> Pehin Sri (Premier 60 bulan).
       Setiap gelaran negeri Reputasi +2. Nama gelaran negeri dipermudahkan (andaian).
     - Awalan nama: persekutuan tertinggi -> negeri tertinggi -> "Dr." (PhD, js/pendidikan.js). "Datuk" persekutuan tidak diulang jika ada gelaran negeri;
       Tun memadai; di Sarawak Datuk Patinggi / Pehin Sri didahulukan.
   State: p.gelaran = { bulanDato, bulanTan, dato, tansri, tun, bulanPM, negeri:{t1,t2,amar,patinggi,pehin}, bulanN1, bulanN2, bulanAmar, bulanPremier,
                        anugerah:{kod:{tahun,bulan}}, ditarik, sejarah }
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
    TUN: { bulanPM: 36, integriti: 75, reputasi: 3 },                                      // v13.13
    NEGERI: { bulan: 36, int1: 60, int2: 70, reputasi: 2, amar: 36, patinggi: 24, pehin: 60 },
    ANUGERAH: [
      { kod: 'pingat', ikon: '🥉', nama: 'Pingat Khidmat Cemerlang', tahun: 3, integriti: 60, pangkat: 0, bersih: false, syarat: '3 tahun berkhidmat, Integriti ≥ 60' },
      { kod: 'setia',  ikon: '🥈', nama: 'Darjah Setia Nusa',         tahun: 6, integriti: 70, pangkat: 7, bersih: false, syarat: '6 tahun berkhidmat, jawatan Bahagian ke atas, Integriti ≥ 70' },
      { kod: 'kebesaran', ikon: '🥇', nama: 'Darjah Kebesaran Nusa',  tahun: 10, integriti: 80, pangkat: 8, bersih: true, syarat: '10 tahun berkhidmat, jawatan Pusat, Integriti ≥ 80, tiada hukuman disiplin' }
    ]
  };

  function dasar0() { return { bulanDato: 0, bulanTan: 0, dato: null, tansri: null, tun: null, bulanPM: 0, negeri: {}, bulanN1: 0, bulanN2: 0, bulanAmar: 0, bulanPremier: 0, anugerah: {}, ditarik: false, sejarah: [] }; }
  function getGelaran(p) {
    var b = dasar0(), d = p && p.gelaran && typeof p.gelaran === 'object' ? p.gelaran : {};
    for (var f in b) { if (d[f] === undefined) { d[f] = b[f]; } }
    if (!d.anugerah || typeof d.anugerah !== 'object') { d.anugerah = {}; }
    if (!d.negeri || typeof d.negeri !== 'object') { d.negeri = {}; }
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

  function SWp(p) { return !!p && /^(PBB|PRS|SUPP|PDP|PSB)$/.test(p.parti || ''); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function PD() { return modul('MyPolitikPendidikan', 'pendidikan.js'); }
  /** v13.13: nama gelaran negeri ikut negeri cawangan. Sarawak: 4 tahap. */
  function tanggaNegeri(p) {
    if (SWp(p)) { return [{ kod: 't1', nama: 'Datuk' }, { kod: 'amar', nama: 'Datuk Amar' }, { kod: 'patinggi', nama: 'Datuk Patinggi' }, { kod: 'pehin', nama: 'Pehin Sri' }]; }
    var n = String((p && p.negeri) || '').toLowerCase(), a = ["Dato'", "Dato' Seri"];
    if (n === 'sabah') { a = ['Datuk', 'Datuk Seri Panglima']; } else if (n === 'melaka' || n === 'pulau pinang') { a = ['Datuk', 'Datuk Seri']; } else if (n === 'pahang') { a = ["Dato'", "Dato' Sri"]; }
    return [{ kod: 't1', nama: a[0] }, { kod: 't2', nama: a[1] }];
  }
  function negeriTertinggi(p, d) { var t = tanggaNegeri(p), h = ''; t.forEach(function (x) { if (d.negeri[x.kod]) { h = x.nama; } }); return h; }
  /** Awalan nama, cth. "Datuk ", "Tan Sri Dato' Seri Dr. ", "Tun Dr. ". Gelaran kosong jika ditahan atau ditarik; "Dr." kekal. */
  function awalan(p) {
    var d = getGelaran(p), P = PD(), dr = P && P.dr ? (P.dr(p) ? 'Dr.' : '') : '', fed = '', neg = '', bah;
    if (!(d.ditarik || statusEtika(p) === 'digantung' || statusEtika(p) === 'dipecat')) {
      fed = d.tun ? 'Tun' : d.tansri ? 'Tan Sri' : d.dato ? 'Datuk' : ''; neg = negeriTertinggi(p, d);
    }
    if (fed === 'Tun') { bah = ['Tun', dr]; }
    else if (SWp(p) && (d.negeri.patinggi || d.negeri.pehin)) { bah = [neg, fed === 'Tan Sri' ? fed : '', dr]; }
    else { bah = [fed === 'Datuk' && neg ? '' : fed, neg, dr]; }
    bah = bah.filter(Boolean);
    return bah.length ? bah.join(' ') + ' ' : '';
  }
  function ringkasan(p) {
    var d = getGelaran(p), tahun = tahunBerkhidmat(p), skor = skorIntegriti(p), pangkat = pangkatSemasa(p);
    var tangga = tanggaNegeri(p);
    return { awalan: awalan(p), dato: d.dato, tansri: d.tansri, tun: d.tun, bulanPM: d.bulanPM, sarawak: SWp(p), negeriNama: p.negeri || '',
      negeri: tangga.map(function (x) { return { kod: x.kod, nama: x.nama, diperoleh: d.negeri[x.kod] || null }; }), bulanN1: d.bulanN1, bulanN2: d.bulanN2, bulanAmar: d.bulanAmar, bulanPremier: d.bulanPremier,
      ditarik: d.ditarik, ditahan: !d.ditarik && !!(d.dato || d.tansri || d.tun || negeriTertinggi(p, d)) && (statusEtika(p) === 'digantung' || statusEtika(p) === 'dipecat'), bulanDato: d.bulanDato, bulanTan: d.bulanTan, bulanLayak: CONFIG.BULAN_LAYAK,
      anugerah: CONFIG.ANUGERAH.map(function (a) { return { kod: a.kod, ikon: a.ikon, nama: a.nama, syarat: a.syarat, diperoleh: d.anugerah[a.kod] || null }; }),
      sejarah: d.sejarah || [], tahun: tahun, skor: skor, pangkat: pangkat };
  }

  function prosesBulan() {
    var ev = [], p = S() && S().loadPlayer();
    if (!p || p.tamat) { return { peristiwa: ev }; }
    var d = getGelaran(p), st = statusEtika(p), kes = {}, ubah = false, skor = skorIntegriti(p);
    if (st === 'dipecat') {
      if (!d.ditarik && (d.dato || d.tansri || d.tun || Object.keys(d.negeri).length || Object.keys(d.anugerah).length)) { d.ditarik = true; rekod(d, p, 'Gelaran ditarik balik (dipecat)'); ev.push({ jenis: 'gelaran_kurniaan', mesej: 'Gelaran kurniaan anda ditarik balik kerana keahlian dipecat.' }); ubah = true; }
      if (ubah) { simpan(d, kes); }
      return { peristiwa: ev };
    }
    var sah = st !== 'digantung';
    if (sah) {
      if (layakDato(p)) { d.bulanDato += 1; ubah = true; }
      if (d.dato && layakTan(p) && skor >= CONFIG.INTEGRITI_TAN) { d.bulanTan += 1; ubah = true; }
      if (!d.dato && d.bulanDato >= CONFIG.BULAN_LAYAK) {
        d.dato = { tahun: p.tahun, bulan: p.bulan }; kes.reputasi = (kes.reputasi || 0) + CONFIG.REPUTASI; rekod(d, p, 'Dikurniakan Datuk');
        ev.push({ jenis: 'gelaran_kurniaan', mesej: 'Anda dikurniakan gelaran Datuk (fiksyen permainan) atas khidmat cemerlang. Reputasi +' + CONFIG.REPUTASI + '.' });
      }
      if (d.dato && !d.tansri && d.bulanTan >= CONFIG.BULAN_LAYAK) {
        d.tansri = { tahun: p.tahun, bulan: p.bulan }; kes.reputasi = (kes.reputasi || 0) + CONFIG.REPUTASI; rekod(d, p, 'Dikurniakan Tan Sri');
        ev.push({ jenis: 'gelaran_kurniaan', mesej: 'Anda dikurniakan gelaran Tan Sri (fiksyen permainan). Reputasi +' + CONFIG.REPUTASI + '.' });
      }
      var tahun = tahunBerkhidmat(p), pangkat = pangkatSemasa(p), bersih = bersihRekod(p);
      // v13.13: Tun dan gelaran negeri
      var T = CONFIG.TUN, N = CONFIG.NEGERI, K0 = KB(), kb = K0 ? K0.getKabinet(p) : null, tahap = kb && kb.hasGovernmentRole ? kb.roleLevel : 'NONE', R = PRU();
      if (tahap === 'PERDANA_MENTERI') { d.bulanPM += 1; ubah = true; }
      if (d.tansri && !d.tun && d.bulanPM >= T.bulanPM && skor >= T.integriti && bersih) {
        d.tun = { tahun: p.tahun, bulan: p.bulan }; kes.reputasi = (kes.reputasi || 0) + T.reputasi; rekod(d, p, 'Dikurniakan Tun');
        ev.push({ jenis: 'gelaran_kurniaan', mesej: 'Anda dikurniakan gelaran Tun (fiksyen permainan), gelaran persekutuan tertinggi. Reputasi +' + T.reputasi + '.' });
      }
      var adun = !!(R && R.pegang && R.pegang(p, 'ADUN')), mb = tahap === 'MENTERI_BESAR', kanan = mb || (tahap === 'EXCO_NEGERI' && /Kanan/.test(kb.portfolioName || ''));
      if (adun || tahap === 'EXCO_NEGERI' || mb) { d.bulanN1 += 1; ubah = true; }
      if (mb) { d.bulanN2 += 1; d.bulanPremier += 1; }
      if (kanan) { d.bulanAmar += 1; }
      var tg = tanggaNegeri(p), nm = {}; tg.forEach(function (x) { nm[x.kod] = x.nama; });
      function kurnia(kod) {
        d.negeri[kod] = { tahun: p.tahun, bulan: p.bulan }; kes.reputasi = (kes.reputasi || 0) + N.reputasi; rekod(d, p, 'Gelaran negeri: ' + nm[kod]);
        ev.push({ jenis: 'gelaran_kurniaan', mesej: 'Anda dikurniakan gelaran negeri ' + nm[kod] + ' oleh ' + (p.negeri || 'negeri') + ' (fiksyen permainan). Reputasi +' + N.reputasi + '.' });
      }
      if (!d.negeri.t1 && d.bulanN1 >= N.bulan && skor >= N.int1) { kurnia('t1'); }
      if (SWp(p)) {
        if (d.negeri.t1 && !d.negeri.amar && d.bulanAmar >= N.amar) { kurnia('amar'); }
        if (d.negeri.amar && !d.negeri.patinggi && d.bulanPremier >= N.patinggi) { kurnia('patinggi'); }
        if (d.negeri.patinggi && !d.negeri.pehin && d.bulanPremier >= N.pehin) { kurnia('pehin'); }
      } else if (d.negeri.t1 && !d.negeri.t2 && d.bulanN2 >= N.bulan && skor >= N.int2) { kurnia('t2'); }
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

  return { CONFIG: CONFIG, NPC: NPC, awalanNPC: awalanNPC, getGelaran: getGelaran, awalan: awalan, tanggaNegeri: tanggaNegeri, ringkasan: ringkasan, prosesBulan: prosesBulan };
});
