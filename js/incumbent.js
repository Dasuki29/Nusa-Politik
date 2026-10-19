/* ==========================================================================
   Nusa Politik — js/incumbent.js
   Modul Pemegang Jawatan (jawatan pemain bukan 'Ahli Biasa').

   1. Tindakan Pentadbiran dan Kepimpinan
        Anjur Mesyuarat AJK        +10 Sokongan AJK, -MYR 300, -1 AP
        Agih Peruntukan Kebajikan  +15 Sokongan Akar Umbi, -MYR 1,000, -1 AP
        Lobi Perwakilan            +8 Sokongan Perwakilan PAU, -MYR 500, -1 AP
        Terbit Kenyataan Media     +15 IP, -10 Sokongan Atas Pagar, -1 AP
   2. Sistem Amaran Sokongan
        Jika Sokongan Akar Umbi < 40%, amaran dicetuskan dan satu kejadian rawak
        boleh berlaku: penentang mencabar jawatan pemain.

   Setiap tindakan terus mengemas kini profil dalam localStorage melalui
   MyPolitikSave.applyEffects() dan menyiarkan acara 'myPolitik:player-updated'.
   Perlu dimuatkan selepas js/save.js.

   Cara guna dalam dashboard.html:
     var senarai = MyPolitikIncumbent.senaraiTindakan();
     var hasil   = MyPolitikIncumbent.jalankanTindakan('anjur_mesyuarat_ajk');
     // hasil.amaran dan hasil.peristiwa memaklumkan UI jika kejadian rawak berlaku
     MyPolitikIncumbent.semakAmaranKesetiaan();   // panggil semasa dashboard dimuat / tamat giliran
   ========================================================================== */
