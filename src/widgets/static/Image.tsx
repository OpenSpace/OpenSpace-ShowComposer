import { useCallback, useEffect, useState } from 'react';
import { Box, InputLabel, Stack } from '@mantine/core';

import ImageUpload from '@/components/ImageUpload';
import { ImageComponent } from '@/store';
import { getCopy } from '@/utils/copyHelpers';

interface ImageGUIProps {
  component: ImageComponent;
}

function ImageGUIComponent({ component }: ImageGUIProps) {
  return (
    <Box
      pos={'absolute'}
      top={0}
      right={0}
      h={'100%'}
      w={'100%'}
      style={{
        cursor: 'pointer',
        borderRadius: 'var(--mantine-radius-md)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url(${component.backgroundImage})`
      }}
    />
  );
}

interface ImageModalProps {
  component: ImageComponent | null;
  handleComponentData: (data: Partial<ImageComponent>) => void;
}

function ImageModal({ component, handleComponentData }: ImageModalProps) {
  const [url, setUrl] = useState(component?.backgroundImage || '');
  useEffect(() => {
    handleComponentData({
      backgroundImage: url
    });
  }, [url, handleComponentData]);

  const handleImageChange = useCallback((value: string) => setUrl(value), [setUrl]);

  return (
    <Stack gap={'md'}>
      <InputLabel>{getCopy('Image', 'image')}</InputLabel>
      <ImageUpload value={url} onChange={handleImageChange} />
    </Stack>
  );
}

export { ImageGUIComponent, ImageModal };
