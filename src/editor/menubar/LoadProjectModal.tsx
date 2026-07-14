import React, { useEffect, useState } from 'react';
import { Button, Group, Modal, Text } from '@mantine/core';

import Pagination from '@/components/Pagination';
import { getCopy } from '@/utils/copyHelpers';
import { Project } from '@/utils/saveProject';

interface LoadProjectModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleLoadProject: (project: Project) => void;
  projects: Project[];
}

const LoadProjectModal: React.FC<LoadProjectModalProps> = ({
  isOpen,
  setIsOpen,
  handleLoadProject,
  projects
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  function goToPage(pageNumber: number) {
    setCurrentPage(pageNumber);
  }
  useEffect(() => {
    setSelectedProject(selectedProject);
  }, [selectedProject]);

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
      title={
        <span className={'text-gray-900 dark:text-gray-100'}>
          {getCopy('LoadProjectModal', 'load_project')}
        </span>
      }
    >
      <Text className={'text-gray-700 dark:text-gray-300'}>
        {getCopy('LoadProjectModal', 'load_project_description')}
      </Text>
      <div className={'grid gap-2 text-white'}>
        <div className={'flex flex-col gap-2'}>
          {projectsToDisplay.map((project) => (
            <button
              key={project.filePath}
              className={`w-full`}
              onClick={() => setSelectedProject(project)}
            >
              <div
                className={`flex flex-col items-start justify-start rounded-md border p-2 text-left ${
                  selectedProject?.filePath === project.filePath
                    ? 'outline outline-2 outline-blue-500'
                    : ''
                }`}
              >
                <h3 className={'text-sm'}>{project.projectName}</h3>
                <p className={'text-xs text-gray-500'}>
                  Last Modified: {new Date(project.lastModified).toLocaleString()}
                </p>
                <p className={'text-xs text-gray-500'}>
                  Created: {new Date(project.created).toLocaleString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className={'relative flex h-24 w-full items-center justify-center '}>
        <Pagination currentIndex={currentPage} length={totalPages} setIndex={goToPage} />
      </div>
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
};

export default LoadProjectModal;
