// --- RIASEC RIMB STYLE ---
// Format: Setiap soal menampilkan 6 aktivitas (satu per tipe RIASEC)
// User memilih aktivitas yang PALING mereka sukai
// Ini lebih adil daripada Likert karena memaksa user membandingkan

export const riasecRimbQuestions = [
  // --- SET 1: Aktivitas Sehari-hari ---
  {
    id: 1,
    text: "Jika ada waktu luang, aktivitas apa yang PALING kamu sukai?",
    options: [
      { value: "R", label: "Memperbaiki gadget atau merakit barang", emoji: "🔧" },
      { value: "I", label: "Membaca artikel sains atau teka-teki logika", emoji: "🔬" },
      { value: "A", label: "Menggambar, desain, atau buat konten kreatif", emoji: "🎨" },
      { value: "S", label: "Nongkrong dan ngobrol dengan teman", emoji: "👥" },
      { value: "E", label: "Jualan online atau bisnis kecil-kecilan", emoji: "💼" },
      { value: "C", label: "Merapikan file atau atur jadwal harian", emoji: "📋" }
    ]
  },
  {
    id: 2,
    text: "Tugas sekolah yang paling kamu nikmati adalah...",
    options: [
      { value: "R", label: "Praktikum IPA atau proyek fisik", emoji: "⚗️" },
      { value: "I", label: "Riset atau investigasi kasus", emoji: "🔍" },
      { value: "A", label: "Membuat poster atau presentasi kreatif", emoji: "🖼️" },
      { value: "S", label: "Diskusi kelompok atau presentasi", emoji: "🗣️" },
      { value: "E", label: "Jadi ketua proyek atau memimpin tim", emoji: "👑" },
      { value: "C", label: "Membuat laporan terstruktur dengan rapi", emoji: "📊" }
    ]
  },
  {
    id: 3,
    text: "Acara TV atau YouTube yang paling sering kamu tonton...",
    options: [
      { value: "R", label: "Tutorial otomotif, masak, atau DIY", emoji: "🛠️" },
      { value: "I", label: "Documenter sains, teknologi, atau misteri", emoji: "🧠" },
      { value: "A", label: "Review film, seni, atau vlog kreatif", emoji: "🎬" },
      { value: "S", label: "Vlog kehidupan, podcast, atau talkshow", emoji: "🎙️" },
      { value: "E", label: "Bisnis, investasi, atau motivasi sukses", emoji: "📈" },
      { value: "C", label: "Edukasi terstruktur atau how-to terorganisir", emoji: "📚" }
    ]
  },
  {
    id: 4,
    text: "Jika kamu jadi orang terkaya, pekerjaan yang akan kamu geluti adalah...",
    options: [
      { value: "R", label: "Pilot atau atlet profesional", emoji: "✈️" },
      { value: "I", label: "Peneliti atau ilmuwan", emoji: "🔬" },
      { value: "A", label: "Seniman atau arsitek terkenal", emoji: "🏛️" },
      { value: "S", label: "Pekerja sosial atau dokter manusia", emoji: "🤝" },
      { value: "E", label: "CEO atau pengusaha sukses", emoji: "🏢" },
      { value: "C", label: "Konsultan keuangan atau auditor", emoji: "💰" }
    ]
  },
  {
    id: 5,
    text: "Main game itu seru kalau...",
    options: [
      { value: "R", label: "Bisa kontrol karakter langsung (action/sport)", emoji: "🎮" },
      { value: "I", label: "Ada puzzle atau misteri yang harus dipecahkan", emoji: "🧩" },
      { value: "A", label: "Grafisnya bagus dan penuh imajinasi", emoji: "🌈" },
      { value: "S", label: "Main bareng teman atau coop", emoji: "👫" },
      { value: "E", label: "Jadi leader dan strategi perang", emoji: "⚔️" },
      { value: "C", label: "Ada sistem, level, dan progresi yang jelas", emoji: "📈" }
    ]
  },

  // --- SET 2: Lingkungan Kerja ---
  {
    id: 6,
    text: "Lingkungan kerja impianmu adalah...",
    options: [
      { value: "R", label: "Lapangan, workshop, atau outdoor", emoji: "🌳" },
      { value: "I", label: "Lab atau ruang riset yang tenang", emoji: "🔬" },
      { value: "A", label: "Studio kreatif yang bebas berekspresi", emoji: "🎨" },
      { value: "S", label: "Tempat ramai dengan banyak interaksi", emoji: "🏢" },
      { value: "E", label: "Kantor modern di pusat bisnis", emoji: "🏙️" },
      { value: "C", label: "Ruangan rapi, terorganisir, sistematis", emoji: "🗄️" }
    ]
  },
  {
    id: 7,
    text: "Tipe bos yang paling kamu suka...",
    options: [
      { value: "R", label: "Yang turun langsung ke lapangan", emoji: "👷" },
      { value: "I", label: "Yang cerdas dan suka ngajarin hal baru", emoji: "👨‍🏫" },
      { value: "A", label: "Yang terbuka dengan ide kreatif", emoji: "🎭" },
      { value: "S", label: "Yang ramah dan peduli karyawan", emoji: "😊" },
      { value: "E", label: "Yang visioner dan challenging", emoji: "🚀" },
      { value: "C", label: "Yang jelas aturan dan fair", emoji: "⚖️" }
    ]
  },
  {
    id: 8,
    text: "Cara belajar yang paling efektif buatmu...",
    options: [
      { value: "R", label: "Praktek langsung, trial and error", emoji: "🔨" },
      { value: "I", label: "Baca, riset, dan analisis mandiri", emoji: "📖" },
      { value: "A", label: "Visual, imajinasi, dan eksplorasi", emoji: "🖼️" },
      { value: "S", label: "Diskusi dan belajar kelompok", emoji: "👥" },
      { value: "E", label: "Kompetisi dan target yang menantang", emoji: "🏆" },
      { value: "C", label: "Langkah demi langkah yang terstruktur", emoji: "📝" }
    ]
  },
  {
    id: 9,
    text: "Hadiah yang paling kamu sukai...",
    options: [
      { value: "R", label: "Alat atau barang yang bisa dipakai", emoji: "🛠️" },
      { value: "I", label: "Buku atau kursus ilmu pengetahuan", emoji: "📚" },
      { value: "A", label: "Karya seni atau barang estetik", emoji: "🖼️" },
      { value: "S", label: "Liburan bareng teman atau keluarga", emoji: "🏖️" },
      { value: "E", label: "Uang atau modal untuk usaha", emoji: "💵" },
      { value: "C", label: "Voucher belanja yang terencana", emoji: "🎫" }
    ]
  },
  {
    id: 10,
    text: "Saat ada masalah, reaksi pertamamu...",
    options: [
      { value: "R", label: "Langsung bertindak memperbaiki", emoji: "🔧" },
      { value: "I", label: "Menganalisa dan cari tahu penyebab", emoji: "🧠" },
      { value: "A", label: "Mencari solusi kreatif dan unik", emoji: "💡" },
      { value: "S", label: "Minta bantuan atau diskusi", emoji: "🤝" },
      { value: "E", label: "Ambil alih dan pimpin solusi", emoji: "👊" },
      { value: "C", label: "Buat rencana sistematis untuk selesaikan", emoji: "📋" }
    ]
  }
];

