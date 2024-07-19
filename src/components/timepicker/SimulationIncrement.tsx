import React, { useState } from 'react';
import ControlledInput from '@/components/inputs/ControlledInput';
import NumericInput from '@/components/inputs/NumericInput';

// Assuming Steps enum and other objects are defined in the same file or imported

const SimulationIncrement: React.FC = () => {
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

  const [currentStep, setCurrentStep] = useState<string>(Steps.seconds);
  const handleStepChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentStep(event.target.value);
  };

  const [value, setValue] = useState<number>(1);
  // Example function to handle value change
  const handleValueChange = (newValue: number) => {
    console.log('New Value:', newValue);
    setValue(newValue);
    // Additional logic to handle the new value
  };

  return (
    <div>
      <ControlledInput
        placeholder="Enter date/time"
        value={value}
        // onChange={(newValue: string) => setValue(parseFloat(newValue))}
        clearable={false}
      />
      <NumericInput
        // decimals={true}
        min={Limits[currentStep].min}
        max={Limits[currentStep].max}
        step={Limits[currentStep].step}
        value={value || 0}
        onValueChanged={handleValueChange}
        label="Adjust Simulation Time"
      />
      <div>
        <select value={currentStep} onChange={handleStepChange}>
          {Object.entries(Steps).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      {/* Additional logic to switch between steps or handle other interactions */}
    </div>
  );
};

export default SimulationIncrement;
