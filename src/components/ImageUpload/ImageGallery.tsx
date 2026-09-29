import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AspectRatio,
  Button,
  Card,
  Group,
  Modal,
  Pagination,
  SimpleGrid,
  Stack,
  Text
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';

import { uploadImage } from '@/api/showbuilder';
import { Image } from '@/components/Image';
import { UploadIcon } from '@/icons/icons';

import styles from './ImageGallery.module.css';

interface Props {
  opened: boolean;
  images: Array<string>;
  selectedImage: string;
  onSelectImage: (imageUrl: string) => void;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 6;

function ImageGallery({
  opened,
  images,
  selectedImage: initialImage,
  onSelectImage,
  onClose
}: Props) {
  const { t } = useTranslation('image-gallery');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const imagesToDisplay = images.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setSelectedImage(initialImage);
  }, [initialImage]);

  function handleDrop(files: File[]) {
    const [file] = files;
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setDroppedFile(file);
    }
  }

  async function handleAddImage() {
    if (droppedFile) {
      setUploading(true);
      try {
        const path = await uploadImage(droppedFile);
        onSelectImage(path);
      } catch (error) {
        console.error('Failed to upload image:', error);
        setUploading(false);
        return; // keep the gallery open so the user can retry
      }
      setUploading(false);
      setDroppedFile(null);
    } else {
      onSelectImage(selectedImage);
    }
    onClose();
  }

  function handleCancel() {
    setDroppedFile(null);
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleCancel}
      title={t('image-gallery')}
      centered
      size={520}
    >
      <Stack gap={'md'}>
        <Text size={'sm'} c={'dimmed'}>
          {t('choose-an-image')}
        </Text>
        <SimpleGrid cols={2} spacing={'sm'}>
          <Stack gap={'xs'}>
            <Text size={'sm'} fw={500}>
              {t('seleted-image')}
            </Text>
            <Card withBorder radius={'md'} padding={0} style={{ overflow: 'hidden' }}>
              <AspectRatio ratio={1}>
                <Image
                  alt={'Selected image'}
                  src={selectedImage || initialImage}
                  fit={'cover'}
                />
              </AspectRatio>
            </Card>
          </Stack>
          <Stack gap={'xs'}>
            <Text size={'sm'} fw={500}>
              {t('upload-new-image')}
            </Text>
            <AspectRatio ratio={1}>
              <Dropzone
                onDrop={handleDrop}
                accept={['image/*']}
                multiple={false}
                styles={{
                  inner: {
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }
                }}
              >
                <Stack align={'center'} gap={'xs'}>
                  <UploadIcon size={32} />
                  <Text size={'sm'} ta={'center'}>
                    {t('upload')}
                  </Text>
                </Stack>
              </Dropzone>
            </AspectRatio>
          </Stack>
        </SimpleGrid>
        <SimpleGrid cols={3} spacing={'sm'}>
          {imagesToDisplay.map((image) => (
            <Card
              key={image}
              withBorder
              radius={'md'}
              padding={0}
              className={styles.thumbnail}
              onClick={() => {
                setSelectedImage(image);
                setDroppedFile(null);
              }}
              style={{ overflow: 'hidden', cursor: 'pointer' }}
            >
              <AspectRatio ratio={1}>
                <Image alt={'Uploaded image'} src={image} fit={'cover'} />
              </AspectRatio>
            </Card>
          ))}
          {Array.from({ length: ITEMS_PER_PAGE - imagesToDisplay.length }, (_, index) => (
            <Card
              key={`placeholder-${index}`}
              withBorder
              radius={'md'}
              padding={0}
              style={{ opacity: 0.4 }}
            >
              <AspectRatio ratio={1} />
            </Card>
          ))}
        </SimpleGrid>
        <Group justify={'flex-end'} gap={'sm'}>
          <Button variant={'outline'} onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button
            loading={uploading}
            disabled={selectedImage.length === 0}
            onClick={handleAddImage}
          >
            {t('add-image')}
          </Button>
        </Group>
        {totalPages > 1 && (
          <Group justify={'center'}>
            <Pagination
              total={totalPages}
              value={currentPage + 1}
              onChange={(page) => setCurrentPage(page - 1)}
            />
          </Group>
        )}
      </Stack>
    </Modal>
  );
}

export { ImageGallery };
