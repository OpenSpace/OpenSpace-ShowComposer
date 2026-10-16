import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Stack, Title } from '@mantine/core';

import {
  ShowSettingsFields,
  type ShowSettingsValues
} from '@/editor/menubar/ShowSettingsFields';
import {
  WorkspaceSettingsFields,
  type WorkspaceSettingsValues
} from '@/editor/menubar/WorkspaceSettingsFields';
import { useOpenSpaceApiStore, useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';

interface Props {
  onClose: () => void;
  onLoadShows: () => void;
}

export function NewShowModal({ onClose, onLoadShows }: Props) {
  const { t } = useTranslation('new-show-modal');
  const setShowSettings = useSettingsStore((state) => state.setShowSettings);
  const initialState = useSettingsStore((state) => ({
    show: {
      showName: '',
      showDescription: '',
      showPagination: state.showPagination || true,
      pageHeight: state.pageHeight || 1920,
      pageWidth: state.pageWidth || 1080
    },
    workspace: {
      ip: state.ip || '',
      port: state.port || ''
    }
  }));
  const forceRefresh = useOpenSpaceApiStore((state) => state.forceRefresh);
  const removeAllComponents = useBoundStore((state) => state.removeAllComponents);

  const [showSettings, setShowSettingsValues] = useState<ShowSettingsValues>(
    initialState.show
  );
  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettingsValues>(
    initialState.workspace
  );

  function handleSubmit() {
    setShowSettings({
      projectName: showSettings.showName,
      projectDescription: showSettings.showDescription,
      showPagination: showSettings.showPagination,
      pageWidth: showSettings.pageWidth,
      pageHeight: showSettings.pageHeight,
      ...workspaceSettings
    });
    removeAllComponents();
    forceRefresh();
    onClose();
  }

  return (
    <>
      <Title order={2} my={'xs'}>
        {t('show-settings')}
      </Title>
      <Stack gap={'xs'}>
        <ShowSettingsFields
          values={showSettings}
          onChange={(values) => setShowSettingsValues((prev) => ({ ...prev, ...values }))}
        />
        <Title order={2} my={'xs'}>
          {t('workspace-settings')}
        </Title>
        <WorkspaceSettingsFields
          values={workspaceSettings}
          onChange={(values) => setWorkspaceSettings((prev) => ({ ...prev, ...values }))}
        />
      </Stack>
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button variant={'filled'} onClick={handleSubmit}>
          {t('create-show')}
        </Button>
        <Button variant={'filled'} onClick={onLoadShows}>
          {t('load-show')}
        </Button>
      </Group>
    </>
  );
}
