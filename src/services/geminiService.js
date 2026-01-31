// --- GEMINI API SERVICE ---
// Handles all communication with Google Gemini API

import { sanitizeMessage, anonymizeUserData } from './cryptoService';

/**
 * Sanitize chat history before sending to external API
 * Removes PII and sensitive information
 * @param {Array} history - Chat history
 * @returns {Array} - Sanitized chat history
 */
function sanitizeChatHistory(history) {
  return history.map(msg => {
    if (msg.role === 'user' && msg.parts && msg.parts[0] && msg.parts[0].text) {
      return {
        ...msg,
        parts: [{ text: sanitizeMessage(msg.parts[0].text) }]
      };
    }
    return msg;
  });
}

/**
 * Call Gemini API with automatic model fallback
 * @param {Array} history - Chat history
 * @param {string} systemPrompt - System instruction for AI
 * @param {number} maxRetries - Number of retries per model
 * @param {string} userName - User's name for personalized error messages
 * @returns {Promise<string>} - AI response text
 */
export async function callGeminiAPI(history, systemPrompt, maxRetries = 3, userName = 'kawan') {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return `Maaf sekali, ${userName}, Kai sedang istirahat sejenak. Silakan coba lagi beberapa saat ya.`;
  }
  
  // Model yang didukung (sesuai dokumentasi resmi Google 2025)
  const modelConfigs = [
    { model: "gemini-2.5-flash", endpoint: "v1beta" },
    { model: "gemini-2.0-flash-exp", endpoint: "v1beta" },
    { model: "gemini-1.5-flash", endpoint: "v1beta" },
  ];
  
  let lastError = null;
  
  for (const config of modelConfigs) {
    const url = `https://generativelanguage.googleapis.com/${config.endpoint}/models/${config.model}:generateContent?key=${apiKey}`;

    // SECURITY: Sanitize history before sending to external API
    const sanitizedHistory = sanitizeChatHistory(history);

    const payload = {
      contents: sanitizedHistory,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
      ]
    };

    // Retry logic dengan exponential backoff
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini API] Trying ${config.endpoint}/${config.model}, attempt: ${attempt}`);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        // Handle rate limiting (429)
        if (response.status === 429) {
          console.warn(`Rate limited, attempt ${attempt}/${maxRetries}`);
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
            continue;
          }
          lastError = "Rate limited";
          break; // Try next model
        }
        
        // Handle 404 - model not found, try next model
        if (response.status === 404) {
          console.warn(`[Gemini API] ${config.endpoint}/${config.model} not found (404), trying next...`);
          lastError = `${config.model} (${config.endpoint}) not found`;
          break; // Try next model
        }
        
        // Handle other errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[Gemini API] Error:', response.status, errorData);
          
          if (response.status === 400) {
            return `Hmm ${userName}, sepertinya ada yang salah dengan pesanmu. Coba ulangi dengan kata-kata yang berbeda ya.`;
          }
          if (response.status === 403) {
            return `Maaf sekali, ${userName}, Kai sedang tidak bisa mengakses sistem. Coba refresh halaman ya.`;
          }
          
          lastError = `API Error: ${response.status}`;
          break; // Try next model
        }
        
        const data = await response.json();
        
        // Check if response was blocked by safety filters
        if (data.candidates?.[0]?.finishReason === 'SAFETY') {
          return "Kai mendeteksi topik sensitif. Untuk keamananmu, silakan bicara langsung dengan konselor profesional melalui hotline 119 ext 8.";
        }
        
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          console.warn('[Gemini API] Empty response');
          return "Maaf, Kai bingung mau jawab apa. Bisa ceritakan lebih detail?";
        }
        
        console.log(`[Gemini API] Success with ${config.endpoint}/${config.model}`);
        return text;
        
      } catch (err) {
        console.error(`[Gemini API] Attempt ${attempt} failed:`, err);
        lastError = err.message;
        
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
          continue;
        }
      }
    }
  }
  
  // All models failed - log technical details for debugging, show user-friendly message
  console.error('[Gemini API] All models failed. Last error:', lastError);
  return `Maaf sekali, ${userName}, sepertinya Kai sedang banyak melayani pengguna lain. Mohon tunggu sebentar atau lakukan refresh halaman ya.`;
}

/**
 * Validate user answer using AI
 * @param {string} question - The question asked
 * @param {string} answer - User's answer
 * @param {string} phase - Current chat phase
 * @returns {Promise<{valid: boolean, feedback: string}>}
 */
export async function validateAnswer(question, answer, phase) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    return { valid: true, feedback: "" };
  }

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

  const modelConfigs = [
    { model: "gemini-2.5-flash", endpoint: "v1beta" },
    { model: "gemini-2.0-flash-exp", endpoint: "v1beta" },
  ];

  for (const config of modelConfigs) {
    const url = `https://generativelanguage.googleapis.com/${config.endpoint}/models/${config.model}:generateContent?key=${apiKey}`;
    
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: validationPrompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 256 }
          })
        });

        if (response.status === 404) break; // Try next model

        if (!response.ok) {
          if (attempt < 1) {
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
          return { valid: true, feedback: "" };
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return { 
            valid: parsed.valid === true, 
            feedback: parsed.feedback || "" 
          };
        }
        
        return { valid: true, feedback: "" };
        
      } catch (err) {
        console.error('Validation error:', err);
        if (attempt < 1) {
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        return { valid: true, feedback: "" };
      }
    }
  }
  
  return { valid: true, feedback: "" };
}

export default { callGeminiAPI, validateAnswer };
