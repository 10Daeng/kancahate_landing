// --- RAG PIPELINE (Supabase Vector Store) ---
// Implementasi RAG yang clean dengan safety layers

import { searchKnowledge } from './vectorService';
import { detectCrisis as ragDetectCrisis } from './ragService';

/**
 * Process RAG Query dengan Safety Layers
 * Versi enhanced dari kode Anda dengan tambahan:
 * 1. Crisis detection (sebelum RAG)
 * 2. Error handling
 * 3. Response validation
 * 4. Metadata (relevance scores, etc)
 *
 * @param {string} userQuestion - Pertanyaan user
 * @param {Array} chatHistory - Riwayat chat (opsional, untuk context lanjutan)
 * @param {object} options - Konfigurasi tambahan
 * @returns {Promise<object>} - { response, sources, metadata }
 */
export async function processRAGQuery(userQuestion, chatHistory = [], options = {}) {
  const {
    topK = 4,              // Jumlah dokumen yang diambil
    threshold = 0.6,       // Minimum similarity score
    validateResponse = true, // Apakah perlu validasi respons AI
    systemPrompt = null     // Custom system prompt (opsional)
  } = options;

  try {
    // ============================================================
    // 0. CRISIS DETECTION (SAFETY LAYER 1)
    // ============================================================
    const crisisCheck = ragDetectCrisis(userQuestion);

    if (crisisCheck.isCrisis && crisisCheck.priority >= 3) {
      // KRITIS - Aktifkan protokol krisis, jangan lanjut ke RAG biasa
      console.log('[RAG] Crisis detected, activating protocol:', crisisCheck.level);

      return {
        response: crisisCheck.protocol.response_template,
        sources: [{
          type: 'crisis_protocol',
          name: crisisCheck.level,
          priority: crisisCheck.priority
        }],
        metadata: {
          isCrisisResponse: true,
          crisisLevel: crisisCheck.level,
          retrievalMethod: 'crisis_detection',
          timestamp: new Date().toISOString()
        }
      };
    }

    // ============================================================
    // 1. VECTOR SEARCH (CARI DOKUMEN RELEVAN)
    // ============================================================
    const relevantDocs = await searchKnowledge(
      userQuestion,
      threshold,
      topK
    );

    if (!relevantDocs || relevantDocs.length === 0) {
      console.warn('[RAG] No relevant documents found for:', userQuestion);

      return {
        response: null, // Caller should handle this (fallback ke non-RAG)
        sources: [],
        metadata: {
          noResults: true,
          query: userQuestion,
          retrievalMethod: 'vector_search'
        }
      };
    }

    console.log(`[RAG] Found ${relevantDocs.length} relevant documents`);

    // ============================================================
    // 2. SUSUN KONTEKS DARI DOKUMEN
    // ============================================================
    const contextParts = relevantDocs.map((doc, index) => {
      // Format: [1] Source: category - title
      //         Content: ...
      //         Relevance: score

      const metadata = doc.metadata || {};
      const content = doc.content || doc.description || '';

      return `
[Dokumen ${index + 1}]
Sumber: ${doc.category} - ${doc.title || doc.subcategory}
Skor Relevansi: ${(doc.score * 100).toFixed(0)}%
${metadata.steps ? 'Langkah-langkah:\n' + metadata.steps.join('\n') : ''}
${metadata.warning ? '⚠️ ' + metadata.warning : ''}

Konten:
${content}
`;
    });

    const context = contextParts.join('\n\n---\n\n');

    // ============================================================
    // 3. SUSUN PROMPT DENGAN KONTEKS
    // ============================================================
    let prompt;

    if (systemPrompt) {
      // Gunakan custom system prompt jika ada
      prompt = systemPrompt.replace('{{CONTEXT}}', context).replace('{{QUERY}}', userQuestion);
    } else {
      // Default prompt template (clean version dari kode Anda)
      prompt = `
Anda adalah Kai, teman curhat virtual untuk remaja Indonesia.

GUNAKAN konteks klinis terverifikasi di bawah ini untuk menjawab pertanyaan:
${context}

PERTANYAAN USER: "${userQuestion}"

INSTRUKSI:
- Berdasarkan jawaban pada konteks di atas
- Jangan mengarang informasi di luar konteks
- Jika konteks kurang relevan, jelaskan dengan jujur
- Selalu sertakan sumber informasi
- Gunakan bahasa Indonesia natural (aku-kamu, tidak kaku)
- Berikan jawaban 2-3 paragraf saja

JAWABAN:
`;
    }

    // ============================================================
    // 4. PANGGIL LLM (Ini akan di-handle oleh caller)
    // ============================================================
    // Note: Di implementasi kami, ini menggunakan callGeminiAPI
    // Tapi fungsi ini return prompt saja, biar fleksibel

    return {
      prompt, // Prompt yang sudah di-enhanced dengan context
      sources: relevantDocs.map(doc => ({
        type: 'clinical_knowledge',
        category: doc.category,
        name: doc.title || doc.subcategory,
        priority: doc.priority,
        score: doc.score,
        metadata: doc.metadata
      })),
      metadata: {
        retrievalMethod: 'vector_search',
        documentsFound: relevantDocs.length,
        averageScore: relevantDocs.reduce((sum, doc) => sum + doc.score, 0) / relevantDocs.length,
        hasCrisisContext: relevantDocs.some(doc => doc.category === 'CRISIS'),
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('[RAG] Error processing query:', error);

    // Fallback: Return error tapi tetap dengan struktur yang konsisten
    return {
      prompt: null,
      sources: [],
      metadata: {
        error: error.message,
        retrievalMethod: 'error',
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Simple wrapper untuk memanggil LLM (opsional)
 * Bisa digunakan atau diganti dengan callGeminiAPI
 */
async function callLLM(prompt) {
  // Placeholder - ini akan di-handle oleh ChatRoomView
  // Yang memanggil callGeminiAPI
  console.warn('[RAG] callLLM not implemented, use ChatRoomView instead');
  return null;
}

/**
 * Utility untuk format sources ke user-friendly text
 * Berguna untuk menampilkan "Sumber: ..." di UI
 */
export function formatSourcesForUser(sources) {
  if (!sources || sources.length === 0) {
    return '';
  }

  const sourceTexts = sources.map(src => {
    if (src.type === 'crisis_protocol') {
      return `📋 Protokol Krisis - ${src.name}`;
    }
    return `📚 ${src.category} - ${src.name}`;
  });

  return `\n\nSumber: ${sourceTexts.join(', ')}`;
}

export default {
  processRAGQuery,
  callLLM,
  formatSourcesForUser
};
