export async function generateIdeaFromTopic(topic, type) {
    const prompt = `
    You are a creative system design expert.

    Topic: "${topic}"
    Task: Generate ${type === 'IDEA_TEMPLATE' ? 'a creative idea' : 'a conceptual element'} related to the topic.
    Format:
    ${type === 'IDEA_TEMPLATE'
            ? `- Title: A single, creative word
        - Description: Explain in 1–2 sentences how this idea is conceptually linked to the topic.`
            : `- Title: A single word representing a relevant conceptual element (no description needed)`
        }
`.trim();

    const data = await res.json();
    const text = data.choices[0].message.content.trim();
    let title = '';
    let description = '';

    if (type === 'IDEA_TEMPLATE') {
        const [tLine, dLine] = text.split('\n');
        title = tLine.replace(/^Title[:：]?\s*/, '');
        description = dLine?.replace(/^Description[:：]?\s*/, '') || '';
    } else {
        title = text.replace(/^Title[:：]?\s*/, '');
        description = '';
    }

    return { title, description };
}
