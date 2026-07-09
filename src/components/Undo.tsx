import { ActionIcon, Button } from '@mantine/core';
import { Redo as RedoIcon, Undo as UndoIcon } from 'lucide-react';

import { useBoundStoreTemporal } from '@/store/boundStore';
const Undo = () => {
  const { undo, redo, clear, pastStates, futureStates } = useBoundStoreTemporal(
    (state) => state
  );
  return (
    <div>
      <div className={'flex w-full flex-row items-center justify-start gap-2'}>
        <h2 className={' text-xs font-bold'}>History:</h2>
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
      </div>
      {/* {currentCommand?.description} */}
      {/* Rest of your editor */}
    </div>
  );
};
export default Undo;
