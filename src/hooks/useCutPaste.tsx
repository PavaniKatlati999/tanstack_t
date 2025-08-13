// hooks/useCutPaste.ts
import { useState, useCallback, useEffect } from "react";
import { getRangeBounds } from "../utils/tableUtils";

export function useCutPaste(data, setData, selectedRange, selectedCell) {
  const [cutBuffer, setCutBuffer] = useState(null);

  const handleCut = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key.toLowerCase() === "x" && selectedRange.start && selectedRange.end) {
      e.preventDefault();
      const { minRow, maxRow, minCol, maxCol } = getRangeBounds(selectedRange.start, selectedRange.end);
      const cutData = [];

      for (let r = minRow; r <= maxRow; r++) {
        const row = [];
        for (let c = minCol; c <= maxCol; c++) {
          row.push(data[r][`col${c}`]);
        }
        cutData.push(row);
      }

      setCutBuffer({ data: cutData, numRows: maxRow - minRow + 1, numCols: maxCol - minCol + 1 });

      setData(prev => {
        const updated = [...prev];
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            updated[r] = { ...updated[r], [`col${c}`]: "" };
          }
        }
        return updated;
      });
    }
  }, [data, selectedRange, setData]);

  const handlePaste = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key.toLowerCase() === "v" && cutBuffer) {
      e.preventDefault();
      const { data: buffer, numRows, numCols } = cutBuffer;
      let startRow = selectedCell?.row ?? 0;
      let startCol = selectedCell?.col ?? 0;

      if (selectedRange.start && selectedRange.end) {
        const { minRow, minCol } = getRangeBounds(selectedRange.start, selectedRange.end);
        startRow = minRow;
        startCol = minCol;
      }

      setData(prev => {
        const updated = [...prev];
        for (let r = 0; r < numRows; r++) {
          for (let c = 0; c < numCols; c++) {
            const destRow = startRow + r;
            const destCol = startCol + c;
            if (updated[destRow]?.[`col${destCol}`] !== undefined) {
              updated[destRow] = { ...updated[destRow], [`col${destCol}`]: buffer[r][c] };
            }
          }
        }
        return updated;
      });
      setCutBuffer(null);
    }
  }, [cutBuffer, selectedCell, selectedRange, setData]);

  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => {
      handleCut(e);
      handlePaste(e);
    };
    window.addEventListener("keydown", keydownHandler);
    return () => window.removeEventListener("keydown", keydownHandler);
  }, [handleCut, handlePaste]);

  return { cutBuffer };
}
