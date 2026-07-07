import { useEffect, useState } from 'react';
import { Center, Image as MantineImage, type MantineStyleProps } from '@mantine/core';

import { ImageIcon } from '@/icons/icons';

interface Props extends MantineStyleProps {
  src: string;
  alt?: string;
  className?: string;
}

function Image({ src, alt, className, ...props }: Props) {
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
      onError={() => setImageError(true)}
      {...props}
    />
  );
}

export default Image;
