import { useEffect, useState } from 'react';
import { LogLevel, LogMessage } from 'openspace-api-js/types';

import SelectableDropdown from '@/components/common/SelectableDropdown';
import { Label } from '@/components/ui/label';
import { ConnectionState, useOpenSpaceApiStore, usePropertyStore } from '@/store';

const logLevelOptions: { value: LogLevel; label: string }[] = [
  { value: LogLevel.All, label: 'All Logging' },
  { value: LogLevel.Trace, label: 'Trace' },
  { value: LogLevel.Debug, label: 'Debug' },
  { value: LogLevel.Info, label: 'Info' },
  { value: LogLevel.Warning, label: 'Warning' },
  { value: LogLevel.Error, label: 'Error' },
  { value: LogLevel.Fatal, label: 'Fatal' },
  { value: LogLevel.NoLogging, label: 'No Logging' }
];

const logLevelValueSet = new Set<string>(Object.values(LogLevel));

function isLogLevel(value: string): value is LogLevel {
  return logLevelValueSet.has(value);
}

const LogPanel = () => {
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore((state) => state.unsubscribeFromTopic);
  const errorLog = usePropertyStore((state) => state.errorLog);

  const [logLevel, setLogLevel] = useState<LogLevel>(LogLevel.All);

  const handleLogLevelChange = (value: string) => {
    if (!isLogLevel(value)) {
      return;
    }

    setLogLevel(value);
    subscribeToTopic('errorLog', undefined, {
      settings: {
        timeStamping: true,
        dateStamping: true,
        categoryStamping: true,
        logLevelStamping: true,
        logLevel: value
      }
    });
  };

  useEffect(() => {
    // return;
    if (connectionState != ConnectionState.CONNECTED) return;
    subscribeToTopic('errorLog', undefined, {
      settings: {
        timeStamping: true,
        dateStamping: true,
        categoryStamping: true,
        logLevelStamping: true,
        logLevel: LogLevel.All
      }
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
          {errorLog.map((log: LogMessage, index) => {
            const levelString = log.level;

            return (
              <div
                key={index}
                className={'grid w-full grid-cols-[100px_100px_150px_1fr] gap-2 text-sm'}
              >
                <span className={'text-gray-500'}>{log.timeStamp}</span>
                <span
                  className={`font-semibold ${
                    levelString === 'Trace'
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
