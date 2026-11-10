#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-kdn.js   (v13.72)
   Ujian pelayar (Playwright): tab Pejabat KDN bagi Menteri Dalam Negeri (meter, ancaman, Operasi Khas,
   kecemasan, arahan agensi, dasar kebebasan sivil), dan EN tanpa BM bocor. Dilangkau jika Playwright atau Chromium tiada.
   Guna: node tools/ujian-kdn.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian KDN dilangkau.'); process.exit(0); }
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
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(), k = MyPolitikKabinet.getKabinet(p); Object.assign(k, { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH', portfolioName: 'Menteri Dalam Negeri', lobi: null, acara: null });
    MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { kabinet: k, tahun: 2027, bulan: 4, ap: 10, kdn: Object.assign(MyPolitikKDN.getKDN({}), { ancaman: { jenis: 'pati', bulan: 2 } }) } }); NusaUI.render(); });
  await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(400);
  semak(await pg.$('[data-pru="exco-tab"][data-id="kdn"]') !== null, 'tab Pejabat KDN');
  await pg.click('[data-pru="exco-tab"][data-id="kdn"]'); await pg.waitForTimeout(400);
  const t1 = await pg.evaluate(() => document.body.innerText);
  semak(/Ketenteraman awam/.test(t1) && /Gelombang PATI/.test(t1) && /Permit himpunan/.test(t1) && /Imigresen/.test(t1), 'kandungan Pejabat KDN');
  const SK = async (f) => { if (f) { await (await pg.$('.kdn-m')).evaluate((e) => { e.closest('section').id = 'skr-kdn'; }); await (await pg.$('#skr-kdn')).screenshot({ path: f }).catch(() => {}); } };
  await SK(process.env.SKRIN);
  await pg.evaluate(() => MyPolitikKDN.setRng(() => 0.01));
  await pg.click('[data-kdn="ops"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => MyPolitikSave.loadPlayer().kdn.ancaman === null), 'operasi berjaya');
  await pg.click('[data-kdn="agensi"][data-id="integriti"]'); await pg.waitForTimeout(300);
  semak(await pg.$$eval('[data-kdn="agensi"]:not([disabled])', (l) => l.length) === 0, 'arahan agensi dikunci');
  await pg.click('[data-kdn="dasar"][data-d="permit"][data-id="longgar"]'); await pg.waitForTimeout(300);
  semak(await pg.evaluate(() => MyPolitikSave.loadPlayer().kdn.dasar.permit === 'longgar'), 'permit longgar');
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); p.kdn.ancaman = { jenis: 'himpunan', bulan: 1 }; p.kdn.opsBulan = 0; MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { kdn: p.kdn } }); MyPolitikI18n.setLanguage('EN'); });
  await pg.waitForTimeout(700); await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(400);
  const b1 = await pg.evaluate(([src]) => { const re = new RegExp(src + "|\\b(sebulan|juta|berlarutan)\\b", "i"), out = []; const s = document.querySelector(".kdn-m").closest('section'); const w = document.createTreeWalker(s, 4); let x; while ((x = w.nextNode())) { const t = x.textContent.trim(); if (t && re.test(t)) { out.push(t); } } return out; }, [BM.source]);
  semak(b1.length === 0, 'EN: BM bocor di Pejabat KDN:\n    ' + b1.slice(0, 12).join('\n    '));
  await SK(process.env.SKRIN2);
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian KDN lulus.'); process.exit(gagal.length ? 1 : 0);
})();
