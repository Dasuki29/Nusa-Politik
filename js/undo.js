/* ==========================================================================
   Nusa Politik — js/undo.js   (v8.15)
   Butang Undo: membatalkan SATU tindakan terakhir.
   Peraturan (cadangan yang diluluskan pengguna):
     - Skop: satu tindakan terakhir sahaja (gambar simpanan sebelum tindakan, bukan sejarah panjang).
     - Had: 3 undo setiap tahun dalam permainan. Percuma (tiada kos AP).
     - Mod Hardcore: dimatikan.
     - Dikunci jika keadaan permainan berubah selepas tindakan itu (Bulan Seterusnya, acara rawak,
       PRU, audit / pengisytiharan SPRM, tindakan lain): simpanan "akhir" tidak lagi sepadan.
     - Tindakan yang menghasilkan keputusan rawak (aduan disiplin, isu rawak) dikunci terus oleh pemanggil: kunci().
   Gambar simpanan: rentetan mentah localStorage bagi watak aktif, acara dan pencapaian.
   ANDAIAN: had 3 setahun dan skop satu tindakan ialah angka cadangan, bukan peraturan tetap.
   API
     mula(label)    ambil gambar SEBELUM tindakan
     tamat()        selepas bahagian segerak tindakan: jika keadaan berubah, simpan; jika tidak, buang
     keadaan(p)     { boleh, sebab, label, baki, had }
     ringkasBeza()  { ip, myr, ap } perubahan yang akan dibatalkan (untuk pengesahan)
     undo()         { ok, mesej | ralat }  (pemanggil memuat semula halaman)
     kunci()        buang gambar
     rawak()        tanda tindakan ini keputusan rawak (tiada undo)
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikUndo = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  var KEY = 'myPolitik_undo';
  var KUNCI_DATA = { player: 'myPolitik_player', events: 'myPolitik_events', pencapaian: 'myPolitik_pencapaian' };
  var CONFIG = { HAD_TAHUN: 3 };
  var tunggu = null;                                   // gambar sebelum tindakan yang sedang berjalan

  function S() { try { return root.localStorage || null; } catch (e) { return null; } }
  function baca(k) { var s = S(); try { return s ? s.getItem(k) : null; } catch (e) { return null; } }
  function tulis(k, v) { var s = S(); if (!s) { return false; } try { if (v === null || v === undefined) { s.removeItem(k); } else { s.setItem(k, v); } return true; } catch (e) { return false; } }
  function profil() { var raw = baca(KUNCI_DATA.player); try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
  function gambar() { var o = {}; Object.keys(KUNCI_DATA).forEach(function (j) { o[j] = baca(KUNCI_DATA[j]); }); return o; }
  function gabung(g) { return JSON.stringify([g.player, g.events, g.pencapaian]); }

  function rekod() { var raw = baca(KEY); try { var r = raw ? JSON.parse(raw) : null; return r && typeof r === 'object' ? r : {}; } catch (e) { return {}; } }
  function simpanRekod(r) { tulis(KEY, JSON.stringify(r)); }
  function hardcore(p) { return !!(p && p.settings && p.settings.difficultyLevel === 'HARDCORE'); }
  function gunaTahun(r, p) { return r && r.id === p.id && r.tahun === p.tahun ? (Number(r.guna) || 0) : 0; }

  function mula(label) {
    var p = profil();
    if (!p || p.tamat || hardcore(p)) { tunggu = null; return false; }
    tunggu = { id: p.id, tahun: p.tahun, label: String(label || 'Tindakan').slice(0, 60), sebelum: gambar() };
    return true;
  }

  function tamat() {
    var t = tunggu; tunggu = null;
    if (!t) { return false; }
    var p = profil();
    if (!p || p.id !== t.id) { return false; }
    if (t.rawak) { return false; }                                           // keputusan rawak: tidak boleh diulang
    var sekarang = gambar();
    if (gabung(sekarang) === gabung(t.sebelum)) { return false; }          // tindakan gagal / tiada perubahan: tiada undo digunakan
    var r = rekod();
    simpanRekod({ id: p.id, tahun: p.tahun, guna: gunaTahun(r, p), snap: { label: t.label, sebelum: t.sebelum, akhir: gabung(sekarang) } });
    return true;
  }

  /** Tandakan tindakan semasa (atau yang terakhir) sebagai keputusan rawak: tiada undo. Selamat dipanggil sebelum atau selepas tamat(). */
  function rawak() { if (tunggu) { tunggu.rawak = true; } else { kunci(); } }
  function kunci() { var r = rekod(); if (r.snap) { r.snap = null; simpanRekod(r); } }

  function keadaan(p) {
    p = p || profil();
    var had = CONFIG.HAD_TAHUN;
    if (!p) { return { boleh: false, sebab: 'Tiada watak.', label: '', baki: 0, had: had }; }
    var r = rekod(), baki = Math.max(0, had - gunaTahun(r, p));
    var o = { boleh: false, sebab: '', label: '', baki: baki, had: had, hardcore: hardcore(p) };
    if (hardcore(p)) { o.sebab = 'Mod Hardcore: undo dimatikan.'; return o; }
    if (p.tamat) { o.sebab = 'Kerjaya telah tamat.'; return o; }
    if (!r.snap || r.id !== p.id) { o.sebab = 'Tiada tindakan untuk dibatalkan.'; return o; }
    o.label = r.snap.label;
    if (gabung(gambar()) !== r.snap.akhir) { o.sebab = 'Tidak boleh undo: keadaan telah berubah selepas tindakan itu (bulan, acara, keputusan atau tindakan lain).'; return o; }
    if (baki <= 0) { o.sebab = 'Had undo tahun ini telah habis.'; return o; }
    o.boleh = true; return o;
  }

  function nilai(raw, k) { try { var p = JSON.parse(raw); return Number(p && p[k]) || 0; } catch (e) { return 0; } }
  /** Perubahan yang akan dibatalkan: nilai selepas tindakan tolak nilai sebelum. */
  function ringkasBeza() {
    var r = rekod(); if (!r.snap) { return null; }
    var now = baca(KUNCI_DATA.player), asal = r.snap.sebelum.player;
    return { ip: nilai(now, 'ip') - nilai(asal, 'ip'), myr: nilai(now, 'myr') - nilai(asal, 'myr'), ap: nilai(now, 'ap') - nilai(asal, 'ap') };
  }

  function undo() {
    var p = profil(), k = keadaan(p);
    if (!k.boleh) { return { ok: false, ralat: k.sebab || 'Tidak boleh undo.' }; }
    var r = rekod(), sebelum = r.snap.sebelum;
    Object.keys(KUNCI_DATA).forEach(function (j) { tulis(KUNCI_DATA[j], sebelum[j]); });
    simpanRekod({ id: r.id, tahun: r.tahun, guna: gunaTahun(r, p) + 1, snap: null });
    return { ok: true, mesej: 'Tindakan "' + r.snap.label + '" dibatalkan. Baki undo tahun ini: ' + Math.max(0, CONFIG.HAD_TAHUN - gunaTahun(r, p) - 1) + '.', label: r.snap.label };
  }

  return { CONFIG: CONFIG, mula: mula, tamat: tamat, kunci: kunci, rawak: rawak, keadaan: keadaan, ringkasBeza: ringkasBeza, undo: undo };
});
