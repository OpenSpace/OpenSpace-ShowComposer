import { useCallback, useState } from 'react';
import { InputLabel, Stack } from '@mantine/core';

import { ImageUpload } from '@/components/ImageUpload/ImageUpload';
import { ImageComponent } from '@/store';
import { getCopy } from '@/utils/copyHelpers';

interface Props {
  component: ImageComponent | null;
  handleComponentData: (data: Partial<ImageComponent>) => void;
}

function ImageModal({ component, handleComponentData }: Props) {
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

export { ImageModal };
