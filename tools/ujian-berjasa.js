#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-berjasa.js   (v13.53)
   Ujian pelayar (Playwright): susunan menu BN, PH, PN, GPS, Lain-lain; panel Lain-lain (cip BERJASA), daftar BERJASA (Kelantan),
   istilah (Kawasan, ANGKASA, Muktamar BERJASA), kad BERJASA (Dakwah, Pakatan, Penentu kerajaan), kad kerusi dan EN tanpa teks BM bocor.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-berjasa.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian BERJASA dilangkau.'); process.exit(0); }
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
  const urutan = await pg.$$eval('.gab__btn', (l) => l.map((b) => b.getAttribute('data-gab')).join(','));
  semak(urutan === 'BN,PH,PN,GPS,GRS,LAIN', 'susunan menu: ' + urutan);
  if (process.env.SKRIN_MENU) { await pg.click('[data-gab="LAIN"]'); await pg.waitForTimeout(300); const m = await pg.$('.poster'); if (m) { await m.screenshot({ path: process.env.SKRIN_MENU }); } await pg.click('[data-gab="LAIN"]'); await pg.waitForTimeout(200); }
  await pg.click('[data-gab="LAIN"]'); await pg.waitForTimeout(300);
  const ln = await pg.evaluate(() => { const p = document.querySelector('#gab-lain'); return p && !p.hidden ? p.textContent : ''; });
  semak(/BERJASA/.test(ln) && /tanpa gabungan/.test(ln), 'panel Lain-lain: ' + ln.slice(0, 120));
  semak(await pg.$$eval('#gab-lain img, [data-gab="LAIN"] img', (l) => l.length === 3 && l.every((i) => i.complete && i.naturalWidth > 0)), 'logo BERJASA dimuat');
  await pg.click('#gab-lain .poster__chip[data-parti="BERJASA"]'); await pg.waitForTimeout(2500);
  semak(await pg.$eval('#s-parti', (x) => x.value) === 'BERJASA', 'cip BERJASA terus ke pendaftaran BERJASA');
  semak(/tanpa gabungan/.test(await pg.textContent('#h-parti')), 'nota BERJASA pada skrin pendaftaran');
  const negeri = await pg.$$eval('#s-negeri option', (o) => o.map((x) => x.textContent));
  semak(negeri.some((n) => /Kelantan/.test(n)) && !negeri.some((n) => /Sabah|Sarawak/.test(n)), 'negeri Semenanjung sahaja (' + negeri.length + ')');
  await pg.selectOption('#s-negeri', { label: 'Kelantan' }); await pg.waitForTimeout(400);
  const ops = await pg.$$eval('#s-bahagian option', (o) => o.map((x) => x.textContent));
  const iKB = ops.findIndex((x) => /Kota Bharu/.test(x)); await pg.selectOption('#s-bahagian', { index: iKB > 0 ? iKB : 1 }); await pg.waitForTimeout(300);
  semak(/Bumiputera/.test(await pg.textContent('#h-parti')), 'notis kawasan BERJASA');
  await pg.selectOption('#s-dun', { index: 1 }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-cawangan', { index: 1 }); await pg.waitForTimeout(300);
  await pg.fill('#f-nama', 'Ahmad Zaki'); await pg.fill('#f-umur', '30'); await pg.check('input[name=jantina][value=L]').catch(() => pg.check('input[name=jantina] >> nth=0'));
  await pg.waitForTimeout(300);
  const sy = await pg.$$eval('#sayap-grid .sy', (l) => l.map((x) => x.dataset.kod + ':' + (getComputedStyle(x).display === 'none' ? 'x' : 'o')).join());
  semak(/puteri:x/.test(sy), 'BERJASA tiada Puteri (' + sy + ')');
  const am = await pg.evaluate(() => { const b = document.querySelector('#sayap-grid .sy[data-kod="pemuda"]'); return b ? b.textContent : ''; });
  semak(/ANGKASA/.test(am), 'sayap ANGKASA: ' + am.slice(0, 160));
  await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  await pg.getByText('Terus main').click().catch(() => {}); await pg.waitForTimeout(300);
  semak((await pg.getAttribute('.brand__img', 'src')).indexOf('logo-berjasa') >= 0, 'logo BERJASA pada dashboard');
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { ap: 10, myr: 20000 } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  const pf = await pg.textContent('.bj-kad');
  semak(/Parti Kecil/.test(pf) && /Kekuatan Parti/.test(pf) && /Pakatan pilihan raya/.test(pf) && /Penentu kerajaan/.test(pf), 'kad BERJASA');
  await pg.click('[data-bj="dakwah"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => MyPolitikBERJASA.kekuatan(MyPolitikSave.loadPlayer())) === 9, 'Dakwah: Kekuatan 8 -> 9');
  const teks = await pg.evaluate(() => document.body.innerText);
  semak(!/\bUMNO\b/.test(teks), 'tiada perkataan UMNO dalam dashboard BERJASA');
  semak(!/Majlis Kerja Tertinggi|\bMKT\b|Perhimpunan Agung|\bPemuda\b|Ketua Bahagian/.test(teks), 'tiada MKT / Perhimpunan Agung / Pemuda / Ketua Bahagian');
  const ist = await pg.evaluate(() => MyPolitikParti.ke('Perhimpunan Agung UMNO (PAU) bulan 9 · Ketua Bahagian · Pemuda'));
  semak(ist === 'Muktamar BERJASA bulan 6 · Ketua Kawasan · ANGKASA', 'istilah: ' + ist);
  // Ahli Parlimen selepas PRU: kad kerusi dan Penentu kerajaan
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { ap: 10,
    pru: Object.assign({}, MyPolitikPRU.getPRU(p), { riwayat: [{ tahun: p.tahun, bulan: p.bulan, jenis: 'PRU' }], status: { jenis: 'MP', kerusi: 'Kota Bharu', kerajaan: false, sejakTahun: p.tahun, sejakBulan: p.bulan }, sejarah: [{ jenis: 'PARLIMEN', kerusi: 'Kota Bharu', hasil: 'menang', majoriti: 820, tahun: p.tahun, bulan: p.bulan }] }),
    kerusiNasional: { tahun: p.tahun, bulan: p.bulan, parti: 2, rakan: 0, pembangkang: 216, bebas: 4, kerajaan: false } } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(400);
  semak(await pg.$$eval('[data-bj^="sokong:"]', (l) => l.length === 3 && l.every((b) => !b.disabled)), 'butang Penentu kerajaan BN / PN / PH aktif');
  const kr = await pg.evaluate(() => { const h = window.NusaPaparan.htmlKerusi(MyPolitikSave.loadPlayer()); const d = document.createElement('div'); d.innerHTML = h; return d.textContent; });
  semak(/BERJASA \(★ parti anda\)/.test(kr) && /Kerajaan Perpaduan/.test(kr) && /Perikatan Nasional/.test(kr), 'kad kerusi BERJASA: ' + kr.slice(0, 200));
  if (process.env.SKRIN) { await pg.addStyleTag({ content: '.toast-stack,.toast,#mpa-bar,.tut-fab{display:none!important}' }); const k = await pg.$('.bj-kad'); if (k) { await k.screenshot({ path: process.env.SKRIN }).catch(() => {}); } }
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  const bocorSemua = [];
  for (const tab of ['profil', 'tindakan', 'pemilihan', 'mesyuarat', 'dewan']) {
    await pg.click('[data-tab="' + tab + '"]').catch(() => {}); await pg.waitForTimeout(500);
    const b = await pg.evaluate(([src, tb]) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('#panel-' + tb); if (!k) { return ['(tiada panel ' + tb + ')']; } const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); const pe = n.parentElement; if (t && re.test(t) && pe && pe.offsetParent !== null && !pe.closest('select')) { out.push(t.slice(0, 120)); } } return out; }, [BM.source, tab]);
    b.forEach((x) => bocorSemua.push(tab + ': ' + x));
  }
  if (process.env.SENARAI) { console.log(bocorSemua.join('\n')); }
  semak(bocorSemua.length === 0, 'EN: tiada BM bocor dalam tab dashboard BERJASA (' + bocorSemua.length + '):\n    ' + bocorSemua.slice(0, 25).join('\n    '));
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian BERJASA lulus.'); process.exit(gagal.length ? 1 : 0);
})();
