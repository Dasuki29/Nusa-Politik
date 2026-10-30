#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-ppp.js   (v13.8)
   Ujian pelayar (Playwright): daftar sebagai ahli PPP melalui panel BN (sayap Putera), dashboard dengan penjenamaan PPP, kad PPP
   (Pengaruh dalam BN, lobi, rundingan kerusi, krisis), tiada Perlembagaan UMNO, dan EN tanpa teks BM bocor dalam kad PPP.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-mic.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian PPP dilangkau.'); process.exit(0); }
const exe = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean).filter((c) => fs.existsSync(c))[0];
const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff', '.webmanifest': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' }); r.end(fs.readFileSync(f)); });
const gagal = []; const semak = (ok, msg) => { if (!ok) { gagal.push(msg); } };
const BM = /\b(yang|dan|untuk|dengan|anda|kepada|telah|akan|tidak|sudah|ialah|dalam|pada|atau|boleh|mesti|setiap|bulan|tahun|sebagai|daripada|kawasan|sokongan|ahli|perwakilan|kerusi|tiada|perlu|pilih|dana|lantikan|keahlian|pengaruh|rundingan|peluang|diberi|jentera)\b/i;
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const br = await PW.chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
  const pg = await (await br.newContext({ viewport: { width: 420, height: 900 } })).newPage();
  const ralat = []; pg.on('pageerror', (e) => ralat.push(e.message));
  await pg.route('**/*', (rt) => { if (rt.request().url().startsWith(base)) { rt.continue(); } else { rt.abort(); } });
  await pg.goto(base + '/index.html'); await pg.waitForTimeout(1200);
  await pg.click('[data-gab="BN"]'); await pg.waitForTimeout(200);
  semak(await pg.$$eval('#gab-bn .poster__chip[data-parti]', (l) => l.map((x) => x.dataset.parti).join()) === 'UMNO,MCA,MIC,PPP,PBRS', 'panel BN: UMNO, MCA, MIC, PPP, PBRS');
  await pg.click('.poster__chip[data-parti="PPP"]'); await pg.waitForTimeout(2500);
  semak(await pg.$eval('#s-parti', (x) => x.value) === 'PPP', 'pendaftaran PPP dipilih');
  semak(/berbilang kaum/.test(await pg.textContent('#h-parti')), 'nota PPP pada skrin pendaftaran');
  await pg.selectOption('#s-negeri', { label: 'Perak' }); await pg.waitForTimeout(400);
  const bhg = await pg.$$eval('#s-bahagian option', (o) => o.map((x) => x.textContent));
  semak(bhg.length === 11, 'Perak: 10 kawasan campuran (' + (bhg.length - 1) + ')');
  const iIB = bhg.findIndex((b) => /Ipoh Barat/.test(b)); semak(iIB > 0, 'Ipoh Barat tersenarai');
  await pg.selectOption('#s-bahagian', { index: iIB }); await pg.waitForTimeout(300);
  semak(/Kawasan campuran: Bumiputera/.test(await pg.textContent('#h-parti')), 'nota kawasan campuran');
  await pg.selectOption('#s-dun', { index: 1 }); await pg.waitForTimeout(300); await pg.selectOption('#s-cawangan', { index: 1 }); await pg.waitForTimeout(300);
  await pg.fill('#f-nama', 'Loga Uji'); await pg.fill('#f-umur', '25'); await pg.check('input[name=jantina][value=L]').catch(() => pg.check('input[name=jantina] >> nth=0'));
  await pg.waitForTimeout(300);
  await pg.click('#sayap-grid .sy[data-kod="putera"]'); await pg.waitForTimeout(200);
  await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  semak((await pg.getAttribute('.brand__img', 'src')).indexOf('logo-ppp') >= 0, 'logo PPP pada dashboard');
  semak(await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); return p.parti === 'PPP' && p.sayap === 'putera'; }), 'profil PPP, sayap Putera');
  semak(!/\bUMNO\b/.test(await pg.evaluate(() => document.body.innerText)), 'tiada perkataan UMNO dalam dashboard PPP');
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { jawatan: 'Ketua Bahagian', jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: 2026 }], ap: 20, myr: 50000, ip: 500 } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  const pf = await pg.textContent('#panel-profil');
  semak(/PPP: Tuntut Kerusi BN/.test(pf) && /Pengaruh dalam BN/.test(pf) && /Rundingan kerusi PRU/.test(pf), 'kad PPP');
  await pg.click('[data-ppp="lobi"]'); await pg.waitForTimeout(500);
  semak(await pg.evaluate(() => MyPolitikPPP.pengaruh(MyPolitikSave.loadPlayer())) === 26, 'lobi menaikkan Pengaruh');
  // krisis kepimpinan
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(), m = p.ppp; m.krisis = { tahun: 2026, i: 2026 * 12 + 1, sehingga: 2026 * 12 + 3, pilihan: null }; MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { ppp: m } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(400);
  await pg.click('[data-ppp="krisis"][data-pilih-ppp="berkecuali"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => MyPolitikSave.loadPlayer().ppp.krisis.pilihan === 'berkecuali'), 'pendirian krisis direkodkan');
  semak(await pg.evaluate(() => [...document.querySelectorAll('[data-perlembagaan]')].every((x) => getComputedStyle(x).display === 'none')), 'tiada butang Perlembagaan untuk PPP');
  if (process.env.SKRIN) { await (await pg.$('.ppp-kad')).screenshot({ path: process.env.SKRIN }).catch(() => {}); }
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  await pg.click('[data-tab="profil"]').catch(() => {}); await pg.waitForTimeout(500);
  const bocor = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('.ppp-kad'); if (!k) { return ['(tiada kad)']; } const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.nodeValue.trim(); if (t && re.test(t)) { out.push(t.slice(0, 90)); } } return out; }, BM.source);
  semak(bocor.length === 0, 'EN: tiada BM bocor dalam kad PPP:\n    ' + bocor.slice(0, 15).join('\n    '));
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian PPP lulus.'); process.exit(gagal.length ? 1 : 0);
})();
