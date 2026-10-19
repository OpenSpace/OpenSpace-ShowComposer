import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputLabel, Stack } from '@mantine/core';
import { useShallow } from 'zustand/react/shallow';

import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { WidgetSettings } from '@/components/WidgetSettings';
import { ModalFooter } from '@/editor/sidebar/modals/ModalFooter';
import {
  type ComponentModalChildProps,
  useSaveComponent
} from '@/editor/sidebar/modals/saveComponent';
import { usePropertyStore } from '@/store';
import { NavigationAnchorKey } from '@/store/apiStore';
import { ComponentBaseColors, type SetFocusComponent } from '@/types/components';
import { formatName, getStringBetween } from '@/utils/apiHelpers';

const DEFAULTS: Omit<SetFocusComponent, 'id'> = {
  type: 'setfocus',
  isMulti: 'false',
  gui_name: '',
  gui_description: '',
  property: '',
  backgroundImage: '',
  color: ComponentBaseColors.setfocus
};

export function FocusModal({
  component,
  componentId,
  initialData,
  onClose,
  onCancel
}: ComponentModalChildProps<'setfocus'>) {
  const { t } = useTranslation('focus');
  const [data, setData] = useState<SetFocusComponent>(
    () => component ?? { ...DEFAULTS, ...initialData, id: componentId ?? '' }
  );
  const saveComponent = useSaveComponent();
  const properties = usePropertyStore(useShallow((state) => state.properties));

  const { property } = data;
  const anchorMeta = properties[NavigationAnchorKey]?.metaData;

  const placeholder = property
    ? {
        name: t('placeholder-name', { property }),
        description: t('placeholder-description', {
          property,
          description: anchorMeta?.description ?? ''
        })
      }
    : { name: '', description: '' };

  const sortedKeys: Record<string, string> = Object.keys(properties)
    .filter((a) => a.includes('.Renderable'))
    .sort((a, b) => {
      const periodCountA = (a.match(/\./g) || []).length;
      const periodCountB = (b.match(/\./g) || []).length;
      if (periodCountA !== periodCountB) {
        return periodCountA - periodCountB;
      }
      return a.localeCompare(b);
    })
    .reduce((acc: Record<string, string>, key) => {
      const newValue = getStringBetween(key, 'Scene.', '.Renderable');
      acc[formatName(newValue)] = newValue;
      return acc;
    }, {});

  function handleData(patch: Partial<SetFocusComponent>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function save() {
    saveComponent(data, placeholder);
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
          searchPlaceholder={t('search-scene')}
        />
      </Stack>
      <WidgetSettings data={data} handleData={handleData} placeholder={placeholder} />
      <ModalFooter isEdit={!!component} onSave={save} onCancel={onCancel} />
    </Stack>
  );
}
