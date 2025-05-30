// src/App.js
import React, { useState } from 'react';
import Canvas from './components/Canvas';
import ContextMenu from './components/ContextMenu';
import { systemMessage, getCombinePrompt, getExpandPrompt,} from './prompts';

function App() {
  const [notes, setNotes] = useState([
    { id: 'a', title: 'Idea A', x: 50,  y: 50,  width: 150, color: 'yellow' },
    { id: 'b', title: 'Idea B', x: 200, y: 100, width: 150, color: 'yellow' },
  ]);
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
      const related = match ? JSON.parse(match[0]).slice(0,1) : [];

      // 새 노트 위치: 두 원의 중간 지점
      const centerX = (noteA.x + noteB.x) / 2;
      const centerY = (noteA.y + noteB.y) / 2;
      const newNoteId = `combined_${Date.now()}`;

      // 기존 노트 제거, 새 노트 추가
      setNotes(prev => {
        const filtered = prev.filter(n => n.id !== fromId && n.id !== toId);
        return [
          ...filtered,
          {
            id:    newNoteId,
            title: related[0] || '',
            x:     centerX,
            y:     centerY,
            width: 150,
            color: 'yellow'
          }
        ];
      });

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

  // 나머지 핸들러들
  const handleExpand = async (id) => {
    const note = notes.find(n => n.id === id);
    if (!note || !process.env.REACT_APP_OPENAI_API_KEY) return;
    try {
      const prompt = getExpandPrompt(note.title);
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
          temperature: 0.7,
          max_tokens: 100
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const match = data.choices[0].message.content.trim().match(/\[.*?\]/s);
      const related = match ? JSON.parse(match[0]).slice(0,2) : [];

      const dist = 200;
      const angleStep = Math.PI / (related.length + 1);
      const newNotes = related.map((text, idx) => {
        const angle = angleStep * (idx + 1);
        return {
          id:    `${id}_exp${idx}`,
          title: text,
          x:     note.x + Math.cos(angle) * dist,
          y:     note.y + Math.sin(angle) * dist,
          width: 150,
          color: 'pink'
        };
      });

      setNotes(prev => [...prev, ...newNotes]);
      setConnections(prev => [
        ...prev,
        ...newNotes.map(n => ({ from: id, to: n.id }))
      ]);
    } catch (err) {
      console.error(err);
      alert(`AI 확장 오류: ${err.message}`);
    } finally {
      setContextMenu({ visible: false, x: 0, y: 0, noteId: null });
    }
  };

  const handleMove =      (id, x, y)       => setNotes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  const handleResize =    (id, x, y, size) => setNotes(prev => prev.map(n => n.id === id ? { ...n, x, y, width: size } : n));
  const handleColorChange = (id, color)    => setNotes(prev => prev.map(n => n.id === id ? { ...n, color } : n));
  const handleEditComplete = (id, title) => {
    if (title.trim() === '') {
      setNotes(prev => prev.filter(n => n.id !== id));
    } else {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, title } : n));
    }
    setEditingId(null);
  };
  const handleDelete   = id => setNotes(prev => prev.filter(n => n.id !== id));
  const handleAddNote  = () => setNotes(prev => [
    ...prev,
    { id: Date.now().toString(), title: 'New Clay', x: 150, y: 150, width: 150, color: 'yellow' }
  ]);
  const handleContext  = (id, x, y) => { setContextMenu({ visible: true, x, y, noteId: id }); setEditingId(null); };
  const handleEditStart= id => setEditingId(id);
  const closeContext   = () => setContextMenu({ visible: false, x: 0, y: 0, noteId: null });

 
  
  return (
    <div>
      
      {/* Controls */}
      <button onClick={handleAddNote} style={{ margin:'1rem', padding:'0.5rem 1rem', cursor:'pointer' }}>
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