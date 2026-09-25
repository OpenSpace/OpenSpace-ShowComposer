import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Modal, NumberInput, Stack, Text, TextInput } from '@mantine/core';

import { useSettingsStore } from '@/store';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function WorkspaceSettingsModal({ isOpen, setIsOpen }: Props) {
  const { t } = useTranslation(['new-project-modal', 'connection-settings']);
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
          {t('connection-settings:openspace-connection')}
        </Text>
        <Text size={'sm'} c={'dimmed'}>
          {t('connection-settings:address-copy')}
        </Text>
        <TextInput
          label={t('ip-address')}
          size={'xs'}
          value={ip}
          onChange={(e) => setIp(e.currentTarget.value)}
          placeholder={'Enter IP'}
        />
        <TextInput
          label={t('port')}
          size={'xs'}
          value={port}
          onChange={(e) => setPort(e.currentTarget.value)}
          placeholder={'Enter Port'}
        />
        <Text size={'sm'} fw={600}>
          {t('default-page-size')}
        </Text>
        <Text size={'sm'} c={'dimmed'}>
          {t('default-page-size-copy')}
        </Text>
        <NumberInput
          label={t('page-width')}
          size={'xs'}
          allowDecimal={false}
          value={pageWidth}
          onChange={(value) =>
            setPageWidth(typeof value === 'number' ? value : parseInt(value))
          }
          placeholder={'Enter Default Page Width'}
        />
        <NumberInput
          label={t('page-height')}
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
          {t('cancel')}
        </Button>
        <Button variant={'filled'} onClick={handleSubmit}>
          Save Settings
        </Button>
      </Group>
    </Modal>
  );
}

export { WorkspaceSettingsModal };
