/* Nusa Politik — tools/ujian-pembangkang.js (v13.50): ujian pelayar Ketua Pembangkang (kad tab Dewan, Soalan Lisan, Bahas RUU, Kabinet Bayangan, EN). Guna: node tools/ujian-pembangkang.js [folder-tangkapan] [BM|EN] */
const fs = require('fs'), path = require('path'), http = require('http'); const PW = require('playwright'); const P = require('./persekitaran');
const ROOT = path.join(__dirname, '..'); const g = P.muat(); P.daftar({ nama: 'Amir Hakim', jantina: 'L', umur: 40, sayap: 'utama' });
{ const p0 = g.MyPolitikSave.loadPlayer();
  P.tetap({ bulan: 10, jawatanList: [{ kod: 'presiden', jawatan: 'Presiden', peringkat: 'pusat', kumpulan: 'utama', pangkat: 12, tahun: 2026 }], ap: 20, myr: 100000, reputasi: 50,
    kerusiNasional: { tahun: p0.tahun, bulan: p0.bulan, parti: 70, rakan: 30, pembangkang: 119, bebas: 3, kerajaan: false } });
  P.tetap({ pru: Object.assign({}, g.MyPolitikPRU.getPRU(g.MyPolitikSave.loadPlayer()), { status: { jenis: 'MP', kerusi: 'Pekan', kerajaan: false } }) });
  g.MyPolitikPembangkang.prosesBulan(); }
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
    await pg.evaluate(() => NusaUI.gotoTab('dewan')); await pg.waitForTimeout(600);
    const k = await pg.$('.pbg'); if (!k) { gagal.push(n + ': kad Ketua Pembangkang tiada'); }
    if (k && n === 'd') {
      await pg.click('[data-pbg="soalan"]'); await pg.waitForTimeout(400); await pg.click('[data-pbg="ruu:bantah"]'); await pg.waitForTimeout(400);
      const sel = await pg.$$('.pbg select[data-pbg-port]'); for (let i = 0; i < sel.length; i++) { const s2 = (await pg.$$('.pbg select[data-pbg-port]'))[i]; const v = await s2.evaluate((e, i) => e.options[i + 1].value, i); await s2.selectOption(v); await pg.waitForTimeout(80); }
      await pg.click('[data-pbg="bayangan"]'); await pg.waitForTimeout(500);
      const s = await pg.evaluate(() => MyPolitikPembangkang.getPB(MyPolitikSave.loadPlayer())); if (!s || s.ruuSesi === 0 || s.soalanIdx === 0 || !s.bayangan) { gagal.push('tindakan tidak direkod: ' + JSON.stringify(s).slice(0, 200)); }
      if (process.argv[3] === 'EN') { const bm = await pg.evaluate(() => { const t = document.querySelector('.pbg').innerText; return /(Ketua Pembangkang|Naratif|Soalan Lisan|Tindakan Dewan|Kabinet Bayangan|kerusi|sebulan)/.test(t) ? t : ''; }); if (bm) { gagal.push('BM bocor dalam EN: ' + bm.slice(0, 400)); } }
    }
    if (k && out) { const k2 = await pg.$('.pbg'); await k2.screenshot({ path: out + '/pbg-' + n + '.png' }); }
    if (er.length) { gagal.push(n + ': ralat ' + er.join(' | ')); }
  }
  await br.close(); srv.close();
  if (gagal.length) { console.log('GAGAL:\n - ' + gagal.join('\n - ')); process.exit(1); } else { console.log('Ujian Ketua Pembangkang lulus.'); }
})();
