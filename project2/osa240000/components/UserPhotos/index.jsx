import React, { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import axios from 'axios';

import './styles.css';
import { Button } from '@mui/material';

// A utility function to format the date
const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

function UserPhotos({ userId, adv }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const selectPhoto = (photo, updateUrl = true) => {
    setSelectedPhoto(photo);
    if (updateUrl) {
      const url = new URL(window.location);
      if (photo) {
        url.searchParams.set('photo', photo._id);
      } else {
        url.searchParams.delete('photo');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  // handle left right keys
  const handleButtons = (dir) => {
    const currentIndex = photos.findIndex((photo) => photo._id === selectedPhoto._id);
    console.log("CurrentIdnex", currentIndex);
    if (dir === 'left') {
      if (currentIndex > 0) {
        selectPhoto(photos[currentIndex - 1]);
      }
    } else if (dir === 'right') {
      if (currentIndex < photos.length - 1) {
        selectPhoto(photos[currentIndex + 1]);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    axios.get(`/photosOfUser/${userId}`)
      .then((response) => {
        const loadedPhotos = response.data;
        setPhotos(loadedPhotos);
        console.log("Total Photos: ", loadedPhotos.length);

        const params = new URLSearchParams(window.location.search);
        const photoIdFromUrl = params.get('photo');
        console.log("photoIdFromUrl", photoIdFromUrl);

        if (photoIdFromUrl) {
          const initialPhoto = loadedPhotos.find(p => p._id === photoIdFromUrl);
          if (initialPhoto) {
            console.log("Seeting inital photo");
            selectPhoto(initialPhoto);
          }
        } else if (adv && loadedPhotos.length > 0) {
          selectPhoto(loadedPhotos[0]);
        }
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

  if (!adv) {
    // not advanced
    return (
      <div>
        <div className="photoGrid">
          {photos.map((photo) => (
            <img
              key={photo._id}
              src={`/images/${photo.file_name}`}
              alt="User upload"
              className="photoItem"
              onClick={() => selectPhoto(photo)}
            />
          ))}
        </div>

        {selectedPhoto && (
          <div className="modalOverlay" role="presentation" onClick={() => selectPhoto(null)}>
            <button className="closeButton" onClick={() => selectPhoto(null)}>&times;</button>

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
  else {
    if (selectedPhoto === null) {
      selectPhoto(photos[0], false);
      return <p>Loading...</p>;
    }
    return (
      <div>
        <div className="modalImageContainer">
          <Button disabled={selectedPhoto._id === photos[0]._id} onClick={() => handleButtons("left")}>{"<"}</Button>
          <img
            src={`/images/${selectedPhoto.file_name}`}
            alt="Selected"
            className="modalImage"
          />
          <Button disabled={selectedPhoto._id === photos[photos.length - 1]._id} onClick={() => handleButtons("right")}>{">"}</Button>
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

    );
  }
}

UserPhotos.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserPhotos;