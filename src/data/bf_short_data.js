// --- BIG FIVE SHORT (BFI-2-X STYLE) ---
// 30 pertanyaan - 6 per trait
// Versi short yang lebih user-friendly untuk web

export const bigFiveShortQuestions = [
  // OPENNESS (O) - 6 questions
  {
    id: 'o1',
    text: 'Saya memiliki imajinasi yang aktif',
    domain: 'O',
    keyed: 'plus',
    facet: 'imagination'
  },
  {
    id: 'o2',
    text: 'Saya tertarik pada berbagai jenis musik, seni, dan literatur',
    domain: 'O',
    keyed: 'plus',
    facet: 'aesthetic'
  },
  {
    id: 'o3',
    text: 'Saya menikmati mendiskusikan teori dan abstrak',
    domain: 'O',
    keyed: 'plus',
    facet: 'ideas'
  },
  {
    id: 'o4',
    text: 'Saya suka mencoba hal baru dan berbeda',
    domain: 'O',
    keyed: 'plus',
    facet: 'adventure'
  },
  {
    id: 'o5',
    text: 'Saya mudah bosan dengan rutinitas',
    domain: 'O',
    keyed: 'plus',
    facet: 'variety'
  },
  {
    id: 'o6',
    text: 'Saya tidak terlalu tertarik dengan seni',
    domain: 'O',
    keyed: 'minus',
    facet: 'aesthetic'
  },

  // CONSCIENTIOUSNESS (C) - 6 questions
  {
    id: 'c1',
    text: 'Saya adalah orang yang terorganisir',
    domain: 'C',
    keyed: 'plus',
    facet: 'order'
  },
  {
    id: 'c2',
    text: 'Saya menyelesaikan tugas dengan segera',
    domain: 'C',
    keyed: 'plus',
    facet: 'diligence'
  },
  {
    id: 'c3',
    text: 'Salu bekerja keras untuk mencapai tujuan',
    domain: 'C',
    keyed: 'plus',
    facet: 'achievement'
  },
  {
    id: 'c4',
    text: 'Saya menepati janji',
    domain: 'C',
    keyed: 'plus',
    facet: 'reliability'
  },
  {
    id: 'c5',
    text: 'Saya suka merapikan',
    domain: 'C',
    keyed: 'plus',
    facet: 'order'
  },
  {
    id: 'c6',
    text: 'Saya sering lupa meletakkan barang',
    domain: 'C',
    keyed: 'minus',
    facet: 'order'
  },

  // EXTRAVERSION (E) - 6 questions
  {
    id: 'e1',
    text: 'Saya adalah orang yang ramah',
    domain: 'E',
    keyed: 'plus',
    facet: 'friendliness'
  },
  {
    id: 'e2',
    text: 'Saya menikmati being in keramaian',
    domain: 'E',
    keyed: 'plus',
    facet: 'sociability'
  },
  {
    id: 'e3',
    text: 'Saya memulai percakapan dengan orang asing',
    domain: 'E',
    keyed: 'plus',
    facet: 'assertiveness'
  },
  {
    id: 'e4',
    text: 'Saya merasa nyaman di sekitar orang',
    domain: 'E',
    keyed: 'plus',
    facet: 'social_confidence'
  },
  {
    id: 'e5',
    text: 'Saya mencari petualangan',
    domain: 'E',
    keyed: 'plus',
    facet: 'excitement'
  },
  {
    id: 'e6',
    text: 'Saya lebih suka sendirian daripada bersama orang',
    domain: 'E',
    keyed: 'minus',
    facet: 'sociability'
  },

  // AGREEABLENESS (A) - 6 questions
  {
    id: 'a1',
    text: 'Saya percaya pada orang lain',
    domain: 'A',
    keyed: 'plus',
    facet: 'trust'
  },
  {
    id: 'a2',
    text: 'Saya suka membantu orang lain',
    domain: 'A',
    keyed: 'plus',
    facet: 'helpfulness'
  },
  {
    id: 'a3',
    text: 'Saya bersimpati dengan perasaan orang lain',
    domain: 'A',
    keyed: 'plus',
    facet: 'compassion'
  },
  {
    id: 'a4',
    text: 'Saya tidak mudah tersinggung',
    domain: 'A',
    keyed: 'minus',
    facet: 'patience'
  },
  {
    id: 'a5',
    text: 'Saya menghargai kerjasama',
    domain: 'A',
    keyed: 'plus',
    facet: 'cooperation'
  },
  {
    id: 'a6',
    text: 'Saya bisa kasar kepada orang',
    domain: 'A',
    keyed: 'minus',
    facet: 'politeness'
  },

  // NEUROTICISM (N) - 6 questions
  {
    id: 'n1',
    text: 'Saya mudah khawatir',
    domain: 'N',
    keyed: 'plus',
    facet: 'anxiety'
  },
  {
    id: 'n2',
    text: 'Saya sering merasa sedih',
    domain: 'N',
    keyed: 'plus',
    facet: 'depression'
  },
  {
    id: 'n3',
    text: 'Saya mudah marah',
    domain: 'N',
    keyed: 'plus',
    facet: 'anger'
  },
  {
    id: 'n4',
    text: 'Saya sering merasa cemas',
    domain: 'N',
    keyed: 'plus',
    facet: 'anxiety'
  },
  {
    id: 'n5',
    text: 'Saya mudah panik',
    domain: 'N',
    keyed: 'plus',
    facet: 'anxiety'
  },
  {
    id: 'n6',
    text: 'Saya tetap tenang di bawah tekanan',
    domain: 'N',
    keyed: 'minus',
    facet: 'stability'
  }
];

