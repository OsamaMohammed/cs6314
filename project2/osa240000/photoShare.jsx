import axios from 'axios';
import React, { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import { Grid, Typography, Paper } from '@mui/material';
import {
  BrowserRouter, Route, Routes, useParams,
} from 'react-router-dom';

import './styles/main.css';
// Import mock setup - Remove this once you have implemented the actual API calls
import TopBar from './components/TopBar';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';
import UserComments from './components/UserComments';

function UserDetailRoute({ onUserSelect }) {
  const { userId } = useParams();
  // eslint-disable-next-line no-console
  console.log('UserDetailRoute: userId is:', userId);
  return <UserDetail userId={userId} onUserSelect={onUserSelect} />;
}

// Set axios base url to http://localhost:3001
axios.defaults.baseURL = 'http://localhost:3001';

function UserPhotosRoute({ adv }) {
  const { userId } = useParams();
  return <UserPhotos userId={userId} adv={adv} />;
}

function UserCommentsRoute() {
  const { userId } = useParams();
  return <UserComments userId={userId} />;
}

function PhotoShare() {
  const [title, setTitle] = useState("");
  const [adv, setAdv] = useState(false);
  const onUserSelect = (user) => {
    setTitle(`${user.first_name} ${user.last_name}`);
  };

  return (
    <BrowserRouter>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar title={title} onAdvChange={(val) => setAdv(val)} />
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              <UserList />
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Routes>
                <Route
                  path="/"
                  element={(
                    <Typography variant="body1">
                      Welcome to your photosharing app!<br />
                      Please select one of the users in the side bar.
                    </Typography>
                  )}
                />
                <Route path="/users/:userId" element={<UserDetailRoute onUserSelect={onUserSelect} />} />
                <Route path="/photos/:userId" element={<UserPhotosRoute adv={adv} />} />
                <Route path="/comments/:userId" element={<UserCommentsRoute />} />
                <Route path="/users" element={<UserList />} />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('photoshareapp'));
root.render(<PhotoShare />);
