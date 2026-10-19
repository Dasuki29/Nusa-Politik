/* ==========================================================================
   Nusa Politik — js/sfx.js   (v8.7)
   Pengurus kesan bunyi (SoundManager) — semua bunyi dijana oleh Web Audio (tiada fail audio, tiada hak cipta).

   Bunyi:
     ketuk()   ketukan tukul Pengerusi (keputusan mesyuarat / undi Dewan & DUN dimuktamadkan)
     sorak()   sorakan perwakilan (menang pemilihan jawatan atau PRU)
     flash()   rana kamera + denyar (sidang media)

   Tetapan: { on, vol } disimpan di peranti (localStorage 'myPolitik_sfx'), sama seperti tetapan
   muzik latar (js/audio.js): ia pilihan peranti, bukan sebahagian simpanan watak. Kawalan
   (🔔/🔕 dan kelantangan) ditambah dalam bar muzik sedia ada (#mpa-bar) dan kelihatan
   apabila bar dibuka (butang ⋯).

   Pencetus automatik: setiap kali profil disimpan (MyPolitikSave.subscribe), log terkini dibaca:
     usul_*, tutup_mesyuarat, dewan_undi, dun_undi, dewan_tp, dun_tp  -> ketuk
     pemilihan_* (Menang ...), pru_keputusan / prk_keputusan (MENANG ...) -> sorak
   Sidang media memanggil flash() terus daripada js/media-ui.js.

   API (window.MyPolitikSFX, juga window.SoundManager):
     ketuk() / sorak() / flash()   pulang true jika bunyi dimainkan
     main(nama)                    nama: 'ketuk' | 'sorak' | 'flash'
     setOn(b) / setVolume(0..1) / isOn() / getVolume()
     bagiPencetus(profil, meta)    -> nama bunyi atau null (tulen, untuk ujian)
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikSFX = api;
  root.SoundManager = api;
  if (root.document && root.MyPolitikSave && root.MyPolitikSave.subscribe) {
    var mula = function () { api.init(); };
    if (root.document.readyState === 'loading') { root.document.addEventListener('DOMContentLoaded', mula); } else { mula(); }
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  var KUNCI = 'myPolitik_sfx';
  var st = { on: true, vol: 0.6, ctx: null, master: null, akhir: {}, sudahInit: false, ui: null };

  function baca() {
    try {
      var o = JSON.parse(root.localStorage.getItem(KUNCI) || 'null');
      if (o) { st.on = o.on !== false; st.vol = typeof o.vol === 'number' ? Math.min(1, Math.max(0, o.vol)) : st.vol; }
    } catch (e) { /* guna lalai */ }
  }
  function simpan() { try { root.localStorage.setItem(KUNCI, JSON.stringify({ on: st.on, vol: st.vol })); } catch (e) { /* abaikan */ } }

  function konteks() {
    if (st.ctx) { return st.ctx; }
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) { return null; }
    try {
      st.ctx = new AC();
      st.master = st.ctx.createGain();
      st.master.gain.value = st.vol;
      st.master.connect(st.ctx.destination);
    } catch (e) { st.ctx = null; st.master = null; }
    return st.ctx;
  }

  /* Hingar putih pendek (dikongsi supaya tidak dijana semula setiap kali). */
  function hingar(c, saat) {
    var n = Math.max(1, Math.floor(c.sampleRate * saat)), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) { d[i] = Math.random() * 2 - 1; }
    return buf;
  }
  /** Letupan hingar bertapis: t = masa mula, dur = tempoh, puncak = gain, jenis/frek = penapis. */
  function letupan(c, t, dur, puncak, jenis, frek, q) {
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = hingar(c, dur + 0.05); f.type = jenis; f.frequency.value = frek; f.Q.value = q || 1;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(puncak, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(st.master); s.start(t); s.stop(t + dur + 0.05);
  }
  function nada(c, t, dur, f0, f1, puncak, jenis) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = jenis || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(puncak, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(st.master); o.start(t); o.stop(t + dur + 0.02);
  }

  var BUNYI = {
    /* Tukul kayu: dua ketukan; setiap satu ialah retakan hingar + dentum rendah. */
    ketuk: function (c, t) {
      [0, 0.17].forEach(function (d) {
        letupan(c, t + d, 0.05, 0.9, 'bandpass', 1900, 1.2);
        nada(c, t + d, 0.14, 210, 70, 0.9, 'sine');
      });
    },
    /* Sorakan: hingar bertapis yang membengkak, ditambah tepukan rawak. */
    sorak: function (c, t) {
      var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = hingar(c, 1.7); f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = 0.7;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.5, t + 0.3); g.gain.setValueAtTime(0.5, t + 0.9); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      s.connect(f); f.connect(g); g.connect(st.master); s.start(t); s.stop(t + 1.7);
      for (var i = 0; i < 14; i++) { letupan(c, t + 0.1 + Math.random() * 1.2, 0.04, 0.35, 'highpass', 1200 + Math.random() * 1500, 0.8); }
    },
    /* Rana kamera (dua klik) dan denyar (nada tinggi menurun). */
    flash: function (c, t) {
      letupan(c, t, 0.025, 0.8, 'highpass', 3500, 0.7);
      letupan(c, t + 0.05, 0.03, 0.6, 'highpass', 2500, 0.7);
      nada(c, t + 0.005, 0.25, 5200, 1800, 0.15, 'triangle');
    }
  };

  function main(nama) {
    if (!st.on || st.vol <= 0 || !BUNYI[nama]) { return false; }
    var sekarang = Date.now();
    if (st.akhir[nama] && sekarang - st.akhir[nama] < 350) { return false; }            // elak bunyi bertindih berganda
    var c = konteks();
    if (!c) { return false; }
    try {
      if (c.state === 'suspended' && c.resume) { c.resume(); }
      st.master.gain.value = st.vol;
      BUNYI[nama](c, c.currentTime + 0.01);
      st.akhir[nama] = sekarang;
      return true;
    } catch (e) { return false; }
  }

  /** Bunyi untuk satu simpanan profil (tulen). */
  function bagiPencetus(p, meta) {
    var t = meta && meta.tindakan ? String(meta.tindakan) : '';
    var l0 = p && Array.isArray(p.log) ? p.log[0] : null, nama = l0 && l0.tindakan === t ? String(l0.nama || '') : '';
    if (/^(usul_|tutup_mesyuarat$|dewan_undi$|dun_undi$|dewan_tp$|dun_tp$)/.test(t)) { return 'ketuk'; }
    if (/^pemilihan_/.test(t) && /^Menang/.test(nama)) { return 'sorak'; }
    if (/^(pru|prk)_keputusan$/.test(t) && /^MENANG/i.test(nama)) { return 'sorak'; }
    return null;
  }

  function setOn(b) { st.on = !!b; simpan(); papar(); }
  function setVolume(v) {
    st.vol = Math.min(1, Math.max(0, Number(v) || 0));
    if (st.master) { st.master.gain.value = st.vol; }
    simpan();
  }

  /* ---------- Kawalan dalam bar muzik sedia ada ---------- */
  var CSS = '.mpa-sfx,.mpa-sfxvol{display:none}.mpa-bar.is-open .mpa-sfx{display:grid}.mpa-bar.is-open .mpa-sfxvol{display:block}' +
    '.mpa-sfx{width:32px;height:32px;border-radius:50%;border:1px solid var(--border,#2E333F);background:transparent;color:var(--text,#F4F5F7);cursor:pointer;font-size:.95rem;place-items:center}' +
    '.mpa-sfx[aria-pressed="false"]{opacity:.6}.mpa-sfxvol{width:70px;accent-color:#F2B705}' +
    '.mpa-sfx:focus-visible,.mpa-sfxvol:focus-visible{outline:2px solid #F2B705;outline-offset:2px}';
  function papar() {
    if (!st.ui) { return; }
    st.ui.btn.setAttribute('aria-pressed', String(st.on));
    st.ui.btn.textContent = st.on ? '🔔' : '🔕';
    var lbl = st.on ? 'Matikan kesan bunyi' : 'Hidupkan kesan bunyi';
    st.ui.btn.setAttribute('aria-label', lbl); st.ui.btn.title = lbl;
  }
  function binaUI() {
    var d = root.document, bar = d && d.getElementById('mpa-bar');
    if (!bar || st.ui || d.getElementById('mpa-sfx')) { return !!st.ui; }
    var sty = d.createElement('style'); sty.textContent = CSS; d.head.appendChild(sty);
    var btn = d.createElement('button'); btn.type = 'button'; btn.id = 'mpa-sfx'; btn.className = 'mpa-sfx';
    var vol = d.createElement('input'); vol.type = 'range'; vol.min = '0'; vol.max = '100'; vol.className = 'mpa-sfxvol'; vol.value = String(Math.round(st.vol * 100));
    vol.setAttribute('aria-label', 'Kelantangan kesan bunyi');
    btn.addEventListener('click', function () { setOn(!st.on); if (st.on) { main('ketuk'); } });
    vol.addEventListener('input', function () { setVolume(vol.value / 100); });
    vol.addEventListener('change', function () { main('ketuk'); });                          // pratonton apabila dilepaskan
    bar.insertBefore(vol, bar.firstChild); bar.insertBefore(btn, vol);
    st.ui = { btn: btn, vol: vol };
    papar();
    return true;
  }

  function init() {
    if (st.sudahInit) { return; }
    st.sudahInit = true;
    baca();
    var cuba = 0;
    (function tunggu() { if (!binaUI() && cuba++ < 20) { root.setTimeout(tunggu, 250); } })();    // bar muzik dibina oleh audio.js
    var S = root.MyPolitikSave;
    if (S && S.subscribe) {
      S.subscribe(function (profil, meta) { var b = bagiPencetus(profil, meta); if (b) { main(b); } });
    }
  }

  return {
    KUNCI: KUNCI, init: init, main: main, bagiPencetus: bagiPencetus,
    ketuk: function () { return main('ketuk'); }, sorak: function () { return main('sorak'); }, flash: function () { return main('flash'); },
    setOn: setOn, setVolume: setVolume, isOn: function () { return st.on; }, getVolume: function () { return st.vol; },
    _muat: baca
  };
});
