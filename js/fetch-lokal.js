/* ==========================================================================
   Nusa Politik — js/fetch-lokal.js (v10.6)
   Apabila permainan dibuka terus dari folder (file://), pelayar menyekat fetch() ke fail data/*.json dan data/*.csv
   ("Failed to fetch"). Shim ini memuatkan fail data/js/<nama>.js (dijana oleh tools/bina-data-lokal.js; <script> dibenarkan
   pada file://) dan memulangkan Response biasa. Di pelayan web (http/https) shim ini tidak berbuat apa-apa.
   ========================================================================== */
(function () {
  'use strict';
  if (typeof window === 'undefined' || window.location.protocol !== 'file:' || typeof window.fetch !== 'function' || window.fetch.__lokal) { return; }
  var asal = window.fetch.bind(window), simpan = (window.__NP_FAIL = window.__NP_FAIL || {}), janji = {};
  function kunci(url) {
    var u = typeof url === 'string' ? url : (url && url.url) || '';
    var m = /^(?:\.\/)?(data\/[A-Za-z0-9_.\-]+\.(?:json|csv))(?:[?#].*)?$/.exec(u);
    return m ? m[1] : null;
  }
  function muat(k) {
    if (simpan[k] !== undefined) { return Promise.resolve(simpan[k]); }
    if (!janji[k]) {
      janji[k] = new Promise(function (ok, gagal) {
        var s = document.createElement('script'); s.src = k.replace(/^data\//, 'data/js/') + '.js';
        s.onload = function () { if (simpan[k] !== undefined) { ok(simpan[k]); } else { gagal(new Error('Failed to fetch ' + k)); } };
        s.onerror = function () { delete janji[k]; gagal(new Error('Failed to fetch ' + k + ' (fail data/js tiada)')); };
        document.head.appendChild(s);
      });
    }
    return janji[k];
  }
  var fn = function (url, opts) {
    var k = kunci(url); if (!k) { return asal(url, opts); }
    return muat(k).then(function (teks) {
      return new Response(teks, { status: 200, headers: { 'Content-Type': /\.json$/.test(k) ? 'application/json' : 'text/csv' } });
    });
  };
  fn.__lokal = true; window.fetch = fn;
})();
