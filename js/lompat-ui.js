/* ==========================================================================
   Nusa Politik — js/lompat-ui.js   (v13.51)
   Kad "🔀 Lompat Parti" dalam tab Profil (sebelah Pindah Cawangan). Logik dalam js/lompat.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var LP = W.MyPolitikLompat, S = W.MyPolitikSave;
  if (!LP || !S) { return; }
  var pilih = null;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function UI() { return W.NusaUI || {}; }
  function htmlKesan(k, ke) {
    var C = LP.CONFIG, h = '';
    if (k.kerusi.length) { h += '<div class="lp-amaran">⚠️ Perkara 49A: anda ' + k.kerusi.map(function (x) { return (x.jenis === 'MP' ? 'Ahli Parlimen ' : 'ADUN ') + esc(x.nama); }).join(' dan ') + '. Keluar parti = kerusi dikosongkan dan PRK diadakan bulan depan. Anda boleh bertanding PRK atas tiket ' + esc(ke) + '.</div>'; }
    if (k.dipecat) { h += '<p class="note">Anda Ahli Politik Bebas (dipecat): kerusi kekal dan tiada penalti Reputasi.</p>'; }
    var baris = [['Jawatan parti', k.jawatan.length ? k.jawatan.join(', ') + ': hilang' : 'Tiada', !!k.jawatan.length], ['Jawatan kerajaan', k.kerajaan ? k.kerajaan + ': hilang' : 'Tiada', !!k.kerajaan],
      ['Keahlian parti baharu', 'Ahli Biasa · pilih cawangan baharu', false], ['Tempoh keahlian', 'Bermula semula', false], ['IP', '→ ' + k.ip + ' (−50%)', true],
      ['Sokongan akar umbi', 'Mula ' + k.akarUmbi + '%', false], ['Reputasi', k.reputasi ? k.reputasi + ' · label "Katak Politik" ' + C.KATAK_BULAN + ' bulan' : 'Tiada perubahan', !!k.reputasi],
      ['Dana, harta, gelaran, pendidikan, trofi', 'Kekal', false]];
    return h + baris.map(function (b) { return '<div class="lp-k"><span>' + esc(b[0]) + '</span><b class="' + (b[2] ? 'jm-amaran' : '') + '">' + esc(b[1]) + '</b></div>'; }).join('');
  }
  function kad(p) {
    try {
      if (!p || p.tamat) { return ''; }
      var k = LP.keadaan(p), h = '<section class="card lp-kad"><h2 class="card__title" style="margin:0 0 4px">🔀 Lompat Parti</h2>';
      if (k.katak) { h += '<p class="note">🐸 Label "Katak Politik" aktif.</p>'; }
      if (k.lompat.sejarah.length) { h += '<p class="note">Rekod: ' + esc(k.lompat.sejarah.map(function (x) { return x.dari + ' → ' + x.ke + ' (' + x.tahun + ')'; }).join(' · ')) + '</p>'; }
      if (!k.boleh) { return h + '<p class="note">🔒 ' + esc(k.sebab) + '</p></section>'; }
      h += '<p class="note">Keluar parti dan sertai parti lain yang bergerak di negeri anda. Watak, umur, Dana, harta, gelaran dan trofi kekal; kerjaya parti bermula semula. Sekali setiap ' + LP.CONFIG.JEDA_TAHUN + ' tahun.</p>';
      h += k.pilihan.map(function (c) {
        return '<label class="lp-opt' + (c.boleh ? '' : ' lp-opt--x') + '"><input type="radio" name="lp-parti" value="' + c.kod + '" data-lp-pilih' + (pilih === c.kod ? ' checked' : '') + (c.boleh ? '' : ' disabled') + '>' +
          '<span><b>' + esc(c.nama) + '</b>' + (c.boleh ? (c.mesra ? '<small>Sedia menerima · gabungan sama: sambutan lebih mesra</small>' : '<small>Sedia menerima</small>') : '<small class="jm-amaran">' + esc(c.sebab) + '</small>') + '</span></label>';
      }).join('');
      if (pilih) { var c0 = k.pilihan.filter(function (c) { return c.kod === pilih; })[0]; h += '<h3 style="margin:10px 0 4px">Kesan</h3>' + htmlKesan(k.kesan, c0 ? c0.nama : pilih); }
      h += '<button type="button" class="btn btn--danger btn--block" data-lp="sah"' + (pilih ? '' : ' disabled') + ' style="margin-top:8px">🔀 Sahkan Lompat Parti</button>';
      return h + '</section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('change', function (ev) {
    var t = ev.target; if (!t || !t.hasAttribute || !t.hasAttribute('data-lp-pilih')) { return; }
    pilih = t.value; if (UI().render) { UI().render(); }
  });
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-lp="sah"]') : null; if (!b || b.disabled || !pilih) { return; }
    var p = S.loadPlayer(), c = LP.pilihan(p).filter(function (x) { return x.kod === pilih; })[0]; if (!c) { return; }
    var jalan = function () { var r = LP.mula(pilih); if (!r.ok) { if (UI().toast) { UI().toast(r.ralat, 'ralat'); } return; } W.location.assign(r.url); };
    if (UI().modal) {
      UI().modal({ tajuk: '🔀 Lompat ke ' + c.nama + '?', isi: '<p>Anda akan memilih cawangan baharu dalam ' + esc(c.nama) + '. Tindakan ini tidak boleh dibatalkan selepas pendaftaran disahkan.</p>' + htmlKesan(LP.kesan(p), c.nama),
        butang: [{ label: 'Batal', nilai: false }, { label: 'Teruskan', nilai: true, kelas: 'btn--danger' }] }).then(function (v) { if (v) { jalan(); } });
    } else { jalan(); }
  });
  W.MyPolitikLompatUI = { kad: kad };
})(window);
