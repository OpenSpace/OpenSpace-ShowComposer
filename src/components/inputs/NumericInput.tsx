import React, { useState, useEffect } from 'react';

// Define the component's props type
type NumericInputProps = {
  min: number;
  max: number;
  step: number;
  value: number;
  placeholder?: string;
  showOutsideRangeHint?: boolean;
  onValueChanged: (value: number) => void;
  className?: string;
  label?: string;
};

const NumericInput: React.FC<NumericInputProps> = ({
  min,
  max,
  step,
  placeholder = '',
  showOutsideRangeHint = false,
  onValueChanged,
  className = '',
  label = '',
}) => {
  // const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [startX, setStartX] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const sensitivity = step; // Adjust this based on how sensitive you want the slider to be

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    // onValue
    onValueChanged(parseFloat(event.target.value));
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLInputElement>) => {
    // setIsEditing(true);
    setStartX(event.clientX);
    setStartValue(parseFloat(inputValue) || 0);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    const dx = event.clientX - startX;
    const newValue = startValue + dx * sensitivity;
    setInputValue(Math.min(Math.max(newValue, min), max).toString());
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onMouseDown={handleMouseDown}
        // onBlur={() => setIsEditing(false)}
        className="w-full rounded-md border p-2"
        placeholder={placeholder}
      />
      {showOutsideRangeHint &&
        (parseFloat(inputValue) < min || parseFloat(inputValue) > max) && (
          <span>Value is outside the allowed range</span>
        )}
    </>
  );
};

export default NumericInput;
