import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

import { useSettingsStore } from '@/store';
import { getCopy } from '@/utils/copyHelpers';

import HoldButton from './common/HoldButton';
import { Input } from './ui/input';
const ScaleGUI: React.FC = () => {
  const scale = useSettingsStore((state) => state.pageScale);
  const setScale = useSettingsStore((state) => state.setScale);
  const zoomIn = () => {
    setScale((prevScale) => Math.min(2.0, Math.max(0.5, prevScale + 0.01)));
  };
  const zoomOut = () => {
    setScale((prevScale) => Math.min(2.0, Math.max(0.5, prevScale - 0.01)));
  };
  return (
    <div className={'flex w-16 flex-col items-center justify-center gap-2'}>
      <HoldButton variant={'outline'} size={'icon'} onClick={zoomIn}>
        <ZoomIn size={'16'} />
      </HoldButton>
      <Input
        value={Math.round(scale * 100)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setScale(() => parseFloat(e.target.value) / 100)
        }
        type={'number'}
        className={'no-arrows  bg-transparent text-right '}
        max={200}
        min={75}
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0  
                    ml-10 flex  
                    items-center"
      >
        <span className={'text-sm'}>{getCopy('ScaleGUI', '%')}</span>
      </div>
      <HoldButton variant={'outline'} size={'icon'} onClick={zoomOut}>
        <ZoomOut size={'16'} />
      </HoldButton>
    </div>
  );
};
export default ScaleGUI;
