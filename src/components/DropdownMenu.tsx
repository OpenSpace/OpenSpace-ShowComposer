import React, { ReactNode } from 'react';
import { ActionIcon } from '@mantine/core';
import { EllipsisVertical } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { getCopy } from '@/utils/copyHelpers';
interface DropdownMenuProps {
  items: ReactNode[];
}
const DropdownMenuComponent: React.FC<DropdownMenuProps> = ({ items }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={'z-[999999] '}>
        <ActionIcon variant={'subtle'} className={'h-4 w-4 hover:bg-slate-900/40'}>
          <EllipsisVertical
            className={
              'h-5 w-5 stroke-slate-500 transition-colors duration-300  group-hover:stroke-white'
            }
          />
          <span className={'sr-only'}>{getCopy('DropdownMenu', 'more')}</span>
        </ActionIcon>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={'end'}>
        {items.map((item, index) => (
          <DropdownMenuItem key={index}>{item}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default DropdownMenuComponent;
