import { ActionIcon, Divider, Group, Popover, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { GridSettings } from '@/editor/sidebar/GridSettings';
import { ColumnIcon, LayoutGridIcon, RowIcon, SettingsIcon } from '@/icons/icons';
import { LayoutType, useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';

export function LayoutToolbar() {
  const gridSize = useSettingsStore((state) => state.gridSize);

  const addLayout = useBoundStore((state) => state.addLayout);
  const currentPage = useBoundStore((state) => state.currentPage);
  const [opened, { toggle, open, close }] = useDisclosure(false);

  const handleLayoutCreate = (type: LayoutType) => {
    return addLayout({
      type,
      rows: type === 'grid' ? gridSize.rows : 1,
      columns: type === 'grid' ? gridSize.columns : 1,
      x: 100,
      y: 100,
      persistent: false,
      parentPage: currentPage
    });
  };

  return (
    <Group gap={'xs'}>
      <Tooltip label={'Row'}>
        <ActionIcon
          variant={'subtle'}
          size={40}
          onClick={() => handleLayoutCreate('row')}
        >
          <RowIcon size={20} />
        </ActionIcon>
      </Tooltip>
      <Divider orientation={'vertical'} />
      <Tooltip label={'Column'}>
        <ActionIcon
          variant={'subtle'}
          size={40}
          onClick={() => handleLayoutCreate('column')}
        >
          <ColumnIcon size={20} />
        </ActionIcon>
      </Tooltip>
      <Divider orientation={'vertical'} />
      <Tooltip label={'Grid'}>
        <ActionIcon
          variant={'subtle'}
          size={40}
          onClick={() => handleLayoutCreate('grid')}
        >
          <LayoutGridIcon size={20} />
        </ActionIcon>
      </Tooltip>
      <Divider orientation={'vertical'} />
      <Popover
        opened={opened}
        onChange={(value) => (value ? open() : close())}
        width={320}
      >
        <Popover.Target>
          <Tooltip label={'Grid Settings'}>
            <ActionIcon variant={'subtle'} size={40} onClick={toggle}>
              <SettingsIcon size={20} />
            </ActionIcon>
          </Tooltip>
        </Popover.Target>

        <Popover.Dropdown>
          <GridSettings onClose={close} />
        </Popover.Dropdown>
      </Popover>
    </Group>
  );
}
