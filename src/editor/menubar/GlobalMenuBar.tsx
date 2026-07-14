import { useState } from 'react';
import { InputLabel, NumberInput } from '@mantine/core';

import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger
} from '@/components/ui/menubar';
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
import {
  // loadStore,
  exportProject,
  loadProject,
  loadProjects,
  // loadStoreImageSeperately,
  loadStoreToServer,
  Project,
  saveProject
} from '@/utils/saveProject';

interface LoadedStore {
  boundStore: BoundStoreState;
  settingsStore: SettingsStoreState;
  _tempImportId: string;
}

export function GlobalMenuBar() {
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
  const { undo, redo, clear, pastStates, futureStates } = useBoundStoreTemporal(
    (state) => state
  );
  const deletePage = useBoundStore((state) => state.deletePage);
  const currentPage = useBoundStore((state) => state.currentPage);
  const [projects, setProjects] = useState<Project[]>([]);
  const { pageWidth, pageHeight } = useSettingsStore((state) => state);
  const updatePageSize = useSettingsStore((state) => state.updatePageSize);
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

  const removeAllComponents = useBoundStore((state) => state.removeAllComponents);

  const handleLoadStore = async () => {
    try {
      const store = (await loadStoreToServer()) as LoadedStore;
      setLoadedStore(store); // Store the loaded data
      setIsImportShowModalOpen(true); // Open the import modal
    } catch (error) {
      console.error('Error loading store:', error);
    }
  };
  const handleLoadProjects = async () => {
    try {
      const projects = await loadProjects();
      setProjects(projects);
      setIsLoadProjectModalOpen(true);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };
  const handleDeleteAllConfirm = () => {
    removeAllComponents();
    setIsDeleteAllModalOpen(false);
    setIsNewProjectModalOpen(true);
  };
  const handleSaveConfirm = async () => {
    const saved = await saveProject();
    if (saved) {
      setIsConfirmationModalOpen(true);
    }
  };

  return (
    <>
      <Menubar className={'border-0 p-2'}>
        <MenubarMenu>
          <MenubarTrigger>
            {/* <PlusCircleIcon size={20} /> */}
            File
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsNewProjectModalOpen(true)}>
              New Show
            </MenubarItem>
            <MenubarItem onClick={handleSaveConfirm}>Save </MenubarItem>
            <MenubarItem onClick={handleLoadProjects}>Open</MenubarItem>
            <MenubarItem onClick={handleLoadStore}>Import</MenubarItem>
            <MenubarItem onClick={exportProject}>Export</MenubarItem>
            <MenubarItem
              onClick={() => setIsDeleteAllModalOpen(true)}
              className={'text-red-500'}
            >
              Delete Show
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Settings</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsProjectSettingsModalOpen(true)}>
              Presentation Settings <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => setIsConnectionSettingsModalOpen(true)}>
              Workspace Settings <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Page</MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              onClick={() => {
                setIsNewPage(true);
                setIsNewPageModalOpen(true);
              }}
            >
              Add Page
            </MenubarItem>
            <MenubarItem
              onClick={() => {
                setIsNewPage(false);
                setIsNewPageModalOpen(true);
              }}
            >
              Edit Page
            </MenubarItem>
            <MenubarItem onClick={() => deletePage(currentPage)}>Delete Page</MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Page Presets</MenubarSubTrigger>
              <MenubarSubContent>
                {pageSizes.map((page) => (
                  <MenubarItem
                    onClick={() => updatePageSize(page.width, page.height)}
                    key={page.name}
                  >
                    {page.name}
                  </MenubarItem>
                ))}
              </MenubarSubContent>
            </MenubarSub>
            <div className={'grid gap-2 p-2'}>
              <div className={'space-between flex flex-row items-center gap-4'}>
                <InputLabel htmlFor={'port'}>
                  {getCopy('PageButtonMenu', 'width')}
                </InputLabel>
                <NumberInput
                  id={'width'}
                  className={'w-40'}
                  size={'xs'}
                  allowDecimal={false}
                  value={pageWidth}
                  onChange={(value) => {
                    updatePageSize(
                      typeof value === 'number' ? value : parseInt(value),
                      pageHeight
                    );
                  }}
                  placeholder={'Enter Page Width'}
                />
              </div>
              <div className={'flex flex-row  items-center gap-4'}>
                <InputLabel htmlFor={'port'}>
                  {getCopy('PageButtonMenu', 'height')}
                </InputLabel>
                <NumberInput
                  id={'height'}
                  className={'w-40'}
                  size={'xs'}
                  allowDecimal={false}
                  value={pageHeight}
                  onChange={(value) => {
                    updatePageSize(
                      pageWidth,
                      typeof value === 'number' ? value : parseInt(value)
                    );
                  }}
                  placeholder={'Enter Page Height'}
                />
              </div>
            </div>
            <MenubarSeparator />
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>History</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => undo()} disabled={!pastStates.length}>
              {/* <Undo /> */}
              Undo
              <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => redo()} disabled={!futureStates.length}>
              {/* <Redo /> */}
              Redo
              <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => clear()}>Clear History</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
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
          const store = await loadProject(project.filePath);
          useBoundStore.setState(store.boundStore);
          useSettingsStore.setState(store.settingsStore);
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
