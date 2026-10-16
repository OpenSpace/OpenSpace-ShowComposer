import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Center, Group, Stack, Text, UnstyledButton } from '@mantine/core';

import type { Show } from '@/api/showbuilder';
import { Pagination } from '@/components/Pagination';

interface Props {
  shows: Show[];
  onLoadShow: (show: Show) => void;
  onClose: () => void;
}

export function LoadShowModal({ shows, onLoadShow, onClose }: Props) {
  const { t } = useTranslation('load-show-modal');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(shows.length / itemsPerPage);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const showsToDisplay = shows
    .sort(
      (a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
    .slice(startIndex, endIndex);

  return (
    <>
      <Stack gap={'xs'}>
        {showsToDisplay.map((show) => (
          <UnstyledButton
            key={show.filePath}
            w={'100%'}
            onClick={() => setSelectedShow(show)}
          >
            <Card
              p={'xs'}
              withBorder
              bg={'transparent'}
              // An outline, unlike a border, does not change the size of the card
              style={{
                outline:
                  selectedShow?.filePath === show.filePath
                    ? '2px solid var(--mantine-color-blue-5)'
                    : undefined
              }}
            >
              <Text size={'sm'}>{show.projectName}</Text>
              <Text size={'xs'} c={'dimmed'}>
                {t('last-modified', {
                  date: new Date(show.lastModified).toLocaleString()
                })}
              </Text>
              <Text size={'xs'} c={'dimmed'}>
                {t('created', { date: new Date(show.created).toLocaleString() })}
              </Text>
            </Card>
          </UnstyledButton>
        ))}
      </Stack>
      <Center pos={'relative'} h={96}>
        <Pagination
          currentIndex={currentPage}
          length={totalPages}
          setIndex={setCurrentPage}
        />
      </Center>
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={onClose}>
          {t('cancel')}
        </Button>

        <Button
          variant={'filled'}
          disabled={!selectedShow}
          onClick={() => {
            if (selectedShow) {
              onLoadShow(selectedShow);
            }
          }}
        >
          {t('add-show')}
        </Button>
      </Group>
    </>
  );
}
