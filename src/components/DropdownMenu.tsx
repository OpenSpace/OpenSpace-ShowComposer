import React, { ReactNode } from 'react';
import { getCopy } from '@/utils/copyHelpers';
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
      <DropdownMenuTrigger asChild className="z-[999999] ">
        <Button
          size="icon"
          variant="ghost"
          className="h-4 w-4 hover:bg-slate-900/40"
        >
          <EllipsisVertical className="h-5 w-5 stroke-slate-500 transition-colors duration-300  group-hover:stroke-white" />
          <span className="sr-only">{getCopy('DropdownMenu', 'more')}</span>
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
