/* ==========================================================================
   Nusa Politik — js/kawasan-ui.js   (v8.18, v8.20)
   Kad "Peruntukan Kawasan", "Keluhan Rakyat" dan "Aktiviti Rakyat" di tab Tindakan. Bergantung pada js/kawasan.js dan W.NusaUI (esc).
   ========================================================================== */
(function (W) {
  'use strict';
  var KW = W.MyPolitikKawasan;
  if (!KW) { return; }
  function esc(s) { return W.NusaUI ? W.NusaUI.esc(s) : String(s); }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('ms-MY'); }
  function btn(act, id, label, boleh, sebab, kelas) {
    return '<button type="button" class="btn btn--sm' + (kelas ? ' ' + kelas : '') + (boleh ? '' : ' is-off') + '" data-act="' + act + '" data-id="' + esc(id) + '"' + (boleh ? '' : ' disabled title="' + esc(sebab || '') + '"') + '>' + label + '</button> ';
  }

  function kad(p) {
    try {
      var r = KW.ringkasan(p); if (!r.aktif) { return ''; }
      var h = '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🏛️ Peruntukan Kawasan</h2>';
      h += '<div class="kv"><span>Peruntukan sebulan</span><b>' + rm(r.bulanan) + '</b></div><div class="kv"><span>Baki peruntukan</span><b>' + rm(r.baki) + '</b></div>';
      r.butiran.forEach(function (b) { h += '<div class="kv"><span>' + esc(b.nama) + '</span><b>' + esc(rm(b.jumlah)) + '</b></div>'; });
      h += '<p class="note" style="font-size:.78rem">Dana khas, berasingan daripada Dana peribadi dan tidak boleh digunakan untuk kempen atau aset. Baki hangus setiap Januari. Kerusi pembangkang menerima 40%. Simulasi permainan.</p></section>';
      if (!r.kerusi) { return h; }
      h += '<section class="card"><h2 class="card__title" style="margin:0 0 4px">📮 Keluhan Rakyat</h2>';
      if (!r.keluhan.length) { h += '<p class="note">Tiada keluhan tertunggak.</p>'; }
      r.keluhan.forEach(function (x) {
        h += '<div style="margin:8px 0"><b>' + x.ikon + ' ' + esc(x.tajuk) + '</b><div class="note" style="font-size:.78rem;margin:2px 0 4px">' + esc(x.penerangan) + '</div>' +
          '<div class="note" style="font-size:.78rem;margin:0 0 4px">Diabaikan automatik dalam ' + x.baki + ' bulan</div>' +
          btn('kawasan-selesai', x.id, 'Selesaikan (' + esc(rm(x.kos)) + ')', x.bolehSelesai, x.sebabSelesai) + btn('kawasan-usul', x.id, 'Bawa sebagai usul', x.bolehUsul, 'AP tidak mencukupi.') + btn('kawasan-abai', x.id, 'Abaikan', true) + '</div>';
      });
      h += '<p class="note" style="font-size:.78rem">Selesaikan: guna peruntukan dan ' + r.apKeluhan + ' AP, +20 IP, +3 sokongan akar umbi. Usul: ' + r.apKeluhan + ' AP, dicatat di papan Isu Tempatan untuk mesyuarat. Abaikan: sokongan akar umbi -2. Tidak dijawab 3 bulan: penalti lebih berat.</p></section>';
      h += '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🎪 Aktiviti Rakyat</h2><p class="note" style="font-size:.78rem">Sekali sebulan, ' + r.apAktiviti + ' AP, guna Peruntukan Kawasan.</p>';
      r.aktiviti.forEach(function (x) {
        h += '<div style="margin:8px 0"><b>' + x.ikon + ' ' + esc(x.nama) + '</b><div class="note" style="font-size:.78rem;margin:2px 0 4px">Kos ' + esc(rm(x.kos)) + ' peruntukan, +' + x.ip + ' IP' + (x.akarUmbi ? ', +' + x.akarUmbi + ' sokongan akar umbi' : '') + (x.kurang ? ', kurangkan keluhan baharu bulan depan' : '') + '</div>' + btn('kawasan-aktiviti', x.id, 'Laksana', x.boleh, x.sebab) + '</div>';
      });
      return h + '</section>';
    } catch (e) { return ''; }
  }
  W.NusaKawasan_UI = { kad: kad };
})(window);
