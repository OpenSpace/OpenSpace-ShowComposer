// Slider.tsx
import React from 'react';
import { Input } from '../ui/input';

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const linearValue = parseFloat(e.target.value);
    const range = max - min;
    const normalizedValue = (linearValue - min) / range; // Normalize linear value to [0, 1]
    const expValue = min + Math.pow(normalizedValue, exponent) * range; // Apply exponent and scale back
    onChange(expValue);
  };

  return (
    <Input
      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={handleChange}
    />
  );
};

export default Slider;
