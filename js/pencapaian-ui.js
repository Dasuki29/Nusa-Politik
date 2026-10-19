/* ==========================================================================
   Nusa Politik — js/pencapaian-ui.js   (v8.6)
   Tab "Pencapaian": senarai trofi, kemajuan dan toast apabila trofi dibuka.
   Bergantung pada js/pencapaian.js, js/save.js dan W.NusaUI (toast, render, esc) daripada js/app.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var PC = W.MyPolitikPencapaian, S = W.MyPolitikSave;
  if (!PC || !S) { return; }
  var sedangProses = false;

  function U() { return W.NusaUI; }
  function esc(s) { return U() ? U().esc(s) : String(s); }

  function pasangGaya() {
    if (!W.document || W.document.getElementById('pc-gaya')) { return; }
    var g = W.document.createElement('style');
    g.id = 'pc-gaya';
    g.textContent =
      '.pc-sum{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}' +
      '.pc-bar{height:6px;background:var(--bg-elev-3,#262A34);border-radius:9px;overflow:hidden;margin-top:6px;width:160px;max-width:100%}.pc-bar i{display:block;height:100%;background:var(--gold,#F2B705)}' +
      '.pc-kad{display:flex;gap:12px;padding:12px 14px;margin-top:10px;border:1px solid var(--border,#2E333F);border-radius:12px;background:var(--bg-elev-1,#16181E)}' +
      '.pc-kad.is-buka{border-color:var(--gold,#F2B705)}.pc-kad.is-kunci{opacity:.7}' +
      '.pc-ikon{flex:none;width:44px;height:44px;display:grid;place-items:center;font-size:1.7rem;border-radius:10px;background:var(--bg-elev-3,#262A34)}' +
      '.pc-kad.is-kunci .pc-ikon{filter:grayscale(1)}.pc-kad.is-buka .pc-ikon{background:rgba(242,183,5,.15)}' +
      '.pc-kad b{display:block}.pc-kad small{display:block;color:var(--text-muted,#A3A9B8)}' +
      '.pc-tarikh{color:var(--gold,#F2B705);font-size:.78rem}.pc-baru{background:var(--gold,#F2B705);color:#111;border-radius:999px;font-size:.7rem;font-weight:700;padding:0 6px;margin-left:6px}';
    W.document.head.appendChild(g);
  }

  /** Kandungan panel tab Pencapaian. */
  function panel(p) {
    var st = PC.muat(), n = PC.SENARAI.length, dibuka = PC.SENARAI.filter(function (d) { return st.dibuka[d.id]; }).length;
    var h = '<section class="card"><div class="pc-sum"><div><h2 class="card__title" style="margin:0">🏆 Pencapaian</h2><b>' + dibuka + ' / ' + n + ' dibuka</b>' +
      '<div class="pc-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="' + dibuka + '"><i style="width:' + Math.round(100 * dibuka / n) + '%"></i></div></div>' +
      '<small class="note">Simulasi: tidak mewakili UMNO sebenar.</small></div>';
    PC.SENARAI.forEach(function (d) {
      var o = st.dibuka[d.id], kem = o ? '' : PC.kemajuan(p, st, d.id);
      h += '<div class="pc-kad ' + (o ? 'is-buka' : 'is-kunci') + '"><div class="pc-ikon" aria-hidden="true">' + (o ? d.ikon : '🔒') + '</div><div><b>' + esc(d.nama) + (o && !st.dilihat[d.id] ? '<span class="pc-baru">Baharu</span>' : '') + '</b>' +
        '<small>' + esc(d.huraian) + '</small>' +
        (o ? '<span class="pc-tarikh">Dibuka · ' + esc(o.bulan + '/' + o.tahun) + '</span>' : (kem ? '<small>Kemajuan: ' + esc(kem) + '</small>' : '')) + '</div></div>';
    });
    return h + '</section>';
  }

  function nama(id) { var d = PC.SENARAI.filter(function (x) { return x.id === id; })[0]; return d ? d.nama : id; }

  function bendera(profil, meta) {
    if (sedangProses) { return; }
    sedangProses = true;
    try {
      var baru = PC.proses(meta);
      if (baru.length && U()) {
        baru.forEach(function (id) { U().toast('Pencapaian Dibuka: ' + nama(id) + '!', 'ok'); });
        (W.setTimeout || setTimeout)(function () { U().render(); }, 0);
      }
    } catch (e) { /* pencapaian tidak kritikal: jangan ganggu permainan */ }
    sedangProses = false;
  }

  pasangGaya();
  S.subscribe(bendera);
  W.NusaPencapaian_UI = { panel: panel, bilBaru: function () { return PC.bilBaru(); }, tandaDilihat: PC.tandaDilihat };
})(window);
