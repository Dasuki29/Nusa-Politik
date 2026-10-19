/* ==========================================================================
   Nusa Politik — js/integriti-ui.js   (v7.58)
   UI Integriti & Disiplin Parti (js/integriti.js): kad meter (Integriti Parti, Kepatuhan Whip, Risiko Tadbir Urus),
   modal Arahan Whip, Amaran Lembaga Disiplin dan Audit Ketelusan SPRM.
   Bergantung pada W.NusaUI (modal, toast, render, esc) daripada js/app.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var IG = W.MyPolitikIntegriti, S = W.MyPolitikSave;
  if (!IG || !S) { return; }
  var sibuk = false;

  function U() { return W.NusaUI; }
  function esc(s) { return U() ? U().esc(s) : String(s); }
  function toast(t, j) { if (U()) { U().toast(t, j); } }
  function segarkan() { if (U()) { U().render(); } }
  function modal(o) { return U().modal(o); }

  function bar(label, nilai, bahaya, teks) {
    nilai = Math.max(0, Math.min(100, Math.round(nilai)));
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + esc(teks || (nilai + '%')) + '</b></div>' +
      '<div class="progress progress--sm' + (bahaya ? ' progress--danger' : '') + '" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + nilai + '"><div class="progress__bar" style="width:' + nilai + '%"></div></div></div>';
  }
  function opsi(id, tajuk, kecil, boleh) {
    return '<li><button type="button" class="acara__opsi' + (boleh ? '' : ' is-off') + '" data-pilih="' + esc(id) + '"' + (boleh ? '' : ' disabled') + '><b>' + esc(tajuk) + '</b><small>' + esc(kecil) + '</small></button></li>';
  }

  /** Kad di tab Tindakan. */
  function kad(p) {
    try {
      var r = IG.ringkasan(p);
      if (!r.aktif && !r.bebas) { return ''; }
      var h = '<section class="card"><h2 class="card__title" style="margin:0 0 4px">⚖️ Integriti &amp; Disiplin Parti' + (r.bebas ? ' · Ahli Politik Bebas' : '') + '</h2>';
      h += bar('Integriti Parti', r.skor, r.skor < 30) + bar('Kepatuhan Whip', r.whip, r.whip < 30);
      if (r.tunjukRisiko) { h += bar('Risiko Tadbir Urus (SPRM)', r.risiko, r.risiko >= IG.CONFIG.RISIKO_AUDIT, r.risiko + '% · ' + r.labelRisiko); }
      var btn = '';
      if (r.amaran) { btn += '<button type="button" class="btn btn--danger btn--block" data-integriti="amaran">⚠️ Amaran Lembaga Disiplin: Jawab</button>'; }
      if (r.whipAcara) { btn += '<button type="button" class="btn btn--primary btn--block" data-integriti="whip">📣 Arahan Parti (Whip): ' + esc(r.whipAcara.tajuk) + '</button>'; }
      if (r.audit) { btn += '<button type="button" class="btn btn--danger btn--block" data-integriti="audit">🔎 Audit Ketelusan SPRM: Jawab</button>'; }
      h += btn + '<p class="note" style="font-size:.78rem">' + (r.tunjukRisiko ? 'Risiko ' + IG.CONFIG.RISIKO_AUDIT + '% ke atas boleh mencetuskan Audit Ketelusan SPRM. ' : '') + 'Simulasi permainan.</p></section>';
      return h;
    } catch (e) { return ''; }
  }

  /* ---------- Modal ---------- */
  async function amaran() {
    var s = IG.amaranSemasa(S.loadPlayer()); if (!s) { return; }
    var id = await modal({ tajuk: '⚠️ Amaran Lembaga Disiplin', isi: '<p>' + esc(s.perkara) + '. Lembaga Disiplin Parti mengeluarkan <b>amaran rasmi</b>.</p><ul class="acara__pil">' + s.pilihan.map(function (c) { return opsi(c.id, c.nama, c.huraian, true); }).join('') + '</ul>', butang: [] });
    if (!id) { toast('Amaran masih menunggu jawapan anda.'); return; }
    var r = IG.jawabAmaran(id);
    if (!r.ok) { toast(r.ralat, 'ralat'); return; }
    if (r.hukuman) { await modal({ tajuk: r.hukuman === 'dipecat' ? '🚫 Dipecat Parti' : '⛔ Keahlian Digantung', isi: '<p>' + esc(r.mesej) + '</p>' + (r.hukumanMesej ? '<p style="font-size:.85rem">' + esc(r.hukumanMesej) + '</p>' : '') }); }
    else { toast(r.mesej, id === 'patuh' ? 'ok' : 'ralat'); }
    segarkan();
  }
  async function whip() {
    var s = IG.whipSemasa(S.loadPlayer()); if (!s) { return; }
    var id = await modal({ tajuk: '📣 Arahan Parti (Whip)', isi: '<p>' + esc(s.huraian) + '</p><ul class="acara__pil">' + s.pilihan.map(function (c) { return opsi(c.id, c.nama, c.huraian, true); }).join('') + '</ul>', butang: [] });
    if (!id) { toast('Arahan parti masih menunggu respons anda.'); return; }
    var r = IG.jawabWhip(id);
    if (!r.ok) { toast(r.ralat, 'ralat'); return; }
    toast(r.mesej, r.amaran ? 'ralat' : 'ok'); segarkan();
    if (r.amaran) { await amaran(); }
  }
  async function audit() {
    var s = IG.auditSemasa(S.loadPlayer()); if (!s) { return; }
    var id = await modal({ tajuk: '🔎 Audit Ketelusan SPRM', isi: '<p>Risiko tadbir urus anda mencecah <b>' + s.risiko + '%</b>. SPRM membuka audit ke atas projek di bawah <b>' + esc(s.portfolio || 'jawatan anda') + '</b>.</p><ul class="acara__pil">' + s.pilihan.map(function (c) { return opsi(c.id, c.nama, c.huraian + (c.boleh ? '' : ' (' + c.sebab + ')'), c.boleh); }).join('') + '</ul>', butang: [] });
    if (!id) { toast('Audit SPRM masih menunggu keputusan anda.'); return; }
    var r = IG.jawabAudit(id);
    toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); segarkan();
  }

  async function selepasBulan(peristiwa) {
    var s = peristiwa || [];
    if (sibuk) { return false; }
    sibuk = true;
    try {
      if (s.some(function (e) { return e.jenis === 'integriti_audit'; })) { await audit(); return true; }
      if (s.some(function (e) { return e.jenis === 'integriti_whip'; })) { await whip(); return true; }
    } finally { sibuk = false; }
    return false;
  }

  W.document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-integriti]') : null;
    if (!t || t.disabled) { return; }
    var a = t.getAttribute('data-integriti');
    if (a === 'whip') { whip(); } else if (a === 'amaran') { amaran(); } else if (a === 'audit') { audit(); }
  });

  W.NusaIntegriti_UI = { kad: kad, selepasBulan: selepasBulan, whip: whip, amaran: amaran, audit: audit };
})(window);
