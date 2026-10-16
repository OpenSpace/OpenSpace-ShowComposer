import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, NumberInput, Stack, Text, TextInput } from '@mantine/core';

import { useSettingsStore } from '@/store';

interface Props {
  onClose: () => void;
}

export function WorkspaceSettingsModal({ onClose }: Props) {
  const { t } = useTranslation(['new-show-modal', 'connection-settings']);
  const setShowSettings = useSettingsStore((state) => state.setShowSettings);

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

  function handleSubmit() {
    setShowSettings({
      ip,
      port,
      pageWidth,
      pageHeight
    });
    onClose();
  }

  return (
    <>
      <Text>{t('update-workspace-settings')}</Text>
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
          placeholder={t('ip-address-placeholder')}
        />
        <TextInput
          label={t('port')}
          size={'xs'}
          value={port}
          onChange={(e) => setPort(e.currentTarget.value)}
          placeholder={t('port-placeholder')}
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
          placeholder={t('page-width-placeholder')}
        />
        <NumberInput
          label={t('page-height')}
          size={'xs'}
          allowDecimal={false}
          value={pageHeight}
          onChange={(value) =>
            setPageHeight(typeof value === 'number' ? value : parseInt(value))
          }
          placeholder={t('page-height-placeholder')}
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
