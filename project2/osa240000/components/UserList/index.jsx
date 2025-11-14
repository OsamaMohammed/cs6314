import React, { Fragment, useEffect, useState } from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

import './styles.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

function UserList() {

  const [users, setUsers] = useState([]);
  useEffect(() => {
    axios.get('/user/list').then(({ data }) => setUsers(data));
  }, []);

  return (
    <div>
      <List component="nav">
        {users.map((user, idx) => (
          <Fragment key={user._id || idx}>
            <ListItem className='side_users'>
              <Link to={`/users/${user._id}`}>
                <ListItemText primary={user.first_name} />
              </Link>
              <p>
                <span className='pp'><Link to={`/photos/${user._id}`}>{user.photoCount}</Link></span> {" "}
                <span className='cc'><Link to={`/comments/${user._id}`}>{user.commentCount}</Link></span>
              </p>
            </ListItem>
            <Divider />
          </Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;
