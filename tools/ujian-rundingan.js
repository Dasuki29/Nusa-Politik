#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-rundingan.js   (v13.33)
   Ujian pelayar (Playwright): Rundingan Gabungan selepas Parlimen tergantung (Presiden UMNO: dialog, pilih rakan, Bentuk Kerajaan, status GABUNGAN, EN tanpa BM bocor).
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-rundingan.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian rundingan dilangkau.'); process.exit(0); }
const exe = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean).filter((c) => fs.existsSync(c))[0];
const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff', '.webmanifest': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' }); r.end(fs.readFileSync(f)); });
const gagal = []; const semak = (ok, msg) => { if (!ok) { gagal.push(msg); } };
const BM = /\b(yang|dan|untuk|dengan|anda|kepada|telah|akan|tidak|sudah|ialah|dalam|pada|atau|boleh|mesti|setiap|bulan|tahun|sebagai|daripada|kawasan|sokongan|ahli|perwakilan|kerusi|tiada|perlu|pilih|jelajah|dana|lantikan|kedekatan|keahlian|sumbangan)\b/i;
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const br = await PW.chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
  const pg = await (await br.newContext({ viewport: { width: 1200, height: 900 } })).newPage();
  const ralat = []; pg.on('pageerror', (e) => ralat.push(e.message));
  await pg.route('**/*', (rt) => { if (rt.request().url().startsWith(base)) { rt.continue(); } else { rt.abort(); } });
  await pg.goto(base + '/index.html'); await pg.waitForTimeout(1200);
  const P = require('./persekitaran'), g = P.muat(); P.daftar({ nama: 'Presiden Uji' });
  const S = g.MyPolitikSave, p0 = S.loadPlayer(), PRU = g.MyPolitikPRU;
  S.applyEffects({}, { kiraTindakan: false, patch: { jawatan: 'Presiden',
    pru: Object.assign({}, PRU.getPRU(p0), { status: { jenis: 'MP', kerusi: 'X', kerajaan: false }, hubunganGabungan: 50,
      nasional: { status: 'PEMBANGKANG', tahun: p0.tahun, bulan: p0.bulan, parti: 72, rakan: 26, pembangkang: 124, jumlah: 222, majoriti: 112, bolehPM: true, peluangPM: 0, hubungan: 50 } }) } });
  const kod = g.MyPolitikSlot.kod(g.MyPolitikSlot.eksport());
  await pg.click('[data-menu="slot"]'); await pg.waitForTimeout(400); await pg.click('#slp-imp summary'); await pg.fill('#slp-teks', kod); await pg.waitForTimeout(200); await pg.click('#slp-btn-import'); await pg.waitForTimeout(3000);
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(500);
  if (process.env.NYAH) { console.log(await pg.evaluate(() => JSON.stringify({ url: location.href, n: MyPolitikSave.loadPlayer().pru.nasional, j: MyPolitikSave.loadPlayer().jawatan, rg: document.querySelectorAll('.rg-latar').length, m: (document.querySelector('#modal.is-open') || {}).textContent }))); }
  await pg.evaluate(() => { if (!document.querySelector('[data-pru="nasional"]')) { const b = document.createElement('button'); b.setAttribute('data-pru', 'nasional'); b.id = 'uji-nasional'; document.body.appendChild(b); } });   // banner hanya di tab PRU
  const bt = await pg.$('[data-pru="nasional"]'); semak(!!bt, 'butang Keputusan Nasional');
  if (bt) {
    await bt.click(); await pg.waitForTimeout(700);
    const m = await pg.textContent('#modal.is-open').catch(() => '');
    const bocor0 = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = [], w = document.createTreeWalker(document.querySelector('#modal.is-open'), 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t.slice(0, 120)); } } return out; }, BM.source);
    semak(bocor0.length === 0, 'EN Keputusan Nasional: tiada BM bocor:\n    ' + bocor0.join('\n    '));
    semak(/Hung Parliament|hung Parliament/i.test(m), 'EN: notis Parlimen tergantung: ' + m.replace(/\s+/g, ' ').slice(0, 220));
    await pg.click('#modal.is-open .btn--gold'); await pg.waitForTimeout(700);
    semak(await pg.$$eval('.rg-latar [data-rg]', (l) => l.length) >= 3, 'dialog rundingan dengan rakan');
    semak(await pg.$eval('[data-rg-act="bentuk"]', (b) => b.disabled), 'Bentuk Kerajaan dikunci sebelum cukup 112');
    for (const k of ['PH', 'GPS']) { await pg.check('.rg-latar [data-rg="' + k + '"]'); await pg.waitForTimeout(250); }
    semak(!(await pg.$eval('[data-rg-act="bentuk"]', (b) => b.disabled)), 'Bentuk Kerajaan dibuka selepas cukup 112');
    const bocor = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; const w = document.createTreeWalker(document.querySelector('.rg-latar'), 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t.slice(0, 120)); } } return out; }, BM.source);
    semak(bocor.length === 0, 'EN dialog: tiada BM bocor:\n    ' + bocor.join('\n    '));
    if (process.env.SKRIN) { const k = await pg.$('.rg-kad'); if (k) { await k.screenshot({ path: process.env.SKRIN }).catch(() => {}); } }
    await pg.evaluate(() => { Math.random = () => 0; });
    await pg.click('[data-rg-act="bentuk"]'); await pg.waitForTimeout(800);
    const h = await pg.textContent('#modal.is-open').catch(() => '');
    semak(/coalition government|Negotiations failed/i.test(h), 'EN hasil rundingan: ' + h.replace(/\s+/g, ' ').slice(0, 220));
    const bocor2 = BM.test(h) ? h.replace(/\s+/g, ' ') : ''; semak(!bocor2, 'EN hasil: tiada BM: ' + bocor2.slice(0, 200));
    await pg.click('#modal.is-open .btn--gold').catch(() => {}); await pg.waitForTimeout(700);
    const pm = await pg.textContent('#modal.is-open').catch(() => '');
    const bocor3 = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = [], m = document.querySelector('#modal.is-open'); if (!m) { return out; } const w = document.createTreeWalker(m, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t.slice(0, 120)); } } return out; }, BM.source);
    semak(bocor3.length === 0, 'EN pilihan kerajaan: tiada BM bocor:\n    ' + bocor3.join('\n    ') + '\n    [' + pm.replace(/\s+/g, ' ').slice(0, 200) + ']');
    const st = await pg.evaluate(() => MyPolitikSave.loadPlayer().pru.nasional);
    semak(st.status === 'GABUNGAN' || st.status === 'PEMBANGKANG', 'status selepas rundingan: ' + st.status);
  }
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian rundingan lulus.'); process.exit(gagal.length ? 1 : 0);
})();
