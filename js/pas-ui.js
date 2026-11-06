/* ==========================================================================
   Nusa Politik — js/pas-ui.js   (v13.31, v13.32: Restu Majlis Syura, Ceramah, Dewan, rayuan)
   Kad "PAS: Parti & Muktamar" di tab Profil (logik dalam js/pas.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikPAS, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Number(n || 0).toLocaleString('en'); }
  function U() { return W.NusaUI || {}; }
  function kv(a, b) { return '<div class="kv"><span>' + a + '</span><b>' + b + '</b></div>'; }
  function meter(label, n, nilai) {
    var w = Math.max(0, Math.min(100, Math.round(n))), warna = w >= 50 ? 'var(--success)' : w >= 35 ? 'var(--warning)' : 'var(--danger)';
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + esc(nilai) + '</b></div><div class="progress progress--sm" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + w + '"><div class="progress__bar" style="width:' + w + '%;background:' + warna + '"></div></div></div>';
  }
  var pilihKw = null;
  function kad(p) {
    try {
      if (!M.adalah(p)) { return ''; }
      var k = M.kawasan(p), C = M.CONFIG, h = '<section class="card pas-kad"><h2 class="card__title" style="margin:0 0 4px">🌙 PAS: Parti &amp; Muktamar</h2>';
      // Gabungan PN
      h += '<h3 class="pas-h">Perikatan Nasional</h3><div class="pas-rakan"><span class="pas-chip pas-chip--anda"><img src="assets/images/logo-pas.svg" alt="">PAS</span>' +
        C.RAKAN.map(function (r) { return '<span class="pas-chip" title="' + esc(r.penuh) + '"><img src="' + esc(r.logo) + '" alt="">' + esc(r.nama) + '</span>'; }).join('') + '</div>' +
        '<p class="note">Rakan PN dimainkan sebagai NPC. PN bermula sebagai pembangkang persekutuan; kerajaan negeri PN: ' + esc(C.KERAJAAN_NEGERI.join(', ')) + '.</p>';
      // v13.32: Restu Majlis Syura, Ceramah, Dewan, rayuan, Fasal 15A
      if (M.bersekutu(p)) { h += '<p class="note"><b>🤝 Ahli Bersekutu</b>: boleh mengundi; jawatan hanya dalam Dewan Himpunan Pendukung (Fasal 16(2)).</p>'; }
      var R0 = C.RESTU, rs = M.restu(p);
      h += '<h3 class="pas-h">📿 Restu Majlis Syura Ulamak</h3>' + meter('Restu Majlis Syura', rs, Math.round(rs) + ' / 100') +
        '<p class="note">Peluang dicalonkan PRU ' + (rs >= 50 ? '+' : '−') + Math.abs(Math.round((rs - 50) * R0.calonSkala * 1000) / 10) + '%. Bertanding Presiden / Timbalan Presiden perlu ' + R0.presiden + '. Rayuan tatatertib ke Majlis Syura perlu ' + R0.rayuan + '. Susut 1 sebulan ke arah 50.</p>';
      var sc = M.statusCeramah(p, false), sp = M.statusCeramah(p, true), CC = C.CERAMAH, CP = C.PERDANA;
      h += '<button type="button" class="btn btn--sm btn--ghost" style="margin:2px 4px 2px 0" data-pas="ceramah"' + (sc.boleh ? '' : ' disabled') + '>🗣️ Ceramah (' + CC.ap + ' AP, ' + rm(CC.myr) + ', akar umbi +' + CC.akarUmbi + ', Restu +' + CC.restu + ')</button>' +
        '<button type="button" class="btn btn--sm btn--ghost" style="margin:2px 4px 2px 0" data-pas="perdana"' + (sp.boleh ? '' : ' disabled') + '>📣 Ceramah Perdana (' + CP.ap + ' AP, ' + rm(CP.myr) + ', Restu +' + CP.restu + ')</button>' +
        (sc.boleh ? '' : ' <small class="note">' + esc(sc.sebab) + '</small>');
      var sr = M.statusRayuan(p);
      if (sr.boleh || /sudah dibuat/.test(sr.sebab) || (p.etika && /^(digantung|dilarang|dipecat)$/.test(p.etika.status))) {
        h += '<div style="margin-top:6px"><button type="button" class="btn btn--sm btn--primary" data-pas="rayuan"' + (sr.boleh ? '' : ' disabled') + '>⚖️ Rayuan ke Majlis Syura (' + R0.rayuanAP + ' AP, peluang ' + Math.round(R0.rayuanPeluang * 100) + '%)</button>' + (sr.boleh ? '' : ' <small class="note">' + esc(sr.sebab) + '</small>') + '</div>';
      }
      // Dewan
      h += '<h3 class="pas-h">Dewan PAS</h3>';
      ['ulamak', 'sabiqun', 'pendukung'].forEach(function (kod) {
        var D0 = C.DEWAN[kod], d = M.dewanPemain(p, kod), l = M.layakDewan(p, kod);
        if (kod === 'pendukung' ? !M.bersekutu(p) : M.bersekutu(p)) { return; }                          // Ahli Bersekutu: Dewan Himpunan Pendukung sahaja
        var ikon = kod === 'ulamak' ? '📖' : kod === 'sabiqun' ? '🧓' : '🤝';
        h += '<div class="pas-dewan"><b>' + ikon + ' ' + esc(D0.nama) + '</b> ';
        if (!d.ahli) { h += l.boleh ? '<button type="button" class="btn btn--sm btn--ghost" data-pas="sertai" data-dewan-pas="' + kod + '">Sertai</button>' : '<small class="note">' + esc(l.sebab) + '</small>'; }
        else {
          var sb = M.statusBertandingDewan(p, kod), ke = sb.ke;
          h += '<small class="note">' + (d.jawatan ? '✅ ' + esc(D0.ketua) + ' ' + esc(M.label(d.jawatan)) + ' · IP +' + D0.bonus[d.jawatan] + ' sebulan' : 'Ahli') + (d.calon ? ' · calon ' + esc(M.label(d.calon)) : '') + '</small>';
          if (sb.boleh) { h += ' <button type="button" class="btn btn--sm btn--ghost" data-pas="bertanding" data-dewan-pas="' + kod + '">🗳️ Bertanding ' + esc(D0.ketua) + ' ' + esc(M.label(ke)) + ' (peluang ' + Math.round(M.peluangDewan(p, kod, ke) * 100) + '%)</button>'; }
          else if (!d.calon) { h += ' <small class="note">' + esc(sb.sebab) + '</small>'; }
        }
        h += '</div>';
      });
      var bd = M.statusBidang(p);
      if (bd.boleh) { h += '<div class="pas-dewan"><button type="button" class="btn btn--sm btn--ghost" data-pas="bidang">📖 Daftar sebagai lulusan Pengajian Islam (sekali sahaja)</button></div>'; }
      var sy = p.pas && p.pas.syura;
      if (!M.bersekutu(p)) h += sy ? kv('Ahli Majlis Syura Ulamak', '✅ Sehingga ' + esc(M.tb(sy.sehingga)) + ' · IP +' + R0.syuraIP + ' sebulan') : '<p class="note">Ketua Dewan Ulamak Pusat dengan Restu ' + R0.syura + ' ke atas berpeluang dilantik Ahli Majlis Syura Ulamak selepas Muktamar tahun pemilihan (Fasal 8).</p>';
      h += '<p class="note">⚖️ Perlembagaan PAS, Fasal 15A: wakil rakyat PAS yang menyokong pihak lain atau menjadi wakil rakyat bebas hilang keahlian serta-merta.</p>';
      // Kawasan & kuota
      h += '<h3 class="pas-h">Kawasan &amp; kuota PN</h3>';
      if (k.parlimen) {
        h += kv('Kawasan ' + esc(k.parlimen.n), 'Pengundi Bumiputera ' + k.parlimen.m + '% · kedudukan ' + k.parlimen.r + '/' + k.bilBahagian) +
          kv('Kerusi Parlimen', k.kuotaPL ? '✅ dalam kuota PAS (' + C.KUOTA_PARLIMEN + ')' : '⛔ untuk rakan PN (kuota PAS ' + C.KUOTA_PARLIMEN + ')') +
          kv('Kerusi DUN', k.dun ? esc(k.dun.n) + ' · ' + (k.kuotaDUN ? '✅ dalam kuota (' + C.KUOTA_DUN + ')' : '⛔ untuk rakan PN (kuota ' + C.KUOTA_DUN + ')') : 'Tiada DUN');
      }
      var seterus = M.tahunSeterusnya(p, p.tahun), kini = M.adalahTahunPemilihan(p, p.tahun);
      h += kv('Pemilihan parti', kini ? '🗳️ Tahun ini (' + p.tahun + ')' : 'Seterusnya ' + seterus + ' (setiap 2 tahun)');
      // Pemilihan Pusat
      var r = M.ringkasPusat(p), sj = M.statusJelajah(p);
      h += '<h3 class="pas-h">Muktamar: perwakilan Kawasan</h3><p class="note">Presiden, Timbalan Presiden dan 3 Naib Presiden dipilih oleh Muktamar Tahunan setiap 2 tahun. Setiap Kawasan menghantar 4 wakil, ditambah 1 bagi setiap 1,000 ahli melebihi 2,000, maksimum 15 (Perlembagaan PAS, Fasal 18 dan 38).</p>' +
        '<p class="note pas-panduan">Naikkan sokongan perwakilan sebelum Muktamar. Jelajah: +' + C.PUSAT.jelajahNaik + '% di satu Kawasan pilihan, sekali sebulan.</p>' +
        meter('Sokongan perwakilan Kawasan', r.purata, r.sokongUndi + ' / ' + r.pengundi) + kv('Kawasan condong kepada anda', r.condong + ' / ' + r.bilBahagian);
      if (!pilihKw || !r.senarai.some(function (x) { return x.kod === pilihKw; })) { pilihKw = r.senarai[0] && r.senarai[0].kod; }
      h += '<label class="note" for="pas-kw">Kawasan untuk dijelajah</label><select id="pas-kw" class="select" style="width:100%;margin:4px 0 6px" data-pas-kw>' +
        r.senarai.map(function (x) { return '<option value="' + esc(x.kod) + '"' + (x.kod === pilihKw ? ' selected' : '') + '>' + esc(x.nama) + ' · ' + x.sokongan + '% · ' + x.wakil + ' wakil</option>'; }).join('') + '</select>' +
        '<button type="button" class="btn btn--sm btn--ghost" data-pas="jelajah"' + (sj.boleh ? '' : ' disabled') + '>🚗 Jelajah Kawasan (' + C.PUSAT.jelajahAP + ' AP, ' + rm(C.PUSAT.jelajahMYR) + ', +' + C.PUSAT.jelajahNaik + '%)</button>' + (sj.boleh ? '' : ' <small class="note">' + esc(sj.sebab) + '</small>');
      return h + '<p class="note" style="margin-top:8px">Struktur ikut Perlembagaan PAS (Pindaan 2025); kuota kerusi dan kekuatan negeri ialah andaian permainan.</p></section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('change', function (ev) { var t = ev.target; if (t && t.hasAttribute && t.hasAttribute('data-pas-kw')) { pilihKw = t.value; } });
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-pas]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-pas'), dw = b.getAttribute('data-dewan-pas');
    var r = a === 'jelajah' ? M.jelajah(pilihKw) : a === 'ceramah' ? M.ceramah(false) : a === 'perdana' ? M.ceramah(true) : a === 'rayuan' ? M.rayuan() :
      a === 'sertai' ? M.sertaiDewan(dw) : a === 'bertanding' ? M.bertandingDewan(dw) : a === 'bidang' ? M.tukarBidang() : null;
    if (!r) { return; }
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok && r.jaya !== false ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  var st = W.document.createElement('style');
  st.textContent = '.pas-h{font-size:.92rem;margin:12px 0 4px}.pas-rakan{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0}.pas-chip{display:inline-flex;align-items:center;gap:5px;border:2px solid var(--garis,var(--border));border-radius:10px;padding:3px 8px;font-size:.8rem;font-weight:700;opacity:.75}' +
    '.pas-chip img{width:26px;height:18px;object-fit:contain;border-radius:3px;background:#fff}.pas-chip--anda{opacity:1;border-color:#0A7A3B}.pas-dewan{padding:6px 0;border-top:1px dashed var(--border,rgba(127,127,127,.3))}';
  W.document.head.appendChild(st);
  W.MyPolitikPASUI = { kad: kad };
})(window);
