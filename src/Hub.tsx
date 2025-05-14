import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ThemeProvider } from './components/ThemeProvider';
import { Button } from './components/ui/button';
import { ScrollArea } from './components/ui/scroll-area';
import { useBoundStore } from './store/boundStore';
import { getCopy } from './utils/copyHelpers';
// import Pagination from './components/Pagination';
import { loadProject, loadProjects, Project } from './utils/saveProject';
import { useSettingsStore } from './store';

export const Hub = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const handleLoadProjects = async () => {
    try {
      const projects = await loadProjects();
      setProjects(projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };
  const navigate = useNavigate();

  useEffect(() => {
    handleLoadProjects();
  }, []);

  const handleLoadProject = async (project: Project, editMode: boolean) => {
    const store = await loadProject(project.filePath);
    const settingsStore = {
      ...store.settingsStore,
      presentMode: editMode,
      presentLocked: editMode
    };
    useBoundStore.setState(store.boundStore);
    useSettingsStore.setState(settingsStore);
    navigate('/');
  };

  useEffect(() => {
    setSelectedProject(selectedProject);
  }, [selectedProject]);

  return (
    <ThemeProvider defaultTheme={'dark'} storageKey={'vite-ui-theme'}>
      <div
        className={
          'flex  h-screen w-screen flex-col  overflow-hidden   border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50'
        }
      >
        <div className={'mx-auto grid w-full max-w-screen-md gap-2 px-2 text-white'}>
          <ScrollArea className={'my-8 max-h-[70vh] w-full gap-2 rounded-md '}>
            <div className={'flex flex-col gap-2 p-2'}>
              {projects.map((project) => (
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
          </ScrollArea>
          <div className={'flex  w-full justify-center gap-2'}>
            <Button
              variant={'outline'}
              disabled={!selectedProject}
              onClick={() => {
                if (selectedProject) {
                  handleLoadProject(selectedProject, false);
                  // setIsOpen(false);
                }
              }}
            >
              {getCopy('LoadProjectModal', 'edit_project')}
            </Button>
            <Button
              variant={'default'}
              disabled={!selectedProject}
              onClick={() => {
                if (selectedProject) {
                  handleLoadProject(selectedProject, true);
                  // setIsOpen(false);
                }
              }}
            >
              {getCopy('LoadProjectModal', 'add_project')}
            </Button>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};
