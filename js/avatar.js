/* ==========================================================================
   Nusa Politik — js/avatar.js
   Avatar watak (SVG asli, dilukis dengan kod): Pemuda, Puteri, Wanita, Biasa, Veteran.
   v5.1: tambah Biasa (lelaki pertengahan umur, baju Melayu biru tua, songkok hitam).
   v14.14: AMANAH: avatar WARDA (kod 'puteri', wanita muda); AWAN kini berwajah lebih berusia.
   v14.13: set khas AMANAH (oren, putih; lencana A); AWAN sentiasa bertudung.
   v14.12: set khas DAP (merah, putih, biru tua; lencana roket); Wanita DAP lalai tanpa tudung, 'wanita2' = bertudung.
   v14.11: set khas PKR (biru muda, merah, putih; lencana logo mata) termasuk Wanita tanpa tudung (kod 'wanita2', PKR sahaja).
   v4.3: Pemuda (baju Melayu putih, songkok hitam), Puteri (kebaya putih, tudung merah jambu),
         Wanita (baju kurung putih, tudung merah, berusia), Veteran (baju Melayu merah, songkok hitam, berusia).
     MyPolitikAvatar.LIST                        senarai { kod, label, penerangan }
     MyPolitikAvatar.svg('pemuda', {saiz:96})    penanda SVG (string)
     MyPolitikAvatar.pasang(elemen, 'puteri')    letak avatar dalam elemen
     MyPolitikAvatar.cadangan(demografik)        kod avatar sepadan dengan demografik
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikAvatar = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var LIST = [
    { kod: 'pemuda',  label: 'Pemuda',  penerangan: 'Lelaki muda, baju Melayu putih, songkok hitam' },
    { kod: 'puteri',  label: 'Puteri',  penerangan: 'Perempuan muda, kebaya putih, tudung merah jambu' },
    { kod: 'wanita',  label: 'Wanita',  penerangan: 'Perempuan berusia, baju kurung putih, tudung merah' },
    { kod: 'biasa',   label: 'Biasa',   penerangan: 'Lelaki pertengahan umur, baju Melayu biru tua, songkok hitam' },
    { kod: 'veteran', label: 'Veteran', penerangan: 'Lelaki berusia, baju Melayu merah, songkok hitam' }
  ];

  var LATAR = {
    pemuda:  { bg1: '#E8344F', bg2: '#7A0A1E' },
    puteri:  { bg1: '#5B6BC0', bg2: '#232A63' },
    wanita:  { bg1: '#FFD84D', bg2: '#B8860B' },
    biasa:   { bg1: '#2E8B6E', bg2: '#0E3B2E' },
    veteran: { bg1: '#6B7387', bg2: '#242834' },
    veteran_p: { bg1: '#6B7387', bg2: '#242834' }          // v7.50: variasi Veteran perempuan (dashboard sahaja; bukan pilihan pendaftaran)
  };

  var seq = 0;
  var MATA = function (x, y, tua) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="2" ry="' + (tua ? 1.5 : 2) + '" fill="#2B1B12"/><circle cx="' + (x + .7) + '" cy="' + (y - .7) + '" r=".6" fill="#fff"/>';
  };


  /* v10.5: set avatar umum untuk parti selain UMNO (tiada songkok/baju Melayu/Puteri; rambut dan pakaian neutral). */
  var GAYA_UMUM = {
    pemuda:  { kulit: '#D9A97E', rambut: '#15171D', baju: '#F4F6F8', tali: '#2E6BD6', tua: 0, wanita: 0 },
    biasa:   { kulit: '#D2A074', rambut: '#2A2A2E', baju: '#2F3E5C', tali: '#B8860B', tua: 0, wanita: 0, uban: 1 },
    veteran: { kulit: '#CDA27C', rambut: '#E6E6EA', baju: '#7B5B3A', tali: null, tua: 1, wanita: 0 },
    veteran_p: { kulit: '#D4AA86', rambut: '#E6E6EA', baju: '#5C4A7A', tali: null, tua: 1, wanita: 1 },
    wanita:  { kulit: '#E0B48E', rambut: '#1E1A17', baju: '#1F7A6B', tali: null, tua: 0, wanita: 1 }
  };
  function bahagianUmum(kod) {
    var g = GAYA_UMUM[kod] || GAYA_UMUM.pemuda, s = '';
    // badan: kemeja / blazer / blaus
    s += '<path d="M6 96 C8 76 26 68 48 68 C70 68 88 76 90 96Z" fill="' + g.baju + '"/>';
    if (g.wanita) { s += '<path d="M38 69 Q48 80 58 69" fill="#fff" opacity=".9"/>'; }
    else if (kod === 'pemuda') { s += '<path d="M40 69 L48 80 L56 69 L52 68 L48 72 L44 68Z" fill="#fff"/><path d="M48 74 L45.5 96 L50.5 96Z" fill="' + g.tali + '"/>'; }
    else if (kod === 'biasa') { s += '<path d="M38 69 L48 88 L58 69 L53 68 L48 74 L43 68Z" fill="#F4F6F8"/><path d="M48 76 L45.5 96 L50.5 96Z" fill="' + g.tali + '"/><path d="M48 80 L48 96" stroke="#1B2740" stroke-width="1.4"/>'; }
    else { s += '<path d="M38 69 Q48 76 58 69" fill="none" stroke="#5A4128" stroke-width="2"/><path d="M48 74 L48 96" stroke="#5A4128" stroke-width="1.4"/><circle cx="48" cy="82" r="1.4" fill="#E2B93B"/><circle cx="48" cy="89" r="1.4" fill="#E2B93B"/>'; }
    s += '<rect x="42" y="56" width="12" height="14" rx="4" fill="' + g.kulit + '"/>';
    // rambut belakang (wanita)
    if (g.wanita) { s += '<path d="M28 46 C26 22 70 22 68 46 C69 62 72 68 70 74 L26 74 C24 68 27 62 28 46Z" fill="' + g.rambut + '"/>'; }
    // muka
    s += '<circle cx="32.5" cy="46" r="3.2" fill="' + g.kulit + '"/><circle cx="63.5" cy="46" r="3.2" fill="' + g.kulit + '"/>' +
         '<ellipse cx="48" cy="45" rx="15.5" ry="18" fill="' + g.kulit + '"/>';
    // rambut atas
    if (g.wanita) { s += '<path d="M32 40 C31 24 65 24 64 40 C58 32 46 29 32 40Z" fill="' + g.rambut + '"/>'; }
    else { s += '<path d="M32 40 C30 22 66 22 64 40 C62 32 56 28 48 28 C40 28 34 32 32 40Z" fill="' + g.rambut + '"/>'; }
    var alis = g.tua ? '#CFCFD6' : (g.wanita ? '#3A2A20' : '#2B1B12');
    s += '<path d="M37 40.5 q4 -2.4 8 -.4 M51 40.1 q4 -2 8 .4" fill="none" stroke="' + alis + '" stroke-width="1.7" stroke-linecap="round"/>' +
         MATA(42, 45, g.tua) + MATA(54, 45, g.tua) +
         '<path d="M48 46 q-2.4 5.5 .8 6.4" fill="none" stroke="#B98660" stroke-width="1.4" stroke-linecap="round"/>' +
         '<path d="M42.5 55 q5.5 4.5 11 0" fill="none" stroke="' + (g.wanita ? '#C0475F' : '#7A3B2A') + '" stroke-width="1.8" stroke-linecap="round"/>';
    if (g.tua) { s += '<path d="M39.6 52 q-2 5.4 .4 9.6 M56.4 52 q2 5.4 -.4 9.6" fill="none" stroke="#B98660" stroke-width="1" stroke-linecap="round" opacity=".8"/>'; }
    if (g.tua && !g.wanita) { s += '<circle cx="42" cy="45" r="5.6" fill="none" stroke="#3A3A44" stroke-width="1.1"/><circle cx="54" cy="45" r="5.6" fill="none" stroke="#3A3A44" stroke-width="1.1"/><path d="M47.6 44.6 h.8" stroke="#3A3A44" stroke-width="1.1"/>'; }
    if (g.uban) { s += '<path d="M32 38 Q31 43 33 47 L35 39Z M64 38 Q65 43 63 47 L61 39Z" fill="#CFCFD6"/>'; }
    return s;
  }

  function bahagian(kod, umumGaya) {
    if (umumGaya) { return bahagianUmum(kod); }
    var s = '';
    if (kod === 'pemuda') {
      var kulit = '#E2B08A', gelap = '#C48B66';
      // baju Melayu putih
      s += '<path d="M6 96 C8 76 26 68 48 68 C70 68 88 76 90 96Z" fill="#F7F7F3"/>' +
           '<path d="M6 96 C8 76 26 68 48 68 C70 68 88 76 90 96" fill="none" stroke="#D9D9D0" stroke-width="1.5"/>' +
           '<path d="M48 76 L48 96" stroke="#DADAD0" stroke-width="1.6"/>' +
           '<circle cx="48" cy="82" r="1.5" fill="#E2B93B"/><circle cx="48" cy="89" r="1.5" fill="#E2B93B"/>';
      // leher dan kolar cekak musang
      s += '<rect x="42" y="56" width="12" height="14" rx="4" fill="' + kulit + '"/>' +
           '<path d="M38 67 Q48 74 58 67 L58 74 Q48 81 38 74Z" fill="#FFFFFF" stroke="#D9D9D0" stroke-width="1.3" stroke-linejoin="round"/>';
      // kepala
      s += '<circle cx="32.5" cy="46" r="3.2" fill="' + kulit + '"/><circle cx="63.5" cy="46" r="3.2" fill="' + kulit + '"/>' +
           '<ellipse cx="48" cy="45" rx="15.5" ry="18" fill="' + kulit + '"/>' +
           '<path d="M33 38 Q32 44 34 49 L35 40Z M63 38 Q64 44 62 49 L61 40Z" fill="#1C1713"/>';
      s += '<path d="M37 40 q4 -2.4 8 -.4 M51 39.6 q4 -2 8 .4" fill="none" stroke="#2B1B12" stroke-width="1.7" stroke-linecap="round"/>' +
           MATA(42, 45, 0) + MATA(54, 45, 0) +
           '<path d="M48 46 q-2.4 5.5 .8 6.4" fill="none" stroke="' + gelap + '" stroke-width="1.4" stroke-linecap="round"/>' +
           '<path d="M42.5 55 q5.5 4.5 11 0" fill="none" stroke="#7A3B2A" stroke-width="1.8" stroke-linecap="round"/>' +
           '<circle cx="38" cy="51" r="3" fill="#F08A7A" opacity=".22"/><circle cx="58" cy="51" r="3" fill="#F08A7A" opacity=".22"/>';
      // songkok hitam
      s += '<path d="M30.5 36 L32.5 21 Q33 16 40 16 L56 16 Q63 16 63.5 21 L65.5 36 Q48 30.5 30.5 36Z" fill="#15171D"/>' +
           '<path d="M33 23 Q48 19 63 23 L63.5 26 Q48 22 32.5 26Z" fill="#2B2F3A" opacity=".8"/>' +
           '<path d="M31 35 Q48 29.8 65 35" fill="none" stroke="#2B2F3A" stroke-width="1.2"/>';
      return s;
    }

    if (kod === 'puteri') {
      var k = '#F0C4A0', merah = '#E9729B', bayangM = '#C84F7E', cerah = '#F7A9C4';
      // kebaya putih berenda
      s += '<path d="M6 96 C8 76 26 68 48 68 C70 68 88 76 90 96Z" fill="#FDFCFA"/>' +
           '<path d="M6 96 C8 76 26 68 48 68 C70 68 88 76 90 96" fill="none" stroke="#E4DCE2" stroke-width="1.4"/>' +
           '<path d="M42 72 Q44 86 41 96 L55 96 Q52 86 54 72Z" fill="#F4E6EE"/>' +
           '<path d="M42 72 Q44 86 41 96 M54 72 Q52 86 55 96" fill="none" stroke="#E9C9D9" stroke-width="3" stroke-linecap="round" stroke-dasharray="1.4 3"/>' +
           '<path d="M12 88 Q20 79 32 76 M84 88 Q76 79 64 76" fill="none" stroke="#EADDE6" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="1.4 3"/>';
      // tudung merah jambu
      s += '<path d="M21 48 C19 17 77 17 75 48 C75 59 78 66 82 74 C71 73 60 77 48 77 C36 77 25 73 14 74 C18 66 21 59 21 48Z" fill="' + merah + '"/>' +
           '<path d="M14 74 C25 73 36 77 48 77 C60 77 71 73 82 74" fill="none" stroke="' + bayangM + '" stroke-width="1.6"/>' +
           '<path d="M24 56 C26 62 29 68 33 74 M72 56 C70 62 67 68 63 74" fill="none" stroke="' + bayangM + '" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>' +
           '<path d="M30 30 C38 22 58 22 66 30" fill="none" stroke="' + cerah + '" stroke-width="2" stroke-linecap="round" opacity=".75"/>';
      // muka
      s += '<ellipse cx="48" cy="47" rx="14.5" ry="17.5" fill="' + bayangM + '"/>' +
           '<ellipse cx="48" cy="47.6" rx="13.4" ry="16.6" fill="' + k + '"/>' +
           '<path d="M38 41 q4 -2.4 8 -.2 M50 40.8 q4 -2 8 .2" fill="none" stroke="#4A2F22" stroke-width="1.4" stroke-linecap="round"/>' +
           MATA(42.5, 46, 0) + MATA(53.5, 46, 0) +
           '<path d="M40.4 44.2 q2 -1.6 4.2 -.3 M51.4 43.9 q2.2 -1.3 4.2 .3" fill="none" stroke="#2B1B12" stroke-width="1" stroke-linecap="round"/>' +
           '<path d="M48 47 q-2 5 .8 5.6" fill="none" stroke="#D09A78" stroke-width="1.3" stroke-linecap="round"/>' +
           '<path d="M43.5 56 q4.5 3.6 9 0 q-4.5 1.6 -9 0Z" fill="#D9546F" stroke="#D9546F" stroke-width="1.2" stroke-linejoin="round"/>' +
           '<circle cx="38.8" cy="52" r="3" fill="#F08A9A" opacity=".3"/><circle cx="57.2" cy="52" r="3" fill="#F08A9A" opacity=".3"/>';
      // kerongsang
      s += '<circle cx="48" cy="77.5" r="3.2" fill="#E2B93B" stroke="#B8860B" stroke-width="1"/><circle cx="48" cy="77.5" r="1.1" fill="#fff" opacity=".8"/>' +
           '<path d="M48 80.6 L45.8 86 L50.2 86Z" fill="#E2B93B" stroke="#B8860B" stroke-width=".8" stroke-linejoin="round"/>';
      return s;
    }

    if (kod === 'wanita') {
      var kw = '#DDA982', gw = '#B98660', merahT = '#C8102E', bayangT = '#8E0B22';
      // baju kurung putih
      s += '<path d="M6 96 C8 76 26 68 48 68 C70 68 88 76 90 96Z" fill="#FBFBF7"/>' +
           '<path d="M6 96 C8 76 26 68 48 68 C70 68 88 76 90 96" fill="none" stroke="#DCDCD2" stroke-width="1.5"/>' +
           '<path d="M48 80 L48 96" stroke="#DCDCD2" stroke-width="1.5"/><circle cx="48" cy="86" r="1.3" fill="#E2B93B"/><circle cx="48" cy="92" r="1.3" fill="#E2B93B"/>' +
           '<path d="M26 90 Q36 86 44 88 M70 90 Q60 86 52 88" fill="none" stroke="#E5E5DC" stroke-width="1.4" stroke-linecap="round"/>';
      // tudung merah
      s += '<path d="M20 50 C18 16 78 16 76 50 C76 62 80 70 84 79 C72 77 60 80 48 80 C36 80 24 77 12 79 C16 70 20 62 20 50Z" fill="' + merahT + '"/>' +
           '<path d="M12 79 C24 77 36 80 48 80 C60 80 72 77 84 79" fill="none" stroke="' + bayangT + '" stroke-width="1.7"/>' +
           '<path d="M23 58 C25 66 28 72 32 78 M73 58 C71 66 68 72 64 78" fill="none" stroke="' + bayangT + '" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>' +
           '<path d="M30 28 C38 21 58 21 66 28" fill="none" stroke="#E8344F" stroke-width="2" stroke-linecap="round" opacity=".8"/>';
      // muka berusia
      s += '<ellipse cx="48" cy="48" rx="14.8" ry="17.8" fill="' + bayangT + '"/>' +
           '<ellipse cx="48" cy="48.6" rx="13.7" ry="16.9" fill="' + kw + '"/>' +
           '<path d="M39 41.4 q4 -2 8 -.2 M50 41.2 q4 -1.8 8 .2" fill="none" stroke="#7B6B62" stroke-width="1.6" stroke-linecap="round"/>' +
           MATA(42.6, 46.4, 1) + MATA(53.4, 46.4, 1) +
           // kedutan: dahi, kaki gagak, bawah mata, lipatan senyum
           '<path d="M40 35.5 q8 -2.2 16 0 M41.5 38 q6.5 -1.6 13 0" fill="none" stroke="' + gw + '" stroke-width="1" stroke-linecap="round" opacity=".8"/>' +
           '<path d="M36.6 45.4 l-3 -.9 M36.7 47.2 l-3 .4 M59.4 45.4 l3 -.9 M59.3 47.2 l3 .4" stroke="' + gw + '" stroke-width="1" stroke-linecap="round"/>' +
           '<path d="M39.6 49.3 q3 1.6 6 0 M50.4 49.3 q3 1.6 6 0" fill="none" stroke="' + gw + '" stroke-width=".9" stroke-linecap="round" opacity=".8"/>' +
           '<path d="M48 47.5 q-2 5 .8 5.6" fill="none" stroke="' + gw + '" stroke-width="1.3" stroke-linecap="round"/>' +
           '<path d="M40.4 51 q-1.6 5 .6 9 M55.6 51 q1.6 5 -.6 9" fill="none" stroke="' + gw + '" stroke-width="1" stroke-linecap="round" opacity=".8"/>' +
           '<path d="M43.4 57.4 q4.6 3.4 9.2 0" fill="none" stroke="#9A4A3A" stroke-width="1.9" stroke-linecap="round"/>' +
           '<circle cx="38.8" cy="53" r="3" fill="#E3877A" opacity=".2"/><circle cx="57.2" cy="53" r="3" fill="#E3877A" opacity=".2"/>';
      // kerongsang di bahu
      s += '<g transform="translate(33 76)"><circle r="3" fill="#E2B93B" stroke="#B8860B" stroke-width="1"/><circle r="1" fill="#fff" opacity=".8"/></g>';
      return s;
    }

    /* biasa (lelaki 41-59) */
    if (kod === 'biasa') {
      var kb = '#D8A57C', gb = '#AE7650';
      s += '<path d="M6 96 C8 76 26 68 48 68 C70 68 88 76 90 96Z" fill="#1D3A6E"/>' +
           '<path d="M6 96 C8 76 26 68 48 68 C70 68 88 76 90 96" fill="none" stroke="#11264B" stroke-width="1.6"/>' +
           '<path d="M48 76 L48 96" stroke="#11264B" stroke-width="1.6"/>' +
           '<circle cx="48" cy="82" r="1.6" fill="#E2B93B"/><circle cx="48" cy="89" r="1.6" fill="#E2B93B"/>' +
           '<path d="M20 90 Q30 84 40 86 M76 90 Q66 84 56 86" fill="none" stroke="#3B5FA3" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>';
      s += '<rect x="41" y="56" width="14" height="14" rx="4" fill="' + kb + '"/>' +
           '<path d="M37 67 Q48 74 59 67 L59 74 Q48 81 37 74Z" fill="#2B4E8F" stroke="#11264B" stroke-width="1.3" stroke-linejoin="round"/>';
      s += '<circle cx="32" cy="47" r="3.4" fill="' + kb + '"/><circle cx="64" cy="47" r="3.4" fill="' + kb + '"/>' +
           '<ellipse cx="48" cy="46" rx="16" ry="18.5" fill="' + kb + '"/>' +
           '<path d="M33 40 Q31.6 45 33.4 49.5 Q35 46 35.2 41.5Z M63 40 Q64.4 45 62.6 49.5 Q61 46 60.8 41.5Z" fill="#6E6A68"/>';
      s += '<path d="M36 40.4 q4.5 -2.8 9 -.6 M51 39.8 q4.5 -2.2 9 .6" fill="none" stroke="#3A2A22" stroke-width="2.6" stroke-linecap="round"/>' +
           MATA(42, 46, 0) + MATA(54, 46, 0) +
           '<path d="M39 37.4 q9 -2.2 18 0" fill="none" stroke="' + gb + '" stroke-width=".9" stroke-linecap="round" opacity=".6"/>' +
           '<path d="M36.6 45.8 l-2.4 -.6 M59.4 45.8 l2.4 -.6" stroke="' + gb + '" stroke-width=".9" stroke-linecap="round"/>' +
           '<path d="M48 47 q-2.2 5.4 .9 6.2" fill="none" stroke="' + gb + '" stroke-width="1.3" stroke-linecap="round"/>' +
           '<path d="M40.4 52 q-1.4 4.6 .4 8 M55.6 52 q1.4 4.6 -.4 8" fill="none" stroke="' + gb + '" stroke-width=".9" stroke-linecap="round" opacity=".7"/>' +
           '<path d="M48 55.4 Q43 52.8 39 56 Q43 59 48 57.4 Q53 59 57 56 Q53 52.8 48 55.4Z" fill="#3A2A22"/>' +
           '<path d="M44 60.4 q4 2.2 8 0" fill="none" stroke="#7A3B2A" stroke-width="1.6" stroke-linecap="round"/>';
      s += '<path d="M30 36.5 L32 20.5 Q32.5 15.5 39.5 15.5 L56.5 15.5 Q63.5 15.5 64 20.5 L66 36.5 Q48 31 30 36.5Z" fill="#15171D"/>' +
           '<path d="M32.6 22.5 Q48 18.5 63.4 22.5 L63.8 25.5 Q48 21.5 32.2 25.5Z" fill="#2B2F3A" opacity=".8"/>' +
           '<path d="M30.5 35.6 Q48 30.4 65.5 35.6" fill="none" stroke="#2B2F3A" stroke-width="1.2"/>';
      return s;
    }

    /* veteran perempuan (v7.50): paparan dashboard bagi pemain perempuan kategori Veteran */
    if (kod === 'veteran_p') {
      var kw = '#D9A47E', gw = '#A8714C', tud = '#E3E5EB', bay = '#A9AEBB';
      // baju kurung merah
      s += '<path d="M6 96 C8 76 26 68 48 68 C70 68 88 76 90 96Z" fill="#B3122B"/>' +
           '<path d="M6 96 C8 76 26 68 48 68 C70 68 88 76 90 96" fill="none" stroke="#7E0A1D" stroke-width="1.6"/>' +
           '<path d="M48 80 L48 96" stroke="#7E0A1D" stroke-width="1.5"/><circle cx="48" cy="86" r="1.4" fill="#E2B93B"/><circle cx="48" cy="92" r="1.4" fill="#E2B93B"/>' +
           '<path d="M26 90 Q36 86 44 88 M70 90 Q60 86 52 88" fill="none" stroke="#C93249" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>';
      // tudung kelabu perak
      s += '<path d="M20 50 C18 16 78 16 76 50 C76 62 80 70 84 79 C72 77 60 80 48 80 C36 80 24 77 12 79 C16 70 20 62 20 50Z" fill="' + tud + '"/>' +
           '<path d="M12 79 C24 77 36 80 48 80 C60 80 72 77 84 79" fill="none" stroke="' + bay + '" stroke-width="1.7"/>' +
           '<path d="M23 58 C25 66 28 72 32 78 M73 58 C71 66 68 72 64 78" fill="none" stroke="' + bay + '" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>' +
           '<path d="M30 28 C38 21 58 21 66 28" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity=".8"/>';
      // muka tua
      s += '<ellipse cx="48" cy="48" rx="14.8" ry="17.8" fill="' + bay + '"/>' +
           '<ellipse cx="48" cy="48.6" rx="13.7" ry="16.9" fill="' + kw + '"/>' +
           '<path d="M39 41.4 q4 -2 8 -.2 M50 41.2 q4 -1.8 8 .2" fill="none" stroke="#9A9AA4" stroke-width="1.6" stroke-linecap="round"/>' +
           MATA(42.6, 46.4, 1) + MATA(53.4, 46.4, 1) +
           // cermin mata
           '<circle cx="42.6" cy="46.4" r="5.2" fill="none" stroke="#5B4636" stroke-width="1.1"/><circle cx="53.4" cy="46.4" r="5.2" fill="none" stroke="#5B4636" stroke-width="1.1"/><path d="M47.8 46 q.2 -.8 .4 0" stroke="#5B4636" stroke-width="1.1" fill="none"/>' +
           '<path d="M40 35.5 q8 -2.2 16 0 M41.5 38 q6.5 -1.6 13 0" fill="none" stroke="' + gw + '" stroke-width="1" stroke-linecap="round" opacity=".8"/>' +
           '<path d="M36.6 45.4 l-3 -.9 M36.7 47.2 l-3 .4 M59.4 45.4 l3 -.9 M59.3 47.2 l3 .4" stroke="' + gw + '" stroke-width="1" stroke-linecap="round"/>' +
           '<path d="M48 47.5 q-2 5 .8 5.6" fill="none" stroke="' + gw + '" stroke-width="1.3" stroke-linecap="round"/>' +
           '<path d="M40.4 51.4 q-1.6 5 .6 9 M55.6 51.4 q1.6 5 -.6 9" fill="none" stroke="' + gw + '" stroke-width="1" stroke-linecap="round" opacity=".8"/>' +
           '<path d="M43.4 57.4 q4.6 3.4 9.2 0" fill="none" stroke="#9A4A3A" stroke-width="1.9" stroke-linecap="round"/>' +
           '<circle cx="38.8" cy="54" r="3" fill="#E3877A" opacity=".2"/><circle cx="57.2" cy="54" r="3" fill="#E3877A" opacity=".2"/>';
      s += '<g transform="translate(33 76)"><circle r="3" fill="#E2B93B" stroke="#B8860B" stroke-width="1"/><circle r="1" fill="#fff" opacity=".8"/></g>';
      return s;
    }

    /* veteran */
    var kv = '#D49C74', gv = '#A8714C';
    s += '<path d="M6 96 C8 76 26 68 48 68 C70 68 88 76 90 96Z" fill="#B3122B"/>' +
         '<path d="M6 96 C8 76 26 68 48 68 C70 68 88 76 90 96" fill="none" stroke="#7E0A1D" stroke-width="1.6"/>' +
         '<path d="M48 76 L48 96" stroke="#7E0A1D" stroke-width="1.6"/>' +
         '<circle cx="48" cy="82" r="1.6" fill="#E2B93B"/><circle cx="48" cy="89" r="1.6" fill="#E2B93B"/>' +
         '<path d="M20 90 Q30 84 40 86 M76 90 Q66 84 56 86" fill="none" stroke="#C93249" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>';
    s += '<rect x="41" y="56" width="14" height="14" rx="4" fill="' + kv + '"/>' +
         '<path d="M37 67 Q48 74 59 67 L59 74 Q48 81 37 74Z" fill="#C41E37" stroke="#7E0A1D" stroke-width="1.3" stroke-linejoin="round"/>';
    s += '<circle cx="32" cy="47" r="3.4" fill="' + kv + '"/><circle cx="64" cy="47" r="3.4" fill="' + kv + '"/>' +
         '<ellipse cx="48" cy="46" rx="16" ry="18.5" fill="' + kv + '"/>' +
         '<path d="M33 40 Q31.6 45 33.4 49.5 Q35 46 35.2 41.5Z M63 40 Q64.4 45 62.6 49.5 Q61 46 60.8 41.5Z" fill="#E9E9EC"/>';
    s += '<path d="M36 40.4 q4.5 -2.8 9 -.6 M51 39.8 q4.5 -2.2 9 .6" fill="none" stroke="#E4E4E8" stroke-width="2.6" stroke-linecap="round"/>' +
         MATA(42, 46, 1) + MATA(54, 46, 1) +
         '<path d="M38 36.5 q10 -2.8 20 0 M39.4 39 q8.6 -1.8 17.2 0" fill="none" stroke="' + gv + '" stroke-width="1" stroke-linecap="round" opacity=".8"/>' +
         '<path d="M36.4 45.6 l-3.2 -.9 M36.5 47.5 l-3.2 .4 M59.6 45.6 l3.2 -.9 M59.5 47.5 l3.2 .4" stroke="' + gv + '" stroke-width="1" stroke-linecap="round"/>' +
         '<path d="M38.6 50 q3.4 1.8 6.8 0 M50.6 50 q3.4 1.8 6.8 0" fill="none" stroke="' + gv + '" stroke-width=".9" stroke-linecap="round" opacity=".8"/>' +
         '<path d="M48 47 q-2.4 5.8 .9 6.6" fill="none" stroke="' + gv + '" stroke-width="1.4" stroke-linecap="round"/>' +
         '<path d="M39.6 52 q-2 5.4 .4 9.6 M56.4 52 q2 5.4 -.4 9.6" fill="none" stroke="' + gv + '" stroke-width="1" stroke-linecap="round" opacity=".8"/>' +
         // misai uban
         '<path d="M48 55.4 Q43 52.6 38.6 56 Q43 59.4 48 57.4 Q53 59.4 57.4 56 Q53 52.6 48 55.4Z" fill="#E9E9EC" stroke="#C7C7CE" stroke-width=".8" stroke-linejoin="round"/>' +
         '<path d="M44 60.4 q4 2.2 8 0" fill="none" stroke="#7A3B2A" stroke-width="1.6" stroke-linecap="round"/>';
    // songkok hitam
    s += '<path d="M30 36.5 L32 20.5 Q32.5 15.5 39.5 15.5 L56.5 15.5 Q63.5 15.5 64 20.5 L66 36.5 Q48 31 30 36.5Z" fill="#15171D"/>' +
         '<path d="M32.6 22.5 Q48 18.5 63.4 22.5 L63.8 25.5 Q48 21.5 32.2 25.5Z" fill="#2B2F3A" opacity=".8"/>' +
         '<path d="M30.5 35.6 Q48 30.4 65.5 35.6" fill="none" stroke="#2B2F3A" stroke-width="1.2"/>';
    return s;
  }

  /* v13.41: set avatar khas PAS (maklum balas thread). Dibina daripada lukisan UMNO: songkok diganti kopiah/serban, warna pakaian diubah, janggut ditambah.
     PAS tiada Puteri: kod 'wanita' = Muslimat muda (asas Puteri), 'veteran_p' = Muslimat berusia (asas Wanita UMNO). */
  var SONGKOK = [/<path d="M30\.5 36 L32\.5 21[^>]*>/, /<path d="M33 23 Q48 19[^>]*>/, /<path d="M31 35 Q48 29\.8[^>]*>/,
                 /<path d="M30 36\.5 L32 20\.5[^>]*>/, /<path d="M32\.6 22\.5 Q48[^>]*>/, /<path d="M30\.5 35\.6 Q48[^>]*>/];
  var KOPIAH = '<path d="M31.5 36 Q31 21.5 48 20.5 Q65 21.5 64.5 36 Q48 31 31.5 36Z" fill="#FAFAF4" stroke="#D6D6CA" stroke-width="1.2"/>' +
               '<path d="M33 30 Q48 26 63 30 M34 25 Q48 21.8 62 25" fill="none" stroke="#E2E2D6" stroke-width="1" stroke-dasharray="1.2 1.8"/>';
  var SERBAN = '<path d="M27.5 38 Q24 17 48 14 Q72 17 68.5 38 Q48 30 27.5 38Z" fill="#FFFFFF" stroke="#D2D2C8" stroke-width="1.2"/>' +
               '<path d="M29 31 Q44 22 67 27 M28.5 25 Q45 17 64 21" fill="none" stroke="#DCDCD2" stroke-width="1.6" stroke-linecap="round"/>';
  function janggut(w) { return '<path d="M36 53 Q37 67 48 69 Q59 67 60 53 Q55 60.5 48 60.5 Q41 60.5 36 53Z" fill="' + w + '"/><path d="M42.5 55 q5.5 3 11 0" fill="none" stroke="#7A3B2A" stroke-width="1.6" stroke-linecap="round"/>'; }
  var GAYA_PAS = {
    pemuda:    { asas: 'pemuda', kepala: KOPIAH, warna: {} },
    biasa:     { asas: 'biasa', kepala: KOPIAH, janggut: '#2A1E16', warna: { '#1D3A6E': '#1F5A3A', '#11264B': '#143D27', '#2B4E8F': '#2C6E4A' } },
    veteran:   { asas: 'veteran', kepala: SERBAN, janggut: '#E6E6EA', warna: { '#B3122B': '#F1F1EA', '#C41E37': '#E2E2D8', '#7E0A1D': '#CFCFC4', '#C93249': '#D8D8CE' } },
    wanita:    { asas: 'puteri', warna: { '#E9729B': '#2E7D5B', '#C84F7E': '#1E5A40', '#F7A9C4': '#4FA27D', '#FDFCFA': '#2B2B30', '#F4E6EE': '#3A3A40', '#E4DCE2': '#1A1A1E', '#E9C9D9': '#45454C', '#EADDE6': '#45454C' } },
    veteran_p: { asas: 'veteran_p', warna: { '#E3E5EB': '#2E5E4E', '#A9AEBB': '#1E4236', '#B3122B': '#F1F1EA', '#7E0A1D': '#CFCFC4', '#C93249': '#D8D8CE' } }
  };
  function bahagianPAS(kod) {
    var g = GAYA_PAS[kod] || GAYA_PAS.pemuda, s = bahagian(g.asas, false);
    SONGKOK.forEach(function (r) { s = s.replace(r, ''); });
    Object.keys(g.warna).forEach(function (a) { s = s.split(a).join(g.warna[a]); });
    return s + (g.janggut ? janggut(g.janggut) : '') + (g.kepala || '');
  }
  /* v14.11: set avatar khas PKR (biru muda, merah, putih; berbilang kaum; semangat Reformasi).
     AMK (pemuda): kemeja-T biru muda berjalur merah; Wanita KEADILAN: tudung biru muda, baju biru tua; induk (biasa): kemeja biru muda, blazer biru tua, tali leher merah;
     veteran: batik biru, berkaca mata; veteran perempuan: tudung putih, baju kurung biru muda. */
  var BIRU = '#4BA8E6', BIRU_G = '#2A7DBA', BIRU_T = '#1C3F73', MERAH = '#D7262E';
  /** Lencana logo PKR ringkas (mata): bulatan biru muda, mata putih, anak mata merah. */
  function logoPKR(x, y, r) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (r / 10) + ')"><circle r="10" fill="' + BIRU + '" stroke="#fff" stroke-width="1.6"/>' +
      '<path d="M-7.5 0 Q0 -7 7.5 0 Q0 7 -7.5 0Z" fill="#fff"/><circle r="3.4" fill="' + MERAH + '"/><circle r="1.3" fill="' + BIRU_T + '"/>' +
      '<path d="M-6 5.6 Q0 9.4 6 5.6" fill="none" stroke="' + MERAH + '" stroke-width="1.4" stroke-linecap="round"/></g>';
  }
  function bahagianPKR(kod) {
    var s;
    if (kod === 'pemuda') {
      s = bahagianUmum('pemuda');
      s = s.replace('fill="#F4F6F8"/>', 'fill="' + BIRU + '"/>');                                         // kemeja-T biru muda
      s = s.replace(/<path d="M40 69 L48 80[^>]*>/, '<path d="M38 68.5 Q48 76 58 68.5" fill="none" stroke="' + MERAH + '" stroke-width="3"/><path d="M38 68.5 Q48 76 58 68.5" fill="none" stroke="#fff" stroke-width="1"/>');
      s = s.replace(/<path d="M48 74 L45\.5 96[^>]*>/, logoPKR(63, 83, 5.5));
      s += '<path d="M32 40 C30 20 60 18 65 34 C60 28 50 25 41 30 C37 32 34 36 32 40Z" fill="#15171D"/>';   // rambut moden belah tepi
      return s;
    }
    if (kod === 'wanita') {
      s = bahagian('puteri', false);
      var w = { '#E9729B': BIRU, '#C84F7E': BIRU_G, '#F7A9C4': '#8CCBF2', '#FDFCFA': BIRU_T, '#F4E6EE': '#24508E', '#E4DCE2': '#12305A', '#E9C9D9': '#3A68A8', '#EADDE6': '#3A68A8', '#E2B93B': MERAH, '#B8860B': '#9A1A20' };
      Object.keys(w).forEach(function (k) { s = s.split(k).join(w[k]); });
      return s + logoPKR(62, 86, 4.8);
    }
    if (kod === 'biasa') {
      s = bahagianUmum('biasa');
      s = s.split('fill="#F4F6F8"').join('fill="#BFE0F7"').split('#B8860B').join(MERAH).split('#2F3E5C').join(BIRU_T);
      return s + logoPKR(31, 80, 4.2);
    }
    if (kod === 'veteran') {
      s = bahagianUmum('veteran');
      s = s.split('#7B5B3A').join('#2C6FB0').split('#5A4128').join('#173E6B').split('#E2B93B').join(MERAH);
      s = s.replace('<path d="M6 96 C8 76 26 68 48 68 C70 68 88 76 90 96Z" fill="#2C6FB0"/>', '<path d="M6 96 C8 76 26 68 48 68 C70 68 88 76 90 96Z" fill="#2C6FB0"/><path d="M14 86 q6 -6 12 0 t12 0 M58 86 q6 -6 12 0 t12 0 M20 94 q6 -6 12 0 M64 94 q6 -6 12 0" fill="none" stroke="#8CCBF2" stroke-width="1.6" opacity=".8"/>');   // corak batik
      return s + logoPKR(64, 84, 4.6);
    }
    if (kod === 'wanita2') {                                                              // Wanita KEADILAN tanpa tudung: blaus biru muda, rambut paras bahu
      s = bahagianUmum('wanita');
      s = s.split('#1F7A6B').join(BIRU).split('#1E1A17').join('#2A1A12');
      s = s.replace('<path d="M38 69 Q48 80 58 69" fill="#fff" opacity=".9"/>', '<path d="M38 69 Q48 80 58 69" fill="#fff" opacity=".95"/><path d="M41 70 Q48 77 55 70" fill="none" stroke="' + MERAH + '" stroke-width="1.6"/>');
      return s + '<circle cx="34" cy="52" r="1.3" fill="#F2D27A"/><circle cx="62" cy="52" r="1.3" fill="#F2D27A"/>' + logoPKR(63, 84, 4.8);
    }
    if (kod === 'veteran_p') {
      s = bahagian('veteran_p', false);
      var v = { '#B3122B': BIRU, '#7E0A1D': BIRU_G, '#C93249': '#8CCBF2', '#E3E5EB': '#FAFAFA', '#A9AEBB': '#CFD6E0' };
      Object.keys(v).forEach(function (k) { s = s.split(k).join(v[k]); });
      return s.replace(/<g transform="translate\(33 76\)">[\s\S]*?<\/g>/, '') + logoPKR(33, 80, 4.4);
    }
    return bahagianUmum(kod);
  }
  var LATAR_PKR = { pemuda: { bg1: '#3FA9F5', bg2: '#0B4F8A' }, wanita: { bg1: '#E8344F', bg2: '#8A0F24' }, wanita2: { bg1: '#E8344F', bg2: '#8A0F24' }, biasa: { bg1: '#2F7FCC', bg2: '#0A2F5A' }, veteran: { bg1: '#8CC3EC', bg2: '#2B5D8A' }, veteran_p: { bg1: '#8CC3EC', bg2: '#2B5D8A' } };
  /* v14.12: set avatar khas DAP (merah, putih, biru tua; lencana roket). DAPSY (pemuda): polo merah berkolar putih;
     Wanita DAP: rambut paras bahu, blazer merah (pilihan kedua: tudung merah); induk: kemeja putih, tali leher merah;
     veteran: blazer biru tua, berkaca mata; veteran perempuan: rambut uban pendek, kardigan merah. */
  var DAP_M = '#D71920', DAP_MG = '#9E1016', DAP_B = '#1B2F6B';
  function logoDAP(x, y, r) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (r / 10) + ')"><circle r="10" fill="#fff" stroke="' + DAP_B + '" stroke-width="2"/>' +
      '<path d="M0 -7.5 Q3.4 -3.5 3 3.2 L-3 3.2 Q-3.4 -3.5 0 -7.5Z" fill="' + DAP_M + '"/><circle cy="-2.2" r="1.2" fill="#fff"/>' +
      '<path d="M-3 0.8 L-5.6 4.6 L-3 3.6Z M3 0.8 L5.6 4.6 L3 3.6Z" fill="' + DAP_M + '"/><path d="M-1.8 3.6 L0 7.4 L1.8 3.6Z" fill="' + DAP_B + '"/></g>';
  }
  function tukar(s, peta) { Object.keys(peta).forEach(function (k) { s = s.split(k).join(peta[k]); }); return s; }
  function bahagianDAP(kod) {
    var s, kulit = '#EBC39E';
    if (kod === 'pemuda') {
      s = tukar(bahagianUmum('pemuda'), { '#D9A97E': kulit });
      s = s.replace('fill="#F4F6F8"/>', 'fill="' + DAP_M + '"/>');
      s = s.replace(/<path d="M40 69 L48 80[^>]*>/, '<path d="M38 68 L48 78 L58 68 L54 67 L48 73 L42 67Z" fill="#fff"/><path d="M48 78 L48 88" stroke="' + DAP_MG + '" stroke-width="1.4"/><circle cx="48" cy="82" r="1" fill="#fff"/><circle cx="48" cy="86" r="1" fill="#fff"/>');
      s = s.replace(/<path d="M48 74 L45\.5 96[^>]*>/, logoDAP(63, 84, 5));
      return s + '<path d="M32 40 C30 21 62 18 65 36 C61 29 54 26 47 27 C41 28 35 33 32 40Z" fill="#15171D"/>';
    }
    if (kod === 'wanita') {                                                                // tanpa tudung: rambut paras bahu, blazer merah
      s = tukar(bahagianUmum('wanita'), { '#1F7A6B': DAP_M, '#E0B48E': kulit });
      s = s.replace(/<path d="M28 46 C26 22 70 22 68 46 C69 62 72 68 70 74 L26 74 C24 68 27 62 28 46Z"/, '<path d="M28 46 C26 22 70 22 68 46 C69 56 70 61 67 64 L29 64 C26 61 27 56 28 46Z"');
      s = s.replace('<path d="M38 69 Q48 80 58 69" fill="#fff" opacity=".9"/>', '<path d="M38 69 L48 84 L58 69 L53 68 L48 75 L43 68Z" fill="#fff"/><path d="M38 69 L44 90 M58 69 L52 90" stroke="' + DAP_MG + '" stroke-width="1.6"/>');
      return s + '<circle cx="34" cy="52" r="1.2" fill="#E8E8F0"/><circle cx="62" cy="52" r="1.2" fill="#E8E8F0"/>' + logoDAP(64, 84, 4.6);
    }
    if (kod === 'wanita2') {                                                               // bertudung merah
      s = tukar(bahagian('puteri', false), { '#E9729B': DAP_M, '#C84F7E': DAP_MG, '#F7A9C4': '#F06A6F', '#FDFCFA': '#FFFFFF', '#F4E6EE': '#F1F1F4', '#E9C9D9': '#D8D8E0', '#EADDE6': '#D8D8E0', '#E2B93B': DAP_B, '#B8860B': '#0E1C45' });
      return s + logoDAP(63, 86, 4.6);
    }
    if (kod === 'biasa') {
      s = tukar(bahagianUmum('biasa'), { '#D2A074': kulit, '#2F3E5C': '#F7F7F7', '#B8860B': DAP_M, '#1B2740': DAP_MG });
      s = s.replace('fill="#F4F6F8"/><path d="M48 76', 'fill="#E6E9EE"/><path d="M48 76');
      return s + logoDAP(32, 80, 4.2);
    }
    if (kod === 'veteran') {
      s = tukar(bahagianUmum('veteran'), { '#CDA27C': '#E3B994', '#7B5B3A': DAP_B, '#5A4128': '#0E1C45', '#E2B93B': '#C9CED8' });
      s = s.replace('<path d="M38 69 Q48 76 58 69" fill="none" stroke="#0E1C45" stroke-width="2"/>', '<path d="M39 69 L48 82 L57 69 L53 68 L48 74 L43 68Z" fill="#fff"/><path d="M48 76 L46 96 L50 96Z" fill="' + DAP_M + '"/>');
      return s + logoDAP(64, 84, 4.4);
    }
    if (kod === 'veteran_p') {
      s = tukar(bahagianUmum('veteran_p'), { '#D4AA86': '#E6BD98', '#5C4A7A': DAP_M });
      s = s.replace(/<path d="M28 46 C26 22 70 22 68 46 C69 62 72 68 70 74 L26 74 C24 68 27 62 28 46Z"/, '<path d="M28 46 C26 22 70 22 68 46 C69 52 69 56 66 58 L30 58 C27 56 27 52 28 46Z"');
      return s + '<circle cx="42" cy="45" r="5.4" fill="none" stroke="#5B4636" stroke-width="1.1"/><circle cx="54" cy="45" r="5.4" fill="none" stroke="#5B4636" stroke-width="1.1"/><path d="M47.4 44.6 h1.2" stroke="#5B4636" stroke-width="1.1"/>' +
        '<path d="M38 69 Q48 78 58 69" fill="none" stroke="#fff" stroke-width="2.4"/>' + logoDAP(64, 84, 4.4);
    }
    return bahagianUmum(kod);
  }
  /* v14.13: set avatar khas AMANAH (oren, putih; lencana AMANAH). Pemuda AMANAH: baju Melayu oren, songkok;
     AWAN (Wanita): tudung oren, baju kurung putih (AWAN sentiasa bertudung; tiada pilihan kedua); induk: baju Melayu putih, samping oren, songkok;
     veteran: baju Melayu krim, songkok, janggut pendek uban, berkaca mata; veteran perempuan: tudung oren lembut, baju kurung putih. */
  var AMN = '#F28C28', AMN_G = '#C1601A', AMN_C = '#FFC07A';
  function logoAMANAH(x, y, r) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (r / 10) + ')"><circle r="10" fill="' + AMN + '" stroke="#fff" stroke-width="1.6"/>' +
      '<path d="M-6.5 5 L0 -6.5 L6.5 5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<path d="M-3.6 1.4 L3.6 1.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cy="-8.2" r="1" fill="#fff"/></g>';
  }
  function bahagianAMANAH(kod) {
    var s;
    if (kod === 'pemuda') {
      s = tukar(bahagian('pemuda', false), { '#F7F7F3': AMN, '#D9D9D0': AMN_G, '#DADAD0': AMN_G });
      s = s.replace('fill="#FFFFFF" stroke="' + AMN_G + '"', 'fill="' + AMN_C + '" stroke="' + AMN_G + '"');
      return s + logoAMANAH(64, 84, 5);
    }
    if (kod === 'wanita') {                                                               // AWAN: wanita berusia, tudung oren tua, baju kurung putih
      s = tukar(bahagian('wanita', false), { '#C8102E': AMN_G, '#8E0B22': '#8A420F', '#E8344F': AMN });
      return s.replace(/<g transform="translate\(33 76\)">[\s\S]*?<\/g>/, '') + logoAMANAH(63, 86, 4.6);
    }
    if (kod === 'puteri') {                                                               // WARDA: wanita muda, tudung oren cerah, kebaya putih
      s = tukar(bahagian('puteri', false), { '#E9729B': '#FFA54F', '#C84F7E': '#E07B22', '#F7A9C4': '#FFD3A1', '#F4E6EE': '#FFF1E2', '#E9C9D9': '#F6C99A', '#EADDE6': '#F6C99A', '#E2B93B': '#FFFFFF', '#B8860B': AMN_G });
      return s + logoAMANAH(63, 86, 4.6);
    }
    if (kod === 'biasa') {
      s = tukar(bahagian('biasa', false), { '#1D3A6E': '#F7F5EF', '#11264B': '#D9D4C6', '#2B4E8F': '#FFFFFF', '#3B5FA3': '#E6E0D2' });
      s += '<path d="M10 92 Q48 82 86 92 L90 96 L6 96Z" fill="' + AMN + '"/><path d="M10 92 Q48 82 86 92" fill="none" stroke="' + AMN_G + '" stroke-width="1.4"/>';   // samping oren
      return s + logoAMANAH(31, 80, 4.2);
    }
    if (kod === 'veteran') {
      s = tukar(bahagian('veteran', false), { '#B3122B': '#F2E6CF', '#7E0A1D': '#C9B99A', '#C41E37': '#E8D8B8', '#C93249': '#DCCBA8' });
      s += '<path d="M36 53 Q37 65 48 67 Q59 65 60 53 Q55 60 48 60 Q41 60 36 53Z" fill="#E6E6EA"/><path d="M44 60.4 q4 2.2 8 0" fill="none" stroke="#7A3B2A" stroke-width="1.6" stroke-linecap="round"/>';
      s += '<circle cx="42" cy="46" r="5.6" fill="none" stroke="#3A3A44" stroke-width="1.1"/><circle cx="54" cy="46" r="5.6" fill="none" stroke="#3A3A44" stroke-width="1.1"/><path d="M47.6 45.6 h.8" stroke="#3A3A44" stroke-width="1.1"/>';
      return s + logoAMANAH(64, 84, 4.6);
    }
    if (kod === 'veteran_p') {
      s = tukar(bahagian('veteran_p', false), { '#E3E5EB': AMN_C, '#A9AEBB': '#E0A060', '#B3122B': '#FBF8F2', '#7E0A1D': '#D9D2C2', '#C93249': '#E8E1D2' });
      return s.replace(/<g transform="translate\(33 76\)">[\s\S]*?<\/g>/, '') + logoAMANAH(33, 80, 4.4);
    }
    return bahagianUmum(kod);
  }
  var LATAR_AMANAH = { pemuda: { bg1: '#2F3A4A', bg2: '#11161F' }, wanita: { bg1: '#2E8B6E', bg2: '#0E3B2E' }, puteri: { bg1: '#5B6BC0', bg2: '#232A63' }, biasa: { bg1: '#F6A24E', bg2: '#B4520F' }, veteran: { bg1: '#F6A24E', bg2: '#B4520F' }, veteran_p: { bg1: '#2E8B6E', bg2: '#0E3B2E' } };
  var LATAR_DAP = { pemuda: { bg1: '#F2F2F2', bg2: '#9FA9C8' }, wanita: { bg1: '#3B5BB5', bg2: '#122458' }, wanita2: { bg1: '#3B5BB5', bg2: '#122458' }, biasa: { bg1: '#E8343A', bg2: '#7A0A10' }, veteran: { bg1: '#C9CED8', bg2: '#5B6378' }, veteran_p: { bg1: '#C9CED8', bg2: '#5B6378' } };
  function partiOpts(opts) {
    var k = opts && opts.parti; if (!k) { try { var P = (typeof globalThis !== 'undefined' ? globalThis : {}).MyPolitikParti; k = P && P.kini ? P.kini() : 'UMNO'; } catch (e) { k = 'UMNO'; } }
    return k || 'UMNO';
  }

  function bukanUMNO(opts) {
    var k = opts && opts.parti; if (!k) { try { var P = (typeof globalThis !== 'undefined' ? globalThis : {}).MyPolitikParti; k = P && P.kini ? P.kini() : 'UMNO'; } catch (e) { k = 'UMNO'; } }
    return !!k && k !== 'UMNO';
  }
  function svg(kod, opts) {
    opts = opts || {};
    if (kod === 'puteri' && bukanUMNO(opts) && partiOpts(opts) !== 'AMANAH') { kod = 'wanita'; }   // v14.14: AMANAH ada WARDA
    if (kod === 'wanita2' && ['PKR', 'DAP'].indexOf(partiOpts(opts)) < 0) { kod = 'wanita'; }                // v14.11: hanya PKR
    var pk = partiOpts(opts), c = (pk === 'PKR' ? LATAR_PKR[kod] : pk === 'DAP' ? LATAR_DAP[kod] : pk === 'AMANAH' ? LATAR_AMANAH[kod] : LATAR[kod]) || LATAR.pemuda, id = 'mpa' + (++seq), saiz = opts.saiz || 96;
    var lbl = opts.label || (kod === 'wanita2' ? 'Wanita' : (LIST.filter(function (a) { return a.kod === kod; })[0] || LIST[0]).label);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="' + saiz + '" height="' + saiz + '" role="img" aria-label="Avatar ' + lbl + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c.bg1 + '"/><stop offset="1" stop-color="' + c.bg2 + '"/></linearGradient>' +
      '<clipPath id="' + id + 'c"><circle cx="48" cy="48" r="48"/></clipPath></defs>' +
      '<circle cx="48" cy="48" r="48" fill="url(#' + id + ')"/>' +
      '<g clip-path="url(#' + id + 'c)">' + (partiOpts(opts) === 'PAS' ? bahagianPAS(kod) : partiOpts(opts) === 'PKR' ? bahagianPKR(kod) : partiOpts(opts) === 'DAP' ? bahagianDAP(kod) : partiOpts(opts) === 'AMANAH' ? bahagianAMANAH(kod) : bahagian(kod, bukanUMNO(opts))) + '</g></svg>';
  }
  var PENERANGAN_UMUM = { pemuda: 'Lelaki muda, kemeja putih dan tali leher', wanita: 'Perempuan, blaus dan rambut panjang', biasa: 'Lelaki pertengahan umur, blazer biru tua', veteran: 'Lelaki berusia, berkaca mata, baju batik coklat' };
  var PENERANGAN_PKR = { pemuda: 'AMK: lelaki muda, kemeja-T biru muda berjalur merah, lencana PKR', wanita: 'Wanita KEADILAN: tudung biru muda, baju biru tua', wanita2: 'Wanita KEADILAN: blaus biru muda, rambut paras bahu (tanpa tudung)', biasa: 'Lelaki pertengahan umur, kemeja biru muda, blazer biru tua, tali leher merah', veteran: 'Lelaki berusia, batik biru, berkaca mata' };   // v14.11
  var PENERANGAN_DAP = { pemuda: 'DAPSY: lelaki muda, polo merah berkolar putih, lencana roket', wanita: 'Wanita DAP: rambut paras bahu, blazer merah, kemeja putih', wanita2: 'Wanita DAP: tudung merah, kebaya putih (bertudung)', biasa: 'Lelaki pertengahan umur, kemeja putih, tali leher merah', veteran: 'Lelaki berusia, blazer biru tua, tali leher merah, berkaca mata' };   // v14.12
  var PENERANGAN_AMANAH = { pemuda: 'Pemuda AMANAH: lelaki muda, baju Melayu oren, songkok hitam', puteri: 'WARDA: wanita muda, tudung oren cerah, kebaya putih', wanita: 'AWAN: tudung oren tua, baju kurung putih', biasa: 'Lelaki pertengahan umur, baju Melayu putih, samping oren, songkok hitam', veteran: 'Lelaki berusia, baju Melayu krim, songkok, janggut pendek uban, berkaca mata' };   // v14.13
  var PENERANGAN_PAS = { pemuda: 'Lelaki muda, baju Melayu putih, kopiah putih', wanita: 'Perempuan, jubah hitam, tudung labuh hijau', biasa: 'Lelaki pertengahan umur, jubah hijau tua, kopiah putih, berjanggut', veteran: 'Lelaki berusia, jubah putih, serban putih, janggut beruban' };
  /** v10.5: senarai watak mengikut parti. Parti selain UMNO tiada Puteri dan guna penerangan umum (PAS: set khas, v13.41). */
  function senarai(parti) {
    if (!parti || parti === 'UMNO') { return LIST; }
    var P = parti === 'PAS' ? PENERANGAN_PAS : parti === 'PKR' ? PENERANGAN_PKR : parti === 'DAP' ? PENERANGAN_DAP : parti === 'AMANAH' ? PENERANGAN_AMANAH : PENERANGAN_UMUM;
    var out = LIST.filter(function (a) { return a.kod !== 'puteri' || parti === 'AMANAH'; }).map(function (a) { return { kod: a.kod, label: a.label, penerangan: P[a.kod] || a.penerangan }; });   // v14.14: AMANAH ada WARDA (wanita muda)
    if (parti === 'PKR' || parti === 'DAP') { var iw = out.map(function (a) { return a.kod; }).indexOf('wanita'); out.splice(iw + 1, 0, { kod: 'wanita2', label: 'Wanita', penerangan: P.wanita2 }); }   // v14.11: pilihan Wanita tanpa tudung
    return out;
  }
  function adaKod(kod) { return kod === 'wanita2' || LIST.some(function (a) { return a.kod === kod; }); }
  function pasang(el, kod, opts) {
    if (!el) { return; }
    if (kod === 'veteran' && opts && opts.jantina === 'Perempuan') { el.innerHTML = svg('veteran_p', Object.assign({ label: 'Veteran' }, opts)); return; }   // v7.50: Veteran perempuan
    el.innerHTML = svg(adaKod(kod) ? kod : 'pemuda', opts);
  }
  function cadangan(demografik, parti) { var k = demografik && demografik.kod ? demografik.kod : demografik; if (k === 'puteri' && parti && parti !== 'UMNO' && parti !== 'AMANAH') { k = 'wanita'; } return adaKod(k) ? k : 'pemuda'; }
  return { LIST: LIST, senarai: senarai, svg: svg, pasang: pasang, cadangan: cadangan, adaKod: adaKod };
});
