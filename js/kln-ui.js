/* ==========================================================================
   Nusa Politik — js/kln-ui.js   (v13.76)
   Tab "Pejabat Wisma Putra" dalam kad kerajaan (js/pru-ui.js) untuk Menteri Luar Negeri: kedudukan diplomatik,
   dagangan, hubungan blok dan lawatan, isu antarabangsa, krisis konsular, sidang kemuncak dan perjanjian perdagangan bebas.
   Bergantung pada js/kln.js, W.NusaUI dan gaya .mof-* / .kdn-* / .md-* (js/mof-ui.js, js/kdn-ui.js, js/mindef-ui.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var KL = W.MyPolitikKLN;
  if (!KL) { return; }
  function esc(s) { return W.NusaUI ? W.NusaUI.esc(s) : String(s); }
  function toast(t, j) { if (W.NusaUI) { W.NusaUI.toast(t, j); } }
  function segarkan() { if (W.NusaUI) { W.NusaUI.render(); } }
  function jt(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('ms-MY') + ' juta'; }
  function tanda(n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n); }
  var STATUS = { beku: ['Beku', ' x'], dingin: ['Dingin', ' x'], baik: ['Baik', ''], erat: ['Erat', ''] };

  function meter(label, nilai, arah, bahaya) {
    return '<div class="kdn-m' + (bahaya ? ' bahaya' : '') + '"><span>' + label + '</span><b>' + nilai + '</b><s><i style="width:' + Math.round(nilai) + '%"></i></s><span>' + (arah > 0 ? '▲ ' : arah < 0 ? '▼ ' : '▬ ') + tanda(arah) + ' bulan lalu</span></div>';
  }
  function kesan(x, L) { return Object.keys(x).map(function (k) { return '<small>' + (L[k] || k) + ' ' + tanda(x[k]) + '</small>'; }).join(''); }
  function kad(p) {
    if (!KL.aktif(p)) { return ''; }
    var r = KL.ringkasan(p), C = KL.CONFIG, h = '';
    h += '<div class="mof-stat">' + meter('Kedudukan diplomatik negara', r.kedudukan, r.arah.kedudukan, r.kedudukan < C.RENDAH) + meter('Indeks dagangan & pelaburan asing', r.dagang, r.arah.dagang, r.dagang < 35) +
      '<div class="kdn-m"><span>Bajet diplomatik</span><b>' + jt(r.dana) + '</b><span>+' + jt(r.danaBulan) + ' sebulan · had ' + jt(r.danaHad) + '</span></div></div>';
    h += '<h3 class="mof-h">🤝 Hubungan dengan blok antarabangsa</h3><table class="mof-bj"><thead><tr><th>Blok</th><th>Hubungan</th><th>Status</th><th></th></tr></thead><tbody>' + r.blok.map(function (b) {
      var st = STATUS[b.status];
      return '<tr><td>' + b.ikon + ' ' + esc(b.nama) + '</td><td><span class="mof-hub' + (b.hubungan < 45 ? ' marah' : '') + '"><i style="width:' + b.hubungan + '%"></i></span>' + b.hubungan + '</td><td><span class="md-tag' + st[1] + '">' + st[0] + '</span></td>' +
        '<td><button type="button" class="btn btn--sm" data-kln="lawatan" data-id="' + b.kod + '"' + (r.lawatan.boleh ? '' : ' disabled title="' + esc(r.lawatan.sebab) + '"') + '>Lawatan</button></td></tr>';
    }).join('') + '</tbody></table><p class="note">Lawatan rasmi: ' + jt(C.LAWATAN.kos) + ' · hubungan blok +' + C.LAWATAN.hubungan + ' · IP +' + C.LAWATAN.ip + ' · satu lawatan sebulan.</p>';
    if (r.isu) {
      h += '<div class="banner banner--warn" role="alert"><strong>' + r.isu.ikon + ' Isu antarabangsa: ' + esc(r.isu.nama) + '</strong>Pilih pendirian (kedudukan diplomatik ' + C.ISU_ABAI + ' sebulan jika tiada pendirian)</div>';
      h += r.isu.pilihan.map(function (c) { return '<div class="kdn-ag"><div><b>' + c.ikon + ' ' + esc(c.label) + '</b><div>' + kesan(c.kesan, r.label) + '</div></div><button type="button" class="btn btn--sm" data-kln="isu" data-id="' + c.id + '">Pilih</button></div>'; }).join('');
    }
    if (r.konsular) {
      var k = r.konsular;
      h += '<div class="banner banner--warn" role="alert"><strong>' + k.ikon + ' Krisis konsular: ' + esc(k.nama) + '</strong>' + (k.fasa === 'saluran' ? 'Saluran diplomatik sedang berjalan · keputusan bulan ' + k.siap : 'Populariti ' + C.KONSULAR_ABAI + ' sebulan jika tidak ditangani') + '</div>';
      if (k.fasa === 'baru') {
        h += '<div class="kdn-ag"><div><b>🛫 Operasi pemindahan segera</b><p>' + jt(C.PINDAH.kos) + ' · ' + Math.round(C.PINDAH.peluang * 100) + '% berjaya: populariti +' + C.PINDAH.pop + ', IP +' + C.PINDAH.ip + ' · gagal: populariti ' + C.PINDAH.gagalPop + '</p></div><button type="button" class="btn btn--sm" data-kln="konsular" data-id="pindah"' + (k.bolehPindah ? '' : ' disabled') + '>Pilih</button></div>' +
          '<div class="kdn-ag"><div><b>📞 Saluran diplomatik</b><p>Tanpa kos · ' + C.SALURAN.bulan + ' bulan · ' + Math.round(C.SALURAN.peluang * 100) + '% berjaya: populariti +' + C.SALURAN.pop + ' · gagal: populariti ' + C.SALURAN.gagalPop + '</p></div><button type="button" class="btn btn--sm" data-kln="konsular" data-id="saluran">Pilih</button></div>';
      }
    }
    h += '<h3 class="mof-h">🏛️ Inisiatif diplomatik</h3>';
    h += '<div class="kdn-ag"><div><b>🌐 Hos sidang kemuncak serantau</b><p>Sekali setahun · ' + jt(C.SIDANG.kos) + ' · kedudukan diplomatik +' + C.SIDANG.kedudukan + ', ASEAN +' + C.SIDANG.asean + ', IP +' + C.SIDANG.ip + '</p></div><button type="button" class="btn btn--sm" data-kln="sidang"' + (r.sidang.boleh ? '' : ' disabled') + '>Anjur</button></div>';
    h += '<div class="kdn-ag"><div><b>📑 Rundingan perjanjian perdagangan bebas</b><p>' + (r.fta ? 'Sedang berunding dengan ' + esc(r.fta.blok) + ' · siap bulan ' + r.fta.siap : C.FTA.bulan + ' bulan · dagangan +' + C.FTA.dagang + ' · peniaga tempatan bimbang (rakan gabungan ' + C.FTA.rakanPM + ' jika ada Pejabat PM)') + '</p></div>' +
      (r.fta ? '' : '<div class="md-sel">' + r.blok.map(function (b) { return '<button type="button" class="btn btn--sm" data-kln="fta" data-id="' + b.kod + '">' + esc(b.nama) + '</button>'; }).join('') + '</div>') + '</div>';
    return h + '<p class="note" style="font-size:.76rem">Blok dan isu ialah label simulasi; tiada negara atau konflik sebenar dinamakan. Nilai ialah anggaran permainan.</p>';
  }

  W.document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-kln]') : null;
    if (!t || t.disabled) { return; }
    var a = t.getAttribute('data-kln'), id = t.getAttribute('data-id'), r = null;
    if (a === 'lawatan') { r = KL.lawatan(id); } else if (a === 'isu') { r = KL.pendirian(id); } else if (a === 'konsular') { r = KL.tanganiKonsular(id); }
    else if (a === 'sidang') { r = KL.sidangKemuncak(); } else if (a === 'fta') { r = KL.mulaFTA(id); }
    if (r) { toast(r.ok ? r.mesej : r.ralat, r.ok ? (r.jaya === false ? 'ralat' : 'ok') : 'ralat'); segarkan(); }
  });

  W.MyPolitikKLNUI = { kad: kad };
})(window);
