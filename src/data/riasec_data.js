// --- RIASEC QUIZ DATA (Holland Code) ---
// Tes Minat Karir - Gold Standard untuk Bimbingan Karir
// 30 Pertanyaan (5 per tipe) untuk akurasi maksimal
// Adapted for Gen Z dengan bahasa yang relate

export const riasecQuestions = [
  // --- REALISTIC (R) - The Doers ---
  {
    id: 1,
    text: "Saya suka bekerja dengan mesin atau alat.",
    type: "R",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 2,
    text: "Saya suka membangun atau merakit sesuatu.",
    type: "R",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 3,
    text: "Saya suka bekerja di luar ruangan.",
    type: "R",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 4,
    text: "Saya suka baca buku tentang peternakan atau hewan.",
    type: "R",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 5,
    text: "Saya suka hal yang praktis dan konkret.",
    type: "R",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },

  // --- INVESTIGATIVE (I) - The Thinkers ---
  {
    id: 6,
    text: "Saya suka memecahkan masalah matematika.",
    type: "I",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 7,
    text: "Saya suka mencari tahu penyebab sesuatu.",
    type: "I",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 8,
    text: "Saya suka membaca artikel ilmiah atau penelitian.",
    type: "I",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 9,
    text: "Saya suka menganalisis data.",
    type: "I",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 10,
    text: "Saya penasaran dengan bagaimana tubuh bekerja.",
    type: "I",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },

  // --- ARTISTIC (A) - The Creators ---
  {
    id: 11,
    text: "Saya suka menggambar, melukis, atau fotografi.",
    type: "A",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 12,
    text: "Saya suka menulis cerita atau puisi.",
    type: "A",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 13,
    text: "Saya suka bermain musik atau menyanyi.",
    type: "A",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 14,
    text: "Saya suka mendesain atau mendekorasi.",
    type: "A",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 15,
    text: "Saya suka ide yang unik dan orisinal.",
    type: "A",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },

  // --- SOCIAL (S) - The Helpers ---
  {
    id: 16,
    text: "Saya suka mengajar orang.",
    type: "S",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 17,
    text: "Saya suka menolong orang yang punya masalah.",
    type: "S",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 18,
    text: "Saya suka menjadi relawan.",
    type: "S",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 19,
    text: "Saya suka bergabung dengan organisasi sosial.",
    type: "S",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 20,
    text: "Saya nyaman berbicara di depan orang banyak.",
    type: "S",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },

  // --- ENTERPRISING (E) - The Persuaders ---
  {
    id: 21,
    text: "Saya suka memimpin tim.",
    type: "E",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 22,
    text: "Saya suka memulai bisnis sendiri.",
    type: "E",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 23,
    text: "Saya suka berdebat atau bernegosiasi.",
    type: "E",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 24,
    text: "Saya ingin menjadi pemimpin yang terkenal.",
    type: "E",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 25,
    text: "Saya suka menjual barang.",
    type: "E",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },

  // --- CONVENTIONAL (C) - The Organizers ---
  {
    id: 26,
    text: "Saya suka kerja kantor yang rapi.",
    type: "C",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 27,
    text: "Saya suka mengatur jadwal dan rencana.",
    type: "C",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 28,
    text: "Saya suka bekerja dengan angka.",
    type: "C",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 29,
    text: "Saya suka mengikuti aturan yang jelas.",
    type: "C",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
  {
    id: 30,
    text: "Saya suka sistem yang terorganisir.",
    type: "C",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Ragu-ragu", emoji: "🤔" },
      { value: 4, label: "Setuju", emoji: "👍" },
      { value: 5, label: "Sangat Setuju", emoji: "🙋" }
    ]
  },
];

