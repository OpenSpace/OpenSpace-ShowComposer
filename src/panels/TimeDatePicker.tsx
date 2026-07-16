import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  InputLabel,
  NumberInput,
  SimpleGrid,
  Stack,
  Text
} from '@mantine/core';
import { throttle } from 'lodash';

import { useOpenSpaceApi } from '@/api/hooks';
import SelectableDropdown from '@/components/SelectableDropdown';
import { useSubscribeToTime } from '@/hooks/topicSubscriptions';
import { FastForwardIcon, PauseIcon, PlayIcon, RewindIcon } from '@/icons/icons';
import { DateComponent } from '@/panels/DateComponent';
import { getCopy } from '@/utils/copyHelpers';
import { formatDate } from '@/utils/time';

const updateDelayMs = 1000;
const updateDeltaTimeNow = (
  openspace: any,
  value: number,
  _interpolationTime = undefined
) => {
  // Calling interpolateDeltaTime with one or two arguments actually make a difference,
  // even if the second argument is undefined. This is because undefined is translated to
  // nil in the mapping to the underlying lua api.
  // Hence, we check for undefined below:
  // if (interpolationTime === undefined) {
  //   openspace.time.interpolateDeltaTime(value);
  // } else {
  //   openspace.time.interpolateDeltaTime(value, interpolationTime);
  // }
  openspace.time.interpolateDeltaTime(value);
};
const updateDeltaTime = throttle(updateDeltaTimeNow, updateDelayMs);
const Steps = {
  seconds: 'Seconds',
  minutes: 'Minutes',
  hours: 'Hours',
  days: 'Days',
  months: 'Months',
  years: 'Years'
};
const StepSizes = {
  [Steps.seconds]: 1,
  [Steps.minutes]: 60,
  [Steps.hours]: 3600,
  [Steps.days]: 86400,
  [Steps.months]: 2678400,
  [Steps.years]: 31536000
};
const StepPrecisions = {
  [Steps.seconds]: 0,
  [Steps.minutes]: -3,
  [Steps.hours]: -4,
  [Steps.days]: -5,
  [Steps.months]: -7,
  [Steps.years]: -10
};
const Limits = {
  [Steps.seconds]: {
    min: 0,
    max: 300,
    step: 1
  },
  [Steps.minutes]: {
    min: 0,
    max: 300,
    step: 0.001
  },
  [Steps.hours]: {
    min: 0,
    max: 300,
    step: 0.0001
  },
  [Steps.days]: {
    min: 0,
    max: 10,
    step: 0.000001
  },
  [Steps.months]: {
    min: 0,
    max: 10,
    step: 0.00000001
  },
  [Steps.years]: {
    min: 0,
    max: 1,
    step: 0.0000000001
  }
};
Object.freeze(Steps);
Object.freeze(StepSizes);
Object.freeze(StepPrecisions);
Object.freeze(Limits);

const round10 = (value: number, exp: number) => {
  const valueStr = value.toString();
  const [integer, decimal] = valueStr.split('.');
  if (decimal) {
    const decimalRounded = Math.round(Number(`0.${decimal}e${exp}`)).toString();
    return Number(`${integer}.${decimalRounded}`);
  }
  return value;
};

