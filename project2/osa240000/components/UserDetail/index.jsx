import React, { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';

import './styles.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

function UserDetail({ userId, onUserSelect }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`/user/${userId}`)
      .then((response) => {
        setUser(response.data);
        onUserSelect(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [userId]);

  return (
    <div className="user-detail-container">
      {user ? (
        <div>
          <h2>{user.first_name} {user.last_name}</h2>
          <p>Location: {user.location}</p>
          <p>Description: {user.description}</p>
          <p>Occupation: {user.occupation}</p>
          <Link to={`/photos/${userId}`}>View Photos</Link>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

UserDetail.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserDetail;
