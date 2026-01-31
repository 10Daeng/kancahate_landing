export const mbtiQuestions = [
  // E vs I
  {
    id: 'ei1',
    text: 'Saat di pesta atau acara sosial, saya cenderung...',
    options: [
      { text: 'Berinteraksi dengan banyak orang, termasuk yang belum kenal', value: 'E' },
      { text: 'Hanya mengobrol dengan beberapa teman dekat', value: 'I' }
    ]
  },
  {
    id: 'ei2',
    text: 'Setelah seharian beraktivitas, saya merasa berenergi kembali jika...',
    options: [
      { text: 'Berkumpul bersama teman-teman', value: 'E' },
      { text: 'Menghabiskan waktu sendirian', value: 'I' }
    ]
  },
  {
    id: 'ei3',
    text: 'Saya biasanya dikenal sebagai orang yang...',
    options: [
      { text: 'Terbuka dan mudah ditebak', value: 'E' },
      { text: 'Tertutup dan penuh privasi', value: 'I' }
    ]
  },
  {
    id: 'ei4',
    text: 'Dalam kelompok, saya lebih suka...',
    options: [
      { text: 'Bicara dan menyampaikan ide langsung', value: 'E' },
      { text: 'Mendengarkan dan berpikir sebelum bicara', value: 'I' }
    ]
  },
  {
    id: 'ei5',
    text: 'Saya lebih mudah...',
    options: [
      { text: 'Berkenalan dengan orang baru', value: 'E' },
      { text: 'Menunggu orang lain menyapa duluan', value: 'I' }
    ]
  },

  // S vs N
  {
    id: 'sn1',
    text: 'Saya lebih tertarik pada...',
    options: [
      { text: 'Fakta, detail, dan realitas saat ini', value: 'S' },
      { text: 'Ide, konsep, dan kemungkinan masa depan', value: 'N' }
    ]
  },
  {
    id: 'sn2',
    text: 'Saat menerima informasi, saya fokus pada...',
    options: [
      { text: 'Bukti nyata dan pengalaman konkrit', value: 'S' },
      { text: 'Pola, makna tersirat, dan simbol', value: 'N' }
    ]
  },
  {
    id: 'sn3',
    text: 'Saya lebih suka instruksi yang...',
    options: [
      { text: 'Jelas, langkah demi langkah', value: 'S' },
      { text: 'Memberi gambaran besar dan fleksibilitas', value: 'N' }
    ]
  },
  {
    id: 'sn4',
    text: 'Saya sering dianggap sebagai orang yang...',
    options: [
      { text: 'Praktis dan realistis', value: 'S' },
      { text: 'Imajinatif dan inovatif', value: 'N' }
    ]
  },
  {
    id: 'sn5',
    text: 'Ketika melihat lukisan, saya memperhatikan...',
    options: [
      { text: 'Warna, bentuk, dan teknik yang digunakan', value: 'S' },
      { text: 'Makna, emosi, dan pesan di baliknya', value: 'N' }
    ]
  },

  // T vs F
  {
    id: 'tf1',
    text: 'Dalam membuat keputusan penting, saya lebih mengandalkan...',
    options: [
      { text: 'Logika, analisis, dan prinsip objektif', value: 'T' },
      { text: 'Perasaan, nilai pribadi, dan dampak pada orang lain', value: 'F' }
    ]
  },
  {
    id: 'tf2',
    text: 'Saya lebih menghargai sifat...',
    options: [
      { text: 'Jujur dan adil', value: 'T' },
      { text: 'Harmonis dan penuh kasih', value: 'F' }
    ]
  },
  {
    id: 'tf3',
    text: 'Jika teman curhat masalah, reaksi pertama saya adalah...',
    options: [
      { text: 'Menawarkan solusi dan analisa masalah', value: 'T' },
      { text: 'Memberikan dukungan emosional dan validasi', value: 'F' }
    ]
  },
  {
    id: 'tf4',
    text: 'Saya lebih suka dianggap sebagai orang yang...',
    options: [
      { text: 'Kompeten dan cerdas', value: 'T' },
      { text: 'Hangat dan pengertian', value: 'F' }
    ]
  },
  {
    id: 'tf5',
    text: 'Konflik dan perdebatan bagi saya adalah...',
    options: [
      { text: 'Hal wajar untuk mencari kebenaran', value: 'T' },
      { text: 'Hal yang tidak nyaman dan sebaiknya dihindari', value: 'F' }
    ]
  },

  // J vs P
  {
    id: 'jp1',
    text: 'Saya lebih suka gaya hidup yang...',
    options: [
      { text: 'Terencana, teratur, dan terjadwal', value: 'J' },
      { text: 'Spontan, fleksibel, dan mengalir', value: 'P' }
    ]
  },
  {
    id: 'jp2',
    text: 'Saat mengerjakan tugas, saya...',
    options: [
      { text: 'Menyelesaikannya jauh sebelum tenggat waktu', value: 'J' },
      { text: 'Sering mengerjakannya di saat-saat terakhir (SKS)', value: 'P' }
    ]
  },
  {
    id: 'jp3',
    text: 'Saya merasa stres jika...',
    options: [
      { text: 'Rencana berubah mendadak', value: 'J' },
      { text: 'Harus mengikuti aturan yang terlalu kaku', value: 'P' }
    ]
  },
  {
    id: 'jp4',
    text: 'Meja kerja atau kamar saya biasanya...',
    options: [
      { text: 'Rapi dan tertata', value: 'J' },
      { text: 'Sedikit berantakan tapi saya tahu letak barangnya', value: 'P' }
    ]
  },
  {
    id: 'jp5',
    text: 'Dalam liburan, saya lebih suka...',
    options: [
      { text: 'Punya itinerary lengkap', value: 'J' },
      { text: 'Memutuskan mau kemana saat sudah sampai', value: 'P' }
    ]
  }
];

