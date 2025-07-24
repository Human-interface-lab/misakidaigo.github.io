// src/components/WorkSpace/TrashZone.js
import React from 'react';
import { useDrop } from 'react-dnd';
import './TrashZone.css';

function TrashZone({ onDelete }) {
  const [{ isOver }, dropRef] = useDrop({
    accept: 'CANVAS_ITEM',        // CanvasItem이 사용하는 드래그 타입
    drop: (item, monitor) => {
      onDelete(item.id);           // 드롭된 아이템의 id로 삭제 호출
    },
    collect: monitor => ({
      isOver: monitor.isOver(),   // 마우스 오버 상태
    }),
  });

  return (
    <div
      ref={dropRef}
      className={`trash-zone ${isOver ? 'hover' : ''}`}
    >
      🗑️ Trash
    </div>
  );
}

export default TrashZone;
