// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';       // 수정된 import 방식
import dotenv from 'dotenv';

dotenv.config(); // 루트/.env 에서 OPENAI_API_KEY 읽어오기

// ESM 환경에서 __dirname 쓰기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// OPENAI_API_KEY가 설정되지 않았으면 바로 종료
if (!process.env.REACT_APP_OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY 환경 변수가 필요합니다.');
  process.exit(1);
}

// OpenAI 클라이언트 생성 (v4+ 기본 방식)
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY
});

app.use(express.json());

// ─── 1) /api/combine ───────────────────────────────────────────────
app.post('/api/combine', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user',   content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 60
    });

    // v4부터는 응답 구조가 slightly 다름: completion.choices[0].message.content
    const content = completion.choices[0].message.content.trim();
    const match = content.match(/\[.*?\]/s);
    const related = match ? JSON.parse(match[0]) : [];
    return res.json({ related });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── 2) /api/expand ────────────────────────────────────────────────
app.post('/api/expand', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user',   content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    const content = completion.choices[0].message.content.trim();
    const match = content.match(/\[.*?\]/s);
    const related = match ? JSON.parse(match[0]) : [];
    return res.json({ related });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── 3) /api/deep ─────────────────────────────────────────────────
app.post('/api/deep', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const deepPrompt = `
      Provide exactly 2 detailed, specific questions for deeper reflection on "${title}".
      Respond only with a JSON array of two strings, without any extra text.
    `.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user',   content: deepPrompt }
      ],
      temperature: 0.6,
      max_tokens: 100
    });

    const content = completion.choices[0].message.content.trim();
    const match = content.match(/\[.*?\]/s);
    const questions = match ? JSON.parse(match[0]) : [];
    return res.json({ questions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── 4) /api/detail ────────────────────────────────────────────────
app.post('/api/detail', (req, res) => {
  try {
    const { originTitle, detailType } = req.body;
    if (!originTitle || !detailType) {
      return res.status(400).json({ error: 'originTitle and detailType are required' });
    }
    return res.json({ detail: detailType });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── 5) React 정적 파일 서빙 ───────────────────────────────────────
app.use(express.static(path.join(__dirname, 'client', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

// ─── 서버 기동 ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