/**
 * Shuffle array utility for randomizing options
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get questions with randomized options (to prevent order bias)
 */
export function getRimbQuestions() {
  return riasecRimbQuestions.map(q => ({
    ...q,
    options: shuffleArray(q.options)
  }));
}

/**
 * Calculate RIASEC score from RIMB-style answers
 * @param {Object} answers - User answers { questionId: selectedType }
 * @returns {Object} Result with scores and ranking
 */
export function calculateRIASECRimbScore(answers) {
  // Initialize scores for each type
  const typeScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  // Count selections per type
  Object.values(answers).forEach(selectedType => {
    if (typeScores[selectedType] !== undefined) {
      typeScores[selectedType]++;
    }
  });

  // Convert to percentage (out of 10 questions)
  const maxPerType = 10; // Max possible selections per type
  const typePercentages = {};
  Object.keys(typeScores).forEach(type => {
    typePercentages[type] = Math.round((typeScores[type] / maxPerType) * 100);
  });

  // Sort types by score (descending)
  const sortedTypes = Object.entries(typeScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([type, score]) => ({
      type,
      score,
      percentage: typePercentages[type]
    }));

  // Get top 3 for Holland Code
  const top3Codes = sortedTypes.slice(0, 3).map(t => t.type).join('');
  const primaryType = sortedTypes[0].type;

  // Type descriptions (based on John L. Holland's RIASEC Theory)
  const riasecTypes = {
    R: {
      code: "R",
      name: "Realistic",
      title: "The Doers (Realistic)",
      emoji: "🔧",
      color: "bg-orange-500",
      gradient: "from-orange-400 to-amber-500",
      desc: "Practical, hands-on individuals who like working with tools, machines, and equipment. Enjoy physical activity and solving concrete problems.",
      keywords: ["Praktis", "Hands-on", "Mechanical", "Tools", "Physical"],
      jobs: ["Engineer", "Mechanic", "Pilot", "Chef", "Farmer", "Athlete", "Construction", "Electrician"],
      strengths: ["Practical skills", "Problem-solving with tools", "Physical coordination", "Hands-on aptitude"],
      advice: "Karir yang melibatkan kerja dengan objek nyata, alat, atau di luar ruangan akan sangat cocok dengan bakat praktismu!"
    },
    I: {
      code: "I",
      name: "Investigative",
      title: "The Thinkers (Investigative)",
      emoji: "🧠",
      color: "bg-blue-500",
      gradient: "from-blue-400 to-cyan-500",
      desc: "Analytical, intellectual, and scientific individuals who enjoy working with ideas, theories, and complex problem-solving.",
      keywords: ["Analitis", "Saintifik", "Research", "Theories", "Curiosity"],
      jobs: ["Scientist", "Doctor", "Programmer", "Researcher", "Data Analyst", "Mathematician", "Forensic", "Veterinarian"],
      strengths: ["Critical thinking", "Intellectual curiosity", "Analytical reasoning", "Problem analysis"],
      advice: "Karir yang menantang kemampuan analitis dan memecahkan masalah kompleks adalah tempatmu berkembang!"
    },
    A: {
      code: "A",
      name: "Artistic",
      title: "The Creators (Artistic)",
      emoji: "🎭",
      color: "bg-purple-500",
      gradient: "from-purple-400 to-pink-500",
      desc: "Imaginative, innovative, and expressive individuals who enjoy creative activities like art, drama, music, and creative writing.",
      keywords: ["Kreatif", "Imaginatif", "Ekspresif", "Inovatif", "Aesthetic"],
      jobs: ["Designer", "Artist", "Musician", "Architect", "Writer", "Photographer", "Actor", "Content Creator"],
      strengths: ["Creativity", "Original thinking", "Self-expression", "Artistic vision"],
      advice: "Karir yang memberikan kebebasan kreatif dan menghargai ekspresi artistik akan membuatmu bahagia!"
    },
    S: {
      code: "S",
      name: "Social",
      title: "The Helpers (Social)",
      emoji: "🤝",
      color: "bg-green-500",
      gradient: "from-green-400 to-emerald-500",
      desc: "People-oriented, empathetic individuals who enjoy teaching, helping, and working with people to solve problems.",
      keywords: ["Sosial", "Empatik", "Helping", "Teaching", "People"],
      jobs: ["Teacher", "Psychologist", "Counselor", "Social Worker", "Nurse", "HR", "Healthcare"],
      strengths: ["Empathy", "Communication", "Interpersonal skills", "Desire to help others"],
      advice: "Karir yang melibatkan interaksi dengan orang dan memberikan dampak positif adalah panggilanmu!"
    },
    E: {
      code: "E",
      name: "Enterprising",
      title: "The Persuaders (Enterprising)",
      emoji: "🚀",
      color: "bg-yellow-500",
      gradient: "from-yellow-400 to-orange-500",
      desc: "Outgoing, ambitious, and persuasive individuals who enjoy leading, persuading, and managing others.",
      keywords: ["Leadership", "Persuasive", "Ambitious", "Business", "Energetic"],
      jobs: ["CEO", "Manager", "Entrepreneur", "Sales", "Lawyer", "Politician", "Marketing", "Business Executive"],
      strengths: ["Leadership", "Persuasion", "Confidence", "Goal-oriented", "Risk-taking"],
      advice: "Karir yang menempatkanmu dalam posisi kepemimpinan dan memungkinkanmu berinovasi akan sangat cocok!"
    },
    C: {
      code: "C",
      name: "Conventional",
      title: "The Organizers (Conventional)",
      emoji: "📋",
      color: "bg-slate-500",
      gradient: "from-slate-400 to-gray-500",
      desc: "Organized, detail-oriented individuals who enjoy working with data, following procedures, and maintaining orderly systems.",
      keywords: ["Terorganisir", "Detail-oriented", "Structured", "Methodical", "Efficient"],
      jobs: ["Accountant", "Financial Analyst", "Secretary", "Banker", "Auditor", "Data Entry", "Administrator", "Programmer"],
      strengths: ["Organization", "Attention to detail", "Following procedures", "Accuracy", "Reliability"],
      advice: "Karir dengan sistem jelas, prosedur terstruktur, dan bekerja teratur akan sangat cocok dengan kepribadianmu!"
    }
  };

  return {
    hollandCode: top3Codes,
    primaryType: primaryType,
    allScores: sortedTypes,
    primaryInfo: riasecTypes[primaryType],
    typeBreakdown: sortedTypes.map(t => ({
      ...riasecTypes[t.type],
      score: t.score,
      percentage: t.percentage
    })),
    rawScores: typeScores
  };
}
