import { Button, Group, Modal, Text } from '@mantine/core';

import { getCopy } from '@/utils/copyHelpers';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  message: string;
  setOpen: (isOpen: boolean) => void;
}

function ConfirmationModal({
  isOpen,
  onConfirm,
  message,
  setOpen
}: ConfirmationModalProps) {
  return (
    <Modal opened={isOpen} onClose={() => setOpen(false)} centered title={''}>
      <Text>{message}</Text>
      <Group justify={'flex-end'} mt={'md'}>
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
}

export default ConfirmationModal;
