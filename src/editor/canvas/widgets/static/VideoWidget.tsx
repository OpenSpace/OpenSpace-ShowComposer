import { Center } from '@mantine/core';

import { VideoContent } from '@/editor/canvas/widgets/static/VideoContent';
import { VideoComponent } from '@/store';

interface Props {
  component: VideoComponent;
}

function VideoWidget({ component }: Props) {
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

export { VideoWidget };
