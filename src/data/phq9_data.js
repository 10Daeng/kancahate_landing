// --- PHQ-9 DEPRESSION SCREENING DATA ---
// Gold Standard untuk screening depresi
// Validasi: Kroenke et al. (2001), Cronbach's alpha = 0.89

export const phq9Questions = [
  {
    id: 1,
    text: "Sedikit minat atau kesenangan dalam melakukan hal-hal",
    options: [
      { value: 0, label: "Tidak sama sekali", emoji: "😌" },
      { value: 1, label: "Beberapa hari", emoji: "🤔" },
      { value: 2, label: "Lebih dari seminggu", emoji: "😟" },
      { value: 3, label: "Hampir setiap hari", emoji: "😣" }
    ]
  },
  {
    id: 2,
    text: "Merasa sedih, depresi, atau putus asa",
    options: [
      { value: 0, label: "Tidak sama sekali", emoji: "😌" },
      { value: 1, label: "Beberapa hari", emoji: "🤔" },
      { value: 2, label: "Lebih dari seminggu", emoji: "😟" },
      { value: 3, label: "Hampir setiap hari", emoji: "😣" }
    ]
  },
  {
    id: 3,
    text: "Kesulitan tidur atau terlalu banyak tidur",
    options: [
      { value: 0, label: "Tidak sama sekali", emoji: "😌" },
      { value: 1, label: "Beberapa hari", emoji: "🤔" },
      { value: 2, label: "Lebih dari seminggu", emoji: "😟" },
      { value: 3, label: "Hampir setiap hari", emoji: "😣" }
    ]
  },
  {
    id: 4,
    text: "Merasa lelah atau kurang energi",
    options: [
      { value: 0, label: "Tidak sama sekali", emoji: "😌" },
      { value: 1, label: "Beberapa hari", emoji: "🤔" },
      { value: 2, label: "Lebih dari seminggu", emoji: "😟" },
      { value: 3, label: "Hampir setiap hari", emoji: "😣" }
    ]
  },
  {
    id: 5,
    text: "Nafsu makan berkurang atau makan berlebihan",
    options: [
      { value: 0, label: "Tidak sama sekali", emoji: "😌" },
      { value: 1, label: "Beberapa hari", emoji: "🤔" },
      { value: 2, label: "Lebih dari seminggu", emoji: "😟" },
      { value: 3, label: "Hampir setiap hari", emoji: "😣" }
    ]
  },
  {
    id: 6,
    text: "Merasa jelek tentang diri sendiri - atau merasa gagal",
    options: [
      { value: 0, label: "Tidak sama sekali", emoji: "😌" },
      { value: 1, label: "Beberapa hari", emoji: "🤔" },
      { value: 2, label: "Lebih dari seminggu", emoji: "😟" },
      { value: 3, label: "Hampir setiap hari", emoji: "😣" }
    ]
  },
  {
    id: 7,
    text: "Sulit berkonsentrasi pada hal-hal, seperti membaca koran atau menonton televisi",
    options: [
      { value: 0, label: "Tidak sama sekali", emoji: "😌" },
      { value: 1, label: "Beberapa hari", emoji: "🤔" },
      { value: 2, label: "Lebih dari seminggu", emoji: "😟" },
      { value: 3, label: "Hampir setiap hari", emoji: "😣" }
    ]
  },
  {
    id: 8,
    text: "Gerakan atau bicara lambat, atau sebaliknya sangat gelisah sehingga kamu bergerak kesana kemari",
    options: [
      { value: 0, label: "Tidak sama sekali", emoji: "😌" },
      { value: 1, label: "Beberapa hari", emoji: "🤔" },
      { value: 2, label: "Lebih dari seminggu", emoji: "😟" },
      { value: 3, label: "Hampir setiap hari", emoji: "😣" }
    ]
  },
  {
    id: 9,
    text: "Pikiran bahwa kamu lebih baik mati atau melukai diri sendiri",
    options: [
      { value: 0, label: "Tidak sama sekali", emoji: "😌" },
      { value: 1, label: "Beberapa hari", emoji: "🤔" },
      { value: 2, label: "Lebih dari seminggu", emoji: "😟" },
      { value: 3, label: "Hampir setiap hari", emoji: "😣" }
    ],
    isCrisis: true // Question 9 is critical for suicide risk
  }
];

/**
 * Calculate PHQ-9 Score
 * @param {Object} answers - User answers { questionId: value }
 * @returns {Object} Result with score, severity, and recommendations
 */
