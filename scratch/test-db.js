import { saveChatDraft, updateSession, getChatDraft } from './src/services/analyticsService.js';

async function test() {
  try {
    const draft = await getChatDraft("test_session_123");
    console.log("Draft:", draft);
    const res = await saveChatDraft("test_session_123", {
      messages: [{role: 'user', parts: [{text: 'hello'}]}],
      category: 'Psikologi',
      current_risk_level: 'Rendah'
    });
    console.log("Save:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
