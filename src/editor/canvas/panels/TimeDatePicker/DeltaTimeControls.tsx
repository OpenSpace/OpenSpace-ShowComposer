import { useEffect, useRef, useState } from 'react';
import { Button, InputLabel, NumberInput, SimpleGrid, Stack, Text } from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import SelectableDropdown from '@/components/SelectableDropdown';
import { useSubscribeToTime } from '@/hooks/topicSubscriptions';
import { FastForwardIcon, PauseIcon, PlayIcon, RewindIcon } from '@/icons/icons';
import { getCopy } from '@/utils/copyHelpers';

import { round10, StepPrecisions, Steps, StepSizes, updateDeltaTime } from './utils';

export function DeltaTimeControls() {
  const [stepSize, setStepSize] = useState('Seconds');
  const [paused, setPaused] = useState(false);
  const [localDelta, setLocalDelta] = useState(0);

  const luaApi = useOpenSpaceApi();

  const {
    targetDeltaTime,
    isPaused,
    hasNextStep: hasNextDeltaTimeStep,
    hasPrevStep: hasPrevDeltaTimeStep,
    nextStep: nextDeltaTimeStep,
    prevStep: prevDeltaTimeStep
  } = useSubscribeToTime(1000);

  const isEditingDelta = useRef(false);

  const adjustedNextDelta = round10(
    nextDeltaTimeStep ? nextDeltaTimeStep / StepSizes[stepSize] : 0,
    StepPrecisions[stepSize]
  );
  const adjustedPrevDelta = round10(
    prevDeltaTimeStep ? prevDeltaTimeStep / StepSizes[stepSize] : 0,
    StepPrecisions[stepSize]
  );

  useEffect(() => {
    if (!isEditingDelta.current) {
      const adjustedDelta = round10(
        targetDeltaTime ? targetDeltaTime / StepSizes[stepSize] : 0,
        StepPrecisions[stepSize]
      );
      setLocalDelta(adjustedDelta);
    }
  }, [targetDeltaTime, stepSize]);

  useEffect(() => {
    setPaused(isPaused || false);
  }, [isPaused]);

  function setNextDeltaTimeStep() {
    updateDeltaTime.cancel();
    luaApi?.time.interpolateNextDeltaTimeStep();
  }

  function setPrevDeltaTimeStep() {
    updateDeltaTime.cancel();
    luaApi?.time.interpolatePreviousDeltaTimeStep();
  }

  function togglePause() {
    setPaused((p) => !p);
    luaApi?.time.togglePause();
  }

  function setDeltaTime(value: number) {
    isEditingDelta.current = true;
    setLocalDelta(value);
    const deltaTime = value * StepSizes[stepSize];
    if (Number.isNaN(deltaTime)) {
      return;
    }
    if (luaApi) {
      updateDeltaTime(luaApi, deltaTime);
    }
  }

  function beginEditingDelta() {
    isEditingDelta.current = true;
  }

  function endEditingDelta() {
    isEditingDelta.current = false;
  }

  return (
    <Stack gap={'xl'}>
      <SimpleGrid cols={2} spacing={'xs'}>
        <InputLabel>{getCopy('TimeDatePicker', 'simulation_speed')}</InputLabel>
        <InputLabel>{`${stepSize} / second`}</InputLabel>
        <SelectableDropdown
          placeholder={'Select a Unit'}
          options={Object.values(Steps)}
          selected={stepSize}
          setSelected={setStepSize}
        />
        <NumberInput
          min={-1000}
          max={1000}
          step={1}
          disabled={!luaApi}
          onFocus={beginEditingDelta}
          onBlur={endEditingDelta}
          onChange={(value) =>
            setDeltaTime(typeof value === 'number' ? value : parseFloat(value))
          }
          placeholder={`${stepSize} / second`}
          value={localDelta}
        />
      </SimpleGrid>
      <SimpleGrid cols={3} spacing={'xs'}>
        <Stack gap={2}>
          <Button disabled={!hasPrevDeltaTimeStep} onClick={setPrevDeltaTimeStep}>
            <RewindIcon size={20} />
          </Button>
          <Text size={'xs'} c={'dimmed'}>
            {hasPrevDeltaTimeStep ? `${adjustedPrevDelta} ${stepSize} / second` : 'None'}
          </Text>
        </Stack>
        <Button onClick={togglePause}>
          {paused ? <PlayIcon size={20} /> : <PauseIcon size={20} />}
        </Button>
        <Stack gap={2}>
          <Button disabled={!hasNextDeltaTimeStep} onClick={setNextDeltaTimeStep}>
            <FastForwardIcon size={20} />
          </Button>
          <Text size={'xs'} c={'dimmed'}>
            {hasNextDeltaTimeStep ? `${adjustedNextDelta} ${stepSize} / second` : 'None'}
          </Text>
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
