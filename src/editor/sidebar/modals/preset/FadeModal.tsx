import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Group, InputLabel, NumberInput, Select, Stack } from '@mantine/core';
import { capitalize } from 'lodash';
import { AnyProperty } from 'openspace-api-js/types';
import { useShallow } from 'zustand/react/shallow';

import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { WidgetSettings } from '@/components/WidgetSettings';
import { FadeComponent, Toggle, usePropertyStore } from '@/store';
import { ComponentBaseColors } from '@/types/components';
import { formatName } from '@/utils/apiHelpers';

interface Props {
  component: FadeComponent | null;
  handleComponentData: (data: Partial<FadeComponent>) => void;
}

function FadeModal({ component, handleComponentData }: Props) {
  const { t } = useTranslation('fade');
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
  const [property, setProperty] = useState<string>(component?.property || '');
  const [intDuration, setIntDuration] = useState<number>(component?.intDuration || 1);
  const [guiName, setGuiName] = useState<string>(component?.gui_name || '');
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [guiDescription, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [action, setAction] = useState<string>(component?.action || 'toggle');
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.fade
  );

  const handlePropertyChange = (property: string) => {
    setProperty(property);
    if (!lockName) {
      setGuiName(
        `${formatName(
          property.replace(/Scene.|.Renderable|.Opacity/g, '').replace(/\./g, ' > ')
        )} ${capitalize(action)}`
      );
      setGuiDescription(
        `${property.trim()} ${action === 'toggle' ? 'in and out' : action}`
      );
    }
  };

  const handleActionChange = (action: string) => {
    setAction(action);
    if (!lockName) {
      setGuiName(
        `${formatName(
          property.replace(/Scene.|.Renderable|.Opacity/g, '').replace(/\./g, ' > ')
        )} ${capitalize(action)}`
      );
      setGuiDescription(
        `${property.trim()} ${action === 'toggle' ? 'in and out' : action}`
      );
    }
  };

  useEffect(() => {
    handleComponentData({
      property,
      intDuration,
      action: action as Toggle,
      backgroundImage,
      lockName,
      gui_name: guiName,
      gui_description: guiDescription,
      color
    });
  }, [
    property,
    intDuration,
    action,
    backgroundImage,
    guiName,
    guiDescription,
    lockName,
    color,
    handleComponentData
  ]);

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

  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>{t('property')}</InputLabel>
        <VirtualizedCombobox
          options={Object.keys(sortedKeys)}
          selectOption={(v: string) => handlePropertyChange(sortedKeys[v])}
          selectedOption={
            Object.keys(sortedKeys).find((key) => sortedKeys[key] === property) || ''
          }
          searchPlaceholder={'Search the Scene...'}
        />
      </Stack>
      <Group grow align={'flex-end'} wrap={'nowrap'}>
        <Stack gap={'xs'}>
          <InputLabel>{t('action-type')}</InputLabel>
          <Select
            allowDeselect={false}
            data={['toggle', 'on', 'off']}
            placeholder={'Select an option'}
            value={action}
            onChange={(value) => value && handleActionChange(value)}
          />
        </Stack>
        <NumberInput
          id={'duration'}
          label={t('fade-duration')}
          placeholder={'Duration to Fade'}
          min={0}
          max={20}
          step={0.1}
          value={intDuration}
          onChange={(value) =>
            setIntDuration(typeof value === 'number' ? value : parseFloat(value))
          }
        />
      </Group>
      <WidgetSettings
        guiName={guiName}
        setGuiName={setGuiName}
        lockName={lockName}
        setLockName={setLockName}
        color={color}
        setColor={setColor}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
        guiDescription={guiDescription}
        setGuiDescription={setGuiDescription}
      />
    </Stack>
  );
}

export { FadeModal };
