#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-exco.js   (v13.69)
   Ujian pelayar (Playwright): lobi 9 portfolio EXCO dengan bar IP, tab Pejabat EXCO / Portfolio Saya bagi MB/KM,
   satu tindakan khas sebulan (akar umbi naik), dan EN tanpa BM bocor. Dilangkau jika Playwright atau Chromium tiada.
   Guna: node tools/ujian-exco.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian EXCO dilangkau.'); process.exit(0); }
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
  const BOCOR = async (sel) => pg.evaluate(([src, s]) => { const re = new RegExp(src, 'i'), out = []; document.querySelectorAll(s).forEach((k) => { const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t); } } }); return out; }, [BM.source, sel]);
  // 1) Lobi EXCO: 9 portfolio, bar IP untuk yang dikunci
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { tahun: 2027, bulan: 1, ip: 130, myr: 50000, ap: 10 } }); MyPolitikKabinet.bukaLobi('DUN'); NusaUI.render(); });
  await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(500);
  await pg.click('[data-pru="lobi"]'); await pg.waitForTimeout(500);
  const md = await pg.textContent('#modal');
  semak((md.match(/EXCO /g) || []).length >= 9 && /Kurang 70 IP/.test(md) && /Hal Ehwal Agama Islam/.test(md) && !/Tanah, Mineral/.test(md), 'modal lobi 9 portfolio (' + md.slice(0, 200) + ')');
  semak(await pg.$$eval('#modal .exco-ip', (l) => l.length) >= 2, 'bar IP dipaparkan');
  if (process.env.SKRIN) { await (await pg.$('#modal .modal__kotak, #modal > *')).screenshot({ path: process.env.SKRIN }).catch(() => {}); }
  await pg.click('#modal button[data-pilih="TANGGUH"]'); await pg.waitForTimeout(500);
  // 2) MB: tab Portfolio Saya
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(), k = MyPolitikKabinet.getKabinet(p); Object.assign(k, { hasGovernmentRole: true, roleLevel: 'MENTERI_BESAR', portfolioName: 'Menteri Besar Perlis', portfolioId: 'exco_tanah', lobi: null, acara: null });
    MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { kabinet: k } }); NusaUI.render(); });
  await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(400);
  semak(await pg.$$eval('[data-pru="exco-tab"]', (l) => l.length) === 3 && await pg.$('[data-pru="exco-tab"][data-id="mb"]') !== null, 'tab Ringkasan / Portfolio Saya / Pejabat Menteri Besar');
  await pg.click('[data-pru="exco-tab"][data-id="pejabat"]'); await pg.waitForTimeout(400);
  semak(await pg.$$eval('.exco-tx', (l) => l.length) === 3 && /Luluskan geran tanah kampung/.test(await pg.textContent('.exco-tx')), '3 tindakan portfolio Tanah');
  if (process.env.SKRIN2) { await (await pg.$('.exco-tab')).evaluate((e) => e.closest('section').scrollIntoView()); await (await pg.$('.exco-tab')).evaluate((e) => e.closest('section').id = 'skr-exco'); await (await pg.$('#skr-exco')).screenshot({ path: process.env.SKRIN2 }).catch(() => {}); }
  const ak0 = await pg.evaluate(() => MyPolitikSave.loadPlayer().kesetiaan.akarUmbi);
  await pg.click('[data-pru="exco-tindak"][data-id="geran"]'); await pg.waitForTimeout(500);
  semak(await pg.evaluate((a) => MyPolitikSave.loadPlayer().kesetiaan.akarUmbi > a, ak0), 'akar umbi naik');
  semak(await pg.$$eval('[data-pru="exco-tindak"]:not([disabled])', (l) => l.length) === 0, 'butang dikunci selepas satu tindakan');
  // 3) EN
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(400);
  const b1 = await BOCOR('.exco-tab, .exco-tx'); semak(b1.length === 0, 'EN: BM bocor di Pejabat EXCO:\n    ' + b1.slice(0, 10).join('\n    '));
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(), k = MyPolitikKabinet.getKabinet(p); Object.assign(k, { hasGovernmentRole: false, roleLevel: 'NONE', portfolioName: '', portfolioId: '' });
    MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { kabinet: k } }); MyPolitikKabinet.bukaLobi('DUN'); NusaUI.render(); });
  await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(400);
  await pg.click('[data-pru="lobi"]'); await pg.waitForTimeout(600);
  const b2 = await BOCOR('#modal'); semak(b2.length === 0, 'EN: BM bocor di modal lobi:\n    ' + b2.slice(0, 10).join('\n    '));
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian EXCO lulus.'); process.exit(gagal.length ? 1 : 0);
})();
