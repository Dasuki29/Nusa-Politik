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
  ["Kekuatan kerusi ialah andaian permainan berdasarkan komposisi etnik pemilih (kerusi majoriti Cina lebih sukar, kerusi Bumiputera lebih selamat), bukan ramalan atau data keputusan sebenar.", "Seat strength is a game assumption based on the ethnic composition of voters (Chinese-majority seats are harder, Bumiputera seats are safer), not a forecast or real result data."]
  ]);
})();
