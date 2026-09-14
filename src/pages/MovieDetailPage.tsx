import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMovieDetail } from "../api/tmdb";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

export default function MovieDetailPage() {
  const { id } = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => getMovieDetail(Number(id)),
    enabled: Boolean(id),
  });

  if (isPending) return <p>Loading movie…</p>;
  if (isError) return <p>Something went wrong: {error.message}</p>;

  return (
    <article className="movie-detail">
      <Link to="/" className="movie-detail__back">← Back</Link>

      <div className="movie-detail__layout">
        {data.poster_path ? (
          <img
            className="movie-detail__poster"
            src={`${IMG_BASE}${data.poster_path}`}
            alt={data.title}
          />
        ) : (
          <div className="movie-detail__poster movie-detail__poster--empty">
            No poster
          </div>
        )}

        <div className="movie-detail__info">
          <h1>{data.title}</h1>
          {data.tagline && <p className="movie-detail__tagline">{data.tagline}</p>}

          <p className="movie-detail__meta">
            <span>★ {data.vote_average.toFixed(1)}</span>
            {data.runtime ? <span>{data.runtime} min</span> : null}
            <span>{data.release_date.slice(0, 4)}</span>
          </p>

          <ul className="movie-detail__genres">
            {data.genres.map((genre) => (
              <li key={genre.id}>{genre.name}</li>
            ))}
          </ul>

          <p className="movie-detail__overview">{data.overview}</p>
        </div>
      </div>
    </article>
  );
}