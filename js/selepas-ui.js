/* ==========================================================================
   Nusa Politik — js/selepas-ui.js   (v14.6, maklum balas baris 47, mockup dipersetujui)
   Modal "Bersara daripada Politik?" (3 laluan), kad 🌅 Selepas Politik (tab Profil) dan tab 🌏 Kedutaan.
   Logik dalam js/selepas.js dan js/duta.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var SL = W.MyPolitikSelepas, D = W.MyPolitikDuta, S = W.MyPolitikSave;
  if (!SL || !D || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function UI() { return W.NusaUI || {}; }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('en'); }
  function btn(id, teks, boleh, kelas) { return '<button type="button" class="btn btn--sm' + (kelas ? ' ' + kelas : '') + '" data-sl="' + id + '"' + (boleh === false ? ' disabled' : '') + '>' + esc(teks) + '</button>'; }
  function act(tajuk, info, b) { return '<div class="prkl-act"><div><b>' + tajuk + '</b><small>' + esc(info) + '</small></div>' + b + '</div>'; }
  function meter(label, n) { return '<div class="jm-meter__t"><span>' + esc(label) + '</span><b>' + n + '/100</b></div><div class="prkl-bar tyt-bar"><i style="width:' + n + '%"></i></div>'; }
  function senarai(item) { return '<ul class="tyt-sy">' + item.map(function (x) { return '<li class="' + (x.ok ? 'jm-ok' : 'jm-amaran') + '">' + (x.ok ? '✔ ' : '✖ ') + esc(x.teks) + '</li>'; }).join('') + '</ul>'; }
  function lapor(r) { if (r && UI().toast) { UI().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); } if (UI().render) { UI().render(); } }

  /** Isi modal / kad: tiga laluan dengan syarat. */
  function isiPilihan(p, pl, tanpaPenuh) {
    var h = '';
    if (!tanpaPenuh) { h += '<div class="sl-pil"><b>🏠 Bersara sepenuhnya</b><small>Rumusan kerjaya dan gelaran. Permainan tamat dan tidak boleh diteruskan.</small></div>'; }
    h += '<div class="sl-pil' + (pl.tyt.boleh ? ' is-on' : '') + '"><b>🏰 Yang di-Pertua Negeri</b>' +
      (pl.tyt.kosong ? '<small>Kekosongan terdekat: ' + esc(pl.tyt.kosong.nama) + ', Januari ' + pl.tyt.kosong.kosong + ' · peluang tawaran ± ' + Math.round(pl.tyt.peluang * 100) + '%</small>' : '') +
      senarai(pl.tyt.item) + '<small>Sementara menunggu: semua jawatan dilepaskan dan anda boleh melangkau bulan hingga Januari. Jika tiada tawaran, pilih semula Duta / Pesuruhjaya Tinggi atau bersara.</small></div>';
    h += '<div class="sl-pil' + (pl.duta.boleh ? ' is-on' : '') + '"><b>🌏 Duta / Pesuruhjaya Tinggi Malaysia ke luar negara</b><small>Lantikan politik oleh Perdana Menteri (penggal 3 tahun, elaun ' + rm(D.CONFIG.ELAUN) + ' sebulan). Keahlian parti digantung.</small>' + senarai(pl.duta.item) + '</div>';
    return h;
  }
  /** Modal pilih pos Duta. */
  async function pilihPos(pl) {
    var M = UI().modal; if (!M) { return null; }
    var isi = '<p class="note">Wisma Putra menawarkan ' + pl.duta.pos.length + ' pos (bergantung pada Reputasi).</p>' + pl.duta.pos.map(function (x) {
      return '<div class="sl-pil"><b>' + x.bendera + ' ' + esc(x.bandar) + ' (' + esc(x.negara) + ')</b><small>' + esc(D.gelaran ? D.gelaran(x) : 'Duta Malaysia') + ' · ' + esc(x.isu) + ' · ' + esc(x.tahap) + '</small></div>'; }).join('') + '<small class="note">Negara Komanwel (Singapura, United Kingdom, Australia): gelaran Pesuruhjaya Tinggi dan pejabat Suruhanjaya Tinggi.</small>';
    return M({ tajuk: '🌏 Pilih Pos Perwakilan', isi: isi, butang: [{ label: 'Batal', nilai: null }].concat(pl.duta.pos.map(function (x) { return { label: x.bendera + ' ' + x.bandar, nilai: x.kod, kelas: 'btn--gold' }; })) });
  }
  /** Aliran butang Bersara (dipanggil oleh js/app.js). */
  async function bersara() {
    var M = UI().modal, p = S.loadPlayer(); if (!M || !p || p.tamat) { return; }
    var pl = SL.pilihan(p), umur = W.MyPolitikHayat ? W.MyPolitikHayat.umurSemasa(p) : '';
    var butang = [{ label: 'Batal', nilai: null }, { label: '🏠 Bersara sepenuhnya', nilai: 'penuh' }];
    if (pl.tyt.boleh) { butang.push({ label: '🏰 Yang di-Pertua Negeri', nilai: 'tyt', kelas: 'btn--gold' }); }
    if (pl.duta.boleh) { butang.push({ label: '🌏 Duta Malaysia', nilai: 'duta', kelas: 'btn--gold' }); }
    var pilih = await M({ tajuk: 'Bersara daripada Politik?', isi: '<p>Usia ' + esc(umur) + ' tahun. Pilih laluan selepas politik:</p>' + isiPilihan(p, pl), butang: butang });
    await jalan(pilih, pl);
  }
  async function jalan(pilih, pl) {
    var M = UI().modal;
    if (pilih === 'penuh') {
      var ya = await M({ tajuk: 'Bersara Sepenuhnya?', isi: '<p>Permainan ini tidak boleh diteruskan selepas bersara. Anda boleh memulakan kerjaya baharu dari umur 18.</p>', butang: [{ label: 'Batal', nilai: false }, { label: 'Ya, Bersara', nilai: true, kelas: 'btn--gold' }] });
      if (ya) { var r = SL.bersara(); if (!r.ok) { lapor(r); } else if (UI().render) { UI().render(); } }
    } else if (pilih === 'tyt') { lapor(SL.pilihTYT()); if (UI().gotoTab) { UI().gotoTab('profil'); } }
    else if (pilih === 'duta') {
      var kod = await pilihPos(pl); if (!kod) { return; }
      var h = SL.pilihDuta(kod); lapor(h); if (h.ok && UI().gotoTab) { setTimeout(function () { UI().gotoTab('kedutaan'); }, 50); }
    }
  }
  /** Langkau bulan semasa menunggu kekosongan TYT (tanpa modal bulanan). */
  async function langkau() {
    var K = W.MyPolitikCalendar, n = 0, p = S.loadPlayer(), sas = SL.sasaranLangkau(p); if (!K || !K.majuBulan || !sas) { return; }
    while (n < 24) {
      p = S.loadPlayer(); if (!p || p.tamat || SL.idx(p) >= sas || (p.tyt && (p.tyt.tawaran || p.tyt.aktif)) || !SL.sasaranLangkau(p)) { break; }
      var r = K.majuBulan(); n++; if (!r.ok) { lapor({ ok: false, ralat: r.ralat }); return; }
      if (r.profil && r.profil.tamat) { break; }
    }
    p = S.loadPlayer();
    var msg = p && p.tyt && p.tyt.tawaran ? 'Tawaran Istana diterima: lihat kad Laluan Yang di-Pertua Negeri.' : p && p.selepas && p.selepas.limbo ? 'Laluan Yang di-Pertua Negeri tidak berjaya. Pilih Duta Malaysia (jika layak) atau bersara sepenuhnya di kad Selepas Politik (tab Profil).' : 'Masa berlalu ' + n + ' bulan.';
    lapor({ ok: true, mesej: msg });
  }

  /** Kad tab Profil: menunggu TYT atau limbo (pilih semula). */
  function kad(p) {
    try {
      var sl = SL.getSL(p); if (p.tamat || (sl.jalur !== 'tyt' && !sl.limbo)) { return ''; }
      var h = '<section class="card sl-kad"><h2 class="card__title" style="margin:0 0 4px">🌅 Selepas Politik</h2>';
      if (sl.jalur === 'tyt') {
        var TY = W.MyPolitikTYT, nm = TY && TY.NEGERI[sl.negeri] ? TY.NEGERI[sl.negeri].nama : sl.negeri;
        h += '<p class="note">Anda sudah bersara daripada politik dan menunggu kekosongan Yang di-Pertua Negeri ' + esc(nm) + ' (Januari ' + sl.kosong + ').</p>';
        h += p.tyt && p.tyt.tawaran ? '<p class="note">Tawaran Istana sudah diterima: jawab di kad Laluan Yang di-Pertua Negeri.</p>' : btn('langkau', '⏩ Langkau ke Januari ' + sl.kosong, true, 'btn--primary');
      } else {
        var pl = SL.pilihan(p);
        h += '<p class="note">Pilih laluan seterusnya.</p>' + isiPilihan(p, pl, true) + '<div class="pbg-3" style="justify-content:flex-start;margin-top:6px">' +
          (pl.tyt.boleh ? btn('pilih:tyt', '🏰 Yang di-Pertua Negeri', true, 'btn--primary') : '') + (pl.duta.boleh ? btn('pilih:duta', '🌏 Duta Malaysia', true, 'btn--primary') : '') + btn('pilih:penuh', '🏠 Bersara sepenuhnya', true) + '</div>';
      }
      return h + '</section>';
    } catch (e) { return ''; }
  }
  /** Tab 🌏 Kedutaan. */
  function panel(p) {
    try {
      var k = D.keadaan(p); if (!k.aktif) { return '<div class="banner"><strong>Kedutaan</strong>Tab ini terbuka apabila anda menjadi Duta Malaysia atau Pesuruhjaya Tinggi Malaysia.</div>'; }
      var a = k.a, pos = k.pos, C = D.CONFIG, h = '<section class="card sl-kedutaan">';
      h += '<div class="tyt-ban sl-ban"><b>' + pos.bendera + ' ' + esc(k.kehormat || 'Tuan Yang Terutama') + ' ' + esc(k.gelaran || 'Duta Malaysia') + ' ke ' + esc(pos.negara) + '</b><small>' + esc(pos.bandar) + ' · Penggal ' + a.penggal + ' · ' + a.tahunMula + '– · bulan ' + k.bulanKe + ' daripada ' + C.PENGGAL + '</small></div>';
      h += '<div class="jm-meter__t"><span>Elaun bulanan</span><b>' + rm(C.ELAUN) + '</b></div>' + meter('Hubungan Dua Hala', a.hubungan) + meter('Kepercayaan Wisma Putra', a.kepercayaan) + meter('Kebajikan Rakyat Malaysia', a.kebajikan);
      h += '<small class="note">Setiap meter susut 1 sebulan. Tamat penggal: Hubungan dan Kepercayaan ' + C.LANJUT + ' ke atas = penggal kedua ditawarkan (sekali sahaja).</small>';
      if (a.lanjut) { h += '<div class="tyt-ev sl-ev"><b>📜 Tawaran penggal kedua</b><small>Terima untuk berkhidmat tiga tahun lagi, atau tamatkan perkhidmatan.</small><div class="pbg-3" style="justify-content:flex-start;margin-top:6px">' + btn('lanjut:ya', 'Terima penggal kedua', true, 'btn--primary') + btn('lanjut:tidak', 'Tamatkan', true) + '</div></div>'; }
      if (a.krisis) { h += '<div class="tyt-ev sl-ev"><b>⚠️ Krisis konsular</b><small>' + a.krisis.bil + ' rakyat Malaysia ditahan di ' + esc(pos.negara) + '. Rundingan senyap: Hubungan +4, Kebajikan −3. Kenyataan media: Kebajikan +6, Hubungan −6. Dibiarkan hingga bulan depan: Kebajikan −8, Kepercayaan −4.</small><div class="pbg-3" style="justify-content:flex-start;margin-top:6px">' + btn('krisis:senyap', 'Rundingan senyap', true, 'btn--primary') + btn('krisis:media', 'Kenyataan media', true) + '</div></div>'; }
      h += '<h3 style="margin:10px 0 4px">📋 Tugas ' + esc(k.pejabat || 'Kedutaan') + '</h3><p class="note">Isu utama: ' + esc(pos.isu) + '.</p>';
      h += act('🤝 Kunjungan hormat', C.KUNJUNGAN.ap + ' AP · bulanan · Hubungan +' + C.KUNJUNGAN.hubungan, btn('t:kunjungan', 'Kunjungi', k.boleh.kunjungan));
      h += act('📈 Misi perdagangan', C.DAGANG.ap + ' AP, ' + rm(C.DAGANG.myr) + ' · bulanan · Hubungan +' + C.DAGANG.hubungan + ', Kepercayaan +' + C.DAGANG.kepercayaan, btn('t:dagang', 'Anjurkan', k.boleh.dagang));
      h += act('🛂 Bantuan konsular', C.KONSULAR.ap + ' AP · bulanan · Kebajikan +' + C.KONSULAR.kebajikan, btn('t:konsular', 'Bantu', k.boleh.konsular));
      h += act('🎉 Majlis Hari Kebangsaan', C.HARI.ap + ' AP · Ogos sahaja · semua meter +' + C.HARI.semua, btn('t:hari', 'Adakan', k.boleh.hari));
      return h + '</section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-sl]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-sl');
    if (a === 'langkau') { langkau(); return; }
    if (a.indexOf('pilih:') === 0) { jalan(a.slice(6), SL.pilihan(S.loadPlayer())); return; }
    if (a.indexOf('t:') === 0) { lapor(D.tindak(a.slice(2))); return; }
    if (a.indexOf('krisis:') === 0) { lapor(D.krisis(a.slice(7))); return; }
    if (a.indexOf('lanjut:') === 0) { lapor(D.terimaLanjut(a.slice(7) === 'ya')); }
  });
  W.MyPolitikSelepasUI = { bersara: bersara, kad: kad, panel: panel, langkau: langkau };
})(window);