// RIASEC Type Descriptions
export const riasecTypes = {
  R: {
    code: "R",
    name: "Realistic",
    title: "The Doers 🛠️",
    emoji: "🔧",
    color: "bg-orange-500",
    gradient: "from-orange-400 to-amber-500",
    desc: "Kamu tipe action-oriented. Suka kerja nyata, pakai tangan, dan ngerti mesin/alat. Praktis dan down-to-earth.",
    keywords: ["Praktis", "Hands-on", "Olahraga", "Alat"],
    jobs: ["Insinyur", "Pilot", "Chef", "Mekanik", "Petani", "Atlet", "Tukang"],
    strengths: ["Skill manual yang kuat", "Problem-solving praktis", "Independent"],
    advice: "Karir yang memungkinkan kamu bekerja dengan objek nyata, alat, atau di luar ruangan akan sangat cocok!"
  },
  I: {
    code: "I",
    name: "Investigative",
    title: "The Thinkers 🔍",
    emoji: "🧠",
    color: "bg-blue-500",
    gradient: "from-blue-400 to-cyan-500",
    desc: "Otakmu analitis banget. Suka observasi, riset, dan cari jawaban dari misteri. Curious dan logis.",
    keywords: ["Analitis", "Riset", "Sains", "Logika"],
    jobs: ["Data Scientist", "Dokter", "Programmer", "Peneliti", "Forensik", "Dokter Hewan"],
    strengths: ["Critical thinking", "Problem-solving intelektual", "Attention to detail"],
    advice: "Karir yang menantang otakmu, memerlukan analisis mendalam, dan eksplorasi pengetahuan adalah tempatmu bersinar!"
  },
  A: {
    code: "A",
    name: "Artistic",
    title: "The Creators 🎨",
    emoji: "🎭",
    color: "bg-purple-500",
    gradient: "from-purple-400 to-pink-500",
    desc: "Kamu bebas dan penuh imajinasi. Nggak suka aturan kaku, lebih suka ekspresi diri. Kreatif dan unik.",
    keywords: ["Kreatif", "Ekspresif", "Imajinatif", "Unik"],
    jobs: ["Desainer Grafis", "Content Creator", "Musisi", "Arsitek", "Penulis", "Fotografer"],
    strengths: ["Original thinking", "Ekspresi diri", "Inovasi"],
    advice: "Karir yang memberi kebebasan kreatif dan tidak terikat rutin kaku akan membuatmu bahagia!"
  },
  S: {
    code: "S",
    name: "Social",
    title: "The Helpers 💚",
    emoji: "🤝",
    color: "bg-green-500",
    gradient: "from-green-400 to-emerald-500",
    desc: "Empati kamu tinggi. Suka interaksi sosial, mengajar, dan ngasih dampak ke orang lain. Ramah dan caring.",
    keywords: ["Sosial", "Empati", "Mengajar", "Membantu"],
    jobs: ["Psikolog", "Guru", "HRD", "Perawat", "Social Worker", "Konselor"],
    strengths: ["Komunikasi", "Empati", "Leadership yang people-oriented"],
    advice: "Karir yang melibatkan interaksi dengan orang dan memberi dampak positif adalah panggilanmu!"
  },
  E: {
    code: "E",
    name: "Enterprising",
    title: "The Persuaders 💼",
    emoji: "🚀",
    color: "bg-yellow-500",
    gradient: "from-yellow-400 to-orange-500",
    desc: "Kamu born leader. Berani ngambil risiko, suka negosiasi, dan memimpin tim. Ambisius dan persuasif.",
    keywords: ["Leadership", "Bisnis", "Ambisius", "Persuasif"],
    jobs: ["CEO", "Marketing", "Sales Manager", "Pengacara", "Politikus", "Entrepreneur"],
    strengths: ["Persuasi", "Risk-taking", "Project management"],
    advice: "Karir yang menantang kamu memimpin, berinovasi, dan mencapai target akan membuatmu sukses!"
  },
  C: {
    code: "C",
    name: "Conventional",
    title: "The Organizers 📊",
    emoji: "📋",
    color: "bg-slate-500",
    gradient: "from-slate-400 to-gray-500",
    desc: "Kamu detail-oriented. Suka kerja dengan data, angka, dan sistem yang rapi/teratur. Terorganisir dan disiplin.",
    keywords: ["Teratur", "Detail", "Struktur", "Data"],
    jobs: ["Akuntan", "Analyst Keuangan", "Sekretaris", "Bankir", "Programmer", "Auditor"],
    strengths: ["Organisasi", "Akurasi", "Perencanaan"],
    advice: "Karir dengan sistem jelas, prosedur terstruktur, dan bekerja dengan data/angka akan sangat cocok!"
  }
};

// Calculate RIASEC scores from answers
export function calculateRIASECScore(answers) {
  // Initialize scores for each type
  const typeScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  // Sum scores per type based on answers
  riasecQuestions.forEach(question => {
    const answer = answers[question.id];
    if (answer !== undefined) {
      typeScores[question.type] += answer;
    }
  });

  // Sort types by score (descending)
  const sortedTypes = Object.entries(typeScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([type, score]) => ({ type, score }));

  // Get top 3 types for Holland Code (e.g., "AES", "RIS")
  const top3Codes = sortedTypes.slice(0, 3).map(t => t.type).join('');
  const primaryType = sortedTypes[0].type;

  return {
    hollandCode: top3Codes,
    primaryType: primaryType,
    allScores: sortedTypes,
    primaryInfo: riasecTypes[primaryType],
    typeBreakdown: sortedTypes.map(t => ({
      ...riasecTypes[t.type],
      score: t.score,
      percentage: Math.round((t.score / 25) * 100) // Max score per type = 5 questions × 5 = 25
    }))
  };
}
