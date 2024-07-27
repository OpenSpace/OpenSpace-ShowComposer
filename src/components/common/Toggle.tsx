import React from 'react';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

interface ToggleComponentProps {
  value: boolean;
  setValue: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleComponentProps> = ({
  value,
  setValue,
  disabled = false,
  label,
}) => {
  return (
    <div className="grid-2 grid gap-2">
      <Label>{label}</Label>
      <Switch
        id="geo"
        checked={value}
        disabled={disabled}
        onCheckedChange={setValue}
      />
    </div>
  );
};

export default Toggle;
