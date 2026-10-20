import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, NumberInput, Stack } from '@mantine/core';

import { useSettingsStore } from '@/store';

export function GridSettings({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('grid-settings');
  const gridSize = useSettingsStore((state) => state.gridSize);
  const setGridSize = useSettingsStore((state) => state.setGridSize);
  const [rows, setRows] = useState(gridSize.rows);
  const [columns, setColumns] = useState(gridSize.columns);

  return (
    <Stack gap={'md'}>
      <NumberInput
        label={t('rows')}
        size={'xs'}
        min={1}
        max={10}
        value={rows}
        onChange={(value) => setRows(typeof value === 'number' ? value : parseInt(value))}
        allowDecimal={false}
      />
      <NumberInput
        label={t('columns')}
        size={'xs'}
        min={1}
        max={10}
        value={columns}
        onChange={(value) =>
          setColumns(typeof value === 'number' ? value : parseInt(value))
        }
        allowDecimal={false}
      />
      <Group justify={'space-between'}>
        <Button variant={'default'} onClick={() => onClose()}>
          {t('cancel')}
        </Button>
        <Button
          variant={'filled'}
          onClick={() => {
            setGridSize({ rows, columns });
            onClose();
          }}
        >
          {t('save')}
        </Button>
      </Group>
    </Stack>
  );
}
