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

const Editable: React.FC = () => {
  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedCells, setDraggedCells] = useState<
    { row: number; col: number }[]
  >([]);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);
  const [showFillHandle, setShowFillHandle] = useState(false);
  const columnHelper = createColumnHelper<RowData>();
  const isDraggingRef = useRef(false);
  const startCellRef = useRef<{ row: number; col: number } | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startFillDrag = (
    e: React.MouseEvent,
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startCellRef.current = { row: rowIndex, col: colIndex };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !startCellRef.current) return;

      const target = (moveEvent.target as HTMLElement).closest(
        "td[data-row][data-col]"
      );
      if (!target) return;

      const targetRow = parseInt(target.getAttribute("data-row") || "0", 10);
      const { row: startRow, col: startCol } = startCellRef.current;

      const minRow = Math.min(startRow, targetRow);
      const maxRow = Math.max(startRow, targetRow);

      const newDraggedCells: { row: number; col: number }[] = [];
      for (let r = minRow; r <= maxRow; r++) {
        newDraggedCells.push({ row: r, col: startCol });
      }
      setDraggedCells(newDraggedCells);

      setData((prev) => {
        const updated = [...prev];
        for (let r = minRow; r <= maxRow; r++) {
          updated[r] = { ...updated[r], [`col${startCol}`]: value };
        }
        return updated;
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      startCellRef.current = null;
      setDraggedCells([]); // Clear highlights after drag ends
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

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
            const columnKey = `col${i + 1}`;
            const value = info.getValue() as string;
            const isEditing =
              selectedCell?.row === rowIndex && selectedCell?.col === i + 1;

            return (
              <div className="cell-wrapper">
                {isEditing ? (
                  <input
                    autoFocus
                    type="text"
                    value={value}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setData((prev) => {
                        const updated = [...prev];
                        updated[rowIndex] = {
                          ...updated[rowIndex],
                          [columnKey]: newValue,
                        };
                        return updated;
                      });
                    }}
                    onBlur={() => setSelectedCell(null)}
                  />
                ) : (
                  <div
                    className="cell-text"
                    onClick={() => {
                      if (clickTimeoutRef.current) {
                        clearTimeout(clickTimeoutRef.current);
                        clickTimeoutRef.current = null;
                      }

                      clickTimeoutRef.current = setTimeout(() => {
                        if (
                          selectedCell?.row === rowIndex &&
                          selectedCell?.col === i + 1 &&
                          showFillHandle
                        ) {
                          setShowFillHandle(false);
                        } else {
                          setSelectedCell({ row: rowIndex, col: i + 1 });
                          setShowFillHandle(true);
                        }

                        clickTimeoutRef.current = null;
                      }, 200);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (clickTimeoutRef.current) {
                        clearTimeout(clickTimeoutRef.current);
                        clickTimeoutRef.current = null;
                      }
                      setShowFillHandle(false);
                    }}
                  >
                    {value}
                  </div>
                )}
                {selectedCell?.row === rowIndex &&
                  selectedCell?.col === i + 1 &&
                  showFillHandle && (
                    <div
                      className="fill-handle"
                      onMouseDown={(e) =>
                        startFillDrag(e, rowIndex, i + 1, value)
                      }
                    />
                  )}
              </div>
            );
          },
        })
      ),
    ],
    [selectedCell]
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

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex });
    setSelectedRow(null);
    setSelectedCol(null);

    if (colIndex === 0) return; // Ignore row header clicks here

    const columnKey = `col${colIndex}`;
    const value = data[rowIndex]?.[columnKey];
    console.log(`Value:`, value);
  };

  const handleHeaderClick = (colIndex: number) => {
    if (colIndex === 0) return; // Skip row number column

    setSelectedCol(colIndex);
    setSelectedRow(null);
    setSelectedCell(null);

    const columnKey = `col${colIndex}`;
    const columnValues = data.map((row) => row[columnKey]);
    console.log(` Values:`, columnValues);
  };

  const handleRowHeaderClick = (rowIndex: number) => {
    setSelectedRow(rowIndex);
    setSelectedCol(null);
    setSelectedCell(null);

    const rowValues = Object.values(data[rowIndex] || {}).slice(1);
    console.log(`Row ${rowIndex + 1} Values:`, rowValues);
  };

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
                  className={
                    colIndex >= columns.length - 3
                      ? `sticky-col col-${colIndex}`
                      : selectedCol === colIndex
                      ? "selected-col"
                      : ""
                  }
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
              {row.getVisibleCells().map((cell, colIndex) => {
                const isDragged = draggedCells.some(
                  (c) => c.row === rowIndex && c.col === colIndex
                );

                return (
                  <td
                    key={cell.id}
                    data-row={rowIndex}
                    data-col={colIndex}
                    onClick={() =>
                      colIndex === 0
                        ? handleRowHeaderClick(rowIndex)
                        : handleCellClick(rowIndex, colIndex)
                    }
                    className={`
                      ${
                        colIndex >= columns.length - 3
                          ? `sticky-col col-${colIndex}`
                          : ""
                      }
                      ${
                        selectedCell?.row === rowIndex &&
                        selectedCell?.col === colIndex
                          ? "selected"
                          : ""
                      }
                      ${selectedRow === rowIndex ? "selected-row" : ""}
                      ${selectedCol === colIndex ? "selected-col" : ""}
                      ${isDragged ? "highlighted-cell" : ""}
                    `}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Editable;