// Likert scale choices
export const bigFiveShortChoices = [
  { text: 'Sangat Tidak Setuju', value: 1, color: 'bg-red-50 border-red-200 text-red-700' },
  { text: 'Tidak Setuju', value: 2, color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { text: 'Netral', value: 3, color: 'bg-slate-50 border-slate-200 text-slate-700' },
  { text: 'Setuju', value: 4, color: 'bg-green-50 border-green-200 text-green-700' },
  { text: 'Sangat Setuju', value: 5, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' }
];

// Calculate results
export const calculateBigFiveShortResults = (answers) => {
  const scores = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  const counts = { O: 0, C: 0, E: 0, A: 0, N: 0 };

  const questionMap = new Map(bigFiveShortQuestions.map(q => [q.id, q]));

  Object.entries(answers).forEach(([qId, userVal]) => {
    const q = questionMap.get(qId);
    if (!q) return;

    let finalScore = userVal;
    if (q.keyed === 'minus') {
      finalScore = 6 - userVal;
    }

    if (scores[q.domain] !== undefined) {
      scores[q.domain] += finalScore;
      counts[q.domain]++;
    }
  });

  // Calculate averages (scale 1-5)
  const results = {};
  Object.keys(scores).forEach(domain => {
    results[domain] = counts[domain] ? (scores[domain] / counts[domain]).toFixed(1) : 0;
  });

  // Determine personality level for each trait
  const levels = {};
  Object.keys(results).forEach(domain => {
    const score = parseFloat(results[domain]);
    if (score >= 4.0) levels[domain] = 'high';
    else if (score >= 3.0) levels[domain] = 'medium';
    else levels[domain] = 'low';
  });

  return { scores: results, levels };
};

// Big Five type descriptions with detailed info
export const BIG_FIVE_TYPES = {
  O: {
    name: 'Openness (Keterbukaan)',
    emoji: '🌈',
    color: 'purple',
    hexColor: '#a855f7',
    gradient: 'from-purple-400 to-violet-500',
    desc: 'Seberapa jauh kamu terbuka pada pengalaman baru, imajinatif, dan berpikir kreatif.',
    high: {
      title: 'Keterbukaan Tinggi',
      desc: 'Kamu imajinatif, penasaran, dan kreatif. Kamu suka mencoba hal baru dan menikmati variasi dalam hidup.',
      strengths: ['Kreatif dan inovatif', 'Penasaran', 'Terbuka pada pengalaman baru', 'Berpikir abstrak'],
      careers: ['Seniman', 'Desainer', 'Penulis', 'Peneliti', 'Content Creator', 'Arsitek'],
      advice: 'Terus eksplorasi ide dan pengalaman baru. Kreativitasmu adalah aset berharga!'
    },
    medium: {
      title: 'Keterbukaan Sedang',
      desc: 'Kamu seimbang antara tradisi dan inovasi. Terbuka pada hal baru tapi tetap menghargai yang sudah familiar.',
      strengths: ['Fleksibel', 'Praktis', 'Seimbang'],
      careers: ['Manager', 'Guru', 'Marketing', 'HR', 'Entrepreneur'],
      advice: 'Manfaatkan keseimbanganmu - bisa kreatif saat dibutuhkan, tetap praktis saat perlu.'
    },
    low: {
      title: 'Keterbukaan Rendah',
      desc: 'Kamu lebih nyaman dengan hal yang familiar, praktis, dan konkret. Kamu menyukai rutinitas dan kepastian.',
      strengths: ['Praktis', 'Realistis', 'Konsisten', 'Down-to-earth'],
      careers: ['Akuntan', 'Insinyur', 'Pengacara', 'Dokter', 'Tentara', 'Bankir'],
      advice: 'Keunggulanmu pada eksekusi dan praktikalitas. Tetap terbuka sedikit untuk pertumbuhan.'
    }
  },
  C: {
    name: 'Conscientiousness (Kesadaran)',
    emoji: '📋',
    color: 'blue',
    hexColor: '#3b82f6',
    gradient: 'from-blue-400 to-indigo-500',
    desc: 'Seberapa jauh kamu terorganisir, disiplin, dan dapat diandalkan.',
    high: {
      title: 'Kesadaran Tinggi',
      desc: 'Kamu sangat terorganisir, disiplin, dan selalu menepati janji. Kamu merencanakan segalanya dengan detail.',
      strengths: ['Terorganisir', 'Dapat diandalkan', 'Disiplin', 'Bertanggung jawab'],
      careers: ['Manajer', 'Akuntan', 'Pengacara', 'Dokter', 'Insinyur', 'Pilot'],
      advice: 'Kamu excellent dalam eksekusi! Jangan terlalu keras pada diri sendiri dan orang lain.'
    },
    medium: {
      title: 'Kesadaran Sedang',
      desc: 'Kamu cukup terorganisir tapi tetap fleksibel. Bisa disiplin saat perlu, rileks saat situasi memungkinkan.',
      strengths: ['Fleksibel', 'Cukup teratur', 'Adaptif'],
      careers: ['Guru', 'Sales', 'Marketing', 'Desainer', 'Jurnalis'],
      advice: 'Keseimbangan antap disiplin dan fleksibilitas adalah kekuatanmu.'
    },
    low: {
      title: 'Kesadaran Rendah',
      desc: 'Kamu lebih spontan dan fleksibel. Kurang suka perencanaan ketat dan lebih suka mengalir saja.',
      strengths: ['Spontan', 'Fleksibel', 'Santai', 'Kreatif'],
      careers: ['Artis', 'Musisi', 'Penulis Kreatif', 'Fotografer', 'Event Organizer'],
      advice: 'Spontaneitasmu menarik! Coba buat sedikit struktur untuk mencapai tujuan penting.'
    }
  },
  E: {
    name: 'Extraversion (Ekstraversi)',
    emoji: '🎉',
    color: 'yellow',
    hexColor: '#eab308',
    gradient: 'from-yellow-400 to-orange-500',
    desc: 'Seberapa jauh kamu energik, sosial, dan suka interaksi dengan orang.',
    high: {
      title: 'Ekstraversi Tinggi',
      desc: 'Kamu sociable, energik, dan suka menjadi pusat perhatian. Kamu mendapat energi dari interaksi sosial.',
      strengths: ['Sociable', 'Energik', 'Percaya diri', 'Pemimpin alami'],
      careers: ['Sales', 'Marketing', 'PR', 'Event Host', 'Pengacara', 'Politikus'],
      advice: 'Energimu menular! Gunakan kelebihan sosialmu untuk networking dan memimpin.'
    },
    medium: {
      title: 'Ekstraversi Sedang',
      desc: 'Kamu nyaman bersosial tapi juga butuh waktu sendiri. Seimbang antara dunia luar dan dalam.',
      strengths: ['Adaptif', 'Fleksibel', 'Peka'],
      careers: ['Konsultan', 'Guru', 'HR', 'Terapis', 'Entrepreneur'],
      advice: 'Kemampuanmu beradaptasi dengan situasi sosial adalah kekuatan unik.'
    },
    low: {
      title: 'Introversion (Ekstraversi Rendah)',
      desc: 'Kamu lebih reserved, menyukai waktu sendiri, dan mendapat energi dari dalam diri. Lebih nyaman dengan kelompok kecil.',
      strengths: ['Pendengar baik', 'Fokus', 'Independent', 'Deep thinker'],
      careers: ['Programmer', 'Penulis', 'Peneliti', 'Akademisi', 'Artist', 'Editor'],
      advice: 'Introver bukan kurang baik! Kamu memiliki kedalaman dan fokus yang luar biasa.'
    }
  },
  A: {
    name: 'Agreeableness (Keramahan)',
    emoji: '🤝',
    color: 'green',
    hexColor: '#22c55e',
    gradient: 'from-green-400 to-emerald-500',
    desc: 'Seberapa jauh kamu kooperatif, sopan, dan peduli pada orang lain.',
    high: {
      title: 'Keramahan Tinggi',
      desc: 'Kamu sangat peduli, kooperatif, dan suka membantu. Kamu mengutamakan harmoni dalam hubungan.',
      strengths: ['Empatik', 'Kooperatif', 'Peduli', 'Harmonis'],
      careers: ['Guru', 'Perawat', 'Psikolog', 'Social Worker', 'HR', 'Konselor'],
      advice: 'Empatimu adalah kekuatan! Tapi jangan lupa batasan untuk kesejahteraanmu sendiri.'
    },
    medium: {
      title: 'Keramahan Sedang',
      desc: 'Kamu cukup ramah dan kooperatif, tapi bisa tegas saat perlu. Seimbang antara kepentingan diri dan orang lain.',
      strengths: ['Seimbang', 'Adil', 'Fleksibel'],
      careers: ['Manager', 'Mediator', 'Konsultan', 'Entrepreneur'],
      advice: 'Kemampuanmu menyeimbangkan kebutuhan diri dan orang lain adalah skill berharga.'
    },
    low: {
      title: 'Keramahan Rendah',
      desc: 'Kamu lebih langsung, kompetitif, dan skeptis. Kamu menempatkan kepentingan diri di atas harmoni.',
      strengths: ['Jujur', 'Langsung', 'Kompetitif', 'Tegas'],
      careers: ['Kritikus', 'Pengacara', 'Ilmuwan', 'Pengusaha', 'CEO'],
      advice: 'Kejujuranmu segar! Coba tetap pertimbangkan perasaan orang lain sesekali.'
    }
  },
  N: {
    name: 'Neuroticism (Neurotisme)',
    emoji: '😰',
    color: 'red',
    hexColor: '#ef4444',
    gradient: 'from-red-400 to-rose-500',
    desc: 'Kecenderungan merasakan emosi negatif seperti cemas, sedih, atau marah.',
    high: {
      title: 'Neurotisme Tinggi',
      desc: 'Kamu lebih sensitif terhadap stres dan mudah merasakan emosi negatif. Kamu mungkin sering cemas atau mood swings.',
      strengths: ['Responsif', 'Peka', 'Vigilant'],
      challenges: ['Mudah cemas', 'Mood swings', 'Sensitive terhadap kritik'],
      careers: ['Artist', 'Kreatif', 'Penulis', 'Konselor (jika dikelola)'],
      advice: 'Sensitivitasmu bisa jadi kekuatan kreatif. Pelajari teknik manajemen stres.'
    },
    medium: {
      title: 'Neurotisme Sedang',
      desc: 'Kamu merasakan stres seperti orang pada umumnya. Bisa cemas saat situasi sulit, tapi tetap bisa mengelola.',
      strengths: ['Normal', 'Seimbang'],
      careers: ['Berbagai karir cocok'],
      advice: 'Keseimbangan emosional yang baik. Terus kembangkan resilience.'
    },
    low: {
      title: 'Neurotisme Rendah (Stabil)',
      desc: 'Kamu sangat tenang, stabil, dan tidak mudah tersinggung. Kamu menghadapi stres dengan baik.',
      strengths: ['Tenang', 'Stabil', 'Resilient', 'Tough'],
      careers: ['Pilot', 'Pemadam', 'Tentara', 'Surgeon', 'CEO', 'Pemimpin'],
      advice: 'Kestabilan emosionalmu adalah kekuatan super! Gunakan untuk situasi high-pressure.'
    }
  }
};

// Get personality description based on score
export const getBigFiveDescription = (domain, score) => {
  const scoreNum = parseFloat(score);
  let level = 'medium';
  if (scoreNum >= 4.0) level = 'high';
  else if (scoreNum < 3.0) level = 'low';

  return BIG_FIVE_TYPES[domain][level];
};
