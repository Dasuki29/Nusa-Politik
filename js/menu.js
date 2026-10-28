/* ==========================================================================
   Nusa Politik — js/menu.js   (v4.0)
   Menu utama pada index.html. Hanya mengawal paparan: butang Sambung membuka
   dashboard.html, Permainan Baharu memaparkan borang pendaftaran sedia ada.
   Tiada logik permainan diubah. Perlu dimuatkan selepas js/save.js dan js/app.js.
   ========================================================================== */
(function () {
  'use strict';
  var menu = document.getElementById('menu');
  if (!menu) { return; }

  var S = window.MyPolitikSave, body = document.body;
  var btnSambung = document.getElementById('menu-sambung'), info = document.getElementById('menu-sambung-info');
  var btnKembali = document.getElementById('btn-menu'), bantuan = document.getElementById('menu-bantuan');

  function tunjukMenu() {
    menu.hidden = false; body.classList.add('menu-aktif');
    if (btnKembali) { btnKembali.hidden = true; }
    try { if (location.hash) { history.replaceState(null, '', location.pathname + location.search); } } catch (e) { /* abaikan */ }
    segerak();
    menu.scrollTop = 0;
  }

  function tunjukBorang(sasaran) {
    menu.hidden = true; body.classList.remove('menu-aktif');
    if (btnKembali) { btnKembali.hidden = false; }
    try { history.replaceState(null, '', location.pathname + location.search + '#daftar'); } catch (e) { /* abaikan */ }
    var el = sasaran ? document.getElementById(sasaran) : document.getElementById('nama') || document.getElementById('f-nama');
    if (el) {
      if (sasaran) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      else { window.scrollTo(0, 0); }
    }
  }

  /** Papar butang Sambung hanya jika ada permainan disimpan. */
  function segerak() {
    var p = null;
    try { p = S && S.loadPlayer ? S.loadPlayer() : null; } catch (e) { p = null; }
    if (!btnSambung) { return; }
    btnSambung.hidden = !p;
    if (p && info) {
      info.textContent = (window.MyPolitikSlot ? 'Slot ' + window.MyPolitikSlot.aktif() + ' · ' : '') + p.nama + ' · ' + p.jawatan + ' · Cawangan ' + p.cawangan + ' · ' + p.tahun + ', bulan ' + (p.bulan || 1);
    }
  }

  /** v5.4: watak baharu menggunakan slot kosong supaya watak sedia ada tidak terpadam. */
  function permainanBaharu() {
    var Sl = window.MyPolitikSlot;
    if (!Sl || !Sl.ringkasan(Sl.aktif())) { tunjukBorang(); return; }       // slot aktif kosong: terus daftar
    var k = Sl.slotKosong();
    if (k && Sl.aktifkan(k).ok) { try { history.replaceState(null, '', location.pathname + '#daftar'); } catch (e) { /* abaikan */ } location.reload(); return; }
    if (window.MyPolitikSlotPanel) { window.MyPolitikSlotPanel.buka('Semua slot penuh. Padam satu watak untuk memulakan watak baharu.'); }
  }

  menu.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-menu]') : null;
    if (!b) { return; }
    var a = b.getAttribute('data-menu');
    if (a === 'sambung') { window.location.assign('dashboard.html'); }
    else if (a === 'baharu') { permainanBaharu(); }
    else if (a === 'parti') {                                                  // v12.0: cip parti pada poster: watak baharu dengan parti itu dipilih
      var kp = b.getAttribute('data-parti');
      try { sessionStorage.setItem('nusa_parti_mula', kp); } catch (eP) { /* abaikan */ }
      permainanBaharu();
      var sp = document.getElementById('s-parti');
      if (sp && menu.hidden) { try { sessionStorage.removeItem('nusa_parti_mula'); } catch (eR) { /* abaikan */ } if (sp.value !== kp) { sp.value = kp; sp.dispatchEvent(new Event('change')); } }
    }
    else if (a === 'slot' && window.MyPolitikSlotPanel) { window.MyPolitikSlotPanel.buka(); }
    else if (a === 'lagu') { tunjukBorang('kad-lagu'); }
    else if (a === 'bantuan' && bantuan) {
      bantuan.hidden = !bantuan.hidden;
      b.setAttribute('aria-expanded', String(!bantuan.hidden));
    }
  });

  if (btnKembali) { btnKembali.addEventListener('click', tunjukMenu); }

  /* v12.0: tali bendera kempen (segi tiga merah, putih, hitam, kuning) di atas menu */
  (function () {
    var host = menu.querySelector('[data-bunting]'); if (!host) { return; }
    var w = ['#E4002B', '#FFFFFF', '#111111', '#F2B705'], n = 30, h = '<svg viewBox="0 0 1200 54" preserveAspectRatio="none"><path d="M0 6 Q600 34 1200 6" fill="none" stroke="#111" stroke-width="2"/>';
    for (var i = 0; i < n; i++) { var x = 8 + i * (1184 / n), t = x / 1200, y = 6 + 56 * t * (1 - t); h += '<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'l30 0 -15 20z" fill="' + w[i % 4] + '" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/>'; }
    host.innerHTML = h + '</svg>';
  })();

  // Pautan terus ke borang (#daftar) melangkau menu
  if (location.hash === '#daftar') { tunjukBorang(); } else { tunjukMenu(); }
})();
