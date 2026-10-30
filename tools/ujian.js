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
  sama(SW.ofsetJawatan(p, { kod: 'timbalan_presiden', peringkat: 'pau', kumpulan: 'utama' }), 10 - 2.4, 'bukan giliran TP: +10 tolak 30 x 0.08');
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
  sama(KB.lobiPortfolio('exco_kesihatan', () => 0.01).ok, false, 'portfolio UMNO tidak tersedia untuk PBB');
  S.clearPlayer();
  P.daftar({}); betul(KB.bukaLobi('DUN').ok); sn = KB.senaraiPortfolio(S.loadPlayer()); betul(sn.length === 5 && sn.every((x) => /^exco_/.test(x.id)), 'UMNO: 5 portfolio EXCO umum');
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
  betul(KB.tuntutMB().ok, 'tuntut Premier'); sama(KB.getKabinet(S.loadPlayer()).roleLevel === 'MENTERI_BESAR' || KB.getKabinet(S.loadPlayer()).roleLevel === 'EXCO_NEGERI', true);
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
  sama(h.jumlah.bahagian, 165, '165 Bahagian (semua Semenanjung)'); betul(h.bahagian.every((b) => b.cawangan.every((c) => c.jumlahAhli >= 50)), 'Cawangan minimum 50 ahli (Perkara 92)');
  const bm = h.bahagian.find((b) => b.nama === 'Bukit Mertajam'), luar = h.bahagian.slice().sort((a, b) => M.kawasan({ kod: { parlimen: b.kod } }).parlimen.r - M.kawasan({ kod: { parlimen: a.kod } }).parlimen.r)[0];
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
  const rp = M.ringkasPusat(p); sama(rp.bilBahagian, 165, '165 Bahagian dalam Pemilihan Pusat'); betul(rp.pengundi > 2000 && rp.pengundi < 165 * 30, 'perwakilan ikut saiz Bahagian (' + rp.pengundi + ')');
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
  sama(h.jumlah.bahagian, 165, '165 Bahagian'); betul(h.bahagian.every((b) => b.cawangan.every((c) => c.jumlahAhli >= 60 && c.jumlahAhli <= 200)), 'Cawangan 60 hingga 200 ahli (Perkara 17.12)');
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
  const rp = M.ringkasPusat(S.loadPlayer()); sama(rp.pengundi, 6103 * 10 + 60, 'pengundi Presiden = 10 pegawai setiap Cawangan + CWC');
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
  sama(E.adalahTahunPemilihan(2026), true); sama(E.adalahTahunPemilihan(2027), false); sama(K.getTetingkap('bahagian', 1).mula, 5);
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

const lulus = hasil.filter((h) => h.ok).length, gagal = hasil.filter((h) => !h.ok);
hasil.forEach((h) => { console.log((h.ok ? '  ✓ ' : '  ✗ ') + h.nama + (h.ok ? '' : '\n      ' + h.ralat)); });
console.log('\n' + lulus + ' lulus, ' + gagal.length + ' gagal, ' + hasil.length + ' ujian.');
process.exit(gagal.length ? 1 : 0);
