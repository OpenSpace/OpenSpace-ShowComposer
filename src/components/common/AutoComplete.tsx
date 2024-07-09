import React, { useState, useMemo, useEffect } from 'react';

import { FixedSizeList as List } from 'react-window';

// Mock options for demonstration
// const options: string[] = Array.from(
//   { length: 10000 },
//   (_, index) => `Option ${index + 1}`,
// );

interface AutocompleteProps {
  options: Record<string, string>;
  onChange: (value: string) => void;
  initialValue: string;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  options,
  onChange,
  initialValue,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [userInput, setUserInput] = useState(initialValue);

  const [autofillValue, setAutofillValue] = useState('');

  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  const filteredOptions: string[] = useMemo(
    () =>
      Object.keys(options).filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase()),
      ),
    [inputValue, options],
  );

  useEffect(() => {
    // Reset highlighted index when input changes
    setHighlightedIndex(0);
    // Automatically fill in the input bar with the first option as the user types
    if (filteredOptions.length > 0) {
      setAutofillValue(filteredOptions[0]);
    } else {
      setAutofillValue(userInput);
    }
    // if options contains userInput
    if (options[userInput]) onChange(userInput);
  }, [inputValue, filteredOptions, userInput]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key === 'ArrowDown' &&
      highlightedIndex < filteredOptions.length - 1
    ) {
      setHighlightedIndex(highlightedIndex + 1);
    } else if (event.key === 'ArrowUp' && highlightedIndex > 0) {
      setHighlightedIndex(highlightedIndex - 1);
    } else if (event.key === 'Enter' && filteredOptions[highlightedIndex]) {
      // Accept the autofilled value or the highlighted option
      setInputValue(filteredOptions[highlightedIndex]);
      setUserInput(filteredOptions[highlightedIndex]);
      setIsDropdownVisible(false);
    } else if (event.key === 'Tab' && autofillValue) {
      // Accept the autofill value when Tab is pressed
      event.preventDefault(); // Prevent the default tab behavior
      setInputValue(autofillValue);
      setUserInput(autofillValue);
      setIsDropdownVisible(false);
    } else {
      setIsDropdownVisible(true);
    }
  };

  interface RowProps {
    index: number;
    style: React.CSSProperties;
  }

  const Row: React.FC<RowProps> = ({ index, style }) => (
    <div
      className=" w-full cursor-pointer hover:bg-gray-100"
      style={style}
      onClick={() => {
        // console.log(filteredOptions[index]);
        setInputValue(filteredOptions[index]);
        setUserInput(filteredOptions[index]);
        setIsDropdownVisible(false);
      }}
    >
      {filteredOptions[index]}
    </div>
  );

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={userInput}
        onChange={(e) => {
          setUserInput(e.target.value);
          setInputValue(e.target.value); // Optionally keep this if you need to track the final input value separately
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsDropdownVisible(true)}
        // onBlur={() => setIsDropdownVisible(false)}
        // onBlur={() => setTimeout(() => setIsDropdownVisible(false), 500)}
        className="w-full rounded border border-gray-300 p-2"
      />
      {isDropdownVisible && (
        <div
          className=" absolute z-[99] max-h-60 w-full overflow-auto border border-gray-300 bg-white"
          onBlur={() => setIsDropdownVisible(false)}
        >
          <List
            height={150}
            itemCount={filteredOptions.length}
            itemSize={35}
            width={'100%'}
          >
            {Row}
          </List>
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
