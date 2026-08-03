import { useEffect, useState } from 'react';
import { Button, Group, Modal, Stack, Text, Textarea, TextInput } from '@mantine/core';

import Toggle from '@/components/Toggle';
import { useSettingsStore } from '@/store';
import { getCopy } from '@/utils/copyHelpers';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
function ProjectSettingsModal({ isOpen, setIsOpen }: Props) {
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
      title={getCopy('NewProjectModal', 'update_project_header')}
    >
      <Text>{getCopy('NewProjectModal', 'project_details')}</Text>
      <Text size={'xl'} fw={600} my={'xs'}>
        Show Settings
      </Text>
      <Stack gap={'xs'}>
        <TextInput
          label={getCopy('NewProjectModal', 'project_name')}
          size={'xs'}
          value={projectName}
          onChange={(e) => setProjectName(e.currentTarget.value)}
          placeholder={'Enter Project Name'}
        />
        <Textarea
          label={getCopy('NewProjectModal', 'project_description')}
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.currentTarget.value)}
          placeholder={'Type your description here.'}
        />
        <Toggle
          label={'Show Pagination'}
          value={showPagination}
          setValue={handleShowPagination}
        />
      </Stack>
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={() => setIsOpen(false)}>
          {getCopy('NewProjectModal', 'cancel')}
        </Button>
        <Button variant={'filled'} onClick={handleSubmit}>
          {getCopy('NewProjectModal', 'update_project')}
        </Button>
      </Group>
    </Modal>
  );
}

export { ProjectSettingsModal };
