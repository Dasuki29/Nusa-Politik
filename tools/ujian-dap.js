#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-pkr.js   (v13.37)
   Ujian pelayar (Playwright): panel PH (cip DAP), daftar DAP (Pulau Pinang, umur 17), istilah DAP (Pengerusi Cawangan, JPKP, JTP, Setiausaha Agung, Kongres, DAPSY), kad DAP, pilihan (b) Penyelaras JPKP, Jelajah Kawasan, kad kerusi PH, EN.
   (Kawasan, Yang Dipertua Kawasan, Muslimat, Muktamar), kad PAS, Jelajah Kawasan, kad kerusi PN dan carta hemisikal, dan EN tanpa teks BM bocor.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-pkr.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian DAP dilangkau.'); process.exit(0); }
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
  const ph = await pg.evaluate(() => { const p = document.querySelector('#gab-ph'); return p && !p.hidden ? p.textContent : ''; });
  semak(/PKR/.test(ph) && /DAP/.test(ph) && /Amanah/.test(ph) && !/UPKO/.test(ph), 'panel PH di menu utama: ' + ph.slice(0, 120));
  semak(!!(await pg.$('#gab-ph .poster__chip[data-parti="DAP"]')), 'cip DAP boleh dimain');
  semak(await pg.$$eval('#gab-ph img', (l) => l.length === 3 && l.every((i) => i.complete && i.naturalWidth > 0)), 'logo PKR, DAP, Amanah dimuat');
  semak(await pg.$$eval('[data-gab="PH"] img', (l) => l.every((i) => i.complete && i.naturalWidth > 0)), 'logo PH dimuat');
  await pg.click('#gab-ph .poster__chip[data-parti="DAP"]'); await pg.waitForTimeout(2500);
  semak(await pg.$eval('#s-parti', (x) => x.value) === 'DAP', 'cip DAP terus ke pendaftaran DAP');
  semak(/Pakatan Harapan/.test(await pg.textContent('#h-parti')) && /JPKP/.test(await pg.textContent('#h-parti')), 'nota DAP pada skrin pendaftaran');
  const negeri = await pg.$$eval('#s-negeri option', (o) => o.map((x) => x.textContent));
  semak(negeri.some((n) => /Selangor/.test(n)) && negeri.some((n) => /Sabah/.test(n)) && negeri.some((n) => /Sarawak/.test(n)), 'negeri seluruh Malaysia (' + negeri.length + ')');
  semak(/JPKP/.test(await pg.textContent('body')), 'istilah JPKP pada borang');
  await pg.selectOption('#s-negeri', { label: 'Pulau Pinang' }); await pg.waitForTimeout(400);
  const ops = await pg.$$eval('#s-bahagian option', (o) => o.map((x) => x.textContent));
  const iLP = ops.findIndex((x) => /Tanjong/.test(x)); await pg.selectOption('#s-bahagian', { index: iLP > 0 ? iLP : 2 }); await pg.waitForTimeout(300);
  semak(/dalam kuota kerusi Parlimen DAP/.test(await pg.textContent('#h-parti')), 'notis kuota DAP selepas pilih kawasan Tanjong');
  await pg.selectOption('#s-dun', { index: 1 }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-cawangan', { index: 1 }); await pg.waitForTimeout(300);
  await pg.fill('#f-nama', 'Tan Wei Ming'); await pg.fill('#f-umur', '17'); await pg.check('input[name=jantina][value=L]').catch(() => pg.check('input[name=jantina] >> nth=0'));
  await pg.waitForTimeout(300);
  const sy = await pg.$$eval('#sayap-grid .sy', (l) => l.map((x) => x.dataset.kod + ':' + (getComputedStyle(x).display === 'none' ? 'x' : 'o')).join());
  semak(/puteri:x/.test(sy), 'PKR tiada Puteri (' + sy + ')');
  const am = await pg.evaluate(() => { const b = document.querySelector('#sayap-grid .sy[data-kod="pemuda"]'); return b ? b.textContent : ''; });
  semak(/DAPSY/.test(am), 'sayap DAPSY: ' + am.slice(0, 160));
  await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  await pg.getByText('Terus main').click().catch(() => {}); await pg.waitForTimeout(300);
  semak((await pg.getAttribute('.brand__img', 'src')).indexOf('logo-dap') >= 0, 'logo DAP pada dashboard');
  semak(await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); return p.parti === 'DAP' && String(p.demografik && p.demografik.umur) === '17'; }), 'profil DAP umur 17 diterima');
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { ap: 10, myr: 20000, jawatan: 'Ketua Bahagian', jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: p.tahun }],
    pru: Object.assign({}, MyPolitikPRU.getPRU(p), { status: { jenis: 'MP', kerusi: 'Tanjong', kerajaan: true, sejakTahun: p.tahun, sejakBulan: p.bulan }, sejarah: [{ jenis: 'PARLIMEN', kerusi: 'Tanjong', hasil: 'menang', majoriti: 15120, tahun: p.tahun, bulan: p.bulan }] }),
    kerusiNasional: { tahun: p.tahun, bulan: p.bulan, parti: 81, rakan: 32, pembangkang: 105, bebas: 4, kerajaan: true, gabungan: ['BN'], ubah: { PH: -30, PN: 0 }, pecahTetap: false, dun: { jumlah: 40, kerajaan: 29, bebas: 0, pembangkang: 11, negeri: 'Pulau Pinang' } } } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  const pf = await pg.textContent('#panel-profil');
  semak(/DAP: Parti/.test(pf) && /kuota DAP/.test(pf) && /Wakil Cawangan/.test(pf) && /PKR/.test(pf) && /Kongres Kebangsaan/.test(pf), 'kad DAP (PH, kuota, Kongres)');
  semak(/Penyelaras JPKP/.test(pf) && !/Ketua Bahagian/.test(pf) && !/Setiausaha JPKP/.test(pf), 'pilihan (b): Ahli Parlimen = Penyelaras JPKP');
  semak(/JTP|Jawatankuasa Tertinggi Pusat/.test(pf), 'istilah JTP');
  const teks = await pg.evaluate(() => document.body.innerText);
  semak(!/\bUMNO\b/.test(teks), 'tiada perkataan UMNO dalam dashboard PKR');
  semak(!/Majlis Kerja Tertinggi|\bMKT\b|Perhimpunan Agung|\bPresiden\b|Ketua Cawangan/.test(teks), 'tiada MKT / Perhimpunan Agung / Presiden / Ketua Cawangan');
  const kodJ = await pg.$eval('[data-dap-kw]', (x) => x.value);
  const sebelum = await pg.evaluate((k) => MyPolitikDAP.sokonganBahagian(MyPolitikSave.loadPlayer())[k], kodJ);
  await pg.click('[data-dap="jelajah"]'); await pg.waitForTimeout(500);
  semak(await pg.evaluate((k) => MyPolitikDAP.sokonganBahagian(MyPolitikSave.loadPlayer())[k], kodJ) > sebelum, 'Jelajah Kawasan menaikkan sokongan Wakil');
  const kr = await pg.evaluate(() => { const h = window.NusaPaparan.htmlKerusi(MyPolitikSave.loadPlayer()); const d = document.createElement('div'); d.innerHTML = h; return d.textContent; });
  semak(/Pakatan Harapan \(★ parti anda\)/.test(kr) && /Barisan Nasional/.test(kr) && /Perikatan Nasional/.test(kr), 'kad kerusi PH: ' + kr.slice(0, 200));
  await pg.click('#tab-dewan').catch(() => {}); await pg.waitForTimeout(600);
  const hm = await pg.evaluate(() => { const h = document.querySelector('#panel-dewan .dw-hemi'); return h ? { leg: h.querySelector('.dw-hemi-leg').textContent, n: h.querySelectorAll('circle').length } : null; });
  semak(hm && /DAP/.test(hm.leg) && /BN/.test(hm.leg) && /PN/.test(hm.leg) && hm.n === 222, 'carta hemisikal Dewan Rakyat dengan DAP, BN dan PN: ' + JSON.stringify(hm));
  if (process.env.SKRIN) { await pg.addStyleTag({ content: '.toast-stack,.toast,#mpa-bar,.tut-fab{display:none!important}' }); await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(400); const k = await pg.$('.dap-kad'); if (k) { await k.screenshot({ path: process.env.SKRIN }).catch(() => {}); } }
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  await pg.click('[data-tab="profil"]').catch(() => {}); await pg.waitForTimeout(500);
  const bocor = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('.dap-kad'); if (!k) { return ['(tiada kad)']; } const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t.slice(0, 140)); } } return out; }, BM.source);
  semak(bocor.length === 0, 'EN: tiada BM bocor dalam kad DAP:\n    ' + bocor.slice(0, 15).join('\n    '));
  const bocorSemua = [];
  for (const tab of ['profil', 'tindakan', 'pemilihan', 'mesyuarat', 'dewan']) {
    await pg.click('[data-tab="' + tab + '"]').catch(() => {}); await pg.waitForTimeout(500);
    const b = await pg.evaluate(([src, tb]) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('#panel-' + tb); if (!k) { return ['(tiada panel ' + tb + ')']; } const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); const pe = n.parentElement; if (t && re.test(t) && pe && pe.offsetParent !== null && !pe.closest('select')) { out.push(t.slice(0, 120)); } } return out; }, [BM.source, tab]);
    b.forEach((x) => bocorSemua.push(tab + ': ' + x));
  }
  if (process.env.SENARAI) { console.log(bocorSemua.join('\n')); }
  semak(bocorSemua.length === 0, 'EN: tiada BM bocor dalam tab dashboard DAP (' + bocorSemua.length + '):\n    ' + bocorSemua.slice(0, 25).join('\n    '));
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian DAP lulus.'); process.exit(gagal.length ? 1 : 0);
})();
