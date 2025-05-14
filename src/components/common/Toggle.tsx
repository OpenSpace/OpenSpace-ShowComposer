import React from 'react';

import { cn } from '@/lib/utils';

// import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

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
    <div className={cn('flex items-center space-x-2', className)}>
      <Checkbox
        id={label}
        disabled={disabled}
        checked={value}
        onCheckedChange={(checked: boolean | 'indeterminate') => {
          if (checked !== 'indeterminate') setValue(checked);
        }}
      />
      <Label htmlFor={label}>{label}</Label>
    </div>
    // <Switch
    //   id="geo"
    //   checked={value}
    //   disabled={disabled}
    //   onCheckedChange={setValue}
    // />
  );
};

export default Toggle;
