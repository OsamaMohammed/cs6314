import { useEffect, useState } from "react";

const MovieCard = ({ movie = {}, onRemove = null }) => {
  const [isAdded, setIsAdded] = useState(false)

  useEffect(() => {
    // Check if the movie is already in the watchlist
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
    let idx = watchlist.findIndex(m => m.imdbID === movie.imdbID)
    if (idx !== -1) {
      // Movie is already in the watchlist
      setIsAdded(true)
    }
  }, [])

  const onAdd = (e) => {
    e.preventDefault()
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
    // Check if the movie is already in the watchlist
    for (let i = 0; i < watchlist.length; i++) {
      if (watchlist[i].imdbID === movie.imdbID) {
        alert("Movie already in watchlist");

        return;
      }
    }
    watchlist.push(movie)
    localStorage.setItem("watchlist", JSON.stringify(watchlist))
    alert("Movie added to watchlist")
    setIsAdded(true)
  }

  const onDel = (e) => {
    e.preventDefault()
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
    // Check if the movie is already in the watchlist
    for (let i = 0; i < watchlist.length; i++) {
      if (watchlist[i].imdbID === movie.imdbID) {
        watchlist.splice(i, 1)
        localStorage.setItem("watchlist", JSON.stringify(watchlist))
        alert("Movie removed from watchlist")
        setIsAdded(false)
        if (onRemove) {
          onRemove()
        }

        return
      }
    }
  }


  return (
    <div class="movie-card">
      <img src={movie.Poster} alt={movie.Title} />
      <div class="movie-info">
        <h5>{movie.Title}</h5>
        <p>Year: {movie.Year}</p>
        {!isAdded ? (
          <><button onClick={onAdd} class="add-btn">
            +
          </button>
            <label>Add to watchlist</label></>
        ) : (
          <><button onClick={onDel} class="add-btn">
            -
          </button>
            <label>Remove from watchlist</label></>
        )}
      </div>
    </div>
  );
};
export default MovieCard;