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

/* Kumpul literal rentetan BM daripada kod sumber: nod teks EN yang sama persis dengan literal itu dan tiada terjemahan = bocor. */
function kumpulLiteral() {
  const set = new Set(), re = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g;
  fs.readdirSync(path.join(ROOT, 'js')).filter((f) => /\.js$/.test(f) && !/^(translations|i18n|tutorial|tutorial-en|data|watak|geo|mca-data|mic-data|umno-data)/.test(f)).forEach((f) => {
    const src = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
    let m; while ((m = re.exec(src))) {
      const t = (m[1] || m[2] || '').replace(/\\'/g, "'").trim();
      if (t.length >= 4 && t.length <= 120 && /^[A-ZÀ-Ý][A-Za-zÀ-ÿ'’ \-\/&.,:;!?()%+0-9]+$/.test(t) && /[a-z]{3}/.test(t)) { set.add(t); }
    }
  });
  return [...set];
}
/* Nama khas yang sengaja kekal (negeri, istilah UMNO, jenama). */
const NAMA_KHAS = /^(Kuala Lumpur|Putrajaya|Labuan|Perlis|Kedah|Kelantan|Terengganu|Pulau Pinang|Perak|Pahang|Selangor|Wilayah Persekutuan|Negeri Sembilan|Melaka|Johor|Sarawak|Sabah|Bumiputera|Pemuda|Wanita|Puteri|UMNO|PAU|MKT|Nusa Politik|Barisan Nasional|Dewan Rakyat|Dewan Negara|Bahasa Melayu|Hard|Easy|Normal)$/;
const BM = /\b(yang|dan|untuk|dengan|anda|kepada|telah|akan|tidak|sudah|ialah|dalam|pada|atau|boleh|mesti|setiap|bulan|tahun|sebagai|daripada|kawasan|negeri|bahagian|cawangan|sokongan|pemilih|ahli|tahap|jumlah|perwakilan|kerusi|lihat|klik|anjur|tiada|mencukupi|perlu|baki|setahun|usaha|pilih|daerah|mengundi|penduduk|kesukaran|butiran|lobi|jelajah|dana|wang)\b/i;
/* Kata/pola BM yang dibenarkan kekal (nama sendiri, istilah UMNO, sumber luar). */
const BENAR = /(Wikipedia|mStar|Laman rasmi|data-i18n-skip|Cawangan Contoh|Negeri Sembilan|DUN Contoh)/;

(async () => {
  await new Promise((r) => pelayan.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + pelayan.address().port;
  const b = await PW.chromium.launch(exe ? { executablePath: exe } : {});
  const pg = await b.newPage({ viewport: { width: 420, height: 900 } });
  pg.setDefaultTimeout(6000);
  const ralat = [], bocor = new Map(), seen = new Set();
  pg.on('pageerror', (e) => ralat.push(e.message));
  await pg.route('**/*', (r) => { const u = new URL(r.request().url()); return u.hostname === '127.0.0.1' ? r.continue() : r.fulfill({ status: 204, body: '' }); });
  await pg.addInitScript((d) => { try { if (!localStorage.getItem('myPolitik_player')) { Object.keys(d).forEach((k) => localStorage.setItem(k, d[k])); } } catch (e) { /* abaikan */ } }, BEKAL);
  await pg.goto(base + '/dashboard.html');
  await pg.waitForSelector('#kandungan:not([hidden])');
  await pg.evaluate(() => { try { if (window.MyPolitikTutorial && MyPolitikTutorial.skip) { MyPolitikTutorial.skip(); } } catch (e) { /* abaikan */ } });
  await pg.addStyleTag({ content: '.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}' });
  await pg.evaluate(() => MyPolitikI18n.setLanguage('EN'));

  const LITERAL = kumpulLiteral();
  const imbas = async (etiket) => {
    const r = await pg.evaluate(({ reSrc, lit, khas }) => {
      const SET = new Set(lit), KH = new RegExp(khas);
      const re = new RegExp(reSrc, 'i'), w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), o = [];
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        const t = n.nodeValue.replace(/\s+/g, ' ').trim(), el = n.parentElement;
        if (!t || t.length < 6 || !el || el.closest('[data-i18n-skip],script,style,noscript,.tut-kad')) { continue; }
        if (re.test(t) || (SET.has(t) && !KH.test(t) && window.MyPolitikI18n.terjemah(t) === null)) { o.push(t.slice(0, 120)); }
      }
      return o;
    }, { reSrc: BM.source, lit: LITERAL, khas: NAMA_KHAS.source });
    r.filter((t) => !BENAR.test(t) && !seen.has(t)).forEach((t) => { seen.add(t); bocor.set(t, etiket); });
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

  /* Tab Peta: setiap mod, kemudian hover dan klik beberapa kawasan serta tekan butang tindakan. */
  const jelajahPeta = async () => {
    const mod = pg.locator('.mpm-tab'), n = await mod.count();
    for (let m = 0; m < n; m++) {
      await mod.nth(m).evaluate((e) => e.click()); await pg.waitForTimeout(900); await imbas('peta mod ' + m);
      for (const sel of ['.mpm-poli', '.mpm-baris']) {
        const l = pg.locator(sel), c = await l.count();
        for (let k = 0; k < Math.min(c, 3); k++) {
          const e = l.nth(k * Math.max(1, Math.floor(c / 3)));
          await e.hover({ force: true }).catch(() => {}); await pg.waitForTimeout(120); await imbas('peta hover ' + m);
          await e.click({ force: true }).catch(() => {}); await pg.waitForTimeout(350); await imbas('peta klik ' + m);
          const bt = pg.locator('[data-act=tindakan]'), nb = await bt.count();
          for (let q = 0; q < nb; q++) { await bt.nth(q).click({ force: true }).catch(() => {}); await pg.waitForTimeout(250); await imbas('peta aksi ' + m); }
        }
      }
    }
  };
  /* Kesan bunyi: kawalan ada dalam bar muzik, bunyi boleh dijana, label dalam EN. */
  await pg.waitForTimeout(800);
  const sfx = await pg.evaluate(() => ({ btn: !!document.getElementById('mpa-sfx'), label: (document.getElementById('mpa-sfx') || {}).title, ok: ['ketuk', 'sorak', 'flash'].map((n) => MyPolitikSFX.main(n)), ada: window.SoundManager === window.MyPolitikSFX }));
  if (!sfx.btn || !sfx.ada || sfx.label !== 'Turn off sound effects') { ralat.push('kawalan SFX tiada/label salah: ' + JSON.stringify(sfx)); }
  if (!sfx.ok[0] || !sfx.ok[2]) { ralat.push('SFX gagal dimainkan: ' + JSON.stringify(sfx.ok)); }
  /* Pencapaian: cetus trofi Negarawan Utama melalui simpanan sebenar, semak toast dan panel dalam EN. */
  await pg.evaluate(() => { MyPolitikSave.applyEffects({}, { kiraTindakan: false, patch: { kabinet: { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH' } } }); });
  await pg.waitForTimeout(500);
  const toastPC = await pg.evaluate(() => Array.prototype.map.call(document.querySelectorAll('.toast'), (t) => t.textContent).join(' | '));
  if (toastPC.indexOf('Achievement Unlocked: Foremost Statesman!') < 0) { ralat.push('toast pencapaian tiada/salah: ' + toastPC.slice(0, 120)); }
  await pg.locator('[data-tab="profil"]').first().evaluate((e) => e.click()); await pg.waitForTimeout(300); await pg.evaluate(() => { const d = document.querySelector('details[data-lipat="pf-pencapaian"]'); if (d) { d.open = true; } }); await pg.waitForTimeout(400); await imbas('tab profil (pencapaian)');
  const panelPC = await pg.evaluate(() => document.getElementById('panel-profil').innerText);
  const lp = await pg.evaluate(() => { window.NusaUI.render(); const d = document.querySelector('details[data-lipat="pf-pencapaian"]'), k = Object.keys(localStorage).filter((x) => /^nusa_lipat_/.test(x))[0]; return { buka: !!(d && d.open), simpan: !!(k && /pf-pencapaian/.test(localStorage.getItem(k) || '')), sumLipat: document.querySelectorAll('#panel-profil details.lipat').length }; });
  if (!lp.buka || !lp.simpan || lp.sumLipat < 5) { ralat.push('bahagian boleh lipat Profil: keadaan tidak disimpan/dikekalkan: ' + JSON.stringify(lp)); }
  if (!/1 \/ 5 unlocked/.test(panelPC) || !/Foremost Statesman/.test(panelPC) || !/Progress|Unlocked/.test(panelPC)) { ralat.push('panel pencapaian EN tidak betul: ' + panelPC.replace(/\s+/g, ' ').slice(0, 160)); }
  const sisi = await pg.evaluate(() => (document.getElementById('s-kesetiaan') || {}).innerText || '');
  if (!/Fence-sitter Support/i.test(sisi) || !/Wavering|Hostile|Leaning supportive/.test(sisi)) { ralat.push('meter Atas Pagar EN tiada/salah: ' + sisi.replace(/\s+/g, ' ').slice(0, 160)); }
  for (const tab of ['tindakan', 'mesyuarat', 'pemilihan', 'pilihanraya', 'dewan', 'profil', 'peta']) {
    await tutup();
    const t = pg.locator('[data-tab="' + tab + '"]').first();
    if (await t.count()) { await t.evaluate((e) => e.click()); await pg.waitForTimeout(500); await imbas('tab ' + tab); }
    if (tab === 'peta') {
      await jelajahPeta();
      /* v8.21: pilihan Wilayah Persekutuan (EN): butang besar, penapis ke satu wilayah. */
      await pg.locator('.mpm-tab').first().evaluate((e) => e.click()); await pg.waitForTimeout(900);
      const wpTeks = await pg.evaluate(() => Array.from(document.querySelectorAll('[data-act="wp"]')).map((e) => e.textContent.trim()).join('|'));
      if (wpTeks !== 'WP (all)|Kuala Lumpur|Putrajaya|Labuan') { ralat.push('butang WP salah: ' + wpTeks); }
      await pg.locator('[data-act="wp"][data-v="16"]').first().evaluate((e) => e.click()); await pg.waitForTimeout(1500);
      const nPoli = await pg.locator('.mpm-poli').count();
      if (nPoli !== 1) { ralat.push('Putrajaya sepatutnya 1 kawasan, dapat ' + nPoli); }
      await pg.selectOption('[data-act="tapis"]', '').catch(() => {}); await pg.locator('.mpm-tab').last().evaluate((e) => e.click()); await pg.waitForTimeout(900);      // pulihkan keadaan peta untuk ujian krisis
      /* v8.8: krisis tempatan di peta (ikon berkedip, klik, selesai) + lapisan sentimen. */
      await pg.evaluate(() => { const S = window.MyPolitikSave, p = S.loadPlayer(); S.applyEffects({}, { kiraTindakan: false, patch: { krisisPeta: { aktif: [{ id: 'kt1', jenis: 'banjir', cid: p.id, tempat: p.cawangan || 'Cawangan', tahun: p.tahun, bulan: p.bulan }], selesai: 0, terabai: 0, akhir: '' } } }); });
      await pg.waitForSelector('.mpm-kanvas', { timeout: 25000 }).catch(() => {}); await pg.waitForTimeout(800); await imbas('peta krisis');
      if (process.env.DBG) { console.log(JSON.stringify(await pg.evaluate(() => { const p = window.MyPolitikSave.loadPlayer(); return { kp: p.krisisPeta, sen: window.MyPolitikKrisisPeta.senarai(p).length, id: p.id, kv: document.querySelectorAll('.mpm-kanvas').length, host: (document.getElementById('peta-host')||{}).innerText.slice(0,200), pin: Array.from(document.querySelectorAll('.mpm-pin')).map((e) => e.style.left + ',' + e.style.top + ',' + e.style.display) }; })));}
      const pin = await pg.locator('.mpm-pin').count(), strip = await pg.locator('.mpm-krisis-btn').count();
      if (!strip) { ralat.push('bar krisis peta tiada'); }
      if (!pin) { ralat.push('ikon krisis ⚠️ tiada di peta'); }
      await pg.locator('.mpm-seg [data-v="sentimen"]').first().evaluate((e) => e.click()).catch(() => {}); await pg.waitForTimeout(400); await imbas('lapisan sentimen');
      await pg.locator('.mpm-krisis-btn').first().evaluate((e) => e.click()); await pg.waitForTimeout(500); await imbas('modal krisis');
      const mt = await pg.evaluate(() => (document.querySelector('.acara__pil') || {}).innerText || '');
      if (!/Go to the ground|help the victims/i.test(mt)) { ralat.push('modal krisis EN salah: ' + mt.slice(0, 120)); }
      await pg.locator('.acara__opsi[data-pilih="turun"]').first().evaluate((e) => e.click()).catch(() => {}); await pg.waitForTimeout(600);
      const sisa = await pg.evaluate(() => (window.MyPolitikSave.loadPlayer().krisisPeta || {}).aktif.length);
      if (sisa !== 0) { ralat.push('krisis tidak selesai selepas klik: ' + sisa); }
    }
  }
  const bulan = parseInt(process.env.BULAN || '6', 10);
  for (let i = 0; i < bulan; i++) {
    await tutup();
    await pg.locator('#btn-tahun').click().catch(() => {});
    await pg.waitForTimeout(300); await imbas('bulan ' + (i + 1)); await tutup();
  }

  /* v8.15: togol tema satu ketukan dan butang Undo (EN), pada halaman baharu (Latihan Amir ditolak). */
  const pu = await b.newPage({ viewport: { width: 420, height: 900 } }); pu.setDefaultTimeout(6000);
  pu.on('pageerror', (e) => ralat.push('[undo] ' + e.message));
  await pu.route('**/*', (r) => { const u = new URL(r.request().url()); return u.hostname === '127.0.0.1' ? r.continue() : r.fulfill({ status: 204, body: '' }); });
  await pu.addInitScript((d) => { try { if (!localStorage.getItem('myPolitik_player')) { Object.keys(d).forEach((k) => localStorage.setItem(k, d[k])); } } catch (e) { /* abaikan */ } }, BEKAL);
  await pu.goto(base + '/dashboard.html'); await pu.waitForSelector('#kandungan:not([hidden])');
  await pu.locator('button:has-text("Continue playing"), button:has-text("Terus main"), button:has-text("Just play")').first().click().catch(() => {});
  await pu.evaluate(() => { try { if (window.MyPolitikTutorial && MyPolitikTutorial.skip) { MyPolitikTutorial.skip(); } } catch (e) { /* abaikan */ } });
  await pu.addStyleTag({ content: '.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}' });
  const sk0 = await pu.evaluate(() => document.documentElement.getAttribute('data-skema'));
  await pu.locator('#btn-skema').evaluate((e) => e.click()); await pu.waitForTimeout(200);
  const sk1 = await pu.evaluate(() => document.documentElement.getAttribute('data-skema'));
  if (sk0 === sk1) { ralat.push('butang togol tema tidak menukar skema'); }
    await pu.locator('#btn-skema').evaluate((e) => e.click()); await pu.waitForTimeout(200);
  await pu.evaluate(() => { window.NusaUI.gotoTab('tindakan'); }); await pu.waitForTimeout(300);
  const adaTind = await pu.locator('[data-act="tindakan"]:not([disabled])').count();
  if (adaTind) {
    const myr0 = await pu.evaluate(() => window.MyPolitikSave.loadPlayer().myr);
    await pu.locator('[data-act="tindakan"]:not([disabled])').first().evaluate((e) => e.click()); await pu.waitForTimeout(700);
    
    const ub = await pu.evaluate(() => { const b = document.getElementById('btn-undo'); return b ? { d: b.disabled, h: b.hidden, t: b.textContent, ti: b.title } : null; });
    if (!ub || ub.h) { ralat.push('butang undo tidak dipaparkan: ' + JSON.stringify(ub) + ' tind=' + adaTind); }
    else if (ub.d) { /* tindakan rawak / acara dikunci: sah */ }
    else {
      await pu.locator('#btn-undo').evaluate((e) => e.click()); await pu.waitForTimeout(500);
      const um = await pu.evaluate(() => (document.getElementById('modal-isi') || {}).innerText || '');
      const uk = await pu.evaluate(() => (document.querySelector('.modal__title, #modal-tajuk') || {}).innerText || '');
      if (/dipulangkan|Baki undo/.test(um + uk)) { ralat.push('modal undo bocor BM: ' + (uk + um).slice(0, 120)); }
      await pu.locator('#modal-kaki button:last-child').evaluate((e) => e.click()); await pu.waitForTimeout(1500);
      await pu.waitForSelector('#kandungan:not([hidden])').catch(() => {}); 
      const myr1 = await pu.evaluate(() => window.MyPolitikSave.loadPlayer().myr);
      if (myr1 !== myr0) { ralat.push('undo tidak memulihkan dana: ' + myr0 + ' -> ' + myr1); }
    }
  }
  /* v8.16: tetingkap lobi (EN): amaran Dana tidak cukup, butang Tangguh dan lobi kekal terbuka. */
  await pu.evaluate(() => { const S = window.MyPolitikSave; S.applyEffects({}, { kiraTindakan: false, patch: { ip: 5000, myr: 0 } }); window.MyPolitikKabinet.bukaLobi('DUN'); setTimeout(() => window.NusaPRU_UI.lobi(), 0); });
  await pu.waitForTimeout(700);
  const lm = await pu.evaluate(() => (document.getElementById('modal-isi') || {}).innerText || '');
  if (!/Insufficient funds/.test(lm) || !/Postpone/.test(lm)) { ralat.push('modal lobi EN salah: ' + lm.slice(0, 200)); }
  if (/Dana tidak mencukupi|Tangguh|termurah/.test(lm)) { ralat.push('modal lobi bocor BM: ' + lm.slice(0, 160)); }
  await pu.locator('.acara__opsi[data-pilih="TANGGUH"]').first().evaluate((e) => e.click()).catch(() => {}); await pu.waitForTimeout(700);
  if (!(await pu.evaluate(() => !!window.MyPolitikKabinet.getKabinet(window.MyPolitikSave.loadPlayer()).lobi))) { ralat.push('lobi tidak kekal terbuka selepas Tangguh'); }
  /* v8.17: kerusi lain (EN): pemilih dimuatkan, ringkasan EN, dicalonkan sebagai calon dari luar. */
  await pu.evaluate(() => {
    const S = window.MyPolitikSave, P = window.MyPolitikPRU; P.setRng(() => 0);
    S.applyEffects({}, { kiraTindakan: false, patch: { ip: 700, myr: 30000, jawatan: 'Ketua Bahagian', jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', sayap: null, pangkat: 7, tahun: S.loadPlayer().tahun }] } });
    P.isytihar('tamat_penggal', { rng: () => 0 });
    setTimeout(() => window.NusaPRU_UI.alir(), 0);
  });
  await pu.waitForTimeout(800);
  const pm = await pu.evaluate(() => (document.getElementById('modal-isi') || {}).innerText || '');
  if (!/Other seats/.test(pm)) { ralat.push('pilihan Kerusi lain tiada/EN salah: ' + pm.slice(0, 160)); }
  await pu.locator('.acara__opsi[data-pilih="LAIN"]').first().evaluate((e) => e.click()).catch(() => {});
  await pu.waitForSelector('#kl-kerusi option', { timeout: 15000 }).catch(() => { ralat.push('senarai kerusi tidak dimuatkan'); });
  await pu.waitForTimeout(400);
  const kt = await pu.evaluate(() => ({ n: document.querySelectorAll('#kl-kerusi option').length, neg: document.querySelectorAll('#kl-negeri option').length, ringkas: (document.getElementById('kl-ringkas') || {}).innerText || '', sarawak: Array.from(document.querySelectorAll('#kl-negeri option')).some((o) => /sarawak/i.test(o.textContent)) }));
  if (!kt.n || !kt.neg) { ralat.push('pemilih kerusi kosong: ' + JSON.stringify(kt)); }
  if (kt.sarawak) { ralat.push('Sarawak sepatutnya tiada dalam senarai'); }
  if (!/Approval chance/.test(kt.ringkas) || /Peluang diluluskan|Calon dari luar|negeri/.test(kt.ringkas)) { ralat.push('ringkasan kerusi EN salah: ' + kt.ringkas.slice(0, 200)); }
  await pu.locator('#modal-kaki button:last-child').evaluate((e) => e.click()); await pu.waitForTimeout(900);
  const kr = await pu.evaluate(() => { const a = window.MyPolitikPRU.getPRU(window.MyPolitikSave.loadPlayer()).aktif; return a && a.kerusi ? { lain: !!a.kerusi.lain, ci: !!a.calonImport, nama: a.kerusi.nama } : null; });
  if (!kr || !kr.lain || !kr.ci) { ralat.push('calon kerusi lain tidak direkod: ' + JSON.stringify(kr)); }
  await pu.evaluate(() => { try { window.MyPolitikPRU.setRng(null); } catch (e) { /* abaikan */ } });
  /* v8.18: Peruntukan Kawasan (EN): kad dipaparkan, projek dilaksanakan, tiada BM bocor. */
  await pu.evaluate(() => {
    const S = window.MyPolitikSave, P = window.MyPolitikPRU, p = S.loadPlayer();
    S.applyEffects({}, { kiraTindakan: false, patch: { ap: 10, pru: Object.assign({}, P.getPRU(p), { aktif: null, status: { jenis: 'ADUN', kerusi: 'Alor Setar', sejakTahun: 2026, sejakBulan: 1, kerajaan: true } }), kawasan: { baki: 2300, akhir: 'x', tahun: 2026, sejarah: [], keluhan: [{ id: 'k1', kod: 'lampu_jalan', idx: 0 }, { id: 'k2', kod: 'dewan_usang', idx: 0 }], aktivitiAkhir: '', kurang: 0 } } });
    window.NusaUI.render(); window.NusaUI.gotoTab('tindakan');
  });
  await pu.waitForTimeout(500);
  const kw = await pu.evaluate(() => Array.from(document.querySelectorAll('section.card')).map((x) => x.textContent).join(' | '));
  if (!/Allocation balance/.test(kw) || !/Citizens' Complaints/.test(kw) || !/Community Activities/.test(kw) || !/Resolve \(RM 500\)/.test(kw) || !/Bring as a motion/.test(kw) || !/Broken streetlights/.test(kw) || !/Free health programme/.test(kw) || /Keluhan Rakyat|Selesaikan|Bawa sebagai usul|Abaikan|Laksana|Aktiviti Rakyat|Baki peruntukan/.test(kw)) { ralat.push('kad Peruntukan/Keluhan/Aktiviti EN salah: ' + JSON.stringify(['Allocation balance', "Citizens' Complaints", 'Community Activities', 'Resolve (RM 500)', 'Bring as a motion', 'Broken streetlights', 'Free health programme'].filter((x) => kw.indexOf(x) < 0)) + ' BM: ' + (kw.match(/Keluhan Rakyat|Selesaikan|Bawa sebagai usul|Abaikan|Laksana|Aktiviti Rakyat|Baki peruntukan/g) || []).join(',')); }
  await pu.locator('[data-act="kawasan-selesai"][data-id="k1"]').first().evaluate((e) => e.click()).catch(() => {});
  await pu.waitForTimeout(400);
  await pu.locator('[data-act="kawasan-usul"][data-id="k2"]').first().evaluate((e) => e.click()).catch(() => {});
  await pu.waitForTimeout(400);
  await pu.locator('[data-act="kawasan-aktiviti"][data-id="gotong"]').first().evaluate((e) => e.click()).catch(() => {});
  await pu.waitForTimeout(400);
  const kb = await pu.evaluate(() => { const p = window.MyPolitikSave.loadPlayer(), k = window.MyPolitikKawasan.getKawasan(p); return { baki: k.baki, n: k.keluhan.length, isu: (p.isu || []).some((i) => i.kod === 'dewan_usang') }; });
  if (kb.baki !== 1400 || kb.n !== 0 || !kb.isu) { ralat.push('keluhan/aktiviti kawasan salah: ' + JSON.stringify(kb)); }
  /* v8.19: Jawatan GLC (EN): kad lobi, lobi berjaya, kad jawatan; tiada BM bocor. */
  await pu.evaluate(() => { const S = window.MyPolitikSave; S.applyEffects({}, { kiraTindakan: false, patch: { ip: 700, myr: 40000, reputasi: 60 } }); window.MyPolitikGLC.bukaLobi('kerajaan'); window.NusaUI.render(); window.NusaUI.gotoTab('tindakan'); });
  await pu.waitForTimeout(500);
  const g1 = await pu.evaluate(() => { const c = Array.from(document.querySelectorAll('section.card')).filter((x) => /GLC Post/i.test(x.textContent))[0]; return c ? c.textContent : ''; });
  if (!/Nusa Financing Berhad/.test(g1) || !/Select sector/.test(g1) || !/Agriculture \/ Plantation/.test(g1) || !/3 posts, Chairman from IP 220/.test(g1) || /Pengerusi|Pilih sektor|Pilih syarikat|Parti membentuk|Pertanian|Kewangan/.test(g1)) { ralat.push('kad GLC EN salah: ' + g1.slice(0, 240)); }
  await pu.locator('[data-act="glc-syarikat"][data-id="pertanian"]').first().evaluate((e) => e.click()).catch(() => {}); await pu.waitForTimeout(400);
  const g1b = await pu.evaluate(() => Array.from(document.querySelectorAll('section.card')).map((x) => x.textContent).join(' | '));
  if (!/Nusa Plantation Corporation/.test(g1b) || !/Chairman/.test(g1b) || /Pengerusi|Perbadanan Ladang|Pertanian/.test(g1b)) { ralat.push('kad jawatan syarikat EN salah'); }
  await pu.locator('[data-act="glc-lobi"][data-id="pertanian_pengarah"]').first().evaluate((e) => e.click()).catch(() => {});
  await pu.waitForTimeout(500);
  const g2 = await pu.evaluate(() => { const gl = window.MyPolitikGLC.getGLC(window.MyPolitikSave.loadPlayer()); const c = Array.from(document.querySelectorAll('section.card')).filter((x) => /GLC Post/i.test(x.textContent))[0]; return { j: !!gl.jawatan, baki: gl.lobi && gl.lobi.baki, t: c ? c.textContent : '' }; });
  if (!g2.j && g2.baki !== 1) { ralat.push('lobi GLC tidak menukar keadaan: ' + JSON.stringify(g2).slice(0, 200)); }
  if (g2.j && (!/Conflict of Interest Risk/.test(g2.t) || /Risiko|Ganjaran|Baki/.test(g2.t))) { ralat.push('kad jawatan GLC EN salah: ' + g2.t.slice(0, 240)); }
  /* v8.23: Jawatan Komuniti (EN): dua kad, lobi, kad jawatan dipegang; tiada BM bocor. */
  await pu.evaluate(() => { const S = window.MyPolitikSave, p = S.loadPlayer(); S.applyEffects({}, { kiraTindakan: false, patch: { ip: 700, myr: 80000, reputasi: 60, glc: { lobi: null, jawatan: null, konflik: 0, audit: 0 }, demografik: Object.assign({}, p.demografik, { umur: 35 }), jawatan: 'Ketua Bahagian', jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', sayap: null, pangkat: 7, tahun: 2026 }] } }); window.NusaKomuniti_UI.pilih(null); window.NusaUI.render(); window.NusaUI.gotoTab('tindakan'); });
  await pu.waitForTimeout(500);
  const k1 = await pu.evaluate(() => { const c = Array.from(document.querySelectorAll('section.card')).filter((x) => /Community Posts/i.test(x.textContent))[0]; return c ? c.textContent : ''; });
  if (!/Mosque & PTA/.test(k1) || !/Youth & Students/.test(k1) || !/High-Income Agency/.test(k1) || /Jawatan Komuniti|Masjid|Persatuan|Pilih jenis/.test(k1)) { ralat.push('kad komuniti EN salah: ' + k1.slice(0, 260)); }
  await pu.locator('[data-act="kom-jenis"][data-id="sukan"]').first().evaluate((e) => e.click()).catch(() => {}); await pu.waitForTimeout(400);
  const k2 = await pu.evaluate(() => Array.from(document.querySelectorAll('section.card')).map((x) => x.textContent).join(' | '));
  if (!/Choose a sport/.test(k2) || !/Football/.test(k2) || !/Badminton/.test(k2) || !/Rugby/.test(k2) || !/State Badminton Association Chairman/.test(k2) || /Persatuan Sukan|Pengerusi Persatuan|Pilih sukan|Bola Sepak|Rugbi|Perlu jawatan|Kos IP/.test(k2)) { ralat.push('kad jawatan komuniti EN salah: ' + k2.slice(-300)); }
  await pu.locator('[data-act="kom-sukan"][data-id="bola"]').first().evaluate((e) => e.click()).catch(() => {}); await pu.waitForTimeout(400);
  const k2b = await pu.evaluate(() => Array.from(document.querySelectorAll('section.card')).map((x) => x.textContent).join(' | '));
  if (!/State Football Association Chairman/.test(k2b) || !/National Football Association Chairman/.test(k2b) || !/Need a Headquarters post or a Parliament seat/.test(k2b) || /Pengerusi Persatuan|Bola Sepak|Perlu jawatan/.test(k2b)) { ralat.push('kad sukan bola EN salah: ' + k2b.slice(-300)); }
  await pu.evaluate(() => { window.MyPolitikKomuniti.lobi('sukan_negeri_bola', { rng: () => 0 }); window.NusaUI.render(); });
  await pu.waitForTimeout(400);
  const k3 = await pu.evaluate(() => { const c = Array.from(document.querySelectorAll('section.card')).filter((x) => /Community Posts/i.test(x.textContent))[0]; return { n: window.MyPolitikKomuniti.getKomuniti(window.MyPolitikSave.loadPlayer()).jawatan.length, t: c ? c.textContent : '' }; });
  if (k3.n !== 1 || !/Resign/.test(k3.t) || !/months left/.test(k3.t) || /Letak jawatan|baki|sebulan/.test(k3.t)) { ralat.push('kad komuniti dipegang EN salah: ' + JSON.stringify(k3).slice(0, 260)); }
  /* v8.29: PBT (Ketua Whip) dan Belia & Mahasiswa (EN). */
  for (const jn of ['pbt', 'belia']) {
    await pu.locator('[data-act="kom-jenis"][data-id="' + jn + '"]').first().evaluate((e) => e.click()).catch(() => {}); await pu.waitForTimeout(400);
    const kj = await pu.evaluate(() => Array.from(document.querySelectorAll('section.card')).filter((x) => /Community Posts|Local Council|Youth/i.test(x.querySelector('h2') ? x.querySelector('h2').textContent : '')).map((x) => x.textContent).join(' | '));
    const jangka = jn === 'pbt' ? /Local Council Chief Whip \(PBT\)/ : /Student Association Chairman/;
    if (!jangka.test(kj) || /Ketua Whip|Mahasiswa|Perlu memegang|Sudah memegang|Pengerusi Persatuan|Pengerusi Majlis/.test(kj)) { ralat.push('kad komuniti ' + jn + ' EN salah: ok=' + jangka.test(kj) + ' bocor=' + (kj.match(/Ketua Whip|Mahasiswa|Perlu memegang|Sudah memegang|Pengerusi Persatuan|Pengerusi Majlis/) || [''])[0]); }
  }
  /* v8.28: Pindah Cawangan (EN): kad syarat, modal pemilih kawasan, kad selepas pindah; tiada BM bocor. */
  await pu.evaluate(() => { const S = window.MyPolitikSave, p = S.loadPlayer(); S.applyEffects({}, { kiraTindakan: false, patch: { ip: 700, myr: 80000, ap: 10, keahlian: { sejakTahun: 2015, sejakBulan: 1 }, pru: Object.assign({}, window.MyPolitikPRU.getPRU(p), { status: null, statusKedua: null }), kabinet: Object.assign({}, window.MyPolitikKabinet.getKabinet(p), { hasGovernmentRole: false }) } }); window.NusaUI.render(); });
  await pu.locator('[data-tab="profil"]').first().evaluate((e) => e.click()).catch(() => {}); await pu.waitForTimeout(500);
  const pd1 = await pu.evaluate(() => { const c = document.querySelector('details[data-lipat="pf-pindah"]'); return c ? c.textContent : ''; });
  if (!/Branch Transfer/.test(pd1) || !/Once per term/.test(pd1) || !/Transfer Branch/.test(pd1) || /Pindah Cawangan|Sekali setiap|Tiada hukuman|Ahli sekurang/.test(pd1)) { ralat.push('kad pindah cawangan EN salah: ' + pd1.slice(0, 300)); }
  await pu.locator('[data-act="pindah-mula"]').first().evaluate((e) => e.click()).catch(() => {}); await pu.waitForTimeout(1500);
  const pd2 = await pu.evaluate(() => (document.getElementById('modal-isi') || {}).innerText || '');
  if (!/Choose your new area/.test(pd2) || /Pilih kawasan|Cawangan|Negeri/.test(pd2)) { ralat.push('modal pindah cawangan EN salah: ' + pd2.slice(0, 260)); }
  await pu.evaluate(() => { const t = document.getElementById('modal-tutup'); if (t) { t.click(); } }); await pu.waitForTimeout(300);
  await pu.evaluate(() => { const D = window.MyPolitikData, h = D.getFallbackData(), n = h.negeri[h.negeri.length - 1], b = n.bahagian[n.bahagian.length - 1], d = b.dun[b.dun.length - 1], c = d.cawangan[d.cawangan.length - 1]; window.MyPolitikPindah.pindah(Object.assign({}, c, { negeri: n.nama, bahagianNama: b.nama, dunNama: d.nama })); window.NusaUI.render(); });
  await pu.waitForTimeout(500);
  const pd3 = await pu.evaluate(() => { const c = document.querySelector('details[data-lipat="pf-pindah"]'); return c ? c.textContent : ''; });
  if (!/Waiting period before contesting/.test(pd3) || !/Transfer history/.test(pd3) || /Tempoh menunggu|Sejarah pindahan/.test(pd3)) { ralat.push('kad pindah cawangan selepas pindah EN salah: ' + pd3.slice(0, 300)); }
  await pu.close();

  /* v8.13: tab Harta (EN) dan pengisytiharan SPRM wajib. */
  await tutup();
  await pg.evaluate(() => { const S = window.MyPolitikSave; S.applyEffects({}, { kiraTindakan: false, patch: { myr: 300000 } }); window.MyPolitikHarta.beli('wisma'); });
  await pg.locator('#tab-profil').first().evaluate((e) => e.click()).catch(() => {}); await pg.waitForTimeout(300); await pg.evaluate(() => { const d = document.querySelector('details[data-lipat="pf-harta"]'); if (d) { d.open = true; } }); await pg.waitForTimeout(400); await imbas('tab profil (harta)');
  const ht = await pg.evaluate(() => (document.getElementById('panel-profil') || {}).innerText || '');
  if (!/asset catalogue/i.test(ht) || !/office building/i.test(ht)) { ralat.push('panel Harta EN salah: ' + ht.slice(0, 120)); }
  if (/Katalog|Hartanah|Penyelenggaraan|Kekayaan/.test(ht)) { ralat.push('panel Harta bocor BM: ' + ht.slice(0, 160)); }
  await pg.evaluate(() => { const S = window.MyPolitikSave, p = S.loadPlayer(); S.applyEffects({}, { kiraTindakan: false, patch: { harta: Object.assign({}, p.harta, { menunggu: { sebab: 'tahunan' } }) } }); window.NusaHarta_UI.isytihar(); });
  await pg.waitForTimeout(600); await imbas('modal deklarasi');
  const dk = await pg.evaluate(() => (document.querySelector('.acara__pil') || document.getElementById('modal-isi') || {}).innerText || '');
  if (!/Transparent/.test(dk) || /Telus|Sembunyi|Pengisytiharan/.test(dk)) { ralat.push('modal deklarasi EN salah: ' + dk.slice(0, 160)); }
  await pg.locator('.acara__opsi[data-pilih="telus"]').first().evaluate((e) => e.click()).catch(() => {}); await pg.waitForTimeout(600);
  if (await pg.evaluate(() => !!window.MyPolitikSave.loadPlayer().harta.menunggu)) { ralat.push('deklarasi masih menunggu selepas dijawab'); }

  /* v8.22: sewa hartanah dan naik taraf (EN). */
  await pg.evaluate(() => { const S = window.MyPolitikSave; S.applyEffects({}, { kiraTindakan: false, patch: { myr: 400000 } }); window.MyPolitikHarta.beli('rumah'); window.NusaHarta_UI.render ? window.NusaHarta_UI.render() : 0; });
  await pg.locator('#tab-profil').first().evaluate((e) => e.click()).catch(() => {}); await pg.waitForTimeout(300); await pg.evaluate(() => { const d = document.querySelector('details[data-lipat="pf-harta"]'); if (d) { d.open = true; } }); await pg.waitForTimeout(400); await imbas('harta naik taraf');
  const nt = await pg.evaluate(() => (document.getElementById('panel-profil') || {}).textContent || '');
  if (!/Bungalow/.test(nt) || !/Upgrade/.test(nt) || !/Rent RM/.test(nt) || !/Property rent per month/.test(nt)) { ralat.push('panel naik taraf EN salah: ' + nt.slice(0, 160)); }
  if (/Naik taraf|Sewa |banglo|Kompleks/.test(nt)) { ralat.push('panel naik taraf bocor BM'); }
  await pg.locator('[data-act="harta-naik"]').first().evaluate((e) => e.click()).catch(() => {}); await pg.waitForTimeout(500);
  if (await pg.evaluate(() => !window.MyPolitikHarta.getHarta(window.MyPolitikSave.loadPlayer()).aset.banglo)) { ralat.push('naik taraf banglo tidak berjaya'); }

  /* v8.14: pratonton bulan menunjukkan elaun jawatan kerajaan dan nota kerjaya dihentikan (EN). */
  await tutup();
  await pg.evaluate(() => { const S = window.MyPolitikSave, p = S.loadPlayer(); S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: Object.assign({}, window.MyPolitikKabinet.getKabinet(p), { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH' }) } }); });
  await pg.locator('#btn-tahun').click().catch(() => {}); await pg.waitForTimeout(500); await imbas('pratonton menteri');
  const pv = await pg.evaluate(() => (document.getElementById('modal-isi') || {}).innerText || '');
  if (!/Government post allowance/.test(pv) || !/Career income stops/.test(pv)) { ralat.push('pratonton menteri EN salah: ' + pv.slice(0, 200)); }
  if (/Elaun jawatan|dihentikan/.test(pv)) { ralat.push('pratonton menteri bocor BM'); }
  await tutup();

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

  /* v8.11: peruntukan kempen tiada pilihan lalai; butang mula kempen tidak aktif sehingga dipilih. */
  await pg.evaluate(() => {
    const S = window.MyPolitikSave, R = window.MyPolitikPRU, rng = () => 0.0001;
    S.applyEffects({}, { kiraTindakan: false, patch: { ip: 400, myr: 50000, jawatan: 'AJK Cawangan', bulan: 6, jawatanList: [{ kod: 'ajk_cawangan', jawatan: 'AJK Cawangan', peringkat: 'cawangan', kumpulan: 'utama', sayap: null, pangkat: 1, tahun: S.loadPlayer().tahun }] } });
    R.isytihar('tamat_penggal', { rng }); R.pilihKerusi('DUN', { rng });
    const a = R.getPRU(S.loadPlayer()).aktif; if (a && a.fasa === 'runding') { R.runding('abai', { rng }); }
    window.__alir = window.NusaPRU_UI.alir(); window.__fasa = R.getPRU(S.loadPlayer()).aktif.fasa;
  });
  await pg.waitForTimeout(800); await imbas('modal manifesto');
  const dm = await pg.evaluate(() => ({ fasa: window.__fasa, radio: document.querySelectorAll('#modal-isi input[name=dana]').length, dipilih: document.querySelectorAll('#modal-isi input[name=dana]:checked').length, ringkas: (document.getElementById('pru-ringkas-dana') || {}).innerText || '' }));
  if (dm.fasa === 'manifesto') {
    if (!dm.radio) { ralat.push('pilihan peruntukan tiada'); }
    if (dm.dipilih !== 0) { ralat.push('peruntukan masih ditanda lalai: ' + dm.dipilih); }
    if (!/Please choose the campaign allocation/.test(dm.ringkas)) { ralat.push('ringkasan dana EN salah: ' + dm.ringkas.slice(0, 100)); }
    await pg.evaluate(() => { document.querySelectorAll('#modal-isi input[name=janji]').forEach((e, i) => { if (i < 3) { e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); } }); });
    const mulaOff = await pg.evaluate(() => { const bt = document.querySelector('#modal-kaki button:last-child'); return bt && bt.disabled; });
    if (!mulaOff) { ralat.push('butang mula kempen aktif walaupun peruntukan belum dipilih'); }
    await pg.evaluate(() => { const r = document.querySelectorAll('#modal-isi input[name=dana]'); const e = r[r.length - 1]; e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); });
    const mulaOn = await pg.evaluate(() => { const bt = document.querySelector('#modal-kaki button:last-child'); return bt && !bt.disabled; });
    const rg = await pg.evaluate(() => (document.getElementById('pru-ringkas-dana') || {}).innerText || '');
    if (!mulaOn) { ralat.push('butang mula kempen masih tidak aktif selepas peruntukan dipilih'); }
    if (!/You are investing RM/.test(rg)) { ralat.push('ringkasan pelaburan EN salah: ' + rg.slice(0, 100)); }
  } else { ralat.push('fasa bukan manifesto untuk ujian peruntukan: ' + dm.fasa); }

  /* v8.12: skrin Permainan Baharu ada pilihan latar belakang profesional (lalai Profesional / Korporat). */
  const pgIdx = await b.newPage({ viewport: { width: 420, height: 900 } });
  await pgIdx.route('**/*', (r) => { const u = new URL(r.request().url()); return u.hostname === '127.0.0.1' ? r.continue() : r.fulfill({ status: 204, body: '' }); });
  await pgIdx.goto(base + '/index.html'); await pgIdx.waitForTimeout(800);
  const idx = await pgIdx.evaluate(() => ({ n: document.querySelectorAll('input[name=kerjaya]').length, lalai: (document.querySelector('input[name=kerjaya]:checked') || {}).value }));
  if (idx.n !== 3 || idx.lalai !== 'korporat') { ralat.push('pilihan kerjaya di Permainan Baharu tidak betul: ' + JSON.stringify(idx)); }
  await pgIdx.close();
  await b.close(); pelayan.close();
  console.log('Ralat JavaScript: ' + ralat.length + (ralat.length ? '\n  - ' + ralat.slice(0, 5).join('\n  - ') : ''));
  console.log('Teks BM bocor dalam EN: ' + bocor.size + (bocor.size ? '\n  - ' + [...bocor].slice(0, 40).map((x) => x[1] + ': ' + x[0]).join('\n  - ') : ''));
  process.exit(ralat.length || bocor.size ? 1 : 0);
})().catch((e) => { console.error(e); try { pelayan.close(); } catch (x) { /* abaikan */ } process.exit(1); });
