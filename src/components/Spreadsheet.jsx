import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import SpreadsheetToolbar from "./SpreadsheetToolbar";
import SpreadsheetCell from "./SpreadsheetCell";

const DEFAULT_ROW_HEIGHT = 36;
const ROW_OVERSCAN = 6;

function getColumnLabel(index) {
  let label = "";
  let number = index + 1;

  while (number > 0) {
    const remainder = (number - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    number = Math.floor((number - 1) / 26);
  }

  return label;
}

export default function Spreadsheet() {
  const [selectedCell, setSelectedCell] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [cellValues, setCellValues] = useState({});

  const [columns, setColumns] = useState(() =>
    Array.from({ length: 6 }, (_, index) => getColumnLabel(index))
  );
  const [columnWidths, setColumnWidths] = useState({});
  const resizingRef = useRef(null);

  const [rowHeights, setRowHeights] = useState({});
  const rowResizingRef = useRef(null);
  const scrollRef = useRef(null);

  const [rows, setRows] = useState(() =>
    Array.from({ length: 10 }, (_, index) => index + 1)
  );

  // Store cumulative row positions so we can render only rows near the viewport.
  const rowOffsets = useMemo(() => {
    const offsets = [0];

    rows.forEach((row) => {
      const height = rowHeights[row] ?? DEFAULT_ROW_HEIGHT;
      offsets.push(offsets[offsets.length - 1] + height);
    });

    return offsets;
  }, [rows, rowHeights]);

  const totalRowHeight = rowOffsets[rowOffsets.length - 1] ?? 0;

  const columnOffsets = useMemo(() => {
    const offsets = [0];
    columns.forEach((column) => {
      const width = columnWidths[column] ?? 120;
      offsets.push(offsets[offsets.length - 1] + width);
    });
    return offsets;
  }, [columns, columnWidths]);

  const totalColumnWidth = columnOffsets[columnOffsets.length - 1] ?? 0;
  const [visibleRange, setVisibleRange] = useState({
    rowStart: 0,
    rowEnd: 25,
    columnStart: 0,
    columnEnd: 20,
  });

  const updateVisibleRange = useCallback(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // The scroll position maps directly to the row-body offset because the
    // column header is sticky inside the same scrolling container.
    const viewportTop = scrollElement.scrollTop;
    const viewportBottom = viewportTop + scrollElement.clientHeight;

    let firstVisibleRow = 0;
    while (
      firstVisibleRow < rows.length &&
      rowOffsets[firstVisibleRow + 1] <= viewportTop
    ) {
      firstVisibleRow += 1;
    }

    let endVisibleRow = firstVisibleRow;
    while (
      endVisibleRow < rows.length &&
      rowOffsets[endVisibleRow] < viewportBottom
    ) {
      endVisibleRow += 1;
    }

    const rowStart = Math.max(0, firstVisibleRow - ROW_OVERSCAN);
    const rowEnd = Math.min(rows.length, endVisibleRow + ROW_OVERSCAN);

    // The sticky row-number column is 52px wide. Account for it when
    // determining which worksheet columns can be seen horizontally.
    const viewportColumnLeft = scrollElement.scrollLeft;
    const viewportColumnRight = Math.max(
      0,
      scrollElement.scrollLeft + scrollElement.clientWidth - 52
    );

    let firstVisibleColumn = 0;
    while (
      firstVisibleColumn < columns.length &&
      columnOffsets[firstVisibleColumn + 1] <= viewportColumnLeft
    ) {
      firstVisibleColumn += 1;
    }

    let endVisibleColumn = firstVisibleColumn;
    while (
      endVisibleColumn < columns.length &&
      columnOffsets[endVisibleColumn] < viewportColumnRight
    ) {
      endVisibleColumn += 1;
    }

    const columnStart = Math.max(0, firstVisibleColumn - 4);
    const columnEnd = Math.min(columns.length, endVisibleColumn + 4);

    setVisibleRange((current) =>
      current.rowStart === rowStart &&
      current.rowEnd === rowEnd &&
      current.columnStart === columnStart &&
      current.columnEnd === columnEnd
        ? current
        : { rowStart, rowEnd, columnStart, columnEnd }
    );
  }, [rows.length, rowOffsets, columns.length, columnOffsets]);

  useEffect(() => {
    updateVisibleRange();

    const scrollElement = scrollRef.current;
    if (!scrollElement || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateVisibleRange);
    observer.observe(scrollElement);
    return () => observer.disconnect();
  }, [updateVisibleRange]);

  const topSpacerHeight = rowOffsets[visibleRange.rowStart] ?? 0;
  const bottomSpacerHeight = Math.max(
    0,
    totalRowHeight - (rowOffsets[visibleRange.rowEnd] ?? totalRowHeight)
  );
  const visibleRows = rows.slice(visibleRange.rowStart, visibleRange.rowEnd);
  const visibleColumns = columns.slice(
    visibleRange.columnStart,
    visibleRange.columnEnd
  );
  const leftColumnSpacerWidth = columnOffsets[visibleRange.columnStart] ?? 0;
  const rightColumnSpacerWidth = Math.max(
    0,
    totalColumnWidth - (columnOffsets[visibleRange.columnEnd] ?? totalColumnWidth)
  );
  const visibleGridTemplateColumns = `52px ${leftColumnSpacerWidth}px ${visibleColumns
    .map((column) => `${columnWidths[column] ?? 120}px`)
    .join(" ")} ${rightColumnSpacerWidth}px`;

  function handleAddRow() {
    setRows((currentRows) => [
      ...currentRows,
      (currentRows[currentRows.length - 1] ?? 0) + 1,
    ]);
  }

  function handleRemoveRow() {
    if (rows.length <= 1) return;

    const rowToRemove = rows[rows.length - 1];
    setRows((currentRows) => currentRows.slice(0, -1));

    setCellValues((currentValues) => {
      const updatedValues = { ...currentValues };
      columns.forEach((column) => {
        delete updatedValues[`${rowToRemove}-${column}`];
      });
      return updatedValues;
    });

    setRowHeights((currentHeights) => {
      const updatedHeights = { ...currentHeights };
      delete updatedHeights[rowToRemove];
      return updatedHeights;
    });

    if (selectedCell?.row === rowToRemove) setSelectedCell(null);
    if (editingCell?.startsWith(`${rowToRemove}-`)) setEditingCell(null);
  }

  function handleAddColumn() {
    setColumns((currentColumns) => [
      ...currentColumns,
      getColumnLabel(currentColumns.length),
    ]);
  }

  function handleRemoveColumn() {
    if (columns.length <= 1) return;

    const columnToRemove = columns[columns.length - 1];
    setColumns((currentColumns) => currentColumns.slice(0, -1));

    setCellValues((currentValues) => {
      const updatedValues = { ...currentValues };
      rows.forEach((row) => {
        delete updatedValues[`${row}-${columnToRemove}`];
      });
      return updatedValues;
    });

    setColumnWidths((currentWidths) => {
      const updatedWidths = { ...currentWidths };
      delete updatedWidths[columnToRemove];
      return updatedWidths;
    });

    if (selectedCell?.column === columnToRemove) setSelectedCell(null);
    if (editingCell?.endsWith(`-${columnToRemove}`)) setEditingCell(null);
  }

  const selectCell = useCallback((row, column) => {
    setSelectedCell({ row, column });
  }, []);

  const startEditing = useCallback((row, column) => {
    setSelectedCell({ row, column });
    setEditingCell(`${row}-${column}`);
  }, []);

  const updateCellValue = useCallback((cellKey, value) => {
    setCellValues((previousValues) => ({
      ...previousValues,
      [cellKey]: value,
    }));
  }, []);

  const finishEditing = useCallback(() => {
    setEditingCell(null);
  }, []);

  return (
    <section className="spreadsheet-panel" aria-label="Spreadsheet workspace">
      <div className="toolbar">
        <strong>Sheet 1</strong>
        <span>
          {rows.length} rows · {columns.length} columns
        </span>
      </div>

      <SpreadsheetToolbar
        onAddRow={handleAddRow}
        onRemoveRow={handleRemoveRow}
        onAddColumn={handleAddColumn}
        onRemoveColumn={handleRemoveColumn}
      />

      <div
        className="spreadsheet-scroll"
        role="grid"
        aria-label="Spreadsheet"
        ref={scrollRef}
        onScroll={updateVisibleRange}
      >
        <div className="spreadsheet">
          <div
            className="spreadsheet-header"
            role="row"
            style={{ gridTemplateColumns: visibleGridTemplateColumns }}
          >
            <div className="corner-cell" aria-hidden="true" />
            <div className="spreadsheet-column-spacer" aria-hidden="true" />

            {visibleColumns.map((column) => (
              <div className="column-header" role="columnheader" key={column}>
                {column}
                <div
                  className="column-resize-handle"
                  role="separator"
                  aria-orientation="vertical"
                  aria-label={`Resize column ${column}`}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    resizingRef.current = {
                      column,
                      startX: event.clientX,
                      startWidth: columnWidths[column] ?? 120,
                      pointerId: event.pointerId,
                    };
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    const resize = resizingRef.current;
                    if (!resize || resize.pointerId !== event.pointerId) return;

                    const movement = event.clientX - resize.startX;
                    const newWidth = Math.max(60, resize.startWidth + movement);
                    setColumnWidths((currentWidths) => ({
                      ...currentWidths,
                      [resize.column]: newWidth,
                    }));
                  }}
                  onPointerUp={(event) => {
                    if (resizingRef.current?.pointerId === event.pointerId) {
                      resizingRef.current = null;
                    }
                  }}
                  onPointerCancel={() => {
                    resizingRef.current = null;
                  }}
                />
              </div>
            ))}

            <div className="spreadsheet-column-spacer" aria-hidden="true" />
          </div>

          <div className="spreadsheet-body">
            {topSpacerHeight > 0 && (
              <div
                className="spreadsheet-virtual-spacer"
                aria-hidden="true"
                style={{ height: `${topSpacerHeight}px` }}
              />
            )}

            {visibleRows.map((row) => (
              <div
                className="spreadsheet-row"
                role="row"
                key={row}
                style={{
                  gridTemplateColumns: visibleGridTemplateColumns,
                  height: `${rowHeights[row] ?? DEFAULT_ROW_HEIGHT}px`,
                }}
              >
                <div className="row-header" role="rowheader">
                  {row}
                  <div
                    className="row-resize-handle"
                    role="separator"
                    aria-orientation="horizontal"
                    aria-label={`Resize row ${row}`}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      rowResizingRef.current = {
                        row,
                        startY: event.clientY,
                        startHeight: rowHeights[row] ?? DEFAULT_ROW_HEIGHT,
                        pointerId: event.pointerId,
                      };
                      event.currentTarget.setPointerCapture(event.pointerId);
                    }}
                    onPointerMove={(event) => {
                      const resize = rowResizingRef.current;
                      if (!resize || resize.pointerId !== event.pointerId) return;

                      const movement = event.clientY - resize.startY;
                      const newHeight = Math.max(24, resize.startHeight + movement);
                      setRowHeights((currentHeights) => ({
                        ...currentHeights,
                        [resize.row]: newHeight,
                      }));
                    }}
                    onPointerUp={(event) => {
                      if (rowResizingRef.current?.pointerId === event.pointerId) {
                        rowResizingRef.current = null;
                      }
                    }}
                    onPointerCancel={() => {
                      rowResizingRef.current = null;
                    }}
                  />
                </div>

                <div className="spreadsheet-column-spacer" aria-hidden="true" />

                {visibleColumns.map((column, visibleColumnIndex) => {
                  const columnIndex = visibleRange.columnStart + visibleColumnIndex;
                  const cellKey = `${row}-${column}`;
                  const isSelected =
                    selectedCell?.row === row && selectedCell?.column === column;
                  const canOverflow =
                    isSelected &&
                    columns.slice(columnIndex + 1).every((nextColumn) => {
                      const nextValue = cellValues[`${row}-${nextColumn}`] ?? "";
                      return nextValue === "";
                    });
                  const isEditing = editingCell === cellKey;

                  return (
                    <SpreadsheetCell
                      key={cellKey}
                      row={row}
                      column={column}
                      cellKey={cellKey}
                      value={cellValues[cellKey] ?? ""}
                      isSelected={isSelected}
                      isEditing={isEditing}
                      canOverflow={canOverflow}
                      onSelect={selectCell}
                      onStartEditing={startEditing}
                      onValueChange={updateCellValue}
                      onFinishEditing={finishEditing}
                    />
                  );
                })}

                <div className="spreadsheet-column-spacer" aria-hidden="true" />
              </div>
            ))}

            {bottomSpacerHeight > 0 && (
              <div
                className="spreadsheet-virtual-spacer"
                aria-hidden="true"
                style={{ height: `${bottomSpacerHeight}px` }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
