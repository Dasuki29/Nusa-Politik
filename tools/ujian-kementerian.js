#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-kementerian.js   (v13.77)
   Ujian pelayar (Playwright): tab kementerian generik (Pendidikan, Kesihatan, Ekonomi): meter, tindakan,
   dasar, isu, dan EN tanpa BM bocor. Guna: node tools/ujian-kementerian.js [kpm|kkm|ke], dan EN tanpa BM bocor. Dilangkau jika Playwright atau Chromium tiada.
   Guna: node tools/ujian-kementerian.js
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
let PW = null; for (const c of [process.env.PLAYWRIGHT_PATH, 'playwright', '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean)) { try { PW = require(c); break; } catch (e) { /* seterusnya */ } }
if (!PW) { console.log('Playwright tiada: ujian kementerian dilangkau.'); process.exit(0); }
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
  const BOCOR = async (sel) => pg.evaluate(([src, s]) => { const re = new RegExp(src, 'i'), out = []; document.querySelectorAll(s).forEach((k) => { const w = document.createTreeWalker(k, 4); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (t && re.test(t)) { out.push(t); } } }); return out; }, [BM.source, sel]);
  const SENARAI = { kpm: 'Menteri Pendidikan', kkm: 'Menteri Kesihatan', ke: 'Menteri Ekonomi', kpkt: 'Menteri Perumahan dan Kerajaan Tempatan', sabahkm: { nama: 'Ketua Menteri Sabah', role: 'MENTERI_BESAR', negeri: 'Sabah' }, premier: { nama: 'Premier Sarawak', role: 'MENTERI_BESAR', negeri: 'Sarawak', parti: 'PBB' }, mb: { nama: 'Menteri Besar Johor', role: 'MENTERI_BESAR', negeri: 'Johor', parti: 'UMNO' }, kmsj: { nama: 'Ketua Menteri Melaka', role: 'MENTERI_BESAR', negeri: 'Melaka', parti: 'UMNO' } };
  const pilih = process.argv[2] ? [process.argv[2]] : Object.keys(SENARAI);
  for (const kunci of pilih) {
    const ada = await pg.evaluate((k) => MyPolitikKementerian.senarai().some((x) => x.def.kunci === k), kunci);
    if (!ada) { continue; }
    await pg.evaluate(([kunci, nama]) => { MyPolitikI18n.setLanguage('BM'); const p = MyPolitikSave.loadPlayer(), k = MyPolitikKabinet.getKabinet(p); const sp = typeof nama === 'object' ? nama : { nama: nama, role: 'MENTERI_PENUH' }; Object.assign(k, { hasGovernmentRole: true, roleLevel: sp.role, portfolioName: sp.nama, portfolioId: '', lobi: null, acara: null });
      const mod = MyPolitikKementerian.senarai().find((x) => x.def.kunci === kunci), st = mod.get({}); st.dana = 200; st.isu = { id: Object.keys(mod.def.isu)[0], bulan: 0 };
      const patch = { kabinet: k, tahun: 2027, bulan: 4, ap: 10 }; if (sp.negeri) { patch.negeri = sp.negeri; } if (sp.parti) { patch.parti = sp.parti; } patch[kunci] = st; MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: patch }); NusaUI.render(); }, [kunci, SENARAI[kunci]]);
    await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(400);
    semak(await pg.$('[data-pru="exco-tab"][data-id="' + kunci + '"]') !== null, kunci + ': tab');
    await pg.click('[data-pru="exco-tab"][data-id="' + kunci + '"]'); await pg.waitForTimeout(400);
    const SK = async (f) => { if (f) { await (await pg.$('.kdn-m')).evaluate((e) => { e.closest('section').id = 'skr-km'; }); await (await pg.$('#skr-km')).screenshot({ path: f.replace('.png', '-' + kunci + '.png') }).catch(() => {}); } };
    await SK(process.env.SKRIN);
    await pg.click('[data-kem="laksana"][data-mod="' + kunci + '"]'); await pg.waitForTimeout(300);
    semak(await pg.evaluate((k) => { const mod = MyPolitikKementerian.senarai().find((x) => x.def.kunci === k), r = mod.ringkasan(MyPolitikSave.loadPlayer()); return r.kumpulan.length ? r.kumpulan.some((g) => g.sudah) : r.tindakanSudah; }, kunci), kunci + ': tindakan dikunci');
    const d = await pg.$('[data-kem="dasar"]:not([disabled])'); if (d) { await d.click(); await pg.waitForTimeout(300);
    semak(await pg.$$eval('[data-kem="dasar"]:not([disabled])', (l) => l.length) === 0, kunci + ': dasar dikunci'); }
    await pg.click('[data-kem="isu"]'); await pg.waitForTimeout(300);
    await pg.evaluate((kunci) => { const p = MyPolitikSave.loadPlayer(), mod = MyPolitikKementerian.senarai().find((x) => x.def.kunci === kunci), ks = Object.keys(mod.def.isu); p[kunci].isu = { id: ks[ks.length - 1], bulan: 0 }; p[kunci].isuBulan = 0; p[kunci].tindakanBulan = 0; p[kunci].projek = [{ id: (mod.def.tindakan.find((t) => t.siap) || mod.def.tindakan[0]).id, siapIdx: 2027 * 12 + 9 }];
      const pt = {}; pt[kunci] = p[kunci]; MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: pt }); MyPolitikI18n.setLanguage('EN'); }, kunci);
    await pg.waitForTimeout(700); await pg.click('[data-tab="tindakan"]').catch(() => {}); await pg.waitForTimeout(400);
    const b1 = await pg.evaluate(([src]) => { const re = new RegExp(src + "|\\b(sebulan|juta|bilion|kepuasan|siap|isu|dasar|tindakan|kualiti|berjaya|gagal|kos|dana|sasaran|seimbang|rendah)\\b", "i"), out = []; const s = document.querySelector(".kdn-m").closest('section'); const w = document.createTreeWalker(s, 4); let x; while ((x = w.nextNode())) { const t = x.textContent.trim(); if (t && re.test(t)) { out.push(t); } } return out; }, [BM.source]);
    semak(b1.length === 0, kunci + ' EN: BM bocor:\n    ' + b1.slice(0, 12).join('\n    '));
    await SK(process.env.SKRIN2);
  }
  semak(ralat.length === 0, 'ralat JavaScript: ' + ralat.slice(0, 3).join(' | '));
  await br.close(); srv.close();
  console.log(gagal.length ? 'GAGAL:\n - ' + gagal.join('\n - ') : 'Ujian kementerian lulus.'); process.exit(gagal.length ? 1 : 0);
})();
