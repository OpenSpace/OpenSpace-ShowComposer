import { useCallback, useState } from 'react';
import { Image, InputLabel, Stack } from '@mantine/core';

import ImageUpload from '@/components/ImageUpload';
import { ImageComponent } from '@/store';
import { getCopy } from '@/utils/copyHelpers';

interface ImageGUIProps {
  component: ImageComponent;
}

function ImageGUIComponent({ component }: ImageGUIProps) {
  return (
    <Image
      src={component.backgroundImage}
      pos={'absolute'}
      top={0}
      right={0}
      h={'100%'}
      w={'100%'}
      fit={'cover'}
      radius={'md'}
    />
  );
}

interface ImageModalProps {
  component: ImageComponent | null;
  handleComponentData: (data: Partial<ImageComponent>) => void;
}

function ImageModal({ component, handleComponentData }: ImageModalProps) {
  const [url, setUrl] = useState(component?.backgroundImage || '');

  const handleImageChange = useCallback(
    (value: string) => {
      setUrl(value);
      handleComponentData({ backgroundImage: value });
    },
    [handleComponentData]
  );

  return (
    <Stack gap={'md'}>
      <InputLabel>{getCopy('Image', 'image')}</InputLabel>
      <ImageUpload value={url} onChange={handleImageChange} />
    </Stack>
  );
}

export { ImageGUIComponent, ImageModal };
