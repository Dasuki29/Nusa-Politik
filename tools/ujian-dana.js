#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-dana.js   (v13.23)
   Ujian pelayar (Playwright): Isu Tempatan dan Keluhan Rakyat diselesaikan dengan dana peribadi (butang, klik, isu ditanda selesai, EN tanpa BM bocor).
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-dana.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian Dana Peribadi dilangkau.'); process.exit(0); }
const exe = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean).filter((c) => fs.existsSync(c))[0];
const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff', '.webmanifest': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' }); r.end(fs.readFileSync(f)); });
const gagal = []; const semak = (ok, msg) => { if (!ok) { gagal.push(msg); } };
const BM = /\b(yang|dan|untuk|dengan|anda|kepada|telah|akan|tidak|sudah|ialah|dalam|pada|atau|boleh|mesti|setiap|bulan|tahun|sebagai|daripada|kawasan|sokongan|ahli|perwakilan|kerusi|tiada|perlu|pilih|jelajah|dana|lantikan|kedekatan|keahlian|sumbangan)\b/i;
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const br = await PW.chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
  const pg = await (await br.newContext({ viewport: { width: 1200, height: 900 } })).newPage();
  const ralat = []; pg.on('pageerror', (e) => ralat.push(e.message));
  await pg.route('**/*', (rt) => { if (rt.request().url().startsWith(base)) { rt.continue(); } else { rt.abort(); } });
  await pg.goto(base + '/index.html'); await pg.waitForTimeout(1200);
  const P = require('./persekitaran'), g = P.muat(); P.daftar({ nama: 'Pembangkang Uji' });
  const S = g.MyPolitikSave, p0 = S.loadPlayer(), PRU = g.MyPolitikPRU, KW = g.MyPolitikKawasan;
  S.applyEffects({}, { kiraTindakan: false, patch: { ap: 10, myr: 20000,
    pru: Object.assign({}, PRU.getPRU(p0), { status: { jenis: 'ADUN', kerusi: 'X', kerajaan: false } }),
    kawasan: Object.assign({}, KW.getKawasan(p0), { baki: 0, keluhan: [{ id: 'd1', kod: 'air_terputus', idx: p0.tahun * 12 + p0.bulan }] }),
    isu: [{ kod: 'jalan_berlubang', tajuk: 'Jalan kampung berlubang', tahap: 2, selesai: false }, { kod: 'lampu_jalan', tajuk: 'Lampu jalan rosak', tahap: 1, selesai: false }] } });
  const kod = g.MyPolitikSlot.kod(g.MyPolitikSlot.eksport());
  await pg.click('[data-menu="slot"]'); await pg.waitForTimeout(400); await pg.click('#slp-imp summary'); await pg.fill('#slp-teks', kod); await pg.waitForTimeout(200); await pg.click('#slp-btn-import'); await pg.waitForTimeout(3000);
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  semak(await pg.$$eval('#s-isu [data-act="isu-dana"]', (l) => l.length) === 2, '2 butang Selesai sendiri di Isu Tempatan');
  await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(500);
  semak(await pg.$$eval('[data-act="kawasan-dana"]', (l) => l.length) === 1, 'butang Dana peribadi di Keluhan Rakyat');
  if (process.env.SKRIN) { const k = await pg.$('#s-isu'); if (k) { await k.screenshot({ path: process.env.SKRIN }).catch(() => {}); } }
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(600);
  const bocor = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; document.querySelectorAll('#s-isu, [data-act="kawasan-dana"]').forEach((k) => { const w = document.createTreeWalker(k.closest('section') || k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t) && !/Jalan kampung|Lampu jalan|Bekalan air|Beberapa lorong/.test(t)) { out.push(t.slice(0, 120)); } } }); return out; }, BM.source);
  semak(bocor.length === 0, 'EN: tiada BM bocor:\n    ' + bocor.join('\n    '));
  await pg.evaluate(() => MyPolitikI18n.setLanguage('BM')); await pg.waitForTimeout(400);
  await pg.evaluate(() => { const b = document.querySelector('[data-act="kawasan-dana"]'); b.click(); }); await pg.waitForTimeout(600);
  semak(await pg.$$eval('[data-act="kawasan-dana"]', (l) => l.length) === 0, 'keluhan selesai dan dibuang');
  await pg.click('#s-isu [data-act="isu-dana"][data-kod="lampu_jalan"]'); await pg.waitForTimeout(600);
  const st = await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(), x = p.isu.filter((i) => i.kod === 'lampu_jalan')[0]; return { cara: x.cara, bil: p.danaPeribadi && p.danaPeribadi.bil, off: !!document.querySelector('#s-isu [data-act="isu-dana"][disabled]'), garis: /line-through/.test(document.querySelector('#s-isu').innerHTML) }; });
  semak(st.cara === 'dana_peribadi' && st.garis, 'isu ditanda selesai melalui dana peribadi');
  semak(st.bil === 2 && st.off, 'had 2 sebulan: butang baki dimatikan');
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian Dana Peribadi lulus.'); process.exit(gagal.length ? 1 : 0);
})();
