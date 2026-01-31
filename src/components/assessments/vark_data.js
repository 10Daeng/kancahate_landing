// --- VARK (VISUAL, AUDITORY, READ/WRITE, KINESTHETIC) DATA ---
// Format standar VARK: Setiap pertanyaan memiliki 4 pernyataan berbeda
// User memilih pernyataan yang paling menggambarkan dirinya, bukan kategori langsung

export const VARK_QUIZ = {
  id: "VARK",
  title: "Cek Gaya Belajarmu (VARK)",
  description: "Cara belajar seperti apa yang bikin otakmu nyerap informasi paling cepat?",
  duration: "3 Menit",
  questionCount: 16,
  questions: [
    {
      id: 1,
      text: "Kalau guru menjelaskan materi baru di kelas, kamu paling mudah paham jika...",
      options: [
        { value: "V", label: "Gurunya pakai diagram/gambar di papan tulis" },
        { value: "A", label: "Gurunya menjelaskan sambil ngomong langsung" },
        { value: "R", label: "Ada teks/buku pegangan yang bisa aku baca" },
        { value: "K", label: "Aku boleh coba praktek langsung" }
      ]
    },
    {
      id: 2,
      text: "Saat belajar di rumah, kamu biasanya...",
      options: [
        { value: "V", label: "Nonton video tutorial" },
        { value: "A", label: "Dengerin podcast atau audio materi" },
        { value: "R", label: "Baca buku atau catatan" },
        { value: "K", label: "Gerak-gerak sambil belajar" }
      ]
    },
    {
      id: 3,
      text: "Kalau ada ujian, cara belajar paling efektif buatmu adalah...",
      options: [
        { value: "V", label: "Lihat mind map atau infografik" },
        { value: "A", label: "Dengarkan rekaman materi" },
        { value: "R", label: "Baca modul dan catat poin penting" },
        { value: "K", label: "Praktek simulasi atau main peran" }
      ]
    },
    {
      id: 4,
      text: "Kamu sedang belajar sesuatu yang baru dan rumit. Kamu coba...",
      options: [
        { value: "V", label: "Buat sketsa atau diagram" },
        { value: "A", label: "Diskusikan dengan teman" },
        { value: "R", label: "Baca dan baca lagi materinya" },
        { value: "K", label: "Coba langsung praktek" }
      ]
    },
    {
      id: 5,
      text: "Bentuk materi yang paling bikin kamu ingat adalah...",
      options: [
        { value: "V", label: "Video, slide presentasi, atau gambar" },
        { value: "A", label: "Audio, ceramah, atau diskusi" },
        { value: "R", label: "Tulis, baca, atau bullet points" },
        { value: "K", label: "Praktek langsung atau eksperimen" }
      ]
    },
    {
      id: 6,
      text: "Kalau ada instruksi berteknis (misal: cara pakai software baru), kamu...",
      options: [
        { value: "V", label: "Liat screenshot atau GIF tutorial" },
        { value: "A", label: "Dengarkan penjelasan lisan atau telepon support" },
        { value: "R", label: "Baca manual atau dokumentasi tekst" },
        { value: "K", label: "Langsung pencet-pencet sampe bisa" }
      ]
    },
    {
      id: 7,
      text: "Saat rapat atau meeting, kamu...",
      options: [
        { value: "V", label: "Suka lihat slide visual atau presentasi" },
        { value: "A", label: "Fokus dengerin pembicara" },
        { value: "R", label: "Catat atau baca handout" },
        { value: "K", label: "Suka demo produk atau hands-on" }
      ]
    },
    {
      id: 8,
      text: "Untuk menghafal sesuatu, kamu...",
      options: [
        { value: "V", label: "Bayangkan visualisasinya di kepala" },
        { value: "A", label: "Ulangi kata-kata dengan suara keras" },
        { value: "R", label: "Tulis ulang berkali-kali" },
        { value: "K", label: "Praktek sambil menghafal" }
      ]
    },
    {
      id: 9,
      text: "Kamu paling suka dosen atau pengajar yang...",
      options: [
        { value: "V", label: "Pakai banyak visual dan slide" },
        { value: "A", label: "Ceramah dengan suara jelas" },
        { value: "R", label: "Ngasih banyak bacaan dan tulisan" },
        { value: "K", label: "Banyak tugas praktek" }
      ]
    },
    {
      id: 10,
      text: "Kalau bingung sama tugas, kamu akan...",
      options: [
        { value: "V", label: "Cari video atau gambar penjelas" },
        { value: "A", label: "Tanya teman atau diskusi" },
        { value: "R", label: "Baca modul atau cari referensi" },
        { value: "K", label: "Coba langsung dan trial-error" }
      ]
    },
    {
      id: 11,
      text: "Saat presentasi atau tugas, kamu...",
      options: [
        { value: "V", label: "Pakai poster, infografik, atau desain visual" },
        { value: "A", label: "Presentasi dengan cerita" },
        { value: "R", label: "Buat tulisan atau laporan lengkap" },
        { value: "K", label: "Demo langsung atau roleplay" }
      ]
    },
    {
      id: 12,
      text: "Di waktu senggang, kamu lebih suka...",
      options: [
        { value: "V", label: "Nonton video, film, atau liat foto" },
        { value: "A", label: "Dengerin musik atau podcast" },
        { value: "R", label: "Baca buku, artikel, atau tulis" },
        { value: "K", label: "Main game, olahraga, atau jalan-jalan" }
      ]
    },
    {
      id: 13,
      text: "Kalau mau belajar skill baru (misal: coding, desain), kamu...",
      options: [
        { value: "V", label: "Cari kursus video atau tutorial visual" },
        { value: "A", label: "Cari mentor atau diskusi" },
        { value: "R", label: "Baca dokumentasi atau buku panduan" },
        { value: "K", label: "Langsung praktek proyek" }
      ]
    },
    {
      id: 14,
      text: "Kamu paling ingat sesuatu kalau...",
      options: [
        { value: "V", label: "Lihat bentuk atau warnanya" },
        { value: "A", label: "Dengar suaranya" },
        { value: "R", label: "Baca tulisannya" },
        { value: "K", label: "Melakukan atau merasakannya" }
      ]
    },
    {
      id: 15,
      text: "Saat belajar, kamu merasa kesulitan kalau...",
      options: [
        { value: "V", label: "Tidak ada gambar atau visual" },
        { value: "A", label: "Terlalu hening atau tidak ada suara" },
        { value: "R", label: "Tidak ada teks atau catatan" },
        { value: "K", label: "Harus duduk diam terlalu lama" }
      ]
    },
    {
      id: 16,
      text: "Gaya belajar yang bikin kamu nyaman adalah...",
      options: [
        { value: "V", label: "Pakai warna, diagram, dan ruang rapi" },
        { value: "A", label: "Pakai musik, diskusi, dan suara" },
        { value: "R", label: "Pakai teks, buku, dan tulisan" },
        { value: "K", label: "Pakai gerak, praktek, dan eksperimen" }
      ]
    }
  ]
};

