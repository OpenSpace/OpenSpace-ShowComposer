import React, { useState, useEffect } from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc: string;
}

const Image: React.FC<ImageProps> = ({ src, fallbackSrc, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  useEffect(() => {
    // Set imgSrc to the new src whenever the src prop changes
    setImgSrc(src);
  }, [src]);
  const onError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  return <img src={imgSrc} alt={alt} onError={onError} {...props} />;
};

export default Image;
