// src/components/WorkSpace/ConfirmedIdeaZone.jsx
import React from 'react';
import { useDrop } from 'react-dnd';
import './ConfirmedIdeaZone.css';

export default function ConfirmedIdeaZone({ coreProductIdea, setCoreProductIdea, direction }) {
  const [{ isOver }, dropRef] = useDrop({
  accept: 'CANVAS_ITEM',
  drop: (item) => {
    if (item.type !== 'idea') return; // ✅ 아이디어만 확정 가능
    const { title, description } = item;
    if (title) {
      setCoreProductIdea({ title, description: description || '' });
    }
  },
  collect: (monitor) => ({
    isOver: monitor.isOver(),
  }),
});

  return (
  <div
    ref={dropRef}
    className={`confirmed-idea-zone ${isOver ? 'hover' : ''}`}
  >
    {coreProductIdea ? (
      <div className="core-idea">
        <strong>{coreProductIdea.title}</strong>
      </div>
    ) : (
      <p className="placeholder">Drag your Product idea here to confirm</p>
    )}
  </div>
);
}
