#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-grs.js   (v13.54)
   Ujian pelayar (Playwright): susunan menu BN, PH, PN, GPS, GRS, Lain-lain; panel GRS (6 cip), daftar Gagasan Rakyat (Sabah, Beliawanis),
   kad GRS (Kestabilan, Jamuan, MA63, Sabah untuk Sabahan, krisis), parti kecil LDP (rundingan kuota), kad kerusi dan EN tanpa teks BM bocor.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-grs.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian GRS dilangkau.'); process.exit(0); }
const exe = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean).filter((c) => fs.existsSync(c))[0];
const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff', '.webmanifest': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' }); r.end(fs.readFileSync(f)); });
const gagal = []; const semak = (ok, msg) => { if (!ok) { gagal.push(msg); } };
const BM = /\b(yang|dan|untuk|dengan|anda|kepada|telah|akan|tidak|sudah|ialah|dalam|pada|atau|boleh|mesti|setiap|bulan|tahun|sebagai|daripada|kawasan|sokongan|ahli|perwakilan|kerusi|tiada|perlu|pilih|jelajah|dana|lantikan|kedekatan|keahlian|sumbangan)\b/i;
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const br = await PW.chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
  const ctx = await br.newContext({ viewport: { width: 420, height: 900 } }), pg = await ctx.newPage();
  const ralat = []; pg.on('pageerror', (e) => ralat.push(e.message));
  await pg.route('**/*', (rt) => { if (rt.request().url().startsWith(base)) { rt.continue(); } else { rt.abort(); } });
  await pg.goto(base + '/index.html'); await pg.waitForTimeout(1200);
  const urutan = await pg.$$eval('.gab__btn', (l) => l.map((b) => b.getAttribute('data-gab')).join(','));
  semak(urutan === 'BN,PH,PN,GPS,GRS,LAIN', 'susunan menu: ' + urutan);
  await pg.click('[data-gab="GRS"]'); await pg.waitForTimeout(300);
  if (process.env.SKRIN_MENU) { const m = await pg.$('.poster'); if (m) { await m.screenshot({ path: process.env.SKRIN_MENU }); } }
  const cip = await pg.$$eval('#gab-grs .poster__chip', (l) => l.map((x) => x.getAttribute('data-parti')).join(','));
  semak(cip === 'GAGASAN,PBS,UPKO,LDP,PHRS,PCS', 'cip GRS: ' + cip);
  semak(await pg.$$eval('#gab-grs img, [data-gab="GRS"] img', (l) => l.length === 7 && l.every((i) => i.complete && i.naturalWidth > 0)), 'logo GRS dan 6 parti dimuat');
  await pg.click('#gab-grs .poster__chip[data-parti="GAGASAN"]'); await pg.waitForTimeout(2500);
  semak(await pg.$eval('#s-parti', (x) => x.value) === 'GAGASAN', 'cip Gagasan terus ke pendaftaran');
  semak(/Hajiji/.test(await pg.textContent('#h-parti')), 'nota Gagasan pada skrin pendaftaran');
  const negeri = await pg.$$eval('#s-negeri option', (o) => o.map((x) => x.textContent));
  semak(negeri.some((n) => /Sabah/.test(n)) && negeri.some((n) => /Labuan/.test(n)) && !negeri.some((n) => /Selangor|Sarawak/.test(n)), 'negeri Sabah dan Labuan (' + negeri.join('|') + ')');
  await pg.selectOption('#s-negeri', { label: negeri.find((n) => /Sabah/.test(n)) }); await pg.waitForTimeout(400);
  const kd = await pg.evaluate(() => MyPolitikGRSData.parti.GAGASAN.qDUN[0]), dn = await pg.evaluate((k) => MyPolitikGRSData.dun[k], kd);
  const plNama = await pg.evaluate((k) => MyPolitikGRSData.parlimen[k].n, dn.p);
  const ops = await pg.$$eval('#s-bahagian option', (o) => o.map((x) => x.textContent));
  await pg.selectOption('#s-bahagian', { index: Math.max(1, ops.findIndex((x) => x.indexOf(plNama) >= 0)) }); await pg.waitForTimeout(300);
  semak(/kuota GAGASAN dalam GRS/.test(await pg.textContent('#h-parti')), 'notis kuota GRS');
  const dops = await pg.$$eval('#s-dun option', (o) => o.map((x) => x.textContent));
  await pg.selectOption('#s-dun', { index: Math.max(1, dops.findIndex((x) => x.indexOf(dn.n) >= 0)) }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-cawangan', { index: 1 }); await pg.waitForTimeout(300);
  await pg.fill('#f-nama', 'Siti Aminah'); await pg.fill('#f-umur', '27'); await pg.check('input[name=jantina][value=P]').catch(() => pg.check('input[name=jantina] >> nth=1'));
  await pg.waitForTimeout(300);
  const sy = await pg.$$eval('#sayap-grid .sy', (l) => l.map((x) => x.dataset.kod + ':' + (getComputedStyle(x).display === 'none' ? 'x' : 'o')).join());
  const bl = await pg.evaluate(() => { const b = document.querySelector('#sayap-grid .sy[data-kod="puteri"]'); return b ? b.textContent : ''; });
  semak(/puteri:o/.test(sy) && /Beliawanis/.test(bl), 'sayap Beliawanis (' + sy + '): ' + bl.slice(0, 80));
  await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  await pg.getByText('Terus main').click().catch(() => {}); await pg.waitForTimeout(300);
  semak((await pg.getAttribute('.brand__img', 'src')).indexOf('logo-gagasan') >= 0, 'logo Gagasan pada dashboard');
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { ap: 10, myr: 30000 } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  const pf = await pg.textContent('.grs-kad');
  semak(/Kerajaan Negeri Sabah/.test(pf) && /Kestabilan Gabungan/.test(pf) && /MA63/.test(pf) && /Sabah untuk Sabahan/.test(pf) && /DUN .*✔/.test(pf), 'kad GRS: ' + pf.slice(0, 200));
  await pg.click('[data-grs="jamuan"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => MyPolitikGRS.kestabilan(MyPolitikSave.loadPlayer())) === 68, 'Jamuan: Kestabilan 62 -> 68');
  const teks = await pg.evaluate(() => document.body.innerText);
  semak(!/\bUMNO\b/.test(teks), 'tiada perkataan UMNO dalam dashboard Gagasan');
  // krisis ADUN lompat
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { grs: Object.assign({}, p.grs, { kestabilan: 30 }) } }); MyPolitikGRS.prosesBulan({ rng: () => 0.01 }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(400);
  semak(await pg.$$eval('[data-grs^="krisis:"]', (l) => l.length === 3), 'butang krisis ADUN lompat');
  if (process.env.SKRIN) { await pg.addStyleTag({ content: '.toast-stack,.toast,#mpa-bar,.tut-fab{display:none!important}' }); const k = await pg.$('.grs-kad'); if (k) { await k.screenshot({ path: process.env.SKRIN }).catch(() => {}); } }
  await pg.click('[data-grs="krisis:pujuk"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => !MyPolitikGRS.statusKrisis(MyPolitikSave.loadPlayer())), 'krisis selesai (pujuk)');
  // kad kerusi selepas PRU (persekutuan: Kerajaan Perpaduan)
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { pru: Object.assign({}, MyPolitikPRU.getPRU(p), { sejarah: [{ jenis: 'PARLIMEN', kerusi: 'X', hasil: 'kalah', tahun: p.tahun, bulan: p.bulan }] }), kerusiNasional: null } }); });
  const kr = await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); window.NusaPaparan.kemaskiniKerusi(p); const h = window.NusaPaparan.htmlKerusi(MyPolitikSave.loadPlayer()); const d = document.createElement('div'); d.innerHTML = h; return d.textContent; });
  semak(/Kerajaan Perpaduan/.test(kr) && /Gabungan Rakyat Sabah/.test(kr) && /Warisan/.test(kr), 'kad kerusi GRS: ' + kr.slice(0, 220));
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  const bocorSemua = [];
  for (const tab of ['profil', 'tindakan', 'pemilihan', 'mesyuarat']) {
    await pg.click('[data-tab="' + tab + '"]').catch(() => {}); await pg.waitForTimeout(500);
    const b = await pg.evaluate(([src, tb]) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('#panel-' + tb); if (!k) { return ['(tiada panel ' + tb + ')']; } const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); const pe = n.parentElement; if (t && re.test(t) && pe && pe.offsetParent !== null && !pe.closest('select')) { out.push(t.slice(0, 120)); } } return out; }, [BM.source, tab]);
    b.forEach((x) => bocorSemua.push(tab + ': ' + x));
  }
  if (process.env.SENARAI) { console.log(bocorSemua.join('\n')); }
  semak(bocorSemua.length === 0, 'EN: tiada BM bocor dalam tab dashboard Gagasan (' + bocorSemua.length + '):\n    ' + bocorSemua.slice(0, 25).join('\n    '));
  // parti kecil LDP: kad Kekuatan + rundingan kuota (EN)
  await pg.evaluate(() => { MyPolitikI18n.setLanguage('BM'); const p = MyPolitikSave.loadPlayer(); MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { parti: 'LDP', grs: { kestabilan: 55 } } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(400);
  const lk = await pg.textContent('.grs-kad'); semak(/Parti kecil dalam GRS/.test(lk) && /Kekuatan Parti/.test(lk) && /Rundingan kuota GRS/.test(lk), 'kad LDP parti kecil');
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian GRS lulus.'); process.exit(gagal.length ? 1 : 0);
})();
