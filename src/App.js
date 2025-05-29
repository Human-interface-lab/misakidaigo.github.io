// src/App.js
import React, { useState } from 'react';
import Canvas from './components/Canvas';
import ContextMenu from './components/ContextMenu';

function App() {
  // Sticky notes state
  const [notes, setNotes] = useState([
    { id: 'a', title: '아이디어 A', x: 50, y: 50, width: 150, color: 'yellow' },
    { id: 'b', title: '아이디어 B', x: 200, y: 100, width: 150, color: 'yellow' },
  ]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, noteId: null });
  const [editingId, setEditingId] = useState(null);

  // AI Q&A state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [aiError, setAiError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Combine two notes and call AI to get related words
  const handleCombine = async (fromId, toId) => {
    const noteA = notes.find(n => n.id === fromId);
    const noteB = notes.find(n => n.id === toId);
    if (!noteA || !noteB) return;
    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      alert('.env에 REACT_APP_OPENAI_API_KEY를 설정하고 앱을 재시작하세요.');
      return;
    }
    setAiLoading(true);
    try {
      const prompt = `Provide a JSON array of 1 sentence related to both \"${noteA.title}\" and \"${noteB.title}\".`;
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 100
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim() || '[]';
      // Robust JSON parsing: extract JSON array substring
let related = [];
{
  const match = content.match(/\[.*?\]/s);
  if (match) {
    try {
      related = JSON.parse(match[0]);
    } catch (e) {
      throw new Error("Invalid JSON in AI response: " + e.message);
    }
  } else {
    throw new Error("AI response does not contain a JSON array");
  }
}
      // calculate center
      const centerX = (noteA.x + noteB.x) / 2;
      const centerY = (noteA.y + noteB.y) / 2;
      // remove original two notes
      setNotes(prev => {
        const filtered = prev.filter(n => n.id !== fromId && n.id !== toId);
        const newNotes = related.map((word, idx) => ({
          id: `${Date.now()}_${idx}`,
          title: word,
          x: centerX + idx * 10,
          y: centerY + idx * 10,
          width: 150,
          color: 'yellow'
        }));
        return [...filtered, ...newNotes];
      });
    } catch (err) {
      console.error(err);
      alert(`AI 호출 중 오류: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
    setContextMenu({ visible: false, x: 0, y: 0, noteId: null });
  };

  const handleMove = (id, x, y) =>
    setNotes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  const handleResize = (id, x, y, size) =>
    setNotes(prev => prev.map(n => n.id === id ? { ...n, x, y, width: size } : n));
  const handleColorChange = (id, color) =>
    setNotes(prev => prev.map(n => n.id === id ? { ...n, color } : n));
  const handleEditComplete = (id, title) => {
    // 메모 내용이 비어있으면 삭제
    if (title.trim() === '') {
      setNotes(prev => prev.filter(n => n.id !== id));
    } else {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, title } : n));
    }
    setEditingId(null);
  };

  const handleDelete = id =>
    setNotes(prev => prev.filter(n => n.id !== id));
  const handleAddNote = () =>
    setNotes(prev => [...prev, { id: Date.now().toString(), title: '새 노트', x: 100, y: 100, width: 150, color: 'yellow' }]);
  const handleContext = (id, x, y) => {
    setContextMenu({ visible: true, x, y, noteId: id });
    setEditingId(null);
  };
  const handleEditStart = id => setEditingId(id);
  const closeContext = () => setContextMenu({ visible: false, x: 0, y: 0, noteId: null });

  // AI Q&A panel
  const handleAICall = async () => {
    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      setAiError('환경 변수가 설정되지 않았습니다. .env 파일에 REACT_APP_OPENAI_API_KEY를 추가하고 앱을 재시작하세요.');
      return;
    }
    setAiLoading(true);
    setAiReply('');
    setAiError('');
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: aiPrompt }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content?.trim() || '';
      setAiReply(reply);
    } catch (err) {
      console.error(err);
      setAiError(`AI 응답 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      {/* AI Q&A Panel */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <h2>AI Q&A</h2>
        <input
          type="text"
          value={aiPrompt}
          onChange={e => setAiPrompt(e.target.value)}
          placeholder="질문을 입력하세요"
          style={{ width: '60%', padding: '0.5rem' }}
        />
        <button
          onClick={handleAICall}
          disabled={aiLoading}
          style={{ marginLeft: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          {aiLoading ? '...' : '전송'}
        </button>
        {aiError && (
          <div style={{ marginTop: '0.5rem', color: 'red' }}>
            <strong>오류:</strong> {aiError}
          </div>
        )}
        {!aiError && (
          <div style={{ marginTop: '0.5rem' }}>
            <strong>응답:</strong> {aiReply}
          </div>
        )}
      </div>

      {/* Sticky Notes Canvas & Controls */}
      <button
        onClick={handleAddNote}
        style={{ margin: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        새 노트 추가
      </button>
      <Canvas
        notes={notes}
        onCombine={handleCombine}
        onMove={handleMove}
        onResize={handleResize}
        onContext={handleContext}
        onColorChange={handleColorChange}
        editingId={editingId}
        onEditStart={handleEditStart}
        onEditComplete={handleEditComplete}
      />
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={() => setEditingId(contextMenu.noteId)}
          onDelete={() => handleDelete(contextMenu.noteId)}
          onColorChange={color => handleColorChange(contextMenu.noteId, color)}
          onClose={closeContext}
        />
      )}
    </div>
  );
}

export default App;
