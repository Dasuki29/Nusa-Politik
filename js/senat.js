/* ==========================================================================
   Nusa Politik — js/senat.js   (v14.21, Dewan Negara Fasa 1, mockup dipersetujui)
   Senator Dewan Negara untuk semua parti.
     - Perlembagaan: 70 kerusi (26 dipilih DUN, 44 dilantik Agong atas nasihat PM), penggal 3 tahun, maksimum 2 penggal
       (Perkara 45), umur minimum 30 (Perkara 47), tidak boleh ahli kedua-dua Dewan (Perkara 49), RUU ditolak hanya
       ditangguh: RUU Wang 1 bulan, RUU lain 1 tahun (Perkara 68). Pembubaran Parlimen tidak menamatkan penggal Senator.
     - Amalan: Senator yang mahu bertanding PRU meletak jawatan Senator dahulu (sebelum penamaan calon).
     - Syarat: umur 30+, bukan Ahli Parlimen, Ketua Bahagian / jawatan Pusat / Ketua Sayap, Integriti 50+, belum 2 penggal.
     - Laluan PM: parti dalam kerajaan persekutuan; kekosongan Januari dan Julai; lobi Presiden 3 AP, RM 5,000.
     - Laluan DUN: parti membentuk kerajaan negeri; kekosongan Januari (sebahagian tahun); mohon 2 AP, RM 3,000.
     - Tugas: semak RUU dari Dewan Rakyat (bulan 4, 8, 11; Bajet bulan 11 = RUU Wang), Bahas, Soalan, Jawatankuasa.
     - Meter: Pengaruh Senat, Hubungan Kerajaan, Kehadiran. Elaun RM 2,000 sebulan. Penggal kedua jika Hubungan 60+.
     - Senator MIC Sabah (js/sabah-bn.js) diserap: mod Dewan Negara tanpa elaun berganda.
   ANDAIAN: semua angka ialah angka permainan.
   State: p.senat = { aktif:{sumber,negeri,penggal,mula,tamat,tahunMula,pengaruh,hubungan,kehadiran,bahas,soalan,jk,ruu:[],lanjut}|null, sejarah:[], lobi, dun }
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikSenat = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function PR() { return modul('MyPolitikPRU', 'pru.js'); }
  function J() { return modul('MyPolitikJawatan', 'jawatan.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function salin(o) { return o === undefined || o === null ? o : JSON.parse(JSON.stringify(o)); }
  var rngLalai = Math.random;
  function rng(o) { return (o && o.rng) || rngLalai; }
  function benih(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; }

  var CONFIG = {
    KERUSI: 70, DUN: 26, LANTIK: 44, KERAJAAN: 41, UMUR: 30, INTEGRITI: 50, PANGKAT: 7, PENGGAL: 36, MAKS_PENGGAL: 2, ELAUN: 2000, LANJUT: 60,
    LOBI_PM: { ap: 3, myr: 5000, bulan: [1, 7] }, LOBI_DUN: { ap: 2, myr: 3000, bulan: 1, kekosongan: 0.35, bonus: 0.10 },
    SIDANG: [4, 8, 11], BAJET: 11,
    UNDI: { sokong: { hubungan: 3 }, sokongWang: { hubungan: 2 }, pinda: { pengaruh: 4, ip: 5, hubungan: -2, kembali: 0.4 }, tolak: { hubungan: -8, pengaruh: 2 }, tolakWang: { hubungan: -10, pengaruh: 1 }, tangguh: { pengaruh: 70, peluang: 0.3 } },
    TUGAS: { bahas: { ap: 2, ip: 8, pengaruh: 3 }, soalan: { ap: 1, reputasi: 1, hubungan: -1 }, jk: { ap: 1, pengaruh: 2, kehadiran: 5 } },
    PONTENG: -10, SUSUT_HADIR: -2, MULA: { pengaruh: 40, hubungan: 60, kehadiran: 90 }
  };

  function getSN(p) { var s = p && p.senat && typeof p.senat === 'object' ? salin(p.senat) : {}; s.aktif = s.aktif || null; s.sejarah = Array.isArray(s.sejarah) ? s.sejarah : []; return s; }
  function sbnAktif(p) { var B = modul('MyPolitikSabahBN', 'sabah-bn.js'); return !!(B && B.senatorAktif && B.adalah && B.adalah(p) && B.senatorAktif(p)); }
  function aktif(p) { if (!p || p.tamat) { return false; } var a = p.senat && p.senat.aktif; return a ? (a.sumber === 'sbn' ? sbnAktif(p) : true) : sbnAktif(p); }
  function umur(p) { var H = modul('MyPolitikHayat', 'hayat.js'); return H && H.umurSemasa ? H.umurSemasa(p) : 0; }
  function adaMP(p) { var P = PR(); return !!(P && P.semuaStatus && P.semuaStatus(p).some(function (s) { return s.jenis === 'MP'; })); }
  function pangkat(p) { var j = J(); return j && j.pangkatTertinggi ? Number(j.pangkatTertinggi(p)) || 0 : 0; }
  function ketuaSayap(p) { var j = J(); return !!(j && j.getJawatan && j.getJawatan(p).some(function (x) { return /^sayap_(bahagian|pusat)_/.test(x.kod || ''); })); }
  function integriti(p) { var I = modul('MyPolitikIntegriti', 'integriti.js'); try { return I && I.getIntegriti ? Number(I.getIntegriti(p).skor) : 70; } catch (e) { return 70; } }
  function luar(p) { var SL = modul('MyPolitikSelepas', 'selepas.js'); return !!(SL && SL.luarPolitik && SL.luarPolitik(p)); }
  /** Parti dalam kerajaan persekutuan (null = tidak dapat ditentukan, dianggap ya bagi Sarawak / GPS). */
  function kerajaanPusat(p) {
    var P = PR(); if (!P) { return false; }
    var st = P.semuaStatus ? P.semuaStatus(p).filter(function (s) { return s.jenis === 'MP'; })[0] : null; if (st && st.kerajaan !== undefined) { return !!st.kerajaan; }
    var k = P.kerajaanSemasa ? P.kerajaanSemasa(p, 'MP') : null; return k === null ? true : !!k;
  }
  function kerajaanNegeri(p) {
    var P = PR(); if (!P) { return false; }
    var st = P.semuaStatus ? P.semuaStatus(p).filter(function (s) { return s.jenis === 'ADUN'; })[0] : null; if (st && st.kerajaan !== undefined) { return !!st.kerajaan; }
    var k = P.kerajaanSemasa ? P.kerajaanSemasa(p, 'ADUN') : null; return !!k;
  }
  function penggalDigunakan(s) { return s.sejarah.reduce(function (n, x) { return n + (Number(x.penggal) || 1); }, 0); }

  /** Senarai syarat asas: [{ok, teks}] */
  function syarat(p) {
    var s = getSN(p), pk = pangkat(p);
    return [
      { ok: umur(p) >= CONFIG.UMUR, teks: 'Umur ' + CONFIG.UMUR + ' tahun ke atas' },
      { ok: !adaMP(p), teks: 'Bukan Ahli Parlimen (Perkara 49)' },
      { ok: pk >= CONFIG.PANGKAT || ketuaSayap(p), teks: 'Ketua Bahagian atau jawatan Pusat / Ketua Sayap' },
      { ok: integriti(p) >= CONFIG.INTEGRITI, teks: 'Integriti ' + CONFIG.INTEGRITI + '+' },
      { ok: penggalDigunakan(s) < CONFIG.MAKS_PENGGAL, teks: 'Belum ' + CONFIG.MAKS_PENGGAL + ' penggal (Perkara 45)' }
    ];
  }
  function peluang(p, bonus) {
    var pk = pangkat(p), rep = Number(p.reputasi) || 50;
    return clamp(0.15 + Math.max(0, pk - CONFIG.PANGKAT) * 0.07 + (rep - 50) / 150 + (integriti(p) - 50) / 300 + (bonus || 0), 0.05, 0.75);
  }
  function kosongDUN(p) { return parseInt(p.bulan, 10) === CONFIG.LOBI_DUN.bulan && benih(p.tahun + '|' + (p.negeri || '')) < CONFIG.LOBI_DUN.kekosongan; }
  function bulanSeterusnya(p, senarai) { var b = parseInt(p.bulan, 10) || 1, t = parseInt(p.tahun, 10) || 0; for (var i = 1; i <= 12; i++) { var x = ((b - 1 + i) % 12) + 1, ty = t + Math.floor((b - 1 + i) / 12); if (senarai.indexOf(x) >= 0) { return { bulan: x, tahun: ty }; } } return null; }
  var NAMA_BULAN = ['', 'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];

  /** Keadaan laluan lantikan: { syarat, asas, pm:{boleh,sebab,peluang}, dun:{boleh,sebab,peluang} } */
  function laluan(p) {
    var s = getSN(p), sy = syarat(p), asas = sy.every(function (x) { return x.ok; }) && !aktif(p) && !luar(p) && !p.tamat, kini = idx(p), out = { syarat: sy, asas: asas, aktif: aktif(p) };
    function semak(jenis) {
      var C = jenis === 'pm' ? CONFIG.LOBI_PM : CONFIG.LOBI_DUN, kos = S().kosSebenar ? S().kosSebenar(p, C.myr) : C.myr;
      if (!asas) { return { boleh: false, sebab: aktif(p) ? 'Anda sudah Senator.' : luar(p) ? 'Anda di luar politik kepartian.' : 'Syarat asas belum dipenuhi.' }; }
      if (jenis === 'pm' && !kerajaanPusat(p)) { return { boleh: false, sebab: 'Parti anda tidak berada dalam kerajaan persekutuan.' }; }
      if (jenis === 'dun' && !kerajaanNegeri(p)) { return { boleh: false, sebab: 'Parti anda tidak membentuk kerajaan negeri ' + (p.negeri || '') + '.' }; }
      if (jenis === 'pm' && C.bulan.indexOf(parseInt(p.bulan, 10)) < 0) { var n = bulanSeterusnya(p, C.bulan); return { boleh: false, sebab: 'Kekosongan seterusnya: ' + n.bulan + '/' + n.tahun + '.' }; }
      if (jenis === 'dun' && !kosongDUN(p)) { return { boleh: false, sebab: 'Tiada kekosongan Senator negeri ' + (p.negeri || '') + ' sekarang (semakan setiap Januari).' }; }
      if ((jenis === 'pm' ? s.lobi : s.dun) === kini) { return { boleh: false, sebab: 'Sudah dicuba bulan ini.' }; }
      if ((Number(p.ap) || 0) < C.ap) { return { boleh: false, sebab: 'AP tidak mencukupi.' }; }
      if ((Number(p.myr) || 0) < kos) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
      return { boleh: true, kos: kos, peluang: Math.round(peluang(p, jenis === 'dun' ? C.bonus : 0) * 100) };
    }
    out.pm = semak('pm'); out.dun = semak('dun');
    if (!out.pm.peluang) { out.pm.peluang = Math.round(peluang(p) * 100); }
    if (!out.dun.peluang) { out.dun.peluang = Math.round(peluang(p, CONFIG.LOBI_DUN.bonus) * 100); }
    return out;
  }
  function baharu(p, sumber) {
    var M = CONFIG.MULA;
    return { sumber: sumber, negeri: sumber === 'dun' ? (p.negeri || '') : '', penggal: 1, mula: idx(p), tamat: idx(p) + CONFIG.PENGGAL, tahunMula: p.tahun,
      pengaruh: M.pengaruh, hubungan: M.hubungan, kehadiran: M.kehadiran, bahas: 0, soalan: 0, jk: 0, ruu: [], lanjut: false };
  }
  function label(a) { return a.sumber === 'dun' ? 'Dipilih DUN ' + a.negeri : a.sumber === 'sbn' ? 'Mewakili MIC Sabah' : 'Dilantik atas nasihat PM'; }
  /** Lobi lantikan: jenis = 'pm' | 'dun'. */
  function mohon(jenis, o) {
    var Sv = S(), p = Sv.loadPlayer(); if (!p) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var l = laluan(p), x = l[jenis]; if (!x) { return { ok: false, ralat: 'Laluan tidak sah.' }; }
    if (!x.boleh) { return { ok: false, ralat: x.sebab }; }
    var C = jenis === 'pm' ? CONFIG.LOBI_PM : CONFIG.LOBI_DUN, s = getSN(p), berjaya = rng(o)() * 100 < x.peluang;
    if (jenis === 'pm') { s.lobi = idx(p); } else { s.dun = idx(p); }
    if (berjaya) { s.aktif = baharu(p, jenis); }
    var nama = berjaya ? 'Dilantik Senator Dewan Negara' : 'Lobi Senator tidak berjaya';
    var h = Sv.applyEffects({ ap: -C.ap, myr: -x.kos }, { kiraTindakan: true, patch: { senat: s }, log: { tindakan: berjaya ? 'senat_lantik' : 'senat_lobi', nama: nama, peringkat: 'ahli' } });
    if (!h.ok) { return { ok: false, ralat: h.ralat }; }
    return { ok: true, berjaya: berjaya, mesej: berjaya ? 'Anda mengangkat sumpah sebagai Senator Dewan Negara (' + label(s.aktif) + '). Penggal 3 tahun, elaun RM ' + CONFIG.ELAUN.toLocaleString('en') + ' sebulan. Tab Dewan dibuka.'
      : (jenis === 'pm' ? 'Presiden parti tidak mencadangkan nama anda kali ini.' : 'DUN memilih calon lain sebagai Senator negeri.') + ' Cuba lagi pada kekosongan seterusnya.' };
  }

  function laras(a, x) { ['pengaruh', 'hubungan', 'kehadiran'].forEach(function (k) { if (x[k]) { a[k] = clamp((Number(a[k]) || 0) + x[k], 0, 100); } }); }
  function tanda(n) { return (n > 0 ? '+' : '') + n; }
  var LBL = { pengaruh: 'Pengaruh Senat', hubungan: 'Hubungan Kerajaan', kehadiran: 'Kehadiran', ip: 'IP', reputasi: 'Reputasi' };
  function ringkas(x) { return Object.keys(LBL).filter(function (k) { return x[k]; }).map(function (k) { return LBL[k] + ' ' + tanda(x[k]); }).join(', '); }
  /** Rekod aktif (Senator MIC Sabah dicipta secara malas). */
  function aktifRekod(p, s) {
    if (s.aktif) { return s.aktif; }
    if (sbnAktif(p)) { var B = modul('MyPolitikSabahBN', 'sabah-bn.js'), sn = B.ringkasan ? B.ringkasan(p).senator : null; s.aktif = baharu(p, 'sbn'); if (sn && sn.sehingga) { s.aktif.mula = sn.mula || idx(p); s.aktif.tamat = sn.sehingga; } return s.aktif; }
    return null;
  }
  function mesti() { var p = S().loadPlayer(); if (!aktif(p)) { return { ralat: 'Hanya Senator.' }; } var s = getSN(p); aktifRekod(p, s); return { p: p, s: s, a: s.aktif }; }

  /** Undi RUU: pilihan = sokong | pinda | tolak */
  function undi(id, pilihan, o) {
    var c = mesti(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var a = c.a, r = a.ruu.filter(function (x) { return x.id === id; })[0]; if (!r) { return { ok: false, ralat: 'RUU tidak dijumpai.' }; }
    if (r.wang && pilihan === 'pinda') { return { ok: false, ralat: 'RUU Wang tidak boleh dipinda oleh Dewan Negara.' }; }
    var U = CONFIG.UNDI, x = pilihan === 'sokong' ? (r.wang ? U.sokongWang : U.sokong) : pilihan === 'pinda' ? U.pinda : pilihan === 'tolak' ? (r.wang ? U.tolakWang : U.tolak) : null;
    if (!x) { return { ok: false, ralat: 'Pilihan tidak sah.' }; }
    x = Object.assign({}, x); var kes = {}, tambahan = '';
    if (x.ip) { kes.ip = x.ip; }
    if (pilihan === 'tolak') { var pop = !!(r.popular); kes.reputasi = pop ? -2 : 1; x.reputasi = kes.reputasi; if (a.pengaruh >= U.tangguh.pengaruh && rng(o)() < U.tangguh.peluang) { tambahan = ' Dewan Negara menolak RUU ini: ia ditangguh ' + (r.wang ? '1 bulan' : '1 tahun') + ' (Perkara 68).'; } else { tambahan = ' Majoriti Senator tetap meluluskan RUU ini.'; } }
    if (pilihan === 'pinda') { tambahan = rng(o)() < U.pinda.kembali ? ' Pindaan diterima: RUU dikembalikan ke Dewan Rakyat.' : ' Pindaan ditolak; RUU diluluskan tanpa pindaan.'; }
    laras(a, x); a.ruu = a.ruu.filter(function (y) { return y.id !== id; });
    var nm = pilihan === 'sokong' ? 'menyokong' : pilihan === 'pinda' ? 'mencadangkan pindaan kepada' : 'menolak';
    var h = S().applyEffects(kes, { kiraTindakan: true, patch: { senat: c.s }, log: { tindakan: 'senat_undi', nama: 'Dewan Negara: ' + nm + ' ' + r.tajuk, peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: 'Anda ' + nm + ' ' + r.tajuk + '.' + tambahan + ' ' + ringkas(x) + '.' } : { ok: false, ralat: h.ralat };
  }
  /** Tugas bulanan: bahas | soalan | jk */
  function tugas(jenis) {
    var c = mesti(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var T = CONFIG.TUGAS[jenis], a = c.a, p = c.p, kini = idx(p); if (!T) { return { ok: false, ralat: 'Tugas tidak sah.' }; }
    if (a[jenis] === kini) { return { ok: false, ralat: 'Sudah dibuat bulan ini.' }; }
    if ((Number(p.ap) || 0) < T.ap) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
    a[jenis] = kini; var x = {}, kes = { ap: -T.ap };
    ['pengaruh', 'hubungan', 'kehadiran'].forEach(function (k) { if (T[k]) { x[k] = T[k]; } }); laras(a, x);
    if (T.ip) { kes.ip = T.ip; x.ip = T.ip; } if (T.reputasi) { kes.reputasi = T.reputasi; x.reputasi = T.reputasi; }
    var NM = { bahas: 'Anda membahaskan RUU di Dewan Negara.', soalan: 'Anda mengemukakan soalan kepada Menteri. Liputan media meningkat.', jk: 'Anda menghadiri mesyuarat Jawatankuasa Pilihan Khas.' };
    var h = S().applyEffects(kes, { kiraTindakan: true, patch: { senat: c.s }, log: { tindakan: 'senat_' + jenis, nama: NM[jenis], peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: NM[jenis] + ' ' + ringkas(x) + '.' } : { ok: false, ralat: h.ralat };
  }
  /** Tamat perkhidmatan: sebab = 'penggal' | 'bertanding' | 'tolak' | 'mp' */
  function tamatkan(p, s, sebab) {
    var a = s.aktif; if (!a) { return null; }
    s.sejarah = s.sejarah.concat([{ sumber: a.sumber, negeri: a.negeri, dari: a.tahunMula, hingga: p.tahun, penggal: a.penggal, sebab: sebab }]); s.aktif = null;
    return s;
  }
  /** Letak jawatan Senator untuk bertanding PRU (dipanggil oleh js/pru.js / pru-ui.js). */
  function letakUntukBertanding() {
    var Sv = S(), p = Sv.loadPlayer(); if (!p || !(p.senat && p.senat.aktif)) { return { ok: false, ralat: 'Anda bukan Senator.' }; }
    var s = tamatkan(p, getSN(p), 'bertanding');
    var h = Sv.applyEffects({}, { kiraTindakan: false, patch: { senat: s }, log: { tindakan: 'senat_letak', nama: 'Letak jawatan Senator untuk bertanding PRU', peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: 'Anda meletak jawatan Senator untuk bertanding dalam pilihan raya (Perkara 49).' } : { ok: false, ralat: h.ralat };
  }
  function terimaLanjut(ya) {
    var c = mesti(); if (c.ralat) { return { ok: false, ralat: c.ralat }; }
    var a = c.a; if (!a.lanjut) { return { ok: false, ralat: 'Tiada tawaran penggal kedua.' }; }
    if (!ya) { tamatkan(c.p, c.s, 'tolak'); var h0 = S().applyEffects({}, { kiraTindakan: false, patch: { senat: c.s }, log: { tindakan: 'senat_tamat', nama: 'Tamat penggal Senator', peringkat: 'ahli' } }); return h0.ok ? { ok: true, mesej: 'Penggal anda sebagai Senator tamat.' } : { ok: false, ralat: h0.ralat }; }
    a.penggal = 2; a.mula = idx(c.p); a.tamat = idx(c.p) + CONFIG.PENGGAL; a.lanjut = false;
    var h = S().applyEffects({}, { kiraTindakan: false, patch: { senat: c.s }, log: { tindakan: 'senat_lanjut', nama: 'Penggal kedua Senator', peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: 'Anda dilantik semula sebagai Senator bagi penggal kedua (penggal terakhir).' } : { ok: false, ralat: h.ralat };
  }
  function ruuBaharu(p, r, a) {
    var D = modul('MyPolitikDewan', 'dewan.js'), sen = D && D.RUU ? D.RUU : [], out = [], b = parseInt(p.bulan, 10);
    if (b === CONFIG.BAJET) { out.push({ id: 'bajet' + p.tahun, tajuk: 'Bajet ' + (p.tahun + 1), wang: true, bulan: idx(p), undi: 0 }); }
    var calon = sen.filter(function (x) { return !a.ruu.some(function (y) { return y.id === x.id + p.tahun; }); });
    var n = b === CONFIG.BAJET ? 1 : 2;
    for (var i = 0; i < n && calon.length; i++) {
      var k = Math.floor(r() * calon.length), x = calon.splice(k, 1)[0], ya = 112 + Math.floor(x.asas * 60) - 30 + Math.floor(r() * 20);
      out.push({ id: x.id + p.tahun, tajuk: x.tajuk, kategori: x.kategori, wang: false, popular: !!(x.ekstra && (x.ekstra.reputasi || x.ekstra.akarUmbi)), bulan: idx(p), undi: clamp(ya, 112, 190) });
    }
    return out;
  }
  /** Bulanan (calendar.js). */
  function prosesBulan(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [], r = rng(o);
    if (p && !p.tamat && p.senat && p.senat.aktif && p.senat.aktif.sumber === 'sbn' && !sbnAktif(p)) { Sv.applyEffects({}, { kiraTindakan: false, patch: { senat: tamatkan(p, getSN(p), 'penggal') } }); return { peristiwa: ev }; }   // penggal MIC Sabah tamat (mesej oleh sabah-bn.js)
    if (!p || p.tamat || !aktif(p)) { return { peristiwa: ev }; }
    var s = getSN(p), a = aktifRekod(p, s), kini = idx(p), kes = {};
    if (adaMP(p) && a.sumber !== 'sbn') { tamatkan(p, s, 'mp'); Sv.applyEffects({}, { kiraTindakan: false, patch: { senat: s } }); ev.push({ jenis: 'senat', mesej: 'Anda kini Ahli Parlimen. Kerusi Senator anda dikosongkan (Perkara 49).' }); return { peristiwa: ev }; }
    if (kini >= a.tamat) {
      if (a.sumber !== 'sbn' && a.penggal === 1 && !a.lanjut && a.hubungan >= CONFIG.LANJUT && penggalDigunakan(s) + 1 < CONFIG.MAKS_PENGGAL) { a.lanjut = true; a.tamat = kini + 1; Sv.applyEffects({}, { kiraTindakan: false, patch: { senat: s } }); ev.push({ jenis: 'senat', mesej: 'Penggal pertama anda sebagai Senator tamat. Anda ditawarkan penggal kedua: jawab di tab Dewan.' }); return { peristiwa: ev }; }
      tamatkan(p, s, 'penggal'); Sv.applyEffects({}, { kiraTindakan: false, patch: { senat: s }, log: { tindakan: 'senat_tamat', nama: 'Tamat penggal Senator', peringkat: 'ahli' } }); ev.push({ jenis: 'senat', mesej: a.lanjut ? 'Anda tidak menjawab tawaran penggal kedua. Penggal Senator anda tamat.' : 'Penggal anda sebagai Senator tamat.' }); return { peristiwa: ev };
    }
    var ponteng = a.ruu.filter(function (x) { return x.bulan < kini; });
    if (ponteng.length) { laras(a, { kehadiran: CONFIG.PONTENG * ponteng.length }); a.ruu = a.ruu.filter(function (x) { return x.bulan >= kini; }); ev.push({ jenis: 'senat', mesej: 'Anda tidak mengundi ' + ponteng.length + ' RUU di Dewan Negara. Kehadiran ' + (CONFIG.PONTENG * ponteng.length) + '.' }); }
    var aktifBulanLalu = a.bahas === kini - 1 || a.soalan === kini - 1 || a.jk === kini - 1;
    if (!aktifBulanLalu) { laras(a, { kehadiran: CONFIG.SUSUT_HADIR }); }
    if (CONFIG.SIDANG.indexOf(parseInt(p.bulan, 10)) >= 0) {
      var baru = ruuBaharu(p, r, a); a.ruu = a.ruu.concat(baru);
      if (baru.length) { ev.push({ jenis: 'senat', mesej: '📜 Sidang Dewan Negara: ' + baru.length + ' RUU dari Dewan Rakyat menunggu undian anda (tab Dewan).' }); }
    }
    if (a.sumber !== 'sbn') { kes.myr = CONFIG.ELAUN; }
    Sv.applyEffects(kes, { kiraTindakan: false, pindahan: true, patch: { senat: s }, log: kes.myr ? { tindakan: 'elaun_senator', nama: 'Elaun Senator: +RM ' + CONFIG.ELAUN, peringkat: 'bulan' } : undefined });
    return { peristiwa: ev };
  }
  function keadaan(p) {
    var s = getSN(p); if (!aktif(p)) { return { aktif: false, sejarah: s.sejarah }; }
    var a = aktifRekod(p, s), kini = idx(p);
    return { aktif: true, a: a, label: label(a), bulanKe: a.lanjut ? CONFIG.PENGGAL : clamp(kini - (a.tamat - CONFIG.PENGGAL) + 1, 1, CONFIG.PENGGAL), kerajaan: CONFIG.KERAJAAN,
      boleh: { bahas: a.bahas !== kini && (Number(p.ap) || 0) >= CONFIG.TUGAS.bahas.ap, soalan: a.soalan !== kini && (Number(p.ap) || 0) >= CONFIG.TUGAS.soalan.ap, jk: a.jk !== kini && (Number(p.ap) || 0) >= CONFIG.TUGAS.jk.ap }, sejarah: s.sejarah };
  }

  return { CONFIG: CONFIG, setRng: function (f) { rngLalai = f || Math.random; }, getSN: getSN, aktif: aktif, syarat: syarat, laluan: laluan, mohon: mohon, undi: undi, tugas: tugas,
    letakUntukBertanding: letakUntukBertanding, terimaLanjut: terimaLanjut, prosesBulan: prosesBulan, keadaan: keadaan, label: label };
});
