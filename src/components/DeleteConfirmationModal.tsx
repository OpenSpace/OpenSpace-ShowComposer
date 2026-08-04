import { ReactElement, useState } from 'react';
import { Button, Group, Modal, Text } from '@mantine/core';

import { getCopy } from '@/utils/copyHelpers';
interface Props {
  onConfirm: () => void;
  message: string;
  triggerButton?: ReactElement;
  isOpen?: boolean;
  setOpen?: (isOpen: boolean) => void;
  onClose?: () => void;
}
function DeleteConfirmationModal({
  onConfirm,
  message,
  isOpen: externalIsOpen,
  setOpen: externalSetOpen,
  onClose
}: Props) {
  const [internalIsOpen, internalSetOpen] = useState<boolean>(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setOpen = externalSetOpen || internalSetOpen;

  return (
    <Modal
      opened={isOpen}
      onClose={() => setOpen(false)}
      centered
      title={getCopy('DeleteConfirmationModal', 'confirmation_text')}
    >
      <Text>{message}</Text>
      <Group justify={'flex-end'} mt={'md'}>
        <Button
          variant={'default'}
          onClick={() => {
            setOpen(false);
            if (onClose) {
              onClose();
            }
          }}
        >
          {getCopy('DeleteConfirmationModal', 'cancel')}
        </Button>
        <Button
          variant={'filled'}
          onClick={() => {
            onConfirm();
            setOpen(false);
          }}
        >
          {getCopy('DeleteConfirmationModal', 'delete')}
        </Button>
      </Group>
    </Modal>
  );
}
export { DeleteConfirmationModal };
