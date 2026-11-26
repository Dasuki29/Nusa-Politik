/* Nusa Politik — tools/ujian-gerakan.js (v14.10): ujian pelayar Gerakan Parti Negeri (kad tab Tindakan, program, peta, EN). Guna: node tools/ujian-gerakan.js [folder-tangkapan] [BM|EN] */
const fs = require('fs'), path = require('path'), http = require('http'); const PW = require('playwright'); const P = require('./persekitaran');
const ROOT = path.join(__dirname, '..'); const g = P.muat(); P.daftar({ nama: 'Amir Hakim', jantina: 'L', umur: 55, sayap: 'utama' });
P.tetap({ ap: 20, myr: 200000, ip: 900, tahun: 2027, bulan: 3, reputasi: 60, jawatan: 'Presiden', jawatanList: [{ kod: 'presiden', jawatan: 'Presiden', peringkat: 'pusat', kumpulan: 'utama', pangkat: 12, tahun: 2026 }] });
const BEKAL = {}; g.localStorage._peta.forEach((v, k) => { BEKAL[k] = v; }); BEKAL.nusaLang = process.argv[3] || 'BM';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port; const br = await PW.chromium.launch(); const out = process.argv[2] || null; const gagal = [];
  const EN = process.argv[3] === 'EN', RE = /(Gerakan Parti Negeri|Jawatan Pusat|Klik negeri|Kekuatan Parti|Had Gerakan|Susut|Jelajah Negeri|Buka Cawangan|Program Komuniti|tidak susut|bulanan|sekali setahun|Kesan:|Lemah|Kubu\b)/;
  for (const [w, n] of [[1280, 'd'], [420, 'm']]) {
    const pg = await br.newPage({ viewport: { width: w, height: 900 } }); const er = []; pg.on('pageerror', (e) => er.push(e.message));
    await pg.route('**/*', (rt) => rt.request().url().startsWith(base) ? rt.continue() : rt.abort());
    await pg.addInitScript((d) => { if (sessionStorage.getItem('__bekal')) { return; } sessionStorage.setItem('__bekal', '1'); Object.keys(d).forEach((k) => localStorage.setItem(k, d[k])); }, BEKAL);
    await pg.goto(base + '/dashboard.html'); await pg.waitForSelector('#kandungan:not([hidden])');
    await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) {} }); await pg.addStyleTag({ content: '.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}' });
    for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
    await pg.evaluate(() => NusaUI.gotoTab('tindakan')); await pg.waitForTimeout(500);
    await pg.evaluate(() => { const d = document.querySelector('.gk-kad'); const det = d && d.closest('details'); if (det) { det.open = true; } });
    const k = await pg.$('.gk-kad'); if (!k) { gagal.push(n + ': kad Gerakan tiada'); continue; }
    await pg.evaluate(() => { const r = document.querySelectorAll('[data-gk-negeri]'); r[2].click(); }); await pg.waitForTimeout(400);
    await pg.evaluate(() => { const d = document.querySelector('.gk-kad'); const det = d && d.closest('details'); if (det) { det.open = true; } });
    const kod = await pg.evaluate(() => document.querySelector('[data-gk="jelajah"]').getAttribute('data-gk-kod'));
    await pg.evaluate(() => document.querySelector('[data-gk="jelajah"]').click()); await pg.waitForTimeout(500);
    const st = await pg.evaluate((kod) => ({ m: MyPolitikGerakan.mata(MyPolitikSave.loadPlayer(), kod), kod }), kod);
    if (!st.m) { gagal.push(n + ': jelajah tidak direkod ' + JSON.stringify(st)); }
    await pg.evaluate(() => { const d = document.querySelector('.gk-kad'); const det = d && d.closest('details'); if (det) { det.open = true; } });
    if (EN) { const t = await (await pg.$('.gk-kad')).innerText(); const mm = t.split('\n').filter((x) => RE.test(x)); if (mm.length) { gagal.push(n + ': BM bocor: ' + mm.join(' | ')); } }
    if (out) { await (await pg.$('.gk-kad')).screenshot({ path: out + '/gerakan-' + n + '.png' }); }
    if (er.length) { gagal.push(n + ': ralat ' + er.join(' | ')); }
  }
  await br.close(); srv.close();
  if (gagal.length) { console.log('GAGAL:\n - ' + gagal.join('\n - ')); process.exit(1); } else { console.log('Ujian Gerakan lulus.'); }
})();
