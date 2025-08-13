import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import "./excel-table.css";

type RowData = { [key: string]: string };

const getColumnLetter = (index: number): string => {
  let letter = "";
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
};

const ExcelTable: React.FC = () => {
  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFillHandle, setShowFillHandle] = useState(true);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [selectedRange, setSelectedRange] = useState<{
    start: { row: number; col: number } | null;
    end: { row: number; col: number } | null;
  }>({ start: null, end: null });
  const [draggedCells, setDraggedCells] = useState<
    { row: number; col: number }[]
  >([]);
  // const [cutBuffer, setCutBuffer] = useState<{
  //   data: string[][];
  //   numRows: number;
  //   numCols: number;
  // } | null>(null);
  const [cutBuffer, setCutBuffer] = useState<
  { data: string[][]; numRows: number; numCols: number; origin?: { row: number; col: number } } | null
>(null);

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [visibleTooltips, setVisibleTooltips] = useState<
    Record<string, boolean>
  >({});

  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const isDraggingRef = useRef(false);

  const columnHelper = createColumnHelper<RowData>();

  const getRangeBounds = (
    start: { row: number; col: number },
    end: { row: number; col: number }
  ) => {
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    return { minRow, maxRow, minCol, maxCol };
  };

  const isCellInRange = (row: number, col: number) => {
    if (!selectedRange.start || !selectedRange.end) return false;
    const { minRow, maxRow, minCol, maxCol } = getRangeBounds(
      selectedRange.start,
      selectedRange.end
    );
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex });
    setSelectedRow(null);
    setSelectedCol(null);
    const columnKey = `col${colIndex}`; // Generate column key
    const columnValues = data.map((row) => row[columnKey]); // Extract column values
    console.log(`Column ${columnKey} values:`, columnValues);
  };

  const handleHeaderClick = (colIndex: number) => {
    if (colIndex === 0) return;

    setSelectedCol(colIndex);
    setSelectedRow(null);
    setSelectedCell(null);
    setSelectedRange({ start: null, end: null });

    const columnKey = `col${colIndex}`; // Generate column key
    const columnValues = data.map((row) => row[columnKey]); // Extract column values
    console.log(` values:`, columnValues);
  };

  const handleRowHeaderClick = (rowIndex: number) => {
    setSelectedRow(rowIndex);
    setSelectedCol(null);
    setSelectedCell(null);
    setSelectedRange({ start: null, end: null });

    const rowValues = Object.values(data[rowIndex] || {}).slice(1);
    console.log(`Row ${rowIndex + 1} values:`, rowValues);
  };

  const handleCellMouseDown = (rowIndex: number, colIndex: number) => {
    setSelectedRange({
      start: { row: rowIndex, col: colIndex },
      end: { row: rowIndex, col: colIndex },
    });

    const handleMouseMove = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-row][data-col]");
      if (!target) return;

      const targetRow = parseInt(target.getAttribute("data-row") || "0", 10);
      const targetCol = parseInt(target.getAttribute("data-col") || "0", 10);

      setSelectedRange((prev) =>
        prev.start
          ? { start: prev.start, end: { row: targetRow, col: targetCol } }
          : prev
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const startCellDrag = (e: React.MouseEvent, value: string) => {
    e.preventDefault();
    if (!selectedRange.start || !selectedRange.end) return;

    const range = getRangeBounds(selectedRange.start, selectedRange.end);
    isDraggingRef.current = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const target = (moveEvent.target as HTMLElement).closest(
        "[data-row][data-col]"
      );
      if (!target) return;

      const targetRow = parseInt(target.getAttribute("data-row") || "0", 10);
      const targetCol = parseInt(target.getAttribute("data-col") || "0", 10);

      setData((prev) => {
        const updated = [...prev];

        // Extract selected block (even 1x1)
        const block: string[][] = [];
        for (let r = range.minRow; r <= range.maxRow; r++) {
          const row: string[] = [];
          for (let c = range.minCol; c <= range.maxCol; c++) {
            row.push(prev[r][`col${c}`]);
          }
          block.push(row);
        }

        const dragMinRow = Math.min(range.minRow, targetRow);
        const dragMaxRow = Math.max(range.maxRow, targetRow);
        const dragMinCol = Math.min(range.minCol, targetCol);
        const dragMaxCol = Math.max(range.maxCol, targetCol);

        const newDraggedCells: { row: number; col: number }[] = [];
        for (let r = dragMinRow; r <= dragMaxRow; r++) {
          for (let c = dragMinCol; c <= dragMaxCol; c++) {
            newDraggedCells.push({ row: r, col: c });
          }
        }
        setDraggedCells(newDraggedCells);

        let blockRow = 0;
        for (let r = dragMinRow; r <= dragMaxRow; r++) {
          let blockCol = 0;
          const newRow = { ...updated[r] };
          for (let c = dragMinCol; c <= dragMaxCol; c++) {
            newRow[`col${c}`] =
              block[blockRow % block.length][blockCol % block[0].length];
            blockCol++;
          }
          updated[r] = newRow;
          blockRow++;
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

  const handleCut = (e: KeyboardEvent) => {
    if (
      e.ctrlKey &&
      e.key.toLowerCase() === "x" &&
      selectedRange.start &&
      selectedRange.end
    ) {
      e.preventDefault();
      const { minRow, maxRow, minCol, maxCol } = getRangeBounds(
        selectedRange.start,
        selectedRange.end
      );
      const cutData: string[][] = [];
      for (let r = minRow; r <= maxRow; r++) {
        const row: string[] = [];
        for (let c = minCol; c <= maxCol; c++) {
          row.push(data[r][`col${c}`]);
        }
        cutData.push(row);
      }
     setCutBuffer({
  data: cutData,
  numRows: maxRow - minRow + 1,
  numCols: maxCol - minCol + 1,
  origin: { row: minRow, col: minCol },
});

      setData((prev) => {
        const updated = [...prev];
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            updated[r] = { ...updated[r], [`col${c}`]: "" };
          }
        }
        return updated;
      });
      setSelectedCell(null);
      setSelectedRange({
        start: { row: minRow, col: minCol },
        end: { row: minRow, col: minCol },
      });
    }
  };
const handleCopy = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
    // copy selected range or single cell
    if (selectedRange.start && selectedRange.end) {
      e.preventDefault();
      const { minRow, maxRow, minCol, maxCol } = getRangeBounds(
        selectedRange.start,
        selectedRange.end
      );
      const copied: string[][] = [];
      for (let r = minRow; r <= maxRow; r++) {
        const rowArr: string[] = [];
        for (let c = minCol; c <= maxCol; c++) {
          rowArr.push(data[r][`col${c}`] ?? "");
        }
        copied.push(rowArr);
      }
      setCutBuffer({
        data: copied,
        numRows: maxRow - minRow + 1,
        numCols: maxCol - minCol + 1,
        origin: { row: minRow, col: minCol },
      });
      // try to copy to system clipboard (tab separated)
      const text = copied.map((r) => r.join("\t")).join("\n");
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {});
    } else if (selectedCell) {
      e.preventDefault();
      const text = data[selectedCell.row][`col${selectedCell.col}`] ?? "";
      setCutBuffer({ data: [[text]], numRows: 1, numCols: 1, origin: { row: selectedCell.row, col: selectedCell.col } });
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {});
    }
  }
};

