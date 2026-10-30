/* ==========================================================================
   Nusa Politik — js/sabah-bn-ui.js   (v13.16)
   Kad "MCA Sabah / MIC Sabah: Membina Semula" di tab Profil (logik dalam js/sabah-bn.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikSabahBN, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Number(n || 0).toLocaleString('en'); }
  function U() { return W.NusaUI || {}; }
  function kv(a, b) { return '<div class="kv"><span>' + a + '</span><b>' + b + '</b></div>'; }
  function butang(aksi, label, s0) { return '<div style="margin-top:6px"><button type="button" class="btn btn--sm btn--ghost" data-sbn="' + aksi + '"' + (s0.boleh ? '' : ' disabled') + '>' + label + '</button>' + (s0.boleh ? '' : ' <small class="note">' + esc(s0.sebab) + '</small>') + '</div>'; }
  function kad(p) {
    try {
      if (!M.adalah(p)) { return ''; }
      var r = M.ringkasan(p), C = M.CONFIG, mca = p.parti === 'MCA', w = Math.round(r.pemulihan);
      var h = '<section class="card sbn-kad"><h2 class="card__title" style="margin:0 0 4px">' + (mca ? '🏙️ MCA Sabah: Membina Semula' : '🤝 MIC Sabah: Membina Semula') + '</h2>';
      h += '<p class="note">' + (mca ? 'MCA kalah semua kerusi yang ditandingi di Sabah pada PRN 2020 dan 2025. Bina semula sokongan sebelum PRN Sabah.' : 'MIC Sabah ada 25 cawangan dan tidak bertanding kerana pengundi India kecil. Bantu calon BN dan bina semula pengaruh.') + '</p>';
      h += '<div class="loy__row"><div class="loy__label"><span>Pemulihan Sabah</span><b>' + w + ' / 100</b></div><div class="progress progress--sm" role="progressbar" aria-label="Pemulihan Sabah" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + w + '"><div class="progress__bar" style="width:' + w + '%"></div></div></div>';
      h += butang('khidmat', '🏙️ Khidmat Masyarakat Bandar (' + C.KHIDMAT.ap + ' AP, ' + rm(C.KHIDMAT.myr) + ', +' + C.KHIDMAT.naik + ')', r.khidmat) +
        butang('jentera', '🤝 Jentera untuk calon BN Sabah (' + C.JENTERA.ap + ' AP, +' + C.JENTERA.naik + ', hubungan gabungan +' + C.JENTERA.hubungan + ')', r.jentera);
      if (mca) {
        var q = r.kuota;
        h += '<h3 class="sbn-h">Kuota BN untuk MCA Sabah</h3>' + kv('Kerusi DUN', q.bilDUN + ' (' + esc(q.senarai.join(', ')) + ')') + kv('Kerusi Parlimen', String(q.bilPL)) +
          kv('DUN anda', q.dun ? '✅ Dalam kuota' : '⛔ Di luar kuota') + kv('Kekuatan kerusi', String(r.ofset));
        h += '<p class="note">Pemulihan 50 ke atas: 3 kerusi DUN; 70 ke atas: 4 kerusi DUN dan 1 kerusi Parlimen. Kerusi sasaran ialah kubu DAP, Warisan dan GRS.</p>';
      } else {
        h += r.senator ? kv('Senator', '✅ Sehingga ' + esc(M.tb(r.senator.sehingga))) : '<p class="note">Selepas PRN Sabah, Ketua Bahagian ke atas dengan Pemulihan ' + C.SENATOR.pemulihan + ' ke atas berpeluang ' + Math.round(C.SENATOR.peluang * 100) + '% dilantik Senator (' + C.SENATOR.bulan + ' bulan, IP +' + C.SENATOR.ip + ' dan ' + rm(C.SENATOR.myr) + ' sebulan).</p>';
      }
      return h + '<p class="note" style="margin-top:8px">Pemulihan susut 1 sebulan ke arah ' + C.MULA + '. Kalah PRN ' + C.PRN.kalah + ', menang kerusi +' + C.PRN.menang + '. Angka ialah andaian permainan.</p></section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-sbn]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-sbn'), r = a === 'khidmat' ? M.khidmat() : a === 'jentera' ? M.jentera() : null;
    if (!r) { return; }
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  var st = W.document.createElement('style');
  st.textContent = '.sbn-h{font-size:.92rem;margin:12px 0 4px}';
  W.document.head.appendChild(st);
  W.MyPolitikSabahBNUI = { kad: kad };
})(window);
