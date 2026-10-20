import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Stack } from '@mantine/core';

import {
  WorkspaceSettingsFields,
  type WorkspaceSettingsValues
} from '@/editor/menubar/WorkspaceSettingsFields';
import { useSettingsStore } from '@/store';

interface Props {
  onClose: () => void;
}

export function WorkspaceSettingsModal({ onClose }: Props) {
  const { t } = useTranslation('new-show-modal');
  const setShowSettings = useSettingsStore((state) => state.setShowSettings);
  const initialState = useSettingsStore((state) => ({
    ip: state.ip || '',
    port: state.port || ''
  }));

  const [workspaceSettings, setWorkspaceSettings] =
    useState<WorkspaceSettingsValues>(initialState);

  function handleSubmit() {
    setShowSettings(workspaceSettings);
    onClose();
  }

  return (
    <>
      <Stack gap={'xs'}>
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
          {t('save-settings')}
        </Button>
      </Group>
    </>
  );
}
