import React from "react";
import { AxisBottom } from "@visx/axis";
import { scaleBand } from "@visx/scale";

export default function App() {
  const data = ["A", "B", "C"," D", "E"];

  const xScale = scaleBand({
    domain: data,
    range: [0, 300], 
    padding: 0.2,
  });

  return (
    <div style={{ padding: "20px" }}>
      <h1>AxisBottom Example</h1>
      <svg width={400} height={100}>
        <g transform={`translate(50, 50)`}>
          <AxisBottom
            scale={xScale}
            stroke="black"
            tickStroke="black"
            tickLabelProps={() => ({
              fontSize: 12,
              textAnchor: "right",
              fill: "black",
            })}
          />
        </g>
      </svg>
    </div>
  );
}

// import React from "react";
// import { AxisBottom } from "@visx/axis";
// import { scaleTime } from "@visx/scale";

// export default function App() {
//   // Example dates
//   const startDate = new Date(2024, 0, 1); // Jan 1, 2024
//   const endDate = new Date(2024, 0, 10); // Jan 10, 2024

//   // Time scale
//   const xScale = scaleTime({
//     domain: [startDate, endDate],
//     range: [0, 300], // width of axis
//   });

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>AxisBottom - Time Scale</h1>
//       <svg width={400} height={100}>
//         <g transform={`translate(50, 50)`}>
//           <AxisBottom
//             scale={xScale}
//             stroke="black"
//             tickStroke="black"
//             tickFormat={(date) =>
//               date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
//             }
//             tickLabelProps={() => ({
//               fontSize: 12,
//               textAnchor: "middle",
//               fill: "black",
//             })}
//           />
//         </g>
//       </svg>
//     </div>
//   );
// }

// App.tsx or App.jsx
// import React from "react";
// import { AxisBottom } from "@visx/axis";
// import { scaleLinear } from "@visx/scale";

// export default function App() {
//   // Create a linear scale for numbers from 0 to 100
//   const xScale = scaleLinear({
//     domain: [0, 100], // input values
//     range: [0, 300],  // output pixel range
//   });

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>Linear Scale AxisBottom</h1>
//       <svg width={400} height={100}>
//         <g transform={`translate(50, 50)`}>
//           <AxisBottom
//             scale={xScale}
//             numTicks={5} // how many tick marks to show
//             stroke="black"
//             tickStroke="black"
//             tickLabelProps={() => ({
//               fontSize: 12,
//               textAnchor: "middle",
//               fill: "black",
//             })}
//           />
//         </g>
//       </svg>
//     </div>
//   );
// }


