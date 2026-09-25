import { useState } from 'react';
import { Button, Group, NumberInput, Stack } from '@mantine/core';

import { useSettingsStore } from '@/store';

export function GridSettings({ onClose }: { onClose: () => void }) {
  const gridSize = useSettingsStore((state) => state.gridSize);
  const setGridSize = useSettingsStore((state) => state.setGridSize);
  const [rows, setRows] = useState(gridSize.rows);
  const [columns, setColumns] = useState(gridSize.columns);

  return (
    <Stack gap={'md'}>
      <NumberInput
        label={'# of Rows'}
        size={'xs'}
        min={1}
        max={10}
        value={rows}
        onChange={(value) => setRows(typeof value === 'number' ? value : parseInt(value))}
        allowDecimal={false}
      />
      <NumberInput
        label={'# of Columns'}
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
          Cancel
        </Button>
        <Button
          variant={'filled'}
          onClick={() => {
            setGridSize({ rows, columns });
            onClose();
          }}
        >
          Save
        </Button>
      </Group>
    </Stack>
  );
}
