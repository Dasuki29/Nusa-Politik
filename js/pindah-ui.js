/* ==========================================================================
   Nusa Politik — js/pindah-ui.js   (v8.28)
   Kad "Pindah Cawangan" (tab Pemilihan, bawah Tataetika & Tempoh Keahlian) dan dua langkah modal:
   1) pilih kawasan baharu (negeri -> Parlimen -> DUN -> cawangan, sama seperti pendaftaran), 2) semak sebelum / selepas dan sahkan.
   Bergantung pada js/pindah.js, js/data.js dan W.NusaUI.
   ========================================================================== */
(function (W) {
  'use strict';
  /** v10.0: parti Sarawak (PBB mod penuh; PRS dan lain-lain mod ringan) guna enjin Sarawak yang sama. */
  function SW(k) { return k === 'PBB' || k === 'PRS' || k === 'SUPP' || k === 'PDP' || k === 'PSB'; }
  var PD = W.MyPolitikPindah, D = W.MyPolitikData, S = W.MyPolitikSave;
  if (!PD) { return; }
  function U() { return W.NusaUI; }
  function esc(s) { return U() ? U().esc(s) : String(s); }
  function rm(n) { return 'RM ' + Math.round(Number(n) || 0).toLocaleString('ms-MY'); }
  function sp(t) { return '<span>' + esc(t) + '</span>'; }
  function toast(t, j) { if (U()) { U().toast(t, j); } }

  function kad(p) {
    try {
      if (p.tamat) { return ''; }
      var r = PD.ringkasan(p), C = PD.CONFIG;
      var h = '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🏠 Pindah Cawangan</h2>' +
        '<p class="note" style="font-size:.78rem">' + sp('Tukar keahlian ke cawangan lain. Jawatan Cawangan dan Bahagian hilang, sokongan bermula semula. Simulasi sahaja.') + '</p>';
      r.semak.syarat.forEach(function (x) {
        h += '<div class="kv"><span>' + (x.lulus ? '✅ ' : '⛔ ') + sp(x.teks) + '</span><b>' + (x.nota ? sp(x.nota) : '') + '</b></div>';
      });
      if (r.bakiMenunggu) { h += '<div class="kv"><span>' + sp('Tempoh menunggu bertanding jawatan Cawangan / Bahagian') + '</span><b>' + r.bakiMenunggu + ' ' + sp('bulan') + '</b></div>'; }
      h += '<p class="note" style="font-size:.8rem;margin-top:8px">' + sp('Kos: ' + rm(C.KOS_MYR) + ', ' + C.KOS_AP + ' AP dan IP -' + Math.round(C.IP_POTONG * 100) + '%. ' + (SW(p.parti) ? 'Hanya antara Bahagian dan Cawangan di Sarawak.' : 'Tidak boleh pindah ke Sarawak.')) + '</p>' +
        '<button type="button" class="btn btn--sm' + (r.semak.boleh ? ' btn--gold' : ' is-off') + '" data-act="pindah-mula"' + (r.semak.boleh ? '' : ' disabled') + '>Pindah Cawangan…</button>';
      if (r.sejarah.length) {
        h += '<details class="note" style="margin-top:8px"><summary>' + sp('Sejarah pindahan') + '</summary><ul style="margin:6px 0 0;padding-left:18px">' +
          r.sejarah.slice().reverse().map(function (x) { return '<li>' + esc(x.bulan + '/' + x.tahun + ': ' + x.dari + ' → ' + x.ke) + '</li>'; }).join('') + '</ul></details>';
      }
      return h + '</section>';
    } catch (e) { return ''; }
  }

  /* ----- data kawasan (dimuat ikut negeri, seperti pendaftaran) ----- */
  var cacheTab = {}, senarai = null;
  async function senaraiNegeri() {
    var CFG = W.MYPOLITIK_CONFIG || {};
    var pM = S.loadPlayer();
    if (!senarai && pM && (pM.parti === 'MCA' || pM.parti === 'MIC' || pM.parti === 'PPP')) {                                   // v13.1: MCA: kawasan operasi MCA sahaja; v13.3: MIC
      var rM = await fetch(W.MyPolitikParti.info(pM.parti).data, { cache: 'no-cache' }); if (!rM.ok) { throw new Error('HTTP ' + rM.status); }
      var hM = D.rowsToHierarchy(D.teksKeBaris(await rM.text())); senarai = { tab: null, data: hM, nama: hM.negeri.map(function (n) { return n.nama; }) };
    }
    if (!senarai) {
      var sen = null; try { sen = D.loadSenaraiTab ? await D.loadSenaraiTab({ appsScriptUrl: CFG.appsScriptUrl }) : null; } catch (e) { sen = null; }
      if (sen && sen.tab && sen.tab.length) { senarai = { tab: sen.tab, nama: sen.tab.map(function (t) { return D.namaNegeriTab(t); }) }; }
      else {
        var h = await D.loadPartyData({ url: CFG.sheetCsvUrl || D.CONFIG.SHEET_CSV_URL, appsScriptUrl: CFG.appsScriptUrl });
        senarai = { tab: null, data: h, nama: h.negeri.map(function (n) { return n.nama; }) };
      }
    }
    return senarai;
  }
  async function bahagianNegeri(nama) {
    var CFG = W.MYPOLITIK_CONFIG || {}, s = await senaraiNegeri();
    if (!s.tab) { var n = s.data.negeri.filter(function (x) { return x.nama === nama; })[0]; return n ? n.bahagian : []; }
    var tab = s.tab.filter(function (t) { return D.namaNegeriTab(t) === nama; })[0];
    if (!tab) { return []; }
    if (!cacheTab[nama]) { cacheTab[nama] = await D.loadPartyData({ appsScriptUrl: CFG.appsScriptUrl, tab: tab }); }
    return cacheTab[nama].bahagian || [];
  }

  /** v9.5: PBB: pilih Bahagian (DUN) dan Cawangan (Daerah Mengundi) di Sarawak. Pulang { c, dunInfo } atau null. */
  async function pilihKawasanPBB(p) {
    toast('Memuatkan senarai kawasan…', 'ok');
    var PT = W.MyPolitikParti, h, dunData = null;
    try {
      var res = await fetch(PT.info(p.parti).data, { cache: 'no-cache' }); if (!res.ok) { throw new Error('HTTP ' + res.status); }
      h = D.rowsToHierarchy(D.teksKeBaris(await res.text()));
      h.bahagian.forEach(function (b) { b.cawangan.forEach(function (c) { if (c.kumpulan) { c.kumpulan.wanita += c.kumpulan.puteri; c.kumpulan.puteri = 0; c.kumpulan.langsung = false; } }); });
      try { var rd = await fetch('data/pbb-dun.json', { cache: 'no-cache' }); dunData = rd.ok ? await rd.json() : null; } catch (e2) { dunData = null; }
    } catch (e) { toast('Senarai kawasan tidak dapat dimuatkan. Semak sambungan internet.', 'ralat'); return null; }
    function opsi(arr, fn, tajuk) { return '<option value="">' + esc(tajuk) + '</option>' + arr.map(function (x, i) { return '<option value="' + i + '">' + esc(fn(x)) + '</option>'; }).join(''); }
    var isi = '<p>' + sp('Pilih kawasan baharu. Kos dan kesan ditunjukkan pada langkah seterusnya.') + '</p>' +
      '<label class="note" for="pd-bhg">Bahagian (DUN)</label><select id="pd-bhg" style="width:100%;margin:4px 0 8px">' + opsi(h.bahagian, function (b) { return b.nama + ' (N.' + parseInt(b.kod, 10) + ')'; }, 'Pilih bahagian') + '</select>' +
      '<label class="note" for="pd-caw">Cawangan (Daerah Mengundi)</label><select id="pd-caw" style="width:100%;margin:4px 0 8px" disabled><option value="">Pilih bahagian dahulu</option></select>';
    var pr = U().modal({ tajuk: '🏠 Pindah Cawangan', isi: isi, butang: [{ label: 'Batal', nilai: false }, { label: 'Seterusnya', nilai: true, kelas: 'btn--gold', nonaktif: true }] });
    var el = W.document.getElementById('modal-isi'), kaki = W.document.getElementById('modal-kaki'), seterus = kaki && kaki.querySelector('button:last-child');
    var terpilih = null, bhg = null, cws = [];
    if (el) {
      var sB = el.querySelector('#pd-bhg'), sC = el.querySelector('#pd-caw');
      sB.addEventListener('change', function () {
        terpilih = null; if (seterus) { seterus.disabled = true; }
        bhg = sB.value === '' ? null : h.bahagian[+sB.value];
        if (!bhg) { sC.innerHTML = '<option value="">Pilih bahagian dahulu</option>'; sC.disabled = true; return; }
        cws = (bhg.dun && bhg.dun[0] ? bhg.dun[0].cawangan : []) || [];
        sC.innerHTML = opsi(cws, function (c) { return c.nama + ' (' + c.kod + ')'; }, 'Pilih cawangan'); sC.disabled = false;
      });
      sC.addEventListener('change', function () {
        terpilih = sC.value === '' ? null : cws[+sC.value];
        if (terpilih && S.identitiKawasan(terpilih).id === p.id) { toast('Anda sudah menjadi ahli cawangan ini.', 'ralat'); terpilih = null; }
        if (seterus) { seterus.disabled = !terpilih; }
      });
    }
    var ya = await pr;
    if (!(ya && terpilih && bhg)) { return null; }
    return { c: terpilih, dunInfo: dunData ? dunData[parseInt(bhg.kod, 10)] || null : null };
  }

  async function pilihKawasan(p) {
    toast('Memuatkan senarai kawasan…', 'ok');
    var s;
    try { s = await senaraiNegeri(); } catch (e) { toast('Senarai kawasan tidak dapat dimuatkan. Semak sambungan internet.', 'ralat'); return null; }
    var negeri = s.nama.filter(function (n) { return !PD.negeriTerlarang(n); });
    function opsi(arr, fn, tajuk) { return '<option value="">' + esc(tajuk) + '</option>' + arr.map(function (x, i) { return '<option value="' + i + '">' + esc(fn(x)) + '</option>'; }).join(''); }
    var isi = '<p>' + sp('Pilih kawasan baharu. Kos dan kesan ditunjukkan pada langkah seterusnya.') + '</p>' +
      '<label class="note" for="pd-negeri">Negeri</label><select id="pd-negeri" style="width:100%;margin:4px 0 8px">' + opsi(negeri, function (x) { return x; }, 'Pilih negeri') + '</select>' +
      '<label class="note" for="pd-bhg">Bahagian (Parlimen)</label><select id="pd-bhg" style="width:100%;margin:4px 0 8px" disabled><option value="">Pilih negeri dahulu</option></select>' +
      '<label class="note" for="pd-dun">DUN</label><select id="pd-dun" style="width:100%;margin:4px 0 8px" disabled><option value="">Pilih bahagian dahulu</option></select>' +
      '<label class="note" for="pd-caw">Cawangan</label><select id="pd-caw" style="width:100%;margin:4px 0 8px" disabled><option value="">Pilih DUN dahulu</option></select>';
    var pr = U().modal({ tajuk: '🏠 Pindah Cawangan', isi: isi, butang: [{ label: 'Batal', nilai: false }, { label: 'Seterusnya', nilai: true, kelas: 'btn--gold', nonaktif: true }] });
    var el = W.document.getElementById('modal-isi'), kaki = W.document.getElementById('modal-kaki'), seterus = kaki && kaki.querySelector('button:last-child');
    var terpilih = null, bhgs = [], duns = [], cws = [];
    if (el) {
      var sN = el.querySelector('#pd-negeri'), sB = el.querySelector('#pd-bhg'), sD = el.querySelector('#pd-dun'), sC = el.querySelector('#pd-caw');
      function set(sel, arr, fn, tajuk, hidup) { sel.innerHTML = opsi(arr, fn, tajuk); sel.disabled = !hidup; }
      function reset(sel, t) { sel.innerHTML = '<option value="">' + esc(t) + '</option>'; sel.disabled = true; }
      sN.addEventListener('change', async function () {
        terpilih = null; if (seterus) { seterus.disabled = true; }
        reset(sD, 'Pilih bahagian dahulu'); reset(sC, 'Pilih DUN dahulu');
        if (sN.value === '') { reset(sB, 'Pilih negeri dahulu'); return; }
        reset(sB, 'Memuatkan…');
        try { bhgs = await bahagianNegeri(negeri[+sN.value]); } catch (e) { reset(sB, 'Data gagal dimuatkan'); return; }
        set(sB, bhgs, function (b) { return b.nama + ' (P.' + b.kod + ')'; }, 'Pilih bahagian', true);
      });
      sB.addEventListener('change', function () {
        terpilih = null; if (seterus) { seterus.disabled = true; } reset(sC, 'Pilih DUN dahulu');
        var b = sB.value === '' ? null : bhgs[+sB.value];
        if (!b) { reset(sD, 'Pilih bahagian dahulu'); return; }
        duns = b.dun || [];
        if (b.tiadaDUN && duns[0]) { reset(sD, 'Tiada DUN'); cws = duns[0].cawangan; set(sC, cws, function (c) { return c.nama + ' (' + c.kod + ')'; }, 'Pilih cawangan', true); }
        else { set(sD, duns, function (d) { return d.nama + ' (N.' + d.kod + ')'; }, 'Pilih DUN', true); }
      });
      sD.addEventListener('change', function () {
        terpilih = null; if (seterus) { seterus.disabled = true; }
        var d = sD.value === '' ? null : duns[+sD.value];
        if (!d) { reset(sC, 'Pilih DUN dahulu'); return; }
        cws = d.cawangan; set(sC, cws, function (c) { return c.nama + ' (' + c.kod + ')'; }, 'Pilih cawangan', true);
      });
      sC.addEventListener('change', function () {
        terpilih = sC.value === '' ? null : cws[+sC.value];
        if (terpilih && S.identitiKawasan(terpilih).id === p.id) { toast('Anda sudah menjadi ahli cawangan ini.', 'ralat'); terpilih = null; }
        if (seterus) { seterus.disabled = !terpilih; }
      });
    }
    var ya = await pr;
    return ya && terpilih ? terpilih : null;
  }

  function baris(label, a, b) { return '<tr><th scope="row">' + esc(label) + '</th><td>' + a + '</td><td>' + b + '</td></tr>'; }

  async function mula() {
    var p = S.loadPlayer(); if (!p) { return; }
    var sm = PD.semak(p);
    if (!sm.boleh) { toast('Belum memenuhi syarat: ' + sm.sebab[0], 'ralat'); return; }
    var c, extra = null;
    if (SW(p.parti)) { var pk = await pilihKawasanPBB(p); if (!pk) { return; } c = pk.c; extra = { dunInfo: pk.dunInfo }; }
    else { c = await pilihKawasan(p); }
    if (!c) { return; }
    var pt = PD.pratonton(p, c, extra), a = pt.sebelum, b = pt.selepas;
    function teksJ(arr) { return arr.length ? arr.map(esc).join(', ') : sp('Tiada'); }
    var isi = '<p>' + sp('Semak perubahan sebelum mengesahkan. Pindahan ini tidak boleh dibatalkan.') + '</p>' +
      '<table class="tbl" style="width:100%;font-size:.82rem"><thead><tr><th></th><th>' + sp('Sebelum') + '</th><th>' + sp('Selepas') + '</th></tr></thead><tbody>' +
      baris('Cawangan', esc(a.cawangan), esc(b.cawangan)) + baris('Bahagian', esc(a.bahagian), esc(b.bahagian)) +
      baris(SW(p.parti) ? 'Tahap kerusi DUN' : 'Tahap kerusi Parlimen (anggaran)', esc(a.tahap || '-'), esc(b.tahap || '-')) +
      baris('Jawatan Cawangan / Bahagian', teksJ(a.jawatan), teksJ([])) +
      baris('Sokongan akar umbi', a.akarUmbi, b.akarUmbi) + baris('Sokongan AJK', a.ajk, b.ajk) +
      baris('IP', a.ip, b.ip) + baris('Dana', esc(rm(a.myr)), esc(rm(b.myr))) + baris('AP', a.ap, b.ap) + '</tbody></table>' +
      '<p class="note" style="font-size:.8rem">' + sp('Jawatan Pusat kekal. Tempoh keahlian parti tidak mula semula. Anda tidak boleh bertanding jawatan parti Cawangan / Bahagian selama ' + pt.menunggu + ' bulan, tetapi boleh dicalonkan PRU / PRN seperti biasa.') + '</p>';
    var ok = await U().modal({ tajuk: '🏠 Sahkan Pindah Cawangan', isi: isi, butang: [{ label: 'Batal', nilai: false }, { label: 'Sahkan Pindah', nilai: true, kelas: 'btn--gold' }] });
    if (!ok) { return; }
    if (W.MyPolitikUndo && W.MyPolitikUndo.kunci) { W.MyPolitikUndo.kunci(); }
    var r = PD.pindah(c, extra);
    toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat');
    if (U()) { U().render(); }
  }

  W.NusaPindah_UI = { kad: kad, mula: mula };
})(window);
