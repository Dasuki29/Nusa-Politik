/* ==========================================================================
   Nusa Politik — js/media-ui.js   (v7.59)
   UI Jentera Media Digital & Komunikasi Awam (js/media.js): panel 'Penerangan & Media Digital' di tab Tindakan
   (meter Persepsi Negatif, Sokongan Belia, Kesedaran Manifesto; Skuad Penerangan Digital) dan modal Sidang Media 3 soalan.
   Bergantung pada W.NusaUI (modal, toast, render, esc) daripada js/app.js. Menggunakan gaya kad sedia ada (tiada CSS baharu).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikMedia, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  var sibuk = false;

  function U() { return W.NusaUI; }
  function esc(s) { return U() ? U().esc(s) : String(s); }
  function toast(t, j) { if (U()) { U().toast(t, j); } }
  function segarkan() { if (U()) { U().render(); } }
  function modal(o) { return U().modal(o); }
  function rm(n) { return 'RM ' + Number(n).toLocaleString('ms-MY'); }

  function bar(label, nilai, bahaya, teks) {
    nilai = Math.max(0, Math.min(100, Math.round(nilai)));
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + esc(teks || (nilai + '%')) + '</b></div>' +
      '<div class="progress progress--sm' + (bahaya ? ' progress--danger' : '') + '" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + nilai + '"><div class="progress__bar" style="width:' + nilai + '%"></div></div></div>';
  }
  function opsi(id, tajuk, kecil, boleh) {
    return '<li><button type="button" class="acara__opsi' + (boleh ? '' : ' is-off') + '" data-pilih="' + esc(id) + '"' + (boleh ? '' : ' disabled') + '><b>' + esc(tajuk) + '</b><small>' + esc(kecil) + '</small></button></li>';
  }

  /** Panel di tab Tindakan. */
  function kad(p) {
    try {
      var r = M.ringkasan(p);
      if (!r.aktif) { return ''; }
      var h = '<section class="card"><h2 class="card__title" style="margin:0 0 4px">📡 Penerangan &amp; Media Digital</h2>';
      h += bar('Persepsi Negatif', r.persepsi, r.persepsi >= M.CONFIG.PERSEPSI.tinggi) + bar('Sokongan Belia', r.belia, false) + bar('Kesedaran Manifesto', r.kesedaran, false);
      if (r.sidang) { h += '<button type="button" class="btn btn--primary btn--block" data-media="sidang">' + esc(r.sidang.ikon) + ' ' + esc(r.sidang.nama) + ': Hadir (soalan ' + r.sidang.nombor + '/' + r.sidang.jumlah + ')</button>'; }
      h += '<details class="note" style="margin-top:8px"' + (r.sidang ? '' : ' open') + '><summary>Skuad Penerangan Digital</summary><div style="margin-top:6px">';
      r.tugas.forEach(function (t) {
        h += '<div style="margin:8px 0"><b>' + esc(t.ikon) + ' ' + esc(t.nama) + '</b><div class="note" style="font-size:.78rem;margin:2px 0 4px">' + esc(t.huraian) + '</div><div style="display:flex;gap:6px;flex-wrap:wrap">';
        t.peringkat.forEach(function (a) {
          h += '<button type="button" class="btn btn--sm' + (a.boleh ? '' : ' is-off') + '" data-media="skuad" data-tugas="' + esc(t.id) + '" data-aras="' + esc(a.aras) + '"' + (a.boleh ? '' : ' disabled title="' + esc(a.sebab) + '"') + '>' + esc(a.nama) + ' · ' + esc(rm(a.kos)) + '</button>';
        });
        var sebab = t.peringkat.filter(function (a) { return !a.boleh; })[0];
        h += '</div><div class="note" style="font-size:.76rem;margin-top:2px">' + esc(t.peringkat[1].jangka) + (sebab && !t.peringkat[0].boleh && !/Dana/.test(sebab.sebab) ? ' · ' + esc(sebab.sebab) : '') + '</div></div>';
      });
      h += '</div></details><p class="note" style="font-size:.78rem">Kredibiliti kenyataan: ×' + r.kredibiliti + ' (mengikut Integriti Parti). Simulasi permainan.</p></section>';
      return h;
    } catch (e) { return ''; }
  }

  /* ---------- Sidang Media ---------- */
  async function sidang() {
    var guna = 0;
    for (;;) {
      var s = M.sidangSemasa(S.loadPlayer()); if (!s) { return; }
      var q = s.soalan;
      if (W.MyPolitikSFX) { W.MyPolitikSFX.flash(); }                                  // v8.7: denyar kamera pada setiap soalan wartawan
      var id = await modal({ tajuk: s.ikon + ' ' + s.nama + ' (' + s.nombor + '/' + s.jumlah + ')',
        isi: '<p><b>Wartawan:</b> “' + esc(q.soal) + '”</p><p class="note" style="font-size:.8rem">Isu: ' + esc(q.isu) + ' · ' + (q.jenis === 'fakta' ? 'soalan teknikal/dasar' : 'soalan emosi/kontroversi') + '</p><ul class="acara__pil">' + s.pilihan.map(function (c) { return opsi(c.id, c.nama, c.huraian, true); }).join('') + '</ul>', butang: [] });
      if (!id) { toast('Sidang media masih menunggu anda.'); segarkan(); return; }
      var r = M.jawabSidang(id);
      if (!r.ok) { toast(r.ralat, 'ralat'); return; }
      guna += 1;
      if (r.tamat) {
        await modal({ tajuk: '🏁 Sidang Media Tamat: ' + r.ringkasan.gred, isi: '<p>' + esc(r.mesej) + '</p><p>Pendekatan berfakta: ' + r.ringkasan.berfakta + ' · populis: ' + r.ringkasan.populis + ' · serang balas: ' + r.ringkasan.serang + '.</p>' });
        segarkan(); return;
      }
      toast(r.mesej, r.serang ? 'ralat' : 'ok'); segarkan();
    }
  }
  async function skuad(el) {
    var r = M.gerakkanSkuad(el.getAttribute('data-tugas'), el.getAttribute('data-aras'));
    toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); if (r.ok) { segarkan(); }
  }

  async function selepasBulan(peristiwa) {
    if (sibuk) { return false; }
    sibuk = true;
    try {
      if ((peristiwa || []).some(function (e) { return e.jenis === 'media_sidang'; })) { await sidang(); return true; }
    } finally { sibuk = false; }
    return false;
  }

  W.document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-media]') : null;
    if (!t || t.disabled) { return; }
    var a = t.getAttribute('data-media');
    if (a === 'sidang') { sidang(); } else if (a === 'skuad') { skuad(t); }
  });

  W.NusaMedia_UI = { kad: kad, selepasBulan: selepasBulan, sidang: sidang };
})(window);
