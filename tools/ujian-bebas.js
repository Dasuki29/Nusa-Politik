#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-bebas.js   (v13.87)
   Ujian pelayar (Playwright): Calon Bebas PRU (pencalonan, pengesahan, kempen) dan EN tanpa BM bocor.
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian Calon Bebas dilangkau.'); process.exit(0); }
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
  const bocor = async () => pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; document.querySelectorAll('#modal, #panel-pilihanraya').forEach((k) => { const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t) && n.parentElement && n.parentElement.offsetParent !== null) { out.push(t); } } }); return out; }, BM.source);
  // ahli dipecat: PRU diisytihar, mod EN
  await pg.evaluate(() => { const S = MyPolitikSave, p = S.loadPlayer(); S.applyEffects({}, { kiraTindakan: false, patch: { ip: 1000, myr: 40000, etika: Object.assign({}, MyPolitikEtika.getEtika(p), { status: 'dipecat' }) } });
    MyPolitikI18n.setLanguage('EN'); MyPolitikPRU.isytihar('tamat_penggal'); NusaUI.render(); });
  await pg.waitForTimeout(500); await pg.click('[data-tab="pilihanraya"]').catch(() => {}); await pg.waitForTimeout(400);
  await pg.click('[data-pru="buka"]').catch(() => {}); await pg.waitForTimeout(700);
  const isi = await pg.textContent('#modal').catch(() => '');
  semak(/Independent candidate/.test(isi) && /Deposit RM 5,000|Deposit RM 10,000/.test(isi), 'pilihan Bebas dalam modal (' + isi.slice(0, 300) + ')');
  let b = await bocor(); semak(b.length === 0, 'EN: BM bocor (pencalonan):\n    ' + b.slice(0, 8).join('\n    '));
  if (process.env.SKRIN) { await (await pg.$('#modal .modal__kotak, #modal > *')).screenshot({ path: process.env.SKRIN }).catch(() => {}); }
  await pg.click('#modal [data-pilih="BEBAS_DUN"]').catch(() => {}); await pg.waitForTimeout(700);
  semak(await pg.evaluate(() => { const a = MyPolitikPRU.getPRU(MyPolitikSave.loadPlayer()).aktif; return !!(a && a.bebas && a.fasa === 'manifesto'); }), 'Bebas didaftar (dipecat: tanpa pengesahan)');
  // manifesto: tutup modal; mula kempen terus melalui API
  for (let i = 0; i < 3; i++) { const x = await pg.$('#modal.is-open [data-nilai="false"], #modal.is-open .modal__tutup'); if (!x) { break; } await x.click().catch(() => {}); await pg.waitForTimeout(300); }
  await pg.evaluate(() => { const P = MyPolitikPRU; P.mulaKempen(P.JANJI.slice(0, 3).map((j) => j.id), 5000); NusaUI.render(); });
  await pg.waitForTimeout(500); await pg.click('[data-tab="pilihanraya"]').catch(() => {}); await pg.waitForTimeout(400);
  const kad = await pg.textContent('#panel-pilihanraya').catch(() => '');
  semak(/You \(Independent\)/.test(kad) && /UMNO candidate/.test(kad), 'pecahan undi Bebas (' + kad.slice(0, 300) + ')');
  b = await bocor(); semak(b.length === 0, 'EN: BM bocor (kempen):\n    ' + b.slice(0, 8).join('\n    '));
  if (process.env.SKRIN2) { await (await pg.$('#panel-pilihanraya')).screenshot({ path: process.env.SKRIN2 }).catch(() => {}); }
  semak(ralat.length === 0, 'ralat JS: ' + ralat.join(' | '));
  await br.close(); srv.close();
  if (gagal.length) { console.log('GAGAL:\n - ' + gagal.join('\n - ')); process.exit(1); }
  console.log('Ujian Calon Bebas lulus.');
})().catch((e) => { console.error(e); process.exit(1); });
