import { useTranslation } from 'react-i18next';
import { Group, InputLabel, Text } from '@mantine/core';

import { useConnectionStatus } from '@/hooks/util';
import { CircleCheckIcon, CircleHelpIcon, CircleXIcon, RadioIcon } from '@/icons/icons';
import { ConnectionStatus } from '@/types/enums';

import classes from './ConnectionStatusIndicator.module.css';

export function ConnectionStatusIndicator() {
  const { t } = useTranslation('connection-settings');
  const connectionStatus = useConnectionStatus();

  function renderConnectionState(size: number) {
    switch (connectionStatus) {
      case ConnectionStatus.Connected:
        return (
          <Group gap={4} wrap={'nowrap'}>
            <CircleCheckIcon size={size} color={'green'} />
            <InputLabel size={'xs'}>{t('connected')}</InputLabel>
          </Group>
        );
      case ConnectionStatus.Connecting:
        return (
          <Group gap={4} wrap={'nowrap'} className={classes.pulse}>
            <RadioIcon size={size} color={'orange'} />
            <InputLabel size={'xs'}>{t('connecting')}</InputLabel>
          </Group>
        );
      case ConnectionStatus.Disconnected:
        return (
          <Group gap={4} wrap={'nowrap'}>
            <CircleXIcon size={size} color={'red'} />
            <InputLabel size={'xs'}>{t('disconnected')}</InputLabel>
          </Group>
        );
      default:
        return <CircleHelpIcon size={size} color={'black'} />;
    }
  }
  return (
    <Group gap={'sm'} wrap={'nowrap'}>
      <Text size={'xs'} fw={700}>
        {t('openspace-status')}
      </Text>
      {renderConnectionState(20)}
    </Group>
  );
}
