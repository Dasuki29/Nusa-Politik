/* v10.5: ujian halaman indeks neutral (logo Nusa Politik, pilihan parti, avatar/sayap ikut parti). Jalankan: node tools/ujian-indeks.js */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..'), MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.csv': 'text/csv', '.png': 'image/png' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' }); r.end(fs.readFileSync(f)); });
let gagal = 0; const betul = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) { gagal++; } };
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1200, height: 900 } });
  await pg.goto(base + '/index.html'); await pg.waitForTimeout(1500);
  const txt = () => pg.evaluate(() => document.body.innerText);
  let t = await txt();
  betul(!/PAU di|WTC KL/.test(t), 'chip PAU/WTC KL dibuang');
  betul(!/Lagu Rasmi/.test(t), 'kad Lagu Rasmi dibuang dari indeks');
  betul(await pg.evaluate(() => document.querySelector('.brand').innerText.trim()) === 'Nusa Politik', 'jenama pengepala = Nusa Politik sahaja');
  betul(await pg.evaluate(() => [].every.call(document.querySelectorAll('img[data-netral]'), (i) => /logo-nusa\.svg$/.test(i.getAttribute('src')))), 'logo neutral Nusa Politik');
  betul(await pg.evaluate(() => document.querySelectorAll('#s-parti option').length) === 7, 'pilihan parti 7 pilihan dalam Maklumat anda');
  betul(await pg.evaluate(() => !!document.querySelector('fieldset.form-section #s-parti')) && await pg.evaluate(() => document.querySelector('#s-parti').closest('fieldset').innerText.toLowerCase().indexOf('maklumat anda') >= 0), 's-parti di dalam Maklumat anda');
  betul(/mana-mana parti politik/.test(t) && !/cawangan rasmi UMNO/.test(t), 'nota cawangan neutral');
  betul(await pg.evaluate(() => !!document.querySelector('#avatar-grid [data-kod=puteri]')), 'UMNO: Puteri ada (avatar)');
  betul(await pg.evaluate(() => getComputedStyle(document.querySelector('#sayap-grid [data-kod=puteri]')).display !== 'none'), 'UMNO: Puteri ada (sayap)');
  betul(await pg.evaluate(() => /Menjadi ahli UMNO sejak/.test(document.getElementById('l-ahli').innerText) && !document.getElementById('h-ahli').hidden), 'UMNO: label ahli UMNO + nota Fasal 15.5');
  for (const P of ['PBB', 'PRS', 'SUPP', 'PDP']) {
    await pg.selectOption('#s-parti', P); await pg.waitForTimeout(2200);
    const r = await pg.evaluate((P) => ({
      lbl: document.getElementById('l-ahli').innerText, hint: document.getElementById('h-ahli').hidden,
      blok: !document.getElementById('f-blok').hidden, avPut: !!document.querySelector('#avatar-grid [data-kod=puteri]'),
      syPut: getComputedStyle(document.querySelector('#sayap-grid [data-kod=puteri]')).display !== 'none',
      neg: [].map.call(document.querySelectorAll('#s-negeri option'), (o) => o.textContent).join('|'), st: document.getElementById('status-text').innerText,
      logo: document.querySelector('.brand__img').getAttribute('src') }), P);
    betul(r.lbl === 'Menjadi ahli ' + P + ' sejak', P + ': label "' + r.lbl + '"');
    betul(r.hint, P + ': nota Fasal 15.5 disembunyi');
    betul(r.blok === (P === 'PBB'), P + ': sayap dalaman hanya PBB');
    betul(!r.avPut && !r.syPut, P + ': Puteri tiada (avatar & sayap)');
    betul(/Sarawak/i.test(r.neg) && r.neg.split('|').filter((x) => !/Pilih/.test(x)).length === 1 && !/Google Sheets/.test(r.st), P + ': negeri Sarawak sahaja, status bukan Google Sheets (' + r.neg + ')');
    betul(/logo-nusa\.svg$/.test(r.logo), P + ': logo pengepala kekal neutral');
  }
  await pg.selectOption('#s-parti', 'UMNO'); await pg.waitForTimeout(2500);
  betul(await pg.evaluate(() => !!document.querySelector('#avatar-grid [data-kod=puteri]') && document.getElementById('l-ahli').innerText === 'Menjadi ahli UMNO sejak'), 'tukar semula UMNO: Puteri & label pulih');
  await pg.screenshot({ path: process.env.SS || '/tmp/indeks.png', fullPage: false });
  await b.close(); srv.close(); console.log(gagal ? gagal + ' gagal' : 'semua lulus'); process.exit(gagal ? 1 : 0);
})();
