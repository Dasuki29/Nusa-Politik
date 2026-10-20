/* ==========================================================================
   Nusa Politik — js/kawasan-ui.js   (v8.18)
   Kad "Peruntukan Kawasan" di tab Tindakan. Bergantung pada js/kawasan.js dan W.NusaUI (esc).
   ========================================================================== */
(function (W) {
  'use strict';
  var KW = W.MyPolitikKawasan;
  if (!KW) { return; }
  function esc(s) { return W.NusaUI ? W.NusaUI.esc(s) : String(s); }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('ms-MY'); }

  function kad(p) {
    try {
      var r = KW.ringkasan(p); if (!r.aktif) { return ''; }
      var h = '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🏛️ Peruntukan Kawasan</h2>';
      h += '<div class="kv"><span>Peruntukan sebulan</span><b>' + rm(r.bulanan) + '</b></div><div class="kv"><span>Baki peruntukan</span><b>' + rm(r.baki) + '</b></div>';
      r.butiran.forEach(function (b) { h += '<div class="kv"><span>' + esc(b.nama) + '</span><b>' + esc(rm(b.jumlah)) + '</b></div>'; });
      h += '<div style="margin-top:8px">';
      r.projek.forEach(function (x) {
        h += '<div style="margin:8px 0"><b>' + x.ikon + ' ' + esc(x.nama) + '</b><div class="note" style="font-size:.78rem;margin:2px 0 4px">Kos ' + esc(rm(x.kos)) + ' peruntukan, +' + x.ip + ' IP, +' + x.akarUmbi + ' sokongan akar umbi</div>' +
          '<button type="button" class="btn btn--sm' + (x.boleh ? '' : ' is-off') + '" data-act="kawasan-projek" data-id="' + esc(x.id) + '"' + (x.boleh ? '' : ' disabled title="' + esc(x.sebab) + '"') + '>Laksana (' + r.ap + ' AP)</button></div>';
      });
      return h + '</div><p class="note" style="font-size:.78rem">Dana khas, berasingan daripada Dana peribadi dan tidak boleh digunakan untuk kempen atau aset. Baki hangus setiap Januari. Kerusi pembangkang menerima 40%. Simulasi permainan.</p></section>';
    } catch (e) { return ''; }
  }
  W.NusaKawasan_UI = { kad: kad };
})(window);
