/* Nusa Politik — tools/ujian-keluarga.js (v14.18): ujian pelayar Dinasti Politik (kad Keluarga, Teruskan Dinasti di skrin Legasi, Pokok Dinasti, EN). Guna: node tools/ujian-keluarga.js [folder-tangkapan] [BM|EN] */
const fs = require('fs'), path = require('path'), http = require('http'); const PW = require('playwright'); const P = require('./persekitaran');
const ROOT = path.join(__dirname, '..'); const g = P.muat(); P.daftar({ nama: 'Ahmad Kamal bin Yusof', jantina: 'L', umur: 50, sayap: 'utama' });
P.tetap({ ap: 10, myr: 80000, tahun: 2040, bulan: 6, reputasi: 70, jawatanList: [{ kod: 'naib_presiden', jawatan: 'Naib Presiden', peringkat: 'pusat', pangkat: 10 }],
  keluarga: { kaum: 'melayu', pasangan: { nama: 'Noraini binti Hashim', j: 'P', lahir: 1980, tahun: 2012 }, tahunProses: 2040,
    anak: [{ id: 'a1', nama: 'Amirul Hakim bin Ahmad Kamal', j: 'L', lahir: 2016, minat: 78, sayap: 'pemuda', sayapTahun: 2034, aras: 2, bimbing: 0 },
      { id: 'a2', nama: 'Nur Aisyah binti Ahmad Kamal', j: 'P', lahir: 2018, minat: 52, sayap: null, aras: 0, bimbing: 0 },
      { id: 'a3', nama: 'Haziq bin Ahmad Kamal', j: 'L', lahir: 2028, minat: 20, sayap: null, aras: 0, bimbing: 0 }] } });
const BEKAL = {}; g.localStorage._peta.forEach((v, k) => { BEKAL[k] = v; }); BEKAL.nusaLang = process.argv[3] || 'BM';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.csv': 'text/csv', '.woff': 'font/woff' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(ROOT, u === '/' ? 'index.html' : u); if (!fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise((r) => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port; const br = await PW.chromium.launch(); const out = process.argv[2] || null; const gagal = [];
  const EN = process.argv[3] === 'EN', RE = /(Pasangan|Berkahwin|Minat politik|Bimbing|belum masuk parti|Teruskan Dinasti|Pilih waris|Dana peribadi|Anak Tokoh|Pokok Dinasti|Generasi \d|Jawatan tertinggi|tahun ·)/;
  const sembunyi = '.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}';
  for (const [w, n] of [[1280, 'd'], [420, 'm']]) {
    const pg = await br.newPage({ viewport: { width: w, height: 900 } }); const er = []; pg.on('pageerror', (e) => er.push(e.message));
    await pg.route('**/*', (rt) => rt.request().url().startsWith(base) ? rt.continue() : rt.abort());
    await pg.addInitScript((d) => { if (sessionStorage.getItem('__bekal')) { return; } sessionStorage.setItem('__bekal', '1'); Object.keys(d).forEach((k) => localStorage.setItem(k, d[k])); }, BEKAL);
    await pg.goto(base + '/dashboard.html'); await pg.waitForSelector('#kandungan:not([hidden])');
    await pg.evaluate(() => { try { MyPolitikTutorial.skip(); } catch (e) {} }); await pg.addStyleTag({ content: sembunyi });
    await pg.evaluate(() => { try { NusaUI.subProfil('peribadi', true); } catch (e) { /* v14.20: sub-tab Profil */ } });
    for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
    await pg.evaluate(() => NusaUI.gotoTab('profil')); await pg.waitForTimeout(300);
    const kad = await pg.$('.kl-kad'); if (!kad) { gagal.push(n + ': kad Keluarga tiada'); } else {
      const bil = await pg.$$eval('.kl-kad .prkl-act', (x) => x.length); if (bil !== 4) { gagal.push(n + ': baris keluarga ' + bil); }
      await pg.click('.kl-kad [data-kl="bimbing:a2"]'); await pg.waitForTimeout(300);
      const m = await pg.evaluate(() => MyPolitikSave.loadPlayer().keluarga.anak[1].minat); if (m !== 57) { gagal.push(n + ': bimbing ' + m); }
      if (EN) { const t = await (await pg.$('.kl-kad')).innerText(); if (RE.test(t)) { gagal.push(n + ': BM bocor (kad): ' + t.slice(0, 400)); } }
      if (out) { await (await pg.$('.kl-kad')).screenshot({ path: out + '/keluarga-kad-' + n + '.png' }); }
    }
    await pg.evaluate(() => { MyPolitikHayat.tamatkan('bersara_sukarela'); NusaUI.render(); }); await pg.waitForSelector('#legasi:not([hidden]) .kl-legasi');
    const pil = await pg.$$eval('.kl-legasi [data-kl^="waris:"]', (x) => x.length); if (pil !== 2) { gagal.push(n + ': calon waris ' + pil); }
    await pg.click('.kl-legasi [data-kl="waris:1"]'); await pg.waitForTimeout(200);
    const tb = await pg.$eval('.kl-legasi [data-kl="teruskan"]', (b) => b.innerText); if (!/Nur Aisyah/.test(tb)) { gagal.push(n + ': pilih waris ' + tb); }
    await pg.click('.kl-legasi [data-kl="waris:0"]'); await pg.waitForTimeout(200);
    if (EN) { const t = await (await pg.$('.kl-legasi')).innerText(); if (RE.test(t)) { gagal.push(n + ': BM bocor (legasi): ' + t.slice(0, 400)); } }
    if (out) { await (await pg.$('.kl-legasi')).screenshot({ path: out + '/keluarga-legasi-' + n + '.png' }); }
    await Promise.all([pg.waitForNavigation(), pg.click('.kl-legasi [data-kl="teruskan"]')]); await pg.waitForSelector('#kandungan:not([hidden])'); await pg.addStyleTag({ content: sembunyi });
    for (let i = 0; i < 4; i++) { const b = await pg.$('#modal.is-open button'); if (!b) { break; } await b.click(); await pg.waitForTimeout(300); }
    const h = await pg.evaluate(() => { const p = MyPolitikSave.loadPlayer(); return { nama: p.nama, umur: MyPolitikHayat.umurSemasa(p), jawatan: p.jawatan, gen: p.dinasti && p.dinasti.generasi.length }; });
    if (!/Amirul/.test(h.nama) || h.umur !== 24 || h.gen !== 1 || !/Naib Ketua/.test(h.jawatan)) { gagal.push(n + ': waris ' + JSON.stringify(h)); }
    await pg.evaluate(() => NusaUI.gotoTab('profil')); await pg.waitForTimeout(300);
    const pk = await pg.$('.kl-pokok'); if (!pk) { gagal.push(n + ': Pokok Dinasti tiada'); } else {
      const t = await pk.innerText(); if (EN ? RE.test(t) : !/Generasi 2/.test(t)) { gagal.push(n + ': pokok: ' + t.slice(0, 300)); }
      if (out) { await pk.screenshot({ path: out + '/keluarga-pokok-' + n + '.png' }); }
    }
    if (er.length) { gagal.push(n + ': ralat ' + er.join(' | ')); }
    await pg.close();
  }
  await br.close(); srv.close();
  if (gagal.length) { console.log('GAGAL:\n - ' + gagal.join('\n - ')); process.exit(1); } else { console.log('Ujian Dinasti lulus.'); }
})();
