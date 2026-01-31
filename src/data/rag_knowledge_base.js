// --- RAG KNOWLEDGE BASE ---
// Database pengetahuan klinis terverifikasi untuk mengurangi hallucinations
// Data ini akan digunakan sebagai context tambahan saat AI merespons pertanyaan klinis

/**
 * KNOWLEDGE BASE - CBT TECHNIQUES
 * Teknik Cognitive Behavioral Therapy berbasis bukti
 */
export const CBT_TECHNIQUES = {
  cognitive_restructuring: {
    name: "Cognitive Restructuring",
    description: "Mengidentifikasi dan menantang pikiran negatif yang tidak realistis",
    steps: [
      "Identifikasi pikiran otomatis yang negatif",
      "Tantangan bukti yang mendukung vs menentang pikiran tersebut",
      "Ganti dengan pikiran yang lebih seimbang dan realistis",
      "Uji pikiran baru dengan eksperimen perilaku"
    ],
    examples: [
      {
        negative: "Aku pasti gagal ujian ini",
        challenge: "Apakah ada bukti bahwa aku akan gagal? Apakah ada bukti sebaliknya?",
        balanced: "Aku sudah belajar keras, hasil belum tentu buruk"
      },
      {
        negative: "Semua orang pasti membenciku",
        challenge: "Apakah benar SEMUA orang? Apakah ada teman yang peduli?",
        balanced: "Mungkin ada yang tidak suka, tapi ada juga yang peduli padaku"
      }
    ]
  },

  behavioral_activation: {
    name: "Behavioral Activation",
    description: "Meningkatkan aktivitas yang menyenangkan untuk memperbaiki mood",
    steps: [
      "Identifikasi aktivitas yang dulu kamu nikmati",
      "Mulai dengan aktivitas kecil dan mudah",
      "Jadwalkan aktivitas tersebut secara teratur",
      "Catat mood sebelum dan sesudah aktivitas"
    ],
    activities: [
      "Jalan-jalan 10 menit di sekitar rumah",
      "Mendengarkan musik favorit",
      "Menghubungi teman dekat",
      "Membaca buku cerita",
      "Memasak makanan kesukaan",
      "Bermain game santai",
      "Menonton film lucu"
    ]
  },

  exposure_therapy: {
    name: "Exposure Therapy (Ringan)",
    description: "Menghadapi fear secara bertahap untuk mengurangi anxiety",
    warning: "Hanya untuk fobia ringan. Untuk trauma/PTSD, butuh terapis profesional.",
    steps: [
      "Buat hierarki fear (1-10, 10 paling menakutkan)",
      "Mulai dari level 2-3 (jangan langsung level 10)",
      "Tahan di situasi tersebut sampai anxiety turun 50%",
      "Ulangi sampai comfortable, baru naik level"
    ],
    example: "Takut naik kendaraan umum → Mulai dengan lihat foto → Lihat dari jauh → Naik 1 halte → dst."
  },

  journaling: {
    name: "Thought Journaling",
    description: "Mencatat pikiran dan perasaan untuk memahami pola",
    template: {
      situation: "Apa yang terjadi?",
      thought: "Apa pikiran otomatismu?",
      emotion: "Apa yang kamu rasakan? (0-100%)",
      evidence_for: "Bukti apa yang mendukung pikiran itu?",
      evidence_against: "Bukti apa yang menentang?",
      alternative: "Pikiran alternatif yang lebih seimbang?"
    }
  }
};

/**
 * KNOWLEDGE BASE - GROUNDING TECHNIQUES
 * Teknik untuk mengurangi anxiety dan mengembalikan fokus ke saat ini
 */
