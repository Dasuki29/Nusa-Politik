/* ==========================================================================
   Nusa Politik — js/pbrs-ui.js   (v13.9)
   Kad "PBRS: Dua Gabungan BN & GRS" di tab Profil (logik dalam js/pbrs.js; PRN Sabah dalam js/sabah.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikPBRS, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Number(n || 0).toLocaleString('en'); }
  function U() { return W.NusaUI || {}; }
  function kv(a, b) { return '<div class="kv"><span>' + a + '</span><b>' + b + '</b></div>'; }
  var BULAN = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  function tb(i) { return BULAN[((i - 1) % 12)] + ' ' + Math.floor((i - 1) / 12); }
  function meter(label, n, warna) {
    var w = Math.max(0, Math.min(100, Math.round(n)));
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + w + ' / 100</b></div><div class="progress progress--sm" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + w + '"><div class="progress__bar" style="width:' + w + '%;background:' + warna + '"></div></div></div>';
  }
  function butang(aksi, label, s0) { return '<div style="margin-top:6px"><button type="button" class="btn btn--sm btn--ghost" data-pbrs="' + aksi + '"' + (s0.boleh ? '' : ' disabled') + '>' + label + '</button>' + (s0.boleh ? '' : ' <small class="note">' + esc(s0.sebab) + '</small>') + '</div>'; }
  function kad(p) {
    try {
      if (!M.adalah(p)) { return ''; }
      var C = M.CONFIG, k = M.kawasan(p), mt = M.meter(p), D = W.MyPolitikPBRSData || { dun: {} }, prn = M.prnIdx(p);
      var h = '<section class="card pbrs-kad"><h2 class="card__title" style="margin:0 0 4px">🌾 PBRS: Dua Gabungan BN &amp; GRS</h2>';
      h += '<p class="note">PBRS ialah komponen BN, tetapi kerajaan Sabah diketuai GRS. Imbangi kedua-duanya sebelum PRN Sabah.</p>';
      h += meter('Kesetiaan BN', mt.setiaBN, '#E8B600') + meter('Muhibah GRS', mt.muhibahGRS, '#2E8B57');
      h += butang('lobi', '🤝 Lobi BN Sabah (' + C.LOBI.ap + ' AP, ' + rm(C.LOBI.myr) + ', +' + C.LOBI.naik + ')', M.statusLobi(p)) +
        butang('muhibah', '🕊️ Majlis Muhibah GRS (' + C.MUHIBAH.ap + ' AP, ' + rm(C.MUHIBAH.myr) + ', +' + C.MUHIBAH.naik + ', BN −' + C.MUHIBAH.tolakBN + ')', M.statusMuhibah(p)) +
        butang('ma63', '📜 Kempen Hak Orang Asal &amp; MA63 (' + C.MA63.ap + ' AP, akar umbi +' + C.MA63.akarUmbi + ')', M.statusMA63(p));
      h += '<h3 class="pbrs-h">Kuota kerusi BN</h3>';
      if (k.parlimen) { h += kv('Bahagian ' + esc(k.parlimen.n), k.kuotaPL ? '✅ Parlimen dalam kuota PBRS' : '⛔ Parlimen di luar kuota PBRS'); }
      h += kv('Kuota DUN (PRN Sabah)', esc(M.kuotaDUN(p).map(function (x) { return (D.dun[x] || {}).n; }).join(', ')));
      if (k.dun) { h += kv('DUN anda: ' + esc(k.dun.n), k.kuotaDUN ? '✅ Dalam kuota' : '⛔ Di luar kuota'); }
      h += kv('PRN Sabah', esc(tb(prn)) + ' · rundingan ' + esc(tb(prn - C.RUNDING.bulanSebelum)));
      h += kv('GRS di kerusi PBRS', M.grsBertembung(p) ? '⚔️ Bertanding juga (3 penjuru, kekuatan ' + C.GRS.ofset + ')' : '🤝 Tidak meletak calon');
      h += '<p class="note">Kesetiaan BN ' + C.RUNDING.tinggi + ' ke atas: kuota DUN +1; bawah ' + C.RUNDING.rendah + ': kuota DUN −1. Muhibah GRS ' + C.GRS.ambang + ' ke atas: GRS tidak bertembung dengan PBRS. Kedua-dua meter susut perlahan ke arah 50.</p>';
      var seterus = M.tahunSeterusnya(p, p.tahun), kini = M.adalahTahunPemilihan(p, p.tahun);
      h += kv('Pemilihan parti', kini ? '🗳️ Tahun ini (' + p.tahun + ')' : 'Seterusnya ' + seterus + ' (setiap 3 tahun)');
      return h + '<p class="note" style="margin-top:8px">Mod ringan: perlembagaan PBRS tidak tersedia, jadi peraturan ini ialah andaian permainan.</p></section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-pbrs]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-pbrs'), r = a === 'lobi' ? M.lobi() : a === 'muhibah' ? M.muhibah() : a === 'ma63' ? M.ma63() : null;
    if (!r) { return; }
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  var st = W.document.createElement('style');
  st.textContent = '.pbrs-h{font-size:.92rem;margin:12px 0 4px}';
  W.document.head.appendChild(st);
  W.MyPolitikPBRSUI = { kad: kad };
})(window);
