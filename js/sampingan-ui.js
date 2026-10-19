/* ==========================================================================
   Nusa Politik — js/sampingan-ui.js   (v7.64)
   UI Aktiviti Sampingan (js/sampingan.js) dan Anugerah & Gelaran Kurniaan (js/gelaran.js) di tab Tindakan.
   Bergantung pada W.NusaUI (toast, render, esc) daripada js/app.js. Menggunakan gaya kad sedia ada (tiada CSS baharu).
   ========================================================================== */
(function (W) {
  'use strict';
  var SM = W.MyPolitikSampingan, GL = W.MyPolitikGelaran, S = W.MyPolitikSave;
  if (!S || (!SM && !GL)) { return; }

  function U() { return W.NusaUI; }
  function esc(s) { return U() ? U().esc(s) : String(s); }
  function toast(t, j) { if (U()) { U().toast(t, j); } }
  function segarkan() { if (U()) { U().render(); } }
  function rm(n) { return 'RM ' + Number(n).toLocaleString('ms-MY'); }
  function bar(label, nilai, bahaya, teks) {
    nilai = Math.max(0, Math.min(100, Math.round(nilai)));
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + esc(teks || (nilai + '%')) + '</b></div>' +
      '<div class="progress progress--sm' + (bahaya ? ' progress--danger' : '') + '" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + nilai + '"><div class="progress__bar" style="width:' + nilai + '%"></div></div></div>';
  }

  function kadSampingan(p) {
    var r = SM.ringkasan(p); if (!r.aktif) { return ''; }
    var h = '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🏢 Aktiviti Sampingan</h2>';
    h += bar('Pendapatan sampingan / bulan', Math.min(100, r.pendapatan / 20), false, rm(r.pendapatan)) + bar('Risiko Konflik Kepentingan', r.konflik, r.konflik >= 60) + bar('Reputasi Komuniti (NGO)', r.komuniti, false);
    h += '<details class="note" style="margin-top:8px"><summary>Pilih satu aktiviti (sekali sebulan, ' + SM.CONFIG.AP + ' AP)</summary><div style="margin-top:6px">';
    r.jenis.forEach(function (j) {
      h += '<div style="margin:8px 0"><b>' + esc(j.ikon) + ' ' + esc(j.nama) + '</b><div class="note" style="font-size:.78rem;margin:2px 0 4px">' + esc(j.huraian) + '</div><div style="display:flex;gap:6px;flex-wrap:wrap">';
      j.peringkat.forEach(function (a) {
        h += '<button type="button" class="btn btn--sm' + (a.boleh ? '' : ' is-off') + '" data-sampingan="labur" data-jenis="' + esc(j.id) + '" data-aras="' + esc(a.aras) + '"' + (a.boleh ? '' : ' disabled title="' + esc(a.sebab) + '"') + '>' + esc(a.nama) + ' · ' + esc(rm(a.modal)) + '</button>';
      });
      h += '</div></div>';
    });
    h += '</div></details>';
    if (r.pelaburan.length) {
      h += '<p class="note" style="font-size:.78rem;margin:4px 0 0">Modal aktif ' + esc(rm(r.modalAktif)) + ' / ' + esc(rm(r.hadModal)) + ' · ' + r.pelaburan.map(function (x) { return (x.jenis === 'ngo' ? 'NGO ' : 'Syarikat ') + rm(x.modal) + (x.baki ? ' (' + x.baki + ' bulan lagi)' : ' (aktif)'); }).join(', ') + '</p>';
    }
    return h + '<p class="note" style="font-size:.78rem">Pulangan bermula selepas ' + SM.CONFIG.MATANG + ' bulan. Had modal ' + esc(rm(r.hadModal)) + '. Konflik kepentingan lebih berisiko jika memegang jawatan kerajaan. Simulasi permainan.</p></section>';
  }
  function kadGelaran(p) {
    var r = GL.ringkasan(p); if (p.tamat) { return ''; }
    var h = '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🏅 Anugerah &amp; Gelaran Kebesaran</h2><p class="note" style="font-size:.8rem">Gelaran fiksyen permainan, diberi atas prestasi (tidak boleh dibeli).</p><ul style="list-style:none;padding:0;margin:6px 0">';
    r.anugerah.forEach(function (a) {
      h += '<li' + (a.diperoleh ? '' : ' style="opacity:.55"') + '>' + esc(a.ikon) + ' <b>' + esc(a.nama) + '</b> · ' + (a.diperoleh ? 'diperoleh' : 'perlu: ' + esc(a.syarat)) + '</li>';
    });
    h += '</ul><h3 style="margin:10px 0 4px;font-size:.9rem">🎖️ Gelaran Kurniaan</h3><ul style="list-style:none;padding:0;margin:6px 0">';
    h += '<li' + (r.dato ? '' : ' style="opacity:.55"') + '>' + (r.dato ? '✅' : '🔒') + " <b>Dato'</b> · Ketua Sayap Pusat / Menteri, selepas 3 tahun berkhidmat" + (r.dato ? ' · <i>dikurniakan</i>' : (r.bulanDato ? ' · ' + Math.min(r.bulanDato, r.bulanLayak) + '/' + r.bulanLayak + ' bulan' : '')) + '</li>';
    h += '<li' + (r.tansri ? '' : ' style="opacity:.55"') + '>' + (r.tansri ? '✅' : '🔒') + ' <b>Tan Sri</b> · Naib Presiden / Presiden / Timbalan PM / PM, Integriti ≥ 70' + (r.tansri ? ' · <i>dikurniakan</i>' : (r.bulanTan ? ' · ' + Math.min(r.bulanTan, r.bulanLayak) + '/' + r.bulanLayak + ' bulan' : '')) + '</li></ul>';
    if (r.ditahan) { h += '<div class="banner banner--warn">Gelaran ditahan sementara (keahlian digantung).</div>'; }
    if (r.ditarik) { h += '<div class="banner banner--warn">Gelaran ditarik balik (dipecat).</div>'; }
    return h + '<p class="note" style="font-size:.78rem">Dikurniakan secara fiksyen oleh pihak istana. Ditahan jika digantung, ditarik jika dipecat. Kesan: Reputasi +2 setiap anugerah, awalan nama pada profil dan Rumusan Kerjaya.' + (r.awalan ? ' Nama pada profil: <b>' + esc(r.awalan + p.nama) + '</b>' : '') + '</p></section>';
  }
  function kad(p) {
    try { return (SM ? kadSampingan(p) : '') + (GL ? kadGelaran(p) : ''); } catch (e) { return ''; }
  }

  W.document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-sampingan]') : null;
    if (!t || t.disabled || !SM) { return; }
    var r = SM.laburkan(t.getAttribute('data-jenis'), t.getAttribute('data-aras'));
    toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); if (r.ok) { segarkan(); }
  });

  W.NusaSampingan_UI = { kad: kad };
})(window);
