/* ==========================================================================
   Nusa Politik — js/lompat.js   (v13.51)
   Lompat Parti (maklum balas Threads no. 4, mockup dipersetujui).
     - Pemain memilih parti baharu yang bergerak di negerinya (ANDAIAN: Sarawak = parti Sarawak, PKR, DAP; Sabah / Labuan =
       UMNO, MCA, MIC, PBRS, PKR, DAP; Semenanjung = UMNO, MCA, MIC, PPP, PAS, PKR, DAP).
     - Sekali setiap 5 tahun; tidak semasa PRU / PRK / musim pemilihan berjalan. Parti baharu menolak jika Reputasi < 20
       atau pemain sudah lompat 2 kali.
     - Pengesahan di dashboard menetapkan p.lompatTertunda dan membuka borang pendaftaran (index.html#daftar) dalam mod lompat:
       parti baharu dipilih, nama / jantina / umur dikunci; pemain memilih cawangan baharu. gabung(lama, baru) menyatukan profil.
     - Kekal: nama, umur, Dana, AP, harta, gelaran, pendidikan, kesihatan, Stress, log, rekod pilihan raya dan kerajaan,
       jawatan tertinggi kerjaya, trofi (kunci watak = tarikh dicipta).
     - Bermula semula: jawatan parti (Ahli Biasa), tempoh keahlian, keadaan parti (pemilihan, disiplin, saingan, kabinet).
     - IP -50%; Reputasi -10; Sokongan akar umbi 30; label "Katak Politik" 24 bulan.
     - Perkara 49A: wakil rakyat yang keluar parti secara sukarela hilang kerusi. Kerusi pertama: PRK bulan depan,
       pemain boleh bertanding atas tiket parti baharu (pencalonan dijamin). Kerusi kedua (jika ada): PRK calon parti (js/letak.js).
       Ahli Politik Bebas (dipecat) kekal kerusi dan tiada penalti Reputasi / label.
   ANDAIAN: semua angka ialah angka permainan.
   State: p.lompat = { kali, sejarah:[{ dari, ke, tahun, bulan }], katakSehingga, prk:[{ jenis, nama, i }] }; p.lompatTertunda = { ke, tahun, bulan }.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikLompat = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function PT() { return modul('MyPolitikParti', 'parti.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function PRK() { return modul('MyPolitikPRK', 'prk.js'); }
  function E() { return modul('MyPolitikElection', 'election.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function salin(o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); }
  function SW(k) { return k === 'PBB' || k === 'PRS' || k === 'SUPP' || k === 'PDP' || k === 'PSB'; }

  var CONFIG = { JEDA_TAHUN: 5, MAKS: 2, REP_MIN: 20, IP_KEKAL: 0.5, REPUTASI: -10, KATAK_BULAN: 24, AKAR_UMBI: 30, PRK_BULAN: 1 };
  var SENARAI = ['UMNO', 'MCA', 'MIC', 'PPP', 'PBRS', 'PAS', 'PKR', 'DAP', 'PBB', 'PRS', 'SUPP', 'PDP', 'BERJASA', 'GAGASAN', 'PBS', 'UPKO', 'LDP', 'PHRS', 'PCS', 'WARISAN', 'AMANAH', 'BERSATU'];
  var KEKAL = ['nama', 'tahun', 'bulan', 'myr', 'ap', 'stress', 'kesihatan', 'settings', 'pendidikan', 'careerBackground', 'harta', 'log', 'dicipta', 'gelaran', 'jawatanTertinggi', 'tamat'];

  function aktifDi(kod, negeri) {
    var n = String(negeri || ''), swk = /sarawak/i.test(n), sbh = /sabah|labuan/i.test(n);
    if (SW(kod)) { return swk; }
    if (kod === 'PKR' || kod === 'DAP') { return true; }
    if (kod === 'AMANAH' || kod === 'BERSATU') { return !swk; }   // v13.89: BERSATU: Semenanjung, Sabah dan WP   // v13.56: Amanah: Semenanjung, Sabah dan Labuan
    if (kod === 'PBRS' || /^(GAGASAN|PBS|UPKO|LDP|PHRS|PCS)$/.test(kod)) { return sbh; }   // v13.54: GRS
    if (kod === 'PPP' || kod === 'PAS' || kod === 'BERJASA') { return !swk && !sbh; }
    if (kod === 'WARISAN') { return !swk; }   // v13.55: Sabah, Labuan dan Semenanjung
    return !swk;                                                          // UMNO, MCA, MIC: Semenanjung dan Sabah
  }
  function gabParti(kod) { return SW(kod) ? 'GPS' : kod === 'PAS' || kod === 'BERSATU' ? 'PN' : kod === 'PKR' || kod === 'DAP' || kod === 'AMANAH' ? 'PH' : kod === 'BERJASA' || kod === 'WARISAN' ? 'LAIN' : /^(GAGASAN|PBS|UPKO|LDP|PHRS|PCS)$/.test(kod) ? 'GRS' : 'BN'; }
  function nama(kod) { var P = PT(); var i = P && P.info ? P.info(kod) : null; return (i && (i.nama || i.singkatan)) || kod; }
  function getL(p) { var l = p && p.lompat && typeof p.lompat === 'object' ? salin(p.lompat) : {}; l.kali = l.kali || 0; l.sejarah = Array.isArray(l.sejarah) ? l.sejarah : []; l.prk = Array.isArray(l.prk) ? l.prk : []; l.katakSehingga = l.katakSehingga || 0; return l; }
  function dipecat(p) { return !!(p && p.etika && p.etika.status === 'dipecat'); }
  function kerusi(p) { var R = PRU(), pr = R && R.getPRU ? R.getPRU(p) : (p.pru || {}); return [pr.status, pr.statusKedua].filter(function (s) { return s && (s.jenis === 'MP' || s.jenis === 'ADUN'); }); }
  /** v13.87: wakil rakyat Bebas (menang sebagai calon Bebas) yang menyertai parti hilang kerusi (Perkara 49A). */
  function wakilBebas(p) { return kerusi(p).some(function (s) { return s.bebas; }); }
  function katak(p) { return idx(p) < getL(p).katakSehingga; }

  /** Sebab global tidak boleh lompat ('' jika boleh). */
  function kunci(p) {
    if (!p || p.tamat) { return 'Tiada profil aktif.'; }
    if (p.lompatTertunda) { return 'Lompat parti sedang diproses.'; }
    if (p.tyt && p.tyt.aktif) { return 'Yang di-Pertua Negeri tidak berparti.'; }   // v13.52
    var R = PRU(), pr = R && R.getPRU ? R.getPRU(p) : null; if (pr && pr.aktif) { return 'Tidak boleh lompat parti semasa PRU.'; }
    var K = PRK(), pk = K && K.getPRK ? K.getPRK(p) : null; if (pk && pk.aktif) { return 'Tidak boleh lompat parti semasa PRK.'; }
    var l = getL(p), akhir = l.sejarah[l.sejarah.length - 1];
    // v13.86: ahli yang dipecat bebas menyertai parti lain tanpa tempoh menunggu
    if (akhir && !dipecat(p) && (parseInt(p.tahun, 10) - akhir.tahun) < CONFIG.JEDA_TAHUN) { return 'Lompat parti hanya sekali setiap ' + CONFIG.JEDA_TAHUN + ' tahun (terakhir ' + akhir.tahun + ').'; }
    return '';
  }
  function pilihan(p) {
    var l = getL(p), tolak = l.kali >= CONFIG.MAKS ? 'Parti menolak: anda sudah lompat ' + l.kali + ' kali.' : (Number(p.reputasi) || 0) < CONFIG.REP_MIN ? 'Parti menolak: Reputasi di bawah ' + CONFIG.REP_MIN + '.' : '';
    var asal = p.parti || 'UMNO', g = gabParti(asal);
    return SENARAI.filter(function (k) { return k !== asal; }).map(function (k) {
      var sebab = !aktifDi(k, p.negeri) ? (SW(k) ? 'Hanya di Sarawak.' : k === 'PBRS' || /^(GAGASAN|PBS|UPKO|LDP|PHRS|PCS)$/.test(k) ? 'Hanya di Sabah.' : 'Tidak bergerak di negeri anda.') : tolak;
      return { kod: k, nama: nama(k), boleh: !sebab, sebab: sebab, mesra: gabParti(k) === g };
    });
  }
  /** Ringkasan kesan untuk dialog pengesahan. */
  function kesan(p) {
    var ks = dipecat(p) && !wakilBebas(p) ? [] : kerusi(p), jl = Array.isArray(p.jawatanList) ? p.jawatanList.map(function (j) { return j.jawatan; }) : [];
    var K = modul('MyPolitikKabinet', 'kabinet.js'), kb = K && K.getKabinet ? K.getKabinet(p) : null;
    return { dipecat: dipecat(p), kerusi: ks.map(function (s) { return { jenis: s.jenis, nama: s.kerusi || '' }; }), jawatan: jl, kerajaan: kb && kb.hasGovernmentRole ? kb.portfolioName : '',
      ip: Math.round((Number(p.ip) || 0) * CONFIG.IP_KEKAL), reputasi: dipecat(p) ? 0 : CONFIG.REPUTASI, akarUmbi: CONFIG.AKAR_UMBI, katakBulan: dipecat(p) ? 0 : CONFIG.KATAK_BULAN };
  }
  function keadaan(p) { var s = kunci(p); return { boleh: !s, sebab: s, pilihan: pilihan(p), kesan: kesan(p), lompat: getL(p), katak: katak(p), dipecat: dipecat(p) }; }

  /** Sahkan lompat: tanda tertunda; pemain melengkapkan pendaftaran cawangan baharu di index.html#daftar. */
  function mula(kod) {
    var Sv = S(), p = Sv.loadPlayer(), s = kunci(p); if (s) { return { ok: false, ralat: s }; }
    var c = pilihan(p).filter(function (x) { return x.kod === kod; })[0]; if (!c) { return { ok: false, ralat: 'Parti tidak sah.' }; } if (!c.boleh) { return { ok: false, ralat: c.sebab }; }
    var r = Sv.applyEffects({}, { kiraTindakan: false, patch: { lompatTertunda: { ke: kod, tahun: p.tahun, bulan: p.bulan } } });
    return r.ok ? { ok: true, url: 'index.html#daftar', mesej: 'Pilih cawangan baharu anda dalam ' + c.nama + '.' } : { ok: false, ralat: r.ralat };
  }
  function batal() { var Sv = S(), p = Sv.loadPlayer(); if (!p || !p.lompatTertunda) { return { ok: false }; } delete p.lompatTertunda; return Sv.savePlayer(p); }

  /** Gabung profil lama (parti asal) dengan profil baharu daripada borang pendaftaran (cawangan parti baharu). */
  function gabung(lama, baru) {
    var n = salin(baru), t = lama.lompatTertunda || { ke: baru.parti }, dp = dipecat(lama), mula = idx(lama);
    KEKAL.forEach(function (k) { if (lama[k] !== undefined) { n[k] = salin(lama[k]); } });
    delete n.tamat;
    n.demografik = Object.assign({}, baru.demografik, { umur: lama.demografik ? lama.demografik.umur : baru.demografik.umur });   // umur permulaan watak
    n.avatar = baru.avatar || lama.avatar;
    n.ip = Math.round((Number(lama.ip) || 0) * CONFIG.IP_KEKAL);
    n.reputasi = clamp((Number(lama.reputasi) || 50) + (dp ? 0 : CONFIG.REPUTASI), 0, 100);
    n.kesetiaan = Object.assign({}, baru.kesetiaan, { akarUmbi: CONFIG.AKAR_UMBI });
    n.keahlian = { sejakTahun: parseInt(lama.tahun, 10), sejakBulan: parseInt(lama.bulan, 10) || 1 };
    n.kabinet = { sejarah: (lama.kabinet && Array.isArray(lama.kabinet.sejarah)) ? salin(lama.kabinet.sejarah) : [] };
    var pk = lama.prk && typeof lama.prk === 'object' ? salin(lama.prk) : null; if (pk) { pk.aktif = null; n.prk = pk; }
    // pilihan raya: sejarah kekal; kerusi dikosongkan (Perkara 49A) kecuali dipecat
    var pr = lama.pru && typeof lama.pru === 'object' ? salin(lama.pru) : null, kos = [];
    if (pr) {
      if (!dp || wakilBebas(lama)) {                                       // v13.87: wakil Bebas yang menyertai parti juga hilang kerusi
        [pr.status, pr.statusKedua].forEach(function (s) { if (s && (s.jenis === 'MP' || s.jenis === 'ADUN')) { kos.push({ jenis: s.jenis === 'ADUN' ? 'DUN' : 'PARLIMEN', nama: s.kerusi || '', i: mula + CONFIG.PRK_BULAN }); } });
        if (pr.status && (pr.status.jenis === 'MP' || pr.status.jenis === 'ADUN')) { pr.status = null; }
        if (pr.statusKedua && (pr.statusKedua.jenis === 'MP' || pr.statusKedua.jenis === 'ADUN')) { pr.statusKedua = null; }
        if (!pr.status && pr.statusKedua) { pr.status = pr.statusKedua; pr.statusKedua = null; }
      }
      pr.hubunganGabungan = 50; pr.aktif = null;
      n.pru = pr;
    }
    if (lama.kerusiNasional) { n.lompatKerusi = { dari: lama.parti || 'UMNO', id: lama.id || '', k: salin(lama.kerusiNasional) }; }   // v13.85: kerusi kekal, ditukar perspektif di dashboard (paparan.js)
    var l = getL(lama);
    l.kali += 1; l.sejarah = l.sejarah.concat([{ dari: lama.parti || 'UMNO', ke: n.parti, tahun: parseInt(lama.tahun, 10), bulan: parseInt(lama.bulan, 10) || 1 }]);
    if (!dp) { l.katakSehingga = mula + CONFIG.KATAK_BULAN; }
    l.prk = kos.slice(0, 1);                                             // kerusi pertama: PRK pemain (tiket parti baharu)
    n.lompat = l;
    if (kos.length > 1) { n.letak = { kabinetSehingga: 0, prk: kos.slice(1), sejarah: [] }; }   // kerusi kedua: PRK calon parti
    n.log = (Array.isArray(n.log) ? n.log : []).concat([{ tahun: lama.tahun, bulan: lama.bulan, tindakan: 'lompat_parti', nama: 'Lompat parti: ' + (lama.parti || 'UMNO') + ' → ' + n.parti, peringkat: 'ahli' }]);
    delete n.lompatTertunda;
    return n;
  }

  /** Bulanan: cetuskan PRK kerusi yang dikosongkan; pemain dijamin dicalonkan atas tiket parti baharu. */
  function prosesBulan(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [];
    if (!p || p.tamat || !p.lompat) { return { peristiwa: ev }; }
    var l = getL(p), kini = idx(p), tiba = l.prk.filter(function (x) { return x.i <= kini; });
    if (!tiba.length) { return { peristiwa: ev }; }
    var K = PRK(); if (!K || !K.triggerByElection) { return { peristiwa: ev }; }
    var x = tiba[0], r = K.triggerByElection({ paksa: true, jenis: x.jenis, sebab: 'peletakan', pertahan: false, lompat: true, rng: o && o.rng });
    if (!r.ok) { return { peristiwa: ev }; }                              // pilihan raya lain berjalan: cuba bulan depan
    p = Sv.loadPlayer(); l = getL(p); l.prk = l.prk.filter(function (y) { return y !== x && !(y.jenis === x.jenis && y.nama === x.nama); });
    Sv.applyEffects({}, { kiraTindakan: false, patch: { lompat: l } });
    ev = ev.concat(r.peristiwa || []);
    ev.push({ jenis: 'lompat', mesej: 'PRK ' + (x.jenis === 'DUN' ? 'DUN ' : 'Parlimen ') + x.nama + ' diadakan selepas anda lompat parti (Perkara 49A). Anda layak bertanding atas tiket ' + nama(p.parti) + '.' });
    return { peristiwa: ev };
  }

  return { CONFIG: CONFIG, SENARAI: SENARAI, aktifDi: aktifDi, getL: getL, katak: katak, kunci: kunci, pilihan: pilihan, kesan: kesan, keadaan: keadaan, mula: mula, batal: batal, gabung: gabung, prosesBulan: prosesBulan };
});
