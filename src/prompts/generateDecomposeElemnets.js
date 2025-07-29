// src/generateDecomposeElements.js
import { getDecomposePrompt } from './promptUtils';

export async function generateDecomposeElements(topic, ideaTitle) {
  const prompt = getDecomposePrompt(topic, ideaTitle);
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    }),
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim() || '';

  // “Element 1: Foo” 형식으로 세 개를 뽑아냄
  const regex = /Element\s*\d+:\s*(.+)/gi;
  const elements = [];
  let m;
  while (elements.length < 3 && (m = regex.exec(text))) {
    elements.push(m[1].trim());
  }
  return elements;  // ['Foo','Bar','Baz']
}
