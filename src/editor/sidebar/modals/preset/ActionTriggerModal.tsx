import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputLabel, Stack } from '@mantine/core';

import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { WidgetSettings } from '@/components/WidgetSettings';
import { ModalFooter } from '@/editor/sidebar/modals/ModalFooter';
import {
  ComponentModalChildProps,
  useSaveComponent
} from '@/editor/sidebar/modals/saveComponent';
import { usePropertyStore } from '@/store';
import { ActionTriggerComponent, ComponentBaseColors } from '@/types/components';

const DEFAULTS: Omit<ActionTriggerComponent, 'id'> = {
  type: 'action',
  isMulti: 'false',
  gui_name: '',
  gui_description: '',
  action: '',
  backgroundImage: '',
  color: ComponentBaseColors.action
};

function ActionTriggerModal({
  component,
  componentId,
  initialData,
  onClose,
  onCancel
}: ComponentModalChildProps<'action'>) {
  const { t } = useTranslation('action-trigger');
  const [data, setData] = useState<ActionTriggerComponent>(
    () => component ?? { ...DEFAULTS, ...initialData, id: componentId ?? '' }
  );
  const saveComponent = useSaveComponent();
  const actions = usePropertyStore((state) => state.actions);

  const { action } = data;
  const actionEntry = action
    ? Object.values(actions).find((a) => a.Identifier === action)
    : undefined;

  const placeholders = actionEntry
    ? { name: actionEntry.Name, description: actionEntry.Documentation }
    : { name: '', description: '' };

  function handleData(patch: Partial<ActionTriggerComponent>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    saveComponent(data, placeholders);
    onClose();
  }

  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>{t('action')}</InputLabel>
        <VirtualizedCombobox
          options={Object.keys(actions)}
          selectOption={(v: string) => handleData({ action: actions[v].Identifier })}
          selectedOption={
            Object.keys(actions).find((key) => actions[key].Identifier === action) || ''
          }
          searchPlaceholder={'Search the Actions...'}
          delimiter={'/'}
        />
      </Stack>
      <WidgetSettings
        data={data}
        handleData={handleData}
        placeholders={placeholders}
      />
      <ModalFooter isEdit={!!component} onSave={save} onCancel={onCancel} />
    </Stack>
  );
}

export { ActionTriggerModal };
