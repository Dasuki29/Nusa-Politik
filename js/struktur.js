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

  /** PAS Fasal 18(5): 4 wakil Kawasan ke Muktamar; +1 bagi setiap 1,000 ahli melebihi 2,000; maks 15. */
  function wakilPAS(ahli) { var n = Number(ahli) || 0; return Math.min(15, 4 + Math.max(0, Math.floor((n - 2000) / 1000))); }

  /** PKR Fasal 17.2(c), 17.2A(c): bukan tahun pemilihan 5 wakil Cabang; tahun pemilihan 40 Perwakilan Biasa + 10 bagi setiap 1,000 anggota melebihi 3,000 (ANDAIAN maks 110 tambahan). */
  function wakilPKR(ahli, p) {
    var E = typeof globalThis !== 'undefined' ? globalThis.MyPolitikElection : null, pilih = !!(E && p && E.adalahTahunPemilihan && E.adalahTahunPemilihan(p.tahun));
    var n = Number(ahli) || 0; return pilih ? 40 + Math.min(110, n > 3000 ? Math.ceil((n - 3000) / 1000) * 10 : 0) : 5;
  }
  /** DAP Fasal VIII.3(a): 25-50 ahli = 2 wakil, 51-100 = +1, +1 bagi setiap 100 ahli seterusnya. */
  function wakilDAP(ahli) { var n = Number(ahli) || 0; if (n < 25) { return 1; } if (n <= 50) { return 2; } return 3 + Math.floor(Math.max(0, n - 100) / 100) + (n > 100 && (n - 100) % 100 ? 1 : 0); }
  /** Amanah Fasal 14.1(d): 5 perwakilan termasuk Ketua (Cawangan ke Kawasan; Kawasan ke Konvensyen Nasional). */
  function wakilAmanah() { return 4; }
  /** v13.89: BERSATU Fasal 18.4.4: seorang wakil Cawangan ke Persidangan Bahagian bagi setiap 30 ahli, maksimum 6 (tambahan jika hadir melebihi 180, dipermudahkan). */
  function wakilBersatuC(ahli) { return Math.max(1, Math.min(6, Math.floor((Number(ahli) || 0) / 30))); }
  /** Fasal 12.4.3: seorang wakil Bahagian ke Perhimpunan Agung bagi setiap 300 ahli, maksimum 7. */
  function wakilBersatuB(ahli) { return Math.max(1, Math.min(7, Math.ceil((Number(ahli) || 0) / 300))); }

  /** v13.63: blok PBB pemain ('pesaka' | 'bumiputera'); lalai Bumiputera. */
  function blokPBB(p) { var SW = typeof globalThis !== 'undefined' ? globalThis.MyPolitikSarawak : null; var b = SW && SW.blokPemain ? SW.blokPemain(p) : (p && p.blokPBB); return b === 'pesaka' ? 'pesaka' : 'bumiputera'; }
  function ikutBlok(pesaka, bumi) { return function (p) { return blokPBB(p) === 'pesaka' ? pesaka : bumi; }; }

  /** v13.65: komuniti PBS ('bbi' Bumiputera Bukan Islam | 'bi' Bumiputera Islam | 'cina'). Lalai ikut Parlimen (ANDAIAN): Cina jika >= 30% pengundi Cina; Bumiputera Islam bagi Parlimen majoriti Islam; selainnya BBI. */
  var PARLIMEN_BI = ['166', '169', '171', '173', '175', '176', '177', '178', '183', '184', '185', '187', '188', '189', '190', '191'];
  function komunitiLalai(kod) {
    var k = String(kod || '').replace(/^P\.?/, ''), G = typeof globalThis !== 'undefined' ? globalThis.MyPolitikGRSData : null, x = G && G.parlimen ? G.parlimen['P.' + k] : null;
    if (x && Number(x.c) >= 30) { return 'cina'; } return PARLIMEN_BI.indexOf(k) >= 0 ? 'bi' : 'bbi';
  }
  function komunitiPBS(p) { var k = p && p.komunitiPBS; return k === 'bi' || k === 'cina' ? k : (k === 'bbi' ? 'bbi' : komunitiLalai(p && p.kod ? p.kod.parlimen : null)); }
  function ikutKomuniti(bbi, bi, cina) { return function (p) { var k = komunitiPBS(p); return k === 'cina' ? cina : k === 'bi' ? bi : bbi; }; }

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
      wakilCawangan: wakilMCA, wakilBahagian: wakilPAMCA,
      tanpaG10: true, g2Kerusi: 5                                                // v13.95: Perhimpunan Agung Pemuda / Wanita MCA (ANDAIAN 5 perwakilan)
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
      wakilBahagian: wakilPAS, gabungMesyuarat: { cawangan: 'sayap_cawangan' }, wakilSayapDilantik: true, g10: 15, tanpaG2: true, wakilDewanPA: 20,   // v13.61: Fasal 18(4)-(5), 19(4)(e), 32(4), 44(2)
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
      wakilBahagian: wakilPKR, hadirSemuaBahagian: true, tanpaG2: true, wakilDewanPA: 50,      // v13.62: Fasal 17.2, 17.2A, 33.2
      tanpaWakilCawangan: 'Mesyuarat Agung Tahunan Cabang terbuka kepada semua anggota Cabang yang menjelaskan yuran; tiada pemilihan wakil Ranting (Fasal 33.2).',
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
      wakilCawangan: wakilDAP, wakilTerusPA: true, jpkpSahaja: true, pusatBerkala: true, tanpaG10: true, tanpaG2: true, sayapKongres: true,   // v13.93: Kongres DAPSY / Wanita DAP Kebangsaan (ANDAIAN)
             // v13.62: Fasal VIII.1(b), VIII.3, IX.1, XIX.1
      jawatan: {
        ajk_cawangan: { kerusi: 7, lantikan: 6, fasal: 'Fasal XXI.3, XXII.1' },             // SU, Pen. SU, Bendahari, SU Publisiti, SU Hal Ehwal Wanita, 2 AJK
        ajk_bahagian: { tutup: 'Ahli JPKP tidak dipilih: Ahli Parlimen, ADUN, Ketua Pemuda, Ketua Wanita dan Pengerusi Cawangan menganggotai JPKP secara automatik' },
        ketua_bahagian: { perlu: PERLU_DAP, pemilih: 'cawangan' }, timbalan_ketua_bahagian: { perlu: PERLU_DAP, pemilih: 'cawangan' }, naib_ketua_bahagian: { perlu: PERLU_DAP, pemilih: 'cawangan' },
        ahli_mkt: { lantikan: 10, fasal: 'Fasal X.1(b)' }
      }
    },
    BERSATU: {
      sumber: 'Perlembagaan BERSATU',
      wakilCawangan: wakilBersatuC, wakilBahagian: wakilBersatuB, wakilDewanPA: 20,                                       // v13.89: Fasal 12.4.3, 12.4.5, 18.4.4
      jawatan: {
        ajk_cawangan: { kerusi: 8, lantikan: 3, fasal: 'Fasal 21.1.8, 21.1.9' },
        ajk_bahagian: { kerusi: 10, lantikan: 4, pemilih: 'ahli', fasal: 'Fasal 19.1.7, 19.1.8, 20.5.2' },
        naib_ketua_bahagian: { kerusi: 1, pemilih: 'ahli', fasal: 'Fasal 19.1.3, 20.5.2' },        // 3 Naib Ketua termasuk Ketua Srikandi dan Ketua Armada
        timbalan_ketua_bahagian: { pemilih: 'ahli' }, ketua_bahagian: { pemilih: 'ahli' },     // dipilih oleh ahli di Persidangan Cawangan (Fasal 20.5.2)
        naib_presiden: { kerusi: 3, fasal: 'Fasal 13.2.4, 13.3' },
        ahli_mkt: { kerusi: 20, lantikan: 7, fasal: 'Fasal 13.2.8, 13.2.10' }
      }
    },
    AMANAH: {
      sumber: 'Perlembagaan Parti Amanah Negara (2022)',
      wakilCawangan: wakilAmanah, wakilBahagian: wakilAmanah, gabungMesyuarat: { cawangan: 'sayap_cawangan' }, wakilSayapDilantik: true, g10: 20, tanpaG2: true, wakilDewanPA: 20,   // v13.62: Fasal 12.1, 14.1(d), 14.3, 17.4(d)
      jawatan: {
        ajk_cawangan: { kerusi: 11, lantikan: 4, fasal: 'Fasal 17.4' },
        ketua_cawangan: { perlu: PERLU_AMANAH_C, pemilih: 11 }, naib_ketua_cawangan: { perlu: PERLU_AMANAH_C, pemilih: 11 },
        ajk_bahagian: { kerusi: 15, lantikan: 8, fasal: 'Fasal 17.3' },
        naib_ketua_bahagian: { kerusi: 2, lantikan: 1, perlu: PERLU_AMANAH_K, pemilih: 18 },
        ketua_bahagian: { perlu: PERLU_AMANAH_K, pemilih: 18 }, timbalan_ketua_bahagian: { perlu: PERLU_AMANAH_K, pemilih: 18 },
        'sayap_naib_cawangan_*': { tutup: TUTUP_SAYAP_AMANAH }, 'sayap_ajk_cawangan_*': { tutup: TUTUP_SAYAP_AMANAH }
      }
    },
    PBB: {
      sumber: 'Wikipedia (Majlis Tertinggi PBB 2025-2028)', pusatBerkala: 'pemilihan', bilBahagian: 82,   // v13.64: Perhimpunan Agung setiap 3 tahun (Wikipedia)
      jawatan: {
        naib_presiden_kanan: { buka: true },                                            // 1 setiap blok; pemain bertanding kerusi bloknya
        naib_presiden: { kerusi: ikutBlok(3, 4) },                                      // Pesaka 3, Bumiputera 4
        ahli_mkt: { kerusi: ikutBlok(14, 16), lantikan: ikutBlok(11, 9) }               // dipilih Pesaka 14 / Bumiputera 16; dilantik 11 / 9
      }
    },
    PRS: {
      sumber: 'Wikipedia (ANDAIAN)', kitaran: { mula: 2025, tahun: 3 }, bilBahagian: 34,
      jawatan: {
        ajk_cawangan: { kerusi: 9 }, ajk_bahagian: { kerusi: 15 },
        naib_ketua_bahagian: { tutup: 'Bahagian PRS memilih Ketua, Timbalan Ketua dan AJK sahaja (andaian permainan).' },
        ahli_mkt: { kerusi: 20 }
      }
    },
    SUPP: {
      sumber: 'Wikipedia (ANDAIAN)', hadPenggalPresiden: 3, bilBahagian: 20,
      jawatan: {
        timbalan_presiden: { kerusi: 2 }, naib_presiden: { kerusi: 4 },
        ahli_mkt: { kerusi: 6, lantikan: 5, pemilih: 40 }                               // dipilih oleh Jawatankuasa Pusat; 3 cawangan bukan kawasan + 2 lantikan Presiden
      }
    },
    PDP: {
      sumber: 'Wikipedia (ANDAIAN)', bilBahagian: 15,
      jawatan: { naib_presiden_kanan: { buka: true, kerusi: 3 }, naib_presiden: { kerusi: 2 }, ahli_mkt: { kerusi: 20 } }
    },
    BERJASA: {
      sumber: 'Wikipedia (ANDAIAN)',
      jawatan: { ajk_cawangan: { kerusi: 9 }, ajk_bahagian: { kerusi: 15 }, naib_ketua_bahagian: { tutup: 'Bahagian parti ini memilih Ketua, Timbalan Ketua dan AJK sahaja (andaian permainan).' }, ahli_mkt: { kerusi: 15 } }
    },
    WARISAN: { sumber: 'Wikipedia (ANDAIAN)', jawatan: { ahli_mkt: { kerusi: 20 } } },
    GAGASAN: { sumber: 'Wikipedia (ANDAIAN)', jawatan: { ahli_mkt: { kerusi: 18 } } },
    PBS: {
      sumber: 'Wikipedia (Majlis Eksekutif PBS 2026-2029)', kitaran: { mula: 2026, tahun: 3 },
      jawatan: {
        timbalan_presiden: { kerusi: 1 },                                               // 3 Timbalan: seorang setiap komuniti; pemain bertanding kerusi komunitinya
        naib_presiden: { kerusi: ikutKomuniti(2, 2, 1) }, ahli_mkt: { kerusi: ikutKomuniti(7, 5, 4) },
        sayap_timbalan_pusat_wanita: { buka: true }                                     // Timbalan Ketua Wanita ikut komuniti
      }
    },
    UPKO: { sumber: 'Wikipedia (Majlis Tertinggi UPKO 2026-2029)', kitaran: { mula: 2026, tahun: 3 }, jawatan: { naib_presiden: { kerusi: 9 }, ahli_mkt: { kerusi: 19 } } },
    LDP: { sumber: 'Wikipedia (Majlis Tertinggi LDP 2021-2024)', kitaran: { mula: 2024, tahun: 3 }, jawatan: { naib_presiden: { kerusi: 7 }, ahli_mkt: { kerusi: 12 } } },
    PHRS: {
      sumber: 'Wikipedia (ANDAIAN)',
      jawatan: { ajk_cawangan: { kerusi: 9 }, ajk_bahagian: { kerusi: 15 }, naib_ketua_bahagian: { tutup: 'Bahagian parti ini memilih Ketua, Timbalan Ketua dan AJK sahaja (andaian permainan).' }, naib_presiden: { kerusi: 2 }, ahli_mkt: { kerusi: 10 } }
    },
    PCS: {
      sumber: 'Wikipedia (Mesyuarat Agung Dwitahunan)', kitaran: { mula: 2026, tahun: 2 }, pusatBerkala: 'pemilihan',
      jawatan: { ajk_cawangan: { kerusi: 9 }, ajk_bahagian: { kerusi: 15 }, naib_ketua_bahagian: { tutup: 'Bahagian parti ini memilih Ketua, Timbalan Ketua dan AJK sahaja (andaian permainan).' }, naib_presiden: { kerusi: 3 }, ahli_mkt: { kerusi: 15 } }
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
  function nilai(x, p) { return typeof x === 'function' ? x(p) : x; }
  function kerusi(p, d) { var e = entri(p, d); return e && e.kerusi ? nilai(e.kerusi, p) : null; }
  /** Bilangan kerusi AJK lantikan (1/3 dilantik Ketua / Yang Dipertua / Presiden) bagi jawatan d, atau 0. */
  function lantikan(p, d) { var e = entri(p, d); return e && e.lantikan ? nilai(e.lantikan, p) : 0; }
  /** Syarat jawatan mesti dipegang dahulu: { kod:[...], sebab } atau null. */
  function perlu(p, d) { var e = entri(p, d); return e && e.perlu ? e.perlu : null; }
  /** Pengundi khas: 'ahli' (semua anggota Bahagian), 'cawangan' (ahli jawatankuasa = bilangan Cawangan + 4), nombor tetap, atau null. */
  function pemilih(p, d) { var e = entri(p, d); return e && e.pemilih ? e.pemilih : null; }
  function pangkatMin(p, d) { var e = entri(p, d); return e && typeof e.pangkatMin === 'number' ? e.pangkatMin : (d ? d.pangkatMin : 0); }
  /** Bilangan kerusi wakil Cawangan ke Bahagian ikut perlembagaan parti, atau null (guna enjin asas). */
  function wakilCawangan(p, ahli) { var s = untuk(p); return s && s.wakilCawangan ? s.wakilCawangan(ahli) : null; }
  /** Bilangan wakil Bahagian ke Perhimpunan Agung ikut perlembagaan parti, atau null. */
  function wakilBahagian(p, ahli) { var s = untuk(p); return s && s.wakilBahagian ? s.wakilBahagian(ahli, p) : null; }
  /** v13.61: tetapan mesyuarat parti: gabungMesyuarat, wakilSayapDilantik, g10, tanpaG2, wakilDewanPA (atau null). v13.93: tanpaG10, sayapKongres (DAP). */
  function mesyuarat(p, k) { var s = untuk(p); return s && s[k] != null ? s[k] : null; }
  /** Had jumlah perwakilan Perhimpunan Agung (MIC Perkara 74.1: 2,000), atau null. */
  function hadPA(p) { var s = untuk(p); return s && s.hadPA ? s.hadPA : null; }
  /** Syarat perwakilan ke Perhimpunan Agung: { kod, sebab } atau null. */
  function perwakilanPA(p) { var s = untuk(p); return s && s.perwakilanPA ? s.perwakilanPA : null; }

  return { STRUKTUR: STRUKTUR, untuk: untuk, entri: entri, tersedia: tersedia, sebabTutup: sebabTutup, kerusi: kerusi, lantikan: lantikan, perlu: perlu, pemilih: pemilih, pangkatMin: pangkatMin,
    wakilCawangan: wakilCawangan, wakilBahagian: wakilBahagian, hadPA: hadPA, mesyuarat: mesyuarat, blokPBB: blokPBB, komunitiPBS: komunitiPBS, komunitiLalai: komunitiLalai, wakilPAS: wakilPAS, wakilPKR: wakilPKR, wakilDAP: wakilDAP, perwakilanPA: perwakilanPA, wakilMCA: wakilMCA, wakilPAMCA: wakilPAMCA, wakilMIC: wakilMIC, wakilPAMIC: wakilPAMIC };
});
