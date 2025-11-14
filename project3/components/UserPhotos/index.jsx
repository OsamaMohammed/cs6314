import React, { useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  Link as MuiLink,
  Button,
} from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import './styles.css';
import { useAdvanced } from '../../contexts/AdvancedContext';

function prettyDate(s) {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString();
}

function UserPhotos({ userId: userIdProp, photoId: photoIdProp }) {
  // Accept props if your router passes them, otherwise read from URL
  const params = useParams();
  const userId = userIdProp ?? params.userId;
  const photoId = photoIdProp ?? params.photoId;

  const navigate = useNavigate();
  const { enabled } = useAdvanced();

  const [photos, setPhotos] = useState(null);
  const [err, setErr] = useState(null);

  // Load photos for this user (fetch runs only when userId changes)
  useEffect(() => {
    let live = true;
    setPhotos(null);
    setErr(null);

    if (!userId) return () => { live = false; };

    axios
      .get(`http://localhost:3001/photosOfUser/${userId}`)
      .then(({ data }) => { if (live) setPhotos(data); })
      .catch((e) => { if (live) setErr(e.message); });

    return () => { live = false; };
  }, [userId]);

  // Find current index when Advanced ON
  const index = useMemo(() => {
    if (!enabled || !photos) return -1;
    return photos.findIndex((p) => p._id === photoId);
  }, [enabled, photos, photoId]);

  // 🔁 One-time redirect to first photo when Advanced ON at /photos/:userId
  // or when :photoId is invalid. This avoids infinite loops:
  // - we wait until photos are loaded
  // - we navigate only if necessary
  useEffect(() => {
    if (!enabled) return;
    if (!photos || photos.length === 0) return;

    // If no :photoId, or not found, push the first one
    if (!photoId || photos.findIndex((p) => p._id === photoId) === -1) {
      navigate(`/photos/${userId}/${photos[0]._id}`, { replace: true });
    }
  }, [enabled, photos, photoId, userId, navigate]);

  if (err) return <Typography color="error">Failed to load photos: {err}</Typography>;
  if (!photos) return <CircularProgress size={24} />;
  if (photos.length === 0) return <Typography>No photos.</Typography>;

  /* =======================
     Advanced OFF → original list
     ======================= */
  if (!enabled) {
    return (
      <Stack spacing={2}>
        {photos.map((p) => (
          <Card key={p._id} variant="outlined">
            {/* Photo from backend server */}
            <CardMedia
              component="img"
              image={`http://localhost:3001/images/${p.file_name}`}
              alt={p.file_name}
            />
            <CardContent>
              {/* Photo timestamp */}
              <Typography variant="body2" sx={{ mb: 1 }}>
                Taken: {prettyDate(p.date_time)}
              </Typography>

              {/* Comments */}
              {Array.isArray(p.comments) && p.comments.length > 0 && (
                <Stack spacing={1}>
                  <Divider />
                  <Typography variant="subtitle2">Comments</Typography>
                  {p.comments.map((c) => (
                    <div key={c._id}>
                      <Typography variant="body2">
                        <MuiLink component={Link} to={`/users/${c.user._id}`}>
                          <b>{c.user.first_name} {c.user.last_name}</b>
                        </MuiLink>
                        {': '}
                        {c.comment}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {prettyDate(c.date_time)}
                      </Typography>
                    </div>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  /* =======================
     Advanced ON → single-photo stepper
     ======================= */
  // While we're redirecting to a valid :photoId, show a small spinner
  if (index < 0) {
    return <CircularProgress size={24} />;
  }

  const p = photos[index];
  const atFirst = index === 0;
  const atLast = index === photos.length - 1;

  const goPrev = () => {
    if (!atFirst) navigate(`/photos/${userId}/${photos[index - 1]._id}`);
  };
  const goNext = () => {
    if (!atLast) navigate(`/photos/${userId}/${photos[index + 1]._id}`);
  };

  return (
    <Stack spacing={2}>
      {/* Stepper controls (accessible, no icon dependency) */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Button onClick={goPrev} disabled={atFirst}>← Previous</Button>
        <Typography variant="body2">Photo {index + 1} of {photos.length}</Typography>
        <Button onClick={goNext} disabled={atLast}>Next →</Button>
      </Stack>

      {/* Single photo + comments */}
      <Card variant="outlined">
        <CardMedia
          component="img"
          image={`http://localhost:3001/images/${p.file_name}`}
          alt={p.file_name}
        />
        <CardContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Taken: {prettyDate(p.date_time)}
          </Typography>

          {Array.isArray(p.comments) && p.comments.length > 0 && (
            <Stack spacing={1}>
              <Divider />
              <Typography variant="subtitle2">Comments</Typography>
              {p.comments.map((c) => (
                <div key={c._id}>
                  <Typography variant="body2">
                    <MuiLink component={Link} to={`/users/${c.user._id}`}>
                      <b>{c.user.first_name} {c.user.last_name}</b>
                    </MuiLink>
                    {': '} {c.comment}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {prettyDate(c.date_time)}
                  </Typography>
                </div>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Optional compact controls */}
      <Stack direction="row" spacing={1} alignSelf="center">
        <Button onClick={goPrev} disabled={atFirst}>← Prev</Button>
        <Button onClick={goNext} disabled={atLast}>Next →</Button>
      </Stack>
    </Stack>
  );
}

UserPhotos.propTypes = {
  userId: PropTypes.string,
  photoId: PropTypes.string,
};

UserPhotos.defaultProps = {
  userId: undefined,
  photoId: undefined,
};

export default UserPhotos;