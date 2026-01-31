
export const MI_QUIZ = {
  id: "MULTIPLE_INTELLIGENCE",
  title: "Kecerdasan Kamu Apa? (Gardner)",
  description: "Bukan cuma skor Matematika loh. Temukan 'superpower' unikmu di sini.",
  duration: "5 Menit",
  questionCount: 24,
  options: [
    { value: 1, text: "Sangat Tidak Setuju" },
    { value: 2, text: "Tidak Setuju" },
    { value: 3, text: "Setuju" },
    { value: 4, text: "Sangat Setuju" }
  ],
  optionsStandard: [
    { value: 1, label: "Sangat Tidak Setuju" },
    { value: 2, label: "Tidak Setuju" },
    { value: 3, label: "Setuju" },
    { value: 4, label: "Sangat Setuju" }
  ],
  questions: [
    // LOGICAL-MATHEMATICAL
    { id: 1, text: "Aku suka memecahkan teka-teki logika atau matematika.", type: "LM" },
    { id: 2, text: "Aku suka membuat daftar langkah-langkah untuk menyelesaikan masalah.", type: "LM" },
    { id: 3, text: "Aku suka bereksperimen dengan ide atau konsep baru.", type: "LM" },

    // VERBAL-LINGUISTIC
    { id: 4, text: "Aku suka menulis cerita, puisi, atau jurnal.", type: "VL" },
    { id: 5, text: "Aku hafal lirik lagu atau kutipan kata-kata dengan mudah.", type: "VL" },
    { id: 6, text: "Aku pandai berdebat atau menjelaskan sesuatu dengan kata-kata.", type: "VL" },

    // VISUAL-SPATIAL
    { id: 7, text: "Aku suka melukis, sketsa, atau mendesain sesuatu.", type: "VS" },
    { id: 8, text: "Aku bisa membayangkan peta jalan di kepala dengan jelas.", type: "VS" },
    { id: 9, text: "Aku sering melamun (daydream) atau membayangkan hal abstrak.", type: "VS" },

    // BODILY-KINESTHETIC
    { id: 10, text: "Aku suka berolahraga, dansa, atau aktivitas fisik.", type: "BK" },
    { id: 11, text: "Aku suka menyentuh atau memegang benda saat belajar.", type: "BK" },
    { id: 12, text: "Aku punya keahlian dalam kerajinan tangan atau memanipulasi alat.", type: "BK" },

    // MUSICAL
    { id: 13, text: "Aku sering bernyanyi atau bersiul di kepalaku.", type: "M" },
    { id: 14, text: "Aku bisa membedakan nada lagu dengan mudah.", type: "M" },
    { id: 15, text: "Hanya dengan mendengar musik, aku bisa tahu emosinya.", type: "M" },

    // INTERPERSONAL (Sosial)
    { id: 16, text: "Aku suka bergaul dan menghadiri acara sosial.", type: "I" },
    { id: 17, text: "Teman-temanku sering cerita masalah kepadaku.", type: "I" },
    { id: 18, text: "Aku bisa merasakan mood orang lain dengan mudah.", type: "I" },

    // INTRAPERSONAL (Introvert/Pemikir)
    { id: 19, text: "Aku suka sendirian dan merenung tentang kehidupan.", type: "IN" },
    { id: 20, text: "Aku tahu kekuatan, kelemahan, dan tujuan hidupku.", type: "IN" },
    { id: 21, text: "Aku mandiri dan percaya diri sendiri saat membuat keputusan.", type: "IN" },

    // NATURALIST (Alam)
    { id: 22, text: "Aku suka berkebun, merawat hewan, atau jalan-jalan di alam.", type: "N" },
    { id: 23, text: "Aku bisa membedakan jenis tanaman atau hewan dengan mudah.", type: "N" },
    { id: 24, text: "Aku peduli banget sama lingkungan hidup atau isu alam.", type: "N" }
  ]
};

