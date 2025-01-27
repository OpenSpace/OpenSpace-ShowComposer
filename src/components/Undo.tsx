import { useBoundStoreTemporal } from '@/store/boundStore';
import { Button } from './ui/button';
import { Undo as UndoIcon, Redo as RedoIcon } from 'lucide-react';
const Undo = () => {
  const { undo, redo, clear, pastStates, futureStates } = useBoundStoreTemporal(
    (state) => state,
  );
  return (
    <div>
      <div className="flex w-full flex-row items-center justify-start gap-2">
        <h2 className=" text-xs font-bold">History:</h2>
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
