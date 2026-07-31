import { throttle } from 'lodash';
import { OpenSpaceLibrary } from 'openspace-api-js/types';

const updateDelayMs = 1000;

function updateDeltaTimeNow(openspace: OpenSpaceLibrary, value: number) {
  openspace.time.interpolateDeltaTime(value);
}

export const updateDeltaTime = throttle(updateDeltaTimeNow, updateDelayMs);

export const Steps = {
  seconds: 'Seconds',
  minutes: 'Minutes',
  hours: 'Hours',
  days: 'Days',
  months: 'Months',
  years: 'Years'
};

// Seconds represented by one unit of each step
export const StepSizes = {
  [Steps.seconds]: 1,
  [Steps.minutes]: 60,
  [Steps.hours]: 3600,
  [Steps.days]: 86400,
  [Steps.months]: 2678400,
  [Steps.years]: 31536000
};

// Rounding precision (as a round10 exponent) used when displaying each step's delta
export const StepPrecisions = {
  [Steps.seconds]: 0,
  [Steps.minutes]: -3,
  [Steps.hours]: -4,
  [Steps.days]: -5,
  [Steps.months]: -7,
  [Steps.years]: -10
};

Object.freeze(Steps);
Object.freeze(StepSizes);
Object.freeze(StepPrecisions);

export function round10(value: number, exp: number): number {
  const valueStr = value.toString();
  const [integer, decimal] = valueStr.split('.');
  if (decimal) {
    const decimalRounded = Math.round(Number(`0.${decimal}e${exp}`)).toString();
    return Number(`${integer}.${decimalRounded}`);
  }
  return value;
}
