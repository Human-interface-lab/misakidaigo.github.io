import React, { forwardRef } from 'react';

const ContextMenu = forwardRef(function ContextMenu(
  { x, y, menuOptions = [], onClose },
  ref // forwardRef로 전달된 ref
) {
  return (
    <div
      ref={ref}                   // 이 div에야말로 실제로 menuRef.current가 가리켜야 합니다.
      className="context-menu"
      style={{
        position: 'absolute',
        top: y,
        left: x,
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        zIndex: 1000,
        minWidth: '120px'
      }}
    >
      {menuOptions.map((opt, idx) => (
        <div
          key={idx}
          onClick={() => {
            opt.onClick();
            onClose();
          }}
          style={{
            padding: '0.5rem',
            cursor: 'pointer',
            borderBottom: idx < menuOptions.length - 1 ? '1px solid #eee' : 'none'
          }}
        >
          {opt.label}
        </div>
      ))}
    </div>
  );
});

export default ContextMenu;