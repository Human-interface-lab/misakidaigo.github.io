import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import StickyNote from './StickyNote';

export default function Canvas({ notes, connections, onCombine, onMove, onContext, onResize, onColorChange, editingId, onEditStart, onEditComplete }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {connections.map((c, i) => {
            const from = notes.find(n => n.id === c.from);
            const to = notes.find(n => n.id === c.to);
            if (!from || !to) return null;
            const x1 = from.x + from.width / 2;
            const y1 = from.y + from.width / 2;
            const x2 = to.x + to.width / 2;
            const y2 = to.y + to.width / 2;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#555" strokeWidth={2} />;
          })}
        </svg>
        {notes.map(note => (
          <StickyNote
            key={note.id}
            note={note}
            onCombine={onCombine}
            onMove={onMove}
            onResize={onResize}
            onContext={onContext}
            onEditStart={onEditStart}
            editing={editingId === note.id}
            onEditComplete={onEditComplete}
            onColorChange={onColorChange}
          />
        ))}
      </div>
    </DndProvider>
  );
}