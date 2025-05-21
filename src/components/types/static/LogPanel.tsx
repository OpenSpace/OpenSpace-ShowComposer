import { useEffect, useState } from 'react';

import SelectableDropdown from '@/components/common/SelectableDropdown';
import { Label } from '@/components/ui/label';
import { ConnectionState, useOpenSpaceApiStore, usePropertyStore } from '@/store';

interface LogEntry {
  category: string;
  dateStamp: string;
  level: number;
  message: string;
  timeStamp: string;
}

const getLevelString = (level: number): string => {
  switch (level) {
    case 0: return 'NoLogging';
    case 1: return 'Trace';
    case 2: return 'Debug';
    case 3: return 'Info';
    case 4: return 'Warning';
    case 5: return 'Error';
    case 6: return 'Fatal';
    case 7: return 'AllLogging';
    default: return 'Unknown';
  }
};

const LogPanel = () => {
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore((state) => state.unsubscribeFromTopic);
  const errorLog = usePropertyStore((state) => state.errorLog);

  const [logLevel, setLogLevel] = useState('AllLogging');

  const logLevelOptions = [
    { value: 'AllLogging', label: 'All Logging' },
    { value: 'Trace', label: 'Trace' },
    { value: 'Debug', label: 'Debug' },
    { value: 'Info', label: 'Info' },
    { value: 'Warning', label: 'Warning' },
    { value: 'Error', label: 'Error' },
    { value: 'Fatal', label: 'Fatal' },
    { value: 'NoLogging', label: 'No Logging' }
  ];

  const handleLogLevelChange = (value: string) => {
    setLogLevel(value);
    subscribeToTopic('errorLog', undefined, undefined, {
      timeStamping: true,
      dateStamping: true,
      categoryStamping: true,
      logLevelStamping: true,
      logLevel: value
    });
  };

  useEffect(() => {
    console.log('errorLog', errorLog);
  }, [errorLog]);

  useEffect(() => {
    // return;
    if (connectionState != ConnectionState.CONNECTED) return;
    subscribeToTopic('errorLog', undefined, undefined, {
      timeStamping: true,
      dateStamping: true,
      categoryStamping: true,
      logLevelStamping: true,
      logLevel: 'All'
    });

    return () => {
      unsubscribeFromTopic('errorLog');
      // useOpenSpaceApiStore.getState().unsubscribeFromTopic('errorLog');
    };
  }, [connectionState]);

  return (
    <div className={'flex flex-col'}>
      <div
        className={
          'z-9 absolute left-0 mt-2 flex w-full flex-col items-center justify-center gap-4'
        }
      >
        <Label className={'flex w-full justify-start px-4'}>Error Logs</Label>

        <div className={'flex w-full justify-start px-4'}>
          <SelectableDropdown
            options={logLevelOptions}
            selected={logLevel}
            setSelected={handleLogLevelChange}
            placeholder={'Select log level'}
          />
        </div>

        <div className={'space-y-1'}>
          <div
            className={
              ' mb-1 grid w-full grid-cols-[100px_100px_150px_1fr] gap-2 text-sm font-medium text-gray-500'
            }
          >
            <div>Time</div>
            <div>Level</div>
            <div>Source</div>
            <div>Message</div>
          </div>
          {errorLog.map((log: LogEntry, index) => {
            const levelString = getLevelString(log.level);

            return (
              <div
                key={index}
                className={'grid w-full grid-cols-[100px_100px_150px_1fr] gap-2 text-sm'}
              >
                <span className={'text-gray-500'}>{log.timeStamp}</span>
                <span
                  className={`font-semibold ${levelString === 'Trace'
                    ? 'text-gray-400'
                    : levelString === 'Debug'
                      ? 'text-blue-500'
                      : levelString === 'Info'
                        ? 'text-green-500'
                        : levelString === 'Warning'
                          ? 'text-yellow-500'
                          : levelString === 'Error'
                            ? 'text-red-500'
                            : levelString === 'Fatal'
                              ? 'text-red-700'
                              : 'text-gray-500'
                    }`}
                >
                  [{levelString}]
                </span>
                <span className={'text-gray-400'}>{log.category}</span>
                <span className={'truncate'}>{log.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LogPanel;
