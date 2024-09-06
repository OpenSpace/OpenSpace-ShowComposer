import ImageUpload from '@/components/common/ImageUpload';
import { getCopy } from '@/utils/copyHelpers';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useComponentStore,
  useOpenSpaceApiStore,
  usePropertyStore,
} from '@/store';
import { SetNavComponent } from '@/store/componentsStore';
import Toggle from '@/components/common/Toggle';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import ButtonLabel from '@/components/common/ButtonLabel';
import Information from '@/components/common/Information';
import { jumpToNavState } from '@/utils/triggerHelpers';
import { formatDate } from '@/utils/time';
import { Clock } from 'lucide-react';
import ComponentContainer from '@/components/common/ComponentContainer';
import StatusBar, { StatusBarRef } from '@/components/StatusBar';

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
  const [fadeScene, setFadeScene] = useState<boolean>(
    component?.fadeScene || true,
  );
  const [setTime, setSetTime] = useState<boolean>(component?.setTime || true);
  const [gui_name, setGuiName] = useState(component?.gui_name);
  const [gui_description, setGuiDescription] = useState(
    component?.gui_description,
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || '',
  );
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
      setFadeScene(component.fadeScene);
      setSetTime(component.setTime);
    }
    // console.log(component);
    // console.log(setTime);
    // console.log(fadeScene);
  }, [component]);
  useEffect(() => {
    handleComponentData({
      time: componentTime,
      fadeScene,
      setTime,
      gui_name,
      gui_description,
      backgroundImage,
      navigationState,
      intDuration,
    });
  }, [
    navigationState,
    componentTime,
    fadeScene,
    setTime,
    gui_name,
    gui_description,
    backgroundImage,
    intDuration,
    handleComponentData,
  ]);
  //     const connectionState = useOpenSpaceApiStore(
  //       (state) => state.connectionState,
  //     );
  //     const updateComponent = useComponentStore((state) => state.updateComponent);
  //     const subscribeToProperty = usePropertyStore(
  //       (state) => state.subscribeToProperty,
  //     );
  //     const unsubscribeFromProperty = usePropertyStore(
  //       (state) => state.unsubscribeFromProperty,
  //     );

  //   useEffect(() => {
  //       if (connectionState !== ConnectionState.CONNECTED) return;
  //       console.log('Subscribing to property', component.property);
  //       subscribeToProperty(component.property, 500);
  //       return () => {
  //           unsubscribeFromProperty(component.property);
  //       };
  //   }, [
  //       component.property,
  //       connectionState,
  //       subscribeToProperty,
  //       unsubscribeFromProperty,
  //   ]);

  const getNavigationState = async () => {
    if (!luaApi) return;
    const navState = await luaApi.navigation.getNavigationState();
    setNavigationState(navState['1']);
    setCompontentTime(time);
  };
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={getNavigationState}>
          {getCopy('SetNavigation', 'save_current_navigation_state')}
        </Button>
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
            className={`grid gap-2 ${fadeScene ? 'opacity-100' : 'opacity-50'}`}
          >
            <Label htmlFor="duration">
              {getCopy('SetNavigation', 'fade_duration')}
            </Label>
            <Input
              id="duration"
              disabled={!fadeScene}
              placeholder="Duration to Fade"
              type="number"
              value={intDuration}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setIntDuration(parseFloat(e.target.value))
              }
            />
          </div>
          <div className="col-start-3 grid gap-2 ">
            <Label />
            <Toggle
              label="Fade Scene"
              value={fadeScene}
              setValue={setFadeScene}
            />
          </div>
        </div>
        <div className="grid gap-2">
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
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="description">
              {getCopy('SetNavigation', 'background_image')}
            </Label>
            <ImageUpload
              value={backgroundImage}
              onChange={(v) => setBackgroundImage(v)}
            />
          </div>
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
  const updateComponent = useComponentStore((state) => state.updateComponent);
  const {
    navigationState,
    intDuration,
    fadeScene,
    time,
    setTime,
    gui_description,
    gui_name,
    backgroundImage,
  } = component;
  useEffect(() => {
    if (luaApi) {
      //   console.log('Registering trigger action');
      updateComponent(component.id, {
        triggerAction: () => {
          jumpToNavState(
            navigationState,
            setTime,
            new Date(time),
            fadeScene,
            intDuration,
          );
        },
      });
    }
  }, [
    luaApi,
    updateComponent,
    component.id,
    navigationState,
    time,
    intDuration,
    fadeScene,
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
      <div className="flex flex-col gap-2">
        <ButtonLabel>
          {gui_name}
          <Information content={gui_description} />
        </ButtonLabel>
      </div>
    </ComponentContainer>
  ) : null;
};
export { SetNavModal, SetNavGUIComponent };
