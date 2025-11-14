import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import {
  Grid, Typography, Paper
} from '@mui/material';
import {
  BrowserRouter, Routes, Route, useParams
} from 'react-router-dom';

import './styles/main.css';
import { AdvancedProvider } from './contexts/AdvancedContext';
import TopBar from './components/TopBar';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';
import UserComments from './components/UserComments';

function UserDetailRoute() {
  const { userId } = useParams();
  // eslint-disable-next-line no-console
  console.log('UserDetailRoute: userId is:', userId);
  return <UserDetail userId={userId} />;
}

function UserPhotosRoute() {
  const { userId } = useParams();
  return <UserPhotos userId={userId} />;
}

function UserCommentsRoute() {
  return <UserComments />;
}

function PhotoShare() {
  return (
    <AdvancedProvider>
      <BrowserRouter>
        <Grid container spacing={2}>
          {/* Top bar */}
          <Grid item xs={12}>
            <TopBar />
          </Grid>

          <div className="main-topbar-buffer" />

          {/* Left side: User list */}
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              <UserList />
            </Paper>
          </Grid>

          {/* Right side: Main content */}
          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Routes>
                <Route
                  path="/"
                  element={<Typography variant="body1">Welcome to the PhotoShare app!</Typography>}
                />
                <Route path="/users/:userId" element={<UserDetailRoute />} />
                <Route path="/photos/:userId" element={<UserPhotosRoute />} />
                <Route path="/photos/:userId/:photoId" element={<UserPhotosRoute />} />
                <Route path="/comments/:userId" element={<UserCommentsRoute />} />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </BrowserRouter>
    </AdvancedProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('photoshareapp'));
root.render(<PhotoShare />);
