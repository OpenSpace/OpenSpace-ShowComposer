import { throttle } from './throttle';

// Using this hack to parse times https://scholarslab.lib.virginia.edu/blog/parsing-bc-dates-with-javascript/
export const dateStringWithTimeZone = (date: string, zone = 'Z') => {
  // Ensure we don't have white spaces
  const whitespaceRemoved = date.replace(/\s/g, '');
  let result;
  // If we are in negative years (before year 0)
  if (whitespaceRemoved[0] === '-') {
    // Remove first dash so we can split it where the year ends
    const unsignedDate = whitespaceRemoved.substring(1);
    // Get the year by searching for first -
    const unsignedYear = unsignedDate.substring(0, unsignedDate.indexOf('-'));
    // Create year for the pattern -00YYYY for negative years (see link above)
    const filledYear = `-${unsignedYear.padStart(6, '0')}`;
    // Get everything after the year
    const rest = unsignedDate.substring(unsignedDate.indexOf('-'));
    // Add new filled year together with the rest
    result = `${filledYear}${rest}`;
  } else {
    // After year 0
    // Ensure year always has 4 digits - fill with 0 in front
    const year = whitespaceRemoved.substring(0, whitespaceRemoved.indexOf('-'));
    const rest = whitespaceRemoved.substring(whitespaceRemoved.indexOf('-'));
    const filledYear = year.padStart(4, '0');
    result = `${filledYear}${rest}`;
  }

  return !result.includes('Z') ? `${result}${zone}` : result;
};
// new Date();
interface TimeState {
  //   newTime?: string;
  time: string | Date;
  timeCapped?: Date | string;
  targetDeltaTime?: number;
  deltaTime?: number;
  isPaused?: boolean;
  hasNextStep?: boolean;
  hasPrevStep?: boolean;
  nextStep?: number;
  prevStep?: number;
  deltaTimeSteps?: Array<number>;
  prevDeltaTimeStep?: number;
  nextDeltaTimeStep?: number;
  hasNextDeltaTimeStep?: boolean;
  hasPrevDeltaTimeStep?: boolean;
}

const updateTime = (newTimeState: TimeState) => {
  //   const { newTime } = newTimeState;
  const { time: newTime } = newTimeState;

  const newState = { ...newTimeState };
  //   console.log(newTime);
  //   console.log(newState);
  //check if newTime is string or Date
  function isDate(date: any): date is Date {
    return date instanceof Date;
  }

  if (newTime !== undefined) {
    if (isDate(newTime)) {
      newState.time = newTime;
    } else {
      let ztime = new Date(dateStringWithTimeZone(newTime));
      //@ts-ignore
      if (!isNaN(ztime)) {
        newState.time = ztime;
      } else {
        newState.time = newTime;
      }
    }

    const updateCappedTime = throttle(() => {
      if (!isDate(newTime)) {
        const date = new Date(dateStringWithTimeZone(newTime));
        date.setMilliseconds(0);
        newState.timeCapped = date;
      }
    }, 1000); // Update

    if (!newState.timeCapped) {
      newState.timeCapped = newTime;
    } else {
      updateCappedTime();
    }
  }
  //   console.log(newState.time);
  //   console.log(newState.timeCapped);
  //   if (deltaTime !== undefined) {
  //     newState.deltaTime = deltaTime;
  //   }
  //   if (targetDeltaTime !== undefined) {
  //     newState.targetDeltaTime = targetDeltaTime;
  //   }
  //   if (isPaused !== undefined) {
  //     newState.isPaused = isPaused;
  //   }
  //   if (hasNextStep !== undefined) {
  //     newState.hasNextDeltaTimeStep = hasNextStep;
  //   }
  //   if (hasPrevStep !== undefined) {
  //     newState.hasPrevDeltaTimeStep = hasPrevStep;
  //   }
  //   if (nextStep !== undefined) {
  //     newState.nextDeltaTimeStep = nextStep;
  //   }
  //   if (prevStep !== undefined) {
  //     newState.prevDeltaTimeStep = prevStep;
  //   }
  //   if (deltaTimeSteps !== undefined) {
  //     newState.deltaTimeSteps = deltaTimeSteps;
  //   }
  //   console.log(newState);
  return newState;
};
export default updateTime;
