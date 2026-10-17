## Spreadsheet Editor

This is a small spreadsheet-style editor made with React and Vite. You can select a cell, type into it, resize rows and columns, and add or remove rows and columns.

I started with a simple grid. When I tried using a much larger grid, the page became slow, so I added virtualization to render only the part of the grid around the visible area. The grid and resizing behavior use React and browser APIs; I did not add a third-party grid or virtualization library.


## Getting started
   # Requirements

- Node.js 20.19 or newer, or Node.js 22.12 or newer.
- npm, which is included with Node.js.
- A modern browser such as Chrome, Firefox, Edge, or Safari.
Check that Node.js and npm are installed:

    node -v
    npm -v

1. Get the project

Download and extract the project folder, or clone the repository if you have its Git URL:

    git clone <repository-url>
    cd spreadsheet-editor

Replace <repository-url> with the actual repository URL. If you downloaded a ZIP 
instead, open a terminal in the extracted project folder.

Make sure you are in the folder that contains package.json and index.html.

2. Install dependencies

    npm install

This installs the packages listed by the project. The grid itself does not rely on a third-party grid or virtualization package.

3. Start the development server

    npm run dev

Open the local address printed in the terminal. Vite commonly uses http://localhost:5173/, but the port may be different if that address is already in use.
To stop the server, press Ctrl + C in the terminal.

4. Optional project checks

Create a production build:
    npm run build

Preview the production build locally:
    npm run preview

If the project has a lint script configured in package.json, run it with:
    npm run lint

## Project structure
spreadsheet-editor/
├── src/
│   ├── components/
│   │   ├── Spreadsheet.jsx          # Grid state, layout, resizing, and virtualization
│   │   ├── SpreadsheetCell.jsx      # Cell selection, keyboard handling, and editing
│   │   └── SpreadsheetToolbar.jsx   # Add/remove row and column buttons
│   ├── App.jsx                      # Main page layout
│   ├── App.css                      # Grid, headers, resize handles, and cell styles
│   ├── index.css                    # Global page styles
│   └── main.jsx                     # React entry point
├── index.html                       # HTML page loaded by Vite
├── package.json                     # Dependencies and project scripts
├── package-lock.json                # Exact installed dependency versions, if present
└── README.md                        # Project guide

Keep the Vite configuration files that come with the project. You do not usually need to share node_modules or the generated dist folder; both can be recreated using the commands above.

## How I built it
I added the features in stages:

1. Set up React and Vite. This gave me the app structure and the commands to run and build it.
2. Made the grid. I added row numbers, column labels, cell borders, scrolling, and sticky headers.
3. Added selection and editing. Cell values are stored in React state, so they do not disappear when another cell is selected.
4. Added and removed rows and columns. The toolbar updates the grid and removes stored values and sizing information for the last row or column when it is removed.
5. Added resizing. Pointer events track the drag, and pointer capture helps the resize continue if the pointer moves away from the small handle.
6. Improved performance. A grid with 200 rows and 200 columns has 40,000 cells. Rendering them all at once became slow, so I implemented virtualization without adding a library.
7. Tested the main interactions. I checked editing, resizing, adding and removing rows and columns, and scrolling around a larger grid.

## How the implementation works

 - Grid and component structure
Spreadsheet.jsx keeps track of rows, columns, cell values, the selected and edited cells, row heights, and column widths. It uses CSS Grid to line up the cells. The column headings stay at the top when scrolling, and the row numbers stay on the left.

I separated the cell and toolbar into their own components. SpreadsheetCell.jsx handles selection and editing for one cell. SpreadsheetToolbar.jsx contains the buttons for adding and removing rows and columns. React.memo helps avoid rendering a cell again when its props have not changed.

 - Cell editing and values
Cell values are kept in an object in React state. Each value uses a key made from the row number and column label; for example, cell C3 uses 3-C. When a cell is edited, its text is shown in an input. The value remains in state when the user selects another cell or scrolls the cell out of view.

The values are stored only in the current page session. There is no database or browser-storage saving, so a page refresh clears the worksheet contents.

 - Row and column resizing
Each row and column has a small resize handle. When you start dragging, the code records the pointer's starting position and the current size. As the pointer moves, it calculates the new height or width, while enforcing the minimum size. Pointer capture helps keep the drag working if the pointer moves away from the handle.

Row heights and column widths are stored separately from cell values, so resizing does not change what is written in a cell.

 - Adding and removing rows and columns
The toolbar updates the row and column lists in React state. When the last row or column is removed, its cell values and custom sizing information are removed too. The grid always keeps at least one row and one column. The current buttons only work at the end of the grid; they do not remove an arbitrary selected row or column.

## Manual checks
Before sharing a change, I check the app in the browser:

- Edit a cell, select another one, and return to make sure the first value is still there.
- Enter edit mode with a double-click, Enter, and F2.
- Press Escape and confirm editing stops but keeps the text entered so far.
- Resize rows and columns in both directions and check the minimum sizes.
- Add and remove rows and columns, including after entering values in them.
- Scroll vertically and horizontally and check that the headers and cells stay aligned.
- Try a larger grid, such as 200 rows by 200 columns, and check editing, scrolling, resizing, and adding columns.
- Run npm run build and make sure the build completes without errors.

## Known limitations
- Cell values are not saved permanently. Refreshing or closing the page clears them.
- The buttons remove only the last row or column, not a selected row or column.
- Pressing Escape stops editing but does not undo the text entered.
- Arrow-key navigation between cells is not implemented yet.
- Formulas, copy and paste, undo and redo, and file import/export are not supported.
- Resizing works with pointer interaction, but there is no keyboard method for resizing.
- Accessibility support is basic. Cells and resize handles have labels, but full spreadsheet keyboard navigation and screen-reader grid behavior are not implemented.
- Finding the visible rows and columns currently checks their positions one by one. Binary search could help if the grid grows much larger.

## What I learned
Building this editor gave me practice with React state, component structure, keyboard events, pointer events, and CSS Grid. I also learned that a grid can work well with a small amount of data and still become slow when the number of cells grows. Adding virtualization helped me understand how to improve performance by rendering only the part of the interface the user needs to see.