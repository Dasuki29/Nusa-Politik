#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-pbb.js   (v8.32)
   Ujian pelayar (Playwright): daftar sebagai ahli PBB, dashboard dibuka dengan penjenamaan PBB dan peta Sarawak.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-pbb.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
const exe = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean).filter((c) => fs.existsSync(c))[0];
if (!PW || !exe) { console.log('Playwright/Chromium tiada: ujian PBB dilangkau.'); process.exit(0); }
const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.webmanifest': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' }); r.end(fs.readFileSync(f)); });
const gagal = []; const semak = (ok, msg) => { if (!ok) { gagal.push(msg); } };
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const br = await PW.chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const pg = await (await br.newContext({ viewport: { width: 420, height: 900 } })).newPage();
  const ralat = []; pg.on('pageerror', (e) => ralat.push(e.message));
  await pg.route('**/*', (rt) => { if (rt.request().url().startsWith(base)) { rt.continue(); } else { rt.abort(); } });
  await pg.goto(base + '/index.html'); await pg.waitForTimeout(1200);
  await pg.click('text=Permainan baharu'); await pg.waitForTimeout(1000);
  await pg.selectOption('#s-parti', 'PBB'); await pg.waitForTimeout(2500);
  semak((await pg.getAttribute('.brand__img', 'src')).indexOf('logo-nusa') >= 0, 'logo Nusa Politik (neutral) pada skrin pendaftaran');
  semak(/Nusa Politik/.test(await pg.textContent('.brand')) && !/UMNO|PBB/.test(await pg.textContent('.brand')), 'jenama neutral pada skrin pendaftaran');
  semak((await pg.$$eval('#s-bahagian option', (o) => o.length)) === 83, '82 Bahagian (DUN)');
  await pg.selectOption('#s-bahagian', { index: 3 }); await pg.waitForTimeout(300);
  semak((await pg.$$eval('#s-cawangan option', (o) => o.length)) > 2, 'cawangan (DM) dimuatkan');
  await pg.selectOption('#s-cawangan', { index: 2 });
  await pg.fill('#f-nama', 'Awang Uji'); await pg.fill('#f-umur', '25'); await pg.check('input[name=jantina][value=P]').catch(() => pg.check('input[name=jantina] >> nth=1'));
  const sy = await pg.$$eval('#sayap-grid .sy', (l) => l.map((x) => x.dataset.kod + ':' + (getComputedStyle(x).display === 'none' ? 'x' : 'o') + (x.querySelector('input').disabled ? '-' : '+')).join());
  semak(/puteri:x/.test(sy) && /wanita:o\+/.test(sy), 'sayap PBB: tiada Puteri, Wanita dibuka (' + sy + ')');
  await pg.click('#btn-submit'); await pg.waitForTimeout(3500);
  semak(/dashboard\.html/.test(pg.url()), 'beralih ke dashboard');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } }); await pg.waitForTimeout(400);
  semak((await pg.getAttribute('.brand__img', 'src')).indexOf('logo-pbb') >= 0, 'logo PBB pada dashboard');
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(400); }
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } }); await pg.waitForTimeout(400);
  for (const t of ['tindakan', 'profil', 'pemilihan', 'mesyuarat']) { await pg.click('[data-tab="' + t + '"]'); await pg.waitForTimeout(400); }
  await pg.click('[data-tab="profil"]'); await pg.waitForTimeout(400);
  for (const tb of ['tindakan', 'profil', 'pemilihan', 'mesyuarat']) {
    const tk = await pg.textContent('#panel-' + tb);
    semak(!/\bMKT\b|\bPAU\b|Majlis Kerja Tertinggi/.test(tk), 'istilah PBB: tiada MKT / PAU dalam tab ' + tb + (/\bMKT\b|\bPAU\b|Majlis Kerja Tertinggi/.test(tk) ? ' (' + (tk.match(/.{20}(\bMKT\b|\bPAU\b|Majlis Kerja Tertinggi).{20}/) || [''])[0] + ')' : ''));
  }
  const semuaTeks = (await Promise.all(['tindakan', 'profil', 'pemilihan', 'mesyuarat'].map((tb) => pg.textContent('#panel-' + tb)))).join(' ');
  semak(/\bMT\b|Majlis Tertinggi|Perhimpunan Agung PBB|\bPA\b/.test(semuaTeks), 'istilah PBB: Majlis Tertinggi (MT) / Perhimpunan Agung PBB (PA) muncul');
  { // v10.6: dashboard parti Sarawak
    const semuaDash = (await Promise.all(['tindakan', 'profil', 'pemilihan', 'mesyuarat'].map((tb) => pg.textContent('#panel-' + tb)))).join(' ');
    semak(!/Laluan Karier Sebenar/.test(semuaDash), 'v10.6: kad Laluan Karier Sebenar dibuang');
    semak(!/Fasal 9\.5|Fasal 15\.5/.test(semuaDash), 'v10.6: tiada Fasal 9.5 / 15.5 dalam tab');
    semak(!/Ketua Puteri|Puteri atau Wanita|, Puteri/.test(semuaDash), 'v10.6: tiada Puteri dalam tab');
    semak(!(await pg.isVisible('[data-perlembagaan]')), 'v10.6: butang Perlembagaan (UMNO) disembunyi');
    await pg.click('#btn-menu'); await pg.waitForTimeout(400); await pg.click('#btn-struktur'); await pg.waitForTimeout(600);
    const st = await pg.textContent('#modal-isi');
    semak(!/Perhubungan/.test(st) && !/Puteri/.test(st), 'v10.6: struktur organisasi tiada Badan Perhubungan negeri / Puteri');
    await pg.click('[data-org="induk"]'); await pg.waitForTimeout(300); const stI = await pg.textContent('#modal-isi');
    semak(/Yang Dipertua \/ Presiden/.test(stI) && /Pengerusi Tetap/.test(stI) && /Naib Yang Dipertua Kanan/.test(stI) && /Setiausaha Agung/.test(stI), 'v10.6: struktur Majlis Tertinggi PBB ikut gambar rujukan');
    await pg.screenshot({ path: process.env.SS_STRUKTUR || '/tmp/struktur-pbb.png' });
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
  }
  semak(/Kerusi DUN Anda/.test(await pg.textContent('#panel-profil')) && /Lawan utama/.test(await pg.textContent('#panel-profil')), 'kad Kerusi DUN Anda dalam tab Profil');
  semak(/Kerusi Parlimen Anda/.test(await pg.textContent('#panel-profil')) && /Pilihan raya seterusnya/.test(await pg.textContent('#panel-profil')), 'kad Kerusi Parlimen Anda dalam tab Profil (v9.4)');
  const pem = await pg.textContent('#panel-profil');
  semak(/Pindah Ranting/.test(pem) && !/belum dibuka/.test(pem) && /Hanya antara Cawangan dan Ranting di Sarawak/.test(pem), 'kad Pindah Cawangan PBB dibuka (v9.5)');
  await pg.click('[data-tab="peta"]'); await pg.waitForTimeout(4000);
  semak((await pg.$$eval('#peta-host svg path', (p) => p.length)) === 82, 'peta DUN Sarawak (82 kawasan)');
  semak(!/UMNO/.test(await pg.evaluate(() => document.body.innerText)), 'tiada perkataan UMNO tertinggal dalam dashboard PBB');
  /* v11.2: krisis tempatan kelihatan dan boleh diselesaikan di peta Sarawak */
  await pg.evaluate(() => { const S = MyPolitikSave, p = S.loadPlayer(); S.applyEffects({}, { kiraTindakan: false, patch: { jawatanList: (p.jawatanList || []).concat([{ kod: 'ajk_cawangan', jawatan: 'AJK Cawangan', peringkat: 'cawangan', tahun: p.tahun, bulan: p.bulan }]), krisisPeta: null } }); MyPolitikKrisisPeta.prosesBulan({ rng: () => 0 }); });
  await pg.click('[data-tab="tindakan"]'); await pg.waitForTimeout(300); await pg.click('[data-tab="peta"]'); await pg.waitForTimeout(800);
  await pg.evaluate(() => { const b = document.querySelector('#peta-host [data-act="metrik"][data-v="kekuatan"]'); if (b) { b.click(); } }); await pg.waitForTimeout(500);   // paksa toolbar dilukis semula
  semak((await pg.$$('#peta-host .mpm-krisis [data-act="krisis"]')).length === 1, 'bar krisis tempatan di Peta Pengaruh Sarawak');
  await pg.click('#peta-host .mpm-krisis [data-act="krisis"]'); await pg.waitForTimeout(500); await pg.click('#modal [data-pilih="abai"]'); await pg.waitForTimeout(800);
  semak((await pg.$$('#peta-host .mpm-krisis')).length === 0, 'krisis diselesaikan dari bar');
  semak((await pg.$$('#mpm-tab-pdm')).length === 1 && (await pg.$$('#mpm-tab-negeri')).length === 0, 'Peta Pengaruh Sarawak: tab DUN dan DM sahaja');
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian PBB lulus.'); process.exit(gagal.length ? 1 : 0);
})();
