// src/prompts/promptUtils.js

/**
 * Returns a prompt for generating a new idea or element based on a topic.
 * 기존 아이디어와 의미적으로 중복/유사/변형된 아이디어를 명확히 제외하도록 지시.
 */
export function getIdeaPrompt(topic, type, existingTitles, direction, coreProductIdea) {
  const safeDirection = direction || 'Product';

  // 기존 아이디어(타이틀) 목록을 보기 좋게 프롬프트에 포함
  const excludeList = existingTitles.length
    ? `Here is a list of ideas that have already been generated on the canvas:\n${existingTitles.map(t => `- ${t}`).join('\n')}
Do NOT propose any idea that matches, paraphrases, or has the same meaning as any of these.`
    : "";

  const directionDetails = {
    Product: `
Propose a radically new and imaginative idea related to "${topic}".
${excludeList}
Focus on originality. Do NOT suggest any idea that could be considered similar, paraphrased, or reworded from the above list.
Surprise an industry expert—favor ideas that are bold, unusual, or would seem odd at first glance, as long as they make sense.
If the idea feels "too weird," that's a good sign.
`,
    Process: `
List 5–7 production or workflow processes that could feasibly support the product idea "${coreProductIdea?.title}" in distinct ways.
${excludeList}
Include both traditional and speculative approaches, but do NOT repeat or rephrase any listed ideas. Be specific, creative, and strive for methods that would be surprising even to professionals in the field.
`,
    Market: `
Describe 5 unique market-entry or customer engagement strategies for the product idea "${coreProductIdea?.title}".
${excludeList}
Do NOT repeat, paraphrase, or slightly reword any of the existing ideas. Use cross-industry examples, niche targeting, or hybrid campaigns—choose strategies that would stand out as highly original or unexpected.
`,
    Resource: `
Explain 5 distinct strategies for sourcing, reusing, or optimizing resources for the product idea "${coreProductIdea?.title}".
${excludeList}
Do NOT duplicate, rephrase, or use similar approaches from the excluded ideas. Favor radically new or counterintuitive resource strategies.
`,
    Organization: `
Propose 5 different organizational structures or collaboration models to support the implementation of "${coreProductIdea?.title}".
${excludeList}
Avoid duplicating, paraphrasing, or slightly rewording any format in the exclusion list. Focus on models that are highly original or speculative, possibly blending concepts across industries.
`
  };

  return `You are a domain expert in ${safeDirection.toLowerCase()} strategy and radical innovation.

${safeDirection === 'Product' 
  ? `Topic: "${topic}"`
  : `Product Idea: "${coreProductIdea?.title}"
Description: ${coreProductIdea?.description}`}

Direction: ${safeDirection}

${directionDetails[safeDirection]}

Respond in this exact format:
Title: [2–3 word concept or keyword]
Description: [1–2 sentence explanation of a highly original, surprising, or speculative idea]
`;
}

/**
 * Returns a prompt for combining two existing concepts into one new idea.
 * 기존 아이디어/요소와 중복되지 않는 새로운 결합을 유도.
 */
export function getCombinePrompt(topic, sourceTitle, targetTitle, direction, coreProductIdea) {
  const base = coreProductIdea?.title || topic;

  return `You are an expert in ideation and strategic innovation.

${coreProductIdea 
  ? `Product Idea: "${coreProductIdea.title}"
Description: ${coreProductIdea.description}` 
  : `Topic: "${topic}"`}
Direction: ${direction}

Combine the two concepts below to create a novel and original idea. 
Do NOT simply merge the words or use common industry combinations—strive for a result that would be surprising or non-obvious to experts.

Concept 1: ${sourceTitle}  
Concept 2: ${targetTitle}

Respond in this exact format:
Title: [2–3 word idea title]  
Description: [1 sentence explanation that logically combines both concepts and fits the "${direction}" direction]
`;
}

/**
 * Returns a prompt for decomposing an idea into elements.
 * 분해 시에도 기존 요소와 중복/유사하지 않도록 지시 가능.
 */
export function getDecomposePrompt(topic, ideaTitle, ideaDescription, existingElements = []) {
  const excludeList = existingElements.length
    ? `Avoid using the following elements which already exist:\n${existingElements.map(t => `- ${t}`).join('\n')}
Do NOT generate elements with the same meaning or phrasing.`
    : "";
  return `You are a creative system design expert.

Topic: "${topic}" (This is a real-world topic, not fictional)
Task: Decompose the following idea into 3 key conceptual elements based on its specifics.
Idea: "${ideaTitle}"
Description: "${ideaDescription}"
${excludeList}
Respond in this exact format:
Element 1: [2-3 words]
Element 2: [2-3 words]
Element 3: [2-3 words]`;
}