export function calculatePHQ9Score(answers) {
  // Calculate total score (0-27)
  let totalScore = 0;
  let suicidalThoughtScore = 0;

  phq9Questions.forEach(question => {
    const answer = answers[question.id];
    if (answer !== undefined) {
      totalScore += answer;

      // Track question 9 separately for suicide risk
      if (question.isCrisis) {
        suicidalThoughtScore = answer;
      }
    }
  });

  // Determine severity based on total score
  let severity, color, gradient, emoji, description, recommendations;

  if (totalScore <= 4) {
    severity = "Minimal";
    color = "text-green-600";
    gradient = "from-green-400 to-emerald-500";
    emoji = "😊";
    description = "Kamu tidak menunjukkan tanda-tanda depresi. Pertahankan kesehatan mentalmu dengan aktivitas positif!";
    recommendations = [
      "Tetap jaga pola hidup sehat",
      "Lakukan aktivitas yang kamu sukai",
      "Jaga koneksi dengan teman dan keluarga"
    ];
  } else if (totalScore <= 9) {
    severity = "Ringan";
    color = "text-yellow-600";
    gradient = "from-yellow-400 to-orange-500";
    emoji = "😔";
    description = "Kamu mungkin mengalami gejala depresi ringan. Ini wajar, tapi jangan dianggap remeh.";
    recommendations = [
      "Carilah dukungan dari teman dekat",
      "Coba olahraga ringan secara teratur",
      "Luangkan waktu untuk hobi",
      "Pertimbangkan untuk berbicara dengan konselor"
    ];
  } else if (totalScore <= 14) {
    severity = "Sedang";
    color = "text-orange-600";
    gradient = "from-orange-400 to-red-500";
    emoji = "😟";
    description = "Gejala depresi yang kamu alami sudah cukup signifikan. Disarankan untuk mencari bantuan profesional.";
    recommendations = [
      "Segera konsultasi dengan psikolog atau psikiater",
      "Jangan menahan beban sendirian",
      "Ceritakan perasaanmu pada orang terpercaya",
      "Pertimbangkan terapi konseling"
    ];
  } else if (totalScore <= 19) {
    severity = "Moderat hingga Berat";
    color = "text-red-600";
    gradient = "from-red-400 to-rose-600";
    emoji = "😢";
    description = "Gejala depresimu sudah mempengaruhi kehidupan sehari-hari. Sangat disarankan untuk mencari bantuan profesional segera.";
    recommendations = [
      "SEGERA hubungi profesional kesehatan mental",
      "Diskusikan dengan orang terdekat",
      "Pertimbangkan pengobatan jika disarankan dokter",
      "Jangan menunda untuk mencari bantuan"
    ];
  } else {
    severity = "Berat";
    color = "text-red-700";
    gradient = "from-red-600 to-rose-800";
    emoji = "😞";
    description = "Kamu memerlukan bantuan profesional SEGERA. Depresi berat adalah kondisi serius tapi bisa diobati.";
    recommendations = [
      "SEGERA kunjungi psikiater atau rumah sakit",
      "Hubungi hotline bantuan jika perlu",
      "Jangan ragu meminta bantuan orang terdekat",
      "Ikuti program pengobatan dengan disiplin"
    ];
  }

  // Crisis alert for suicidal thoughts (question 9)
  let crisisAlert = null;
  if (suicidalThoughtScore > 0) {
    crisisAlert = {
      level: suicidalThoughtScore,
      message: suicidalThoughtScore >= 2
        ? "⚠️ KAMI MENDUKUNGMU. Pikiran untuk melukai diri sendiri adalah tanda bahwa kamu butuh bantuan. Kamu tidak sendirian."
        : "💟 Jangan ragu mencari bantuan jika pikiran ini mengganggu kamu.",
      resources: [
        { name: "Hotline Sejiwa", phone: "0811-9294-9999" },
        { name: "LISA (Friendline)", phone: "0811-9525-252" },
        { name: "Into The Light Indonesia", url: "intothelightid.org" }
      ]
    };
  }

  return {
    score: totalScore,
    maxScore: 27,
    severity,
    color,
    gradient,
    emoji,
    description,
    recommendations,
    crisisAlert,
    suicidalThoughtScore
  };
}

/**
 * PHQ-9 severity levels for reference
 */
export const phq9SeverityLevels = {
  minimal: { min: 0, max: 4, label: "Minimal" },
  mild: { min: 5, max: 9, label: "Ringan" },
  moderate: { min: 10, max: 14, label: "Sedang" },
  moderatelySevere: { min: 15, max: 19, label: "Moderat hingga Berat" },
  severe: { min: 20, max: 27, label: "Berat" }
};
