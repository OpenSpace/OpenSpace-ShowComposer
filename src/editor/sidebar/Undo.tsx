import { useTranslation } from 'react-i18next';
import { ActionIcon, Button, Group, Text } from '@mantine/core';

import { RedoIcon, UndoIcon } from '@/icons/icons';
import { useBoundStoreTemporal } from '@/store/boundStore';
import { IconSize } from '@/types/enums';

export function Undo() {
  const { t } = useTranslation('undo');
  const { undo, redo, clear, pastStates, futureStates } = useBoundStoreTemporal(
    (state) => state
  );
  return (
    <Group w={'100%'} gap={'xs'}>
      <Text size={'xs'} fw={700}>
        {t('history')}
      </Text>
      <ActionIcon
        variant={'filled'}
        onClick={() => undo()}
        disabled={!pastStates.length}
        size={'lg'}
      >
        <UndoIcon size={IconSize.sm} />
      </ActionIcon>
      <ActionIcon
        variant={'filled'}
        onClick={() => redo()}
        disabled={!futureStates.length}
        size={'lg'}
      >
        <RedoIcon size={IconSize.sm} />
      </ActionIcon>
      <Button size={'sm'} variant={'subtle'} onClick={() => clear()}>
        {t('clear')}
      </Button>
    </Group>
  );
}
