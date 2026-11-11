/* ==========================================================================
   Nusa Politik — js/sarawak-premier.js   (v13.82)
   Pejabat Premier Sarawak (takrif untuk enjin generik js/kementerian.js), mockup dipersetujui.
   Hanya untuk Premier Sarawak (roleLevel MENTERI_BESAR, parti Sarawak). Syarat jawatan Premier dan 8 Menteri Negeri Sarawak sedia ada.
   p.premier: 5 perkara agenda MA63 (formula geran khas, autonomi kesihatan, autonomi pendidikan, kuasa alam sekitar,
   pemilikan entiti strategik), perpaduan GPS, hubungan dengan Persekutuan, dana negeri (RM 50 juta sebulan, had RM 300 juta).
   Agenda MA63 berunding perkara demi perkara: pilih fokus (satu perubahan sebulan), satu tindakan sebulan memajukan perkara itu;
   perkara selesai (100) memberi ganjaran kekal dan tidak boleh difokus lagi.
   Perpaduan GPS: satu tindakan sebulan; isu rawak. Perpaduan < 30 = KPI −5; perpaduan 0 = GPS pecah, Premier hilang jawatan.
   Hubungan < 30 = dana −RM 20 juta sebulan; hubungan >= 70 = perkara difokus +2 sebulan.
   ANDAIAN: semua nilai ialah anggaran permainan; perkara MA63 dirujuk dengan nama umum tanpa angka sebenar.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var KM = root.MyPolitikKementerian || (typeof require === 'function' ? require('./kementerian.js') : null);
  var api = factory(root, KM);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikSarawakPremier = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root, KM) {
  'use strict';
  function KB() { return root.MyPolitikKabinet || (typeof require === 'function' ? require('./kabinet.js') : null); }
  var HUB_RENDAH = 30, HUB_TINGGI = 70, POTONG = 20, TEKANAN_MIN = 50;
  var PERKARA = {
    geran: { nama: 'Formula geran khas', ganjaran: { danaTambah: 30 }, mesej: 'dana negeri +RM 30 juta sebulan (kekal)' },
    kesihatan: { nama: 'Autonomi kesihatan', ganjaran: { pop: 3, akar: 3 }, mesej: 'populariti +3, akar umbi +3' },
    pendidikan: { nama: 'Autonomi pendidikan', ganjaran: { ip: 40 }, mesej: 'IP +40' },
    alam: { nama: 'Kuasa alam sekitar', ganjaran: { hubungan: 5 }, mesej: 'hubungan Persekutuan +5' },
    entiti: { nama: 'Pemilikan entiti strategik', ganjaran: { danaTambah: 20 }, mesej: 'dana negeri +RM 20 juta sebulan (kekal)' }
  };
  function meterPerkara(nama, awal) { return { nama: nama, awal: awal, min: 0, maks: 100, asas: 0, alir: 0 }; }
  function selesai(m, k) { return (m.selesai || []).indexOf(k) >= 0; }
  var api = KM.cipta({
    kunci: 'premier', tab: '🦅 Pejabat Premier', pejabat: 'Pejabat Premier', ralat: 'Hanya Premier Sarawak.', tanpaBonus: true,
    aktif: function (p, k) { var K = KB(); return !!(k.hasGovernmentRole && k.roleLevel === 'MENTERI_BESAR' && K && K.SW && K.SW(p.parti)); },
    meter: {
      perpaduan: { nama: 'Perpaduan GPS', awal: 63, min: 0, maks: 100, asas: 58, alir: 0.08, nota: 'PBB, PRS, SUPP, PDP', bahaya: function (v) { return v < 30; } },
      hubungan: { nama: 'Hubungan dengan Persekutuan', awal: 58, min: 0, maks: 100, asas: 55, alir: 0.08, bahaya: function (v) { return v < HUB_RENDAH; } },
      geran: meterPerkara('Formula geran khas', 30),
      kesihatan: meterPerkara('Autonomi kesihatan', 20),
      pendidikan: meterPerkara('Autonomi pendidikan', 15),
      alam: meterPerkara('Kuasa alam sekitar', 40),
      entiti: meterPerkara('Pemilikan entiti strategik', 5)
    },
    dana: { awal: 160, bulan: 50, had: 300 },
    ubahDana: function (tambah, m) { return m.hubungan < HUB_RENDAH ? tambah - POTONG : tambah; },
    kumpulan: { ma63: 'Agenda MA63 Sarawak', gps: 'Perpaduan GPS' },
    dasar: {
      fokus: { nama: 'Fokus rundingan MA63', ikon: '🎯', lalai: 'geran', pilihan: Object.keys(PERKARA).map(function (k) { return { id: k, label: PERKARA[k].nama }; }) }
    },
    sahDasar: function (kod, id, m) { return kod === 'fokus' && selesai(m, id) ? 'Perkara ini sudah selesai.' : ''; },
    tindakan: [
      { id: 'runding', kumpulan: 'ma63', ikon: '🤝', nama: 'Rundingan jawatankuasa MA63 dengan Persekutuan', kos: 0, ap: 1, kesan: { ma63: 10 }, mesej: 'Jawatankuasa MA63 bersidang.' },
      { id: 'tekanan', kumpulan: 'ma63', ikon: '🦅', nama: 'Tekanan GPS bersatu', kos: 0, kesan: { ma63: 8, hubungan: -6 }, mesej: 'GPS bersatu menekan Persekutuan.' },
      { id: 'ordinan', kumpulan: 'ma63', ikon: '📜', nama: 'Pinda ordinan negeri', kos: 20, peluang: 0.6, kesan: { ma63: 12, hubungan: -4 }, gagal: { ma63: 3, hubungan: -4 }, mesej: 'Ordinan negeri dipinda: hak negeri diperkukuh.', mesejGagal: 'Pindaan ordinan dipertikai: kemajuan kecil sahaja.' },
      { id: 'mesyuarat', kumpulan: 'gps', ikon: '🏛️', nama: 'Mesyuarat Majlis Tertinggi GPS', kos: 5, kesan: { perpaduan: 5 } },
      { id: 'agih', kumpulan: 'gps', ikon: '🎁', nama: 'Agih peruntukan kepada parti komponen', kos: 25, selang: 3, kesan: { perpaduan: 10 } },
      { id: 'kempen', kumpulan: 'gps', ikon: '📣', nama: 'Kempen “Sarawak First”', kos: 0, kesan: { perpaduan: 3, pop: 2, hubungan: -3 } }
    ],
    ubahKesan: function (t, m) {                                                       // 'ma63' dipetakan ke perkara yang difokus
      if (!t.kesan || t.kesan.ma63 == null) { return t.kesan; }
      var x = {}, f = m.dasar.fokus, k;
      for (k in t.kesan) { if (k !== 'ma63') { x[k] = t.kesan[k]; } }
      var n = t.kesan.ma63; if (t.id === 'runding' && m.hubungan < 50) { n = Math.round(n / 2); }
      x[f] = n; return x;
    },
    sebabTambahan: function (t, m) {
      if (t.kumpulan === 'ma63' && selesai(m, m.dasar.fokus)) { return 'Perkara yang difokus sudah selesai; tukar fokus rundingan.'; }
      if (t.id === 'tekanan' && m.perpaduan < TEKANAN_MIN) { return 'Tekanan GPS hanya jika perpaduan GPS ' + TEKANAN_MIN + ' ke atas.'; }
      return '';
    },
    isuPeluang: function (m) { return m.perpaduan < 30 ? 0.4 : 0.2; },
    isu: {
      kerusi: { ikon: '⚡', nama: 'Parti komponen GPS bertelagah soal agihan kerusi PRN', abai: { perpaduan: -5 }, pilihan: [
        { id: 'pengantara', ikon: '🤝', label: 'Pengantaraan Premier', kos: 10, peluang: 0.7, kekalJikaGagal: true, kesan: { perpaduan: 6 }, gagal: {}, mesej: 'Pengantaraan Premier meredakan pertelingkahan.', mesejGagal: 'Pengantaraan belum berhasil; parti komponen masih bertegang.' },
        { id: 'formula', ikon: '⚖️', label: 'Formula kerusi berasaskan prestasi', kesan: { perpaduan: 3, akar: -2 }, mesej: 'Formula kerusi berasaskan prestasi dipersetujui.' },
        { id: 'muktamad', ikon: '✋', label: 'Keputusan muktamad Premier', peluang: 0.5, kesan: { perpaduan: 4 }, gagal: { perpaduan: -8 }, mesej: 'Parti komponen menerima keputusan Premier.', mesejGagal: 'Keputusan Premier ditentang; GPS bertambah retak.' }] },
      sumber: { ikon: '🛢️', nama: 'Pertikaian hak sumber dengan syarikat minyak nasional', abai: { hubungan: -3 }, pilihan: [
        { id: 'runding', ikon: '🤝', label: 'Rundingan peringkat tertinggi', kesan: { hubungan: 4, entiti: 4 }, mesej: 'Rundingan mencapai persefahaman sementara.' },
        { id: 'ordinan', ikon: '📜', label: 'Kuatkuasakan ordinan negeri', peluang: 0.6, kesan: { entiti: 8, hubungan: -6 }, gagal: { hubungan: -6 }, mesej: 'Ordinan negeri dikuatkuasakan: hak negeri ditegaskan.', mesejGagal: 'Pertikaian dibawa ke mahkamah; hubungan tegang.' }] },
      lewat: { ikon: '⏳', nama: 'Peruntukan Persekutuan untuk projek Sarawak lewat', abai: { perpaduan: -2 }, pilihan: [
        { id: 'dana', ikon: '💰', label: 'Biayai dengan dana negeri dahulu', kos: 30, kesan: { perpaduan: 3, pop: 1 }, mesej: 'Projek diteruskan dengan dana negeri.' },
        { id: 'desak', ikon: '📢', label: 'Desak Persekutuan secara terbuka', kesan: { hubungan: -4, pop: 2 }, mesej: 'Premier mendesak Persekutuan menyalurkan peruntukan.' }] }
    },
    akibat: [
      { meter: 'perpaduan', bawah: 30, kesan: { rating: -5 }, mesej: 'GPS retak: parti komponen mula berbincang dengan pembangkang (KPI −5).' }
    ],
    bulanan: function (m, p, ctx, ev) {
      if (m.hubungan >= HUB_TINGGI && !selesai(m, m.dasar.fokus)) { m[m.dasar.fokus] = Math.min(100, m[m.dasar.fokus] + 2); }
      m.selesai = m.selesai || [];
      Object.keys(PERKARA).forEach(function (k) {
        if (m[k] >= 100 && m.selesai.indexOf(k) < 0) {
          var G = PERKARA[k].ganjaran; m.selesai.push(k);
          if (G.danaTambah) { m.danaTambah = (m.danaTambah || 0) + G.danaTambah; }
          if (G.hubungan) { m.hubungan = Math.min(100, m.hubungan + G.hubungan); }
          if (G.pop) { ctx.d.pop = (ctx.d.pop || 0) + G.pop; }
          if (G.ip) { ctx.kes.ip = (ctx.kes.ip || 0) + G.ip; }
          if (G.akar) { ctx.kes.kesetiaan = { akarUmbi: ((ctx.kes.kesetiaan && ctx.kes.kesetiaan.akarUmbi) || 0) + G.akar }; }
          ev.push({ jenis: 'kabinet', mesej: 'Perkara MA63 selesai: ' + PERKARA[k].nama + ' (' + PERKARA[k].mesej + ').' });
        }
      });
      if (m.perpaduan <= 0) {
        ctx.selepas.push(function () { var K = KB(); return K && K.lucutJawatan ? K.lucutJawatan('GPS pecah dan Premier hilang sokongan majoriti ADUN.') : null; });
      }
    }
  });
  api.PERKARA = PERKARA;
  return api;
});
