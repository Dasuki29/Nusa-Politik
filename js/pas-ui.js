/* ==========================================================================
   Nusa Politik — js/pas-ui.js   (v13.31)
   Kad "PAS: Parti & Muktamar" di tab Profil (logik dalam js/pas.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikPAS, S = W.MyPolitikSave;
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
      var k = M.kawasan(p), C = M.CONFIG, h = '<section class="card pas-kad"><h2 class="card__title" style="margin:0 0 4px">🌙 PAS: Parti &amp; Muktamar</h2>';
      // Gabungan PN
      h += '<h3 class="pas-h">Perikatan Nasional</h3><div class="pas-rakan"><span class="pas-chip pas-chip--anda"><img src="assets/images/logo-pas.svg" alt="">PAS</span>' +
        C.RAKAN.map(function (r) { return '<span class="pas-chip" title="' + esc(r.penuh) + '"><img src="' + esc(r.logo) + '" alt="">' + esc(r.nama) + '</span>'; }).join('') + '</div>' +
        '<p class="note">Rakan PN dimainkan sebagai NPC. PN bermula sebagai pembangkang persekutuan; kerajaan negeri PN: ' + esc(C.KERAJAAN_NEGERI.join(', ')) + '.</p>';
      // Kawasan & kuota
      h += '<h3 class="pas-h">Kawasan &amp; kuota PN</h3>';
      if (k.parlimen) {
        h += kv('Kawasan ' + esc(k.parlimen.n), 'Pengundi Bumiputera ' + k.parlimen.m + '% · kedudukan ' + k.parlimen.r + '/' + k.bilBahagian) +
          kv('Kerusi Parlimen', k.kuotaPL ? '✅ dalam kuota PAS (' + C.KUOTA_PARLIMEN + ')' : '⛔ untuk rakan PN (kuota PAS ' + C.KUOTA_PARLIMEN + ')') +
          kv('Kerusi DUN', k.dun ? esc(k.dun.n) + ' · ' + (k.kuotaDUN ? '✅ dalam kuota (' + C.KUOTA_DUN + ')' : '⛔ untuk rakan PN (kuota ' + C.KUOTA_DUN + ')') : 'Tiada DUN');
      }
      var seterus = M.tahunSeterusnya(p, p.tahun), kini = M.adalahTahunPemilihan(p, p.tahun);
      h += kv('Pemilihan parti', kini ? '🗳️ Tahun ini (' + p.tahun + ')' : 'Seterusnya ' + seterus + ' (setiap 2 tahun)');
      // Pemilihan Pusat
      var r = M.ringkasPusat(p), sj = M.statusJelajah(p);
      h += '<h3 class="pas-h">Muktamar: perwakilan Kawasan</h3><p class="note">Presiden, Timbalan Presiden dan 3 Naib Presiden dipilih oleh Muktamar Tahunan setiap 2 tahun. Setiap Kawasan menghantar 4 wakil, ditambah 1 bagi setiap 1,000 ahli melebihi 2,000, maksimum 15 (Perlembagaan PAS, Fasal 18 dan 38).</p>' +
        '<p class="note pas-panduan">Naikkan sokongan perwakilan sebelum Muktamar. Jelajah: +' + C.PUSAT.jelajahNaik + '% di satu Kawasan pilihan, sekali sebulan.</p>' +
        meter('Sokongan perwakilan Kawasan', r.purata, r.sokongUndi + ' / ' + r.pengundi) + kv('Kawasan condong kepada anda', r.condong + ' / ' + r.bilBahagian);
      if (!pilihKw || !r.senarai.some(function (x) { return x.kod === pilihKw; })) { pilihKw = r.senarai[0] && r.senarai[0].kod; }
      h += '<label class="note" for="pas-kw">Kawasan untuk dijelajah</label><select id="pas-kw" class="select" style="width:100%;margin:4px 0 6px" data-pas-kw>' +
        r.senarai.map(function (x) { return '<option value="' + esc(x.kod) + '"' + (x.kod === pilihKw ? ' selected' : '') + '>' + esc(x.nama) + ' · ' + x.sokongan + '% · ' + x.wakil + ' wakil</option>'; }).join('') + '</select>' +
        '<button type="button" class="btn btn--sm btn--ghost" data-pas="jelajah"' + (sj.boleh ? '' : ' disabled') + '>🚗 Jelajah Kawasan (' + C.PUSAT.jelajahAP + ' AP, ' + rm(C.PUSAT.jelajahMYR) + ', +' + C.PUSAT.jelajahNaik + '%)</button>' + (sj.boleh ? '' : ' <small class="note">' + esc(sj.sebab) + '</small>');
      return h + '<p class="note" style="margin-top:8px">Struktur ikut Perlembagaan PAS (Pindaan 2025); kuota kerusi dan kekuatan negeri ialah andaian permainan.</p></section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('change', function (ev) { var t = ev.target; if (t && t.hasAttribute && t.hasAttribute('data-pas-kw')) { pilihKw = t.value; } });
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-pas]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-pas'), r = a === 'jelajah' ? M.jelajah(pilihKw) : null;
    if (!r) { return; }
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  var st = W.document.createElement('style');
  st.textContent = '.pas-h{font-size:.92rem;margin:12px 0 4px}.pas-rakan{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0}.pas-chip{display:inline-flex;align-items:center;gap:5px;border:2px solid var(--garis,var(--border));border-radius:10px;padding:3px 8px;font-size:.8rem;font-weight:700;opacity:.75}' +
    '.pas-chip img{width:26px;height:18px;object-fit:contain;border-radius:3px;background:#fff}.pas-chip--anda{opacity:1;border-color:#0A7A3B}';
  W.document.head.appendChild(st);
  W.MyPolitikPASUI = { kad: kad };
})(window);
