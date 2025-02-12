import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ColorPickerComponent from '@/components/common/ColorPickerComponent';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors } from '@/store/ComponentTypes';
import { Page } from '@/store/ComponentTypes';

interface NewPageModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  newPage: boolean;
}

const NewPageModal: React.FC<NewPageModalProps> = ({
  isOpen,
  setIsOpen,
  newPage,
}) => {
  const currentPage: Page = useBoundStore((state) =>
    state.getPageById(state.currentPage),
  );

  useEffect(() => {
    console.log('currentPage', currentPage);
  }, [currentPage]);
  const [pageName, setPageName] = useState<string>(
    newPage ? '' : currentPage?.name || '',
  );
  const [backgroundColor, setBackgroundColor] = useState<string>(
    newPage
      ? ComponentBaseColors.page
      : currentPage?.color || ComponentBaseColors.page,
  );
  useEffect(() => {
    if (!newPage) {
      setPageName(currentPage?.name || '');
      setBackgroundColor(currentPage?.color || ComponentBaseColors.page);
    } else {
      setPageName('');
      setBackgroundColor(ComponentBaseColors.page);
    }
  }, [isOpen]);
  const addPage = useBoundStore((state) => state.addPage);
  const updatePage = useBoundStore((state) => state.updatePage);

  const handleSubmit = () => {
    if (newPage) {
      addPage(undefined, pageName, backgroundColor);
    } else {
      updatePage(currentPage.id, { name: pageName, color: backgroundColor });
    }
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {newPage ? 'Create New Page' : 'Update Page Settings'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {newPage
              ? 'Set the name and background color for the new page.'
              : 'Update the page name and background color.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-3 items-center gap-4 text-white">
            <Label htmlFor="pageName">Page Name</Label>
            <Input
              id="pageName"
              className="col-span-2 h-8"
              type="text"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              placeholder="Enter Page Name"
            />
          </div>
          <div className="grid items-center gap-4 text-white">
            <Label htmlFor="backgroundColor">Background Color</Label>
            <ColorPickerComponent
              color={backgroundColor}
              setColor={setBackgroundColor}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>
            {newPage ? 'Create Page' : 'Update Page'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NewPageModal;
