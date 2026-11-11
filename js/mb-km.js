/* ==========================================================================
   Nusa Politik — js/mb-km.js   (v13.84)
   Pejabat Menteri Besar / Ketua Menteri Semenanjung (takrif untuk enjin generik js/kementerian.js), mockup dipersetujui.
   Dua varian berkongsi satu pembina:
   - p.mb  : Menteri Besar 9 negeri beraja (tab "Pejabat Menteri Besar", hubungan dengan Istana, isu perkenan calon EXCO).
   - p.kmsj: Ketua Menteri Melaka / Pulau Pinang (tab "Pejabat Ketua Menteri", hubungan dengan Yang di-Pertua Negeri).
   Bukan Sabah (js/sabah-km.js) dan bukan Sarawak (js/sarawak-premier.js). Tab Portfolio Saya (Tanah & Kewangan) kekal.
   Meter: kestabilan kerajaan negeri (sokongan ADUN), hubungan Istana / YDP Negeri, hubungan Persekutuan (awal 65 jika parti
   dalam Kerajaan Persekutuan, 35 jika pembangkang), dana negeri (RM 30 juta sebulan, had RM 200 juta).
   Dua kumpulan tindakan (satu sebulan setiap satu), dua dasar, isu rawak.
   Akibat: kestabilan < 30 = KPI −5; kestabilan 0 = hilang jawatan; Istana < 25 = kestabilan −2; Persekutuan < 30 = dana −RM 10 juta.
   ANDAIAN: semua nilai ialah anggaran permainan. "Sejajar dengan Persekutuan" dikira daripada status kerajaan kerusi Parlimen
   (pru.kerajaanSemasa), bukan senarai gabungan sebenar. Isu Istana ialah label simulasi umum.
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var KM = root.MyPolitikKementerian || (typeof require === 'function' ? require('./kementerian.js') : null);
  var api = factory(root, KM);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikMBKM = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root, KM) {
  'use strict';
  function modul(nama, fail) { if (root[nama]) { return root[nama]; } try { if (typeof require === 'function') { return require('./' + fail); } } catch (e) { /* tiada */ } return null; }
  function KB() { return modul('MyPolitikKabinet', 'kabinet.js'); }
  var NEGERI_KM = ['melaka', 'pulau pinang'], PERSEKUTUAN_RENDAH = 30, POTONG = 10;
  function negeriKM(p) { return NEGERI_KM.indexOf(String((p && p.negeri) || '').toLowerCase()) >= 0; }
  /** Parti pemain dalam Kerajaan Persekutuan? (status kerusi Parlimen; tidak pasti = ya). */
  function sejajar(p) {
    var PR = modul('MyPolitikPRU', 'pru.js'), v = PR && PR.kerajaanSemasa ? PR.kerajaanSemasa(p, 'MP') : null;
    if (v === null && p && p.kerusiNasional && typeof p.kerusiNasional.kerajaan === 'boolean') { v = p.kerusiNasional.kerajaan; }
    return v !== false;
  }

  function bina(km) {
    var gelaran = km ? 'Ketua Menteri' : 'Menteri Besar', pejabat = 'Pejabat ' + gelaran, ketua = km ? 'Yang di-Pertua Negeri' : 'Sultan';
    var isu = {
      adun: { ikon: '🔄', nama: 'ADUN kerajaan bertelagah dengan kepimpinan negeri', abai: { kestabilan: -5 }, pilihan: [
        { id: 'glc', ikon: '🎁', label: 'Pujuk dengan jawatan GLC negeri', kos: 10, peluang: 0.7, kekalJikaGagal: true, kesan: { kestabilan: 8 }, gagal: {}, mesej: 'ADUN dipujuk dan kembali menyokong kepimpinan negeri.', mesejGagal: 'Pujukan belum berhasil; ADUN masih bertelagah.' },
        { id: 'disiplin', ikon: '⚖️', label: 'Tindakan disiplin parti', peluang: 0.5, kesan: { kestabilan: 3, rating: 1 }, gagal: { kestabilan: -8 }, mesej: 'Tindakan disiplin menundukkan ADUN yang bertelagah.', mesejGagal: 'Tindakan disiplin memarakkan lagi pertelingkahan.' }] },
      banjir: { ikon: '🌊', nama: 'Banjir besar melanda beberapa daerah negeri', tamat: 3, abai: { kestabilan: -2 }, pilihan: [
        { id: 'pusat', ikon: '🤝', label: 'Mohon bantuan Persekutuan', peluang: 'persekutuan', kesan: { pop: 3 }, gagal: { pop: -2 }, mesej: 'Bantuan Persekutuan disalurkan dengan pantas.', mesejGagal: 'Bantuan Persekutuan lambat; mangsa banjir kecewa.' },
        { id: 'negeri', ikon: '💰', label: 'Biayai dengan dana negeri', kos: 30, kesan: { pop: 2, akar: 2 }, mesej: 'Kerajaan negeri menyalurkan bantuan banjir sendiri.' }] },
      air: { ikon: '💧', nama: 'Pertikaian bekalan air dengan negeri jiran', abai: { persekutuan: -1 }, pilihan: [
        { id: 'runding', ikon: '🤝', label: 'Runding dengan negeri jiran', peluang: 0.6, kesan: { rating: 2 }, gagal: { pop: -1 }, mesej: 'Perjanjian bekalan air dicapai dengan negeri jiran.', mesejGagal: 'Rundingan air buntu; isu berlarutan.' },
        { id: 'pusat', ikon: '🏛️', label: 'Bawa ke Persekutuan', kesan: { persekutuan: 2, akar: -1 }, mesej: 'Persekutuan menjadi pengantara pertikaian air.' }] }
    };
    if (!km) {
      isu.istana = { ikon: '👑', nama: 'Istana tidak memperkenan calon EXCO yang dicadangkan', abai: { istana: -3 }, pilihan: [
        { id: 'tukar', ikon: '🔁', label: 'Tukar calon', kesan: { istana: 5, kestabilan: -4 }, mesej: 'Calon baharu dikemukakan dan diperkenan Istana.' },
        { id: 'hadap', ikon: '🙏', label: 'Menghadap memohon perkenan', peluang: 'istana', kesan: { istana: 2 }, gagal: { istana: -4 }, mesej: 'Istana memperkenan calon selepas menghadap.', mesejGagal: 'Permohonan tidak diperkenan; Istana kurang senang.' },
        { id: 'pertahan', ikon: '✋', label: 'Pertahan calon', peluang: 0.5, kesan: { kestabilan: 3 }, gagal: { istana: -10 }, mesej: 'Calon akhirnya diterima.', mesejGagal: 'Istana murka; hubungan bertambah dingin.' }] };
    }
    return KM.cipta({
      kunci: km ? 'kmsj' : 'mb', tab: '🏛️ ' + pejabat, pejabat: pejabat, ralat: 'Hanya ' + gelaran + (km ? ' Melaka atau Pulau Pinang.' : ' negeri beraja.'), tanpaBonus: true,
      aktif: function (p, k) { var K = KB(); return !!(k.hasGovernmentRole && k.roleLevel === 'MENTERI_BESAR' && K && !K.SW(p.parti) && !K.SB(p) && negeriKM(p) === km); },
      meter: {
        kestabilan: { nama: 'Kestabilan kerajaan negeri', awal: 58, min: 0, maks: 100, asas: 55, alir: 0.08, nota: 'sokongan ADUN', bahaya: function (v) { return v < 30; } },
        istana: { nama: km ? 'Hubungan dengan Yang di-Pertua Negeri' : 'Hubungan dengan Istana', awal: 62, min: 0, maks: 100, asas: 60, alir: 0.08, nota: km ? '' : 'Sultan / Raja negeri', bahaya: function (v) { return v < 25; } },
        persekutuan: { nama: 'Hubungan dengan Persekutuan', awal: 65, min: 0, maks: 100, asas: 55, alir: 0.08, bahaya: function (v) { return v < PERSEKUTUAN_RENDAH; } }
      },
      mula: function (m, p) { if (!sejajar(p)) { m.persekutuan = 35; } },
      sasaran: function (k, m, p) { return k === 'persekutuan' ? (sejajar(p) ? 10 : -20) : 0; },   // sasaran 65 / 35
      dana: { awal: 80, bulan: 30, had: 200 },
      ubahDana: function (tambah, m) { return m.persekutuan < PERSEKUTUAN_RENDAH ? tambah - POTONG : tambah; },
      kumpulan: { tadbir: 'Pentadbiran negeri', hubungan: km ? 'Yang di-Pertua Negeri & Persekutuan' : 'Istana & Persekutuan' },
      tindakan: [
        { id: 'mmkn', kumpulan: 'tadbir', ikon: '🏛️', nama: 'Mesyuarat Majlis Mesyuarat Kerajaan Negeri (MMKN)', kos: 0, kesan: { kestabilan: 3, rating: 1 }, mesej: 'MMKN bersidang.' },
        { id: 'peruntukan', kumpulan: 'tadbir', ikon: '🎁', nama: 'Peruntukan kawasan ADUN kerajaan', kos: 20, selang: 3, kesan: { kestabilan: 8 } },
        { id: 'projek', kumpulan: 'tadbir', ikon: '🏗️', nama: 'Projek berimpak tinggi negeri', kos: 60, siap: 6, kesan: { pop: 3, akar: 3, rating: 2 } },
        { id: 'hadap', kumpulan: 'hubungan', ikon: '👑', nama: 'Menghadap ' + ketua, kos: 0, ap: 1, kesan: { istana: 6 } },
        { id: 'runding', kumpulan: 'hubungan', ikon: '🤝', nama: 'Rundingan peruntukan Persekutuan', kos: 0, kesan: { persekutuan: 4, dana: 20 }, gagal: { persekutuan: 4 }, mesej: 'Persekutuan meluluskan peruntukan tambahan.', mesejGagal: 'Rundingan diadakan, tetapi peruntukan belum diluluskan.' },
        { id: 'desak', kumpulan: 'hubungan', ikon: '📢', nama: 'Desak hak negeri secara terbuka', kos: 0, kesan: { pop: 2, akar: 3, persekutuan: -8 }, mesej: 'Kerajaan negeri mendesak hak negeri secara terbuka.' }
      ],
      ubahKesan: function (t, m, p) { return t.id === 'runding' && !sejajar(p) ? { persekutuan: 4, dana: 10 } : t.kesan; },
      ubahPeluang: function (t, m, p) { return t.id === 'runding' && !sejajar(p) ? 0.5 : t.peluang; },
      dasar: {
        hasil: { nama: 'Hasil negeri', ikon: '💰', lalai: 'hemat', pilihan: [
          { id: 'hemat', label: 'Berhemat' },
          { id: 'sumber', label: 'Hasil sumber asli', dana: 15, sas: { istana: -6 }, kejut: { pop: -2 } },
          { id: 'rakyat', label: 'Rakyat didahulukan', dana: -10, kejut: { pop: 3, akar: 2 } }] },
        pusat: { nama: 'Pendekatan dengan Persekutuan', ikon: '🤝', lalai: 'seimbang', pilihan: [
          { id: 'kerjasama', label: 'Kerjasama', sas: { persekutuan: 10 }, kejut: { akar: -2 } },
          { id: 'seimbang', label: 'Pendekatan seimbang' },
          { id: 'tegas', label: 'Tegas hak negeri', sas: { persekutuan: -10 }, kejut: { akar: 3, pop: 1 } }] }
      },
      isuPeluang: function (m) { return m.kestabilan < 30 ? 0.4 : 0.2; },
      isu: isu,
      akibat: [
        { meter: 'kestabilan', bawah: 30, kesan: { rating: -5 }, mesej: 'Kerajaan negeri goyah: khabar angin tukar kerajaan negeri (KPI −5).' },
        { meter: 'istana', bawah: 25, kesan: { kestabilan: -2 }, mesej: km ? 'Hubungan dengan Yang di-Pertua Negeri dingin: ADUN mula ragu (kestabilan −2).' : 'Istana dingin: ADUN mula ragu (kestabilan −2).' }
      ],
      bulanan: function (m, p, ctx) {
        if (m.kestabilan <= 0) {
          ctx.selepas.push(function () { var K = KB(); return K && K.lucutJawatan ? K.lucutJawatan(gelaran + ' hilang kepercayaan majoriti ADUN. ' + (km ? 'Yang di-Pertua Negeri' : 'Raja') + ' melantik ketua kerajaan negeri baharu.') : null; });
        }
      }
    });
  }
  return { mb: bina(false), km: bina(true), sejajar: sejajar };
});
