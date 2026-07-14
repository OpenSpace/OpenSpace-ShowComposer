import React, { ReactNode } from 'react';
import { ActionIcon, Menu } from '@mantine/core';
import { EllipsisVertical } from 'lucide-react';

import { getCopy } from '@/utils/copyHelpers';
interface DropdownMenuProps {
  items: ReactNode[];
}
const DropdownMenuComponent: React.FC<DropdownMenuProps> = ({ items }) => {
  return (
    <Menu position={'bottom-end'} zIndex={999999}>
      <Menu.Target>
        <ActionIcon variant={'subtle'} className={'h-4 w-4 hover:bg-slate-900/40'}>
          <EllipsisVertical
            className={
              'h-5 w-5 stroke-slate-500 transition-colors duration-300  group-hover:stroke-white'
            }
          />
          <span className={'sr-only'}>{getCopy('DropdownMenu', 'more')}</span>
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {items.map((item, index) => (
          <Menu.Item key={index}>{item}</Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};
export default DropdownMenuComponent;