export const GROUNDING_TECHNIQUES = {
  "5_4_3_2_1": {
    name: "Teknik 5-4-3-2-1",
    description: "Gunakan 5 indera untuk kembali ke saat ini",
    steps: [
      "Sebutkan 5 hal yang BISA KAMU LIHAT",
      "Sebutkan 4 hal yang BISA KAMU DENGAR",
      "Sebutkan 3 hal yang BISA KAMU RASAKAN (sentuhan)",
      "Sebutkan 2 hal yang BISA KAMU Cium",
      "Sebutkan 1 hal yang BISA KAMU RASAKAN (di mulut)"
    ]
  },

  box_breathing: {
    name: "Box Breathing (Pernapasan Kotak)",
    description: "Teknik pernapasan untuk menenangkan sistem saraf",
    steps: [
      "Tarik napas perlahan selama 4 hitungan",
      "Tahan napas selama 4 hitungan",
      "Hembuskan napas perlahan selama 4 hitungan",
      "Tahan kosong selama 4 hitungan",
      "Ulangi 4-8 kali"
    ],
    benefits: "Menurunkan heart rate, mengurangi cortisol, aktivasi parasympathetic nervous system"
  },

  body_scan: {
    name: "Body Scan Meditation",
    description: "Scanning tubuh untuk melepas tension",
    steps: [
      "Berbaring atau duduk nyaman",
      "Tutup mata, tarik napas dalam",
      "Fokus dari ujung kaki → kepala perlahan",
      "Setiap bagian: rasakan, lalu lepas tension",
      "Selesai dengan tarik napas dalam lagi"
    ],
    duration: "5-15 menit"
  }
};

/**
 * KNOWLEDGE BASE - CRISIS RESPONSE PROTOCOLS
 * Protokol standar untuk merespons indikator krisis
 */
export const CRISIS_PROTOCOLS = {
  suicide_self_harm: {
    level: "KRITIS",
    indicators: ["bunuh diri", "akhiri hidup", "lukai diri", "sayat", "gantung", "overdosis"],
    response_template: `Kamu sangat berharga dan aku prihatin dengan perasaanmu. Perasaan ini mungkin terasa sangat berat sekarang, tapi kamu tidak sendirian.

TOLONG SEGERA:
1. Hubungi orang dewasa yang kamu percaya (ortu, guru, kakak)
2. Layanan SEJIWA (119 ext 8) - Gratis & 24/7
3. Into the Light Indonesia: +62 812-3456-7890
4. RS jiwa terdekat

Keadaan ini bisa berubah dan ada bantuan yang tersedia. Kamu pantas mendapatkan dukungan.`,
    do_not: ["Jangan biarkan user sendirian", "Jangan judge atau marahi", "Jangan kasih solusi sederhana"]
  },

  abuse_violence: {
    level: "TINGGI",
    indicators: ["kdrt", "diperkosa", "dilecehkan", "kekerasan", "disiksa"],
    response_template: `Terima kasih sudah berani cerita. KEJADIAN INI BUKAN SALAHKAMU. Kamu tidak pantas mendapatkan kekerasan apapun.

YANG BISA KAMU LAKUKAN:
1. Jika sedang dalam bahaya: LARI ke tempat aman atau hubungi POLISI (110)
2. Komnas Perempuan: 021-314-9011
3. Layanan SAPA 129: 129 (24 jam untuk kekerasan terhadap perempuan/anak)
4. RWOC (Rumah Wanita dan Anak): Ada di berbagai kota

Kamu berani dan kuat. Ada bantuan yang tersedia.`,
    do_not: ["Jangan paksa 'cerita lebih lanjut' sebelum user siap", "Jangan judge"]
  },

  severe_depression: {
    level: "SEDANG",
    indicators: ["tidak bisa bangun", "tidak bisa makan", "tidak bisa tidur", "kehilangan minat semuanya", "merasa tidak berguna"],
    response_template: `Aku mendengar bahwa kamu sedang melalui masa yang sangat sulit. Perasaan seperti ini sangat berat dan valid.

MUNGKIN BISA MEMBANTU:
1. Jangan hadapi sendirian - cerita ke orang yang kamu percaya
2. Konsultasi ke psikolog/psikiater (bisa via online)
3. Mulai dengan langkah sangat kecil: bangun, minum air, mandi
4. Ingat: perasaan ini bersifat sementara, meskipun sekarang terasa permanen

Kalau kamu merasa tidak bisa lagi menahan, tolong hubungi profesional.`,
    follow_up: ["Apakah ada orang yang bisa kamu hubungi sekarang?", "Apa satu hal kecil yang bisa kamu lakukan hari ini?"]
  }
};

