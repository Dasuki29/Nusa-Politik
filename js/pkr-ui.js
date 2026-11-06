/* ==========================================================================
   Nusa Politik — js/pkr-ui.js   (v13.34; v13.36: Fasa 2: Semangat Reformasi, Pasukan Perwakilan, Kem Dalaman, Presiden)
   Kad "PKR: Parti & Kongres Nasional" di tab Profil (logik dalam js/pkr.js).
   ========================================================================== */
(function (W) {
  'use strict';
  var M = W.MyPolitikPKR, S = W.MyPolitikSave;
  if (!M || !S) { return; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Number(n || 0).toLocaleString('en'); }
  function U() { return W.NusaUI || {}; }
  function kv(a, b) { return '<div class="kv"><span>' + a + '</span><b>' + b + '</b></div>'; }
  function meter(label, n, nilai) {
    var w = Math.max(0, Math.min(100, Math.round(n))), warna = w >= 50 ? 'var(--success)' : w >= 35 ? 'var(--warning)' : 'var(--danger)';
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + esc(nilai) + '</b></div><div class="progress progress--sm" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + w + '"><div class="progress__bar" style="width:' + w + '%;background:' + warna + '"></div></div></div>';
  }
  var pilihKw = null, isi = { calon: null, wanita: null, minoriti: null };
  function kad(p) {
    try {
      if (!M.adalah(p)) { return ''; }
      var k = M.kawasan(p), C = M.CONFIG, h = '<section class="card pkr-kad"><h2 class="card__title" style="margin:0 0 4px">👁️ PKR: Parti &amp; Kongres Nasional</h2>';
      // Gabungan PH
      h += '<h3 class="pkr-h">Pakatan Harapan</h3><div class="pkr-rakan"><span class="pkr-chip pkr-chip--anda"><img src="assets/images/logo-pkr.png" alt="">PKR</span>' +
        C.RAKAN.map(function (r) { return '<span class="pkr-chip" title="' + esc(r.penuh) + '">' + (r.logo ? '<img src="' + esc(r.logo) + '" alt="">' : '') + esc(r.nama) + '</span>'; }).join('') + '</div>' +
        '<p class="note">Rakan PH dimainkan sebagai NPC. PH memimpin Kerajaan Perpaduan bersama rakan; selepas PRU, rakan gabungan perlu dirundingkan semula. Kerajaan negeri dipimpin PH: ' + esc(C.KERAJAAN_NEGERI.join(', ')) + '.</p>';
      // Cabang & kuota
      h += '<h3 class="pkr-h">Cabang &amp; kuota PH</h3>';
      if (k.parlimen) {
        h += kv('Cabang ' + esc(k.parlimen.n), 'Pengundi Bumiputera ' + k.parlimen.m + '% · kedudukan ' + k.parlimen.r + '/' + k.bilBahagian) +
          kv('Kerusi Parlimen', k.kuotaPL ? '✅ dalam kuota PKR (' + C.KUOTA_PARLIMEN + ')' : '⛔ untuk rakan PH (kuota PKR ' + C.KUOTA_PARLIMEN + ')') +
          kv('Kerusi DUN', k.dun ? esc(k.dun.n) + ' · ' + (k.kuotaDUN ? '✅ dalam kuota (' + C.KUOTA_DUN + ')' : '⛔ untuk rakan PH (kuota ' + C.KUOTA_DUN + ')') : 'Tiada DUN');
      }
      var seterus = M.tahunSeterusnya(p, p.tahun), kini = M.adalahTahunPemilihan(p, p.tahun);
      h += kv('Pemilihan parti', kini ? '🗳️ Tahun ini (' + p.tahun + ')' : 'Seterusnya ' + seterus + ' (setiap 3 tahun)');
      // Pemilihan Pusat
      var r = M.ringkasPusat(p), sj = M.statusJelajah(p);
      h += '<h3 class="pkr-h">Kongres Nasional: perwakilan Cabang</h3><p class="note">Presiden, Timbalan Presiden, 4 Naib Presiden dan 20 Ahli Majlis Pimpinan Pusat dipilih setiap 3 tahun. Setiap Cabang menghantar 46 Perwakilan Jawatankuasa Cabang dan 40 Perwakilan Biasa (mengundi dalam talian), ditambah 10 bagi setiap 1,000 anggota melebihi 3,000, maksimum 156 (Perlembagaan PKR, Fasal 17.2A dan 21.4).</p>' +
        '<p class="note pkr-panduan">Naikkan sokongan perwakilan sebelum Kongres Nasional. Jelajah: +' + C.PUSAT.jelajahNaik + '% di satu Cabang pilihan, sekali sebulan.</p>' +
        meter('Sokongan perwakilan Cabang', r.purata, r.sokongUndi + ' / ' + r.pengundi) + kv('Cabang condong kepada anda', r.condong + ' / ' + r.bilBahagian);
      if (!pilihKw || !r.senarai.some(function (x) { return x.kod === pilihKw; })) { pilihKw = r.senarai[0] && r.senarai[0].kod; }
      h += '<label class="note" for="pkr-cb">Cabang untuk dijelajah</label><select id="pkr-cb" class="select" style="width:100%;margin:4px 0 6px" data-pkr-cb>' +
        r.senarai.map(function (x) { return '<option value="' + esc(x.kod) + '"' + (x.kod === pilihKw ? ' selected' : '') + '>' + esc(x.nama) + ' · ' + x.sokongan + '% · ' + x.wakil + ' wakil</option>'; }).join('') + '</select>' +
        '<button type="button" class="btn btn--sm btn--ghost" data-pkr="jelajah"' + (sj.boleh ? '' : ' disabled') + '>🚗 Jelajah Cabang (' + C.PUSAT.jelajahAP + ' AP, ' + rm(C.PUSAT.jelajahMYR) + ', +' + C.PUSAT.jelajahNaik + '%)</button>' + (sj.boleh ? '' : ' <small class="note">' + esc(sj.sebab) + '</small>');
      h += fasa2(p, C);
      return h + '<p class="note" style="margin-top:8px">Struktur ikut Perlembagaan PKR (pindaan hingga 11 Mac 2025); kuota kerusi dan kekuatan negeri ialah andaian permainan.</p></section>';
    } catch (e) { return ''; }
  }
  /* ---------- v13.36: Fasa 2 ---------- */
  function butang(aksi, label, st0, extra) { return '<button type="button" class="btn btn--sm btn--ghost" data-pkr="' + aksi + '"' + (extra || '') + (st0.boleh ? '' : ' disabled') + '>' + label + '</button>'; }
  function sebab(st0) { return st0.boleh ? '' : '<p class="note" style="margin:4px 0 0">' + esc(st0.sebab) + '</p>'; }
  function fasa2(p, C) {
    var h = '', ref = M.reformasi(p), sf = M.statusForum(p), R = C.REFORMASI;
    // Semangat Reformasi
    h += '<h3 class="pkr-h">🔥 Semangat Reformasi</h3>' + meter('Semangat Reformasi', ref, Math.round(ref) + ' / 100') +
      '<p class="note">Naik apabila skor Integriti ' + R.integritiTinggi + ' ke atas atau melalui Forum Reformasi; turun apabila Integriti bawah ' + R.integritiRendah + ', dihukum Lembaga Disiplin atau menangguhkan pemilihan. Kesan: ±' + R.undi + ' kekuatan undi pemilihan Cabang dan Pusat, ±' + Math.round(R.calon * 100) + ' mata peluang dicalonkan PRU.</p>' +
      kv('Kesan semasa', (M.bonusUndi(p, 'pusat') >= 0 ? '+' : '') + M.bonusUndi(p, 'pusat') + ' undi · ' + (M.adjCalon(p) >= 0 ? '+' : '') + Math.round(M.adjCalon(p) * 100) + ' calon') +
      butang('forum', '🎤 Forum Reformasi (' + R.forumAP + ' AP, ' + rm(R.forumMYR) + ', +' + R.forum + ')', sf) + sebab(sf);
    // Pasukan Perwakilan
    var m = p.pkr || {}, pk = m.pasukan, kp = M.kawasan(p).parlimen, P0 = C.PASUKAN;
    h += '<h3 class="pkr-h">🗳️ Pasukan Perwakilan Cabang</h3><p class="note">Perwakilan Biasa dan Perwakilan Tambahan dipilih oleh anggota Cabang, dengan kuota jantina dan etnik minoriti ikut demografi kawasan (Perlembagaan PKR, Fasal 17.2B). Mereka mengundi pimpinan Pusat secara dalam talian.</p>';
    if (pk && pk.tahun === p.tahun) {
      h += kv('Pasukan ' + p.tahun, pk.calon + ' calon · wanita ' + pk.wanita + ' · minoriti ' + pk.minoriti) + kv('Kuota', pk.patuh ? '✅ dipenuhi' : '⚠️ tidak dipenuhi (' + P0.denda + '% undi)');
      h += pk.hasil ? kv('Keputusan', pk.hasil.peratus + '% undi · ' + pk.hasil.menang + ' / ' + pk.calon + ' menang · sokongan ' + pk.hasil.sokongan + '%') : '<p class="note">Keputusan diumumkan pada awal bulan Kongres Nasional.</p>';
    } else if (kp) {
      var sp = M.statusPasukan(p), maks = M.kerusiPasukan(kp.kod);
      if (!sp.boleh) { h += '<p class="note">' + esc(sp.sebab) + '</p>'; }
      else {
        var calon = Math.min(maks, Math.max(P0.setiap, Math.round((isi.calon || Math.floor(maks / 2 / P0.setiap) * P0.setiap) / P0.setiap) * P0.setiap)), q = M.kuotaPasukan(p, calon);
        var wn = isi.wanita == null ? q.wanita : Math.min(calon, isi.wanita), mn = isi.minoriti == null ? q.minoriti : Math.min(calon, isi.minoriti), kos = M.kosPasukan(calon);
        var patuh = wn >= q.wanita && mn >= q.minoriti, ang = M.anggaranPasukan(p, { patuh: patuh });
        h += kv('Cabang ' + esc(kp.n), M.perwakilan(kp.kod) + ' perwakilan · ' + maks + ' dipilih anggota') +
          '<div class="pkr-borang"><label class="note">Calon pasukan anda<input type="number" class="input" data-pkr-isi="calon" min="' + P0.setiap + '" max="' + maks + '" step="' + P0.setiap + '" value="' + calon + '"></label>' +
          '<label class="note">Calon wanita (kuota ' + q.wanita + ')<input type="number" class="input" data-pkr-isi="wanita" min="0" max="' + calon + '" value="' + wn + '"></label>' +
          '<label class="note">Calon etnik minoriti (kuota ' + q.minoriti + ')<input type="number" class="input" data-pkr-isi="minoriti" min="0" max="' + calon + '" value="' + mn + '"></label></div>' +
          '<p class="note">Kuota etnik minoriti ikut demografi kawasan: ' + q.peratusMinoriti + '% pengundi ' + (q.majoritiBumi ? 'bukan Bumiputera' : 'Bumiputera') + '.</p>' +
          kv('Kuota', patuh ? '✅ dipenuhi' : '⚠️ tidak dipenuhi: pasukan didenda ' + P0.denda + '% undi') + kv('Anggaran undi anggota', Math.round(ang) + '%') +
          butang('pasukan', '📋 Daftar Pasukan (' + kos.ap + ' AP, ' + rm(kos.myr) + ')', { boleh: (Number(p.ap) || 0) >= kos.ap && (Number(p.myr) || 0) >= kos.myr }) + ((Number(p.ap) || 0) >= kos.ap && (Number(p.myr) || 0) >= kos.myr ? '' : ' <small class="note">AP atau dana tidak mencukupi.</small>');
      }
    }
    // Kem Dalaman
    var kk = M.kekuatanKem(p), sk = M.statusKem(p), K = C.KEM;
    h += '<h3 class="pkr-h">⚖️ Kem Dalaman</h3><div class="pkr-kem">' + ['A', 'B'].map(function (x) { return '<div class="pkr-kem__k' + (m.kem === x ? ' pkr-kem__k--anda' : '') + '"><b>' + esc(K.NAMA[x]) + '</b><small>Kekuatan MPP ' + kk[x] + '%</small></div>'; }).join('') + '</div>' +
      kv('Pilihan anda', m.kem ? esc(K.NAMA[m.kem]) : 'Berkecuali') + (m.kemMenang ? kv('Kongres ' + m.kemMenang.tahun, esc(K.NAMA[m.kemMenang.kem]) + ' menguasai MPP') : '') +
      (M.adjLantikan(p) ? '<p class="note">⚠️ Kem lawan menguasai MPP: peluang lantikan kerajaan ' + Math.round(K.lantikan * 100) + ' mata.</p>' : '') +
      '<p class="note">Pilih sekali setiap penggal. Kem pilihan: +' + K.bonus + ' sokongan perwakilan di Cabang kem itu. Jika kem lawan menang Kongres: peluang lantikan kerajaan ' + Math.round(K.lantikan * 100) + ' mata. Berkecuali: tiada bonus, tiada risiko.</p>' +
      butang('kem', 'Sertai ' + esc(K.NAMA.A), sk, ' data-kem="A"') + ' ' + butang('kem', 'Sertai ' + esc(K.NAMA.B), sk, ' data-kem="B"') + ' ' + butang('kem', 'Berkecuali', sk, ' data-kem=""') + sebab(sk);
    // Presiden
    var stg = M.statusTangguh(p);
    h += '<h3 class="pkr-h">👑 Presiden</h3>' + kv('Penggal Presiden anda', M.penggalPresiden(p) + ' / ' + C.PRESIDEN_PENGGAL) +
      '<p class="note">Presiden maksimum ' + C.PRESIDEN_PENGGAL + ' penggal (Perlembagaan PKR, Fasal 21.11). Majlis Pimpinan Pusat boleh mengawalkan atau menangguhkan pemilihan sehingga 18 bulan (Perlembagaan PKR, Fasal 47.3).</p>' +
      butang('tangguh', '⏸️ Tangguh pemilihan 12 bulan (Semangat Reformasi ' + R.tangguh + ')', stg) + sebab(stg);
    return h;
  }
  W.document.addEventListener('input', function (ev) { var t = ev.target; if (t && t.hasAttribute && t.hasAttribute('data-pkr-isi')) { isi[t.getAttribute('data-pkr-isi')] = parseInt(t.value, 10) || 0; } });
  W.document.addEventListener('change', function (ev) {
    var t = ev.target; if (t && t.hasAttribute && t.hasAttribute('data-pkr-cb')) { pilihKw = t.value; }
    if (t && t.hasAttribute && t.hasAttribute('data-pkr-isi')) { isi[t.getAttribute('data-pkr-isi')] = parseInt(t.value, 10) || 0; if (t.getAttribute('data-pkr-isi') === 'calon') { isi.wanita = null; isi.minoriti = null; } if (U().render) { U().render(); } }
  });
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-pkr]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-pkr'), r = a === 'jelajah' ? M.jelajah(pilihKw) : a === 'forum' ? M.forum() : a === 'tangguh' ? M.tangguh()
      : a === 'kem' ? M.pilihKem(b.getAttribute('data-kem') || null) : a === 'pasukan' ? (function () {
        var bx = b.closest('.pkr-kad'), v = function (k) { var e = bx && bx.querySelector('[data-pkr-isi="' + k + '"]'); return e ? parseInt(e.value, 10) || 0 : 0; };
        return M.susunPasukan(v('calon'), v('wanita'), v('minoriti')); })() : null;
    if (!r) { return; }
    if (U().toast) { U().toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); }
    if (U().render) { U().render(); }
  });
  var st = W.document.createElement('style');
  st.textContent = '.pkr-h{font-size:.92rem;margin:12px 0 4px}.pkr-rakan{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0}.pkr-chip{display:inline-flex;align-items:center;gap:5px;border:2px solid var(--garis,var(--border));border-radius:10px;padding:3px 8px;font-size:.8rem;font-weight:700;opacity:.75}' +
    '.pkr-chip img{width:26px;height:18px;object-fit:contain;border-radius:3px;background:#fff}.pkr-chip--anda{opacity:1;border-color:#00AEEF}' +
    '.pkr-borang{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px;margin:6px 0}.pkr-borang label{display:flex;flex-direction:column;gap:3px}.pkr-borang input{width:100%}' +
    '.pkr-kem{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:4px 0}.pkr-kem__k{border:2px solid var(--garis,var(--border));border-radius:10px;padding:6px 8px;display:flex;flex-direction:column}.pkr-kem__k--anda{border-color:#00AEEF;background:rgba(0,174,239,.08)}';
  W.document.head.appendChild(st);
  W.MyPolitikPKRUI = { kad: kad };
})(window);
