import React from 'react';
// import { Slider as RadixSlider } from '@/components/ui/slider';
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from '@/components/ui/tooltip';
import * as RadixSlider from '@radix-ui/react-slider';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  step: number;
  min: number;
  max: number;
  exponent: number;
}

const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  step,
  min,
  max,
  exponent,
}) => {
  const handleChange = (val: number) => {
    const linearValue = val;
    const range = max - min;
    const normalizedValue = (linearValue - min) / range; // Normalize linear value to [0, 1]
    const expValue = min + Math.pow(normalizedValue, exponent) * range; // Apply exponent and scale back
    onChange(expValue);
  };

  return (
    <div>
      <RadixSlider.Root
        value={[value]}
        onValueChange={(values) => handleChange(values[0])}
        step={step}
        min={min}
        max={max}
        className="relative flex w-full touch-none select-none items-center"
      >
        <RadixSlider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <RadixSlider.Range className="absolute h-full bg-slate-900 dark:bg-slate-50" />
        </RadixSlider.Track>
        <RadixSlider.Thumb className="block h-5 w-5 rounded-full border-2 border-slate-900 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-50 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300" />
      </RadixSlider.Root>
    </div>
  );
};

export default Slider;
