import React from 'react';
import { MdCancel } from 'react-icons/md';

// Define the component's props type
type ControlledInputProps = {
  label?: string;
  placeholder: string; // placeholder is required
  onChange?: (value: string) => void;
  value?: string | number;
  step?: number;
  loadingState?: boolean;
  clearable?: boolean;
  onEnter?: () => void;
  className?: string;
};

// The ControlledInput component
const ControlledInput: React.FC<ControlledInputProps> = ({
  label,
  placeholder,
  onChange,
  value,
  step,
  loadingState,
  clearable,
  onEnter,
  className,
}) => {
  // Handle change event
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  // Handle key press event
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onEnter?.();
    }
  };

  // Handle clear input
  const handleClear = () => {
    onChange?.('');
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-2">{label}</label>}
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          step={step}
          className={`w-full rounded-md border p-2 ${
            loadingState ? 'bg-gray-200' : 'bg-white'
          }`}
          disabled={loadingState}
        />
        {clearable && value && (
          <MdCancel
            className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer"
            onClick={handleClear}
          />
        )}
      </div>
    </div>
  );
};

export default ControlledInput;
