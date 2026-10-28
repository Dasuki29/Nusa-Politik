/* ==========================================================================
   Nusa Politik — js/jemaah-ui.js   (v12.1)
   Kad "Bentuk Jemaah Menteri" (Perdana Menteri) dan "Jemaah Menteri" (semua pemain dalam kerajaan) di tab Tindakan,
   di bawah kad Kabinet. Logik dalam js/jemaah.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var J = W.MyPolitikJemaah, S = W.MyPolitikSave;
  if (!J || !S) { return; }
  var pilih = null, kunciPilih = null;                    // pilihan sementara (sebelum diumumkan), kekal walaupun panel dilukis semula

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function tag(jenis, pencabar) {
    return '<span class="jm-tag jm-tag--' + jenis + '">' + esc(J.JENIS_LABEL[jenis] || jenis) + '</span>' + (pencabar ? '<span class="jm-tag jm-tag--pencabar">Pencabar</span>' : '');
  }
  function meter(label, nilai, peratus, nota) {
    var w = Math.max(0, Math.min(100, peratus)), warna = w >= 60 ? 'var(--success)' : w >= 40 ? 'var(--warning)' : 'var(--danger)';
    return '<div class="jm-meter"><div class="jm-meter__t"><span>' + esc(label) + '</span><b>' + esc(nilai) + '</b></div><div class="jm-meter__b"><i style="width:' + w + '%;background:' + warna + '"></i></div><small>' + esc(nota) + '</small></div>';
  }
  function htmlMeter(p) {
    var n = J.nilai(p, pilih), C = J.CONFIG;
    return meter('Kecekapan', n.kecekapan + '/100', n.kecekapan, 'Penarafan Tadbir Urus awal ' + n.tadbir) +
      meter('Kesetiaan kepada anda', n.kesetiaan + '/100', n.kesetiaan, 'Tekanan Politik setiap bulan ' + (n.tekananBulanan > 0 ? '+' : '') + n.tekananBulanan) +
      meter('Kuota rakan gabungan', n.rakan + '/' + C.KUOTA_RAKAN, n.rakan / C.KUOTA_RAKAN * 100, n.rakan >= C.KUOTA_RAKAN ? 'Kuota dipenuhi' : 'Kurang ' + (C.KUOTA_RAKAN - n.rakan) + ': Hubungan Gabungan -' + (C.KUOTA_RAKAN - n.rakan) * C.PENALTI_RAKAN) +
      meter('Wakil Sabah dan Sarawak', n.borneo + '/' + C.KUOTA_BORNEO, n.borneo / C.KUOTA_BORNEO * 100, n.borneo >= C.KUOTA_BORNEO ? 'Wakil Borneo mencukupi' : 'Hubungan Gabungan -' + C.PENALTI_BORNEO);
  }
  function kadBentuk(p) {
    var sl = J.calon(p), kunci = (p.jemaah && p.jemaah.kunci) + '|' + p.id + '|' + ((p.jemaah && p.jemaah.tahunRombak) || 0);
    if (!pilih || kunciPilih !== kunci) { pilih = sl.map(function () { return null; }); kunciPilih = kunci; }
    var h = '<section class="card jm-kad" aria-labelledby="jm-tajuk"><h2 class="card__title" id="jm-tajuk" style="margin:0 0 4px">🏛️ ' + (p.jemaah && p.jemaah.rombak ? 'Rombakan Kabinet' : 'Bentuk Jemaah Menteri') + '</h2>' +
      '<p class="note">Pilih menteri bagi ' + sl.length + ' portfolio utama. Portfolio lain diisi automatik mengikut kuota gabungan. Nama ialah watak rekaan.</p><div class="jm-grid"><div>';
    sl.forEach(function (s, i) {
      h += '<fieldset class="jm-slot"><legend>' + esc(s.portfolio) + '</legend>' + s.calon.map(function (c, j) {
        return '<label class="jm-calon"><input type="radio" name="jm-' + i + '" value="' + j + '" data-jm-slot="' + i + '"' + (pilih[i] === j ? ' checked' : '') + '>' +
          '<span><b>' + esc(c.nama) + '</b> ' + tag(c.jenis, c.pencabar) + '<small>Kecekapan ' + c.kecekapan + ' · Kesetiaan ' + c.kesetiaan + (c.pencabar ? ' · melantiknya melemahkan pencabar anda' : '') + '</small></span></label>';
      }).join('') + '</fieldset>';
    });
    h += '</div><div class="jm-imbangan" data-jm-meter>' + htmlMeter(p) + '</div></div>' +
      '<button type="button" class="btn btn--primary btn--block" data-jm="umum">Umumkan Jemaah Menteri</button></section>';
    return h;
  }
  function kadSenarai(p) {
    var l = J.senarai(p); if (!l) { return ''; }
    var h = '<section class="card jm-kad"><h2 class="card__title" style="margin:0 0 4px">🏛️ Jemaah Menteri</h2><p class="note">Anggota kabinet persekutuan penggal ini. Jawatan anda diserlahkan. Nama ialah watak rekaan.</p>';
    if (J.adalahPM(p)) {
      var b = J.bolehRombak(p);
      h += '<button type="button" class="btn btn--sm" data-jm="rombak"' + (b.boleh ? '' : ' disabled') + '>🔄 Rombak kabinet (' + J.CONFIG.ROMBAK_AP + ' AP)</button>' + (b.boleh ? '' : ' <small class="note">' + esc(b.sebab) + '</small>');
    }
    h += '<details class="jm-senarai"' + (J.adalahPM(p) ? '' : ' open') + '><summary>Senarai penuh (' + l.length + ' jawatan)</summary><div class="jm-jadual"><table><thead><tr><th>Portfolio</th><th>Menteri</th><th>Timbalan Menteri</th></tr></thead><tbody>' +
      l.map(function (r) {
        var m = r.anda ? '<b>Anda</b>' : esc(r.menteri) + ' ' + tag(r.jenis), t = r.timbalan === undefined ? '–' : (r.andaT ? '<b>Anda</b>' : esc(r.timbalan) + ' ' + tag(r.jenisT));
        return '<tr' + (r.anda || r.andaT ? ' class="is-anda"' : '') + '><td>' + esc(r.portfolio) + '</td><td>' + m + '</td><td>' + t + '</td></tr>';
      }).join('') + '</tbody></table></div></details></section>';
    return h;
  }
  function kad(p) {
    try {
      if (!p) { return ''; }
      if (J.perluBentuk(p)) { return kadBentuk(p); }
      return kadSenarai(p);
    } catch (e) { return ''; }
  }

  function UI() { return W.NusaUI || {}; }
  W.document.addEventListener('change', function (ev) {
    var t = ev.target; if (!t || !t.hasAttribute || !t.hasAttribute('data-jm-slot') || !pilih) { return; }
    pilih[+t.getAttribute('data-jm-slot')] = +t.value;
    var box = W.document.querySelector('[data-jm-meter]'); if (box) { box.innerHTML = htmlMeter(S.loadPlayer()); }
  });
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-jm]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-jm'), r = a === 'umum' ? J.umumkan(pilih || []) : a === 'rombak' ? J.rombak() : null;
    if (!r) { return; }
    if (r.ok && a === 'umum') { pilih = null; }
    if (UI().toast) { UI().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (UI().render) { UI().render(); }
  });

  W.MyPolitikJemaahUI = { kad: kad };
})(window);
