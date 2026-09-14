import { Link } from "react-router-dom";
import type { Movie } from "../api/tmdb";

// TMDB serves images from a separate host; w342 = a good card-sized width.
const IMG_BASE = "https://image.tmdb.org/t/p/w342";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link to={`/movie/${movie.id}`} className="movie-card">
      {movie.poster_path ? (
        <img
          src={`${IMG_BASE}${movie.poster_path}`}
          alt={movie.title}
          className="movie-card__poster"
          loading="lazy"
        />
      ) : (
        <div className="movie-card__poster movie-card__poster--empty">
          No poster
        </div>
      )}
      <div className="movie-card__body">
        <h3 className="movie-card__title">{movie.title}</h3>
        <span className="movie-card__rating">
          ★ {movie.vote_average.toFixed(1)}
        </span>
      </div>
    </Link>
  );
}