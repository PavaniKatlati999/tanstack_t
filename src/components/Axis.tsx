import React from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { scaleLinear, scaleBand  } from "@visx/scale";

const data = [
  { label: "A", value: 40 },
  { label: "B", value: 80 },
  { label: "C", value: 55 },
  { label: "D", value: 20 }
];

const ExampleAxis = () => {
  const width = 400;
  const height = 300;
  const margin = { top: 40, right: 20, bottom: 60, left: 40 };

  const xScale = scaleBand({
    domain: data.map(d => d.label),
    range: [margin.left, width - margin.right],
    padding: 0.2
  });

  const yScale = scaleLinear({
    domain: [0, Math.max(...data.map(d => d.value))],
    range: [height - margin.bottom, margin.top]
  });

  return (
    <svg width={width} height={height} style={{ background: "#f9f9f9" }}>
      {data.map(d => (
        <rect
          key={d.label}
          x={xScale(d.label)}
          y={yScale(d.value)}
          width={xScale.bandwidth()}
          height={height - margin.bottom - yScale(d.value)}
          fill="steelblue"
        />
      ))}

      <AxisBottom
        top={height - margin.bottom}
        scale={xScale}
        stroke="#000"
        tickStroke="#000"
        tickLabelProps={() => ({
          fill: "#000",
          fontSize: 12,
          textAnchor: "middle"
        })}
      />

      <AxisLeft
        left={margin.left}
        scale={yScale}
        stroke="#000"
        tickStroke="#000"
        tickLabelProps={() => ({
          fill: "#000",
          fontSize: 12,
          textAnchor: "end",
          dy: "0.33em"
        })}
      />
    </svg>
  );
};

export default ExampleAxis;


// import React from "react";
// import { AxisBottom, AxisLeft } from "@visx/axis";
// import { scaleLinear } from "@visx/scale";

// const data = [
//   { x: 1, y: 40 },
//   { x: 2, y: 80 },
//   { x: 3, y: 55 },
//   { x: 4, y: 20 }
// ];

// const ExampleAxisLinear = () => {
//   const width = 400;
//   const height = 300;
//   const margin = { top: 40, right: 20, bottom: 60, left: 40 };

//   // X-axis: linear
//   const xScale = scaleLinear({
//     domain: [Math.min(...data.map(d => d.x)), Math.max(...data.map(d => d.x))],
//     range: [margin.left, width - margin.right]
//   });

//   // Y-axis: linear
//   const yScale = scaleLinear({
//     domain: [0, Math.max(...data.map(d => d.y))],
//     range: [height - margin.bottom, margin.top]
//   });

//   return (
//     <svg width={width} height={height} style={{ background: "#f9f9f9" }}>
//       {/* Draw points */}
//       {data.map((d, i) => (
//         <circle
//           key={i}
//           cx={xScale(d.x)}
//           cy={yScale(d.y)}
//           r={5}
//           fill="steelblue"
//         />
//       ))}

//       {/* Bottom axis */}
//       <AxisBottom
//         top={height - margin.bottom}
//         scale={xScale}
//         stroke="#000"
//         tickStroke="#000"
//         tickLabelProps={() => ({
//           fill: "#000",
//           fontSize: 12,
//           textAnchor: "middle"
//         })}
//       />

//       {/* Left axis */}
//       <AxisLeft
//         left={margin.left}
//         scale={yScale}
//         stroke="#000"
//         tickStroke="#000"
//         tickLabelProps={() => ({
//           fill: "#000",
//           fontSize: 12,
//           textAnchor: "end",
//           dy: "0.33em"
//         })}
//       />
//     </svg>
//   );
// };

// export default ExampleAxisLinear;


// import React from "react";
// import { AxisBottom, AxisLeft } from "@visx/axis";
// import { scaleLinear, scaleTime } from "@visx/scale";

// const data = [
//   { date: new Date(2023, 0, 1), value: 40 },
//   { date: new Date(2023, 1, 1), value: 80 },
//   { date: new Date(2023, 2, 1), value: 55 },
// //   { date: new Date(2023, 3, 1), value: 20 },
// //   { date: new Date(2023, 4, 1), value: 65 }
// ];

// const ExampleAxisTime = () => {
//   const width = 500;
//   const height = 300;
//   const margin = { top: 40, right: 20, bottom: 60, left: 50 };

//   const xMin = Math.min(...data.map(d => d.date.getTime()));
//   const xMax = Math.max(...data.map(d => d.date.getTime()));
//   const xScale = scaleTime({
//     domain: [new Date(xMin), new Date(xMax)],
//     range: [margin.left, width - margin.right]
//   });

//   const yScale = scaleLinear({
//     domain: [0, Math.max(...data.map(d => d.value))],
//     range: [height - margin.bottom, margin.top]
//   });

//   return (
//     <svg width={width} height={height} style={{ background: "#f9f9f9" }}>
//       {data.map((d, i) => (
//         <circle
//           key={i}
//           cx={xScale(d.date)}
//           cy={yScale(d.value)}
//           r={5}
//           fill="steelblue"
//         />
//       ))}

//       {/* Bottom axis - Time */}
//       <AxisBottom
//         top={height - margin.bottom}
//         scale={xScale}
//         stroke="#000"
//         tickStroke="#000"
//         tickFormat={(date) =>
//           date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
//         }
//         tickLabelProps={() => ({
//           fill: "#000",
//           fontSize: 12,
//           textAnchor: "middle"
//         })}
//       />

//       {/* Left axis - Values */}
//       <AxisLeft
//         left={margin.left}
//         scale={yScale}
//         stroke="#000"
//         tickStroke="#000"
//         tickLabelProps={() => ({
//           fill: "#000",
//           fontSize: 12,
//           textAnchor: "end",
//           dy: "0.33em"
//         })}
//       />
//     </svg>
//   );
// };

// export default ExampleAxisTime;
