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
  onLoadProjects: () => void;
}

export function NewProjectModal({ onClose, onLoadProjects }: Props) {
  const { t } = useTranslation(['new-project-modal', 'connection-settings']);
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

  function handleSubmit() {
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
    onClose();
  }

  return (
    <>
      <Text>{t('project-details')}</Text>
      <Title order={2} my={'xs'}>
        {t('show-settings')}
      </Title>
      <Stack gap={'xs'}>
        <TextInput
          label={t('project-name')}
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
          {t('create-project')}
        </Button>
        <Button variant={'filled'} onClick={onLoadProjects}>
          {t('load-project')}
        </Button>
      </Group>
    </>
  );
}
