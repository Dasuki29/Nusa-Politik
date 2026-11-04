#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-hemisikal.js   (v13.25)
   Ujian pelayar (Playwright): carta hemisikal tab Dewan: 222 titik, kerusi pemain ditonjolkan, animasi sekali dan Langkau, EN tanpa BM bocor.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-hemisikal.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian Hemisikal dilangkau.'); process.exit(0); }
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
  const P = require('./persekitaran'), g = P.muat(); P.daftar({ nama: 'MP Uji' });
  const S = g.MyPolitikSave, p0 = S.loadPlayer(), PRU = g.MyPolitikPRU, pr = PRU.getPRU(p0);
  S.applyEffects({}, { kiraTindakan: false, patch: { ap: 10,
    pru: Object.assign({}, pr, { status: { jenis: 'MP', kerusi: 'Pekan', kerajaan: true, sejakTahun: p0.tahun, sejakBulan: p0.bulan },
      sejarah: [{ jenis: 'PARLIMEN', kerusi: 'Pekan', hasil: 'menang', majoriti: 8412, tahun: p0.tahun, bulan: p0.bulan }] }),
    kerusiNasional: { tahun: p0.tahun, bulan: p0.bulan, parti: 58, rakan: 62, pembangkang: 99, bebas: 3, kerajaan: true } } });
  const kod = g.MyPolitikSlot.kod(g.MyPolitikSlot.eksport());
  await pg.click('[data-menu="slot"]'); await pg.waitForTimeout(400); await pg.click('#slp-imp summary'); await pg.fill('#slp-teks', kod); await pg.waitForTimeout(200); await pg.click('#slp-btn-import'); await pg.waitForTimeout(3000);
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  await pg.evaluate(() => { const t = document.querySelector('#tab-dewan'); if (t) { t.hidden = false; } }); await pg.click('#tab-dewan').catch(() => {}); await pg.waitForTimeout(600);
  const d = await pg.evaluate(() => { const h = document.querySelector('#panel-dewan .dw-hemi'); return h ? { n: h.querySelectorAll('circle').length, anda: h.querySelectorAll('circle[data-hemi-anda]').length, anim: h.classList.contains('dw-hemi--anim'), teks: h.textContent } : null; });
  semak(!!d, 'carta hemisikal dipapar di tab Dewan');
  if (d) {
    semak(d.n === 222, '222 titik (dapat ' + d.n + ')'); semak(d.anda === 1, 'satu kerusi pemain ditonjolkan');
    semak(d.anim, 'animasi kali pertama'); semak(/Kerajaan 120 · Pembangkang 102/.test(d.teks), 'kiraan kerajaan/pembangkang');
    semak(/Pekan/.test(d.teks) && /8,412/.test(d.teks), 'kerusi anda dan majoriti');
  }
  if (process.env.SKRIN) { await pg.waitForTimeout(2600); const k = await pg.$('#panel-dewan .dw-hemi'); if (k) { await k.screenshot({ path: process.env.SKRIN }).catch(() => {}); } }
  await pg.click('[data-dewan="hemi-langkau"]').catch(() => {}); await pg.waitForTimeout(200);
  semak(await pg.evaluate(() => !!document.querySelector('.dw-hemi--siap') && !document.querySelector('[data-dewan="hemi-langkau"]')), 'Langkau animasi');
  await pg.evaluate(() => NusaUI.render()); await pg.waitForTimeout(300);
  semak(await pg.evaluate(() => !document.querySelector('#panel-dewan .dw-hemi--anim')), 'animasi tidak berulang selepas render');
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(600);
  const bocor = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('#panel-dewan .dw-hemi'); if (!k) { return []; } const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t.slice(0, 120)); } } return out; }, BM.source + '|Kerajaan|Pembangkang|Garis|Kerusi anda|Langkau');
  const tt = await pg.evaluate(() => Array.from(new Set(Array.from(document.querySelectorAll('#panel-dewan .dw-hemi title')).map((x) => x.textContent))));
  semak(tt.indexOf('Coalition partners') >= 0, 'tajuk titik diterjemah');
  semak(bocor.length === 0, 'EN: tiada BM bocor:\n    ' + bocor.join('\n    '));
  await pg.evaluate(() => MyPolitikI18n.setLanguage('BM')); await pg.waitForTimeout(300);
  const dn = await pg.evaluate(() => { const S = MyPolitikSave, p = S.loadPlayer(), pr = MyPolitikPRU.getPRU(p);
    S.applyEffects({}, { kiraTindakan: false, patch: { pru: Object.assign({}, pr, { status: { jenis: 'ADUN', kerusi: 'Peramu Jaya', kerajaan: true, sejakTahun: p.tahun, sejakBulan: p.bulan } }),
      kerusiNasional: Object.assign({}, p.kerusiNasional, { dun: { jumlah: 42, kerajaan: 24, bebas: 1, pembangkang: 17, negeri: '06' } }) } });
    NusaUI.render(); const h = document.querySelector('#panel-dewan .dw-hemi'); return h ? { n: h.querySelectorAll('circle').length, anda: h.querySelectorAll('circle[data-hemi-anda]').length } : null; });
  semak(dn && dn.n === 42 && dn.anda === 1, 'DUN: 42 titik dan kerusi ADUN ditonjolkan (' + JSON.stringify(dn) + ')');
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian Hemisikal lulus.'); process.exit(gagal.length ? 1 : 0);
})();
