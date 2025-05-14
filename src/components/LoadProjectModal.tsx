import React, { useEffect, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { getCopy } from '@/utils/copyHelpers';
import { Project } from '@/utils/saveProject';

import Pagination from './Pagination';

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
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className={"text-white"}>
        <AlertDialogHeader>
          <AlertDialogTitle className={"text-gray-900 dark:text-gray-100"}>
            {getCopy('LoadProjectModal', 'load_project')}
          </AlertDialogTitle>
          <AlertDialogDescription className={"text-gray-700 dark:text-gray-300"}>
            {getCopy('LoadProjectModal', 'load_project_description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className={"grid gap-2 text-white"}>
          <div className={"flex flex-col gap-2"}>
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
                  <h3 className={"text-sm"}>{project.projectName}</h3>
                  <p className={"text-xs text-gray-500"}>
                    Last Modified: {new Date(project.lastModified).toLocaleString()}
                  </p>
                  <p className={"text-xs text-gray-500"}>
                    Created: {new Date(project.created).toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className={"relative flex h-24 w-full items-center justify-center "}>
          <Pagination
            currentIndex={currentPage}
            length={totalPages}
            setIndex={goToPage}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={!selectedProject}
            onClick={() => {
              if (selectedProject) {
                handleLoadProject(selectedProject);
                setIsOpen(false);
              }
            }}
          >
            {getCopy('LoadProjectModal', 'add_project')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LoadProjectModal;
