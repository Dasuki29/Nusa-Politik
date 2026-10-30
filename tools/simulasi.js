#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/simulasi.js   (v8.0)
   Ujian main automatik: bot memainkan banyak kerjaya penuh (pemilihan, mesyuarat, PRU/PRK, kabinet,
   Badan Perhubungan Negeri, Dewan, acara rawak) secara rawak tetapi munasabah, kemudian melaporkan:
     - RALAT UNIK          : pengecualian JavaScript yang dilontar oleh modul permainan
     - LANGGARAN INVARIAN  : keadaan yang tidak sepatutnya berlaku (nombor tidak sah, butang "boleh" yang gagal,
                             pemain tersekat, cabaran jawatan yang tidak pernah selesai, dsb.)
     - LIPUTAN             : bilangan kali setiap ciri utama berjaya digunakan
   Fungsi paparan (htmlKad, ringkasan, kad pemilihan) turut dipanggil seperti dashboard.

   Guna:  node tools/simulasi.js [bilanganPermainan=12] [bulanMaks=480] [benihMula=1]
          V=1 node tools/simulasi.js 3      (cetak surih penuh bagi setiap ralat)
   Kod keluar 1 jika ada ralat atau langgaran invarian.
   ========================================================================== */
'use strict';
const P = require('./persekitaran');
const g = P.muat();
const N_GAMES = parseInt(process.argv[2] || '12', 10);
const MAX_MONTHS = parseInt(process.argv[3] || '480', 10);
const SEED0 = parseInt(process.argv[4] || '1', 10);
const VERBOSE = !!process.env.V;

let R = Math.random;
function pick(a) { return a && a.length ? a[Math.floor(R() * a.length)] : null; }
const S = g.MyPolitikSave, D = g.MyPolitikData, O = g.MyPolitikOrdinaryMember, I = g.MyPolitikIncumbent, J = g.MyPolitikJawatan,
  E = g.MyPolitikElection, M = g.MyPolitikMeeting, ET = g.MyPolitikEtika, WK = g.MyPolitikWatak, HY = g.MyPolitikHayat, ST = g.MyPolitikStres,
  K = g.MyPolitikCalendar, EV = g.MyPolitikEvents, SYP = g.MyPolitikSayap, BLK = g.MyPolitikBlok, MIS = g.MyPolitikMisi, PRU = g.MyPolitikPRU,
  KB = g.MyPolitikKabinet, PRK = g.MyPolitikPRK, NG = g.MyPolitikNegeri, DW = g.MyPolitikDewan, DUN = g.MyPolitikDUN, RV = g.MyPolitikRival,
  OG = g.MyPolitikOrganisasi, SL = g.MyPolitikSlot;

const liputan = {};
function bungkus(mod, nama, label) {
  const asal = mod[nama]; if (typeof asal !== 'function') { return; }
  mod[nama] = function () { const r = asal.apply(this, arguments); if (r && r.ok !== false) { liputan[label || nama] = (liputan[label || nama] || 0) + 1; } return r; };
}
[[PRU, 'mulaKempen', 'PRU kempen'], [PRU, 'selesaikan', 'PRU keputusan'], [PRU, 'rundingKerajaan', 'PRU nasional'], [PRK, 'byElectionCampaign', 'PRK kempen'], [PRK, 'selesaikan', 'PRK keputusan'],
 [KB, 'lobiPortfolio', 'Kabinet lobi'], [KB, 'jawabAcara', 'Kabinet acara'], [KB, 'salurCDF', 'Kabinet CDF'], [DW, 'jawabSoalan', 'Dewan soalan'], [DW, 'undi', 'Dewan undi'], [DW, 'tindakTP', 'Dewan TP'],
 [DUN, 'jawabSoalan', 'DUN soalan'], [DUN, 'undi', 'DUN undi'], [NG, 'lobi', 'Negeri lobi'], [NG, 'tindakan', 'Negeri tindakan'], [NG, 'lantikAjk', 'Negeri lantik AJK'], [NG, 'pilihPengerusi', 'Negeri pilih pengerusi'],
 [MIS, 'jalankanMisi', 'Misi'], [SYP, 'jalankanTindakanSayap', 'Tindakan sayap'], [BLK, 'runding', 'Blok runding'], [M, 'tutupMesyuarat', 'Mesyuarat tutup'], [E, 'jalankanPemilihan', 'Pemilihan undi'],
 [EV, 'pilih', 'Acara dijawab'], [ET, 'rayuPemecatan', 'Rayuan pecat']].forEach(x => bungkus(x[0], x[1], x[2]));