const handlePaste = async (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
    if (!(selectedCell || (selectedRange.start && selectedRange.end))) return;
    e.preventDefault();

    // Use internal cutBuffer if present, otherwise try system clipboard text
    let buffer = cutBuffer?.data ?? null;
    let numRows = cutBuffer?.numRows ?? 0;
    let numCols = cutBuffer?.numCols ?? 0;

    if (!buffer) {
      try {
        const text = await navigator.clipboard.readText();
        if (!text) return;
        const rows = text.split(/\r?\n/).map((r) => r.split(/\t/));
        buffer = rows;
        numRows = rows.length;
        numCols = rows[0]?.length ?? 1;
      } catch (err) {
        console.warn("Clipboard read failed", err);
        return;
      }
    }

    let startRow = selectedCell ? selectedCell.row : 0;
    let startCol = selectedCell ? selectedCell.col : 0;
    if (selectedRange.start && selectedRange.end) {
      const { minRow, minCol } = getRangeBounds(selectedRange.start, selectedRange.end);
      startRow = minRow;
      startCol = minCol;
    }

    setData((prev) => {
      const updated = [...prev];

      // ensure we have enough rows to paste into
      const requiredRows = startRow + numRows;
      for (let r = updated.length; r < requiredRows; r++) {
        // create an empty row with same column keys (assumes 18 columns in your table)
        const newRow: RowData = {};
        for (let c = 1; c <= 18; c++) newRow[`col${c}`] = "";
        updated.push(newRow);
      }

      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          const destRow = startRow + r;
          const destCol = startCol + c;
          if (updated[destRow] && updated[destRow][`col${destCol}`] !== undefined) {
            updated[destRow] = {
              ...updated[destRow],
              [`col${destCol}`]: buffer![r][c] ?? "",
            };
          }
        }
      }
      return updated;
    });

    // clear cutBuffer only if it was a cut (you may keep it for copy). 
    // If you want paste to clear it after cut operation, keep this:
    if (cutBuffer) setCutBuffer(null);
  }
};


useEffect(() => {
  const keydownHandler = (e: KeyboardEvent) => {
    handleCopy(e);
    handleCut(e);
    // call paste (async) but we don't await it here
    void handlePaste(e);
  };
  window.addEventListener("keydown", keydownHandler);
  return () => window.removeEventListener("keydown", keydownHandler);
}, [selectedRange, selectedCell, cutBuffer, data]);

