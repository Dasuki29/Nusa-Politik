/* ==========================================================================
   Nusa Politik — js/mic-ui.js   (v13.3)
   Kad "MIC: Parti & Pusat" di tab Profil (logik dalam js/mic.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikMIC, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Number(n || 0).toLocaleString('en'); }
  function fmt(n) { return Number(n || 0).toLocaleString('en'); }
  function U() { return W.NusaUI || {}; }
  function kv(a, b) { return '<div class="kv"><span>' + a + '</span><b>' + b + '</b></div>'; }
  function meter(label, n, nilai) {
    var w = Math.max(0, Math.min(100, Math.round(n))), warna = w >= 50 ? 'var(--success)' : w >= 35 ? 'var(--warning)' : 'var(--danger)';
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + esc(nilai) + '</b></div><div class="progress progress--sm" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + w + '"><div class="progress__bar" style="width:' + w + '%;background:' + warna + '"></div></div></div>';
  }
  function tahunBulan(b) { return Math.floor(b / 12) + ' tahun ' + (b % 12) + ' bulan'; }
  var pilihBhg = null;
  function kad(p) {
    try {
      if (!M.adalah(p)) { return ''; }
      var k = M.kawasan(p), C = M.CONFIG, m = p.mic || {}, J0 = W.MyPolitikJawatan, kc = !!(J0 && J0.pegang(p, 'ketua_cawangan'));
      var h = '<section class="card mic-kad"><h2 class="card__title" style="margin:0 0 4px">🟢 MIC: Parti &amp; Pusat</h2>';
      if (m.rayuan) {
        h += '<div class="banner banner--warn" role="alert"><strong>Notis ketidakhadiran (Perkara ' + esc(m.rayuan.fasal || '85') + ')</strong><span>Anda tidak hadir 3 mesyuarat berturut-turut. Anda akan dianggap meletak jawatan ' + esc(m.rayuan.jawatan) + ' kecuali memberi penjelasan bulan ini.</span></div>' +
          '<button type="button" class="btn btn--sm btn--primary" data-mic="rayuan">Beri penjelasan (' + C.ABSEN.rayuanAP + ' AP, peluang ' + Math.round(C.ABSEN.rayuanPeluang * 100) + '%)</button>';
      }
      if (M.gantungAktif(p)) {
        h += '<div class="banner banner--warn" role="alert"><strong>Keahlian digantung (Perkara 61)</strong><span>Presiden menggantung keahlian anda. Anda tidak boleh bertanding atau memohon lantikan sehingga tempoh tamat.</span></div>' +
          (m.gantungRayu ? '' : '<button type="button" class="btn btn--sm btn--primary" data-mic="rayuan_gantung">Rayuan ke CWC (' + C.GANTUNG.rayuanAP + ' AP, peluang ' + Math.round(C.GANTUNG.rayuanPeluang * 100) + '%)</button>');
      }
      // Kawasan & kuota
      h += '<h3 class="mic-h">Kawasan &amp; kuota BN</h3>';
      if (k.parlimen) {
        h += kv('Bahagian ' + esc(k.parlimen.n), 'Pengundi India ' + k.parlimen.i + '% · kedudukan ' + k.parlimen.r + '/' + k.bilBahagian) +
          kv('Kerusi Parlimen', k.kuotaPL ? '✅ dalam kuota MIC (' + C.KUOTA_PARLIMEN + ')' : '⛔ di luar kuota MIC (' + C.KUOTA_PARLIMEN + ')') +
          kv('Kerusi DUN', k.dun ? esc(k.dun.n) + ' · ' + (k.kuotaDUN ? '✅ dalam kuota (' + C.KUOTA_DUN + ')' : '⛔ di luar kuota (' + C.KUOTA_DUN + ')') : 'Tiada DUN');
      }
      var seterus = M.tahunSeterusnya(p, p.tahun), kini = M.adalahTahunPemilihan(p, p.tahun);
      h += kv('Pemilihan parti', kini ? '🗳️ Tahun ini (' + p.tahun + ')' : 'Seterusnya ' + seterus + ' (setiap 3 tahun)');
      var wakil = W.MyPolitikPRU && W.MyPolitikPRU.semuaStatus ? W.MyPolitikPRU.semuaStatus(p).length > 0 : false;
      if (wakil) { h += kv('Sumbangan bulanan wakil rakyat', rm(C.SUMBANGAN) + ' (Perkara 94)'); }
      // Tangga kerjaya
      h += '<h3 class="mic-h">Tangga kerjaya</h3>' +
        kv('Pengerusi Cawangan sekarang', kc ? '✅ Ya' : '⛔ Tidak (syarat semua jawatan tinggi)') +
        kv('Tempoh keahlian', tahunBulan(M.bulanKeahlian(p))) +
        kv('Penggal Pengerusi Cawangan', tahunBulan(m.bulanKC || 0) + ' / 9 tahun untuk Presiden') +
        kv('Penggal ahli CWC', tahunBulan(m.bulanCWC || 0) + ' / 6 tahun untuk Presiden');
      if ((m.bulanKB || 0) > 0) { h += kv('Penggal berturut-turut Pengerusi Bahagian', tahunBulan(m.bulanKB) + ' (had 3 penggal, Perkara 34.4)'); }
      // Pegawai Cawangan
      if (kc) {
        var sp = M.statusPegawai(p);
        h += '<h3 class="mic-h">Pegawai Cawangan anda</h3>';
        if (sp.boleh) {
          h += '<p class="note">Sebagai Pengerusi Cawangan, anda melantik Setiausaha, Penolong Setiausaha, Bendahari dan Pegawai Penerangan daripada 7 AJK (Perkara 20.2.2a). Mereka mengundi dalam pemilihan Presiden.</p>' +
            '<button type="button" class="btn btn--sm btn--ghost" data-mic="pegawai" data-pilih-mic="setia">🤝 Penyokong setia (Bahagian +' + C.PEGAWAI.setia.pusat + '%, AJK ' + C.PEGAWAI.setia.ajk + ')</button> ' +
            '<button type="button" class="btn btn--sm btn--ghost" data-mic="pegawai" data-pilih-mic="pencabar">🕊️ Pencabar dalaman (AJK +' + C.PEGAWAI.pencabar.ajk + ')</button>';
        } else { h += '<p class="note">Pegawai Cawangan penggal ini: ' + (sp.sudah === 'pencabar' ? 'pencabar dalaman' : 'penyokong setia') + '.</p>'; }
      }
      // Pemilihan Pusat
      var r = M.ringkasPusat(p), sj = M.statusJelajah(p), pn = M.penamaan(p);
      h += '<h3 class="mic-h">Pemilihan Pusat: pegawai Cawangan</h3><p class="note">Presiden dipilih oleh 6 pegawai dan 4 ketua sayap setiap Cawangan serta ahli CWC (Perkara 58.2). Calon Presiden perlu 250 penamaan daripada Pengerusi Cawangan atau ahli CWC (Perkara 58.8).</p>' +
        meter('Sokongan pegawai Cawangan', r.purata, fmt(r.sokongUndi) + ' / ' + fmt(r.pengundi)) + meter('Penamaan Presiden', pn / C.PRESIDEN.penamaan * 100, pn + ' / ' + C.PRESIDEN.penamaan) + kv('Bahagian condong kepada anda', r.condong + ' / ' + r.bilBahagian);
      if (!pilihBhg || !r.senarai.some(function (x) { return x.kod === pilihBhg; })) { pilihBhg = r.senarai[0] && r.senarai[0].kod; }
      h += '<label class="note" for="mic-bhg">Bahagian untuk rangkaian</label><select id="mic-bhg" class="select" style="width:100%;margin:4px 0 6px" data-mic-bhg>' +
        r.senarai.map(function (x) { return '<option value="' + esc(x.kod) + '"' + (x.kod === pilihBhg ? ' selected' : '') + '>' + esc(x.nama) + ' · ' + x.sokongan + '% · ' + x.cawangan + ' Cawangan</option>'; }).join('') + '</select>' +
        '<button type="button" class="btn btn--sm btn--ghost" data-mic="jelajah"' + (sj.boleh ? '' : ' disabled') + '>🤝 Rangkaian Pengerusi Cawangan (' + C.PUSAT.jelajahAP + ' AP, ' + rm(C.PUSAT.jelajahMYR) + ', +' + C.PUSAT.jelajahNaik + '%)</button>' + (sj.boleh ? '' : ' <small class="note">' + esc(sj.sebab) + '</small>');
      // Kongres Negeri
      var sn = M.statusNegeri(p);
      h += '<h3 class="mic-h">Kongres Negeri</h3><p class="note">10 ahli Kongres Negeri dipilih oleh pegawai Cawangan negeri (Perkara 42.3A). Presiden melantik Pengerusi Negeri daripada 10 ahli itu (Perkara 42.3), dan Pengerusi Negeri menjadi ahli CWC.</p>' +
        meter('Sokongan pegawai Cawangan di negeri anda', M.sokonganNegeri(p), Math.round(M.sokonganNegeri(p)) + '%');
      if (sn.ahli) { h += kv('Status', '✅ Ahli Kongres Negeri'); }
      else { h += '<button type="button" class="btn btn--sm btn--ghost" data-mic="negeri"' + (sn.boleh ? '' : ' disabled') + '>🗳️ Bertanding Kongres Negeri (' + C.NEGERI.ap + ' AP' + (sn.boleh ? ', peluang ' + sn.peluang + '%' : '') + ')</button>' + (sn.boleh ? '' : ' <small class="note">' + esc(sn.sebab) + '</small>'); }
      // Lantikan
      h += '<h3 class="mic-h">Lantikan Presiden</h3>';
      if (M.adalahPresiden(p)) {
        var sl = M.statusLantikPresiden(p), bulanP = typeof (p.mic || {}).presidenSejak === 'number' ? (p.tahun * 12 + p.bulan) - p.mic.presidenSejak : 0;
        h += kv('Had penggal Presiden (Perkara 58.2A)', Math.max(0, Math.ceil((C.HAD_PRESIDEN_BULAN - bulanP) / 12)) + ' tahun lagi daripada 9');
        if (sl.boleh) {
          h += '<p class="note">Sebagai Presiden, anda melantik Setiausaha Agung (Perkara 49) dan 13 Pengerusi Negeri (Perkara 42.3). Pilih untuk penggal ini:</p>' +
            '<button type="button" class="btn btn--sm btn--ghost" data-mic="lantik" data-pilih-mic="setia">🤝 Penyokong setia (AJK +4)</button> ' +
            '<button type="button" class="btn btn--sm btn--ghost" data-mic="lantik" data-pilih-mic="pencabar">🕊️ Pencabar dalaman (perwakilan +4, AJK -2)</button>';
        } else { h += '<p class="note">Lantikan penggal ini: ' + (sl.sudah === 'pencabar' ? 'pencabar dalaman' : 'penyokong setia') + '.</p>'; }
      } else {
        var l = M.lantikanSemasa(p);
        h += kv('Kedekatan dengan Presiden', M.dekat(p) + '%');
        if (l) { h += kv('Lantikan anda', esc(l.jawatan) + ' · IP +' + l.ip + ' sebulan'); }
        else {
          h += '<p class="note">Presiden melantik Setiausaha Agung, Bendahari Agung dan Ketua Penerangan daripada CWC (Perkara 49), sehingga 9 ahli CWC (Perkara 46.15) dan Pengerusi Negeri (Perkara 42.3). Peluang ikut kedekatan anda dengan Presiden.</p>';
          C.LANTIKAN.forEach(function (d) {
            var s0 = M.statusMohon(p, d.kod);
            h += '<button type="button" class="btn btn--sm btn--ghost" style="margin:2px 4px 2px 0" data-mic="mohon" data-kod-mic="' + d.kod + '"' + (s0.boleh ? '' : ' disabled title="' + esc(s0.sebab) + '"') + '>' + esc(d.jawatan) + (s0.boleh ? ' (' + C.MOHON.ap + ' AP, ' + s0.peluang + '%)' : '') + '</button>';
          });
          var s1 = M.statusMohon(p, C.LANTIKAN[3].kod); if (!s1.boleh) { h += '<p class="note">' + esc(s1.sebab) + '</p>'; }
        }
      }
      return h + '<p class="note" style="margin-top:8px">Peraturan daripada Perlembagaan MIC; angka ialah andaian permainan. Tidak hadir 3 bulan tanpa sebarang tindakan dikira tidak hadir 3 mesyuarat (Perkara 37.4, 85). Yuran RM ' + C.YURAN.rm + ' setahun dipotong pada bulan ' + C.YURAN.bulan + '.</p></section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('change', function (ev) { var t = ev.target; if (t && t.hasAttribute && t.hasAttribute('data-mic-bhg')) { pilihBhg = t.value; } });
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-mic]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-mic'), r = null;
    if (a === 'jelajah') { var sel = W.document.querySelector('[data-mic-bhg]'); r = M.jelajah(sel ? sel.value : pilihBhg); }
    else if (a === 'mohon') { r = M.mohon(b.getAttribute('data-kod-mic')); }
    else if (a === 'lantik') { r = M.lantikPresiden(b.getAttribute('data-pilih-mic')); }
    else if (a === 'pegawai') { r = M.lantikPegawai(b.getAttribute('data-pilih-mic')); }
    else if (a === 'negeri') { r = M.bertandingNegeri(); }
    else if (a === 'rayuan') { r = M.rayuan(); }
    else if (a === 'rayuan_gantung') { r = M.rayuanGantung(); }
    if (!r) { return; }
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok && r.jaya !== false ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  var st = W.document.createElement('style');
  st.textContent = '.mic-h{font-size:.92rem;margin:12px 0 4px}';
  W.document.head.appendChild(st);
  W.MyPolitikMICUI = { kad: kad };
})(window);
