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

import { useOpenSpaceApi } from '@/api/hooks';
import BackgroundHolder from '@/components/BackgroundHolder';
import ButtonLabel from '@/components/ButtonLabel';
import ComponentContainer from '@/components/ComponentContainer';
import { Information } from '@/components/Information';
import SelectableDropdown from '@/components/SelectableDropdown';
import StatusBarControlled from '@/components/StatusBarControlled';
import ToggleComponent from '@/components/Toggle';
import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { useProperty } from '@/hooks/properties';
import { FadeComponent, Toggle, usePropertyStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors } from '@/types/components';
import { formatName } from '@/utils/apiHelpers';
import { getCopy } from '@/utils/copyHelpers';
import { triggerFade } from '@/utils/triggerHelpers';

interface FadeGUIProps {
  component: FadeComponent;
  shouldRender?: boolean;
}

function FadeGUIComponent({ component, shouldRender = true }: FadeGUIProps) {
  const luaApi = useOpenSpaceApi();
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const [opacity] = useProperty('FloatProperty', component.property);
  const [fadeValue] = useProperty(
    'FloatProperty',
    component?.property?.replace('.Opacity', '.Fade') ?? ''
  );

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          triggerFade(component.property, component.intDuration, component.action);
        },
        isDisabled: opacity === undefined
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [
    component.id,
    component.action,
    component.intDuration,
    component.property,
    opacity,
    luaApi
  ]);

  if (!shouldRender) {
    return null;
  }

  // Reflect the value of fade on the card outline: faded in (green),
  // faded out (red), transitioning/disconnected (grey)
  const outlineColor =
    fadeValue === 1
      ? 'var(--mantine-color-green-6)'
      : fadeValue === 0
        ? 'var(--mantine-color-red-6)'
        : 'var(--mantine-color-gray-5)';

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      style={{
        top: '4px',
        left: '4px',
        width: 'calc(100% - 8px)', // Adjust width to account for outline width and offset
        height: 'calc(100% - 8px)', // Adjust height to account for outline width and offset
        outline: `4px solid ${outlineColor}`,
        outlineOffset: '2px',
        transition: 'outline-color 300ms'
      }}
      onClick={() => {
        component.triggerAction?.();
      }}
    >
      {fadeValue !== undefined ? (
        <StatusBarControlled progress={fadeValue} debounceDuration={0} />
      ) : null}
      {component.gui_name || component.gui_description ? (
        <ButtonLabel>
          <Group gap={'xs'} wrap={'nowrap'}>
            {component.gui_name}
            <Information content={component.gui_description} />
          </Group>
        </ButtonLabel>
      ) : null}
    </ComponentContainer>
  );
}

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

export { FadeGUIComponent, FadeModal };
