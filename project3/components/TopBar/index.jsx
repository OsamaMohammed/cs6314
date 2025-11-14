import React, { useEffect, useMemo, useState } from 'react';
import { AppBar, Toolbar, Typography, Switch, FormControlLabel } from '@mui/material';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import './styles.css';
import { useAdvanced } from '../../contexts/AdvancedContext';

function TopBar() {
  const location = useLocation();
  const { enabled, setEnabled } = useAdvanced();
  const [user, setUser] = useState(null);

  // detect current view from the URL
  const view = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts[0] === 'users' && parts[1])   return { mode: 'user',      id: parts[1] };
    if (parts[0] === 'photos' && parts[1])  return { mode: 'photos',    id: parts[1] };
    if (parts[0] === 'comments' && parts[1])return { mode: 'comments',  id: parts[1] };
    return { mode: 'home' };
  }, [location.pathname]);

  // fetch user when needed (user/photos/comments views)
  useEffect(() => {
    setUser(null);
    if (view.mode === 'user' || view.mode === 'photos' || view.mode === 'comments') {
      axios
        .get(`http://localhost:3001/user/${view.id}`)
        .then((res) => setUser(res.data))
        .catch(() => setUser(null));
    }
  }, [view]);

  // right side text
  const rightText = useMemo(() => {
    if (view.mode === 'user'     && user) return `${user.first_name} ${user.last_name}`;
    if (view.mode === 'photos'   && user) return `Photos of ${user.first_name} ${user.last_name}`;
    if (view.mode === 'comments' && user) return `${user.first_name} ${user.last_name}'s Comments`;
    return 'Home';
  }, [view, user]);

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar sx={{ width: '100%', justifyContent: 'space-between' }}>
        <Typography variant="h6" color="inherit">Zarish M</Typography>

        <Typography variant="h6" color="inherit">{rightText}</Typography>

        <FormControlLabel
          control={(
            <Switch
              checked={!!enabled}
              onChange={(e) => setEnabled?.(e.target.checked)}
              color="secondary"
            />
          )}
          label="Enable Advanced Features"
          labelPlacement="start"
          sx={{ color: 'inherit' }}
        />
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;