import { useState } from 'react';
import { Button, Group, Modal, NumberInput, Stack, Text, TextInput } from '@mantine/core';

import { useSettingsStore } from '@/store';
import { getCopy } from '@/utils/copyHelpers';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function WorkspaceSettingsModal({ isOpen, setIsOpen }: Props) {
  const setProjectSettings = useSettingsStore((state) => state.setProjectSettings);

  const initialState = useSettingsStore((state) => ({
    ip: state.ip || '',
    port: state.port || '',
    pageHeight: state.pageHeight || 1920,
    pageWidth: state.pageWidth || 1080
  }));

  const [ip, setIp] = useState(initialState.ip);
  const [port, setPort] = useState(initialState.port);
  const [pageWidth, setPageWidth] = useState(initialState.pageWidth);
  const [pageHeight, setPageHeight] = useState(initialState.pageHeight);

  const handleSubmit = () => {
    setProjectSettings({
      ip,
      port,
      pageWidth,
      pageHeight
    });
    setIsOpen(false);
  };

  return (
    <Modal
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      centered
      title={'Workspace Settings'}
    >
      <Text>Update your workspace settings here</Text>
      <Stack gap={'xs'}>
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
          Save Settings
        </Button>
      </Group>
    </Modal>
  );
}

export { WorkspaceSettingsModal };
