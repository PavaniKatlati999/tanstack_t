import React from "react";
import { Group } from "@visx/group";
import { Pie } from "@visx/shape";
import { scaleOrdinal } from "@visx/scale";
import { schemeCategory10 } from "d3-scale-chromatic";

// Original data
const data = [
  { date: new Date(2020, 0, 1), value: 10 },
  { date: new Date(2020, 0, 5), value: 18 },
  { date: new Date(2020, 0, 10), value: 25 },
  { date: new Date(2020, 0, 15), value: 40 },
  { date: new Date(2020, 0, 20), value: 60 },
  { date: new Date(2020, 0, 25), value: 55 },
  { date: new Date(2020, 0, 31), value: 70 },
  { date: new Date(2020, 1, 3), value: 80 },
  { date: new Date(2020, 1, 8), value: 65 },
  { date: new Date(2020, 1, 14), value: 90 },
  { date: new Date(2020, 1, 20), value: 100 },
  { date: new Date(2020, 1, 25), value: 85 },
  { date: new Date(2020, 1, 28), value: 95 },
  { date: new Date(2020, 2, 2), value: 110 },
  { date: new Date(2020, 2, 7), value: 105 },
  { date: new Date(2020, 2, 12), value: 120 },
  { date: new Date(2020, 2, 18), value: 130 },
  { date: new Date(2020, 2, 23), value: 125 },
  { date: new Date(2020, 2, 30), value: 140 },
  { date: new Date(2020, 3, 3), value: 150 },
  { date: new Date(2020, 3, 8), value: 135 },
  { date: new Date(2020, 3, 14), value: 160 },
  { date: new Date(2020, 3, 20), value: 155 },
  { date: new Date(2020, 3, 25), value: 170 },
  { date: new Date(2020, 3, 30), value: 180 },
  { date: new Date(2020, 4, 5), value: 190 },
  { date: new Date(2020, 4, 10), value: 200 },
  { date: new Date(2020, 4, 15), value: 210 },
  { date: new Date(2020, 4, 20), value: 205 },
  { date: new Date(2020, 4, 25), value: 220 },
  { date: new Date(2020, 4, 31), value: 225 },
  { date: new Date(2020, 5, 5), value: 230 },
  { date: new Date(2020, 5, 10), value: 240 },
  { date: new Date(2020, 5, 15), value: 245 },
  { date: new Date(2020, 5, 20), value: 250 },
  { date: new Date(2020, 5, 25), value: 255 },
  { date: new Date(2020, 5, 30), value: 260 },
];

// Aggregate by month
const monthlyData = Object.values(
  data.reduce((acc, d) => {
    const month = d.date.toLocaleString("default", { month: "short" });
    acc[month] = acc[month] || { label: month, total: 0 };
    acc[month].total += d.value;
    return acc;
  }, {} as Record<string, { label: string; total: number }>)
);

const width = 400;
const height = 400;
const radius = Math.min(width, height) / 2;

const colorScale = scaleOrdinal<string, string>({
  domain: monthlyData.map((d) => d.label),
  range: schemeCategory10,
});

export default function PieChart() {
  return (
    <svg width={width} height={height}>
      <Group top={height / 2} left={width / 2}>
        <Pie
          data={monthlyData}
          pieValue={(d) => d.total}
          outerRadius={radius}
          innerRadius={radius / 3} // donut style
          padAngle={0.02}
        >
          {(pie) =>
            pie.arcs.map((arc, i) => {
              const [centroidX, centroidY] = pie.path.centroid(arc);
              const arcPath = pie.path(arc) || "";
              const color = colorScale(arc.data.label);
              return (
                <g key={`arc-${arc.data.label}`}>
                  <path d={arcPath} fill={color} />
                  <text
                    x={centroidX}
                    y={centroidY}
                    dy=".33em"
                    fill="white"
                    fontSize={12}
                    textAnchor="middle"
                  >
                    {arc.data.label}
                  </text>
                </g>
              );
            })
          }
        </Pie>
      </Group>
    </svg>
  );
}
