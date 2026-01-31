export const pssQuestions = [
  {
    id: 1,
    text: "Dalam sebulan terakhir, seberapa sering kamu marah karena sesuatu yang tidak terduga?",
    reverse: false
  },
  {
    id: 2,
    text: "Dalam sebulan terakhir, seberapa sering kamu merasa tidak bisa mengontrol hal-hal penting dalam hidupmu?",
    reverse: false
  },
  {
    id: 3,
    text: "Dalam sebulan terakhir, seberapa sering kamu merasa gugup atau stres?",
    reverse: false
  },
  {
    id: 4,
    text: "Dalam sebulan terakhir, seberapa sering kamu merasa yakin dengan kemampuanmu menangani masalah pribadi?",
    reverse: true
  },
  {
    id: 5,
    text: "Dalam sebulan terakhir, seberapa sering kamu merasa segala sesuatu berjalan sesuai keinginanmu?",
    reverse: true
  },
  {
    id: 6,
    text: "Dalam sebulan terakhir, seberapa sering kamu merasa tidak bisa mengatasi semua hal yang harus kamu lakukan?",
    reverse: false
  },
  {
    id: 7,
    text: "Dalam sebulan terakhir, seberapa sering kamu mampu mengendalikan rasa kesal dalam kehidupanmu?",
    reverse: true
  },
  {
    id: 8,
    text: "Dalam sebulan terakhir, seberapa sering kamu merasa menguasai keadaan?",
    reverse: true
  },
  {
    id: 9,
    text: "Dalam sebulan terakhir, seberapa sering kamu marah karena hal-hal yang terjadi di luar kendalimu?",
    reverse: false
  },
  {
    id: 10,
    text: "Dalam sebulan terakhir, seberapa sering kamu merasa kesulitan menumpuk begitu tinggi sampai kamu tidak bisa mengatasinya?",
    reverse: false
  }
];

export const pssChoices = [
  { text: "Tidak Pernah", value: 0 },
  { text: "Hampir Tidak Pernah", value: 1 },
  { text: "Kadang-kadang", value: 2 },
  { text: "Sering", value: 3 },
  { text: "Sangat Sering", value: 4 }
];

export const calculatePSSScore = (answers) => {
  let totalScore = 0;
  
  // Ensure we have answers for all 10 questions
  if (Object.keys(answers).length < 10) return null;

  pssQuestions.forEach((q) => {
    let val = answers[q.id];
    if (q.reverse) {
      val = 4 - val; // 0->4, 4->0
    }
    totalScore += val;
  });

  let category = '';
  let description = '';
  let color = '';

  if (totalScore <= 13) {
    category = 'Stres Ringan';
    description = 'Kamu tampaknya bisa mengelola stres dengan baik. Pertahankan keseimbangan hidupmu!';
    color = 'text-green-600 bg-green-50 border-green-200';
  } else if (totalScore <= 26) {
    category = 'Stres Sedang';
    description = 'Kamu mengalami tekanan yang cukup berasa. Coba luangkan waktu untuk relaksasi atau bicara dengan teman.';
    color = 'text-yellow-600 bg-yellow-50 border-yellow-200';
  } else {
    category = 'Stres Berat';
    description = 'Bebanmu terasa sangat berat saat ini. Sangat disarankan untuk bercerita pada seseorang atau mencari bantuan profesional.';
    color = 'text-red-600 bg-red-50 border-red-200';
  }

  return { totalScore, category, description, color };
};
