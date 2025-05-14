import React, { useEffect,useState } from 'react';
import { Image as LucideImage } from 'lucide-react'; // Ensure you have the correct import path

import { cn } from '@/lib/utils';
interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}
const Image: React.FC<ImageProps> = ({ src, alt, ...props }) => {
  const [imageError, setImageError] = useState(false);
  useEffect(() => {
    setImageError(false);
  }, [src]);
  const onError = () => {
    setImageError(true);
  };
  return (
    <>
      {!imageError ? (
        <img
          className={props.className}
          src={src}
          alt={alt}
          onError={onError}
          {...props}
        />
      ) : (
        <div
          className={cn(
            'flex aspect-square w-full items-center justify-center rounded-md border border-dashed',
            props.className
          )}
        >
          <LucideImage className={"text-muted-foreground h-8 h-8"} />
        </div>
      )}
    </>
  );
};
export default Image;
