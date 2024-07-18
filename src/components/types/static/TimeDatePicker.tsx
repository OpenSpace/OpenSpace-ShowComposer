import { useEffect, useMemo } from 'react';
import {
  ConnectionState,
  usePropertyStore,
  useOpenSpaceApiStore,
} from '@/store';

import DateComponent from '@/components/timepicker/DateComponent';
import { Button } from '@/components/ui/button';

const TimeDatePicker = () => {
  // const [pendingTime, setPendingTime] = useState(new Date());

  // const [date, setDate] = useState(new Date());

  // const [dateString, setDateString] = useState(new Date());

  // const [simulationSpeed, setSimulationSpeed] = useState(1);
  // const [displayUnit, setDisplayUnit] = useState('seconds'); // Step 1: Add state for display unit

  // const handleDateChange = (newDate: Date) => {
  //   setDate(newDate);
  //   // Update simulation time based on newDate
  // };

  const Steps = {
    seconds: 'Seconds',
    minutes: 'Minutes',
    hours: 'Hours',
    days: 'Days',
    months: 'Months',
    years: 'Years',
  };
  const StepSizes = {
    [Steps.seconds]: 1,
    [Steps.minutes]: 60,
    [Steps.hours]: 3600,
    [Steps.days]: 86400,
    [Steps.months]: 2678400,
    [Steps.years]: 31536000,
  };
  const StepPrecisions = {
    [Steps.seconds]: 0,
    [Steps.minutes]: -3,
    [Steps.hours]: -4,
    [Steps.days]: -5,
    [Steps.months]: -7,
    [Steps.years]: -10,
  };
  const Limits = {
    [Steps.seconds]: { min: 0, max: 300, step: 1 },
    [Steps.minutes]: { min: 0, max: 300, step: 0.001 },
    [Steps.hours]: { min: 0, max: 300, step: 0.0001 },
    [Steps.days]: { min: 0, max: 10, step: 0.000001 },
    [Steps.months]: { min: 0, max: 10, step: 0.00000001 },
    [Steps.years]: { min: 0, max: 1, step: 0.0000000001 },
  };
  Object.freeze(Steps);
  Object.freeze(StepSizes);
  Object.freeze(StepPrecisions);
  Object.freeze(Limits);

  // const handleSimulationSpeedChange = (value: number) => {
  //   let adjustedSpeed = value;
  //   // Step 3: Adjust speed based on selected unit
  //   switch (displayUnit) {
  //     case 'minutes':
  //       adjustedSpeed *= 60;
  //       break;
  //     case 'hours':
  //       adjustedSpeed *= 3600;
  //       break;
  //     case 'days':
  //       adjustedSpeed *= 86400;
  //       break;
  //     case 'years':
  //       adjustedSpeed *= 31536000;
  //       break;
  //     // No need to adjust for seconds as it's the base unit
  //   }
  //   setSimulationSpeed(adjustedSpeed);
  //   // Update simulation speed in your application
  // };

  // const {
  //   connectionState,
  //   subscribeToTopic,
  //   unsubscribeFromTopic,
  //   subscribeToProperty,
  //   unsubscribeFromProperty,
  // } = useOpenSpaceApi();

  const time = usePropertyStore(
    (state) => state.properties['time']?.['timeCapped'],
  );
  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );

  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore(
    (state) => state.unsubscribeFromTopic,
  );

  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);

  function setDate(newTime: Date) {
    // Spice, that is handling the time parsing in OpenSpace does not support
    // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
    // is given.
    try {
      const fixedTimeString = newTime.toJSON().replace('Z', '');
      luaApi.time.setTime(fixedTimeString);
    } catch {
      luaApi.time.setTime(time);
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
      luaApi.time.setTime(fixedTimeString);
    } catch {
      luaApi.time.setTime(time);
    }
  }

  function interpolateDate(newTime: Date) {
    const fixedTimeString = newTime.toJSON().replace('Z', '');
    luaApi.time.interpolateTime(fixedTimeString);
  }

  function interpolateDateRelative(delta: number) {
    luaApi.time.interpolateTimeRelative(delta);
  }

  // function setToPendingTime() {
  //   setDate(pendingTime);
  //   setUseLock(false);
  // }

  // function interpolateToPendingTime() {
  //   interpolateDate(pendingTime);
  //   setUseLock(false);
  // }

  // function resetPendingTime() {
  //   setPendingTime(new Date(time));
  //   setUseLock(false);
  // }

  function changeDate(
    event: {
      time: Date;
      interpolate: boolean;
      delta: number;
      relative: boolean;
    },
    // useLock: boolean,
  ) {
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
    luaApi.time.interpolateDeltaTime(1);
  }

  function now() {
    setDate(new Date());
  }

  useEffect(() => {
    if (connectionState != ConnectionState.CONNECTED) return;
    subscribeToTopic('time', 500);
    return () => {
      unsubscribeFromTopic('time');
    };
  }, [connectionState]);

  // useEffect(() => {
  //   console.log('Scale:', scale);
  // }, [scale]);
  // const [firstTime, setFirstTime] = useState(true);
  // useEffect(() => {
  //   if (firstTime) {
  //     console.log('TIME:', time);
  //     setFirstTime(false);
  //   }
  //   if (time) {
  //     console.log('TIME:', time);

  //     setDateString(new Date(time));
  //   }
  // }, [time]);

  const timeLabel = useMemo(() => {
    if (time) {
      try {
        return time.toUTCString();
      } catch {
        return time;
      }
    }
    return time;
  }, [time]);
  // useEffect(() => {
  //   let intervalId: NodeJS.Timeout;

  //   if (simulationSpeed !== 0) {
  //     intervalId = setInterval(() => {
  //       setDate((currentDate) => {
  //         const secondsToAdd = simulationSpeed * 5; // Adjust this factor as needed
  //         return new Date(currentDate.getTime() + secondsToAdd * 1000);
  //       });
  //     }, 1000); // Update every second
  //   }

  //   return () => clearInterval(intervalId); // Cleanup interval on component unmount or speed change
  // }, [simulationSpeed]);

  return (
    <div>
      {time && (
        <div className="flex flex-col items-center justify-center gap-4">
          {/* <input
            type="datetime-local"
            value={time.toISOString().slice(0, 16)}
            onChange={(e) => handleDateChange(new Date(e.target.value))}
          /> */}
          <DateComponent date={time} onChange={changeDate} />
          <div className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
            {timeLabel}
          </div>
          <div className="flex flex-row items-center justify-between gap-2">
            <Button onClick={realtime}>Realtime</Button>
            <Button onClick={now}>Now</Button>
          </div>
        </div>
      )}

      {/* <input
        type="range"
        min="-10"
        max="10"
        value={simulationSpeed}
        onChange={(e) => handleSimulationSpeedChange(Number(e.target.value))}
      /> 

      
       <div>Speed: {simulationSpeed}x</div>{' '}
       <button
        onClick={() => {
          setDisplayUnit('seconds');
          handleSimulationSpeedChange(1.0);
        }}
      >
        Realtime
      </button> 
      <button onClick={() => setDate(new Date())}>Now</button> 
       Step 2: Add dropdown for selecting display unit 
       <select
        value={displayUnit}
        onChange={(e) => setDisplayUnit(e.target.value)}
      >
        <option value="seconds">Seconds</option>
        <option value="minutes">Minutes</option>
        <option value="hours">Hours</option>
        <option value="days">Days</option>
        <option value="years">Years</option>
      </select> */}
    </div>
  );
};

export default TimeDatePicker;
