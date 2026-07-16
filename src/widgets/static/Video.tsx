import { useState } from 'react';
import { Center, Stack, Text, TextInput } from '@mantine/core';

import { VideoComponent } from '@/store';
import { getCopy } from '@/utils/copyHelpers';

const YOUTUBE_PATTERN =
  /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const VIMEO_PATTERN =
  /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)(?:$|\/|\?)/;

interface VideoContentProps {
  url: string;
}

// Renders a YouTube/Vimeo embed for a matching URL, a raw <video> for any other
// non-empty URL, or nothing when the URL is empty
function VideoContent({ url }: VideoContentProps) {
  const youtubeMatch = url.match(YOUTUBE_PATTERN);
  const vimeoMatch = url.match(VIMEO_PATTERN);

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
}

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
      <VideoContent url={component.url} />
    </Center>
  );
}

interface VideoModalProps {
  component: VideoComponent | null;
  handleComponentData: (data: Partial<VideoComponent>) => void;
}

function VideoModal({ component, handleComponentData }: VideoModalProps) {
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

export { VideoGUIComponent, VideoModal };
