import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

import './styles.css';
import { useLocation } from 'react-router-dom';

function TopBar({ title }) {
  const [isPhoto, setIsPhoto] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setIsPhoto(pathname.includes("photos"));
  }, [pathname]);

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" color="inherit">
          Osamah Alzacko
        </Typography>
        <Typography variant="h5" color="inherit">
          {isPhoto && "Photos of "}{title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
