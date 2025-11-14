import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";

const WatchlistPage = () => {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    init()
  }, [])

  const init = () => {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    setMovies(watchlist)

  }
  return (
    <>
      <main>
        <section class="movie-list">
          {movies.map((movie, idx) => (
            <MovieCard key={movie.imdbID} movie={movie} onRemove={init}></MovieCard>
          ))}
        </section>
      </main>
    </>
  );
};
export default WatchlistPage;