#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-mindef.js   (v13.73)
   Ujian pelayar (Playwright): tab Pejabat MINDEF bagi Menteri Pertahanan (meter, pemantauan sempadan,
   insiden tegas/diplomatik, perolehan aset, audit, arahan bulanan), dan EN tanpa BM bocor. Dilangkau jika Playwright atau Chromium tiada.
   Guna: node tools/ujian-mindef.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian MINDEF dilangkau.'); process.exit(0); }
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
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(), k = MyPolitikKabinet.getKabinet(p); Object.assign(k, { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH', portfolioName: 'Menteri Pertahanan', lobi: null, acara: null });
    MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { kabinet: k, tahun: 2027, bulan: 4, ap: 10, mindef: Object.assign(MyPolitikMINDEF.getMINDEF({}), { insiden: { jenis: 'laut', bulan: 1 } }) } }); NusaUI.render(); });
  await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(400);
  semak(await pg.$('[data-pru="exco-tab"][data-id="mindef"]') !== null, 'tab Pejabat MINDEF');
  await pg.click('[data-pru="exco-tab"][data-id="mindef"]'); await pg.waitForTimeout(400);
  const t1 = await pg.evaluate(() => document.body.innerText);
  semak(/Skor keselamatan negara/.test(t1) && /Pencerobohan/.test(t1) && /Kapal tempur pesisir/.test(t1) && /Latihan bersama/.test(t1), 'kandungan Pejabat MINDEF');
  const SK = async (f) => { if (f) { await (await pg.$('.kdn-m')).evaluate((e) => { e.closest('section').id = 'skr-md'; }); await (await pg.$('#skr-md')).screenshot({ path: f }).catch(() => {}); } };
  await SK(process.env.SKRIN);
  await pg.evaluate(() => MyPolitikMINDEF.setRng(() => 0.01));
  await pg.click('[data-mindef="tegas"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => MyPolitikSave.loadPlayer().mindef.insiden === null), 'insiden diusir');
  await pg.click('[data-mindef="kontrak"][data-id="perisai"][data-laluan="terbuka"]'); await pg.waitForTimeout(300);
  semak(await pg.evaluate(() => MyPolitikSave.loadPlayer().mindef.kontrak.length === 1), 'kontrak diluluskan');
  semak(await pg.$$eval('[data-mindef="kontrak"]:not([disabled])', (l) => l.length) === 0, 'kontrak dikunci sebulan');
  await pg.click('[data-mindef="arahan"][data-id="latihan"][data-cabang="udara"]'); await pg.waitForTimeout(300);
  semak(await pg.$$eval('[data-mindef="arahan"]:not([disabled])', (l) => l.length) === 0, 'arahan dikunci');
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); p.mindef.insiden = { jenis: 'udara', bulan: 1 }; p.mindef.insidenBulan = 0; MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { mindef: p.mindef } }); MyPolitikI18n.setLanguage('EN'); });
  await pg.waitForTimeout(700); await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(400);
  const b1 = await pg.evaluate(([src]) => { const re = new RegExp(src + "|\\b(sebulan|juta|bilion|siap|cabang|kesiapsiagaan|keselamatan|jeneral|risiko|sempadan|perairan|ruang)\\b", "i"), out = []; const s = document.querySelector(".kdn-m").closest('section'); const w = document.createTreeWalker(s, 4); let x; while ((x = w.nextNode())) { const t = x.textContent.trim(); if (t && re.test(t)) { out.push(t); } } return out; }, [BM.source]);
  semak(b1.length === 0, 'EN: BM bocor di Pejabat MINDEF:\n    ' + b1.slice(0, 12).join('\n    '));
  await SK(process.env.SKRIN2);
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian MINDEF lulus.'); process.exit(gagal.length ? 1 : 0);
})();
