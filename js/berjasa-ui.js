/* ==========================================================================
   Nusa Politik — js/berjasa-ui.js   (v13.53)
   Kad "🌙 BERJASA: Parti Kecil" di tab Profil (logik dalam js/berjasa.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikBERJASA, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('en'); }
  function UI() { return W.NusaUI || {}; }
  function btn(id, teks, t, kelas) { return '<button type="button" class="btn btn--sm' + (kelas ? ' ' + kelas : '') + '" data-bj="' + id + '"' + (t && t.boleh === false ? ' disabled' : '') + '>' + esc(teks) + '</button>'; }
  function act(tajuk, info, t, b) { return '<div class="prkl-act"><div><b>' + tajuk + '</b><small>' + esc(info) + '</small>' + (t && !t.boleh && t.sebab && !t.sudah ? '<small class="jm-amaran">' + esc(t.sebab) + '</small>' : '') + '</div>' + b + '</div>'; }
  function kad(p) {
    try {
      if (!M.adalah(p)) { return ''; }
      var C = M.CONFIG, k = M.keadaan(p), kw = M.kawasan(p), h = '<section class="card bj-kad">';
      h += '<div class="bj-ban"><img src="assets/images/logo-berjasa.png" alt="" width="40" height="40"><div><b>🌙 BERJASA: Parti Kecil</b><small>Tanpa gabungan (Lain-lain) · undi parti ±' + k.undi + '%</small></div></div>';
      if (kw.parlimen) { h += '<p class="note">Kawasan ' + esc(kw.parlimen.n) + ' · Bumiputera ' + kw.parlimen.m + '% · anggaran ' + Number(kw.parlimen.a || 0).toLocaleString('en') + ' ahli dalam ' + kw.parlimen.b + ' Cawangan.</p>'; }
      h += '<div class="jm-meter__t"><span>Kekuatan Parti</span><b>' + Math.round(k.kekuatan) + '/100</b></div><div class="prkl-bar bj-bar"><i style="width:' + Math.round(k.kekuatan) + '%"></i></div>';
      h += '<small class="note">Naik melalui Dakwah & rekrut ahli dan kemenangan kerusi. Menentukan undi parti (' + C.KEKUATAN.undiMin + '% hingga ' + C.KEKUATAN.undiMaks + '%) dan kekuatan calon BERJASA (ofset undi kerusi ' + (k.ofset > 0 ? '+' : '') + k.ofset + ').</small>';
      h += '<h3 style="margin:10px 0 4px">📋 Tindakan</h3>';
      h += act('📣 Dakwah & rekrut ahli', C.DAKWAH.ap + ' AP · ' + rm(C.DAKWAH.myr) + ' · sekali sebulan · Kekuatan +' + C.DAKWAH.kekuatan + ', sokongan akar umbi +' + C.DAKWAH.akarUmbi, k.dakwah, btn('dakwah', 'Mula', k.dakwah));
      var pk = k.pakatan;
      if (pk) {
        h += act('🤝 Pakatan pilihan raya', pk.jaya ? 'Berjaya: ' + pk.gab + ' tidak meletak calon di ' + pk.kerusi + ' kerusi BERJASA.' : 'Gagal: ' + pk.gab + ' menolak. BERJASA bertanding solo.', null, '');
      } else {
        h += act('🤝 Pakatan pilihan raya', C.PAKATAN.bulanSebelum + ' bulan sebelum PRU · runding dengan PN atau BN untuk 1-3 kerusi tanpa pertembungan · peluang ' + k.peluangPakatan + '%. Gagal: bertanding solo.', k.statusPakatan,
          '<span class="pbg-3">' + btn('pakatan:PN', 'PN', k.statusPakatan) + btn('pakatan:BN', 'BN', k.statusPakatan) + '</span>');
      }
      h += act('🗳️ PRU solo', 'Tanpa pakatan, calon BERJASA boleh bertanding di mana-mana kawasan operasi tetapi sukar menang. Kekuatan, sokongan dan Reputasi menentukan peluang.', null, '');
      var pn = k.penentu, sp = k.statusPenentu;
      if (pn && pn.pru && sp.sudah) { h += act('⚖️ Penentu kerajaan', pn.jaya ? 'Sokongan kepada ' + pn.gab + ' diterima: anda Timbalan Menteri.' : 'Sokongan kepada ' + pn.gab + ' ditolak.', null, ''); }
      else {
        h += act('⚖️ Penentu kerajaan', 'Ahli Parlimen BERJASA, ' + C.PENENTU.bulan + ' bulan selepas PRU · tawar sokongan kepada BN, PN atau PH untuk jawatan Timbalan Menteri · peluang ' + k.peluangPenentu + '%', sp,
          '<span class="pbg-3">' + btn('sokong:BN', 'BN', sp) + btn('sokong:PN', 'PN', sp) + btn('sokong:PH', 'PH', sp) + '</span>');
      }
      h += '<p class="note">⚠️ Struktur, takwim dan angka BERJASA ialah andaian permainan.</p>';
      return h + '</section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-bj]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-bj'), r = null;
    if (a === 'dakwah') { r = M.dakwah(); }
    else if (a.indexOf('pakatan:') === 0) { r = M.runding(a.slice(8)); }
    else if (a.indexOf('sokong:') === 0) { r = M.sokong(a.slice(7)); }
    if (!r) { return; }
    if (UI().toast) { UI().toast(r.ok ? r.mesej : r.ralat, r.ok ? (r.jaya === false ? 'info' : 'ok') : 'ralat'); }
    if (UI().render) { UI().render(); }
  });
  W.MyPolitikBERJASAUI = { kad: kad };
})(window);
