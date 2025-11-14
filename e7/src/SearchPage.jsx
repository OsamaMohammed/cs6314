import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";

const SearchPage = () => {
  const [query, setQuery] = useState("Avengers")
  const [movies, setMovies] = useState([])

  const onQuery = (e) => {
    setQuery(e.target.value)
  }

  const onSearch = async (e) => {
    e?.preventDefault()
    // URL encoding
    let searchValue = encodeURIComponent(query);
    let url = `http://www.omdbapi.com/?s=${searchValue}&apikey=4c185daa`;
    let response = await fetch(url);
    let data = await response.json();
    if (data.Response === "False") {
      alert(data.Error);

      return;
    }
    console.log(data);
    setMovies(data.Search);
  }

  return (
    <>
      <main>
        <section class="search">
          <form onSubmit={onSearch}>
            <input type="text" value={query} onInput={onQuery} placeholder="Enter movie title..." />
            <button type="submit">Search</button>
          </form>
        </section>

        <section class="movie-list">
          {movies.map((movie, idx) => (
            <MovieCard key={movie.imdbID} movie={movie}></MovieCard>
          ))}
        </section>
      </main>
    </>
  );
};
export default SearchPage;