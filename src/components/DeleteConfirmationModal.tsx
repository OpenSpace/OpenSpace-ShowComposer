// DeleteConfirmationModal.tsx
import React, { ReactElement, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { getCopy } from '@/utils/copyHelpers';
interface DeleteConfirmationModalProps {
  onConfirm: () => void;
  message: string;
  triggerButton?: ReactElement;
  isOpen?: boolean;
  setOpen?: (isOpen: boolean) => void;
  onClose?: () => void;
}
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  onConfirm,
  message,
  isOpen: externalIsOpen,
  setOpen: externalSetOpen,
  onClose
}) => {
  const [internalIsOpen, internalSetOpen] = useState<boolean>(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setOpen = externalSetOpen || internalSetOpen;

  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      {/* <Tooltip>
        <AlertDialogTrigger asChild>
          <TooltipTrigger asChild>{enhancedTriggerButton}</TooltipTrigger>
        </AlertDialogTrigger>

        <TooltipContent side="bottom" className="bg-white">
          {getCopy('DeleteConfirmationModal', 'delete_all_components')}
        </TooltipContent>
      </Tooltip> */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {getCopy('DeleteConfirmationModal', 'confirmation_text')}
          </AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setOpen(false);
              onClose && onClose();
            }}
          >
            {getCopy('DeleteConfirmationModal', 'cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            {getCopy('DeleteConfirmationModal', 'delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default DeleteConfirmationModal;
