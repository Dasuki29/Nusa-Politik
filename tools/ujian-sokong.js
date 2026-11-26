/* Nusa Politik — tools/ujian-sokong.js (v14.8): ujian pelayar Sokong Calon Pertandingan Lain (kad tab Pemilihan, sokong, EN). Guna: node tools/ujian-sokong.js [folder-tangkapan] [BM|EN] */
const fs = require('fs'), path = require('path'), http = require('http'); const PW = require('playwright'); const P = require('./persekitaran');
const ROOT = path.join(__dirname, '..'); const g = P.muat(); P.daftar({ nama: 'Amir Hakim', jantina: 'L', umur: 55, sayap: 'utama' });
P.tetap({ ap: 10, myr: 50000, ip: 300, tahun: 2026, bulan: 3, reputasi: 60 });
const BEKAL = {}; g.localStorage._peta.forEach((v, k) => { BEKAL[k] = v; }); BEKAL.nusaLang = process.argv[3] || 'BM';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port; const br = await PW.chromium.launch(); const out = process.argv[2] || null; const gagal = [];
  const EN = process.argv[3] === 'EN', RE = /(Pertandingan Lain|Lihat calon|Sokong seorang|Sokongan tahun ini|Penyandang|Pencabar|Pesaing utama|anggaran peluang|Keputusan diumumkan|Disokong|\bcalon\b)/;
  for (const [w, n] of [[1280, 'd'], [420, 'm']]) {
    const pg = await br.newPage({ viewport: { width: w, height: 900 } }); const er = []; pg.on('pageerror', (e) => er.push(e.message));
    await pg.route('**/*', (rt) => rt.request().url().startsWith(base) ? rt.continue() : rt.abort());
    await pg.addInitScript((d) => { if (sessionStorage.getItem('__bekal')) { return; } sessionStorage.setItem('__bekal', '1'); Object.keys(d).forEach((k) => localStorage.setItem(k, d[k])); }, BEKAL);
    await pg.goto(base + '/dashboard.html'); await pg.waitForSelector('#kandungan:not([hidden])');
    await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) {} }); await pg.addStyleTag({ content: '.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}' });
    for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
    await pg.evaluate(() => NusaUI.gotoTab('pemilihan')); await pg.waitForTimeout(500);
    await pg.evaluate(() => { const d = document.querySelector('.sk-kad'); const det = d && d.closest('details'); if (det) { det.open = true; } });
    const k = await pg.$('.sk-kad'); if (!k) { gagal.push(n + ': kad Pertandingan Lain tiada'); continue; }
    if (EN) { const t = await k.innerText(); if (RE.test(t)) { gagal.push(n + ': BM bocor: ' + t.slice(0, 400)); } }
    await pg.evaluate(() => document.querySelector('[data-sk]:not([disabled])').click()); await pg.waitForTimeout(500);
    const st = await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); return { bil: p.sokong && p.sokong.bil, ap: p.ap, kad: !!document.querySelector('.sk-tag') }; });
    if (st.bil !== 1 || !st.kad) { gagal.push(n + ': sokongan tidak direkod ' + JSON.stringify(st)); }
    if (EN) { const t = await (await pg.$('.sk-kad')).innerText(); if (RE.test(t)) { gagal.push(n + ': BM bocor (selepas): ' + t.slice(0, 400)); } }
    if (out) { await (await pg.$('.sk-kad')).screenshot({ path: out + '/sokong-' + n + '.png' }); }
    if (er.length) { gagal.push(n + ': ralat ' + er.join(' | ')); }
  }
  await br.close(); srv.close();
  if (gagal.length) { console.log('GAGAL:\n - ' + gagal.join('\n - ')); process.exit(1); } else { console.log('Ujian Sokong Calon lulus.'); }
})();
