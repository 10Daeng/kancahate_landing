const systemPrompt = "Halo";
const history = [
  { role: 'model', parts: [{ text: 'Halo!' }] },
  { role: 'user', parts: [{ text: 'kehidupan makin susah ya kan' }] }
];

const groqMessages = [
  { role: 'system', content: systemPrompt },
  ...history.map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user',
    content: msg.parts[0].text
  }))
];

async function test() {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.95,
      stream: true
    })
  });
  
  console.log('Status:', response.status);
  const text = await response.text();
  console.log('Response:', text.substring(0, 200));
}
test();
