import { Group, InputLabel, Text } from '@mantine/core';

import { useConnectionStatus } from '@/hooks/util';
import { CircleCheckIcon, CircleHelpIcon, CircleXIcon, RadioIcon } from '@/icons/icons';
import { ConnectionStatus } from '@/types/enums';
import { getCopy } from '@/utils/copyHelpers';

import classes from './ConnectionStatusIndicator.module.css';

export function ConnectionStatusIndicator() {
  const connectionStatus = useConnectionStatus();

  function renderConnectionState(size: number) {
    switch (connectionStatus) {
      case ConnectionStatus.Connected:
        return (
          <Group gap={4} wrap={'nowrap'}>
            <CircleCheckIcon size={size} color={'green'} />
            <InputLabel size={'xs'}>
              {getCopy('ConnectionSettings', 'connected')}
            </InputLabel>
          </Group>
        );
      case ConnectionStatus.Connecting:
        return (
          <Group gap={4} wrap={'nowrap'} className={classes.pulse}>
            <RadioIcon size={size} color={'orange'} />
            <InputLabel size={'xs'}>
              {getCopy('ConnectionSettings', 'connecting')}
            </InputLabel>
          </Group>
        );
      case ConnectionStatus.Disconnected:
        return (
          <Group gap={4} wrap={'nowrap'}>
            <CircleXIcon size={size} color={'red'} />
            <InputLabel size={'xs'}>
              {getCopy('ConnectionSettings', 'disconnected')}
            </InputLabel>
          </Group>
        );
      default:
        return <CircleHelpIcon size={size} color={'black'} />;
    }
  }
  return (
    <Group gap={'sm'} wrap={'nowrap'}>
      <Text size={'xs'} fw={700}>
        {getCopy('ConnectionSettings', 'openspace_status:')}
      </Text>
      {renderConnectionState(20)}
    </Group>
  );
}
