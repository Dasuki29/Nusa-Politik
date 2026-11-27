/* ==========================================================================
   Nusa Politik — js/senat-ui.js   (v14.21, Dewan Negara Fasa 1)
   Kad 🏛️ Senator Dewan Negara (tab Profil › Jawatan) dan panel mod Dewan Negara (tab Dewan).
   ========================================================================== */
(function (W) {
  'use strict';
  var SN = W.MyPolitikSenat, S = W.MyPolitikSave;
  if (!SN) { return; }
  var C = SN.CONFIG;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function UI() { return W.NusaUI || {}; }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('en'); }
  function btn(id, teks, boleh, kelas) { return '<button type="button" class="btn btn--sm' + (kelas ? ' ' + kelas : '') + '" data-sn="' + esc(id) + '"' + (boleh === false ? ' disabled' : '') + '>' + esc(teks) + '</button>'; }
  function act(tajuk, info, b) { return '<div class="prkl-act"><div><b>' + tajuk + '</b><small>' + esc(info) + '</small></div>' + b + '</div>'; }
  function meter(label, n, unit) { return '<div class="jm-meter__t"><span>' + esc(label) + '</span><b>' + n + (unit || '/100') + '</b></div><div class="prkl-bar tyt-bar"><i style="width:' + n + '%"></i></div>'; }
  function lapor(r) { if (r && UI().toast) { UI().toast(r.ok ? r.mesej : r.ralat, r.ok ? (r.berjaya === false ? 'ralat' : 'ok') : 'ralat'); } if (UI().render) { UI().render(); } }

  /** Kad 🏛️ Senator Dewan Negara (sebelum dilantik). */
  function kad(p) {
    try {
      if (!p || p.tamat) { return ''; }
      var k = SN.keadaan(p);
      if (k.aktif) { return '<section class="card sn-kad"><h2 class="card__title" style="margin:0 0 4px">🏛️ Senator Dewan Negara</h2><p class="note">' + esc(k.label) + ' · Penggal ' + k.a.penggal + ' · bulan ' + k.bulanKe + ' daripada ' + C.PENGGAL + '. Tugas Senator di tab Dewan.</p></section>'; }
      var l = SN.laluan(p);
      var h = '<section class="card sn-kad"><h2 class="card__title" style="margin:0 0 4px">🏛️ Senator Dewan Negara</h2>' +
        '<p class="note">' + C.KERUSI + ' kerusi: ' + C.DUN + ' dipilih DUN (2 setiap negeri), ' + C.LANTIK + ' dilantik Agong atas nasihat PM. Penggal 3 tahun, maksimum 2 penggal.</p>' +
        '<ul class="tyt-sy">' + l.syarat.map(function (x) { return '<li class="' + (x.ok ? 'jm-ok' : 'jm-amaran') + '">' + (x.ok ? '✔ ' : '✖ ') + esc(x.teks) + '</li>'; }).join('') + '</ul>';
      h += act('🇲🇾 Lantikan atas nasihat PM', 'Parti dalam kerajaan persekutuan · kekosongan Januari dan Julai · peluang ' + l.pm.peluang + '%' + (l.pm.boleh ? '' : ' · ' + l.pm.sebab),
        btn('mohon:pm', 'Lobi Presiden (' + C.LOBI_PM.ap + ' AP, ' + rm(C.LOBI_PM.myr) + ')', l.pm.boleh, 'btn--gold'));
      h += act('🏞️ Dipilih DUN ' + esc(p.negeri || ''), 'Parti membentuk kerajaan negeri · kekosongan disemak setiap Januari · peluang ' + l.dun.peluang + '%' + (l.dun.boleh ? '' : ' · ' + l.dun.sebab),
        btn('mohon:dun', 'Mohon pencalonan (' + C.LOBI_DUN.ap + ' AP, ' + rm(C.LOBI_DUN.myr) + ')', l.dun.boleh));
      if (k.sejarah && k.sejarah.length) { h += '<p class="note">Rekod: ' + k.sejarah.map(function (x) { return x.dari + '–' + x.hingga + ' (' + x.penggal + ' penggal)'; }).join('; ') + '</p>'; }
      return h + '</section>';
    } catch (e) { return ''; }
  }

  /** Panel mod Dewan Negara (tab Dewan). */
  function panel(p) {
    try {
      var k = SN.keadaan(p); if (!k.aktif) { return ''; }
      var a = k.a, kr = k.kerajaan, ln = C.KERUSI - kr, h = '<section class="card sn-panel">';
      h += '<div class="tyt-ban sn-ban"><b>🏛️ ' + (k.menteri ? esc(k.menteri.portfolio) + ' · Senator' : 'Senator · Dewan Negara') + '</b><small>' + esc(k.label) + ' · Penggal ' + a.penggal + ' · bulan ' + k.bulanKe + ' daripada ' + C.PENGGAL + (a.sumber === 'sbn' ? '' : ' · Elaun ' + rm(C.ELAUN)) + '</small></div>';
      if (k.lobi && k.lobi.boleh) { h += act('🏛️ Lobi Portfolio Kerajaan (Senator)', 'Parti dalam kerajaan · 1 percubaan setiap penggal Senator · peluang 10% lebih rendah (tiada kerusi)', btn('lobi', 'Buka Lobi', true, 'btn--gold')); }
      h += meter('Pengaruh Senat', a.pengaruh) + meter('Hubungan Kerajaan', a.hubungan) + meter('Kehadiran', a.kehadiran, '%');
      h += '<p class="note" style="margin:8px 0 2px">Komposisi Dewan Negara: ' + kr + ' kerajaan · ' + ln + ' lain-lain</p><div class="sn-kerusi"><i style="width:' + Math.round(kr / C.KERUSI * 100) + '%"></i></div>';
      if (a.lanjut) { h += '<div class="tyt-ev sl-ev"><b>📜 Tawaran penggal kedua</b><small>Terima untuk berkhidmat tiga tahun lagi (penggal terakhir), atau tamatkan.</small><div class="pbg-3" style="justify-content:flex-start;margin-top:6px">' + btn('lanjut:ya', 'Terima penggal kedua', true, 'btn--primary') + btn('lanjut:tidak', 'Tamatkan', true) + '</div></div>'; }
      h += '<h3 style="margin:10px 0 4px">📜 RUU dari Dewan Rakyat</h3>';
      if (!a.ruu.length) { h += '<p class="note">Tiada RUU menunggu. Dewan Negara bersidang pada bulan ' + C.SIDANG.join(', ') + ' (Bajet pada bulan ' + C.BAJET + ').</p>'; }
      a.ruu.forEach(function (r) {
        var U = C.UNDI;
        h += '<div class="sn-ruu"><b>' + esc(r.tajuk) + '</b><small>' + (r.wang ? 'RUU Wang · tolak hanya menangguh 1 bulan' : 'Lulus Dewan Rakyat ' + r.undi + '–' + (222 - r.undi) + ' · tolak menangguh 1 tahun') + '</small><div class="sn-opt">' +
          '<button type="button" class="sn-o" data-sn="undi:' + esc(r.id) + ':sokong"><b>✅ Sokong</b>Hubungan Kerajaan +' + (r.wang ? U.sokongWang.hubungan : U.sokong.hubungan) + '</button>' +
          (r.wang ? '' : '<button type="button" class="sn-o" data-sn="undi:' + esc(r.id) + ':pinda"><b>✏️ Cadang pindaan</b>Pengaruh +' + U.pinda.pengaruh + ' · IP +' + U.pinda.ip + ' · Hubungan ' + U.pinda.hubungan + '</button>') +
          '<button type="button" class="sn-o is-r" data-sn="undi:' + esc(r.id) + ':tolak"><b>❌ Tolak</b>Hubungan ' + (r.wang ? U.tolakWang.hubungan : U.tolak.hubungan) + ' · Reputasi ' + (r.popular ? '−2' : '+1') + '</button></div></div>';
      });
      if (a.ruu.length) { h += '<small class="note">RUU yang tidak diundi sebelum bulan depan: Kehadiran ' + C.PONTENG + ' setiap satu.</small>'; }
      var T = C.TUGAS;
      h += '<h3 style="margin:10px 0 4px">🗣️ Tugas bulanan</h3>';
      h += act('Bahas RUU', T.bahas.ap + ' AP · IP +' + T.bahas.ip + ', Pengaruh Senat +' + T.bahas.pengaruh + ' · sekali sebulan', btn('tugas:bahas', 'Bahas', k.boleh.bahas));
      var MT = C.MENTERI;
      if (k.menteri) {
        h += act('Jawab soalan Senator', MT.jawab.ap + ' AP · KPI Portfolio +' + MT.jawab.kpi + ', Pengaruh Senat +' + MT.jawab.pengaruh + ' · sekali sebulan', btn('mtugas:jawab', 'Jawab', k.menteri.jawab));
        h += act('Bentang RUU kementerian di Dewan Negara', MT.bentang.ap + ' AP · KPI Portfolio +' + MT.bentang.kpi + (k.komposisi.ada ? '' : ' (' + Math.round(C.TANGGUH_RUU * 100) + '% ditangguh: kerajaan tanpa majoriti Senat)') + ' · sekali sebulan', btn('mtugas:bentang', 'Bentang', k.menteri.bentang));
      } else {
        h += act('Soalan kepada Menteri', T.soalan.ap + ' AP · Reputasi +' + T.soalan.reputasi + ', Hubungan Kerajaan ' + T.soalan.hubungan + ' · sekali sebulan', btn('tugas:soalan', 'Tanya', k.boleh.soalan));
      }
      h += act('Jawatankuasa Pilihan Khas', T.jk.ap + ' AP · Pengaruh Senat +' + T.jk.pengaruh + ', Kehadiran +' + T.jk.kehadiran + ' · sekali sebulan', btn('tugas:jk', 'Hadir', k.boleh.jk));
      h += '<small class="note"><span>Kehadiran susut ' + C.SUSUT_HADIR + ' sebulan jika tiada tugas dibuat bulan sebelumnya.</span> <span>Untuk bertanding PRU, anda perlu meletak jawatan Senator sebelum penamaan calon (Perkara 49).</span></small>';
      if (k.menteri) { h += '<div class="sn-amaran"><span>⚠️ Jawatan Menteri anda bergantung pada kerusi Senat.</span> <span>Jika penggal Senator tamat tanpa dilantik semula, atau anda meletak jawatan Senator, jawatan Menteri juga tamat.</span></div>'; }
      return h + '</section>';
    } catch (e) { return ''; }
  }

  /** v14.22: tawaran Senator-Menteri selepas PRU (tab Tindakan, keputusan menunggu). */
  function kadTawaran(p) {
    try {
      var x = SN.keadaanPM(p); if (!x.tawaran) { return ''; }
      var tm = x.tawaran.tahap === 'MENTERI_PENUH' ? 'Menteri' : 'Timbalan Menteri';
      return '<section class="card sn-tawaran"><h2 class="card__title" style="margin:0 0 4px">📜 Tawaran Perdana Menteri</h2><p class="note">Anda tidak memegang kerusi Parlimen, tetapi sebagai pemimpin Pusat parti kerajaan, Perdana Menteri menawarkan lantikan sebagai Senator dan jawatan ' + tm + '.</p>' +
        '<div class="sn-opt"><button type="button" class="sn-o" data-sn="tawaran:ya"><b>✅ Terima: Senator + ' + tm + '</b>Penggal Senator 3 tahun · maksimum 2 penggal · elaun Senator dan elaun jawatan</button>' +
        '<button type="button" class="sn-o is-r" data-sn="tawaran:tidak"><b>Tolak</b>Kekal di luar kerajaan · Reputasi +1</button></div></section>';
    } catch (e) { return ''; }
  }
  var pilihKuota = null;
  /** v14.22: kuota Senator lantikan (PM pemain, tab Tindakan › Kerajaan). */
  function kadKuota(p) {
    try {
      var x = SN.keadaanPM(p), q = x.kuota, kp = x.komposisi; if (!x.pm) { return ''; }
      var h = '<section class="card sn-kuota"><h2 class="card__title" style="margin:0 0 4px">🏛️ Kuota Senator Lantikan</h2>';
      h += '<p class="note" style="margin:0 0 2px">Komposisi Dewan Negara: ' + kp.kerajaan + ' kerajaan · ' + kp.lain + ' lain-lain (majoriti ' + kp.majoriti + ').' + (kp.ada ? '' : ' Tanpa majoriti, RUU kerajaan berpeluang ' + Math.round(C.TANGGUH_RUU * 100) + '% ditangguh.') + '</p><div class="sn-kerusi"><i style="width:' + Math.round(kp.kerajaan / C.KERUSI * 100) + '%"></i></div>';
      if (!q) { return h + '<p class="note">Tiada kekosongan sekarang. Kekosongan Senator lantikan dibuka setiap Januari dan Julai.</p></section>'; }
      if (!pilihKuota || pilihKuota.i !== q.i) { pilihKuota = { i: q.i, parti: q.n, rakan: 0, ngo: 0 }; }
      var K = C.KUOTA, jum = pilihKuota.parti + pilihKuota.rakan + pilihKuota.ngo;
      h += '<p class="note">' + q.n + ' kekosongan Senator lantikan. Agihkan sebelum bulan depan.</p>';
      [['parti', 'Parti anda', 'Setiap kerusi: Sokongan perwakilan +' + K.parti], ['rakan', 'Rakan gabungan', 'Setiap kerusi: Hubungan gabungan +' + K.rakan], ['ngo', 'Tokoh masyarakat / NGO', 'Setiap kerusi: Reputasi +' + K.ngo]].forEach(function (r) {
        h += '<div class="sn-q"><div><b>' + r[1] + '</b><small>' + r[2] + '</small></div><div class="sn-st">' + btn('kuota:-:' + r[0], '−', pilihKuota[r[0]] > 0) + '<span>' + pilihKuota[r[0]] + '</span>' + btn('kuota:+:' + r[0], '+', jum < q.n) + '</div></div>';
      });
      return h + '<div style="text-align:right;margin-top:6px">' + btn('kuota:sahkan', 'Sahkan lantikan (' + jum + '/' + q.n + ')', jum === q.n, 'btn--gold') + '</div></section>';
    } catch (e) { return ''; }
  }

  /** Pengesahan sebelum bertanding kerusi Parlimen (dipanggil oleh js/pru-ui.js). Pulang true untuk teruskan. */
  async function sahkanBertanding() {
    var p = S.loadPlayer(); if (!(p && p.senat && p.senat.aktif && p.senat.aktif.sumber !== 'sbn')) { return true; }
    var M = UI().modal; if (!M) { return true; }
    var v = await M({ tajuk: '⚠️ Anda Senator', isi: '<p>Seseorang tidak boleh menjadi ahli kedua-dua Dewan Parlimen (Perkara 49). Untuk bertanding kerusi Parlimen, anda perlu <b>meletak jawatan Senator sebelum penamaan calon</b>. Jika kalah, kerusi Senat tidak dikembalikan.</p>',
      butang: [{ label: 'Kekal Senator', nilai: false }, { label: 'Letak jawatan Senator dan bertanding', nilai: true, kelas: 'btn--gold' }] });
    if (!v) { return false; }
    var r = SN.letakUntukBertanding(); if (UI().toast) { UI().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    return !!r.ok;
  }

  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-sn]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-sn'), x = a.split(':');
    if (x[0] === 'mohon') { lapor(SN.mohon(x[1])); return; }
    if (x[0] === 'undi') { lapor(SN.undi(x[1], x[2])); return; }
    if (x[0] === 'tugas') { lapor(SN.tugas(x[1])); return; }
    if (x[0] === 'lanjut') { lapor(SN.terimaLanjut(x[1] === 'ya')); return; }
    if (x[0] === 'tawaran') { lapor(SN.jawabTawaran(x[1] === 'ya')); return; }
    if (x[0] === 'lobi') { lapor(SN.bukaLobi()); return; }
    if (x[0] === 'mtugas') { lapor(SN.tugasMenteri(x[1])); return; }
    if (x[0] === 'kuota' && pilihKuota) {
      if (x[1] === 'sahkan') { var r = SN.agihKuota(pilihKuota.parti, pilihKuota.rakan, pilihKuota.ngo); if (r.ok) { pilihKuota = null; } lapor(r); return; }
      pilihKuota[x[2]] = Math.max(0, pilihKuota[x[2]] + (x[1] === '+' ? 1 : -1)); if (UI().render) { UI().render(); }
    }
  });
  W.MyPolitikSenatUI = { kad: kad, panel: panel, sahkanBertanding: sahkanBertanding, kadTawaran: kadTawaran, kadKuota: kadKuota };
})(window);
