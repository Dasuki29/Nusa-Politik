/* ==========================================================================
   Nusa Politik — js/keluarga.js   (v14.18, Dinasti Politik, mockup dipersetujui)
   Keluarga dan Dinasti Politik.
     - Berkahwin (umur 21 hingga 60, 2 AP, RM 30,000, Reputasi +2). Pasangan ialah NPC.
     - Anak: peluang 35% setahun (ibu berumur 45 ke bawah), maksimum 5 anak.
     - Bimbing anak (1 AP, sekali sebulan bagi setiap anak, umur 10+): Minat Politik +5.
     - Daftar sayap (umur 18+, Minat 30+): anak naik jawatan sayap sendiri setiap Januari
       (AJK Cawangan, Naib Ketua Cawangan, Ketua Cawangan, AJK Bahagian).
     - Risiko nepotisme: anak naik jawatan ketika anda memegang jawatan Pusat = 30% Reputasi -3.
     - Waris: apabila kerjaya tamat, anak 21+ boleh meneruskan permainan (atau 2 calon dijana jika tiada).
       Warisan separa: parti dan bahagian sama, Reputasi 30 + 25%, dana 25%, jawatan sayap anak sendiri,
       label Anak Tokoh 5 tahun (kekuatan pemilihan cawangan dan bahagian +5; 10% setahun tuduhan nepotisme).
     - Pokok Dinasti: rekod setiap generasi dan Skor Dinasti.
   ANDAIAN: semua angka ialah angka permainan.
   State: p.keluarga = { kaum, pasangan:{nama,j,lahir,tahun}|null, anak:[{id,nama,j,lahir,minat,sayap,sayapTahun,aras,bimbing}], tahunProses }
          p.dinasti  = { nama, generasi:[{gen,nama,j,dari,hingga,jawatan,kerajaan,menang,sebab,umur,skor}], tahunMula, umurMula, anakTokohHingga }
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikKeluarga = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';
  function modul(nama, fail) {
    if (root[nama]) { return root[nama]; }
    try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tidak dimuatkan */ }
    return null;
  }
  function S() { return modul('MyPolitikSave', 'save.js'); }
  function Dt() { return modul('MyPolitikData', 'data.js'); }
  function SY() { return modul('MyPolitikSayap', 'sayap.js'); }
  function J() { return modul('MyPolitikJawatan', 'jawatan.js'); }
  function HY() { return modul('MyPolitikHayat', 'hayat.js'); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function idx(p) { return (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1); }
  function salin(o) { return o === undefined || o === null ? o : JSON.parse(JSON.stringify(o)); }
  var rngLalai = Math.random;
  function rng(o) { return (o && o.rng) || rngLalai; }
  /** Penjana rawak berbenih (calon waris dijana secara deterministik). */
  function benih(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return function () { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }

  var CONFIG = {
    KAHWIN: { umurMin: 21, umurMaks: 60, ap: 2, myr: 30000, reputasi: 2 },
    ANAK: { peluang: 0.35, maks: 5, ibuMaks: 45 },
    BIMBING: { ap: 1, minat: 5, umurMin: 10 },
    DAFTAR: { umur: 18, minat: 30 },
    NAIK: { asas: 0.25, nepotisme: 0.30, pangkatTinggi: 8, reputasi: -3 },
    WARIS: { umur: 21, reputasiAsas: 30, reputasiKadar: 0.25, danaKadar: 0.25, ipAras: 15, tokohTahun: 5, tokohBonus: 5, tokohNepotisme: 0.10 },
    TAHUN_MULA: 2026
  };
  var ARAS = [null, 'sayap_ajk_cawangan_', 'sayap_naib_cawangan_', 'sayap_cawangan_', 'sayap_ajk_bahagian_'];

  function umurPemain(p) { var H = HY(); return H && H.umurSemasa ? H.umurSemasa(p) : 30; }
  function jantinaPemain(p) { var j = String((p && p.demografik && p.demografik.jantina) || 'L'); return /^p/i.test(j) ? 'P' : 'L'; }
  function getK(p) { var k = p && p.keluarga && typeof p.keluarga === 'object' ? salin(p.keluarga) : {}; k.pasangan = k.pasangan || null; k.anak = Array.isArray(k.anak) ? k.anak : []; return k; }
  function getDn(p) { var d = p && p.dinasti && typeof p.dinasti === 'object' ? salin(p.dinasti) : {}; d.generasi = Array.isArray(d.generasi) ? d.generasi : []; return d; }
  function umurAnak(p, a) { return (parseInt(p.tahun, 10) || 0) - a.lahir; }

  /* ---------- Nama keluarga ---------- */
  function kaumKeluarga(p) {
    var n = String(p.nama || '');
    if (/\b(bin|binti|bt|bte)\b/i.test(n)) { return 'melayu'; }
    if (/\ba\/[lp]\b/i.test(n)) { return 'india'; }
    var D = Dt(), w = D && D.KAUM_PARTI ? D.KAUM_PARTI[p.parti] : null, m = null, t = -1;
    if (w) { Object.keys(w).forEach(function (k) { if (w[k] > t) { t = w[k]; m = k; } }); }
    return m || 'melayu';
  }
  function bersih(n) { return String(n || '').replace(/^(Tun|Tan Sri|Puan Sri|Toh Puan|Datuk Seri|Dato' Seri|Datuk Patinggi|Datuk Amar|Datuk|Dato'|Datin Paduka|Datin|Dr\.|Ir\.)\s+/i, '').trim(); }
  function namaDiri(n) { return bersih(n).split(/\s+(bin|binti|bt|bte|a\/l|a\/p)\s+/i)[0]; }
  function namaBapa(p, k) { return jantinaPemain(p) === 'L' ? namaDiri(p.nama) : (k.pasangan ? namaDiri(k.pasangan.nama) : namaDiri(p.nama)); }
  function janaNama(r, j, kaum) { var D = Dt(); try { return D && D.janaNama ? D.janaNama(r, j, null, { etnik: kaum }) : (j === 'L' ? 'Ahmad' : 'Aminah'); } catch (e) { return j === 'L' ? 'Ahmad' : 'Aminah'; } }
  /** Nama anak mengikut adat penamaan keluarga (bin/binti, a/l, nama keluarga Cina). */
  function namaAnak(r, j, p, k) {
    var kaum = k.kaum || kaumKeluarga(p), n = janaNama(r, j, kaum), bapa = namaBapa(p, k);
    if (kaum === 'melayu') { return n.split(/\s+(bin|binti)\s+/)[0] + (j === 'L' ? ' bin ' : ' binti ') + bapa; }
    if (kaum === 'india') { return n.split(/\s+a\/[lp]\s+/)[0] + (j === 'L' ? ' a/l ' : ' a/p ') + bapa.split(/\s+/)[0]; }
    if (kaum === 'cina') { var b = n.split(/\s+/), kel = bapa.split(/\s+/); var ix = b.length > 3 ? 1 : 0; b[ix] = kel[kel.length > 3 ? 1 : 0]; return b.join(' '); }
    return n;
  }
  function namaDinasti(p) {
    var n = namaDiri(p.nama).split(/\s+/), kaum = kaumKeluarga(p);
    return 'Dinasti ' + (kaum === 'cina' ? n[n.length > 3 ? 1 : 0] : n[n.length - 1]);
  }

  /* ---------- Tindakan ---------- */
  function semakKahwin(p) {
    var k = getK(p), u = umurPemain(p), C = CONFIG.KAHWIN, kos = S().kosSebenar ? S().kosSebenar(p, C.myr) : C.myr;
    if (p.tamat) { return { boleh: false, sebab: 'Kerjaya sudah tamat.' }; }
    if (k.pasangan) { return { boleh: false, sebab: 'Anda sudah berkahwin.' }; }
    if (u < C.umurMin || u > C.umurMaks) { return { boleh: false, sebab: 'Umur mesti ' + C.umurMin + ' hingga ' + C.umurMaks + ' tahun.' }; }
    if ((Number(p.ap) || 0) < C.ap) { return { boleh: false, sebab: 'AP tidak mencukupi.' }; }
    if ((Number(p.myr) || 0) < kos) { return { boleh: false, sebab: 'Dana tidak mencukupi.' }; }
    return { boleh: true, kos: kos };
  }
  function kahwin(o) {
    var Sv = S(), p = Sv.loadPlayer(); if (!p) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var s = semakKahwin(p); if (!s.boleh) { return { ok: false, ralat: s.sebab }; }
    var r = rng(o), k = getK(p), jp = jantinaPemain(p), js = jp === 'L' ? 'P' : 'L', u = umurPemain(p);
    k.kaum = k.kaum || kaumKeluarga(p);
    var beza = Math.floor(r() * 5), umurPas = jp === 'L' ? u - beza : u + beza;
    k.pasangan = { nama: janaNama(r, js, k.kaum), j: js, lahir: p.tahun - umurPas, tahun: p.tahun };
    k.tahunProses = p.tahun;
    var h = Sv.applyEffects({ ap: -CONFIG.KAHWIN.ap, myr: -s.kos, reputasi: CONFIG.KAHWIN.reputasi }, { kiraTindakan: true, patch: { keluarga: k }, log: { tindakan: 'kahwin', nama: 'Berkahwin dengan ' + k.pasangan.nama, peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: 'Tahniah! Anda berkahwin dengan ' + k.pasangan.nama + '. Reputasi +' + CONFIG.KAHWIN.reputasi + '.' } : { ok: false, ralat: h.ralat };
  }
  function cariAnak(k, id) { return k.anak.filter(function (a) { return a.id === id; })[0] || null; }
  function bimbing(id) {
    var Sv = S(), p = Sv.loadPlayer(); if (!p || p.tamat) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var k = getK(p), a = cariAnak(k, id); if (!a) { return { ok: false, ralat: 'Anak tidak dijumpai.' }; }
    if (umurAnak(p, a) < CONFIG.BIMBING.umurMin) { return { ok: false, ralat: 'Anak masih terlalu kecil.' }; }
    if (a.bimbing === idx(p)) { return { ok: false, ralat: 'Sudah dibimbing bulan ini.' }; }
    if (a.minat >= 100) { return { ok: false, ralat: 'Minat politik sudah penuh.' }; }
    if ((Number(p.ap) || 0) < CONFIG.BIMBING.ap) { return { ok: false, ralat: 'AP tidak mencukupi.' }; }
    a.bimbing = idx(p); a.minat = clamp(a.minat + CONFIG.BIMBING.minat, 0, 100);
    var h = Sv.applyEffects({ ap: -CONFIG.BIMBING.ap }, { kiraTindakan: true, patch: { keluarga: k }, log: { tindakan: 'bimbing_anak', nama: 'Membimbing ' + a.nama, peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: 'Anda membawa ' + a.nama + ' ke program parti. Minat politik +' + CONFIG.BIMBING.minat + '.' } : { ok: false, ralat: h.ralat };
  }
  function sayapAnak(p, a, umur) { var Y = SY(); return Y && Y.cadangan ? Y.cadangan(a.j, umur, p.parti) : 'utama'; }
  function daftar(id) {
    var Sv = S(), p = Sv.loadPlayer(); if (!p || p.tamat) { return { ok: false, ralat: 'Tiada profil pemain.' }; }
    var k = getK(p), a = cariAnak(k, id); if (!a) { return { ok: false, ralat: 'Anak tidak dijumpai.' }; }
    if (a.sayap) { return { ok: false, ralat: 'Sudah menjadi ahli parti.' }; }
    if (umurAnak(p, a) < CONFIG.DAFTAR.umur) { return { ok: false, ralat: 'Umur minimum ' + CONFIG.DAFTAR.umur + ' tahun.' }; }
    if (a.minat < CONFIG.DAFTAR.minat) { return { ok: false, ralat: 'Minat politik perlu ' + CONFIG.DAFTAR.minat + ' ke atas. Bimbing anak dahulu.' }; }
    a.sayap = sayapAnak(p, a, umurAnak(p, a)); a.sayapTahun = p.tahun; a.aras = 0;
    var nm = labelSayap(a.sayap, p.parti);
    var h = Sv.applyEffects({}, { kiraTindakan: true, patch: { keluarga: k }, log: { tindakan: 'daftar_anak', nama: a.nama + ' menyertai ' + nm, peringkat: 'ahli' } });
    return h.ok ? { ok: true, mesej: a.nama + ' kini ahli ' + nm + '.' } : { ok: false, ralat: h.ralat };
  }
  function labelSayap(s, parti) { var Y = SY(), i = Y && Y.INFO ? Y.INFO[s] : null; return s === 'utama' || !i ? (parti || 'parti') : i.nama + ' ' + (parti || ''); }
  function jawatanAras(a) { var J0 = J(), kod = a && a.aras && a.sayap && a.sayap !== 'utama' ? ARAS[a.aras] + a.sayap : null, d = kod && J0 && J0.cariDef ? J0.cariDef(kod) : null; return d; }

  /* ---------- Bulanan (calendar.js): proses tahunan pada Januari ---------- */
  function pangkatPemain(p) { var J0 = J(); return J0 && J0.pangkatTertinggi ? (Number(J0.pangkatTertinggi(p)) || 0) : 0; }
  function prosesBulan(o) {
    var Sv = S(), p = Sv && Sv.loadPlayer(), ev = [], r = rng(o);
    if (!p || p.tamat || (!p.keluarga && !p.dinasti)) { return { peristiwa: ev }; }
    var k = getK(p), dn = getDn(p), kesan = {}, ubah = false;
    if (p.keluarga && k.tahunProses !== p.tahun && parseInt(p.bulan, 10) === 1) {
      k.tahunProses = p.tahun; ubah = true;
      var ibu = k.pasangan ? (jantinaPemain(p) === 'P' ? umurPemain(p) : p.tahun - k.pasangan.lahir) : 99;
      if (k.pasangan && k.anak.length < CONFIG.ANAK.maks && ibu <= CONFIG.ANAK.ibuMaks && r() < CONFIG.ANAK.peluang) {
        var j = r() < 0.5 ? 'L' : 'P', a = { id: 'a' + p.tahun + k.anak.length, nama: namaAnak(r, j, p, k), j: j, lahir: p.tahun, minat: 10 + Math.floor(r() * 21), sayap: null, aras: 0, bimbing: 0 };
        k.anak.push(a); ev.push({ jenis: 'keluarga', mesej: '👶 Tahniah! Anak ' + (j === 'L' ? 'lelaki' : 'perempuan') + ' anda, ' + a.nama + ', dilahirkan.' });
      }
      var tinggi = pangkatPemain(p) >= CONFIG.NAIK.pangkatTinggi;
      k.anak.forEach(function (a) {
        if (!a.sayap) { return; }
        a.minat = clamp(a.minat + (pangkatPemain(p) >= 5 ? 2 : 1), 0, 100);
        if (a.sayap === 'utama' || a.aras >= ARAS.length - 1 || p.tahun <= a.sayapTahun) { return; }
        var pel = CONFIG.NAIK.asas + a.minat / 200 + ((Number(p.reputasi) || 50) - 50) / 200;
        if (r() < pel) {
          a.aras += 1; var d = jawatanAras(a);
          ev.push({ jenis: 'keluarga', mesej: a.nama + ' dipilih sebagai ' + (d ? d.jawatan : 'pemimpin sayap') + '.' });
          if (tinggi && r() < CONFIG.NAIK.nepotisme) { kesan.reputasi = (kesan.reputasi || 0) + CONFIG.NAIK.reputasi; ev.push({ jenis: 'keluarga', mesej: '⚠️ Tuduhan nepotisme: pengkritik mendakwa ' + a.nama + ' naik kerana pengaruh anda. Reputasi ' + CONFIG.NAIK.reputasi + '.' }); }
        }
      });
    }
    if (p.dinasti && dn.anakTokohHingga && p.tahun <= dn.anakTokohHingga && parseInt(p.bulan, 10) === 1 && dn.tahunNepotisme !== p.tahun) {
      dn.tahunNepotisme = p.tahun; ubah = true;
      if (r() < CONFIG.WARIS.tokohNepotisme) { kesan.reputasi = (kesan.reputasi || 0) + CONFIG.NAIK.reputasi; ev.push({ jenis: 'keluarga', mesej: '⚠️ Tuduhan nepotisme: lawan politik mempersoalkan status anda sebagai anak tokoh. Reputasi ' + CONFIG.NAIK.reputasi + '.' }); }
    }
    if (ubah) { var patch = {}; if (p.keluarga) { patch.keluarga = k; } if (p.dinasti) { patch.dinasti = dn; } Sv.applyEffects(kesan, { kiraTindakan: false, patch: patch }); }
    return { peristiwa: ev };
  }

  /* ---------- Anak Tokoh ---------- */
  function anakTokoh(p) { var d = p && p.dinasti; return !!(d && d.anakTokohHingga && (parseInt(p.tahun, 10) || 0) <= d.anakTokohHingga); }
  /** Bonus kekuatan calon dalam pemilihan parti peringkat cawangan dan bahagian (election.js). */
  function bonusPemilihan(p, peringkat) { return anakTokoh(p) && (peringkat === 'cawangan' || peringkat === 'bahagian') ? CONFIG.WARIS.tokohBonus : 0; }

  /* ---------- Waris ---------- */
  function calonWaris(p) {
    if (!p || !p.tamat) { return []; }
    var k = getK(p), out = k.anak.filter(function (a) { return umurAnak(p, a) >= CONFIG.WARIS.umur; }).map(function (a) {
      return { id: a.id, nama: a.nama, j: a.j, umur: umurAnak(p, a), minat: a.minat, sayap: a.sayap, aras: a.aras || 0, sayapTahun: a.sayapTahun, jawatan: (jawatanAras(a) || {}).jawatan || null, hubungan: 'anak' };
    });
    if (out.length) { return out; }
    var r = benih(p.id + '|' + p.nama + '|' + p.tamat.tahun), kk = { kaum: k.kaum || kaumKeluarga(p), pasangan: k.pasangan }, sendiri = k.anak.length > 0 || !!k.pasangan;
    return [0, 1].map(function (i) {
      var j = i === 0 ? 'L' : 'P', saudara = sendiri ? true : r() < 0.5;
      return { id: 'jana' + i, nama: saudara ? janaNama(r, j, kk.kaum) : namaAnak(r, j, p, kk), j: j, umur: 25 + Math.floor(r() * 11), minat: 40, sayap: null, aras: 0, jawatan: null, hubungan: saudara ? 'anak saudara' : 'anak', jana: true };
    });
  }
  function skorGenerasi(t) {
    var pr = t.pilihanRaya || {}, kj = (pr.jawatanKerajaan || []).length + (pr.kabinetSemasa ? 1 : 0);
    var pm = (pr.jawatanKerajaan || []).indexOf('Perdana Menteri') >= 0 || pr.kabinetSemasa === 'Perdana Menteri';
    return Math.round((Number(t.pangkatTertinggi) || 0) * 50 + (Number(pr.menang) || 0) * 40 + kj * 60 + (t.gelarList || []).length * 25 + (pm ? 300 : 0));
  }
  function rekodGenerasi(p, dn) {
    var t = p.tamat || {}, pr = t.pilihanRaya || {}, G = modul('MyPolitikGelaran', 'gelaran.js'), aw = '';
    try { aw = G && G.awalan ? G.awalan(p) : ''; } catch (e) { aw = ''; }
    return { gen: dn.generasi.length + 1, nama: aw + p.nama, j: jantinaPemain(p), dari: dn.tahunMula || CONFIG.TAHUN_MULA, hingga: t.tahun || p.tahun,
      jawatan: t.jawatanTertinggi || 'Ahli Biasa', kerajaan: (pr.jawatanKerajaan || []).slice(-2).join(', ') || pr.kabinetSemasa || '', menang: Number(pr.menang) || 0,
      sebab: t.tajuk || '', umur: t.umur || null, skor: skorGenerasi(t), parti: p.parti };
  }
  function skorDinasti(dn) { return dn.generasi.reduce(function (s, g) { return s + (Number(g.skor) || 0); }, 0); }

  /** Teruskan permainan sebagai waris (indeks dalam calonWaris). Pulang { ok, profil, mesej }. */
  function teruskan(i) {
    var Sv = S(), p = Sv.loadPlayer(); if (!p || !p.tamat) { return { ok: false, ralat: 'Kerjaya belum tamat.' }; }
    var c = calonWaris(p)[i]; if (!c) { return { ok: false, ralat: 'Waris tidak sah.' }; }
    var D = Dt(), Y = SY(), W0 = CONFIG.WARIS, dn = getDn(p), k = getK(p);
    dn.nama = dn.nama || namaDinasti(p);
    dn.generasi = dn.generasi.concat([rekodGenerasi(p, dn)]);
    var dem = D && D.tentukanDemografi ? D.tentukanDemografi(c.j, c.umur, p.parti) : null;
    if (!dem) { return { ok: false, ralat: 'Data demografi waris tidak sah.' }; }
    var kel = Y && Y.kelayakan ? Y.kelayakan(c.j, c.umur, p.parti) : {}, sy = c.sayap && kel[c.sayap] && kel[c.sayap].boleh ? c.sayap : (Y && Y.cadangan ? Y.cadangan(c.j, c.umur, p.parti) : 'utama');
    var cw = Object.assign({}, p.cawanganInfo || {}, { idSheet: p.id, id: p.id, negeri: p.negeri, bahagianNama: p.bahagian, dunNama: p.dun, nama: p.cawangan });
    if (p.cawanganInfo && p.cawanganInfo.kumpulan) { cw.kumpulan = p.cawanganInfo.kumpulan; }
    var st = p.settings || {};
    var h = Sv.buildPlayerProfile({ nama: c.nama, demografik: dem, cawangan: cw, parti: p.parti, blokPBB: p.blokPBB, komunitiPBS: p.komunitiPBS, dunInfo: p.dunInfo,
      sayap: sy, avatar: dem.kod, currentLang: st.currentLang, difficultyLevel: st.difficultyLevel, careerBackground: p.careerBackground, pendidikan: 'ijazah', tahunAhli: 0 });
    var tahun = parseInt(p.tamat.tahun || p.tahun, 10), bulan = parseInt(p.tamat.bulan || p.bulan, 10) || 1;
    h.tahun = tahun; h.bulan = bulan;
    h.demografik.umur = c.umur - Math.max(0, tahun - CONFIG.TAHUN_MULA);      // umur pendaftaran maya: umurSemasa() = umur sebenar waris
    h.reputasi = clamp(Math.round(W0.reputasiAsas + W0.reputasiKadar * (Number(p.reputasi) || 0)), 0, 100);
    h.myr = 1000 + Math.round(W0.danaKadar * Math.max(0, Number(p.myr) || 0));
    var kekal = c.sayap && c.sayap === h.sayap && c.aras > 0, d = kekal ? jawatanAras(c) : null;
    h.ip = 10 + (d ? c.aras * W0.ipAras : 0);
    h.keahlian = { sejakTahun: c.sayap ? (c.sayapTahun || tahun) : tahun, sejakBulan: 1 };
    if (d) { h.jawatanList = [{ kod: d.kod, jawatan: d.jawatan, peringkat: d.peringkat, kumpulan: d.kumpulan, sayap: d.sayap, pangkat: d.pangkat, tahun: tahun }]; h.jawatan = d.jawatan; }
    dn.tahunMula = tahun; dn.umurMula = c.umur; dn.anakTokohHingga = tahun + W0.tokohTahun - 1; dn.tahunNepotisme = tahun;
    h.dinasti = dn;
    h.keluarga = { kaum: k.kaum || kaumKeluarga(p), pasangan: null, anak: [], tahunProses: tahun,
      adik: k.anak.filter(function (a) { return a.id !== c.id; }).map(function (a) { return a.nama; }) };
    h.dicipta = new Date().toISOString();
    var r = Sv.savePlayer(h);
    if (!r || !r.ok) { return { ok: false, ralat: (r && r.ralat) || 'Gagal menyimpan waris.' }; }
    return { ok: true, profil: h, mesej: c.nama + ' meneruskan perjuangan ' + dn.nama + ' (Generasi ' + (dn.generasi.length + 1) + ').' };
  }

  function keadaan(p) {
    var k = getK(p), dn = getDn(p), kini = idx(p);
    return { kahwin: semakKahwin(p), pasangan: k.pasangan, umurPasangan: k.pasangan ? p.tahun - k.pasangan.lahir : null,
      anak: k.anak.map(function (a) {
        var u = umurAnak(p, a), d = jawatanAras(a);
        return { id: a.id, nama: a.nama, j: a.j, umur: u, minat: a.minat, sayap: a.sayap, label: a.sayap ? labelSayap(a.sayap, p.parti) : null, jawatan: d ? d.jawatan : (a.sayap ? 'Ahli' : null),
          bimbing: !p.tamat && u >= CONFIG.BIMBING.umurMin && a.bimbing !== kini && a.minat < 100 && (Number(p.ap) || 0) >= CONFIG.BIMBING.ap,
          daftar: !p.tamat && !a.sayap && u >= CONFIG.DAFTAR.umur && a.minat >= CONFIG.DAFTAR.minat, bolehDaftarUmur: u >= CONFIG.DAFTAR.umur };
      }), adik: k.adik || [], dinasti: dn, skor: skorDinasti(dn), anakTokoh: anakTokoh(p) };
  }

  return { CONFIG: CONFIG, setRng: function (f) { rngLalai = f || Math.random; }, getK: getK, getDn: getDn, semakKahwin: semakKahwin, kahwin: kahwin, bimbing: bimbing, daftar: daftar,
    prosesBulan: prosesBulan, anakTokoh: anakTokoh, bonusPemilihan: bonusPemilihan, calonWaris: calonWaris, teruskan: teruskan, keadaan: keadaan, skorDinasti: skorDinasti,
    skorGenerasi: skorGenerasi, namaDinasti: namaDinasti, labelSayap: labelSayap, kaumKeluarga: kaumKeluarga };
});
