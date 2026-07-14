import React from 'react';
import { NumberInput } from '@mantine/core';
import { ZoomIn, ZoomOut } from 'lucide-react';

import HoldButton from '@/components/HoldButton';
import { useSettingsStore } from '@/store';
import { getCopy } from '@/utils/copyHelpers';
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
      <HoldButton onClick={zoomIn}>
        <ZoomIn size={'16'} />
      </HoldButton>
      <NumberInput
        value={Math.round(scale * 100)}
        onChange={(value) =>
          setScale(() => (typeof value === 'number' ? value : parseFloat(value)) / 100)
        }
        hideControls
        suffix={`${getCopy('ScaleGUI', '%')}`}
        styles={{ input: { textAlign: 'center' } }}
      />
      <HoldButton onClick={zoomOut}>
        <ZoomOut size={'16'} />
      </HoldButton>
    </div>
  );
};
export default ScaleGUI;
