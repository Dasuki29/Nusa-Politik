/* ==========================================================================
   Nusa Politik — js/mindef-ui.js   (v13.73)
   Tab "Pejabat MINDEF" dalam kad kerajaan (js/pru-ui.js) untuk Menteri Pertahanan: meter pertahanan,
   pemantauan sempadan, insiden (tegas / diplomatik), perolehan aset strategik, audit dan arahan bulanan.
   Bergantung pada js/mindef.js, W.NusaUI dan gaya .mof-* / .kdn-* (js/mof-ui.js, js/kdn-ui.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var MD = W.MyPolitikMINDEF;
  if (!MD) { return; }
  function esc(s) { return W.NusaUI ? W.NusaUI.esc(s) : String(s); }
  function toast(t, j) { if (W.NusaUI) { W.NusaUI.toast(t, j); } }
  function segarkan() { if (W.NusaUI) { W.NusaUI.render(); } }
  function jt(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('ms-MY') + ' juta'; }
  function bil(n) { return 'RM ' + Number(n).toLocaleString('ms-MY', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' bilion'; }
  function tanda(n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n); }
  var NAMA_CABANG = { darat: 'Darat', laut: 'Laut', udara: 'Udara' };

  var CSS = '.md-sel{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px}.md-tag{display:inline-block;font-size:.72rem;font-weight:700;border-radius:99px;padding:1px 8px;background:var(--bg-elev-1)}.md-tag.x{background:var(--red);color:#fff}' +
    '.md-aset td{font-size:.78rem}.md-aset td:last-child{white-space:nowrap}';
  (function () { var s = W.document.createElement('style'); s.textContent = CSS; W.document.head.appendChild(s); })();

  function meter(label, nilai, arah, bahaya, unit) {
    return '<div class="kdn-m' + (bahaya ? ' bahaya' : '') + '"><span>' + label + '</span><b>' + nilai + (unit || '') + '</b><s><i style="width:' + Math.round(nilai) + '%"></i></s><span>' + (arah > 0 ? '▲ ' : arah < 0 ? '▼ ' : '▬ ') + tanda(arah) + ' bulan lalu</span></div>';
  }
  function kad(p) {
    if (!MD.aktif(p)) { return ''; }
    var r = MD.ringkasan(p), C = MD.CONFIG, h = '';
    h += '<div class="mof-stat">' + meter('Skor keselamatan negara', r.keselamatan, r.arah.keselamatan, r.keselamatan < C.RENDAH) + meter('Kesiapsiagaan tentera', r.siap, r.arah.siap, r.siap < 40, '%') +
      meter('Risiko skandal perolehan', r.risiko, r.arah.risiko, r.risiko > r.skandalAmbang, '%') + meter('Sokongan jeneral', r.jeneral, r.arah.jeneral, r.jeneral < C.JENERAL_RENDAH) + '</div>';
    h += '<p class="note">💼 Peruntukan operasi: <b>' + jt(r.dana) + '</b> · +' + jt(r.danaBulan) + ' sebulan · Peruntukan perolehan: <b>' + bil(r.perolehan) + '</b> · +' + bil(r.perolehanTahun) + ' setiap Januari</p>';
    h += '<h3 class="mof-h">🛰️ Pemantauan sempadan</h3><table class="mof-bj"><thead><tr><th>Cabang</th><th>Kesiapsiagaan</th><th>Status</th></tr></thead><tbody>' + r.cabang.map(function (c) {
      return '<tr><td>' + c.ikon + ' ' + esc(c.nama) + ' <span class="note">(' + esc(c.kawasan) + ')</span></td><td><span class="mof-hub' + (c.siap < 40 ? ' marah' : '') + '"><i style="width:' + c.siap + '%"></i></span>' + c.siap + '%</td><td>' + (c.ceroboh ? '<span class="md-tag x">Pencerobohan</span>' : '<span class="md-tag">Aman</span>') + '</td></tr>';
    }).join('') + '</tbody></table>';
    if (r.insiden) {
      var i = r.insiden;
      h += '<div class="banner banner--warn" role="alert"><strong>' + i.ikon + ' Insiden: ' + esc(i.nama) + '</strong>Skor keselamatan ' + i.keselamatan + ' sebulan sehingga diputuskan · ' + i.bulan + ' bulan</div>';
      h += '<div class="exco-tx"><b>⚔️ Bertindak tegas (ketenteraan)</b><p>' + jt(i.kos) + ' · peluang berjaya ' + i.peluang + '% (kesiapsiagaan ' + esc(NAMA_CABANG[i.cabang]) + '). Berjaya: keselamatan +' + C.TEGAS.keselamatan + ', sokongan jeneral +' + C.TEGAS.jeneral + ', populariti +' + C.TEGAS.pop + '. Gagal: keselamatan ' + C.TEGAS.gagalKeselamatan + ', populariti ' + C.TEGAS.gagalPop + ', insiden kekal.</p>' +
        '<button type="button" class="btn btn--sm btn--primary" data-mindef="tegas"' + (i.bolehTegas ? '' : ' disabled') + '>' + esc(i.tegas) + '</button></div>';
      h += '<div class="exco-tx"><b>🤝 Berunding secara diplomatik</b><p>Tanpa kos · insiden tamat. Keselamatan ' + C.DIPLOMATIK.keselamatan + ', sokongan jeneral ' + C.DIPLOMATIK.jeneral + ', populariti ' + C.DIPLOMATIK.pop + '.</p>' +
        '<button type="button" class="btn btn--sm" data-mindef="diplomatik"' + (i.sudah ? ' disabled' : '') + '>Nota bantahan &amp; rundingan</button></div>';
    } else {
      h += '<p class="note">Tiada insiden sempadan. Insiden lebih kerap jika kesiapsiagaan cabang rendah.</p>';
    }
    h += '<h3 class="mof-h">🛒 Perolehan aset strategik</h3><p class="note">Satu kontrak baharu sebulan. Aset siap: kesiapsiagaan cabang +' + C.ASET_SIAP.cabang + ', keselamatan +' + C.ASET_SIAP.keselamatan + '. Rundingan terus lebih cepat dan disukai jeneral, tetapi menaikkan risiko skandal.</p>';
    h += '<table class="mof-bj md-aset"><thead><tr><th>Aset</th><th>Kos</th><th>Lulus</th></tr></thead><tbody>' + r.aset.map(function (a) {
      var d = a.boleh ? '' : ' disabled title="' + esc(a.sebab) + '"';
      return '<tr><td>' + a.ikon + ' ' + esc(a.nama) + '<br><span class="note">Tender terbuka: siap ' + a.terbuka + ' bulan · Rundingan terus: siap ' + a.terus + ' bulan, jeneral +' + a.jeneral + ', risiko +' + a.risiko + '</span></td><td>' + bil(a.kos) + '</td><td>' +
        '<button type="button" class="btn btn--sm" data-mindef="kontrak" data-id="' + a.id + '" data-laluan="terbuka"' + d + '>Tender</button> <button type="button" class="btn btn--sm" data-mindef="kontrak" data-id="' + a.id + '" data-laluan="terus"' + d + '>Terus</button></td></tr>';
    }).join('') + '</tbody></table>';
    if (r.kontrak.length) { h += '<p class="note">Kontrak dalam proses: ' + r.kontrak.map(function (k) { return '<b>' + esc(k.nama) + '</b> (siap bulan ' + k.bulan + '/' + k.tahun + ')'; }).join(' · ') + '</p>'; }
    h += '<div class="exco-tx"><b>🔍 Audit dalaman perolehan</b><p>' + jt(r.audit.kos) + ' · risiko skandal ' + r.audit.risiko + ', sokongan jeneral ' + r.audit.jeneral + '.</p><button type="button" class="btn btn--sm" data-mindef="audit"' + (r.audit.boleh ? '' : ' disabled') + '>Arah audit</button></div>';
    h += '<h3 class="mof-h">🏋️ Arahan bulanan</h3><p class="note">' + (r.arahanSudah ? 'Arahan bulan ini sudah dikeluarkan.' : 'Satu arahan sebulan. Kesiapsiagaan setiap cabang susut ' + C.SUSUT_SIAP + ' mata sebulan tanpa latihan atau penyelenggaraan.') + '</p>';
    h += r.arahan.map(function (a) {
      var d = a.boleh ? '' : ' disabled title="' + esc(a.sebab) + '"', kes = a.cabang ? 'kesiapsiagaan cabang +' + a.cabang : a.semua ? 'semua cabang +' + a.semua : 'sokongan jeneral +' + a.jeneral;
      var btn = a.id === 'latihan' ? '<div class="md-sel">' + ['darat', 'laut', 'udara'].map(function (c) { return '<button type="button" class="btn btn--sm" data-mindef="arahan" data-id="latihan" data-cabang="' + c + '"' + d + '>' + NAMA_CABANG[c] + '</button>'; }).join('') + '</div>'
        : '<button type="button" class="btn btn--sm" data-mindef="arahan" data-id="' + a.id + '"' + d + '>Arah</button>';
      return '<div class="kdn-ag"><div><b>' + a.ikon + ' ' + esc(a.nama) + '</b><p>' + esc(a.huraian) + '</p><small>' + jt(a.kos) + '</small><small>' + kes + '</small></div>' + btn + '</div>';
    }).join('');
    return h + '<p class="note" style="font-size:.76rem">Aset dan insiden ialah label simulasi; tiada negara asing dinamakan. Nilai ialah anggaran permainan.</p>';
  }

  W.document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-mindef]') : null;
    if (!t || t.disabled) { return; }
    var a = t.getAttribute('data-mindef'), r = null;
    if (a === 'tegas' || a === 'diplomatik') { r = MD.tanganiInsiden(a); }
    else if (a === 'kontrak') { r = MD.lulusKontrak(t.getAttribute('data-id'), t.getAttribute('data-laluan')); }
    else if (a === 'audit') { r = MD.auditPerolehan(); } else if (a === 'arahan') { r = MD.arahan(t.getAttribute('data-id'), t.getAttribute('data-cabang')); }
    if (r) { toast(r.ok ? r.mesej : r.ralat, r.ok ? (r.jaya === false ? 'ralat' : 'ok') : 'ralat'); segarkan(); }
  });

  W.MyPolitikMINDEFUI = { kad: kad };
})(window);
