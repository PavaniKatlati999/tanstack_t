import React, { useState } from 'react';
import { delaunay } from '@visx/delaunay';
import { localPoint } from '@visx/event';

const WIDTH = 600;
const HEIGHT = 400;

// Generate random points once (outside component)
const points = Array(100)
  .fill(0)
  .map(() => ({
    x: Math.random() * WIDTH,
    y: Math.random() * HEIGHT,
    id: Math.random().toString(36).slice(2),
  }));

export default function SimpleDelaunay() {
  const [hoveredId, setHoveredId] = useState(null);

  const delaunayDiagram = delaunay({
    data: points,
    x: d => d.x,
    y: d => d.y,
  });

  const triangles = Array.from(delaunayDiagram.trianglePolygons());

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      style={{ backgroundColor: 'black' }}
      onMouseMove={event => {
        const point = localPoint(event);
        if (!point) return;
        const closest = delaunayDiagram.find(point.x, point.y);
        setHoveredId(points[closest].id);
      }}
      onMouseLeave={() => setHoveredId(null)}
    >
      {triangles.map((triangle, i) => (
        <polygon
          key={i}
          points={triangle.map(p => p.join(',')).join(' ')}
          fill="rgba(128, 0, 128, 0.3)"
          stroke="white"
          strokeWidth={1}
        />
      ))}
      {points.map(({ x, y, id }) => (
        <circle
          key={id}
          cx={x}
          cy={y}
          r={hoveredId === id ? 5 : 2}
          fill={hoveredId === id ? 'purple' : 'white'}
          opacity={0.8}
        />
      ))}
    </svg>
  );
}
