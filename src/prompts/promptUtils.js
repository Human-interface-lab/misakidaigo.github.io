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


export function getIdeaPrompt(topic, type, existingTitles, direction, coreProductIdea) {
  const safeDirection = direction || 'Product';
  const base = coreProductIdea?.title || topic;

  const directionDetails = {
    Product: `Propose a new and creative idea related to "${topic}". 
Avoid using existing idea titles: ${existingTitles.join(', ')}.`,

    Process: `Given the product idea "${base}", explain a production or workflow process that supports it efficiently. 
You may include methods such as automation, lean manufacturing, or agile workflows.`,

    Market: `Given the product idea "${base}", describe potential market-entry strategies, target customers, or promotional methods. 
Mention known approaches or similar real-world examples.`,

    Resource: `Considering the product idea "${base}", describe how necessary resources (materials, data, energy) could be sourced or optimized. 
Include real-world resource reuse strategies if applicable.`,

    Organization: `For the product idea "${base}", propose organizational models that support its development and operation. 
Include examples such as cross-functional teams, remote structures, or startup incubator models.`
  };

  return `You are a domain expert in ${safeDirection.toLowerCase()} strategy and systems.

${coreProductIdea ? `Product Idea: "${coreProductIdea.title}"\nDescription: ${coreProductIdea.description}` : `Topic: "${topic}"`}
Direction: ${safeDirection}

${directionDetails[safeDirection]}

Respond in this exact format:
Title: [2–3 word concept or keyword]
Description: [1–2 sentence explanation of a method, model, or strategy]`;
}

/**
 * Returns a prompt for combining two existing concepts into one new idea.
 */
export function getCombinePrompt(topic, sourceTitle, targetTitle, direction, coreProductIdea) {
  const base = coreProductIdea?.title || topic;

  const task = {
    Product: `Combine the two concepts below to create a novel product or service.`,
    Process: `Given the product idea "${base}", combine these two process-related concepts to propose a new operational method.`,
    Market: `For the product idea "${base}", combine the concepts to define a new customer segment, entry method, or marketing model.`,
    Resource: `Considering the product idea "${base}", combine these two resource-related ideas to optimize material use, logistics, or infrastructure.`,
    Organization: `In the context of "${base}", combine the following models to propose an innovative organizational structure or collaboration system.`
  };

  return `You are an expert in ideation and strategic innovation.

${coreProductIdea ? `Product Idea: "${coreProductIdea.title}"\nDescription: ${coreProductIdea.description}` : `Topic: "${topic}"`}
Direction: ${direction}

${task[direction]}

Concept 1: ${sourceTitle}  
Concept 2: ${targetTitle}

Respond in this exact format:
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