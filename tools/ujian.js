#!/usr/bin/env node
/* ==========================================================================
   Nusa Politik — tools/ujian.js   (v8.0)
   Ujian peraturan permainan tanpa pelayar. Setiap ujian bermula dengan pemain baharu.
   Guna:  node tools/ujian.js            (semua ujian)
          node tools/ujian.js cabaran    (hanya ujian yang namanya mengandungi "cabaran")
   Kod keluar 1 jika ada ujian gagal.
   ========================================================================== */
'use strict';
const P = require('./persekitaran');
const g = P.muat();
const S = g.MyPolitikSave, E = g.MyPolitikElection, M = g.MyPolitikMeeting, I = g.MyPolitikIncumbent, O = g.MyPolitikOrdinaryMember,
  K = g.MyPolitikCalendar, EV = g.MyPolitikEvents, ET = g.MyPolitikEtika, PRU = g.MyPolitikPRU, PRK = g.MyPolitikPRK, KB = g.MyPolitikKabinet,
  PC = g.MyPolitikPencapaian, NG = g.MyPolitikNegeri, SY = g.MyPolitikSayap, MIS = g.MyPolitikMisi;

const tapis = (process.argv[2] || '').toLowerCase();
const hasil = [];
function ujian(nama, fn) {
  if (tapis && nama.toLowerCase().indexOf(tapis) < 0) { return; }
  P.benih(7);
  try { fn(); hasil.push({ nama, ok: true }); }
  catch (e) { hasil.push({ nama, ok: false, ralat: e && e.stack ? e.stack.split('\n').slice(0, 3).join('\n      ') : String(e) }); }
  finally { P.benih(null); }
}
function betul(syarat, mesej) { if (!syarat) { throw new Error(mesej || 'syarat tidak dipenuhi'); } }
function sama(a, b, mesej) { if (a !== b) { throw new Error((mesej || 'tidak sama') + ': dapat ' + JSON.stringify(a) + ', jangka ' + JSON.stringify(b)); } }
function cari(senarai, id, medan) { return (senarai || []).filter((x) => x[medan || 'id'] === id)[0]; }

