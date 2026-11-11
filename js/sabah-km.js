/* ==========================================================================
   Nusa Politik — js/sabah-km.js   (v13.81)
   Pejabat Ketua Menteri Sabah (takrif untuk enjin generik js/kementerian.js), mockup dipersetujui.
   Hanya untuk Ketua Menteri Sabah (roleLevel MENTERI_BESAR, negeri Sabah, bukan parti Sarawak).
   p.sabahkm: kemajuan tuntutan MA63 (hak 40% hasil), kestabilan kerajaan negeri (sokongan ADUN), hubungan dengan Persekutuan,
   dana negeri (RM 40 juta sebulan; +RM 30 juta kekal setiap kali tuntutan selesai; tertangguh jika hubungan < 30).
   Tuntutan MA63 (satu sebulan): rundingan (1 AP), tekanan politik, laluan undang-undang (50%). Kemajuan 100 = pelan pembayaran
   dipersetujui (dana kekal +30, populariti +5, IP +50), kemudian tuntutan seterusnya bermula.
   Kestabilan (satu sebulan): tawar jawatan (sekali 3 bulan), majlis bersama ADUN, pembangunan kawasan ADUN.
   Isu: khabar ADUN menarik sokongan (lebih kerap bila kestabilan < 30). Kestabilan < 30 = KPI −5; kestabilan 0 = hilang jawatan.
   ANDAIAN: semua nilai ialah anggaran permainan. MA63 dan "hak 40% hasil" dirujuk dengan nama sebenar tanpa angka sebenar dan
   tanpa meramal keputusan mahkamah.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var KM = root.MyPolitikKementerian || (typeof require === 'function' ? require('./kementerian.js') : null);
  var api = factory(root, KM);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikSabahKM = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root, KM) {
  'use strict';
  function KB() { return root.MyPolitikKabinet || (typeof require === 'function' ? require('./kabinet.js') : null); }
  var SELESAI = { dana: 30, pop: 5, ip: 50 }, HUB_RENDAH = 30, HUB_TINGGI = 70, POTONG = 20;
  return KM.cipta({
    kunci: 'sabahkm', tab: '🌴 Pejabat Ketua Menteri', pejabat: 'Pejabat Ketua Menteri', ralat: 'Hanya Ketua Menteri Sabah.', tanpaBonus: true,
    aktif: function (p, k) { var K = KB(); return !!(k.hasGovernmentRole && k.roleLevel === 'MENTERI_BESAR' && K && K.SB && K.SB(p)); },
    meter: {
      ma63: { nama: 'Kemajuan tuntutan MA63 (hak 40% hasil)', awal: 30, min: 0, maks: 100, asas: 0, alir: 0 },
      kestabilan: { nama: 'Kestabilan kerajaan negeri', awal: 58, min: 0, maks: 100, asas: 55, alir: 0.08, nota: 'sokongan ADUN', bahaya: function (v) { return v < 30; } },
      hubungan: { nama: 'Hubungan dengan Persekutuan', awal: 60, min: 0, maks: 100, asas: 55, alir: 0.08, bahaya: function (v) { return v < HUB_RENDAH; } }
    },
    dana: { awal: 90, bulan: 40, had: 250 },
    ubahDana: function (tambah, m) { return m.hubungan < HUB_RENDAH ? tambah - POTONG : tambah; },   // peruntukan Persekutuan tertangguh
    kumpulan: { ma63: 'Tuntutan MA63', stabil: 'Mengurus kestabilan' },
    tindakan: [
      { id: 'runding', kumpulan: 'ma63', ikon: '🤝', nama: 'Rundingan dengan Persekutuan', kos: 0, ap: 1, kesan: { ma63: 6 }, mesej: 'Rundingan MA63 dengan Persekutuan diadakan.' },
      { id: 'tekanan', kumpulan: 'ma63', ikon: '📢', nama: 'Tekanan politik: “Sabah untuk Sabahan”', kos: 0, kesan: { ma63: 4, pop: 3, hubungan: -8 }, mesej: 'Kerajaan negeri menekan Persekutuan secara terbuka.' },
      { id: 'mahkamah', kumpulan: 'ma63', ikon: '🏛️', nama: 'Laluan undang-undang', kos: 20, peluang: 0.5, kesan: { ma63: 10, hubungan: -4 }, gagal: { ma63: 2, hubungan: -4 }, mesej: 'Hujah undang-undang negeri diterima: tuntutan maju.', mesejGagal: 'Laluan undang-undang tersekat: kemajuan kecil sahaja.' },
      { id: 'jawatan', kumpulan: 'stabil', ikon: '🎁', nama: 'Tawar jawatan kepada ADUN parti rakan', kos: 10, selang: 3, kesan: { kestabilan: 12 } },
      { id: 'majlis', kumpulan: 'stabil', ikon: '🍽️', nama: 'Majlis bersama ADUN kerajaan', kos: 5, kesan: { kestabilan: 4 } },
      { id: 'kawasan', kumpulan: 'stabil', ikon: '🔨', nama: 'Pembangunan kawasan ADUN', kos: 25, kesan: { kestabilan: 6, akar: 2 } }
    ],
    ubahKesan: function (t, m) {                                                       // rundingan bergantung pada hubungan
      if (t.id !== 'runding') { return t.kesan; }
      return { ma63: m.hubungan < 50 ? 3 : m.hubungan >= HUB_TINGGI ? 8 : 6 };
    },
    dasar: {},
    isuPeluang: function (m) { return m.kestabilan < 30 ? 0.45 : 0.2; },
    isu: {
      lompat: { ikon: '🔄', nama: '4 ADUN kerajaan dikhabarkan akan menarik sokongan', abai: { kestabilan: -6 }, pilihan: [
        { id: 'pujuk', ikon: '🤝', label: 'Pujuk dengan jawatan', kos: 15, peluang: 0.7, kekalJikaGagal: true, kesan: { kestabilan: 10 }, gagal: {}, mesej: 'ADUN berjaya dipujuk dan kekal menyokong kerajaan.', mesejGagal: 'Pujukan gagal; ADUN masih berbelah bahagi.' },
        { id: 'undang', ikon: '⚖️', label: 'Ingatkan undang-undang anti-lompat parti', peluang: 0.5, kesan: {}, gagal: { kestabilan: -8 }, mesej: 'ADUN berundur selepas diingatkan tentang undang-undang anti-lompat parti.', mesejGagal: 'Amaran dianggap ugutan; hubungan dengan ADUN bertambah tegang.' },
        { id: 'rayu', ikon: '📣', label: 'Rayu kepada rakyat', peluang: 0.4, kesan: { pop: 2 }, gagal: { kestabilan: -5 }, mesej: 'Tekanan rakyat membuatkan ADUN kekal bersama kerajaan.', mesejGagal: 'Rayuan tidak memberi kesan; ADUN terus mengugut.' }] }
    },
    akibat: [
      { meter: 'kestabilan', bawah: 30, kesan: { rating: -5 }, mesej: 'Kerajaan negeri goyah: khabar angin tukar kerajaan merebak (KPI −5).' }
    ],
    bulanan: function (m, p, ctx, ev) {
      if (m.ma63 >= 100) {                                                             // tuntutan selesai
        m.ma63 = 0; m.danaTambah = (m.danaTambah || 0) + SELESAI.dana; m.tuntutanSelesai = (m.tuntutanSelesai || 0) + 1;
        ctx.d.pop = (ctx.d.pop || 0) + SELESAI.pop; ctx.kes.ip = (ctx.kes.ip || 0) + SELESAI.ip;
        ev.push({ jenis: 'kabinet', mesej: 'Persekutuan bersetuju dengan pelan pembayaran hak MA63: dana negeri +RM ' + SELESAI.dana + ' juta sebulan, populariti +' + SELESAI.pop + ', IP +' + SELESAI.ip + '.' });
      }
      if (m.hubungan >= HUB_TINGGI) { m.ma63 = Math.min(100, m.ma63 + 2); }
      if (m.kestabilan <= 0) {
        ctx.selepas.push(function () { var K = KB(); return K && K.lucutJawatan ? K.lucutJawatan('Ketua Menteri hilang kepercayaan majoriti ADUN. Yang di-Pertua Negeri melantik ketua kerajaan baharu.') : null; });
      }
    }
  });
});
