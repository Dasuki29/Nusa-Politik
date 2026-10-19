/* ==========================================================================
   Nusa Politik — js/slot.js   (v5.4)
   Slot simpanan berbilang (maks 5). Setiap slot menyimpan satu watak lengkap:
   profil pemain, acara rawak dan kemajuan tutorial.

   Reka bentuk: kunci biasa (myPolitik_player / _events / _tutorial) sentiasa mewakili
   slot AKTIF, jadi modul lain tidak berubah. Apabila slot ditukar, kandungan slot lama
   disalin ke kunci slotnya (myPolitik_slot<N>_*) dan kandungan slot baharu dimuatkan
   ke kunci biasa. Simpanan lama (satu watak) menjadi slot 1 secara automatik.

   Penukaran slot dibuat pada menu utama (index.html), sebelum dashboard dimuatkan.
   API: MAKS, aktif(), senarai(), ringkasan(n), slotKosong(), aktifkan(n), padam(n)
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikSlot = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  var MAKS = 5, INDEKS = 'myPolitik_slot_aktif';
  var KANON = { player: 'myPolitik_player', player_bak: 'myPolitik_player_bak', events: 'myPolitik_events', tutorial: 'myPolitik_tutorial' };
  var JENIS = Object.keys(KANON);

  function S() { try { return root.localStorage || null; } catch (e) { return null; } }
  function kunciSlot(n, j) { return 'myPolitik_slot' + n + '_' + j; }
  function sahNo(n) { if (typeof n === 'string') { n = n.replace(/^slot_/i, ''); } n = parseInt(n, 10); return n >= 1 && n <= MAKS ? n : 0; }     // v7.25: terima 'slot_1' … 'slot_5'

  function aktif() {
    var s = S(); if (!s) { return 1; }
    try { return sahNo(s.getItem(INDEKS)) || 1; } catch (e) { return 1; }
  }

  function baca(k) { var s = S(); try { return s ? s.getItem(k) : null; } catch (e) { return null; } }
  function tulis(k, v) { var s = S(); if (!s) { return; } if (v === null || v === undefined) { s.removeItem(k); } else { s.setItem(k, v); } }

  /** Ringkasan satu slot, atau null jika kosong. */
  function ringkasan(n) {
    n = sahNo(n); if (!n) { return null; }
    var raw = n === aktif() ? baca(KANON.player) : baca(kunciSlot(n, 'player')), p = null;
    try { p = raw ? JSON.parse(raw) : null; } catch (e) { p = null; }
    if (!p || typeof p !== 'object' || !p.nama) { return null; }
    var d = p.demografik || {}, umur = isFinite(parseInt(d.umur, 10)) ? parseInt(d.umur, 10) + Math.max(0, (parseInt(p.tahun, 10) || 2026) - 2026) : null;
    return {
      no: n, nama: p.nama, jawatan: p.jawatan || 'Ahli Biasa', cawangan: p.cawangan || '', tahun: p.tahun || 2026, bulan: p.bulan || 1,
      umur: umur, kategori: d.kategori || '', avatar: p.avatar || d.kategoriKod || 'pemuda', tamat: !!p.tamat
    };
  }

  function senarai() {
    var a = aktif(), r = [];
    for (var n = 1; n <= MAKS; n++) { r.push({ no: n, aktif: n === a, ringkas: ringkasan(n) }); }
    return r;
  }

  /** Nombor slot kosong pertama (mengutamakan slot aktif jika kosong), atau 0 jika semua penuh. */
  function slotKosong() {
    if (!ringkasan(aktif())) { return aktif(); }
    for (var n = 1; n <= MAKS; n++) { if (!ringkasan(n)) { return n; } }
    return 0;
  }

  /** Jadikan slot n aktif: simpan slot semasa, muatkan slot n. Pulang { ok } atau { ok:false, ralat }. */
  function aktifkan(n) {
    n = sahNo(n); if (!n) { return { ok: false, ralat: 'Nombor slot tidak sah.' }; }
    var s = S(); if (!s) { return { ok: false, ralat: 'Pelayar menyekat storan setempat.' }; }
    var lama = aktif();
    if (n === lama) { return { ok: true, tukar: false }; }
    try {
      JENIS.forEach(function (j) { tulis(kunciSlot(lama, j), baca(KANON[j])); });         // simpan slot lama
      JENIS.forEach(function (j) { tulis(KANON[j], baca(kunciSlot(n, j))); tulis(kunciSlot(n, j), null); });   // muat slot baharu
      s.setItem(INDEKS, String(n));
    } catch (e) {
      return { ok: false, ralat: 'Gagal menukar slot (storan penuh atau disekat).' };
    }
    return { ok: true, tukar: true };
  }

  /** Padam slot n (termasuk acara dan tutorial). */
  function padam(n) {
    n = sahNo(n); if (!n) { return { ok: false, ralat: 'Nombor slot tidak sah.' }; }
    try {
      JENIS.forEach(function (j) { tulis(kunciSlot(n, j), null); if (n === aktif()) { tulis(KANON[j], null); } });
    } catch (e) { return { ok: false, ralat: 'Gagal memadam slot.' }; }
    return { ok: true };
  }

  /* ------------------------------------------------------------------
     v7.68: Pindah career antara peranti (tanpa akaun, tanpa pelayan).
     Eksport watak slot AKTIF sebagai kod 'NUSA1.<base64>' atau fail JSON; import ke slot kosong (atau ganti slot dipilih).
     Format: { format:'nusa-politik-save', v:1, masa, player, events, tutorial }. Data tidak keluar dari pelayar kecuali disalin pengguna.
     ------------------------------------------------------------------ */
  var FORMAT = 'nusa-politik-save', AWALAN = 'NUSA1.', DATA_JENIS = ['player', 'events', 'tutorial'], SANDAR_IMPORT = 'myPolitik_import_sandar';

  function b64enc(t) { return root.btoa(unescape(encodeURIComponent(t))); }
  function b64dec(t) { return decodeURIComponent(escape(root.atob(t))); }

  /** Objek eksport bagi slot aktif, atau null jika tiada watak. */
  function eksport() {
    var o = { format: FORMAT, v: 1, masa: new Date().toISOString() };
    DATA_JENIS.forEach(function (j) { var r = baca(KANON[j]); try { o[j] = r ? JSON.parse(r) : null; } catch (e) { o[j] = null; } });
    if (!o.player || typeof o.player !== 'object' || !o.player.nama) { return null; }
    return o;
  }
  function kod(o) { return AWALAN + b64enc(JSON.stringify(o)); }
  function teksFail(o) { return JSON.stringify(o); }

  /** Urai kod NUSA1 atau teks JSON. Pulang { ok, data, ringkas } atau { ok:false, ralat }. */
  function urai(teks) {
    var t = String(teks == null ? '' : teks).replace(/^\uFEFF/, '').trim(), o = null;
    if (!t) { return { ok: false, ralat: 'Tiada kod atau fail.' }; }
    try { o = t.indexOf(AWALAN) === 0 ? JSON.parse(b64dec(t.slice(AWALAN.length).replace(/\s+/g, ''))) : JSON.parse(t); } catch (e) { return { ok: false, ralat: 'Kod simpanan tidak sah atau rosak.' }; }
    if (!o || typeof o !== 'object' || o.format !== FORMAT) { return { ok: false, ralat: 'Ini bukan fail simpanan Nusa Politik.' }; }
    if (!(parseInt(o.v, 10) >= 1) || parseInt(o.v, 10) > 1) { return { ok: false, ralat: 'Versi simpanan tidak disokong. Kemas kini permainan dahulu.' }; }
    var p = o.player;
    if (!p || typeof p !== 'object' || typeof p.nama !== 'string' || !p.nama) { return { ok: false, ralat: 'Data watak tiada atau rosak.' }; }
    var d = {};
    DATA_JENIS.forEach(function (j) { d[j] = (o[j] && typeof o[j] === 'object') ? o[j] : null; });
    var dm = p.demografik || {};
    return { ok: true, data: { format: FORMAT, v: 1, masa: o.masa || '', player: d.player, events: d.events, tutorial: d.tutorial },
      ringkas: { nama: p.nama, jawatan: p.jawatan || 'Ahli Biasa', cawangan: p.cawangan || '', tahun: p.tahun || 2026, bulan: p.bulan || 1, versi: p.versi || '', umur: dm.umur || null } };
  }

  /** Pasang data ke slot n. Jika slot berisi, sandaran watak lama disimpan dahulu. Pulang { ok, slot, ganti } atau { ok:false, ralat }. */
  function pasang(n, data) {
    n = sahNo(n); if (!n) { return { ok: false, ralat: 'Nombor slot tidak sah.' }; }
    if (!data || !data.player) { return { ok: false, ralat: 'Data tiada.' }; }
    var s = S(); if (!s) { return { ok: false, ralat: 'Pelayar menyekat storan setempat.' }; }
    var ganti = !!ringkasan(n), aktifIni = n === aktif();
    try {
      if (ganti) { var lama = {}; DATA_JENIS.forEach(function (j) { lama[j] = baca(aktifIni ? KANON[j] : kunciSlot(n, j)); }); s.setItem(SANDAR_IMPORT, JSON.stringify({ slot: n, masa: new Date().toISOString(), data: lama })); }
      DATA_JENIS.forEach(function (j) { tulis(aktifIni ? KANON[j] : kunciSlot(n, j), data[j] ? JSON.stringify(data[j]) : null); });
      if (aktifIni) { tulis(KANON.player_bak, null); } else { tulis(kunciSlot(n, 'player_bak'), null); }
    } catch (e) { return { ok: false, ralat: 'Gagal menyimpan (storan penuh atau disekat).' }; }
    return { ok: true, slot: n, ganti: ganti };
  }

  /** Import ke slot kosong pertama (tidak menggantikan watak). Pulang { ok, slot } atau { ok:false, penuh:true }. */
  function pasangPantas(data) {
    var n = 0, a = aktif();
    if (!ringkasan(a)) { n = a; } else { for (var i = 1; i <= MAKS; i++) { if (!ringkasan(i)) { n = i; break; } } }
    if (!n) { return { ok: false, penuh: true, ralat: 'Semua slot penuh. Pilih slot untuk diganti.' }; }
    return pasang(n, data);
  }

  return { MAKS: MAKS, nombor: sahNo, kunci: kunciSlot, aktif: aktif, senarai: senarai, ringkasan: ringkasan, slotKosong: slotKosong, aktifkan: aktifkan, padam: padam,
    eksport: eksport, kod: kod, teksFail: teksFail, urai: urai, pasang: pasang, pasangPantas: pasangPantas, AWALAN: AWALAN };
});
