import React, { useState, useRef } from "react";
import { scaleTime, scaleLinear, scaleSqrt } from "@visx/scale";
import { Brush } from "@visx/brush";
import { extent, max } from "d3-array";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Zoom } from "@visx/zoom";
import { Circle } from "@visx/shape";

const data = [
  { date: new Date(2020, 0, 1), value: 10, size: 5 },
  { date: new Date(2020, 0, 5), value: 18, size: 10 },
  { date: new Date(2020, 0, 10), value: 25, size: 15 },
  { date: new Date(2020, 0, 15), value: 40, size: 8 },
  { date: new Date(2020, 0, 20), value: 60, size: 20 },
  { date: new Date(2020, 0, 25), value: 55, size: 12 },
  { date: new Date(2020, 0, 31), value: 70, size: 25 },
  { date: new Date(2020, 1, 3), value: 80, size: 18 },
  { date: new Date(2020, 1, 8), value: 65, size: 22 },
  { date: new Date(2020, 1, 14), value: 90, size: 30 },
  { date: new Date(2020, 1, 20), value: 100, size: 28 },
  { date: new Date(2020, 1, 25), value: 85, size: 26 },
  { date: new Date(2020, 1, 28), value: 95, size: 16 },
  { date: new Date(2020, 2, 2), value: 110, size: 24 },
  { date: new Date(2020, 2, 7), value: 105, size: 20 },
  { date: new Date(2020, 2, 12), value: 120, size: 15 },
  { date: new Date(2020, 2, 18), value: 130, size: 35 },
  { date: new Date(2020, 2, 23), value: 125, size: 25 },
  { date: new Date(2020, 2, 30), value: 140, size: 22 },
  { date: new Date(2020, 3, 3), value: 150, size: 28 },
  { date: new Date(2020, 3, 8), value: 135, size: 30 },
  { date: new Date(2020, 3, 14), value: 160, size: 20 },
  { date: new Date(2020, 3, 20), value: 155, size: 18 },
  { date: new Date(2020, 3, 25), value: 170, size: 35 },
  { date: new Date(2020, 3, 30), value: 180, size: 32 },
  { date: new Date(2020, 4, 5), value: 190, size: 25 },
  { date: new Date(2020, 4, 10), value: 200, size: 28 },
  { date: new Date(2020, 4, 15), value: 210, size: 24 },
  { date: new Date(2020, 4, 20), value: 205, size: 20 },
  { date: new Date(2020, 4, 25), value: 220, size: 26 },
  { date: new Date(2020, 4, 31), value: 225, size: 30 },
  { date: new Date(2020, 5, 5), value: 230, size: 22 },
  { date: new Date(2020, 5, 10), value: 240, size: 28 },
  { date: new Date(2020, 5, 15), value: 245, size: 26 },
  { date: new Date(2020, 5, 20), value: 250, size: 32 },
  { date: new Date(2020, 5, 25), value: 255, size: 30 },
  { date: new Date(2020, 5, 30), value: 260, size: 34 },
];

const width = 500;
const height = 300;
const margin = { top: 20, left: 50, bottom: 40, right: 20 };
const mainChartHeight = 180;
const brushChartHeight = 80;
const gap = 20;

function BubbleChart() {
  const brushRef = useRef<any>(null);
  const [filteredData, setFilteredData] = useState(data);

  return (
    <Zoom width={width} height={mainChartHeight} scaleXMin={1} scaleXMax={100}>
      {(zoom) => {
        const xScale = scaleTime({
          domain: extent(filteredData, (d) => d.date) as [Date, Date],
          range: [margin.left, width - margin.right],
        });

        const yScale = scaleLinear({
          domain: [0, max(filteredData, (d) => d.value) || 0],
          range: [mainChartHeight - margin.bottom, margin.top],
          nice: true,
        });

        const sizeScale = scaleSqrt({
          domain: [0, max(data, (d) => d.size) || 1],
          range: [3, 20], // min/max bubble size
        });

        const brushXScale = scaleTime({
          domain: extent(data, (d) => d.date) as [Date, Date],
          range: [margin.left, width - margin.right],
        });

        const brushYScale = scaleLinear({
          domain: [0, max(data, (d) => d.value) || 0],
          range: [brushChartHeight - margin.bottom, margin.top],
          nice: true,
        });

        const initialBrushPosition = {
          start: { x: brushXScale(data[1].date) },
          end: { x: brushXScale(data[5].date) },
        };

        const onBrushChange = (domain: any) => {
          if (!domain) return;
          const { x0, x1 } = domain;
          const filtered = data.filter((d) => {
            const x = d.date.getTime();
            return x >= x0 && x <= x1;
          });
          setFilteredData(filtered);
          zoom.reset();
        };

        return (
          <div style={{ marginTop: "60px" }}>
            <svg
              width={width}
              height={mainChartHeight + brushChartHeight + gap}
              style={{ border: "1px solid #ddd", userSelect: "none" }}
              onWheel={zoom.handleWheel}
              onMouseDown={zoom.dragStart}
              onMouseMove={zoom.dragMove}
              onMouseUp={zoom.dragEnd}
              onMouseLeave={() => {
                if (zoom.isDragging) zoom.dragEnd();
              }}
              onDoubleClick={zoom.reset}
            >
              {/* Main chart */}
              <Group transform={zoom.toString()} top={0}>
                {filteredData.map((d, i) => (
                  <Circle
                    key={i}
                    cx={xScale(d.date)}
                    cy={yScale(d.value)}
                    r={sizeScale(d.size)}
                    fill="rgba(70,130,180,0.7)"
                    stroke="#4682b4"
                  />
                ))}
                <AxisLeft scale={yScale} left={margin.left} numTicks={5} />
                <AxisBottom
                  scale={xScale}
                  top={mainChartHeight - margin.bottom}
                  numTicks={7}
                  tickFormat={(date) =>
                    (date as Date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
              </Group>

              {/* Brush chart */}
              <Group top={mainChartHeight + gap}>
                {data.map((d, i) => (
                  <Circle
                    key={i}
                    cx={brushXScale(d.date)}
                    cy={brushYScale(d.value)}
                    r={sizeScale(d.size) / 2}
                    fill="lightgray"
                  />
                ))}
                <AxisBottom
                  scale={brushXScale}
                  top={brushChartHeight - margin.bottom}
                  numTicks={7}
                  tickFormat={(date) =>
                    (date as Date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <Brush
                  xScale={brushXScale}
                  yScale={brushYScale}
                  width={width}
                  height={brushChartHeight}
                  margin={margin}
                  handleSize={2}
                  innerRef={brushRef}
                  brushDirection="horizontal"
                  initialBrushPosition={initialBrushPosition}
                  onChange={onBrushChange}
                />
              </Group>
            </svg>

            {/* Reset button */}
            <button
              onClick={() => {
                setFilteredData(data);
                if (brushRef.current) brushRef.current.reset();
                zoom.reset();
              }}
              style={{
                marginTop: 20,
                padding: "10px 20px",
                fontSize: "16px",
                fontWeight: "bold",
                color: "white",
                backgroundColor: "#7292ecff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease",
              }}
            >
              Reset Brush
            </button>
          </div>
        );
      }}
    </Zoom>
  );
}

export default BubbleChart;
