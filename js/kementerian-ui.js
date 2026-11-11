/* ==========================================================================
   Nusa Politik — js/kementerian-ui.js   (v13.77)
   Paparan tab generik untuk modul kementerian yang dibina dengan js/kementerian.js (Pendidikan, Kesihatan, Ekonomi):
   meter, dana, tindakan bulanan, projek dalam pembinaan, dasar dan isu. Dipanggil oleh js/pru-ui.js.
   Bergantung pada W.NusaUI dan gaya .mof-* / .kdn-* (js/mof-ui.js, js/kdn-ui.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var KM = W.MyPolitikKementerian;
  if (!KM) { return; }
  function esc(s) { return W.NusaUI ? W.NusaUI.esc(s) : String(s); }
  function toast(t, j) { if (W.NusaUI) { W.NusaUI.toast(t, j); } }
  function segarkan() { if (W.NusaUI) { W.NusaUI.render(); } }
  function jt(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('ms-MY') + ' juta'; }
  function tanda(n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n); }
  (function () { var st = W.document.createElement('style'); st.textContent = '.kem-abai small{display:inline-block;background:var(--bg-elev-1);border-radius:6px;padding:1px 6px;margin:2px 4px 0 0;font-size:.72rem}'; W.document.head.appendChild(st); })();
  var KHAS = { ip: 'IP', pop: 'Populariti', rating: 'KPI', reputasi: 'Reputasi', akar: 'Akar umbi' };

  function cari(kunci) { return KM.senarai().filter(function (x) { return x.def.kunci === kunci; })[0] || null; }
  function kesan(mod, x) {
    return Object.keys(x || {}).map(function (k) {
      if (k === 'rizab') { return '<small>Rizab MOF −RM ' + Number(x[k]).toFixed(1) + ' bilion</small>'; }
      var M = mod.def.meter[k], n = M ? M.nama : (KHAS[k] || k);
      return '<small>' + n + ' ' + tanda(x[k]) + (M && M.unit ? M.unit : '') + '</small>';
    }).join('');
  }
  function kad(kunci, p) {
    var mod = cari(kunci); if (!mod || !mod.aktif(p)) { return ''; }
    var r = mod.ringkasan(p), h = '<div class="mof-stat">';
    h += r.meter.map(function (x) {
      return '<div class="kdn-m' + (x.bahaya ? ' bahaya' : '') + '"><span>' + esc(x.nama) + '</span><b>' + x.nilai + x.unit + '</b><s><i style="width:' + Math.max(0, Math.min(100, Math.round(x.isi))) + '%"></i></s>' + (x.nota ? '<span>' + esc(x.nota) + '</span>' : '') + '<span>' + (x.arah > 0 ? '▲ ' : x.arah < 0 ? '▼ ' : '▬ ') + tanda(x.arah) + x.unit + ' bulan lalu</span></div>';
    }).join('');
    h += '<div class="kdn-m"><span>Dana</span><b>' + jt(r.dana) + '</b><span>+' + jt(r.danaBulan) + ' sebulan · had ' + jt(r.danaHad) + '</span></div></div>';
    h += '<h3 class="mof-h">🏗️ Tindakan bulanan</h3><p class="note">' + (r.tindakanSudah ? 'Tindakan bulan ini sudah dibuat.' : 'Satu tindakan utama sebulan.') + '</p>';
    h += r.tindakan.map(function (t) {
      return '<div class="kdn-ag"><div><b>' + t.ikon + ' ' + esc(t.nama) + '</b><p>' + jt(t.kos) + (t.siap ? ' · siap ' + t.siap + ' bulan' : '') + '</p>' + kesan(mod, t.kesan) + '</div>' +
        '<button type="button" class="btn btn--sm" data-kem="laksana" data-mod="' + kunci + '" data-id="' + t.id + '"' + (t.boleh ? '' : ' disabled title="' + esc(t.sebab) + '"') + '>Laksana</button></div>';
    }).join('');
    if (r.projek.length) { h += '<p class="note">Projek dalam pembinaan: ' + r.projek.map(function (x) { return '<b>' + esc(x.nama) + '</b> (siap bulan ' + x.siap + ')'; }).join(' · ') + '</p>'; }
    h += '<h3 class="mof-h">📜 Dasar</h3><p class="note">' + (r.dasarBoleh ? 'Satu perubahan dasar sebulan.' : 'Perubahan dasar bulan ini sudah dibuat.') + '</p>';
    h += r.dasar.map(function (t) {
      return '<div class="mof-tuil"><b>' + t.ikon + ' ' + esc(t.nama) + '</b>' + (t.nota ? '<p class="note">' + esc(t.nota) + '</p>' : '') + '<div class="mof-seg">' + t.pilihan.map(function (c) {
        var on = c.id === t.semasa;
        return '<button type="button" class="btn btn--sm' + (on ? ' on' : '') + '" data-kem="dasar" data-mod="' + kunci + '" data-d="' + t.kod + '" data-id="' + c.id + '"' + (on || !r.dasarBoleh ? ' disabled' : '') + (on ? ' aria-pressed="true"' : '') + '>' + esc(c.label) + '</button>';
      }).join('') + '</div></div>';
    }).join('');
    if (r.isu) {
      h += '<div class="banner banner--warn" role="alert"><strong>' + r.isu.ikon + ' Isu: ' + esc(r.isu.nama) + '</strong>Setiap bulan jika tidak diselesaikan: <span class="kem-abai">' + kesan(mod, r.isu.abai) + '</span></div>';
      h += r.isu.pilihan.map(function (c) {
        return '<div class="kdn-ag"><div><b>' + c.ikon + ' ' + esc(c.label) + '</b><p>' + (c.kos ? jt(c.kos) : 'Tanpa kos') + (c.peluang != null ? ' · ' + c.peluang + '% berjaya' : '') + '</p>' + kesan(mod, c.kesan) + (c.gagal && Object.keys(c.gagal).length ? '<small>Gagal:</small>' + kesan(mod, c.gagal) : '') + '</div>' +
          '<button type="button" class="btn btn--sm" data-kem="isu" data-mod="' + kunci + '" data-id="' + c.id + '"' + (c.boleh ? '' : ' disabled') + '>Pilih</button></div>';
      }).join('');
    }
    return h + '<p class="note" style="font-size:.76rem">Isu dan dasar ialah label simulasi yang dipermudahkan; nilai ialah anggaran permainan.</p>';
  }

  W.document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-kem]') : null;
    if (!t || t.disabled) { return; }
    var mod = cari(t.getAttribute('data-mod')); if (!mod) { return; }
    var a = t.getAttribute('data-kem'), id = t.getAttribute('data-id'), r = null;
    if (a === 'laksana') { r = mod.laksana(id); } else if (a === 'dasar') { r = mod.ubahDasar(t.getAttribute('data-d'), id); } else if (a === 'isu') { r = mod.jawabIsu(id); }
    if (r) { toast(r.ok ? r.mesej : r.ralat, r.ok ? (r.jaya === false ? 'ralat' : 'ok') : 'ralat'); segarkan(); }
  });

  W.MyPolitikKementerianUI = { kad: kad };
})(window);
