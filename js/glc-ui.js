/* ==========================================================================
   Nusa Politik — js/glc-ui.js   (v8.19)
   Kad "Jawatan GLC" di tab Tindakan. Bergantung pada js/glc.js dan W.NusaUI (esc).
   ========================================================================== */
(function (W) {
  'use strict';
  var GL = W.MyPolitikGLC;
  if (!GL) { return; }
  function esc(s) { return W.NusaUI ? W.NusaUI.esc(s) : String(s); }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('ms-MY'); }
  function bar(label, nilai, bahaya) {
    nilai = Math.max(0, Math.min(100, Math.round(nilai)));
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + nilai + '%</b></div><div class="progress progress--sm' + (bahaya ? ' progress--danger' : '') + '" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + nilai + '"><div class="progress__bar" style="width:' + nilai + '%"></div></div></div>';
  }
  function kad(p) {
    try {
      var r = GL.ringkasan(p), j = r.jawatan; if (p.tamat || (!j && !r.lobi)) { return ''; }
      var h = '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🏢 Jawatan GLC</h2><p class="note" style="font-size:.78rem">Nama syarikat ialah rekaan. Simulasi permainan.</p>';
      if (j) {
        h += '<div class="kv"><span>Jawatan</span><b>' + esc(j.nama) + '</b></div><div class="kv"><span>Ganjaran bulanan</span><b>' + esc(rm(j.gaji)) + '</b></div><div class="kv"><span>IP sebulan</span><b>+' + j.ip + '</b></div><div class="kv"><span>Baki tempoh</span><b>' + r.bulanBaki + ' bulan</b></div>';
        h += bar('Risiko Konflik Kepentingan', r.konflik, r.konflik >= 60) + bar('Risiko Audit SPRM', r.audit, r.audit >= GL.CONFIG.AUDIT_MULA);
        if (r.bolehBaharui) { h += '<button type="button" class="btn btn--sm" data-act="glc-baharui" style="margin-top:8px">Perbaharui 3 tahun (' + esc(rm(r.kosBaharui)) + ')</button>'; }
        return h + '<p class="note" style="font-size:.78rem">Boleh bersama jawatan parti dan kerusi ADUN/MP. Tamat jika anda dilantik ke jawatan Menteri atau EXCO. Risiko Audit tinggi boleh menyebabkan pemecatan dan denda.</p></section>';
      }
      if (r.terhalang) { return h + '<p class="note">Anda memegang jawatan kerajaan. Jawatan GLC tidak boleh bersama jawatan Menteri atau EXCO.</p></section>'; }
      h += '<p class="note" style="font-size:.8rem">' + (r.lobi.jenis === 'kalah' ? 'Tawaran jawatan GLC untuk calon yang tidak berjaya.' : 'Parti membentuk kerajaan: lobi jawatan GLC dibuka.') + ' Baki percubaan: ' + r.lobi.baki + '. Gagal: separuh kos hilang.</p>';
      h += '<details><summary>Lihat senarai jawatan (' + r.senarai.length + ')</summary>';
      r.senarai.forEach(function (x) {
        h += '<div style="margin:8px 0"><b>' + esc(x.nama) + '</b><div class="note" style="font-size:.78rem;margin:2px 0 4px">Kos IP ' + x.ip + ' dan ' + esc(rm(x.myr)) + ', peluang ' + x.peluang + '%, ganjaran ' + esc(rm(x.gaji)) + ' dan +' + x.ipBulan + ' IP sebulan</div>' +
          '<button type="button" class="btn btn--sm' + (x.boleh ? '' : ' is-off') + '" data-act="glc-lobi" data-id="' + esc(x.id) + '"' + (x.boleh ? '' : ' disabled title="' + esc(x.sebab) + '"') + '>Lobi</button></div>';
      });
      h += '</details>';
      return h + '<p class="note" style="font-size:.78rem">Tempoh 3 tahun. Setiap bulan: Risiko Konflik Kepentingan +2 dan Risiko Audit SPRM +1. Lobi kekal terbuka sehingga pilihan raya berikutnya.</p></section>';
    } catch (e) { return ''; }
  }
  W.NusaGLC_UI = { kad: kad };
})(window);
