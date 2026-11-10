/* ==========================================================================
   Nusa Politik — js/warisan-ui.js   (v13.55)
   Kad "⛵ Warisan: Pembangkang Utama Sabah" di tab Profil (logik dalam js/warisan.js; PRN Sabah dalam js/sabah.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikWarisan, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('en'); }
  function UI() { return W.NusaUI || {}; }
  function btn(id, teks, t) { return '<button type="button" class="btn btn--sm" data-war="' + id + '"' + (t && t.boleh === false ? ' disabled' : '') + '>' + esc(teks) + '</button>'; }
  function act(tajuk, info, t, b) { return '<div class="prkl-act"><div><b>' + tajuk + '</b><small>' + esc(info) + '</small>' + (t && !t.boleh && t.sebab ? '<small class="jm-amaran">' + esc(t.sebab) + '</small>' : '') + '</div>' + b + '</div>'; }
  function kad(p) {
    try {
      if (!M.adalah(p)) { return ''; }
      var C = M.CONFIG, k = M.keadaan(p), d = k.dun, kw = k.kawasan, h = '<section class="card war-kad">';
      h += '<div class="war-ban"><img src="assets/images/logo-warisan.png" alt="" width="44" height="44"><div><b>⛵ Warisan: Pembangkang Utama Sabah</b><small>Ketua Pembangkang DUN: Shafie Apdal (NPC) · 37 / 73 untuk majoriti</small></div></div>';
      var seg = [['GRS', d.GRS + d.UPKO, '#1E5AA8'], ['BN', d.BN, '#2D50B8'], ['Warisan', d.Warisan, '#4FB3E8'], ['Lain-lain', d.lain, '#9AA0AA']];
      h += '<div class="grs-dun" role="img" aria-label="DUN Sabah">' + seg.map(function (x) { return '<i style="width:' + (x[1] / 73 * 100).toFixed(1) + '%;background:' + x[2] + '"></i>'; }).join('') + '</div>';
      h += '<small class="note">PRN ' + esc(d.tahun) + ': ' + seg.map(function (x) { return x[0] + ' ' + x[1]; }).join(' · ') + (d.kerajaanWarisan ? ' · Warisan membentuk kerajaan' : '') + '</small>';
      if (kw.parlimen) { h += '<p class="note">Bahagian ' + esc(kw.parlimen.n) + ' · anggaran ' + Number(kw.parlimen.a || 0).toLocaleString('en') + ' ahli dalam ' + kw.parlimen.b + ' Cawangan' + (k.sabah ? '' : ' · Semenanjung: calon Warisan sangat sukar menang (ofset undi ' + C.OFSET.semenanjung + ')') + '.</p>'; }
      h += '<div class="jm-meter__t"><span>Gelombang Warisan</span><b>' + k.gelombang + '/100</b></div><div class="prkl-bar war-bar"><i style="width:' + k.gelombang + '%"></i></div>';
      h += '<small class="note">Setiap ' + C.GELOMBANG.langkah + ' mata melebihi ' + C.GELOMBANG.awal + ' = kerusi Warisan +' + C.GELOMBANG.kerusi + ' dalam PRN Sabah (maks +' + C.GELOMBANG.maks + '). Susut ' + C.GELOMBANG.susut + ' sebulan. Bonus PRN sekarang: +' + k.bonus + ' kerusi.</small>';
      h += '<h3 style="margin:10px 0 4px">📋 Tindakan</h3>';
      h += act('⛵ Jelajah Sabah', C.JELAJAH.ap + ' AP · ' + rm(C.JELAJAH.myr) + ' · sekali sebulan · Gelombang +' + C.JELAJAH.naik + ', sokongan akar umbi +' + C.JELAJAH.akarUmbi, k.jelajah, btn('jelajah', 'Mula', k.jelajah));
      h += act('📢 Serang isu kerajaan GRS', C.SERANG.ap + ' AP · sekali sebulan · isu air, elektrik, jalan · Gelombang +' + C.SERANG.naik + '; gagal (' + Math.round(C.SERANG.gagal * 100) + '%): Reputasi ' + C.SERANG.reputasi, k.serang, btn('serang', 'Serang', k.serang));
      h += act('🤝 Pikat ADUN goyah', C.PIKAT.ap + ' AP · ' + rm(C.PIKAT.myr) + ' · sekali setahun · peluang ' + Math.round(C.PIKAT.peluang * 100) + '%: kerusi Warisan +1 dalam PRN (sekarang +' + k.pikat + ')', k.pikatS, btn('pikat', 'Pikat', k.pikatS));
      h += act('🏛️ Kerajaan baharu', 'Jika Warisan dan separuh kerusi lain mencapai 37 selepas PRN Sabah, Warisan membentuk kerajaan negeri: laluan Ketua Menteri.', null, '');
      h += '<p class="note">Persekutuan: Ahli Parlimen Warisan berada di blok pembangkang (kad pembangkang di tab Dewan). ⚠️ Gelombang, peluang dan kawasan operasi ialah andaian permainan.</p>';
      return h + '</section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-war]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-war'), r = a === 'jelajah' ? M.jelajah() : a === 'serang' ? M.serang() : a === 'pikat' ? M.pikat() : null;
    if (!r) { return; }
    if (UI().toast) { UI().toast(r.ok ? r.mesej : r.ralat, r.ok ? (r.jaya === false ? 'info' : 'ok') : 'ralat'); }
    if (UI().render) { UI().render(); }
  });
  W.MyPolitikWarisanUI = { kad: kad };
})(window);
