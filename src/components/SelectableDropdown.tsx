import React from 'react';
import { Select } from '@mantine/core';

type Option = {
  value: string;
  label: string;
};

interface SelectableDropdownProps {
  options: string[] | Option[];
  selected: string | undefined;
  placeholder?: string;
  setSelected: (value: string) => void;
}

const SelectableDropdown: React.FC<SelectableDropdownProps> = ({
  options,
  placeholder = 'Select an option',
  selected,
  setSelected
}) => {
  return (
    <Select
      w={'auto'}
      data={options}
      placeholder={placeholder}
      value={selected && selected.length > 0 ? selected : null}
      disabled={options.length === 0}
      onChange={(value) => {
        if (value !== null) {
          setSelected(value);
        }
      }}
    />
  );
};

export default SelectableDropdown;
