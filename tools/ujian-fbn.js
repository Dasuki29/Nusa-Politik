#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-fbn.js   (v13.15)
   Ujian pelayar (Playwright): Friends of BN (NPC): nota kuota di tab Pemilihan, usul Majlis Tertinggi BN di tab Tindakan
   (undi Sokong), dan EN tanpa BM bocor.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-fbn.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian Friends of BN dilangkau.'); process.exit(0); }
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
  await pg.click('text=Permainan baharu'); await pg.waitForTimeout(1000);
  await pg.selectOption('#s-parti', 'UMNO').catch(() => {}); await pg.waitForTimeout(3000);
  await pg.selectOption('#s-negeri', { index: 1 }); await pg.waitForTimeout(600);
  await pg.selectOption('#s-bahagian', { index: 1 }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-dun', { index: 1 }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-cawangan', { index: 1 }); await pg.waitForTimeout(300);
  await pg.fill('#f-nama', 'Ahmad Uji'); await pg.fill('#f-umur', '45'); await pg.check('input[name=jantina][value=L]').catch(() => pg.check('input[name=jantina] >> nth=0'));
  await pg.waitForTimeout(300); await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  await pg.click('[data-tab="pemilihan"]').catch(() => {}); await pg.waitForTimeout(500);
  semak(/Friends of BN: 3 kerusi Parlimen \(KIMMA, Makkal Sakti, IPF\)/.test(await pg.evaluate(() => document.body.textContent)), 'nota kuota Friends of BN');
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { jawatan: 'Presiden', fbn: { menunggu: MyPolitikSave.loadPlayer().tahun, komponen: false, tahunMT: 0, sejarah: [] } } }); NusaUI.render(); });
  await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(500);
  semak(await pg.$$eval('.fbn-kad [data-fbn]', (l) => l.length) === 3, 'kad usul MT BN (3 pilihan)');
  if (process.env.SKRIN) { await (await pg.$('.fbn-kad')).screenshot({ path: process.env.SKRIN }).catch(() => {}); }
  const kutip = (sel) => pg.evaluate(([src, s]) => { const re = new RegExp(src, 'i'), out = []; document.querySelectorAll(s).forEach((k) => { const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t); } } }); return out; }, [BM.source, sel]);
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(500);
  const b1 = await kutip('.fbn-kad'); semak(b1.length === 0, 'EN: tiada BM bocor dalam kad usul:\n    ' + b1.slice(0, 15).join('\n    '));
  await pg.click('[data-tab="pemilihan"]').catch(() => {}); await pg.waitForTimeout(500);
  const b2 = await kutip('.fbn-nota'); semak(b2.length === 0, 'EN: tiada BM bocor dalam nota kuota:\n    ' + b2.slice(0, 15).join('\n    '));
  await pg.evaluate(() => MyPolitikI18n.setLanguage('BM')); await pg.waitForTimeout(500);
  await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(400);
  await pg.click('.fbn-kad [data-fbn="sokong"]'); await pg.waitForTimeout(500);
  semak(await pg.evaluate(() => { const f = MyPolitikFBN.getFBN(MyPolitikSave.loadPlayer()); return !f.menunggu && f.tahunMT > 0; }), 'undi Sokong diproses');
  semak(await pg.$$eval('.fbn-kad', (l) => l.length) === 0, 'kad usul hilang selepas mengundi');
  // menu utama: baris Friends of BN dalam bahasa EN
  const pg2 = await (await br.newContext({ viewport: { width: 420, height: 900 } })).newPage();
  await pg2.route('**/*', (rt) => { if (rt.request().url().startsWith(base)) { rt.continue(); } else { rt.abort(); } });
  await pg2.goto(base + '/index.html'); await pg2.waitForTimeout(1000); await pg2.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg2.waitForTimeout(500);
  await pg2.click('[data-gab="BN"]'); await pg2.waitForTimeout(300);
  const tr = await pg2.evaluate(() => document.querySelector('.gab__rakan-t').textContent);
  semak(/partners, not components/.test(tr), 'EN: baris Friends of BN di menu (' + tr + ')');
  if (process.env.SKRIN2) { await (await pg2.$('#gab-bn')).screenshot({ path: process.env.SKRIN2 }).catch(() => {}); }
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian Friends of BN lulus.'); process.exit(gagal.length ? 1 : 0);
})();
