import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
const Header = React.lazy(() => import('./Header'));
const SearchPage = React.lazy(() => import('./SearchPage'));
const WatchlistPage = React.lazy(() => import('./WatchlistPage'));


function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
      </Routes>
    </>
  );
}

export default App;