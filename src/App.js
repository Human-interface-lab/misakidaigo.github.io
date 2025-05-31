// src/App.js
import React, { useState } from 'react';
import Canvas from './components/Canvas';
import ContextMenu from './components/ContextMenu';
import { systemMessage, getCombinePrompt, getExpandPrompt } from './prompts';
import { logConversation, logExpand, removeLogsForNote, clearLogs } from './utils/logger';

function App() {
  const [notes, setNotes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, noteId: null });
  const [editingId, setEditingId] = useState(null);

  // 두 노트를 합치고, 메타인지 질문 1개만 생성
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

      // 새 노트 위치: 두 원의 중간 지점
      const centerX = (noteA.x + noteB.x) / 2;
      const centerY = (noteA.y + noteB.y) / 2;
      const newNoteId = `combined_${Date.now()}`;

      // 원본 노트 및 로그 삭제
      setNotes(prev => prev.filter(n => n.id !== fromId && n.id !== toId));
      removeLogsForNote(fromId);
      removeLogsForNote(toId);

      // 새 노트 추가
      setNotes(prev => [
        ...prev,
        {
          id:    newNoteId,
          title: related[0] || '',
          x:     centerX,
          y:     centerY,
          width: 150,
          color: 'yellow'
        }
      ]);

      // 합치기 로그 기록
      logConversation(newNoteId, 'combine', prompt, related[0] || '');

      // 기존 connections 재매핑: from/to가 제거된 노트였으면 새 노트 ID로 대체
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

  // 두 노트를 확장하고, 로그는 action/response/timestamp만 저장
  const handleExpand = (id) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const dist = 200;
    const angles = [ -Math.PI / 4, Math.PI / 4 ];
    const timestamp = Date.now();

    const newNotes = angles.map((angle, idx) => {
      const isPromptNote = idx === 0;
      return {
        id:    `${id}_initExpand${idx}_${timestamp}`,
        title: isPromptNote ? '프롬프트 생성' : note.title,
        x:     note.x + Math.cos(angle) * dist,
        y:     note.y + Math.sin(angle) * dist,
        width: 150,
        color: isPromptNote ? 'lightblue' : 'lightgreen'
      };
    });

    // 새 노트 추가 및 연결
    setNotes(prev => [...prev, ...newNotes]);
    setConnections(prev => [
      ...prev,
      ...newNotes.map(n => ({ from: id, to: n.id }))
    ]);

    // expand 로그 기록: action/response/timestamp만 저장
    newNotes.forEach((n, idx) => {
      if (idx === 0) {
        logExpand(`초기 프롬프트 생성: ${n.title}`);
      } else {
        logExpand(`확장 노트 제목: ${n.title}`);
      }
    });

    setContextMenu({ visible: false, x: 0, y: 0, noteId: null });
  };

  // 나머지 핸들러들
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
    { id: Date.now().toString(), title: 'New Clay', x: 150, y: 150, width: 150, color: 'yellow' }
  ]);
  const handleContext = (id, x, y) => { setContextMenu({ visible: true, x, y, noteId: id }); setEditingId(null); };
  const handleEditStart = id => setEditingId(id);
  const closeContext = () => setContextMenu({ visible: false, x: 0, y: 0, noteId: null });

  return (
    <div>
      {/* 로그 전체 삭제 버튼 */}
      <button
        onClick={() => { clearLogs(); alert('로그가 모두 삭제되었습니다.'); }}
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
        로그 삭제
      </button>

      {/* Controls */}
      <button onClick={handleAddNote} style={{ margin: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
        New Clay
      </button>

      {/* Canvas */}
      <Canvas
        notes={notes}
        connections={connections}
        onCombine={handleCombine}
        onExpand={handleExpand}
        onMove={handleMove}
        onResize={handleResize}
        onContext={handleContext}
        onColorChange={handleColorChange}
        editingId={editingId}
        onEditStart={handleEditStart}
        onEditComplete={handleEditComplete}
      />

      {/* Context Menu */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onCombine={() => handleCombine(contextMenu.noteId, /* 두 번째 ID 선택 필요 */)}
          onExpand={() => handleExpand(contextMenu.noteId)}
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
