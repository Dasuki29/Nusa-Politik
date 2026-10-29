#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-umno.js   (v13.5)
   Ujian pelayar (Playwright): Fasa B Perlembagaan UMNO 2025: daftar ahli UMNO, takwim 4-5/6/9, kad UMNO (Jelajah Bahagian,
   Majlis Penerangan, lantikan Ketua dan Presiden, mohon lantikan), tajuk Pemilihan Pusat di Bahagian, banner tangguh, EN tanpa BM bocor.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-mic.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian UMNO dilangkau.'); process.exit(0); }
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
  await pg.click('text=Permainan baharu'); await pg.waitForTimeout(1000);
  await pg.selectOption('#s-parti', 'UMNO').catch(() => {}); await pg.waitForTimeout(3000);
  await pg.selectOption('#s-negeri', { index: 1 }); await pg.waitForTimeout(600);
  await pg.selectOption('#s-bahagian', { index: 1 }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-dun', { index: 1 }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-cawangan', { index: 1 }); await pg.waitForTimeout(300);
  await pg.fill('#f-nama', 'Ahmad Uji'); await pg.fill('#f-umur', '45'); await pg.check('input[name=jantina][value=L]').catch(() => pg.check('input[name=jantina] >> nth=0'));
  await pg.waitForTimeout(300); await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  semak(await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); return p.umno && p.umno.v === 135 && !p.umno.lama; }), 'profil baharu bertanda v13.5');
  semak(await pg.evaluate(() => [MyPolitikCalendar.getTetingkap('cawangan', 1).mula, MyPolitikCalendar.getTetingkap('bahagian', 1).mula, MyPolitikCalendar.getTetingkap('pau', 1).mula].join()) === '4,6,9', 'takwim 4/6/9');
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { bulan: 2, jawatan: 'Ketua Bahagian', jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: 2026 }, { kod: 'ketua_cawangan', jawatan: 'Ketua Cawangan', peringkat: 'cawangan', kumpulan: 'utama', pangkat: 3, tahun: 2026 }], ap: 20, myr: 50000, ip: 500, negeriBP: { dekat: 60 } } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  let pf = await pg.textContent('#panel-profil');
  semak(/UMNO: Pemilihan/.test(pf) && /191 Bahagian/.test(pf) && /Lantikan Ketua Bahagian/.test(pf) && /Lantikan Ketua Cawangan/.test(pf) && /Majlis Penerangan/.test(pf), 'kad UMNO (Pusat, lantikan Ketua, Majlis Penerangan)');
  const kodJ = await pg.$eval('[data-umno-bhg]', (x) => x.value);
  const sebelum = await pg.evaluate((k) => MyPolitikUMNO.sokonganBahagian(MyPolitikSave.loadPlayer())[k], kodJ);
  await pg.click('[data-umno="jelajah"]'); await pg.waitForTimeout(500);
  semak(await pg.evaluate((k) => MyPolitikUMNO.sokonganBahagian(MyPolitikSave.loadPlayer())[k], kodJ) > sebelum, 'Jelajah Bahagian menaikkan sokongan');
  await pg.click('[data-umno="penerangan"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => !!MyPolitikSave.loadPlayer().umno.penerangan), 'Majlis Penerangan diadakan');
  await pg.click('[data-umno="ketua"][data-pr-umno="bahagian"][data-pilih-umno="muda"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => MyPolitikSave.loadPlayer().umno.lantikKetua.bahagian.pilihan === 'muda'), 'lantikan pelapis muda');
  await pg.click('[data-tab="pemilihan"]'); await pg.waitForTimeout(500);
  const pm = await pg.textContent('#panel-pemilihan');
  semak(/Tempoh Pemilihan/.test(pm), 'banner Tempoh Pemilihan');
  semak(/diundi oleh perwakilan Mesyuarat Perwakilan Bahagian di 191 Bahagian/.test(pm) && !/Pemilihan Pusat \(PAU\)/.test(pm), 'tajuk Pemilihan Pusat di Bahagian');
  // tangguh (Fasal 10.16)
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { tahun: 2035, bulan: 2, pru: { tahunPRU: 2036, bulanPRU: 3, riwayat: [{ tahun: 2031, bulan: 3, jenis: 'PRU' }] }, umno: Object.assign(MyPolitikSave.loadPlayer().umno, { kit: { biasa: 2035, lepas: [{ tahun: 2032, i: 2032 * 12 + 6, khas: false }], putus: {} } }) } }); NusaUI.render(); });
  await pg.click('[data-tab="pemilihan"]'); await pg.waitForTimeout(500);
  semak(/Pemilihan 2035 ditangguhkan/.test(await pg.textContent('#panel-pemilihan')), 'banner tangguh');
  // Presiden
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { jawatan: 'Presiden', jawatanList: [{ kod: 'presiden', jawatan: 'Presiden', peringkat: 'pusat', kumpulan: 'utama', pangkat: 12, tahun: 2032 }] } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  pf = await pg.textContent('#panel-profil'); semak(/13 ahli MKT/.test(pf) && /Perhimpunan Agung Khas/.test(pf), 'kad Presiden');
  if (process.env.SKRIN) { await (await pg.$('.umno-kad')).screenshot({ path: process.env.SKRIN }).catch(() => {}); }
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  for (const tab of ['profil', 'pemilihan']) {
    await pg.click('[data-tab="' + tab + '"]').catch(() => {}); await pg.waitForTimeout(500);
    const bocor = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; document.querySelectorAll('.umno-kad, .umno-banner').forEach((k) => { const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.nodeValue.trim(); if (t && re.test(t)) { out.push(t.slice(0, 90)); } } }); return out; }, BM.source);
    semak(bocor.length === 0, 'EN: tiada BM bocor (' + tab + '):\n    ' + bocor.slice(0, 15).join('\n    '));
  }
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian UMNO lulus.'); process.exit(gagal.length ? 1 : 0);
})();
