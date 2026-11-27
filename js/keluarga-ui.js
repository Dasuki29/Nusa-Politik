/* ==========================================================================
   Nusa Politik — js/keluarga-ui.js   (v14.18, Dinasti Politik)
   Kad 👪 Keluarga dan 🌳 Pokok Dinasti (tab Profil), serta bahagian 🏛️ Teruskan Dinasti pada skrin Legasi.
   ========================================================================== */
(function (W) {
  'use strict';
  var K = W.MyPolitikKeluarga, S = W.MyPolitikSave;
  if (!K) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function UI() { return W.NusaUI || {}; }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('en'); }
  function btn(id, teks, boleh, kelas) { return '<button type="button" class="btn btn--sm' + (kelas ? ' ' + kelas : '') + '" data-kl="' + esc(id) + '"' + (boleh === false ? ' disabled' : '') + '>' + esc(teks) + '</button>'; }
  function lapor(r) { if (r && UI().toast) { UI().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); } if (UI().render) { UI().render(); } }
  function bar(n) { return '<div class="prkl-bar tyt-bar" style="height:10px;max-width:260px"><i style="width:' + n + '%"></i></div>'; }
  function nm(s) { return '<span data-i18n-skip>' + esc(s) + '</span>'; }   // nama tidak diterjemah
  function lat() { return !!(W.MyPolitikLatihan && W.MyPolitikLatihan.aktif && W.MyPolitikLatihan.aktif()); }
  var C = K.CONFIG;

  /** Kad 👪 Keluarga. */
  function kad(p) {
    try {
      if (!p || p.tamat || lat()) { return ''; }
      var k = K.keadaan(p), h = '<section class="card kl-kad"><h2 class="card__title" style="margin:0 0 4px">👪 Keluarga</h2>';
      if (k.dinasti && k.anakTokoh) { h += '<p class="note">⭐ Anak Tokoh hingga ' + k.dinasti.anakTokohHingga + ': kekuatan pemilihan cawangan dan bahagian +' + C.WARIS.tokohBonus + ', risiko tuduhan nepotisme.</p>'; }
      if (k.pasangan) {
        h += '<div class="prkl-act"><div><b>💍 Pasangan</b><small>' + nm(k.pasangan.nama) + '</small><small>' + k.umurPasangan + ' tahun · berkahwin ' + k.pasangan.tahun + '</small></div><span class="badge-office">Berkahwin</span></div>';
      } else {
        var s = k.kahwin;
        h += '<div class="prkl-act"><div><b>💍 Bujang</b><small>Berkahwin: umur ' + C.KAHWIN.umurMin + ' hingga ' + C.KAHWIN.umurMaks + ', ' + C.KAHWIN.ap + ' AP, ' + rm(C.KAHWIN.myr) + ', Reputasi +' + C.KAHWIN.reputasi + '. Selepas berkahwin, peluang dapat anak setiap tahun (maksimum ' + C.ANAK.maks + ').</small>' + (s.boleh ? '' : '<small>⚠️ ' + esc(s.sebab) + '</small>') + '</div>' + btn('kahwin', '💍 Berkahwin', s.boleh, 'btn--gold') + '</div>';
      }
      if (k.anak.length) {
        h += '<h3 style="margin:10px 0 2px;font-size:.95rem">Anak (' + k.anak.length + ')</h3>';
        k.anak.forEach(function (a) {
          var info = a.umur + ' tahun' + (a.sayap ? ' · ' + esc(a.jawatan) + ' · ' + esc(a.label) : (a.umur >= C.DAFTAR.umur ? ' · belum masuk parti' : '')) + ' · Minat politik ' + a.minat;
          var b = (a.umur >= C.BIMBING.umurMin ? btn('bimbing:' + a.id, 'Bimbing', a.bimbing) : '') + (!a.sayap && a.bolehDaftarUmur ? ' ' + btn('daftar:' + a.id, 'Daftar parti', a.daftar, 'btn--gold') : '');
          h += '<div class="prkl-act"><div style="flex:1"><b>' + (a.j === 'L' ? '👦 ' : '👧 ') + nm(a.nama) + '</b><small>' + info + '</small>' + bar(a.minat) + '</div><div class="pbg-3" style="margin:0">' + b + '</div></div>';
        });
        h += '<small class="note">🎓 Bimbing (' + C.BIMBING.ap + ' AP, sekali sebulan, umur ' + C.BIMBING.umurMin + '+): Minat politik +' + C.BIMBING.minat + '. 🎽 Daftar parti (umur ' + C.DAFTAR.umur + '+, Minat ' + C.DAFTAR.minat + '+): anak menyertai sayap dan naik jawatan sendiri setiap Januari. ⚠️ Anak naik jawatan ketika anda memegang jawatan Pusat: risiko tuduhan nepotisme (Reputasi ' + C.NAIK.reputasi + ').</small>';
      } else if (k.pasangan) { h += '<p class="note">Belum ada anak. Peluang dapat anak setiap Januari.</p>'; }
      if (k.adik.length) { h += '<p class="note"><span>Adik-beradik:</span> ' + nm(k.adik.join(', ')) + '</p>'; }
      return h + '</section>';
    } catch (e) { return ''; }
  }

  /** Kad 🌳 Pokok Dinasti (hanya selepas generasi kedua bermula). */
  function pokok(p) {
    try {
      var dn = p && p.dinasti; if (!dn || !dn.generasi || !dn.generasi.length) { return ''; }
      var k = K.keadaan(p), n = dn.generasi.length + 1;
      var h = '<section class="card kl-pokok"><h2 class="card__title" style="margin:0 0 4px">🌳 Pokok Dinasti</h2><p class="note">' + esc(dn.nama) + ' · ' + esc(p.parti || '') + ' · ' + n + ' generasi · Skor Dinasti ' + k.skor + '</p><div class="kl-tree">';
      dn.generasi.forEach(function (g) {
        h += '<div class="kl-gen"><b><span>Generasi ' + g.gen + ':</span> ' + nm(g.nama) + '</b><small>' + g.dari + '–' + g.hingga + ' · Jawatan tertinggi: ' + esc(g.jawatan) + (g.kerajaan ? ', ' + esc(g.kerajaan) : '') + ' · ' + g.menang + ' kali menang pilihan raya · ' + esc(g.sebab) + ' · Skor ' + g.skor + '</small></div>';
      });
      h += '<div class="kl-gen is-on"><b><span>Generasi ' + n + ':</span> ' + nm(p.nama) + '</b> <span class="badge-office">Anda</span><small>' + (dn.tahunMula || p.tahun) + ' · ' + esc(p.jawatan || 'Ahli Biasa') + (k.anakTokoh ? ' · ⭐ Anak Tokoh' : '') + '</small></div>';
      return h + '</div></section>';
    } catch (e) { return ''; }
  }

  var pilihan = 0;
  /** Bahagian 🏛️ Teruskan Dinasti pada skrin Legasi. */
  function legasi(p) {
    try {
      if (!p || !p.tamat || lat()) { return ''; }
      var c = K.calonWaris(p); if (!c.length) { return ''; }
      if (pilihan >= c.length) { pilihan = 0; }
      var h = '<h2 class="legasi__sub">🏛️ Teruskan Dinasti</h2><p class="note">Pilih waris untuk meneruskan perjuangan keluarga.' + (c[0].jana ? ' Tiada anak berumur ' + C.WARIS.umur + ' tahun ke atas dalam rekod: dua calon waris dijana.' : '') + '</p><div class="kl-waris">';
      c.forEach(function (w, i) {
        var info = 'Minat ' + w.minat + ' · ' + (w.jawatan ? 'jawatan sayap dikekalkan (' + esc(w.jawatan) + ')' : w.sayap ? 'bermula sebagai ahli' : 'belum masuk parti: bermula sebagai ahli biasa') + ' · ⭐ Anak Tokoh';
        h += '<label class="sl-pil' + (i === pilihan ? ' is-on' : '') + '" data-kl="waris:' + i + '" style="display:block;cursor:pointer"><b>' + (w.j === 'L' ? '👦 ' : '👧 ') + nm(w.nama) + '</b> <span class="badge-office">umur ' + w.umur + '</span>' + (w.hubungan !== 'anak' ? ' <span class="badge-office">Anak saudara</span>' : '') + '<small>' + info + '</small></label>';
      });
      var W0 = C.WARIS, rep = Math.round(W0.reputasiAsas + W0.reputasiKadar * (Number(p.reputasi) || 0)), dana = 1000 + Math.round(W0.danaKadar * Math.max(0, Number(p.myr) || 0));
      h += '</div><div class="legasi__jadual"><div class="kv"><span>Parti dan bahagian</span><b>' + esc(p.parti || '') + ' · ' + esc(p.bahagian || '') + '</b></div><div class="kv"><span>Reputasi</span><b>' + rep + '% (' + W0.reputasiAsas + ' + ' + Math.round(W0.reputasiKadar * 100) + '%)</b></div><div class="kv"><span>Dana peribadi (pusaka ' + Math.round(W0.danaKadar * 100) + '%)</span><b>' + rm(dana) + '</b></div><div class="kv"><span>Jawatan</span><b>Hanya jawatan sayap waris sendiri</b></div><div class="kv"><span>⭐ Anak Tokoh (' + W0.tokohTahun + ' tahun)</span><b>Pemilihan cawangan dan bahagian +' + W0.tokohBonus + '; risiko tuduhan nepotisme</b></div></div>';
      h += '<div class="legasi__butang">' + '<button type="button" class="btn btn--sm btn--gold" data-kl="teruskan"><span>🏛️ Teruskan sebagai</span> ' + nm(c[pilihan].nama) + '</button>' + '</div>';
      return '<div class="kl-legasi">' + h + '</div>';
    } catch (e) { return ''; }
  }
  function pasangLegasi(l, p) {
    var html = legasi(p); if (!html || !l) { return; }
    var lama = l.querySelector('.kl-legasi'); if (lama) { lama.outerHTML = html; return; }
    var b = l.querySelector('.legasi__butang'); if (b) { b.insertAdjacentHTML('beforebegin', html); } else { l.insertAdjacentHTML('beforeend', html); }
  }

  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-kl]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-kl');
    if (a === 'kahwin') { lapor(K.kahwin()); return; }
    if (a.indexOf('bimbing:') === 0) { lapor(K.bimbing(a.slice(8))); return; }
    if (a.indexOf('daftar:') === 0) { lapor(K.daftar(a.slice(7))); return; }
    if (a.indexOf('waris:') === 0) { pilihan = parseInt(a.slice(6), 10) || 0; pasangLegasi(W.document.getElementById('legasi'), S.loadPlayer()); return; }
    if (a === 'teruskan') {
      var r = K.teruskan(pilihan);
      if (!r.ok) { if (UI().toast) { UI().toast(r.ralat, 'ralat'); } return; }
      try { if (W.MyPolitikEvents && W.MyPolitikEvents.reset) { W.MyPolitikEvents.reset(); } W.sessionStorage.setItem('nusa_dinasti_mesej', r.mesej); } catch (e) { /* abaikan */ }
      W.location.reload();
    }
  });
  /** Mesej selepas muat semula (waris baharu). */
  try { var m = W.sessionStorage.getItem('nusa_dinasti_mesej'); if (m) { W.sessionStorage.removeItem('nusa_dinasti_mesej'); W.setTimeout(function () { if (UI().toast) { UI().toast(m, 'ok'); } }, 600); } } catch (e) { /* abaikan */ }

  W.MyPolitikKeluargaUI = { kad: kad, pokok: pokok, legasi: legasi, pasangLegasi: pasangLegasi };
})(window);
