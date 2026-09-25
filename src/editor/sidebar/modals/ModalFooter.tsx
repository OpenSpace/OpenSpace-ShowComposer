import { useTranslation } from 'react-i18next';
import { Button, Group } from '@mantine/core';

interface Props {
  isEdit: boolean;
  onSave: () => void;
  onCancel: () => void;
}

function ModalFooter({ isEdit, onSave, onCancel }: Props) {
  const { t } = useTranslation('component-modal');
  return (
    <Group justify={'flex-end'} mt={'md'}>
      <Button variant={'default'} onClick={onCancel}>
        {t('cancel')}
      </Button>
      <Button variant={'filled'} onClick={onSave}>
        {isEdit ? t('save') : t('create')}
      </Button>
    </Group>
  );
}

export { ModalFooter };
