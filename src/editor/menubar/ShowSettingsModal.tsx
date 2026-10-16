import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Group, Stack, Text, Textarea, TextInput } from '@mantine/core';

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
    showPagination: state.showPagination || true
  }));

  const [showName, setShowName] = useState(initialState.showName);
  const [showDescription, setShowDescription] = useState(initialState.showDescription);
  const [showPagination, setShowPagination] = useState<boolean>(
    initialState.showPagination
  );

  function handleSubmit() {
    setShowSettings({
      projectName: showName,
      projectDescription: showDescription,
      showPagination
    });
    onClose();
  }

  return (
    <>
      <Text>{t('show-details')}</Text>
      <Text size={'xl'} fw={600} my={'xs'}>
        {t('show-settings')}
      </Text>
      <Stack gap={'xs'}>
        <TextInput
          label={t('show-name')}
          size={'xs'}
          value={showName}
          onChange={(e) => setShowName(e.currentTarget.value)}
          placeholder={t('show-name-placeholder')}
        />
        <Textarea
          label={t('show-description')}
          value={showDescription}
          onChange={(e) => setShowDescription(e.currentTarget.value)}
          placeholder={t('show-description-placeholder')}
        />
        <Checkbox
          label={t('show-pagination')}
          checked={showPagination}
          onChange={(event) => setShowPagination(event.currentTarget.checked)}
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
