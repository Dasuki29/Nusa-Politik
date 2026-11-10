/* ==========================================================================
   Nusa Politik — js/kdn-ui.js   (v13.72)
   Tab "Pejabat KDN" dalam kad kerajaan (js/pru-ui.js) untuk Menteri Dalam Negeri: meter keselamatan,
   ancaman semasa dan Operasi Khas, peruntukan kecemasan, arahan agensi dan dasar kebebasan sivil.
   Bergantung pada js/kdn.js, W.NusaUI dan gaya .mof-* (js/mof-ui.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var KD = W.MyPolitikKDN;
  if (!KD) { return; }
  function esc(s) { return W.NusaUI ? W.NusaUI.esc(s) : String(s); }
  function toast(t, j) { if (W.NusaUI) { W.NusaUI.toast(t, j); } }
  function segarkan() { if (W.NusaUI) { W.NusaUI.render(); } }
  function jt(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('ms-MY') + ' juta'; }
  function tanda(n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n); }
  var LABEL = { tenteram: 'Ketenteraman', bebas: 'Kebebasan sivil', siap: 'Kesiapsiagaan', aktivis: 'Sokongan aktivis' };

  var CSS = '' +
    '.kdn-m{border:1px solid var(--garis,var(--border));border-radius:8px;padding:6px 8px}.kdn-m span{display:block;font-size:.74rem;opacity:.8}.kdn-m b{display:block;font-size:1.1rem}' +
    '.kdn-m s{display:block;height:6px;background:var(--bg-elev-1);border-radius:6px;overflow:hidden;margin-top:3px;text-decoration:none}.kdn-m s i{display:block;height:100%;background:var(--green,#1f7a4d)}.kdn-m.bahaya s i{background:var(--red)}.kdn-m.bahaya b{color:var(--red)}' +
    '.kdn-ag{display:flex;gap:6px;align-items:center;justify-content:space-between;border:1px solid var(--garis,var(--border));border-radius:8px;padding:6px 8px;margin:6px 0}.kdn-ag p{margin:2px 0 0;font-size:.78rem}' +
    '.kdn-ag small,.exco-tx small.k{display:inline-block;background:var(--bg-elev-1);border-radius:6px;padding:1px 6px;margin:2px 4px 0 0;font-size:.72rem}';
  (function () { var s = W.document.createElement('style'); s.textContent = CSS; W.document.head.appendChild(s); })();

  function meter(label, nilai, arah, bahaya, unit) {
    return '<div class="kdn-m' + (bahaya ? ' bahaya' : '') + '"><span>' + label + '</span><b>' + nilai + (unit || '') + '</b><s><i style="width:' + Math.round(nilai) + '%"></i></s><span>' + (arah > 0 ? '▲ ' : arah < 0 ? '▼ ' : '▬ ') + tanda(arah) + ' bulan lalu</span></div>';
  }
  function kesan(x) {
    var l = []; ['tenteram', 'siap', 'bebas', 'aktivis'].forEach(function (k) { if (x[k]) { l.push('<small>' + LABEL[k] + ' ' + tanda(x[k]) + '</small>'); } });
    return l.join('');
  }
  function kad(p) {
    if (!KD.aktif(p)) { return ''; }
    var r = KD.ringkasan(p), C = KD.CONFIG, h = '';
    h += '<div class="mof-stat">' + meter('Ketenteraman awam', r.tenteram, r.arah.tenteram, r.tenteram < C.TENTERAM_RENDAH, '%') + meter('Kebebasan sivil', r.bebas, r.arah.bebas, r.bebas < C.BEBAS_RENDAH) +
      meter('Kesiapsiagaan penguatkuasa', r.siap, r.arah.siap, r.siap < 35, '%') + meter('Sokongan aktivis & pembangkang', r.aktivis, r.arah.aktivis, r.aktivis < C.AKTIVIS_RENDAH) + '</div>';
    h += '<p class="note">💼 Peruntukan operasi KDN: <b>' + jt(r.dana) + '</b> · +' + jt(r.danaBulan) + ' sebulan · had ' + jt(r.danaHad) + '</p>';
    h += '<h3 class="mof-h">🚔 Operasi Khas Keselamatan</h3>';
    if (r.ancaman) {
      var a = r.ancaman;
      h += '<div class="banner banner--warn" role="alert"><strong>🚨 Ancaman semasa: ' + esc(a.nama) + '</strong>Ketenteraman awam ' + a.tenteram + ' sebulan sehingga ditangani · ' + a.bulan + ' bulan berlarutan</div>';
      h += '<div class="exco-tx"><b>' + a.opsIkon + ' ' + esc(a.ops) + '</b><p>Kos ' + jt(a.kos) + ' · peluang berjaya ' + a.peluang + '% (ikut kesiapsiagaan). Berjaya: ancaman tamat, ketenteraman +' + C.OPS_TENTERAM + ', IP +' + C.OPS_IP + '. Gagal: separuh kesan, ancaman kekal.</p>' +
        '<button type="button" class="btn btn--sm btn--primary" data-kdn="ops"' + (a.boleh ? '' : ' disabled title="' + esc(a.sebab) + '"') + '>Lancar operasi</button></div>';
    } else {
      h += '<p class="note">Tiada ancaman semasa. Peluang ancaman baharu bulan depan lebih tinggi jika kesiapsiagaan rendah.</p>';
    }
    var k = r.kecemasan;
    h += '<div class="exco-tx"><b>🆘 Mohon peruntukan kecemasan daripada Perbendaharaan</b><p>+' + jt(k.dana) + ' ke peruntukan operasi. Rizab negara berkurang; risiko rombakan +' + k.rombak + '. Sekali setiap ' + k.selang + ' bulan.</p>' +
      '<button type="button" class="btn btn--sm" data-kdn="kecemasan"' + (k.boleh ? '' : ' disabled title="Peruntukan kecemasan hanya sekali setiap ' + k.selang + ' bulan."') + '>Mohon</button></div>';
    h += '<h3 class="mof-h">🏢 Arahan agensi</h3><p class="note">' + (r.agensiSudah ? 'Arahan agensi bulan ini sudah dikeluarkan.' : 'Satu arahan agensi sebulan. Kesiapsiagaan susut ' + C.SUSUT_SIAP + ' mata sebulan tanpa arahan PDRM atau kawalan sempadan.') + '</p>';
    h += r.agensi.map(function (x) {
      return '<div class="kdn-ag"><div><b>' + x.ikon + ' ' + esc(x.nama) + '</b><p>' + esc(x.huraian) + '</p><small>' + jt(x.kos) + '</small>' + kesan(x.kesan) + '</div>' +
        '<button type="button" class="btn btn--sm" data-kdn="agensi" data-id="' + x.id + '"' + (x.boleh ? '' : ' disabled title="' + esc(x.sebab) + '"') + '>Arah</button></div>';
    }).join('');
    h += '<h3 class="mof-h">📜 Dasar kebebasan sivil</h3><p class="note">' + (r.dasarBoleh ? 'Satu perubahan dasar sebulan.' : 'Perubahan dasar bulan ini sudah dibuat.') + ' Melonggarkan syarat menaikkan kebebasan sivil dan sokongan aktivis; memperketat menaikkan ketenteraman tetapi menurunkan sokongan aktivis dan pembangkang.</p>';
    h += r.dasar.map(function (t) {
      return '<div class="mof-tuil"><b>' + t.ikon + ' ' + esc(t.nama) + '</b><div class="mof-seg">' + t.pilihan.map(function (x) {
        var on = x.id === t.semasa;
        return '<button type="button" class="btn btn--sm' + (on ? ' on' : '') + '" data-kdn="dasar" data-d="' + t.kod + '" data-id="' + esc(x.id) + '"' + (on || !r.dasarBoleh ? ' disabled' : '') + (on ? ' aria-pressed="true"' : '') + '>' + esc(x.label) + '</button>';
      }).join('') + '</div></div>';
    }).join('');
    return h + '<p class="note" style="font-size:.76rem">Agensi dan operasi ialah label simulasi; nilai ialah anggaran permainan.</p>';
  }

  W.document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-kdn]') : null;
    if (!t || t.disabled) { return; }
    var a = t.getAttribute('data-kdn'), r = null;
    if (a === 'ops') { r = KD.lancarOps(); } else if (a === 'kecemasan') { r = KD.mohonKecemasan(); }
    else if (a === 'agensi') { r = KD.arahAgensi(t.getAttribute('data-id')); } else if (a === 'dasar') { r = KD.ubahDasar(t.getAttribute('data-d'), t.getAttribute('data-id')); }
    if (r) { toast(r.ok ? r.mesej : r.ralat, r.ok ? (r.jaya === false ? 'ralat' : 'ok') : 'ralat'); segarkan(); }
  });

  W.MyPolitikKDNUI = { kad: kad };
})(window);
