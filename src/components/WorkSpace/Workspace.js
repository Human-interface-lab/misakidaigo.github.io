// src/components/Workspace/Workspace.js
import React, { useState } from 'react';
import PaletteArea from './PaletteArea';
import CanvasArea from './CanvasArea';
import ConfirmedIdeaZone from './ConfirmedIdeaZone';
import './Workspace.css';

const directions = ['Product', 'Process', 'Market', 'Resource', 'Organization'];
let logIdCounter = 0;

function Workspace({ direction }) {
  // direction별 상태를 분리해서 관리
  const [canvasStates, setCanvasStates] = useState(
    directions.reduce((acc, dir) => {
      acc[dir] = {
        items: [],
        connections: [],
        logs: []
      };
      return acc;
    }, {})
  );
  const [topic, setTopic] = useState('');
  const activeState = canvasStates[direction];

  const [coreProductIdea, setCoreProductIdea] = useState(null);

  const updateCanvasState = (field, updater) => {
    setCanvasStates(prev => ({
      ...prev,
      [direction]: {
        ...prev[direction],
        [field]: updater(prev[direction][field])
      }
    }));
  };

  const addLog = (message, relatedIds = []) => {
    const entry = { id: logIdCounter++, message, relatedIds };
    updateCanvasState('logs', logs => [...logs, entry]);
  };

  const handleDelete = idToDelete => {
    updateCanvasState('items', items => items.filter(item => item.id !== idToDelete));
    updateCanvasState('connections', conns =>
      conns.filter(conn => conn.from !== idToDelete && conn.to !== idToDelete)
    );
    updateCanvasState('logs', logs => logs.filter(log => !log.relatedIds.includes(idToDelete)));
  };

  const handleClearAll = () => {
    setCanvasStates(prev => ({
      ...prev,
      [direction]: { items: [], connections: [], logs: [] }
    }));
  };

  return (
    <div className="workspace">
      <PaletteArea
        topic={topic}
        setTopic={setTopic}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
      />

      <CanvasArea
        topic={topic}
        items={activeState.items}
        setItems={fn => updateCanvasState('items', fn)}
        connections={activeState.connections}
        setConnections={fn => updateCanvasState('connections', fn)}
        onDelete={handleDelete}
        addLog={addLog}
        direction={direction}
      />

      <ConfirmedIdeaZone
        coreProductIdea={coreProductIdea}
        setCoreProductIdea={setCoreProductIdea}
        direction={direction}
      />

    </div>
  );
}

export default Workspace;
