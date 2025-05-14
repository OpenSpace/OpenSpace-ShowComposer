import React, { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type Option = {
  value: string;
  label: string;
};

//function to check if type is string or Option
function isOption(item: string | Option): item is Option {
  return (item as Option).value !== undefined;
}

interface SelectableDropdownProps {
  options: string[] | Option[];
  selected: string | undefined;
  placeholder?: string;
  shouldClear?: boolean;
  setSelected: (value: string) => void;
}

const SelectableDropdown: React.FC<SelectableDropdownProps> = ({
  options,
  placeholder = 'Select an option',
  selected,
  shouldClear = false,
  setSelected
}) => {
  const handleSelect = (item: string) => {
    setSelected(item);
  };
  const [key, setKey] = useState<number>(+new Date());

  return (
    <Select
      key={key}
      value={selected && selected.length > 0 ? selected : undefined}
      onValueChange={(value: string) => {
        handleSelect(value);
        if (shouldClear) setKey(+new Date());
      }}
      disabled={options.length === 0}
    >
      <SelectTrigger className={"w-auto"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((item: string | Option, index: number) => (
          <SelectItem
            key={index}
            value={isOption(item) ? item.value : item.length ? item : 'default'}
            onSelect={() => handleSelect(isOption(item) ? item.value : item)}
          >
            {isOption(item) ? item.label : item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectableDropdown;
