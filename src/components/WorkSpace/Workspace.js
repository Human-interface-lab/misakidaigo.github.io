import React, { useState } from 'react';
import PaletteArea from './PaletteArea';
import CanvasArea from './CanvasArea';
import './Workspace.css';

function Workspace() {
  const [items, setItems] = useState([]);
  const [connections, setConnections] = useState([]);
  const [topic, setTopic] = useState('');

  const handleDelete = (idToDelete) => {
    setItems((prev) => prev.filter((item) => item.id !== idToDelete));
    setConnections((prev) =>
      prev.filter(
        (conn) => conn.from !== idToDelete && conn.to !== idToDelete
      )
    );
  };

  return (
    <div className="workspace">
      <PaletteArea onDelete={handleDelete} />
      <PaletteArea topic={topic} setTopic={setTopic} />
      <CanvasArea
        topic={topic}
        items={items}
        setItems={setItems}
        connections={connections}
        setConnections={setConnections}
      />
    </div>
  );
}

export default Workspace;