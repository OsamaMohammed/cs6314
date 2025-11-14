import React, { useEffect, useMemo, useState } from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Chip,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

import './styles.css';
import { useAdvanced } from '../../contexts/AdvancedContext';

function UserList() {
  const navigate = useNavigate();
  const { enabled } = useAdvanced();

  const [users, setUsers] = useState(null);
  const [counts, setCounts] = useState({}); // { [userId]: { photos, comments } }
  const [err, setErr] = useState(null);

  // Load user list
  useEffect(() => {
    let live = true;
    setUsers(null);
    setErr(null);

    axios
      .get('http://localhost:3001/user/list')
      .then(({ data }) => { if (live) setUsers(data || []); })
      .catch((e) => { if (live) setErr(e.message); });

    return () => { live = false; };
  }, []);

  // When advanced is ON, compute bubbles from /photosOfUser/:id
  useEffect(() => {
    if (!enabled || !Array.isArray(users)) return undefined;

    let cancelled = false;

    (async () => {
      const next = {};
      // Fetch all user photo data in parallel instead of awaiting in a loop
      const promises = users.map(async (u) => {
        try {
          const { data } = await axios.get(`http://localhost:3001/photosOfUser/${u._id}`);
          const photos = Array.isArray(data) ? data : [];

          const photoCount = photos.length;
          const commentCount = photos.reduce((acc, p) => {
            const cs = Array.isArray(p.comments) ? p.comments : [];
            return acc + cs.length;
          }, 0);

          return { userId: u._id, photos: photoCount, comments: commentCount };
        } catch {
          return { userId: u._id, photos: 0, comments: 0 };
        }
      });

      const results = await Promise.all(promises);
      
      if (cancelled) return;
      
      results.forEach((result) => {
        next[result.userId] = { photos: result.photos, comments: result.comments };
      });
      
      setCounts(next);
    })();

    return () => { cancelled = true; };
  }, [enabled, users]);

  const content = useMemo(() => {
    if (err) return <Typography color="error">Failed to load users: {err}</Typography>;
    if (!users) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
          <CircularProgress size={20} />
        </div>
      );
    }

    return (
      <List component="nav" dense>
        {users.map((u, i) => {
          const c = counts[u._id] || {};
          return (
            <React.Fragment key={u._id}>
              <ListItem
                disableGutters
                secondaryAction={(
                  <Stack direction="row" spacing={1} alignItems="center">
                    {enabled && (
                      <>
                        {/* Green = #photos */}
                        <Chip
                          size="small"
                          label={c.photos ?? '…'}
                          color="success"
                          sx={{ minWidth: 28, justifyContent: 'center' }}
                          title="Photo count"
                        />
                        {/* Red = total #comments authored (across their photos) */}
                        <Chip
                          size="small"
                          label={c.comments ?? '…'}
                          color="error"
                          sx={{ minWidth: 28, justifyContent: 'center', cursor: 'pointer' }}
                          title="View comments by this user"
                          onClick={() => navigate(`/comments/${u._id}`)}
                        />
                      </>
                    )}
                    <RouterLink to={`/photos/${u._id}`}>Photos</RouterLink>
                  </Stack>
                )}
              >
                <ListItemText
                  primary={<RouterLink to={`/users/${u._id}`}>{u.first_name} {u.last_name}</RouterLink>}
                />
              </ListItem>
              {i < users.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </List>
    );
  }, [users, counts, enabled, err, navigate]);

  return content;
}

export default UserList;