(function (root, factory) {
  var S = root.MyPolitikSave || (typeof module === 'object' && typeof require === 'function' ? require('./save.js') : null);
  if (!S) { throw new Error('incumbent.js memerlukan js/save.js dimuatkan dahulu.'); }
  var api = factory(S);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikIncumbent = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (S) {
  'use strict';

  var CONFIG = {
    JAWATAN_BIASA: 'Ahli Biasa',
    AMBANG_AMARAN: 40,             // Sokongan Akar Umbi di bawah nilai ini mencetuskan amaran
    AMBANG_KRITIKAL: 25,           // di bawah nilai ini amaran menjadi kritikal
    AMBANG_PULIH: 55,              // v8.0: pencabar berundur jika Sokongan Akar Umbi pulih ke nilai ini
    KEBARANGKALIAN_ASAS: 0.25,     // peluang kejadian rawak pada 39%
    KEBARANGKALIAN_MAKS: 0.75,     // peluang pada 0%
    COOLDOWN_TINDAKAN: 3,          // bilangan tindakan minimum antara dua cabaran
    /* v8.9: meter Sokongan Atas Pagar (kesetiaan.penentang) */
    ATAS_PAGAR_LALAI: 30,          // nilai asas; meter reput ke arah nilai ini
    ATAS_PAGAR_MUSUH: 20,          // di bawah nilai ini = Memusuhi
    ATAS_PAGAR_SOKONG: 50,         // pada atau di atas nilai ini = Condong sokong
    ATAS_PAGAR_LARAS: 0.10,        // +/- pada peluang dicabar (mata peratus / 100)
    ATAS_PAGAR_REPUT: 2            // mata sebulan ke arah nilai asas
  };

  /* ------------------------------------------------------------------------
     1. TINDAKAN PENTADBIRAN DAN KEPIMPINAN
     ------------------------------------------------------------------------ */
  var TINDAKAN = [
    {
      id: 'anjur_mesyuarat_ajk', nama: 'Anjur Mesyuarat AJK',
      penerangan: 'Memanggil mesyuarat jawatankuasa untuk menyelaraskan kerja dan mengeratkan hubungan.',
      kesan: { myr: -300, ap: -1, kesetiaan: { ajk: 10 } },
      etika: { modal: 2 }
    },
    {
      id: 'agih_peruntukan', nama: 'Agih Peruntukan Kebajikan',
      penerangan: 'Mengagihkan bantuan kepada keluarga yang memerlukan di kawasan anda.',
      kesan: { myr: -1000, ap: -1, kesetiaan: { akarUmbi: 15 } },
      etika: { modal: 4 }
    },
    {
      id: 'lobi_perwakilan', nama: 'Lobi Perwakilan',
      penerangan: 'Bertemu perwakilan Perhimpunan Agung UMNO untuk meraih sokongan.',
      kesan: { myr: -500, ap: -1, kesetiaan: { perwakilan: 8 } }
    },
    {
      id: 'kenyataan_media', nama: 'Terbit Kenyataan Media',
      penerangan: 'Menerbitkan kenyataan untuk menaikkan nama, dengan risiko menjauhkan penentang.',
      kesan: { ip: 15, ap: -1, kesetiaan: { penentang: -10 } }
    },
    {
      id: 'kopi_o', nama: 'Kopi O dengan Golongan Atas Pagar',
      penerangan: 'Bertemu empat mata dengan mereka yang belum memihak, di kedai kopi, tanpa agenda rasmi.',
      kesan: { myr: -300, ap: -1, kesetiaan: { penentang: 8 } }
    },
    {
      id: 'aduan_terbuka', nama: 'Dengar Aduan Terbuka',
      penerangan: 'Membuka sesi dialog untuk mendengar rungutan ahli dan penduduk secara terus. Meletihkan tetapi membina kepercayaan.',
      kesan: { ap: -1, kesetiaan: { penentang: 6, akarUmbi: 2 } },
      stres: { stress: 2, kesihatan: 0 }
    },
    {
      id: 'rehat_keluarga', nama: 'Rehat & Masa Keluarga',
      penerangan: 'Berehat daripada politik untuk memulihkan tenaga. Stress -15, Kesihatan +4.',
      kesan: { ap: -2 },
      stres: { stress: -15, kesihatan: 4 }
    }
  ];

  /* ------------------------------------------------------------------------
     2. PEMBANTU
     ------------------------------------------------------------------------ */
  function salin(o) { return JSON.parse(JSON.stringify(o)); }

  function adalahPemegangJawatan(p) {
    return !!p && typeof p.jawatan === 'string' && p.jawatan !== '' && p.jawatan !== CONFIG.JAWATAN_BIASA;
  }

  /** Peringkat jawatan: 'cawangan' | 'bahagian' | 'pusat', daripada nama jawatan. */
  function peringkatJawatan(jawatan) {
    var j = String(jawatan || '');
    if (/Bahagian/i.test(j)) { return 'bahagian'; }
    if (/Cawangan/i.test(j)) { return 'cawangan'; }
    return 'pusat';
  }

  function cariTindakan(id) {
    for (var i = 0; i < TINDAKAN.length; i++) { if (TINDAKAN[i].id === id) { return TINDAKAN[i]; } }
    return null;
  }

  function semakBoleh(def, p) {
    if (!p) { return { boleh: false, sebab: 'Tiada profil pemain.' }; }
    var EtG = typeof globalThis !== 'undefined' ? globalThis.MyPolitikEtika : null;      // v4.6: digantung/dipecat tidak boleh guna AP untuk tugas jawatan
    if (EtG) { var hakG = EtG.semakHak(p, 'tugas_jawatan'); if (!hakG.boleh) { return { boleh: false, sebab: hakG.sebab }; } }
    if (!adalahPemegangJawatan(p)) { return { boleh: false, sebab: 'Tindakan ini untuk pemegang jawatan. Anda masih Ahli Biasa.' }; }
    if (p.ap + (def.kesan.ap || 0) < 0) { return { boleh: false, sebab: 'AP tidak mencukupi (perlu ' + Math.abs(def.kesan.ap) + ').' }; }
    if (def.kesan.myr < 0 && !S.cukupDana(p, -def.kesan.myr)) { return { boleh: false, sebab: S.ralatDana(p, -def.kesan.myr) }; }   // v8.0: kos selepas pengali kesukaran
    return { boleh: true, sebab: '' };
  }

  /* ------------------------------------------------------------------------
     3. API TINDAKAN
     ------------------------------------------------------------------------ */

  /** Senarai tindakan beserta keadaan semasa (untuk melukis butang dashboard). */
  function senaraiTindakan(profil) {
    var p = profil || S.loadPlayer();
    return TINDAKAN.map(function (d) {
      var s = semakBoleh(d, p), kp = S.kesanPapar(p, d.kesan);                 // v8.0: kos dipaparkan ikut tahap kesukaran
      return {
        id: d.id, nama: d.nama, penerangan: d.penerangan,
        kos: { ap: Math.abs(Math.min(0, d.kesan.ap || 0)), myr: Math.abs(Math.min(0, kp.myr || 0)) },
        kesan: salin(d.kesan),
        ringkas: S.ringkasPerubahan({ ip: kp.ip || 0, myr: kp.myr || 0, ap: kp.ap || 0, kesetiaan: kp.kesetiaan || {} }),
        boleh: s.boleh, sebab: s.sebab
      };
    });
  }

  /**
   * Jalankan satu tindakan dan simpan hasilnya terus ke localStorage.
   * Selepas itu semakan amaran sokongan dijalankan secara automatik.
   * opts: { rng } untuk ujian.
   * Pulangan: { ok, mesej, perubahan, profil, amaran, peristiwa:[] } atau { ok:false, kod, ralat }
   */
  function jalankanTindakan(id, opts) {
    opts = opts || {};
    var def = cariTindakan(id);
    if (!def) { return { ok: false, kod: 'tidak_dikenali', ralat: 'Tindakan tidak dikenali: ' + id }; }
    var p = S.loadPlayer();
    var s = semakBoleh(def, p);
    if (!s.boleh) { return { ok: false, kod: 'tidak_boleh', ralat: s.sebab }; }

    var K = typeof globalThis !== 'undefined' ? globalThis.MyPolitikCalendar : null;
    var Et = typeof globalThis !== 'undefined' ? globalThis.MyPolitikEtika : null;
    var r = S.applyEffects(K ? K.skalaKesan(p, def.kesan) : salin(def.kesan), {      // bonus bulan 1-3 (akar umbi)
      log: { tindakan: def.id, nama: def.nama, peringkat: peringkatJawatan(p.jawatan) },
      patch: Et && def.etika ? { etika: Et.selepasTindakanBersih(p, def.etika) } : undefined
    });
    if (!r.ok) { return r; }
    if (def.stres) { var STr = typeof globalThis !== 'undefined' ? globalThis.MyPolitikStres : null; if (STr) { STr.laras(def.stres); r.perubahan.stres = def.stres; } }   // v5.6: Rehat

    var amaran = semakAmaranKesetiaan({ rng: opts.rng });
    var peristiwa = [];
    if (amaran.cabaranTamat) { peristiwa.push(amaran.cabaranTamat); }
    if (amaran.cabaranBaru) { peristiwa.push({ jenis: 'cabaran_jawatan', cabaran: amaran.cabaranBaru, mesej: amaran.cabaranBaru.mesej }); }

    return {
      ok: true,
      mesej: def.nama + ': ' + S.ringkasPerubahan(r.perubahan) + '.' + (def.stres ? ' Stress ' + (def.stres.stress > 0 ? '+' : '') + def.stres.stress + (def.stres.kesihatan ? ', Kesihatan +' + def.stres.kesihatan : '') + '.' : ''),
      perubahan: r.perubahan,
      profil: S.loadPlayer() || r.profil,
      amaran: amaran,
      peristiwa: peristiwa
    };
  }

  /* ------------------------------------------------------------------------
     4. SISTEM AMARAN KESETIAAN
     ------------------------------------------------------------------------ */
  var PENENTANG_GELARAN = ['Haji', 'Dato\'', 'Tuan Haji', 'Encik', 'Puan Hajjah'];
  var PENENTANG_NAMA = ['Rahman', 'Salleh', 'Kamarul', 'Zainuddin', 'Mansor', 'Rohaizad', 'Jalil', 'Normala', 'Samsiah', 'Hashim'];
  var PENENTANG_BIN = ['Daud', 'Ahmad', 'Yaakob', 'Ghani', 'Osman', 'Bakar', 'Karim', 'Mat Zin'];
  var PENENTANG_PERANAN = [
    'bekas pemimpin cawangan yang tidak berpuas hati',
    'ahli veteran yang berpengaruh',
    'ketua kumpulan Atas Pagar',
    'AJK yang kehilangan kepercayaan kepada anda'
  ];

  function pilih(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

  function janaPenentang(rng) {
    var nama = pilih(rng, PENENTANG_GELARAN) + ' ' + pilih(rng, PENENTANG_NAMA) + ' bin ' + pilih(rng, PENENTANG_BIN);
    return { nama: nama, peranan: pilih(rng, PENENTANG_PERANAN) };
  }

  /** Peluang kejadian rawak: naik linear daripada KEBARANGKALIAN_ASAS (pada ambang) kepada MAKS (pada 0%). */
  function kebarangkalianCabaran(akarUmbi, atasPagar) {
    var a = CONFIG.AMBANG_AMARAN;
    var nisbah = Math.max(0, Math.min(1, (a - akarUmbi) / a));
    var asas = CONFIG.KEBARANGKALIAN_ASAS + nisbah * (CONFIG.KEBARANGKALIAN_MAKS - CONFIG.KEBARANGKALIAN_ASAS);
    var z = atasPagar === undefined || atasPagar === null ? null : zonAtasPagar(atasPagar);
    var laras = z === 'musuh' ? CONFIG.ATAS_PAGAR_LARAS : z === 'sokong' ? -CONFIG.ATAS_PAGAR_LARAS : 0;      // v8.9
    return Math.max(0.05, Math.min(0.85, asas + laras));
  }

  /** v8.9: zon meter Sokongan Atas Pagar: 'musuh' (<20) | 'goyah' | 'sokong' (>=50). */
  function zonAtasPagar(n) {
    n = Number(n) || 0;
    return n < CONFIG.ATAS_PAGAR_MUSUH ? 'musuh' : n >= CONFIG.ATAS_PAGAR_SOKONG ? 'sokong' : 'goyah';
  }

  /** v8.9: setiap bulan meter Atas Pagar reput ke arah nilai asas (sekali sebulan). Pulang { peristiwa: [] }. */
  function prosesBulan() {
    var p = S.loadPlayer(); if (!p || p.tamat || !p.kesetiaan) { return { peristiwa: [] }; }
    var kunci = p.tahun + '-' + p.bulan;
    if (p.atasPagarAkhir === kunci) { return { peristiwa: [] }; }
    var n = Number(p.kesetiaan.penentang), a = CONFIG.ATAS_PAGAR_LALAI, d = CONFIG.ATAS_PAGAR_REPUT;
    if (!isFinite(n)) { n = a; }
    var langkah = n > a ? -Math.min(d, n - a) : n < a ? Math.min(d, a - n) : 0;
    S.applyEffects(langkah ? { kesetiaan: { penentang: langkah } } : {}, { kiraTindakan: false, patch: { atasPagarAkhir: kunci } });
    return { peristiwa: [] };
  }

  function cabaranAktif(p) { return p && p.cabaran && p.cabaran.status === 'aktif' ? p.cabaran : null; }

  /**
   * Semak Sokongan Akar Umbi pemegang jawatan.
   * opts: { profil, rng, paksa:true }  (paksa mencetuskan cabaran, untuk ujian dan UI)
   * Pulangan:
   *   { ok, amaran:false, akarUmbi }                       jika sokongan sihat
   *   { ok, amaran:true, tahap:'amaran'|'kritikal', akarUmbi, ambang, mesej, kebarangkalian,
   *     cabaranBaru:{...}|null, cabaranAktif:{...}|null }  jika di bawah 40%
   *   cabaranTamat:{ jenis, mesej }|null  (v8.0) jika cabaran aktif tamat kerana jawatan tiada lagi atau sokongan pulih
   * Amaran berstatus dan cabaran baharu disimpan dalam localStorage.
   */
  function semakAmaranKesetiaan(opts) {
    opts = opts || {};
    var p = opts.profil || S.loadPlayer();
    if (!p) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    if (!adalahPemegangJawatan(p)) { return { ok: true, amaran: false, sebab: 'bukan_pemegang_jawatan' }; }
    var tamatC = opts.profil ? null : semakTamatCabaran(p);                  // v8.0: cabaran boleh tamat sebelum semakan baharu
    if (tamatC) { p = S.loadPlayer() || p; }

    var k = p.kesetiaan.akarUmbi, ambang = CONFIG.AMBANG_AMARAN;
    if (k >= ambang) {
      if (p.amaranAktif) { S.updatePlayer({ amaranAktif: false }); }
      return { ok: true, amaran: false, akarUmbi: k, ambang: ambang, cabaranTamat: tamatC };
    }

    var tahap = k < CONFIG.AMBANG_KRITIKAL ? 'kritikal' : 'amaran';
    var kemungkinan = kebarangkalianCabaran(k, p.kesetiaan.penentang);
    var aktif = cabaranAktif(p);
    var sejuk = (p.bilTindakan - (typeof p.cabaranTerakhirTindakan === 'number' ? p.cabaranTerakhirTindakan : -1e9)) < CONFIG.COOLDOWN_TINDAKAN;
    var rng = opts.rng || Math.random;
    var hasil = {
      ok: true, amaran: true, tahap: tahap, akarUmbi: k, ambang: ambang, kebarangkalian: kemungkinan,
      mesej: 'Sokongan Akar Umbi tinggal ' + k + '% (di bawah ' + ambang + '%). Penentang mula bergerak dan jawatan ' + p.jawatan + ' anda berisiko dicabar.',
      cabaranBaru: null, cabaranAktif: aktif, cabaranTamat: tamatC
    };

    if (!aktif && (opts.paksa || (!sejuk && rng() < kemungkinan))) {
      var lawan = janaPenentang(rng);
      var cabaran = {
        id: 'cabaran-' + Date.now().toString(36),
        jenis: 'cabaran_jawatan',
        tajuk: 'Jawatan anda dicabar',
        penentang: lawan,
        jawatanDicabar: p.jawatan, kod: kodJawatan(p, p.jawatan),
        peringkat: peringkatJawatan(p.jawatan),
        akarUmbi: k, tahap: tahap,
        mesej: lawan.nama + ', ' + lawan.peranan + ', mengumpul sokongan untuk mencabar jawatan ' + p.jawatan + ' anda.',
        tahun: p.tahun, tarikh: new Date().toISOString(), status: 'aktif'
      };
      var r = S.applyEffects({}, {
        kiraTindakan: false,
        patch: { cabaran: cabaran, amaranAktif: true, cabaranTerakhirTindakan: p.bilTindakan },
        log: { tindakan: 'cabaran_jawatan', nama: 'Jawatan dicabar oleh ' + lawan.nama, peringkat: peringkatJawatan(p.jawatan) }
      });
      if (r.ok) { hasil.cabaranBaru = cabaran; hasil.cabaranAktif = cabaran; }
    } else if (!p.amaranAktif) {
      S.updatePlayer({ amaranAktif: true });
    }
    return hasil;
  }

  function getCabaranAktif() { return cabaranAktif(S.loadPlayer()); }

  /** v8.0: kod katalog bagi nama jawatan yang dipegang (untuk memadankan cabaran dengan pertandingan). */
  function kodJawatan(p, nama) {
    var Jw = typeof globalThis !== 'undefined' ? globalThis.MyPolitikJawatan : null;
    var j = Jw && Jw.getJawatan ? Jw.getJawatan(p).filter(function (x) { return x.jawatan === nama; })[0] : null;
    return j && j.kod && j.kod !== 'lama' ? j.kod : null;
  }

  /**
   * v8.0: tamatkan cabaran aktif jika jawatan yang dicabar tidak lagi dipegang, atau Sokongan Akar Umbi
   * sudah pulih ke CONFIG.AMBANG_PULIH. Pulang { jenis:'cabaran_selesai', mesej } atau null.
   * (Cabaran yang dipertahankan dalam pemilihan diselesaikan oleh election.js.)
   */
  function semakTamatCabaran(p) {
    var c = cabaranAktif(p);
    if (!c) { return null; }
    var Jw = typeof globalThis !== 'undefined' ? globalThis.MyPolitikJawatan : null;
    var masih = !Jw || !Jw.getJawatan || Jw.getJawatan(p).some(function (j) { return c.kod ? j.kod === c.kod : j.jawatan === c.jawatanDicabar; });
    var k = Number(p.kesetiaan && p.kesetiaan.akarUmbi) || 0, nama = c.penentang && c.penentang.nama ? c.penentang.nama : 'Penentang', mesej = null;
    if (!masih) { mesej = 'Cabaran ' + nama + ' terhadap jawatan ' + c.jawatanDicabar + ' tamat kerana anda tidak lagi memegang jawatan itu.'; }
    else if (k >= CONFIG.AMBANG_PULIH) { mesej = nama + ' menarik diri daripada mencabar jawatan ' + c.jawatanDicabar + ' kerana Sokongan Akar Umbi anda pulih (' + k + '%).'; }
    if (!mesej) { return null; }
    var r = selesaikanCabaran('tamat');
    return r && r.ok ? { jenis: 'cabaran_selesai', mesej: mesej } : null;
  }

  /**
   * Tutup cabaran aktif. keputusan: 'ditangkis' | 'diterima' | 'tamat'.
   * Logik pemilihan yang menentukan keputusan belum dibina; fungsi ini hanya merekodkannya.
   */
  function selesaikanCabaran(keputusan) {
    var p = S.loadPlayer(), c = cabaranAktif(p);
    if (!c) { return { ok: false, ralat: 'Tiada cabaran aktif.' }; }
    if (['ditangkis', 'diterima', 'tamat'].indexOf(keputusan) < 0) { return { ok: false, ralat: 'Keputusan tidak sah: ' + keputusan }; }
    var tutup = {};
    for (var k in c) { tutup[k] = c[k]; }
    tutup.status = keputusan; tutup.tamat = new Date().toISOString();
    var r = S.applyEffects({}, {
      kiraTindakan: false, patch: { cabaran: tutup },
      log: { tindakan: 'cabaran_selesai', nama: 'Cabaran ' + c.penentang.nama + ': ' + keputusan, peringkat: peringkatJawatan(p.jawatan) }
    });
    return r.ok ? { ok: true, cabaran: tutup, profil: r.profil } : r;
  }

  return {
    CONFIG: CONFIG,
    TINDAKAN: TINDAKAN,
    adalahPemegangJawatan: adalahPemegangJawatan,
    peringkatJawatan: peringkatJawatan,
    senaraiTindakan: senaraiTindakan,
    jalankanTindakan: jalankanTindakan,
    kebarangkalianCabaran: kebarangkalianCabaran,
    zonAtasPagar: zonAtasPagar,
    prosesBulan: prosesBulan,
    semakAmaranKesetiaan: semakAmaranKesetiaan,
    semakTamatCabaran: semakTamatCabaran,
    getCabaranAktif: getCabaranAktif,
    selesaikanCabaran: selesaikanCabaran
  };
});
