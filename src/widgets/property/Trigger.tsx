import { useEffect, useState } from 'react';
import { Group, InputLabel, Stack, Textarea, TextInput } from '@mantine/core';
import { useShallow } from 'zustand/react/shallow';

import { useOpenSpaceApi } from '@/api/hooks';
import BackgroundHolder from '@/components/BackgroundHolder';
import ButtonLabel from '@/components/ButtonLabel';
import ComponentContainer from '@/components/ComponentContainer';
import { Information } from '@/components/Information';
import ToggleComponent from '@/components/Toggle';
import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { useProperty } from '@/hooks/properties';
import { TriggerComponent, usePropertyStore } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors } from '@/types/components';
import { formatName } from '@/utils/apiHelpers';
import { getCopy } from '@/utils/copyHelpers';
import { triggerTrigger } from '@/utils/triggerHelpers';

interface TriggerGUIProps {
  component: TriggerComponent;
  shouldRender?: boolean;
}

function TriggerGUIComponent({ component, shouldRender = true }: TriggerGUIProps) {
  const luaApi = useOpenSpaceApi();
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const [, , meta] = useProperty('TriggerProperty', component.property);

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          triggerTrigger(component.property);
        },
        isDisabled: meta === undefined
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [component.id, component.property, luaApi, meta, updateComponent]);

  if (!shouldRender) {
    return null;
  }

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => component.triggerAction?.()}
    >
      <ButtonLabel>
        <Group gap={'xs'} wrap={'nowrap'}>
          {component.gui_name}
          <Information content={component.gui_description} />
        </Group>
      </ButtonLabel>
    </ComponentContainer>
  );
}

interface TriggerModalProps {
  component: TriggerComponent | null;
  handleComponentData: (data: Partial<TriggerComponent>) => void;
}

function TriggerModal({ component, handleComponentData }: TriggerModalProps) {
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
      <Group align={'flex-end'} wrap={'nowrap'}>
        <TextInput
          flex={3}
          id={'guiname'}
          label={getCopy('Trigger', 'component_name')}
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
        label={getCopy('Trigger', 'gui_description')}
        value={gui_description}
        onChange={(e) => setGuiDescription(e.currentTarget.value)}
        placeholder={'Type your message here.'}
      />
    </Stack>
  );
}

export { TriggerGUIComponent, TriggerModal };
