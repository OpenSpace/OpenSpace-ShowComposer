import React from 'react';
import { Button, Group, Modal, Text } from '@mantine/core';

import { getCopy } from '@/utils/copyHelpers';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  message: string;
  setOpen: (isOpen: boolean) => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  message,
  setOpen
}) => {
  return (
    <Modal opened={isOpen} onClose={() => setOpen(false)} centered title={''}>
      <Text>{message}</Text>
      <Group justify={'flex-end'} mt={'md'}>
        {/* <Button variant={'default'} onClick={() => setOpen(false)}>
          {getCopy('ConfirmationModal', 'cancel')}
        </Button> */}
        <Button
          variant={'filled'}
          onClick={() => {
            onConfirm();
            setOpen(false);
          }}
        >
          {getCopy('ConfirmationModal', 'ok')}
        </Button>
      </Group>
    </Modal>
  );
};

export default ConfirmationModal;
