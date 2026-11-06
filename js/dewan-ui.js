/* ==========================================================================
   Nusa Politik — js/dewan-ui.js   (v7.55, v13.25)
   UI tab Dewan Rakyat (js/dewan.js): kerusi mengikut gabungan, bentang RUU/Bajet, lobi MP, undian,
   Usul Undi Tidak Percaya (3 hari) dan Soal Jawab Lisan.
   v13.25: carta hemisikal (satu titik = satu kerusi) menggantikan bar kerusi di tab Dewan; kerusi pemain ditonjolkan;
     animasi isian sekali bagi setiap keputusan PRU (boleh dilangkau). Paparan sahaja, angka tidak berubah.
   Bergantung pada W.NusaUI (modal, toast, render, esc, fmt) daripada js/app.js.
   ========================================================================== */
(function (W) {
  'use strict';
  /** v10.0: parti Sarawak (PBB mod penuh; PRS dan lain-lain mod ringan) guna enjin Sarawak yang sama. */
  function SW(k) { return k === 'PBB' || k === 'PRS' || k === 'SUPP' || k === 'PDP' || k === 'PSB'; }
  var D0 = W.MyPolitikDewan, N = W.MyPolitikDUN, S = W.MyPolitikSave, D = D0;
  if (!D0 || !S) { return; }
  /** Pilih enjin: Dewan Rakyat (MP/Menteri) atau DUN (ADUN/EXCO); API kedua-duanya sama. */
  var pilihan = 'RAKYAT';      // dewan yang dipapar apabila pemain memegang dua kerusi (Parlimen + DUN)
  function kedua(p) { return !!(N && D0.aktif(p) && N.aktif(p)); }
  /** Jika dua dewan aktif, papar dewan yang ada soalan/usul menunggu. */
  function utamakan(p, fn) { if (kedua(p)) { var m = [D0, N].filter(function (x) { return x.aktif(p) && x[fn](p); })[0]; if (m) { pilihan = m === N ? 'DUN' : 'RAKYAT'; } } }
  function pilih(p) { D = D0.aktif(p) && !(kedua(p) && pilihan === 'DUN') ? D0 : (N && N.aktif(p) ? N : D0); return D; }
  var BULAN = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  var WARNA = { BN: '#2D50B8', PH: '#D7263D', PN: '#0B2A5B', LAIN: '#7A808C' };

  function U() { return W.NusaUI; }
  function esc(s) { return U() ? U().esc(s) : String(s); }
  function toast(t, j) { if (U()) { U().toast(t, j); } }
  function segarkan() { if (U()) { U().render(); } }
  function modal(o) { return U().modal(o); }
  function tanda(n) { return (n > 0 ? '+' : '') + n; }

  var CSS = '' +
    '.dw-bar{display:flex;height:30px;border:2px solid var(--garis,var(--border));border-radius:6px;overflow:hidden;margin:8px 0;position:relative}' +
    '.dw-bar div{display:grid;place-items:center;color:#fff;font-size:.72rem;font-weight:800;min-width:0;white-space:nowrap;overflow:hidden}' +
    '.dw-garis{position:absolute;top:-3px;bottom:-3px;width:3px;background:#FFC107;box-shadow:0 0 0 1px #111}' +
    '.dw-undi{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0;text-align:center}' +
    '.dw-undi div{border:2px solid var(--garis,var(--border));border-radius:6px;padding:6px;background:var(--bg-elev-2)}.dw-undi b{display:block;font-size:1.25rem}' +
    '.dw-tp{border:3px solid var(--red);background:var(--bg-elev-1)}.dw-list{display:grid;gap:8px;margin:8px 0;padding:0;list-style:none}' +
    '.dw-list button{width:100%;text-align:left}.dw-sej{margin:6px 0 0;padding:0;list-style:none;font-size:.8rem}.dw-sej li{border-left:4px solid var(--garis,var(--border));padding-left:8px;margin:4px 0;color:var(--text-muted)}' +
    '.dw-tukar{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 10px}.dw-lulus{color:#14994F;font-weight:800}.dw-gagal{color:#D3162F;font-weight:800}' +
    '.dw-hemi{margin:6px 0 2px;color:var(--text,#222)}.dw-hemi svg{display:block;width:100%;max-width:560px;height:auto;margin:0 auto}' +
    '.dw-hemi circle[data-hemi-anda]{cursor:pointer}.dw-hemi-leg{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 12px;font-size:.78rem;margin:4px 0}' +
    '.dw-hemi-leg i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;vertical-align:-1px}.dw-hemi-sub{text-align:center;font-size:.85rem;margin:0}' +
    '.dw-hemi--anim circle{opacity:0;animation:dwpop .25s ease-out forwards}.dw-hemi--anim .dw-hemi-siap{opacity:0;animation:dwpop .3s ease-out 2.1s forwards}' +
    '@keyframes dwpop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}.dw-hemi circle{transform-box:fill-box;transform-origin:center}' +
    '.dw-hemi--siap circle,.dw-hemi--siap .dw-hemi-siap{animation:none!important;opacity:1!important}' +
    '.dw-hemi-pru{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:0 0 6px}.dw-chg{display:inline-block;border:2px solid var(--garis,var(--border));border-radius:6px;padding:0 6px;font-weight:800;font-size:.75rem;background:#b9f6ca;color:#111}.dw-chg.is-turun{background:#fdecea}' +
    '.dw-kelip{animation:dwkelip .5s ease-in-out 3}@keyframes dwkelip{50%{opacity:.15}}.dw-ubah{margin:6px 0 0;font-size:.85rem}.dw-ubah summary{cursor:pointer;font-weight:700}' +
    '@media (prefers-reduced-motion:reduce){.dw-kelip{animation:none}.dw-hemi--anim circle,.dw-hemi--anim .dw-hemi-siap{animation:none;opacity:1}}';
  (function () { var s = W.document.createElement('style'); s.textContent = CSS; W.document.head.appendChild(s); })();

  function bar(label, nilai, bahaya) {
    nilai = Math.max(0, Math.min(100, Math.round(nilai)));
    return '<div class="loy__row"><div class="loy__label"><span>' + esc(label) + '</span><b>' + nilai + '%</b></div>' +
      '<div class="progress progress--sm' + (bahaya ? ' progress--danger' : '') + '" role="progressbar" aria-label="' + esc(label) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + nilai + '"><div class="progress__bar" style="width:' + nilai + '%"></div></div></div>';
  }
  function btn(act, id, teks, kecil, boleh, kelas) {
    var ok = boleh === true;      // string = sebab tidak boleh
    return '<li><button type="button" class="btn ' + (kelas || 'btn--ghost') + '" data-dewan="' + act + '" data-id="' + esc(id) + '"' + (ok ? '' : ' disabled') + '><b>' + esc(teks) + '</b><br><small>' + esc(kecil) + (ok ? '' : ' — ' + esc(boleh)) + '</small></button></li>';
  }
  function pecahKerusi(k, L) {
    var gab = (L && L.gab) || 'BN', nama = { BN: gab, PH: 'PH', PN: lawanPN(), LAIN: 'Lain' };                // v13.14: label gabungan pemain (GPS / Perpaduan), bukan BN
    var seg = [['BN', k.BN], ['PH', k.PH], ['PN', k.PN], ['LAIN', k.LAIN]], h = '<div class="dw-bar" role="img" aria-label="Kerusi ' + esc((L && L.dewan) || 'Dewan Rakyat') + '">';
    seg.forEach(function (s) { if (s[1] > 0) { h += '<div style="width:' + (s[1] / k.jumlah * 100) + '%;background:' + WARNA[s[0]] + '" title="' + esc(nama[s[0]]) + ' ' + s[1] + '">' + (s[1] >= 14 ? esc(nama[s[0]]) + ' ' + s[1] : '') + '</div>'; } });
    return h + '<i class="dw-garis" style="left:' + (k.ambang / k.jumlah * 100) + '%" title="Majoriti ' + k.ambang + '"></i></div>';
  }


  /* ---------- v13.25: carta hemisikal ---------- */
  var WARNA_H = { PARTI: '#1F3C8F', RAKAN: '#5B7FE0', BN: '#2D50B8', LAIN: '#9AA0AA', PH: '#D7263D', PN: '#0F7B5F', LAWAN: '#B5838D' };
  /* v13.31: pemain PAS: parti = hijau PAS, rakan PN = biru tua, slot lawan 'PN' dalaman = Barisan Nasional (biru). */
  var WARNA_PAS = { PARTI: '#0A7A3B', RAKAN: '#0B2A5B', BN: '#0A7A3B', LAIN: '#9AA0AA', PH: '#D7263D', PN: '#2D50B8', LAWAN: '#B5838D' };
  function pemainPAS(p) { try { var q = p || (S && S.loadPlayer ? S.loadPlayer() : null); return !!q && q.parti === 'PAS'; } catch (e) { return false; } }
  function warnaH(kod, p) { return (pemainPAS(p) ? WARNA_PAS : WARNA_H)[kod]; }
  function lawanPN(p) { return pemainPAS(p) ? 'BN' : 'PN'; }
  var GEOM = {};
  function hash(t) { var h = 0; t = String(t || ''); for (var i = 0; i < t.length; i++) { h = (h * 31 + t.charCodeAt(i)) >>> 0; } return h; }
  /** Kedudukan titik (disusun ikut sudut, kiri ke kanan) bagi n kerusi. */
  function geom(n) {
    if (GEOM[n]) { return GEOM[n]; }
    var rows = Math.max(3, Math.round(Math.sqrt(n / 1.6))), R = 1, r0 = 0.42, radii = [], pos = [], i, j;
    for (i = 0; i < rows; i++) { radii.push(r0 + (R - r0) * (i / (rows - 1))); }
    var tot = radii.reduce(function (a, b) { return a + b; }, 0), baki = n;
    var bil = radii.map(function (r, x) { var m = x === rows - 1 ? baki : Math.round(n * r / tot); baki -= m; return m; });
    radii.forEach(function (r, x) { var m = bil[x]; for (j = 0; j < m; j++) { var a = Math.PI * (m === 1 ? 0.5 : j / (m - 1)); pos.push({ x: -Math.cos(a) * r, y: Math.sin(a) * r, a: a, r: r }); } });
    pos.sort(function (p1, p2) { return (p1.a - p2.a) || (p2.r - p1.r); });
    GEOM[n] = { pos: pos, dot: (R - r0) / (rows - 1) * 0.42 };
    return GEOM[n];
  }
  /** Kerusi pemain dalam dewan ini: { nama, majoriti } atau null. */
  function kerusiAnda(p, dun) {
    var Pr = W.MyPolitikPRU, pr = Pr && Pr.getPRU ? Pr.getPRU(p) : null; if (!pr) { return null; }
    var st = [pr.status, pr.statusKedua].filter(function (x) { return x && x.jenis === (dun ? 'ADUN' : 'MP'); })[0]; if (!st) { return null; }
    var sj = (pr.sejarah || []).filter(function (x) { return x && x.kerusi === st.kerusi && x.hasil === 'menang'; }).pop();
    return { nama: st.kerusi || '', majoriti: sj && sj.majoriti != null ? sj.majoriti : null };
  }
  function blokHemi(k, L, p, dun) {
    var gab = (L && L.gab) || 'BN', b = [];
    if (!dun && typeof k.rakan === 'number' && k.rakan > 0 && k.BN - k.rakan > 0) {
      b.push({ kod: 'PARTI', nama: (p.parti || gab), n: k.BN - k.rakan, anda: true }, { kod: 'RAKAN', nama: 'Rakan gabungan', n: k.rakan });
    } else { b.push({ kod: 'BN', nama: gab, n: k.BN, anda: true }); }
    b.push({ kod: 'LAIN', nama: 'Bebas/lain', n: k.LAIN }, { kod: 'PH', nama: 'PH', n: k.PH }, { kod: 'PN', nama: lawanPN(p), n: k.PN });
    b = b.filter(function (x) { return x.n > 0; });
    return k.kerajaanBN === false ? b.reverse() : b;                       // pihak kerajaan di kiri
  }
  /** v13.26: lukis titik hemisikal. b = [{ warna, nama, n, anda?, kelip? }]; opt = { anim, sasar, namaAnda, label, kelip:[indeks] }. */
  function lukis(b, jumlah, ambang, opt) {
    opt = opt || {};
    var G = geom(jumlah), s = 92, cx = 100, cy = 100, lambat = (opt.ms || 2000) / jumlah, svg = '', i = 0, kelip = opt.kelip || [];
    b.forEach(function (x) {
      for (var j = 0; j < x.n && i < G.pos.length; j++, i++) {
        var q = G.pos[i], me = i === opt.sasar, rr = G.dot * s * (me ? 1.3 : 1), kl = kelip.indexOf(i) >= 0;
        svg += '<circle' + (kl ? ' class="dw-kelip"' : '') + ' cx="' + (cx + q.x * s).toFixed(2) + '" cy="' + (cy - q.y * s).toFixed(2) + '" r="' + rr.toFixed(2) + '" fill="' + x.warna + '"' +
          (me ? ' stroke="#FFC107" stroke-width="1.8" data-hemi-anda="1"' : '') + (opt.anim ? ' style="animation-delay:' + Math.round(i * lambat) + 'ms"' : '') + '><title>' + esc(me ? opt.namaAnda + ' · ' + x.nama : x.nama) + '</title></circle>';
      }
    });
    var ag = Math.PI * (ambang - 0.5) / jumlah, r1 = 0.34, r2 = 1.07;
    svg += '<line class="dw-hemi-siap" x1="' + (cx - Math.cos(ag) * r1 * s).toFixed(2) + '" y1="' + (cy - Math.sin(ag) * r1 * s).toFixed(2) + '" x2="' + (cx - Math.cos(ag) * r2 * s).toFixed(2) + '" y2="' + (cy - Math.sin(ag) * r2 * s).toFixed(2) + '" stroke="currentColor" stroke-width="1" stroke-dasharray="3 2"/>';
    svg += '<text class="dw-hemi-siap" x="100" y="96" text-anchor="middle" font-weight="800" font-size="18" fill="currentColor">' + (opt.label != null ? opt.label : jumlah) + '</text>';
    return '<svg viewBox="0 0 200 104" aria-hidden="true">' + svg + '</svg>';
  }
  function legenda(b, nombor) { return '<div class="dw-hemi-leg">' + b.map(function (x) { return '<span><i style="background:' + x.warna + '"></i>' + esc(x.nama) + (nombor ? ' <b>' + x.n + '</b>' : '') + '</span>'; }).join('') + '</div>'; }
  /** v13.26: carta undian (RUU / Bajet: Sokong, Atas pagar, Bantah; Undi Tidak Percaya: Setia, Goyah, Pembangkang). */
  function hemiUndi(seg, ambang, opt) {
    var jumlah = seg.reduce(function (a, x) { return a + x.n; }, 0); if (!jumlah) { return ''; }
    var b = seg.filter(function (x) { return x.n > 0; });
    return '<div class="dw-hemi' + (opt && opt.anim ? ' dw-hemi--anim' : '') + '" role="img">' + lukis(b, jumlah, ambang, { label: b[0] ? b[0].n : 0, anim: opt && opt.anim, ms: 1500 }) + legenda(b, true) + '</div>';
  }
  var WARNA_U = { SOKONG: '#2E9E5B', ATAS: '#E8A33D', BANTAH: '#D7263D' };
  var lihat = null;      // v13.26: PRU lepas yang dipapar ('tahun-bulan') atau null (semasa)
  function KS() { return W.MyPolitikKerusiSemasa; }
  function namaBlok(kod, p, L, dun) { var gab = (L && L.gab) || 'BN'; return kod === 'PARTI' ? (dun ? gab : (p.parti || gab)) : kod === 'RAKAN' ? 'Rakan gabungan' : kod === 'LAIN' ? 'Bebas/lain' : kod === 'LAWAN' ? 'Pembangkang' : kod === 'PN' ? lawanPN(p) : kod; }
  function tanda1(n) { return (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n); }
  function hemisikal(k, L, p, dun) {
    var jumlah = k.jumlah, b = blokHemi(k, L, p, dun), anda = kerusiAnda(p, dun), sasar = -1, h = '', M = KS();
    var senarai = M && M.sejarah ? M.sejarah(p).filter(function (e) { return dun ? !!e.dun : true; }) : [];
    var e = lihat ? senarai.filter(function (x) { return x.tahun + '-' + x.bulan === lihat; })[0] : null; if (!e) { lihat = null; }
    var butang = senarai.length ? '<div class="dw-hemi-pru">' + senarai.map(function (x) { var id = x.tahun + '-' + x.bulan; return '<button type="button" class="btn btn--sm ' + (lihat === id ? 'btn--primary' : 'btn--ghost') + '" data-dewan="hemi-sejarah" data-id="' + id + '">PRU ' + x.tahun + '</button>'; }).join('') +
      '<button type="button" class="btn btn--sm ' + (lihat ? 'btn--ghost' : 'btn--primary') + '" data-dewan="hemi-sejarah" data-id="">Semasa</button></div>' : '';
    if (e) {                                                                     // paparan sejarah PRU
      var d = dun ? e.dun : e, kods = d.LAWAN != null ? ['PARTI', 'RAKAN', 'LAWAN'] : ['PARTI', 'RAKAN', 'LAIN', 'PH', 'PN'];
      var bs = kods.map(function (kd) { return { warna: warnaH(kd === 'LAWAN' ? 'LAWAN' : (dun && kd === 'PARTI' ? 'BN' : kd), p), nama: namaBlok(kd, p, L, dun), n: Number(d[kd]) || 0 }; }).filter(function (x) { return x.n > 0; });
      var kjE = (d.PARTI + (d.RAKAN || 0)) >= d.ambang; if (!kjE) { bs.reverse(); }
      var gK = kjE ? d.PARTI + (d.RAKAN || 0) : d.jumlah - d.PARTI - (d.RAKAN || 0), ix = senarai.indexOf(e), sbl = ix > 0 ? (dun ? senarai[ix - 1].dun : senarai[ix - 1]) : null;
      h += '<div class="dw-hemi" role="img" aria-label="PRU ' + e.tahun + '">' + butang + lukis(bs, d.jumlah, d.ambang) +
        '<p class="dw-hemi-sub"><b>PRU ' + e.tahun + ' · Kerajaan ' + gK + ' · Pembangkang ' + (d.jumlah - gK) + '</b></p>' + legenda(bs, true) +
        (sbl ? '<p class="note dw-hemi-sub" style="font-size:.8rem">' + (!dun && (d.RAKAN || sbl.RAKAN) ? 'Berbanding PRU ' + senarai[ix - 1].tahun + ': ' + esc(namaBlok('PARTI', p, L, dun)) + ' ' + tanda1(d.PARTI - sbl.PARTI) + ', rakan gabungan ' + tanda1((d.RAKAN || 0) - (sbl.RAKAN || 0)) + '.' : 'Berbanding PRU ' + senarai[ix - 1].tahun + ': ' + esc(namaBlok('PARTI', p, L, dun)) + ' ' + tanda1(d.PARTI - sbl.PARTI) + '.') + '</p>' : '') +
        (d.LAWAN != null ? '<p class="note dw-hemi-sub" style="font-size:.76rem">PRU ini disimpan sebelum v13.26: pembangkang dipapar sebagai satu blok.</p>' : '') + '</div>';
      return h;
    }
    var kunci = 'nusa-hemi-' + (dun ? 'dun' : 'rakyat') + '-' + k.tahun + '-' + k.bulan, anim = false;
    try { anim = !W.localStorage.getItem(kunci); if (anim) { W.localStorage.setItem(kunci, '1'); } } catch (eA) { anim = false; }
    if (anda) { var bA = 0; b.forEach(function (x) { if (x.anda) { sasar = bA + (hash(anda.nama) % x.n); } bA += x.n; }); }
    /* perubahan semasa penggal: lencana, titik berkelip (sekali bagi setiap perubahan), senarai */
    var ubah = M && M.terkini ? M.terkini(p, 3).filter(function (x) { return !!x.dun === !!dun; }) : [], kelip = [], beza = {};
    ubah.forEach(function (x) { beza[x.ke] = (beza[x.ke] || 0) + 1; beza[x.dari] = (beza[x.dari] || 0) - 1; });
    var mula = {}, c0 = 0; b.forEach(function (x) { mula[x.kod] = c0; c0 += x.n; });
    ubah.forEach(function (x, n) {
      var kc = 'nusa-hemi-ubah-' + x.tahun + '-' + x.bulan + '-' + x.kerusi + '-' + n, baru = false;
      try { baru = !W.localStorage.getItem(kc); if (baru) { W.localStorage.setItem(kc, '1'); } } catch (eK) { baru = false; }
      var kd = dun && x.ke === 'PARTI' ? 'BN' : x.ke, bx = b.filter(function (y) { return y.kod === kd; })[0];
      if (baru && bx) { kelip.push(mula[kd] + Math.max(0, bx.n - 1 - n)); }
    });
    var lencana = Object.keys(beza).filter(function (kd) { return beza[kd]; }).map(function (kd) { return '<span class="dw-chg' + (beza[kd] < 0 ? ' is-turun' : '') + '">' + esc(namaBlok(kd, p, L, dun)) + ' <b>' + tanda1(beza[kd]) + '</b></span>'; }).join(' ');
    var bw = b.map(function (x) { return { warna: warnaH(x.kod, p), nama: x.nama, n: x.n }; });
    var kj = k.kerajaanBN === false ? jumlah - k.BN : k.BN;
    h += '<div class="dw-hemi' + (anim ? ' dw-hemi--anim' : '') + '" role="img" aria-label="' + esc((L && L.dewan) || 'Dewan Rakyat') + '">' + butang + (lencana ? '<p class="dw-hemi-sub">' + lencana + '</p>' : '') +
      lukis(bw, jumlah, k.ambang, { anim: anim, sasar: sasar, namaAnda: anda ? anda.nama : '', kelip: kelip }) +
      '<p class="dw-hemi-sub"><b>Kerajaan ' + kj + ' · Pembangkang ' + (jumlah - kj) + '</b></p>' + legenda(bw) +
      '<p class="note dw-hemi-sub" style="font-size:.76rem">Garis putus = majoriti mudah (' + k.ambang + ').' + (anda ? ' Titik bertepi kuning = kerusi anda.' : '') + '</p>' +
      (anda ? '<p class="note dw-hemi-sub" style="font-size:.8rem">⭐ Kerusi anda: <b>' + esc(anda.nama) + '</b>' + (anda.majoriti != null ? ' · majoriti ' + Number(anda.majoriti).toLocaleString('en') : '') + '</p>' : '') +
      (anim ? '<p class="dw-hemi-sub"><button type="button" class="btn btn--sm btn--ghost" data-dewan="hemi-langkau">⏭️ Langkau animasi</button></p>' : '') + '</div>';
    var log = (p.kerusiNasional && Array.isArray(p.kerusiNasional.perubahan) ? p.kerusiNasional.perubahan : []).filter(function (x) { return !!x.dun === !!dun; });
    if (log.length) {
      h += '<details class="dw-ubah"><summary>🔄 Perubahan kerusi semasa penggal (' + log.length + ')</summary><ul class="dw-sej">' + log.slice().reverse().map(function (x) {
        return '<li>' + esc(BULAN[(x.bulan || 1) - 1] + ' ' + x.tahun) + ': PRK ' + esc(x.kerusi) + ' · ' + esc(namaBlok(x.ke, p, L, dun)) + ' merampas kerusi daripada ' + esc(namaBlok(x.dari, p, L, dun)) + '</li>';
      }).join('') + '</ul></details>';
    }
    return h;
  }
  /* ---------- Panel ---------- */
  function panel(p) {
    try {
      var r = pilih(p).ringkasan(p), L = r.label || { dewan: 'Dewan Rakyat', usul: 'RUU', ketua: 'kerajaan', gab: SW(p.parti) ? 'Perpaduan' : p.parti === 'PAS' ? 'PN' : 'BN' };
      var sw = kedua(p) ? '<div class="dw-tukar" role="group" aria-label="Pilih dewan"><button type="button" class="btn btn--sm ' + (D === D0 ? 'btn--primary' : 'btn--ghost') + '" data-dewan="tukar" data-id="RAKYAT">🏛️ Dewan Rakyat</button> <button type="button" class="btn btn--sm ' + (D === N ? 'btn--primary' : 'btn--ghost') + '" data-dewan="tukar" data-id="DUN">🏢 DUN' + (p.negeri ? ' ' + esc(p.negeri) : '') + '</button></div>' : '';
      if (!r.aktif) { return '<div class="banner"><strong>Dewan Rakyat</strong>Tab ini terbuka apabila anda menjadi Ahli Parlimen, Menteri, ADUN atau EXCO Negeri.</div>'; }
      var k = r.kerusi, h = sw;
      h += '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🏛️ ' + esc(L.dewan) + (L.negeri ? ' · ' + esc(L.negeri) : '') + '</h2>';
      if (!k) { return h + '<p class="note">Belum ada keputusan PRU untuk dipaparkan.</p></section>'; }
      h += '<p class="note">' + esc(r.peranan === 'MP' ? 'Ahli Parlimen' : r.peranan === 'ADUN' ? 'ADUN' : r.peranan === 'EXCO' ? (L.gab === 'GPS' ? 'Menteri Negeri' : 'EXCO Negeri') : 'Menteri') + (r.portfolio ? ' · ' + esc(r.portfolio) : '') + ' · ' + (r.kerajaan ? (L.gab && L.gab !== 'BN' ? '<b>Kerajaan: ' + esc(L.gab) + '</b>' : '<b>Kerajaan: BN</b>') : (L.gab && L.gab !== 'BN' ? 'Bukan kerajaan ' + esc(L.gab) : 'Bukan kerajaan BN')) + ' · majoriti ' + r.ambang + '/' + k.jumlah + '</p>';
      h += hemisikal(k, L, p, D !== D0);                                       // v13.25: ganti bar kerusi
      h += '<p class="note">' + (k.kerajaanBN === false ? esc(L.gab || 'BN') + ' (pembangkang)' : 'Kerajaan (' + esc(L.gab || 'BN') + ')') + ' <b>' + k.BN + '</b> · PH <b>' + k.PH + '</b> · PN <b>' + k.PN + '</b> · Bebas/lain <b>' + k.LAIN + '</b></p>';
      if (r.kerajaan) { h += bar('Kestabilan gabungan', r.kestabilan, r.kestabilan < 30) + (r.rating !== null ? bar('Penarafan Tadbir Urus', r.rating, r.rating < 30) : ''); }
      h += '<p class="note" style="font-size:.78rem">Simulasi: angka kerusi dianggar daripada keputusan PRU dalam permainan.</p></section>';

      if (r.tp) { h += kadTP(r.tp, L); }
      if (r.soalan) { h += '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🎤 Waktu Pertanyaan Menteri</h2><p class="note"><b>' + esc(r.soalan.yb) + '</b>: ' + esc(r.soalan.soal) + '</p><button type="button" class="btn btn--primary btn--block" data-dewan="soalan">Jawab Soalan</button></section>'; }
      if (r.undi) { h += kadUndi(r.undi); }
      else if (r.bolehBentang && r.kerajaan && !r.tp) { h += kadBentang(r.bentang, L); }
      else if (!r.bolehBentang) { h += '<section class="card"><p class="note">' + (r.dun ? (L.gab === 'GPS' ? 'Hanya Menteri Negeri boleh membentang Enakmen dan Bajet Negeri.' : 'Hanya EXCO Negeri boleh membentang Enakmen dan Bajet Negeri.') : 'Hanya Menteri Penuh, Timbalan Perdana Menteri atau Perdana Menteri boleh membentang RUU dan Bajet.') + '</p></section>'; }
      if (r.sejarah.length) {
        h += '<section class="card"><h2 class="card__title" style="margin:0 0 4px">📜 Rekod Dewan</h2><ul class="dw-sej">' + r.sejarah.slice().reverse().map(function (x) {
          return '<li>' + esc(BULAN[(x.bulan || 1) - 1] + ' ' + x.tahun) + ': ' + esc(x.tajuk || 'Usul Undi Tidak Percaya') + ' — <span class="' + (x.lulus ? 'dw-lulus' : 'dw-gagal') + '">' + (x.jenis === 'tp' ? (x.lulus ? 'selamat' : 'tumbang') : (x.lulus ? 'lulus' : 'gagal')) + '</span> (' + x.sokong + ')</li>';
        }).join('') + '</ul></section>';
      }
      return h;
    } catch (e) { return ''; }
  }
  function kadBentang(b, L) {
    var h = '<section class="card"><h2 class="card__title" style="margin:0 0 4px">📑 Bentang ' + esc(L.usul) + ' &amp; Bajet</h2>';
    h += '<ul class="dw-list">';
    if (b.bajet) { h += btn('bentang', 'bajet', '💰 ' + b.bajet.tajuk, 'Dibentang sekali setahun (bulan ' + D.CONFIG.BULAN_BAJET + '). Gagal = Tadbir Urus ' + D.CONFIG.GAGAL_BAJET.rating + '%, kestabilan ' + D.CONFIG.GAGAL_BAJET.kestabilan + '%.', true, 'btn--gold'); }
    b.ruu.forEach(function (x) { h += btn('bentang', x.id, x.tajuk, x.kategoriNama + ' · ' + x.huraian, true); });
    h += '</ul>';
    if (!b.ruu.length) { h += '<p class="note">' + esc(b.sebabRUU) + '</p>'; }
    return h + '</section>';
  }
  function kadUndi(s) {
    var u = s.undi, h = '<section class="card"><h2 class="card__title" style="margin:0 0 4px">🗳️ Undian: ' + esc(u.tajuk) + '</h2>';
    h += '<div class="dw-undi"><div>Sokong<b>' + u.sokong + '</b></div><div>Atas pagar<b>' + u.atas + '</b></div><div>Bantah<b>' + u.bantah + '</b></div></div>';
    h += hemiUndi([{ warna: WARNA_U.SOKONG, nama: 'Sokong', n: u.sokong }, { warna: WARNA_U.ATAS, nama: 'Atas pagar', n: u.atas }, { warna: WARNA_U.BANTAH, nama: 'Bantah', n: u.bantah }], s.ambang);   // v13.26
    h += '<p class="note">Perlu <b>' + s.ambang + '</b> sokong · anggaran peluang lulus: <b>' + esc(s.kebarangkalian) + '</b> · lobi berbaki: ' + s.baki + '</p><ul class="dw-list">';
    s.tindakan.forEach(function (t) { h += btn('lobi', t.id, t.nama, t.huraian, t.boleh ? true : t.sebab); });
    h += '</ul><button type="button" class="btn btn--primary btn--block" data-dewan="undi">🗳️ Mula Undian Sekarang</button> <button type="button" class="btn btn--ghost btn--block" data-dewan="tarik">Tarik Balik Usul</button></section>';
    return h;
  }
  function kadTP(s, L) {
    var t = s.tp, h = '<section class="card dw-tp"><h2 class="card__title" style="margin:0 0 4px">⚠️ Undi Tidak Percaya (' + esc(L.ketua) + ') · Hari ' + Math.min(t.hari, s.hariMaks) + '/' + s.hariMaks + '</h2>';
    h += '<div class="dw-undi"><div>Setia<b>' + t.setia + '</b></div><div>Goyah<b>' + t.goyah + '</b></div><div>Pembangkang<b>' + t.tentang + '</b></div></div>';
    h += hemiUndi([{ warna: WARNA_U.SOKONG, nama: 'Setia', n: t.setia }, { warna: WARNA_U.ATAS, nama: 'Goyah', n: t.goyah }, { warna: WARNA_U.BANTAH, nama: 'Pembangkang', n: t.tentang }], s.ambang);   // v13.26
    h += '<p class="note">Perlu <b>' + s.ambang + '</b> undi untuk kekal. Setiap wakil rakyat goyah boleh dipujuk; sebahagian kecil akan menyokong anda pada hari undian. Hubungan gabungan: ' + s.hubungan + '%.</p><ul class="dw-list">';
    s.tindakan.forEach(function (a) { h += btn('tp', a.id, a.nama, a.huraian, a.boleh ? true : a.sebab, a.id === 'bubar' ? 'btn--ghost' : 'btn--primary'); });
    h += '</ul>' + (t.log.length ? '<ul class="dw-sej">' + t.log.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') + '</section>';
    return h;
  }

  /* ---------- Tindakan ---------- */
  function tanya(tajuk, isi, ya) { return modal({ tajuk: tajuk, isi: isi, butang: [{ label: 'Batal', nilai: false }, { label: ya, nilai: true, kelas: 'btn--primary' }] }); }
  async function bentang(id) {
    var r = D.mulaBentang(id);
    if (!r.ok) { toast(r.ralat, 'ralat'); return; }
    toast(r.mesej); segarkan();
  }
  function lobi(id) { var r = D.lobi(id); toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); segarkan(); }
  async function mulaUndi() {
    var ok = await tanya('Mula undian?', '<p>Undian akan dikira sekarang. Pastikan lobi sudah mencukupi.</p>', 'Undi');
    if (!ok) { return; }
    var r = D.undi();
    if (!r.ok) { toast(r.ralat, 'ralat'); return; }
    var amb = D.ringkasan(S.loadPlayer()).ambang;
    await modal({ tajuk: r.lulus ? '✅ Lulus' : '❌ Gagal', isi: hemiUndi([{ warna: WARNA_U.SOKONG, nama: 'Sokong', n: r.sokong }, { warna: WARNA_U.BANTAH, nama: 'Bantah', n: r.bantah }], amb, { anim: true }) +   // v13.26
      '<div class="dw-undi"><div>Sokong<b>' + r.sokong + '</b></div><div>Bantah<b>' + r.bantah + '</b></div><div>Perlu<b>' + amb + '</b></div></div><p>' + esc(r.mesej) + '</p>' });
    segarkan();
  }
  async function tarik() {
    var ok = await tanya('Tarik balik usul?', '<p>Usul ditarik tanpa undian. Satu cubaan sesi ini dikira digunakan.</p>', 'Tarik balik');
    if (!ok) { return; }
    var r = D.tarikBalik(); toast(r.ok ? r.mesej : r.ralat, r.ok ? 'ok' : 'ralat'); segarkan();
  }
  async function tindakTP(id) {
    if (id === 'bubar') { var ok = await tanya('Bubar Parlimen?', '<p>Anda menasihatkan pembubaran Parlimen. Pilihan Raya Mengejut akan diisytiharkan.</p>', 'Bubar'); if (!ok) { return; } }
    var r = D.tindakTP(id);
    if (!r.ok) { toast(r.ralat, 'ralat'); return; }
    if (r.tamat) {
      await modal({ tajuk: r.selamat === false || r.snap ? '🚨 Kerajaan Tumbang' : '✅ Kerajaan Selamat', isi: '<p>' + esc(r.mesej) + '</p>' });
      if (W.NusaPRU_UI && W.NusaPRU_UI.selepasBulan && r.peristiwa) { await W.NusaPRU_UI.selepasBulan(r.peristiwa); }
    } else { toast(r.mesej); }
    segarkan();
  }
  async function soalan() {
    utamakan(S.loadPlayer(), 'soalanSemasa'); pilih(S.loadPlayer());
    var s = D.soalanSemasa(S.loadPlayer());
    if (!s) { return; }
    function ringkas(j) {
      if (j.rawak) { return 'Berjaya ' + Math.round(j.rawak.p * 100) + '%: Stress ' + tanda(j.rawak.jaya.stress) + ', Tadbir Urus ' + tanda(j.rawak.jaya.rating) + '% · Gagal: Stress ' + tanda(j.rawak.gagal.stress) + ', Tadbir Urus ' + tanda(j.rawak.gagal.rating) + '%'; }
      var x = j.kesan, t = []; if (x.stress) { t.push('Stress ' + tanda(x.stress)); } if (x.ip) { t.push('IP ' + tanda(x.ip)); } if (x.rating) { t.push('Tadbir Urus ' + tanda(x.rating) + '%'); } if (x.rep) { t.push('Reputasi ' + tanda(x.rep)); } if (x.kestabilan) { t.push('Kestabilan ' + tanda(x.kestabilan) + '%'); }
      return t.join(' · ');
    }
    var id = await modal({
      tajuk: '🎤 Waktu Pertanyaan Menteri',
      isi: '<p><b>' + esc(s.yb) + '</b>: ' + esc(s.soal) + '</p><ul class="acara__pil">' + s.jawapan.map(function (j) { return '<li><button type="button" class="acara__opsi" data-pilih="' + esc(j.id) + '"><b>' + j.ikon + ' ' + esc(j.nama) + '</b><small>' + esc(j.teks) + '<br>' + esc(ringkas(j)) + '</small></button></li>'; }).join('') + '</ul>',
      butang: []
    });
    if (!id) { toast('Soalan masih menunggu jawapan anda.'); return; }
    var r = D.jawabSoalan(id);
    toast(r.ok ? r.mesej : r.ralat, r.ok && r.rating >= 0 ? 'ok' : 'ralat'); segarkan();
  }

  /* ---------- Selepas bulan berganti ---------- */
  async function selepasBulan(peristiwa) {
    var s = peristiwa || []; utamakan(S.loadPlayer(), s.some(function (e) { return e.jenis === 'dewan_tp'; }) ? 'tpSemasa' : 'soalanSemasa'); pilih(S.loadPlayer());
    if (s.some(function (e) { return e.jenis === 'dewan_tp'; })) { await modal({ tajuk: '⚠️ Usul Undi Tidak Percaya', isi: '<p>' + esc(((s.filter(function (e) { return e.jenis === 'dewan_tp'; })[0] || {}).mesej) || 'Pembangkang mengemukakan usul undi tidak percaya.') + ' Buka tab <b>' + (N && N.aktif(S.loadPlayer()) ? 'DUN' : 'Dewan Rakyat') + '</b>.</p>' }); if (U() && U().gotoTab) { U().gotoTab('dewan'); } return true; }
    if (s.some(function (e) { return e.jenis === 'dewan_soalan'; })) { await soalan(); return true; }
    return false;
  }

  W.document.addEventListener('click', function (ev) {
    var c = ev.target.closest ? ev.target.closest('circle[data-hemi-anda]') : null;              // v13.25: ketik kerusi sendiri
    if (c) { var tt = c.querySelector('title'); toast('⭐ ' + (tt ? tt.textContent : ''), 'ok'); return; }
    var t = ev.target.closest ? ev.target.closest('[data-dewan]') : null;
    if (!t || t.disabled) { return; }
    if (t.getAttribute('data-dewan') === 'hemi-sejarah') { lihat = t.getAttribute('data-id') || null; segarkan(); return; }
    if (t.getAttribute('data-dewan') === 'hemi-langkau') { var hm = t.closest('.dw-hemi'); if (hm) { hm.classList.add('dw-hemi--siap'); } t.remove(); return; }
    var a = t.getAttribute('data-dewan'), id = t.getAttribute('data-id'); pilih(S.loadPlayer());
    if (a === 'bentang') { bentang(id); } else if (a === 'lobi') { lobi(id); } else if (a === 'undi') { mulaUndi(); } else if (a === 'tarik') { tarik(); }
    else if (a === 'tukar') { pilihan = id === 'DUN' ? 'DUN' : 'RAKYAT'; segarkan(); } else if (a === 'tp') { tindakTP(id); } else if (a === 'soalan') { soalan(); }
  });

  function guna(p) { return pilih(p); }
  W.NusaDewan_UI = { guna: guna, panel: panel, selepasBulan: selepasBulan, soalan: soalan };
})(window);
