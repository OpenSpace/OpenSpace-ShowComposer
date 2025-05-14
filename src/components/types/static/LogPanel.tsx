import { useEffect, useState } from 'react';

import SelectableDropdown from '@/components/common/SelectableDropdown';
import { Label } from '@/components/ui/label';
import { ConnectionState, useOpenSpaceApiStore, usePropertyStore } from '@/store';

const LogPanel = () => {
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore((state) => state.unsubscribeFromTopic);
  const errorLog = usePropertyStore((state) => state.errorLog);

  const [logLevel, setLogLevel] = useState('All');

  const logLevelOptions = [
    { value: 'All', label: 'All' },
    { value: 'Debug', label: 'Debug' },
    { value: 'Info', label: 'Info' },
    { value: 'Warning', label: 'Warning' },
    { value: 'Error', label: 'Error' }
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
          {errorLog.map((log, index) => {
            const match = log.match(/\[(.*?)\] (.*?) \((.*?)\)\t(.*)/);
            if (!match) return null;

            const [, timestamp, source, level, message] = match;
            const timeOnly = timestamp.split(' | ')[1];

            return (
              <div
                key={index}
                className={'grid w-full grid-cols-[100px_100px_150px_1fr] gap-2 text-sm'}
              >
                <span className={'text-gray-500'}>{timeOnly}</span>
                <span
                  className={`font-semibold ${
                    level === 'Debug'
                      ? 'text-blue-500'
                      : level === 'Info'
                        ? 'text-green-500'
                        : level === 'Warning'
                          ? 'text-yellow-500'
                          : level === 'Error'
                            ? 'text-red-500'
                            : 'text-gray-500'
                  }`}
                >
                  [{level}]
                </span>
                <span className={'text-gray-400'}>{source}</span>
                <span className={'truncate'}>{message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LogPanel;