export function TimeDatePicker() {
  const [stepSize, setStepSize] = useState('Seconds');

  const luaApi = useOpenSpaceApi();
  const {
    timeCapped: time,
    targetDeltaTime,
    isPaused,
    hasNextStep: hasNextDeltaTimeStep,
    hasPrevStep: hasPrevDeltaTimeStep,
    nextStep: nextDeltaTimeStep,
    prevStep: prevDeltaTimeStep
  } = useSubscribeToTime(1000);
  const [paused, setPaused] = useState<boolean>(isPaused || false);

  const adjustedDelta = round10(
    targetDeltaTime ? targetDeltaTime / StepSizes[stepSize] : 0,
    StepPrecisions[stepSize]
  );

  const [localDelta, setLocalDelta] = useState(adjustedDelta);
  const isEditingDelta = useRef(false);
  useEffect(() => {
    if (!isEditingDelta.current) {
      setLocalDelta(adjustedDelta);
    }
  }, [adjustedDelta]);

  function setNextDeltaTimeStep() {
    updateDeltaTime.cancel();
    luaApi?.time.interpolateNextDeltaTimeStep();
  }
  function setPrevDeltaTimeStep() {
    updateDeltaTime.cancel();
    luaApi?.time.interpolatePreviousDeltaTimeStep();
  }
  function togglePause() {
    setPaused((paused: boolean) => !paused);
    luaApi?.time.togglePause();
  }
  useEffect(() => {
    setPaused(isPaused || false);
  }, [isPaused]);
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
  function realtime() {
    luaApi?.time.interpolateDeltaTime(1);
  }
  function now() {
    setDate(new Date());
  }

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

  function setDeltaTime(value: number) {
    const deltaTime = value * StepSizes[stepSize];
    if (Number.isNaN(deltaTime)) {
      return;
    }
    if (luaApi) {
      updateDeltaTimeNow(luaApi, deltaTime);
    }
  }

  function setPositiveDeltaTime(value: number) {
    isEditingDelta.current = true;
    setLocalDelta(value);
    setDeltaTime(value);
  }
  function setNegativeDeltaTime(value: number) {
    isEditingDelta.current = true;
    setLocalDelta(-value);
    setDeltaTime(-value);
  }
  function beginEditingDelta() {
    isEditingDelta.current = true;
  }
  function endEditingDelta() {
    isEditingDelta.current = false;
    setLocalDelta(adjustedDelta);
  }

  function deltaTimeStepsControl() {
    const adjustedNextDelta = round10(
      nextDeltaTimeStep ? nextDeltaTimeStep / StepSizes[stepSize] : 0,
      StepPrecisions[stepSize]
    );
    const adjustedPrevDelta = round10(
      prevDeltaTimeStep ? prevDeltaTimeStep / StepSizes[stepSize] : 0,
      StepPrecisions[stepSize]
    );
    const nextLabel = hasNextDeltaTimeStep
      ? `${adjustedNextDelta} ${stepSize} / second`
      : 'None';
    const prevLabel = hasPrevDeltaTimeStep
      ? `${adjustedPrevDelta} ${stepSize} / second`
      : 'None';
    return (
      <SimpleGrid cols={3} spacing={'xs'}>
        <Stack gap={2}>
          <Button disabled={!hasPrevDeltaTimeStep} onClick={setPrevDeltaTimeStep}>
            <RewindIcon />
          </Button>
          <Text size={'xs'} c={'dimmed'}>
            {prevLabel}
          </Text>
        </Stack>
        <Button onClick={togglePause}>{paused ? <PlayIcon /> : <PauseIcon />}</Button>
        <Stack gap={2}>
          <Button disabled={!hasNextDeltaTimeStep} onClick={setNextDeltaTimeStep}>
            <FastForwardIcon />
          </Button>
          <Text size={'xs'} c={'dimmed'}>
            {nextLabel}
          </Text>
        </Stack>
      </SimpleGrid>
    );
  }
  if (!time) return null;
  return (
    <Stack gap={'xs'}>
      <Stack gap={'xs'}>
        <InputLabel>{getCopy('TimeDatePicker', 'select_date')}</InputLabel>
        <DateComponent date={time} onChange={changeDate} />
      </Stack>
      <Stack gap={'xs'}>
        <InputLabel>{getCopy('TimeDatePicker', 'simulation_speed')}</InputLabel>
        <SelectableDropdown
          placeholder={'Select a Unit'}
          options={Object.values(Steps)}
          selected={stepSize}
          setSelected={setStepSize}
        />
      </Stack>
      <SimpleGrid cols={2} spacing={'xs'}>
        <Stack gap={2}>
          <NumberInput
            {...Limits[stepSize]}
            disabled={!luaApi || localDelta >= 0}
            onFocus={beginEditingDelta}
            onBlur={endEditingDelta}
            onChange={(value) =>
              setNegativeDeltaTime(typeof value === 'number' ? value : parseFloat(value))
            }
            placeholder={`Negative ${stepSize} / second`}
            value={localDelta >= 0 ? 0 : -localDelta}
          />
          <Text size={'xs'} c={'dimmed'}>{`Negative ${stepSize} / second`}</Text>
        </Stack>
        <Stack gap={2}>
          <NumberInput
            {...Limits[stepSize]}
            disabled={!luaApi || localDelta < 0}
            onFocus={beginEditingDelta}
            onBlur={endEditingDelta}
            onChange={(value) =>
              setPositiveDeltaTime(typeof value === 'number' ? value : parseFloat(value))
            }
            placeholder={`${stepSize} / second`}
            value={localDelta < 0 ? 0 : localDelta}
          />
          <Text size={'xs'} c={'dimmed'}>{`${stepSize} / second`}</Text>
        </Stack>
      </SimpleGrid>
      {deltaTimeStepsControl()}
      <SimpleGrid cols={2} spacing={'xs'}>
        <Button
          variant={targetDeltaTime == 1 ? 'filled' : 'default'}
          onClick={realtime}
          style={{ opacity: targetDeltaTime == 1 ? 1 : 0.6 }}
        >
          {getCopy('TimeDatePicker', 'realtime')}
        </Button>
        <Button onClick={now}>{getCopy('TimeDatePicker', 'now')}</Button>
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
