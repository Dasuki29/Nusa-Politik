#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-laluan.js   (v13.40)
   Ujian pelayar (Playwright): Lobi Timbalan Perdana Menteri untuk Timbalan Presiden (dialog Lobi Portfolio, pilihan TPM, dilantik, EN tanpa BM bocor).
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-laluan.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian laluan dilangkau.'); process.exit(0); }
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
  const P = require('./persekitaran'), g = P.muat(); P.daftar({ nama: 'Timbalan Uji' });
  const S = g.MyPolitikSave, p0 = S.loadPlayer(), PRU = g.MyPolitikPRU;
  S.applyEffects({}, { kiraTindakan: false, patch: { ip: 900, myr: 100000, ap: 10, jawatan: 'Timbalan Presiden',
    jawatanList: [{ kod: 'timbalan_presiden', jawatan: 'Timbalan Presiden', peringkat: 'pusat', kumpulan: 'utama', pangkat: 11, tahun: p0.tahun }],
    kerusiNasional: { tahun: p0.tahun, bulan: p0.bulan, parti: 60, rakan: 30, pembangkang: 50, bebas: 0, kerajaan: true, gabungan: ['PH'], ubah: { PH: -82, PN: 0 } },
    pru: Object.assign({}, PRU.getPRU(p0), { status: { jenis: 'MP', kerusi: 'X', kerajaan: true }, hubunganGabungan: 50 }) } });
  g.MyPolitikKabinet.bukaLobi('PARLIMEN');
  const kod = g.MyPolitikSlot.kod(g.MyPolitikSlot.eksport());
  await pg.click('[data-menu="slot"]'); await pg.waitForTimeout(400); await pg.click('#slp-imp summary'); await pg.fill('#slp-teks', kod); await pg.waitForTimeout(200); await pg.click('#slp-btn-import'); await pg.waitForTimeout(3000);
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(500);
  await pg.evaluate(() => { const b = document.createElement('button'); b.setAttribute('data-pru', 'lobi'); b.id = 'uji-lobi'; document.body.appendChild(b); });
  await pg.click('#uji-lobi'); await pg.waitForTimeout(700);
  const m = await pg.textContent('#modal.is-open').catch(() => '');
  semak(/Deputy Prime Minister/.test(m) && /40%/.test(m) && /coalition partner/.test(m), 'pilihan TPM dalam dialog lobi (EN): ' + m.replace(/\s+/g, ' ').slice(0, 300));
  const bocor = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = [], w = document.createTreeWalker(document.querySelector('#modal.is-open'), 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t.slice(0, 140)); } } return out; }, BM.source);
  semak(bocor.length === 0, 'EN dialog lobi: tiada BM bocor:\n    ' + bocor.join('\n    '));
  await pg.evaluate(() => { MyPolitikKabinet.setRng(() => 0); });
  await pg.click('#modal.is-open [data-pilih="TPM"]'); await pg.waitForTimeout(800);
  const h = await pg.textContent('#modal.is-open').catch(() => '');
  semak(/Appointed Deputy Prime Minister/.test(h), 'dilantik TPM: ' + h.replace(/\s+/g, ' ').slice(0, 200));
  semak(await pg.evaluate(() => MyPolitikKabinet.getKabinet(MyPolitikSave.loadPlayer()).roleLevel === 'TIMBALAN_PM'), 'roleLevel TIMBALAN_PM');
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian laluan lulus.'); process.exit(gagal.length ? 1 : 0);
})();
