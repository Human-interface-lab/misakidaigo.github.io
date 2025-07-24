// src/components/CreateClay.js
import React, { useState } from 'react';
import './CreateClay.css';

function CreateClay({ title, onChange, style }) {
  const [text, setText] = useState(title || '');

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    if (onChange) {
      onChange(newText);
    }
  };

  return (
    <div className="create-clay" style={style}>
      <textarea
        className="create-clay-input"
        value={text}
        onChange={handleChange}
        placeholder="Type your idea here..."
      />
    </div>
  );
}

export default CreateClay;
