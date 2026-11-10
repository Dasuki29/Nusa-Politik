/* Nusa Politik — tools/ujian-lompat.js (v13.51): ujian pelayar Lompat Parti hujung ke hujung (kad Profil -> borang cawangan baharu -> dashboard, EN). Guna: node tools/ujian-lompat.js [folder-tangkapan] [BM|EN] */
const fs = require('fs'), path = require('path'), http = require('http'); const PW = require('playwright'); const P = require('./persekitaran');
const ROOT = path.join(__dirname, '..'); const g = P.muat(); P.daftar({ nama: 'Amir Hakim', jantina: 'L', umur: 40, sayap: 'utama' });
P.tetap({ ap: 10, myr: 50000, ip: 800, reputasi: 60, tahun: 2031, bulan: 4 });
P.tetap({ pru: Object.assign({}, g.MyPolitikPRU.getPRU(g.MyPolitikSave.loadPlayer()), { aktif: null, status: { jenis: 'MP', kerusi: 'Pekan', kerajaan: true } }) });
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
    await pg.evaluate(() => { const d = document.querySelector('.lp-kad'); const det = d && d.closest('details'); if (det) { det.open = true; } });
    const k = await pg.$('.lp-kad'); if (!k) { gagal.push(n + ': kad Lompat Parti tiada'); continue; }
    if (process.argv[3] === 'EN' && n === 'd') { const bm = await pg.evaluate(() => { const t = document.querySelector('.lp-kad').innerText; return /(Lompat Parti|Keluar parti|Sedia menerima|kekal)/.test(t) ? t : ''; }); if (bm) { gagal.push('BM bocor dalam EN: ' + bm.slice(0, 300)); } }
    await pg.click('input[name="lp-parti"][value="PKR"]'); await pg.waitForTimeout(400);
    if (!/(Perkara 49A|Article 49A)/.test(await (await pg.$('.lp-kad')).innerText())) { gagal.push(n + ': amaran Perkara 49A tiada'); }
    if (out) { await (await pg.$('.lp-kad')).screenshot({ path: out + '/lompat-' + n + '.png' }); }
    if (n === 'm') { await pg.close(); continue; }
    await pg.click('[data-lp="sah"]'); await pg.waitForSelector('#modal.is-open'); const bt = await pg.$$('#modal.is-open button'); await bt[bt.length - 1].click();
    await pg.waitForURL(/index\.html#daftar/, { timeout: 10000 }); await pg.waitForSelector('.lompat-banner');
    if (process.argv[3] === 'EN') { await pg.waitForTimeout(500); const tb = await pg.$eval('.lompat-banner', (e) => e.innerText); if (/(Pilih|Lompat|Batal)/.test(tb)) { gagal.push('BM bocor dalam EN (borang): ' + tb); } }
    const v = await pg.evaluate(() => ({ nama: document.getElementById('f-nama').value, ro: document.getElementById('f-nama').readOnly, parti: document.getElementById('s-parti').value }));
    if (v.parti !== 'PKR' || !v.ro) { gagal.push('borang lompat: ' + JSON.stringify(v)); }
    const pilih = async (id) => { await pg.waitForFunction((i) => document.getElementById(i).options.length > 1, id, { timeout: 15000 }); const cur = await pg.$eval('#' + id, (e) => e.value); if (!cur) { const vv = await pg.$eval('#' + id, (e) => e.options[1].value); await pg.selectOption('#' + id, vv); } await pg.waitForTimeout(200); };
    await pilih('s-negeri'); await pilih('s-bahagian'); await pilih('s-dun'); await pilih('s-cawangan');
    if (out) { await pg.screenshot({ path: out + '/lompat-borang.png', fullPage: false }); }
    await pg.click('#btn-submit'); await pg.waitForURL(/dashboard\.html/, { timeout: 10000 }); await pg.waitForSelector('#kandungan:not([hidden])');
    const p2 = await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); return { parti: p.parti, nama: p.nama, ip: p.ip, st: p.pru && p.pru.status, kali: p.lompat && p.lompat.kali, prk: p.lompat && p.lompat.prk.length, tertunda: !!p.lompatTertunda }; });
    if (p2.parti !== 'PKR' || p2.nama !== 'Amir Hakim' || p2.ip !== 400 || p2.st || p2.kali !== 1 || p2.prk !== 1 || p2.tertunda) { gagal.push('profil selepas lompat: ' + JSON.stringify(p2)); }
    if (er.length) { gagal.push(n + ': ralat ' + er.join(' | ')); }
  }
  await br.close(); srv.close();
  if (gagal.length) { console.log('GAGAL:\n - ' + gagal.join('\n - ')); process.exit(1); } else { console.log('Ujian Lompat Parti lulus.'); }
})();
