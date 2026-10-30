/* Nusa Politik service worker.
   v7.25: network-first supaya sentiasa dapat versi terkini; cache hanya sebagai sandaran luar talian.
   v8.0 : kerangka aplikasi (halaman, CSS, JS, ikon dan data peta utama) dicache semasa pemasangan supaya
          permainan boleh dibuka luar talian sejak lawatan pertama. Satu fail yang gagal dimuat tidak lagi
          menggagalkan pemasangan. Fail data besar lain (data/dun.json, data/dm-*.json) dicache selepas dimuat.
   Tukar VERSI apabila senarai ASAS berubah supaya cache lama dibuang. */
var VERSI = 'nusa-v13.9';
var ASAS = [
  'index.html', 'dashboard.html', '404.html', 'manifest.webmanifest',
  'css/style.css', 'css/responsive.css', 'css/tema.css', 'css/tema-index.css', 'css/rival.css', 'css/map.css', 'css/paparan.css',
  'js/tema.js', 'js/pwa.js', 'js/data.js', 'js/sayap.js', 'js/blok.js', 'js/misi.js', 'js/save.js', 'js/infra.js', 'js/calendar.js',
  'js/avatar.js', 'js/audio.js', 'js/sfx.js', 'js/krisis-peta.js', 'js/kerjaya.js', 'js/undo.js', 'js/harta.js', 'js/harta-ui.js', 'js/ordinaryMember.js', 'js/incumbent.js', 'js/jawatan.js', 'js/etika.js', 'js/election.js',
  'js/rival.js', 'js/negeri.js', 'js/meeting.js', 'js/EventDatabase.js', 'js/events.js', 'js/geo.js', 'js/map.js', 'js/slot.js',
  'js/slotpanel.js', 'js/menu.js', 'js/latihan.js', 'js/tutorial.js', 'js/lagu.js', 'js/watak.js', 'js/perlembagaan.js',
  'js/organisasi.js', 'js/stress.js', 'js/hayat.js', 'js/polling.js', 'js/warroom.js', 'js/pru.js', 'js/kabinet-data.js', 'js/kabinet.js', 'js/prk.js',
  'js/ElectionEngine.js', 'js/CabinetEngine.js', 'js/WingEngine.js', 'js/pru-ui.js', 'js/jemaah.js', 'js/jemaah-ui.js', 'js/isu.js', 'js/isu-ui.js', 'js/dewan.js', 'js/dun.js', 'js/dewan-ui.js', 'js/pencapaian.js', 'js/pencapaian-ui.js',
  'js/paparan.js', 'js/app.js',
  'js/i18n.js', 'js/translations.js', 'js/translations-acara.js', 'js/translations-data.js', 'js/translations-ui.js', 'js/translations-baharu.js', 'js/translations-perlembagaan.js', 'js/translations-pindah.js', 'js/tutorial-en.js', 'js/integriti.js', 'js/integriti-ui.js', 'js/media.js', 'js/media-ui.js', 'js/tular.js', 'js/tular-ui.js', 'js/mca-data.js', 'js/mca.js', 'js/mca-ui.js', 'js/mic-data.js', 'js/mic.js', 'js/mic-ui.js', 'js/ppp-data.js', 'js/ppp.js', 'js/ppp-ui.js', 'js/sabah.js', 'js/pbrs-data.js', 'js/pbrs.js', 'js/pbrs-ui.js', 'js/umno-data.js', 'js/umno.js', 'js/umno-ui.js', 'js/maklumbalas.js', 'js/sampingan.js', 'js/gelaran.js', 'js/sampingan-ui.js', 'js/kawasan.js', 'js/kawasan-ui.js', 'js/glc.js', 'js/glc-ui.js', 'js/komuniti.js', 'js/komuniti-ui.js',
  'js/parti.js', 'js/sarawak.js', 'js/translations-parti.js',
  'js/pindah.js',
  'js/pindah-ui.js',
  'assets/images/favicon.svg', 'assets/images/favicon-32.png', 'assets/images/favicon-192.png', 'assets/images/apple-touch-icon.png',
  'assets/images/icon-512.png', 'assets/images/icon-maskable-512.png', 'assets/images/logo.png', 'assets/images/logo-nusa.svg', 'assets/images/logo-pbb.png', 'assets/images/logo-bn.png', 'assets/images/logo-ppp.jpg', 'assets/images/logo-pbrs.jpg', 'assets/images/logo-gps.png', 'assets/images/logo-prs.jpg', 'assets/images/logo-supp.svg', 'assets/images/logo-pdp.jpg', 'assets/images/logo-psb.png', 'assets/images/logo-mca.jpg', 'assets/images/logo-mic.png', 'assets/images/logo-placeholder.svg',
  'assets/images/menara-dato-onn.jpg', 'assets/images/menara-dato-onn.svg', 'assets/fonts/anton.woff', 'assets/fonts/plus-jakarta-sans.woff',
  'data/meta.json', 'data/negeri.json', 'data/parlimen.json', 'js/data-sarawak.js', 'js/fetch-lokal.js', 'data/pbb-sarawak.csv', 'data/prs-sarawak.csv', 'data/supp-sarawak.csv', 'data/pdp-sarawak.csv', 'data/psb-sarawak.csv', 'data/mca-semenanjung.csv', 'data/mic-semenanjung.csv', 'data/pbb-dun.json'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSI).then(function (c) {
    return Promise.all(ASAS.map(function (u) {
      return c.add(new Request(u, { cache: 'reload' })).catch(function () { /* fail tiada atau rangkaian gagal: abaikan */ });
    }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSI; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin) { return; }       // abaikan Sheets, analitik dan fon luar
  e.respondWith(fetch(r).then(function (res) {
    if (res && res.ok && res.type === 'basic') { var salin = res.clone(); caches.open(VERSI).then(function (c) { c.put(r, salin); }); }
    return res;
  }).catch(function () {
    return caches.match(r, { ignoreSearch: r.mode === 'navigate' }).then(function (m) {
      return m || (r.mode === 'navigate' ? caches.match('index.html') : Response.error());
    });
  }));
});
