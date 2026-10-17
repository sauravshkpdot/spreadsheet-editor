export default function SpreadsheetToolbar({
  onAddRow,
  onRemoveRow,
  onAddColumn,
  onRemoveColumn,
}) {
  return (
    <div
      className="spreadsheet-toolbar"
      role="toolbar"
      aria-label="Spreadsheet controls"
    >
      <button type="button" onClick={onAddRow}>
        Add Row
      </button>

      <button type="button" onClick={onRemoveRow}>
        Remove Row
      </button>

      <button type="button" onClick={onAddColumn}>
        Add Column
      </button>

      <button type="button" onClick={onRemoveColumn}>
        Remove Column
      </button>
    </div>
  );
}

