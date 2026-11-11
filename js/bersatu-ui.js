/* ==========================================================================
   Nusa Politik — js/bersatu-ui.js   (v13.89)
   Kad "🔴 BERSATU: Parti & Perhimpunan Agung" di tab Profil (logik dalam js/bersatu.js). Gaya kongsi .pkr-* daripada js/amanah-ui.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikBersatu, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Number(n || 0).toLocaleString('en'); }
  function U() { return W.NusaUI || {}; }
  function kv(a, b) { return '<div class="kv"><span>' + a + '</span><b>' + b + '</b></div>'; }
  function meter(label, n, nilai) {
    var w = Math.max(0, Math.min(100, Math.round(n))), warna = w >= 50 ? 'var(--success)' : w >= 35 ? 'var(--warning)' : 'var(--danger)';
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + esc(nilai) + '</b></div><div class="progress progress--sm" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + w + '"><div class="progress__bar" style="width:' + w + '%;background:' + warna + '"></div></div></div>';
  }
  function butang(aksi, label, st0, extra) { return '<button type="button" class="btn btn--sm btn--ghost" data-bst="' + aksi + '"' + (extra || '') + (st0.boleh ? '' : ' disabled') + '>' + label + '</button>'; }
  function sebab(st0) { return st0.boleh ? '' : '<p class="note" style="margin:4px 0 0">' + esc(st0.sebab) + '</p>'; }
  var pilihB = null;
  function kad(p) {
    try {
      if (!M.adalah(p)) { return ''; }
      var k = M.kawasan(p), C = M.CONFIG, h = '<section class="card bst-kad"><h2 class="card__title" style="margin:0 0 4px">🔴 BERSATU: Parti &amp; Perhimpunan Agung</h2>';
      h += kv('Keahlian', M.bersekutu(p) ? '🤝 Ahli Bersekutu (tidak boleh mengundi atau bertanding jawatan parti)' : '👤 Ahli Biasa (boleh mengundi dan bertanding)');
      h += '<h3 class="pkr-h">Perikatan Nasional</h3><div class="pkr-rakan"><span class="pkr-chip pkr-chip--anda" style="border-color:#D71920"><img src="assets/images/logo-bersatu.png" alt="">BERSATU</span>' +
        C.RAKAN.map(function (r) { return '<span class="pkr-chip" title="' + esc(r.penuh) + '"><img src="' + esc(r.logo) + '" alt="">' + esc(r.nama) + '</span>'; }).join('') + '</div>' +
        '<p class="note">Rakan PN dimainkan sebagai NPC. PN bermula sebagai pembangkang persekutuan. Kerajaan negeri PN: ' + esc(C.KERAJAAN_NEGERI.join(', ')) + '.</p>';
      h += '<h3 class="pkr-h">Bahagian &amp; kuota PN</h3>';
      if (k.parlimen) {
        h += kv('Bahagian ' + esc(k.parlimen.n), 'Pengundi Bumiputera ' + k.parlimen.m + '% · kedudukan ' + k.parlimen.r + '/' + k.bilBahagian) +
          kv('Kerusi Parlimen', k.kuotaPL ? '✅ dalam kuota BERSATU (' + C.KUOTA_PARLIMEN + ')' : '⛔ untuk rakan PN (kuota BERSATU ' + C.KUOTA_PARLIMEN + ')') +
          kv('Kerusi DUN', k.dun ? esc(k.dun.n) + ' · ' + (k.kuotaDUN ? '✅ dalam kuota (' + C.KUOTA_DUN + ')' : '⛔ untuk rakan PN (kuota ' + C.KUOTA_DUN + ')') : 'Tiada DUN');
      }
      h += kv('Pemilihan parti', M.adalahTahunPemilihan(p, p.tahun) ? '🗳️ Tahun ini (' + p.tahun + ')' : 'Seterusnya ' + M.tahunSeterusnya(p, p.tahun) + ' (setiap 3 tahun)');
      // Kesepaduan PN
      var ks = M.kesepaduan(p), sr = M.statusRunding(p), PN = C.PN;
      h += '<h3 class="pkr-h">🤝 Kesepaduan PN</h3>' + meter('Kesepaduan PN', ks, Math.round(ks) + ' / 100') +
        '<p class="note">Kerjasama BERSATU dan PAS dalam agihan kerusi dan kempen bersama: kesan undi kerusi ±' + PN.ofset + '; bawah ' + PN.rendah + ' PAS bertanding menentang BERSATU (3 penjuru, ' + PN.tigaPenjuru + '). Juga menjejaskan peluang dicalonkan. Susut ' + PN.susut + ' sebulan ke arah ' + PN.awal + '.</p>' +
        butang('runding', '🤝 Rundingan kerusi bersama PAS (' + PN.ap + ' AP, ' + rm(PN.myr) + ', +' + PN.naik + ')', sr) + sebab(sr);
      // Persidangan Bahagian -> MPT
      var r = M.ringkasPusat(p), sj = M.statusJelajah(p);
      h += '<h3 class="pkr-h">Persidangan Bahagian: pemilihan MPT</h3><p class="note">Presiden, Timbalan Presiden, 3 Naib Presiden dan 20 Ahli Majlis Pimpinan Tertinggi dipilih dalam Persidangan Bahagian setiap 3 tahun; setiap Bahagian menghantar sehingga 7 wakil ke Perhimpunan Agung (Perlembagaan BERSATU, Fasal 12.4.3, 13.3, 18.5). Jelajah: +' + C.PUSAT.jelajahNaik + '% di satu Bahagian pilihan, sekali sebulan.</p>' +
        meter('Sokongan Persidangan Bahagian', r.purata, r.sokongUndi + ' / ' + r.pengundi) + kv('Bahagian condong kepada anda', r.condong + ' / ' + r.bilBahagian);
      if (!pilihB || !r.senarai.some(function (x) { return x.kod === pilihB; })) { pilihB = r.senarai[0] && r.senarai[0].kod; }
      h += '<label class="note" for="bst-b">Bahagian untuk dijelajah</label><select id="bst-b" class="select" style="width:100%;margin:4px 0 6px" data-bst-b>' +
        r.senarai.map(function (x) { return '<option value="' + esc(x.kod) + '"' + (x.kod === pilihB ? ' selected' : '') + '>' + esc(x.nama) + ' (' + esc(x.neg) + ') · ' + x.sokongan + '%</option>'; }).join('') + '</select>' +
        butang('jelajah', '🚗 Jelajah Bahagian (' + C.PUSAT.jelajahAP + ' AP, ' + rm(C.PUSAT.jelajahMYR) + ', +' + C.PUSAT.jelajahNaik + '%)', sj) + sebab(sj);
      // Syarat Presiden
      var th = Math.floor(M.tahunKeahlian(p)), sy = C.SYARAT_PRESIDEN;
      h += '<h3 class="pkr-h">🎯 Syarat calon Presiden / Timbalan Presiden</h3>' +
        kv('Tempoh keahlian', (th >= sy.tahun ? '✅ ' : '⛔ ') + Math.min(th, 99) + ' / ' + sy.tahun + ' tahun') +
        kv('Pernah Ahli MPT atau Ketua Bahagian', M.pernahLayakPresiden(p) ? '✅ Ya' : '⛔ Belum') +
        kv('Penggal Presiden anda', M.penggalPresiden(p) + ' / ' + C.PRESIDEN_PENGGAL) +
        '<p class="note">Perlembagaan BERSATU, Fasal 13.6 dan 13.8. Ketua dan Timbalan Ketua Badan Pimpinan Negeri dilantik oleh Presiden (Fasal 17.4).</p>';
      return h + '<p class="note" style="margin-top:8px">Struktur ikut Perlembagaan BERSATU. ⚠️ Takwim, kuota kerusi, Kesepaduan PN dan sayap Srikandi Muda ialah andaian permainan.</p></section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('change', function (ev) { var t = ev.target; if (t && t.hasAttribute && t.hasAttribute('data-bst-b')) { pilihB = t.value; } });
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-bst]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-bst'), r = a === 'jelajah' ? M.jelajah(pilihB) : a === 'runding' ? M.runding() : null;
    if (!r) { return; }
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  W.MyPolitikBersatuUI = { kad: kad };
})(window);
