/* ==========================================================================
   Nusa Politik — js/tular-ui.js   (v12.9)
   Popup krisis tular + kad "Pertahanan Digital" (tab Tindakan; juga tab Pilihan Raya semasa krisis kempen).
   Logik dalam js/tular.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var T = W.MyPolitikTular, S = W.MyPolitikSave;
  if (!T || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function U() { return W.NusaUI || {}; }
  function meter(label, n, baik) {
    var w = Math.max(0, Math.min(100, n)), warna = baik ? (w >= 60 ? 'var(--success)' : w >= 40 ? 'var(--warning)' : 'var(--danger)') : 'var(--info, #2B6CB0)';
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + w + '%</b></div><div class="progress progress--sm" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + w + '"><div class="progress__bar" style="width:' + w + '%;background:' + warna + '"></div></div></div>';
  }
  function htmlPilihan(k) {
    return '<ul class="acara__pil">' + k.pilihan.map(function (o) {
      return '<li><button type="button" class="acara__opsi" data-tular="' + esc(o.id) + '" data-pilih="' + esc(o.id) + '"' + (o.boleh ? '' : ' disabled') + '><b>' + esc(o.nama) + '</b><small class="acara__kesan">' + esc(o.teks) + '</small>' + (o.boleh ? '' : '<small class="acara__kesan" style="color:var(--danger)">' + esc(o.sebab) + '</small>') + '</button></li>';
    }).join('') + '</ul>';
  }
  function htmlKrisis(k) {
    return '<p class="note" style="margin-top:10px"><b><span aria-hidden="true">' + esc(k.ikon) + '</span> <span>' + esc(k.tajuk) + '</span></b></p><p class="note"><span>Keterukan:</span> <b>' + esc(k.keterukanNama) + '</b>' + (k.konteks === 'kempen' ? ' <span>· semasa kempen</span>' : '') + '</p><p>' + esc(k.huraian) + '</p>' +
      (k.konteks === 'kempen' ? '<p class="note" style="color:var(--danger)">Setiap hari kempen tanpa jawapan, sokongan pengundi terus susut.</p>' : '<p class="note">Jawab sebelum bulan depan. Jika tidak, ia dikira sebagai diam.</p>');
  }
  /** Kad pertahanan digital + krisis aktif. jenis 'pilihanraya': hanya jika krisis kempen aktif. */
  function kad(p, jenis) {
    try {
      var k = T.keadaan(p); if (!k) { return ''; }
      if (jenis === 'pilihanraya' && !(k.krisis && k.krisis.konteks === 'kempen')) { return ''; }
      if (!k.krisis && !k.latih.boleh && /jawatan atau menjadi wakil/.test(k.latih.sebab)) { return ''; }
      var h = '<section class="card tl-kad" aria-labelledby="tl-tajuk"><h2 class="card__title" id="tl-tajuk" style="margin:0 0 4px">' + (k.krisis ? '🚨 Krisis Tular' : '🛡️ Pertahanan Digital') + '</h2>' +
        meter('Pertahanan digital', k.cyberDefenseScore, true) + meter('Persepsi awam positif', k.publicPerception, true) + meter('Sokongan Belia', k.belia, true);
      if (k.krisis) { h += htmlKrisis(k.krisis) + htmlPilihan(k.krisis); }
      else {
        h += '<p class="note">Pertahanan digital mengurangkan peluang dan kesan fitnah tular, dan menaikkan peluang kontra-naratif berjaya. Susut 2 sebulan.</p>' +
          '<button type="button" class="btn btn--sm" data-tular-latih' + (k.latih.boleh ? '' : ' disabled') + '>🛡️ Latih pasukan pertahanan digital (RM ' + T.CONFIG.LATIH.dana.toLocaleString('ms-MY') + ', +' + T.CONFIG.LATIH.pertahanan + ')</button>' +
          (k.latih.boleh ? '' : ' <small class="note">' + esc(k.latih.sebab) + '</small>');
      }
      return h + '</section>';
    } catch (e) { return ''; }
  }
  function jawab(id) {
    var r = T.jawab(id);
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok ? (r.jaya === false || id === 'diam' ? 'ralat' : 'ok') : 'ralat'); }
    if (U().render) { U().render(); }
  }
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-tular],[data-tular-latih]') : null;
    if (!b || b.disabled || b.closest('#modal')) { return; }                 // butang dalam popup diurus oleh modal()
    if (b.hasAttribute('data-tular-latih')) { var r = T.latih(); if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); } if (U().render) { U().render(); } return; }
    jawab(b.getAttribute('data-tular'));
  });

  /* Popup: muncul sekali bagi setiap krisis baharu, apabila tiada modal lain terbuka. */
  var sibuk = false;
  function semakPopup() {
    if (sibuk) { return; }
    var p = S.loadPlayer(), k = p && T.keadaan(p), m = W.document.getElementById('modal');
    if (!k || !k.krisis || k.krisis.dipapar || !U().modal) { return; }
    if (m && m.classList.contains('is-open')) { W.setTimeout(semakPopup, 1500); return; }
    sibuk = true; T.tandaDipapar();
    U().modal({ tajuk: '🚨 Krisis Tular di Media Sosial', isi: htmlKrisis(k.krisis) + htmlPilihan(k.krisis), butang: [{ label: 'Fikir dahulu', nilai: null, kelas: 'btn--ghost' }] })
      .then(function (pil) { sibuk = false; if (pil && pil !== 'true' && pil !== 'null') { jawab(pil); } else if (U().render) { U().render(); } }, function () { sibuk = false; });
  }
  S.subscribe(function () { W.setTimeout(semakPopup, 300); });
  if (W.document.readyState === 'loading') { W.document.addEventListener('DOMContentLoaded', function () { W.setTimeout(semakPopup, 1200); }); } else { W.setTimeout(semakPopup, 1200); }

  W.MyPolitikTularUI = { kad: kad, semakPopup: semakPopup };
})(window);
