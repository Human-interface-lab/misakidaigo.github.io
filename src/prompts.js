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
export function getExpandPrompt(concept) {
  const userLang = detectLanguage(concept);
  return `
Respond in ${userLang}.
Provide exactly 2 single-sentence ideas elaborating on the concept
"${concept}".
Respond ONLY with a JSON array of those two sentences,
without any additional commentary, explanation, greetings, or formatting.
`.trim();
}

/** 
 * 노트 목록(notes)과 사용자의 질문(question)을 받아,
 * 해당 노트들을 컨텍스트로 사용해 질문에 답하도록 유도하는 프롬프트를 생성합니다.
 */
export function getAnswerPrompt(notes, question) {
  const userLang = detectLanguage(notes.map(n => n.title).join(' '));
  const noteList = notes.map(n => `- ${n.title}`).join('\n');
  return `
Respond in ${userLang}.
You have the following notes as context:
${noteList}

Using only this context, answer the question:
"${question}"

Provide a concise, direct answer in the same language,
and do NOT include any explanations, greetings, or extra text.
`.trim();
}