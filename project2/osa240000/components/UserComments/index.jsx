import React, { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import axios from 'axios';

import './styles.css';
import { Link } from 'react-router-dom';

// A utility function to format the date
const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

function UserComments({ userId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`/commentsOfUser/${userId}`)
      .then((response) => {
        const loadedPhotos = response.data;
        setPhotos(loadedPhotos.map(p => {
          return {
            ...p.comments[0],
            photo_file_name: p.file_name,
            photo_id: p._id
          };
        }));
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch user comments:', error);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="comment-table-container">
      <h2>All Comments</h2>
      <table className="comment-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Comment</th>
            <th>Date & Time</th>
          </tr>
        </thead>
        <tbody>
          {photos.map((comment) => (
            <tr key={comment._id}>
              <td>
                <Link to={`/photos/${comment.user_id}?photo=${comment.photo_id}`}>
                  <img
                    src={`/images/${comment.photo_file_name}`}
                    alt="Thumbnail"
                    className="comment-thumbnail"
                  />
                </Link>
              </td>
              <td className="comment-text-cell"><Link to={`/photos/${comment.user_id}?photo=${comment.photo_id}`}>{comment.comment}</Link></td>
              <td className="comment-date-cell">
                {formatDate(comment.date_time)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  );
}

UserComments.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserComments;