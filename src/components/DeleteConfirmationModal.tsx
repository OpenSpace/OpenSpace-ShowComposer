// DeleteConfirmationModal.tsx
import React, { ReactElement, useState, cloneElement } from 'react';

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
      <AlertDialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>{enhancedTriggerButton}</TooltipTrigger>
          <TooltipContent className="bg-white">
            Delete all components
          </TooltipContent>
        </Tooltip>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setOpen(false);
              onClose && onClose();
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationModal;
