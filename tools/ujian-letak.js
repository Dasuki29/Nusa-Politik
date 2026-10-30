#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-letak.js   (v13.12)
   Ujian pelayar (Playwright): kad "Wakil Rakyat & Kerajaan" di tab Profil, skrin pengesahan Letak Jawatan,
   letak kerusi MP (jawatan persekutuan tamat, PRK dijadualkan), senarai semak MB di tab Tindakan, dan EN tanpa BM bocor.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-letak.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian Letak Jawatan dilangkau.'); process.exit(0); }
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
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { tahun: 2027, bulan: 1, reputasi: 60,
    pru: Object.assign(MyPolitikPRU.getPRU(MyPolitikSave.loadPlayer()), { status: { jenis: 'MP', kerusi: 'Kangar', sejakTahun: 2026, sejakBulan: 3, kerajaan: true }, statusKedua: { jenis: 'ADUN', kerusi: 'Kuala Perlis', sejakTahun: 2026, sejakBulan: 3, kerajaan: true } }),
    kabinet: Object.assign(MyPolitikKabinet.getKabinet(MyPolitikSave.loadPlayer()), { hasGovernmentRole: true, roleLevel: 'TIMBALAN_MENTERI', portfolioName: 'Timbalan Menteri Pendidikan' }) } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  const kd = await pg.textContent('#panel-profil').catch(() => '');
  semak(/Wakil Rakyat & Kerajaan/.test(kd) && /Ahli Parlimen Kangar/.test(kd) && /ADUN Kuala Perlis/.test(kd) && /Timbalan Menteri Pendidikan/.test(kd), 'kad Wakil Rakyat & Kerajaan (' + kd.slice(0, 120) + ')');
  semak(await pg.$$eval('.letak-kad [data-letak]', (l) => l.length) === 3, '3 butang Letak Jawatan');
  if (process.env.SKRIN) { await (await pg.$('.letak-kad')).screenshot({ path: process.env.SKRIN }).catch(() => {}); }
  await pg.click('.letak-kad [data-letak="MP"]'); await pg.waitForTimeout(400);
  const md = await pg.textContent('#modal');
  semak(/Letak jawatan Ahli Parlimen Kangar\?/.test(md) && /Reputasi −3/.test(md) && /Timbalan Menteri Pendidikan juga tamat/.test(md) && /PRK Parlimen Kangar/.test(md), 'skrin pengesahan (' + md.slice(0, 160) + ')');
  if (process.env.SKRIN2) { await (await pg.$('#modal .modal__kotak, #modal > *')).screenshot({ path: process.env.SKRIN2 }).catch(() => {}); }
  await pg.click('#modal-kaki button:has-text("Ya, letak jawatan")'); await pg.waitForTimeout(600);
  semak(await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); return MyPolitikPRU.semuaStatus(p).length === 1 && !MyPolitikKabinet.getKabinet(p).hasGovernmentRole && MyPolitikLetak.getLetak(p).prk.length === 1; }), 'MP dilepaskan, jawatan tamat, PRK dijadualkan');
  semak(await pg.$$eval('.letak-kad [data-letak]', (l) => l.length) === 1, 'tinggal butang ADUN');
  // senarai semak MB di tab Tindakan
  await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(500);
  const tk = await pg.evaluate(() => document.body.innerText);
  semak(/Anda ADUN di negeri ini/.test(tk) && /Pengerusi Badan Perhubungan Negeri/.test(tk), 'senarai semak MB');
  // EN
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  await pg.click('[data-tab="profil"]').catch(() => {}); await pg.waitForTimeout(500);
  const bocor = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; document.querySelectorAll('.letak-kad').forEach((k) => { const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t); } } }); return out; }, BM.source);
  semak(bocor.length === 0, 'EN: tiada BM bocor dalam kad Letak:\n    ' + bocor.slice(0, 15).join('\n    '));
  await pg.click('.letak-kad [data-letak="ADUN"]'); await pg.waitForTimeout(400);
  const bocor2 = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('#modal'); const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t); } } return out; }, BM.source);
  semak(bocor2.length === 0, 'EN: tiada BM bocor dalam skrin pengesahan:\n    ' + bocor2.slice(0, 15).join('\n    '));
  await pg.click('#modal-kaki button >> nth=1'); await pg.waitForTimeout(300);
  await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(500);
  const bocor3 = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; document.querySelectorAll('.mbsemak').forEach((k) => { const w = document.createTreeWalker(k.parentNode, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t); } } }); return out; }, BM.source);
  semak(bocor3.length === 0, 'EN: tiada BM bocor dalam senarai semak MB:\n    ' + bocor3.slice(0, 15).join('\n    '));
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian Letak Jawatan lulus.'); process.exit(gagal.length ? 1 : 0);
})();
