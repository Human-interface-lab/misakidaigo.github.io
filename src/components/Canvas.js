// src/components/Canvas.jsx
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import StickyNote from './StickyNote';

export default function Canvas({ notes, onCombine, onMove, onContext, onResize, onColorChange, editingId, onEditStart, onEditComplete }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
        {notes.map(note => (
          <StickyNote
            key={note.id}
            note={note}
            onCombine={onCombine}
            onMove={onMove}
            onContext={onContext}
            onEditStart={onEditStart}
            editing={editingId === note.id}
            onEditComplete={onEditComplete}
            onResize={onResize}
            onColorChange={onColorChange}
          />
        ))}
      </div>
    </DndProvider>
  );
}
