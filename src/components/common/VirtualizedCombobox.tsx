import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Box,
  Combobox,
  Group,
  Input,
  InputBase,
  Text,
  useVirtualizedCombobox
} from '@mantine/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import Fuse from 'fuse.js';

import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from '@/icons/icons';
import { getCopy } from '@/utils/copyHelpers';

// Renders a delimited path with the leading segment prominent and the rest dimmed
function ColoredPath({ value, delimiter }: { value: string; delimiter: string }) {
  const segments = value.split(delimiter);
  return (
    <Box component={'span'} style={{ whiteSpace: 'nowrap' }}>
      {segments.map((segment, index) => (
        <Fragment key={index}>
          <Text span inherit c={index === 0 ? undefined : 'dimmed'}>
            {segment}
          </Text>
          {index < segments.length - 1 && (
            <Text span inherit c={'dimmed'}>
              {delimiter}
            </Text>
          )}
        </Fragment>
      ))}
    </Box>
  );
}

interface Props {
  options: string[];
  selectedOption: string;
  selectOption: (option: string) => void;
  searchPlaceholder?: string;
  width?: string;
  height?: string;
  presets?: string[] | null;
  delimiter?: string;
}
const ITEM_HEIGHT = 40;

export function VirtualizedCombobox({
  options,
  selectedOption,
  selectOption,
  searchPlaceholder = 'Search items...',
  width = '460px',
  delimiter = '>',
  presets = null
}: Props) {
  const [search, setSearch] = useState('');
  // The highlighted option is tracked by index so it stays correct even when the top
  // rows are virtualized out of the DOM
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const optionIdBase = useId();
  const fuse = useMemo(() => new Fuse(options, { threshold: 0.5 }), [options]);

  // Empty search shows the presets (if any) or the full list; a query runs it through Fuse
  const items: string[] = useMemo(() => {
    if (search.trim() !== '') {
      return fuse.search(search).map(({ item }) => item);
    }
    if (presets) {
      return presets;
    }
    return options;
  }, [search, fuse, presets, options]);

  // Hook from mantine to manage the combobox in combination with tanstacks virtualizer.
  // See example https://mantine.dev/combobox/?e=VirtualizedSearchableTanstack
  const combobox = useVirtualizedCombobox({
    totalOptionsCount: items.length,
    getOptionId: (index) => `${optionIdBase}-${index}`,
    selectedOptionIndex: activeIndex,
    setSelectedOptionIndex: setActiveIndex,
    onSelectedOptionSubmit: (index) => {
      // Get the item via the index and select
      const item = items[index];
      if (item !== undefined) {
        selectOption(item);
      }
      combobox.closeDropdown();
    },
    onDropdownOpen: () => combobox.focusSearchInput(),
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.focusTarget();
      setSearch('');
    }
  });

  // Tanstacks virtualizer hook
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5
  });

  // When the query changes or the dropdown opens, jump back to the top and highlight the best
  // match (index 0) so Enter submits it. `virtualizer` is a stable instance from useVirtualizer.
  const { dropdownOpened } = combobox;
  useEffect(() => {
    if (dropdownOpened) {
      setActiveIndex(0);
      virtualizer.scrollToIndex(0);
    }
  }, [search, dropdownOpened, virtualizer]);

  // Keep the keyboard-highlighted option in view. Fires only when the highlighted index
  // changes (arrow keys / the reset above), never on mouse-wheel scroll, so it does not fight
  // manual scrolling. scrollToIndex does nothing when the option is already visible
  useEffect(() => {
    if (dropdownOpened && activeIndex >= 0) {
      virtualizer.scrollToIndex(activeIndex);
    }
  }, [activeIndex, dropdownOpened, virtualizer]);

  return (
    <Combobox
      store={combobox}
      width={'target'}
      onOptionSubmit={(value) => {
        selectOption(value);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target targetType={'button'}>
        <InputBase
          component={'button'}
          type={'button'}
          pointer
          rightSection={<ChevronsUpDownIcon />}
          rightSectionPointerEvents={'none'}
          onClick={() => combobox.toggleDropdown()}
          style={{ width }}
          styles={{
            input: {
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }
          }}
        >
          {selectedOption ? (
            <ColoredPath value={selectedOption} delimiter={delimiter} />
          ) : (
            <Input.Placeholder>{searchPlaceholder}</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Search
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder={searchPlaceholder}
          leftSection={<SearchIcon style={{ marginRight: 8 }} />}
          leftSectionWidth={42}
        />
        <Combobox.Options>
          {items.length === 0 ? (
            <Combobox.Empty>
              {getCopy('VirtualizedCombobox', 'no_item_found.')}
            </Combobox.Empty>
          ) : (
            <Box ref={scrollRef} mah={300} style={{ overflowY: 'auto' }}>
              <Box pos={'relative'} h={virtualizer.getTotalSize()}>
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const item = items[virtualRow.index];
                  return (
                    <Combobox.Option
                      key={item}
                      value={item}
                      id={`${optionIdBase}-${virtualRow.index}`}
                      // `selected` drives the keyboard-highlight background
                      // (data-combobox-selected); `active` marks the chosen value for aria.
                      selected={virtualRow.index === activeIndex}
                      active={selectedOption === item}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: virtualRow.size,
                        transform: `translateY(${virtualRow.start}px)`
                      }}
                    >
                      <Group gap={'xs'} wrap={'nowrap'} h={'100%'}>
                        <CheckIcon
                          size={16}
                          style={{
                            flexShrink: 0,
                            opacity: selectedOption === item ? 1 : 0
                          }}
                        />
                        <ColoredPath value={item} delimiter={delimiter} />
                      </Group>
                    </Combobox.Option>
                  );
                })}
              </Box>
            </Box>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
