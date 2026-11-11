#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-bersatu.js   (v13.89)
   Ujian pelayar (Playwright): cip BERSATU dalam panel PN, daftar BERSATU (Ahli Biasa / Bersekutu), istilah MPT / Armada / Srikandi, kad BERSATU,
   Jelajah Bahagian, rundingan PAS, sekatan jawatan, dan EN tanpa teks BM bocor. Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada.
   Guna: node tools/ujian-bersatu.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian BERSATU dilangkau.'); process.exit(0); }
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
  await pg.click('[data-gab="PN"]'); await pg.waitForTimeout(300);
  const cip = await pg.$$eval('#gab-pn .poster__chip[data-parti]', (l) => l.map((x) => x.getAttribute('data-parti')).join(','));
  semak(cip === 'PAS,BERSATU', 'cip PN: ' + cip); semak(!/Bersatu/.test(await pg.textContent('#gab-pn .gab__rakan')), 'BERSATU bukan lagi NPC');
  await pg.click('#gab-pn .poster__chip[data-parti="BERSATU"]'); await pg.waitForTimeout(2500);
  semak(await pg.$eval('#s-parti', (x) => x.value) === 'BERSATU', 'cip BERSATU terus ke pendaftaran');
  semak(/Perlembagaan BERSATU/.test(await pg.textContent('#h-parti')), 'nota BERSATU');
  semak(!(await pg.$eval('#f-bersatu-jenis', (x) => x.hidden)), 'pilihan Ahli Biasa / Ahli Bersekutu');
  const negeri = await pg.$$eval('#s-negeri option', (o) => o.map((x) => x.textContent));
  semak(negeri.some((n) => /Johor/.test(n)) && negeri.some((n) => /Sabah/.test(n)) && !negeri.some((n) => /Sarawak/.test(n)), 'negeri kecuali Sarawak (' + negeri.length + ')');
  await pg.selectOption('#s-negeri', { label: negeri.find((n) => /Johor/.test(n)) }); await pg.waitForTimeout(400);
  await pg.selectOption('#s-bahagian', { index: 1 }); await pg.waitForTimeout(300);
  semak(/kuota BERSATU/.test(await pg.textContent('#h-parti')), 'notis kuota BERSATU');
  await pg.selectOption('#s-dun', { index: 1 }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-cawangan', { index: 1 }); await pg.waitForTimeout(300);
  await pg.fill('#f-nama', 'Nur Aisyah'); await pg.fill('#f-umur', '26'); await pg.check('input[name=jantina][value=P]').catch(() => pg.check('input[name=jantina] >> nth=1'));
  await pg.waitForTimeout(300);
  const sy = await pg.evaluate(() => ['pemuda', 'puteri', 'wanita'].map((k) => { const b = document.querySelector('#sayap-grid .sy[data-kod="' + k + '"] .sy__nama'); return b ? b.textContent : ''; }).join('|'));
  semak(/Armada\|Srikandi Muda\|Srikandi/.test(sy), 'sayap Armada / Srikandi Muda / Srikandi: ' + sy);
  await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  await pg.getByText('Terus main').click().catch(() => {}); await pg.waitForTimeout(300);
  semak((await pg.getAttribute('.brand__img', 'src')).indexOf('logo-bersatu') >= 0, 'logo BERSATU pada dashboard');
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { ap: 10, myr: 20000, tahun: 2027, bulan: 9, reputasi: 70, jawatan: 'Ketua Bahagian', jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: 2027 }] } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  const pf = await pg.textContent('.bst-kad');
  semak(/Kesepaduan PN/.test(pf) && /Persidangan Bahagian/.test(pf) && /PAS/.test(pf) && /Fasal 13\.6/.test(pf), 'kad BERSATU: ' + pf.slice(0, 120));
  await pg.click('[data-bst="runding"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => MyPolitikBersatu.kesepaduan(MyPolitikSave.loadPlayer())) === 61, 'Rundingan: Kesepaduan 55 -> 61');
  await pg.click('[data-bst="jelajah"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => MyPolitikSave.loadPlayer().bersatu.jelajahBulan > 0), 'Jelajah Bahagian');
  const teks = await pg.evaluate(() => document.body.innerText);
  semak(!/\bUMNO\b/.test(teks), 'tiada perkataan UMNO');
  semak(!/Majlis Kerja Tertinggi|\bMKT\b|\bPAU\b|Ketua Puteri|Ketua Pemuda|Badan Perhubungan/.test(teks), 'tiada MKT / PAU / Puteri / Pemuda / Badan Perhubungan');
  if (process.env.SKRIN) { await pg.addStyleTag({ content: '.toast-stack,.toast,#mpa-bar,.tut-fab{display:none!important}' }); const k = await pg.$('.bst-kad'); if (k) { await k.screenshot({ path: process.env.SKRIN }).catch(() => {}); } }
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  const bocorSemua = [];
  for (const tab of ['profil', 'tindakan', 'pemilihan', 'mesyuarat']) {
    await pg.click('[data-tab="' + tab + '"]').catch(() => {}); await pg.waitForTimeout(500);
    const b = await pg.evaluate(([src, tb]) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('#panel-' + tb); if (!k) { return ['(tiada panel ' + tb + ')']; } const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); const pe = n.parentElement; if (t && re.test(t) && pe && pe.offsetParent !== null && !pe.closest('select')) { out.push(t.slice(0, 120)); } } return out; }, [BM.source, tab]);
    b.forEach((x) => bocorSemua.push(tab + ': ' + x));
  }
  if (process.env.SENARAI) { console.log(bocorSemua.join('\n')); }
  semak(bocorSemua.length === 0, 'EN: tiada BM bocor dalam tab dashboard BERSATU (' + bocorSemua.length + '):\n    ' + bocorSemua.slice(0, 30).join('\n    '));
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian BERSATU lulus.'); process.exit(gagal.length ? 1 : 0);
})();
