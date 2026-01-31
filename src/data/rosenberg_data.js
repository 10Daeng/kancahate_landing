// --- ROSENBERG SELF-ESTEEM SCALE DATA ---
// Gold Standard untuk mengukur harga diri
// Validasi: Rosenberg (1965), Cronbach's alpha = 0.85-0.90

export const rosenbergQuestions = [
  {
    id: 1,
    text: "Pada dasarnya, saya merasa bahwa saya adalah orang yang berharga",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Setuju", emoji: "👍" },
      { value: 4, label: "Sangat Setuju", emoji: "🙋" }
    ],
    reverse: false
  },
  {
    id: 2,
    text: "Saya merasa bahwa saya memiliki sejumlah kualitas yang baik",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Setuju", emoji: "👍" },
      { value: 4, label: "Sangat Setuju", emoji: "🙋" }
    ],
    reverse: false
  },
  {
    id: 3,
    text: "Saya cenderung merasa bahwa saya adalah orang yang gagal",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Setuju", emoji: "👍" },
      { value: 4, label: "Sangat Setuju", emoji: "🙋" }
    ],
    reverse: true // Reverse scored
  },
  {
    id: 4,
    text: "Saya mampu melakukan sesuatu sebaik orang lain",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Setuju", emoji: "👍" },
      { value: 4, label: "Sangat Setuju", emoji: "🙋" }
    ],
    reverse: false
  },
  {
    id: 5,
    text: "Saya merasa tidak memiliki banyak untuk dibanggakan",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Setuju", emoji: "👍" },
      { value: 4, label: "Sangat Setuju", emoji: "🙋" }
    ],
    reverse: true // Reverse scored
  },
  {
    id: 6,
    text: "Saya mengambil sikap positif terhadap diri sendiri",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Setuju", emoji: "👍" },
      { value: 4, label: "Sangat Setuju", emoji: "🙋" }
    ],
    reverse: false
  },
  {
    id: 7,
    text: "Pada keseluruhannya, saya puas pada diri sendiri",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Setuju", emoji: "👍" },
      { value: 4, label: "Sangat Setuju", emoji: "🙋" }
    ],
    reverse: false
  },
  {
    id: 8,
    text: "Saya menghendaki lebih banyak rasa hormat pada diri sendiri",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Setuju", emoji: "👍" },
      { value: 4, label: "Sangat Setuju", emoji: "🙋" }
    ],
    reverse: true // Reverse scored
  },
  {
    id: 9,
    text: "Kadang-kadang saya merasa tidak berguna",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Setuju", emoji: "👍" },
      { value: 4, label: "Sangat Setuju", emoji: "🙋" }
    ],
    reverse: true // Reverse scored
  },
  {
    id: 10,
    text: "Kadang-kadang saya merasa tidak ada gunanya sama sekali",
    options: [
      { value: 1, label: "Sangat Tidak Setuju", emoji: "🙅" },
      { value: 2, label: "Tidak Setuju", emoji: "👎" },
      { value: 3, label: "Setuju", emoji: "👍" },
      { value: 4, label: "Sangat Setuju", emoji: "🙋" }
    ],
    reverse: true // Reverse scored
  }
];

/**
 * Calculate Rosenberg Self-Esteem Score
 * IMPORTANT: Questions 3, 5, 8, 9, 10 are REVERSE SCORED
 * For reverse questions: 1→4, 2→3, 3→2, 4→1
 * Formula: (MaxValue + 1) - OriginalValue
 *
 * @param {Object} answers - User answers { questionId: value }
 * @returns {Object} Result with score, level, and recommendations
 */
