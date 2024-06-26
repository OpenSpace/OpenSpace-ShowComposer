import React from 'react';

interface ToggleComponentProps {
  value: boolean;
  setValue: (value: boolean) => void;
  label?: string;
}

const Toggle: React.FC<ToggleComponentProps> = ({ value, setValue, label }) => {
  return (
    <label className="flex cursor-pointer flex-row items-center justify-between">
      {label && <span className="text-sm font-medium text-black">{label}</span>}
      <div className="flex items-center justify-end gap-2">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={value}
          onChange={() => setValue(!value)}
        />
        <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
        <span className="text-sm font-medium">{value ? 'On' : 'Off'}</span>
      </div>
    </label>
  );
};

export default Toggle;
