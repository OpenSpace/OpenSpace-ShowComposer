import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputLabel, Select, Stack } from '@mantine/core';
import { capitalize } from 'lodash';
import { useShallow } from 'zustand/react/shallow';

import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { WidgetSettings } from '@/components/WidgetSettings';
import { ModalFooter } from '@/editor/sidebar/modals/ModalFooter';
import {
  ComponentModalChildProps,
  useSaveComponent
} from '@/editor/sidebar/modals/saveComponent';
import { BooleanComponent, Toggle, usePropertyStore } from '@/store';
import { ComponentBaseColors } from '@/types/components';
import { formatName } from '@/utils/apiHelpers';

const DEFAULTS: Omit<BooleanComponent, 'id'> = {
  type: 'boolean',
  isMulti: 'false',
  gui_name: '',
  gui_description: '',
  property: '',
  action: 'toggle',
  backgroundImage: '',
  color: ComponentBaseColors.boolean
};

function BoolModal({
  component,
  componentId,
  initialData,
  onClose,
  onCancel
}: ComponentModalChildProps<'boolean'>) {
  const { t } = useTranslation('boolean');
  const [data, setData] = useState<BooleanComponent>(
    () => component ?? { ...DEFAULTS, ...initialData, id: componentId ?? '' }
  );
  const saveComponent = useSaveComponent();
  const properties = usePropertyStore(useShallow((state) => state.properties));

  const { property, action } = data;
  const boundProperty = properties[property];

  const placeholders = boundProperty
    ? {
        name: `${formatName(boundProperty.uri)} > ${capitalize(action)}`,
        description: boundProperty.metaData?.description ?? ''
      }
    : { name: '', description: '' };

  const sortedKeys: Record<string, string> = Object.keys(properties)
    .filter((a) => properties[a].metaData?.type === 'BoolProperty')
    .sort((a, b) => {
      const periodCountA = (a.match(/\./g) || []).length;
      const periodCountB = (b.match(/\./g) || []).length;
      if (periodCountA !== periodCountB) {
        return periodCountA - periodCountB;
      }
      return a.localeCompare(b);
    })
    .reduce((acc: Record<string, string>, key) => {
      const newValue = formatName(key);
      acc[newValue] = key;
      return acc;
    }, {});

  function handleData(patch: Partial<BooleanComponent>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    saveComponent(data, placeholders);
    onClose();
  }

  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>{t('property')}</InputLabel>
        <VirtualizedCombobox
          options={Object.keys(sortedKeys)}
          selectOption={(v: string) => handleData({ property: sortedKeys[v] })}
          selectedOption={
            Object.keys(sortedKeys).find((key) => sortedKeys[key] === property) || ''
          }
          searchPlaceholder={'Search the Scene...'}
        />
      </Stack>
      <Stack gap={'xs'}>
        <InputLabel>{t('action-type')}</InputLabel>
        <Select
          allowDeselect={false}
          data={['toggle', 'on', 'off']}
          placeholder={'Select an option'}
          value={action}
          onChange={(value) => value && handleData({ action: value as Toggle })}
        />
      </Stack>
      <WidgetSettings data={data} handleData={handleData} placeholders={placeholders} />
      <ModalFooter isEdit={!!component} onSave={save} onCancel={onCancel} />
    </Stack>
  );
}

export { BoolModal };
