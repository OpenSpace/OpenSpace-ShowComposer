import { Button } from '@/components/ui/button';
import { getCopy } from '@/utils/copyHelpers';
import Fuse from 'fuse.js';
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
import React, { useRef, useState, useEffect } from 'react';
type Option = {
  value: string;
  label: string;
};
interface VirtualizedCommandProps {
  width: string;
  options: Option[];
  placeholder: string;
  selectedOption: string;
  onSelectOption?: (option: string) => void;
  presets?: Option[] | null;
}
const breakAndColorString = (str: string, delimiter: string) => {
  const values = [
    'text-slate-950 dark:text-slate-50',
    'text-slate-700 dark:text-slate-300',
    'text-slate-600 dark:text-slate-400',
    'text-slate-500 dark:text-slate-500',
  ];
  const segments = str.split(delimiter);
  return segments.flatMap((segment, index) => [
    <span
      className={`${values[index % values.length]} text-nowrap`}
      key={`${index}-segment`}
    >
      {segment}
    </span>,
    index < segments.length - 1 && (
      <span
        className={`${values[index % values.length]} text-nowrap`}
        key={`${index}-delimiter`}
      >
        {delimiter}
      </span>
    ),
  ]);
};
const VirtualizedCommand = ({
  width,
  options,
  placeholder,
  selectedOption = '',
  onSelectOption,
  presets = [],
}: VirtualizedCommandProps) => {
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const parentRef = useRef(null);
  const [showPresets, setShowPresets] = useState(presets ? true : false);
  const [search, setSearch] = useState('');
  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 5,
  });
  const focusElement = (index: number) => {
    virtualizer.scrollToIndex(index, {
      align: 'start',
    });
  };
  useEffect(() => {
    if (selectedOption && selectedOption !== '') {
      const index = filteredOptions.findIndex(
        (option) => option.value === selectedOption,
      );
      setTimeout(() => {
        focusElement(index);
        // virtualizer.measure();
      }, 0);
      setShowPresets(false);
      setSearch(selectedOption);
    }
  }, []);
  const fuse = new Fuse(options, {
    keys: ['value'],
    // Specify the keys to search in
    threshold: 0.3, // Adjust the threshold for fuzzy matching
    // shouldSort: false,
  });

  // const virtualOptions = virtualizer.getVirtualItems();
  //   co
  // const handleSearch = (search: string) => {
  //   setFilteredOptions(
  //     options.filter((option) =>
  //       option.value.toLowerCase().includes(search.toLowerCase() ?? []),
  //     ),
  //   );
  // };
  const handleSearch = (search: string) => {
    // console.log(search.trim());
    setSearch(search);
    if (search.trim() === '') {
      setFilteredOptions([]);
      if (presets) setShowPresets(true);
    } else {
      const result = fuse.search(search);
      // console.log(result);
      // console.log(result.map(({ item }) => item));
      setFilteredOptions(result.map(({ item }) => item));
      if (presets) setShowPresets(false);
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
    }
  };
  useEffect(() => {
    // console.log(virtualOptions);
    virtualizer.measure();

    // virtualizer.
  }, [filteredOptions]);
  // useEffect(() => {
  //   // console.log(virtualOptions);
  //   // console.log(virtualizer.getTotalSize());
  // }, const [virtualOptions]);

  return (
    <Command shouldFilter={false} onKeyDown={handleKeyDown}>
      <CommandInput
        // disabled={false}
        // className="w-aut"
        style={
          {
            // width: 'inherit!important',
          }
        }
        value={search}
        onValueChange={handleSearch}
        placeholder={placeholder}
      />

      <CommandEmpty>
        {getCopy('VirtualizedCombobox', 'no_item_found.')}
      </CommandEmpty>
      <CommandList>
        <div
          style={{
            // height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <CommandGroup>
            {showPresets &&
              presets?.map((preset) => (
                <CommandItem
                  key={preset.value}
                  value={preset.value}
                  onSelect={(value: string) => {
                    onSelectOption && onSelectOption(value);
                  }}
                  style={{
                    height: '45px',
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedOption === preset.value
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                  {preset.label}
                </CommandItem>
              ))}
          </CommandGroup>
        </div>
      </CommandList>
      {!showPresets && (
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
                // maxHeight: height,
                width: 'inherit',
                overflow: 'auto',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualOption) => (
                <CommandItem
                  // data-index={virtual÷åOption.index}
                  // ref={virtualizer.measureElement}
                  className="w-max items-center"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    minWidth: width,
                    height: `${virtualOption.size}px`,
                    transform: `translateY(${virtualOption.start}px)`,
                  }}
                  key={virtualOption.key}
                  // key={filteredOptions[virtualOption.index].value}
                  value={filteredOptions[virtualOption.index].value}
                  onSelect={(value: string) => {
                    onSelectOption && onSelectOption(value);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 !h-4 !w-4',
                      selectedOption ===
                        filteredOptions[virtualOption.index].value
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                  <span>
                    {breakAndColorString(
                      filteredOptions[virtualOption.index].label,
                      '>',
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        </CommandList>
      )}
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
  presets?: Option[] | null;
}
export function VirtualizedCombobox({
  options,
  selectedOption,
  selectOption,
  searchPlaceholder = 'Search items...',
  width = '460px',
  // height = '300px',
  presets = null,
}: VirtualizedComboboxProps) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="overflow-hidden">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="relative justify-between"
          style={{
            width: width,
          }}
        >
          <span>
            {breakAndColorString(
              selectedOption
                ? options.find((option) => option === selectedOption) ?? ''
                : searchPlaceholder,
              '>',
            )}
          </span>
          <ChevronsUpDown
            className={`absolute right-0 mr-2 h-4 w-4 shrink-0 opacity-50`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className=" p-0"
        style={{
          width: width,
        }}
      >
        <VirtualizedCommand
          width={width}
          options={options.map((option) => ({
            value: option,
            label: option,
          }))}
          placeholder={searchPlaceholder}
          selectedOption={selectedOption}
          onSelectOption={(currentValue) => {
            selectOption(currentValue === selectedOption ? '' : currentValue);
            setOpen(false);
          }}
          presets={presets}
        />
      </PopoverContent>
    </Popover>
  );
}
