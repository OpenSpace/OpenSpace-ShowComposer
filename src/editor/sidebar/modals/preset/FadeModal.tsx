import { useEffect, useMemo, useState } from 'react';
import {
  Group,
  InputLabel,
  NumberInput,
  Stack,
  Textarea,
  TextInput
} from '@mantine/core';
import { capitalize } from 'lodash';
import { AnyProperty } from 'openspace-api-js/types';
import { useShallow } from 'zustand/react/shallow';

import BackgroundHolder from '@/components/BackgroundHolder';
import SelectableDropdown from '@/components/SelectableDropdown';
import ToggleComponent from '@/components/Toggle';
import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { FadeComponent, Toggle, usePropertyStore } from '@/store';
import { ComponentBaseColors } from '@/types/components';
import { formatName } from '@/utils/apiHelpers';
import { getCopy } from '@/utils/copyHelpers';

interface FadeModalProps {
  component: FadeComponent | null;
  handleComponentData: (data: Partial<FadeComponent>) => void;
}

function FadeModal({ component, handleComponentData }: FadeModalProps) {
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
        <InputLabel>{getCopy('Fade', 'property')}</InputLabel>
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
          <InputLabel>{getCopy('Fade', 'action_type')}</InputLabel>
          <SelectableDropdown
            options={['toggle', 'on', 'off']}
            selected={action}
            setSelected={handleActionChange}
          />
        </Stack>
        <NumberInput
          id={'duration'}
          label={getCopy('Fade', 'fade_duration')}
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
      <Group align={'flex-end'} wrap={'nowrap'}>
        <TextInput
          flex={3}
          id={'guiname'}
          label={getCopy('Fade', 'component_name')}
          placeholder={'Name of Component'}
          value={guiName}
          onChange={(e) => setGuiName(e.currentTarget.value)}
        />
        <ToggleComponent label={'Lock Name'} value={lockName} setValue={setLockName} />
      </Group>
      <BackgroundHolder
        color={color}
        setColor={setColor}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
      />
      <Textarea
        id={'description'}
        label={getCopy('Fade', 'gui_description')}
        value={guiDescription}
        onChange={(e) => setGuiDescription(e.currentTarget.value)}
        placeholder={'Type your message here.'}
      />
    </Stack>
  );
}

export { FadeModal };
