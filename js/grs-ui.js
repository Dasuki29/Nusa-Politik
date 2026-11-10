/* ==========================================================================
   Nusa Politik — js/grs-ui.js   (v13.54)
   Kad "🏝️ GRS: Kerajaan Negeri Sabah" di tab Profil bagi enam parti GRS (logik dalam js/grs.js; PRN Sabah dalam js/sabah.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikGRS, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('en'); }
  function UI() { return W.NusaUI || {}; }
  function btn(id, teks, t, kelas) { return '<button type="button" class="btn btn--sm' + (kelas ? ' ' + kelas : '') + '" data-grs="' + id + '"' + (t && t.boleh === false ? ' disabled' : '') + '>' + esc(teks) + '</button>'; }
  function act(tajuk, info, t, b) { return '<div class="prkl-act"><div><b>' + tajuk + '</b><small>' + esc(info) + '</small>' + (t && !t.boleh && t.sebab && !t.sudah ? '<small class="jm-amaran">' + esc(t.sebab) + '</small>' : '') + '</div>' + b + '</div>'; }
  function kad(p) {
    try {
      if (!M.adalah(p)) { return ''; }
      var C = M.CONFIG, k = M.keadaan(p), d = k.dun, kw = k.kawasan, h = '<section class="card grs-kad">';
      var kerajaan = d.GRS + d.UPKO + d.BN + Math.floor(d.lain / 2);
      h += '<div class="grs-ban"><img src="assets/images/logo-grs.png" alt="" width="44" height="44"><div><b>🏝️ GRS: Kerajaan Negeri Sabah</b><small>' + esc(k.nama) + ' · Ketua Menteri: Hajiji Noor (NPC) · 37 / 73 untuk majoriti</small></div></div>';
      var seg = [['GRS', d.GRS + d.UPKO, '#1E5AA8'], ['BN', d.BN, '#2D50B8'], ['Warisan', d.Warisan, '#1E9E8A'], ['Lain-lain', d.lain, '#9AA0AA']];
      h += '<div class="grs-dun" role="img" aria-label="DUN Sabah">' + seg.map(function (x) { return '<i style="width:' + (x[1] / 73 * 100).toFixed(1) + '%;background:' + x[2] + '"></i>'; }).join('') + '</div>';
      h += '<small class="note">PRN ' + esc(d.tahun) + ': ' + seg.map(function (x) { return x[0] + ' ' + x[1]; }).join(' · ') + (k.kerajaan ? ' · kerajaan GRS ±' + kerajaan : ' · GRS pembangkang') + '</small>';
      if (kw.parlimen) { h += '<p class="note">Bahagian ' + esc(kw.parlimen.n) + (kw.parlimen.a ? ' · anggaran ' + Number(kw.parlimen.a).toLocaleString('en') + ' ahli dalam ' + kw.parlimen.b + ' Cawangan' : '') + ' · kuota GRS: Parlimen ' + (kw.kuotaPL ? '✔' : '✖') + (kw.dun ? ', DUN ' + esc(kw.dun.n) + ' ' + (kw.kuotaDUN ? '✔' : '✖') : '') + '</p>'; }
      h += '<div class="jm-meter__t"><span>Kestabilan Gabungan</span><b>' + k.kestabilan + '/100</b></div><div class="prkl-bar grs-bar"><i style="width:' + k.kestabilan + '%"></i></div>';
      h += '<small class="note">Bawah ' + C.KESTABILAN.krisis + ': risiko ADUN lompat / usul tidak percaya (Sabah 2020, Langkah Kinabalu 2023). Bawah ' + C.KESTABILAN.rendah + ': kerusi GRS −2 dalam PRN.</small>';
      if (k.krisis) {
        h += '<div class="tyt-ev"><b>⚖️ Krisis ADUN lompat</b><small>Beberapa ADUN penyokong kerajaan berunding dengan pembangkang. Pujuk: ' + C.KRISIS.pujukAP + ' AP + ' + rm(C.KRISIS.pujukMyr) + ', Kestabilan +' + C.KRISIS.pujuk + '. Terima: Kestabilan ' + C.KRISIS.terima + ', Reputasi ' + C.KRISIS.terimaReputasi + '. Bubar DUN: PRN mengejut dalam 2 bulan.</small>' +
          '<div class="pbg-3" style="justify-content:flex-start;margin-top:6px">' + btn('krisis:pujuk', '🤝 Pujuk', null, 'btn--primary') + btn('krisis:terima', 'Terima', null) + btn('krisis:bubar', '🗳️ Bubar DUN', null) + '</div></div>';
      }
      h += '<h3 style="margin:10px 0 4px">📋 Tindakan</h3>';
      h += act('🤝 Jamuan rakan gabungan', C.JAMUAN.ap + ' AP · ' + rm(C.JAMUAN.myr) + ' · sekali sebulan · Kestabilan +' + C.JAMUAN.naik, k.jamuan, btn('jamuan', 'Adakan', k.jamuan));
      h += act('📜 Tuntut hak MA63', C.MA63.ap + ' AP · sekali sebulan · sokongan akar umbi +' + C.MA63.akarUmbi + ' · hubungan Putrajaya ' + C.MA63.putrajaya, k.ma63, btn('ma63', 'Tuntut', k.ma63));
      h += act('🏝️ Sabah untuk Sabahan', C.SABAHAN.ap + ' AP · ' + rm(C.SABAHAN.myr) + ' · sekali sebulan · kerusi GRS +1 dalam PRN Sabah (sekarang +' + k.sabahan + ', maks +' + C.SABAHAN.maks + ')', k.sabahanS, btn('sabahan', 'Mula', k.sabahanS));
      if (k.kecil) {
        h += '<h3 style="margin:10px 0 4px">🌱 Parti kecil dalam GRS</h3>';
        h += '<div class="jm-meter__t"><span>Kekuatan Parti</span><b>' + Math.round(k.kekuatan) + '/100</b></div><div class="prkl-bar grs-bar"><i style="width:' + Math.round(k.kekuatan) + '%"></i></div>';
        h += act('📣 Gerak kerja & rekrut ahli', C.KECIL.gerakAP + ' AP · ' + rm(C.KECIL.gerakMyr) + ' · sekali sebulan · Kekuatan +' + C.KECIL.gerak + ', sokongan akar umbi +' + C.KECIL.akarUmbi, k.gerak, btn('gerak', 'Mula', k.gerak));
        if (k.kuota) { h += act('🗂️ Rundingan kuota GRS', k.kuota.jaya ? 'Berjaya: Parlimen ' + (k.kuota.PL ? '✔' : '✖') + ', DUN ' + (k.kuota.DUN ? '✔' : '✖') + ' untuk pilihan raya ini.' : 'Gagal: tiada kerusi untuk pilihan raya ini.', null, ''); }
        else { h += act('🗂️ Rundingan kuota GRS', C.KECIL.bulanSebelum + ' bulan sebelum pilihan raya · Majlis Presiden GRS · peluang ' + k.peluangKuota + '% · kerusi di kawasan anda jika anda Ketua Cawangan (DUN) atau Ketua Bahagian (Parlimen)', k.statusKuota, btn('kuota', 'Runding', k.statusKuota)); }
      }
      h += '<p class="note">⚠️ Kawasan operasi, kuota kerusi, takwim dan angka mekanik ialah andaian permainan.</p>';
      return h + '</section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-grs]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-grs'), r = null;
    if (a === 'jamuan') { r = M.jamuan(); }
    else if (a === 'ma63') { r = M.ma63(); }
    else if (a === 'sabahan') { r = M.sabahan(); }
    else if (a === 'gerak') { r = M.gerak(); }
    else if (a === 'kuota') { r = M.rundingKuota(); }
    else if (a.indexOf('krisis:') === 0) { r = M.jawabKrisis(a.slice(7)); }
    if (!r) { return; }
    if (UI().toast) { UI().toast(r.ok ? r.mesej : r.ralat, r.ok ? (r.jaya === false ? 'info' : 'ok') : 'ralat'); }
    if (UI().render) { UI().render(); }
  });
  W.MyPolitikGRSUI = { kad: kad };
})(window);
