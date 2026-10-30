/* ==========================================================================
   Nusa Politik — js/letak-ui.js   (v13.12)
   Kad "🏛️ Jawatan & Letak Jawatan" di tab Profil (v13.19: dahulu "Wakil Rakyat & Kerajaan"; kini termasuk jawatan parti) dan skrin pengesahan Letak Jawatan (logik dalam js/letak.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikLetak, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function neg(n) { return M.neg(n); }
  function U() { return W.NusaUI || {}; }
  function baris(x, boleh) {
    var ik = x.id === 'MP' ? '🏢' : x.id === 'ADUN' ? '🏛️' : '👔';
    var tajuk = x.id === 'KERAJAAN' ? esc(x.label) : esc(x.label) + ' <span>' + esc(x.kerusi) + '</span>';
    var kecil = x.id === 'KERAJAAN' ? (x.persekutuan ? 'Jawatan kerajaan persekutuan' : 'Jawatan kerajaan negeri') : (x.sejak ? 'Sejak ' + esc(x.sejak) : '') + (x.kerajaan ? ' · kerajaan' : ' · pembangkang');
    var lbl = x.id === 'KERAJAAN' ? 'Letak jawatan' : 'Letak jawatan ' + (x.id === 'MP' ? 'MP' : 'ADUN');
    return '<div class="letak-baris"><span class="letak-ikon" aria-hidden="true">' + ik + '</span><div class="letak-teks"><b>' + tajuk + '</b><small class="note">' + kecil + '</small></div>' +
      '<button type="button" class="btn btn--sm btn--ghost letak-btn" data-letak="' + esc(x.id) + '"' + (boleh ? '' : ' disabled') + '>' + lbl + '</button></div>';
  }
  function barisParti(x, boleh) {
    return '<div class="letak-baris"><span class="letak-ikon" aria-hidden="true">' + (x.presiden ? '👑' : x.peringkat === 'Pusat' ? '🏛️' : x.peringkat === 'Bahagian' ? '🏢' : '🏠') + '</span><div class="letak-teks"><b>' + esc(x.jawatan) + '</b><small class="note">' + esc(x.peringkat) + ' · beban Stress +' + x.beban + ' sebulan</small></div>' +
      '<button type="button" class="btn btn--sm btn--ghost letak-btn" data-letak-parti="' + esc(x.kod) + '"' + (boleh ? '' : ' disabled') + '>Letak jawatan</button></div>';
  }
  function kad(p) {
    try {
      var s = M.senarai(p), sp = M.senaraiParti ? M.senaraiParti(p) : [];
      if (!s.length && !sp.length) { return ''; }
      var st = M.status(p), stp = M.statusParti ? M.statusParti(p) : st, h = '<section class="card letak-kad"><h2 class="card__title" style="margin:0 0 6px">🏛️ Jawatan &amp; Letak Jawatan</h2>';
      var bb = M.bebanSebulan ? M.bebanSebulan(p) : 0, w = Math.max(0, Math.min(100, bb * 4));
      h += '<div class="loy__row"><div class="loy__label"><span>Beban Stress sebulan (semua jawatan)</span><b>+' + bb + '</b></div><div class="progress progress--sm" role="img" aria-label="Beban Stress sebulan +' + bb + '"><div class="progress__bar" style="width:' + w + '%;background:var(--danger)"></div></div></div>';
      if (sp.length) { h += '<h3 class="letak-h">Jawatan parti</h3>' + sp.map(function (x) { return barisParti(x, stp.boleh); }).join(''); }
      if (s.length) { h += '<h3 class="letak-h">Wakil rakyat &amp; kerajaan</h3>' + s.map(function (x) { return baris(x, st.boleh); }).join(''); }
      h += '<p class="note" style="margin-top:6px">' + (stp.boleh ? 'Butang dikunci semasa musim pemilihan parti, pilihan raya atau PRK.' : '🔒 ' + esc(stp.sebab) + (st.boleh && s.length ? ' Jawatan parti dikunci buat sementara.' : ' Letak jawatan dikunci buat sementara.')) + '</p>';
      var l = M.getLetak(p);
      if (l.prk && l.prk.length) { h += l.prk.map(function (x) { return '<p class="note">🗳️ PRK ' + (x.jenis === 'DUN' ? 'DUN ' : 'Parlimen ') + esc(x.nama) + ': ' + esc(M.tb(x.i)) + ' (calon parti)</p>'; }).join(''); }
      var bt = M.bertenang(p); if (bt) { h += '<p class="note">⏳ Tidak boleh dilobi untuk jawatan kerajaan sehingga ' + esc(M.tb(bt)) + '.</p>'; }
      return h + '</section>';
    } catch (e) { return ''; }
  }
  function isiSahkan(p, x) {
    var C = M.CONFIG, li = [];
    if (x.id === 'KERAJAAN') {
      li.push('Reputasi ' + neg(C.KERAJAAN.reputasi) + '. Elaun dan peruntukan (CDF) tamat.');
      li.push('Kerusi wakil rakyat anda kekal.');
      if (x.pm) { li.push('Timbalan Perdana Menteri mengambil alih sebagai Perdana Menteri.'); }
      li.push('Tidak boleh dilobi untuk jawatan kerajaan selama ' + C.KERAJAAN.bertenang + ' bulan.');
    } else {
      li.push('Reputasi ' + neg(C.KERUSI.reputasi) + ', sokongan akar umbi ' + neg(C.KERUSI.akarUmbi) + '.');
      if (x.ikut) { li.push('Jawatan ' + esc(x.ikut) + ' juga tamat (bergantung pada kerusi ' + (x.id === 'MP' ? 'Parlimen' : 'DUN') + ').'); }
      li.push(x.prk ? 'PRK ' + (x.id === 'MP' ? 'Parlimen ' : 'DUN ') + esc(x.kerusi) + ' diadakan bulan depan. Parti meletakkan calon lain; anda tidak bertanding. Jika parti kalah dalam PRK: Reputasi ' + neg(C.PRK.kalahReputasi) + ' lagi.'
        : 'Tiada PRK (' + C.PRK.tanpaPRK + ' bulan atau kurang sebelum pilihan raya): kerusi kosong sehingga pilihan raya akan datang.');
    }
    var lain = M.senarai(p).filter(function (y) { return y.id !== x.id && !(x.id !== 'KERAJAAN' && y.id === 'KERAJAAN' && x.ikut); });
    if (!lain.length) { li.push('Selepas tiada kerusi dan jawatan kerajaan, Pindah Cawangan boleh dibuka (syarat lain kekal).'); }
    return '<p class="acara__ikon" aria-hidden="true">⚠️</p><ul class="letak-sahkan">' + li.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>';
  }
  async function sahkan(id) {
    var p = S.loadPlayer(), x = M.senarai(p).filter(function (y) { return y.id === id; })[0];
    if (!x || !U().modal) { return; }
    var tajuk = x.id === 'KERAJAAN' ? 'Letak jawatan ' + x.label + '?' : 'Letak jawatan ' + x.label + ' ' + x.kerusi + '?';
    var ya = await U().modal({ tajuk: tajuk, isi: isiSahkan(p, x), butang: [{ label: 'Ya, letak jawatan', nilai: 'ya', kelas: 'btn--danger' }, { label: 'Batal', nilai: '', kelas: 'btn--ghost' }] });
    if (ya !== 'ya') { return; }
    var r = x.id === 'KERAJAAN' ? M.letakKerajaan() : M.letakKerusi(x.id);
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  }
  async function sahkanParti(kod) {
    var p = S.loadPlayer(), x = (M.senaraiParti(p) || []).filter(function (y) { return y.kod === kod; })[0], C = M.CONFIG.PARTI;
    if (!x || !U().modal) { return; }
    var li = ['Beban Stress −' + x.beban + ' sebulan mulai bulan depan; Stress −' + (C.stressKali * x.beban) + ' serta-merta.'];
    li.push(x.reputasi ? 'Reputasi ' + neg(x.reputasi) + '.' : 'Tiada kesan Reputasi.');
    li.push(x.presiden ? 'Timbalan Presiden (NPC) menjadi Presiden. Rundingan kerajaan selepas PRU tidak lagi dibuat oleh anda.' : 'Pengganti NPC mengambil alih sehingga pemilihan seterusnya; anda boleh bertanding semula ketika itu.');
    if (x.presiden) { var kb = W.MyPolitikKabinet ? W.MyPolitikKabinet.getKabinet(p) : null; if (kb && kb.roleLevel === 'PERDANA_MENTERI') { li.push('Anda kekal Perdana Menteri hingga PRU seterusnya, tetapi tekanan politik +' + C.pmTekanan + '.'); } }
    li.push('Jawatan lain kekal.');
    var ya = await U().modal({ tajuk: 'Letak jawatan ' + x.jawatan + '?', isi: '<p class="acara__ikon" aria-hidden="true">⚠️</p><ul class="letak-sahkan">' + li.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>',
      butang: [{ label: 'Ya, letak jawatan', nilai: 'ya', kelas: 'btn--danger' }, { label: 'Batal', nilai: '', kelas: 'btn--ghost' }] });
    if (ya !== 'ya') { return; }
    var r = M.letakParti(kod);
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  }
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-letak],[data-letak-parti]') : null; if (!b || b.disabled) { return; }
    if (b.hasAttribute('data-letak-parti')) { sahkanParti(b.getAttribute('data-letak-parti')); return; }
    sahkan(b.getAttribute('data-letak'));
  });
  var st = W.document.createElement('style');
  st.textContent = '.letak-baris{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--border,rgba(127,127,127,.2))}.letak-baris:first-of-type{border-top:0}' +
    '.letak-ikon{flex:none;font-size:1.2rem}.letak-teks{flex:1;min-width:0;display:flex;flex-direction:column;overflow-wrap:anywhere}.letak-btn{flex:none;color:var(--danger,#c0392b)}' +
    '.letak-sahkan{margin:6px 0 0;padding-left:1.1rem;text-align:left}.letak-sahkan li{margin:4px 0}' +
    '.letak-h{font-size:.92rem;margin:12px 0 2px}.mbsemak{list-style:none;padding:0;margin:6px 0}.mbsemak li{margin:4px 0}';
  W.document.head.appendChild(st);
  W.MyPolitikLetakUI = { kad: kad };
})(window);
