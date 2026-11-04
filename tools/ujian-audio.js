#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-audio.js   (v13.27)
   Ujian pelayar (Playwright): muzik latar: pemain UMNO memuat assets/audio/lagu-umno.mp3; parti lain (MCA) kekal mars asli (tiada fail dimuat).
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-audio.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian Audio dilangkau.'); process.exit(0); }
const exe = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean).filter((c) => fs.existsSync(c))[0];
const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff', '.webmanifest': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' }); r.end(fs.readFileSync(f)); });
const gagal = []; const semak = (ok, msg) => { if (!ok) { gagal.push(msg); } };
const BM = /\b(yang|dan|untuk|dengan|anda|kepada|telah|akan|tidak|sudah|ialah|dalam|pada|atau|boleh|mesti|setiap|bulan|tahun|sebagai|daripada|kawasan|sokongan|ahli|perwakilan|kerusi|tiada|perlu|pilih|jelajah|dana|lantikan|kedekatan|keahlian|sumbangan)\b/i;
async function cuba(br, base, parti) {
  const ctx = await br.newContext({ viewport: { width: 420, height: 900 } }), pg = await ctx.newPage(), minta = [], ralat = [];
  pg.on('pageerror', (e) => ralat.push(e.message)); pg.on('request', (q) => { if (/\.mp3/.test(q.url())) { minta.push(q.url()); } });
  await pg.route('**/*', (rt) => { if (rt.request().url().startsWith(base)) { rt.continue(); } else { rt.abort(); } });
  await pg.goto(base + '/index.html'); await pg.waitForTimeout(1000);
  const P = require('./persekitaran'), g = P.muat(); P.daftar({ nama: 'Audio Uji' }); P.tetap({ parti });
  const kod = g.MyPolitikSlot.kod(g.MyPolitikSlot.eksport());
  await pg.click('[data-menu="slot"]'); await pg.waitForTimeout(400); await pg.click('#slp-imp summary'); await pg.fill('#slp-teks', kod); await pg.waitForTimeout(200); await pg.click('#slp-btn-import'); await pg.waitForTimeout(3000);
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  const pt = await pg.evaluate(() => MyPolitikSave.loadPlayer().parti);
  await pg.click('#mpa-bar .mpa-btn', { force: true }); await pg.waitForTimeout(1500);
  await ctx.close(); return { pt, minta, ralat };
}
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const br = await PW.chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] } : { args: ['--autoplay-policy=no-user-gesture-required'] });
  const u = await cuba(br, base, 'UMNO'); semak(u.pt === 'UMNO', 'pemain UMNO'); semak(u.minta.some((x) => /lagu-umno\.mp3/.test(x)), 'UMNO memuat lagu-umno.mp3');
  const m = await cuba(br, base, 'MCA'); semak(m.pt === 'MCA', 'pemain MCA (' + m.pt + ')'); semak(m.minta.length === 0, 'MCA tidak memuat fail muzik: ' + m.minta.join(', '));
  semak(fs.statSync(path.join(ROOT, 'assets/audio/lagu-umno.mp3')).size > 100000, 'fail lagu wujud');
  semak(u.ralat.concat(m.ralat).length === 0, 'ralat JavaScript: ' + u.ralat.concat(m.ralat).slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian Audio lulus.'); process.exit(gagal.length ? 1 : 0);
})();
