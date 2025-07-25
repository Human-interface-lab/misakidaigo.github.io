// src/prompts/promptUtils.js

/**
 * Returns a prompt for generating a new idea or element based on a topic.
 */
export function getIdeaPrompt(topic, type, existingTitles) {
  return `You are a creative system design expert.

Topic: "${topic}" (This is a real-world topic, not fictional)
Task: Generate ${
    type === 'IDEA_TEMPLATE'
      ? 'a creative idea'
      : 'a conceptual element'
  } that is realistically applicable to this topic.
Do not use any of the following words as the title: ${existingTitles.join(', ')}
Respond in this exact format:
${
    type === 'IDEA_TEMPLATE'
      ? 'Title: [2–3 word idea title]\nDescription: [1 sentence explanation of how it relates to the topic]'
      : 'Title: [2–3 word conceptual element only]'
  }`;
}

/**
 * Returns a prompt for combining two existing concepts into one new idea.
 */
export function getCombinePrompt(topic, sourceTitle, targetTitle) {
  return `You are an expert in creative ideation.

Topic: "${topic}" (This is a real-world topic, not fictional)
Combine the following two concepts into one new creative idea that is realistically applicable to the topic:
- ${sourceTitle}
- ${targetTitle}
Respond in the following format:
Title: [2–3 word idea title]
Description: [1 sentence explanation that logically combines both concepts and explains how it relates to the topic]`;
}

export function getDecomposePrompt(topic, ideaTitle,ideaDescription) {
  return `You are a creative system design expert.

Topic: "${topic}" (This is a real-world topic, not fictional)
Task: Decompose the following idea into 3 key conceptual elements based on its specifics.
Idea: "${ideaTitle}"
Description: "${ideaDescription}"
Respond in this exact format:
Element 1: [2-3 words]
Element 2: [2-3 words]
Element 3: [2-3 words]`;
}