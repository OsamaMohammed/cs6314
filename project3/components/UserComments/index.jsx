import React, { useEffect, useState } from 'react';
import {
  CircularProgress,
  Typography,
  Paper,
  Divider,
  Stack,
  Box,
  Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import { useAdvanced } from '../../contexts/AdvancedContext';

function prettyDate(s) {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString();
}
const toId = (v) => (v == null ? '' : String(v));

function UserComments() {
  const { userId } = useParams();          // owner of the photos we're listing comments from
  const { enabled } = useAdvanced();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState(null); // photos owned by :userId
  const [user, setUser] = useState(null);     // for empty-state text
  const [err, setErr] = useState(null);

  // If Advanced is OFF, go back to the user detail page
  useEffect(() => {
    if (!enabled) navigate(`/users/${userId}`, { replace: true });
  }, [enabled, navigate, userId]);

  // Load photos for this owner (same endpoint UserPhotos uses) + user info for empty-state text
  useEffect(() => {
    if (!enabled) return undefined;
    let live = true;
    setPhotos(null);
    setErr(null);

    axios
      .get(`http://localhost:3001/photosOfUser/${userId}`)
      .then(({ data }) => { if (live) setPhotos(Array.isArray(data) ? data : []); })
      .catch((e) => { if (live) setErr(e.message || String(e)); });

    axios
      .get(`http://localhost:3001/user/${userId}`)
      .then(({ data }) => { if (live) setUser(data || null); })
      .catch(() => { if (live) setUser(null); });

    return () => { live = false; };
  }, [enabled, userId]);

  if (err) return <Typography color="error">Failed to load comments: {err}</Typography>;
  if (!photos) return <CircularProgress size={24} />;

  // Build rows: one row per comment (even if multiple comments on the same photo)
  const rows = [];
  for (const p of photos) {
    const photoId = toId(p._id);
    const file = p.file_name;
    const cs = Array.isArray(p.comments) ? p.comments : [];
    for (const c of cs) {
      const commentId = toId(c._id) || `${toId(c.comment)}::${toId(c.date_time)}`;
      rows.push({
        key: `${photoId}:${commentId}`,
        photoId,
        file,
        text: c.comment,
        when: c.date_time,
        author: c.user, // matches shape used in UserPhotos
      });
    }
  }

  // Newest first (stable enough for this view)
  rows.sort((a, b) => new Date(b.when) - new Date(a.when));

  if (rows.length === 0) {
    const name = user ? `${user.first_name} ${user.last_name}` : 'this user';
    return <Typography>No comments on {name}&apos;s photos.</Typography>;
  }

  return (
    <Stack spacing={2}>
      {/* No inline header; TopBar shows "<User Name>'s Comments" */}
      {rows.map((r, i) => (
        <Paper
          key={r.key}
          variant="outlined"
          sx={{ overflow: 'hidden', cursor: 'pointer' }}
          onClick={() => navigate(`/photos/${userId}/${r.photoId}`)}
        >
          <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
            {/* Thumbnail (repeat even if same photo) */}
            {r.file ? (
              <img
                src={`http://localhost:3001/images/${r.file}`}
                alt={r.file}
                style={{ width: 120, height: 120, objectFit: 'cover' }}
                loading="lazy"
              />
            ) : (
              <Box sx={{ width: 120, height: 120, bgcolor: 'action.hover' }} />
            )}

            {/* Comment content */}
            <Box sx={{ p: 2, flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {r.author ? (
                  <>
                    <MuiLink component={Link} to={`/users/${r.author._id}`}>
                      <b>{r.author.first_name} {r.author.last_name}</b>
                    </MuiLink>
                    {': '}
                  </>
                ) : null}
                {r.text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {prettyDate(r.when)}
              </Typography>
            </Box>
          </Box>
          {i < rows.length - 1 && <Divider />}
        </Paper>
      ))}
    </Stack>
  );
}

export default UserComments;