/**
 * KNOWLEDGE BASE - COPING STRATEGIES
 * Strategi coping berbasis bukti untuk situasi berbeda
 */
export const COPING_STRATEGIES = {
  academic_stress: {
    name: "Stres Akademik",
    strategies: [
      "Break besar tasks menjadi smaller, manageable chunks",
      "Pomodoro: 25 menit focus, 5 menit break",
      "Prioritaskan: Urgent & Important dulu",
      "Tidur cukup (7-9 jam) - memory consolidation terjadi saat tidur",
      "Jangan bandingkan diri dengan orang lain - everyone has different pace"
    ],
    mantra: "Aku hanya perlu fokus pada yang bisa kuontrol. Yang lain? Bodo amat."
  },

  social_anxiety: {
    name: "Kecemasan Sosial",
    strategies: [
      "Challenge: Apa worst case yang bisa terjadi? Biasanya tidak seburuk itu",
      "Focus pada orang lain, bukan diri sendiri",
      "Accept bahwa nervousness itu OK",
      "Start dengan small talk topik netral (weather, makanan, hobi)",
      "Reminder: Kebanyakan orang fokus ke diri sendiri, bukan kamu"
    ],
    mantra: "Aku tidak perlu sempurna. Cukup jadi diri sendiri sudah cukup."
  },

  relationship_issues: {
    name: "Masalah Hubungan",
    strategies: [
      "Communicate using 'I' statements: 'Aku merasa...' bukan 'Kamu selalu...'",
      "Set boundaries jelas dan respect boundaries orang lain",
      "Take break jika emosi memuncak - jangan diskusi saat marah",
      "Ask: Apa yang benar-benar aku mau dari hubungan ini?",
      "Toxic relationship: prioritize your mental health over 'saving' the relationship"
    ],
    mantra: "Aku berhak atas hubungan yang sehat dan saling menghargai."
  },

  body_image: {
    name: "Masalah Body Image",
    strategies: [
      "Focus pada APA BISA TUBUH KAMU lakukan, bukan bagaimana penampilannya",
      "Unfollow akun sosmed yang bikin insecure",
      "Challenge negative thoughts: 'Apa aku akan berkata ini ke temanku?'",
      "Self-care: mandi, pakai baju nyaman, makan nutritious food",
      "Remember: body goals di sosmed sering edited/pilih angle"
    ],
    mantra: "Tubuhku luar biasa karena membantuku hidup dan melakukan banyak hal."
  }
};

/**
 * KNOWLEDGE BASE - ASSESSMENT INTERPRETATION
 * Panduan interpretasi hasil psikotes (hanya untuk edukasi, bukan diagnosis)
 */
