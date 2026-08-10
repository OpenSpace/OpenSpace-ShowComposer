import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputLabel, Select, Stack } from '@mantine/core';
import { capitalize } from 'lodash';
import { useShallow } from 'zustand/react/shallow';

import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { WidgetSettings } from '@/components/WidgetSettings';
import { BooleanComponent, Toggle, usePropertyStore } from '@/store';
import { ComponentBaseColors } from '@/types/components';
import { formatName } from '@/utils/apiHelpers';

interface Props {
  component: BooleanComponent | null;
  handleComponentData: (data: Partial<BooleanComponent>) => void;
}

function BoolModal({ component, handleComponentData }: Props) {
  const { t } = useTranslation('boolean');
  const properties = usePropertyStore(useShallow((state) => state.properties));
  const [property, setProperty] = useState<string>(component?.property || '');
  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [action, setAction] = useState<string>(component?.action || 'toggle');
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.boolean
  );

  useEffect(() => {
    const propertyData = usePropertyStore.getState().properties[property];
    if (!propertyData || lockName) return;
    setGuiName(`${formatName(propertyData.uri)} > ${capitalize(action)}`);
    setGuiDescription(propertyData.metaData.description);
  }, [property, action]);

  useEffect(() => {
    handleComponentData({
      property,
      action: action as Toggle,
      gui_name,
      gui_description,
      lockName,
      backgroundImage,
      color
    });
  }, [
    property,
    action,
    gui_name,
    gui_description,
    lockName,
    handleComponentData,
    backgroundImage,
    color
  ]);

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

  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>{t('property')}</InputLabel>
        <VirtualizedCombobox
          options={Object.keys(sortedKeys)}
          selectOption={(v: string) => setProperty(sortedKeys[v])}
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
          onChange={(value) => value && setAction(value)}
        />
      </Stack>
      <WidgetSettings
        guiName={gui_name}
        setGuiName={setGuiName}
        lockName={lockName}
        setLockName={setLockName}
        color={color}
        setColor={setColor}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
        guiDescription={gui_description}
        setGuiDescription={setGuiDescription}
      />
    </Stack>
  );
}

export { BoolModal };
