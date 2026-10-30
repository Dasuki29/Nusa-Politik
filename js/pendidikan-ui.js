/* ==========================================================================
   Nusa Politik — js/pendidikan-ui.js   (v13.13)
   Kad "🎓 Pendidikan" di tab Profil (logik dalam js/pendidikan.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikPendidikan, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Number(n || 0).toLocaleString('en'); }
  function U() { return W.NusaUI || {}; }
  function kad(p) {
    try {
      if (p.tamat) { return ''; }
      var r = M.ringkasan(p), C = M.CONFIG, h = '<section class="card pdk-kad"><h2 class="card__title" style="margin:0 0 4px">🎓 Pendidikan</h2>';
      h += '<p class="pdk-tahap"><b>' + esc(r.ikon) + ' ' + esc(r.nama) + '</b>' + (r.dr ? ' <span class="badge">Dr.</span>' : '') + '</p>';
      if (r.bonusLobi) { h += '<p class="note">Peluang lobi portfolio +' + r.bonusLobi + '%.</p>'; }
      if (r.belajar) {
        var w = Math.round(r.belajar.bulan / r.belajar.jumlah * 100);
        h += '<div class="loy__row"><div class="loy__label"><span>' + esc(r.belajar.nama) + ' (sedang belajar)</span><b>' + r.belajar.bulan + ' / ' + r.belajar.jumlah + ' bulan</b></div>' +
          '<div class="progress progress--sm" role="progressbar" aria-label="' + esc(r.belajar.nama) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + w + '"><div class="progress__bar" style="width:' + w + '%"></div></div></div>' +
          '<button type="button" class="btn btn--sm btn--ghost" style="margin-top:6px" data-pdk="tangguh">⏸️ Tangguh pengajian</button>';
      } else if (r.seterusnya) {
        var n = r.seterusnya;
        h += '<button type="button" class="btn btn--sm btn--ghost" style="margin-top:4px" data-pdk="sambung"' + (r.status.boleh ? '' : ' disabled') + '>' + esc(n.ikon) + ' Sambung ' + esc(n.nama) + ' (' + rm(n.myr) + ', ' + n.bulan + ' bulan)</button>' +
          (r.status.boleh ? '' : ' <small class="note">' + esc(r.status.sebab) + '</small>');
      }
      h += '<p class="note">Pengajian separuh masa: AP bulanan −' + C.AP_BULAN + ' dan Stress +' + C.STRESS_BULAN + ' sebulan. Boleh ditangguh (yuran tidak dipulangkan). PhD sahaja memberi awalan "Dr.".</p>';
      if (r.kehormat) { h += '<p class="note">🎖️ Doktor Kehormat (tanpa awalan "Dr.")</p>'; }
      return h + '</section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('click', async function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-pdk]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-pdk'), r;
    if (a === 'tangguh' && U().modal) {
      var ya = await U().modal({ tajuk: 'Tangguh pengajian?', isi: '<p>Yuran tidak dipulangkan. Anda perlu bermula semula untuk tahap ini.</p>', butang: [{ label: 'Ya, tangguh', nilai: 'ya', kelas: 'btn--danger' }, { label: 'Batal', nilai: '', kelas: 'btn--ghost' }] });
      if (ya !== 'ya') { return; }
    }
    r = a === 'sambung' ? M.sambung() : a === 'tangguh' ? M.tangguh() : null;
    if (!r) { return; }
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  var st = W.document.createElement('style');
  st.textContent = '.pdk-tahap{margin:4px 0 6px;font-size:1rem}';
  W.document.head.appendChild(st);
  W.MyPolitikPendidikanUI = { kad: kad };
})(window);
