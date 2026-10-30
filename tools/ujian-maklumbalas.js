#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-maklumbalas.js   (v13.7)
   Ujian pelayar (Playwright): butang Maklum balas (menu utama, Menu dashboard), skrin pengesahan, pautan Google Form isi automatik, EN.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-mic.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian maklum balas dilangkau.'); process.exit(0); }
const exe = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean).filter((c) => fs.existsSync(c))[0];
const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff', '.webmanifest': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' }); r.end(fs.readFileSync(f)); });
const gagal = []; const semak = (ok, msg) => { if (!ok) { gagal.push(msg); } };
const BM = /\b(yang|dan|untuk|dengan|anda|kepada|telah|akan|tidak|sudah|ialah|dalam|pada|atau|boleh|mesti|setiap|bulan|tahun|sebagai|daripada|kawasan|sokongan|ahli|perwakilan|kerusi|tiada|perlu|pilih|jelajah|dana|lantikan|kedekatan|keahlian|sumbangan)\b/i;
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const br = await PW.chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
  const ctx = await br.newContext({ viewport: { width: 420, height: 900 } }), pg = await ctx.newPage();
  const ralat = []; pg.on('pageerror', (e) => ralat.push(e.message));
  await ctx.route('**/*', (rt) => { if (rt.request().url().startsWith(base)) { rt.continue(); } else { rt.fulfill(/docs\.google\.com/.test(rt.request().url()) ? { status: 200, contentType: 'text/html', body: '<p>borang</p>' } : { status: 204, body: '' }); } });
  await pg.goto(base + '/index.html'); await pg.waitForTimeout(1200);
  semak(await pg.isVisible('.baris[data-maklumbalas]'), 'baris Maklum balas di menu utama');
  await pg.click('.baris[data-maklumbalas]'); await pg.waitForTimeout(300);
  semak(await pg.isVisible('#mb-win.is-open'), 'skrin pengesahan dibuka');
  const [tab] = await Promise.all([ctx.waitForEvent('page'), pg.click('[data-mb-buka]')]);
  const u = tab.url(); await tab.close();
  semak(/^https:\/\/docs\.google\.com\/forms\/d\/e\/1FAIpQLSdMYHB_QE3WRwJk5NhWVjbsprlpAOURtiT-LXsXHuEYNTgD5g\/viewform\?usp=pp_url&entry\.624898804=/.test(u) && /menu%20utama/.test(u), 'pautan borang isi auto: ' + u.slice(0, 160));
  semak(!(await pg.isVisible('#mb-win.is-open')), 'skrin pengesahan ditutup selepas dibuka');
  // dashboard
  await pg.click('[data-gab="BN"]'); await pg.click('.poster__chip[data-parti="UMNO"]'); await pg.waitForTimeout(2500);
  await pg.selectOption('#s-negeri', { index: 1 }); await pg.waitForTimeout(400); await pg.selectOption('#s-bahagian', { index: 1 }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-dun', { index: 1 }); await pg.waitForTimeout(300); await pg.selectOption('#s-cawangan', { index: 1 }); await pg.waitForTimeout(300);
  await pg.fill('#f-nama', 'Rahsia Nama'); await pg.fill('#f-umur', '30'); await pg.check('input[name=jantina] >> nth=0'); await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  await pg.addStyleTag({ content: '.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}' });
  await pg.click('#btn-menu'); await pg.waitForTimeout(400);
  semak(await pg.isVisible('#menu-win [data-maklumbalas]'), 'butang Maklum Balas dalam Menu dashboard');
  await pg.click('#menu-win [data-maklumbalas]'); await pg.waitForTimeout(400);
  const info = await pg.textContent('#mb-win');
  semak(/v\d+\.\d+ · UMNO · 2026, bulan 1/.test(info) && !/Rahsia Nama/.test(info), 'maklumat permainan tanpa nama watak: ' + info.replace(/\s+/g, ' ').slice(0, 200));
  semak(!/Rahsia/.test(await pg.evaluate(() => MyPolitikMaklumBalas.pautan())), 'pautan tidak mengandungi nama watak');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(500);
  await pg.click('#btn-menu'); await pg.waitForTimeout(400);
  semak(/Send Feedback \(anonymous\)/.test(await pg.textContent('#menu-win')), 'EN butang menu');
  await pg.click('#menu-win [data-maklumbalas]'); await pg.waitForTimeout(500);
  const en = await pg.textContent('#mb-win');
  semak(/Feedback/.test(en) && /new tab/.test(en) && /Open Form/.test(en) && /Back/.test(en) && !/Anda akan|Kembali|Buka Borang/.test(en), 'EN skrin pengesahan: ' + en.replace(/\s+/g, ' ').slice(0, 200));
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian maklum balas lulus.'); process.exit(gagal.length ? 1 : 0);
})();
