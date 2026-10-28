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
    PBB:  { kod: 'PBB', nama: 'PBB', penuh: 'Parti Pesaka Bumiputera Bersatu', logo: 'assets/images/logo-pbb.png', sayap: ['pemuda', 'wanita'], negeriTetap: 'Sarawak', data: 'data/pbb-sarawak.csv', bahagianJenis: 'DUN',
      /* v9.6: istilah badan parti. Bentuk BM -> PBB (ke) dan songsang (dari); songsang digunakan untuk carian kamus terjemahan. MKT -> Majlis Tertinggi (MT).
         v11.2: PAU -> Perhimpunan Agung PBB (PA) (v11.1 tersilap guna 'Konvensyen', iaitu istilah GPS); peringkat PBB ialah Ranting (lokaliti, = Cawangan UMNO), Cawangan (DUN, = Bahagian UMNO) dan Pusat; bulan mesyuarat mengikut kalendar PBB (js/calendar.js).
         Susunan penting: Cawangan -> Ranting dahulu, kemudian Bahagian -> Cawangan (tidak boleh diulang pada teks yang sudah ditukar; lihat pengawal dalam nod/attr). */
      istilah: [[/Majlis Kerja Tertinggi \(MKT\)/g, 'Majlis Tertinggi (MT)'], [/Majlis Kerja Tertinggi/g, 'Majlis Tertinggi'], [/\bMKT\b/g, 'MT'],
        [/Perhimpunan Agung PBB \(PAU\)/g, 'Perhimpunan Agung PBB'], [/Perhimpunan Agung \(PAU\)/g, 'Perhimpunan Agung PBB'], [/PBB General Assembly \(PAU\)/g, 'PBB General Assembly'], [/General Assembly \(PAU\)/g, 'PBB General Assembly'], [/\bPAU\b/g, 'PA'],
        [/\b([Bb])ulan 4-6\b/g, '$1ulan 3'], [/\b([Bb])ulan 7\b/g, '$1ulan 5'], [/\b([Bb])ulan 1-3\b/g, '$1ulan 1-2'], [/pada bulan 4\./g, 'pada bulan 3.'], [/sehingga bulan 3\b/g, 'sehingga bulan 2'], [/through month 3\b/g, 'through month 2'], [/until month 3\b/g, 'until month 2'], [/\b([Mm])onths? 4-6\b/g, '$1onth 3'], [/\b([Mm])onth 7\b/g, '$1onth 5'], [/\b([Mm])onths 1-3\b/g, '$1onths 1-2'], [/in month 4\./g, 'in month 3.'],
        [/Cawangan/g, 'Ranting'], [/cawangan/g, 'ranting'], [/CAWANGAN/g, 'RANTING'], [/\bBranch(es)?\b/g, 'Ranting'], [/\bbranch(es)?\b/g, 'ranting'],
        [/Bahagian/g, 'Cawangan'], [/(peringkat|Peringkat|ketua|Ketua) bahagian/g, '$1 cawangan'], [/\bDivisions?\b/g, 'Cawangan'], [/\bdivisions?\b/g, 'cawangan']],
      istilahSongsang: [[/Majlis Tertinggi \(MT\)/g, 'Majlis Kerja Tertinggi (MKT)'], [/Majlis Tertinggi/g, 'Majlis Kerja Tertinggi'], [/\bMT\b/g, 'MKT'],
        [/Perhimpunan Agung PBB(?! \()/g, 'Perhimpunan Agung PBB (PAU)'], [/\bPA\b/g, 'PAU'],
        [/\b([Bb])ulan 3\b/g, '$1ulan 4-6'], [/\b([Bb])ulan 5\b/g, '$1ulan 7'], [/\b([Bb])ulan 1-2\b/g, '$1ulan 1-3'], [/sehingga bulan 2\b/g, 'sehingga bulan 3'],
        [/Cawangan/g, 'Bahagian'], [/(peringkat|Peringkat|ketua|Ketua) cawangan/g, '$1 bahagian'], [/Ranting/g, 'Cawangan'], [/ranting/g, 'cawangan'], [/RANTING/g, 'CAWANGAN']] }
  };
  /* v10.0: PRS = parti rakan GPS dalam MOD RINGAN (struktur Bahagian = DUN dan Cawangan = DM seperti PBB; tiada blok, Premier atau Majlis Tertinggi penuh).
     ANDAIAN: kawasan operasi PRS = DUN Dayak 60% ke atas (data/prs-sarawak.csv). Logo daripada pengguna. */
  SENARAI.PRS = { kod: 'PRS', nama: 'PRS', penuh: 'Parti Rakyat Sarawak', logo: 'assets/images/logo-prs.jpg', sayap: ['pemuda', 'wanita'], negeriTetap: 'Sarawak', data: 'data/prs-sarawak.csv', bahagianJenis: 'DUN', ringan: true };
  /* v10.1: SUPP = parti rakan GPS, mod ringan, ciri teras Sokongan Bandar. ANDAIAN: kawasan operasi = DUN Cina 25% ke atas (data/supp-sarawak.csv). Logo daripada pengguna. */
  SENARAI.SUPP = { kod: 'SUPP', nama: 'SUPP', penuh: 'Parti Rakyat Bersatu Sarawak', logo: 'assets/images/logo-supp.svg', sayap: ['pemuda', 'wanita'], negeriTetap: 'Sarawak', data: 'data/supp-sarawak.csv', bahagianJenis: 'DUN', ringan: true };
  /* v10.2: PDP = parti rakan GPS, mod ringan, ciri teras Imbangan Kaum Kawasan. ANDAIAN: kawasan operasi = DUN campuran (kumpulan terbesar kurang 55%) (data/pdp-sarawak.csv). */
  SENARAI.PDP = { kod: 'PDP', nama: 'PDP', penuh: 'Parti Demokratik Progresif', logo: 'assets/images/logo-pdp.jpg', sayap: ['pemuda', 'wanita'], negeriTetap: 'Sarawak', data: 'data/pdp-sarawak.csv', bahagianJenis: 'DUN', ringan: true };
  /* v10.3: PSB = parti PEMBANGKANG Sarawak (di luar GPS), mod ringan, ciri teras Naratif Pembangkang. ANDAIAN: kawasan operasi = DUN bukan Melayu/Melanau 60% ke atas (Cina + Dayak) (data/psb-sarawak.csv). Tiada kuota GPS, Premier atau Menteri. */
  SENARAI.PSB = { kod: 'PSB', nama: 'PSB', penuh: 'Parti Sarawak Bersatu', logo: 'assets/images/logo-psb.png', sayap: ['pemuda', 'wanita'], negeriTetap: 'Sarawak', data: 'data/psb-sarawak.csv', bahagianJenis: 'DUN', ringan: true, pembangkang: true };
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
  function terap(s, senarai) { if (!senarai) { return s; } for (var j = 0; j < senarai.length; j++) { s = s.replace(senarai[j][0], senarai[j][1]); } return s; }
  function ke(s) {
    var k = kini(); if (k === 'UMNO' || s == null) { return s; }
    var TU = W.MyPolitikTranslations && W.MyPolitikTranslations.UMUM; if (TU) { s = TU.en(TU.bm(s)); }        // v10.6: tiada rujukan Perlembagaan/Fasal UMNO untuk parti lain
    var i = info(k), r = terap(String(s).replace(PENUH_UMNO, i.penuh).replace(RE_UMNO, i.nama), i.istilah);
    if (i.ringan) { r = r.split(SENARAI.PBB.penuh).join(i.penuh).replace(/\bPBB\b/g, i.nama); }          // v10.0: teks Sarawak yang menyebut PBB dijenamakan semula untuk parti mod ringan
    return r;
  }
  /** v11.1: calon songsangan alternatif (PAU / Perhimpunan Agung UMNO / (PAU) tidak boleh dibezakan; bulan mungkin asli). */
  function dariAlt(s) {
    var k = kini(); if (k !== 'PBB' || s == null) { return []; }
    var i = info(k), a = String(s), out = [], d = dari(a);
    var tanpaBulan = terap(a, i.istilahSongsang.filter(function (x) { return !/ulan/.test(x[0].source); })).split(i.penuh).join(SENARAI.UMNO.penuh).replace(/\bPBB\b/g, 'UMNO');
    [d, tanpaBulan].forEach(function (x) {
      [x, x.replace('Perhimpunan Agung UMNO (PAU)', 'Perhimpunan Agung UMNO'), x.replace('Perhimpunan Agung UMNO (PAU)', 'PAU'), x.replace('Perhimpunan Agung UMNO (PAU)', 'Perhimpunan Agung (PAU)')].forEach(function (y) { if (out.indexOf(y) < 0) { out.push(y); } });
    });
    return out;
  }
  /** Songsang: teks yang sudah dijenamakan -> UMNO (untuk carian kamus terjemahan). */
  function dari(s) {
    var k = kini(); if (k === 'UMNO' || s == null) { return s; }
    var i = info(k); return terap(String(s), i.istilahSongsang).split(i.penuh).join(SENARAI.UMNO.penuh).replace(new RegExp('\\b' + i.nama + '\\b', 'g'), 'UMNO');
  }

  /* ---------- Penjenamaan DOM ---------- */
  var D = W.document, pemerhati = null, ATTR = ['title', 'aria-label', 'placeholder', 'alt', 'content'];
  var RE_PERLU = /Cawangan|cawangan|Bahagian|Branch|Division|bulan 4|Bulan 4|bulan 7|Bulan 7|[Mm]onths? (4|7)|General Assembly|UMNO|Fasal \d|Perkara \d|Perlembagaan|Clause|Article \d|\bPBB\b|Parti Pesaka|Pertubuhan Kebangsaan|\bMKT\b|\bPAU\b|Majlis Kerja Tertinggi/;
  function nod(n) {
    var v = n.nodeValue; if (!v || !RE_PERLU.test(v)) { return; }
    var p = n.parentElement; if (p && (/^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName) || (p.closest && p.closest('[data-jenama-skip]')))) { return; }
    if (n.__npKe === v) { return; }      // v11.1: elak tukar dua kali (Cawangan -> Ranting, Bahagian -> Cawangan)
    var b = ke(v); n.__npKe = b; if (b !== v) { n.nodeValue = b; }
  }
  function attr(el) {
    for (var j = 0; j < ATTR.length; j++) {
      var a = ATTR[j]; if (!el.hasAttribute || !el.hasAttribute(a)) { continue; }
      if (a === 'content' && el.tagName !== 'META') { continue; }
      var v = el.getAttribute(a); el.__npKa = el.__npKa || {}; if (v && el.__npKa[a] !== v && RE_PERLU.test(v)) { var kb = ke(v); el.__npKa[a] = kb; el.setAttribute(a, kb); }
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
    for (var k = 0; k < im.length; k++) { if (im[k].hasAttribute('data-netral')) { continue; } if (im[k].getAttribute('src') !== i.logo) { im[k].onerror = null; im[k].setAttribute('src', i.logo); im[k].classList.add('logo-parti'); } }
    gaya();
  }
  var pernahTukar = false;
  /** Pulihkan paparan UMNO (cth. pemain menukar semula pilihan parti di skrin pendaftaran). */
  function pulihUMNO() {
    var w = D.createTreeWalker(D.body, 4), n, v;
    while ((n = w.nextNode())) {
      v = n.nodeValue; if (!v || (!/\b(PBB|PRS|SUPP|PDP|PSB)\b/.test(v) && v.indexOf(SENARAI.PBB.penuh) < 0 && v.indexOf(SENARAI.PRS.penuh) < 0 && v.indexOf(SENARAI.SUPP.penuh) < 0 && v.indexOf(SENARAI.PDP.penuh) < 0 && v.indexOf(SENARAI.PSB.penuh) < 0 && !/\bMT\b|\bPA\b|\bRanting\b|Perhimpunan Agung PBB/.test(v))) { continue; }
      if (n.parentElement && (/^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentElement.tagName) || (n.parentElement.closest && n.parentElement.closest('[data-jenama-skip]')))) { continue; }
      n.nodeValue = terap(v, SENARAI.PBB.istilahSongsang).split(SENARAI.PBB.penuh).join(SENARAI.UMNO.penuh).split(SENARAI.PRS.penuh).join(SENARAI.UMNO.penuh).split(SENARAI.SUPP.penuh).join(SENARAI.UMNO.penuh).split(SENARAI.PDP.penuh).join(SENARAI.UMNO.penuh).split(SENARAI.PSB.penuh).join(SENARAI.UMNO.penuh).replace(/\b(PBB|PRS|SUPP|PDP|PSB)\b/g, 'UMNO');
    }
    var im = D.querySelectorAll('img.logo-parti'); for (var i = 0; i < im.length; i++) { im[i].setAttribute('src', SENARAI.UMNO.logo); im[i].classList.remove('logo-parti'); }
    if (D.title) { D.title = D.title.replace(/\b(PBB|PRS|SUPP|PDP|PSB)\b/g, 'UMNO'); }
    var md = D.querySelector('meta[name="description"]'); if (md) { md.setAttribute('content', (md.getAttribute('content') || '').replace(/\b(PBB|PRS|SUPP|PDP|PSB)\b/g, 'UMNO')); }
  }
  function terapkan() {
    if (!D || !D.body) { return; }
    var k = kini(); D.documentElement.setAttribute('data-parti', k);
    var pb = D.querySelectorAll('[data-perlembagaan]'); for (var q = 0; q < pb.length; q++) { pb[q].style.display = k === 'UMNO' ? '' : 'none'; }      // v10.6: Perlembagaan yang dipaparkan ialah Perlembagaan UMNO; disembunyi untuk parti lain
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

  return { SENARAI: SENARAI, SENARAI_KOD: SENARAI_KOD, sah: sah, kod: kod, sarawak: function (k) { return k === 'PBB' || k === 'PRS' || k === 'SUPP' || k === 'PDP' || k === 'PSB'; }, ringan: function (k) { return !!(SENARAI[k] && SENARAI[k].ringan); }, info: info, dariAlt: dariAlt, kini: kini, pilihan: pilihan, tetapPilihan: tetapPilihan, ke: ke, dari: dari, terapkan: terapkan };
});
