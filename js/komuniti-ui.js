/* ==========================================================================
   Nusa Politik — js/komuniti-ui.js   (v8.23)
   Dua kad "Jawatan Komuniti" di tab Tindakan: kad 1 (jenis + jawatan dipegang), kad 2 (jawatan bagi jenis dipilih).
   Bergantung pada js/komuniti.js dan W.NusaUI (esc).
   ========================================================================== */
(function (W) {
  'use strict';
  var KM = W.MyPolitikKomuniti;
  if (!KM) { return; }
  function esc(s) { return W.NusaUI ? W.NusaUI.esc(s) : String(s); }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('ms-MY'); }
  var pilih = null;
  function sp(t) { return '<span>' + esc(t) + '</span>'; }
  /* Setiap bahagian dalam <span> sendiri supaya padanan terjemahan EN berfungsi. */
  function ganjaranH(g) {
    var o = [];
    if (g.akarUmbi) { o.push(sp('akar umbi +' + g.akarUmbi)); }
    if (g.reputasi) { o.push(sp('reputasi +' + g.reputasi)); }
    if (g.ip) { o.push(sp('IP +' + g.ip)); }
    if (g.myr) { o.push(sp(rm(g.myr))); }
    return o.join(', ');
  }
  function kad(p) {
    try {
      if (p.tamat) { return ''; }
      var r = KM.ringkasan(p);
      var h = '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🧭 Jawatan Komuniti</h2><p class="note" style="font-size:.78rem">Nama persatuan dan agensi ialah rekaan. Simulasi permainan.</p>' +
        '<div class="kv"><span>Jawatan dipegang</span><b>' + r.bil + ' / ' + KM.CONFIG.MAKS + '</b></div>';
      r.jawatan.forEach(function (j) {
        h += '<div style="margin:8px 0"><b>' + esc(j.ikon) + ' ' + esc(j.nama) + '</b><div class="note" style="font-size:.78rem;margin:2px 0 4px">' + ganjaranH(j.ganjaran) + ' ' + sp('sebulan') + ', ' + sp('baki ' + j.bulanBaki + ' bulan') +
          (j.risiko.audit ? ', ' + sp('Konflik ' + j.konflik + '%, Audit ' + j.audit + '%') : '') + '</div>' +
          (j.bolehBaharui ? '<button type="button" class="btn btn--sm" data-act="kom-baharui" data-id="' + esc(j.id) + '">Perbaharui 3 tahun (' + esc(rm(j.kosBaharui)) + ')</button> ' : '') +
          '<button type="button" class="btn btn--sm" data-act="kom-letak" data-id="' + esc(j.id) + '">Letak jawatan</button></div>';
      });
      h += '<p class="note" style="font-size:.8rem;margin-top:8px">Pilih jenis jawatan untuk dilobi. Kos: IP dan Dana. Gagal: separuh kos hilang. Tempoh 3 tahun.</p>';
      KM.JENIS.forEach(function (jn) {
        var ps = r.senarai.filter(function (x) { return x.jenis === jn.id; }), bil = ps.filter(function (x) { return x.boleh; }).length;
        h += '<div style="margin:6px 0"><b>' + esc(jn.ikon) + ' ' + esc(jn.nama) + '</b><div class="note" style="font-size:.78rem;margin:2px 0 4px">' + sp(ps.length + ' jawatan, ' + bil + ' layak sekarang') + '</div>' +
          '<button type="button" class="btn btn--sm' + (pilih === jn.id ? ' btn--gold' : '') + '" data-act="kom-jenis" data-id="' + esc(jn.id) + '">' + (pilih === jn.id ? 'Dipilih' : 'Pilih jenis') + '</button></div>';
      });
      h += '</section>';
      if (pilih) {
        var jn2 = KM.JENIS.filter(function (x) { return x.id === pilih; })[0];
        if (!jn2) { pilih = null; return h; }
        h += '<section class="card"><h2 class="card__title" style="margin:0 0 4px">' + esc(jn2.ikon) + ' ' + esc(jn2.nama) + '</h2>';
        r.senarai.filter(function (x) { return x.jenis === pilih; }).forEach(function (x) {
          h += '<div style="margin:8px 0"><b>' + esc(x.ikon) + ' ' + esc(x.nama) + '</b><div class="note" style="font-size:.78rem;margin:2px 0 4px">' + sp('Kos IP ' + x.ip + ' dan ' + rm(x.myr) + ', peluang ' + x.peluang + '%, ganjaran') + ' ' + ganjaranH(x.ganjaran) + ' ' + sp('sebulan') +
            (x.risiko.audit ? ', ' + sp('risiko Konflik dan Audit SPRM') : '') + '</div>' +
            (x.milik ? '<div class="note">Dipegang.</div>' :
              '<button type="button" class="btn btn--sm' + (x.boleh ? '' : ' is-off') + '" data-act="kom-lobi" data-id="' + esc(x.id) + '"' + (x.boleh ? '' : ' disabled') + '>Lobi</button>' +
              (x.boleh ? '' : x.sebabList.map(function (b) { return '<div class="note" style="font-size:.78rem">' + esc(b) + '</div>'; }).join(''))) + '</div>';
        });
        h += '<button type="button" class="btn btn--sm" data-act="kom-kembali">Kembali</button></section>';
      }
      return h;
    } catch (e) { return ''; }
  }
  W.NusaKomuniti_UI = { kad: kad, pilih: function (id) { pilih = id || null; } };
})(window);
