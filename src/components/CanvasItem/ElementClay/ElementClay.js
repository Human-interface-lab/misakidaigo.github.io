// src/components/IdeaClay.js
import React, { useState } from 'react';
import './ElementClay.css';

function ElementClay({ title, style }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="element-clay">
  <div className="title">{title}</div>
</div>
  );
}

export default ElementClay;  // ✅ 이 줄 반드시 포함!
