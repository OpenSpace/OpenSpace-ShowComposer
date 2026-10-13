import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Checkbox,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput
} from '@mantine/core';

import { useSettingsStore } from '@/store';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
export function ProjectSettingsModal({ isOpen, setIsOpen }: Props) {
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
  const handleShowPagination = (value: boolean) => {
    setShowPagination(value);
  };
  useEffect(() => {
    if (isOpen) {
      setProjectName(initialState.projectName);
      setProjectDescription(initialState.projectDescription);
      setShowPagination(initialState.showPagination);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    setProjectSettings({
      projectName,
      projectDescription,
      showPagination
    });
    setIsOpen(false);
  };
  return (
    <Modal
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      centered
      title={t('update-project-header')}
    >
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
          onChange={(event) => handleShowPagination(event.currentTarget.checked)}
        />
      </Stack>
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={() => setIsOpen(false)}>
          {t('cancel')}
        </Button>
        <Button variant={'filled'} onClick={handleSubmit}>
          {t('update-project')}
        </Button>
      </Group>
    </Modal>
  );
}
