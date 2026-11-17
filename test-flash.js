const key = process.env.VITE_GEMINI_API_KEY || '';

async function test(m) {
  const t0 = Date.now();
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Give a 4-word greeting.' }] }],
      generationConfig: { maxOutputTokens: 20 }
    })
  });
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log(`${m}: ${res.status} in ${Date.now() - t0}ms -> ${text ? text.trim() : JSON.stringify(data.error?.message || data)}`);
}

async function run() {
  await test('gemini-3.5-flash-lite');
  await test('gemini-flash-lite-latest');
  await test('gemini-3.5-flash');
}
run();
