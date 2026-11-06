/* ==========================================================================
   Nusa Politik — js/dap-ui.js   (v13.37)
   Kad "DAP: Parti & Kongres Kebangsaan" di tab Profil (logik dalam js/dap.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikDAP, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Number(n || 0).toLocaleString('en'); }
  function U() { return W.NusaUI || {}; }
  function kv(a, b) { return '<div class="kv"><span>' + a + '</span><b>' + b + '</b></div>'; }
  function meter(label, n, nilai) {
    var w = Math.max(0, Math.min(100, Math.round(n))), warna = w >= 50 ? 'var(--success)' : w >= 35 ? 'var(--warning)' : 'var(--danger)';
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + esc(nilai) + '</b></div><div class="progress progress--sm" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + w + '"><div class="progress__bar" style="width:' + w + '%;background:' + warna + '"></div></div></div>';
  }
  var pilihKw = null;
  function kad(p) {
    try {
      if (!M.adalah(p)) { return ''; }
      M.segarPenyelaras(p);
      var k = M.kawasan(p), C = M.CONFIG, h = '<section class="card dap-kad"><h2 class="card__title" style="margin:0 0 4px">🚀 DAP: Parti &amp; Kongres Kebangsaan</h2>';
      // Gabungan PH
      h += '<h3 class="pkr-h">Pakatan Harapan</h3><div class="pkr-rakan"><span class="pkr-chip pkr-chip--anda"><img src="assets/images/logo-dap.svg" alt="">DAP</span>' +
        C.RAKAN.map(function (r) { return '<span class="pkr-chip" title="' + esc(r.penuh) + '">' + (r.logo ? '<img src="' + esc(r.logo) + '" alt="">' : '') + esc(r.nama) + '</span>'; }).join('') + '</div>' +
        '<p class="note">Rakan PH dimainkan sebagai NPC. PH memimpin Kerajaan Perpaduan bersama rakan; selepas PRU, rakan gabungan perlu dirundingkan semula. Kerajaan negeri dipimpin PH: ' + esc(C.KERAJAAN_NEGERI.join(', ')) + '.</p>';
      // Kawasan & kuota
      h += '<h3 class="pkr-h">Kawasan &amp; kuota PH</h3>';
      if (k.parlimen) {
        h += kv('Kawasan ' + esc(k.parlimen.n), 'Pengundi Bumiputera ' + k.parlimen.m + '% · kedudukan ' + k.parlimen.r + '/' + k.bilBahagian) +
          kv('Wakil Kongres kawasan ini', M.perwakilan(k.parlimen.kod) + ' wakil · ' + (k.parlimen.c || 0) + ' Cawangan layak') +
          kv('Penyelaras JPKP', M.penyelaras(p) ? '✅ Anda (Ahli Parlimen)' : M.ahliParlimen(p) ? 'Ahli Parlimen DAP kawasan ini' : 'Ahli Parlimen DAP kawasan ini (NPC)') +
          kv('Kerusi Parlimen', k.kuotaPL ? '✅ dalam kuota DAP (' + C.KUOTA_PARLIMEN + ')' : '⛔ untuk rakan PH (kuota DAP ' + C.KUOTA_PARLIMEN + ')') +
          kv('Kerusi DUN', k.dun ? esc(k.dun.n) + ' · ' + (k.kuotaDUN ? '✅ dalam kuota (' + C.KUOTA_DUN + ')' : '⛔ untuk rakan PH (kuota ' + C.KUOTA_DUN + ')') : 'Tiada DUN');
      }
      var seterus = M.tahunSeterusnya(p, p.tahun), kini = M.adalahTahunPemilihan(p, p.tahun);
      h += kv('Pemilihan parti', kini ? '🗳️ Tahun ini (' + p.tahun + ')' : 'Seterusnya ' + seterus + ' (setiap 3 tahun)');
      // Pemilihan Pusat
      var r = M.ringkasPusat(p), sj = M.statusJelajah(p);
      h += '<h3 class="pkr-h">Kongres Kebangsaan: Wakil Cawangan</h3><p class="note">Kongres Kebangsaan memilih 30 ahli Jawatankuasa Tertinggi Pusat setiap 3 tahun; 30% kerusi dikhaskan untuk calon wanita. Setiap Wakil mengundi 30 calon. Cawangan dengan 25 hingga 50 ahli berbayar menghantar 2 Wakil, ditambah 1 bagi 51 hingga 100 ahli dan 1 lagi bagi setiap 100 ahli seterusnya (Perlembagaan DAP, Fasal VIII). Ahli JTP kemudian memilih Setiausaha Agung, Pengerusi Kebangsaan dan Naib Pengerusi Kebangsaan sesama sendiri (Fasal X).</p>' +
        '<p class="note pkr-panduan">Naikkan sokongan Wakil sebelum Kongres Kebangsaan. Jelajah: +' + C.PUSAT.jelajahNaik + '% di satu kawasan pilihan, sekali sebulan.</p>' +
        meter('Sokongan Wakil Kongres', r.purata, r.sokongUndi + ' / ' + r.pengundi) + kv('Kawasan condong kepada anda', r.condong + ' / ' + r.bilBahagian);
      if (!pilihKw || !r.senarai.some(function (x) { return x.kod === pilihKw; })) { pilihKw = r.senarai[0] && r.senarai[0].kod; }
      h += '<label class="note" for="dap-kw">Kawasan untuk dijelajah</label><select id="dap-kw" class="select" style="width:100%;margin:4px 0 6px" data-dap-kw>' +
        r.senarai.map(function (x) { return '<option value="' + esc(x.kod) + '"' + (x.kod === pilihKw ? ' selected' : '') + '>' + esc(x.nama) + ' · ' + x.sokongan + '% · ' + x.wakil + ' wakil</option>'; }).join('') + '</select>' +
        '<button type="button" class="btn btn--sm btn--ghost" data-dap="jelajah"' + (sj.boleh ? '' : ' disabled') + '>🚗 Jelajah Kawasan (' + C.PUSAT.jelajahAP + ' AP, ' + rm(C.PUSAT.jelajahMYR) + ', +' + C.PUSAT.jelajahNaik + '%)</button>' + (sj.boleh ? '' : ' <small class="note">' + esc(sj.sebab) + '</small>');
      return h + '<p class="note" style="margin-top:8px">Struktur ikut Perlembagaan DAP (seperti pada 22.10.2019); kuota kerusi dan kekuatan negeri ialah andaian permainan.</p></section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('change', function (ev) { var t = ev.target; if (t && t.hasAttribute && t.hasAttribute('data-dap-kw')) { pilihKw = t.value; } });
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-dap]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-dap'), r = a === 'jelajah' ? M.jelajah(pilihKw) : null;
    if (!r) { return; }
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  var st = W.document.createElement('style');
  st.textContent = '.pkr-h{font-size:.92rem;margin:12px 0 4px}.pkr-rakan{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0}.pkr-chip{display:inline-flex;align-items:center;gap:5px;border:2px solid var(--garis,var(--border));border-radius:10px;padding:3px 8px;font-size:.8rem;font-weight:700;opacity:.75}' +
    '.pkr-chip img{width:26px;height:18px;object-fit:contain;border-radius:3px;background:#fff}.pkr-chip--anda{opacity:1;border-color:#00AEEF}';
  W.document.head.appendChild(st);
  W.MyPolitikDAPUI = { kad: kad };
})(window);
