import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Group,
  InputLabel,
  NumberInput,
  Stack,
  Textarea,
  TextInput
} from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import BackgroundHolder from '@/components/BackgroundHolder';
import ButtonLabel from '@/components/ButtonLabel';
import ComponentContainer from '@/components/ComponentContainer';
import { Information } from '@/components/Information';
import SelectableDropdown from '@/components/SelectableDropdown';
import StatusBar, { StatusBarRef } from '@/components/StatusBar';
import ToggleComponent from '@/components/Toggle';
import { useSubscribeToTime } from '@/hooks/topicSubscriptions';
import { AnchorIcon, ClockIcon } from '@/icons/icons';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors, SetNavComponent } from '@/types/components';
import { NavigationState } from '@/types/types';
import { getCopy } from '@/utils/copyHelpers';
import { formatDate } from '@/utils/time';
import { jumpToNavState } from '@/utils/triggerHelpers';

interface SetNavGUIComponentProps {
  component: SetNavComponent;
  shouldRender?: boolean;
}

function SetNavGUIComponent({ component, shouldRender = true }: SetNavGUIComponentProps) {
  const luaApi = useOpenSpaceApi();
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const {
    navigationState,
    intDuration,
    mode,
    time,
    setTime,
    gui_description,
    gui_name,
    backgroundImage,
    color
  } = component;

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          jumpToNavState(navigationState, setTime, mode, intDuration);
        },
        isDisabled: false
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [
    luaApi,
    updateComponent,
    component.id,
    navigationState,
    time,
    intDuration,
    mode,
    setTime
  ]);

  const fadeOutDuration = 400; // 1 second fade out
  const statusBarRef = useRef<StatusBarRef>(null);
  const triggerAnimation = () => {
    statusBarRef.current?.triggerAnimation();
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <ComponentContainer
      backgroundImage={backgroundImage}
      backgroundColor={color}
      onClick={() => {
        component.triggerAction?.();
        triggerAnimation();
      }}
    >
      {component.intDuration > 0 && (
        <StatusBar
          ref={statusBarRef}
          duration={component?.intDuration}
          fadeOutDuration={fadeOutDuration}
        />
      )}
      {gui_name || gui_description ? (
        <ButtonLabel>
          <Group gap={'xs'} wrap={'nowrap'}>
            {gui_name}
            <Information content={gui_description} />
          </Group>
        </ButtonLabel>
      ) : null}
    </ComponentContainer>
  );
}

interface SetNavModalProps {
  component: SetNavComponent | null;
  handleComponentData: (data: Partial<SetNavComponent>) => void;
}

function SetNavModal({ component, handleComponentData }: SetNavModalProps) {
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
        <ButtonLabel showBorder>{navigationState?.Anchor}</ButtonLabel>
      </Stack>
      <Group grow align={'flex-end'} wrap={'nowrap'}>
        <Stack gap={'xs'} style={{ opacity: setTime ? 1 : 0.5 }}>
          <InputLabel>
            <Group gap={4} wrap={'nowrap'}>
              <ClockIcon size={14} />
              {getCopy('SetNavigation', 'navigation_state_time')}
            </Group>
          </InputLabel>
          <ButtonLabel showBorder>{timeLabel as string}</ButtonLabel>
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
          <SelectableDropdown
            options={[
              { label: 'Jump', value: 'jump' },
              { label: 'Fade In/Out', value: 'fade' },
              { label: 'Fly', value: 'fly' }
            ]}
            selected={mode}
            setSelected={(value) => {
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
      <BackgroundHolder
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

export { SetNavGUIComponent, SetNavModal };
