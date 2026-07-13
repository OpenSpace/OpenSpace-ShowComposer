import { InputLabel } from '@mantine/core';
import { CheckCircle, HelpCircle, Radio, XCircle } from 'lucide-react';

import { useConnectionStatus } from '@/hooks/util';
import { ConnectionStatus } from '@/types/enums';
import { getCopy } from '@/utils/copyHelpers';

export function ConnectionStatusIndicator() {
  const connectionStatus = useConnectionStatus();

  function renderConnectionState(size: number) {
    switch (connectionStatus) {
      case ConnectionStatus.Connected:
        return (
          <div className={'flex items-center gap-1'}>
            <CheckCircle size={size} stroke={'green'} strokeWidth={2} />
            <InputLabel className={'text-xs'}>
              {getCopy('ConnectionSettings', 'connected')}
            </InputLabel>
          </div>
        );
      case ConnectionStatus.Connecting:
        return (
          <div className={'flex items-center gap-1'}>
            <Radio
              size={size}
              className={'animate-pulse'}
              stroke={'orange'}
              strokeWidth={2}
            />
            <InputLabel className={'animate-pulse text-xs'}>
              {getCopy('ConnectionSettings', 'connecting')}
            </InputLabel>
          </div>
        );
      case ConnectionStatus.Disconnected:
        return (
          <div className={'flex items-center gap-1'}>
            <XCircle size={size} stroke={'red'} strokeWidth={2} />{' '}
            <InputLabel className={'text-xs'}>
              {getCopy('ConnectionSettings', 'disconnected')}
            </InputLabel>
          </div>
        );
      default:
        return <HelpCircle size={size} color={'black'} />;
    }
  }
  return (
    <div className={'flex flex-row items-center gap-3'}>
      <h2 className={' text-xs font-bold'}>
        {getCopy('ConnectionSettings', 'openspace_status:')}
      </h2>
      {renderConnectionState(20)}
    </div>
  );
}
