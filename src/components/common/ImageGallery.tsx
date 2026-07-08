import { useEffect, useState } from 'react';
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

import Image from '@/components/common/Image';
import { UploadIcon } from '@/icons/icons';
import { useBoundStore } from '@/store/boundStore';
import { getCopy } from '@/utils/copyHelpers';

import styles from './ImageGallery.module.css';

interface Props {
  opened: boolean;
  images: Array<string>;
  selectedImage: string;
  onSelectImage: (imageUrl: string) => void;
  onClose: () => void;
  setUploadFile: (file: File | null) => void;
}

const ITEMS_PER_PAGE = 6;

function ImageGallery({
  opened,
  images,
  selectedImage: initialImage,
  onSelectImage,
  onClose,
  setUploadFile
}: Props) {
  const resetAsyncPreSubmitOperation = useBoundStore(
    (state) => state.resetAsyncPreSubmitOperation
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedImage, setSelectedImage] = useState(initialImage);

  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const imagesToDisplay = images.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // The modal stays mounted (visibility is driven by `opened`), so re-sync the local
  // selection whenever the incoming image changes - e.g. when reopened for a new value
  useEffect(() => {
    setSelectedImage(initialImage);
  }, [initialImage]);

  function handleDrop(files: File[]) {
    const [file] = files;
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setUploadFile(file);
    }
  }

  // Closing (X / Esc / click-away / Cancel) discards any pending upload operation
  function handleCancel() {
    resetAsyncPreSubmitOperation();
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleCancel}
      title={getCopy('ImageGallery', 'image_gallery')}
      centered
      size={520}
    >
      <Stack gap={'md'}>
        <Text size={'sm'} c={'dimmed'}>
          {getCopy('ImageGallery', 'choose_an_image')}
        </Text>
        <SimpleGrid cols={2} spacing={'sm'}>
          <Stack gap={'xs'}>
            <Text size={'sm'} fw={500}>
              {getCopy('ImageGallery', 'seleted_image:')}
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
              {getCopy('ImageGallery', 'upload_new_image:')}
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
                    {getCopy('ImageGallery', 'upload')}
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
              onClick={() => setSelectedImage(image)}
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
            {getCopy('ImageGallery', 'cancel')}
          </Button>
          <Button
            disabled={selectedImage.length === 0}
            onClick={() => {
              onSelectImage(selectedImage);
              onClose();
            }}
          >
            {getCopy('ImageGallery', 'add_image')}
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

export default ImageGallery;
