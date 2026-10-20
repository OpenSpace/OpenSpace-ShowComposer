import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Center,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton
} from '@mantine/core';

import { loadShow, loadShows, type Show } from '@/api/showbuilder';
import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { ThemeProvider } from '@/theme/ThemeProvider';

type LoadStatus = 'loading' | 'error' | 'ready';

export function Hub() {
  const { t } = useTranslation('load-show-modal');

  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');

  const navigate = useNavigate();

  useEffect(() => {
    handleLoadShows();
  }, []);

  async function handleLoadShows() {
    setStatus('loading');
    try {
      const shows = await loadShows();
      setShows(shows);
      setStatus('ready');
    } catch (error) {
      console.error('Error loading shows:', error);
      setStatus('error');
    }
  }

  async function handleLoadShow(show: Show, editMode: boolean) {
    try {
      const store = await loadShow(show.filePath);
      const settingsStore = {
        ...store.settingsStore,
        presentMode: editMode,
        presentLocked: editMode
      };
      useBoundStore.setState(store.boundStore);
      useSettingsStore.setState(settingsStore);
      navigate('/');
    } catch (error) {
      console.error('Error loading show:', error);
      setStatus('error');
    }
  }

  return (
    <ThemeProvider defaultTheme={'dark'} storageKey={'vite-ui-theme'}>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          backgroundColor: 'var(--mantine-color-dark-9)',
          color: 'var(--mantine-color-text)'
        }}
      >
        <Stack w={'100%'} maw={768} mx={'auto'} px={'xs'} gap={'xs'} c={'white'}>
          <ScrollArea my={'xl'} mah={'70vh'} w={'100%'}>
            {status === 'loading' && (
              <Center h={200}>
                <Loader />
              </Center>
            )}

            {status === 'error' && (
              <Center h={200} p={'md'}>
                <Stack align={'center'} gap={'sm'} maw={440}>
                  <Text fw={600} size={'lg'}>
                    {t('cannot-connect')}
                  </Text>
                  <Text size={'sm'} c={'dimmed'} ta={'center'}>
                    {t('cannot-connect-description')}
                  </Text>
                  <Button variant={'default'} onClick={handleLoadShows}>
                    {t('retry')}
                  </Button>
                </Stack>
              </Center>
            )}

            {status === 'ready' && shows.length === 0 && (
              <Center h={200}>
                <Text size={'sm'} c={'dimmed'}>
                  {t('no-shows-found')}
                </Text>
              </Center>
            )}

            {status === 'ready' && shows.length > 0 && (
              <Stack gap={'xs'} p={'xs'}>
                {shows.map((show) => (
                  <UnstyledButton
                    key={show.filePath}
                    w={'100%'}
                    onClick={() => setSelectedShow(show)}
                  >
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        padding: 'var(--mantine-spacing-xs)',
                        borderRadius: 'var(--mantine-radius-md)',
                        border: '1px solid var(--mantine-color-dark-4)',
                        textAlign: 'left',
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
                        {t('created', {
                          date: new Date(show.created).toLocaleString()
                        })}
                      </Text>
                    </Box>
                  </UnstyledButton>
                ))}
              </Stack>
            )}
          </ScrollArea>

          {status === 'ready' && shows.length > 0 && (
            <Group w={'100%'} justify={'center'} gap={'xs'}>
              <Button
                disabled={!selectedShow}
                onClick={() => {
                  if (selectedShow) {
                    handleLoadShow(selectedShow, false);
                  }
                }}
              >
                {t('edit-show')}
              </Button>
              <Button
                variant={'filled'}
                disabled={!selectedShow}
                onClick={() => {
                  if (selectedShow) {
                    handleLoadShow(selectedShow, true);
                  }
                }}
              >
                {t('add-show')}
              </Button>
            </Group>
          )}
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
