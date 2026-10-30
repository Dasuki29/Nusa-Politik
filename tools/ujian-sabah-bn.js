#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-sabah-bn.js   (v13.16)
   Ujian pelayar (Playwright): daftar MCA di Sabah (nota borang, Bahagian Sabah), kad MCA Sabah: Membina Semula,
   Khidmat Masyarakat Bandar, dan EN tanpa BM bocor.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-sabah-bn.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian MCA & MIC Sabah dilangkau.'); process.exit(0); }
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
  await pg.selectOption('#s-parti', 'MCA'); await pg.waitForTimeout(3000);
  const ng = await pg.$$eval('#s-negeri option', (o) => o.map((x) => x.textContent));
  semak(ng.some((x) => /Sabah/.test(x)), 'negeri Sabah untuk MCA');
  await pg.selectOption('#s-negeri', { index: ng.findIndex((x) => /Sabah/.test(x)) }); await pg.waitForTimeout(500);
  semak(/MCA Sabah: kedudukan MCA lemah/.test(await pg.textContent('#h-parti')), 'nota borang MCA Sabah');
  const bhg = await pg.$$eval('#s-bahagian option', (o) => o.map((x) => x.textContent));
  semak(bhg.length === 8, '7 Bahagian MCA Sabah (' + (bhg.length - 1) + ')');
  await pg.selectOption('#s-bahagian', { index: bhg.findIndex((b) => /Kota Kinabalu/.test(b)) }); await pg.waitForTimeout(300);
  const dn = await pg.$$eval('#s-dun option', (o) => o.map((x) => x.textContent)); await pg.selectOption('#s-dun', { index: dn.findIndex((d) => /Likas/.test(d)) }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-cawangan', { index: 1 }); await pg.waitForTimeout(300);
  await pg.fill('#f-nama', 'Lim Uji Sabah'); await pg.fill('#f-umur', '40'); await pg.check('input[name=jantina][value=L]').catch(() => pg.check('input[name=jantina] >> nth=0'));
  await pg.waitForTimeout(300); await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  semak(await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); return p.parti === 'MCA' && /Sabah/i.test(p.negeri) && MyPolitikSabahBN.adalah(p) && MyPolitikPRU.getPRU(p).jenisPBB === 'PRN'; }), 'profil MCA Sabah, PRN Sabah');
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { ap: 10, myr: 20000 } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  const pf = await pg.textContent('#panel-profil');
  semak(/MCA Sabah: Membina Semula/.test(pf) && /Pemulihan Sabah/.test(pf) && /Likas/.test(pf), 'kad MCA Sabah');
  semak(/dalam kuota MCA Sabah/.test(pf), 'kad MCA: kuota Sabah');
  await pg.click('[data-sbn="khidmat"]'); await pg.waitForTimeout(500);
  semak(await pg.evaluate(() => MyPolitikSabahBN.getSBN(MyPolitikSave.loadPlayer()).pemulihan === 25), 'Khidmat Masyarakat Bandar: Pemulihan 25');
  if (process.env.SKRIN) { await (await pg.$('.sbn-kad')).screenshot({ path: process.env.SKRIN }).catch(() => {}); }
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  await pg.click('[data-tab="profil"]').catch(() => {}); await pg.waitForTimeout(500);
  const bocor = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; document.querySelectorAll('.sbn-kad').forEach((k) => { const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t); } } }); return out; }, BM.source);
  semak(bocor.length === 0, 'EN: tiada BM bocor dalam kad Sabah:\n    ' + bocor.slice(0, 15).join('\n    '));
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian MCA & MIC Sabah lulus.'); process.exit(gagal.length ? 1 : 0);
})();
