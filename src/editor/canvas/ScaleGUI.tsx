import { NumberInput, Stack } from '@mantine/core';

import HoldButton from '@/components/HoldButton';
import { ZoomInIcon, ZoomOutIcon } from '@/icons/icons';
import { useSettingsStore } from '@/store';
import { getCopy } from '@/utils/copyHelpers';

export default function ScaleGUI() {
  const scale = useSettingsStore((state) => state.pageScale);
  const setScale = useSettingsStore((state) => state.setScale);
  const zoomIn = () => {
    setScale((prevScale) => Math.min(2.0, Math.max(0.5, prevScale + 0.01)));
  };
  const zoomOut = () => {
    setScale((prevScale) => Math.min(2.0, Math.max(0.5, prevScale - 0.01)));
  };
  return (
    <Stack w={64} align={'center'} justify={'center'} gap={8}>
      <HoldButton onClick={zoomIn}>
        <ZoomInIcon size={16} />
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
        <ZoomOutIcon size={16} />
      </HoldButton>
    </Stack>
  );
}
