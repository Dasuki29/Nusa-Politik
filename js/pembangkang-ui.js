/* ==========================================================================
   Nusa Politik — js/pembangkang-ui.js   (v13.50)
   Kad Ketua Pembangkang / MP pembangkang dalam tab Dewan (Dewan Rakyat). Logik dalam js/pembangkang.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var PB = W.MyPolitikPembangkang, S = W.MyPolitikSave;
  if (!PB || !S) { return; }
  var pilihB = {};                                          // pilihan Kabinet Bayangan sementara
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('en'); }
  function btn(id, teks, t, kelas) { return '<button type="button" class="btn btn--sm' + (kelas ? ' ' + kelas : '') + '" data-pbg="' + id + '"' + (t && t.boleh === false ? ' disabled' : '') + '>' + esc(teks) + '</button>'; }
  function act(tajuk, info, t, b) { return '<div class="prkl-act"><div><b>' + tajuk + '</b><small>' + esc(info) + '</small>' + (t && !t.boleh && t.sebab ? '<small class="jm-amaran">' + esc(t.sebab) + '</small>' : '') + '</div>' + b + '</div>'; }
  function htmlBayangan(p, k) {
    var J = W.MyPolitikJemaah, b = k.bayangan; if (!J) { return ''; }
    var h = '<h3 style="margin:10px 0 4px">🗂️ Kabinet Bayangan</h3>';
    if (b && b.umum) {
      return h + '<p class="note">Kecekapan ' + b.kecekapan + ' · kesan Naratif ×' + b.pengganda + '</p><ul class="prkl-sejarah" style="list-style:none;padding:0;margin:0">' + b.senarai.map(function (x) {
        return '<li style="padding:3px 0;border-top:1.5px dashed var(--border)"><b>' + esc(x.portfolio.replace(/^Menteri /, '')) + '</b>: ' + esc(x.nama) + '<small style="display:block;color:var(--text-muted)">' + esc(x.jawatan) + '</small></li>';
      }).join('') + '</ul>';
    }
    var kol = PB.calonBayangan(p), n = PB.nilaiBayangan(p, pilihB);
    h += '<p class="note">Lantik 8 Menteri Bayangan daripada struktur parti. Kecekapan purata menambah kesan Naratif (×1.0 hingga ×1.3); pemimpin dilantik: Sokongan AJK +2.</p>';
    h += J.CONFIG.UTAMA.map(function (nm) {
      return '<label class="jm-port"><span>' + esc(nm.replace(/^Menteri /, '')) + '</span><select data-pbg-port="' + esc(nm) + '"><option value="">— Pilih —</option>' + kol.map(function (c) {
        return '<option value="' + esc(c.id) + '"' + (pilihB[nm] === c.id ? ' selected' : '') + '>' + esc(c.jawatan + ': ' + c.nama + ' · K' + c.kecekapan) + '</option>';
      }).join('') + '</select></label>';
    }).join('');
    h += '<div class="jm-meter__t" style="margin-top:6px" data-pbg-nilai><span>Kecekapan Kabinet Bayangan</span><b>' + (n.bil ? n.kecekapan + ' → ×' + n.pengganda : '–') + '</b></div>';
    if (n.duplikat.length) { h += '<p class="note jm-amaran">⚠️ Seorang hanya boleh memegang satu jawatan: ' + esc(n.duplikat.join(', ')) + '.</p>'; }
    return h + btn('bayangan', '📣 Umumkan Kabinet Bayangan', { boleh: n.lengkap }, 'btn--primary');
  }
  function kad(p) {
    try {
      var k = PB.keadaan(p); if (!k) { return ''; }
      var st = k.status, C = PB.CONFIG, h = '<section class="card pbg" aria-labelledby="pbg-tajuk">';
      h += '<div class="pbg-ban"><b id="pbg-tajuk">🏛️ ' + (st.kp ? 'Ketua Pembangkang Dewan Rakyat' : 'Ahli Parlimen Pembangkang') + '</b><small>Blok anda ' + st.kami + ' kerusi' + (st.lain ? ' · blok pembangkang lain ' + st.lain : '') + ' · kerajaan ' + st.kerajaan + ' (majoriti ' + st.majoriti + ')</small></div>';
      if (st.kp) { h += '<div class="jm-meter__t"><span>Elaun bulanan</span><b>' + rm(C.ELAUN.myr) + ' + ' + C.ELAUN.ip + ' IP</b></div>'; }
      else { h += '<p class="note">' + (st.presiden ? 'Blok pembangkang lain lebih besar: anda bukan Ketua Pembangkang.' : 'Ketua Pembangkang ialah Presiden parti blok pembangkang terbesar.') + ' Anda boleh mengemukakan Soalan Lisan dan membahas RUU.</p>'; }
      h += '<div class="jm-meter__t"><span>Naratif Pembangkang</span><b>' + k.naratif + '/100</b></div><div class="prkl-bar" style="background:var(--bg-elev-1)"><i style="width:' + k.naratif + '%"></i></div>';
      h += '<small class="note">PRU akan datang: ' + (k.bonusKerusi ? '+' + k.bonusKerusi + ' kerusi Parlimen parti' : 'tiada bonus kerusi (perlu Naratif melebihi 55)') + '. Naratif susut 1 sebulan ke arah 50.</small>';
      h += '<h3 style="margin:10px 0 4px">⚔️ Tindakan Dewan</h3>';
      h += act('🙋 Soalan Lisan kepada Menteri', C.SOALAN.ap + ' AP · sekali sebulan · berjaya: Naratif +' + C.SOALAN.naratif + ', IP +' + C.SOALAN.ip, k.soalan, btn('soalan', 'Tanya', k.soalan));
      if (k.ruu.tajuk) {
        h += act('📜 Bahas RUU Kerajaan: ' + esc(k.ruu.tajuk), 'Sokong: Reputasi +1, Naratif -2 · Bantah: Naratif +4 · Pinda: ' + C.RUU.pinda.ap + ' AP, peluang 40%: Naratif +6, IP +40', k.ruu,
          '<span class="pbg-3">' + btn('ruu:sokong', 'Sokong', k.ruu) + btn('ruu:bantah', 'Bantah', k.ruu) + btn('ruu:pinda', 'Pinda', { boleh: k.ruu.boleh && k.pindaBoleh }) + '</span>');
      } else { h += act('📜 Bahas RUU Kerajaan', k.ruu.sebab, null, ''); }
      if (k.bajet) { h += act('💰 Bajet Alternatif', C.BAJET.ap + ' AP · sekali setahun (bulan Bajet) · Naratif +' + C.BAJET.naratif + ', Reputasi +' + C.BAJET.reputasi, k.bajet, btn('bajet', 'Bentang', k.bajet)); }
      if (k.tp) {
        if (k.tp.aktif) {
          var t = k.tp.aktif;
          h += '<div class="prkl-aktif"><b>⚖️ Usul Undi Tidak Percaya</b><div class="jm-meter__t"><span>Sokongan</span><b>' + t.sokong + ' / ' + t.perlu + '</b></div><div class="prkl-bar"><i style="width:' + Math.min(100, Math.round(t.sokong / 222 * 100)) + '%"></i></div>' +
            '<small>Pujukan ' + t.pujuk + ' / ' + C.TP.pujukMaks + ' · undian automatik pada akhir bulan</small></div>' +
            act('🤝 Pujuk MP kerajaan goyah', C.TP.pujukAP + ' AP · ' + rm(C.TP.pujukMyr) + ' · +' + C.TP.pujuk[0] + ' hingga +' + C.TP.pujuk[1] + ' undi', k.tp.pujuk, btn('tp:pujuk', 'Pujuk', k.tp.pujuk)) +
            act('🗳️ Undi sekarang', 'Berjaya: kerajaan tumbang, PRU mengejut. Gagal: Reputasi ' + C.TP.gagal.reputasi + ', Naratif ' + C.TP.gagal.naratif, null, btn('tp:undi', 'Undi', null, 'btn--danger'));
        } else {
          h += act('⚖️ Usul Undi Tidak Percaya', C.TP.ap + ' AP + ' + rm(C.TP.myr) + ' · sekali setahun · perlu ' + C.TP.ambang + ' undi · Naratif tinggi menambah undi', k.tp, btn('tp:mula', 'Usul', k.tp, 'btn--danger'));
        }
      }
      if (st.kp) { h += '<div data-pbg-bay>' + htmlBayangan(p, k) + '</div>'; }
      return h + '</section>';
    } catch (e) { return ''; }
  }
  function UI() { return W.NusaUI || {}; }
  W.document.addEventListener('change', function (ev) {
    var t = ev.target; if (!t || !t.hasAttribute || !t.hasAttribute('data-pbg-port')) { return; }
    var nm = t.getAttribute('data-pbg-port'); if (t.value) { pilihB[nm] = t.value; } else { delete pilihB[nm]; }
    var box = W.document.querySelector('[data-pbg-bay]'), p = S.loadPlayer(); if (box) { box.innerHTML = htmlBayangan(p, PB.keadaan(p)); }
  });
  W.document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-pbg]') : null; if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-pbg'), r = null;
    if (a === 'soalan') { r = PB.soalanLisan(); }
    else if (a.indexOf('ruu:') === 0) { r = PB.bahasRUU(a.slice(4)); }
    else if (a === 'bajet') { r = PB.bajetAlternatif(); }
    else if (a === 'tp:mula') { r = PB.mulaTP(); }
    else if (a === 'tp:pujuk') { r = PB.pujukTP(); }
    else if (a === 'tp:undi') { r = PB.undiTP(); }
    else if (a === 'bayangan') { r = PB.umumBayangan(pilihB); if (r.ok) { pilihB = {}; } }
    if (!r) { return; }
    if (UI().toast) { UI().toast(r.ok ? r.mesej : r.ralat, r.ok ? (r.jaya === false ? 'info' : 'ok') : 'ralat'); }
    if (UI().render) { UI().render(); }
  });
  W.MyPolitikPembangkangUI = { kad: kad };
})(window);
