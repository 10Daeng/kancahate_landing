// --- RAG SERVICE (Retrieval-Augmented Generation) ---
// Menghubungkan chatbot dengan database pengetahuan klinis terverifikasi
// Mengurangi hallucinations dengan memberikan context yang relevan

import { searchKnowledge, EMBEDDING_PROVIDER } from './vectorService';

// Fallback to local knowledge base if vector search is not available
import { CBT_TECHNIQUES, GROUNDING_TECHNIQUES, CRISIS_PROTOCOLS, COPING_STRATEGIES, ASSESSMENT_GUIDES } from '../data/rag_knowledge_base';

/**
 * CONFIGURATION
 * Choose retrieval strategy:
 * - 'vector': Supabase pgvector (requires setup)
 * - 'hybrid': Vector search + keyword fallback
 * - 'keyword': Keyword matching only (for development)
 */
const RETRIEVAL_STRATEGY = EMBEDDING_PROVIDER === 'mock' ? 'keyword' : 'vector';

/**
 * Embedding simulation - Convert text to "vector" representation
 * Di production, gunakan: OpenAI Embeddings, Google Vertex AI Embeddings, atau sentence-transformers
 * @param {string} text - Text to embed
 * @returns {string} - Simplified "embedding" (kata kunci)
 */
function simulateEmbedding(text) {
  // Extract keywords from text (simplified)
  const stopWords = ['yang', 'dan', 'atau', 'tetapi', 'karena', 'jika', 'saat', 'dengan', 'untuk', 'dari', 'pada', 'ke', 'di'];
  const words = text.toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word));

  return words;
}

/**
 * Calculate similarity score between two texts
 * Di production, gunakan cosine similarity pada actual embeddings
 * @param {string} text1
 * @param {string} text2
 * @returns {number} - Similarity score 0-1
 */
