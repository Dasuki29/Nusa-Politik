/* Nusa Politik — tools/ujian-senat.js (v14.21): ujian pelayar Dewan Negara (kad Senator, lantikan, tab Dewan Negara, undi RUU, tugas, EN). Guna: node tools/ujian-senat.js [folder-tangkapan] [BM|EN] */
const fs = require('fs'), path = require('path'), http = require('http'); const PW = require('playwright'); const P = require('./persekitaran');
const ROOT = path.join(__dirname, '..'); const g = P.muat(); P.daftar({ nama: 'Aminah Senator', jantina: 'P', umur: 45, sayap: 'utama' });
P.tetap({ ap: 10, myr: 50000, tahun: 2027, bulan: 7, reputasi: 70, jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: 2026 }], jawatan: 'Ketua Bahagian' });
const BEKAL = {}; g.localStorage._peta.forEach((v, k) => { BEKAL[k] = v; }); BEKAL.nusaLang = process.argv[3] || 'BM';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port; const br = await PW.chromium.launch(); const out = process.argv[2] || null; const gagal = [];
  const EN = process.argv[3] === 'EN', RE = /(Senator Dewan Negara|dilantik Agong|Lantikan atas nasihat|Dipilih DUN|Lobi Presiden|Mohon pencalonan|Pengaruh Senat|Hubungan Kerajaan|Kehadiran|Komposisi Dewan|RUU dari Dewan|Cadang pindaan|Tugas bulanan|Bahas RUU|Soalan kepada Menteri|Jawatankuasa Pilihan|Sokong|Tolak|Lulus Dewan Rakyat|kerajaan ·)/;
  const sembunyi = '.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}';
  for (const [w, n] of [[1280, 'd'], [420, 'm']]) {
    const pg = await br.newPage({ viewport: { width: w, height: 900 } }); const er = []; pg.on('pageerror', (e) => er.push(e.message));
    await pg.route('**/*', (rt) => rt.request().url().startsWith(base) ? rt.continue() : rt.abort());
    await pg.addInitScript((d) => { if (sessionStorage.getItem('__bekal')) { return; } sessionStorage.setItem('__bekal', '1'); Object.keys(d).forEach((k) => localStorage.setItem(k, d[k])); }, BEKAL);
    await pg.goto(base + '/dashboard.html'); await pg.waitForSelector('#kandungan:not([hidden])');
    await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) {} }); await pg.addStyleTag({ content: sembunyi });
    for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
    await pg.evaluate(() => NusaUI.subProfil('jawatan')); await pg.waitForTimeout(300);
    const kad = await pg.$('.sn-kad'); if (!kad) { gagal.push(n + ': kad Senator tiada'); } else {
      if (EN) { const t = await kad.innerText(); if (RE.test(t)) { gagal.push(n + ': BM bocor (kad): ' + t.slice(0, 400)); } }
      if (out) { await kad.screenshot({ path: out + '/senat-kad-' + n + '.png' }); }
      await pg.evaluate(() => MyPolitikSenat.setRng(() => 0)); await pg.click('.sn-kad [data-sn="mohon:pm"]'); await pg.waitForTimeout(400);
      if (!(await pg.evaluate(() => MyPolitikSenat.aktif(MyPolitikSave.loadPlayer())))) { gagal.push(n + ': tidak dilantik'); }
    }
    const lbl = await pg.$eval('#tab-dewan', (t) => (t.hidden ? 'TERSEMBUNYI' : t.textContent)); if (!/Dewan Negara|Senate/.test(lbl)) { gagal.push(n + ': label tab Dewan ' + lbl); }
    await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { bulan: 8, ap: 10 } }); MyPolitikSenat.setRng(() => 0.3); MyPolitikSenat.prosesBulan(); NusaUI.gotoTab('dewan'); });
    await pg.waitForTimeout(400);
    const bil = await pg.$$eval('.sn-panel .sn-ruu', (x) => x.length); if (bil !== 2) { gagal.push(n + ': RUU ' + bil); }
    if (EN) { const t = await (await pg.$('.sn-panel')).innerText(); if (RE.test(t)) { gagal.push(n + ': BM bocor (panel): ' + t.slice(0, 500)); } }
    if (out) { await (await pg.$('.sn-panel')).screenshot({ path: out + '/senat-panel-' + n + '.png' }); }
    await pg.click('.sn-panel .sn-ruu [data-sn$=":sokong"]'); await pg.waitForTimeout(300);
    if (await pg.$$eval('.sn-panel .sn-ruu', (x) => x.length) !== 1) { gagal.push(n + ': undi tidak direkod'); }
    await pg.click('.sn-panel [data-sn="tugas:bahas"]'); await pg.waitForTimeout(300);
    if (!(await pg.$eval('.sn-panel [data-sn="tugas:bahas"]', (b) => b.disabled))) { gagal.push(n + ': bahas tidak dikunci'); }
    if (er.length) { gagal.push(n + ': ralat ' + er.join(' | ')); }
    await pg.close();
  }
  await br.close(); srv.close();
  if (gagal.length) { console.log('GAGAL:\n - ' + gagal.join('\n - ')); process.exit(1); } else { console.log('Ujian Dewan Negara lulus.'); }
})();
