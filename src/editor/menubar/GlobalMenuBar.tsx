import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Menu, NumberInput, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';

import { loadProject, loadProjects, type Project } from '@/api/showbuilder';
import { ConfirmationModal } from '@/editor/menubar/ConfirmationModal';
import { ImportShowModal } from '@/editor/menubar/ImportShowModal';
import { LoadProjectModal } from '@/editor/menubar/LoadProjectModal';
import { NewPageModal } from '@/editor/menubar/NewPageModal';
import { NewProjectModal } from '@/editor/menubar/NewProjectModal';
import { ProjectSettingsModal } from '@/editor/menubar/ProjectSettingsModal';
import { WorkspaceSettingsModal } from '@/editor/menubar/WorkspaceSettingsModal';
import {
  type BoundStoreState,
  useBoundStore,
  useBoundStoreTemporal
} from '@/store/boundStore';
import { type SettingsStoreState, useSettingsStore } from '@/store/settingsStore';
import { exportProject, loadStoreToServer, saveProject } from '@/utils/saveProject';

interface LoadedStore {
  boundStore: BoundStoreState;
  settingsStore: SettingsStoreState;
  _tempImportId: string;
}

export function GlobalMenuBar() {
  const { t } = useTranslation('page-button-menu');
  const { t: tDelete } = useTranslation('delete-confirmation-modal');
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
      name: t('ipad-landscape'),
      width: 1366,
      height: 1024
    },
    {
      name: t('ipad-portrait'),
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
  function handleDeleteAll() {
    modals.openConfirmModal({
      title: tDelete('confirmation-text'),
      centered: true,
      children: <Text>{tDelete('delete-all-components-message')}</Text>,
      labels: { confirm: tDelete('delete'), cancel: tDelete('cancel') },
      onConfirm: () => {
        removeAllComponents();
        setIsNewProjectModalOpen(true);
      }
    });
  }
  async function handleSaveConfirm() {
    try {
      const saved = await saveProject();
      if (saved) {
        setIsConfirmationModalOpen(true);
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  }

  return (
    <>
      <Group gap={4} p={8}>
        <Menu trigger={'click-hover'} position={'bottom-start'}>
          <Menu.Target>
            <Button variant={'subtle'} color={'gray'} size={'compact-sm'}>
              {t('file')}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => setIsNewProjectModalOpen(true)}>
              {t('new-show')}
            </Menu.Item>
            <Menu.Item onClick={handleSaveConfirm}>{t('save')}</Menu.Item>
            <Menu.Item onClick={handleLoadProjects}>{t('open')}</Menu.Item>
            <Menu.Item onClick={handleLoadStore}>{t('import')}</Menu.Item>
            <Menu.Item onClick={exportProject}>{t('export')}</Menu.Item>
            <Menu.Item color={'red'} onClick={handleDeleteAll}>
              {t('delete-show')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Menu trigger={'click-hover'} position={'bottom-start'}>
          <Menu.Target>
            <Button variant={'subtle'} color={'gray'} size={'compact-sm'}>
              {t('settings')}
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
              {t('presentation-settings')}
            </Menu.Item>
            <Menu.Item
              onClick={() => setIsConnectionSettingsModalOpen(true)}
              rightSection={
                <Text size={'xs'} c={'dimmed'}>
                  ⇧⌘Z
                </Text>
              }
            >
              {t('workspace-settings')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Menu trigger={'click-hover'} position={'bottom-start'}>
          <Menu.Target>
            <Button variant={'subtle'} color={'gray'} size={'compact-sm'}>
              {t('page')}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              onClick={() => {
                setIsNewPage(true);
                setIsNewPageModalOpen(true);
              }}
            >
              {t('add-page')}
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                setIsNewPage(false);
                setIsNewPageModalOpen(true);
              }}
            >
              {t('edit-page')}
            </Menu.Item>
            <Menu.Item onClick={() => deletePage(currentPage)}>
              {t('delete-page')}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Sub>
              <Menu.Sub.Target>
                <Menu.Sub.Item>{t('page-presets')}</Menu.Sub.Item>
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
                label={t('width')}
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
                label={t('height')}
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
              {t('history')}
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
              {t('undo')}
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
              {t('redo')}
            </Menu.Item>
            <Menu.Item onClick={() => clear()}>{t('clear-history')}</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
      <ImportShowModal
        isOpen={isImportShowModalOpen && loadedStore !== null}
        onClose={() => setIsImportShowModalOpen(false)}
        store={loadedStore!}
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
        message={t('project-saved')}
        setOpen={setIsConfirmationModalOpen}
      />
    </>
  );
}
