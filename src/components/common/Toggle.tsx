import React from 'react';
import { Checkbox } from '@mantine/core';

interface ToggleComponentProps {
  value: boolean;
  setValue: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const Toggle: React.FC<ToggleComponentProps> = ({
  value,
  setValue,
  disabled = false,
  label,
  className = ''
}) => {
  return (
    <Checkbox
      className={className}
      label={label}
      disabled={disabled}
      checked={value}
      onChange={(event) => setValue(event.currentTarget.checked)}
    />
  );
};

export default Toggle;
