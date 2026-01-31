
export const LOVELANGUAGES_QUIZ = {
  id: "LOVE_LANGUAGES",
  title: "Cek Bahasa Cintamu",
  description: "Bagaimana cara terbaik membuatmu merasa disayang?",
  duration: "2 Menit",
  questionCount: 10,
  options: [
    { value: "A", label: "Pilihan A" },
    { value: "B", label: "Pilihan B" }
  ],
  questions: [
    { id: 1, text: "Apa yang lebih membuatmu bahagia?", A: "Mendapat pesan penuh perhatian atau kata-kata manis", B: "Mendapat pertolongan saat aku sibuk", typeA: "Words", typeB: "Acts" },
    { id: 2, text: "Saat kamu sedih, kamu lebih ingin...", A: "Didengarkan cerita dan dipeluk", B: "Dihibur dengan hadiah kecil", typeA: "Touch", typeB: "Gifts" },
    { id: 3, text: "Liburan seru untukmu adalah...", A: "Pergi bareng orang terdekat sambil ngobrol terus", B: "Liburan di tempat seru bareng teman atau keluarga", typeA: "Quality", typeB: "Acts" },
    { id: 4, text: "Kamu lebih menghargai...", A: "Kado yang dipikirkan matang-matang", B: "Orang yang datang tepat waktu janji", typeA: "Gifts", typeB: "Acts" },
    { id: 5, text: "Hal paling membahagiakan menurutmu adalah...", A: "Ngobrol santai dengan orang terdekat", B: "Mengerjakan sesuatu bareng sahabat atau keluarga", typeA: "Quality", typeB: "Acts" },
    { id: 6, text: "Kamu merasa disayang jika...", A: "Ditepuk pundak, dipeluk, atau digandeng", B: "Dipuji dengan kata-kata yang tulus", typeA: "Touch", typeB: "Words" },
    { id: 7, text: "Kamu suka orang yang...", A: "Sering mengajak nongkrong atau jalan bareng", B: "Selalu ada untukmu saat kamu butuh", typeA: "Quality", typeB: "Acts" },
    { id: 8, text: "Kamu senang kalau melihat temanmu...", A: "Dikirimi bunga atau kado", B: "Disayang-sayang oleh orang terdekatnya", typeA: "Gifts", typeB: "Words" },
    { id: 9, text: "Kamu merasa koneksi itu terjadi lewat...", A: "Kegiatan fisik bersama (olahraga, jalan)", B: "Percakapan mendalam sampai pagi", typeA: "Touch", typeB: "Quality" },
    { id: 10, text: "Bentuk perhatian yang kamu suka berikan ke orang terdekat adalah...", A: "Catatan atau pesan manis di sosmed", B: "Membuatkan sesuatu atau kado buat dia", typeA: "Words", typeB: "Gifts" }
  ]
};

