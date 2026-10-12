import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Group, InputLabel, NumberInput, Select, Stack } from '@mantine/core';
import type { AnyProperty } from 'openspace-api-js/types';
import { useShallow } from 'zustand/react/shallow';

import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { WidgetSettings } from '@/components/WidgetSettings';
import { ModalFooter } from '@/editor/sidebar/modals/ModalFooter';
import {
  type ComponentModalChildProps,
  useSaveComponent
} from '@/editor/sidebar/modals/saveComponent';
import { type FadeComponent, type Toggle, usePropertyStore } from '@/store';
import { ComponentBaseColors, ToggleActions } from '@/types/components';
import { formatName } from '@/utils/apiHelpers';

const DEFAULTS: Omit<FadeComponent, 'id'> = {
  type: 'fade',
  isMulti: 'false',
  gui_name: '',
  gui_description: '',
  property: '',
  intDuration: 1,
  action: 'toggle',
  backgroundImage: '',
  color: ComponentBaseColors.fade
};

export function FadeModal({
  component,
  componentId,
  initialData,
  onClose,
  onCancel
}: ComponentModalChildProps<'fade'>) {
  const { t } = useTranslation('fade');
  const [data, setData] = useState<FadeComponent>(
    () => component ?? { ...DEFAULTS, ...initialData, id: componentId ?? '' }
  );
  const saveComponent = useSaveComponent();
  const properties = usePropertyStore(
    useShallow((state) =>
      Object.keys(state.properties)
        .filter((a) => a.endsWith('.Opacity'))
        .reduce((acc: Record<string, AnyProperty>, key: string) => {
          acc[key] = state.properties[key];
          return acc;
        }, {})
    )
  );

  const { property, intDuration, action } = data;

  function getPlaceholders() {
    if (!property) {
      return { name: '', description: '' };
    }
    const name = formatName(
      property.replace(/Scene.|.Renderable|.Opacity/g, '').replace(/\./g, ' > ')
    );
    return {
      name: t(`placeholder-name-${action}`, { name }),
      description: t(`placeholder-description-${action}`, { property: property.trim() })
    };
  }

  const placeholders = getPlaceholders();

  const sortedKeys: Record<string, string> = useMemo(
    () =>
      Object.keys(properties)
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
        }, {}),
    [properties]
  );

  function handleData(patch: Partial<FadeComponent>) {
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
          searchPlaceholder={t('search-scene')}
        />
      </Stack>
      <Group grow align={'flex-end'} wrap={'nowrap'}>
        <Stack gap={'xs'}>
          <InputLabel>{t('action-type')}</InputLabel>
          <Select
            allowDeselect={false}
            data={ToggleActions.map((value) => ({
              value,
              label: t(`action-${value}`)
            }))}
            placeholder={t('select-option')}
            value={action}
            onChange={(value) => value && handleData({ action: value as Toggle })}
          />
        </Stack>
        <NumberInput
          id={'duration'}
          label={t('fade-duration')}
          placeholder={t('duration-placeholder')}
          min={0}
          max={20}
          step={0.1}
          value={intDuration}
          onChange={(value) =>
            handleData({
              intDuration: typeof value === 'number' ? value : parseFloat(value)
            })
          }
        />
      </Group>
      <WidgetSettings
        data={data}
        handleData={handleData}
        placeholders={placeholders}
      />
      <ModalFooter isEdit={!!component} onSave={save} onCancel={onCancel} />
    </Stack>
  );
}
