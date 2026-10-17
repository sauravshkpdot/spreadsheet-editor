
import "./App.css";
import Spreadsheet from "./components/Spreadsheet.jsx";

export default function App() {
  return (
    <main className="app">
      <header className="app-header">
        <p className="eyebrow">SPREADSHEET EDITOR</p>

        <h1>My Spreadsheet</h1>

        <p className="subtitle">
          A simple spreadsheet built with React.
        </p>
      </header>

      <Spreadsheet />

      <p className="app-note">
        Click a cell to select it. Single-click a cell Double-click a cell
        or press Enter to edit it.
      </p>
    </main>
  );
}