const errors = new Map();   // kunci -> {count, contoh}
const viol = new Map();
let ctx = '';
function rekod(map, key, info) { const e = map.get(key); if (e) { e.count++; } else { map.set(key, { count: 1, info, ctx }); } }
function cuba(label, fn) {
  try { return fn(); }
  catch (e) {
    const frame = (e.stack || '').split('\n').slice(1, 4).map(s => s.trim().replace(/^at /, '').replace(/\(.*[\\/]js[\\/]/, '(')).join(' < ');
    rekod(errors, label + ': ' + e.message + ' @ ' + frame, e.stack);
    return null;
  }
}
function langgar(key, info) { rekod(viol, key, info); }

function semakProfil(p, tag) {
  if (!p) { return; }
  (function imbas(o, jalan, d) {
    if (d > 12) { return; }
    if (typeof o === 'number' && !isFinite(o)) { langgar('Nombor tidak sah di ' + jalan.replace(/\.\d+/g, '[]'), o); return; }
    if (o && typeof o === 'object') { for (const k of Object.keys(o)) { imbas(o[k], jalan + '.' + k, d + 1); } }
  })(p, 'p', 0);
  if (p.ip < 0) { langgar('IP negatif', p.ip); }
  if (p.myr < 0) { langgar('MYR negatif', p.myr); }
  if (p.ap < 0) { langgar('AP negatif', p.ap); }
  if (p.ap > K.apTetapan(p).maks + 10) { langgar('AP melebihi had jauh (' + tag + ')', p.ap); }
  if (!(p.bulan >= 1 && p.bulan <= 12)) { langgar('Bulan luar julat', p.bulan); }
  if (p.stress < 0 || p.stress > 100) { langgar('Stress luar julat', p.stress); }
  if (p.kesihatan < 0 || p.kesihatan > 100) { langgar('Kesihatan luar julat', p.kesihatan); }
  for (const k of Object.keys(p.kesetiaan || {})) { const v = p.kesetiaan[k]; if (v < 0 || v > 100) { langgar('Kesetiaan luar julat ' + k, v); } }
  const lv = {};
  (p.jawatanList || []).forEach(j => { const key = j.peringkat; if (lv[key]) { langgar('Dua jawatan pada peringkat sama: ' + key, (p.jawatanList || []).map(x => x.jawatan).join(', ')); } lv[key] = 1; });
  if (p.etika && (p.etika.status === 'digantung' || p.etika.status === 'dipecat') && (p.jawatanList || []).length && tag === 'selepas-render') { langgar('Masih pegang jawatan semasa ' + p.etika.status, (p.jawatanList || []).map(x => x.jawatan).join(', ')); }
}

/* Panggil semua fungsi yang dipanggil oleh render dashboard (app.js render + kad) supaya ralat paparan juga dikesan. */
function renderLogik() {
  cuba('render.selaraskan', () => { const pj = S.loadPlayer(); const tj = pj && !pj.tamat ? J.selaraskan(pj) : null; if (tj) { S.applyEffects({}, { kiraTindakan: false, patch: tj }); } });
  cuba('render.kuatkuasaGantung', () => ET.kuatkuasaGantung());
  cuba('render.kemaskiniJawatanTertinggi', () => HY.kemaskiniJawatanTertinggi());
  const p = S.loadPlayer();
  if (!p || p.tamat) { return p; }
  const calls = {
    'M.getStatusPerwakilan': () => M.getStatusPerwakilan(p), 'ET.ringkasan': () => ET.ringkasan(p), 'J.ringkas': () => J.ringkas(p),
    'SYP.info': () => SYP.info(p), 'HY.ringkasan': () => HY.ringkasan(p), 'ST.ringkasan': () => ST.ringkasan(p), 'K.getTakwim': () => K.getTakwim(p),
    'E.tahunPemilihanSeterusnya': () => E.tahunPemilihanSeterusnya(p.tahun), 'SYP.notisTransisi': () => SYP.notisTransisi(p), 'MIS.amaranUndi': () => MIS.amaranUndi(p),
    'MIS.getMisi': () => MIS.getMisi(p), 'SYP.ringkasWarisan': () => SYP.ringkasWarisan(p), 'SYP.senaraiTindakanSayap': () => SYP.senaraiTindakanSayap(p),
    'BLK.ringkasan': () => BLK.ringkasan(p), 'O/I.senaraiTindakan': () => (I.adalahPemegangJawatan(p) ? I : O).senaraiTindakan(p),
    'O.getKelayakanBertanding': () => O.getKelayakanBertanding(p), 'I.getCabaranAktif': () => I.getCabaranAktif(), 'E.getStatusModul': () => E.getStatusModul(p),
    'RV.htmlKad': () => RV.htmlKad(p), 'NG.htmlKad': () => NG.htmlKad(p), 'NG.sayap.htmlKad': () => NG.sayap.htmlKad(p), 'J.perwakilanSah': () => [J.perwakilanSah(p, 'cawangan'), J.perwakilanSah(p, 'bahagian')],
    'J.sayapPemain': () => J.sayapPemain(p), 'WK.tentukan': () => WK.tentukan(p), 'M.getKeadaanMesyuarat': () => M.getKeadaanMesyuarat(p),
    'PRU.ringkasan': () => PRU.ringkasan(p), 'PRU.janjiStatus': () => PRU.janjiStatus(p), 'PRU.nasionalTertunggak': () => PRU.nasionalTertunggak(p), 'PRU.semuaStatus': () => PRU.semuaStatus(p),
    'KB.ringkasan': () => KB.ringkasan(p), 'KB.getKabinet': () => KB.getKabinet(p), 'PRK.ringkasan': () => PRK.ringkasan(p),
    'DW.aktif': () => DW.aktif(p), 'DUN.aktif': () => DUN.aktif(p), 'DW.ringkasan': () => DW.aktif(p) && DW.ringkasan(p), 'DUN.ringkasan': () => DUN.aktif(p) && DUN.ringkasan(p),
    'DW.senaraiBentang': () => DW.aktif(p) && DW.senaraiBentang(p), 'DUN.senaraiBentang': () => DUN.aktif(p) && DUN.senaraiBentang(p),
    'OG.getStruktur': () => OG.getStruktur(p), 'NG.htmlStruktur': () => NG.htmlStruktur(p), 'NG.htmlPusat': () => NG.htmlPusat(p),
    'NG.sayap.htmlStruktur': () => NG.sayap.aktif(p) && NG.sayap.htmlStruktur(p), 'NG.sayap.htmlPusat': () => NG.sayap.aktif(p) && NG.sayap.htmlPusat(p),
    'K.pratonton': () => K.pratonton(), 'SL.senarai': () => SL.senarai(), 'EV.getTertunggak': () => EV.getTertunggak()
  };
  for (const k of Object.keys(calls)) { cuba('render.' + k, calls[k]); }
  if (PRU.getPRU(p).aktif && PRU.getPRU(p).aktif.fasa === 'kempen') { cuba('render.PRU.keadaanKempen', () => PRU.keadaanKempen(p)); }
  if (PRK.getPRK(p).aktif && PRK.getPRK(p).aktif.fasa === 'kempen') { cuba('render.PRK.keadaanKempen', () => PRK.keadaanKempen(p)); }
  const p2 = S.loadPlayer(); semakProfil(p2, 'selepas-render');
  return p2;
}

function jawabAcaraRawak() {
  for (let i = 0; i < 4; i++) {
    const a = cuba('EV.getTertunggak', () => EV.getTertunggak());
    if (!a) { return; }
    const ok = (a.pilihan || []).filter(c => c.boleh);
    if (!ok.length) { langgar('Acara tanpa pilihan yang boleh dipilih: ' + a.id, a.pilihan && a.pilihan.map(c => c.sebab)); cuba('EV.buangTertunggak', () => EV.buangTertunggak()); return; }
    const r = cuba('EV.pilih', () => EV.pilih(pick(ok).id));
    if (r && !r.ok) { langgar('EV.pilih gagal: ' + r.ralat, a.id); return; }
  }
}

function urusPRU() {
  for (let guard = 0; guard < 80; guard++) {
    const p = S.loadPlayer(); if (!p || p.tamat) { return; }
    const a = PRU.getPRU(p).aktif;
    if (!a) {
      const n = cuba('PRU.nasionalTertunggak', () => PRU.nasionalTertunggak(p));
      if (n) { const pil = n.status === 'PEMBANGKANG' ? 'PEMBANGKANG' : (n.status === 'MAJORITI' && n.bolehPM ? 'PM' : pick(n.bolehPM ? ['PM', 'TPM', 'KABINET', 'PEMBANGKANG'] : ['KABINET', 'PEMBANGKANG'])); const r = cuba('PRU.rundingKerajaan', () => PRU.rundingKerajaan(pil)); if (r && !r.ok) { langgar('rundingKerajaan gagal: ' + r.ralat, pil); return; } continue; }
      return;
    }
    if (a.fasa === 'isytihar' || a.fasa === 'calon') {
      const kl = PRU.kelayakan(p);
      const opsi = ['DUN', 'PARLIMEN'].filter(z => kl[z].boleh && !a.ditolak[z]);
      if (opsi.length === 2) { opsi.push('KEDUA'); }
      const j = R() < 0.15 || !opsi.length ? 'NONE' : pick(opsi);
      if (j === 'NONE') { const r = cuba('PRU.tidakBertanding', () => PRU.tidakBertanding()); if (r && !r.ok) { langgar('tidakBertanding gagal: ' + r.ralat, a.fasa); return; } continue; }
      const r = cuba('PRU.pilihKerusi', () => PRU.pilihKerusi(j));
      if (!r) { return; }
      if (!r.ok) { langgar('pilihKerusi gagal: ' + r.ralat, j); const t = cuba('PRU.tidakBertanding', () => PRU.tidakBertanding()); if (!t || !t.ok) { return; } continue; }
      if (!r.diluluskan) {
        const p2 = S.loadPlayer(), k2 = PRU.kelayakan(p2), a2 = PRU.getPRU(p2).aktif;
        if (a2 && !['DUN', 'PARLIMEN'].some(z => !a2.ditolak[z] && k2[z].boleh)) { cuba('PRU.tidakBertanding', () => PRU.tidakBertanding()); }
      }
    } else if (a.fasa === 'runding') {
      const opsi = ['abai']; if (p.ip >= PRU.KOS_RUNDING.berdepan.ip) { opsi.push('berdepan'); } if (a.candidateType === 'PARLIMEN' && !a.kerusi2 && p.ip >= PRU.KOS_RUNDING.ganti.ip) { opsi.push('ganti'); }
      const r = cuba('PRU.runding', () => PRU.runding(pick(opsi))); if (!r || !r.ok) { if (r) { langgar('runding gagal: ' + r.ralat, a.fasa); } return; }
    } else if (a.fasa === 'manifesto') {
      const pil = cuba('PRU.peruntukanPilihan', () => PRU.peruntukanPilihan(p, a));
      if (!pil || !pil.pilihan.length) { const t = cuba('PRU.tidakBertanding', () => PRU.tidakBertanding()); if (!t || !t.ok) { langgar('Tersekat manifesto tanpa dana dan tidak boleh tarik diri', t && t.ralat); return; } continue; }
      const ids = PRU.JANJI.map(x => x.id).sort(() => R() - 0.5).slice(0, 3);
      const r = cuba('PRU.mulaKempen', () => PRU.mulaKempen(ids, pick(pil.pilihan)));
      if (!r || !r.ok) { if (r) { langgar('mulaKempen gagal: ' + r.ralat, ids); } const t = cuba('PRU.tidakBertanding', () => PRU.tidakBertanding()); if (!t || !t.ok) { return; } }
    } else if (a.fasa === 'kempen') {
      const ck = cuba('PRU.keadaanKempen', () => PRU.keadaanKempen(p)); if (!ck) { return; }
      if (ck.kejutan) { const ok = ck.kejutan.pilihan.filter(c => c.boleh); if (!ok.length) { langgar('Kejutan tanpa pilihan boleh', ck.kejutan.id); return; } const r = cuba('PRU.jawabKejutan', () => PRU.jawabKejutan(pick(ok).id)); if (!r || !r.ok) { if (r) { langgar('jawabKejutan gagal: ' + r.ralat, ''); } return; } continue; }
      if (ck.hariBaki <= 0) { const r = cuba('PRU.selesaikan', () => PRU.selesaikan()); if (!r || !r.ok) { if (r) { langgar('PRU.selesaikan gagal: ' + r.ralat, ''); } return; } continue; }
      const t = (ck.hariFinal ? ck.final : []).concat(ck.biasa).filter(x => x.boleh);
      if (!t.length) { langgar('Kempen PRU tiada tindakan boleh dan hari belum habis', ck.hariBaki); return; }
      const r = cuba('PRU.tindakanKempen', () => PRU.tindakanKempen(pick(t).id)); if (!r || !r.ok) { if (r) { langgar('tindakanKempen gagal: ' + r.ralat, ''); } return; }
    } else if (a.fasa === 'keputusan') {
      const r = cuba('PRU.tutupKeputusan', () => PRU.tutupKeputusan()); if (!r || (r.ok === false)) { if (r) { langgar('tutupKeputusan gagal: ' + r.ralat, ''); } return; }
    } else { langgar('Fasa PRU tidak dikenali: ' + a.fasa, ''); return; }
  }
  langgar('urusPRU tidak selesai dalam 80 langkah', (PRU.getPRU(S.loadPlayer()).aktif || {}).fasa);
}

function urusPRK() {
  for (let guard = 0; guard < 40; guard++) {
    const p = S.loadPlayer(); if (!p || p.tamat) { return; }
    const r0 = PRK.ringkasan(p), a = r0.aktif;
    if (!a) { return; }
    if (a.fasa === 'isytihar') {
      const kl = r0.kelayakan;
      if (kl.boleh && p.myr >= kl.minPeruntukan && R() < 0.8) { const m = cuba('PRK.mohonCalon', () => PRK.mohonCalon()); if (!m) { return; } if (!m.ok || !m.diluluskan) { if (PRK.getPRK(S.loadPlayer()).aktif) { const t = cuba('PRK.tidakBertanding', () => PRK.tidakBertanding()); if (!t || !t.ok) { langgar('PRK tersekat selepas permohonan ditolak', m.ralat || m.mesej); return; } } } }
      else { const t = cuba('PRK.tidakBertanding', () => PRK.tidakBertanding()); if (!t || !t.ok) { if (t) { langgar('PRK.tidakBertanding gagal: ' + t.ralat, ''); } return; } }
    } else if (a.fasa === 'calon') {
      const pil = r0.peruntukan; const d = pil && pil.pilihan && pil.pilihan.length ? pick(pil.pilihan) : (pil ? pil.min : 0);
      const k = cuba('PRK.byElectionCampaign', () => PRK.byElectionCampaign(d));
      if (!k || !k.ok) { if (k) { langgar('byElectionCampaign gagal: ' + k.ralat, d); } const t = cuba('PRK.tidakBertanding', () => PRK.tidakBertanding()); if (!t || !t.ok) { langgar('PRK tersekat di fasa calon', t && t.ralat); return; } }
    } else if (a.fasa === 'kempen') {
      const ck = cuba('PRK.keadaanKempen', () => PRK.keadaanKempen(p)); if (!ck) { return; }
      if (ck.hariBaki <= 0) { const r = cuba('PRK.selesaikan', () => PRK.selesaikan()); if (!r || !r.ok) { if (r) { langgar('PRK.selesaikan gagal: ' + r.ralat, ''); } return; } continue; }
      const t = ck.tindakan.filter(x => x.boleh); if (!t.length) { langgar('Kempen PRK tiada tindakan boleh', ck.hariBaki); return; }
      const r = cuba('PRK.tindakanKilat', () => PRK.tindakanKilat(pick(t).id)); if (!r || !r.ok) { if (r) { langgar('tindakanKilat gagal: ' + r.ralat, ''); } return; }
    } else if (a.fasa === 'keputusan') { const r = cuba('PRK.tutupKeputusan', () => PRK.tutupKeputusan()); if (!r) { return; } }
    else { langgar('Fasa PRK tidak dikenali: ' + a.fasa, ''); return; }
  }
  langgar('urusPRK tidak selesai dalam 40 langkah', (PRK.getPRK(S.loadPlayer()).aktif || {}).fasa);
}

function urusKabinet() {
  for (let i = 0; i < 5; i++) {
    const p = S.loadPlayer(); const k = cuba('KB.ringkasan', () => KB.ringkasan(p)); if (!k) { return; }
    if (k.lobi && !k.hasGovernmentRole) {
      const ok = (k.portfolio || []).filter(x => x.boleh);
      if (!ok.length || R() < 0.2) { cuba('KB.lepaskanLobi', () => KB.lepaskanLobi()); continue; }
      const r = cuba('KB.lobiPortfolio', () => KB.lobiPortfolio(pick(ok).id)); if (!r || !r.ok) { if (r) { langgar('lobiPortfolio gagal: ' + r.ralat, ''); } return; }
      continue;
    }
    break;
  }
  const p = S.loadPlayer(), a = cuba('KB.acaraSemasa', () => KB.acaraSemasa(p));
  if (a) { const ok = a.pilihan.filter(c => c.boleh); if (ok.length) { const r = cuba('KB.jawabAcara', () => KB.jawabAcara(pick(ok).id)); if (r && !r.ok) { langgar('jawabAcara gagal: ' + r.ralat, ''); } } else { langgar('Acara kabinet tanpa pilihan boleh', a.id); } }
  const k = cuba('KB.ringkasan', () => KB.ringkasan(S.loadPlayer()));
  if (k && k.hasGovernmentRole && R() < 0.4) { const c = (k.cdfPilihan || []).filter(x => x.boleh); if (c.length) { cuba('KB.salurCDF', () => KB.salurCDF(pick(c).jumlah)); } }
  const js = cuba('PRU.janjiStatus', () => PRU.janjiStatus(S.loadPlayer()));
  if (js && !js.dinilai && R() < 0.3) { const x = pick(js.senarai.filter(y => y.kemajuan < 100)); if (x) { cuba('PRU.majukanJanji', () => PRU.majukanJanji(x.id)); } }
}

function urusNegeri(NGx, nama) {
  for (let i = 0; i < 25; i++) {
    const m = cuba(nama + '.menunggu', () => NGx.menunggu(S.loadPlayer())); if (!m) { break; }
    const lain = m.jenis === 'pilih_negeri_lain';
    let r;
    if (R() < 0.5 || !m.calon || !m.calon.length) { r = cuba(nama + '.auto', () => lain ? NGx.lantikSemuaLain() : m.jenis === 'pilih_pengerusi' ? NGx.pilihPengerusi(m.calon[0].id) : NGx.lantikAjk()); }
    else { const c = pick(m.calon); r = cuba(nama + '.pilih', () => lain ? NGx.pilihPengerusi(c.id) : m.jenis === 'pilih_pengerusi' ? NGx.pilihPengerusi(c.id) : NGx.lantikAjk(m.jawatan, c.id)); }
    if (!r || !r.ok) { if (r) { langgar(nama + ' lantikan gagal: ' + r.ralat, m.jenis); } break; }
  }
  const of = cuba(nama + '.tawaranLobi', () => NGx.tawaranLobi(S.loadPlayer()));
  if (of) { const okL = of.pilihan.filter(x => x.boleh !== false); const jenis = R() < 0.4 || !okL.length ? 'tidak' : pick(okL).id; const r = cuba(nama + '.lobi', () => NGx.lobi(jenis)); if (r && !r.ok) { langgar(nama + '.lobi gagal: ' + r.ralat, jenis); } }
}

function urusDewan() {
  const p = S.loadPlayer();
  for (const [Dx, nm] of [[DW, 'DW'], [DUN, 'DUN']]) {
    if (!cuba(nm + '.aktif', () => Dx.aktif(p))) { continue; }
    const tp = cuba(nm + '.tpSemasa', () => Dx.tpSemasa(S.loadPlayer()));
    if (tp && tp.tindakan) { const ok = tp.tindakan.filter(x => x.boleh); if (ok.length) { cuba(nm + '.tindakTP', () => Dx.tindakTP(pick(ok).id)); } }
    const sq = cuba(nm + '.soalanSemasa', () => Dx.soalanSemasa(S.loadPlayer()));
    if (sq && sq.jawapan) { const ok = sq.jawapan.filter(x => x.boleh !== false); if (ok.length) { cuba(nm + '.jawabSoalan', () => Dx.jawabSoalan(pick(ok).id)); } }
    const us = cuba(nm + '.undiSemasa', () => Dx.undiSemasa(S.loadPlayer()));
    if (us) { if (R() < 0.5 && us.lobi) { const l = (us.lobi || []).filter(x => x.boleh); if (l.length) { cuba(nm + '.lobi', () => Dx.lobi(pick(l).id)); } } cuba(nm + '.undi', () => Dx.undi()); }
    else if (R() < 0.3) { const b = cuba(nm + '.senaraiBentang', () => Dx.senaraiBentang(S.loadPlayer())); const ok = (b && (b.senarai || b) || []).filter ? (b.senarai || b).filter(x => x.boleh) : []; if (ok.length) { cuba(nm + '.mulaBentang', () => Dx.mulaBentang(pick(ok).id)); } }
  }
}

function tindakanBulan() {
  for (let i = 0; i < 12; i++) {
    const p = S.loadPlayer(); if (!p || p.tamat || p.ap <= 0) { break; }
    const peg = I.adalahPemegangJawatan(p), mod = peg ? I : O;
    const sen = (cuba('senaraiTindakan', () => mod.senaraiTindakan(p)) || []).filter(t => t.boleh);
    const sy = (cuba('SYP.senaraiTindakanSayap', () => SYP.senaraiTindakanSayap(p)) || []).filter(t => t.boleh);
    const mi = cuba('MIS.getMisi', () => MIS.getMisi(p));
    if (mi && mi.boleh && R() < 0.6) { cuba('MIS.jalankanMisi', () => MIS.jalankanMisi(mi.id)); }
    else if (sy.length && R() < 0.3) { cuba('SYP.jalankanTindakanSayap', () => SYP.jalankanTindakanSayap(pick(sy).id)); }
    else if (sen.length) { const t = pick(sen); const r = cuba('jalankanTindakan', () => mod.jalankanTindakan(t.id)); if (r && !r.ok) { langgar('Tindakan "boleh" gagal: ' + t.id + ' -> ' + r.ralat, ''); } }
    else { break; }
    if (R() < 0.35) { cuba('EV.selepasAktiviti', () => EV.selepasAktiviti()); jawabAcaraRawak(); }
    renderLogik();
  }
  // Negeri: dekati presiden / tindakan
  const p = S.loadPlayer();
  if (p && !p.tamat && R() < 0.2) { cuba('NG.dekatiPresiden', () => NG.dekatiPresiden()); }
  if (p && !p.tamat && R() < 0.2) { const t = pick(NG.TINDAKAN || []); if (t) { cuba('NG.tindakan', () => NG.tindakan(t.id)); } }
}

function pemilihan() {
  const p = S.loadPlayer(); if (!p || p.tamat) { return; }
  const st = cuba('E.getStatusModul', () => E.getStatusModul(p)); if (!st) { return; }
  for (let n = 0; n < 8; n++) {
    const sx = cuba('E.getStatusModul', () => E.getStatusModul(S.loadPlayer())); if (!sx) { break; }
    const e = pick(sx.pertandingan.filter(x => x.terbuka && !x.didaftar && !x.selesai)); if (!e || R() < 0.3) { break; }
    const r = cuba('E.daftarBertanding', () => E.daftarBertanding(e.kod)); if (r && !r.ok) { langgar('daftar "terbuka" gagal: ' + e.kod + ' -> ' + r.ralat, ''); }
  }
  const st2 = cuba('E.getStatusModul', () => E.getStatusModul(S.loadPlayer())); if (!st2) { return; }
  const daftar = st2.pertandingan.filter(e => e.didaftar && !e.selesai);
  for (let i = 0; i < 3; i++) {
    const st2b = cuba('E.getStatusModul', () => E.getStatusModul(S.loadPlayer())); if (!st2b) { break; }
    const kmp = (st2b.kempen || []).filter(k => k.boleh && (!k.perluKod || daftar.length));
    const k = pick(kmp.filter(x => x.tahap !== 'kotor' || R() < 0.3)); if (!k) { break; }
    const r = cuba('E.jalankanKempen', () => E.jalankanKempen(k.id, { kod: daftar.length ? pick(daftar).kod : undefined })); if (r && !r.ok) { langgar('kempen "boleh" gagal: ' + k.id + ' -> ' + r.ralat, ''); }
  }
  const st3 = cuba('E.getStatusModul', () => E.getStatusModul(S.loadPlayer())); if (!st3) { return; }
  st3.pertandingan.filter(e => e.didaftar && !e.selesai && e.bolehUndi).forEach(e => { if (R() < 0.5) { cuba('E.jalankanPemilihan', () => E.jalankanPemilihan(e.kod)); } });
  const bl = cuba('BLK.ringkasan', () => BLK.ringkasan(S.loadPlayer()));
  if (bl && !bl.keputusan && !bl.tutup && !bl.sokongan && bl.calon && bl.calon.length && R() < 0.5) { const c = pick(bl.calon.filter(x => !x.ditolak)); const t = pick(bl.menu); if (c && t) { cuba('BLK.runding', () => BLK.runding(c.id, t.id)); } }
}

function mesyuarat() {
  for (let g2 = 0; g2 < 8; g2++) {
    const p = S.loadPlayer(); if (!p || p.tamat) { return; }
    const k = cuba('M.getKeadaanMesyuarat', () => M.getKeadaanMesyuarat(p)); if (!k) { return; }
    const lv = k.peringkat.find(x => x.status === 'boleh_mula' || x.status === 'sedang');
    if (!lv) { return; }
    if (lv.status === 'boleh_mula') { if (R() < 0.15) { return; } const r = cuba('M.mulaMesyuarat', () => M.mulaMesyuarat(lv.kod)); if (!r || !r.ok) { if (r) { langgar('mulaMesyuarat "boleh_mula" gagal: ' + lv.kod + ' -> ' + r.ralat, ''); } return; } continue; }
    (lv.agenda || []).filter(u => u.status !== 'selesai' && u.jenis !== 'pemilihan').forEach(u => {
      if (R() < 0.7) { const per = u.jenis === 'ucapan_dasar' ? pick(['pembahas', 'undi']) : pick(['pembawa', 'pembahas', 'undi']); cuba('M.pilihPeranan', () => M.pilihPeranan(lv.kod, u.id, per, per === 'undi' ? pick(['sokong', 'bantah', 'berkecuali']) : pick(['sokong', 'bantah']))); }
    });
    if (R() < 0.85) { const r = cuba('M.tutupMesyuarat', () => M.tutupMesyuarat(lv.kod)); if (!r || !r.ok) { if (r) { langgar('tutupMesyuarat gagal: ' + lv.kod + ' -> ' + r.ralat, ''); } return; } }
    else { return; }
  }
}

let _pbb = null;
function pbbData(kod) {
  if (_pbb) { return _pbb; }
  const h = D.rowsToHierarchy(D.teksKeBaris(require('fs').readFileSync(require('path').join(__dirname, '..', 'data', kod === 'PRS' ? 'prs-sarawak.csv' : 'pbb-sarawak.csv'), 'utf8')));
  h.bahagian.forEach(b => b.cawangan.forEach(c => { if (c.kumpulan) { c.kumpulan.wanita += c.kumpulan.puteri; c.kumpulan.puteri = 0; c.kumpulan.langsung = false; } }));
  return (_pbb = h);
}
function daftarBaharu(seed) {
  S.clearPlayer(); EV.reset && EV.reset();
  localStorage.clear();
  const PBB = process.env.PARTI === 'PBB' || process.env.PARTI === 'PRS', MCA = process.env.PARTI === 'MCA' || process.env.PARTI === 'MIC' || process.env.PARTI === 'PPP', parti = PBB || MCA ? process.env.PARTI : 'UMNO';   // v10.0: PRS = mod ringan        // v8.32: PARTI=PBB mainkan bot PBB (data/pbb-sarawak.csv)   // v13.1: PARTI=MCA
  const data = PBB ? pbbData(parti) : MCA ? D.rowsToHierarchy(D.teksKeBaris(require('fs').readFileSync(require('path').join(__dirname, '..', 'data', process.env.PARTI === 'MIC' ? 'mic-semenanjung.csv' : process.env.PARTI === 'PPP' ? 'ppp-semenanjung.csv' : 'mca-semenanjung.csv'), 'utf8'))) : D.getFallbackData();
  const negeri = pick(data.negeri), bahagian = pick(negeri.bahagian), dun = pick(bahagian.dun), caw = pick(dun.cawangan);
  const jantina = pick(['Lelaki', 'Perempuan']), umur = 18 + Math.floor(R() * 40);
  const dem = D.tentukanDemografi(jantina, umur);
  const kel = SYP.kelayakan(jantina, umur, parti), syOk = SYP.SENARAI.filter(k => kel[k].boleh);
  const prof = S.buildPlayerProfile({ parti: parti, blokPBB: parti === 'PBB' ? pick(['bumiputera', 'pesaka']) : null, dunInfo: PBB ? JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'data', 'pbb-dun.json'), 'utf8'))[parseInt(bahagian.kod, 10)] : null, nama: 'Bot ' + seed, demografik: dem, cawangan: caw, avatar: pick(g.MyPolitikAvatar.LIST).kod, sayap: pick(syOk), difficultyLevel: pick(['EASY', 'NORMAL', 'HARDCORE']), tahunAhli: Math.floor(R() * 10) });
  const r = S.savePlayer(prof); if (!r.ok) { throw new Error('daftar gagal ' + r.ralat); }
  return prof;
}

