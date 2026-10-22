/* ==========================================================================
   Nusa Politik — js/pru-ui.js   (v7.3 / v7.4)
   UI Dashboard bagi Sistem PRU/PRN (js/pru.js) dan Kabinet & EXCO (js/kabinet.js):
     - kad status PRU, Dashboard Kempen 14 hari (Tindakan / Final Push / kejutan), kad Janji Manifesto,
       kad Pentadbiran (Tadbir Urus), lencana ADUN / MP / EXCO / Menteri;
     - modal: Pengisytiharan & Pencalonan, Rundingan Kerusi, Manifesto (3 janji) & Peruntukan, Kejutan, Keputusan,
       Lobi Portfolio, Acara Pentadbiran.
   Bergantung pada W.NusaUI (modal, toast, render, esc, fmt) yang didedahkan oleh js/app.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var PRU = W.MyPolitikPRU, KB = W.MyPolitikKabinet, S = W.MyPolitikSave;
  if (!PRU || !S) { return; }
  var BULAN = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  var sibuk = false;
  var PK = W.MyPolitikPRK;

  function U() { return W.NusaUI; }
  function esc(s) { return U() ? U().esc(s) : String(s); }
  function fmt(n) { return Number(n || 0).toLocaleString('ms-MY'); }
  function modal(o) { return U().modal(o); }
  function toast(t, j) { if (U()) { U().toast(t, j); } }
  function segarkan() { if (U()) { U().render(); } }
  function tanda(n) { return (n > 0 ? '+' : '') + n; }

  var CSS = '' +
    '.pru-hari{display:flex;gap:3px;margin:6px 0 10px}.pru-hari i{flex:1;height:14px;border:2px solid var(--garis,var(--border));border-radius:2px;background:var(--bg-elev-1)}' +
    '.pru-hari i.d{background:var(--red)}.pru-hari i.n{background:var(--gold)}.pru-hari i.f{border-style:dashed}' +
    '.pru-pecah{display:flex;height:26px;border:2px solid var(--garis,var(--border));border-radius:4px;overflow:hidden;margin:6px 0}' +
    '.pru-pecah div{display:grid;place-items:center;color:#fff;font-size:.72rem;font-weight:800;min-width:0;white-space:nowrap;overflow:hidden}' +
    '.pru-pecah .anda{background:#14994F}.pru-pecah .lawan{background:#C8102E}.pru-pecah .rakan{background:#555}' +
    '.pru-log{margin:8px 0 0;padding:0;list-style:none;font-size:.8rem}.pru-log li{border-left:4px solid var(--garis,var(--border));padding-left:8px;margin:4px 0;color:var(--text-muted)}' +
    '.pru-final{background:var(--red);color:#fff;border:2px solid var(--garis,#111);padding:6px 10px;font-weight:900;font-size:.8rem;text-transform:uppercase;margin:10px 0 8px;text-align:center}' +
    '.pru-menang{background:#14994F;color:#fff;border:3px solid var(--garis,#111);padding:10px;text-align:center;font-weight:900;font-size:1.1rem;text-transform:uppercase;margin-bottom:8px}' +
    '.pru-nas{display:flex;height:28px;border:2px solid var(--garis,var(--border));border-radius:6px;overflow:hidden;margin:8px 0}.pru-nas div{display:grid;place-items:center;color:#fff;font-size:.72rem;font-weight:800;min-width:0;white-space:nowrap;overflow:hidden}' +
    '.pru-nas .p{background:#C8102E}.pru-nas .r{background:#2B6CB0}.pru-nas .b{background:#555}' +
    '.pru-kalah{background:#555}.pru-ok{color:#14994F;font-weight:800}.pru-ng{color:#D3162F;font-weight:800}' +
    '.pru-jns{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0}.pru-pilih{display:grid;gap:8px;margin:8px 0}' +
    '.pru-pilih label{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border:2px solid var(--garis,var(--border));border-radius:6px;cursor:pointer;background:var(--bg-elev-2)}' +
    '.pru-pilih label small{display:block;color:var(--text-muted)}.pru-pilih input{margin-top:3px;accent-color:var(--red)}';
  (function () { var s = W.document.createElement('style'); s.textContent = CSS; W.document.head.appendChild(s); })();

  function bar(label, nilai, bahaya, teks) {
    nilai = Math.max(0, Math.min(100, Math.round(nilai)));
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + esc(teks || (nilai + '%')) + '</b></div>' +
      '<div class="progress progress--sm' + (bahaya ? ' progress--danger' : '') + '" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + nilai + '"><div class="progress__bar" style="width:' + nilai + '%"></div></div></div>';
  }
  function pecahHtml(pk) {
    return '<div class="pru-pecah">' + pk.map(function (x) { return '<div class="' + x.ke + '" style="width:' + Math.max(8, x.nilai) + '%" title="' + esc(x.nama) + '">' + esc(x.nama.replace(' (UMNO)', '')) + ' ' + Math.round(x.nilai) + '%</div>'; }).join('') + '</div>';
  }
  function fx(r) { return r ? '<span class="badge badge--gold">' + esc(r) + '</span>' : ''; }

  /* ---------------------------------------------------------------- KAD */
  function ringkasKesan(t) {
    var h = [];
    if (t.dana) { h.push('−RM ' + fmt(t.dana)); }
    if (t.jentera) { h.push('Jentera ' + (t.jentera > 0 ? '+' : '') + t.jentera + '%'); }
    if (t.gain && t.gain[1] > 0) { h.push('Sokongan +' + t.gain[0] + '–' + t.gain[1] + '%'); }
    if (t.hasil) { h.push('Dana +RM ' + fmt(t.hasil[0]) + '–' + fmt(t.hasil[1])); }
    if (t.stress) { h.push('Stress ' + tanda(t.stress)); }
    if (t.risiko) { h.push('Risiko ' + (t.jenisRisiko === 'sprm' ? 'siasatan SPRM' : 'fitnah') + ' ' + Math.round(t.risiko * 100) + '%'); }
    return h.join(' · ');
  }
  function kadKempen(p, ck) {
    var a = ck.aktif, h = '<section class="card pru-kempen"><h2 class="card__title" style="margin:0 0 4px">🗳️ Kempen · ' + esc(a.kerusi ? a.kerusi.nama : '') + ' (' + (a.candidateType === 'DUN' ? 'DUN' : 'Parlimen') + ') ' + ck.ikonProfil + ' ' + esc(ck.profilNama) + '</h2>';
    h += '<p class="note">Hari <b>' + ck.hariSemasa + '/14</b> · ' + (a.isThreeCorneredFight ? '<b class="pru-ng">⚠️ Pertandingan 3-penjuru</b>' : 'Pertandingan 1-lawan-1') + ' · Populariti parti ' + a.partiPopulariti + '%</p>';
    h += '<div class="pru-hari" aria-hidden="true">';
    for (var i = 0; i < 14; i++) { h += '<i class="' + (i < ck.hariSemasa ? 'd' : i === ck.hariSemasa ? 'n' : '') + (i >= 12 ? ' f' : '') + '"></i>'; }
    h += '</div>' + pecahHtml(ck.pecahan);
    h += bar('Sokongan pengundi', a.voterSupport, a.voterSupport < 30) + bar('Dana kempen', Math.min(100, a.campaignFunds / 100), a.campaignFunds < 1500, 'RM ' + fmt(a.campaignFunds)) + bar('Tenaga jentera', a.jentera, a.jentera < 40) + bar('Stress', p.stress || 0, (p.stress || 0) >= 60);
    h += '<p class="note" style="margin-top:6px">📜 ' + ck.janji.map(function (j) { return esc(j.ikon + ' ' + j.nama); }).join(' · ') + '</p>';
    if (ck.kejutan) { h += '<button type="button" class="btn btn--primary btn--block" data-pru="kejutan">⚡ Kejutan Kempen hari ke-' + ck.kejutan.hari + ': ' + esc(ck.kejutan.tajuk) + '</button>'; }
    else if (ck.hariBaki <= 0) { h += '<button type="button" class="btn btn--primary btn--block" data-pru="selesai">🗳️ Hari Mengundi: Lihat Keputusan</button>'; }
    else {
      if (ck.hariFinal) { h += '<div class="pru-final">🚨 War Room · Hari ' + (ck.hariSemasa + 1) + ' · Final Push dibuka (satu sehari, risiko berganda jika diulang)</div><div class="choice-list">' + ck.final.map(btnTindak).join('') + '</div><p class="note" style="margin:10px 0 4px">Tindakan biasa:</p>'; }
      h += '<div class="choice-list">' + ck.biasa.map(btnTindak).join('') + '</div>';
    }
    if (a.log && a.log.length) { h += '<ul class="pru-log">' + a.log.slice(0, 4).map(function (l) { return '<li><b>Hari ' + l.hari + ':</b> ' + esc(l.teks) + '</li>'; }).join('') + '</ul>'; }
    return h + '</section>';
  }
  function btnTindak(t) {
    return '<button type="button" class="choice" data-pru="tindak" data-id="' + esc(t.id) + '"' + (t.boleh ? '' : ' disabled') + '><span class="choice__title">' + t.ikon + ' ' + esc(t.nama) +
      (t.pengganda && t.pengganda !== 1 ? ' <span class="badge ' + (t.pengganda > 1 ? 'badge--gold' : 'badge--red') + '">×' + t.pengganda + '</span>' : '') + '</span><span class="choice__fx">' + fx(ringkasKesan(t)) + '</span>' +
      (t.boleh ? '' : '<span class="choice__desc" style="color:var(--danger)">' + esc(t.sebab) + '</span>') + '</button>';
  }
  function kadPRU(p) {
    var r = PRU.ringkasan(p), a = r.aktif, h = '';
    if (!a) {
      var bl = r.bulanKePRU;
      var tek = (r.semuaStatus || []).map(function (s) { return '<b>' + (s.jenis === 'ADUN' ? 'ADUN' : 'Ahli Parlimen') + ' ' + esc(s.kerusi) + '</b>'; }).join(' + ');
      tek = tek ? tek + ' · ' : '';
      h = '<div class="banner' + (bl <= 12 && bl >= 0 ? ' banner--gold' : '') + '"><strong>🗳️ PRU/PRN: ' + BULAN[(r.bulanPRU || 1) - 1] + ' ' + r.tahunPRU + '</strong>' + tek +
        (bl > 0 ? bl + ' bulan lagi' : 'Bila-bila masa') + ' · kawasan ' + r.ikonProfil + ' ' + esc(r.profilNama) + '. Kelayakan: DUN ' + (r.kelayakan.DUN.boleh ? '✓' : '✗ (IP ' + r.kelayakan.DUN.ipMin + ' + jawatan)') + ', Parlimen ' + (r.kelayakan.PARLIMEN.boleh ? '✓' : '✗ (IP ' + r.kelayakan.PARLIMEN.ipMin + ' + Ketua Bahagian)') + '.</div>';
      return h;
    }
    if (a.fasa === 'kempen') { return kadKempen(p, PRU.keadaanKempen(p)); }
    if (a.fasa === 'keputusan') { return '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🗳️ Keputusan Pilihan Raya</h2><p class="note">Hari mengundi telah selesai.</p><button type="button" class="btn btn--primary btn--block" data-pru="keputusan">Lihat Keputusan</button></section>'; }
    return '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🗳️ Pilihan Raya Diisytiharkan</h2><p class="note">Fasa: <b>' + ({ isytihar: 'Pencalonan', calon: 'Pencalonan', runding: 'Rundingan kerusi', manifesto: 'Manifesto & peruntukan' }[a.fasa] || a.fasa) + '</b>. Bulan tidak boleh dimajukan sehingga pilihan raya selesai.</p>' +
      '<button type="button" class="btn btn--primary btn--block" data-pru="buka">Teruskan</button>' +
      (a.fasa === 'runding' || a.fasa === 'manifesto' || a.fasa === 'calon' ? '<button type="button" class="btn btn--ghost btn--block" style="margin-top:8px" data-pru="tarik">Tarik diri (tidak bertanding)</button>' : '') + '</section>';
  }
  function kadJanji(p) {
    var j = PRU.janjiStatus(p);
    if (!j) { return ''; }
    var h = '<section class="card"><h2 class="card__title" style="margin:0 0 4px">📜 Janji Manifesto' + (j.dinilai ? ' (telah dinilai)' : '') + '</h2>';
    if (j.dinilai) { return h + '<p class="note">' + esc(j.hasil && j.hasil.ringkas ? j.hasil.ringkas.join(' · ') : '') + '</p></section>'; }
    h += '<p class="note">Dinilai dalam <b>' + j.baki + ' bulan</b>. Belanjakan Dana untuk memajukan janji; pentadbir kerajaan juga menyumbang kemajuan bulanan. Kemajuan ≥ 60% dianggap ditunai.</p>';
    j.senarai.forEach(function (x) {
      h += bar(x.ikon + ' ' + x.nama, x.kemajuan, x.kemajuan < 30) + '<div style="margin:-2px 0 8px"><button type="button" class="btn btn--sm" data-pru="janji" data-id="' + esc(x.id) + '"' + (x.kemajuan >= 100 ? ' disabled' : '') + '>Majukan (−RM ' + fmt(x.kosMaju || x.kos * 2) + ', +34%)</button></div>';
    });
    return h + '</section>';
  }
  /** v8.16: terangkan kenapa tiada tetingkap lobi (parti pembangkang penggal ini, atau peluang telah digunakan). */
  function kadTiadaLobi(p) {
    var pr = PRU.getPRU(p), st = [pr.status, pr.statusKedua].filter(function (x) { return x && x.kerajaan !== undefined; });
    if (!st.length || pr.nasional) { return ''; }
    var ada = st.some(function (x) { return x.kerajaan; });
    return '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🏛️ Lobi Portfolio Kerajaan</h2><p class="note">' +
      (ada ? 'Peluang lobi penggal ini telah digunakan. Lobi dibuka semula selepas pilihan raya akan datang jika parti membentuk kerajaan.'
           : 'Tiada lobi penggal ini: parti anda tidak membentuk kerajaan pada pilihan raya terakhir. Lobi dibuka selepas pilihan raya akan datang jika parti membentuk kerajaan (peluang bergantung pada populariti parti).') + '</p></section>';
  }
  function kadKabinet(p) {
    if (!KB) { return ''; }
    var k = KB.ringkasan(p), h = '';
    if (k.lobi && !k.hasGovernmentRole) {
      var mb = k.mb && k.mb.boleh ? k.mb : null;
      var bMB = mb ? '<div class="banner banner--gold"><strong>🏛️ Kerajaan negeri dibentuk</strong>Parti anda membentuk kerajaan negeri ' + esc(mb.negeri) + '. Anda Pengerusi Badan Perhubungan Negeri dan ADUN. <button type="button" class="btn btn--sm btn--gold" data-pru="mb">' + (mb.sendiri ? 'Angkat Sumpah ' + esc(mb.label) : 'Runding ' + esc(mb.label)) + '</button></div>' : '';
      return bMB + '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🏛️ Lobi Portfolio Kerajaan</h2><p class="note">Parti membentuk kerajaan. Anda boleh melobi satu portfolio (' + k.lobi.baki + ' percubaan tinggal).</p><button type="button" class="btn btn--primary btn--block" data-pru="lobi">Buka Lobi Portfolio</button>' + (p.parti === 'PBB' ? '<p class="note" style="font-size:.78rem;margin-top:8px">Di Sarawak, anggota kabinet negeri dipanggil Menteri, bukan EXCO. Dalam permainan, elaun dan peraturan sama dengan EXCO Negeri.</p>' : '') + '</section>';
    }
    if (!k.hasGovernmentRole) { return kadTiadaLobi(p); }
    h = '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🏛️ ' + esc(k.portfolioName) + '</h2><p class="note">' + esc(k.tahapNama) + ' · ' + k.bulanBerjawatan + ' bulan berkhidmat · elaun +RM ' + fmt(k.elaun.myr) + ' &amp; +' + k.elaun.ip + ' IP sebulan.</p>';
    var arah = k.arah > 0 ? ' ▲ +' + k.arah : k.arah < 0 ? ' ▼ ' + k.arah : ' ▬';
    h += bar('KPI Portfolio · ' + k.kpiLabel + arah, k.governanceRating, k.governanceRating < 30) + bar('Tekanan politik', k.tekananPolitik, k.tekananPolitik >= 70) +
      bar('Populariti nasional', k.popularitiNasional, k.popularitiNasional < 30) + bar('Risiko rombakan kabinet', k.risikoRombak, k.risikoRombak >= 60);
    h += '<p class="note" style="margin:6px 0 4px"><b>🏗️ Peruntukan Projek (CDF)</b> · baki RM ' + fmt(k.cdfBaki) + ' · digunakan ' + k.cdfBulan + '/' + k.cdfHad + ' bulan ini. Salur ke kawasan sendiri untuk IP; jumlah besar menjejaskan KPI.</p><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">' +
      k.cdfPilihan.map(function (x) { return '<button type="button" class="btn btn--sm" data-pru="cdf" data-jumlah="' + x.jumlah + '"' + (x.boleh ? '' : ' disabled title="' + esc(x.sebab) + '"') + '>RM ' + fmt(x.jumlah) + ' → +' + x.ip + ' IP</button>'; }).join('') + '</div>';
    if (k.ratingRendah > 0) { h += '<div class="banner banner--warn" role="alert"><strong>Amaran rombakan</strong>Penarafan di bawah 30% sudah ' + k.ratingRendah + ' bulan. Satu bulan lagi anda digugurkan.</div>'; }
    if (k.acara) { h += '<button type="button" class="btn btn--primary btn--block" data-pru="acara">⚠️ <span>Isu kementerian menunggu:</span> <span>' + esc(k.acara.tajuk) + '</span></button>'; }
    return h + '</section>' + (p.parti === 'PBB' ? '<p class="note" style="font-size:.78rem">Di Sarawak, anggota kabinet negeri dipanggil Menteri, bukan EXCO. Dalam permainan, elaun dan peraturan sama dengan EXCO Negeri.</p>' : '');
  }
  /** Musim pilihan raya aktif (PRU/PRN atau PRK): tab khas Pilihan Raya dipaparkan. */
  function musim(p) { return !!((PRU.getPRU(p).aktif) || (PK && PK.getPRK(p).aktif)); }
  function bannerMusim(p) {
    var prk = PK && PK.getPRK(p).aktif, a = prk || PRU.getPRU(p).aktif;
    if (!a) { return ''; }
    return '<div class="banner banner--gold"><strong>📣 Musim pilihan raya sedang berlangsung' + (prk ? ' (PRK)' : '') + '</strong>Urus pencalonan, kempen dan keputusan di tab <b>Pilihan Raya</b>. <button type="button" class="btn btn--sm btn--gold" data-tab="pilihanraya">Buka tab Pilihan Raya</button></div>';
  }
  /**
   * jenis: 'pilihanraya' = kad kempen/pencalonan (tab khas); 'pemilihan' = pengira masa PRU atau banner musim;
   * 'tindakan' (lalai) = janji manifesto, kabinet dan banner musim.
   */
  function kad(p, jenis) {
    try {
      if (jenis === 'pilihanraya') { return musim(p) ? kadPRK(p) + (PRU.getPRU(p).aktif ? kadPRU(p) : '') : '<div class="banner"><strong>Bukan musim pilihan raya</strong>Tab ini hanya aktif semasa PRU/PRN atau PRK.</div>'; }
      if (jenis === 'pemilihan') { return musim(p) ? bannerMusim(p) : kadPRU(p); }
      return bannerNasional(p) + bannerMusim(p) + kadJanji(p) + kadKabinet(p);
    } catch (e) { return ''; }
  }
  function bannerNasional(p) {      // v7.22: keputusan nasional menunggu Presiden (cth. pemain memuat semula halaman)
    return PRU.nasionalTertunggak(p) ? '<div class="banner banner--gold"><strong>🗳️ Keputusan nasional menunggu</strong>Anda Presiden parti: tentukan pembentukan kerajaan. <button type="button" class="btn btn--sm btn--gold" data-pru="nasional">Lihat Keputusan Nasional</button></div>' : '';
  }
  function lencana(p) {
    var h = '', pru = PRU.getPRU(p), kb = KB ? KB.getKabinet(p) : null;
    PRU.semuaStatus(p).forEach(function (s) { h += '<span class="badge-office badge-office--menteri" title="Kerusi ' + esc(s.kerusi) + '">' + (s.jenis === 'ADUN' ? 'ADUN' : 'Ahli Parlimen') + '</span> '; });    // v7.55: dua jawatan wakil rakyat dipapar serentak
    if (kb && kb.hasGovernmentRole) { h += '<span class="badge-office badge-office--menteri">' + esc(kb.portfolioName) + '</span>'; }
    return h;
  }

  /* ---------------------------------------------------------------- ALIRAN */
  function opsi(id, tajuk, kecil, boleh) {
    return '<li><button type="button" class="acara__opsi' + (boleh ? '' : ' is-off') + '" data-pilih="' + esc(id) + '"' + (boleh ? '' : ' disabled') + '><b>' + tajuk + '</b><small>' + kecil + '</small></button></li>';
  }
  async function modPencalonan(p) {
    var r = PRU.ringkasan(p), a = r.aktif, kl = r.kelayakan, kl2 = PRU.kelayakan(p, true);
    var bolehLain = ['DUN', 'PARLIMEN'].some(function (z) { return kl2[z].boleh && !a.ditolak[z]; });          // v8.17
    var sebabLawan = a.sebab === 'krisis' ? 'Krisis Pembubaran Dewan' : 'Tamat penggal 5 tahun';
    function baris(jenis, nama) {
      var k = kl[jenis], ditolak = a.ditolak[jenis];
      return opsi(jenis, (jenis === 'DUN' ? '🏛️ ' : '🏢 ') + 'Kerusi ' + nama + ' <span class="badge">' + r.ikonProfil + ' ' + esc(r.profilNama) + '</span>',
        (jenis === 'DUN' ? esc(p.dun || 'DUN') : esc(p.bahagian || 'Parlimen')) + ' · syor IP ≥ ' + k.ipMin + ' · peruntukan minimum RM ' + fmt(k.minPeruntukan) + '<br>' + (ditolak ? 'Permohonan sudah ditolak.' : k.boleh ? 'Peluang diluluskan ± ' + k.peluang + '%' : esc(k.sebab.join('; '))), k.boleh && !ditolak);
    }
    return modal({
      tajuk: 'Pengisytiharan Pilihan Raya',
      isi: '<p class="acara__ikon" aria-hidden="true">🗳️</p><p><b>' + sebabLawan + '.</b> Hari mengundi dalam 14 hari. Populariti parti: <b>' + a.partiPopulariti + '%</b>. Mohon dicalonkan bertanding:</p>' +
        '<ul class="acara__pil">' + baris('DUN', 'DUN') + baris('PARLIMEN', 'Parlimen') + (kl.DUN.boleh && kl.PARLIMEN.boleh && !a.ditolak.DUN && !a.ditolak.PARLIMEN ? opsi('KEDUA', '🏛️🏢 Kedua-dua: Parlimen + DUN (serentak)', 'Satu kempen 14 hari, dua keputusan. Tumpuan terbahagi: sokongan -3%, jentera -8. Peluang diluluskan: Parlimen ' + kl.PARLIMEN.peluang + '%, DUN ' + kl.DUN.peluang + '%. Menang kedua-dua = dua jawatan wakil rakyat.', true) : '') + opsi('NONE', 'Tidak bertanding', 'Fokus jawatan parti. Tiada risiko kehilangan IP.', true) + '</ul>' +
        (bolehLain ? opsi('LAIN', '🗺️ Kerusi lain…', 'Bertanding di Parlimen atau DUN lain (calon dari luar). Peluang diluluskan lebih rendah, sokongan awal dan kos kempen terjejas; kerusi sukar memberi ganjaran IP lebih tinggi.', true) : '') +
        '<p style="font-size:.8rem">Keputusan pencalonan oleh Majlis Tertinggi bergantung IP, reputasi dan kedudukan parti.</p>',
      butang: []
    });
  }
  /** v8.17: pemilih kerusi lain (Parlimen / DUN, semua negeri kecuali Sarawak). Pulang { jenis, kerusi } atau null. */
  async function modKerusiLain(p) {
    var Geo = W.MyPolitikGeo, a = PRU.getPRU(p).aktif, kl2 = PRU.kelayakan(p, true);
    if (!Geo || !Geo.muat) { toast('Data kerusi tidak tersedia.', 'ralat'); return null; }
    toast('Memuatkan senarai kerusi…', 'ok');
    try { await Geo.muat(['negeri', 'parlimen', 'dun']); } catch (e) { toast('Senarai kerusi tidak dapat dimuatkan. Semak sambungan internet.', 'ralat'); return null; }
    function nm(x) { return String(x || '').toLowerCase().replace(/[^a-z]/g, ''); }
    var negeri = Geo.getFitur('negeri').filter(function (n) { return nm(n.nama) !== 'sarawak'; }).sort(function (x, y) { return x.nama < y.nama ? -1 : 1; });   // UMNO tiada cawangan di Sarawak
    var kunci = Geo.kunciDariCawangan ? Geo.kunciDariCawangan(p) : {}, ownNeg = kunci && kunci.negeri != null ? String(kunci.negeri) : '';
    if (!ownNeg) { var jumpa = negeri.filter(function (n) { return nm(n.nama) === nm(p.negeri); })[0]; ownNeg = jumpa ? jumpa.id : ''; }
    var disusun = { PARLIMEN: Geo.getFitur('parlimen'), DUN: Geo.getFitur('dun') };
    var terpilih = null, jenisSemasa = kl2.PARLIMEN.boleh && !a.ditolak.PARLIMEN ? 'PARLIMEN' : 'DUN';
    function radio(j, label) { var ok = kl2[j].boleh && !a.ditolak[j]; return '<label><input type="radio" name="kjenis" value="' + j + '"' + (j === jenisSemasa ? ' checked' : '') + (ok ? '' : ' disabled') + '><span><b>' + label + '</b>' + (ok ? '' : '<small>' + (a.ditolak[j] ? 'Permohonan sudah ditolak.' : esc(kl2[j].sebab.join('; '))) + '</small>') + '</span></label>'; }
    var isi = '<p>Pilih kerusi untuk bertanding sebagai calon dari luar. Peluang diluluskan lebih rendah, sokongan awal dan kos kempen terjejas. Tahap kerusi ialah anggaran simulasi.</p>' +
      '<div class="pru-pilih">' + radio('PARLIMEN', '🏢 Parlimen') + radio('DUN', '🏛️ DUN') + '</div>' +
      '<label class="note" for="kl-negeri">Negeri</label><select id="kl-negeri" style="width:100%;margin:4px 0 8px">' + negeri.map(function (n) { return '<option value="' + esc(n.id) + '"' + (n.id === ownNeg ? ' selected' : '') + '>' + esc(n.nama) + '</option>'; }).join('') + '</select>' +
      '<label class="note" for="kl-kerusi">Kerusi</label><select id="kl-kerusi" size="6" style="width:100%;margin:4px 0 8px"></select>' +
      '<div class="note" id="kl-ringkas" aria-live="polite"></div>';
    var pr = modal({ tajuk: '🗺️ Kerusi Lain', isi: isi, butang: [{ label: 'Kembali', nilai: false }, { label: 'Mohon Dicalonkan', nilai: true, kelas: 'btn--gold', nonaktif: true }] });
    var isiEl = W.document.getElementById('modal-isi'), kaki = W.document.getElementById('modal-kaki'), mula = kaki && kaki.querySelector('button:last-child');
    if (isiEl) {
      var sNeg = isiEl.querySelector('#kl-negeri'), sKr = isiEl.querySelector('#kl-kerusi'), rg = isiEl.querySelector('#kl-ringkas');
      var isiKerusi = function () {
        var j = (isiEl.querySelector('input[name=kjenis]:checked') || {}).value || jenisSemasa, neg = sNeg.value;
        var sendiriNama = nm(j === 'DUN' ? p.dun : p.bahagian);
        var senarai = (disusun[j] || []).filter(function (f) { return String(f.negeri) === neg && !(neg === ownNeg && nm(f.nama) === sendiriNama); }).sort(function (x, y) { return x.nama < y.nama ? -1 : 1; });
        sKr.innerHTML = senarai.map(function (f) { return '<option value="' + esc(f.id) + '">' + esc(f.nama) + '</option>'; }).join('');
        if (senarai.length) { sKr.selectedIndex = 0; }
        kemas();
      };
      var kemas = function () {
        var j = (isiEl.querySelector('input[name=kjenis]:checked') || {}).value || jenisSemasa, opt = sKr.options[sKr.selectedIndex];
        terpilih = null;
        if (!opt) { rg.textContent = 'Tiada kerusi untuk pilihan ini.'; if (mula) { mula.disabled = true; } return; }
        var kr = { nama: opt.text, kod: opt.value, negeri: (negeri.filter(function (n) { return n.id === sNeg.value; })[0] || {}).nama || '', negeriSama: sNeg.value === ownNeg, sendiri: false };
        var pk = PRU.peluangKerusi(p, j, kr);
        terpilih = { jenis: j, kerusi: kr, boleh: pk.boleh };
        var tahapNota = pk.tahap === 'selamat' ? 'Kerusi selamat: sokongan awal +4.' : pk.tahap === 'marginal' ? 'Kerusi marginal: ganjaran IP lebih tinggi jika menang (+15%).' : 'Kerusi sukar: sokongan awal -5, ganjaran IP lebih tinggi jika menang (+30%).';
        rg.innerHTML = '<div><b>' + esc(kr.nama) + '</b></div><div>' + (kr.negeriSama ? 'Negeri sama' : 'Negeri lain') + '</div><div>Peluang diluluskan ± ' + pk.peluang + '% (penalti -' + pk.penalti + ')</div><div>' + tahapNota + '</div><div>' +
          (pk.pernahMenang ? 'Anda pernah menang kerusi ini: tiada penalti sokongan awal. Minimum peruntukan RM ' + fmt(pk.minPeruntukan) + '.' : 'Calon dari luar: sokongan awal -' + pk.sokongan + ', minimum peruntukan RM ' + fmt(pk.minPeruntukan) + ' (+20%).') + '</div>';
        if (mula) { mula.disabled = !pk.boleh; }
      };
      isiEl.addEventListener('change', function (e) { if (e.target && (e.target.name === 'kjenis' || e.target.id === 'kl-negeri')) { isiKerusi(); } else if (e.target && e.target.id === 'kl-kerusi') { kemas(); } });
      isiKerusi();
    }
    var ya = await pr;
    return ya && terpilih && terpilih.boleh ? { jenis: terpilih.jenis, kerusi: terpilih.kerusi } : null;
  }
  async function modRunding(p) {
    var a = PRU.getPRU(p).aktif, rk = PRU.KOS_RUNDING;
    return modal({
      tajuk: 'Rundingan Kerusi & Gabungan',
      isi: '<p class="acara__ikon" aria-hidden="true">🤝</p><p>Kerusi <b>' + esc(a.kerusi.nama) + '</b> turut dituntut oleh rakan gabungan. Jika rundingan gagal, undi terbahagi tiga (3-penjuru) dan kemenangan lebih sukar.</p><p style="font-size:.85rem">IP: <b>' + fmt(p.ip) + '</b> · Hubungan gabungan: <b>' + PRU.getPRU(p).hubunganGabungan + '</b>/100</p><ul class="acara__pil">' +
        opsi('berdepan', 'Runding berdepan', 'Kos IP ' + rk.berdepan.ip + ' · Berjaya ± ' + Math.round(rk.berdepan.jaya * 100) + '% → 1-lawan-1; gagal → 3-penjuru', p.ip >= rk.berdepan.ip) +
        (a.candidateType === 'PARLIMEN' && !a.kerusi2 && p.dun && !a.calonImport ? opsi('ganti', 'Tawar kerusi DUN sebagai ganti', 'Kos IP ' + rk.ganti.ip + ' · Berjaya ± ' + Math.round(rk.ganti.jaya * 100) + '% · anda melepaskan kerusi Parlimen ini', p.ip >= rk.ganti.ip) : '') +
        opsi('abai', 'Bertanding juga (abaikan rakan)', 'Pasti 3-penjuru · hubungan gabungan −15 · Reputasi −3', true) + '</ul>',
      butang: []
    });
  }
  /** v8.11: peruntukan kempen tidak lagi ditanda lalai (dahulu pilihan terkecil, mudah terlepas pandang). Satu pilihan sahaja = ditanda. */
  function tandaDana(pil, i) { return pil.pilihan.length === 1 && i === 0 ? ' checked' : ''; }
  function ringkasDana(p, n) {
    return n ? 'Anda melabur RM ' + fmt(n) + ' daripada Dana RM ' + fmt(p.myr) + ' (baki di tangan RM ' + fmt(Math.max(0, p.myr - n)) + '). Wang kempen yang tidak terpakai dipulangkan selepas pilihan raya.'
      : 'Sila pilih jumlah peruntukan kempen. Peruntukan lebih besar menguatkan kempen; wang yang tidak terpakai dipulangkan.';
  }
  function pasangRingkasDana(p, isiEl, semak) {
    var el = isiEl.querySelector('#pru-ringkas-dana');
    function kemas() { var d = isiEl.querySelector('input[name=dana]:checked'); if (el) { el.innerHTML = ringkasDana(p, d ? Number(d.value) : 0); } if (semak) { semak(); } }
    isiEl.addEventListener('change', function (e) { if (e.target && e.target.name === 'dana') { kemas(); } });
    kemas();
  }
  async function modManifesto(p) {
    var a = PRU.getPRU(p).aktif, pil = PRU.peruntukanPilihan(p, a), prof = a.constituencyType;
    var isi = '<p>Pilih <b>tepat 3 janji</b> manifesto. Janji yang sesuai dengan kawasan ' + PRU.IKON_PROFIL[prof] + ' <b>' + esc(PRU.PROFIL[prof]) + '</b> memberi bonus sokongan lebih besar. Janji dinilai 12 bulan selepas anda menang.</p><div class="pru-pilih" id="pru-janji">' +
      PRU.JANJI.map(function (j) { return '<label><input type="checkbox" name="janji" value="' + j.id + '"><span><b>' + j.ikon + ' ' + esc(j.nama) + '</b><small>Bonus kawasan ini +' + (j.sesuai[prof] || 0) + ' · kos pelaksanaan RM ' + fmt(j.kosBulan) + '/bulan · risiko dimungkiri ' + Math.round(j.ingkar * 100) + '%</small></span></label>'; }).join('') + '</div>' +
      '<p><b>Peruntukan kempen</b> (diambil daripada Dana anda RM ' + fmt(p.myr) + '; baki dipulangkan):</p><div class="pru-pilih" id="pru-dana">' +
      (pil.pilihan.length ? pil.pilihan.map(function (n, i) { return '<label><input type="radio" name="dana" value="' + n + '"' + tandaDana(pil, i) + '><span><b>RM ' + fmt(n) + '</b>' + (pil.bawahMin ? '<small>Bawah minimum RM ' + fmt(pil.min) + ': sokongan awal -' + pil.penalti.sokongan + '%, jentera -' + pil.penalti.jentera + '%</small>' : '') + '</span></label>'; }).join('') : '<p class="pru-ng">Dana tidak mencukupi (minimum RM ' + fmt(pil.min) + ').</p>') + '</div><p class="note" id="pru-ringkas-dana" aria-live="polite"></p>' +
      (pil.bawahMin ? '<p class="note">Dana anda kurang daripada minimum. Anda boleh bertanding dengan semua dana yang ada (kempen lebih lemah), atau menarik diri. Bulan tidak boleh dimajukan semasa pilihan raya.</p>' : '');
    var pr = modal({ tajuk: 'Manifesto & Peruntukan Kempen', isi: isi, butang: [{ label: 'Tunda', nilai: false }, { label: 'Tarik Diri', nilai: 'tarik', kelas: 'btn--danger' }, { label: 'Mula Kempen 14 Hari', nilai: true, kelas: 'btn--gold', nonaktif: true }] });
    var kaki = W.document.getElementById('modal-kaki'), mula = kaki && kaki.querySelector('button:last-child'), isiEl = W.document.getElementById('modal-isi');
    function semak() { if (mula) { mula.disabled = !(isiEl.querySelectorAll('input[name=janji]:checked').length === 3 && pil.pilihan.length && isiEl.querySelector('input[name=dana]:checked')); } }
    pasangRingkasDana(p, isiEl, semak);
    isiEl.addEventListener('change', function (e) {
      var terpilih = isiEl.querySelectorAll('input[name=janji]:checked');
      if (e.target.name === 'janji' && terpilih.length > 3) { e.target.checked = false; toast('Hanya 3 janji boleh dipilih.', 'ralat'); }
      semak();
    });
    var ya = await pr;
    if (ya === 'tarik') { return { tarik: true }; }
    if (!ya) { return null; }
    var ids = [].map.call(isiEl.querySelectorAll('input[name=janji]:checked'), function (x) { return x.value; });
    var d = isiEl.querySelector('input[name=dana]:checked');
    return { ids: ids, dana: d ? Number(d.value) : 0 };
  }

  async function alir() {
    if (sibuk) { return; }
    sibuk = true;
    try {
      var guard = 0;
      while (guard++ < 12) {
        var p = S.loadPlayer(), a = PRU.getPRU(p).aktif;
        if (!a || a.fasa === 'kempen' || a.fasa === 'keputusan') { break; }
        if (a.fasa === 'isytihar' || a.fasa === 'calon') {
          var j = await modPencalonan(p), lk = null;
          if (!j) { break; }
          if (j === 'LAIN') { lk = await modKerusiLain(p); if (!lk) { continue; } j = lk.jenis; }                 // v8.17: kerusi lain
          if (j === 'NONE') {
            var tb = PRU.tidakBertanding(); toast(tb.mesej || tb.ralat, tb.ok ? 'ok' : 'ralat'); segarkan(); if (tb.nasional) { await nasional(); } break;
          }
          var r = PRU.pilihKerusi(j, lk ? { kerusi: lk.kerusi } : undefined);
          if (!r.ok) { toast(r.ralat, 'ralat'); continue; }
          toast(r.mesej, r.diluluskan ? 'ok' : 'ralat'); segarkan();
          if (r.lain && r.diluluskan) { toast('Calon dari luar: sokongan awal lebih rendah dan kos kempen lebih tinggi.', 'ok'); }
          if (!r.diluluskan) {
            var p2 = S.loadPlayer(), k2 = PRU.kelayakan(p2), a2 = PRU.getPRU(p2).aktif;
            var masihBoleh = ['DUN', 'PARLIMEN'].some(function (z) { return !a2.ditolak[z] && k2[z].boleh; });
            if (!masihBoleh) { var t2 = PRU.tidakBertanding(); toast('Tiada kerusi lain yang layak. ' + (t2.mesej || ''), 'ralat'); segarkan(); if (t2.nasional) { await nasional(); } break; }
          }
        } else if (a.fasa === 'runding') {
          var o = await modRunding(p);
          if (!o) { break; }
          var rn = PRU.runding(o);
          if (!rn.ok) { toast(rn.ralat, 'ralat'); continue; }
          segarkan(); await modal({ tajuk: rn.penjuru3 ? '⚠️ Pertandingan 3-Penjuru' : 'Rundingan Berjaya', isi: '<p>' + esc(rn.mesej) + '</p>' });
        } else if (a.fasa === 'manifesto') {
          var m = await modManifesto(p);
          if (!m) { break; }
          if (m.tarik) { await tarikDiriPRU(); break; }
          var mk = PRU.mulaKempen(m.ids, m.dana);
          if (!mk.ok) { toast(mk.ralat, 'ralat'); continue; }
          segarkan(); toast('Kempen 14 hari bermula!', 'ok');
        } else { break; }
      }
    } finally { sibuk = false; segarkan(); }
  }

  /** v7.18: menarik diri selepas dicalonkan (supaya pemain tidak tersekat jika dana tidak cukup). */
  async function tarikDiriPRU() {
    var ya = await modal({ tajuk: 'Tarik Diri?', isi: '<p>Anda tidak akan bertanding pada pilihan raya ini. Reputasi Parti <b>-3</b> kerana menarik diri selepas dicalonkan. Bulan boleh dimajukan semula selepas itu.</p>', butang: [{ label: 'Batal', nilai: false }, { label: 'Ya, Tarik Diri', nilai: true, kelas: 'btn--danger' }] });
    if (!ya) { return; }
    var t = PRU.tidakBertanding(); toast(t.mesej || t.ralat, t.ok ? 'ok' : 'ralat'); segarkan();
    if (t.nasional) { await nasional(); }
  }

  async function kejutan() {
    var p = S.loadPlayer(), ck = PRU.keadaanKempen(p);
    if (!ck || !ck.kejutan) { return; }
    var k = ck.kejutan;
    function kesanTeks(c) {
      var x = c.kesan || null, t = [];
      if (c.rawak) { return 'Berjaya ' + Math.round(c.rawak.p * 100) + '%: ' + ringkasX(c.rawak.jaya) + ' · Gagal: ' + ringkasX(c.rawak.gagal); }
      return ringkasX(x);
    }
    function ringkasX(x) {
      if (!x) { return ''; }
      var t = [];
      if (x.dana) { t.push('Dana ' + (x.dana > 0 ? '+' : '−') + 'RM ' + fmt(Math.abs(x.dana))); }
      if (x.vs) { t.push('Sokongan ' + tanda(x.vs) + '%'); } if (x.vsMin) { t.push('Sokongan +' + x.vsMin + '–' + x.vsMaks + '%'); }
      if (x.jentera) { t.push('Jentera ' + tanda(x.jentera) + '%'); } if (x.stress) { t.push('Stress ' + tanda(x.stress)); } if (x.ip) { t.push('IP ' + tanda(x.ip)); }
      return t.join(' · ');
    }
    var id = await modal({
      tajuk: '⚡ Kejutan Kempen · Hari ' + k.hari,
      isi: '<p class="acara__ikon" aria-hidden="true">' + k.ikon + '</p><p><b>' + esc(k.tajuk) + '</b></p><p>' + esc(k.huraian) + '</p><p style="font-size:.82rem">Dana kempen: <b>RM ' + fmt(ck.aktif.campaignFunds) + '</b> · Jentera ' + Math.round(ck.aktif.jentera) + '%</p><ul class="acara__pil">' +
        k.pilihan.map(function (c) { return opsi(c.id, esc(c.label), esc(kesanTeks(c)) + (c.etika ? ' · berisiko Tataetika' : '') + (c.boleh ? '' : '<br>' + esc(c.sebab)), c.boleh); }).join('') + '</ul>',
      butang: []
    });
    if (!id) { toast('Kejutan masih menunggu keputusan anda.'); segarkan(); return; }
    var r = PRU.jawabKejutan(id);
    if (!r.ok) { toast(r.ralat, 'ralat'); segarkan(); return; }
    toast(r.mesej, r.vs < 0 ? 'ralat' : 'ok'); segarkan();
    if (r.tamat) { await selesai(); }
  }

  function htmlKeputusan(kp, a) {
    var menang = kp.menang && !kp.petisyen;
    var h = '<div class="pru-menang' + (menang ? '' : ' pru-kalah') + '">' + (menang ? '🎉 Anda Menang!' : kp.petisyen ? 'Kerusi Dibatalkan' : 'Anda Kalah') + '</div>';
    h += '<p style="text-align:center"><b>' + (menang ? (a.candidateType === 'DUN' ? 'ADUN ' : 'Ahli Parlimen ') : 'Kerusi ') + esc(a.kerusi ? a.kerusi.nama : '') + '</b>' + (kp.penjuru3 ? ' · pertandingan 3-penjuru' : '') + '</p>';
    h += pecahHtml(kp.pecah);
    h += '<div class="kv"><span>Majoriti</span><b>' + (kp.menang ? fmt(kp.majoriti) + ' undi' : 'kalah ' + fmt(kp.majoriti) + ' undi') + '</b></div><div class="kv"><span>Isu tempatan</span><b>' + esc(((PRU.JANJI.filter(function (j) { return j.id === kp.isuTempatan; })[0] || {}).nama) || '') + (kp.isuTepat ? ' (manifesto anda tepat)' : '') + '</b></div>';
    if (menang) {
      h += '<h3 style="margin:12px 0 4px">Ganjaran</h3><div class="kv"><span>Pengaruh (IP)</span><b class="pru-ok">+' + kp.bonusIp + '</b></div><div class="kv"><span>Reputasi</span><b class="pru-ok">+3</b></div>';
      h += '<p style="font-size:.85rem;margin-top:8px">' + (kp.kerajaan ? '🏛️ Parti anda membentuk kerajaan. <b>Lobi Portfolio</b> (' + (a.candidateType === 'DUN' ? (S.loadPlayer().parti === 'PBB' ? 'Menteri Negeri Sarawak' : 'EXCO Negeri') : 'Timbalan Menteri / Menteri') + ') kini dibuka.' : 'Parti anda tidak membentuk kerajaan. Jawatan kerajaan tidak dibuka penggal ini.') + '</p>';
    } else if (!kp.petisyen) {
      h += '<h3 style="margin:12px 0 4px">Kesan</h3><div class="kv"><span>Pengaruh (IP)</span><b class="pru-ng">−100</b></div><p style="font-size:.85rem;margin-top:8px">Anda kekal dengan jawatan dalam parti. Boleh bertanding semula pada pilihan raya akan datang.</p>';
    }
    if (kp.siasatMsg) { h += '<p class="' + (kp.petisyen ? 'pru-ng' : '') + '" style="font-size:.85rem;margin-top:8px">' + esc(kp.siasatMsg) + '</p>'; }
    if (kp.kedua) {                                                          // v7.55: kerusi kedua (kempen serentak)
      var k2 = kp.kedua, m2 = k2.menang && !k2.petisyen;
      h += '<hr><div class="pru-menang' + (m2 ? '' : ' pru-kalah') + '">' + (m2 ? '🎉 Menang kerusi kedua!' : 'Kalah kerusi kedua') + '</div><p style="text-align:center"><b>' + (m2 ? (k2.jenis === 'DUN' ? 'ADUN ' : 'Ahli Parlimen ') : 'Kerusi ') + esc(k2.kerusi || '') + '</b></p>' + pecahHtml(k2.pecah) +
        '<div class="kv"><span>Majoriti</span><b>' + (k2.menang ? fmt(k2.majoriti) + ' undi' : 'kalah ' + fmt(k2.majoriti) + ' undi') + '</b></div>' + (m2 ? '<div class="kv"><span>Pengaruh (IP)</span><b class="pru-ok">+' + k2.bonusIp + '</b></div>' : '<p style="font-size:.85rem">Kekalahan kerusi kedua dikira separuh kesan.</p>');
    }
    return h;
  }
  /* v7.22: keputusan nasional & rundingan kerajaan (Presiden parti) */
  function htmlNasional(n) {
    var j = n.jumlah, pc = function (x) { return Math.max(0, x / j * 100).toFixed(1) + '%'; };
    var ket = n.status === 'MAJORITI' ? '<b>Majoriti mutlak.</b> Parti anda membentuk kerajaan sendirian.'
      : n.status === 'GABUNGAN' ? '<b>Tiada majoriti mutlak.</b> Parti + rakan = ' + (n.parti + n.rakan) + ' kerusi (cukup ' + n.majoriti + '). Rundingan pembentukan kerajaan diperlukan.'
      : '<b>Gabungan anda ' + (n.parti + n.rakan) + ' kerusi</b>, kurang daripada ' + n.majoriti + '. Parti anda menjadi pembangkang.';
    return '<p style="font-size:.85rem">Anda Presiden parti. ' + j + ' kerusi Parlimen; majoriti mudah <b>' + n.majoriti + '</b>.</p>' +
      '<div class="pru-nas"><div class="p" style="width:' + pc(n.parti) + '">Parti ' + n.parti + '</div>' + (n.rakan ? '<div class="r" style="width:' + pc(n.rakan) + '">Rakan ' + n.rakan + '</div>' : '') + '<div class="b" style="width:' + pc(n.pembangkang) + '">Lawan ' + n.pembangkang + '</div></div>' +
      '<div class="kv"><span>🔴 Parti anda</span><b>' + n.parti + ' kerusi</b></div><div class="kv"><span>🔵 Rakan gabungan</span><b>' + n.rakan + ' kerusi</b></div><div class="kv"><span>⚫ Pembangkang</span><b>' + n.pembangkang + ' kerusi</b></div>' +
      '<p style="font-size:.85rem;margin-top:8px">' + ket + '</p>' +
      (n.bolehPM || n.status === 'PEMBANGKANG' ? '' : '<p style="font-size:.8rem;color:var(--text-muted)">Anda bukan Ahli Parlimen yang menang, jadi tidak layak menjadi Perdana Menteri.</p>') +
      '<p style="font-size:.72rem;color:var(--text-muted)">Anggaran permainan, bukan data pilihan raya sebenar.</p>';
  }
  async function nasional() {
    var p = S.loadPlayer(), n = PRU.nasionalTertunggak(p);
    if (!n) { return; }
    await modal({ tajuk: '🗳️ Keputusan Nasional', isi: htmlNasional(n), butang: [{ label: n.status === 'PEMBANGKANG' ? 'Teruskan' : n.status === 'MAJORITI' && n.bolehPM ? 'Teruskan' : 'Runding Pembentukan Kerajaan', nilai: true, kelas: 'btn--gold' }] });
    var pil;
    if (n.status === 'PEMBANGKANG') { pil = 'PEMBANGKANG'; }
    else if (n.status === 'MAJORITI' && n.bolehPM) { pil = 'PM'; }
    else {
      pil = await modal({
        tajuk: n.bolehPM ? '👑 Siapa Jadi Perdana Menteri?' : '🏛️ Pembentukan Kerajaan',
        isi: '<p style="font-size:.85rem">Parti ' + n.parti + ' daripada ' + (n.parti + n.rakan) + ' kerusi gabungan. Hubungan gabungan <b>' + n.hubungan + '</b>/100.</p><ul class="acara__pil">' +
          (n.bolehPM ? opsi('PM', '👑 Tuntut jawatan Perdana Menteri', 'Peluang berjaya ± ' + n.peluangPM + '%. Gagal: hubungan gabungan ' + PRU.CONFIG.NASIONAL.GAGAL_PM_HUBUNGAN + ' dan anda menerima Timbalan PM.', true) : '') +
          (n.bolehPM ? opsi('TPM', '🤝 Terima Timbalan Perdana Menteri', 'Selamat. Rakan gabungan memegang jawatan Perdana Menteri.', true) : '') +
          opsi('KABINET', '🗂️ Pilih portfolio kabinet', 'Lobi Menteri seperti biasa (guna IP dan Dana).', true) +
          opsi('PEMBANGKANG', '🪧 Jadi pembangkang', 'Tolak gabungan. Kerajaan dibentuk tanpa anda.', true) + '</ul>',
        butang: []
      });
      if (!pil) { pil = 'PEMBANGKANG'; }
    }
    var r = PRU.rundingKerajaan(pil);
    if (!r.ok) { toast(r.ralat, 'ralat'); segarkan(); return; }
    segarkan();
    await modal({ tajuk: r.hasil === 'PM' ? '👑 Perdana Menteri Malaysia' : r.hasil === 'TPM' ? '🤝 Timbalan Perdana Menteri' : r.hasil === 'KABINET' ? '🗂️ Kabinet' : '🪧 Pembangkang', isi: '<p>' + esc(r.mesej) + '</p>' + (r.hasil === 'PM' || r.hasil === 'TPM' ? '<p style="font-size:.85rem">Elaun bulanan, isu kementerian dan risiko rombakan berjalan seperti jawatan kabinet lain.</p>' : '') });
    if (r.bukaLobi) { await lobi(); }
    segarkan();
  }
  async function keputusan() {
    var p = S.loadPlayer(), a = PRU.getPRU(p).aktif;
    if (!a || a.fasa !== 'keputusan' || !a.keputusan) { return; }
    await modal({ tajuk: 'Keputusan Pengundian', isi: htmlKeputusan(a.keputusan, a), butang: [{ label: 'Teruskan', nilai: true, kelas: 'btn--gold' }] });
    var buka = a.keputusan.kabinetBuka;
    PRU.tutupKeputusan(); segarkan();
    if (PRU.nasionalTertunggak(S.loadPlayer())) { await nasional(); }
    else if (buka) { var mbk = KB && KB.maklumatMB ? KB.maklumatMB(S.loadPlayer()) : null; if (mbk && mbk.boleh) { await menteriBesar(); } else { await lobi(); } }
  }
  async function selesai() {
    var r = PRU.selesaikan();
    if (!r.ok) { toast(r.ralat, 'ralat'); segarkan(); return; }
    segarkan(); await keputusan();
  }

  async function tindak(id) {
    if (sibuk) { return; }
    var r = PRU.tindakanKempen(id);
    if (!r.ok) { toast(r.ralat, 'ralat'); segarkan(); return; }
    toast(r.mesej + (r.risiko ? (r.risiko === 'sprm' ? ' ⚠️ Pihak berkuasa mula memerhati.' : ' ⚠️ Dakwaan fitnah dibuat.') : ''), r.risiko ? 'ralat' : 'ok');
    segarkan();
    sibuk = true;
    try { if (r.kejutan) { await kejutan(); } else if (r.tamat) { await selesai(); } } finally { sibuk = false; segarkan(); }
  }

  /* ---- Kabinet ---- */
  /** v8.16: jika Dana tidak cukup untuk portfolio termurah yang IP anda layak, nyatakan kekurangan dan cadangkan tangguh. */
  function amaranDanaLobi(p, k) {
    var layak = (k.portfolio || []).filter(function (x) { return (Number(p.ip) || 0) >= x.ip; });
    if (!layak.length || layak.some(function (x) { return (Number(p.myr) || 0) >= x.myr; })) { return ''; }
    var min = layak.reduce(function (a, x) { return x.myr < a ? x.myr : a; }, layak[0].myr), kurang = min - (Number(p.myr) || 0);
    return '<div class="banner banner--gold"><strong>Dana tidak mencukupi</strong>Portfolio termurah yang anda layak perlukan RM ' + fmt(min) + ' (kurang RM ' + fmt(kurang) + '). Pilih Tangguh dan kembali bila Dana cukup.</div>';
  }
  async function lobi() {
    if (!KB) { return; }
    var guard = 0;
    while (guard++ < 5) {
      var p = S.loadPlayer(), k = KB.ringkasan(p);
      if (!k.lobi) { break; }
      var id = await modal({
        tajuk: '🏛️ Lobi Portfolio Kerajaan',
        isi: '<p>Parti membentuk kerajaan. Guna <b>IP</b> dan <b>Dana</b> untuk melobi satu portfolio. Lobi gagal = separuh kos hilang. Percubaan tinggal: <b>' + k.lobi.baki + '</b>.</p><p style="font-size:.85rem">IP: <b>' + fmt(p.ip) + '</b> · Dana: <b>RM ' + fmt(p.myr) + '</b></p>' + amaranDanaLobi(p, k) + '<ul class="acara__pil">' +
          (k.portfolio.length ? '' : '<li class="muted" style="list-style:none">Tiada portfolio dibuka pada IP anda sekarang (minimum 250 IP).</li>') + k.portfolio.map(function (x) { return opsi(x.id, esc(x.nama), esc(x.tahapNama) + ' · kos IP ' + x.ip + ' + RM ' + fmt(x.myr) + ' · peluang ± ' + x.peluang + '% · elaun +RM ' + fmt(x.elaun.myr) + ' &amp; +' + x.elaun.ip + ' IP/bulan' + (x.boleh ? '' : '<br>' + esc(x.sebab)), x.boleh); }).join('') +
          opsi('TANGGUH', 'Tangguh', 'Lobi kekal terbuka sehingga pilihan raya akan datang. Buka semula dari tab Pemilihan bila sedia.', true) + '</ul>',
        butang: []
      });
      if (!id) { break; }
      if (id === 'LEPAS') { KB.lepaskanLobi(); break; }
      if (id === 'TANGGUH') { toast('Lobi ditangguh. Anda boleh membukanya semula dari tab Pemilihan.', 'ok'); break; }   // v8.16: kekal terbuka
      var r = KB.lobiPortfolio(id);
      if (!r.ok) { toast(r.ralat, 'ralat'); continue; }
      segarkan();
      await modal({ tajuk: r.dilantik ? '🏛️ Dilantik!' : 'Lobi Gagal', isi: '<p>' + esc(r.mesej) + '</p>' });
      if (r.dilantik || r.tutup) { break; }
    }
    segarkan();
  }
  /** v7.63: Menteri Besar / Ketua Menteri (majoriti sendiri = terus; gabungan = rundingan). */
  async function menteriBesar() {
    if (!KB || !KB.maklumatMB) { return; }
    var p = S.loadPlayer(), m = KB.maklumatMB(p);
    if (!m.boleh) { toast(m.sebab || 'Tidak tersedia.', 'ralat'); return; }
    var isi = m.sendiri
      ? '<p>Parti anda menang <b>' + m.parti + '</b> daripada ' + m.jumlah + ' kerusi DUN (majoriti ' + m.ambang + '). Anda boleh mengangkat sumpah sebagai <b>' + esc(m.label) + '</b>.</p>'
      : !m.jumlah ? '<p>Rakan gabungan turut menuntut jawatan itu. Peluang menuntut ' + esc(m.label) + ': ± <b>' + m.peluang + '%</b>.</p><p style="font-size:.82rem">Gagal: hubungan gabungan -10 dan anda ditawarkan ' + (p.parti === 'PBB' ? 'Menteri Kanan' : 'EXCO Kanan') + '.</p>'
      : '<p>Parti anda <b>' + m.parti + '</b> kerusi + rakan gabungan <b>' + m.rakan + '</b> = <b>' + m.gabungan + '</b> daripada ' + m.jumlah + ' (majoriti ' + m.ambang + '). Bahagian kerusi parti dalam gabungan: <b>' + m.kongsi + '%</b>. Peluang menuntut ' + esc(m.label) + ': ± <b>' + m.peluang + '%</b>.</p><p style="font-size:.82rem">Gagal: hubungan gabungan -10 dan anda ditawarkan EXCO Kanan.</p>';
    var id = await modal({ tajuk: '👔 ' + esc(m.label) + ' ' + esc(m.negeri),
      isi: isi + '<ul class="acara__pil">' +
        opsi('TUNTUT', m.sendiri ? '👔 Angkat sumpah ' + esc(m.label) : '👔 Tuntut ' + esc(m.label), '2 AP · elaun +RM 6,000 &amp; +18 IP sebulan · Stress lebih berat', (Number(p.ap) || 0) >= 2) +
        (m.sendiri ? '' : opsi('KANAN', p.parti === 'PBB' ? '🤝 Terima Menteri Kanan' : '🤝 Terima EXCO Kanan', p.parti === 'PBB' ? 'Selamat, tanpa menuntut. Elaun Menteri Negeri.' : 'Selamat, tanpa menuntut. Elaun EXCO.', true)) +
        opsi('LAIN', 'Lobi portfolio biasa', (p.parti === 'PBB' ? 'Tidak menuntut jawatan tertinggi; pilih portfolio Menteri seperti biasa.' : 'Tidak menuntut jawatan tertinggi; pilih portfolio EXCO seperti biasa.'), true) + '</ul>', butang: [] });
    if (!id) { return; }
    if (id === 'LAIN') { await lobi(); return; }
    var r = id === 'TUNTUT' ? KB.tuntutMB() : KB.terimaExcoKanan();
    if (!r.ok) { toast(r.ralat, 'ralat'); return; }
    segarkan();
    await modal({ tajuk: r.dilantik === false ? 'Tuntutan Ditolak' : '👔 Dilantik!', isi: '<p>' + esc(r.mesej) + '</p>' });
  }
  async function acara() {
    if (!KB) { return; }
    var p = S.loadPlayer(), a = KB.acaraSemasa(p);
    if (!a) { return; }
    function teks(c) {
      function r(x) { var t = []; if (!x) { return ''; } if (x.rating) { t.push('Tadbir Urus ' + tanda(x.rating) + '%'); } if (x.tekanan) { t.push('Tekanan ' + tanda(x.tekanan)); } if (x.myr) { t.push('Dana ' + (x.myr > 0 ? '+' : '−') + 'RM ' + fmt(Math.abs(x.myr))); } if (x.ip) { t.push('IP ' + tanda(x.ip)); } if (x.stress) { t.push('Stress ' + tanda(x.stress)); } if (x.rep) { t.push('Reputasi ' + tanda(x.rep)); } if (x.pop) { t.push('Populariti ' + tanda(x.pop)); } if (x.rombak) { t.push('Risiko rombakan ' + tanda(x.rombak)); } return t.join(' · '); }
      return c.rawak ? 'Berjaya ' + Math.round(c.rawak.p * 100) + '%: ' + r(c.rawak.jaya) + ' · Gagal: ' + r(c.rawak.gagal) : r(c.kesan);
    }
    var id = await modal({
      tajuk: a.ikon + ' ' + a.tajuk,
      isi: '<p>' + esc(a.huraian) + '</p><p style="font-size:.82rem">Penarafan Tadbir Urus: <b>' + KB.getKabinet(p).governanceRating + '%</b></p><ul class="acara__pil">' + a.pilihan.map(function (c) { return opsi(c.id, esc(c.label), esc(teks(c)) + (c.boleh ? '' : '<br>' + esc(c.sebab)), c.boleh); }).join('') + '</ul>',
      butang: []
    });
    if (!id) { toast('Isu kementerian masih menunggu keputusan anda.'); return; }
    var r = KB.jawabAcara(id);
    if (!r.ok) { toast(r.ralat, 'ralat'); return; }
    toast(r.mesej + (r.rating ? ' Tadbir Urus ' + tanda(r.rating) + '%.' : ''), r.rating < 0 ? 'ralat' : 'ok'); segarkan();
  }

  /* ---- PRK (Pilihan Raya Kecil) ---- */
  function kadPRK(p) {
    if (!PK) { return ''; }
    var r = PK.ringkasan(p), a = r.aktif;
    if (!a) { return ''; }
    var kenal = (a.jenis === 'DUN' ? 'DUN ' : 'Parlimen ') + esc(a.nama);
    if (a.fasa === 'kempen') {
      var ck = PK.keadaanKempen(p), h = '<section class="card pru-kempen"><h2 class="card__title" style="margin:0 0 4px">⚡ Kempen Kilat PRK · ' + kenal + '</h2>';
      h += '<p class="note">Hari <b>' + ck.hariSemasa + '/7</b> · sentimen nasional <b>' + (ck.sentimen > 0 ? '+' : '') + ck.sentimen + '</b> · lawan: ' + esc(a.lawan) + (a.pertahan ? ' · kerusi dipertahankan' : ' · kerusi lawan') + '</p><div class="pru-hari" aria-hidden="true">';
      for (var i = 0; i < 7; i++) { h += '<i class="' + (i < ck.hariSemasa ? 'd' : i === ck.hariSemasa ? 'n' : '') + '"></i>'; }
      h += '</div>' + pecahHtml(ck.pecahan) + bar('Sokongan pengundi', a.voterSupport, a.voterSupport < 30) + bar('Dana kempen', Math.min(100, a.campaignFunds / 150), a.campaignFunds < 2500, 'RM ' + fmt(a.campaignFunds)) + bar('Tenaga jentera', a.jentera, a.jentera < 35) + bar('Stress', p.stress || 0, (p.stress || 0) >= 60);
      if (ck.hariBaki <= 0) { return h + '<button type="button" class="btn btn--primary btn--block" data-pru="prk-selesai">🗳️ Hari Mengundi: Lihat Keputusan</button></section>'; }
      h += '<div class="choice-list">' + ck.tindakan.map(function (t) {
        return '<button type="button" class="choice" data-pru="prk-tindak" data-id="' + esc(t.id) + '"' + (t.boleh ? '' : ' disabled') + '><span class="choice__title">' + t.ikon + ' ' + esc(t.nama) + (t.pengganda !== 1 ? ' <span class="badge ' + (t.pengganda > 1 ? 'badge--gold' : 'badge--red') + '">×' + t.pengganda + '</span>' : '') + '</span><span class="choice__fx">' +
          fx((t.dana ? '−RM ' + fmt(t.dana) + ' · ' : '') + (t.gain[1] ? 'Sokongan +' + t.gain[0] + '–' + t.gain[1] + '% · ' : '') + 'Stress ' + tanda(t.stress)) + '</span>' + (t.boleh ? '' : '<span class="choice__desc" style="color:var(--danger)">' + esc(t.sebab) + '</span>') + '</button>';
      }).join('') + '</div>';
      if (a.log && a.log.length) { h += '<ul class="pru-log">' + a.log.slice(0, 3).map(function (l) { return '<li><b>Hari ' + l.hari + ':</b> ' + esc(l.teks) + '</li>'; }).join('') + '</ul>'; }
      return h + '</section>';
    }
    if (a.fasa === 'keputusan') { return '<section class="card"><h2 class="card__title" style="margin:0 0 4px">⚡ Keputusan PRK ' + kenal + '</h2><button type="button" class="btn btn--primary btn--block" data-pru="prk-keputusan">Lihat Keputusan</button></section>'; }
    return '<section class="card"><h2 class="card__title" style="margin:0 0 4px">⚡ Pilihan Raya Kecil · ' + kenal + '</h2><p class="note">' + esc(r.sebab) + '. Bulan tidak boleh dimajukan sehingga PRK selesai.</p><button type="button" class="btn btn--primary btn--block" data-pru="prk-buka">Teruskan</button>' + (a.fasa === 'calon' ? '<button type="button" class="btn btn--ghost btn--block" style="margin-top:8px" data-pru="prk-tarik">Tarik diri (tidak bertanding)</button>' : '') + '</section>';
  }
  async function alirPRK() {
    if (sibuk || !PK) { return; }
    sibuk = true;
    try {
      for (var g = 0; g < 6; g++) {
        var p = S.loadPlayer(), r = PK.ringkasan(p), a = r.aktif;
        if (!a || a.fasa === 'kempen' || a.fasa === 'keputusan') { break; }
        if (a.fasa === 'isytihar') {
          var kl = r.kelayakan;
          var j = await modal({
            tajuk: '⚡ Pilihan Raya Kecil',
            isi: '<p class="acara__ikon" aria-hidden="true">🗳️</p><p><b>' + esc(r.sebab) + '</b> (kerusi ' + (a.jenis === 'DUN' ? 'DUN ' : 'Parlimen ') + esc(a.nama) + '). Hari mengundi dalam <b>7 hari</b>.</p><p style="font-size:.85rem">Sentimen nasional: <b>' + (r.sentimen > 0 ? '+' : '') + r.sentimen + '</b> · ' + (a.pertahan ? 'Kerusi dipertahankan oleh parti anda (kalah = penalti lebih berat).' : 'Kerusi dimenangi pihak lawan sebelum ini (menang = bonus tambahan).') + '</p><ul class="acara__pil">' +
              opsi('calon', 'Mohon dicalonkan', 'Syor IP ≥ ' + kl.ipMin + ' · peruntukan minimum RM ' + fmt(kl.minPeruntukan) + '<br>' + (kl.boleh ? 'Peluang diluluskan ± ' + kl.peluang + '%' : esc(kl.sebab.join('; '))), kl.boleh && (Number(p.myr) || 0) >= kl.minPeruntukan) +
              opsi('tidak', 'Tidak bertanding', 'Tiada risiko kehilangan IP.', true) + '</ul>', butang: [] });
          if (!j) { break; }
          if (j === 'tidak') { var t = PK.tidakBertanding(); toast(t.mesej || t.ralat, t.ok ? 'ok' : 'ralat'); segarkan(); break; }
          var m = PK.mohonCalon(); toast(m.mesej || m.ralat, m.diluluskan ? 'ok' : 'ralat'); segarkan();
          if (!m.ok || !m.diluluskan) { break; }
        } else if (a.fasa === 'calon') {
          var pil = r.peruntukan;
          var pr = modal({ tajuk: 'Peruntukan Kempen Kilat', isi: '<p>Kempen kilat <b>7 hari</b>: kos tinggi dan Stress naik pantas (+2 sehari selain kos tindakan). Dana anda: <b>RM ' + fmt(p.myr) + '</b>. Baki dipulangkan.</p><div class="pru-pilih" id="pru-dana">' +
            pil.pilihan.map(function (n, i) { return '<label><input type="radio" name="dana" value="' + n + '"' + tandaDana(pil, i) + '><span><b>RM ' + fmt(n) + '</b></span></label>'; }).join('') + '</div><p class="note" id="pru-ringkas-dana" aria-live="polite"></p>',
            butang: [{ label: 'Tunda', nilai: false }, { label: 'Mula Kempen 7 Hari', nilai: true, kelas: 'btn--gold', nonaktif: true }] });
          var kakiK = W.document.getElementById('modal-kaki'), mulaK = kakiK && kakiK.querySelector('button:last-child'), isiK = W.document.getElementById('modal-isi');
          if (isiK) { pasangRingkasDana(p, isiK, function () { if (mulaK) { mulaK.disabled = !isiK.querySelector('input[name=dana]:checked'); } }); }
          var ya = await pr;
          if (!ya) { break; }
          var d = W.document.querySelector('#modal-isi input[name=dana]:checked');
          var dana = d ? Number(d.value) : pil.min;
          var kk = PK.byElectionCampaign(dana); if (!kk.ok) { toast(kk.ralat, 'ralat'); break; }
          segarkan(); toast('Kempen kilat 7 hari bermula!', 'ok');
        } else { break; }
      }
    } finally { sibuk = false; segarkan(); }
  }
  async function tindakPRK(id) {
    if (sibuk) { return; }
    var r = PK.tindakanKilat(id);
    if (!r.ok) { toast(r.ralat, 'ralat'); segarkan(); return; }
    toast(r.mesej, 'ok'); segarkan();
    if (r.tamat) { await selesaiPRK(); }
  }
  async function tarikDiriPRK() {                                  // v7.18
    var ya = await modal({ tajuk: 'Tarik Diri daripada PRK?', isi: '<p>Anda tidak akan bertanding dalam PRK ini. Bulan boleh dimajukan semula selepas itu.</p>', butang: [{ label: 'Batal', nilai: false }, { label: 'Ya, Tarik Diri', nilai: true, kelas: 'btn--danger' }] });
    if (!ya) { return; }
    var t = PK.tidakBertanding(); toast(t.mesej || t.ralat, t.ok ? 'ok' : 'ralat'); segarkan();
  }
  async function selesaiPRK() {
    var r = PK.selesaikan();
    if (!r.ok) { toast(r.ralat, 'ralat'); segarkan(); return; }
    segarkan(); await keputusanPRK();
  }
  async function keputusanPRK() {
    var p = S.loadPlayer(), a = PK.getPRK(p).aktif;
    if (!a || a.fasa !== 'keputusan' || !a.keputusan) { return; }
    var k = a.keputusan, h = '<div class="pru-menang' + (k.menang ? '' : ' pru-kalah') + '">' + (k.menang ? '🎉 Anda Menang PRK!' : 'Anda Tewas PRK') + '</div>';
    h += '<p style="text-align:center"><b>' + (k.menang ? (a.jenis === 'DUN' ? 'ADUN ' : 'Ahli Parlimen ') : 'Kerusi ') + esc(a.nama) + '</b></p>';
    h += pecahHtml([{ nama: 'Anda (UMNO)', nilai: k.anda, ke: 'anda' }, { nama: k.lawanNama, nilai: k.lawan, ke: 'lawan' }]);
    h += '<div class="kv"><span>Majoriti</span><b>' + (k.menang ? '' : 'kalah ') + fmt(k.majoriti) + ' undi</b></div><div class="kv"><span>Ayunan sentimen nasional</span><b>' + (k.sentimen > 0 ? '+' : '') + k.sentimen + '%</b></div>';
    h += k.menang ? '<h3 style="margin:12px 0 4px">Ganjaran</h3><div class="kv"><span>Pengaruh (IP)</span><b class="pru-ok">+' + k.bonusIp + '</b></div><div class="kv"><span>Kestabilan</span><b class="pru-ok">' + esc(k.stabil) + '</b></div>'
      : '<h3 style="margin:12px 0 4px">Penalti</h3><div class="kv"><span>Pengaruh (IP)</span><b class="pru-ng">−' + k.penaltiIp + '</b></div><div class="kv"><span>Kestabilan</span><b class="pru-ng">' + esc(k.stabil) + '</b></div>';
    await modal({ tajuk: 'Keputusan PRK', isi: h, butang: [{ label: 'Teruskan', nilai: true, kelas: 'btn--gold' }] });
    PK.tutupKeputusan(); segarkan();
  }

  async function salurCDF(jumlah) {
    var r = KB.salurCDF(jumlah);
    toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); segarkan();
  }
  async function majuJanji(id) {
    var r = PRU.majukanJanji(id);
    toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); segarkan();
  }

  async function selepasBulan(peristiwa) {
    var senarai = peristiwa || [];
    if (senarai.some(function (e) { return e.jenis === 'prk_isytihar'; })) { await alirPRK(); return; }
    if (senarai.some(function (e) { return e.jenis === 'pru_isytihar'; })) { await alir(); return; }
    if (senarai.some(function (e) { return e.jenis === 'kabinet_acara'; })) { await acara(); }
  }

  W.document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-pru]') : null;
    if (!t || t.disabled) { return; }
    var a = t.getAttribute('data-pru');
    if (a === 'buka') { alir(); } else if (a === 'tindak') { tindak(t.getAttribute('data-id')); } else if (a === 'kejutan') { sibuk = true; kejutan().then(function () { sibuk = false; segarkan(); }, function () { sibuk = false; }); }
    else if (a === 'selesai') { selesai(); } else if (a === 'nasional') { nasional(); } else if (a === 'keputusan') { keputusan(); } else if (a === 'lobi') { lobi(); } else if (a === 'mb') { menteriBesar(); } else if (a === 'acara') { acara(); } else if (a === 'tarik') { tarikDiriPRU(); } else if (a === 'prk-tarik') { tarikDiriPRK(); } else if (a === 'prk-buka') { alirPRK(); } else if (a === 'prk-tindak') { tindakPRK(t.getAttribute('data-id')); } else if (a === 'prk-selesai') { selesaiPRK(); } else if (a === 'prk-keputusan') { keputusanPRK(); } else if (a === 'cdf') { salurCDF(t.getAttribute('data-jumlah')); } else if (a === 'janji') { majuJanji(t.getAttribute('data-id')); }
  });

  W.NusaPRU_UI = {  nasional: nasional, musim: musim, kad: kad, lencana: lencana, selepasBulan: selepasBulan, alir: alir, kejutan: kejutan, keputusan: keputusan, lobi: lobi, acara: acara, selesai: selesai };
})(window);
