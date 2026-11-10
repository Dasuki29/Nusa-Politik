/* ==========================================================================
   Nusa Politik — js/tyt-ui.js   (v13.52)
   Kad "👑 Laluan Yang di-Pertua Negeri" (tab Profil) dan tab 🏰 Istana. Logik dalam js/tyt.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var T = W.MyPolitikTYT, S = W.MyPolitikSave;
  if (!T || !S) { return; }
  var pilihK = [];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function UI() { return W.NusaUI || {}; }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('en'); }
  function btn(id, teks, boleh, kelas) { return '<button type="button" class="btn btn--sm' + (kelas ? ' ' + kelas : '') + '" data-tyt="' + id + '"' + (boleh === false ? ' disabled' : '') + '>' + esc(teks) + '</button>'; }
  function act(tajuk, info, b) { return '<div class="prkl-act"><div><b>' + tajuk + '</b><small>' + esc(info) + '</small></div>' + b + '</div>'; }
  function meter(label, n) { return '<div class="jm-meter__t"><span>' + esc(label) + '</span><b>' + n + '/100</b></div><div class="prkl-bar tyt-bar"><i style="width:' + n + '%"></i></div>'; }

  /** Kad tab Profil: tawaran atau syarat laluan TYT (hanya bekas Premier / Ketua Menteri). */
  function kad(p) {
    try {
      var k = T.keadaan(p); if (k.aktif) { return ''; }
      if (!k.tawaran && !k.laluan.length) { return ''; }
      var h = '<section class="card tyt-kad"><h2 class="card__title" style="margin:0 0 4px">👑 Laluan Yang di-Pertua Negeri</h2>';
      if (k.tawaran) {
        h += '<div class="tyt-ev"><b>📜 Tawaran Istana Negara</b><small>Atas nasihat Perdana Menteri dan selepas berunding dengan ketua kerajaan negeri, Yang di-Pertuan Agong berkenan melantik anda sebagai Yang di-Pertua Negeri ' + esc(k.tawaran.negeri.nama) + '.</small>' +
          '<small>Terima: semua jawatan parti dan kerusi dilepaskan (PRK calon parti), keahlian parti digantung, gelaran Tun. Kerjaya tamat selepas penggal terakhir.</small>' +
          '<div class="pbg-3" style="justify-content:flex-start;margin-top:6px">' + btn('terima', '👑 Terima', true, 'btn--primary') + btn('tolak', 'Tolak', true) + '</div></div>';
      }
      k.laluan.forEach(function (s) {
        h += '<h3 style="margin:8px 0 4px">' + esc(s.nama) + '</h3><ul class="tyt-sy">' + s.item.map(function (x) { return '<li class="' + (x.ok ? 'jm-ok' : 'jm-amaran') + '">' + (x.ok ? '✔ ' : '✖ ') + esc(x.teks) + '</li>'; }).join('') + '</ul>' +
          '<small class="note">Kekosongan seterusnya: Januari ' + s.kosong + (s.ditolak ? ' (sudah ditolak / diisi; tunggu ' + (s.kosong + 4) + ')' : '') + ' · peluang tawaran ± ' + Math.round(k.peluang * 100) + '%</small>';
      });
      return h + '</section>';
    } catch (e) { return ''; }
  }
  /** Tab Istana. */
  function panel(p) {
    try {
      var k = T.keadaan(p); if (!k.aktif) { return '<div class="banner"><strong>Istana</strong>Tab ini terbuka apabila anda menjadi Yang di-Pertua Negeri.</div>'; }
      var a = k.a, n = k.negeri, C = T.CONFIG, h = '<section class="card tyt-istana">';
      h += '<div class="tyt-ban"><b>🏰 Tuan Yang Terutama Yang di-Pertua Negeri ' + esc(n.nama) + '</b><small>Penggal ' + a.penggal + ' · ' + a.tahunMula + '– · ' + esc(n.ketua) + ': ' + esc(a.ketua) + ' (NPC)</small></div>';
      h += '<div class="jm-meter__t"><span>Elaun bulanan</span><b>' + rm(C.ELAUN) + '</b></div>' + meter('Kewibawaan Istana', a.kewibawaan) + meter('Hubungan dengan ' + n.ketua, a.hubungan);
      h += '<small class="note">Kewibawaan susut 1 sebulan. Tamat penggal: Kewibawaan ' + C.LANJUT + ' ke atas = penggal kedua ditawarkan (sekali sahaja).</small>';
      if (a.lanjut) { h += '<div class="tyt-ev"><b>📜 Tawaran penggal kedua</b><small>Terima untuk berkhidmat empat tahun lagi, atau bersara sekarang.</small><div class="pbg-3" style="justify-content:flex-start;margin-top:6px">' + btn('lanjut:ya', 'Terima penggal kedua', true, 'btn--primary') + btn('lanjut:tidak', 'Bersara', true) + '</div></div>'; }
      if (a.bubar) { h += '<div class="tyt-ev"><b>⚖️ ' + esc(n.ketua) + ' memohon pembubaran DUN</b><small>' + (a.bubar.stabil ? 'Kerajaan negeri masih mempunyai majoriti.' : 'Kerajaan negeri dilaporkan hilang majoriti.') + ' Perkenan: PRN diadakan, Hubungan +5. Tangguh: ' + (a.bubar.stabil ? 'Kewibawaan +8, Hubungan −15.' : 'krisis, Kewibawaan −10.') + '</small><div class="pbg-3" style="justify-content:flex-start;margin-top:6px">' + btn('bubar:perkenan', '✅ Perkenan', true) + btn('bubar:tangguh', '✋ Tangguh perkenan', true) + '</div></div>'; }
      h += '<h3 style="margin:10px 0 4px">📋 Tugas Istana</h3>';
      h += act('🤝 ' + esc(n.ketua) + ' menghadap', 'Bulanan · Sokong dasar: Hubungan +3 · Beri teguran: Kewibawaan +3, Hubungan −2 · Dengar sahaja',
        '<span class="pbg-3">' + btn('hadap:sokong', 'Sokong', k.boleh.hadap) + btn('hadap:tegur', 'Tegur', k.boleh.hadap) + btn('hadap:dengar', 'Dengar', k.boleh.hadap) + '</span>');
      h += act('🎉 Majlis rasmi & lawatan rakyat', C.MAJLIS.ap + ' AP · bulanan · Kewibawaan +' + C.MAJLIS.kewibawaan + ', Reputasi +' + C.MAJLIS.reputasi, btn('majlis', 'Hadir', k.boleh.majlis));
      h += act('👑 Mesyuarat Majlis Raja-Raja', 'Sekali setahun · Kewibawaan +' + C.RAJA.kewibawaan + ' (TYT tidak mengundi pelantikan Agong)', btn('raja', 'Hadir', k.boleh.raja));
      h += '<h3 style="margin:10px 0 4px">🎖️ Kurnia Darjah & Gelaran</h3>';
      if (!k.boleh.kurnia) { h += '<p class="note">Senarai kurnia tahun ini sudah diperkenan.</p>'; }
      else if (!k.calon) { h += '<p class="note">Senarai calon disediakan bulan depan.</p>'; }
      else {
        h += '<p class="note">Pilih ' + C.KURNIA.pilih + ' penerima. Senarai seimbang (3 bidang berbeza): Kewibawaan +' + C.KURNIA.seimbang + '. Dua ahli politik atau lebih: Kewibawaan ' + C.KURNIA.politik + '.</p>';
        h += k.calon.map(function (c) { return '<label class="lp-opt"><input type="checkbox" data-tyt-calon value="' + c.id + '"' + (pilihK.indexOf(c.id) >= 0 ? ' checked' : '') + '><span><b>' + esc(c.nama) + '</b><small>' + esc(c.label) + '</small></span></label>'; }).join('');
        h += btn('kurnia', '🎖️ Perkenan senarai (' + pilihK.length + '/' + C.KURNIA.pilih + ')', pilihK.length === C.KURNIA.pilih, 'btn--primary');
      }
      return h + '</section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('change', function (ev) {
    var t = ev.target; if (!t || !t.hasAttribute || !t.hasAttribute('data-tyt-calon')) { return; }
    var v = t.value; if (t.checked) { if (pilihK.indexOf(v) < 0) { pilihK.push(v); } } else { pilihK = pilihK.filter(function (x) { return x !== v; }); }
    if (UI().render) { UI().render(); }
  });
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-tyt]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-tyt'), r = null;
    if (a === 'terima') { r = T.terima(); if (r.ok && UI().gotoTab) { setTimeout(function () { UI().gotoTab('istana'); }, 50); } }
    else if (a === 'tolak') { r = T.tolak(); }
    else if (a.indexOf('hadap:') === 0) { r = T.menghadap(a.slice(6)); }
    else if (a === 'majlis') { r = T.majlis(); }
    else if (a === 'raja') { r = T.majlisRaja(); }
    else if (a === 'kurnia') { r = T.kurnia(pilihK); if (r.ok) { pilihK = []; } }
    else if (a.indexOf('bubar:') === 0) { r = T.bubar(a.slice(6)); }
    else if (a.indexOf('lanjut:') === 0) { r = T.terimaLanjut(a.slice(7) === 'ya'); }
    if (!r) { return; }
    if (UI().toast) { UI().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (UI().render) { UI().render(); }
  });
  W.MyPolitikTYTUI = { kad: kad, panel: panel };
})(window);
