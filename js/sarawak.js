/* ==========================================================================
   Nusa Politik — js/sarawak.js   (v8.33; v9.0 imbangan sayap dalaman; v9.1 Premier & Exco; v9.3 rundingan kerusi GPS; v9.4 kerusi Parlimen & PRU)
   PRN Sarawak untuk pemain PBB: jadual pilihan raya, kekuatan kerusi DUN mengikut komposisi etnik dan parti lawan mengikut kawasan.
   Data DUN (pemilih, peratus etnik) daripada data/pbb-dun.json (dibina oleh tools/build-pbb.js) disimpan dalam profil (p.dunInfo) semasa pendaftaran.
   v9.0: IMBANGAN SAYAP DALAMAN PBB. Pemain PBB ialah ahli blok Bumiputera atau Pesaka (p.blokPBB, dipilih semasa mendaftar).
     Jawatan Pusat dibahagi antara dua blok: Presiden mengikut GILIRAN (blok bertukar setiap 5 tahun: Bumiputera 2026 hingga 2030, Pesaka 2031 hingga 2035, dan seterusnya),
     Timbalan Presiden daripada blok yang satu lagi. Blok anda dalam giliran: pesaing lebih lemah (-6); bukan giliran anda: pesaing lebih kuat (+10 Presiden, +10 Timbalan Presiden jika blok sama dengan Presiden).
     "Sokongan antara blok" (0 hingga 100, mula 30, susut 1 sebulan sehingga 30) mengurangkan kelemahan blok dan memberi sedikit bonus di semua jawatan Pusat.
   ANDAIAN (semua nombor ialah penyeimbang simulasi, bukan ramalan atau data keputusan sebenar):
     - PRN pertama tahun 2027, bulan ditentukan secara tetap daripada ID pemain; kitaran 5 tahun (pru.js).
     - Kerusi majoriti Cina: -12 (Sukar) atau -5 (Marginal) pada sokongan asas; kerusi Bumiputera tinggi (85% ke atas): +5 (Selamat).
     - Label parti lawan ikut komposisi kawasan; label simulasi sahaja.
   ========================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikSarawak = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function () {
  'use strict';
  /** v10.0: parti Sarawak (PBB mod penuh; PRS dan lain-lain mod ringan) guna enjin Sarawak yang sama. */
  function SW(k) { return k === 'PBB' || k === 'PRS'; }
  var CONFIG = {
    TAHUN_PRN: 2027,
    CINA: { sukar: 50, marginal: 30 }, OFSET: { sukar: -12, marginal: -5, biasa: 0, selamat: 5 }, BUMI_SELAMAT: 85, BANDAR_CINA: 40
  };
  var TAHAP = { sukar: 'Sukar', marginal: 'Marginal', biasa: 'Sederhana', selamat: 'Selamat' };
  function hash(t) { var h = 7; t = String(t || ''); for (var i = 0; i < t.length; i++) { h = (h * 31 + t.charCodeAt(i)) >>> 0; } return h; }

  /** Jadual PRN: { tahun, bulan }. */
  function jadual(p) { return { tahun: CONFIG.TAHUN_PRN, bulan: 1 + hash((p && (p.id || p.nama)) || 'pbb') % 12 }; }

  /** Ringkasan kerusi DUN pemain PBB, atau null jika bukan PBB / tiada data. */
  function maklumat(p) {
    var d = p && SW(p.parti) && p.dunInfo ? p.dunInfo : null; if (!d || !d.e) { return null; }
    var e = d.e, dayak = Math.round((e.iban + e.bidayuh + e.orangUlu) * 10) / 10, bumi = Math.round((100 - e.cina - e.india - e.lain) * 10) / 10;
    var tahap = e.cina >= CONFIG.CINA.sukar ? 'sukar' : e.cina >= CONFIG.CINA.marginal ? 'marginal' : bumi >= CONFIG.BUMI_SELAMAT ? 'selamat' : 'biasa';
    var profil = e.cina >= CONFIG.BANDAR_CINA ? 'URBAN' : bumi >= 80 ? 'RURAL' : 'MIXED';
    var lawan = e.cina >= CONFIG.BANDAR_CINA ? ['DAP', 'PSB'] : dayak >= 50 ? ['PSB', 'PKR'] : e.melayu >= 50 ? ['PKR', 'PAS'] : ['PKR', 'PSB'];
    return { nama: d.nama, parlimen: d.parlimen, pemilih: d.pemilih, bil: d.bil, melayu: e.melayu, cina: e.cina, india: e.india, dayak: dayak, bumi: bumi, lain: e.lain,
      tahap: tahap, tahapNama: TAHAP[tahap], ofset: CONFIG.OFSET[tahap], profil: profil, lawan: lawan };
  }

  /* ---------- v9.0: imbangan blok Bumiputera / Pesaka ---------- */
  var BLOK = { bumiputera: { kod: 'bumiputera', nama: 'Bumiputera', ikon: '🌴' }, pesaka: { kod: 'pesaka', nama: 'Pesaka', ikon: '🛶' } };
  var BLOK_CFG = { TAHUN_MULA: 2026, GILIRAN_TAHUN: 5, SOKONGAN_MULA: 30, SOKONGAN_TAMBAH: 12, DEKATI_AP: 3, DEKATI_MYR: 1500,
    PENALTI: { presiden_giliran: -6, presiden_bukan: 10, tp_giliran: -6, tp_bukan: 10 }, KURANG_PENALTI: 0.08, BONUS_UMUM: 0.03 };
  function idxBulan(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function sahBlok(k) { return k === 'bumiputera' || k === 'pesaka'; }
  function blokLalai(info) { var e = info && info.e; return e && (e.iban + e.bidayuh + e.orangUlu) > e.melayu ? 'pesaka' : 'bumiputera'; }
  function blokPemain(p) { return p && p.parti === 'PBB' && sahBlok(p.blokPBB) ? p.blokPBB : null; }
  /** Blok yang memegang giliran Presiden pada tahun tertentu. */
  function giliran(tahun) { return Math.floor(((parseInt(tahun, 10) || BLOK_CFG.TAHUN_MULA) - BLOK_CFG.TAHUN_MULA) / BLOK_CFG.GILIRAN_TAHUN) % 2 === 0 ? 'bumiputera' : 'pesaka'; }
  function lain(b) { return b === 'bumiputera' ? 'pesaka' : 'bumiputera'; }
  /** Sokongan antara blok semasa (susut 1 sebulan, tidak bawah 30). */
  function sokongan(p) {
    var x = p && p.blokSokong, mula = BLOK_CFG.SOKONGAN_MULA; if (!x || !isFinite(Number(x.nilai))) { return mula; }
    return Math.max(mula, Math.round(Number(x.nilai) - Math.max(0, idxBulan(p) - (Number(x.idx) || 0))));
  }
  /** Ofset aras pesaing bagi jawatan Pusat (positif = lebih sukar). Definisi jawatan: { kod, peringkat, kumpulan }. */
  function ofsetJawatan(p, d) {
    var b = blokPemain(p); if (!b || !d || (d.peringkat !== 'pusat' && d.peringkat !== 'pau') || (d.kumpulan && d.kumpulan !== 'utama')) { return 0; }
    var g = giliran(p.tahun), s = sokongan(p), asas = 0, C = BLOK_CFG.PENALTI;
    if (d.kod === 'presiden') { asas = b === g ? C.presiden_giliran : C.presiden_bukan; }
    else if (d.kod === 'timbalan_presiden') { asas = b !== g ? C.tp_giliran : C.tp_bukan; }
    var h = asas > 0 ? Math.max(0, asas - s * BLOK_CFG.KURANG_PENALTI) : asas - s * BLOK_CFG.BONUS_UMUM;
    return Math.round(h * 10) / 10;
  }
  function ringkasBlok(p) {
    var b = blokPemain(p); if (!b) { return null; }
    var g = giliran(p.tahun), s = sokongan(p), n = idxBulan(p), sudah = p.blokSokong && Number(p.blokSokong.dekati) === n;
    return { blok: b, nama: BLOK[b].nama, ikon: BLOK[b].ikon, giliran: g, giliranNama: BLOK[g].nama, tpNama: BLOK[lain(g)].nama, giliranTahun: BLOK_CFG.GILIRAN_TAHUN,
      sokongan: s, dalamGiliran: b === g, sudahBulanIni: !!sudah,
      ofsetPresiden: ofsetJawatan(p, { kod: 'presiden', peringkat: 'pusat' }), ofsetTP: ofsetJawatan(p, { kod: 'timbalan_presiden', peringkat: 'pusat' }), ofsetNaib: ofsetJawatan(p, { kod: 'naib_presiden', peringkat: 'pusat' }) };
  }
  /** Dekati blok lain: sekali sebulan. Pulang { ok, mesej | ralat }. */
  function dekati() {
    var Sv = typeof globalThis !== 'undefined' && globalThis.MyPolitikSave ? globalThis.MyPolitikSave : require('./save.js'), p = Sv.loadPlayer(), b = blokPemain(p);
    if (!b) { return { ok: false, ralat: 'Hanya untuk pemain PBB.' }; }
    var n = idxBulan(p); if (p.blokSokong && Number(p.blokSokong.dekati) === n) { return { ok: false, ralat: 'Sudah dilakukan bulan ini.' }; }
    if ((Number(p.ap) || 0) < BLOK_CFG.DEKATI_AP) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
    if (Sv.cukupDana && !Sv.cukupDana(p, BLOK_CFG.DEKATI_MYR)) { return { ok: false, ralat: Sv.ralatDana ? Sv.ralatDana(p, BLOK_CFG.DEKATI_MYR) : 'Dana tidak mencukupi.' }; }
    var baru = Math.min(100, sokongan(p) + BLOK_CFG.SOKONGAN_TAMBAH);
    var r = Sv.applyEffects({ ap: -BLOK_CFG.DEKATI_AP, myr: -BLOK_CFG.DEKATI_MYR }, { kiraTindakan: false, patch: { blokSokong: { nilai: baru, idx: n, dekati: n } }, log: { tindakan: 'blok_dekati', nama: 'Dekati blok ' + BLOK[lain(b)].nama, peringkat: 'bulan' } });
    return r && r.ok ? { ok: true, mesej: 'Anda mendekati pemimpin blok ' + BLOK[lain(b)].nama + '. Sokongan antara blok ' + baru + '/100 (-' + BLOK_CFG.DEKATI_AP + ' AP, -RM ' + BLOK_CFG.DEKATI_MYR.toLocaleString('en') + ').' } : { ok: false, ralat: (r && r.ralat) || 'Gagal.' };
  }
  /* ---------- v9.4: kerusi Parlimen & musim PRU ----------
     PBB bertanding dua jenis pilihan raya berasingan: PRN (kerusi DUN) dan PRU (kerusi Parlimen). Kitaran 5 tahun masing-masing.
     ANDAIAN: PRN 2027, PRU setahun kemudian (2028), kemudian PRN 4 tahun selepas PRU (2032), PRU 2033, dan seterusnya. Bulan PRU ditetapkan daripada ID pemain.
     Kerusi Parlimen pemain ialah Parlimen yang mengandungi DUN mereka (31 Parlimen Sarawak). Kekuatan kerusi ikut komposisi etnik wajaran pemilih
     (sama peraturan DUN). Data Parlimen daripada data/pbb-dun.json (`pl`); simpanan lama tanpa `pl` guna etnik DUN sebagai anggaran. */
  var MUSIM = { PRU_SELEPAS_PRN: 1, PRN_SELEPAS_PRU: 4 };
  function kekuatan(e, nama, kod, pemilih, bil) {
    var dayak = Math.round((e.iban + e.bidayuh + e.orangUlu) * 10) / 10, bumi = Math.round((100 - e.cina - e.india - e.lain) * 10) / 10;
    var tahap = e.cina >= CONFIG.CINA.sukar ? 'sukar' : e.cina >= CONFIG.CINA.marginal ? 'marginal' : bumi >= CONFIG.BUMI_SELAMAT ? 'selamat' : 'biasa';
    var profil = e.cina >= CONFIG.BANDAR_CINA ? 'URBAN' : bumi >= 80 ? 'RURAL' : 'MIXED';
    var lawan = e.cina >= CONFIG.BANDAR_CINA ? ['DAP', 'PSB'] : dayak >= 50 ? ['PSB', 'PKR'] : e.melayu >= 50 ? ['PKR', 'PAS'] : ['PKR', 'PSB'];
    return { nama: nama, kod: kod, pemilih: pemilih, bil: bil, melayu: e.melayu, cina: e.cina, india: e.india, dayak: dayak, bumi: bumi, lain: e.lain,
      tahap: tahap, tahapNama: TAHAP[tahap], ofset: CONFIG.OFSET[tahap], profil: profil, lawan: lawan };
  }
  /** Ringkasan kerusi Parlimen pemain PBB (null jika bukan PBB / tiada data). */
  function maklumatParlimen(p) {
    var d = p && SW(p.parti) && p.dunInfo ? p.dunInfo : null; if (!d || !d.e) { return null; }
    var z = d.pl && d.pl.e ? d.pl : { nama: d.parlimen, kod: d.kodParlimen, pemilih: d.pemilih, bilDUN: 1, e: d.e };
    var m = kekuatan(z.e, z.nama || d.parlimen || 'Parlimen', z.kod || d.kodParlimen || '', z.pemilih, z.bilDUN); m.bilDUN = z.bilDUN; return m;
  }
  function ofsetParlimen(p) { var m = maklumatParlimen(p); return m ? m.ofset : 0; }
  /** Jadual musim seterusnya selepas musim 'PRN' atau 'PRU' tamat: { jenis, tahun, bulan }. */
  function jadualBerikut(p, jenisTamat) {
    var tahun = parseInt(p.tahun, 10) || CONFIG.TAHUN_PRN, bulan = 1 + hash(((p && (p.id || p.nama)) || 'pbb') + '|pru') % 12;
    return jenisTamat === 'PRN' ? { jenis: 'PRU', tahun: tahun + MUSIM.PRU_SELEPAS_PRN, bulan: bulan } : { jenis: 'PRN', tahun: tahun + MUSIM.PRN_SELEPAS_PRU, bulan: jadual(p).bulan };
  }

  /* ---------- v9.1: kerajaan negeri Sarawak (Premier & Exco) ----------
     ANDAIAN (penyeimbang simulasi): GPS dominan, maka peluang parti membentuk kerajaan selepas PRN 60% hingga 90% (UMNO 25% hingga 80%).
     Kerusi GPS 70 hingga 78 daripada 82 (benih tetap ikut pemain dan tahun); PBB memegang 50% hingga 60% kerusi GPS; ambang 42.
     Hanya Presiden PBB yang boleh menuntut Premier. Peluang menolak/menerima rakan GPS dilaraskan: blok dalam giliran +5%, bukan giliran -5%, sokongan antara blok (melebihi 30) +0.2% setiap mata. */
  var KERAJAAN = { MIN: 0.6, MAKS: 0.9, GPS_MIN: 70, GPS_MAKS: 78, JUMLAH: 82, AMBANG: 42, KONGSI_MIN: 0.5, KONGSI_MAKS: 0.6, GILIRAN_PELARAS: 0.05, SOKONGAN_PELARAS: 0.002 };
  function peluangKerajaan(pop) { var v = ((Number(pop) || 0) + 5) / 100; return Math.max(KERAJAAN.MIN, Math.min(KERAJAAN.MAKS, v)); }
  function adalahPresidenPBB(p) {
    if (!p || p.parti !== 'PBB') { return false; }
    var l = Array.isArray(p.jawatanList) ? p.jawatanList : [];
    return /^Presiden$/i.test(String(p.jawatan || '')) || l.some(function (j) { return /^Presiden$/i.test(String(j && j.jawatan || '')); });
  }
  function benih(p, r) { var h = hash(String(p.id || p.nama) + '|premier|' + p.tahun), x = (h % 1000) / 1000; return r === 1 ? ((h >>> 10) % 1000) / 1000 : x; }
  /* ---------- v9.3: rundingan kerusi GPS ----------
     Presiden PBB berunding dengan PRS, SUPP dan PDP berapa kerusi PBB bertanding (daripada 82) dalam masa 12 bulan sebelum PRN. Sekali setiap kitaran PRN, kos 3 AP.
     Kerusi PBB menentukan bahagian kerusi PBB dalam GPS (kongsi = kerusi / 82), maka peluang menuntut Premier. Hubungan gabungan turut berubah.
     ANDAIAN: 44 kerusi (seimbang, hubungan 0), 50 (tegas, hubungan -10), 38 (beralah, hubungan +10). Bukan data pembahagian kerusi sebenar. */
  var RUNDING = { AP: 3, BULAN_AWAL: 12, PILIHAN: {
    seimbang: { id: 'seimbang', nama: 'Seimbang', kerusi: 44, hubungan: 0 },
    tegas: { id: 'tegas', nama: 'Tegas', kerusi: 50, hubungan: -10 },
    beralah: { id: 'beralah', nama: 'Beralah', kerusi: 38, hubungan: 10 } } };
  function modulPRU() { return typeof globalThis !== 'undefined' && globalThis.MyPolitikPRU ? globalThis.MyPolitikPRU : require('./pru.js'); }
  /** Kitaran PRN semasa: tahun PRN akan datang (atau yang baru berlalu jika belum dijadual semula). */
  function statusRunding(p) {
    if (!adalahPresidenPBB(p)) { return null; }
    var pru = modulPRU().getPRU(p); if (pru.jenisPBB && pru.jenisPBB !== 'PRN') { return { kitar: 0, bakiBulan: 0, dalamTempoh: false, sudah: p.rundingGPS || null, boleh: false, pilihan: RUNDING.PILIHAN, bukanPRN: true }; }
    var kitar = parseInt(pru.tahunPRU, 10) || CONFIG.TAHUN_PRN, bulanPRN = parseInt(pru.bulanPRU, 10) || 1;
    var baki = (kitar * 12 + bulanPRN) - idxBulan(p), sudah = p.rundingGPS && p.rundingGPS.kitar === kitar ? p.rundingGPS : null;
    var dalamTempoh = baki > 0 && baki <= RUNDING.BULAN_AWAL;
    return { kitar: kitar, bakiBulan: baki, dalamTempoh: dalamTempoh, sudah: sudah, boleh: dalamTempoh && !sudah && !(pru.aktif), pilihan: RUNDING.PILIHAN };
  }
  function runding(pilihan) {
    var Sv = typeof globalThis !== 'undefined' && globalThis.MyPolitikSave ? globalThis.MyPolitikSave : require('./save.js'), p = Sv.loadPlayer(), st = statusRunding(p), c = RUNDING.PILIHAN[pilihan];
    if (!st) { return { ok: false, ralat: 'Hanya Presiden PBB boleh berunding kerusi GPS.' }; }
    if (!c) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    if (st.sudah) { return { ok: false, ralat: 'Rundingan kerusi untuk PRN ini sudah selesai.' }; }
    if (!st.boleh) { return { ok: false, ralat: 'Rundingan dibuka ' + RUNDING.BULAN_AWAL + ' bulan sebelum PRN.' }; }
    if ((Number(p.ap) || 0) < RUNDING.AP) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
    var PR = modulPRU(), pru = PR.getPRU(p); pru.hubunganGabungan = Math.max(0, Math.min(100, (Number(pru.hubunganGabungan) || 50) + c.hubungan));
    var r = Sv.applyEffects({ ap: -RUNDING.AP }, { kiraTindakan: false, patch: { pru: pru, rundingGPS: { kitar: st.kitar, pilihan: c.id, kerusi: c.kerusi } }, log: { tindakan: 'gps_runding', nama: 'Rundingan kerusi GPS: ' + c.nama + ' (' + c.kerusi + ' kerusi)', peringkat: 'ahli' } });
    return r && r.ok ? { ok: true, mesej: 'Rundingan GPS selesai: PBB bertanding ' + c.kerusi + ' kerusi' + (c.hubungan ? ' (hubungan gabungan ' + (c.hubungan > 0 ? '+' : '') + c.hubungan + ')' : '') + '.', kerusi: c.kerusi } : { ok: false, ralat: (r && r.ralat) || 'Gagal.' };
  }


  /* ---------- v10.0: MOD RINGAN (PRS dan parti rakan GPS lain kemudian) ----------
     Jadual PRN 2021 (diberi pengguna): GPS bertanding 82 kerusi, PBB 48, SUPP 18, PRS 11, PDP 5. Jadi kuota asas PRS = 11.
     Meter Pengaruh GPS (0-100, mula 40): "Lobi Majlis GPS" (3 AP, RM 1,500) +8. Rundingan kuota (12 bulan sebelum PRN, sekali setiap kitaran, 3 AP):
       Terima = kuota asas; Tuntut lebih = +3 kerusi dengan peluang 25%+Pengaruh/200 (had 25% hingga 85%), gagal: kuota -1, hubungan -10, berjaya: hubungan -5;
       Beralah = kuota -2, hubungan +10, Pengaruh +5. Kerusi dalam kuota ialah DUN Dayak teratas dalam kawasan operasi (data rkPRS). Semua angka ialah ANDAIAN. */
  var KUOTA_2021 = { PBB: 48, SUPP: 18, PRS: 11, PDP: 5 };
  var RINGAN = { PENGARUH_MULA: 40, LOBI_AP: 3, LOBI_MYR: 1500, LOBI_TAMBAH: 8, TUNTUT_TAMBAH: 3, TUNTUT_KURANG: 1, BERALAH_KURANG: 2, BERALAH_PENGARUH: 5,
    TUNTUT_MIN: 0.25, TUNTUT_MAKS: 0.85, AP: 3, BULAN_AWAL: 12 };
  function ringan(p) { return !!(p && SW(p.parti) && p.parti !== 'PBB'); }
  function pengaruh(p) { var v = Number(p && p.pengaruhGPS); return isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : RINGAN.PENGARUH_MULA; }
  function kuotaAsas(p) { return KUOTA_2021[p && p.parti] || 0; }
  /** Kuota kerusi DUN parti ringan untuk PRN semasa (hasil rundingan jika dalam kitaran, jika tidak kuota asas). */
  function kuota(p) {
    if (!ringan(p)) { return null; }
    var th = parseInt(p.tahun, 10) || 0, r = p.rundingGPS;
    return r && isFinite(Number(r.kerusi)) && th >= r.kitar - 1 && th < r.kitar + 5 ? Number(r.kerusi) : kuotaAsas(p);
  }
  /** Adakah kerusi DUN pemain dalam kuota parti? (kedudukan rkPRS; tiada data = dibenarkan) */
  function dalamKuota(p) {
    if (!ringan(p)) { return true; }
    var d = p.dunInfo, rk = d && Number(d.rkPRS); if (!rk) { return !d; }
    return rk <= kuota(p);
  }
  function ringkasRingan(p) {
    if (!ringan(p)) { return null; }
    var m = maklumat(p), rk = p.dunInfo && p.dunInfo.rkPRS || 0;
    return { parti: p.parti, pengaruh: pengaruh(p), kuota: kuota(p), kuotaAsas: kuotaAsas(p), dalamKuota: dalamKuota(p), kedudukan: rk, jumlahGPS: KERAJAAN.JUMLAH, tahap: m ? m.tahapNama : '' };
  }
  function lobiGPS() {
    var Sv = typeof globalThis !== 'undefined' && globalThis.MyPolitikSave ? globalThis.MyPolitikSave : require('./save.js'), p = Sv.loadPlayer();
    if (!ringan(p)) { return { ok: false, ralat: 'Hanya untuk parti rakan GPS (mod ringan).' }; }
    if ((Number(p.ap) || 0) < RINGAN.LOBI_AP) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
    if (Sv.cukupDana && !Sv.cukupDana(p, RINGAN.LOBI_MYR)) { return { ok: false, ralat: Sv.ralatDana ? Sv.ralatDana(p, RINGAN.LOBI_MYR) : 'Dana tidak mencukupi.' }; }
    var baru = Math.min(100, pengaruh(p) + RINGAN.LOBI_TAMBAH);
    var r = Sv.applyEffects({ ap: -RINGAN.LOBI_AP, myr: -RINGAN.LOBI_MYR }, { kiraTindakan: false, patch: { pengaruhGPS: baru }, log: { tindakan: 'gps_lobi', nama: 'Lobi Majlis GPS', peringkat: 'bulan' } });
    return r && r.ok ? { ok: true, mesej: 'Anda melobi Majlis GPS. Pengaruh GPS ' + baru + '/100 (-' + RINGAN.LOBI_AP + ' AP, -RM ' + RINGAN.LOBI_MYR.toLocaleString('en') + ').' } : { ok: false, ralat: (r && r.ralat) || 'Gagal.' };
  }
  function statusRundingRakan(p) {
    if (!ringan(p)) { return null; }
    var pru = modulPRU().getPRU(p); if (pru.jenisPBB && pru.jenisPBB !== 'PRN') { return { kitar: 0, bakiBulan: 0, dalamTempoh: false, sudah: p.rundingGPS || null, boleh: false, bukanPRN: true }; }
    var kitar = parseInt(pru.tahunPRU, 10) || CONFIG.TAHUN_PRN, bulanPRN = parseInt(pru.bulanPRU, 10) || 1;
    var baki = (kitar * 12 + bulanPRN) - idxBulan(p), sudah = p.rundingGPS && p.rundingGPS.kitar === kitar ? p.rundingGPS : null, dalam = baki > 0 && baki <= RINGAN.BULAN_AWAL;
    return { kitar: kitar, bakiBulan: baki, dalamTempoh: dalam, sudah: sudah, boleh: dalam && !sudah && !pru.aktif };
  }
  function peluangTuntut(p) { return Math.max(RINGAN.TUNTUT_MIN, Math.min(RINGAN.TUNTUT_MAKS, 0.25 + pengaruh(p) / 200)); }
  /** pilihan: 'terima' | 'tuntut' | 'beralah'. opsyen.rng untuk ujian. */
  function rundingRakan(pilihan, opsyen) {
    var Sv = typeof globalThis !== 'undefined' && globalThis.MyPolitikSave ? globalThis.MyPolitikSave : require('./save.js'), p = Sv.loadPlayer(), st = statusRundingRakan(p);
    if (!st) { return { ok: false, ralat: 'Hanya untuk parti rakan GPS (mod ringan).' }; }
    if (['terima', 'tuntut', 'beralah'].indexOf(pilihan) < 0) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    if (st.sudah) { return { ok: false, ralat: 'Rundingan kerusi untuk PRN ini sudah selesai.' }; }
    if (!st.boleh) { return { ok: false, ralat: 'Rundingan dibuka ' + RINGAN.BULAN_AWAL + ' bulan sebelum PRN.' }; }
    if ((Number(p.ap) || 0) < RINGAN.AP) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
    var asas = kuotaAsas(p), k = asas, hub = 0, peng = pengaruh(p), berjaya = null, rng = opsyen && opsyen.rng ? opsyen.rng : (Sv.rngBerbenih ? Sv.rngBerbenih(String(p.id) + '|rundingrakan|' + st.kitar) : Math.random);
    if (pilihan === 'tuntut') { berjaya = rng() < peluangTuntut(p); if (berjaya) { k = asas + RINGAN.TUNTUT_TAMBAH; hub = -5; } else { k = Math.max(1, asas - RINGAN.TUNTUT_KURANG); hub = -10; } }
    if (pilihan === 'beralah') { k = Math.max(1, asas - RINGAN.BERALAH_KURANG); hub = 10; peng = Math.min(100, peng + RINGAN.BERALAH_PENGARUH); }
    var PR = modulPRU(), pru = PR.getPRU(p); pru.hubunganGabungan = Math.max(0, Math.min(100, (Number(pru.hubunganGabungan) || 50) + hub));
    var r = Sv.applyEffects({ ap: -RINGAN.AP }, { kiraTindakan: false, patch: { pru: pru, pengaruhGPS: peng, rundingGPS: { kitar: st.kitar, pilihan: pilihan, kerusi: k } }, log: { tindakan: 'gps_runding', nama: 'Rundingan kuota GPS: ' + pilihan + ' (' + k + ' kerusi)', peringkat: 'ahli' } });
    var tx = pilihan === 'tuntut' ? (berjaya ? 'Tuntutan berjaya' : 'Tuntutan ditolak') : pilihan === 'beralah' ? 'Anda beralah' : 'Anda menerima tawaran';
    return r && r.ok ? { ok: true, berjaya: berjaya, kerusi: k, mesej: tx + ': ' + p.parti + ' bertanding ' + k + ' kerusi dalam GPS' + (hub ? ' (hubungan gabungan ' + (hub > 0 ? '+' : '') + hub + ')' : '') + '.' } : { ok: false, ralat: (r && r.ralat) || 'Gagal.' };
  }

  /** Anggaran kerusi untuk tuntutan Premier. Pulang null jika bukan PBB. */
  function kerusiPremier(p) {
    if (!p || !SW(p.parti)) { return null; }
    var gps = Math.round(KERAJAAN.GPS_MIN + benih(p, 0) * (KERAJAAN.GPS_MAKS - KERAJAAN.GPS_MIN)), kongsi = KERAJAAN.KONGSI_MIN + benih(p, 1) * (KERAJAAN.KONGSI_MAKS - KERAJAAN.KONGSI_MIN);
    var rg = p.rundingGPS && p.rundingGPS.kerusi && (parseInt(p.tahun, 10) || 0) >= p.rundingGPS.kitar && (parseInt(p.tahun, 10) || 0) < p.rundingGPS.kitar + 5;   // v9.3
    if (rg) { kongsi = p.rundingGPS.kerusi / KERAJAAN.JUMLAH; }
    if (ringan(p)) { kongsi = kuota(p) / KERAJAAN.JUMLAH; }                                       // v10.0: bahagian parti rakan = kuota / 82
    var parti = Math.round(gps * kongsi);
    return { jumlah: KERAJAAN.JUMLAH, ambang: KERAJAAN.AMBANG, parti: parti, rakan: gps - parti, gabungan: gps, sendiri: parti >= KERAJAAN.AMBANG, kongsi: gps > 0 ? parti / gps : 1 };
  }
  /** Pelarasan peluang Premier daripada imbangan blok (pecahan, cth 0.05). */
  function pelarasPremier(p) {
    var b = blokPemain(p); if (!b) { return 0; }
    return (b === giliran(p.tahun) ? KERAJAAN.GILIRAN_PELARAS : -KERAJAAN.GILIRAN_PELARAS) + (sokongan(p) - BLOK_CFG.SOKONGAN_MULA) * KERAJAAN.SOKONGAN_PELARAS;
  }
  /** Sebab pemain PBB tidak boleh menuntut Premier ('' jika boleh). */
  function sebabPremier(p) { return adalahPresidenPBB(p) ? '' : (ringan(p) ? 'Parti rakan GPS tidak menuntut jawatan Premier.' : 'Hanya Presiden PBB boleh menuntut jawatan Premier.'); }

  /** Kerusi Dewan Undangan Negeri Sarawak untuk sidang DUN (bentuk sama dengan dun.js kerusi()). BN = GPS. Pembangkang: PH separuh, selebihnya Lain (andaian). */
  function kerusiDewan(p, kerajaan) {
    var k = kerusiPremier(p); if (!k) { return null; }
    var gps = kerajaan ? k.gabungan : Math.round(k.ambang * 0.8), opp = k.jumlah - gps, ph = Math.round(opp * 0.5);      // kerajaan false: GPS di bawah ambang (pembangkang)
    return { jumlah: k.jumlah, ambang: k.ambang, BN: gps, PH: ph, PN: 0, LAIN: opp - ph, kerajaanBN: !!kerajaan, tahun: p.tahun, bulan: p.bulan };
  }
  function ofset(p) { var m = maklumat(p); return m ? m.ofset : 0; }
  return { CONFIG: CONFIG, TAHAP: TAHAP, jadual: jadual, maklumat: maklumat, ofset: ofset,
    BLOK: BLOK, BLOK_CFG: BLOK_CFG, sahBlok: sahBlok, blokLalai: blokLalai, blokPemain: blokPemain, giliran: giliran, sokongan: sokongan, ofsetJawatan: ofsetJawatan, ringkasBlok: ringkasBlok, dekati: dekati,
    KERAJAAN: KERAJAAN, peluangKerajaan: peluangKerajaan, adalahPresidenPBB: adalahPresidenPBB, kerusiPremier: kerusiPremier, pelarasPremier: pelarasPremier, sebabPremier: sebabPremier, kerusiDewan: kerusiDewan, RUNDING: RUNDING, statusRunding: statusRunding, runding: runding,
    KUOTA_2021: KUOTA_2021, RINGAN: RINGAN, ringan: ringan, pengaruh: pengaruh, kuota: kuota, kuotaAsas: kuotaAsas, dalamKuota: dalamKuota, ringkasRingan: ringkasRingan, lobiGPS: lobiGPS, statusRundingRakan: statusRundingRakan, peluangTuntut: peluangTuntut, rundingRakan: rundingRakan,
    MUSIM: MUSIM, maklumatParlimen: maklumatParlimen, ofsetParlimen: ofsetParlimen, jadualBerikut: jadualBerikut };
});
