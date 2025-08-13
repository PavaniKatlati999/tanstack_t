import React from "react";
import { scaleBand } from "@visx/scale";
import { AxisLeft } from "@visx/axis";

export default function SimpleAxisLeft() {
  const yScale = scaleBand({
    domain: ["A", "B", "C"," D", "E"], 
    range: [0, 200], 
    padding: 0.2,
  });

  return (
    <svg width={150} height={220} style={{ background: "#f9f9f9" }}>
      <AxisLeft
        scale={yScale}
        top={10}
        left={40}
        stroke="black"
        tickStroke="black"
        tickLabelProps={() => ({
          fill: "black",
          fontSize: 12,
          textAnchor: "end",
          dy: "0.33em",
        })}
      />
    </svg>
  );
}

