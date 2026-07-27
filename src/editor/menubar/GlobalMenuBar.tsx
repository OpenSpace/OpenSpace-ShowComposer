import { useState } from 'react';
import { Button, Group, Menu, NumberInput, Stack, Text } from '@mantine/core';

import { loadProject, loadProjects, Project } from '@/api/showbuilder';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import ConfirmationModal from '@/editor/menubar/ConfirmationModal';
import ImportShowModal from '@/editor/menubar/ImportShowModal';
import LoadProjectModal from '@/editor/menubar/LoadProjectModal';
import NewPageModal from '@/editor/menubar/NewPageModal';
import {
  NewProjectModal,
  ProjectSettingsModal,
  WorkspaceSettingsModal
} from '@/editor/menubar/NewProjectModal';
import {
  BoundStoreState,
  useBoundStore,
  useBoundStoreTemporal
} from '@/store/boundStore';
import { SettingsStoreState, useSettingsStore } from '@/store/settingsStore';
import { getCopy } from '@/utils/copyHelpers';
import { exportProject, loadStoreToServer, saveProject } from '@/utils/saveProject';

interface LoadedStore {
  boundStore: BoundStoreState;
  settingsStore: SettingsStoreState;
  _tempImportId: string;
}

export function GlobalMenuBar() {
  const { undo, redo, clear, pastStates, futureStates } = useBoundStoreTemporal(
    (state) => state
  );
  const deletePage = useBoundStore((state) => state.deletePage);
  const currentPage = useBoundStore((state) => state.currentPage);
  const { pageWidth, pageHeight } = useSettingsStore((state) => state);
  const updatePageSize = useSettingsStore((state) => state.updatePageSize);
  const removeAllComponents = useBoundStore((state) => state.removeAllComponents);

  const [loadedStore, setLoadedStore] = useState<LoadedStore | null>(null);
  const [isImportShowModalOpen, setIsImportShowModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const [isNewPage, setIsNewPage] = useState(false);
  const [isProjectSettingsModalOpen, setIsProjectSettingsModalOpen] = useState(false);
  const [isConnectionSettingsModalOpen, setIsConnectionSettingsModalOpen] =
    useState(false);
  const [isLoadProjectModalOpen, setIsLoadProjectModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const pageSizes = [
    {
      name: '1080',
      width: 1920,
      height: 1080
    },
    {
      name: 'iPad Landscape',
      width: 1366,
      height: 1024
    },
    {
      name: 'iPad Portrait',
      width: 1024,
      height: 1366
    }
  ];

  async function handleLoadStore() {
    try {
      const store = (await loadStoreToServer()) as LoadedStore;
      setLoadedStore(store); // Store the loaded data
      setIsImportShowModalOpen(true); // Open the import modal
    } catch (error) {
      console.error('Error loading store:', error);
    }
  }
  async function handleLoadProjects() {
    try {
      const projects = await loadProjects();
      setProjects(projects);
      setIsLoadProjectModalOpen(true);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }
  function handleDeleteAllConfirm() {
    removeAllComponents();
    setIsDeleteAllModalOpen(false);
    setIsNewProjectModalOpen(true);
  }
  async function handleSaveConfirm() {
    const saved = await saveProject();
    if (saved) {
      setIsConfirmationModalOpen(true);
    }
  }

  return (
    <>
      <Group gap={4} p={8}>
        <Menu trigger={'click-hover'} position={'bottom-start'}>
          <Menu.Target>
            <Button variant={'subtle'} color={'gray'} size={'compact-sm'}>
              File
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => setIsNewProjectModalOpen(true)}>New Show</Menu.Item>
            <Menu.Item onClick={handleSaveConfirm}>Save</Menu.Item>
            <Menu.Item onClick={handleLoadProjects}>Open</Menu.Item>
            <Menu.Item onClick={handleLoadStore}>Import</Menu.Item>
            <Menu.Item onClick={exportProject}>Export</Menu.Item>
            <Menu.Item color={'red'} onClick={() => setIsDeleteAllModalOpen(true)}>
              Delete Show
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Menu trigger={'click-hover'} position={'bottom-start'}>
          <Menu.Target>
            <Button variant={'subtle'} color={'gray'} size={'compact-sm'}>
              Settings
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              onClick={() => setIsProjectSettingsModalOpen(true)}
              rightSection={
                <Text size={'xs'} c={'dimmed'}>
                  ⌘Z
                </Text>
              }
            >
              Presentation Settings
            </Menu.Item>
            <Menu.Item
              onClick={() => setIsConnectionSettingsModalOpen(true)}
              rightSection={
                <Text size={'xs'} c={'dimmed'}>
                  ⇧⌘Z
                </Text>
              }
            >
              Workspace Settings
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Menu trigger={'click-hover'} position={'bottom-start'}>
          <Menu.Target>
            <Button variant={'subtle'} color={'gray'} size={'compact-sm'}>
              Page
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              onClick={() => {
                setIsNewPage(true);
                setIsNewPageModalOpen(true);
              }}
            >
              Add Page
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                setIsNewPage(false);
                setIsNewPageModalOpen(true);
              }}
            >
              Edit Page
            </Menu.Item>
            <Menu.Item onClick={() => deletePage(currentPage)}>Delete Page</Menu.Item>
            <Menu.Divider />
            <Menu.Sub>
              <Menu.Sub.Target>
                <Menu.Sub.Item>Page Presets</Menu.Sub.Item>
              </Menu.Sub.Target>
              <Menu.Sub.Dropdown>
                {pageSizes.map((page) => (
                  <Menu.Item
                    key={page.name}
                    onClick={() => updatePageSize(page.width, page.height)}
                  >
                    {page.name}
                  </Menu.Item>
                ))}
              </Menu.Sub.Dropdown>
            </Menu.Sub>
            <Stack
              gap={'xs'}
              p={'xs'}
              // Stop propagation from arrow inputs into the number inputs as
              // the menu steals focus (still let Escape bubble up to close the menu).
              onKeyDown={(event) => {
                if (event.key !== 'Escape') {
                  event.stopPropagation();
                }
              }}
            >
              <NumberInput
                label={getCopy('PageButtonMenu', 'width')}
                size={'xs'}
                allowDecimal={false}
                value={pageWidth}
                onChange={(value) =>
                  updatePageSize(
                    typeof value === 'number' ? value : parseInt(value),
                    pageHeight
                  )
                }
              />
              <NumberInput
                label={getCopy('PageButtonMenu', 'height')}
                size={'xs'}
                allowDecimal={false}
                value={pageHeight}
                onChange={(value) =>
                  updatePageSize(
                    pageWidth,
                    typeof value === 'number' ? value : parseInt(value)
                  )
                }
              />
            </Stack>
          </Menu.Dropdown>
        </Menu>

        <Menu trigger={'click-hover'} position={'bottom-start'}>
          <Menu.Target>
            <Button variant={'subtle'} color={'gray'} size={'compact-sm'}>
              History
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              onClick={() => undo()}
              disabled={!pastStates.length}
              rightSection={
                <Text size={'xs'} c={'dimmed'}>
                  ⌘Z
                </Text>
              }
            >
              Undo
            </Menu.Item>
            <Menu.Item
              onClick={() => redo()}
              disabled={!futureStates.length}
              rightSection={
                <Text size={'xs'} c={'dimmed'}>
                  ⇧⌘Z
                </Text>
              }
            >
              Redo
            </Menu.Item>
            <Menu.Item onClick={() => clear()}>Clear History</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
      <ImportShowModal
        isOpen={isImportShowModalOpen && loadedStore !== null}
        onClose={() => setIsImportShowModalOpen(false)}
        store={loadedStore!}
      />
      <DeleteConfirmationModal
        onConfirm={handleDeleteAllConfirm}
        message={
          'This action cannot be undone. This will permanently delete the components from the project.'
        }
        isOpen={isDeleteAllModalOpen}
        setOpen={setIsDeleteAllModalOpen}
      />
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        setIsOpen={setIsNewProjectModalOpen}
        handleLoadProjects={() => {
          setIsLoadProjectModalOpen(true);
        }}
      />
      <ProjectSettingsModal
        isOpen={isProjectSettingsModalOpen}
        setIsOpen={setIsProjectSettingsModalOpen}
      />
      <WorkspaceSettingsModal
        isOpen={isConnectionSettingsModalOpen}
        setIsOpen={setIsConnectionSettingsModalOpen}
      />
      <NewPageModal
        isOpen={isNewPageModalOpen}
        setIsOpen={setIsNewPageModalOpen}
        newPage={isNewPage}
      />
      <LoadProjectModal
        isOpen={isLoadProjectModalOpen}
        setIsOpen={setIsLoadProjectModalOpen}
        projects={projects}
        handleLoadProject={async (project: Project) => {
          try {
            const store = await loadProject(project.filePath);
            useBoundStore.setState(store.boundStore);
            useSettingsStore.setState(store.settingsStore);
          } catch (error) {
            console.error('Error loading project:', error);
          }
        }}
      />
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onConfirm={() => {}}
        message={'Project has been saved!'}
        setOpen={setIsConfirmationModalOpen}
      />
    </>
  );
}

export default GlobalMenuBar;
