import { Image } from '@mantine/core';

import { ImageComponent } from '@/store';

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

export { ImageGUIComponent };
