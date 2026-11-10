/* ==========================================================================
   Nusa Politik — js/struktur.js   (v13.57)
   Struktur jawatan dipilih MENGIKUT PARTI (audit enjin pemilihan, Fasa 1: BN).
   Katalog asas (js/jawatan.js) ikut Perlembagaan UMNO 2025. Jadual di bawah mengubah katalog itu bagi parti lain
   supaya setiap parti mempunyai enjin pemilihan sendiri:
     tutup     : jawatan tiada dalam perlembagaan parti (tidak dipertandingkan; pemegang lama kekal hingga penggal tamat)
     buka      : jawatan khas yang tiada dalam UMNO (katalog `khas: true`) dibuka untuk parti ini
     kerusi    : bilangan kerusi dipilih
     pangkatMin: syarat tangga jawatan (jika berbeza)
   Juga: wakilCawangan (bilangan wakil Cawangan ke Bahagian) dan perwakilanPA (siapa boleh menjadi perwakilan ke Perhimpunan Agung).
     lantikan  : kerusi AJK lantikan; calon kalah dalam lingkungan kerusi + lantikan berpeluang dilantik (js/election.js)
   Fasa 2 (PN): PAS (Perlembagaan PAS Pindaan 2025). Fasa 3 (PH): PKR (2025), DAP (2019), Amanah (2022).
     perlu     : jawatan yang mesti dipegang dahulu; pemilih: 'ahli' | 'cawangan' | nombor (pengundi khas)
   Rujukan: Perlembagaan MCA (pindaan 2019), Perlembagaan MIC (2017); PPP dan PBRS daripada Wikipedia (ANDAIAN ⚠️).
   Permainan simulasi; bukan laman rasmi parti.
   ========================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikStruktur = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /** MCA Perkara 94: 3 wakil bagi 50 ahli pertama, kemudian 1/25 (150 seterusnya), 1/50 (300), 1/100 (900), 1/300 (600), 1/500 (baki); maks 30.
      Satu kerusi dikhaskan untuk Wanita (94.7), jadi kerusi terbuka = jumlah − 1. */
  function wakilMCA(ahli) {
    var n = Math.max(0, Number(ahli) || 0), w = 3, baki = Math.max(0, n - 50);
    [[150, 25], [300, 50], [900, 100], [600, 300], [Infinity, 500]].forEach(function (t) { var a = Math.min(baki, t[0]); w += Math.floor(a / t[1]); baki -= a; });
    return Math.max(2, Math.min(30, w) - 1);
  }

  /** MCA Perkara 67: 3 wakil bagi 500 ahli pertama, kemudian 1/300 (1,500 seterusnya), 1/500 (3,000), 1/1,000 (10,000), 1/3,000 (6,000), 1/5,000 (baki); maks 30; 1 dikhaskan Wanita. */
  function wakilPAMCA(ahli) {
    var n = Math.max(0, Number(ahli) || 0), w = 3, baki = Math.max(0, n - 500);
    [[1500, 300], [3000, 500], [10000, 1000], [6000, 3000], [Infinity, 5000]].forEach(function (t) { var a = Math.min(baki, t[0]); w += Math.floor(a / t[1]); baki -= a; });
    return Math.max(2, Math.min(30, w) - 1);
  }
  /** MIC Perkara 75.1: 1 wakil bagi 60 ahli pertama dan 1 bagi setiap 60 ahli seterusnya (tiada had). */
  function wakilMIC(ahli) { return Math.max(1, Math.floor((Number(ahli) || 0) / 60)); }
  /** MIC Perkara 74.1: 1 wakil Perhimpunan Agung bagi setiap 250 ahli Bahagian. */
  function wakilPAMIC(ahli) { return Math.max(1, Math.floor((Number(ahli) || 0) / 250)); }

  var TUTUP_SAYAP_AJK = 'Tiada AJK sayap Cawangan dipilih; sayap Cawangan hanya memilih Ketua dan Timbalan Ketua (Perkara 20.2.3, 20.2.4).';

  var TUTUP_SAYAP_PAS = 'Cawangan PAS hanya memilih Ketua Jawatankuasa Pemuda dan Muslimat dalam Mesyuarat Agung Cawangan.';

  var PERLU_DAP = { kod: ['ketua_cawangan'], sebab: 'Pegawai JPKP dipilih daripada kalangan anggota JPKP: jadilah Pengerusi Cawangan dahulu' };
  var PERLU_AMANAH_C = { kod: ['ajk_cawangan', 'naib_ketua_cawangan', 'ketua_cawangan'], sebab: 'Ketua dan Timbalan Ketua Cawangan dipilih oleh 11 AJK daripada kalangan mereka: menangi AJK Cawangan dahulu' };
  var PERLU_AMANAH_K = { kod: ['ajk_bahagian', 'naib_ketua_bahagian', 'timbalan_ketua_bahagian', 'ketua_bahagian'], sebab: 'Pimpinan Kawasan dipilih oleh 15 AJK dan 3 ketua sayap daripada kalangan AJK: menangi AJK Kawasan dahulu' };
  var TUTUP_SAYAP_AMANAH = 'Ketua AWAN, Pemuda Amanah dan WARDA Cawangan dilantik oleh Ketua Cawangan; tiada Naib atau AJK sayap Cawangan dipilih';

  var STRUKTUR = {
    MCA: {
      sumber: 'Perlembagaan MCA (pindaan 2019)',
      jawatan: {
        ajk_cawangan: { kerusi: 10, fasal: 'Perkara 102' },                          // 5-10 ahli jawatankuasa dipilih
        naib_pengerusi_cawangan: { buka: true, fasal: 'Perkara 102' },               // 1 Naib Pengerusi dipilih
        naib_ketua_bahagian: { kerusi: 4, fasal: 'Perkara 76.4' },                   // 4 Naib Pengerusi dipilih (+2 ketua sayap)
        ajk_bahagian: { kerusi: 10, fasal: 'Perkara 76.10' },
        naib_presiden: { kerusi: 4, fasal: 'Perkara 20' },
        ahli_mkt: { kerusi: 25, fasal: 'Perkara 20' }
      },
      wakilCawangan: wakilMCA, wakilBahagian: wakilPAMCA
    },
    MIC: {
      sumber: 'Perlembagaan MIC (2017)',
      jawatan: {
        ajk_cawangan: { kerusi: 7, fasal: 'Perkara 20.2.2' },
        naib_ketua_bahagian: { tutup: 'Persidangan Perwakilan Bahagian MIC hanya memilih Pengerusi dan Timbalan Pengerusi (Perkara 33.3).' },
        ajk_bahagian: { tutup: 'Tiada AJK Bahagian dipilih; Pengerusi Cawangan menganggotai Kongres Bahagian (Perkara 33.3, 36).' },
        timbalan_ketua_bahagian: { pangkatMin: 3 },
        ketua_bahagian: { pangkatMin: 3 },
        ahli_mkt: { kerusi: 21, pangkatMin: 3, fasal: 'Perkara 47' },               // 21 Ahli CWC dipilih
        'sayap_ajk_cawangan_*': { tutup: TUTUP_SAYAP_AJK }
      },
      wakilCawangan: wakilMIC, wakilBahagian: wakilPAMIC, hadPA: 2000,
      perwakilanPA: { kod: 'ketua_cawangan', sebab: 'Hanya Pengerusi Cawangan boleh dipilih sebagai perwakilan ke Perhimpunan Agung, secara giliran (Perkara 74.4, 74.5).' }
    },
    PAS: {
      sumber: 'Perlembagaan PAS (Pindaan 2025)',
      jawatan: {
        ajk_cawangan: { kerusi: 8, lantikan: 4, fasal: 'Fasal 44(2), 44(4)' },              // 2/3 daripada 12 dipilih, 1/3 dilantik Ketua
        ajk_bahagian: { kerusi: 16, lantikan: 8, fasal: 'Fasal 41(5)' },                    // 2/3 daripada 24 dipilih, 1/3 dilantik Yang Dipertua
        ahli_mkt: { kerusi: 18, lantikan: 8, fasal: 'Fasal 38(5)' },                        // 18 dipilih Muktamar, 8 dilantik Presiden
        'sayap_naib_cawangan_*': { tutup: TUTUP_SAYAP_PAS }, 'sayap_ajk_cawangan_*': { tutup: TUTUP_SAYAP_PAS },
        'sayap_timbalan_bahagian_*': { buka: true, fasal: 'Fasal 67(3), 68' }, 'sayap_timbalan_pusat_*': { buka: true, fasal: 'Fasal 57(4), 58' },
        'sayap_ajk_bahagian_*': { kerusi: 12 }, 'sayap_ajk_pusat_*': { kerusi: 22 }         // ANDAIAN: semua AJK Dewan dipilih
      }
    },
    PKR: {
      sumber: 'Perlembagaan PKR (11 Mac 2025)',
      jawatan: {
        ajk_bahagian: { kerusi: 15, lantikan: 5, pemilih: 'ahli', fasal: 'Fasal 37.4, 37.6' },
        naib_ketua_bahagian: { kerusi: 1, lantikan: 2, pemilih: 'ahli', fasal: 'Fasal 37.4, 37.6' },
        timbalan_ketua_bahagian: { pemilih: 'ahli' }, ketua_bahagian: { pemilih: 'ahli' },     // dipilih oleh anggota Cabang (Fasal 37.4)
        naib_presiden: { kerusi: 4, lantikan: 3, fasal: 'Fasal 21.4, 21.7' },
        ahli_mkt: { kerusi: 20, lantikan: 7, fasal: 'Fasal 21.4, 21.7' },
        'sayap_timbalan_bahagian_*': { buka: true, fasal: 'Fasal 17.2A(c)' }, 'sayap_timbalan_pusat_*': { buka: true, fasal: 'Fasal 21.5, 21.6' },
        sayap_ajk_bahagian_wanita: { kerusi: 7, fasal: 'Fasal 17.2A(c)' }
      }
    },
    DAP: {
      sumber: 'Perlembagaan DAP (2019)',
      jawatan: {
        ajk_cawangan: { kerusi: 7, lantikan: 6, fasal: 'Fasal XXI.3, XXII.1' },             // SU, Pen. SU, Bendahari, SU Publisiti, SU Hal Ehwal Wanita, 2 AJK
        ajk_bahagian: { tutup: 'Ahli JPKP tidak dipilih: Ahli Parlimen, ADUN, Ketua Pemuda, Ketua Wanita dan Pengerusi Cawangan menganggotai JPKP secara automatik' },
        ketua_bahagian: { perlu: PERLU_DAP, pemilih: 'cawangan' }, timbalan_ketua_bahagian: { perlu: PERLU_DAP, pemilih: 'cawangan' }, naib_ketua_bahagian: { perlu: PERLU_DAP, pemilih: 'cawangan' },
        ahli_mkt: { lantikan: 10, fasal: 'Fasal X.1(b)' }
      }
    },
    AMANAH: {
      sumber: 'Perlembagaan Parti Amanah Negara (2022)',
      jawatan: {
        ajk_cawangan: { kerusi: 11, lantikan: 4, fasal: 'Fasal 17.4' },
        ketua_cawangan: { perlu: PERLU_AMANAH_C, pemilih: 11 }, naib_ketua_cawangan: { perlu: PERLU_AMANAH_C, pemilih: 11 },
        ajk_bahagian: { kerusi: 15, lantikan: 8, fasal: 'Fasal 17.3' },
        naib_ketua_bahagian: { kerusi: 2, lantikan: 1, perlu: PERLU_AMANAH_K, pemilih: 18 },
        ketua_bahagian: { perlu: PERLU_AMANAH_K, pemilih: 18 }, timbalan_ketua_bahagian: { perlu: PERLU_AMANAH_K, pemilih: 18 },
        'sayap_naib_cawangan_*': { tutup: TUTUP_SAYAP_AMANAH }, 'sayap_ajk_cawangan_*': { tutup: TUTUP_SAYAP_AMANAH }
      }
    },
    PPP: {
      sumber: 'Wikipedia (ANDAIAN)',
      jawatan: {
        ajk_cawangan: { kerusi: 7 },
        naib_ketua_bahagian: { tutup: 'Bahagian PPP memilih Pengerusi, Timbalan Pengerusi dan AJK sahaja (andaian permainan).' },
        ajk_bahagian: { kerusi: 9 },
        timbalan_presiden: { tutup: 'PPP tiada jawatan Timbalan Presiden; barisan kepimpinan ialah Presiden dan Naib Presiden (Wikipedia).' },
        naib_presiden: { kerusi: 3 },
        ahli_mkt: { kerusi: 15 }                                                       // Majlis Tertinggi
      }
    },
    PBRS: {
      sumber: 'Wikipedia (ANDAIAN)',
      jawatan: {
        ajk_cawangan: { kerusi: 7 },
        naib_ketua_bahagian: { tutup: 'Bahagian PBRS memilih Ketua, Timbalan Ketua dan AJK sahaja (andaian permainan).' },
        ajk_bahagian: { kerusi: 9 },
        naib_presiden: { kerusi: 2 },
        ahli_mkt: { kerusi: 15 }                                                       // Majlis Tertinggi
      }
    }
  };

  function untuk(p) { var k = p && p.parti; return k && STRUKTUR[k] ? STRUKTUR[k] : null; }
  /** Entri jadual bagi jawatan d (atau kod) untuk parti pemain; padanan tepat, kemudian corak 'awalan_*'. */
  function entri(p, d) {
    var s = untuk(p), kod = d && d.kod ? d.kod : d; if (!s || !kod) { return null; }
    if (s.jawatan[kod]) { return s.jawatan[kod]; }
    for (var k in s.jawatan) { if (k.slice(-1) === '*' && kod.indexOf(k.slice(0, -1)) === 0) { return s.jawatan[k]; } }
    return null;
  }
  /** Adakah jawatan d dipertandingkan dalam parti pemain? Jawatan khas (d.khas) tertutup kecuali dibuka. */
  function tersedia(p, d) { var e = entri(p, d); if (e && e.tutup) { return false; } return d && d.khas ? !!(e && e.buka) : true; }
  function sebabTutup(p, d) { var e = entri(p, d); return e && e.tutup ? e.tutup : ''; }
  function kerusi(p, d) { var e = entri(p, d); return e && e.kerusi ? e.kerusi : null; }
  /** Bilangan kerusi AJK lantikan (1/3 dilantik Ketua / Yang Dipertua / Presiden) bagi jawatan d, atau 0. */
  function lantikan(p, d) { var e = entri(p, d); return e && e.lantikan ? e.lantikan : 0; }
  /** Syarat jawatan mesti dipegang dahulu: { kod:[...], sebab } atau null. */
  function perlu(p, d) { var e = entri(p, d); return e && e.perlu ? e.perlu : null; }
  /** Pengundi khas: 'ahli' (semua anggota Bahagian), 'cawangan' (ahli jawatankuasa = bilangan Cawangan + 4), nombor tetap, atau null. */
  function pemilih(p, d) { var e = entri(p, d); return e && e.pemilih ? e.pemilih : null; }
  function pangkatMin(p, d) { var e = entri(p, d); return e && typeof e.pangkatMin === 'number' ? e.pangkatMin : (d ? d.pangkatMin : 0); }
  /** Bilangan kerusi wakil Cawangan ke Bahagian ikut perlembagaan parti, atau null (guna enjin asas). */
  function wakilCawangan(p, ahli) { var s = untuk(p); return s && s.wakilCawangan ? s.wakilCawangan(ahli) : null; }
  /** Bilangan wakil Bahagian ke Perhimpunan Agung ikut perlembagaan parti, atau null. */
  function wakilBahagian(p, ahli) { var s = untuk(p); return s && s.wakilBahagian ? s.wakilBahagian(ahli) : null; }
  /** Had jumlah perwakilan Perhimpunan Agung (MIC Perkara 74.1: 2,000), atau null. */
  function hadPA(p) { var s = untuk(p); return s && s.hadPA ? s.hadPA : null; }
  /** Syarat perwakilan ke Perhimpunan Agung: { kod, sebab } atau null. */
  function perwakilanPA(p) { var s = untuk(p); return s && s.perwakilanPA ? s.perwakilanPA : null; }

  return { STRUKTUR: STRUKTUR, untuk: untuk, entri: entri, tersedia: tersedia, sebabTutup: sebabTutup, kerusi: kerusi, lantikan: lantikan, perlu: perlu, pemilih: pemilih, pangkatMin: pangkatMin,
    wakilCawangan: wakilCawangan, wakilBahagian: wakilBahagian, hadPA: hadPA, perwakilanPA: perwakilanPA, wakilMCA: wakilMCA, wakilPAMCA: wakilPAMCA, wakilMIC: wakilMIC, wakilPAMIC: wakilPAMIC };
});
