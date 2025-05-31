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
 *       closeContext
 *     }
 */
export default function ContextMenuRenderer({ contextMenu, notes, handlers }) {
  const { visible, x, y, noteId } = contextMenu;
  const { handleExpand, handleDeepExpand, handleDelete, handleColorChange, closeContext } = handlers;
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

  // --- 메뉴 옵션 설정 ---
  let menuOptions = [];

  // 1) New Clay로 생성된 일반 노트(type: 'normal')
  if (note.type === 'normal') {
    menuOptions = [
      { label: '확장', onClick: () => handleExpand(noteId) },
      { label: '색 변경', onClick: () => handleColorChange(noteId, 'red') }
    ];
  }
  // 2) “프롬프트 생성” 노트(type: 'promptNote'): 1,2,3,4,5 메뉴
  else if (note.type === 'promptNote') {
    menuOptions = [
      { label: '1', onClick: () => alert('선택: 1') },
      { label: '2', onClick: () => alert('선택: 2') },
      { label: '3', onClick: () => alert('선택: 3') },
      { label: '4', onClick: () => alert('선택: 4') },
      { label: '5', onClick: () => alert('선택: 5') }
    ];
  }
  // 3) “확장 복사” 노트(type: 'expandCopy') 또는 “심화 질문” 노트(type: 'deepNote')
  else if (note.type === 'expandCopy' || note.type === 'deepNote') {
    menuOptions = [
      { label: '심화 질문 생성', onClick: () => handleDeepExpand(noteId) },
      { label: '삭제',         onClick: () => handleDelete(noteId) },
      { label: '색 변경',      onClick: () => handleColorChange(noteId, 'orange') }
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
