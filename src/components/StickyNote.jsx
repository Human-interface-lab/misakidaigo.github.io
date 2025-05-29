// src/components/StickyNote.jsx
import React, { useRef } from 'react';
import CursorComponent from './CursorComponent';

export default function StickyNote({ note, onCombine, onMove, onResize, onContext, onEditStart, editing, onEditComplete }) {
  const refContent = useRef(null);
  const handleBlur = () => onEditComplete(note.id, refContent.current.innerText);
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
        style={{ outline: editing ? '1px solid #999' : 'none', textAlign: 'center' }}
      >{note.title}</div>
    </CursorComponent>
  );
}
