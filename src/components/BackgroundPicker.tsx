import { useCallback } from 'react';
import { SimpleGrid, Stack, Text } from '@mantine/core';

import { getCopy } from '@/utils/copyHelpers';

import ColorPicker from './ColorPicker';
import Image from './Image';
import ImageUpload from './ImageUpload';

interface Props {
  color: string;
  setColor: (color: string) => void;
  backgroundImage: string;
  setBackgroundImage: (image: string) => void;
  componentId?: string;
}

function BackgroundPicker({
  color,
  setColor,
  backgroundImage,
  setBackgroundImage
}: Props) {
  const handleImageChange = useCallback(
    (image: string) => setBackgroundImage(image),
    [setBackgroundImage]
  );

  return (
    <Stack gap={'md'}>
      <SimpleGrid cols={2} spacing={'md'}>
        <Stack gap={'md'}>
          <Text size={'sm'} fw={500}>
            Background Color
          </Text>
          <ColorPicker color={color} setColor={setColor} />
        </Stack>
        <Stack gap={'md'}>
          <Text size={'sm'} fw={500}>
            {getCopy('Focus', 'background_image')}
          </Text>
          <Image
            w={backgroundImage.length > 0 ? 128 : 64}
            h={backgroundImage.length > 0 ? 128 : 64}
            fit={'cover'}
            src={backgroundImage || ''}
            alt={'Loaded'}
          />
        </Stack>
      </SimpleGrid>
      <ImageUpload value={backgroundImage} onChange={handleImageChange} />
    </Stack>
  );
}

export default BackgroundPicker;
