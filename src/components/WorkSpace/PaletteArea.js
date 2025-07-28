import React, { useRef, useState } from 'react';
import IdeaTemplateClay from '../TemplateClay/IdeaTemplateClay';
import ElementTemplateClay from '../TemplateClay/ElementTemplateClay';
import CreateTemplateClay from '../TemplateClay/CreateTemplateClay';
import TrashZone from '../TemplateClay/TrashZone';
import { useDrag } from 'react-dnd';
import './PaletteArea.css';


function EditableClay({ item, onChange }) {
  const handleTitleChange = (e) => {
    onChange(item.id, { title: e.target.value });
  };
  const handleDescChange = (e) => {
    onChange(item.id, { description: e.target.value });
  };

  return (
    <div className="idea-clay" style={{ left: item.x, top: item.y, position: 'absolute' }}>
      <input
        className="idea-title"
        value={item.title}
        onChange={handleTitleChange}
        placeholder="Enter title"
      />
      <textarea
        className="idea-specifics"
        value={item.description}
        onChange={handleDescChange}
        placeholder="Enter description"
      />
    </div>
  );
}

function PaletteArea({ topic, setTopic, onDelete, onClearAll }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const textareaRef = useRef();

  const toggleMinimize = () => setIsMinimized((prev) => !prev);

  const handleInput = () => {
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <div className={`palette-area ${isMinimized ? 'minimized' : ''}`}>
      <button className="toggle-button" onClick={toggleMinimize}>
        {isMinimized ? '▶' : '◀'}
      </button>

      {!isMinimized && (
        <>
          <h2>💡 Topic</h2>
          <textarea
            ref={textareaRef}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your topic here..."
            className="topic-textarea"
            rows={1}
            onInput={handleInput}
          />

          <div className="palette-clay-list">
            <IdeaTemplateClay />
            <ElementTemplateClay />
            <CreateTemplateClay />

          </div>

          <div>
            <TrashZone onDelete={onDelete} />
            <button
              type="button"
              className="clear-all-button"
              onClick={onClearAll}
            >
              Clear Canvas
            </button>
          </div>

        </>
      )}
    </div>
  );
}

export default PaletteArea;
