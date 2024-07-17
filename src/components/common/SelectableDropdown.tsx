import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  selected: string;
  setSelected: (value: string) => void;
}

const SelectableDropdown: React.FC<SelectableDropdownProps> = ({
  options,
  selected,
  setSelected,
}) => {
  const handleSelect = (item: string) => {
    setSelected(item);
  };

  return (
    <Select
      value={selected.length > 0 ? selected : undefined}
      onValueChange={handleSelect}
    >
      <SelectTrigger className="w-auto">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        {options.map((item: string | Option, index: number) => (
          //bug
          <SelectItem
            key={index}
            value={isOption(item) ? item.label : item.length ? item : 'default'}
            onClick={() => handleSelect(isOption(item) ? item.value : item)}
          >
            {isOption(item) ? item.label : item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectableDropdown;
