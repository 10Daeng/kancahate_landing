// ============================================================
// CRISIS DETECTION — Server-Only
// Deteksi tingkat risiko dari teks percakapan user
// File ini TIDAK BOLEH diimpor dari komponen 'use client'
// ============================================================

const CRISIS_SCORING = {
  tinggi: {
    score: 5,
    keywords: ['bunuh diri', 'ingin mati', 'sayat', 'akhiri hidup', 'overdosis', 'minum racun', 'gantung diri', 'loncat', 'menyakiti diri', 'lukai diri', 'iris']
  },
  menengah: {
    score: 3,
    keywords: ['capek hidup', 'pengen tidur selamanya', 'nggak kuat', 'tidak ada gunanya', 'hidup tidak bermakna', 'beban keluarga', 'hopeless', 'putus asa']
  },
  rendah: {
    score: 1,
    keywords: ['pengen mati', 'mau mati', 'mau hilang', 'pengen hilang', 'capek banget', 'capek bgt', 'lelah banget', 'mau pergi jauh', 'pengen pergi jauh', 'rasanya mau pergi']
  }
};

const criticalPatterns = [
  /b[\.\s\-_]*u[\.\s\-_]*n[\.\s\-_]*u[\.\s\-_]*h[\.\s\-_]*d[\.\s\-_]*i[\.\s\-_]*r[\.\s\-_]*i/,
  /m[\.\s\-_]*a[\.\s\-_]*u[\.\s\-_]*m[\.\s\-_]*a[\.\s\-_]*t[\.\s\-_]*i/,
  /i[\.\s\-_]*n[\.\s\-_]*g[\.\s\-_]*i[\.\s\-_]*n[\.\s\-_]*m[\.\s\-_]*a[\.\s\-_]*t[\.\s\-_]*i/,
  /m[\.\s\-_]*e[\.\s\-_]*n[\.\s\-_]*g[\.\s\-_]*a[\.\s\-_]*k[\.\s\-_]*h[\.\s\-_]*i[\.\s\-_]*r[\.\s\-_]*u[\.\s\-_]*p[\.\s\-_]*h[\.\s\-_]*i[\.\s\-_]*d[\.\s\-_]*u[\.\s\-_]*p/,
  /g[\.\s\-_]*a[\.\s\-_]*n[\.\s\-_]*t[\.\s\-_]*u[\.\s\-_]*n[\.\s\-_]*g/,
  /o[\.\s\-_]*v[\.\s\-_]*e[\.\s\-_]*r[\.\s\-_]*d[\.\s\-_]*o[\.\s\-_]*s[\.\s\-_]*i[\.\s\-_]*s/,
  /m[\.\s\-_]*i[\.\s\-_]*n[\.\s\-_]*u[\.\s\-_]*m[\.\s\-_]*r[\.\s\-_]*a[\.\s\-_]*c[\.\s\-_]*u[\.\s\-_]*n/,
  /m[\.\s\-_]*e[\.\s\-_]*n[\.\s\-_]*y[\.\s\-_]*a[\.\s\-_]*k[\.\s\-_]*i[\.\s\-_]*t[\.\s\-_]*i[\.\s\-_]*d[\.\s\-_]*i[\.\s\-_]*r[\.\s\-_]*i/,
  /l[\.\s\-_]*u[\.\s\-_]*k[\.\s\-_]*a[\.\s\-_]*i[\.\s\-_]*d[\.\s\-_]*i[\.\s\-_]*r[\.\s\-_]*i/,
  /s[\.\s\-_]*a[\.\s\-_]*y[\.\s\-_]*a[\.\s\-_]*t/
];

/**
 * Deteksi level krisis dari teks user
 * @param {string} text - Pesan user
 * @returns {{ level: string, color: string, priority: number, keyword: string|null, score: number }}
 */
export function detectCrisisLevel(text) {
  const lowerText = text.toLowerCase();
  const normalizedText = lowerText
    .replace(/[\.\s\-_]+/g, '')
    .replace(/(.)\1{2,}/g, '$1');

  let totalScore = 0;
  const detectedKeywords = [];

  // 1. Cek Regex Kritis
  for (const pattern of criticalPatterns) {
    if (pattern.test(normalizedText)) {
      totalScore += 5;
      detectedKeywords.push('suicide/self-harm pattern');
      break;
    }
  }

  // 2. Cek Kata Kunci Tinggi
  for (const keyword of CRISIS_SCORING.tinggi.keywords) {
    if (lowerText.includes(keyword) || normalizedText.includes(keyword.replace(/\s/g, ''))) {
      totalScore += CRISIS_SCORING.tinggi.score;
      detectedKeywords.push(keyword);
    }
  }

  // 3. Cek Kata Kunci Menengah
  for (const keyword of CRISIS_SCORING.menengah.keywords) {
    if (lowerText.includes(keyword) || normalizedText.includes(keyword.replace(/\s/g, ''))) {
      totalScore += CRISIS_SCORING.menengah.score;
      detectedKeywords.push(keyword);
    }
  }

  // 4. Cek Kata Kunci Rendah (kontekstual frasa)
  for (const keyword of CRISIS_SCORING.rendah.keywords) {
    if (lowerText.includes(keyword) || normalizedText.includes(keyword.replace(/\s/g, ''))) {
      totalScore += CRISIS_SCORING.rendah.score;
      detectedKeywords.push(keyword);
    }
  }

  // Evaluasi Total Skor
  if (totalScore >= 5) {
    return { level: 'Kritis', color: 'red', priority: 4, keyword: detectedKeywords.join(', '), score: totalScore };
  } else if (totalScore >= 3) {
    return { level: 'Tinggi', color: 'orange', priority: 3, keyword: detectedKeywords.join(', '), score: totalScore };
  } else if (totalScore >= 1) {
    return { level: 'Sedang', color: 'yellow', priority: 2, keyword: detectedKeywords.join(', '), score: totalScore };
  }

  return { level: 'Rendah', color: 'green', priority: 1, keyword: null, score: 0 };
}
