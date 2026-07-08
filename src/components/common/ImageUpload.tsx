import { type ChangeEvent, useEffect, useState } from 'react';
import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { useBoundStore } from '@/store/boundStore';
import { getCopy } from '@/utils/copyHelpers';
import { fetchGalleryImages, uploadImage } from '@/utils/saveProject';

import ImageGallery from './ImageGallery';

interface Props {
  value: string;
  onChange: (url: string) => void;
  componentId?: string;
}

function ImageUpload({ value, onChange }: Props) {
  const setAsyncPreSubmitOperation = useBoundStore(
    (state) => state.setAsyncPreSubmitOperation
  );
  const [image, setImage] = useState<string>(value || '');
  const [file, setFile] = useState<File | null>(null);
  const [galleryOpened, { open: openGallery, close: closeGallery }] =
    useDisclosure(false);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const loadGalleryImages = async () => {
      try {
        const images = await fetchGalleryImages();
        setGalleryImages(images);
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      }
    };
    loadGalleryImages();
  }, []);

  // When a file is chosen, register the pre-submit operation that uploads it and
  // reports the resulting path back to the parent.
  useEffect(() => {
    if (!file) {
      return;
    }
    setAsyncPreSubmitOperation(async () => {
      try {
        const filePath = await uploadImage(file);
        onChange(filePath);
      } catch (error) {
        console.error('Failed to save image:', error);
      }
    });
  }, [file, onChange, setAsyncPreSubmitOperation]);

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
        {getCopy('ImageUpload', 'set_image_url')}
      </Text>
      <Group align={'center'} gap={'sm'} wrap={'nowrap'}>
        <TextInput
          flex={4}
          placeholder={'Set Image URL'}
          value={value}
          onChange={handleURLChange}
        />
        <Text flex={1} ta={'center'}>
          {getCopy('ImageUpload', 'or')}
        </Text>
        <Button flex={2} onClick={openGallery}>
          {getCopy('ImageUpload', 'select_image')}
        </Button>
      </Group>
      <ImageGallery
        opened={galleryOpened}
        images={galleryImages}
        selectedImage={image || ''}
        onClose={closeGallery}
        onSelectImage={handleSelectImage}
        setUploadFile={setFile}
      />
    </Stack>
  );
}

export default ImageUpload;
