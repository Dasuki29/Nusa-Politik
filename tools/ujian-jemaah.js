/* Nusa Politik — tools/ujian-jemaah.js (v12.1): ujian pelayar Jemaah Menteri (PM bentuk kabinet, umumkan, senarai). Guna: node tools/ujian-jemaah.js [folder-tangkapan] [BM|EN] */
const fs = require('fs'), path = require('path'), http = require('http'); const PW = require('playwright'); const P = require('./persekitaran');
const ROOT = path.join(__dirname, '..'); const g = P.muat(); P.daftar({ nama: 'Amir Hakim', jantina: 'L', umur: 40, sayap: 'utama' });
g.MyPolitikKabinet.lantikKanan('PERDANA_MENTERI');
const BEKAL = {}; g.localStorage._peta.forEach((v, k) => { BEKAL[k] = v; }); BEKAL.nusaLang = process.argv[3] || 'BM';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port; const br = await PW.chromium.launch(); const out = process.argv[2] || null; const gagal = [];
  for (const [w, n] of [[1280, 'd'], [420, 'm']]) {
    const pg = await br.newPage({ viewport: { width: w, height: 900 } }); const er = []; pg.on('pageerror', (e) => er.push(e.message));
    await pg.route('**/*', (rt) => rt.request().url().startsWith(base) ? rt.continue() : rt.abort());
    await pg.addInitScript((d) => { Object.keys(d).forEach((k) => localStorage.setItem(k, d[k])); }, BEKAL);
    await pg.goto(base + '/dashboard.html'); await pg.waitForSelector('#kandungan:not([hidden])');
    await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) {} }); await pg.addStyleTag({ content: '.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}' });
    for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
    await pg.evaluate(() => NusaUI.gotoTab('tindakan')); await pg.waitForTimeout(600);
    const k = await pg.$('.jm-kad'); if (!k) { gagal.push(n + ': kad Bentuk Jemaah Menteri tiada'); }
    if (k) { await pg.click('input[name="jm-tpm"]'); await pg.waitForTimeout(150); const tx0 = await k.textContent(); if (!/(TPM ✔)/.test(tx0)) { gagal.push(n + ': semakan TPM tidak dikemas kini'); } }
    if (k && out) { await k.screenshot({ path: out + '/jm-' + n + '.png' }); }
    if (n === 'd') {
      await pg.click('input[name="jm-tpm"][value="t:r"]');                       // v13.46: TPM ketua parti rakan
      const sel = await pg.$$('.jm-kad select[data-jm-port]');
      for (let i = 0; i < 8; i++) { const v = await sel[i].evaluate((e, i) => e.options[i + 1].value, i); await sel[i].selectOption(v); }
      await pg.evaluate(() => { document.querySelector('.jm-lain').open = true; });
      const dup = await sel[1].evaluate((e) => e.options[1].value); await sel[8].selectOption(dup); await pg.waitForTimeout(150);
      if (!/(Seorang hanya boleh memegang satu jawatan|one post)/.test(await (await pg.$('.jm-kad')).textContent())) { gagal.push('amaran duplikat tiada'); }
      await sel[8].selectOption(''); await pg.waitForTimeout(100);
      await pg.click('[data-jm="umum"]'); await pg.waitForTimeout(800);
      const k2 = await pg.$('.jm-kad'); await pg.evaluate(() => { const d = document.querySelector('.jm-senarai'); if (d) d.open = true; });
      if (k2 && out) { await k2.screenshot({ path: out + '/jm-senarai.png' }); }
      const tx = k2 ? await k2.textContent() : ''; if (!/(Senarai penuh|Full list) \(32/.test(tx)) { gagal.push('senarai penuh selepas umumkan'); }
      const tpm = await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); return p.jemaah && p.jemaah.senarai[1]; }); if (!tpm || tpm.jenis !== 'rakan') { gagal.push('TPM pilihan tidak disimpan: ' + JSON.stringify(tpm)); }
    }
    if (er.length) { gagal.push(n + ': ralat ' + er.join(' | ')); }
  }
  await br.close(); srv.close();
  if (gagal.length) { console.log('GAGAL:\n - ' + gagal.join('\n - ')); process.exit(1); } else { console.log('Ujian Jemaah Menteri lulus.'); }
})();
