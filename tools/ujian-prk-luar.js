/* Nusa Politik — tools/ujian-prk-luar.js (v13.47): ujian pelayar PRK luar kawasan (kad tab Pemilihan, bantu kempen, EN). Guna: node tools/ujian-prk-luar.js [folder-tangkapan] [BM|EN] */
const fs = require('fs'), path = require('path'), http = require('http'); const PW = require('playwright'); const P = require('./persekitaran');
const ROOT = path.join(__dirname, '..'); const g = P.muat(); P.daftar({ nama: 'Amir Hakim', jantina: 'L', umur: 40, sayap: 'utama' });
P.tetap({ ap: 10, myr: 50000, jawatanList: [] });
{ const p = g.MyPolitikSave.loadPlayer(); g.MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { prkLuar: { aktif: { id: 'x', idx: 99999, tahun: p.tahun, bulan: p.bulan, dun: false, kerusi: 'P.105 Petaling Jaya', negeri: 'Selangor', dari: 'PH', calon: 'PARTI', lawan: 'PH', pertahan: false, asas: 46.5, bantuan: 0, sumbangan: 0, tindakan: {}, dana: 0 },
  sejarah: [{ tahun: p.tahun, bulan: p.bulan, dun: false, kerusi: 'P.077 Tanjong Malim', negeri: 'Perak', calon: 'RAKAN', pertahan: true, menang: true, undi: 53.2, sumbangan: 5, reputasi: 2, hubungan: 3 }] } } }); }
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
    await pg.evaluate(() => NusaUI.gotoTab('pemilihan')); await pg.waitForTimeout(600);
    const k = await pg.$('.prkl'); if (!k) { gagal.push(n + ': kad PRK luar kawasan tiada'); }
    if (k && n === 'd') {
      await pg.click('[data-prkl="jentera"]'); await pg.waitForTimeout(400); await pg.click('[data-prkl="dana"]'); await pg.waitForTimeout(400);
      const s = await pg.evaluate(() => MyPolitikPRKLuar.getPL(MyPolitikSave.loadPlayer()).aktif); if (!s || s.sumbangan !== 3) { gagal.push('bantuan tidak direkod: ' + JSON.stringify(s && s.sumbangan)); }
      const tx = await (await pg.$('.prkl')).textContent(); if (!/(✔ Dibuat|✔ Done)/.test(tx)) { gagal.push('butang Dibuat tiada'); }
      if (process.argv[3] === 'EN') { const bm = await pg.evaluate(() => { const t = document.querySelector('.prkl').innerText; return /(Bantu kempen|Anggaran undi|Sumbangan anda|Hantar jentera|mata\b|Keputusan PRK)/.test(t) ? t : ''; }); if (bm) { gagal.push('BM bocor dalam EN: ' + bm.slice(0, 300)); } }
    }
    if (k && out) { const k2 = await pg.$('.prkl'); await k2.screenshot({ path: out + '/prkl-' + n + '.png' }); }
    if (er.length) { gagal.push(n + ': ralat ' + er.join(' | ')); }
  }
  await br.close(); srv.close();
  if (gagal.length) { console.log('GAGAL:\n - ' + gagal.join('\n - ')); process.exit(1); } else { console.log('Ujian PRK luar kawasan lulus.'); }
})();