export const LOVELANGUAGES_RESULTS = {
  Words: {
    title: "Kata-kata Penyemangat",
    desc: "Kamu merasa paling disayang ketika mendengar pujian tulus, kata-kata semangat, dan ucapan 'aku sayang kamu' dari orang-orang terdekatmu.",
    emoji: "💬",
    color: "bg-pink-50 border-pink-200 text-pink-900",
    hexColor: "#ec4899",
    gradient: "from-pink-400 to-rose-500",
    whatYouNeed: [
      "Pujian tulus atas hal-hal kecil yang kamu lakukan",
      "Kata-kata 'Aku sayang kamu' secara berkala",
      "Dihubungi lewat pesan manis di tengah hari",
      "Diberitahu bahwa kamu dihargai dan penting"
    ],
    whatYouCanDo: [
      "Kirim pesan semangat ke teman atau keluarga",
      "Buat catatan apresiasi atau surat",
      "Puji orang terdekat secara spesifik dan tulus",
      "Berikan semangat kata-kata saat mereka sedang down"
    ],
    redFlags: [
      "Kritik keras atau komentar negatif",
      "Diam atau tidak ada komunikasi",
      "Kata-kata kasar walau bercanda",
      "Lebih banyak komplain daripada pujian"
    ],
    perfectMatch: ["Acts of Service", "Quality Time"],
    advice: "Jelaskan ke sahabat atau keluargamu bahwa pujian dan kata-kata manis sangat berarti buatmu. Minta mereka untuk lebih ekspresif secara verbal."
  },
  Acts: {
    title: "Tindakan Nyata",
    desc: "Tindakan lebih berarti dari kata-kata buatmu. Kamu merasa paling disayang ketika seseorang membantu meringankan urusanmu dengan cara yang praktis.",
    emoji: "🤝",
    color: "bg-blue-50 border-blue-200 text-blue-900",
    hexColor: "#3b82f6",
    gradient: "from-blue-400 to-indigo-500",
    whatYouNeed: [
      "Dibantuin pekerjaan atau tugas",
      "Dijemput atau ditemani saat perlu",
      "Dibuatkan makanan/minuman saat sibuk",
      "Orang yang proaktif membantu, bukan hanya minta bantuan"
    ],
    whatYouCanDo: [
      "Buatkan minuman atau makanan kesukaan mereka",
      "Bantuin pekerjaan tanpa diminta",
      "Jemput atau antar mereka saat perlu",
      "Handle hal-hal kecil yang membebani pikiran mereka"
    ],
    redFlags: [
      "Janji manis tapi tidak ditepati",
      "Ditinggal kerjain semua sendiri",
      "Orang malas bergerak saat kamu butuh",
      "Semua jadi tanggung jawabmu"
    ],
    perfectMatch: ["Words of Affirmation", "Quality Time"],
    advice: "Tindakan nyata lebih berarti buatmu! Tunjukkan kasih sayang lewat hal-hal praktis. Jangan lupa juga apresiasi saat orang lain melakukan sesuatu untukmu."
  },
  Gifts: {
    title: "Hadiah Penuh Makna",
    desc: "Bukan soal harganya - tapi niatnya. Kamu merasa paling disayang ketika seseorang memberikan sesuatu yang menunjukkan bahwa mereka memikirkanmu.",
    emoji: "🎁",
    color: "bg-amber-50 border-amber-200 text-amber-900",
    hexColor: "#f59e0b",
    gradient: "from-amber-400 to-orange-500",
    whatYouNeed: [
      "Hadiah kecil tapi penuh makna di waktu random",
      "Dikasih sesuatu yang pernah kamu mention sebelumnya",
      "Bukti fisik bahwa orang memikirkanmu",
      "Simbol-simbol kenangan bersama"
    ],
    whatYouCanDo: [
      "Beli sesuatu yang mereka pernah sebut waktu lalu",
      "Bawa makanan kesukaan mereka dari luar",
      "Buat kado DIY yang personal",
      "Ingat tanggal-tanggal penting dan kasih sesuatu"
    ],
    redFlags: [
      "Lupa hari ulang tahun atau momen penting",
      "Tidak pernah memberi apapun",
      "Hadiah asal-asalan tanpa pikiran",
      "Tidak ada effort sama sekali"
    ],
    perfectMatch: ["Quality Time", "Physical Touch"],
    advice: "Bukan soal harga, tapi usaha dan ketulusan. Orang-orang terdekatmu perlu tahu bahwa kado kecil pun berarti buatmu asal ada effortnya."
  },
  Quality: {
    title: "Waktu Berkualitas",
    desc: "Kamu merasa paling disayang ketika seseorang memberikan perhatian penuh tanpa gangguan. Menghabiskan waktu bersama dengan fokus adalah bahasa cintamu.",
    emoji: "⏰",
    color: "bg-purple-50 border-purple-200 text-purple-900",
    hexColor: "#a855f7",
    gradient: "from-purple-400 to-violet-500",
    whatYouNeed: [
      "Quality time tanpa HP atau gangguan",
      "Ngobrol deep talk sampai lupa waktu",
      "Kegiatan bareng yang benar-benar berkualitas",
      "Perhatian penuh, bukan setengah-setengah"
    ],
    whatYouCanDo: [
      "Plan waktu bareng tanpa gadget",
      "Ajak ngobrol tentang mimpi dan perasaan",
      "Lakukan hobi bareng-bareng",
      "Ciptakan momen khusus bersama"
    ],
    redFlags: [
      "Sibuk dengan HP saat bareng",
      "Cancel janji di last minute",
      "Waktu bareng tapi tidak fokus",
      "Selalu sibuk dan tidak ada waktu khusus"
    ],
    perfectMatch: ["Acts of Service", "Receiving Gifts"],
    advice: "Kualitas lebih penting dari kuantitas! Minta orang terdekatmu untuk benar-benar 'hadir' saat bersama, bukan sekadar ada tubuhnya tapi pikirannya kemana-mana."
  },
  Touch: {
    title: "Sentuhan Fisik",
    desc: "Kamu merasa paling disayang melalui kontak fisik - gandengan tangan, pelukan, atau duduk berdekatan. Kedekatan fisik sangat penting untuk membuatmu merasa dicintai.",
    emoji: "🤗",
    color: "bg-rose-50 border-rose-200 text-rose-900",
    hexColor: "#f43f5e",
    gradient: "from-rose-400 to-pink-500",
    whatYouNeed: [
      "Pelukan, rangkulan, atau gandengan tangan",
      "Duduk berdekatan saat nonton atau ngobrol",
      "Sentuhan kecil: tepuk pundak, lengan, atau rambut",
      "Kontak fisik yang menunjukkan kasih sayang"
    ],
    whatYouCanDo: [
      "Duduk berdekatan saat nonton film",
      "Gandeng tangan saat jalan",
      "Peluk saat bertemu atau berpisah",
      "Tepuk pundak atau sentuhan punggung sebagai dukungan"
    ],
    redFlags: [
      "Menolak sentuhan atau menjauh",
      "Tidak ada kontak fisik sama sekali",
      "Mengabaikan kebutuhan fisik",
      "Terasa dingin dan tidak ada kedekatan"
    ],
    perfectMatch: ["Quality Time", "Words of Affirmation"],
    advice: "Sentuhan fisik adalah cara kamu merasa terhubung. Komunikasikan kebutuhan ini ke orang terdekatmu (orang tua, sahabat) agar mereka tahu betapa pentingnya kontak fisik buatmu."
  }
};
