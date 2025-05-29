// src/App.js
import React, { useState } from 'react';
import Canvas from './components/Canvas';
import ContextMenu from './components/ContextMenu';

function App() {
  const [notes, setNotes] = useState([
    { id: 'a', title: 'Idea A', x: 50, y: 50, width: 150, color: 'yellow' },
    { id: 'b', title: 'Idea B', x: 200, y: 100, width: 150, color: 'yellow' },
  ]);
  const [connections, setConnections] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, noteId: null });
  const [editingId, setEditingId] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [aiError, setAiError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Combine two notes and get exactly two related words
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
      const prompt = `Provide a JSON array of 2 words related to both "${noteA.title}" and "${noteB.title}". Respond with only the JSON array without any extra text.`;
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
          temperature: 0.3,
          max_tokens: 50
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const content = data.choices[0].message.content.trim();
      let related = [];
      const match = content.match(/\[.*?\]/s);
      if (match) {
        related = JSON.parse(match[0]).slice(0, 2);
      } else {
        throw new Error('AI 응답에 JSON 배열이 없습니다.');
      }
      const centerX = (noteA.x + noteB.x) / 2;
      const centerY = (noteA.y + noteB.y) / 2;
      setNotes(prev => {
        const filtered = prev.filter(n => n.id !== fromId && n.id !== toId);
        const newNotes = related.map((word, idx) => ({
          id: `${Date.now()}_${idx}`,
          title: word,
          x: centerX + idx * 20,
          y: centerY + idx * 20,
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
    if (title.trim() === '') setNotes(prev => prev.filter(n => n.id !== id));
    else setNotes(prev => prev.map(n => n.id === id ? { ...n, title } : n));
    setEditingId(null);
  };
  const handleDelete = id => setNotes(prev => prev.filter(n => n.id !== id));
  const handleAddNote = () =>
    setNotes(prev => [...prev, { id: Date.now().toString(), title: 'New Clay', x: 150, y: 150, width: 150, color: 'yellow' }]);
  const handleContext = (id, x, y) => {
    setContextMenu({ visible: true, x, y, noteId: id });
    setEditingId(null);
  };
  const handleEditStart = id => setEditingId(id);
  const closeContext = () => setContextMenu({ visible: false, x: 0, y: 0, noteId: null });

  const handleExpand = async (id) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    if (!process.env.REACT_APP_OPENAI_API_KEY) { alert('.env 설정 필요'); return; }
    setAiLoading(true);
    try {
      const prompt = `Provide a JSON array of 2 single-sentence ideas elaborating on the concept "${note.title}". Respond with only the JSON array without extra text.`;
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${process.env.REACT_APP_OPENAI_API_KEY}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [ { role:'system', content:'You are a helpful assistant.' },{ role:'user', content:prompt } ], temperature:0.5, max_tokens:100 })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const match = data.choices[0].message.content.trim().match(/\[.*?\]/s);
      const related = match ? JSON.parse(match[0]).slice(0,2) : [];
      const newNotes = related.map((text, idx) => {
        const angle = (Math.PI/4) + idx*(Math.PI/2);
        const dist = 200;
        return { id:`${id}_exp${idx}`, title:text, x: note.x+Math.cos(angle)*dist, y: note.y+Math.sin(angle)*dist, width:150, color:'yellow' };
      });
      setNotes(prev => [...prev, ...newNotes]);
      setConnections(prev => [...prev, ...newNotes.map(n=>({ from:id, to:n.id }))]);
    } catch(err) { console.error(err); alert(`AI 확장 오류: ${err.message}`); }
    finally { setAiLoading(false); setContextMenu({ visible:false, x:0, y:0, noteId:null }); }
  };

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
        method: 'POST', headers: { 'Content-Type':'application/json', Authorization:`Bearer ${process.env.REACT_APP_OPENAI_API_KEY}` },
        body: JSON.stringify({ model:'gpt-4o-mini', messages:[{role:'system',content:'You are a helpful assistant.'},{role:'user',content:aiPrompt}],temperature:0.7,max_tokens:150 })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json(); const reply = data.choices[0].message.content.trim() || '';
      setAiReply(reply);
    } catch(err) { console.error(err); setAiError(`AI 응답 중 오류가 발생했습니다: ${err.message}`); }
    finally { setAiLoading(false); }
  };

  return (
    <div>
      {/* AI Q&A Panel */}
      <div style={{ padding:'1rem', borderBottom:'1px solid #ccc' }}>
        <h2>AI Q&A</h2>
        <input type="text" value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} placeholder="질문을 입력하세요" style={{ width:'60%', padding:'0.5rem' }} />
        <button onClick={handleAICall} disabled={aiLoading} style={{ marginLeft:'1rem', padding:'0.5rem 1rem', cursor:'pointer' }}>{aiLoading ? '...' : '전송'}</button>
        {aiError ? <div style={{ marginTop:'0.5rem', color:'red' }}><strong>오류:</strong> {aiError}</div> : <div style={{ marginTop:'0.5rem' }}><strong>응답:</strong> {aiReply}</div>}
      </div>
      <button onClick={handleAddNote} style={{ margin:'1rem', padding:'0.5rem 1rem', cursor:'pointer' }}>New Clay</button>
      <Canvas notes={notes} connections={connections} onCombine={handleCombine} onMove={handleMove} onResize={handleResize} onContext={handleContext} onColorChange={handleColorChange} editingId={editingId} onEditStart={handleEditStart} onEditComplete={handleEditComplete} />
      {contextMenu.visible && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onEdit={()=>setEditingId(contextMenu.noteId)} onDelete={()=>handleDelete(contextMenu.noteId)} onColorChange={color=>handleColorChange(contextMenu.noteId,color)} onExpand={()=>handleExpand(contextMenu.noteId)} onClose={closeContext} />
      )}
    </div>
  );
}

export default App;