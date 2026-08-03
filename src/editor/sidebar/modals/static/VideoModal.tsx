import { useState } from 'react';
import { Stack, Text, TextInput } from '@mantine/core';

import { VideoContent } from '@/components/VideoContent';
import { VideoComponent } from '@/store';
import { getCopy } from '@/utils/copyHelpers';

interface Props {
  component: VideoComponent | null;
  handleComponentData: (data: Partial<VideoComponent>) => void;
}

function VideoModal({ component, handleComponentData }: Props) {
  const [url, setUrl] = useState(component?.url || '');

  function handleUrlChange(value: string) {
    setUrl(value);
    handleComponentData({ url: value });
  }
  return (
    <Stack gap={'md'}>
      <TextInput
        label={getCopy('Video', 'video')}
        placeholder={'URL'}
        value={url}
        onChange={(e) => handleUrlChange(e.currentTarget.value)}
      />
      <Text size={'sm'} c={'dimmed'} mt={'xs'} mb={'md'}>
        {getCopy('Video', 'video_helper_text')}
      </Text>
      <VideoContent url={url} />
    </Stack>
  );
}

export { VideoModal };
