/* ==========================================================================
   Nusa Politik — js/npc-ui.js   (v13.20)
   Kad "Lantikan: Kekalkan atau Ubah" di tab Tindakan (logik dalam js/npc.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikNPC, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function U() { return W.NusaUI || {}; }
  function kad(p) {
    try {
      var l = M.lantikanAktif(p), s = l ? M.senarai(p) : [];
      if (!l || !s.length) { return ''; }
      var C = M.CONFIG, h = '<section class="card npc-kad"><h2 class="card__title" style="margin:0 0 4px">📋 Lantikan: Kekalkan atau Ubah</h2>' +
        '<p class="note">Anda menang sebagai Ketua. Kekalkan pegawai sedia ada atau lantik penyokong anda. Yang belum dipilih dikekalkan pada akhir bulan.</p>';
      s.forEach(function (x) {
        h += '<div class="npc-baris"><div class="npc-teks"><b>' + esc(x.jawatan) + '</b><small class="note">' + esc(x.nama) + (x.keputusan ? ' · ' + (x.keputusan === 'kekal' ? '✅ dikekalkan' : '🔄 baharu') : '') + '</small></div>';
        if (!x.keputusan) {
          h += '<div class="npc-btn"><button type="button" class="btn btn--sm btn--ghost" data-npc="kekal" data-i="' + x.i + '">Kekalkan</button>' +
            x.pilihan.map(function (n) { return '<button type="button" class="btn btn--sm btn--ghost" data-npc="ubah" data-i="' + x.i + '" data-nama="' + esc(n) + '">🔄 ' + esc(n) + '</button>'; }).join('') + '</div>';
        }
        h += '</div>';
      });
      return h + '<button type="button" class="btn btn--sm btn--primary" style="margin-top:8px" data-npc="semua">Kekalkan semua yang belum dipilih</button>' +
        '<p class="note" style="margin-top:6px">Kekalkan: sokongan AJK +' + C.KEKAL.ajk + '. Ubah: sokongan AJK ' + C.UBAH.ajk + ', kesetiaan Ketua Cawangan +' + C.UBAH.ketuaCawangan + '.</p></section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-npc]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-npc'), i = parseInt(b.getAttribute('data-i'), 10), r = a === 'kekal' ? M.kekal(i) : a === 'ubah' ? M.ubah(i, b.getAttribute('data-nama')) : a === 'semua' ? M.kekalSemua() : null;
    if (!r) { return; }
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  var st = W.document.createElement('style');
  st.textContent = '.npc-baris{padding:8px 0;border-top:1px solid var(--border,rgba(127,127,127,.2))}.npc-teks{display:flex;flex-direction:column}.npc-btn{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}';
  W.document.head.appendChild(st);
  W.MyPolitikNPCUI = { kad: kad };
})(window);
