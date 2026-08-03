import { useState } from 'react';
import {
  Box,
  Button,
  Center,
  Group,
  Modal,
  Stack,
  Text,
  UnstyledButton
} from '@mantine/core';

import { Project } from '@/api/showbuilder';
import Pagination from '@/components/Pagination';
import { getCopy } from '@/utils/copyHelpers';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleLoadProject: (project: Project) => void;
  projects: Project[];
}

function LoadProjectModal({
  isOpen,
  setIsOpen,
  handleLoadProject,
  projects
}: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  function goToPage(pageNumber: number) {
    setCurrentPage(pageNumber);
  }

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const projectsToDisplay = projects
    .sort(
      (a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
    .slice(startIndex, endIndex);

  return (
    <Modal
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      centered
      title={getCopy('LoadProjectModal', 'load_project')}
    >
      <Text>{getCopy('LoadProjectModal', 'load_project_description')}</Text>
      <Stack gap={'xs'}>
        {projectsToDisplay.map((project) => (
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
                border: '1px solid var(--mantine-color-default-border)',
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
      <Center pos={'relative'} h={96}>
        <Pagination currentIndex={currentPage} length={totalPages} setIndex={goToPage} />
      </Center>
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={() => setIsOpen(false)}>
          Cancel
        </Button>

        <Button
          variant={'filled'}
          disabled={!selectedProject}
          onClick={() => {
            if (selectedProject) {
              handleLoadProject(selectedProject);
              setIsOpen(false);
            }
          }}
        >
          {getCopy('LoadProjectModal', 'add_project')}
        </Button>
      </Group>
    </Modal>
  );
}

export default LoadProjectModal;
