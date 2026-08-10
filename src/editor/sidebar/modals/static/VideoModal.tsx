import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Text, TextInput } from '@mantine/core';

import { VideoContent } from '@/components/VideoContent';
import { VideoComponent } from '@/store';

interface Props {
  component: VideoComponent | null;
  handleComponentData: (data: Partial<VideoComponent>) => void;
}

function VideoModal({ component, handleComponentData }: Props) {
  const { t } = useTranslation('video');
  const [url, setUrl] = useState(component?.url || '');

  function handleUrlChange(value: string) {
    setUrl(value);
    handleComponentData({ url: value });
  }
  return (
    <Stack gap={'md'}>
      <TextInput
        label={t('video')}
        placeholder={'URL'}
        value={url}
        onChange={(e) => handleUrlChange(e.currentTarget.value)}
      />
      <Text size={'sm'} c={'dimmed'} mt={'xs'} mb={'md'}>
        {t('video-helper-text')}
      </Text>
      <VideoContent url={url} />
    </Stack>
  );
}

export { VideoModal };
