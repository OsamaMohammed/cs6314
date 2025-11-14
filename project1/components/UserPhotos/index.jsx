import React, { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import axios from 'axios';

import './styles.css';

// A utility function to format the date
const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

function UserPhotos({ userId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`/photosOfUser/${userId}`)
      .then((response) => {
        setPhotos(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch user photos:', error);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return <p>Loading photos...</p>;
  }

  if (photos.length === 0) {
    return <p>This user has not posted any photos yet.</p>;
  }

  return (
    <div>
      <div className="photoGrid">
        {photos.map((photo) => (
          <img
            key={photo._id}
            src={`/images/${photo.file_name}`}
            alt="User upload"
            className="photoItem"
            onClick={() => setSelectedPhoto(photo)}
          />
        ))}
      </div>

      {selectedPhoto && (
        <div className="modalOverlay" role="presentation" onClick={() => setSelectedPhoto(null)}>
          <button className="closeButton" onClick={() => setSelectedPhoto(null)}>&times;</button>

          <div className="modalContent" role="presentation" onClick={(e) => e.stopPropagation()}>
            <div className="modalImageContainer">
              <img
                src={`/images/${selectedPhoto.file_name}`}
                alt="Selected"
                className="modalImage"
              />
            </div>

            <div className="modalComments">
              <h3>Comments</h3>
              <p className='comment-text'>
                Posted on: {formatDate(selectedPhoto.date_time)}
              </p>

              {selectedPhoto.comments && selectedPhoto.comments.length > 0 ? (
                selectedPhoto.comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    <p>
                      <strong>
                        {`${comment.user.first_name} ${comment.user.last_name}`}
                      </strong>
                      <span className='comment-text'>
                        {formatDate(comment.date_time)}
                      </span>
                    </p>
                    <p>{comment.comment}</p>
                  </div>
                ))
              ) : (
                <p>No comments yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

UserPhotos.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserPhotos;