import React from 'react';
import { useDrag } from 'react-dnd';
import './TemplateClay.css';

function CreateTemplateClay() {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'CREATE_TEMPLATE',
    item: {type: 'CREATE_TEMPLATE' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={dragRef}
      className="template-clay create"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      Create Clay
    </div>
  );
}

export default CreateTemplateClay;
