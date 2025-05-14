import { useEffect, useMemo, useState } from 'react';
import { throttle } from 'lodash';
import { FastForward, Pause, Play,Rewind } from 'lucide-react';

import ButtonLabel from '@/components/common/ButtonLabel';
import SelectableDropdown from '@/components/common/SelectableDropdown';
import DateComponent from '@/components/timepicker/DateComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConnectionState, useOpenSpaceApiStore,usePropertyStore } from '@/store';
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
const TimeDatePicker = () => {
  const [stepSize, setStepSize] = useState('Seconds'); // Step 1: Add state for display unit

  const time = usePropertyStore((state) => state.time?.['timeCapped']);
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore((state) => state.unsubscribeFromTopic);
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const targetDeltaTime = usePropertyStore((state) => state.time?.targetDeltaTime);
  const isPaused = usePropertyStore((state) => state.time?.isPaused);
  const [paused, setPaused] = useState<boolean>(isPaused);
  const hasNextDeltaTimeStep = usePropertyStore((state) => state.time?.hasNextStep);
  const hasPrevDeltaTimeStep = usePropertyStore((state) => state.time?.hasPrevStep);
  const nextDeltaTimeStep = usePropertyStore((state) => state.time?.nextStep);
  const prevDeltaTimeStep = usePropertyStore((state) => state.time?.prevStep);
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
    setPaused(isPaused);
  }, [isPaused]);
  function setDate(newTime: Date) {
    // Spice, that is handling the time parsing in OpenSpace does not support
    // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
    // is given.
    try {
      const fixedTimeString = newTime.toJSON().replace('Z', '');
      luaApi?.time.setTime(fixedTimeString);
    } catch {
      luaApi?.time.setTime(time);
    }
  }
  function setDateRelative(delta: number) {
    try {
      const newTime = new Date(time);
      newTime.setSeconds(newTime.getSeconds() + delta);
      // Spice, that is handling the time parsing in OpenSpace does not support
      // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
      // is given.
      const fixedTimeString = newTime.toJSON().replace('Z', '');
      luaApi?.time.setTime(fixedTimeString);
    } catch {
      luaApi?.time.setTime(time);
    }
  }
  function interpolateDate(newTime: Date) {
    const fixedTimeString = newTime.toJSON().replace('Z', '');
    luaApi?.time.interpolateTime(fixedTimeString);
  }
  function interpolateDateRelative(delta: number) {
    luaApi?.time.interpolateTimeRelative(delta);
  }
  function changeDate(event // useLock: boolean,
  : {
    time: Date;
    interpolate: boolean;
    delta: number;
    relative: boolean;
  }) {
    // if (useLock) {
    // setPendingTime(new Date(event.time));
    // } else
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
  useEffect(() => {
    if (connectionState != ConnectionState.CONNECTED) return;
    subscribeToTopic('time', 1000);
    return () => {
      unsubscribeFromTopic('time');
    };
  }, [connectionState]);
  const timeLabel = useMemo(() => {
    if (time) {
      try {
        return formatDate(time);
      } catch {
        return time;
      }
    }
    return time;
  }, [time]);
  const round10 = (value: number, exp: number) => {
    const valueStr = value.toString();
    const [integer, decimal] = valueStr.split('.');
    if (decimal) {
      const decimalRounded = Math.round(Number(`0.${decimal}e${exp}`)).toString();
      return Number(`${integer}.${decimalRounded}`);
    }
    return value;
  };
  const adjustedDelta = round10(
    targetDeltaTime / StepSizes[stepSize],
    StepPrecisions[stepSize]
  );
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
    const dt = value;
    setDeltaTime(dt);
  }
  function setNegativeDeltaTime(value: number) {
    const dt = -value;
    setDeltaTime(dt);
  }
  function deltaTimeStepsContol() {
    const adjustedNextDelta = round10(
      nextDeltaTimeStep / StepSizes[stepSize],
      StepPrecisions[stepSize]
    );
    const adjustedPrevDelta = round10(
      prevDeltaTimeStep / StepSizes[stepSize],
      StepPrecisions[stepSize]
    );
    const nextLabel = hasNextDeltaTimeStep
      ? `${adjustedNextDelta} ${stepSize} / second`
      : 'None';
    const prevLabel = hasPrevDeltaTimeStep
      ? `${adjustedPrevDelta} ${stepSize} / second`
      : 'None';
    return (
      <div className={"grid grid-cols-3 gap-2"}>
        <div className={"gap-.5 grid"}>
          <Button
            variant={"outline"}
            size={"sm"}
            disabled={!hasPrevDeltaTimeStep}
            onClick={setPrevDeltaTimeStep}
          >
            <Rewind fill={"black"} />
          </Button>
          <Label className={"text-xs text-zinc-500"}> {prevLabel}</Label>
        </div>
        <Button variant={"outline"} size={"sm"} onClick={togglePause}>
          {paused ? <Play fill={"black"} /> : <Pause fill={"black"} />}
        </Button>
        <div className={"gap-.5 grid"}>
          <Button
            variant={"outline"}
            size={"sm"}
            disabled={!hasNextDeltaTimeStep}
            onClick={setNextDeltaTimeStep}
          >
            <FastForward fill={"black"} />
          </Button>
          <Label className={"text-xs text-zinc-500"}> {nextLabel}</Label>
        </div>
      </div>
    );
  }
  if (!time) return null;
  return (
    <div>
      <div className={"grid gap-2 p-0"}>
        <div className={"grid gap-2"}>
          <Label>{getCopy('TimeDatePicker', 'select_date')}</Label>
          <DateComponent date={time} onChange={changeDate} />
        </div>
        <div className={"grid gap-2"}>
          <Label>{getCopy('TimeDatePicker', 'simulation_speed')}</Label>
          {/* <Separator /> */}
          <SelectableDropdown
            placeholder={"Select a Unit"}
            options={Object.values(Steps)}
            selected={stepSize}
            setSelected={setStepSize}
          />
        </div>
        <div className={"grid grid-cols-2 gap-2"}>
          <div className={"gap-.5 grid"}>
            <Input
              {...Limits[stepSize]}
              disabled={!luaApi || adjustedDelta >= 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setNegativeDeltaTime(e.target.valueAsNumber);
              }}
              placeholder={`Negative ${stepSize} / second`}
              value={adjustedDelta >= 0 ? 0 : -adjustedDelta}
              type={"number"}
              // readOnly
              // reverse
              // noValue={adjustedDelta >= 0}
              // showOutsideRangeHint={false}
            />
            <Label className={"text-xs text-zinc-500"}>{`Negative ${stepSize} / second`}</Label>
          </div>
          <div className={"gap-.5 grid"}>
            <Input
              {...Limits[stepSize]}
              disabled={!luaApi || adjustedDelta < 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPositiveDeltaTime(e.target.valueAsNumber);
              }}
              placeholder={`${stepSize} / second`}
              value={adjustedDelta < 0 ? 0 : adjustedDelta}
              type={"number"}
              // readOnly
            />
            <Label className={"text-xs text-zinc-500"}>{`${stepSize} / second`}</Label>
          </div>
        </div>
        {deltaTimeStepsContol()}
        <div className={"grid grid-cols-2 gap-2"}>
          <Button
            variant={targetDeltaTime == 1 ? 'default' : 'outline'}
            size={"sm"}
            onClick={realtime}
            className={`${targetDeltaTime == 1 ? 'opacity-100' : 'opacity-60'}`}
          >
            {getCopy('TimeDatePicker', 'realtime')}
          </Button>
          <Button variant={"outline"} size={"sm"} onClick={now}>
            {getCopy('TimeDatePicker', 'now')}
          </Button>
        </div>
        {/* </div> */}
        <ButtonLabel className={"border bg-transparent"}>{timeLabel}</ButtonLabel>
      </div>
      {/* )} */}
    </div>
  );
};
export default TimeDatePicker;
