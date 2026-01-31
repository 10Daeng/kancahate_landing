// --- VECTOR SERVICE (Supabase + pgvector) ---
// Mengelola embedding generation dan vector search menggunakan Supabase

import { supabase } from '../lib/supabaseClient';

/**
 * CONFIGURATION
 * Pilih embedding provider:
 * - 'openai': OpenAI text-embedding-3-small (1536 dim, $0.00002/1K tokens)
 * - 'google': Google textembedding-gecko@003 (768 dim, lebih murah untuk volume besar)
 * - 'mock': Untuk development/testing (tanpa API call)
 */
export const EMBEDDING_PROVIDER = 'mock'; // Ganti ke 'openai' atau 'google' di production

const EMBEDDING_CONFIG = {
  openai: {
    apiUrl: 'https://api.openai.com/v1/embeddings',
    model: 'text-embedding-3-small',
    dimension: 1536,
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  },
  google: {
    apiUrl: `https://textembedding-gecko.googleapis.com/v1/models/textembedding-gecko@003:embed?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''}`,
    model: 'textembedding-gecko@003',
    dimension: 768
  },
  mock: {
    dimension: 384 // Sederhana untuk testing
  }
};

/**
 * Generate embedding untuk text
 * @param {string} text - Text yang ingin di-embed
 * @returns {Promise<Array<number>>} - Embedding vector
 */
export async function generateEmbedding(text) {
  if (EMBEDDING_PROVIDER === 'mock') {
    // Mock embedding untuk development
    return generateMockEmbedding(text);
  }

  if (EMBEDDING_PROVIDER === 'openai') {
    return generateOpenAIEmbedding(text);
  }

  if (EMBEDDING_PROVIDER === 'google') {
    return generateGoogleEmbedding(text);
  }

  throw new Error(`Unknown embedding provider: ${EMBEDDING_PROVIDER}`);
}

/**
 * Mock embedding generator (untuk development)
 * Produces vector yang konsisten berdasarkan text
 */
function generateMockEmbedding(text) {
  const dim = EMBEDDING_CONFIG.mock.dimension;
  const vector = new Array(dim).fill(0);

  // Simple hash-like embedding untuk consistency
  const words = text.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/);

  for (let i = 0; i < dim; i++) {
    let hash = 0;
    for (const word of words) {
      hash += word.charCodeAt(0) * (i + 1);
    }
    // Normalize to -1 to 1
    vector[i] = (Math.sin(hash) + Math.cos(hash * 2)) / 2;
  }

  return vector;
}

/**
 * Generate embedding using OpenAI API
 */
async function generateOpenAIEmbedding(text) {
  const config = EMBEDDING_CONFIG.openai;

  if (!config.apiKey || config.apiKey === 'your_openai_api_key') {
    console.warn('[OpenAI] API key not set, falling back to mock embedding');
    return generateMockEmbedding(text);
  }

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        input: text.replace(/\n/g, ' '), // Clean newlines
        encoding_format: 'float'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[OpenAI] Embedding error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('[OpenAI] Embedding generation failed, falling back to mock:', error);
    return generateMockEmbedding(text);
  }
}

/**
 * Generate embedding using Google Vertex AI
 */
async function generateGoogleEmbedding(text) {
  const config = EMBEDDING_CONFIG.google;

  if (!config.apiUrl.includes('=')) {
    console.warn('[Google] API key not set, falling back to mock embedding');
    return generateMockEmbedding(text);
  }

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: text,
        taskType: 'RETRIEVAL_DOCUMENT'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Google] Embedding error:', error);
      throw new Error(`Google API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.embedding.value;
  } catch (error) {
    console.error('[Google] Embedding generation failed, falling back to mock:', error);
    return generateMockEmbedding(text);
  }
}

/**
 * Serialize knowledge content to human-readable text for better embedding
 * Transforms nested JSON metadata into natural language format
 * @param {object} knowledge - Knowledge object with metadata
 * @returns {string} - Serialized text for embedding
 */
function serializeKnowledgeContent(knowledge) {
  const parts = [];

  // Title & description
  parts.push(`# ${knowledge.title}`);
  parts.push(knowledge.content);

  const metadata = knowledge.metadata || {};

  // Steps (if any)
  if (metadata.steps && Array.isArray(metadata.steps) && metadata.steps.length > 0) {
    parts.push('\nLangkah-langkah:');
    metadata.steps.forEach((step, i) => {
      parts.push(`${i + 1}. ${step}`);
    });
  }

  // Strategies (if any)
  if (metadata.strategies && Array.isArray(metadata.strategies) && metadata.strategies.length > 0) {
    parts.push('\nStrategi:');
    metadata.strategies.forEach(s => parts.push(`• ${s}`));
  }

  // Examples (if any)
  if (metadata.examples && Array.isArray(metadata.examples) && metadata.examples.length > 0) {
    parts.push('\nContoh:');
    metadata.examples.forEach(ex => {
      if (typeof ex === 'string') {
        parts.push(`• ${ex}`);
      } else if (typeof ex === 'object') {
        parts.push(`• ${JSON.stringify(ex)}`);
      }
    });
  }

  // Response template (for crisis protocols)
  if (metadata.response_template) {
    parts.push(`\nTemplate Respons: ${metadata.response_template}`);
  }

  // Activities (if any)
  if (metadata.activities && Array.isArray(metadata.activities) && metadata.activities.length > 0) {
    parts.push('\nAktivitas:');
    metadata.activities.forEach(act => parts.push(`• ${act}`));
  }

  // Warning/Disclaimer
  if (metadata.warning) {
    parts.push(`\n⚠️ ${metadata.warning}`);
  }

  return parts.join('\n');
}

