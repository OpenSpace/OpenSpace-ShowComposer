import { useEffect, useState } from 'react';
import { Group, InputLabel, Stack, Textarea, TextInput } from '@mantine/core';
import { capitalize } from 'lodash';
import { useShallow } from 'zustand/react/shallow';

import { useOpenSpaceApi } from '@/api/hooks';
import BackgroundHolder from '@/components/BackgroundHolder';
import ComponentContainer from '@/components/ComponentContainer';
import DisplayLabel from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import SelectableDropdown from '@/components/SelectableDropdown';
import ToggleComponent from '@/components/Toggle';
import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { useProperty } from '@/hooks/properties';
import { BooleanComponent, Toggle, usePropertyStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors } from '@/types/components';
import { formatName } from '@/utils/apiHelpers';
import { getCopy } from '@/utils/copyHelpers';
import { triggerBool } from '@/utils/triggerHelpers';

interface BoolGUIProps {
  component: BooleanComponent;
  shouldRender?: boolean;
}

function BoolGUIComponent({ component, shouldRender = true }: BoolGUIProps) {
  const luaApi = useOpenSpaceApi();
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const [value] = useProperty('BoolProperty', component.property);

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          triggerBool(component.property, component.action);
        },
        isDisabled: value === undefined
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [
    component.id,
    component.action,
    component.property,
    value,
    luaApi,
    updateComponent
  ]);

  if (!shouldRender) {
    return null;
  }

  // Reflect the property state on the card outline: on (green), off (red),
  // unknown/disconnected (grey)
  const outlineColor =
    value === true
      ? 'var(--mantine-color-green-6)'
      : value === false
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
      <DisplayLabel>
        {component.gui_name}
        <Information content={component.gui_description} />
      </DisplayLabel>
    </ComponentContainer>
  );
}

interface BoolModalProps {
  component: BooleanComponent | null;
  handleComponentData: (data: Partial<BooleanComponent>) => void;
}

function BoolModal({ component, handleComponentData }: BoolModalProps) {
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
        <InputLabel>{getCopy('Boolean', 'property')}</InputLabel>
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
        <InputLabel>{getCopy('Boolean', 'action_type')}</InputLabel>
        <SelectableDropdown
          options={['toggle', 'on', 'off']}
          selected={action}
          setSelected={setAction}
        />
      </Stack>
      <Group align={'flex-end'} wrap={'nowrap'}>
        <TextInput
          flex={3}
          id={'guiname'}
          label={getCopy('Boolean', 'component_name')}
          placeholder={'Name of Component'}
          value={gui_name}
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
        label={getCopy('Boolean', 'gui_description')}
        value={gui_description}
        onChange={(e) => setGuiDescription(e.currentTarget.value)}
        placeholder={'Type your message here.'}
      />
    </Stack>
  );
}

export { BoolGUIComponent, BoolModal };
