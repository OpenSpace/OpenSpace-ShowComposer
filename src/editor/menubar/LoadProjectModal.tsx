import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Center, Group, Stack, Text, UnstyledButton } from '@mantine/core';

import type { Project } from '@/api/showbuilder';
import { Pagination } from '@/components/Pagination';

interface Props {
  projects: Project[];
  onLoadProject: (project: Project) => void;
  onClose: () => void;
}

export function LoadProjectModal({ projects, onLoadProject, onClose }: Props) {
  const { t } = useTranslation('load-project-modal');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(projects.length / itemsPerPage);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const projectsToDisplay = projects
    .sort(
      (a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
    .slice(startIndex, endIndex);

  return (
    <>
      <Text>{t('load-project-description')}</Text>
      <Stack gap={'xs'}>
        {projectsToDisplay.map((project) => (
          <UnstyledButton
            key={project.filePath}
            w={'100%'}
            onClick={() => setSelectedProject(project)}
          >
            <Card
              p={'xs'}
              withBorder
              bg={'transparent'}
              // An outline, unlike a border, does not change the size of the card
              style={{
                outline:
                  selectedProject?.filePath === project.filePath
                    ? '2px solid var(--mantine-color-blue-5)'
                    : undefined
              }}
            >
              <Text size={'sm'}>{project.projectName}</Text>
              <Text size={'xs'} c={'dimmed'}>
                {t('last-modified', {
                  date: new Date(project.lastModified).toLocaleString()
                })}
              </Text>
              <Text size={'xs'} c={'dimmed'}>
                {t('created', { date: new Date(project.created).toLocaleString() })}
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
          disabled={!selectedProject}
          onClick={() => {
            if (selectedProject) {
              onLoadProject(selectedProject);
            }
          }}
        >
          {t('add-project')}
        </Button>
      </Group>
    </>
  );
}
