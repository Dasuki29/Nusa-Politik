/* ==========================================================================
   Nusa Politik — js/jemaah-ui.js   (v12.1; v13.46: pilih TPM, 29 portfolio, calon daripada struktur parti)
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
    var h = meter('Kecekapan', n.kecekapan + '/100', n.kecekapan, 'Penarafan Tadbir Urus awal ' + n.tadbir) +
      meter('Kesetiaan kepada anda', n.kesetiaan + '/100', n.kesetiaan, 'Tekanan Politik setiap bulan ' + (n.tekananBulanan > 0 ? '+' : '') + n.tekananBulanan) +
      meter('Kuota rakan gabungan', n.rakan + '/' + C.KUOTA_RAKAN, n.rakan / C.KUOTA_RAKAN * 100, n.rakan >= C.KUOTA_RAKAN ? 'Kuota dipenuhi' : 'Kurang ' + (C.KUOTA_RAKAN - n.rakan) + ': Hubungan Gabungan -' + (C.KUOTA_RAKAN - n.rakan) * C.PENALTI_RAKAN) +
      meter('Wakil Sabah dan Sarawak', n.borneo + '/' + C.KUOTA_BORNEO, n.borneo / C.KUOTA_BORNEO * 100, n.borneo >= C.KUOTA_BORNEO ? 'Wakil Borneo mencukupi' : 'Hubungan Gabungan -' + C.PENALTI_BORNEO);
    return h;
  }
  /** v13.46: semakan struktur parti (di bawah senarai portfolio). */
  function htmlSemak(p) {
    var n = J.nilai(p, pilih), C = J.CONFIG, h = '<h3 style="margin:4px 0">③ Semakan</h3>', baris = [];
    baris.push(['Timbalan Presiden diberi jawatan', !n.tpm ? '–' : n.tpTPM ? 'TPM ✔' : 'Dilangkau ✖', n.tpTPM]);
    baris.push(['Naib Presiden dalam Kabinet', n.npDalam + ' / ' + n.npJumlah + (n.npDalam >= n.npJumlah ? ' ✔' : ''), n.npDalam >= n.npJumlah]);
    baris.push(['Portfolio lain dipilih', n.bilLain + ' / ' + (J.senaraiPortfolio().length - C.UTAMA.length) + ' (selebihnya automatik)', true]);
    h += '<ul class="jm-semak">' + baris.map(function (b) { return '<li><span>' + esc(b[0]) + '</span><b class="' + (b[2] ? 'jm-ok' : 'jm-amaran') + '">' + esc(b[1]) + '</b></li>'; }).join('') + '</ul>';
    if (n.tertinggal.length) { h += '<p class="note jm-amaran">Pemimpin parti tiada jawatan: ' + esc(n.tertinggal.join(', ')) + ' (Kesetiaan -' + C.PEMIMPIN_TERTINGGAL + ' setiap seorang).</p>'; }
    if (n.pencabarTiada.length) { h += '<p class="note">Pencabar belum dilantik: ' + esc(n.pencabarTiada.join(', ')) + '. Melantik pencabar melemahkan mereka (-15%).</p>'; }
    if (n.duplikat.length) { h += '<p class="note jm-amaran">⚠️ Seorang hanya boleh memegang satu jawatan: ' + esc(n.duplikat.join(', ')) + '.</p>'; }
    return h;
  }
  function labelCalon(c) { return (c.jenis === 'anda' ? c.jawatan + ': ' : '') + c.nama + ' · K' + c.kecekapan + ' · S' + c.kesetiaan + (c.pencabar ? ' · Pencabar' : ''); }
  function pilihan(k, nilaiKini, auto) {
    var kump = [['anda', k.parti], ['rakan', k.rakan], ['borneo', k.borneo]];
    return '<option value="">' + (auto ? 'Automatik' : '— Pilih —') + '</option>' + kump.map(function (g) {
      return '<optgroup label="' + esc(J.JENIS_LABEL[g[0]]) + '">' + g[1].map(function (c) { return '<option value="' + esc(c.id) + '"' + (nilaiKini === c.id ? ' selected' : '') + '>' + esc(labelCalon(c)) + '</option>'; }).join('') + '</optgroup>';
    }).join('');
  }
  function notaTPM(c, n) {
    var C = J.CONFIG;
    if (c.kat === 'tp') { return 'Tradisi: Timbalan Presiden menjadi TPM. Kesetiaan +' + C.TPM_TRADISI + '.'; }
    if (c.kat === 'ketua_rakan') { return 'Hubungan Gabungan +' + C.TPM_HUB_RAKAN + '. Timbalan Presiden dilangkau: Kesetiaan -' + C.TPM_LANGKAU + ', kuasa pencabar +10%.'; }
    if (c.kat === 'ketua_borneo') { return 'Dikira wakil Borneo; Hubungan Gabungan +' + C.TPM_HUB_BORNEO + '. Timbalan Presiden dilangkau: Kesetiaan -' + C.TPM_LANGKAU + ', kuasa pencabar +10%.'; }
    return 'Timbalan Presiden dilangkau: Kesetiaan -' + C.TPM_LANGKAU + ', kuasa pencabar +10%.';
  }
  function kadBentuk(p) {
    var k = J.kolam(p), C = J.CONFIG, kunci = (p.jemaah && p.jemaah.kunci) + '|' + p.id + '|' + ((p.jemaah && p.jemaah.tahunRombak) || 0);
    if (!pilih || kunciPilih !== kunci || Array.isArray(pilih)) { pilih = { tpm: null, m: {} }; kunciPilih = kunci; }
    var lain = J.senaraiPortfolio().filter(function (nm) { return C.UTAMA.indexOf(nm) < 0; });
    var h = '<section class="card jm-kad" aria-labelledby="jm-tajuk"><h2 class="card__title" id="jm-tajuk" style="margin:0 0 4px">🏛️ ' + (p.jemaah && p.jemaah.rombak ? 'Rombakan Kabinet' : 'Bentuk Jemaah Menteri') + '</h2>' +
      '<p class="note">Pilih Timbalan Perdana Menteri dan menteri bagi ' + C.UTAMA.length + ' portfolio utama. ' + lain.length + ' portfolio lain pilihan (dibiar = automatik). Calon parti anda ialah pemimpin dalam struktur parti; seorang satu jawatan. Nama ialah watak rekaan.</p><div class="jm-grid"><div>';
    h += '<fieldset class="jm-slot"><legend>① Timbalan Perdana Menteri</legend>' + J.calonTPM(p, k).map(function (c) {
      return '<label class="jm-calon"><input type="radio" name="jm-tpm" value="' + esc(c.id) + '" data-jm-tpm' + (pilih.tpm === c.id ? ' checked' : '') + '>' +
        '<span><b>' + esc(c.nama) + '</b> ' + tag(c.jenis) + '<small>' + esc(c.jawatan) + ' · Kecekapan ' + c.kecekapan + ' · Kesetiaan ' + c.kesetiaan + '</small><small>' + esc(notaTPM(c)) + '</small></span></label>';
    }).join('') + '</fieldset>';
    h += '<fieldset class="jm-slot"><legend>② Portfolio utama (' + C.UTAMA.length + ' · wajib)</legend>' + C.UTAMA.map(function (nm) {
      return '<label class="jm-port"><span>' + esc(nm) + '</span><select data-jm-port="' + esc(nm) + '">' + pilihan(k, pilih.m[nm], false) + '</select></label>';
    }).join('') + '</fieldset>';
    h += '<details class="jm-slot jm-lain"><summary>Portfolio lain (' + lain.length + ' · pilihan)</summary>' + lain.map(function (nm) {
      return '<label class="jm-port"><span>' + esc(nm) + '</span><select data-jm-port="' + esc(nm) + '">' + pilihan(k, pilih.m[nm], true) + '</select></label>';
    }).join('') + '</details>';
    h += '<div data-jm-semak>' + htmlSemak(p) + '</div></div><div class="jm-imbangan" data-jm-meter>' + htmlMeter(p) + '</div></div>' +
      '<button type="button" class="btn btn--primary btn--block" data-jm="umum">📜 Umumkan Jemaah Menteri</button></section>';
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
        var m = r.anda ? '<b>Anda</b>' : esc(r.menteri) + ' ' + tag(r.jenis) + (r.jawatanParti ? '<small class="jm-jp">' + esc(r.jawatanParti) + '</small>' : ''), t = r.timbalan === undefined ? '–' : (r.andaT ? '<b>Anda</b>' : esc(r.timbalan) + ' ' + tag(r.jenisT));
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
    var t = ev.target; if (!t || !t.hasAttribute || !pilih || Array.isArray(pilih)) { return; }
    if (t.hasAttribute('data-jm-tpm')) { pilih.tpm = t.value; }
    else if (t.hasAttribute('data-jm-port')) { var nm = t.getAttribute('data-jm-port'); if (t.value) { pilih.m[nm] = t.value; } else { delete pilih.m[nm]; } }
    else { return; }
    var p = S.loadPlayer(), box = W.document.querySelector('[data-jm-meter]'), sm = W.document.querySelector('[data-jm-semak]');
    if (box) { box.innerHTML = htmlMeter(p); } if (sm) { sm.innerHTML = htmlSemak(p); }
  });
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-jm]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-jm'), r = a === 'umum' ? J.umumkan(pilih || {}) : a === 'rombak' ? J.rombak() : null;
    if (!r) { return; }
    if (r.ok && a === 'umum') { pilih = null; }
    if (UI().toast) { UI().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (UI().render) { UI().render(); }
  });

  W.MyPolitikJemaahUI = { kad: kad };
})(window);
