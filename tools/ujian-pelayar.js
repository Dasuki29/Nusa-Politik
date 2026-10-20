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
  fs.readdirSync(path.join(ROOT, 'js')).filter((f) => /\.js$/.test(f) && !/^(translations|i18n|tutorial|tutorial-en|data|watak|geo)/.test(f)).forEach((f) => {
    const src = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
    let m; while ((m = re.exec(src))) {
      const t = (m[1] || m[2] || '').replace(/\\'/g, "'").trim();
      if (t.length >= 4 && t.length <= 120 && /^[A-ZÀ-Ý][A-Za-zÀ-ÿ'’ \-\/&.,:;!?()%+0-9]+$/.test(t) && /[a-z]{3}/.test(t)) { set.add(t); }
    }
  });
  return [...set];
}
/* Nama khas yang sengaja kekal (negeri, istilah UMNO, jenama). */
const NAMA_KHAS = /^(Perlis|Kedah|Kelantan|Terengganu|Pulau Pinang|Perak|Pahang|Selangor|Wilayah Persekutuan|Negeri Sembilan|Melaka|Johor|Sarawak|Sabah|Bumiputera|Pemuda|Wanita|Puteri|UMNO|PAU|MKT|Nusa Politik|Barisan Nasional|Dewan Rakyat|Dewan Negara|Bahasa Melayu|Hard|Easy|Normal)$/;
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
  await pg.locator('[data-tab="pencapaian"]').first().evaluate((e) => e.click()); await pg.waitForTimeout(500); await imbas('tab pencapaian');
  const panelPC = await pg.evaluate(() => document.getElementById('panel-pencapaian').innerText);
  if (!/1 \/ 5 unlocked/.test(panelPC) || !/Foremost Statesman/.test(panelPC) || !/Progress|Unlocked/.test(panelPC)) { ralat.push('panel pencapaian EN tidak betul: ' + panelPC.replace(/\s+/g, ' ').slice(0, 160)); }
  const sisi = await pg.evaluate(() => (document.getElementById('s-kesetiaan') || {}).innerText || '');
  if (!/Fence-sitter Support/i.test(sisi) || !/Wavering|Hostile|Leaning supportive/.test(sisi)) { ralat.push('meter Atas Pagar EN tiada/salah: ' + sisi.replace(/\s+/g, ' ').slice(0, 160)); }
  for (const tab of ['tindakan', 'mesyuarat', 'pemilihan', 'pilihanraya', 'dewan', 'pencapaian', 'peta']) {
    await tutup();
    const t = pg.locator('[data-tab="' + tab + '"]').first();
    if (await t.count()) { await t.evaluate((e) => e.click()); await pg.waitForTimeout(500); await imbas('tab ' + tab); }
    if (tab === 'peta') {
      await jelajahPeta();
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
  await pu.close();

  /* v8.13: tab Harta (EN) dan pengisytiharan SPRM wajib. */
  await tutup();
  await pg.evaluate(() => { const S = window.MyPolitikSave; S.applyEffects({}, { kiraTindakan: false, patch: { myr: 300000 } }); window.MyPolitikHarta.beli('wisma'); });
  await pg.locator('#tab-harta').first().evaluate((e) => e.click()).catch(() => {}); await pg.waitForTimeout(500); await imbas('tab harta');
  const ht = await pg.evaluate(() => (document.getElementById('panel-harta') || {}).innerText || '');
  if (!/asset catalogue/i.test(ht) || !/office building/i.test(ht)) { ralat.push('panel Harta EN salah: ' + ht.slice(0, 120)); }
  if (/Katalog|Hartanah|Penyelenggaraan|Kekayaan/.test(ht)) { ralat.push('panel Harta bocor BM: ' + ht.slice(0, 160)); }
  await pg.evaluate(() => { const S = window.MyPolitikSave, p = S.loadPlayer(); S.applyEffects({}, { kiraTindakan: false, patch: { harta: Object.assign({}, p.harta, { menunggu: { sebab: 'tahunan' } }) } }); window.NusaHarta_UI.isytihar(); });
  await pg.waitForTimeout(600); await imbas('modal deklarasi');
  const dk = await pg.evaluate(() => (document.querySelector('.acara__pil') || document.getElementById('modal-isi') || {}).innerText || '');
  if (!/Transparent/.test(dk) || /Telus|Sembunyi|Pengisytiharan/.test(dk)) { ralat.push('modal deklarasi EN salah: ' + dk.slice(0, 160)); }
  await pg.locator('.acara__opsi[data-pilih="telus"]').first().evaluate((e) => e.click()).catch(() => {}); await pg.waitForTimeout(600);
  if (await pg.evaluate(() => !!window.MyPolitikSave.loadPlayer().harta.menunggu)) { ralat.push('deklarasi masih menunggu selepas dijawab'); }

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
