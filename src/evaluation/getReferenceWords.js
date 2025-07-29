// evaluation/getReferenceWords.js

export async function fetchReferenceWords(topic) {
  // 실제로는 백엔드에서 OpenAI API 호출 후 반환하게 할 것
  const response = await fetch("/api/getReferenceWords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  const data = await response.json();
  // 예: ["Drone", "Personalization", ...]
  return data.words;
}
