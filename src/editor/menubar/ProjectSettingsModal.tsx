import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Group, Stack, Text, Textarea, TextInput } from '@mantine/core';

import { useSettingsStore } from '@/store';

interface Props {
  onClose: () => void;
}

export function ProjectSettingsModal({ onClose }: Props) {
  const { t } = useTranslation('new-project-modal');
  const setProjectSettings = useSettingsStore((state) => state.setProjectSettings);
  const initialState = useSettingsStore((state) => ({
    projectName: state.projectName || '',
    projectDescription: state.projectDescription || '',
    showPagination: state.showPagination || true
  }));

  const [projectName, setProjectName] = useState(initialState.projectName);
  const [projectDescription, setProjectDescription] = useState(
    initialState.projectDescription
  );
  const [showPagination, setShowPagination] = useState<boolean>(
    initialState.showPagination
  );

  function handleSubmit() {
    setProjectSettings({
      projectName,
      projectDescription,
      showPagination
    });
    onClose();
  }

  return (
    <>
      <Text>{t('project-details')}</Text>
      <Text size={'xl'} fw={600} my={'xs'}>
        {t('show-settings')}
      </Text>
      <Stack gap={'xs'}>
        <TextInput
          label={t('project-name')}
          size={'xs'}
          value={projectName}
          onChange={(e) => setProjectName(e.currentTarget.value)}
          placeholder={t('project-name-placeholder')}
        />
        <Textarea
          label={t('project-description')}
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.currentTarget.value)}
          placeholder={t('project-description-placeholder')}
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
          {t('update-project')}
        </Button>
      </Group>
    </>
  );
}
