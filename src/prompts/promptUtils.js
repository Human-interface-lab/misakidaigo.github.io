// src/prompts/promptUtils.js

/**
 * Returns a prompt for generating a new idea or element based on a topic.
 */


export function getIdeaPrompt(topic, type, existingTitles, direction, coreProductIdea) {
  const safeDirection = direction || 'Product';

  const directionDetails = {
    Product: `Propose a new and creative idea related to "${topic}". 
Avoid using existing idea titles: ${existingTitles.join(', ')}.`,

    Process: `List 5–7 production or workflow processes that could feasibly support the product idea "${coreProductIdea?.title}" in distinct ways. 
Include a wide range of strategies, from traditional methods to emerging technologies and speculative approaches. 
Be specific and creative — consider combining software and hardware processes, using automation, AI, edge computing, supply chain decentralization, crowdsourced production, or adaptive manufacturing systems. 
Ensure that no two suggestions are alike and that they apply to different industry settings or scales to reduce duplication.`,

    Market: `Describe 5 unique market-entry or customer engagement strategies for the product idea "${coreProductIdea?.title}".
Avoid repeating or paraphrasing any of these existing concepts: ${existingTitles.join('; ')}.
Each strategy should involve different channels, segmentation approaches, pricing models, or promotional methods.
Encourage the use of cross-industry examples, niche targeting, or hybrid digital-physical campaigns.`,

    Resource: `Explain 5 distinct strategies for sourcing, reusing, or optimizing resources for the product idea "${coreProductIdea?.title}".
Avoid duplicating or slightly rewording previous examples: ${existingTitles.join('; ')}.
Include various approaches like circular economy models, resource-sharing platforms, green logistics, or novel material usage.`,

    Organization: `Propose 5 different organizational structures or collaboration models to support the implementation of "${coreProductIdea?.title}".
Avoid duplicating formats from these existing suggestions: ${existingTitles.join('; ')}.
Include a wide range of models such as cooperatives, DAOs, incubator ecosystems, project-based teaming, or AI-assisted coordination.`
  };

  return `You are a domain expert in ${safeDirection.toLowerCase()} strategy and systems.

${safeDirection === 'Product' 
  ? `Topic: "${topic}"` 
  : `Product Idea: "${coreProductIdea?.title}"
Description: ${coreProductIdea?.description}`}

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

${coreProductIdea 
  ? `Product Idea: "${coreProductIdea.title}"
Description: ${coreProductIdea.description}` 
  : `Topic: "${topic}"`}
Direction: ${direction}

${task[direction]}

Concept 1: ${sourceTitle}  
Concept 2: ${targetTitle}

Respond in this exact format:
Title: [2–3 word idea title]  
Description: [1 sentence explanation that logically combines both concepts and fits the "${direction}" direction]`;
}

export function getDecomposePrompt(topic, ideaTitle, ideaDescription) {
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
