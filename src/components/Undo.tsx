import { useBoundStoreTemporal } from '@/store/boundStore';
import { Button } from './ui/button';
import { Undo as UndoIcon, Redo as RedoIcon, Trash2 } from 'lucide-react';
const Undo = () => {
  const { undo, redo, clear, pastStates, futureStates } = useBoundStoreTemporal(
    (state) => state,
  );
  return (
    <div>
      <div className="flex w-full flex-row items-center justify-start gap-2 p-2">
        <p className="text-xs">History:</p>
        <Button
          size="icon"
          variant="default"
          onClick={() => undo()}
          disabled={!pastStates.length}
          // className="p-4"
        >
          <UndoIcon size={16} />
        </Button>
        <Button
          size="icon"
          variant="default"
          onClick={() => redo()}
          disabled={!futureStates.length}
        >
          <RedoIcon size={16} />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => clear()}>
          Clear
        </Button>
      </div>
      {/* {currentCommand?.description} */}
      {/* Rest of your editor */}
    </div>
  );
};
export default Undo;
