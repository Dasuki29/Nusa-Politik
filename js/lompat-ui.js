/* ==========================================================================
   Nusa Politik — js/lompat-ui.js   (v13.90)
   Kad "🔀 Lompat Parti" dalam tab Profil (sebelah Pindah Cawangan). Logik dalam js/lompat.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var LP = W.MyPolitikLompat, S = W.MyPolitikSave;
  if (!LP || !S) { return; }
  var pilih = null;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function UI() { return W.NusaUI || {}; }
  var KUMP = [['BN', 'Barisan Nasional', 'assets/images/logo-bn.png'], ['PN', 'Perikatan Nasional', 'assets/images/logo-pn.svg'], ['PH', 'Pakatan Harapan', 'assets/images/logo-ph.jpg'],
    ['GRS', 'Gabungan Rakyat Sabah', 'assets/images/logo-grs.png'], ['GPS', 'Gabungan Parti Sarawak', 'assets/images/logo-gps.png'], ['LAIN', 'Lain-lain', '']];
  function logo(kod) { var P = W.MyPolitikParti, i = P && P.info ? P.info(kod) : null; return (i && i.logo) || 'assets/images/logo-placeholder.svg'; }
  function htmlKesan(k, ke, ringkas) {
    var C = LP.CONFIG, h = '';
    if (k.kerusi.length) { h += '<div class="lp-amaran">⚠️ Perkara 49A: anda ' + k.kerusi.map(function (x) { return (x.jenis === 'MP' ? 'Ahli Parlimen ' : 'ADUN ') + esc(x.nama); }).join(' dan ') + '. Keluar parti = kerusi dikosongkan dan PRK diadakan bulan depan. Anda boleh bertanding PRK atas tiket ' + esc(ke) + '.</div>'; }
    if (k.dipecat) { h += '<p class="note">Anda Ahli Politik Bebas (dipecat): kerusi kekal dan tiada penalti Reputasi.</p>'; }
    var baris = [['Jawatan parti', k.jawatan.length ? k.jawatan.join(', ') + ': hilang' : 'Tiada', !!k.jawatan.length], ['Jawatan kerajaan', k.kerajaan ? k.kerajaan + ': hilang' : 'Tiada', !!k.kerajaan],
      ['Keahlian parti baharu', 'Ahli Biasa · pilih cawangan baharu', false], ['Tempoh keahlian', 'Bermula semula', false], ['IP', '→ ' + k.ip + ' (−50%)', true],
      ['Sokongan akar umbi', 'Mula ' + k.akarUmbi + '%', false], ['Reputasi', k.reputasi ? k.reputasi + ' · label "Katak Politik" ' + C.KATAK_BULAN + ' bulan' : 'Tiada perubahan', !!k.reputasi],
      ['Dana, harta, gelaran, pendidikan, trofi', 'Kekal', false]];
    var jadual = baris.map(function (b) { return '<div class="lp-k"><span>' + esc(b[0]) + '</span><b class="' + (b[2] ? 'jm-amaran' : '') + '">' + esc(b[1]) + '</b></div>'; }).join('');
    if (ringkas) {                                                                                       // v13.90: ringkasan + jadual dilipat
      var r = ['IP −50%'].concat(k.reputasi ? ['Reputasi ' + k.reputasi, '🐸 Katak Politik ' + C.KATAK_BULAN + ' bulan'] : []);
      return h + '<p class="lp-ring"><b class="jm-amaran">' + r.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join(' · ') + '</b> · <span>Dana, harta dan gelaran kekal.</span></p><details class="lp-kunci"><summary><span>Lihat kesan penuh</span> (' + baris.length + ')</summary>' + jadual + '</details>';
    }
    return h + baris.map(function (b) { return '<div class="lp-k"><span>' + esc(b[0]) + '</span><b class="' + (b[2] ? 'jm-amaran' : '') + '">' + esc(b[1]) + '</b></div>'; }).join('');
  }
  function kad(p) {
    try {
      if (!p || p.tamat) { return ''; }
      var k = LP.keadaan(p), h = '<section class="card lp-kad"><h2 class="card__title" style="margin:0 0 4px">🔀 Lompat Parti</h2>';
      if (k.katak) { h += '<p class="note">🐸 Label "Katak Politik" aktif.</p>'; }
      if (k.lompat.sejarah.length) { h += '<p class="note">Rekod: ' + esc(k.lompat.sejarah.map(function (x) { return x.dari + ' → ' + x.ke + ' (' + x.tahun + ')'; }).join(' · ')) + '</p>'; }
      if (!k.boleh) { return h + '<p class="note">🔒 ' + esc(k.sebab) + '</p></section>'; }
      h += '<p class="note" style="margin:0 0 4px">Keluar parti dan sertai parti lain di negeri anda. Watak dan harta kekal; kerjaya parti bermula semula. Sekali setiap ' + LP.CONFIG.JEDA_TAHUN + ' tahun.</p>';
      // v13.90: grid cip ikut gabungan; parti yang tidak bergerak di negeri anda dilipat
      var ada = k.pilihan.filter(function (c) { return c.aktif; }), luar = k.pilihan.filter(function (c) { return !c.aktif; });
      KUMP.forEach(function (g) {
        var cs = ada.filter(function (c) { return c.gab === g[0]; }); if (!cs.length) { return; }
        var mesra = cs.some(function (c) { return c.mesra; });
        h += '<div class="lp-g">' + (g[2] ? '<img src="' + g[2] + '" alt="" data-netral>' : '') + esc(g[1]) + (mesra ? ' <span class="lp-g__m">· 🤝 sambutan lebih mesra</span>' : '') + '</div><div class="lp-grid">' +
          cs.map(function (c) {
            return '<label class="lp-chip' + (pilih === c.kod ? ' lp-chip--on' : '') + (c.boleh ? '' : ' lp-chip--x') + '"' + (c.boleh ? '' : ' title="' + esc(c.sebab) + '"') + '><input type="radio" name="lp-parti" value="' + c.kod + '" data-lp-pilih' + (pilih === c.kod ? ' checked' : '') + (c.boleh ? '' : ' disabled') + '>' +
              '<img src="' + esc(logo(c.kod)) + '" alt="" data-netral><span>' + esc(c.nama) + '</span>' + (pilih === c.kod ? '<i class="lp-chip__m">✔</i>' : c.mesra ? '<i class="lp-chip__m">🤝</i>' : '') + '</label>';
          }).join('') + '</div>';
      });
      var tolak = ada.filter(function (c) { return !c.boleh; })[0]; if (tolak) { h += '<p class="note jm-amaran" style="margin:6px 0 0">' + esc(tolak.sebab) + '</p>'; }
      if (luar.length) {
        var sab = luar.filter(function (c) { return /Sabah/.test(c.sebab); }).map(function (c) { return c.nama; }), sar = luar.filter(function (c) { return /Sarawak/.test(c.sebab); }).map(function (c) { return c.nama; });
        var lain = luar.filter(function (c) { return !/Sabah|Sarawak/.test(c.sebab); }).map(function (c) { return c.nama; });
        h += '<details class="lp-kunci"><summary>🔒 ' + luar.length + ' <span>parti tidak bergerak di negeri anda</span></summary><p class="note" style="margin:4px 0 0">' +
          [sab.length ? 'Sabah: ' + sab.join(', ') : '', sar.length ? 'Sarawak: ' + sar.join(', ') : '', lain.length ? lain.join(', ') : ''].filter(Boolean).map(esc).join(' · ') + '</p></details>';
      }
      if (pilih) { var c0 = k.pilihan.filter(function (c) { return c.kod === pilih; })[0]; h += '<h3 style="margin:10px 0 4px">Kesan</h3>' + htmlKesan(k.kesan, c0 ? c0.nama : pilih, true); }
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
