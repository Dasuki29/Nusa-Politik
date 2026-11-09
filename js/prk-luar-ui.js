/* ==========================================================================
   Nusa Politik — js/prk-luar-ui.js   (v13.47)
   Kad "🗳️ PRK Luar Kawasan" dalam tab Pemilihan: PRK aktif, bantuan kempen dan keputusan terkini.
   Logik dalam js/prk-luar.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var PL = W.MyPolitikPRKLuar, S = W.MyPolitikSave;
  if (!PL || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('en'); }
  function label(p, k) { var K = W.MyPolitikKerusiSemasa; return K && K.label ? K.label(p, k) : k; }
  function kad(p) {
    try {
      if (!p) { return ''; }
      var k = PL.keadaan(p), a = k.aktif, h = '';
      if (!a && !k.sejarah.length) { return ''; }
      h += '<section class="card prkl" aria-labelledby="prkl-tajuk"><h2 class="card__title" id="prkl-tajuk" style="margin:0 0 4px">🗳️ PRK Luar Kawasan</h2>';
      if (a) {
        var lw = label(p, a.lawan), kita = a.calon === 'PARTI' ? 'Calon parti anda' : 'Calon rakan gabungan';
        h += '<div class="prkl-aktif"><b>PRK ' + (a.dun ? 'DUN ' : 'Parlimen ') + esc(a.kerusi) + '</b>' + (a.negeri ? ' (' + esc(a.negeri) + ')' : '') +
          ' <span class="jm-tag jm-tag--' + (a.calon === 'PARTI' ? 'anda' : 'rakan') + '">' + esc(kita) + '</span>' +
          '<small>' + (a.pertahan ? 'Mempertahankan kerusi' : 'Merampas kerusi daripada ' + esc(label(p, a.dari))) + ' · Keputusan pada awal bulan depan</small>' +
          '<div class="jm-meter__t"><span>Anggaran undi calon kita</span><b>' + k.anggaran + '%</b></div>' +
          '<div class="prkl-bar"><i style="width:' + k.anggaran + '%"></i></div><small>Lawan: ' + esc(lw) + ' ' + Math.round((100 - k.anggaran) * 10) / 10 + '%</small></div>';
        h += '<p class="note">Bantu kempen: setiap tindakan sekali bagi setiap PRK.' + (k.pengganda > 1 ? ' Jawatan anda: kesan ×' + k.pengganda + '.' : ' Ketua Bahagian ×1.25, jawatan Pusat ×1.5.') + '</p>';
        k.tindakan.forEach(function (t) {
          var kos = t.ap + ' AP' + (t.myr ? ' · ' + rm(t.myr) : '') + ' · undi +' + t.undi + '%' + (t.stress ? ' · Stress +' + t.stress : '');
          h += '<div class="prkl-act"><div><b>' + t.ikon + ' ' + esc(t.nama) + '</b><small>' + esc(kos) + '</small>' + (!t.boleh && !t.dibuat ? '<small class="jm-amaran">' + esc(t.sebab) + '</small>' : '') + '</div>' +
            '<button type="button" class="btn btn--sm" data-prkl="' + t.id + '"' + (t.boleh ? '' : ' disabled') + '>' + (t.dibuat ? '✔ Dibuat' : 'Bantu') + '</button></div>';
        });
        var d = k.dana;
        h += '<div class="prkl-act"><div><b>💰 Sumbang dana kempen</b><small>' + esc(rm(d.langkah) + ' = undi +' + d.undi + '% · ' + d.kali + ' / ' + d.maks + ' kali') + '</small>' + (!d.boleh && d.sebab ? '<small class="jm-amaran">' + esc(d.sebab) + '</small>' : '') + '</div>' +
          '<button type="button" class="btn btn--sm" data-prkl="dana"' + (d.boleh ? '' : ' disabled') + '>' + esc(rm(d.langkah)) + '</button></div>';
        h += '<div class="jm-meter__t" style="margin-top:6px"><span>Sumbangan anda</span><b>' + a.sumbangan + ' mata</b></div>' +
          '<small class="note">Menang: Reputasi Parti +1 hingga +4 (ikut sumbangan), IP +60, Sokongan AJK +2' + (a.calon === 'RAKAN' ? ', Hubungan Gabungan +3' : '') + '. Kalah: Reputasi -1. Tiada sumbangan: tiada kesan.</small>';
      }
      if (k.sejarah.length) {
        h += '<details class="prkl-sejarah"' + (a ? '' : ' open') + '><summary>Keputusan PRK terkini</summary><ul>' + k.sejarah.map(function (x) {
          return '<li><b>' + esc(x.kerusi) + '</b>' + (x.negeri ? ' (' + esc(x.negeri) + ')' : '') + ' · <span class="' + (x.menang ? 'jm-ok' : 'jm-amaran') + '">' + (x.menang ? 'MENANG' : 'KALAH') + '</span> ' + x.undi + '%' +
            '<small>' + (x.calon === 'PARTI' ? 'Calon parti anda' : 'Calon rakan gabungan') + ' · ' + x.bulan + '/' + x.tahun + ' · Sumbangan anda: ' + x.sumbangan + ' mata' + (x.reputasi ? ' · Reputasi ' + (x.reputasi > 0 ? '+' : '') + x.reputasi : '') + '</small></li>';
        }).join('') + '</ul></details>';
      }
      return h + '</section>';
    } catch (e) { return ''; }
  }
  function UI() { return W.NusaUI || {}; }
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-prkl]') : null; if (!b || b.disabled) { return; }
    var id = b.getAttribute('data-prkl'), r = id === 'dana' ? PL.sumbangDana() : PL.bantu(id);
    if (UI().toast) { UI().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (UI().render) { UI().render(); }
  });
  W.MyPolitikPRKLuarUI = { kad: kad };
})(window);
