import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// import { GridSettings } from './LayoutToolbar';
import { useSettingsStore } from '@/store';
import { useState } from 'react';
import { useBoundStore } from '@/store/boundStore';

interface LayoutEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  layoutId: string | null;
}

const LayoutEditModal = ({
  isOpen,
  onClose,
  layoutId,
}: LayoutEditModalProps) => {
  const gridSettings = useSettingsStore((state) => state.gridSize);
  const gridSize = useBoundStore((state) => ({
    columns: layoutId
      ? state.layouts[layoutId]?.columns || gridSettings.columns
      : gridSettings.columns,
    rows: layoutId
      ? state.layouts[layoutId]?.rows || gridSettings.rows
      : gridSettings.rows,
  }));

  const updateLayout = useBoundStore((state) => state.updateLayout);
  //   const
  const setGridSize = useSettingsStore((state) => state.setGridSize);
  const [rows, setRows] = useState(gridSize.rows.toString());
  const [columns, setColumns] = useState(gridSize.columns.toString());

  const handleSave = () => {
    if (!layoutId) return;
    setGridSize({
      rows: parseInt(rows),
      columns: parseInt(columns),
    });
    updateLayout(layoutId, {
      rows: parseInt(rows),
      columns: parseInt(columns),
    });
    onClose();
  };

  if (!isOpen || !layoutId) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-[510px] bg-white">
        <CardHeader>
          <CardTitle>
            <div className="flex flex-row gap-2">
              {/* {icon} */}
              Edit Grid Size
            </div>
          </CardTitle>
          <CardDescription>
            This will also change default grid size.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="rows"># of Rows</Label>
                <Input
                  id="rows"
                  className="col-span-2 h-8"
                  type="text"
                  value={rows}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRows(e.target.value)
                  }
                  placeholder="# of Rows"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="columns"># of Columns</Label>
                <Input
                  id="columns"
                  className="col-span-2 h-8"
                  type="text"
                  value={columns}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setColumns(e.target.value)
                  }
                  placeholder="# of Columns"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-row justify-end gap-2">
            <Button variant={'outline'} onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LayoutEditModal;
