/* ==========================================================================
   Nusa Politik — js/dap-ui.js   (v13.37; v13.38: Fasa 2: Hubungan JTP, Pencalonan Cawangan, Mesyuarat Pertama JTP, caruman, tangguh Kongres)
   Kad "DAP: Parti & Kongres Kebangsaan" di tab Profil (logik dalam js/dap.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikDAP, S = W.MyPolitikSave;
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
      M.segarPenyelaras(p);
      var k = M.kawasan(p), C = M.CONFIG, h = '<section class="card dap-kad"><h2 class="card__title" style="margin:0 0 4px">🚀 DAP: Parti &amp; Kongres Kebangsaan</h2>';
      // Gabungan PH
      h += '<h3 class="pkr-h">Pakatan Harapan</h3><div class="pkr-rakan"><span class="pkr-chip pkr-chip--anda"><img src="assets/images/logo-dap.svg" alt="">DAP</span>' +
        C.RAKAN.map(function (r) { return '<span class="pkr-chip" title="' + esc(r.penuh) + '">' + (r.logo ? '<img src="' + esc(r.logo) + '" alt="">' : '') + esc(r.nama) + '</span>'; }).join('') + '</div>' +
        '<p class="note">Rakan PH dimainkan sebagai NPC. PH memimpin Kerajaan Perpaduan bersama rakan; selepas PRU, rakan gabungan perlu dirundingkan semula. Kerajaan negeri dipimpin PH: ' + esc(C.KERAJAAN_NEGERI.join(', ')) + '.</p>';
      // Kawasan & kuota
      h += '<h3 class="pkr-h">Kawasan &amp; kuota PH</h3>';
      if (k.parlimen) {
        h += kv('Kawasan ' + esc(k.parlimen.n), 'Pengundi Bumiputera ' + k.parlimen.m + '% · kedudukan ' + k.parlimen.r + '/' + k.bilBahagian) +
          kv('Wakil Kongres kawasan ini', M.perwakilan(k.parlimen.kod) + ' wakil · ' + (k.parlimen.c || 0) + ' Cawangan layak') +
          kv('Penyelaras JPKP', M.penyelaras(p) ? '✅ Anda (Ahli Parlimen)' : M.ahliParlimen(p) ? 'Ahli Parlimen DAP kawasan ini' : 'Ahli Parlimen DAP kawasan ini (NPC)') +
          kv('Kerusi Parlimen', k.kuotaPL ? '✅ dalam kuota DAP (' + C.KUOTA_PARLIMEN + ')' : '⛔ untuk rakan PH (kuota DAP ' + C.KUOTA_PARLIMEN + ')') +
          kv('Kerusi DUN', k.dun ? esc(k.dun.n) + ' · ' + (k.kuotaDUN ? '✅ dalam kuota (' + C.KUOTA_DUN + ')' : '⛔ untuk rakan PH (kuota ' + C.KUOTA_DUN + ')') : 'Tiada DUN');
      }
      var seterus = M.tahunSeterusnya(p, p.tahun), kini = M.adalahTahunPemilihan(p, p.tahun);
      h += kv('Pemilihan parti', kini ? '🗳️ Tahun ini (' + p.tahun + ')' : 'Seterusnya ' + seterus + ' (setiap 3 tahun)');
      // Pemilihan Pusat
      var r = M.ringkasPusat(p), sj = M.statusJelajah(p);
      h += '<h3 class="pkr-h">Kongres Kebangsaan: Wakil Cawangan</h3><p class="note">Kongres Kebangsaan memilih 30 ahli Jawatankuasa Tertinggi Pusat setiap 3 tahun; 30% kerusi dikhaskan untuk calon wanita. Setiap Wakil mengundi 30 calon. Cawangan dengan 25 hingga 50 ahli berbayar menghantar 2 Wakil, ditambah 1 bagi 51 hingga 100 ahli dan 1 lagi bagi setiap 100 ahli seterusnya (Perlembagaan DAP, Fasal VIII). Ahli JTP kemudian memilih Setiausaha Agung, Pengerusi Kebangsaan dan Naib Pengerusi Kebangsaan sesama sendiri (Fasal X).</p>' +
        '<p class="note pkr-panduan">Naikkan sokongan Wakil sebelum Kongres Kebangsaan. Jelajah: +' + C.PUSAT.jelajahNaik + '% di satu kawasan pilihan, sekali sebulan.</p>' +
        meter('Sokongan Wakil Kongres', r.purata, r.sokongUndi + ' / ' + r.pengundi) + kv('Kawasan condong kepada anda', r.condong + ' / ' + r.bilBahagian);
      if (!pilihKw || !r.senarai.some(function (x) { return x.kod === pilihKw; })) { pilihKw = r.senarai[0] && r.senarai[0].kod; }
      h += '<label class="note" for="dap-kw">Kawasan untuk dijelajah</label><select id="dap-kw" class="select" style="width:100%;margin:4px 0 6px" data-dap-kw>' +
        r.senarai.map(function (x) { return '<option value="' + esc(x.kod) + '"' + (x.kod === pilihKw ? ' selected' : '') + '>' + esc(x.nama) + ' · ' + x.sokongan + '% · ' + x.wakil + ' wakil</option>'; }).join('') + '</select>' +
        '<button type="button" class="btn btn--sm btn--ghost" data-dap="jelajah"' + (sj.boleh ? '' : ' disabled') + '>🚗 Jelajah Kawasan (' + C.PUSAT.jelajahAP + ' AP, ' + rm(C.PUSAT.jelajahMYR) + ', +' + C.PUSAT.jelajahNaik + '%)</button>' + (sj.boleh ? '' : ' <small class="note">' + esc(sj.sebab) + '</small>');
      h += fasa2(p, C);
      return h + '<p class="note" style="margin-top:8px">Struktur ikut Perlembagaan DAP (seperti pada 22.10.2019); kuota kerusi dan kekuatan negeri ialah andaian permainan.</p></section>';
    } catch (e) { return ''; }
  }
  /* ---------- v13.38: Fasa 2 ---------- */
  function butang(aksi, label, st0, extra) { return '<button type="button" class="btn btn--sm btn--ghost" data-dap="' + aksi + '"' + (extra || '') + (st0.boleh ? '' : ' disabled') + '>' + label + '</button>'; }
  function sebab(st0) { return st0.boleh ? '' : '<p class="note" style="margin:4px 0 0">' + esc(st0.sebab) + '</p>'; }
  function titik(n, w) { var x = ''; for (var i = 0; i < n; i++) { x += '<i style="background:' + w + '"></i>'; } return x; }
  function fasa2(p, C) {
    var h = '', H = C.HUB, hb = M.hubJTP(p), m = p.dap || {};
    // Hubungan JTP
    h += '<h3 class="pkr-h">🎯 Hubungan JTP</h3>' + meter('Hubungan JTP', hb, Math.round(hb) + ' / 100') +
      '<p class="note">Pemilihan calon pilihan raya ialah hak mutlak Jawatankuasa Tertinggi Pusat (Perlembagaan DAP, Fasal XII). Hubungan JTP memberi ±' + Math.round(H.calon * 100) + ' mata peluang dicalonkan. Naik apabila menjadi Ahli JTP (+' + H.ahliJTP + '), mencarum elaun (+' + H.caruman + ' sebulan) atau melobi rakan JTP (+' + H.lobi + '); turun apabila dihukum Jawatankuasa Tatatertib (' + H.hukum + ') atau skor Integriti bawah 40 (' + H.integritiRendah + ' sebulan).</p>' +
      kv('Tempoh keahlian', Math.floor(M.tahunKeahlian(p)) + ' tahun' + (M.tahunKeahlian(p) < C.PENCALONAN.tahunAhli ? ' ⚠️ perlu 2 tahun untuk calon JTP dan calon PRU' : ' ✅'));
    // Pencalonan Cawangan
    var sp = M.statusPencalonan(p);
    h += '<h3 class="pkr-h">📋 Pencalonan ke JTP</h3><p class="note">Calon JTP mesti dicalonkan oleh sekurang-kurangnya 2 Cawangan dan menjadi ahli sekurang-kurangnya 2 tahun (Perlembagaan DAP, Fasal XXX). Pengerusi Cawangan mendapat 1 pencalonan daripada Cawangannya sendiri.</p>' +
      kv('Pencalonan', M.pencalonan(p) + ' / ' + C.PENCALONAN.perlu) + butang('calon', '📨 Kumpul Pencalonan Cawangan (' + C.PENCALONAN.ap + ' AP)', sp) + sebab(sp);
    // Mesyuarat Pertama JTP
    var mt = M.mesyuarat(p), sm = M.statusMesyuarat(p), MS = C.MESYUARAT;
    h += '<h3 class="pkr-h">🗳️ Mesyuarat Pertama JTP</h3><p class="note">30 ahli JTP memilih Setiausaha Agung, Pengerusi Kebangsaan dan Naib Pengerusi Kebangsaan dari kalangan mereka (Perlembagaan DAP, Fasal X.1). Perlu ' + MS.majoriti + ' / ' + MS.ahli + ' undi untuk Setiausaha Agung atau Pengerusi Kebangsaan; Naib Pengerusi sekurang-kurangnya ' + MS.naibMin + ' undi. Setiausaha Agung maksimum ' + C.SA_PENGGAL + ' penggal (Fasal X.2(b)).</p>';
    if (mt) {
      h += '<div class="dap-titik">' + titik(1, '#E50019') + titik(mt.sokong, '#2e7d32') + titik(mt.belum, '#bdbdbd') + titik(mt.lawan, '#455a64') + '</div>' +
        kv('Undian', 'Anda · ' + mt.sokong + ' menyokong · ' + mt.belum + ' belum memutuskan · ' + mt.lawan + ' menyokong lawan') +
        kv('Sasaran', mt.sasaran ? esc(C.SASARAN[mt.sasaran]) : 'Belum dipilih');
      if (mt.hasil) { h += kv('Keputusan', mt.hasil.bertanding ? mt.hasil.undi + ' / ' + MS.ahli + ' undi · ' + (mt.hasil.menang ? '✅ dipilih' : '❌ tidak dipilih') : 'Tidak bertanding'); }
      else {
        h += Object.keys(C.SASARAN).map(function (k) { return butang('sasaran', esc(C.SASARAN[k]), sm, ' data-kod="' + k + '"'); }).join(' ') + ' ' + butang('sasaran', 'Tidak bertanding', sm, ' data-kod=""') + sebab(sm);
        var sl = M.statusLobi(p); h += '<div style="margin-top:6px">' + butang('lobi', '🤝 Lobi rakan JTP (' + MS.lobiAP + ' AP, ' + rm(MS.lobiMYR) + ')', sl) + sebab(sl) + '</div>';
      }
    } else { h += '<p class="note">' + esc(sm.sebab) + '</p>'; }
    h += kv('Penggal Setiausaha Agung anda', M.penggalSA(p) + ' / ' + C.SA_PENGGAL);
    // Peraturan Kongres dan caruman
    h += '<h3 class="pkr-h">⏳ Kongres &amp; caruman</h3>' +
      (typeof m.tangguhDari === 'number' ? kv('Kongres ditangguh', m.tangguhDari + ' → ' + m.asas) : '') +
      '<p class="note">Jika Kongres jatuh dalam 24 bulan sebelum PRU, JTP menangguhkannya; Kongres diadakan selepas PRU (Perlembagaan DAP, Fasal VIII.1(c)). Wakil rakyat mencarum ' + Math.round(C.CARUMAN.kadar * 100) + '% elaun kepada dana parti (Fasal IV.12(a)). Ahli yang dipecat semasa menjadi wakil rakyat kehilangan kerusinya (Fasal IV.12(c)).</p>';
    return h;
  }
  W.document.addEventListener('change', function (ev) { var t = ev.target; if (t && t.hasAttribute && t.hasAttribute('data-dap-kw')) { pilihKw = t.value; } });
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-dap]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-dap'), r = a === 'jelajah' ? M.jelajah(pilihKw) : a === 'calon' ? M.kumpulPencalonan() : a === 'lobi' ? M.lobi()
      : a === 'sasaran' ? M.pilihSasaran(b.getAttribute('data-kod') || null) : null;
    if (!r) { return; }
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  var st = W.document.createElement('style');
  st.textContent = '.pkr-h{font-size:.92rem;margin:12px 0 4px}.pkr-rakan{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0}.pkr-chip{display:inline-flex;align-items:center;gap:5px;border:2px solid var(--garis,var(--border));border-radius:10px;padding:3px 8px;font-size:.8rem;font-weight:700;opacity:.75}' +
    '.pkr-chip img{width:26px;height:18px;object-fit:contain;border-radius:3px;background:#fff}.pkr-chip--anda{opacity:1;border-color:#00AEEF}';
  st.textContent += '.dap-titik{display:flex;flex-wrap:wrap;gap:3px;margin:6px 0}.dap-titik i{display:inline-block;width:13px;height:13px;border-radius:50%}';
  W.document.head.appendChild(st);
  W.MyPolitikDAPUI = { kad: kad };
})(window);
