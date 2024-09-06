// DeleteConfirmationModal.tsx
import React, { ReactElement, useState, cloneElement } from 'react';
import { getCopy } from '@/utils/copyHelpers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
// import { Button } from '@/components/ui/button';

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
  triggerButton,
  isOpen: externalIsOpen,
  setOpen: externalSetOpen,
  onClose,
}) => {
  const [internalIsOpen, internalSetOpen] = useState<boolean>(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setOpen = externalSetOpen || internalSetOpen;
  const enhancedTriggerButton = triggerButton
    ? cloneElement(triggerButton, {
        onClick: (...args: any[]) => {
          setOpen(true); // Open the dialog
          // If the triggerButton had its own onClick handler, call it
          if (triggerButton.props.onClick) {
            triggerButton.props.onClick(...args);
          }
        },
      })
    : null;
  // if (!isOpen) return null;
  //
  return (
    <AlertDialog open={isOpen} onOpenChange={setOpen}>
      <Tooltip>
        <AlertDialogTrigger asChild>
          <TooltipTrigger asChild>{enhancedTriggerButton}</TooltipTrigger>
        </AlertDialogTrigger>

        <TooltipContent className="bg-white">
          {getCopy('DeleteConfirmationModal', 'delete_all_components')}
        </TooltipContent>
      </Tooltip>
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
