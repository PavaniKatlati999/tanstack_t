// utils/tableUtils.ts
export const getColumnLetter = (index: number): string => {
  let letter = "";
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
};

export const getRangeBounds = (
  start: { row: number; col: number },
  end: { row: number; col: number }
) => {
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  return { minRow, maxRow, minCol, maxCol };
};

export const isCellInRange = (
  selectedRange: { start: { row: number; col: number } | null; end: { row: number; col: number } | null },
  row: number,
  col: number
) => {
  if (!selectedRange.start || !selectedRange.end) return false;
  const { minRow, maxRow, minCol, maxCol } = getRangeBounds(selectedRange.start, selectedRange.end);
  return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
};
