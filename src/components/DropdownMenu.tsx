import { ReactNode } from 'react';
import { ActionIcon, Menu } from '@mantine/core';

import { EllipsisVerticalIcon } from '@/icons/icons';
import { getCopy } from '@/utils/copyHelpers';

interface DropdownMenuProps {
  items: ReactNode[];
}
function DropdownMenuComponent({ items }: DropdownMenuProps) {
  return (
    <Menu position={'bottom-end'} zIndex={999999}>
      <Menu.Target>
        <ActionIcon
          variant={'subtle'}
          size={'sm'}
          aria-label={getCopy('DropdownMenu', 'more')}
        >
          <EllipsisVerticalIcon size={20} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {items.map((item, index) => (
          <Menu.Item key={index}>{item}</Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
export default DropdownMenuComponent;
