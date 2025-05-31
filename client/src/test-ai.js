// test-ai.js
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();  // .env 에 OPENAI_API_KEY가 있어야 합니다

async function test() {
  const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY });
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user",   content: "테스트 메시지입니다." }
      ],
      temperature: 0.7,
      max_tokens: 50
    });
    console.log("AI 응답:", res.choices[0].message.content.trim());
  } catch (err) {
    console.error("오류 발생:", err);
  }
}

test();