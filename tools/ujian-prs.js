#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-prs.js   (v10.0)
   Ujian pelayar (Playwright): daftar sebagai ahli PRS, dashboard dibuka dengan penjenamaan PBB dan peta Sarawak.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-pbb.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
const exe = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean).filter((c) => fs.existsSync(c))[0];
if (!PW || !exe) { console.log('Playwright/Chromium tiada: ujian PRS dilangkau.'); process.exit(0); }
const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.webmanifest': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' }); r.end(fs.readFileSync(f)); });
const gagal = []; const semak = (ok, msg) => { if (!ok) { gagal.push(msg); } };
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const br = await PW.chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const pg = await (await br.newContext({ viewport: { width: 420, height: 900 } })).newPage();
  const ralat = []; pg.on('pageerror', (e) => ralat.push(e.message));
  await pg.route('**/*', (rt) => { if (rt.request().url().startsWith(base)) { rt.continue(); } else { rt.abort(); } });
  await pg.goto(base + '/index.html'); await pg.waitForTimeout(1200);
  await pg.click('text=Permainan baharu'); await pg.waitForTimeout(1000);
  await pg.check('input[name=parti][value=PRS]'); await pg.waitForTimeout(2500);
  semak((await pg.getAttribute('.brand__img', 'src')).indexOf('logo-prs') >= 0, 'logo PRS pada skrin pendaftaran');
  semak(/PRS/.test(await pg.textContent('.brand')) && !/UMNO/.test(await pg.textContent('.brand')), 'jenama PRS');
  semak((await pg.$$eval('#s-bahagian option', (o) => o.length)) === 35, '34 Bahagian (DUN kawasan operasi PRS)');
  await pg.selectOption('#s-bahagian', { index: 3 }); await pg.waitForTimeout(300);
  semak((await pg.$$eval('#s-cawangan option', (o) => o.length)) > 2, 'cawangan (DM) dimuatkan');
  await pg.selectOption('#s-cawangan', { index: 2 });
  await pg.fill('#f-nama', 'Awang Uji'); await pg.fill('#f-umur', '25'); await pg.check('input[name=jantina][value=P]').catch(() => pg.check('input[name=jantina] >> nth=1'));
  const sy = await pg.$$eval('#sayap-grid .sy', (l) => l.map((x) => x.dataset.kod + ':' + (getComputedStyle(x).display === 'none' ? 'x' : 'o') + (x.querySelector('input').disabled ? '-' : '+')).join());
  semak(/puteri:x/.test(sy) && /wanita:o\+/.test(sy), 'sayap PRS: tiada Puteri, Wanita dibuka (' + sy + ')');
  await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } }); await pg.waitForTimeout(400);
  semak((await pg.getAttribute('.brand__img', 'src')).indexOf('logo-prs') >= 0, 'logo PRS pada dashboard');
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(400); }
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } }); await pg.waitForTimeout(400);
  for (const t of ['tindakan', 'profil', 'pemilihan', 'mesyuarat']) { await pg.click('[data-tab="' + t + '"]'); await pg.waitForTimeout(400); }
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(400);
  const pf = await pg.textContent('#panel-profil');
  semak(/Kerusi DUN Anda/.test(pf), 'kad Kerusi DUN Anda (PRS)');
  semak(/Pengaruh dalam GPS/.test(pf) && /Kuota kerusi DUN PRS/.test(pf) && /11 \/ 82/.test(pf), 'kad Pengaruh dalam GPS: kuota 11 / 82');
  semak(!/Imbangan Bumiputera|Rundingan Kerusi GPS/.test(pf), 'tiada kad blok / runding Presiden PBB pada PRS');
  semak(/Pindah Cawangan/.test(pf), 'kad Pindah Cawangan');
  await pg.click('[data-act="gps-lobi"]'); await pg.waitForTimeout(600);
  semak(/Pengaruh GPS\s*4\d|Pengaruh GPS\s*48/.test(await pg.textContent('#panel-profil')) || /48\/100/.test(await pg.textContent('#panel-profil')), 'Lobi Majlis GPS menaikkan Pengaruh GPS');
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(600);
  const en = await pg.textContent('#panel-profil'), tst = await pg.evaluate(() => (document.querySelector('.toast-stack') || { innerText: '' }).innerText);
  semak(/Influence in GPS/.test(en) && /state seat quota/i.test(en), 'EN: kad Pengaruh dalam GPS diterjemah');
  semak(!/Pengaruh|kuota|rundingan|Lobi Majlis|ialah parti rakan|Tiada Premier|di luar|dalam kuota/i.test(en + ' ' + tst), 'EN: tiada teks BM bocor pada kad PRS (' + ((en + ' ' + tst).match(/.{15}(Pengaruh|kuota|rundingan|Lobi Majlis|ialah parti rakan|Tiada Premier|di luar|dalam kuota).{15}/i) || [''])[0] + ')');
  semak(!/\bPBB\b/.test(en), 'EN: tiada perkataan PBB pada tab Profil PRS');
  await pg.evaluate(() => MyPolitikI18n.setLanguage('MS')).catch(() => {}); await pg.waitForTimeout(400);
  await pg.click('[data-tab="peta"]'); await pg.waitForTimeout(4000);
  semak((await pg.$$eval('#peta-host svg path', (p) => p.length)) === 82, 'peta DUN Sarawak (82 kawasan)');
  semak(!/UMNO/.test(await pg.evaluate(() => document.body.innerText)), 'tiada perkataan UMNO tertinggal dalam dashboard PRS');
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian PRS lulus.'); process.exit(gagal.length ? 1 : 0);
})();
