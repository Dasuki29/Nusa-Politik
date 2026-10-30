#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-gelaran.js   (v13.13)
   Ujian pelayar (Playwright): pendaftaran dengan Pendidikan PhD (awalan Dr.), kad Pendidikan (sambung belajar), kad Anugerah & Gelaran
   (Datuk, Tun, gelaran negeri) dan EN tanpa BM bocor.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-gelaran.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian Gelaran dilangkau.'); process.exit(0); }
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
  await pg.fill('#f-nama', 'Ahmad Uji'); await pg.fill('#f-umur', '45'); await pg.check('input[name=jantina][value=L]').catch(() => pg.check('input[name=jantina] >> nth=0')); await pg.selectOption('#s-pendidikan', 'phd');
  await pg.waitForTimeout(300); await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  semak(await pg.evaluate(() => MyPolitikSave.loadPlayer().pendidikan.tahap === 'phd'), 'profil: PhD');
  semak(/^Dr\. /.test(await pg.textContent('#p-nama')), 'nama profil bermula Dr. (' + await pg.textContent('#p-nama') + ')');
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { myr: 100000, pendidikan: { tahap: 'sarjana' }, gelaran: { dato: { tahun: 2029, bulan: 1 }, negeri: { t1: { tahun: 2029, bulan: 1 } }, bulanPM: 5, bulanN2: 3 } } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  const pf = await pg.textContent('#panel-profil');
  semak(/Pendidikan/.test(pf) && /Sarjana/.test(pf) && /Sambung PhD/.test(pf), 'kad Pendidikan');
  await pg.click('[data-pdk="sambung"]'); await pg.waitForTimeout(500);
  semak(await pg.evaluate(() => { const d = MyPolitikPendidikan.getPendidikan(MyPolitikSave.loadPlayer()); return d.belajar && d.belajar.ke === 'phd'; }), 'sambung PhD bermula');
  semak(/PhD \(sedang belajar\)/.test(await pg.textContent('#panel-profil')), 'meter pengajian');
  if (process.env.SKRIN) { await (await pg.$('.pdk-kad')).screenshot({ path: process.env.SKRIN }).catch(() => {}); }
  await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(500);
  const tk = await pg.evaluate(() => document.body.textContent);
  semak(/Datuk · Ketua Sayap Pusat/.test(tk) && /Tun · bekas/.test(tk) && /Gelaran Negeri/.test(tk) && /Dato' Seri/.test(tk), 'kad Anugerah & Gelaran (Datuk, Tun, negeri): ' + tk.slice(tk.indexOf('Gelaran Kurniaan'), tk.indexOf('Gelaran Kurniaan') + 400).replace(/\n/g, ' | '));
  semak(/^Dato' Ahmad/.test(await pg.textContent('#p-nama')), 'awalan negeri menggantikan Datuk (Sarjana: tanpa Dr.) (' + await pg.textContent('#p-nama') + ')');
  if (process.env.SKRIN2) { await pg.click('text=Jawatan & Aset Luar').catch(() => {}); await pg.waitForTimeout(300); const k = await pg.$('xpath=//section[h2[contains(., "Anugerah")]]'); if (k) { await k.screenshot({ path: process.env.SKRIN2 }).catch(() => {}); } }
  const kutip = (sel) => pg.evaluate(([src, s]) => { const re = new RegExp(src, 'i'), out = []; document.querySelectorAll(s).forEach((k) => { const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t); } } }); return out; }, [BM.source, sel]);
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(500);
  await pg.evaluate(() => { document.querySelectorAll('section.card').forEach((s) => { if (/Award|Anugerah/.test(s.querySelector('h2') ? s.querySelector('h2').textContent : '')) { s.classList.add('uji-gelaran'); } }); });
  semak(await pg.$$eval('.uji-gelaran', (l) => l.length) === 1, 'kad Gelaran ditemui dalam EN');
  const b1 = await kutip('.uji-gelaran');
  semak(b1.length === 0, 'EN: tiada BM bocor dalam kad Gelaran:\n    ' + b1.slice(0, 15).join('\n    '));
  await pg.click('[data-tab="profil"]').catch(() => {}); await pg.waitForTimeout(500);
  const b2 = await kutip('.pdk-kad');
  semak(b2.length === 0, 'EN: tiada BM bocor dalam kad Pendidikan:\n    ' + b2.slice(0, 15).join('\n    '));
  // borang pendaftaran EN
  const pg2 = await (await br.newContext({ viewport: { width: 420, height: 900 } })).newPage();
  await pg2.route('**/*', (rt) => { if (rt.request().url().startsWith(base)) { rt.continue(); } else { rt.abort(); } });
  await pg2.goto(base + '/index.html'); await pg2.waitForTimeout(1000); await pg2.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg2.click('text=New game').catch(() => pg2.click('text=Permainan baharu')); await pg2.waitForTimeout(1200);
  const lbl = await pg2.evaluate(() => { const f = document.getElementById('s-pendidikan').closest('.field'); return f.innerText; });
  semak(!new RegExp(BM.source, 'i').test(lbl) && /Highest education/.test(lbl) && /Bachelor/.test(lbl), 'EN: medan pendidikan (' + lbl.replace(/\n/g, ' | ') + ')');
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian Gelaran & Pendidikan lulus.'); process.exit(gagal.length ? 1 : 0);
})();
