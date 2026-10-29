/* ==========================================================================
   Nusa Politik — js/umno-ui.js   (v13.5)
   Kad "UMNO: Pemilihan & Lantikan" di tab Profil dan banner kitaran pemilihan di tab Pemilihan (logik dalam js/umno.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikUMNO, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Number(n || 0).toLocaleString('en'); }
  function fmt(n) { return Number(n || 0).toLocaleString('en'); }
  function U() { return W.NusaUI || {}; }
  function kv(a, b) { return '<div class="kv"><span>' + a + '</span><b>' + b + '</b></div>'; }
  var BULAN = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  function tb(x) { return x ? BULAN[x.bulan - 1] + ' ' + x.tahun : ''; }
  function meter(label, n, nilai) {
    var w = Math.max(0, Math.min(100, Math.round(n))), warna = w >= 50 ? 'var(--success)' : w >= 35 ? 'var(--warning)' : 'var(--danger)';
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + esc(nilai) + '</b></div><div class="progress progress--sm" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + w + '"><div class="progress__bar" style="width:' + w + '%;background:' + warna + '"></div></div></div>';
  }
  /** Ringkasan kitaran pemilihan (dipakai oleh kad dan banner tab Pemilihan). */
  function teksKitaran(p) {
    var s = M.statusKitaran(p), m = s.musim;
    if (s.tangguh) { return { tajuk: 'Pemilihan ' + s.tangguh + ' ditangguhkan (Fasal 10.16)', isi: 'MKT menangguhkan pemilihan kerana PRU dijangka pada ' + tb(s.pruJangka) + '. Penggal semua pemegang jawatan dilanjutkan. Musim pemilihan khas dijangka: Cawangan ' + BULAN[s.unjuranKhas.c - 1] + ', Bahagian dan Pusat ' + BULAN[s.unjuranKhas.b - 1] + ', PAU ' + BULAN[s.unjuranKhas.a - 1] + ' ' + s.unjuranKhas.tahun + '.', amaran: true }; }
    if (m && m.khas) { return { tajuk: 'Musim Pemilihan Khas ' + m.tahun + ' (Fasal 10.16)', isi: 'Selepas PRU: Cawangan ' + BULAN[m.c1 - 1] + ', Mesyuarat Perwakilan Bahagian dan undi Pusat ' + BULAN[m.b - 1] + ', PAU ' + BULAN[m.a - 1] + '. Kitaran 3 tahun bermula semula daripada pemilihan ini.', amaran: true }; }
    return null;
  }
  function banner(p) {
    try {
      if (!M.adalah(p)) { return ''; }
      var t = teksKitaran(p), tp = M.tempohPemilihan(p), h = '';
      if (t) { h += '<div class="banner banner--warn umno-banner"><strong>' + esc(t.tajuk) + '</strong><span>' + esc(t.isi) + '</span></div>'; }
      if (tp.aktif) { h += '<div class="banner umno-banner"><strong>Tempoh Pemilihan (Tataetika Perkara 2.1.2)</strong><span>' + esc(tb(tp.mula)) + ' hingga ' + esc(tb(tp.tamat)) + '. Jamuan Mesyuarat lebih berisiko dan Lobi Ketua Bahagian menjadi zon kelabu (Perkara 5.5, 5.6). Majlis Penerangan Badan Perhubungan ialah kempen yang dibenarkan.</span></div>'; }
      if (M.lama(p)) { h += '<div class="banner umno-banner"><strong>Takwim lama hingga hujung tahun</strong><span>Simpanan anda berada di tengah musim pemilihan semasa kemas kini dipasang. Musim tahun ini diteruskan mengikut takwim lama; takwim Perlembagaan UMNO 2025 bermula tahun depan.</span></div>'; }
      return h;
    } catch (e) { return ''; }
  }
  var pilihBhg = null, pilihNg = null;
  function kad(p) {
    try {
      if (!M.adalah(p)) { return ''; }
      var C = M.CONFIG, J0 = W.MyPolitikJawatan, s = M.statusKitaran(p), t = teksKitaran(p);
      var h = '<section class="card umno-kad"><h2 class="card__title" style="margin:0 0 4px">🗳️ UMNO: Pemilihan &amp; Lantikan</h2>';
      // Kitaran
      h += '<h3 class="umno-h">Kitaran pemilihan</h3>';
      h += kv('Pemilihan parti', s.tahunPemilihan ? '🗳️ Tahun ini (' + p.tahun + ')' : (s.tangguh ? '⏸️ Ditangguhkan' : 'Seterusnya ' + M.tahunSeterusnya(p, p.tahun) + ' (setiap 3 tahun)'));
      if (s.musim && !M.lama(p)) { h += kv('Takwim musim', 'Cawangan ' + BULAN[s.musim.c1 - 1] + (s.musim.c2 !== s.musim.c1 ? '-' + BULAN[s.musim.c2 - 1] : '') + ' · Bahagian dan Pusat ' + BULAN[s.musim.b - 1] + ' · PAU ' + BULAN[s.musim.a - 1] + ' ' + s.musim.tahun); }
      h += kv('PRU dijangka', esc(tb(s.pruJangka)));
      if (t) { h += '<p class="note">' + esc(t.isi) + '</p>'; }
      else { h += '<p class="note">MKT boleh menangguhkan pemilihan jika PRU dijangka dalam 12 bulan selepas musim pemilihan, dengan syarat pemilihan sudah diadakan dalam penggal Parlimen semasa (Fasal 10.16).</p>'; }
      // Pemilihan Pusat
      var r = M.ringkasPusat(p), sj = M.statusJelajah(p), sp = M.statusPenerangan(p);
      h += '<h3 class="umno-h">Pemilihan Pusat: perwakilan Bahagian</h3><p class="note">Presiden, Timbalan Presiden, 3 Naib Presiden dan 25 ahli MKT diundi oleh semua perwakilan Mesyuarat Perwakilan Bahagian di ' + r.bilBahagian + ' Bahagian (Fasal 9.3). Ketua sayap Malaysia diundi oleh Mesyuarat Perwakilan sayap Bahagian (Fasal 9.4).</p>' +
        meter('Sokongan perwakilan Bahagian', r.purata, fmt(r.sokongUndi) + ' / ' + fmt(r.pengundi)) + kv('Bahagian condong kepada anda', r.condong + ' / ' + r.bilBahagian);
      if (!pilihBhg || !r.senarai.some(function (x) { return x.kod === pilihBhg; })) { pilihBhg = r.senarai[0] && r.senarai[0].kod; }
      h += '<label class="note" for="umno-bhg">Bahagian untuk jelajah</label><select id="umno-bhg" class="select" style="width:100%;margin:4px 0 6px" data-umno-bhg>' +
        r.senarai.map(function (x) { return '<option value="' + esc(x.kod) + '"' + (x.kod === pilihBhg ? ' selected' : '') + '>' + esc(x.nama) + ' · ' + x.sokongan + '% · ' + fmt(x.wakil) + ' perwakilan</option>'; }).join('') + '</select>' +
        '<button type="button" class="btn btn--sm btn--ghost" data-umno="jelajah"' + (sj.boleh ? '' : ' disabled') + '>🚗 Jelajah Bahagian (' + C.PUSAT.jelajahAP + ' AP, ' + rm(C.PUSAT.jelajahMYR) + ', +' + C.PUSAT.jelajahNaik + '%)</button>' + (sj.boleh ? '' : ' <small class="note">' + esc(sj.sebab) + '</small>');
      var ng = M.senaraiNegeri(); if (!pilihNg || !ng.some(function (x) { return x.kod === pilihNg; })) { pilihNg = (p.kod && p.kod.negeri) ? String(parseInt(p.kod.negeri, 10)) : ng[0].kod; if (!ng.some(function (x) { return x.kod === pilihNg; })) { pilihNg = ng[0].kod; } }
      h += '<label class="note" for="umno-ng" style="display:block;margin-top:8px">Negeri untuk Majlis Penerangan</label><select id="umno-ng" class="select" style="width:100%;margin:4px 0 6px" data-umno-ng>' +
        ng.map(function (x) { return '<option value="' + esc(x.kod) + '"' + (x.kod === pilihNg ? ' selected' : '') + '>' + esc(x.nama) + ' · ' + x.bil + ' Bahagian</option>'; }).join('') + '</select>' +
        '<button type="button" class="btn btn--sm btn--ghost" data-umno="penerangan"' + (sp.boleh ? '' : ' disabled') + '>📢 Majlis Penerangan Badan Perhubungan (' + C.PUSAT.penerangAP + ' AP, ' + rm(C.PUSAT.penerangMYR) + ', +' + C.PUSAT.penerangNaik + '% satu negeri)</button>' + (sp.boleh ? '' : ' <small class="note">' + esc(sp.sebab) + '</small>');
      // Lantikan Ketua
      ['cawangan', 'bahagian'].forEach(function (pr) {
        if (!(J0 && J0.pegang(p, 'ketua_' + pr))) { return; }
        var N = pr === 'cawangan' ? 'Cawangan' : 'Bahagian', sl = M.statusLantikKetua(p, pr), K = C.KETUA;
        h += '<h3 class="umno-h">Lantikan Ketua ' + N + ' (Fasal ' + (pr === 'cawangan' ? '18.1.8' : '15.1.8') + ')</h3>';
        if (sl.boleh) {
          h += '<p class="note">Sekali setiap penggal, lantik Setiausaha, Bendahari, Ketua Penerangan dan ' + (pr === 'cawangan' ? 6 : 12) + ' AJK lantikan:</p>' +
            '<button type="button" class="btn btn--sm btn--ghost" data-umno="ketua" data-pr-umno="' + pr + '" data-pilih-umno="setia">🤝 Penyokong setia (AJK +' + K.setia.ajk + ', akar umbi ' + K.setia.akarUmbi + ')</button> ' +
            '<button type="button" class="btn btn--sm btn--ghost" data-umno="ketua" data-pr-umno="' + pr + '" data-pilih-umno="puak">🕊️ Wakil semua puak (akar umbi +' + K.puak.akarUmbi + ', AJK ' + K.puak.ajk + ')</button>' +
            (pr === 'bahagian' ? ' <button type="button" class="btn btn--sm btn--ghost" data-umno="ketua" data-pr-umno="bahagian" data-pilih-umno="muda">🌱 Pelapis muda (Belia +' + K.muda.belia + ', AJK +' + K.muda.ajk + ')</button>' : '');
        } else { h += '<p class="note">Lantikan penggal ini: ' + ({ setia: 'penyokong setia', puak: 'wakil semua puak', muda: 'pelapis muda' })[sl.sudah] + '.</p>'; }
      });
      // Lantikan Presiden
      h += '<h3 class="umno-h">Lantikan Presiden (Fasal 9.8.1)</h3>';
      if (M.adalahPresiden(p)) {
        var slp = M.statusLantikPresiden(p);
        if (slp.boleh) {
          h += '<p class="note">Lantik Setiausaha Agung, Bendahari, Ketua Penerangan dan 13 ahli MKT (sekurang-kurangnya 2 Wanita, 1 Pemuda dan 1 Puteri):</p>' +
            '<button type="button" class="btn btn--sm btn--ghost" data-umno="lantik" data-pilih-umno="setia">🤝 Penyokong setia (AJK +4)</button> ' +
            '<button type="button" class="btn btn--sm btn--ghost" data-umno="lantik" data-pilih-umno="pencabar">🕊️ Pencabar dalaman (perwakilan +4, AJK -2)</button>';
        } else { h += '<p class="note">Lantikan penggal ini: ' + (slp.sudah === 'pencabar' ? 'pencabar dalaman' : 'penyokong setia') + '.</p>'; }
        h += '<p class="note">Jika sokongan perwakilan Bahagian anda di bawah ' + C.PAK.sokongan + '%, separuh Bahagian boleh menuntut Perhimpunan Agung Khas untuk melucutkan anda (Fasal 8.5, 9.12).</p>';
      } else {
        var l = M.lantikanSemasa(p);
        h += kv('Kedekatan dengan Presiden', M.dekat(p) + '%');
        if (l) { h += kv('Lantikan anda', esc(l.jawatan) + ' · IP +' + l.ip + ' sebulan'); }
        else {
          h += '<p class="note">Mohon lantikan Presiden. Lantikan memberi IP bulanan dan bonus pemilihan Pusat, dan tamat apabila Presiden baharu dipilih. Peluang ikut kedekatan anda dengan Presiden.</p>';
          C.LANTIKAN.forEach(function (d) {
            var s0 = M.statusMohon(p, d.kod);
            h += '<button type="button" class="btn btn--sm btn--ghost" style="margin:2px 4px 2px 0" data-umno="mohon" data-kod-umno="' + d.kod + '"' + (s0.boleh ? '' : ' disabled title="' + esc(s0.sebab) + '"') + '>' + esc(d.jawatan) + (s0.boleh ? ' (' + C.MOHON.ap + ' AP, ' + s0.peluang + '%)' : '') + '</button>';
          });
          var s1 = M.statusMohon(p, C.LANTIKAN[0].kod); if (!s1.boleh) { h += '<p class="note">' + esc(s1.sebab) + '</p>'; }
        }
      }
      return h + '<p class="note" style="margin-top:8px">Peraturan daripada Perlembagaan UMNO 2025; angka ialah andaian permainan.</p></section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('change', function (ev) {
    var t = ev.target; if (!t || !t.hasAttribute) { return; }
    if (t.hasAttribute('data-umno-bhg')) { pilihBhg = t.value; } else if (t.hasAttribute('data-umno-ng')) { pilihNg = t.value; }
  });
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-umno]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-umno'), r = null;
    if (a === 'jelajah') { var sel = W.document.querySelector('[data-umno-bhg]'); r = M.jelajah(sel ? sel.value : pilihBhg); }
    else if (a === 'penerangan') { var sn = W.document.querySelector('[data-umno-ng]'); r = M.penerangan(sn ? sn.value : pilihNg); }
    else if (a === 'ketua') { r = M.lantikKetua(b.getAttribute('data-pr-umno'), b.getAttribute('data-pilih-umno')); }
    else if (a === 'lantik') { r = M.lantikPresiden(b.getAttribute('data-pilih-umno')); }
    else if (a === 'mohon') { r = M.mohon(b.getAttribute('data-kod-umno')); }
    if (!r) { return; }
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok && r.jaya !== false ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  var st = W.document.createElement('style');
  st.textContent = '.umno-h{font-size:.92rem;margin:12px 0 4px}';
  W.document.head.appendChild(st);
  W.MyPolitikUMNOUI = { kad: kad, banner: banner };
})(window);
