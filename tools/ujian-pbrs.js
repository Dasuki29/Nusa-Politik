#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-pbrs.js   (v13.9)
   Ujian pelayar (Playwright): daftar sebagai ahli PBRS melalui panel BN, Sabah sahaja, dashboard dengan penjenamaan PBRS, kad PBRS
   (Kesetiaan BN, Muhibah GRS, kuota DUN), banner PRN Sabah, dan EN tanpa teks BM bocor dalam kad PBRS.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-mic.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian PBRS dilangkau.'); process.exit(0); }
const exe = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean).filter((c) => fs.existsSync(c))[0];
const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff', '.webmanifest': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' }); r.end(fs.readFileSync(f)); });
const gagal = []; const semak = (ok, msg) => { if (!ok) { gagal.push(msg); } };
const BM = /\b(yang|dan|untuk|dengan|anda|kepada|telah|akan|tidak|sudah|ialah|dalam|pada|atau|boleh|mesti|setiap|bulan|tahun|sebagai|daripada|kawasan|sokongan|ahli|perwakilan|kerusi|tiada|perlu|pilih|dana|lantikan|keahlian|rundingan|kuota|kesetiaan|muhibah|bertanding|kempen)\b/i;
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const br = await PW.chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
  const pg = await (await br.newContext({ viewport: { width: 420, height: 900 } })).newPage();
  const ralat = []; pg.on('pageerror', (e) => ralat.push(e.message));
  await pg.route('**/*', (rt) => { if (rt.request().url().startsWith(base)) { rt.continue(); } else { rt.abort(); } });
  await pg.goto(base + '/index.html'); await pg.waitForTimeout(1200);
  await pg.click('[data-gab="BN"]'); await pg.waitForTimeout(200);
  semak(await pg.$$eval('#gab-bn .poster__chip', (l) => l.map((x) => x.dataset.parti).join()) === 'UMNO,MCA,MIC,PPP,PBRS', 'panel BN: 5 parti');
  await pg.click('.poster__chip[data-parti="PBRS"]'); await pg.waitForTimeout(2500);
  semak(await pg.$eval('#s-parti', (x) => x.value) === 'PBRS', 'pendaftaran PBRS dipilih');
  semak(/pedalaman Sabah/.test(await pg.textContent('#h-parti')), 'nota PBRS');
  const ng = await pg.$$eval('#s-negeri option', (o) => o.map((x) => x.textContent).filter((t) => !/Pilih/.test(t)));
  semak(ng.length === 1 && /Sabah/.test(ng[0]), 'negeri Sabah sahaja (' + ng.join('|') + ')');
  await pg.selectOption('#s-negeri', { index: 1 }); await pg.waitForTimeout(400);
  const bhg = await pg.$$eval('#s-bahagian option', (o) => o.map((x) => x.textContent));
  semak(bhg.length === 8, '7 Bahagian (' + (bhg.length - 1) + ')');
  const iP = bhg.findIndex((b) => /Pensiangan/.test(b)); await pg.selectOption('#s-bahagian', { index: iP }); await pg.waitForTimeout(300);
  semak(/dalam kuota kerusi Parlimen PBRS/.test(await pg.textContent('#h-parti')), 'nota kuota Pensiangan');
  const dn = await pg.$$eval('#s-dun option', (o) => o.map((x) => x.textContent)); await pg.selectOption('#s-dun', { index: dn.findIndex((d) => /Sook/.test(d)) }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-cawangan', { index: 1 }); await pg.waitForTimeout(300);
  await pg.fill('#f-nama', 'Arthur Uji'); await pg.fill('#f-umur', '30'); await pg.check('input[name=jantina][value=P]').catch(() => pg.check('input[name=jantina] >> nth=1'));
  await pg.waitForTimeout(300);
  const syN = await pg.$$eval('#sayap-grid .sy', (l) => l.filter((x) => getComputedStyle(x).display !== 'none').map((x) => x.dataset.kod).join()); semak(syN.indexOf('puteri') < 0, 'tiada Puteri untuk PBRS (' + syN + ')');
  await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  semak((await pg.getAttribute('.brand__img', 'src')).indexOf('logo-pbrs') >= 0, 'logo PBRS pada dashboard');
  semak(await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); return p.parti === 'PBRS' && /Sabah/i.test(p.negeri) && MyPolitikPRU.getPRU(p).jenisPBB === 'PRN'; }), 'profil PBRS, Sabah, PRN Sabah');
  semak(!/\bUMNO\b/.test(await pg.evaluate(() => document.body.innerText)), 'tiada perkataan UMNO dalam dashboard PBRS');
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { jawatan: 'Ketua Bahagian', jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: 2026 }], ap: 20, myr: 50000, ip: 500 } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  const pf = await pg.textContent('#panel-profil');
  semak(/PBRS: Dua Gabungan/.test(pf) && /Kesetiaan BN/.test(pf) && /Muhibah GRS/.test(pf) && /Sook, Bingkor|Bingkor, Sook/.test(pf), 'kad PBRS');
  await pg.click('[data-pbrs="muhibah"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => MyPolitikPBRS.meter(MyPolitikSave.loadPlayer()).muhibahGRS === 51), 'Majlis Muhibah GRS');
  await pg.click('[data-tab="pemilihan"]').catch(() => {}); await pg.waitForTimeout(400);
  semak(/PRN Sabah: November 2030/.test(await pg.evaluate(() => document.body.innerText)), 'banner PRN Sabah November 2030');
  if (process.env.SKRIN) { await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(300); await (await pg.$('.pbrs-kad')).screenshot({ path: process.env.SKRIN }).catch(() => {}); }
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  await pg.click('[data-tab="profil"]').catch(() => {}); await pg.waitForTimeout(500);
  const bocor = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('.pbrs-kad'); if (!k) { return ['(tiada kad)']; } const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.nodeValue.trim(); if (t && re.test(t)) { out.push(t.slice(0, 90)); } } return out; }, BM.source);
  semak(bocor.length === 0, 'EN: tiada BM bocor dalam kad PBRS:\n    ' + bocor.slice(0, 15).join('\n    '));
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian PBRS lulus.'); process.exit(gagal.length ? 1 : 0);
})();
