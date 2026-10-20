import { useTranslation } from 'react-i18next';
import { Button, Group, Menu, Text } from '@mantine/core';
import { modals } from '@mantine/modals';

import { loadShow, loadShows, type Show } from '@/api/showbuilder';
import type { LoadedStore } from '@/editor/menubar/ImportShowModal';
import {
  openConfirmationModal,
  openEditPageModal,
  openImportShowModal,
  openLoadShowModal,
  openNewPageModal,
  openNewShowModal,
  openShowSettingsModal,
  openWorkspaceSettingsModal
} from '@/editor/menubar/menubarModals';
import { useBoundStore, useBoundStoreTemporal } from '@/store/boundStore';
import { useSettingsStore } from '@/store/settingsStore';
import { exportShow, loadStoreToServer, saveShow } from '@/utils/saveShow';

export function GlobalMenuBar() {
  const { t } = useTranslation('page-button-menu');
  const { t: tDelete } = useTranslation('delete-confirmation-modal');
  const { undo, redo, clear, pastStates, futureStates } = useBoundStoreTemporal(
    (state) => state
  );
  const deletePage = useBoundStore((state) => state.deletePage);
  const currentPage = useBoundStore((state) => state.currentPage);
  const removeAllComponents = useBoundStore((state) => state.removeAllComponents);

  async function handleLoadStore() {
    try {
      const store = (await loadStoreToServer()) as LoadedStore;
      openImportShowModal(store);
    } catch (error) {
      console.error('Error loading store:', error);
    }
  }

  async function handleLoadShow(show: Show) {
    try {
      const store = await loadShow(show.filePath);
      useBoundStore.setState(store.boundStore);
      useSettingsStore.setState(store.settingsStore);
    } catch (error) {
      console.error('Error loading show:', error);
    }
  }

  async function handleLoadShows() {
    try {
      const shows = await loadShows();
      openLoadShowModal(shows, handleLoadShow);
    } catch (error) {
      console.error('Error loading shows:', error);
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
        openNewShowModal(handleLoadShows);
      }
    });
  }

  function handleDeletePage() {
    modals.openConfirmModal({
      title: tDelete('confirmation-text'),
      centered: true,
      children: <Text>{tDelete('delete-page-message')}</Text>,
      labels: { confirm: tDelete('delete'), cancel: tDelete('cancel') },
      onConfirm: () => deletePage(currentPage)
    });
  }

  async function handleSaveConfirm() {
    try {
      const saved = await saveShow();
      if (saved) {
        openConfirmationModal(t('show-saved'));
      }
    } catch (error) {
      console.error('Error saving show:', error);
    }
  }

  return (
    <Group gap={'xxs'} p={'xxs'}>
      <Menu trigger={'click-hover'} position={'bottom-start'}>
        <Menu.Target>
          <Button variant={'subtle'} color={'gray'} size={'compact-sm'}>
            {t('file')}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={() => openNewShowModal(handleLoadShows)}>
            {t('new-show')}
          </Menu.Item>
          <Menu.Item onClick={handleSaveConfirm}>{t('save')}</Menu.Item>
          <Menu.Item onClick={handleLoadShows}>{t('open')}</Menu.Item>
          <Menu.Item onClick={handleLoadStore}>{t('import')}</Menu.Item>
          <Menu.Item onClick={exportShow}>{t('export')}</Menu.Item>
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
            onClick={openShowSettingsModal}
            rightSection={
              <Text size={'xs'} c={'dimmed'}>
                ⌘Z
              </Text>
            }
          >
            {t('show-settings')}
          </Menu.Item>
          <Menu.Item
            onClick={openWorkspaceSettingsModal}
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
          <Menu.Item onClick={openNewPageModal}>{t('add-page')}</Menu.Item>
          <Menu.Item onClick={openEditPageModal}>{t('edit-page')}</Menu.Item>
          <Menu.Item color={'red'} onClick={handleDeletePage}>
            {t('delete-page')}
          </Menu.Item>
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
  );
}
