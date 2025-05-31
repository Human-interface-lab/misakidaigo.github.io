// src/components/StickyNote.jsx
import React, { useRef } from 'react';
import CursorComponent from './CursorComponent';

export default function StickyNote({ note, onCombine, onMove, onResize, onContext, onEditStart, editing, onEditComplete }) {
  const refContent = useRef(null);
  // Blur (blur 이벤트로 제목 갱신)
  const MIN_SIZE = 150; // 최소 크기 설정
  const MAX_SIZE = 300; // 최대 크기 설정

  const handleBlur = () => onEditComplete(note.id, refContent.current.innerText);
  // Input (내용 변경 시 크기 자동 조정)
  const handleInput = () => {
    const el = refContent.current;
    if (!el) return;
    const scrollW = el.scrollWidth;
    const scrollH = el.scrollHeight;
    const measuredSize = Math.max(scrollW, scrollH) + 20;
    const newSize = Math.min(Math.max(measuredSize, MIN_SIZE), MAX_SIZE);
    const centerX = note.x + note.width / 2;
    const centerY = note.y + note.width / 2;
    const newX = centerX - newSize / 2;
    const newY = centerY - newSize / 2;
    onResize(note.id, newX, newY, newSize);
  };


  return (
    <CursorComponent
      note={note}
      onCombine={onCombine}
      onMove={onMove}
      onResize={onResize}
      onContext={onContext}
      onEditStart={onEditStart}
      editing={editing}
    >
      <div
        ref={refContent}
        contentEditable={editing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onInput={handleInput}
        style={{
          outline: editing ? '1px solid #999' : 'none',
          textAlign: 'center',alignItems:'center',
          overflow: 'hidden',
        }}
      >
        {note.title}
      </div>
    </CursorComponent>
  );
    <CursorComponent
      note={note}
      onCombine={onCombine}
      onMove={onMove}
      onResize={onResize}
      onContext={onContext}
      onEditStart={onEditStart}
      editing={editing}
    >
      <div
        ref={refContent}
        contentEditable={editing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onInput={handleInput}
        style={{ outline: editing ? '1px solid #999' : 'none', textAlign: 'center', width: '100%', height: '100%', overflow: 'auto' }}
      >
        {note.title}</div>
    </CursorComponent>
}