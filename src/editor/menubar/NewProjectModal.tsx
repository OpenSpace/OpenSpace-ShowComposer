import { useEffect, useState } from 'react';
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput
} from '@mantine/core';

import Toggle from '@/components/Toggle';
import { useOpenSpaceApiStore, useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { getCopy } from '@/utils/copyHelpers';

interface NewProjectModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleLoadProjects: () => void | null;
}

function NewProjectModal({
  isOpen,
  setIsOpen,
  handleLoadProjects
}: NewProjectModalProps) {
  const setProjectSettings = useSettingsStore((state) => state.setProjectSettings);

  const initialState = useSettingsStore((state) => ({
    ip: state.ip || '',
    port: state.port || '',
    pageHeight: state.pageHeight || 1920,
    pageWidth: state.pageWidth || 1080,
    projectName: '',
    projectDescription: '',
    showPagination: state.showPagination || true
  }));

  useEffect(() => {
    if (isOpen) {
      setProjectName(initialState.projectName);
      setProjectDescription(initialState.projectDescription);
      setIp(initialState.ip);
      setPort(initialState.port);
      setPageWidth(initialState.pageWidth);
      setPageHeight(initialState.pageHeight);
      setShowPagination(initialState.showPagination);
    }
  }, [isOpen]);

  const forceRefresh = useOpenSpaceApiStore((state) => state.forceRefresh);
  const removeAllComponents = useBoundStore((state) => state.removeAllComponents);
  const [projectName, setProjectName] = useState(initialState.projectName);
  const [projectDescription, setProjectDescription] = useState(
    initialState.projectDescription
  );
  const [ip, setIp] = useState(initialState.ip);
  const [port, setPort] = useState(initialState.port);
  const [pageWidth, setPageWidth] = useState(initialState.pageWidth);
  const [pageHeight, setPageHeight] = useState(initialState.pageHeight);
  const [showPagination, setShowPagination] = useState<boolean>(
    initialState.showPagination
  );
  const handleShowPagination = (value: boolean) => {
    setShowPagination(value);
  };

  const handleSubmit = () => {
    setProjectSettings({
      projectName,
      projectDescription,
      ip,
      port,
      pageWidth,
      pageHeight,
      showPagination
    });
    removeAllComponents();
    forceRefresh();
    setIsOpen(false);
  };

  return (
    <Modal
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      centered
      title={getCopy('NewProjectModal', 'new_project')}
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
        <Text size={'xl'} fw={600} my={'xs'}>
          Workspace Settings
        </Text>
        <Text size={'sm'} fw={600}>
          {getCopy('ConnectionSettings', 'openspace_connection')}
        </Text>
        <Text size={'sm'} c={'dimmed'}>
          {getCopy('ConnectionSettings', 'address_copy')}
        </Text>
        <TextInput
          label={getCopy('NewProjectModal', 'ip_address')}
          size={'xs'}
          value={ip}
          onChange={(e) => setIp(e.currentTarget.value)}
          placeholder={'Enter IP'}
        />
        <TextInput
          label={getCopy('NewProjectModal', 'port')}
          size={'xs'}
          value={port}
          onChange={(e) => setPort(e.currentTarget.value)}
          placeholder={'Enter Port'}
        />
        <Text size={'sm'} fw={600}>
          {getCopy('NewProjectModal', 'default_page_size')}
        </Text>
        <Text size={'sm'} c={'dimmed'}>
          {getCopy('NewProjectModal', 'default_page_size_copy')}
        </Text>
        <NumberInput
          label={getCopy('NewProjectModal', 'page_width')}
          size={'xs'}
          allowDecimal={false}
          value={pageWidth}
          onChange={(value) =>
            setPageWidth(typeof value === 'number' ? value : parseInt(value))
          }
          placeholder={'Enter Default Page Width'}
        />
        <NumberInput
          label={getCopy('NewProjectModal', 'page_height')}
          size={'xs'}
          allowDecimal={false}
          value={pageHeight}
          onChange={(value) =>
            setPageHeight(typeof value === 'number' ? value : parseInt(value))
          }
          placeholder={'Enter Default Page Height'}
        />
      </Stack>
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={() => setIsOpen(false)}>
          {getCopy('NewProjectModal', 'cancel')}
        </Button>
        <Button variant={'filled'} onClick={handleSubmit}>
          {getCopy('NewProjectModal', 'create_project')}
        </Button>
        {handleLoadProjects && (
          <Button variant={'filled'} onClick={handleLoadProjects}>
            {getCopy('NewProjectModal', 'load_project')}
          </Button>
        )}
      </Group>
    </Modal>
  );
}

export { NewProjectModal };
