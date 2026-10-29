#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-mca.js   (v13.1)
   Ujian pelayar (Playwright): daftar sebagai ahli MCA (Semenanjung), dashboard dengan penjenamaan MCA, kad MCA,
   Jelajah Bahagian, Perlembagaan MCA, peta, dan EN tanpa teks BM bocor dalam kad MCA.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-mca.js
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
  await pg.selectOption('#s-parti', 'MCA'); await pg.waitForTimeout(2500);
  semak(/keturunan Cina/.test(await pg.textContent('#h-parti')), 'nota keahlian MCA pada skrin pendaftaran');
  const negeri = await pg.$$eval('#s-negeri option', (o) => o.map((x) => x.textContent));
  semak(negeri.length === 10 && negeri.some((n) => /Pulau Pinang/.test(n)), '9 negeri Semenanjung (' + negeri.length + ')');
  await pg.selectOption('#s-negeri', { label: 'Pulau Pinang' }); await pg.waitForTimeout(400);
  const bhg = await pg.$$eval('#s-bahagian option', (o) => o.map((x) => x.textContent));
  semak(bhg.some((b) => /Bukit Mertajam/.test(b)), 'Bahagian Bukit Mertajam tersenarai');
  await pg.selectOption('#s-bahagian', { index: 4 }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-dun', { index: 1 }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-cawangan', { index: 1 }); await pg.waitForTimeout(300);
  await pg.fill('#f-nama', 'Tan Wei Ming'); await pg.fill('#f-umur', '30'); await pg.check('input[name=jantina][value=P]').catch(() => pg.check('input[name=jantina] >> nth=1'));
  const sy = await pg.$$eval('#sayap-grid .sy', (l) => l.map((x) => x.dataset.kod + ':' + (getComputedStyle(x).display === 'none' ? 'x' : 'o')).join());
  semak(/puteri:x/.test(sy), 'MCA tiada Puteri (' + sy + ')');
  await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  semak((await pg.getAttribute('.brand__img', 'src')).indexOf('logo-mca') >= 0, 'logo MCA pada dashboard');
  semak(await pg.evaluate(() => MyPolitikSave.loadPlayer().parti === 'MCA'), 'profil parti MCA');
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { jawatan: 'Ketua Bahagian', jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: 2026 }], ap: 20, myr: 50000, ip: 400 } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  const pf = await pg.textContent('#panel-profil');
  semak(/MCA: Parti/.test(pf) && /kuota MCA/.test(pf) && /perwakilan Bahagian/.test(pf), 'kad MCA (kuota, Pemilihan Pusat)');
  semak(/Pengerusi Bahagian/.test(pf) && !/Ketua Bahagian/.test(pf), 'istilah Pengerusi Bahagian');
  semak(!/\bUMNO\b/.test(await pg.evaluate(() => document.body.innerText)), 'tiada perkataan UMNO dalam dashboard MCA');
  const sebelum = await pg.evaluate(() => MyPolitikMCA.ringkasPusat(MyPolitikSave.loadPlayer()).purata);
  await pg.click('[data-mca="jelajah"]'); await pg.waitForTimeout(500);
  semak(await pg.evaluate(() => MyPolitikMCA.ringkasPusat(MyPolitikSave.loadPlayer()).purata) > sebelum, 'Jelajah Bahagian menaikkan sokongan perwakilan');
  await pg.click('[data-mca="mohon"] >> nth=0'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => MyPolitikSave.loadPlayer().mca.mohonBulan > 0), 'permohonan lantikan direkod');
  await pg.click('#btn-menu'); await pg.waitForTimeout(300); await pg.click('[data-perlembagaan]'); await pg.waitForTimeout(400);
  const plb = await pg.textContent('.plb');
  semak(/Perkara 167/.test(plb) && /Perlembagaan MCA/.test(plb), 'Perlembagaan MCA (Perkara)');
  await pg.click('.plb__tutup'); await pg.keyboard.press('Escape').catch(() => {}); await pg.waitForTimeout(300);
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  await pg.click('[data-tab="profil"]').catch(() => {}); await pg.waitForTimeout(500);
  const bocor = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('.mca-kad'); if (!k) { return ['(tiada kad)']; } const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.nodeValue.trim(); if (t && re.test(t)) { out.push(t.slice(0, 90)); } } return out; }, BM.source);
  semak(bocor.length === 0, 'EN: tiada BM bocor dalam kad MCA:\n    ' + bocor.slice(0, 15).join('\n    '));
  await pg.evaluate(() => MyPolitikI18n.setLanguage('MS')).catch(() => {}); await pg.waitForTimeout(300);
  await pg.click('[data-tab="peta"]'); await pg.waitForTimeout(4500);
  semak((await pg.$$eval('#peta-host svg path', (p) => p.length)) > 10, 'peta dipaparkan');
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian MCA lulus.'); process.exit(gagal.length ? 1 : 0);
})();
