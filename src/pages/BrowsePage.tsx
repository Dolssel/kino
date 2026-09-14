import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getGenres, searchMovies, discoverMovies } from "../api/tmdb";
import { useDebounce } from "../hooks/useDebounce";
import MovieGrid from "../components/MovieGrid";

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const genreId = searchParams.get("genreId") ?? "";
  const year = searchParams.get("year") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const minRating = searchParams.get("minRating") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const isSearching = query.length > 0;

  // --- search box: local state (instant) → debounced → URL ---
  const [input, setInput] = useState(query);
  const debouncedInput = useDebounce(input, 400);

  // When the debounced value settles, write it into the URL.
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const currentQ = prev.get("q") ?? ""; // Current URL q

        if (debouncedInput !== currentQ) { // the search term changed
          next.delete("page")
        }

        if (debouncedInput) next.set("q", debouncedInput);
        else next.delete("q");
        return next;
      },
      { replace: true }
    );
  }, [debouncedInput, setSearchParams]);

  // Update ONE url param while keeping the others intact.
  function updateParam(key: string, value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== "page") next.delete("page");
        return next;
      },
      { replace: true }
    );
  }

  // --- genre list for the dropdown ---
  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
    staleTime: Infinity, // genres never really change → never refetch
  });

  //Years down to 1970
  const years = Array.from({ length: 56 }, (_, i) => 2025 - i); // [2025, 2024, … 1970]

  // --- the movies (search mode OR discover mode) ---
  const { data, isPending, isError, error, isPlaceholderData } = useQuery({
    queryKey: ["movies", { query, genreId, year, minRating, sort, page }],
    queryFn: () =>
      isSearching
        ? searchMovies(query, page)
        : discoverMovies({ genreId: genreId || undefined, year: year || undefined, minRating: minRating || undefined, sort: sort || undefined, page: page }),
    placeholderData: keepPreviousData, // keep old movies on screen while the next set loads
  });

  return (
    <div>
      <h1>Kino 🎬</h1>

      <div className="controls">
        <input
          type="search"
          className="search-input"
          placeholder="Search movies…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <select
          className="filter-select"
          value={genreId}
          onChange={(e) => updateParam("genreId", e.target.value)}
          disabled={isSearching}
          title={isSearching ? "Clear search to filter by genre" : undefined}
        >
          <option value="">All genres</option>
          {genres?.map((g) => (
            <option key={g.id} value={String(g.id)}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={year}
          onChange={(e) => updateParam("year", e.target.value)}
          disabled={isSearching}
          title={isSearching ? "Clear search to filter by year" : undefined}
        >
          <option value="">All years</option>
          {years?.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={minRating}
          onChange={(e) => updateParam("minRating", e.target.value)}
          disabled={isSearching}
          title={isSearching ? "Clear search to filter by rating" : undefined}
        >
          <option value="">All ratings</option>
          {[9, 8, 7, 6, 5].map((r) => (
            <option key={r} value={String(r)}>{r}+</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          disabled={isSearching}
          title={isSearching ? "Clear search to sort" : undefined}
        >
          <option value="">Most popular</option>              {/* empty → falls back to popularity.desc */}
          <option value="vote_average.desc">Top rated</option>
          <option value="primary_release_date.desc">Newest</option>
          <option value="primary_release_date.asc">Oldest</option>
        </select>
      </div>

      {isSearching && (
        <p className="hint">Showing search results — filters apply to browsing.</p>
      )}

      {isPending && <p>Loading movies…</p>}
      {isError && <p>Something went wrong: {error.message}</p>}
      {data && data.results.length === 0 && <p>No movies found.</p>}
      {data && data.results.length > 0 && (
        <>
          <div style={{ opacity: isPlaceholderData ? 0.6 : 1, transition: "opacity 0.2s" }}>
            <MovieGrid movies={data.results} />
          </div>
          <div className="pagination">
            <button 
              disabled={page <= 1} 
              onClick={() => updateParam("page", String(page - 1))}
            >
              Prev
            </button>
            <span>Page {page} of {data.total_pages}</span>
            <button 
              disabled={page >= data.total_pages} 
              onClick={() => updateParam("page", String(page + 1))}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}