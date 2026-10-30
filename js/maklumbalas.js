/* ==========================================================================
   Nusa Politik — js/maklumbalas.js   (v13.7)
   Butang "Maklum balas" (menu utama dan Menu dashboard) ke Google Form tanpa nama.
   Skrin pengesahan dipaparkan dahulu; borang dibuka dalam tab baharu dengan "Maklumat permainan"
   diisi automatik (versi, parti, tahun dan bulan). Nama watak dan simpanan TIDAK dihantar.
   Borang dibina dengan skrip Apps Script (lihat CHANGELOG v13.7). Jika URL kosong, butang disembunyikan.
   ========================================================================== */
(function (W) {
  'use strict';
  var CONFIG = {
    VERSI: 'v13.18',                                            // v13.18: mesti sama dengan sw.js VERSI (diuji dalam tools/ujian.js)
    URL: 'https://docs.google.com/forms/d/e/1FAIpQLSdMYHB_QE3WRwJk5NhWVjbsprlpAOURtiT-LXsXHuEYNTgD5g/viewform',   // pautan borang (viewform)
    ENTRY: 'entry.624898804'   // kod soalan "Maklumat permainan", cth. 'entry.123456789'
  };
  var D = W.document;
  function aktif() { return !!CONFIG.URL; }
  function maklumat() {
    var S = W.MyPolitikSave, p = null;
    try { p = S && S.loadPlayer ? S.loadPlayer() : null; } catch (e) { p = null; }
    var bhs = W.MyPolitikI18n && W.MyPolitikI18n.getLanguage ? W.MyPolitikI18n.getLanguage() : 'BM';
    var lebar = W.innerWidth || 0, peranti = lebar < 700 ? 'telefon' : lebar < 1100 ? 'tablet' : 'komputer';
    var t = CONFIG.VERSI + (p ? ' · ' + (p.parti || 'UMNO') + ' · ' + p.tahun + ', bulan ' + p.bulan + ' · ' + (p.jawatan || 'Ahli Biasa') : ' · menu utama') + ' · ' + bhs + ' · ' + peranti;
    return t;
  }
  function pautan() {
    if (!CONFIG.ENTRY) { return CONFIG.URL; }
    var sep = CONFIG.URL.indexOf('?') >= 0 ? '&' : '?';
    return CONFIG.URL + sep + 'usp=pp_url&' + CONFIG.ENTRY + '=' + encodeURIComponent(maklumat());
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var ov = null, fokusLama = null;
  function tutup() { if (!ov) { return; } ov.classList.remove('is-open'); ov.setAttribute('aria-hidden', 'true'); D.body.classList.remove('modal-open'); if (fokusLama && fokusLama.focus) { try { fokusLama.focus(); } catch (e) { /* abaikan */ } } }
  function buka() {
    if (!aktif()) { return; }
    var menu = D.getElementById('menu-win'); if (menu && menu.classList.contains('is-open')) { var x = D.getElementById('menu-tutup'); if (x) { x.click(); } }
    fokusLama = D.activeElement;
    if (!ov) {
      ov = D.createElement('div'); ov.className = 'modal-overlay'; ov.id = 'mb-win'; ov.setAttribute('aria-hidden', 'true');
      D.body.appendChild(ov);
      ov.addEventListener('click', function (e) { if (e.target === ov || (e.target.closest && e.target.closest('[data-mb-tutup]'))) { tutup(); } else if (e.target.closest && e.target.closest('[data-mb-buka]')) { W.open(pautan(), '_blank', 'noopener'); tutup(); } });
      D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('is-open')) { tutup(); } });
    }
    ov.innerHTML = '<div class="modal modal--gold" role="dialog" aria-modal="true" aria-labelledby="mb-tajuk"><div class="modal__header"><h2 class="modal__title" id="mb-tajuk">Maklum Balas</h2><button type="button" class="modal__close" data-mb-tutup aria-label="Tutup">&times;</button></div>' +
      '<div class="modal__body"><p class="note">Anda akan dibawa ke Google Form dalam tab baharu. Tiada akaun diperlukan dan borang tidak mengumpul emel; maklum balas adalah tanpa nama.</p>' +
      (CONFIG.ENTRY ? '<div class="kv"><span>Maklumat yang diisi automatik</span><b data-i18n-skip>' + esc(maklumat()) + '</b></div><p class="note" style="font-size:.8rem">Ini membantu kami mengesan pepijat. Nama watak dan simpanan anda tidak dihantar.</p>' : '') +
      '<div class="mb-butang"><button type="button" class="btn btn--gold" data-mb-buka>Buka Borang ↗</button><button type="button" class="btn btn--ghost" data-mb-tutup>Kembali</button></div></div></div>';
    ov.classList.add('is-open'); ov.setAttribute('aria-hidden', 'false'); D.body.classList.add('modal-open');
    var b = ov.querySelector('[data-mb-buka]'); if (b) { b.focus(); }
  }
  function pasang() {
    D.querySelectorAll('[data-maklumbalas]').forEach(function (el) { el.hidden = !aktif(); });
    var st = D.createElement('style');
    st.textContent = '.mb-butang{display:grid;gap:8px;margin-top:12px}.mb-butang .btn{width:100%}';
    D.head.appendChild(st);
  }
  D.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-maklumbalas]') : null;
    if (b) { e.preventDefault(); e.stopPropagation(); buka(); }
  }, true);
  if (D.readyState === 'loading') { D.addEventListener('DOMContentLoaded', pasang); } else { pasang(); }
  W.MyPolitikMaklumBalas = { CONFIG: CONFIG, buka: buka, pautan: pautan, maklumat: maklumat };
})(window);
