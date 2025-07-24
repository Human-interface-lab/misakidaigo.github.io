import React from 'react';
import { useDrag } from 'react-dnd';
import './TemplateClay.css';

function ElementTemplateClay() {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'ELEMENT_TEMPLATE',
    item: {type: 'ELEMENT_TEMPLATE' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={dragRef}
      className="template-clay element"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      Element Clay
    </div>
  );
}

export default ElementTemplateClay;