const JW = {
  ajk_cawangan: { kod: 'ajk_cawangan', jawatan: 'AJK Cawangan', peringkat: 'cawangan', kumpulan: 'utama', sayap: null, pangkat: 1 },
  ketua_cawangan: { kod: 'ketua_cawangan', jawatan: 'Ketua Cawangan', peringkat: 'cawangan', kumpulan: 'utama', sayap: null, pangkat: 3 },
  ketua_bahagian: { kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', sayap: null, pangkat: 7 }
};
function pegang(kod, tahun) { return Object.assign({}, JW[kod], { tahun: tahun || 2026 }); }
function sedikit() { return 0.0001; }

/* ---------------------------------------------------------------- Simpanan */
ujian('simpanan: bacaan profil tidak menulis ke storan', () => {
  P.daftar();
  S.loadPlayer();
  let tulis = 0; const asal = localStorage.setItem;
  localStorage.setItem = function (k, v) { tulis++; return asal.call(this, k, v); };
  try { for (let i = 0; i < 20; i++) { S.loadPlayer(); } } finally { localStorage.setItem = asal; }
  sama(tulis, 0, 'setItem semasa membaca');
});

ujian('simpanan: profil rosak dipulihkan daripada sandaran', () => {
  P.daftar();
  S.applyEffects({ ip: 5 }, { kiraTindakan: false });                       // simpanan kedua mencipta sandaran
  localStorage.setItem(S.KEY, '{rosak');
  const p = S.loadPlayer();
  betul(p && p.nama === 'Pemain Ujian', 'profil tidak dipulihkan');
  betul(S.diPulihkan(), 'bendera dipulihkan tidak ditetapkan');
});

/* ---------------------------------------------------------------- Kos ikut tahap kesukaran */
ujian('kos Hardcore: tindakan pemegang jawatan menunjukkan kos sebenar dan tidak aktif jika dana kurang', () => {
  P.daftar({ kesukaran: 'HARDCORE' });
  P.tetap({ jawatan: 'Ketua Cawangan', jawatanList: [pegang('ketua_cawangan')], myr: 1100, ap: 5 });
  let t = cari(I.senaraiTindakan(), 'agih_peruntukan');
  sama(t.kos.myr, 1200, 'kos dipaparkan');
  betul(/MYR 1,200/.test(t.ringkas), 'ringkasan tidak menunjukkan RM 1,200: ' + t.ringkas);
  sama(t.boleh, false, 'butang sepatutnya tidak aktif');
  betul(/1,200/.test(t.sebab), 'sebab tidak menyebut kos sebenar: ' + t.sebab);
  P.tetap({ myr: 1200 });
  t = cari(I.senaraiTindakan(), 'agih_peruntukan');
  sama(t.boleh, true, 'butang sepatutnya aktif');
  const r = I.jalankanTindakan('agih_peruntukan');
  betul(r.ok, 'tindakan gagal: ' + r.ralat);
  sama(S.loadPlayer().myr, 0, 'baki dana');
});

ujian('kos Mudah: kos dipaparkan dikurangkan 20%', () => {
  P.daftar({ kesukaran: 'EASY' });
  const t = cari(O.senaraiTindakan(), 'khidmat_komuniti');
  sama(t.kos.myr, 120, 'kos Khidmat Masyarakat (150 x 0.8)');
});

ujian('kos: setiap butang "boleh" berjaya dijalankan (ujian sifat rawak, 300 keadaan)', () => {
  const kumpulan = [
    { mod: O, jawatan: null },
    { mod: I, jawatan: 'ketua_cawangan' }
  ];
  for (let n = 0; n < 300; n++) {
    const tahap = ['EASY', 'NORMAL', 'HARDCORE'][n % 3], k = kumpulan[n % 2];
    P.daftar({ kesukaran: tahap });
    const myr = Math.floor(Math.random() * 1600), ap = Math.floor(Math.random() * 4);
    P.tetap(k.jawatan ? { jawatan: JW[k.jawatan].jawatan, jawatanList: [pegang(k.jawatan)], myr, ap } : { myr, ap });
    const asal = S.loadPlayer();
    k.mod.senaraiTindakan().filter((t) => t.boleh).forEach((t) => {
      P.tetap({ myr: asal.myr, ap: asal.ap });
      const r = k.mod.jalankanTindakan(t.id);
      betul(r.ok, tahap + ' ' + t.id + ' (myr ' + myr + ', ap ' + ap + '): ' + r.ralat);
    });
    E.senaraiKempen(asal).forEach((c) => { if (c.boleh && c.kos.myr) { betul(asal.myr >= c.kos.myr, 'kempen ' + c.id + ' boleh tetapi dana kurang'); } });
  }
});

ujian('kos Hardcore: acara rawak menyemak kos sebenar', () => {
  P.daftar({ kesukaran: 'HARDCORE' });
  P.tetap({ myr: 1100 });
  const ev = EV.janaAcara({ paksa: 'program_kebajikan', abaikanPeluang: true });
  betul(ev, 'acara tidak dijana');
  ev.pilihan.forEach((c) => {
    if (c.kos.myr) { sama(c.boleh, S.loadPlayer().myr >= c.kos.myr, 'pilihan ' + c.id); }
    if (c.boleh) { betul(S.cukupDana(S.loadPlayer(), c.kos.myr / 1.2), 'pilihan aktif tetapi dana tidak cukup'); }
  });
});

/* ---------------------------------------------------------------- Pilihan raya: peruntukan sebagai pindahan dana */
function keManifesto(o) {
  P.daftar(o);
  P.tetap({ ip: 400, jawatan: 'AJK Cawangan', jawatanList: [pegang('ajk_cawangan')], myr: o.myr });
  PRU.isytihar('tamat_penggal', { rng: sedikit });
  let r = PRU.pilihKerusi('DUN', { rng: sedikit });
  betul(r.ok && r.diluluskan, 'pencalonan DUN gagal: ' + (r.ralat || r.mesej));
  if (PRU.getPRU(S.loadPlayer()).aktif.fasa === 'runding') { r = PRU.runding('abai', { rng: sedikit }); betul(r.ok, 'runding gagal: ' + r.ralat); }
  sama(PRU.getPRU(S.loadPlayer()).aktif.fasa, 'manifesto', 'fasa');
}
const JANJI3 = () => PRU.JANJI.slice(0, 3).map((j) => j.id);

ujian('PRU Hardcore: peruntukan semua dana boleh memulakan kempen', () => {
  keManifesto({ kesukaran: 'HARDCORE', myr: 3000 });
  const r = PRU.mulaKempen(JANJI3(), 3000);
  betul(r.ok, 'kempen gagal: ' + r.ralat);
  sama(S.loadPlayer().myr, 0, 'dana selepas peruntukan');
  sama(PRU.getPRU(S.loadPlayer()).aktif.campaignFunds, 3000, 'dana kempen');
});

ujian('PRU Hardcore: dana bawah minimum masih boleh bertanding dengan semua dana', () => {
  keManifesto({ kesukaran: 'HARDCORE', myr: 1500 });
  const pil = PRU.peruntukanPilihan(S.loadPlayer(), PRU.getPRU(S.loadPlayer()).aktif);
  betul(pil.bawahMin, 'sepatutnya bawah minimum');
  const r = PRU.mulaKempen(JANJI3(), pil.pilihan[0]);
  betul(r.ok, 'kempen gagal: ' + r.ralat);
});

ujian('PRU: baki dana kempen dipulangkan tanpa bonus dana sayap Utama', () => {
  PRU.setRng(sedikit);                                  // v8.13: kejutan kempen rawak (Math.random) kadang-kadang menghabiskan dana: tetapkan benih supaya ujian deterministik
  try { return ujianBakiKempen(); } finally { PRU.setRng(null); }
});
function ujianBakiKempen() {
  keManifesto({ kesukaran: 'NORMAL', sayap: 'utama', myr: 6000 });
  betul(PRU.mulaKempen(JANJI3(), 6000).ok, 'kempen gagal');
  for (let i = 0; i < 40; i++) {
    const ck = PRU.keadaanKempen(S.loadPlayer());
    if (!ck || ck.hariBaki <= 0 && !ck.kejutan) { break; }
    if (ck.kejutan) { const c = ck.kejutan.pilihan.filter((x) => x.boleh)[0]; betul(PRU.jawabKejutan(c.id, { rng: sedikit }).ok, 'kejutan'); continue; }
    betul(PRU.tindakanKempen('rehat').ok, 'rehat');
  }
  const p0 = S.loadPlayer(), baki = PRU.getPRU(p0).aktif.campaignFunds;
  betul(baki > 0, 'baki kempen sepatutnya ada');
  const r = PRU.selesaikan({ rng: sedikit });
  betul(r.ok, 'selesaikan gagal: ' + r.ralat);
  sama(S.loadPlayer().myr - p0.myr, baki, 'wang dipulangkan');
}

ujian('PRK Hardcore: peruntukan semua dana boleh memulakan kempen kilat', () => {
  P.daftar({ kesukaran: 'HARDCORE' });
  P.tetap({ ip: 400, jawatan: 'AJK Cawangan', jawatanList: [pegang('ajk_cawangan')], myr: 4500 });
  const t = PRK.triggerByElection({ paksa: true, jenis: 'DUN', rng: sedikit });
  betul(t.ok, 'PRK tidak dicetuskan');
  const m = PRK.mohonCalon({ rng: sedikit });
  betul(m.ok && m.diluluskan, 'pencalonan PRK gagal: ' + (m.ralat || m.mesej));
  const r = PRK.byElectionCampaign(4500);
  betul(r.ok, 'kempen PRK gagal: ' + r.ralat);
  sama(S.loadPlayer().myr, 0, 'dana selepas peruntukan');
});

/* ---------------------------------------------------------------- Pemilihan parti */
ujian('pendaftaran: jawatan lain pada peringkat yang sama dikunci dengan sebab', () => {
  P.daftar();
  P.tetap({ ip: 150, jawatan: 'AJK Cawangan', jawatanList: [pegang('ajk_cawangan', 2023)] });
  let st = E.getStatusModul();
  betul(cari(st.pertandingan, 'ketua_cawangan', 'kod').terbuka, 'Ketua Cawangan sepatutnya terbuka');
  betul(E.daftarBertanding('ketua_cawangan').ok, 'daftar Ketua Cawangan gagal');
  st = E.getStatusModul();
  const naib = cari(st.pertandingan, 'naib_ketua_cawangan', 'kod');
  sama(naib.terbuka, false, 'Naib Ketua Cawangan sepatutnya dikunci');
  betul(/Tarik balik/.test(naib.sebab), 'sebab: ' + naib.sebab);
  betul(cari(st.pertandingan, 'perwakilan_cawangan', 'kod').terbuka, 'perwakilan tidak sepatutnya terjejas');
  betul(E.tarikBalik('ketua_cawangan').ok, 'tarik balik gagal');
  betul(cari(E.getStatusModul().pertandingan, 'naib_ketua_cawangan', 'kod').terbuka, 'Naib Ketua Cawangan sepatutnya dibuka semula');
});

ujian('mesyuarat: ahli digantung melihat "tidak layak", bukan "sedia"', () => {
  P.daftar();
  P.tetap({ bulan: 4, etika: { modal: 10, risiko: 0, salah: 1, amaran: 0, status: 'digantung', hukuman: { jenis: 'digantung', tahun: 2026, bulan: 3, tamatTahun: 2027, tamatBulan: 3 }, siasatan: null, rekod: [] } });
  const caw = cari(M.getKeadaanMesyuarat().peringkat, 'cawangan', 'kod');
  sama(caw.status, 'tidak_layak', 'status Mesyuarat Cawangan');
  betul(/digantung/.test(caw.sebab), 'sebab: ' + caw.sebab);
});

/* ---------------------------------------------------------------- Cabaran jawatan */
ujian('cabaran: pencabar berundur apabila Sokongan Akar Umbi pulih ke 55%', () => {
  P.daftar();
  P.tetap({ jawatan: 'Ketua Cawangan', jawatanList: [pegang('ketua_cawangan')], kesetiaan: Object.assign({}, S.KESETIAAN_LALAI, { akarUmbi: 30 }) });
  const a = I.semakAmaranKesetiaan({ paksa: true });
  betul(a.cabaranBaru, 'cabaran tidak dicipta');
  sama(I.getCabaranAktif().kod, 'ketua_cawangan', 'kod jawatan dicabar');
  P.tetap({ kesetiaan: Object.assign({}, S.loadPlayer().kesetiaan, { akarUmbi: 50 }) });
  betul(!I.semakAmaranKesetiaan().cabaranTamat && I.getCabaranAktif(), 'cabaran tidak sepatutnya tamat pada 50%');
  P.tetap({ kesetiaan: Object.assign({}, S.loadPlayer().kesetiaan, { akarUmbi: 56 }) });
  const b = I.semakAmaranKesetiaan();
  betul(b.cabaranTamat && /menarik diri/.test(b.cabaranTamat.mesej), 'cabaran tidak tamat');
  sama(I.getCabaranAktif(), null, 'cabaran masih aktif');
  sama(S.loadPlayer().cabaran.status, 'tamat', 'status cabaran');
});

ujian('cabaran: tamat jika jawatan yang dicabar tidak lagi dipegang', () => {
  P.daftar();
  P.tetap({ jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian'), pegang('ketua_cawangan')], kesetiaan: Object.assign({}, S.KESETIAAN_LALAI, { akarUmbi: 20 }) });
  I.semakAmaranKesetiaan({ paksa: true });
  sama(I.getCabaranAktif().jawatanDicabar, 'Ketua Bahagian', 'jawatan dicabar');
  P.tetap({ jawatan: 'Ketua Cawangan', jawatanList: [pegang('ketua_cawangan')] });
  const r = I.semakAmaranKesetiaan();
  betul(r.cabaranTamat && /tidak lagi memegang/.test(r.cabaranTamat.mesej), 'cabaran tidak tamat');
});

ujian('cabaran: pencabar bertanding dalam pemilihan pertahanan dan keputusan menamatkan cabaran', () => {
  P.daftar();
  P.tetap({ bulan: 4, ip: 200, jawatan: 'Ketua Cawangan', jawatanList: [pegang('ketua_cawangan', 2023)], kesetiaan: Object.assign({}, S.KESETIAAN_LALAI, { akarUmbi: 20 }) });
  I.semakAmaranKesetiaan({ paksa: true });
  const c = I.getCabaranAktif();
  betul(c, 'cabaran tidak dicipta');
  betul(E.daftarBertanding('ketua_cawangan').ok, 'daftar pertahan gagal');
  const r = E.jalankanPemilihan('ketua_cawangan', { rng: Math.random });
  betul(r.ok, 'pemilihan gagal: ' + r.ralat);
  betul(r.keputusan.jadual.some((j) => j.nama === c.penentang.nama), 'pencabar tiada dalam senarai calon');
  betul(r.peristiwa.some((e) => e.jenis === 'cabaran_selesai'), 'tiada peristiwa cabaran_selesai');
  const st = S.loadPlayer().cabaran.status;
  betul(st === (r.keputusan.menang ? 'ditangkis' : 'diterima'), 'status cabaran: ' + st);
});

/* ---------------------------------------------------------------- Disiplin */
ujian('disiplin: ahli yang dipecat kehilangan jawatan kerajaan', () => {
  P.daftar();
  betul(KB.lantikKanan('PERDANA_MENTERI').ok, 'lantikan PM gagal');
  betul(S.loadPlayer().kabinet.hasGovernmentRole, 'PM tidak dilantik');
  const e = ET.getEtika(S.loadPlayer());
  e.siasatan = { perkara: 'Ujian', fasal: 'Fasal 20.7', berat: 3, tahun: 2025, bulan: 10, fasa: 'pendengaran', pembelaan: 0, gugur: true };
  P.tetap({ etika: e });
  const r = ET.prosesBulan();
  sama(S.loadPlayer().etika.status, 'dipecat', 'status disiplin');
  sama(S.loadPlayer().kabinet.hasGovernmentRole, false, 'masih memegang jawatan kerajaan');
  betul(r.peristiwa.some((x) => x.jenis === 'kabinet_rombak'), 'tiada peristiwa pelucutan');
});

/* ---------------------------------------------------------------- Kabinet & negeri */
ujian('kabinet: pilihan acara berkos tidak aktif jika dana kurang, dan disemak sebelum lambungan', () => {
  P.daftar({ kesukaran: 'HARDCORE' });
  KB.lantikKanan('TIMBALAN_PM');
  const k = S.loadPlayer().kabinet; k.acara = { id: 'lawatan' };
  P.tetap({ kabinet: k, myr: 3200 });
  const a = KB.acaraSemasa(S.loadPlayer()), pergi = cari(a.pilihan, 'pergi');
  sama(pergi.boleh, false, 'Sertai rombongan (RM 3,600 Hardcore)');
  sama(pergi.kesan.myr, -3600, 'kos dipaparkan');
  sama(KB.jawabAcara('pergi').ok, false, 'jawapan sepatutnya ditolak');
  betul(KB.jawabAcara('ringkas').ok, 'pilihan mampu gagal');
});

ujian('negeri: pilihan lobi Presiden yang tidak mampu ditanda', () => {
  P.daftar();
  P.tetap({ bulan: 7, myr: 500, ap: 5, jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian')] });
  const of = NG.tawaranLobi(S.loadPlayer());
  betul(of, 'tiada tawaran lobi');
  sama(cari(of.pilihan, 'sumbangan').boleh, false, 'sumbangan RM 10,000');
  sama(cari(of.pilihan, 'mengadap').boleh, true, 'mengadap (2 AP)');
});

/* ---------------------------------------------------------------- Takwim & acara */
ujian('takwim: mesej bulan baharu menunjukkan tambahan AP sebenar', () => {
  P.daftar();
  P.tetap({ ap: 13 });
  const r = K.majuBulan();
  betul(r.ok, 'majuBulan gagal: ' + r.ralat);
  betul(/AP \+2 \(had 15 dicapai\)/.test(r.mesej), 'mesej: ' + r.mesej);
  sama(S.loadPlayer().ap, 15, 'AP selepas bulan baharu');
});

ujian('acara: kiraan acara aktiviti bulanan tidak membesar tanpa had', () => {
  P.daftar();
  for (let i = 0; i < 30; i++) {
    P.tetap({ tahun: 2026 + Math.floor(i / 12), bulan: (i % 12) + 1 });
    EV.janaAcara({ pencetus: 'aktiviti', rng: () => 0 });
    EV.buangTertunggak();
  }
  const d = JSON.parse(localStorage.getItem(EV.KEY));
  betul(Object.keys(d.kiraBulan).length <= 3, 'kunci kiraBulan: ' + Object.keys(d.kiraBulan).length);
});

ujian('sayap: misi dan tindakan khas menunjukkan kos sebenar', () => {
  P.daftar({ kesukaran: 'HARDCORE', sayap: 'pemuda', jantina: 'L', umur: 25 });
  const ts = SY.senaraiTindakanSayap()[0];
  sama(ts.kos.myr, 360, 'Kempen Saraf Digital (300 x 1.2)');
  const m = MIS.getMisi();
  betul(m && /MYR/.test(m.ringkas), 'misi tiada ringkasan kos');
});

/* ---------------------------------------------------------------- Ringkasan */
/* ---------- Pencapaian (v8.6) ---------- */
function pcPemain(tambah) {
  return Object.assign({ id: 'uji1', nama: 'Uji', tahun: 2026, bulan: 1, log: [], jawatanList: [], pru: null, integriti: { skor: 70 }, kabinet: null }, tambah || {});
}
function pcLangkah(p, meta, st) { const h = PC.semak(p, meta, st); return h; }

ujian('pencapaian: Akar Umbi Teguh hanya jika tiada kekalahan jawatan sebelum itu', () => {
  const menang = { tindakan: 'pemilihan_ketua_cawangan' };
  let p = pcPemain({ log: [{ tindakan: 'pemilihan_ketua_cawangan', nama: 'Menang Ketua Cawangan' }] });
  betul(pcLangkah(p, menang, null).baru.indexOf('akar_umbi_teguh') >= 0, 'menang pertama patut membuka trofi');
  let h = pcLangkah(pcPemain({ log: [{ tindakan: 'pemilihan_naib_ketua_cawangan', nama: 'Kalah Naib Ketua Cawangan' }] }), { tindakan: 'pemilihan_naib_ketua_cawangan' }, null);
  h = pcLangkah(pcPemain({ log: [{ tindakan: 'pemilihan_ketua_cawangan', nama: 'Menang Ketua Cawangan' }] }), menang, h.st);
  sama(h.baru.length, 0, 'selepas kalah, trofi tidak patut dibuka');
  const hp = pcLangkah(pcPemain({ log: [{ tindakan: 'pemilihan_perwakilan_cawangan', nama: 'Kalah perwakilan' }] }), { tindakan: 'pemilihan_perwakilan_cawangan' }, null);
  sama(pcLangkah(pcPemain({ log: [{ tindakan: 'pemilihan_ketua_cawangan', nama: 'Menang Ketua Cawangan' }] }), menang, hp.st).baru[0], 'akar_umbi_teguh', 'kekalahan perwakilan tidak dikira');
});
ujian('pencapaian: Ikon Sayap selepas 72 bulan memegang Ketua sayap Bahagian', () => {
  let st = null, p;
  for (let k = 0; k <= 72; k++) {
    p = pcPemain({ tahun: 2026 + Math.floor(k / 12), bulan: (k % 12) + 1, jawatanList: [{ kod: 'sayap_bahagian_pemuda', kumpulan: 'sayap' }] });
    const h = pcLangkah(p, null, st); st = h.st;
    if (k < 72) { betul(h.baru.indexOf('ikon_sayap') < 0, 'terlalu awal pada bulan ' + k); } else { betul(h.baru.indexOf('ikon_sayap') >= 0, 'patut dibuka pada bulan 72'); }
  }
  sama(PC.kemajuan(p, st, 'ikon_sayap'), '72 / 72 bulan');
});
ujian('pencapaian: bulan yang sama tidak dikira dua kali', () => {
  const p = pcPemain({ jawatanList: [{ kod: 'sayap_bahagian_wanita' }] });
  let h = pcLangkah(p, null, null);
  const p2 = pcPemain({ bulan: 2, jawatanList: [{ kod: 'sayap_bahagian_wanita' }] });
  h = pcLangkah(p2, null, h.st); h = pcLangkah(p2, null, h.st); h = pcLangkah(p2, null, h.st);
  sama(h.st.jejak.uji1.bulanSayap, 1);
});
ujian('pencapaian: Wira PRU hanya di kawasan Bandar/Campuran', () => {
  const rekod = { hasil: 'menang' };
  const mk = (profil) => pcPemain({ pru: { profil, sejarah: [rekod] } });
  sama(pcLangkah(mk('URBAN'), { tindakan: 'pru_keputusan' }, null).baru[0], 'wira_pru');
  sama(pcLangkah(mk('MIXED'), { tindakan: 'pru_keputusan' }, null).baru[0], 'wira_pru');
  sama(pcLangkah(mk('RURAL'), { tindakan: 'pru_keputusan' }, null).baru.length, 0);
  sama(pcLangkah(pcPemain({ pru: { profil: 'URBAN', sejarah: [{ hasil: 'kalah' }] } }), { tindakan: 'pru_keputusan' }, null).baru.length, 0, 'kalah tidak layak');
});
ujian('pencapaian: Bapa Reformasi perlu skor >90 selama 60 bulan berturut-turut dengan kerusi', () => {
  const status = { jenis: 'MP', kerusi: 'P.1', sejakTahun: 2027, sejakBulan: 1 };
  let st = null, buka = -1;
  for (let k = 0; k < 100; k++) {
    const skor = k === 30 ? 90 : 95;                                  // 90 tidak cukup: pembilang mula semula
    const h = pcLangkah(pcPemain({ tahun: 2027 + Math.floor(k / 12), bulan: (k % 12) + 1, integriti: { skor }, pru: { status } }), null, st);
    st = h.st; if (h.baru.indexOf('bapa_reformasi') >= 0 && buka < 0) { buka = k; }
  }
  sama(buka, 30 + 60, 'patut dibuka 60 bulan selepas pembilang dimulakan semula') ;
});
ujian('pencapaian: Negarawan Utama untuk Menteri Penuh, bukan Timbalan Menteri', () => {
  const mk = (roleLevel) => pcPemain({ kabinet: { hasGovernmentRole: true, roleLevel } });
  sama(pcLangkah(mk('MENTERI_PENUH'), null, null).baru[0], 'negarawan_utama');
  sama(pcLangkah(mk('PERDANA_MENTERI'), null, null).baru[0], 'negarawan_utama');
  sama(pcLangkah(mk('TIMBALAN_MENTERI'), null, null).baru.length, 0);
  sama(pcLangkah(mk('EXCO_NEGERI'), null, null).baru.length, 0);
});
ujian('pencapaian: simpanan berasingan dan pemain latihan tidak melayakkan trofi', () => {
  P.daftar({});
  const st = PC.muat(); st.dibuka.wira_pru = { tahun: 2030, bulan: 5 }; PC.simpan(st);
  betul(PC.muat().dibuka.wira_pru, 'trofi patut kekal dalam simpanan');
  sama(PC.bilBaru(), 1); PC.tandaDilihat(); sama(PC.bilBaru(), 0);
  g.MyPolitikLatihan.aktif = () => true;
  const sebelum = JSON.stringify(PC.muat());
  sama(PC.proses({ tindakan: 'pru_keputusan' }).length, 0);
  sama(JSON.stringify(PC.muat()), sebelum, 'latihan tidak patut mengubah simpanan');
  delete g.MyPolitikLatihan.aktif;
});

/* ---------- Kesan bunyi (v8.7) ---------- */
function ACTiruan() {
  const k = { sumber: 0, nada: 0, dicipta: 0 };
  const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} });
  const nod = (lebih) => Object.assign({ connect() {}, start() {}, stop() {} }, lebih);
  function AC() {
    k.dicipta += 1;
    this.sampleRate = 8000; this.currentTime = 0; this.state = 'running'; this.destination = {};
    this.createBuffer = (c, n) => ({ getChannelData: () => new Float32Array(n) });
    this.createBufferSource = () => { k.sumber += 1; return nod({ buffer: null }); };
    this.createBiquadFilter = () => nod({ type: '', frequency: param(), Q: param() });
    this.createGain = () => nod({ gain: param() });
    this.createOscillator = () => { k.nada += 1; return nod({ type: '', frequency: param() }); };
  }
  return { AC, k };
}
ujian('sfx: pencetus ikut log simpanan (ketuk, sorak, tiada)', () => {
  const X = g.MyPolitikSFX, p = (tindakan, nama) => ({ log: [{ tindakan, nama }] });
  sama(X.bagiPencetus(p('tutup_mesyuarat', 'x'), { tindakan: 'tutup_mesyuarat' }), 'ketuk');
  sama(X.bagiPencetus(p('usul_pembahas', 'x'), { tindakan: 'usul_pembahas' }), 'ketuk');
  sama(X.bagiPencetus(p('dewan_undi', 'Lulus: x'), { tindakan: 'dewan_undi' }), 'ketuk');
  sama(X.bagiPencetus(p('pemilihan_ketua_cawangan', 'Menang Ketua Cawangan'), { tindakan: 'pemilihan_ketua_cawangan' }), 'sorak');
  sama(X.bagiPencetus(p('pemilihan_ketua_cawangan', 'Kalah Ketua Cawangan'), { tindakan: 'pemilihan_ketua_cawangan' }), null, 'kalah tiada sorakan');
  sama(X.bagiPencetus(p('pru_keputusan', 'MENANG P.100'), { tindakan: 'pru_keputusan' }), 'sorak');
  sama(X.bagiPencetus(p('pru_keputusan', 'KALAH P.100'), { tindakan: 'pru_keputusan' }), null);
  sama(X.bagiPencetus(p('ziarah', 'x'), { tindakan: 'ziarah' }), null);
  sama(X.bagiPencetus(null, null), null);
});
ujian('sfx: main() menjana bunyi, hormati senyap/kelantangan dan hadkan bunyi berganda', () => {
  const X = g.MyPolitikSFX, { AC, k } = ACTiruan(), asal = g.AudioContext;
  g.AudioContext = AC;
  try {
    g.localStorage.clear(); X._muat(); X.setOn(true); X.setVolume(0.5);
    betul(X.main('ketuk'), 'ketuk patut dimainkan');
    betul(k.dicipta === 1 && k.nada >= 2 && k.sumber >= 2, 'ketuk: 2 dentum + 2 retakan');
    sama(X.main('ketuk'), false, 'bunyi sama dalam 350 ms patut ditahan');
    betul(X.main('sorak') && X.main('flash'), 'sorak dan flash patut dimainkan');
    sama(X.main('tiada'), false);
    X.setOn(false); sama(X.main('flash'), false, 'senyap');
    X.setOn(true); X.setVolume(0); sama(X.main('sorak'), false, 'kelantangan 0');
    X.setVolume(0.7); X.setOn(false);
    const simpan = JSON.parse(g.localStorage.getItem(X.KUNCI));
    sama(simpan.on, false); sama(simpan.vol, 0.7);
    X.setOn(true);
  } finally { if (asal === undefined) { delete g.AudioContext; } else { g.AudioContext = asal; } }
});
ujian('sfx: tiada AudioContext = diam, tiada ralat', () => {
  const X = g.MyPolitikSFX, asal = g.AudioContext; delete g.AudioContext; delete g.webkitAudioContext;
  try { X.setOn(true); X.setVolume(0.5); sama(X.main('sorak'), false); } finally { if (asal) { g.AudioContext = asal; } }
});

/* ---------- Krisis tempatan di peta (v8.8) ---------- */
function kpPemain(jawatan) {
  P.daftar({});
  if (jawatan !== false) { S.applyEffects({}, { kiraTindakan: false, patch: { jawatanList: [JW.ajk_cawangan] } }); }
  return S.loadPlayer();
}
const rngTetap = (n) => () => n;
function kpBulan(p, bulan, tahun) { S.applyEffects({}, { kiraTindakan: false, patch: { bulan, tahun: tahun || p.tahun } }); }

ujian('krisis peta: hanya pemain berjawatan; satu proses setiap bulan; had serentak', () => {
  const KP = g.MyPolitikKrisisPeta;
  kpPemain(false);
  sama(KP.prosesBulan({ rng: rngTetap(0) }).peristiwa.length, 0, 'ahli biasa tiada krisis');
  let p = kpPemain(true);
  const e1 = KP.prosesBulan({ rng: rngTetap(0) }).peristiwa;
  sama(e1.length, 1); sama(e1[0].jenis, 'krisis_peta');
  sama(KP.prosesBulan({ rng: rngTetap(0) }).peristiwa.length, 0, 'bulan sama tidak diproses dua kali');
  sama(KP.senarai(S.loadPlayer())[0].cid, p.id, 'tanpa penyedia: cawangan pemain');
  kpBulan(p, 2); KP.sediakanLokasi(() => [{ id: p.id, nama: 'A' }, { id: 'X/Y/Z', nama: 'Cawangan X' }]);
  KP.prosesBulan({ rng: rngTetap(0) });
  const ids = KP.senarai(S.loadPlayer()).map((k) => k.cid).sort();
  sama(ids.length, 2); sama(ids[1], p.id === 'X/Y/Z' ? ids[1] : 'X/Y/Z', 'lokasi dari penyedia, tiada kembar');
  kpBulan(p, 3); KP.prosesBulan({ rng: rngTetap(0) });
  sama(KP.senarai(S.loadPlayer()).length, 2, 'maksimum 2 krisis aktif');
  KP.sediakanLokasi(null);
});
ujian('krisis peta: selesai (turun/bantu/abai) mengubah AP, MYR, sokongan dan bonus kawasan', () => {
  const KP = g.MyPolitikKrisisPeta;
  let p = kpPemain(true); KP.prosesBulan({ rng: rngTetap(0) });
  let k = KP.senarai(S.loadPlayer())[0];
  const ap0 = S.loadPlayer().ap, au0 = S.loadPlayer().kesetiaan.akarUmbi;
  let r = KP.selesai(k.id, 'turun'); betul(r.ok, r.ralat);
  p = S.loadPlayer();
  sama(p.ap, ap0 - KP.CONFIG.TURUN.ap); sama(p.kesetiaan.akarUmbi, au0 + KP.CONFIG.TURUN.akarUmbi);
  sama(p.peta.bonus['C:' + k.cid], KP.CONFIG.TURUN.bonus); sama(KP.senarai(p).length, 0); sama(p.krisisPeta.selesai, 1);
  sama(KP.selesai(k.id, 'turun').ok, false, 'krisis yang sudah selesai ditolak');
  kpBulan(p, 2); KP.prosesBulan({ rng: rngTetap(0) }); k = KP.senarai(S.loadPlayer())[0];
  const myrSebelum = S.loadPlayer().myr;
  r = KP.selesai(k.id, 'bantu'); betul(r.ok, r.ralat);
  sama(S.loadPlayer().myr, myrSebelum - S.kosSebenar(S.loadPlayer(), KP.CONFIG.BANTU.myr), 'kos bantuan ditolak');
  kpBulan(p, 3); KP.prosesBulan({ rng: rngTetap(0) }); k = KP.senarai(S.loadPlayer())[0];
  const bonusSebelum = S.loadPlayer().peta.bonus['C:' + k.cid] || 0;
  r = KP.selesai(k.id, 'abai'); betul(r.ok, r.ralat);
  sama(S.loadPlayer().peta.bonus['C:' + k.cid], bonusSebelum + KP.CONFIG.ABAI.bonus, 'abai menyusutkan bonus kawasan');
  sama(S.loadPlayer().krisisPeta.terabai, 1);
});
ujian('krisis peta: pilihan berkos dilumpuhkan jika AP/MYR tidak cukup', () => {
  const KP = g.MyPolitikKrisisPeta;
  kpPemain(true); KP.prosesBulan({ rng: rngTetap(0) });
  S.applyEffects({}, { kiraTindakan: false, patch: { ap: 0, myr: 0 } });
  const p = S.loadPlayer(), k = KP.senarai(p)[0], o = KP.pilihan(p, k.id);
  sama(o.map((x) => x.boleh).join(), 'false,false,true');
  sama(KP.selesai(k.id, 'turun').ok, false);
  betul(KP.selesai(k.id, 'abai').ok, 'abai sentiasa boleh');
});
ujian('krisis peta: dibiarkan 3 bulan = diabaikan automatik dengan penalti', () => {
  const KP = g.MyPolitikKrisisPeta;
  let p = kpPemain(true); KP.prosesBulan({ rng: rngTetap(0) });
  const cid = KP.senarai(S.loadPlayer())[0].cid, au0 = S.loadPlayer().kesetiaan.akarUmbi;
  kpBulan(p, 2); KP.prosesBulan({ rng: rngTetap(1) }); sama(KP.senarai(S.loadPlayer()).length, 1, 'bulan ke-2: masih aktif');
  kpBulan(p, 3); KP.prosesBulan({ rng: rngTetap(1) }); sama(KP.senarai(S.loadPlayer()).length, 1, 'bulan ke-3: masih aktif');
  kpBulan(p, 4); const e = KP.prosesBulan({ rng: rngTetap(1) }).peristiwa;
  sama(KP.senarai(S.loadPlayer()).length, 0); betul(e.some((x) => x.jenis === 'krisis_peta_lewat'), 'notis lewat');
  const q = S.loadPlayer();
  sama(q.kesetiaan.akarUmbi, au0 + KP.CONFIG.LEWAT.akarUmbi); sama(q.peta.bonus['C:' + cid], KP.CONFIG.LEWAT.bonus); sama(q.krisisPeta.terabai, 1);
});

/* ---------- Meter Sokongan Atas Pagar (v8.9) ---------- */
ujian('atas pagar: zon dan pelarasan peluang dicabar (+10 / -10 mata peratus)', () => {
  sama(I.zonAtasPagar(19), 'musuh'); sama(I.zonAtasPagar(20), 'goyah'); sama(I.zonAtasPagar(49), 'goyah'); sama(I.zonAtasPagar(50), 'sokong');
  const asas = I.kebarangkalianCabaran(20);
  sama(I.kebarangkalianCabaran(20, 30), asas, 'goyah tidak mengubah');
  betul(Math.abs(I.kebarangkalianCabaran(20, 10) - (asas + 0.10)) < 1e-9, 'musuh +0.10');
  betul(Math.abs(I.kebarangkalianCabaran(20, 60) - (asas - 0.10)) < 1e-9, 'sokong -0.10');
  betul(I.kebarangkalianCabaran(0, 5) <= 0.85 && I.kebarangkalianCabaran(39, 90) >= 0.05, 'terhad 5% hingga 85%');
});
ujian('atas pagar: Kopi O dan Dengar Aduan Terbuka menaikkan meter; Kenyataan Media menurunkan', () => {
  kpPemain(true); S.applyEffects({}, { kiraTindakan: false, patch: { jawatan: 'AJK Cawangan', bulan: 6, ap: 20, myr: 5000 } });
  const n0 = S.loadPlayer().kesetiaan.penentang;
  let r = I.jalankanTindakan('kopi_o'); betul(r.ok, r.ralat); sama(S.loadPlayer().kesetiaan.penentang, n0 + 8);
  const st0 = S.loadPlayer().stress || 0;
  r = I.jalankanTindakan('aduan_terbuka'); betul(r.ok, r.ralat);
  sama(S.loadPlayer().kesetiaan.penentang, n0 + 14); betul(/Stress \+2/.test(r.mesej), 'mesej stress: ' + r.mesej);
  r = I.jalankanTindakan('kenyataan_media'); betul(r.ok, r.ralat); sama(S.loadPlayer().kesetiaan.penentang, n0 + 4);
});
ujian('atas pagar: reput 2 mata sebulan ke arah 30, sekali sebulan', () => {
  kpPemain(true); S.applyEffects({}, { kiraTindakan: false, patch: { kesetiaan: Object.assign({}, S.loadPlayer().kesetiaan, { penentang: 41 }) } });
  I.prosesBulan(); sama(S.loadPlayer().kesetiaan.penentang, 39);
  I.prosesBulan(); sama(S.loadPlayer().kesetiaan.penentang, 39, 'sekali sebulan');
  let p = S.loadPlayer(); kpBulan(p, p.bulan === 12 ? 1 : p.bulan + 1, p.bulan === 12 ? p.tahun + 1 : p.tahun);
  I.prosesBulan(); sama(S.loadPlayer().kesetiaan.penentang, 37);
  S.applyEffects({}, { kiraTindakan: false, patch: { kesetiaan: Object.assign({}, S.loadPlayer().kesetiaan, { penentang: 29 }), atasPagarAkhir: '' } });
  I.prosesBulan(); sama(S.loadPlayer().kesetiaan.penentang, 30, 'tidak melepasi 30');
});
ujian('atas pagar: krisis peta menaikkan / menurunkan meter', () => {
  const KP = g.MyPolitikKrisisPeta;
  let p = kpPemain(true); KP.prosesBulan({ rng: rngTetap(0) });
  const n0 = S.loadPlayer().kesetiaan.penentang, k = KP.senarai(S.loadPlayer())[0];
  betul(KP.selesai(k.id, 'turun').ok); sama(S.loadPlayer().kesetiaan.penentang, n0 + KP.CONFIG.TURUN.penentang);
  kpBulan(p, 2); KP.prosesBulan({ rng: rngTetap(0) });
  const n1 = S.loadPlayer().kesetiaan.penentang; kpBulan(p, 5); KP.prosesBulan({ rng: rngTetap(1) });
  sama(S.loadPlayer().kesetiaan.penentang, n1 + KP.CONFIG.LEWAT.penentang, 'lewat menurunkan');
});

/* ---------- Paparan IP sebenar (v8.10) ---------- */
ujian('ip sebenar: paparan kesan tindakan sama dengan IP yang benar-benar diterima', () => {
  P.daftar({});
  for (const ip of [0, 60, 150, 240, 270, 400]) {
    S.applyEffects({}, { kiraTindakan: false, patch: { ip } });
    const p = S.loadPlayer(), jangka = S.ipSebenar(p, 10), papar = S.kesanPapar(p, { ip: 10, ap: -1 });
    sama(papar.ip, jangka, 'kesanPapar IP pada ' + ip); sama(papar.ipAsas, 10, 'nilai asas dikekalkan');
    const r = S.applyEffects({ ip: 10 }, { kiraTindakan: false });
    sama(r.perubahan.ip, jangka, 'IP diterima pada ' + ip);
  }
  S.applyEffects({}, { kiraTindakan: false, patch: { ip: 150 } }); sama(S.ipSebenar(S.loadPlayer(), 10), 5);
  S.applyEffects({}, { kiraTindakan: false, patch: { ip: 400 } }); sama(S.ipSebenar(S.loadPlayer(), 10), 1);
  sama(S.ipSebenar(S.loadPlayer(), -5), -5, 'kehilangan IP tidak diredam'); sama(S.kesanPapar(S.loadPlayer(), { ip: -5 }).ipAsas, undefined);
});

/* ---------- Kerjaya & pendapatan (v8.12) ---------- */
function kjPemain(kerjaya, jwList, patch) {
  P.daftar({ careerBackground: kerjaya });
  S.applyEffects({}, { kiraTindakan: false, patch: Object.assign({ jawatanList: jwList || [], jawatan: jwList && jwList.length ? jwList[0].jawatan : 'Ahli Biasa', myr: 5000 }, patch || {}) });
  return S.loadPlayer();
}
ujian('kerjaya: pilihan dikunci semasa daftar; simpanan lama = Profesional / Korporat; kod tak sah ditolak', () => {
  const KJ = g.MyPolitikKerjaya;
  sama(kjPemain('peguam').careerBackground, 'peguam'); sama(KJ.latarBelakang(S.loadPlayer()), 'peguam');
  sama(kjPemain('tidak_sah').careerBackground, 'korporat', 'kod tak sah');
  const lama = S.loadPlayer(); delete lama.careerBackground; S.applyEffects({}, { kiraTindakan: false, patch: { careerBackground: undefined } });
  sama(KJ.latarBelakang(S.loadPlayer()), 'korporat', 'simpanan lama');
});
ujian('kerjaya: tiada elaun parti; jawatan parti = kos operasi (peringkat tertinggi), bukan gaji', () => {
  const KJ = g.MyPolitikKerjaya;
  let p = kjPemain('korporat'); sama(KJ.pendapatan(p).jumlah, 900, 'ahli biasa = gaji kerjaya sahaja');
  p = kjPemain('korporat', [pegang('ajk_cawangan')]); sama(KJ.pendapatan(p).jumlah, 900 - 100, 'cawangan');
  p = kjPemain('korporat', [pegang('ajk_cawangan'), pegang('ketua_bahagian')]); sama(KJ.pendapatan(p).jumlah, 900 - 150, 'bahagian ialah tertinggi');
  p = kjPemain('peniaga', [pegang('ketua_bahagian')]); sama(KJ.pendapatan(p).jumlah, 750 - 150);
  betul(!KJ.pendapatan(p).butiran.some((b) => /Elaun (asas|jawatan)/.test(b.nama)), 'tiada butiran elaun parti');
  sama(g.MyPolitikCalendar.CONFIG.DANA_ASAS, undefined, 'DANA_ASAS dibuang'); sama(g.MyPolitikCalendar.CONFIG.DANA_JAWATAN, undefined);
});
ujian('kerjaya: pendapatan rasmi hanya untuk ADUN / MP; wakil rakyat 50% kerjaya; Menteri 0%', () => {
  const KJ = g.MyPolitikKerjaya;
  let p = kjPemain('korporat'); p.pru = { status: { jenis: 'ADUN' } };
  S.applyEffects({}, { kiraTindakan: false, patch: { pru: Object.assign({}, PRU.getPRU(S.loadPlayer()), { status: { jenis: 'ADUN', kerusi: 'X', sejakTahun: 2026, sejakBulan: 1, kerajaan: true } }) } });
  p = S.loadPlayer(); sama(KJ.faktorKerjaya(p), 0.5); sama(KJ.pendapatan(p).jumlah, 450 + 1000, 'ADUN: 50% + elaun 1,000');
  S.applyEffects({}, { kiraTindakan: false, patch: { pru: Object.assign({}, PRU.getPRU(S.loadPlayer()), { status: { jenis: 'MP', kerusi: 'Y', sejakTahun: 2026, sejakBulan: 1, kerajaan: true } }) } });
  p = S.loadPlayer(); sama(KJ.pendapatan(p).jumlah, 450 + 1800, 'MP: 50% + elaun 1,800');
  S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: Object.assign({}, KB.getKabinet(p), { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH' }) } });
  p = S.loadPlayer(); sama(KJ.faktorKerjaya(p), 0); sama(KJ.pendapatan(p).jumlah, 1800, 'Menteri: kerjaya 0%, elaun MP kekal (elaun menteri di kabinet.js)');
});
ujian('kerjaya: kos operasi dilaras (100/150/300) dan elaun kabinet dipaparkan berasingan (tidak dikira dua kali)', () => {
  const KJ = g.MyPolitikKerjaya, KB = g.MyPolitikKabinet;
  sama(JSON.stringify(KJ.CONFIG.KOS_OPERASI), JSON.stringify({ cawangan: 100, bahagian: 150, pusat: 300 }));
  let p = kjPemain('korporat', [{ kod: 'presiden', jawatan: 'Presiden', peringkat: 'pusat', kumpulan: 'utama', sayap: null, pangkat: 12, tahun: 2026 }]); sama(KJ.pendapatan(p).jumlah, 900 - 300, 'Pusat RM 300');
  sama(KJ.elaunKabinet(p), null, 'tiada jawatan kerajaan: tiada elaun');
  S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: Object.assign({}, KB.getKabinet(p), { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH' }) } });
  p = S.loadPlayer(); sama(KJ.pendapatan(p).jumlah, -300, 'Menteri + Pusat: kerjaya 0, kos 300 (elaun tidak termasuk dalam pendapatan())');
  const ek = KJ.elaunKabinet(p); sama(ek.myr, 4000); sama(ek.ip, 20);
});
ujian('kerjaya: regenerasi bulanan guna pendapatan baharu, dihadkan supaya dana tidak negatif, tidak didarab kesukaran', () => {
  let p = kjPemain('korporat', [pegang('ketua_bahagian')], { myr: 0 });
  sama(K.regenerasi(p).myr, 750);
  p = kjPemain('korporat', [pegang('ajk_cawangan')], { myr: 100 });
  const j = g.MyPolitikKerjaya; const asal = j.KERJAYA.korporat.gaji; j.KERJAYA.korporat.gaji = 0;
  try { sama(K.regenerasi(p).myr, -100, 'dihadkan kepada -dana'); } finally { j.KERJAYA.korporat.gaji = asal; }
  const jalan = (kes) => { kjPemain('korporat', [pegang('ajk_cawangan')], { myr: 1000 }); P.tetap({ settings: Object.assign({}, S.loadPlayer().settings, { difficultyLevel: kes }) }); const m0 = S.loadPlayer().myr, r = K.majuBulan(); betul(r.ok, r.ralat); return S.loadPlayer().myr - m0; };
  sama(jalan('HARDCORE'), jalan('NORMAL'), 'pengali kesukaran tidak mengubah pendapatan bulanan');
});
ujian('kerjaya: Peniaga / Kontraktor + jawatan kerajaan menambah konflik kepentingan; yang lain tidak', () => {
  const KJ = g.MyPolitikKerjaya;
  let p = kjPemain('peniaga'); sama(KJ.konflikBulanan(p), 0, 'tanpa jawatan kerajaan');
  S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: Object.assign({}, KB.getKabinet(p), { hasGovernmentRole: true, roleLevel: 'EXCO_NEGERI' }) } });
  sama(KJ.konflikBulanan(S.loadPlayer()), KJ.CONFIG.KONFLIK_KONTRAKTOR);
  p = kjPemain('korporat'); S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: Object.assign({}, KB.getKabinet(p), { hasGovernmentRole: true, roleLevel: 'EXCO_NEGERI' }) } });
  sama(KJ.konflikBulanan(S.loadPlayer()), 0, 'korporat');
});

