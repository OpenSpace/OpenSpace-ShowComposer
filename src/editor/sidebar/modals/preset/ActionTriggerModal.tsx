import { useEffect, useState } from 'react';
import { InputLabel, Stack } from '@mantine/core';

import { VirtualizedCombobox } from '@/components/VirtualizedCombobox';
import { WidgetSettings } from '@/components/WidgetSettings';
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

export { ActionTriggerModal };