export const ASSESSMENT_GUIDES = {
  GAD7: {
    name: "GAD-7 (Generalized Anxiety Disorder)",
    disclaimer: "Skor ini hanya indikator, bukan diagnosis. Untuk diagnosis resmi, konsultasi dengan profesional.",
    ranges: [
      { min: 0, max: 4, level: "Minimal anxiety", advice: "Kecemasan normal. Lanjutkan coping strategies yang sehat." },
      { min: 5, max: 9, level: "Mild anxiety", advice: "Coba teknik relaksasi, journaling, atau curhat ke teman." },
      { min: 10, max: 14, level: "Moderate anxiety", advice: "Sangat disarankan konsultasi dengan psikolog." },
      { min: 15, max: 21, level: "Severe anxiety", advice: "Konsultasi dengan profesional sangat diperlukan." }
    ]
  },

  PSS10: {
    name: "PSS-10 (Perceived Stress Scale)",
    disclaimer: "Mengukur persepsi stres, bukan stres objektif. Skor tinggi = persepsi bahwa situasi sulit.",
    ranges: [
      { min: 0, max: 13, level: "Stress rendah", advice: "Tampaknya kamu mengelola stres dengan baik." },
      { min: 14, max: 26, level: "Stress sedang", advice: "Perhatikan coping strategies dan self-care." },
      { min: 27, max: 40, level: "Stress tinggi", advice: "Pertimbangkan bantuan profesional untuk manajemen stres." }
    ]
  },

  PHQ9: {
    name: "PHQ-9 (Patient Health Questionnaire)",
    disclaimer: "Untuk DEPRESSION screening. BUKAN diagnosis. Skor ≥15 memerlukan evaluasi profesional.",
    ranges: [
      { min: 0, max: 4, level: "Minimal", advice: "Tidak ada indikasi depresi." },
      { min: 5, max: 9, level: "Mild", advice: "Monitor gejala. Self-care dan dukungan sosial bisa membantu." },
      { min: 10, max: 14, level: "Moderate", advice: "Konsultasi dengan psikolog dianjurkan." },
      { min: 15, max: 19, level: "Moderately Severe", advice: "Evaluasi profesional diperlukan." },
      { min: 20, max: 27, level: "Severe", advice: "Konsultasi dengan psikiater diperlukan." }
    ],
    critical: "Jika jawaban #9 (bunuh diri) bukan 'tidak sama sekali': KRISIS MODE → Aktifkan protokol krisis"
  }
};

/**
 * RAG QUERY FUNCTION
 * Mendapatkan konten pengetahuan yang relevan berdasarkan keyword
 * @param {string} category - Kategori pengetahuan (CBT, GROUNDING, CRISIS, COPING, ASSESSMENT)
 * @param {string} keyword - Keyword spesifik untuk search
 * @returns {object|null} - Knowledge entry yang relevan
 */
export function queryKnowledgeBase(category, keyword = null) {
  const categories = {
    'CBT': CBT_TECHNIQUES,
    'GROUNDING': GROUNDING_TECHNIQUES,
    'CRISIS': CRISIS_PROTOCOLS,
    'COPING': COPING_STRATEGIES,
    'ASSESSMENT': ASSESSMENT_GUIDES
  };

  const cat = categories[category.toUpperCase()];
  if (!cat) return null;

  if (keyword) {
    // Search for keyword in category
    const lowerKey = keyword.toLowerCase();
    for (const [key, value] of Object.entries(cat)) {
      if (key.toLowerCase().includes(lowerKey) ||
          JSON.stringify(value).toLowerCase().includes(lowerKey)) {
        return { [key]: value };
      }
    }
  }

  return cat;
}

/**
 * FORMAT KNOWLEDGE FOR AI PROMPT
 * Mengubah knowledge base menjadi format yang bisa dimasukkan ke AI prompt
 * @param {object} knowledge - Knowledge object
 * @returns {string} - Formatted string for AI context
 */
export function formatKnowledgeForAI(knowledge) {
  if (!knowledge) return '';

  let formatted = '\n--- PENGETAHUAN KLINIS YANG RELEVANT ---\n';
  formatted += JSON.stringify(knowledge, null, 2);
  formatted += '\n--- AKHIR PENGETAHUAN KLINIS ---\n';

  return formatted;
}

export default {
  CBT_TECHNIQUES,
  GROUNDING_TECHNIQUES,
  CRISIS_PROTOCOLS,
  COPING_STRATEGIES,
  ASSESSMENT_GUIDES,
  queryKnowledgeBase,
  formatKnowledgeForAI
};
