import React, { useState, useEffect } from 'react';

export const GLOBAL_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=60';

/**
 * Event handler for direct img tags: falls back to default image if loading fails
 */
export function handleImageFallback(e, fallbackUrl = GLOBAL_FALLBACK_IMAGE) {
  const target = e.currentTarget;
  if (target && target.src !== fallbackUrl) {
    target.src = fallbackUrl;
  }
}

/**
 * SafeImage component that automatically falls back to a high-resolution India travel landscape
 * if the image source fails to load or is invalid.
 */
export const SafeImage = ({
  src,
  alt = 'Travel destination',
  fallbackSrc = GLOBAL_FALLBACK_IMAGE,
  onError,
  className,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  return (
    <img
      src={hasError ? fallbackSrc : (imgSrc || fallbackSrc)}
      alt={alt}
      className={className}
      onError={(e) => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
        if (onError) {
          onError(e);
        }
      }}
      {...props}
    />
  );
};

export default SafeImage;
