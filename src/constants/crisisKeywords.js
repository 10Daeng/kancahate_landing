// --- CONSTANTS: CRISIS KEYWORDS ---
// Keyword untuk deteksi risiko (berdasarkan DSM-5 & C-SSRS)

export const CRISIS_KEYWORDS = {
  critical: {
    keywords: ['bunuh diri', 'mau mati', 'ingin mati', 'akhiri hidup', 'gantung diri', 'lompat', 'overdose', 'minum racun'],
    level: 'Kritis',
    priority: 4
  },
  high: {
    keywords: ['menyakiti diri', 'self-harm', 'cutting', 'sayat', 'melukai', 'tidak ada gunanya hidup', 'lebih baik mati', 'capek hidup'],
    level: 'Tinggi',
    priority: 3
  },
  medium: {
    keywords: ['depresi', 'hopeless', 'putus asa', 'tidak ada harapan', 'benci diri sendiri', 'worthless', 'tidak berguna', 'kosong', 'hampa'],
    level: 'Sedang',
    priority: 2
  },
  low: {
    keywords: ['sedih', 'cemas', 'takut', 'khawatir', 'stres', 'galau', 'bingung', 'overwhelmed'],
    level: 'Rendah',
    priority: 1
  }
};

// --- CRISIS DETECTION FUNCTION ---
export function detectCrisisLevel(text) {
  const lowerText = text.toLowerCase();
  
  // Check from highest to lowest priority
  for (const [, config] of Object.entries(CRISIS_KEYWORDS).sort((a, b) => b[1].priority - a[1].priority)) {
    for (const keyword of config.keywords) {
      if (lowerText.includes(keyword)) {
        return { 
          level: config.level, 
          priority: config.priority,
          keyword: keyword
        };
      }
    }
  }
  
  return { level: 'Rendah', priority: 1, keyword: null };
}

export default CRISIS_KEYWORDS;
