// ============================================================
// API ROUTE: /api/chat
// Satu-satunya pintu komunikasi frontend → Gemini API
// Semua logika sensitif (system prompt, crisis detection, API key)
// dijalankan di sini — TIDAK di browser.
// ============================================================

import { NextResponse } from 'next/server';
import { buildSystemPrompt, sanitizeChatHistory } from '@/lib/chatEngine';
import { detectCrisisLevel } from '@/lib/crisisDetection';

// Model fallback chain
const MODEL_CONFIGS = [
  { model: 'gemini-2.5-flash-lite', endpoint: 'v1beta' },
  { model: 'gemini-2.5-flash', endpoint: 'v1beta' },
  { model: 'gemini-2.0-flash', endpoint: 'v1beta' },
  { model: 'gemini-1.5-flash', endpoint: 'v1beta' },
];

/**
 * Panggil Gemini API dari server dengan retry + model fallback
 */
async function callGemini(history, systemPrompt, maxRetries = 3) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('[Chat API] GEMINI_API_KEY not set');
    return { text: null, error: 'API key not configured' };
  }

  const sanitizedHistory = sanitizeChatHistory(history);

  const payload = {
    contents: sanitizedHistory,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  let lastError = null;

  for (const config of MODEL_CONFIGS) {
    const url = `https://generativelanguage.googleapis.com/${config.endpoint}/models/${config.model}:generateContent?key=${apiKey}`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Chat API] Trying ${config.model}, attempt ${attempt}`);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.status === 429) {
          console.warn(`[Chat API] Rate limited on ${config.model}`);
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
            continue;
          }
          lastError = 'Rate limited';
          break;
        }

        if (response.status === 404) {
          lastError = `${config.model} not found`;
          break;
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.error('[Chat API] Error:', response.status, errData);

          if (response.status === 400) {
            return { text: null, error: 'bad_request' };
          }
          if (response.status === 403) {
            return { text: null, error: 'forbidden' };
          }

          lastError = `API Error: ${response.status}`;
          break;
        }

        const data = await response.json();

        if (data.candidates?.[0]?.finishReason === 'SAFETY') {
          return { text: null, error: 'safety_blocked' };
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          return { text: null, error: 'empty_response' };
        }

        console.log(`[Chat API] Success with ${config.model}`);
        return { text, error: null };

      } catch (err) {
        console.error(`[Chat API] Attempt ${attempt} failed:`, err.message);
        lastError = err.message;
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        }
      }
    }
  }

  console.error('[Chat API] All models failed:', lastError);
  return { text: null, error: 'all_models_failed' };
}

/**
 * POST /api/chat
 * Body: { history, userData, category, currentRiskLevel, mode, action }
 * 
 * action:
 *   - 'chat' (default): kirim pesan ke AI
 *   - 'validate': validasi jawaban user
 *   - 'quote': generate quote penutup
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { history, userData, category, currentRiskLevel, mode, action = 'chat' } = body;

    if (!history || !Array.isArray(history)) {
      return NextResponse.json({ error: 'Invalid request: history required' }, { status: 400 });
    }

    // --- Deteksi krisis pada pesan terakhir user (server-side) ---
    const lastUserMsg = [...history].reverse().find(m => m.role === 'user');
    let crisisResult = { level: 'Rendah', color: 'green', priority: 1, keyword: null, score: 0 };

    if (lastUserMsg?.parts?.[0]?.text) {
      crisisResult = detectCrisisLevel(lastUserMsg.parts[0].text);
    }

    // --- Jika mode validasi jawaban ---
    if (action === 'validate') {
      const { question, answer, phase } = body;
      const validationPrompt = `
Kamu adalah validator jawaban untuk aplikasi konseling remaja.

Pertanyaan yang ditanyakan: "${question}"
Jawaban user: "${answer}"
Fase percakapan: ${phase}

Tugasmu: Periksa apakah jawaban user BERMAKNA dan RELEVAN dengan pertanyaan.

Jawaban dianggap TIDAK VALID jika:
- Hanya berisi kata tidak jelas seperti "hmm", "gatau", "entah", "ya gitu", "hmmmm", "-", "..."
- Tidak menjawab pertanyaan sama sekali
- Terlalu singkat dan tidak memberikan informasi (1-2 kata random)

Jawaban dianggap VALID jika:
- Menjawab pertanyaan dengan jelas
- Memberikan informasi yang bisa diproses
- Mengekspresikan perasaan atau situasi (meski singkat tapi bermakna)

Respond dalam format JSON:
{"valid": true/false, "feedback": "Kalimat lembut meminta user menjelaskan lebih detail jika tidak valid, kosong jika valid"}

PENTING: Feedback harus dalam bahasa Indonesia santai dan tidak menghakimi.
`;

      const validationHistory = [{ role: 'user', parts: [{ text: validationPrompt }] }];
      const result = await callGemini(validationHistory, 'Kamu adalah validator jawaban.', 2);

      if (result.text) {
        try {
          const jsonMatch = result.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json({
              valid: parsed.valid === true,
              feedback: parsed.feedback || '',
              crisisLevel: crisisResult,
            });
          }
        } catch (_) {}
      }

      return NextResponse.json({ valid: true, feedback: '', crisisLevel: crisisResult });
    }

    // --- Build system prompt di server ---
    const systemPrompt = buildSystemPrompt({
      userData: userData || {},
      category: category || {},
      currentRiskLevel: currentRiskLevel || { level: 'Rendah' },
      mode: mode || 'venting',
    });

    // --- Panggil Gemini API ---
    const result = await callGemini(history, systemPrompt);

    if (result.error) {
      // Error-specific user-friendly messages
      const userName = userData?.name || 'kawan';
      const errorMessages = {
        bad_request: `Hmm ${userName}, sepertinya ada yang salah dengan pesanmu. Coba ulangi dengan kata-kata yang berbeda ya.`,
        forbidden: `Maaf sekali, ${userName}, Kai sedang tidak bisa mengakses sistem. Coba refresh halaman ya.`,
        safety_blocked: 'Kai mendeteksi topik sensitif. Untuk keamananmu, silakan bicara langsung dengan konselor profesional melalui hotline 119 ext 8.',
        empty_response: 'Maaf, Kai bingung mau jawab apa. Bisa ceritakan lebih detail?',
        all_models_failed: `Maaf ya ${userName}, Kai lagi melayani banyak pengguna sekarang. Tunggu sebentar dan coba kirim pesan kamu lagi ya 🙏`,
      };

      return NextResponse.json({
        text: errorMessages[result.error] || errorMessages.all_models_failed,
        crisisLevel: crisisResult,
        isError: true,
      });
    }

    return NextResponse.json({
      text: result.text,
      crisisLevel: crisisResult,
    });

  } catch (error) {
    console.error('[Chat API] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error', text: 'Maaf, terjadi kesalahan sistem. Coba kirim pesan lagi ya.' },
      { status: 500 }
    );
  }
}
