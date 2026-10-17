# Spreadsheet Editor

This is a small spreadsheet-style editor built with React and Vite. You can select cells, edit their values, resize rows and columns, and add or remove rows and columns.

I started with a simple grid. When I tried using a much larger grid, the page became slow, so I added virtualization to render only the cells around the visible area. The grid and resizing behavior use React and browser APIs without relying on a third-party grid or virtualization library.

## Getting started

### Requirements

- Node.js 20.19 or newer, or Node.js 22.12 or newer.
- npm, which is included with Node.js.
- A modern browser such as Chrome, Firefox, Edge, or Safari.

Check that Node.js and npm are installed:

```bash
node -v
npm -v
```

### 1. Get the project

Clone the repository if you have its Git URL:

```bash
git clone <repository-url>
cd spreadsheet-editor
```

Replace `<repository-url>` with the actual repository URL.

If you downloaded the project as a ZIP file, extract it and open a terminal in the project folder.

Make sure you are in the directory containing `package.json` and `index.html`.

### 2. Install dependencies

```bash
npm install
```

This installs the packages required by the project. The grid and virtualization logic do not depend on a third-party grid or virtualization package.

### 3. Start the development server

```bash
npm run dev
```

Open the local URL printed in the terminal. Vite commonly uses `http://localhost:5173/`, but the port may be different if that address is already in use.

To stop the development server, press `Ctrl + C` in the terminal.

### 4. Optional project checks

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

If a lint script is configured in `package.json`, run it with:

```bash
npm run lint
```

## Project structure

```text
spreadsheet-editor/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── Spreadsheet.jsx
│   │   ├── SpreadsheetCell.jsx
│   │   └── SpreadsheetToolbar.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
```

### Main files

- **`Spreadsheet.jsx`** — Manages the grid state, layout, row and column resizing, and virtualization.
- **`SpreadsheetCell.jsx`** — Handles cell selection, keyboard interactions, and editing.
- **`SpreadsheetToolbar.jsx`** — Provides controls for adding and removing rows and columns.
- **`App.jsx`** — Defines the main application layout.
- **`App.css`** — Contains styles for the grid, headers, cells, and resize handles.
- **`index.css`** — Contains global styles.
- **`main.jsx`** — Entry point for the React application.
- **`index.html`** — HTML page loaded by Vite.
- **`package.json`** — Lists project dependencies and available scripts.
- **`package-lock.json`** — Records the exact dependency versions resolved by npm.
- **`vite.config.js`** — Contains the Vite configuration.
- **`.gitignore`** — Specifies files and directories that Git should ignore.

The `node_modules/` and `dist/` directories are generated locally and are not required in the repository. They can be recreated by installing dependencies and building the project.

## How I built it

I added the features in stages:

1. **Set up React and Vite.** This provided the application structure and the commands needed to run and build the project.
2. **Built the grid.** I added row numbers, column labels, cell borders, scrolling, and sticky headers.
3. **Added cell selection and editing.** Cell values are stored in React state, so they remain available when another cell is selected.
4. **Added and removed rows and columns.** The toolbar updates the grid and removes stored values and sizing information when the last row or column is removed.
5. **Implemented resizing.** Pointer events track dragging, and pointer capture helps resizing continue when the pointer moves away from the resize handle.
6. **Improved performance.** A grid with 200 rows and 200 columns contains 40,000 cells. Rendering every cell at once became slow, so I implemented virtualization without adding another library.
7. **Checked the main interactions.** I tested editing, resizing, adding and removing rows and columns, and scrolling through a larger grid.

## How the implementation works

### Grid and component structure

`Spreadsheet.jsx` manages the row and column counts, cell values, selected and edited cells, row heights, and column widths.

CSS Grid keeps the cells aligned. The column headings remain at the top while scrolling, and the row numbers remain on the left.

I separated the cell and toolbar into their own components. `SpreadsheetCell.jsx` handles interactions for an individual cell, while `SpreadsheetToolbar.jsx` contains the buttons for adding and removing rows and columns.

`React.memo` is used to help avoid unnecessary cell re-renders when the component's props have not changed.

### Cell editing and values

Cell values are stored in an object in React state. Each value uses a key made from the row number and column label. For example, cell C3 uses the key `3-C`.

When a cell is edited, its value is displayed in an input. The value remains in state when the user selects another cell or scrolls the cell out of view.

The values are stored only in the current page session. There is no database or browser-storage persistence, so refreshing the page clears the worksheet contents.

### Row and column resizing

Each row and column has a resize handle. When dragging begins, the code records the pointer's starting position and the current size.

As the pointer moves, it calculates the new height or width while enforcing the minimum size. Pointer capture helps keep the drag working if the pointer moves away from the handle.

Row heights and column widths are stored separately from cell values, so resizing does not change the contents of a cell.

### Adding and removing rows and columns

The toolbar updates the row and column lists in React state.

When the last row or column is removed, its cell values and custom sizing information are removed as well. The grid always keeps at least one row and one column.

The current buttons operate at the end of the grid; they do not remove an arbitrary selected row or column.

### Virtualization

Rendering thousands of cells at once can make a spreadsheet slow. Virtualization reduces this work by rendering only the cells around the visible area instead of creating every cell in the grid.

This makes scrolling and interacting with a larger grid more manageable without requiring a third-party virtualization library.

## Manual checks

Before sharing a change, I check the app in the browser:

- Edit a cell, select another cell, and return to make sure the first value is still there.
- Enter edit mode with a double-click, Enter, and F2.
- Press Escape and confirm that editing stops while keeping the text entered so far.
- Resize rows and columns in both directions and check the minimum sizes.
- Add and remove rows and columns, including after entering values in them.
- Scroll vertically and horizontally and check that the headers and cells stay aligned.
- Try a larger grid, such as 200 rows by 200 columns, and check editing, scrolling, resizing, and adding columns.
- Run `npm run build` and make sure the build completes without errors.

## Known limitations

- Cell values are not saved permanently. Refreshing or closing the page clears them.
- The buttons remove only the last row or column, not a selected row or column.
- Pressing Escape stops editing but does not undo the text entered.
- Arrow-key navigation between cells is not implemented yet.
- Formulas, copy and paste, undo and redo, and file import/export are not supported.
- Resizing works with pointer interaction, but there is no keyboard method for resizing.
- Accessibility support is basic. Cells and resize handles have labels, but full spreadsheet keyboard navigation and screen-reader grid behavior are not implemented.
- Finding the visible rows and columns currently checks their positions one by one. Binary search could improve this if the grid grows much larger.

## What I learned

Building this editor gave me practice with React state, component structure, keyboard events, pointer events, and CSS Grid.

I also learned that a grid can work well with a small amount of data and still become slow when the number of cells grows. Adding virtualization helped me understand how to improve performance by rendering only the part of the interface the user needs to see.

This project also gave me experience breaking a larger UI into smaller components and testing how different interactions work together.