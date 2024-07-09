import React, { useState } from 'react';

interface SelectableDropdownProps {
  options: string[];
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
          {options.map((item: string, index: number) => (
            <div
              key={index}
              className="cursor-pointer p-2 text-right hover:bg-gray-100"
              onClick={() => handleSelect(item)}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectableDropdown;
