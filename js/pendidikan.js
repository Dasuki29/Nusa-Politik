/* ==========================================================================
   Nusa Politik — js/pendidikan.js   (v13.13)
   Pendidikan pemain (mockup "Gelaran & Pendidikan", dipersetujui). Maklum balas pemain: Degree / Master / PhD → "Dr.".
     - Tahap: SPM, Diploma, Ijazah Sarjana Muda, Sarjana, PhD. Dipilih semasa mendaftar; simpanan lama = Ijazah Sarjana Muda (andaian).
     - Sambung belajar separuh masa, satu tahap pada satu masa: yuran dibayar di awal; AP bulanan −1 dan Stress +2 sebulan.
       Boleh ditangguh (yuran tidak dipulangkan).
     - Kesan bila tamat: Reputasi (+1/+1/+2/+3); peluang lobi portfolio +2% / +4% / +6% (Ijazah / Sarjana / PhD).
     - PhD sahaja memberi awalan "Dr.".
     - Doktor Kehormat: dikurniakan selepas 24 bulan sebagai Menteri / MB / TPM / PM; Reputasi +1; tanpa awalan "Dr.".
   ANDAIAN: yuran, tempoh dan kesan ialah angka permainan.
   State: p.pendidikan = { tahap, belajar:{ ke, bulan }|null, kehormat:{tahun,bulan}|null, bulanKanan, sejarah:[] }.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikPendidikan = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function ST() { return modul('MyPolitikStres', 'stress.js'); }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }

  var TAHAP = [
    { kod: 'spm', nama: 'SPM', ikon: '📗' },
    { kod: 'diploma', nama: 'Diploma', ikon: '📙', myr: 8000, bulan: 18, reputasi: 1, lobi: 0 },
    { kod: 'ijazah', nama: 'Ijazah Sarjana Muda', ikon: '🎓', myr: 20000, bulan: 36, reputasi: 1, lobi: 0.02 },
    { kod: 'sarjana', nama: 'Sarjana', ikon: '📘', myr: 25000, bulan: 24, reputasi: 2, lobi: 0.04 },
    { kod: 'phd', nama: 'PhD', ikon: '🎓', myr: 40000, bulan: 36, reputasi: 3, lobi: 0.06 }
  ];
  var CONFIG = { LALAI: 'ijazah', AP_BULAN: 1, STRESS_BULAN: 2, KEHORMAT: { bulan: 24, reputasi: 1, tahap: ['MENTERI_PENUH', 'MENTERI_BESAR', 'TIMBALAN_PM', 'PERDANA_MENTERI'] } };

  function indeks(kod) { for (var i = 0; i < TAHAP.length; i++) { if (TAHAP[i].kod === kod) { return i; } } return -1; }
  function tahapSah(kod) { return indeks(kod) >= 0 ? kod : CONFIG.LALAI; }
  function cari(kod) { return TAHAP[indeks(tahapSah(kod))]; }
  function dasar() { return { tahap: CONFIG.LALAI, belajar: null, kehormat: null, bulanKanan: 0, sejarah: [] }; }
  function getPendidikan(p) {
    var b = dasar(), x = p && p.pendidikan && typeof p.pendidikan === 'object' ? p.pendidikan : {};
    for (var k in b) { if (x[k] === undefined) { x[k] = b[k]; } }
    x.tahap = tahapSah(x.tahap);
    if (!Array.isArray(x.sejarah)) { x.sejarah = []; }
    return x;
  }
  function simpan(d, kesan, log) { return S().applyEffects(kesan || {}, { kiraTindakan: false, patch: { pendidikan: d }, log: log }); }
  function rekod(d, p, teks) { d.sejarah = d.sejarah.concat([{ tahun: p.tahun, bulan: p.bulan, teks: teks }]).slice(-10); }

  /** Tahap seterusnya (objek TAHAP) atau null jika sudah PhD. */
  function seterusnya(p) { var i = indeks(getPendidikan(p).tahap); return i >= 0 && i < TAHAP.length - 1 ? TAHAP[i + 1] : null; }
  function dr(p) { return getPendidikan(p).tahap === 'phd'; }
  /** Bonus peluang lobi portfolio (pecahan). */
  function bonusLobi(p) { return cari(getPendidikan(p).tahap).lobi || 0; }

  function statusSambung(p) {
    var d = getPendidikan(p), n = seterusnya(p);
    if (p && p.tamat) { return { boleh: false, sebab: 'Kerjaya sudah tamat.' }; }
    if (d.belajar) { return { boleh: false, sebab: 'Sedang belajar.' }; }
    if (!n) { return { boleh: false, sebab: 'Tahap tertinggi sudah dicapai.' }; }
    var kos = S().kosSebenar ? S().kosSebenar(p, n.myr) : n.myr;
    if ((Number(p.myr) || 0) < kos) { return { boleh: false, sebab: 'Dana tidak mencukupi (perlu RM ' + kos.toLocaleString('en') + ').' }; }
    return { boleh: true, sebab: '', kos: kos };
  }
  function sambung() {
    var p = S().loadPlayer(); if (!p) { return { ok: false, ralat: 'Tiada profil.' }; }
    var st = statusSambung(p); if (!st.boleh) { return { ok: false, ralat: st.sebab }; }
    var d = getPendidikan(p), n = seterusnya(p);
    d.belajar = { ke: n.kod, bulan: 0 }; rekod(d, p, 'Mula ' + n.nama);
    var r = simpan(d, { myr: -n.myr }, { tindakan: 'pendidikan_mula', nama: 'Sambung belajar: ' + n.nama, peringkat: 'ahli' });
    if (!r || !r.ok) { return { ok: false, ralat: r && r.ralat }; }
    return { ok: true, mesej: 'Anda mula pengajian ' + n.nama + ' secara separuh masa (' + n.bulan + ' bulan).' };
  }
  function tangguh() {
    var p = S().loadPlayer(), d = getPendidikan(p);
    if (!d.belajar) { return { ok: false, ralat: 'Tiada pengajian.' }; }
    var n = cari(d.belajar.ke); d.belajar = null; rekod(d, p, 'Tangguh ' + n.nama);
    var r = simpan(d, {}, { tindakan: 'pendidikan_tangguh', nama: 'Pengajian ditangguh: ' + n.nama, peringkat: 'ahli' });
    return { ok: !!(r && r.ok), mesej: 'Pengajian ' + n.nama + ' ditangguh. Yuran tidak dipulangkan.' };
  }

  function prosesBulan() {
    var p = S() && S().loadPlayer(), ev = [];
    if (!p || p.tamat) { return { peristiwa: ev }; }
    var d = getPendidikan(p), kes = {}, ubah = false;
    if (d.belajar) {
      var n = cari(d.belajar.ke);
      d.belajar.bulan += 1; ubah = true;
      if ((Number(p.ap) || 0) > 0) { kes.ap = -Math.min(CONFIG.AP_BULAN, Number(p.ap) || 0); }
      var s = ST(); if (s && s.laras) { s.laras({ stress: CONFIG.STRESS_BULAN }); }
      if (d.belajar.bulan >= n.bulan) {
        d.tahap = n.kod; d.belajar = null; kes.reputasi = n.reputasi; rekod(d, p, 'Tamat ' + n.nama);
        ev.push({ jenis: 'pendidikan_tamat', mesej: 'Tahniah! Anda menamatkan ' + n.nama + '. Reputasi +' + n.reputasi + '.' + (n.kod === 'phd' ? ' Anda kini bergelar Dr.' : '') });
      }
    }
    // Doktor Kehormat
    var K = KB(), kb = K && K.getKabinet ? K.getKabinet(p) : null;
    if (!d.kehormat && kb && kb.hasGovernmentRole && CONFIG.KEHORMAT.tahap.indexOf(kb.roleLevel) >= 0) {
      d.bulanKanan = (Number(d.bulanKanan) || 0) + 1; ubah = true;
      if (d.bulanKanan >= CONFIG.KEHORMAT.bulan) {
        d.kehormat = { tahun: p.tahun, bulan: p.bulan }; kes.reputasi = (kes.reputasi || 0) + CONFIG.KEHORMAT.reputasi; rekod(d, p, 'Doktor Kehormat');
        ev.push({ jenis: 'pendidikan_kehormat', mesej: 'Sebuah universiti menganugerahkan anda Doktor Kehormat. Reputasi +' + CONFIG.KEHORMAT.reputasi + '. (Tanpa awalan "Dr.")' });
      }
    }
    if (ubah) { p = S().loadPlayer(); simpan(d, kes, ev.length ? { tindakan: 'pendidikan', nama: ev[0].mesej, peringkat: 'ahli' } : undefined); }
    return { peristiwa: ev };
  }
  function ringkasan(p) {
    var d = getPendidikan(p), t = cari(d.tahap), b = d.belajar ? cari(d.belajar.ke) : null;
    return { tahap: t.kod, nama: t.nama, ikon: t.ikon, dr: d.tahap === 'phd', belajar: b ? { kod: b.kod, nama: b.nama, bulan: d.belajar.bulan, jumlah: b.bulan } : null,
      seterusnya: seterusnya(p), status: statusSambung(p), kehormat: d.kehormat, bonusLobi: Math.round(bonusLobi(p) * 100) };
  }
  return { CONFIG: CONFIG, TAHAP: TAHAP, tahapSah: tahapSah, getPendidikan: getPendidikan, seterusnya: seterusnya, dr: dr, bonusLobi: bonusLobi,
    statusSambung: statusSambung, sambung: sambung, tangguh: tangguh, prosesBulan: prosesBulan, ringkasan: ringkasan };
});