/**
 * VARK Type Descriptions untuk hasil
 */
export const VARK_TYPES = {
  V: {
    title: "Visual Learner",
    fullTitle: "Visual (Pembelajar Visual)",
    desc: "Learn best by using pictures, images, diagrams, graphs, and spatial arrangements. Prefer seeing information displayed visually.",
    strength: "Able to visualize and process visual information effectively",
    emoji: "👁️",
    color: "blue",
    tips: [
      "Gunakan highlighter warna-warni saat membaca",
      "Buat mind map atau diagram untuk materi kompleks",
      "Cari video tutorial selain teks",
      "Gunakan warna berbeda untuk kategori informasi"
    ],
    studyMethods: [
      "Mind mapping dan concept maps",
      "Infografik dan flowchart",
      "Video tutorial dan visualisasi data",
      "Flashcard dengan gambar",
      "Highlight dengan warna berbeda",
      "Grafik dan diagram visual"
    ],
    careers: [
      "Desainer Grafis",
      "Arsitek",
      "Fotografer",
      "Art/Illustrator",
      "UI/UX Designer",
      "Video Editor",
      "Animator",
      "Interior Designer"
    ],
    weaknesses: [
      "Kesulitan dengan instruksi lisan saja",
      "Bosan dengan terlalu banyak teks",
      "Butuh waktu untuk memvisualisasikan konsep abstrak"
    ],
    advice: "Manfaatkan kemampuan visualmu dengan mengubah informasi teks menjadi diagram, chart, atau visual lainnya. Gunakan warna dan gambar untuk membantu mengingat."
  },
  A: {
    title: "Auditory Learner",
    fullTitle: "Auditory/Aural (Pembelajar Audio)",
    desc: "Learn best through listening to information, discussions, and verbal explanations. Prefer hearing rather than reading.",
    strength: "Good at absorbing auditory and verbal information",
    emoji: "🎧",
    color: "amber",
    tips: [
      "Rekam kuliah dan dengarkan ulang",
      "Diskusikan materi dengan teman",
      "Gunakan musik atau rhythm untuk menghafal",
      "Baca materi dengan suara keras"
    ],
    studyMethods: [
      "Podcast dan audio materi",
      "Diskusi kelompok",
      "Membaca loud reading",
      "Rekam suara sendiri",
      "Mnemonic dengan rhythm",
      "Presentasi lisan"
    ],
    careers: [
      "Musisi",
      "Podcaster",
      "Radio Broadcaster",
      "Teacher/Lecturer",
      "Voice Actor",
      "Speech Therapist",
      "Customer Service",
      "Sales"
    ],
    weaknesses: [
      "Kesulitan dengan materi yang terlalu diam",
      "Mudah terdistraksi oleh kebisingan",
      "Butuh verbalisasi untuk paham konsep"
    ],
    advice: "Gunakan pendengaranmu sebaik mungkin. Rekaman suara, diskusi, dan menjelaskan materi ke orang lain adalah cara terbaik belajarmu."
  },
  R: {
    title: "Read/Write Learner",
    fullTitle: "Read/Write (Pembelajar Teks)",
    desc: "Learn best through engaging with text-based materials, reading, and writing. Prefer information displayed as words.",
    strength: "Good at processing written information",
    emoji: "📚",
    color: "emerald",
    tips: [
      "Baca ulang materi berkali-kali",
      "Buat catatan dan ringkasan",
      "Gunakan list poin dan bullet points",
      "Cari referensi tambahan untuk baca"
    ],
    studyMethods: [
      "Membaca buku dan artikel",
      "Mencatat catatan detail",
      "Membuat outline dan ringkasan",
      "Bullet points dan list",
      "Essay dan laporan tertulis",
      "Manual dan dokumentasi"
    ],
    careers: [
      "Penulis/Author",
      "Journalist",
      "Editor",
      "Researcher",
      "Lawyer",
      "Academic",
      "Translator",
      "Librarian"
    ],
    weaknesses: [
      "Kesulitan dengan materi visual murni",
      "Butuh waktu untuk membaca dan memproses",
      "Kurang efektif dengan praktek langsung"
    ],
    advice: "Keuntungan dari tulisan dan bacaan sebanyak mungkin. Buat catatan detail, ringkasan, dan baca referensi tambahan untuk memperdalam pemahaman."
  },
  K: {
    title: "Kinesthetic Learner",
    fullTitle: "Kinesthetic (Pembelajar Gerak)",
    desc: "Learn best through movement, touch, and hands-on experience. Prefer practical applications and physical engagement.",
    strength: "Process information effectively through physical experience",
    emoji: "✋",
    color: "rose",
    tips: [
      "Praktek langsung dengan simulasi",
      "Gunakan flashcard yang bisa dipegang",
      "Belajar sambil bergerak atau jalan",
      "Libat sering istirahat tapi tetap belajar"
    ],
    studyMethods: [
      "Praktek langsung dan eksperimen",
      "Role playing dan simulasi",
      "Belajar sambil bergerak",
      "Hands-on workshop",
      "Trial and error",
      "Fisik manipulation dan touch"
    ],
    careers: [
      "Atlet",
      "Chef",
      "Mechanic",
      "Surgeon/Dokter",
      "Pilot",
      "Olahragawan",
      "Craftsman",
      "Physical Therapist"
    ],
    weaknesses: [
      "Kesulitan duduk diam terlalu lama",
      "Bosan dengan teori tanpa praktek",
      "Butuh gerak untuk tetap fokus"
    ],
    advice: "Jangan ragu untuk bergerak saat belajar. Praktek langsung, eksperimen, dan hands-on adalah cara terbaik untukmu memahami materi."
  }
};
