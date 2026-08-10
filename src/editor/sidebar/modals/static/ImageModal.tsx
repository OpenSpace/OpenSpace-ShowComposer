import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputLabel, Stack } from '@mantine/core';

import { ImageUpload } from '@/components/ImageUpload/ImageUpload';
import { ImageComponent } from '@/store';

interface Props {
  component: ImageComponent | null;
  handleComponentData: (data: Partial<ImageComponent>) => void;
}

function ImageModal({ component, handleComponentData }: Props) {
  const { t } = useTranslation('image');
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
      <InputLabel>{t('image')}</InputLabel>
      <ImageUpload value={url} onChange={handleImageChange} />
    </Stack>
  );
}

export { ImageModal };
