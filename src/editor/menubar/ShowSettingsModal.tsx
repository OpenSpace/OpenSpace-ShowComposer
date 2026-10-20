import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Stack } from '@mantine/core';

import {
  ShowSettingsFields,
  type ShowSettingsValues
} from '@/editor/menubar/ShowSettingsFields';
import { useSettingsStore } from '@/store';

interface Props {
  onClose: () => void;
}

export function ShowSettingsModal({ onClose }: Props) {
  const { t } = useTranslation('new-show-modal');
  const setShowSettings = useSettingsStore((state) => state.setShowSettings);
  const initialState = useSettingsStore((state) => ({
    showName: state.projectName || '',
    showDescription: state.projectDescription || '',
    showPagination: state.showPagination || true,
    pageHeight: state.pageHeight || 1920,
    pageWidth: state.pageWidth || 1080
  }));

  const [showSettings, setShowSettingsValues] =
    useState<ShowSettingsValues>(initialState);

  function handleSubmit() {
    setShowSettings({
      projectName: showSettings.showName,
      projectDescription: showSettings.showDescription,
      showPagination: showSettings.showPagination,
      pageWidth: showSettings.pageWidth,
      pageHeight: showSettings.pageHeight
    });
    onClose();
  }

  return (
    <>
      <Stack gap={'xs'}>
        <ShowSettingsFields
          values={showSettings}
          onChange={(values) => setShowSettingsValues((prev) => ({ ...prev, ...values }))}
        />
      </Stack>
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button variant={'filled'} onClick={handleSubmit}>
          {t('update-show')}
        </Button>
      </Group>
    </>
  );
}
