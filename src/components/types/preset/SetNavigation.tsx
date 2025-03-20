import { getCopy } from '@/utils/copyHelpers';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useOpenSpaceApiStore, usePropertyStore } from '@/store';
import { SetNavComponent } from '@/store/ComponentTypes';
import Toggle from '@/components/common/Toggle';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import ButtonLabel from '@/components/common/ButtonLabel';
import Information from '@/components/common/Information';
import { jumpToNavState } from '@/utils/triggerHelpers';
import { formatDate } from '@/utils/time';
import { Anchor, Clock } from 'lucide-react';
import ComponentContainer from '@/components/common/ComponentContainer';
import StatusBar, { StatusBarRef } from '@/components/StatusBar';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors } from '@/store/ComponentTypes';
import BackgroundHolder from '@/components/common/BackgroundHolder';
import SelectableDropdown from '@/components/common/SelectableDropdown';
interface SetNavModalProps {
  component: SetNavComponent | null;
  handleComponentData: (data: Partial<SetNavComponent>) => void;
  isOpen: boolean;
}
const SetNavModal: React.FC<SetNavModalProps> = ({
  component,
  handleComponentData,
  // isOpen,
}) => {
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const time = usePropertyStore((state) => state.time?.['timeCapped']);
  const [navigationState, setNavigationState] = useState<any>(
    component?.navigationState || {},
  );
  const [componentTime, setCompontentTime] = useState(component?.time || time);
  const [intDuration, setIntDuration] = useState(component?.intDuration || 1.0);
  // const [fadeScene, setFadeScene] = useState<boolean>(
  //   component?.fadeScene || true,
  // );
  const [mode, setMode] = useState<'jump' | 'fade' | 'fly'>(
    component?.mode || 'jump',
  );

  const [setTime, setSetTime] = useState<boolean>(component?.setTime || true);
  const [gui_name, setGuiName] = useState(component?.gui_name);
  const [gui_description, setGuiDescription] = useState(
    component?.gui_description,
  );
  const [lockName, setLockName] = useState<boolean>(
    component?.lockName || false,
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || '',
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.setnavstate,
  );

  useEffect(() => {
    if (!component?.navigationState) {
      getNavigationState();
    }
  }, [component?.navigationState]);

  const timeLabel = useMemo(() => {
    if (componentTime) {
      try {
        return formatDate(time);
      } catch {
        return componentTime;
      }
    }
    return componentTime;
  }, [componentTime]);
  useEffect(() => {
    if (component) {
      // setFadeScene(component.fadeScene);
      setSetTime(component.setTime);
    }
  }, [component]);
  // Mars
  useEffect(() => {
    handleComponentData({
      time: componentTime,
      mode,
      setTime,
      lockName,
      gui_name,
      gui_description,
      backgroundImage,
      navigationState,
      intDuration,
      color,
    });
  }, [
    navigationState,
    componentTime,
    mode,
    setTime,
    lockName,
    gui_name,
    gui_description,
    backgroundImage,
    intDuration,
    color,
    handleComponentData,
  ]);

  const getNavigationState = async () => {
    if (!luaApi) return;
    const navState = await luaApi.navigation.getNavigationState();
    setNavigationState(navState['1']);
    setCompontentTime(time);
    if (!lockName) {
      setGuiName(
        `${
          mode.charAt(0).toUpperCase() + mode.slice(1)
        } to Navigation State : ${navState['1'].Anchor}`,
      );
    }
  };
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-4">
        <Button onClick={getNavigationState}>
          {getCopy('SetNavigation', 'save_current_navigation_state')}
        </Button>
        <div className={`grid  gap-2 opacity-100`}>
          <Label className="flex items-center justify-start gap-2">
            <Anchor size={14} />
            Navigation State Anchor
          </Label>
          <ButtonLabel className="border bg-transparent">
            {navigationState.Anchor}
          </ButtonLabel>
        </div>
        {/* 
        <div className={`grid  gap-2 opacity-100`}>
          <Label className="flex items-center justify-start gap-2">
            <Anchor size={14} />
            Navigation State Position
          </Label>
          <ButtonLabel className="border bg-transparent">
            {navigationState.Position.map((p: number) => p.toFixed(1)).join(
              ', ',
            )}
          </ButtonLabel>
        </div> */}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div
          className={`grid  gap-2 ${setTime ? 'opacity-100' : 'opacity-50'}`}
        >
          <Label className="flex items-center justify-start gap-2">
            <Clock size={14} />
            {getCopy('SetNavigation', 'navigation_state_time')}
          </Label>
          <ButtonLabel className="border bg-transparent">
            {timeLabel}
          </ButtonLabel>
        </div>
        <div className="grid gap-2">
          <Label />
          <Toggle label="Include Time" value={setTime} setValue={setSetTime} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-4 gap-4">
          <div
            className={`grid gap-2 ${
              mode != 'jump' ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <Label htmlFor="duration">
              {getCopy('SetNavigation', 'fade_duration')}
            </Label>
            <Input
              id="duration"
              disabled={mode == 'jump'}
              placeholder="Duration to Fade"
              type="number"
              value={intDuration}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setIntDuration(parseFloat(e.target.value))
              }
            />
          </div>
          <div className="col-start-3 grid gap-2 ">
            <Label>{getCopy('SetNavigation', 'transition_mode')}</Label>
            <SelectableDropdown
              options={[
                { label: 'Jump', value: 'jump' },
                { label: 'Fade In/Out', value: 'fade' },
                { label: 'Fly', value: 'fly' },
              ]}
              selected={mode}
              setSelected={(value) => {
                if (!lockName) {
                  setGuiName(
                    `${
                      value.charAt(0).toUpperCase() + value.slice(1)
                    } to Navigation State : ${navigationState.Anchor}`,
                  );
                }
                setMode(value as 'jump' | 'fade' | 'fly');
              }}
            />
          </div>
        </div>
        {/* <div className="grid grid-cols-4 "> */}
        <div className="grid grid-cols-4 ">
          <div className="col-span-4 grid grid-cols-3 gap-4">
            <div className="col-span-2 grid gap-2">
              <Label htmlFor="gioname">
                {getCopy('Fade', 'component_name')}
              </Label>
              <Input
                id="guiname"
                placeholder="Name of Component"
                type="text"
                value={gui_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setGuiName(e.target.value)
                }
              />
            </div>
            <div className="col-span-1 mt-6 grid gap-2">
              <Toggle
                label="Lock Name"
                value={lockName}
                setValue={setLockName}
              />
            </div>
          </div>
        </div>
        {/* </div> */}
        {/* <div className="grid gap-2">
          <Label htmlFor="guiname">
            {getCopy('SetNavigation', 'component_name')}
          </Label>
          <Input
            id="guiname"
            placeholder="Name of Component"
            type="text"
            value={gui_name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setGuiName(e.target.value)
            }
          />
        </div> */}
        <div className="grid grid-cols-1 gap-4">
          <BackgroundHolder
            color={color}
            setColor={setColor}
            backgroundImage={backgroundImage}
            setBackgroundImage={setBackgroundImage}
          />
          <div className="grid gap-2">
            <Label htmlFor="description">
              {getCopy('SetNavigation', 'gui_description')}
            </Label>
            <Textarea
              className="w-full"
              id="description"
              value={gui_description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setGuiDescription(e.target.value)
              }
              placeholder="Type your message here."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
interface SetNavGUIComponentProps {
  component: SetNavComponent;
  shouldRender?: boolean;
}
const SetNavGUIComponent: React.FC<SetNavGUIComponentProps> = ({
  component,
  shouldRender = true,
}) => {
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
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
    color,
  } = component;

  useEffect(() => {
    if (luaApi) {
      //   console.log('Registering trigger action');
      updateComponent(component.id, {
        triggerAction: () => {
          jumpToNavState(
            navigationState,
            setTime,
            // new Date(time),
            mode,
            intDuration,
          );
        },
        isDisabled: false,
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true,
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
    setTime,
  ]);
  const fadeOutDuration = 400; // 1 second fade out
  const statusBarRef = useRef<StatusBarRef>(null);
  const triggerAnimation = () => {
    statusBarRef.current?.triggerAnimation();
  };

  return shouldRender ? (
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
      {/* <div className="flex flex-col gap-2"> */}
      {gui_name || gui_description ? (
        <ButtonLabel>
          {gui_name}
          <Information content={gui_description} />
        </ButtonLabel>
      ) : null}
      {/* </div> */}
    </ComponentContainer>
  ) : null;
};
export { SetNavModal, SetNavGUIComponent };
