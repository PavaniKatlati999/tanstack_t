import React, { useState, useMemo, useRef } from 'react';
import { scaleTime, scaleLinear } from '@visx/scale';
import { Brush } from '@visx/brush';
import { extent, max } from 'd3-array';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Zoom } from '@visx/zoom';

const data = [
  { date: new Date(2020, 0, 1), value: 10 },
  { date: new Date(2020, 0, 2), value: 15 },
  { date: new Date(2020, 0, 3), value: 8 },
  { date: new Date(2020, 0, 4), value: 20 },
  { date: new Date(2020, 0, 5), value: 18 },
  { date: new Date(2020, 0, 6), value: 25 },
  { date: new Date(2020, 0, 7), value: 22 },
];

const getDate = (d: typeof data[0]) => d.date;
const getValue = (d: typeof data[0]) => d.value;

const width = 500;
const height = 300;
const margin = { top: 20, left: 50, bottom: 40, right: 20 };

const mainChartHeight = 180;
const brushChartHeight = 80;
const gap = 20;

function ChartBrush() {
  const brushRef = useRef<any>(null);
  const [filteredData, setFilteredData] = useState(data);

  return (
    <Zoom
      width={width}
      height={mainChartHeight}
      scaleXMin={1}
      scaleXMax={100}
      
    >
      {(zoom) => {
        const xScale = scaleTime({
          domain: extent(filteredData, getDate) as [Date, Date],
          range: [margin.left, width - margin.right],
        });

        const yScale = scaleLinear({
          domain: [0, max(filteredData, getValue) || 0],
          range: [mainChartHeight - margin.bottom, margin.top],
          nice: true,
        });

        const xRangeZoomed = [
          zoom.transformMatrix.translateX + margin.left * zoom.transformMatrix.scaleX,
          zoom.transformMatrix.translateX + (width - margin.right) * zoom.transformMatrix.scaleX,
        ];

        const xScaleZoomed = scaleTime({
          domain: xScale.domain(),
          range: xRangeZoomed,
        });

        const linePath = filteredData
          .map((d, i) => {
            const x = xScaleZoomed(getDate(d));
            const y = yScale(getValue(d));
            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
          })
          .join(' ');

        const brushXScale = scaleTime({
          domain: extent(data, getDate) as [Date, Date],
          range: [margin.left, width - margin.right],
        });

        const brushYScale = scaleLinear({
          domain: [0, max(data, getValue) || 0],
          range: [brushChartHeight - margin.bottom, margin.top],
          nice: true,
        });

        const brushLinePath = data
          .map((d, i) => {
            const x = brushXScale(d.date);
            const y = brushYScale(d.value);
            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
          })
          .join(' ');

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
          <div>
            <svg
              width={width}
              height={mainChartHeight + brushChartHeight + gap}
              style={{ border: '1px solid #ddd', userSelect: 'none' }}
              onWheel={zoom.handleWheel}
              onMouseDown={zoom.dragStart}
              onMouseMove={zoom.dragMove}
              onMouseUp={zoom.dragEnd}
              onMouseLeave={() => {
                if (zoom.isDragging) zoom.dragEnd();
              }}
              onDoubleClick={zoom.reset}
            >
              <Group top={0}>
                <path d={linePath} fill="none" stroke="steelblue" strokeWidth={2} />
                <AxisLeft
                  scale={yScale}
                  left={margin.left}
                  top={0}
                  tickFormat={(d) => `${d}`}
                  numTicks={5}
                />
                <AxisBottom
                  scale={xScaleZoomed}
                  top={mainChartHeight - margin.bottom}
                  left={0}
                  numTicks={7}
                  tickFormat={(date) =>
                    (date as Date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
              </Group>

              <Group top={mainChartHeight + gap}>
                <path d={brushLinePath} fill="none" stroke="lightgray" strokeWidth={2} />
                <AxisLeft scale={brushYScale} left={margin.left} top={0} hideTicks tickFormat={() => ''} />
                <AxisBottom
                  scale={brushXScale}
                  top={brushChartHeight - margin.bottom}
                  left={0}
                  numTicks={7}
                  tickFormat={(date) =>
                    (date as Date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
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
                  selectedBoxStyle={{
                    fill: 'rgba(0, 0, 255, 0.3)',
                    stroke: 'blue',
                  }}
                  resizeTriggerAreas={['left', 'right']}
                  useWindowMoveEvents={true}
                />
              </Group>
            </svg>
            <button
              onClick={() => {
                setFilteredData(data);
                if (brushRef.current) brushRef.current.reset();
                zoom.reset();
              }}
              style={{ position:'relative', alignItems:"center", top: 100, left:-300, right:20 }}
            >
              Reset Brush
            </button>
          </div>
        );
      }}
    </Zoom>
  );
}

export default ChartBrush;
