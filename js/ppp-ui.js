/* ==========================================================================
   Nusa Politik — js/ppp-ui.js   (v13.8)
   Kad "PPP: Tuntut Kerusi BN" di tab Profil (logik dalam js/ppp.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikPPP, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Number(n || 0).toLocaleString('en'); }
  function U() { return W.NusaUI || {}; }
  function kv(a, b) { return '<div class="kv"><span>' + a + '</span><b>' + b + '</b></div>'; }
  function meter(label, n, nilai) {
    var w = Math.max(0, Math.min(100, Math.round(n))), warna = w >= 50 ? 'var(--success)' : w >= 30 ? 'var(--warning)' : 'var(--danger)';
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + esc(nilai) + '</b></div><div class="progress progress--sm" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + w + '"><div class="progress__bar" style="width:' + w + '%;background:' + warna + '"></div></div></div>';
  }
  function kad(p) {
    try {
      if (!M.adalah(p)) { return ''; }
      var C = M.CONFIG, k = M.kawasan(p), pg = M.pengaruh(p), pel = M.peluangKerusi(p), ker = M.kerusiSah(p), kr = M.statusKrisis(p);
      var h = '<section class="card ppp-kad"><h2 class="card__title" style="margin:0 0 4px">⭐ PPP: Tuntut Kerusi BN</h2>';
      if (M.beku(p)) {
        h += '<div class="banner banner--warn" role="alert"><strong>PPP dibekukan oleh ROS</strong><span>Sehingga ' + esc(M.tb(p.ppp.beku)) + ': tiada mesyuarat, pemilihan atau Tuntut Kerusi BN.</span></div>' +
          (p.ppp.bekuRayu ? '' : '<button type="button" class="btn btn--sm btn--primary" data-ppp="rayuan">Rayuan ke Kementerian Dalam Negeri (' + C.KRISIS.rayuanAP + ' AP, peluang ' + Math.round(C.KRISIS.rayuanPeluang * 100) + '%)</button>');
      }
      if (M.gantungAktif(p)) { h += '<div class="banner banner--warn" role="alert"><strong>Keahlian digantung</strong><span>Sehingga ' + esc(M.tb(p.ppp.gantung)) + ': tidak boleh bertanding atau melobi.</span></div>'; }
      if (kr) {
        var pl = kr.pilihan, nm = { presiden: 'Sokong Presiden', pencabar: 'Sokong pencabar', berkecuali: 'Berkecuali' };
        h += '<div class="banner banner--warn" role="alert"><strong>Krisis kepimpinan PPP</strong><span>Seorang pencabar mempertikaikan kedudukan Presiden dan kes dibawa ke ROS. Keputusan pada ' + esc(M.tb(kr.sehingga)) + '.</span></div>';
        if (pl) { h += kv('Pendirian anda', esc(nm[pl])); }
        else {
          h += '<button type="button" class="btn btn--sm btn--ghost" style="margin:2px 4px 2px 0" data-ppp="krisis" data-pilih-ppp="presiden">🛡️ Sokong Presiden</button>' +
            '<button type="button" class="btn btn--sm btn--ghost" style="margin:2px 4px 2px 0" data-ppp="krisis" data-pilih-ppp="pencabar">⚔️ Sokong pencabar</button>' +
            '<button type="button" class="btn btn--sm btn--ghost" style="margin:2px 4px 2px 0" data-ppp="krisis" data-pilih-ppp="berkecuali">⚖️ Berkecuali</button>' +
            '<p class="note">Sokong Presiden: jika menang AJK +' + C.KRISIS.presiden.ajk + ' dan Pengaruh +' + C.KRISIS.presiden.pengaruh + '; jika kalah Reputasi ' + C.KRISIS.presiden.kalahReputasi + ' dan jawatan Pusat dilucutkan. Sokong pencabar: jika menang dilantik ke Majlis Tertinggi; jika kalah digantung ' + C.KRISIS.gantungBulan + ' bulan. Berkecuali: selamat, Pengaruh ' + C.KRISIS.berkecuali.pengaruh + '.</p>';
        }
      }
      // Kawasan
      h += '<h3 class="ppp-h">Kawasan anda</h3>';
      if (k.parlimen) { h += kv('Bahagian ' + esc(k.parlimen.n), 'Bumiputera ' + k.parlimen.m + '% · Cina ' + k.parlimen.c + '% · India ' + k.parlimen.i + '%'); }
      var seterus = M.tahunSeterusnya(p, p.tahun), kini = M.adalahTahunPemilihan(p, p.tahun);
      h += kv('Pemilihan parti', kini ? '🗳️ Tahun ini (' + p.tahun + ')' : 'Seterusnya ' + seterus + ' (setiap 3 tahun)');
      var l = M.lantikanSemasa(p); if (l) { h += kv('Lantikan anda', esc(l.jawatan) + ' · IP +' + l.ip + ' sebulan'); }
      // Tuntut Kerusi BN
      h += '<h3 class="ppp-h">Pengaruh dalam BN</h3><p class="note">PPP tiada kerusi tetap dalam BN. Bina Pengaruh supaya BN memberi PPP satu kerusi dalam PRU.</p>' +
        meter('Pengaruh dalam BN', pg, Math.round(pg) + ' / 100');
      var sl = M.statusLobi(p), sj = M.statusJentera(p);
      h += '<button type="button" class="btn btn--sm btn--ghost" data-ppp="lobi"' + (sl.boleh ? '' : ' disabled') + '>🤝 Lobi pimpinan BN (' + C.PENGARUH.lobiAP + ' AP, ' + rm(C.PENGARUH.lobiMYR) + ', +' + C.PENGARUH.lobiNaik + ')</button>' + (sl.boleh ? '' : ' <small class="note">' + esc(sl.sebab) + '</small>');
      h += '<div style="margin-top:6px"><button type="button" class="btn btn--sm btn--ghost" data-ppp="jentera"' + (sj.boleh ? '' : ' disabled') + '>🚩 Jentera untuk calon BN (' + C.PENGARUH.jenteraAP + ' AP)</button>' + (sj.boleh ? '' : ' <small class="note">' + esc(sj.sebab) + '</small>') + '</div>';
      // Rundingan
      var jd = M.jadualPRU(p);
      h += '<h3 class="ppp-h">Rundingan kerusi PRU</h3>';
      if (ker) {
        h += kv('Kerusi Parlimen', ker.PL ? (ker.pemainPL ? '✅ Diberi kepada PPP di kawasan anda' : '✅ Diberi kepada calon PPP lain') : '⛔ Tidak diberi') +
          kv('Kerusi DUN', ker.DUN ? (ker.pemainDUN ? '✅ Diberi kepada PPP di kawasan anda' : '✅ Diberi kepada calon PPP lain') : '⛔ Tidak diberi');
      } else {
        h += kv('Rundingan', esc(M.tb(jd - C.RUNDING.bulanSebelum)) + ' (12 bulan sebelum PRU)') +
          kv('Peluang kerusi Parlimen', pel.PL + '%') + kv('Peluang kerusi DUN', pel.DUN + '%');
      }
      return h + '<p class="note" style="margin-top:8px">Mod ringan: perlembagaan PPP tidak tersedia, jadi peraturan ini ialah andaian permainan. Calon kerusi Parlimen perlu Ketua Bahagian atau lebih; kerusi DUN perlu Ketua Cawangan atau lebih.</p></section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-ppp]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-ppp'), r = null;
    if (a === 'lobi') { r = M.lobi(); }
    else if (a === 'jentera') { r = M.jentera(); }
    else if (a === 'krisis') { r = M.pilihKrisis(b.getAttribute('data-pilih-ppp')); }
    else if (a === 'rayuan') { r = M.rayuanBeku(); }
    if (!r) { return; }
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok && r.jaya !== false ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  var st = W.document.createElement('style');
  st.textContent = '.ppp-h{font-size:.92rem;margin:12px 0 4px}';
  W.document.head.appendChild(st);
  W.MyPolitikPPPUI = { kad: kad };
})(window);
