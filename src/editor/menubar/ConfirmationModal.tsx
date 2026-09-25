import { useTranslation } from 'react-i18next';
import { Button, Group, Modal, Text } from '@mantine/core';

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  message: string;
  setOpen: (isOpen: boolean) => void;
}

function ConfirmationModal({ isOpen, onConfirm, message, setOpen }: Props) {
  const { t } = useTranslation('confirmation-modal');
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
          {t('ok')}
        </Button>
      </Group>
    </Modal>
  );
}

export { ConfirmationModal };
