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
   Fasa 2 (PN): PAS (Perlembagaan PAS Pindaan 2025).
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

  var TUTUP_SAYAP_AJK = 'Tiada AJK sayap Cawangan dipilih; sayap Cawangan hanya memilih Ketua dan Timbalan Ketua (Perkara 20.2.3, 20.2.4).';

  var TUTUP_SAYAP_PAS = 'Cawangan PAS hanya memilih Ketua Jawatankuasa Pemuda dan Muslimat dalam Mesyuarat Agung Cawangan.';

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
      wakilCawangan: wakilMCA
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
  function pangkatMin(p, d) { var e = entri(p, d); return e && typeof e.pangkatMin === 'number' ? e.pangkatMin : (d ? d.pangkatMin : 0); }
  /** Bilangan kerusi wakil Cawangan ke Bahagian ikut perlembagaan parti, atau null (guna enjin asas). */
  function wakilCawangan(p, ahli) { var s = untuk(p); return s && s.wakilCawangan ? s.wakilCawangan(ahli) : null; }
  /** Syarat perwakilan ke Perhimpunan Agung: { kod, sebab } atau null. */
  function perwakilanPA(p) { var s = untuk(p); return s && s.perwakilanPA ? s.perwakilanPA : null; }

  return { STRUKTUR: STRUKTUR, untuk: untuk, entri: entri, tersedia: tersedia, sebabTutup: sebabTutup, kerusi: kerusi, lantikan: lantikan, pangkatMin: pangkatMin,
    wakilCawangan: wakilCawangan, perwakilanPA: perwakilanPA, wakilMCA: wakilMCA };
});