/**
 * Insert knowledge dengan embedding ke Supabase
 * @param {object} knowledge - Knowledge object
 * @returns {Promise<object>} - Insert result
 */
export async function insertKnowledge(knowledge) {
  try {
    // Generate embedding dari serialized content (better than JSON.stringify)
    const textToEmbed = serializeKnowledgeContent(knowledge);
    const embedding = await generateEmbedding(textToEmbed);

    const { data, error } = await supabase
      .from('clinical_knowledge')
      .insert({
        category: knowledge.category,
        subcategory: knowledge.subcategory,
        title: knowledge.title,
        content: knowledge.content,
        metadata: knowledge.metadata || {},
        priority: knowledge.priority || 1,
        embedding: `[${embedding.join(',')}]` // Supabase format for vector type
      })
      .select()
      .single();

    if (error) throw error;

    console.log('[Vector] Knowledge inserted:', data.id);
    return { success: true, data };
  } catch (error) {
    console.error('[Vector] Insert failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Vector similarity search with metadata filtering
 * Mencari knowledge yang paling relevan dengan query
 * @param {string} query - User query
 * @param {number} threshold - Minimum similarity score (0-1)
 * @param {number} limit - Max results
 * @param {object} filters - Metadata filters (using @> operator)
 * @returns {Promise<Array>} - Relevant knowledge items
 */
export async function searchKnowledge(
  query,
  threshold = 0.7,
  limit = 5,
  filters = {}
) {
  try {
    // Generate embedding untuk query
    const queryEmbedding = await generateEmbedding(query);
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    // Build filter_metadata JSONB untuk @> operator
    // Lebih clean: langsung pass JSON object, bukan individual parameters
    const filterMetadata = {};

    if (filters.category) filterMetadata.category = filters.category;
    if (filters.ageGroup) filterMetadata.target_age_group = filters.ageGroup;
    if (filters.severity) filterMetadata.severity = filters.severity;

    // Prepare RPC parameters (simplified!)
    const rpcParams = {
      query_embedding: embeddingString,
      match_threshold: threshold,
      match_count: limit,
      filter_metadata: filterMetadata,  // Single JSONB object using @> operator
      min_priority: filters.minPriority || 1
    };

    // Call Supabase RPC function untuk vector search dengan filters
    const { data, error } = await supabase.rpc('match_clinical_knowledge', rpcParams);

    if (error) throw error;

    console.log(`[Vector] Found ${data.length} results for: "${query}"`, filterMetadata);

    return data.map(item => ({
      id: item.id,
      category: item.category,
      subcategory: item.subcategory,
      title: item.title,
      content: item.content,
      description: item.content, // Alias for compatibility
      metadata: item.metadata,
      priority: item.priority,
      score: item.similarity
    }));
  } catch (error) {
    console.error('[Vector] Search failed:', error);
    return [];
  }
}

/**
 * Bulk insert knowledge base
 * Untuk initial seeding dari rag_knowledge_base.js
 * @param {Array} knowledges - Array of knowledge objects
 * @returns {Promise<object>} - Batch insert result
 */
export async function bulkInsertKnowledge(knowledges) {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (const knowledge of knowledges) {
    const result = await insertKnowledge(knowledge);
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push({ knowledge: knowledge.title, error: result.error });
    }

    // Rate limiting untuk API calls (1 request per 100ms)
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('[Vector] Bulk insert complete:', results);
  return results;
}

/**
 * Initialize knowledge base from rag_knowledge_base.js
 * Seed data ke Supabase pada first run dengan metadata lengkap
 */
export async function initializeKnowledgeBase() {
  try {
    // Check if already initialized
    const { count } = await supabase
      .from('clinical_knowledge')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      console.log('[Vector] Knowledge base already initialized with', count, 'entries');
      return { success: true, message: 'Already initialized', count };
    }

    // Import and transform knowledge from rag_knowledge_base.js
    const {
      CBT_TECHNIQUES,
      GROUNDING_TECHNIQUES,
      CRISIS_PROTOCOLS,
      COPING_STRATEGIES,
      ASSESSMENT_GUIDES
    } = await import('../data/rag_knowledge_base');

    const knowledges = [];

    // Transform CBT techniques dengan metadata lengkap
    for (const [key, value] of Object.entries(CBT_TECHNIQUES)) {
      knowledges.push({
        category: 'CBT',
        subcategory: key,
        title: value.name,
        content: value.description,
        metadata: {
          source: 'WHO_Depression_Guideline',
          category: 'depression',
          target_age_group: '15-25',  // CBT cocok untuk remaja-dewasa muda
          severity: 'moderate',
          last_updated: new Date().toISOString().split('T')[0],
          steps: value.steps,
          examples: value.examples,
          activities: value.activities
        },
        priority: 1
      });
    }

    // Transform Grounding techniques
    for (const [key, value] of Object.entries(GROUNDING_TECHNIQUES)) {
      knowledges.push({
        category: 'GROUNDING',
        subcategory: key,
        title: value.name,
        content: value.description,
        metadata: {
          ...value,
          source: 'CBT_Techniques_Manual',
          target_age_group: '13-25',  // Grounding cocok untuk semua usia
          severity: 'mild',
          last_updated: new Date().toISOString().split('T')[0]
        },
        priority: 2
      });
    }

    // Transform Crisis protocols (HIGHEST PRIORITY ⚠️)
    for (const [key, value] of Object.entries(CRISIS_PROTOCOLS)) {
      knowledges.push({
        category: 'CRISIS',
        subcategory: key,
        title: `${value.level} - ${key}`,
        content: value.response_template || value.description,
        metadata: {
          ...value,
          source: 'AAP_Crisis_Protocol',
          target_age_group: '13-25',
          severity: 'severe',
          last_updated: new Date().toISOString().split('T')[0],
          warning: 'CRISIS - Aktifkan protokol darurat'
        },
        priority: 3  // Highest priority!
      });
    }

    // Transform Coping strategies
    for (const [key, value] of Object.entries(COPING_STRATEGIES)) {
      knowledges.push({
        category: 'COPING',
        subcategory: key,
        title: value.name,
        content: value.strategies?.join(' ') || value.description,
        metadata: {
          ...value,
          source: 'Adolescent_Coping_Guide',
          target_age_group: '15-25',
          severity: 'mild',
          last_updated: new Date().toISOString().split('T')[0]
        },
        priority: 1
      });
    }

    // Transform Assessment guides
    for (const [key, value] of Object.entries(ASSESSMENT_GUIDES)) {
      knowledges.push({
        category: 'ASSESSMENT',
        subcategory: key,
        title: value.name,
        content: value.disclaimer || value.description,
        metadata: {
          ...value,
          source: 'Clinical_Assessment_Manual',
          target_age_group: '15-25',
          severity: 'informational',
          last_updated: new Date().toISOString().split('T')[0]
        },
        priority: 1
      });
    }

    // Bulk insert
    const result = await bulkInsertKnowledge(knowledges);

    return {
      success: result.success > 0,
      message: `Initialized ${result.success} entries`,
      result
    };
  } catch (error) {
    console.error('[Vector] Initialization failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get statistics about knowledge base
 */
export async function getKnowledgeStats() {
  try {
    const { data, error } = await supabase
      .from('clinical_knowledge')
      .select('category, priority', { count: 'exact' });

    if (error) throw error;

    const byCategory = {};
    data.forEach(item => {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    });

    return {
      total: data.length,
      byCategory,
      highPriority: data.filter(i => i.priority >= 3).length
    };
  } catch (error) {
    console.error('[Vector] Stats failed:', error);
    return { total: 0, byCategory: {}, highPriority: 0 };
  }
}

export default {
  generateEmbedding,
  insertKnowledge,
  searchKnowledge,
  bulkInsertKnowledge,
  initializeKnowledgeBase,
  getKnowledgeStats,
  EMBEDDING_PROVIDER
};
