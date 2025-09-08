import React, { useState, useRef, useEffect } from "react";
import { scaleTime, scaleLinear } from "@visx/scale";
import { Brush } from "@visx/brush";
import { extent, max } from "d3-array";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Zoom } from "@visx/zoom";
import { AreaClosed } from "@visx/shape";

const width = 500;
const margin = { top: 20, left: 50, bottom: 40, right: 20 };
const mainChartHeight = 180;
const brushChartHeight = 80;
const gap = 20;

function AreaChartBrush() {
  const brushRef = useRef<any>(null);
  const [data, setData] = useState<{ date: Date; value: number }[]>([]);
  const [filteredData, setFilteredData] = useState<
    { date: Date; value: number }[]
  >([]);

  useEffect(() => {
    async function fetchStockData() {
      const API_KEY = "L6LCX8834AR7VBGG"
      const res = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AAPL&apikey=${API_KEY}`
      );
      const json = await res.json();
      const series = json["Time Series (Daily)"];

      if (!series) return;

      const formatted = Object.entries(series).map(([date, values]: any) => ({
        date: new Date(date),
        value: parseFloat(values["3. low"]),
      }));

      const sorted = formatted.sort((a, b) => a.date.getTime() - b.date.getTime());
      setData(sorted);
      setFilteredData(sorted);
    }

    fetchStockData();
  }, []);

  return (
    <div style={{ marginTop: "60px" }}>
      {data.length === 0 ? (
        <p>Loading stock data...</p>
      ) : (
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
              start: { x: brushXScale(data[0].date) },
              end: { x: brushXScale(data[Math.min(30, data.length - 1)].date) },
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
              <>
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
                  <Group transform={zoom.toString()} top={0}>
                    <AreaClosed
                      data={filteredData}
                      x={(d) => xScale(d.date)}
                      y={(d) => yScale(d.value)}
                      yScale={yScale}
                      fill="steelblue"
                      stroke="steelblue"
                      strokeWidth={2}
                    />
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

                      
                  <Group top={mainChartHeight + gap}>
                    <AreaClosed
                      data={data}
                      x={(d) => brushXScale(d.date)}
                      y={(d) => brushYScale(d.value)}
                      yScale={brushYScale}
                      fill="lightgray"
                      stroke="gray"
                      strokeWidth={2}
                    />
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

                {/* Reset Button */}
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
              </>
            );
          }}
        </Zoom>
      )}
    </div>
  );
}

export default AreaChartBrush;
