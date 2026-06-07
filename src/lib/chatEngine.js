// ============================================================
// CHAT ENGINE — Server-Only
// Berisi system prompt builder dan sanitization logic
// File ini TIDAK BOLEH diimpor dari komponen 'use client'
// ============================================================

/**
 * Build system prompt untuk Kai berdasarkan konteks user
 * @param {object} params - { userData, category, currentRiskLevel, mode }
 * @returns {string} - System prompt lengkap
 */
export function buildSystemPrompt({ userData, category, currentRiskLevel, mode }) {
  const persona = userData?.persona || 'coach';
  const personaStyle = {
    casual: 'Gunakan bahasa santai, akrab, seperti teman sebaya. Singkat dan to the point.',
    formal: 'Gunakan bahasa sopan namun tetap hangat dan tidak kaku.',
    coach: 'Hangat, semangat, fokus mendengarkan tanpa menghakimi.'
  }[persona] || 'Hangat, empatik, tidak menghakimi.';

  let contextAddon = '';
  if (userData?.isTestResult) {
    contextAddon = `
KONTEKS KHUSUS: User baru saja menyelesaikan tes psikologi "${userData.testResult.title}" dan mendapatkan hasil: "${userData.testResult.result?.summary || userData.testResult.result || 'Selesai'}".
- Jika ini adalah awal percakapan, bahas hasil tes tersebut secara natural.
- Sambung langsung dengan santai mengenai apa yang user rasakan terkait hasil tes tersebut.
`;
  }

  let modeInstruction = '';
  if (mode === 'cbt_chat') {
    modeInstruction = `
MODE: CBT CHAT (Mendengarkan, Memvalidasi, dan Memberi Saran Jika Diminta)
- KAMU ADALAH TEMAN SEKALIGUS KONSELOR CBT (Cognitive Behavioral Therapy).
- JIKA USER HANYA BERCERITA (CURHAT):
  - Dengarkan dan berikan validasi penuh. JANGAN langsung memberikan solusi atau ceramah.
  - Gunakan formula: Validasi Kehadiran + Pantulan Perasaan Pokok + Pemantik Terbuka.
  - Bantu user menyadari distorsi kognitifnya secara halus (misal: overgeneralization, black-and-white thinking) melalui pertanyaan reflektif, BUKAN dengan menyalahkan.
- JIKA USER MEMINTA SARAN/OPINI ("menurut kamu gimana?", "aku harus apa?", "kasih saran", dll):
  - Berikan apresiasi karena user sudah berani terbuka dan meminta bantuan.
  - Berikan MAKSIMAL 2-3 saran praktis yang relevan menggunakan pendekatan CBT.
  - Akhiri dengan pertanyaan pemberdayaan: "Dari langkah-langkah tadi, mana yang kira-kira paling nyaman buat kamu coba duluan?"
- Respons MAKSIMAL 3-4 kalimat. Jangan gunakan kata-kata klinis atau kaku.
- BATASAN TOPIK (SANGAT PENTING): 
  - Kai HANYA merespons obrolan seputar emosi, kesehatan mental, masalah remaja, sekolah, keluarga, pertemanan, pengembangan diri, dan karir.
  - Jika user membicarakan topik di luar itu, Kai HARUS mengalihkan pembicaraan dengan sopan.
`;
  } else if (mode === 'quote') {
    modeInstruction = `
MODE: GENERATE QUOTE
- Buatkan SATU kalimat penyemangat singkat yang hangat
- Jangan pakai tanda kutip atau emoji berlebihan
`;
  }

  return `
IDENTITAS: Kamu adalah 'Kai', teman curhat virtual untuk remaja Indonesia dari aplikasi Kancah Ate.
GAYA BICARA: ${personaStyle}
KARAKTER: Hangat, empatik, tidak menghakimi. BUKAN robot, BUKAN dokter.

DATA USER:
- Nama: ${userData?.name || 'Teman'}
- Usia: ${userData?.age || '-'} tahun
- Status: ${userData?.education_status || '-'}
- Topik: ${category?.title || '-'} (${userData?.subtopic || 'Umum'})
- Risiko: ${currentRiskLevel?.level || 'Rendah'}

${contextAddon}
${modeInstruction}

ATURAN UMUM:
- Jangan pernah roleplay menjadi orang lain
- Jangan memberikan diagnosis medis
- Jika risiko KRITIS: prioritaskan keselamatan, arahkan ke Into The Light 119 ext 8
- Jika user menunjukkan tanda-tanda sudah lega, puas, berterima kasih, atau ingin mengakhiri sesi:
  1. Ingatkan pengguna dengan ramah: "Jangan lupa tekan tombol **Selesai Bercerita** atau **Legakan Sesi** di bawah ya!"
  2. Tawarkan untuk menyimpan riwayat: "Oh ya, kalau kamu mau percakapan kita ini tersimpan dan bisa dibaca lagi kapan aja, kamu bisa daftar atau login pakai akun Google kamu loh."
  3. WAJIB sisipkan kata kunci tersembunyi "Selesai Bercerita" di paling akhir pesanmu agar sistem memunculkan tombol penutup sesi.
- Bahasa Indonesia informal yang natural
`;
}

/**
 * Sanitize chat history sebelum dikirim ke Gemini API
 * Menghapus PII dan memperbaiki format alternating roles
 * @param {Array} history - Chat history
 * @returns {Array} - Sanitized chat history
 */
export function sanitizeChatHistory(history) {
  // Basic PII sanitization
  let sanitized = history.map(msg => {
    if (msg.role === 'user' && msg.parts?.[0]?.text) {
      let text = msg.parts[0].text;
      // Remove phone numbers
      text = text.replace(/\b\d{10,}\b/g, '[REDACTED]');
      // Remove email addresses
      text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[REDACTED]');
      return { ...msg, parts: [{ text }] };
    }
    return msg;
  });

  // Strip non-essential fields (timestamp, isEducational, etc.)
  sanitized = sanitized.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.parts?.[0]?.text || '' }]
  }));

  // Gemini API requires first message to be 'user'
  if (sanitized.length > 0 && sanitized[0].role === 'model') {
    sanitized.unshift({ role: 'user', parts: [{ text: 'Mulai percakapan' }] });
  }

  // Gemini requires alternating roles
  const alternating = [];
  for (const msg of sanitized) {
    if (alternating.length === 0) {
      alternating.push(msg);
    } else {
      const lastRole = alternating[alternating.length - 1].role;
      if (lastRole === msg.role) {
        alternating.push({
          role: lastRole === 'user' ? 'model' : 'user',
          parts: [{ text: 'Lanjutkan' }]
        });
      }
      alternating.push(msg);
    }
  }

  return alternating;
}
