import { useTranslation } from 'react-i18next';
import { NumberInput, Stack } from '@mantine/core';

import { HoldButton } from '@/components/HoldButton';
import { ZoomInIcon, ZoomOutIcon } from '@/icons/icons';
import { useSettingsStore } from '@/store';
import { IconSize } from '@/types/enums';

export function ScaleGUI() {
  const { t } = useTranslation('scale-gui');
  const scale = useSettingsStore((state) => state.pageScale);
  const setScale = useSettingsStore((state) => state.setScale);

  function adjustScale(amount: number) {
    setScale((prevScale) => Math.min(2.0, Math.max(0.5, prevScale + amount)));
  }

  return (
    <Stack w={64} align={'center'} justify={'center'} gap={'xs'}>
      <HoldButton onClick={() => adjustScale(0.01)}>
        <ZoomInIcon size={IconSize.sm} />
      </HoldButton>
      <NumberInput
        value={Math.round(scale * 100)}
        onChange={(value) =>
          setScale(() => (typeof value === 'number' ? value : parseFloat(value)) / 100)
        }
        hideControls
        suffix={`${t('percent')}`}
        styles={{ input: { textAlign: 'center' } }}
      />
      <HoldButton onClick={() => adjustScale(-0.01)}>
        <ZoomOutIcon size={IconSize.sm} />
      </HoldButton>
    </Stack>
  );
}
