// Small helpers for talking to the TMDB API.

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_KEY;

// The shape of ONE movie as TMDB returns it inside a list.
// (we only declare the fields we're going to use)
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null; // can be null when there's no poster
  release_date: string;        // format "2024-05-31"
  vote_average: number;
  genre_ids: number[];
}

// The shape of the /movie/popular RESPONSE (one "page" of results).
export interface PopularResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// Fetch the first page of popular movies.
export async function getPopularMovies(): Promise<PopularResponse> {
  const res = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
  );

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status}`);
  }

  const data: PopularResponse = await res.json();
  return data;
}

// A genre as returned inside a movie's detail.
export interface Genre {
  id: number;
  name: string;
}

// The RICHER shape from /movie/{id} — more fields than the list `Movie`.
export interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  runtime: number | null;
  tagline: string;
  genres: Genre[];
}

// Fetch full details for one movie.
export async function getMovieDetail(id: number): Promise<MovieDetail> {
  const res = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`
  );
  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status}`);
  }
  const data: MovieDetail = await res.json();
  return data;
}

// Search movies by title.
export async function searchMovies(
  query: string,
  page = 1
): Promise<PopularResponse> {
  const res = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US` +
      `&query=${encodeURIComponent(query)}&page=${page}`
  );
  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status}`);
  }
  const data: PopularResponse = await res.json();
  return data;
}

// The /genre/movie/list response (id → name map for the genre dropdown).
interface GenreListResponse {
  genres: Genre[]; // Genre interface already exists (we added it for the detail page)
}

export async function getGenres(): Promise<Genre[]> {
  const res = await fetch(
    `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
  );
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  const data: GenreListResponse = await res.json();
  return data.genres;
}

// Browse mode: filter/sort via /discover/movie.
export async function discoverMovies(
  params: { genreId?: string; year?: string; minRating?: string; sort?: string; page?: number }
): Promise<PopularResponse> {
  const search = new URLSearchParams({
    api_key: API_KEY,
    language: "en-US",
    sort_by: params.sort ?? "popularity.desc",
    page: String(params.page ?? 1),
  });
  if (params.genreId) search.set("with_genres", params.genreId);
  if (params.year) search.set("primary_release_year", params.year);
  if (params.minRating) search.set("vote_average.gte", params.minRating);

  const res = await fetch(`${BASE_URL}/discover/movie?${search.toString()}`);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  const data: PopularResponse = await res.json();
  return data;
}