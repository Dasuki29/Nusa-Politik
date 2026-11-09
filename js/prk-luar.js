/* ==========================================================================
   Nusa Politik — js/prk-luar.js   (v13.47)
   PRK di kawasan lain (maklum balas borang baris 28, mockup dipersetujui). Menggantikan PRK NPC serta-merta
   dalam js/kerusi-semasa.js: PRK kini dibuka selama sebulan dan semua pemain boleh membantu kempen calon
   parti sendiri atau rakan gabungan. Keputusan diumumkan pada peralihan bulan berikutnya.
     - Peluang PRK: CONFIG.PELUANG kerusi-semasa (15% sebulan, ± 2 setahun); tiada PRK semasa PRU.
     - Undi asas: mempertahankan 52%, merampas 45%; + (Reputasi - 50) x 0.15 + sentimen nasional x 0.3 ± 5.
     - Bantuan (sekali setiap PRK): jentera 1 AP + RM 2,000 (+2%), ceramah 2 AP + RM 3,000 (+3%, Stress +5),
       ziarah 2 AP (+2%, Stress +3), digital 1 AP + RM 1,500 (+1.5%), dana RM 5,000 = +1% (maks 4 kali).
       Pengganda jawatan: Ketua Bahagian x1.25, jawatan Pusat x1.5. Sumbangan = jumlah undi tambahan anda.
     - Keputusan: undi = asas + bantuan ± 3; menang jika >= 50%. PRK tidak boleh menukar kerajaan.
       Menang (jika menyumbang): Reputasi +1 + sumbangan / 4 (maks +4), IP +60, Sokongan AJK +2;
       calon rakan gabungan menang: Hubungan Gabungan +3. Kalah (jika menyumbang): Reputasi -1.
   ANDAIAN: semua angka ialah angka permainan. Kerusi DUN hanya bernombor (tiada senarai nama DUN).
   State: p.prkLuar = { aktif: {...} | null, sejarah: [5 terakhir] }.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikPRKLuar = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function KS() { return modul('MyPolitikKerusiSemasa', 'kerusi-semasa.js'); }
  function PRU() { return modul('MyPolitikPRU', 'pru.js'); }
  function PRK() { return modul('MyPolitikPRK', 'prk.js'); }
  function D() { return modul('MyPolitikData', 'data.js'); }
  function ST() { return modul('MyPolitikStres', 'stress.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function r1(n) { return Math.round(n * 10) / 10; }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function salin(o) { return JSON.parse(JSON.stringify(o)); }
  var rngLalai = Math.random;

  var CONFIG = {
    ASAS: { pertahan: 52, rampas: 45, rawak: 5, akhir: 3, min: 35, maks: 65 },
    TINDAKAN: {
      jentera: { id: 'jentera', ikon: '🚌', nama: 'Hantar jentera', ap: 1, myr: 2000, undi: 2, stress: 0 },
      ceramah: { id: 'ceramah', ikon: '🎤', nama: 'Ceramah sokongan', ap: 2, myr: 3000, undi: 3, stress: 5 },
      ziarah:  { id: 'ziarah', ikon: '🏠', nama: 'Ziarah rumah ke rumah', ap: 2, myr: 0, undi: 2, stress: 3 },
      digital: { id: 'digital', ikon: '📱', nama: 'Kempen digital', ap: 1, myr: 1500, undi: 1.5, stress: 0 }
    },
    DANA: { langkah: 5000, maks: 4, undi: 1 },
    PENGGANDA: { bahagian: 1.25, pusat: 1.5 },
    MENANG: { repAsas: 1, repBahagi: 4, repMaks: 4, ip: 60, ajk: 2, hubungan: 3 },
    KALAH: { reputasi: -1 },
    MAKS_SEJARAH: 5
  };

  function dasar() { return { aktif: null, sejarah: [] }; }
  function getPL(p) {
    var x = p && p.prkLuar && typeof p.prkLuar === 'object' ? p.prkLuar : dasar();
    if (!Array.isArray(x.sejarah)) { x.sejarah = []; }
    return x;
  }
  /** Pengganda kesan bantuan ikut jawatan tertinggi pemain. */
  function pengganda(p) {
    var l = Array.isArray(p && p.jawatanList) ? p.jawatanList : [];
    if (l.some(function (j) { return j && j.peringkat === 'pusat'; })) { return CONFIG.PENGGANDA.pusat; }
    if (l.some(function (j) { return j && j.kod === 'ketua_bahagian'; })) { return CONFIG.PENGGANDA.bahagian; }
    return 1;
  }
  /** Nama kerusi PRK: Parlimen bernama (data Bahagian, kecuali Sarawak dan kerusi pemain); DUN bernombor. */
  function namaKerusi(p, dun, r) {
    if (dun) { var n = 1 + Math.floor(r() * 45), ng = p.kerusiNasional && p.kerusiNasional.dun && p.kerusiNasional.dun.negeri; return { nama: 'N.' + (n < 10 ? '0' : '') + n, negeri: ng || p.negeri || '' }; }
    var U = root.MyPolitikUMNOData, b = U && U.bahagian ? U.bahagian : null, sendiri = String(p.bahagian || '').toLowerCase();
    var kod = b ? Object.keys(b).filter(function (k) { return String(b[k].n || '').toLowerCase() !== sendiri; }) : [];
    if (!kod.length) { var m = 1 + Math.floor(r() * 222); return { nama: 'P.' + (m < 10 ? '00' : m < 100 ? '0' : '') + m, negeri: '' }; }
    var k = kod[Math.floor(r() * kod.length)], Dd = D();
    return { nama: k + ' ' + b[k].n, negeri: Dd && Dd.negeriDariKod ? Dd.negeriDariKod(k.replace(/^P\./, '')) : '' };
  }
  function anggaran(a) { return r1(clamp(a.asas + a.bantuan, 0, 100)); }

  /** Buka PRK baharu (dipanggil oleh kerusi-semasa.prosesBulan selepas semakan peluang). */
  function buka(p, b, dun, dari, r) {
    var K = KS(), pertahan = dari === 'PARTI' || dari === 'RAKAN';
    var calon = pertahan ? dari : (dun || r() < 0.6 || !b.RAKAN ? 'PARTI' : 'RAKAN');
    var lawan = pertahan ? (r() < 0.5 ? 'PH' : 'PN') : dari;
    var Pk = PRK(), sent = Pk && Pk.sentimenNasional ? Pk.sentimenNasional(p) : 0;
    var asas = (pertahan ? CONFIG.ASAS.pertahan : CONFIG.ASAS.rampas) + ((Number(p.reputasi) || 50) - 50) * 0.15 + sent * 0.3 + (r() * 2 - 1) * CONFIG.ASAS.rawak;
    var nk = namaKerusi(p, dun, r);
    var a = { id: idx(p) + '-' + nk.nama, idx: idx(p), tahun: p.tahun, bulan: p.bulan, dun: dun, kerusi: nk.nama, negeri: nk.negeri, dari: dari, calon: calon, lawan: lawan,
      pertahan: pertahan, asas: r1(clamp(asas, CONFIG.ASAS.min, CONFIG.ASAS.maks)), bantuan: 0, sumbangan: 0, tindakan: {}, dana: 0 };
    var pl = getPL(p); pl.aktif = a;
    S().applyEffects({}, { kiraTindakan: false, patch: { prkLuar: pl }, log: { tindakan: 'prk_luar_buka', nama: 'PRK ' + (dun ? 'DUN ' : 'Parlimen ') + a.kerusi + ' diadakan', peringkat: 'bulan' } });
    var lbl = K && K.label ? K.label : function (q, x) { return x; };
    return { jenis: 'prk_luar', mesej: 'PRK ' + (dun ? 'DUN ' : 'Parlimen ') + a.kerusi + (a.negeri ? ' (' + a.negeri + ')' : '') + ' diadakan: calon ' + (calon === 'PARTI' ? 'parti anda' : 'rakan gabungan') +
      (pertahan ? ' mempertahankan kerusi' : ' cuba merampas kerusi daripada ' + lbl(p, dari)) + '. Bantu kempen di tab Pemilihan sebelum hujung bulan.' };
  }

  /** Selesaikan PRK aktif (bulan berikutnya). Pulang senarai peristiwa. */
  function selesai(o) {
    var Sv = S(), p = Sv.loadPlayer(), pl = getPL(p), a = pl.aktif, r = (o && o.rng) || rngLalai, K = KS(), ev = [];
    if (!a) { return ev; }
    var undi = r1(clamp(anggaran(a) + (r() * 2 - 1) * CONFIG.ASAS.akhir, 0, 100)), menang = undi >= 50;
    var ke = menang ? a.calon : a.lawan, dari = a.dari, tukar = ke !== dari;
    if (tukar && K && K.blok) {                                                  // PRK tidak menukar kerajaan
      var b = K.blok(p, a.dun);
      if (b) {
        var kami = function (x) { return x === 'PARTI' || x === 'RAKAN' ? 1 : 0; }, kj0 = (b.PARTI + b.RAKAN) >= b.ambang, d1 = kami(ke) - kami(dari);
        if (((b.PARTI + b.RAKAN + d1) >= b.ambang) !== kj0) { menang = a.pertahan; ke = dari; tukar = false; undi = menang ? Math.max(undi, 50) : Math.min(undi, 49.9); }
      }
    }
    if (tukar && K && K.geser) { K.geser({ dun: a.dun, dari: dari, ke: ke, kerusi: a.kerusi, sebab: 'prk_luar' }); }
    p = Sv.loadPlayer(); pl = getPL(p);
    var kes = {}, rep = 0, hub = 0, patch = {};
    if (a.sumbangan > 0) {
      if (menang) {
        rep = Math.min(CONFIG.MENANG.repMaks, CONFIG.MENANG.repAsas + Math.floor(a.sumbangan / CONFIG.MENANG.repBahagi));
        kes = { reputasi: rep, ip: CONFIG.MENANG.ip, kesetiaan: { ajk: CONFIG.MENANG.ajk } };
        if (a.calon === 'RAKAN') {
          var Pr = PRU(); if (Pr && Pr.getPRU) { var pr = salin(Pr.getPRU(p)); hub = CONFIG.MENANG.hubungan; pr.hubunganGabungan = clamp((Number(pr.hubunganGabungan) || 50) + hub, 0, 100); patch.pru = pr; }
        }
      } else { rep = CONFIG.KALAH.reputasi; kes = { reputasi: rep }; }
    }
    var rek = { tahun: a.tahun, bulan: a.bulan, dun: a.dun, kerusi: a.kerusi, negeri: a.negeri, calon: a.calon, pertahan: a.pertahan, menang: menang, undi: undi, sumbangan: r1(a.sumbangan), reputasi: rep, hubungan: hub };
    pl.aktif = null; pl.sejarah = pl.sejarah.concat([rek]).slice(-CONFIG.MAKS_SEJARAH); patch.prkLuar = pl;
    var h = Sv.applyEffects(kes, { kiraTindakan: false, patch: patch, log: { tindakan: 'prk_luar_keputusan', nama: 'PRK ' + a.kerusi + ': ' + (menang ? 'menang' : 'kalah'), peringkat: 'bulan' } });
    var lbl = K && K.label ? K.label : function (q, x) { return x; }, siapa = a.calon === 'PARTI' ? 'Calon parti anda' : 'Calon rakan gabungan';
    var m = 'PRK ' + (a.dun ? 'DUN ' : 'Parlimen ') + a.kerusi + ': ' + siapa + (menang ? ' MENANG' : ' KALAH') + ' dengan ' + undi + '% undi' +
      (menang ? (a.pertahan ? ' (kerusi dipertahankan).' : ' (kerusi dirampas daripada ' + lbl(p, dari) + ').') : (a.pertahan ? ' (kerusi jatuh kepada ' + lbl(p, ke) + ').' : '.'));
    if (a.sumbangan > 0) { m += ' Sumbangan anda ' + r1(a.sumbangan) + ' mata: ' + (h && h.ok ? Sv.ringkasPerubahan(h.perubahan) : '') + (hub ? ', Hubungan Gabungan +' + hub : '') + '.'; }
    ev.push({ jenis: 'prk_luar', mesej: m });
    return ev;
  }

  /** Dipanggil oleh kerusi-semasa.prosesBulan. Pulang { peristiwa, selesai } . */
  function prosesBulan(o) {
    var p = S().loadPlayer(), pl = getPL(p), ev = [];
    if (pl.aktif && idx(p) > pl.aktif.idx) { ev = ev.concat(selesai(o)); return { peristiwa: ev, selesai: true }; }
    return { peristiwa: ev, selesai: false, aktif: !!pl.aktif };
  }

  function statusTindakan(p, a, t) {
    if (!a) { return 'Tiada PRK aktif.'; }
    if (a.tindakan[t.id]) { return 'Sudah dibuat.'; }
    if ((Number(p.ap) || 0) < t.ap) { return 'AP tidak mencukupi (perlu ' + t.ap + ').'; }
    var Sv = S(); if (t.myr && Sv.cukupDana && !Sv.cukupDana(p, t.myr)) { return Sv.ralatDana ? Sv.ralatDana(p, t.myr) : 'Dana tidak mencukupi.'; }
    return '';
  }
  function keadaan(p) {
    var pl = getPL(p), a = pl.aktif, g = pengganda(p), Sv = S();
    return { aktif: a, anggaran: a ? anggaran(a) : null, pengganda: g, sejarah: pl.sejarah.slice().reverse(),
      tindakan: Object.keys(CONFIG.TINDAKAN).map(function (k) { var t = CONFIG.TINDAKAN[k], s = statusTindakan(p, a, t); return { id: t.id, ikon: t.ikon, nama: t.nama, ap: t.ap, myr: t.myr ? (Sv.kosSebenar ? Sv.kosSebenar(p, t.myr) : t.myr) : 0, undi: r1(t.undi * g), stress: t.stress, boleh: !s, sebab: s, dibuat: !!(a && a.tindakan[t.id]) }; }),
      dana: a ? { langkah: Sv.kosSebenar ? Sv.kosSebenar(p, CONFIG.DANA.langkah) : CONFIG.DANA.langkah, kali: a.dana, maks: CONFIG.DANA.maks, undi: r1(CONFIG.DANA.undi * g),
        boleh: a.dana < CONFIG.DANA.maks && (!Sv.cukupDana || Sv.cukupDana(p, CONFIG.DANA.langkah)), sebab: a.dana >= CONFIG.DANA.maks ? 'Had sumbangan dana dicapai.' : (Sv.cukupDana && !Sv.cukupDana(p, CONFIG.DANA.langkah) ? (Sv.ralatDana ? Sv.ralatDana(p, CONFIG.DANA.langkah) : 'Dana tidak mencukupi.') : '') } : null };
  }
  function simpanAktif(p, a, kesan, log) {
    var pl = getPL(p); pl.aktif = a;
    return S().applyEffects(kesan, { patch: { prkLuar: pl }, log: log });
  }
  /** Bantu kempen: id = jentera | ceramah | ziarah | digital. */
  function bantu(id) {
    var Sv = S(), p = Sv.loadPlayer(), pl = getPL(p), a = pl.aktif ? salin(pl.aktif) : null, t = CONFIG.TINDAKAN[id];
    if (!t) { return { ok: false, ralat: 'Tindakan tidak sah.' }; }
    var s = statusTindakan(p, a, t); if (s) { return { ok: false, ralat: s }; }
    var g = r1(t.undi * pengganda(p)); a.tindakan[id] = 1; a.bantuan = r1(a.bantuan + g); a.sumbangan = r1(a.sumbangan + g);
    var kesan = { ap: -t.ap }; if (t.myr) { kesan.myr = -t.myr; }
    var r = simpanAktif(p, a, kesan, { tindakan: 'prk_luar_' + id, nama: t.nama + ': PRK ' + a.kerusi, peringkat: 'ahli' });
    if (!r.ok) { return { ok: false, ralat: r.ralat }; }
    if (t.stress) { var St = ST(); if (St && St.laras) { St.laras({ stress: t.stress }); } }
    return { ok: true, mesej: t.nama + ' untuk PRK ' + a.kerusi + ': undi calon +' + g + '%. Anggaran undi kini ' + anggaran(a) + '%.' };
  }
  /** Sumbang dana kempen (RM 5,000 setiap kali, maks 4 kali). */
  function sumbangDana() {
    var Sv = S(), p = Sv.loadPlayer(), pl = getPL(p), a = pl.aktif ? salin(pl.aktif) : null;
    if (!a) { return { ok: false, ralat: 'Tiada PRK aktif.' }; }
    if (a.dana >= CONFIG.DANA.maks) { return { ok: false, ralat: 'Had sumbangan dana dicapai.' }; }
    if (Sv.cukupDana && !Sv.cukupDana(p, CONFIG.DANA.langkah)) { return { ok: false, ralat: Sv.ralatDana ? Sv.ralatDana(p, CONFIG.DANA.langkah) : 'Dana tidak mencukupi.' }; }
    var g = r1(CONFIG.DANA.undi * pengganda(p)); a.dana += 1; a.bantuan = r1(a.bantuan + g); a.sumbangan = r1(a.sumbangan + g);
    var r = simpanAktif(p, a, { myr: -CONFIG.DANA.langkah }, { tindakan: 'prk_luar_dana', nama: 'Sumbang dana kempen: PRK ' + a.kerusi, peringkat: 'ahli' });
    if (!r.ok) { return { ok: false, ralat: r.ralat }; }
    return { ok: true, mesej: 'Dana kempen disumbang untuk PRK ' + a.kerusi + ': undi calon +' + g + '%. Anggaran undi kini ' + anggaran(a) + '%.' };
  }

  return { CONFIG: CONFIG, setRng: function (f) { rngLalai = f || Math.random; }, getPL: getPL, pengganda: pengganda, buka: buka, selesai: selesai, prosesBulan: prosesBulan,
    keadaan: keadaan, bantu: bantu, sumbangDana: sumbangDana, anggaran: anggaran };
});
