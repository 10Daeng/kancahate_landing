async function test() {
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      history: [{ role: 'user', parts: [{ text: 'halo kai' }] }],
      action: 'chat',
      useStream: true
    })
  });
  
  console.log('Status:', res.status);
  
  const text = await res.text();
  console.log('Body:', text.substring(0, 200));
}
test();
