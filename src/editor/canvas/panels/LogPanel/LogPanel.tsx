import { useState } from 'react';
import { Box, Select, Stack, Table, Text } from '@mantine/core';
import { LogLevel, LogMessage } from 'openspace-api-js/types';

import { useSubscribeToErrorLog } from '@/hooks/topicSubscriptions';

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

const logLevelColors: Record<string, string> = {
  Trace: 'gray.5',
  Debug: 'blue.5',
  Info: 'green.5',
  Warning: 'yellow.5',
  Error: 'red.5',
  Fatal: 'red.7'
};

function logLevelColor(level: string | undefined): string {
  return (level && logLevelColors[level]) || 'gray.6';
}

const logLevelValueSet = new Set<string>(Object.values(LogLevel));

function isLogLevel(value: string): value is LogLevel {
  return logLevelValueSet.has(value);
}

export function LogPanel() {
  const { errorLog, setLogLevel: updateLogLevel } = useSubscribeToErrorLog();
  const [logLevel, setLogLevel] = useState<LogLevel>(LogLevel.All);

  function handleLogLevelChange(value: string) {
    if (!isLogLevel(value)) {
      return;
    }
    setLogLevel(value);
    updateLogLevel(value);
  }

  return (
    <Stack
      pos={'absolute'}
      left={0}
      mt={'xs'}
      w={'100%'}
      gap={'md'}
      style={{ zIndex: 9 }}
    >
      <Text px={'md'} fw={500}>
        Error Logs
      </Text>

      <Box px={'md'}>
        <Select
          allowDeselect={false}
          data={logLevelOptions}
          placeholder={'Select log level'}
          value={logLevel}
          disabled={logLevelOptions.length === 0}
          onChange={(value) => value && handleLogLevelChange(value)}
        />
      </Box>

      <Table layout={'fixed'} verticalSpacing={2} fz={'sm'}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={100}>Time</Table.Th>
            <Table.Th w={100}>Level</Table.Th>
            <Table.Th w={150}>Source</Table.Th>
            <Table.Th>Message</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {errorLog.map((log: LogMessage, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <Text size={'sm'} c={'dimmed'}>
                  {log.timeStamp}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size={'sm'} fw={600} c={logLevelColor(log.level)}>
                  [{log.level}]
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size={'sm'} c={'dimmed'}>
                  {log.category}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size={'sm'} truncate>
                  {log.message}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
