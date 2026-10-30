#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-npc.js   (v13.20)
   Ujian pelayar (Playwright): kad Lantikan (Kekalkan / Ubah) di tab Tindakan, Struktur Organisasi MCA dengan nama Cina, dan EN tanpa BM bocor.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-npc.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian NPC dilangkau.'); process.exit(0); }
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
  const P = require('./persekitaran'), g = P.muat(); P.daftar({ nama: 'Uji Lantikan' });
  g.MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { tahun: 2026, bulan: 4, jawatan: 'Ketua Cawangan', jawatanList: [{ kod: 'ketua_cawangan', jawatan: 'Ketua Cawangan', peringkat: 'cawangan', kumpulan: 'utama', pangkat: 3, tahun: 2026 }], npc: { nama: {}, lantikan: { peringkat: 'cawangan', tahun: 2026, bulan: 4, keputusan: {} } } } });
  const kod = g.MyPolitikSlot.kod(g.MyPolitikSlot.eksport());
  await pg.click('[data-menu="slot"]'); await pg.waitForTimeout(400); await pg.click('#slp-imp summary'); await pg.fill('#slp-teks', kod); await pg.waitForTimeout(200); await pg.click('#slp-btn-import'); await pg.waitForTimeout(3000);
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(500);
  semak(await pg.$$eval('.npc-kad .npc-baris', (l) => l.length) === 3, 'kad Lantikan: 3 pegawai');
  if (process.env.SKRIN) { await (await pg.$('.npc-kad')).screenshot({ path: process.env.SKRIN }).catch(() => {}); }
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(600);
  const bocor = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('.npc-kad'); const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t) && !/ bin | binti /.test(t)) { out.push(t); } } return out; }, BM.source);
  semak(bocor.length === 0, 'EN: tiada BM bocor dalam kad Lantikan:\n    ' + bocor.join('\n    '));
  await pg.evaluate(() => MyPolitikI18n.setLanguage('BM')); await pg.waitForTimeout(400);
  await pg.click('.npc-kad [data-npc="kekal"]'); await pg.waitForTimeout(400);
  semak(/dikekalkan/.test(await pg.textContent('.npc-kad')), 'Kekalkan direkod');
  await pg.click('.npc-kad [data-npc="semua"]'); await pg.waitForTimeout(400);
  semak(await pg.$$eval('.npc-kad', (l) => l.length) === 0, 'kad ditutup selepas Kekalkan semua');
  // Struktur Organisasi MCA: nama Cina
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { parti: 'MCA' } }); });
  const nm = await pg.evaluate(() => { const s = MyPolitikOrganisasi.getStruktur(MyPolitikSave.loadPlayer()); return [s.induk.cawangan.ketua.nama, s.induk.bahagian.naib.nama].concat(s.induk.cawangan.ajk.map((x) => x.nama)); });
  semak(!nm.some((x) => / bin | binti /.test(x)), 'MCA: nama Struktur bukan Melayu (' + nm.slice(0, 3).join(' | ') + ')');
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian NPC lulus.'); process.exit(gagal.length ? 1 : 0);
})();
