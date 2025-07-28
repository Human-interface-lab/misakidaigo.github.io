// src/App.js
import React, { useState } from 'react';
import Workspace from './components/WorkSpace/Workspace';

const directions = ['Product', 'Process', 'Market', 'Resource', 'Organization'];

function App() {
  const [currentDirection, setCurrentDirection] = useState('Product');

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        {directions.map(dir => (
          <button
            key={dir}
            onClick={() => setCurrentDirection(dir)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: dir === currentDirection ? '#4CAF50' : '#eee',
              color: dir === currentDirection ? 'white' : 'black',
              border: '1px solid #ccc',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {dir}
          </button>
        ))}
      </div>

      <Workspace direction={currentDirection} />
    </div>
  );
}

export default App;
