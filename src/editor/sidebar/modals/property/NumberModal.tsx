import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputLabel, NumberInput, SimpleGrid, Stack } from '@mantine/core';
import { useShallow } from 'zustand/react/shallow';

import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { WidgetSettings } from '@/components/WidgetSettings';
import { ModalFooter } from '@/editor/sidebar/modals/ModalFooter';
import {
  ComponentModalChildProps,
  useSaveComponent
} from '@/editor/sidebar/modals/saveComponent';
import { NumberComponent, usePropertyStore } from '@/store';
import { ComponentBaseColors } from '@/types/components';
import { AdditionalDataNumber } from '@/types/Property/propertyTypes';
import { formatName } from '@/utils/apiHelpers';

const DEFAULTS: Omit<NumberComponent, 'id'> = {
  type: 'number',
  isMulti: 'false',
  gui_name: '',
  gui_description: '',
  property: '',
  min: 0.1,
  max: 100,
  step: 0.1,
  exponent: 1,
  backgroundImage: '',
  color: ComponentBaseColors.number
};

function NumberModal({
  component,
  componentId,
  initialData,
  onClose,
  onCancel
}: ComponentModalChildProps<'number'>) {
  const { t } = useTranslation('number');
  const [data, setData] = useState<NumberComponent>(
    () => component ?? { ...DEFAULTS, ...initialData, id: componentId ?? '' }
  );
  const saveComponent = useSaveComponent();
  const properties = usePropertyStore(useShallow((state) => state.properties));

  const { property, min, max, step, exponent } = data;

  const boundProperty = properties[property];
  const placeholders = boundProperty
    ? {
        name: formatName(boundProperty.uri),
        description: boundProperty.metaData?.description ?? ''
      }
    : { name: '', description: '' };

  const selectProperty = (uri: string) => {
    const propertyData = usePropertyStore.getState().properties[uri];
    const additionalData = (
      propertyData?.metaData as { additionalData?: AdditionalDataNumber } | undefined
    )?.additionalData;
    if (additionalData) {
      handleData({
        property: uri,
        min: additionalData.min,
        max: additionalData.max,
        step: additionalData.step,
        exponent: additionalData.exponent
      });
    } else {
      handleData({ property: uri });
    }
  };

  const sortedKeys: Record<string, string> = Object.keys(properties)
    .filter(
      (a) => properties[a].metaData?.type === 'FloatProperty' && !a.includes('.Fade')
    )
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

  function handleData(patch: Partial<NumberComponent>) {
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
          selectOption={(v: string) => selectProperty(sortedKeys[v])}
          selectedOption={
            Object.keys(sortedKeys).find((key) => sortedKeys[key] === property) || ''
          }
          searchPlaceholder={'Search the Scene...'}
        />
      </Stack>
      <SimpleGrid cols={4}>
        <NumberInput
          id={'min'}
          label={t('range-min')}
          placeholder={'Slider Min'}
          value={min || 0}
          onChange={(value) =>
            handleData({ min: typeof value === 'number' ? value : parseFloat(value) })
          }
        />
        <NumberInput
          id={'max'}
          label={t('range-max')}
          placeholder={'Slider Max'}
          value={max || 0}
          onChange={(value) =>
            handleData({ max: typeof value === 'number' ? value : parseFloat(value) })
          }
        />
        <NumberInput
          id={'step'}
          label={t('step')}
          placeholder={'Slider Step'}
          value={step || 0}
          onChange={(value) =>
            handleData({ step: typeof value === 'number' ? value : parseFloat(value) })
          }
        />
        <NumberInput
          id={'exp'}
          label={t('exponent')}
          placeholder={'Slider Exponent'}
          value={exponent || 0}
          onChange={(value) =>
            handleData({
              exponent: typeof value === 'number' ? value : parseFloat(value)
            })
          }
        />
      </SimpleGrid>
      <WidgetSettings
        data={data}
        handleData={handleData}
        placeholders={placeholders}
      />
      <ModalFooter isEdit={!!component} onSave={save} onCancel={onCancel} />
    </Stack>
  );
}

export { NumberModal };
