// src/components/CanvasItem/CanvasItem.js
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import IdeaClay from './IdeaClay/IdeaClay';
import ElementClay from './ElementClay/ElementClay';
import CreateClay from './CreateClay/CreateClay';
import './CanvasItem.css';

export default function CanvasItem({ item, onMove, onCombine, onEdit, onDecompose }) {
  const ref = useRef(null);

  // 전체 블록을 드래그하여 이동
  const [{ isDragging }, dragRef] = useDrag({
    type: 'CANVAS_ITEM',
    item: () => ({ id: item.id, type: item.type }),
    end: (dragged, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset) return;
      const parentRect = ref.current.parentElement.getBoundingClientRect();
      const newX = offset.x - parentRect.left;
      const newY = offset.y - parentRect.top;
      onMove(item.id, newX, newY);
    },
    collect: (m) => ({ isDragging: m.isDragging() }),
  });

  // 결합 처리
  const [, dropRef] = useDrop({
    accept: 'CANVAS_ITEM',
    drop: (dragged) => {
      if (dragged.id !== item.id) onCombine(dragged, item);
    },
  });

  // 두 훅을 루트 ref에 연결
  dragRef(dropRef(ref));

  const style = {
    position: 'absolute',
    left: item.x,
    top: item.y,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
  };

  return (
    <div ref={ref} className="canvas-item" style={style}>
      {/* 분해 핸들: 아이디어클레이에만 표시, 클릭 시 분해 */}
      {item.type === 'idea' && (
        <div className="decompose-handle" onClick={() => onDecompose(item)}>⤵️</div>
      )}

      {item.type === 'idea' ? (
        <IdeaClay title={item.title} description={item.description} />
      ) : item.type === 'element' ? (
        <ElementClay title={item.title} />
      ) : (
        <CreateClay title={item.title} onChange={(text) => onEdit(item.id, text)} />
      )}
    </div>
  );
}
