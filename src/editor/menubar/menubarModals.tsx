import { modals } from '@mantine/modals';
import i18n from 'i18next';

import type { Show } from '@/api/showbuilder';
import { ConfirmationModal } from '@/editor/menubar/ConfirmationModal';
import { EditPageModal } from '@/editor/menubar/EditPageModal';
import { ImportShowModal, type LoadedStore } from '@/editor/menubar/ImportShowModal';
import { LoadShowModal } from '@/editor/menubar/LoadShowModal';
import { NewPageModal } from '@/editor/menubar/NewPageModal';
import { NewShowModal } from '@/editor/menubar/NewShowModal';
import { ShowSettingsModal } from '@/editor/menubar/ShowSettingsModal';
import { WorkspaceSettingsModal } from '@/editor/menubar/WorkspaceSettingsModal';

export function openConfirmationModal(message: string) {
  const id = modals.open({
    children: <ConfirmationModal message={message} onClose={() => modals.close(id)} />
  });
}

export function openShowSettingsModal() {
  const id = modals.open({
    title: i18n.t('new-show-modal:update-show-header'),
    size: 'xl',
    children: <ShowSettingsModal onClose={() => modals.close(id)} />
  });
}

export function openWorkspaceSettingsModal() {
  const id = modals.open({
    title: i18n.t('new-show-modal:workspace-settings'),
    size: 'xl',
    children: <WorkspaceSettingsModal onClose={() => modals.close(id)} />
  });
}

export function openNewShowModal(onLoadShows: () => void) {
  const id = modals.open({
    title: i18n.t('new-show-modal:new-show'),
    size: 'xl',
    children: <NewShowModal onClose={() => modals.close(id)} onLoadShows={onLoadShows} />
  });
}

export function openNewPageModal() {
  const id = modals.open({
    title: i18n.t('new-page-modal:create-page-title'),
    size: 'xl',
    children: <NewPageModal onClose={() => modals.close(id)} />
  });
}

export function openEditPageModal() {
  const id = modals.open({
    title: i18n.t('new-page-modal:update-page-title'),
    size: 'xl',
    children: <EditPageModal onClose={() => modals.close(id)} />
  });
}

// Loading a show closes all open modals, also the one this was opened from
export function openLoadShowModal(shows: Show[], onLoadShow: (show: Show) => void) {
  const id = modals.open({
    title: i18n.t('load-show-modal:load-show'),
    size: 'xl',
    children: (
      <LoadShowModal
        shows={shows}
        onLoadShow={(show) => {
          onLoadShow(show);
          modals.closeAll();
        }}
        onClose={() => modals.close(id)}
      />
    )
  });
}

export function openImportShowModal(store: LoadedStore) {
  const id = modals.open({
    title: i18n.t('import-show-modal:title'),
    size: '60rem',
    children: <ImportShowModal store={store} onClose={() => modals.close(id)} />
  });
}
