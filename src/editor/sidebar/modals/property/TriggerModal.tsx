import { useEffect, useState } from 'react';
import { InputLabel, Stack } from '@mantine/core';
import { useShallow } from 'zustand/react/shallow';

import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { WidgetSettings } from '@/components/WidgetSettings';
import { TriggerComponent, usePropertyStore } from '@/store';
import { ComponentBaseColors } from '@/types/components';
import { formatName } from '@/utils/apiHelpers';
import { getCopy } from '@/utils/copyHelpers';

interface Props {
  component: TriggerComponent | null;
  handleComponentData: (data: Partial<TriggerComponent>) => void;
}

function TriggerModal({ component, handleComponentData }: Props) {
  const properties = usePropertyStore(useShallow((state) => state.properties));
  const [property, setProperty] = useState<string>(component?.property || '');
  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.trigger
  );

  useEffect(() => {
    const propertyData = usePropertyStore.getState().properties[property];
    if (!propertyData || lockName) return;
    setGuiName(formatName(propertyData.uri));
    setGuiDescription(propertyData.metaData.description);
  }, [property]);

  useEffect(() => {
    handleComponentData({
      property,
      gui_name,
      gui_description,
      lockName,
      backgroundImage,
      color
    });
  }, [
    property,
    gui_name,
    gui_description,
    lockName,
    backgroundImage,
    color,
    handleComponentData
  ]);

  const sortedKeys: Record<string, string> = Object.keys(properties)
    .filter((a) => properties[a].metaData?.type === 'TriggerProperty')
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
        <InputLabel>{getCopy('Trigger', 'property')}</InputLabel>
        <VirtualizedCombobox
          options={Object.keys(sortedKeys)}
          selectOption={(v: string) => setProperty(sortedKeys[v])}
          selectedOption={
            Object.keys(sortedKeys).find((key) => sortedKeys[key] === property) || ''
          }
          searchPlaceholder={'Search the Scene...'}
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

export { TriggerModal };
