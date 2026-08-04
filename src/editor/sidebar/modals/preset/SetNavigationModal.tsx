import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Group,
  InputLabel,
  NumberInput,
  Select,
  Stack,
  Textarea,
  TextInput
} from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import BackgroundPicker from '@/components/BackgroundPicker';
import DisplayLabel from '@/components/DisplayLabel';
import ToggleComponent from '@/components/Toggle';
import { useSubscribeToTime } from '@/hooks/topicSubscriptions';
import { AnchorIcon, ClockIcon } from '@/icons/icons';
import { ComponentBaseColors, SetNavComponent } from '@/types/components';
import { NavigationState } from '@/types/types';
import { getCopy } from '@/utils/copyHelpers';
import { formatDate } from '@/utils/time';

interface Props {
  component: SetNavComponent | null;
  handleComponentData: (data: Partial<SetNavComponent>) => void;
}

function SetNavModal({ component, handleComponentData }: Props) {
  const luaApi = useOpenSpaceApi();
  const { timeCapped: time } = useSubscribeToTime();
  const [navigationState, setNavigationState] = useState<NavigationState | undefined>(
    component?.navigationState
  );
  const [componentTime, setCompontentTime] = useState(component?.time || time);
  const [intDuration, setIntDuration] = useState(component?.intDuration || 1.0);
  const [mode, setMode] = useState<'jump' | 'fade' | 'fly'>(component?.mode || 'jump');
  const [setTime, setSetTime] = useState<boolean>(component?.setTime || true);
  const [guiName, setGuiName] = useState(component?.gui_name);
  const [guiDescription, setGuiDescription] = useState(component?.gui_description);
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.setnavstate
  );

  const getNavigationState = async () => {
    if (!luaApi) return;
    const navState = (await luaApi.navigation.getNavigationState()) as NavigationState;

    setNavigationState(navState);
    setCompontentTime(time);
    if (!lockName) {
      setGuiName(
        `${mode.charAt(0).toUpperCase() + mode.slice(1)} to Navigation State : ${
          navState.Anchor
        }`
      );
    }
  };

  useEffect(() => {
    if (!component?.navigationState) {
      getNavigationState();
    }
  }, [component?.navigationState]);

  const timeLabel = useMemo(() => {
    if (componentTime) {
      try {
        return formatDate(new Date(time || ''));
      } catch {
        return componentTime;
      }
    }
    return componentTime;
  }, [componentTime, time]);

  useEffect(() => {
    if (component) {
      setSetTime(component.setTime);
    }
  }, [component]);

  useEffect(() => {
    handleComponentData({
      time: componentTime,
      mode,
      setTime,
      lockName,
      gui_name: guiName,
      gui_description: guiDescription,
      backgroundImage,
      navigationState,
      intDuration,
      color
    });
  }, [
    navigationState,
    componentTime,
    mode,
    setTime,
    lockName,
    guiName,
    guiDescription,
    backgroundImage,
    intDuration,
    color,
    handleComponentData
  ]);

  return (
    <Stack gap={'md'}>
      <Button variant={'filled'} onClick={getNavigationState}>
        {getCopy('SetNavigation', 'save_current_navigation_state')}
      </Button>
      <Stack gap={'xs'}>
        <InputLabel>
          <Group gap={4} wrap={'nowrap'}>
            <AnchorIcon size={14} />
            Navigation State Anchor
          </Group>
        </InputLabel>
        <DisplayLabel showBorder>{navigationState?.Anchor}</DisplayLabel>
      </Stack>
      <Group grow align={'flex-end'} wrap={'nowrap'}>
        <Stack gap={'xs'} style={{ opacity: setTime ? 1 : 0.5 }}>
          <InputLabel>
            <Group gap={4} wrap={'nowrap'}>
              <ClockIcon size={14} />
              {getCopy('SetNavigation', 'navigation_state_time')}
            </Group>
          </InputLabel>
          <DisplayLabel showBorder>{timeLabel as string}</DisplayLabel>
        </Stack>
        <ToggleComponent label={'Include Time'} value={setTime} setValue={setSetTime} />
      </Group>
      <Group align={'flex-end'} wrap={'nowrap'}>
        <NumberInput
          flex={1}
          id={'duration'}
          label={getCopy('SetNavigation', 'fade_duration')}
          disabled={mode === 'jump'}
          style={{ opacity: mode !== 'jump' ? 1 : 0.5 }}
          placeholder={'Duration to Fade'}
          value={intDuration}
          onChange={(value) =>
            setIntDuration(typeof value === 'number' ? value : parseFloat(value))
          }
        />
        <Stack flex={1} gap={'xs'}>
          <InputLabel>{getCopy('SetNavigation', 'transition_mode')}</InputLabel>
          <Select
            allowDeselect={false}
            data={[
              { label: 'Jump', value: 'jump' },
              { label: 'Fade In/Out', value: 'fade' },
              { label: 'Fly', value: 'fly' }
            ]}
            placeholder={'Select an option'}
            value={mode}
            onChange={(value) => {
              if (value === null) {
                return;
              }
              if (!lockName) {
                setGuiName(
                  `${
                    value.charAt(0).toUpperCase() + value.slice(1)
                  } to Navigation State : ${navigationState?.Anchor}`
                );
              }
              setMode(value as 'jump' | 'fade' | 'fly');
            }}
          />
        </Stack>
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
      <BackgroundPicker
        color={color}
        setColor={setColor}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
      />
      <Textarea
        id={'description'}
        label={getCopy('SetNavigation', 'gui_description')}
        value={guiDescription}
        onChange={(e) => setGuiDescription(e.currentTarget.value)}
        placeholder={'Type your message here.'}
      />
    </Stack>
  );
}

export { SetNavModal };
