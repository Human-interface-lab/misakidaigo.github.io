import React from 'react';

function ConnectionLines({ items, connections }) {
  const getCenter = (item) => ({
    x: item.x + 100, // 200 / 2
    y: item.y + 50,  // 100 / 2
  });

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {connections.map(({ from, to }, index) => {
        const fromItem = items.find(i => i.id === from);
        const toItem = items.find(i => i.id === to);

        if (!fromItem || !toItem) return null;

        const { x: x1, y: y1 } = getCenter(fromItem);
        const { x: x2, y: y2 } = getCenter(toItem);

        return (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#6366f1"
            strokeWidth={2}
          />
        );
      })}
    </svg>
  );
}

export default ConnectionLines;
