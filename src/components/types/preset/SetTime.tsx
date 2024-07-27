import React, { useEffect, useMemo, useState, useRef } from 'react';
import Information from '@/components/common/Information';
import Toggle from '@/components/common/Toggle';
import DateComponent from '@/components/timepicker/DateComponent';
import {
  usePropertyStore,
  useOpenSpaceApiStore,
  ConnectionState,
  useComponentStore,
} from '@/store';
import { SetTimeComponent as SetTimeType } from '@/store';
import { formatDate, jumpToTime } from '@/utils/time';

import { Clock } from 'lucide-react';
import ImageUpload from '@/components/common/ImageUpload';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ButtonLabel from '@/components/common/ButtonLabel';
import StatusBar, { StatusBarRef } from '@/components/StatusBar';
interface SetTimeComponentProps {
  component: SetTimeType;
}

const SetTimeComponent: React.FC<SetTimeComponentProps> = ({ component }) => {
  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);

  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromTopic = usePropertyStore(
    (state) => state.unsubscribeFromTopic,
  );

  useEffect(() => {
    console.log('CONNETION STATE:', connectionState);
    if (connectionState != ConnectionState.CONNECTED) return;

    subscribeToTopic('time');
    return () => {
      unsubscribeFromTopic('time');
    };
  }, [connectionState]);

  const updateComponent = useComponentStore((state) => state.updateComponent);

  useEffect(() => {
    if (luaApi) {
      console.log('Registering trigger action');
      console.log(component.time);
      updateComponent(component.id, {
        triggerAction: () => {
          jumpToTime(
            component.time as Date,
            component.interpolate,
            component.intDuration,
            component.fadeScene,
          );
        },
      });
    }
  }, [
    component.time,
    component.interpolate,
    component.intDuration,
    component.fadeScene,
    luaApi,
  ]);

  // Fadetime is in seconds
  const fadeOutDuration = 400; // 1 second fade out
  const statusBarRef = useRef<StatusBarRef>(null);
  const triggerAnimation = () => {
    statusBarRef.current?.triggerAnimation();
  };

  return (
    <div
      className="absolute right-0 top-0 flex h-full w-full flex-col items-center justify-center hover:cursor-pointer"
      style={{
        //cover and center the background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url(${component.backgroundImage})`,
      }}
      onClick={() => {
        component.triggerAction?.();
        triggerAnimation();
      }}
    >
      {component?.intDuration && (
        <StatusBar
          ref={statusBarRef}
          duration={component?.intDuration}
          fadeOutDuration={fadeOutDuration}
        />
      )}
      <ButtonLabel>
        <Clock className="h-4 w-4" />
        {component.gui_name}
        <Information content={component.gui_description} />
      </ButtonLabel>
    </div>
  );
};

interface SetTimeModalProps {
  component: SetTimeType | null;
  handleComponentData: (data: Partial<SetTimeType>) => void;
  isOpen: boolean;
}

const SetTimeModal: React.FC<SetTimeModalProps> = ({
  component,
  handleComponentData,
  // isOpen,
}) => {
  const time = usePropertyStore(
    (state) => state.properties['time']?.['timeCapped'],
  );

  const [componentTime, setCompontentTime] = useState(component?.time || time);
  const [interpolate, setInterpolate] = useState(
    component?.interpolate || false,
  );
  const [intDuration, setIntDuration] = useState(component?.intDuration || 0);
  const [fadeScene, setFadeScene] = useState(component?.fadeScene || false); //
  const [gui_name, setGuiName] = useState(component?.gui_name); //
  const [gui_description, setGuiDescription] = useState(
    component?.gui_description,
  ); //
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || '',
  );
  const timeLabel = useMemo(() => {
    if (componentTime) {
      try {
        return formatDate(componentTime);
      } catch {
        return componentTime;
      }
    }
    return time;
  }, [componentTime]);

  useEffect(() => {
    if (timeLabel) {
      setGuiName(`Go to ${timeLabel}`);
    }
  }, [timeLabel]);

  useEffect(() => {
    handleComponentData({
      time: componentTime,
      interpolate,
      intDuration,
      fadeScene,
      gui_name,
      gui_description,
      backgroundImage,
    });
  }, [
    componentTime,
    interpolate,
    intDuration,
    handleComponentData,
    fadeScene,
    gui_name,
    gui_description,
    backgroundImage,
  ]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {time && (
          <DateComponent
            date={componentTime}
            onChange={(data: {
              time: Date | string;
              interpolate: boolean;
              delta: number;
              relative: boolean;
            }) => {
              console.log(data);
              setCompontentTime(data.time);
            }}
          />
        )}
        <Button
          onClick={() => {
            const newTime = new Date();
            console.log(newTime.toJSON());
            // try {
            // const fixedTimeString = newTime.toJSON().replace('Z', '');
            // setCompontentTime(new Date(fixedTimeString));
            // } catch {
            setCompontentTime(newTime);
            // }
          }}
        >
          Set Time To Now
        </Button>

        <div className="grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="guiname">Component Name</Label>
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
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="duration">Fade Duration</Label>
              <Input
                id="duration"
                placeholder="Duration to Fade"
                type="number"
                // className=""
                value={intDuration}
                onChange={(e) => setIntDuration(parseFloat(e.target.value))}
              />
            </div>
            <Toggle
              label="Interpolate"
              value={interpolate}
              setValue={setInterpolate}
            />
            <Toggle
              label="Fade Scene"
              value={fadeScene}
              setValue={setFadeScene}
            />
            {/* </diov> */}
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="description"> Background Image</Label>
              <ImageUpload
                value={backgroundImage}
                onChange={(v) => setBackgroundImage(v)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description"> Gui Description</Label>
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
    </>
  );
};

export { SetTimeModal, SetTimeComponent };
