import React, { useEffect, useState, useRef } from "react";
import { Group } from "@visx/group";
import { Pie } from "@visx/shape";
import { scaleOrdinal } from "@visx/scale";
import { schemeCategory10 } from "d3-scale-chromatic";

const width = 400;
const height = 400;
const radius = Math.min(width, height) / 2;

export default function PieChart() {
  const [chartData, setChartData] = useState<
    { label: string; value: number }[]
  >([]);
  const [zoomRect, setZoomRect] = useState({
    x: -radius,
    y: -radius,
    w: radius * 2,
    h: radius * 2,
  });

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=MSFT&apikey=demo"
      );
      const json = await res.json();
      const series = json["Monthly Time Series"];

      if (!series) return;

      const formatted = Object.entries(series)
        .slice(0, 6)
        .map(([date, values]: any) => ({
          label: date.slice(0, 7),
          value: parseFloat(values["4. close"]),
        }));

      setChartData(formatted.reverse());
    }
    fetchData();
  }, []);

  const colorScale = scaleOrdinal<string, string>({
    domain: chartData.map((d) => d.label),
    range: schemeCategory10,
  });

  const handleMouseDown = (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragStart.current = { x: e.clientX, y: e.clientY };

    setZoomRect((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div style={{ textAlign: "center" }}>
      <svg
        width={width}
        height={height + 120}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <clipPath id="zoomClip">
            <rect
              x={zoomRect.x}
              y={zoomRect.y}
              width={zoomRect.w}
              height={zoomRect.h}
            />
          </clipPath>
        </defs>

        <Group top={height / 2} left={width / 2} clipPath="url(#zoomClip)">
          <Pie
            data={chartData}
            pieValue={(d) => d.value}
            outerRadius={radius}
            innerRadius={radius / 3}
            padAngle={0.02}
          >
            {(pie) =>
              pie.arcs.map((arc) => {
                const arcPath = pie.path(arc) || "";
                const color = colorScale(arc.data.label);
                return <path key={arc.data.label} d={arcPath} fill={color} />;
              })
            }
          </Pie>
        </Group>

        <Group top={height + 40} left={width / 2}>
          <Pie
            data={chartData}
            pieValue={(d) => d.value}
            outerRadius={radius / 3}
            innerRadius={radius / 6}
            padAngle={0.02}
          >
            {(pie) =>
              pie.arcs.map((arc) => {
                const arcPath = pie.path(arc) || "";
                const color = colorScale(arc.data.label);
                return (
                  <path
                    key={`mini-${arc.data.label}`}
                    d={arcPath}
                    fill={color}
                  />
                );
              })
            }
          </Pie>

          <rect
            x={-radius / 3}
            y={-radius / 3}
            width={radius / 1.5}
            height={radius / 1.5}
            stroke="red"
            fill="transparent"
            strokeWidth={2}
            style={{ cursor: "move" }}
            onMouseDown={handleMouseDown}
          />
        </Group>
      </svg>
    </div>
  );
}
