// src/components/Workspace/Workspace.js
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
      {/* PaletteArea는 한 번만 렌더링 */}
      <PaletteArea topic={topic} setTopic={setTopic} />

      {/* CanvasArea에만 삭제 핸들러를 넘겨줍니다 */}
      <CanvasArea
        topic={topic}
        items={items}
        setItems={setItems}
        connections={connections}
        setConnections={setConnections}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default Workspace;
