// src/App.js
import React, { useState } from 'react';
import Canvas from './components/Canvas';
import ContextMenuRenderer from './components/ContextMenuRenderer';
import { systemMessage, getCombinePrompt, getDeepPrompt } from './prompts';
import { logConversation, logExpand, removeLogsForNote, clearLogs } from './utils/logger';

function App() {
  const [notes, setNotes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    noteId: null
  });
  const [editingId, setEditingId] = useState(null);

  // —————— 노트 합치기 ——————
  const handleCombine = async (fromId, toId) => {
    const noteA = notes.find(n => n.id === fromId);
    const noteB = notes.find(n => n.id === toId);
    if (!noteA || !noteB) return;
    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      alert('.env에 REACT_APP_OPENAI_API_KEY를 설정하고 앱을 재시작하세요.');
      return;
    }
    try {
      const prompt = getCombinePrompt(noteA.title, noteB.title);
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user',   content: prompt }
          ],
          temperature: 0.5,
          max_tokens: 60
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const content = data.choices[0].message.content.trim();
      const match = content.match(/\[.*?\]/s);
      const related = match ? JSON.parse(match[0]).slice(0, 1) : [];

      // 두 노트 중간에 새 노트 위치
      const centerX = (noteA.x + noteB.x) / 2;
      const centerY = (noteA.y + noteB.y) / 2;
      const newNoteId = `combined_${Date.now()}`;

      // 원본 노트 및 로그 삭제
      setNotes(prev => prev.filter(n => n.id !== fromId && n.id !== toId));
      removeLogsForNote(fromId);
      removeLogsForNote(toId);

      // 새 노트 추가 (type: 'normal')
      setNotes(prev => [
        ...prev,
        {
          id:    newNoteId,
          title: related[0] || '',
          x:     centerX,
          y:     centerY,
          width: 150,
          color: 'yellow',
          type:  'normal'
        }
      ]);

      // 합치기 로그 기록
      logConversation(newNoteId, 'combine', prompt, related[0] || '');

      // 연결선 재매핑
      setConnections(prev =>
        prev.map(c => ({
          from: [fromId, toId].includes(c.from) ? newNoteId : c.from,
          to:   [fromId, toId].includes(c.to)   ? newNoteId : c.to
        }))
      );
    } catch (err) {
      console.error(err);
      alert(`AI 호출 중 오류: ${err.message}`);
    } finally {
      setContextMenu({ visible: false, x: 0, y: 0, noteId: null });
    }
  };

  // —————— 기본 확장: “프롬프트 생성” + “복사 노트” ——————
  const handleExpand = (id) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const dist = 200;
    const angles = [-Math.PI / 4, Math.PI / 4];
    const timestamp = Date.now();

    const newNotes = angles.map((angle, idx) => {
      const isPromptNote = idx === 0;
      return {
        id:    `${id}_initExpand${idx}_${timestamp}`,
        title: isPromptNote ? '프롬프트 생성' : note.title,
        x:     note.x + Math.cos(angle) * dist,
        y:     note.y + Math.sin(angle) * dist,
        width: 150,
        color: isPromptNote ? 'lightblue' : 'lightgreen',
        type:  isPromptNote ? 'promptNote' : 'expandCopy'
      };
    });

    setNotes(prev => [...prev, ...newNotes]);
    setConnections(prev => [
      ...prev,
      ...newNotes.map(n => ({ from: id, to: n.id }))
    ]);

    newNotes.forEach((n, idx) => {
      const responseText = idx === 0
        ? `프롬프트 생성: ${n.id}`
        : `아이디어 확장 복사: ${n.title}`;
      logExpand(n.id, responseText);
    });

    setContextMenu({ visible: false, x: 0, y: 0, noteId: null });
  };

  // —————— 심화 확장: 두 개의 구체적 질문 생성 ——————
  const handleDeepExpand = async (id) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      alert('.env에 REACT_APP_OPENAI_API_KEY를 설정하고 앱을 재시작하세요.');
      return;
    }
    try {
      const deepPrompt = getDeepPrompt(note.title);
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user',   content: deepPrompt }
          ],
          temperature: 0.6,
          max_tokens: 100
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const content = data.choices[0].message.content.trim();
      const match = content.match(/\[.*?\]/s);
      const questions = match ? JSON.parse(match[0]).slice(0, 2) : [];

      const dist = 200;
      const angles = [-Math.PI / 6, Math.PI / 6];
      const timestamp = Date.now();

      const newDeepNotes = questions.map((q, idx) => ({
        id:    `${id}_deep${idx}_${timestamp}`,
        title: q,
        x:     note.x + Math.cos(angles[idx]) * dist,
        y:     note.y + Math.sin(angles[idx]) * dist,
        width: 200,
        color: 'violet',
        type:  'deepNote'
      }));

      setNotes(prev => [...prev, ...newDeepNotes]);
      setConnections(prev => [
        ...prev,
        ...newDeepNotes.map(n => ({ from: id, to: n.id }))
      ]);

      newDeepNotes.forEach(n => {
        logConversation(n.id, 'deepExpand', deepPrompt, n.title);
      });
    } catch (err) {
      console.error(err);
      alert(`심화 확장 중 오류: ${err.message}`);
    } finally {
      setContextMenu({ visible: false, x: 0, y: 0, noteId: null });
    }
  };

  // —————— “Persona, Tone, Audience, Example, Format” 노트 생성 ——————
  const handleCreateDetail = (originId, detailType) => {
    const origin = notes.find(n => n.id === originId);
    if (!origin) return;

    const dist = 200;
    // “프롬프트 생성” 노트 기준 오른쪽 위(각도: -π/3)로 위치
    const angle = -Math.PI / 3;
    const newX = origin.x + Math.cos(angle) * dist;
    const newY = origin.y + Math.sin(angle) * dist;
    const newNoteId = `${originId}_detail_${detailType}_${Date.now()}`;

    setNotes(prev => [
      ...prev,
      {
        id:    newNoteId,
        title: detailType,      // “Persona” or “Tone” 등
        x:     newX,
        y:     newY,
        width: 180,
        color: 'lightcoral',
        type:  'detailNote'
      }
    ]);

    logConversation(newNoteId, 'detailExpand', `Detail: ${detailType}`, detailType);

    // 연결선 추가
    setConnections(prev => [
      ...prev,
      { from: originId, to: newNoteId }
    ]);
    setContextMenu({ visible: false, x: 0, y: 0, noteId: null });
  };

  // 기타 핸들러들
  const handleMove        = (id, x, y)       => setNotes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  const handleResize      = (id, x, y, size) => setNotes(prev => prev.map(n => n.id === id ? { ...n, x, y, width: size } : n));
  const handleColorChange = (id, color)      => setNotes(prev => prev.map(n => n.id === id ? { ...n, color } : n));
  const handleEditComplete = (id, title) => {
    if (title.trim() === '') {
      setNotes(prev => prev.filter(n => n.id !== id));
      removeLogsForNote(id);
    } else {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, title } : n));
    }
    setEditingId(null);
  };
  const handleDelete = id => {
    setNotes(prev => prev.filter(n => n.id !== id));
    removeLogsForNote(id);
  };
  const handleAddNote = () => setNotes(prev => [
    ...prev,
    { id: Date.now().toString(), title: 'New Clay', x: 150, y: 150, width: 150, color: 'yellow', type: 'normal' }
  ]);
  const handleContext = (id, x, y) => {
    setContextMenu({ visible: true, x, y, noteId: id });
    setEditingId(null);
  };
  const handleEditStart = id => setEditingId(id);
  const closeContext = () => setContextMenu({ visible: false, x: 0, y: 0, noteId: null });

  // —————— 초기화 버튼: 모든 노트와 로그 삭제 ——————
  const handleResetAll = () => {
    setNotes([]);
    setConnections([]);
    clearLogs();
  };

  return (
    <div>
      {/* 초기화 버튼 (노트 + 로그 모두 삭제) */}
      <button
        onClick={handleResetAll}
        style={{
          margin: '1rem',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          background: '#e74c3c',
          color: '#fff',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        Reset All
      </button>

      {/* 새 노트 추가 */}
      <button onClick={handleAddNote} style={{ margin: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
        New Clay
      </button>

      {/* Canvas */}
      <Canvas
        notes={notes}
        connections={connections}
        onCombine={handleCombine}
        onMove={handleMove}
        onResize={handleResize}
        onContext={handleContext}
        onColorChange={handleColorChange}
        editingId={editingId}
        onEditStart={handleEditStart}
        onEditComplete={handleEditComplete}
      />

      {/* ContextMenuRenderer */}
      <ContextMenuRenderer
        contextMenu={contextMenu}
        notes={notes}
        handlers={{
          handleExpand,
          handleDeepExpand,
          handleDelete,
          handleColorChange,
          handleCreateDetail,
          closeContext
        }}
      />
    </div>
  );
}

export default App;
