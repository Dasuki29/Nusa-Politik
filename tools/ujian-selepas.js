/* Nusa Politik — tools/ujian-selepas.js (v14.6): ujian pelayar Pilihan Selepas Politik (modal Bersara, pos Duta, tab Kedutaan, tugas, EN). Guna: node tools/ujian-selepas.js [folder-tangkapan] [BM|EN] */
const fs = require('fs'), path = require('path'), http = require('http'); const PW = require('playwright'); const P = require('./persekitaran');
const ROOT = path.join(__dirname, '..'); const g = P.muat(); P.daftar({ nama: 'Amir Hakim', jantina: 'L', umur: 55, sayap: 'utama' });
P.tetap({ ap: 10, myr: 50000, tahun: 2030, bulan: 6, reputasi: 70, jawatanList: [{ kod: 'timbalan_presiden', jawatan: 'Timbalan Presiden', peringkat: 'pusat', pangkat: 11 }] });
const BEKAL = {}; g.localStorage._peta.forEach((v, k) => { BEKAL[k] = v; }); BEKAL.nusaLang = process.argv[3] || 'BM';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port; const br = await PW.chromium.launch(); const out = process.argv[2] || null; const gagal = [];
  const EN = process.argv[3] === 'EN', RE = /(Bersara sepenuhnya|Kekosongan terdekat|Tokoh nasional|Lantikan politik|Wisma Putra menawarkan|Hubungan Dua Hala|Kepercayaan Wisma|Kebajikan Rakyat|Tugas Kedutaan|Kunjungan hormat|Misi perdagangan|Bantuan konsular|Isu utama|Penggal \d|Umur \d+ tahun)/;
  for (const [w, n] of [[1280, 'd'], [420, 'm']]) {
    const pg = await br.newPage({ viewport: { width: w, height: 900 } }); const er = []; pg.on('pageerror', (e) => er.push(e.message));
    await pg.route('**/*', (rt) => rt.request().url().startsWith(base) ? rt.continue() : rt.abort());
    await pg.addInitScript((d) => { if (sessionStorage.getItem('__bekal')) { return; } sessionStorage.setItem('__bekal', '1'); Object.keys(d).forEach((k) => localStorage.setItem(k, d[k])); }, BEKAL);
    await pg.goto(base + '/dashboard.html'); await pg.waitForSelector('#kandungan:not([hidden])');
    await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) {} }); await pg.addStyleTag({ content: '.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}' });
    for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
    await pg.evaluate(() => document.getElementById('btn-bersara').click()); await pg.waitForSelector('#modal.is-open'); await pg.waitForTimeout(300);
    const isi = await pg.$eval('#modal', (m) => m.innerText); if (EN && RE.test(isi)) { gagal.push(n + ': BM bocor (modal): ' + isi.slice(0, 400)); }
    const lbl = await pg.$$eval('#modal-kaki button', (b) => b.map((x) => x.innerText)); if (lbl.length !== 4) { gagal.push(n + ': butang modal ' + JSON.stringify(lbl)); }
    if (out) { await (await pg.$('#modal .modal, #modal')).screenshot({ path: out + '/selepas-modal-' + n + '.png' }); }
    await pg.evaluate(() => { const b = document.querySelectorAll('#modal-kaki button'); b[b.length - 1].click(); }); await pg.waitForTimeout(400);
    const isi2 = await pg.$eval('#modal', (m) => m.innerText); if (EN && RE.test(isi2)) { gagal.push(n + ': BM bocor (pos): ' + isi2.slice(0, 300)); }
    if (out) { await (await pg.$('#modal .modal, #modal')).screenshot({ path: out + '/selepas-pos-' + n + '.png' }); }
    await pg.evaluate(() => { const b = document.querySelectorAll('#modal-kaki button'); b[1].click(); }); await pg.waitForTimeout(700);
    const tabOk = await pg.evaluate(() => !document.getElementById('tab-kedutaan').hidden && !document.getElementById('panel-kedutaan').hidden); if (!tabOk) { gagal.push(n + ': tab Kedutaan tidak dibuka'); }
    await pg.click('[data-sl="t:kunjungan"]'); await pg.waitForTimeout(300); await pg.click('[data-sl="t:konsular"]'); await pg.waitForTimeout(300);
    const st = await pg.evaluate(() => { const a = MyPolitikDuta.getD(MyPolitikSave.loadPlayer()).aktif; return a && { k: a.kunjungan, c: a.konsular, j: MyPolitikSave.loadPlayer().jawatanList.length }; });
    if (!st || !st.k || !st.c || st.j) { gagal.push(n + ': tugas tidak direkod ' + JSON.stringify(st)); }
    if (EN) { const t = await (await pg.$('.sl-kedutaan')).innerText(); if (RE.test(t)) { gagal.push(n + ': BM bocor (Kedutaan): ' + t.slice(0, 400)); } }
    if (out) { await (await pg.$('.sl-kedutaan')).screenshot({ path: out + '/selepas-kedutaan-' + n + '.png' }); }
    if (er.length) { gagal.push(n + ': ralat ' + er.join(' | ')); }
  }
  await br.close(); srv.close();
  if (gagal.length) { console.log('GAGAL:\n - ' + gagal.join('\n - ')); process.exit(1); } else { console.log('Ujian Selepas Politik lulus.'); }
})();
