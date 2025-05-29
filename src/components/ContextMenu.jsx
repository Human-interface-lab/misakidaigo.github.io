// src/components/ContextMenu.jsx
import React from 'react';

export default function ContextMenu({ x, y, onEdit, onDelete, onColorChange, onClose }) {
  const style = { position: 'absolute', top: y, left: x, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 1000 };
  const itemStyle = { padding: '0.5rem 1rem', cursor: 'pointer' };

  return (
    <div style={style} onMouseLeave={onClose}>
      <div style={itemStyle} onClick={() => { onEdit(); onClose(); }}>편집</div>
      <div style={itemStyle} onClick={() => { onDelete(); onClose(); }}>삭제</div>
      <hr />
      <div style={itemStyle} onClick={() => { onColorChange('red'); onClose(); }}>빨강</div>
      <div style={itemStyle} onClick={() => { onColorChange('yellow'); onClose(); }}>노랑</div>
      <div style={itemStyle} onClick={() => { onColorChange('blue'); onClose(); }}>파랑</div>
    </div>
  );
}