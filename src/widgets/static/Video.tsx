import { useEffect, useState } from 'react';
import { Center, Stack, Text, TextInput } from '@mantine/core';

import { VideoComponent } from '@/store';
import { getCopy } from '@/utils/copyHelpers';

const getVideoContent = (url: string) => {
  const youtubePattern =
    /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const vimeoPattern =
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
  const youtubeMatch = url.match(youtubePattern);
  const vimeoMatch = url.match(vimeoPattern);
  if (youtubeMatch) {
    return (
      <iframe
        title={'YouTube video player'}
        src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
        frameBorder={'0'}
        allow={
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        }
        allowFullScreen
        style={{ height: '100%', width: '100%' }}
      ></iframe>
    );
  } else if (vimeoMatch) {
    return (
      <iframe
        title={'Vimeo video player'}
        src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
        frameBorder={'0'}
        allow={'autoplay; fullscreen; picture-in-picture'}
        allowFullScreen
        style={{ height: '100%', width: '100%' }}
      ></iframe>
    );
  } else if (url) {
    return <video src={url} controls style={{ height: '100%', width: '100%' }} />;
  }
  return null;
};

interface VideoGUIProps {
  component: VideoComponent;
}

function VideoGUIComponent({ component }: VideoGUIProps) {
  return (
    <Center
      pos={'absolute'}
      top={0}
      right={0}
      h={'100%'}
      w={'100%'}
      style={{ borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden' }}
    >
      {getVideoContent(component.url)}
    </Center>
  );
}

interface VideoModalProps {
  component: VideoComponent | null;
  handleComponentData: (data: Partial<VideoComponent>) => void;
}

function VideoModal({ component, handleComponentData }: VideoModalProps) {
  const [url, setUrl] = useState(component?.url || '');
  useEffect(() => {
    handleComponentData({
      url
    });
  }, [url, handleComponentData]);
  return (
    <Stack gap={'md'}>
      <TextInput
        label={getCopy('Video', 'video')}
        placeholder={'URL'}
        value={url}
        onChange={(e) => setUrl(e.currentTarget.value)}
      />
      <Text size={'sm'} c={'dimmed'} mt={'xs'} mb={'md'}>
        {getCopy('Video', 'video_helper_text')}
      </Text>
      {url && getVideoContent(url)}
    </Stack>
  );
}

export { VideoGUIComponent, VideoModal };
