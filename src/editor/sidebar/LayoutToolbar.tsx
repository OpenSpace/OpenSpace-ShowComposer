import { useTranslation } from 'react-i18next';
import { ActionIcon, Divider, Group, Popover, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { GridSettings } from '@/editor/sidebar/GridSettings';
import { ColumnIcon, LayoutGridIcon, RowIcon, SettingsIcon } from '@/icons/icons';
import { type LayoutType, useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { IconSize } from '@/types/enums';

export function LayoutToolbar() {
  const { t } = useTranslation('layout-toolbar');
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
      <Tooltip label={t('row')}>
        <ActionIcon
          variant={'subtle'}
          size={IconSize.xl}
          onClick={() => handleLayoutCreate('row')}
        >
          <RowIcon size={IconSize.md} />
        </ActionIcon>
      </Tooltip>
      <Divider orientation={'vertical'} />
      <Tooltip label={t('column')}>
        <ActionIcon
          variant={'subtle'}
          size={IconSize.xl}
          onClick={() => handleLayoutCreate('column')}
        >
          <ColumnIcon size={IconSize.md} />
        </ActionIcon>
      </Tooltip>
      <Divider orientation={'vertical'} />
      <Tooltip label={t('grid')}>
        <ActionIcon
          variant={'subtle'}
          size={IconSize.xl}
          onClick={() => handleLayoutCreate('grid')}
        >
          <LayoutGridIcon size={IconSize.md} />
        </ActionIcon>
      </Tooltip>
      <Divider orientation={'vertical'} />
      <Popover
        opened={opened}
        onChange={(value) => (value ? open() : close())}
        width={320}
      >
        <Popover.Target>
          <Tooltip label={t('grid-settings')}>
            <ActionIcon variant={'subtle'} size={IconSize.xl} onClick={toggle}>
              <SettingsIcon size={IconSize.md} />
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
