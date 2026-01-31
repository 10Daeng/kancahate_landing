
export const LOVELANGUAGES_QUIZ = {
  id: "LOVE_LANGUAGES",
  title: "Cek Bahasa Cintamu",
  description: "Bagaimana cara terbaik membuatmu merasa dicintai?",
  duration: "2 Menit",
  questionCount: 10,
  options: [
    { value: "A", label: "Pilihan A" },
    { value: "B", label: "Pilihan B" }
  ],
  questions: [
    { id: 1, text: "Apa yang lebih membuatmu bahagia?", A: "Mendapat pesan romantis/kata-kata manis", B: "Mendapat pertolongan saat aku sibuk", typeA: "Words", typeB: "Acts" },
    { id: 2, text: "Saat kamu sedih, kamu lebih ingin...", A: "Didengarkan cerita dan dipeluk", B: "Dihibur dengan hadiah kecil", typeA: "Touch", typeB: "Gifts" },
    { id: 3, text: "Idealis liburan seru untukmu adalah...", A: "Roadtrip bareng pasangan mengobrol terus", B: "Liburan di tempat romantis makan malam", typeA: "Quality", typeB: "Acts" },
    { id: 4, text: "Kamu lebih menghargai...", A: "Kado yang dipikirkan matang-matang", B: "Pasangan yang datang tepat waktu janji", typeA: "Gifts", typeB: "Acts" },
    { id: 5, text: "Hal paling romantis menurutmu adalah...", A: "Menatap mata pasangan sambil bincang", B: "Mengerjakan tugas bareng pasangan", typeA: "Quality", typeB: "Acts" },
    { id: 6, text: "Kamu merasa dicintai jika...", A: "Pacangan menyentuh/pegang tanganmu", B: "Pacangan memujimu dengan kata-kata indah", typeA: "Touch", typeB: "Words" },
    { id: 7, text: "Kamu suka pasangan yang...", A: "Sering mengajak nongkrong/jalan bareng", B: "Selalu ada untukmu saat kamu butuh", typeA: "Quality", typeB: "Acts" },
    { id: 8, text: "Kamu iri kalau lihat pasangan orang lain...", A: "Dikirimi bunga/kado", B: "Disayang-sayang di public", typeA: "Gifts", typeB: "Words" },
    { id: 9, text: "Kamu merasa koneksi itu terjadi lewat...", A: "Kegiatan fisik bersama (olahraga, jalan)", B: "Percakapan mendalam sampai pagi", typeA: "Touch", typeB: "Quality" },
    { id: 10, text: "Bentuk perhatian yang kamu suka berikan ke pasangan adalah...", A: "Catatan cinta/Status manis di sosmed", B: "Membuatkan sesuatu/kado buat dia", typeA: "Words", typeB: "Gifts" }
  ]
};

