/* ==========================================================================
   Nusa Politik — js/parti.js   (v8.32)
   Parti pemain dan penjenamaan. Lalai ialah UMNO (simpanan lama tanpa medan `parti` kekal UMNO).
   PBB (Parti Pesaka Bumiputera Bersatu) = parti regional Sarawak:
     Pusat/Negeri -> Bahagian (= DUN) -> Cawangan (= Daerah Mengundi); sayap Pemuda dan Wanita sahaja (tiada Puteri).
   Penjenamaan: logo, nama parti dan perkataan "UMNO" dalam paparan ditukar mengikut parti (kod/ke/dari + pemerhati DOM).
   ANDAIAN: sayap PBB mengikut kelayakan umur/jantina sedia ada; perempuan 18 hingga 35 tahun masuk sayap Wanita.
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikParti = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (W) {
  'use strict';
  var KUNCI_PILIHAN = 'nusa_parti_pilihan';
  var SENARAI = {
    UMNO: { kod: 'UMNO', nama: 'UMNO', penuh: 'Pertubuhan Kebangsaan Melayu Bersatu', logo: 'assets/images/logo.png', sayap: ['pemuda', 'puteri', 'wanita'], negeriTetap: null, data: null, bahagianJenis: 'Parlimen' },
    PBB:  { kod: 'PBB', nama: 'PBB', penuh: 'Parti Pesaka Bumiputera Bersatu', logo: 'assets/images/logo-pbb.png', sayap: ['pemuda', 'wanita'], negeriTetap: 'Sarawak', data: 'data/pbb-sarawak.csv', bahagianJenis: 'DUN' }
  };
  var SENARAI_KOD = Object.keys(SENARAI);

  function sah(k) { return SENARAI_KOD.indexOf(k) >= 0; }
  /** Kod parti sesebuah profil (tiada medan = UMNO). */
  function kod(p) { return p && sah(p.parti) ? p.parti : 'UMNO'; }
  function info(k) { return SENARAI[sah(k) ? k : 'UMNO']; }
  function pilihan() { try { var v = W.sessionStorage.getItem(KUNCI_PILIHAN); return sah(v) ? v : null; } catch (e) { return null; } }
  function tetapPilihan(k) { try { W.sessionStorage.setItem(KUNCI_PILIHAN, sah(k) ? k : 'UMNO'); } catch (e) { /* mod peribadi */ } terapkan(); }
  /** Parti semasa: pemain sedia ada, jika tidak pilihan pada skrin mula, jika tidak UMNO. */
  function kini() {
    var S = W.MyPolitikSave, p = null;
    try { p = S && S.loadPlayer ? S.loadPlayer() : null; } catch (e) { p = null; }
    return p ? kod(p) : (pilihan() || 'UMNO');
  }

  /* ---------- Penukaran teks ---------- */
  var RE_UMNO = /\bUMNO\b/g, PENUH_UMNO = /Pertubuhan Kebangsaan Melayu Bersatu/g;
  function ke(s) {
    var k = kini(); if (k === 'UMNO' || s == null) { return s; }
    var i = info(k); return String(s).replace(PENUH_UMNO, i.penuh).replace(RE_UMNO, i.nama);
  }
  /** Songsang: teks yang sudah dijenamakan -> UMNO (untuk carian kamus terjemahan). */
  function dari(s) {
    var k = kini(); if (k === 'UMNO' || s == null) { return s; }
    var i = info(k); return String(s).split(i.penuh).join(SENARAI.UMNO.penuh).replace(new RegExp('\\b' + i.nama + '\\b', 'g'), 'UMNO');
  }

  /* ---------- Penjenamaan DOM ---------- */
  var D = W.document, pemerhati = null, ATTR = ['title', 'aria-label', 'placeholder', 'alt', 'content'];
  function nod(n) {
    var v = n.nodeValue; if (!v || v.indexOf('UMNO') < 0 && v.indexOf('Pertubuhan Kebangsaan') < 0) { return; }
    var p = n.parentElement; if (p && (/^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName) || (p.closest && p.closest('[data-jenama-skip]')))) { return; }
    var b = ke(v); if (b !== v) { n.nodeValue = b; }
  }
  function attr(el) {
    for (var j = 0; j < ATTR.length; j++) {
      var a = ATTR[j]; if (!el.hasAttribute || !el.hasAttribute(a)) { continue; }
      if (a === 'content' && el.tagName !== 'META') { continue; }
      var v = el.getAttribute(a); if (v && v.indexOf('UMNO') >= 0) { el.setAttribute(a, ke(v)); }
    }
  }
  function imbas(akar) {
    if (!akar) { return; }
    if (akar.nodeType === 3) { nod(akar); return; }
    if (akar.nodeType !== 1) { return; }
    var w = D.createTreeWalker(akar, 4), n; while ((n = w.nextNode())) { nod(n); }
    attr(akar); var s = akar.querySelectorAll ? akar.querySelectorAll('[title],[aria-label],[placeholder],[alt],meta[name="description"]') : [];
    for (var i = 0; i < s.length; i++) { attr(s[i]); }
  }
  function gaya() {
    if (D.getElementById('gaya-parti')) { return; }
    var st = D.createElement('style'); st.id = 'gaya-parti';
    st.textContent = 'img.logo-parti{object-fit:contain;width:auto;max-width:72px;height:34px;border-radius:3px;background:#fff}img.kertas__logo.logo-parti{height:56px;max-width:84px}';
    D.head.appendChild(st);
  }
  function logo() {
    var i = info(kini()); if (i.kod === 'UMNO') { return; }
    var im = D.querySelectorAll('img.brand__img, img.kertas__logo, img[src$="assets/images/logo.png"]');
    for (var k = 0; k < im.length; k++) { if (im[k].getAttribute('src') !== i.logo) { im[k].onerror = null; im[k].setAttribute('src', i.logo); im[k].classList.add('logo-parti'); } }
    gaya();
  }
  var pernahTukar = false;
  /** Pulihkan paparan UMNO (cth. pemain menukar semula pilihan parti di skrin pendaftaran). */
  function pulihUMNO() {
    var w = D.createTreeWalker(D.body, 4), n, v;
    while ((n = w.nextNode())) {
      v = n.nodeValue; if (!v || (v.indexOf('PBB') < 0 && v.indexOf(SENARAI.PBB.penuh) < 0)) { continue; }
      if (n.parentElement && (/^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentElement.tagName) || (n.parentElement.closest && n.parentElement.closest('[data-jenama-skip]')))) { continue; }
      n.nodeValue = v.split(SENARAI.PBB.penuh).join(SENARAI.UMNO.penuh).replace(/\bPBB\b/g, 'UMNO');
    }
    var im = D.querySelectorAll('img.logo-parti'); for (var i = 0; i < im.length; i++) { im[i].setAttribute('src', SENARAI.UMNO.logo); im[i].classList.remove('logo-parti'); }
    if (D.title) { D.title = D.title.replace(/\bPBB\b/g, 'UMNO'); }
    var md = D.querySelector('meta[name="description"]'); if (md) { md.setAttribute('content', (md.getAttribute('content') || '').replace(/\bPBB\b/g, 'UMNO')); }
  }
  function terapkan() {
    if (!D || !D.body) { return; }
    var k = kini(); D.documentElement.setAttribute('data-parti', k);
    if (k === 'UMNO') { if (pernahTukar) { if (pemerhati) { pemerhati.disconnect(); } try { pulihUMNO(); } finally { pernahTukar = false; sambung(); } } return; }
    pernahTukar = true;
    if (pemerhati) { pemerhati.disconnect(); }
    try { imbas(D.body); imbas(D.head); if (D.title) { D.title = ke(D.title); } logo(); } finally { sambung(); }
  }
  function sambung() { if (pemerhati && D.body) { pemerhati.observe(D.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR }); } }
  function mula() {
    if (!D) { return; }
    D.documentElement.setAttribute('data-parti', kini());
    if (typeof MutationObserver === 'function' && !pemerhati) {
      pemerhati = new MutationObserver(function (muts) {
        if (kini() === 'UMNO') { return; }
        pemerhati.disconnect();
        try {
          muts.forEach(function (m) {
            if (m.type === 'childList') { for (var i = 0; i < m.addedNodes.length; i++) { imbas(m.addedNodes[i]); } logo(); }
            else if (m.type === 'characterData') { nod(m.target); }
            else if (m.type === 'attributes') { attr(m.target); }
          });
        } finally { sambung(); }
      });
    }
    terapkan();
  }
  if (D) { if (D.readyState === 'loading') { D.addEventListener('DOMContentLoaded', mula); } else { mula(); } }

  return { SENARAI: SENARAI, SENARAI_KOD: SENARAI_KOD, sah: sah, kod: kod, info: info, kini: kini, pilihan: pilihan, tetapPilihan: tetapPilihan, ke: ke, dari: dari, terapkan: terapkan };
});
