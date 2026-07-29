import { Checkbox } from '@mantine/core';

interface ToggleComponentProps {
  value: boolean;
  setValue: (value: boolean) => void;
  label?: string;
  labelPosition?: 'left' | 'right';
  disabled?: boolean;
  className?: string;
}

function Toggle({
  value,
  setValue,
  disabled = false,
  label,
  labelPosition,
  className = ''
}: ToggleComponentProps) {
  return (
    <Checkbox
      className={className}
      label={label}
      labelPosition={labelPosition}
      disabled={disabled}
      checked={value}
      onChange={(event) => setValue(event.currentTarget.checked)}
    />
  );
}

export default Toggle;
