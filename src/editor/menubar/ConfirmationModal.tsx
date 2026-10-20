import { useTranslation } from 'react-i18next';
import { Button, Group, Text } from '@mantine/core';

interface Props {
  message: string;
  onClose: () => void;
}

export function ConfirmationModal({ message, onClose }: Props) {
  const { t } = useTranslation('confirmation-modal');

  return (
    <>
      <Text>{message}</Text>
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'filled'} onClick={onClose}>
          {t('ok')}
        </Button>
      </Group>
    </>
  );
}
