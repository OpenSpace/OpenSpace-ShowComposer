import React, { useState } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (item: string) => {
    setSelected(item);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="w-full rounded-md border border-gray-300 bg-white p-2 text-right"
        onClick={toggleDropdown}
      >
        {selected || 'Select an option'}
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white">
          {options.map((item: string | Option, index: number) => (
            <div
              key={index}
              className="cursor-pointer p-2 text-right hover:bg-gray-100"
              onClick={() => handleSelect(isOption(item) ? item.value : item)}
            >
              {isOption(item) ? item.label : item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectableDropdown;
