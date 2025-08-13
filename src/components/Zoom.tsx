import React from "react";
import { Zoom } from "@visx/zoom";

const width = 1000;
const height = 400;
const points = Array.from({ length: 200 }, (_, i) => ({
  x: Math.random() * width,
  y: Math.random() * height,
  r: 5 + Math.random() * 10,
}));

export default function SimpleZoom() {
  return (
    <Zoom<SVGSVGElement>
      width={width}
      height={height}
      scaleXMin={0.5}
      scaleXMax={4}
      scaleYMin={0.5}
      scaleYMax={4}
    >
      {(zoom) => (
        <>
          <div
            style={{
              position: "relative",
              userSelect: "none",
              marginTop: "20px",
            }}
          >
            <svg
              width={width}
              height={height}
              style={{
                border: "1px solid black",
                cursor: zoom.isDragging ? "grabbing" : "grab",
                touchAction: "none",
              }}
              ref={zoom.containerRef}
              onWheel={zoom.handleWheel}
              onMouseDown={zoom.dragStart}
              onMouseMove={zoom.dragMove}
              onMouseUp={zoom.dragEnd}
              onMouseLeave={() => {
                if (zoom.isDragging) zoom.dragEnd();
              }}
              onDoubleClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const point = {
                  x: event.clientX - rect.left,
                  y: event.clientY - rect.top,
                };
                zoom.scale({ scaleX: 1.2, scaleY: 1.2, point });
              }}
            >
              <g transform={zoom.toString()}>
                {points.map(({ x, y, r }, i) => (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={r}
                    fill="steelblue"
                    fillOpacity={0.7}
                  />
                ))}
              </g>
            </svg>
          </div>
          <div
            style={{
              position: "absolute",
              top: 30,
              right: 10,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <button onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}>
              Zoom In +
            </button>
            <button onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}>
              Zoom Out -
            </button>
            <button onClick={zoom.reset}>Reset</button>
          </div>
        </>
      )}
    </Zoom>
  );
}
