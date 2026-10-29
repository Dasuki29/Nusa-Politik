#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-perlembagaan.js   (v13.4)
   Ujian pelayar (Playwright): menu Perlembagaan UMNO bertab (6 dokumen buku UMNO 2025) dan Struktur Organisasi Fasa A
   (Timbalan Ketua Cawangan, AJK 15/20, Naib Ketua ex-officio). Mod EN: tiada teks BM bocor dalam modal Perlembagaan.
   Dilangkau (kod keluar 0) jika Playwright atau Chromium tiada. Guna: node tools/ujian-perlembagaan.js   (GAMBAR=folder untuk tangkapan skrin)
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const P = require('./persekitaran');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian Perlembagaan dilangkau.'); process.exit(0); }
const exe = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean).filter((c) => fs.existsSync(c))[0];
P.muat(); P.daftar({ nama: 'Amir Hakim', jantina: 'L', umur: 28, sayap: 'pemuda' });
const BEKAL = {}; P.muat().localStorage._peta.forEach((v, k) => { BEKAL[k] = v; });
const ROOT = path.join(__dirname, '..'), GAMBAR = process.env.GAMBAR || '';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff', '.webmanifest': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' }); r.end(fs.readFileSync(f)); });
const gagal = []; const semak = (ok, msg) => { if (!ok) { gagal.push(msg); } };
const BM = /\b(yang|dan|untuk|dengan|anda|kepada|telah|akan|tidak|sudah|ialah|dalam|pada|atau|boleh|mesti|setiap|bulan|tahun|sebagai|daripada|ahli|dipilih|dilantik|jawatan|hendaklah|sekurang-kurangnya|parti)\b/i;
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const br = await PW.chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
  const pg = await (await br.newContext({ viewport: { width: 420, height: 900 } })).newPage();
  const ralat = []; pg.on('pageerror', (e) => ralat.push(e.message));
  await pg.route('**/*', (rt) => { if (rt.request().url().startsWith(base)) { rt.continue(); } else { rt.abort(); } });
  await pg.addInitScript((d) => { try { if (!localStorage.getItem('myPolitik_player')) { Object.keys(d).forEach((k) => localStorage.setItem(k, d[k])); } } catch (e) { /* abaikan */ } }, BEKAL);
  await pg.goto(base + '/dashboard.html'); await pg.waitForSelector('#kandungan:not([hidden])');
  await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) { /* abaikan */ } });
  await pg.addStyleTag({ content: '.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}' });
  for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
  // Struktur Organisasi
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { jawatan: 'Timbalan Ketua Cawangan', jawatanList: [{ kod: 'naib_ketua_cawangan', jawatan: 'Timbalan Ketua Cawangan', peringkat: 'cawangan', kumpulan: 'utama', pangkat: 2.5, tahun: 2026 }] } }); NusaUI.render(); });
  const st = await pg.evaluate(() => { const s = MyPolitikOrganisasi.getStruktur(MyPolitikSave.loadPlayer()); return { naib: s.induk.cawangan.naib, ajkC: s.induk.cawangan.bilAjk, ajkB: s.induk.bahagian.bilAjk, ex: s.induk.bahagian.tambahan.map((x) => x.jawatan) }; });
  semak(st.naib.jawatan === 'Timbalan Ketua Cawangan' && st.naib.pemain, 'Timbalan Ketua Cawangan dipegang pemain');
  semak(st.ajkC === 15 && st.ajkB === 20, 'AJK 15/20 (' + st.ajkC + '/' + st.ajkB + ')');
  semak(st.ex.filter((x) => /Naib Ketua Bahagian \(Ketua/.test(x)).length === 3, 'Naib Ketua Bahagian ex-officio');
  // Perlembagaan bertab
  await pg.click('#btn-menu'); await pg.waitForTimeout(300); await pg.click('[data-perlembagaan]'); await pg.waitForTimeout(400);
  const tab = await pg.$$eval('.plb [data-plb-tab]', (b) => b.map((x) => x.textContent));
  semak(tab.length === 6, '6 tab dokumen (' + tab.join(', ') + ')');
  semak((await pg.$$eval('.plb [data-plb-panel="perlembagaan"] .plb-fasal', (s) => s.length)) === 16, '16 Fasal Perlembagaan');
  if (GAMBAR) { await pg.click('[data-plb="buka-semua"]'); await pg.waitForTimeout(200); await pg.screenshot({ path: path.join(GAMBAR, 'plb-perlembagaan.png') }); }
  for (const id of ['persidangan', 'wanita', 'pemuda', 'puteri', 'tataetika']) {
    await pg.click('[data-plb-tab="' + id + '"]'); await pg.waitForTimeout(200);
    semak(await pg.$eval('[data-plb-panel="' + id + '"]', (x) => !x.hidden && x.querySelectorAll('.plb-fasal').length > 3), 'tab ' + id + ' dipaparkan');
    if (GAMBAR && id === 'puteri') { await pg.click('[data-plb="buka-semua"]'); await pg.waitForTimeout(200); await pg.screenshot({ path: path.join(GAMBAR, 'plb-puteri.png') }); }
  }
  // EN
  await pg.click('.plb__tutup'); await pg.waitForTimeout(200);
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN')); await pg.waitForTimeout(700);
  await pg.click('#btn-menu').catch(() => {}); await pg.waitForTimeout(300); await pg.click('[data-perlembagaan]'); await pg.waitForTimeout(500);
  const bocor = [];
  for (const id of ['perlembagaan', 'persidangan', 'wanita', 'pemuda', 'puteri', 'tataetika']) {
    await pg.click('[data-plb-tab="' + id + '"]'); await pg.click('[data-plb="buka-semua"]'); await pg.waitForTimeout(300);
    const b = await pg.evaluate((a) => { const re = new RegExp(a.src, 'i'), out = [], k = document.querySelector('[data-plb-panel="' + a.id + '"]'); const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.nodeValue.trim(); if (t && re.test(t.replace(/Yang di-Pertuan/g, ''))) { out.push(a.id + ': ' + t.slice(0, 90)); } } return out; }, { src: BM.source, id });
    bocor.push(...b);
  }
  if (GAMBAR) { await pg.click('[data-plb-tab="perlembagaan"]'); await pg.waitForTimeout(300); await pg.screenshot({ path: path.join(GAMBAR, 'plb-en.png') }); }
  semak(bocor.length === 0, 'EN: BM bocor dalam Perlembagaan (' + bocor.length + '):\n    ' + bocor.slice(0, 15).join('\n    '));
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian Perlembagaan lulus.'); process.exit(gagal.length ? 1 : 0);
})();
