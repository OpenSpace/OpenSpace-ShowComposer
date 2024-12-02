import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Folder, Trash2, Settings } from 'lucide-react';
import TooltipHolder from './common/TooltipHolder';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { ConnectionSettings } from '@/components/ConnectionSettings';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { Separator } from '@/components/ui/separator';

interface ToolbarProps {
  onSave: () => void;
  onLoad: () => void;
  onDeleteAllConfirm: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onSave,
  onLoad,
  onDeleteAllConfirm,
}) => {
  return (
    <div className=" relative flex flex-wrap items-center gap-2">
      <TooltipHolder side="left" content="Save to your computer">
        <Button
          size={'icon'}
          variant={'ghost'}
          className="h-10 w-10 p-2"
          onClick={onSave}
        >
          <Save size={20} />
        </Button>
      </TooltipHolder>
      <Separator orientation="vertical" />
      <TooltipHolder side="left" content="Load from your computer">
        <Button
          size={'icon'}
          variant={'ghost'}
          className="h-10 w-10 p-2"
          onClick={onLoad}
        >
          <Folder size={20} />
        </Button>
      </TooltipHolder>
      <Separator orientation="vertical" />
      <DeleteConfirmationModal
        onConfirm={onDeleteAllConfirm}
        message="This action cannot be undone. This will permanently delete the components from the project."
        triggerButton={
          <Button size={'icon'} variant={'ghost'} className="h-10 w-10 p-2">
            <Trash2 size={20} />
          </Button>
        }
      />
      <Separator orientation="vertical" />
      <ConnectionSettings
        triggerButton={
          <Button size={'icon'} variant={'ghost'} className="h-10 w-10 p-2">
            <Settings size={20} />
          </Button>
        }
      />
      <Separator orientation="vertical" />
      <DarkModeToggle />
      <Separator />
    </div>
  );
};

export default Toolbar;
