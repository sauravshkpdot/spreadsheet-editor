import { memo, useRef } from "react";

function SpreadsheetCell({
  row,
  column,
  cellKey,
  value,
  isSelected,
  isEditing,
  canOverflow,
  onSelect,
  onStartEditing,
  onValueChange,
  onFinishEditing,
}) {
  const cellRef = useRef(null);

  return (
    <div
      ref={cellRef}
      className={`cell ${
        isSelected ? "cell-selected" : ""
      } ${canOverflow ? "cell-overflow" : ""}`}
      role="gridcell"
      aria-selected={isSelected}
      tabIndex={0}
      onClick={(event) => {
        onSelect(row, column);

        if (!isEditing) {
          event.currentTarget.focus();
        }
      }}
      onDoubleClick={() => onStartEditing(row, column)}
      onKeyDown={(event) => {
        if (isEditing) return;

        if (event.key === "Enter" || event.key === "F2") {
          event.preventDefault();
          onStartEditing(row, column);
          return;
        }

        if (event.key === "Delete" || event.key === "Backspace") {
          event.preventDefault();
          onValueChange(cellKey, "");
          return;
        }

        const isTypingCharacter =
          event.key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey;

        if (isTypingCharacter) {
          event.preventDefault();
          onValueChange(cellKey, event.key);
          onStartEditing(row, column);
        }
      }}
    >
      {isEditing ? (
        <input
          className="cell-input"
          aria-label={`Edit cell ${column}${row}`}
          autoFocus
          value={value}
          onChange={(event) =>
            onValueChange(cellKey, event.target.value)
          }
          onBlur={onFinishEditing}
          onKeyDown={(event) => {
            event.stopPropagation();

            if (
              event.key === "Enter" ||
              event.key === "Escape"
            ) {
              event.preventDefault();
              onFinishEditing();
              cellRef.current?.focus();
            }
          }}
        />
      ) : (
        value
      )}
    </div>
  );
}

export default memo(SpreadsheetCell);

