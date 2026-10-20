import { throttle } from 'lodash';
import type { OpenSpaceLibrary } from 'openspace-api-js/types';

const updateDelayMs = 1000;

function updateDeltaTimeNow(openspace: OpenSpaceLibrary, value: number) {
  openspace.time.interpolateDeltaTime(value);
}

export const updateDeltaTime = throttle(updateDeltaTimeNow, updateDelayMs);

// Units are in seconds
export const StepSizes = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
  months: 2678400,
  years: 31536000
};

export type StepUnit = keyof typeof StepSizes;

export const StepUnits = Object.keys(StepSizes) as StepUnit[];

// Rounding precision (as a round10 exponent) used when displaying each step's delta
export const StepPrecisions: Record<StepUnit, number> = {
  seconds: 0,
  minutes: -3,
  hours: -4,
  days: -5,
  months: -7,
  years: -10
};

Object.freeze(StepSizes);
Object.freeze(StepUnits);
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
