import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useRef, useState } from 'react';
type Option = {
  value: string;
  label: string;
};

interface VirtualizedCommandProps {
  height: string;
  options: Option[];
  placeholder: string;
  selectedOption: string;
  onSelectOption?: (option: string) => void;
}

const VirtualizedCommand = ({
  height,
  options,
  placeholder,
  selectedOption = '',
  onSelectOption,
}: VirtualizedCommandProps) => {
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    // overscan: 5,
  });

  const virtualOptions = virtualizer.getVirtualItems();
  //   co
  const handleSearch = (search: string) => {
    setFilteredOptions(
      options.filter((option) =>
        option.value.toLowerCase().includes(search.toLowerCase() ?? []),
      ),
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
    }
  };

  return (
    <Command shouldFilter={true} onKeyDown={handleKeyDown}>
      <CommandInput
        // disabled={false}
        onValueChange={handleSearch}
        placeholder={placeholder}
      />
      <CommandEmpty>No item found.</CommandEmpty>
      <CommandList ref={parentRef}>
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <CommandGroup
            // ref={parentRef}
            style={{
              height: height,
              width: '100%',
              overflow: 'auto',
            }}
          >
            {virtualOptions.map((virtualOption) => (
              <CommandItem
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualOption.size}px`,
                  transform: `translateY(${virtualOption.start}px)`,
                }}
                key={filteredOptions[virtualOption.index].value}
                value={filteredOptions[virtualOption.index].value}
                onSelect={(value: string) => {
                  console.log(value);
                  onSelectOption && onSelectOption(value);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selectedOption ===
                      filteredOptions[virtualOption.index].value
                      ? 'opacity-100'
                      : 'opacity-0',
                  )}
                />
                {filteredOptions[virtualOption.index].label}
              </CommandItem>
            ))}
          </CommandGroup>
        </div>
      </CommandList>
      {/* </CommandGroup> */}
    </Command>
  );
};

interface VirtualizedComboboxProps {
  options: string[];
  selectedOption: string;
  selectOption: (option: string) => void;
  searchPlaceholder?: string;
  width?: string;
  height?: string;
}

export function VirtualizedCombobox({
  options,
  selectedOption,
  selectOption,
  searchPlaceholder = 'Search items...',
  width = '460px',
  height = '300px',
}: VirtualizedComboboxProps) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
          style={{
            width: width,
          }}
        >
          {selectedOption
            ? options.find((option) => option === selectedOption)
            : searchPlaceholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className=" p-0"
        style={{
          width: width,
        }}
      >
        <VirtualizedCommand
          height={height}
          options={options.map((option) => ({ value: option, label: option }))}
          placeholder={searchPlaceholder}
          selectedOption={selectedOption}
          onSelectOption={(currentValue) => {
            selectOption(currentValue === selectedOption ? '' : currentValue);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
