import { type CSSProperties, useEffect, useState } from 'react';
import {
  Center,
  Image as MantineImage,
  type MantineRadius,
  type MantineStyleProps
} from '@mantine/core';

import { ImageIcon } from '@/icons/icons';

interface Props extends MantineStyleProps {
  src: string;
  alt?: string;
  className?: string;
  fit?: CSSProperties['objectFit'];
  radius?: MantineRadius;
}

function Image({ src, alt, className, fit, radius, ...props }: Props) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  if (imageError) {
    return (
      <Center
        className={className}
        style={{
          borderRadius: 'var(--mantine-radius-md)',
          border: '1px dashed var(--mantine-color-default-border)'
        }}
        {...props}
      >
        <ImageIcon size={24} />
      </Center>
    );
  }

  return (
    <MantineImage
      className={className}
      src={src}
      alt={alt}
      fit={fit}
      radius={radius}
      onError={() => setImageError(true)}
      {...props}
    />
  );
}

export { Image };
