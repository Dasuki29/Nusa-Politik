/* ==========================================================================
   Nusa Politik — js/translations.js   (v7.61)
   Kamus terjemahan dwibahasa: objek TRANSLATIONS = { BM: {kunci: teks}, EN: {kunci: teks} }.
   Kunci bernama (cth. branchMeeting, divisionMeeting) disediakan untuk istilah teras; selebihnya dikunci automatik
   daripada teks BM supaya teks sedia ada dalam kod tidak perlu ditulis semula (enjin: js/i18n.js).

   PERISTILAHAN (dipersetujui dengan pemilik projek):
     - Nama sayap kekal: Pemuda, Wanita, Puteri (EN: "Pemuda Wing", "Wanita Wing", "Puteri Wing").
     - Kekal: Majlis Kerja Tertinggi (MKT), Perhimpunan Agung UMNO (PAU), "Induk".
     - Bahagian = Division, Cawangan = Branch, Ketua Bahagian = Division Chief, Ketua Cawangan = Branch Chief.
     - IP = Influence Points (IP), AP = Action Points (AP), Dana = Funds (MYR), Akar Umbi = Grassroots, Reputasi = Reputation.
     - Jawatan: Timbalan Ketua = Deputy Chief, Naib Ketua = Vice Chief, AJK = Committee Member (AJK), Perwakilan = Delegate,
       Usul = Motion, Presiden / Timbalan Presiden / Naib Presiden = President / Deputy President / Vice President,
       Ahli MKT = MKT Member, Ahli Biasa = Ordinary Member, Pencabar Utama = Main Challenger.
     - PRU = General Election (PRU), PRN = State Election (PRN), Ahli Parlimen = Member of Parliament (MP), ADUN = State Assemblyman (ADUN).
     - Politik Wang = Money Politics, Agihan Wang Undi = Vote Money Distribution, Zon kelabu = Gray Area, Tataetika = Code of Ethics.
     - Aktiviti tempatan kekal BM dengan glos EN: Ziarah Kasih (Compassion Visit), Sembang Warung (Warung Chat),
       Gotong-Royong (Community Work), Jamuan Mesyuarat (Meeting Feast).
   FASA 1: UI dan istilah teras. Teks yang belum diterjemah (acara, usul, dialog, sebahagian tutorial) kekal BM (sandar).
   ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.MyPolitikTranslations = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function () {
  'use strict';

  /* [BM, EN, kunci?]  Teks penuh (padanan tepat selepas trim). */
  var BARIS = [
    /* --- istilah teras bernama --- */
    ['Persidangan Tahunan Cawangan', 'Branch Annual Conference', 'branchMeeting'],
    ['Mesyuarat Perwakilan Bahagian', 'Division Delegates Meeting', 'divisionMeeting'],
    ['Mesyuarat Cawangan', 'Branch Annual Conference', 'branchMeetingLama'],
    ['Mesyuarat Bahagian', 'Division Delegates Meeting', 'divisionMeetingLama'],
    ['Persidangan Tahunan Sayap Cawangan', 'Wing Branch Annual Conference', 'wingBranchMeeting'],
    ['Mesyuarat Perwakilan Sayap Bahagian', 'Wing Division Delegates Meeting', 'wingDivisionMeeting'],
    ['Mesyuarat Sayap Cawangan', 'Wing Branch Annual Conference', 'wingBranchMeetingLama'],
    ['Mesyuarat Sayap Bahagian', 'Wing Division Delegates Meeting', 'wingDivisionMeetingLama'],
    ['Perhimpunan Agung UMNO (PAU)', 'UMNO General Assembly (PAU)', 'pauFull'],
    ['Perhimpunan Agung (PAU)', 'General Assembly (PAU)', 'pauShort'],
    ['Perhimpunan Sayap (Pra-PAU)', 'Wing Assembly (Pre-PAU)', 'wingAssemblyPrePau'],
    ['Majlis Kerja Tertinggi (MKT)', 'Majlis Kerja Tertinggi (MKT)', 'mktFull'],
    ['Ketua Bahagian', 'Division Chief', 'divisionChief'],
    ['Ketua Cawangan', 'Branch Chief', 'branchChief'],
    ['Timbalan Ketua Bahagian', 'Deputy Division Chief', 'deputyDivisionChief'],
    ['Naib Ketua Bahagian', 'Vice Division Chief', 'viceDivisionChief'],
    ['Naib Ketua Cawangan', 'Vice Branch Chief', 'viceBranchChief'],
    ['AJK Bahagian', 'Division Committee Member (AJK)', 'divisionCommittee'],
    ['AJK Cawangan', 'Branch Committee Member (AJK)', 'branchCommittee'],
    ['Ketua Sayap Cawangan', 'Branch Wing Chief', 'branchWingChief'],
    ['Pemuda', 'Pemuda Wing', 'wingPemuda'],
    ['Wanita', 'Wanita Wing', 'wingWanita'],
    ['Puteri', 'Puteri Wing', 'wingPuteri'],
    ['Bahagian', 'Division', 'division'],
    ['Cawangan', 'Branch', 'branch'],
    ['Pusat', 'Central', 'central'],
    ['Presiden', 'President', 'president'],
    ['Timbalan Presiden', 'Deputy President', 'deputyPresident'],
    ['Naib Presiden', 'Vice President', 'vicePresident'],
    ['Ahli MKT', 'MKT Member', 'mktMember'],
    ['Ahli Biasa', 'Ordinary Member', 'ordinaryMember'],
    ['Pencabar Utama', 'Main Challenger', 'mainChallenger'],
    ['Tataetika', 'Code of Ethics', 'codeOfEthics'],

    /* --- pengepala, menu, umum --- */
    ['Langkau ke kandungan', 'Skip to content'],
    ['Menu', 'Menu'], ['Lagu', 'Music'], ['Bersara', 'Retire'], ['Reset', 'Reset'], ['Simulasi', 'Simulation'],
    ['Lagu Rasmi & Pemain Audio', 'Official Song & Audio Player'],
    ['Dengar lagu tema sambil bermain', 'Listen to the theme song while playing'],
    ['Negeri', 'State'], ['DUN', 'DUN (State Constituency)'], ['Umur', 'Age'], ['Tahun', 'Year'], ['Status Tahun', 'Year Status'],
    ['Pengaruh (IP)', 'Influence (IP)'], ['Dana (MYR)', 'Funds (MYR)'], ['Mata Tindakan (AP)', 'Action Points (AP)'],
    ['Pengaruh', 'Influence'], ['Dana', 'Funds'], ['Kesihatan', 'Health'], ['Stress', 'Stress'],
    ['Laluan Utama / Induk', 'Utama / Induk Track'], ['🏛️ Laluan Utama / Induk', '🏛️ Utama / Induk Track'],
    ['Utama / Induk', 'Utama / Induk'],
    ['Buka Acara', 'Open Event'], ['📜 Satu acara menunggu keputusan anda.', '📜 One event is waiting for your decision.'],
    ['Awal Tahun: Khidmat Akar Umbi & Pendaftaran Ahli', 'Start of Year: Grassroots Service & Member Registration'],
    ['Jan', 'Jan'], ['Feb', 'Feb'], ['Mac', 'Mar'], ['Apr', 'Apr'], ['Mei', 'May'], ['Jun', 'Jun'], ['Jul', 'Jul'], ['Ogo', 'Aug'],
    ['Sep', 'Sep'], ['Okt', 'Oct'], ['Nov', 'Nov'], ['Dis', 'Dec'],
    ['Bulan 1-3 Akar umbi', 'Months 1-3 Grassroots'], ['Bulan 4-5 Cawangan & Sayap', 'Months 4-5 Branch & Wing'],
    ['Bulan 6 Bahagian & Sayap', 'Month 6 Division & Wing'], ['Bulan 9 PAU', 'Month 9 PAU'],
    ['Bulan 10-12 Pasca-PAU', 'Months 10-12 Post-PAU'],
    ['Tahun pemilihan', 'Election year'], ['Musim pilihan raya', 'Election season'],
    ['2026 - TAHUN PEMILIHAN', '2026 - ELECTION YEAR'],

    /* --- tab dan navigasi --- */
    ['🗺️ Peta Pengaruh', '🗺️ Influence Map'], ['⚡ Tindakan Pemain', '⚡ Player Actions'], ['🗳️ Pemilihan & Kempen', '🗳️ Elections & Campaign'],
    ['📜 Mesyuarat & Usul', '📜 Meetings & Motions'], ['🏛️ Dewan Rakyat', '🏛️ Dewan Rakyat'], ['📣 Pilihan Raya', '📣 General Election'],
    ['Peta', 'Map'], ['Tindakan', 'Actions'], ['Pemilihan', 'Elections'], ['Mesyuarat', 'Meetings'], ['Dewan', 'Dewan'], ['Pilihan Raya', 'Election'],
    ['Navigasi bawah', 'Bottom navigation'], ['Menu utama', 'Main menu'], ['Tutup', 'Close'],
    ['☀️ Cerah', '☀️ Light'], ['🌙 Gelap', '🌙 Dark'], ['🌗 Auto', '🌗 Auto'], ['Cerah', 'Light'], ['Paparan', 'Display'],
    ['Kuning terang, paling ceria', 'Bright yellow, most cheerful'], ['Hitam pekat, garis kuning', 'Deep black, yellow lines'], ['Ikut tetapan peranti anda', 'Follow your device settings'],
    ['🏛️ Struktur', '🏛️ Structure'], ['📜 Perlembagaan', '📜 Constitution'], ['💾 Simpan', '💾 Save'], ['Simpanan Permainan', 'Game Saves'],
    ['🏠 Menu Utama', '🏠 Main Menu'], ['Rumusan Kerjaya', 'Career Summary'], ['Terus main', 'Keep playing'], ['Mula Latihan', 'Start Training'],
    ['Belajar dahulu bersama Amir?', 'Learn first with Amir?'], ['Notifikasi', 'Notifications'], ['📜 Log Aktiviti', '📜 Activity Log'], ['50 terakhir', 'Last 50'],
    ['Log Peristiwa', 'Event Log'], ['Tiada peristiwa lagi.', 'No events yet.'],
    ['Menu: rupa, struktur, perlembagaan, simpanan & tukar watak', 'Menu: appearance, structure, constitution, saves & switch character'],
    ['Bersara awal dan lihat rumusan kerjaya', 'Retire early and view the career summary'],
    ['Struktur organisasi Induk dan Sayap', 'Organisation structure: Induk and Wings'], ['Perlembagaan Parti', 'Party Constitution'],
    ['Tetapan paparan', 'Display settings'], ['Muzik latar', 'Background music'], ['Mainkan muzik latar', 'Play background music'],
    ['Kelantangan muzik', 'Music volume'], ['Laras kelantangan', 'Adjust volume'], ['Notifikasi terkini', 'Latest notifications'],
    ['Bantuan (?)', 'Help (?)'], ['Buka Bantuan dan Codex', 'Open Help and Codex'], ['Profil pemain', 'Player profile'], ['Avatar pemain', 'Player avatar'],
    ['Takwim bulanan', 'Monthly calendar'], ['Status pemain', 'Player status'], ['Lokasi', 'Location'], ['Sumber', 'Resources'],
    ['Stress dan Kesihatan', 'Stress and Health'],
    ['Januari', 'January'], ['Februari', 'February'], ['April', 'April'], ['Mei', 'May'], ['Julai', 'July'], ['Ogos', 'August'],
    ['September', 'September'], ['Oktober', 'October'], ['November', 'November'], ['Disember', 'December'],

    /* --- peta --- */
    ['Peta Negeri', 'State Map'], ['Peta Bahagian', 'Division Map'], ['Peta DUN', 'DUN Map'], ['Peta PDM / Lokaliti', 'PDM / Locality Map'],
    ['14 negeri', '14 states'], ['Sokongan Anda', 'Your Support'], ['Sokongan Anda:', 'Your Support:'], ['Kekuatan Parti', 'Party Strength'], ['Saiz Pemilih', 'Voter Size'],
    ['Semua', 'All'], ['Semenanjung', 'Peninsular'], ['Sabah & Sarawak', 'Sabah & Sarawak'],
    ['Sangat Lemah (< 35%)', 'Very Weak (< 35%)'], ['Lemah (35-47%)', 'Weak (35-47%)'], ['Sederhana (48-59%)', 'Moderate (48-59%)'],
    ['Kukuh (60-74%)', 'Strong (60-74%)'], ['Sangat Kukuh (≥ 75%)', 'Very Strong (≥ 75%)'], ['★ Kawasan anda', '★ Your area'],
    ['Sangat Lemah', 'Very Weak'], ['Lemah', 'Weak'], ['Sederhana', 'Moderate'], ['Kukuh', 'Strong'], ['Sangat Kukuh', 'Very Strong'],
    ['Butiran Kawasan', 'Area Details'], ['Butiran kawasan', 'Area details'], ['Sokongan & Reputasi', 'Support & Reputation'],
    ['Sokongan Ketua Cawangan', 'Branch Chief Support'], ['Sokongan AJK', 'Committee Support (AJK)'], ['Sokongan Akar Umbi', 'Grassroots Support'],
    ['Sokongan Perwakilan PAU', 'PAU Delegate Support'], ['Sokongan Atas Pagar', 'Fence-Sitter Support'], ['Reputasi Parti', 'Party Reputation'],
    ['Isu Tempatan', 'Local Issues'], ['Belum ada isu. Berbual di warung untuk mengumpul isu tempatan.', 'No issues yet. Chat at the warung to gather local issues.'],
    ['Sentimen Pengundi', 'Voter Sentiment'], ['Sentimen pengundi', 'Voter sentiment'], ['fasa biasa', 'normal phase'], ['Sokongan akar umbi', 'Grassroots support'], ['Populariti parti', 'Party popularity'],
    ['Kerusi Parlimen dan DUN', 'Parliament and DUN seats'], ['Mod paparan peta', 'Map display mode'], ['Ukuran warna', 'Colour measure'], ['Rantau', 'Region'],
    ['Peta poligon Negeri', 'State polygon map'], ['Zum masuk', 'Zoom in'], ['Zum keluar', 'Zoom out'], ['Set semula paparan', 'Reset view'],
    ['Klik negeri untuk butiran. Seret untuk alih; Ctrl + roda tetikus atau butang +/− untuk zum.', 'Click a state for details. Drag to pan; Ctrl + mouse wheel or the +/− buttons to zoom.'],
    ['Klik mana-mana kawasan pada peta untuk melihat butiran, kemudian Lobi atau Anjur Jelajah.', 'Click any area on the map to see details, then Lobby or Organise a Tour.'],
    ['Belum ada keputusan PRU. Anggaran kerusi muncul selepas pilihan raya pertama.', 'No General Election (PRU) results yet. Seat estimates appear after the first election.'],

    /* --- tindakan akar umbi --- */
    ['Musim Akar Umbi (bulan 1-3)', 'Grassroots Season (months 1-3)'], ['Tindakan Akar Umbi', 'Grassroots Actions'],
    ['Ziarah Kasih', 'Ziarah Kasih (Compassion Visit)'], ['Sembang Warung', 'Sembang Warung (Warung Chat)'], ['Hadir Gotong-Royong', 'Attend Gotong-Royong (Community Work)'],
    ['Jamuan Mesyuarat', 'Jamuan Mesyuarat (Meeting Feast)'], ['Khidmat Masyarakat', 'Community Service'],
    ['Kerja Sampingan / Perniagaan', 'Side Job / Business'], ['Rehat & Masa Keluarga', 'Rest & Family Time'],
    ['Menziarahi ahli yang uzur dan keluarga yang ditimpa musibah.', 'Visit ailing members and families struck by misfortune.'],
    ['Menziarahi ahli yang uzur dan keluarga yang ditimpa musibah, tanpa meminta undi. Membina Modal Sosial.', 'Visit ailing members and families struck by misfortune, without asking for votes. Builds Social Capital.'],
    ['Turun bersama ahli membersihkan kawasan dan membantu kerja cawangan.', 'Join members in cleaning up the area and helping with branch work.'],
    ['Berbual dengan orang kampung di warung untuk mendengar isu setempat.', 'Chat with villagers at the warung to hear local issues.'],
    ['Menambah pendapatan melalui kerja sampingan atau perniagaan kecil.', 'Earn extra income through a side job or small business.'],
    ['Klinik bergerak, kelas tuisyen percuma atau bantuan banjir. Membina Modal Sosial jangka panjang.', 'Mobile clinics, free tuition classes or flood relief. Builds long-term Social Capital.'],
    ['Gotong-royong, klinik bergerak dan kelas tuisyen percuma. Kerja ikhlas yang dikenang akar umbi.', 'Gotong-royong (community work), mobile clinics and free tuition classes. Sincere work remembered by the grassroots.'],
    ['Berehat daripada politik untuk memulihkan tenaga. Stress -15, Kesihatan +4.', 'Take a break from politics to recover your energy. Stress -15, Health +4.'],
    ['Setiap bulan baharu: AP bertambah 5 (baki dibawa, had 15) dan elaun bulanan ditambah ke dana. Bonus +25% IP dan sokongan bagi tindakan sehingga bulan 3.', 'Each new month: AP increases by 5 (unused AP carried over, cap 15) and the monthly allowance is added to your funds. +25% IP and support bonus on actions up to month 3.'],
    ['Setiap tindakan memberi bonus +25% IP dan kesetiaan. Manfaatkan sebelum musim mesyuarat bermula pada bulan 4.', 'Every action gives a +25% IP and loyalty bonus. Make the most of it before the meeting season starts in month 4.'],
    ['Bina pengaruh di peringkat cawangan untuk membuka kelayakan bertanding.', 'Build influence at branch level to unlock eligibility to contest.'],

    /* --- pemilihan --- */
    ['Kelayakan Bertanding', 'Contest Eligibility'], ['Terkunci', 'Locked'], ['Terbuka', 'Open'], ['Belum layak', 'Not yet eligible'], ['Tidak Layak', 'Not Eligible'], ['Belum Tiba', 'Not Yet Open'],
    ['Jawatan Bahagian', 'Division Positions'], ['Jawatan Pusat (MKT)', 'Central Positions (MKT)'], ['Ke Pemilihan & Kempen', 'Go to Elections & Campaign'],
    ['Pemilihan Cawangan', 'Branch Elections'], ['Pemilihan Bahagian', 'Division Elections'], ['Pemilihan Pusat (PAU)', 'Central Elections (PAU)'],
    ['Daftar Bertanding', 'Register to Contest'], ['Daftar bertanding dahulu.', 'Register to contest first.'], ['Kempen Pemilihan', 'Election Campaign'],
    ['Mata kempen terkumpul:', 'Campaign points accumulated:'], ['. Kempen meningkatkan kekuatan anda dalam pengundian.', '. Campaigning strengthens your position in the vote.'],
    ['Simulasi Pengundian', 'Vote Simulation'], ['Siri Jelajah', 'Roadshow Series'], ['Menjelajah lokaliti dan bertemu ahli dari rumah ke rumah.', 'Tour localities and meet members door to door.'],
    ['Lobi Ketua Bahagian', 'Lobby Division Chiefs'], ['Bertemu Ketua Bahagian dan perwakilan untuk meraih sokongan.', 'Meet Division Chiefs and delegates to win support.'],
    ['Janji Jawatan & Projek', 'Promise of Posts & Projects'], ['Serang Lawan di Media Sosial', 'Attack Rivals on Social Media'], ['Agihan Wang Undi', 'Vote Money Distribution'],
    ['Zon kelabu ~3%', 'Gray area ~3%'], ['Wang tidak mencukupi (perlu MYR 5,000).', 'Insufficient funds (MYR 5,000 needed).'],
    ['Tataetika & Tempoh Keahlian', 'Code of Ethics & Membership Tenure'], ['Kempen bersih membina', 'Clean campaigning builds'], ['Modal Sosial', 'Social Capital'],
    ['Tempoh keahlian', 'Membership tenure'], ['Rekod disiplin', 'Disciplinary record'], ['0 hukuman', '0 penalties'],
    ['Jawatan & Mandat Anda', 'Your Positions & Mandates'], ['Belum memegang sebarang jawatan.', 'You do not hold any position yet.'],
    ['Perwakilan Cawangan ke Bahagian', 'Branch Delegate to Division'], ['Perwakilan Bahagian ke PAU', 'Division Delegate to PAU'], ['Belum ada', 'None yet'],
    ['Gaya Kepimpinan Anda', 'Your Leadership Style'], ['Ahli Akar Umbi', 'Grassroots Member'],
    ['Pertandingan jawatan · Pemilihan perwakilan · Kempen pemilihan · Perbahasan usul', 'Contests for positions · Delegate elections · Campaigning · Motion debates'],
    ['Pencabar mula muncul apabila bulan bertukar. Aktif menjelang musim pemilihan.', 'Challengers start to appear as the months turn. They become active ahead of the election season.'],
    ['Capai 50 IP untuk membuka pertandingan AJK / Sayap Cawangan (tahun pemilihan). Jawatan Bahagian dan Pusat dibuka selepas anda memegang jawatan peringkat lebih rendah dan menang mandat perwakilan tahun itu.', 'Reach 50 IP to unlock contests for Branch Committee (AJK) / Wing positions (election year). Division and Central positions open once you hold a lower-level position and win that year’s delegate mandate.'],
    ['Mandat perwakilan hanya sah untuk tahun berjalan. Setiap tahun baharu, bertanding semula di Cawangan (bulan 4-5).', 'Delegate mandates are valid for the current year only. Each new year, contest again at Branch level (months 4-5).'],
    ['Tangga jawatan dalam permainan: AJK Cawangan / Ketua Cawangan → AJK Bahagian / Ketua Bahagian → Ahli Majlis Kerja Tertinggi (MKT) → Naib Presiden → Timbalan Presiden → Presiden.', 'Position ladder in the game: Branch Committee (AJK) / Branch Chief → Division Committee (AJK) / Division Chief → Majlis Kerja Tertinggi (MKT) Member → Vice President → Deputy President → President.'],
    ['Anda baru bermula. Gaya kepimpinan anda akan terbentuk daripada pilihan yang anda buat: siapa yang anda ziarah, bagaimana anda berkempen dan jawatan yang anda kejar.', 'You have only just started. Your leadership style will form from the choices you make: who you visit, how you campaign and the positions you pursue.'],
    ['Gaya ini dikira daripada pilihan anda dalam permainan dan boleh berubah.', 'This style is calculated from your choices in the game and can change.'],
    ['Laluan Karier Sebenar: Presiden UMNO', 'Real Career Paths: UMNO Presidents'], ['Sumber:', 'Source:'], ['kini', 'present'],
    ['Pencabar Utama', 'Main Challenger'],

    /* --- mesyuarat --- */
    ['Kelayakan Perwakilan', 'Delegate Eligibility'], ['Dimainkan', 'Played'], ['Usul Lokaliti · Bulan 4-5', 'Local Motions · Months 4-5'],
    ['Usul Kerusi PRU dan Politik · Bulan 6-6', 'General Election (PRU) Seat & Political Motions · Month 6'], ['Usul Dasar Nasional · Bulan 9-9', 'National Policy Motions · Month 9'],
    ['Mesyuarat Tahun 2026', 'Meetings of 2026'], ['Usul Lokaliti', 'Local Motions'], ['Usul Kerusi PRU dan Politik', 'General Election (PRU) Seat & Political Motions'],
    ['Usul Dasar Nasional', 'National Policy Motions'], ['Usul Isu Golongan Sayap', 'Wing Group Issue Motions'],
    ['Mesyuarat berlangsung mengikut urutan: Cawangan, Bahagian, kemudian Perhimpunan Agung (PAU). Jika anda dalam laluan Pemuda, Puteri atau Wanita, setiap peringkat didahului mesyuarat sayap anda; mesyuarat utama terkunci sehingga mesyuarat sayap selesai, dan sayap membawa satu usul ke mesyuarat utama. Pilih peranan anda bagi setiap usul: Pembawa, Pembahas atau Pengundi. Setiap pilihan mempengaruhi IP dan Reputasi Parti.',
     'Meetings run in sequence: Branch, Division, then the General Assembly (PAU). If you are on the Pemuda, Puteri or Wanita Wing track, each level is preceded by your Wing’s meeting; the main meeting is locked until the Wing meeting is done, and the Wing brings one motion to the main meeting. Choose your role for each motion: Mover, Debater or Voter. Each choice affects IP and Party Reputation.'],
    ['Pembawa', 'Mover'], ['Pembahas', 'Debater'], ['Pengundi', 'Voter'],
    ['Menangi kerusi Perwakilan Cawangan semasa Persidangan Tahunan Cawangan (bulan 4-5) tahun 2026.', 'Win a Branch Delegate seat during the Branch Annual Conference (months 4-5) in 2026.'],
    ['Menangi kerusi Perwakilan Bahagian semasa Mesyuarat Perwakilan Bahagian (bulan 6) tahun 2026, atau pegang jawatan Ketua Bahagian / Pusat.', 'Win a Division Delegate seat during the Division Delegates Meeting (month 6) in 2026, or hold a Division Chief / Central position.'],
    ['Hanya Perwakilan Cawangan atau G10 sayap tahun 2026 yang terpilih, Ketua Cawangan dan pemegang jawatan Bahagian/Pusat boleh hadir. Mandat tahun lepas sudah luput.', 'Only elected 2026 Branch Delegates or Wing G10 members, Branch Chiefs and Division/Central office-holders may attend. Last year’s mandate has expired.'],
    ['Hanya Perwakilan Bahagian tahun 2026 yang terpilih, Ketua Bahagian dan pemegang jawatan Pusat boleh hadir PAU.', 'Only elected 2026 Division Delegates, Division Chiefs and Central office-holders may attend the PAU.'],

    /* --- simpanan / slot --- */
    ['Slot 2', 'Slot 2'], ['Slot 3', 'Slot 3'], ['Slot 4', 'Slot 4'], ['Slot 5', 'Slot 5'], ['(kosong)', '(empty)'], ['Watak baharu', 'New character'],
    ['Simpanan automatik aktif.', 'Autosave is on.'], ['Simpanan watak anda', 'Your character save'], ['selamat', 'safe'], ['dan dipulihkan selepas latihan.', 'and restored after the training.'],

    /* --- halaman utama & pendaftaran --- */
    ['Kertas pilihan', 'Ballot paper'], ['Sambung', 'Continue'], ['Teruskan permainan yang disimpan', 'Continue your saved game'], ['Permainan baharu', 'New game'],
    ['Daftar sebagai ahli dan mula bermain', 'Register as a member and start playing'], ['Simpanan permainan', 'Game saves'], ['Pilih atau urus sehingga 5 watak', 'Choose or manage up to 5 characters'],
    ['Cara bermain', 'How to play'], ['Takwim, jawatan dan petua ringkas', 'Calendar, positions and quick tips'], ['Setiap bulan', 'Every month'], ['← Menu', '← Menu'],
    ['Simulasi Politik · Tahun 2026', 'Political Simulation · Year 2026'], ['Mulakan sebagai', 'Start as'], ['Ahli Cawangan', 'Branch Member'], ['peringkat parti', 'party levels'],
    ['1. Bina pengaruh', '1. Build influence'], ['2. Bertanding', '2. Contest'], ['3. Menuju PAU', '3. Head to the PAU'],
    ['Bulan 1–3: turun ke akar umbi, kumpul IP dan sokongan ahli.', 'Months 1–3: go down to the grassroots, gather IP and member support.'],
    ['Bulan 4–6: pemilihan Cawangan dan Bahagian, termasuk Sayap.', 'Months 4–6: Branch and Division elections, including the Wings.'],
    ['Tahun pemilihan: rebut kerusi Pusat hingga Presiden, kemudian Perhimpunan Agung bulan 9.', 'Election year: contend for Central seats up to President, then the General Assembly in month 9.'], ['pemilihan Cawangan,', 'Branch elections,'], ['Bahagian,', 'Division,'], ['PAU.', 'PAU.'],
    ['Anda sudah mendaftar', 'You have registered'], ['Pemain sedia ada', 'Existing player'], ['Teruskan permainan', 'Continue game'], ['Daftar pemain baharu', 'Register a new player'],
    ['Pendaftaran Pemain', 'Player Registration'], ['Maklumat', 'Details'], ['Watak', 'Character'], ['Maklumat anda', 'Your details'], ['Nama penuh', 'Full name'],
    ['Jantina', 'Gender'], ['Lelaki', 'Male'], ['Perempuan', 'Female'], ['Menjadi ahli UMNO sejak', 'UMNO member since'], ['Ahli baharu (2026)', 'New member (2026)'],
    ['1 tahun lalu', '1 year ago'], ['2 tahun lalu', '2 years ago'], ['3 tahun lalu', '3 years ago'], ['5 tahun lalu', '5 years ago'], ['10 tahun lalu atau lebih', '10 years ago or more'],
    ['Watak anda', 'Your character'], ['Dicadangkan', 'Suggested'], ['Biasa', 'Regular'], ['Veteran', 'Veteran'],
    ['Laluan kerjaya (sayap)', 'Career track (wing)'], ['Tahap kesukaran', 'Difficulty'], ['Mudah', 'Easy'], ['Hardcore', 'Hardcore'], ['dikunci', 'locked'],
    ['Isi jantina dan umur dahulu.', 'Fill in gender and age first.'], ['Cawangan anda', 'Your Branch'], ['Cuba lagi', 'Try again'], ['Memuatkan data...', 'Loading data...'],
    ['Memuatkan data daripada Google Sheets...', 'Loading data from Google Sheets...'], ['Bahagian (Parlimen)', 'Division (Parliament)'], ['Pilih negeri dahulu', 'Choose a state first'],
    ['Pilih bahagian dahulu', 'Choose a division first'], ['Pilih DUN dahulu', 'Choose a DUN first'], ['Pilih negeri', 'Choose a state'], ['Cawangan (Lokaliti)', 'Branch (Locality)'],
    ['Cawangan dipilih', 'Selected Branch'], ['Jumlah ahli', 'Total members'], ['Bawah 40', 'Under 40'], ['Atas 40', 'Over 40'],
    ['Daftar dan Mula Bermain', 'Register and Start Playing'], ['Profil anda disimpan dalam pelayar ini sahaja.', 'Your profile is saved in this browser only.'],
    ['Permulaan anda', 'Your start'], ['Nama anda', 'Your name'], ['Watak Pemuda', 'Pemuda Wing character'], ['Takwim setahun', 'Year calendar'],
    ['Tangga kerjaya', 'Career ladder'], ['Kemajuan borang', 'Form progress'], ['Ringkasan permainan', 'Game summary'], ['Pilih avatar watak', 'Choose a character avatar'],
    ['Pilih laluan kerjaya sayap', 'Choose a wing career track'], ['Pilih tahap kesukaran', 'Choose a difficulty'], ['Keadaan permulaan', 'Starting condition'],
    ['Nusa Politik. Permainan simulasi, bukan laman rasmi parti.', 'Nusa Politik. A simulation game, not an official party site.'],
    ['Mesyuarat & pemilihan Cawangan', 'Branch meetings & elections'], ['Mesyuarat & pemilihan Bahagian', 'Division meetings & elections'],
    ['Perhimpunan Agung (PAU) & Pusat', 'General Assembly (PAU) & Central'], ['Pasca-PAU & khidmat masyarakat', 'Post-PAU & community service'],
    ['Akar umbi & bina pengaruh', 'Grassroots & building influence'],
    ['Permainan simulasi, bukan laman rasmi parti. Nama pemain, pesaing dan peristiwa ialah rekaan permainan. Data kawasan berasaskan data awam (DOSM, SPR). Laman ini menggunakan statistik lawatan tanpa kuki dan tanpa data peribadi.',
     'A simulation game, not an official party site. Player names, rivals and events are fictional. Area data is based on public data (DOSM, SPR). This site uses cookie-free, personal-data-free visit statistics.'],
    ['Dimainkan melalui Spotify (perlu internet; log masuk Spotify untuk lagu penuh). Senyapkan audio permainan jika bunyi bertindih.', 'Played through Spotify (internet required; log in to Spotify for the full song). Mute the game audio if the sounds overlap.'],
    ['Pilih watak untuk diteruskan, atau mulakan watak baharu dalam slot kosong. Simpanan disimpan dalam pelayar ini sahaja.', 'Choose a character to continue, or start a new character in an empty slot. Saves are stored in this browser only.'],
    ['Pilih cawangan anda daripada senarai ahli sebenar, bina pengaruh di akar umbi, dan bertanding naik setiap peringkat parti hingga ke kerusi Presiden.', 'Pick your branch from the real member list, build influence at the grassroots, and contest your way up every party level to the President’s seat.'],
    ['Umur bertambah 1 tahun setiap tahun permainan. Risiko kesihatan meningkat selepas 45 tahun, dan kerjaya tamat pada usia 100 tahun.', 'Age increases by 1 year every game year. Health risk rises after age 45, and the career ends at age 100.'],
    ['Pilih negeri dahulu', 'Choose a state first'],

    /* --- tambahan (status, pendaftaran, label) --- */
    ['Rendah', 'Low'], ['Baik', 'Good'], ['Tinggi', 'High'], ['Sangat Tinggi', 'Very High'], ['Nota:', 'Note:'], ['Log Aktiviti', 'Activity Log'],
    ['Pertandingan & kempen dibuka', 'Contests & campaigning open'], ['Pulih +1 sebulan', 'Recovers +1 per month'], ['Beban jawatan +0, pulih -3 sebulan', 'Position load +0, recovery -3 per month'],
    ['Risiko Disiplin (Rendah)', 'Disciplinary Risk (Low)'], ['⚠️ Pencabar Utama', '⚠️ Main Challenger'],
    ['Anda boleh memegang jawatan di', 'You may hold positions at'], ['peringkat berbeza', 'different levels'],
    ['serentak (Cawangan + Bahagian + Pusat), tetapi hanya', 'at the same time (Branch + Division + Central), but only'], ['satu jawatan bagi setiap peringkat', 'one position per level'],
    [', jadi jawatan sayap tidak dibuka.', ', so Wing positions are not open.'],
    ['Lelaki muda, baju Melayu putih, songkok hitam', 'Young man, white baju Melayu, black songkok'],
    ['Perempuan muda, kebaya putih, tudung merah jambu', 'Young woman, white kebaya, pink tudung'],
    ['Perempuan berusia, baju kurung putih, tudung merah', 'Older woman, white baju kurung, red tudung'],
    ['Lelaki pertengahan umur, baju Melayu biru tua, songkok hitam', 'Middle-aged man, navy baju Melayu, black songkok'],
    ['Lelaki berusia, baju Melayu merah, songkok hitam', 'Older man, red baju Melayu, black songkok'],
    ['Laluan jawatan utama parti', 'Main party position track'], ['+10% Dana masuk', '+10% incoming Funds'], ['Laju naik, tetapi lebih penat', 'Rises fast, but more tiring'],
    ['+20% kenaikan IP', '+20% IP gain'], ['Beban Stress +10%', 'Stress load +10%'], ['Rangkaian dan nama baik', 'Networks and good name'],
    ['+25% sokongan AJK dan Perwakilan', '+25% Committee (AJK) and Delegate support'], ['Stabil dan tenang', 'Steady and calm'],
    ['Kerugian akar umbi -30%', 'Grassroots losses -30%'], ['Susutan akar umbi pemegang jawatan -1', 'Office-holder grassroots decay -1'], ['Beban Stress -20%, pulih +1', 'Stress load -20%, recovery +1'],
    ['Stress −25%, perbelanjaan −20%. Pencabar AI pasif.', 'Stress −25%, spending −20%. Passive AI challengers.'],
    ['Stress +40%, perbelanjaan +20%. Pencabar melobi, memfitnah dan mengagih dana politik.', 'Stress +40%, spending +20%. Challengers lobby, smear and distribute political funds.'],
    ['Seimbang. Pencabar berkempen aktif menjelang musim pemilihan.', 'Balanced. Challengers campaign actively ahead of the election season.'],
    ['selepas anda mendaftar dan tidak boleh ditukar.', 'after you register and cannot be changed.'],
    ['Calon AJK Bahagian perlu ahli sekurang-kurangnya', 'Division Committee (AJK) candidates must be members for at least'],
    ['Daerah Mengundi (DM) SPR', 'Election Commission (SPR) Polling Districts (DM)'], ['Bersih', 'Clean'],
    ['Pemain Spotify: lagu rasmi', 'Spotify player: official song'], ['Nusa Politik UMNO, laman utama', 'Nusa Politik UMNO, home page'],
    ['(kekuatan undi +0.8) dan menurunkan risiko dilapor. Politik wang, fitnah dan ugutan melanggar Tataetika Ahli UMNO dan boleh dihukum Lembaga Disiplin (Fasal 20.10): amaran, gantung, dilarang bertanding atau dipecat.',
     '(vote strength +0.8) and lowers the risk of being reported. Money politics, slander and intimidation breach the UMNO Members’ Code of Ethics and can be punished by the Disciplinary Board (Clause 20.10): warning, suspension, a ban from contesting or dismissal.'],
    ['. Setiap jawatan menambah Stress bulanan; terlalu banyak jawatan mencetus cemburu dan sabotaj akar umbi. Laluan anda:', '. Every position adds monthly Stress; holding too many triggers jealousy and grassroots sabotage. Your track:'],
    /* serpihan ayat halaman utama (nod teks terpisah oleh teg <b>) */
    ['Pilih', 'Choose'], ['satu', 'one'],
    ['langkah di bawah. Mulakan sebagai ahli biasa di sebuah Cawangan dan naik ke Bahagian dan Pusat melalui pemilihan parti.', 'step below. Start as an ordinary member in a Branch and rise to Division and Central through party elections.'],
    ['Mulakan sebagai', 'Start as'], ['bulan setahun', 'months a year'], ['peringkat parti', 'party levels'], ['PAU di', 'PAU at'],
    ['Tahap kesukaran', 'Difficulty'],
    ['cth. Ahmad Faiz bin Hassan', 'e.g. Ahmad Faiz bin Hassan'], ['18 hingga 60', '18 to 60']
  ];

  /* Istilah untuk penggubahan (rentetan bercampur nombor/simbol). Susunan: paling panjang dipadankan dahulu. */
  var ISTILAH = [
    ['Majlis Kerja Tertinggi', 'Majlis Kerja Tertinggi'],
    ['Timbalan Ketua Bahagian', 'Deputy Division Chief'], ['Naib Ketua Bahagian', 'Vice Division Chief'], ['Naib Ketua Cawangan', 'Vice Branch Chief'], ['Timbalan Ketua Cawangan', 'Deputy Branch Chief'],
    ['Ketua Sayap Cawangan', 'Branch Wing Chief'], ['Ketua Bahagian', 'Division Chief'], ['Ketua Cawangan', 'Branch Chief'],
    ['Timbalan Presiden', 'Deputy President'], ['Naib Presiden', 'Vice President'], ['Presiden', 'President'],
    ['AJK Bahagian', 'Division Committee (AJK)'], ['AJK Cawangan', 'Branch Committee (AJK)'], ['Perwakilan Bahagian', 'Division Delegate'], ['Perwakilan Cawangan', 'Branch Delegate'],
    ['Sokongan Perwakilan PAU', 'PAU Delegate Support'], ['Sokongan Ketua Cawangan', 'Branch Chief Support'], ['Sokongan Akar Umbi', 'Grassroots Support'], ['Sokongan AJK', 'Committee Support (AJK)'],
    ['Sokongan Atas Pagar', 'Fence-Sitter Support'], ['Reputasi Parti', 'Party Reputation'], ['Modal Sosial', 'Social Capital'], ['mata kempen', 'campaign points'],
    ['Risiko disiplin', 'Disciplinary risk'], ['isu tempatan', 'local issue'], ['Mata Tindakan', 'Action Points'], ['Politik wang', 'Money politics'],
    ['Tahun Pemilihan', 'Election Year'], ['TAHUN PEMILIHAN', 'ELECTION YEAR'], ['BULAN', 'MONTH'], ['Bulan', 'Month'], ['bulan', 'month'], ['tahun', 'year'], 
    ['Mesyuarat', 'Meeting'], ['Perhimpunan', 'Assembly'],
    ['Reputasi', 'Reputation'], ['Sokongan', 'Support'], ['Kesihatan', 'Health'], ['Bahagian', 'Division'], ['Cawangan', 'Branch'], ['Perwakilan', 'Delegate'],
    ['Kempen', 'Campaign'], ['Jawatan', 'Position'], ['Pemilihan', 'Election'], ['Usul', 'Motion'], ['Akar Umbi', 'Grassroots'], ['akar umbi', 'grassroots'], ['Dana', 'Funds'], ['Pengaruh', 'Influence'],
    ['kali', 'times'], ['Tahun', 'Year'], ['Risiko Disiplin', 'Disciplinary Risk'], ['Rendah', 'Low'], ['Baik', 'Good'], ['Tinggi', 'High'], ['Bersih', 'Clean'], ['sebulan', 'per month']
  ];

  /* Perkataan yang kekal (nama, singkatan, istilah dipelihara); tidak dikira sebagai baki BM. */
  var KEKAL = ['IP', 'AP', 'MYR', 'MKT', 'PAU', 'PRU', 'PRN', 'DUN', 'UMNO', 'AJK', 'G10', 'G2', 'Stress', 'Pemuda', 'Wanita', 'Puteri', 'Induk', 'Utama', 'Fasal', 'Perkara', 'Nusa', 'Politik'];

  /* Pra-normalisasi: nama mesyuarat lama -> nama baharu (Perlembagaan UMNO), supaya kamus bergantung pada satu ejaan. */
  var NORMAL = [
    [/Mesyuarat Sayap Cawangan/g, 'Persidangan Tahunan Sayap Cawangan'], [/Mesyuarat Sayap Bahagian/g, 'Mesyuarat Perwakilan Sayap Bahagian'],
    [/Mesyuarat (Pemuda|Wanita|Puteri) Cawangan/g, 'Persidangan Tahunan $1 Cawangan'], [/Mesyuarat (Pemuda|Wanita|Puteri) Bahagian/g, 'Mesyuarat Perwakilan $1 Bahagian'],
    [/Mesyuarat Cawangan/g, 'Persidangan Tahunan Cawangan'], [/Mesyuarat Bahagian/g, 'Mesyuarat Perwakilan Bahagian']
  ];

  var MINGGU = { Januari: 'January', Februari: 'February', Mac: 'March', April: 'April', Mei: 'May', Jun: 'June', Julai: 'July', Ogos: 'August', September: 'September', Oktober: 'October', November: 'November', Disember: 'December' };

  /* Bentuk dinamik (nama dijana kod): [regex, fungsi(match, tr)] -> teks EN atau null. */
  var PERATURAN = [
    [/^Persidangan Tahunan (Pemuda|Wanita|Puteri) Cawangan$/, function (m) { return m[1] + ' Wing Branch Annual Conference'; }],
    [/^Mesyuarat (Pemuda|Wanita|Puteri) Cawangan$/, function (m) { return m[1] + ' Wing Branch Annual Conference'; }],
    [/^Mesyuarat Perwakilan (Pemuda|Wanita|Puteri) Bahagian$/, function (m) { return m[1] + ' Wing Division Delegates Meeting'; }],
    [/^Mesyuarat (Pemuda|Wanita|Puteri) Bahagian$/, function (m) { return m[1] + ' Wing Division Delegates Meeting'; }],
    [/^Perhimpunan (Pemuda|Wanita|Puteri) \(Pra-PAU\)$/, function (m) { return m[1] + ' Wing Assembly (Pre-PAU)'; }],
    [/^(Ketua|Naib Ketua|Timbalan Ketua) (Pemuda|Wanita|Puteri) (Bahagian|Cawangan)$/, function (m) { var p = { 'Ketua': '', 'Naib Ketua': 'Vice ', 'Timbalan Ketua': 'Deputy ' }[m[1]]; return (m[3] === 'Bahagian' ? 'Division ' : 'Branch ') + m[2] + ' Wing ' + p + 'Chief'; }],
    [/^(Ketua|Naib Ketua) (Pemuda|Wanita|Puteri)$/, function (m) { return m[2] + ' Wing ' + (m[1] === 'Ketua' ? '' : 'Vice ') + 'Chief'; }],
    [/^Teruskan ke Bulan (\d+) \((\w+)\) →$/, function (m) { return 'Continue to Month ' + m[1] + ' (' + (MINGGU[m[2]] || m[2]) + ') →'; }],
    [/^Bulan (\d+) \((\w+)\) (\d{4})$/, function (m) { return 'Month ' + m[1] + ' (' + (MINGGU[m[2]] || m[2]) + ') ' + m[3]; }],
    [/^Bulan (\d+) \((\w+)\) · (.+)$/, function (m, tr) { var r = tr(m[3], true); return r ? 'Month ' + m[1] + ' (' + (MINGGU[m[2]] || m[2]) + ') · ' + r : null; }],
    [/^(Januari|Februari|Mac|April|Mei|Jun|Julai|Ogos|September|Oktober|November|Disember): (.+)$/, function (m, tr) { var r = tr(m[2], true); return r ? MINGGU[m[1]] + ': ' + r : null; }],
    [/^(\d+) kerusi$/, function (m) { return m[1] + ' seat' + (m[1] === '1' ? '' : 's'); }],
    [/^[Pp]engundian bulan (\d+)-(\d+)$/, function (m) { return 'voting in months ' + m[1] + '-' + m[2]; }],
    [/^[Pp]engundian bulan (\d+)$/, function (m) { return 'voting in month ' + m[1]; }],
    [/^[Pp]erlu (\d+) IP$/, function (m) { return 'needs ' + m[1] + ' IP'; }],
    [/^Perlukan (\d+) IP \(anda ada (\d+)\)\.?$/, function (m) { return 'Needs ' + m[1] + ' IP (you have ' + m[2] + ').'; }],
    [/^(\d+) tahun · risiko kesihatan (rendah|sederhana|tinggi)$/, function (m) { return m[1] + ' years · ' + { rendah: 'low', sederhana: 'moderate', tinggi: 'high' }[m[2]] + ' health risk'; }],
    [/^(\d+) tahun (\d+) bulan \(perlu (\d+) tahun untuk Bahagian, Fasal ([\d.]+)\)$/, function (m) { return m[1] + ' years ' + m[2] + ' months (' + m[3] + ' years needed for Division, Clause ' + m[4] + ')'; }],
    [/^🗳️ PRU\/PRN: (\w+) (\d{4})$/, function (m) { return '🗳️ PRU/PRN: ' + (MINGGU[m[1]] || m[1]) + ' ' + m[2]; }],
    [/^🗳️ PRN Sarawak: (\w+) (\d{4})$/, function (m) { return '🗳️ Sarawak State Election: ' + (MINGGU[m[1]] || m[1]) + ' ' + m[2]; }],
    [/^🗳️ PRU: (\w+) (\d{4})$/, function (m) { return '🗳️ General Election: ' + (MINGGU[m[1]] || m[1]) + ' ' + m[2]; }],
    [/^(\d+) bulan lagi · kawasan (.+?) (Bandar|Luar Bandar|Separa Bandar|Pedalaman)\. Kelayakan: DUN (✓|✗) \(IP (\d+) \+ jawatan\), Parlimen (✓|✗) \(IP (\d+) \+ Ketua Bahagian\)\.$/, function (m) { var pr = { 'Bandar': 'Urban', 'Luar Bandar': 'Rural', 'Separa Bandar': 'Semi-urban', 'Pedalaman': 'Interior' }[m[3]]; return m[1] + ' months left · ' + m[2] + ' ' + pr + ' area. Eligibility: DUN ' + m[4] + ' (IP ' + m[5] + ' + position), Parliament ' + m[6] + ' (IP ' + m[7] + ' + Division Chief).'; }],
    [/^\(Fasal 15\.5\)\. Ahli baharu layak bertanding di Bahagian pada (\d{4})\. Tempoh dihadkan mengikut umur anda\.$/, function (m) { return '(Clause 15.5). New members become eligible to contest at Division level in ' + m[1] + '. The period is limited by your age.'; }],
    [/^Tetapan paparan\. Sekarang: (.+)$/, function (m, tr) { return 'Display settings. Current: ' + tr(m[1]); }],
    [/^Risiko tamat kerjaya \(kesihatan\) tahun depan: (.+)$/, function (m) { return 'Career-ending risk (health) next year: ' + m[1]; }],
    [/^(.+) dibuka pada bulan (\d+)-(\d+)\. Sekarang bulan (\d+)\.$/, function (m, tr) { var r = tr(m[1], true); return r ? r + ' opens in months ' + m[2] + '-' + m[3] + '. It is currently month ' + m[4] + '.' : null; }],
    [/^(\d{4}) - TAHUN PEMILIHAN · BULAN (\d+)$/, function (m) { return m[1] + ' - ELECTION YEAR · MONTH ' + m[2]; }],
    [/^(\d{4}): Tahun Pemilihan · Bulan (\d+)$/, function (m) { return m[1] + ': Election Year · Month ' + m[2]; }],
    [/^· Presiden (\d{4})-(\d{4}|kini)$/, function (m) { return '· President ' + m[1] + '-' + (m[2] === 'kini' ? 'present' : m[2]); }],
    [/^(\d+) tahun (\d+) bulan$/, function (m) { return m[1] + ' year' + (m[1] === '1' ? '' : 's') + ' ' + m[2] + ' month' + (m[2] === '1' ? '' : 's'); }],
    [/^(\d+) tahun$/, function (m) { return m[1] + ' year' + (m[1] === '1' ? '' : 's'); }],
    [/^(\d+) bulan lagi$/, function (m) { return m[1] + ' month' + (m[1] === '1' ? '' : 's') + ' left'; }],
    [/^(\d+) negeri$/, function (m) { return m[1] + ' states'; }],
    [/^(\d+) bahagian$/, function (m) { return m[1] + ' divisions'; }],
    [/^(\d+) DUN$/, function (m) { return m[1] + ' DUNs'; }],
    [/^(\d+) cawangan$/, function (m) { return m[1] + ' branches'; }],
    [/^(\d+) hukuman$/, function (m) { return m[1] + ' penalt' + (m[1] === '1' ? 'y' : 'ies'); }],
    [/^(.+) \(tiada data\)$/, function (m) { return m[1] + ' (no data)'; }],
    [/^(.+): (\d+)%, (Sangat Lemah|Lemah|Sederhana|Kukuh|Sangat Kukuh)(, kawasan anda)?$/, function (m, tr) { return m[1] + ': ' + m[2] + '%, ' + tr(m[3]) + (m[4] ? ', your area' : ''); }],
    [/^Avatar (Pemuda|Puteri|Wanita|Biasa|Veteran)$/, function (m, tr) { return 'Avatar ' + tr(m[1]); }],
    /* v9.5: sejarah etika "bulan/tahun: [hukuman: ]perkara" dan kenyataan keahlian digantung (peristiwa disiplin rawak) */
    [/^(\d{1,2}\/\d{4}): (.+)$/, function (m, tr) { var bhg = m[2].split(': '), out = [], i, r; for (i = 0; i < bhg.length; i++) { r = tr(bhg[i], true); if (r === null) { return null; } out.push(r); } return m[1] + ': ' + out.join(': '); }],
    [/^Sehingga bulan (\d{1,2}\/\d{4}) \(Fasal 20\.10b\)\. Semua jawatan anda telah dilucutkan(?: \((.+)\))?\. Anda tidak boleh mencalon, mengundi atau bertanding dalam pemilihan parti, dan tidak boleh menggunakan AP untuk tugas rasmi jawatan\.$/, function (m, tr) { return 'Until month ' + m[1] + ' (Clause 20.10b). All your posts have been stripped' + (m[2] ? ' (' + tr(m[2]) + ')' : '') + '. You cannot stand, vote or contest in party elections, and cannot use AP for official duties of a post.'; }],
    [/^Sumber:$/, function () { return 'Source:'; }]
  ];

  /* Kamus hidup: BM/EN (kunci), INDEKS (BM -> kunci), TEMPLAT (ayat berpemegang tempat {nama}). Fail tambahan memanggil tambah(). */
  var BM = {}, EN = {}, INDEKS = {}, TEMPLAT = [], TAMBAH_ISTILAH = [], bil = 0;
  function esk(s) { return s.replace(/[.*+?^$()|[\]\\\/]/g, '\\$&'); }
  /* v10.6: rujukan Perlembagaan/Fasal/Tataetika UMNO dijadikan umum untuk parti selain UMNO (js/parti.js memanggil UMUM.bm/UMUM.en).
     Setiap baris kamus yang berubah selepas ditukar didaftar juga (kunci umum), supaya terjemahan EN kekal berfungsi. */
  var UMUM = (function () {
    var BM_R = [[/\s*\((?:Tataetika |Perlembagaan )?(?:Fasal|Perkara)[^)]*\)/g, ''], [/\s*\(Perlembagaan[^)]*\)/g, ''], [/Tataetika Ahli UMNO(?: 20\d\d)?/g, 'Tataetika parti'], [/Perlembagaan UMNO/g, 'perlembagaan parti'],
      [/\b(?:Fasal|Perkara) \d+(?:\.\d+)*[a-z]?(?:[ ,]+(?:dan )?\d+(?:\.\d+)*)*/g, 'peraturan parti'], [/ {2,}/g, ' '], [/ ([,.;:])/g, '$1']];
    var EN_R = [[/\s*\((?:Code of Ethics |Code of Conduct )?(?:Clause|Article)s?[^)]*\)/g, ''], [/UMNO Members.? Code of (?:Ethics|Conduct)|UMNO Code of (?:Ethics|Conduct)|Code of (?:Ethics|Conduct) for UMNO Members/g, 'party code of ethics'], [/UMNO Constitution/g, 'party constitution'],
      [/\b(?:Clause|Article)s? [\d.]+[a-z]?(?:[ ,]+(?:and )?[\d.]+)*/g, 'party rules'], [/ {2,}/g, ' '], [/ ([,.;:])/g, '$1']];
    function terap(t, R) { for (var i = 0; i < R.length; i++) { t = t.replace(R[i][0], R[i][1]); } return t; }
    return { RE: /Fasal \d|Perkara \d|Perlembagaan|Tataetika Ahli UMNO|Clause|Article \d|UMNO Constitution|Code of (?:Ethics|Conduct)/, bm: function (t) { return t == null ? t : terap(String(t), BM_R); }, en: function (t) { return t == null ? t : terap(String(t), EN_R); } };
  })();
  function tambahBaris(b) {
    var k = b[2] || ('ui' + (bil++));
    if (!b[3] && UMUM.RE.test(b[0])) { var b2 = UMUM.bm(b[0]), e2 = UMUM.en(b[1]); if (b2 !== b[0]) { tambahBaris([b2, e2, null, true]); } }
    if (b[0].indexOf('{') >= 0 && /\{\w+\}/.test(b[0])) {
      var bhg = b[0].split(/\{(\w+)\}/), nama = [], re = '', i;
      for (i = 0; i < bhg.length; i++) { if (i % 2) { nama.push(bhg[i]); re += '([\\s\\S]+?)'; } else { re += esk(bhg[i]); } }
      TEMPLAT.push({ re: new RegExp('^' + re + '$'), nama: nama, en: b[1], awal: bhg[0].slice(0, 6), panjang: b[0].length });
      return;
    }
    BM[k] = b[0]; EN[k] = b[1];
    if (INDEKS[b[0]] === undefined) { INDEKS[b[0]] = k; }
  }
  function urutTemplat() { TEMPLAT.sort(function (x, y) { return y.panjang - x.panjang; }); }
  /** Daftar baris tambahan [[BM, EN, kunci?], ...] dan istilah [[BM, EN], ...]. Panggil sebelum js/i18n.js dimuat. */
  function tambah(baris, istilah) {
    (baris || []).forEach(tambahBaris); urutTemplat();
    (istilah || []).forEach(function (r) { ISTILAH.push(r); });
  }
  /** Padan ayat berpemegang tempat. tr(x) menterjemah nilai yang ditangkap (pulang x jika tiada). Pulang EN atau null. */
  function padan(s, tr) {
    var i, t, m, en;
    for (i = 0; i < TEMPLAT.length; i++) {
      t = TEMPLAT[i];
      if (t.awal && s.slice(0, t.awal.length) !== t.awal) { continue; }
      m = t.re.exec(s);
      if (m) {
        en = t.en;
        t.nama.forEach(function (n, k) { en = en.split('{' + n + '}').join(tr ? tr(m[k + 1]) : m[k + 1]); });
        return en;
      }
    }
    return null;
  }
  BARIS.forEach(tambahBaris); urutTemplat();

  return { UMUM: UMUM, BM: BM, EN: EN, INDEKS: INDEKS, TEMPLAT: TEMPLAT, ISTILAH: ISTILAH, KEKAL: KEKAL, PERATURAN: PERATURAN, MINGGU: MINGGU, NORMAL: NORMAL, tambah: tambah, padan: padan };
});
