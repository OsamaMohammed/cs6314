import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation()
  const [page, setPage] = useState('/')

  useEffect(() => {
    setPage(location.pathname)
  }, [location])

  return (
    <header>
      {page == '/' &&
        <>
          <h1>Movie Search 🎥</h1>

          <nav>
            <Link to="/watchlist">My Watchlist</Link>
          </nav>
        </>
      }
      {page == '/watchlist' &&
        <>
          <h1>My Watchlist 📺</h1>

          <nav>
            <Link to="/">Home</Link>
          </nav>
        </>
      }
    </header>
  );
};
export default Header;