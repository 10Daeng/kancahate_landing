// ============================================================
// CHAT CONFIGURATION CONSTANTS
// Berisi semua konfigurasi alur percakapan Kai
// ============================================================

// --- INTAKE FLOW (Hardcoded — konsisten & tidak bergantung AI) ---
export const INTAKE_FLOW = [
  {
    id: 'location',
    text: "Supaya ngobrolnya enak, boleh kasih tahu kamu lagi ngetik dari mana? (Di kamar, kafe, atau ruang tamu?)",
    type: 'text'
  },
  {
    id: 'name',
    text: "Wah, nyaman tuh kayaknya! Terus, biar lebih akrab, aku bisa panggil kamu siapa nih?",
    type: 'text'
  },
  {
    id: 'age',
    text: "Salam kenal! Kalau boleh tahu, kamu sekarang usianya berapa?",
    type: 'text'
  },
  {
    id: 'education_status',
    text: "Oh ya, sekarang kesibukan utamamu apa nih?",
    type: 'option',
    options: [
      "Pelajar SMP/MTs",
      "Pelajar SMA/SMK/MA",
      "Mahasiswa D3/S1",
      "Sudah Bekerja",
      "Lagi Cari Kerja",
      "Udah Lulus/Nggak Sekolah"
    ]
  }
];



// --- KONTEN EDUKATIF & QUOTE (Muncul di jeda sebelum menawarkan pilihan) ---
// Dipilih sesuai kategori untuk mengisi jeda saat AI memproses
export const EDUCATIONAL_CONTENT = {
  karir: [
    { type: 'quote', text: "\"Kebingungan memilih jalan bukan tanda kamu lemah — itu tanda kamu peduli pada masa depanmu.\"" },
    { type: 'fact', text: "💡 Tahukah kamu? Penelitian menunjukkan bahwa 60% orang bekerja di bidang yang berbeda dari jurusan kuliahnya. Pilihan karir bisa berkembang seiring pengalaman." },
    { type: 'tip', text: "🌱 Satu hal yang bisa membantu: tuliskan 3 hal yang kamu enjoy lakukan dan 3 hal yang kamu kuasai. Di persimpangan itulah biasanya passion tersembunyi." },
  ],
  pendidikan: [
    { type: 'quote', text: "\"Nilai di rapor mengukur satu hari ujianmu, bukan seluruh potensimu sebagai manusia.\"" },
    { type: 'fact', text: "💡 Riset menunjukkan bahwa stres akademik yang tidak dikelola bisa menurunkan kemampuan memori jangka pendek hingga 30%. Istirahat bukan malas — itu kebutuhan otak." },
    { type: 'tip', text: "🌱 Teknik Pomodoro — belajar 25 menit, istirahat 5 menit — terbukti lebih efektif daripada belajar terus-menerus tanpa jeda." },
  ],
  psikologi: [
    { type: 'quote', text: "\"Berani cerita adalah langkah pertama yang paling sulit — dan kamu sudah melakukannya.\"" },
    { type: 'fact', text: "💡 Memendam perasaan secara konsisten bisa meningkatkan hormon stres kortisol di tubuh. Curhat — bahkan ke jurnal — terbukti membantu menurunkan kadar stres." },
    { type: 'tip', text: "🌱 Teknik napas 4-7-8: hirup 4 hitungan, tahan 7 hitungan, hembuskan 8 hitungan. Ini mengaktifkan sistem saraf parasimpatis yang menenangkan tubuh." },
  ],
  keluarga: [
    { type: 'quote', text: "\"Keluarga yang tidak sempurna bukan berarti kamu tidak layak bahagia.\"" },
    { type: 'fact', text: "💡 Konflik keluarga yang tidak terselesaikan adalah salah satu sumber stres terbesar pada remaja. Kamu tidak sendirian merasakannya." },
    { type: 'tip', text: "🌱 Jika konflik langsung terasa berat, menulis surat (yang tidak harus dikirim) bisa membantu meluapkan perasaan dan menjernihkan pikiran." },
  ],
  pertemanan: [
    { type: 'quote', text: "\"Kehilangan teman yang salah memberi ruang untuk teman yang tepat.\"" },
    { type: 'fact', text: "💡 Hubungan sosial yang sehat berkontribusi besar pada kesehatan mental. Wajar jika konflik pertemanan terasa sangat menyakitkan — otak memproses penolakan sosial seperti rasa sakit fisik." },
    { type: 'tip', text: "🌱 Sebelum konfrontasi, coba bayangkan diri kamu dalam posisi temanmu. Ini bukan untuk membenarkan perilakunya, tapi untuk membantu kamu merespons dengan lebih bijak." },
  ],
  cinta: [
    { type: 'quote', text: "\"Mencintai diri sendiri bukan egois — itu fondasi dari semua hubungan yang sehat.\"" },
    { type: 'fact', text: "💡 Patah hati mengaktifkan area otak yang sama dengan rasa sakit fisik. Apa yang kamu rasakan itu nyata secara biologis, bukan sekadar 'lebay'." },
    { type: 'tip', text: "🌱 Journaling perasaan selama 15 menit per hari, selama 3-4 hari berturut-turut, terbukti mempercepat pemulihan emosional setelah kehilangan hubungan." },
  ],
  agama: [
    { type: 'quote', text: "\"Keraguan bukan lawan dari iman — seringkali ia adalah bagian dari perjalanan menuju iman yang lebih dalam.\"" },
    { type: 'fact', text: "💡 Banyak tokoh spiritual besar dalam sejarah pernah mengalami 'dark night of the soul' — periode krisis iman yang justru membawa mereka ke pemahaman yang lebih matang." },
    { type: 'tip', text: "🌱 Berdialog dengan diri sendiri tentang apa yang kamu percayai — terlepas dari tekanan sosial — adalah langkah yang valid dalam perjalanan spiritual." },
  ],
  medsos: [
    { type: 'quote', text: "\"Media sosial menampilkan highlight reel orang lain, bukan behind the scene-nya.\"" },
    { type: 'fact', text: "💡 Sebuah studi menemukan bahwa membatasi penggunaan sosmed hingga 30 menit per hari selama 3 minggu secara signifikan mengurangi perasaan kesepian dan depresi." },
    { type: 'tip', text: "🌱 Coba 'audit' akun yang kamu ikuti: hapus follow akun yang secara konsisten membuatmu merasa kurang. Kurasi feed-mu seperti kamu mengatur lingkungan rumahmu." },
  ],
  general: [
    { type: 'quote', text: "\"Tidak apa-apa tidak baik-baik saja. Yang penting kamu tidak sendirian.\"" },
    { type: 'fact', text: "💡 1 dari 5 remaja Indonesia mengalami masalah kesehatan mental, namun kurang dari 1% yang mendapatkan pertolongan profesional. Berani cerita adalah langkah yang luar biasa." },
    { type: 'tip', text: "🌱 Gerakan fisik — bahkan sekadar jalan kaki 10 menit — melepaskan endorfin yang secara langsung membantu memperbaiki suasana hati." },
  ],
};

