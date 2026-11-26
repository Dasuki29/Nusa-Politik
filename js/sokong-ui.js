/* ==========================================================================
   Nusa Politik — js/sokong-ui.js   (v14.8, maklum balas baris 50)
   Kad "🗳️ Pertandingan Lain" (tab Pemilihan). Logik dalam js/sokong.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var SK = W.MyPolitikSokong, S = W.MyPolitikSave;
  if (!SK || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function UI() { return W.NusaUI || {}; }
  function kad(p) {
    try {
      var s = SK.senarai(p); if (!s.length) { return ''; }
      var r = SK.ringkas(p), penuh = r.bil >= r.had, apK = (Number(p.ap) || 0) < r.ap;
      var h = '<section class="card sk-kad"><h2 class="card__title" style="margin:0 0 4px">🗳️ Pertandingan Lain</h2>' +
        '<p class="note">Lihat calon jawatan yang anda tidak bertanding. Sokong seorang calon setiap jawatan (' + r.ap + ' AP, kekuatan calon +' + r.bonus + '). Sokongan tahun ini: ' + r.bil + '/' + r.had + '.</p>';
      s.forEach(function (pt) {
        h += '<div class="sk-pt' + (pt.pilih ? ' is-on' : '') + '"><h3><span>' + esc(pt.jawatan) + '</span><small>' + pt.calon.length + ' calon</small></h3>';
        pt.calon.forEach(function (c) {
          var ket = [c.penyandang ? 'Penyandang' : 'Pencabar']; if (c.pesaing) { ket.push('Pesaing utama anda'); } if (c.hubungan !== 50) { ket.push('Hubungan ' + c.hubungan + '/100'); }
          var boleh = !pt.pilih && !pt.keputusan && !pt.tamat && !c.pesaing && !penuh && !apK;
          h += '<div class="sk-cl"><div class="sk-n"><b>' + esc(c.nama) + (c.disokong ? ' <span class="sk-tag">Disokong</span>' : '') + '</b><small>' + esc(ket.join(' · ')) + '</small></div>' +
            '<div class="prkl-bar sk-bar" title="' + c.peluang + '%"><i style="width:' + c.peluang + '%"></i></div>' +
            (c.disokong ? '<button type="button" class="btn btn--sm" disabled>✔ Disokong</button>' : '<button type="button" class="btn btn--sm" data-sk="' + esc(pt.kod) + '" data-sk-nama="' + esc(c.nama) + '"' + (boleh ? '' : ' disabled') + '>Sokong</button>') + '</div>';
        });
        if (pt.keputusan) { h += '<small class="note">Keputusan: ' + esc(pt.keputusan.pemenang) + ' menang' + (pt.keputusan.menang ? ' (calon anda).' : '.') + '</small>'; }
        h += '</div>';
      });
      return h + '<small class="note">Bar ialah anggaran peluang (tinjauan dalaman), bukan keputusan pasti. Keputusan diumumkan apabila musim peringkat itu tamat.</small></section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-sk]') : null; if (!b || b.disabled) { return; }
    var r = SK.sokong(b.getAttribute('data-sk'), b.getAttribute('data-sk-nama'));
    if (UI().toast) { UI().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (UI().render) { UI().render(); }
  });
  W.MyPolitikSokongUI = { kad: kad };
})(window);
