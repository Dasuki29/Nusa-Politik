#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-gabungan.js   (v13.6)
   Ujian pelayar (Playwright): menu utama memaparkan parti ikut gabungan (BN, GPS); satu panel pada satu masa; cip parti terus ke pendaftaran; EN.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-mic.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian gabungan dilangkau.'); process.exit(0); }
const exe = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean).filter((c) => fs.existsSync(c))[0];
const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff', '.webmanifest': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' }); r.end(fs.readFileSync(f)); });
const gagal = []; const semak = (ok, msg) => { if (!ok) { gagal.push(msg); } };
const BM = /\b(yang|dan|untuk|dengan|anda|kepada|telah|akan|tidak|sudah|ialah|dalam|pada|atau|boleh|mesti|setiap|bulan|tahun|sebagai|daripada|kawasan|sokongan|ahli|perwakilan|kerusi|tiada|perlu|pilih|jelajah|dana|lantikan|kedekatan|keahlian|sumbangan)\b/i;
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const br = await PW.chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
  const pg = await (await br.newContext({ viewport: { width: 420, height: 900 } })).newPage();
  const ralat = []; pg.on('pageerror', (e) => ralat.push(e.message));
  await pg.route('**/*', (rt) => { if (rt.request().url().startsWith(base)) { rt.continue(); } else { rt.abort(); } });
  await pg.goto(base + '/index.html'); await pg.waitForTimeout(1200);
  const nampak = () => pg.$$eval('.poster .poster__chip', (l) => l.filter((x) => x.offsetParent).map((x) => x.dataset.parti).join());
  semak(await nampak() === '', 'tiada cip parti sebelum gabungan dipilih');
  semak(await pg.$$eval('.gab__btn img', (l) => l.every((i) => i.complete && i.naturalWidth > 0)), 'logo BN dan GPS dimuat');
  await pg.click('[data-gab="BN"]'); await pg.waitForTimeout(200);
  semak(await nampak() === 'UMNO,MCA,MIC,PPP,PBRS', 'BN: 5 parti (' + await nampak() + ')');
  semak(await pg.getAttribute('[data-gab="BN"]', 'aria-expanded') === 'true', 'aria-expanded BN');
  await pg.click('[data-gab="GPS"]'); await pg.waitForTimeout(200);
  semak(await nampak() === 'PBB,PRS,SUPP,PDP', 'GPS: PBB, PRS, SUPP, PDP (' + await nampak() + ')');
  semak(await pg.getAttribute('[data-gab="BN"]', 'aria-expanded') === 'false', 'BN ditutup apabila GPS dibuka');
  await pg.click('[data-gab="GPS"]'); await pg.waitForTimeout(200);
  semak(await nampak() === '', 'tekan semula menutup panel');
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(400);
  await pg.click('[data-gab="BN"]'); await pg.waitForTimeout(400);
  const t = await pg.textContent('.poster');
  semak(/Barisan Nasional parties/.test(t) && /PPP and PBRS are in light mode/.test(t) && /Tap a party/.test(t) && /5 parties/.test(t), 'EN gabungan: ' + t.replace(/\s+/g, ' ').slice(0, 200));
  await pg.evaluate(() => MyPolitikI18n.setLanguage('BM')); await pg.waitForTimeout(300);
  await pg.click('.poster__chip[data-parti="MCA"]'); await pg.waitForTimeout(2500);
  semak(await pg.$eval('#s-parti', (x) => x.value) === 'MCA', 'cip MCA terus ke pendaftaran MCA');
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian gabungan lulus.'); process.exit(gagal.length ? 1 : 0);
})();
