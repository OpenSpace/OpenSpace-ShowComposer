import { ActionIcon, Button, Group, Text } from '@mantine/core';

import { RedoIcon, UndoIcon } from '@/icons/icons';
import { useBoundStoreTemporal } from '@/store/boundStore';

export function Undo() {
  const { undo, redo, clear, pastStates, futureStates } = useBoundStoreTemporal(
    (state) => state
  );
  return (
    <Group w={'100%'} gap={'xs'}>
      <Text size={'xs'} fw={700}>
        History:
      </Text>
      <ActionIcon
        variant={'filled'}
        onClick={() => undo()}
        disabled={!pastStates.length}
        size={'lg'}
      >
        <UndoIcon size={16} />
      </ActionIcon>
      <ActionIcon
        variant={'filled'}
        onClick={() => redo()}
        disabled={!futureStates.length}
        size={'lg'}
      >
        <RedoIcon size={16} />
      </ActionIcon>
      <Button size={'sm'} variant={'subtle'} onClick={() => clear()}>
        Clear
      </Button>
    </Group>
  );
}
