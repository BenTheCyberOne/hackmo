import React, { useEffect, useState } from 'react';
import styles from './Banner.module.css';
const Banner = () => {
  const [bannerImage, setBannerImage] = useState(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Fetch the banner image from the server
    fetch('/imager?file=banner.jpg')
      .then((response) => {
        if (response.ok) {
          return response.blob();
        } else {
          throw new Error('Image not found');
        }
      })
      .then((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setBannerImage(imageUrl); // Set the image URL for display
      })
      .catch(() => {
        setIsError(true); // Handle any error (e.g., image not found)
      });
  }, []);

  return (
    <div className={styles.bannerContainer}>
      {isError ? (
        <div className={styles.bannerContainer}>Failed to load banner image</div>
      ) : (
        bannerImage && (
          <img
            src={bannerImage}
            alt="Banner"
            className={styles.bannerImage}
            loading="lazy"
          />
        )
      )}
    </div>
  );
};

export default Banner;
