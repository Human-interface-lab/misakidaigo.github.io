// src/components/Workspace/LogPanel.js
import React, { useState } from 'react';
import './LogPanel.css';

export default function LogPanel({ logs }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`log-panel ${collapsed ? 'collapsed' : ''}`}>      
      <div className="log-panel-header">
        <h3>Event Logs</h3>
        <button
          type="button"
          className="toggle-button"
          onClick={() => setCollapsed(prev => !prev)}
        >
          {collapsed ? '▶' : '▼'}
        </button>
      </div>
      {!collapsed && (
        <ul>
          {logs.map(log => (
            <li key={log.id}>{log.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
