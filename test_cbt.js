import { buildSystemPrompt } from './src/lib/chatEngine.js';

const prompt = buildSystemPrompt({
  userData: { name: 'K' },
  category: { title: 'Keluarga & Orang Tua' },
  currentRiskLevel: { level: 'Rendah' },
  mode: 'cbt_chat'
});

console.log(prompt);
