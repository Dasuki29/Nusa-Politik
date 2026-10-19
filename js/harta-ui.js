/* ==========================================================================
   Nusa Politik — js/harta-ui.js   (v8.13)
   Tab "💰 Harta": kekayaan, katalog aset (beli / jual), kurungan cukai dan Pengisytiharan Harta SPRM (modal wajib).
   Bergantung pada js/harta.js, js/save.js dan W.NusaUI (modal, toast, render, esc, fmt) daripada js/app.js.
   ========================================================================== */
(function (W) {
  'use strict';
  var H = W.MyPolitikHarta, S = W.MyPolitikSave;
  if (!H || !S) { return; }
  var sibuk = false;

  function U() { return W.NusaUI; }
  function esc(s) { return U() ? U().esc(s) : String(s); }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('ms-MY'); }

  function pasangGaya() {
    if (!W.document || W.document.getElementById('ht-gaya')) { return; }
    var g = W.document.createElement('style'); g.id = 'ht-gaya';
    g.textContent =
      '.ht-aset{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 14px;margin-top:10px;border:1px solid var(--border,#2E333F);border-radius:12px;background:var(--bg-elev-1,#161922)}' +
      '.ht-aset.is-milik{border-color:var(--gold,#F2B705)}.ht-aset b{display:block}.ht-aset small{display:block;color:var(--text-muted,#A3A9B8)}' +
      '.ht-btn{min-height:40px;padding:6px 14px;border-radius:10px;border:1px solid var(--gold,#F2B705);background:var(--gold,#F2B705);color:#111;font:700 .85rem inherit;font-family:inherit;cursor:pointer}' +
      '.ht-btn--jual{background:transparent;color:var(--gold,#F2B705)}.ht-btn:disabled{opacity:.45;cursor:not-allowed}' +
      '.ht-tunggu{border:2px solid var(--gold,#F2B705);border-radius:12px;padding:12px 14px;margin-top:10px;background:rgba(242,183,5,.1)}' +
      '.ht-jadual{width:100%;border-collapse:collapse;font-size:.82rem}.ht-jadual th,.ht-jadual td{text-align:left;padding:4px 6px;border-bottom:1px solid var(--border,#2E333F)}.ht-jadual td.r,.ht-jadual th.r{text-align:right}' +
      '.ht-bar{height:7px;background:var(--bg-elev-3,#262A34);border-radius:9px;overflow:hidden;margin-top:4px}.ht-bar i{display:block;height:100%;background:var(--gold,#F2B705)}.ht-bar i.is-bahaya{background:#FF5468}';
    W.document.head.appendChild(g);
  }

  function kv(l, n) { return '<div class="kv"><span>' + l + '</span><b>' + n + '</b></div>'; }

  /** Kandungan panel tab Harta. */
  function panel(p) {
    pasangGaya();
    var r = H.ringkasan(p), kat = H.katalog(p), h = '';
    h += '<section class="card"><h2 class="card__title" style="margin:0 0 4px">💰 Harta &amp; Aset Peribadi</h2><p class="note">Simulasi: tidak mewakili peraturan cukai atau SPRM sebenar.</p>' +
      kv('Tunai', rm(r.tunai)) + kv('Nilai aset', rm(r.nilaiAset)) + kv('Kekayaan bersih', rm(r.bersih)) +
      kv('Kadar cukai (kurungan)', Math.round(r.kadar * 100) + '%') + kv('Cukai terkumpul', rm(r.cukaiTerkumpul + r.tertunggak)) +
      kv('Kesan pasif sebulan', (r.pasif.ip ? '+' + r.pasif.ip + ' IP' : '') + (r.pasif.ip && r.pasif.stress ? ', ' : '') + (r.pasif.stress ? 'Stress -' + r.pasif.stress : '') + (!r.pasif.ip && !r.pasif.stress ? 'tiada' : '')) +
      kv('Kos penyelenggaraan sebulan', rm(r.pasif.kos)) +
      kv('Peluang krisis politik', r.pasif.imej ? Math.round((1 - r.pasif.imej) * 100) + '% daripada asas' : '100% asas') +
      kv('Risiko Audit SPRM', r.risikoAudit + ' / 100') +
      '<div class="ht-bar" role="progressbar" aria-label="Risiko Audit SPRM" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + r.risikoAudit + '"><i class="' + (r.risikoAudit >= 50 ? 'is-bahaya' : '') + '" style="width:' + r.risikoAudit + '%"></i></div>' +
      kv('Pengisytiharan seterusnya', r.menunggu ? 'menunggu jawapan' : 'dalam ' + r.bulanBaki + ' bulan');
    if (r.menunggu) {
      h += '<div class="ht-tunggu" role="alert"><b>📋 Pengisytiharan Harta SPRM wajib</b><p style="margin:4px 0 8px">' + (r.menunggu.sebab === 'kerajaan' ? 'Anda dilantik ke jawatan kerajaan.' : 'Tiba masa pengisytiharan tahunan.') +
        ' Bulan tidak boleh dimajukan sehingga anda menjawab.</p><button type="button" class="ht-btn" data-act="harta-isytihar">Buat Pengisytiharan</button></div>';
    }
    h += '</section><section class="card"><h3 class="card__title" style="margin:0 0 4px">Katalog aset</h3>';
    kat.forEach(function (a) {
      h += '<div class="ht-aset' + (a.milik ? ' is-milik' : '') + '"><div><b>' + a.ikon + ' ' + esc(a.nama) + ' · ' + rm(a.harga) + '</b><small>' + esc(a.huraian) + '</small><small>Penyelenggaraan ' + rm(a.kos) + ' sebulan' + (a.milik ? ' · jual ' + rm(a.jual) : '') + '</small>' +
        (!a.milik && a.sebab ? '<small>' + esc(a.sebab) + '</small>' : '') + '</div>' +
        (a.milik ? '<button type="button" class="ht-btn ht-btn--jual" data-act="harta-jual" data-id="' + a.id + '">Jual</button>' : '<button type="button" class="ht-btn" data-act="harta-beli" data-id="' + a.id + '"' + (a.boleh ? '' : ' disabled') + '>Beli</button>') + '</div>';
    });
    h += '</section><section class="card"><h3 class="card__title" style="margin:0 0 4px">Kurungan cukai (kekayaan bersih, tahunan)</h3><table class="ht-jadual"><tr><th>Kekayaan bersih</th><th class="r">Kadar marginal</th></tr>';
    H.KURUNGAN.forEach(function (k) {
      h += '<tr><td>' + (k.dari === 0 ? 'Hingga ' + rm(k.hingga) : k.hingga > 1e12 ? 'Melebihi ' + rm(k.dari) : rm(k.dari + 1) + ' hingga ' + rm(k.hingga)) + '</td><td class="r">' + Math.round(k.kadar * 100) + '%</td></tr>';
    });
    return h + '</table><p class="note" style="margin-top:8px">Cukai dikumpul 1/12 setiap bulan dan dilunaskan semasa pengisytiharan.</p></section>';
  }

  function opsi(o) {
    return '<li><button type="button" class="acara__opsi' + (o.id === 'telus' ? ' is-utama' : '') + '" data-pilih="' + o.id + '"><b>' + esc(o.label) + '</b><small class="acara__kesan">' + esc(o.ringkas) + '</small></button></li>';
  }

  /** Modal wajib Pengisytiharan Harta SPRM. Pulang true jika dijawab. */
  async function isytihar() {
    var u = U(); if (!u || !u.modal || sibuk) { return false; }
    var p = S.loadPlayer(), m = p && H.menunggu(p); if (!m) { return false; }
    sibuk = true;
    try {
      for (var cuba = 0; cuba < 3; cuba++) {
        p = S.loadPlayer(); if (!H.menunggu(p)) { return true; }
        var r = H.ringkasan(p), ops = H.pilihanDeklarasi(p);
        var id = await u.modal({ tajuk: '📋 Pengisytiharan Harta SPRM',
          isi: '<p>' + (m.sebab === 'kerajaan' ? 'Anda dilantik ke jawatan kerajaan. ' : 'Tiba masa pengisytiharan tahunan. ') + 'Pengisytiharan ini wajib.</p>' +
            '<p class="note" style="font-size:.82rem">Kekayaan bersih anda ' + rm(r.bersih) + ' (tunai ' + rm(r.tunai) + ' dan aset ' + rm(r.nilaiAset) + '). Cukai terkumpul ' + rm(r.cukaiTerkumpul + r.tertunggak) + '.</p><ul class="acara__pil">' + ops.map(opsi).join('') + '</ul>', butang: [] });
        if (!id) { continue; }
        var res = H.isytihar(id);
        u.toast(res.ok ? res.mesej : res.ralat, res.ok ? 'ok' : 'ralat');
        if (u.render) { u.render(); }
        if (res.ok) { return true; }
      }
      return false;
    } finally { sibuk = false; }
  }

  function aksi(act, el) {
    var id = el && el.getAttribute ? el.getAttribute('data-id') : null, u = U(), r;
    if (act === 'harta-beli') { r = H.beli(id); }
    else if (act === 'harta-jual') { r = H.jual(id); }
    else if (act === 'harta-isytihar') { isytihar(); return; }
    if (r) { if (u) { u.toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); if (u.render) { u.render(); } } }
  }

  /** Dipanggil selepas setiap bulan / semasa memuatkan halaman: buka pengisytiharan yang menunggu. */
  async function selepasBulan() { return isytihar(); }

  W.NusaHarta_UI = { panel: panel, isytihar: isytihar, aksi: aksi, selepasBulan: selepasBulan };
})(typeof window !== 'undefined' ? window : globalThis);
