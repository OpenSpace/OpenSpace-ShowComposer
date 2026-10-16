import { modals } from '@mantine/modals';
import i18n from 'i18next';

import type { Project } from '@/api/showbuilder';
import { ConfirmationModal } from '@/editor/menubar/ConfirmationModal';
import { EditPageModal } from '@/editor/menubar/EditPageModal';
import { ImportShowModal, type LoadedStore } from '@/editor/menubar/ImportShowModal';
import { LoadProjectModal } from '@/editor/menubar/LoadProjectModal';
import { NewPageModal } from '@/editor/menubar/NewPageModal';
import { NewProjectModal } from '@/editor/menubar/NewProjectModal';
import { ProjectSettingsModal } from '@/editor/menubar/ProjectSettingsModal';
import { WorkspaceSettingsModal } from '@/editor/menubar/WorkspaceSettingsModal';

export function openConfirmationModal(message: string) {
  const id = modals.open({
    children: <ConfirmationModal message={message} onClose={() => modals.close(id)} />
  });
}

export function openProjectSettingsModal() {
  const id = modals.open({
    title: i18n.t('new-project-modal:update-project-header'),
    size: 'xl',
    children: <ProjectSettingsModal onClose={() => modals.close(id)} />
  });
}

export function openWorkspaceSettingsModal() {
  const id = modals.open({
    title: i18n.t('new-project-modal:workspace-settings'),
    size: 'xl',
    children: <WorkspaceSettingsModal onClose={() => modals.close(id)} />
  });
}

export function openNewProjectModal(onLoadProjects: () => void) {
  const id = modals.open({
    title: i18n.t('new-project-modal:new-project'),
    size: 'xl',
    children: (
      <NewProjectModal onClose={() => modals.close(id)} onLoadProjects={onLoadProjects} />
    )
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
export function openLoadProjectModal(
  projects: Project[],
  onLoadProject: (project: Project) => void
) {
  const id = modals.open({
    title: i18n.t('load-project-modal:load-project'),
    size: 'xl',
    children: (
      <LoadProjectModal
        projects={projects}
        onLoadProject={(project) => {
          onLoadProject(project);
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
