/* Nusa Politik — tools/ujian-tyt.js (v13.52): ujian pelayar Yang di-Pertua Negeri (tawaran di Profil, tab Istana, tugas, EN). Guna: node tools/ujian-tyt.js [folder-tangkapan] [BM|EN] */
const fs = require('fs'), path = require('path'), http = require('http'); const PW = require('playwright'); const P = require('./persekitaran');
const ROOT = path.join(__dirname, '..'); const g = P.muat(); P.daftar({ nama: 'Amir Hakim', jantina: 'L', umur: 50, sayap: 'utama' });
P.tetap({ ap: 10, myr: 50000, tahun: 2031, bulan: 2, reputasi: 70, negeri: 'Sarawak', tyt: { bekas: { sarawak: { dari: 2027, hingga: 2030 } }, tawaran: { negeri: 'sarawak', tahun: 2031 } } });
const BEKAL = {}; g.localStorage._peta.forEach((v, k) => { BEKAL[k] = v; }); BEKAL.nusaLang = process.argv[3] || 'BM';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port; const br = await PW.chromium.launch(); const out = process.argv[2] || null; const gagal = [];
  for (const [w, n] of [[1280, 'd'], [420, 'm']]) {
    const pg = await br.newPage({ viewport: { width: w, height: 900 } }); const er = []; pg.on('pageerror', (e) => er.push(e.message));
    await pg.route('**/*', (rt) => rt.request().url().startsWith(base) ? rt.continue() : rt.abort());
    await pg.addInitScript((d) => { if (sessionStorage.getItem('__bekal')) { return; } sessionStorage.setItem('__bekal', '1'); Object.keys(d).forEach((k) => localStorage.setItem(k, d[k])); }, BEKAL);
    await pg.goto(base + '/dashboard.html'); await pg.waitForSelector('#kandungan:not([hidden])');
    await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) {} }); await pg.addStyleTag({ content: '.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}' });
    for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
    await pg.evaluate(() => NusaUI.gotoTab('profil')); await pg.waitForTimeout(500);
    await pg.evaluate(() => { const d = document.querySelector('.tyt-kad'); const det = d && d.closest('details'); if (det) { det.open = true; } });
    const k = await pg.$('.tyt-kad'); if (!k) { gagal.push(n + ': kad tawaran TYT tiada'); continue; }
    const EN = process.argv[3] === 'EN', RE = /(Tawaran Istana|Terima:|Kekosongan|Pernah |Kewibawaan|Hubungan dengan|Tugas Istana|menghadap|Majlis rasmi|Kurnia|Pilih \d|Penggal)/;
    if (EN) { const t = await k.innerText(); if (RE.test(t)) { gagal.push(n + ': BM bocor (Profil): ' + t.slice(0, 300)); } }
    if (out) { await k.screenshot({ path: out + '/tyt-tawaran-' + n + '.png' }); }
    await pg.click('[data-tyt="terima"]'); await pg.waitForTimeout(700);
    const tabOk = await pg.evaluate(() => !document.getElementById('tab-istana').hidden && !document.getElementById('panel-istana').hidden); if (!tabOk) { gagal.push(n + ': tab Istana tidak dibuka'); }
    await pg.click('[data-tyt="hadap:tegur"]'); await pg.waitForTimeout(300); await pg.click('[data-tyt="majlis"]'); await pg.waitForTimeout(300);
    for (let i = 0; i < 3; i++) { await pg.evaluate((i) => { const c = document.querySelectorAll('[data-tyt-calon]')[i]; if (c) { c.click(); } }, i); await pg.waitForTimeout(150); }
    await pg.click('[data-tyt="kurnia"]'); await pg.waitForTimeout(400);
    const st = await pg.evaluate(() => { const a = MyPolitikTYT.getT(MyPolitikSave.loadPlayer()).aktif; return a && { k: a.kewibawaan, h: a.hadap, m: a.majlis, ku: a.kurniaTahun }; });
    if (!st || !st.h || !st.m || !st.ku) { gagal.push(n + ': tugas tidak direkod ' + JSON.stringify(st)); }
    if (EN) { const t = await (await pg.$('.tyt-istana')).innerText(); if (RE.test(t)) { gagal.push(n + ': BM bocor (Istana): ' + t.slice(0, 400)); } }
    if (out) { await (await pg.$('.tyt-istana')).screenshot({ path: out + '/tyt-istana-' + n + '.png' }); }
    if (er.length) { gagal.push(n + ': ralat ' + er.join(' | ')); }
  }
  await br.close(); srv.close();
  if (gagal.length) { console.log('GAGAL:\n - ' + gagal.join('\n - ')); process.exit(1); } else { console.log('Ujian TYT lulus.'); }
})();
