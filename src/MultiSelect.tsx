import React, { useState, useRef } from "react";

type RowData = { [key: string]: string };

const createInitialData = () =>
  Array.from({ length: 10 }, (_, row) => ({
    rowNumber: (row + 1).toString(),
    ...Object.fromEntries(
      Array.from({ length: 5 }, (_, col) => [`col${col + 1}`, `R${row + 1}C${col + 1}`])
    ),
  }));

export default function ExcelPreview() {
  const [data, setData] = useState<RowData[]>(createInitialData());
  const [selectedRange, setSelectedRange] = useState<{
    start: { row: number; col: number } | null;
    end: { row: number; col: number } | null;
  }>({ start: null, end: null });

  const isDraggingRef = useRef(false);

  // Get range bounds
  const getRangeBounds = (start: { row: number; col: number }, end: { row: number; col: number }) => {
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    return { minRow, maxRow, minCol, maxCol };
  };

  // Check if a cell is in selected range
  const isCellInRange = (row: number, col: number) => {
    if (!selectedRange.start || !selectedRange.end) return false;
    const { minRow, maxRow, minCol, maxCol } = getRangeBounds(selectedRange.start, selectedRange.end);
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  };

  // Drag fill logic (single & multi-cell)
  const startCellDrag = (e: React.MouseEvent, value: string) => {
    e.preventDefault();
    if (!selectedRange.start || !selectedRange.end) return;

    const range = getRangeBounds(selectedRange.start, selectedRange.end);
    isDraggingRef.current = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const target = (moveEvent.target as HTMLElement).closest("td[data-row][data-col]");
      if (!target) return;

      const targetRow = parseInt(target.getAttribute("data-row") || "0", 10);

      setData((prev) => {
        const updated = [...prev];

        // SINGLE CELL
        if (range.minRow === range.maxRow && range.minCol === range.maxCol) {
          for (let r = range.minRow; r <= targetRow; r++) {
            updated[r] = { ...updated[r], [`col${range.minCol}`]: value };
          }
        } 
        // MULTI CELL
        else {
          const block: string[][] = [];
          for (let r = range.minRow; r <= range.maxRow; r++) {
            const row: string[] = [];
            for (let c = range.minCol; c <= range.maxCol; c++) {
              row.push(prev[r][`col${c}`]);
            }
            block.push(row);
          }

          let blockRow = 0;
          for (let r = range.maxRow + 1; r <= targetRow; r++) {
            const newRow = { ...updated[r] };
            for (let c = range.minCol; c <= range.maxCol; c++) {
              newRow[`col${c}`] = block[blockRow % block.length][c - range.minCol];
            }
            updated[r] = newRow;
            blockRow++;
          }
        }

        return updated;
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Mouse down to select range
  const handleCellMouseDown = (row: number, col: number) => {
    setSelectedRange({ start: { row, col }, end: { row, col } });

    const handleMouseMove = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("td[data-row][data-col]");
      if (!target) return;
      const targetRow = parseInt(target.getAttribute("data-row") || "0", 10);
      const targetCol = parseInt(target.getAttribute("data-col") || "0", 10);
      setSelectedRange((prev) => prev.start ? { start: prev.start, end: { row: targetRow, col: targetCol } } : prev);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <table border={1} style={{ borderCollapse: "collapse", cursor: "default" }}>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {Object.keys(row).map((key, colIndex) => {
              if (key === "rowNumber") return <td key={key}>{row[key]}</td>;
              const isSelected = isCellInRange(rowIndex, colIndex);
              const isBottomRight =
                selectedRange.end?.row === rowIndex && selectedRange.end?.col === colIndex;
              return (
                <td
                  key={key}
                  data-row={rowIndex}
                  data-col={colIndex}
                  onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                  style={{
                    padding: "5px",
                    minWidth: "80px",
                    position: "relative",
                    background: isSelected ? "#cce5ff" : "white",
                  }}
                >
                  {row[key]}
                  {isBottomRight && (
                    <div
                      onMouseDown={(e) => startCellDrag(e, row[key])}
                      style={{
                        width: "8px",
                        height: "8px",
                        background: "blue",
                        position: "absolute",
                        bottom: "0",
                        right: "0",
                        cursor: "crosshair",
                      }}
                    />
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