export function calculateRosenbergScore(answers) {
  let totalScore = 0;

  rosenbergQuestions.forEach(question => {
    let answer = answers[question.id];

    if (answer !== undefined) {
      // Apply reverse scoring if needed
      if (question.reverse) {
        // Reverse: 1→4, 2→3, 3→2, 4→1
        // Formula: (maxValue + 1) - answer
        answer = 5 - answer; // 4+1=5, so 5-answer
      }

      totalScore += answer;
    }
  });

  // Score range: 10-40
  let level, color, gradient, emoji, description, recommendations;

  if (totalScore >= 35) {
    level = "Sangat Tinggi";
    color = "text-green-600";
    gradient = "from-green-400 to-emerald-500";
    emoji = "🌟";
    description = "Harga diri kamu sangat kuat! Kamu memiliki kepercayaan diri yang sehat dan pandangan positif terhadap diri sendiri.";
    recommendations = [
      "Pertahankan sikap positifmu",
      "Bantu teman-teman yang membutuhkan",
      "Tetap rendah hati dan terus berkembang"
    ];
  } else if (totalScore >= 30) {
    level = "Tinggi";
    color = "text-teal-600";
    gradient = "from-teal-400 to-cyan-500";
    emoji = "😊";
    description = "Kamu memiliki harga diri yang sehat. Umumnya merasa positif tentang diri sendiri dengan kadang-kadang keraguan normal.";
    recommendations = [
      "Terima pujian dengan senang hati",
      "Rayakan pencapaianmu",
      "Jangan bandingkan dirimu dengan orang lain"
    ];
  } else if (totalScore >= 25) {
    level = "Sedang";
    color = "text-yellow-600";
    gradient = "from-yellow-400 to-orange-500";
    emoji = "🤔";
    description = "Harga dirimu berkisar di tengah-tengah. Kadang merasa baik, kadang ragu. Ini normal, tapi bisa ditingkatkan.";
    recommendations = [
      "Fokus pada kekuatan dan pencapaianmu",
      "Tantang pikiran negatif tentang dirimu",
      "Kejar aktivitas yang membuat kamu merasa mampu",
      "Gunakan kata-kata positif saat bicara pada diri sendiri"
    ];
  } else {
    level = "Rendah";
    color = "text-red-600";
    gradient = "from-red-400 to-rose-500";
    emoji = "😔";
    description = "Kamu mungkin sering merasa tidak percaya diri atau meragukan kemampuanmu. Ingat bahwa harga diri bisa ditingkatkan.";
    recommendations = [
      "Praktikkan self-compassion (berbaik hati pada diri sendiri)",
      "Tuliskan hal-hal baik tentang dirimu",
      "Kejar aktivitas kecil yang berhasil",
      "Pertimbangkan untuk berbicara dengan konselor",
      "Ingat bahwa tidak ada orang yang sempurna"
    ];
  }

  return {
    score: totalScore,
    maxScore: 40,
    minScore: 10,
    level,
    color,
    gradient,
    emoji,
    description,
    recommendations,
    interpretation: getInterpretation(totalScore)
  };
}

/**
 * Get detailed interpretation based on score
 */
function getInterpretation(score) {
  if (score >= 35) {
    return {
      title: "Harga Diri Sangat Kuat",
      strengths: ["Percaya diri tinggi", "Menerima diri sendiri", "Optimis"],
      challenges: ["Mungkin terlalu keras pada diri saat gagal"]
    };
  } else if (score >= 30) {
    return {
      title: "Harga Diri Sehat",
      strengths: ["Umumnya positif", "Bisa menghadapi tantangan", "Realistis"],
      challenges: ["Kadang ragu di situasi baru"]
    };
  } else if (score >= 25) {
    return {
      title: "Harga Diri Sedang",
      strengths: ["Sadar akan kekurangan", "Ingin berkembang"],
      challenges: ["Sering merasa tidak cukup", "Takut gagal", "Bandngkan diri dengan orang lain"]
    };
  } else {
    return {
      title: "Harga Diri Rendah",
      strengths: ["Introspektif", "Kritis terhadap diri sendiri"],
      challenges: ["Sering merasa tidak berharga", "Sulit menerima pujian", "Takut mencoba hal baru"]
    };
  }
}

/**
 * Rosenberg score ranges for reference
 */
export const rosenbergRanges = {
  veryHigh: { min: 35, max: 40, label: "Sangat Tinggi" },
  high: { min: 30, max: 34, label: "Tinggi" },
  medium: { min: 25, max: 29, label: "Sedang" },
  low: { min: 10, max: 24, label: "Rendah" }
};
