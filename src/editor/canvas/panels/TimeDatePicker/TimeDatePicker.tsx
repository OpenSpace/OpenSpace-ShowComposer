import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, InputLabel, SimpleGrid, Stack } from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import { DateTimeStepper } from '@/components/DateTimeStepper';
import { useSubscribeToTime } from '@/hooks/topicSubscriptions';
import { formatDate } from '@/utils/time';

import { DeltaTimeControls } from './DeltaTimeControls';

export function TimeDatePicker() {
  const { t } = useTranslation('time-date-picker');
  const luaApi = useOpenSpaceApi();
  const { timeCapped: time, targetDeltaTime } = useSubscribeToTime(1000);
  console.log(targetDeltaTime);
  const timeLabel = useMemo(() => {
    if (time) {
      try {
        if (typeof time === 'string') {
          return time;
        } else {
          return formatDate(time);
        }
      } catch {
        return time;
      }
    }
    return time;
  }, [time]);

  // Spice does not support ISO 8601 time zones (the
  // trailing Z) but always assumes UTC, so we strip the Z before sending.
  function setDate(newTime: Date) {
    try {
      const fixedTimeString = newTime.toJSON().replace('Z', '');
      luaApi?.time.setTime(fixedTimeString);
    } catch {
      luaApi?.time.setTime(time || '');
    }
  }

  function setDateRelative(delta: number) {
    try {
      const newTime = new Date(time || '');
      newTime.setSeconds(newTime.getSeconds() + delta);
      const fixedTimeString = newTime.toJSON().replace('Z', '');
      luaApi?.time.setTime(fixedTimeString);
    } catch {
      luaApi?.time.setTime(time || '');
    }
  }

  function interpolateDate(newTime: Date) {
    const fixedTimeString = newTime.toJSON().replace('Z', '');
    luaApi?.time.interpolateTime(fixedTimeString);
  }

  function interpolateDateRelative(delta: number) {
    luaApi?.time.interpolateTimeRelative(delta);
  }

  function changeDate(event: {
    time: Date;
    interpolate: boolean;
    delta: number;
    relative: boolean;
  }) {
    if (event.interpolate) {
      if (event.relative) {
        interpolateDateRelative(event.delta);
      } else {
        interpolateDate(event.time);
      }
    } else if (event.relative) {
      setDateRelative(event.delta);
    } else {
      setDate(event.time);
    }
  }

  function setToRealTime() {
    luaApi?.time.interpolateDeltaTime(1);
  }

  function setTimeToNow() {
    setDate(new Date());
  }

  if (!time) return null;
  return (
    <Stack gap={'xs'}>
      <Stack gap={'xs'}>
        <InputLabel>{t('select-date')}</InputLabel>
        <DateTimeStepper date={time} onChange={changeDate} />
      </Stack>
      <DeltaTimeControls />
      <SimpleGrid cols={2} spacing={'xs'}>
        <Button
          variant={targetDeltaTime == 1 ? 'filled' : 'default'}
          onClick={setToRealTime}
        >
          {t('realtime')}
        </Button>
        <Button onClick={setTimeToNow}>{t('now')}</Button>
      </SimpleGrid>
      <Box
        ta={'center'}
        fz={'sm'}
        px={'md'}
        py={'xs'}
        style={{
          border: '1px solid var(--mantine-color-default-border)',
          borderRadius: 'var(--mantine-radius-md)'
        }}
      >
        {timeLabel}
      </Box>
    </Stack>
  );
}
