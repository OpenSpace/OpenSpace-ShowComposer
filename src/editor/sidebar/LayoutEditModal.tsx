import { useEffect, useState } from 'react';
import {
  Button,
  Group,
  InputLabel,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput
} from '@mantine/core';

import Toggle from '@/components/Toggle';
import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { getCopy } from '@/utils/copyHelpers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  layoutId: string | null;
}

export default function LayoutEditModal({
  isOpen,
  onClose,
  layoutId
}: Props) {
  const gridSettings = useSettingsStore((state) => state.gridSize);
  const gridSize = useBoundStore((state) => ({
    columns: layoutId
      ? state.layouts[layoutId]?.columns || gridSettings.columns
      : gridSettings.columns,
    rows: layoutId
      ? state.layouts[layoutId]?.rows || gridSettings.rows
      : gridSettings.rows
  }));

  const layout = useBoundStore((state) => state.layouts[layoutId || '']);
  const layoutType = layout?.type;

  const updateLayout = useBoundStore((state) => state.updateLayout);
  const setGridSize = useSettingsStore((state) => state.setGridSize);
  const [rows, setRows] = useState(gridSize.rows.toString());
  const [columns, setColumns] = useState(gridSize.columns.toString());
  const [persistent, setPersistent] = useState(layout?.persistent || false);

  useEffect(() => {
    if (isOpen) {
      setPersistent(layout?.persistent || false);
    }
  }, [isOpen, layout]);

  const handleSave = () => {
    if (!layoutId) return;
    setGridSize({
      rows: parseInt(rows),
      columns: parseInt(columns)
    });
    updateLayout(layoutId, {
      rows: parseInt(rows),
      columns: parseInt(columns),
      persistent
    });
    onClose();
  };

  return (
    <Modal
      opened={isOpen && !!layoutId}
      onClose={onClose}
      centered
      size={510}
      title={getCopy('LayoutEditModal', 'edit_layout')}
    >
      <Stack gap={'xs'}>
        {layoutType == 'grid' && (
          <>
            <Text size={'lg'} fw={600}>
              {getCopy('LayoutEditModal', 'grid_size')}
            </Text>
            <Text size={'sm'} c={'dimmed'}>
              {getCopy('LayoutEditModal', 'grid_size_description')}
            </Text>
            <SimpleGrid cols={2} mt={'md'}>
              <TextInput
                label={'# of Rows'}
                value={rows}
                onChange={(e) => setRows(e.currentTarget.value)}
              />
              <TextInput
                label={'# of Columns'}
                value={columns}
                onChange={(e) => setColumns(e.currentTarget.value)}
              />
            </SimpleGrid>
          </>
        )}
        <Group gap={'xs'}>
          <InputLabel htmlFor={'persistent'}>
            {getCopy('LayoutEditModal', 'persist_across_pages')}
          </InputLabel>
          <Toggle value={persistent} setValue={setPersistent} />
        </Group>
      </Stack>
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={onClose}>
          Cancel
        </Button>
        <Button variant={'filled'} onClick={handleSave}>
          Save
        </Button>
      </Group>
    </Modal>
  );
}
