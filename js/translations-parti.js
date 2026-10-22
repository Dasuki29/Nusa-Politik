/* ==========================================================================
   Nusa Politik — js/translations-parti.js   (v8.32)
   Terjemahan EN untuk pilihan parti (PBB) pada skrin pendaftaran dan dashboard.
   Kunci yang mengandungi "PBB" didaftar dua kali: dengan PBB dan dengan UMNO, kerana js/parti.js menukar PBB kepada UMNO
   sebelum carian kamus (supaya kamus UMNO sedia ada berfungsi untuk PBB).
   ========================================================================== */
(function () {
  'use strict';
  var T = typeof window !== 'undefined' ? window.MyPolitikTranslations : (typeof globalThis !== 'undefined' ? globalThis.MyPolitikTranslations : null);
  if (!T || !T.tambah) { return; }
  T.tambah([
["Parti", "Party"],
  ["(Semenanjung & Sabah)", "(Peninsular Malaysia & Sabah)"],
  ["(Sarawak, dalam GPS)", "(Sarawak, in GPS)"],
  ["Bahagian (DUN)", "Division (State Seat)"],
  ["Pilih bahagian (DUN)", "Select division (state seat)"],
  ["Pilih cawangan (daerah mengundi)", "Select branch (polling district)"],
  ["PBB ialah parti regional Sarawak: Bahagian = DUN, Cawangan = Daerah Mengundi, sayap Pemuda dan Wanita sahaja. Bilangan ahli ialah anggaran permainan. Simulasi, bukan data rasmi parti.", "PBB is Sarawak's regional party: Division = state seat, Branch = polling district, Youth and Women wings only. Member numbers are game estimates. Simulation, not official party data."],
  ["UMNO ialah parti regional Sarawak: Bahagian = DUN, Cawangan = Daerah Mengundi, sayap Pemuda dan Wanita sahaja. Bilangan ahli ialah anggaran permainan. Simulasi, bukan data rasmi parti.", "PBB is Sarawak's regional party: Division = state seat, Branch = polling district, Youth and Women wings only. Member numbers are game estimates. Simulation, not official party data."],
  ["Memuatkan data PBB Sarawak...", "Loading PBB Sarawak data..."],
  ["Memuatkan data UMNO Sarawak...", "Loading PBB Sarawak data..."],
  ["Data PBB Sarawak ({x}). Bilangan ahli ialah anggaran permainan.", "PBB Sarawak data ({x}). Member numbers are game estimates."],
  ["Data UMNO Sarawak ({x}). Bilangan ahli ialah anggaran permainan.", "PBB Sarawak data ({x}). Member numbers are game estimates."],
  ["Data PBB tidak dapat dimuatkan: {x}", "PBB data could not be loaded: {x}"],
  ["Data UMNO tidak dapat dimuatkan: {x}", "PBB data could not be loaded: {x}"],
  ["PBB tiada sayap Puteri.", "PBB has no Puteri wing."],
  ["UMNO tiada sayap Puteri.", "PBB has no Puteri wing."],
  ["Pindah cawangan PBB (antara Daerah Mengundi dan DUN) belum dibuka; menyusul dalam kemas kini seterusnya.", "Transferring PBB branches (between polling districts and state seats) is not open yet; coming in a later update."],
  ["Pindah cawangan UMNO (antara Daerah Mengundi dan DUN) belum dibuka; menyusul dalam kemas kini seterusnya.", "Transferring PBB branches (between polling districts and state seats) is not open yet; coming in a later update."],
  ["PBB bertanding kerusi DUN (PRN Sarawak) pada fasa ini; kerusi Parlimen menyusul", "PBB contests state seats (Sarawak state election) at this stage; Parliament seats come later"],
  ["UMNO bertanding kerusi DUN (PRN Sarawak) pada fasa ini; kerusi Parlimen menyusul", "PBB contests state seats (Sarawak state election) at this stage; Parliament seats come later"],
  ["🗳️ Kerusi DUN Anda", "🗳️ Your State Seat"],
  ["DUN (Bahagian)", "State seat (Division)"],
  ["Pemilih ({x} daerah mengundi)", "Voters ({x} polling districts)"],
  ["Melayu/Melanau", "Malay/Melanau"],
  ["Dayak (Iban, Bidayuh, Orang Ulu)", "Dayak (Iban, Bidayuh, Orang Ulu)"],
  ["Tahap kerusi", "Seat level"],
  ["({x} sokongan asas)", "({x} base support)"],
  ["Lawan utama (label simulasi)", "Main opponents (simulation labels)"],
  ["Sederhana", "Moderate"],
  ["Kekuatan kerusi ialah andaian permainan berdasarkan komposisi etnik pemilih (kerusi majoriti Cina lebih sukar, kerusi Bumiputera lebih selamat), bukan ramalan atau data keputusan sebenar.", "Seat strength is a game assumption based on the ethnic composition of voters (Chinese-majority seats are harder, Bumiputera seats are safer), not a forecast or real result data."],
  ["Sayap dalaman PBB", "PBB internal wing"],
  ["Sayap dalaman UMNO", "PBB internal wing"],
  ["(Melayu/Melanau)", "(Malay/Melanau)"],
  ["Pesaka", "Pesaka"],
  ["(Dayak)", "(Dayak)"],
  ["Jawatan Pusat dibahagi antara dua blok. Dicadangkan mengikut kawasan yang anda pilih; anda boleh menukarnya.", "Central posts are shared between two blocs. Suggested from the area you chose; you can change it."],
  ["Hanya untuk pemain PBB.", "Only for PBB players."],
  ["Hanya untuk pemain UMNO.", "Only for PBB players."],
  ["⚖️ Imbangan Bumiputera & Pesaka", "⚖️ Bumiputera & Pesaka Balance"],
  ["Jawatan Pusat dibahagi antara dua blok. Presiden mengikut giliran, Timbalan Presiden daripada blok yang satu lagi.", "Central posts are shared between two blocs. The President follows a rotation; the Deputy President comes from the other bloc."],
  ["Blok anda", "Your bloc"],
  ["Giliran Presiden (setiap {x} tahun)", "President rotation (every {x} years)"],
  ["Naib Presiden dan Ahli MKT", "Vice Presidents and MKT members"],
  ["Sokongan antara blok", "Inter-bloc support"],
  ["Sama rata", "Even"],
  ["Lebih mudah ({x})", "Easier ({x})"],
  ["Lebih sukar (+{x})", "Harder (+{x})"],
  ["Sokongan antara blok mengurangkan kelemahan blok anda dan memberi sedikit bonus di semua jawatan Pusat. Ia susut 1 sebulan sehingga 30. Angka ialah andaian permainan.", "Inter-bloc support reduces your bloc's disadvantage and gives a small bonus in all Central posts. It decays by 1 a month down to 30. Numbers are game assumptions."],
  ["Dekati blok Bumiputera (3 AP, RM 1,500)", "Approach the Bumiputera bloc (3 AP, RM 1,500)"],
  ["Dekati blok Pesaka (3 AP, RM 1,500)", "Approach the Pesaka bloc (3 AP, RM 1,500)"],
  ["Sudah dilakukan bulan ini.", "Already done this month."],
  ["Anda mendekati pemimpin blok {x}. Sokongan antara blok {a}/100 (-3 AP, -RM 1,500).", "You approach the {x} bloc's leaders. Inter-bloc support {a}/100 (-3 AP, -RM 1,500)."]
  ]);
})();
