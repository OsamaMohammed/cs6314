import React, { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { Stack, Typography, CircularProgress, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

import './styles.css';

function UserDetail({ userId }) {
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let live = true;
    setUser(null);
    setErr(null);

    axios
      .get(`http://localhost:3001/user/${userId}`)
      .then(({ data }) => {
        if (live) setUser(data);
      })
      .catch((e) => {
        if (live) setErr(e.message);
      });

    return () => {
      live = false;
    };
  }, [userId]);

  if (err) {
    return <Typography color="error">Failed to load user: {err}</Typography>;
  }
  if (!user) {
    return <CircularProgress size={24} />;
  }

  return (
    <Stack spacing={1.2}>
      <Typography variant="h5">
        {user.first_name} {user.last_name}
      </Typography>

      <Typography variant="body1">
        <b>Location:</b> {user.location}
      </Typography>

      <Typography variant="body1">
        <b>Occupation:</b> {user.occupation}
      </Typography>

      <Typography variant="body1">
        <b>About:</b> {user.description}
      </Typography>

      <Typography variant="body2" sx={{ mt: 1.5 }}>
        <MuiLink component={Link} to={`/photos/${user._id}`}>
          View photos of {user.first_name}
        </MuiLink>
      </Typography>
    </Stack>
  );
}

UserDetail.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserDetail;
