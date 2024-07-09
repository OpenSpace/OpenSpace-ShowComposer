// Slider.tsx
import React from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  step: number;
  min: number;
  max: number;
}

const Slider: React.FC<SliderProps> = ({ value, onChange, step, min, max }) => {
  return (
    <input
      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(parseFloat(e.target.value))}
    />
  );
};

export default Slider;
