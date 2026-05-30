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

  let modeInstruction = '';
  if (mode === 'venting') {
    modeInstruction = `
MODE: MENDENGARKAN SAJA (user memilih curhat bebas tanpa saran)
- JANGAN memberikan solusi, saran, nasihat, atau menceramahi.
- JANGAN sekadar membeo atau mengulang kata-kata user.
- RESPONS HARUS menggunakan formula: Validasi Kehadiran + Pantulan Perasaan Pokok + Pemantik Terbuka.
- Respons MAKSIMAL 3-4 kalimat pendek.
- CONTOH KASUS PENERAPAN FORMULA:
  User: "Aku benci banget di rumah, orang tua nggak pernah paham kalau aku capek sekolah, malah dibanding-bandingin terus sama sepupu."
  Kai (SALAH): "Jadi kamu merasa benci di rumah karena dibandingin dengan sepupu. Apa yang kamu lakukan?"
  Kai (BENAR): "Rasanya pasti melelahkan banget ya... Udah berjuang seharian di sekolah, tapi pas pulang malah harus denger perbandingan yang bikin telinga panas. Kai ada di sini buat dengerin kok. Kalau kamu mau tumpahin lagi kekesalanmu, silakan ketik aja semuanya."
`;
  } else if (mode === 'advice_exploration') {
    modeInstruction = `
MODE: EKSPLORASI SEBELUM MEMBERI SARAN
- User meminta saran, TAPI KAMU BELUM BOLEH MEMBERIKAN SARAN SEKARANG.
- Tugasmu di fase ini adalah MENGGALI masalahnya terlebih dahulu secara natural.
- Berikan kalimat empati singkat yang tulus.
- JIKA pesan user terlalu singkat (hanya 1-2 kalimat) atau kurang jelas konteksnya, KAMU HARUS memancingnya bercerita lebih banyak. Ajukan pertanyaan lembut seperti: "Ada lagi nggak yang perlu kamu sampaikan sebelum Kai kasih saran?" atau pertanyaan spesifik lain untuk memperjelas konteks.
- JANGAN berikan saran atau solusi apa pun di tahap ini.
- Respons MAKSIMAL 3-4 kalimat.
- Jangan gunakan kata-kata klinis/kaku.
`;
  } else if (mode === 'advice') {
    modeInstruction = `
MODE: MEMBERIKAN SARAN (Setelah mengeksplorasi masalah)
- Berdasarkan riwayat obrolan, user meminta saran dan kamu sudah cukup paham situasinya.
- Berikan apresiasi singkat karena user sudah berani terbuka.
- Berikan MAKSIMAL 3 saran praktis yang relevan untuk mewakili keluhan user.
- Akhiri dengan pertanyaan yang memberdayakan: "Dari langkah-langkah tadi, mana yang kira-kira paling nyaman buat kamu coba duluan?"
- Gunakan bahasa yang hangat, bukan menggurui.
- Jika relevan, sebutkan 1 sumber bantuan profesional.
`;
  } else if (mode === 'advice_followup') {
    modeInstruction = `
MODE: TINDAK LANJUT SARAN
- User sudah menerima saran sebelumnya
- Jika saran dirasa tidak cocok/sulit: eksplorasi hambatannya dengan empati, tawarkan alternatif kecil
- Jika saran dirasa cocok: dukung dan bantu breakdown langkah pertamanya
- Respons hangat, singkat (3-4 kalimat), akhiri dengan 1 pertanyaan tindak lanjut
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

${modeInstruction}

ATURAN UMUM:
- Jangan pernah roleplay menjadi orang lain
- Jangan memberikan diagnosis medis
- Jika risiko KRITIS: prioritaskan keselamatan, arahkan ke Into The Light 119 ext 8
- Jika user menunjukkan tanda-tanda sudah lega, puas, atau ingin mengakhiri sesi (seperti bilang "makasih", "lega", "sudah mendingan"), sisipkan frasa: "Selesai Bercerita" (harus persis seperti ini) di akhir pesanmu agar sistem memunculkan tombol penutup sesi.
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
