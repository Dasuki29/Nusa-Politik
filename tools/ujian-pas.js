#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-pas.js   (v13.31)
   Ujian pelayar (Playwright): gabungan PN di menu utama, daftar sebagai ahli PAS (Kelantan), dashboard dengan penjenamaan PAS
   (Kawasan, Yang Dipertua Kawasan, Muslimat, Muktamar), kad PAS, Jelajah Kawasan, kad kerusi PN dan carta hemisikal, dan EN tanpa teks BM bocor.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-pas.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian PAS dilangkau.'); process.exit(0); }
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
  const pn = await pg.evaluate(() => { const p = document.querySelector('#gab-pn'); return p && !p.hidden ? p.textContent : ''; });
  semak(/PAS/.test(pn) && /Bersatu/.test(pn) && /Gerakan/.test(pn) && /MIPP/.test(pn), 'panel PN di menu utama: ' + pn.slice(0, 120));
  await pg.click('text=Permainan baharu'); await pg.waitForTimeout(1000);
  await pg.selectOption('#s-parti', 'PAS'); await pg.waitForTimeout(2500);
  semak(/Perikatan Nasional/.test(await pg.textContent('#h-parti')), 'nota PAS pada skrin pendaftaran');
  const negeri = await pg.$$eval('#s-negeri option', (o) => o.map((x) => x.textContent));
  semak(negeri.some((n) => /Kelantan/.test(n)) && !negeri.some((n) => /Sabah|Sarawak/.test(n)), 'negeri Semenanjung sahaja (' + negeri.length + ')');
  await pg.selectOption('#s-negeri', { label: 'Kelantan' }); await pg.waitForTimeout(400);
  await pg.selectOption('#s-bahagian', { index: 2 }); await pg.waitForTimeout(300);
  semak(/kuota kerusi Parlimen PAS/.test(await pg.textContent('#h-parti')), 'notis kuota PN selepas pilih Kawasan');
  await pg.selectOption('#s-dun', { index: 1 }); await pg.waitForTimeout(300);
  await pg.selectOption('#s-cawangan', { index: 1 }); await pg.waitForTimeout(300);
  semak(await pg.evaluate(() => !document.getElementById('f-pas-bidang').hidden && !document.getElementById('f-pas-jenis').hidden), 'v13.32: medan bidang pengajian dan jenis keahlian PAS');
  await pg.selectOption('#s-bidang', 'islam');
  await pg.fill('#f-nama', 'Siti Aminah'); await pg.fill('#f-umur', '30'); await pg.check('input[name=jantina][value=P]').catch(() => pg.check('input[name=jantina] >> nth=1'));
  const sy = await pg.$$eval('#sayap-grid .sy', (l) => l.map((x) => x.dataset.kod + ':' + (getComputedStyle(x).display === 'none' ? 'x' : 'o')).join());
  semak(/puteri:x/.test(sy), 'PAS tiada Puteri (' + sy + ')');
  await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  await pg.getByText('Terus main').click().catch(() => {}); await pg.waitForTimeout(300);
  semak((await pg.getAttribute('.brand__img', 'src')).indexOf('logo-pas') >= 0, 'logo PAS pada dashboard');
  semak(await pg.evaluate(() => MyPolitikSave.loadPlayer().parti === 'PAS'), 'profil parti PAS');
  await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { ap: 10, myr: 20000, jawatan: 'Ketua Bahagian', jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: p.tahun }],
    pru: Object.assign({}, MyPolitikPRU.getPRU(p), { status: { jenis: 'ADUN', kerusi: 'Pengkalan Kubor', kerajaan: true, sejakTahun: p.tahun, sejakBulan: p.bulan }, sejarah: [{ jenis: 'DUN', kerusi: 'Pengkalan Kubor', hasil: 'menang', majoriti: 5120, tahun: p.tahun, bulan: p.bulan }] }),
    kerusiNasional: { tahun: p.tahun, bulan: p.bulan, parti: 52, rakan: 30, pembangkang: 137, bebas: 3, kerajaan: false, dun: { jumlah: 45, kerajaan: 41, bebas: 1, pembangkang: 3, negeri: 'Kelantan' } } } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(500);
  const pf = await pg.textContent('#panel-profil');
  semak(/PAS: Parti/.test(pf) && /kuota PAS/.test(pf) && /perwakilan Kawasan/.test(pf) && /Bersatu/.test(pf), 'kad PAS (PN, kuota, Muktamar)');
  semak(/Yang Dipertua Kawasan/.test(pf) && !/Ketua Bahagian/.test(pf), 'istilah Yang Dipertua Kawasan');
  semak(!/\bUMNO\b/.test(await pg.evaluate(() => document.body.innerText)), 'tiada perkataan UMNO dalam dashboard PAS');
  const kodJ = await pg.$eval('[data-pas-kw]', (x) => x.value);
  const sebelum = await pg.evaluate((k) => MyPolitikPAS.sokonganBahagian(MyPolitikSave.loadPlayer())[k], kodJ);
  await pg.click('[data-pas="jelajah"]'); await pg.waitForTimeout(500);
  semak(await pg.evaluate((k) => MyPolitikPAS.sokonganBahagian(MyPolitikSave.loadPlayer())[k], kodJ) > sebelum, 'Jelajah Kawasan menaikkan sokongan perwakilan');
  /* v13.32: Fasa 2 */
  semak(await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); return p.pendidikan.bidang === 'islam'; }), 'bidang Pengajian Islam disimpan');
  const pf2 = await pg.textContent('#panel-profil');
  semak(/Restu Majlis Syura Ulamak/.test(pf2) && /Dewan Ulamak/.test(pf2) && /Fasal 15A/.test(pf2), 'kad PAS: Restu, Dewan, Fasal 15A');
  await pg.click('[data-pas="ceramah"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => MyPolitikPAS.restu(MyPolitikSave.loadPlayer()) === 51), 'Ceramah: Restu +1');
  await pg.click('[data-pas="sertai"][data-dewan-pas="ulamak"]'); await pg.waitForTimeout(400);
  semak(await pg.evaluate(() => MyPolitikPAS.dewanPemain(MyPolitikSave.loadPlayer(), 'ulamak').ahli), 'sertai Dewan Ulamak');
  const kr = await pg.evaluate(() => { const h = window.NusaPaparan.htmlKerusi(MyPolitikSave.loadPlayer()); const d = document.createElement('div'); d.innerHTML = h; return d.textContent; });
  semak(/Perikatan Nasional \(★ parti anda\)/.test(kr) && /Barisan Nasional/.test(kr) && /Kerajaan negeri: Perikatan Nasional/.test(kr), 'kad kerusi PN (pembangkang persekutuan, kerajaan negeri): ' + kr.slice(0, 160));
  await pg.click('#tab-dewan').catch(() => {}); await pg.waitForTimeout(600);
  const hm = await pg.evaluate(() => { const h = document.querySelector('#panel-dewan .dw-hemi'); return h ? { leg: h.querySelector('.dw-hemi-leg').textContent, n: h.querySelectorAll('circle').length } : null; });
  semak(hm && /PN/.test(hm.leg) && /BN/.test(hm.leg) && hm.n === 45, 'carta hemisikal DUN Kelantan dengan PN dan BN: ' + JSON.stringify(hm));
  if (process.env.SKRIN) { await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(400); const k = await pg.$('.pas-kad'); if (k) { await k.screenshot({ path: process.env.SKRIN }).catch(() => {}); } }
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  await pg.click('[data-tab="profil"]').catch(() => {}); await pg.waitForTimeout(500);
  const bocor = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('.pas-kad'); if (!k) { return ['(tiada kad)']; } const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t.slice(0, 140)); } } return out; }, BM.source);
  semak(bocor.length === 0, 'EN: tiada BM bocor dalam kad PAS:\n    ' + bocor.slice(0, 15).join('\n    '));
  const bocorSemua = [];
  for (const tab of ['profil', 'tindakan', 'pemilihan', 'mesyuarat', 'dewan']) {
    await pg.click('[data-tab="' + tab + '"]').catch(() => {}); await pg.waitForTimeout(500);
    const b = await pg.evaluate(([src, tb]) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('#panel-' + tb); if (!k) { return ['(tiada panel ' + tb + ')']; } const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); const pe = n.parentElement; if (t && re.test(t) && pe && pe.offsetParent !== null && !pe.closest('select')) { out.push(t.slice(0, 120)); } } return out; }, [BM.source, tab]);
    b.forEach((x) => bocorSemua.push(tab + ': ' + x));
  }
  if (process.env.SENARAI) { console.log(bocorSemua.join('\n')); }
  semak(bocorSemua.length === 0, 'EN: tiada BM bocor dalam tab dashboard PAS (' + bocorSemua.length + '):\n    ' + bocorSemua.slice(0, 20).join('\n    '));
  await pg.evaluate(() => MyPolitikI18n.setLanguage('BM')); await pg.waitForTimeout(300);
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { keahlianJenis: 'bersekutu', jawatanList: [] } }); NusaUI.render(); });
  await pg.click('[data-tab="profil"]').catch(() => {}); await pg.waitForTimeout(400);
  const pf3 = await pg.textContent('.pas-kad');
  semak(/Ahli Bersekutu/.test(pf3) && /Dewan Himpunan Pendukung/.test(pf3) && !/Dewan Ulamak/.test(pf3.replace(/Ketua Dewan Ulamak Pusat/, '')), 'Ahli Bersekutu: Dewan Himpunan Pendukung sahaja: ' + pf3.replace(/\s+/g, ' ').slice(pf3.indexOf('Dewan PAS') - 10, pf3.indexOf('Dewan PAS') + 300));
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(600);
  const bocor3 = await pg.evaluate((src) => { const re = new RegExp(src, 'i'), out = []; const k = document.querySelector('.pas-kad'); const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t.slice(0, 140)); } } return out; }, BM.source);
  semak(bocor3.length === 0, 'EN Ahli Bersekutu: tiada BM bocor:\n    ' + bocor3.slice(0, 10).join('\n    '));
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian PAS lulus.'); process.exit(gagal.length ? 1 : 0);
})();
