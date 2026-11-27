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
  const RE2 = /(susut|Jika penggal|Tawaran Perdana Menteri|Terima|Tolak|Kekal di luar|Jawab soalan|Bentang RUU|bergantung pada kerusi|Kuota Senator|kekosongan|Parti anda|Rakan gabungan|Tokoh masyarakat|Setiap kerusi|Sahkan lantikan|Komposisi)/;
  const RE3 = /(Pemilihan Yang|Calonkan|Kewibawaan|Usul tergempar|Benarkan|Pengerusikan|Lawatan diplomatik|Sebagai pengerusi|Tugas Yang|peluang|sekali)/;
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
    /* v14.22: tawaran Senator-Menteri (Tindakan), mod Menteri (Dewan), kuota PM (Tindakan › Kerajaan) */
    await pg.evaluate(() => { const S = MyPolitikSave, p = S.loadPlayer(); S.applyEffects({}, { kiraTindakan: false, patch: { senat: { sejarah: [], kerajaan: 41, kerajaanLalu: true, tawaran: { tahap: 'TIMBALAN_MENTERI', i: p.tahun * 12 + p.bulan } }, ap: 10 } }); NusaUI.gotoTab('tindakan'); });
    await pg.waitForTimeout(400);
    const tw = await pg.$('.sn-tawaran'); if (!tw) { gagal.push(n + ': kad tawaran tiada'); } else {
      if (EN) { const t = await tw.innerText(); if (RE2.test(t)) { gagal.push(n + ': BM bocor (tawaran): ' + t.slice(0, 300)); } }
      if (out) { await tw.screenshot({ path: out + '/senat-tawaran-' + n + '.png' }); }
      await pg.evaluate(() => MyPolitikKabinet.setRng ? MyPolitikKabinet.setRng(() => 0) : null); await pg.click('.sn-tawaran [data-sn="tawaran:ya"]'); await pg.waitForTimeout(400);
      const kb = await pg.evaluate(() => { const k = MyPolitikKabinet.getKabinet(MyPolitikSave.loadPlayer()); return k.hasGovernmentRole && k.senatorMenteri; }); if (!kb) { gagal.push(n + ': tidak dilantik Senator-Menteri'); }
    }
    await pg.evaluate(() => NusaUI.gotoTab('dewan')); await pg.waitForTimeout(400);
    if (!(await pg.$('.sn-panel [data-sn="mtugas:jawab"]'))) { gagal.push(n + ': tugas Menteri tiada'); }
    if (EN) { const t = await (await pg.$('.sn-panel')).innerText(); if (RE2.test(t)) { gagal.push(n + ': BM bocor (Menteri): ' + t.match(RE2)[0] + ' | ' + t.slice(0, 1200)); } }
    if (out) { await (await pg.$('.sn-panel')).screenshot({ path: out + '/senat-menteri-' + n + '.png' }); }
    await pg.click('.sn-panel [data-sn="mtugas:jawab"]'); await pg.waitForTimeout(300);
    await pg.evaluate(() => { const S = MyPolitikSave, K = MyPolitikKabinet, p = S.loadPlayer(); S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: Object.assign(K.getKabinet(p), { hasGovernmentRole: true, roleLevel: 'PERDANA_MENTERI', portfolioName: 'Perdana Menteri', senatorMenteri: false }), senat: { sejarah: [], kerajaan: 29, kerajaanLalu: true, kuota: { i: p.tahun * 12 + p.bulan, n: 4 } }, jemaah: { kunci: 'x', umum: true } } }); NusaUI.subTindakan('kerajaan'); });
    await pg.waitForTimeout(400);
    const kq = await pg.$('.sn-kuota'); if (!kq) { gagal.push(n + ': kad kuota tiada'); } else {
      await pg.click('.sn-kuota [data-sn="kuota:-:parti"]'); await pg.waitForTimeout(200); await pg.click('.sn-kuota [data-sn="kuota:+:rakan"]'); await pg.waitForTimeout(200);
      if (EN) { const t = await (await pg.$('.sn-kuota')).innerText(); if (RE2.test(t)) { gagal.push(n + ': BM bocor (kuota): ' + t.slice(0, 300)); } }
      if (out) { await (await pg.$('.sn-kuota')).screenshot({ path: out + '/senat-kuota-' + n + '.png' }); }
      await pg.click('.sn-kuota [data-sn="kuota:sahkan"]'); await pg.waitForTimeout(300);
      const kr = await pg.evaluate(() => MyPolitikSenat.komposisi(MyPolitikSave.loadPlayer()).kerajaan); if (kr !== 33) { gagal.push(n + ': komposisi ' + kr); }
    }
    /* v14.23: pemilihan Yang di-Pertua, mod pengerusi, usul, avatar jubah */
    await pg.evaluate(() => { const S = MyPolitikSave, K = MyPolitikKabinet, p = S.loadPlayer(), i = p.tahun * 12 + p.bulan; const sn = JSON.parse(JSON.stringify(p.senat)); sn.aktif = sn.aktif || {}; Object.assign(sn.aktif, { sumber: 'pm', penggal: 1, mula: i, tamat: i + 30, tahunMula: p.tahun, pengaruh: 80, hubungan: 70, kehadiran: 90, ruu: [], jawatan: null, pemilihan: { i: i } });
      S.applyEffects({}, { kiraTindakan: false, patch: { senat: sn, ap: 10, kabinet: Object.assign(K.getKabinet(p), { hasGovernmentRole: false, roleLevel: 'NONE', senatorMenteri: false }) } }); NusaUI.gotoTab('dewan'); });
    await pg.waitForTimeout(400);
    if (!(await pg.$('.sn-pilih [data-sn="calon:ydp"]:not([disabled])'))) { gagal.push(n + ': butang calon YDP'); }
    if (EN) { const t = await (await pg.$('.sn-pilih')).innerText(); if (RE3.test(t)) { gagal.push(n + ': BM bocor (pemilihan): ' + t.match(RE3)[0] + ' | ' + t.slice(0, 300)); } }
    if (out) { await (await pg.$('.sn-pilih')).screenshot({ path: out + '/senat-pemilihan-' + n + '.png' }); }
    await pg.evaluate(() => MyPolitikSenat.setRng(() => 0)); await pg.click('.sn-pilih [data-sn="calon:ydp"]'); await pg.waitForTimeout(400);
    await pg.evaluate(() => { const S = MyPolitikSave, p = S.loadPlayer(), sn = JSON.parse(JSON.stringify(p.senat)); sn.aktif.usul = { i: p.tahun * 12 + p.bulan }; S.applyEffects({}, { kiraTindakan: false, patch: { senat: sn } }); NusaUI.render(); });
    await pg.waitForTimeout(400);
    if (!(await pg.$('.sn-ban--ydp'))) { gagal.push(n + ': mod Yang di-Pertua tiada'); }
    const jb = await pg.evaluate(() => (document.getElementById('p-avatar') || {}).innerHTML || ''); if (!/#D4AF37/.test(jb) || !/fill="#111"/.test(jb)) { gagal.push(n + ': avatar jubah tiada'); }
    if (EN) { const t = await (await pg.$('.sn-panel')).innerText(); if (RE3.test(t)) { gagal.push(n + ': BM bocor (YDP): ' + t.match(RE3)[0] + ' | ' + t.slice(0, 500)); } }
    if (out) { await (await pg.$('.sn-panel')).screenshot({ path: out + '/senat-ydp-' + n + '.png' }); await (await pg.$('#p-avatar')).screenshot({ path: out + '/senat-avatar-' + n + '.png' }); }
    await pg.click('.sn-panel [data-sn="usul:benar"]'); await pg.waitForTimeout(300); if (await pg.$('.sn-panel [data-sn="usul:benar"]')) { gagal.push(n + ': usul tidak diputuskan'); }
    await pg.click('.sn-panel [data-sn="ydp:pengerusi"]'); await pg.waitForTimeout(300);
    if (er.length) { gagal.push(n + ': ralat ' + er.join(' | ')); }
    await pg.close();
  }
  await br.close(); srv.close();
  if (gagal.length) { console.log('GAGAL:\n - ' + gagal.join('\n - ')); process.exit(1); } else { console.log('Ujian Dewan Negara lulus.'); }
})();
