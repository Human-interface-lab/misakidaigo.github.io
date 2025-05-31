// src/components/StickyNote.jsx
import React, { useRef } from 'react';
import CursorComponent from './CursorComponent';

export default function StickyNote({
  note,
  onCombine,
  onMove,
  onResize,
  onContext,
  onEditStart,
  editing,
  onEditComplete
}) {
  const refContent = useRef(null);

  // 최소/최대 크기 (픽셀 단위)
  const MIN_SIZE = 150;
  const MAX_SIZE = 300;

  // 입력이 끝났을 때 제목(텍스트)을 부모에 전달
  const handleBlur = () => {
    if (refContent.current) {
      onEditComplete(note.id, refContent.current.innerText);
    }
  };

  // 텍스트가 변경될 때마다 크기를 측정하여 노트 크기 조정
  const handleInput = () => {
    const el = refContent.current;
    if (!el) return;

    // scrollWidth/scrollHeight로 컨텐츠 전체 크기를 측정
    const scrollW = el.scrollWidth;
    const scrollH = el.scrollHeight;
    // 텍스트가 차지하는 부분 + 여유 공간(패딩 등)으로 계산
    const measuredSize = Math.max(scrollW, scrollH) + 20;

    // 최소/최대 사이즈 범위 안으로 조정
    const newSize = Math.min(Math.max(measuredSize, MIN_SIZE), MAX_SIZE);

    // 기존 노트 중심을 유지하도록 좌표 재계산
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
          textAlign: 'center',
          width: '100%',
          height: '100%',
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          wordWrap: 'break-word',
          padding: '5px',
          boxSizing: 'border-box'
        }}
      >
        {note.title}
      </div>
    </CursorComponent>
  );
}
