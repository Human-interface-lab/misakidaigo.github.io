// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY});

// 테스트용 엔드포인트
app.post('/api/test-ai', async (req, res) => {
  try {
    const { prompt } = req.body;
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user',   content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 50
    });
    res.json({ reply: chat.choices[0].message.content.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI 응답 중 오류가 발생했습니다.' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AI 서버 실행 중: http://localhost:${PORT}`);
});