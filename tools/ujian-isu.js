/* Nusa Politik — tools/ujian-isu.js (v12.2): ujian pelayar Isu Semasa dan Sidang Media (4 pilihan, soalan ikut konteks). Guna: node tools/ujian-isu.js [folder-tangkapan] [BM|EN] */
const fs = require('fs'), path = require('path'), http = require('http'); const PW = require('playwright'); const P = require('./persekitaran');
const ROOT = path.join(__dirname, '..'); const g = P.muat(); P.daftar({ nama: 'Amir Hakim', jantina: 'L', umur: 40, sayap: 'utama' });
g.MyPolitikKabinet.lantikKanan('TIMBALAN_PM'); P.tetap({ jawatan: 'Ketua Bahagian', tahun: 2030, bulan: 3 }); g.MyPolitikIsu.prosesBulan({ rng: () => 0 });
const BEKAL = {}; g.localStorage._peta.forEach((v, k) => { BEKAL[k] = v; }); BEKAL.nusaLang = process.argv[3] || 'BM';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port; const br = await PW.chromium.launch(); const out = process.argv[2] || null; const gagal = [];
  for (const [w, n] of [[1280, 'd'], [420, 'm']]) {
    const pg = await br.newPage({ viewport: { width: w, height: 900 } }); const er = []; pg.on('pageerror', (e) => er.push(e.message));
    await pg.route('**/*', (rt) => rt.request().url().startsWith(base) ? rt.continue() : rt.abort());
    await pg.addInitScript((d) => { Object.keys(d).forEach((k) => localStorage.setItem(k, d[k])); }, BEKAL);
    await pg.goto(base + '/dashboard.html'); await pg.waitForSelector('#kandungan:not([hidden])');
    await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) {} }); await pg.addStyleTag({ content: '.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}' });
    for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
    await pg.evaluate(() => NusaUI.gotoTab('tindakan')); await pg.waitForTimeout(600);
    const k = await pg.$('.isu-kad'); if (!k) { gagal.push(n + ': kad Isu Semasa tiada'); }
    if (k && out) { await k.screenshot({ path: out + '/isu-' + n + '.png' }); }
    if (n === 'd' && k) {
      await pg.click('.isu-kad [data-isu="kritik"]'); await pg.waitForTimeout(600);
      if (await pg.$('.isu-kad')) { gagal.push('kad isu tidak hilang selepas dijawab'); }
      await pg.evaluate(() => { MyPolitikMedia.setRng(() => 0.3); const r = MyPolitikMedia.mulaSidang({}); MyPolitikMedia.setRng(null); NusaUI.render(); window.__ms = r; }); await pg.waitForTimeout(400);
      if (!(await pg.$('[data-media="sidang"]'))) { gagal.push('butang sidang media tiada'); } else { await pg.$eval('[data-media="sidang"]', (b) => b.click()); } await pg.waitForTimeout(600);
      const op = await pg.$$eval('#modal-isi [data-pilih]', (l) => l.map((x) => x.getAttribute('data-pilih')));
      if (op.join() !== 'berfakta,populis,diam,serang') { gagal.push('pilihan sidang: ' + op.join()); }
      if (out) { const mb = await pg.$('#modal .modal'); if (mb) { await mb.screenshot({ path: out + '/sidang-' + n + '.png', timeout: 5000 }).catch(() => {}); } }
      const tx = await pg.textContent('#modal-isi'); if (/\{\w+\}/.test(tx)) { gagal.push('pemegang tempat dalam soalan: ' + tx.slice(0, 120)); } if (BEKAL.nusaLang === 'EN' && /\b(anda|yang|untuk|adakah)\b/i.test(tx)) { gagal.push('BM bocor dalam EN: ' + tx.slice(0, 160)); }
    }
    if (er.length) { gagal.push(n + ': ralat ' + er.join(' | ')); }
  }
  await br.close(); srv.close();
  if (gagal.length) { console.log('GAGAL:\n - ' + gagal.join('\n - ')); process.exit(1); } else { console.log('Ujian Isu Semasa & Sidang Media lulus.'); }
})();
