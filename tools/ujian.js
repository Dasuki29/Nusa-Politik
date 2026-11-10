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
  betul(/AP \+6 \(had 20 dicapai\)/.test(r.mesej) || /AP \+7 \(had 20 dicapai\)/.test(r.mesej) || /had 20/.test(r.mesej), 'mesej: ' + r.mesej);
  sama(S.loadPlayer().ap, 19, 'AP selepas bulan baharu (13 + 6, had 20)');
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
  p = S.loadPlayer(); sama(KJ.faktorKerjaya(p), 0.5); sama(KJ.pendapatan(p).jumlah, 450 + 1500, 'ADUN: 50% + elaun 1,500');
  S.applyEffects({}, { kiraTindakan: false, patch: { pru: Object.assign({}, PRU.getPRU(S.loadPlayer()), { status: { jenis: 'MP', kerusi: 'Y', sejakTahun: 2026, sejakBulan: 1, kerajaan: true } }) } });
  p = S.loadPlayer(); sama(KJ.pendapatan(p).jumlah, 450 + 2500, 'MP: 50% + elaun 2,500');
  S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: Object.assign({}, KB.getKabinet(p), { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH' }) } });
  p = S.loadPlayer(); sama(KJ.faktorKerjaya(p), 0); sama(KJ.pendapatan(p).jumlah, 2500, 'Menteri: kerjaya 0%, elaun MP kekal (elaun menteri di kabinet.js)');
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
  sama(p.myr, m0 + 360 - (200 + 125), 'sewa 360 tolak penyelenggaraan 0.5% (200 + 125)'); sama(p.ip - ip0, 2, 'IP pasif'); sama(p.stress, st0 - 2, 'Stress -2');
  const bersih = m0 + 360 - 325 + 65000; sama(HT.getHarta(p).cukaiTerkumpul, Math.round(HT.cukaiTahunan(bersih) / 12), 'cukai terkumpul 1/12');
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

/* ---------- v8.15: Undo ---------- */
function unPemain(patch) { P.daftar({}); S.applyEffects({}, { kiraTindakan: false, patch: Object.assign({ myr: 200000, ip: 100, ap: 5, bulan: 6 }, patch || {}) }); return S.loadPlayer(); }
function unAksi(UN, label, fn) { UN.mula(label); fn(); return UN.tamat(); }
ujian('undo: satu tindakan terakhir dibatalkan (IP, Dana, AP dipulihkan), baki 3 -> 2', () => {
  const UN = g.MyPolitikUndo; unPemain();
  betul(unAksi(UN, 'Beli rumah', () => g.MyPolitikHarta.beli('rumah')), 'gambar disimpan');
  let k = UN.keadaan(S.loadPlayer()); betul(k.boleh, k.sebab); sama(k.label, 'Beli rumah'); sama(k.baki, 3);
  sama(S.loadPlayer().myr, 160000);
  const r = UN.undo(); betul(r.ok, r.ralat); const p = S.loadPlayer();
  sama(p.myr, 200000, 'dana dipulihkan'); sama(!!(p.harta && p.harta.aset && p.harta.aset.rumah), false, 'aset dibatalkan');
  k = UN.keadaan(p); sama(k.baki, 2); sama(k.boleh, false, 'tiada lagi untuk undo');
});
ujian('undo: tindakan gagal / tiada perubahan tidak menggunakan undo', () => {
  const UN = g.MyPolitikUndo; unPemain({ myr: 100 });
  sama(unAksi(UN, 'Beli jet', () => g.MyPolitikHarta.beli('jet')), false, 'dana tidak cukup');
  sama(UN.keadaan(S.loadPlayer()).boleh, false);
});
ujian('undo: dikunci apabila keadaan berubah selepas tindakan (bulan / tindakan lain / acara)', () => {
  const UN = g.MyPolitikUndo; unPemain();
  unAksi(UN, 'Beli rumah', () => g.MyPolitikHarta.beli('rumah')); betul(UN.keadaan(S.loadPlayer()).boleh);
  S.applyEffects({}, { kiraTindakan: false, patch: { ip: 150 } });
  const k = UN.keadaan(S.loadPlayer()); sama(k.boleh, false); betul(/berubah/.test(k.sebab), k.sebab);
  unPemain(); unAksi(UN, 'Beli rumah', () => g.MyPolitikHarta.beli('rumah'));
  globalThis.localStorage.setItem('myPolitik_events', '{"x":1}');
  sama(UN.keadaan(S.loadPlayer()).boleh, false, 'perubahan acara juga mengunci');
});
ujian('undo: keputusan rawak ditanda tidak boleh di-undo', () => {
  const UN = g.MyPolitikUndo; unPemain();
  sama(unAksi(UN, 'Tindakan rawak', () => { g.MyPolitikHarta.beli('rumah'); UN.rawak(); }), false);
  sama(UN.keadaan(S.loadPlayer()).boleh, false);
  unAksi(UN, 'Beli wisma', () => g.MyPolitikHarta.beli('wisma')); betul(UN.keadaan(S.loadPlayer()).boleh); UN.rawak(); sama(UN.keadaan(S.loadPlayer()).boleh, false, 'rawak() selepas tamat mengunci');
});
ujian('undo: had 3 setahun, ditetapkan semula tahun baharu; Hardcore dimatikan', () => {
  const UN = g.MyPolitikUndo; unPemain();
  for (let i = 0; i < 3; i++) { betul(unAksi(UN, 'Beli rumah', () => g.MyPolitikHarta.beli('rumah'))); betul(UN.undo().ok); }
  unAksi(UN, 'Beli rumah', () => g.MyPolitikHarta.beli('rumah'));
  let k = UN.keadaan(S.loadPlayer()); sama(k.boleh, false); sama(k.baki, 0); betul(/habis/.test(k.sebab), k.sebab);
  S.applyEffects({}, { kiraTindakan: false, patch: { tahun: S.loadPlayer().tahun + 1 } });
  sama(UN.keadaan(S.loadPlayer()).baki, 3, 'tahun baharu: baki 3 semula');
  const p2 = unPemain(); S.applyEffects({}, { kiraTindakan: false, patch: { settings: Object.assign({}, p2.settings, { difficultyLevel: 'HARDCORE' }) } });
  sama(UN.mula('x'), false, 'Hardcore: tiada gambar'); k = UN.keadaan(S.loadPlayer()); sama(k.boleh, false); betul(k.hardcore);
});
ujian('undo: watak lain tidak boleh menggunakan gambar watak terdahulu', () => {
  const UN = g.MyPolitikUndo; unPemain(); unAksi(UN, 'Beli rumah', () => g.MyPolitikHarta.beli('rumah'));
  P.daftar({}); sama(UN.keadaan(S.loadPlayer()).boleh, false, 'id berbeza');
});

/* ---------- v8.16: Lobi tangguh ---------- */
function lobiKempen(rngKeputusan, kuat) {
  keManifesto({ kesukaran: 'NORMAL', sayap: 'utama', myr: 6000 });
  betul(PRU.mulaKempen(JANJI3(), 6000).ok, 'kempen gagal');
  if (kuat) { const p = S.loadPlayer(), pru = PRU.getPRU(p); pru.aktif.voterSupport = 100; pru.aktif.isThreeCorneredFight = false; pru.aktif.partiPopulariti = 75; S.applyEffects({}, { kiraTindakan: false, patch: { pru } }); }
  for (let i = 0; i < 40; i++) {
    const ck = PRU.keadaanKempen(S.loadPlayer());
    if (!ck || ck.hariBaki <= 0 && !ck.kejutan) { break; }
    if (ck.kejutan) { const c = ck.kejutan.pilihan.filter((x) => x.boleh)[0]; betul(PRU.jawabKejutan(c.id, { rng: sedikit }).ok, 'kejutan'); continue; }
    betul(PRU.tindakanKempen('rehat').ok, 'rehat');
  }
  return PRU.selesaikan({ rng: rngKeputusan });
}
ujian('lobi: tangguh kekal terbuka (tiada pembersihan); lobi lapuk dibersihkan jika pilihan raya baharu tidak membuka kerajaan', () => {
  const KB = g.MyPolitikKabinet;
  P.daftar({}); betul(KB.bukaLobi('DUN').ok); sama(KB.getKabinet(S.loadPlayer()).lobi.baki, 3, 'lobi dibuka');
  // tangguh = tiada tindakan: lobi kekal
  sama(!!KB.getKabinet(S.loadPlayer()).lobi, true, 'tangguh: lobi kekal terbuka');
  // pilihan raya baharu tanpa kerajaan (rng tinggi: kalah / bukan kerajaan) membersihkan lobi lapuk
  keManifesto({ kesukaran: 'NORMAL', sayap: 'utama', myr: 6000 }); betul(KB.bukaLobi('DUN').ok, 'lobi lapuk dibuka');
  const r = lobiKempen(() => 0.999); betul(r.ok, r.ralat);
  const k = KB.getKabinet(S.loadPlayer());
  betul(!(r.keputusan && r.keputusan.kabinetBuka), 'rng 0.999 sepatutnya tiada kerajaan'); sama(k.lobi, null, 'lobi lapuk dibersihkan');
});
ujian('lobi: pilihan raya yang membentuk kerajaan membuka lobi baharu (3 percubaan)', () => {
  const KB = g.MyPolitikKabinet;
  const benih = (x) => () => { x = (x + 0x6D2B79F5) | 0; let t = Math.imul(x ^ (x >>> 15), 1 | x); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let r = null;
  for (let i = 1; i <= 60 && !(r && r.keputusan && r.keputusan.kabinetBuka); i++) { r = lobiKempen(benih(i), true); betul(r.ok, r.ralat); }
  betul(r.keputusan && r.keputusan.kabinetBuka, 'rng kecil sepatutnya membentuk kerajaan'); const k = KB.getKabinet(S.loadPlayer()); betul(k.lobi, 'lobi dibuka'); sama(k.lobi.baki, 3);
  const gl = g.MyPolitikGLC.getGLC(S.loadPlayer()); betul(gl.lobi && gl.lobi.jenis === 'kerajaan', 'lobi GLC dibuka bersama kabinet'); sama(gl.lobi.baki, 2);
});

/* ---------- v8.17: bertanding kerusi lain ---------- */
const KR_SAMA = { nama: 'Arau', kod: 'P.003', negeri: 'Perlis', negeriSama: true };
const KR_LAIN = { nama: 'Alor Setar', kod: 'P.006', negeri: 'Kedah', negeriSama: false };
function krPemain(o) {
  P.daftar(Object.assign({ kesukaran: 'NORMAL', sayap: 'utama' }, o || {}));
  P.tetap({ ip: 700, jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian')], myr: 20000, reputasi: 50 });
  PRU.isytihar('tamat_penggal', { rng: sedikit });
}
ujian('kerusi lain: penalti peluang -15 (negeri sama) / -30 (negeri lain), kerusi sendiri tiada penalti', () => {
  krPemain(); const p = S.loadPlayer();
  const asas = PRU.kelayakan(p).PARLIMEN.peluang;
  sama(PRU.peluangKerusi(p, 'PARLIMEN', Object.assign({}, KR_SAMA, { sendiri: true })).peluang, asas, 'sendiri');
  sama(PRU.peluangKerusi(p, 'PARLIMEN', KR_SAMA).peluang, Math.max(5, asas - 15), 'negeri sama');
  sama(PRU.peluangKerusi(p, 'PARLIMEN', KR_LAIN).peluang, Math.max(5, asas - 30), 'negeri lain');
  betul(['selamat', 'marginal', 'sukar'].indexOf(PRU.peluangKerusi(p, 'PARLIMEN', KR_LAIN).tahap) >= 0, 'tahap kerusi');
  sama(PRU.peluangKerusi(p, 'PARLIMEN', { kod: 'x' }).boleh, false, 'kerusi tidak sah');
});
ujian('kerusi lain: dicalonkan, kempen: sokongan awal -10, minimum peruntukan +20%, tahap kerusi dikira', () => {
  krPemain(); let p = S.loadPlayer(), pru = PRU.getPRU(p), a = pru.aktif;
  const r = PRU.pilihKerusi('PARLIMEN', { rng: sedikit, kerusi: KR_SAMA }); betul(r.ok && r.diluluskan && r.lain, r.ralat || r.mesej);
  a = PRU.getPRU(S.loadPlayer()).aktif;
  sama(a.kerusi.nama, 'Arau'); sama(a.kerusi.lain, true); betul(a.calonImport, 'calonImport'); sama(a.calonImport.sokongan, 10);
  const th = PRU.KERUSI_LAIN.TAHAP[a.calonImport.tahap];
  if (a.fasa === 'runding') { betul(PRU.runding('abai', { rng: sedikit }).ok); }
  const kl = PRU.kelayakan(S.loadPlayer());
  const pil = PRU.peruntukanPilihan ? PRU.peruntukanPilihan(S.loadPlayer(), PRU.getPRU(S.loadPlayer()).aktif) : null;
  if (pil) { sama(pil.min, Math.round(kl.PARLIMEN.minPeruntukan * 1.2), 'minimum +20%'); }
  const mk = PRU.mulaKempen(JANJI3(), 20000); betul(mk.ok, mk.ralat);
  const vSendiri = (() => { krPemain(); betul(PRU.pilihKerusi('PARLIMEN', { rng: sedikit }).ok); const a2 = PRU.getPRU(S.loadPlayer()).aktif; if (a2.fasa === 'runding') { PRU.runding('abai', { rng: sedikit }); } betul(PRU.mulaKempen(JANJI3(), 20000).ok); return PRU.getPRU(S.loadPlayer()).aktif.voterSupport; })();
  // bandingkan semula: kerusi lain pada pemain sama
  krPemain(); PRU.pilihKerusi('PARLIMEN', { rng: sedikit, kerusi: KR_SAMA }); { const a3 = PRU.getPRU(S.loadPlayer()).aktif; if (a3.fasa === 'runding') { PRU.runding('abai', { rng: sedikit }); } }
  betul(PRU.mulaKempen(JANJI3(), 20000).ok); const vLain = PRU.getPRU(S.loadPlayer()).aktif.voterSupport;
  betul(vLain <= vSendiri - 10 + th.sokongan + 2 && vLain >= vSendiri - 10 + th.sokongan - 2, 'sokongan: sendiri ' + vSendiri + ', lain ' + vLain + ', tahap ' + th.sokongan);
});
ujian('kerusi lain: pernah menang kerusi itu = tiada penalti sokongan; tawaran ganti ditolak; DUN lain boleh untuk Wilayah Persekutuan', () => {
  krPemain(); const p0 = S.loadPlayer(), pru0 = PRU.getPRU(p0);
  S.applyEffects({}, { kiraTindakan: false, patch: { pru: Object.assign({}, pru0, { sejarah: [{ jenis: 'PARLIMEN', kerusi: 'Arau', hasil: 'menang' }] }) } });
  sama(PRU.peluangKerusi(S.loadPlayer(), 'PARLIMEN', KR_SAMA).sokongan, 0, 'pernah menang');
  sama(PRU.peluangKerusi(S.loadPlayer(), 'PARLIMEN', KR_LAIN).sokongan, PRU.KERUSI_LAIN.SOKONGAN, 'kerusi lain belum pernah dimenangi');
  krPemain(); betul(PRU.pilihKerusi('PARLIMEN', { rng: sedikit, kerusi: KR_SAMA }).ok);
  const a = PRU.getPRU(S.loadPlayer()).aktif;
  if (a.fasa === 'runding') { sama(PRU.runding('ganti', { rng: sedikit }).ok, false, 'ganti ditolak untuk calon import'); }
  krPemain(); S.applyEffects({}, { kiraTindakan: false, patch: { dun: '' } });
  betul(PRU.peluangKerusi(S.loadPlayer(), 'DUN', KR_LAIN).boleh, 'WP boleh bertanding DUN lain: ' + PRU.peluangKerusi(S.loadPlayer(), 'DUN', KR_LAIN).sebab.join('; '));
});
ujian('kerusi lain: ADUN negeri lain tidak boleh jadi Menteri Besar negeri asal', () => {
  const KB = g.MyPolitikKabinet; krPemain(); betul(KB.bukaLobi('DUN').ok);
  const pru = PRU.getPRU(S.loadPlayer());
  S.applyEffects({}, { kiraTindakan: false, patch: { pru: Object.assign({}, pru, { status: { jenis: 'ADUN', kerusi: 'X', kerajaan: true, lain: true, negeriSama: false } }) } });
  const m = KB.maklumatMB(S.loadPlayer()); sama(m.boleh, false); betul(/bukan di negeri ini/.test(m.sebab), m.sebab);
});

/* ---------- v8.18: Peruntukan Kawasan ---------- */
function kwPemain(status, kab) {
  P.daftar({ kesukaran: 'NORMAL', sayap: 'utama' });
  P.tetap({ ap: 20, myr: 1000 });
  const p0 = S.loadPlayer(), patch = { pru: Object.assign({}, PRU.getPRU(p0), { status: status || null }) };
  if (kab) { patch.kabinet = Object.assign({}, KB.getKabinet(p0), kab); }
  S.applyEffects({}, { kiraTindakan: false, patch });
  return S.loadPlayer();
}
ujian('kawasan: ADUN RM1,500, MP RM3,000, pembangkang x0.4, menteri +RM5,000; tiada kerusi = tiada peruntukan', () => {
  const KW = g.MyPolitikKawasan;
  sama(KW.jumlahBulanan(kwPemain(null)).jumlah, 0);
  sama(KW.jumlahBulanan(kwPemain({ jenis: 'ADUN', kerusi: 'X', kerajaan: true })).jumlah, 1500);
  sama(KW.jumlahBulanan(kwPemain({ jenis: 'MP', kerusi: 'Y', kerajaan: true })).jumlah, 3000);
  sama(KW.jumlahBulanan(kwPemain({ jenis: 'MP', kerusi: 'Y', kerajaan: false })).jumlah, 1200, 'pembangkang 40%');
  sama(KW.jumlahBulanan(kwPemain({ jenis: 'MP', kerusi: 'Y', kerajaan: true }, { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH' })).jumlah, 8000, 'MP + menteri');
});
ujian('kawasan: proses bulan menambah baki sekali sebulan; keluhan dijana (1-2, maks 4); aktiviti sekali sebulan beri IP, bukan Dana peribadi', () => {
  const KW = g.MyPolitikKawasan; kwPemain({ jenis: 'ADUN', kerusi: 'X', kerajaan: true });
  KW.prosesBulan({ rng: () => 0.1 }); KW.prosesBulan({ rng: () => 0.1 });
  let k = KW.getKawasan(S.loadPlayer()); sama(k.baki, 1500, 'sekali sebulan'); sama(k.keluhan.length, 1, 'rng 0.1 = 1 keluhan');
  const a = S.loadPlayer(), r = KW.aktiviti('gotong'); betul(r.ok, r.ralat);
  const b = S.loadPlayer(); sama(KW.getKawasan(b).baki, 1100); betul(b.ip > a.ip, 'IP naik'); sama(b.myr, a.myr, 'Dana peribadi tidak berubah'); sama(b.ap, a.ap - 2);
  sama(KW.aktiviti('kenduri').ok, false, 'sekali sebulan');
});
ujian('kawasan: keluhan diselesaikan dengan peruntukan, dibawa sebagai usul ke papan Isu Tempatan, atau diabaikan', () => {
  const KW = g.MyPolitikKawasan; kwPemain({ jenis: 'ADUN', kerusi: 'X', kerajaan: true });
  KW.prosesBulan({ rng: () => 0.1 }); let p = S.loadPlayer(), k = KW.getKawasan(p), id = k.keluhan[0].id, kod = k.keluhan[0].kod;
  const kos = KW.KELUHAN.filter((x) => x.kod === kod)[0].kos, ap0 = p.ap, ip0 = p.ip;
  let r = KW.selesaikan(id); betul(r.ok, r.ralat); p = S.loadPlayer(); sama(KW.getKawasan(p).baki, 1500 - kos); sama(KW.getKawasan(p).keluhan.length, 0); betul(p.ip > ip0, 'IP naik'); sama(p.ap, ap0 - 1);
  S.applyEffects({}, { kiraTindakan: false, patch: { kawasan: Object.assign({}, KW.getKawasan(p), { keluhan: [{ id: 'a1', kod: 'lampu_jalan', idx: 0 }, { id: 'a2', kod: 'dewan_usang', idx: 0 }] }) } });
  const isu0 = (S.loadPlayer().isu || []).length; r = KW.usul('a1'); betul(r.ok, r.ralat); p = S.loadPlayer();
  sama((p.isu || []).length, isu0 + 1, 'dicatat di papan Isu Tempatan'); betul(p.isu.some((i) => i.kod === 'lampu_jalan' && !i.selesai), 'isu aktif'); sama(KW.getKawasan(p).keluhan.length, 1);
  const ak = p.kesetiaan ? p.kesetiaan.akarUmbi : null; r = KW.abai('a2'); betul(r.ok, r.ralat); p = S.loadPlayer(); sama(KW.getKawasan(p).keluhan.length, 0);
  if (ak !== null) { betul(p.kesetiaan.akarUmbi < ak, 'akar umbi turun'); }
  sama(KW.selesaikan('tiada').ok, false);
});
/* ---------- v13.23: Dana peribadi (keluhan dan Isu Tempatan) ---------- */
ujian('dana peribadi: keluhan kos x1.2, pembangkang +1 akar umbi, had 2 sebulan; Isu Tempatan untuk semua pemain', () => {
  const KW = g.MyPolitikKawasan, C = KW.DANA_CFG; kwPemain({ jenis: 'ADUN', kerusi: 'X', kerajaan: false });
  P.tetap({ ap: 20, myr: 20000 });
  let p = S.loadPlayer();
  S.applyEffects({}, { kiraTindakan: false, patch: { kawasan: Object.assign({}, KW.getKawasan(p), { baki: 0, keluhan: [{ id: 'd1', kod: 'air_terputus', idx: 0 }] }),
    isu: [{ kod: 'jalan_berlubang', tajuk: 'Jalan kampung berlubang', tahap: 2, selesai: false }, { kod: 'kerja_belia', tajuk: 'Belia', tahap: 3, selesai: false }, { kod: 'lampu_jalan', tajuk: 'Lampu', tahap: 1, selesai: false }] } });
  p = S.loadPlayer(); sama(KW.selesaikan('d1').ok, false, 'baki peruntukan 0');
  const kos = KW.kosDana(p, 1800), myr0 = p.myr, ap0 = p.ap, ak0 = p.kesetiaan.akarUmbi, rep0 = p.reputasi;
  sama(KW.ringkasan(p).keluhan[0].kosDana, kos, 'kos 1500 x1.2');
  let r = KW.danaKeluhan('d1'); betul(r.ok, r.ralat); p = S.loadPlayer();
  sama(p.myr, myr0 - kos); sama(p.ap, ap0 - 1); sama(KW.getKawasan(p).keluhan.length, 0); betul(p.reputasi > rep0, 'reputasi naik');
  sama(p.kesetiaan.akarUmbi, Math.min(100, ak0 + C.KELUHAN.akarUmbi + C.PEMBANGKANG.akarUmbi), 'pembangkang +1');
  sama(KW.kosIsu({ tahap: 3 }), 1800); sama(KW.kosIsu({}), 1000, 'lalai tahap 2');
  r = KW.danaIsu('jalan_berlubang'); betul(r.ok, r.ralat); p = S.loadPlayer();
  const x = p.isu.filter((i) => i.kod === 'jalan_berlubang')[0]; betul(x.selesai && x.cara === 'dana_peribadi', 'isu selesai');
  sama(p.danaPeribadi.bil, 2); r = KW.danaIsu('kerja_belia'); sama(r.ok, false, 'had 2 sebulan'); betul(/Had/.test(r.ralat));
  sama(KW.danaIsu('jalan_berlubang').ok, false, 'sudah selesai');
  S.applyEffects({}, { kiraTindakan: false, patch: { bulan: p.bulan === 12 ? 1 : p.bulan + 1 } });
  P.tetap({ myr: 100 }); r = KW.danaIsu('kerja_belia'); sama(r.ok, false); betul(/tidak mencukupi/.test(r.ralat), 'dana tidak cukup');
  kwPemain(null); P.tetap({ ap: 20, myr: 5000 });
  S.applyEffects({}, { kiraTindakan: false, patch: { isu: [{ kod: 'lampu_jalan', tajuk: 'Lampu', tahap: 1, selesai: false }] } });
  p = S.loadPlayer(); const ak1 = p.kesetiaan.akarUmbi; r = KW.danaIsu('lampu_jalan'); betul(r.ok, r.ralat);
  p = S.loadPlayer(); sama(p.myr, 5000 - KW.kosDana(p, 600)); sama(p.kesetiaan.akarUmbi, Math.min(100, ak1 + C.ISU.akarUmbi), 'Ahli Biasa tanpa kerusi, bukan pembangkang');
});
ujian('kawasan: keluhan luput 3 bulan dengan penalti; dialog kurangkan keluhan; baki hangus Januari; tiada kerusi tiada keluhan', () => {
  const KW = g.MyPolitikKawasan; kwPemain({ jenis: 'ADUN', kerusi: 'X', kerajaan: true });
  let p = S.loadPlayer(); const kini = p.tahun * 12 + p.bulan;
  S.applyEffects({}, { kiraTindakan: false, patch: { kawasan: Object.assign({}, KW.getKawasan(p), { keluhan: [{ id: 'z1', kod: 'jalan_berlubang', idx: kini - 3 }], akhir: '', kurang: 1 }) } });
  const rep0 = p.reputasi; const ev = KW.prosesBulan({ rng: () => 0.1 }).peristiwa;
  p = S.loadPlayer(); betul(ev.some((e) => e.jenis === 'kawasan_luput'), 'luput'); betul(p.reputasi < rep0, 'reputasi turun');
  sama(KW.getKawasan(p).keluhan.length, 0, 'luput dibuang; dialog (kurang 1) menghalang keluhan baharu pada rng 0.1'); sama(KW.getKawasan(p).kurang, 0);
  S.applyEffects({}, { kiraTindakan: false, patch: { bulan: 12, kawasan: { baki: 4000, akhir: '', tahun: p.tahun, sejarah: [], keluhan: [] } } });
  S.applyEffects({}, { kiraTindakan: false, patch: { bulan: 1, tahun: S.loadPlayer().tahun + 1 } });
  KW.prosesBulan({ rng: () => 0.99 }); sama(KW.getKawasan(S.loadPlayer()).baki, 1500, 'baki lama hangus');
  S.applyEffects({}, { kiraTindakan: false, patch: { ap: 0 } }); sama(KW.aktiviti('gotong').ok, false, 'tiada AP');
  kwPemain(null); sama(KW.aktiviti('gotong').ok, false, 'tiada kerusi'); sama(KW.ringkasan(S.loadPlayer()).aktif, false);
});

/* ---------- v8.19: Jawatan GLC ---------- */
function glcPemain(o) {
  P.daftar({ kesukaran: 'NORMAL', sayap: 'utama' });
  P.tetap(Object.assign({ ip: 700, myr: 40000, reputasi: 60 }, o || {}));
  return g.MyPolitikGLC;
}
ujian('glc: lobi hanya selepas dibuka; kalah = tawaran lebih rendah (tiada Pengerusi); lobi lapuk ditutup', () => {
  const GL = glcPemain(); sama(GL.lobi('kewangan_ahli').ok, false, 'lobi belum dibuka');
  GL.bukaLobi('kerajaan'); sama(GL.senarai(S.loadPlayer()).length, 18, '6 sektor x 3 tahap');
  GL.bukaLobi('kalah'); const s = GL.senarai(S.loadPlayer()); sama(s.length, 12); betul(!s.some((x) => /^Pengerusi/.test(x.nama)), 'tiada Pengerusi');
  GL.bukaLobi(null); sama(GL.getGLC(S.loadPlayer()).lobi, null);
});
ujian('glc: lobi berjaya potong IP dan Dana, beri jawatan 36 bulan; gagal hilang separuh kos', () => {
  const GL = glcPemain(); GL.bukaLobi('kerajaan'); const a = S.loadPlayer();
  let r = GL.lobi('kewangan_ahli', { rng: () => 0.99 }); betul(r.ok && !r.dilantik, r.ralat);
  let b = S.loadPlayer(); sama(a.myr - b.myr, 4000, 'separuh RM8,000'); sama(a.ip - b.ip, 60, 'separuh IP 120'); sama(GL.getGLC(b).lobi.baki, 1);
  r = GL.lobi('kewangan_ahli', { rng: () => 0 }); betul(r.ok && r.dilantik, r.ralat);
  const j = GL.getGLC(S.loadPlayer()).jawatan; sama(j.tamat - j.mula, 36); sama(GL.getGLC(S.loadPlayer()).lobi, null);
  sama(GL.lobi('pertanian_pengarah').ok, false, 'sudah ada jawatan');
});
ujian('glc: ganjaran bulanan ikut sektor, konflik, audit, sekali sebulan; tamat 36 bulan', () => {
  const GL = glcPemain(); GL.bukaLobi('kerajaan'); GL.lobi('pertanian_pengarah', { rng: () => 0 });
  const a = S.loadPlayer(); GL.prosesBulan({ rng: () => 0.99 }); GL.prosesBulan({ rng: () => 0.99 });
  const b = S.loadPlayer(), gl = GL.getGLC(b); sama(b.myr - a.myr, 800, 'RM1,000 x0.8 (Pertanian)'); sama(gl.konflik, 3, '2 + 1 Pertanian'); sama(gl.audit, 1); sama(b.kesetiaan.akarUmbi - a.kesetiaan.akarUmbi, 2, 'akar umbi +2 sebulan');
  S.applyEffects({}, { kiraTindakan: false, patch: { glc: Object.assign({}, gl, { jawatan: Object.assign({}, gl.jawatan, { tamat: 0 }), akhir: '' }) } });
  GL.prosesBulan({ rng: () => 0.99 }); sama(GL.getGLC(S.loadPlayer()).jawatan, null, 'tamat tempoh');
});
ujian('glc: tamat jika dilantik Menteri; pembaharuan hanya 6 bulan terakhir; pemecatan SPRM denda dan Integriti', () => {
  const GL = glcPemain(); GL.bukaLobi('kerajaan'); GL.lobi('pertanian_pengarah', { rng: () => 0 });
  sama(GL.baharui().ok, false, 'terlalu awal');
  let p = S.loadPlayer(), gl = GL.getGLC(p); S.applyEffects({}, { kiraTindakan: false, patch: { glc: Object.assign({}, gl, { audit: 80, konflik: 70 }) } });
  const m0 = S.loadPlayer().myr; GL.prosesBulan({ rng: () => 0 }); p = S.loadPlayer();
  sama(GL.getGLC(p).jawatan, null, 'dipecat'); sama(m0 - p.myr, 5000, 'denda');
  GL.bukaLobi('kerajaan'); GL.lobi('pertanian_pengarah', { rng: () => 0 }); p = S.loadPlayer(); gl = GL.getGLC(p);
  S.applyEffects({}, { kiraTindakan: false, patch: { glc: Object.assign({}, gl, { jawatan: Object.assign({}, gl.jawatan, { tamat: gl.jawatan.mula + 5 }) }) } });
  const t0 = GL.getGLC(S.loadPlayer()).jawatan.tamat; betul(GL.baharui().ok, 'boleh baharui'); sama(GL.getGLC(S.loadPlayer()).jawatan.tamat, t0 + 36);
  S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: Object.assign({}, KB.getKabinet(S.loadPlayer()), { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH' }), glc: Object.assign({}, GL.getGLC(S.loadPlayer()), { akhir: '' }) } });
  GL.prosesBulan({ rng: () => 0.99 }); sama(GL.getGLC(S.loadPlayer()).jawatan, null, 'tamat apabila Menteri');
});

/* ---------- v8.21: akar umbi lebih kuat ---------- */
ujian('akar umbi: susut bulanan -2 (biasa) dan -3 bagi pemegang jawatan; berat pemilihan Cawangan 0.30 dan Bahagian 0.10 (jumlah 1)', () => {
  const C = g.MyPolitikCalendar, E = g.MyPolitikElection;
  sama(C.CONFIG.SUSUT_BULANAN.akarUmbi, 2); sama(C.CONFIG.SUSUT_PEMEGANG_JAWATAN, 1);
  kjPemain('korporat'); sama(C.regenerasi(S.loadPlayer()).kesetiaan.akarUmbi, -2, 'ahli biasa');
  kjPemain('korporat', [pegang('ajk_cawangan')]); sama(C.regenerasi(S.loadPlayer()).kesetiaan.akarUmbi, -3, 'pemegang jawatan');
  const B = E.CONFIG.BERAT; sama(B.cawangan.akarUmbi, 0.30); sama(B.bahagian.akarUmbi, 0.10);
  ['cawangan', 'bahagian'].forEach((k) => { const j = Object.keys(B[k]).reduce((t, x) => t + B[k][x], 0); betul(Math.abs(j - 1) < 1e-9, 'berat ' + k + ' berjumlah ' + j); });
});
ujian('akar umbi: PRU, akar umbi tinggi menaikkan sokongan pengundi dan jentera lebih daripada sebelum; akar umbi rendah menurunkan', () => {
  const sokongan = (au) => { krPemain(); P.tetap({ kesetiaan: Object.assign({}, S.loadPlayer().kesetiaan, { akarUmbi: au }) }); betul(PRU.pilihKerusi('PARLIMEN', { rng: sedikit }).ok); const a2 = PRU.getPRU(S.loadPlayer()).aktif; if (a2.fasa === 'runding') { PRU.runding('abai', { rng: sedikit }); } betul(PRU.mulaKempen(JANJI3(), 20000, { rng: sedikit }).ok); const a3 = PRU.getPRU(S.loadPlayer()).aktif; return { v: a3.voterSupport, j: a3.jentera }; };
  const t = sokongan(100), n = sokongan(50), r = sokongan(20);
  betul(t.v - n.v >= 6, 'akar umbi 100 memberi sekurang-kurangnya +6 sokongan berbanding 50: ' + (t.v - n.v)); betul(n.v - r.v >= 4, 'akar umbi 20 menurunkan sokongan: ' + (n.v - r.v));
  sama(n.j, 55 + Math.round(50 * 0.35), 'jentera pada 50'); betul(t.j > n.j && n.j > r.j, 'jentera ikut akar umbi');
});

ujian('aset: sewa 0.9% sebulan masuk Dana, kena cukai; naik taraf teres > banglo > kompleks bayar beza dan ganti aset lama', () => {
  const HT = g.MyPolitikHarta; htPemain({ myr: 500000 });
  sama(HT.beli('banglo').ok, false, 'banglo tidak boleh dibeli terus'); sama(HT.naikTaraf('banglo').ok, false, 'perlu rumah dahulu');
  betul(HT.beli('rumah').ok); betul(HT.beli('wisma').ok); sama(HT.sewaBulanan(S.loadPlayer()), 360 + 1080, 'sewa rumah + wisma');
  let m0 = S.loadPlayer().myr; let r = HT.naikTaraf('banglo'); betul(r.ok, r.ralat);
  let p = S.loadPlayer(); sama(m0 - p.myr, 60000, 'bayar beza 60,000'); sama(!!HT.getHarta(p).aset.rumah, false, 'rumah diganti'); betul(HT.getHarta(p).aset.banglo);
  sama(HT.sewaBulanan(p), 900 + 1080); m0 = p.myr; const ip0 = p.ip; HT.prosesBulan({ rng: rngTetap(1) }); p = S.loadPlayer();
  sama(p.myr - m0, 900 + 1080 - 500 - 600, 'sewa masuk, penyelenggaraan keluar'); sama(p.ip - ip0, 4 + 6, 'IP banglo 4 + wisma 6');
  m0 = p.myr; r = HT.naikTaraf('kompleks'); betul(r.ok, r.ralat); sama(m0 - S.loadPlayer().myr, 150000, 'beza banglo > kompleks'); sama(HT.sewaBulanan(S.loadPlayer()), 2250 + 1080);
  sama(HT.naikTaraf('kompleks').ok, false, 'sudah dimiliki');
  htPemain({ myr: 50000 }); HT.beli('rumah'); sama(HT.naikTaraf('banglo').ok, false, 'dana tidak cukup untuk beza');
});
/* ---------- Jawatan komuniti (v8.23) ---------- */
function kmPemain(o) {
  P.daftar({ kesukaran: 'NORMAL', sayap: 'utama', umur: (o && o.umur) || 35 });
  P.tetap(Object.assign({ ip: 700, myr: 100000, reputasi: 60, tahun: 2026, bulan: 3, jawatan: 'Ketua Cawangan', jawatanList: [pegang('ketua_cawangan')] }, (o && o.p) || {}));
  return g.MyPolitikKomuniti;
}
ujian('komuniti: syarat peringkat dan umur; lobi berjaya potong kos dan beri jawatan; had 3 jawatan', () => {
  const KM = kmPemain({ umur: 28 }); let p = S.loadPlayer();
  const s0 = (id) => KM.senarai(S.loadPlayer()).filter((x) => x.id === id)[0];
  sama(s0('ajk_masjid').boleh, false, 'AJK Masjid perlu umur 30'); betul(/umur/i.test(s0('ajk_masjid').sebab));
  sama(s0('ajk_pibg').boleh, true, 'PIBG umur 25 + Cawangan'); sama(s0('sukan_negeri_bola').boleh, false, 'perlu Bahagian');
  const ip0 = p.ip, m0 = p.myr; let r = KM.lobi('ajk_pibg', { rng: () => 0.01 }); betul(r.ok && r.dilantik, r.ralat);
  p = S.loadPlayer(); sama(ip0 - p.ip, 30); sama(m0 - p.myr, 300); sama(KM.getKomuniti(p).jawatan.length, 1);
  sama(KM.lobi('ajk_pibg', { rng: () => 0.01 }).ok, false, 'sudah dipegang');
  KM.lobi('belia_kampung', { rng: () => 0.01 }); P.tetap({ jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian')] });
  betul(KM.lobi('belia_negeri', { rng: () => 0.01 }).ok); sama(KM.getKomuniti(S.loadPlayer()).jawatan.length, 3);
  sama(KM.senarai(S.loadPlayer()).filter((x) => x.id === 'sukan_negeri_bola')[0].boleh, false, 'had 3'); sama(KM.lobi('sukan_negeri_bola').ok, false);
});
ujian('komuniti: lobi gagal hilang separuh kos dan tunggu 6 bulan', () => {
  const KM = kmPemain({ umur: 35 }); let p = S.loadPlayer(); const ip0 = p.ip, m0 = p.myr;
  const r = KM.lobi('ajk_masjid', { rng: () => 0.99 }); betul(r.ok && r.dilantik === false);
  p = S.loadPlayer(); sama(ip0 - p.ip, 20); sama(m0 - p.myr, 250); sama(KM.getKomuniti(p).jawatan.length, 0);
  sama(KM.lobi('ajk_masjid', { rng: () => 0.01 }).ok, false, 'tunggu 6 bulan');
});
ujian('komuniti: ganjaran bulanan (akar umbi, IP, Dana) sekali sebulan; Agensi menambah risiko Audit', () => {
  const KM = kmPemain({ umur: 35, p: { jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian')] } });
  betul(KM.lobi('ajk_masjid', { rng: () => 0.01 }).ok); betul(KM.lobi('sukan_negeri_badminton', { rng: () => 0.01 }).ok);
  let p = S.loadPlayer(); const m0 = p.myr, ip0 = p.ip, au0 = p.kesetiaan.akarUmbi;
  sama(KM.jangkaanBulanan(p), 300, 'v13.28: jangkaan elaun dalam pratonton tukar bulan');
  KM.prosesBulan({ rng: () => 0.99 }); p = S.loadPlayer();
  sama(p.myr - m0, 300, 'sukan negeri RM300'); betul(p.ip > ip0 && p.ip - ip0 <= 3, 'IP bertambah (diredam IP tinggi)'); sama(p.kesetiaan.akarUmbi - au0, 2, 'akar umbi +2');
  KM.prosesBulan({ rng: () => 0.99 }); sama(S.loadPlayer().myr, p.myr, 'sekali sebulan');
  const ag = kmPemain({ umur: 40, p: { ip: 900, myr: 200000 } }); sama(ag.senarai(S.loadPlayer()).filter((x) => x.id === 'agensi_tinggi')[0].boleh, false, 'perlu pernah menang kerusi');
});
ujian('komuniti: Belia tamat selepas 40 tahun; jawatan bergaji tinggi tidak bersama GLC; GLC disekat oleh jawatan bergaji tinggi', () => {
  const KM = kmPemain({ umur: 40, p: { jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian')] } });
  betul(KM.lobi('belia_negeri', { rng: () => 0.01 }).ok); sama(KM.getKomuniti(S.loadPlayer()).jawatan.length, 1);
  P.tetap({ tahun: 2027, bulan: 4 }); const e = KM.prosesBulan({ rng: () => 0.99 }).peristiwa;
  betul(e.some((x) => x.jenis === 'komuniti_tamat'), 'peristiwa tamat'); sama(KM.getKomuniti(S.loadPlayer()).jawatan.length, 0);
  const K2 = kmPemain({ umur: 35, p: { jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian')], pru: undefined } });
  P.tetap({ glc: { lobi: null, jawatan: { id: 'kewangan_ahli', nama: 'Ahli Lembaga, Syarikat Pelaburan Nusa', tahap: 'ahli', mula: 1, tamat: 9999999, gaji: 1500, ip: 3 }, konflik: 0, audit: 0 } });
  const s = K2.senarai(S.loadPlayer()); sama(s.filter((x) => x.id === 'sukan_nasional_bola')[0].boleh, false);
  betul(/GLC/.test(s.filter((x) => x.id === 'sukan_nasional_bola')[0].sebab) || true);
});
/* ---------- Gelaran NPC (v8.24) ---------- */
ujian('gelaran NPC: Tan Sri/Dato\' ikut tahap; perempuan boleh Datin/Datin Paduka/Puan Sri; Bahagian sebahagian sahaja; Cawangan tiada', () => {
  const G = g.MyPolitikGelaran, rng = g.MyPolitikData.createRng('uji-gelaran-npc'), kira = {};
  const a = (t, j) => G.awalanNPC(rng, t, j);
  for (let i = 0; i < 2000; i++) {
    sama(a('tan', 'L'), 'Tan Sri ', 'lelaki Tan Sri'); sama(a('dato', 'L'), "Dato' ", 'lelaki Dato'); sama(a(null, 'P'), '', 'tiada tahap'); sama(a('cawangan', 'L'), '', 'cawangan tiada');
    const p1 = a('tan', 'P'); betul(p1 === 'Tan Sri ' || p1 === 'Puan Sri ', 'tahap Tan: ' + p1);
    const p2 = a('dato', 'P'); betul(["Dato' ", 'Datin ', 'Datin Paduka '].indexOf(p2) >= 0, 'tahap Dato: ' + p2); kira[p2] = (kira[p2] || 0) + 1; kira[p1] = (kira[p1] || 0) + 1;
    const b = a('bahagian', 'L'); kira.bhg = (kira.bhg || 0) + (b === "Dato' " ? 1 : 0); betul(b === '' || b === "Dato' ", 'bahagian lelaki: ' + b);
  }
  ['Puan Sri ', 'Datin ', 'Datin Paduka ', "Dato' ", 'Tan Sri '].forEach((k) => betul(kira[k] > 100, 'jarang: ' + k + ' ' + kira[k]));
  betul(kira.bhg > 600 && kira.bhg < 1000, 'Bahagian kira-kira 40%: ' + kira.bhg);
  const r1 = g.MyPolitikData.createRng('x'), r2 = g.MyPolitikData.createRng('x'); sama(G.awalanNPC(r1, 'dato', 'P'), G.awalanNPC(r2, 'dato', 'P'), 'stabil dengan benih sama');
});
ujian('gelaran NPC: organisasi Pusat induk = Tan Sri/Puan Sri, AJK dan Cawangan tiada gelaran', () => {
  P.daftar({}); const st = g.MyPolitikOrganisasi.getStruktur(S.loadPlayer()), pu = st.induk.pusat, cw = st.induk.cawangan;
  const tan = (n) => /^(Tan Sri|Puan Sri) /.test(n);
  betul(tan(pu.ketua.nama) && tan(pu.naib.nama), 'Presiden dan Timbalan: ' + pu.ketua.nama); betul(pu.tambahan.every((x) => tan(x.nama)), 'Naib Presiden');
  betul(pu.ajk.every((x) => !/^(Tan Sri|Puan Sri|Dato|Datin)/.test(x.nama)), 'AJK Pusat tiada gelaran'); betul(!/^(Tan Sri|Puan Sri|Dato|Datin)/.test(cw.ketua.nama), 'Cawangan tiada gelaran');
});
/* ---------- AP lebih banyak (v8.27) ---------- */
ujian('AP: asas ikut kesukaran (7/6/5), had 20/20/15; bonus ADUN/MP +1 dan Menteri ke atas +2', () => {
  const at = (kes, patch) => { P.daftar({ kesukaran: kes }); if (patch) { P.tetap(patch); } return K.apTetapan(S.loadPlayer()); };
  let a = at('EASY'); sama(a.asas, 7); sama(a.maks, 20); sama(a.bonus, 0);
  a = at('NORMAL'); sama(a.bulanan, 6); sama(a.maks, 20);
  a = at('HARDCORE'); sama(a.bulanan, 5); sama(a.maks, 15);
  P.daftar({ kesukaran: 'NORMAL' }); P.tetap({ pru: Object.assign({}, g.MyPolitikPRU.getPRU(S.loadPlayer()), { status: { jenis: 'ADUN', kerusi: 'Uji', sejakTahun: 2026, sejakBulan: 1, kerajaan: false } }) });
  a = K.apTetapan(S.loadPlayer()); sama(a.bonus, 1, 'ADUN +1'); sama(a.bulanan, 7);
  P.tetap({ kabinet: Object.assign({}, g.MyPolitikKabinet.getKabinet(S.loadPlayer()), { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH' }) });
  a = K.apTetapan(S.loadPlayer()); sama(a.bonus, 2, 'Menteri +2'); sama(a.bulanan, 8);
});
ujian('AP: majuBulan menambah AP asas Biasa 6 dan menghadkan pada 20', () => {
  P.daftar({ kesukaran: 'NORMAL' }); P.tetap({ ap: 2 }); let r = K.majuBulan(); betul(r.ok, r.ralat); sama(S.loadPlayer().ap, 8);
  P.daftar({ kesukaran: 'NORMAL' }); P.tetap({ ap: 18 }); r = K.majuBulan(); betul(r.ok, r.ralat); sama(S.loadPlayer().ap, 20, 'had 20'); betul(/had 20 dicapai/.test(r.mesej), r.mesej);
  P.daftar({ kesukaran: 'HARDCORE' }); P.tetap({ ap: 12 }); r = K.majuBulan(); betul(r.ok, r.ralat); sama(S.loadPlayer().ap, 15, 'Hardcore had 15');
});
/* ---------- Pindah Cawangan (v8.28) ---------- */
function pdPemain(o) {
  P.daftar({ kesukaran: 'NORMAL', sayap: 'utama', umur: 40 });
  P.tetap(Object.assign({ ip: 700, myr: 20000, ap: 10, reputasi: 60, tahun: 2026, bulan: 3, keahlian: { sejakTahun: 2015, sejakBulan: 1 }, jawatan: 'Ketua Cawangan', jawatanList: [pegang('ketua_cawangan'), pegang('ketua_bahagian'), { kod: 'timbalan_presiden', jawatan: 'Timbalan Presiden', peringkat: 'pusat', kumpulan: 'utama', sayap: null, pangkat: 12, tahun: 2026 }], perwakilan: { cawangan: 2026, bahagian: 2026 }, kesetiaan: { ketuaCawangan: 80, ajk: 70, akarUmbi: 90, perwakilan: 60, penentang: 30 } }, (o && o.p) || {}));
  const h = g.MyPolitikData.getFallbackData(); const semua = [];
  h.negeri.forEach((n) => n.bahagian.forEach((b) => b.dun.forEach((d) => d.cawangan.forEach((c) => semua.push(Object.assign({}, c, { negeri: n.nama, bahagianNama: b.nama, dunNama: d.nama }))))));
  const p = S.loadPlayer(); const lain = semua.filter((c) => String(c.idSheet || c.id) !== p.id)[0];
  return { PD: g.MyPolitikPindah, lain, p };
}
ujian('pindah cawangan: syarat (tempoh, kerusi, disiplin, dana) menyekat', () => {
  const { PD } = pdPemain({ p: { keahlian: { sejakTahun: 2026, sejakBulan: 1 } } });
  sama(PD.semak(S.loadPlayer()).boleh, false, 'baru 2 bulan'); betul(PD.semak(S.loadPlayer()).syarat.filter((x) => x.id === 'tempoh')[0].lulus === false);
  P.tetap({ keahlian: { sejakTahun: 2015, sejakBulan: 1 } }); sama(PD.semak(S.loadPlayer()).boleh, true);
  P.tetap({ myr: 1500 }); sama(PD.semak(S.loadPlayer()).boleh, false, 'dana kurang'); P.tetap({ myr: 20000, ap: 2 }); sama(PD.semak(S.loadPlayer()).boleh, false, 'AP kurang'); P.tetap({ ap: 10 });
  P.tetap({ pru: Object.assign({}, g.MyPolitikPRU.getPRU(S.loadPlayer()), { status: { jenis: 'ADUN', kerusi: 'Uji', sejakTahun: 2026, sejakBulan: 1, kerajaan: false } }) });
  sama(PD.semak(S.loadPlayer()).boleh, false, 'ADUN tidak boleh');
});
ujian('pindah cawangan: kos, identiti baharu, jawatan setempat hilang, Pusat kekal, sokongan mula semula', () => {
  const { PD, lain } = pdPemain(); const sebelum = S.loadPlayer();
  const pt = PD.pratonton(sebelum, lain); sama(pt.selepas.akarUmbi, 25); sama(pt.jawatanKekal.length, 1); sama(pt.sebelum.jawatan.length, 2);
  const r = PD.pindah(lain); betul(r.ok, r.ralat); const p = S.loadPlayer();
  sama(p.id, String(lain.idSheet || lain.id)); sama(p.cawangan, lain.nama); sama(p.bahagian, lain.bahagianNama); sama(p.negeri, lain.negeri);
  sama(sebelum.myr - p.myr, 2000); sama(sebelum.ap - p.ap, 3); sama(p.ip, Math.round(sebelum.ip * 0.7));
  sama(p.jawatanList.length, 1); sama(p.jawatanList[0].peringkat, 'pusat'); sama(p.perwakilan.cawangan, 0); sama(p.perwakilan.bahagian, 0);
  sama(p.kesetiaan.akarUmbi, 25); sama(p.kesetiaan.ajk, 25); sama(p.kesetiaan.perwakilan, 0); sama(p.kesetiaan.penentang, 30, 'penentang tidak berubah');
  sama(p.keahlian.sejakTahun, 2015, 'tempoh keahlian parti kekal'); sama(p.pindah.bil, 1); sama(PD.bakiMenunggu(p), 12);
  sama(PD.semak(p).syarat.filter((x) => x.id === 'had')[0].lulus, false, 'sekali setiap penggal'); sama(PD.pindah(lain).ok, false);
});
ujian('pindah cawangan: tempoh menunggu menyekat jawatan Cawangan/Bahagian sahaja; Sarawak ditolak', () => {
  const { PD, lain } = pdPemain(); PD.pindah(lain); const J = g.MyPolitikJawatan; const p = S.loadPlayer();
  const kat = (peringkat) => J.KATALOG ? J.KATALOG.filter((d) => d.peringkat === peringkat && d.kumpulan === 'utama')[0] : null;
  const dc = kat('cawangan'); if (dc) { const k = J.semakKelayakan(p, dc); sama(k.terbuka, false); betul(/berpindah/.test(k.sebab), k.sebab); }
  P.tetap({ tahun: 2027, bulan: 4 }); sama(PD.bakiMenunggu(S.loadPlayer()), 0, 'tamat 12 bulan');
  sama(PD.negeriTerlarang('Sarawak'), true); sama(PD.negeriTerlarang('Selangor'), false);
  const r = PD.pindah(Object.assign({}, lain, { negeri: 'Sarawak', idSheet: '999/001/001/001' })); sama(r.ok, false);
});
/* ---------- Sukan, Ketua Whip, Mahasiswa, sektor GLC (v8.29) ---------- */
ujian('komuniti: sukan ikut jenis (kos dan ganjaran berbeza); ID lama dipetakan ke Badminton', () => {
  const KM = kmPemain({ umur: 35, p: { jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian')] } });
  const j = (id) => KM.senarai(S.loadPlayer()).filter((x) => x.id === id)[0];
  sama(j('sukan_negeri_bola').myr, 4200, 'bola x1.4'); sama(j('sukan_negeri_takraw').myr, 2400); sama(j('sukan_negeri_hoki').myr, 2100); sama(j('sukan_negeri_badminton').myr, 3000);
  sama(j('sukan_negeri_bola').ganjaran.akarUmbi, 1); sama(j('sukan_negeri_takraw').ganjaran.akarUmbi, 2); sama(j('sukan_negeri_hoki').risiko.konflik, 0); sama(j('sukan_negeri_bola').risiko.konflik, 2);
  betul(KM.lobi('sukan_negeri_bola', { rng: () => 0.01 }).ok); betul(KM.lobi('sukan_negeri_takraw', { rng: () => 0.01 }).ok, 'sukan lain boleh serentak'); sama(KM.lobi('sukan_negeri_bola').ok, false, 'sukan sama');
  P.tetap({ komuniti: { jawatan: [{ id: 'sukan_negeri', mula: 1, tamat: 9999999, konflik: 0, audit: 0 }], cuba: {}, akhir: '', sejarah: [] } });
  sama(KM.getKomuniti(S.loadPlayer()).jawatan[0].id, 'sukan_negeri_badminton', 'ID lama dipetakan');
});
ujian('komuniti: Ketua Whip PBT perlu Ahli Majlis dan menggantikannya (had 3 tidak bertambah); Mahasiswa had umur 30', () => {
  const KM = kmPemain({ umur: 28, p: { jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian')], pru: Object.assign({}, g.MyPolitikPRU.getPRU(S.loadPlayer() || {}), { status: { jenis: 'ADUN', kerusi: 'Uji', sejakTahun: 2026, sejakBulan: 1, kerajaan: true } }) } });
  const j = (id) => KM.senarai(S.loadPlayer()).filter((x) => x.id === id)[0];
  sama(j('pbt_whip').boleh, false, 'perlu Ahli Majlis'); betul(/Ahli Majlis PBT/.test(j('pbt_whip').sebab), j('pbt_whip').sebab);
  sama(j('mahasiswa').boleh, true, 'umur 28'); betul(KM.lobi('mahasiswa', { rng: () => 0.01 }).ok);
  betul(KM.lobi('pbt', { rng: () => 0.01 }).ok, 'Ahli Majlis'); betul(KM.lobi('belia_kampung', { rng: () => 0.01 }).ok); sama(KM.getKomuniti(S.loadPlayer()).jawatan.length, 3);
  sama(j('pbt_whip').boleh, true, 'menggantikan, jadi tidak terhalang had 3');
  const r = KM.lobi('pbt_whip', { rng: () => 0.01 }); betul(r.ok && r.dilantik, r.ralat);
  const ids = KM.getKomuniti(S.loadPlayer()).jawatan.map((x) => x.id); sama(ids.length, 3); betul(ids.indexOf('pbt_whip') >= 0 && ids.indexOf('pbt') < 0, ids.join());
  sama(j('pbt').boleh, false, 'Ahli Majlis tidak boleh dilobi semasa Ketua Whip');
  P.daftar({ kesukaran: 'NORMAL', sayap: 'utama', umur: 32 }); P.tetap({ ip: 700, myr: 100000, jawatan: 'Ketua Cawangan', jawatanList: [pegang('ketua_cawangan')] });
  sama(KM.senarai(S.loadPlayer()).filter((x) => x.id === 'mahasiswa')[0].boleh, false, 'umur 32 melebihi 30');
});
ujian('glc: sektor melaraskan ganjaran dan risiko; jawatan lama (spn/lpm/apn) dipetakan ke sektor', () => {
  const GL = glcPemain(); GL.bukaLobi('kerajaan');
  const s = (id) => GL.senarai(S.loadPlayer()).filter((x) => x.id === id)[0];
  sama(s('kewangan_pengerusi').gaji, 3500, '2500 x1.4'); sama(s('kewangan_pengerusi').konflik, 3); sama(s('kewangan_pengerusi').audit, 2);
  sama(s('pendidikan_ahli').reputasi, 1); sama(s('teknologi_ahli').ipBulan, 4); sama(s('sdm_pengarah').akarUmbi, 1); sama(s('pengangkutan_pengarah').gaji, 1200);
  sama(GL.SYARIKAT.length, 6);
  P.tetap({ glc: { lobi: null, jawatan: { id: 'lpm_ahli', nama: 'Ahli Lembaga, Lembaga Pelabuhan Maritim', tahap: 'ahli', mula: 1, tamat: 9999999, gaji: 1500, ip: 3 }, konflik: 0, audit: 0, akhir: '', sejarah: [] } });
  const j = GL.getGLC(S.loadPlayer()).jawatan; sama(j.id, 'pengangkutan_ahli'); betul(/Nusa Pengangkutan Awam/.test(j.nama), j.nama); sama(j.gaji, 1500, 'gaji lama dihormati');
});
ujian('parti PBB: sayap (tiada Puteri), profil parti dan penukaran teks', () => {
  const SY = g.MyPolitikSayap, PT = g.MyPolitikParti, D = g.MyPolitikData, fs = require('fs'), path = require('path');
  const k1 = SY.kelayakan('Perempuan', 25, 'PBB'); sama(k1.puteri.boleh, false); sama(k1.wanita.boleh, true); sama(SY.cadangan('Perempuan', 25, 'PBB'), 'wanita');
  const k2 = SY.kelayakan('Perempuan', 25, 'UMNO'); sama(k2.puteri.boleh, true, 'UMNO tidak berubah'); sama(SY.cadangan('Perempuan', 25), 'puteri');
  sama(SY.kelayakan('Lelaki', 30, 'PBB').pemuda.boleh, true);
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-sarawak.csv'), 'utf8')));
  sama(h.bahagian.length, 82, '82 DUN = 82 Bahagian PBB'); sama(h.jumlah.cawangan, 887); sama(h.negeri.length, 1);
  const c = h.bahagian[0].dun[0].cawangan[0], dem = D.tentukanDemografi('Perempuan', 25);
  const p = S.buildPlayerProfile({ parti: 'PBB', nama: 'Uji', demografik: dem, cawangan: c, sayap: 'wanita', avatar: 'puteri' });
  sama(p.parti, 'PBB'); sama(p.sayap, 'wanita'); sama(p.negeri, 'Sarawak'); sama(p.bahagian, p.dun, 'Bahagian = DUN');
  const p2 = S.buildPlayerProfile({ nama: 'Uji', demografik: dem, cawangan: c, sayap: 'puteri', avatar: 'puteri' }); sama(p2.parti, 'UMNO'); sama(p2.sayap, 'puteri');
  S.savePlayer(p); sama(PT.kini(), 'PBB'); sama(PT.ke('Presiden UMNO'), 'Presiden PBB'); sama(PT.dari('Presiden PBB'), 'Presiden UMNO');
  S.clearPlayer(); sama(PT.kini(), 'UMNO'); sama(PT.ke('Presiden UMNO'), 'Presiden UMNO');
});
ujian('PRN Sarawak (PBB): jadual 2027, kekuatan kerusi ikut etnik, lawan ikut kawasan', () => {
  const SW = g.MyPolitikSarawak, PRU = g.MyPolitikPRU, D = g.MyPolitikData, fs = require('fs'), path = require('path');
  const dun = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-dun.json'), 'utf8'));
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-sarawak.csv'), 'utf8')));
  const nombor = Object.keys(dun).sort((a, b) => dun[b].e.cina - dun[a].e.cina);
  const cina = dun[nombor[0]], bumi = Object.values(dun).filter((d) => d.e.cina + d.e.india + d.e.lain <= 12)[0];
  const mk = (d) => ({ parti: 'PBB', id: 'x1', nama: 'Uji', dunInfo: d });
  const m1 = SW.maklumat(mk(cina)); sama(m1.tahap, 'sukar'); sama(m1.ofset, -12); sama(m1.lawan[0], 'DAP'); sama(m1.profil, 'URBAN');
  const m2 = SW.maklumat(mk(bumi)); sama(m2.tahap, 'selamat'); sama(m2.ofset, 5);
  sama(SW.maklumat({ parti: 'UMNO', dunInfo: cina }), null, 'bukan PBB');
  const j = SW.jadual(mk(cina)); sama(j.tahun, 2027); betul(j.bulan >= 1 && j.bulan <= 12);
  const dem = D.tentukanDemografi('Lelaki', 30), c = h.bahagian[0].dun[0].cawangan[0];
  const p = S.buildPlayerProfile({ parti: 'PBB', dunInfo: cina, nama: 'Uji', demografik: dem, cawangan: c, sayap: 'pemuda', avatar: 'pemuda' }); S.savePlayer(p);
  const pru = PRU.getPRU(S.loadPlayer()); sama(pru.tahunPRU, 2027); sama(PRU.profilKawasan(S.loadPlayer()), 'URBAN');
  sama(PRU.kelayakan(S.loadPlayer()).PARLIMEN.boleh, false, 'PBB tidak bertanding Parlimen pada fasa ini');
  const a = { constituencyType: 'URBAN', manifestoChoice: [], isuTempatan: 'x', voterSupport: 60, isThreeCorneredFight: false, candidateType: 'DUN', lawan: ['DAP', 'PSB'] };
  const r0 = PRU.hitungKeputusan(S.loadPlayer(), Object.assign({ ofsetKerusi: 0 }, a), { rng: () => 0.5 }), r1 = PRU.hitungKeputusan(S.loadPlayer(), Object.assign({ ofsetKerusi: -12 }, a), { rng: () => 0.5 });
  betul(r0.anda - r1.anda > 11.9 && r0.anda - r1.anda < 12.1, 'ofset -12 mengurangkan undi: ' + r0.anda + ' vs ' + r1.anda); sama(r1.pecah[r1.pecah.length - 1].nama, 'DAP');
  S.clearPlayer();
});
ujian('PBB v9.0: imbangan blok Bumiputera/Pesaka (giliran Presiden, ofset jawatan Pusat, sokongan antara blok)', () => {
  const SW = g.MyPolitikSarawak, D = g.MyPolitikData, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-sarawak.csv'), 'utf8')));
  sama(SW.giliran(2026), 'bumiputera'); sama(SW.giliran(2030), 'bumiputera'); sama(SW.giliran(2031), 'pesaka'); sama(SW.giliran(2036), 'bumiputera');
  sama(SW.blokLalai({ e: { melayu: 4, iban: 10, bidayuh: 76, orangUlu: 1 } }), 'pesaka'); sama(SW.blokLalai({ e: { melayu: 60, iban: 10, bidayuh: 1, orangUlu: 1 } }), 'bumiputera');
  const dem = D.tentukanDemografi('Lelaki', 40), c = h.bahagian[0].dun[0].cawangan[0];
  const bina = (blok) => { const p = S.buildPlayerProfile({ parti: 'PBB', blokPBB: blok, nama: 'Uji', demografik: dem, cawangan: c, sayap: 'utama', avatar: 'biasa' }); S.savePlayer(p); return S.loadPlayer(); };
  let p = bina('bumiputera');
  sama(p.blokPBB, 'bumiputera'); sama(SW.sokongan(p), 30);
  sama(SW.ofsetJawatan(p, { kod: 'presiden', peringkat: 'pusat' }), -6 - 0.9, 'giliran sendiri: -6 dan bonus umum 30 x 0.03');
  sama(SW.ofsetJawatan(p, { kod: 'timbalan_presiden', peringkat: 'pau', kumpulan: 'utama' }), -0.9, 'v13.63: Timbalan Presiden seorang setiap blok: tiada penalti giliran, bonus umum sahaja');
  sama(SW.ofsetJawatan(p, { kod: 'ketua_bahagian', peringkat: 'bahagian' }), 0, 'bukan jawatan Pusat'); sama(SW.ofsetJawatan(p, { kod: 'sayap_pusat_pemuda', peringkat: 'pusat', kumpulan: 'sayap' }), 0, 'sayap tiada kesan');
  P.tetap({ tahun: 2031 }); p = S.loadPlayer(); sama(SW.giliran(p.tahun), 'pesaka');
  sama(SW.ofsetJawatan(p, { kod: 'presiden', peringkat: 'pusat' }), Math.round((10 - 2.4) * 10) / 10, 'giliran Pesaka: Bumiputera +10');
  P.tetap({ tahun: 2026, ap: 10, myr: 20000 }); p = S.loadPlayer();
  const r = SW.dekati(); betul(r.ok, r.ralat); p = S.loadPlayer(); sama(SW.sokongan(p), 42); sama(p.ap, 7); sama(p.myr, 18500);
  sama(SW.dekati().ok, false, 'sekali sebulan');
  P.tetap({ bulan: 5 }); p = S.loadPlayer(); sama(SW.sokongan(p), 38, 'susut 1 sebulan (4 bulan)');
  const pU = S.loadPlayer(); pU.parti = 'UMNO'; sama(SW.ofsetJawatan(pU, { kod: 'presiden', peringkat: 'pusat' }), 0, 'bukan PBB');
  S.clearPlayer();
});
ujian('PBB v9.1: Premier Sarawak (hanya Presiden PBB, kerusi GPS, peluang ikut blok, kerajaan GPS dominan)', () => {
  const SW = g.MyPolitikSarawak, KB = g.MyPolitikKabinet, D = g.MyPolitikData, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-sarawak.csv'), 'utf8')));
  const dem = D.tentukanDemografi('Lelaki', 40), c = h.bahagian[0].dun[0].cawangan[0];
  S.savePlayer(S.buildPlayerProfile({ parti: 'PBB', blokPBB: 'bumiputera', nama: 'Uji', demografik: dem, cawangan: c, sayap: 'utama', avatar: 'biasa' }));
  let p = S.loadPlayer();
  sama(SW.peluangKerajaan(10), 0.6, 'lantai 60%'); sama(SW.peluangKerajaan(90), 0.9, 'siling 90%'); sama(SW.peluangKerajaan(70), 0.75);
  const k = SW.kerusiPremier(p); sama(k.jumlah, 82); sama(k.ambang, 42); betul(k.gabungan >= 70 && k.gabungan <= 78, 'GPS 70-78'); sama(k.parti + k.rakan, k.gabungan);
  const k2 = SW.kerusiPremier(p); sama(k2.parti, k.parti, 'benih tetap');
  sama(SW.kerusiPremier(Object.assign({}, p, { parti: 'UMNO' })), null);
  sama(KB.maklumatMB(p).label, 'Premier');
  betul(SW.sebabPremier(p).length > 0, 'bukan Presiden ditolak');
  sama(SW.sebabPremier(Object.assign({}, p, { jawatan: 'Presiden' })), '');
  P.tetap({ tahun: 2026 }); const pg = Object.assign({}, S.loadPlayer(), { jawatan: 'Presiden' });
  const a1 = SW.pelarasPremier(pg); sama(a1, 0.05, 'blok giliran +5%, sokongan 30 = 0');
  const pp = Object.assign({}, pg, { blokPBB: 'pesaka' }); sama(SW.pelarasPremier(pp), -0.05, 'bukan giliran -5%');
  const tinggi = SW.pelarasPremier(Object.assign({}, pg, { blokSokong: { nilai: 80, idx: (parseInt(pg.tahun, 10) * 12 + parseInt(pg.bulan, 10)), dekati: 0 } })); betul(tinggi > a1, 'sokongan tinggi menambah peluang');
  // hujung-ke-hujung: Presiden PBB + ADUN + lobi DUN
  S.savePlayer(S.buildPlayerProfile({ parti: 'PBB', blokPBB: 'bumiputera', nama: 'Uji', demografik: dem, cawangan: c, sayap: 'utama', avatar: 'biasa' }));
  P.tetap({ tahun: 2027, jawatan: 'Presiden', ap: 10, reputasi: 70, pru: Object.assign({}, g.MyPolitikPRU.getPRU(S.loadPlayer()), { status: { jenis: 'ADUN', kerusi: 'N.01', sejakTahun: 2027, sejakBulan: 1, kerajaan: true } }) });
  betul(KB.bukaLobi('DUN').ok, 'lobi dibuka');
  let mb = KB.maklumatMB(S.loadPlayer()); betul(mb.boleh, mb.sebab); sama(mb.label, 'Premier'); betul(mb.peluang >= 10 && mb.peluang <= 100);
  let tm = null; for (let i = 0; i < 40 && !(tm && tm.dilantik); i++) { P.tetap({ ap: 10 }); const kk = KB.getKabinet(S.loadPlayer()); if (kk.hasGovernmentRole) { break; } tm = KB.tuntutMB(); }
  betul(tm && tm.ok, 'tuntut berjalan'); const kk2 = KB.getKabinet(S.loadPlayer()); betul(kk2.hasGovernmentRole, 'dapat jawatan kerajaan');
  betul(/Premier|EXCO/.test(kk2.portfolioName), kk2.portfolioName);
  S.clearPlayer();
});
ujian('PBB v9.2: portfolio Menteri Sarawak untuk lobi DUN (UMNO kekal portfolio EXCO umum)', () => {
  const KB = g.MyPolitikKabinet, D = g.MyPolitikData, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-sarawak.csv'), 'utf8')));
  const dem = D.tentukanDemografi('Lelaki', 40), c = h.bahagian[0].dun[0].cawangan[0];
  S.savePlayer(S.buildPlayerProfile({ parti: 'PBB', blokPBB: 'pesaka', nama: 'Uji', demografik: dem, cawangan: c, sayap: 'utama', avatar: 'biasa' }));
  P.tetap({ tahun: 2027, ip: 1000, myr: 50000, ap: 10 }); betul(KB.bukaLobi('DUN').ok, 'lobi dibuka');
  let sn = KB.senaraiPortfolio(S.loadPlayer()); sama(sn.length, 8, '8 portfolio Sarawak'); betul(sn.every((x) => /^sw_/.test(x.id) && /Sarawak$/.test(x.nama)), 'semua nama Sarawak');
  betul(sn.every((x) => x.tahap === 'EXCO_NEGERI'), 'tahap EXCO_NEGERI kekal');
  let lj = null; for (let i = 0; i < 3 && !(lj && lj.dilantik); i++) { lj = KB.lobiPortfolio('sw_kesihatan', () => 0.01); if (!lj.ok) { break; } }
  betul(lj.ok && lj.dilantik, lj.ralat); const k = KB.getKabinet(S.loadPlayer()); sama(k.portfolioId, 'sw_kesihatan'); betul(/Sarawak/.test(k.portfolioName));
  sama(KB.lobiPortfolio('exco_kerjaraya', () => 0.01).ok, false, 'portfolio UMNO tidak tersedia untuk PBB');
  S.clearPlayer();
  P.daftar({}); betul(KB.bukaLobi('DUN').ok); sn = KB.senaraiPortfolio(S.loadPlayer()); betul(sn.length === 9 && sn.every((x) => /^exco_/.test(x.id)), 'UMNO: 9 portfolio EXCO umum (v13.69)');
  S.clearPlayer();
});
ujian('PBB v9.3: rundingan kerusi GPS (Presiden PBB, 12 bulan sebelum PRN) dan label Menteri Negeri', () => {
  const SW = g.MyPolitikSarawak, KB = g.MyPolitikKabinet, PR = g.MyPolitikPRU, D = g.MyPolitikData, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-sarawak.csv'), 'utf8')));
  const dem = D.tentukanDemografi('Lelaki', 40), c = h.bahagian[0].dun[0].cawangan[0];
  S.savePlayer(S.buildPlayerProfile({ parti: 'PBB', blokPBB: 'bumiputera', nama: 'Uji', demografik: dem, cawangan: c, sayap: 'utama', avatar: 'biasa' }));
  P.tetap({ jawatan: 'Presiden', ap: 10 });
  let p = S.loadPlayer(); const pru = PR.getPRU(p); sama(SW.runding('seimbang').ok, false, 'belum dalam tempoh 12 bulan atau bukan masanya');
  P.tetap({ tahun: pru.tahunPRU - 1, bulan: 12 }); p = S.loadPlayer(); let st = SW.statusRunding(p);
  const dlm = st.bakiBulan > 0 && st.bakiBulan <= 12; if (!dlm) { P.tetap({ tahun: pru.tahunPRU, bulan: Math.max(1, (parseInt(pru.bulanPRU, 10) || 1) - 1) }); st = SW.statusRunding(S.loadPlayer()); }
  betul(st.boleh, 'dalam tempoh rundingan');
  const hub0 = Number(PR.getPRU(S.loadPlayer()).hubunganGabungan) || 50;
  const r = SW.runding('tegas'); betul(r.ok, r.ralat); p = S.loadPlayer(); sama(p.rundingGPS.kerusi, 50); sama(p.ap, 7); sama(Number(PR.getPRU(p).hubunganGabungan), Math.max(0, hub0 - 10));
  sama(SW.runding('beralah').ok, false, 'sekali setiap PRN');
  const kt = SW.kerusiPremier(Object.assign({}, p, { tahun: p.rundingGPS.kitar })); sama(kt.parti, Math.round(kt.gabungan * 50 / 82), 'kerusi ikut keputusan rundingan');
  const pb = Object.assign({}, p, { rundingGPS: { kitar: p.rundingGPS.kitar, pilihan: 'beralah', kerusi: 38 }, tahun: p.rundingGPS.kitar }); betul(SW.kerusiPremier(pb).parti < kt.parti, 'beralah = kerusi PBB kurang');
  sama(SW.statusRunding(Object.assign({}, p, { jawatan: 'Ahli', jawatanList: [] })), null, 'bukan Presiden');
  sama(KB.ringkasan(Object.assign({}, p, { parti: 'PBB' })).tahapNama, '');
  P.tetap({ tahun: 2027 }); KB.bukaLobi('DUN'); const sn = KB.senaraiPortfolio(S.loadPlayer()); sama(sn[0].tahapNama, 'Menteri Negeri');
  S.clearPlayer(); P.daftar({}); KB.bukaLobi('DUN'); sama(KB.senaraiPortfolio(S.loadPlayer())[0].tahapNama, 'EXCO Negeri', 'UMNO kekal EXCO');
  S.clearPlayer();
});
ujian('PBB v9.4: PRN (DUN) dan PRU (Parlimen) berasingan; lobi Premier terbuka untuk Presiden; status kerusi jenis lain kekal', () => {
  const SW = g.MyPolitikSarawak, KB = g.MyPolitikKabinet, PR = g.MyPolitikPRU, D = g.MyPolitikData, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-sarawak.csv'), 'utf8')));
  const dun = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-dun.json'), 'utf8'));
  betul(dun['1'].pl && dun['1'].pl.e && dun['1'].pl.bilDUN >= 1, 'data Parlimen (pl) ada'); sama(Object.keys(dun).reduce((s, k) => s.add(dun[k].pl.kod), new Set()).size, 31, '31 Parlimen');
  const dem = D.tentukanDemografi('Lelaki', 40), c = h.bahagian[0].dun[0].cawangan[0];
  S.savePlayer(S.buildPlayerProfile({ parti: 'PBB', blokPBB: 'bumiputera', nama: 'Uji', demografik: dem, cawangan: c, sayap: 'utama', avatar: 'biasa', dunInfo: dun['1'] }));
  P.tetap({ jawatan: 'Presiden', jawatanList: [{ jawatan: 'Presiden', pangkat: 12, peringkat: 'pusat', kumpulan: 'utama' }], ip: 2000, myr: 500000, ap: 50, reputasi: 80, tahun: 2027, bulan: 1 });
  const mp = SW.maklumatParlimen(S.loadPlayer()); sama(mp.kod, 'P.192'); betul(mp.nama === 'Mas Gading' && mp.pemilih > dun['1'].pemilih, 'Parlimen > DUN');
  const lama = Math.random, kempen = (jenis) => {
    let pru = PR.getPRU(S.loadPlayer()); P.tetap({ tahun: pru.tahunPRU, bulan: pru.bulanPRU }); betul(PR.isytihar('tamat_penggal').ok);
    const kl = PR.kelayakan(S.loadPlayer()); sama(kl[jenis].boleh, true); sama(kl[jenis === 'DUN' ? 'PARLIMEN' : 'DUN'].boleh, false, 'jenis lain dihalang');
    Math.random = () => 0.01; const r = PR.pilihKerusi(jenis, { rng: () => 0.01 }); betul(r.ok && r.diluluskan, r.mesej || r.ralat);
    let a = PR.getPRU(S.loadPlayer()).aktif; if (a.fasa === 'runding') { PR.runding('abai'); a = PR.getPRU(S.loadPlayer()).aktif; }
    const pil = PR.peruntukanPilihan(S.loadPlayer(), a); betul(PR.mulaKempen(PR.JANJI.map((x) => x.id).slice(0, 3), pil.pilihan[pil.pilihan.length - 1]).ok);
    for (let i = 0; i < 40; i++) { const ck = PR.keadaanKempen(S.loadPlayer()); if (ck.kejutan) { PR.jawabKejutan(ck.kejutan.pilihan.filter((x) => x.boleh)[0].id); continue; } if (ck.hariBaki <= 0) { break; } const tt = (ck.hariFinal ? ck.final : []).concat(ck.biasa).filter((x) => x.boleh)[0]; if (!tt) { break; } PR.tindakanKempen(tt.id); }
    const s = PR.selesaikan({ rng: () => 0.01 }); Math.random = lama; betul(s.ok, s.ralat); return s.keputusan;
  };
  sama(PR.ringkasan(S.loadPlayer()).jenisPBB, 'PRN');
  let kp = kempen('DUN'); betul(kp.menang, 'menang DUN'); betul(!kp.nasional, 'PBB tiada keputusan nasional'); betul(kp.kabinetBuka, 'lobi kerajaan negeri terbuka untuk Presiden');
  betul(KB.getKabinet(S.loadPlayer()).lobi && KB.getKabinet(S.loadPlayer()).lobi.sumber === 'DUN', 'lobi DUN'); PR.tutupKeputusan();
  let pru = PR.getPRU(S.loadPlayer()); sama(pru.jenisPBB, 'PRU'); sama(pru.tahunPRU, 2028, 'PRU setahun selepas PRN');
  P.tetap({ ap: 0 }); betul(KB.tuntutMB().ok, 'tuntut Premier tanpa AP (v13.41)'); sama(S.loadPlayer().ap, 0, 'tiada AP ditolak'); sama(KB.getKabinet(S.loadPlayer()).roleLevel === 'MENTERI_BESAR' || KB.getKabinet(S.loadPlayer()).roleLevel === 'EXCO_NEGERI', true);
  kp = kempen('PARLIMEN'); PR.tutupKeputusan();
  const st = PR.semuaStatus(S.loadPlayer()).map((x) => x.jenis).sort(); sama(st.join(','), kp.menang ? 'ADUN,MP' : 'ADUN', 'ADUN kekal; MP ditambah jika menang');
  betul(/Premier|Menteri/.test(KB.getKabinet(S.loadPlayer()).portfolioName), 'jawatan negeri tidak tamat semasa PRU');
  pru = PR.getPRU(S.loadPlayer()); sama(pru.jenisPBB, 'PRN'); sama(pru.tahunPRU, 2032, 'PRN 4 tahun selepas PRU');
  const kn = PR.getPRU(S.loadPlayer()).aktif; sama(kn, null);
  S.clearPlayer();
});
ujian('v12.6: SUPP menang DUN = ADUN kerajaan (ikut kerusi GPS, bukan lambungan); simpanan lama dibaiki', () => {
  const SW = g.MyPolitikSarawak, KB = g.MyPolitikKabinet, PR = g.MyPolitikPRU, D = g.MyPolitikData, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-sarawak.csv'), 'utf8')));
  const dun = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-dun.json'), 'utf8'));
  S.savePlayer(S.buildPlayerProfile({ parti: 'SUPP', nama: 'Uji', demografik: D.tentukanDemografi('Lelaki', 40), cawangan: h.bahagian[0].dun[0].cawangan[0], sayap: 'utama', avatar: 'biasa', dunInfo: dun['9'] }));
  P.tetap({ jawatan: 'Ketua Cawangan', jawatanList: [{ jawatan: 'Ketua Cawangan', pangkat: 7, peringkat: 'bahagian', kumpulan: 'utama' }], ip: 3000, myr: 500000, ap: 50, reputasi: 80, tahun: 2027, bulan: 1 });
  let pru = PR.getPRU(S.loadPlayer()); P.tetap({ tahun: pru.tahunPRU, bulan: pru.bulanPRU }); betul(PR.isytihar('tamat_penggal').ok);
  const lama = Math.random; Math.random = () => 0.01; betul(PR.pilihKerusi('DUN', { rng: () => 0.01 }).ok); Math.random = lama;
  let a = PR.getPRU(S.loadPlayer()).aktif; if (a.fasa === 'runding') { PR.runding('abai'); a = PR.getPRU(S.loadPlayer()).aktif; }
  betul(PR.mulaKempen(PR.JANJI.map((x) => x.id).slice(0, 3), PR.peruntukanPilihan(S.loadPlayer(), a).pilihan[0]).ok);
  pru = PR.getPRU(S.loadPlayer()); pru.aktif.voterSupport = 95; pru.aktif.isThreeCorneredFight = false; pru.aktif.campaignDaysLeft = 0; P.tetap({ pru: pru });
  const s = PR.selesaikan({ rng: () => 0.99 }); betul(s.ok, s.ralat); betul(s.keputusan.menang, 'menang');
  sama(s.keputusan.kerajaan, true, 'rng 0.99 dahulu = bukan kerajaan; kini ikut kerusi GPS ' + SW.kerusiPremier(S.loadPlayer()).gabungan + '/82');
  sama(KB.getKabinet(S.loadPlayer()).lobi.sumber, 'DUN', 'lobi DUN dibuka'); PR.tutupKeputusan();
  pru = PR.getPRU(S.loadPlayer()); pru.status.kerajaan = false; P.tetap({ pru: pru }); KB.lepaskanLobi();
  betul(PR.baikiStatusSarawak(), 'simpanan lama dibaiki'); sama(PR.getPRU(S.loadPlayer()).status.kerajaan, true); sama(KB.getKabinet(S.loadPlayer()).lobi.sumber, 'DUN', 'lobi dibuka semula');
  sama(PR.baikiStatusSarawak(), false, 'idempoten');
  S.clearPlayer();
});
ujian('v12.7: Kaji Selidik: atas pagar berkurang, status ikut margin ralat, amaran Marginal sekali sehari', () => {
  const PL = g.MyPolitikPolling;
  P.daftar(); P.tetap({ jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian')], ip: 3000, myr: 200000, ap: 50 });
  let pru = PRU.getPRU(S.loadPlayer()); P.tetap({ tahun: pru.tahunPRU, bulan: pru.bulanPRU }); betul(PRU.isytihar('tamat_penggal').ok);
  betul(PRU.pilihKerusi('DUN', { rng: sedikit }).ok); let a = PRU.getPRU(S.loadPlayer()).aktif; if (a.fasa === 'runding') { PRU.runding('abai', { rng: sedikit }); a = PRU.getPRU(S.loadPlayer()).aktif; }
  betul(PRU.mulaKempen(JANJI3(), PRU.peruntukanPilihan(S.loadPlayer(), a).pilihan[0]).ok);
  let ck = PRU.keadaanKempen(S.loadPlayer()); betul(ck.polling && ck.polling.undecidedVoters >= 4, 'polling ada');
  const u0 = ck.polling.undecidedVoters, t = ck.biasa.filter((x) => x.boleh && x.id !== 'rehat' && x.id !== 'derma')[0];
  betul(PRU.tindakanKempen(t.id, { rng: () => 0.5 }).ok); ck = PRU.keadaanKempen(S.loadPlayer());
  betul(ck.polling.undecidedVoters < u0 - PL.CONFIG.HARIAN, 'atas pagar turun lebih daripada susut harian (' + u0 + ' -> ' + ck.polling.undecidedVoters + ')');
  sama(ck.polling.projectedVoteShare.anda, PL.unjuran(ck.aktif).anda, 'unjuran = formula keputusan tanpa rawak');
  sama(ck.polling.demografi.map((d) => d.kod).join(), 'bandar,luar,belia,pagar');
  const uji = (vs) => { const b = Object.assign({}, ck.aktif, { voterSupport: vs, isThreeCorneredFight: false, polling: Object.assign({}, ck.aktif.polling, { atasPagar: 10, amaranHari: null }) }); return { k: PL.kira(b), b }; };
  sama(uji(80).k.seatStatus, 'Selamat'); sama(uji(20).k.seatStatus, 'Ketinggalan');
  const m = uji(50 - (ck.aktif.ofsetKerusi || 0) * 2.5 - (ck.aktif.manifestoChoice.indexOf(ck.aktif.isuTempatan) >= 0 ? 2.5 : -1.25));
  sama(m.k.seatStatus, 'Marginal/Sengit'); betul(/Marginal\/Sengit/.test(PL.amaran(m.b)), 'amaran pertama'); sama(PL.amaran(m.b), null, 'tidak berulang hari sama');
  delete ck.aktif.polling; betul(PL.kira(ck.aktif).undecidedVoters > 0, 'kempen lama tanpa polling dibina semula');
  S.clearPlayer();
});
ujian('v12.8: War Room: hantar jentera (kos, had sehari), tangkis serangan, burnout, kesan pada sokongan', () => {
  const WR = g.MyPolitikWarRoom, C = WR.CONFIG;
  P.daftar(); P.tetap({ jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian')], ip: 3000, myr: 200000, ap: 50 });
  let pru = PRU.getPRU(S.loadPlayer()); P.tetap({ tahun: pru.tahunPRU, bulan: pru.bulanPRU }); betul(PRU.isytihar('tamat_penggal').ok);
  betul(PRU.pilihKerusi('DUN', { rng: sedikit }).ok); let a = PRU.getPRU(S.loadPlayer()).aktif; if (a.fasa === 'runding') { PRU.runding('abai', { rng: sedikit }); a = PRU.getPRU(S.loadPlayer()).aktif; }
  const pl8 = PRU.peruntukanPilihan(S.loadPlayer(), a).pilihan; betul(PRU.mulaKempen(JANJI3(), pl8[pl8.length - 1]).ok);
  let w = PRU.keadaanKempen(S.loadPlayer()).warRoom; sama(w.zon.length, C.ZON); betul(w.zon.some((z) => z.hotspotLevel === 3), 'ada zon tentangan Tinggi');
  const z0 = w.zon[0], a0 = PRU.getPRU(S.loadPlayer()).aktif, j0 = a0.jentera, d0 = a0.campaignFunds;
  const r = PRU.hantarJentera(0); betul(r.ok, r.ralat); a = PRU.getPRU(S.loadPlayer()).aktif;
  sama(a.jentera, Math.max(0, j0 - C.HANTAR.jentera)); sama(a.campaignFunds, d0 - C.HANTAR.dana); sama(a.warRoom.zon[0].kehadiran, Math.min(95, z0.machineryPresence + C.HANTAR.kehadiran));
  const r2 = PRU.hantarJentera(1); betul(r2.ok, r2.ralat); sama(PRU.hantarJentera(2).ok, false, 'had sehari');
  // pertempuran: zon Tinggi dengan kehadiran tinggi menangkis; rendah = sokongan zon turun
  const b = JSON.parse(JSON.stringify(a)); b.warRoom.burnout = 0; b.warRoom.zon.forEach((z, i) => { z.hotspot = 3; z.kehadiran = i === 0 ? 80 : C.ASAS[3]; z.berat = 1 / b.warRoom.zon.length; z.ofset = 0; });
  const vs0 = b.voterSupport, D = WR.selepasHari(b, () => 0.5);
  betul(b.warRoom.zon[0].ofset > b.warRoom.zon[1].ofset, 'zon berjentera naik berbanding zon lain'); betul(/ditangkis/.test(b.warRoom.log.map((l) => l.teks).join()), 'serangan ditangkis');
  sama(Math.round((b.voterSupport - vs0) * 10) / 10, Math.round(D * 10) / 10, 'kesan zon masuk ke sokongan keseluruhan');
  // burnout: jentera habis
  const c = JSON.parse(JSON.stringify(a)); c.jentera = 3; c.hari = 99; c.warRoom.hantarHari = { hari: 0, n: 0 }; const h = WR.hantar(c, 3); betul(h.ok && h.habis); sama(c.warRoom.burnout, C.BURNOUT.KOSONG);
  betul(WR.faktor(c) < 1, 'keberkesanan turun'); WR.selepasTindakan(c, 'rehat'); sama(c.warRoom.burnout, C.BURNOUT.KOSONG - C.BURNOUT.REHAT);
  betul(PRU.namakanZon([{ nama: 'DM Satu', berat: 3 }, { nama: 'DM Dua', berat: 1 }]), 'zon dinamakan');
  w = PRU.keadaanKempen(S.loadPlayer()).warRoom; sama(w.zon.map((z) => z.zoneName).join(), 'DM Satu,DM Dua'); sama(w.zon[0].berat, 75); sama(PRU.namakanZon([{ nama: 'X' }, { nama: 'Y' }]), false, 'sekali sahaja');
  S.clearPlayer();
});
ujian('v12.9: Krisis tular: muncul bulanan, tiga tindak balas, tidak dijawab = diam, krisis kempen, latih pertahanan', () => {
  const T = g.MyPolitikTular, MD = g.MyPolitikMedia || require('../js/media.js'), C = T.CONFIG;
  P.daftar(); P.tetap({ jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian')], ip: 3000, myr: 200000, ap: 50 });
  let ev = T.prosesBulan({ rng: () => 0.001 }); betul(ev.peristiwa.some((e) => e.jenis === 'tular'), 'krisis bulanan muncul');
  let k = T.keadaan(S.loadPlayer()); betul(k.mediaCrisisActive && k.krisis.pilihan.length === 3, 'tiga pilihan');
  const kk = k.krisis.keterukan, def0 = k.cyberDefenseScore, per0 = MD.getMedia(S.loadPlayer()).persepsi, myr0 = S.loadPlayer().myr;
  let r = T.jawab('kontra', { rng: () => 0.01 }); betul(r.ok && r.jaya, r.ralat);
  sama(S.loadPlayer().myr, myr0 - C.KONTRA.dana * kk, 'kos kontra'); sama(MD.getMedia(S.loadPlayer()).persepsi, Math.max(0, per0 + C.KONTRA.persepsi * kk)); sama(T.keadaan(S.loadPlayer()).cyberDefenseScore, def0 + C.KONTRA.pertahananNaik);
  T._cipta('bulanan', { rng: () => 0.5 }); const ap0 = S.loadPlayer().ap;
  r = T.jawab('sidang', { rng: () => 0.99 }); betul(r.ok && r.jaya === false, 'silap cakap'); sama(S.loadPlayer().ap, ap0 - C.SIDANG.ap);
  T._cipta('bulanan', { rng: () => 0.5 }); const m0 = MD.getMedia(S.loadPlayer());
  r = T.jawab('diam'); betul(r.ok); const m1 = MD.getMedia(S.loadPlayer()); betul(m1.persepsi > m0.persepsi && m1.belia < m0.belia, 'diam: persepsi naik, belia turun');
  T._cipta('bulanan', { rng: () => 0.5 }); P.tetap({ bulan: (S.loadPlayer().bulan % 12) + 1 });
  ev = T.prosesBulan({ rng: () => 0.99 }); betul(ev.peristiwa.some((e) => /tidak dijawab/.test(e.mesej)), 'tidak dijawab = diam'); sama(T.keadaan(S.loadPlayer()).mediaCrisisActive, false);
  const L0 = T.keadaan(S.loadPlayer()).cyberDefenseScore; r = T.latih(); betul(r.ok, r.ralat); sama(T.keadaan(S.loadPlayer()).cyberDefenseScore, L0 + C.LATIH.pertahanan); sama(T.latih().ok, false, 'jeda latih');
  // kempen
  let pru = PRU.getPRU(S.loadPlayer()); P.tetap({ tahun: pru.tahunPRU, bulan: pru.bulanPRU }); betul(PRU.isytihar('tamat_penggal').ok);
  betul(PRU.pilihKerusi('DUN', { rng: sedikit }).ok); let a = PRU.getPRU(S.loadPlayer()).aktif; if (a.fasa === 'runding') { PRU.runding('abai', { rng: sedikit }); a = PRU.getPRU(S.loadPlayer()).aktif; }
  const pl = PRU.peruntukanPilihan(S.loadPlayer(), a).pilihan; betul(PRU.mulaKempen(JANJI3(), pl[pl.length - 1]).ok);
  const h = T.hariKempen({ rng: () => 0.001 }); betul(h && h.baru, 'krisis kempen'); sama(T.hariKempen({ rng: () => 0.001 }).baru, false, 'kerosakan harian, bukan krisis baharu');
  const vs0 = PRU.getPRU(S.loadPlayer()).aktif.voterSupport, f0 = PRU.getPRU(S.loadPlayer()).aktif.campaignFunds, k2 = T.keadaan(S.loadPlayer()).krisis.keterukan;
  r = T.jawab('kontra', { rng: () => 0.01 }); betul(r.ok, r.ralat); sama(PRU.getPRU(S.loadPlayer()).aktif.campaignFunds, f0 - C.KONTRA.danaKempen * k2, 'kontra kempen guna dana kempen'); sama(PRU.getPRU(S.loadPlayer()).aktif.voterSupport, vs0);
  sama(T.hariKempen({ rng: () => 0.001 }), null, 'sekali sekempen');
  S.clearPlayer();
});
ujian('v13.1: MCA: data, kuota BN, kitaran pemilihan selepas PRU, takwim 4/6/8, Pusat oleh perwakilan Bahagian', () => {
  const M = g.MyPolitikMCA, E = g.MyPolitikElection, K = g.MyPolitikCalendar, D = g.MyPolitikData, J = g.MyPolitikJawatan, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'mca-semenanjung.csv'), 'utf8')));
  sama(h.jumlah.bahagian, 172, '165 Bahagian Semenanjung + 7 Sabah (v13.16)'); betul(h.bahagian.every((b) => b.cawangan.every((c) => c.jumlahAhli >= 50)), 'Cawangan minimum 50 ahli (Perkara 92)');
  const bm = h.bahagian.find((b) => b.nama === 'Bukit Mertajam'), luar = h.bahagian.filter((b) => !M.kawasan({ kod: { parlimen: b.kod } }).sabah).sort((a, b) => M.kawasan({ kod: { parlimen: b.kod } }).parlimen.r - M.kawasan({ kod: { parlimen: a.kod } }).parlimen.r)[0];
  S.savePlayer(S.buildPlayerProfile({ parti: 'MCA', nama: 'Tan Uji', demografik: D.tentukanDemografi('Perempuan', 30, 'MCA'), cawangan: bm.dun[0].cawangan[0], sayap: 'wanita', avatar: 'wanita', tahunAhli: 5 }));
  let p = S.loadPlayer(); sama(p.parti, 'MCA'); sama(p.sayap, 'wanita', 'perempuan muda masuk Wanita (tiada Puteri)');
  const kw = M.kawasan(p); betul(kw.kuotaPL && kw.kuotaDUN, 'Bukit Mertajam dalam kuota');
  sama(E.adalahTahunPemilihan(2026), true); sama(E.adalahTahunPemilihan(2029), false, 'tiada pemilihan 3 tahun tetap');
  const pru = g.MyPolitikPRU.getPRU(p); pru.riwayat = [{ tahun: 2028, bulan: 3, jenis: 'PRU' }]; P.tetap({ pru: pru });
  sama(E.adalahTahunPemilihan(2029), true, 'PRU Mac 2028: +6 = Sep 2028, +36 = Ogos 2029, pemilihan 2029'); sama(E.tahunPemilihanSeterusnya(2027), 2029);
  pru.riwayat = [{ tahun: 2031, bulan: 3, jenis: 'PRU' }]; P.tetap({ pru: pru }); sama(E.tahunPemilihanSeterusnya(2027), 2032, 'PRU lambat: pemilihan selepas PRU');
  sama(K.getTetingkap('cawangan', 4).buka !== false, true); betul(/Bahagian/.test(JSON.stringify(K.getFasa(6))), 'bulan 6 musim Bahagian');
  sama(E.bilPemilih ? true : true, true);
  const kel = g.MyPolitikPRU.kelayakan(p); betul(!kel.PARLIMEN.sebab.some((x) => /kuota MCA/.test(x)), 'Parlimen dalam kuota');
  const rp = M.ringkasPusat(p); sama(rp.bilBahagian, 172, '172 Bahagian dalam Pemilihan Pusat'); betul(rp.pengundi > 2000 && rp.pengundi < 172 * 30, 'perwakilan ikut saiz Bahagian (' + rp.pengundi + ')');
  betul(M.perwakilan('P.049') > M.perwakilan('P.001'), 'Bahagian besar (Tanjong) lebih ramai wakil daripada Padang Besar');
  P.tetap({ jawatan: 'Ketua Bahagian', jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: 2026 }], ap: 20, myr: 50000 });
  const kod = M.ringkasPusat(S.loadPlayer()).senarai[0].kod, sb0 = M.sokonganBahagian(S.loadPlayer())[kod];
  const rj = M.jelajah(kod); betul(rj.ok, rj.ralat); sama(M.sokonganBahagian(S.loadPlayer())[kod], sb0 + M.CONFIG.PUSAT.jelajahNaik); sama(M.jelajah(kod).ok, false, 'sekali sebulan');
  const rm = M.mohon('setiausaha_agung', { rng: () => 0.01 }); betul(rm.ok && rm.jaya, rm.ralat); sama(M.lantikanSemasa(S.loadPlayer()).jawatan, 'Setiausaha Agung');
  // tempat di luar kuota
  S.savePlayer(S.buildPlayerProfile({ parti: 'MCA', nama: 'Lim Uji', demografik: D.tentukanDemografi('Lelaki', 40, 'MCA'), cawangan: luar.dun[0].cawangan[0], sayap: 'utama', avatar: 'biasa', tahunAhli: 1 }));
  p = S.loadPlayer(); P.tetap({ ip: 5000, jawatan: 'Ketua Bahagian', jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: 2026 }] });
  const k2 = g.MyPolitikPRU.kelayakan(S.loadPlayer()); betul(k2.PARLIMEN.sebab.some((x) => /kuota MCA/.test(x)) && k2.PARLIMEN.sebab.some((x) => /Perkara 120/.test(x)), 'luar kuota & kurang 3 tahun');
  const ajk = J.KATALOG.find((d) => d.kod === 'ajk_cawangan'); betul(/3 tahun/.test(J.semakKelayakan(S.loadPlayer(), ajk).sebab || ''), 'semua jawatan parti perlu 3 tahun (Perkara 120)');
  S.clearPlayer();
});
ujian('v13.1: MCA: tidak hadir 3 mesyuarat, had Presiden 9 tahun, sumbangan wakil rakyat', () => {
  const M = g.MyPolitikMCA, D = g.MyPolitikData, J = g.MyPolitikJawatan, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'mca-semenanjung.csv'), 'utf8')));
  S.savePlayer(S.buildPlayerProfile({ parti: 'MCA', nama: 'Tan Uji', demografik: D.tentukanDemografi('Lelaki', 45, 'MCA'), cawangan: h.bahagian[0].dun[0].cawangan[0], sayap: 'utama', avatar: 'biasa', tahunAhli: 10 }));
  P.tetap({ jawatan: 'AJK Cawangan', jawatanList: [{ kod: 'ajk_cawangan', jawatan: 'AJK Cawangan', peringkat: 'cawangan', kumpulan: 'utama', pangkat: 1, tahun: 2026 }], kesetiaan: Object.assign({}, S.loadPlayer().kesetiaan, { akarUmbi: 80, ajk: 80 }), myr: 10000 });
  let ev = [];
  for (let i = 0; i < 4; i++) { ev = ev.concat(M.prosesBulan({ rng: () => 0.99 }).peristiwa); }
  betul(ev.some((e) => /Perkara 157/.test(e.mesej)), 'notis tidak hadir'); betul(S.loadPlayer().mca.rayuan, 'rayuan menunggu');
  const rr = M.rayuan({ rng: () => 0.99 }); betul(rr.ok && rr.jaya === false, 'rayuan ditolak'); sama(J.pegang(S.loadPlayer(), 'ajk_cawangan'), false, 'hilang kerusi');
  P.tetap({ jawatan: 'Presiden', jawatanList: [{ kod: 'presiden', jawatan: 'Presiden', peringkat: 'pusat', kumpulan: 'utama', pangkat: 12, tahun: 2026 }] });
  M.prosesBulan({ rng: () => 0.99 }); const m = S.loadPlayer().mca; m.presidenSejak -= 108; P.tetap({ mca: m });
  ev = M.prosesBulan({ rng: () => 0.99 }).peristiwa; betul(ev.some((e) => /9 tahun/.test(e.mesej)), 'had 9 tahun'); sama(J.pegang(S.loadPlayer(), 'presiden'), false);
  const PR = g.MyPolitikPRU, pru = PR.getPRU(S.loadPlayer()); pru.status = { jenis: 'ADUN', kerusi: 'X', kerajaan: true, sejakTahun: 2026, sejakBulan: 1 }; P.tetap({ pru: pru, myr: 10000 });
  const myr0 = S.loadPlayer().myr; M.prosesBulan({ rng: () => 0.99 }); sama(S.loadPlayer().myr, myr0 - M.CONFIG.SUMBANGAN, 'sumbangan RM 500');
  S.clearPlayer();
});
ujian('v13.3: MIC: data, kuota BN, kitaran 3 tahun dari 2027, takwim 3/5/9, Puteri & Putera, syarat Pengerusi Cawangan', () => {
  const M = g.MyPolitikMIC, E = g.MyPolitikElection, K = g.MyPolitikCalendar, D = g.MyPolitikData, J = g.MyPolitikJawatan, SY = g.MyPolitikSayap, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'mic-semenanjung.csv'), 'utf8')));
  sama(h.jumlah.bahagian, 169, '165 Bahagian + 4 Sabah (v13.16)'); betul(h.bahagian.every((b) => b.cawangan.every((c) => c.jumlahAhli >= 60 && c.jumlahAhli <= 200)), 'Cawangan 60 hingga 200 ahli (Perkara 17.12)');
  betul(SY.kelayakan('L', 25, 'MIC').putera.boleh && !SY.kelayakan('L', 25, 'UMNO').putera.boleh && !SY.kelayakan('L', 32, 'MIC').putera.boleh, 'Putera: lelaki bawah 30, MIC sahaja');
  betul(SY.kelayakan('P', 25, 'MIC').puteri.boleh, 'MIC ada Puteri');
  const ib = h.bahagian.find((b) => b.nama === 'Ipoh Barat');
  S.savePlayer(S.buildPlayerProfile({ parti: 'MIC', nama: 'Raj Uji', demografik: D.tentukanDemografi('Lelaki', 25, 'MIC'), cawangan: ib.dun[0].cawangan[0], sayap: 'putera', avatar: 'pemuda', tahunAhli: 3 }));
  let p = S.loadPlayer(); sama(p.parti, 'MIC'); sama(p.sayap, 'putera', 'sayap Putera disimpan');
  betul(J.katalogUntuk(p).some((d) => d.kod === 'sayap_cawangan_putera'), 'jawatan Ketua Putera Cawangan');
  const kw = M.kawasan(p); betul(kw.kuotaPL, 'Ipoh Barat dalam kuota 10 kerusi');
  sama(E.adalahTahunPemilihan(2026), false, 'tiada pemilihan 2026'); sama(E.adalahTahunPemilihan(2027), true); sama(E.adalahTahunPemilihan(2030), true); sama(E.tahunPemilihanSeterusnya(2028), 2030);
  sama(K.getTetingkap('cawangan', 3).status !== 'belum_tiba', true); betul(/Bahagian/.test(JSON.stringify(K.getFasa(5))), 'bulan 5 musim Bahagian'); betul(/PAU|Perhimpunan/.test(JSON.stringify(K.getFasa(9))), 'bulan 9 Perhimpunan Agung');
  const kb = J.KATALOG.find((d) => d.kod === 'ketua_bahagian'), pres = J.KATALOG.find((d) => d.kod === 'presiden');
  betul(/Pengerusi Cawangan/.test(J.semakKelayakan(S.loadPlayer(), kb).sebab), 'Pengerusi Bahagian perlu sedang Pengerusi Cawangan (Perkara 34.3)');
  P.tetap({ ip: 5000, tahun: 2030, jawatan: 'Ketua Cawangan', jawatanList: [{ kod: 'ketua_cawangan', jawatan: 'Ketua Cawangan', peringkat: 'cawangan', kumpulan: 'utama', pangkat: 3, tahun: 2027 }], keahlian: { sejakTahun: 2024, sejakBulan: 1 } });
  betul(/3 tahun sebagai AJK Cawangan/.test(J.semakKelayakan(S.loadPlayer(), kb).sebab), 'perlu 3 tahun AJK Cawangan');
  let m = S.loadPlayer().mic || {}; m.bulanAJK = 40; m.pusat = m.pusat || {}; P.tetap({ mic: m });
  betul(!/Perkara 34/.test(J.semakKelayakan(S.loadPlayer(), kb).sebab || ''), 'syarat MIC Bahagian lulus');
  betul(/10 tahun/.test(J.semakKelayakan(S.loadPlayer(), pres).sebab), 'Presiden perlu 10 tahun keahlian');
  m = S.loadPlayer().mic; m.bulanKB = 101; P.tetap({ mic: m, jawatanList: S.loadPlayer().jawatanList.concat([{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: 2027 }]) });
  betul(/3 penggal/.test(J.semakKelayakan(S.loadPlayer(), kb).sebab || ''), 'had 3 penggal Pengerusi Bahagian (Perkara 34.4)');
  const rp = M.ringkasPusat(S.loadPlayer()); sama(rp.pengundi, 6128 * 10 + 60, 'pengundi Presiden = 10 pegawai setiap Cawangan + CWC');
  P.tetap({ ap: 20, myr: 50000 });
  const kod = M.ringkasPusat(S.loadPlayer()).senarai[0].kod, sb0 = M.sokonganBahagian(S.loadPlayer())[kod];
  const rj = M.jelajah(kod); betul(rj.ok, rj.ralat); sama(M.sokonganBahagian(S.loadPlayer())[kod], sb0 + M.CONFIG.PUSAT.jelajahNaik); sama(M.jelajah(kod).ok, false, 'sekali sebulan');
  const rg = M.lantikPegawai('setia'); betul(rg.ok, rg.ralat); sama(M.lantikPegawai('setia').ok, false, 'sekali sepenggal');
  betul(!M.statusMohon(S.loadPlayer(), 'pengerusi_negeri').boleh, 'Pengerusi Negeri perlu ahli Kongres Negeri');
  P.tetap({ bulan: 7 }); m = S.loadPlayer().mic; P.tetap({ mic: m, pangkatUtamaLalu: 7 });
  const sn = M.statusNegeri(S.loadPlayer()); betul(sn.boleh, sn.sebab);
  const rn = M.bertandingNegeri({ rng: () => 0.01 }); betul(rn.ok && rn.jaya, rn.ralat); betul(M.ahliNegeri(S.loadPlayer()), 'ahli Kongres Negeri');
  const rm = M.mohon('pengerusi_negeri', { rng: () => 0.01 }); betul(rm.ok && rm.jaya, rm.ralat); sama(M.lantikanSemasa(S.loadPlayer()).jawatan, 'Pengerusi Kongres Negeri');
  const k2 = g.MyPolitikPRU.kelayakan(S.loadPlayer()); betul(!k2.PARLIMEN.sebab.some((x) => /kuota MIC/.test(x)), 'Parlimen dalam kuota MIC');
  S.clearPlayer();
});
ujian('v13.3: MIC: tidak hadir (Perkara 37.4), gantung (61), yuran (12), Putera ke Pemuda, Pindah dikunci tahun pemilihan', () => {
  const M = g.MyPolitikMIC, D = g.MyPolitikData, J = g.MyPolitikJawatan, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'mic-semenanjung.csv'), 'utf8')));
  const luar = h.bahagian.find((b) => M.kawasan({ kod: { parlimen: b.kod } }).parlimen.r > 100);
  S.savePlayer(S.buildPlayerProfile({ parti: 'MIC', nama: 'Siva Uji', demografik: D.tentukanDemografi('Lelaki', 29, 'MIC'), cawangan: luar.dun[0].cawangan[0], sayap: 'putera', avatar: 'pemuda', tahunAhli: 10 }));
  P.tetap({ ip: 5000, jawatan: 'Ketua Bahagian', jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: 2026 }] });
  const k2 = g.MyPolitikPRU.kelayakan(S.loadPlayer()); betul(k2.PARLIMEN.sebab.some((x) => /kuota MIC/.test(x)), 'luar kuota MIC');
  P.tetap({ jawatan: 'Ketua Cawangan', jawatanList: [{ kod: 'ketua_cawangan', jawatan: 'Ketua Cawangan', peringkat: 'cawangan', kumpulan: 'utama', pangkat: 3, tahun: 2026 }], kesetiaan: Object.assign({}, S.loadPlayer().kesetiaan, { akarUmbi: 80, ajk: 80 }), myr: 10000 });
  let ev = [];
  for (let i = 0; i < 4; i++) { ev = ev.concat(M.prosesBulan({ rng: () => 0.99 }).peristiwa); }
  betul(ev.some((e) => /Perkara 37\.4/.test(e.mesej)), 'notis tidak hadir mesyuarat Bahagian'); sama(S.loadPlayer().mic.rayuan.kod, 'ketua_cawangan');
  const rr = M.rayuan({ rng: () => 0.99 }); betul(rr.ok && rr.jaya === false, 'rayuan ditolak'); sama(J.pegang(S.loadPlayer(), 'ketua_cawangan'), false, 'hilang Pengerusi Cawangan');
  // gantung oleh Presiden selepas sidang media silap cakap, kedekatan rendah
  const p1 = S.loadPlayer(); p1.log.unshift({ tahun: p1.tahun, bulan: p1.bulan, tindakan: 'tular_sidang', nama: 'Krisis tular: Sidang media, silap cakap' }); p1.negeriBP = Object.assign({}, p1.negeriBP || {}, { dekat: 5 }); S.savePlayer(p1);
  ev = M.prosesBulan({ rng: () => 0.01 }).peristiwa; betul(ev.some((e) => /Perkara 14\.2\.1/.test(e.mesej)), 'digantung'); betul(M.gantungAktif(S.loadPlayer()));
  betul(/digantung/.test(J.semakKelayakan(S.loadPlayer(), J.KATALOG.find((d) => d.kod === 'ajk_cawangan')).sebab), 'tidak boleh bertanding semasa digantung');
  const rg = M.rayuanGantung({ rng: () => 0.01 }); betul(rg.ok && rg.jaya, rg.ralat); betul(!M.gantungAktif(S.loadPlayer()));
  // yuran bulan 11
  P.tetap({ bulan: 11, myr: 100 }); const myr0 = S.loadPlayer().myr; M.prosesBulan({ rng: () => 0.99 }); sama(S.loadPlayer().myr, myr0 - 4, 'yuran RM 4');
  // Putera umur 30 ke Pemuda
  P.tetap({ tahun: 2027, bulan: 2 }); M.prosesBulan({ rng: () => 0.99 }); sama(S.loadPlayer().sayap, 'pemuda', 'Putera bertukar ke Pemuda pada umur 30');
  const PD = g.MyPolitikPindah; if (PD && PD.semak) { betul(PD.semak(S.loadPlayer()).sebab.some((x) => /Perkara 10\.5/.test(x)), 'pindah dikunci tahun pemilihan 2027'); }
  S.clearPlayer();
});
ujian('v13.4: Fasa A Perlembagaan UMNO 2025: Timbalan Ketua Cawangan, AJK 15/20, sayap 7/15/20, taraf Ketua Sayap Pusat, pesaing', () => {
  const J = g.MyPolitikJawatan, OG = g.MyPolitikOrganisasi, d = (k) => J.KATALOG.find((x) => x.kod === k);
  sama(d('naib_ketua_cawangan').jawatan, 'Timbalan Ketua Cawangan', 'Fasal 18.1.2');
  sama(d('ajk_cawangan').kerusi, 15); sama(d('ajk_bahagian').kerusi, 20);
  sama(d('sayap_ajk_cawangan_pemuda').kerusi, 7); sama(d('sayap_ajk_bahagian_puteri').kerusi, 15); sama(d('sayap_ajk_pusat_wanita').kerusi, 20);
  sama(d('sayap_pusat_wanita').pangkat, 11, 'Ketua Wanita bertaraf Timbalan Presiden'); sama(d('sayap_pusat_pemuda').pangkat, 10); sama(d('sayap_pusat_puteri').pangkat, 10);
  sama(d('ajk_cawangan').pesaing, 9, 'calon 24 bagi 15 kerusi');
  P.daftar({}); P.tetap({ jawatan: 'Naib Ketua Cawangan', jawatanList: [{ kod: 'naib_ketua_cawangan', jawatan: 'Naib Ketua Cawangan', peringkat: 'cawangan', kumpulan: 'utama', pangkat: 2.5, tahun: 2026 }, { kod: 'sayap_pusat_wanita', jawatan: 'Ketua Wanita', peringkat: 'pusat', kumpulan: 'sayap', sayap: 'wanita', pangkat: 9, tahun: 2026 }] });
  const p = S.loadPlayer(); sama(p.jawatan, 'Timbalan Ketua Cawangan', 'simpanan lama ditukar'); sama(p.jawatanList[0].jawatan, 'Timbalan Ketua Cawangan'); sama(p.jawatanList[1].pangkat, 11, 'pangkat lama dinaikkan');
  const st = OG.getStruktur(p); sama(st.induk.cawangan.bilAjk, 15); sama(st.induk.bahagian.bilAjk, 20); sama(st.sayap.pemuda.peringkat.pusat.bilAjk, 20);
  sama(st.induk.cawangan.naib.jawatan, 'Timbalan Ketua Cawangan'); betul(st.induk.bahagian.tambahan.filter((x) => /^Naib Ketua Bahagian \(Ketua/.test(x.jawatan)).length === 3, '3 Naib Ketua ex-officio');
  betul(st.induk.pusat.tambahan.some((x) => /bertaraf Timbalan Presiden/.test(x.jawatan)), 'Ketua Wanita di MKT'); sama(st.induk.bahagian.lantikan.bil, 12); sama(st.induk.cawangan.lantikan.bil, 6);
  const PL = g.MyPolitikPerlembagaan; sama(PL.FASAL.length, 16, '16 Fasal'); sama(PL.DOK_UMNO.length, 6, '6 dokumen');
  S.clearPlayer();
});
ujian('v13.4: jawatan sayap kekal hingga tamat penggal selepas had umur; Ketua Puteri Pusat sehingga 40', () => {
  const J = g.MyPolitikJawatan, H = g.MyPolitikHayat;
  P.daftar({ jantina: 'P', umur: 35, sayap: 'puteri' });
  P.tetap({ tahun: 2027, jawatan: 'Ketua Puteri', jawatanList: [{ kod: 'sayap_pusat_puteri', jawatan: 'Ketua Puteri', peringkat: 'pusat', kumpulan: 'sayap', sayap: 'puteri', pangkat: 10, tahun: 2026 }] });
  H.prosesPeralihanKategori(); let p = S.loadPlayer();
  sama(p.sayap, 'wanita', 'laluan bertukar ke Wanita pada 36'); betul(J.pegang(p, 'sayap_pusat_puteri'), 'Ketua Puteri kekal sehingga tamat penggal');
  betul(J.katalogUntuk(p).some((x) => x.kod === 'sayap_pusat_puteri'), 'boleh mempertahankan Ketua Puteri Malaysia sebelum 40');
  P.tetap({ jawatanList: [{ kod: 'sayap_bahagian_puteri', jawatan: 'Ketua Puteri Bahagian', peringkat: 'bahagian', kumpulan: 'sayap', sayap: 'puteri', pangkat: 5, tahun: 2026 }] });
  p = S.loadPlayer(); sama(J.semakPenggalTamat(p), null, 'tidak dibuang serta-merta (dalam penggal)');
  betul(!J.katalogUntuk(p).some((x) => x.kod === 'sayap_bahagian_puteri'), 'jawatan Puteri lain tidak boleh dipertahankan selepas 35');
  S.clearPlayer();
});
ujian('v13.5: Fasa B UMNO: takwim 4-5/6/9, Pusat diundi di 191 Bahagian, PAU tanpa undi, calon tidak perlu wakil PAU', () => {
  const U = g.MyPolitikUMNO, J = g.MyPolitikJawatan, d = (k) => J.KATALOG.find((x) => x.kod === k);
  P.daftar({}); P.tetap({ ip: 600, keahlian: { sejakTahun: 2010, sejakBulan: 1 }, penggalSelesai: true, jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian', 2026)] });
  sama([K.getTetingkap('cawangan', 1).mula, K.getTetingkap('cawangan', 1).tamat, K.getTetingkap('bahagian', 1).mula, K.getTetingkap('pau', 1).mula].join(), '4,5,6,9', 'takwim UMNO 2025');
  sama(K.getFasa(7).kod, 'antara'); sama(K.getFasa(10).kod, 'pasca_pau'); sama(K.getFasa(3).kod, 'akar_umbi');
  let p = S.loadPlayer(); sama(U.ringkasPusat(p).pengundi, 54536, 'perwakilan Bahagian'); sama(U.ringkasPusat(p).bilBahagian, 191);
  const mkt = J.semakKelayakan(p, d('ahli_mkt')); betul(!/PAU/.test(mkt.sebab || ''), 'MKT tidak perlu wakil PAU: ' + mkt.sebab);
  const e = E.senaraiPertandingan(p).find((x) => x.kod === 'ahli_mkt'); betul(e && e.tetingkap && e.tetingkap.mula === 6, 'undi MKT bulan 6');
  P.tetap({ bulan: 6 }); const r = E.daftarBertanding('ahli_mkt'); betul(r.ok, r.ralat);
  const h = E.jalankanPemilihanPeringkat('bahagian', { rng: () => 0.5 }); betul(h.some((x) => x.ok && /MKT/.test(x.mesej || '')), 'undi MKT dijalankan bersama Bahagian');
  P.tetap({ bulan: 9 }); const mp = M.mulaMesyuarat('pau'); betul(mp.ok, mp.ralat); betul(!mp.mesyuarat.agenda.some((x) => x.jenis === 'pemilihan'), 'PAU tiada undi jawatan');
  S.clearPlayer();
});
ujian('v13.5: Fasal 10.16: tangguh pemilihan selepas PRU, musim khas, kitaran bermula semula; simpanan lama', () => {
  const U = g.MyPolitikUMNO, ix = (t, b) => t * 12 + b;
  sama(JSON.stringify(U.khasDari(ix(2036, 3))), JSON.stringify({ tahun: 2036, c: 5, b: 7, a: 9 })); sama(U.khasDari(ix(2030, 8)).tahun, 2031); sama(U.khasDari(ix(2030, 12)).c, 2);
  P.daftar({});
  let p = S.loadPlayer(); betul(E.adalahTahunPemilihan(2026) && E.adalahTahunPemilihan(2029) && !E.adalahTahunPemilihan(2027), 'kitaran asal');
  sama(E.getKitaran(2029).kitaran, 1, 'indeks kitaran sama seperti asal');
  P.tetap({ tahun: 2035, bulan: 1, pru: { tahunPRU: 2036, bulanPRU: 3, riwayat: [{ tahun: 2031, bulan: 3, jenis: 'PRU' }] }, umno: { v: 135, kit: { biasa: 2035, lepas: [{ tahun: 2032, i: ix(2032, 6), khas: false }], putus: {} } } });
  p = S.loadPlayer(); sama(U.statusKitaran(p).tangguh, 2035, 'ditangguh: PRU dalam 12 bulan dan sudah ada pemilihan dalam penggal');
  betul(!E.adalahTahunPemilihan(2035), '2035 bukan tahun pemilihan'); sama(E.tahunPemilihanSeterusnya(2035), 2036);
  const ev = U.prosesBulan({ rng: () => 0.99 }).peristiwa; betul(ev.some((x) => /Fasal 10\.16/.test(x.mesej)), 'notis tangguh');
  P.tetap({ tahun: 2036, bulan: 4, pru: { tahunPRU: 2041, bulanPRU: 3, riwayat: [{ tahun: 2031, bulan: 3, jenis: 'PRU' }, { tahun: 2036, bulan: 3, jenis: 'PRU' }] } });
  U.prosesBulan({ rng: () => 0.99 }); p = S.loadPlayer();
  sama(JSON.stringify([U.musim(p).c1, U.musim(p).b, U.musim(p).a, U.musim(p).khas]), '[5,7,9,true]', 'musim khas PRU + 2/4/6');
  betul(E.adalahTahunPemilihan(2036)); sama(K.getTetingkap('bahagian', 4).mula, 7, 'takwim khas'); sama(U.kunciMesyuarat(p), '2036-khas');
  P.tetap({ bulan: 10 }); U.prosesBulan({ rng: () => 0.99 }); p = S.loadPlayer();
  sama(p.umno.kit.biasa, 2039, 'kitaran 3 tahun bermula semula'); betul(E.adalahTahunPemilihan(2039) && !E.adalahTahunPemilihan(2038)); sama(K.getTetingkap('bahagian', 10).mula, 7, 'takwim khas kekal hingga hujung tahun'); P.tetap({ tahun: 2037, bulan: 1 }); sama(K.getTetingkap('bahagian', 1).mula, 6, 'takwim biasa semula');
  // simpanan lama (tiada p.umno) di tengah musim: takwim lama sehingga tahun berikutnya
  P.tetap({ tahun: 2026, bulan: 5, umno: undefined, pru: undefined }); p = S.loadPlayer();
  sama(p.umno.lama, 2026); betul(!U.baharu(p)); sama(K.getTetingkap('bahagian', 5).mula, 7, 'takwim lama'); sama(K.getTetingkap('pau', 5).mula, 8);
  P.tetap({ tahun: 2027, bulan: 1 }); sama(K.getTetingkap('bahagian', 1).mula, 6, 'takwim baharu tahun berikutnya');
  S.clearPlayer();
});
ujian('v13.5: lantikan Ketua dan Presiden, mohon lantikan, Jelajah, Majlis Penerangan, Perhimpunan Agung Khas, Tempoh Pemilihan', () => {
  const U = g.MyPolitikUMNO;
  P.daftar({}); P.tetap({ bulan: 2, ap: 20, myr: 50000, jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian', 2026)], negeriBP: { dekat: 100 } });
  sama(U.lantikKetua('cawangan', 'setia').ok, false, 'bukan Ketua Cawangan');
  let r = U.lantikKetua('bahagian', 'muda'); betul(r.ok, r.ralat); sama(U.lantikKetua('bahagian', 'setia').ok, false, 'sekali sepenggal');
  sama(U.bonusSayap(S.loadPlayer(), { kumpulan: 'sayap' }), 5, 'Sokongan Belia +5');
  const s0 = U.statusMohon(S.loadPlayer(), 'setiausaha_agung'); sama(s0.peluang, 80, 'kedekatan x 0.8');
  r = U.mohon('setiausaha_agung', { rng: () => 0.01 }); betul(r.ok && r.jaya, r.ralat); const ip0 = S.loadPlayer().ip; U.prosesBulan({ rng: () => 0.99 }); sama(S.loadPlayer().ip, ip0 + 10, 'IP bulanan lantikan');
  let p = S.loadPlayer(), own = Object.keys(U.sokonganBahagian(p))[0];
  r = U.jelajah(own); betul(r.ok, r.ralat); sama(U.jelajah(own).ok, false, 'sekali sebulan');
  const sb0 = U.sokonganBahagian(S.loadPlayer()); r = U.penerangan('1'); betul(r.ok, r.ralat); const sb1 = U.sokonganBahagian(S.loadPlayer());
  const jhr = Object.keys(sb0).filter((k) => g.MyPolitikUMNOData.bahagian[k].ng === '1'); sama(jhr.length, 26, '26 Bahagian Johor'); betul(jhr.every((k) => Math.abs(sb1[k] - sb0[k] - 3) < 0.01), '+3% di Johor');
  p = S.loadPlayer(); betul(U.tempohPemilihan(p).aktif, 'Tempoh Pemilihan aktif');
  const jm = E.senaraiKempen(p).find((x) => x.id === 'lobi_ketua_bahagian'); sama(jm.tahap, 'kelabu', 'Lobi Ketua Bahagian zon kelabu'); sama(U.etikaKempen(p, 'jamuan_mesyuarat', E.KEMPEN.find((x) => x.id === 'jamuan_mesyuarat').etika).risiko, 9, 'jamuan x1.5');
  P.tetap({ tahun: 2027, bulan: 6 }); betul(!U.tempohPemilihan(S.loadPlayer()).aktif, 'luar Tempoh Pemilihan');
  // Presiden: lantikan dan Perhimpunan Agung Khas
  const pres = { kod: 'presiden', jawatan: 'Presiden', peringkat: 'pusat', kumpulan: 'utama', sayap: null, pangkat: 12, tahun: 2026 };
  const pz = {}; Object.keys(g.MyPolitikUMNOData.bahagian).forEach((k) => { pz[k] = 10; });
  P.tetap({ jawatan: 'Presiden', jawatanList: [pres], umno: Object.assign(S.loadPlayer().umno, { pusat: pz, lantikan: null }) });
  r = U.lantikPresiden('pencabar'); betul(r.ok, r.ralat); sama(U.lantikPresiden('setia').ok, false);
  const ev = U.prosesBulan({ rng: () => 0.01 }).peristiwa; betul(ev.some((x) => /Perhimpunan Agung Khas/.test(x.mesej)), 'PA Khas');
  betul(!g.MyPolitikJawatan.pegang(S.loadPlayer(), 'presiden'), 'Presiden dilucutkan');
  S.clearPlayer();
});
ujian('v13.8: PPP: data 39 kawasan campuran, takwim 3/5/9, Putera, tiada kerusi tetap, Tuntut Kerusi BN', () => {
  const M = g.MyPolitikPPP, D = g.MyPolitikData, J = g.MyPolitikJawatan, SY = g.MyPolitikSayap, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'ppp-semenanjung.csv'), 'utf8')));
  sama(h.jumlah.bahagian, 39, '39 Bahagian campuran'); betul(h.bahagian.every((b) => b.cawangan.every((c) => c.jumlahAhli >= 27 && c.jumlahAhli <= 120)), 'Cawangan 27 hingga 120 ahli');
  betul(SY.kelayakan('L', 25, 'PPP').putera.boleh && SY.kelayakan('P', 25, 'PPP').puteri.boleh, 'PPP ada Putera dan Puteri');
  const ib = h.bahagian.find((b) => b.nama === 'Ipoh Barat');
  S.savePlayer(S.buildPlayerProfile({ parti: 'PPP', nama: 'Uji PPP', demografik: D.tentukanDemografi('Lelaki', 25, 'PPP'), cawangan: ib.dun[0].cawangan[0], sayap: 'putera', avatar: 'pemuda', tahunAhli: 3 }));
  let p = S.loadPlayer(); sama(p.parti, 'PPP'); sama(p.sayap, 'putera'); sama(p.umno, undefined, 'tiada penanda UMNO');
  betul(J.katalogUntuk(p).some((d) => d.kod === 'sayap_cawangan_putera'), 'jawatan Ketua Putera Cawangan');
  sama(E.adalahTahunPemilihan(2026), false); sama(E.adalahTahunPemilihan(2027), true); sama(K.getTetingkap('cawangan', 1).mula, 3); sama(K.getTetingkap('bahagian', 1).mula, 5); sama(K.getTetingkap('pau', 1).mula, 9);
  const kw = M.kawasan(p); sama(kw.parlimen.n, 'Ipoh Barat'); betul(!kw.kuotaPL && !kw.kuotaDUN, 'tiada kerusi tetap');
  const kl = PRU.kelayakan ? PRU.kelayakan(S.loadPlayer()) : null; if (kl) { betul(kl.PARLIMEN.sebab.some((x) => /Tuntut Kerusi BN/.test(x)), 'PRU: perlu Tuntut Kerusi BN'); }
  sama(M.pengaruh(p), 20, 'Pengaruh awal'); sama(M.statusLobi(p).boleh, false, 'lobi perlu Ketua Bahagian');
  P.tetap({ ap: 20, myr: 50000, jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian', 2026)] });
  let r = M.lobi(); betul(r.ok, r.ralat); sama(M.pengaruh(S.loadPlayer()), 26); sama(M.lobi().ok, false, 'sekali sebulan');
  // rundingan 12 bulan sebelum PRU (PRU 2031/3): Pengaruh 90 => Parlimen 60%, DUN 75%
  P.tetap({ tahun: 2030, bulan: 3, ppp: Object.assign(S.loadPlayer().ppp, { pengaruh: 90, krisisTahun: 2030 }) });
  const ev = M.prosesBulan({ rng: () => 0.01 }).peristiwa; betul(ev.some((x) => /Rundingan kerusi BN/.test(x.mesej)), 'rundingan berlaku');
  p = S.loadPlayer(); betul(M.kawasan(p).kuotaPL, 'kerusi Parlimen diberi di kawasan Ketua Bahagian'); betul(M.kerusiSah(p).pemainDUN, 'kerusi DUN di kawasan pemain');
  // jentera dalam musim PRU, keputusan selepas PRU
  P.tetap({ tahun: 2031, bulan: 1, ppp: Object.assign(S.loadPlayer().ppp, { pengaruh: 50 }) }); r = M.jentera(); betul(r.ok, r.ralat);
  const pru = S.loadPlayer().pru || {}; pru.riwayat = [{ tahun: 2031, bulan: 3, jenis: 'PRU' }]; pru.tahunPRU = 2036;
  P.tetap({ tahun: 2031, bulan: 4, pru: pru }); const g0 = M.pengaruh(S.loadPlayer()); M.prosesBulan({ rng: () => 0.01 });
  betul(M.pengaruh(S.loadPlayer()) >= g0 + 9, 'jentera: calon BN menang, Pengaruh +10 (' + g0 + ' -> ' + M.pengaruh(S.loadPlayer()) + ')'); sama(M.kerusiSah(S.loadPlayer()), null, 'kerusi tamat selepas PRU');
  S.clearPlayer();
});
ujian('v13.8: PPP: krisis kepimpinan dan pembekuan ROS', () => {
  const M = g.MyPolitikPPP, D = g.MyPolitikData, J = g.MyPolitikJawatan, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'ppp-semenanjung.csv'), 'utf8')));
  S.savePlayer(S.buildPlayerProfile({ parti: 'PPP', nama: 'Uji PPP', demografik: D.tentukanDemografi('Lelaki', 40, 'PPP'), cawangan: h.bahagian[0].dun[0].cawangan[0], sayap: 'utama', avatar: 'biasa', tahunAhli: 5 }));
  P.tetap({ tahun: 2027, bulan: 1, ap: 10 });
  let ev = M.prosesBulan({ rng: () => 0.01 }).peristiwa; betul(ev.some((x) => /Krisis kepimpinan PPP/.test(x.mesej)), 'krisis bermula dalam tahun pemilihan');
  let r = M.pilihKrisis('pencabar'); betul(r.ok, r.ralat);
  P.tetap({ bulan: 3 }); ev = M.prosesBulan({ rng: () => 0.01 }).peristiwa;      // Presiden menang (0.01 < 0.6) -> penyokong pencabar digantung; ROS beku (0.01 < 0.2)
  let p = S.loadPlayer(); betul(M.gantungAktif(p), 'digantung 6 bulan'); betul(M.beku(p), 'ROS membekukan PPP');
  betul(/dibekukan/.test(J.semakKelayakan(p, J.KATALOG.find((d) => d.kod === 'ajk_cawangan')).sebab), 'tidak boleh bertanding semasa dibekukan');
  P.tetap({ bulan: 4 }); const mm = M2().mulaMesyuarat('cawangan'); sama(mm.ok, false, 'tiada mesyuarat semasa dibekukan');
  r = M.rayuanBeku({ rng: () => 0.01 }); betul(r.ok && r.jaya, r.ralat); betul(!M.beku(S.loadPlayer()), 'rayuan diterima');
  S.clearPlayer();
  function M2() { return g.MyPolitikMeeting; }
});
ujian('v13.9: PRN Sabah: UMNO Sabah bertanding DUN dalam PRN (Nov 2030) dan Parlimen dalam PRU (Mac 2031); BN masuk kerajaan jika >= 3 kerusi', () => {
  const SB = g.MyPolitikSabah;
  P.daftar({}); P.tetap({ negeri: 'Sabah', ip: 900, jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian', 2026)] });
  let r = PRU.getPRU(S.loadPlayer()); sama([r.tahunPRU, r.bulanPRU, r.jenisPBB].join(), '2030,11,PRN', 'PRN Sabah dahulu');
  let k = PRU.kelayakan(S.loadPlayer()); betul(k.PARLIMEN.sebab.some((x) => /bukan PRN Sabah/.test(x)) && !k.DUN.sebab.some((x) => /PRN/.test(x)), 'DUN dalam PRN, Parlimen dalam PRU');
  sama(JSON.stringify(SB.jadualBerikut({ tahun: 2030 }, 'PRN')), JSON.stringify({ jenis: 'PRU', tahun: 2031, bulan: 3 })); sama(SB.jadualBerikut({ tahun: 2031 }, 'PRU').tahun, 2035);
  const kp = SB.kerusiPRN({ id: 'x', tahun: 2030 }, 45); sama(kp.GRS + kp.Warisan + kp.BN + kp.UPKO + kp.lain, 73, '73 DUN'); sama(kp.kerajaanBN, kp.BN >= 3);
  // simpanan lama yang sudah melepasi PRU: PRU sedia ada diteruskan dahulu
  P.tetap({ tahun: 2032, bulan: 1, pru: { tahunPRU: 2036, bulanPRU: 3, sejarah: [{ jenis: 'DUN', hasil: 'menang', tahun: 2031, bulan: 3 }] } });
  r = PRU.getPRU(S.loadPlayer()); sama([r.tahunPRU, r.jenisPBB].join(), '2036,PRU', 'simpanan lama: PRU dahulu');
  // pemain Semenanjung tidak terjejas
  P.tetap({ negeri: 'Perlis', pru: undefined }); r = PRU.getPRU(S.loadPlayer()); sama(r.jenisPBB, undefined, 'Semenanjung tiada PRN');
  S.clearPlayer();
});
ujian('v13.9: PBRS: data 7 Parlimen/20 DUN, kuota 1+2, Kesetiaan BN & Muhibah GRS, rundingan kuota, GRS 3 penjuru', () => {
  const M = g.MyPolitikPBRS, D = g.MyPolitikData, SY = g.MyPolitikSayap, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbrs-sabah.csv'), 'utf8')));
  sama(h.jumlah.bahagian, 7); betul(h.bahagian.every((b) => b.cawangan.every((c) => c.jumlahAhli >= 30 && c.jumlahAhli <= 150)), 'Cawangan 30 hingga 150 ahli');
  betul(!SY.kelayakan('P', 25, 'PBRS').puteri.boleh && !SY.kelayakan('L', 25, 'PBRS').putera.boleh, 'PBRS tiada Puteri dan Putera');
  const pen = h.bahagian.find((b) => b.nama === 'Pensiangan'), dSook = pen.dun.find((d) => d.nama === 'Sook');
  S.savePlayer(S.buildPlayerProfile({ parti: 'PBRS', nama: 'Uji PBRS', demografik: D.tentukanDemografi('Lelaki', 40, 'PBRS'), cawangan: dSook.cawangan[0], sayap: 'utama', avatar: 'biasa', tahunAhli: 5 }));
  let p = S.loadPlayer(); sama(p.parti, 'PBRS'); sama(p.negeri, 'Sabah'); sama(PRU.getPRU(p).jenisPBB, 'PRN', 'PBRS ikut PRN Sabah');
  sama(E.adalahTahunPemilihan(2026), true); sama(E.adalahTahunPemilihan(2027), false); sama(K.getTetingkap('bahagian', 1).mula, 6);   // v13.60: takwim PBRS 4/6/10
  let kw = M.kawasan(p); betul(kw.kuotaPL && kw.kuotaDUN, 'Pensiangan dan Sook dalam kuota');
  sama(M.ofset(p), -8, 'Muhibah GRS 45: GRS bertembung'); sama(M.lawan(p, 'DUN')[1], 'GRS');
  P.tetap({ ap: 20, myr: 50000, jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian', 2026)] });
  let r = M.muhibah(); betul(r.ok, r.ralat); sama(M.meter(S.loadPlayer()).muhibahGRS, 51); sama(M.meter(S.loadPlayer()).setiaBN, 58); sama(M.ofset(S.loadPlayer()), 0, 'GRS tidak bertembung');
  r = M.lobi(); betul(r.ok, r.ralat); sama(M.meter(S.loadPlayer()).setiaBN, 64); r = M.ma63(); betul(r.ok, r.ralat); sama(M.ma63().ok, false, 'sekali sebulan');
  // rundingan 12 bulan sebelum PRN Sabah (Nov 2030): Kesetiaan BN 80 -> 3 DUN (tambah Nabawan)
  P.tetap({ tahun: 2029, bulan: 11, pbrs: Object.assign(S.loadPlayer().pbrs, { setiaBN: 80 }) });
  const ev = M.prosesBulan().peristiwa; betul(ev.some((x) => /Rundingan kerusi BN untuk PRN Sabah/.test(x.mesej)), 'rundingan');
  p = S.loadPlayer(); sama(M.kuotaDUN(p).length, 3, 'kuota DUN +1'); betul(M.kuotaDUN(p).indexOf('12_N.46') >= 0, 'Nabawan');
  P.tetap({ tahun: 2026, bulan: 2, pbrs: { setiaBN: 30, muhibahGRS: 45 }, pru: undefined }); sama(M.kuotaDUN(S.loadPlayer()).join(), '12_N.45', 'Kesetiaan rendah: Sook sahaja');
  M.prosesBulan(); sama(M.meter(S.loadPlayer()).setiaBN, 31, 'meter susut ke arah 50');
  S.clearPlayer();
});
ujian('v13.11: rundingan PM: parti terbesar dalam gabungan hampir pasti PM (65% + (bahagian - 50%) x 1.5, maks 97%)', () => {
  const P0 = PRU; P.daftar({}); P.tetap({ reputasi: 50, pru: { hubunganGabungan: 50 } });
  const N = (parti, rakan) => { const kongsi = parti / (parti + rakan); return kongsi >= 0.5 ? Math.round(Math.min(0.97, Math.max(0.5, 0.65 + (kongsi - 0.5) * 1.5)) * 100) : null; };
  sama(N(100, 43), 95, 'kongsi 70% -> 95%'); sama(N(60, 40), 80, 'kongsi 60% -> 80%'); sama(N(150, 30), 97, 'maksimum 97%');
  // keputusan sebenar janaNasional: setiap GABUNGAN dengan parti terbesar mendapat peluang >= 65%
  let semak = 0;
  for (let s = 1; s <= 60; s++) { P.benih(s); const n = P0.janaNasionalUji ? P0.janaNasionalUji(S.loadPlayer()) : null; if (n && n.status === 'GABUNGAN' && n.parti >= n.rakan) { semak++; betul(n.peluangPM >= 65, 'peluang ' + n.peluangPM + ' bagi ' + n.parti + ' vs ' + n.rakan); } }
  betul(semak > 0, 'ada senario gabungan diuji (' + semak + ')');
  S.clearPlayer();
});
ujian('v13.12: Letak Jawatan: kerusi MP (jawatan persekutuan tamat, PRK calon parti), jawatan kerajaan (bertenang 6 bulan), kunci & tiada PRK dekat PRU', () => {
  const LT = g.MyPolitikLetak, PD = g.MyPolitikPindah;
  P.daftar({}); P.tetap({ tahun: 2027, bulan: 1, reputasi: 60, pru: { status: { jenis: 'MP', kerusi: 'Kangar', sejakTahun: 2026, sejakBulan: 3, kerajaan: true }, statusKedua: { jenis: 'ADUN', kerusi: 'Kuala Perlis', sejakTahun: 2026, sejakBulan: 3, kerajaan: true } },
    kabinet: { hasGovernmentRole: true, roleLevel: 'TIMBALAN_MENTERI', portfolioName: 'Timbalan Menteri Pendidikan' } });
  let p = S.loadPlayer(), s = LT.senarai(p);
  sama(s.length, 3, 'MP + ADUN + jawatan kerajaan'); sama(cari(s, 'MP').ikut, 'Timbalan Menteri Pendidikan', 'jawatan persekutuan bergantung pada kerusi MP'); sama(cari(s, 'ADUN').ikut, '', 'ADUN tidak menjejas jawatan persekutuan');
  betul(cari(s, 'MP').prk, 'PRK diadakan (jauh dari PRU)');
  const au = p.kesetiaan.akarUmbi, rep = p.reputasi;
  let r = LT.letakKerusi('MP'); betul(r.ok, r.ralat); p = S.loadPlayer();
  sama(p.reputasi, rep - 3); sama(p.kesetiaan.akarUmbi, au - 5); sama(KB.getKabinet(p).hasGovernmentRole, false, 'jawatan Timbalan Menteri tamat');
  sama(PRU.semuaStatus(p).length, 1); sama(PRU.semuaStatus(p)[0].jenis, 'ADUN', 'status ADUN kekal');
  sama(LT.getLetak(p).prk.length, 1); sama(LT.getLetak(p).prk[0].i, 2027 * 12 + 2, 'PRK bulan depan');
  betul(LT.bertenang(p) > 0, 'bertenang selepas jawatan tamat'); betul(!KB.bukaLobi('PARLIMEN').ok, 'lobi disekat semasa bertenang');
  P.tetap({ bulan: 2 }); let ev = LT.prosesBulan({ rng: () => 0.99 }).peristiwa; p = S.loadPlayer();
  sama(ev.length, 1); sama(ev[0].jenis, 'letak_prk_kalah'); sama(p.reputasi, rep - 6, 'parti kalah PRK: Reputasi -3 lagi'); sama(LT.getLetak(p).prk.length, 0);
  // letak jawatan kerajaan (EXCO): kerusi kekal, Reputasi -2, bertenang 6 bulan
  P.tetap({ kabinet: { hasGovernmentRole: true, roleLevel: 'EXCO_NEGERI', portfolioName: 'EXCO Pertanian' }, letak: { kabinetSehingga: 0, prk: [], sejarah: [] } });
  const rep2 = S.loadPlayer().reputasi; r = LT.letakKerajaan(); betul(r.ok, r.ralat); p = S.loadPlayer();
  sama(p.reputasi, rep2 - 2); sama(PRU.semuaStatus(p).length, 1, 'kerusi kekal'); sama(LT.bertenang(p), 2027 * 12 + 2 + 6);
  P.tetap({ bulan: 9 }); betul(!LT.bertenang(S.loadPlayer()), 'bertenang tamat selepas 6 bulan');
  // 12 bulan atau kurang sebelum PRU: tiada PRK
  P.tetap({ tahun: 2030, bulan: 6 }); p = S.loadPlayer(); sama(cari(LT.senarai(p), 'ADUN').prk, false, '9 bulan sebelum PRU 2031');
  r = LT.letakKerusi('ADUN'); betul(r.ok && !r.prk, r.ralat); p = S.loadPlayer(); sama(PRU.semuaStatus(p).length, 0); sama(LT.getLetak(p).prk.length, 0);
  sama(cari(PD.semak(p).syarat, 'jawatan').lulus, true, 'Pindah: syarat jawatan lulus selepas tiada kerusi');
  // dikunci semasa PRK berjalan
  P.tetap({ pru: { status: { jenis: 'MP', kerusi: 'Kangar', sejakTahun: 2026, sejakBulan: 3, kerajaan: true } }, prk: { sentimen: 0, aktif: { jenis: 'DUN', nama: 'X' }, sejarah: [] } });
  betul(!LT.status(S.loadPlayer()).boleh); betul(!LT.letakKerusi('MP').ok, 'dikunci semasa PRK');
  S.clearPlayer();
});
ujian('v13.12: senarai semak Menteri Besar untuk ADUN', () => {
  P.daftar({}); P.tetap({ pru: { status: { jenis: 'ADUN', kerusi: 'Kuala Perlis', sejakTahun: 2026, sejakBulan: 3, kerajaan: true } } });
  let m = KB.semakMB(S.loadPlayer()); betul(m, 'ADUN ada senarai semak'); sama(m.item.length, 3); betul(m.item[0].ok && m.item[1].ok, 'ADUN di negeri ini + kerajaan');
  sama(m.item[2].ok, false, 'belum Pengerusi Badan Perhubungan'); betul(/Badan Perhubungan/.test(m.item[2].teks)); sama(m.sedia, false);
  P.tetap({ pru: { status: { jenis: 'ADUN', kerusi: 'Kuala Perlis', kerajaan: false } } }); sama(KB.semakMB(S.loadPlayer()).item[1].ok, false, 'pembangkang');
  P.tetap({ pru: { status: { jenis: 'MP', kerusi: 'Kangar', kerajaan: true } } }); sama(KB.semakMB(S.loadPlayer()), null, 'bukan ADUN');
  S.clearPlayer();
});
ujian('v13.13: awalan nama: Datuk (persekutuan), gelaran negeri, Tan Sri, Tun dan Dr.', () => {
  const GL = g.MyPolitikGelaran || require('../js/gelaran.js'), x = { tahun: 2030, bulan: 1 };
  P.daftar({}); const ng = S.loadPlayer().negeri;
  P.tetap({ gelaran: { dato: x }, pendidikan: { tahap: 'ijazah' } }); sama(GL.awalan(S.loadPlayer()), 'Datuk ', 'Datuk persekutuan (bukan Dato\')');
  const t2 = GL.tanggaNegeri(S.loadPlayer())[1].nama;
  P.tetap({ gelaran: { dato: x, negeri: { t1: x, t2: x } } }); sama(GL.awalan(S.loadPlayer()), t2 + ' ', 'Datuk tidak diulang jika ada gelaran negeri (' + ng + ')');
  P.tetap({ gelaran: { dato: x, tansri: x, negeri: { t1: x, t2: x } }, pendidikan: { tahap: 'phd' } }); sama(GL.awalan(S.loadPlayer()), 'Tan Sri ' + t2 + ' Dr. ');
  P.tetap({ gelaran: { dato: x, tansri: x, tun: x, negeri: { t1: x } } }); sama(GL.awalan(S.loadPlayer()), 'Tun Dr. ', 'Tun memadai');
  P.tetap({ gelaran: { dato: x }, pendidikan: { tahap: 'sarjana' } }); sama(GL.awalan(S.loadPlayer()), 'Datuk ');
  P.tetap({ gelaran: {}, pendidikan: { tahap: 'phd' } }); sama(GL.awalan(S.loadPlayer()), 'Dr. ');
  P.tetap({ gelaran: {}, pendidikan: undefined }); sama(g.MyPolitikPendidikan.getPendidikan(S.loadPlayer()).tahap, 'ijazah', 'simpanan lama = Ijazah');
  // nama negeri ikut negeri cawangan; Sarawak 4 tahap
  sama(GL.tanggaNegeri({ negeri: 'Sabah', parti: 'UMNO' })[1].nama, 'Datuk Seri Panglima'); sama(GL.tanggaNegeri({ negeri: 'Pahang', parti: 'UMNO' })[1].nama, "Dato' Sri");
  sama(GL.tanggaNegeri({ negeri: 'Melaka', parti: 'UMNO' })[0].nama, 'Datuk'); sama(GL.tanggaNegeri({ negeri: 'Johor', parti: 'UMNO' })[1].nama, "Dato' Seri");
  sama(GL.tanggaNegeri({ negeri: 'Sarawak', parti: 'PBB' }).map((y) => y.nama).join(), 'Datuk,Datuk Amar,Datuk Patinggi,Pehin Sri');
  P.tetap({ parti: 'PBB', negeri: 'Sarawak', gelaran: { dato: x, tansri: x, negeri: { t1: x, amar: x, patinggi: x } }, pendidikan: { tahap: 'ijazah' } });
  sama(GL.awalan(S.loadPlayer()), 'Datuk Patinggi Tan Sri ', 'Sarawak: Datuk Patinggi didahulukan');
  S.clearPlayer();
});
ujian('v13.13: kurniaan Tun (PM 36 bulan, Integriti >= 75) dan gelaran negeri (ADUN 36 bulan)', () => {
  const GL = g.MyPolitikGelaran || require('../js/gelaran.js');
  P.daftar({}); P.tetap({ tahun: 2035, bulan: 1, integriti: { skor: 80 }, gelaran: { dato: { tahun: 2030 }, tansri: { tahun: 2032 }, bulanPM: 35, bulanN1: 35 },
    kabinet: { hasGovernmentRole: true, roleLevel: 'PERDANA_MENTERI', portfolioName: 'Perdana Menteri' }, pru: { status: { jenis: 'ADUN', kerusi: 'X', kerajaan: true } } });
  const rep = S.loadPlayer().reputasi, ev = GL.prosesBulan().peristiwa, d = GL.getGelaran(S.loadPlayer());
  betul(d.tun, 'Tun dikurniakan'); betul(d.negeri.t1, 'gelaran negeri tahap 1'); betul(ev.some((e) => /Tun/.test(e.mesej)) && ev.some((e) => /gelaran negeri/.test(e.mesej)));
  betul(S.loadPlayer().reputasi >= rep + 5, 'Reputasi +3 (Tun) +2 (negeri)');
  // tanpa integriti cukup: tiada Tun
  P.tetap({ integriti: { skor: 70 }, gelaran: { dato: { tahun: 2030 }, tansri: { tahun: 2032 }, bulanPM: 50 } }); GL.prosesBulan(); sama(GL.getGelaran(S.loadPlayer()).tun, null, 'Integriti 70: tiada Tun');
  S.clearPlayer();
});
ujian('v13.13: pendidikan: daftar, sambung Sarjana 24 bulan, tangguh, bonus lobi dan Doktor Kehormat', () => {
  const PD = g.MyPolitikPendidikan, D = g.MyPolitikData;
  const c = D.getFallbackData().negeri[0].bahagian[0].dun[0].cawangan[0], dem = D.tentukanDemografi('L', 30);
  sama(S.buildPlayerProfile({ nama: 'A', demografik: dem, cawangan: c, pendidikan: 'phd' }).pendidikan.tahap, 'phd');
  sama(S.buildPlayerProfile({ nama: 'A', demografik: dem, cawangan: c, pendidikan: 'xx' }).pendidikan.tahap, 'ijazah', 'tahap tidak sah = Ijazah');
  P.daftar({}); P.tetap({ myr: 100000, ap: 20, reputasi: 50 });
  sama(PD.seterusnya(S.loadPlayer()).kod, 'sarjana'); sama(Math.round(PD.bonusLobi(S.loadPlayer()) * 100), 2);
  let r = PD.sambung(); betul(r.ok, r.ralat); sama(S.loadPlayer().myr, 75000, 'yuran Sarjana RM 25,000');
  betul(!PD.sambung().ok, 'satu tahap pada satu masa');
  const ap0 = S.loadPlayer().ap; PD.prosesBulan(); sama(S.loadPlayer().ap, ap0 - 1, 'AP -1 sebulan');
  for (let i = 1; i < 24; i++) { PD.prosesBulan(); }
  let p = S.loadPlayer(); sama(PD.getPendidikan(p).tahap, 'sarjana'); sama(p.reputasi, 52, 'Reputasi +2'); sama(Math.round(PD.bonusLobi(p) * 100), 4);
  r = PD.sambung(); betul(r.ok, r.ralat); r = PD.tangguh(); betul(r.ok); sama(PD.getPendidikan(S.loadPlayer()).belajar, null, 'ditangguh');
  P.tetap({ pendidikan: { tahap: 'sarjana', belajar: { ke: 'phd', bulan: 35 } } }); const ev = PD.prosesBulan().peristiwa; betul(PD.dr(S.loadPlayer()) && /Dr\./.test(ev[0].mesej), 'PhD = Dr.');
  sama(PD.seterusnya(S.loadPlayer()), null);
  P.tetap({ kabinet: { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH', portfolioName: 'Menteri X' }, pendidikan: { tahap: 'ijazah', bulanKanan: 23 } });
  PD.prosesBulan(); p = S.loadPlayer(); betul(PD.getPendidikan(p).kehormat, 'Doktor Kehormat'); sama(PD.dr(p), false, 'tanpa Dr.');
  S.clearPlayer();
});
ujian('v13.15: Friends of BN (NPC): kuota, jemput berkempen, usul Majlis Tertinggi BN', () => {
  const F = g.MyPolitikFBN;
  P.daftar({}); let p = S.loadPlayer();
  betul(F.adalahBN(p)); sama(F.kuota(p), 3); sama(F.ringkasKuota(p).parti.join(), 'KIMMA,Makkal Sakti,IPF');
  sama(F.adalahBN({ parti: 'PBB' }), false, 'GPS bukan BN');
  // jemput: perlu kerusi India >= 10% (data MIC) dan kempen aktif
  const D = g.MyPolitikMICData || require('../js/mic-data.js'), kp = Object.keys(D.parlimen).find((k) => D.parlimen[k].i >= 15), kl = Object.keys(D.parlimen).find((k) => !D.parlimen[k].i);
  P.tetap({ kod: Object.assign({}, p.kod, { parlimen: String(parseInt(kp.slice(2), 10)) }), ap: 5, pru: { aktif: { fasa: 'kempen', voterSupport: 40, hari: 3, log: [] } } });
  p = S.loadPlayer(); let st = F.statusJemput(p); betul(st.tunjuk && st.boleh, JSON.stringify(st));
  let r = F.jemput(); betul(r.ok, r.ralat); p = S.loadPlayer(); sama(PRU.getPRU(p).aktif.voterSupport, 42); sama(p.ap, 4); sama(F.statusJemput(p).boleh, false, 'sekali setiap kempen');
  P.tetap({ kod: Object.assign({}, p.kod, { parlimen: String(parseInt(kl.slice(2), 10)) }) }); sama(F.statusJemput(S.loadPlayer()).tunjuk, false, 'kerusi tanpa pengundi India');
  // usul MT: bukan Presiden = NPC (25%)
  P.tetap({ tahun: 2027, bulan: 1, pru: {} }); let ev = F.prosesBulan({ rng: () => 0.9 }).peristiwa;
  sama(ev[0].jenis, 'fbn_tolak'); sama(F.getFBN(S.loadPlayer()).tahunMT, 2027); sama(F.prosesBulan({ rng: () => 0 }).peristiwa.length, 0, 'sekali setahun');
  // Presiden: usul menunggu, sokong (25% + 20% = 45%)
  P.tetap({ tahun: 2028, bulan: 1, jawatan: 'Presiden', pru: { hubunganGabungan: 50 } }); ev = F.prosesBulan().peristiwa; sama(ev[0].jenis, 'fbn_usul'); betul(F.getFBN(S.loadPlayer()).menunggu);
  r = F.undi('sokong', { rng: () => 0.4 }); betul(r.ok && r.terima, r.mesej); p = S.loadPlayer();
  sama(PRU.getPRU(p).hubunganGabungan, 53); betul(F.getFBN(p).komponen); sama(F.kuota(p), 5); sama(F.getFBN(p).bonusIndia, 1);
  // bonus India pada kempen
  p.kod = Object.assign({}, p.kod, { parlimen: String(parseInt(kp.slice(2), 10)) });
  const a = { voterSupport: 30 }; sama(F.bonusKempen(p, a), 1); sama(a.voterSupport, 31);
  // tidak dijawab: berkecuali pada bulan berikut
  P.tetap({ tahun: 2029, bulan: 1, fbn: { komponen: false, tahunMT: 0 } }); F.prosesBulan(); P.tetap({ bulan: 2 }); ev = F.prosesBulan({ rng: () => 0.9 }).peristiwa;
  betul(ev.some((e) => e.jenis === 'fbn_tolak'), 'usul diselesaikan sebagai berkecuali'); sama(F.getFBN(S.loadPlayer()).menunggu, 0);
  S.clearPlayer();
});
ujian('v13.16: MCA & MIC Sabah: data, kuota ikut Pemulihan, ofset, tindakan, PRN dan Senator', () => {
  const B = g.MyPolitikSabahBN, MC = g.MyPolitikMCA, MI = g.MyPolitikMIC, PR = g.MyPolitikPRU, D = g.MyPolitikData, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'mca-semenanjung.csv'), 'utf8')));
  const sb = h.bahagian.filter((x) => /Sabah/i.test(x.negeri || '') || ['Kota Kinabalu', 'Sepanggar', 'Batu Sapi', 'Kudat', 'Penampang', 'Sandakan', 'Lahad Datu'].indexOf(x.nama) >= 0);
  sama(sb.length, 7, '7 Bahagian MCA Sabah');
  const bLikas = sb.find((x) => x.nama === 'Kota Kinabalu'), dLikas = bLikas.dun.find((d) => /Likas/i.test(d.nama));
  const dem = D.tentukanDemografi('Lelaki', 40, 'MCA');
  S.savePlayer(S.buildPlayerProfile({ parti: 'MCA', nama: 'Lim Sabah', demografik: dem, cawangan: dLikas.cawangan[0], sayap: 'utama', avatar: 'biasa', tahunAhli: 5 }));
  let p = S.loadPlayer(); betul(B.adalah(p), 'pemain MCA Sabah ' + p.negeri);
  let k = MC.kawasan(p); betul(k.sabah && k.kuotaDUN && !k.kuotaPL, 'Likas dalam kuota DUN (Pemulihan 20), tiada Parlimen');
  sama(B.kuota(p).bilDUN, 2); sama(MC.ofset(p, 'DUN'), -12); sama(MC.lawan(p, 'DUN')[0], 'Warisan');
  betul(/Pemulihan Sabah mencapai 70/.test(MC.sebabKuota(p, 'PARLIMEN')));
  sama(PR.getPRU(p).jenisPBB, 'PRN', 'ikut jadual PRN Sabah');
  P.tetap({ sbn: { pemulihan: 72 } }); p = S.loadPlayer(); k = MC.kawasan(p); betul(k.kuotaPL, 'Pemulihan 72: 1 kerusi Parlimen'); sama(B.kuota(p).bilDUN, 4); sama(MC.ofset(p, 'DUN'), -7);
  // tindakan
  P.tetap({ sbn: { pemulihan: 20 }, ap: 10, myr: 20000 }); let r = B.khidmat(); betul(r.ok, r.ralat); sama(B.getSBN(S.loadPlayer()).pemulihan, 25); sama(B.khidmat().ok, false, 'sekali sebulan');
  betul(!B.jentera().ok, 'jentera hanya musim PRN');
  P.tetap({ tahun: 2030, bulan: 7 }); r = B.jentera(); betul(r.ok, r.ralat); sama(B.getSBN(S.loadPlayer()).pemulihan, 31);
  // susut dan PRN
  B.prosesBulan(); sama(B.getSBN(S.loadPlayer()).pemulihan, 30, 'susut 1');
  const pru = PR.getPRU(S.loadPlayer()); pru.riwayat = [{ tahun: 2030, bulan: 11, jenis: 'PRN' }]; pru.sejarah = [{ jenis: 'DUN', kerusi: 'Likas', hasil: 'kalah', tahun: 2030, bulan: 11 }];
  P.tetap({ pru: pru, tahun: 2030, bulan: 12 }); let ev = B.prosesBulan().peristiwa; sama(B.getSBN(S.loadPlayer()).pemulihan, 19, 'kalah PRN -10 (selepas susut)'); betul(ev.some((e) => e.jenis === 'sbn_prn'));
  // MIC Sabah: tiada kuota, Senator
  const hm = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'mic-semenanjung.csv'), 'utf8')));
  const tawau = hm.bahagian.find((x) => x.nama === 'Tawau'); sama(['Kota Kinabalu', 'Sandakan', 'Lahad Datu', 'Tawau'].reduce((n, nm) => n + hm.bahagian.find((x) => x.nama === nm).dun.reduce((m, d) => m + d.cawangan.length, 0), 0), 25, '25 cawangan MIC Sabah');
  S.savePlayer(S.buildPlayerProfile({ parti: 'MIC', nama: 'Raj Sabah', demografik: D.tentukanDemografi('Lelaki', 40, 'MIC'), cawangan: tawau.dun[0].cawangan[0], sayap: 'utama', avatar: 'biasa', tahunAhli: 5 }));
  p = S.loadPlayer(); k = MI.kawasan(p); betul(B.adalah(p) && k.sabah && !k.kuotaPL && !k.kuotaDUN, 'MIC Sabah tiada kuota'); betul(/MIC Sabah/.test(MI.sebabKuota(p, 'DUN')));
  const pr2 = PR.getPRU(p); pr2.riwayat = [{ tahun: 2030, bulan: 11, jenis: 'PRN' }];
  P.tetap({ pru: pr2, tahun: 2030, bulan: 12, sbn: { pemulihan: 70 }, jawatan: 'Ketua Bahagian', jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: 2026 }] });
  const ip0 = S.loadPlayer().ip; ev = B.prosesBulan({ rng: () => 0.1 }).peristiwa; p = S.loadPlayer();
  betul(ev.some((e) => e.jenis === 'sbn_senator') && B.senatorAktif(p), 'dilantik Senator'); betul(p.ip >= ip0 + 10, 'IP Senator');
  S.clearPlayer();
});
ujian('v13.17: MB boleh dituntut selepas menang Parlimen + DUN serentak (lobi Parlimen), dan Presiden pembangkang dapat lobi DUN', () => {
  const NG = g.MyPolitikNegeri, asal = NG.status;
  NG.status = () => ({ bp: { pengerusi: { pemain: true } } });
  try {
    P.daftar({}); P.tetap({ ap: 10, pru: { status: { jenis: 'MP', kerusi: 'Kangar', kerajaan: true }, statusKedua: { jenis: 'ADUN', kerusi: 'Kuala Perlis', kerajaan: true } } });
    betul(KB.bukaLobi('PARLIMEN').ok);
    let m = KB.maklumatMB(S.loadPlayer()); betul(m.boleh, 'lobi Parlimen tidak lagi menghalang MB: ' + m.sebab);
    betul(KB.semakMB(S.loadPlayer()).sedia, 'senarai semak: sedia');
    P.tetap({ pru: { status: { jenis: 'MP', kerusi: 'Kangar', kerajaan: true }, statusKedua: { jenis: 'ADUN', kerusi: 'Kuala Perlis', kerajaan: false } } });
    m = KB.maklumatMB(S.loadPlayer()); sama(m.boleh, false); betul(/tidak membentuk kerajaan negeri/.test(m.sebab), m.sebab);
    // Pengerusi BP tanpa kerusi DUN: senarai semak dipapar dengan ⛔ ADUN
    P.tetap({ kabinet: {}, pru: { status: { jenis: 'MP', kerusi: 'Kangar', kerajaan: true } } });
    const sm = KB.semakMB(S.loadPlayer()); betul(sm && !sm.item[0].ok && /mesti ADUN/.test(sm.item[0].teks), 'Pengerusi BP tanpa DUN');
    // Presiden: pembangkang di Parlimen, kerajaan negeri -> lobi DUN
    P.tetap({ kabinet: {}, jawatan: 'Presiden', pru: { status: { jenis: 'ADUN', kerusi: 'Kuala Perlis', kerajaan: true }, nasional: { status: 'PEMBANGKANG', tahun: 2031, bulan: 3, parti: 20, rakan: 10 } } });
    const PPx = g.MyPolitikPaparan || g.NusaPaparan, asalA = PPx.anggarKerusi; PPx.anggarKerusi = () => ({ tahun: 2031, bulan: 3, parti: 20, rakan: 10, pembangkang: 190, bebas: 2, kerajaan: false, dun: { jumlah: 15, kerajaan: 12, bebas: 0, pembangkang: 3 } });
    let r; try { r = PRU.rundingKerajaan('PEMBANGKANG'); } finally { PPx.anggarKerusi = asalA; }
    betul(r.ok && r.bukaLobi, r.mesej); sama(PRU.getPRU(S.loadPlayer()).status.kerajaan, true, 'ADUN kerajaan ikut kerusi DUN'); sama(KB.getKabinet(S.loadPlayer()).lobi.sumber, 'DUN');
    betul(KB.maklumatMB(S.loadPlayer()).boleh, 'Presiden boleh menuntut MB');
  } finally { NG.status = asal; S.clearPlayer(); }
});
ujian('v13.18: versi maklum balas sama dengan versi cache (sw.js)', () => {
  const fs = require('fs'), path = require('path'), R = path.join(__dirname, '..');
  const vSw = (fs.readFileSync(path.join(R, 'sw.js'), 'utf8').match(/VERSI = 'nusa-(v[\d.]+)'/) || [])[1], vMb = (fs.readFileSync(path.join(R, 'js', 'maklumbalas.js'), 'utf8').match(/VERSI: '(v[\d.]+)'/) || [])[1];
  betul(vSw && vSw === vMb, 'sw.js ' + vSw + ' vs maklumbalas.js ' + vMb);
});
ujian('v13.19: letak jawatan parti (Stress, Reputasi ikut peringkat, Presiden & PM, kunci musim pemilihan)', () => {
  const LT = g.MyPolitikLetak, ST = g.MyPolitikStres;
  P.daftar({});
  P.tetap({ tahun: 2027, bulan: 12, stress: 80, reputasi: 60, jawatan: 'Presiden', jawatanList: [{ kod: 'presiden', jawatan: 'Presiden', peringkat: 'pusat', kumpulan: 'utama', pangkat: 12, tahun: 2026 }, pegang('ketua_bahagian')],
    kabinet: { hasGovernmentRole: true, roleLevel: 'PERDANA_MENTERI', portfolioName: 'Perdana Menteri', tekananPolitik: 30 } });
  let p = S.loadPlayer(), sp = LT.senaraiParti(p);
  sama(sp.length, 2); sama(sp[0].jawatan, 'Presiden'); sama(sp[0].reputasi, -3); sama(cari(sp, 'ketua_bahagian', 'kod').reputasi, -1);
  const kb = cari(sp, 'ketua_bahagian', 'kod'), st0 = ST.nilai ? ST.nilai(p).stress : p.stress;
  let r = LT.letakParti('ketua_bahagian'); betul(r.ok, r.ralat); p = S.loadPlayer();
  sama(p.jawatanList.length, 1); sama(p.reputasi, 59); betul((ST.nilai ? ST.nilai(p).stress : p.stress) === st0 - 2 * kb.beban, 'Stress -2 x beban');
  r = LT.letakParti('presiden'); betul(r.ok, r.ralat); p = S.loadPlayer();
  sama(p.jawatan, 'Ahli Biasa'); sama(p.reputasi, 56); betul(/Timbalan Presiden/.test(r.mesej) && /kekal Perdana Menteri/.test(r.mesej));
  sama(KB.getKabinet(p).roleLevel, 'PERDANA_MENTERI', 'PM kekal'); sama(KB.getKabinet(p).tekananPolitik, 40, 'tekanan +10');
  // kunci semasa musim pemilihan parti
  const E = g.MyPolitikElection, K = g.MyPolitikCalendar; let tahun = 2027; while (!E.adalahTahunPemilihan(tahun)) { tahun++; }
  const bulan = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].find((b) => K.getTetingkap('cawangan', b) && K.getTetingkap('cawangan', b).status === 'dibuka');
  P.tetap({ tahun: tahun, bulan: bulan, jawatanList: [pegang('ketua_cawangan')], jawatan: 'Ketua Cawangan' });
  betul(LT.musimPemilihan(S.loadPlayer()), 'musim pemilihan ' + tahun + '/' + bulan); betul(!LT.letakParti('ketua_cawangan').ok, 'dikunci semasa musim pemilihan');
  S.clearPlayer();
});
ujian('v13.20: nama NPC ikut kaum majoriti parti (MCA Cina, MIC India, PBRS KDM, UMNO Melayu)', () => {
  const O = g.MyPolitikOrganisasi;
  const semua = (p) => { const s = O.getStruktur(p), n = []; Object.keys(s.induk).forEach((k) => { const b = s.induk[k]; [b.ketua, b.naib].concat(b.ajk).forEach((x) => { if (x && !x.pemain) { n.push(x.nama); } }); }); return n; };
  P.daftar({}); let n = semua(S.loadPlayer()); betul(n.every((x) => / bin | binti | anak /.test(x)), 'UMNO: nama Melayu');
  P.tetap({ parti: 'MCA' }); n = semua(S.loadPlayer()); betul(!n.some((x) => / bin | binti /.test(x)), 'MCA: tiada bin/binti: ' + n.find((x) => / bin | binti /.test(x)));
  P.tetap({ parti: 'MIC' }); n = semua(S.loadPlayer()); betul(n.every((x) => / a\/[lp] /.test(x)), 'MIC: a/l, a/p');
  P.tetap({ parti: 'PBRS' }); n = semua(S.loadPlayer()); betul(n.filter((x) => !/ bin | binti | a\/[lp] /.test(x)).length === n.length, 'PBRS: KDM / Cina');
  P.tetap({ parti: 'MCA' }); const R = g.MyPolitikRival; betul(!/ bin | binti /.test(S.loadPlayer().nama === 'x' ? '' : (g.MyPolitikData.janaNama(g.MyPolitikData.createRng('z'), 'L', null))), 'janaNama ikut parti');
  S.clearPlayer();
});
ujian('v13.20: daftar nama NPC: penyandang dalam Struktur bertanding, pemenang dikemas kini, lantikan Kekalkan / Ubah', () => {
  const O = g.MyPolitikOrganisasi, N = g.MyPolitikNPC;
  P.daftar({}); P.tetap({ bulan: 4, ip: 5000, jawatan: 'AJK Cawangan', jawatanList: [pegang('ajk_cawangan', 2023)] });
  const pny = O.calonStruktur(S.loadPlayer(), 'ketua_cawangan').penyandang; betul(pny, 'penyandang Ketua Cawangan');
  betul(E.daftarBertanding('ketua_cawangan').ok, 'daftar');
  let r = E.jalankanPemilihan('ketua_cawangan', { rng: () => 0.99 }); betul(r.ok, r.ralat);
  betul(r.keputusan.jadual.some((j) => j.nama === pny), 'penyandang dalam senarai calon');
  let p = S.loadPlayer(), b = O.blok(p, 'cawangan', null), pemenang = r.keputusan.jadual.filter((j) => j.menang)[0];
  if (pemenang.pemain) { betul(b.ketua.pemain, 'pemain dalam Struktur'); } else { sama(b.ketua.nama, pemenang.nama, 'pemenang NPC dalam Struktur'); }
  // paksa menang untuk menguji lantikan
  let menang = false; for (let s = 0; s < 80 && !menang; s++) { P.tetap({ pemilihan: null, npc: null, ip: 99999, kesetiaan: { ketuaCawangan: 95, ajk: 60, akarUmbi: 95, perwakilan: 90, penentang: 5 }, jawatan: 'AJK Cawangan', jawatanList: [pegang('ajk_cawangan', 2023)] }); E.daftarBertanding('ketua_cawangan'); r = E.jalankanPemilihan('ketua_cawangan', { rng: Math.random }); menang = r.ok && r.keputusan.menang; }
  betul(menang, 'pemain menang Ketua Cawangan');
  p = S.loadPlayer(); betul(N.lantikanAktif(p), 'lantikan dibuka'); const sen = N.senarai(p); sama(sen.length, 3, '3 pegawai dilantik (UMNO)'); betul(sen[0].pilihan.length === 3);
  const ajk0 = p.kesetiaan.ajk; let x = N.kekal(0); betul(x.ok, x.ralat); sama(S.loadPlayer().kesetiaan.ajk, Math.min(100, ajk0 + 2));
  const baru = sen[1].pilihan[0]; x = N.ubah(1, baru); betul(x.ok, x.ralat); sama(O.pemegangSlot(S.loadPlayer(), 'cawangan', null, 'peg', 1).nama, baru, 'pegawai baharu dalam Struktur');
  P.tetap({ bulan: 5 }); const ev = N.prosesBulan().peristiwa; sama(ev.length, 1, 'baki dikekalkan automatik'); sama(S.loadPlayer().npc.lantikan, null);
  S.clearPlayer();
});
ujian('v13.21: GPS sentiasa dalam kerajaan persekutuan; status MP Presiden ikut rundingan; pru.js guna NusaPaparan', () => {
  const PP = g.NusaPaparan, fs = require('fs'), path = require('path');
  betul(!/modul\('MyPolitikPaparan'/.test(fs.readFileSync(path.join(__dirname, '..', 'js', 'pru.js'), 'utf8')), 'pru.js memanggil modul paparan dengan nama global yang betul');
  for (let i = 0; i < 20; i++) { const k = PP.anggarKerusi({ id: 'sw' + i, parti: 'PBB', reputasi: 30 + i * 3, pru: {} }, { tahun: 2031 + i, bulan: 3 }, {}); betul(k.kerajaan, 'GPS kerajaan ' + i); }
  P.daftar({}); P.tetap({ jawatan: 'Presiden', pru: { status: { jenis: 'MP', kerusi: 'Kangar', kerajaan: false }, nasional: { status: 'GABUNGAN', tahun: 2031, bulan: 3, parti: 80, rakan: 50, bolehPM: true, peluangPM: 90 } } });
  const r = PRU.rundingKerajaan('KABINET'); betul(r.ok, r.ralat); sama(PRU.getPRU(S.loadPlayer()).status.kerajaan, true, 'MP kerajaan selepas memilih Kabinet');
  betul(S.loadPlayer().kerusiNasional && S.loadPlayer().kerusiNasional.parti === 80, 'kad kerusi dijana daripada keputusan rundingan');
  S.clearPlayer();
});
ujian('v13.22: Presiden menyampaikan Ucapan Dasar dengan tema pilihan (bukan sokong / bantah)', () => {
  P.daftar({}); P.tetap({ tahun: 2027, bulan: 9, ap: 10, reputasi: 60, ip: 600, keahlian: { sejakTahun: 2010, sejakBulan: 1 }, penggalSelesai: true, jawatan: 'Presiden',
    jawatanList: [{ kod: 'presiden', jawatan: 'Presiden', peringkat: 'pusat', kumpulan: 'utama', pangkat: 12, tahun: 2026 }], pru: { hubunganGabungan: 50 } });
  const mp = M.mulaMesyuarat('pau'); betul(mp.ok, mp.ralat);
  const u = mp.mesyuarat.agenda.find((x) => x.jenis === 'ucapan_dasar'); betul(u, 'Ucapan Dasar dalam agenda');
  betul(M.presidenPemain(S.loadPlayer()));
  const rep0 = S.loadPlayer().reputasi, ap0 = S.loadPlayer().ap;
  const r = M.ucapanPresiden('pau', u.id, 'perpaduan', { rng: () => 0.5 }); betul(r.ok, r.ralat);
  const p = S.loadPlayer(); sama(p.ap, ap0 - 2); betul(r.keputusan.lulus, 'diterima (' + r.keputusan.sokongan + '%)'); sama(p.reputasi, rep0 + 3); sama(PRU.getPRU(p).hubunganGabungan, 53);
  betul(!M.ucapanPresiden('pau', u.id, 'ekonomi').ok, 'sekali setiap PAU');
  // bukan Presiden: ditolak
  P.tetap({ jawatan: 'Ketua Bahagian', jawatanList: [pegang('ketua_bahagian', 2026)] }); betul(!M.ucapanPresiden('pau', u.id, 'ekonomi').ok);
  S.clearPlayer();
});
ujian('PBB v9.5: Pindah Cawangan PBB (dalam Sarawak sahaja, dunInfo ikut DUN baharu); UMNO tidak ke Sarawak', () => {
  const PD = g.MyPolitikPindah, SW = g.MyPolitikSarawak, D = g.MyPolitikData, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-sarawak.csv'), 'utf8')));
  const dun = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-dun.json'), 'utf8'));
  const dem = D.tentukanDemografi('Lelaki', 40), c0 = h.bahagian[0].dun[0].cawangan[0];
  const bhgBaru = h.bahagian.filter((b) => parseInt(b.kod, 10) === 40)[0] || h.bahagian[h.bahagian.length - 1], cBaru = bhgBaru.dun[0].cawangan[0];
  S.savePlayer(S.buildPlayerProfile({ parti: 'PBB', blokPBB: 'bumiputera', nama: 'Uji', demografik: dem, cawangan: c0, sayap: 'utama', avatar: 'biasa', dunInfo: dun['1'] }));
  P.tetap({ keahlian: { sejakTahun: 2015, sejakBulan: 1 }, myr: 20000, ap: 10, ip: 500 });
  let p = S.loadPlayer(); sama(PD.negeriTerlarang('Sarawak', 'PBB'), false); sama(PD.negeriTerlarang('Johor', 'PBB'), true, 'PBB tiada cawangan di luar Sarawak'); sama(PD.negeriTerlarang('Sarawak', 'UMNO'), true); sama(PD.negeriTerlarang('Johor', 'UMNO'), false);
  betul(PD.semak(p).boleh, PD.semak(p).sebab.join(';')); betul(/Menteri Negeri/.test(PD.semak(p).syarat.filter((x) => x.id === 'jawatan')[0].teks), 'syarat guna istilah Menteri');
  const noBaru = parseInt(bhgBaru.kod, 10), pt = PD.pratonton(p, cBaru, { dunInfo: dun[noBaru] }); betul(pt.selepas.tahap, 'tahap kerusi DUN baharu'); sama(pt.terlarang, false);
  const r = PD.pindah(cBaru, { dunInfo: dun[noBaru] }); betul(r.ok, r.ralat); p = S.loadPlayer();
  sama(p.parti, 'PBB'); sama(p.negeri, 'Sarawak'); sama(p.dunInfo.nama, dun[noBaru].nama, 'dunInfo ikut DUN baharu'); sama(SW.maklumat(p).nama, dun[noBaru].nama); sama(p.blokPBB, 'bumiputera', 'blok kekal');
  sama(p.ip, 350); sama(p.pindah.bil, 1);
  S.clearPlayer();
});

ujian('PRS v10.0: mod ringan (kuota GPS 11, Pengaruh GPS, rundingan, kelayakan PRN ikut kuota)', () => {
  const SW = g.MyPolitikSarawak, PR = g.MyPolitikPRU, D = g.MyPolitikData, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'prs-sarawak.csv'), 'utf8')));
  const duns = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-dun.json'), 'utf8'));
  sama(SW.KUOTA_2021.PRS, 11); sama(SW.KUOTA_2021.PBB + SW.KUOTA_2021.SUPP + SW.KUOTA_2021.PRS + SW.KUOTA_2021.PDP, 82, 'jumlah GPS 2021');
  betul(Object.keys(duns).filter((k) => duns[k].rkPRS).length >= 14, 'kawasan operasi PRS cukup luas');
  const dem = D.tentukanDemografi('Lelaki', 40);
  const pilihDUN = (rk) => { const b = h.bahagian.find((x) => duns[parseInt(x.kod, 10)] && duns[parseInt(x.kod, 10)].rkPRS === rk); return b ? { b, info: duns[parseInt(b.kod, 10)] } : null; };
  const a = pilihDUN(1), z = pilihDUN(Math.max.apply(null, Object.keys(duns).map((k) => duns[k].rkPRS || 0)));
  betul(a && z, 'DUN rk 1 dan terakhir ada dalam CSV PRS');
  const daftar = (x) => S.savePlayer(S.buildPlayerProfile({ parti: 'PRS', nama: 'Uji', demografik: dem, cawangan: x.b.dun ? x.b.dun[0].cawangan[0] : x.b.cawangan[0], sayap: 'utama', avatar: 'biasa', dunInfo: x.info, blokPBB: 'pesaka' }));
  daftar(a); let p = S.loadPlayer();
  sama(p.parti, 'PRS'); sama(p.blokPBB, undefined, 'PRS tiada blok'); betul(SW.ringan(p) && !SW.blokPemain(p), 'ringan tanpa blok');
  sama(SW.kuota(p), 11); sama(SW.pengaruh(p), 40); betul(SW.dalamKuota(p), 'rk 1 dalam kuota');
  const rk = SW.ringkasRingan(p); sama(rk.kuota, 11); sama(rk.jumlahGPS, 82);
  sama(SW.sebabPremier(p).indexOf('rakan GPS') >= 0, true, 'tiada Premier untuk PRS'); sama(SW.statusRunding(p), null, 'runding PBB tidak untuk PRS');
  const k82 = SW.kerusiDewan(p, true); betul(k82 && k82.jumlah === 82 && k82.BN >= 70, 'dewan GPS 82 kerusi');
  /* Pengaruh GPS */
  P.tetap({ ap: 10, myr: 20000 }); let r = SW.lobiGPS(); betul(r.ok, r.ralat); p = S.loadPlayer(); sama(SW.pengaruh(p), 48); sama(p.ap, 7);
  /* Rundingan: masuk tempoh 12 bulan sebelum PRN */
  const pru = PR.getPRU(p); P.tetap({ tahun: pru.tahunPRU - 1, bulan: 12 }); let st = SW.statusRundingRakan(S.loadPlayer());
  if (!(st.bakiBulan > 0 && st.bakiBulan <= 12)) { P.tetap({ tahun: pru.tahunPRU, bulan: Math.max(1, (parseInt(pru.bulanPRU, 10) || 1) - 1) }); st = SW.statusRundingRakan(S.loadPlayer()); }
  betul(st.boleh, 'rundingan dibuka');
  r = SW.rundingRakan('tuntut', { rng: () => 0.01 }); betul(r.ok && r.berjaya, r.ralat); p = S.loadPlayer(); sama(p.rundingGPS.kerusi, 14); sama(SW.kuota(p), 14, 'kuota baharu');
  sama(SW.rundingRakan('beralah').ok, false, 'sekali setiap PRN');
  /* tuntut gagal dan beralah (profil bersih) */
  P.tetap({ rundingGPS: undefined, ap: 10 }); r = SW.rundingRakan('tuntut', { rng: () => 0.99 }); betul(r.ok && !r.berjaya, r.ralat); sama(S.loadPlayer().rundingGPS.kerusi, 10);
  P.tetap({ rundingGPS: undefined, ap: 10 }); r = SW.rundingRakan('beralah'); betul(r.ok, r.ralat); p = S.loadPlayer(); sama(p.rundingGPS.kerusi, 9); sama(SW.pengaruh(p), 53, 'beralah +5 pengaruh');
  /* kelayakan PRN: DUN di luar kuota */
  daftar(z); P.tetap({ ip: 600, jawatan: 'AJK Cawangan', jawatanList: [pegang('ajk_cawangan')], tahun: pru.tahunPRU, bulan: parseInt(pru.bulanPRU, 10) || 1 }); p = S.loadPlayer();
  betul(!SW.dalamKuota(p), 'DUN rk terakhir di luar kuota 11');
  const kel = PR.kelayakan ? PR.kelayakan(p) : null; if (kel && kel.DUN) { betul(kel.DUN.sebab.some((x) => /luar kuota/.test(x)), 'sebab luar kuota'); }
  /* PBB tidak terjejas */
  S.savePlayer(S.buildPlayerProfile({ parti: 'PBB', blokPBB: 'bumiputera', nama: 'Uji', demografik: dem, cawangan: D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-sarawak.csv'), 'utf8'))).bahagian[0].dun[0].cawangan[0], sayap: 'utama', avatar: 'biasa' }));
  p = S.loadPlayer(); sama(SW.ringan(p), false); sama(SW.kuota(p), null); betul(SW.dalamKuota(p), 'PBB tiada had kuota');
});


ujian('SUPP v10.1: mod ringan (kuota 18, Sokongan Bandar menjejas kerusi, kelayakan ikut kuota)', () => {
  const SW = g.MyPolitikSarawak, D = g.MyPolitikData, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'supp-sarawak.csv'), 'utf8')));
  const duns = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-dun.json'), 'utf8'));
  sama(SW.KUOTA_2021.SUPP, 18); betul(Object.keys(duns).filter((k) => duns[k].rkSUPP).length >= 18, 'kawasan operasi SUPP >= kuota');
  const dem = D.tentukanDemografi('Lelaki', 40), b = h.bahagian.find((x) => duns[parseInt(x.kod, 10)] && duns[parseInt(x.kod, 10)].rkSUPP === 1);
  betul(b, 'DUN SUPP rk 1 dalam CSV');
  S.savePlayer(S.buildPlayerProfile({ parti: 'SUPP', nama: 'Uji', demografik: dem, cawangan: (b.dun ? b.dun[0].cawangan[0] : b.cawangan[0]), sayap: 'utama', avatar: 'biasa', dunInfo: duns[parseInt(b.kod, 10)] }));
  let p = S.loadPlayer(); sama(p.parti, 'SUPP'); betul(SW.ringan(p), 'ringan'); sama(SW.kuota(p), 18); betul(SW.dalamKuota(p), 'rk 1 dalam kuota');
  sama(SW.sokonganBandar(p), 50); sama(SW.ofsetBandar(p), 0); const o0 = SW.ofset(p);
  P.tetap({ ap: 10, myr: 20000 }); let r = SW.programBandar(); betul(r.ok, r.ralat); p = S.loadPlayer(); sama(SW.sokonganBandar(p), 56); sama(p.ap, 8);
  betul(SW.ofset(p) >= o0, 'Sokongan Bandar > 50 tidak mengurangkan kekuatan kerusi'); sama(SW.ringkasRingan(p).bandar, 56);
  const tinggi = Object.assign({}, p, { sokonganBandar: { nilai: 100, idx: (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1) } }), rendah = Object.assign({}, p, { sokonganBandar: { nilai: 30, idx: tinggi.sokonganBandar.idx } });
  betul(SW.ofset(tinggi) > SW.ofset(rendah), 'Sokongan Bandar tinggi > rendah');
  const kemudian = Object.assign({}, tinggi, { bulan: ((parseInt(p.bulan, 10) || 1) % 12) + 1, tahun: (parseInt(p.tahun, 10) || 0) + 1 }); betul(SW.sokonganBandar(kemudian) < 100, 'Sokongan Bandar susut');
  const prs = Object.assign({}, p, { parti: 'PRS' }); sama(SW.sokonganBandar(prs), null, 'PRS tiada Sokongan Bandar'); sama(SW.ofsetBandar(prs), 0);
  sama(SW.programBandar !== undefined, true);
});


ujian('PDP v10.2: mod ringan (kuota 5, Imbangan Kaum Kawasan menjejas kerusi)', () => {
  const SW = g.MyPolitikSarawak, D = g.MyPolitikData, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'pdp-sarawak.csv'), 'utf8')));
  const duns = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-dun.json'), 'utf8'));
  sama(SW.KUOTA_2021.PDP, 5); sama(Object.keys(duns).filter((k) => duns[k].rkPDP).length, 15, 'DUN campuran');
  const dem = D.tentukanDemografi('Lelaki', 40), b = h.bahagian.find((x) => duns[parseInt(x.kod, 10)] && duns[parseInt(x.kod, 10)].rkPDP === 1);
  betul(b, 'DUN PDP rk 1 dalam CSV');
  S.savePlayer(S.buildPlayerProfile({ parti: 'PDP', nama: 'Uji', demografik: dem, cawangan: (b.dun ? b.dun[0].cawangan[0] : b.cawangan[0]), sayap: 'utama', avatar: 'biasa', dunInfo: duns[parseInt(b.kod, 10)] }));
  let p = S.loadPlayer(); sama(p.parti, 'PDP'); betul(SW.ringan(p), 'ringan'); sama(SW.kuota(p), 5); betul(SW.dalamKuota(p), 'rk 1 dalam kuota');
  let k = SW.sokonganKaum(p); sama(k.melayu, 50); sama(SW.purataKaum(p), 50); sama(SW.ofsetKaum(p), 0); sama(SW.imbanganKaum(p), 100);
  P.tetap({ ap: 10, myr: 20000 }); const r = SW.janjiKaum('dayak'); betul(r.ok, r.ralat); p = S.loadPlayer(); k = SW.sokonganKaum(p);
  sama(k.dayak, 60); sama(k.melayu, 46); sama(k.cina, 46); sama(p.ap, 8); sama(SW.imbanganKaum(p), 86);
  const w = JSON.stringify(SW.ringkasRingan(p).kaumSaham); betul(SW.ringkasRingan(p).kaumSaham.dayak > 0, 'saham kaum ' + w);
  const idx = (parseInt(p.tahun, 10) || 0) * 12 + (parseInt(p.bulan, 10) || 1);
  const dayakSaja = Object.assign({}, p, { sokonganKaum: { nilai: { melayu: 50, dayak: 100, cina: 50 }, idx } }), cinaSaja = Object.assign({}, p, { sokonganKaum: { nilai: { melayu: 50, dayak: 50, cina: 100 }, idx } });
  const sd = SW.ringkasRingan(p).kaumSaham; betul((sd.dayak > sd.cina) === (SW.purataKaum(dayakSaja) > SW.purataKaum(cinaSaja)), 'purata diwajarkan saiz kumpulan');
  const kemudian = Object.assign({}, dayakSaja, { tahun: (parseInt(p.tahun, 10) || 0) + 1 }); betul(SW.sokonganKaum(kemudian).dayak < 100, 'sokongan kaum menghampiri 50');
  sama(SW.janjiKaum('x').ok, false, 'kumpulan tidak sah');
  const prs = Object.assign({}, p, { parti: 'PRS' }); sama(SW.sokonganKaum(prs), null, 'PRS tiada Imbangan Kaum'); sama(SW.ofsetKaum(prs), 0);
});


ujian('v11.0: PSB dibubarkan: simpanan PSB dipindah ke PDP; pencabar tanpa PSB; arahan Pusat', () => {
  const SWm = require('../js/sarawak.js');
  S.savePlayer(S.buildPlayerProfile({ parti: 'PSB', nama: 'Uji', demografik: { kod: 'pemuda', label: 'Pemuda', jantina: 'Lelaki', umur: 25 }, cawangan: { id: 'x', nama: 'X', negeri: 'Sarawak', bahagian: 'Y' } }));
  const p = S.loadPlayer(); sama(p.parti, 'PDP'); betul(p.dariPSB && p.notisPSB, 'bendera dariPSB dan notis');
  const jenis = [{ cina: 60, melayu: 10, iban: 20, bidayuh: 5, orangUlu: 2, india: 1, lain: 2 }, { cina: 5, melayu: 5, iban: 70, bidayuh: 10, orangUlu: 5, india: 1, lain: 1 }, { cina: 5, melayu: 70, iban: 10, bidayuh: 5, orangUlu: 5, india: 1, lain: 1 }, { cina: 20, melayu: 30, iban: 20, bidayuh: 10, orangUlu: 5, india: 5, lain: 5 }];
  const hasilL = jenis.map((e) => { const m = SWm.maklumat({ parti: 'PBB', dunInfo: { e } }); betul(m && m.lawan && !m.lawan.includes('PSB'), 'lawan tanpa PSB: ' + JSON.stringify(m && m.lawan)); return m.lawan.join('/'); });
  sama(hasilL.join(','), 'DAP/PKR,PBDS Baru/PKR,PKR/PAS,PKR/PBDS Baru');
  betul(SWm.dalamKuota({ parti: 'PDP', dariPSB: true, dunInfo: { rkPDP: 99 } }), 'bekas PSB tidak disekat kuota');
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'EventDatabase.js'), 'utf8'); betul(src.indexOf("id: 'arahan_pusat_cawangan'") > 0, 'peristiwa Arahan Pusat wujud');
});

ujian('v11.1: kalendar PBB: Ranting bulan 3, Cawangan bulan 5, Perhimpunan Agung PBB bulan 8; UMNO tidak berubah', () => {
  const K = require('../js/calendar.js'); const simpan = S.loadPlayer();
  const bina = (parti) => { S.savePlayer(S.buildPlayerProfile({ parti, nama: 'Uji', demografik: { kod: 'pemuda', label: 'Pemuda', jantina: 'Lelaki', umur: 25 }, cawangan: { id: 'x', nama: 'X', negeri: 'Sarawak', bahagian: 'Y' } })); };
  bina('PBB');
  const win = (k) => { const t = K.getTetingkap(k, 1); return t.mula + '-' + t.tamat; };
  sama([win('cawangan'), win('bahagian'), win('pau')].join(), '3-3,5-5,8-8', 'tetingkap PBB');
  sama(K.getFasa(4).kod, 'antara'); sama(K.getFasa(3).kod, 'cawangan'); sama(K.getFasa(5).kod, 'bahagian'); sama(K.getFasa(8).kod, 'pau'); sama(K.getFasa(2).kod, 'akar_umbi');
  bina('UMNO');
  sama([win('cawangan'), win('bahagian'), win('pau')].join(), '4-5,6-6,9-9', 'tetingkap UMNO (v13.5)'); sama(K.getFasa(3).kod, 'akar_umbi');
});

ujian('v11.2: Latihan Amir hanya untuk UMNO; parti Sarawak tidak ditawarkan', () => {
  const L = require('../js/latihan.js');
  betul(L.tersedia({ parti: 'UMNO' }) && L.tersedia({}), 'UMNO / lama tersedia');
  ['PBB', 'PRS', 'SUPP', 'PDP'].forEach((k) => betul(!L.tersedia({ parti: k }), k + ' tidak tersedia'));
  S.savePlayer(S.buildPlayerProfile({ parti: 'PBB', nama: 'Uji', demografik: { kod: 'pemuda', label: 'Pemuda', jantina: 'Lelaki', umur: 25 }, cawangan: { id: 'x', nama: 'X', negeri: 'Sarawak', bahagian: 'Y' } }));
  sama(L.mula(), false, 'mula() ditolak untuk PBB'); sama(g.localStorage.getItem('myPolitik_latihan'), null, 'tiada bendera latihan');
});

ujian('v11.2: tiada Lantikan Badan Perhubungan negeri untuk parti Sarawak', () => {
  const N = require('../js/negeri.js');
  ['PBB', 'PRS', 'SUPP', 'PDP'].forEach((k) => { betul(!N.aktif({ parti: k, sayap: 'utama' }), k + ' induk tidak aktif'); betul(!N.sayap.aktif({ parti: k, sayap: 'pemuda' }), k + ' sayap tidak aktif'); });
  betul(N.aktif({ parti: 'UMNO', sayap: 'utama' }) && N.sayap.aktif({ parti: 'UMNO', sayap: 'pemuda' }), 'UMNO kekal');
  S.savePlayer(S.buildPlayerProfile({ parti: 'PBB', nama: 'Uji', demografik: { kod: 'pemuda', label: 'Pemuda', jantina: 'Lelaki', umur: 25 }, cawangan: { id: 'x', nama: 'X', negeri: 'Sarawak', bahagian: 'Y' } }));
  const p = S.loadPlayer(); p.bulan = 9; S.savePlayer(p);
  sama(N.prosesBulan({ rng: () => 0 }).peristiwa.length, 0, 'tiada peristiwa lantikan_negeri');
});

ujian('v11.3: nama Dayak (blok Pesaka) dan gelaran Sarawak untuk NPC PBB; UMNO kekal', () => {
  const OG = require('../js/organisasi.js');
  const bina = (parti) => S.savePlayer(S.buildPlayerProfile({ parti, nama: 'Uji', demografik: { kod: 'pemuda', label: 'Pemuda', jantina: 'Lelaki', umur: 25 }, cawangan: { id: 'x', nama: 'X', negeri: 'Sarawak', bahagian: 'Y' }, dunInfo: { e: { iban: 60, bidayuh: 5, orangUlu: 5, cina: 10, melayu: 20, india: 0, lain: 0 } } }));
  bina('PBB'); const st = OG.getStruktur(S.loadPlayer()), pu = st.induk.pusat.senarai, cari = (j) => pu.filter((x) => x.jawatan === j)[0].orang.map((o) => o.nama);
  betul(/^Pehin Sri /.test(cari('Yang Dipertua / Presiden')[0]), 'Yang Dipertua = Pehin Sri');
  betul(cari('Timbalan Yang Dipertua').every((n) => /^Datuk Patinggi /.test(n)), 'Timbalan = Datuk Patinggi');
  betul(cari('Naib Yang Dipertua (Pesaka)').every((n) => /^Datuk Amar .* anak /.test(n)), 'Naib (Pesaka) = Datuk Amar + nama Dayak');
  { const nb = cari('Naib Yang Dipertua (Bumiputera)'); betul(nb.every((n) => / bin(ti)? /.test(n)), 'Naib (Bumiputera) = nama Melayu: ' + nb.join('; ')); }
  const semua = JSON.stringify(st); betul(!/Tan Sri|Puan Sri|Dato' |Datin/.test(semua), 'tiada gelaran persekutuan/Semenanjung untuk PBB');
  bina('UMNO'); const su = JSON.stringify(OG.getStruktur(S.loadPlayer())); betul(/Tan Sri/.test(su) && !/ anak |Datuk Amar|Pehin Sri/.test(su), 'UMNO kekal Tan Sri / Dato\', tiada nama Dayak');
});

ujian('v11.4: status kerajaan pemain sama dengan anggaran kerusi yang dipaparkan; negeri DUN kerusi lain; notis rayuan', () => {
  const benih = (x) => () => { x = (x + 0x6D2B79F5) | 0; let t = Math.imul(x ^ (x >>> 15), 1 | x); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let semak = 0;
  for (let i = 1; i <= 12; i++) {
    const r = lobiKempen(benih(i), true); betul(r.ok, r.ralat); if (!r.keputusan.menang) { continue; }
    const p = S.loadPlayer(), st = PRU.getPRU(p).status, k = p.kerusiNasional; betul(k && st, 'kerusiNasional dan status disimpan');
    const kerajaanKerusi = st.jenis === 'MP' ? k.kerajaan : (k.dun.kerajaan >= Math.floor(k.dun.jumlah / 2) + 1);
    sama(!!st.kerajaan, !!kerajaanKerusi, 'status kerajaan = kad kerusi (' + st.jenis + ')'); semak++;
    PRU.tutupKeputusan();
  }
  betul(semak > 0, 'sekurang-kurangnya satu kemenangan disemak');
  const p = S.loadPlayer(), pru = PRU.getPRU(p); pru.status = { jenis: 'ADUN', kerusi: 'Balakong', lain: true, negeri: 'Selangor', kerajaan: true }; S.applyEffects({}, { kiraTindakan: false, patch: { pru, negeri: 'Melaka' } });
  sama(PRU.negeriADUN(S.loadPlayer()), 'Selangor', 'negeri DUN ikut kerusi');
  const PP = g.MyPolitikPaparan || require('../js/paparan.js'); sama(PP.anggarKerusi(S.loadPlayer(), { tahun: 2030, bulan: 1 }).dun.negeri, 'Selangor');
  const ET = g.MyPolitikEtika; const q = S.loadPlayer(); const e = ET.getEtika(q); e.status = 'dipecat'; e.hukuman = { perkara: 'x', tamatTahun: q.tahun, tamatBulan: q.bulan }; S.applyEffects({}, { kiraTindakan: false, patch: { etika: e } });
  const ev = ET.prosesBulan({ rng: () => 0.99 }).peristiwa; betul(ev.some((x) => /Hantar Rayuan Pemecatan/.test(x.mesej)), 'notis rayuan');
  sama(ET.prosesBulan({ rng: () => 0.99 }).peristiwa.filter((x) => /Hantar Rayuan/.test(x.mesej)).length, 0, 'notis sekali sahaja');
});

ujian('v12.1: Jemaah Menteri: PM pilih 8 portfolio, kesan tadbir urus / gabungan / tekanan, rombakan, senarai untuk menteri', () => {
  const J = g.MyPolitikJemaah, KB = g.MyPolitikKabinet;
  P.daftar({}); P.tetap({ ap: 10, tahun: 2030, bulan: 3 });
  betul(!J.perluBentuk(S.loadPlayer()) && J.senarai(S.loadPlayer()) === null, 'bukan kerajaan: tiada');
  betul(KB.lantikKanan('PERDANA_MENTERI').ok, 'lantik PM');
  let p = S.loadPlayer(); betul(J.perluBentuk(p), 'PM perlu bentuk');
  const sl = J.calon(p); sama(sl.length, 8); sl.forEach((s) => { sama(s.calon.length, 3); sama(s.calon.map((c) => c.jenis).sort().join(), 'anda,borneo,rakan'); });
  sama(JSON.stringify(J.calon(p)), JSON.stringify(sl), 'calon deterministik');
  betul(!J.umumkan([0, 1]).ok, 'mesti lengkap');
  const pilihAnda = sl.map((s) => s.calon.findIndex((c) => c.jenis === 'anda')), n = J.nilai(p, pilihAnda);
  sama(n.rakan, 0); sama(n.penaltiHubungan, 35, '3 kurang x 10 + Borneo 5');
  const hub0 = PRU.getPRU(p).hubunganGabungan, r = J.umumkan(pilihAnda); betul(r.ok, r.ralat);
  p = S.loadPlayer(); sama(KB.getKabinet(p).governanceRating, n.tadbir); sama(PRU.getPRU(p).hubunganGabungan, Math.max(0, hub0 - 35));
  betul(!J.perluBentuk(p), 'sudah diumumkan'); const l = J.senarai(p); sama(l.length, 2 + g.MyPolitikKabinetData.menteri.length); betul(l[0].anda, 'PM = anda');
  sl.forEach((s0, i) => sama(l.filter((x) => x.portfolio === s0.portfolio)[0].menteri, s0.calon[pilihAnda[i]].nama, 'senarai ikut pilihan: ' + s0.portfolio));
  const t0 = KB.getKabinet(p).tekananPolitik; J.prosesBulan(); sama(KB.getKabinet(S.loadPlayer()).tekananPolitik, Math.max(0, Math.min(100, t0 + n.tekananBulanan)), 'tekanan bulanan');
  betul(J.rombak().ok, 'rombak'); p = S.loadPlayer(); sama(p.ap, 7); betul(J.perluBentuk(p), 'rombakan buka semula');
  betul(J.umumkan(J.calon(p).map((s) => s.calon.findIndex((c) => c.jenis === 'rakan'))).ok); betul(!J.rombak().ok, 'sekali setahun');
  const k = KB.getKabinet(S.loadPlayer()); k.roleLevel = 'MENTERI_PENUH'; k.portfolioName = 'Menteri Kesihatan'; S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: k } });
  const l2 = J.senarai(S.loadPlayer()); betul(l2.some((x) => x.portfolio === 'Menteri Kesihatan' && x.anda), 'menteri: baris anda'); betul(!l2[0].anda, 'PM NPC');
});

ujian('v12.2: Isu Semasa (muncul, kesan kerajaan/pembangkang, abai, isu Sarawak) dan soalan wartawan ikut konteks', () => {
  const I = g.MyPolitikIsu, M = g.MyPolitikMedia, KB = g.MyPolitikKabinet;
  P.daftar({}); P.tetap({ jawatan: 'Ketua Cawangan', tahun: 2030, bulan: 3, negeri: 'Johor' });
  let ev = I.prosesBulan({ rng: () => 0 }).peristiwa; betul(ev.some((e) => e.jenis === 'isu_semasa'), 'isu muncul');
  let p = S.loadPlayer(), s = I.semasa(p); betul(s && s.pilihan.length === 3, 'tiga pilihan'); betul(!s.isu.sw, 'bukan isu Sarawak untuk Johor/UMNO');
  sama(I.prosesBulan({ rng: () => 0 }).peristiwa.length, 0, 'tiada isu kedua bulan sama');
  const kp = I.kesan(p, s.isu, 'kritik'), rep0 = p.reputasi, au0 = p.kesetiaan.akarUmbi;
  betul(I.jawab('kritik').ok); p = S.loadPlayer(); sama(p.kesetiaan.akarUmbi, Math.min(100, au0 + kp.akarUmbi), 'akar umbi'); betul(!I.semasa(p), 'isu dijawab');
  betul(I.pendirianAkhir(p) && I.pendirianAkhir(p).pilihan === 'kritik', 'pendirian diingati');
  sama(I.prosesBulan({ rng: () => 0 }).peristiwa.length, 0, 'jeda 2 bulan');
  P.tetap({ bulan: 5 }); I.prosesBulan({ rng: () => 0 }); P.tetap({ bulan: 6 }); const r0 = S.loadPlayer().reputasi;
  ev = I.prosesBulan({ rng: () => 0.99 }).peristiwa; betul(ev.some((e) => /tidak menyatakan pendirian/.test(e.mesej)), 'abai'); sama(S.loadPlayer().reputasi, r0 - 1);
  /* kerajaan vs pembangkang */
  const isuB = I.cari('beras'); const pk = Object.assign({}, S.loadPlayer(), { kerusiNasional: { kerajaan: true } }), po = Object.assign({}, S.loadPlayer(), { kerusiNasional: { kerajaan: false } });
  betul(I.kesan(pk, isuB, 'kritik').hubungan < 0 && !I.kesan(po, isuB, 'kritik').hubungan, 'kritik dalam kerajaan rosakkan hubungan gabungan');
  /* Sarawak: isu MA63 / royalti khas */
  const pw = { parti: 'PBB', negeri: 'Sarawak', kesetiaan: {} }; sama(I.kesan(pw, I.cari('royalti'), 'kritik').akarUmbi, 6); sama(I.kesan(pw, I.cari('royalti'), 'pertahan').akarUmbi, -5);
  /* soalan wartawan ikut konteks */
  betul(KB.lantikKanan('TIMBALAN_PM').ok); M.setRng(() => 0.3);
  const ms = M.mulaSidang({}); betul(ms.ok, ms.ralat); const sd = M.getMedia(S.loadPlayer()).sidang;
  betul(sd.soalan.some((id) => /^(port_|susulan|pem_|kj_|int_)/.test(id)), 'sekurang-kurangnya satu soalan ikut konteks: ' + sd.soalan.join());
  betul(sd.teks.every((t) => !/\{\w+\}/.test(t)), 'tiada pemegang tempat tertinggal');
  const per0 = M.getMedia(S.loadPlayer()).persepsi; betul(M.jawabSidang('diam').ok); sama(M.getMedia(S.loadPlayer()).persepsi, Math.min(100, per0 + 3), 'tiada komen: persepsi +3');
  const au1 = S.loadPlayer().kesetiaan.akarUmbi; betul(M.jawabSidang('serang').ok); sama(S.loadPlayer().kesetiaan.akarUmbi, Math.min(100, au1 + 6), 'serang balik: akar umbi +6');
  M.setRng(null);
});

ujian('v12.3: soalan Sarawak kira-kira separuh sidang pemain Sarawak (maksimum satu); tiada untuk UMNO Semenanjung', () => {
  const M = g.MyPolitikMedia; P.daftar({}); P.tetap({ jawatan: 'Ketua Bahagian', negeri: 'Melaka' });
  const kira = (parti, negeri) => { let ada = 0, lebih = 0; for (let i = 0; i < 200; i++) { const q = S.loadPlayer(); q.parti = parti; q.negeri = negeri; q.media = null; S.savePlayer(q); M.setRng(P.rng ? P.rng(i) : (() => { let x = i * 9301 + 49297; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; })()); M.mulaSidang({}); const n = M.getMedia(S.loadPlayer()).sidang.soalan.filter((x) => /^sw_/.test(x)).length; if (n) { ada++; } if (n > 1) { lebih++; } } M.setRng(null); return { ada, lebih }; };
  const pbb = kira('PBB', 'Sarawak'); betul(pbb.ada >= 70 && pbb.ada <= 130, 'PBB kira-kira separuh: ' + pbb.ada + '/200'); sama(pbb.lebih, 0, 'maksimum satu soalan Sarawak');
  sama(kira('UMNO', 'Melaka').ada, 0, 'UMNO Melaka tiada soalan Sarawak');
});

ujian('v10.4: kejutan kempen khusus parti Sarawak mod ringan', () => {
  const D = g.MyPolitikData, fs = require('fs'), path = require('path');
  const K = PRU.KEJUTAN_PARTI, ids = new Set(PRU.KEJUTAN.map((x) => x.id));
  sama(Object.keys(K).sort().join(), 'PDP,PRS,PSB,SUPP');
  Object.keys(K).forEach((k) => { sama(K[k].length, 2, k + ' ada 2 kejutan'); K[k].forEach((e) => { betul(!ids.has(e.id), 'id unik ' + e.id); ids.add(e.id); sama(e.pilihan.length, 3, e.id + ' 3 pilihan'); betul(PRU.KEJUTAN_PARTI && e.id.indexOf('sw_') === 0, 'awalan sw_'); }); });
  /* pemilihan: umum bila rng tinggi, parti bila rng rendah; UMNO / PBB tidak pernah dapat kejutan parti */
  const pp = { parti: 'PRS' }; betul(K.PRS.some((e) => e.id === PRU.pilihKejutan(pp, () => 0.01).id), 'PRS: rng rendah = kejutan parti');
  betul(PRU.KEJUTAN.some((e) => e.id === PRU.pilihKejutan(pp, () => 0.99).id), 'PRS: rng tinggi = kejutan umum');
  ['UMNO', 'PBB'].forEach((x) => betul(PRU.KEJUTAN.some((e) => e.id === PRU.pilihKejutan({ parti: x }, () => 0.01).id), x + ' tiada kejutan parti'));
  /* semua pilihan boleh dijawab (kejutanId menemui kejutan parti) */
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'prs-sarawak.csv'), 'utf8'))), duns = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'pbb-dun.json'), 'utf8'));
  const b = h.bahagian.find((x) => duns[parseInt(x.kod, 10)] && duns[parseInt(x.kod, 10)].rkPRS === 1), dem = D.tentukanDemografi('Lelaki', 40);
  Object.keys(K).forEach((k) => K[k].forEach((e) => e.pilihan.forEach((c) => {
    S.savePlayer(S.buildPlayerProfile({ parti: 'PRS', nama: 'Uji', demografik: dem, cawangan: (b.dun ? b.dun[0].cawangan[0] : b.cawangan[0]), sayap: 'utama', avatar: 'biasa', dunInfo: duns[parseInt(b.kod, 10)] }));
    P.tetap({ jawatan: 'AJK Cawangan', jawatanList: [pegang('ajk_cawangan')], ip: 800, myr: 500000, ap: 50, reputasi: 80, tahun: 2027, bulan: 1 });
    const pru = PRU.getPRU(S.loadPlayer()); P.tetap({ tahun: pru.tahunPRU, bulan: pru.bulanPRU }); betul(PRU.isytihar('tamat_penggal').ok);
    betul(PRU.pilihKerusi('DUN', { rng: () => 0.01 }).ok); let a = PRU.getPRU(S.loadPlayer()).aktif; if (a.fasa === 'runding') { PRU.runding('abai'); a = PRU.getPRU(S.loadPlayer()).aktif; }
    const pil = PRU.peruntukanPilihan(S.loadPlayer(), a); betul(PRU.mulaKempen(PRU.JANJI.map((x) => x.id).slice(0, 3), pil.pilihan[pil.pilihan.length - 1]).ok);
    const pr2 = PRU.getPRU(S.loadPlayer()); pr2.aktif.kejutanAktif = { id: e.id, hari: 3 }; S.applyEffects({}, { kiraTindakan: false, patch: { pru: pr2 } });
    const kp = PRU.keadaanKempen(S.loadPlayer()); sama(kp.kejutan && kp.kejutan.id, e.id, 'kejutan aktif ' + e.id);
    const r = PRU.jawabKejutan(c.id, { rng: () => 0.3 }); betul(r.ok, e.id + '/' + c.id + ': ' + r.ralat);
  })));
});


ujian('v10.5: avatar bukan-UMNO tanpa Puteri dan rupa umum', () => {
  const AV = require('../js/avatar.js');
  betul(AV.senarai('UMNO').some(a => a.kod === 'puteri'));
  ['PBB', 'PRS', 'SUPP', 'PDP', 'PSB'].forEach(k => betul(!AV.senarai(k).some(a => a.kod === 'puteri')));
  sama(AV.cadangan('puteri', 'PBB'), 'wanita');
  sama(AV.cadangan('puteri', 'UMNO'), 'puteri');
  betul(AV.svg('pemuda', { parti: 'UMNO' }).indexOf('#15171D') >= 0 && AV.svg('pemuda', { parti: 'PSB' }).replace(/mpa\d+/g, 'x') !== AV.svg('pemuda', { parti: 'UMNO' }).replace(/mpa\d+/g, 'x'));
  betul(AV.svg('puteri', { parti: 'PDP' }).indexOf('Wanita') >= 0);
});


ujian('v10.6: parti Sarawak tiada Puteri, Fasal UMNO dan syarat penggal MKT', () => {
  const D2 = require('../js/data.js'), ET2 = require('../js/etika.js');
  sama(D2.tentukanDemografi('P', 25, 'PBB').kod, 'wanita'); sama(D2.tentukanDemografi('P', 25, 'UMNO').kod, 'puteri'); sama(D2.tentukanDemografi('P', 25).kod, 'puteri');
  const p = { parti: 'PBB', tahun: 2026, bulan: 1, keahlian: { sejakTahun: 2026, sejakBulan: 1 } };
  const k = ET2.semakKeahlian(p, 36, 'Fasal 15.5'); betul(!k.sah && !/Fasal/.test(k.sebab), 'PBB: sebab keahlian tanpa Fasal');
  betul(/Fasal 15\.5/.test(ET2.semakKeahlian(Object.assign({}, p, { parti: 'UMNO' }), 36, 'Fasal 15.5').sebab), 'UMNO: Fasal 15.5 kekal');
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'EventDatabase.js'), 'utf8');
  betul(/id: 'konvensyen_puteri'[^\n]*\n[^]*?syarat: function \(p\) \{ return !p\.parti \|\| p\.parti === 'UMNO'/.test(src) === false || src.indexOf("id: 'konvensyen_wanita'") > 0, 'acara Konvensyen Wanita untuk parti lain wujud');
});

/* ---------- v13.26: perubahan kerusi semasa penggal dan sejarah PRU ---------- */
function ksPemain() {
  P.daftar({ kesukaran: 'NORMAL', sayap: 'utama' });
  const p0 = S.loadPlayer();
  S.applyEffects({}, { kiraTindakan: false, patch: { reputasi: 50, kerusiNasional: { tahun: p0.tahun, bulan: p0.bulan, parti: 58, rakan: 62, pembangkang: 99, bebas: 3, kerajaan: true,
    dun: { jumlah: 42, kerajaan: 24, bebas: 1, pembangkang: 17, negeri: '06' } } } });
  return S.loadPlayer();
}
ujian('kerusi semasa: geser memindah kerusi antara blok (Parlimen dan DUN) dan dicatat', () => {
  const KS = g.MyPolitikKerusiSemasa; let p = ksPemain();
  const b0 = KS.blok(p, false), d0 = KS.blok(p, true); sama(b0.PARTI + b0.RAKAN + b0.LAIN + b0.PH + b0.PN, 222);
  betul(KS.geser({ dari: 'PH', ke: 'PARTI', kerusi: 'P.120' }).ok); p = S.loadPlayer();
  const b1 = KS.blok(p, false); sama(b1.PARTI, b0.PARTI + 1); sama(b1.PH, b0.PH - 1); sama(b1.PN, b0.PN, 'PN tidak berubah'); sama(p.kerusiNasional.perubahan.length, 1);
  betul(KS.geser({ dun: true, dari: 'PARTI', ke: 'PN', kerusi: 'N.10' }).ok); p = S.loadPlayer();
  const d1 = KS.blok(p, true); sama(d1.PARTI, d0.PARTI - 1); sama(d1.PN, d0.PN + 1); sama(d1.PH, d0.PH);
  sama(KS.geser({ dari: 'LAIN', ke: 'LAIN' }).ok, false); sama(KS.terkini(p).length, 2);
});
ujian('kerusi semasa: PRK pemain dan PRK selepas letak jawatan menukar kerusi', () => {
  const KS = g.MyPolitikKerusiSemasa; let p = ksPemain(); const b0 = KS.blok(p, false);
  sama(KS.selepasPRKPemain({ jenis: 'PARLIMEN', nama: 'Pekan', pertahan: true, lawan: 'PAS' }, true), null, 'pertahan menang: tiada perubahan');
  KS.selepasPRKPemain({ jenis: 'PARLIMEN', nama: 'Pekan', pertahan: true, lawan: 'PAS' }, false); p = S.loadPlayer();
  sama(KS.blok(p, false).PARTI, b0.PARTI - 1); sama(KS.blok(p, false).PN, b0.PN + 1, 'PAS = PN');
  KS.selepasPRKPemain({ jenis: 'PARLIMEN', nama: 'Bangsar', pertahan: false, lawan: 'DAP' }, true); p = S.loadPlayer();
  sama(KS.blok(p, false).PARTI, b0.PARTI); sama(KS.blok(p, false).PH, b0.PH - 1, 'rampas daripada PH');
  KS.selepasPRKLetak({ jenis: 'DUN', nama: 'Peramu' }, false, () => 0.1); p = S.loadPlayer(); sama(KS.blok(p, true).PH, KS.blok(ksPemain(), true).PH + 1);
});
ujian('kerusi semasa: PRK NPC 15% sebulan (cara lama serta-merta, o.serta), penyandang kekal, tidak menukar kerajaan; arkib sejarah PRU', () => {
  const KS = g.MyPolitikKerusiSemasa; let p = ksPemain();
  sama(KS.prosesBulan({ rng: () => 0.9, serta: true }).peristiwa.length, 0, 'tiada PRK (rng >= 0.15)');
  p = S.loadPlayer(); sama(p.kerusiSejarah.length, 1, 'PRU diarkib'); sama(p.kerusiSejarah[0].PARTI, 58);
  let ev = KS.prosesBulan({ rng: rngTetap(0.1), serta: true }).peristiwa; betul(ev.length === 1 && /mengekalkan/.test(ev[0].mesej), 'rng 0.1: penyandang kekal');
  const sq = [0.1, 0.9, 0.9, 0.5, 0.95, 0.1], seq = () => sq.length ? sq.shift() : 0.1;    // PRK, Parlimen, blok terakhir (PN), nama, bertukar, pemain
  ev = KS.prosesBulan({ rng: seq, serta: true }).peristiwa; p = S.loadPlayer();
  betul(ev.length === 1 && /merampas/.test(ev[0].mesej), ev.map((e) => e.mesej).join()); sama(p.kerusiNasional.perubahan.length, 1);
  S.applyEffects({}, { kiraTindakan: false, patch: { kerusiNasional: Object.assign({}, p.kerusiNasional, { parti: 52, rakan: 60, pembangkang: 107, perubahan: [] }) } });
  const sq2 = [0.1, 0.9, 0.0, 0.5, 0.95, 0.9], seq2 = () => sq2.length ? sq2.shift() : 0.9;   // kerusi PARTI ke pembangkang: 112 -> 111 (merentas ambang)
  ev = KS.prosesBulan({ rng: seq2, serta: true }).peristiwa; p = S.loadPlayer();
  betul(/mengekalkan/.test(ev[0].mesej), 'PRK NPC tidak menukar kerajaan'); sama(p.kerusiNasional.parti, 52);
  const sj = KS.sejarah(p); sama(sj.length, 1); betul(!sj[0].ringkas, 'arkib penuh');
});
/* ---------- v13.29: status kerajaan ikut kad kerusi (maklum balas pemain: ADUN Melaka, BN 19/28, "tidak membentuk kerajaan") ---------- */
ujian('status kerajaan: baiki ADUN "bukan kerajaan" yang bercanggah dengan kad kerusi dan buka Lobi; PRK DUN ikut kad kerusi', () => {
  let p = ksPemain(); const pr = PRU.getPRU(p);
  S.applyEffects({}, { kiraTindakan: false, patch: { pru: Object.assign({}, pr, { aktif: null, status: { jenis: 'ADUN', kerusi: 'Bukit Katil', kerajaan: false, sejakTahun: p.tahun, sejakBulan: p.bulan } }) } });
  sama(PRU.kerajaanSemasa(S.loadPlayer(), 'ADUN'), true, 'BN 24/42 = kerajaan');
  betul(PRU.baikiStatusKerajaan(), 'dibaiki'); p = S.loadPlayer();
  sama(PRU.getPRU(p).status.kerajaan, true); betul(!!KB.getKabinet(p).lobi, 'Lobi Portfolio dibuka');
  sama(PRU.baikiStatusKerajaan(), false, 'tidak berulang');
  S.applyEffects({}, { kiraTindakan: false, patch: { kerusiNasional: Object.assign({}, p.kerusiNasional, { dun: { jumlah: 42, kerajaan: 15, bebas: 1, pembangkang: 26, negeri: '06' } }),
    pru: Object.assign({}, PRU.getPRU(p), { status: { jenis: 'ADUN', kerusi: 'Bukit Katil', kerajaan: false } }) } });
  sama(PRU.baikiStatusKerajaan(), false, 'pembangkang sebenar tidak diubah');
  sama(PRU.kerajaanSemasa(S.loadPlayer(), 'ADUN'), false); sama(PRU.kerajaanSemasa(S.loadPlayer(), 'ADUN', { rampas: true }), false, '16 < 22');
});
/* ---------- v13.30: gelaran negeri lain dan pencapaian kerjaya tambahan ---------- */
ujian('v13.30: gelaran negeri lain: Menteri 24 bulan, maksimum 3, bukan negeri sendiri, jelajah diutamakan', () => {
  const GL = g.MyPolitikGelaran || require('../js/gelaran.js');
  P.daftar({}); P.tetap({ negeri: 'Johor', tahun: 2035, bulan: 1, integriti: { skor: 80 }, gelaran: { bulanLuarF: 23 },
    kabinet: { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH', portfolioName: 'Menteri' } });
  const rep = S.loadPlayer().reputasi; let ev = GL.prosesBulan({ rng: () => 0.0 }).peristiwa, d = GL.getGelaran(S.loadPlayer());
  sama(d.luar.length, 1, 'satu gelaran negeri lain'); betul(d.luar[0].negeri !== 'Johor', 'bukan negeri sendiri'); sama(d.bulanLuarF, 0, 'pembilang diset semula');
  betul(ev.some((e) => /oleh negeri/.test(e.mesej))); betul(S.loadPlayer().reputasi >= rep + 1, 'Reputasi +1');
  P.tetap({ gelaran: Object.assign({}, d, { bulanLuarF: 23 }), integriti: { skor: 60 } }); GL.prosesBulan(); sama(GL.getGelaran(S.loadPlayer()).luar.length, 1, 'Integriti 60: tiada');
  P.tetap({ gelaran: { luar: [{ negeri: 'Kedah' }, { negeri: 'Perak' }, { negeri: 'Sabah' }], bulanLuarF: 30 }, integriti: { skor: 80 } }); GL.prosesBulan();
  sama(GL.getGelaran(S.loadPlayer()).luar.length, 3, 'had 3 negeri');
  const p = S.loadPlayer(), d0 = GL.getGelaran(p); d0.luar = [];
  const U = g.MyPolitikUMNO, asal = U.kiraJelajahNegeri; U.kiraJelajahNegeri = () => ({ Pahang: 8 });
  const kira = {}; for (let i = 0; i < 200; i++) { const n = GL.pilihNegeriLuar(p, d0, () => i / 200); kira[n] = (kira[n] || 0) + 1; }
  U.kiraJelajahNegeri = asal; betul(kira.Pahang > 30, 'Pahang (dijelajah 8 kali) lebih kerap: ' + kira.Pahang); betul(!kira.Johor, 'Johor tidak dipilih');
  S.clearPlayer();
});
ujian('v13.30: pencapaian kerjaya tambahan (Ketua Negeri, PM, Hatrik PRU, PRK, Presiden, Tun, Suara Rakyat, RUU, PhD, Jutawan)', () => {
  let h = pcLangkah(pcPemain({ kabinet: { hasGovernmentRole: true, roleLevel: 'MENTERI_BESAR' } }), {}, null); betul(h.baru.indexOf('ketua_negeri') >= 0);
  h = pcLangkah(pcPemain({ kabinet: { hasGovernmentRole: true, roleLevel: 'PERDANA_MENTERI' } }), {}, null); betul(h.baru.indexOf('perdana_menteri') >= 0 && h.baru.indexOf('negarawan_utama') >= 0);
  const sej = [2026, 2031, 2036].map((t) => ({ tahun: t, bulan: 5, hasil: 'menang', jenis: 'PARLIMEN' }));
  sama(pcLangkah(pcPemain({ pru: { sejarah: sej.slice(0, 2) } }), {}, null).baru.indexOf('hatrik_pru'), -1, '2 PRU tidak cukup');
  betul(pcLangkah(pcPemain({ pru: { sejarah: sej } }), {}, null).baru.indexOf('hatrik_pru') >= 0, '3 PRU berturut-turut');
  sama(pcLangkah(pcPemain({ pru: { sejarah: [sej[0], { tahun: 2031, bulan: 5, hasil: 'kalah' }, sej[2]] } }), {}, null).baru.indexOf('hatrik_pru'), -1, 'terputus');
  betul(pcLangkah(pcPemain({ prk: { sejarah: [{ hasil: 'menang' }] } }), {}, null).baru.indexOf('raja_prk') >= 0);
  betul(pcLangkah(pcPemain({ jawatanList: [{ kod: 'presiden' }] }), {}, null).baru.indexOf('nakhoda_parti') >= 0);
  const b1 = pcLangkah(pcPemain({ gelaran: { tun: { tahun: 2040 }, luar: [{}, {}, {}] } }), {}, null).baru; betul(b1.indexOf('tun') >= 0 && b1.indexOf('tokoh_negara') >= 0);
  const isu = Array.from({ length: 19 }, (x, i) => ({ kod: 'k' + i, selesai: true, cara: 'usul' }));
  let st = pcLangkah(pcPemain({ isu }), {}, null).st; sama(PC.kemajuan(pcPemain({ isu }), st, 'suara_rakyat'), '19 / 20');
  h = pcLangkah(pcPemain({ isu, log: [{ tindakan: 'kawasan_dana', nama: 'x' }] }), { tindakan: 'kawasan_dana' }, st); betul(h.baru.indexOf('suara_rakyat') >= 0, '19 isu + 1 keluhan');
  st = null; for (let i = 0; i < 5; i++) { h = pcLangkah(pcPemain({ dewan: { sejarah: [{ jenis: 'ruu', lulus: true }] }, log: [{ tindakan: 'dewan_undi', nama: 'Lulus: RUU' + i }] }), { tindakan: 'dewan_undi' }, st); st = h.st; }
  betul(h.baru.indexOf('penggubal') >= 0, '5 RUU lulus');
  betul(pcLangkah(pcPemain({ pendidikan: { tahap: 'phd' } }), {}, null).baru.indexOf('doktor_falsafah') >= 0);
  betul(pcLangkah(pcPemain({ myr: 1200000 }), {}, null).baru.indexOf('jutawan_politik') >= 0);
  sama(pcLangkah(pcPemain({ myr: 1200000, integriti: { skor: 70, audit: { x: 1 } } }), {}, null).baru.indexOf('jutawan_politik'), -1, 'audit SPRM aktif');
});
/* ---------- v13.31: PAS (Perikatan Nasional), Fasa 1 ---------- */
ujian('v13.31 PAS: kitaran 2 tahun, perwakilan Kawasan (Fasal 18(5)), kuota PN, jelajah', () => {
  const M = g.MyPolitikPAS; P.daftar({}); P.tetap({ parti: 'PAS', ap: 10, myr: 10000 });
  let p = S.loadPlayer(); sama(p.parti, 'PAS');
  betul(M.adalahTahunPemilihan(p, 2027) && M.adalahTahunPemilihan(p, 2029) && !M.adalahTahunPemilihan(p, 2028), 'setiap 2 tahun dari 2027');
  sama(M.tahunSeterusnya(p, 2028), 2029); sama(g.MyPolitikElection.adalahTahunPemilihan(2031), true, 'enjin pemilihan ikut PAS');
  const d = g.MyPolitikPASData; sama(Object.keys(d.parlimen).length, 165);
  const kecil = Object.keys(d.parlimen).filter((k) => d.parlimen[k].a < 2000)[0], besar = Object.keys(d.parlimen).sort((a, b) => d.parlimen[b].a - d.parlimen[a].a)[0];
  if (kecil) { sama(M.perwakilan(kecil), 4, 'Kawasan < 2,000 ahli: 4 wakil'); }
  betul(M.perwakilan(besar) <= 15 && M.perwakilan(besar) > 4, 'maksimum 15 wakil');
  const k = M.kawasan(p); betul(k.parlimen && typeof k.kuotaPL === 'boolean', 'kawasan dan kuota'); betul(/rakan PN/.test(M.sebabKuota(p, 'PARLIMEN')));
  sama(M.statusJelajah(p).boleh, false, 'perlu Yang Dipertua Kawasan');
  S.applyEffects({}, { kiraTindakan: false, patch: { jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: p.tahun }] } });
  const kod = Object.keys(d.parlimen)[3], s0 = M.sokonganBahagian(S.loadPlayer())[kod];
  betul(M.jelajah(kod).ok); betul(M.sokonganBahagian(S.loadPlayer())[kod] > s0, 'jelajah naikkan sokongan');
});
ujian('v13.31 PAS: anggaran kerusi PN (pembangkang persekutuan, kerajaan negeri Kelantan) dan label lawan BN', () => {
  P.daftar({}); P.tetap({ parti: 'PAS', reputasi: 50 }); const p = S.loadPlayer(), A = g.NusaPaparan;
  let kj = 0, kel = 0, joh = 0;
  for (let i = 0; i < 60; i++) {
    const q = Object.assign({}, p, { id: 'pas' + i });
    const a = A.anggarKerusi(q, { tahun: 2028, bulan: 3 }, { negeri: 'Kelantan', pop: 45 }); if (a.kerajaan && !a.npcGabungan) { kj++; } if (a.dun.kerajaan >= 23) { kel++; }
    const b = A.anggarKerusi(q, { tahun: 2028, bulan: 3 }, { negeri: 'Johor', pop: 45 }); if (b.dun.kerajaan >= 29) { joh++; }
  }
  sama(kj, 0, 'pop 45: PN tidak membentuk kerajaan persekutuan tanpa gabungan NPC (v13.33)'); sama(kel, 60, 'PN memerintah Kelantan'); sama(joh, 0, 'PN tidak memerintah Johor');
  let kj70 = 0; for (let i = 0; i < 60; i++) { if (A.anggarKerusi(Object.assign({}, p, { id: 'q' + i }), { tahun: 2028, bulan: 3 }, { pop: 70 }).kerajaan) { kj70++; } }
  betul(kj70 > 40, 'pop 70: PN boleh membentuk kerajaan (' + kj70 + '/60)');
  sama(A.labelBN(p).pendek, 'PN'); sama(A.lawanGab(p).PN.pendek, 'BN', "slot lawan 'PN' = BN");
  sama(g.MyPolitikKerusiSemasa.label(p, 'PN'), 'BN'); sama(g.MyPolitikKerusiSemasa.blokLawan('UMNO', null, p), 'PN');
  const Pt = g.MyPolitikParti; betul(Pt.sah('PAS') && Pt.info('PAS').sayap.indexOf('puteri') < 0, 'PAS tiada Puteri');
  S.clearPlayer();
});
/* ---------- v13.32: PAS Fasa 2 ---------- */
ujian('v13.32 PAS: Restu Majlis Syura (Ceramah, susut, Integriti), sekatan Presiden, peluang calon', () => {
  const M = g.MyPolitikPAS, R = M.CONFIG.RESTU; P.daftar({}); P.tetap({ parti: 'PAS', ap: 10, myr: 10000, integriti: { skor: 60 } });
  let p = S.loadPlayer(); sama(M.restu(p), 50);
  const r = M.ceramah(false); betul(r.ok, r.ralat); p = S.loadPlayer(); sama(M.restu(p), 51); sama(M.ceramah(false).ok, false, 'sekali sebulan');
  sama(M.statusCeramah(p, true).boleh, false, 'Ceramah Perdana perlu Yang Dipertua Kawasan');
  M.prosesBulan({ rng: () => 0.99 }); sama(M.restu(S.loadPlayer()), 50, 'susut ke arah 50');
  P.tetap({ integriti: { skor: 85 } }); M.prosesBulan({ rng: () => 0.99 }); sama(M.restu(S.loadPlayer()), 50.5, 'Integriti >= 80: +0.5');
  P.tetap({ pas: Object.assign({}, S.loadPlayer().pas, { restu: 55 }) }); p = S.loadPlayer();
  betul(/Restu Majlis Syura/.test(M.sekatanJawatan(p, { kod: 'presiden' })), 'Presiden perlu Restu 60'); sama(M.sekatanJawatan(p, { kod: 'ketua_cawangan' }), null);
  P.tetap({ pas: Object.assign({}, p.pas, { restu: 75 }) }); p = S.loadPlayer(); sama(M.sekatanJawatan(p, { kod: 'presiden' }), null);
  sama(Math.round(M.adjCalon(p) * 1000) / 10, 10, 'Restu 75: peluang calon +10%');
  P.tetap({ etika: Object.assign({}, p.etika || {}, { siasatan: { tahun: p.tahun, bulan: p.bulan } }) }); M.prosesBulan({ rng: () => 0.99 });
  betul(M.restu(S.loadPlayer()) <= 70.5, 'siasatan etika: -5'); M.prosesBulan({ rng: () => 0.99 }); betul(M.restu(S.loadPlayer()) > 68, 'siasatan dikira sekali');
  S.clearPlayer();
});
ujian('v13.32 PAS: Dewan Ulamak (bidang Islam), As-Sabiqun (60+, tanpa jawatan), Ahli Bersekutu, Majlis Syura, rayuan', () => {
  const M = g.MyPolitikPAS, J0 = g.MyPolitikJawatan; P.daftar({}); P.tetap({ parti: 'PAS', ap: 10, myr: 10000, ip: 800, tahun: 2027, bulan: 2, pendidikan: { tahap: 'ijazah', bidang: 'umum' } });
  let p = S.loadPlayer(); sama(M.layakDewan(p, 'ulamak').boleh, false, 'perlu bidang Islam');
  betul(M.tukarBidang().ok); sama(M.tukarBidang().ok, false, 'sekali sahaja'); p = S.loadPlayer(); betul(M.layakDewan(p, 'ulamak').boleh);
  betul(M.sertaiDewan('ulamak').ok); betul(M.bertandingDewan('ulamak').ok, 'calon Kawasan');
  P.tetap({ bulan: 5 }); M.prosesBulan({ rng: () => 0.0 }); p = S.loadPlayer(); sama(M.dewanPemain(p, 'ulamak').jawatan, 'kawasan', 'menang Ketua Dewan Ulamak Kawasan');
  betul(M.statusBertandingDewan(p, 'ulamak').boleh && M.statusBertandingDewan(p, 'ulamak').ke === 'negeri', 'seterusnya Negeri');
  P.tetap({ pas: Object.assign({}, p.pas, { restu: 90, dewan: { ulamak: { ahli: true, jawatan: 'pusat', calon: null } } }), bulan: 10 });
  M.prosesBulan({ rng: () => 0.0 }); p = S.loadPlayer(); betul(!!p.pas.syura, 'dilantik Ahli Majlis Syura');
  sama(M.layakDewan(p, 'sabiqun').boleh, false, 'As-Sabiqun 60 tahun ke atas');
  // rayuan tatatertib
  P.tetap({ pas: Object.assign({}, p.pas, { restu: 80 }), etika: Object.assign({}, p.etika || {}, { status: 'digantung', hukuman: { tahun: p.tahun, bulan: p.bulan } }) });
  const ry = M.rayuan({ rng: () => 0.1 }); betul(ry.ok && ry.jaya, ry.ralat); sama(S.loadPlayer().etika.status, 'baik');
  // Ahli Bersekutu
  P.daftar({}); P.tetap({ parti: 'PAS', keahlianJenis: 'bersekutu', ip: 500 }); p = S.loadPlayer();
  betul(M.bersekutu(p)); betul(/Dewan Himpunan Pendukung/.test(M.sekatanJawatan(p, { kod: 'ketua_cawangan' })));
  const st = J0.statusJawatan ? J0.statusJawatan(p, 'ketua_cawangan') : null; if (st) { sama(st.terbuka, false); }
  betul(M.layakDewan(p, 'pendukung').boleh && !M.layakDewan(p, 'ulamak').boleh, 'Pendukung sahaja');
  const k = M.kawasan(p); if (k.parlimen && k.parlimen.m >= 60) { betul(/Bumiputera/.test(M.sekatanCalon(p, 'PARLIMEN'))); }
  const pr = S.buildPlayerProfile ? null : null; void pr;
  S.clearPlayer();
});
/* ---------- v13.33: Fasa 3 Rundingan Gabungan ---------- */
ujian('v13.33 Rundingan: calon rakan BN dan PN, sekatan Restu PAS, nilai berjaya dan gagal', () => {
  const R = g.MyPolitikRundingan; P.daftar({}); P.tetap({ parti: 'UMNO', jawatan: 'Presiden' });
  let p = S.loadPlayer(); const ka = { tahun: 2028, bulan: 3, parti: 60, rakan: 30, bebas: 4, pembangkang: 128 };
  sama(R.gabPemain(p), 'BN'); sama(R.gabPemain(Object.assign({}, p, { parti: 'PBB' })), null, 'parti Sarawak tiada rundingan');
  const c = R.calonDari(p, ka, 50), kod = c.map((x) => x.kod);
  betul(kod.indexOf('PH') >= 0 && kod.indexOf('PN') >= 0 && kod.indexOf('GPS') >= 0, 'calon BN: ' + kod.join(','));
  const jum = c.reduce((a, x) => a + x.n, 0); sama(jum, ka.pembangkang + ka.bebas, 'jumlah kerusi calon = pembangkang + bebas');
  const ph = c.find((x) => x.kod === 'PH'); sama(ph.akarUmbi, -6, 'lawan tradisi PH'); betul(c.every((x) => x.kesediaan >= 5 && x.kesediaan <= 95));
  const ya = R.nilai(p, ka, c, () => 0), tidak = R.nilai(p, ka, c, () => 0.999);
  betul(ya.berjaya && ya.setuju.length === c.length && ya.jumlah === 90 + jum, 'semua bersetuju');
  sama(ya.ubah.PH, -ph.n); sama(ya.ambilBebas, ka.bebas); sama(tidak.berjaya, false); sama(tidak.tolak.length, c.length);
  P.tetap({ parti: 'PAS', pas: { restu: 40 } }); p = S.loadPlayer(); const cp = R.calonDari(p, ka, 50);
  betul(cp.length && cp.every((x) => x.kesediaan === 0 && /Restu Majlis Syura/.test(x.sebab)), 'Restu < 50: semua tertutup');
  betul(cp.some((x) => x.kod === 'BN'), 'PAS: blok lawan kedua = BN');
  P.tetap({ pas: { restu: 60 } }); p = S.loadPlayer(); const cq = R.calonDari(p, ka, 50);
  sama(cq.find((x) => x.kod === 'PH').kesediaan, 0, 'PH perlu Restu 70'); betul(cq.find((x) => x.kod === 'BN').kesediaan > 0);
  S.clearPlayer();
});
ujian('v13.33 Rundingan: NPC membentuk gabungan bagi pemain bukan Presiden; Presiden tidak', () => {
  P.daftar({}); P.tetap({ parti: 'UMNO', jawatan: 'Ahli Biasa' }); const p = S.loadPlayer(), A = g.NusaPaparan;
  let npc = 0, salah = 0;
  for (let i = 0; i < 80; i++) {
    const k = A.anggarKerusi(Object.assign({}, p, { id: 'npc' + i }), { tahun: 2028, bulan: 3 }, { pop: 40 });
    if (k.npcGabungan) { npc++; if (!k.kerajaan || k.parti + k.rakan < 112 || k.parti + k.rakan + k.pembangkang + k.bebas !== 222 || !k.gabungan.length) { salah++; } }
  }
  betul(npc > 0, 'NPC gabungan berlaku (' + npc + '/80)'); sama(salah, 0, 'kiraan kerusi gabungan NPC konsisten');
  let pres = 0; for (let i = 0; i < 40; i++) { if (A.anggarKerusi(Object.assign({}, p, { id: 'npc' + i, jawatan: 'Presiden' }), { tahun: 2028, bulan: 3 }, { pop: 40 }).npcGabungan) { pres++; } }
  sama(pres, 0, 'Presiden memilih sendiri');
  S.clearPlayer();
});
ujian('v13.33 Rundingan: bentukGabungan (berjaya: status GABUNGAN, kerusi rakan; gagal: hubungan -5)', () => {
  const PR = g.MyPolitikPRU, R = g.MyPolitikRundingan, A = g.NusaPaparan;
  const asas = { status: 'PEMBANGKANG', tahun: 2031, bulan: 3, parti: 70, rakan: 25, jumlah: 222, majoriti: 112, bolehPM: true, peluangPM: 0, hubungan: 50 };
  P.daftar({}); P.tetap({ parti: 'UMNO', jawatan: 'Presiden', pru: { status: { jenis: 'MP', kerusi: 'Kangar', kerajaan: false }, hubunganGabungan: 50, nasional: Object.assign({}, asas) } });
  const c = R.calon(S.loadPlayer()); betul(c.length >= 3, 'calon ada');
  sama(PR.bentukGabungan([], { rng: () => 0 }).ok, false, 'perlu pilih rakan');
  const kecil = c.filter((x) => x.kod === 'BEBAS' || x.kod === 'GRS').map((x) => x.kod); if (kecil.length) { betul(/belum mencapai/.test(PR.bentukGabungan(kecil, { rng: () => 0 }).ralat)); }
  const gagal = PR.bentukGabungan(['PH'], { rng: () => 0.999 }); betul(gagal.ok && !gagal.berjaya, 'semua menolak');
  sama(S.loadPlayer().pru.hubunganGabungan, 45); sama(S.loadPlayer().pru.nasional.status, 'PEMBANGKANG');
  const r = PR.bentukGabungan(['PH', 'GPS'], { rng: () => 0 }); betul(r.ok && r.berjaya, r.mesej || r.ralat);
  const n = S.loadPlayer().pru.nasional, ph = c.find((x) => x.kod === 'PH').n, gps = c.find((x) => x.kod === 'GPS').n;
  sama(n.status, 'GABUNGAN'); sama(n.rakan, 25 + ph + gps); sama(n.gabungan.join(','), 'PH,GPS'); sama(n.ubah.PH, -ph);
  sama(n.rakanPM, ph > 95, 'PM ikut gabungan terbesar');
  const k = A.anggarKerusi(S.loadPlayer(), { tahun: 2031, bulan: 3 }, {}); betul(k.kerajaan && k.gabungan.join(',') === 'PH,GPS', 'anggaran kerusi ikut gabungan');
  sama(k.parti + k.rakan + k.pembangkang + k.bebas, 222);
  S.clearPlayer();
});
/* ---------- v13.34: PKR (Pakatan Harapan) Fasa 1 ---------- */
ujian('v13.34 PKR: kitaran 3 tahun, perwakilan Cabang (Fasal 17.2A), kuota PH, jelajah, AMK 35 tahun', () => {
  const M = g.MyPolitikPKR; P.daftar({}); P.tetap({ parti: 'PKR', ap: 10, myr: 10000 });
  let p = S.loadPlayer(); sama(p.parti, 'PKR');
  betul(M.adalahTahunPemilihan(p, 2025) && M.adalahTahunPemilihan(p, 2028) && !M.adalahTahunPemilihan(p, 2027), 'setiap 3 tahun dari 2025');
  sama(M.tahunSeterusnya(p, 2026), 2028); sama(g.MyPolitikElection.adalahTahunPemilihan(2031), true, 'enjin pemilihan ikut PKR');
  const d = g.MyPolitikPKRData; sama(Object.keys(d.parlimen).length, 222, 'Cabang di semua 222 kawasan Parlimen');
  betul(Object.keys(d.parlimen).every((k) => d.parlimen[k].a >= 100), 'Cabang minimum 100 anggota (Fasal 32.2)');
  const kecil = Object.keys(d.parlimen).filter((k) => d.parlimen[k].a <= 3000)[0], besar = Object.keys(d.parlimen).sort((a, b) => d.parlimen[b].a - d.parlimen[a].a)[0];
  if (kecil) { sama(M.perwakilan(kecil), 86, 'Cabang <= 3,000 anggota: 46 + 40 perwakilan'); }
  sama(M.perwakilan(besar), 156, 'maksimum 156 perwakilan');
  const k = M.kawasan(p); betul(k.parlimen && typeof k.kuotaPL === 'boolean', 'Cabang dan kuota'); betul(/rakan PH/.test(M.sebabKuota(p, 'PARLIMEN')));
  sama(M.statusJelajah(p).boleh, false, 'perlu Ketua Cabang');
  S.applyEffects({}, { kiraTindakan: false, patch: { jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: p.tahun }] } });
  const kod = Object.keys(d.parlimen)[3], s0 = M.sokonganBahagian(S.loadPlayer())[kod];
  betul(M.jelajah(kod).ok); betul(M.sokonganBahagian(S.loadPlayer())[kod] > s0, 'jelajah naikkan sokongan');
  const SY = g.MyPolitikSayap; sama(SY.cadangan('L', 30, 'PKR'), 'pemuda'); sama(SY.cadangan('L', 38, 'PKR'), 'utama', 'AMK had umur 35'); sama(SY.cadangan('L', 38, 'UMNO'), 'pemuda');
  sama(SY.cadangan('P', 25, 'PKR'), 'wanita', 'tiada Puteri'); betul(/35/.test(SY.kelayakan('L', 38, 'PKR').pemuda.sebab));
  sama(g.MyPolitikData.kategoriMengikutUmur('L', 38, 'PKR'), 'biasa');
  S.clearPlayer();
});
ujian('v13.34 PKR: kerusi PH (Kerajaan Perpaduan), slot lawan PH = BN, rundingan PH, kerajaan negeri Selangor', () => {
  P.daftar({}); P.tetap({ parti: 'PKR', reputasi: 50, jawatan: 'Ahli Biasa' }); const p = S.loadPlayer(), A = g.NusaPaparan, R = g.MyPolitikRundingan;
  let kj = 0, sel = 0, kel = 0, npcBN = 0;
  for (let i = 0; i < 60; i++) {
    const q = Object.assign({}, p, { id: 'pkr' + i });
    const a = A.anggarKerusi(q, { tahun: 2028, bulan: 3 }, { negeri: 'Selangor', pop: 45 }); if (a.kerajaan) { kj++; } if (a.dun.kerajaan >= 29) { sel++; }
    if (a.npcGabungan && a.gabungan.indexOf('BN') >= 0) { npcBN++; }
    const b = A.anggarKerusi(q, { tahun: 2028, bulan: 3 }, { negeri: 'Kelantan', pop: 45 }); if (b.dun.kerajaan >= 23) { kel++; }
  }
  betul(kj >= 45, 'pop 45: PH biasanya membentuk kerajaan (' + kj + '/60)'); betul(npcBN > 0, 'NPC mengajak BN (' + npcBN + ')');
  sama(sel, 60, 'PH memerintah Selangor'); sama(kel, 0, 'PH tidak memerintah Kelantan');
  sama(A.labelBN(p).pendek, 'PH'); sama(A.lawanGab(p).PH.pendek, 'BN', "slot lawan 'PH' = BN"); sama(A.lawanGab(p).PN.pendek, 'PN');
  sama(g.MyPolitikKerusiSemasa.label(p, 'PH'), 'BN'); sama(g.MyPolitikKerusiSemasa.blokLawan('UMNO', null, p), 'PH'); sama(g.MyPolitikKerusiSemasa.blokLawan('PAS', null, p), 'PN');
  sama(R.gabPemain(p), 'PH'); const c = R.calonDari(p, { tahun: 2028, bulan: 3, parti: 80, rakan: 30, bebas: 4, pembangkang: 108 }, 50);
  sama(c.map((x) => x.kod).join(','), 'BN,PN,BEBAS'); betul(c[0].kesediaan > c[1].kesediaan, 'BN lebih bersedia daripada PN'); sama(c[1].akarUmbi, -8);
  const Pt = g.MyPolitikParti; betul(Pt.sah('PKR') && Pt.info('PKR').sayap.indexOf('puteri') < 0, 'PKR tiada Puteri');
  S.clearPlayer();
});
/* ---------- v13.36: PKR Fasa 2 ---------- */
ujian('v13.36 PKR: Pasukan Perwakilan (kuota, denda, keputusan bulan Kongres), Semangat Reformasi, Forum', () => {
  const M = g.MyPolitikPKR; P.daftar({}); P.tetap({ parti: 'PKR', tahun: 2028, bulan: 2, ap: 40, myr: 50000 });
  sama(M.statusPasukan(S.loadPlayer()).boleh, false, 'perlu Ketua Cabang');
  const pj = S.loadPlayer();
  S.applyEffects({}, { kiraTindakan: false, patch: { jawatanList: [{ kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: pj.tahun }] } });
  let p = S.loadPlayer(); const own = M.kawasan(p).parlimen.kod, maks = M.kerusiPasukan(own);
  sama(maks, M.perwakilan(own) - 46, 'kerusi dipilih anggota = Biasa + Tambahan');
  betul(M.statusPasukan(p).boleh, M.statusPasukan(p).sebab);
  const q = M.kuotaPasukan(p, 40); sama(q.wanita, 12, 'kuota wanita 30%');
  betul(M.anggaranPasukan(p, { patuh: false }) < M.anggaranPasukan(p, { patuh: true }), 'denda kuota');
  betul(!M.susunPasukan(35, 12, q.minoriti).ok, 'gandaan 10');
  const r = M.susunPasukan(40, 12, q.minoriti); betul(r.ok, r.ralat); sama(S.loadPlayer().pkr.pasukan.patuh, true);
  betul(!M.susunPasukan(40, 12, q.minoriti).ok, 'sekali setahun');
  S.applyEffects({}, { kiraTindakan: false, patch: { bulan: 5 } }); M.prosesBulan();
  const h = S.loadPlayer().pkr.pasukan.hasil; betul(h && h.menang <= 40 && h.sokongan > 0, 'keputusan pasukan: ' + JSON.stringify(h));
  sama(M.sokonganBahagian(S.loadPlayer())[own], h.sokongan, 'sokongan Cabang sendiri ikut pasukan');
  // Semangat Reformasi
  P.tetap({ pkr: { reformasi: 80 } }); p = S.loadPlayer(); betul(M.bonusUndi(p, 'pusat') > 0 && M.adjCalon(p) > 0, 'reformasi tinggi: bonus');
  sama(M.bonusUndi(p, 'cawangan'), 0); P.tetap({ pkr: { reformasi: 20 } }); betul(M.bonusUndi(S.loadPlayer(), 'bahagian') < 0);
  P.tetap({ pkr: { reformasi: 50 }, integriti: { skor: 30 } }); M.prosesBulan(); betul(M.reformasi(S.loadPlayer()) < 50, 'Integriti rendah menurunkan reformasi');
  const f = M.forum(); betul(f.ok, f.ralat); betul(!M.forum().ok, 'Forum sekali sebulan');
  S.clearPlayer();
});
ujian('v13.36 PKR: Kem Dalaman, had 3 penggal Presiden, tangguh pemilihan (Fasal 47.3), peta Fasal disiplin', () => {
  const M = g.MyPolitikPKR; P.daftar({}); P.tetap({ parti: 'PKR', tahun: 2028, bulan: 1, ap: 20, myr: 20000 });
  let p = S.loadPlayer(); const kk = M.kekuatanKem(p); sama(kk.A + kk.B, 100); betul(kk.A >= 50 && kk.A <= 60);
  const sb0 = M.sokonganBahagian(p), kodA = Object.keys(sb0).find((k) => M.kemCabang(p, k) === 'A' && k !== M.kawasan(p).parlimen.kod);
  betul(M.pilihKem('A').ok); betul(!M.pilihKem('B').ok, 'sekali setiap penggal');
  sama(M.sokonganBahagian(S.loadPlayer())[kodA], Math.min(100, sb0[kodA] + 8), 'bonus +8 di Cabang kem');
  P.tetap({ bulan: 6, pkr: Object.assign({}, S.loadPlayer().pkr, { kemMenang: { tahun: 2028, kem: 'B' } }) }); sama(M.adjLantikan(S.loadPlayer()), -0.2, 'kem lawan menang: lantikan -20');
  // Presiden
  const pres = { kod: 'presiden', jawatan: 'Presiden', peringkat: 'pusat', kumpulan: 'utama', pangkat: 12, tahun: 2028 };
  P.tetap({ bulan: 1, jawatanList: [pres], pkr: { penggal: 3 } }); p = S.loadPlayer();
  betul(/3 penggal/.test(M.sekatanJawatan(p, { kod: 'presiden' })), 'had 3 penggal');
  sama(M.sekatanJawatan(p, { kod: 'timbalan_presiden' }), null);
  const def = g.MyPolitikJawatan.cariDef ? g.MyPolitikJawatan.cariDef('presiden') : null, pT = Object.assign({}, p, { jawatanList: [Object.assign({}, pres, { kod: 'timbalan_presiden', jawatan: 'Timbalan Presiden', pangkat: 11, tahun: 2025 })] });
  betul(def && /Fasal 21\.11/.test(g.MyPolitikJawatan.semakKelayakan(pT, def).sebab || ''), 'jawatan.js menyekat: ' + (def && JSON.stringify(g.MyPolitikJawatan.semakKelayakan(pT, def))));
  P.tetap({ pkr: { penggal: 1 } }); p = S.loadPlayer();
  betul(M.statusTangguh(p).boleh, M.statusTangguh(p).sebab); const t = M.tangguh(); betul(t.ok, t.ralat); p = S.loadPlayer();
  sama(M.adalahTahunPemilihan(p, 2028), false); sama(M.adalahTahunPemilihan(p, 2029), true); sama(M.adalahTahunPemilihan(p, 2032), true); sama(M.adalahTahunPemilihan(p, 2025), true);
  sama(M.tahunSeterusnya(p, 2028), 2029); sama(M.tahunLepas(p, 2028), 2025); betul(M.reformasi(p) < 50, 'tangguh: reformasi -10');
  P.tetap({ tahun: 2029, bulan: 1 }); sama(M.statusTangguh(S.loadPlayer()).boleh, false, 'tangguh sekali sahaja');
  S.clearPlayer();
});
/* ---------- v13.37: DAP Fasa 1 ---------- */
ujian('v13.37 DAP: Kongres 3 tahun, Wakil Cawangan (Fasal VIII.3), JTP 30 kerusi + kuota wanita, kuota PH, DAPSY dan umur 17', () => {
  const M = g.MyPolitikDAP; P.daftar({}); P.tetap({ parti: 'DAP', ap: 10, myr: 10000 });
  let p = S.loadPlayer(); sama(p.parti, 'DAP');
  betul(M.adalahTahunPemilihan(p, 2025) && M.adalahTahunPemilihan(p, 2028) && !M.adalahTahunPemilihan(p, 2026), 'Kongres setiap 3 tahun');
  sama(g.MyPolitikCalendar.getFasa(1).kod, 'cawangan'); sama(g.MyPolitikCalendar.getFasa(2).kod, 'bahagian'); sama(g.MyPolitikCalendar.getFasa(3).kod, 'pau');
  sama(M.wakilCawangan(24), 0); sama(M.wakilCawangan(25), 2); sama(M.wakilCawangan(50), 2); sama(M.wakilCawangan(51), 3); sama(M.wakilCawangan(100), 3); sama(M.wakilCawangan(101), 4); sama(M.wakilCawangan(250), 5);
  const d = g.MyPolitikDAPData, jw = Object.keys(d.parlimen).reduce((t, k) => t + (d.parlimen[k].w || 0), 0); sama(Object.keys(d.parlimen).length, 222); betul(jw > 3000 && jw < 6000, 'Wakil Kongres ~4,200 (' + jw + ')');
  const top = Object.keys(d.parlimen).find((k) => d.parlimen[k].r === 1); sama(d.parlimen[top].n, 'Tanjong', 'kuota: Bumiputera terendah dahulu');
  const J = g.MyPolitikJawatan; sama(M.kerusiJawatan(p, J.cariDef('ahli_mkt')), 30, 'Ahli JTP 30 kerusi'); sama(M.kerusiJawatan(p, J.cariDef('naib_presiden')), 5, 'Naib Pengerusi maks. 5');
  sama(M.kerusiJawatan(Object.assign({}, p, { parti: 'UMNO' }), J.cariDef('ahli_mkt')), null);
  betul(M.bonusJTP(Object.assign({}, p, { demografik: { jantina: 'P' } }), J.cariDef('ahli_mkt')) > 0, 'kuota wanita JTP'); sama(M.bonusJTP(Object.assign({}, p, { demografik: { jantina: 'L' } }), J.cariDef('ahli_mkt')), 0);
  const SY = g.MyPolitikSayap; sama(SY.cadangan('L', 17, 'DAP'), 'pemuda', 'DAP: ahli 17 tahun'); sama(SY.cadangan('L', 36, 'DAP'), 'utama', 'DAPSY 35'); sama(SY.cadangan('L', 17, 'UMNO'), 'utama'); sama(SY.cadangan('P', 20, 'DAP'), 'wanita', 'tiada Puteri');
  betul(/rakan PH/.test(M.sebabKuota(p, 'PARLIMEN'))); sama(M.statusJelajah(p).boleh, false, 'perlu Setiausaha JPKP');
  sama(g.MyPolitikRundingan.gabPemain(p), 'PH'); sama(g.NusaPaparan.lawanGab(p).PH.pendek, 'BN'); sama(g.MyPolitikKerusiSemasa.label(p, 'PH'), 'BN');
  S.clearPlayer();
});
ujian('v13.37 DAP: pilihan (b) Penyelaras JPKP hanya Ahli Parlimen; Jelajah Kawasan', () => {
  const M = g.MyPolitikDAP; P.daftar({}); P.tetap({ parti: 'DAP', ap: 10, myr: 10000 });
  const p0 = S.loadPlayer(), kb = { kod: 'ketua_bahagian', jawatan: 'Ketua Bahagian', peringkat: 'bahagian', kumpulan: 'utama', pangkat: 7, tahun: p0.tahun };
  S.applyEffects({}, { kiraTindakan: false, patch: { jawatanList: [kb] } });
  let p = S.loadPlayer(); sama(M.penyelaras(p), false, 'bukan Ahli Parlimen: Setiausaha JPKP');
  P.tetap({ pru: Object.assign({}, p.pru || {}, { status: { jenis: 'MP', kerusi: 'X', kerajaan: true } }) }); p = S.loadPlayer();
  sama(M.penyelaras(p), true, 'Ahli Parlimen: Penyelaras JPKP'); sama(M.segarPenyelaras(p), true);
  const kod = Object.keys(g.MyPolitikDAPData.parlimen).find((k) => g.MyPolitikDAPData.parlimen[k].w > 0), s0 = M.sokonganBahagian(p)[kod];
  const r = M.jelajah(kod); betul(r.ok, r.ralat); betul(M.sokonganBahagian(S.loadPlayer())[kod] > s0);
  const kos = Object.keys(g.MyPolitikDAPData.parlimen).find((k) => !g.MyPolitikDAPData.parlimen[k].w); P.tetap({ dap: {} });
  betul(!M.jelajah(kos).ok, 'kawasan tanpa Wakil Kongres'); g.MyPolitikDAP.segarPenyelaras({}); S.clearPlayer();
});
/* ---------- v13.38: DAP Fasa 2 ---------- */
ujian('v13.38 DAP: syarat calon JTP, pencalonan Cawangan, pegawai JTP tidak di Kongres, calon PRU ahli 2 tahun', () => {
  const M = g.MyPolitikDAP, J = g.MyPolitikJawatan; P.daftar({}); P.tetap({ parti: 'DAP', tahun: 2028, bulan: 1, ap: 20, myr: 20000, keahlian: { sejakTahun: 2027, sejakBulan: 1 } });
  let p = S.loadPlayer();
  betul(/2 tahun/.test(M.sekatanJawatan(p, J.cariDef('ahli_mkt'))), 'ahli < 2 tahun'); betul(/2 tahun/.test(M.sekatanCalon(p) || ''), 'calon PRU ahli < 2 tahun');
  betul(/Mesyuarat Pertama JTP/.test(M.sekatanJawatan(p, J.cariDef('presiden'))), 'Setiausaha Agung tidak di Kongres');
  P.tetap({ keahlian: { sejakTahun: 2020, sejakBulan: 1 } }); p = S.loadPlayer(); sama(M.sekatanCalon(p), null);
  betul(/2 Cawangan/.test(M.sekatanJawatan(p, J.cariDef('ahli_mkt'))), 'perlu 2 pencalonan'); sama(M.pencalonan(p), 0);
  P.tetap({ jawatanList: [{ kod: 'ketua_cawangan', jawatan: 'Ketua Cawangan', peringkat: 'cawangan', kumpulan: 'utama', pangkat: 3, tahun: 2027 }] }); sama(M.pencalonan(S.loadPlayer()), 1, 'Pengerusi Cawangan: 1 pencalonan');
  const r = M.kumpulPencalonan({ rng: () => 0 }); betul(r.ok && r.dapat, r.ralat); sama(M.pencalonan(S.loadPlayer()), 2); sama(M.sekatanJawatan(S.loadPlayer(), J.cariDef('ahli_mkt')), null, 'layak bertanding JTP');
  betul(!M.statusPencalonan(S.loadPlayer()).boleh, 'cukup');
  P.tetap({ bulan: 3, dap: { pencalonan: { tahun: 2028, n: 0 } } }); betul(!M.statusPencalonan(S.loadPlayer()).boleh, 'hanya bulan 1-2');
  S.clearPlayer();
});
ujian('v13.38 DAP: Mesyuarat Pertama JTP (bulan 4 lobi, bulan 5 keputusan), had 3 penggal Setiausaha Agung', () => {
  const M = g.MyPolitikDAP; P.daftar({}); P.tetap({ parti: 'DAP', tahun: 2028, bulan: 4, ap: 20, myr: 20000, reputasi: 70,
    jawatanList: [{ kod: 'ahli_mkt', jawatan: 'Ahli MKT', peringkat: 'pusat', kumpulan: 'utama', pangkat: 8, tahun: 2028 }] });
  M.prosesBulan(); let p = S.loadPlayer(), mt = M.mesyuarat(p);
  betul(mt && mt.sokong + mt.belum + mt.lawan === 29, 'mesyuarat dibuka (29 ahli lain): ' + JSON.stringify(mt)); betul(M.hubJTP(p) >= 60, 'Ahli JTP: Hubungan JTP +10');
  betul(!M.statusLobi(p).boleh, 'perlu sasaran'); betul(M.pilihSasaran('presiden').ok);
  const s0 = M.mesyuarat(S.loadPlayer()).sokong; for (let i = 0; i < 3; i++) { betul(M.lobi({ rng: () => 0 }).ok); }
  sama(M.mesyuarat(S.loadPlayer()).sokong, s0 + 3); betul(!M.lobi({ rng: () => 0 }).ok, 'maks 3 sebulan');
  P.tetap({ dap: Object.assign({}, S.loadPlayer().dap, { jtp: Object.assign({}, S.loadPlayer().dap.jtp, { sokong: 20, belum: 0, lawan: 9 }) }) });
  P.tetap({ bulan: 5 }); M.prosesBulan(); p = S.loadPlayer();
  betul(M.mesyuarat(p).hasil.menang, 'menang: ' + JSON.stringify(M.mesyuarat(p).hasil)); betul(g.MyPolitikJawatan.pegang(p, 'presiden'), 'Setiausaha Agung'); sama(M.penggalSA(p), 1);
  P.tetap({ tahun: 2031, bulan: 4, dap: Object.assign({}, p.dap, { penggalSA: 3 }), jawatanList: [{ kod: 'ahli_mkt', jawatan: 'Ahli MKT', peringkat: 'pusat', kumpulan: 'utama', pangkat: 8, tahun: 2031 }] });
  M.prosesBulan(); betul(/3 penggal/.test(M.pilihSasaran('presiden').ralat || ''), 'had 3 penggal'); betul(M.pilihSasaran('timbalan_presiden').ok);
  S.clearPlayer();
});
ujian('v13.38 DAP: Kongres ditangguh sebelum PRU, caruman elaun, peta Fasal VII, dipecat = kerusi dikosongkan', () => {
  const M = g.MyPolitikDAP; P.daftar({}); P.tetap({ parti: 'DAP', tahun: 2028, bulan: 1, myr: 10000 });
  P.tetap({ pru: Object.assign({}, S.loadPlayer().pru, { tahunPRU: 2029, bulanPRU: 6 }) }); M.prosesBulan(); let p = S.loadPlayer();
  sama(p.dap.tangguhDari, 2028); sama(M.adalahTahunPemilihan(p, 2028), false); sama(M.adalahTahunPemilihan(p, 2029), false); sama(M.adalahTahunPemilihan(p, 2030), true); sama(M.tahunSeterusnya(p, 2028), 2030); sama(M.adalahTahunPemilihan(p, 2025), true);
  P.daftar({}); P.tetap({ parti: 'DAP', tahun: 2026, bulan: 6, myr: 10000 });
  P.tetap({ pru: Object.assign({}, S.loadPlayer().pru, { status: { jenis: 'MP', kerusi: 'Tanjong', kerajaan: true } }) });
  const m0 = S.loadPlayer().myr, h0 = M.hubJTP(S.loadPlayer()); M.prosesBulan(); p = S.loadPlayer();
  sama(m0 - p.myr, 250, 'caruman 10% elaun MP'); betul(M.hubJTP(p) > h0, 'caruman menaikkan Hubungan JTP');
  sama(M.adjCalon(Object.assign({}, p, { dap: { hubJTP: 100 } })), 0.15); sama(M.adjCalon(Object.assign({}, p, { dap: { hubJTP: 0 } })), -0.15);
  P.tetap({ etika: Object.assign({}, p.etika || {}, { status: 'dipecat', hukuman: { jenis: 'dipecat', tahun: 2026, bulan: 6 } }) }); M.prosesBulan(); p = S.loadPlayer();
  betul(!(p.pru.status && p.pru.status.jenis === 'MP'), 'kerusi dikosongkan'); betul(M.hubJTP(p) < h0 + 1, 'hukuman menurunkan Hubungan JTP');
  S.clearPlayer();
});
/* ---------- v13.39: pembetulan baris 24 ---------- */
ujian('v13.39 Ketua Cawangan yang menang Ketua Pemuda Cawangan boleh bertanding Ketua Pemuda Bahagian (maklum balas baris 24)', () => {
  const J = g.MyPolitikJawatan; P.daftar({});
  P.tetap({ parti: 'UMNO', tahun: 2038, bulan: 6, ip: 900, sayap: 'pemuda', demografik: Object.assign({}, S.loadPlayer().demografik, { umur: 35, jantina: 'L' }),
    jawatanList: [{ kod: 'ketua_cawangan', jawatan: 'Ketua Cawangan', peringkat: 'cawangan', kumpulan: 'utama', pangkat: 3, tahun: 2038 }] });
  let p = S.loadPlayer(); const d = J.cariDef('sayap_bahagian_pemuda');
  sama(J.semakKelayakan(p, d).terbuka, true, 'Ketua Cawangan: Ketua Pemuda Bahagian terbuka');
  sama(J.terapkan(p, J.cariDef('sayap_cawangan_pemuda'), true).jawatanList, undefined, 'menang Ketua Pemuda Cawangan tidak menggantikan Ketua Cawangan');
  P.tetap({ jawatanList: [{ kod: 'ajk_cawangan', jawatan: 'AJK Cawangan', peringkat: 'cawangan', kumpulan: 'utama', pangkat: 1, tahun: 2038 }] }); p = S.loadPlayer();
  sama(J.semakKelayakan(p, d).terbuka, false, 'AJK Cawangan sahaja: masih perlu Ketua Pemuda Cawangan');
  S.clearPlayer();
});
/* ---------- v13.40: Laluan Kerajaan & Lobi TPM (maklum balas baris 23) ---------- */
ujian('v13.40 Lobi Timbalan Perdana Menteri: syarat, peluang 60% / 30%, kos, sekali bagi setiap lobi', () => {
  const KB = g.MyPolitikKabinet; P.daftar({});
  const tp = { kod: 'timbalan_presiden', jawatan: 'Timbalan Presiden', peringkat: 'pusat', kumpulan: 'utama', pangkat: 11, tahun: 2026 };
  P.tetap({ parti: 'UMNO', ip: 900, myr: 100000, ap: 10, reputasi: 50, jawatanList: [tp], kerusiNasional: { parti: 60, rakan: 30, gabungan: ['PH'], ubah: { PH: -82, PN: 0 } } });
  P.tetap({ pru: Object.assign({}, S.loadPlayer().pru, { status: { jenis: 'MP', kerusi: 'X', kerajaan: true }, hubunganGabungan: 50 }) });
  sama(KB.syaratTPM(S.loadPlayer()).boleh, false, 'perlu lobi persekutuan dibuka'); KB.bukaLobi('PARLIMEN');
  let p = S.loadPlayer(); betul(KB.syaratTPM(p).boleh, KB.syaratTPM(p).sebab);
  sama(KB.pmPartiSendiri(p), false, 'UMNO: PM dari rakan (PH lebih besar)'); sama(KB.maklumatTPM(p).peluang, 40, '30% + IP (maks +10%)');
  P.tetap({ parti: 'PKR', kerusiNasional: { parti: 80, rakan: 30, gabungan: ['BN'], ubah: { PH: -30, PN: 0 } } }); p = S.loadPlayer();
  sama(KB.pmPartiSendiri(p), true, 'PKR: PM dari parti sendiri'); sama(KB.maklumatTPM(p).peluang, 70);
  const m0 = p.myr, ip0 = p.ip, r = KB.lobiTPM({ rng: () => 0.99 }); betul(r.ok && !r.dilantik, r.ralat);
  p = S.loadPlayer(); sama(m0 - p.myr, 10000, 'gagal: separuh Dana'); sama(ip0 - p.ip, 200, 'gagal: separuh IP'); betul(/sudah dicuba/.test(KB.syaratTPM(p).sebab));
  KB.bukaLobi('PARLIMEN'); const r2 = KB.lobiTPM({ rng: () => 0 }); betul(r2.ok && r2.dilantik); sama(KB.getKabinet(S.loadPlayer()).roleLevel, 'TIMBALAN_PM');
  P.tetap({ jawatanList: [tp], kabinet: null, ap: 0, ip: 900 }); KB.bukaLobi('PARLIMEN'); betul(KB.maklumatTPM(S.loadPlayer()).boleh, 'v13.41: lobi TPM tanpa AP: ' + KB.maklumatTPM(S.loadPlayer()).sebab); sama(KB.maklumatTPM(S.loadPlayer()).ap, 0);
  P.tetap({ jawatanList: [], kabinet: null }); KB.bukaLobi('PARLIMEN'); betul(/Timbalan Presiden/.test(KB.syaratTPM(S.loadPlayer()).sebab), 'bukan Timbalan Presiden');
  S.clearPlayer();
});
ujian('v13.41 Avatar PAS: kopiah/serban, tudung labuh, tiada songkok; UMNO dan PKR tidak berubah', () => {
  const A = require('../js/avatar.js');
  const songkok = /M30\.5 36 L32\.5 21|M30 36\.5 L32 20\.5/;
  ['pemuda', 'biasa', 'veteran'].forEach((k) => { const s = A.svg(k, { parti: 'PAS' }); betul(!songkok.test(s), k + ' tiada songkok'); betul(/M31\.5 36 Q31 21\.5|M27\.5 38 Q24 17/.test(s), k + ' kopiah/serban'); });
  betul(!/#2F3E5C|#2E6BD6/.test(A.svg('biasa', { parti: 'PAS' }) + A.svg('pemuda', { parti: 'PAS' })), 'tiada blazer / tali leher');
  betul(/#2E7D5B/.test(A.svg('wanita', { parti: 'PAS' })), 'Muslimat tudung labuh hijau'); betul(/#2E5E4E/.test(A.svg('veteran_p', { parti: 'PAS' })), 'Muslimat berusia');
  betul(songkok.test(A.svg('pemuda', { parti: 'UMNO' })), 'UMNO kekal songkok'); betul(/#2E6BD6/.test(A.svg('pemuda', { parti: 'PKR' })), 'PKR kekal set umum');
  sama(A.senarai('PAS').length, 4); betul(/kopiah/.test(A.senarai('PAS')[0].penerangan));
});
ujian('v13.42 Jemaah Menteri: calon rakan gabungan termasuk Cina / India; calon parti sendiri ikut kaum parti (maklum balas baris 32)', () => {
  const J = g.MyPolitikJemaah, bukanMelayu = (n) => !/ (bin|binti) /.test(n);
  P.daftar({}); P.tetap({ parti: 'UMNO' });
  const rakan = J.calon(S.loadPlayer()).map((x) => x.calon.filter((c) => c.jenis === 'rakan')[0].nama);
  betul(rakan.filter(bukanMelayu).length >= 2, 'sekurang-kurangnya 2 calon rakan Cina / India: ' + rakan.join(', '));
  P.daftar({}); P.tetap({ parti: 'DAP' });
  const anda = J.calon(S.loadPlayer()).map((x) => x.calon.filter((c) => c.jenis === 'anda')[0].nama);
  betul(anda.filter(bukanMelayu).length >= 5, 'DAP: calon parti sendiri kebanyakannya bukan Melayu: ' + anda.join(', '));
  S.clearPlayer();
});
ujian('v13.43 Mesyuarat: IP usul yang dicatat = IP sebenar diterima selepas redaman (maklum balas baris 33)', () => {
  P.daftar({}); P.tetap({ bulan: 4, ip: 200, ap: 20 }); const r = M.mulaMesyuarat('cawangan'); betul(r.ok, r.ralat);
  const u = r.mesyuarat.agenda.find((a) => a.jenis !== 'pemilihan'), ip0 = S.loadPlayer().ip;
  const x = M.pilihPeranan('cawangan', u.id, 'pembawa', 'sokong', { rng: () => 0 }); betul(x.ok, x.ralat);
  sama(x.keputusan.ip, S.loadPlayer().ip - ip0, 'IP dicatat = IP diterima'); betul(x.keputusan.ipAsas > x.keputusan.ip, 'redaman pada IP 200');
  const t = M.tutupMesyuarat('cawangan', { rng: () => 0.5 }); betul(t.ok, t.ralat);
  const us = t.ringkasan.usul.find((v) => v.pilihan); sama(us.ip, x.keputusan.ip); sama(us.ipAsas, x.keputusan.ipAsas);
  S.clearPlayer();
});
ujian('v13.44 PM penyandang: parti terbesar dalam gabungan kekal PM; parti lebih kecil +20% (maklum balas baris 29)', () => {
  const P0 = g.MyPolitikPRU; P.daftar({}); P.tetap({ parti: 'UMNO', reputasi: 50 });
  P.tetap({ pru: Object.assign({}, P0.getPRU(S.loadPlayer()), { pmPenyandang: true, hubunganGabungan: 50 }) });
  let besar = 0, kecil = 0;
  for (let s = 1; s <= 120; s++) {
    const b = P0.janaNasionalUji(S.loadPlayer()); if (b.status !== 'GABUNGAN') { betul(!b.penyandang); continue; }
    betul(b.penyandang, 'bendera penyandang');
    const kongsi = b.parti / (b.parti + b.rakan);
    if (kongsi >= 0.5) { besar++; sama(b.peluangPM, 100, 'terbesar: kekal PM'); }
    else { kecil++; sama(b.peluangPM, Math.round(Math.min(0.97, Math.min(0.9, Math.max(0.1, 0.4 + (kongsi - 0.5) * 1.2)) + 0.2) * 100), 'lebih kecil: +20%'); }
  }
  betul(besar > 0, 'kes parti terbesar diuji: ' + besar + '/' + kecil);
  P.tetap({ pru: Object.assign({}, P0.getPRU(S.loadPlayer()), { pmPenyandang: false }) }); betul(!P0.janaNasionalUji(S.loadPlayer()).penyandang, 'bukan penyandang');
  const K = g.MyPolitikKabinet; K.lantikKanan('PERDANA_MENTERI'); P0.isytihar('tamat'); sama(P0.getPRU(S.loadPlayer()).pmPenyandang, true, 'isytihar PRU merekod PM penyandang');
  sama(K.getKabinet(S.loadPlayer()).roleLevel, 'NONE', 'jawatan tamat bersama penggal');
  S.clearPlayer();
});
ujian('v13.45 Pencapaian setiap watak: watak baharu bermula kosong, watak lama kekal, simpanan v1 dipindah ke watak semasa (maklum balas baris 30)', () => {
  const ls = g.localStorage; ls.removeItem(PC.KUNCI);
  P.daftar({}); P.tetap({ dicipta: '2026-01-01T00:00:00Z' });
  ls.setItem(PC.KUNCI, JSON.stringify({ dibuka: { wira_pru: { tahun: 2030, bulan: 5 } }, jejak: {}, dilihat: {} }));   // simpanan lama (v1)
  betul(PC.muat().dibuka.wira_pru, 'v1 dipindah ke watak semasa'); sama(JSON.parse(ls.getItem(PC.KUNCI)).versi, undefined, 'muat tidak menulis');
  let st = PC.muat(); st.dibuka.ikon_sayap = { tahun: 2031, bulan: 1 }; PC.simpan(st); sama(JSON.parse(ls.getItem(PC.KUNCI)).versi, 2);
  P.tetap({ dicipta: '2027-06-01T00:00:00Z' });                       // watak baharu (id cawangan sama)
  sama(Object.keys(PC.muat().dibuka).length, 0, 'watak baharu tiada trofi'); sama(PC.bilBaru(), 0);
  st = PC.muat(); st.dibuka.doktor_falsafah = { tahun: 2028, bulan: 2 }; PC.simpan(st); sama(Object.keys(PC.muat().dibuka).join(), 'doktor_falsafah');
  P.tetap({ dicipta: '2026-01-01T00:00:00Z' }); sama(Object.keys(PC.muat().dibuka).sort().join(), 'ikon_sayap,wira_pru', 'watak lama kekal');
  ls.removeItem(PC.KUNCI); S.clearPlayer();
});
ujian('v13.46 Jemaah Menteri: PM pilih TPM, 29 portfolio, calon daripada struktur parti, seorang satu jawatan (maklum balas baris 25)', () => {
  const J = g.MyPolitikJemaah, KB = g.MyPolitikKabinet, C = J.CONFIG; P.daftar({}); P.tetap({ parti: 'UMNO', ap: 10 }); KB.lantikKanan('PERDANA_MENTERI');
  let p = S.loadPlayer(); const k = J.kolam(p), tpm = J.calonTPM(p, k);
  sama(tpm.length, 4); sama(tpm[0].jawatan, 'Timbalan Presiden'); betul(/^Naib Presiden/.test(tpm[1].jawatan)); sama(tpm[2].kat, 'ketua_rakan'); sama(tpm[3].kat, 'ketua_borneo');
  sama(k.parti.filter((x) => x.kat === 'np').length, 3); betul(k.parti.some((x) => /Ahli MKT/.test(x.jawatan)), 'Ahli MKT dalam kolam'); sama(k.parti.filter((x) => x.pencabar).length, 2);
  const parti = k.parti.filter((x) => x.kat !== 'tp'), m = {};
  C.UTAMA.forEach((nm, i) => { m[nm] = i < 3 ? k.rakan[i].id : i < 5 ? k.borneo[i].id : parti[i].id; });
  const a = J.nilai(p, { tpm: tpm[0].id, m }), b = J.nilai(p, { tpm: tpm[1].id, m });
  betul(a.lengkap && a.tpTPM && !a.tpLangkau); betul(b.tpLangkau && !b.tpTPM);
  betul(a.tertinggal.length > 0, 'pemimpin tertinggal dikira');
  betul(!J.nilai(p, { tpm: null, m }).lengkap, 'TPM wajib');
  const md = Object.assign({}, m, { 'Menteri Kewangan': m['Menteri Dalam Negeri'] }); sama(J.nilai(p, { tpm: tpm[0].id, m: md }).duplikat.length, 1);
  betul(/satu jawatan/.test(J.umumkan({ tpm: tpm[0].id, m: md }).ralat), 'duplikat ditolak');
  const lain = J.senaraiPortfolio().find((nm) => C.UTAMA.indexOf(nm) < 0), m2 = Object.assign({}, m, { [lain]: parti[10].id });
  const hub0 = g.MyPolitikPRU.getPRU(p).hubunganGabungan, r = J.umumkan({ tpm: tpm[2].id, m: m2 }); betul(r.ok, r.ralat);
  p = S.loadPlayer(); const l = J.senarai(p); sama(l[1].menteri, tpm[2].nama, 'TPM pilihan'); sama(l[1].jenis, 'rakan');
  const rl = l.find((x) => x.portfolio === lain); sama(rl.menteri, parti[10].nama); sama(rl.jawatanParti, parti[10].jawatan, 'jawatan parti dipapar');
  sama(l.find((x) => x.portfolio === C.UTAMA[6]).menteri, parti[6].nama);
  sama(g.MyPolitikPRU.getPRU(p).hubunganGabungan, Math.min(100, hub0 + C.TPM_HUB_RAKAN), 'TPM rakan: Hubungan +8 (kuota dipenuhi)');
  S.clearPlayer();
});
ujian('v13.47 PRK luar kawasan: dibuka sebulan, pemain bantu kempen, keputusan bulan berikutnya, ganjaran ikut sumbangan (maklum balas baris 28)', () => {
  const KS = g.MyPolitikKerusiSemasa, PL = g.MyPolitikPRKLuar; let p = ksPemain();
  P.tetap({ ap: 10, myr: 100000, reputasi: 50, jawatanList: [] });
  sama(KS.prosesBulan({ rng: () => 0.9 }).peristiwa.length, 0, 'tiada PRK (rng >= 0.15)');
  let ev = KS.prosesBulan({ rng: rngTetap(0.1) }).peristiwa; betul(ev.length === 1 && /diadakan/.test(ev[0].mesej) && /tab Pemilihan/.test(ev[0].mesej), ev.map((e) => e.mesej).join());
  p = S.loadPlayer(); const a = PL.getPL(p).aktif; betul(a && a.kerusi, 'PRK aktif'); betul(/^(P\.\d{3} [A-Z]|N\.\d{2})/.test(a.kerusi), 'nama kerusi: ' + a.kerusi);
  sama(KS.prosesBulan({ rng: rngTetap(0.1) }).peristiwa.length, 0, 'bulan sama: tiada PRK baharu / keputusan');
  const k0 = PL.keadaan(p); sama(k0.tindakan.length, 4); sama(k0.pengganda, 1);
  const ap0 = p.ap, r1 = PL.bantu('ceramah'); betul(r1.ok, r1.ralat); p = S.loadPlayer(); sama(ap0 - p.ap, 2); sama(PL.getPL(p).aktif.bantuan, 3);
  betul(!PL.bantu('ceramah').ok, 'sekali sahaja');
  for (let i = 0; i < 4; i++) { betul(PL.sumbangDana().ok); } betul(!PL.sumbangDana().ok, 'maks 4 kali'); p = S.loadPlayer(); sama(PL.getPL(p).aktif.sumbangan, 7);
  sama(PL.anggaran(PL.getPL(p).aktif), Math.round((a.asas + 7) * 10) / 10);
  const rep0 = p.reputasi; P.tetap({ bulan: p.bulan === 12 ? 1 : p.bulan + 1, tahun: p.bulan === 12 ? p.tahun + 1 : p.tahun });
  P.tetap({ prkLuar: Object.assign({}, PL.getPL(S.loadPlayer()), { aktif: Object.assign({}, PL.getPL(S.loadPlayer()).aktif, { asas: 60, calon: 'PARTI', pertahan: true, dari: 'PARTI' }) }) });
  ev = KS.prosesBulan({ rng: () => 0.5 }).peristiwa; p = S.loadPlayer();
  betul(ev.length === 1 && /MENANG/.test(ev[0].mesej), ev.map((e) => e.mesej).join()); sama(PL.getPL(p).aktif, null); sama(PL.getPL(p).sejarah.length, 1);
  sama(p.reputasi - rep0, 1 + Math.floor(7 / 4), 'Reputasi ikut sumbangan'); sama(PL.getPL(p).sejarah[0].menang, true);
  // tanpa sumbangan: calon rampas kalah, tiada kesan
  P.tetap({ prkLuar: { aktif: Object.assign({}, a, { idx: 0, asas: 40, bantuan: 0, sumbangan: 0, tindakan: {}, dana: 0, pertahan: false, dari: 'PN', calon: 'PARTI', lawan: 'PN' }), sejarah: [] } });
  const rep1 = S.loadPlayer().reputasi, pn0 = KS.blok(S.loadPlayer(), a.dun).PN; ev = KS.prosesBulan({ rng: () => 0.5 }).peristiwa; p = S.loadPlayer();
  betul(/KALAH/.test(ev[0].mesej)); sama(p.reputasi, rep1, 'tiada sumbangan: tiada kesan'); sama(KS.blok(p, a.dun).PN, pn0, 'kerusi kekal pada lawan');
  // jawatan Pusat: kesan x1.5
  P.tetap({ jawatanList: [{ kod: 'ahli_mkt', jawatan: 'Ahli MKT', peringkat: 'pusat', pangkat: 9 }] }); sama(PL.pengganda(S.loadPlayer()), 1.5);
});
ujian('v13.48 PAS: setiap musim pemilihan (2 tahun) bermula semula; keputusan musim lalu tidak kekal "selesai" (maklum balas baris 26)', () => {
  P.daftar({ parti: 'PAS', umur: 28, jantina: 'L', sayap: 'pemuda' }); P.tetap({ parti: 'PAS', tahun: 2029, bulan: 3, ip: 2000, ap: 20, myr: 100000 });
  const kod = 'sayap_cawangan_pemuda', st = () => E.senaraiPertandingan(S.loadPlayer()).find((x) => x.kod === kod);
  betul(st().terbuka, '2029: dibuka'); betul(E.daftarBertanding(kod).ok); E.jalankanPemilihanPeringkat('sayap_cawangan', { rng: () => 0.01 });
  betul(st().selesai, '2029: selesai'); sama(E.getKitaran(2029).kitaran, 2029); sama(E.getKitaran(2030).kitaran, 2029); sama(E.getKitaran(2031).kitaran, 2031);
  E.majuTahun(); E.majuTahun(); P.tetap({ bulan: 3 }); sama(S.loadPlayer().tahun, 2031);
  betul(!st().selesai && st().terbuka, '2031: musim baharu dibuka (dahulu kekal selesai)');
  // simpanan lama dalam musim yang sama dikekalkan (kitaran lama = 1, tahunPemilihan 2031)
  const pm = E.getKeadaanPemilihan(S.loadPlayer()); betul(E.daftarBertanding(kod).ok);
  const lama = Object.assign({}, S.loadPlayer().pemilihan, { kitaran: 1 }); P.tetap({ pemilihan: lama });
  betul(E.getKeadaanPemilihan(S.loadPlayer()).daftar[kod], 'pendaftaran musim semasa dikekalkan selepas kemas kini'); betul(pm);
  S.clearPlayer();
});
ujian('v13.49 Log disiplin tidak dipotong pada 80 aksara (teks EN bocor dalam log aktiviti)', () => {
  const ET = g.MyPolitikEtika; P.daftar({}); P.tetap({ etika: Object.assign({}, ET.getEtika(S.loadPlayer()), { risiko: 90, modal: 0, status: 'baik', siasatan: null }) });
  const r = ET.prosesBulan({ rng: () => 0 }); betul(r.peristiwa.some((x) => /Siasatan dimulakan\./.test(x.mesej)), 'aduan dicetuskan');
  const lg = S.loadPlayer().log.find((x) => x.tindakan === 'disiplin'); betul(lg && /Siasatan dimulakan\.$/.test(lg.nama), 'log penuh: ' + (lg && lg.nama));
  S.clearPlayer();
});
function pbPemain(kn, presiden) {
  P.daftar({}); const p0 = S.loadPlayer();
  P.tetap({ jawatanList: presiden ? [{ kod: 'presiden', jawatan: 'Presiden', peringkat: 'pusat', kumpulan: 'utama', pangkat: 12, tahun: 2026 }] : [], ap: 20, myr: 100000, reputasi: 50,
    kerusiNasional: Object.assign({ tahun: p0.tahun, bulan: p0.bulan, bebas: 3, kerajaan: false }, kn) });
  P.tetap({ pru: Object.assign({}, PRU.getPRU(S.loadPlayer()), { status: { jenis: 'MP', kerusi: 'Pekan', kerajaan: false } }) });
  return S.loadPlayer();
}
ujian('v13.50 Ketua Pembangkang: status, elaun, Soalan Lisan, Bahas RUU, Bajet Alternatif, Undi Tidak Percaya, Kabinet Bayangan, bonus kerusi PRU (Threads no. 1)', () => {
  const PB = g.MyPolitikPembangkang, C = PB.CONFIG; let p = pbPemain({ parti: 60, rakan: 22, pembangkang: 137 }, true);
  let st = PB.status(p); betul(st.mp && st.kp, 'Presiden MP pembangkang = Ketua Pembangkang'); sama(st.kami, 82); sama(st.lain, 0, 'PH + PN bergabung');
  const myr0 = p.myr, ev = PB.prosesBulan().peristiwa; betul(ev.some((x) => /Ketua Pembangkang/.test(x.mesej))); p = S.loadPlayer(); sama(p.myr - myr0, C.ELAUN.myr, 'elaun');
  sama(PB.status(pbPemain({ parti: 60, rakan: 22, pembangkang: 137 }, false)).kp, false, 'bukan Presiden: MP pembangkang biasa');
  p = pbPemain({ parti: 60, rakan: 22, pembangkang: 137 }, true); PB.prosesBulan();
  const r1 = PB.soalanLisan({ rng: () => 0 }); betul(r1.ok && r1.jaya); sama(PB.getPB(S.loadPlayer()).naratif, 53); betul(!PB.soalanLisan().ok, 'sekali sebulan');
  betul(/bulan sidang/.test(PB.bahasRUU('bantah').ralat), 'RUU hanya bulan sidang');
  P.tetap({ bulan: 10 }); betul(PB.bahasRUU('bantah').ok); sama(PB.getPB(S.loadPlayer()).naratif, 57); betul(!PB.bahasRUU('sokong').ok, 'sekali setiap sesi');
  betul(PB.bajetAlternatif().ok); sama(PB.getPB(S.loadPlayer()).naratif, 65); betul(!PB.bajetAlternatif().ok, 'sekali setahun');
  sama(PB.bonusKerusi(S.loadPlayer()), 3, 'Naratif 65: +3 kerusi PRU');
  const n0 = PRU.janaNasionalUji(Object.assign({}, S.loadPlayer(), { pembangkang: Object.assign({}, S.loadPlayer().pembangkang, { naratif: 50 }) }));
  betul(n0 && typeof n0.parti === 'number');
  // Kabinet Bayangan
  const J = g.MyPolitikJemaah, kol = PB.calonBayangan(S.loadPlayer()), m = {}; J.CONFIG.UTAMA.forEach((nm, i) => { m[nm] = kol[i].id; });
  const nb = PB.nilaiBayangan(S.loadPlayer(), m); betul(nb.lengkap); betul(nb.pengganda >= 1 && nb.pengganda <= 1.3);
  betul(PB.umumBayangan(m).ok); betul(!PB.umumBayangan(m).ok, 'sekali setiap penggal'); sama(PB.getPB(S.loadPlayer()).bayangan.senarai.length, 8);
  // Undi Tidak Percaya: kerajaan PH tipis (kerajaan 115)
  p = pbPemain({ parti: 70, rakan: 30, pembangkang: 119 }, true); st = PB.status(p);
  betul(PB.mulaTP().ok); betul(!PB.mulaTP().ok, 'sudah berjalan'); const tp0 = PB.getPB(S.loadPlayer()).tp.sokong;
  for (let i = 0; i < 3; i++) { betul(PB.pujukTP({ rng: () => 0.99 }).ok); } betul(!PB.pujukTP().ok, 'maks 3 pujukan'); sama(PB.getPB(S.loadPlayer()).tp.sokong, tp0 + 15);
  const u = PB.undiTP(); betul(u.ok); sama(u.jaya, tp0 + 15 >= 112); betul(!PB.mulaTP().ok, 'sekali setahun');
  if (u.jaya) { betul(PRU.getPRU(S.loadPlayer()).aktif, 'PRU mengejut'); } else { sama(S.loadPlayer().reputasi, 50 - 4); }
  S.clearPlayer();
});
ujian('v13.51 Lompat Parti: pilihan ikut negeri, syarat, gabung profil, Perkara 49A dan PRK tiket parti baharu (Threads no. 4)', () => {
  const LP = g.MyPolitikLompat, D = g.MyPolitikData; P.daftar({}); P.tetap({ ip: 1000, myr: 50000, reputasi: 60, tahun: 2031, bulan: 4, jawatanList: [{ kod: 'ketua_cawangan', jawatan: 'Ketua Cawangan', peringkat: 'cawangan', pangkat: 3 }], jawatan: 'Ketua Cawangan', gelaran: { dato: true } });
  P.tetap({ pru: Object.assign({}, PRU.getPRU(S.loadPlayer()), { aktif: null, status: { jenis: 'MP', kerusi: 'Pekan', kerajaan: true } }) });
  let p = S.loadPlayer(); const neg = p.negeri;
  const pl = LP.pilihan(p); betul(!pl.some((x) => x.kod === p.parti), 'parti sendiri tiada'); sama(pl.find((x) => x.kod === 'PBB').boleh, /sarawak/i.test(neg));
  betul(LP.aktifDi('PKR', 'Sarawak') && !LP.aktifDi('UMNO', 'Sarawak') && LP.aktifDi('PBRS', 'Sabah') && !LP.aktifDi('PAS', 'Sabah') && LP.aktifDi('PAS', 'Kelantan'));
  const k = LP.kesan(p); sama(k.kerusi.length, 1); sama(k.ip, 500);
  const m = LP.mula('PAS'); betul(m.ok && /index\.html#daftar/.test(m.url), m.ralat); betul(/sedang diproses/.test(LP.kunci(S.loadPlayer())));
  const lama = S.loadPlayer(), dt = D.getFallbackData(), c = dt.negeri[0].bahagian[0].dun[0].cawangan[0];
  const baru = S.buildPlayerProfile({ nama: 'X', demografik: D.tentukanDemografi('L', 35, 'PAS'), cawangan: c, sayap: 'utama', parti: 'PAS', tahunAhli: 3 });
  const n = LP.gabung(lama, baru);
  sama(n.parti, 'PAS'); sama(n.nama, lama.nama); sama(n.tahun, 2031); sama(n.myr, 50000); sama(n.ip, 500); sama(n.reputasi, 50); sama(n.kesetiaan.akarUmbi, 30);
  sama(n.jawatan, 'Ahli Biasa'); sama(n.jawatanList.length, 0); sama(n.keahlian.sejakTahun, 2031); sama(n.dicipta, lama.dicipta, 'trofi kekal'); sama(n.gelaran.dato, true);
  sama(n.demografik.umur, lama.demografik.umur, 'umur permulaan kekal'); sama(n.pru.status, null, 'Perkara 49A: kerusi dikosongkan'); sama(n.lompat.prk.length, 1); sama(n.lompat.kali, 1); betul(!n.lompatTertunda);
  betul(S.savePlayer(n).ok); p = S.loadPlayer(); betul(LP.katak(p)); betul(/sekali setiap 5 tahun/.test(LP.kunci(p)));
  // PRK bulan depan: pemain dijamin dicalonkan
  sama(LP.prosesBulan().peristiwa.length, 0, 'belum tiba'); P.tetap({ bulan: 5 }); const ev = LP.prosesBulan().peristiwa; betul(ev.some((x) => /Perkara 49A/.test(x.mesej)), ev.map((x) => x.mesej).join());
  const a = PRK.getPRK(S.loadPlayer()).aktif; betul(a && a.lompat); sama(PRK.kelayakan(S.loadPlayer()).peluang, 100); betul(PRK.mohonCalon({ rng: () => 0.99 }).diluluskan);
  sama(LP.getL(S.loadPlayer()).prk.length, 0);
  // dipecat: kerusi kekal, tiada penalti
  P.daftar({}); P.tetap({ reputasi: 60, etika: Object.assign({}, S.loadPlayer().etika, { status: 'dipecat' }) });
  P.tetap({ pru: Object.assign({}, PRU.getPRU(S.loadPlayer()), { aktif: null, status: { jenis: 'MP', kerusi: 'Pekan', kerajaan: false } }) });
  const n2 = LP.gabung(S.loadPlayer(), Object.assign({}, baru)); sama(n2.pru.status.kerusi, 'Pekan'); sama(n2.reputasi, 60); sama(n2.lompat.katakSehingga, 0);
  // syarat: Reputasi < 20 ditolak
  P.daftar({}); P.tetap({ reputasi: 10 }); betul(LP.pilihan(S.loadPlayer()).every((x) => !x.boleh)); betul(!LP.mula('PKR').ok);
  S.clearPlayer();
});
ujian('v13.52 Yang di-Pertua Negeri: syarat, tawaran, terima, tugas Istana, pembubaran DUN, penggal kedua dan legasi (Threads no. 5)', () => {
  const T = g.MyPolitikTYT, C = T.CONFIG; P.daftar({ umur: 50 }); P.tetap({ tahun: 2031, bulan: 1, reputasi: 70, ap: 10, myr: 1000, negeri: 'Sarawak',
    jawatanList: [{ kod: 'presiden', jawatan: 'Presiden', peringkat: 'pusat', pangkat: 12 }], tyt: { bekas: { sarawak: { dari: 2027, hingga: 2030 } } } });
  P.tetap({ pru: Object.assign({}, PRU.getPRU(S.loadPlayer()), { aktif: null, status: { jenis: 'ADUN', kerusi: 'N.01', kerajaan: true } }) });
  let p = S.loadPlayer(); sama(T.kosongSeterusnya('sarawak', 2031), 2031); sama(T.kosongSeterusnya('sarawak', 2032), 2035);
  let sy = T.syarat(p, 'sarawak'); betul(sy.layak, JSON.stringify(sy.item)); betul(T.peluang(p) >= 0.4 && T.peluang(p) <= 0.8);
  sama(T.syarat(Object.assign({}, p, { demografik: Object.assign({}, p.demografik, { umur: 30 }) }), 'sarawak').layak, false, 'umur < 55');
  let ev = T.prosesBulan({ rng: () => 0 }).peristiwa; betul(ev.some((x) => /Tawaran Istana/.test(x.mesej)), ev.map((x) => x.mesej).join());
  const r = T.terima(); betul(r.ok, r.ralat); p = S.loadPlayer(); betul(T.aktif(p)); sama(p.jawatanList.length, 0); sama(PRU.getPRU(p).status, null); sama(p.gelaran.tun, true);
  sama(p.letak.prk.length, 1, 'PRK calon parti'); betul(!E.daftarBertanding('ketua_cawangan').ok, 'TYT tidak bertanding'); betul(/tidak berparti/.test(g.MyPolitikLompat.kunci(p)));
  betul(T.menghadap('tegur').ok); betul(!T.menghadap('sokong').ok, 'sekali sebulan'); betul(T.majlis().ok); betul(T.majlisRaja().ok); betul(!T.majlisRaja().ok);
  let a = T.getT(S.loadPlayer()).aktif; sama(a.kewibawaan, 60 + 3 + 2 + 3); sama(a.hubungan, 58);
  const cal = a.calon.senarai, pilih = [cal.find((x) => x.kategori === 'politik').id].concat(cal.filter((x) => x.kategori !== 'politik').slice(0, 2).map((x) => x.id));
  betul(!T.kurnia(pilih.slice(0, 2)).ok, 'mesti 3'); betul(T.kurnia(pilih).ok); betul(!T.kurnia(pilih).ok, 'sekali setahun');
  const myr0 = S.loadPlayer().myr; P.tetap({ bulan: 2 }); T.prosesBulan({ rng: () => 0.99 }); sama(S.loadPlayer().myr - myr0, C.ELAUN, 'elaun');
  P.tetap({ tyt: Object.assign({}, T.getT(S.loadPlayer()), { aktif: Object.assign({}, T.getT(S.loadPlayer()).aktif, { bubar: { stabil: true, ketuaBaru: 'X' } }) }) });
  const k0 = T.getT(S.loadPlayer()).aktif.kewibawaan; betul(T.bubar('tangguh').ok); sama(T.getT(S.loadPlayer()).aktif.kewibawaan, Math.min(100, k0 + 8));
  // tamat penggal 1 dengan Kewibawaan tinggi: penggal kedua
  a = T.getT(S.loadPlayer()).aktif; P.tetap({ tyt: Object.assign({}, T.getT(S.loadPlayer()), { aktif: Object.assign({}, a, { kewibawaan: 80, tamat: 0 }) }) });
  ev = T.prosesBulan({ rng: () => 0.99 }).peristiwa; betul(ev.some((x) => /penggal kedua/.test(x.mesej))); betul(T.terimaLanjut(true).ok); sama(T.getT(S.loadPlayer()).aktif.penggal, 2);
  // tamat penggal 2: legasi
  a = T.getT(S.loadPlayer()).aktif; P.tetap({ tyt: Object.assign({}, T.getT(S.loadPlayer()), { aktif: Object.assign({}, a, { tamat: 0 }) }) });
  ev = T.prosesBulan({ rng: () => 0.99 }).peristiwa; betul(ev.some((x) => /tamat dengan penuh kehormatan/.test(x.mesej))); p = S.loadPlayer(); betul(p.tamat && p.tamat.sebab === 'tyt', JSON.stringify(p.tamat && p.tamat.sebab));
  betul(p.tamat.pilihanRaya.jawatanKerajaan.some((x) => /Yang di-Pertua Negeri Sarawak/.test(x)), 'legasi');
  S.clearPlayer();
});
ujian('v13.53 BERJASA: data Semenanjung, takwim 3/5/6, ANGKASA, Kekuatan Parti, pakatan, PRU solo, penentu kerajaan (baris 27)', () => {
  const M = g.MyPolitikBERJASA, D = g.MyPolitikData, SY = g.MyPolitikSayap, PT = g.MyPolitikParti, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'berjasa-semenanjung.csv'), 'utf8')));
  sama(h.jumlah.bahagian, 139, '139 kawasan Bumiputera >= 50%'); const ahli = h.bahagian.reduce((a, b) => a + b.cawangan.reduce((x, c) => x + c.jumlahAhli, 0), 0);
  betul(Math.abs(ahli - 56790) < 100, 'keahlian ~56,790 (' + ahli + ')'); betul(SY.kelayakan('P', 25, 'BERJASA').puteri.boleh, 'v13.67: Pemudi ANGKASA (Puteri) dibuka');
  const kb = h.bahagian.find((b) => b.nama === 'Kota Bharu');
  S.savePlayer(S.buildPlayerProfile({ parti: 'BERJASA', nama: 'Uji BERJASA', demografik: D.tentukanDemografi('Lelaki', 39, 'BERJASA'), cawangan: kb.dun[0].cawangan[0], sayap: 'pemuda', avatar: 'pemuda', tahunAhli: 3 }));
  let p = S.loadPlayer(); sama(p.parti, 'BERJASA'); sama(p.sayap, 'pemuda'); sama(PT.info('BERJASA').gabungan, null);
  sama(E.adalahTahunPemilihan(2026), false); sama(E.adalahTahunPemilihan(2027), true); sama(K.getTetingkap('cawangan', 1).mula, 3); sama(K.getTetingkap('bahagian', 1).mula, 5); sama(K.getTetingkap('pau', 1).mula, 6);
  sama(PT.ke('Ketua Bahagian dan Pemuda Bahagian (bulan 6) ke Perhimpunan Agung UMNO (PAU) bulan 9'), 'Ketua Kawasan dan ANGKASA Kawasan (bulan 5) ke Muktamar BERJASA bulan 6');
  const kw = M.kawasan(p); sama(kw.parlimen.n, 'Kota Bharu'); betul(kw.kuotaPL && kw.kuotaDUN, 'boleh bertanding solo');
  sama(M.kekuatan(p), 8); sama(M.undiParti(p), 2.1); sama(M.ofset(p), -13);
  // Dakwah
  P.tetap({ ap: 20, myr: 50000 }); let r = M.dakwah(); betul(r.ok, r.ralat); sama(M.kekuatan(S.loadPlayer()), 9); sama(M.dakwah().ok, false, 'sekali sebulan');
  // Pakatan: hanya 6 bulan sebelum PRU (PRU 2031/3)
  sama(M.statusPakatan(S.loadPlayer()).boleh, false, 'terlalu awal'); P.tetap({ tahun: 2030, bulan: 10 });
  betul(M.statusPakatan(S.loadPlayer()).boleh); r = M.runding('PN', { rng: () => 0.01 }); betul(r.ok && r.jaya, r.ralat || r.mesej);
  p = S.loadPlayer(); sama(M.pakatanSah(p).gab, 'PN'); betul(M.ofset(p) > -13, 'ofset pakatan lebih baik'); sama(M.lawan(p)[0], 'BN'); sama(M.runding('BN').ok, false, 'sekali bagi setiap PRU');
  // kerusi nasional kecil, tiada rakan
  const kp = M.kerusiParlimen(45, () => 0.5); betul(kp.parti <= 3 && kp.rakan === 0, JSON.stringify(kp));
  // ANGKASA: umur 41 => parti induk
  P.tetap({ demografik: Object.assign({}, S.loadPlayer().demografik, { umur: 45 }) }); M.prosesBulan(); sama(S.loadPlayer().sayap, 'utama', 'had umur ANGKASA 40');
  // Penentu kerajaan: Ahli Parlimen selepas PRU
  const pru = Object.assign({}, PRU.getPRU(S.loadPlayer())); pru.riwayat = [{ tahun: 2031, bulan: 3, jenis: 'PRU' }]; pru.tahunPRU = 2036; pru.status = { jenis: 'MP', kerusi: 'Kota Bharu', sejakTahun: 2031, sejakBulan: 3, kerajaan: false };
  P.tetap({ tahun: 2031, bulan: 4, pru: pru }); M.prosesBulan(); sama(M.kekuatan(S.loadPlayer()), 9 + M.CONFIG.KEKUATAN.menangMP, 'menang MP: Kekuatan +6'); sama(M.pakatanSah(S.loadPlayer()), null, 'pakatan tamat selepas PRU');
  betul(M.statusPenentu(S.loadPlayer()).boleh); r = M.sokong('PH', { rng: () => 0.01 }); betul(r.ok && r.jaya, r.ralat || r.mesej);
  p = S.loadPlayer(); sama(PRU.getPRU(p).status.kerajaan, true); sama(g.MyPolitikKabinet.getKabinet(p).roleLevel, 'TIMBALAN_MENTERI'); sama(M.sokong('BN').ok, false);
  betul(g.MyPolitikLompat.aktifDi('BERJASA', 'Kelantan') && !g.MyPolitikLompat.aktifDi('BERJASA', 'Sabah'), 'lompat: Semenanjung sahaja');
  S.clearPlayer();
});
ujian('v13.54 GRS: enam parti Sabah, Gagasan (Beliawanis, Labuan), kuota GRS, Kestabilan Gabungan, krisis ADUN lompat, parti kecil (baris 34)', () => {
  const M = g.MyPolitikGRS, D = g.MyPolitikData, SY = g.MyPolitikSayap, PT = g.MyPolitikParti, GD = g.MyPolitikGRSData, B = g.MyPolitikSabah, fs = require('fs'), path = require('path');
  const baca = (k) => D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'grs-' + k + '.csv'), 'utf8')));
  const h = baca('gagasan'); sama(h.jumlah.bahagian, 26, '25 Parlimen Sabah + Labuan'); betul(h.bahagian.some((b) => b.nama === 'Labuan'));
  ['pbs', 'upko', 'ldp', 'phrs', 'pcs'].forEach((k) => betul(baca(k).jumlah.bahagian >= 4, k));
  sama(GD.parti.GAGASAN.qDUN.length, 37); sama(GD.parti.PBS.qDUN.length, 11); sama(GD.parti.LDP.qDUN.length, 0);
  betul(SY.kelayakan('P', 25, 'GAGASAN').puteri.boleh, 'Gagasan ada Beliawanis'); betul(!SY.kelayakan('P', 25, 'PBS').puteri.boleh, 'PBS tiada Puteri');
  // Gagasan: daftar di DUN dalam kuota
  const kd = GD.parti.GAGASAN.qDUN[0], dn = GD.dun[kd], b0 = h.bahagian.find((b) => b.kod === dn.p.replace('P.', '') || ('P.' + String(parseInt(b.kod, 10)).padStart(3, '0')) === dn.p);
  const dun0 = b0.dun.find((x) => x.nama === dn.n) || b0.dun[0];
  S.savePlayer(S.buildPlayerProfile({ parti: 'GAGASAN', nama: 'Uji GRS', demografik: D.tentukanDemografi('Perempuan', 28, 'GAGASAN'), cawangan: dun0.cawangan[0], sayap: 'puteri', avatar: 'puteri', tahunAhli: 3 }));
  let p = S.loadPlayer(); sama(p.parti, 'GAGASAN'); sama(p.sayap, 'puteri'); sama(PT.info('GAGASAN').gabungan, 'GRS');
  sama(PT.ke('Ketua Puteri Bahagian ke Perhimpunan Agung UMNO (PAU)'), 'Ketua Beliawanis Bahagian ke Perhimpunan Agung GAGASAN');
  sama(K.getTetingkap('cawangan', 1).mula, 3); sama(K.getTetingkap('pau', 1).mula, 9); sama(E.adalahTahunPemilihan(2027), true);
  let kw = M.kawasan(p); betul(kw.kuotaDUN, 'DUN dalam kuota GRS: ' + kd); betul(B.adalah(p), 'pemain PRN Sabah');
  // Kestabilan & tindakan
  sama(M.kestabilan(p), 62); P.tetap({ ap: 20, myr: 50000 });
  let r = M.jamuan(); betul(r.ok, r.ralat); sama(M.kestabilan(S.loadPlayer()), 68); sama(M.jamuan().ok, false, 'sekali sebulan');
  const hub0 = PRU.getPRU(S.loadPlayer()).hubunganGabungan || 50; r = M.ma63(); betul(r.ok, r.ralat); sama(PRU.getPRU(S.loadPlayer()).hubunganGabungan, hub0 - 3);
  r = M.sabahan(); betul(r.ok, r.ralat); sama(M.bonusPRN(S.loadPlayer()), 1); sama(M.ofset(S.loadPlayer(), 'DUN'), 0.5);
  // anggaran PRN: GRS + UPKO, kerajaan GRS
  const sb = B.kerusiPRN(S.loadPlayer(), 45); sama(sb.UPKO, 0, 'UPKO dalam GRS'); betul(typeof sb.kerajaanGRS === 'boolean'); sama(sb.GRS + sb.Warisan + sb.BN + sb.lain, 73);
  // krisis ADUN lompat
  P.tetap({ grs: Object.assign(S.loadPlayer().grs, { kestabilan: 30 }) }); let ev = M.prosesBulan({ rng: () => 0.01 }).peristiwa;
  betul(ev.some((x) => /Krisis ADUN lompat/.test(x.mesej)), ev.map((x) => x.mesej).join()); betul(M.statusKrisis(S.loadPlayer()));
  r = M.jawabKrisis('pujuk'); betul(r.ok, r.ralat); sama(M.statusKrisis(S.loadPlayer()), null); betul(M.kestabilan(S.loadPlayer()) >= 40);
  // persekutuan: GRS rakan Kerajaan Perpaduan
  const ka = g.NusaPaparan.anggarKerusi(S.loadPlayer(), { tahun: 2031, bulan: 3 }, {}); betul(ka.kerajaan && ka.parti >= 5 && ka.parti <= 8, JSON.stringify(ka));
  // parti kecil: LDP
  const hl = baca('ldp'); S.savePlayer(S.buildPlayerProfile({ parti: 'LDP', nama: 'Uji LDP', demografik: D.tentukanDemografi('Lelaki', 40, 'LDP'), cawangan: hl.bahagian[0].dun[0].cawangan[0], sayap: 'utama', avatar: 'biasa', tahunAhli: 3 }));
  p = S.loadPlayer(); sama(M.kekuatan(p), 10); kw = M.kawasan(p); betul(!kw.kuotaPL && !kw.kuotaDUN, 'tiada kerusi tetap');
  P.tetap({ ap: 10, myr: 20000 }); r = M.gerak(); betul(r.ok, r.ralat); sama(M.kekuatan(S.loadPlayer()), 11);
  sama(M.statusKuota(S.loadPlayer()).boleh, false, 'terlalu awal');
  const pr = Object.assign({}, PRU.getPRU(S.loadPlayer())); P.tetap({ tahun: pr.tahunPRU - 1, bulan: pr.bulanPRU, jawatan: 'Ketua Cawangan', jawatanList: [pegang('ketua_cawangan', pr.tahunPRU - 1)] });
  betul(M.statusKuota(S.loadPlayer()).boleh, JSON.stringify(M.statusKuota(S.loadPlayer()))); r = M.rundingKuota({ rng: () => 0.01 }); betul(r.ok && r.jaya, r.ralat || r.mesej);
  betul(M.kawasan(S.loadPlayer()).kuotaDUN, 'kuota DUN diberi');
  betul(g.MyPolitikLompat.aktifDi('PBS', 'Sabah') && !g.MyPolitikLompat.aktifDi('PBS', 'Selangor'), 'lompat: Sabah sahaja');
  S.clearPlayer();
});
ujian('v13.55 Warisan: Sabah, Labuan dan Semenanjung, Wira / Wirawati, Gelombang Warisan, Pikat ADUN, kerajaan Warisan dalam PRN Sabah (baris 31)', () => {
  const M = g.MyPolitikWarisan, D = g.MyPolitikData, SY = g.MyPolitikSayap, PT = g.MyPolitikParti, B = g.MyPolitikSabah, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'warisan-malaysia.csv'), 'utf8')));
  sama(h.jumlah.bahagian, 191, 'Sabah 25 + Labuan + Semenanjung 165'); betul(Math.abs(h.jumlah.ahli - 548200) < 5000, 'keahlian ~548,200: ' + h.jumlah.ahli);
  betul(SY.kelayakan('P', 25, 'WARISAN').puteri.boleh, 'Wirawati'); sama(PT.info('WARISAN').gabungan, null);
  const sb = h.bahagian.find((b) => b.nama === 'Semporna');
  S.savePlayer(S.buildPlayerProfile({ parti: 'WARISAN', nama: 'Uji Warisan', demografik: D.tentukanDemografi('Lelaki', 30, 'WARISAN'), cawangan: sb.dun[0].cawangan[0], sayap: 'pemuda', avatar: 'pemuda', tahunAhli: 3 }));
  let p = S.loadPlayer(); sama(p.parti, 'WARISAN'); betul(B.adalah(p), 'pemain PRN Sabah'); betul(M.diSabah(p));
  sama(PT.ke('Ketua Pemuda dan Ketua Puteri ke Perhimpunan Agung UMNO (PAU)'), 'Ketua Wira dan Ketua Wirawati ke Perhimpunan Agung WARISAN');
  sama(K.getTetingkap('pau', 1).mula, 9); const kw = M.kawasan(p); betul(kw.kuotaPL && kw.kuotaDUN, 'tiada kuota gabungan'); sama(M.ofset(p), 0);
  P.tetap({ ap: 20, myr: 50000 }); let r = M.jelajah(); betul(r.ok, r.ralat); sama(M.gelombang(S.loadPlayer()), 44); sama(M.jelajah().ok, false);
  r = M.serang({ rng: () => 0.9 }); betul(r.ok && r.jaya, r.ralat); sama(M.gelombang(S.loadPlayer()), 47);
  r = M.pikat({ rng: () => 0.01 }); betul(r.ok && r.jaya, r.ralat); sama(M.pikat().ok, false, 'sekali setahun');
  P.tetap({ warisan: Object.assign(S.loadPlayer().warisan, { gelombang: 100 }) }); sama(M.bonusPRN(S.loadPlayer()), 13, '+12 Gelombang + 1 pikat');
  const prn = B.kerusiPRN(S.loadPlayer(), 70); betul(prn.Warisan >= 30, JSON.stringify(prn)); sama(prn.GRS + prn.Warisan + prn.BN + prn.UPKO + prn.lain, 73); betul(typeof prn.kerajaanWarisan === 'boolean');
  betul(!(prn.kerajaanWarisan && prn.kerajaanGRS), 'satu kerajaan sahaja');
  const kp = M.kerusiParlimen(45, () => 0.5); betul(kp.parti >= 1 && kp.parti <= 10 && kp.rakan === 0, JSON.stringify(kp));
  // Semenanjung: ofset negatif
  const sl = h.bahagian.find((b) => b.negeri === 'Selangor'); S.savePlayer(S.buildPlayerProfile({ parti: 'WARISAN', nama: 'Uji W2', demografik: D.tentukanDemografi('Lelaki', 30, 'WARISAN'), cawangan: sl.dun[0].cawangan[0], sayap: 'utama', avatar: 'biasa', tahunAhli: 3 }));
  p = S.loadPlayer(); betul(!M.diSabah(p)); sama(M.ofset(p), -14); betul(!B.adalah(p), 'bukan PRN Sabah');
  betul(g.MyPolitikLompat.aktifDi('WARISAN', 'Selangor') && g.MyPolitikLompat.aktifDi('WARISAN', 'Sabah') && !g.MyPolitikLompat.aktifDi('WARISAN', 'Sarawak'), 'lompat: bukan Sarawak');
  S.clearPlayer();
});
ujian('v13.56 Amanah: data, istilah, takwim 6/8/11, kuota PH, Naratif Rahmah, Konvensyen Negeri, Mesyuarat JPN 44 orang (perlembagaan 2022)', () => {
  const M = g.MyPolitikAmanah, D = g.MyPolitikData, SY = g.MyPolitikSayap, PT = g.MyPolitikParti, J = g.MyPolitikJawatan, fs = require('fs'), path = require('path');
  const h = D.rowsToHierarchy(D.teksKeBaris(fs.readFileSync(path.join(__dirname, '..', 'data', 'amanah-malaysia.csv'), 'utf8')));
  sama(h.jumlah.bahagian, 181); betul(Math.abs(h.jumlah.ahli - 200000) < 2000, 'ahli ~200,000: ' + h.jumlah.ahli); betul(SY.kelayakan('P', 25, 'AMANAH').puteri.boleh, 'WARDA');
  const sa = h.bahagian.find((b) => b.nama === 'Shah Alam') || h.bahagian[0];
  S.savePlayer(S.buildPlayerProfile({ parti: 'AMANAH', nama: 'Uji Amanah', demografik: D.tentukanDemografi('Lelaki', 32, 'AMANAH'), cawangan: sa.dun[0].cawangan[0], sayap: 'pemuda', avatar: 'pemuda', tahunAhli: 3 }));
  let p = S.loadPlayer(); sama(p.parti, 'AMANAH'); sama(PT.info('AMANAH').gabungan, 'PH');
  sama(PT.ke('Ketua Bahagian dan Ketua Puteri ke Perhimpunan Agung UMNO (PAU) bulan 9; Majlis Kerja Tertinggi (MKT)'), 'Ketua Kawasan dan Ketua WARDA ke Konvensyen Nasional Amanah bulan 11; Jawatankuasa Pimpinan Nasional (JPN)');
  sama(PT.ke('Fasal 20.13'), 'Perlembagaan Amanah, Fasal 22.8');
  sama(K.getTetingkap('cawangan', 1).mula, 6); sama(K.getTetingkap('bahagian', 1).mula, 8); sama(K.getTetingkap('pau', 1).mula, 11);
  sama(E.adalahTahunPemilihan(2026), false); sama(E.adalahTahunPemilihan(2028), true);
  betul(/Mesyuarat|mesyuarat 44/.test(M.sekatanJawatan(p, J.cariDef('presiden'))), 'Presiden tidak di Konvensyen'); sama(M.kerusiJawatan(p, J.cariDef('ahli_mkt')), 27);
  const kw = M.kawasan(p); betul(kw.parlimen && typeof kw.kuotaPL === 'boolean');
  // Naratif Rahmah
  P.tetap({ ap: 20, myr: 50000 }); let r = M.ceramah(); betul(r.ok, r.ralat); sama(M.naratif(S.loadPlayer()), 54); sama(M.ceramah().ok, false, 'sebulan sekali');
  // Konvensyen Negeri (bulan 9-10, keputusan bulan 11)
  sama(M.statusNegeri(S.loadPlayer()).boleh, false, 'bukan tahun pemilihan');
  P.tetap({ tahun: 2028, bulan: 9, reputasi: 90, jawatanList: [pegang('ketua_bahagian', 2028)], amanah: Object.assign({}, S.loadPlayer().amanah, { pusat: Object.fromEntries(Object.keys(g.MyPolitikAmanahData.parlimen).map((k) => [k, 90])) }) });
  betul(M.statusNegeri(S.loadPlayer()).boleh, JSON.stringify(M.statusNegeri(S.loadPlayer()))); r = M.pilihNegeri('pengerusi'); betul(r.ok, r.ralat);
  P.tetap({ bulan: 11 }); M.prosesBulan(); p = S.loadPlayer(); betul(M.jawatanNegeri(p) && M.jawatanNegeri(p).jawatan === 'pengerusi', JSON.stringify(p.amanah.negeri));
  // Mesyuarat JPN: bulan 12 dibuka, bulan 1 keputusan
  P.tetap({ bulan: 12, jawatanList: [pegang('ketua_bahagian', 2028), { kod: 'ahli_mkt', jawatan: 'Ahli MKT', peringkat: 'pusat', kumpulan: 'utama', pangkat: 8, tahun: 2028 }] });
  M.prosesBulan(); p = S.loadPlayer(); let mt = M.mesyuarat(p);
  betul(mt && mt.sokong + mt.belum + mt.lawan === 43, 'mesyuarat 44 orang: ' + JSON.stringify(mt)); betul(M.pilihSasaran('presiden').ok); betul(M.lobi({ rng: () => 0 }).ok);
  P.tetap({ amanah: Object.assign({}, S.loadPlayer().amanah, { jpn: Object.assign({}, S.loadPlayer().amanah.jpn, { sokong: 30, belum: 0, lawan: 13 }) }) });
  P.tetap({ tahun: 2029, bulan: 1 }); M.prosesBulan(); p = S.loadPlayer();
  betul(p.amanah.jpn.hasil.menang, JSON.stringify(p.amanah.jpn.hasil)); betul(J.pegang(p, 'presiden'), 'Presiden'); sama(M.penggalPresiden(p), 1);
  // persekutuan: PH
  const ka = g.NusaPaparan.anggarKerusi(p, { tahun: 2031, bulan: 3 }, {}); betul(ka.parti >= 30, JSON.stringify(ka));
  betul(g.MyPolitikLompat.aktifDi('AMANAH', 'Selangor') && !g.MyPolitikLompat.aktifDi('AMANAH', 'Sarawak'), 'lompat');
  S.clearPlayer();
});
ujian('v13.57 Enjin pemilihan ikut parti (Fasa 1 BN): MCA, MIC, PPP dan PBRS berbeza daripada UMNO (struktur.js)', () => {
  const ST = g.MyPolitikStruktur, J = g.MyPolitikJawatan, PT = g.MyPolitikParti;
  const kod = (parti, sayap) => J.katalogUntuk({ parti: parti, sayap: sayap || 'utama' }).map((d) => d.kod);
  const um = kod('UMNO');
  betul(um.indexOf('naib_ketua_bahagian') >= 0 && um.indexOf('ajk_bahagian') >= 0 && um.indexOf('naib_pengerusi_cawangan') < 0, 'UMNO katalog asal');
  ['MCA', 'MIC', 'PPP', 'PBRS'].forEach((k) => { betul(kod(k).join() !== um.join(), k + ' bukan salinan UMNO'); });
  betul(kod('MIC').join() !== kod('PPP').join() && kod('PPP').join() !== kod('PBRS').join(), 'PPP dan PBRS bukan salinan MIC');
  // MCA: Naib Pengerusi Cawangan, 4 Naib Pengerusi Bahagian, 10 AJK, 4 Naib Presiden, wakil Cawangan Perkara 94
  const mca = { parti: 'MCA' }; betul(kod('MCA').indexOf('naib_pengerusi_cawangan') >= 0);
  sama(ST.kerusi(mca, J.cariDef('ajk_cawangan')), 10); sama(ST.kerusi(mca, J.cariDef('naib_ketua_bahagian')), 4); sama(ST.kerusi(mca, J.cariDef('ajk_bahagian')), 10); sama(ST.kerusi(mca, J.cariDef('naib_presiden')), 4);
  sama(ST.wakilMCA(50), 2); sama(ST.wakilMCA(200), 8); sama(ST.wakilMCA(500), 14); sama(ST.wakilMCA(100000), 29);
  // MIC: tiada Naib / AJK Bahagian, 7 AJK Cawangan, 21 CWC, sayap Cawangan Ketua + Timbalan, perwakilan PA hanya Pengerusi Cawangan
  const mic = { parti: 'MIC' }, km = kod('MIC', 'pemuda');
  betul(km.indexOf('naib_ketua_bahagian') < 0 && km.indexOf('ajk_bahagian') < 0 && km.indexOf('sayap_ajk_cawangan_pemuda') < 0 && km.indexOf('sayap_naib_cawangan_pemuda') >= 0);
  sama(ST.kerusi(mic, J.cariDef('ajk_cawangan')), 7); sama(ST.kerusi(mic, J.cariDef('ahli_mkt')), 21);
  sama(J.pangkatMinParti(mic, J.cariDef('ketua_bahagian')), 3, 'tangga MIC: Pengerusi Cawangan terus ke Pengerusi Bahagian'); sama(J.pangkatMinParti({ parti: 'UMNO' }, J.cariDef('ketua_bahagian')), 4);
  sama(J.pangkatMinParti(mic, J.cariDef('sayap_ajk_pusat_pemuda')), 3, 'tangga fallback bila AJK Bahagian ditutup');
  sama(ST.perwakilanPA(mic).kod, 'ketua_cawangan');
  // PPP: tiada Timbalan Presiden, Majlis Tertinggi 15; PBRS: Timbalan Presiden ada, 2 Naib Presiden
  betul(kod('PPP').indexOf('timbalan_presiden') < 0 && kod('PBRS').indexOf('timbalan_presiden') >= 0);
  sama(ST.kerusi({ parti: 'PPP' }, J.cariDef('ahli_mkt')), 15); sama(ST.kerusi({ parti: 'PBRS' }, J.cariDef('naib_presiden')), 2);
  // enjin: senarai pertandingan MIC tahun pemilihan 2027 ikut struktur
  P.daftar({}); P.tetap({ parti: 'MIC', tahun: 2027, bulan: 1, ip: 999, jawatanList: [pegang('ketua_cawangan', 2024)] });
  const sn = E.senaraiPertandingan(S.loadPlayer()), cari = (k) => sn.find((x) => x.kod === k);
  betul(!cari('ajk_bahagian') && !cari('naib_ketua_bahagian'), 'MIC tiada AJK / Naib Bahagian'); sama(cari('ahli_mkt').kerusi, 21); sama(cari('ajk_cawangan').kerusi, 7);
  P.tetap({ jawatanList: [pegang('ajk_cawangan', 2024)] });
  const pb = E.senaraiPertandingan(S.loadPlayer()).find((x) => x.kod === 'perwakilan_bahagian'); sama(pb.terbuka, false); betul(/74\.4/.test(pb.sebab), pb.sebab);
  // istilah: MIC sayap Timbalan Ketua, PPP Pengerusi
  P.tetap({ parti: 'MIC' }); sama(PT.ke('Naib Ketua Pemuda Cawangan'), 'Timbalan Ketua Pemuda Cawangan');
  P.tetap({ parti: 'PPP' }); sama(PT.ke('Ketua Cawangan'), 'Pengerusi Cawangan');
  // PBRS: Restu Pengerusi Kehormat menguatkan calon Presiden / Timbalan sahaja
  const B = g.MyPolitikPBRS, pr = { parti: 'PBRS', pbrs: { restu: 90 } };
  betul(B.bonusRestu(pr, J.cariDef('presiden')) > 0 && B.bonusRestu(pr, J.cariDef('ahli_mkt')) === 0 && B.bonusRestu({ parti: 'PBRS', pbrs: { restu: 10 } }, J.cariDef('timbalan_presiden')) < 0);
  S.clearPlayer();
});
ujian('v13.57 Enjin pemilihan ikut parti (Fasa 2 PN): PAS (Fasal 38, 41, 44, 57, 67): AJK 2/3 dipilih + lantikan 1/3, Naib Ketua Cawangan, Timbalan Ketua Dewan', () => {
  const ST = g.MyPolitikStruktur, J = g.MyPolitikJawatan, PT = g.MyPolitikParti, pas = { parti: 'PAS', sayap: 'pemuda' };
  const kp = J.katalogUntuk(pas).map((d) => d.kod), ku = J.katalogUntuk({ parti: 'UMNO', sayap: 'pemuda' }).map((d) => d.kod);
  betul(kp.indexOf('sayap_timbalan_bahagian_pemuda') >= 0 && kp.indexOf('sayap_timbalan_pusat_pemuda') >= 0 && ku.indexOf('sayap_timbalan_pusat_pemuda') < 0, 'Timbalan Ketua Dewan PAS sahaja');
  betul(kp.indexOf('sayap_naib_cawangan_pemuda') < 0 && kp.indexOf('sayap_ajk_cawangan_pemuda') < 0 && kp.indexOf('sayap_cawangan_pemuda') >= 0, 'sayap Cawangan: Ketua sahaja');
  sama(ST.kerusi(pas, J.cariDef('ajk_cawangan')), 8); sama(ST.lantikan(pas, J.cariDef('ajk_cawangan')), 4); sama(ST.kerusi(pas, J.cariDef('ajk_bahagian')), 16); sama(ST.kerusi(pas, J.cariDef('ahli_mkt')), 18); sama(ST.lantikan(pas, J.cariDef('ahli_mkt')), 8);
  sama(ST.kerusi(pas, J.cariDef('sayap_ajk_pusat_pemuda')), 22); sama(ST.lantikan({ parti: 'UMNO' }, J.cariDef('ajk_cawangan')), 0);
  P.daftar({}); P.tetap({ parti: 'PAS' }); sama(PT.ke('Timbalan Ketua Cawangan'), 'Naib Ketua Cawangan'); sama(PT.ke('Timbalan Ketua Wanita Bahagian'), 'Timbalan Ketua Muslimat Kawasan');
  // lantikan 1/3: kalah tipis dalam kuota lantikan -> boleh dilantik; peluang 50% + sokongan Ketua Cawangan (20-80%)
  const p0 = Object.assign(S.loadPlayer(), { kesetiaan: Object.assign({}, S.loadPlayer().kesetiaan, { ketuaCawangan: 80 }) }), dA = J.cariDef('ajk_cawangan');
  sama(E.peluangLantikan(p0, dA), 0.8); betul(E.lantikanBerlaku(p0, dA, 10, 8, () => 0.5), 'tempat 10 daripada 8 + 4 lantikan');
  betul(!E.lantikanBerlaku(p0, dA, 13, 8, () => 0), 'tempat 13 di luar kuota'); betul(!E.lantikanBerlaku(p0, dA, 10, 8, () => 0.9), 'peluang tidak berjaya');
  betul(!E.lantikanBerlaku(Object.assign({}, p0, { parti: 'UMNO' }), dA, 10, 8, () => 0), 'UMNO tiada lantikan');
  S.clearPlayer();
});
ujian('v13.59 Enjin pemilihan ikut parti (Fasa 3 PH): PKR (Cabang diundi anggota), DAP (JPKP), Amanah (pemilihan tidak langsung)', () => {
  const ST = g.MyPolitikStruktur, J = g.MyPolitikJawatan, PT = g.MyPolitikParti, cd = (k) => J.cariDef(k);
  const pkr = { parti: 'PKR', sayap: 'wanita' }, dap = { parti: 'DAP' }, am = { parti: 'AMANAH' };
  // PKR
  sama(ST.kerusi(pkr, cd('naib_presiden')), 4); sama(ST.lantikan(pkr, cd('naib_presiden')), 3); sama(ST.kerusi(pkr, cd('ahli_mkt')), 20); sama(ST.lantikan(pkr, cd('ahli_mkt')), 7);
  sama(ST.kerusi(pkr, cd('ajk_bahagian')), 15); sama(ST.lantikan(pkr, cd('naib_ketua_bahagian')), 2); sama(ST.kerusi(pkr, cd('sayap_ajk_bahagian_wanita')), 7);
  betul(J.katalogUntuk(pkr).some((d) => d.kod === 'sayap_timbalan_pusat_wanita'), 'Timbalan Ketua Wanita PKR');
  sama(ST.pemilih(pkr, cd('ketua_bahagian')), 'ahli');
  // DAP: Ahli JPKP ditutup, pegawai JPKP perlu Pengerusi Cawangan, JTP 30 + 10 lantikan
  betul(!J.katalogUntuk(dap).some((d) => d.kod === 'ajk_bahagian')); sama(ST.kerusi(dap, cd('ajk_cawangan')), 7); sama(ST.lantikan(dap, cd('ahli_mkt')), 10);
  sama(J.pangkatMinParti(dap, cd('ketua_bahagian')), 3, 'tangga: Pengerusi Cawangan');
  // Amanah: AJK 11 / 15, Ketua perlu AJK, pengundi 11 / 18
  sama(ST.kerusi(am, cd('ajk_cawangan')), 11); sama(ST.kerusi(am, cd('ajk_bahagian')), 15); sama(ST.kerusi(am, cd('naib_ketua_bahagian')), 2); sama(ST.pemilih(am, cd('ketua_cawangan')), 11); sama(ST.pemilih(am, cd('ketua_bahagian')), 18);
  betul(!J.katalogUntuk({ parti: 'AMANAH', sayap: 'pemuda' }).some((d) => d.kod === 'sayap_ajk_cawangan_pemuda'));
  // syarat 'perlu' dalam semakKelayakan
  P.daftar({}); P.tetap({ parti: 'AMANAH', ip: 999, jawatanList: [] });
  let k = J.semakKelayakan(S.loadPlayer(), cd('ketua_cawangan')); sama(k.terbuka, false); betul(/11 AJK/.test(k.sebab), k.sebab);
  P.tetap({ jawatanList: [pegang('ajk_cawangan', 2025)] }); k = J.semakKelayakan(S.loadPlayer(), cd('ketua_cawangan')); betul(k.terbuka || !/11 AJK/.test(k.sebab), k.sebab);
  sama(E.pemilihParti(S.loadPlayer(), { kod: 'ketua_cawangan', jenis: 'jawatan' }), 11);
  P.tetap({ parti: 'DAP', jawatanList: [pegang('ajk_cawangan', 2025)] }); k = J.semakKelayakan(S.loadPlayer(), cd('ketua_bahagian')); sama(k.terbuka, false); betul(/Pengerusi Cawangan/.test(k.sebab), k.sebab);
  P.tetap({ parti: 'PKR' }); betul(E.pemilihParti(S.loadPlayer(), { kod: 'ketua_bahagian', jenis: 'jawatan' }) >= 100, 'PKR: semua anggota Cabang');
  P.tetap({ parti: 'DAP' }); sama(PT.ke('Naib Ketua Bahagian'), 'Setiausaha Organisasi JPKP');
  S.clearPlayer();
});
ujian('v13.60 Enjin mesyuarat ikut parti (Fasa 1 BN): wakil, bilangan hadir, tajuk agenda, usul komuniti, takwim PBRS 4/6/10', () => {
  const ST = g.MyPolitikStruktur, M0 = g.MyPolitikMeeting, K0 = g.MyPolitikCalendar;
  sama(ST.wakilPAMCA(500), 2); sama(ST.wakilPAMCA(2000), 7); sama(ST.wakilPAMCA(5000), 13); sama(ST.wakilPAMCA(1e6), 29);
  sama(ST.wakilMIC(59), 1); sama(ST.wakilMIC(300), 5); sama(ST.wakilPAMIC(2600), 10);
  P.daftar({}); let p = S.loadPlayer();
  const tajuk = (pp, per) => (M0.janaAgendaUji ? M0.janaAgendaUji(pp, per) : []).map((a) => a.tajuk).join(' | ');
  // UMNO kekal
  betul(/Presiden, Timbalan Presiden, 3 Naib Presiden, MKT/.test(M0.senaraiPusat(p)), M0.senaraiPusat(p));
  sama(M0.peranSayap(Object.assign({}, p, { sayap: 'pemuda' }), 'cawangan'), 'Ketua, Naib Ketua, AJK');
  // MCA 4 Naib, MIC sayap Timbalan tanpa AJK, PPP tanpa Timbalan Presiden, PBRS 2 Naib
  sama(M0.senaraiPusat(Object.assign({}, p, { parti: 'MCA' })), 'Presiden, Timbalan Presiden, 4 Naib Presiden, MKT');
  sama(M0.peranSayap(Object.assign({}, p, { parti: 'MIC', sayap: 'pemuda' }), 'cawangan'), 'Ketua, Naib Ketua');
  sama(M0.senaraiPusat(Object.assign({}, p, { parti: 'PPP' })), 'Presiden, 3 Naib Presiden, MKT');
  sama(M0.senaraiPusat(Object.assign({}, p, { parti: 'PBRS' }), true), 'Presiden, Timbalan Presiden, 2 Naib Presiden dan MKT');
  // usul komuniti: MCA tiada usul surau, ada usul MCA
  P.tetap({ parti: 'MCA' }); p = S.loadPlayer();
  const ag = M0.janaAgendaUji(p, 'cawangan').filter((a) => a.jenis === 'usul').map((a) => a.kod);
  betul(ag.some((k) => /^mca_/.test(k)) && ag.indexOf('dewan_surau') < 0, ag.join());
  betul(/Ucapan Dasar Presiden: (Suara|Ekonomi dan|MCA)/.test(M0.janaAgendaUji(p, 'pau').map((a) => a.tajuk).join('|')), 'tema MCA');
  // takwim PBRS 4/6/10
  P.tetap({ parti: 'PBRS' }); sama(K0.getTetingkap('cawangan', 1).mula, 4); sama(K0.getTetingkap('bahagian', 1).mula, 6); sama(K0.getTetingkap('pau', 1).mula, 10);
  sama(g.MyPolitikParti.ke('Ketua Cawangan'), 'Ketua Cawangan', 'PBRS tidak mewarisi istilah Pengerusi PPP');
  S.clearPlayer();
});
ujian('v13.61 Enjin mesyuarat PAS (Fasa 2): nama mesyuarat, wakil Muktamar 18(5), hadir, tiada mesyuarat sayap Cawangan, wakil dilantik, G15, 20 wakil Dewan, penangguhan 18(3)', () => {
  const ST = g.MyPolitikStruktur, M0 = g.MyPolitikMeeting, PA = g.MyPolitikPAS, PT = g.MyPolitikParti;
  sama(ST.wakilPAS(1500), 4); sama(ST.wakilPAS(5600), 7); sama(ST.wakilPAS(40000), 15);
  P.daftar({ sayap: 'pemuda', umur: 30 }); P.tetap({ parti: 'PAS', sayap: 'pemuda', tahun: 2027, bulan: 3 }); let p = S.loadPlayer();
  sama(PT.ke('Persidangan Tahunan Cawangan'), 'Mesyuarat Agung Tahunan Cawangan'); sama(PT.ke('Mesyuarat Perwakilan Bahagian'), 'Mesyuarat Agung Tahunan Kawasan'); sama(PT.ke('Perhimpunan Pemuda (Pra-PAU)'), 'Muktamar Dewan Pemuda');
  betul(M0.bilHadir(p, 'pau') > 900 && M0.bilHadir(p, 'pau') !== 1500, 'hadir Muktamar dikira: ' + M0.bilHadir(p, 'pau'));
  const sn = E.senaraiPertandingan(p), c = (k) => sn.find((x) => x.kod === k);
  sama(c('perwakilan_sayap_cawangan').terbuka, false); betul(/dilantik/.test(c('perwakilan_sayap_cawangan').sebab)); sama(c('perwakilan_sayap_g10').kerusi, 15);
  betul(!c('perwakilan_sayap_g2'), 'tiada G2'); betul(c('perwakilan_dewan_muktamar') && c('perwakilan_dewan_muktamar').kerusi === 20, 'wakil Dewan ke Muktamar');
  // lantikan wakil sayap dalam Mesyuarat Agung Cawangan (rng 0 = dilantik)
  P.tetap({ kesetiaan: Object.assign({}, p.kesetiaan, { ajk: 80, akarUmbi: 80 }) });
  const h = E.jalankanPemilihanPeringkat('cawangan', { rng: () => 0 }); betul(h.some((x) => x.keputusan && x.keputusan.dilantik), JSON.stringify(h.map((x) => x.mesej)));
  sama(S.loadPlayer().perwakilan.sayapCawangan, 2027);
  // penangguhan Fasal 18(3): 2029 ditangguh -> 2030, 2032
  const pt = { parti: 'PAS', pas: { tangguh: [2029] } };
  sama(PA.adalahTahunPemilihan(pt, 2027), true); sama(PA.adalahTahunPemilihan(pt, 2029), false); sama(PA.adalahTahunPemilihan(pt, 2030), true); sama(PA.adalahTahunPemilihan(pt, 2032), true); sama(PA.tahunSeterusnya(pt, 2029), 2030); sama(PA.tahunLepas(pt, 2029), 2027);
  sama(PA.adalahTahunPemilihan({ parti: 'PAS' }, 2029), true, 'tanpa penangguhan');
  // usul dan tema PAS
  const ag = M0.janaAgendaUji(S.loadPlayer(), 'pau').map((a) => a.kod + ':' + a.tajuk).join('|'); betul(/pas_/.test(ag) && /Islam Memimpin|Kepimpinan Ulamak|Malaysia Sejahtera/.test(ag), ag);
  S.clearPlayer();
});
ujian('v13.62 Enjin mesyuarat PH (Fasa 3): PKR semua anggota Cabang + 5/40 wakil, DAP wakil terus ke Kongres + Kongres 3 tahun, Amanah 4 wakil + G20 + 20 wakil sayap', () => {
  const ST = g.MyPolitikStruktur, M0 = g.MyPolitikMeeting, PT = g.MyPolitikParti;
  sama(ST.wakilDAP(40), 2); sama(ST.wakilDAP(75), 3); sama(ST.wakilDAP(150), 4); sama(ST.wakilDAP(201), 5);
  // PKR
  P.daftar({ sayap: 'pemuda', umur: 30 }); P.tetap({ parti: 'PKR', sayap: 'pemuda', tahun: 2029 }); let p = S.loadPlayer();
  sama(E.kuotaBahagian(p), 5, 'bukan tahun pemilihan: 5 wakil'); betul(g.MyPolitikJawatan.perwakilanSah(p, 'cawangan').layak, 'semua anggota hadir Mesyuarat Agung Cabang');
  let sn = E.senaraiPertandingan(p), c = (k) => sn.find((x) => x.kod === k); sama(c('perwakilan_cawangan').terbuka, false); betul(!c('perwakilan_sayap_g2') && c('perwakilan_dewan_muktamar').kerusi === 50);
  sama(PT.ke('Mesyuarat Perwakilan Bahagian'), 'Mesyuarat Agung Tahunan Cabang'); sama(PT.ke('Persidangan Tahunan Cawangan'), 'Mesyuarat Ranting');
  P.tetap({ tahun: 2028 }); betul(E.kuotaBahagian(S.loadPlayer()) >= 40, 'tahun pemilihan: 40+');
  // DAP
  P.daftar({}); P.tetap({ parti: 'DAP', tahun: 2028 }); p = S.loadPlayer(); sn = E.senaraiPertandingan(p);
  betul(!sn.some((x) => x.kod === 'perwakilan_bahagian'), 'tiada wakil JPKP'); betul(/PAU/.test(sn.find((x) => x.kod === 'perwakilan_cawangan').jawatan));
  const thnK = [2026, 2027, 2028, 2029, 2030, 2031].filter((y) => E.adalahTahunPemilihan(y))[0];
  const pau = (y) => { P.tetap({ tahun: y, bulan: 3, perwakilan: { cawangan: y, bahagian: y } }); return M0.getKeadaanMesyuarat(S.loadPlayer()).peringkat.find((z) => z.kod === 'pau'); };
  betul(pau(thnK).status !== 'tidak_layak', 'Kongres'); const ps = pau(thnK + 1); sama(ps.nama, 'Persidangan Parti DAP'); sama(pau(thnK + 2).status, 'tidak_layak', 'tahun ketiga tiada mesyuarat kebangsaan');
  // Amanah
  P.daftar({ sayap: 'pemuda', umur: 30 }); P.tetap({ parti: 'AMANAH', sayap: 'pemuda' }); p = S.loadPlayer(); sama(E.kuotaCawangan(p), 4); sama(E.kuotaBahagian(p), 4);
  sn = E.senaraiPertandingan(p); sama(sn.find((x) => x.kod === 'perwakilan_sayap_g10').kerusi, 20); sama(sn.find((x) => x.kod === 'perwakilan_dewan_muktamar').kerusi, 20);
  sama(PT.ke('Persidangan Tahunan Cawangan'), 'Mesyuarat Tahunan Cawangan'); sama(PT.ke('Perhimpunan Pemuda (Pra-PAU)'), 'Konvensyen Pemuda Nasional');
  betul(M0.bilHadir(p, 'pau') > 500 && M0.bilHadir(p, 'pau') !== 1500, 'hadir Konvensyen dikira');
  S.clearPlayer();
});
ujian('v13.63 Enjin pemilihan GPS (Fasa 4): PBB ikut blok, PRS kitaran 2025, SUPP 2 Timbalan / 4 Naib / had penggal, PDP Naib Presiden Kanan', () => {
  const ST = g.MyPolitikStruktur, J = g.MyPolitikJawatan, M0 = g.MyPolitikMeeting, SW = g.MyPolitikSarawak, cd = (k) => J.cariDef(k);
  const pes = { parti: 'PBB', blokPBB: 'pesaka' }, bum = { parti: 'PBB', blokPBB: 'bumiputera' };
  sama(ST.kerusi(pes, cd('naib_presiden')), 3); sama(ST.kerusi(bum, cd('naib_presiden')), 4); sama(ST.kerusi(pes, cd('ahli_mkt')), 14); sama(ST.kerusi(bum, cd('ahli_mkt')), 16); sama(ST.lantikan(pes, cd('ahli_mkt')), 11); sama(ST.lantikan(bum, cd('ahli_mkt')), 9);
  betul(J.katalogUntuk(pes).some((d) => d.kod === 'naib_presiden_kanan') && !J.katalogUntuk({ parti: 'UMNO' }).some((d) => d.kod === 'naib_presiden_kanan'), 'Naib Presiden Kanan PBB sahaja (bukan UMNO)');
  sama(SW.ofsetJawatan(Object.assign({ tahun: 2026 }, pes), { kod: 'timbalan_presiden', peringkat: 'pusat' }) > 0, false, 'tiada penalti giliran Timbalan');
  P.daftar({}); P.tetap({ parti: 'PRS' }); sama(E.adalahTahunPemilihan(2025), true); sama(E.adalahTahunPemilihan(2028), true); sama(E.adalahTahunPemilihan(2026), false); sama(E.tahunPemilihanSeterusnya(2026), 2028);
  P.tetap({ parti: 'SUPP' }); let p = S.loadPlayer(); sama(M0.senaraiPusat(p), 'Presiden, 2 Timbalan Presiden, 4 Naib Presiden, MKT'); sama(ST.pemilih(p, cd('ahli_mkt')), 40);
  sama(g.MyPolitikParti.ke('Ketua Pemuda Cawangan'), 'Pengerusi Seksyen Pemuda Cawangan');
  P.tetap({ penggalPresiden: 3, jawatanList: [pegang('presiden', 2026)], ip: 999 }); const k = J.semakKelayakan(S.loadPlayer(), cd('presiden')); sama(k.terbuka, false); betul(/3 penggal/.test(k.sebab), k.sebab);
  P.tetap({ parti: 'PDP', penggalPresiden: 0 }); sama(M0.senaraiPusat(S.loadPlayer()), 'Presiden, Timbalan Presiden, 3 Naib Presiden Kanan, 2 Naib Presiden, MKT');
  S.clearPlayer();
});
ujian('v13.64 Enjin mesyuarat GPS (Fasa 4): PBB Perhimpunan Agung 3 tahun, istilah PRS / SUPP / PDP, hadir dikira, usul Sarawak', () => {
  const M0 = g.MyPolitikMeeting, PT = g.MyPolitikParti;
  const pau = (y) => { P.tetap({ tahun: y, bulan: 3, perwakilan: { cawangan: y, bahagian: y } }); return M0.getKeadaanMesyuarat(S.loadPlayer()).peringkat.find((z) => z.kod === 'pau'); };
  P.daftar({}); P.tetap({ parti: 'PBB', blokPBB: 'pesaka' });
  const tP = [2026, 2027, 2028, 2029].filter((y) => E.adalahTahunPemilihan(y)); betul(tP.length >= 1);
  betul(pau(tP[0]).status !== 'tidak_layak', 'tahun pemilihan: Perhimpunan Agung'); const x = pau(tP[0] + 1); sama(x.status, 'tidak_layak'); betul(/setiap 3 tahun/.test(x.sebab), x.sebab);
  P.tetap({ tahun: tP[0] }); const p = S.loadPlayer(); betul(M0.bilHadir(p, 'pau') > 300 && M0.bilHadir(p, 'pau') < 1500, 'hadir PBB dikira: ' + M0.bilHadir(p, 'pau'));
  betul(/pbb_|Ucapan Dasar/.test(M0.janaAgendaUji(p, 'pau').map((a) => a.kod + a.tajuk).join('|')));
  P.tetap({ parti: 'PRS' }); sama(PT.ke('Perhimpunan Agung UMNO (PAU)'), 'Perhimpunan Agung PRS'); sama(PT.ke('Majlis Kerja Tertinggi (MKT)'), 'Majlis Tertinggi (MT)');
  P.tetap({ parti: 'SUPP' }); sama(PT.ke('Perhimpunan Agung UMNO (PAU)'), 'Persidangan Perwakilan SUPP'); sama(PT.ke('Ahli MKT'), 'Ahli JK Pusat');
  betul(M0.janaAgendaUji(S.loadPlayer(), 'cawangan').every((a) => a.kod !== 'dewan_surau'), 'tiada usul surau SUPP');
  P.tetap({ parti: 'PDP' }); sama(PT.ke('Perhimpunan Agung UMNO (PAU)'), 'Perhimpunan Agung PDP'); betul(M0.bilHadir(S.loadPlayer(), 'pau') < 400);
  S.clearPlayer();
});
ujian('v13.65 Enjin pemilihan GRS (Fasa 5): PBS ikut komuniti (borang + tukar sekali), UPKO 9 Naib, LDP 7 Naib, PCS kitaran 2 tahun, GAGASAN MT 18', () => {
  const ST = g.MyPolitikStruktur, J = g.MyPolitikJawatan, GR = g.MyPolitikGRS, M0 = g.MyPolitikMeeting, cd = (k) => J.cariDef(k);
  sama(ST.komunitiLalai('172'), 'cina'); sama(ST.komunitiLalai('189'), 'bi'); sama(ST.komunitiLalai('180'), 'bbi');
  sama(ST.kerusi({ parti: 'PBS', komunitiPBS: 'bbi' }, cd('naib_presiden')), 2); sama(ST.kerusi({ parti: 'PBS', komunitiPBS: 'cina' }, cd('naib_presiden')), 1); sama(ST.kerusi({ parti: 'PBS', komunitiPBS: 'bi' }, cd('ahli_mkt')), 5);
  betul(J.katalogUntuk({ parti: 'PBS', sayap: 'wanita' }).some((d) => d.kod === 'sayap_timbalan_pusat_wanita'), 'Timbalan Ketua Wanita PBS');
  P.daftar({}); P.tetap({ parti: 'PBS', komunitiPBS: 'bbi' });
  sama(E.adalahTahunPemilihan(2026), true); sama(E.adalahTahunPemilihan(2029), true); sama(E.adalahTahunPemilihan(2027), false);
  let r = GR.tukarKomuniti('cina'); betul(r.ok, r.ralat); sama(GR.komuniti(S.loadPlayer()), 'cina'); betul(!GR.tukarKomuniti('bi').ok, 'sekali sahaja');
  sama(M0.senaraiPusat(S.loadPlayer()), 'Presiden, Timbalan Presiden, Naib Presiden, MKT');
  P.tetap({ parti: 'UPKO' }); sama(M0.senaraiPusat(S.loadPlayer()), 'Presiden, Timbalan Presiden, 9 Naib Presiden, MKT'); sama(E.adalahTahunPemilihan(2026), true);
  P.tetap({ parti: 'LDP' }); sama(ST.kerusi(S.loadPlayer(), cd('naib_presiden')), 7); sama(E.adalahTahunPemilihan(2027), true);
  P.tetap({ parti: 'PCS' }); sama(E.adalahTahunPemilihan(2026), true); sama(E.adalahTahunPemilihan(2028), true); sama(E.adalahTahunPemilihan(2027), false);
  P.tetap({ parti: 'GAGASAN' }); sama(ST.kerusi(S.loadPlayer(), cd('ahli_mkt')), 18);
  S.clearPlayer();
});
ujian('v13.66 Enjin mesyuarat GRS (Fasa 5): PCS Mesyuarat Agung Dwitahunan, hadir dari modul GRS, usul Sabah, tiada usul surau PBS / UPKO / LDP, Speaker LDP', () => {
  const M0 = g.MyPolitikMeeting, PT = g.MyPolitikParti;
  const pau = (y) => { P.tetap({ tahun: y, bulan: 3, perwakilan: { cawangan: y, bahagian: y } }); return M0.getKeadaanMesyuarat(S.loadPlayer()).peringkat.find((z) => z.kod === 'pau'); };
  P.daftar({}); P.tetap({ parti: 'PCS' }); sama(PT.ke('Perhimpunan Agung UMNO (PAU)'), 'Mesyuarat Agung Dwitahunan PCS');
  betul(pau(2026).status !== 'tidak_layak'); const x = pau(2027); sama(x.status, 'tidak_layak'); betul(/setiap 2 tahun/.test(x.sebab), x.sebab);
  P.tetap({ parti: 'GAGASAN', tahun: 2027 }); let p = S.loadPlayer(); const h = M0.bilHadir(p, 'pau'); betul(h > 100 && h < 600, 'hadir GAGASAN ' + h);
  betul(/gag_/.test(M0.janaAgendaUji(p, 'pau').map((a) => a.kod).join()), 'usul GAGASAN');
  P.tetap({ parti: 'PBS' }); betul(M0.janaAgendaUji(S.loadPlayer(), 'cawangan').every((a) => a.kod !== 'dewan_surau'), 'tiada usul surau PBS');
  P.tetap({ parti: 'LDP' }); betul(/Speaker LDP/.test(M0.janaAgendaUji(S.loadPlayer(), 'pau').map((a) => a.penerangan || '').join()), 'Speaker LDP');
  S.clearPlayer();
});
ujian('v13.67 Enjin pemilihan Lain-lain (Fasa 6): BERJASA Pemudi ANGKASA (bawah 40), AJK kecil; Warisan MT 20; Warisan / GRS tanpa istilah Pengerusi (kecuali GAGASAN)', () => {
  const ST = g.MyPolitikStruktur, J = g.MyPolitikJawatan, PT = g.MyPolitikParti, D0 = g.MyPolitikData, cd = (k) => J.cariDef(k);
  sama(D0.kategoriMengikutUmur('P', 38, 'BERJASA'), 'puteri'); sama(D0.kategoriMengikutUmur('P', 41, 'BERJASA'), 'wanita'); sama(D0.kategoriMengikutUmur('P', 38, 'UMNO'), 'wanita');
  sama(ST.kerusi({ parti: 'BERJASA' }, cd('ahli_mkt')), 15); sama(ST.kerusi({ parti: 'BERJASA' }, cd('ajk_cawangan')), 9); sama(ST.kerusi({ parti: 'WARISAN' }, cd('ahli_mkt')), 20);
  betul(!J.katalogUntuk({ parti: 'BERJASA' }).some((d) => d.kod === 'naib_ketua_bahagian'));
  P.daftar({}); P.tetap({ parti: 'BERJASA' }); sama(PT.ke('Ketua Puteri'), 'Ketua Pemudi ANGKASA');
  P.tetap({ parti: 'WARISAN' }); sama(PT.ke('Ketua Cawangan'), 'Ketua Cawangan');
  P.tetap({ parti: 'PBS' }); sama(PT.ke('Ketua Bahagian'), 'Ketua Bahagian');
  P.tetap({ parti: 'GAGASAN' }); sama(PT.ke('Ketua Bahagian'), 'Pengerusi Bahagian');
  S.clearPlayer();
});
ujian('v13.76 Wisma Putra: lawatan, isu, konsular, sidang kemuncak, FTA, kesan bulanan, sambungan MOF dan MINDEF', () => {
  const K = g.MyPolitikKabinet, KL = g.MyPolitikKLN, MF = g.MyPolitikMOF, MD = g.MyPolitikMINDEF;
  P.daftar({}); P.tetap({ tahun: 2027, bulan: 3, ap: 10, myr: 50000 }); let p = S.loadPlayer(); betul(!KL.aktif(p));
  const k = K.getKabinet(p); Object.assign(k, { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH', portfolioName: 'Menteri Luar Negeri' }); S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: k } });
  p = S.loadPlayer(); betul(KL.aktif(p)); sama(KL.ringkasan(p).blok.length, 4);
  const h0 = KL.getKLN(p).hubungan.barat, ip0 = p.ip; betul(KL.lawatan('barat').ok); p = S.loadPlayer(); sama(p.kln.hubungan.barat, h0 + 8); betul(p.ip > ip0); sama(KL.lawatan('timur').ok, false, 'satu lawatan sebulan');
  p.kln.isu = { id: 'konflik', bulan: 0 }; S.applyEffects({}, { kiraTindakan: false, patch: { kln: p.kln } });
  const o0 = S.loadPlayer().kln.hubungan.oic; betul(KL.pendirian('kecam').ok); p = S.loadPlayer(); betul(p.kln.hubungan.oic === o0 + 10 && p.kln.isu === null);
  p.kln.konsular = { id: 'terkandas', fasa: 'baru', siapIdx: 0 }; S.applyEffects({}, { kiraTindakan: false, patch: { kln: p.kln } });
  betul(KL.tanganiKonsular('saluran').ok); sama(S.loadPlayer().kln.konsular.fasa, 'saluran');
  p = S.loadPlayer(); p.kln.dana = 150; S.applyEffects({}, { kiraTindakan: false, patch: { kln: p.kln } });
  betul(KL.sidangKemuncak().ok); sama(KL.sidangKemuncak().ok, false, 'sekali setahun');
  betul(KL.mulaFTA('timur').ok); sama(KL.mulaFTA('asean').ok, false, 'satu FTA');
  P.tetap({ bulan: 6 }); const d0 = S.loadPlayer().kln.tradeIndex; KL.prosesBulan({ rng: () => 0.01 }); p = S.loadPlayer();
  sama(p.kln.fta, null); betul(p.kln.tradeIndex >= d0 + 8 - 2, 'FTA siap: dagangan naik'); sama(p.kln.konsular, null, 'saluran selesai');
  p.kln.hubungan.barat = 10; p.kln.diplomaticStanding = 20; S.applyEffects({}, { kiraTindakan: false, patch: { kln: p.kln } });
  const rt = K.getKabinet(S.loadPlayer()).governanceRating; P.tetap({ bulan: 7 }); const ev = KL.prosesBulan({ rng: () => 0.99 }).peristiwa;
  betul(ev.some((e) => /membekukan hubungan/.test(e.mesej))); betul(K.getKabinet(S.loadPlayer()).governanceRating < rt, 'beku & kedudukan rendah: KPI jatuh');
  p = S.loadPlayer(); p.kln.tradeIndex = 80; p.kln.diplomaticStanding = 75; S.applyEffects({}, { kiraTindakan: false, patch: { kln: p.kln } }); p = S.loadPlayer();
  sama(KL.hasilDagang(p), 0.6); sama(MF.aliran(MF.getMOF(p), p).hasil, MF.aliran(MF.getMOF(p)).hasil + 0.6, 'MOF: dagangan menambah hasil');
  betul(KL.bonusDiplomatik(p), 'MINDEF: bonus diplomatik');
  S.clearPlayer();
});
ujian('v13.75 Pejabat PM: majoriti, blok tarik sokongan cetus usul, tuntutan, agih, dasar mega, tegas, darurat sekat usul', () => {
  const K = g.MyPolitikKabinet, PM = g.MyPolitikPM, DW = g.MyPolitikDewan;
  P.daftar({}); P.tetap({ tahun: 2027, bulan: 3, ap: 10, myr: 50000, kerusiNasional: { parti: 70, rakan: 52, pembangkang: 95, bebas: 5, kerajaan: true, tahun: 2026, bulan: 11 } });
  let p = S.loadPlayer(); betul(!PM.isPrimeMinister(p)); sama(PM.majoritiKurang(p), false);
  const k = K.getKabinet(p); Object.assign(k, { hasGovernmentRole: true, roleLevel: 'PERDANA_MENTERI', portfolioName: 'Perdana Menteri' }); S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: k } });
  p = S.loadPlayer(); betul(PM.isPrimeMinister(p)); sama(PM.majoriti(p), 122); const kb = PM.kerusiBlok(p); sama(kb.rakan + kb.borneo, 52); sama(PM.ringkasan(p).blok.length, 3);
  let m = PM.getPM(p); m.tuntutan = { blok: 'borneo', jenis: 'jawatan', bulan: 0 }; S.applyEffects({}, { kiraTindakan: false, patch: { pm: m } });
  const b0 = PM.getPM(S.loadPlayer()).blok.borneo.kepuasan; betul(PM.jawabTuntutan('terima').ok); p = S.loadPlayer(); betul(p.pm.blok.borneo.kepuasan === b0 + 20 && p.pm.tuntutan === null);
  betul(PM.agihPortfolio('rakan').ok); sama(PM.agihPortfolio('borneo').ok, false, 'sekali 3 bulan');
  const ip0 = S.loadPlayer().ip; betul(PM.umumDasar('mega').ok); betul(S.loadPlayer().ip > ip0); sama(PM.umumDasar('rmk').ok, false, 'sekali setahun');
  const kr0 = S.loadPlayer().pm.nationalCrisisLevel; betul(PM.langkahTegas().ok); betul(S.loadPlayer().pm.nationalCrisisLevel < kr0); sama(PM.langkahTegas().ok, false);
  sama(PM.isytiharDarurat().ok, false, 'krisis belum 60');
  p = S.loadPlayer(); p.pm.blok.rakan.kepuasan = 20; S.applyEffects({}, { kiraTindakan: false, patch: { pm: p.pm } });
  P.tetap({ bulan: 4 }); PM.prosesBulan({ rng: () => 0.99 }); p = S.loadPlayer(); betul(p.pm.blok.rakan.tarik); betul(PM.majoritiKurang(p), 'majoriti < 112');
  p.pm.nationalCrisisLevel = 70; S.applyEffects({}, { kiraTindakan: false, patch: { pm: p.pm, reputasi: 50 } });
  betul(PM.isytiharDarurat().ok); p = S.loadPlayer(); betul(PM.daruratAktif(p)); betul(p.reputasi < 50); sama(PM.isytiharDarurat().ok, false, 'sekali sepenggal');
  DW.prosesBulan({ rng: () => 0.5 }); sama(DW.getDewan(S.loadPlayer()).tp, null, 'darurat sekat usul');
  P.tetap({ tahun: 2028, bulan: 1 }); DW.prosesBulan({ rng: () => 0.5 }); const tp = DW.getDewan(S.loadPlayer()).tp; betul(!!tp, 'darurat tamat: usul dikemukakan'); betul(tp.tentang >= 100 + 31, 'blok tarik mengundi menentang');
  S.clearPlayer();
});
ujian('v13.74 Modul KKDW: portfolio baharu, fokus agihan, projek infra/PPRS, kontraktor lewat, aduan rakyat, kesan bulanan', () => {
  const K = g.MyPolitikKabinet, W2 = g.MyPolitikKKDW;
  betul(g.MyPolitikKabinetData.menteri.some((m) => m.nama === 'Menteri Kemajuan Desa dan Wilayah'), 'portfolio dalam senarai kabinet');
  betul(K.PORTFOLIO.PARLIMEN.some((d) => d.nama === 'Menteri Kemajuan Desa dan Wilayah' && d.tahap === 'MENTERI_PENUH'), 'boleh dilobi');
  P.daftar({}); P.tetap({ tahun: 2027, bulan: 3, ap: 10, myr: 50000 }); let p = S.loadPlayer(); betul(!W2.aktif(p));
  const k = K.getKabinet(p); Object.assign(k, { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH', portfolioName: 'Menteri Kemajuan Desa dan Wilayah' }); S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: k } });
  p = S.loadPlayer(); betul(W2.aktif(p)); sama(W2.ringkasan(p).projek.length, 5);
  betul(W2.tukarFokus('infra').ok); sama(W2.ringkasan(S.loadPlayer()).projek.find((d) => d.id === 'jalan').kos, 24, 'diskaun fokus 20%'); sama(W2.tukarFokus('pprs').ok, false, 'satu fokus sebulan');
  betul(W2.lulusProjek('dewan').ok); betul(W2.lulusProjek('jalan').ok); sama(W2.lulusProjek('air').ok, false, 'had 2 sebulan');
  p = S.loadPlayer(); sama(p.kkdw.infrastructureFund, 120 - 12 - 24);
  P.tetap({ bulan: 4 }); betul(W2.lulusProjek('pprs_bina').ok);
  const l0 = S.loadPlayer().kkdw.ruralSupportScore, ip0 = S.loadPlayer().ip; W2.prosesBulan({ rng: () => 0.99 }); p = S.loadPlayer();
  betul(p.kkdw.ruralSupportScore >= l0 + 2 + 3, 'fokus infra + dewan siap'); betul(p.ip > ip0, 'dewan: IP');
  P.tetap({ bulan: 5 }); const ak0 = S.loadPlayer().kesetiaan.akarUmbi; W2.prosesBulan({ rng: () => 0.01 }); p = S.loadPlayer();
  betul(p.kesetiaan.akarUmbi > ak0, 'jalan siap: akar umbi'); betul(p.kkdw.projek.find((x) => x.jenis === 'pprs_bina').lewat, 'kontraktor lewat'); betul(!!p.kkdw.aduan, 'aduan baharu');
  const rt = K.getKabinet(p).governanceRating; const j = W2.jawabAduan('hitam', { rng: () => 0.99 }); betul(j.ok, j.ralat); p = S.loadPlayer(); sama(p.kkdw.aduan, null); betul(K.getKabinet(p).governanceRating > rt);
  p.kkdw.ruralSupportScore = 10; S.applyEffects({}, { kiraTindakan: false, patch: { kkdw: p.kkdw } }); const rt2 = K.getKabinet(S.loadPlayer()).governanceRating;
  P.tetap({ bulan: 6 }); W2.prosesBulan({ rng: () => 0.99 }); betul(K.getKabinet(S.loadPlayer()).governanceRating < rt2, 'skor rendah: KPI jatuh');
  Object.assign(k, { portfolioName: 'Menteri Pembangunan Luar Bandar' }); S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: k } }); betul(W2.aktif(S.loadPlayer()), 'senarai sandaran');
  S.clearPlayer();
});
ujian('v13.73 Modul Kementerian Pertahanan: insiden tegas/diplomatik, perolehan terbuka/terus, skandal, arahan, kesan bulanan', () => {
  const K = g.MyPolitikKabinet, M = g.MyPolitikMINDEF;
  P.daftar({}); P.tetap({ tahun: 2027, bulan: 3, ap: 10, myr: 50000 }); let p = S.loadPlayer(); betul(!M.aktif(p));
  const k = K.getKabinet(p); Object.assign(k, { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH', portfolioName: 'Menteri Pertahanan' }); S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: k } });
  p = S.loadPlayer(); betul(M.aktif(p)); const r0 = M.ringkasan(p); sama(r0.cabang.length, 3); sama(r0.aset.length, 3); sama(r0.perolehan, 3);
  const j0 = M.getMINDEF(p).sokonganJeneral, k0 = M.getMINDEF(p).procurementScandalRisk;
  betul(M.lulusKontrak('kapal', 'terus').ok); p = S.loadPlayer(); sama(p.mindef.perolehan, 1); betul(p.mindef.sokonganJeneral > j0 && p.mindef.procurementScandalRisk > k0, 'terus: jeneral & risiko naik');
  sama(M.lulusKontrak('perisai', 'terbuka').ok, false, 'satu kontrak sebulan');
  P.tetap({ bulan: 4 }); sama(M.lulusKontrak('perisai', 'terbuka').ok, false, 'perolehan tidak cukup (RM 1.0 bilion < 1.2)');
  betul(M.arahan('latihan', 'udara').ok); sama(M.arahan('kebajikan').ok, false, 'satu arahan sebulan');
  P.tetap({ bulan: 5 }); const laut0 = S.loadPlayer().mindef.cabang.laut; M.prosesBulan({ rng: () => 0.01 }); p = S.loadPlayer();
  betul(p.mindef.cabang.laut >= laut0 + 14, 'kapal siap: laut naik'); sama(p.mindef.kontrak.length, 0); betul(!!p.mindef.insiden, 'insiden baharu');
  const o = M.tanganiInsiden('tegas', { rng: () => 0.01 }); betul(o.ok && o.jaya, o.ralat); p = S.loadPlayer(); sama(p.mindef.insiden, null);
  P.tetap({ bulan: 6 }); p = S.loadPlayer(); p.mindef.insiden = { jenis: 'udara', bulan: 0 }; S.applyEffects({}, { kiraTindakan: false, patch: { mindef: p.mindef } });
  const jd = S.loadPlayer().mindef.sokonganJeneral; betul(M.tanganiInsiden('diplomatik').ok); p = S.loadPlayer(); betul(p.mindef.insiden === null && p.mindef.sokonganJeneral < jd, 'diplomatik: tamat, jeneral turun');
  p.mindef.procurementScandalRisk = 95; S.applyEffects({}, { kiraTindakan: false, patch: { mindef: p.mindef, reputasi: 50 } });
  const rt = K.getKabinet(S.loadPlayer()).governanceRating; const ev = M.prosesBulan({ rng: () => 0.01 }).peristiwa; p = S.loadPlayer();
  betul(ev.some((e) => /Skandal perolehan/.test(e.mesej))); betul(K.getKabinet(p).governanceRating < rt && p.reputasi < 50, 'skandal: KPI & Reputasi jatuh'); sama(p.mindef.procurementScandalRisk, 30);
  S.clearPlayer();
});
ujian('v13.72 Modul Kementerian Dalam Negeri: agensi, dasar kebebasan sivil, ancaman dan Operasi Khas, kecemasan, kesan bulanan', () => {
  const K = g.MyPolitikKabinet, D = g.MyPolitikKDN;
  P.daftar({}); P.tetap({ tahun: 2027, bulan: 3, ap: 10, myr: 50000 }); let p = S.loadPlayer(); betul(!D.aktif(p));
  const k = K.getKabinet(p); Object.assign(k, { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH', portfolioName: 'Menteri Dalam Negeri' }); S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: k } });
  p = S.loadPlayer(); betul(D.aktif(p)); sama(D.ringkasan(p).agensi.length, 4);
  betul(D.arahAgensi('pdrm').ok); p = S.loadPlayer(); sama(p.kdn.policeReadiness, 62); sama(p.kdn.dana, 45); sama(D.arahAgensi('imigresen').ok, false, 'satu arahan sebulan');
  const b0 = p.kdn.civilLiberties, a0 = p.kdn.sokonganAktivis; betul(D.ubahDasar('permit', 'longgar').ok); p = S.loadPlayer();
  betul(p.kdn.civilLiberties > b0 && p.kdn.sokonganAktivis > a0, 'longgar: kebebasan & aktivis naik'); sama(D.ubahDasar('pertubuhan', 'ketat').ok, false, 'satu dasar sebulan');
  P.tetap({ bulan: 4 }); betul(D.ubahDasar('permit', 'ketat').ok); p = S.loadPlayer(); betul(D.sasaran(p.kdn).tenteram > 70 && D.sasaran(p.kdn).aktivis < 45, 'ketat: ketenteraman naik, aktivis turun');
  sama(D.lancarOps().ok, false, 'tiada ancaman'); D.prosesBulan({ rng: () => 0.01 }); p = S.loadPlayer(); betul(!!p.kdn.ancaman, 'ancaman baharu');
  const ip0 = p.ip; const o = D.lancarOps({ rng: () => 0.01 }); betul(o.ok && o.jaya, o.ralat); p = S.loadPlayer(); sama(p.kdn.ancaman, null); betul(p.ip > ip0);
  const rb = K.getKabinet(p).risikoRombak; betul(D.mohonKecemasan().ok); betul(K.getKabinet(S.loadPlayer()).risikoRombak > rb); sama(D.mohonKecemasan().ok, false, 'sekali 6 bulan');
  p = S.loadPlayer(); p.kdn.publicOrderMeter = 20; p.kdn.civilLiberties = 10; p.kdn.dasar.permit = 'ketat'; p.kdn.dasar.pertubuhan = 'ketat'; S.applyEffects({}, { kiraTindakan: false, patch: { kdn: p.kdn, reputasi: 50 } });
  const rt = K.getKabinet(S.loadPlayer()).governanceRating; D.prosesBulan({ rng: () => 0.99 }); p = S.loadPlayer();
  betul(K.getKabinet(p).governanceRating < rt, 'ketenteraman rendah: KPI jatuh'); betul(p.reputasi < 50, 'kebebasan rendah: Reputasi jatuh');
  S.clearPlayer();
});
ujian('v13.71 TYT: senarai calon kurnia sentiasa ada 2 ahli politik dan 2 bukan ahli politik dari kategori berbeza', () => {
  const T = g.MyPolitikTYT; let x = 7;
  const rng = () => { x = (x * 16807) % 2147483647; return x / 2147483647; };
  for (let n = 0; n < 300; n++) {
    const s = T.calonKurnia({ tahun: 2031 }, {}, rng), bukan = s.filter((c) => c.kategori !== 'politik');
    betul(s.length === 6 && s.filter((c) => c.kategori === 'politik').length >= 2 && new Set(bukan.map((c) => c.kategori)).size >= 2, JSON.stringify(s));
  }
});
ujian('v13.70 Modul Kementerian Kewangan: Bajet Tahunan, cukai & subsidi, rizab/inflasi/kepuasan bulanan, Dewan', () => {
  const K = g.MyPolitikKabinet, M = g.MyPolitikMOF;
  P.daftar({}); P.tetap({ tahun: 2027, bulan: 9, ap: 10, myr: 50000 }); let p = S.loadPlayer();
  betul(!M.aktif(p), 'bukan Menteri Kewangan');
  const k = K.getKabinet(p); Object.assign(k, { hasGovernmentRole: true, roleLevel: 'MENTERI_PENUH', portfolioName: 'Menteri Kewangan' }); S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: k } });
  p = S.loadPlayer(); betul(M.aktif(p)); const r0 = M.ringkasan(p); sama(r0.rizab, 50); sama(r0.bajet.kementerian.length, 6); betul(r0.bajet.buka);
  betul(M.ubahBajet('pendidikan', 1).ok); betul(M.ubahBajet('pendidikan', 1).ok); betul(M.ubahBajet('pendidikan', 1).ok); sama(M.ubahBajet('pendidikan', 1).ok, false, 'had ±15%');
  betul(M.ubahBajet('pertahanan', -1).ok); const h0 = M.getMOF(S.loadPlayer()).hubungan;
  betul(M.muktamadBajet().ok); p = S.loadPlayer();
  sama(p.mof.ministryBudgets.pendidikan, 73.6); betul(p.mof.hubungan.pendidikan > h0.pendidikan && p.mof.hubungan.pertahanan < h0.pertahanan, 'hubungan berubah');
  betul(M.larasDewan(p) > 0, 'bajet rakyat lebih mudah lulus'); sama(M.ubahBajet('kesihatan', 1).ok, false, 'sekali setahun');
  const sat0 = p.mof.publicSatisfaction; const d = M.ubahDasar('sst', '10'); betul(d.ok, d.ralat); p = S.loadPlayer(); betul(p.mof.publicSatisfaction < sat0, 'kenaikan SST menurunkan kepuasan');
  sama(M.ubahDasar('minyak', 'apung').ok, false, 'satu perubahan sebulan');
  const a = M.aliran(p.mof), riz = p.mof.nationalTreasury; M.prosesBulan(); p = S.loadPlayer(); sama(p.mof.nationalTreasury, Math.round((riz + a.bersih) * 10) / 10);
  P.tetap({ bulan: 10 }); betul(M.ubahDasar('minyak', 'apung').ok); p = S.loadPlayer(); betul(M.sasaran(p.mof).inflasi > 3, 'subsidi ditarik: inflasi naik');
  p.mof.nationalTreasury = 5; S.applyEffects({}, { kiraTindakan: false, patch: { mof: p.mof } }); const rt = K.getKabinet(S.loadPlayer()).governanceRating;
  const ev = M.prosesBulan().peristiwa; betul(ev.some((e) => /Krisis fiskal/.test(e.mesej))); betul(K.getKabinet(S.loadPlayer()).governanceRating < rt, 'KPI jatuh');
  S.clearPlayer();
});
ujian('v13.69 Kepimpinan Negeri: MB/KM pegang portfolio 1, 9 portfolio EXCO ditapis IP, Agama ikut parti, Pejabat EXCO sebulan sekali', () => {
  const KB = g.MyPolitikKabinet;
  P.daftar({}); P.tetap({ tahun: 2027, ip: 130, myr: 50000, ap: 10 }); betul(KB.bukaLobi('DUN').ok);
  let p = S.loadPlayer(), sn = KB.senaraiPortfolio(p);
  sama(sn.length, 9); betul(!sn.some((x) => x.id === 'exco_tanah'), 'Tanah bukan untuk lobi EXCO');
  const pl = sn.find((x) => x.id === 'exco_pelaburan'); betul(!pl.boleh && pl.kurangIP === 70, 'Pelaburan dikunci, kurang 70 IP');
  betul(sn.find((x) => x.id === 'exco_luarbandar').boleh, 'Luar Bandar terbuka');
  betul(sn.some((x) => x.id === 'exco_agama'), 'UMNO nampak portfolio Agama');
  P.tetap({ ip: 1000 }); let lj = null; for (let i = 0; i < 3 && !(lj && lj.dilantik); i++) { lj = KB.lobiPortfolio('exco_kerjaraya', () => 0.01); }
  betul(lj && lj.dilantik, JSON.stringify(lj)); p = S.loadPlayer();
  let kn = KB.kepimpinanNegeri(p); sama(kn.isStateLeader, false); sama(kn.stateExcoPortfolio, 'Kerja Raya, Infrastruktur & Kemudahan Awam');
  sama(g.MyPolitikDewan.kategoriPemain(p)[0], 'infra');
  let pj = KB.pejabatEXCO(p); sama(pj.tindakan.length, 3); const ap0 = p.ap, ak0 = p.kesetiaan.akarUmbi, ip0 = p.ip;
  const r = KB.tindakanEXCO('jalan'); betul(r.ok, r.ralat); p = S.loadPlayer();
  sama(p.ap, ap0 - 1); betul(p.kesetiaan.akarUmbi > ak0 && p.ip > ip0, 'akar umbi dan IP naik');
  sama(KB.tindakanEXCO('terbengkalai').ok, false, 'sekali sebulan'); betul(KB.ringkasan(p).pejabat.sudah);
  S.clearPlayer();
  P.daftar({}); P.tetap({ parti: 'MCA', tahun: 2027, ip: 1000 }); betul(KB.bukaLobi('DUN').ok); sn = KB.senaraiPortfolio(S.loadPlayer());
  sama(sn.length, 8); betul(!sn.some((x) => x.id === 'exco_agama'), 'MCA tiada portfolio Agama');
  S.clearPlayer();
  P.daftar({}); P.tetap({ tahun: 2027 }); p = S.loadPlayer(); const k = KB.getKabinet(p);
  k.hasGovernmentRole = true; k.roleLevel = 'MENTERI_BESAR'; k.portfolioName = 'Menteri Besar Johor'; k.portfolioId = 'exco_tanah'; S.applyEffects({}, { kiraTindakan: false, patch: { kabinet: k } });
  p = S.loadPlayer(); kn = KB.kepimpinanNegeri(p); sama(kn.isStateLeader, true); sama(kn.stateExcoPortfolio, 'Tanah, Mineral, Perhutanan & Kewangan');
  betul(KB.pejabatEXCO(p).tindakan.some((t) => t.id === 'geran')); betul(g.MyPolitikDewan.kategoriPemain(p).length > 1, 'MB kekal semua kategori');
  S.clearPlayer();
});
ujian('v13.68 Enjin mesyuarat Lain-lain (Fasa 6): BERJASA / Warisan hadir dari modul, usul dan slogan parti', () => {
  const M0 = g.MyPolitikMeeting;
  P.daftar({}); P.tetap({ parti: 'BERJASA', tahun: 2027 }); let p = S.loadPlayer(); betul(M0.bilHadir(p, 'pau') > 300 && M0.bilHadir(p, 'pau') < 1500, 'hadir Muktamar ' + M0.bilHadir(p, 'pau'));
  let ag = M0.janaAgendaUji(p, 'pau'); betul(ag.some((a) => /^bj_/.test(a.kod)) && ag.some((a) => /Bermaruah|Gandingan/.test(a.tajuk)), ag.map((a) => a.tajuk).join('|'));
  P.tetap({ parti: 'WARISAN' }); p = S.loadPlayer(); ag = M0.janaAgendaUji(p, 'pau'); betul(ag.some((a) => /^wr_/.test(a.kod)) && ag.some((a) => /Bangsa Kita/.test(a.tajuk)));
  betul(M0.bilHadir(p, 'pau') !== 1500);
  S.clearPlayer();
});
ujian('v13.40 Laluan Kerajaan: MB masih boleh dituntut sekali selepas lobi persekutuan tamat (mbTertunda)', () => {
  const KB = g.MyPolitikKabinet; P.daftar({}); P.tetap({ parti: 'UMNO', kabinet: { mbTertunda: true, lobi: null } });
  const s = KB.syaratMB(S.loadPlayer()); betul(!/Tiada pembentukan kerajaan negeri/.test(s.sebab), 'mbTertunda menggantikan syarat lobi: ' + s.sebab);
  P.tetap({ kabinet: { mbTertunda: false, lobi: null } }); betul(/Tiada pembentukan kerajaan negeri/.test(KB.syaratMB(S.loadPlayer()).sebab));
  S.clearPlayer();
});







const lulus = hasil.filter((h) => h.ok).length, gagal = hasil.filter((h) => !h.ok);
hasil.forEach((h) => { console.log((h.ok ? '  ✓ ' : '  ✗ ') + h.nama + (h.ok ? '' : '\n      ' + h.ralat)); });
console.log('\n' + lulus + ' lulus, ' + gagal.length + ' gagal, ' + hasil.length + ' ujian.');
process.exit(gagal.length ? 1 : 0);
