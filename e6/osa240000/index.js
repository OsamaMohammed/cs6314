// write your netid here
// osa240000

globalList = null;
let search = async (e = null) => {
    e?.preventDefault()
    let searchValue = searchInput.value;
    // URL encoding
    searchValue = encodeURIComponent(searchValue);
    let url = `http://www.omdbapi.com/?s=${searchValue}&apikey=4c185daa`;
    let response = await fetch(url);
    let data = await response.json();
    let movies = data.Search;
    globalList = movies;
    let html = "";
    for (let i = 0; i < movies.length; i++) {
        html += `
<div class="movie-card">
    <img src="${movies[i].Poster}" alt="${movies[i].Title}">
    <div class="movie-info">
        <h5>${movies[i].Title}</h5>
        <p>Year: ${movies[i].Year}</p>
        <div class="add-wishlish" onclick="add(${i})">
            <button class="add-btn">+</button>
            <label>Add to watchlist</label>
        </div>
    </div>
</div>
    `;
    }
    moviesContainer.innerHTML = html;
};

let form = document.getElementById('form')
if (form) {
    form.addEventListener('submit', search)
}


// Adding the movie to watchlist
function add(index) {
    let movie = globalList[index];
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    // Check if the movie is already in the watchlist
    for (let i = 0; i < watchlist.length; i++) {
        if (watchlist[i].imdbID === movie.imdbID) {
            alert("Movie already in watchlist");
            return;
        }
    }
    watchlist.push(movie);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    alert("Movie added to watchlist");
}

// Removing the movie from watchlist
function remove(index) {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    watchlist.splice(index, 1);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    alert("Movie removed from watchlist");
    wishlistInit();
}

function wishlistInit() {
    console.log("Wishlist Init");
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    let html = "";
    for (i in watchlist) {
        let movie = watchlist[i];
        html += `
<div class="movie-card">
    <img src="${movie.Poster}" alt="${movie.Title}">
    <div class="movie-info">
        <h5>${movie.Title}</h5>
        <p>Year: ${movie.Year}</p>
        <button onclick="remove(${i})" class="add-btn">-</button>
        <label>Remove from watchlist</label>
    </div>
</div>
    `;
    }
    moviesContainer.innerHTML = html;
}