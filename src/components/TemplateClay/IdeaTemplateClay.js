import React from 'react';
import { useDrag } from 'react-dnd';
import './TemplateClay.css';

function IdeaTemplateClay() {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'IDEA_TEMPLATE',
    item: {type: 'IDEA_TEMPLATE'},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={dragRef}
      className="template-clay idea"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      Idea Clay
    </div>
  );
}

export default IdeaTemplateClay;
