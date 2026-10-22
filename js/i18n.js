/* ==========================================================================
   Nusa Politik — js/i18n.js   (v7.61)
   Sokongan dwibahasa BM <-> EN. Menggunakan kamus js/translations.js.
     - Bahasa semasa: p.settings.currentLang ('BM' | 'EN'), disalin ke localStorage ('nusaLang') supaya pilihan
       kekal pada peranti dan juga ada pada halaman utama/daftar sebelum pemain wujud.
     - toggleLanguage(): tukar BM <-> EN. Teks UI diterjemah secara dinamik merentasi semua tab: nod teks dan atribut
       title/aria-label/placeholder diterjemah, dan MutationObserver menterjemah kandungan yang dirender kemudian.
       Teks BM asal disimpan supaya boleh dipulihkan serta-merta (tanpa muat semula).
     - Teks yang tiada dalam kamus kekal BM (sandar). Tambah entri baharu dalam js/translations.js sahaja.
   Pilihan UI: butang <button data-lang-switch> (BM | EN) di pengepala; elemen `data-i18n-skip` dikecualikan.
   ========================================================================== */
(function (W) {
  'use strict';
  var T = W.MyPolitikTranslations, D = W.document;
  if (!T || !D) { return; }
  var KUNCI = 'nusaLang', LANGKAU = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1 };
  var ATTR = ['title', 'aria-label', 'placeholder', 'alt'];
  var lang = 'BM', teks = new Map(), attr = new Map(), cache = new Map(), pemerhati = null;

  /* ---------- Simpanan ---------- */
  function sah(l) { return l === 'EN' ? 'EN' : 'BM'; }
  function bacaLS() { try { var v = W.localStorage.getItem(KUNCI); return v === 'EN' || v === 'BM' ? v : null; } catch (e) { return null; } }
  function tulisLS(l) { try { W.localStorage.setItem(KUNCI, l); } catch (e) { /* mod peribadi */ } }
  function pemain() { try { return W.MyPolitikSave && W.MyPolitikSave.loadPlayer ? W.MyPolitikSave.loadPlayer() : null; } catch (e) { return null; } }
  function simpanPemain(l) {
    var S = W.MyPolitikSave, p = pemain();
    if (!S || !p || (p.settings && p.settings.currentLang === l)) { return; }
    try { S.applyEffects({}, { kiraTindakan: false, patch: { settings: Object.assign({}, p.settings || {}, { currentLang: l }) } }); } catch (e) { /* senyap */ }
  }

  /* ---------- Enjin terjemahan ---------- */
  var BMWORDS = {}, ENWORDS = {}, KEKAL = {};
  function token(s) { return (s.match(/[A-Za-zÀ-ÿ’']{2,}/g) || []); }
  (function bina() {
    var ke = T.KEKAL || [], i;
    for (i = 0; i < ke.length; i++) { KEKAL[ke[i].toLowerCase()] = 1; }
    Object.keys(T.EN).forEach(function (k) { token(T.EN[k]).forEach(function (w) { ENWORDS[w.toLowerCase()] = 1; }); });
    T.ISTILAH.forEach(function (r) { token(r[1]).forEach(function (w) { ENWORDS[w.toLowerCase()] = 1; }); });
    Object.keys(T.MINGGU).forEach(function (k) { token(T.MINGGU[k]).forEach(function (w) { ENWORDS[w.toLowerCase()] = 1; }); });
    ['and', 'to', 'of', 'the', 'in', 'for', 'on', 'left', 'next', 'no', 'data', 'your', 'area'].forEach(function (w) { ENWORDS[w] = 1; });
    Object.keys(T.BM).forEach(function (k) { token(T.BM[k]).forEach(function (w) { BMWORDS[w.toLowerCase()] = 1; }); });
    T.ISTILAH.forEach(function (r) { token(r[0]).forEach(function (w) { BMWORDS[w.toLowerCase()] = 1; }); });
    ('yang dan ke di untuk dengan daripada pada ialah atau dalam tidak belum sudah akan boleh anda lagi ini itu dari oleh juga kepada sebagai hanya semasa selepas sebelum setiap').split(' ').forEach(function (w) { BMWORDS[w] = 1; });
    Object.keys(BMWORDS).forEach(function (w) { if (ENWORDS[w] || KEKAL[w]) { delete BMWORDS[w]; } });
  })();

  var ISTILAH = T.ISTILAH.slice().sort(function (a, b) { return b[0].length - a[0].length; }), PETA = {};
  var RE_ISTILAH = new RegExp('(^|[^A-Za-zÀ-ÿ])(' + ISTILAH.map(function (r) { PETA[r[0]] = r[1]; return r[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')(?![A-Za-zÀ-ÿ])', 'g');

  /** Baki BM? (ketat = huruf besar di awal ayat juga ditolak jika tidak dikenali; longgar = nama diri dibenarkan). */
  function bersih(s, ketat) {
    var t = token(s), i, w, l, pos, pra;
    for (i = 0; i < t.length; i++) {
      w = t[i]; l = w.toLowerCase();
      if (BMWORDS[l]) { return false; }
      if (ENWORDS[l] || KEKAL[l]) { continue; }
      if (!/[A-Z]/.test(w.charAt(0))) { return false; }
      if (ketat) { pos = s.indexOf(w); pra = s.slice(0, pos).replace(/[\s"“(]+$/, ''); if (!pra || /[.:!?]$/.test(pra)) { return false; } }
    }
    return true;
  }
  function tepat(s) { var k = T.INDEKS[s]; return k !== undefined ? T.EN[k] : T.padan(s, function (x) { var y = terjemah(x.trim()); return y === null ? x : y; }); }
  function peraturan(s) {
    var i, m, r;
    for (i = 0; i < T.PERATURAN.length; i++) {
      m = T.PERATURAN[i][0].exec(s);
      if (m) { r = T.PERATURAN[i][1](m, function (x, ketat) { var y = terjemah(x); return y === null ? (ketat ? null : x) : y; }); if (r) { return r; } }
    }
    return null;
  }
  function gubah(s) {
    var r = s.replace(RE_ISTILAH, function (m, pra, t) { return pra + PETA[t]; });
    return r !== s && bersih(r, true) ? r : null;
  }
  /** Pisah pada pemisah ' · ', ', ', ': ', ' (', ')' dan terjemah setiap bahagian; bahagian nama/nombor dibiarkan. */
  function bahagi(s) {
    if (s.length > 160 || !/( · |, |: | \(|\))/.test(s)) { return null; }
    var bhg = s.split(/( · |, |: | \(|\))/), tukar = 0, i, t, out = [];
    for (i = 0; i < bhg.length; i++) {
      if (i % 2) { out.push(bhg[i]); continue; }
      if (!bhg[i].trim()) { out.push(bhg[i]); continue; }
      t = tepat(bhg[i].trim()) || peraturan(bhg[i].trim()) || gubah(bhg[i].trim());
      if (t !== null) { out.push(t); tukar += 1; }
      else if (bersih(bhg[i], false)) { out.push(bhg[i]); }
      else { return null; }
    }
    return tukar ? out.join('') : null;
  }
  /** Pisah rentetan berbilang ayat dan terjemah setiap ayat; null jika ada ayat yang tidak boleh diterjemah. */
  function ayat(s) {
    if (!/[.!?]\s+(?=[A-ZÀ-Ý"“(+−\-<0-9])/.test(s)) { return null; }
    var bhg = s.replace(/([.!?])\s+(?=[A-ZÀ-Ý"“(+−\-<0-9])/g, '$1\u0001').split('\u0001'), out = [], i, t, tukar = 0;
    for (i = 0; i < bhg.length; i++) {
      t = terjemah(bhg[i]);
      if (t !== null) { out.push(t); tukar += 1; }
      else if (bersih(bhg[i], false)) { out.push(bhg[i]); }
      else { return null; }
    }
    return tukar ? out.join(' ') : null;
  }
  /** Terjemah satu rentetan BM (tanpa ruang hujung). Pulang EN atau null jika tiada terjemahan. */
  function terjemah(s) {
    if (!s) { return null; }
    s = String(s).replace(/\s+/g, ' ').trim();
    var PT = W.MyPolitikParti, d = PT ? PT.dari(s) : s;                               // v8.32: teks dijenamakan (PBB) -> kunci kamus (UMNO)
    var hasil = dalam(d); if (hasil === null && d !== s) { hasil = dalam(s); }          // v9.6: jika songsangan istilah gagal (cth "Majlis Tertinggi" asli), cuba teks asal
    return hasil;
  }
  function dalam(s) {
    var PT = W.MyPolitikParti;
    T.NORMAL.forEach(function (n) { s = s.replace(n[0], n[1]); });
    if (/^(Wikipedia|mStar|Laman rasmi UMNO)\b/.test(s)) { return null; }          // tajuk sumber rujukan kekal
    if (cache.has(s)) { var cr = cache.get(s); return cr !== null && PT ? PT.ke(cr) : cr; }
    var r = tepat(s), aw = null;
    if (r === null) { r = peraturan(s); }
    if (r === null) { r = gubah(s); }
    if (r === null) { r = bahagi(s); }
    if (r === null) { r = ayat(s); }
    if (r === null && /[^.]\.$/.test(s)) { var tp = terjemah(s.slice(0, -1)); if (tp !== null) { r = tp + '.'; } }
    if (r === null && (aw = s.match(/^([^A-Za-zÀ-ÿ0-9(+\-−]{1,6}\s*)(.+)$/u))) { var d = terjemah(aw[2]); if (d !== null) { r = aw[1] + d; } }   // awalan emoji / simbol
    if (cache.size > 6000) { cache.clear(); }
    cache.set(s, r);
    return r !== null && PT ? PT.ke(r) : r;
  }
  /** t('branchMeeting') -> teks dalam bahasa semasa. */
  function t(kunci) { var K = lang === 'EN' ? T.EN : T.BM; return K[kunci] !== undefined ? K[kunci] : (T.BM[kunci] !== undefined ? T.BM[kunci] : kunci); }

  /* ---------- Penggunaan pada DOM ---------- */
  function terkecuali(el) { return !el || LANGKAU[el.tagName] || (el.closest && el.closest('[data-i18n-skip]')); }
  function nodTeks(n) {
    var v = n.nodeValue, rec = teks.get(n);
    if (!v || !v.trim() || (rec && v === rec.en) || terkecuali(n.parentElement)) { return; }
    var en = terjemah(v); if (en === null) { return; }
    var baru = v.match(/^\s*/)[0] + en + v.match(/\s*$/)[0];
    if (baru === v) { return; }
    teks.set(n, { bm: v, en: baru }); n.nodeValue = baru;
  }
  function atribut(el, a) {
    var v = el.getAttribute(a); if (!v || !v.trim()) { return; }
    var rec = attr.get(el), r = rec && rec[a];
    if (r && v === r.en) { return; }
    var en = T.MINGGU[v.trim()] || terjemah(v); if (en === null || en === v) { return; }   // title bulan = nama penuh (Mac -> March)
    if (!rec) { rec = {}; attr.set(el, rec); }
    rec[a] = { bm: v, en: en }; el.setAttribute(a, en);
  }
  function guna(akar) {
    if (!akar) { return; }
    if (akar.nodeType === 3) { nodTeks(akar); return; }
    if (akar.nodeType !== 1 || terkecuali(akar)) { return; }
    var w = D.createTreeWalker(akar, 4), n;
    while ((n = w.nextNode())) { nodTeks(n); }
    var senarai = akar.querySelectorAll ? akar.querySelectorAll('[title],[aria-label],[placeholder],[alt]') : [];
    ATTR.forEach(function (a) { if (akar.hasAttribute && akar.hasAttribute(a)) { atribut(akar, a); } });
    for (var i = 0; i < senarai.length; i++) { for (var j = 0; j < ATTR.length; j++) { if (senarai[i].hasAttribute(ATTR[j])) { atribut(senarai[i], ATTR[j]); } } }
  }
  function pulih() {
    teks.forEach(function (rec, n) { if (n.isConnected && n.nodeValue === rec.en) { n.nodeValue = rec.bm; } });
    attr.forEach(function (rec, el) { if (!el.isConnected) { return; } Object.keys(rec).forEach(function (a) { if (el.getAttribute(a) === rec[a].en) { el.setAttribute(a, rec[a].bm); } }); });
    teks.clear(); attr.clear();
  }
  function pantau() {
    if (pemerhati || typeof MutationObserver !== 'function' || !D.body) { return; }
    pemerhati = new MutationObserver(function (muts) {
      if (lang !== 'EN') { return; }
      pemerhati.disconnect();
      try {
        muts.forEach(function (m) {
          if (m.type === 'childList') { for (var i = 0; i < m.addedNodes.length; i++) { guna(m.addedNodes[i]); } }
          else if (m.type === 'characterData') { nodTeks(m.target); }
          else if (m.type === 'attributes') { atribut(m.target, m.attributeName); }
        });
      } finally { sambung(); }
    });
    sambung();
  }
  function sambung() { if (pemerhati && D.body) { pemerhati.observe(D.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR }); } }

  /* ---------- Butang BM | EN ---------- */
  function butang() {
    var bt = D.querySelectorAll('[data-lang-switch]');
    for (var i = 0; i < bt.length; i++) {
      bt[i].setAttribute('aria-pressed', lang === 'EN' ? 'true' : 'false');
      bt[i].setAttribute('data-lang-now', lang);
      var sp = bt[i].querySelectorAll('[data-lang]');
      for (var j = 0; j < sp.length; j++) { sp[j].classList.toggle('is-on', sp[j].getAttribute('data-lang') === lang); }
    }
  }

  /* ---------- Awam ---------- */
  function setLanguage(l, opsi) {
    l = sah(l); var ubah = l !== lang; lang = l;
    D.documentElement.setAttribute('lang', l === 'EN' ? 'en' : 'ms');
    if (opsi && opsi.simpan === false) { /* hanya paparan */ } else { tulisLS(l); simpanPemain(l); }
    if (pemerhati) { pemerhati.disconnect(); }
    try { if (l === 'EN') { guna(D.body); } else { pulih(); } } finally { sambung(); }
    butang();
    if (ubah) { try { D.dispatchEvent(new CustomEvent('nusa:bahasa', { detail: { lang: l } })); } catch (e) { /* senyap */ } }
    return l;
  }
  function toggleLanguage() { return setLanguage(lang === 'EN' ? 'BM' : 'EN'); }
  function getLanguage() { return lang; }

  function mula() {
    var p = pemain(), awal = bacaLS() || (p && p.settings && sah(p.settings.currentLang)) || 'BM';
    pantau(); setLanguage(awal, { simpan: false });
    if (p && (!p.settings || p.settings.currentLang !== awal)) { simpanPemain(awal); }
    D.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('[data-lang-switch]') : null;
      if (b) { ev.preventDefault(); toggleLanguage(); }
    });
  }
  if (D.readyState === 'loading') { D.addEventListener('DOMContentLoaded', mula); } else { mula(); }

  W.MyPolitikI18n = { t: t, terjemah: terjemah, toggleLanguage: toggleLanguage, setLanguage: setLanguage, getLanguage: getLanguage, guna: guna };
  W.toggleLanguage = toggleLanguage;
})(window);
