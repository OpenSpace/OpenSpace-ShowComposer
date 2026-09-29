import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Modal, Text } from '@mantine/core';

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
  const { t } = useTranslation('delete-confirmation-modal');
  const [internalIsOpen, internalSetOpen] = useState<boolean>(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setOpen = externalSetOpen || internalSetOpen;

  return (
    <Modal
      opened={isOpen}
      onClose={() => setOpen(false)}
      centered
      title={t('confirmation-text')}
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
          {t('cancel')}
        </Button>
        <Button
          variant={'filled'}
          onClick={() => {
            onConfirm();
            setOpen(false);
          }}
        >
          {t('delete')}
        </Button>
      </Group>
    </Modal>
  );
}
export { DeleteConfirmationModal };
