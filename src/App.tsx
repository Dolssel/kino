import { Routes, Route, Link } from "react-router-dom";
import BrowsePage from "./pages/BrowsePage";
import MovieDetailPage from "./pages/MovieDetailPage";

function App() {
  return (
    <>
      <header>
        <Link to="/">Kino</Link>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}

export default App;