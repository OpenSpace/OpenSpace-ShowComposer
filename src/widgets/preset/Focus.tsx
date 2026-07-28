import { useEffect, useState } from 'react';
import { Group, InputLabel, Stack, Textarea, TextInput } from '@mantine/core';
import { useShallow } from 'zustand/react/shallow';

import { useOpenSpaceApi } from '@/api/hooks';
import BackgroundHolder from '@/components/BackgroundHolder';
import ComponentContainer from '@/components/ComponentContainer';
import DisplayLabel from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import ToggleComponent from '@/components/Toggle';
import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { useProperty, useSubscribeToProperty } from '@/hooks/properties';
import { usePropertyStore } from '@/store';
import {
  NavigationAimKey,
  NavigationAnchorKey,
  RetargetAnchorKey
} from '@/store/apiStore';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors, SetFocusComponent } from '@/types/components';
import { formatName, getStringBetween } from '@/utils/apiHelpers';
import { getCopy } from '@/utils/copyHelpers';

interface FocusGUIProps {
  component: SetFocusComponent;
  shouldRender?: boolean;
}

function FocusComponent({ component, shouldRender = true }: FocusGUIProps) {
  const luaApi = useOpenSpaceApi();
  const updateComponent = useBoundStore((state) => state.updateComponent);
  // Reading Renderable.Enabled lets us check whether the scene node exists.
  const [enabledValue] = useProperty(
    'BoolProperty',
    `Scene.${component.property}.Renderable.Enabled`
  );

  useSubscribeToProperty(NavigationAnchorKey);

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          luaApi.setPropertyValueSingle(RetargetAnchorKey, null);
          luaApi.setPropertyValueSingle(NavigationAnchorKey, component.property);
          luaApi.setPropertyValueSingle(NavigationAimKey, '');
        },
        isDisabled: enabledValue === undefined
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [component.id, component.property, luaApi, enabledValue]);

  if (!shouldRender) {
    return null;
  }

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => {
        component.triggerAction?.();
      }}
    >
      {component.gui_name || component.gui_description ? (
        <DisplayLabel>
          {component.gui_name}
          <Information content={component.gui_description} />
        </DisplayLabel>
      ) : null}
    </ComponentContainer>
  );
}

interface FocusModalProps {
  component: SetFocusComponent | null;
  handleComponentData: (data: Partial<SetFocusComponent>) => void;
}

function FocusModal({ component, handleComponentData }: FocusModalProps) {
  const properties = usePropertyStore(useShallow((state) => state.properties));
  const [property, setProperty] = useState<string>(component?.property || '');
  const [guiName, setGuiName] = useState<string>(component?.gui_name || '');
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [guiDescription, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.setfocus
  );

  const [, , currentAnchorMeta] = useProperty('StringProperty', NavigationAnchorKey);

  const handlePropertyChange = (property: string) => {
    setProperty(property);
    if (!lockName) {
      setGuiName(`Focus on ${property}`);
      setGuiDescription(`Focus on ${property}. ${currentAnchorMeta?.description}`);
    }
  };

  useEffect(() => {
    handleComponentData({
      property,
      backgroundImage,
      lockName,
      gui_name: guiName,
      gui_description: guiDescription,
      color
    });
  }, [
    property,
    backgroundImage,
    guiName,
    guiDescription,
    lockName,
    color,
    handleComponentData
  ]);

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

  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>{getCopy('Focus', 'property')}</InputLabel>
        <VirtualizedCombobox
          options={Object.keys(sortedKeys)}
          selectOption={(v: string) => handlePropertyChange(sortedKeys[v])}
          selectedOption={
            (Object.keys(sortedKeys).find((key) => key === property) as string) || ''
          }
          searchPlaceholder={'Search the Scene...'}
        />
      </Stack>
      <Group align={'flex-end'} wrap={'nowrap'}>
        <TextInput
          flex={3}
          id={'guiname'}
          label={getCopy('Focus', 'component_name')}
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
        label={getCopy('Focus', 'gui_description')}
        value={guiDescription}
        onChange={(e) => setGuiDescription(e.currentTarget.value)}
        placeholder={'Type your message here.'}
      />
    </Stack>
  );
}

export { FocusComponent, FocusModal };
