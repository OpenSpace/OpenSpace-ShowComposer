import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Select, Stack, Table, Text } from '@mantine/core';
import { LogLevel, type LogMessage } from 'openspace-api-js/types';

import { useSubscribeToErrorLog } from '@/hooks/topicSubscriptions';

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
  const { t } = useTranslation('log-panel');
  const { errorLog, setLogLevel: updateLogLevel } = useSubscribeToErrorLog();
  const [logLevel, setLogLevel] = useState<LogLevel>(LogLevel.All);

  const logLevelOptions: { value: LogLevel; label: string }[] = [
    { value: LogLevel.All, label: t('all-logging') },
    { value: LogLevel.Trace, label: t('trace') },
    { value: LogLevel.Debug, label: t('debug') },
    { value: LogLevel.Info, label: t('info') },
    { value: LogLevel.Warning, label: t('warning') },
    { value: LogLevel.Error, label: t('error') },
    { value: LogLevel.Fatal, label: t('fatal') },
    { value: LogLevel.NoLogging, label: t('no-logging') }
  ];

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
        {t('title')}
      </Text>

      <Box px={'md'}>
        <Select
          allowDeselect={false}
          data={logLevelOptions}
          placeholder={t('select-log-level')}
          value={logLevel}
          disabled={logLevelOptions.length === 0}
          onChange={(value) => value && handleLogLevelChange(value)}
        />
      </Box>

      <Table layout={'fixed'} verticalSpacing={2} fz={'sm'}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={100}>{t('time')}</Table.Th>
            <Table.Th w={100}>{t('level')}</Table.Th>
            <Table.Th w={150}>{t('source')}</Table.Th>
            <Table.Th>{t('message')}</Table.Th>
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
