// src/components/CanvasItem/IdeaClay.js
import React, { useState } from 'react';
import './IdeaClay.css';

export default function IdeaClay({ title, description }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="idea-clay"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="idea-title">{title}</div>
      {isHovered && description && (
        <div className="idea-specifics">{description}</div>
      )}
    </div>
  );
}