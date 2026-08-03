import { useEffect, useState } from 'react';
import { Group, InputLabel, Stack, Textarea, TextInput } from '@mantine/core';

import BackgroundPicker from '@/components/BackgroundPicker';
import ToggleComponent from '@/components/Toggle';
import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { usePropertyStore } from '@/store';
import { ActionTriggerComponent, ComponentBaseColors } from '@/types/components';
import { Action } from '@/types/types';
import { getCopy } from '@/utils/copyHelpers';

interface Props {
  component: ActionTriggerComponent | null;
  handleComponentData: (data: Partial<ActionTriggerComponent>) => void;
}

function ActionTriggerModal({ component, handleComponentData }: Props) {
  const [action, setAction] = useState<string>(component?.action || '');
  const [guiName, setGuiName] = useState<string>(component?.gui_name || '');
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [guiDescription, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.action
  );

  const actions = usePropertyStore((state) => state.actions);

  const handleActionChange = (action: Action) => {
    setAction(action.Identifier);
    if (!lockName) {
      setGuiName(action.Name);
    }
    setGuiDescription(action.Documentation);
  };

  useEffect(() => {
    handleComponentData({
      action,
      backgroundImage,
      lockName,
      gui_name: guiName,
      gui_description: guiDescription,
      color
    });
  }, [
    action,
    backgroundImage,
    guiName,
    guiDescription,
    lockName,
    color,
    handleComponentData
  ]);

  return (
    <Stack gap={'md'}>
      <Stack gap={'xs'}>
        <InputLabel>{getCopy('Action', 'action')}</InputLabel>
        <VirtualizedCombobox
          options={Object.keys(actions)}
          selectOption={(v: string) => handleActionChange(actions[v])}
          selectedOption={
            Object.keys(actions).find((key) => actions[key].Identifier === action) || ''
          }
          searchPlaceholder={'Search the Actions...'}
          delimiter={'/'}
        />
      </Stack>
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
      <BackgroundPicker
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
        placeholder={'Type your description here.'}
      />
    </Stack>
  );
}

export { ActionTriggerModal };
