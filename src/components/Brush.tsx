import React, { useRef, useState, useMemo } from "react";
import { scaleTime, scaleLinear } from "@visx/scale";
import { AreaClosed } from "@visx/shape";
import { Brush } from "@visx/brush";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { extent, max } from "d3-array";
import { curveMonotoneX } from "@visx/curve";

const data = Array.from({   length: 100 }, (_, i) => ({
  date: new Date(2023, 0, i),
  value: Math.sin(i / 10) * 50 + 100
}));

export default function SimpleBrushChart({ width = 800, height = 400 }) {
  const brushRef = useRef(null);
  const [filteredData, setFilteredData] = useState(data);

  const getDate = (d) => d.date;
  const getValue = (d) => d.value;

  const topChartHeight = 200;
  const bottomChartHeight = 80;
  const brushMargin = { top: 0, bottom: 20, left: 50, right: 20 };

  const xScaleTop = useMemo(
    () =>
      scaleTime({
        domain: extent(filteredData, getDate),
        range: [0, width - 50 - 20]
      }),
    [filteredData, width]
  );

  const yScaleTop = useMemo(
    () =>
      scaleLinear({
        domain: [0, max(filteredData, getValue)],
        range: [topChartHeight, 0],
        nice: true
      }),
    [filteredData]
  );

  // Brush chart scales
  const xScaleBrush = useMemo(
    () =>
      scaleTime({
        domain: extent(data, getDate),
        range: [0, width - brushMargin.left - brushMargin.right]
      }),
    [width]
  );

  const yScaleBrush = useMemo(
    () =>
      scaleLinear({
        domain: [0, max(data, getValue)],
        range: [bottomChartHeight, 0],
        nice: true
      }),
    []
  );

  const onBrushChange = (domain) => {
    if (!domain) return;
    const { x0, x1 } = domain;
    const newData = data.filter(
      (d) => getDate(d) >= x0 && getDate(d) <= x1
    );
    setFilteredData(newData);
  };

  return (
    <svg width={width} height={height}>
      <Group left={50} top={20}>
        <AreaClosed
          data={filteredData}
          x={(d) => xScaleTop(getDate(d))}
          y={(d) => yScaleTop(getValue(d))}
          yScale={yScaleTop}
          stroke="steelblue"
          fill="lightblue"
          curve={curveMonotoneX}
        />
        <AxisLeft
          scale={yScaleTop}
          stroke="#000"
          tickStroke="#000"
          tickLabelProps={() => ({
            fill: "#000",
            fontSize: 10,
            textAnchor: "end",
            dy: "0.33em"
          })}
        />
        <AxisBottom
          top={topChartHeight}
          scale={xScaleTop}
          stroke="#000"
          tickStroke="#000"
          tickLabelProps={() => ({
            fill: "#000",
            fontSize: 10,
            textAnchor: "middle"
          })}
        />
      </Group>

      <Group
        left={brushMargin.left}
        top={topChartHeight + 60}
      >
        <AreaClosed
          data={data}
          x={(d) => xScaleBrush(getDate(d))}
          y={(d) => yScaleBrush(getValue(d))}
          yScale={yScaleBrush}
          stroke="steelblue"
          fill="lightgray"
          curve={curveMonotoneX}
        />
        <AxisLeft
          scale={yScaleBrush}
          stroke="#000"
          tickStroke="#000"
          tickLabelProps={() => ({
            fill: "#000",
            fontSize: 10,
            textAnchor: "end",
            dy: "0.33em"
          })}
        />
        <AxisBottom
          top={bottomChartHeight}
          scale={xScaleBrush}
          stroke="#000"
          tickStroke="#000"
          tickLabelProps={() => ({
            fill: "#000",
            fontSize: 10,
            textAnchor: "middle"
          })}
        />

        <Brush
          xScale={xScaleBrush}
          yScale={yScaleBrush}
          width={width - brushMargin.left - brushMargin.right}
          height={bottomChartHeight}
          margin={brushMargin}
          brushDirection="horizontal"
          onChange={onBrushChange}
          innerRef={brushRef}
        />
      </Group>
    </svg>
  );
}
