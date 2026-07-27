import { useEffect, useState } from 'react';
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

import { loadProject, loadProjects, Project } from '@/api/showbuilder';
import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { getCopy } from '@/utils/copyHelpers';

type LoadStatus = 'loading' | 'error' | 'ready';

export function Hub() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');

  const navigate = useNavigate();

  async function handleLoadProjects() {
    setStatus('loading');
    try {
      const projects = await loadProjects();
      setProjects(projects);
      setStatus('ready');
    } catch (error) {
      console.error('Error loading projects:', error);
      setStatus('error');
    }
  }

  useEffect(() => {
    handleLoadProjects();
  }, []);

  async function handleLoadProject(project: Project, editMode: boolean) {
    try {
      const store = await loadProject(project.filePath);
      const settingsStore = {
        ...store.settingsStore,
        presentMode: editMode,
        presentLocked: editMode
      };
      useBoundStore.setState(store.boundStore);
      useSettingsStore.setState(settingsStore);
      navigate('/');
    } catch (error) {
      console.error('Error loading project:', error);
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
                    Can&apos;t connect to OpenSpace
                  </Text>
                  <Text size={'sm'} c={'dimmed'} ta={'center'}>
                    Projects are loaded from the OpenSpace backend. Make sure OpenSpace is
                    running, then try again.
                  </Text>
                  <Button variant={'default'} onClick={handleLoadProjects}>
                    Retry
                  </Button>
                </Stack>
              </Center>
            )}

            {status === 'ready' && projects.length === 0 && (
              <Center h={200}>
                <Text size={'sm'} c={'dimmed'}>
                  No saved projects found.
                </Text>
              </Center>
            )}

            {status === 'ready' && projects.length > 0 && (
              <Stack gap={'xs'} p={'xs'}>
                {projects.map((project) => (
                  <UnstyledButton
                    key={project.filePath}
                    w={'100%'}
                    onClick={() => setSelectedProject(project)}
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
                          selectedProject?.filePath === project.filePath
                            ? '2px solid var(--mantine-color-blue-5)'
                            : undefined
                      }}
                    >
                      <Text size={'sm'}>{project.projectName}</Text>
                      <Text size={'xs'} c={'dimmed'}>
                        Last Modified: {new Date(project.lastModified).toLocaleString()}
                      </Text>
                      <Text size={'xs'} c={'dimmed'}>
                        Created: {new Date(project.created).toLocaleString()}
                      </Text>
                    </Box>
                  </UnstyledButton>
                ))}
              </Stack>
            )}
          </ScrollArea>

          {status === 'ready' && projects.length > 0 && (
            <Group w={'100%'} justify={'center'} gap={'xs'}>
              <Button
                disabled={!selectedProject}
                onClick={() => {
                  if (selectedProject) {
                    handleLoadProject(selectedProject, false);
                  }
                }}
              >
                {getCopy('LoadProjectModal', 'edit_project')}
              </Button>
              <Button
                variant={'filled'}
                disabled={!selectedProject}
                onClick={() => {
                  if (selectedProject) {
                    handleLoadProject(selectedProject, true);
                  }
                }}
              >
                {getCopy('LoadProjectModal', 'add_project')}
              </Button>
            </Group>
          )}
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
