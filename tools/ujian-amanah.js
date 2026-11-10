#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-pkr.js   (v13.37)
   Ujian pelayar (Playwright): cip Amanah dalam panel PH, daftar Amanah (Selangor, WARDA), istilah (Kawasan, JPN, AWAN), kad Amanah
   (Naratif Rahmah, Konvensyen Negeri, Mesyuarat JPN 44 orang), dan EN tanpa teks BM bocor. Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada.
   Guna: node tools/ujian-amanah.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian Amanah dilangkau.'); process.exit(0); }
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
  await pg.click('[data-gab="PH"]'); await pg.waitForTimeout(300);
  const cip = await pg.$$eval('#gab-ph .poster__chip[data-parti]', (l) => l.map((x) => x.getAttribute('data-parti')).join(','));
  semak(cip === 'PKR,DAP,AMANAH', 'cip PH: ' + cip); semak(!(await pg.$('#gab-ph .gab__rakan')), 'Amanah bukan lagi NPC');
  await pg.click('#gab-ph .poster__chip[data-parti="AMANAH"]'); await pg.waitForTimeout(2500);
  semak(await pg.$eval('#s-parti', (x) => x.value) === 'AMANAH', 'cip Amanah terus ke pendaftaran');
  semak(/Perlembagaan 2022/.test(await pg.textContent('#h-parti')), 'nota Amanah');
  const negeri = await pg.$$eval('#s-negeri option', (o) => o.map((x) => x.textContent));
  semak(negeri.some((n) => /Selangor/.test(n)) && negeri.some((n) => /Sabah/.test(n)) && !negeri.some((n) => /Sarawak/.test(n)), 'negeri kecuali Sarawak (' + negeri.length + ')');
  await pg.selectOption('#s-negeri', { label: negeri.find((n) => /Selangor/.test(n)) }); await pg.waitForTimeout(400);
  const ops = await pg.$$eval('#s-bahagian option', (o) => o.map((x) => x.textContent));
  await pg.selectOption('#s-bahagian', { index: Math.max(1, ops.findIndex((x) => /Shah Alam/.test(x))) }); await pg.waitForTimeout(300);
  semak(/kedudukan/.test(await pg.textContent('#h-parti')), 'notis kuota Amanah');
  await pg.selectOption('#s-dun', { index: 1 }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-cawangan', { index: 1 }); await pg.waitForTimeout(300);
  await pg.fill('#f-nama', 'Nur Aisyah'); await pg.fill('#f-umur', '26'); await pg.check('input[name=jantina][value=P]').catch(() => pg.check('input[name=jantina] >> nth=1'));
  await pg.waitForTimeout(300);
  const sy = await pg.evaluate(() => ['puteri', 'wanita'].map((k) => { const b = document.querySelector('#sayap-grid .sy[data-kod="' + k + '"] .sy__nama'); return b ? b.textContent : ''; }).join('|'));
  semak(/WARDA\|AWAN/.test(sy), 'sayap WARDA / AWAN: ' + sy);
  await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  await pg.getByText('Terus main').click().catch(() => {}); await pg.waitForTimeout(300);
  semak((await pg.getAttribute('.brand__img', 'src')).indexOf('logo-amanah') >= 0, 'logo Amanah pada dashboard');
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { ap: 10, myr: 20000, tahun: 2028, bulan: 9, reputasi: 70, jawatan: 'Ketua Bahagian', jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: 2028 }] } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  const pf = await pg.textContent('.amn-kad');
  semak(/Naratif Rahmah/.test(pf) && /Konvensyen Negeri/.test(pf) && /Mesyuarat JPN/.test(pf) && /PKR/.test(pf) && /DAP/.test(pf), 'kad Amanah: ' + pf.slice(0, 120));
  await pg.click('[data-amn="ceramah"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => MyPolitikAmanah.naratif(MyPolitikSave.loadPlayer())) === 54, 'Ceramah: Naratif 50 -> 54');
  await pg.click('[data-amn="negeri"][data-kod="pengerusi"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => MyPolitikSave.loadPlayer().amanah.negeri.sasaran) === 'pengerusi', 'bertanding Pengerusi Negeri');
  const teks = await pg.evaluate(() => document.body.innerText);
  semak(!/\bUMNO\b/.test(teks), 'tiada perkataan UMNO');
  semak(!/Majlis Kerja Tertinggi|\bMKT\b|Perhimpunan Agung|Ketua Bahagian|Ketua Puteri/.test(teks), 'tiada MKT / Perhimpunan Agung / Ketua Bahagian / Puteri');
  // Mesyuarat JPN (bulan 12)
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { bulan: 12, ap: 20, myr: 30000, jawatanList: p.jawatanList.concat([{ kod: 'ahli_mkt', jawatan: 'Ahli MKT', peringkat: 'pusat', kumpulan: 'utama', pangkat: 8, tahun: 2028 }]) } }); MyPolitikAmanah.prosesBulan(); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(400);
  await pg.click('[data-amn="sasaran"][data-kod="presiden"]'); await pg.waitForTimeout(300);
  await pg.click('[data-amn="lobi"]'); await pg.waitForTimeout(300);
  semak(await pg.evaluate(() => { const m = MyPolitikAmanah.mesyuarat(MyPolitikSave.loadPlayer()); return m && m.sasaran === 'presiden' && m.lobiBil === 1; }), 'Mesyuarat JPN: sasaran Presiden dan lobi');
  if (process.env.SKRIN) { await pg.addStyleTag({ content: '.toast-stack,.toast,#mpa-bar,.tut-fab{display:none!important}' }); const k = await pg.$('.amn-kad'); if (k) { await k.screenshot({ path: process.env.SKRIN }).catch(() => {}); } }
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  const bocorSemua = [];
  for (const tab of ['profil', 'tindakan', 'pemilihan', 'mesyuarat']) {
    await pg.click('[data-tab="' + tab + '"]').catch(() => {}); await pg.waitForTimeout(500);
    const b = await pg.evaluate(([src, tb]) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('#panel-' + tb); if (!k) { return ['(tiada panel ' + tb + ')']; } const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); const pe = n.parentElement; if (t && re.test(t) && pe && pe.offsetParent !== null && !pe.closest('select')) { out.push(t.slice(0, 120)); } } return out; }, [BM.source, tab]);
    b.forEach((x) => bocorSemua.push(tab + ': ' + x));
  }
  if (process.env.SENARAI) { console.log(bocorSemua.join('\n')); }
  semak(bocorSemua.length === 0, 'EN: tiada BM bocor dalam tab dashboard Amanah (' + bocorSemua.length + '):\n    ' + bocorSemua.slice(0, 30).join('\n    '));
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian Amanah lulus.'); process.exit(gagal.length ? 1 : 0);
})();