export const calculateMBTIResults = (answers) => {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  
  Object.values(answers).forEach(val => {
    if (scores[val] !== undefined) scores[val]++;
  });

  const type = [
    scores.E >= scores.I ? 'E' : 'I',
    scores.S >= scores.N ? 'S' : 'N',
    scores.T >= scores.F ? 'T' : 'F',
    scores.J >= scores.P ? 'J' : 'P'
  ].join('');

  return { type, scores };
};

export const MBTI_TYPES = {
  'ISTJ': {
    name: 'The Logistician',
    desc: 'Praktis, fakta-oriented, dan sangat dapat diandalkan. Serius dan tenang.',
    traits: ['Bertanggung jawab', 'Tulus', 'Tradisional'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/istj-logistician.svg',
    strengths: ['Honest and direct', 'Determined and strong-willed', 'Very responsible', 'Calm and practical', 'Create and enforce order'],
    weaknesses: ['Stubborn', 'Insensitive', 'Judgmental', 'Uncomfortable with change'],
    careers: ['Accountant', 'Auditor', 'Data Analyst', 'Doctor', 'Dentist', 'Lawyer', 'Police Officer', 'Military'],
    advice: 'Kamu sangat cocok di lingkungan yang terstruktur dengan aturan jelas. Karir yang membutuhkan ketelitian, analisis, dan tanggung jawab akan sangat cocok.'
  },
  'ISFJ': {
    name: 'The Defender',
    desc: 'Pelindung yang sangat berdedikasi dan hangat. Selalu siap membela orang yang dicintai.',
    traits: ['Setia', 'Sabar', 'Observan'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/isfj-defender.svg',
    strengths: ['Supportive and reliable', 'Patient', 'Imaginative and observant', 'Enthusiastic', 'Loyal and hard-working'],
    weaknesses: ['Modest', 'Take things personally', 'Repress their feelings', 'Overload themselves'],
    careers: ['Teacher', 'Nurse', 'Social Worker', 'HR', 'Counselor', 'Administrative Assistant', 'Office Manager'],
    advice: 'Kamu peduli dengan orang lain dan suka membantu. Karir yang melibatkan pelayanan dan dukungan akan sangat memuaskan.'
  },
  'INFJ': {
    name: 'The Advocate',
    desc: 'Pendiam dan mistis, namun sangat menginspirasi dan idealis tanpa lelah.',
    traits: ['Kreatif', 'Berwawasan luas', 'Prinsipil'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/infj-advocate.svg',
    strengths: ['Creative and insightful', 'Inspiring and convincing', 'Decisive and determined', 'Altruistic and empathetic'],
    weaknesses: ['Sensitive', 'Extremely private', 'Perfectionist', 'Burnout prone'],
    careers: ['Psychologist', 'Counselor', 'Writer', 'HR', 'Social Worker', 'Teacher', 'Non-profit'],
    advice: 'Kamu punya visi mendalam dan ingin mengubah dunia. Karir yang sejalan dengan nilai-nilaimu dan memberi dampak positif akan sangat cocok.'
  },
  'INTJ': {
    name: 'The Architect',
    desc: 'Pemikir imajinatif dan strategis, dengan rencana untuk segalanya.',
    traits: ['Rasional', 'Independen', 'Determined'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/intj-architect.svg',
    strengths: ['Strategic thinking', 'High standards', 'Knowledgeable', 'Independent', 'Decisive'],
    weaknesses: ['Arrogant', 'Judgmental', 'Overly analytical', 'Dislike constraints'],
    careers: ['Software Architect', 'Scientist', 'Engineer', 'Strategic Planner', 'Investment Analyst', 'Professor'],
    advice: 'Kamu visioner dengan kemampuan strategis. Karir yang memungkinkanmu merancang sistem dan memecahkan masalah kompleks akan sangat cocok.'
  },
  'ISTP': {
    name: 'The Virtuoso',
    desc: 'Eksperimentator yang berani dan praktis, menguasai segala jenis alat.',
    traits: ['Optimis', 'Energik', 'Spontan'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/istp-virtuoso.svg',
    strengths: ['Optimistic and energetic', 'Creative and practical', 'Spontaneous', 'Know how to prioritize'],
    weaknesses: ['Private', 'Insensitive', 'Easily bored', 'Commitment phobic'],
    careers: ['Mechanic', 'Engineer', 'Pilot', 'Chef', 'Forensic Scientist', 'Data Analyst'],
    advice: 'Kamu suka praktek langsung dan memecahkan masalah praktis. Karir hands-on dengan variasi akan sangat cocok.'
  },
  'ISFP': {
    name: 'The Adventurer',
    desc: 'Seniman yang fleksibel dan menawan, selalu siap menjelajahi dan mencoba hal baru.',
    traits: ['Artistik', 'Sensitif', 'Berjiwa bebas'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/isfp-adventurer.svg',
    strengths: ['Charming and sensitive', 'Imaginative', 'Passionate', 'Artistic'],
    weaknesses: ['Indecisive', 'Unpredictable', 'Fluctuating self-esteem', 'Easily hurt'],
    careers: ['Designer', 'Artist', 'Musician', 'Photographer', 'Fashion', 'Interior Designer', 'Veterinarian'],
    advice: 'Kamu kreatif dan butuh kebebasan berekspresi. Karir yang memungkinkan kreativitas dan fleksibilitas akan sangat memuaskan.'
  },
  'INFP': {
    name: 'The Mediator',
    desc: 'Puitis, baik hati, dan altruistik, selalu ingin membantu tujuan baik.',
    traits: ['Empatik', 'Idealis', 'Ber-gairah'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/infp-mediator.svg',
    strengths: ['Empathetic', 'Generous', 'Open-minded', 'Creative'],
    weaknesses: ['Too idealistic', 'Difficult to get to know', 'Impractical', 'Self-critical'],
    careers: ['Writer', 'Artist', 'Counselor', 'Psychologist', 'Social Worker', 'Editor', 'NGO'],
    advice: 'Kamu idealis dengan hati yang peduli. Karir yang sejalan dengan nilai-nilaimu dan membantu orang lain akan sangat bermakna.'
  },
  'INTP': {
    name: 'The Logician',
    desc: 'Penemu yang inovatif dengan dahaga akan pengetahuan yang tidak ada habisnya.',
    traits: ['Analitis', 'Abstrak', 'Obyektif'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/intp-logician.svg',
    strengths: ['Analytical', 'Original', 'Open-minded', 'Honest', 'Objective'],
    weaknesses: ['Absent-minded', 'Insensitive', 'Dissatisfied', 'Impatient'],
    careers: ['Software Developer', 'Scientist', 'Researcher', 'Professor', 'Data Scientist', 'Mathematician'],
    advice: 'Kamu penemu yang suka analisis mendalam. Karir yang melibatkan riset, teknologi, atau pemecahan masalah kompleks akan sangat cocok.'
  },
  'ESTP': {
    name: 'The Entrepreneur',
    desc: 'Pintar, berenergi, dan sangat perseptif, yang benar-benar menikmati hidup di ujung tanduk.',
    traits: ['Berani', 'Langsung', 'Sosial'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/estp-entrepreneur.svg',
    strengths: ['Bold', 'Direct and practical', 'Perceptive', 'Original'],
    weaknesses: ['Insensitive', 'Impatient', 'Risk-prone', 'Unstructured'],
    careers: ['Entrepreneur', 'Sales', 'Marketing', 'Police', 'Detective', 'Athlete', 'Trader'],
    advice: 'Kamu berani dan suka tantangan. Karir yang dinamis dengan risiko dan reward akan sangat cocok.'
  },
  'ESFP': {
    name: 'The Entertainer',
    desc: 'Orang yang spontan, berenergi, dan antusias - hidup tidak akan pernah membosankan di sekitar mereka.',
    traits: ['Playful', 'Praktis', 'Spontan'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/esfp-entertainer.svg',
    strengths: ['Bold', 'Original', 'Aesthetics and showmanship', 'Practical', 'Observant'],
    weaknesses: ['Sensitive', 'Conflict-averse', 'Easily bored', 'Poor long-term planner'],
    careers: ['Actor', 'Performer', 'Event Planner', 'Sales', 'Tour Guide', 'Fashion Consultant', 'PR'],
    advice: 'Kamu suka jadi pusat perhatian dan menghibur orang. Karir yang melibatkan interaksi sosial dan kreativitas akan sangat menyenangkan.'
  },
  'ENFP': {
    name: 'The Campaigner',
    desc: 'Semangat bebas yang antusias, kreatif, dan mudah bergaul, yang selalu dapat menemukan alasan untuk tersenyum.',
    traits: ['Penasaran', 'Observan', 'Antusias'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/enfp-campaigner.svg',
    strengths: ['Curious', 'Observant', 'Energetic', 'Excellent communicators', 'Easy-going'],
    weaknesses: ['Poor practical skills', 'Difficult to focus', 'Overthinking', 'Stressed easily'],
    careers: ['Journalist', 'Creative Director', 'Teacher', 'Counselor', 'Marketing', 'Event Coordinator'],
    advice: 'Kamu antusias dan suka menginspirasi orang. Karir yang kreatif dan melibatkan banyak interaksi akan sangat cocok.'
  },
  'ENTP': {
    name: 'The Debater',
    desc: 'Pemikir yang cerdas dan serius yang gatal akan tantangan intelektual.',
    traits: ['Berpengetahuan', 'Cepat berpikir', 'Orisinal'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/entp-debater.svg',
    strengths: ['Knowledgeable', 'Quick thinker', 'Original', 'Charismatic', 'Excellent brainstormer'],
    weaknesses: ['Argumentative', 'Insensitive', 'Intolerant', 'Can find small talk boring'],
    careers: ['Lawyer', 'Consultant', 'Entrepreneur', 'Journalist', 'Marketing Strategist', 'Political Analyst'],
    advice: 'Kamu suka debat dan ide baru. Karir yang melibatkan negosiasi, strategi, dan inovasi akan sangat menantang.'
  },
  'ESTJ': {
    name: 'The Executive',
    desc: 'Administrator yang sangat baik, tidak tertandingi dalam mengelola hal-hal atau orang.',
    traits: ['Berdedikasi', 'Jujur', 'Tertib'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/estj-executive.svg',
    strengths: ['Dedicated', 'Strong-willed', 'Loyal', 'Patient', 'Organized'],
    weaknesses: ['Stubborn', 'Inflexible', 'Judgmental', 'Uncomfortable with abstract ideas'],
    careers: ['Executive', 'Manager', 'Administrator', 'Military Officer', 'Judge', 'School Principal'],
    advice: 'Kamu pemimpin alami dengan kemampuan organisasi. Karir yang membutuhkan manajemen dan kepemimpinan akan sangat cocok.'
  },
  'ESFJ': {
    name: 'The Consul',
    desc: 'Orang yang sangat peduli, sosial, dan populer, selalu ingin membantu.',
    traits: ['Hangat', 'Setia', 'Terhubung'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/esfj-consul.svg',
    strengths: ['Strong practical skills', 'Strong sense of duty', 'Loyal', 'Sensitive', 'Good at connecting'],
    weaknesses: ['Worried about social status', 'Inflexible', 'Vulnerable to criticism', 'Too needy'],
    careers: ['Teacher', 'Social Worker', 'HR Manager', 'Nurse', 'Administrative', 'Event Planner'],
    advice: 'Kamu peduli dengan harmoni sosial dan membantu orang. Karir yang melibatkan pelayanan dan koordinasi akan sangat bermakna.'
  },
  'ENFJ': {
    name: 'The Protagonist',
    desc: 'Pemimpin yang karismatik dan menginspirasi, mampu memukau pendengarnya.',
    traits: ['Toleran', 'Reliable', 'Karismatik'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/enfj-protagonist.svg',
    strengths: ['Charismatic', 'Natural leaders', 'Tolerant', 'Reliable', 'Altruistic'],
    weaknesses: ['Too idealistic', 'Too selfless', 'Too sensitive', 'Fluctuating self-esteem'],
    careers: ['Teacher', 'HR Manager', 'Coach', 'Non-profit Leader', 'Politician', 'Trainer'],
    advice: 'Kamu pemimpin karismatik yang ingin menginspirasi orang lain. Karir yang memungkinkanmu membantu orang berkembang akan sangat memuaskan.'
  },
  'ENTJ': {
    name: 'The Commander',
    desc: 'Pemimpin yang berani, imajinatif, dan berkemauan keras, selalu menemukan cara - atau membuatnya.',
    traits: ['Efisien', 'Energetik', 'Percaya diri'],
    image: 'https://www.16personalities.com/static/images/personality-types/avatars/entj-commander.svg',
    strengths: ['Efficient', 'Energetic', 'Confident', 'Strong-willed', 'Strategic thinkers'],
    weaknesses: ['Stubborn', 'Intolerant', 'Impatient', 'Arrogant', 'Poor handling of emotions'],
    careers: ['CEO', 'Management Consultant', 'Lawyer', 'Startup Founder', 'Investment Banker', 'Politician'],
    advice: 'Kamu visioner dengan kemampuan eksekusi. Karir yang memungkinkanmu memimpin dan membangun organisasi akan sangat cocok.'
  }
};
