/* ==========================================================================
   Nusa Politik — js/mca-ui.js   (v13.1)
   Kad "MCA: Parti & Pusat" di tab Profil (logik dalam js/mca.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikMCA, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Number(n || 0).toLocaleString('en'); }
  function U() { return W.NusaUI || {}; }
  function kv(a, b) { return '<div class="kv"><span>' + a + '</span><b>' + b + '</b></div>'; }
  function meter(label, n, nilai) {
    var w = Math.max(0, Math.min(100, Math.round(n))), warna = w >= 50 ? 'var(--success)' : w >= 35 ? 'var(--warning)' : 'var(--danger)';
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + esc(nilai) + '</b></div><div class="progress progress--sm" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + w + '"><div class="progress__bar" style="width:' + w + '%;background:' + warna + '"></div></div></div>';
  }
  var pilihBhg = null;
  function kad(p) {
    try {
      if (!M.adalah(p)) { return ''; }
      var k = M.kawasan(p), C = M.CONFIG, m = p.mca || {}, h = '<section class="card mca-kad"><h2 class="card__title" style="margin:0 0 4px">⭐ MCA: Parti &amp; Pusat</h2>';
      if (m.rayuan) {
        h += '<div class="banner banner--warn" role="alert"><strong>Notis ketidakhadiran (Perkara 157)</strong><span>Anda tidak hadir 3 mesyuarat jawatankuasa berturut-turut. Anda akan hilang kerusi ' + esc(m.rayuan.jawatan) + ' kecuali merayu bulan ini.</span></div>' +
          '<button type="button" class="btn btn--sm btn--primary" data-mca="rayuan">Rayuan (' + C.ABSEN.rayuanAP + ' AP, peluang ' + Math.round(C.ABSEN.rayuanPeluang * 100) + '%)</button>';
      }
      h += '<h3 class="mca-h">Kawasan &amp; kuota BN</h3>';
      if (k.parlimen) {
        h += kv('Bahagian ' + esc(k.parlimen.n), 'Pengundi Cina ' + k.parlimen.c + '% · kedudukan ' + k.parlimen.r + '/' + k.bilBahagian) +
          kv('Kerusi Parlimen', k.kuotaPL ? '✅ dalam kuota MCA (' + C.KUOTA_PARLIMEN + ')' : '⛔ di luar kuota MCA (' + C.KUOTA_PARLIMEN + ')') +
          kv('Kerusi DUN', k.dun ? esc(k.dun.n) + ' · ' + (k.kuotaDUN ? '✅ dalam kuota (' + C.KUOTA_DUN + ')' : '⛔ di luar kuota (' + C.KUOTA_DUN + ')') : 'Tiada DUN');
      }
      var seterus = M.tahunSeterusnya(p, p.tahun), kini = M.adalahTahunPemilihan(p, p.tahun);
      h += kv('Pemilihan parti', kini ? '🗳️ Tahun ini (' + p.tahun + ')' : 'Seterusnya ' + seterus + ' (selepas PRU; Perkara 167)');
      var bk = M.bulanKeahlian(p);
      h += kv('Tempoh keahlian', Math.floor(bk / 12) + ' tahun ' + (bk % 12) + ' bulan' + (M.cukupKeahlian(p) ? ' ✅' : ' (perlu 3 tahun untuk bertanding)'));
      var wakil = W.MyPolitikPRU && W.MyPolitikPRU.semuaStatus ? W.MyPolitikPRU.semuaStatus(p).length > 0 : false;
      if (wakil) { h += kv('Sumbangan bulanan wakil rakyat', rm(C.SUMBANGAN) + ' (Perkara 142)'); }
      // Pemilihan Pusat
      var r = M.ringkasPusat(p), sj = M.statusJelajah(p);
      h += '<h3 class="mca-h">Pemilihan Pusat: perwakilan Bahagian</h3><p class="note">Presiden, Timbalan Presiden, 4 Naib Presiden dan 25 ahli JKP dipilih oleh perwakilan ke Perhimpunan Bahagian di seluruh negara (Perkara 21).</p>' +
        meter('Sokongan perwakilan Bahagian', r.purata, r.sokongUndi + ' / ' + r.pengundi) + kv('Bahagian condong kepada anda', r.condong + ' / ' + r.bilBahagian);
      if (!pilihBhg || !r.senarai.some(function (x) { return x.kod === pilihBhg; })) { pilihBhg = r.senarai[0] && r.senarai[0].kod; }
      h += '<label class="note" for="mca-bhg">Bahagian untuk dijelajah</label><select id="mca-bhg" class="select" style="width:100%;margin:4px 0 6px" data-mca-bhg>' +
        r.senarai.map(function (x) { return '<option value="' + esc(x.kod) + '"' + (x.kod === pilihBhg ? ' selected' : '') + '>' + esc(x.nama) + ' · ' + x.sokongan + '%</option>'; }).join('') + '</select>' +
        '<button type="button" class="btn btn--sm btn--ghost" data-mca="jelajah"' + (sj.boleh ? '' : ' disabled') + '>🚗 Jelajah Bahagian (' + C.PUSAT.jelajahAP + ' AP, ' + rm(C.PUSAT.jelajahMYR) + ', +' + C.PUSAT.jelajahNaik + '%)</button>' + (sj.boleh ? '' : ' <small class="note">' + esc(sj.sebab) + '</small>');
      // Lantikan
      h += '<h3 class="mca-h">Lantikan Presiden</h3>';
      if (M.adalahPresiden(p)) {
        var sl = M.statusLantikPresiden(p), bulanP = typeof m.presidenSejak === 'number' ? (p.tahun * 12 + p.bulan) - m.presidenSejak : 0;
        h += kv('Had penggal Presiden (Perkara 21A)', Math.max(0, Math.ceil((C.HAD_PRESIDEN_BULAN - bulanP) / 12)) + ' tahun lagi daripada 9');
        if (sl.boleh) {
          h += '<p class="note">Sebagai Presiden, anda melantik Setiausaha Agung (Perkara 22). Pilih untuk penggal ini:</p>' +
            '<button type="button" class="btn btn--sm btn--ghost" data-mca="lantik" data-pilih-mca="setia">🤝 Penyokong setia (AJK +4)</button> ' +
            '<button type="button" class="btn btn--sm btn--ghost" data-mca="lantik" data-pilih-mca="pencabar">🕊️ Pencabar dalaman (perwakilan +4, AJK -2)</button>';
        } else { h += '<p class="note">Setiausaha Agung penggal ini: ' + (sl.sudah === 'pencabar' ? 'pencabar dalaman' : 'penyokong setia') + '.</p>'; }
      } else {
        var l = M.lantikanSemasa(p);
        h += kv('Kedekatan dengan Presiden', M.dekat(p) + '%');
        if (l) { h += kv('Lantikan anda', esc(l.jawatan) + ' · IP +' + l.ip + ' sebulan'); }
        else {
          h += '<p class="note">Presiden melantik Setiausaha Agung, Bendahari Agung, Setiausaha Organisasi Kebangsaan dan sehingga 8 ahli JKP (Perkara 22, 22A, 38.11). Peluang ikut kedekatan anda dengan Presiden.</p>';
          C.LANTIKAN.forEach(function (d) {
            var s0 = M.statusMohon(p, d.kod);
            h += '<button type="button" class="btn btn--sm btn--ghost" style="margin:2px 4px 2px 0" data-mca="mohon" data-kod-mca="' + d.kod + '"' + (s0.boleh ? '' : ' disabled title="' + esc(s0.sebab) + '"') + '>' + esc(d.jawatan) + (s0.boleh ? ' (' + C.MOHON.ap + ' AP, ' + s0.peluang + '%)' : '') + '</button>';
          });
          var s1 = M.statusMohon(p, C.LANTIKAN[0].kod); if (!s1.boleh) { h += '<p class="note">' + esc(s1.sebab) + '</p>'; }
        }
      }
      return h + '<p class="note" style="margin-top:8px">Peraturan daripada Perlembagaan MCA; angka ialah andaian permainan. Tidak hadir 3 bulan tanpa sebarang tindakan dikira tidak hadir 3 mesyuarat (Perkara 157).</p></section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('change', function (ev) { var t = ev.target; if (t && t.hasAttribute && t.hasAttribute('data-mca-bhg')) { pilihBhg = t.value; } });
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-mca]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-mca'), r = null;
    if (a === 'jelajah') { var sel = W.document.querySelector('[data-mca-bhg]'); r = M.jelajah(sel ? sel.value : pilihBhg); }
    else if (a === 'mohon') { r = M.mohon(b.getAttribute('data-kod-mca')); }
    else if (a === 'lantik') { r = M.lantikPresiden(b.getAttribute('data-pilih-mca')); }
    else if (a === 'rayuan') { r = M.rayuan(); }
    if (!r) { return; }
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok && r.jaya !== false ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  var st = W.document.createElement('style');
  st.textContent = '.mca-h{font-size:.92rem;margin:12px 0 4px}';
  W.document.head.appendChild(st);
  W.MyPolitikMCAUI = { kad: kad };
})(window);
