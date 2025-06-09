// src/prompts.js
import { detectLanguage } from './utils/detectLanguage';

// 시스템 메시지: 응답 언어를 사용자 요청 언어와 동일하게 유지하도록 지시
export const systemMessage = `
You are a helpful assistant that always responds
in the same language as the user's request.
Provide only the JSON array as instructed,
without any extra text such as greetings or explanations.
`;

/**
 * 두 개념을 합칠 때 사용할 프롬프트
 */
export function getCombinePrompt(textA, textB) {
  const userLang = detectLanguage(textA + textB);
  return `
Respond in ${userLang}.
Provide exactly 1 metacognitive question that prompts reflection
on the relationship between "${textA}" and "${textB}".
Respond ONLY with a JSON array of that single question,
without any additional commentary, explanation, greetings, or formatting.
`.trim();
}

/**
 * 한 개념을 확장할 때 사용할 프롬프트
 */
export function getDeepPrompt(concept) {
  const userLang = detectLanguage(concept);
  return `
Respond in ${userLang}.
Provide exactly 2 single-sentenced metacognitive questions elaborating on the concept
"${concept}" not more than 8 words.
Respond ONLY with a JSON array of those two sentences,
without any additional commentary, explanation, greetings, or formatting.
`.trim();
}

export function getExamplesPrompt(question) {
  return `
    아래 질문에 대해 3개의 예시 답변을 JSON 배열 형태로 출력해 주세요.
    질문: "${question}"
    - 각 답변은 1줄 이내로 간략히 작성해 주세요.
    - 순수 JSON 배열(예: ["답변1", "답변2", "답변3"]) 형태로만 응답해 주세요.
  `.trim();
}