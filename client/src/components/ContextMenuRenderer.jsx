// src/components/ContextMenuRenderer.jsx
import React, { useEffect, useRef } from 'react';
import ContextMenu from './ContextMenu';

/**
 * ContextMenuRenderer
 *
 * props:
 *   - contextMenu: { visible, x, y, noteId }
 *   - notes: 전체 노트 배열
 *   - handlers: {
 *       handleExpand,
 *       handleDeepExpand,
 *       handleDelete,
 *       handleColorChange,
 *       handleCreateDetail,
 *       handleGetExamples,
 *       closeContext
 *     }
 */
export default function ContextMenuRenderer({ contextMenu, notes, handlers }) {
  const { visible, x, y, noteId } = contextMenu;
  const {
    handleExpand,
    handleDeepExpand,
    handleDelete,
    handleGetExamples,
    handleColorChange,
    handleCreateDetail,
    closeContext
  } = handlers;
  const menuRef = useRef(null);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        visible &&
        menuRef.current &&
        !event.target.closest('.context-menu')
      ) {
        closeContext();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible, closeContext]);

  if (!visible) return null;
  const note = notes.find(n => n.id === noteId);
  if (!note) return null;

  let menuOptions = [];

  // 1) New Clay로 생성된 일반 노트(type: 'normal')
  if (note.type === 'normal') {
    menuOptions = [
      { label: 'Extend',        onClick: () => handleExpand(noteId) },
      { label: 'Color Change',  onClick: () => handleColorChange(noteId, 'red') },
      { label: 'Delete',        onClick: () => handleDelete(noteId) }
    ];
  }
  // 2) “Design Prompt” 노트(type: 'promptNote'): 5가지 항목 + 삭제
  else if (note.type === 'promptNote') {
    menuOptions = [
      { label: 'Persona',   onClick: () => handleCreateDetail(noteId, 'Persona') },
      { label: 'Tone',      onClick: () => handleCreateDetail(noteId, 'Tone') },
      { label: 'Audience',  onClick: () => handleCreateDetail(noteId, 'Audience') },
      { label: 'Example',   onClick: () => handleCreateDetail(noteId, 'Example') },
      { label: 'Format',    onClick: () => handleCreateDetail(noteId, 'Format') },
      { label: 'Delete',    onClick: () => handleDelete(noteId) }
    ];
  }
  // 3) “확장 복사” 노트(type: 'expandCopy')
  else if (note.type === 'expandCopy') {
    menuOptions = [
      { label: 'Deep Expand',     onClick: () => handleDeepExpand(noteId) },
      { label: 'Color Change',    onClick: () => handleColorChange(noteId, 'orange') },
      { label: 'Delete',          onClick: () => handleDelete(noteId) }
    ];
  }
  // 4) “심화 질문” 노트(type: 'deepNote'): Deep Expand + Sample Answers + Color Change + Delete
  else if (note.type === 'deepNote') {
    menuOptions = [
      { label: 'Deep Expand',     onClick: () => handleDeepExpand(noteId) },
      { label: 'Sample Answers',  onClick: () => handleGetExamples(noteId) },
      { label: 'Color Change',    onClick: () => handleColorChange(noteId, 'orange') },
      { label: 'Delete',          onClick: () => handleDelete(noteId) }
    ];
  }
  // 5) “세부 정보” 노트(type: 'detailNote') 또는 “예시 답변” 노트(type: 'answerNote'): 삭제 및 색 변경
  else if (note.type === 'detailNote' || note.type === 'answerNote') {
    menuOptions = [
      { label: 'Color Change',  onClick: () => handleColorChange(noteId, 'lightgray') },
      { label: 'Delete',        onClick: () => handleDelete(noteId) }
    ];
  }

  return (
    <ContextMenu
      ref={menuRef}
      x={x}
      y={y}
      menuOptions={menuOptions}
      onClose={closeContext}
    />
  );
}