export const LOVELANGUAGES_RESULTS = {
  Words: {
    title: "Words of Affirmation",
    desc: "Actions don't always speak louder than words. Verbal compliments, encouragement, and 'I love you' make you feel most loved.",
    emoji: "💬",
    color: "bg-pink-50 border-pink-200 text-pink-900",
    hexColor: "#ec4899",
    gradient: "from-pink-400 to-rose-500",
    whatYouNeed: [
      "Pujian tulus atas hal-hal kecil yang kamu lakukan",
      "Kata-kata 'Aku sayang kamu' secara berkala",
      "Dihubungi lewat pesan/DM manis di tengah hari",
      "Diberitahu bahwa kamu appreciated dan valued"
    ],
    whatYouCanDo: [
      "Kirim pesan good morning/night manis",
      "Buat catatan cinta atau surat",
      "Puji pasangan secara spesifik dan tulus",
      "Berikan semangat kata-kata saat dia down"
    ],
    redFlags: [
      "Kritik keras atau komentar negatif",
      "Diam dianggap tidak peduli",
      "Kata-kata kasar walau bercanda",
      "Komplain lebih banyak daripada pujian"
    ],
    perfectMatch: ["Acts of Service", "Quality Time"],
    advice: "Jelaskan ke pasangan bahwa pujian dan kata-kata manis adalah 'bensin' untukmu. Minta dia untuk lebih expressif secara verbal."
  },
  Acts: {
    title: "Acts of Service",
    desc: "Actions speak louder than words. You feel most loved when someone does helpful things for you - making life easier through practical acts.",
    emoji: "🤝",
    color: "bg-blue-50 border-blue-200 text-blue-900",
    hexColor: "#3b82f6",
    gradient: "from-blue-400 to-indigo-500",
    whatYouNeed: [
      "Dibantuin pekerjaan rumah atau tugas",
      "Dijemput atau ditemani saat perlu",
      "Dibuatkan makanan/minuman saat sibuk",
      "Pasangan yang proaktif, bukan hanya minta bantuan"
    ],
    whatYouCanDo: [
      "Buatkan kopi/makanan kesukaannya",
      "Bantuin pekerjaan tanpa diminta",
      "Jemput atau antar dia saat perlu",
      "Handle hal-hal kecil yang membebani pikirannya"
    ],
    redFlags: [
      "Janji manis tapi tidak ditepati",
      "Ditinggal kerjain semua sendiri",
      "Pasangan malas bergerak saat kamu butuh",
      "Semua jadi tanggung jawabmu"
    ],
    perfectMatch: ["Words of Affirmation", "Quality Time"],
    advice: "Action speaks louder! Tunjukkan cinta lewat hal-hal praktis. Jangan lupa juga appreciate saat pasangan melakukan hal untukmu."
  },
  Gifts: {
    title: "Receiving Gifts",
    desc: "It's not about the price tag - it's the thought that counts. You feel most loved when someone gives you a tangible symbol that they were thinking of you.",
    emoji: "🎁",
    color: "bg-amber-50 border-amber-200 text-amber-900",
    hexColor: "#f59e0b",
    gradient: "from-amber-400 to-orange-500",
    whatYouNeed: [
      "Hadiah kecil tapi thoughtful di waktu random",
      "Dihinggai sesuatu yang kamu mention sebelumnya",
      "Bukti fisik bahwa dia thinking about you",
      "Simbol-simbol kenangan bersama"
    ],
    whatYouCanDo: [
      "Beli sesuatu yang dia mention waktu lalu",
      "Bawa makanan kesukaannya dari luar",
      "Buat kado DIY yang personal",
      "Ingat tanggal-tanggal penting dan give something"
    ],
    redFlags: [
      "Lupa anniversary atau ulang tahun",
      "Tidak pernah memberi apapun",
      "Hadiah asal-asalan tanpa pikiran",
      "Uang lebih penting daripada moment"
    ],
    perfectMatch: ["Quality Time", "Physical Touch"],
    advice: "Bukan soal harga, tapi effort dan thoughtfulness. Pasanganmu perlu tahu bahwa kado kecil pun berarti buatmu asal ada effortnya."
  },
  Quality: {
    title: "Quality Time",
    desc: "You feel most loved when someone gives you their undivided attention. Spending meaningful time together without distractions is your love language.",
    emoji: "⏰",
    color: "bg-purple-50 border-purple-200 text-purple-900",
    hexColor: "#a855f7",
    gradient: "from-purple-400 to-violet-500",
    whatYouNeed: [
      "Date night tanpa HP",
      "Ngobrol deep talk sampai lupa waktu",
      "Kegiatan bareng yang benar-benar quality",
      "Full attention, bukan half-hearted"
    ],
    whatYouCanDo: [
      "Plan date night tanpa gadget",
      "Ajak ngobrol tentang mimpi dan rasa",
      "Lakukan hobi bareng-bareng",
      "Create moments khusus berdua"
    ],
    redFlags: [
      "Sibuk dengan HP saat bareng",
      "Cancel plan last minute",
      "Waktu bareng tapi tidak fokus",
      "Selalu sibuk dan tidak ada waktu khusus"
    ],
    perfectMatch: ["Acts of Service", "Receiving Gifts"],
    advice: "Quality over quantity! Minta pasangan untuk benar-benar 'hadir' saat bareng, bukan sekadar ada tubuhnya tapi pikirannya kemana-mana."
  },
  Touch: {
    title: "Physical Touch",
    desc: "You feel most loved through physical contact - holding hands, hugs, or sitting close. For you, physical presence and touch are essential to feeling loved.",
    emoji: "🤗",
    color: "bg-rose-50 border-rose-200 text-rose-900",
    hexColor: "#f43f5e",
    gradient: "from-rose-400 to-pink-500",
    whatYouNeed: [
      "Pelukan, cuddle, atau pegangan tangan",
      "Duduk berdekatan saat nonton/ngobrol",
      "Sentuhan kecil: punggung, lengan, rambut",
      "Kontak fisik yang menunjukkan affection"
    ],
    whatYouCanDo: [
      "Cuddle saat nonton film",
      "Pegang tangan saat jalan",
      "Peluk dari belakang saat dia sibuk",
      "Main rambut atau sentuhan punggung"
    ],
    redFlags: [
      "Menolak sentuhan atau menjauh",
      "Tidak ada kontak fisik sama sekali",
      "Physical neglect atau abuse",
      "Kakak sendiri vibes (tidak ada affection)"
    ],
    perfectMatch: ["Quality Time", "Words of Affirmation"],
    advice: "Physical touch adalah cara kamu merasa connected. Communicate kebutuhan ini ke pasangan agar dia tahu betapa pentingnya kontak fisik buatmu."
  }
};