const columns = useMemo(
    () => [
      columnHelper.accessor("rowNumber", {
        header: "",
        cell: (info) => <span>{info.row.index + 1}</span>,
      }),
      ...Array.from({ length: 18 }, (_, i) =>
        columnHelper.accessor(`col${i + 1}`, {
          header: getColumnLetter(i),
          cell: (info) => {
            const rowIndex = info.row.index;
            const colIndex = i + 1;
            const columnKey = `col${colIndex}`;
            const isEditing =
              selectedCell?.row === rowIndex && selectedCell?.col === i + 1;

            const value = info.getValue() as string;
            const isSelected = isCellInRange(rowIndex, colIndex);
            const isMainSelected =
              selectedCell &&
              selectedCell.row === rowIndex &&
              selectedCell.col === colIndex;

            // Compute selection bounds
            let showFillHandleHere = false;
            if (
              isSelected &&
              showFillHandle &&
              selectedRange.start &&
              selectedRange.end
            ) {
              const { minRow, maxRow, minCol, maxCol } = getRangeBounds(
                selectedRange.start,
                selectedRange.end
              );
              if (rowIndex === maxRow && colIndex === maxCol) {
                showFillHandleHere = true;
              }
            }

            const cellKey = `${rowIndex}-${colIndex}`;
            const showError = validationErrors[cellKey];
            const tooltipVisible = visibleTooltips[cellKey];

            let cellClass = "cell-wrapper";
            if (isMainSelected) cellClass += " selected-cell";
            else if (isSelected) cellClass += " selected-range";
            if (
              draggedCells.some(
                (cell) => cell.row === rowIndex && cell.col === colIndex
              )
            ) {
              cellClass += " dragged-cell";
            }

            const isInvalid = !!validationErrors[cellKey];

            return (
              <div
                className={`${cellClass} ${isInvalid ? "invalid-cell" : ""}`}
                onClick={() => {
                  handleCellClick(rowIndex, colIndex);
                  if (isInvalid) {
                    setVisibleTooltips((prev) => ({
                      ...prev,
                      [cellKey]: !prev[cellKey],
                    }));
                  }
                }}
                onDoubleClick={() => {
                  setSelectedCell({ row: rowIndex, col: colIndex });
                  const input = inputRefs.current.get(
                    `${rowIndex}-${colIndex}`
                  );
                  if (input) input.select();
                }}
onMouseDown={(e) => {
    e.preventDefault(); // prevent text selection interfering
    handleCellMouseDown(rowIndex, colIndex);
  }}              >
                {isEditing ? (
                  <input
                    autoFocus
                    ref={(el) => {
                      if (el) inputRefs.current.set(cellKey, el);
                      else inputRefs.current.delete(cellKey);
                    }}
                    type="text"
                    value={value}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const hasInvalidChars = /[^a-zA-Z\s]/.test(newValue);

                      setData((prev) => {
                        const updated = [...prev];
                        updated[rowIndex] = {
                          ...updated[rowIndex],
                          [columnKey]: newValue,
                        };
                        return updated;
                      });

                      setValidationErrors((prev) => {
                        const updated = { ...prev };
                        if (hasInvalidChars) {
                          updated[cellKey] =
                            "Only letters are allowed. No numbers or symbols.";
                        } else {
                          delete updated[cellKey];
                        }
                        return updated;
                      });
                    }}
                    onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                  />
                ) : (
                  <div className="cell-text">{value}</div>
                )}
                {showFillHandleHere && (
                  <div
                    className="fill-handle"
                    onMouseDown={(e) => startCellDrag(e, value)}
                  />
                )}

                {tooltipVisible && isInvalid && (
                  <div className="tooltip">{validationErrors[cellKey]}</div>
                )}
              </div>
            );
          },
        })
      ),
    ],
    [selectedCell, selectedRange, showFillHandle]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        const users = await res.json();
        const repeatedUsers = Array.from({ length: 18 }, (_, index) => {
          const user = users[index % users.length];
          return {
            rowNumber: (index + 1).toString(),
            ...Object.fromEntries(
              Array.from({ length: 18 }, (_, i) => [
                `col${i + 1}`,
                user.name || "",
              ])
            ),
          };
        });
        setData(repeatedUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return <p>Loading data...</p>;

  return (
    <div className="excel-container">
      <table className="excel-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, colIndex) => (
                <th
                  key={header.id}
                  onClick={() => handleHeaderClick(colIndex)}
                  className={`
                  ${selectedCol === colIndex ? "selected-col" : ""}
                  ${
                    colIndex >= columns.length - 3
                      ? `sticky-col col-${colIndex}`
                      : ""
                  }
                `}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell, colIndex) => (
                <td
                  key={cell.id}
                  data-row={rowIndex}
                  data-col={colIndex}
                  onClick={() => {
                    if (colIndex === 0) handleRowHeaderClick(rowIndex);
                  }}
                  className={`
          ${selectedCol === colIndex ? "selected-col" : ""}
          ${selectedRow === rowIndex ? "selected-row" : ""}
          ${colIndex >= columns.length - 3 ? `sticky-col col-${colIndex}` : ""}
        `}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExcelTable;
