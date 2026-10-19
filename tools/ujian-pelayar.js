#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian-pelayar.js   (v8.2)
   Ujian asap pelayar (Playwright) dalam mod EN. Pilihan: dilangkau (kod keluar 0) jika Playwright atau Chromium tiada.
     npm i -g playwright   (atau di mana-mana yang boleh di-require)   +   PLAYWRIGHT_BROWSERS_PATH / CHROMIUM_PATH
   Apa yang diuji (tiada rangkaian; hos luar disekat):
     1. Dashboard dibuka dengan pemain contoh (dibina oleh tools/persekitaran.js), tutorial dilangkau, bahasa EN.
     2. Setiap tab dibuka dan tiada ralat JavaScript.
     3. Beberapa bulan dimainkan (jawab acara, tekan Bulan Seterusnya): tiada teks BM bocor dalam nod teks.
     4. Latihan Amir dibuka dan dilangkah dalam EN: tiada teks BM bocor.
   Guna:  node tools/ujian-pelayar.js            (BULAN=12 untuk lebih lama)
   ========================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const P = require('./persekitaran');

function cariPlaywright() {
  const calon = [process.env.PLAYWRIGHT_PATH, 'playwright', path.join(process.env.HOME || '', '.npm-global/lib/node_modules/playwright'), '/usr/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright'].filter(Boolean);
  for (const c of calon) { try { return require(c); } catch (e) { /* cuba seterusnya */ } }
  return null;
}
function cariChromium() {
  const calon = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean);
  return calon.filter((c) => fs.existsSync(c))[0];
}
const PW = cariPlaywright();
if (!PW) { console.log('Playwright tiada — ujian pelayar dilangkau.'); process.exit(0); }
const exe = cariChromium();

/* Pemain contoh daripada logik sebenar (Node), disuntik ke localStorage pelayar. */
P.muat(); P.daftar({ nama: 'Amir Hakim', jantina: 'L', umur: 28, sayap: 'pemuda' });
const BEKAL = {};
P.muat().localStorage._peta.forEach((v, k) => { BEKAL[k] = v; });
BEKAL.nusaLang = 'EN';

const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const pelayan = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' }); res.end(fs.readFileSync(f));
});

const BM = /\b(yang|dan|untuk|dengan|anda|kepada|telah|akan|tidak|sudah|ialah|dalam|pada|atau|boleh|mesti|setiap|bulan|tahun|sebagai|daripada)\b/i;
/* Kata/pola BM yang dibenarkan kekal (nama sendiri, istilah UMNO, sumber luar). */
const BENAR = /(Wikipedia|mStar|Laman rasmi|data-i18n-skip)/;

(async () => {
  await new Promise((r) => pelayan.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + pelayan.address().port;
  const b = await PW.chromium.launch(exe ? { executablePath: exe } : {});
  const pg = await b.newPage({ viewport: { width: 420, height: 900 } });
  pg.setDefaultTimeout(6000);
  const ralat = [], bocor = new Set();
  pg.on('pageerror', (e) => ralat.push(e.message));
  await pg.route('**/*', (r) => { const u = new URL(r.request().url()); return u.hostname === '127.0.0.1' ? r.continue() : r.fulfill({ status: 204, body: '' }); });
  await pg.addInitScript((d) => { try { if (!localStorage.getItem('myPolitik_player')) { Object.keys(d).forEach((k) => localStorage.setItem(k, d[k])); } } catch (e) { /* abaikan */ } }, BEKAL);
  await pg.goto(base + '/dashboard.html');
  await pg.waitForSelector('#kandungan:not([hidden])');
  await pg.evaluate(() => { try { if (window.MyPolitikTutorial && MyPolitikTutorial.skip) { MyPolitikTutorial.skip(); } } catch (e) { /* abaikan */ } });
  await pg.addStyleTag({ content: '.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}' });
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN'));

  const imbas = async (etiket) => {
    const r = await pg.evaluate((reSrc) => {
      const re = new RegExp(reSrc, 'i'), w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), o = [];
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        const t = n.nodeValue.replace(/\s+/g, ' ').trim(), el = n.parentElement;
        if (!t || t.length < 6 || !el || el.closest('[data-i18n-skip],script,style,noscript,.tut-kad')) { continue; }
        if (re.test(t)) { o.push(t.slice(0, 120)); }
      }
      return o;
    }, BM.source);
    r.filter((t) => !BENAR.test(t)).forEach((t) => bocor.add(etiket + ': ' + t));
  };
  const tutup = async () => {
    for (let k = 0; k < 6; k++) {
      const m = pg.locator('.modal.is-open, #modal.is-open').first();
      if (!(await m.count())) { return; }
      const ev = m.locator('button:has-text("A.")').first();
      const emas = m.locator('.btn--gold:not([disabled]), .btn--primary:not([disabled])').first();
      if (await ev.count()) { await ev.click().catch(() => {}); } else if (await emas.count()) { await emas.click().catch(() => {}); } else { await pg.keyboard.press('Escape'); }
      await pg.waitForTimeout(250);
    }
  };

  for (const tab of ['tindakan', 'mesyuarat', 'pemilihan', 'pilihanraya', 'dewan', 'peta']) {
    const t = pg.locator('[data-tab="' + tab + '"]').first();
    if (await t.count()) { await t.click().catch(() => {}); await pg.waitForTimeout(300); await imbas('tab ' + tab); }
  }
  const bulan = parseInt(process.env.BULAN || '6', 10);
  for (let i = 0; i < bulan; i++) {
    await tutup();
    await pg.locator('#btn-tahun').click().catch(() => {});
    await pg.waitForTimeout(300); await imbas('bulan ' + (i + 1)); await tutup();
  }

  /* Latihan Amir */
  const sah = await pg.evaluate(() => !!(window.MyPolitikLatihan && MyPolitikLatihan.LANGKAH));
  if (sah) {
    await pg.evaluate(() => MyPolitikLatihan.mula());
    for (let i = 0; i < 14; i++) {
      await pg.waitForTimeout(250); await imbas('latihan ' + (i + 1));
      const seterus = pg.locator('button:has-text("Next ›")').first();
      if (await seterus.count()) { await seterus.click().catch(() => {}); } else { break; }
    }
  }

  await b.close(); pelayan.close();
  console.log('Ralat JavaScript: ' + ralat.length + (ralat.length ? '\n  - ' + ralat.slice(0, 5).join('\n  - ') : ''));
  console.log('Teks BM bocor dalam EN: ' + bocor.size + (bocor.size ? '\n  - ' + [...bocor].slice(0, 15).join('\n  - ') : ''));
  process.exit(ralat.length || bocor.size ? 1 : 0);
})().catch((e) => { console.error(e); try { pelayan.close(); } catch (x) { /* abaikan */ } process.exit(1); });
