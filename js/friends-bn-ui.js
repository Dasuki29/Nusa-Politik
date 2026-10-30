/* ==========================================================================
   Nusa Politik — js/friends-bn-ui.js   (v13.15)
   Paparan Friends of BN (logik dalam js/friends-bn.js): usul Majlis Tertinggi BN (tab Tindakan),
   butang "Jemput Friends of BN berkempen" (kad kempen) dan nota kuota kerusi (tab Pemilihan).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikFBN, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function U() { return W.NusaUI || {}; }
  /** Kad usul Majlis Tertinggi BN (hanya semasa menunggu undi Presiden). */
  function kad(p) {
    try {
      var f = M.getFBN(p); if (!f.menunggu || !M.adalahBN(p)) { return ''; }
      var C = M.CONFIG.MT;
      return '<section class="card fbn-kad"><h2 class="card__title" style="margin:0 0 4px">🤝 Friends of BN memohon menjadi komponen penuh</h2>' +
        '<p class="note">KIMMA, Makkal Sakti, IPF dan MIUP mahu diterima tanpa syarat. Pendirian parti anda dalam Majlis Tertinggi BN? Jika tidak dijawab bulan ini, parti anda dikira berkecuali.</p>' +
        '<button type="button" class="opsi-fbn" data-fbn="sokong"><b>👍 Sokong</b><small>Hubungan gabungan +' + C.hubungan + ' · sokongan pengundi India +' + C.bonusIndia + '% pada PRU seterusnya</small></button>' +
        '<button type="button" class="opsi-fbn" data-fbn="tolak"><b>✋ Tolak</b><small>Hubungan gabungan −' + C.hubungan + '</small></button>' +
        '<button type="button" class="opsi-fbn" data-fbn="berkecuali"><b>⚖️ Berkecuali</b><small>Tiada kesan</small></button>' +
        '<p class="note">Peluang diterima: ' + Math.round(C.asas * 100) + '% asas, +' + Math.round(C.sokong * 100) + '% jika anda menyokong, −' + Math.round(-C.tolak * 100) + '% jika menolak.</p></section>';
    } catch (e) { return ''; }
  }
  /** Butang kempen (dalam kad kempen PRU). */
  function butangKempen(p) {
    try {
      var st = M.statusJemput(p); if (!st.tunjuk) { return ''; }
      var J = M.CONFIG.JEMPUT;
      return '<button type="button" class="choice" data-fbn="jemput"' + (st.boleh ? '' : ' disabled') + '><span class="choice__title">🤝 Jemput Friends of BN berkempen</span>' +
        '<span class="choice__fx">' + J.ap + ' AP · sokongan +' + J.sokongan + '% · pengundi India ' + Math.round(st.india) + '%</span>' + (st.boleh ? '' : '<span class="choice__desc" style="color:var(--danger)">' + esc(st.sebab) + '</span>') + '</button>';
    } catch (e) { return ''; }
  }
  /** Nota kuota kerusi PRU (tab Pemilihan). */
  function notaKuota(p) {
    try {
      if (!M.adalahBN(p)) { return ''; }
      var k = M.ringkasKuota(p);
      return '<p class="note fbn-nota">🤝 Friends of BN: ' + k.kuota + ' kerusi Parlimen (' + esc(k.parti.join(', ')) + ')' + (k.komponen ? ' · kini komponen BN' : '') + '. Tidak melibatkan kerusi anda.</p>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-fbn]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-fbn'), r = a === 'jemput' ? M.jemput() : M.undi(a);
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  var st = W.document.createElement('style');
  st.textContent = '.opsi-fbn{display:block;width:100%;text-align:left;border:2px solid var(--border);border-radius:8px;padding:10px 12px;margin:8px 0;background:var(--bg-elev-2,#fff);font:inherit;color:inherit;cursor:pointer}' +
    '.opsi-fbn b{display:block}.opsi-fbn small{color:var(--text-muted);font-size:.8rem}.opsi-fbn:hover{border-color:var(--gold)}.fbn-nota{margin:6px 0 0}';
  W.document.head.appendChild(st);
  W.MyPolitikFBNUI = { kad: kad, butangKempen: butangKempen, notaKuota: notaKuota };
})(window);
