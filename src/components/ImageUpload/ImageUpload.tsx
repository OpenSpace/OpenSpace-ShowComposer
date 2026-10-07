import { type ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { fetchGalleryImages } from '@/api/showbuilder';

import { ImageGallery } from './ImageGallery';

interface Props {
  value: string;
  onChange: (url: string) => void;
  componentId?: string;
}

function ImageUpload({ value, onChange }: Props) {
  const { t } = useTranslation('image-upload');
  const [image, setImage] = useState<string>(value || '');
  const [galleryOpened, { open: openGallery, close: closeGallery }] =
    useDisclosure(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  useEffect(() => {
    async function loadGalleryImages() {
      try {
        const images = await fetchGalleryImages();
        setGalleryImages(images);
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      }
    }
    loadGalleryImages();
  }, []);

  function handleSelectImage(imagePath: string) {
    onChange(imagePath);
    setImage(imagePath);
    closeGallery();
  }

  function handleURLChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.currentTarget.value);
    setImage(event.currentTarget.value);
  }

  return (
    <Stack gap={'md'}>
      <Text size={'sm'} fw={500}>
        {t('set-image-url')}
      </Text>
      <Group align={'center'} gap={'sm'} wrap={'nowrap'}>
        <TextInput
          flex={4}
          placeholder={'Set Image URL'}
          value={value}
          onChange={handleURLChange}
        />
        <Text flex={1} ta={'center'}>
          {t('or')}
        </Text>
        <Button flex={2} onClick={openGallery}>
          {t('select-image')}
        </Button>
      </Group>
      <ImageGallery
        opened={galleryOpened}
        images={galleryImages}
        selectedImage={image || ''}
        onClose={closeGallery}
        onSelectImage={handleSelectImage}
      />
    </Stack>
  );
}

export { ImageUpload };
