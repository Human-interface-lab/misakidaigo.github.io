// src/prompts/promptUtils.js

/**
 * Returns a prompt for generating a new idea or element based on a topic.
 */
const directionGoals = {
  Product: 'Generate a product or service idea that solves a real-world problem.',
  Process: 'Propose an innovative operational method or workflow.',
  Market: 'Suggest a solution that serves a new customer segment or market.',
  Resource: 'Create a concept that reuses or optimizes existing resources.',
  Organization: 'Design a novel structure or system for collaboration or business operation.'
};


export function getIdeaPrompt(topic, type, existingTitles, direction) {
  const safeDirection = direction || 'Product';

  const directionDetails = {
    Product: `Propose a new and creative idea related to "${topic}". 
Avoid using existing idea titles: ${existingTitles.join(', ')}.`,

    Process: `Provide a brief explanation of existing production or workflow processes relevant to "${topic}". 
Include known methods such as automation, optimization, or any industry-specific frameworks.`,

    Market: `Introduce known marketing or market-entry strategies for products or services related to "${topic}". 
Include real-world examples or case studies if possible.`,

    Resource: `Explain how resources related to "${topic}" (materials, data, energy, etc.) have been reused, optimized, or redistributed in existing applications. 
You may include examples of circular economy or shared systems.`,

    Organization: `Describe existing organizational structures or models used for "${topic}". 
Mention distributed teams, agile development, open-source collaboration, or other known operational patterns.`
  };

  return `You are a domain expert in ${safeDirection.toLowerCase()} strategy and systems.

Topic: "${topic}"
Direction: ${safeDirection}

${directionDetails[safeDirection]}

Respond in this exact format:
Title: [2–3 word concept or keyword]
Description: [1–2 sentence explanation of a known method, model, or example]`;
}

/**
 * Returns a prompt for combining two existing concepts into one new idea.
 */
export function getCombinePrompt(topic, sourceTitle, targetTitle, direction) {
  const task = {
    Product: 'Combine the two concepts into a new product or service.',
    Process: 'Combine the two concepts to propose a new process or workflow.',
    Market: 'Combine the two concepts to serve a new market or customer segment.',
    Resource: 'Combine the two concepts to repurpose or better utilize existing resources.',
    Organization: 'Combine the two concepts to innovate an organizational structure or model.'
  };

  return `You are an expert in creative ideation.

Topic: "${topic}" (This is a real-world topic, not fictional)
Direction: ${direction}

${task[direction]}
- ${sourceTitle}
- ${targetTitle}

Respond in the following format:
Title: [2–3 word idea title]
Description: [1 sentence explanation that logically combines both concepts and fits the "${direction}" direction]`;
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