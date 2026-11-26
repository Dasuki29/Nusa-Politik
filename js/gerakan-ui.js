/* ==========================================================================
   Nusa Politik — js/gerakan-ui.js   (v14.10, maklum balas baris 49)
   Kad "📣 Gerakan Parti Negeri" (tab Tindakan). Logik dalam js/gerakan.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var G = W.MyPolitikGerakan, S = W.MyPolitikSave;
  if (!G || !S) { return; }
  var pilih = null;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function UI() { return W.NusaUI || {}; }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('en'); }
  var KLAS = { Lemah: 'gk-lemah', Swing: 'gk-swing', Kubu: 'gk-kubu' };
  function kad(p) {
    try {
      var sn = G.senarai(p); if (!sn.negeri.length) { return ''; }
      var C = G.CONFIG, h = '<section class="card gk-kad"><h2 class="card__title" style="margin:0 0 4px">📣 Gerakan Parti Negeri</h2>';
      if (!sn.akses) { return h + '<p class="note">Naikkan Kekuatan Parti di negeri yang lemah. Perlu jawatan Ketua Bahagian (negeri sendiri) atau jawatan Pusat (semua negeri).</p></section>'; }
      h += '<p class="note">' + (sn.akses === 'semua' ? 'Jawatan Pusat: semua negeri.' : 'Ketua Bahagian: negeri sendiri sahaja.') + ' Klik negeri untuk program.</p>';
      var sel = sn.negeri.filter(function (n) { return n.kod === pilih; })[0] || sn.negeri.filter(function (n) { return n.kod === sn.rumah; })[0] || sn.negeri[0];
      h += '<table class="gk-jad"><thead><tr><th>Negeri</th><th>Kekuatan</th><th>Gerakan</th><th>Status</th></tr></thead><tbody>' + sn.negeri.map(function (n) {
        return '<tr data-gk-negeri="' + esc(n.kod) + '" class="' + (n === sel ? 'is-on' : '') + (n.boleh ? '' : ' is-kunci') + '"><td>' + esc(n.nama) + (n.kod === sn.rumah ? ' ★' : '') + '</td><td>' + n.asas + '</td><td' + (n.gerakan ? ' class="gk-plus"' : '') + '>' + (n.gerakan ? '+' + n.gerakan : '0') + '</td><td><span class="gk-st ' + KLAS[n.status] + '">' + n.status + '</span></td></tr>';
      }).join('') + '</tbody></table>';
      h += '<div class="gk-pilih"><h3>' + esc(sel.nama) + '</h3><div class="jm-meter__t"><span>Kekuatan Parti</span><b>' + sel.asas + ' + ' + sel.gerakan + ' = ' + sel.jumlah + ' / 100</b></div>' +
        '<div class="prkl-bar gk-bar"><i style="width:' + sel.asas + '%"></i><u style="left:' + sel.asas + '%;width:' + sel.gerakan + '%"></u></div>' +
        '<small class="note">Had Gerakan +' + C.HAD + ' setiap negeri. Susut 1 setiap ' + C.SUSUT_BULAN + ' bulan. Negeri lemah naik lebih cepat (×' + C.GANDA_LEMAH + ').</small>';
      Object.keys(C.PROGRAM).forEach(function (k) {
        var d = C.PROGRAM[k], s = G.semakProgram(p, sel.kod, k);
        var info = (d.ap ? d.ap + ' AP, ' : '') + rm(d.myr) + ' · Kekuatan +' + d.mata + (d.tetap ? ' (tidak susut)' : '') + (d.ahli ? ' · Ahli +' + d.ahli : '') + ' · ' + (d.kekerapan === 'bulanan' ? 'bulanan' : 'sekali setahun');
        h += '<div class="prkl-act"><div><b>' + esc(d.nama) + '</b><small>' + esc(info) + '</small>' + (s.boleh ? '' : '<small class="gk-sebab">' + esc(s.sebab) + '</small>') + '</div><button type="button" class="btn btn--sm' + (k === 'jelajah' ? ' btn--primary' : '') + '" data-gk="' + k + '" data-gk-kod="' + esc(sel.kod) + '"' + (s.boleh ? '' : ' disabled') + '>' + (k === 'jelajah' ? 'Jelajah' : k === 'cawangan' ? 'Buka' : 'Anjurkan') + '</button></div>';
      });
      h += '<small class="note">Kesan: Kekuatan Parti di peta; PRU +1 kerusi Parlimen setiap ' + C.PER_KERUSI + ' mata di negeri Lemah/Swing (maks +' + C.MAKS_KERUSI + '); negeri anda: undi kerusi dan peluang kerajaan negeri +1% setiap ' + C.PER_KERUSI + ' mata.</small></div>';
      return h + '</section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('click', function (ev) {
    var r = ev.target && ev.target.closest ? ev.target.closest('[data-gk-negeri]') : null;
    if (r) { pilih = r.getAttribute('data-gk-negeri'); if (UI().render) { UI().render(); } return; }
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-gk]') : null; if (!b || b.disabled) { return; }
    var h = G.jalankan(b.getAttribute('data-gk-kod'), b.getAttribute('data-gk'));
    if (UI().toast) { UI().toast(h.ok ? h.mesej : h.ralat, h.ok ? 'ok' : 'ralat'); }
    if (UI().render) { UI().render(); }
  });
  W.NusaGerakan_UI = { kad: kad };
})(window);
