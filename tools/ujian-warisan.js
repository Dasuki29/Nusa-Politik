#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-warisan.js   (v13.55)
   Ujian pelayar (Playwright): panel Lain-lain (cip Warisan), daftar Warisan (Sabah, Wira / Wirawati, negeri Semenanjung tersedia),
   kad Warisan (Gelombang, Jelajah, Serang isu, Pikat ADUN), kad kerusi dan EN tanpa teks BM bocor.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-warisan.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian Warisan dilangkau.'); process.exit(0); }
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
  await pg.click('[data-gab="LAIN"]'); await pg.waitForTimeout(300);
  if (process.env.SKRIN_MENU) { const m = await pg.$('.poster'); if (m) { await m.screenshot({ path: process.env.SKRIN_MENU }); } }
  const cip = await pg.$$eval('#gab-lain .poster__chip', (l) => l.map((x) => x.getAttribute('data-parti')).join(','));
  semak(cip === 'BERJASA,WARISAN', 'cip Lain-lain: ' + cip);
  semak(await pg.$$eval('#gab-lain img', (l) => l.every((i) => i.complete && i.naturalWidth > 0)), 'logo Lain-lain dimuat');
  await pg.click('#gab-lain .poster__chip[data-parti="WARISAN"]'); await pg.waitForTimeout(2500);
  semak(await pg.$eval('#s-parti', (x) => x.value) === 'WARISAN', 'cip Warisan terus ke pendaftaran');
  const negeri = await pg.$$eval('#s-negeri option', (o) => o.map((x) => x.textContent));
  semak(negeri.some((n) => /Sabah/.test(n)) && negeri.some((n) => /Labuan/.test(n)) && negeri.some((n) => /Selangor/.test(n)) && !negeri.some((n) => /Sarawak/.test(n)), 'negeri Sabah, Labuan, Semenanjung (' + negeri.length + ')');
  await pg.selectOption('#s-negeri', { label: negeri.find((n) => /Sabah/.test(n)) }); await pg.waitForTimeout(400);
  const ops = await pg.$$eval('#s-bahagian option', (o) => o.map((x) => x.textContent));
  await pg.selectOption('#s-bahagian', { index: Math.max(1, ops.findIndex((x) => /Semporna/.test(x))) }); await pg.waitForTimeout(300);
  semak(/kubu Warisan/.test(await pg.textContent('#h-parti')), 'notis kawasan Sabah');
  await pg.selectOption('#s-dun', { index: 1 }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-cawangan', { index: 1 }); await pg.waitForTimeout(300);
  await pg.fill('#f-nama', 'Mohd Rizal'); await pg.fill('#f-umur', '28'); await pg.check('input[name=jantina][value=L]').catch(() => pg.check('input[name=jantina] >> nth=0'));
  await pg.waitForTimeout(300);
  const sy = await pg.evaluate(() => ['pemuda', 'puteri'].map((k) => { const b = document.querySelector('#sayap-grid .sy[data-kod="' + k + '"] .sy__nama'); return b ? b.textContent : ''; }).join('|'));
  semak(/Wira\|Wirawati/.test(sy), 'sayap Wira / Wirawati: ' + sy);
  await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  await pg.getByText('Terus main').click().catch(() => {}); await pg.waitForTimeout(300);
  semak((await pg.getAttribute('.brand__img', 'src')).indexOf('logo-warisan') >= 0, 'logo Warisan pada dashboard');
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { ap: 10, myr: 30000 } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  const pf = await pg.textContent('.war-kad');
  semak(/Pembangkang Utama Sabah/.test(pf) && /Gelombang Warisan/.test(pf) && /Pikat ADUN/.test(pf), 'kad Warisan: ' + pf.slice(0, 160));
  await pg.click('[data-war="jelajah"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => MyPolitikWarisan.gelombang(MyPolitikSave.loadPlayer())) === 44, 'Jelajah: Gelombang 40 -> 44');
  const teks = await pg.evaluate(() => document.body.innerText);
  semak(!/\bUMNO\b/.test(teks), 'tiada perkataan UMNO dalam dashboard Warisan');
  if (process.env.SKRIN) { await pg.addStyleTag({ content: '.toast-stack,.toast,#mpa-bar,.tut-fab{display:none!important}' }); const k = await pg.$('.war-kad'); if (k) { await k.screenshot({ path: process.env.SKRIN }).catch(() => {}); } }
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { pru: Object.assign({}, MyPolitikPRU.getPRU(p), { sejarah: [{ jenis: 'PARLIMEN', kerusi: 'Semporna', hasil: 'menang', tahun: p.tahun, bulan: p.bulan }] }), kerusiNasional: null } }); });
  const kr = await pg.evaluate(() => { window.NusaPaparan.kemaskiniKerusi(MyPolitikSave.loadPlayer()); const h = window.NusaPaparan.htmlKerusi(MyPolitikSave.loadPlayer()); const d = document.createElement('div'); d.innerHTML = h; return d.textContent; });
  semak(/Warisan \(★ parti anda\)/.test(kr) && /Perikatan Nasional/.test(kr), 'kad kerusi Warisan: ' + kr.slice(0, 220));
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  const bocorSemua = [];
  for (const tab of ['profil', 'tindakan', 'pemilihan', 'mesyuarat']) {
    await pg.click('[data-tab="' + tab + '"]').catch(() => {}); await pg.waitForTimeout(500);
    const b = await pg.evaluate(([src, tb]) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('#panel-' + tb); if (!k) { return ['(tiada panel ' + tb + ')']; } const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); const pe = n.parentElement; if (t && re.test(t) && pe && pe.offsetParent !== null && !pe.closest('select')) { out.push(t.slice(0, 120)); } } return out; }, [BM.source, tab]);
    b.forEach((x) => bocorSemua.push(tab + ': ' + x));
  }
  if (process.env.SENARAI) { console.log(bocorSemua.join('\n')); }
  semak(bocorSemua.length === 0, 'EN: tiada BM bocor dalam tab dashboard Warisan (' + bocorSemua.length + '):\n    ' + bocorSemua.slice(0, 25).join('\n    '));
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian Warisan lulus.'); process.exit(gagal.length ? 1 : 0);
})();