export const MI_RESULTS = {
  LM: {
    title: "Logical-Mathematical Intelligence",
    desc: "Sensitivity to, and capacity to use, logical patterns, relationships, and statements. The ability to handle chains of reasoning and to use numbers effectively (Howard Gardner, 1983).",
    emoji: "🧮",
    color: "bg-blue-50 border-blue-200 text-blue-900",
    hexColor: "#3b82f6",
    gradient: "from-blue-400 to-indigo-500",
    strengths: ["Analitis", "Logis", "Suka teka-teki", "Problem solver", "Terstruktur"],
    weaknesses: ["Kurang kreatif artistik", "Terlalu serius", "Kadang overthinking"],
    studyTips: ["Buat chart dan diagram", "Gunakan outline terstruktur", "Latihan soal", "Analisis pola"],
    careers: ["Programmer", "Data Scientist", "Akuntan", "Ilmuwan", "Engineer", "Pengacara", "Matematikawan", "Auditor"],
    advice: "Gunakan kemampuan analitismu untuk memecahkan masalah kompleks. Tapi jangan lupa untuk juga mengembangkan sisi kreatifmu!"
  },
  VL: {
    title: "Verbal-Linguistic Intelligence",
    desc: "Sensitivity to the meaning, order, and sounds of words. The ability to use language fluently and creatively, both orally and in writing (Howard Gardner, 1983).",
    emoji: "📝",
    color: "bg-amber-50 border-amber-200 text-amber-900",
    hexColor: "#f59e0b",
    gradient: "from-amber-400 to-orange-500",
    strengths: ["Pandai bicara", "Puitis", "Hafal kata", "Persuasif", "Storyteller"],
    weaknesses: ["Kadang talkactive", "Terlalu sensitif pada kata-kata", "Kurang visual"],
    studyTips: ["Baca dan tulis ulang", "Buat ringkasan", "Diskusi dan debat", "Gunakan mnemonik ber kata"],
    careers: ["Penulis", "Jurnalis", "Dosen", "Politikus", "Copywriter", "Editor", "Penerjemah", "Broadcaster"],
    advice: "Keunggulan bahasamu adalah aset berharga! Gunakan untuk menginspirasi dan mempengaruhi orang lain."
  },
  VS: {
    title: "Visual-Spatial Intelligence",
    desc: "The ability to perceive the visual-spatial world accurately and to perform transformations upon those perceptions. Involves thinking in images, pictures, and shapes (Howard Gardner, 1983).",
    emoji: "🎨",
    color: "bg-purple-50 border-purple-200 text-purple-900",
    hexColor: "#a855f7",
    gradient: "from-purple-400 to-violet-500",
    strengths: ["Kreatif", "Imajinatif", "Sense of direction", "Artistik", "Visual thinker"],
    weaknesses: ["Sulit teks panjang", "Mudah distracted visual", "Kurang detail-oriented"],
    studyTips: ["Gunakan visual dan diagram", "Warnai catatan", "Mind mapping", "Video tutorial"],
    careers: ["Arsitek", "Desainer Grafis", "Pilot", "Fotografer", "Animator", "Art Director", "Interior Designer", "Game Designer"],
    advice: "Kreativitas visualmu luar biasa! Eksplorasi seni dan desain untuk mengexpress ide-ide unikmu."
  },
  BK: {
    title: "Bodily-Kinesthetic Intelligence",
    desc: "The ability to use one's body or parts of the body to solve problems or fashion products. Expert control of fine and gross motor movements (Howard Gardner, 1983).",
    emoji: "🏃",
    color: "bg-rose-50 border-rose-200 text-rose-900",
    hexColor: "#f43f5e",
    gradient: "from-rose-400 to-pink-500",
    strengths: ["Koordinasi tubuh", "Praktis", "Hands-on", "Energik", "Skill manual"],
    weaknesses: ["Sulit duduk diam", "Kurang fokus teori", "Restless"],
    studyTips: ["Praktek langsung", "Gerak saat belajar", "Role playing", "Flashcard yang bisa dipegang"],
    careers: ["Atlet", "Koki", "Aktor", "Mekanik", "Terapis Pijat", "Bedah", "Pilot", "Choreographer"],
    advice: "Kamu belajar lewat pengalaman fisik. Jangan ragu untuk bergerak saat belajar - itu adalah superpowermu!"
  },
  M: {
    title: "Musical Intelligence",
    desc: "Sensitivity to rhythm, pitch, and melody. The capacity to perceive, discriminate, transform, and express musical forms (Howard Gardner, 1983).",
    emoji: "🎵",
    color: "bg-pink-50 border-pink-200 text-pink-900",
    hexColor: "#ec4899",
    gradient: "from-pink-400 to-rose-500",
    strengths: ["Sense of rhythm", "Peka nada", "Hafal lagu", "Ekspresif lewat suara", "Auditory sensitive"],
    weaknesses: ["Distracted oleh noise", "Mood swings tergantung musik", "Kurang visual"],
    studyTips: ["Gunakan musik untuk fokus", "Buat lagu/rhyme untuk menghafal", "Belajar audio", "Rhythm dalam presentasi"],
    careers: ["Musisi", "Komposer", "Sound Engineer", "Vocal Coach", "Music Teacher", "Podcaster", "DJ", "Music Therapist"],
    advice: "Koneksimu dengan suara adalah gift. Gunakan musik sebagai media ekspresi dan bahkan untuk belajar!"
  },
  I: {
    title: "Interpersonal Intelligence",
    desc: "The ability to perceive and make distinctions in the moods, intentions, motivations, and feelings of other people. Social intelligence and empathy (Howard Gardner, 1983).",
    emoji: "👥",
    color: "bg-green-50 border-green-200 text-green-900",
    hexColor: "#22c55e",
    gradient: "from-green-400 to-emerald-500",
    strengths: ["Empati", "Leadership", "Komunikasi", "Team player", "Intuisi sosial"],
    weaknesses: ["Terlalu peduli opini orang", "Sulit sendirian", "Kelelahan sosial"],
    studyTips: ["Belajar kelompok", "Diskusi", "Teaching others", "Study buddy"],
    careers: ["HRD", "Guru", "Sales", "Psikolog", "Team Leader", "Konselor", "Politikus", "Social Worker"],
    advice: "Kemampuan membaca orang adalah superpower! Gunakan untuk memimpin dan membantu orang lain berkembang."
  },
  IN: {
    title: "Intrapersonal Intelligence",
    desc: "Self-knowledge and the ability to act adaptively on the basis of that knowledge. Access to one's own feelings and the ability to discriminate among them (Howard Gardner, 1983).",
    emoji: "🧘",
    color: "bg-indigo-50 border-indigo-200 text-indigo-900",
    hexColor: "#6366f1",
    gradient: "from-indigo-400 to-violet-500",
    strengths: ["Self-aware", "Independent", "Reflective", "Fokus", "Introspektif"],
    weaknesses: ["Terlalu dalam pikiran", "Sulit delegasi", "Kurang sosial"],
    studyTips: ["Belajar sendiri", "Jurnal refleksi", "Quiet environment", "Goal setting"],
    careers: ["Penulis Self-Help", "Peneliti", "Wirausahawan Mandiri", "Konselor Spiritual", "Philosopher", "Penulis Buku", "Terapis"],
    advice: "Kemampuan mengenal diri adalah langkah pertama kebijaksanaan. Gunakan introspeksimu untuk terus tumbuh dan membimbing orang lain."
  },
  N: {
    title: "Naturalist Intelligence",
    desc: "The ability to make distinctions in the natural world. The capacity to recognize and classify plants, animals, and other natural objects (Howard Gardner, 1995 - added as 8th intelligence).",
    emoji: "🌿",
    color: "bg-emerald-50 border-emerald-200 text-emerald-900",
    hexColor: "#10b981",
    gradient: "from-emerald-400 to-green-500",
    strengths: ["Observasi alam", "Klasifikasi", "Love animals/plants", "Eco-conscious", "Patient"],
    weaknesses: ["Kurang comfortable indoor", "Prefers outdoor", "Restless di kantor"],
    studyTips: ["Belajar di outdoor", "Kunjungan lapangan", "Observasi langsung", "Koneksi dengan nature"],
    careers: ["Biolog", "Ahli Botani", "Dokter Hewan", "Petani", "Naturalis", "Environmental Scientist", "Ranger", "Marine Biologist"],
    advice: "Koneksimu dengan alam adalah gift yang langka di dunia modern. Gunakan untuk menjaga dan melestarikan lingkungan!"
  }
};
