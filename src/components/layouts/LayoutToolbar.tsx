import { LayoutType, useSettingsStore } from '@/store';
import { LayoutGrid, SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import TooltipHolder from '@/components/common/TooltipHolder';
import { Separator } from '@/components/ui/separator';
import { useBoundStore } from '@/store/boundStore';

// interface LayoutToolbarProps {
//   onLayoutCreate: (type: LayoutType) => void;
// }
export const RowIcon = ({ className }: { className?: string }) => (
  <svg
    className={`h-4 w-4 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="8" width="8" height="8" />
    <rect x="14" y="8" width="8" height="8" />
  </svg>
);

export const ColumnIcon = ({ className }: { className?: string }) => (
  <svg
    className={`h-4 w-4 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="8" y="2" width="8" height="8" />
    <rect x="8" y="14" width="8" height="8" />
  </svg>
);

export const LayoutToolbar: React.FC = () => {
  // Handle layout creation from toolbar

  const gridSize = useSettingsStore((state) => state.gridSize);

  const addLayout = useBoundStore((state) => state.addLayout);
  const currentPage = useBoundStore((state) => state.currentPage);
  const handleLayoutCreate = (type: LayoutType) => {
    return addLayout({
      type,
      rows: type === 'grid' ? gridSize.rows : 1,
      columns: type === 'grid' ? gridSize.columns : 1,
      x: 100,
      y: 100,
      persistent: false,
      parentPage: currentPage,
    });
  };

  const [open, setOpen] = useState(false);
  const handleOpenChange = (open: boolean) => setOpen(open);

  return (
    <div className="flex flex-wrap gap-2 ">
      <TooltipHolder content="Row">
        <Button
          size={'icon'}
          variant={'ghost'}
          className="h-10 w-10 p-2"
          onClick={() => handleLayoutCreate('row')}
        >
          <RowIcon className="h-5 w-5" />
        </Button>
      </TooltipHolder>
      <Separator orientation="vertical" />
      <TooltipHolder content="Column">
        <Button
          size={'icon'}
          variant={'ghost'}
          className="h-10 w-10 p-2"
          onClick={() => handleLayoutCreate('column')}
        >
          <ColumnIcon className="h-5 w-5" />
        </Button>
      </TooltipHolder>
      <Separator orientation="vertical" />
      <TooltipHolder content="Grid">
        <Button
          size={'icon'}
          variant={'ghost'}
          className="h-10 w-10 p-2"
          onClick={() => handleLayoutCreate('grid')}
        >
          <LayoutGrid className="h-5 w-5" />
        </Button>
      </TooltipHolder>
      <Separator orientation="vertical" />
      <Popover open={open} onOpenChange={handleOpenChange}>
        <TooltipHolder content="Grid Settings">
          <PopoverTrigger asChild>
            <Button size={'icon'} variant={'ghost'} className="h-10 w-10 p-2">
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
        </TooltipHolder>

        <PopoverContent className="w-80">
          <GridSettings onClose={() => handleOpenChange(false)} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const GridSettings = ({ onClose }: { onClose: () => void }) => {
  const gridSize = useSettingsStore((state) => state.gridSize);
  const setGridSize = useSettingsStore((state) => state.setGridSize);
  const [rows, setRows] = useState(gridSize.rows);
  const [columns, setColumns] = useState(gridSize.columns);
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="rows"># of Rows</Label>
          <Input
            id="rows"
            className="col-span-2 h-8"
            type="number"
            min={1}
            max={10}
            value={rows}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRows(parseInt(e.target.value))
            }
            placeholder="# of Rows"
          />
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="columns"># of Columns</Label>
          <Input
            id="columns"
            className="col-span-2 h-8"
            type="number"
            min={1}
            max={10}
            value={columns}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setColumns(parseInt(e.target.value))
            }
            placeholder="# of Columns"
          />
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setGridSize({
                rows: rows,
                columns: columns,
              });
              onClose();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
