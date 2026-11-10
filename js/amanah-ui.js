/* ==========================================================================
   Nusa Politik — js/amanah-ui.js   (v13.56)
   Kad "🟠 Amanah: Parti & Konvensyen" di tab Profil (logik dalam js/amanah.js). Gaya kongsi .pkr-* daripada js/dap-ui.js / js/pkr-ui.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikAmanah, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Number(n || 0).toLocaleString('en'); }
  function U() { return W.NusaUI || {}; }
  function kv(a, b) { return '<div class="kv"><span>' + a + '</span><b>' + b + '</b></div>'; }
  function meter(label, n, nilai) {
    var w = Math.max(0, Math.min(100, Math.round(n))), warna = w >= 50 ? 'var(--success)' : w >= 35 ? 'var(--warning)' : 'var(--danger)';
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + esc(nilai) + '</b></div><div class="progress progress--sm" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + w + '"><div class="progress__bar" style="width:' + w + '%;background:' + warna + '"></div></div></div>';
  }
  function butang(aksi, label, st0, extra) { return '<button type="button" class="btn btn--sm btn--ghost" data-amn="' + aksi + '"' + (extra || '') + (st0.boleh ? '' : ' disabled') + '>' + label + '</button>'; }
  function sebab(st0) { return st0.boleh ? '' : '<p class="note" style="margin:4px 0 0">' + esc(st0.sebab) + '</p>'; }
  function titik(n, w) { var x = ''; for (var i = 0; i < n; i++) { x += '<i style="background:' + w + '"></i>'; } return x; }
  var pilihKw = null;
  function kad(p) {
    try {
      if (!M.adalah(p)) { return ''; }
      var k = M.kawasan(p), C = M.CONFIG, h = '<section class="card amn-kad"><h2 class="card__title" style="margin:0 0 4px">🟠 Amanah: Parti &amp; Konvensyen</h2>';
      h += '<h3 class="pkr-h">Pakatan Harapan</h3><div class="pkr-rakan"><span class="pkr-chip pkr-chip--anda" style="border-color:#F7941D"><img src="assets/images/logo-amanah.png" alt="">Amanah</span>' +
        C.RAKAN.map(function (r) { return '<span class="pkr-chip" title="' + esc(r.penuh) + '"><img src="' + esc(r.logo) + '" alt="">' + esc(r.nama) + '</span>'; }).join('') + '</div>' +
        '<p class="note">Rakan PH dimainkan sebagai NPC. PH memimpin Kerajaan Perpaduan bersama rakan. Kerajaan negeri dipimpin PH: ' + esc(C.KERAJAAN_NEGERI.join(', ')) + '.</p>';
      h += '<h3 class="pkr-h">Kawasan &amp; kuota PH</h3>';
      if (k.parlimen) {
        h += kv('Kawasan ' + esc(k.parlimen.n), 'Pengundi Bumiputera ' + k.parlimen.m + '% · kedudukan ' + k.parlimen.r + '/' + k.bilBahagian) +
          kv('Kerusi Parlimen', k.kuotaPL ? '✅ dalam kuota Amanah (' + C.KUOTA_PARLIMEN + ')' : '⛔ untuk rakan PH (kuota Amanah ' + C.KUOTA_PARLIMEN + ')') +
          kv('Kerusi DUN', k.dun ? esc(k.dun.n) + ' · ' + (k.kuotaDUN ? '✅ dalam kuota (' + C.KUOTA_DUN + ')' : '⛔ untuk rakan PH (kuota ' + C.KUOTA_DUN + ')') : 'Tiada DUN');
      }
      h += kv('Pemilihan parti', M.adalahTahunPemilihan(p, p.tahun) ? '🗳️ Tahun ini (' + p.tahun + ')' : 'Seterusnya ' + M.tahunSeterusnya(p, p.tahun) + ' (setiap 3 tahun)');
      // Naratif Rahmah
      var nr = M.naratif(p), sc = M.statusCeramah(p);
      h += '<h3 class="pkr-h">🕌 Naratif Rahmah</h3>' + meter('Naratif Rahmah', nr, Math.round(nr) + ' / 100') +
        '<p class="note">Islam progresif menentang PAS di kerusi Melayu (Bumiputera 50%+): ofset undi kerusi ±' + C.NARATIF.ofset + ' ikut Naratif. Susut ' + C.NARATIF.susut + ' sebulan ke arah ' + C.NARATIF.awal + '.</p>' +
        butang('ceramah', '🕌 Ceramah Rahmah (' + C.NARATIF.ap + ' AP, ' + rm(C.NARATIF.myr) + ', +' + C.NARATIF.naik + ')', sc) + sebab(sc);
      // Konvensyen Negeri
      var rn = M.ringkasNegeri(p), sn = M.statusNegeri(p), n = p.amanah && p.amanah.negeri, jn = M.jawatanNegeri(p);
      h += '<h3 class="pkr-h">🏢 Konvensyen Negeri</h3><p class="note">Konvensyen Negeri memilih Jawatankuasa Pimpinan Negeri setiap 3 tahun; Pengerusi Negeri ialah salah seorang 14 ahli mesyuarat yang memilih Presiden (Perlembagaan Amanah, Fasal 14.1, 17.1, 17.2). 10 perwakilan setiap Kawasan. Calon: pemegang jawatan Kawasan; pilih pada bulan ' + C.NEGERI.bulan[0] + ' hingga ' + C.NEGERI.bulan[1] + ', keputusan awal bulan ' + C.NEGERI.keputusan + '.</p>' +
        kv('Negeri', esc(rn.negeri || '-') + ' · ' + rn.kawasan + ' Kawasan · ' + rn.perwakilan + ' perwakilan') + meter('Sokongan perwakilan negeri', rn.purata, rn.purata + '%') +
        kv('Jawatan anda', jn ? '✅ ' + esc(C.NAMA_NEGERI[jn.jawatan]) + ' ' + esc(jn.nama) + ' (' + jn.tahun + ')' : 'Tiada');
      if (n && n.tahun === parseInt(p.tahun, 10) && n.hasil && n.hasil.bertanding) { h += kv('Keputusan', Math.round(n.hasil.skor) + '% · perlu ' + n.hasil.perlu + '% · ' + (n.hasil.menang ? '✅ dipilih' : '❌ tidak dipilih')); }
      else if (n && n.tahun === parseInt(p.tahun, 10) && n.sasaran) { h += kv('Sasaran', esc(C.NAMA_NEGERI[n.sasaran]) + ' (ambang ' + C.NEGERI.ambang[n.sasaran] + '%)'); }
      h += Object.keys(C.NAMA_NEGERI).map(function (x) { return butang('negeri', esc(C.NAMA_NEGERI[x]), sn, ' data-kod="' + x + '"'); }).join(' ') + sebab(sn);
      // Konvensyen Nasional
      var r = M.ringkasPusat(p), sj = M.statusJelajah(p);
      h += '<h3 class="pkr-h">Konvensyen Nasional: perwakilan Kawasan</h3><p class="note">Ketua Kawasan dan 4 perwakilan setiap Kawasan mengundi di Konvensyen Nasional, yang memilih 27 ahli JPN setiap 3 tahun (Perlembagaan Amanah, Fasal 12.1, 17.1(a)). Jelajah: +' + C.PUSAT.jelajahNaik + '% di satu Kawasan pilihan, sekali sebulan.</p>' +
        meter('Sokongan perwakilan Konvensyen', r.purata, r.sokongUndi + ' / ' + r.pengundi) + kv('Kawasan condong kepada anda', r.condong + ' / ' + r.bilBahagian);
      if (!pilihKw || !r.senarai.some(function (x) { return x.kod === pilihKw; })) { pilihKw = r.senarai[0] && r.senarai[0].kod; }
      h += '<label class="note" for="amn-kw">Kawasan untuk dijelajah</label><select id="amn-kw" class="select" style="width:100%;margin:4px 0 6px" data-amn-kw>' +
        r.senarai.map(function (x) { return '<option value="' + esc(x.kod) + '"' + (x.kod === pilihKw ? ' selected' : '') + '>' + esc(x.nama) + ' (' + esc(x.neg) + ') · ' + x.sokongan + '%</option>'; }).join('') + '</select>' +
        butang('jelajah', '🚗 Jelajah Kawasan (' + C.PUSAT.jelajahAP + ' AP, ' + rm(C.PUSAT.jelajahMYR) + ', +' + C.PUSAT.jelajahNaik + '%)', sj) + sebab(sj);
      // Hubungan JPN & Mesyuarat JPN
      var hb = M.hubJPN(p), H = C.HUB, mt = M.mesyuarat(p), sm = M.statusMesyuarat(p), MS = C.MESYUARAT;
      h += '<h3 class="pkr-h">🎯 Hubungan JPN</h3>' + meter('Hubungan JPN', hb, Math.round(hb) + ' / 100') +
        '<p class="note">Hubungan JPN memberi ±' + Math.round(H.calon * 100) + ' mata peluang dicalonkan dalam PRU. Naik apabila menjadi Ahli JPN (+' + H.ahliJPN + '), memenangi jawatan Negeri (+' + H.negeri + '), mencarum elaun (+' + H.caruman + ' sebulan, Fasal 23.7) atau melobi (+' + H.lobi + '); turun apabila dihukum Lembaga Tatatertib (' + H.hukum + ').</p>';
      h += '<h3 class="pkr-h">🏛️ Mesyuarat JPN</h3><p class="note">27 ahli JPN yang dipilih, 3 ketua sayap dan 14 Pengerusi Negeri (44 orang) memilih Presiden, Timbalan Presiden dan Naib Presiden dari kalangan 27 itu (Perlembagaan Amanah, Fasal 17.1(b)). Perlu ' + MS.majoriti + ' / ' + MS.ahli + ' undi untuk Presiden atau Timbalan Presiden; Naib Presiden sekurang-kurangnya ' + MS.naibMin + ' undi. Presiden maksimum ' + C.PRESIDEN_PENGGAL + ' penggal berturut-turut.</p>';
      if (mt) {
        h += '<div class="dap-titik">' + titik(1, '#F7941D') + titik(mt.sokong, '#2e7d32') + titik(mt.belum, '#bdbdbd') + titik(mt.lawan, '#455a64') + '</div>' +
          kv('Undian', 'Anda · ' + mt.sokong + ' menyokong · ' + mt.belum + ' belum memutuskan · ' + mt.lawan + ' menyokong lawan') + kv('Sasaran', mt.sasaran ? esc(C.SASARAN[mt.sasaran]) : 'Belum dipilih');
        if (mt.hasil) { h += kv('Keputusan', mt.hasil.bertanding ? mt.hasil.undi + ' / ' + MS.ahli + ' undi · ' + (mt.hasil.menang ? '✅ dipilih' : '❌ tidak dipilih') : 'Tidak bertanding'); }
        else {
          h += Object.keys(C.SASARAN).map(function (x) { return butang('sasaran', esc(C.SASARAN[x]), sm, ' data-kod="' + x + '"'); }).join(' ') + ' ' + butang('sasaran', 'Tidak bertanding', sm, ' data-kod=""') + sebab(sm);
          var sl = M.statusLobi(p); h += '<div style="margin-top:6px">' + butang('lobi', '🤝 Lobi ahli mesyuarat (' + MS.lobiAP + ' AP, ' + rm(MS.lobiMYR) + ')', sl) + sebab(sl) + '</div>';
        }
      } else { h += '<p class="note">' + esc(sm.sebab) + '</p>'; }
      h += kv('Penggal Presiden anda', M.penggalPresiden(p) + ' / ' + C.PRESIDEN_PENGGAL);
      return h + '<p class="note" style="margin-top:8px">Struktur ikut Perlembagaan Parti Amanah Negara 2022. ⚠️ Takwim, kuota kerusi, Naratif Rahmah dan ambang undi ialah andaian permainan.</p></section>';
    } catch (e) { return ''; }
  }
  W.document.addEventListener('change', function (ev) { var t = ev.target; if (t && t.hasAttribute && t.hasAttribute('data-amn-kw')) { pilihKw = t.value; } });
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-amn]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-amn'), r = a === 'jelajah' ? M.jelajah(pilihKw) : a === 'lobi' ? M.lobi() : a === 'ceramah' ? M.ceramah()
      : a === 'sasaran' ? M.pilihSasaran(b.getAttribute('data-kod') || null) : a === 'negeri' ? M.pilihNegeri(b.getAttribute('data-kod') || null) : null;
    if (!r) { return; }
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  var st = W.document.createElement('style');
  st.textContent = '.pkr-h{font-size:.92rem;margin:12px 0 4px}.pkr-rakan{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0}.pkr-chip{display:inline-flex;align-items:center;gap:5px;border:2px solid var(--garis,var(--border));border-radius:10px;padding:3px 8px;font-size:.8rem;font-weight:700;opacity:.75}' +
    '.pkr-chip img{width:26px;height:18px;object-fit:contain;border-radius:3px;background:#fff}.pkr-chip--anda{opacity:1}.dap-titik{display:flex;flex-wrap:wrap;gap:3px;margin:6px 0}.dap-titik i{display:inline-block;width:13px;height:13px;border-radius:50%}';
  W.document.head.appendChild(st);
  W.MyPolitikAmanahUI = { kad: kad };
})(window);
