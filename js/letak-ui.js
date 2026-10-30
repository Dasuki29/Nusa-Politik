/* ==========================================================================
   Nusa Politik — js/letak-ui.js   (v13.12)
   Kad "🏛️ Wakil Rakyat & Kerajaan" di tab Profil dan skrin pengesahan Letak Jawatan (logik dalam js/letak.js).
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
  function kad(p) {
    try {
      var s = M.senarai(p);
      if (!s.length) { return ''; }
      var st = M.status(p), h = '<section class="card letak-kad"><h2 class="card__title" style="margin:0 0 6px">🏛️ Wakil Rakyat &amp; Kerajaan</h2>';
      h += s.map(function (x) { return baris(x, st.boleh); }).join('');
      h += '<p class="note" style="margin-top:6px">' + (st.boleh ? 'Butang dikunci semasa pilihan raya atau PRK sedang berjalan.' : '🔒 ' + esc(st.sebab) + ' Letak jawatan dikunci buat sementara.') + '</p>';
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
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-letak]') : null; if (!b || b.disabled) { return; }
    sahkan(b.getAttribute('data-letak'));
  });
  var st = W.document.createElement('style');
  st.textContent = '.letak-baris{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--border,rgba(127,127,127,.2))}.letak-baris:first-of-type{border-top:0}' +
    '.letak-ikon{flex:none;font-size:1.2rem}.letak-teks{flex:1;min-width:0;display:flex;flex-direction:column;overflow-wrap:anywhere}.letak-btn{flex:none;color:var(--danger,#c0392b)}' +
    '.letak-sahkan{margin:6px 0 0;padding-left:1.1rem;text-align:left}.letak-sahkan li{margin:4px 0}' +
    '.mbsemak{list-style:none;padding:0;margin:6px 0}.mbsemak li{margin:4px 0}';
  W.document.head.appendChild(st);
  W.MyPolitikLetakUI = { kad: kad };
})(window);
