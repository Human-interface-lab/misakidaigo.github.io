// src/components/LogPanel.jsx
import React from 'react';

export default function LogPanel({ logs, onClearLog, onClearAll }) {
  return (
    <div style={{
      position:    'absolute',
      top:         0,
      right:       0,
      width:       '300px',
      height:      '100vh',
      overflowY:   'auto',
      background:  '#f9f9f9',
      borderLeft:  '1px solid #ccc',
      padding:     '1rem',
      boxSizing:   'border-box',
      zIndex:      1000
    }}>
      <h3 style={{ marginTop: 0 }}>Action Logs</h3>
      <button
        onClick={onClearAll}
        style={{ marginBottom: '1rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
      >
        Clear All
      </button>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {logs.map((log, idx) => (
          <li key={idx} style={{ marginBottom: '0.75rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>
            <div>
              <strong>{log.action.toUpperCase()}</strong> &nbsp;
              <span>noteId: {log.noteId}</span>
              {log.parentId && <span> (parent: {log.parentId})</span>}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>
              {new Date(log.timestamp).toLocaleString()}
            </div>
            <button
              onClick={() => onClearLog(log.noteId)}
              style={{ marginTop: '0.25rem', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Remove
            </button>
          </li>
        ))}
        {logs.length === 0 && <li>No logs</li>}
      </ul>
    </div>
  );
}