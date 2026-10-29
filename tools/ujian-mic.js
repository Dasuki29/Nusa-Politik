#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-mic.js   (v13.3)
   Ujian pelayar (Playwright): daftar sebagai ahli MIC (Semenanjung) dalam sayap Putera, dashboard dengan penjenamaan MIC,
   kad MIC, Rangkaian Pengerusi Cawangan, pegawai Cawangan, Perlembagaan MIC, peta, dan EN tanpa teks BM bocor dalam kad MIC.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-mic.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian MCA dilangkau.'); process.exit(0); }
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
  await pg.selectOption('#s-parti', 'MIC'); await pg.waitForTimeout(2500);
  semak(/keturunan India/.test(await pg.textContent('#h-parti')), 'nota keahlian MIC pada skrin pendaftaran');
  await pg.selectOption('#s-negeri', { label: 'Perak' }); await pg.waitForTimeout(400);
  const bhg = await pg.$$eval('#s-bahagian option', (o) => o.map((x) => x.textContent));
  const iIB = bhg.findIndex((b) => /Ipoh Barat/.test(b)); semak(iIB > 0, 'Bahagian Ipoh Barat tersenarai');
  await pg.selectOption('#s-bahagian', { index: iIB }); await pg.waitForTimeout(300);
  semak(/✅ Bahagian ini dalam kuota kerusi Parlimen MIC/.test(await pg.textContent('#h-parti')), 'notis dalam kuota MIC');
  await pg.selectOption('#s-dun', { index: 1 }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-cawangan', { index: 1 }); await pg.waitForTimeout(300);
  await pg.fill('#f-nama', 'Ravi Kumar'); await pg.fill('#f-umur', '25'); await pg.check('input[name=jantina][value=L]').catch(() => pg.check('input[name=jantina] >> nth=0'));
  await pg.waitForTimeout(300);
  const sy = await pg.$$eval('#sayap-grid .sy', (l) => l.map((x) => x.dataset.kod + ':' + (getComputedStyle(x).display === 'none' ? 'x' : 'o') + (x.querySelector('input').disabled ? 'd' : 'e')).join());
  semak(/putera:oe/.test(sy) && /puteri:o/.test(sy), 'MIC ada Putera (boleh dipilih) dan Puteri (' + sy + ')');
  await pg.click('#sayap-grid .sy[data-kod="putera"]'); await pg.waitForTimeout(200);
  await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  semak((await pg.getAttribute('.brand__img', 'src')).indexOf('logo-mic') >= 0, 'logo MIC pada dashboard');
  semak(await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); return p.parti === 'MIC' && p.sayap === 'putera'; }), 'profil parti MIC, sayap Putera');
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { tahun: 2027, jawatan: 'Ketua Cawangan', jawatanList: [{ kod: 'ketua_cawangan', jawatan: 'Ketua Cawangan', peringkat: 'cawangan', kumpulan: 'utama', pangkat: 3, tahun: 2027 }], ap: 20, myr: 50000, ip: 400 } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  const pf = await pg.textContent('#panel-profil');
  semak(/MIC: Parti/.test(pf) && /kuota MIC/.test(pf) && /pegawai Cawangan/.test(pf) && /Kongres Negeri/.test(pf), 'kad MIC (kuota, pegawai Cawangan, Kongres Negeri)');
  semak(/Pengerusi Cawangan/.test(pf) && !/Ketua Cawangan/.test(pf), 'istilah Pengerusi Cawangan');
  semak(!/\bUMNO\b/.test(await pg.evaluate(() => document.body.innerText)), 'tiada perkataan UMNO dalam dashboard MIC');
  const kodJ = await pg.$eval('[data-mic-bhg]', (x) => x.value);
  const sebelum = await pg.evaluate((k) => MyPolitikMIC.sokonganBahagian(MyPolitikSave.loadPlayer())[k], kodJ);
  await pg.click('[data-mic="jelajah"]'); await pg.waitForTimeout(500);
  semak(await pg.evaluate((k) => MyPolitikMIC.sokonganBahagian(MyPolitikSave.loadPlayer())[k], kodJ) > sebelum, 'Rangkaian Pengerusi Cawangan menaikkan sokongan');
  await pg.click('[data-mic="pegawai"] >> nth=0'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => !!MyPolitikSave.loadPlayer().mic.pegawai), 'pegawai Cawangan dilantik');
  await pg.click('#btn-menu'); await pg.waitForTimeout(300); await pg.click('[data-perlembagaan]'); await pg.waitForTimeout(400);
  const plb = await pg.textContent('.plb');
  semak(/Perkara 58/.test(plb) && /Perlembagaan MIC/.test(plb) && /Putera/.test(plb), 'Perlembagaan MIC (Perkara)');
  await pg.click('.plb__tutup'); await pg.keyboard.press('Escape').catch(() => {}); await pg.waitForTimeout(300);
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  await pg.click('[data-tab="profil"]').catch(() => {}); await pg.waitForTimeout(500);
  const bocor = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('.mic-kad'); if (!k) { return ['(tiada kad)']; } const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.nodeValue.trim(); if (t && re.test(t)) { out.push(t.slice(0, 90)); } } k.querySelectorAll('[title]').forEach((e) => { if (re.test(e.title)) { out.push('title: ' + e.title.slice(0, 80)); } }); return out; }, BM.source);
  semak(bocor.length === 0, 'EN: tiada BM bocor dalam kad MIC:\n    ' + bocor.slice(0, 15).join('\n    '));
  await pg.evaluate(() => MyPolitikI18n.setLanguage('MS')).catch(() => {}); await pg.waitForTimeout(300);
  await pg.click('[data-tab="peta"]'); await pg.waitForTimeout(4500);
  semak((await pg.$$eval('#peta-host svg path', (p) => p.length)) > 10, 'peta dipaparkan');
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian MIC lulus.'); process.exit(gagal.length ? 1 : 0);
})();
