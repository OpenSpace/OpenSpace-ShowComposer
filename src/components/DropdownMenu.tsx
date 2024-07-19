import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVertical } from 'lucide-react';

interface DropdownMenuProps {
  items: ReactNode[];
}

const DropdownMenuComponent: React.FC<DropdownMenuProps> = ({ items }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="z-[999999]">
        <Button size="icon" variant="ghost" className="h-5 w-5">
          <EllipsisVertical className="h-5 w-5 stroke-slate-700/70 " />
          <span className="sr-only">More</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {items.map((item, index) => (
          <DropdownMenuItem key={index}>{item}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownMenuComponent;
