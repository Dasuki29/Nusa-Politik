/* ==========================================================================
   Nusa Politik — js/isu-ui.js   (v12.2)
   Kad "Isu Semasa" di tab Tindakan (logik dalam js/isu.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var I = W.MyPolitikIsu, S = W.MyPolitikSave;
  if (!I || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function kad(p) {
    try {
      var s = p && I.semasa(p); if (!s) { return ''; }
      return '<section class="card isu-kad" aria-labelledby="isu-tajuk"><p class="isu-label">' + esc(s.isu.ikon) + ' Isu Semasa · ' + (s.kerajaan ? 'parti anda dalam kerajaan' : 'parti anda pembangkang') + '</p>' +
        '<h2 class="card__title" id="isu-tajuk" style="margin:0 0 4px">' + esc(s.isu.tajuk) + '</h2><p class="note">' + esc(s.isu.huraian) + ' Nyatakan pendirian anda sebelum bulan depan.</p><ul class="acara__pil">' +
        s.pilihan.map(function (o) { return '<li><button type="button" class="acara__opsi" data-isu="' + esc(o.id) + '"><b>' + esc(o.label) + '</b><small class="acara__kesan">' + esc(o.ringkas) + '</small></button></li>'; }).join('') + '</ul></section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-isu]') : null; if (!b) { return; }
    var r = I.jawab(b.getAttribute('data-isu')), U = W.NusaUI || {};
    if (U.toast) { U.toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (U.render) { U.render(); }
  });
  W.MyPolitikIsuUI = { kad: kad };
})(window);