// --- SUB TOPIK ---
export const SUB_TOPICS = {
  psikologi: ["Cemas Berlebih", "Depresi", "Trauma/PTSD", "Self-Harm", "Pikiran Bunuh Diri", "Gangguan Tidur", "Masalah Body Image", "Lainnya"],
  karir: ["Bingung Jurusan", "Gagal Tes/Seleksi", "Tekanan Orang Tua", "Lainnya"],
  pendidikan: ["Stres Ujian", "Tekanan Akademik", "Bullying", "Lainnya"],
  pertemanan: ["Konflik Teman", "Dikucilkan", "Jealousy", "Lainnya"],
  keluarga: ["Masalah Ortu", "KDRT", "Perceraian", "Sibling Rivalry", "Lainnya"],
  agama: ["Krisis Iman", "Rasa Bersalah", "Tekanan Sosial", "Lainnya"],
  cinta: ["Patah Hati", "Toxic Relationship", "LDR", "Dijodohkan", "Orientasi Seksual", "Lainnya"],
  medsos: ["Kecanduan Gadget", "FOMO", "Insecure karena Sosmed", "Cyberbullying", "Lainnya"],
  general: [
    "Keluarga & Orang Tua",
    "Diri Sendiri (Overthinking & Emosi)",
    "Pertemanan & Lingkungan",
    "Asmara & Perasaan",
    "Sekolah & Masa Depan",
    "Lainnya / Mau ketik sendiri"
  ]
};

export const SUBTOPIC_VALIDATION_MESSAGES = {
  "Keluarga & Orang Tua": "Ngomongin soal keluarga memang kadang bikin campur aduk, ya. Kadang sayang banget, tapi kadang juga bikin dada sesak. Pelan-pelan ya ceritanya...",
  "Diri Sendiri (Overthinking & Emosi)": "Berhadapan dengan pikiran dan emosi sendiri kadang rasanya seperti perang yang nggak berkesudahan ya. Pelan-pelan kita urai sama-sama.",
  "Pertemanan & Lingkungan": "Masalah pertemanan itu sering kali terasa berat banget karena wajar kita pengen merasa diterima. Aku di sini untuk dengerin kamu.",
  "Asmara & Perasaan": "Urusan hati memang bisa bikin dunia serasa naik roller coaster. Wajar kok kalau kamu ngerasa pusing atau sedih.",
  "Sekolah & Masa Depan": "Tekanan sekolah dan mikirin masa depan emang bisa bikin dada sesak dan kepala pusing. Ingat, kamu udah berjuang keras sejauh ini.",
  "Lainnya / Mau ketik sendiri": "Kadang perasaan itu campur aduk dan susah dikasih label. Nggak apa-apa, Kai siap dengerin apa pun yang mau kamu sampein."
};

// --- PERSONA OPTIONS ---
export const PERSONA_OPTIONS = [
  {
    id: 'formal',
    name: 'Formal & Profesional',
    style: 'Saya akan membantu dengan pendekatan profesional namun tetap hangat',
    tone: 'sopan'
  },
  {
    id: 'casual',
    name: 'Santai & Akrab',
    style: 'Aku bakal jadi teman curhat yang asik dan siap dengerin kamu.',
    tone: 'akrab'
  },
  {
    id: 'coach',
    name: 'Motivator Coach',
    style: 'Ayo kita hadapi sama-sama! Fokus pada solusi dan langkah maju, ya!',
    tone: 'semangat'
  }
];

// Pilih persona otomatis berdasarkan usia & status
export const selectPersonaBasedOnIdentity = (userData) => {
  const age = userData.age ? Number(userData.age) : 17;
  const isStudent = userData.education_status?.includes('Pelajar') || userData.education_status?.includes('Mahasiswa');
  const isWorking = userData.education_status?.includes('Bekerja');
  const isGraduate = userData.education_status?.includes('Lulus');

  if (age <= 18 && isStudent) return PERSONA_OPTIONS[1];   // Casual
  if (age >= 25 || isWorking || isGraduate) return PERSONA_OPTIONS[0]; // Formal
  return PERSONA_OPTIONS[2]; // Coach default
};

// Format waktu untuk bubble chat
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};
