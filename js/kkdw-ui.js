/* ==========================================================================
   Nusa Politik — js/kkdw-ui.js   (v13.74)
   Tab "Pejabat KKDW" dalam kad kerajaan (js/pru-ui.js) untuk Menteri Kemajuan Desa dan Wilayah: meter,
   fokus agihan, kelulusan projek (infrastruktur mini dan PPRS), projek dalam pembinaan dan aduan rakyat.
   Bergantung pada js/kkdw.js, W.NusaUI dan gaya .mof-* / .kdn-* (js/mof-ui.js, js/kdn-ui.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var KW = W.MyPolitikKKDW;
  if (!KW) { return; }
  function esc(s) { return W.NusaUI ? W.NusaUI.esc(s) : String(s); }
  function toast(t, j) { if (W.NusaUI) { W.NusaUI.toast(t, j); } }
  function segarkan() { if (W.NusaUI) { W.NusaUI.render(); } }
  function jt(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('ms-MY') + ' juta'; }
  function tanda(n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n); }

  function meter(label, nilai, arah, bahaya) {
    return '<div class="kdn-m' + (bahaya ? ' bahaya' : '') + '"><span>' + label + '</span><b>' + nilai + '</b><s><i style="width:' + Math.round(nilai) + '%"></i></s><span>' + (arah > 0 ? '▲ ' : arah < 0 ? '▼ ' : '▬ ') + tanda(arah) + ' bulan lalu</span></div>';
  }
  function kesan(x) {
    var l = [];
    if (x.luar) { l.push('Luar bandar ' + tanda(x.luar)); } if (x.rumah) { l.push('Kepuasan perumahan ' + tanda(x.rumah)); }
    if (x.akar) { l.push('Akar umbi ' + tanda(x.akar)); } if (x.ip) { l.push('IP ' + tanda(x.ip)); }
    return l.map(function (z) { return '<small>' + z + '</small>'; }).join('');
  }
  function kad(p) {
    if (!KW.aktif(p)) { return ''; }
    var r = KW.ringkasan(p), C = KW.CONFIG, h = '';
    h += '<div class="mof-stat">' + meter('Sokongan pengundi luar bandar', r.luar, r.arah.luar, r.luar < C.RENDAH) + meter('Kepuasan perumahan rakyat (PPRS)', r.rumah, r.arah.rumah, r.rumah < C.RENDAH) +
      '<div class="kdn-m"><span>Dana infrastruktur rakyat</span><b>' + jt(r.dana) + '</b><span>+' + jt(r.danaBulan) + ' sebulan · had ' + jt(r.danaHad) + '</span></div></div>';
    h += '<h3 class="mof-h">🧭 Fokus agihan</h3><div class="mof-tuil"><div class="mof-seg">' + r.fokusPilihan.map(function (f) {
      var on = f.id === r.fokus; return '<button type="button" class="btn btn--sm' + (on ? ' on' : '') + '" data-kkdw="fokus" data-id="' + f.id + '"' + (on || !r.fokusBoleh ? ' disabled' : '') + (on ? ' aria-pressed="true"' : '') + '>' + esc(f.label) + '</button>';
    }).join('') + '</div></div><p class="note">Infrastruktur: sokongan luar bandar +2 sebulan, kepuasan perumahan −2 sebulan, projek infrastruktur 20% lebih murah. Perumahan PPRS: sebaliknya. ' + (r.fokusBoleh ? 'Satu perubahan fokus sebulan.' : 'Fokus bulan ini sudah ditukar.') + '</p>';
    h += '<h3 class="mof-h">🏗️ Luluskan projek</h3><p class="note">Baki kelulusan bulan ini: <b>' + r.lulusBaki + '</b>. Kesan diberi bila projek siap.</p>';
    h += r.projek.map(function (d) {
      return '<div class="kdn-ag"><div><b>' + d.ikon + ' ' + esc(d.nama) + '</b><p>' + jt(d.kos) + (d.kos < d.kosAsal ? ' (diskaun fokus)' : '') + ' · siap ' + d.bulan + ' bulan' + (d.lewat ? ' · 15% sebulan kontraktor lewat' : '') + '</p>' + kesan(d.kesan) + '</div>' +
        '<button type="button" class="btn btn--sm" data-kkdw="projek" data-id="' + d.id + '"' + (d.boleh ? '' : ' disabled title="' + esc(d.sebab) + '"') + '>Lulus</button></div>';
    }).join('');
    if (r.binaan.length) { h += '<p class="note">Projek dalam pembinaan: ' + r.binaan.map(function (b) { return '<b>' + esc(b.nama) + '</b> (siap bulan ' + b.bulan + '/' + b.tahun + (b.lewat ? ', lewat' : '') + ')'; }).join(' · ') + '</p>'; }
    if (r.aduan) {
      var a = r.aduan;
      h += '<div class="banner banner--warn" role="alert"><strong>📣 Aduan rakyat: ' + esc(a.nama) + '</strong>' + (a.sasaran === 'rumah' ? 'Kepuasan perumahan' : 'Sokongan luar bandar') + ' −3 sebulan jika tidak dijawab</div>';
      var J = KW.JAWAB;
      h += a.pilihan.map(function (x) {
        var k = x.id === 'baiki' ? jt(x.kos) + ' · ' + (a.sasaran === 'rumah' ? 'kepuasan perumahan' : 'sokongan luar bandar') + ' +' + J.baiki.skor + ', aduan selesai' : x.id === 'hitam' ? 'Tanpa kos · KPI +' + J.hitam.rating + ', aduan selesai, ' + Math.round(J.hitam.saman * 100) + '% kontraktor saman (KPI ' + J.hitam.samanRating + ')' : (a.sasaran === 'rumah' ? 'Kepuasan perumahan' : 'Sokongan luar bandar') + ' ' + J.abai.skor + ', populariti ' + J.abai.pop;
        return '<div class="kdn-ag"><div><b>' + x.ikon + ' ' + esc(x.label) + '</b><p>' + k + '</p></div><button type="button" class="btn btn--sm" data-kkdw="aduan" data-id="' + x.id + '"' + (x.boleh ? '' : ' disabled') + '>Pilih</button></div>';
      }).join('');
    }
    return h + '<p class="note" style="font-size:.76rem">PPRS (Program Perumahan Rakyat Sejahtera) di bawah KKDW; PPR bandar di bawah KPKT. Nama projek ialah label simulasi; nilai ialah anggaran permainan.</p>';
  }

  W.document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-kkdw]') : null;
    if (!t || t.disabled) { return; }
    var a = t.getAttribute('data-kkdw'), id = t.getAttribute('data-id'), r = null;
    if (a === 'fokus') { r = KW.tukarFokus(id); } else if (a === 'projek') { r = KW.lulusProjek(id); } else if (a === 'aduan') { r = KW.jawabAduan(id); }
    if (r) { toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); segarkan(); }
  });

  W.MyPolitikKKDWUI = { kad: kad };
})(window);
