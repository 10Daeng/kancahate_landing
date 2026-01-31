export const gad7Questions = [
  {
    id: 1,
    text: "Dalam 2 minggu terakhir, seberapa sering kamu merasa gugup, cemas, atau gelisah?",
    options: [
      { text: "Tidak pernah", value: 0 },
      { text: "Beberapa hari", value: 1 },
      { text: "Lebih dari separuh waktu", value: 2 },
      { text: "Hampir setiap hari", value: 3 }
    ]
  },
  {
    id: 2,
    text: "Dalam 2 minggu terakhir, seberapa sering kamu merasa tidak mampu menghentikan atau mengendalikan rasa khawatir?",
    options: [
      { text: "Tidak pernah", value: 0 },
      { text: "Beberapa hari", value: 1 },
      { text: "Lebih dari separuh waktu", value: 2 },
      { text: "Hampir setiap hari", value: 3 }
    ]
  },
  {
    id: 3,
    text: "Dalam 2 minggu terakhir, seberapa sering kamu terlalu khawatir tentang berbagai hal yang berbeda?",
    options: [
      { text: "Tidak pernah", value: 0 },
      { text: "Beberapa hari", value: 1 },
      { text: "Lebih dari separuh waktu", value: 2 },
      { text: "Hampir setiap hari", value: 3 }
    ]
  },
  {
    id: 4,
    text: "Dalam 2 minggu terakhir, seberapa sering kamu merasa sulit untuk santai?",
    options: [
      { text: "Tidak pernah", value: 0 },
      { text: "Beberapa hari", value: 1 },
      { text: "Lebih dari separuh waktu", value: 2 },
      { text: "Hampir setiap hari", value: 3 }
    ]
  },
  {
    id: 5,
    text: "Dalam 2 minggu terakhir, seberapa sering kamu merasa begitu gelisah sampai susah duduk diam?",
    options: [
      { text: "Tidak pernah", value: 0 },
      { text: "Beberapa hari", value: 1 },
      { text: "Lebih dari separuh waktu", value: 2 },
      { text: "Hampir setiap hari", value: 3 }
    ]
  },
  {
    id: 6,
    text: "Dalam 2 minggu terakhir, seberapa sering kamu merasa mudah tersinggung atau jengkel?",
    options: [
      { text: "Tidak pernah", value: 0 },
      { text: "Beberapa hari", value: 1 },
      { text: "Lebih dari separuh waktu", value: 2 },
      { text: "Hampir setiap hari", value: 3 }
    ]
  },
  {
    id: 7,
    text: "Dalam 2 minggu terakhir, seberapa sering kamu merasa takut seolah-olah sesuatu yang buruk akan terjadi?",
    options: [
      { text: "Tidak pernah", value: 0 },
      { text: "Beberapa hari", value: 1 },
      { text: "Lebih dari separuh waktu", value: 2 },
      { text: "Hampir setiap hari", value: 3 }
    ]
  }
];

export const calculateGAD7Score = (answers) => {
  let totalScore = 0;
  
  // Summing up values
  Object.values(answers).forEach(val => {
    totalScore += val;
  });

  let category = '';
  let description = '';
  let color = '';

  if (totalScore <= 4) {
    category = 'Kecemasan Minimal';
    description = 'Kondisimu tampaknya baik-baik saja. Rasa cemas yang kamu alami masih dalam batas wajar.';
    color = 'text-green-600 bg-green-50 border-green-200';
  } else if (totalScore <= 9) {
    category = 'Kecemasan Ringan';
    description = 'Kamu mungkin merasa sedikit gelisah, tapi masih bisa dikelola. Coba teknik relaksasi sederhana.';
    color = 'text-yellow-600 bg-yellow-50 border-yellow-200';
  } else if (totalScore <= 14) {
    category = 'Kecemasan Sedang';
    description = 'Rasa cemasmu mulai mengganggu. Sangat disarankan untuk mulai membicarakannya dengan orang terpercaya.';
    color = 'text-orange-600 bg-orange-50 border-orange-200';
  } else {
    category = 'Kecemasan Berat';
    description = 'Kamu mengalami tingkat kecemasan yang tinggi. Jangan dipendam sendiri, bantuan profesional bisa sangat membantu.';
    color = 'text-red-700 bg-red-50 border-red-200';
  }

  return { totalScore, category, description, color };
};
