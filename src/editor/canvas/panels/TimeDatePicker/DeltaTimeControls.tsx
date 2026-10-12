import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  InputLabel,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text
} from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import { useSubscribeToTime } from '@/hooks/topicSubscriptions';
import { FastForwardIcon, PauseIcon, PlayIcon, RewindIcon } from '@/icons/icons';
import { IconSize } from '@/types/enums';

import {
  round10,
  StepPrecisions,
  StepSizes,
  type StepUnit,
  StepUnits,
  updateDeltaTime
} from './utils';

export function DeltaTimeControls() {
  const { t } = useTranslation('time-date-picker');
  const [stepSize, setStepSize] = useState<StepUnit>('seconds');
  const [paused, setPaused] = useState(false);
  const [localDelta, setLocalDelta] = useState<number | string>(0);

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

  const unitPerSecond = t('unit-per-second', { unit: t(`unit-${stepSize}`) });

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

  function setDeltaTime(value: number | string) {
    isEditingDelta.current = true;
    setLocalDelta(value);
    const numericValue = typeof value === 'number' ? value : parseFloat(value);
    if (Number.isNaN(numericValue)) {
      return;
    }
    const deltaTime = numericValue * StepSizes[stepSize];
    if (luaApi) {
      updateDeltaTime(luaApi, deltaTime);
    }
  }

  function beginEditingDelta() {
    isEditingDelta.current = true;
  }

  function endEditingDelta() {
    isEditingDelta.current = false;
    const numericValue =
      typeof localDelta === 'number' ? localDelta : parseFloat(localDelta);
    if (Number.isNaN(numericValue)) {
      const adjustedDelta = round10(
        targetDeltaTime ? targetDeltaTime / StepSizes[stepSize] : 0,
        StepPrecisions[stepSize]
      );
      setLocalDelta(adjustedDelta);
    }
  }

  return (
    <Stack gap={'xl'}>
      <SimpleGrid cols={2} spacing={'xs'}>
        <InputLabel>{t('simulation-speed')}</InputLabel>
        <InputLabel>{unitPerSecond}</InputLabel>
        <Select
          allowDeselect={false}
          data={StepUnits.map((unit) => ({
            value: unit,
            label: t(`unit-${unit}`)
          }))}
          placeholder={t('select-unit')}
          value={stepSize}
          onChange={(value) => value && setStepSize(value as StepUnit)}
        />
        <NumberInput
          min={-1000}
          max={1000}
          step={1}
          disabled={!luaApi}
          onFocus={beginEditingDelta}
          onBlur={endEditingDelta}
          onChange={setDeltaTime}
          placeholder={unitPerSecond}
          value={localDelta}
        />
      </SimpleGrid>
      <SimpleGrid cols={3} spacing={'xs'}>
        <Stack gap={2}>
          <Button disabled={!hasPrevDeltaTimeStep} onClick={setPrevDeltaTimeStep}>
            <RewindIcon size={IconSize.md} />
          </Button>
          <Text size={'xs'} c={'dimmed'}>
            {hasPrevDeltaTimeStep
              ? t('value-unit-per-second', {
                  value: adjustedPrevDelta,
                  unit: t(`unit-${stepSize}`)
                })
              : t('none')}
          </Text>
        </Stack>
        <Button onClick={togglePause}>
          {paused ? <PlayIcon size={IconSize.md} /> : <PauseIcon size={IconSize.md} />}
        </Button>
        <Stack gap={2}>
          <Button disabled={!hasNextDeltaTimeStep} onClick={setNextDeltaTimeStep}>
            <FastForwardIcon size={IconSize.md} />
          </Button>
          <Text size={'xs'} c={'dimmed'}>
            {hasNextDeltaTimeStep
              ? t('value-unit-per-second', {
                  value: adjustedNextDelta,
                  unit: t(`unit-${stepSize}`)
                })
              : t('none')}
          </Text>
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
