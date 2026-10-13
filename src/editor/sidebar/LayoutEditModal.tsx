import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Checkbox,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput
} from '@mantine/core';

import { useSettingsStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  layoutId: string | null;
}

export function LayoutEditModal({ isOpen, onClose, layoutId }: Props) {
  const { t } = useTranslation('layout-edit-modal');
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
      size={'lg'}
      title={t('edit-layout')}
    >
      <Stack gap={'xs'}>
        {layoutType == 'grid' && (
          <>
            <Text size={'lg'} fw={600}>
              {t('grid-size')}
            </Text>
            <Text size={'sm'} c={'dimmed'}>
              {t('grid-size-description')}
            </Text>
            <SimpleGrid cols={2} mt={'md'}>
              <TextInput
                label={t('rows')}
                value={rows}
                onChange={(e) => setRows(e.currentTarget.value)}
              />
              <TextInput
                label={t('columns')}
                value={columns}
                onChange={(e) => setColumns(e.currentTarget.value)}
              />
            </SimpleGrid>
          </>
        )}
        <Checkbox
          label={t('persist-across-pages')}
          labelPosition={'left'}
          checked={persistent}
          onChange={(event) => setPersistent(event.currentTarget.checked)}
        />
      </Stack>
      <Group justify={'flex-end'} mt={'md'}>
        <Button variant={'default'} onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button variant={'filled'} onClick={handleSave}>
          {t('save')}
        </Button>
      </Group>
    </Modal>
  );
}