function calculateSimilarity(text1, text2) {
  const emb1 = simulateEmbedding(text1);
  const emb2 = simulateEmbedding(text2);

  if (emb1.length === 0 || emb2.length === 0) return 0;

  // Jaccard similarity
  const set1 = new Set(emb1);
  const set2 = new Set(emb2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Get user metadata for RAG filtering
 * Extract user characteristics from userData for personalized RAG
 * @param {object} userData - User data from intake
 * @returns {object} - Filters for vector search
 */
function getUserFilters(userData) {
  const filters = {};

  // Age group filtering
  if (userData.dob) {
    const age = (() => {
      const today = new Date();
      const birthDate = new Date(userData.dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    })();

    if (age < 15) filters.ageGroup = '13-15';
    else if (age <= 19) filters.ageGroup = '15-19';
    else if (age <= 25) filters.ageGroup = '19-25';
    else if (age <= 34) filters.ageGroup = '25-34';
    else if (age <= 49) filters.ageGroup = '35-49';
    else filters.ageGroup = '50+';
  }

  // Education-based category filtering
  if (userData.education_status) {
    if (userData.education_status.includes('Pelajar') || userData.education_status.includes('Mahasiswa')) {
      filters.category = 'CBT'; // Teknik CBT lebih cocok untuk pelajar/mahasiswa
    }
  }

  // Priority level based on risk assessment
  filters.minPriority = 1; // Default, bisa dinaikkan based on currentRiskLevel

  return filters;
}

/**
 * Search knowledge base for relevant context with metadata filtering
 * @param {string} query - User query
 * @param {number} topK - Number of top results to return
 * @param {object} userData - User data for personalized filtering
 * @returns {Promise<Array>} - Array of {content, score, source, category}
 */
export async function searchKnowledgeBase(query, topK = 3, userData = null) {
  // Get personalized filters based on user characteristics
  const userFilters = userData ? getUserFilters(userData) : {};

  console.log('[RAG] User filters:', userFilters);

  // Try vector search first if available
  if (RETRIEVAL_STRATEGY === 'vector' || RETRIEVAL_STRATEGY === 'hybrid') {
    try {
      const vectorResults = await searchKnowledge(query, 0.6, topK, userFilters);

      if (vectorResults.length > 0) {
        console.log(`[RAG] Vector search found ${vectorResults.length} personalized results`);

        // Transform vector results to match expected format
        return vectorResults.map(item => ({
          content: {
            name: item.title,
            description: item.content,
            ...item.metadata
          },
          score: item.score,
          source: item.subcategory,
          category: item.category,
          metadata: {
            name: item.title,
            description: item.content
          }
        }));
      }
    } catch (error) {
      console.error('[RAG] Vector search failed, falling back to keyword:', error);
    }
  }

  // Fallback to keyword matching
  console.log('[RAG] Using keyword-based fallback search');
  return keywordSearchFallback(query, topK);
}

/**
 * Keyword-based search fallback
 * Used when vector search is not available
 */
function keywordSearchFallback(query, topK = 3) {
  const results = [];

  // Search through all knowledge categories
  const searchTargets = [
    { data: CBT_TECHNIQUES, category: 'CBT', priority: 1 },
    { data: COPING_STRATEGIES, category: 'COPING', priority: 1 },
    { data: GROUNDING_TECHNIQUES, category: 'GROUNDING', priority: 2 },
    { data: CRISIS_PROTOCOLS, category: 'CRISIS', priority: 3 }, // Highest priority
    { data: ASSESSMENT_GUIDES, category: 'ASSESSMENT', priority: 1 }
  ];

  for (const target of searchTargets) {
    for (const [key, value] of Object.entries(target.data)) {
      // Convert knowledge entry to searchable text
      const knowledgeText = JSON.stringify(value).toLowerCase();

      // Calculate similarity score
      const score = calculateSimilarity(query, knowledgeText);

      // Boost score for priority categories
      const boostedScore = score * (1 + (target.priority * 0.2));

      if (boostedScore > 0.1) { // Minimum threshold
        results.push({
          content: value,
          score: boostedScore,
          source: key,
          category: target.category,
          metadata: {
            name: value.name || key,
            description: value.description || ''
          }
        });
      }
    }
  }

  // Sort by score and return top K
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Format retrieved context for LLM prompt
 * @param {Array} contexts - Retrieved contexts from searchKnowledgeBase
 * @returns {string} - Formatted context string
 */
export function formatContextForLLM(contexts) {
  if (!contexts || contexts.length === 0) {
    return '';
  }

  let formatted = '\n═══════════════════════════════════════════════════════\n';
  formatted += '📚 KONTEKS PENGETAHUAN KLINIS (VERIFIED)\n';
  formatted += '═══════════════════════════════════════════════════════\n\n';

  contexts.forEach((ctx, idx) => {
    formatted += `[${idx + 1}] Sumber: ${ctx.category} - ${ctx.metadata.name}\n`;
    formatted += `Skor Relevansi: ${(ctx.score * 100).toFixed(0)}%\n`;

    if (ctx.category === 'CRISIS' && ctx.response_template) {
      formatted += `RESPONSE TEMPLATE:\n${ctx.response_template}\n`;
    } else if (ctx.description) {
      formatted += `DESKRIPSI: ${ctx.description}\n`;
    }

    if (ctx.steps && ctx.steps.length > 0) {
      formatted += `LANGKAH-LANGKAH:\n`;
      ctx.steps.forEach((step, i) => {
        formatted += `  ${i + 1}. ${step}\n`;
      });
    }

    if (ctx.examples && ctx.examples.length > 0) {
      formatted += `CONTOH:\n`;
      ctx.examples.forEach(ex => {
        formatted += `  • ${JSON.stringify(ex)}\n`;
      });
    }

    if (ctx.strategies && ctx.strategies.length > 0) {
      formatted += `STRATEGI:\n`;
      ctx.strategies.forEach(s => {
        formatted += `  • ${s}\n`;
      });
    }

    formatted += '\n';
  });

  formatted += '═══════════════════════════════════════════════════════\n';

  return formatted;
}

/**
 * Construct RAG-enhanced prompt
 * Combines user query with retrieved context
 * @param {string} userQuery - Original user message
 * @param {string} systemPrompt - Base system prompt
 * @param {Array} contexts - Retrieved contexts
 * @returns {string} - Enhanced prompt with context
 */
export function constructRAGPrompt(userQuery, systemPrompt, contexts) {
  const contextStr = formatContextForLLM(contexts);

  if (!contextStr) {
    return systemPrompt;
  }

  // Construct enhanced prompt
  const enhancedPrompt = `
${systemPrompt}

${contextStr}

INSTRUKSI KHUSUS:
1. Gunakan konteks pengetahuan klinis di atas sebagai referensi UTAMA
2. Jika konteks mencakup protokol krisis, IKUTI PROTOKOL TERSEBUT dengan ketat
3. Jangan mengarang informasi klinis di luar yang tersedia di konteks
4. Jika konteks tidak relevan, gunakan pengetahuan umum yang empatik
5. Selalu sertakan sumber informasi (misal: "Menurut teknik CBT...")

USER QUERY: "${userQuery}"
`;

  return enhancedPrompt;
}

/**
 * Validate LLM response against retrieved context
 * Ensures response doesn't contradict verified clinical knowledge
 * @param {string} response - LLM response
 * @param {Array} contexts - Retrieved contexts
 * @returns {object} - { isValid, warnings, suggestedCorrections }
 */
export function validateResponse(response, contexts) {
  const warnings = [];
  const suggestedCorrections = [];

  if (!contexts || contexts.length === 0) {
    return { isValid: true, warnings: ['No clinical context available'], suggestedCorrections: [] };
  }

  // Check for crisis-related context
  const hasCrisisContext = contexts.some(ctx => ctx.category === 'CRISIS');

  // Check response contains appropriate crisis response
  if (hasCrisisContext) {
    const crisisContext = contexts.find(ctx => ctx.category === 'CRISIS');
    const requiredElements = ['hubungi', 'bantuan', 'profesional', '112', '119', 'polisi'];

    const responseLower = response.toLowerCase();
    const hasRequiredElement = requiredElements.some(el => responseLower.includes(el));

    if (!hasRequiredElement) {
      warnings.push('Crisis detected but response lacks emergency resources');
      suggestedCorrections.push(crisisContext.content.response_template);
    }
  }

  // Check for harmful advice
  const harmfulPatterns = [
    { pattern: /stop.*obat|berhenti.*obat/i, message: 'Menghentikan obat tanpa konsultasi' },
    { pattern: /diagnos.*diri|self.*diagnos/i, message: 'Mendiagnosa diri sendiri' },
    { pattern: /tak.*apa.*apa|biasa.*saja/i, message: 'Meminimalkan masalah serius' }
  ];

  for (const { pattern, message } of harmfulPatterns) {
    if (pattern.test(response)) {
      warnings.push(`Potensi harmful advice: ${message}`);
      suggestedCorrections.push('Selalu sarankan konsultasi profesional untuk masalah kesehatan mental');
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    suggestedCorrections
  };
}

/**
 * Main RAG pipeline
 * Complete flow: Search → Retrieve → Construct Prompt → Validate
 * @param {string} userQuery - User message
 * @param {string} systemPrompt - Base system prompt
 * @param {object} userData - User data for personalized filtering
 * @param {string} aiResponse - Generated AI response
 * @returns {Promise<object>} - { enhancedPrompt, retrievedContexts, validation }
 */
export async function ragPipeline(userQuery, systemPrompt, userData = null, aiResponse = null) {
  try {
    // Step 1: Search for relevant context with personalized filtering
    const retrievedContexts = await searchKnowledgeBase(userQuery, 3, userData);

    // Step 2: Construct enhanced prompt
    const enhancedPrompt = constructRAGPrompt(userQuery, systemPrompt, retrievedContexts);

    // Step 3: Validate response (if provided)
    let validation = null;
    if (aiResponse) {
      validation = validateResponse(aiResponse, retrievedContexts);
    }

    return {
      enhancedPrompt,
      retrievedContexts,
      validation,
      hasCrisisContext: retrievedContexts.some(ctx => ctx.category === 'CRISIS')
    };
  } catch (error) {
    console.error('RAG Pipeline Error:', error);
    return {
      enhancedPrompt: systemPrompt,
      retrievedContexts: [],
      validation: null,
      hasCrisisContext: false,
      error: error.message
    };
  }
}

/**
 * Crisis Detection Service
 * Separate service for detecting crisis and activating protocols
 * @param {string} message - User message
 * @returns {object} - { isCrisis, level, protocol, shouldActivateCrisisMode }
 */
export function detectCrisis(message) {
  const crisisKeywords = {
    critical: {
      level: 'KRITIS',
      priority: 3,
      indicators: ['bunuh diri', 'akhiri hidup', 'lebih baik mati', 'ingin mati', 'mengakhiri hidupku', 'tidak ingin hidup', 'gantung diri', 'loncat dari', 'overdosis', 'minum racun', 'menyakiti diri', 'lukai diri', 'sayat', 'iris', 'luka'],
      protocol: CRISIS_PROTOCOLS.suicide_self_harm,
      shouldActivateCrisisMode: true
    },
    high: {
      level: 'TINGGI',
      priority: 2,
      indicators: ['diperkosa', 'dilecehkan', 'kdrt', 'kekerasan', 'disiksa', 'aniaya', 'pukul', 'cabul'],
      protocol: CRISIS_PROTOCOLS.abuse_violence,
      shouldActivateCrisisMode: true
    },
    moderate: {
      level: 'SEDANG',
      priority: 1,
      indicators: ['tidak bisa bangun', 'tidak bisa makan', 'tidak bisa tidur', 'tidak berdaya', 'kehilangan harapan', 'putus asa', 'hopeless', 'beban'],
      protocol: CRISIS_PROTOCOLS.severe_depression,
      shouldActivateCrisisMode: false
    }
  };

  const lowerMessage = message.toLowerCase();

  // Check each crisis level
  for (const [key, config] of Object.entries(crisisKeywords)) {
    for (const indicator of config.indicators) {
      if (lowerMessage.includes(indicator)) {
        return {
          isCrisis: true,
          level: config.level,
          priority: config.priority,
          keyword: indicator,
          protocol: config.protocol,
          shouldActivateCrisisMode: config.shouldActivateCrisisMode
        };
      }
    }
  }

  // Check obfuscated patterns
  const obfuscatedPatterns = [
    /b[.\s\-_]*u[.\s\-_]*n[.\s\-_]*u[.\s\-_]*h/,
    /m[.\s\-_]*e[.\s\-_]*n[.\s\-_]*y[.\s\-_]*a[.\s\-_]*k[.\s\-_]*i[.\s\-_]*r[.\s\-_]*u[.\s\-_]*p[.\s\-_]*h/,
    /l[.\s\-_]*u[.\s\-_]*k[.\s\-_]*a[.\s\-_]*i/
  ];

  for (const pattern of obfuscatedPatterns) {
    if (pattern.test(lowerMessage)) {
      return {
        isCrisis: true,
        level: 'KRITIS',
        priority: 3,
        keyword: 'obfuscated_self_harm',
        protocol: crisisKeywords.critical.protocol,
        shouldActivateCrisisMode: true
      };
    }
  }

  return {
    isCrisis: false,
    level: 'RENDAH',
    priority: 0,
    keyword: null,
    protocol: null,
    shouldActivateCrisisMode: false
  };
}

export default {
  searchKnowledgeBase,
  formatContextForLLM,
  constructRAGPrompt,
  validateResponse,
  ragPipeline,
  detectCrisis
};
