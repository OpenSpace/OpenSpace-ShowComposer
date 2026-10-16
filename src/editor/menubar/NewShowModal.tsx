import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Checkbox,
  Group,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title
} from '@mantine/core';

import { useOpenSpaceApiStore, useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';

interface Props {
  onClose: () => void;
  onLoadShows: () => void;
}

export function NewShowModal({ onClose, onLoadShows }: Props) {
  const { t } = useTranslation(['new-show-modal', 'connection-settings']);
  const setShowSettings = useSettingsStore((state) => state.setShowSettings);

  const initialState = useSettingsStore((state) => ({
    ip: state.ip || '',
    port: state.port || '',
    pageHeight: state.pageHeight || 1920,
    pageWidth: state.pageWidth || 1080,
    showName: '',
    showDescription: '',
    showPagination: state.showPagination || true
  }));

  const forceRefresh = useOpenSpaceApiStore((state) => state.forceRefresh);
  const removeAllComponents = useBoundStore((state) => state.removeAllComponents);
  const [showName, setShowName] = useState(initialState.showName);
  const [showDescription, setShowDescription] = useState(initialState.showDescription);
  const [ip, setIp] = useState(initialState.ip);
  const [port, setPort] = useState(initialState.port);
  const [pageWidth, setPageWidth] = useState(initialState.pageWidth);
  const [pageHeight, setPageHeight] = useState(initialState.pageHeight);
  const [showPagination, setShowPagination] = useState<boolean>(
    initialState.showPagination
  );

  function handleSubmit() {
    setShowSettings({
      projectName: showName,
      projectDescription: showDescription,
      ip,
      port,
      pageWidth,
      pageHeight,
      showPagination
    });
    removeAllComponents();
    forceRefresh();
    onClose();
  }

  return (
    <>
      <Text>{t('show-details')}</Text>
      <Title order={2} my={'xs'}>
        {t('show-settings')}
      </Title>
      <Stack gap={'xs'}>
        <TextInput
          label={t('show-name')}
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
        <Title order={2} my={'xs'}>
          {t('workspace-settings')}
        </Title>
        <Title order={3}>{t('connection-settings:openspace-connection')}</Title>
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
        <Title order={3}>{t('default-page-size')}</Title>
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
          {t('create-show')}
        </Button>
        <Button variant={'filled'} onClick={onLoadShows}>
          {t('load-show')}
        </Button>
      </Group>
    </>
  );
}
