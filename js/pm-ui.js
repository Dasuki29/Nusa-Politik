/* ==========================================================================
   Nusa Politik — js/pm-ui.js   (v13.75)
   Tab "Pejabat PM" dalam kad kerajaan (js/pru-ui.js) untuk Perdana Menteri: majoriti Parlimen, kestabilan kabinet,
   krisis nasional, blok gabungan dan tuntutan, kuasa eksekutif (rombakan, agih portfolio, dasar mega), langkah tegas dan darurat.
   Bergantung pada js/pm.js, W.NusaUI dan gaya .mof-* / .kdn-* / .md-* (js/mof-ui.js, js/kdn-ui.js, js/mindef-ui.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var PM = W.MyPolitikPM;
  if (!PM) { return; }
  function esc(s) { return W.NusaUI ? W.NusaUI.esc(s) : String(s); }
  function toast(t, j) { if (W.NusaUI) { W.NusaUI.toast(t, j); } }
  function segarkan() { if (W.NusaUI) { W.NusaUI.render(); } }
  function tanda(n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n); }
  var STATUS = { setia: ['Setia', ''], resah: ['Resah', ''], ugut: ['Mengugut tarik sokongan', ' x'], tarik: ['Tarik sokongan', ' x'] };
  var KESAN = { pop: 'Populariti', krisis: 'Krisis', rakan: 'Kepuasan rakan', stabil: 'Kestabilan', reputasi: 'Reputasi', ip: 'IP' };

  function meter(label, nilai, isi, arah, bahaya, nota) {
    return '<div class="kdn-m' + (bahaya ? ' bahaya' : '') + '"><span>' + label + '</span><b>' + nilai + '</b><s><i style="width:' + Math.round(isi) + '%"></i></s><span>' + (nota ? nota + ' · ' : '') + (arah > 0 ? '▲ ' : arah < 0 ? '▼ ' : '▬ ') + tanda(arah) + ' bulan lalu</span></div>';
  }
  function kesanTeks(x) {
    var l = []; Object.keys(x).forEach(function (k) { if (k === 'rizab') { l.push('Rizab MOF −RM ' + x[k].toFixed(1) + ' bilion'); } else if (KESAN[k]) { l.push(KESAN[k] + ' ' + tanda(x[k])); } });
    return l.map(function (z) { return '<small>' + z + '</small>'; }).join('');
  }
  function kad(p) {
    if (!PM.isPrimeMinister(p)) { return ''; }
    var r = PM.ringkasan(p), C = PM.CONFIG, h = '', n = r.parliamentaryMajority, J = C.JAWAB, A = C.AGIH, T = C.TEGAS, D = C.DARURAT;
    h += '<div class="mof-stat">' + meter('Majoriti Parlimen', (n === null ? '—' : n) + ' / ' + r.jumlah, n === null ? 0 : n / r.jumlah * 100, r.arah.majoriti, n !== null && n < r.ambang, 'ambang ' + r.ambang + (n === null ? '' : n >= r.ambang ? ' · lebihan ' + (n - r.ambang) : ' · kurang ' + (r.ambang - n))) +
      meter('Kestabilan kabinet', r.cabinetStability, r.cabinetStability, r.arah.stabil, r.cabinetStability < C.STABIL_RENDAH) +
      meter('Tahap krisis nasional', r.nationalCrisisLevel, r.nationalCrisisLevel, r.arah.krisis, r.nationalCrisisLevel >= C.KRISIS_TINGGI) + '</div>';
    if (r.darurat.aktif) { h += '<div class="banner banner--warn"><strong>🛑 Darurat berkuat kuasa</strong>Usul Undi Tidak Percaya tidak boleh dikemukakan sehingga bulan ' + (((r.darurat.hingga - 1) % 12) + 1) + '/' + Math.floor((r.darurat.hingga - 1) / 12) + '.</div>'; }
    else if (n !== null && n < r.ambang) { h += '<div class="banner banner--warn" role="alert"><strong>⚠️ Kerajaan kehilangan majoriti</strong>Usul Undi Tidak Percaya akan dikemukakan. Pulihkan sokongan blok atau bersedia di Dewan Rakyat.</div>'; }
    h += '<h3 class="mof-h">🤝 Blok gabungan</h3><table class="mof-bj"><thead><tr><th>Blok</th><th>Kerusi</th><th>Kepuasan</th><th>Status</th></tr></thead><tbody>' + r.blok.map(function (b) {
      var st = b.kepuasan === null ? ['Setia', ''] : STATUS[b.status];
      return '<tr><td>' + esc(b.nama) + '</td><td>' + b.kerusi + '</td><td>' + (b.kepuasan === null ? '—' : '<span class="mof-hub' + (b.kepuasan < 35 ? ' marah' : '') + '"><i style="width:' + b.kepuasan + '%"></i></span>' + b.kepuasan) + '</td><td><span class="md-tag' + st[1] + '">' + st[0] + '</span></td></tr>';
    }).join('') + (r.goyah ? '<tr><td>MP goyah</td><td>−' + r.goyah + '</td><td>—</td><td><span class="md-tag x">Mungkin lompat</span></td></tr>' : '') + '</tbody></table>';
    if (r.tuntutan) {
      var t = r.tuntutan;
      h += '<div class="banner banner--warn" role="alert"><strong>📜 Tuntutan: ' + esc(t.nama) + ' ' + esc(t.teks) + '</strong>Jika kepuasan blok jatuh bawah ' + C.TARIK + ', blok menarik sokongan: majoriti −' + t.kerusi + ' kerusi. Kepuasan semasa ' + t.kepuasan + '.</div>';
      h += '<div class="kdn-ag"><div><b>✅ Terima</b><p>Kepuasan blok +' + J.terima.blok + ' · kestabilan kabinet ' + J.terima.stabil + ' · rizab MOF −RM ' + J.terima.rizab.toFixed(1) + ' bilion jika ada</p></div><button type="button" class="btn btn--sm" data-pm="tuntutan" data-id="terima">Pilih</button></div>' +
        '<div class="kdn-ag"><div><b>🤝 Runding (kompromi)</b><p>' + J.runding.ap + ' AP · ' + Math.round(J.runding.peluang * 100) + '% berjaya: kepuasan +' + J.runding.jaya + ' · gagal: kepuasan ' + J.runding.gagal + '</p></div><button type="button" class="btn btn--sm" data-pm="tuntutan" data-id="runding">Pilih</button></div>' +
        '<div class="kdn-ag"><div><b>✋ Tolak</b><p>Kepuasan blok ' + J.tolak.blok + ' · kestabilan kabinet +' + J.tolak.stabil + '</p></div><button type="button" class="btn btn--sm" data-pm="tuntutan" data-id="tolak">Pilih</button></div>';
    }
    h += '<h3 class="mof-h">🏛️ Kuasa eksekutif</h3>';
    h += '<div class="kdn-ag"><div><b>🔄 Rombakan Kabinet</b><p>Pilih semula menteri di kad Jemaah Menteri · sekali setahun · kestabilan kabinet ikut Kesetiaan baharu</p></div><button type="button" class="btn btn--sm" data-pm="rombak"' + (r.rombak.boleh ? '' : ' disabled title="' + esc(r.rombak.sebab) + '"') + '>Rombak</button></div>';
    var blokRakan = r.blok.filter(function (b) { return b.kod !== 'sendiri'; });
    h += '<div class="kdn-ag"><div><b>🎁 Agih portfolio kepada blok</b><p>Kepuasan blok +' + A.blok + ' · kestabilan kabinet ' + A.stabil + ' · sekali setiap ' + A.selang + ' bulan</p></div><div class="md-sel">' +
      (blokRakan.length ? blokRakan.map(function (b) { return '<button type="button" class="btn btn--sm" data-pm="agih" data-id="' + b.kod + '"' + (r.agih.boleh ? '' : ' disabled') + '>' + esc(b.nama) + '</button>'; }).join('') : '<span class="note">Tiada rakan gabungan.</span>') + '</div></div>';
    h += '<p class="note"><b>📣 Dasar mega nasional</b> · ' + (r.dasarBoleh ? 'sekali setahun, pilih satu:' : 'dasar mega tahun ini sudah diumumkan.') + '</p>' + r.dasar.map(function (d) {
      return '<div class="kdn-ag"><div><b>' + d.ikon + ' ' + esc(d.nama) + '</b><p>' + esc(d.huraian) + '</p>' + kesanTeks(d.kesan) + '</div><button type="button" class="btn btn--sm" data-pm="dasar" data-id="' + d.id + '"' + (r.dasarBoleh ? '' : ' disabled') + '>Umumkan</button></div>';
    }).join('');
    h += '<h3 class="mof-h">🚨 Krisis &amp; langkah drastik</h3>';
    h += '<div class="kdn-ag"><div><b>⚖️ Langkah tegas</b><p>Krisis ' + T.krisis + ' · populariti ' + T.pop + ' · kebebasan sivil KDN ' + T.bebas + ' jika ada · sekali sebulan</p></div><button type="button" class="btn btn--sm" data-pm="tegas"' + (r.tegasBoleh ? '' : ' disabled') + '>Laksana</button></div>';
    h += '<div class="kdn-ag"><div><b>🛑 Isytihar darurat</b><p>Hanya jika krisis ' + D.minKrisis + ' atau lebih · sekali sepenggal · krisis ' + D.krisis + ' · Usul Tidak Percaya disekat ' + D.bulan + ' bulan · populariti ' + D.pop + ', Reputasi ' + D.reputasi + ', kebebasan sivil ' + D.bebas + ', kestabilan kabinet ' + D.stabil + '</p></div>' +
      '<button type="button" class="btn btn--sm" data-pm="darurat"' + (r.darurat.boleh ? '' : ' disabled title="' + esc(r.darurat.sebab) + '"') + '>Isytihar</button></div>';
    return h + '<p class="note" style="font-size:.76rem">Pecahan kerusi rakan (60% Semenanjung, 40% Sabah dan Sarawak) ialah anggaran. Darurat ialah mekanik simulasi. Nilai ialah anggaran permainan.</p>';
  }

  W.document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-pm]') : null;
    if (!t || t.disabled) { return; }
    var a = t.getAttribute('data-pm'), id = t.getAttribute('data-id'), r = null;
    if (a === 'tuntutan') { r = PM.jawabTuntutan(id); } else if (a === 'agih') { r = PM.agihPortfolio(id); } else if (a === 'rombak') { r = PM.rombakKabinet(); }
    else if (a === 'dasar') { r = PM.umumDasar(id); } else if (a === 'tegas') { r = PM.langkahTegas(); } else if (a === 'darurat') { r = PM.isytiharDarurat(); }
    if (r) { toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); segarkan(); }
  });

  W.MyPolitikPMUI = { kad: kad };
})(window);