/* ---------- Harta, cukai dan pengisytiharan SPRM (v8.13) ---------- */
function htPemain(patch) { P.daftar({}); S.applyEffects({}, { kiraTindakan: false, patch: Object.assign({ myr: 200000, ip: 0, bulan: 6 }, patch || {}) }); return S.loadPlayer(); }
ujian('harta: beli, jual 80%, tidak boleh beli dua kali atau tanpa dana, disekat semasa pengisytiharan menunggu', () => {
  const HT = g.MyPolitikHarta; htPemain();
  let r = HT.beli('rumah'); betul(r.ok, r.ralat); sama(S.loadPlayer().myr, 160000);
  sama(HT.beli('rumah').ok, false, 'dua kali'); sama(HT.katalog(S.loadPlayer()).filter((a) => a.id === 'rumah')[0].milik, true);
  r = HT.jual('rumah'); betul(r.ok, r.ralat); sama(S.loadPlayer().myr, 160000 + 32000, 'jual 80% daripada 40,000');
  sama(HT.jual('rumah').ok, false, 'jual yang tidak dimiliki');
  htPemain({ myr: 10000 }); sama(HT.beli('jet').ok, false, 'dana tidak cukup');
  htPemain(); S.applyEffects({}, { kiraTindakan: false, patch: { harta: Object.assign({}, HT.getHarta(S.loadPlayer()), { menunggu: { sebab: 'kitaran' } }) } });
  sama(HT.beli('rumah').ok, false, 'disekat semasa menunggu');
});
ujian('harta: cukai tahunan ikut kurungan marginal', () => {
  const HT = g.MyPolitikHarta;
  sama(HT.cukaiTahunan(50000), 0); sama(HT.cukaiTahunan(200000), 1500); sama(HT.cukaiTahunan(500000), 7500); sama(HT.cukaiTahunan(600000), 10500); sama(HT.cukaiTahunan(-5), 0);
});
ujian('harta: proses bulan memberi IP pasif, tolak penyelenggaraan 0.5%, kumpul cukai, kurangkan Stress; sekali sebulan', () => {
  const HT = g.MyPolitikHarta; htPemain({ stress: 30 });
  betul(HT.beli('rumah').ok); betul(HT.beli('kereta').ok);
  const m0 = S.loadPlayer().myr, ip0 = S.loadPlayer().ip, st0 = S.loadPlayer().stress;
  HT.prosesBulan({ rng: rngTetap(1) });
  const p = S.loadPlayer();
  sama(p.myr, m0 - (200 + 125), 'penyelenggaraan 0.5% (200 + 125)'); sama(p.ip - ip0, 2, 'IP pasif'); sama(p.stress, st0 - 2, 'Stress -2');
  const bersih = m0 - 325 + 65000; sama(HT.getHarta(p).cukaiTerkumpul, Math.round(HT.cukaiTahunan(bersih) / 12), 'cukai terkumpul 1/12');
  HT.prosesBulan({ rng: rngTetap(1) }); sama(S.loadPlayer().myr, p.myr, 'sekali sebulan');
});
ujian('harta: pengisytiharan dicetus selepas 12 bulan atau dilantik ke jawatan kerajaan; bulan disekat sehingga dijawab', () => {
  const HT = g.MyPolitikHarta; let p = htPemain({ tahun: 2026, bulan: 1 });
  HT.prosesBulan({ rng: rngTetap(1) }); sama(HT.menunggu(S.loadPlayer()), null, 'bulan 0');
  for (let i = 2; i <= 12; i++) { kpBulan(p, i); HT.prosesBulan({ rng: rngTetap(1) }); }
  sama(HT.menunggu(S.loadPlayer()), null, 'bulan 11'); kpBulan(p, 1, 2027); HT.prosesBulan({ rng: rngTetap(1) });
  sama((HT.menunggu(S.loadPlayer()) || {}).sebab, 'kitaran', 'selepas 12 bulan');
  const r = K.majuBulan(); sama(r.ok, false); sama(r.kod, 'harta_menunggu', 'bulan disekat');
  betul(HT.isytihar('telus').ok); sama(HT.menunggu(S.loadPlayer()), null);
  p = htPemain({ tahun: 2026, bulan: 3 }); HT.prosesBulan({ rng: rngTetap(1) }); kpBulan(p, 4);
  S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: Object.assign({}, KB.getKabinet(p), { hasGovernmentRole: true, roleLevel: 'EXCO_NEGERI' }) } });
  HT.prosesBulan({ rng: rngTetap(1) }); sama((HT.menunggu(S.loadPlayer()) || {}).sebab, 'kerajaan', 'dilantik ke jawatan kerajaan');
});
ujian('harta: pengisytiharan telus bayar cukai, Integriti +15, Risiko Audit -15; tunggakan jika tunai tidak cukup', () => {
  const HT = g.MyPolitikHarta, IG = g.MyPolitikIntegriti; htPemain({ myr: 300000 });
  S.applyEffects({}, { kiraTindakan: false, patch: { harta: Object.assign({}, HT.getHarta(S.loadPlayer()), { cukaiTerkumpul: 5000, risikoAudit: 40, menunggu: { sebab: 'kitaran' } }) } });
  const m0 = S.loadPlayer().myr, sk0 = IG.getIntegriti(S.loadPlayer()).skor; const r = HT.isytihar('telus'); betul(r.ok, r.ralat);
  const p = S.loadPlayer(); sama(p.myr, m0 - 5000); sama(IG.getIntegriti(p).skor, sk0 + 15); sama(HT.getHarta(p).risikoAudit, 25); sama(HT.getHarta(p).cukaiTerkumpul, 0);
  htPemain({ myr: 1000 });
  S.applyEffects({}, { kiraTindakan: false, patch: { harta: Object.assign({}, HT.getHarta(S.loadPlayer()), { cukaiTerkumpul: 5000, menunggu: { sebab: 'kitaran' } }) } });
  betul(HT.isytihar('telus').ok); sama(S.loadPlayer().myr, 0); sama(HT.getHarta(S.loadPlayer()).tertunggak, 4000, 'baki ditangguh');
});
ujian('harta: sembunyi aset kekalkan tunai, naikkan Risiko Audit +25 (dan risiko tadbir urus +15 jika jawatan kerajaan)', () => {
  const HT = g.MyPolitikHarta, IG = g.MyPolitikIntegriti; let p = htPemain();
  S.applyEffects({}, { kiraTindakan: false, patch: { harta: Object.assign({}, HT.getHarta(p), { cukaiTerkumpul: 8000, menunggu: { sebab: 'kitaran' } }) } });
  const m0 = S.loadPlayer().myr; betul(HT.isytihar('sembunyi').ok);
  p = S.loadPlayer(); sama(p.myr, m0, 'tunai dikekalkan'); sama(HT.getHarta(p).cukaiElak, 8000); sama(HT.getHarta(p).cukaiTerkumpul, 0); sama(HT.getHarta(p).risikoAudit, 25);
  p = htPemain(); S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: Object.assign({}, KB.getKabinet(p), { hasGovernmentRole: true, roleLevel: 'EXCO_NEGERI' }), harta: Object.assign({}, HT.getHarta(p), { menunggu: { sebab: 'kerajaan' } }) } });
  const r0 = IG.getIntegriti(S.loadPlayer()).risiko; betul(HT.isytihar('sembunyi').ok); sama(IG.getIntegriti(S.loadPlayer()).risiko, r0 + 15, 'risiko tadbir urus');
});
ujian('harta: audit SPRM ke atas aset disembunyikan: bayar cukai + denda 100%, Integriti -15, Reputasi -8', () => {
  const HT = g.MyPolitikHarta, IG = g.MyPolitikIntegriti; let p = htPemain({ myr: 100000, reputasi: 50 });
  S.applyEffects({}, { kiraTindakan: false, patch: { harta: Object.assign({}, HT.getHarta(p), { cukaiElak: 3000, risikoAudit: 60, terakhir: p.tahun * 12 + p.bulan }) } });
  const m0 = S.loadPlayer().myr, sk0 = IG.getIntegriti(S.loadPlayer()).skor, e = HT.prosesBulan({ rng: rngTetap(0) }).peristiwa;
  betul(e.some((x) => x.jenis === 'harta_audit'), 'peristiwa audit');
  p = S.loadPlayer(); sama(m0 - p.myr, 6000, 'cukai 3,000 + denda 3,000'); sama(IG.getIntegriti(p).skor, sk0 - 15); sama(p.reputasi, 42); sama(HT.getHarta(p).cukaiElak, 0); sama(HT.getHarta(p).risikoAudit, 10);
  p = htPemain(); S.applyEffects({}, { kiraTindakan: false, patch: { harta: Object.assign({}, HT.getHarta(p), { cukaiElak: 3000, risikoAudit: 60, terakhir: p.tahun * 12 + p.bulan }) } });
  sama(HT.prosesBulan({ rng: rngTetap(0.9) }).peristiwa.some((x) => x.jenis === 'harta_audit'), false, 'rng tinggi = tiada audit');
});
ujian('harta: Agensi / Syarikat Media mengurangkan peluang krisis politik (yang lebih baik dipakai)', () => {
  const HT = g.MyPolitikHarta; htPemain();
  sama(HT.faktorKrisis(S.loadPlayer()), 1); betul(HT.beli('agensi').ok); sama(HT.faktorKrisis(S.loadPlayer()), 0.75);
  betul(HT.beli('media').ok); sama(Math.round(HT.faktorKrisis(S.loadPlayer()) * 100), 55, 'tidak bertindih');
});

const lulus = hasil.filter((h) => h.ok).length, gagal = hasil.filter((h) => !h.ok);
hasil.forEach((h) => { console.log((h.ok ? '  ✓ ' : '  ✗ ') + h.nama + (h.ok ? '' : '\n      ' + h.ralat)); });
console.log('\n' + lulus + ' lulus, ' + gagal.length + ' gagal, ' + hasil.length + ' ujian.');
process.exit(gagal.length ? 1 : 0);
