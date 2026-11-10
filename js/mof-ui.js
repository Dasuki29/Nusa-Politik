/* ==========================================================================
   Nusa Politik — js/mof-ui.js   (v13.70)
   Tab "Pejabat MOF" dalam kad kerajaan (js/pru-ui.js) untuk Menteri Kewangan: petunjuk ekonomi,
   Bajet Tahunan Negara dan Cukai & Subsidi. Bergantung pada js/mof.js dan W.NusaUI.
   ========================================================================== */
(function (W) {
  'use strict';
  var MF = W.MyPolitikMOF;
  if (!MF) { return; }
  function esc(s) { return W.NusaUI ? W.NusaUI.esc(s) : String(s); }
  function toast(t, j) { if (W.NusaUI) { W.NusaUI.toast(t, j); } }
  function segarkan() { if (W.NusaUI) { W.NusaUI.render(); } }
  function bil(n) { return 'RM ' + Number(n).toLocaleString('ms-MY', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' bilion'; }
  function tanda(n) { return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n); }

  var CSS = '' +
    '.mof-stat{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px;margin:8px 0}.mof-stat div{border:1px solid var(--garis,var(--border));border-radius:8px;padding:6px 8px}' +
    '.mof-stat span{display:block;font-size:.74rem;opacity:.8}.mof-stat b{display:block;font-size:1.1rem}.mof-stat .ng{color:var(--red)}.mof-stat .ps{color:var(--green,#1f7a4d)}' +
    '.mof-h{font-size:.92rem;margin:12px 0 4px}.mof-bj{width:100%;border-collapse:collapse;font-size:.8rem}.mof-bj td,.mof-bj th{padding:4px 3px;border-bottom:1px solid var(--garis,var(--border));text-align:left;vertical-align:middle}' +
    '.mof-bj button{min-width:26px;padding:1px 6px;font-weight:800}.mof-hub{display:inline-block;width:46px;height:6px;background:var(--bg-elev-1);border-radius:6px;overflow:hidden;vertical-align:middle;margin-right:4px}.mof-hub i{display:block;height:100%;background:var(--green,#1f7a4d)}.mof-hub.marah i{background:var(--red)}' +
    '.mof-bj td:nth-child(3){white-space:nowrap}.mof-bj td:nth-child(3) button{min-width:24px;min-height:24px;padding:0 4px;line-height:1}.mof-seg button.on,.mof-seg button.on:disabled{opacity:1;background:var(--gold);color:var(--text,#111);box-shadow:inset 0 0 0 2px var(--text,#111)}' +
    '.mof-tuil{border:1px solid var(--garis,var(--border));border-radius:8px;padding:6px 8px;margin:6px 0}.mof-seg{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.mof-seg button.on{background:var(--gold);font-weight:800}';
  (function () { var s = W.document.createElement('style'); s.textContent = CSS; W.document.head.appendChild(s); })();

  function kad(p) {
    if (!MF.aktif(p)) { return ''; }
    var r = MF.ringkasan(p), a = r.aliran, h = '';
    h += '<div class="mof-stat"><div><span>Rizab Perbendaharaan</span><b' + (r.krisis ? ' class="ng"' : '') + '>' + bil(r.rizab) + '</b><span class="' + (r.aliranLalu < 0 ? 'ng' : 'ps') + '">' + (r.aliranLalu < 0 ? '▼ ' : '▲ ') + bil(Math.abs(r.aliranLalu)) + ' bulan lalu</span></div>' +
      '<div><span>Inflasi</span><b' + (r.inflasi > 4 ? ' class="ng"' : '') + '>' + r.inflasi + '%</b><span>sasaran dasar ' + r.sasaran.inflasi + '%</span></div>' +
      '<div><span>Kepuasan rakyat</span><b' + (r.kepuasan < 35 ? ' class="ng"' : '') + '>' + r.kepuasan + ' / 100</b><span>' + (r.kepuasanArah > 0 ? '▲ ' : r.kepuasanArah < 0 ? '▼ ' : '▬ ') + tanda(r.kepuasanArah) + ' · sasaran ' + r.sasaran.kepuasan + '</span></div></div>';
    h += '<p class="note">Aliran bulanan: hasil cukai ' + bil(a.hasil) + ' − belanja kementerian ' + bil(a.belanja) + ' − subsidi ' + bil(a.subsidi) + ' = <b>' + (a.bersih < 0 ? '−' : '+') + bil(Math.abs(a.bersih)) + '</b></p>';
    if (r.krisis) { h += '<div class="banner banner--warn" role="alert"><strong>Krisis fiskal</strong>Rizab di bawah RM 10 bilion. KPI portfolio jatuh setiap bulan sehingga rizab pulih.</div>'; }
    var b = r.bajet;
    h += '<h3 class="mof-h">📊 Bajet Tahunan Negara ' + b.tahun + '</h3>';
    h += '<p class="note">' + (b.sudah ? 'Bajet tahun ini sudah dimuktamadkan.' : b.buka ? 'Laras peruntukan (langkah 5%, had ±15%). Naikkan: rizab berkurang, hubungan menteri naik. Potong: rizab bertambah, menteri tidak puas hati.' : 'Bajet Tahunan dibuka bulan 9 dan 10.') + '</p>';
    h += '<table class="mof-bj"><thead><tr><th>Kementerian</th><th>Peruntukan</th><th>Ubah</th><th>Hubungan menteri</th></tr></thead><tbody>' + b.kementerian.map(function (k) {
      var x = b.buka && !b.sudah;
      return '<tr><td>' + esc(k.nama) + '</td><td>' + bil(k.langkah ? k.baru : k.bajet) + '</td><td>' + (x ? '<button type="button" class="btn btn--sm" data-mof="bajet" data-kod="' + k.kod + '" data-arah="-1" aria-label="Kurangkan">−</button> <b>' + (k.peratus ? tanda(k.peratus) + '%' : '0') + '</b> <button type="button" class="btn btn--sm" data-mof="bajet" data-kod="' + k.kod + '" data-arah="1" aria-label="Tambah">+</button>' : '—') +
        '</td><td><span class="mof-hub' + (k.marah ? ' marah' : '') + '"><i style="width:' + Math.round(k.hubungan) + '%"></i></span>' + Math.round(k.hubungan) + '</td></tr>';
    }).join('') + '</tbody></table>';
    h += '<p class="note">Jumlah: ' + bil(b.jumlahBaru) + (b.beza ? ' (' + (b.beza > 0 ? '+' : '−') + bil(Math.abs(b.beza)) + ' berbanding sekarang)' : '') + '</p>';
    if (b.buka && !b.sudah) { h += '<button type="button" class="btn btn--primary btn--sm" data-mof="muktamad">Muktamadkan Bajet ' + b.tahun + '</button>'; }
    h += '<h3 class="mof-h">⚖️ Cukai &amp; Subsidi</h3><p class="note">' + (r.dasarBoleh ? 'Satu perubahan dasar fiskal sebulan.' : 'Perubahan dasar bulan ini sudah dibuat.') + ' Cukai lebih tinggi menambah rizab tetapi menurunkan kepuasan rakyat; subsidi menjaga kepuasan tetapi menekan rizab.</p>';
    h += r.dasar.map(function (t) {
      return '<div class="mof-tuil"><b>' + t.ikon + ' ' + esc(t.nama) + '</b><div class="mof-seg">' + t.pilihan.map(function (x) {
        var on = x.id === t.semasa;
        return '<button type="button" class="btn btn--sm' + (on ? ' on' : '') + '" data-mof="dasar" data-tuil="' + t.kod + '" data-id="' + esc(x.id) + '"' + (on || !r.dasarBoleh ? ' disabled' : '') + (on ? ' aria-pressed="true"' : '') + '>' + esc(x.label) + '</button>';
      }).join('') + '</div></div>';
    }).join('');
    return h + '<p class="note" style="font-size:.76rem">Nilai kewangan ialah anggaran permainan, bukan data rasmi.</p>';
  }

  W.document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-mof]') : null;
    if (!t || t.disabled) { return; }
    var a = t.getAttribute('data-mof'), r = null;
    if (a === 'bajet') { r = MF.ubahBajet(t.getAttribute('data-kod'), Number(t.getAttribute('data-arah'))); if (!r.ok) { toast(r.ralat, 'ralat'); } segarkan(); return; }
    if (a === 'muktamad') { r = MF.muktamadBajet(); } else if (a === 'dasar') { r = MF.ubahDasar(t.getAttribute('data-tuil'), t.getAttribute('data-id')); }
    if (r) { toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); segarkan(); }
  });

  W.MyPolitikMOFUI = { kad: kad };
})(window);