const ringkas = [];
for (let gi = 0; gi < N_GAMES; gi++) {
  const seed = SEED0 + gi; P.benih(seed); R = Math.random;
  ctx = 'permainan ' + seed + ' daftar';
  let prof; try { prof = daftarBaharu(seed); } catch (e) { rekod(errors, 'daftar: ' + e.message, e.stack); continue; }
  let bulan = 0, sebabTamat = 'had bulan', tersekat = 0, maxSaiz = 0, puncak = 'Ahli Biasa', puncakPangkat = 0, cabMula = null, cabId = null;
  for (; bulan < MAX_MONTHS; bulan++) {
    let p = S.loadPlayer(); if (!p) { sebabTamat = 'profil hilang'; langgar('Profil hilang semasa bermain', bulan); break; }
    ctx = 'permainan ' + seed + ' ' + p.tahun + '/' + p.bulan + ' ' + p.jawatan;
    if (p.tamat) { sebabTamat = 'tamat: ' + (p.tamat.sebab || p.tamat.tajuk); break; }
    renderLogik();
    jawabAcaraRawak();
    urusPRU(); urusPRK(); urusKabinet(); urusNegeri(NG, 'NG'); urusNegeri(NG.sayap, 'NG.sayap'); urusDewan();
    tindakanBulan(); pemilihan(); mesyuarat(); renderLogik();
    if (R() < 0.05) { const e = ET.ringkasan(S.loadPlayer()); if (e.rayuan && e.rayuan.boleh) { cuba('ET.rayuPemecatan', () => ET.rayuPemecatan()); } }
    if (R() < 0.3) { cuba('ET.responsPendengaran', () => ET.responsPendengaran(pick(['pembelaan', 'akur']))); }
    urusPRU(); urusPRK();
    { const HT = g.MyPolitikHarta;                                                 // v8.13: aset rawak + pengisytiharan harta SPRM wajib
      if (R() < 0.08) { const a = pick(HT.ASET); cuba('HT.beli', () => HT.beli(a.id)); }
      if (R() < 0.04) { const a = pick(HT.ASET); cuba('HT.jual', () => HT.jual(a.id)); }
      if (HT.menunggu(S.loadPlayer())) { const jb = cuba('HT.isytihar', () => HT.isytihar(R() < 0.75 ? 'telus' : 'sembunyi')); if (jb && !jb.ok) { langgar('Pengisytiharan harta gagal: ' + jb.ralat); } } }
    const pv = cuba('K.pratonton', () => K.pratonton());
    const r = cuba('K.majuBulan', () => K.majuBulan());
    if (!r) { tersekat++; if (tersekat > 3) { sebabTamat = 'majuBulan melontar ralat berulang'; break; } continue; }
    if (!r.ok) {
      if (r.kod === 'kerjaya_tamat') { sebabTamat = 'tamat'; break; }
      tersekat++; if (tersekat > 3) { langgar('Tersekat: majuBulan gagal berulang: ' + r.ralat, r.kod); sebabTamat = 'tersekat: ' + r.ralat; break; }
      continue;
    }
    tersekat = 0;
    if (pv && pv.ke && (r.bulan !== pv.ke.bulan || r.tahun !== pv.ke.tahun)) { langgar('Pratonton bulan tidak sepadan dengan majuBulan', pv.ke); }
    cuba('ET.prosesBulan', () => ET.prosesBulan());
    const pb = S.loadPlayer(); if (pb && !pb.tamat && I.adalahPemegangJawatan(pb)) { cuba('I.semakAmaranKesetiaan', () => I.semakAmaranKesetiaan()); }
    if (R() < 0.6) { cuba('EV.janaAcara', () => EV.janaAcara({ pencetus: 'bulan' })); jawabAcaraRawak(); }
    const saiz = (localStorage.getItem(S.KEY) || '').length; if (saiz > maxSaiz) { maxSaiz = saiz; }
    const pc = S.loadPlayer();
    if (pc && pc.cabaran && pc.cabaran.id) {
      if (pc.cabaran.status === 'aktif') { if (cabId !== pc.cabaran.id) { cabId = pc.cabaran.id; cabMula = bulan; liputan['Cabaran bermula'] = (liputan['Cabaran bermula'] || 0) + 1; } else if (bulan - cabMula > 48) { langgar('Cabaran jawatan aktif lebih 48 bulan', pc.cabaran.jawatanDicabar); cabMula = bulan; } }
      else if (cabId === pc.cabaran.id) { liputan['Cabaran ' + pc.cabaran.status] = (liputan['Cabaran ' + pc.cabaran.status] || 0) + 1; cabId = null; }
    } else if (cabId) { liputan['Cabaran dibersihkan'] = (liputan['Cabaran dibersihkan'] || 0) + 1; cabId = null; }
    const pp = S.loadPlayer(); if (pp) { const pg = J.pangkatTertinggi ? J.pangkatTertinggi(pp) : 0; if (pg > puncakPangkat) { puncakPangkat = pg; puncak = (J.jawatanTertinggi && J.jawatanTertinggi(pp)) || pp.jawatan; } semakProfil(pp, 'selepas-bulan'); }
  }
  const pf = S.loadPlayer() || {};
  let lsTotal = 0; for (const [k, v] of localStorage._peta) { lsTotal += k.length + v.length; }
  ringkas.push({ seed, bulan, tahun: pf.tahun, umur: pf.demografik && pf.demografik.umur, sayap: pf.sayap, sukar: pf.settings && pf.settings.difficultyLevel, puncak, ip: pf.ip, myr: pf.myr, sebabTamat, saizKB: Math.round(maxSaiz / 1024), lsKB: Math.round(lsTotal / 1024) });
}

console.log('\n=== RINGKASAN PERMAINAN ===');
console.table(ringkas);
console.log('\n=== LIPUTAN ==='); console.log(JSON.stringify(liputan));
console.log('\n=== RALAT UNIK (' + errors.size + ') ===');
[...errors.entries()].sort((a, b) => b[1].count - a[1].count).forEach(([k, v]) => { console.log('[' + v.count + 'x] ' + k + '\n      konteks: ' + v.ctx); if (VERBOSE) { console.log(v.info); } });
console.log('\n=== LANGGARAN INVARIAN (' + viol.size + ') ===');
[...viol.entries()].sort((a, b) => b[1].count - a[1].count).forEach(([k, v]) => { console.log('[' + v.count + 'x] ' + k + ' :: ' + JSON.stringify(v.info).slice(0, 200) + '\n      konteks: ' + v.ctx); });

P.benih(null);
console.log('\n' + (errors.size || viol.size ? 'MASALAH DITEMUI: ' + errors.size + ' ralat unik, ' + viol.size + ' langgaran invarian.' : 'Tiada ralat atau langgaran invarian.'));
process.exit(errors.size || viol.size ? 1 : 0);
