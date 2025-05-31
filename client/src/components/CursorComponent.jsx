// src/components/CursorComponent.jsx
import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ItemTypes } from './StickyNoteTypes';

export default function CursorComponent({ note, onCombine, onMove, onResize, onContext, onEditStart, editing, children }) {
  const wrapperRef = useRef(null);
  const [cursor, setCursor] = useState(editing ? 'text' : 'grab');
  const [resizing, setResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ size: note.width });
  const [startCenter, setStartCenter] = useState({ x: note.x + note.width / 2, y: note.y + note.width / 2 });
  const EDGE = 8;

  const [{ isDragging }, dragRef] = useDrag({
    type: ItemTypes.NOTE,
    item: { id: note.id, x: note.x, y: note.y },
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (item && delta) onMove(item.id, item.x + delta.x, item.y + delta.y);
    },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });

  const [, dropRef] = useDrop({
    accept: ItemTypes.NOTE,
    canDrop: d => d.id !== note.id,
    drop: d => onCombine(d.id, note.id),
  });

  const updateCursor = e => {
    if (resizing) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;
    let dir = null;
    if (x >= w - EDGE && y >= h - EDGE) { dir = 'se'; setCursor('se-resize'); }
    else if (x >= w - EDGE) { dir = 'e'; setCursor('e-resize'); }
    else if (y >= h - EDGE) { dir = 's'; setCursor('s-resize'); }
    else { dir = null; setCursor(editing ? 'text' : 'grab'); }
    setResizeDir(dir);
  };

  const handleMouseDown = e => {
    if (!resizeDir) return;
    e.stopPropagation(); e.preventDefault();
    setResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ size: note.width });
    setStartCenter({ x: note.x + note.width / 2, y: note.y + note.width / 2 });
    setCursor(resizeDir + '-resize');

    const handleDocumentMouseMove = ev => {
      const dx = ev.clientX - startPos.x;
      const dy = ev.clientY - startPos.y;
      let delta = 0;
      if (resizeDir === 'se') delta = Math.max(dx, dy);
      else if (resizeDir === 'e') delta = dx;
      else if (resizeDir === 's') delta = dy;
      const newSize = Math.max(startSize.size + delta, 50);
      const newX = startCenter.x - newSize / 2;
      const newY = startCenter.y - newSize / 2;
      onResize(note.id, newX, newY, newSize);
    };

    const handleDocumentMouseUp = ev => {
      setResizing(false);
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
      updateCursor(ev);
    };
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
  };

  const handleContext = e => { e.preventDefault(); onContext(note.id, e.clientX, e.clientY); };
  const handleDoubleClick = e => { e.stopPropagation(); onEditStart(note.id); };

  const style = {
    position: 'absolute', top: note.y, left: note.x,
    width: note.width, height: note.width,
    background: note.color,
    padding: '0.5rem',
    borderRadius: '40%',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    boxShadow: '2px 2px 6px rgba(0,0,0,0.2)', cursor,
    opacity: isDragging ? 0.5 : 1, userSelect: editing ? 'text' : 'none',
  };

  const setRefs = node => { dragRef(node); dropRef(node); wrapperRef.current = node; };

  return (
    <div
      ref={setRefs}
      style={style}
      onMouseDown={handleMouseDown}
      onMouseMove={updateCursor}
      onContextMenu={handleContext}
      onDoubleClick={handleDoubleClick}
    >{children}</div>
  );
}